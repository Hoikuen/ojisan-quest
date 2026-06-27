# PROJECT_LOG — おじさんクエスト

新しいチャット（履歴なし）で続きを作るための作業ログ。**最新の「🔄 引き継ぎ」を最初に読むこと。**
併せて読む：`docs/GAME_DESIGN.md`（設計・物語前提・進捗）、リポジトリ直下 `CLAUDE.md`、
`~/Developer/games/` 直下の `AGENTS.md` / `PHASER3_CONSTRAINTS.md` / `VERIFICATION_ROUTINE.md` / `MISTAKES.md`。
**設計の最新正本**：`docs/STORY.md`（物語）・`docs/GAME_PLAN.md`（構成/システム/ロードマップ・★詳細設計）・`docs/STORY_SCRIPT.md`（台詞脚本）・`docs/ART_ORDERS.md`＋`docs/ART_ORDER_PROMPTS.md`（発注）。`GAME_DESIGN.md` は初期骨子（一部旧記述・冒頭に注記あり）。

---

## 🔄 引き継ぎ（2026-06-27・その6：GitHub Pages 公開）

### このセッションでやったこと
- **GitHub Pages 公開**：`https://hoikuen.github.io/ojisan-quest/` でゲームが公開 URL で遊べるようになった。
  - `.github/workflows/deploy.yml` を追加（GitHub Actions で `npm run build` → Pages デプロイ）。
  - `gh repo create hoikuen/ojisan-quest --public` でリポジトリ作成・push・Pages 有効化（`build_type: workflow`）を一括実行。
  - Actions が 40 秒で完了、初回デプロイ成功を確認。
  - コミット：`ff14ce9`（deploy.yml）。
- **`vite.config.js` に `host: true`** を追加（LAN 内スマホアクセス用。dev サーバ限定）。

### 補足・運用メモ
- `main` に push するたびに Actions が自動ビルド＆デプロイ（手動操作不要）。
- `vite.config.js` の `base` は `command === 'build'` 時のみ `/ojisan-quest/`。ローカル dev は `/` のまま（URL でアセット壊れない）。

### 次にやること（変わらず Phase C）
→ 前の引き継ぎ（その5）を参照。

---

## 🔄 引き継ぎ（2026-06-27・その5：Phase B 完了＝全5階層が通しでクリア可能）

### このセッションでやったこと
- **全5階層を実装**（在庫アート12スプライト＋背景8枚を全採用）。**Title→B1→1F→中層→上層→屋上→社長戦→脱出END** が通る。
  - FLOORS に `f1`（1F ロビー受付）・`office`（中層 オフィス）・`exec`（上層 役員）・`rooftop`（屋上 社長室）を追加。
  - 屋上は **steps:0**＝入場即「ボスにいどむ」。`isBossReady()` が `0>=0` で true になり機能。
- **新規敵を `content.js` に追加**：
  - 1F：自販機の精(`vendingSpirit`)・終電ゾンビ(`lastTrainZombie`)・**受付の主(`receptionLord`＝課長ロボ sprite 流用)**。
  - 中層：コピー機オバケ(`copierGhost`)・スマホ目玉(`phoneEye`)・名刺の群れ(`cardSwarm`)。
  - 上層：残業の亡霊(`overtimeWraith`＝zombie流用)・監査の目(`auditEye`＝phone流用)＝役員フロア用に高ステ化。
  - 屋上：**社長(`president`)** hp130/atk19。ラスボス。
- **ボス格上げ**：`fruitGirl`→中層ボス(主任 hp90)、`buddhaPig`→上層ボス(部長 hp95)。`isBoss:true`付与。
- **背景採用**：entrance_night/office_night/exec_floor/president_room/ending_escape/game_over（public/assets/backgrounds）。
- **story.js**：`f1_intro`/`office_intro`/`exec_intro`/`rooftop_intro` を脚本(`STORY_SCRIPT.md`)から実装反映。
- **ResultScene**：勝利=ending_escape／敗北=game_over の背景を配線（無ければ単色fallback）。
- **死蔵コード削除**：`FLOOR_RUN`/`ENCOUNTERS`（FloorScene化で不要）。
- コミット：`3907f30`（全5階層）。直前 `d73dead`（B1）・`bce1fda`（ログ）。作業ツリークリーン。

