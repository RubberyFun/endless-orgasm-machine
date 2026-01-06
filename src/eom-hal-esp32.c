#include <stddef.h>
#include <stdint.h>
//#include "config.h"
#include "eom-hal-esp32.h"
#include "hal/adc_types.h"
#include "esp_adc/adc_oneshot.h"
//#include "driver/adc_oneshot.h"
#include "driver/dac_oneshot.h"
#include "driver/gpio.h"
#include "config.h"
#include "esp_log.h"
#include "led_strip.h"
#include "esp_timer.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#if PRESSURE_SENSOR == PRESSURE_SENSOR_I2C
    #include "driver/i2c_master.h"
    #if PRESSURE_SENSOR_HARDWARE == PRESSURE_SENSOR_HARDWARE_MPR
        #include "components/mpr_pressure_sensor.h"
    #endif
#elif PRESSURE_SENSOR == PRESSURE_SENSOR_SPI
    // #include "driver/spi_master.h"
    #include "hx711.h"
    hx711_t dev =
    {
        .dout = PRESSURE_SDA,
        .pd_sck = PRESSURE_SCK,
        .gain = HX711_GAIN_A_128
    };
#else
    //analog

#endif
static const char* TAG = "HAL";

adc_oneshot_unit_handle_t adc_handle;
adc_oneshot_unit_init_cfg_t adc_init_cfg = {
    .unit_id = ADC_UNIT,
    .ulp_mode = ADC_ULP_MODE_DISABLE,
};
i2c_master_dev_handle_t dev_handle;

uint8_t pressure_ambient = DEFAULT_AMBIENT_PRESSURE;  //is this necessary?
RGBColor led_color = {0, 0, 0};
RGBColor rgb_off = {0, 0, 0};
RGBColor rgb_white = {255, 255, 255};
RGBColor rgb_red = {255, 0, 0};
RGBColor rgb_green = {0, 255, 0};
RGBColor rgb_blue = {0, 0, 255};
RGBColor rgb_orange = {255, 130, 0}; //255, 185, 59
RGBColor rgb_yellow = {255, 230, 0}; //255,240,133
RGBColor rgb_purple = {80, 0, 150}; // 179, 0, 255

led_strip_handle_t led_strip = NULL;
uint8_t is_flashing = 0;
uint8_t flash_on = 0;
unsigned long last_flash = 0;
uint16_t flash_interval = 250;

#define MOTOR1_PIN DAC_CHANNEL_0  //revisit when converting to pwm
#define MOTOR2_PIN DAC_CHANNEL_1
#if SOC_DAC_SUPPORTED
    dac_oneshot_handle_t dac1_handle;
    dac_oneshot_handle_t dac2_handle;
    dac_oneshot_config_t dac1_cfg = {
        .chan_id = DAC_CHAN_0,  //motor 1
    };
    dac_oneshot_config_t dac2_cfg = {
        .chan_id = DAC_CHAN_1,  //motor 2
    };
#endif


void eom_hal_init_pressure_sensor(void) {
    if (PRESSURE_SENSOR == PRESSURE_SENSOR_ANALOG) {

        gpio_reset_pin(PRESSURE_GPIO);

        adc_atten_t esp_sensitivity = Config.sensor_sensitivity >= 75 ? ADC_ATTEN_DB_0 
                                    : (Config.sensor_sensitivity >= 50 ? ADC_ATTEN_DB_2_5 
                                    : (Config.sensor_sensitivity >= 25 ? ADC_ATTEN_DB_6 
                                    : ADC_ATTEN_DB_12));
        adc_oneshot_chan_cfg_t adcCfg = {
            .bitwidth = ADC_BITWIDTH_12,
            .atten = esp_sensitivity,
        };

        adc_oneshot_new_unit(&adc_init_cfg, &adc_handle);
        ESP_ERROR_CHECK(adc_oneshot_config_channel(adc_handle, PRESSURE_GPIO, &adcCfg));

        eom_hal_setup_pressure_ambient();

    } else if (PRESSURE_SENSOR == PRESSURE_SENSOR_I2C) {

        // Reset GPIO pins to ensure clean state before I2C initialization
        gpio_reset_pin(PRESSURE_SDA);
        gpio_reset_pin(PRESSURE_SCK);

        i2c_master_bus_config_t i2c_mst_config = {
            .clk_source = I2C_CLK_SRC_DEFAULT,
            .i2c_port = I2C_NUM_0,
            .scl_io_num = PRESSURE_SCK,
            .sda_io_num = PRESSURE_SDA,
            .glitch_ignore_cnt = 7,
            .flags.enable_internal_pullup = true,
        };
        
        i2c_master_bus_handle_t bus_handle;
        ESP_ERROR_CHECK(i2c_new_master_bus(&i2c_mst_config, &bus_handle));
        
        ESP_LOGI(TAG, "I2C master bus initialized on SDA:%d SCL:%d", PRESSURE_SDA, PRESSURE_SCK);
        
        // Scan I2C bus to verify sensor is present
        mpr_scan_i2c_bus(bus_handle);
        
        i2c_device_config_t dev_cfg;
        mpr_dev_config(&dev_cfg);  //not going to bother with device selection yet, just MPR for now

        ESP_ERROR_CHECK(i2c_master_bus_add_device(bus_handle, &dev_cfg, &dev_handle));

    } else if (PRESSURE_SENSOR == PRESSURE_SENSOR_SPI) {
        //SPI support eventually?
    }
}


