# v4 图集提示词与输入

使用内置 imagegen，透明背景。输出路径和来源的权威记录见 [素材来源](../docs/assets/provenance.md#场景与-hud-补件-v4)。以下为本轮生成规格，英文组件顺序与源图区域映射对应。

## 场景补件

Reference: gallery_magnesis_effect.png (actual BOTW shrine materials, ornate metal, portcullis and lighting).

Production game asset sheet for a 320×240 three-button Breath of the Wild prototype. Transparent PNG, 4 columns × 2 rows of isolated props. Orthographic side view, flat walkable tops, clean silhouettes, cool daylight, painted cel-shaded BOTW render. Row 1: weathered grey shrine stone shore platform; dark carved shrine bridge abutment; narrow iron portcullis with ancient stone cap and cyan detail; raised shrine stone plinth. Row 2: horizontal grassy dirt road segment; cyan-glowing destination pedestal; water ripple splash; golden Stasis force arrow with stacked chevrons. No labels, grid, background, floor shadow, Link or extra objects. Real alpha; intended for separate sprite sampling.

## 特效

Reference: gallery_magnesis_effect.png (cyan Sheikah energy palette).

One transparent VFX sprite sheet matching Breath of the Wild rune interactions, 4 columns × 2 rows, isolated effects. Row 1: four consecutive frames of the same remote bomb explosion — cyan-white ignition, expanding blue flame, larger dissipating wisps, fading sparks. Row 2: descending cyan amiibo summoning light shaft, soft translucent chest contact shadow, circular cyan Sheikah activation wave with ancient traces, gold upward reward burst with star particles. No scenery, objects, text, borders or smoke background. Real alpha including glow. Not neon science fiction.

## HUD（用户否决，当前不使用）

References: topbar_ingame.png and gallery_magnesis_effect.png.

Production raster HUD kit matching Breath of the Wild Sheikah Slate: worn ancient slate, fine cyan lines, ivory selection corners. Transparent sheet, 4 columns × 4 rows, isolated components, no labels/dividers. Row 1: empty wide slate button; ivory corner selection frame with transparent center; empty slate panel with spiral texture; cyan photo recognition frame. Row 2: green Stamina Wheel; ivory tunic category icon; ivory right page arrow; swimming wave. Row 3: climbing mountain; fire resistance flame; shrine map glyph; tower map glyph. Row 4: settlement hut; cyan location pin; active signal arcs; inactive signal arcs. No words, invented letters or backgrounds outside components. Actual alpha. Individual reusable components, not a complete screen.

生成结果没有严格遵循等格布局，因此实现使用测量后的实际矩形区域，未按假定网格裁切，也未用脚本加工图片像素。