### フロア×敵×ボス 一覧（実装値）
| 階 | bg | 雑魚(重み) | ボス(hp) |
|---|---|---|---|
| B1 地下倉庫 | bgStorageB1 | caterpillar3, paperTower2 | rollingBagLord(50) |
| 1F ロビー受付 | bgEntranceNight | vendingSpirit3, lastTrainZombie3 | receptionLord(70) |
| 中層 オフィス | bgOfficeNight | copierGhost2, phoneEye2, cardSwarm2 (steps:4) | fruitGirl(90) |
| 上層 役員 | bgExecFloor | overtimeWraith3, auditEye2 (steps:4) | buddhaPig(95) |
| 屋上 社長室 | bgPresidentRoom | （直行・steps:0） | president(130) |

### 検証（プレビュー目視・game.step手動駆動）
- 全5フロアの背景・敵スプライト・HUD・コマンドメニュー・社長戦・脱出ENDをスクショ確認。**コンソールエラーなし**。
- **検証手法メモ（重要）**：プレビューはhiddenタブで rAF 停止。`window.__game.step(now,dt)` を手で回す `__pump()` ヘルパで駆動した。
  - **落とし穴**：`import('/src/state/run.js')` で取得したモジュールは**別インスタンス**（`state` が別物）。シーンが見ているバンドル run と一致しない＝`getRun()` が null で create() がクラッシュする。→ **バンドル run は「稼働中シーンの `this.run`」から取得する**（CafeScene 等を一度動かして `window.__brun = scene.run`）。これで `floorIndex` を書き換え各階へジャンプして検証した。

### 既知の問題・未実装（Phase C 以降）
- **2人パーティ未実装**（仲間 mate_kohai/ol/senpai は在庫のみ）。`BattleScene` は1アクター。→ Phase C。
- **選択肢付き会話・3エンディング分岐 未実装**：現状ラスボス撃破は常に normal（脱出END=ending_escape）。true(帰る)/bad(全滅)分岐と社長第2形態(HP50%)は Phase E。`rooftop_confront`/`president_phase2`/`ending_*` 脚本は用意済み。
- **小イベント/収集物 未実装**：got_photo/guitar/phone・後輩/OL合流。FLOORS に `events` を足す設計は GAME_PLAN にあり。
- **ショップ未実装**（gold は貯まる）。Phase E。
- バランス未調整（敵HP/atk・EXP曲線）。社長50expで一気にLv1→Lv4する等、**実機プレイでの調整が必要**。
- gauge/guard 未配線（自前バー・ぼうぎょは後フェーズ）。敵の足が少し浮く（許容）。

### 次にやること（順）
1. **本人の実機プレイ**で通し（Title→全5階→社長→脱出 / 途中敗北）。バランス・テンポを体感して `content.js`/`LEVEL_TABLE` 調整。
2. **Phase C**：2人パーティ（`run.party=[...]`・`BattleScene` 複数アクター対応・対象選択・全体/単体技）。仲間合流イベント（後輩=B1クリア後・OL=1Fクリア後）。
3. **Phase D**：弱点/敵行動パターン。→ **Phase E**：収集物・社長選択肢・社長第2形態・3エンディング・ショップ。→ **Phase F**：バランス＋独立検証Go。

### 主に触るファイル
- `src/data/content.js`：敵/FLOORS/LEVEL_TABLE（データ追加の中心）。
- `src/data/story.js`：会話。`src/data/assets.js`：キー→パス。
- `src/scenes/`：FloorScene（フロア演出）/ BattleScene（Phase Cで複数アクター化）/ DialogueScene（Phase Eで choices 対応）。
- `src/state/run.js`：Phase C で `party` 追加・収集/合流フラグ。

---

