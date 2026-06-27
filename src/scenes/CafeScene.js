import Phaser from 'phaser';
import { GAME_W, GAME_H, COLORS } from '../constants.js';
import { getRun, saveRun } from '../state/run.js';

// 拠点＝喫茶のりちゃん。初訪問は cafe_intro を再生→メニュー。
// メニュー：はなす／ほじゅう（全回復）／セーブ／出発（戦闘へ）。
export class CafeScene extends Phaser.Scene {
  constructor() { super('CafeScene'); }

  create() {
    this.run = getRun();
    this._busy = false;

    if (this.textures.exists('bgCafe')) {
      this.add.image(0, 0, 'bgCafe').setOrigin(0, 0).setDisplaySize(GAME_W, GAME_H);
    } else {
      this.cameras.main.setBackgroundColor('#241a16');
    }
    if (this.textures.exists('npcMama')) {
      const m = this.add.image(450, 416, 'npcMama').setOrigin(0.5, 1);
      m.setScale(278 / m.height);
    }
    this.add.text(24, 18, '喫茶のりちゃん', {
      fontFamily: 'sans-serif', fontSize: '20px', color: '#ffe7c2', fontStyle: 'bold',
    });

    // 初訪問なら導入会話へ（戻ってくるとフラグが立ってメニュー表示）
    if (this.run && !this.run.flags.cafeVisited) {
      this.run.flags.cafeVisited = true;
      this.scene.start('DialogueScene', { key: 'cafe_intro', next: 'CafeScene', bg: 'bgCafe' });
      return;
    }

    this.buildMenu();
  }

  buildMenu() {
    const x = 20, y = 440, w = 520, h = GAME_H - y - 20;
    this.drawWindow(x, y, w, h);
    this.msg = this.add.text(x + 24, y + 22, 'ママ：どうする？', {
      fontFamily: 'sans-serif', fontSize: '21px', color: COLORS.text, wordWrap: { width: w - 48 }, lineSpacing: 6,
    });

    this.options = [
      { label: 'はなす',  onSelect: () => this.toDialogue('cafe_talk') },
      { label: 'ほじゅう', onSelect: () => this.rest() },
      { label: 'セーブ',  onSelect: () => this.save() },
      { label: '出発',    onSelect: () => this.depart() },
    ];

    const mx = 560, my = 446, mw = 212, mh = 140;
    this.drawWindow(mx, my, mw, mh);
    this.items = [];
    this.options.forEach((o, i) => {
      const t = this.add.text(mx + 44, my + 18 + i * 28, o.label, {
        fontFamily: 'sans-serif', fontSize: '19px', color: '#ffffff',
      }).setInteractive({ useHandCursor: true });
      t.on('pointerover', () => { this.idx = i; this.updateCursor(); });
      t.on('pointerdown', () => this.confirm());
      this.items.push(t);
    });

    this.idx = 0;
    this.cursorX = mx + 18;
    this.cursor = this.textures.exists('uiCursor')
      ? this.add.image(0, 0, 'uiCursor').setOrigin(0, 0.5).setDisplaySize(18, 18)
      : this.add.text(0, 0, '▶', { fontFamily: 'sans-serif', fontSize: '19px', color: '#ffe24a' }).setOrigin(0, 0.5);
    this.updateCursor();

    const kb = this.input.keyboard;
    kb.on('keydown-UP', () => { this.idx = (this.idx + this.options.length - 1) % this.options.length; this.updateCursor(); });
    kb.on('keydown-DOWN', () => { this.idx = (this.idx + 1) % this.options.length; this.updateCursor(); });
    kb.on('keydown-ENTER', () => this.confirm());
    kb.on('keydown-SPACE', () => this.confirm());
  }

  updateCursor() { const t = this.items[this.idx]; if (t) this.cursor.setPosition(this.cursorX, t.y + 10); }
  confirm() { if (this._busy) return; this.options[this.idx].onSelect(); }

  toDialogue(key) { this.scene.start('DialogueScene', { key, next: 'CafeScene', bg: 'bgCafe' }); }

  rest() {
    const p = this.run.player;
    p.hp = p.maxHp; p.mp = p.maxMp;
    this.flash('ママは あつい コーヒーを いれてくれた。\nHPとMPが ぜんかい した！');
  }

  save() { this.flash(saveRun() ? 'ここまでを セーブした。' : 'セーブに しっぱいした…'); }

  depart() {
    this._busy = true;
    this.cameras.main.fadeOut(300);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('BattleScene'));
  }

  flash(text) {
    this.msg.setText(text);
    this.time.delayedCall(1500, () => { if (!this._busy) this.msg.setText('ママ：どうする？'); });
  }

  drawWindow(x, y, w, h) {
    if (this.textures.exists('uiWindow')) {
      return this.add.nineslice(x, y, 'uiWindow', undefined, w, h, 14, 14, 14, 14).setOrigin(0, 0);
    }
    const g = this.add.graphics();
    g.fillStyle(COLORS.windowFill, 0.92).fillRoundedRect(x, y, w, h, 10);
    g.lineStyle(3, COLORS.windowEdge, 1).strokeRoundedRect(x, y, w, h, 10);
    return g;
  }
}
