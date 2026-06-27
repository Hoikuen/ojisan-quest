import Phaser from 'phaser';
import { GAME_W, GAME_H, COLORS, LAYOUT } from '../constants.js';
import { PLAYER, RPG_ENEMIES, SKILLS, ITEMS, FIRST_BATTLE } from '../data/content.js';

// ───────────────────────────────────────────────────────────────
// 最小ループ：主人公おじさん1人 vs 敵1体の「1戦闘が回る」ターン制バトル。
// 行動順は素早さ順（ATBなし）。コマンド：たたかう／とくぎ／どうぐ／にげる。
// UI・背景はプレースホルダ（Graphics描画）。後で発注した画像に差し替える。
// ───────────────────────────────────────────────────────────────
export class BattleScene extends Phaser.Scene {
  constructor() { super('BattleScene'); }

  create() {
    // 戦闘状態（モジュール定義を破壊しないようクローン）
    this.player = { ...PLAYER, inventory: structuredClone(ITEMS) };
    const enemyDef = RPG_ENEMIES[FIRST_BATTLE.enemy];
    this.enemy = { ...enemyDef, maxHp: enemyDef.hp };

    this.battleOver = false;
    this.busy = true; // 演出中フラグ（入力ロック）

    this.buildBackground();
    this.buildSprites();
    this.buildPlayerStatusWindow();
    this.buildEnemyHud();
    this.buildMessageWindow();
    this.buildCommandWindow();
    this.setupKeys();

    // 登場演出 → コマンド入力へ
    this.runSequence(
      [{ text: this.enemy.flavorAppear ?? `${this.enemy.name}が あらわれた！`, delay: 1000 }],
      () => this.beginCommandPhase()
    );
  }

  // ── 画面構築 ───────────────────────────────────────────────
  buildBackground() {
    const g = this.add.graphics();
    // 上下グラデ風（夜のオフィス）。背景画像が来たらこのGraphicsを画像に差し替え。
    g.fillGradientStyle(COLORS.bgTop, COLORS.bgTop, COLORS.bgBottom, COLORS.bgBottom, 1);
    g.fillRect(0, 0, GAME_W, GAME_H);
    // 床ライン
    g.fillStyle(0x000000, 0.25).fillRect(0, 430, GAME_W, GAME_H - 430);
  }

  buildSprites() {
    this.enemySprite = this.add.image(LAYOUT.enemyX, LAYOUT.enemyY, this.enemy.sprite)
      .setOrigin(0.5, 1);
    this.scaleToHeight(this.enemySprite, LAYOUT.enemyH);

    this.playerSprite = this.add.image(LAYOUT.playerX, LAYOUT.playerY, this.player.sprite)
      .setOrigin(0.5, 1);
    this.scaleToHeight(this.playerSprite, LAYOUT.playerH);
    // 主人公は敵（右）を向く。元画像が左向きなら true に切替（検証で確認）。
    this.playerSprite.setFlipX(false);
  }

  scaleToHeight(img, h) { img.setScale(h / img.height); }

  // 角丸＋白縁のウィンドウ枠（王道RPG風プレースホルダ）
  drawWindow(x, y, w, h) {
    const g = this.add.graphics();
    g.fillStyle(COLORS.windowFill, 0.92).fillRoundedRect(x, y, w, h, 10);
    g.lineStyle(3, COLORS.windowEdge, 1).strokeRoundedRect(x, y, w, h, 10);
    return g;
  }

  buildPlayerStatusWindow() {
    // 小さめのステータス窓を「おじさんの左隣」の左下へ。細めにして主人公スプライト(左端≈x144)に被らせない。
    // 下端を下のメッセージ枠(y=440)に接させる。右に置くと敵HPと紛らわしいので左。
    const x = 20, y = 352, w = 120, h = 88;
    this.statX = x; this.statY = y; this.statW = w;
    this.drawWindow(x, y, w, h);
    this.add.text(x + 10, y + 6, this.player.name, {
      fontFamily: 'sans-serif', fontSize: '14px', color: COLORS.text, fontStyle: 'bold',
    });
    this.pLvText = this.add.text(x + w - 10, y + 8, `Lv${this.player.level}`, {
      fontFamily: 'monospace', fontSize: '11px', color: COLORS.textDim,
    }).setOrigin(1, 0);

    // 縦積み：HPラベル→HPバー→MPラベル→MPバー（細幅でも読める小サイズ）
    this.pHpText = this.add.text(x + 10, y + 27, '', { fontFamily: 'monospace', fontSize: '11px', color: COLORS.text });
    this.pHpBar = this.add.graphics();
    this.pMpText = this.add.text(x + 10, y + 54, '', { fontFamily: 'monospace', fontSize: '11px', color: COLORS.text });
    this.pMpBar = this.add.graphics();
    this.refreshPlayerStatus();
  }

