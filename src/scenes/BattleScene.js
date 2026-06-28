import Phaser from 'phaser';
import { GAME_W, GAME_H, COLORS, LAYOUT } from '../constants.js';
import { RPG_ENEMIES, SKILLS } from '../data/content.js';
import { getRun, startRun, currentFloor, grantExp, grantGold } from '../state/run.js';
import { audio } from '../audio/AudioManager.js';

// ───────────────────────────────────────────────────────────────
// ターン制バトル。FloorScene が run.pendingEnemy に敵を入れて起動する。
// Phase C 対応：run.party に複数メンバーが入る。プレイヤーは手動入力、仲間は自動行動。
// HP/MP・レベル・持ち物は run.js が戦闘をまたいで保持。
// ───────────────────────────────────────────────────────────────
export class BattleScene extends Phaser.Scene {
  constructor() { super('BattleScene'); }

  create(data) {
    let run = getRun();
    if (!run) run = startRun();
    this.run = run;
    this.player = run.player;
    this.party = run.party ?? [run.player]; // 後方互換：party がなければ player のみ
    this.returnTo = data?.returnTo ?? 'FloorScene';
    this.isBoss = !!run.pendingIsBoss;

    const enemyKey = run.pendingEnemy ?? (currentFloor() ? currentFloor().encounters[0].enemy : 'caterpillar');
    const enemyDef = RPG_ENEMIES[enemyKey];
    this.enemy = { ...structuredClone(enemyDef), maxHp: enemyDef.hp };

    this.battleOver = false;
    this.busy = true;

    this.buildBackground();
    this.buildSprites();
    this.buildFloorHud();
    this.buildPartyStatusWindow();
    this.buildEnemyHud();
    this.buildMessageWindow();
    this.buildCommandWindow();
    this.setupKeys();
    audio.playBGM('battle');

    this.runSequence(
      [{ text: this.enemy.flavorAppear ?? `${this.enemy.name}が あらわれた！`, delay: 1000 }],
      () => this.beginCommandPhase()
    );
  }

