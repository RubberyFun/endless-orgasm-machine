#include "config.h"
#include "config_defs.h"
#include "esp_log.h"
#include <string.h>

static const char* TAG = "config";

config_t Config = { ._filename = "", ._version = 0 };
bool isConnected = false;

CONFIG_DEFS {
    // WiFi Settings
    CFG_STRING(wifi_ssid, "");
    CFG_STRING(wifi_key, "");
    CFG_BOOL(wifi_on, true);
    
    // Access Point Settings
    CFG_BOOL(wifi_ap_mode, true);
    CFG_STRING(ap_ssid, "EOM");
    CFG_STRING(ap_password, "");
    CFG_NUMBER(ap_channel, 1);
    CFG_NUMBER(ap_max_connections, 4);

    // Bluetooth Settings
    CFG_STRING(bt_display_name, "Libotoy");
    CFG_BOOL(bt_on, true);
    CFG_BOOL(force_bt_coex, true);

    // Console Settings
    CFG_BOOL(store_command_history, true);
    CFG_BOOL(console_basic_mode, false);

    // Network Settings
    CFG_NUMBER(websocket_port, 80);
    CFG_BOOL(classic_serial, false);
    CFG_BOOL(use_ssl, true);
    CFG_STRING_PTR(ssl_servercert_path, NULL);
    CFG_STRING_PTR(ssl_prvtkey_path, NULL);
    CFG_STRING(hostname, "eom");

    // UI Settings
    CFG_NUMBER(chart_window_s, 5);

    // Orgasm Settings
    CFG_NUMBER(max_denied, 20);
    CFG_NUMBER(max_pleasure, 255);
    CFG_NUMBER(initial_pleasure, 10);
    CFG_NUMBER(edge_delay, 10);
    CFG_NUMBER(max_additional_delay, 10);
    CFG_NUMBER(minimum_on_time, 1);
    CFG_NUMBER(pressure_smoothing, 10);
    CFG_NUMBER(sensitivity_threshold, 1024);
    CFG_NUMBER(mid_threshold, 512);
    CFG_NUMBER(motor_ramp_time_s, 120);
    CFG_NUMBER(update_frequency_hz, 50);
    CFG_NUMBER(sensor_sensitivity, 50);
    CFG_BOOL(use_average_values, true);

    // Vibration Settings
    CFG_ENUM(vibration_mode, vibration_mode_t, Depletion);

    // Post-Orgasm Torture
    CFG_BOOL(use_post_orgasm, false);
    CFG_NUMBER(clench_pressure_sensitivity, 300);
    CFG_NUMBER(clench_time_to_orgasm_ms, 1500);
    CFG_NUMBER(clench_time_threshold_ms, 900);
    CFG_BOOL(clench_detector_in_edging, false);
    CFG_NUMBER(auto_edging_duration_minutes, 30);
    CFG_NUMBER(post_orgasm_duration_seconds, 10);
    CFG_BOOL(post_orgasm_menu_lock, false);
    CFG_BOOL(edge_menu_lock, false);
    CFG_NUMBER(max_clench_duration_ms, 3000);

    // Internal system things, only edit if you know what you're doing.
    //CFG_STRING_PTR(remote_update_url, REMOTE_UPDATE_URL)

    // Please just leave this here and don't ask questions.
    return false;
}