## 🔄 引き継ぎ（2026-06-27・その4：Phase A+B 完了・B1フロアループ動作確認）

### このセッションでやったこと
- **Phase A 増分2**：`CafeScene`（喫茶のりちゃん・ママスプライト表示・はなす/ほじゅう/セーブ/出発メニュー）＋`localStorage`セーブ/ロード（SAVE_VERSION=2）＋Title「つづきから」。
- **Phase B**：`FloorScene` 新規作成、`run.js` をフロアモデルに刷新。
  - FLOORS配列 + `floorIndex`/`stepInFloor`/`pendingEnemy`/`pendingIsBoss`/`lastWon` モデル。
  - `currentFloor()`/`isBossReady()`/`hasNextFloor()`/`pickEncounter()`（重み付き抽選）。
  - BattleScene を単発戦闘に変更（`pendingEnemy`読み取り・`returnTo: 'FloorScene'`パターン・`win()`でlastWon=true）。
  - CafeScene「出発」→ FloorScene、FloorScene 通常→BattleScene→FloorScene（stepInFloor++）、ボス→clearFloor()→次階or ResultScene。
  - B1地下倉庫：`paperTower`・`rollingBagLord`追加。`b1_intro` 台詞追加。
  - アセット採用：`bgStorageB1` / `enemyPaperIdle` / `enemyRollingBagIdle`（bgCafe / npcMama は その3で採用済み）。
- **コミット `d73dead`**（Phase B・B1フロア実装）。作業ツリークリーン。

### 現状の実機フロー
`Boot → Title(ロゴ) → はじめる → DialogueScene('intro') → CafeScene(ママ) → DialogueScene('cafe_intro') → CafeScene(メニュー) → 出発 → FloorScene(B1) → DialogueScene('b1_intro') → FloorScene → すすむ → BattleScene → 勝利 → FloorScene(stepInFloor++) → …3回→ ボスにいどむ → BattleScene(ボス) → clearFloor() → ResultScene('win')`
- セーブ：CafeSceneで保存、Titleで「つづきから」ロード。

### 検証結果（プレビュー目視）
- bgCafe + npcMama：画面に正しく表示 ✓
- bgStorageB1：暗い倉庫の雰囲気 ✓
- 書類タワー（paperTower）敵スプライト：表示 ✓
- コマンドメニュー（たたかう/とくぎ/どうぐ/にげる＋アイコン）：表示 ✓
- win()「書類タワーをたおした！」勝利ポーズ：表示 ✓
- FloorScene 戻り（魔物 0/3 → 1/3、おじさんが右に進む）：動作 ✓
- runSequence delayedCall：タイマー動作確認済み（enemyHP減少・メッセージ更新）✓
- コンソールエラー：なし ✓
- **eval検証の副作用注意**：`window.__game.scene.start()` (SceneManager直呼び) は現シーンを停止しないため複数シーンが並走するバグが出る。これはテスト手法の問題であり本体のバグではない。本番は `this.scene.start()` (ScenePlugin) 経由で正常動作する。

### Codex 在庫（未採用）
- **背景**：bgEntranceNight / bgExecFloor / bgPresidentRoom / bgTitle / bgEndingEscape / bgGameOver（→ Phase B 残フロア組込時）。
- **敵6種**：vendingSpirit / lastTrainZombie / copierGhost / phoneEye / cardSwarm / sectionChief（→ 各フロアの FLOORS.encounters に追加）。ボス：president。
- **NPC**：npcReception / npcGuard / npcPresidentHuman。仲間：mate_kohai / mate_ol / mate_senpai（→ Phase C）。
- UI：gauge / ui_extended / guard（→ Phase D/E）。

### 既知の問題
- フロアは B1（地下倉庫）のみ実装。1F〜屋上（FLOORS 追加）は Phase B 続きで追加予定。
- 選択肢付き会話（DialogueScene `choices`）は未実装（Phase E 社長戦で必要）。
- 敵の足が少し浮く（背景接地ライン未調整）。許容。
- gauge 未配線（自前バーで代替中。整備は Phase D）。

