# ART_ORDER_PROMPTS — コピペ用 発注プロンプト集（一括発注用）

各コードブロックを**そのまま画像AIに投げる**ための、単体で完結した発注プロンプト。
「何を/なぜ」の台帳は `ART_ORDERS.md`、キャラ同一性は `_starter-kit/CHARACTER_UNIVERSE.md`。

## 使い方・共通ルール
- 上から優先度順（**P0→P1→P2**）。P0だけ先に出せば、いまの戦闘が「ゲームの顔」になる。
- **キャラ系（主人公/仲間/敵/NPC）は、各見出しの「📎参照」を必ず添付**して投げる（同一画風・同一頭身を保つため）。
  - 主人公ポーズ：`public/assets/sprites/extracted/player/idle.png`
  - 仲間/敵/NPC：先に作った同キャラの立ち絵があれば添付。無ければ画風統一のため**主人公 idle を“画風サンプル”として添付**。
- **背景の指定（厳守）**：キャラ=純緑 `#00FF00`／UI・アイコン・ロゴ=純白 `#FFFFFF`／背景イラスト=不透明／FX=純黒 `#000000`。影なし・グラデ最小・**足元はコマ下端にそろえる**。
- 抽出は `~/Developer/games/_starter-kit/pipeline/extract_sheet.py`（緑=`--bg green`／白=`--bg white`）。各末尾に配置先パスを記載。
- **流用で済む（発注不要）**：バナナ筋肉女子／ドローン／転がるカバン／アイテム基本セット／powered・winged 形態 → `ojisan-hop` から抽出（`ART_ORDERS.md`「流用で済むもの」参照）。**この集には新規発注ぶんだけ**載せる。

---

# ▼ P0（最優先・今の縦スライスを画像化）

## P0-1. 主人公 attack ポーズ　📎参照: player/idle.png
```
（添付の立ち絵と同一人物・同一画風・同一頭身で）このキャラの「攻撃ポーズ」を1枚。
A friendly chubby middle-aged Japanese salaryman, late 40s, plump round body, short limbs,
white-framed sunglasses, black mustache, side-parted black hair with a slightly receding hairline,
rosy pink cheeks, soft double chin, dark navy business suit, white shirt, red necktie.
Cute retro 16-bit pixel-art, bold outlines, flat cel shading. Glasses: only a small thin
light-gray reflection at the lens edge, NO large black reflection.
Pose: dynamic forward attack — stepping in to the right, leaning forward, throwing a straight
punch with one fist (or swinging a black business bag), other arm pulled back, determined grit face.
3/4 view facing RIGHT, full body, feet aligned to the bottom edge of the frame,
isolated on a solid pure green background (#00FF00), no shadow, single character.
別人化・別衣装はNG。納品 1コマ 384×512、緑背景のまま（透過はこちらで処理）。
```
納品: 384×512・純緑 ／ 配置: `public/assets/sprites/extracted/player/attack.png`

## P0-2. バトル背景：中層オフィス（夜）`bgOfficeNight`
```
ターン制RPGの戦闘背景イラストを1枚。
Cute retro 16-bit pixel-art game background, flat colors, soft cel shading, clean simple shapes,
comical with a touch of melancholy. Match the bold cute outline weight of the character sprites.
テーマ：夜の会社オフィス内部。残業で人けがなく蛍光灯の一部が消えて薄暗い。机・椅子・PC・
書類の山・コピー機・観葉植物がうっすら。窓の外は夜の都市。呪いの気配でほんのり不穏な紫紺の色かぶり。
画面下から約28%（y≈430以下）を平らな床帯にして、キャラが床に立てるように。中央〜下は彩度・
ディテールを控えめにして手前のキャラが埋もれないように。
No characters, no text, no logos, no UI frames. Opaque single image, 800×600 (4:3).
```
納品: 800×600・不透明 ／ 配置: `public/assets/backgrounds/battle_office.png`

