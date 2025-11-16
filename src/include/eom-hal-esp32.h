#ifndef __eom_hal_hpp
#define __eom_hal_hpp

#include <stddef.h>
#include <stdint.h>
#include "led_strip.h"



//=== Housekeeping

#ifdef __cplusplus
extern "C" {
#endif

//=== Pressure
uint16_t eom_hal_get_pressure_reading(void);
uint8_t eom_hal_get_sensor_sensitivity(void);
void eom_hal_set_sensor_sensitivity(uint8_t sensitivity);
void eom_hal_init_pressure_sensor(void);
void eom_hal_setup_pressure_ambient(void);

//=== Vibration
void eom_hal_set_motor1_speed(uint8_t speed);
void eom_hal_set_motor2_speed(uint8_t speed);
void eom_hal_init_motor(void);

extern led_strip_handle_t led_strip;

typedef struct {
    uint8_t r;
    uint8_t g;
    uint8_t b;
} RGBColor;
void eom_hal_set_led(uint8_t on);
void eom_hal_set_led_mono(uint8_t on);
void eom_hal_set_rgb(uint8_t r, uint8_t g, uint8_t b);
void eom_hal_set_rgb_color(RGBColor* color);
void eom_hal_set_led_flashing(uint8_t flashing);
void eom_hal_led_init(void);    
void eom_hal_set_led_flash_interval(uint16_t interval_ms);
void eom_hal_led_tick(void);
void eom_hal_led_task(void *pvParameter);
led_strip_handle_t configure_led_2812(void);
RGBColor calculate_fade_color(RGBColor color_start, RGBColor color_end, float factor);
extern RGBColor led_color;
extern RGBColor rgb_off;
extern RGBColor rgb_white;
extern RGBColor rgb_red;
extern RGBColor rgb_green;
extern RGBColor rgb_blue;
extern RGBColor rgb_orange;
extern RGBColor rgb_yellow;
extern RGBColor rgb_purple;

#define LED_NUM 1
#define LED_TYPE_MONO 0
#define LED_TYPE_WS2812 1
#define LED_STRIP_RMT_RES_HZ  (3.2 * 1000 * 1000)

#endif