### 次にやること（順）
1. **FLOORS 追加**（1F〜屋上）：`content.js` の FLOORS 配列に新エントリ追加＋在庫の背景/敵を配線。
2. **Phase C**：2人パーティ（BattleScene に party 配列、run.js に companions）。
3. Phase D（弱点/パターン）→ E（ショップ/3エンディング/選択肢会話）→ F（バランス/独立検証）。
4. **本人の実機プレイ**で通し確認（エンカウントのランダム性・ボス強度・テンポ）を最優先。

### 主に触るファイル
- `src/data/content.js`：FLOORS 追加・敵データ追加が中心。
- `src/scenes/FloorScene.js`：フロア演出（現状シンプル・拡張しやすい構造）。
- `src/state/run.js`：party 追加は Phase C でここに。
- `src/scenes/BattleScene.js`：Phase C でパーティ複数アクター化。

---

## 🔄 引き継ぎ（2026-06-27・その3：短編RPG設計確定＋アート採用＋Phase A着手）

### このセッションでやったこと
- **方針を「30〜60分の短編RPG」に拡張・確定**。`STORY.md`/`GAME_PLAN.md`/`STORY_SCRIPT.md` を新設。
  - 確定：会社=**新谷商事**／拠点=**喫茶のりちゃん**（女主人=**ママ/のりちゃん**）／主人公="おじさん"のまま／トーン**コミカル8:哀愁2**／仲間**2人**／ママ=先人 匂わせ。
  - 構成：**5階層＋拠点**、**軽量な通路移動**（タイルマップ不使用・確定）、2人パーティ、技5〜7、ショップ、セーブ、**3エンディング分岐**（true=帰る/normal=撃破/bad=全滅）。
  - `GAME_PLAN.md`「詳細設計」に 画面遷移図／FLOORS構造／セーブJSONスキーマ／戦闘エッジ（target/kind拡張）／仲間ステ／ショップ価格／社長第2形態 まで明文化。
  - **独立検証4ラウンド**（別エージェント）で 条件付きGo×3→**Go** に収束（穴を都度修正）。
- **発注パッケージ**：`ART_ORDERS.md`（全体台帳）＋`ART_ORDER_PROMPTS.md`（1イラスト=1プロンプトのコピペ用）。
- **役割分担**：**Codex=イラスト生成**（`orders/incoming/<key>/` に納品・**src/public は触らない**）／**Claude=ストーリー＆コード**。`orders/` は `.gitignore`（中間物）。
- **アート採用・組込（実機検証済み・コミット）**：
  - 背景=**夜オフィス**（`battle_office.png`）／**9スライス窓枠**（`drawWindow`→nineslice）／主人公**attack**（こうげき前進中だけ差替）。
  - タイトル**ロゴ**（日本語崩れなし）／**コマンドアイコン4＋カーソル**／主人公ポーズ **cast(とくぎ)・drink(どうぐ/一服)・victory(勝利)**。
- **Phase A 増分1**：`DialogueScene`（データ駆動会話・話者名・手送り）＋`story.js`（`intro`/`cafe_intro`）＋ **Title→導入カットシーン→戦闘** 接続。

### 現状の実機フロー（全部 main に commit 済み／作業ツリーはクリーン）
`Boot→Title(ロゴ)→「はじめる」→startRun→DialogueScene('intro')→BattleScene`（=フロア脱出ラン：イモムシ×2→果物→大仏豚、レベルアップ・脱出/敗北→ResultScene）。
起動：`npm run dev`（5173／プレビューは別ポート自動割当）。最新コミット **`ac04e6d`**。

