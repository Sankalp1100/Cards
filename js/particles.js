// Canvas particle engine: ambient petals / balloons / sparkles plus confetti bursts and fireworks.
// Each shape (with its glow) is drawn once into a small sprite and then stamped every frame:
// drawing shadowBlur glows live for ~100 particles was the main cause of jank on phones.
class FX {
  constructor(canvas, cfg) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.cfg = cfg;
    this.items = [];
    this.sparks = [];
    this.sprites = new Map();
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
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    if (dpr !== this.dpr && this.sprites) this.sprites.clear();
    this.dpr = dpr;
    this.w = innerWidth;
    this.h = innerHeight;
    this.canvas.width = this.w * this.dpr;
    this.canvas.height = this.h * this.dpr;
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
    p.size = Math.max(1, Math.round(p.size * 2) / 2); // half-pixel steps keep the sprite cache small
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

  // Place a sprite at (x, y) with rotation, scale and alpha, in CSS pixels.
  stamp(img, x, y, rot, sx, sy, alpha) {
    const { ctx, dpr } = this, cos = Math.cos(rot), sin = Math.sin(rot);
    ctx.globalAlpha = alpha;
    ctx.setTransform(cos * sx * dpr, sin * sx * dpr, -sin * sy * dpr, cos * sy * dpr, x * dpr, y * dpr);
    ctx.drawImage(img, -img.half, -img.half, img.box, img.box);
  }

  frame() {
    const { ctx, w, h } = this;
    this.t++;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (const p of this.items) {
      this.step(p);
      const pose = this.pose(p);
      this.stamp(this.sprite(p.type, p.color, p.size), p.x, p.y, pose[0], 1, pose[1], pose[2]);
    }
    if (this.cfg.fireworks && !this.reduced && this.t % 120 === 0) this.firework();
    for (const s of this.sparks) {
      s.vx *= s.friction; s.vy = s.vy * s.friction + s.g;
      s.x += s.vx; s.y += s.vy; s.life -= s.decay;
      if (s.vr) s.rot += s.vr;
      const alpha = Math.max(0, s.life);
      if (s.shape === 'dot') {
        this.stamp(this.sprite('dot', s.color, s.size), s.x, s.y, 0, 1, 1, alpha);
      } else {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = s.color;
        const cos = Math.cos(s.rot), sin = Math.sin(s.rot), sy = Math.cos(s.rot * 2), d = this.dpr;
        ctx.setTransform(cos * d, sin * d, -sin * sy * d, cos * sy * d, s.x * d, s.y * d);
        ctx.fillRect(-s.size / 2, -s.size / 4, s.size, s.size / 2);
      }
    }
    ctx.globalAlpha = 1;
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

  // How a particle moves this frame: [rotation, vertical scale, alpha].
  pose(p) {
    switch (p.type) {
      case 'petal': return [p.rot, Math.abs(Math.cos(p.phase)) * 0.6 + 0.4, 0.85];
      case 'leaf': return [p.rot, 1, 0.85];
      case 'marigold': return [p.rot, 1, 1];
      case 'confetti': return [p.rot, Math.cos(p.phase * 3) || 0.01, 1];
      case 'heart': return [Math.sin(p.phase) * 0.3, 1, 0.85];
      case 'sparkle': return [0, 1, (Math.sin(p.phase * p.speed * 2) + 1) / 2];
      case 'balloon': return [Math.sin(p.phase) * 0.12, 1, 1];
    }
    return [0, 1, 1];
  }

  sprite(type, color, s) {
    const id = `${type}|${color}|${s}`;
    let img = this.sprites.get(id);
    if (img) return img;
    const box = Math.ceil(s * 7 + 36), scale = this.dpr;
    img = document.createElement('canvas');
    img.width = img.height = Math.ceil(box * scale);
    img.box = box;
    img.half = box / 2;
    const c = img.getContext('2d');
    c.scale(scale, scale);
    c.translate(box / 2, box / 2);
    c.fillStyle = color;
    this.shape(c, type, s, color);
    this.sprites.set(id, img);
    return img;
  }

  shape(c, type, s, color) {
    switch (type) {
      case 'petal':
        c.beginPath(); c.moveTo(0, -s); c.quadraticCurveTo(s, 0, 0, s); c.quadraticCurveTo(-s, 0, 0, -s); c.fill();
        break;
      case 'leaf':
        c.beginPath(); c.moveTo(0, -s * 1.3); c.quadraticCurveTo(s * 0.9, 0, 0, s * 1.3); c.quadraticCurveTo(-s * 0.9, 0, 0, -s * 1.3); c.fill();
        c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 0.8;
        c.beginPath(); c.moveTo(0, -s * 1.2); c.lineTo(0, s * 1.2); c.stroke();
        break;
      case 'marigold':
        for (let i = 0; i < 10; i++) {
          c.rotate(Math.PI / 5);
          c.beginPath(); c.ellipse(0, -s * 0.6, s * 0.35, s * 0.55, 0, 0, 6.28); c.fill();
        }
        c.fillStyle = 'rgba(160,60,0,.55)';
        c.beginPath(); c.arc(0, 0, s * 0.35, 0, 6.28); c.fill();
        break;
      case 'confetti':
        c.fillRect(-s, -s / 2, s * 2, s);
        break;
      case 'heart': {
        c.shadowColor = color; c.shadowBlur = 10;
        const k = s / 8;
        c.scale(k, k);
        c.beginPath(); c.moveTo(0, 3);
        c.bezierCurveTo(0, 0, -5, -2, -8, 1); c.bezierCurveTo(-11, 5, -4, 9, 0, 13);
        c.bezierCurveTo(4, 9, 11, 5, 8, 1); c.bezierCurveTo(5, -2, 0, 0, 0, 3);
        c.fill();
        break;
      }
      case 'sparkle':
        c.shadowColor = color; c.shadowBlur = 12;
        c.beginPath();
        for (let i = 0; i < 8; i++) {
          const r = i % 2 ? s * 0.35 : s * 2, a = (i * Math.PI) / 4;
          c.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        c.closePath(); c.fill();
        break;
      case 'dot':
        c.shadowColor = color; c.shadowBlur = 8;
        c.beginPath(); c.arc(0, 0, s, 0, 6.28); c.fill();
        break;
      case 'balloon':
        c.strokeStyle = 'rgba(80,80,120,.45)'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(0, s * 1.2); c.quadraticCurveTo(s * 0.4, s * 2, 0, s * 3); c.stroke();
        c.beginPath(); c.ellipse(0, 0, s * 0.85, s * 1.1, 0, 0, 6.28); c.fill();
        c.beginPath(); c.moveTo(-s * 0.15, s * 1.25); c.lineTo(s * 0.15, s * 1.25); c.lineTo(0, s * 1.05); c.fill();
        c.fillStyle = 'rgba(255,255,255,.45)';
        c.beginPath(); c.ellipse(-s * 0.3, -s * 0.4, s * 0.18, s * 0.32, -0.5, 0, 6.28); c.fill();
        break;
    }
  }
}
