# 全离线固件 V1 实现说明

2026-10-31：用户已烧录先前版本并提供 15 张实机截图，确认存在原型一致性、图像与音频问题。用户随后烧录阅读/相册/游戏版本并反馈接近原型，再提供中英文待机、相册与方弹画面。用户又授权六款待机风格、独立计时与 USB 校时；本轮相关修订只完成代码、资源生成和静态核验，未重新编译、烧录或实机验收；不宣称已还原原型。

## 当前入口与范围

[firmware/main/CMakeLists.txt](../../firmware/main/CMakeLists.txt) 只登记 `offline/` 新应用及既有 `game/input.c`。旧 `page_*.c`、`game_view.c`、五关模型、合成音与旧图像 C 数组暂留作迁移参考，不参与 V1 应用构建。BSP 继续复用，未更换引脚；SPI 初始配置按方案降为保守 40MHz，修正了双缓冲内存注释，不初始化 Wi-Fi/BLE 或网络客户端。

- [offline/main.c](../../firmware/main/offline/main.c)：BSP 初始化、事件队列、650ms OK 长按分类，方向键按下即时传入页面、页面代际隔离；队列溢出丢弃未完成手势。NVS 初始化失败只记录错误并停止启动，不自动擦除用户数据。
- [offline/app.c](../../firmware/main/offline/app.c)：待机、八项目录、5×4 装备、九项符文、三级地图、自动滚动图鉴/日志、固定相册和设置；当前页面对象生命周期、暂停/重试与音效事件。
- [offline/model.c](../../firmware/main/offline/model.c)：九项模拟状态机，逻辑像素浮点坐标与毫秒时钟；几何数据直接从原型常量导出，不含 LVGL 绘制逻辑。摩托为原型的一处岩石和两处沟壑，200ms 跳跃预输入、140ms 离地容错、1.2 秒刹车。暂停停止模型时钟，离页保留会话状态；实际物理与动画手感待设备核验。
- [offline/resources.c](../../firmware/main/offline/resources.c)：资源分区映射、索引/范围/CRC 校验、RGB565/RGB565A8（兼容旧 ARGB8888）描述符，排序索引二分查找及 R: 只读 LVGL 文件系统。pack 索引 CRC 同时写入生成的 data.c，固件与资源不匹配时报错；单项资源校验错误也进入错误页。
- [offline/audio.c](../../firmware/main/offline/audio.c)：最多六路 Flash-backed IMA ADPCM → 512 采样 PCM 混音 → I2S，任务优先级 5、栈 8KB（高于默认 LVGL 的 4），避免连续供音被绘图挤占；codec 音量只在改变时设置。同类循环声不重复启动，支持停止单类声音，普通音效不清空其他声部，完成/暂停/返回/静音仍可全停。不在 LVGL 线程写 PCM；实际欠载、堆峰值和听感待验证。
- [offline/state.c](../../firmware/main/offline/state.c)：512 字节 V2 显式字段编码与 CRC，沿用 NVS 命名空间 slate_offline 并读取前版 128 字节 V1；保存九项完成、394 条图鉴登记、152 条任务标记、177 个地点发现、五个装备槽、模拟补给计数与设置、固定相册的删除掩码（字节 117～118），保留兼容读取旧 12 张虚拟照片参数。合并改动后将不可变快照交给后台 NVS 任务，队列只保留最新一份；排队不代表已写入，诊断区分待写入与失败，失败重试。待机扩展以保留字节 136～142 的 `SB1\1` 标识、进入待机枚举/风格/轮换枚举编码，旧 V2 无扩展时沿用默认值；保持总长与 CRC，不擦除旧数据。没有自动迁移旧五关存档。

## 三键操作