### Codex 納品済みだが未組込（`orders/incoming/` に在庫・採用待ち）
- **背景**：bgStorageB1 / bgEntranceNight / bgExecFloor / bgPresidentRoom / bgCafe / bgTitle / bgEndingEscape / bgGameOver（オフィス夜のみ採用済み）。
- **敵7種**：paperTower / vendingSpirit / lastTrainZombie / copierGhost / phoneEye / cardSwarm / sectionChief。**ボス=president**。
- **NPC4**：npcMama / npcReception / npcGuard / npcPresidentHuman。**仲間3**：mate_kohai / mate_ol / mate_senpai。
- **UI**：gauge（配置のみ）・ui_extended・item_extra_set・主人公 guard。
- → これらは **Phase A/B のシーン（拠点・フロア・エンカウント）が出来て初めて画面に出る**。組込時は `orders/incoming/<key>/extracted/*` を `public/` にコピー＋`assets.js`登録＋データ配線（背景はそのまま画像、敵/NPCは `content.js`/`story.js`）。

### 既知の問題・未解決
- **敵が床より少し浮く**（リアル背景化で目立つ）。Phase B/総差し替え時に `LAYOUT.enemyY` を下げて接地を検討（今は許容・本人OK）。
- gauge 未配線（HUD整備時にまとめて。現行の自前バーは綺麗）。guard 未配線（ぼうぎょは Phase D）。
- バランス・テンポ未調整（実機プレイ後に `content.js`/`LEVEL_TABLE` で）。
- DialogueScene の**選択肢**は未実装（社長戦 go/fight＝Phase E で追加）。

### 次にやること（順）
1. **Phase A 増分2**：`CafeScene`＝喫茶のりちゃん（メニュー：はなす/ほじゅう/セーブ/出発・`cafe_intro`再生）＋**セーブ/ロード**（`localStorage 'ojisanQuest.save'`・`GAME_PLAN`スキーマ）＋ Title「つづきから」。遷移を Title→導入→拠点→出発→戦闘 に。
2. **Phase B**：`FloorScene`（軽量通路ノード）＋エンカウント抽選＋階ボス。`FLOOR_RUN`→`FLOORS`（5階）。**ここで在庫の背景/敵/NPCを順次採用・配線**。
3. Phase C（2人パーティ＝BattleScene複数アクター化）→ D（弱点/敵パターン）→ E（解放イベント/3エンディング/ショップ）→ F（バランス/独立検証Go）。`GAME_PLAN.md` ロードマップ参照。

### 主に触るファイル
- `src/scenes/`：BattleScene（戦闘＋ポーズ）/ TitleScene / ResultScene / DialogueScene。今後 CafeScene・FloorScene を追加。
- `src/data/`：content.js（敵/技/LEVEL_TABLE/FLOOR_RUN）/ assets.js（キー→パス・採用窓口）/ story.js（脚本）。
- `src/state/run.js`：ラン状態＋grantExp。Phase C で party 配列＋save/load を足す。

### git/検証メモ
- 匿名 `hoikuen`、コミット末尾 `Co-Authored-By: Claude Opus 4.8`。`orders/`・`.claude/`・`node_modules/`・`dist/` 非追跡。
- 設計＝**独立エージェント4ラウンドでGo**。実装＝`npm run build`＋**実起動パスを `game.step()` 手動駆動**＋スクショで確認（プレビューはhiddenタブでrAF停止のため。create()を迂回しない＝MISTAKES教訓）。**最終確認は本人の実機プレイ**。

---

## 🔄 引き継ぎ（2026-06-27・その2：フロア脱出ラン＋発注準備）

### 今セッションでやったこと
- **発注パッケージ追加**：`docs/ART_ORDERS.md`。attackポーズ／バトル背景／UIセットのASSET_LIST＋コピペ用発注プロンプト（キャラ同一性・配色・寸法を既存実装に整合）。生成素材は本人OK後に組込（AGENTS.md）。コミット `4237f15`。
- **「1戦闘→タイトル」を「B1フロアの脱出ラン」に拡張**（既存アセットのみ・新規発注ゼロ）：
  - 連戦 `caterpillar → caterpillar → fruitGirl → buddhaPig(ボス)` を順に戦う。HP/MP・レベル・経験値・お金・持ち物が戦闘をまたいで継続。
  - **EXP/レベルアップを実際に反映**（従来はメッセージだけ）。レベルアップでステータス更新＋HP/MP全回復、Lv3で `heavySwing`（本気の一振り）習得。
  - ボス（最後の敵）撃破→**脱出エンディング**、力尽き→**ゲームオーバー**。どちらも新規 `ResultScene` 経由でタイトルへ。
  - 戦闘画面に**フロア進捗HUD**（左上「地下倉庫フロア / 魔物 n/4」）。
