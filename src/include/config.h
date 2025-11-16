#ifndef __config_h
#define __config_h

#ifdef __cplusplus
extern "C" {
#endif

#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>

#define MOTOR1_ENABLED 1
#define MOTOR2_ENABLED 1

// SD card files:
#define CONFIG_PATH_MAX 64

// This is just a default, others can be loaded after boot.
static const char* CONFIG_FILENAME = "/spiffs/config.json";

// String Lengths
#define WIFI_SSID_MAX_LEN 64
#define WIFI_KEY_MAX_LEN 64

#define GATTS_SERVICE_EOM_UUID     0x6969
#define GATTS_CHAR_STATUS_UUID     0x696A
#define GATTS_CHAR_UPDATE_UUID     0x696B
#define GATTS_CHAR_CONFIG_UUID     0x696C

#define GATTS_SERVICE1_UUID        0x6000
#define GATTS_OUTPUT1_CHAR_UUID    0x6031
#define GATTS_OUTPUT2_CHAR_UUID    0x1903
#define GATTS_INPUT1_CHAR_UUID     0x6003
#define GATTS_INPUT2_CHAR_UUID     0x6004

//which pin to read analog pressure sensor from
//This can accept any ADC_UNIT_1 channel...so ADC_CHANNEL_0 to ADC_CHANNEL_7
#define PRESSURE_GPIO ADC_CHANNEL_0
//ADC_CHANNEL_0 is gpio 5 on Xaio Seed ESP32-S3, labeled D5 (LED pin is D21) 
//ADC_CHANNEL_0 is gpio 1 on Waveshare ESP32-S3, labeled 1  (LED pin is 21, ws2812)
//ADC_CHANNEL_0 is gpio 36 on NodeMCU ESP32S, labeled SVP. (another channel might be more accurate)  (LED pin is 2)
//ADC_CHANNEL_0 is gpio 36 on Wroom32, labeled VP  (LED pin is 2)
//ADC_CHANNEL_0 is gpio 0 on Waveshare ESP32-C6-LCD-1.47 labeled 0 (LED pin is 8)

//#define LED_GPIO 2 // This is handled per board in platformio.ini now

#define EOM_HAL_PRESSURE_MAX 0x0FFF // 12 bits ADC reading is standard for esp32

#define DEFAULT_AMBIENT_RESSURE 0
#define DEFAULT_PRESSURE_SENSITIVITY 3

extern bool isConnected;

enum command_err {
    CMD_FAIL = -1,
    CMD_OK = 0,
    CMD_ARG_ERR = 1,
    CMD_SUBCOMMAND_NOT_FOUND = 253,
    CMD_SUBCOMMAND_REQUIRED = 254,
    CMD_NOT_FOUND = 255,
};

typedef enum command_err command_err_t;

//typedef command_err_t (*command_func_t)(int argc, char** argv, console_t* console);

// Vibration Modes
// See vibration_mode_controller.h for more.

enum vibration_mode { RampStop = 1, Depletion = 2, Enhancement = 3, Pattern = 4, GlobalSync = 0 };

typedef enum vibration_mode vibration_mode_t;

/**
 * Main Configuration Struct!
 *
 * Place all presistent runtime config variables in here, and be sure to add the appropriate def
 * in config.c!
 */

// Increment this if you need to trigger a migration on the system config file.
// Your migration should be defined in config_migrations.c
#define SYSTEM_CONFIG_FILE_VERSION 3

struct config {
    // Private Things, do not erase!
    int _version;
    char _filename[CONFIG_PATH_MAX + 1];

    //= Networking

    // Your WiFi SSID
    char wifi_ssid[WIFI_SSID_MAX_LEN + 1];
    // Your WiFi Password.
    char wifi_key[WIFI_KEY_MAX_LEN + 1];
    // True to enable WiFi / Websocket server.
    bool wifi_on;
    
    // Access Point Mode Configuration
    // True to enable AP mode instead of STA mode
    bool wifi_ap_mode;
    bool wifi_ap_failover;
    // Access Point SSID
    char ap_ssid[WIFI_SSID_MAX_LEN + 1];
    // Access Point Password (leave empty for open network)
    char ap_password[WIFI_KEY_MAX_LEN + 1];
    // Access Point WiFi channel (1-13)
    uint8_t ap_channel;
    // Maximum number of stations that can connect to AP (1-4)
    uint8_t ap_max_connections;

    // AzureFang* device name, you might wanna change this.
    char bt_display_name[64];
    // True to enable the AzureFang connection.
    bool bt_on;
    // True to force AzureFang and WiFi at the same time**.
    bool force_bt_coex;

    //= UI And Stuff

    // Chart window size in seconds
    uint8_t chart_window_s;
    // LED Ring max brightness, only for NoGasm+.
    uint8_t led_brightness;
    // Time, in seconds, before the screen dims. 0 to disable.
    int screen_dim_seconds;
    // Time, in seconds, before the screen turns off. 0 to disable.
    int screen_timeout_seconds;
    bool enable_screensaver;
    char language_file_name[CONFIG_PATH_MAX + 1];
    // Reverse the scroll direction in menus.
    bool reverse_menu_scroll;

    //= Console

    bool store_command_history;
    bool console_basic_mode;

    //= Server

    // Port to listen for incoming Websocket connections.
    int websocket_port;
    // Output continuous stream of arousal data over serial for backwards compatibility with other
    // software.
    bool classic_serial;
    // Enable SSL server, which will eat all your RAM!
    bool use_ssl;
    // Path to cacert.pem, which will be needed to run SSL server.
    char* ssl_servercert_path;
    // Path to prvtkey.pem, which will be needed to run SSL server.
    char* ssl_prvtkey_path;
    // Local hostname for your device.
    char hostname[64];

    //= Orgasms and Stuff

    // Maximum number of denials before forcing an orgasm (in orgasm mode).
    uint8_t max_denied;
    // Maximum pleasure in endless & orgasm mode.
    uint8_t max_pleasure;
    // The minimum pleasure to start at in endless & orgasm mode.
    uint8_t initial_pleasure;
    // Minimum time (s) after edge detection before resuming stimulation.
    uint8_t edge_delay;
    // Maximum time (s) that can be added to the edge delay before resuming stimulation. A random
    // number will be picked between 0 and this setting each cycle. 0 to disable.
    uint8_t max_additional_delay;
    // Time (s) after stimulation starts before edge detection is resumed.
    uint8_t minimum_on_time;
    // Number of samples to take an average of. Higher results in lag and lower resolution!
    uint8_t pressure_smoothing;
    // The arousal threshold for orgasm detection. Lower = sooner cutoff.
    uint16_t sensitivity_threshold;
    // The time it takes for the motor to reach `max_pleasure` in auto ramp mode.
    uint16_t mid_threshold;
    // The start of the warning zone for approaching arousal.  Changes lights to yellow.
    uint8_t motor_ramp_time_s;
    // Update frequency for pressure readings and arousal steps. Higher = crash your serial monitor.
    uint8_t update_frequency_hz;
    // Analog pressure prescaling. Adjust this until the pressure is ~60-70%
    uint8_t sensor_sensitivity;
    // Use average values when calculating arousal. This smooths noisy data.
    bool use_average_values;

    //= Vibration Output Mode

    // Vibration Mode for main vibrator control.
    int vibration_mode;

    //= Post orgasm torure stuff

    // Use post-orgasm torture mode and functionality.
    bool use_post_orgasm;
    // Threshold over arousal to detect a clench : Lower values increase sensitivity
    int clench_pressure_sensitivity;
    // Duration the clench detector can raise arousal if clench detector turned on in edging session
    int max_clench_duration_ms;
    // Threshold variable that is milliseconds counts of clench to detect orgasm
    int clench_time_to_orgasm_ms;
    // Threshold variable that is milliseconds counts to detect the start of clench
    int clench_time_threshold_ms;
    // Use the clench detector to adjust Arousal
    bool clench_detector_in_edging;
    // How long to edge before permiting an orgasm
    int auto_edging_duration_minutes;
    // How long to stimulate after orgasm detected
    int post_orgasm_duration_seconds;
    // Deny access to menu starting in the edging session
    bool edge_menu_lock;
    // Deny access to menu starting after orgasm detected
    bool post_orgasm_menu_lock;

    //= Internal System Configuration (Update only if you know what you're doing)

    // Remote update server URL. You may change this to OTA update other versions.
    //char* remote_update_url;
};

typedef struct config config_t;

extern config_t Config;

// These operations work on the global Config struct. For more lower-level access, check out
// the ones presented on config_defs.h
void config_enqueue_save(long save_at_ms);
bool get_config_value(const char* option, char* buffer, size_t len);
bool set_config_value(const char* option, const char* value, bool* require_reboot);

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

#ifdef __cplusplus
}
#endif

#endif