- 待机：上下逐次切 E～J，短 OK 目录；无屏幕启动按钮。前三款横屏，后三款竖屏（把设备旋转查看）；退出待机恢复 320×240。风格名只短暂显示，底部署名居中，待机不显示电池图标或百分比。
- 目录与菜单：上下选择，短 OK 确认，长 OK 逐层返回。普通导航按住 380ms 后每 120ms 连发；菜单或页面变化隔离未完成手势。
- 装备：上下依次选择 5×4 装备格，短 OK 打开小菜单执行装备/卸下、切换分类或取消；长 OK 逐层关闭。说明完整换行，停留 1.5 秒后以 14px/s 自动滚动，底部停留 1.8 秒再循环；长标题水平滚动。
- 图鉴/日志：直接显示条目，▲▼ 上一个/下一个，正文自动滚动；OK 打开登记/完成、切换分类、关闭菜单，分类取消不改变当前分类。保留各分类条目位置；菜单打开时暂停正文滚动。
- 游戏：短 OK 主动作；上下做各自能力的单轴操作；长 OK 打开/关闭暂停层，暂停层可继续、重新开始、返回符文。长按已消费短按，不要求组合键。连续调节场景使用按住方向的模型输入；制冰、摩托、amiibo、感应器的离散动作不自动连发，按下直接生效。相机暂停菜单为 0.75×/1×/1.5×，照片仅临时预览，确认或长按继续；不写入相册/图鉴。静止器提前释放、感应器切追踪目标在暂停菜单。
- 地图：短 OK 依次选择横移、纵移、缩放；上下执行；长 OK 返回目录。1×/2×/4× 三档预生成地图，自动显示中心附近地点与发现状态，不依赖 GPS。
- 设置：OK 进入/确认数值修改，上下调整；长 OK 取消修改或返回目录。校时先修改草稿，确认才设置系统时钟并保存，取消不改变时钟。提供语言、音量、亮度、扫描线、关闭/30/60/120/300 秒进入待机、关闭/30/60/120/300/600 秒待机后熄屏、手动/15/30/60/300 秒轮换、六款风格、USB 校时说明、手动年月日时分、堆/存档诊断、带确认的重置进度。相册采用原型 12 张固定照片，网格选图、大图上下切换，保留原型标题/时间/地点；删除菜单默认取消并二次确认，重置进度恢复固定相册。

## 已接入内容与取舍

设备数据来自既有原型声明：394 条图鉴、152 条双语日志、24 件装备、177 个命名地点。只创建当前页面对象和可见地图瓦片/标记，详情读取常量字符串。图鉴照片为 88×88 JPEG，固定相册为 72×40 缩略图与 320×240 等比完整大图（底部渐变叠加编号/时间/双语地点），游戏背景为 320×198 RGB565，活动物体为紧裁小 RGB565A8 精灵。

英文使用现有 Hylia Serif，中文沿用原型的思源黑体 Medium 风格替代，裁成 10/12/14/16px、4bpp 的合并字库，未冒称中文是 Hylia 原生字形。待机另外使用只含数字、冒号和短横的 28/40/52px Hylia 时钟字库。字体 C 文本大小不是链接后的 Flash 占用；app 实际大小待以后构建确认。

九项状态机按原型补入：圆弹连续力度/抛物线/二维命中与爆炸，方弹移动平台/落点/二维引爆，磁力自动抬升/两岸支撑/失败倾倒/稳定通过，静止器 10 秒/六击/角度/提前释放/飞行追镜，三冰柱 FIFO/碎冰/闸门/分段跳跃/失败退回，相机遮挡/完整入框/700ms 对焦/临时预览，摩托轮胎碰撞/跳跃容错/落地/撞击，amiibo 扫描/落地待确认/走近/开箱/奖励待确认收取，感应器方向/距离信号/路口/展开与相机发现后解锁蓝夜光草追踪。效果使用原型已有栅格派生，不宣称逐帧还原 CSS。相机发现仅保留本次会话；感应器神庙对应 Namika Ozz Shrine，amiibo 奖励 ID 直接导出原型。没有行为运行验证；amiibo 没有读卡硬件，感应器没有真实环境探测。

装备采用 5×4 分页、分类图标、小菜单和五槽图标反馈，默认林克立绘保持原版素材；尚未实现任意装备组合的外观换装。角色增加站立、行走、操作石板四个姿态；这是小尺寸动作示意，不是完整骨骼或全帧动画。开箱采用掉落、走近、开盖交叉渐变、奖励飞入等分阶段反馈，不宣称还原原作宝箱骨骼动画。

地图最高层为 1536×1280，按需读取 64px JPEG 瓦片；保留现有 177 个命名点位，不补猜缺失的克洛格或宝箱坐标。相机缩放作用于预生成的目标图像和取景判定，背景维持固定全景；不会分配大幅全屏缩放缓冲。相册直接派生原型 ALBUM 固定图片与元数据；旧动态照片存档保留兼容，但当前 UI 不再使用或新增这些记录。它不是传感器照片或 USB 像素截图。待机已按原型重新划分全屏层次，相册已全屏叠加信息，实际对齐仍待用户核验；目录、地图和设置仍有旧布局差异；本轮不将整机一致性标为完成。

