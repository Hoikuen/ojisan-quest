// ラン状態（1フロアの脱出ラン）。BattleScene は毎戦 restart されるが、
// プレイヤーの hp/mp/level/exp/持ち物と進行位置はここで保持して戦闘をまたいで継続する。
// エンジンは薄く・状態はここ／内容は content.js（RESKIN方針）。
import { PLAYER, ITEMS, LEVEL_TABLE, FLOORS } from '../data/content.js';

let state = null;

const SAVE_KEY = 'ojisanQuest.save';
const SAVE_VERSION = 2; // run の形を変えたら上げる（旧セーブは破棄＝MVP方針）

// 新しいランを開始（タイトルの「はじめる」で呼ぶ）。
export function startRun() {
  state = {
    player: { ...structuredClone(PLAYER), inventory: structuredClone(ITEMS) },
    floorIndex: 0,    // FLOORS の現在階
    stepInFloor: 0,   // その階で倒した通常エンカウント数
    pendingEnemy: null,   // FloorScene が戦闘に渡す敵キー
    pendingIsBoss: false,
    lastWon: false,   // 直前の戦闘に勝って戻ったか（FloorScene が進行に使う）
    flags: {},        // 進行/解放/収集/選択（cafeVisited 等）
  };
  return state;
}

export function getRun() { return state; }

// ── フロア進行 ───────────────────────────────────────────────
export function currentFloor() { return state ? FLOORS[state.floorIndex] : null; }
export function isBossReady() { const f = currentFloor(); return !!f && state.stepInFloor >= f.steps; }
export function hasNextFloor() { return state && state.floorIndex < FLOORS.length - 1; }

// 重み付き抽選で次の雑魚を選ぶ。
export function pickEncounter() {
  const f = currentFloor();
  if (!f) return null;
  const total = f.encounters.reduce((s, e) => s + e.w, 0);
  let r = Math.random() * total;
  for (const e of f.encounters) { r -= e.w; if (r <= 0) return e.enemy; }
  return f.encounters[0].enemy;
}

// ── セーブ/ロード（拠点チェックポイント・単一スロット・localStorage）──
export function saveRun() {
  if (!state) return false;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ saveVersion: SAVE_VERSION, state }));
    return true;
  } catch (e) { return false; }
}

export function hasSave() {
  try {
    const data = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    return !!(data && data.saveVersion === SAVE_VERSION && data.state);
  } catch (e) { return false; }
}

export function loadRun() {
  try {
    const data = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (!data || data.saveVersion !== SAVE_VERSION || !data.state) return null;
    state = data.state;
    if (!state.flags) state.flags = {};
    return state;
  } catch (e) { return null; }
}

// 経験値付与＋レベルアップ解決。上がった分の情報配列を返す（演出メッセージ用）。
// レベルアップ時：ステータスを LEVEL_TABLE の行に更新し HP/MP 全回復、learn があれば習得。
export function grantExp(player, amount) {
  player.exp += amount;
  const ups = [];
  for (;;) {
    const next = LEVEL_TABLE.find((e) => e.level === player.level + 1);
    if (!next || player.exp < next.expToReach) break;
    player.level = next.level;
    player.maxHp = next.maxHp; player.maxMp = next.maxMp;
    player.atk = next.atk; player.def = next.def; player.spd = next.spd;
    player.hp = player.maxHp; player.mp = player.maxMp; // 全回復
    const up = { level: next.level };
    if (next.learn && !player.skills.includes(next.learn)) {
      player.skills.push(next.learn);
      up.learned = next.learn;
    }
    ups.push(up);
  }
  return ups;
}

export function grantGold(player, amount) { player.gold = (player.gold || 0) + amount; }
