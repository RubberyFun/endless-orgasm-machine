## Configuration

Please see `data/config.json` file.
If a configuration is changed using the UI it will be saved on the device itself.  There is not currently a way to get the device's config.json back to a computer but most of its contents are transmitted via websocket when the UI first connects.  This is logged by the UI in the browser console.  The file at [/data/config.json](/data/config.json) will overwrite any changes previously saved on the ESP32 when ```PlatformIO -> Project Tasks -> esp32dev -> Platform -> Upload Filesystem Image``` is run.

Here is a quick summary of config variables:

|Key|Type|Default|Note|
|---|----|---|---|
|`wifi_ssid`|String|""|Your WiFi SSID.|
|`wifi_key`|String|""|Your WiFi Password.|
|`wifi_on`|Boolean|false|Enable WiFi and the Websocket server. Cannot be enabled if AzureFang is on.|
|`bt_display_name`|String|"Libotoy"|BT device name.  Currently emulates MonsterPub device for Xtoys compatibility.|
|`bt_on`|Boolean|true|Enable BT connectivity.|
|`force_bt_coex`|Boolean|false|Force BT and WiFi at the same time.|
|`led_brightness`|Byte|128|Status LED maximum brightness.|
|`websocket_port`|Int|80|Port to listen for incoming Websocket connections.|
|`use_ssl`|Boolean|true|Enable SSL server, which is a bit annoying to accept unsigned certificates but required for xtoys compatibility|
|`hostname`|String|"eom3k"|Local hostname for your device.|
|`chart_window_s`|Int|5|The number of seconds to display in the chart history.  Higher numbers can cause sluggish behavior on slower devices|
|`max_denied`|Int|20|Maximum number of denials before forcing an orgasm (in orgasm mode).|
|`initial_pleasure`|Byte|10|The minimum speed the motor will start at in endless & orgasm mode.|
|`max_pleasure`|Byte|255|Maximum speed for the motor in auto-ramp mode.|
|`motor_ramp_time_s`|Int|30|The time it takes for the motor to reach Motor Max Speed in endless & orgasm mode.|
|`edge_delay`|Int|10|Minimum time (s) after edge detection before resuming stimulation.|
|`max_additional_delay`|Int|10|Maximum time (s) that can be added to the edge delay before resuming stimulation. A random number will be picked between 0 and this setting each cycle. 0 to disable.|
|`minimum_on_time`|Int|1|Time (s) after stimulation starts before edge detection is resumed.|
|`pressure_smoothing`|Byte|5|Number of samples to take an average of. Higher results in lag and lower resolution!|
|`classic_serial`|Boolean|false|Output continuous stream of arousal data over serial for backwards compatibility with other software.|
|`sensitivity_threshold`|12 bit Int (4096)|1024|The arousal threshold for orgasm detection. Lower values stop sooner.|
|`mid_threshold`|12 bit Int (4096)|512| The start of the warning zone for approaching arousal.  Changes lights to yellow.|
|`update_frequency_hz`|Int|50|Update frequency for pressure readings and arousal steps. Higher = crash your serial monitor.|
|`sensor_sensitivity`|Byte|128|Pressure sensor prescaling.|
|`use_average_values`|Boolean|false|Use average values when calculating arousal. This smooths noisy data.|
|`vibration_mode`|VibrationMode|RampStop|Vibration Mode for main vibrator control.|
|`use_post_orgasm`|Boolean|false|Use post-orgasm torture mode and functionality.|
|`clench_pressure_sensitivity`|Int|200|Minimum additional Arousal level to detect clench. See manual.|
|`clench_time_to_orgasm_ms`|Int|1500|Threshold variable that is milliseconds count of clench to detect orgasm. See manual.|
|`clench_detector_in_edging`|Boolean|false|Use the clench detector to adjust Arousal. See manual.|
|`auto_edging_duration_minutes`|Int|30|How long to edge before permiting an orgasm.|
|`post_orgasm_duration_seconds`|Int|10|How long to stimulate after orgasm detected.|
|`edge_menu_lock`|Boolean|false|Deny access to menu starting in the edging session.|
|`post_orgasm_menu_lock`|Boolean|false|Deny access to menu starting after orgasm detected.|
|`max_clench_duration_ms`|Int|3000|Duration the clench detector can raise arousal if clench detector turned on in edging session.|
|`clench_time_threshold_ms`|Int|900|Threshold variable that is milliseconds counts to detect the start of clench.|
