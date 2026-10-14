#include "util/running_average.h"
#include <stdlib.h>
#include "esp_log.h"

void running_average_init(running_average_t** ra, size_t window_size) {
    if ( window_size == 0) {
         if (window_size == 0) {
             ESP_LOGI("RA", "  window_size is 0");
             window_size = 5;
         }
         if (ra == NULL) {
             ESP_LOGI("RA", "  ra is NULL");
             //ra = (running_average_t**)malloc(sizeof(running_average_t*));
         }
    }

    running_average_t* init = (running_average_t*)malloc(sizeof(running_average_t));

    if (init == NULL)
        return;

    // calloc: the buffer must start zeroed, since sum subtracts each slot as it is overwritten.
    init->buffer = (uint16_t*)calloc(window_size, sizeof(uint16_t));
    if (init->buffer == NULL) {
        free(init);
        return;
    }
    init->window = window_size;
    init->index = 0;
    init->value = 0;
    init->sum = 0;
    init->averaged = 0;

    *ra = init;
}

void running_average_add_value(running_average_t* ra, uint16_t value) {
    if (ra == NULL) {
        ESP_LOGI("RA", "running_average_add_value: ra is NULL");
        return;
    }

    ra->sum -= ra->buffer[ra->index];
    ra->buffer[ra->index] = value;
    ra->sum = ra->sum + value;
    ra->index = (ra->index + 1) % ra->window;
    ra->averaged = ra->sum / ra->window;

    // if (ra->averaged < 100) {
    //    ESP_LOGI("RA", "%d,%d,%d,%d,%d", ra->index, ra->window, ra->value, ra->sum, ra->buffer[ra->index]);
    // }

}

uint16_t running_average_get_average(running_average_t* ra) {
    if (ra == NULL) {
        // ESP_LOGI("RA", "running_average_get_average: ra is NULL");
        return 0;
    }

    return ra->averaged;
}

void running_average_dispose(running_average_t* ra) {
    if (ra == NULL)
        return;

    free(ra->buffer);
    free(ra);
}