  refreshPlayerStatus() {
    this.pHpText.setText(`HP ${this.player.hp}/${this.player.maxHp}`);
    this.pMpText.setText(`MP ${this.player.mp}/${this.player.maxMp}`);
    const bx = this.statX + 10, bw = this.statW - 20;
    this.drawBar(this.pHpBar, bx, this.statY + 42, bw, 6, this.player.hp / this.player.maxHp, this.hpColor(this.player.hp / this.player.maxHp));
    this.drawBar(this.pMpBar, bx, this.statY + 69, bw, 6, this.player.mp / this.player.maxMp, COLORS.mpBlue);
  }

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
      wordWrap: { width: w - 44 }, lineSpacing: 6,
    });
  }

  setMessage(t) { this.msgText.setText(t); }

  buildCommandWindow() {
    // メッセージ窓の右半分に重ねて出すコマンド枠（縦1列。左半分にはプロンプト文が出る）
    this.cmdX = 548; this.cmdY = 446; this.cmdW = 224; this.cmdH = 130;
    this.cmdBox = this.drawWindow(this.cmdX, this.cmdY, this.cmdW, this.cmdH).setVisible(false);
    this.cmdItems = [];   // text objects
    this.cmdCursor = this.add.text(0, 0, '▶', {
      fontFamily: 'sans-serif', fontSize: '20px', color: '#ffe24a',
    }).setVisible(false);
    this.menuIndex = 0;
    this.menuOptions = [];
    this.menuActive = false;
  }

  // ── 汎用メニュー（コマンド／とくぎ／どうぐで共用）────────────
  // options: [{ label, enabled, onSelect }]、縦1列レイアウト（長い技名でも被らない）。
  openMenu(promptText, options) {
    this.setMessage(promptText);
    this.menuOptions = options;
    this.menuActive = true;
    this.cmdBox.setVisible(true);

    // 既存の項目テキストを作り直す
    this.cmdItems.forEach((t) => t.destroy());
    this.cmdItems = [];
    const rowH = Math.min(28, (this.cmdH - 24) / options.length);
    options.forEach((opt, i) => {
      const tx = this.cmdX + 34;
      const ty = this.cmdY + 14 + i * rowH;
      const t = this.add.text(tx, ty, opt.label, {
        fontFamily: 'sans-serif', fontSize: '18px',
        color: opt.enabled === false ? '#666a80' : '#ffffff',
      });
      this.cmdItems.push(t);
    });
    // 最初の有効項目にカーソル
    this.menuIndex = options.findIndex((o) => o.enabled !== false);
    if (this.menuIndex < 0) this.menuIndex = 0;
    this.cmdCursor.setVisible(true);
    this.updateCursor();

    // ポインタ操作
    this.cmdItems.forEach((t, i) => {
      t.setInteractive({ useHandCursor: options[i].enabled !== false });
      t.on('pointerover', () => { if (options[i].enabled !== false) { this.menuIndex = i; this.updateCursor(); } });
      t.on('pointerdown', () => { if (options[i].enabled !== false) this.confirmMenu(); });
    });
  }

  updateCursor() {
    const t = this.cmdItems[this.menuIndex];
    if (!t) return;
    this.cmdCursor.setPosition(t.x - 22, t.y).setVisible(true);
  }

  closeMenu() {
    this.menuActive = false;
    this.cmdBox.setVisible(false);
    this.cmdCursor.setVisible(false);
    this.cmdItems.forEach((t) => t.destroy());
    this.cmdItems = [];
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
    this.updateCursor();
  }

  confirmMenu() {
    if (!this.menuActive) return;
    const opt = this.menuOptions[this.menuIndex];
    if (!opt || opt.enabled === false) return;
    opt.onSelect();
  }

  setupKeys() {
    const kb = this.input.keyboard;
    // 縦1列：上下（左右も）で±1
    kb.on('keydown-UP', () => this.moveCursor(-1));
    kb.on('keydown-DOWN', () => this.moveCursor(1));
    kb.on('keydown-LEFT', () => this.moveCursor(-1));
    kb.on('keydown-RIGHT', () => this.moveCursor(1));
    kb.on('keydown-ENTER', () => this.confirmMenu());
    kb.on('keydown-SPACE', () => this.confirmMenu());
  }

  // ── コマンドフェーズ ───────────────────────────────────────
  beginCommandPhase() {
    if (this.battleOver) return;
    this.busy = false;
    this.openMenu(`${this.player.name}は どうする？`, [
      { label: 'たたかう', onSelect: () => this.chooseAttack() },
      { label: 'とくぎ',   onSelect: () => this.chooseSkill() },
      { label: 'どうぐ',   onSelect: () => this.chooseItem() },
      { label: 'にげる',   onSelect: () => this.chooseFlee() },
    ]);
  }

  chooseAttack() {
    this.closeMenu();
    this.resolveRound(() => this.attackSteps(this.player, this.enemy, this.playerSprite, this.enemySprite,
      `${this.player.name}の こうげき！`));
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
    this.refreshPlayerStatus();
    if (s.kind === 'heal') {
      this.resolveRound(() => this.healSteps(this.player, s.amount, s.msg.replace('{user}', this.player.name)));
    } else {
      this.resolveRound(() => this.attackSteps(this.player, this.enemy, this.playerSprite, this.enemySprite,
        s.msg.replace('{user}', this.player.name), s.power));
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
    this.resolveRound(() => this.healSteps(this.player, it.amount, it.msg.replace('{user}', this.player.name)));
  }

  chooseFlee() {
    this.closeMenu();
    this.busy = true;
    const success = Math.random() < 0.5 + (this.player.spd - this.enemy.spd) * 0.05;
    if (success) {
      this.runSequence([{ text: `${this.player.name}は うまく にげだした！`, delay: 1200 }],
        () => this.endBattle());
    } else {
      // 逃げ失敗 → 敵のターンだけ消化
      this.runSequence([{ text: 'しかし まわりこまれて しまった！', delay: 900 }], () => {
        this.resolveActors([this.enemyActor()], 0);
      });
    }
  }

  // ── ターン解決（素早さ順）─────────────────────────────────
  resolveRound(playerStepBuilder) {
    this.busy = true;
    const playerActor = { spd: this.player.spd, build: playerStepBuilder };
    const order = this.player.spd >= this.enemy.spd
      ? [playerActor, this.enemyActor()]
      : [this.enemyActor(), playerActor];
    this.resolveActors(order, 0);
  }

  enemyActor() {
    return {
      spd: this.enemy.spd,
      build: () => {
        const act = Phaser.Utils.Array.GetRandom(this.enemy.actions);
        return this.attackSteps(this.enemy, this.player, this.enemySprite, this.playerSprite,
          act.msg ?? `${this.enemy.name}の こうげき！`, act.power ?? 1.0, true);
      },
    };
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
      { text: declareMsg, delay: 650, fn: () => this.lunge(attSprite, tgtSprite) },
      {
        text: `${target.name} に ${dmg} の ダメージ！`, delay: 850,
        fn: () => this.applyDamage(target, dmg, tgtSprite, targetIsPlayer),
      },
    ];
  }

  healSteps(target, amount, msg) {
    const before = target.hp;
    const healed = Math.min(target.maxHp, before + amount) - before;
    return [
      { text: msg, delay: 650, fn: () => this.flashHeal(this.playerSprite) },
      {
        text: `${target.name}の HPが ${healed} かいふくした！`, delay: 850,
        fn: () => { target.hp += healed; this.refreshPlayerStatus(); },
      },
    ];
  }

  calcDamage(attacker, target, power) {
    const base = attacker.atk * power - target.def / 2;
    const v = Phaser.Math.FloatBetween(0.85, 1.0);
    return Math.max(1, Math.round(base * v));
  }

  applyDamage(target, dmg, sprite, isPlayer) {
    target.hp = Math.max(0, target.hp - dmg);
    if (isPlayer) this.refreshPlayerStatus(); else this.refreshEnemyHud();
    this.popDamage(sprite, dmg);
    this.flashHurt(target, sprite, isPlayer);
    this.cameras.main.shake(120, 0.006);
  }

  // ── 演出 ───────────────────────────────────────────────────
  lunge(sprite, targetSprite) {
    const dir = Math.sign(targetSprite.x - sprite.x) || 1;
    const home = sprite.x;
    this.tweens.add({ targets: sprite, x: home + dir * 70, duration: 130, yoyo: true, ease: 'Quad.easeOut' });
  }

  flashHurt(target, sprite, isPlayer) {
    // 被弾＝「赤フラッシュ＋小さなのけぞり（後退）」のみ。
    // ★hurt（倒れ込みノックバック絵）への差し替えはしない：足元基準で立ち位置に固定すると
    //   倒れ込む胴体がフレーム上方に寄り、立ち位置から消えたように見えるため。
    //   倒れ込み絵は敗北（力尽きた）演出だけで使う。
    const homeX = isPlayer ? LAYOUT.playerX : LAYOUT.enemyX;
    const dir = isPlayer ? -1 : 1; // 相手と反対方向へ小さくのけぞる
    sprite.x = homeX;
    this.tweens.add({ targets: sprite, x: homeX + dir * 14, duration: 80, yoyo: true, ease: 'Quad.easeOut' });
    sprite.setTintFill(0xff5555);
    this.time.delayedCall(90, () => sprite.clearTint());
    this.time.delayedCall(180, () => sprite.setTintFill(0xff5555));
    this.time.delayedCall(270, () => sprite.clearTint());
  }

  flashHeal(sprite) {
    sprite.setTintFill(0x7CFF8A);
    this.time.delayedCall(150, () => sprite.clearTint());
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
    if (this.player.hp <= 0) { this.lose(); return true; }
    return false;
  }

  win() {
    this.battleOver = true;
    this.closeMenu();
    // 撃破演出：defeatedコマがあれば差し替え、無ければフェード
    if (this.enemy.defeatedSprite && this.textures.exists(this.enemy.defeatedSprite)) {
      this.enemySprite.clearTint().setTexture(this.enemy.defeatedSprite);
      this.scaleToHeight(this.enemySprite, LAYOUT.enemyH);
      this.tweens.add({ targets: this.enemySprite, alpha: 0, duration: 700, delay: 250 });
    } else {
      this.tweens.add({ targets: this.enemySprite, alpha: 0, angle: 20, duration: 600 });
    }
    this.runSequence([
      { text: `${this.enemy.name}を たおした！`, delay: 1100 },
      { text: `けいけんち ${this.enemy.exp} と ${this.enemy.gold}G を てにいれた！`, delay: 1300 },
      { text: 'おじさんは すこし 出口に 近づいた気がした。', delay: 1400 },
    ], () => this.endBattle());
  }

  lose() {
    this.battleOver = true;
    this.closeMenu();
    // 力尽きた演出：ここでだけ倒れ込みポーズ(hurt)に差し替えて崩れ落ちる
    if (this.player.hurtSprite && this.textures.exists(this.player.hurtSprite)) {
      this.playerSprite.clearTint().setTexture(this.player.hurtSprite);
      this.scaleToHeight(this.playerSprite, LAYOUT.playerH);
    }
    this.tweens.add({ targets: this.playerSprite, alpha: 0.35, angle: -14, y: this.playerSprite.y + 12, duration: 700 });
    this.runSequence([
      { text: `${this.player.name}は ちからつきた…`, delay: 1300 },
      { text: '今夜も 定時には 帰れなかった……', delay: 1600 },
    ], () => this.endBattle());
  }

  endBattle() {
    this.cameras.main.fadeOut(500);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('TitleScene'));
  }

  // ── メッセージ送り（オート進行）────────────────────────────
  // steps: [{ text, fn?, delay? }]。fn を実行→textを表示→delay後に次へ。
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
