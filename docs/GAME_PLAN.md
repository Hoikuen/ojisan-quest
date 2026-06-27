# GAME_PLAN — おじさんクエスト 短編RPG 制作計画

> 構成・システム・実装ロードマップの正本。物語＝`STORY.md`、絵＝`ART_ORDERS.md`、骨子＝`GAME_DESIGN.md`。
> 目標：**30〜60分で遊べる短編RPG**。現状の縦スライス（1フロア4連戦・約5分）を土台に拡張する。
> 方針は不変：**正面ビュー・素早さ順ターン制・作りやすさ最優先・エンジンは薄く/内容はデータ（RESKIN）**。

## 完成の定義（このプロジェクトの“短編RPG”ゴール）
- 5階層＋拠点（喫茶店）。各階：簡易フロア移動＋ランダムエンカウント＋小イベント＋階ボス＋物語ビート。
- 2人パーティ（仲間2人を道中で合流）。技5〜7・どうぐ複数・お金とショップ（補給）・セーブ。
- 物語（導入〜社長戦）と**エンディング分岐**（脱出／真の解呪／力尽き）。
- 流用アセット中心＋ART_ORDERSの新規発注で見た目を統一。
- 実機プレイでバランス調整済み・独立検証Goが出ている。

---

## フロア×コンテンツ表（流用[再]／新規[新]）
| 階 | 背景 | 雑魚 | 階ボス | 小イベント | 物語ビート |
|---|---|---|---|---|---|
| B1 地下倉庫 | bgStorageB1[新] | イモムシ社員[再]・書類タワー[新] | 軽め（転がるカバンの主[再]） | ママ(のりちゃん)と邂逅／後輩 解放・合流／若い頃の社員証写真[収集] | 「すぐ帰るさ」 |
| 1F ロビー受付 | bgEntranceNight[新] | 自販機の精[新]・終電ゾンビ[新]・転がるカバン[再] | 受付の主[新] | 出口が消えている／OL 解放・合流 | 「上へ行くしかない」 |
| 中層 オフィス | bgOfficeNight[新/P0済] | コピー機オバケ[新]・スマホ目玉[新]・名刺の群れ[新]・ドローン[再] | 主任＝果物メガネ女子[再] | 終わらない会議ギミック／昔のギター[収集] | 若い頃の夢の回想 |
| 上層 役員 | bgExecFloor[新] | バナナ筋肉女子[再]・課長ロボ[新] | 部長＝大仏豚ぶちょう[再] | 家族の不在着信スマホ[収集・trueフラグ] | 「代わりはいない」の囁き |
| 屋上 社長室 | bgPresidentRoom[新] | （直行） | **社長[新]（第2形態）** | 戦う/帰る の選択 | 核心の問答→分岐 |
| 拠点 | bgCafe[新] | — | — | 補給/セーブ/会話/回想 | 各階クリアで進行 |

> **現行のB1ボス＝「転がるカバンの主」(`rollingBagLord`)**。既存の縦スライス（イモムシ→イモムシ→果物→大仏豚）はこの表に**吸収・再配置**する：旧スライスで最後だった大仏豚は**上層ボス（部長）へ格上げ**、果物メガネ女子は中層ボスへ。

---

## 必要システム（薄エンジンへの載せ方）
| # | システム | 役割 | 実装方針（既存を活かす） |
|---|---|---|---|
| S1 | 会話/カットシーン | 物語の体験 | `BattleScene.runSequence` のメッセージ送りを汎用化した `DialogueScene`（話者名・顔・行リスト・選択肢）。データは `src/data/story.js` |
| S2 | フロア移動 | 探索の能動性 | **【確定】軽量な通路（タイルマップ不使用）**。おじさんが各階の横長“通路”を右へ歩き、エンカウントで戦闘画面へ切替、奥にボス扉、要所に会話/イベントノード、踊り場から拠点へ。`FloorScene` |
| S3 | エンカウント | 戦闘の供給 | 既存 `ENCOUNTERS`（エリア→敵編成/出現率）を使い、`すすむ`で抽選→`BattleScene`。ボスは固定ノード |
| S4 | パーティ/隊列 | 戦闘の深さ | `run.party=[...]`。`BattleScene` を**複数アクター対応**（生存仲間ぶん行動順に組む・対象選択）。最小は2人 |
| S5 | セーブ | 継続 | 拠点で `localStorage` に run（party/level/items/floor/flags）を保存・ロード |
| S6 | ショップ/補給 | 経済 | 拠点メニュー：どうぐ購入（お金）・全回復・セーブ。`ITEMS` に price 追加 |
| S7 | ストーリーフラグ/分岐 | 進行・エンディング | `run.flags`（解放/収集/選択）。エンディングは flags で分岐 |
| S8 | データ拡張 | 中身 | 敵/技/どうぐ/階構成は `content.js`・`story.js` 追記のみ（コード不変が原則） |

