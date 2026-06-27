import Phaser from 'phaser';
import { GAME_W, GAME_H, COLORS, LAYOUT } from '../constants.js';
import { getRun, currentFloor, isBossReady, hasNextFloor, pickEncounter } from '../state/run.js';

// 軽量な通路フロア。おじさんが右へ進み、エンカウントで戦闘へ／奥のボス扉で階ボス。
// 進行：steps 回の通常エンカウントを越えるとボス扉が開く。階ボス撃破で次階 or 脱出。
// 戦闘からは run.lastWon を見て進行を判断する（BattleScene が returnTo='FloorScene' で戻す）。
export class FloorScene extends Phaser.Scene {
  constructor() { super('FloorScene'); }

  create() {
    this.run = getRun();
    const f = currentFloor();
    this.floor = f;
    this._busy = false;

    // 戦闘から勝って戻った場合の進行処理
    if (this.run.lastWon) {
      const wasBoss = this.run.pendingIsBoss;
      this.run.lastWon = false; this.run.pendingEnemy = null; this.run.pendingIsBoss = false;
      if (wasBoss) { this.clearFloor(); return; }
      this.run.stepInFloor = Math.min(f.steps, (this.run.stepInFloor || 0) + 1);
    }

    // 初回入場の導入会話（1回だけ）
    const introFlag = 'floorIntro_' + f.id;
    if (f.introStory && !this.run.flags[introFlag]) {
      this.run.flags[introFlag] = true;
      this.scene.start('DialogueScene', { key: f.introStory, next: 'FloorScene', bg: f.bg });
      return;
    }

    this.build();
  }

  build() {
    const f = this.floor;
    // 背景
    if (f.bg && this.textures.exists(f.bg)) {
      this.add.image(0, 0, f.bg).setOrigin(0, 0).setDisplaySize(GAME_W, GAME_H);
    } else {
      this.cameras.main.setBackgroundColor('#14121f');
    }

    // 進捗HUD
    this.add.text(16, 12, f.name, { fontFamily: 'sans-serif', fontSize: '15px', color: '#ffe7c2', fontStyle: 'bold' });
    const ready = isBossReady();
    this.add.text(16, 32, ready ? '奥に ボスの 気配……' : `魔物 ${this.run.stepInFloor}/${f.steps}`, {
      fontFamily: 'monospace', fontSize: '13px', color: COLORS.textDim,
    });

    // ボス扉（右端）。ボス到達可なら強調。
    const doorColor = ready ? 0xffe24a : 0x555a72;
    this.add.rectangle(720, 250, 76, 120, 0x0b0d1a, 0.85).setStrokeStyle(3, doorColor);
    this.add.text(720, 250, ready ? 'ボス\n扉' : '扉', {
      fontFamily: 'sans-serif', fontSize: '16px', color: ready ? '#ffe24a' : '#888ea8', align: 'center',
    }).setOrigin(0.5);

    // おじさん（進捗に応じて右へ寄る＝通路を進んでいる感じ）
    const t = f.steps > 0 ? Math.min(1, this.run.stepInFloor / f.steps) : 1;
    const px = 120 + t * 430;
    this.player = this.add.image(px, 380, 'playerIdle').setOrigin(0.5, 1);
    this.player.setScale(LAYOUT.playerH / this.player.height);
    // 軽い上下のアイドル
    this.tweens.add({ targets: this.player, y: 374, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    this.buildMenu(ready);
  }

  buildMenu(ready) {
    const x = 20, y = 452, w = GAME_W - 40, h = GAME_H - y - 20;
    this.drawWindow(x, y, w, h);
    this.msg = this.add.text(x + 24, y + 20, ready ? 'ボス扉の前だ。どうする？' : 'どうする？', {
      fontFamily: 'sans-serif', fontSize: '20px', color: COLORS.text,
    });

    this.options = [
      { label: ready ? 'ボスにいどむ' : 'すすむ', onSelect: () => this.advanceFloor() },
      { label: '拠点へもどる', onSelect: () => this.toCafe() },
    ];
    const mx = 560, my = 458, mw = 212, mh = 78;
    this.drawWindow(mx, my, mw, mh);
    this.items = this.options.map((o, i) => {
      const tt = this.add.text(mx + 44, my + 16 + i * 30, o.label, {
        fontFamily: 'sans-serif', fontSize: '19px', color: '#ffffff',
      }).setInteractive({ useHandCursor: true });
      tt.on('pointerover', () => { this.idx = i; this.updateCursor(); });
      tt.on('pointerdown', () => this.confirm());
      return tt;
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

  // すすむ／ボスにいどむ
  advanceFloor() {
    this._busy = true;
    const boss = isBossReady();
    this.run.pendingIsBoss = boss;
    this.run.pendingEnemy = boss ? this.floor.boss : pickEncounter();
    // 少し前進してから戦闘へ
    const dir = 1;
    this.tweens.add({ targets: this.player, x: this.player.x + 60 * dir, duration: 360, ease: 'Sine.easeInOut' });
    this.time.delayedCall(380, () => {
      this.cameras.main.fadeOut(280);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('BattleScene', { returnTo: 'FloorScene' }));
    });
  }

  toCafe() {
    this._busy = true;
    this.cameras.main.fadeOut(280);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('CafeScene'));
  }

  // 階クリア → 次階 or 全クリア（脱出）
  clearFloor() {
    if (hasNextFloor()) {
      this.run.floorIndex += 1;
      this.run.stepInFloor = 0;
      this.scene.start('FloorScene');
    } else {
      // 現状の最終到達点 → 脱出（ノーマルエンディング）。フロア追加で本来の屋上へ。
      this.scene.start('ResultScene', { outcome: 'win' });
    }
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
