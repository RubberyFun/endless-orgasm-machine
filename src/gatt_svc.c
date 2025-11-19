#include "gap.h"
#include "gatt_svc.h"
#include "nimble/nimble_port.h"
#include "nimble/ble.h"
#include "host/ble_hs.h"
#include "host/ble_uuid.h"
#include "host/util/util.h"
#include "nimble/ble.h"
#include "nimble/nimble_port.h"
#include "nimble/nimble_port_freertos.h"
#include "math.h"
#include "eom-hal-esp32.h"
#include "config.h"
#include "orgasm_control.h"
#include <cJSON.h>
#include "config_defs.h"

static const char* TAG = "gatts";

void ble_store_config_init(void);

static void on_stack_reset(int reason);
static void on_stack_sync(void);
static void nimble_host_task(void *param);

static int status_out_chr_access    (uint16_t conn_handle, uint16_t attr_handle,struct ble_gatt_access_ctxt *ctxt, void *arg);
static int update_main_chr_access   (uint16_t conn_handle, uint16_t attr_handle,struct ble_gatt_access_ctxt *ctxt, void *arg);
static int send_chr_access          (uint16_t conn_handle, uint16_t attr_handle,struct ble_gatt_access_ctxt *ctxt, void *arg);
static int output1_chr_access       (uint16_t conn_handle, uint16_t attr_handle,struct ble_gatt_access_ctxt *ctxt, void *arg);
static int input1_chr_access        (uint16_t conn_handle, uint16_t attr_handle,struct ble_gatt_access_ctxt *ctxt, void *arg);


/* EOM service */
static const ble_uuid16_t status_svc_uuid = BLE_UUID16_INIT(GATTS_SERVICE_EOM_UUID); 

static uint8_t status_chr_val[9] = {0};
static uint16_t status_chr_val_handle;
static const ble_uuid16_t status_chr_uuid = BLE_UUID16_INIT(GATTS_CHAR_STATUS_UUID); //EOM status
static uint16_t status_chr_conn_handle = 0;
static bool status_chr_conn_handle_inited = false;
static bool status_ind_status = false;

static uint16_t update_main_chr_val_handle;
static const ble_uuid16_t update_main_chr_uuid = BLE_UUID16_INIT(GATTS_CHAR_UPDATE_UUID); //EOM input

static uint8_t send_chr_val[512] = {0};
static uint16_t send_chr_val_handle;
static const ble_uuid16_t send_chr_uuid = BLE_UUID16_INIT(GATTS_CHAR_CONFIG_UUID); //EOM config dumps
static uint16_t send_chr_conn_handle = 0;
static bool send_chr_conn_handle_inited = false;
static bool send_ind_status = false;
/* End EOM service */

  
/* Monsterpub emulation service */
static const ble_uuid16_t output1_svc_uuid = BLE_UUID16_INIT(GATTS_SERVICE1_UUID); //mosterpub pressure service
static uint8_t output1_chr_val[2] = {0};
static uint16_t output1_chr_val_handle;
static const ble_uuid16_t output1_chr_uuid = BLE_UUID16_INIT(GATTS_OUTPUT1_CHAR_UUID);
static uint16_t output1_chr_conn_handle = 0;
static bool output1_chr_conn_handle_inited = false;
static bool output1_ind_status = false;

//static const ble_uuid16_t input1_svc_uuid = BLE_UUID16_INIT(0x1815);
static uint16_t input1_chr_val_handle;
static const ble_uuid16_t input1_chr_uuid = BLE_UUID16_INIT(GATTS_INPUT1_CHAR_UUID); //mosterpub vibe input
/* End Monsterpub emulation service */

void send_output1(void) {
    if (output1_ind_status && output1_chr_conn_handle_inited) {
        ble_gatts_notify(output1_chr_conn_handle,
                         output1_chr_val_handle);
    }

    if (status_ind_status && status_chr_conn_handle_inited) {
        ble_gatts_notify(status_chr_conn_handle,
                         status_chr_val_handle);
    }
}

