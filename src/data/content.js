// ゲーム内容＝データ（RESKIN.md の差し替え点2）。エンジンはこれを読むだけ。
// 敵・とくぎ・どうぐ・エンカウントを増やす＝ここに足すだけ（コードは触らない）。
// 物語前提：「定時に帰れない呪い」——残業の夜、おじさんは会社ビルに閉じ込められた。
// 各階の“残業の魔物”を倒し、定時退社＝ビルからの脱出を目指す。

// ── 主人公（1人パーティ。仲間は後で配列化して足せる）────────────
export const PLAYER = {
  name: 'おじさん',
  sprite: 'playerIdle',
  hurtSprite: 'playerHurt',
  level: 1,
  exp: 0,    // 累積経験値（LEVEL_TABLE.expToReach と比較してレベルアップ）
  gold: 0,
  hp: 30, maxHp: 30,
  mp: 8, maxMp: 8,
  atk: 8,
  def: 5,
  spd: 6,
  skills: ['shout', 'coffee'], // 習得済みとくぎ（SKILLS のキー）
};

// ── レベル設計（成長）──────────────────────────────────────────
// level1 は PLAYER の開始値と一致させる。expToReach＝そのレベルに上がる累積EXPしきい値。
// レベルアップ時はステータスをこの行の値に更新し、HP/MPは全回復（王道）。learn があればとくぎ習得。
export const LEVEL_TABLE = [
  { level: 1, expToReach: 0,   maxHp: 30, maxMp: 8,  atk: 8,  def: 5,  spd: 6 },
  { level: 2, expToReach: 30,  maxHp: 38, maxMp: 10, atk: 10, def: 6,  spd: 7 },
  { level: 3, expToReach: 75,  maxHp: 47, maxMp: 13, atk: 12, def: 7,  spd: 8, learn: 'heavySwing' },
  { level: 4, expToReach: 150, maxHp: 57, maxMp: 16, atk: 15, def: 9,  spd: 9 },
  { level: 5, expToReach: 260, maxHp: 70, maxMp: 20, atk: 18, def: 11, spd: 10 },
];

// ── とくぎ（kind＋params。エンジンは kind を見て分岐）────────────
export const SKILLS = {
  shout:   { name: '気合いの一喝', kind: 'attack', power: 1.8, cost: 4, target: 'enemy',
             msg: '{user}は 腹の底から 一喝した！' },
  coffee:  { name: '一服する',     kind: 'heal',   amount: 16, cost: 3, target: 'self',
             msg: '{user}は 缶コーヒーで 一服した。' },
  // Lv3 で習得（LEVEL_TABLE.learn）。強力な単発攻撃。
  heavySwing: { name: '本気の一振り', kind: 'attack', power: 2.4, cost: 6, target: 'enemy',
                msg: '{user}は 本気で 振りかぶった！' },

  // ── 後輩鈴木くん 固有 ──────────────────────────────────────
  canThrow:   { name: '缶コーヒー投げ', kind: 'attack',    power: 1.3, cost: 2, target: 'enemy',
                msg: '{user}は 頭の缶コーヒーを 投げつけた！' },
  rallyCry:   { name: 'ファイト注入',   kind: 'healParty', amount: 10, cost: 5,
                msg: '{user}は 全員に 気合いを 注入した！' },

  // ── OL田中さん 固有 ────────────────────────────────────────
  paperSlap:    { name: '書類でなぐ',     kind: 'attack',   power: 1.2, cost: 2, target: 'enemy',
                  msg: '{user}は 書類を ビシッと 振り下ろした！' },
  careSupport:  { name: '気遣いフォロー', kind: 'healAlly', amount: 18, cost: 4,
                  msg: '{user}は 仲間を 気遣って ケアした。' },
};

