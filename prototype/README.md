# prototype

320×240 逻辑画布的纯静态点击原型，用来评审界面与交互；无构建、无框架、无外部请求。

```bash
# 在仓库根执行
python -m http.server 8124
# http://127.0.0.1:8124/prototype/
```

- `index.html` 只有外壳，页面由 `js/app.js` 按哈希路由渲染。
- `js/data.js` 是展示数据；`js/inventory-data.js` 由 `tools/assets/import_compendium_assets.py` 生成。
- `js/quest-data.js` 是 LOG 页完整任务数据（15 主线 + 76 支线，官方中文译名 + 自写梗概），由 `tools/gen_quest_js.py` 从 `tools/quest_data_main.py` / `quest_data_side.py` 生成。
- `js/compendium-data.js` 是**海拉鲁图鉴全量数据**（394 条 = 官方 389 条 + 大师模式 5 条金色怪），由 `tools/gen_compendium_js.py` 从 `tools/compendium_all.json`（官方 API 元数据）+ `tools/cn_*.py`（中文译名）生成；图片取 `assets/raw/03_compendium/BOTW` + `master_mode-BOTW`（已铺位到 `assets/gen/prototype/`）。
- 图片走相对路径：`../assets/gen/prototype/`、`../assets/gen/firmware/`（少量借用），音效走 `../assets/audio/`。
  因此**本目录必须与 `assets/` 同级**，换成别的服务器根会 404。
- 字体在 `fonts/`（Calamity woff2），只覆盖拉丁字母与数字。

页面、路由、三键语义、交互手感见 [../docs/prototype/pages.md](../docs/prototype/pages.md)，
五关规则与图鉴/相册规则见 [../docs/prototype/trials.md](../docs/prototype/trials.md)。
