# PROJECT_LOG — おじさんクエスト

新しいチャット（履歴なし）で続きを作るための作業ログ。**最新の「🔄 引き継ぎ」を最初に読むこと。**
併せて読む：`docs/GAME_DESIGN.md`（設計・物語前提・進捗）、リポジトリ直下 `CLAUDE.md`、
`~/Developer/games/` 直下の `AGENTS.md` / `PHASER3_CONSTRAINTS.md` / `VERIFICATION_ROUTINE.md` / `MISTAKES.md`。

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
