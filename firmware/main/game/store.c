// NVS只负责字节存取，校验与默认值逻辑在可测试的progress模块中。
#include "store.h"
#include "nvs.h"
#include "esp_log.h"
progress_t store_progress;
void store_load(void) {
    progress_default(&store_progress);
    nvs_handle_t h;
    if (nvs_open("slate_v2",NVS_READONLY,&h)!=ESP_OK) return;
    uint8_t data[PROGRESS_BYTES]; size_t size=sizeof(data);
    if (nvs_get_blob(h,"progress",data,&size)==ESP_OK && !progress_decode(&store_progress,data,size))
        ESP_LOGW("progress","进度校验失败，使用默认值");
    nvs_close(h);
}
bool store_save(void) {
    uint8_t data[PROGRESS_BYTES]; progress_encode(&store_progress,data);
    nvs_handle_t h;
    esp_err_t err=nvs_open("slate_v2",NVS_READWRITE,&h);
    if (err!=ESP_OK) return false;
    err=nvs_set_blob(h,"progress",data,sizeof(data));
    if (err==ESP_OK) err=nvs_commit(h);
    nvs_close(h);
    if (err!=ESP_OK) ESP_LOGW("progress","保存失败：%s",esp_err_to_name(err));
    return err==ESP_OK;
}
