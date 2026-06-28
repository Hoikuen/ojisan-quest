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

  // ── 敵（B1：書類タワー[新規]／転がるカバンの主[流用]）──────────
  enemyPaperIdle: `${S}/enemy_paper/idle.png`,
  enemyRollingBagIdle: `${S}/enemy_rolling_bag/idle.png`,

  // ── 敵（1F：自販機の精・終電ゾンビ／受付の主＝課長ロボ流用）────
  enemyVendingIdle: `${S}/enemy_vending/idle.png`,
  enemyZombieIdle: `${S}/enemy_zombie/idle.png`,
  enemySectionChiefIdle: `${S}/enemy_section_chief/idle.png`,

  // ── 敵（中層：コピー機オバケ・スマホ目玉・名刺の群れ）──────────
  enemyCopierIdle: `${S}/enemy_copier/idle.png`,
  enemyPhoneIdle: `${S}/enemy_phone/idle.png`,
  enemyCardIdle: `${S}/enemy_card/idle.png`,

  // ── ラスボス：社長（屋上）─────────────────────────────────────
  enemyPresidentIdle: `${S}/enemy_president/idle.png`,

  // ── 背景・NPC・UI（発注・採用済み。後でトータル差し替え予定）──
  battleOffice: `${BG}/battle_office.png`,
  bgStorageB1: `${BG}/storage_b1.png`,
  bgEntranceNight: `${BG}/entrance_night.png`,
  bgOfficeNight: `${BG}/office_night.png`,
  bgExecFloor: `${BG}/exec_floor.png`,
  bgPresidentRoom: `${BG}/president_room.png`,
  bgEndingEscape: `${BG}/ending_escape.png`,
  bgGameOver: `${BG}/game_over.png`,
  bgCafe: `${BG}/cafe.png`,
  npcMama: `${S}/npc_mama/idle.png`,
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

  // ── 仲間：後輩くん（男性・若手社員）──────────────────────────
  kohaiIdle: `${S}/young_salaryman/idle.png`,
  kohaiHurt: `${S}/young_salaryman/hurt.png`,

  // ── 仲間：OL田中さん（女性・スーツ・メガネ）─────────────────
  olIdle: `${S}/office_lady/idle.png`,
  olHurt: `${S}/office_lady/hurt.png`,

  // ── フロア扉スプライト ────────────────────────────────────────
  doorNormal: `${S}/door_normal/idle.png`,
  doorBoss: `${S}/door_boss/idle.png`,
};