uint16_t eom_hal_get_pressure_reading(void) {
    if (PRESSURE_SENSOR == PRESSURE_SENSOR_ANALOG) {

        int raw = 0;
        
        adc_oneshot_read(adc_handle, PRESSURE_GPIO, &raw);  
        
        int adjusted = raw - pressure_ambient;
        if (adjusted < 0) {
            adjusted = 0;
            eom_hal_setup_pressure_ambient();
        }
        
        //adjusted *= pressure_sensitivity;  //if we go the software multiplier route
        if (adjusted > EOM_HAL_PRESSURE_MAX) adjusted = EOM_HAL_PRESSURE_MAX;
        return (uint16_t)adjusted;

    } else if (PRESSURE_SENSOR == PRESSURE_SENSOR_I2C) {     
        int32_t data = 0;
        esp_err_t r = 0;

        r = mpr_read_pressure(dev_handle, &data);

        if (r != ESP_OK)
        {
            ESP_LOGE(TAG, "Could not read data: %d (%s)\n", r, esp_err_to_name(r));
            return 0;
        }

        int32_t adjusted = data - pressure_ambient;
        if (adjusted < 0) {
            adjusted = 0;
        }
        
        //MPR range 24 bit (0xFFFFFF)...EOM logic expects 12 bit
        uint16_t scaled = (uint16_t)(adjusted >> 12);
        scaled = (scaled * (Config.sensor_sensitivity / 100.0 * PRESSURE_MULTIPLIER));
        if (scaled > EOM_HAL_PRESSURE_MAX) scaled = EOM_HAL_PRESSURE_MAX;
        ESP_LOGI(TAG, "12bit: %d Raw data: %" PRIi32, scaled, data);
        return scaled;


    } else {
        // HX711 isnt technically I2C or SPI but....
        // hx711_read_average(&dev, 10, &data);
        //r = hx711_read(&dev, &data);

        // if (r != ESP_OK)
        // {
        //     ESP_LOGE(TAG, "Could not read data: %d (%s)\n", r, esp_err_to_name(r));
        //     return 0;
        // }
        // HX711 returns signed 24-bit value, adjust for ambient and scale to 12-bit range
        // int32_t adjusted = data - pressure_ambient;
        // if (adjusted < 0) {
        //     adjusted = 0;
        // }
        
        // Scale from HX711 range to our 12-bit range
        // Assuming typical HX711 range of ±8388607 (0x7FFFFF)
        // int32_t adjusted = (adjusted * EOM_HAL_PRESSURE_MAX) / 8388607;
        
        // if (adjusted > EOM_HAL_PRESSURE_MAX) adjusted = EOM_HAL_PRESSURE_MAX;
        
        // ESP_LOGE(TAG, "12bit: %d Raw data: %" PRIi32, adjusted, data);
        // return (uint16_t)adjusted;
    }
    return 0;
}

uint8_t eom_hal_get_sensor_sensitivity(void) {
    return Config.sensor_sensitivity; 
}

