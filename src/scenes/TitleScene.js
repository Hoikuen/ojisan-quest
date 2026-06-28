import Phaser from 'phaser';
import { GAME_W, GAME_H, COLORS } from '../constants.js';
import { startRun, hasSave, loadRun } from '../state/run.js';
import { audio } from '../audio/AudioManager.js';

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

    // はじめる → ラン開始 → 導入 → 拠点（喫茶のりちゃん）。つづきから → ロード → 拠点。
    const newGame = () => { startRun(); this.scene.start('DialogueScene', { key: 'intro', next: 'CafeScene' }); };
    const continueGame = () => { if (loadRun()) this.scene.start('CafeScene'); else newGame(); };

    const opts = hasSave()
      ? [{ label: '▶ つづきから', act: continueGame }, { label: 'はじめる（最初から）', act: newGame }]
      : [{ label: '▶ はじめる', act: newGame }];

    this.menuIdx = 0;
    this.menuTexts = opts.map((o, i) => this.add.text(GAME_W / 2, 385 + i * 44, o.label, {
      fontFamily: 'sans-serif', fontSize: i === 0 ? '28px' : '22px', color: '#ffffff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }));

    const refresh = () => this.menuTexts.forEach((t, i) => t.setColor(i === this.menuIdx ? '#ffe24a' : '#ffffff'));
    const setIdx = (i) => { this.menuIdx = i; audio.playSE('cursor'); refresh(); };
    this.menuTexts.forEach((t, i) => {
      t.on('pointerover', () => setIdx(i));
      t.on('pointerdown', () => opts[this.menuIdx].act());
    });
    refresh();

    const kb = this.input.keyboard;
    if (opts.length > 1) {
      kb.on('keydown-UP', () => setIdx((this.menuIdx + opts.length - 1) % opts.length));
      kb.on('keydown-DOWN', () => setIdx((this.menuIdx + 1) % opts.length));
    }
    kb.on('keydown-ENTER', () => { audio.playSE('confirm'); opts[this.menuIdx].act(); });
    kb.on('keydown-SPACE', () => { audio.playSE('confirm'); opts[this.menuIdx].act(); });

    this.add.text(GAME_W / 2, GAME_H - 40, opts.length > 1 ? '↑↓ で選択・Enter で決定' : 'Enter / Space / クリック で開始', {
      fontFamily: 'monospace', fontSize: '15px', color: COLORS.textDim,
    }).setOrigin(0.5);
  }
}
