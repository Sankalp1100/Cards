// Background music for the story videos (Web Audio, made on the fly: no audio files, no copyright issues).
// Softer and fuller than the card's music box: a warm string pad, a melody on bansuri flute, piano or bells,
// a gentle bass, a room echo, and a fade in and out. Four moods: royal, romantic, festive, calm.
const TUNES = {
  // Bansuri over a tanpura drone, a slow minor-ish raag feel
  royal: { label: 'Royal', bpm: 66, key: -3, chords: [[0, 3, 7], [5, 8, 12], [7, 10, 14], [3, 7, 10]], lead: 'flute', drone: true,
    melody: [7, -1, 10, 12, 10, 7, 5, -1, 3, 5, 7, -1, 5, 3, 0, -1] },
  // Piano over strings, major and tender
  romantic: { label: 'Romantic', bpm: 72, key: 2, chords: [[0, 4, 7], [-3, 0, 4], [5, 9, 12], [7, 11, 14]], lead: 'piano', pad: true,
    melody: [12, 11, 7, 4, 9, 7, 4, -1, 9, 12, 16, 14, 11, 7, 11, -1] },
  // Bells with a soft dholak-like beat
  festive: { label: 'Festive', bpm: 96, key: 0, chords: [[0, 4, 7], [5, 9, 12], [7, 11, 14], [0, 4, 7]], lead: 'bell', pad: true, beat: true,
    melody: [12, 14, 16, 19, 16, 14, 12, -1, 14, 16, 19, 21, 19, 16, 14, -1] },
  // Slow piano, almost a lullaby
  calm: { label: 'Calm', bpm: 58, key: 5, chords: [[0, 4, 7], [-5, -1, 2], [-3, 0, 4], [-7, -3, 0]], lead: 'piano', pad: true,
    melody: [7, -1, 4, -1, 2, -1, 4, 7, 9, -1, 7, -1, 4, -1, 2, -1] }
};

class Tune {
  static LEVEL = 1.15;
  constructor(name) {
    this.def = TUNES[name] || TUNES.romantic;
    this.on = false;
  }

