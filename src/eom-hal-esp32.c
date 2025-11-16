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

static const char* TAG = "HAL";

uint8_t pressure_ambient = DEFAULT_AMBIENT_RESSURE;
uint8_t pressure_sensitivity = DEFAULT_PRESSURE_SENSITIVITY;  //this now scales 0-3 corresponding to the native ESP32 ADC attenuation levels

adc_oneshot_unit_handle_t adc1_handle;
adc_oneshot_unit_init_cfg_t adc1_init_cfg = {
    .unit_id = ADC_UNIT_1,
    .ulp_mode = ADC_ULP_MODE_DISABLE,
};

led_strip_handle_t led_strip = NULL;
RGBColor led_color = {0, 0, 0};
RGBColor rgb_off = {0, 0, 0};
RGBColor rgb_white = {255, 255, 255};
RGBColor rgb_red = {255, 0, 0};
RGBColor rgb_green = {0, 255, 0};
RGBColor rgb_blue = {0, 0, 255};
RGBColor rgb_orange = {255, 130, 0}; //255, 185, 59
RGBColor rgb_yellow = {255, 230, 0}; //255,240,133
RGBColor rgb_purple = {80, 0, 150}; // 179, 0, 255
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

uint16_t eom_hal_get_pressure_reading(void) {
    int raw = 0;

    adc_oneshot_read(adc1_handle, PRESSURE_GPIO, &raw);  

    //ESP_LOGI(TAG, "Pressure raw: %d", raw);
    int adjusted = raw - pressure_ambient;
    if (adjusted < 0) {
        adjusted = 0;
        eom_hal_setup_pressure_ambient();
    }

    //adjusted *= pressure_sensitivity;  //if we go the software multiplier route
    if (adjusted > EOM_HAL_PRESSURE_MAX) adjusted = EOM_HAL_PRESSURE_MAX;
    return (uint16_t)adjusted;
}

uint8_t eom_hal_get_sensor_sensitivity(void) {
    return pressure_sensitivity; 
}

void eom_hal_init_pressure_sensor(void) {
    // ESP_ERROR_CHECK(adc1_config_width(ADC_BITWIDTH_12));

    adc_atten_t esp_sensitivity = Config.sensor_sensitivity >= 3 ? ADC_ATTEN_DB_0 
                                : (Config.sensor_sensitivity == 2 ? ADC_ATTEN_DB_2_5 
                                : (Config.sensor_sensitivity == 1 ? ADC_ATTEN_DB_6 
                                : ADC_ATTEN_DB_12));
    adc_oneshot_chan_cfg_t adcCfg = {
        .bitwidth = ADC_BITWIDTH_12,
        .atten = esp_sensitivity,
    };
    adc_oneshot_new_unit(&adc1_init_cfg, &adc1_handle);
    ESP_ERROR_CHECK(adc_oneshot_config_channel(adc1_handle, PRESSURE_GPIO, &adcCfg));

    eom_hal_setup_pressure_ambient();
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
    pressure_sensitivity = sensitivity;

    if (adc1_handle == NULL) return; //not initialized yet

    adc_atten_t esp_sensitivity = sensitivity >= 3 ? ADC_ATTEN_DB_0 
                                : (sensitivity == 2 ? ADC_ATTEN_DB_2_5 
                                : (sensitivity == 1 ? ADC_ATTEN_DB_6 
                                : ADC_ATTEN_DB_12));
    adc_oneshot_chan_cfg_t adcCfg = {
        .bitwidth = ADC_BITWIDTH_12,
        .atten = esp_sensitivity,
    };
    ESP_ERROR_CHECK(adc_oneshot_config_channel(adc1_handle, PRESSURE_GPIO, &adcCfg));

    //rather than use this as a software multiplier we'll set different ADC attenuation level
    // ADC_ATTEN_DB_0   = 0,  ///<No input attenuation, ADC can measure up to approx.
    // ADC_ATTEN_DB_2_5 = 1,  ///<The input voltage of ADC will be attenuated extending the range of measurement by about 2.5 dB
    // ADC_ATTEN_DB_6   = 2,  ///<The input voltage of ADC will be attenuated extending the range of measurement by about 6 dB
    // ADC_ATTEN_DB_12  = 3,  ///<The input voltage of ADC will be attenuated extending the range of measurement by about 12 dB


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
                eom_hal_set_rgb(led_color.r, led_color.g, led_color.b);
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

    // if (LED_TYPE == LED_TYPE_MONO) {
    //     if (r > 250 && (!is_flashing || flash_on)) {  //using red value as on/off
    //         eom_hal_set_led_mono(1);
    //     } else {
    //         eom_hal_set_led_mono(0);
    //     }
    // } else 
    if (LED_TYPE == LED_TYPE_WS2812) {

        if (led_strip == NULL) {
            ESP_LOGW(TAG, "LED strip not initialized");
            return;
        }
        esp_err_t err = ESP_OK;
        if (!is_flashing || flash_on) {
            err = led_strip_set_pixel(led_strip, 0, r, g, b);
                led_color.r = r;
                led_color.g = g;
                led_color.b = b;
        } else {
            err = led_strip_set_pixel(led_strip, 0, 0, 0, 0);
            led_color.r = 0;
            led_color.g = 0;
            led_color.b = 0;
        }
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
    ESP_LOGW(TAG, "LED flash set to %d", interval_ms);
    flash_interval = interval_ms;
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
        .color_component_format = LED_STRIP_COLOR_COMPONENT_FMT_GRB, // Color format of your LED strip
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