- **薄い状態モジュール `src/state/run.js` を新設**：ラン状態（player参照・queue・index）と `grantExp/grantGold` を集約。エンジンは薄く・内容はデータ（RESKIN）を維持。
- 敵 `buddhaPig`（大仏豚ぶちょう・`isBoss`）と `LEVEL_TABLE` / `FLOOR_RUN` / `heavySwing` を `content.js` に追加。`fruitGirl` のHPを30→34に微調整。
- `vite.config.js`：dev/previewの `server.port` を `process.env.PORT || 5173` に（プレビューツールが別ポートを割り当てても起動できるように。ローカル既定は5173のまま）。

### 検証（実起動パスで確認・MISTAKES準拠）
- `npm run build` 通過（15 modules）。プレビュー起動→**コンソールエラーなし**。
- 実起動パスを手動ステップで駆動して全行程を確認（rAFがhiddenで止まるため `game.step()` でループ自体を回す＝ojioji教訓どおり create() を迂回しない）：
  - Title→Enter→ラン開始、`battle.player === run.player`（参照共有＝HP/MP継続の要）を確認。
  - 連戦遷移：勝利→`grantExp`/`grantGold`→`advance()`→`scene.restart()`→次の敵。exp/goldが累積継続。
  - レベルアップ発火：Lv2（38/38に全回復）→Lv3（`heavySwing`習得）→Lv4。
  - ボス撃破→`ResultScene`「定時退社！」＋最終ステータス（Lv4 / 57/57 / 80G）表示。
  - スクショで戦闘UI（フロアHUD・敵HP・ステータス窓・コマンド）を目視確認（崩れなし）。
- ※注意：`win()` 内の `advance()` は同期実行だが**画面のrestartはメッセージ送り完了後**。なので「index は次に進んでいるが画面はまだ撃破した敵を表示」という瞬間がある（仕様どおり・バグではない）。
- **未検証＝敗北→ResultScene('lose')の実走**（勝ち筋と対称・低リスク）と**バランス**。→ 本人の実機プレイが本番。

### 既知の問題・未解決
- attackポーズ未発注（idle前進トゥイーンで代用）／UI・背景はGraphicsプレースホルダのまま → `docs/ART_ORDERS.md` で発注準備済み。
- ボスに専用の被弾/撃破コマは未使用（フェード撃破）。`enemyBossHurt` はロード済みだが敗北演出と同様、現状未使用。
- バランス未調整（敵HP/atk・EXP曲線・レベル増分）。実機プレイ後に `content.js`/`LEVEL_TABLE` で調整。
- 床ライン y=430 と足元 y=360 の浮きは未対応（背景画像差替時にまとめて調整）。

### 次にやること
1. **本人の実機プレイ**で通し（Title→4連戦→脱出 / 途中で敗北）を確認し、バランス/テンポを調整。
2. 画像が用意できたら `ART_ORDERS.md` の手順で抽出→差替（背景→attack→UIの順が手応え大）。
3. フロアを増やす：`FLOOR_RUN` を複数フロア化 or `ENCOUNTERS` 抽選に発展。仲間追加はparty配列化で。
4. （任意）拠点＝喫茶店でのセーブ/補給。

### 主に触るファイル（更新）
- `src/state/run.js` … ラン状態＋レベリング（**新規・継続の本体**）
- `src/scenes/BattleScene.js` … 戦闘＋連戦遷移＋勝敗演出
- `src/scenes/ResultScene.js` … 脱出/敗北の結末（**新規**）
- `src/data/content.js` … 敵/とくぎ/LEVEL_TABLE/FLOOR_RUN（全データ）
- `docs/ART_ORDERS.md` … 発注パッケージ（**新規**）

