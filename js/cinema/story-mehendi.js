// Mehendi Lines: henna that draws itself. A cone pipes a full mandala stroke by stroke and the word Mehendi appears
// in its heart; the cone writes their names in henna on silk; the invitation sits in a green-and-pink
// floral jharokha with bandhani drapes and lanterns; every function in a lantern-lit bandhani tent, each opened by a
// henna vine drawing itself round the screen; a bandhani scarf for the date; lanterns rising for the thank you.
Cinema.register((K => {
  const { W, H, TAU, rng, clamp, ease, ease3, lerp, mix, art, glow, rrect, clean, dateRange, spacing, coupleImage, foil, rose, leaf, blossom } = K;
  const hiOf = P => P.opt.lang === 'hi';
  const deva = card => /[ऀ-ॿ]/.test(`${card.host1 || ''}${card.host2 || ''}`);
  const kOf = P => Math.min(1.25, Math.max(.5, P.k));
  const HENNA = '#6a2a10', HENNA2 = '#8a3c16';

  // ---- henna that draws itself: a design is a list of strokes (polylines); p reveals them in order ----
  function Design() { this.paths = []; this.total = 0; }
  Design.prototype.fill = function (a = 1) { this.paths[this.paths.length - 1].fill = a; return this; };
  Design.prototype.add = function (pts, w = 5, dot = false) {
    let len = 0; for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (dot) len = 14;
    this.paths.push({ pts, w, dot, len, at: this.total }); this.total += len; return this;
  };
  const circlePts = (cx, cy, r, n = 48, a0 = 0, a1 = TAU) => { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return o; };
  // a pointed petal from radius r0 to r1 at angle a, half-width hw (in radians)
  const petalPts = (cx, cy, a, r0, r1, hw, n = 14) => { const o = []; for (let i = 0; i <= n; i++) { const u = i / n, s = Math.sin(u * Math.PI), aa = a - hw * s, rr = lerp(r0, r1, u); o.push([cx + Math.cos(aa) * rr, cy + Math.sin(aa) * rr]); } for (let i = n; i >= 0; i--) { const u = i / n, s = Math.sin(u * Math.PI), aa = a + hw * s, rr = lerp(r0, r1, u); o.push([cx + Math.cos(aa) * rr, cy + Math.sin(aa) * rr]); } return o; };
  const scallopPts = (cx, cy, r, n, depth) => { const o = []; for (let i = 0; i <= n * 10; i++) { const a = i / (n * 10) * TAU, rr = r + Math.abs(Math.sin(a * n / 2)) * depth; o.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } return o; };
  function mandalaInto(D, cx, cy, R, w = 4, rich = 1) {
    D.add(circlePts(cx, cy, R * .08, 20), w);
    D.add(circlePts(cx, cy, R * .045, 12), w).fill();
    for (let i = 0; i < 8; i++) D.add(petalPts(cx, cy, i / 8 * TAU, R * .1, R * .3, .28), w);
    for (let i = 0; i < 8; i++) D.add(petalPts(cx, cy, i / 8 * TAU, R * .13, R * .25, .14, 8), w * .6).fill();
    for (let i = 0; i < 8; i++) D.add(petalPts(cx, cy, (i + .5) / 8 * TAU, R * .16, R * .3, .1, 8), w * .6).fill(.85);
    D.add(circlePts(cx, cy, R * .33, 60), w);
    for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; D.add([[cx + Math.cos(a) * R * .38, cy + Math.sin(a) * R * .38]], w * 1.6, true); }
    D.add(circlePts(cx, cy, R * .43, 70), w);
    for (let i = 0; i < 12; i++) D.add(petalPts(cx, cy, (i + .5) / 12 * TAU, R * .45, R * .68, .2), w);
    for (let i = 0; i < 12; i++) D.add(petalPts(cx, cy, (i + .5) / 12 * TAU, R * .5, R * .6, .08, 8), w * .7);
    for (let i = 0; i < 12; i++) D.add(petalPts(cx, cy, (i + .5) / 12 * TAU, R * .53, R * .63, .06, 6), w * .5).fill();
    D.add(scallopPts(cx, cy, R * .7, 24, R * .05), w);
    if (rich) {
      for (let i = 0; i < 24; i++) { const a = (i + .5) / 24 * TAU; D.add(petalPts(cx, cy, a, R * .74, R * .79, .05, 5), w * .5).fill(); }
      for (let i = 0; i < 48; i++) { const a = i / 48 * TAU; D.add([[cx + Math.cos(a) * R * .8, cy + Math.sin(a) * R * .8]], w * 1.3, true); }
      for (let i = 0; i < 16; i++) D.add(petalPts(cx, cy, i / 16 * TAU, R * .84, R, .14), w);
      for (let i = 0; i < 16; i++) D.add(petalPts(cx, cy, i / 16 * TAU, R * .87, R * .95, .06, 6), w * .5).fill();
      D.add(circlePts(cx, cy, R * 1.03, 100), w * .8);
      for (let i = 0; i < 32; i++) { const a = (i + .5) / 32 * TAU; D.add(petalPts(cx, cy, a, R * 1.05, R * 1.13, .05, 5), w * .6).fill(); }
      D.add(circlePts(cx, cy, R * 1.16, 110), w * .6);
    }
  }
  // draw a design up to p (0 … 1); returns the tip (where the cone is)
  function drawDesign(c, D, p, col = HENNA) {
    const upto = D.total * clamp(p);
    let tip = null;
    c.save(); c.strokeStyle = col; c.fillStyle = col; c.lineCap = 'round'; c.lineJoin = 'round';
    for (const s of D.paths) {
      if (s.at >= upto) break;
      if (s.dot) { c.beginPath(); c.arc(s.pts[0][0], s.pts[0][1], s.w, 0, TAU); c.fill(); tip = s.pts[0]; continue; }
      const lim = upto - s.at; let acc = 0;
      c.lineWidth = s.w; c.beginPath(); c.moveTo(s.pts[0][0], s.pts[0][1]); tip = s.pts[0];
      for (let i = 1; i < s.pts.length; i++) {
        const [x0, y0] = s.pts[i - 1], [x1, y1] = s.pts[i], l = Math.hypot(x1 - x0, y1 - y0);
        if (acc + l > lim) { const u = (lim - acc) / l; tip = [lerp(x0, x1, u), lerp(y0, y1, u)]; c.lineTo(tip[0], tip[1]); break; }
        c.lineTo(x1, y1); acc += l; tip = [x1, y1];
      }
      if (s.fill && lim >= s.len) { c.globalAlpha = s.fill; c.fill(); c.globalAlpha = 1; }
      c.stroke();
    }
    c.restore();
    return tip;
  }
  // the henna cone (a rolled plastic cone with a henna-dark tip) resting at the tip
  function cone(c, x, y, t, a = 1) {
    if (a <= 0) return;
    c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(-.65 + Math.sin(t * 6) * .04);
    c.fillStyle = 'rgba(40,20,5,.2)'; c.beginPath(); c.ellipse(24, 30, 30, 10, .4, 0, TAU); c.fill();
    const g = c.createLinearGradient(-26, 0, 26, 0); g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(.5, 'rgba(220,235,255,.85)'); g.addColorStop(1, 'rgba(180,200,220,.6)');
    c.fillStyle = '#5a2410'; c.beginPath(); c.moveTo(0, 0); c.lineTo(-24, -170); c.lineTo(24, -170); c.closePath(); c.fill();
    c.fillStyle = g; c.beginPath(); c.moveTo(0, 0); c.lineTo(-30, -180); c.quadraticCurveTo(0, -200, 30, -180); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-10, -40); c.lineTo(-22, -165); c.stroke();
    c.fillStyle = '#e0405e'; c.fillRect(-32, -196, 64, 18);
    c.restore();
  }
  // a paisley (a teardrop with a curled tip) at (x, y), size r, turned by a; f = 1 or -1 mirrors it
  function paisleyInto(D, x, y, r, a, f, inner) {
    const pts = [], P = (px, py) => { const qx = px * f, ca = Math.cos(a), sa = Math.sin(a); pts.push([x + qx * ca - py * sa, y + qx * sa + py * ca]); };
    for (let i = 0; i <= 30; i++) { const th = -Math.PI / 2 - i / 30 * Math.PI * 1.5; P(Math.cos(th) * r, Math.sin(th) * r); }
    for (let i = 1; i <= 14; i++) { const u = i / 14; P((1 - u) ** 2 * r + 2 * (1 - u) * u * r * 1.35 + u * u * r * 1.1, (1 - u) ** 2 * 0 + 2 * (1 - u) * u * -r * .4 + u * u * -r * 1.9); }
    for (let i = 1; i <= 14; i++) { const u = i / 14; P((1 - u) ** 2 * r * 1.1 + 2 * (1 - u) * u * r * .5 + u * u * 0, (1 - u) ** 2 * -r * 1.9 + 2 * (1 - u) * u * -r * 1.5 + u * u * -r); }
    D.add(pts, inner ? 3 : 5);
    if (inner) { const ca = Math.cos(a), sa = Math.sin(a); D.add(circlePts(x, y, r * .35, 16), 3).fill(); for (let i = 0; i < 8; i++) { const th = i / 8 * TAU; D.add([[x + Math.cos(th) * r * .62, y + Math.sin(th) * r * .62]], 3, true); } void ca; void sa; }
  }
  const designs = new Map();
  function designOf(key, build) { if (!designs.has(key)) { const D = new Design(); build(D); designs.set(key, D); } return designs.get(key); }

  // ---- bandhani, lanterns, florals ----
  // bandhani cloth: a dyed ground with rings of white tie-dye dots (painted once per colour)
  const bandhani = (k, base, w = W, h = H, key = '') => art(`mh-bandhani-${base}-${w}x${h}${key}`, w, h, k, c => {
    const R = rng(9), g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, mix(base, '#ffffff', .08)); g.addColorStop(1, mix(base, '#000000', .18)); c.fillStyle = g; c.fillRect(0, 0, w, h);
    for (let y = 30; y < h; y += 90) for (let x = (y / 90 % 2) * 45 + 20; x < w; x += 90) {
      const big = (Math.round(x / 45) + Math.round(y / 90)) % 3 === 0;
      for (let i = 0; i < (big ? 8 : 4); i++) { const a = i / (big ? 8 : 4) * TAU, r = big ? 18 : 9; c.fillStyle = `rgba(255,250,235,${(.75 + R() * .2).toFixed(2)})`; c.beginPath(); c.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, 3.4, 0, TAU); c.fill(); }
      c.fillStyle = 'rgba(255,230,140,.85)'; c.beginPath(); c.arc(x, y, big ? 4 : 2.5, 0, TAU); c.fill();
    }
    const v = c.createLinearGradient(0, 0, w, 0); v.addColorStop(0, 'rgba(0,0,0,.18)'); v.addColorStop(.5, 'rgba(255,255,255,.06)'); v.addColorStop(1, 'rgba(0,0,0,.18)'); c.fillStyle = v; c.fillRect(0, 0, w, h);
  });
  // a pierced brass lantern with coloured glass, lit (painted once, swung live)
  const lantern = (k, glass) => art(`mh-lantern-${glass}`, 200, 380, k, c => {
    glow(c, 100, 230, 100, 'rgba(255,190,90,.55)');
    c.strokeStyle = '#b8862b'; c.lineWidth = 3; c.beginPath(); c.moveTo(100, 0); c.lineTo(100, 70); c.stroke();
    const br = c.createLinearGradient(40, 0, 160, 0); br.addColorStop(0, '#7a4a10'); br.addColorStop(.5, '#f2c24e'); br.addColorStop(1, '#7a4a10');
    c.fillStyle = br; c.beginPath(); c.moveTo(100, 70); c.lineTo(150, 130); c.lineTo(50, 130); c.closePath(); c.fill(); c.beginPath(); c.arc(100, 72, 10, 0, TAU); c.fill();
    const gl = c.createLinearGradient(0, 130, 0, 320); gl.addColorStop(0, '#fff6c8'); gl.addColorStop(.5, glass); gl.addColorStop(1, mix(glass, '#000000', .3));
    c.fillStyle = gl; c.beginPath(); c.moveTo(54, 130); c.lineTo(146, 130); c.quadraticCurveTo(176, 225, 140, 320); c.lineTo(60, 320); c.quadraticCurveTo(24, 225, 54, 130); c.fill();
    c.strokeStyle = br; c.lineWidth = 6; c.stroke(); c.lineWidth = 3;
    for (const x of [78, 100, 122]) { c.beginPath(); c.moveTo(x, 130); c.quadraticCurveTo(x + (x - 100) * .9, 225, x + (x - 100) * .3, 320); c.stroke(); }
    c.fillStyle = 'rgba(255,250,220,.85)'; for (let i = 0; i < 18; i++) { c.beginPath(); c.arc(70 + (i % 4) * 20, 160 + Math.floor(i / 4) * 32, 3, 0, TAU); c.fill(); }
    c.fillStyle = br; c.fillRect(56, 318, 88, 18); c.beginPath(); c.moveTo(70, 336); c.lineTo(130, 336); c.lineTo(100, 372); c.fill();
  });
  function hangLantern(c, k, x, y, len, s, glass, t, ph) {
    const a = Math.sin(t * 1.3 + ph) * .06;
    c.save(); c.translate(x, y); c.rotate(a); c.strokeStyle = 'rgba(184,134,43,.8)'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, len); c.stroke();
    c.drawImage(lantern(k, glass), -100 * s, len - 10, 200 * s, 380 * s); c.restore();
  }
  // a pink-and-green floral bunch (roses, blossoms, leaves) painted once
  const bunch = (k, seed, w = 420, h = 300) => art(`mh-bunch-${seed}-${w}`, w, h, k, c => {
    const R = rng(seed);
    for (let i = 0; i < 26; i++) leaf(c, w / 2 + (R() - .5) * w * .9, h / 2 + (R() - .5) * h * .7, 60 + R() * 40, 22, R() * TAU, R() > .5 ? '#2f6a3a' : '#4f8f4a');
    for (let i = 0; i < 9; i++) rose(c, w / 2 + (R() - .5) * w * .7, h / 2 + (R() - .5) * h * .5, 26 + R() * 18, i % 2 ? '#ffc3d1' : '#ff9ab5', i % 2 ? '#d6336c' : '#c2185b', R() * 3);
    for (let i = 0; i < 14; i++) blossom(c, w / 2 + (R() - .5) * w * .85, h / 2 + (R() - .5) * h * .6, 10 + R() * 6, i % 3 ? '#ffffff' : '#ffd166', '#f4a3c4', R() * 6);
  });

  // ---- the jharokha (a carved window, green and pink, with florals) for the invitation ----
  const jharokhaArt = k => art('mh-jharokha', W, H, k, c => {
    const R = rng(12);
    // the wall: soft pink plaster with a faint henna lace
    const wg = c.createLinearGradient(0, 0, 0, H); wg.addColorStop(0, '#f7d6dc'); wg.addColorStop(1, '#efbcc8'); c.fillStyle = wg; c.fillRect(0, 0, W, H);
    c.globalAlpha = .1; for (let y = 0; y < H + 200; y += 260) for (let x = (y / 260 % 2) * 130; x < W + 130; x += 260) K.henna(c, x, y, 90, '#8a2a4a'); c.globalAlpha = 1;
    // the window: a cusped arch in emerald with gold edges, a cream niche inside
    const x0 = 110, x1 = W - 110, top = 260, bot = 1620, cx = W / 2, rr = (x1 - x0) / 2;
    const archPath = (inset) => { c.beginPath(); c.moveTo(x0 + inset, bot - inset); c.lineTo(x0 + inset, top + rr); const n = 9;
      for (let i = 0; i <= n; i++) { const a = Math.PI + i / n * Math.PI, r = rr - inset, px = cx + Math.cos(a) * r, py = top + rr + Math.sin(a) * r * 1.0; c.quadraticCurveTo(px + Math.cos(a) * 26, py + Math.sin(a) * 26, px, py); }
      c.lineTo(x1 - inset, bot - inset); c.closePath(); };
    c.save(); c.shadowColor = 'rgba(80,20,40,.45)'; c.shadowBlur = 40; c.shadowOffsetY = 18; archPath(-40); c.fillStyle = '#1f6b4f'; c.fill(); c.restore();
    archPath(-40); const eg = c.createLinearGradient(0, top, 0, bot); eg.addColorStop(0, '#2a8a66'); eg.addColorStop(1, '#155a40'); c.fillStyle = eg; c.fill();
    c.strokeStyle = '#e8c46a'; c.lineWidth = 6; archPath(-30); c.stroke(); c.lineWidth = 3; archPath(-6); c.stroke();
    // painted flower trail on the emerald frame
    for (let i = 0; i < 70; i++) { const u = i / 70; let px, py; if (u < .3) { px = x0 - 20; py = bot - u / .3 * (bot - top - rr); } else if (u < .7) { const a = Math.PI + (u - .3) / .4 * Math.PI; px = cx + Math.cos(a) * (rr + 20); py = top + rr + Math.sin(a) * (rr + 20); } else { px = x1 + 20; py = top + rr + (u - .7) / .3 * (bot - top - rr); }
      blossom(c, px, py, 9, i % 2 ? '#ff9ab5' : '#fff3c8', '#e8c46a', u * 9); }
    archPath(10); const ng = c.createRadialGradient(cx, 900, 100, cx, 900, 900); ng.addColorStop(0, '#fffaf0'); ng.addColorStop(1, '#f6e6d2'); c.fillStyle = ng; c.fill();
    // a fine henna border inside the niche
    c.save(); archPath(10); c.clip(); c.strokeStyle = 'rgba(138,60,22,.35)'; c.lineWidth = 2; archPath(40); c.stroke(); c.setLineDash([2, 10]); c.lineWidth = 4; c.lineCap = 'round'; archPath(52); c.stroke(); c.setLineDash([]);
    c.globalAlpha = .12; K.mandala(c, cx, top + rr + 40, 300, '#8a3c16'); c.globalAlpha = 1; c.restore();
    // the sill and brackets
    c.fillStyle = '#155a40'; c.fillRect(x0 - 80, bot - 10, x1 - x0 + 160, 50); c.fillStyle = '#e8c46a'; c.fillRect(x0 - 80, bot - 10, x1 - x0 + 160, 6); c.fillRect(x0 - 80, bot + 34, x1 - x0 + 160, 4);
    for (let x = x0 - 60; x <= x1 + 60; x += 70) { c.fillStyle = '#1f6b4f'; c.beginPath(); c.moveTo(x - 20, bot + 40); c.lineTo(x + 20, bot + 40); c.lineTo(x, bot + 110); c.fill(); c.fillStyle = '#e8c46a'; c.beginPath(); c.arc(x, bot + 110, 6, 0, TAU); c.fill(); }
    // flower pots on the sill
    for (const x of [200, W - 200]) { c.fillStyle = '#c96a3a'; c.beginPath(); c.moveTo(x - 60, bot - 10); c.lineTo(x + 60, bot - 10); c.lineTo(x + 44, bot - 100); c.lineTo(x - 44, bot - 100); c.fill(); }
    void R;
  });
  // bandhani drapes tied back either side of the screen, and a pelmet across the top (live: they breathe)
  function drapesOf(c, k, t, base = '#d6336c') {
    const cloth = bandhani(k, base, 300, H, '-d');
    for (const d of [-1, 1]) {
      c.save(); if (d > 0) { c.translate(W, 0); c.scale(-1, 1); }
      c.beginPath(); c.moveTo(0, 0); c.lineTo(300 + Math.sin(t) * 6, 0); c.quadraticCurveTo(120, 700, 70, 1050); c.quadraticCurveTo(150, 1400, 210 + Math.sin(t * .8) * 8, H); c.lineTo(0, H); c.closePath(); c.save(); c.clip();
      c.drawImage(cloth, 0, 0, 300, H); const sh = c.createLinearGradient(0, 0, 300, 0); sh.addColorStop(0, 'rgba(0,0,0,.25)'); sh.addColorStop(.7, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.3)'); c.fillStyle = sh; c.fillRect(0, 0, 300, H); c.restore();
      // the tie-back: a gold tassel rope
      c.fillStyle = '#e8c46a'; c.beginPath(); c.ellipse(85, 1050, 46, 18, .2, 0, TAU); c.fill(); c.fillStyle = '#c2185b'; c.beginPath(); c.moveTo(80, 1060); c.lineTo(100, 1060); c.lineTo(110, 1180); c.lineTo(70, 1180); c.fill();
      c.restore();
    }
    const pel = bandhani(k, '#1f8a5a', W, 170, '-p');
    c.save(); c.beginPath(); c.moveTo(0, 0); c.lineTo(W, 0); c.lineTo(W, 110); for (let i = 8; i >= 0; i--) { const x = i * W / 8; c.quadraticCurveTo(x + W / 16, 190, x, 110); } c.closePath(); c.clip(); c.drawImage(pel, 0, 0, W, 170); c.restore();
    for (let i = 0; i <= 8; i++) { c.fillStyle = '#e8c46a'; c.beginPath(); c.arc(i * W / 8, 112, 10, 0, TAU); c.fill(); }
  }

  const nm = card => { const a = clean(card.host1), b = clean(card.host2); return { a, b, two: !!b }; };
  // a henna vine drawing itself round the screen edge: a frame that opens each function (p 0 … 1)
  const frameD = designOf('frame', D => {
    const m = 50, pts = [], add = (x, y) => pts.push([x, y]);
    for (let i = 0; i <= 60; i++) add(lerp(W / 2, W - m, i / 60), m + Math.sin(i * .9) * 10);
    for (let i = 0; i <= 120; i++) add(W - m + Math.sin(i * .9) * 10, lerp(m, H - m, i / 120));
    for (let i = 0; i <= 120; i++) add(lerp(W - m, m, i / 120), H - m + Math.sin(i * .9) * 10);
    for (let i = 0; i <= 120; i++) add(m + Math.sin(i * .9) * 10, lerp(H - m, m, i / 120));
    for (let i = 0; i <= 60; i++) add(lerp(m, W / 2, i / 60), m + Math.sin(i * .9) * 10);
    D.add(pts, 4);
    for (let i = 4; i < pts.length - 4; i += 9) { const [x, y] = pts[i], [x2, y2] = pts[i + 1], a = Math.atan2(y2 - y, x2 - x) + (i % 2 ? 1 : -1) * 1.2; D.add(petalPts(x, y, a, 2, 34, .45, 6), 3); }
  });
  const look = { names: '#a0284f', ink: '#3e1a10', ink2: '#5e3020', accent: '#1f7a50', gold: '#b8862b' };
  const GLASS = ['#e0405e', '#2a9d6f', '#ffb703', '#c2185b'];

  return {
    id: 'story-mehendi', order: 22, occasion: 'mehendi', tune: 'sufi', thumb: 6.2,
    name: 'Mehendi Lines', note: 'Henna draws itself stroke by stroke, a cone writes the names, a floral jharokha, bandhani tents and glowing lanterns',
    names: ['Noor', 'Reyansh'], ganesha: 'ganesha-07',
    looks: { open: 'mehendi-rani', title: 'mehendi-rani', invite: 'mehendi-rani', events: ['mehendi', 'mehendi-emerald', 'mehendi-sakura'], date: 'mehendi-rani', end: 'mehendi-rani', final: 'mehendi-midnight' },
    titles: [[/mehe?n?d|मेहँदी|मेहंदी/i, 'Henna & Hues'], [/folk|music|geet|गीत/i, 'Songs of the Soil'], [/chaat|dinner|bhoj|भोज/i, 'A Feast of Flavours'],
      [/haldi|हल्दी/i, 'Sunshine & Turmeric'], [/sangeet|dance|dj|संगीत/i, 'Rhythm & Rang'], [/phera|vivah|wedding|फेरे|विवाह/i, 'The Sacred Vows'],
      [/reception|स्वागत/i, 'An Evening of Elegance'], [/ring|engage|sagai|सगाई/i, 'The Promise'], [/puja|pooja|ganesh|पूजा/i, 'A Sacred Beginning']],
    look(kind, K) {
      const dark = kind === 'lanterns';
      const base = K.palette(dark ? 'mehendi-midnight' : 'mehendi-rani', { col: dark ? { names: '#ffd0e0', ink: '#fbf2e6', ink2: '#f0dccb', accent: '#9fe8c8', gold: '#e8c46a' } : look,
        font: { script: 'Satisfy', serif: 'Marcellus' }, shadow: dark ? ['rgba(10,4,20,.88)', 16] : ['rgba(255,250,240,.95)', 12] });
      return { ...base, scene: 'reel', fx: () => {} };
    },
    timeline(S) {
      const at = k => S.findIndex(s => s.k === k);
      S.splice(at('open'), 1, { k: 'reel', reel: 'mandala', name: 'Henna', d: 7.4 });
      const ti = S[at('title')]; Object.assign(ti, { reel: 'names', d: 7.2, cut: true, change: 'none', name: 'Written in Henna' }); delete ti.couple; delete ti.zone;
      Object.assign(S[at('invite')], { reel: 'jharokha', d: 7.5, change: 'none', board: false, zone: [560, 1560, 700] });
      if (at('end') >= 0) S.splice(at('end'), 1);
      const ev = S.filter(s => s.k === 'event');
      ev.forEach(s => { Object.assign(s, { reel: 'tent', datebar: true, board: 'arch', hang: false, cut: true, change: 'none', zone: [250, 1030, 720] }); delete s.couple; });
      const d = S.find(s => s.k === 'date'); if (d) Object.assign(d, { reel: 'scarf', change: 'none', board: false, zone: [430, 1520, 640], d: 5.6 });
      const f = S.find(s => s.k === 'final'); if (f) Object.assign(f, { reel: 'lanterns', d: 6, cut: true, change: 'sparkle', board: false, scrim: true, zone: [300, 1480, 800] });
      const fixed = S.filter(s => s.k !== 'event').reduce((a, s) => a + s.d, 0);
      ev.forEach(s => { s.d = clamp((59.4 - fixed) / Math.max(1, ev.length), 3.8, 5.6); });
    },
    shots: {
      mandala(c, s, pt, t, P) {
        const k = kOf(P), hi = hiOf(P), card = P.card;
        const bg = art('mh-paper', W, H, k, g => { const R = rng(2), gr = g.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 1200); gr.addColorStop(0, '#fbf1e2'); gr.addColorStop(1, '#efd7bc'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
          for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(140,80,40,${R() * .05})`; g.fillRect(R() * W, R() * H, 2, 2); } });
        const D = designOf('big', D => {
          mandalaInto(D, W / 2, 900, 390, 6, 1);
          // corner paisleys and a vine down to the foot
          for (const [x, y, a, f] of [[170, 250, .5, 1], [910, 250, -.5, -1], [170, 1640, 2.6, -1], [910, 1640, -2.6, 1]]) { paisleyInto(D, x, y, 70, a, f); paisleyInto(D, x, y, 44, a, f, true); }
          const vine = []; for (let i = 0; i <= 50; i++) { const u = i / 50; vine.push([W / 2 + Math.sin(u * 10) * 60, 1340 + u * 480]); } D.add(vine, 5);
          for (let i = 0; i < 9; i++) D.add(petalPts(W / 2 + Math.sin(i * 1.1) * 60, 1380 + i * 52, i % 2 ? 0 : Math.PI, 4, 56, .4, 8), 4);
        });
        const p = clamp((pt - .3) / 4.2), z = 1.18 - .18 * ease3(pt / s.d);
        c.drawImage(bg, 0, 0, W, H);
        c.save(); c.translate(W / 2, 900); c.scale(z, z); c.rotate((1 - ease3(pt / s.d)) * -.08); c.translate(-W / 2, -900);
        // a soft wash of colour fills in once the lines are done (henna drying darker)
        const fill = ease((pt - 4.6) / 1);
        if (fill > 0) { c.save(); c.globalAlpha = fill * .5; const g = c.createRadialGradient(W / 2, 900, 0, W / 2, 900, 440); g.addColorStop(0, 'rgba(194,24,91,.0)'); g.addColorStop(.75, 'rgba(194,24,91,.18)'); g.addColorStop(1, 'rgba(31,138,90,.25)'); c.fillStyle = g; c.beginPath(); c.arc(W / 2, 900, 440, 0, TAU); c.fill(); c.restore(); }
        const tip = drawDesign(c, D, p, fill > 0 ? mix(HENNA2, '#4a1a08', fill) : HENNA2);
        // the word in the heart of the mandala
        const wa = ease((pt - 4.4) / .9);
        if (wa > 0) {
          c.save(); c.globalAlpha = wa; c.fillStyle = 'rgba(251,241,226,.92)'; c.beginPath(); c.arc(W / 2, 900, 128, 0, TAU); c.fill(); c.restore();
          c.save(); c.globalAlpha = wa; c.textAlign = 'center'; c.textBaseline = 'middle';
          foil(c, hi ? 'मेहँदी' : 'Mehendi', W / 2, 892, { font: hi ? '92px "Yatra One"' : '96px "Satisfy"', dark: true, t });
          c.restore();
        }
        if (tip && p < 1) cone(c, tip[0], tip[1], t, 1);
        else if (tip) cone(c, lerp(tip[0], 1300, ease3((pt - 4.5) / 1)), lerp(tip[1], 1700, ease3((pt - 4.5) / 1)), t, 1 - ease((pt - 4.8) / .6));
        c.restore();
        // the names under it, and a line above
        const na = ease((pt - 5.2) / .9);
        if (na > 0) {
          const { a, b, two } = nm(card);
          c.save(); c.globalAlpha = na; c.textAlign = 'center'; c.textBaseline = 'middle';
          c.font = hi ? '44px "Tiro Devanagari Hindi"' : '36px "Marcellus"'; spacing(c, hi ? 0 : 10); c.fillStyle = '#5e3020'; c.fillText(hi ? 'रंग, रस्म और रौनक' : 'AN EVENING OF HENNA & HUES', W / 2, 330); spacing(c, 0);
          c.font = deva(card) ? '96px "Amita"' : '120px "Great Vibes"'; c.fillStyle = '#a0284f'; c.shadowColor = 'rgba(255,250,240,.95)'; c.shadowBlur = 12; c.fillText(two ? `${a} & ${b}` : a, W / 2, 1490 + (1 - na) * 20);
          c.restore();
        }
      },
      names(c, s, pt, t, P) {
        // the cone writes their names in henna on ivory silk, then a flourish curls under them
        const k = kOf(P), hi = hiOf(P), card = P.card, { a, b, two } = nm(card), dv = deva(card);
        const bg = art('mh-silk', W, H, k, g => {
          const R = rng(6), gr = g.createRadialGradient(W / 2, 900, 100, W / 2, 900, 1200); gr.addColorStop(0, '#fffaf0'); gr.addColorStop(1, '#f0dcc4'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
          g.globalAlpha = .05; for (let y = 0; y < H; y += 4) { g.fillStyle = y % 8 ? '#a07040' : '#ffffff'; g.fillRect(0, y, W, 1); } for (let x = 0; x < W; x += 5) { g.fillStyle = '#a07040'; g.fillRect(x, 0, 1, H); } g.globalAlpha = 1;
          for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(160,110,60,${R() * .05})`; g.fillRect(R() * W, R() * H, 2, 1); }
          // a rani-pink border with gold zari lines, top and bottom, a faint henna lace in the middle
          for (const y0 of [0, H - 150]) { g.drawImage(bandhani(k, '#c2185b', W, 150, '-band'), 0, y0, W, 150); g.fillStyle = '#e8c46a'; g.fillRect(0, y0 ? y0 : 140, W, 6); g.fillRect(0, y0 ? y0 + 14 : 126, W, 2); }
          g.globalAlpha = .1; K.henna(g, W / 2, 900, 470, '#8a3c16'); g.globalAlpha = 1;
          for (const [x, y, sd] of [[110, 260, 3], [W - 110, 260, 5], [110, H - 270, 6], [W - 110, H - 270, 8]]) g.drawImage(bunch(k, sd, 360, 260), x - 180, y - 130, 360, 260);
        });
        c.drawImage(bg, 0, 0, W, H);
        const z = 1.04 - .04 * ease3(pt / s.d); c.save(); c.translate(W / 2, 900); c.scale(z, z); c.translate(-W / 2, -900);
        // the lines to write, each in its own moment (the cone moves along the writing)
        const lines = two ? [[a, 172, 800], ['&', 90, 935], [b, 172, 1090]] : [[a, 190, 920]];
        const font = z2 => dv ? `${Math.round(z2 * .7)}px "Amita"` : `${z2}px "Great Vibes"`;
        let t0 = .5, tip = null;
        c.textAlign = 'left'; c.textBaseline = 'alphabetic';
        for (const [txt, fz, y] of lines) {
          c.font = font(fz); const w = c.measureText(txt).width, x0 = W / 2 - w / 2, dur = .5 + w / 520;
          const u = clamp((pt - t0) / dur);
          if (u > 0) {
            c.save(); c.beginPath(); c.rect(x0 - 40, y - fz, w * u + 40 + (u >= 1 ? 80 : 0), fz * 1.5); c.clip();
            c.fillStyle = 'rgba(255,255,255,.7)'; c.fillText(txt, x0 + 2, y + 3);
            c.fillStyle = HENNA; c.fillText(txt, x0, y);
            c.lineWidth = 1.2; c.strokeStyle = '#3a1406'; c.strokeText(txt, x0, y);
            c.restore();
            if (u < 1) tip = [x0 + w * u, y - fz * (.25 + .2 * Math.sin(pt * 22))];
          }
          t0 += dur + .15;
        }
        // the flourish: a henna swirl under the names and a small mandala above them
        const F = designOf('flourish', D => {
          const pts = []; for (let i = 0; i <= 90; i++) { const u = i / 90; pts.push([lerp(180, 900, u), 1200 + Math.sin(u * Math.PI * 3) * 22]); } D.add(pts, 4);
          for (let i = 1; i < 12; i++) { const u = i / 12, x = lerp(180, 900, u), y = 1200 + Math.sin(u * Math.PI * 3) * 22; D.add(petalPts(x, y, i % 2 ? -1.2 : 1.9, 3, 42, .45, 6), 3).fill(.9); }
          for (const x of [150, 930]) { D.add(circlePts(x, 1200, 16, 16), 3).fill(); for (let i = 0; i < 8; i++) D.add([[x + Math.cos(i / 8 * TAU) * 30, 1200 + Math.sin(i / 8 * TAU) * 30]], 3.4, true); }
          mandalaInto(D, W / 2, 530, 110, 3.4, 1);
        });
        const fp = clamp((pt - t0 + .1) / 1.8), ft = drawDesign(c, F, fp, HENNA2);
        if (!tip && fp > 0 && fp < 1) tip = ft;
        if (tip) cone(c, tip[0], tip[1], t, 1);
        c.restore();
        const ta = ease((pt - .3) / .8);
        c.save(); c.globalAlpha = ta; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = hi ? '46px "Tiro Devanagari Hindi"' : 'italic 54px "Cormorant Garamond"'; c.fillStyle = '#5e3020';
        c.fillText(hi ? 'मेहँदी के रंग में लिखे दो नाम' : 'Two names, written in henna', W / 2, 320); c.restore();
        const da = ease((pt - t0 - 1) / .8);
        if (da > 0) { c.save(); c.globalAlpha = da; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = hi ? '44px "Tiro Devanagari Hindi"' : '40px "Marcellus"'; spacing(c, hi ? 0 : 8); c.fillStyle = '#a0284f'; c.fillText(hi ? dateRange(card, true) : dateRange(card, false).toUpperCase(), W / 2, 1340); spacing(c, 0); c.restore(); }
        K.petals(c, t, 10, ['#ff9ab5', '#ffffff', '#c2185b'], 21);
      },
      jharokha(c, s, pt, t, P) {
        const k = kOf(P), z = 1.06 - .06 * ease3(pt / s.d);
        c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2);
        c.drawImage(jharokhaArt(k), 0, 0, W, H);
        // the couple at the window's foot, flower bunches on the sill
        const img = coupleImage(P, 'Mehendi'), ci = ease((pt - .3) / 1);
        const B = bunch(k, 3);
        c.drawImage(B, 60, 1440, 420, 300); c.drawImage(B, W - 480, 1440, 420, 300);
        c.restore();
        drapesOf(c, k, t, '#d6336c');
        for (const [x, len, s2, gi, ph] of [[230, 260, .8, 0, 0], [850, 300, .8, 1, 1.7], [540, 150, .6, 2, 3.1]]) hangLantern(c, k, x, 100, len, s2, GLASS[gi], t, ph);
        void img; void ci;
        K.petals(c, t, 12, ['#ff9ab5', '#ffffff', '#2a9d6f'], 31);
      },
      tent(c, s, pt, t, P) {
        const k = kOf(P), i = s.i || 0, base = ['#c2185b', '#1f8a5a', '#e07a1f'][i % 3], alt = ['#1f8a5a', '#c2185b', '#c2185b'][i % 3];
        const bg = art(`mh-tent-${i % 3}`, W, H, k, g => {
          // a canopy of alternating bandhani strips gathered to a crown, a dusk garden beyond, a durrie on the ground
          const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#3a1a3a'); sky.addColorStop(.5, '#a04a5a'); sky.addColorStop(1, '#f2b880'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
          const strips = [bandhani(k, base, 160, 900, '-s'), bandhani(k, alt, 160, 900, '-s')];
          for (let j = 0; j < 9; j++) { const x0 = j * 120 - 20; g.save(); g.beginPath(); g.moveTo(W / 2 - 20 + j * 5, -20); g.lineTo(W / 2 + 20 + j * 5, -20); g.lineTo(x0 + 150, 760); g.quadraticCurveTo(x0 + 75, 820, x0, 760); g.closePath(); g.clip(); g.drawImage(strips[j % 2], x0 - 10, -40, 170, 900); g.restore(); }
          g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, 740, W, 40);
          // scalloped valance with tassels
          for (let j = 0; j < 12; j++) { const x = j * 90; g.fillStyle = j % 2 ? '#e8c46a' : base; g.beginPath(); g.moveTo(x, 720); g.quadraticCurveTo(x + 45, 830, x + 90, 720); g.fill(); g.fillStyle = '#e8c46a'; g.beginPath(); g.moveTo(x + 40, 790); g.lineTo(x + 50, 790); g.lineTo(x + 54, 850); g.lineTo(x + 36, 850); g.fill(); }
          // the garden: trees with fairy lights at the back
          const R = rng(40 + i); for (let j = 0; j < 14; j++) K.foliage(g, R, j * 80, 980 + R() * 60, 90, 120, 50, 120, 22, 30, 35);
          for (let j = 0; j < 160; j++) { g.fillStyle = `rgba(255,${200 + R() * 50 | 0},140,${(.4 + R() * .5).toFixed(2)})`; g.beginPath(); g.arc(R() * W, 860 + R() * 260, 2 + R() * 3, 0, TAU); g.fill(); }
          // the ground: a durrie with stripes and gaddas (floor cushions) along the sides
          const fg = g.createLinearGradient(0, 1250, 0, H); fg.addColorStop(0, '#d98a5a'); fg.addColorStop(1, '#a0503a'); g.fillStyle = fg; g.fillRect(0, 1250, W, H - 1250);
          for (let j = 0; j < 10; j++) { const y = 1260 + (H - 1260) * (j / 10) ** 1.4; g.fillStyle = j % 2 ? 'rgba(255,230,180,.25)' : 'rgba(120,20,40,.25)'; g.fillRect(0, y, W, 14 + j * 3); }
          // brass urns with marigolds and roses at the front corners
          for (const x of [120, W - 120]) { const br = g.createLinearGradient(x - 80, 0, x + 80, 0); br.addColorStop(0, '#7a4a10'); br.addColorStop(.5, '#f2c24e'); br.addColorStop(1, '#7a4a10'); g.fillStyle = br; g.beginPath(); g.moveTo(x - 50, 1880); g.quadraticCurveTo(x - 110, 1760, x - 60, 1690); g.lineTo(x + 60, 1690); g.quadraticCurveTo(x + 110, 1760, x + 50, 1880); g.fill(); g.drawImage(bunch(k, 8, 300, 220), x - 150, 1540, 300, 220); }
        });
        const z = 1.06 - .06 * ease3(pt / s.d);
        c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2);
        c.drawImage(bg, 0, 0, W, H);
        for (const [x, len, gi, ph] of [[140, 380, 0, 0], [380, 300, 1, 1], [700, 320, 2, 2], [940, 400, 3, 3]]) hangLantern(c, k, x, 0, len, .7, GLASS[(gi + i) % 4], t, ph);
        const img = coupleImage(P, s.e && s.e.name ? (/mehe?n?d|मेहँदी|मेहंदी/i.test(s.e.name) ? s.e.name : `Mehendi ${s.e.name}`) : 'Mehendi'), ci = ease((pt - .4) / 1);
        if (img) { c.save(); c.globalAlpha = ci; K.cutout(c, img, W / 2, 1880 + (1 - ci) * 50, 760, 'full', P.shotLook ? P.shotLook('tent') : null, t); c.restore(); }
        c.restore();
        K.petals(c, t, 10, ['#ff9ab5', '#ffffff', '#ffd166'], 50 + i);
        // the henna vine draws itself round the edge as the function opens
        drawDesign(c, frameD, clamp(pt / 2.2), HENNA2);
      },
      scarf(c, s, pt, t, P) {
        const k = kOf(P);
        const bg = art('mh-scarf', W, H, k, g => {
          g.drawImage(bandhani(k, '#1f8a5a', W, H, '-sc'), 0, 0, W, H);
          // a cream card with a henna border and a rose-pink inner frame
          const x = 130, y = 300, w = W - 260, h = 1340;
          g.save(); g.shadowColor = 'rgba(0,30,10,.5)'; g.shadowBlur = 50; g.shadowOffsetY = 24; g.fillStyle = '#fffaf2'; rrect(g, x, y, w, h, 30); g.fill(); g.restore();
          g.strokeStyle = '#c2185b'; g.lineWidth = 4; rrect(g, x + 24, y + 24, w - 48, h - 48, 22); g.stroke(); g.lineWidth = 1.5; rrect(g, x + 36, y + 36, w - 72, h - 72, 18); g.stroke();
          g.strokeStyle = HENNA2; g.lineWidth = 3; g.lineCap = 'round';
          for (let i = 0; i < 40; i++) { const u = i / 40; for (const [px, py] of [[x + 60 + u * (w - 120), y + 70], [x + 60 + u * (w - 120), y + h - 70]]) { g.beginPath(); g.arc(px, py, 10, 0, Math.PI, py > y + h / 2); g.stroke(); } }
          for (const [cx, cy] of [[x + 40, y + 40], [x + w - 40, y + 40], [x + 40, y + h - 40], [x + w - 40, y + h - 40]]) { g.fillStyle = '#fffaf2'; g.beginPath(); g.arc(cx, cy, 70, 0, TAU); g.fill(); K.mandala(g, cx, cy, 64, HENNA2); }
          g.drawImage(bunch(k, 5, 420, 300), W / 2 - 210, y - 170, 420, 300);
          g.drawImage(bunch(k, 6, 420, 300), W / 2 - 210, y + h - 140, 420, 300);
        });
        const z = 1.05 - .05 * ease3(pt / s.d);
        c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2); c.drawImage(bg, 0, 0, W, H); c.restore();
        K.petals(c, t, 14, ['#ff9ab5', '#ffffff', '#c2185b'], 61);
        drawDesign(c, frameD, clamp(pt / 2), '#fff3d8');
      },
      lanterns(c, s, pt, t, P) {
        const k = kOf(P);
        const bg = art('mh-night', W, H, k, g => { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0c0a24'); gr.addColorStop(.6, '#2a1240'); gr.addColorStop(1, '#5a1a3a'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
          const R = rng(77); for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(255,250,230,${(R() * .7).toFixed(2)})`; g.beginPath(); g.arc(R() * W, R() * 1300, R() * 1.8 + .3, 0, TAU); g.fill(); }
          g.globalAlpha = .08; K.henna(g, W / 2, 900, 520, '#ffd0e0'); g.globalAlpha = 1;
          const R2 = rng(5); for (let j = 0; j < 16; j++) K.foliage(g, R2, j * 70, 1760 + R2() * 60, 80, 120, 40, 140, 12, 30, 30); });
        c.drawImage(bg, 0, 0, W, H);
        // lanterns rising slowly from the garden into the sky
        const R = rng(14);
        for (let i = 0; i < 16; i++) {
          const sp = 40 + R() * 50, y = 2000 - ((R() * 2200 + t * sp) % 2300), x = R() * W + Math.sin(t * .6 + i) * 30, s2 = .3 + R() * .35;
          c.drawImage(lantern(k, GLASS[i % 4]), x - 100 * s2, y - 190 * s2, 200 * s2, 380 * s2);
        }
        drapesOf(c, k, t, '#a0284f');
      },
    }
  };
})(Cinema.kit));
