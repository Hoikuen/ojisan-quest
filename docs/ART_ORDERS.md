# ART_ORDERS — おじさんクエスト 発注パッケージ

見た目をプレースホルダ（Graphics描画）から画像に上げるための **発注 ASSET_LIST ＋ コピペ用プロンプト**。
正本：`~/Developer/games/_starter-kit/pipeline/ART_PIPELINE.md` / `ORDER_PROMPT_TEMPLATES.md`、
キャラ同一性：`_starter-kit/CHARACTER_UNIVERSE.md`。Phaser制約：`~/Developer/games/PHASER3_CONSTRAINTS.md`。

## 運用ルール（厳守）
- **生成素材は本人確認なしに組み込まない**（AGENTS.md）。流れ＝発注→生成（本人）→採否（本人）→**OK後に**抽出・組込（Claude Code）。
- **有名作の固有キャラ/名称/ロゴ/音楽/見た目は使わない**（全部おじさんオリジナル）。
- キャラ素材の背景は **純緑グリーンスクリーン `#00FF00`**、UI/アイコンは **純白 `#FFFFFF`**、背景1枚絵は不透明でOK。影・グラデは出さない。
- **足元をコマ下端に揃える**（床めり込み防止）。**側面・右向き**で統一（左はコードで反転）。
- 抽出は `_starter-kit/pipeline/extract_sheet.py`（手作業しきい値は使わない＝PHASER3_CONSTRAINTS #5/#9）。

---

## ASSET_LIST（今回の発注3点）

| # | 素材 | 納品サイズ / 背景 | ランタイム | 組込先（OK後） | 参照画像 |
|---|---|---|---|---|---|
| 1 | 主人公 **attack ポーズ**（1〜2コマ） | 384×512/コマ・純緑`#00FF00` | 96×128 | `public/assets/sprites/extracted/player/attack.png` → `assets.js` に `playerAttack` 追加 → `BattleScene.attackSteps`/`lunge` で差替 | `public/assets/sprites/extracted/player/idle.png`（必ず添付） |
| 2 | **バトル背景**（夜のオフィス／残業） | 800×600・不透明1枚絵 | 800×600 全面 | `public/assets/backgrounds/battle_office.png` → `assets.js` に追加 → `BattleScene.buildBackground` の Graphics を `add.image` に差替 | 不要（テーマ指定のみ） |
| 3 | **UIセット**（窓枠/ゲージ枠/コマンドアイコン/カーソル） | 各PNG・純白`#FFFFFF` | 下表参照 | `public/assets/ui/` → 9スライス窓枠・アイコンで `drawWindow`/`openMenu` を差替 | 不要（配色指定を厳守） |

> 現状の立ち位置（差替時の整合用）：`GAME_W×H=800×600`、player `(210,360)` H175、enemy `(540,250)` H200、床ライン `y=430`。
> 既知の軽微ズレ：主人公の足元 y=360 と床ライン y=430 が少し浮く。背景差替時に床帯位置と合わせて微調整する。

---

## 発注① 主人公 attack ポーズ（ORDER_TEMPLATES ③＝ポーズ派生）

> **`player/idle.png`（96×128の立ち絵）を参照画像として必ず添付**して投げる。差分＝「攻撃の動き」だけ。

```
（このキャラの idle 立ち絵を添付して）
このキャラの【攻撃ポーズ】のスプライトを作ってください。
添付と「同一人物・同一画風・同一頭身・同一サイズ感」を厳守。別人化・別衣装化はNG（私のオリジナルIP）。

【変化点（これだけ）】
- 右方向へ一歩踏み込み、前のめりに「ぐっ」と攻撃する瞬間の躍動ポーズ。
- 利き手で前方へストレートパンチ（または黒いビジネスバッグを振り抜く）。反対の手は引き、腰を入れる。
- 表情は気合い（口を「むん」と結ぶ／軽く開けて掛け声）。コミカルで力の入った瞬間。
- スーツ・白シャツ・赤ネクタイ・白フチサングラス・黒口ひげ・横分け黒髪・ぽっちゃり丸い体型・ほっぺは維持。

【共通仕様】
A friendly chubby middle-aged Japanese salaryman, late 40s, plump round body, short limbs,
white-framed sunglasses, black mustache, side-parted black hair with a slightly receding hairline,
rosy pink cheeks, soft double chin, dark navy business suit, white shirt, red necktie.
Cute retro 16-bit pixel-art, bold outlines, flat cel shading. Glasses: only a small thin
light-gray reflection at the lens edge, NO large black reflection.
Dynamic forward attack/punch pose, side view facing right, full body, feet aligned to the
bottom edge of the frame, isolated on solid pure green background (#00FF00), no shadow, single character.

【納品】1コマ 384×512（=ランタイム96×128の4倍）。緑背景のまま渡してください（透過はこちらで処理）。
（任意：余裕があれば「振りかぶり(windup)」も同サイズ・同立ち位置で1枚。順番＝windup→attack）
```

