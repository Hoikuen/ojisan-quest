# CLAUDE.md — おじさんクエスト（ojisan-quest）

おじさんを主人公にした **ターン制コマンドバトルRPG**。ドラゴンクエスト風の"構造"をリスペクトしたパロディ。
Phaser 3 + Vite 想定。キャラ・敵・世界観はオリジナル（おじさんユニバース流用）。

> **パロディの線引き（厳守）**：借りるのは**ジャンルの構造と愛あるオマージュのトーンだけ**。
> ドラクエ固有のモンスター（スライム等）・呪文名・地名・ロゴ・音楽・固有の見た目はコピーしない。
> 敵・技・呪文・地名・UI文言は**全ておじさんオリジナル**にする（YouTube公開を想定）。

このファイルは入口。Codex/Antigravity も同じルール。

## まず読むもの（この順）
1. このリポジトリの CLAUDE.md と `docs/GAME_DESIGN.md`（骨子・未確定事項あり）
2. `~/Developer/games/_starter-kit/README.md` / `CHARACTER_UNIVERSE.md` / `scaffold/RESKIN.md` と `content.example.js`（RPGデータ例）
3. `~/Developer/games/AGENTS.md` / `PHASER3_CONSTRAINTS.md` / `VERIFICATION_ROUTINE.md` / `MISTAKES.md`

## 場所とルール
- コードの場所：`~/Developer/games/ojisan-quest`（Dropbox外）。
- **git identity は匿名固定**（hoikuen / 295981446+Hoikuen@users.noreply.github.com）。コミット前に `git config user.name` を確認。
- GitHub：必要になったら Private で（外向き操作は本人確認の上で）。
- 流れ：設計→プレースホルダで動かす→発注→抽出→組込→検証。**実機プレイが最強の検証**。
- 1リポジトリ=1担当チャット。同時編集しない。こまめに commit。

## 流用の方針（RPGはアニメ負担が軽い＝3ポーズで足りる）
- 主人公おじさん（A案）：idle/attack/hurt があれば成立。`ojisan-hop`/`ojisan-x` から流用。
- 敵ロスター：イモムシ社員・果物メガネ女子・バナナ筋肉女子・大仏豚ボス 等を流用（おじさん固有の敵なので問題なし）。
- 新規が要るのは主に：バトル背景・NPC（町の人/店主/"社長"等）・UI（コマンド枠/HPバー/アイコン）・フィールドのタイル。