void send_config() {
    char config_buffer[2048];
    config_serialize(&Config, config_buffer, sizeof(config_buffer));
    size_t config_length = strlen(config_buffer) - 2; //exclude last brace
    if (send_ind_status && send_chr_conn_handle_inited) {
        int chunk_size = 512; // MTU is configured to 515 bytes (512 payload + 3 overhead)
        int offset = 1; //exclude first brace
        while (offset < config_length) {
            // Find the last line break within the chunk
            int search_end = (config_length - offset > chunk_size) ? 
                offset + chunk_size : config_length;
            int last_newline = -1;
            for (int i = offset; i < search_end; i++) {
                if (config_buffer[i] == '\n') {
                    last_newline = i;
                }
            }
            
            // Use the last newline position if found, otherwise use chunk_size
            int bytes_to_send = (last_newline > offset && !(config_length - offset < chunk_size)) ? 
                (last_newline - offset + 1) : 
                (config_length - offset > chunk_size ? chunk_size : config_length - offset);
            
            memcpy(send_chr_val, &config_buffer[offset], bytes_to_send - 1); //exclude last comma
            send_chr_val[bytes_to_send - 2] = '\0';  // Null terminate
            
            offset += bytes_to_send;

            ESP_LOGE(TAG, "Sending config chunk: %.*s", bytes_to_send, send_chr_val);

            // Create mbuf and send notification with custom data
            struct os_mbuf *om = ble_hs_mbuf_from_flat(send_chr_val, bytes_to_send - 2);
            if (om != NULL) {
                ble_gatts_notify_custom(send_chr_conn_handle, send_chr_val_handle, om);
            }
            vTaskDelay(300 / portTICK_PERIOD_MS); // Small delay to allow notifications to be sent
        }
    }
}

static void deferred_send_config_task(void *param) {
    vTaskDelay(100 / portTICK_PERIOD_MS); // Brief delay to ensure subscription is fully established
    send_config();
    vTaskDelete(NULL);
}


/* GATT services table */
static const struct ble_gatt_svc_def gatt_svr_svcs[] = {
    {.type = BLE_GATT_SVC_TYPE_PRIMARY,
     .uuid = &status_svc_uuid.u,
     .characteristics =
         (struct ble_gatt_chr_def[]){
             {
              .uuid = &status_chr_uuid.u,
              .access_cb = status_out_chr_access,
              .flags = BLE_GATT_CHR_F_READ | BLE_GATT_CHR_F_NOTIFY,
              .val_handle = &status_chr_val_handle},
            {
                .uuid = &update_main_chr_uuid.u,
                .access_cb = update_main_chr_access,
                .flags = BLE_GATT_CHR_F_WRITE,
                .val_handle = &update_main_chr_val_handle
            },
            {
                .uuid = &send_chr_uuid.u,
                .access_cb = send_chr_access,
                .flags = BLE_GATT_CHR_F_READ | BLE_GATT_CHR_F_NOTIFY,
                .val_handle = &send_chr_val_handle
            },
            
             {
                 0, /* No more characteristics in this service. */
             }
        }
    },

    {.type = BLE_GATT_SVC_TYPE_PRIMARY,
     .uuid = &output1_svc_uuid.u,
     .characteristics =
         (struct ble_gatt_chr_def[]){
             {
              .uuid = &output1_chr_uuid.u,
              .access_cb = output1_chr_access,
              .flags = BLE_GATT_CHR_F_READ | BLE_GATT_CHR_F_NOTIFY,
              .val_handle = &output1_chr_val_handle},
            {
                .uuid = &input1_chr_uuid.u,
                .access_cb = input1_chr_access,
                .flags = BLE_GATT_CHR_F_WRITE,
                .val_handle = &input1_chr_val_handle
            },
            
             {
                 0, /* No more characteristics in this service. */
             }
        }
    },

    {
        0, /* No more services. */
    },
};

