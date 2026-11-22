// Sheesh Mahal: a palace of mirrors at night. Gold dust gathers into a turning mandala and Shri Ganesh; carved jaali
// doors swing open; then the camera flies through a gold arch into a new mirrored hall for every scene: the names,
// the invitation on an ivory panel, one hall per function in its own colours (fireworks, chandeliers, a starry
// night), the venue with a map pin, the children's request, and thank you with the QR code. Every line of words is
// measured and shrunk to fit its panel, so long names or addresses never spill out. The bride's side's card: the
// first name (host1) always comes first.
Cinema.register((K => {
  const { W, H, TAU, rng, clamp, ease, ease3, lerp, glow, art, clean, days, parents, cutout, petals, sparks, burst, HI, MONTHS } = K;
  const kOf = P => Math.min(1.25, Math.max(.5, P.k));
  const DEV = /[ऀ-ॿ]/;
  const GOLD = [[0, '#fff1bf'], [.4, '#f0c24e'], [.7, '#c58b22'], [1, '#8a5a10']];
  const MAROON = '#6b0f1e', INK = '#3e1a12', INK2 = '#7a4a32';
  const L = K.palette('palace');

  // ---------- library pictures ----------
  const LIB = {};
  function lib(id) {
    if (typeof Image === 'undefined' || (typeof location !== 'undefined' && location.protocol === 'file:')) return null;
    let im = LIB[id];
    if (!im) { im = new Image(); im.src = `img/couples/cut/${id}.png`; LIB[id] = im; }
    return im.complete && im.naturalWidth ? im : null;
  }
  const COUPLE = { names: 'wedding-06', baraat: 'wedding-05', feast: 'wedding-07', vidai: 'wedding-09', other: 'wedding-11' };
  ['wedding-06', 'wedding-05', 'wedding-07', 'wedding-09', 'wedding-11', 'kid-01', 'kid-02'].forEach(lib);
  const coupleFor = (P, key) => lib(COUPLE[key] || COUPLE.other) || K.coupleImage(P);

  // ---------- words: measured once, shrunk until they fit ----------
  const fitCache = new Map();
  function fit(c, text, fam, max, maxW, lines = 1, weight = '') {
    const key = `${text}|${fam}|${max}|${maxW}|${lines}|${weight}`;
    if (fitCache.has(key)) return fitCache.get(key);
    let out;
    for (let z = max; z >= 16; z -= 2) {
      c.font = `${weight} ${z}px "${fam}"`;
      const words = String(text).split(/\s+/), L2 = [];
      let cur = '';
      for (const w of words) { const t = cur ? `${cur} ${w}` : w; if (c.measureText(t).width <= maxW || !cur) cur = t; else { L2.push(cur); cur = w; } }
      if (cur) L2.push(cur);
      if (L2.length <= lines && L2.every(l => c.measureText(l).width <= maxW)) { out = { z, lines: L2, font: c.font }; break; }
    }
    if (!out) { c.font = `${weight} 16px "${fam}"`; out = { z: 16, lines: [text], font: c.font }; }
    if (fitCache.size > 400) fitCache.clear();
    fitCache.set(key, out);
    return out;
  }
  // draws fitted words centred at x from top y; returns the y below them. o: { col, gold, a, lh, shadow }
  function say(c, text, x, y, fam, max, maxW, o = {}) {
    if (!text) return y;
    const F = fit(c, text, fam, max, maxW, o.lines || 1, o.weight || ''), lh = F.z * (o.lh || 1.32);
    c.save(); c.globalAlpha *= o.a == null ? 1 : o.a; c.font = F.font; c.textAlign = 'center'; c.textBaseline = 'middle';
    F.lines.forEach((ln, i) => {
      const yy = y + lh * (i + .5);
      if (o.gold) {
        const g = c.createLinearGradient(0, yy - F.z * .6, 0, yy + F.z * .5); GOLD.forEach(([q, col]) => g.addColorStop(q, col));
        c.fillStyle = 'rgba(30,6,4,.55)'; c.fillText(ln, x + 2, yy + 4);
        c.fillStyle = g; c.fillText(ln, x, yy);
      } else {
        if (o.shadow) { c.fillStyle = o.shadow; c.fillText(ln, x + 1.5, yy + 3); }
        c.fillStyle = o.col || INK; c.fillText(ln, x, yy);
      }
    });
    c.restore();
    return y + lh * F.lines.length;
  }
  // a gold rule with a diamond (or a word) in the middle
  function rule(c, x, y, w, a = 1, word = '', hi = false, col = '#c9952e') {
    c.save(); c.globalAlpha *= a; c.strokeStyle = col; c.lineWidth = 2;
    const gap = word ? 70 : 16;
    c.beginPath(); c.moveTo(x - w / 2, y); c.lineTo(x - gap, y); c.moveTo(x + gap, y); c.lineTo(x + w / 2, y); c.stroke();
    if (word) { c.fillStyle = col; c.font = `${hi ? '' : 'italic '}40px "${hi ? 'Tiro Devanagari Hindi' : 'Cormorant Garamond'}"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(word, x, y + 2); }
    else { c.fillStyle = col; c.beginPath(); c.moveTo(x, y - 9); c.lineTo(x + 9, y); c.lineTo(x, y + 9); c.lineTo(x - 9, y); c.closePath(); c.fill(); }
    for (const sx of [-1, 1]) { c.beginPath(); c.arc(x + sx * w / 2, y, 4, 0, TAU); c.fill(); }
    c.restore();
  }

  // ---------- painted once ----------
  const scallopArch = (c, x0, x1, top, bottom, lobes = 7) => {
    const cx = (x0 + x1) / 2, r = (x1 - x0) / 2, sh = top + r;
    c.moveTo(x0, bottom); c.lineTo(x0, sh);
    for (let i = 0; i < lobes; i++) {
      const a0 = Math.PI + i / lobes * Math.PI, a1 = Math.PI + (i + 1) / lobes * Math.PI, am = (a0 + a1) / 2;
      const px = cx + Math.cos(a1) * r, py = sh + Math.sin(a1) * r * 1.08, qx = cx + Math.cos(am) * r * 1.1, qy = sh + Math.sin(am) * r * 1.16;
      c.quadraticCurveTo(qx, qy, px, py);
    }
    c.lineTo(x1, bottom);
  };
  // a mirrored hall: a big mosaic arch, mirror pillars, jhoomars and a polished floor, in the scene's colours
  function hall(k, id, top, bot, glowCol) {
    return art(`sm-hall-${id}`, W, H, k, c => {
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(.62, bot); g.addColorStop(1, '#0a0204');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      const R = rng(id.length * 97 + 11);
      // mosaic of small mirror tiles over the whole wall, brightest inside the arch
      for (let y = 0; y < 1560; y += 22) for (let x = (y / 22) % 2 ? 11 : 0; x < W; x += 22) {
        const inArch = x > 150 && x < 930 && y > 300, a = (inArch ? .08 : .045) + R() * (inArch ? .16 : .08);
        c.fillStyle = R() < .18 ? `rgba(255,226,160,${a.toFixed(3)})` : `rgba(255,255,255,${(a * .6).toFixed(3)})`;
        c.beginPath(); c.moveTo(x, y - 9); c.lineTo(x + 9, y); c.lineTo(x, y + 9); c.lineTo(x - 9, y); c.closePath(); c.fill();
      }
      // light behind the arch
      const gl = c.createRadialGradient(540, 900, 40, 540, 900, 760); gl.addColorStop(0, glowCol); gl.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = gl; c.fillRect(0, 0, W, H);
      // the arch, in gold, twice
      const gg = c.createLinearGradient(0, 200, 0, 1560); GOLD.forEach(([q, col]) => gg.addColorStop(q, col));
      for (const [d, lw] of [[0, 10], [26, 3]]) { c.beginPath(); scallopArch(c, 150 + d, 930 - d, 230 + d, 1560); c.strokeStyle = gg; c.lineWidth = lw; c.stroke(); }
      // pillars
      for (const px of [40, W - 110]) {
        const pg = c.createLinearGradient(px, 0, px + 70, 0); pg.addColorStop(0, 'rgba(255,230,170,.18)'); pg.addColorStop(.5, 'rgba(255,240,200,.42)'); pg.addColorStop(1, 'rgba(255,230,170,.12)');
        c.fillStyle = pg; c.fillRect(px, 380, 70, 1180);
        c.strokeStyle = gg; c.lineWidth = 3; c.strokeRect(px, 380, 70, 1180);
        for (let y = 420; y < 1540; y += 60) { c.fillStyle = 'rgba(255,240,200,.5)'; c.beginPath(); c.arc(px + 35, y, 7, 0, TAU); c.fill(); }
      }
      // floor: polished stone with the light pooling in it
      const fg = c.createLinearGradient(0, 1560, 0, H); fg.addColorStop(0, 'rgba(255,220,160,.20)'); fg.addColorStop(1, 'rgba(0,0,0,.5)');
      c.fillStyle = fg; c.fillRect(0, 1560, W, H - 1560);
      c.strokeStyle = gg; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 1560); c.lineTo(W, 1560); c.stroke();
      c.globalAlpha = .25; for (let i = -6; i <= 6; i++) { c.beginPath(); c.moveTo(540 + i * 60, 1560); c.lineTo(540 + i * 260, H); c.strokeStyle = '#e8c46a'; c.lineWidth = 1.5; c.stroke(); } c.globalAlpha = 1;
      // jhoomars
      for (const [jx, s] of [[200, .8], [540, 1.05], [880, .8]]) {
        c.strokeStyle = gg; c.lineWidth = 2; c.beginPath(); c.moveTo(jx, 0); c.lineTo(jx, 90 * s); c.stroke();
        for (let r = 0; r < 3; r++) for (let i = 0; i < 9 - r * 2; i++) {
          const ox = (i - (8 - r * 2) / 2) * 16 * s, oy = 100 * s + r * 34 * s;
          c.beginPath(); c.moveTo(jx, 90 * s); c.quadraticCurveTo(jx + ox * .6, oy - 20 * s, jx + ox, oy); c.stroke();
          c.fillStyle = 'rgba(255,248,225,.85)'; c.beginPath(); c.moveTo(jx + ox, oy); c.lineTo(jx + ox + 5 * s, oy + 12 * s); c.lineTo(jx + ox, oy + 24 * s); c.lineTo(jx + ox - 5 * s, oy + 12 * s); c.closePath(); c.fill();
        }
        const jg = c.createRadialGradient(jx, 150 * s, 2, jx, 150 * s, 130 * s); jg.addColorStop(0, 'rgba(255,230,160,.45)'); jg.addColorStop(1, 'rgba(255,230,160,0)');
        c.fillStyle = jg; c.fillRect(jx - 140 * s, 0, 280 * s, 300 * s);
      }
    });
  }
  // a gold turning mandala (transparent, 1000 × 1000)
  const mandalaArt = k => art('sm-mandala', 1000, 1000, k, c => {
    c.translate(500, 500);
    const gg = c.createRadialGradient(0, 0, 40, 0, 0, 500); GOLD.forEach(([q, col]) => gg.addColorStop(q, col));
    c.strokeStyle = gg; c.fillStyle = 'rgba(240,194,78,.10)'; c.lineWidth = 3;
    [[90, 8, 70], [170, 12, 90], [260, 16, 110], [360, 24, 120], [455, 32, 70]].forEach(([r, n, len]) => {
      for (let i = 0; i < n; i++) {
        c.save(); c.rotate(i / n * TAU);
        c.beginPath(); c.moveTo(0, -r + len * .4); c.quadraticCurveTo(len * .34, -r - len * .15, 0, -r - len * .6); c.quadraticCurveTo(-len * .34, -r - len * .15, 0, -r + len * .4); c.fill(); c.stroke();
        c.beginPath(); c.arc(0, -r - len * .72, 5, 0, TAU); c.fillStyle = '#f6d77a'; c.fill(); c.fillStyle = 'rgba(240,194,78,.10)';
        c.restore();
      }
      c.beginPath(); c.arc(0, 0, r - len * .45, 0, TAU); c.stroke();
    });
  });
  // a carved jaali door (maroon with a gold lattice and mirror dots), w × h
  const doorArt = k => art('sm-door', 540, H, k, c => {
    const g = c.createLinearGradient(0, 0, 540, 0); g.addColorStop(0, '#3a0610'); g.addColorStop(.5, '#6b0f1e'); g.addColorStop(1, '#2a040b');
    c.fillStyle = g; c.fillRect(0, 0, 540, H);
    const gg = c.createLinearGradient(0, 0, 0, H); GOLD.forEach(([q, col]) => gg.addColorStop(q, col));
    c.strokeStyle = gg; c.lineWidth = 10; c.strokeRect(30, 30, 480, H - 60); c.lineWidth = 3; c.strokeRect(56, 56, 428, H - 112);
    c.save(); c.beginPath(); c.rect(70, 70, 400, H - 140); c.clip();
    c.lineWidth = 3;
    for (let y = 70; y < H; y += 80) for (let x = 70; x < 480; x += 80) {
      c.beginPath(); c.moveTo(x + 40, y); c.lineTo(x + 80, y + 40); c.lineTo(x + 40, y + 80); c.lineTo(x, y + 40); c.closePath(); c.stroke();
      c.beginPath(); c.arc(x + 40, y + 40, 14, 0, TAU); c.stroke();
      c.fillStyle = 'rgba(255,250,230,.55)'; c.beginPath(); c.arc(x + 40, y + 40, 5, 0, TAU); c.fill();
    }
    c.restore();
    c.fillStyle = gg; c.beginPath(); c.arc(500, H / 2, 22, 0, TAU); c.fill();
  });
  // an ivory panel with a scalloped top and a double gold border, w × h
  function panelArt(k, w, h) {
    return art(`sm-panel-${w}x${h}`, w + 40, h + 40, k, c => {
      c.translate(20, 20);
      const shape = () => { c.beginPath(); scallopArch(c, 0, w, 0, h, 9); c.closePath(); };
      c.save(); c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 30; c.shadowOffsetY = 12; shape();
      const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#fffaf0'); g.addColorStop(1, '#f6e7cc'); c.fillStyle = g; c.fill(); c.restore();
      c.save(); shape(); c.clip();
      c.globalAlpha = .07; c.translate(w / 2, h * .55);
      for (let i = 0; i < 24; i++) { c.rotate(TAU / 24); c.beginPath(); c.ellipse(0, -180, 26, 90, 0, 0, TAU); c.strokeStyle = '#8a5a10'; c.lineWidth = 3; c.stroke(); }
      c.restore();
      const gg = c.createLinearGradient(0, 0, 0, h); GOLD.forEach(([q, col]) => gg.addColorStop(q, col));
      shape(); c.strokeStyle = gg; c.lineWidth = 9; c.stroke();
      c.save(); c.translate(w / 2, h / 2); c.scale((w - 36) / w, (h - 36) / h); c.translate(-w / 2, -h / 2); shape(); c.strokeStyle = 'rgba(160,110,30,.7)'; c.lineWidth = 3; c.stroke(); c.restore();
    });
  }
  // a gold arch frame over the whole screen (the camera flies through its opening)
  const archFrameArt = k => art('sm-archframe', W, H, k, c => {
    c.beginPath(); c.rect(0, 0, W, H); scallopArch(c, 110, 970, 170, H + 10, 7); c.closePath();
    const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#4a0915'); g.addColorStop(.5, '#7a1426'); g.addColorStop(1, '#2a040b');
    c.fillStyle = g; c.fill('evenodd');
    const gg = c.createLinearGradient(0, 0, 0, H); GOLD.forEach(([q, col]) => gg.addColorStop(q, col));
    c.beginPath(); scallopArch(c, 110, 970, 170, H + 10, 7); c.strokeStyle = gg; c.lineWidth = 16; c.stroke();
    c.beginPath(); scallopArch(c, 80, 1000, 140, H + 10, 7); c.lineWidth = 4; c.stroke();
    const R = rng(5);
    for (let i = 0; i < 260; i++) {
      const x = R() * W, y = R() * H;
      if (x > 80 && x < 1000 && y > 140 + Math.max(0, 430 - Math.abs(x - 540)) * 0) { if (y > 600 || (x > 200 && x < 880)) continue; }
      c.fillStyle = `rgba(255,236,180,${(.25 + R() * .5).toFixed(2)})`; c.beginPath(); c.arc(x, y, 2 + R() * 4, 0, TAU); c.fill();
    }
  });

  // ---------- a card page with life: unfolds, marigold strings, twinkling corners ----------
  function cardFx(c, k, pw, ph, px, py, rise, t) {
    const u = .55 + .45 * rise;
    c.translate(0, py); c.scale(1, u); c.translate(0, -py);
    c.drawImage(panelArt(k, pw, ph), px - 20, py - 20, pw + 40, ph + 40);
    // marigold strings hanging in front of the arch, swaying
    for (const [sx, ph0] of [[px + 70, 0], [px + pw - 70, 1.7]]) {
      const len = pw * .36, sw = Math.sin(t * 1.6 + ph0) * 10;
      for (let i = 0; i < 15; i++) {
        const q = i / 14, x = sx + sw * q * q, y = py - 120 + q * (len + 120);
        c.fillStyle = i % 3 === 2 ? '#fff2d0' : i % 2 ? '#ffb400' : '#ff7a00';
        c.beginPath(); c.arc(x, y, i % 3 === 2 ? 8 : 12, 0, TAU); c.fill();
        c.fillStyle = 'rgba(120,40,0,.25)'; c.beginPath(); c.arc(x + 3, y + 3, 4, 0, TAU); c.fill();
      }
      const bx = sx + sw, by = py + len + 12;
      c.fillStyle = '#d9a640'; c.beginPath(); c.moveTo(bx - 14, by + 22); c.quadraticCurveTo(bx, by - 18, bx + 14, by + 22); c.closePath(); c.fill();
      c.fillStyle = '#8a5a10'; c.beginPath(); c.arc(bx, by + 24, 4, 0, TAU); c.fill();
    }
    // corners twinkling
    for (const [cx, cy, ph1] of [[px + 14, py + pw / 2 + 10, 0], [px + pw - 14, py + pw / 2 + 10, 1.3], [px + 14, py + ph - 14, 2.1], [px + pw - 14, py + ph - 14, 3.2]]) {
      const a = (Math.sin(t * 2.6 + ph1) + 1) / 2, r = 6 + 16 * a;
      c.save(); c.globalAlpha *= .4 + .6 * a; c.fillStyle = '#fff6d8';
      c.beginPath(); c.moveTo(cx, cy - r); c.lineTo(cx + r * .2, cy - r * .2); c.lineTo(cx + r, cy); c.lineTo(cx + r * .2, cy + r * .2); c.lineTo(cx, cy + r); c.lineTo(cx - r * .2, cy + r * .2); c.lineTo(cx - r, cy); c.lineTo(cx - r * .2, cy - r * .2); c.closePath(); c.fill();
      c.restore();
    }
  }

  // ---------- moving light ----------
  function twinkles(c, t, n, seed, a = 1) {
    const R = rng(seed);
    c.save();
    for (let i = 0; i < n; i++) {
      const x = 60 + R() * 960, y = 120 + R() * 1400, ph = R() * TAU, sp = 1.4 + R() * 2, s = (Math.sin(t * sp + ph) + 1) / 2, r = 3 + 11 * s * s;
      if (s < .35) continue;
      c.globalAlpha = a * s;
      c.fillStyle = '#fff6dc';
      c.beginPath(); c.moveTo(x, y - r); c.lineTo(x + r * .22, y - r * .22); c.lineTo(x + r, y); c.lineTo(x + r * .22, y + r * .22); c.lineTo(x, y + r); c.lineTo(x - r * .22, y + r * .22); c.lineTo(x - r, y); c.lineTo(x - r * .22, y - r * .22); c.closePath(); c.fill();
    }
    c.restore();
  }
  function sweep(c, t, period = 5.5) {
    const u = (t % period) / 1.6;
    if (u >= 1) return;
    const x = -300 + u * (W + 600), g = c.createLinearGradient(x - 160, 0, x + 160, 300);
    g.addColorStop(0, 'rgba(255,245,220,0)'); g.addColorStop(.5, 'rgba(255,245,220,.10)'); g.addColorStop(1, 'rgba(255,245,220,0)');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
  }
  const dust = (c, t, seed, col = '255,220,140') => {
    const R = rng(seed);
    c.save();
    for (let i = 0; i < 46; i++) {
      const x = R() * W, sp = 20 + R() * 40, y = (R() * H - t * sp) % H, yy = y < 0 ? y + H : y, a = .25 + .5 * Math.abs(Math.sin(t * (.8 + R()) + i));
      c.fillStyle = `rgba(${col},${a.toFixed(2)})`; c.beginPath(); c.arc(x + Math.sin(t + i) * 10, yy, 1.5 + R() * 3, 0, TAU); c.fill();
    }
    c.restore();
  };
  function fireworks(c, t, seed) {
    const R = rng(seed), cols = ['#ffd36b', '#ff8fb1', '#9fd8ff', '#fff3c4', '#ffb35c'];
    for (let i = 0; i < 6; i++) {
      const per = 2.2 + R() * 1.2, off = R() * per, x = 160 + R() * 760, y = 160 + R() * 380, col = cols[i % cols.length];
      const p = ((t + off) % per) / 1.5;
      if (p < 1) burst(c, x, y, p, col, 26, 150 + R() * 70);
    }
  }

  // ---------- staging: fly through an arch into each hall, and push in at the end ----------
  function stage(c, s, pt, t, P, draw, o = {}) {
    const k = kOf(P), inT = 1.1, outT = .5, fin = ease3(clamp(pt / inT)), out = s.last ? 0 : ease3(clamp((pt - (s.d - outT)) / outT));
    const z = lerp(1.18, 1, fin) * lerp(1, 1.35, out);
    c.save(); c.translate(W / 2, H * .5); c.scale(z, z); c.translate(-W / 2, -H * .5);
    draw(k);
    c.restore();
    if (fin < 1 && !o.noArch) {
      const az = lerp(1, 4.2, fin);
      c.save(); c.globalAlpha = 1 - ease(clamp((fin - .55) / .45)); c.translate(W / 2, H * .62); c.scale(az, az); c.translate(-W / 2, -H * .62);
      c.drawImage(archFrameArt(k), 0, 0, W, H); c.restore();
    }
    if (out > 0) { c.fillStyle = `rgba(255,236,190,${(out * .5).toFixed(2)})`; c.fillRect(0, 0, W, H); }
    if (pt < .25 && !o.noArch) { c.fillStyle = `rgba(255,236,190,${((1 - pt / .25) * .5).toFixed(2)})`; c.fillRect(0, 0, W, H); }
  }
  const fadeIn = (pt, at, d = .6) => ease(clamp((pt - at) / d));

  // ---------- a printed card's own lines, word for word ----------
  // kinds: shloka, small, body, name, head, accent, en, enhead, light, gold; rule; sang (a rule with a word)
  const KIND = {
    shloka: ['Tiro Devanagari Hindi', 40, '#9a5b16', '', 2], small: ['Tiro Devanagari Hindi', 42, INK2, '', 2], body: ['Tiro Devanagari Hindi', 48, INK, '', 3],
    name: ['Amita', 120, MAROON, '700', 1], head: ['Amita', 80, MAROON, '700', 2], accent: ['Tiro Devanagari Hindi', 54, '#9a5b16', '', 2],
    en: ['Gilda Display', 44, INK, '', 3], enhead: ['Cinzel', 66, MAROON, '700', 2], light: ['Tiro Devanagari Hindi', 44, '#f6e3b8', '', 2], gold: ['Amita', 80, '#f0c24e', '700', 2]
  };
  function pageLayout(c, s, key, lines, zone, maxW) {
    s.__lay = s.__lay || {};
    if (s.__lay[key]) return s.__lay[key];
    const [top, bot] = zone;
    let f = 1.3, rows;
    for (let n = 0; n < 30; n++) {
      rows = []; let h = 0;
      for (const ln of lines) {
        if (ln.k === 'rule' || ln.k === 'sang') { const hh = (ln.k === 'sang' ? 70 : 44) * Math.max(.7, f); rows.push({ ln, h: hh }); h += hh; continue; }
        const [fam, z, , w, nl] = KIND[ln.k] || KIND.body, size = Math.max(18, Math.round(ln.z ? ln.z * Math.min(f, 1) : z * f));
        const F = fit(c, ln.s, fam, size, maxW, ln.lines || nl, w), lh = F.z * (/^(name|head|gold)$/.test(ln.k) ? 1.22 : 1.38), gap = (ln.gap == null ? 12 : ln.gap) * f;
        rows.push({ ln, F, lh, h: lh * F.lines.length + gap }); h += lh * F.lines.length + gap;
      }
      if (h <= bot - top) { s.__lay[key] = { rows, y0: top + (bot - top - h) / 2 }; return s.__lay[key]; }
      f *= .94;
    }
    s.__lay[key] = { rows, y0: top };
    return s.__lay[key];
  }
  function drawPage(c, s, pt, key, lines, zone, maxW, start = .6, stag = .14) {
    const lay = pageLayout(c, s, key, lines, zone, maxW);
    let y = lay.y0;
    lay.rows.forEach((r, i) => {
      const a = fadeIn(pt, start + i * stag, .55), dy = (1 - a) * 18;
      if (r.ln.k === 'rule') rule(c, 540, y + r.h / 2, 300, a, '', false, r.ln.col || '#a8761c');
      else if (r.ln.k === 'sang') rule(c, 540, y + r.h / 2, 380, a, r.ln.s || 'संग', true, r.ln.col || '#a8761c');
      else {
        const col = (KIND[r.ln.k] || KIND.body)[2], big = /^(name|head|gold|enhead)$/.test(r.ln.k), at = start + i * stag;
        const wr = big ? ease3(clamp((pt - at) / .9)) : 1;
        c.save(); c.globalAlpha *= big ? Math.min(1, a * 2) : a; c.font = r.F.font; c.textAlign = 'center'; c.textBaseline = 'middle';
        if (big) { const ww = Math.max(...r.F.lines.map(l => c.measureText(l).width)); c.beginPath(); c.rect(540 - ww / 2 - 20, y - 40, (ww + 40) * wr, r.h + 80); c.clip(); }
        r.F.lines.forEach((t2, j) => {
          const yy = y + dy + r.lh * (j + .5);
          if (r.ln.k === 'gold') { const g = c.createLinearGradient(0, yy - r.F.z * .6, 0, yy + r.F.z * .5); GOLD.forEach(([q, cc]) => g.addColorStop(q, cc)); c.fillStyle = 'rgba(30,6,4,.55)'; c.fillText(t2, 542, yy + 4); c.fillStyle = g; }
          else { if (/^(name|head|enhead)$/.test(r.ln.k)) { c.fillStyle = 'rgba(160,110,30,.32)'; c.fillText(t2, 541.5, yy + 3); } c.fillStyle = r.ln.col || col; }
          c.fillText(t2, 540, yy);
          if (big && wr >= 1) {
            const w2 = c.measureText(t2).width, sh = ((pt - at - .9) % 3.2) / 1.1;
            if (sh >= 0 && sh < 1) { const sx = 540 - w2 / 2 - 100 + sh * (w2 + 200), sg = c.createLinearGradient(sx - 60, yy - 30, sx + 60, yy + 30);
              sg.addColorStop(0, 'rgba(255,248,220,0)'); sg.addColorStop(.5, 'rgba(255,248,220,.8)'); sg.addColorStop(1, 'rgba(255,248,220,0)'); c.fillStyle = sg; c.fillText(t2, 540, yy); }
          }
        });
        c.restore();
        if (big) { const bp = (pt - at - .8) / .7; if (bp > 0 && bp < 1) { c.font = r.F.font; const ww = Math.max(...r.F.lines.map(l => c.measureText(l).width)); burst(c, 540 + ww / 2, y + r.h / 2, bp, '#f6d77a', 14, 90); } }
      }
      y += r.h;
    });
  }
  // a full ivory page in a hall (a card page): s.lines, s.hall (theme id), s.ganesh (Shri Ganesh at its top)
  function pageShot(c, s, pt, t, P) {
    const th = THEMES.find(x => x.id === s.hall) || { id: 'names', top: '#4a0a16', bot: '#24040c', glow: 'rgba(255,190,110,.40)' };
    stage(c, s, pt, t, P, k => {
      c.drawImage(hall(k, th.id, th.top, th.bot, th.glow), 0, 0, W, H);
      twinkles(c, t, 26, 9 + th.id.length);
      const pw = 880, ph = 1520, px = 100, py = 190, rise = ease3(clamp((pt - .3) / 1));
      c.save(); c.globalAlpha = rise; c.translate(0, (1 - rise) * 80);
      cardFx(c, k, pw, ph, px, py, rise, t);
      let top = py + 250;
      const img = s.ganesh && K.ganeshaImage(P);
      if (img) { const h = 150, w = h * img.naturalWidth / img.naturalHeight; c.drawImage(img, 540 - w / 2, py + 110, w, h); top = py + 290; }
      drawPage(c, s, pt, 'p', s.lines, [top, py + ph - 70], 740);
      c.restore();
      dust(c, t, 13 + th.id.length);
    });
  }

  // ---------- the shots ----------
  function ganeshShot(c, s, pt, t, P) {
    const k = kOf(P), hi = P.opt.lang === 'hi';
    const g = c.createRadialGradient(540, 860, 40, 540, 900, 1200); g.addColorStop(0, '#5a0c1a'); g.addColorStop(1, '#12020a');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    // gold dust gathering to the centre
    const gather = ease3(clamp(pt / 1.8)), R = rng(41);
    c.save();
    for (let i = 0; i < 160; i++) {
      const a0 = R() * TAU, r0 = 500 + R() * 700, r = lerp(r0, 60 + R() * 380, gather), a = a0 + gather * 1.4;
      c.fillStyle = `rgba(255,${200 + Math.floor(R() * 50)},120,${(.35 + .5 * R()).toFixed(2)})`;
      c.beginPath(); c.arc(540 + Math.cos(a) * r, 860 + Math.sin(a) * r * 1.1, 1.5 + R() * 3, 0, TAU); c.fill();
    }
    c.restore();
    const ma = fadeIn(pt, .9, 1.2), ms = lerp(.6, 1, ease3(clamp((pt - .9) / 1.6)));
    c.save(); c.globalAlpha = ma; c.translate(540, 860); c.rotate(t * .12); c.scale(ms, ms); c.drawImage(mandalaArt(k), -500, -500, 1000, 1000); c.restore();
    c.save(); c.globalAlpha = ma * .5; c.translate(540, 860); c.rotate(-t * .2); c.scale(ms * .62, ms * .62); c.drawImage(mandalaArt(k), -500, -500, 1000, 1000); c.restore();
    glow(c, 540, 860, 420 * ma, 'rgba(255,200,110,.35)');
    const img = K.ganeshaImage(P), ga = fadeIn(pt, 1.5, 1), gy = lerp(80, 0, ease3(clamp((pt - 1.5) / 1.4)));
    if (img && ga > 0) {
      const h = 620, w = h * img.naturalWidth / img.naturalHeight;
      c.save(); c.globalAlpha = ga; c.drawImage(img, 540 - w / 2, 860 - h / 2 + gy + Math.sin(t * 1.1) * 6, w, h); c.restore();
    }
    let y = 230;
    y = say(c, hi ? '॥ श्री गणेशाय नमः ॥' : '॥ Shri Ganeshaya Namah ॥', 540, y, hi ? 'Amita' : 'Cinzel', 76, 900, { gold: true, a: fadeIn(pt, 2.2), weight: '700' });
    if (s.exact) {
      drawPage(c, s, pt, 'g', s.exact.map(x => ({ k: 'light', ...x })), [1230, 1560], 940, 2.8, .4);
    for (let i = 0; i < 5; i++) { const a = fadeIn(pt, 1.8 + i * .25, .4); if (a > 0) { c.save(); c.globalAlpha = a; K.diya(c, 220 + i * 160, 1700, 44, t); c.restore(); } }
      petals(c, t, 28, ['#ffb347', '#ffd166', '#e84a5f', '#fff3e0'], 9, 1);
      if (pt > s.d - .6) { c.fillStyle = `rgba(20,2,6,${((pt - (s.d - .6)) / .6).toFixed(2)})`; c.fillRect(0, 0, W, H); }
      return;
    }
    const l1 = hi ? 'वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।' : 'O Lord Ganesha of the curved trunk and mighty form,', l2 = hi ? 'निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥' : 'remove every obstacle from all our endeavours, always.';
    say(c, l1, 540, 1260, 'Tiro Devanagari Hindi', 44, 900, { col: '#f6e3b8', a: fadeIn(pt, 2.8) });
    say(c, l2, 540, 1330, 'Tiro Devanagari Hindi', 44, 900, { col: '#f6e3b8', a: fadeIn(pt, 3.2) });
    petals(c, t, 28, ['#ffb347', '#ffd166', '#e84a5f', '#fff3e0'], 9, 1);
    if (pt > s.d - .6) { c.fillStyle = `rgba(20,2,6,${((pt - (s.d - .6)) / .6).toFixed(2)})`; c.fillRect(0, 0, W, H); }
  }

  function doorsShot(c, s, pt, t, P) {
    const k = kOf(P), open = ease3(clamp((pt - .7) / 1.9));
    c.drawImage(hall(k, 'names', '#4a0a16', '#24040c', 'rgba(255,190,110,.40)'), 0, 0, W, H);
    glow(c, 540, 900, 300 + open * 600, `rgba(255,230,170,${(.2 + open * .5).toFixed(2)})`);
    twinkles(c, t, 30, 3, open);
    const D = doorArt(k);
    for (const side of [-1, 1]) {
      const sx = Math.cos(open * Math.PI * .47), w = 540 * sx;
      c.save();
      if (side < 0) { c.translate(0, 0); c.drawImage(D, 0, 0, w, H); }
      else { c.translate(W, 0); c.scale(-1, 1); c.drawImage(D, 0, 0, w, H); }
      c.fillStyle = `rgba(0,0,0,${(open * .45).toFixed(2)})`; c.fillRect(0, 0, w, H);
      c.restore();
    }
    const fl = clamp((pt - (s.d - .5)) / .5);
    if (fl > 0) { c.fillStyle = `rgba(255,236,190,${(fl * .85).toFixed(2)})`; c.fillRect(0, 0, W, H); }
  }

  function namesShot(c, s, pt, t, P) {
    const hi = P.opt.lang === 'hi', card = P.card, X = s.exact || {}, n1 = X.n1 || clean(card.host1), n2 = X.n2 || clean(card.host2);
    const D = days(card, hi), first = D[0] && D[0].date, dl = X.date || (first ? (hi ? K.hiDay(first) : K.dayText(first)) : K.dateRange(card, hi));
    stage(c, s, pt, t, P, k => {
      c.drawImage(hall(k, 'names', '#4a0a16', '#24040c', 'rgba(255,190,110,.40)'), 0, 0, W, H);
      sweep(c, t); twinkles(c, t, 34, 7);
      const img = coupleFor(P, 'names'), ca = fadeIn(pt, 1.6, .9);
      if (img && ca > 0) { c.save(); c.globalAlpha = ca; cutout(c, img, 540, 1850 + (1 - ca) * 60, 760, 'full', L, t); c.restore(); }
      let y = 300;
      y = say(c, X.title || (hi ? 'शुभ विवाह' : 'Wedding Invitation'), 540, y, hi ? 'Amita' : 'Cinzel', 92, 560, { gold: true, a: fadeIn(pt, .6), weight: '700' });
      rule(c, 540, y + 14, 440, fadeIn(pt, .8));
      y += 40;
      const nf = DEV.test(n1 + n2) ? 'Amita' : 'Great Vibes';
      y = say(c, n1, 540, y, nf, 130, 600, { gold: true, a: fadeIn(pt, 1.0), weight: DEV.test(n1) ? '700' : '' });
      if (n2) {
        rule(c, 540, y + 18, 380, fadeIn(pt, 1.3), X.sang || (hi ? 'संग' : '&'), hi);
        y = say(c, n2, 540, y + 44, nf, 130, 600, { gold: true, a: fadeIn(pt, 1.5), weight: DEV.test(n2) ? '700' : '' });
      }
      if (dl) {
        const a = fadeIn(pt, 2.0), F = fit(c, dl, 'Tiro Devanagari Hindi', 44, 700), w = Math.min(860, c.measureText(dl).width + 120);
        c.save(); c.globalAlpha = a; c.font = F.font;
        const bw = c.measureText(dl).width + 110, by = y + 20;
        c.fillStyle = MAROON; c.beginPath(); c.moveTo(540 - bw / 2 - 30, by); c.lineTo(540 + bw / 2 + 30, by); c.lineTo(540 + bw / 2, by + 36); c.lineTo(540 + bw / 2 + 30, by + 72); c.lineTo(540 - bw / 2 - 30, by + 72); c.lineTo(540 - bw / 2, by + 36); c.closePath(); c.fill();
        c.strokeStyle = '#e8c46a'; c.lineWidth = 3; c.stroke();
        c.restore();
        say(c, dl, 540, y + 20 + 36 - F.z * .66, 'Tiro Devanagari Hindi', 44, 700, { col: '#ffe9b0', a });
        void w;
      }
      dust(c, t, 11);
    });
  }

  function inviteShot(c, s, pt, t, P) {
    const hi = P.opt.lang === 'hi', card = P.card, n1 = clean(card.host1), n2 = clean(card.host2), [p1, p2] = parents(card, hi ? 'hi' : 'en');
    stage(c, s, pt, t, P, k => {
      c.drawImage(hall(k, 'names', '#4a0a16', '#24040c', 'rgba(255,190,110,.40)'), 0, 0, W, H);
      twinkles(c, t, 26, 9);
      const pw = 880, ph = 1500, px = 100, py = 200, rise = ease3(clamp((pt - .3) / 1));
      c.save(); c.globalAlpha = rise; c.translate(0, (1 - rise) * 80);
      cardFx(c, k, pw, ph, px, py, rise, t);
      const img = K.ganeshaImage(P);
      if (img) { const h = 150, w = h * img.naturalWidth / img.naturalHeight; c.drawImage(img, 540 - w / 2, py + 120, w, h); }
      const mw = 700, nf = DEV.test(n1 + n2) ? 'Amita' : 'Great Vibes';
      let y = py + 360;
      y = say(c, clean(card.title) || (hi ? 'परमपिता परमात्मा की असीम अनुकम्पा से' : 'With the blessings of the Almighty'), 540, y, 'Tiro Devanagari Hindi', 44, mw, { col: INK2, a: fadeIn(pt, .9), lines: 2 });
      y += 30;
      if (p1) y = say(c, p1, 540, y, 'Tiro Devanagari Hindi', 46, mw, { col: INK, a: fadeIn(pt, 1.1), lines: 2 });
      y += 24;
      y = say(c, n1, 540, y, nf, 150, mw, { col: MAROON, a: fadeIn(pt, 1.4), weight: DEV.test(n1) ? '700' : '', shadow: 'rgba(160,110,30,.35)' });
      if (n2) {
        rule(c, 540, y + 30, 380, fadeIn(pt, 1.7), hi ? 'संग' : 'with', hi, '#a8761c');
        y = say(c, n2, 540, y + 66, nf, 150, mw, { col: MAROON, a: fadeIn(pt, 1.9), weight: DEV.test(n2) ? '700' : '', shadow: 'rgba(160,110,30,.35)' });
        if (p2) y = say(c, p2, 540, y + 16, 'Tiro Devanagari Hindi', 46, mw, { col: INK, a: fadeIn(pt, 2.1), lines: 2 });
      }
      y += 50;
      rule(c, 540, y, 300, fadeIn(pt, 2.3), '', false, '#a8761c');
      y += 44;
      say(c, clean(card.tagline) || (hi ? 'के शुभ विवाह में आप सादर आमंत्रित हैं' : 'request the honour of your presence'), 540, y, 'Tiro Devanagari Hindi', 46, mw, { col: INK2, a: fadeIn(pt, 2.5), lines: 3 });
      c.restore();
      dust(c, t, 13);
    });
  }

  const THEMES = [
    { id: 'baraat', top: '#8a2a1e', bot: '#3a0a10', glow: 'rgba(255,170,90,.55)', fx: 'fireworks', couple: 'baraat', med: '#7a1426' },
    { id: 'feast', top: '#3d1450', bot: '#160622', glow: 'rgba(230,170,255,.40)', fx: 'chandelier', couple: 'feast', med: '#4a1660' },
    { id: 'vidai', top: '#0f1838', bot: '#050a1c', glow: 'rgba(170,200,255,.35)', fx: 'stars', couple: 'vidai', med: '#1c2a5a' },
    { id: 'rose', top: '#7a2040', bot: '#2a0814', glow: 'rgba(255,170,200,.45)', fx: 'petals', couple: 'other', med: '#7a1d3c' }
  ];
  const themeFor = (name, i) => /बारात|baraat|swagat|स्वागत|wedding|विवाह|phera|फेर/i.test(name) && i === 0 ? THEMES[0]
    : /भोज|dinner|reception|feast|प्रीति|sangeet|संगीत/i.test(name) ? THEMES[1] : /विदा|vidai|bidai|farewell/i.test(name) ? THEMES[2] : THEMES[i % THEMES.length];

  function eventShot(c, s, pt, t, P) {
    const hi = P.opt.lang === 'hi', ev = s.ev, th = s.theme, d = s.date;
    stage(c, s, pt, t, P, k => {
      c.drawImage(hall(k, th.id, th.top, th.bot, th.glow), 0, 0, W, H);
      if (th.fx === 'fireworks') fireworks(c, t, 21);
      if (th.fx === 'stars') {
        twinkles(c, t, 60, 31, .9);
        c.save(); const mg = c.createRadialGradient(830, 250, 10, 830, 250, 200); mg.addColorStop(0, 'rgba(255,250,230,1)'); mg.addColorStop(.35, 'rgba(255,245,215,.9)'); mg.addColorStop(.4, 'rgba(255,240,200,.25)'); mg.addColorStop(1, 'rgba(255,240,200,0)');
        c.fillStyle = mg; c.fillRect(600, 30, 460, 440); c.restore();
      } else twinkles(c, t, 30, 17);
      if (th.fx === 'chandelier') sparks(c, t, 40, '#ffe7a8', 23);
      sweep(c, t + 1);
      const img = coupleFor(P, th.couple), ca = fadeIn(pt, 1.0, .9);
      if (img && ca > 0) { c.save(); c.globalAlpha = ca; cutout(c, img, 540, 1850 + (1 - ca) * 60, 800, 'full', L, t); c.restore(); }
      // the panel sits above the couple: words never reach them
      const pw = 840, ph = 760, px = 120, py = 200, rise = ease3(clamp((pt - .25) / .9));
      c.save(); c.globalAlpha = rise; c.translate(0, (1 - rise) * -60);
      cardFx(c, k, pw, ph, px, py, rise, t);
      if (d) {
        const ma = ease3(clamp((pt - .5) / .8));
        c.save(); c.translate(540, py + 210); c.rotate((1 - ma) * -Math.PI); c.scale(.2 + .8 * ma, .2 + .8 * ma); c.translate(-540, -(py + 210));
        K.dateMedallion(c, 540, py + 210, 92, d, { base: th.med, hi }); c.restore();
        if (ma >= 1) glow(c, 540, py + 210, 130 + 10 * Math.sin(t * 3), 'rgba(255,215,120,.25)');
      }
      if (s.lines) {
        drawPage(c, s, pt, 'e', s.lines, [py + (d ? 315 : 200), py + ph - 40], 700, .7);
        c.restore();
        if (th.fx === 'petals') petals(c, t, 30, ['#ff9fb8', '#ffd6e0', '#ffffff', '#e84a5f'], 5, 1);
        dust(c, t, 15 + th.id.length);
        return;
      }
      let y = py + (d ? 320 : 200);
      y = say(c, ev.name, 540, y, DEV.test(ev.name) ? 'Amita' : 'Cinzel', 104, 700, { col: MAROON, weight: '700', a: fadeIn(pt, .7), shadow: 'rgba(160,110,30,.35)' });
      rule(c, 540, y + 14, 360, fadeIn(pt, .9), '', false, '#a8761c');
      y += 36;
      if (d) y = say(c, hi ? K.hiDay(d) : K.dayText(d), 540, y, 'Tiro Devanagari Hindi', 44, 700, { col: INK, a: fadeIn(pt, 1.1) });
      const extra = ev.time || '', where = ev.venue && ev.venue !== clean(P.card.venue) ? ev.venue : '';
      if (extra) y = say(c, extra, 540, y + 4, 'Tiro Devanagari Hindi', 50, 700, { col: '#9a5b16', a: fadeIn(pt, 1.3) });
      if (where) say(c, where, 540, y + 4, 'Tiro Devanagari Hindi', extra ? 38 : 50, 700, { col: '#9a5b16', a: fadeIn(pt, 1.4), lines: 2 });
      c.restore();
      if (th.fx === 'petals') petals(c, t, 30, ['#ff9fb8', '#ffd6e0', '#ffffff', '#e84a5f'], 5, 1);
      dust(c, t, 15 + th.id.length);
    });
  }

  // sky lanterns drifting up behind a page
  function lanterns(c, t, seed, n = 12) {
    const R = rng(seed);
    for (let i = 0; i < n; i++) {
      const x = 40 + R() * 1000, sp = 30 + R() * 40, z = .6 + R() * .7, y = H + 100 - ((t * sp + R() * 2200) % 2200), sw = Math.sin(t * .8 + i) * 12;
      if (y < -100) continue;
      c.save(); c.translate(x + sw, y); c.scale(z, z);
      glow(c, 0, 10, 60, 'rgba(255,170,70,.35)');
      const g = c.createLinearGradient(0, -34, 0, 34); g.addColorStop(0, '#ffd27a'); g.addColorStop(1, '#ff8a2a');
      c.fillStyle = g; c.beginPath(); c.moveTo(-18, -30); c.lineTo(18, -30); c.lineTo(24, 26); c.lineTo(-24, 26); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,250,220,.9)'; c.beginPath(); c.ellipse(0, 22, 10, 5, 0, 0, TAU); c.fill();
      c.restore();
    }
  }
  // the venue as a card page: an emerald hall with lanterns, the pin dropping onto a turning mandala, the words, and a
  // gold palace drawing itself at the foot of the card
  function venueCard(c, s, pt, t, P) {
    stage(c, s, pt, t, P, k => {
      c.drawImage(hall(k, 'venue', '#0f3b36', '#04201c', 'rgba(255,205,120,.38)'), 0, 0, W, H);
      lanterns(c, t, 5); twinkles(c, t, 24, 77);
      const pw = 880, ph = 1560, px = 100, py = 160, rise = ease3(clamp((pt - .25) / .9));
      c.save(); c.globalAlpha = rise; c.translate(0, (1 - rise) * 70);
      cardFx(c, k, pw, ph, px, py, rise, t);
      // a gold mandala turning behind the pin
      const PY = py + 250, ma = fadeIn(pt, .5, 1);
      c.save(); c.globalAlpha *= ma * .35; c.translate(540, PY); c.rotate(t * .15); c.drawImage(mandalaArt(k), -230, -230, 460, 460); c.restore();
      // the pin drops, bounces, and ripples spread where it lands
      const dp = clamp((pt - .5) / .8), py2 = dp < 1 ? lerp(PY - 420, PY, ease3(dp)) : PY - Math.abs(Math.sin((pt - 1.3) * 6)) * 16 * Math.max(0, 1 - (pt - 1.3) * 1.2);
      if (pt > 1.3) for (let r = 0; r < 3; r++) {
        const u = ((pt - 1.3) / 1.8 + r / 3) % 1;
        c.save(); c.globalAlpha *= (1 - u) * .6; c.strokeStyle = MAROON; c.lineWidth = 3;
        c.beginPath(); c.ellipse(540, PY + 108, 26 + u * 170, 6 + u * 36, 0, 0, TAU); c.stroke(); c.restore();
      }
      if (dp > 0) {
        c.save(); c.translate(540, py2); c.scale(.7, .7);
        c.fillStyle = 'rgba(80,40,10,.2)'; c.beginPath(); c.ellipse(0, 156, 56, 12, 0, 0, TAU); c.fill();
        const gg = c.createLinearGradient(0, -150, 0, 150); GOLD.forEach(([q, col]) => gg.addColorStop(q, col));
        c.beginPath(); c.moveTo(0, 150); c.bezierCurveTo(-60, 60, -110, 10, -110, -50); c.arc(0, -50, 110, Math.PI, 0); c.bezierCurveTo(110, 10, 60, 60, 0, 150); c.closePath();
        c.fillStyle = MAROON; c.fill(); c.strokeStyle = gg; c.lineWidth = 9; c.stroke();
        c.beginPath(); c.arc(0, -50, 58, 0, TAU); c.fillStyle = '#fbf0dc'; c.fill();
        c.fillStyle = MAROON; c.font = '66px "Tiro Devanagari Hindi"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ॐ', 0, -44);
        c.restore();
      }
      drawPage(c, s, pt, 'vc', s.lines, [py + 400, py + 1060], 740, 1.2, .15);
      // the palace, drawn in from the left, then its windows glowing
      const palace = art('sm-palace2', W, 520, k, g => {
        const gg = g.createLinearGradient(0, 0, 0, 520); GOLD.forEach(([q, col]) => gg.addColorStop(q, col));
        g.strokeStyle = gg; g.lineWidth = 4; g.fillStyle = 'rgba(184,134,43,.10)';
        const dome = (x, y, r) => { g.beginPath(); g.moveTo(x - r, y); g.bezierCurveTo(x - r, y - r * 1.3, x, y - r * 1.2, x, y - r * 1.9); g.bezierCurveTo(x, y - r * 1.2, x + r, y - r * 1.3, x + r, y); g.closePath(); g.fill(); g.stroke(); };
        g.beginPath(); g.rect(250, 300, 580, 200); g.fill(); g.stroke();
        dome(540, 300, 120); dome(350, 300, 56); dome(730, 300, 56);
        for (const x of [270, 810]) { g.beginPath(); g.rect(x - 18, 170, 36, 330); g.fill(); g.stroke(); dome(x, 170, 24); }
        for (let x = 300; x < 780; x += 60) { g.beginPath(); g.moveTo(x, 500); g.lineTo(x, 410); g.arc(x + 18, 410, 18, Math.PI, 0); g.lineTo(x + 36, 500); g.stroke(); }
        g.beginPath(); g.moveTo(170, 500); g.lineTo(910, 500); g.stroke();
      });
      const dr = ease3(clamp((pt - 1.6) / 1.8)), top = py + ph - 560;
      if (dr > 0) {
        c.save(); c.beginPath(); c.rect(0, top, 170 + dr * 740, 540); c.clip(); c.drawImage(palace, 0, top, W, 520); c.restore();
        if (dr < 1) glow(c, 170 + dr * 740, top + 400, 60, 'rgba(255,215,120,.6)');
        else for (let x = 300, i = 0; x < 780; x += 60, i++) {
          const a = .2 + .25 * Math.sin(t * 2.4 - i * .7);
          c.fillStyle = `rgba(255,190,80,${a.toFixed(2)})`; c.beginPath(); c.moveTo(x + 5, top + 497); c.lineTo(x + 5, top + 412); c.arc(x + 18, top + 412, 13, Math.PI, 0); c.lineTo(x + 31, top + 497); c.closePath(); c.fill();
        }
      }
      c.restore();
      petals(c, t, 14, ['#e84a5f', '#ffb3c1', '#f6c453'], 3, .9);
      dust(c, t, 81);
    });
  }

  function venueShot(c, s, pt, t, P) {
    if (s.lines) return venueCard(c, s, pt, t, P);
    const hi = P.opt.lang === 'hi', v = clean(P.card.venue), i = v.indexOf(','), name = i > 0 ? v.slice(0, i) : v, addr = i > 0 ? v.slice(i + 1).trim() : '';
    stage(c, s, pt, t, P, k => {
      const bg = art('sm-ivory', W, H, k, g => {
        const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#fcf3e3'); gr.addColorStop(1, '#f1dfc0'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
        g.save(); g.translate(540, 1500); g.globalAlpha = .1;
        for (let r = 1; r < 9; r++) { g.beginPath(); g.arc(0, 0, r * 110, 0, TAU); g.strokeStyle = '#8a5a10'; g.lineWidth = 2; g.stroke(); }
        g.restore();
      });
      c.drawImage(bg, 0, 0, W, H);
      const palace = art('sm-palace', W, H, k, g => {
        const gg = g.createLinearGradient(0, 1300, 0, 1800); GOLD.forEach(([q, col]) => gg.addColorStop(q, col));
        g.strokeStyle = gg; g.lineWidth = 4; g.fillStyle = 'rgba(184,134,43,.10)';
        const dome = (x, y, r) => { g.beginPath(); g.moveTo(x - r, y); g.bezierCurveTo(x - r, y - r * 1.3, x, y - r * 1.2, x, y - r * 1.9); g.bezierCurveTo(x, y - r * 1.2, x + r, y - r * 1.3, x + r, y); g.closePath(); g.fill(); g.stroke(); };
        g.beginPath(); g.rect(170, 1500, 740, 260); g.fill(); g.stroke();
        dome(540, 1500, 150); dome(300, 1500, 70); dome(780, 1500, 70);
        for (const x of [190, 890]) { g.beginPath(); g.rect(x - 22, 1340, 44, 420); g.fill(); g.stroke(); dome(x, 1340, 30); }
        for (let x = 230; x < 880; x += 72) { g.beginPath(); g.moveTo(x, 1760); g.lineTo(x, 1640); g.arc(x + 22, 1640, 22, Math.PI, 0); g.lineTo(x + 44, 1760); g.stroke(); }
        g.beginPath(); g.moveTo(60, 1760); g.lineTo(W - 60, 1760); g.stroke();
      });
      const draw = ease3(clamp((pt - .6) / 2));
      if (draw > 0) {
        c.save(); c.beginPath(); c.rect(0, 0, 60 + draw * (W - 60), H); c.clip(); c.drawImage(palace, 0, 0, W, H); c.restore();
        if (draw < 1) { const x = 60 + draw * (W - 60); glow(c, x, 1600, 70, 'rgba(255,215,120,.55)'); }
      }
      // arch windows glowing one after another once the palace is drawn
      if (draw >= 1) for (let x = 230, i = 0; x < 880; x += 72, i++) {
        const a = .25 + .25 * Math.sin(t * 2.4 - i * .7);
        c.fillStyle = `rgba(255,200,90,${a.toFixed(2)})`; c.beginPath(); c.moveTo(x + 6, 1756); c.lineTo(x + 6, 1642); c.arc(x + 22, 1642, 16, Math.PI, 0); c.lineTo(x + 38, 1756); c.closePath(); c.fill();
      }
      // the pin drops and bounces
      const PY = 330, dp = clamp((pt - .4) / .9), py = dp < 1 ? lerp(-200, PY, ease3(dp)) : PY - Math.abs(Math.sin((pt - 1.3) * 6)) * 18 * Math.max(0, 1 - (pt - 1.3) * 1.2);
      // ripples spreading from where the pin landed
      if (pt > 1.3) for (let r = 0; r < 3; r++) {
        const u = ((pt - 1.3) / 1.8 + r / 3) % 1;
        c.save(); c.globalAlpha = (1 - u) * .55; c.strokeStyle = MAROON; c.lineWidth = 3;
        c.beginPath(); c.ellipse(540, PY + 132, 30 + u * 190, 7 + u * 44, 0, 0, TAU); c.stroke(); c.restore();
      }
      c.save(); c.translate(540, py); c.scale(.82, .82);
      c.fillStyle = 'rgba(80,40,10,.18)'; c.beginPath(); c.ellipse(0, 150 + (420 - py) * 0, 60, 14, 0, 0, TAU); c.fill();
      const gg = c.createLinearGradient(0, -150, 0, 150); GOLD.forEach(([q, col]) => gg.addColorStop(q, col));
      c.beginPath(); c.moveTo(0, 150); c.bezierCurveTo(-60, 60, -110, 10, -110, -50); c.arc(0, -50, 110, Math.PI, 0); c.bezierCurveTo(110, 10, 60, 60, 0, 150); c.closePath();
      c.fillStyle = MAROON; c.fill(); c.strokeStyle = gg; c.lineWidth = 8; c.stroke();
      c.beginPath(); c.arc(0, -50, 56, 0, TAU); c.fillStyle = '#fbf0dc'; c.fill();
      c.fillStyle = MAROON; c.font = '64px "Tiro Devanagari Hindi"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ॐ', 0, -44);
      c.restore();
      if (s.lines) { drawPage(c, s, pt, 'v', s.lines, [560, 1300], 960, 1.2, .16); petals(c, t, 16, ['#e84a5f', '#ffb3c1', '#f6c453'], 3, .9); return; }
      let y = 640;
      c.save(); c.globalAlpha = fadeIn(pt, 1.2); c.fillStyle = '#9a7020'; c.font = '600 40px "Cinzel"'; K.spacing(c, 10); c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(hi ? 'विवाह स्थल' : 'VENUE', 540, y); K.spacing(c, 0); c.restore();
      y += 50;
      y = say(c, name, 540, y, DEV.test(name) ? 'Amita' : 'Cinzel', 96, 940, { col: MAROON, weight: '700', a: fadeIn(pt, 1.4), lines: 2, lh: 1.2 });
      rule(c, 540, y + 20, 520, fadeIn(pt, 1.6), '', false, '#a8761c');
      say(c, addr, 540, y + 50, DEV.test(addr) ? 'Tiro Devanagari Hindi' : 'Gilda Display', 52, 880, { col: INK, a: fadeIn(pt, 1.8), lines: 3, lh: 1.4 });
      petals(c, t, 16, ['#e84a5f', '#ffb3c1', '#f6c453'], 3, .9);
    });
  }

  function kidsShot(c, s, pt, t, P) {
    const hi = P.opt.lang === 'hi', msg = clean(P.card.message), m = msg.split(/\s+[—-]\s+/), body = m[0], who = m[1] || '';
    stage(c, s, pt, t, P, k => {
      c.drawImage(hall(k, 'rose', THEMES[3].top, THEMES[3].bot, THEMES[3].glow), 0, 0, W, H);
      twinkles(c, t, 30, 41);
      const k1 = lib('kid-01'), k2 = lib('kid-02'), ka = fadeIn(pt, .9, .8), hop = Math.abs(Math.sin(t * 3)) * 16;
      if (k1 && ka) { c.save(); c.globalAlpha = ka; cutout(c, k1, 330, 1850 - hop, 640, 'full', L, t); c.restore(); }
      if (k2 && ka) { c.save(); c.globalAlpha = ka; cutout(c, k2, 760, 1850 - Math.abs(Math.sin(t * 3 + 1.3)) * 16, 640, 'full', L, t, true); c.restore(); }
      const pw = 860, ph = 860, px = 110, py = 200, rise = ease3(clamp((pt - .25) / .9));
      c.save(); c.globalAlpha = rise; c.translate(0, (1 - rise) * -60);
      cardFx(c, k, pw, ph, px, py, rise, t);
      if (s.lines) { drawPage(c, s, pt, 'k', s.lines, [py + 170, py + ph - 50], 720); c.restore();
        { const R = rng(88); for (let i = 0; i < 14; i++) { const x = 120 + R() * 840, sp = 70 + R() * 60, y = 1880 - ((t * sp + R() * 900) % 900), z = 14 + R() * 14, a = Math.min(1, (1880 - y) / 200) * Math.max(0, (y - 1000) / 300);
          if (a <= 0) continue; c.save(); c.globalAlpha = a * .8; c.fillStyle = i % 2 ? '#ff5d8f' : '#ff9fb8'; c.translate(x + Math.sin(t * 2 + i) * 14, y);
          c.beginPath(); c.moveTo(0, z * .35); c.bezierCurveTo(-z, -z * .3, -z * .45, -z, 0, -z * .45); c.bezierCurveTo(z * .45, -z, z, -z * .3, 0, z * .35); c.fill(); c.restore(); } } petals(c, t, 30, ['#ff9fb8', '#ffd6e0', '#ffffff', '#f6c453'], 7, 1); return; }
      let y = py + 190;
      y = say(c, hi ? 'बाल आग्रह' : 'A little request', 540, y, hi ? 'Amita' : 'Great Vibes', 88, 700, { col: MAROON, weight: hi ? '700' : '', a: fadeIn(pt, .6) });
      rule(c, 540, y + 12, 340, fadeIn(pt, .8), '', false, '#a8761c');
      y = say(c, body, 540, y + 40, 'Tiro Devanagari Hindi', 50, 700, { col: INK, a: fadeIn(pt, 1.0), lines: 5, lh: 1.4 });
      if (who) say(c, `— ${who}`, 540, y + 16, 'Tiro Devanagari Hindi', 36, 720, { col: '#9a5b16', a: fadeIn(pt, 1.5), lines: 2 });
      c.restore();
      petals(c, t, 30, ['#ff9fb8', '#ffd6e0', '#ffffff', '#f6c453'], 7, 1);
    });
  }

  function thanksShot(c, s, pt, t, P) {
    const hi = P.opt.lang === 'hi', card = P.card, from = clean(card.from), ph = clean(card.phones || '');
    stage(c, s, pt, t, P, k => {
      c.drawImage(hall(k, 'names', '#4a0a16', '#24040c', 'rgba(255,190,110,.40)'), 0, 0, W, H);
      sweep(c, t); twinkles(c, t, 40, 51); fireworks(c, t + 3, 61);
      const pw = 840, phh = s.plain ? 1280 : 1400, px = 120, py = 170, rise = ease3(clamp((pt - .25) / .9));
      c.save(); c.globalAlpha = rise; c.translate(0, (1 - rise) * 60);
      cardFx(c, k, pw, phh, px, py, rise, t);
      let y = py + 170;
      if (s.lines) { drawPage(c, s, pt, 't', s.lines, s.plain ? [py + 200, py + phh - 120] : [py + 130, py + 640], 720); y = py + 640; } else {
      y = say(c, hi ? (K.HI.closing[card.type] || 'आपकी प्रतीक्षा में') : 'Awaiting your presence', 540, y, hi ? 'Amita' : 'Great Vibes', 92, 700, { col: MAROON, weight: hi ? '700' : '', a: fadeIn(pt, .6) });
      const n1 = clean(card.host1), n2 = clean(card.host2);
      y = say(c, n2 ? `${n1} ${hi ? 'संग' : '&'} ${n2}` : n1, 540, y + 4, DEV.test(n1) ? 'Tiro Devanagari Hindi' : 'Cinzel', 48, 700, { col: '#9a5b16', a: fadeIn(pt, .8) });
      if (from) y = say(c, from, 540, y + 16, 'Tiro Devanagari Hindi', 42, 700, { col: INK, a: fadeIn(pt, 1.0), lines: 2 });
      if (ph) y = say(c, ph, 540, y + 2, 'Gilda Display', 36, 700, { col: INK2, a: fadeIn(pt, 1.1) });
      }
      // the designer's signature, centred at the foot of the card (kept clear of a phone's play controls)
      const sa = fadeIn(pt, 1.6, .8), bw = 420, bh = 150, bx = 540 - bw / 2, by = s.plain ? py + phh + 50 : py + phh - bh - 50;
      if (sa > 0) {
        c.save(); c.globalAlpha *= sa; c.translate(540, by + bh / 2); c.scale(.9 + .1 * sa, .9 + .1 * sa); c.translate(-540, -(by + bh / 2));
        const gg = c.createLinearGradient(bx, by, bx + bw, by + bh); GOLD.forEach(([q, col]) => gg.addColorStop(q, col));
        c.fillStyle = '#fffaf0'; K.rrect(c, bx, by, bw, bh, 26); c.fill();
        c.strokeStyle = gg; c.lineWidth = 4; K.rrect(c, bx + 8, by + 8, bw - 16, bh - 16, 20); c.stroke();
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillStyle = INK2; c.font = '26px "Gilda Display"'; K.spacing(c, 7); c.fillText('DESIGNED BY', 540, by + 44); K.spacing(c, 0);
        const tg = c.createLinearGradient(0, by + 60, 0, by + 135); GOLD.forEach(([q, col]) => tg.addColorStop(q, col));
        c.font = '84px "Great Vibes"'; c.fillStyle = 'rgba(90,50,10,.25)'; c.fillText(P.ctx.designer, 541, by + 100); c.fillStyle = tg; c.fillText(P.ctx.designer, 540, by + 98);
        c.restore();
      }
      c.restore();
      const qf = s.plain ? 0 : ease3(clamp((pt - .9) / .7));
      c.save(); c.translate(540, 0); c.scale(Math.max(.02, qf), 1); c.translate(-540, 0);
      if (!s.plain) K.words(c, P, s.tail, { zone: [y + 20, by - 30, 700], L: K.palette('blush-champagne', { col: { ink2: INK2, names: MAROON } }), p: pt - .6, t });
      c.restore();
      dust(c, t, 71);
    });
  }

  return {
    id: 'story-sheeshmahal', order: 13, occasion: 'wedding', tune: 'shehnai', thumb: 9.5,
    name: 'Sheesh Mahal', note: 'Gold dust becomes a mandala and Shri Ganesh, jaali doors open, then the camera flies through gold arches into a mirrored hall for every scene',
    names: ['Ira', 'Vihaan'], ganesha: 'ganesha-06',
    looks: { open: 'palace', title: 'palace', invite: 'palace', events: ['palace'], date: 'palace', end: 'palace', final: 'palace' },
    timeline(S, K2, card, opt) {
      const hi = opt.lang === 'hi', evs = [];
      // a printed card's own pages, word for word (card.exact.pages), in its own order
      if (card.exact && card.exact.pages) {
        return card.exact.pages.map((p, i) => {
          const sc = { k: 'reel', reel: p.shot, d: p.d || 5, name: p.name || p.shot, cut: i > 0, change: 'none', lines: p.lines, exact: p.exact, hall: p.hall, ganesh: p.ganesh };
          if (p.shot === 'event') Object.assign(sc, { ev: { name: p.name, time: '', venue: '' }, date: p.date ? new Date(p.date + 'T12:00') : null, theme: THEMES.find(x => x.id === p.theme) || THEMES[0] });
          if (p.shot === 'thanks') Object.assign(sc, { last: true, sigCorner: false, plain: !!p.plain,
            tail: [{ t: 'qr', rows: K.SITE_QR, z: 230, gap: 20 }, { t: 'text', s: hi ? 'ऐसा ही निमन्त्रण बनवाएँ' : 'Your invitation, made like this', f: hi ? 'hser' : 'italic', z: 32, col: 'ink2', gap: 6 },
              { t: 'text', s: 'cardalbum.vercel.app', f: 'serif', z: 40, col: 'names' }] });
          return sc;
        });
      }
      days(card, hi).forEach(d => d.events.forEach(e => evs.push({ ...e, date: d.date })));
      const list = evs.slice(0, 5), ed = list.length > 3 ? 4.2 : 5;
      const out = [
        { k: 'reel', reel: 'ganesh', d: 5.6, name: 'Shri Ganesh', change: 'none' },
        { k: 'reel', reel: 'doors', d: 3.2, name: 'Jaali Doors', cut: true, change: 'none' },
        { k: 'reel', reel: 'names', d: 6.2, name: 'The Couple', cut: true, change: 'none' },
        { k: 'reel', reel: 'invite', d: 7, name: 'Invitation', cut: true, change: 'none' }];
      list.forEach((e, i) => out.push({ k: 'reel', reel: 'event', d: ed, name: e.name, ev: e, date: e.date, theme: themeFor(e.name, i), cut: true, change: 'none' }));
      if (clean(card.venue)) out.push({ k: 'reel', reel: 'venue', d: 5.4, name: 'Venue', cut: true, change: 'none' });
      if (clean(card.message)) out.push({ k: 'reel', reel: 'kids', d: 5.4, name: 'A Little Request', cut: true, change: 'none' });
      out.push({ k: 'reel', reel: 'thanks', d: 6.6, name: 'Thank You', cut: true, change: 'none', last: true, sigCorner: opt.signature !== false,
        tail: [{ t: 'qr', rows: K.SITE_QR, z: 230, gap: 20 }, { t: 'text', s: hi ? 'ऐसा ही निमन्त्रण बनवाएँ' : 'Your invitation, made like this', f: hi ? 'hser' : 'italic', z: 32, col: 'ink2', gap: 6 },
          { t: 'text', s: 'cardalbum.vercel.app', f: 'serif', z: 40, col: 'names' }] });
      let total = out.reduce((a, s) => a + s.d, 0);
      if (total > 59.5) { const f = 59.5 / total; out.forEach(s => { s.d = +(s.d * f).toFixed(2); }); total = 59.5; }
      return out;
    },
    shots: { page: pageShot, ganesh: ganeshShot, doors: doorsShot, names: namesShot, invite: inviteShot, event: eventShot, venue: venueShot, kids: kidsShot, thanks: thanksShot }
  };
})(Cinema.kit));