void eom_hal_setup_pressure_ambient(void) {
    uint16_t readings[10];
    uint32_t sum = 0;
        
    for (int i = 0; i < 10; i++) {
        readings[i] = eom_hal_get_pressure_reading();
        sum += readings[i];
        
        //vTaskDelay(10);  // Small delay between readings?
    }
    pressure_ambient = sum / 10;
}

void eom_hal_set_sensor_sensitivity(uint8_t sensitivity) {
    if (PRESSURE_SENSOR == PRESSURE_SENSOR_ANALOG) {
        if (adc_handle == NULL) return; //not initialized yet
        
        adc_atten_t esp_sensitivity = sensitivity >= 75 ? ADC_ATTEN_DB_0 
                                    : (sensitivity >= 50 ? ADC_ATTEN_DB_2_5 
                                    : (sensitivity >= 25 ? ADC_ATTEN_DB_6 
                                    : ADC_ATTEN_DB_12));
        adc_oneshot_chan_cfg_t adcCfg = {
            .bitwidth = ADC_BITWIDTH_12,
            .atten = esp_sensitivity,
        };
        ESP_ERROR_CHECK(adc_oneshot_config_channel(adc_handle, PRESSURE_GPIO, &adcCfg));
    } else {
        Config.sensor_sensitivity = sensitivity;
    };

}

//=== Vibration
void eom_hal_set_motor1_speed(uint8_t speed) {
#if SOC_DAC_SUPPORTED
    dac_oneshot_output_voltage(dac1_handle, speed);
#else
    // No DAC support on C6, implement pwm motor control here...eventually
#endif
}

void eom_hal_set_motor2_speed(uint8_t speed) {
#if SOC_DAC_SUPPORTED
    dac_oneshot_output_voltage(dac2_handle, speed);
#else
    // No DAC support on C6, implement pwm motor control here...eventually
#endif
}

void eom_hal_init_motor(void) {
#if SOC_DAC_SUPPORTED
    dac_oneshot_new_channel(&dac1_cfg, &dac1_handle);
    dac_oneshot_new_channel(&dac2_cfg, &dac2_handle);
#else
    // gpio_config(MOTOR1_PIN, GPIO_MODE_OUTPUT);
    // gpio_config(MOTOR2_PIN, GPIO_MODE_OUTPUT);
#endif
}


//=== LED

void eom_hal_set_led_mono(uint8_t on) {
    if (on) {
        gpio_set_level(LED_GPIO, 1);
    } else {
        gpio_set_level(LED_GPIO, 0);
    }
}

void eom_hal_led_task(void *pvParameter) {
    while (1) {
        eom_hal_led_tick();
        vTaskDelay(10 / portTICK_PERIOD_MS); //check every 10ms
    }
}

void eom_hal_led_tick(void) {
    if (is_flashing) {
        unsigned long current_time = esp_timer_get_time() / 1000UL;
        if (current_time - last_flash >= flash_interval) {
            flash_on = !flash_on;
            last_flash = current_time;
             if (LED_TYPE == LED_TYPE_MONO) {
                eom_hal_set_led_mono(flash_on);
            } else if (LED_TYPE == LED_TYPE_WS2812) {
                eom_hal_set_rgb(flash_on ? led_color.r : 0, flash_on ? led_color.g : 0, flash_on ? led_color.b : 0);
            }
        }
    }
}

void eom_hal_set_rgb(uint8_t r, uint8_t g, uint8_t b) {
    
    // Skip update only if color unchanged AND not flashing
    if ((is_flashing && !flash_on && led_color.r == 0 && led_color.g == 0 && led_color.b == 0) 
        || (led_color.r == r && led_color.g == g && led_color.b == b)
    ) {
        return; //no change
    }

    if (!is_flashing || flash_on) {
            led_color.r = r;
            led_color.g = g;
            led_color.b = b;
    } else {
        led_color.r = 0;
        led_color.g = 0;
        led_color.b = 0;
    }

    if (LED_TYPE == LED_TYPE_WS2812) {
        if (led_strip == NULL) {
            ESP_LOGW(TAG, "LED strip not initialized");
            return;
        }
        esp_err_t err = ESP_OK;
        err = led_strip_set_pixel(led_strip, 0, r, g, b);

        if (err != ESP_OK) {
            ESP_LOGE(TAG, "led_strip_set_pixel failed: %s", esp_err_to_name(err));
            return;
        }
        err = led_strip_refresh(led_strip);
        if (err != ESP_OK) {
            ESP_LOGE(TAG, "led_strip_refresh failed: %s", esp_err_to_name(err));
            return;
        }
        ESP_LOGD(TAG, "LED RGB set to R:%d G:%d B:%d", r, g, b);
    }
}
void eom_hal_set_rgb_color(RGBColor* color) {
    eom_hal_set_rgb(color->r, color->g, color->b);
}

