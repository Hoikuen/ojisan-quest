import Phaser from 'phaser';
import { GAME_W, GAME_H } from './constants.js';
import { BootScene } from './scenes/BootScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { BattleScene } from './scenes/BattleScene.js';

// ターン制RPG＝物理エンジン不要（正面ビュー・静止スプライト・トゥイーン演出のみ）。
const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_W,
  height: GAME_H,
  // 高精細ドット絵を縮小表示するためリニア補間（ニアレストだとギザつく＝ojisan-x と同方針）
  pixelArt: false,
  antialias: true,
  roundPixels: true,
  backgroundColor: '#0b0b10',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, TitleScene, BattleScene],
};

const game = new Phaser.Game(config);
// デバッグ用に公開（動作確認に使用。リリース時は影響なし）
if (typeof window !== 'undefined') window.__game = game;