static int status_out_chr_access(uint16_t conn_handle, uint16_t attr_handle, struct ble_gatt_access_ctxt *ctxt, void *arg) {
    int rc;
    switch (ctxt->op) {
    case BLE_GATT_ACCESS_OP_READ_CHR:
        if (conn_handle != BLE_HS_CONN_HANDLE_NONE) {
            ESP_LOGD(TAG, "characteristic read; conn_handle=%d attr_handle=%d", conn_handle, attr_handle);
        } else {
            ESP_LOGD(TAG, "characteristic read by nimble stack; attr_handle=%d", attr_handle);
        }
        if (attr_handle == status_chr_val_handle) {
            
            uint16_t permit_seconds = orgasm_control_get_permit_orgasm_remaining_seconds();
            uint8_t chr_val[13] = {
                (uint8_t)(orgasm_control_get_last_pressure() >> 4), // Scale from 12-bit (0-4095) to 8-bit (0-255)
                (uint8_t)(orgasm_control_get_arousal() >> 4),
                (uint8_t)(orgasm_control_get_arousal_threshold() >> 4),
                orgasm_control_get_pleasure(),
                orgasm_control_get_cooldown(),
                orgasm_control_get_orgasm_count(),
                (uint8_t)orgasm_control_get_output_mode(),
                (uint8_t)Config.vibration_mode,
                (uint8_t)((permit_seconds >> 8) & 0xFF),  // MSB
                (uint8_t)(permit_seconds & 0xFF),        // LSB
                (uint8_t)eom_hal_get_rgb_color().r,
                (uint8_t)eom_hal_get_rgb_color().g,
                (uint8_t)eom_hal_get_rgb_color().b
            };

            rc = os_mbuf_append(ctxt->om, chr_val, sizeof(chr_val));
            return rc == 0 ? 0 : BLE_ATT_ERR_INSUFFICIENT_RES;
        }
        goto error;
    default:
        goto error;
    }
error:
    ESP_LOGE(
        TAG,
        "unexpected access operation to status output characteristic, opcode: %d",
        ctxt->op);
    return BLE_ATT_ERR_UNLIKELY;
}



static int update_main_chr_access(uint16_t conn_handle, uint16_t attr_handle, struct ble_gatt_access_ctxt *ctxt, void *arg) {
    int rc;
    switch (ctxt->op) {
    case BLE_GATT_ACCESS_OP_WRITE_CHR:
        if (conn_handle != BLE_HS_CONN_HANDLE_NONE) {
            ESP_LOGI(TAG, "characteristic write; conn_handle=%d attr_handle=%d",conn_handle, attr_handle);
        } else {
            ESP_LOGI(TAG, "characteristic write by nimble stack; attr_handle=%d", attr_handle);
        }
        if (attr_handle == update_main_chr_val_handle) {
            uint8_t buf[ctxt->om->om_len];
            ESP_LOGE(TAG, "Received data length: %d", ctxt->om->om_len);
            rc = os_mbuf_copydata(ctxt->om, 0, ctxt->om->om_len, buf);
            if (rc != 0) {
                return rc;
            }
            
            /* Create hexadecimal string representation */
            char hex_str[ctxt->om->om_len * 2 + 1]; // 2 chars per byte + null terminator
            for (int i = 0; i < ctxt->om->om_len; i++) {
                sprintf(&hex_str[i * 2], "%02x ", buf[i]);
            }
            hex_str[ctxt->om->om_len * 2] = '\0'; // Null terminate
            ESP_LOGE(TAG, "Received data (hex): %s", hex_str);
            
            // Check if buffer contains a ':' character (0x3A)
            bool has_colon = false;
            int colon_pos = -1;
            for (int i = 0; i < ctxt->om->om_len; i++) {
                if (buf[i] == 0x3A) {  // ':' character
                    has_colon = true;
                    colon_pos = i;
                    break;
                }
            }
            
            if (buf[0] == 0x01 && ctxt->om->om_len >= 4) {
                //mode, trigger arousal, reset denied, (optional) motor1/pleasure, (optional) motor2
                uint8_t mode = buf[1];
                bool trigger_arousal = buf[2] != 0;
                bool reset_denied = buf[3] != 0;
                ESP_LOGE(TAG, "Setting mode to %d, trigger_arousal=%d, reset_denied=%d", mode, trigger_arousal, reset_denied);
                if (orgasm_control_get_output_mode() != mode) {
                    orgasm_control_set_output_mode(mode);
                }
                if (trigger_arousal) {
                    orgasm_control_trigger_arousal();
                }
                if (reset_denied) {
                    orgasm_control_reset_denied();
                }
                
                if (ctxt->om->om_len >= 5) {
                    uint8_t pleasure_or_motor = buf[4];
                    orgasm_control_set_pleasure_ex(pleasure_or_motor,false);
                    eom_hal_set_motor1_speed(pleasure_or_motor);
                }
                if (ctxt->om->om_len >= 6) {
                    uint8_t motor2 = buf[5];
                    eom_hal_set_motor2_speed(motor2);
                }
            } else if (buf[0] == 0x02 && ctxt->om->om_len >= 2 && has_colon) {
                char setting_name[colon_pos + 1];  
                memcpy(setting_name, &buf[1], colon_pos - 1);  // Skip 0x02 command byte, stop at colon (no quotes)
                setting_name[colon_pos - 1] = '\0';  // Null terminate
                
                char setting_value[ctxt->om->om_len - colon_pos];
                memcpy(setting_value, &buf[colon_pos + 1], ctxt->om->om_len - colon_pos - 1);  //starting after colon
                setting_value[ctxt->om->om_len - colon_pos - 1] = '\0';  // Null terminate

                ESP_LOGE(TAG, "Setting name: %s, value: %s", setting_name, setting_value);
                if (set_config_value(setting_name, setting_value, NULL)) {
                    ESP_LOGD(TAG, "Set config value successfully");
                } else {
                    ESP_LOGD(TAG, "Failed to set config value");
                }
            } else if (buf[0] == 0x03) {
                ESP_LOGE(TAG, "Received config dump request");
                xTaskCreate(deferred_send_config_task, "SendConfig", 6*1024, NULL, 5, NULL);
            }
            return rc;
        }
        goto error;

    /* Unknown event */
    default:
        goto error;
    }

error:
    ESP_LOGE(TAG,
             "unexpected access operation to update characteristic, opcode: %d",
             ctxt->op);
    return BLE_ATT_ERR_UNLIKELY;
}




