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
  { level: 1, expToReach: 0,  maxHp: 30, maxMp: 8,  atk: 8,  def: 5,  spd: 6 },
  { level: 2, expToReach: 8,  maxHp: 38, maxMp: 10, atk: 10, def: 6,  spd: 7 },
  { level: 3, expToReach: 22, maxHp: 47, maxMp: 13, atk: 12, def: 7,  spd: 8, learn: 'heavySwing' },
  { level: 4, expToReach: 44, maxHp: 57, maxMp: 16, atk: 15, def: 9,  spd: 9 },
  { level: 5, expToReach: 76, maxHp: 70, maxMp: 20, atk: 18, def: 11, spd: 10 },
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
};

// ── どうぐ（持ち物。count はランタイムで消費）────────────────────
export const ITEMS = {
  drink: { name: '栄養ドリンク', kind: 'heal', amount: 20, count: 3,
           msg: '{user}は 栄養ドリンクを 飲んだ！' },
};

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
  fruitGirl: {
    name: '果物メガネ女子',
    sprite: 'enemyFruitIdle',
    hurtSprite: 'enemyFruitHurt',
    hp: 34, atk: 9, def: 4, spd: 7, exp: 14, gold: 12,
    flavorAppear: '果物メガネ女子が 立ちふさがった！',
    actions: [
      { name: 'いちご投げ', kind: 'attack', power: 1.2, msg: '果物メガネ女子の いちご投げ！' },
    ],
  },
  buddhaPig: {
    name: '大仏豚ぶちょう',
    sprite: 'enemyBossIdle',
    hurtSprite: 'enemyBossHurt',
    isBoss: true,
    hp: 80, atk: 13, def: 8, spd: 5, exp: 30, gold: 60,
    flavorAppear: 'このフロアの主——大仏豚ぶちょうが 立ちはだかった！',
    actions: [
      { name: 'おやつ投げ', kind: 'attack', power: 1.0, msg: '大仏豚ぶちょうは おやつを 投げつけた！' },
      { name: '残業の圧',   kind: 'attack', power: 1.6, msg: '大仏豚ぶちょうは 残業の圧を かけてきた！' },
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
    hp: 50, atk: 10, def: 6, spd: 8, exp: 18, gold: 30,
    flavorAppear: '転がるカバンの主が ゴロゴロと 道をふさいだ！',
    actions: [
      { name: '体当たり',   kind: 'attack', power: 1.2, msg: '転がるカバンの主が 突進してきた！' },
      { name: '書類ばらまき', kind: 'attack', power: 0.9, msg: '転がるカバンの主が 書類を ばらまいた！' },
    ],
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
  // 1F / 中層 / 上層 / 屋上 は順次追加（在庫アートあり）。
];

// ── エンカウント（エリア→敵編成。今は固定順の連戦に使う）────────
export const ENCOUNTERS = {
  floorB1: { enemies: ['caterpillar'], rate: 1.0 },
};

// ── フロアの脱出ラン（縦スライス：連戦→ボス→脱出）─────────────
// queue を先頭から順に戦う。HP/MP・レベル・持ち物は run.js が戦闘をまたいで保持する。
export const FLOOR_RUN = {
  name: '地下倉庫フロア',
  enemies: ['caterpillar', 'caterpillar', 'fruitGirl', 'buddhaPig'],
};
