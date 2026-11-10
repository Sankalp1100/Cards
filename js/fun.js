// Little moments of joy, shared by the website and the admin:
//  - Fun.burst(x, y): a confetti pop (one short-lived canvas, removed when done)
//  - Fun.buzz(): a tiny vibration on phones that support it
//  - a press-in feel on every button and chip, and a scroll-progress line on long pages
// Everything stays still for people who ask their phone for less motion.
(function () {
  const still = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COLORS = ['#ff3d8b', '#ffc95c', '#8b5cf6', '#22d3ee', '#4ade80', '#ffffff'];

  function burst(x, y, n) {
    if (still()) return;
    if (x == null) { x = innerWidth / 2; y = innerHeight / 2; }
    const c = document.createElement('canvas');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = innerWidth * dpr; c.height = innerHeight * dpr;
    c.setAttribute('aria-hidden', 'true');
    c.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9999';
    document.body.appendChild(c);
    const g = c.getContext('2d'); g.scale(dpr, dpr);
    const bits = Array.from({ length: n || 90 }, () => {
      const a = Math.random() * Math.PI * 2, v = 4 + Math.random() * 9;
      return { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 6, r: Math.random() * Math.PI, vr: (Math.random() - .5) * .4,
        w: 6 + Math.random() * 6, h: 3 + Math.random() * 5, c: COLORS[(Math.random() * COLORS.length) | 0], round: Math.random() < .3 };
    });
    const t0 = performance.now();
    (function frame(now) {
      const t = now - t0;
      g.clearRect(0, 0, innerWidth, innerHeight);
      g.globalAlpha = Math.max(0, 1 - t / 1800);
      for (const b of bits) {
        b.vy += .32; b.vx *= .985; b.vy *= .985; b.x += b.vx; b.y += b.vy; b.r += b.vr;
        g.save(); g.translate(b.x, b.y); g.rotate(b.r); g.fillStyle = b.c;
        if (b.round) { g.beginPath(); g.arc(0, 0, b.h / 1.4, 0, Math.PI * 2); g.fill(); } else g.fillRect(-b.w / 2, -b.h / 2, b.w, b.h * Math.abs(Math.cos(b.r * 2)) + 1);
        g.restore();
      }
      if (t < 1800) requestAnimationFrame(frame); else c.remove();
    })(t0);
  }
  // Pops from the middle of an element (a button that was just used)
  function burstAt(el, n) {
    if (!el || !el.getBoundingClientRect) return burst(null, null, n);
    const r = el.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, n);
  }
  function buzz(ms) { try { if (navigator.vibrate && !still()) navigator.vibrate(ms || 18); } catch (e) { /* not supported */ } }

  // A scroll-progress line along the top (only on pages that scroll a lot)
  function progress() {
    if (document.querySelector('.fun-progress')) return;
    const bar = document.createElement('div');
    bar.className = 'fun-progress'; bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    let queued = false;
    const set = () => { queued = false; const max = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`; };
    addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(set); } }, { passive: true });
    addEventListener('resize', set, { passive: true });
    set();
  }

  window.Fun = { burst, burstAt, buzz, progress };
})();
