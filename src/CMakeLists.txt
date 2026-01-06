FILE(GLOB_RECURSE app_sources ${CMAKE_SOURCE_DIR}/src/*.*)
idf_component_register(
        SRCS ${app_sources}
        INCLUDE_DIRS "include"
        PRIV_REQUIRES "nvs_flash" "spiffs" "esp_driver_dac" "esp_adc" "led_strip" 
        # "hx711" "esp_idf_lib_helpers"
)

set(SPIFFS_IMAGE_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../examples/certs")
add_custom_target(spiffs_image ALL
    COMMAND ${IDF_PATH}/components/spiffs/spiffsgen.py
            --chip ${IDF_TARGET}
            --partition spiffs
            --input "${SPIFFS_IMAGE_DIR}"
            --output "${CMAKE_CURRENT_SOURCE_DIR}/../examples/certs/spiffs.bin"
    DEPENDS ${SPIFFS_IMAGE_DIR}
    COMMENT "Generating SPIFFS image"
)
add_custom_command(TARGET spiffs_image POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
            "${CMAKE_CURRENT_SOURCE_DIR}/../data/spiffs.bin"
            "${CMAKE_CURRENT_SOURCE_DIR}/../data/spiffs.bin" # Copy to build directory for flashing
)