> いずれも「エンジン薄く・データ厚く」を維持。新規シーンは `DialogueScene`/`FloorScene`/`CafeScene` の3つ程度に収める。

---

## 詳細設計（着手前に確定・データスキーマ／遷移／戦闘エッジ）

### 画面遷移図
```
Boot → Title ──[はじめる/つづきから]──► CafeScene(喫茶のりちゃん=拠点)
                                          │  ├─ 会話/回想(DialogueScene)
                                          │  ├─ 補給(ショップ) / セーブ
                                          │  └─[出発]► FloorScene(現在階)
FloorScene ──[すすむ→エンカウント抽選]──► BattleScene ──[勝]──► FloorScene
   │  ├─[イベントノード]► DialogueScene ─► FloorScene
   │  ├─[ボス扉]► BattleScene(階ボス) ──[勝]──► 次階 or CafeScene(踊り場)
   │  └─[踊り場]► CafeScene
BattleScene ──[全滅]──► ResultScene(bad=力尽き) ─► Title
屋上 社長戦の入口:
   ├─[『帰る』go ※3収集済みのみ]──► ResultScene(true=真の解呪) ─► Title  ※戦闘は発生しない
   └─[『戦う』fight / 選択肢なし]──► BattleScene(社長) ──[撃破]──► ResultScene(normal=脱出) ─► Title
```
- セーブの入口は **CafeScene のみ**（チェックポイント方式）。ロードは Title「つづきから」。

### FLOORS データ構造（`src/data/content.js`・Phase B で追加）
```js
export const FLOORS = [
  { id:'b1', name:'地下倉庫', bg:'bgStorageB1', steps:3,
    encounters:[{enemy:'caterpillar',w:3},{enemy:'paperTower',w:2}],
    boss:'rollingBagLord',
    events:[{at:'enter',story:'b1_intro'},{at:'clear',story:'b1_kohaiJoin'},{at:'pickup',item:'photo'}] },
  // 1f / office / exec / rooftop を同形で続ける（rooftop は steps:0・boss:'president'）
];
```
- `steps`：その階で踏む通常エンカウント回数（=通路の長さ）。踏み終えるとボス扉が開く。
- `encounters`：**重み付き抽選**（`w` が重み。旧 `ENCOUNTERS.rate` はこの `w` に統合）。
- `boss`：階ボスの敵キー（`RPG_ENEMIES`）。流用スプライトを使うボスも `RPG_ENEMIES` に `isBoss:true` で定義する（例：B1ボス `rollingBagLord` の `sprite` は流用 `enemy_rolling_bag` を抽出して使う＝ART_ORDERS「流用で済むもの」と対応）。`events`：物語/収集ノード（`story` は `story.js` のキー、`item` は収集物キー）。
- `story.js` スキーマ：キーは `<floor>_<beat>`（例 `b1_intro`/`b1_kohaiJoin`）、値は `{ speaker, lines:[...], choices?:[{label, flag}] }`。`DialogueScene` がこれを再生。
- 進行は `run.floorIndex`（0..4）＋ `run.stepInFloor`。