**抽出（本人OK後）**
```bash
cd ~/Developer/games/ojisan-quest
python3 ~/Developer/games/_starter-kit/pipeline/extract_sheet.py \
  --src <納品attack.png> --out public/assets/sprites/extracted/player \
  --cols 1 --rows 1 --out-w 96 --out-h 128 --frames attack --bg green --preview
# windupも来たら: --cols 2 --rows 1 --frames attack_windup,attack
```

---

## 発注② バトル背景（夜のオフィス／残業の魔物）（ORDER_TEMPLATES ④）

```
ターン制RPGの戦闘背景イラストを1枚作ってください。
【テーマ】夜の会社オフィスのフロア内部。残業で人けがなく、蛍光灯の一部が消えて薄暗い。
窓の外は夜の都市。机・椅子・PC・書類の山・コピー機・観葉植物がうっすら。
“呪い”の気配で空気にほんのり不穏な紫紺の色かぶり。怖すぎず、コミカル哀愁のトーン。
【画風】cute retro 16-bit pixel-art game background, flat colors, soft cel shading, clean simple shapes。
主人公スプライトと線の太さ・かわいさを揃える。配色は夜（上＝紫紺 #2a2740 系、下＝暗い床 #14121f 系）。
【制約】
- サイズ 800×600（4:3）。
- 画面下から約28%（おおよそ y=430 以下）を「床の帯」にして、キャラが床に立てる平らな面にする。
- キャラの立つ帯（中央〜下）は彩度・ディテール控えめにし、手前のキャラが埋もれないように。
- キャラクター・文字・ロゴ・UI枠は描かない（背景のみ）。
不透明な1枚絵として渡してください（透過・緑背景は不要）。
```

**組込（本人OK後）**：`public/assets/backgrounds/battle_office.png` に置き、`assets.js` に
`battleOffice: 'assets/backgrounds/battle_office.png'` を追加 → `BootScene` が自動ロード →
`BattleScene.buildBackground()` の Graphics を `this.add.image(0,0,'battleOffice').setOrigin(0)` に差替（床ラインと足元位置を合わせて微調整）。

---

## 発注③ UIセット（窓枠／ゲージ枠／コマンドアイコン／カーソル）

> 配色は現行プレースホルダに合わせる（差替がシームレスになる）。
> 窓地色 `#0b0d1a`／白フチ `#f4f4ff`／HP緑 `#49d65b`・黄 `#e8c84a`・赤 `#e05a4a`／MP青 `#4aa8e8`／カーソル黄 `#ffe24a`／文字白。

```
ターン制RPGのUIパーツを、cute retro 16-bit pixel-art・太め輪郭・フラット塗りで作ってください。
主人公スプライトと同じかわいい画風。各パーツは別PNG・純白背景(#FFFFFF)・影なしで。

A) ウィンドウ枠（9スライス用）：角丸の枠。地色は濃紺(#0b0d1a)、フチは細い白(#f4f4ff)、
   内側にほんのりハイライト。64×64px・角の丸み約12px・枠の太さ約8px（中央を引き伸ばして
   任意サイズに使う9スライス前提）。中央は単色で均一に。
B) ゲージの“ハウジング”（空のバー枠）：横長の角丸トレイ。外フチ濃いめ、内側は暗いスロット。
   中身（HP/MPの伸び縮み）はコード側で描くので「空の枠」だけ。160×16px。
C) コマンドアイコン4種（各32×32・純白背景）：
   1 たたかう＝シンプルな剣 or 拳
   2 とくぎ＝きらめき／気合いのオーラ（星＋集中線）
   3 どうぐ＝栄養ドリンクの小瓶
   4 にげる＝走る人の足あと／ダッシュ
D) 選択カーソル＝右向きの太い三角矢印（黄 #ffe24a）。24×24・純白背景。

すべて純白背景(#FFFFFF)・影なし・1パーツ1枚で。文字は描かない。
```

**抽出（本人OK後）**：`--bg white` で四隅フラッドフィル抽出 → `public/assets/ui/` に
`window.png` / `gauge.png` / `icon_attack.png` / `icon_skill.png` / `icon_item.png` / `icon_flee.png` / `cursor.png`。
組込は `drawWindow()` を 9スライス（`this.add.nineslice`）に、`openMenu` のラベル頭にアイコン、`cmdCursor` をカーソル画像に差替。

---

## 受け入れチェック（目視・必須／ART_PIPELINE #5）
- 緑/白フチが残っていないか（チェッカー背景プレビュー）。
- 足元がコマ下端で揃っているか（attackとidleで立ち位置がブレないか）。
- 縮小後にサングラス・ひげ・赤ネクタイが読めるか（同一キャラに見えるか）。
- 背景：床帯にキャラが乗るか・キャラが埋もれないか。
- ダメ → プロンプト修正で再発注、または `extract_sheet.py` のしきい値調整。
