import Phaser from 'phaser';
import { GAME_W, GAME_H, COLORS, LAYOUT } from '../constants.js';
import { getRun, currentFloor, isBossReady, hasNextFloor, pickEncounter, addCompanion } from '../state/run.js';
import { audio } from '../audio/AudioManager.js';

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
    // 背景（参照を保持して移動演出でスクロールできるようにする）
    this.bgImage = null;
    if (f.bg && this.textures.exists(f.bg)) {
      this.bgImage = this.add.image(0, 0, f.bg).setOrigin(0, 0).setDisplaySize(GAME_W + 120, GAME_H);
    } else {
      this.cameras.main.setBackgroundColor('#14121f');
    }

    // 進捗HUD
    this.add.text(16, 14, f.name, { fontFamily: 'sans-serif', fontSize: '15px', color: '#ffe7c2', fontStyle: 'bold' });
    const ready = isBossReady();
    this.buildProgressBar(ready);

    // おじさん（進捗に応じて右へ寄る＝通路を進んでいる感じ）
    const t = f.steps > 0 ? Math.min(1, this.run.stepInFloor / f.steps) : 1;
    const px = 120 + t * 430;
    this.player = this.add.image(px, 380, 'playerIdle').setOrigin(0.5, 1);
    this.player.setScale(LAYOUT.playerH / this.player.height);
    // 軽い上下のアイドル
    this.tweens.add({ targets: this.player, y: 374, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    audio.playBGM('cafe');
    this.buildMenu(ready);
  }

  buildProgressBar(ready) {
    const f = this.floor;
    const step = this.run.stepInFloor || 0;
    const cy = 46; // ノードの中心Y

    if (f.steps === 0) {
      // 屋上など直行フロア：ボスノードのみ表示
      this.add.text(GAME_W / 2, cy, '── ボスフロア ──', {
        fontFamily: 'monospace', fontSize: '13px', color: '#ff8888',
      }).setOrigin(0.5);
      return;
    }

    // 通常フロア：エンカウントノード × steps ＋ ボスノード
    const totalNodes = f.steps + 1;
    const nodeD = 26, lineGap = 52;
    const segW = nodeD + lineGap;
    const totalW = nodeD + (totalNodes - 1) * segW;
    const sx = (GAME_W - totalW) / 2;
    const r = nodeD / 2;

    const g = this.add.graphics();
    // ノードバー全体に半透明黒帯（どの背景でも視認できるように）
    g.fillStyle(0x000000, 0.55).fillRoundedRect(sx - 14, cy - r - 8, totalW + 28, nodeD + 16, 6);
    let currentCx = null;

    for (let i = 0; i < totalNodes; i++) {
      const cx = sx + i * segW + r;
      const isBoss = i === totalNodes - 1;
      const done = !isBoss && i < step;
      const current = (!isBoss && !ready && i === step) || (isBoss && ready);

      if (current) currentCx = cx;

      // ノード間の接続線
      if (i < totalNodes - 1) {
        g.fillStyle(i < step ? 0x3ab84a : 0x363060, 1).fillRect(cx + r, cy - 2, lineGap, 4);
      }

      // ノード本体
      if (done) {
        g.fillStyle(0x2a8a3a, 1).fillCircle(cx, cy, r);
      } else if (current) {
        g.fillStyle(0xffe24a, 1).fillCircle(cx, cy, r);
      } else if (isBoss) {
        g.fillStyle(0x500f0f, 1).fillCircle(cx, cy, r);
        g.lineStyle(2, 0xcc2222, 1).strokeCircle(cx, cy, r);
      } else {
        g.fillStyle(0x1e1c3a, 1).fillCircle(cx, cy, r);
        g.lineStyle(1, 0x505090, 0.9).strokeCircle(cx, cy, r);
      }

      // ラベル
      const [lbl, col] = done ? ['✓', '#aaffaa']
        : current ? ['▶', '#000000']
        : isBoss ? ['！', '#ff6666']
        : ['？', '#505088'];
      this.add.text(cx, cy, lbl, {
        fontFamily: 'monospace', fontSize: '12px', color: col, fontStyle: 'bold',
      }).setOrigin(0.5);
    }

    // 現在地ノードのグロー点滅
    if (currentCx !== null) {
      const glow = this.add.graphics();
      glow.fillStyle(ready ? 0xff4444 : 0xffe24a, 0.22).fillCircle(currentCx, cy, r + 8);
      this.tweens.add({ targets: glow, alpha: 0.05, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
  }

  buildMenu(ready) {
    const x = 20, y = 452, w = GAME_W - 40, h = GAME_H - y - 20;
    this.drawWindow(x, y, w, h);
    this.msg = this.add.text(x + 24, y + 20, ready ? 'ボス扉の前だ。どうする？' : 'どうする？', {
      fontFamily: 'sans-serif', fontSize: '20px', color: COLORS.text,
    });

    this.options = [
      { label: ready ? 'ボスにいどむ' : 'すすむ', onSelect: () => this.advanceFloor() },
      ...(ready ? [{ label: 'さらに鍛える', onSelect: () => this.trainMore() }] : []),
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
    kb.on('keydown-UP',    () => { this.idx = (this.idx + this.options.length - 1) % this.options.length; audio.playSE('cursor'); this.updateCursor(); });
    kb.on('keydown-DOWN',  () => { this.idx = (this.idx + 1) % this.options.length; audio.playSE('cursor'); this.updateCursor(); });
    kb.on('keydown-ENTER', () => this.confirm());
    kb.on('keydown-SPACE', () => this.confirm());
  }

  updateCursor() { const t = this.items[this.idx]; if (t) this.cursor.setPosition(this.cursorX, t.y + 10); }
  confirm() { if (this._busy) return; audio.playSE('confirm'); this.options[this.idx].onSelect(); }

  // すすむ／ボスにいどむ
  advanceFloor() {
    this._busy = true;
    const boss = isBossReady();
    this.run.pendingIsBoss = boss;
    this.run.pendingEnemy = boss ? this.floor.boss : pickEncounter();

    const preBossKey = boss && this.floor.preBossStory;
    const shownFlag = 'preBossShown_' + this.floor.id;
    const showPreBoss = preBossKey && !this.run.flags[shownFlag];
    if (showPreBoss) this.run.flags[shownFlag] = true;

    if (this.bgImage) {
      this.tweens.add({ targets: this.bgImage, x: -110, duration: 520, ease: 'Sine.easeIn' });
    }
    this.tweens.add({ targets: this.player, x: this.player.x + 200, duration: 520, ease: 'Sine.easeIn' });
    this.time.delayedCall(420, () => {
      this.cameras.main.fadeOut(280);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        if (showPreBoss) {
          this.scene.start('DialogueScene', {
            key: preBossKey, bg: this.floor.bg,
            next: 'BattleScene', nextData: { returnTo: 'FloorScene' },
          });
        } else {
          this.scene.start('BattleScene', { returnTo: 'FloorScene' });
        }
      });
    });
  }

  // ボス到達後「もう一周雑魚を倒す」 → stepInFloor をリセットして同フロアを再周
  trainMore() {
    this._busy = true;
    this.run.stepInFloor = 0;
    this.cameras.main.fadeOut(240);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('FloorScene'));
  }

  toCafe() {
    this._busy = true;
    this.cameras.main.fadeOut(280);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('CafeScene'));
  }

  // 階クリア → 仲間合流チェック → ポストボス会話 → 次階 or エンディング
  clearFloor() {
    const clearedId = this.floor.id;
    const joinKey = this.getCompanionJoin(clearedId);

    // 仲間合流（B1→後輩 / F1→OL田中さん）
    if (joinKey && !this.run.flags['joined_' + joinKey]) {
      this.run.flags['joined_' + joinKey] = true;
      addCompanion(joinKey);
      if (hasNextFloor()) {
        this.run.floorIndex += 1;
        this.run.stepInFloor = 0;
      }
      const nextF = currentFloor();
      const npcMap = {
        kohai: { key: 'kohaiIdle', fallback: 'playerIdle', tint: 0xaaddff },
        ol:    { key: 'olIdle',    fallback: 'playerIdle', tint: 0xffbbcc },
      };
      this.scene.start('DialogueScene', {
        key: joinKey + '_join',
        next: 'FloorScene',
        bg: nextF ? nextF.bg : this.floor.bg,
        npc: npcMap[joinKey],
      });
      return;
    }

    // ボスクリア後の会話（office/exec）
    const postKey = this.getPostBossStory(clearedId);
    if (postKey && !this.run.flags['postBoss_' + clearedId]) {
      this.run.flags['postBoss_' + clearedId] = true;
      const currentBg = this.floor.bg;
      if (hasNextFloor()) {
        this.run.floorIndex += 1;
        this.run.stepInFloor = 0;
      }
      this.scene.start('DialogueScene', {
        key: postKey,
        next: 'FloorScene',
        bg: currentBg,
      });
      return;
    }

    // 次フロアへ or エンディング会話 → リザルト
    if (hasNextFloor()) {
      this.run.floorIndex += 1;
      this.run.stepInFloor = 0;
      this.scene.start('FloorScene');
    } else {
      this.scene.start('DialogueScene', {
        key: 'president_defeated',
        next: 'ResultScene',
        nextData: { outcome: 'win' },
        bg: 'bgPresidentRoom',
      });
    }
  }

  // ボスを倒した階 ID → 合流する仲間キー（null なら合流なし）
  getCompanionJoin(floorId) {
    if (floorId === 'b1') return 'kohai';
    if (floorId === 'f1') return 'ol';
    return null;
  }

  // ボス撃破後の会話キー（office/exec のみ）
  getPostBossStory(floorId) {
    if (floorId === 'office') return 'office_boss_clear';
    if (floorId === 'exec') return 'exec_boss_clear';
    return null;
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
