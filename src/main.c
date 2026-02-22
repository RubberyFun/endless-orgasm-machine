#include "api/broadcast.h"
#include "config.h"
#include "config_defs.h"
#include "eom-hal-esp32.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "gatt_svc.h"
#include "orgasm_control.h"
#include "polyfill.h"
#include "system/http_server.h"
#include "version.h"
#include "wifi_manager.h"
#include <esp_https_ota.h>
#include <esp_ota_ops.h>
#include <esp_system.h>
#include <esp_sleep.h>
#include <driver/gpio.h>
#include "driver/rtc_io.h"
#include <time.h>
#include <nvs_flash.h>
#include <esp_spiffs.h>


char* TAG = "main";


void spiffs_init() {
        ESP_LOGI(TAG, "Initializing SPIFFS");

    esp_vfs_spiffs_conf_t conf = {
      .base_path = "/spiffs",
      .partition_label = "spiffs",
      .max_files = 5,
      .format_if_mount_failed = true
    };

    esp_err_t ret = esp_vfs_spiffs_register(&conf);

    if (ret != ESP_OK) {
        if (ret == ESP_FAIL) {
            ESP_LOGE(TAG, "Failed to mount or format filesystem");
        } else if (ret == ESP_ERR_NOT_FOUND) {
            ESP_LOGE(TAG, "Failed to find SPIFFS partition");
        } else {
            ESP_LOGE(TAG, "Failed to initialize SPIFFS (%s)", esp_err_to_name(ret));
        }
        return;
    }
    ESP_LOGI(TAG, "SPIFFS registered");
}

// static void orgasm_task(void* args) {
    // for (;;) {
    // orgasm_control_tick();

    // vTaskDelay(1);
    // }
// }

static void ble_task(void* args) {
    for (;;) {   
    send_output1();

    vTaskDelay(10);
    }
}


static void loop_task(void* args) {
    // for (;;) {
    static long lastStatusTick = 0;
    static long lastTick = 0;

    // Periodically send out WiFi status:
    if (millis() - lastStatusTick > 1000 * 10) {
        lastStatusTick = millis();
        api_broadcast_network_status();
    }

    if (millis() - lastTick > 1000 / 15) {
        ESP_LOGD(
            TAG,
            "%%heap=%d, min=%d, internal=%d",
            esp_get_free_heap_size(),
            esp_get_minimum_free_heap_size(),
            esp_get_free_internal_heap_size()
        );

        lastTick = millis();
        api_broadcast_readings();
    }

    // Tick and see if we need to save config:
    config_enqueue_save(-1);

    vTaskDelay(1);
}


static void main_task(void* args) {
    orgasm_control_set_output_mode(OC_AUTOMATIC);

    for (;;) {
        //loop_task(NULL);
        orgasm_control_tick();
        eom_hal_led_tick();

        //send_output1();
        vTaskDelay(1);
    }
}

static void sleep_monitor_task(void* args) {
    if (SLEEP_GPIO < 1) {
        ESP_LOGI(TAG, "SLEEP_GPIO not configured, sleep monitor disabled");
        vTaskDelete(NULL);
        return;
    }

    // Configure GPIO as input with pull-down
    gpio_config_t io_conf = {
        .pin_bit_mask = (1ULL << SLEEP_GPIO),
        .mode = GPIO_MODE_INPUT,
        .pull_up_en = GPIO_PULLUP_ENABLE,
        .pull_down_en = GPIO_PULLDOWN_DISABLE,
        .intr_type = GPIO_INTR_DISABLE
    };
    esp_err_t ret = gpio_config(&io_conf);
    if (ret != ESP_OK) {
        ESP_LOGE(TAG, "Failed to configure SLEEP_GPIO %d: %s", SLEEP_GPIO, esp_err_to_name(ret));
        vTaskDelete(NULL);
        return;
    }

    ESP_LOGI(TAG, "Sleep monitor initialized on GPIO %d", SLEEP_GPIO);

    TickType_t sleep_debounce_until = 0;

    for (;;) {
        int level = gpio_get_level(SLEEP_GPIO);
        ESP_LOGD(TAG, "Sleep signal on GPIO %d", level);
        
        // Ignore LOW levels during debounce period
        if (level == 0 && xTaskGetTickCount() < sleep_debounce_until) {
            ESP_LOGD(TAG, "Ignoring LOW level during debounce period");
            vTaskDelay(pdMS_TO_TICKS(100));
            continue;
        }
        
        if (level == 0) {
            ESP_LOGI(TAG, "Entering sleep...");
            
            
            // Configure wake-up source
            
            if (LED_POWER > -1) {
                gpio_set_level(LED_POWER, 0); //power off the LED
            }
            
            // Disable pullup for sleep
            // io_conf.pull_up_en = GPIO_PULLUP_DISABLE;
            // esp_err_t ret = gpio_config(&io_conf);
            if (ret != ESP_OK) {
                ESP_LOGE(TAG, "Failed to re-configure SLEEP_GPIO %d: %s", SLEEP_GPIO, esp_err_to_name(ret));
            }
            
            // Give time for log message to be sent and button to be released
            
            // Enter sleep
            // rtc_gpio_pullup_dis(SLEEP_GPIO);
            // rtc_gpio_pulldown_en(SLEEP_GPIO);
            // esp_sleep_enable_ext0_wakeup(SLEEP_GPIO, 1);
            vTaskDelay(pdMS_TO_TICKS(500));
            esp_sleep_enable_gpio_wakeup();
            gpio_wakeup_enable(SLEEP_GPIO, GPIO_INTR_LOW_LEVEL);
            esp_light_sleep_start();
            ESP_LOGI(TAG, "esp_sleep.wake_reason=%d", esp_sleep_get_wakeup_cause());
            
            // Set debounce period: ignore LOW levels for 1 second after waking
            sleep_debounce_until = xTaskGetTickCount() + pdMS_TO_TICKS(1000);
            
            // rtc_gpio_deinit(SLEEP_GPIO) ;
            // Re-enable pullup for sleep
            // io_conf.pull_up_en = GPIO_PULLUP_ENABLE;
            ret = gpio_config(&io_conf);
            if (ret != ESP_OK) {
                ESP_LOGE(TAG, "Failed to re-configure SLEEP_GPIO %d: %s", SLEEP_GPIO, esp_err_to_name(ret));
            }

            if (LED_POWER > -1) {
                gpio_set_level(LED_POWER, 1); //power on the LED
            }
        }
        
        // Check every 100ms - this MUST be here to prevent watchdog
        vTaskDelay(pdMS_TO_TICKS(100));
    }
}