static int send_chr_access(uint16_t conn_handle, uint16_t attr_handle, struct ble_gatt_access_ctxt *ctxt, void *arg) {
    int rc;
    switch (ctxt->op) {
    case BLE_GATT_ACCESS_OP_READ_CHR:
        if (conn_handle != BLE_HS_CONN_HANDLE_NONE) {
            ESP_LOGD(TAG, "characteristic read; conn_handle=%d attr_handle=%d", conn_handle, attr_handle);
        } else {
            ESP_LOGD(TAG, "characteristic read by nimble stack; attr_handle=%d", attr_handle);
        }
        if (attr_handle == send_chr_val_handle) {
            //noop!
            return 0;
        }
        goto error;

    /* Unknown event */
    default:
        goto error;
    }

error:
    ESP_LOGE(
        TAG,
        "unexpected access operation to send characteristic, opcode: %d",
        ctxt->op);
    return BLE_ATT_ERR_UNLIKELY;
}



static int output1_chr_access(uint16_t conn_handle, uint16_t attr_handle,
                                 struct ble_gatt_access_ctxt *ctxt, void *arg) {
    /* Local variables */
    int rc;

    /* Handle access events */
    /* Note: Heart rate characteristic is read only */
    switch (ctxt->op) {

    /* Read characteristic event */
    case BLE_GATT_ACCESS_OP_READ_CHR:
        /* Verify connection handle */
        if (conn_handle != BLE_HS_CONN_HANDLE_NONE) {
            ESP_LOGD(TAG, "characteristic read; conn_handle=%d attr_handle=%d", conn_handle, attr_handle);
        } else {
            ESP_LOGD(TAG, "characteristic read by nimble stack; attr_handle=%d", attr_handle);
        }

        /* Verify attribute handle */
        if (attr_handle == output1_chr_val_handle) {
            /* sending pleasure value as pressure */
            uint16_t pressure_value = (uint16_t)(orgasm_control_get_pleasure() / 255.0 * 1530);  //Monsterpub scales to 1530
            uint8_t chr_val[2] = {
                (uint8_t)(pressure_value & 0xFF),        // LSB
                (uint8_t)((pressure_value >> 8) & 0xFF)  // MSB
            };

            rc = os_mbuf_append(ctxt->om, chr_val, sizeof(chr_val));
            return rc == 0 ? 0 : BLE_ATT_ERR_INSUFFICIENT_RES;
        }
        
        goto error;

    /* Unknown event */
    default:
        goto error;
    }

error:
    ESP_LOGE(
        TAG,
        "unexpected access operation to output1 characteristic, opcode: %d",
        ctxt->op);
    return BLE_ATT_ERR_UNLIKELY;
}