## P0-3. UI 基本セット（窓枠/ゲージ/コマンドアイコン/カーソル）
> 配色を現行に合わせる：窓地 `#0b0d1a`／白フチ `#f4f4ff`／HP緑 `#49d65b`・黄 `#e8c84a`・赤 `#e05a4a`／MP青 `#4aa8e8`／カーソル黄 `#ffe24a`。
```
ターン制RPGのUIパーツを作る。Cute retro 16-bit pixel-art, bold outlines, flat fills.
各パーツは別PNG・純白背景(#FFFFFF)・影なし・文字なしで。
A) ウィンドウ枠（9スライス用）：角丸の枠。地色 濃紺(#0b0d1a)、フチ 細い白(#f4f4ff)、内側に淡いハイライト。
   64×64px・角丸 約12px・枠太さ 約8px（中央を伸ばして任意サイズに使う前提）。中央は均一。
B) ゲージのハウジング（空のバー枠）：横長の角丸トレイ。外フチ濃いめ、内側は暗いスロット。中身はコードで描く。160×16px。
C) コマンドアイコン4種（各128×128・余白あり）：1 たたかう＝拳または剣／2 とくぎ＝気合いのオーラ(星＋集中線)／
   3 どうぐ＝栄養ドリンクの小瓶／4 にげる＝走る足あと。
D) 選択カーソル＝右向きの太い三角矢印（黄 #ffe24a）48×48。
すべて純白背景・影なし・1パーツ1枚。
```
納品: 各PNG・純白 ／ 配置: `public/assets/ui/`（window/gauge/icon_attack/icon_skill/icon_item/icon_flee/cursor）

## P0-4. タイトルロゴ「おじさんクエスト」
```
ゲームのタイトルロゴを1枚。Cute retro RPG logo, bold and friendly, thick letters, easy to read.
日本語の文字列「おじさんクエスト」を正確に。配色は濃紺〜金、白フチ、軽い立体感。
下に小さくサブタイトル「〜定時に帰れない呪い〜」。白フチサングラスやネクタイの小アイコンを少し添えてよい。
背景は純白(#FFFFFF)・影は最小（透過抽出するため）。1000×320。
```
納品: 1000×320・純白(透過化) ／ 配置: `public/assets/ui/logo_title.png`
> ⚠️ 画像AIは日本語が崩れやすい。崩れたら「文字なしの装飾枠だけ」を発注し、文字はゲーム側フォントで重ねる案に切替。

---

# ▼ P1（数フロアのフル化）

