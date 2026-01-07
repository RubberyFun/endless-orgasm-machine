#ifndef __ASSETS_h
#define __ASSETS_h

#include <stdint.h>
#include "esp_err.h"
#include "driver/i2c_master.h"

#define MPR_I2C_ADDRESS 0x08 // MPRLS0030PG00000A I2C address
#define MPR_PRESSURE_RESPONSE_LEN 4
#define MPR_READ_WAIT_MS 10
#define MPR_TIMEOUT_MS 200
#define MPR_READ_RETRIES 7
#define MPR_STATUS_MASK_POWER_ON               0x40
#define MPR_STATUS_MASK_BUSY                   0x20
#define MPR_STATUS_MASK_INTEGRITY_TEST_FAILED  0x04
#define MPR_STATUS_MASK_MATH_SATURATION        0x01

void mpr_dev_config(i2c_device_config_t* config);
esp_err_t mpr_read_pressure(i2c_master_dev_handle_t dev_handle, int32_t* pressure);
esp_err_t mpr_scan_i2c_bus(i2c_master_bus_handle_t bus_handle);

#endif