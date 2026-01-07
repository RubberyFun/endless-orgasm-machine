#include "components/mpr_pressure_sensor.h"
#include "driver/i2c_master.h"
#include "freertos/FreeRTOS.h"
#include "esp_log.h"

static const char* TAG = "MPR_SENSOR";
const uint8_t MPR_PRESSURE_REQ[3] = {0xAA, 0x00, 0x00};

void mpr_dev_config(i2c_device_config_t* config) {
    config->dev_addr_length = I2C_ADDR_BIT_LEN_7;
    config->device_address = MPR_I2C_ADDRESS;
    config->scl_speed_hz = 100000;  // 100kHz - 400kHz supported
}

esp_err_t mpr_read_pressure(i2c_master_dev_handle_t dev_handle, int32_t* pressure) {
    //esp_log_level_set(TAG, ESP_LOG_DEBUG);
    uint8_t data[MPR_PRESSURE_RESPONSE_LEN];
    esp_err_t ret = ESP_FAIL;
    uint8_t status = 0;
    int retries = MPR_READ_RETRIES;


    while (retries--) {
        // Send pressure request command
        ESP_LOGD(TAG, "Sending pressure request (attempt %d/%d)...", MPR_READ_RETRIES - retries, MPR_READ_RETRIES);
        
        // Use a reasonable timeout for the I2C transaction itself (not sensor processing time)
        ret = i2c_master_transmit(dev_handle, (const uint8_t*)MPR_PRESSURE_REQ, sizeof(MPR_PRESSURE_REQ), MPR_TIMEOUT_MS);
        
        if (ret != ESP_OK) {
            ESP_LOGD(TAG, "Transmit failed: %s (0x%x)", esp_err_to_name(ret), ret);
            
            // If invalid state, the bus might be stuck - try to continue anyway
            if (ret == ESP_ERR_INVALID_STATE) {
                ESP_LOGD(TAG, "I2C bus in invalid state, attempting to continue...");
                vTaskDelay(pdMS_TO_TICKS(MPR_READ_WAIT_MS)); // Give bus time to recover
                continue;
            }
            return ret;
        }

        ESP_LOGD(TAG, "Request sent successfully, waiting for sensor to process...");

        vTaskDelay(MPR_READ_WAIT_MS / portTICK_PERIOD_MS);  // Wait for sensor to process and get response
        ret = i2c_master_receive(dev_handle, data, MPR_PRESSURE_RESPONSE_LEN, MPR_TIMEOUT_MS);

        // ret = i2c_master_transmit_receive(dev_handle, (const uint8_t*)MPR_PRESSURE_REQ, sizeof(MPR_PRESSURE_REQ), data, MPR_PRESSURE_RESPONSE_LEN, MPR_TIMEOUT_MS); // Transmit request and receive response in one transaction
        ESP_LOGD(TAG, "Response received, parsing...");

        if (ret == ESP_OK) {
            status = data[0];
            ESP_LOGD(TAG, "Status byte: 0x%02X", status);

            // Check for error conditions
            if (!(status & MPR_STATUS_MASK_POWER_ON)) {
                ESP_LOGD(TAG, "Sensor not powered on");
                return ESP_ERR_INVALID_STATE;
            }
            if (status & MPR_STATUS_MASK_INTEGRITY_TEST_FAILED) {
                ESP_LOGD(TAG, "Sensor integrity test failed");
                return ESP_ERR_INVALID_RESPONSE;
            }
            if (status & MPR_STATUS_MASK_MATH_SATURATION) {
                ESP_LOGD(TAG, "Sensor math saturation error");
                return ESP_ERR_INVALID_RESPONSE;
            }

            // Check if sensor is still busy
            if (status & MPR_STATUS_MASK_BUSY) {
                ESP_LOGD(TAG, "Sensor still busy, retrying...");
                vTaskDelay(MPR_READ_WAIT_MS / portTICK_PERIOD_MS);
                continue;  // Retry the read
            }
            
            // Successful read - sensor is ready and has data
            ESP_LOGD(TAG, "Pressure data: 0x%02X 0x%02X 0x%02X", data[1], data[2], data[3]);
            *pressure = ((int32_t)data[1] << 16) | ((int32_t)data[2] << 8) | (int32_t)data[3];
            return ESP_OK;
        } else {
            ESP_LOGD(TAG, "Receive failed: %s (0x%x)", esp_err_to_name(ret), ret);
        }
    }

    if (ret == ESP_OK && status != 0) {
        return (esp_err_t)status;  //might help debugging
    } else {
        return ESP_FAIL;
    }
}

esp_err_t mpr_scan_i2c_bus(i2c_master_bus_handle_t bus_handle) {
    ESP_LOGI(TAG, "Scanning I2C bus...");
    uint8_t found_devices = 0;
    
    for (uint8_t addr = 0x03; addr < 0x78; addr++) {
        // Create temporary device config for this address
        i2c_device_config_t probe_cfg = {
            .dev_addr_length = I2C_ADDR_BIT_LEN_7,
            .device_address = addr,
            .scl_speed_hz = 100000,
        };
        
        i2c_master_dev_handle_t probe_handle;
        esp_err_t ret = i2c_master_bus_add_device(bus_handle, &probe_cfg, &probe_handle);
        
        if (ret == ESP_OK) {
            // Try to probe the device
            ret = i2c_master_probe(bus_handle, addr, 100);
            
            if (ret == ESP_OK) {
                ESP_LOGI(TAG, "Found device at address 0x%02X", addr);
                found_devices++;
                
                if (addr == MPR_I2C_ADDRESS) {
                    ESP_LOGI(TAG, "  ^--- This is the expected MPR sensor address!");
                }
            }
            
            i2c_master_bus_rm_device(probe_handle);
        }
    }
    
    if (found_devices == 0) {
        ESP_LOGW(TAG, "No I2C devices found! Check wiring and power.");
        return ESP_ERR_NOT_FOUND;
    } else {
        ESP_LOGI(TAG, "I2C scan complete. Found %d device(s).", found_devices);
        return ESP_OK;
    }
}