import Phaser from 'phaser';
import { GAME_W, GAME_H, COLORS } from '../constants.js';
import { startRun } from '../state/run.js';

// タイトル：王道RPGの「はじめる」だけ。Enter/Space/クリックでランを開始して戦闘へ。
export class TitleScene extends Phaser.Scene {
  constructor() { super('TitleScene'); }

  create() {
    this.cameras.main.setBackgroundColor('#0b0b10');

    // 採用済みロゴ（タイトル＋サブタイトル一体）。無ければテキストにフォールバック。
    if (this.textures.exists('logoTitle')) {
      const logo = this.add.image(GAME_W / 2, 215, 'logoTitle').setOrigin(0.5);
      logo.setScale(Math.min(1, 560 / logo.width));
    } else {
      this.add.text(GAME_W / 2, 180, 'おじさんクエスト', {
        fontFamily: 'sans-serif', fontSize: '52px', color: '#ffe24a', fontStyle: 'bold',
      }).setOrigin(0.5);
      this.add.text(GAME_W / 2, 250, '〜 定時に帰れない呪い 〜', {
        fontFamily: 'sans-serif', fontSize: '22px', color: COLORS.textDim,
      }).setOrigin(0.5);
    }

    const start = this.add.text(GAME_W / 2, 400, '▶ はじめる', {
      fontFamily: 'sans-serif', fontSize: '30px', color: '#ffffff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    // 点滅でクリック可を示す
    this.tweens.add({ targets: start, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });

    this.add.text(GAME_W / 2, GAME_H - 40, 'Enter / Space / クリック で開始', {
      fontFamily: 'monospace', fontSize: '15px', color: COLORS.textDim,
    }).setOrigin(0.5);

    const go = () => { startRun(); this.scene.start('BattleScene'); };
    start.on('pointerdown', go);
    this.input.keyboard.once('keydown-ENTER', go);
    this.input.keyboard.once('keydown-SPACE', go);
  }
}
