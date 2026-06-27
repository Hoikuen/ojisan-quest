// アセットの「キー→パス」単一窓口（RESKIN.md の差し替え点1）。
// 実画像が来たら public/ 配下の同名PNGを上書きするだけで差し替わる（コード変更ゼロ）。
// パスは先頭スラッシュ無しの相対参照（base付きビルドでも壊れない）。
const S = 'assets/sprites/extracted';
const BG = 'assets/backgrounds';
const UI = 'assets/ui';

export const IMAGES = {
  // ── 主人公おじさん（流用：A案 normal）─────────────────────────
  // idle / hurt / attack。attack は発注・採用済み（前進トゥイーン中だけ差し替える）。
  playerIdle: `${S}/player/idle.png`,
  playerHurt: `${S}/player/hurt.png`,
  playerAttack: `${S}/player/attack.png`,
  playerCast: `${S}/player/cast.png`,
  playerDrink: `${S}/player/drink.png`,
  playerVictory: `${S}/player/victory.png`,
  playerGuard: `${S}/player/guard.png`,

  // ── バトル背景・UI（発注・採用済み。後でトータル差し替え予定）──
  battleOffice: `${BG}/battle_office.png`,
  uiWindow: `${UI}/window.png`,
  uiGauge: `${UI}/gauge.png`,
  uiCursor: `${UI}/cursor.png`,
  iconAttack: `${UI}/icon_attack.png`,
  iconSkill: `${UI}/icon_skill.png`,
  iconItem: `${UI}/icon_item.png`,
  iconFlee: `${UI}/icon_flee.png`,
  logoTitle: `${UI}/logo_title.png`,

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