### git運用メモ
- 上記コードは**未コミット**（`docs/ART_ORDERS.md` の `4237f15` までがコミット済み）。本人の実機プレイ確認後にまとめてコミット予定。
- `.claude/launch.json` に `autoPort:true` を追加（非追跡なので影響なし）。`vite.config.js` のPORT対応は追跡対象＝要コミット。

---

## 🔄 引き継ぎ（2026-06-27）

### 今セッションでやったこと
- ドキュメントのみの状態から、**戦闘の最小ループを新規実装**して動かした（コミット `46659a0`）。
- 構成：**Phaser 3.80 + Vite 5**、3シーン（Boot → Title → Battle）。物理エンジンは未使用（ターン制のため不要）。
- 流用アセットを **実体コピー**（自己完結リポ化）：`public/assets/sprites/extracted/` 配下に
  主人公A案（idle/hurt/walk）、イモムシ社員、果物メガネ女子、大仏豚ボス。元は `~/Developer/games/ojisan-hop/assets/sprites/extracted/`。
- **データ駆動**：`src/data/content.js`（PLAYER / SKILLS / ITEMS / RPG_ENEMIES / ENCOUNTERS / FIRST_BATTLE）、
  `src/data/assets.js`（キー→パスの IMAGES マニフェスト）。エンジンは薄く、内容はデータで増やす方針（RESKIN）。
- **戦闘エンジン** `src/scenes/BattleScene.js`：素早さ順ターン制（ATBなし）、コマンド
  たたかう／とくぎ（気合いの一喝・一服する）／どうぐ（栄養ドリンク）／にげる、勝敗→タイトル遷移、
  攻撃トゥイーン・赤フラッシュ・ダメージ数字・HP/MPバー（全部Graphicsのプレースホルダ）。
- **物語前提を確定**：「定時に帰れない呪い」（後述）。`docs/GAME_DESIGN.md` と `README.md` に反映済み。
- **本人フィードバックでUI調整**（実プレイ確認しながら）：
  - ステータス窓を右→**左下に小型化**（120×88）。主人公スプライト（左端≈x144）の左隣に置き被らせない。下端を下のメッセージ枠(y=440)に接地。
  - コマンド/とくぎを2列→**縦1列**（長い技名の被り解消）。
  - 被弾演出を見直し（後述「直したバグ」）。

### 今まさに作業中／未コミットの変更
- **なし**（作業ツリーはクリーン。最小ループ＋UI調整は `46659a0` に全てコミット済み）。
- このログ `docs/PROJECT_LOG.md` 追加分のみ（この後コミット予定）。

### 既知の問題・未解決
- **主人公に attack ポーズが無い**（idle/hurt/walk のみ）。攻撃は「idleのまま前進トゥイーン」で代用中。→ attack絵の発注が必要。
- **プレビュー環境(Claude_Preview / port 5182)が不安定**（MISTAKES.md記載の複数コンテキスト問題）：
  - Phaserが複数回初期化され、**evalで触る文脈と描画文脈が別**。
  - `game.step()` で手動駆動するとスクショ用キャンバスが壊れる（細い黒帯になる）。
  - **検証のコツ**：ロジック確認＝`window.__game` を取得し `game.step(now,16)` を手動ループで進めて状態を読む（決定的）。
    視覚確認＝`location.reload()` 後にスクショ。入力は `KeyboardEvent('keydown',{key:'Enter',...})` を **window だけに単発dispatch**
    （window+documentの両方に投げると二重発火する）。**最終確認は本人の実機プレイが本番**。
- `enemyFruitHurt` / `enemyBossHurt` のテクスチャはロード済みだが現状未使用（被弾で絵を差し替えない方針にしたため）。無害。
- 主人公の足元 y=360 に対し背景の床ラインが y=430（少し浮いて見える）。今は未対応の軽微な見た目。