// ── どうぐ（持ち物。count はランタイムで消費。price はショップ購入価格）────
export const ITEMS = {
  drink:   { name: '栄養ドリンク', kind: 'heal',   amount: 20, count: 3, price: 40,
             msg: '{user}は 栄養ドリンクを 飲んだ！' },
  hiDrink: { name: '高級エナジー', kind: 'heal',   amount: 40, count: 0, price: 80,
             msg: '{user}は 高級エナジーを 飲んだ！' },
  mpDrink: { name: 'MPリカバリー', kind: 'mpHeal', amount: 10, count: 0, price: 35,
             msg: '{user}は MPリカバリーを 飲んだ。' },
};

// ── ショップ品リスト（拠点で購入できる順番・ITEMS のキーを参照）──
export const SHOP = [
  { itemKey: 'drink',   price: 40 },
  { itemKey: 'hiDrink', price: 80 },
  { itemKey: 'mpDrink', price: 35 },
];

// ── 敵（hp/atk/def/spd/exp/gold/sprite/skills）──────────────────
// skills は SKILLS のキー or 簡易インライン定義。最小ループでは素の攻撃のみ。
export const RPG_ENEMIES = {
  caterpillar: {
    name: 'イモムシ社員',
    sprite: 'enemyCaterpillarIdle',
    defeatedSprite: 'enemyCaterpillarDefeated',
    hp: 18, atk: 6, def: 2, spd: 4, exp: 5, gold: 4,
    flavorAppear: 'イモムシ社員が 残業から わいて出た！',
    actions: [
      { name: 'たいあたり', kind: 'attack', power: 1.0,
        msg: 'イモムシ社員の たいあたり！' },
    ],
  },
  // 中層 階ボス（主任＝果物メガネ女子。旧スライスの雑魚から格上げ）
  fruitGirl: {
    name: '果物メガネ女子',
    sprite: 'enemyFruitIdle',
    hurtSprite: 'enemyFruitHurt',
    flipX: true,
    isBoss: true,
    hp: 90, atk: 16, def: 8, spd: 9, exp: 34, gold: 60,
    flavorAppear: '主任——果物メガネ女子が 立ちふさがった！',
    actions: [
      { name: 'いちご投げ', kind: 'attack', power: 1.2, msg: '果物メガネ女子の いちご投げ！' },
      { name: '会議延長',   kind: 'attack', power: 1.6, msg: '果物メガネ女子は 会議を 延長した！　精神に くる！' },
    ],
  },
  // 上層 階ボス（部長＝大仏豚ぶちょう。終盤向けにステータス強化）
  buddhaPig: {
    name: '大仏豚ぶちょう',
    sprite: 'enemyBossIdle',
    hurtSprite: 'enemyBossHurt',
    flipX: true,
    isBoss: true,
    hp: 95, atk: 16, def: 9, spd: 6, exp: 40, gold: 80,
    flavorAppear: 'このフロアの主——大仏豚ぶちょうが 立ちはだかった！',
    actions: [
      { name: 'おやつ投げ', kind: 'attack', power: 1.0, msg: '大仏豚ぶちょうは おやつを 投げつけた！' },
      { name: '残業の圧',   kind: 'attack', power: 1.7, msg: '大仏豚ぶちょうは 残業の圧を かけてきた！' },
    ],
  },
  // B1 雑魚（新規アート）
  paperTower: {
    name: '書類タワー',
    sprite: 'enemyPaperIdle',
    hp: 22, atk: 7, def: 3, spd: 5, exp: 7, gold: 6,
    flavorAppear: '書類タワーが ぐらりと 傾いた！　崩れる気だ！',
    actions: [
      { name: '書類なだれ', kind: 'attack', power: 1.1, msg: '書類タワーの 書類なだれ！' },
    ],
  },
  // B1 階ボス（流用：転がるカバン）
  rollingBagLord: {
    name: '転がるカバンの主',
    sprite: 'enemyRollingBagIdle',
    isBoss: true,
    hp: 36, atk: 7, def: 3, spd: 7, exp: 18, gold: 30,
    flavorAppear: '転がるカバンの主が ゴロゴロと 道をふさいだ！',
    actions: [
      { name: '体当たり',   kind: 'attack', power: 1.2, msg: '転がるカバンの主が 突進してきた！' },
      { name: '書類ばらまき', kind: 'attack', power: 0.9, msg: '転がるカバンの主が 書類を ばらまいた！' },
    ],
  },

  // ── 1F ロビー受付（雑魚2＋階ボス）──────────────────────────────
  vendingSpirit: {
    name: '自販機の精',
    sprite: 'enemyVendingIdle',
    hp: 30, atk: 9, def: 5, spd: 5, exp: 9, gold: 8,
    flavorAppear: '自販機の精が 釣り銭を 切らして 怒っている！',
    actions: [
      { name: '釣り銭ビーム', kind: 'attack', power: 1.1, msg: '自販機の精の 釣り銭ビーム！' },
    ],
  },
  lastTrainZombie: {
    name: '終電ゾンビ社員',
    sprite: 'enemyZombieIdle',
    hp: 34, atk: 10, def: 5, spd: 4, exp: 10, gold: 9,
    flavorAppear: '終電ゾンビ社員が 吊り革を 握りしめて 迫る！',
    actions: [
      { name: '寝落ちタックル', kind: 'attack', power: 1.1, msg: '終電ゾンビ社員の 寝落ちタックル！' },
    ],
  },
  // 1F 階ボス（受付の主＝課長ロボを流用）
  receptionLord: {
    name: '受付の主',
    sprite: 'enemySectionChiefIdle',
    isBoss: true,
    hp: 70, atk: 13, def: 7, spd: 7, exp: 24, gold: 40,
    flavorAppear: '受付の主が 内線を 一斉に 鳴らした！',
    actions: [
      { name: '内線コール', kind: 'attack', power: 1.2, msg: '受付の主の 内線コール！　耳が いたい！' },
      { name: '再提出だ',   kind: 'attack', power: 1.5, msg: '受付の主は ハンコを 構えた。『再提出だ』' },
    ],
  },

  // ── 中層 オフィス（雑魚3。階ボスは fruitGirl）──────────────────
  copierGhost: {
    name: 'コピー機オバケ',
    sprite: 'enemyCopierIdle',
    hp: 40, atk: 12, def: 6, spd: 6, exp: 14, gold: 12,
    flavorAppear: 'コピー機オバケが 両面印刷で 襲いかかる！',
    actions: [
      { name: '両面印刷', kind: 'attack', power: 1.1, msg: 'コピー機オバケの 両面印刷！' },
    ],
  },
  phoneEye: {
    name: 'スマホ目玉',
    sprite: 'enemyPhoneIdle',
    hp: 32, atk: 13, def: 4, spd: 9, exp: 14, gold: 12,
    flavorAppear: 'スマホ目玉が 通知を 浴びせてきた！（未読 999＋）',
    actions: [
      { name: '通知の雨', kind: 'attack', power: 1.2, msg: 'スマホ目玉の 通知の雨！' },
    ],
  },
  cardSwarm: {
    name: '名刺の群れ',
    sprite: 'enemyCardIdle',
    hp: 44, atk: 11, def: 7, spd: 6, exp: 15, gold: 13,
    flavorAppear: '名刺の群れが 渦を巻いて 名刺交換を 求めている！',
    actions: [
      { name: '名刺交換', kind: 'attack', power: 1.1, msg: '名刺の群れが 名刺交換を 強要した！' },
    ],
  },

  // ── 上層 役員（雑魚2＝既存スプライトを役員フロア用に強化流用）──
  overtimeWraith: {
    name: '残業の亡霊',
    sprite: 'enemyZombieIdle',
    hp: 52, atk: 15, def: 8, spd: 7, exp: 20, gold: 16,
    flavorAppear: '残業の亡霊が 「お前の代わりはいない」と 囁いた！',
    actions: [
      { name: '同調圧力', kind: 'attack', power: 1.2, msg: '残業の亡霊の 同調圧力！' },
    ],
  },
  auditEye: {
    name: '監査の目',
    sprite: 'enemyPhoneIdle',
    hp: 46, atk: 16, def: 6, spd: 11, exp: 20, gold: 16,
    flavorAppear: '監査の目が じっと こちらを 見据えている！',
    actions: [
      { name: '粗探し', kind: 'attack', power: 1.3, msg: '監査の目の 粗探し！　ぐさりと くる！' },
    ],
  },

  // ── 屋上 社長室（ラスボス）─────────────────────────────────────
  president: {
    name: '社長',
    sprite: 'enemyPresidentIdle',
    isBoss: true,
    hp: 130, atk: 19, def: 10, spd: 8, exp: 50, gold: 120,
    flavorAppear: '最上階の主——社長が 椅子を 回した。',
    actions: [
      { name: 'もう少しだけ', kind: 'attack', power: 1.2, msg: '社長は 「もう少しだけ」と 囁いた。' },
      { name: '残業命令',     kind: 'attack', power: 1.7, msg: '社長は 残業命令を 下した！' },
      { name: 'やりがい搾取', kind: 'attack', power: 1.4, msg: '社長は やりがいを 搾取してきた！' },
    ],
  },
};