esp_err_t run_boot_diagnostic(void) {
    esp_err_t err = ESP_ERR_INVALID_ARG;
    esp_ota_img_states_t ota_state = ESP_OTA_IMG_UNDEFINED;

    const esp_partition_t* configured = esp_ota_get_boot_partition();
    const esp_partition_t* running = esp_ota_get_running_partition();

    if (configured != running) {
        ESP_LOGW(
            TAG,
            "Configured OTA boot partition at offset 0x%08" PRIx32
            ", but running from offset 0x%08" PRIx32,
            configured->address,
            running->address
        );
        ESP_LOGW(
            TAG,
            "(This can happen if either the OTA boot data or preferred boot image become corrupted "
            "somehow.)"
        );
    }

    ESP_LOGD(
        TAG,
        "Running partition type %d subtype %d (offset 0x%08" PRIx32 ")",
        running->type,
        running->subtype,
        running->address
    );

    if (esp_ota_get_state_partition(running, &ota_state) == ESP_OK) {
        if (ota_state == ESP_OTA_IMG_PENDING_VERIFY) {
            // if (diagnostic_is_ok) {
            ESP_LOGI(TAG, "Diagnostics completed successfully! Continuing execution ...");
            esp_ota_mark_app_valid_cancel_rollback();
            err = ESP_OK;
            // } else {
            // ESP_LOGE(TAG, "Diagnostics failed! Start rollback to the previous version ...");
            // esp_ota_mark_app_invalid_rollback_and_reboot();
            // }
        }
    }

    return err;
}

void app_main() {
    //esp_log_level_set(TAG, ESP_LOG_DEBUG);
    TickType_t boot_tick = xTaskGetTickCount();

    esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK(ret);

    spiffs_init();
    ESP_LOGI(TAG, "SPIFFS initialization returned.");
    config_init();
    ESP_LOGI(TAG, "Config initialization returned.");
    eom_hal_led_init();
    ESP_LOGI(TAG, "LED initialization returned.");
    orgasm_control_init();
    ESP_LOGI(TAG, "Orgasm control initialization returned.");

    if (MOTOR1_ENABLED || MOTOR2_ENABLED) {
        eom_hal_init_motor();
        ESP_LOGI(TAG, "Motor initialization returned.");
    }


    printf("Claus Macher presents the Endless Orgasm Machine\n");
    printf("Version: %s\n", EOM_VERSION);

    //Post-Update Diagnostics
    esp_err_t dxerr = run_boot_diagnostic();
    if (dxerr != ESP_ERR_INVALID_ARG) {
        if (dxerr == ESP_OK) {
            ESP_LOGI(TAG, "%s\n%s", "Update complete.", EOM_VERSION);
        }
    }

    // Green = prepare Networking
    // vTaskDelayUntil(&boot_tick, 1000UL / portTICK_PERIOD_MS);
    //eom_hal_set_encoder_rgb(0, 255, 0);


    // Initialize Bluetooth
    // Blue = prepare Bluetooth and Drivers
    // vTaskDelayUntil(&boot_tick, 1000UL / portTICK_PERIOD_MS);
    //eom_hal_set_encoder_rgb(0, 0, 255);

    if (Config.bt_on) {
        ble_host_config_init();
        ESP_LOGI(TAG, "Bluetooth initialization returned.");
    }


    // Initialize WiFi
    if (Config.wifi_on) {
        http_server_init();
        ESP_LOGI(TAG, "HTTP Server initialization returned.");
        wifi_manager_init();
        ESP_LOGI(TAG, "WiFi Manager initialization returned.");
        ESP_LOGI(TAG, "IP Address: %s", wifi_manager_get_local_ip());
    }


    ESP_LOGI(TAG, "System initialization complete.");
    xTaskCreate(main_task, "MAIN", 1024 * 12, NULL, tskIDLE_PRIORITY + 1, NULL);
    xTaskCreate(ble_task, "BT", 1024 * 12, NULL, tskIDLE_PRIORITY + 2, NULL);
    xTaskCreate(sleep_monitor_task, "SLEEP", 1024 * 4, NULL, tskIDLE_PRIORITY, NULL);
    ESP_LOGI(TAG, "Tasks created, entering main loop.");
}   