### セーブ JSON スキーマ（`localStorage['ojisanQuest.save']`・単一スロット）
```json
{
  "saveVersion": 1,
  "floorIndex": 2, "stepInFloor": 1,
  "party": [
    { "key":"ojisan","level":3,"exp":24,"hp":40,"maxHp":47,"mp":9,"maxMp":13,
      "atk":12,"def":7,"spd":8,"skills":["shout","coffee","heavySwing"],"down":false }
  ],
  "gold": 64,
  "inventory": { "drink": { "count": 2 } },
  "flags": { "kohaiJoined":true,"olJoined":false,
             "got_photo":true,"got_guitar":false,"got_phone":false,"endingChoice":null }
}
```
- `saveVersion` でマイグレーション判定（不一致は破棄して新規＝MVP方針）。スロットは1つ。
- `inventory` は **アイテム別 `{count}` のみ保存**（効果値は `ITEMS` 定義から復元）。`flags` と数値ステータスはそのまま保存。
- 現状 `run.js` の `state`（player単体/queue/index/floorName）を、この `party[]`＋`floorIndex/stepInFloor`＋`flags` 形へ拡張する。**`BattleScene` の `this.player` 単体直参照 → `party[]`＋対象選択への置換が Phase C の主作業**（工数の山）。既存「はじめる」は新規ラン、「つづきから」はロード。

### ストーリーフラグ & エンディング判定
- 収集物（各1フラグ）：`got_photo`(B1)・`got_guitar`(中層)・`got_phone`(上層)。合流：`kohaiJoined`・`olJoined`。選択：`endingChoice`∈`null|'fight'|'go'`。
- 社長戦の入口で `got_photo && got_guitar && got_phone` が真なら**選択肢「戦う／帰る」を提示**（偽なら自動で戦う）。
- **判定は「go を選んだか → 撃破か全滅か」の二段で排他・網羅**（normal を撃破基準で書き、判定漏れを防ぐ）：
  1. 入口で **『帰る』(`endingChoice='go'`)** を選択 → **戦闘せず即 true（真の解呪）**。※go は3収集済みのときしか選べない。
  2. それ以外（『戦う』を選択 or 選択肢が出ない）→ 戦闘に入る。
     - **社長を撃破** → **normal（脱出）**＝ `社長撃破 && endingChoice!=='go'`
     - **パーティ全滅** → **bad（力尽き）**
  - 整理：`true = (endingChoice==='go')` / `normal = (社長撃破 && endingChoice!=='go')` / `bad = (全滅)` の3つは相互排他。`endingChoice` が `null` のまま撃破しても normal に入る（穴なし）。

### 複数アクター戦闘のエッジ仕様（Phase C・MISTAKES教訓で先に明文化）
- **行動順**：生存している全アクター（味方＋敵）を `spd` 降順で並べ上から行動（同値は味方優先→ランダム）。毎ラウンド組み直す。
- **戦闘不能**：`hp<=0` で `down=true`。以降の手番はスキップ、スプライトは伏せ/半透明。
- **全滅/勝利**：味方が全員 `down` → `lose`。敵が全滅 → `win`。
- **対象選択**：プレイヤーの単体行動は敵を選ぶ（敵1体なら自動）。敵AIは生存味方からランダム（ボスは狙い分け可）。
- **対象消失**（行動解決前に対象が撃破/down）：解決時に**残存から再ターゲット**。残りがいなければ不発（「しかし 相手が いない」）。
- **蘇生**：アイテム/技で `down=false`＋HP回復。全体技は生存者のみ対象。
- **逃げる**：パーティ単位で判定（既存式を流用）。失敗時は敵ターンを消化。
- **対象種別 `target` / `kind` の拡張（データを足す前にエンジンに用意する＝MISTAKES教訓）**：現状 `useSkill` は `kind==='heal'`→自分回復／else→敵攻撃の二分岐、`useItem` はHP回復固定で **`target` を読んでいない**。Phase C で以下を読む形に拡張する：
  - `target ∈ enemy | self | ally | downAlly | allEnemies`：対象選択UIを target で出し分け（enemy=敵リスト／self=使用者自身（既存 coffee）／ally=生存味方（1人時は自分も可）／downAlly=戦闘不能の味方／allEnemies=全体・選択不要）。
  - `kind ∈ attack | heal | revive | mpHeal`、`hits`（多段攻撃の回数）、`ratio`（割合回復）を解決関数の分岐に追加。
  - **新技/新アイテムをデータに足す前に、この分岐を `BattleScene` に実装する**（後付けで前提を壊さない）。