void eom_hal_set_led_flashing(uint8_t flashing) {
    is_flashing = flashing;
}

void eom_hal_set_led_flash_interval(uint16_t interval_ms) {
    //ESP_LOGW(TAG, "LED flash set to %d", interval_ms);
    flash_interval = interval_ms;
}

RGBColor eom_hal_get_rgb_color() {
    RGBColor color;
    // if (is_flashing && !flash_on) {  //redundant
    //     color.r = 0;
    //     color.g = 0;
    //     color.b = 0;
    //     return color;
    // }
    color.r = led_color.r;
    color.g = led_color.g;
    color.b = led_color.b;
    return color;
}

void eom_hal_led_init(void)
{
    gpio_reset_pin(LED_GPIO);
    gpio_set_direction(LED_GPIO, GPIO_MODE_OUTPUT);
    if (LED_TYPE == LED_TYPE_MONO) {
        eom_hal_set_rgb_color(&rgb_white);
        eom_hal_set_led_flashing(1);
        eom_hal_set_led_flash_interval(2000);
        return;
    } else if (LED_TYPE == LED_TYPE_WS2812) {
        if (LED_POWER > -1) {
            gpio_reset_pin(LED_POWER);
            gpio_set_direction(LED_POWER, GPIO_MODE_OUTPUT);
            gpio_set_level(LED_POWER, 1); //power on the LED strip
            vTaskDelay(10 / portTICK_PERIOD_MS); //give it a moment to power up
        }
        led_strip = configure_led_2812();
        eom_hal_set_rgb_color(&rgb_blue);  // Blue = Starting up
    }
    ESP_LOGI(TAG, "Configured LED init type %d on GPIO %d", LED_TYPE, LED_GPIO);

}

led_strip_handle_t configure_led_2812(void)
{
    led_strip_config_t strip_config = {
        .strip_gpio_num = LED_GPIO,   // The GPIO that connected to the LED strip's data line
        .max_leds = LED_NUM,        // The number of LEDs in the strip,
        .color_component_format = LED_STRIP_COLOR_COMPONENT_FMT, // Color format of your LED strip
        .led_model = LED_MODEL_WS2811,            // LED strip model
        .flags.invert_out = false,                // whether to invert the output signal
    };

    // LED strip backend configuration: SPI
    led_strip_spi_config_t spi_config = {
        .clk_src = SPI_CLK_SRC_DEFAULT, // different clock source can lead to different power consumption
        .flags.with_dma = true,         // Using DMA can improve performance and help drive more LEDs
        .spi_bus = SPI2_HOST,           // SPI bus ID
    };

     led_strip_rmt_config_t rmt_config = {
        .clk_src = RMT_CLK_SRC_DEFAULT,        // different clock source can lead to different power consumption
        .resolution_hz = LED_STRIP_RMT_RES_HZ, // RMT counter clock frequency
        .flags.with_dma = true,               // DMA feature is available on ESP target like ESP32-S3
        .mem_block_symbols = 0,                // Use default memory block size
    };


    //ESP_ERROR_CHECK(led_strip_new_spi_device(&strip_config, &spi_config, &led_strip));
    ESP_ERROR_CHECK(led_strip_new_rmt_device(&strip_config, &rmt_config, &led_strip));

    return led_strip;
}

RGBColor calculate_fade_color(RGBColor startColor, RGBColor endColor, float progress) {
    RGBColor fadedColor;

    // Ensure progress is within the valid range [0.0, 1.0]
    if (progress < 0.0f) progress = 0.0f;
    if (progress > 1.0f) progress = 1.0f;

    // Linearly interpolate each color component
    fadedColor.r = (uint8_t)(startColor.r + (endColor.r - startColor.r) * progress);
    fadedColor.g = (uint8_t)(startColor.g + (endColor.g - startColor.g) * progress);
    fadedColor.b = (uint8_t)(startColor.b + (endColor.b - startColor.b) * progress);

    return fadedColor;
}