### 直したバグ（今セッション）
- **被弾時に主人公が「左に消える」**：毎ヒットで `hurt.png`（大きく左へ倒れ込むノックバック絵）に差し替えていたのが原因。
  足元基準固定のため倒れ込む胴体が上方に寄り、立ち位置から飛んで見えていた。
  → **通常被弾は赤フラッシュ＋小さなのけぞりのみ**に変更（idle維持）。倒れ込み絵は**敗北(力尽きた)演出だけ**で使用。

### 次にやること（具体・手順）
1. **敵/とくぎ/エンカウントを増やす**：`src/data/content.js` に追記するだけ（コード不変）。
   例：`RPG_ENEMIES.fruitGirl` は定義済みなので `FIRST_BATTLE.enemy` を差し替えれば別の敵で戦える。
2. **主人公の attack ポーズを発注**：`~/Developer/games/_starter-kit/pipeline/ORDER_PROMPT_TEMPLATES.md`(③フォーム/ポーズ派生)で
   idleを参照画像に添付して発注 → `extract_better.py`(flood-fill) で抽出 → `public/assets/sprites/extracted/player/attack.png` に配置 →
   `src/data/assets.js` にキー追加 → `BattleScene.attackSteps`/`lunge` で使用。
   ※生成素材は本人確認なしに組み込まない（AGENTS.md）。
3. **バトル背景・UI画像（コマンド枠/HPバー/アイコン）を発注**して、現状のGraphicsプレースホルダと差し替え。
4. **拠点（喫茶店）＋フロア移動＋エンカウント抽選**：`ENCOUNTERS` の構造は用意済み（エリア→敵編成/出現率）。
5. 節目では `VERIFICATION_ROUTINE.md` に従い**別の独立エージェントで検証**してからGo（自己チェックだけで完成宣言しない）。

### ローカル起動URL・主に触るファイル
- 起動：`cd ~/Developer/games/ojisan-quest && npm run dev` → **http://localhost:5173/**（プレビューツールは5182を使っていた）。
- ビルド確認：`npm run build`（変更後は必ず）。
- 主なファイル：
  - `src/scenes/BattleScene.js` … 戦闘エンジン＋UI（**ここが本体**）
  - `src/data/content.js` … 全ゲームデータ（敵/とくぎ/どうぐ/エンカウント/主人公ステータス）
  - `src/data/assets.js` … アセットのキー→パス（差し替え窓口）
  - `src/constants.js` … GAME_W/H・COLORS・LAYOUT（立ち位置・サイズの数値はここが正）
  - `src/scenes/BootScene.js` / `TitleScene.js`
  - `docs/GAME_DESIGN.md` … 設計・物語前提・進捗

### 今セッションで決めた方針・判断
- **物語前提＝「定時に帰れない呪い」**：残業の夜、おじさんは謎の力で会社ビルに閉じ込められた。各階の“残業の魔物”
  （魔物化した社員・役職者）を倒し、**定時退社＝ビルからの脱出**を目指す。拠点＝喫茶店、最上階の社長室＝ラスボス。コミカル哀愁トーン。
- **戦闘の“一捻り”は保留**：MVPは王道のまま（属性・弱点なし）。動いてから検討。
- **作りやすさ最優先**：正面ビュー・素早さ順ターン制（ATBなし）・主人公1人パーティから。仲間は後でデータ追加。
- **エンジンは薄く・データは厚く**（RESKIN）。内容を増やす＝`content.js` を編集、コードは触らない。
- **UIレイアウト確定値**（本人OK済み）：ステータス窓＝左下・小型・おじさん左隣・下枠に接地／コマンド・とくぎ＝縦1列／
  被弾＝赤フラッシュ＋小のけぞり、倒れ込み絵は敗北時のみ。
- **git運用**：author は匿名 `hoikuen`、コミット末尾に `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`（ojisan-x等と同じ慣習）。
  `.claude/`（サンドボックス/ローカルlaunch設定）は**非追跡**（`.gitignore` に追加済み。ojisan-xに倣う）。
