// Background music for the story videos (Web Audio, made on the fly: no audio files, no copyright issues).
// Twelve tunes, each with its own instrument and feel: a warm string pad or a tanpura drone underneath, a gentle
// bass, a melody (bansuri, shehnai, sitar, santoor, harmonium, piano, bells, music box or harp), a beat for the
// lively ones (soft, dholak, tabla, dhol or garba), a room echo, and a fade in and out.
// Notes are semitones above the tune's key (C4 + key); -1 is a rest. Eight steps (eighth notes) per bar.
const TUNES = {
  royal: { label: 'Royal Flute', bpm: 66, key: -3, chords: [[0, 3, 7], [5, 8, 12], [7, 10, 14], [3, 7, 10]], lead: 'flute', drone: true,
    melody: [7, -1, 10, 12, 10, 7, 5, -1, 3, 5, 7, -1, 5, 3, 0, -1] },
  shehnai: { label: 'Shehnai Mangal', bpm: 60, key: -2, chords: [[0, 4, 7], [5, 9, 12], [7, 11, 14], [0, 4, 7]], lead: 'shehnai', drone: true, beat: 'soft',
    melody: [7, 9, 11, 12, -1, 11, 9, 7, 9, 7, 5, 4, 5, 4, 2, 0] },
  sitar: { label: 'Sitar Raag', bpm: 70, key: -5, chords: [[0, 3, 7], [-2, 2, 5], [-4, 0, 3], [-5, -1, 2]], lead: 'sitar', drone: true, beat: 'tabla',
    melody: [12, 10, 12, 15, 12, 10, 8, 7, 8, 10, 7, 5, 3, 5, 7, -1] },
  santoor: { label: 'Santoor Morning', bpm: 76, key: 2, chords: [[0, 4, 7], [-3, 0, 4], [-7, -3, 0], [-5, -1, 2]], lead: 'santoor', pad: true, arp: true,
    melody: [16, 14, 12, 14, 16, 19, 16, -1, 14, 12, 11, 12, 14, 11, 7, -1] },
  sufi: { label: 'Sufi Evening', bpm: 62, key: -4, chords: [[0, 3, 7], [5, 8, 12], [3, 7, 10], [7, 10, 14]], lead: 'harmonium', drone: true, beat: 'tabla',
    melody: [7, 8, 10, 8, 7, -1, 5, 3, 5, 7, 8, 7, 5, 3, 2, 0] },
  romantic: { label: 'Romantic Piano', bpm: 72, key: 2, chords: [[0, 4, 7], [-3, 0, 4], [5, 9, 12], [7, 11, 14]], lead: 'piano', pad: true,
    melody: [12, 11, 7, 4, 9, 7, 4, -1, 9, 12, 16, 14, 11, 7, 11, -1] },
  cinematic: { label: 'Grand Cinematic', bpm: 64, key: 0, chords: [[-3, 0, 4], [-7, -3, 0], [0, 4, 7], [-5, -1, 2]], lead: 'piano', pad: true, strings: true, bells: true,
    melody: [9, -1, 12, -1, 16, 14, 12, -1, 11, -1, 12, 14, 11, -1, 7, -1] },
  baraat: { label: 'Baraat Dhol', bpm: 104, key: 0, chords: [[0, 4, 7], [5, 9, 12], [7, 11, 14], [0, 4, 7]], lead: 'shehnai', beat: 'dhol',
    melody: [12, 12, 14, 12, 11, 12, 14, 16, 14, 12, 11, 9, 11, 12, 7, -1] },
  festive: { label: 'Festive Bells', bpm: 96, key: 0, chords: [[0, 4, 7], [5, 9, 12], [7, 11, 14], [0, 4, 7]], lead: 'bell', pad: true, beat: 'soft',
    melody: [12, 14, 16, 19, 16, 14, 12, -1, 14, 16, 19, 21, 19, 16, 14, -1] },
  garba: { label: 'Garba Night', bpm: 112, key: 3, chords: [[0, 4, 7], [-2, 2, 5], [-4, 0, 3], [-2, 2, 5]], lead: 'santoor', beat: 'garba',
    melody: [12, 14, 15, 14, 12, 10, 12, -1, 14, 12, 10, 8, 10, 12, 7, -1] },
  lullaby: { label: 'Lullaby', bpm: 56, key: 7, chords: [[0, 4, 7], [-3, 0, 4], [-7, -3, 0], [-5, -1, 2]], lead: 'musicbox', pad: true, arp: true,
    melody: [12, -1, 16, -1, 19, -1, 16, -1, 14, -1, 17, -1, 16, -1, 12, -1] },
  calm: { label: 'Calm Piano', bpm: 58, key: 5, chords: [[0, 4, 7], [-5, -1, 2], [-3, 0, 4], [-7, -3, 0]], lead: 'piano', pad: true,
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
      // One short noise buffer, shared by the breath, shakers and drum slaps
      this.noise = c.createBuffer(1, c.sampleRate * .5, c.sampleRate);
      const nd = this.noise.getChannelData(0);
      for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
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
      const t = this.next, i = this.step % 8, bar = Math.floor(this.step / 8), chord = d.chords[bar % d.chords.length];
      if (i === 0) {
        if (d.pad) chord.forEach(n => this.pad(this.hz(n - 12), t, beat * 8));
        if (d.strings) chord.forEach(n => this.strings(this.hz(n), t, beat * 8));
        this.bass(this.hz(chord[0] - 24), t, beat * 8);
        if (d.bells && bar % 2 === 0) this.bell(this.hz(chord[2] + 12), t + beat * 4);
      }
      // A rippling arpeggio of the chord under the melody (santoor, music box)
      if (d.arp) { const n = chord[[0, 1, 2, 1][i % 4]] + 12; this[d.lead === 'musicbox' ? 'musicbox' : 'santoor'](this.hz(n), t, beat, .35); }
      const m = d.melody[this.step % d.melody.length];
      if (m >= 0) this[d.lead](this.hz(m), t, beat * ({ flute: 2, shehnai: 2, harmonium: 2.2 }[d.lead] || 3));
      if (d.beat) this.drum(d.beat, t, i, beat);
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
  hiss(t, len, freq, q, peak, out = this.dry) {
    const c = this.ctx, n = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain();
    bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = q;
    this.env(g, t, .004, peak, len);
    n.buffer = this.noise; n.connect(bp).connect(g).connect(out); n.start(t); n.stop(t + len + .05);
  }

  // ---- beds ----
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
  // A higher, brighter string section for the cinematic swell
  strings(f, t, len) {
    const c = this.ctx, g = c.createGain(), lp = c.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 2200;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.022, t + len * .6); g.gain.linearRampToValueAtTime(.0001, t + len * 1.1);
    lp.connect(g).connect(this.dry);
    [-10, 10].forEach(dt => this.osc('sawtooth', f, t, t + len * 1.15, lp, dt));
  }
  bass(f, t, len) {
    const g = this.ctx.createGain();
    this.env(g, t, .05, .16, len * .9);
    g.connect(this.dry);
    this.osc('sine', f, t, t + len, g);
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

  // ---- melody instruments ----
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
  // Music box: tiny, high and glassy
  musicbox(f, t, len, vol = 1) {
    const g = this.ctx.createGain();
    this.env(g, t, .003, .07 * vol, 1.1);
    g.connect(this.dry);
    this.osc('sine', f * 2, t, t + 1.2, g);
    this.osc('triangle', f * 4, t, t + .3, g);
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
    this.hiss(t, .25, f * 2, 2, .02);
  }
  // Shehnai: a reedy double-reed tone (a saw through a nasal band-pass), with a slide up into each note and vibrato
  shehnai(f, t, len) {
    const c = this.ctx, g = c.createGain(), bp = c.createBiquadFilter(), bp2 = c.createBiquadFilter(), vib = c.createOscillator(), vg = c.createGain();
    bp.type = 'bandpass'; bp.frequency.value = 1400; bp.Q.value = 1.2;
    bp2.type = 'peaking'; bp2.frequency.value = 2800; bp2.gain.value = 6;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.07, t + .06); g.gain.setValueAtTime(.07, t + len * .85); g.gain.linearRampToValueAtTime(.0001, t + len * 1.25);
    bp.connect(bp2).connect(g).connect(this.dry);
    const o = this.osc('sawtooth', f * 2, t, t + len * 1.3, bp);
    o.frequency.setValueAtTime(f * 2 * .97, t); o.frequency.linearRampToValueAtTime(f * 2, t + .08);
    vib.frequency.value = 6; vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(f * .03, t + len * .5);
    vib.connect(vg).connect(o.frequency); vib.start(t); vib.stop(t + len * 1.3);
  }
  // Sitar: a bright pluck with a little bend (meend) and a buzzing shimmer
  sitar(f, t) {
    const c = this.ctx, g = c.createGain(), hp = c.createBiquadFilter(), g2 = c.createGain();
    hp.type = 'highpass'; hp.frequency.value = 300;
    this.env(g, t, .003, .09, 1.6); this.env(g2, t, .003, .025, .9);
    hp.connect(g).connect(this.dry); g2.connect(this.dry);
    const o = this.osc('sawtooth', f, t, t + 1.7, hp);
    o.frequency.setValueAtTime(f, t); o.frequency.linearRampToValueAtTime(f * 1.012, t + .25); o.frequency.linearRampToValueAtTime(f, t + .6);
    this.osc('square', f * 2, t, t + 1, g2, 6);
  }
  // Santoor: hammered strings, two slightly detuned, a quick double strike
  santoor(f, t, len = .4, vol = 1) {
    for (const [dt, k] of [[0, 1], [.06, .45]]) {
      const g = this.ctx.createGain();
      this.env(g, t + dt, .002, .07 * vol * k, 1.2);
      g.connect(this.dry);
      this.osc('triangle', f * 2, t + dt, t + dt + 1.3, g, -5);
      this.osc('triangle', f * 2, t + dt, t + dt + 1.3, g, 5);
    }
  }
  // Harmonium: reedy and warm, slow to speak
  harmonium(f, t, len) {
    const c = this.ctx, g = c.createGain(), lp = c.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 1800;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05, t + .1); g.gain.setValueAtTime(.05, t + len * .9); g.gain.linearRampToValueAtTime(.0001, t + len * 1.2);
    lp.connect(g).connect(this.dry);
    this.osc('square', f, t, t + len * 1.25, lp, -4);
    this.osc('sawtooth', f, t, t + len * 1.25, lp, 4);
    this.osc('square', f * 2, t, t + len * 1.25, lp);
  }

  // ---- beats ----
  drum(kind, t, i, beat) {
    const c = this.ctx;
    const thump = (f0, f1, vol, len = .22) => {
      const g = c.createGain(), o = c.createOscillator();
      o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + len * .7);
      this.env(g, t, .004, vol, len); o.connect(g).connect(this.dry); o.start(t); o.stop(t + len + .05);
    };
    if (kind === 'soft') {
      // a soft dholak: low on 1 and 5, light on 3 and 7
      if (i % 2) return;
      thump(i % 4 === 0 ? 140 : 320, i % 4 === 0 ? 60 : 180, i % 4 === 0 ? .22 : .08);
    } else if (kind === 'tabla') {
      // dha . ti na . dha ti na: a ringing pitched "dayan" and a bending "bayan"
      const pat = ['dha', '', 'ti', 'na', 'dha', '', 'ti', 'na'][i];
      if (pat === 'dha') { thump(110, 70, .2, .35); thump(520, 500, .07, .4); }
      if (pat === 'ti') this.hiss(t, .06, 3000, 3, .05);
      if (pat === 'na') thump(560, 540, .08, .3);
    } else if (kind === 'dhol') {
      // Baraat dhol: big bass on 1 and 4, sharp slaps between
      if (i === 0 || i === 3 || i === 6) thump(110, 45, .32, .3);
      if (i === 2 || i === 5 || i === 7) { thump(420, 260, .1, .12); this.hiss(t, .08, 2200, 1.5, .06); }
    } else if (kind === 'garba') {
      // Garba: a tali-like clap in threes over a steady dhol
      if (i % 4 === 0) thump(120, 55, .26, .28);
      if (i % 2 === 1) this.hiss(t, .07, 1800, 1, .09);
      if (i === 2 || i === 6) this.hiss(t, .12, 6000, .7, .03);
    }
  }
}