### 仲間・とくぎ・ショップ・ボス第2形態（初期設計・値は実機で微調整）
**仲間（Lv1基準。成長は当面 主人公の `LEVEL_TABLE` を準用、専用曲線は後で）**
| key | 仲間 | hp | mp | atk | def | spd | 初期とくぎ | 役 |
|---|---|---|---|---|---|---|---|---|
| `ojisan` | おじさん | 30 | 8 | 8 | 5 | 6 | shout, coffee（Lv3で heavySwing） | 主軸 |
| `kohai` | 後輩くん | 24 | 6 | 7 | 4 | 10 | doubleTap | 素早さ・手数 |
| `ol` | メガネOL | 22 | 12 | 5 | 4 | 7 | firstAid, reviveCare | 回復・蘇生 |

**追加とくぎ（`SKILLS` に定義）**
- `doubleTap`：連続2回の通常攻撃（`kind:'attack', power:0.7, hits:2, cost:3, target:'enemy'`）
- `firstAid`：味方1体を回復（`kind:'heal', amount:24, cost:4, target:'ally'`）
- `reviveCare`：戦闘不能の味方1体を復帰＋HP半分（`kind:'revive', cost:6, target:'downAlly'`）
  ※戦闘エッジ仕様の「蘇生」はこの技＋下記アイテムで実現（データ未定義の穴を解消）。

**追加とくぎ・どうぐのスキーマ形（`content.js` に落とす形・上の `target/kind` 拡張で処理）**
```js
// SKILLS 追記
doubleTap:  { name:'連打',       kind:'attack', power:0.7, hits:2, cost:3, target:'enemy'    },
firstAid:   { name:'救急セット',  kind:'heal',   amount:24,        cost:4, target:'ally'     },
reviveCare: { name:'気付け介抱',  kind:'revive', ratio:0.5,        cost:6, target:'downAlly' },
// ITEMS 追記（price はショップ用。inventory は {count} のみ保存し効果はここから復元）
drink:       { name:'栄養ドリンク',  kind:'heal',   amount:20, price:8  },
coffeeCan:   { name:'缶コーヒー',    kind:'mpHeal', amount:10, price:12 },
reviveDrink: { name:'気付けドリンク', kind:'revive', ratio:0.5, price:20 },
```
- ショップ購入導線：`CafeScene`→「ほじゅう」→一覧（名前/効果/price/所持数）→ `gold>=price` で購入。売却なし・所持金上限9999。

**ボス第2形態（PHASER3 #8 チェックリスト「ボスフェーズ2のトリガー/変化が決定済み」）**
- 社長：**HP50%以下で第2形態へ移行**（移行は1回のみ・フラグで二重移行防止）。変化＝全体技「残業命令」追加・`atk`+30%・紫オーラ演出（tint/FX）。
- 他のボス（大仏豚＝部長 等）は単形態。

---

## 実装ロードマップ（各フェーズ＝playable & 検証で締める）
> 1フェーズ完了ごとに：`npm run build` 通過 → 実起動パスで確認 → **本人の実機プレイ** → 必要なら独立検証（`VERIFICATION_ROUTINE.md`）。

- **Phase A｜物語の器**（S1, S6, S5の素地）
  - `DialogueScene`（会話・選択肢）＋ 拠点 `CafeScene`（会話/補給/セーブの枠）＋ 導入カットシーン。
  - 完了条件：タイトル→導入会話→拠点→既存戦闘 が会話付きで通る。
- **Phase B｜フロア構造**（S2, S3）
  - `FloorScene`（通路ノード）＋ エンカウント抽選 ＋ 階ボス扉。`FLOOR_RUN`→多層 `FLOORS` データへ。背景はプレースホルダのまま5階分。
  - 完了条件：B1→…→屋上 を移動・連戦・階ボスで通しでクリアできる（物語ビートは仮テキスト可）。
