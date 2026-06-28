// Web Audio API による効果音＋BGM合成。音源ファイル不要。
// 使い方：import { audio } from '../audio/AudioManager.js';
//         audio.playBGM('cafe') / audio.playSE('cursor') / audio.stopBGM()

// ── 音名→周波数 ───────────────────────────────────────────────
const N = {
  E3:165, G3:196, A3:220, B3:247,
  C4:262, D4:294, E4:330, F4:349, G4:392, A4:440, B4:494,
  C5:523, D5:587, E5:659, G5:784, A5:880, B5:988, C6:1047,
};

// ── BGMパターン（[周波数, 拍数] / 0=休符）────────────────────
const BGM = {
  // 拠点＆フィールド：Gメジャー・アルペジオ・穏やか
  cafe: {
    bpm: 96, wave: 'triangle', vol: 0.13,
    notes: [
      [N.G4,0.5],[N.B4,0.5],[N.D5,0.5],[N.B4,0.5],  // Gmaj
      [N.C5,0.5],[N.E5,0.5],[N.G5,0.5],[N.E5,0.5],  // Cmaj
      [N.A4,0.5],[N.C5,0.5],[N.E5,0.5],[N.C5,0.5],  // Am
      [N.D5,0.5],[N.B4,0.5],[N.G4,0.5],[0,  0.5],   // G
    ],
  },
  // 戦闘：Aマイナー・スクエア波・テンポ速め
  battle: {
    bpm: 144, wave: 'square', vol: 0.09,
    notes: [
      [N.A3,0.25],[N.A3,0.25],[N.C4,0.25],[0,   0.25],
      [N.A3,0.25],[0,   0.25],[N.E4,0.25],[0,   0.25],
      [N.G3,0.25],[N.G3,0.25],[N.B3,0.25],[0,   0.25],
      [N.G3,0.25],[0,   0.25],[N.D4,0.25],[0,   0.25],
      [N.A3,0.25],[N.A3,0.25],[N.C4,0.25],[0,   0.25],
      [N.A3,0.25],[0,   0.25],[N.F4,0.25],[0,   0.25],
      [N.E4,0.25],[0,   0.25],[N.E3,0.25],[0,   0.25],
      [N.A3,0.5 ],[0,   0.5 ],
    ],
  },
};

class AudioManager {
  constructor() {
    this._ctx = null;
    this._bgmTimer = null;
    this._currentBgm = null;
    this._bgmNodes = [];

    // タブが裏側に回ったら止め、戻ったら再開
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (this._ctx) this._ctx.suspend();
        clearTimeout(this._bgmTimer);
        this._bgmTimer = null;
      } else if (this._currentBgm) {
        if (this._ctx) this._ctx.resume();
        this._bgmNodes = [];
        this._scheduleBGM(this._currentBgm);
      }
    });
  }

  get ctx() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this._ctx.state === 'suspended') this._ctx.resume();
    return this._ctx;
  }

  // 正弦波系のトーン（SE用）
  _osc(freq, startTime, dur, wave = 'square', vol = 0.25) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.type = wave;
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, startTime);
    g.gain.exponentialRampToValueAtTime(0.001, Math.max(startTime + 0.002, startTime + dur));
    o.start(startTime);
    o.stop(startTime + dur + 0.01);
  }

  // ホワイトノイズバースト（打撃音用）
  _noise(dur = 0.12, vol = 0.35) {
    const ctx = this.ctx;
    const len = Math.ceil(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.value = 350;
    filt.Q.value = 0.8;
    const g = ctx.createGain();
    src.connect(filt);
    filt.connect(g);
    g.connect(ctx.destination);
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    src.start();
    src.stop(ctx.currentTime + dur + 0.01);
  }

  // ── SE ────────────────────────────────────────────────────
  playSE(name) {
    const t = this.ctx.currentTime;
    switch (name) {
      case 'cursor':
        this._osc(880, t, 0.05, 'square', 0.18); break;
      case 'confirm':
        this._osc(523, t,        0.07, 'square', 0.24);
        this._osc(784, t + 0.08, 0.12, 'square', 0.24); break;
      case 'cancel':
        this._osc(330, t,        0.07, 'square', 0.20);
        this._osc(262, t + 0.08, 0.10, 'square', 0.20); break;
      case 'hit':
        this._noise(0.12, 0.38); break;
      case 'heal':
        this._osc(659, t,        0.09, 'triangle', 0.28);
        this._osc(784, t + 0.10, 0.15, 'triangle', 0.28); break;
      case 'levelUp':
        [523, 659, 784, 1047].forEach((f, i) =>
          this._osc(f, t + i * 0.10, 0.13, 'square', 0.26));
        break;
      case 'victory':
        [523, 659, 784, 1047, 1319].forEach((f, i) =>
          this._osc(f, t + i * 0.09, 0.15, 'square', 0.26));
        break;
      case 'gameOver':
        [440, 330, 220].forEach((f, i) =>
          this._osc(f, t + i * 0.22, 0.28, 'sawtooth', 0.20));
        break;
    }
  }

  // ── BGM ───────────────────────────────────────────────────
  playBGM(name) {
    if (this._currentBgm === name) return;
    this.stopBGM();
    this._currentBgm = name;
    this._scheduleBGM(name);
  }

  stopBGM() {
    this._currentBgm = null;
    clearTimeout(this._bgmTimer);
    this._bgmTimer = null;
    this._bgmNodes.forEach((n) => { try { n.stop(); } catch (_) {} });
    this._bgmNodes = [];
  }

  _scheduleBGM(name) {
    const p = BGM[name];
    if (!p || this._currentBgm !== name) return;
    const ctx = this.ctx;
    const beatDur = 60 / p.bpm;
    let t = ctx.currentTime;
    let totalDur = 0;

    for (const [freq, beats] of p.notes) {
      const dur = beats * beatDur;
      if (freq > 0) {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = p.wave;
        o.frequency.value = freq;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(p.vol, t + 0.015);
        g.gain.setValueAtTime(p.vol, t + dur - 0.04);
        g.gain.linearRampToValueAtTime(0, t + dur);
        o.start(t);
        o.stop(t + dur + 0.01);
        this._bgmNodes.push(o);
      }
      t += dur;
      totalDur += dur;
    }

    // ループ末尾 80ms 前に次をスケジュール
    this._bgmTimer = setTimeout(() => {
      this._bgmNodes = [];
      this._scheduleBGM(name);
    }, Math.max(0, (totalDur - 0.08) * 1000));
  }
}

export const audio = new AudioManager();