static int input1_chr_access(uint16_t conn_handle, uint16_t attr_handle,
                          struct ble_gatt_access_ctxt *ctxt, void *arg) {
    /* Local variables */
    int rc;

    /* Handle access events */
    /* Note: LED characteristic is write only */
    switch (ctxt->op) {

    /* Write characteristic event */
    case BLE_GATT_ACCESS_OP_WRITE_CHR:
        /* Verify connection handle */
        if (conn_handle != BLE_HS_CONN_HANDLE_NONE) {
            ESP_LOGI(TAG, "characteristic write; conn_handle=%d attr_handle=%d", conn_handle, attr_handle);
        } else {
            ESP_LOGI(TAG, "characteristic write by nimble stack; attr_handle=%d", attr_handle);
        }

        /* Verify attribute handle */
        if (attr_handle == input1_chr_val_handle) {
            /* Verify access buffer length */
            uint8_t buf[ctxt->om->om_len];
            ESP_LOGI(TAG, "Received data length: %d", ctxt->om->om_len);
            rc = os_mbuf_copydata(ctxt->om, 0, ctxt->om->om_len, buf);
            if (rc != 0) {
                return rc;
            }
            
            /* Create hexadecimal string representation */
            char hex_str[ctxt->om->om_len * 2 + 1]; // 2 chars per byte + null terminator
            for (int i = 0; i < ctxt->om->om_len; i++) {
                sprintf(&hex_str[i * 2], "%02x ", buf[i]);
            }
            hex_str[ctxt->om->om_len * 2] = '\0'; // Null terminate
            
            ESP_LOGE(TAG, "Received data (hex): %s", hex_str);
            
            //update motor speed here
            uint16_t motor1_speed = floor(buf[0] * 2.55);
            ESP_LOGE(TAG, "Setting motor1 speed to: %d, %02x", motor1_speed, buf[0]);
            eom_hal_set_motor1_speed((uint8_t) motor1_speed);
            uint16_t motor2_speed = floor(buf[1] * 2.55);
            ESP_LOGE(TAG, "Setting motor2 speed to: %d, %02x", motor2_speed, buf[1]);
            eom_hal_set_motor2_speed((uint8_t) motor2_speed);
            orgasm_control_set_pleasure_ex((uint8_t) motor1_speed, false); //update internal state without changing motor speed again
            return rc;
        }
        goto error;

    /* Unknown event */
    default:
        goto error;
    }

error:
    ESP_LOGE(TAG,
             "unexpected access operation to led characteristic, opcode: %d",
             ctxt->op);
    return BLE_ATT_ERR_UNLIKELY;
}




/*
 *  Handle GATT attribute register events
 *      - Service register event
 *      - Characteristic register event
 *      - Descriptor register event
 */
void gatt_svr_register_cb(struct ble_gatt_register_ctxt *ctxt, void *arg) {
    ESP_LOGD(TAG, "gatt_svr_register_cb called");
    /* Local variables */
    char buf[BLE_UUID_STR_LEN];

    /* Handle GATT attributes register events */
    switch (ctxt->op) {

    /* Service register event */
    case BLE_GATT_REGISTER_OP_SVC:
        ESP_LOGD(TAG, "registered service %s with handle=%d",
                 ble_uuid_to_str(ctxt->svc.svc_def->uuid, buf),
                 ctxt->svc.handle);
        break;

    /* Characteristic register event */
    case BLE_GATT_REGISTER_OP_CHR:
        ESP_LOGD(TAG,
                 "registering characteristic %s with "
                 "def_handle=%d val_handle=%d",
                 ble_uuid_to_str(ctxt->chr.chr_def->uuid, buf),
                 ctxt->chr.def_handle, ctxt->chr.val_handle);
        break;

    /* Descriptor register event */
    case BLE_GATT_REGISTER_OP_DSC:
        ESP_LOGD(TAG, "registering descriptor %s with handle=%d",
                 ble_uuid_to_str(ctxt->dsc.dsc_def->uuid, buf),
                 ctxt->dsc.handle);
        break;

    /* Unknown event */
    default:
        assert(0);
        break;
    }
}



