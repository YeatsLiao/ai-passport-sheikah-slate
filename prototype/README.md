# prototype

320×240 逻辑画布的纯静态点击原型，用来评审界面与交互；无构建、无框架、无外部请求。

## 本地预览

前置：可用 Python；从仓库根启动，使 `prototype/` 与 `assets/` 同时可访问。仅监听本机：

```bash
python -m http.server 8124 --bind 127.0.0.1
# http://127.0.0.1:8124/prototype/
```

2026-10-29 已启动本机预览服务，未做浏览器截图或自动化测试；界面与交互待用户逐页查看。加载和交互的验证边界见 [操作入口](../docs/context/RUNBOOK.md#本地原型预览)。

## 资源与入口

- `index.html` 只有外壳，页面由 `js/app.js` 按哈希路由渲染。
- `js/data.js` 是展示数据；`js/inventory-data.js` 由 `tools/assets/import_compendium_assets.py` 生成。
- `js/quest-data.js` 是 LOG 页的中英文任务数据，含全部 DLC 与《异度之刃 2》联动，共 152 条。主线、神庙挑战、迷你挑战三个分类共用目录与详情路由；数据源、数量明细及生成方式见 [原型任务数据](../tools/README.md#原型任务数据)，译名核验边界见 [任务来源](../docs/assets/provenance.md#任务数据)。
- `js/compendium-data.js` 是**海拉鲁图鉴全量数据**（394 条 = 官方 389 条 + 大师模式 5 条金色怪），由 `tools/gen_compendium_js.py` 从 `tools/compendium_all.json`（官方 API 元数据）+ `tools/cn_*.py`（中文译名）生成；图片取 `assets/raw/03_compendium/BOTW` + `master_mode-BOTW`（已铺位到 `assets/gen/prototype/`）。
- 图片走相对路径：`../assets/gen/prototype/`、`../assets/gen/firmware/`（少量借用），音效走 `../assets/audio/`。
  因此**本目录必须与 `assets/` 同级**，换成别的服务器根会 404。
- 英文沿用 `fonts/HyliaSerifBeta-Regular.ttf`；中文统一加载 `../assets/raw/07_fonts/SourceHanSansSC-Medium.otf`（思源黑体 Medium，完整字库约 16.5 MB）。标题、正文、数字样式共用字体栈；这是贴近 BotW 正文的风格替代，非实机原版字库。来源与许可见 [素材来源](../docs/assets/provenance.md#中文字体)。Calamity woff2 保留为素材。
- `js/rune-games.js` 为九项符文的直接操控与暂停入口，其余六项逻辑在 `js/rune-extras.js`。`js/rune-art.js` 统一映射 v2 场景与透明物件图集，均参考实机生成，见 [素材来源](../docs/assets/provenance.md#九项符文场景与透明物件-v2)。相机暂只临时预览，相册后续再讨论。

页面、路由、三键语义、交互手感见 [../docs/prototype/pages.md](../docs/prototype/pages.md)，
五关规则与图鉴/相册规则见 [../docs/prototype/trials.md](../docs/prototype/trials.md)。
