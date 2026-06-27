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
  exp: 0,
  hp: 30, maxHp: 30,
  mp: 8, maxMp: 8,
  atk: 8,
  def: 5,
  spd: 6,
  skills: ['shout', 'coffee'], // 習得済みとくぎ（SKILLS のキー）
};

// ── とくぎ（kind＋params。エンジンは kind を見て分岐）────────────
export const SKILLS = {
  shout:   { name: '気合いの一喝', kind: 'attack', power: 1.8, cost: 4, target: 'enemy',
             msg: '{user}は 腹の底から 一喝した！' },
  coffee:  { name: '一服する',     kind: 'heal',   amount: 16, cost: 3, target: 'self',
             msg: '{user}は 缶コーヒーで 一服した。' },
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
    hp: 30, atk: 9, def: 4, spd: 7, exp: 14, gold: 12,
    flavorAppear: '果物メガネ女子が 立ちふさがった！',
    actions: [
      { name: 'いちご投げ', kind: 'attack', power: 1.2, msg: '果物メガネ女子の いちご投げ！' },
    ],
  },
};

// ── エンカウント（エリア→敵編成。最小ループは1体固定）──────────
export const ENCOUNTERS = {
  floorB1: { enemies: ['caterpillar'], rate: 1.0 },
};

// 最小ループで最初に出す戦闘（後で ENCOUNTERS から抽選に変える）
export const FIRST_BATTLE = { enemy: 'caterpillar' };
