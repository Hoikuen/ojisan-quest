// アセットの「キー→パス」単一窓口（RESKIN.md の差し替え点1）。
// 実画像が来たら public/ 配下の同名PNGを上書きするだけで差し替わる（コード変更ゼロ）。
// パスは先頭スラッシュ無しの相対参照（base付きビルドでも壊れない）。
const S = 'assets/sprites/extracted';

export const IMAGES = {
  // ── 主人公おじさん（流用：A案 normal）─────────────────────────
  // 現状あるコマ：idle / hurt / walk_1..4。attack ポーズは未発注なので
  // 当面は idle のまま前進トゥイーンで「攻撃」を表現する（後で attack を発注）。
  playerIdle: `${S}/player/idle.png`,
  playerHurt: `${S}/player/hurt.png`,

  // ── 敵：イモムシ社員（最小ループの最初の1体）────────────────
  enemyCaterpillarIdle: `${S}/enemy_caterpillar/idle.png`,
  enemyCaterpillarDefeated: `${S}/enemy_caterpillar/defeated.png`,

  // ── 敵：果物メガネ女子（hurtコマあり・差し替え候補）──────────
  enemyFruitIdle: `${S}/enemy_fruit/idle.png`,
  enemyFruitHurt: `${S}/enemy_fruit/hurt.png`,

  // ── ボス：大仏豚（後半用・今は読み込みだけ）──────────────────
  enemyBossIdle: `${S}/enemy_boss/idle.png`,
  enemyBossHurt: `${S}/enemy_boss/hurt.png`,
};
