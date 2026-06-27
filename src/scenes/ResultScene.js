import Phaser from 'phaser';
import { GAME_W, GAME_H, COLORS } from '../constants.js';
import { getRun } from '../state/run.js';

// ランの結末（脱出成功 or 力尽き）。どちらも Enter/Space/クリックでタイトルへ戻る。
export class ResultScene extends Phaser.Scene {
  constructor() { super('ResultScene'); }

  create(data) {
    const win = data?.outcome === 'win';
    this.cameras.main.setBackgroundColor(win ? '#0e1a12' : '#1a0e10');

    // 採用済み背景があれば敷く（脱出＝夜明け／力尽き＝暗い机）。無ければ単色のまま。
    const bgKey = win ? 'bgEndingEscape' : 'bgGameOver';
    if (this.textures.exists(bgKey)) {
      this.add.image(0, 0, bgKey).setOrigin(0, 0).setDisplaySize(GAME_W, GAME_H);
      this.add.rectangle(0, 0, GAME_W, GAME_H, 0x000000, 0.35).setOrigin(0, 0); // 文字を読みやすく
    }

    this.add.text(GAME_W / 2, 160, win ? '定時退社！' : 'ゲームオーバー', {
      fontFamily: 'sans-serif', fontSize: '52px',
      color: win ? '#ffe24a' : '#e05a4a', fontStyle: 'bold',
    }).setOrigin(0.5);

    const sub = win
      ? 'おじさんは ビルを ぬけ出した。\nまた あした……？'
      : '呪いは とけなかった。\nおじさんは また 残業に のまれた。';
    this.add.text(GAME_W / 2, 270, sub, {
      fontFamily: 'sans-serif', fontSize: '22px', color: COLORS.text,
      align: 'center', lineSpacing: 8,
    }).setOrigin(0.5);

    const run = getRun();
    if (run) {
      const p = run.player;
      this.add.text(GAME_W / 2, 380, `Lv${p.level}   HP ${p.hp}/${p.maxHp}   ${p.gold || 0}G`, {
        fontFamily: 'monospace', fontSize: '18px', color: COLORS.textDim,
      }).setOrigin(0.5);
    }

    const again = this.add.text(GAME_W / 2, 470, '▶ タイトルへ', {
      fontFamily: 'sans-serif', fontSize: '26px', color: '#ffffff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.tweens.add({ targets: again, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });

    const go = () => this.scene.start('TitleScene');
    again.on('pointerdown', go);
    this.input.keyboard.once('keydown-ENTER', go);
    this.input.keyboard.once('keydown-SPACE', go);
  }
}