// ── 仲間（プレースホルダースプライト。専用イラストは発注予定）──────
// key フィールドはショップや join チェックの識別子として使う。
export const COMPANIONS = {
  kohai: {
    name: '後輩鈴木くん', key: 'kohai',
    sprite: 'kohaiIdle', hurtSprite: 'kohaiHurt', // 発注済みスプライト到着後に差し替え（未着時は playerIdle にフォールバック）
    level: 1, exp: 0,
    hp: 26, maxHp: 26, mp: 6,  maxMp: 6,
    atk: 7, def: 4, spd: 8,
    skills: ['shout', 'canThrow', 'rallyCry'],
  },
  ol: {
    name: 'OL田中さん', key: 'ol',
    sprite: 'olIdle', hurtSprite: 'olHurt',
    level: 1, exp: 0,
    hp: 22, maxHp: 22, mp: 14, maxMp: 14,
    atk: 6, def: 4, spd: 9,
    skills: ['coffee', 'paperSlap', 'careSupport'],
  },
};

// ── フロア定義（Phase B：軽量通路＋エンカウント抽選＋階ボス）────
// steps＝その階で踏む通常エンカウント回数。踏み終えるとボス扉。
// encounters＝重み付き抽選（w が重み）。boss＝階ボスの敵キー。
export const FLOORS = [
  {
    id: 'b1', name: '地下倉庫', bg: 'bgStorageB1', steps: 3,
    encounters: [{ enemy: 'caterpillar', w: 3 }, { enemy: 'paperTower', w: 2 }],
    boss: 'rollingBagLord',
    introStory: 'b1_intro',
  },
  {
    id: 'f1', name: '1F ロビー受付', bg: 'bgEntranceNight', steps: 3,
    encounters: [{ enemy: 'vendingSpirit', w: 3 }, { enemy: 'lastTrainZombie', w: 3 }],
    boss: 'receptionLord',
    introStory: 'f1_intro',
  },
  {
    id: 'office', name: '中層 オフィス', bg: 'bgOfficeNight', steps: 4,
    encounters: [{ enemy: 'copierGhost', w: 2 }, { enemy: 'phoneEye', w: 2 }, { enemy: 'cardSwarm', w: 2 }],
    boss: 'fruitGirl',
    introStory: 'office_intro',
  },
  {
    id: 'exec', name: '上層 役員', bg: 'bgExecFloor', steps: 4,
    encounters: [{ enemy: 'overtimeWraith', w: 3 }, { enemy: 'auditEye', w: 2 }],
    boss: 'buddhaPig',
    introStory: 'exec_intro',
  },
  {
    // 屋上は直行（steps:0 で入場即ボス扉）。社長戦の選択肢/第2形態は Phase E。
    id: 'rooftop', name: '屋上 社長室', bg: 'bgPresidentRoom', steps: 0,
    encounters: [],
    boss: 'president',
    introStory: 'rooftop_intro',
  },
];