- **Phase C｜パーティ/隊列**（S4）
  - `BattleScene` 複数アクター化（2人パーティ・対象選択・全体/単体技）。仲間合流イベント2件。
  - 完了条件：2人で戦闘が破綻なく回る（行動順・戦闘不能・蘇生/全滅判定）。
- **Phase D｜戦闘の一捻り**（任意・GAME_DESIGNのopen #2）
  - 弱点/属性（“おじさんの本音”系）＋敵行動パターン（HP閾値で技変更等）。
  - 完了条件：弱点を突くと手応えが変わる／ボスが単調でない。
- **Phase E｜物語と経済の肉付け**（S6, S7 仕上げ）
  - 各階の解放イベント・回想・trueエンド収集物・**エンディング3分岐**・ショップ/装備（任意）。
  - 完了条件：3エンディングに到達できる。物語が頭から尻まで繋がる。
- **Phase F｜仕上げ**
  - バランス調整（実機反復）・発注アートの差替（`ART_ORDERS`）・SE/BGM（任意）・独立検証Go。

> アート発注（`ART_ORDERS.md`）は全フェーズと**並行**。届くまではGraphics/流用プレースホルダで進める。

---

## 尺の見積り
- 5階層 × 1階あたり「移動＋雑魚3〜5戦＋小イベント＋階ボス＋会話」≈ 6〜10分 → 30〜50分。
- 拠点往復・収集・トゥルー狙いで +5〜15分。**初回通し ≈ 35〜60分**を想定。

## MVP割り切り（意図的に最小 or 後回し＝欠落ではなく仕様）
- **チュートリアル**：B1の初回コマンド時に1行ガイドを出すだけ（専用チュートリアル画面は作らない）。
- **セーブ**：単一スロット。既存セーブがある状態で「はじめる」を選んだら**上書き確認を1回**出す。オートセーブなし（拠点で手動）。
- **音（SE/BGM）**：Phase F で任意追加。無くても成立。
- **装備**：短編では当面なし（成長はレベル＋とくぎ習得で表現）。必要なら拡張で。

## アート
- 必要画像は `ART_ORDERS.md` の台帳に集約済み（流用で済むもの／新規発注を仕分け済み）。本計画のフロア表と1対1。

---

## 設計の完全性チェックリスト（コードを書く前に確認・MISTAKES教訓）
- [x] 全キャラ（主人公/仲間2/敵全種/ボス/社長/NPC）の役割・ステータス方針が決まっている（フロア表＋STORY）
- [x] 全フロアの 背景/雑魚/階ボス/イベント/物語ビート が表で1対1
- [x] 全システム（S1〜S8）の「既存への載せ方」が具体化している
- [x] エンディング3分岐の**到達条件**が決まっている（flags定義 → 詳細設計）
- [x] セーブ対象データの**JSONスキーマ**が決まっている（詳細設計）
- [x] 画面遷移図がある（詳細設計）
- [x] 複数フロアの `FLOORS` データ構造・エンカウント抽選モデルが決まっている（詳細設計）
- [x] 戦闘の複数アクター時のエッジ（戦闘不能/全滅/逃走/対象消失/蘇生/再ターゲット）を明文化した（詳細設計）
- [x] 新規発注アートが `ART_ORDERS` と1対1（背景キーを ART_ORDERS と一致させ済み）
- [x] ボス（社長）第2形態のトリガー（HP50%）と変化が決まっている（詳細設計／PHASER3 #8 チェックリスト「ボスフェーズ2」）
- [x] 仲間2人の初期ステータス＋他者回復/蘇生の手段（技/アイテム）が定義されている（詳細設計）
- [x] ショップ価格表（drink/coffeeCan/reviveDrink）と購入導線がある（詳細設計）
- [ ] 上記スキーマ値（収集物・バランス初期値・仲間成長曲線）は実装/実機で微調整（Phase内で詰める）

## 進め方（合意フロー）
1. 本計画（STORY＋GAME_PLAN）を**本人がレビュー**し、`STORY.md` 末尾の未確定5点を確定。
2. （推奨）`VERIFICATION_ROUTINE.md` に従い**独立エージェントで設計検証**（網羅/整合）してから着手。
3. 合意後、Phase A から実装。各フェーズ末で実機プレイ。