  // Builds the sound graph; returns false where Web Audio is missing.
  start() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    if (!this.ctx) {
      const c = this.ctx = new AC();
      this.master = c.createGain();
      this.master.gain.value = 0;
      // A gentle limiter at the end, so the music is clear on a phone speaker and never distorts
      const lim = c.createDynamicsCompressor();
      lim.threshold.value = -10; lim.knee.value = 8; lim.ratio.value = 6; lim.attack.value = .005; lim.release.value = .25;
      this.master.connect(lim).connect(c.destination);
      // Room echo: a soft, two-and-a-half second decaying reverb, mixed in under the dry sound
      const len = Math.round(c.sampleRate * 2.5), ir = c.createBuffer(2, len, c.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = ir.getChannelData(ch);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
      }
      this.verb = c.createConvolver(); this.verb.buffer = ir;
      const wet = c.createGain(); wet.gain.value = .32;
      this.verb.connect(wet).connect(this.master);
      this.dry = c.createGain(); this.dry.gain.value = .8;
      this.dry.connect(this.master);
      this.dry.connect(this.verb);
    }
    this.ctx.resume();
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(Tune.LEVEL, now + 1.6); // fade in
    this.on = true;
    this.step = 0;
    this.next = now + .12;
    if (this.def.drone) this.droneOn(now);
    clearInterval(this.timer);
    this.timer = setInterval(() => this.schedule(), 90);
    return true;
  }

  // Fades out over `secs` seconds, starting `after` seconds from now (the end of a video).
  fadeOut(after = 0, secs = 2.5) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + after;
    this.master.gain.setValueAtTime(Tune.LEVEL, t);
    this.master.gain.linearRampToValueAtTime(0, t + secs);
  }

  stop() {
    this.on = false;
    clearInterval(this.timer);
    if (this.ctx) {
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(this.master.gain.value, now);
      this.master.gain.linearRampToValueAtTime(0, now + .3);
    }
    (this.drones || []).forEach(o => { try { o.stop(this.ctx.currentTime + .4); } catch (e) { /* already stopped */ } });
    this.drones = [];
  }

  close() {
    this.stop();
    if (this.ctx) setTimeout(() => this.ctx.close(), 500);
  }

  hz(semis) { return 261.63 * 2 ** ((this.def.key + semis) / 12); }

  schedule() {
    const d = this.def, beat = 60 / d.bpm / 2; // eighth notes
    while (this.on && this.next < this.ctx.currentTime + .4) {
      const t = this.next, bar = Math.floor(this.step / 8), chord = d.chords[bar % d.chords.length];
      if (this.step % 8 === 0) {
        if (d.pad) chord.forEach(n => this.pad(this.hz(n - 12), t, beat * 8));
        this.bass(this.hz(chord[0] - 24), t, beat * 8);
      }
      const m = d.melody[this.step % d.melody.length];
      if (m >= 0) this[d.lead](this.hz(m), t, beat * (d.lead === 'flute' ? 2 : 3));
      if (d.beat) this.drum(t, this.step % 8);
      this.next += beat;
      this.step++;
    }
  }

  env(g, t, attack, peak, release) {
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(.0001, t + attack + release);
  }
  osc(type, f, t, end, out, detune = 0) {
    const o = this.ctx.createOscillator();
    o.type = type; o.frequency.value = f; o.detune.value = detune;
    o.connect(out); o.start(t); o.stop(end);
    return o;
  }

  // Warm strings: three detuned saws, softened by a low-pass filter, slow to swell
  pad(f, t, len) {
    const c = this.ctx, g = c.createGain(), lp = c.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 900;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(.035, t + len * .35);
    g.gain.linearRampToValueAtTime(.0001, t + len * 1.15);
    lp.connect(g).connect(this.dry);
    [-7, 0, 7].forEach(dt => this.osc('sawtooth', f, t, t + len * 1.2, lp, dt));
  }
  bass(f, t, len) {
    const g = this.ctx.createGain();
    this.env(g, t, .05, .16, len * .9);
    g.connect(this.dry);
    this.osc('sine', f, t, t + len, g);
  }
  // Piano-like: a bright strike that rings and fades
  piano(f, t) {
    const c = this.ctx, g = c.createGain(), lp = c.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.setValueAtTime(3200, t); lp.frequency.exponentialRampToValueAtTime(700, t + 1.5);
    this.env(g, t, .006, .13, 1.8);
    lp.connect(g).connect(this.dry);
    this.osc('triangle', f, t, t + 2, lp);
    this.osc('sine', f * 2, t, t + 1, lp);
  }
  // Bells: a pure tone with a slightly out-of-tune partial, long and shimmering
  bell(f, t) {
    const g = this.ctx.createGain(), g2 = this.ctx.createGain();
    this.env(g, t, .004, .09, 2.4); this.env(g2, t, .004, .03, 1.2);
    g.connect(this.dry); g2.connect(this.dry);
    this.osc('sine', f * 2, t, t + 2.5, g);
    this.osc('sine', f * 2 * 2.76, t, t + 1.3, g2);
  }
  // Bansuri-like flute: a soft sine with a little breath and a gentle vibrato that grows in
  flute(f, t, len) {
    const c = this.ctx, g = c.createGain(), vib = c.createOscillator(), vg = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(.11, t + .12);
    g.gain.setValueAtTime(.11, t + len * .8);
    g.gain.linearRampToValueAtTime(.0001, t + len * 1.3);
    g.connect(this.dry);
    const o = this.osc('sine', f, t, t + len * 1.35, g);
    vib.frequency.value = 5.2; vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(f * .012, t + len * .6);
    vib.connect(vg).connect(o.frequency); vib.start(t); vib.stop(t + len * 1.35);
    // breath
    const n = c.createBufferSource(), buf = c.createBuffer(1, c.sampleRate * .3, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const bp = c.createBiquadFilter(), ng = c.createGain();
    bp.type = 'bandpass'; bp.frequency.value = f * 2; bp.Q.value = 2;
    this.env(ng, t, .02, .02, .25);
    n.buffer = buf; n.connect(bp).connect(ng).connect(this.dry); n.start(t);
  }
  // Tanpura-like drone on the root and fifth, under the whole tune
  droneOn(t) {
    const c = this.ctx, g = c.createGain(), lp = c.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 700;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05, t + 3);
    lp.connect(g).connect(this.dry);
    this.drones = [this.hz(-24), this.hz(-17), this.hz(-12)].map((f, i) => {
      const o = c.createOscillator(); o.type = i === 1 ? 'triangle' : 'sawtooth'; o.frequency.value = f; o.detune.value = (i - 1) * 4;
      o.connect(lp); o.start(t); return o;
    });
  }
  // A soft dholak-like beat: low thump on 1 and 5, light tap on 3 and 7
  drum(t, i) {
    if (i % 2) return;
    const c = this.ctx, g = c.createGain(), o = c.createOscillator(), low = i % 4 === 0;
    o.frequency.setValueAtTime(low ? 140 : 320, t);
    o.frequency.exponentialRampToValueAtTime(low ? 60 : 180, t + .15);
    this.env(g, t, .004, low ? .22 : .08, .22);
    o.connect(g).connect(this.dry); o.start(t); o.stop(t + .3);
  }
}

if (typeof module !== 'undefined') module.exports = { Tune, TUNES };