// Your own music (an MP3, M4A or WAV picked in the admin Video Studio), played like a tune: it fades in, loops if
// the video is longer, and fades out with the closing scene. `buffer` is a decoded AudioBuffer.
class FileTune {
  constructor(buffer) { this.buffer = buffer; this.on = false; }
  start() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC || !this.buffer) return false;
    const c = this.ctx = new AC();
    this.master = c.createGain();
    this.master.gain.value = 0;
    this.master.connect(c.destination);
    this.src = c.createBufferSource();
    this.src.buffer = this.buffer;
    this.src.loop = true;
    this.src.connect(this.master);
    c.resume();
    const now = c.currentTime;
    this.src.start(now);
    this.master.gain.linearRampToValueAtTime(1, now + .8);
    this.on = true;
    return true;
  }
  fadeOut(after = 0, secs = 2.5) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + after;
    this.master.gain.setValueAtTime(1, t);
    this.master.gain.linearRampToValueAtTime(0, t + secs);
  }
  stop() {
    this.on = false;
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(0, now + .3);
    try { this.src.stop(now + .35); } catch (e) { /* already stopped */ }
  }
  close() {
    this.stop();
    if (this.ctx) setTimeout(() => this.ctx.close(), 500);
  }
}

if (typeof module !== 'undefined') module.exports = { Tune, TUNES, FileTune };
