// 画面・配色・レイアウトの基本定数。数値はここを正とする（TUNING相当）。
export const GAME_W = 800;
export const GAME_H = 600;

// 配色（プレースホルダUI。後で発注したUI画像に差し替え予定）
export const COLORS = {
  bgTop: 0x2a2740,      // バトル背景（上）：夜のオフィスっぽい紫紺
  bgBottom: 0x14121f,   // バトル背景（下）：床側を暗く
  windowFill: 0x0b0d1a, // メッセージ/コマンド枠の地色
  windowEdge: 0xf4f4ff, // 枠の白縁（王道RPGの白枠）
  hpGreen: 0x49d65b,
  hpYellow: 0xe8c84a,
  hpRed: 0xe05a4a,
  mpBlue: 0x4aa8e8,
  cursor: 0xffe24a,
  text: '#ffffff',
  textDim: '#aab0c8',
};

// バトル立ち位置（正面ビュー：プレイヤー左手前・敵右奥）
export const LAYOUT = {
  enemyX: 540,
  enemyY: 250,
  enemyH: 200,        // 敵の表示高さ（displayHeight）
  playerX: 210,
  playerY: 360,
  playerH: 175,       // プレイヤーの表示高さ
};
