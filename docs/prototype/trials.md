# 五个试炼的规则

每个符文是一个**固定视角、可完成、可失败、可重试**的小场景，不是开放世界。

| 试炼 | 操作 | 完成条件 | 失败/回退 |
|---|---|---|---|
| 遥控炸弹（圆/方两种形态） | UP/DOWN 调落点，OK 生成、投掷、引爆 | 在石墙附近引爆，炸开通路 | 单弹冷却，落点无效时不可投掷 |
| 磁力抓取 | UP/DOWN 选目标，OK 抓取；抓取后移动，长按 UP 换轴，OK 放下 | 金属板对齐两侧桥台并稳定落下 | 越界回位；落位误差超限则 550 ms 后回位 |
| 静止器 | OK 锁定，之后连续 OK 蓄力，UP/DOWN 选施力方向 | 蓄力 ≥4 且方向正确，石块撞开障碍 | 冻结 10 s 后自动解除，冷却 10 s；最多 6 次敲击 |
| 制冰器 | UP/DOWN 选水面，OK 生成冰柱；对已有冰柱 OK 碎裂 | 在闸门下方生成冰柱顶起闸门 | 冰柱上限 3 根，第 4 根顶掉最早的；只有闸门下方那根能顶门 |
| 相机 | UP/DOWN 平移取景，长按 UP 切换 1.0×/1.5×，OK 快门 | 拍下并保存五个图鉴目标 | 被岩石遮挡或未进取景框不算命中 |

## 固件侧常量

`STASIS_MS=10000`、`STASIS_COOLDOWN_MS=10000`、`STASIS_MAX_HITS=6`、`BOMB_COOLDOWN_MS=2500`、
`ICE_COOLDOWN_MS=800`、`GAME_MAX_STEP_MS=100`、`PHOTO_CAPACITY=8`、`SUBJECT_COUNT=5`。
实现在 `firmware/main/game/`（`bomb/magnet/stasis/cryonis/camera` 各自独立，统一走
`game_init/game_input/game_step/game_reset`，相机另有 `camera_snapshot`）。

## 图鉴与相册

- 图鉴只有**拍照才解锁**：`progress_add_photo` 返回 fresh 才发「发现」事件，未登记条目显示 `?`。
- 图鉴分五类，每类收录 5 条示例（宝物 4 条），编号与照片对齐原版图鉴；
  分类进度显示游戏真实总数（生物 83 + 怪物 81 + 材料 36 + 装备 185 + 宝物 4 = 389）。
- 相册容量 8 张（`PHOTO_CAPACITY`），满后快门提示先删除；新照片带 `NEW` 角标。
- 五个目标全部登记后 `game_complete`，记录页对应条目打勾。

## 进度存储

`firmware/main/game/progress.c` 用带版本号与 FNV 校验的编码写入 NVS（命名空间 `slate_v2`），
提交点是「试炼通关 / 设置保存 / 设置页退出」；`store.c` 只负责读写，不解释语义。