待机 E～J 为静谧科技、晨光旷野、古地图、神庙石碑、林间薄雾、极简黑金。前五款从选定设计生成无字背景并派生为 quality=82、320×240 或 240×320 JPEG；黑金款用原生对象绘制，不额外保存全屏图。Logo 以 200×72 透明容器等比派生，眼纹 96×96，按布局缩放；所有时钟、日期、品牌与中英文 Logo 是实时图层，不包含预览的固定 09:41。来源/提示词见 [待机素材记录](../assets/provenance.md#全离线固件补件)。

默认无操作 30 秒进入待机，再从进入待机/最后操作计算 60 秒熄屏；关闭进入待机时，熄屏仍从最后操作计算。游戏运行中不自动待机或熄屏，设置编辑中不自动跳页。轮换默认手动；自动换图不延长熄屏计时，也不按轮换频率写 NVS。屏幕关闭后停止换图，任意键先唤亮并消费该次手势。熄屏只关背光，时钟继续走；CPU 未深睡。OTA、Wi-Fi、BLE 与联网功能均不做。

显示旋转使用本地 LVGL 9.5 `lv_display_set_rotation` 与 esp_lvgl_port 的硬件方向回调；实际面板的方向/边界、换页后的 SPI 刷新仍待实机验证。待机按秒只更新文字，不每秒重建背景。电量独立任务每十秒读取/重试，仅在设置的只读电量行显示百分比；不可用时区分“读取中 / 未应答 / 读取失败 / SOC 未就绪”，有电压时一并显示；页面中自动更新。用户已提供 VERSION=0x0F 应答日志，尚无有效 SOC 证据。无有效时钟只显示 --:--，不出现校准提示，上次校时只作手动预填。

游戏活动物件放在 153px 高的独立裁切区域，说明条为短场景提示，按钮/底栏保留当前动作与方向信息；感应器大目标和靠底部的爆炸缩小，避免侵入文字区。amiibo 奖励图片每帧核对选择 ID，方弹冷却时按钮显示等待。九宫格背景每边向内取 12px，排除源图中靠内的白分隔线；方弹改用同图集的空神庙场景，固定支座和移动平台分别绘制，背景亮度/饱和度在设备派生时收敛。源图与原型文件不改。

电量修订：前轮用户日志已读到 VERSION=0x0F、CONFIG=0x00 和约 4133mV，但 SOC_raw=0xFEE8（高字节大于100）、SOC_ALERT=0x14（UPDATE_FLAG 未置位），单补唤醒未恢复百分比。用户确认使用官方原装设备，官方固件可显示；当前按 [在线官方驱动](https://github.com/FoloToy/ai-passport/blob/main/components/bsp/src/bsp_battery.c) 的配置接入完整电芯参数流程。

80 字节原始表保存于 [电芯参数](../../assets/battery/wanli-500mah-profile2-xil40x-20261020.txt)，来源、选择依据和字节哈希见 [记录](../../assets/battery/manifest.json)；名称为官方当前配置的万锂新能源 500mAh profile2 / XIL40X / 2026-10-20，不代表另行测量了电芯型号。驱动检查 UPDATE_FLAG 和全部80字节；缺失或不符时 CONFIG 0x30→0xF0 进入睡眠，逐字节写入/回读校验，保留告警阈值并置更新标志，CONFIG 0x30→0x00 唤醒并回读。匹配时复用，每次启动最多两次参数写入尝试，后续轮询不持续重写。

就绪检查约5秒，要求 SOC 0～100、非零电压、活动模式和参数标志，并连续两次完整采样有效。零电量仍允许，零电压占位不被当作正常电量；UI 还要求初始化成功。`bsp_battery_read_status()` 保留原始 SOC/配置/标志/电压及各项 I2C 错误，日志包含 `profile verified`、`official profile already matches`、`CW2017 ready` 与 `sample:`。当前仅静态核验，参数写入、读通和充放电过程中的准确度均待实机验证，不以电压估算代替 SOC。

## 资源生成与布局## 资源生成与布局

工具：[build_offline_pack.py](../../tools/pack/build_offline_pack.py)、[export_offline_data.mjs](../../tools/pack/export_offline_data.mjs)。输入为仓库原型数据、用户自备游戏素材和已保存的设备参考生成补件；来源见 [素材记录](../assets/provenance.md#全离线固件补件)。转换工具不联网、不安装依赖。

从仓库根执行：

```powershell
python -B tools/pack/build_offline_pack.py --fonts
```

这只是资源/字体转换，不调用 CMake、编译器或烧录工具。需要现有 Python/Pillow、Node、已安装的 lv_font_conv 与 @resvg/resvg-js；[device_svg.mjs](../../tools/device_svg.mjs) 只将已有 SVG 派生为设备图标，不安装依赖。输出：

- `assets/gen/firmware/offline/resources.bin`：只读设备资源包，并非 app 固件或完整烧录镜像。
- 同目录 `manifest.json`：资源名称、来源、转换后 SHA-256 与字节数。
- `firmware/main/offline/data.c`：只读双语元数据和 pack 索引 CRC。
- `firmware/main/offline/font_10.c`、`font_12.c`、`font_14.c`、`font_16.c`、`font_clock.c`、`font_clock_40.c`、`font_clock_52.c`：派生字库；源字体与原型原图不改动。

[partitions.csv](../../firmware/partitions.csv) 保持 factory 为 0x10000/4MiB，新增 resources data 子类型 0x40，偏移 0x410000、容量 0x3F0000（3.9375MiB）。以后若获授权烧录，app、分区表与资源包必须配套；本轮没有执行。

SLATEPK1 格式：16 字节头，包含 8 字节 magic、条目数、索引 CRC；每条 84 字节，含 64 字节零结尾名称、偏移、长度、宽高、格式和内容 CRC，资源数据四字节对齐。格式 1 为 RGB565，2 为 BGRA 字节序 ARGB8888，3 为 JPEG，4 为 RGB565A8（先 2×w×h 字节 RGB565LE，再 w×h 字节 alpha，stride=2×w），0 为自描述 ADP1 音频。CRC 为 IEEE/zlib，对应 esp_rom_crc32_le(0,...)；不是防篡改签名。

装备/奖励：保留原图透明度并等比缩入 24/32/44px 三套原生尺寸的 RGB565A8 资源，不使用 JPEG 透明底合成或运行时 JPEG 缩放；按调用尺寸供装备格、装备栏与奖励使用；活动精灵使用同类透明格式，已按本地 LVGL 9.5 软件绘制源码核对缩放/旋转支持，默认配置显式开启 RGB565A8。图鉴照片与地图瓦片仍为 JPEG。原型原图保持不变。

ADP1：magic、16000Hz、采样数，再接低半字节优先 IMA ADPCM。各声部从 predictor/index=0 开始并跨块保留状态，循环时重置；源 48kHz PCM 先平均降采样和混单声道，响度有界调整。文件映射由 `export_offline_data.mjs` 提取当前原型 `SFX_FILES`（包括其覆盖），设备不再单独替换完成音；原 WAV 保留不改。六路按原型的移动/爆炸/其他音量权重混合并限幅。该格式会损失高频，真实扬声器听感和播放连续性尚未确认。

2026-10-31 音效触发对齐原型（代码静态核验，未实机听测）：接入待机启动（`startup`，离开待机进目录）、换页（`page`）、进入符文（`activate`）、返回/关闭菜单（`back`）、打开菜单与进入编辑（`menu`）、扫描线开关（`switch_on/off`）、地图缩放（`zoom`）、相册浏览/查看/删除、分类与暂停菜单的选择/确认/取消；摩托起跳按原型改为静音（仅开始骑行发声）；静止器在警告窗口（≤1.683s）暂停后恢复会重播 `stasis_timer`，补偿暂停中断的一次性音。已移植的播放规则：move/cursor/zoom/sensor 同类替换、magnet_move 循环与停手即停、六路上限淘汰最旧、完成音全停、音量为 0 即静音。未移植：原型 35/85ms 同名冷却（设备按键重复 ≥120ms 且同类替换已防叠加）与独立音效开关（设备无该设置项，以音量 0 静音代替）——如需独立开关须扩展设置页与存档布局，另行决定。宝箱落地声、摩托引擎声原型本身未接入，不加替代音。

## 合并烧录包

资源包已注册进固件 flash 目标（`main/CMakeLists.txt` 末尾的 `esptool_py_flash_target_image`），所以 `idf.py flash` 会自动带上 resources.bin，合并命令也会自动包含它。工程构建成功后：

```bash
idf.py merge-bin        # 产出 build/ai-passport-sheikah-slate-full.bin（0x0 起含 bootloader/分区表/app/resources）
```

整包一次写入（可先擦全片）：

```bash
esptool.py --chip esp32c3 --port COMx --baud 460800 write_flash 0x0 build/ai-passport-sheikah-slate-full.bin
```

等价的手工合并（merge-bin 不可用时的 fallback，偏移与 [partitions.csv](../../firmware/partitions.csv) 对应，flash 参数 dio/80m/8MB 与 sdkconfig 一致）：

```bash
esptool.py --chip esp32c3 merge_bin -o merged-binary.bin --flash_mode dio --flash_freq 80m --flash_size 8MB \
  0x0 build/bootloader/bootloader.bin 0x8000 build/partition_table/partition-table.bin \
  0x10000 build/ai-passport-sheikah-slate.bin 0x410000 ../assets/gen/firmware/offline/resources.bin
```

合并包必须用**当次构建**的 app 与当前 resources.bin 生成；旧 build 目录里的产物不能代表当前版本。合并成功不等于实机验收。

## USB 一键校时

先更新配套 app 和资源包，关闭 `idf.py monitor` / 其他串口工具，双击根目录 [sync-time.cmd](../../sync-time.cmd)。它调用 [sync_time.ps1](../../tools/device/sync_time.ps1) 和 [sync_time.py](../../tools/device/sync_time.py)，与截图共用 [serial_connection.ps1](../../tools/device/serial_connection.ps1) 查找已有 Python/pyserial 和选择设备；多设备时仍由用户选端口，不向其他设备重试。也可从根目录执行 `python tools/device/sync_time.py --port COM4`。无联网、复位、烧录或依赖安装；脚本等待成功/失败并保留双击窗口。

协议：`SLATE_TIME_PING` 回复 `@SLATE_TIME_READY 1 UNIX_UTC`；`SLATE_TIME_SET <Unix UTC 秒> <8位十六进制随机标识>` 以 LF 结束，成功回复 `@SLATE_TIME_OK 1 <标识> <秒>`。设备允许 2024～2099 年，忙碌、格式错误或手动编辑时返回 `@SLATE_TIME_ERROR`。成功表示当前系统时钟已设置，不保证 NVS 已落盘；电脑必须核对标识与秒值，写入/等待各有超时，不无限 flush。时区固定北京时间。屏幕关闭不影响计时；完全断电后仍需重新同步或手动校时，不能把上次保存值当成现在。

## USB 截图

已加入 `offline/screenshot.c` 与主机脚本 `tools/device/capture_screen.py`。2026-10-31 USB 收发驱动、直接分块读写及 16KB 截图重绘栈修订后，用户已生成并提供 15 张 320×240 PNG，证明自定义截图链路可输出设备画面；官方网页兼容性仍待验证。截图功能本身不要求改资源包，但本轮装备/声音资源修订要求 app 与 pack 配套更新。

在设备上进入要截图的页面，先用 **Ctrl+]** 退出 `idf.py monitor`（其他串口软件也需关闭）。

也可直接双击仓库根目录的 [`screenshot.cmd`](../../screenshot.cmd)：自动寻找 Python 环境，只有一台 ESP USB 设备时直接使用，多台时询问端口（存在 COM4 时默认 COM4）。图片保存在根目录 `screenshots/` 并自动打开；失败时保留窗口显示错误。电脑脚本现要求带 USB 驱动修复和就绪回复的新版截图固件。

命令行方式：从仓库根目录，在 ESP-IDF 终端执行：

```powershell
python tools/device/capture_screen.py --port COM4
```

成功时在当前目录保存带时间戳的 `slate-*.png` 并打印绝对路径；可用 `--output screen.png` 指定新文件名。串口若不是 COM4，替换为实际 USB Serial/JTAG 端口。脚本不主动切换复位控制线，端口被占用、固件未更新、传输缺失或校验失败会报错，接收失败不会保存图片。默认超时 45 秒。

脚本先发送 `SLATE_SCREENSHOT_PING`，应在 5 秒内收到 `@SLATE_READY 2 FAP_SCREENSHOT_V1 screenshot` 才请求画面。若报命令写入超时，表示端口已打开但 USB 发送未完成，不能直接归因于串口占用；需要先确认已烧录本次驱动修订，启动日志应有 `USB ready: FAP_SCREENSHOT_V1 + screenshot, stack=16384`。脚本写入超时为 5 秒，取消待发送数据，不无限等待 `flush()`，也不自动复位或换端口。若报 `Access is denied`，则连端口都未打开，需要先排除串口占用或驱动访问问题。

协议为 LF 分隔 ASCII：`@SLATE_BEGIN 1 <宽> <高> RGB565LE`（320×240 或 240×320），若干 `@SLATE_ROW x y width hex`，最后 `@SLATE_END pixel_count crc32`；错误为 `@SLATE_ERROR reason`。CRC 为按发送顺序串接像素字节的 IEEE/zlib CRC32，电脑端另检查边界、像素无重复和完整覆盖；其他日志行被忽略。设备在 LVGL `FLUSH_START` 事件、SPI 字节交换之前分行发送数据，再沿用原来的屏幕刷新。无需整屏缓冲；截图期间持有 LVGL 锁，界面动画与按键响应会暂时停顿，单次传输超过 15 秒终止。

另支持官网使用的 `FAP_SCREENSHOT_V1` 命令（无需尾换行），回复 `FAP_SCREENSHOT_V1 <宽> <高> RGB565LE 153600\n`（随显示方向） 后跟恰好 153600 字节 RGB565LE 像素，无文本尾部。全屏重绘时必须按行完整有序，异常则中止；USB 按最多 256B 分块写入 2048B TX 缓冲，接收缓冲 256B。传输窗口暂时替换 ESP 日志输出回调以避免污染二进制，结束后恢复原回调，不重设各模块日志级别。官网协议与驱动前提参考 [官方截图经验说明](https://github.com/FoloToy/ai-passport/blob/main/docs/reference/y2lin/serial-screenshot-protocol.md)；本地较早官方基线尚无该实现。官网兼容性仍待实机验收。

PNG 是软件渲染画面，不是屏幕面板读回；可用于定位排版、字体和素材问题，但不能显示背光、面板反色、接线或 SPI 传输造成的异常。截图时即使屏幕已息屏也可能取得软件画面。与手机实拍对照才能判断颜色差异发生在哪一层。

## 本轮证据与待验证

实际设备资源包 4,068,796 字节，共 1,273 项（含 72 项透明装备资源、12 对相册图、九套场景/符文图标、39 项原型映射音效，及 2026-11-01 起的 4 张可切换屏幕背景 `ui/bg0..3`——各 160×120 RGB565 原生光栅 38,400B，app 内 2× 整数放大铺满；源图为 `assets/gen/prototype/backgrounds/` 下四张 320×240 设计稿，经用户从程序生成的候选中挑选。不用 JPEG/I8/I4 索引格式：整屏解码需 ~150KB 连续堆，C3 放不下；半分辨率四张与单张全分辨率占用相同。待机页不铺背景，沿用六款全屏图）；容量上限 4,128,768 字节，剩余 59,972 字节——已偏紧，新增大资源前先评估。此数字不含 app 中的数据与字体，不能当成整个固件体积。新增资源随 pack 索引 CRC 与 app 配套，更新时需要同时更新 app 和资源分区。

已完成资源生成、Python AST/Node 语法、九个 C 文件语法解析、项目结构字段/API 引用、四套双语及三套数字字库字符覆盖、PowerShell AST、英文固定区域字体宽度、九场景边缘无整条亮分隔线、CMake 登记路径、pack 索引/内容 CRC、偏移/边界/对齐、SHA-256、图像尺寸/格式及 UI 资源引用静态检查。C 语法解析不调用编译器，无法证明目标平台类型检查、编译或链接通过；未运行游戏、自动化行为测试、浏览器截图或烧录，不能宣称固件可编译或可用。

后续首先核对实际解析的 ESP-IDF/LVGL 版本与 API、应用体积、堆低水位与最大块、JPEG 解码峰值、I2S 欠载、NVS 保存失败提示/重试及按键延迟，再由用户分步验收画面和九项成功/失败/暂停/重试。音频格式已固定为设备 16kHz mono，codec 初始化及实际音量仍需设备验证。

组件声明将 LVGL 固定为 9.5.0，避免浮动次版本更改资源/API。LVGL 9.5 的 JPEG 开关与缓存接口已按 [Kconfig](https://raw.githubusercontent.com/lvgl/lvgl/v9.5.0/Kconfig) 和 [图像缓存头文件](https://raw.githubusercontent.com/lvgl/lvgl/v9.5.0/src/misc/cache/instance/lv_image_cache.h) 静态核对；镜像描述符、文件系统和 BSP 的整合仍需以以后真实构建为准。缓存运行时设为 24KiB，页面切换清缓存后复用描述符。

编译、测试与烧录的入口和授权边界仍见 [RUNBOOK](../context/RUNBOOK.md)，本说明不新增授权。
