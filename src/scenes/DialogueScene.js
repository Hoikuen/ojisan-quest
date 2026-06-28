import Phaser from 'phaser';
import { GAME_W, GAME_H, COLORS } from '../constants.js';
import { STORY } from '../data/story.js';
import { audio } from '../audio/AudioManager.js';

// 会話・カットシーンのデータ駆動ランナー。
// 起動：this.scene.start('DialogueScene', { key, next, nextData?, bg? })
//  key      … STORY のキー（intro 等）
//  next     … 再生後に遷移するシーン（既定 TitleScene）
//  nextData … next に渡すデータ
//  bg       … 背景テクスチャキー（任意。無ければ暗幕）
// 送り：クリック / Enter / Space（手送り）。話者名を上に表示。
export class DialogueScene extends Phaser.Scene {
  constructor() { super('DialogueScene'); }

  create(data) {
    this.next = data?.next ?? 'TitleScene';
    this.nextData = data?.nextData;
    const node = STORY[data?.key];
    this.lines = (node && node.lines) ? node.lines : [{ speaker: '', text: '……' }];
    this.index = 0;
    this.done = false;

    if (data?.bg && this.textures.exists(data.bg)) {
      this.add.image(0, 0, data.bg).setOrigin(0, 0).setDisplaySize(GAME_W, GAME_H);
      this.add.rectangle(0, 0, GAME_W, GAME_H, 0x000000, 0.25).setOrigin(0, 0); // 文字を読みやすく
    } else {
      this.cameras.main.setBackgroundColor('#0b0b10');
    }

    // メッセージ窓（下部・幅広）。見た目は BattleScene と揃える。
    const x = 20, y = 392, w = GAME_W - 40, h = GAME_H - y - 20;
    this.drawWindow(x, y, w, h);
    this.speakerText = this.add.text(x + 24, y + 14, '', {
      fontFamily: 'sans-serif', fontSize: '17px', color: '#ffe24a', fontStyle: 'bold',
    });
    this.bodyText = this.add.text(x + 24, y + 44, '', {
      fontFamily: 'sans-serif', fontSize: '21px', color: COLORS.text,
      wordWrap: { width: w - 48, useAdvancedWrap: true }, lineSpacing: 8,
    });
    this.hint = this.add.text(x + w - 16, y + h - 12, '▶ Enter / クリック', {
      fontFamily: 'monospace', fontSize: '12px', color: COLORS.textDim,
    }).setOrigin(1, 1);
    this.blink = this.tweens.add({ targets: this.hint, alpha: 0.25, duration: 600, yoyo: true, repeat: -1 });

    this.showLine();

    this.input.keyboard.on('keydown-ENTER', () => this.advance());
    this.input.keyboard.on('keydown-SPACE', () => this.advance());
    this.input.on('pointerdown', () => this.advance());
  }

  // 9スライス窓があれば使う。無ければGraphicsプレースホルダ（BattleSceneと同方針）。
  drawWindow(x, y, w, h) {
    if (this.textures.exists('uiWindow')) {
      return this.add.nineslice(x, y, 'uiWindow', undefined, w, h, 14, 14, 14, 14).setOrigin(0, 0);
    }
    const g = this.add.graphics();
    g.fillStyle(COLORS.windowFill, 0.92).fillRoundedRect(x, y, w, h, 10);
    g.lineStyle(3, COLORS.windowEdge, 1).strokeRoundedRect(x, y, w, h, 10);
    return g;
  }

  showLine() {
    const ln = this.lines[this.index];
    this.speakerText.setText(ln.speaker || '');
    this.bodyText.setText(ln.text || '');
  }

  advance() {
    if (this.done) return;
    audio.playSE('cursor');
    this.index += 1;
    if (this.index < this.lines.length) {
      this.showLine();
    } else {
      this.done = true;
      this.cameras.main.fadeOut(300);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(this.next, this.nextData));
    }
  }
}