## 主人公 追加ポーズ（4種）　📎参照: player/idle.png（＋既に出た attack）
各プロンプト先頭に P0-1 と同じ identity ブロックを貼り、Pose 行だけ差し替える。3/4 view facing RIGHT, full body,
feet at bottom edge, solid pure green (#00FF00), no shadow, 384×512。配置 `player/<key>.png`。

- **P1-A `cast`（とくぎ）**：`Pose: both fists raised, shouting with all his might ("kiai"), body tensed, mouth open in a yell, slight upward lean.`
- **P1-B `victory`（勝利）**：`Pose: proud guts-pose, one fist clenched up, other hand on hip, satisfied smile.`
- **P1-C `drink`（一服）**：`Pose: tipping a canned coffee to his mouth, eyes relaxed/closed, relieved expression.`
- **P1-D `guard`（防御）**：`Pose: half-turned defensive stance, holding the black business bag up like a shield, bracing, gritted teeth.`

## 敵“残業の魔物”（新規7種）　📎参照: 主人公 idle（画風サンプル）
各プロンプト共通の締め：`Cute retro 16-bit pixel-art, bold outlines, flat cel shading, comical office "overtime monster", 3/4 view facing LEFT (toward the player), full body, feet at bottom edge, isolated on solid pure green (#00FF00), no shadow, single character.` 雑魚=512×512／中ボス=512×640。配置 `enemy_<key>/idle.png`。

- **P1-E1 `paperTower`（書類タワー）** 512×512：`A tower of stacked office documents on a desk, with round eyes; sticky notes drooping like a tongue, a stapler mouth; wobbly and unstable.`
- **P1-E2 `vendingSpirit`（自販機の精）** 512×512：`An old office vending machine with a face; the dispensing slot is its mouth, it shoots canned coffee; glowing buttons.`
- **P1-E3 `lastTrainZombie`（終電ゾンビ社員）** 512×512：`A weary ghost salaryman in a rumpled suit, hollow vacant eyes, necktie tied around his head like a headband, holding a train strap.`
- **P1-E4 `copierGhost`（コピー機オバケ）** 512×512：`An office copier monster opening its lid to spit paper, short stubby legs, jagged output-tray teeth, a green status lamp as one eye, toner smudges; humorous not scary.`
- **P1-E5 `phoneEye`（スマホ目玉）** 512×512：`A giant smartphone with a single eyeball; it flings notification bubbles; thin little arms and legs.`
- **P1-E6 `cardSwarm`（名刺の群れ）** 512×512：`A swarm of countless business cards fluttering together to form one face; a rubber band as an eyebrow; confetti-like motion.`
- **P1-E7 `sectionChief`（課長ロボ）** 512×640：`A boxy office desk fused with an expressionless robot upper body; a small nameplate on the chest (draw NO text), an arm shaped like a hanko stamp; stiff and bureaucratic.`

## ラスボス：社長 `president`　📎参照: 主人公 idle（画風サンプル）
```
RPGのラスボス立ち絵を1枚。Cute retro 16-bit pixel-art, bold outlines, flat cel shading,
imposing but a touch comical (not a famous character — fully original).
テーマ：会社の最上階・社長室に君臨する“残業の呪いの主”。
A towering, imposing elderly executive; large heavy black luxury suit, gold-rimmed glasses,
slicked-back white hair, a huge clock face behind him (hands never pointing to quitting time),
a dark purplish-navy "overtime" aura radiating from him. Dignified with melancholy.
Front to slightly 3/4 view, full body, feet at bottom edge, solid pure green (#00FF00),
no shadow, single character. 納品 640×768、緑背景のまま。
（任意：第2形態＝オーラが暴走し背後の時計が砕ける差分を同サイズで）
```
配置: `enemy_president/idle.png`（第2形態は `phase2.png`）

## NPC（4種）　📎参照: 主人公 idle（画風サンプル）
各 512×640・正面または3/4・solid pure green (#00FF00)・no shadow。配置 `npc_<key>/idle.png`。共通画風：`Cute retro 16-bit pixel-art, bold outlines, flat cel shading.`

- **P1-F1 `npcMama`（のりちゃん/ママ）**：`A warm middle-aged-to-elderly woman, owner of a retro cafe; cooking apron (kappogi) or apron, holding a cleaning cloth; kind but a little sharp-tongued; cozy "okami-san" vibe.`
- **P1-F2 `npcReception`（受付OL）**：`A tidy female receptionist in a business suit, glasses, hair tied back, a guiding gesture; a bit tired from overtime.`
- **P1-F3 `npcGuard`（守衛）**：`An elderly night security guard in cap and uniform, holding a flashlight, good-natured face.`
- **P1-F4 `npcPresidentHuman`（社長・人間体）**：`The president's pre-curse human form — a dignified executive in a luxury suit, gold-rimmed glasses, white hair; stern but human.`

## バトル背景（フロア別・残り4枚。`bgOfficeNight`はP0-2）
各 800×600・不透明・床帯 y≈430以下・キャラが埋もれない。共通画風は P0-2 と同じ。配置 `public/assets/backgrounds/<key>.png`。

- **P1-G1 `bgStorageB1`（地下倉庫）**：`A dim basement storage floor: cardboard-box shelves and steel racks, red emergency lights, concrete floor, dusty.`
- **P1-G2 `bgEntranceNight`（1F ロビー/受付）**：`A night entrance lobby: reception counter, sliding glass doors (outside is still office, no exit), sofas, plants, emergency lighting, deserted.`
- **P1-G3 `bgExecFloor`（上層 役員フロア廊下）**：`An upscale executive corridor: plush carpet, wood-panel walls, framed pictures, heavy doors, indirect lighting, tense atmosphere.`
- **P1-G4 `bgPresidentRoom`（屋上 社長室・ボス）**：`A grand president's office: big windows with night cityscape, an executive desk and leather chair, a huge wall clock, imposing and solemn, purplish-navy aura.`

## 非戦闘の背景（拠点/タイトル/結末）
各 800×600・不透明。配置 `public/assets/backgrounds/<key>.png`。

- **P1-H1 `bgCafe`（拠点・喫茶のりちゃん）**：`A cozy Showa-retro Japanese cafe interior: counter with a coffee siphon, red sofa seats, warm amber lighting; a calm, safe, relieving mood.`
- **P1-H2 `bgTitle`（タイトル背景）**：`A night skyline of a tall office building in silhouette with the moon; a salaryman seen from behind in the foreground; empty space at the top for the logo.`
- **P1-H3 `bgEndingEscape`（脱出エンド）**：`Pre-dawn at the building's front entrance, light pouring through the glass doors, a sense of release; the city sky beginning to brighten.`
- **P1-H4 `bgGameOver`（ゲームオーバー）**：`A dark office, a salaryman slumped face-down on a desk seen from behind, flickering fluorescent light, sunken blue tone.`

## UI 拡張（状態異常/強化/数値バッジ/追加コマンド）
```
ターン制RPGの追加UIアイコンを、Cute retro 16-bit pixel-art・太め輪郭・はっきりした配色で。
各128×128・純白背景(#FFFFFF)・影なし・文字なし。小さく縮小しても一目で意味が分かるように。
・追加コマンド：ぼうぎょ＝盾／しらべる＝虫眼鏡／はなす＝吹き出し／そうび＝ネクタイ or 鞄
・状態異常：毒＝紫のドクロ泡／睡眠＝Zマーク／沈黙＝×付き吹き出し／混乱＝ぐるぐる目／
　攻撃↑＝赤い上矢印＋拳／防御↑＝青い上矢印＋盾／素早さ↓＝下矢印＋足
・数値バッジ：お金＝コイン（領収書モチーフ可）／経験値＝星／レベル＝丸いLvバッジ
```
配置: `public/assets/ui/`（icon_guard ほか／status_*／badge_*）

## アイテム・とくぎアイコン
> 流用 `item_core_set` で足りるものは流用優先。足りないぶんだけ発注。
```
ターン制RPGのアイテムアイコンを、Cute retro 16-bit pixel-art・太め輪郭で。
各128×128・純白背景(#FFFFFF)・影なし・文字なし。
栄養ドリンク（茶色の小瓶）／缶コーヒー（赤い缶）／気付けドリンク（黄色い栄養剤）／胃薬（白い錠剤シート）／
おじさんバーガー／領収書（お金代わり）／重要書類（封筒）／定期券（ICカード風）／社員証（鍵代わり・ストラップ付き）／
収集物3種：若い頃の社員証写真・古いギター・家族の不在着信スマホ。
```
配置: `public/assets/ui/items/<key>.png`

---

# ▼ P2（拡張・あれば嬉しい）

## 仲間キャラ（3人 × idle/attack/hurt）　📎参照: 主人公 idle（同頭身・同画風サンプル）
各コマ 384×512・3/4 view facing RIGHT・solid pure green (#00FF00)・feet at bottom・no shadow。
共通：`Cute retro 16-bit pixel-art, bold outlines, flat cel shading, same head-to-body ratio as the main salaryman.` 配置 `mate_<key>/<idle|attack|hurt>.png`。

- **P2-I1 `kohai`（後輩くん）**：`A young slim male employee, black hair, dress shirt with no necktie, a flustered look, carries a backpack.` 3コマ（idle/attack/hurt）。
- **P2-I2 `ol`（メガネOL）**：`A calm, reliable female colleague in a suit, bob haircut with glasses, holding a tablet.` 3コマ。
- **P2-I3 `senpai`（先輩おじさん）**：`A tall lean veteran salaryman, grey-streaked mustache, grey suit, dignified; holds a teacup.` 3コマ。

## FX（純黒背景・加算合成ADD前提・各256×256・3〜4コマ）
```
ゲーム用エフェクト素材を、純黒背景(#000000)・各256×256・3〜4コマの簡易アニメで。明色は加算合成で映えるように。
・斬撃（白〜黄の弧）／打撃ヒット（黄の星＋集中線）／衝撃波リング（「一喝」用の同心円）／
・回復のきらめき（緑〜白の上昇する粒）／撃破の爆散（煙＋星）／レベルアップの光柱（金の光）／
・呪いの紫オーラ（ゆらめく紫紺のもや・ボス用）／状態異常のもや（毒=紫・睡眠=青）。
輪郭はFXらしくにじませてよい。文字なし。
```
配置: `public/assets/fx/<key>/`

## リッチUI（会話顔アイコン / フロアマップ）
```
A) 会話窓用の顔アイコン（バストアップ正方形・各128×128・純白背景）：
   おじさん（通常/驚き/汗）・のりちゃん(ママ)・主要な敵1〜2体。Cute retro 16-bit pixel-art。
B) ビルの断面フロアマップ（縦長 400×800・純白背景）：地下〜屋上を簡略図で、各階を分離した素材
   （現在地をハイライトできるように）。
```
配置: `public/assets/ui/face/<key>.png` ／ `public/assets/ui/floormap.png`

---

## 受け入れチェック（納品後・目視必須）
- 緑/白/黒の背景フチが残っていないか（チェッカー背景で確認）。
- 足元がコマ下端でそろい、idleと各ポーズで立ち位置がブレないか。
- 縮小後にサングラス・ひげ・赤ネクタイが読めるか（同一キャラに見えるか）。
- 背景：床帯にキャラが乗るか・中央でキャラが埋もれないか・800×600か。
- アイコン：32〜48pxに縮小して意味が一目で分かるか。
- ダメ → プロンプト修正で再発注、または `extract_sheet.py` のしきい値調整。