  // ── 画面構築 ───────────────────────────────────────────────
  buildBackground() {
    if (this.textures.exists('battleOffice')) {
      this.add.image(0, 0, 'battleOffice').setOrigin(0, 0).setDisplaySize(GAME_W, GAME_H);
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.32).fillRect(0, 0, GAME_W, GAME_H);
      g.fillStyle(0x1a1836, 0.50).fillRect(0, 310, GAME_W, 120);
      g.fillStyle(0x000000, 0.35).fillRect(0, 430, GAME_W, GAME_H - 430);
    } else {
      const g = this.add.graphics();
      g.fillGradientStyle(COLORS.bgTop, COLORS.bgTop, COLORS.bgBottom, COLORS.bgBottom, 1);
      g.fillRect(0, 0, GAME_W, GAME_H);
      g.fillStyle(0x1a1836, 0.55).fillRect(0, 310, GAME_W, 110);
      g.fillStyle(0x000000, 0.3).fillRect(0, 430, GAME_W, GAME_H - 430);
    }
  }

  buildSprites() {
    // パーティ人数に応じた立ち位置（前列・後列ずらし）
    const n = this.party.length;
    const positions = n === 1
      ? [{ x: LAYOUT.playerX, y: LAYOUT.playerY, scale: 1 }]
      : n === 2
        ? [{ x: 255, y: 370, scale: 1 }, { x: 155, y: 385, scale: 0.85 }]
        : [{ x: 270, y: 365, scale: 1 }, { x: 185, y: 380, scale: 0.85 }, { x: 110, y: 390, scale: 0.72 }];

    const TINT_COLORS = { kohai: 0xaaddff, ol: 0xffbbcc };

    this.partySprites = this.party.map((m, i) => {
      const pos = positions[i];
      const sprite = this.add.image(pos.x, pos.y, m.sprite || 'playerIdle').setOrigin(0.5, 1);
      this.scaleToHeight(sprite, LAYOUT.playerH * pos.scale);
      sprite._homeX = pos.x;

      // 仲間には名前タグ表示（プレースホルダー期間、どのスプライトか区別できるように）
      if (i > 0) {
        const sprH = LAYOUT.playerH * pos.scale;
        this.add.text(pos.x, pos.y - sprH - 4, m.name, {
          fontFamily: 'sans-serif', fontSize: '11px', color: '#aaddff',
          stroke: '#000000', strokeThickness: 3,
        }).setOrigin(0.5, 1);
        const tint = TINT_COLORS[m.key];
        if (tint) { sprite.setTint(tint); sprite._origTint = tint; }
      }

      return sprite;
    });

    this.playerSprite = this.partySprites[0]; // backward compat 用

    this.enemySprite = this.add.image(LAYOUT.enemyX, LAYOUT.enemyY, this.enemy.sprite)
      .setOrigin(0.5, 1);
    this.enemySprite._homeX = LAYOUT.enemyX;
    this.scaleToHeight(this.enemySprite, LAYOUT.enemyH);
    this.enemySprite._baseScale = this.enemySprite.scaleX; // defeated 差替時に同スケールを保持
  }

  scaleToHeight(img, h) { img.setScale(h / img.height); }

  drawWindow(x, y, w, h) {
    if (this.textures.exists('uiWindow')) {
      return this.add.nineslice(x, y, 'uiWindow', undefined, w, h, 14, 14, 14, 14).setOrigin(0, 0);
    }
    const g = this.add.graphics();
    g.fillStyle(COLORS.windowFill, 0.92).fillRoundedRect(x, y, w, h, 10);
    g.lineStyle(3, COLORS.windowEdge, 1).strokeRoundedRect(x, y, w, h, 10);
    return g;
  }

  // ── パーティステータス窓（全メンバー縦積み）────────────────
  buildPartyStatusWindow() {
    const x = 20;
    const rowH = 38;
    const totalH = rowH * this.party.length + 8;
    const y = 440 - totalH - 4; // メッセージ窓(y=440)の直上に配置
    const w = 130;
    this.statX = x; this.statW = w;
    this.drawWindow(x, y, w, totalH);

    this.partyStatusItems = this.party.map((m, i) => {
      const ry = y + 6 + i * rowH;
      this.add.text(x + 8, ry, m.name, {
        fontFamily: 'sans-serif', fontSize: '12px', color: COLORS.text, fontStyle: 'bold',
      });
      this.add.text(x + w - 8, ry, `Lv${m.level}`, {
        fontFamily: 'monospace', fontSize: '10px', color: COLORS.textDim,
      }).setOrigin(1, 0);
      const hpText = this.add.text(x + 8, ry + 14, '', {
        fontFamily: 'monospace', fontSize: '9px', color: COLORS.text,
      });
      const hpBar = this.add.graphics();
      const mpBar = this.add.graphics();
      return { member: m, hpText, hpBar, mpBar, barY: ry + 24, barY2: ry + 31 };
    });

    this.refreshPartyStatus();
  }

  refreshPartyStatus() {
    const bx = this.statX + 8, bw = this.statW - 16;
    this.partyStatusItems.forEach(({ member: m, hpText, hpBar, mpBar, barY, barY2 }) => {
      hpText.setText(`HP ${m.hp}/${m.maxHp}`);
      this.drawBar(hpBar, bx, barY,  bw, 5, m.hp / m.maxHp, this.hpColor(m.hp / m.maxHp));
      this.drawBar(mpBar, bx, barY2, bw, 3, m.mp / m.maxMp, COLORS.mpBlue);
    });
  }

  // 後方互換 alias（既存の呼び出し元が使っている）
  refreshPlayerStatus() { this.refreshPartyStatus(); }

  buildEnemyHud() {
    this.enemyNameText = this.add.text(LAYOUT.enemyX, LAYOUT.enemyY - LAYOUT.enemyH - 28, this.enemy.name, {
      fontFamily: 'sans-serif', fontSize: '18px', color: COLORS.text, fontStyle: 'bold',
    }).setOrigin(0.5, 1);
    this.enemyHpBar = this.add.graphics();
    this.refreshEnemyHud();
  }

  refreshEnemyHud() {
    const w = 160, x = LAYOUT.enemyX - w / 2, y = LAYOUT.enemyY - LAYOUT.enemyH - 20;
    this.drawBar(this.enemyHpBar, x, y, w, 8, this.enemy.hp / this.enemy.maxHp, this.hpColor(this.enemy.hp / this.enemy.maxHp));
  }

  buildFloorHud() {
    const f = currentFloor();
    this.add.text(16, 12, f ? f.name : '', {
      fontFamily: 'sans-serif', fontSize: '14px', color: COLORS.textDim,
    });
    this.add.text(16, 30, this.isBoss ? '── ボス戦 ──' : `魔物 ${(this.run.stepInFloor || 0) + 1}/${f ? f.steps : '?'}`, {
      fontFamily: 'monospace', fontSize: '13px', color: COLORS.textDim,
    });
  }

  drawBar(g, x, y, w, h, ratio, color) {
    ratio = Phaser.Math.Clamp(ratio, 0, 1);
    g.clear();
    g.fillStyle(0x000000, 0.6).fillRoundedRect(x - 2, y - 2, w + 4, h + 4, 3);
    g.fillStyle(0x333344, 1).fillRoundedRect(x, y, w, h, 3);
    if (ratio > 0) g.fillStyle(color, 1).fillRoundedRect(x, y, w * ratio, h, 3);
  }

  hpColor(r) { return r > 0.5 ? COLORS.hpGreen : r > 0.25 ? COLORS.hpYellow : COLORS.hpRed; }

  buildMessageWindow() {
    const x = 20, y = 440, w = GAME_W - 40, h = GAME_H - y - 20;
    this.drawWindow(x, y, w, h);
    this.msgText = this.add.text(x + 22, y + 22, '', {
      fontFamily: 'sans-serif', fontSize: '21px', color: COLORS.text,
      wordWrap: { width: w - 44, useAdvancedWrap: true }, lineSpacing: 6,
    });
  }

  setMessage(t) { this.msgText.setText(t); }

  buildCommandWindow() {
    this.cmdX = 548; this.cmdY = 446; this.cmdW = 224; this.cmdH = 130;
    this.cmdBox = this.drawWindow(this.cmdX, this.cmdY, this.cmdW, this.cmdH).setVisible(false);
    this.cmdItems = [];
    this.cmdIcons = [];
    this.cmdCursor = (this.textures.exists('uiCursor')
      ? this.add.image(0, 0, 'uiCursor').setOrigin(0, 0.5).setDisplaySize(18, 18)
      : this.add.text(0, 0, '▶', { fontFamily: 'sans-serif', fontSize: '20px', color: '#ffe24a' }).setOrigin(0, 0.5)
    ).setVisible(false);
    this.cmdCursorX = this.cmdX + 12;
    this.menuIndex = 0;
    this.menuOptions = [];
    this.menuActive = false;
  }

  openMenu(promptText, options) {
    this.setMessage(promptText);
    this.menuOptions = options;
    this.menuActive = true;
    this.cmdBox.setVisible(true);

    this.cmdItems.forEach((t) => t.destroy());
    this.cmdIcons.forEach((ic) => ic.destroy());
    this.cmdItems = []; this.cmdIcons = [];
    const rowH = Math.min(28, (this.cmdH - 24) / options.length);
    const hasIcons = options.some((o) => o.icon);
    const iconX = this.cmdX + 30;
    const labelX = hasIcons ? this.cmdX + 56 : this.cmdX + 34;
    this.cmdCursorX = this.cmdX + (hasIcons ? 10 : 12);
    options.forEach((opt, i) => {
      const ty = this.cmdY + 14 + i * rowH;
      if (opt.icon && this.textures.exists(opt.icon)) {
        const ic = this.add.image(iconX, ty + 9, opt.icon).setOrigin(0, 0.5).setDisplaySize(22, 22);
        if (opt.enabled === false) ic.setAlpha(0.4);
        this.cmdIcons.push(ic);
      }
      const t = this.add.text(labelX, ty, opt.label, {
        fontFamily: 'sans-serif', fontSize: '18px',
        color: opt.enabled === false ? '#666a80' : '#ffffff',
      });
      this.cmdItems.push(t);
    });
    this.menuIndex = options.findIndex((o) => o.enabled !== false);
    if (this.menuIndex < 0) this.menuIndex = 0;
    this.cmdCursor.setVisible(true);
    this.updateCursor();

    this.cmdItems.forEach((t, i) => {
      t.setInteractive({ useHandCursor: options[i].enabled !== false });
      t.on('pointerover', () => { if (options[i].enabled !== false) { this.menuIndex = i; this.updateCursor(); } });
      t.on('pointerdown', () => { if (options[i].enabled !== false) this.confirmMenu(); });
    });
  }

  updateCursor() {
    const t = this.cmdItems[this.menuIndex];
    if (!t) return;
    this.cmdCursor.setPosition(this.cmdCursorX, t.y + 9).setVisible(true);
  }

  closeMenu() {
    this.menuActive = false;
    this.cmdBox.setVisible(false);
    this.cmdCursor.setVisible(false);
    this.cmdItems.forEach((t) => t.destroy());
    this.cmdIcons.forEach((ic) => ic.destroy());
    this.cmdItems = []; this.cmdIcons = [];
  }

  moveCursor(delta) {
    if (!this.menuActive) return;
    const n = this.menuOptions.length;
    let i = this.menuIndex;
    for (let step = 0; step < n; step++) {
      i = (i + delta + n) % n;
      if (this.menuOptions[i].enabled !== false) break;
    }
    this.menuIndex = i;
    audio.playSE('cursor');
    this.updateCursor();
  }

  confirmMenu() {
    if (!this.menuActive) return;
    const opt = this.menuOptions[this.menuIndex];
    if (!opt || opt.enabled === false) return;
    audio.playSE('confirm');
    opt.onSelect();
  }

  setupKeys() {
    const kb = this.input.keyboard;
    kb.on('keydown-UP',    () => this.moveCursor(-1));
    kb.on('keydown-DOWN',  () => this.moveCursor(1));
    kb.on('keydown-LEFT',  () => this.moveCursor(-1));
    kb.on('keydown-RIGHT', () => this.moveCursor(1));
    kb.on('keydown-ENTER', () => this.confirmMenu());
    kb.on('keydown-SPACE', () => this.confirmMenu());
  }

  // ── コマンドフェーズ ───────────────────────────────────────
  beginCommandPhase() {
    if (this.battleOver) return;
    this.busy = false;
    this.openMenu(`${this.player.name}は どうする？`, [
      { label: 'たたかう', icon: 'iconAttack', onSelect: () => this.chooseAttack() },
      { label: 'とくぎ',   icon: 'iconSkill',  onSelect: () => this.chooseSkill() },
      { label: 'どうぐ',   icon: 'iconItem',   onSelect: () => this.chooseItem() },
      { label: 'にげる',   icon: 'iconFlee',   onSelect: () => this.chooseFlee() },
    ]);
  }

  chooseAttack() {
    this.closeMenu();
    this.playerActionPose = 'playerAttack';
    this.resolveRound(() => this.attackSteps(
      this.player, this.enemy, this.playerSprite, this.enemySprite,
      `${this.player.name}の こうげき！`
    ));
  }

  chooseSkill() {
    const opts = this.player.skills.map((key) => {
      const s = SKILLS[key];
      const ok = this.player.mp >= s.cost;
      return {
        label: `${s.name} (${s.cost})`, enabled: ok,
        onSelect: () => { this.closeMenu(); this.useSkill(key); },
      };
    });
    opts.push({ label: '← もどる', onSelect: () => { this.closeMenu(); this.beginCommandPhase(); } });
    this.openMenu('どの とくぎを つかう？', opts);
  }

  useSkill(key) {
    const s = SKILLS[key];
    this.player.mp -= s.cost;
    this.refreshPartyStatus();
    if (s.kind === 'heal') {
      this.resolveRound(() => this.healSteps(this.player, s.amount, s.msg.replace('{user}', this.player.name)));
    } else {
      this.playerActionPose = 'playerCast';
      this.resolveRound(() => this.attackSteps(
        this.player, this.enemy, this.playerSprite, this.enemySprite,
        s.msg.replace('{user}', this.player.name), s.power
      ));
    }
  }

  chooseItem() {
    const inv = this.player.inventory;
    const opts = Object.entries(inv).map(([key, it]) => ({
      label: `${it.name} (${it.count})`, enabled: it.count > 0,
      onSelect: () => { this.closeMenu(); this.useItem(key); },
    }));
    opts.push({ label: '← もどる', onSelect: () => { this.closeMenu(); this.beginCommandPhase(); } });
    this.openMenu('どの どうぐを つかう？', opts);
  }

  useItem(key) {
    const it = this.player.inventory[key];
    it.count -= 1;
    if (it.kind === 'mpHeal') {
      this.resolveRound(() => this.mpHealSteps(this.player, it.amount, it.msg.replace('{user}', this.player.name)));
    } else {
      this.resolveRound(() => this.healSteps(this.player, it.amount, it.msg.replace('{user}', this.player.name)));
    }
  }

  chooseFlee() {
    this.closeMenu();
    this.busy = true;
    const success = Math.random() < 0.5 + (this.player.spd - this.enemy.spd) * 0.05;
    if (success) {
      this.runSequence([{ text: `${this.player.name}は うまく にげだした！`, delay: 1200 }],
        () => this.endBattle());
    } else {
      this.runSequence([{ text: 'しかし まわりこまれて しまった！', delay: 900 }], () => {
        this.resolveActors([this.enemyActor()], 0);
      });
    }
  }

  // ── ターン解決（素早さ降順）───────────────────────────────
  resolveRound(playerStepBuilder) {
    this.busy = true;
    const actors = [
      { spd: this.player.spd, build: playerStepBuilder },
      // 生存している仲間は自動行動
      ...this.party
        .filter((m) => m !== this.player && m.hp > 0)
        .map((m) => ({ spd: m.spd, build: () => this.companionAutoSteps(m) })),
      this.enemyActor(),
    ];
    actors.sort((a, b) => b.spd - a.spd);
    this.resolveActors(actors, 0);
  }

  enemyActor() {
    return {
      spd: this.enemy.spd,
      build: () => {
        // 生存パーティメンバーをランダムに狙う
        const living = this.party.filter((m) => m.hp > 0);
        const target = living.length > 1 ? Phaser.Utils.Array.GetRandom(living) : this.player;
        const tgtSprite = this.partySprites[this.party.indexOf(target)] ?? this.playerSprite;
        const act = Phaser.Utils.Array.GetRandom(this.enemy.actions);
        return this.attackSteps(
          this.enemy, target, this.enemySprite, tgtSprite,
          act.msg ?? `${this.enemy.name}の こうげき！`, act.power ?? 1.0, true
        );
      },
    };
  }

  // 仲間の自動行動：HP < 50% かつ回復スキルあり → 回復。それ以外 → 通常攻撃。
  companionAutoSteps(companion) {
    const idx = this.party.indexOf(companion);
    const sprite = this.partySprites[idx] ?? this.playerSprite;
    if (companion.hp < companion.maxHp * 0.5) {
      const healKey = companion.skills.find((k) => SKILLS[k]?.kind === 'heal');
      if (healKey && companion.mp >= SKILLS[healKey].cost) {
        companion.mp -= SKILLS[healKey].cost;
        const s = SKILLS[healKey];
        return this.healSteps(companion, s.amount, s.msg.replace('{user}', companion.name), sprite);
      }
    }
    return this.attackSteps(
      companion, this.enemy, sprite, this.enemySprite,
      `${companion.name}の こうげき！`
    );
  }

  resolveActors(actors, i) {
    if (this.battleOver) return;
    if (i >= actors.length) { this.beginCommandPhase(); return; }
    const steps = actors[i].build();
    this.runSequence(steps, () => {
      if (this.checkDeaths()) return;
      this.resolveActors(actors, i + 1);
    });
  }

  // ── 行動ステップ生成 ───────────────────────────────────────
  attackSteps(attacker, target, attSprite, tgtSprite, declareMsg, power = 1.0, targetIsPlayer = false) {
    const dmg = this.calcDamage(attacker, target, power);
    return [
      {
        text: declareMsg, delay: 650,
        fn: () => {
          this.lunge(attSprite, tgtSprite);
          if (attSprite === this.playerSprite) this.showPlayerPose(this.playerActionPose || 'playerAttack', 460);
        },
      },
      {
        text: `${target.name} に ${dmg} の ダメージ！`, delay: 850,
        fn: () => this.applyDamage(target, dmg, tgtSprite, targetIsPlayer),
      },
    ];
  }

  healSteps(target, amount, msg, sprite = null) {
    const actualSprite = sprite ?? this.playerSprite;
    const healed = Math.min(target.maxHp, target.hp + amount) - target.hp;
    return [
      {
        text: msg, delay: 650,
        fn: () => {
          this.flashHeal(actualSprite);
          if (actualSprite === this.playerSprite) this.showPlayerPose('playerDrink', 750);
        },
      },
      {
        text: `${target.name}の HPが ${healed} かいふくした！`, delay: 850,
        fn: () => { target.hp += healed; this.refreshPartyStatus(); },
      },
    ];
  }

  mpHealSteps(target, amount, msg) {
    const healed = Math.min(target.maxMp, target.mp + amount) - target.mp;
    return [
      {
        text: msg, delay: 650,
        fn: () => { this.flashHeal(this.playerSprite); this.showPlayerPose('playerDrink', 750); },
      },
      {
        text: `${target.name}の MPが ${healed} かいふくした！`, delay: 850,
        fn: () => { target.mp += healed; this.refreshPartyStatus(); },
      },
    ];
  }

  calcDamage(attacker, target, power) {
    const base = attacker.atk * power - target.def / 2;
    return Math.max(1, Math.round(base * Phaser.Math.FloatBetween(0.85, 1.0)));
  }

  applyDamage(target, dmg, sprite, isPlayer) {
    target.hp = Math.max(0, target.hp - dmg);
    if (isPlayer) this.refreshPartyStatus(); else this.refreshEnemyHud();
    this.popDamage(sprite, dmg);
    this.flashHurt(target, sprite, isPlayer);
    this.cameras.main.shake(120, 0.006);
  }

  // ── 演出 ───────────────────────────────────────────────────
  lunge(sprite, targetSprite) {
    const dir = Math.sign(targetSprite.x - sprite.x) || 1;
    const home = sprite._homeX ?? sprite.x;
    this.tweens.add({ targets: sprite, x: home + dir * 70, duration: 130, yoyo: true, ease: 'Quad.easeOut' });
  }

  showPlayerPose(key, ms = 500) {
    if (!key || !this.textures.exists(key)) return;
    if (this._poseTimer) this._poseTimer.remove();
    this.playerSprite.setTexture(key);
    this.scaleToHeight(this.playerSprite, LAYOUT.playerH);
    this._poseTimer = this.time.delayedCall(ms, () => {
      if (this.battleOver) return;
      this.playerSprite.setTexture(this.player.sprite);
      this.scaleToHeight(this.playerSprite, LAYOUT.playerH);
    });
  }

  flashHurt(target, sprite, isPlayer) {
    audio.playSE('hit');
    const homeX = sprite._homeX ?? (isPlayer ? LAYOUT.playerX : LAYOUT.enemyX);
    const dir = isPlayer ? -1 : 1;
    sprite.x = homeX;
    this.tweens.add({ targets: sprite, x: homeX + dir * 14, duration: 80, yoyo: true, ease: 'Quad.easeOut' });
    // 被弾フラッシュ後に元の色調（仲間の tint）を復元
    const origTint = sprite._origTint ?? null;
    const restore = () => { if (origTint) sprite.setTint(origTint); else sprite.clearTint(); };
    sprite.setTintFill(0xff5555);
    this.time.delayedCall(90,  restore);
    this.time.delayedCall(180, () => sprite.setTintFill(0xff5555));
    this.time.delayedCall(270, restore);
  }

  flashHeal(sprite) {
    audio.playSE('heal');
    const origTint = sprite._origTint ?? null;
    sprite.setTintFill(0x7CFF8A);
    this.time.delayedCall(150, () => { if (origTint) sprite.setTint(origTint); else sprite.clearTint(); });
  }

  popDamage(sprite, dmg) {
    const t = this.add.text(sprite.x, sprite.y - sprite.displayHeight * 0.7, `${dmg}`, {
      fontFamily: 'sans-serif', fontSize: '34px', color: '#ffec5c', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5);
    this.tweens.add({ targets: t, y: t.y - 46, alpha: 0, duration: 750, ease: 'Quad.easeOut',
      onComplete: () => t.destroy() });
  }

  // ── 勝敗判定 ───────────────────────────────────────────────
  checkDeaths() {
    if (this.enemy.hp <= 0) { this.win(); return true; }
    if (this.party.every((m) => m.hp <= 0)) { this.lose(); return true; }
    return false;
  }

  win() {
    this.battleOver = true;
    audio.stopBGM();
    audio.playSE('victory');
    this.closeMenu();
    if (this._poseTimer) this._poseTimer.remove();

    // 生存メンバー全員に勝利ポーズ
    this.party.forEach((m, i) => {
      if (m.hp > 0 && this.textures.exists('playerVictory')) {
        const spr = this.partySprites[i];
        spr.clearTint().setTexture('playerVictory');
        this.scaleToHeight(spr, LAYOUT.playerH);
      }
    });

    if (this.enemy.defeatedSprite && this.textures.exists(this.enemy.defeatedSprite)) {
      this.enemySprite.clearTint().setTexture(this.enemy.defeatedSprite);
      // idle と同じスケールを使う（テクスチャの縦横比が違っても拡大しない）
      this.enemySprite.setScale(this.enemySprite._baseScale);
      this.tweens.add({ targets: this.enemySprite, alpha: 0, duration: 700, delay: 250 });
    } else {
      this.tweens.add({ targets: this.enemySprite, alpha: 0, angle: 20, duration: 600 });
    }

    // 報酬：ゴールドはプレイヤーだけ、経験値は全員
    grantGold(this.player, this.enemy.gold);
    const levelUps = grantExp(this.player, this.enemy.exp);
    for (const m of this.party) {
      if (m !== this.player) grantExp(m, this.enemy.exp);
    }

    const steps = [
      { text: `${this.enemy.name}を たおした！`, delay: 1100 },
      { text: `けいけんち ${this.enemy.exp} と ${this.enemy.gold}G を てにいれた！`, delay: 1200 },
    ];
    for (const up of levelUps) {
      steps.push({
        text: `${this.player.name}は レベル ${up.level} に あがった！`, delay: 1300,
        fn: () => { audio.playSE('levelUp'); this.refreshPartyStatus(); },
      });
      if (up.learned) {
        steps.push({ text: `とくぎ「${SKILLS[up.learned].name}」を おぼえた！`, delay: 1300 });
      }
    }

    this.runSequence(steps, () => {
      this.run.lastWon = true;
      this.cameras.main.fadeOut(350);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(this.returnTo));
    });
  }

  lose() {
    this.battleOver = true;
    audio.stopBGM();
    audio.playSE('gameOver');
    this.closeMenu();

    // 全滅演出
    this.party.forEach((m, i) => {
      const spr = this.partySprites[i];
      if (m.hurtSprite && this.textures.exists(m.hurtSprite)) {
        spr.clearTint().setTexture(m.hurtSprite);
        this.scaleToHeight(spr, LAYOUT.playerH);
      }
      this.tweens.add({ targets: spr, alpha: 0.35, angle: -14, y: spr.y + 12, duration: 700 });
    });

    const defeatedMsg = this.party.length === 1
      ? `${this.player.name}は ちからつきた…`
      : 'パーティは ちからつきた…';

    this.runSequence([
      { text: defeatedMsg, delay: 1300 },
      { text: '今夜も 定時には 帰れなかった……', delay: 1600 },
    ], () => this.endBattle('lose'));
  }

  endBattle(outcome) {
    this.cameras.main.fadeOut(500);
    this.cameras.main.once('camerafadeoutcomplete',
      () => this.scene.start('ResultScene', { outcome }));
  }

  // ── メッセージ送り（オート進行）────────────────────────────
  runSequence(steps, onComplete) {
    let i = 0;
    const next = () => {
      if (i >= steps.length) { onComplete && onComplete(); return; }
      const step = steps[i++];
      if (step.fn) step.fn();
      this.setMessage(step.text);
      this.time.delayedCall(step.delay ?? 850, next);
    };
    next();
  }
}
