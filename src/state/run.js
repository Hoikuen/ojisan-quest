// ラン状態（1フロアの脱出ラン）。BattleScene は毎戦 restart されるが、
// プレイヤーの hp/mp/level/exp/持ち物と進行位置はここで保持して戦闘をまたいで継続する。
// エンジンは薄く・状態はここ／内容は content.js（RESKIN方針）。
import { PLAYER, ITEMS, LEVEL_TABLE, FLOOR_RUN } from '../data/content.js';

let state = null;

// 新しいランを開始（タイトルの「はじめる」で呼ぶ）。
export function startRun() {
  state = {
    player: { ...structuredClone(PLAYER), inventory: structuredClone(ITEMS) },
    queue: [...FLOOR_RUN.enemies],
    index: 0,
    floorName: FLOOR_RUN.name,
  };
  return state;
}

export function getRun() { return state; }
export function currentEnemyKey() { return state.queue[state.index]; }
export function isLastEnemy() { return state.index >= state.queue.length - 1; }
export function advance() { state.index += 1; }
export function progressText() {
  return state ? `${state.index + 1} / ${state.queue.length}` : '';
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
