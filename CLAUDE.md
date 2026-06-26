# CLAUDE.md — ojisan-rpg

おじさんを主人公にした **ターン制コマンドバトルRPG**（おじさんユニバースの新作）。
Phaser 3 + Vite 想定。キャラ・敵・世界観はオリジナル（既存のおじさんゲーム資産を流用）。

このファイルは入口。Codex/Antigravity は `AGENTS.md`（無ければ下記の共通AGENTS）を見るが、ルールは同一。

## まず読むもの（この順）
1. `~/Developer/games/_starter-kit/README.md` — 新ゲームの進め方
2. `~/Developer/games/_starter-kit/CHARACTER_UNIVERSE.md` — 流用できるキャラ資産の正本
3. `~/Developer/games/_starter-kit/scaffold/RESKIN.md` と `content.example.js`（RPGのデータ駆動例つき）
4. `~/Developer/games/AGENTS.md` / `PHASER3_CONSTRAINTS.md` / `VERIFICATION_ROUTINE.md` / `MISTAKES.md`
5. このリポジトリの `docs/GAME_DESIGN.md`（骨子。未確定事項あり＝そこを詰める）

## 場所とルール
- コードの場所：`~/Developer/games/ojisan-rpg`（Dropbox外）。
- **git identity は匿名固定**（hoikuen / 295981446+Hoikuen@users.noreply.github.com）。コミット前に `git config user.name` を確認。
- GitHub：必要になったら Private で `gh repo create Hoikuen/ojisan-rpg --private` 等（外向き操作は本人確認の上で）。
- 流れ：設計→プレースホルダで動かす→発注→抽出→組込→検証。**実機プレイが最強の検証**。
- イラスト発注は `_starter-kit/pipeline/ORDER_PROMPT_TEMPLATES.md`。抽出は `_starter-kit/pipeline/extract_sheet.py`。
- このリポジトリを他チャット/AIと同時編集しない（1リポジトリ=1担当チャット）。こまめに commit。

## 流用の方針（RPGはアニメ負担が軽い＝3ポーズで足りる）
- 主人公おじさん（A案）：idle/attack/hurt があれば成立。`ojisan-hop`/`ojisan-x` から流用。
- 敵ロスター：caterpillar社員・果物メガネ女子・バナナ筋肉女子・大仏豚ボス 等を `ojisan-hop` から流用。
- 新規が要るのは主に：バトル背景・NPC・UI（コマンド枠/HPバー/アイコン）・フィールドのタイル。
