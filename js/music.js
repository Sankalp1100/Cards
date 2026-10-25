// A tiny synthesized music box (Web Audio), so there are no audio files or copyright issues.
// Every design has its own song: a chord progression, a melody pattern, an instrument and a key (js/themes.js).

// Chords as semitones above the key's root note.
const CHORDS = {
  I: [0, 4, 7, 12], ii: [2, 5, 9, 14], iii: [4, 7, 11, 16], IV: [5, 9, 12, 17], V: [7, 11, 14, 19], vi: [9, 12, 16, 21],
  bVII: [10, 14, 17, 22], i: [0, 3, 7, 12], iv: [5, 8, 12, 17], v: [7, 10, 14, 19], bVI: [8, 12, 15, 20], bIII: [3, 7, 10, 15]
};
const PROGRESSIONS = [
  ['I', 'vi', 'IV', 'V'],    // the classic (design #001)
  ['I', 'V', 'vi', 'IV'],    // pop
  ['vi', 'IV', 'I', 'V'],    // romantic
  ['I', 'IV', 'vi', 'V'],    // sweet
  ['i', 'bVI', 'bIII', 'bVII'], // grand, minor
  ['i', 'iv', 'v', 'i'],     // folk, minor
  ['I', 'iii', 'IV', 'V'],   // dreamy
  ['I', 'bVII', 'IV', 'I']   // festive
];
// Which chord note plays on each of the 8 beats (-1 = rest).
const PATTERNS = [
  [0, 1, 2, 3, 2, 1, 2, 3],
  [0, 2, 1, 3, 0, 2, 1, 3],
  [3, 2, 1, 0, 1, 2, 3, 2],
  [0, 1, 2, 1, 3, 1, 2, 1],
  [0, -1, 2, 1, 3, -1, 2, 1],
  [0, 2, 3, 2, 1, 2, 3, -1]
];
// Instruments: [wave, length of a note, volume, shimmer an octave up, wave of the shimmer]
const VOICES = {
  musicbox: ['triangle', 1.1, 0.45, 0.08, 'sine'],
  bells: ['sine', 1.8, 0.5, 0.14, 'sine'],
  harp: ['triangle', 0.7, 0.5, 0.05, 'triangle'],
  pluck: ['square', 0.35, 0.16, 0.04, 'triangle']
};
const ROOT = 261.63; // C4

class MusicBox {
  constructor(tempo = 0.28, song = {}) {
    this.tempo = tempo;
    this.song = song;
    this.on = false;
  }

  start() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.16;
      this.master.connect(this.ctx.destination);
    }
    this.ctx.resume();
    this.on = true;
    this.step = 0;
    this.next = this.ctx.currentTime + 0.1;
    clearInterval(this.timer);
    this.timer = setInterval(() => this.schedule(), 80);
    return true;
  }

  stop() {
    this.on = false;
    clearInterval(this.timer);
  }

  toggle() {
    if (this.on) this.stop(); else this.start();
    return this.on;
  }

  schedule() {
    const s = this.song || {};
    const prog = PROGRESSIONS[s.prog] || PROGRESSIONS[0], pattern = PATTERNS[s.pattern] || PATTERNS[0];
    const [wave, len, vol, sparkle, sparkleWave] = VOICES[s.voice] || VOICES.musicbox;
    const root = ROOT * 2 ** ((s.key || 0) / 12);
    const hz = semis => root * 2 ** (semis / 12);
    while (this.next < this.ctx.currentTime + 0.3) {
      const chord = CHORDS[prog[Math.floor(this.step / 8) % prog.length]];
      const n = pattern[this.step % 8];
      if (n >= 0) {
        const f = hz(chord[n]);
        this.note(f, this.next, len, vol, wave);
        this.note(f * 2, this.next, len * 0.55, sparkle, sparkleWave);
      }
      if (this.step % 8 === 0) this.note(hz(chord[0]) / 2, this.next, this.tempo * 8, 0.3, 'sine');
      this.next += this.tempo;
      this.step++;
    }
  }

  note(freq, t, dur, vol, type) {
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + dur + 0.05);
  }
}

if (typeof module !== 'undefined') module.exports = { MusicBox, CHORDS, PROGRESSIONS, PATTERNS, VOICES };
