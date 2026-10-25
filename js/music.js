// A tiny synthesized music-box loop (Web Audio), so there are no audio files or copyright issues.
const PROGRESSION = [
  [261.63, 329.63, 392.0, 523.25], // C
  [220.0, 261.63, 329.63, 440.0],  // Am
  [174.61, 220.0, 261.63, 349.23], // F
  [196.0, 246.94, 293.66, 392.0]   // G
];
const PATTERN = [0, 1, 2, 3, 2, 1, 2, 3];

class MusicBox {
  constructor(tempo = 0.28) {
    this.tempo = tempo;
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
    while (this.next < this.ctx.currentTime + 0.3) {
      const chord = PROGRESSION[Math.floor(this.step / 8) % PROGRESSION.length];
      const f = chord[PATTERN[this.step % 8]];
      this.note(f, this.next, 1.1, 0.45, 'triangle');
      this.note(f * 2, this.next, 0.6, 0.08, 'sine');
      if (this.step % 8 === 0) this.note(chord[0] / 2, this.next, this.tempo * 8, 0.3, 'sine');
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
