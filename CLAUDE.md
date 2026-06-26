# CLAUDE.md — おじさんクエスト（ojisan-quest）

おじさんを主人公にした **オリジナルのターン制コマンドバトルRPG**。タイトルは『おじさんクエスト』。
特定作品のパロディではなく、**王道ターン制RPGの分かりやすい型**で、作りやすさを最優先にする。
Phaser 3 + Vite 想定。キャラ・敵・世界観はオリジナル（おじさんユニバース流用）。

> 共通ルール：有名作の固有キャラ・名称・ロゴ・音楽・固有の見た目は使わない（全部おじさんオリジナル）。

このファイルは入口。Codex/Antigravity も同じルール。

## まず読むもの（この順）
1. このリポジトリの CLAUDE.md と `docs/GAME_DESIGN.md`
2. `~/Developer/games/_starter-kit/README.md` / `CHARACTER_UNIVERSE.md` / `scaffold/RESKIN.md` と `content.example.js`（RPGデータ例）
3. `~/Developer/games/AGENTS.md` / `PHASER3_CONSTRAINTS.md` / `VERIFICATION_ROUTINE.md` / `MISTAKES.md`

## 場所とルール
- コードの場所：`~/Developer/games/ojisan-quest`（Dropbox外）。
- **git identity は匿名固定**（hoikuen / 295981446+Hoikuen@users.noreply.github.com）。コミット前に `git config user.name` を確認。
- GitHub：必要になったら Private で（外向き操作は本人確認の上で）。
- 流れ：設計→プレースホルダで動かす→発注→抽出→組込→検証。**実機プレイが最強の検証**。
- 1リポジトリ=1担当チャット。同時編集しない。こまめに commit。

## 作りやすさ最優先の方針（重要）
- **正面ビューのコマンド戦闘**（敵は前方に表示、キャラは静止スプライトでOK）。
- **行動順は素早さ順のターン制**（ATB/リアルタイム無し＝実装が一番単純）。
- まずは **主人公おじさん1人パーティ**で「1戦闘が回る」ところから。仲間は後で足せる構造に。
- 主人公（A案）は **idle/attack/hurt の3ポーズで成立**＝新規アニメ発注ほぼ不要。
- 敵ロスター（イモムシ社員・果物メガネ女子・バナナ筋肉女子・大仏豚ボス 等）を `ojisan-hop` から流用。
- 新規発注が要るのは主に：バトル背景・NPC（店主/"社長"等）・UI（コマンド枠/HPバー/アイコン）・フィールドのタイル。
