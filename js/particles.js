// Canvas particle engine: ambient petals / balloons / sparkles plus confetti bursts and fireworks.
class FX {
  constructor(canvas, cfg) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.cfg = cfg;
    this.items = [];
    this.sparks = [];
    this.t = 0;
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.resize = this.resize.bind(this);
    this.frame = this.frame.bind(this);
    addEventListener('resize', this.resize);
    this.resize();
    const n = Math.round((cfg.count || 40) * (this.reduced ? 0.3 : 1) * Math.min(1, innerWidth / 900 + 0.45));
    for (let i = 0; i < n; i++) this.items.push(this.make(true));
    this.raf = requestAnimationFrame(this.frame);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    removeEventListener('resize', this.resize);
    this.ctx.clearRect(0, 0, this.w, this.h);
  }

  resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    this.w = innerWidth;
    this.h = innerHeight;
    this.canvas.width = this.w * dpr;
    this.canvas.height = this.h * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  pick(a) { return a[(Math.random() * a.length) | 0]; }

  make(initial) {
    const r = Math.random;
    const type = this.pick(this.cfg.types);
    const p = { type, color: this.pick(this.cfg.colors), x: r() * this.w, rot: r() * 6.28, vr: (r() - 0.5) * 0.05, phase: r() * 6.28, sway: 0.5 + r() * 1.5 };
    if (type === 'balloon') {
      p.size = 16 + r() * 14;
      p.vy = 0.4 + r() * 0.7;
      p.y = initial ? r() * this.h : this.h + p.size * 3;
    } else if (type === 'sparkle') {
      p.size = 1.5 + r() * 3;
      p.y = r() * this.h;
      p.speed = 0.6 + r() * 2;
    } else {
      p.size = type === 'confetti' ? 4 + r() * 4 : type === 'marigold' ? 6 + r() * 5 : 6 + r() * 7;
      p.vy = 0.5 + r() * 1.2;
      p.y = initial ? r() * this.h : -20;
    }
    return p;
  }

  burst(x = this.w / 2, y = this.h / 2, n = 140) {
    const colors = this.cfg.colors;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = 3 + Math.random() * 9;
      this.sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 5, g: 0.18, friction: 0.985, life: 1, decay: 0.006 + Math.random() * 0.008, color: this.pick(colors), size: 4 + Math.random() * 5, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, shape: 'confetti' });
    }
  }

  firework() {
    const x = this.w * (0.15 + Math.random() * 0.7), y = this.h * (0.12 + Math.random() * 0.35);
    const color = this.pick(this.cfg.colors);
    for (let i = 0; i < 70; i++) {
      const a = (Math.PI * 2 * i) / 70, s = 1.5 + Math.random() * 3.5;
      this.sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: 0.035, friction: 0.975, life: 1, decay: 0.01 + Math.random() * 0.01, color, size: 2, shape: 'dot' });
    }
  }

  frame() {
    const { ctx, w, h } = this;
    this.t++;
    ctx.clearRect(0, 0, w, h);
    for (const p of this.items) { this.step(p); this.draw(p); }
    if (this.cfg.fireworks && !this.reduced && this.t % 120 === 0) this.firework();
    for (const s of this.sparks) {
      s.vx *= s.friction; s.vy = s.vy * s.friction + s.g;
      s.x += s.vx; s.y += s.vy; s.life -= s.decay;
      if (s.vr) s.rot += s.vr;
      ctx.save();
      ctx.globalAlpha = Math.max(0, s.life);
      ctx.fillStyle = s.color;
      ctx.translate(s.x, s.y);
      if (s.shape === 'dot') {
        ctx.shadowColor = s.color; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(0, 0, s.size, 0, 6.28); ctx.fill();
      } else {
        ctx.rotate(s.rot); ctx.scale(1, Math.cos(s.rot * 2));
        ctx.fillRect(-s.size / 2, -s.size / 4, s.size, s.size / 2);
      }
      ctx.restore();
    }
    this.sparks = this.sparks.filter(s => s.life > 0 && s.y < h + 40);
    this.raf = requestAnimationFrame(this.frame);
  }

  step(p) {
    p.phase += 0.02;
    p.rot += p.vr;
    if (p.type === 'sparkle') return;
    if (p.type === 'balloon') {
      p.y -= p.vy;
      p.x += Math.sin(p.phase) * 0.4;
      if (p.y < -p.size * 4) Object.assign(p, this.make(false));
      return;
    }
    p.y += p.vy;
    p.x += Math.sin(p.phase) * p.sway * 0.5;
    if (p.y > this.h + 20) Object.assign(p, this.make(false));
  }

  draw(p) {
    const c = this.ctx, s = p.size;
    c.save();
    c.translate(p.x, p.y);
    c.fillStyle = p.color;
    switch (p.type) {
      case 'petal':
        c.rotate(p.rot); c.scale(1, Math.abs(Math.cos(p.phase)) * 0.6 + 0.4);
        c.globalAlpha = 0.85;
        c.beginPath(); c.moveTo(0, -s); c.quadraticCurveTo(s, 0, 0, s); c.quadraticCurveTo(-s, 0, 0, -s); c.fill();
        break;
      case 'leaf':
        c.rotate(p.rot); c.globalAlpha = 0.85;
        c.beginPath(); c.moveTo(0, -s * 1.3); c.quadraticCurveTo(s * 0.9, 0, 0, s * 1.3); c.quadraticCurveTo(-s * 0.9, 0, 0, -s * 1.3); c.fill();
        c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 0.8;
        c.beginPath(); c.moveTo(0, -s * 1.2); c.lineTo(0, s * 1.2); c.stroke();
        break;
      case 'marigold':
        c.rotate(p.rot);
        for (let i = 0; i < 10; i++) {
          c.rotate(Math.PI / 5);
          c.beginPath(); c.ellipse(0, -s * 0.6, s * 0.35, s * 0.55, 0, 0, 6.28); c.fill();
        }
        c.fillStyle = 'rgba(160,60,0,.55)';
        c.beginPath(); c.arc(0, 0, s * 0.35, 0, 6.28); c.fill();
        break;
      case 'confetti':
        c.rotate(p.rot); c.scale(1, Math.cos(p.phase * 3));
        c.fillRect(-s, -s / 2, s * 2, s);
        break;
      case 'heart': {
        c.rotate(Math.sin(p.phase) * 0.3);
        c.globalAlpha = 0.85; c.shadowColor = p.color; c.shadowBlur = 10;
        const k = s / 8;
        c.scale(k, k);
        c.beginPath(); c.moveTo(0, 3);
        c.bezierCurveTo(0, 0, -5, -2, -8, 1); c.bezierCurveTo(-11, 5, -4, 9, 0, 13);
        c.bezierCurveTo(4, 9, 11, 5, 8, 1); c.bezierCurveTo(5, -2, 0, 0, 0, 3);
        c.fill();
        break;
      }
      case 'sparkle': {
        c.globalAlpha = (Math.sin(p.phase * p.speed * 2) + 1) / 2;
        c.shadowColor = p.color; c.shadowBlur = 12;
        c.beginPath();
        for (let i = 0; i < 8; i++) {
          const r = i % 2 ? s * 0.35 : s * 2;
          const a = (i * Math.PI) / 4;
          c.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        c.closePath(); c.fill();
        break;
      }
      case 'balloon':
        c.rotate(Math.sin(p.phase) * 0.12);
        c.strokeStyle = 'rgba(80,80,120,.45)'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(0, s * 1.2); c.quadraticCurveTo(s * 0.4, s * 2, 0, s * 3); c.stroke();
        c.beginPath(); c.ellipse(0, 0, s * 0.85, s * 1.1, 0, 0, 6.28); c.fill();
        c.beginPath(); c.moveTo(-s * 0.15, s * 1.25); c.lineTo(s * 0.15, s * 1.25); c.lineTo(0, s * 1.05); c.fill();
        c.fillStyle = 'rgba(255,255,255,.45)';
        c.beginPath(); c.ellipse(-s * 0.3, -s * 0.4, s * 0.18, s * 0.32, -0.5, 0, 6.28); c.fill();
        break;
    }
    c.restore();
  }
}