void gatt_svr_subscribe_cb(struct ble_gap_event *event) {
    /* Check connection handle */
    if (event->subscribe.conn_handle != BLE_HS_CONN_HANDLE_NONE) {
        ESP_LOGD(TAG, "subscribe event; conn_handle=%d attr_handle=%d",
                 event->subscribe.conn_handle, event->subscribe.attr_handle);
    } else {
        ESP_LOGD(TAG, "subscribe by nimble stack; attr_handle=%d",
                 event->subscribe.attr_handle);
    }

    /* Check attribute handle */
    if (event->subscribe.attr_handle == output1_chr_val_handle) {
        /* Update output1 subscription status */
        output1_chr_conn_handle = event->subscribe.conn_handle;
        output1_chr_conn_handle_inited = true;
        output1_ind_status = event->subscribe.cur_notify;
    } else if (event->subscribe.attr_handle == status_chr_val_handle) {
        /* Update status subscription status */
        status_chr_conn_handle = event->subscribe.conn_handle;
        status_chr_conn_handle_inited = true;
        status_ind_status = event->subscribe.cur_notify;
    } else if (event->subscribe.attr_handle == send_chr_val_handle) {
        /* Update send subscription status */
        send_chr_conn_handle = event->subscribe.conn_handle;
        send_chr_conn_handle_inited = true;
        send_ind_status = event->subscribe.cur_notify;
    } else {
        ESP_LOGW(TAG, "subscribe event for unknown attribute handle: %d", event->subscribe.attr_handle);
    }
}

/*
 *  GATT server initialization
 *      1. Initialize GATT service
 *      2. Update NimBLE host GATT services counter
 *      3. Add GATT services to server
 */
int gatt_svc_init(void) {
    /* Local variables */
    int rc;

    /* 1. GATT service initialization */
    ble_svc_gatt_init();

    /* 2. Update GATT services counter */
    rc = ble_gatts_count_cfg(gatt_svr_svcs);
    if (rc != 0) {
        return rc;
    }

    /* 3. Add GATT services */
    rc = ble_gatts_add_svcs(gatt_svr_svcs);
    if (rc != 0) {
        return rc;
    }

    return 0;
}




/* Private functions */
/*
 *  Stack event callback functions
 *      - on_stack_reset is called when host resets BLE stack due to errors
 *      - on_stack_sync is called when host has synced with controller
 */
static void on_stack_reset(int reason) {
    /* On reset, print reset reason to console */
    ESP_LOGI(TAG, "nimble stack reset, reset reason: %d", reason);
}

static void on_stack_sync(void) {
    /* On stack sync, do advertising initialization */
    adv_init();
}




static void nimble_host_task(void *param) {
    /* Task entry log */
    ESP_LOGD(TAG, "nimble host task has been started!");

    /* This function won't return until nimble_port_stop() is executed */
    nimble_port_run();

    /* Clean up at exit */
    vTaskDelete(NULL);
}

static void output1_task(void *param) {
    /* Task entry log */
    ESP_LOGD(TAG, "output1 task has been started!");

    /* Loop forever */
    while (1) {
        /* Update output1 value every 1 second */
        ESP_LOGD(TAG, "output1 updated to %d", orgasm_control_get_pleasure());

        /* Send output1 notification */
        send_output1();

        /* Sleep */
        vTaskDelay(1000);
    }

    /* Clean up at exit */
    vTaskDelete(NULL);
}



void ble_host_config_init(void) {
    int rc;
    esp_err_t ret;

    /* NimBLE stack initialization */
    ret = nimble_port_init();
    if (ret != ESP_OK) {
        ESP_LOGE(TAG, "failed to initialize nimble stack, error code: %d ",
                 ret);
        return;
    }

    /* Set host callbacks */
    ble_hs_cfg.reset_cb = on_stack_reset;
    ble_hs_cfg.sync_cb = on_stack_sync;
    ble_hs_cfg.gatts_register_cb = gatt_svr_register_cb;
    ble_hs_cfg.store_status_cb = ble_store_util_status_rr;

    /* Configure MTU to support 512-byte notifications */
    /* MTU = payload + 3 bytes overhead, so 515 allows 512-byte payload */
    rc = ble_att_set_preferred_mtu(515);
    if (rc != 0) {
        ESP_LOGE(TAG, "failed to set preferred MTU, error code: %d", rc);
    } else {
        ESP_LOGI(TAG, "preferred MTU set to 515 bytes");
    }

    /* Store host configuration */
    ble_store_config_init();

    /* GAP service initialization */
    rc = gap_init();
    if (rc != 0) {
        ESP_LOGE(TAG, "failed to initialize GAP service, error code: %d", rc);
        return;
    }

    /* GATT server initialization */
    rc = gatt_svc_init();
    if (rc != 0) {
        ESP_LOGE(TAG, "failed to initialize GATT server, error code: %d", rc);
        return;
    }

 

    /* Start NimBLE host task thread and return */
    xTaskCreate(nimble_host_task, "NimBLE Host", 4*1024, NULL, 5, NULL);

}

