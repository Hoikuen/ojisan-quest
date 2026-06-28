import Phaser from 'phaser';
import { GAME_W, GAME_H, COLORS } from '../constants.js';
import { getRun } from '../state/run.js';
import { audio } from '../audio/AudioManager.js';

export class ResultScene extends Phaser.Scene {
  constructor() { super('ResultScene'); }

  create(data) {
    const win = data?.outcome === 'win';
    const run = getRun();

    this.cameras.main.setBackgroundColor(win ? '#0a150d' : '#1a0e10');

    const bgKey = win ? 'bgEndingEscape' : 'bgGameOver';
    if (this.textures.exists(bgKey)) {
      this.add.image(0, 0, bgKey).setOrigin(0, 0).setDisplaySize(GAME_W, GAME_H);
      this.add.rectangle(0, 0, GAME_W, GAME_H, 0x000000, win ? 0.45 : 0.35).setOrigin(0, 0);
    }

    audio.stopBGM();

    if (win) {
      this.buildWinScreen(run);
    } else {
      this.buildLoseScreen(run);
    }

    const go = () => this.scene.start('TitleScene');
    this.input.keyboard.once('keydown-ENTER', go);
    this.input.keyboard.once('keydown-SPACE', go);
  }

  buildWinScreen(run) {
    // タイトル
    const title = this.add.text(GAME_W / 2, 76, '定時退社！', {
      fontFamily: 'sans-serif', fontSize: '54px', color: '#ffe24a', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5);
    this.tweens.add({ targets: title, scaleX: 1.04, scaleY: 1.04, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    this.add.text(GAME_W / 2, 152, 'この夜が、終わった。', {
      fontFamily: 'sans-serif', fontSize: '20px', color: '#c8d8b0',
    }).setOrigin(0.5);

    // 区切り線
    const g = this.add.graphics();
    g.lineStyle(1, 0x446644, 0.6).lineBetween(GAME_W / 2 - 160, 182, GAME_W / 2 + 160, 182);

    // パーティ一覧
    if (run) {
      const party = run.party ?? [run.player];
      const baseY = 200;
      const rowH = 44;
      party.forEach((m, i) => {
        const y = baseY + i * rowH;
        this.add.text(GAME_W / 2 - 100, y, m.name, {
          fontFamily: 'sans-serif', fontSize: '19px', color: '#ffffff',
        }).setOrigin(0, 0.5);
        this.add.text(GAME_W / 2 + 30, y, `Lv ${m.level}`, {
          fontFamily: 'monospace', fontSize: '18px', color: '#ffe7a0',
        }).setOrigin(0, 0.5);
        this.add.text(GAME_W / 2 + 110, y, `HP ${m.hp}/${m.maxHp}`, {
          fontFamily: 'monospace', fontSize: '14px', color: COLORS.textDim,
        }).setOrigin(0, 0.5);
      });

      const statsY = baseY + party.length * rowH + 16;
      g.lineStyle(1, 0x446644, 0.6).lineBetween(GAME_W / 2 - 160, statsY - 8, GAME_W / 2 + 160, statsY - 8);
      this.add.text(GAME_W / 2, statsY, `所持金  ${run.player.gold || 0} G`, {
        fontFamily: 'monospace', fontSize: '17px', color: '#ffd060',
      }).setOrigin(0.5, 0);
    }

    this.add.text(GAME_W / 2, 430, '— おわり —', {
      fontFamily: 'sans-serif', fontSize: '19px', color: COLORS.textDim,
    }).setOrigin(0.5);

    const btn = this.add.text(GAME_W / 2, 476, '▶ タイトルへ', {
      fontFamily: 'sans-serif', fontSize: '24px', color: '#ffffff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.tweens.add({ targets: btn, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });
    btn.on('pointerdown', () => this.scene.start('TitleScene'));
  }

  buildLoseScreen(run) {
    this.add.text(GAME_W / 2, 160, 'ゲームオーバー', {
      fontFamily: 'sans-serif', fontSize: '52px', color: '#e05a4a', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(GAME_W / 2, 270, '呪いは とけなかった。\nおじさんは また 残業に のまれた。', {
      fontFamily: 'sans-serif', fontSize: '22px', color: COLORS.text,
      align: 'center', lineSpacing: 8,
    }).setOrigin(0.5);

    if (run) {
      const p = run.player;
      this.add.text(GAME_W / 2, 380, `Lv${p.level}   HP ${p.hp}/${p.maxHp}   ${p.gold || 0}G`, {
        fontFamily: 'monospace', fontSize: '18px', color: COLORS.textDim,
      }).setOrigin(0.5);
    }

    const btn = this.add.text(GAME_W / 2, 470, '▶ タイトルへ', {
      fontFamily: 'sans-serif', fontSize: '26px', color: '#ffffff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.tweens.add({ targets: btn, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });
    btn.on('pointerdown', () => this.scene.start('TitleScene'));
  }
}
