// Mandir Darshan: a temple journey for a puja, kirtan or jagran. Up the stone steps at night as diyas light one by
// one, to the temple's glowing gate; great brass bells swing and a Ganesh shloka appears in Devanagari; red curtains
// part on Ganesh ji in a divine glow with the aarti circling; the invitation unrolls on a temple scroll; each
// ritual is engraved on a brass puja thali ringed by diyas; the temple lit for the evening; floating diyas and thank you.
Cinema.register((K => {
  const { W, H, TAU, rng, clamp, ease, ease3, lerp, art, glow, rrect, leaf, marigold, rose, lotus, lotusPad, kalash, diya, flame, mandala, foliage, blossom,
    clean, dateRange, ganeshaImage, camAt, camera, foil, spacing, goldBevel, bell, rays, lampBody, lampFlames } = K;
  const kOf = P => Math.min(1.25, Math.max(.5, P.k));
  const hiOf = P => P.opt.lang === 'hi';
  const TALL = 3000, GATE = { x: 540, y: 1330 };
  const SHLOKA = ['वक्रतुण्ड महाकाय', 'सूर्यकोटि समप्रभ ।', 'निर्विघ्नं कुरु मे देव', 'सर्वकार्येषु सर्वदा ॥'];

  function brassGrad(c, x0, x1) { const g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, '#6e440c'); g.addColorStop(.35, '#f5d47c'); g.addColorStop(.6, '#c48a2a'); g.addColorStop(1, '#5e380a'); return g; }
  // a big temple bell with a clapper, hanging from (0,0) on a chain of length len (drawn at the current origin)
  function bigBell(c, len, s, swing) {
    c.strokeStyle = '#8a5a14'; c.lineWidth = 6;
    for (let y = 0; y < len; y += 22) { c.beginPath(); c.ellipse(0, y + 11, 6, 11, 0, 0, TAU); c.stroke(); }
    c.save(); c.translate(0, len);
    c.fillStyle = brassGrad(c, -s * .2, s * .2); rrect(c, -s * .12, 0, s * .24, s * .14, 6); c.fill();
    c.save(); c.translate(0, s * .9); c.rotate(-swing * .8); c.fillStyle = '#5e380a'; c.fillRect(-4, -s * .7, 8, s * .62); c.beginPath(); c.arc(0, -s * .06, s * .09, 0, TAU); c.fill(); c.restore();
    c.fillStyle = brassGrad(c, -s * .55, s * .55);
    c.beginPath(); c.moveTo(-s * .2, s * .12); c.bezierCurveTo(-s * .42, s * .2, -s * .4, s * .6, -s * .58, s * .9); c.lineTo(s * .58, s * .9); c.bezierCurveTo(s * .4, s * .6, s * .42, s * .2, s * .2, s * .12); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,240,190,.5)'; c.beginPath(); c.ellipse(-s * .18, s * .45, s * .05, s * .28, .15, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(90,50,8,.6)'; c.lineWidth = 3; for (const k of [.32, .7]) { c.beginPath(); c.moveTo(-s * (.3 + k * .3), s * k + s * .1); c.lineTo(s * (.3 + k * .3), s * k + s * .1); c.stroke(); }
    c.fillStyle = brassGrad(c, -s * .6, s * .6); c.beginPath(); c.ellipse(0, s * .9, s * .6, s * .08, 0, 0, TAU); c.fill();
    c.restore();
  }
  // a North-Indian shikhara temple with its mandapa and an arched, glowing gate (centre x, ground y, scale s)
  function temple(c, x, y, s, lit) {
    const tg = (x0, x1) => { const g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, '#7a3a1a'); g.addColorStop(.45, '#f0b878'); g.addColorStop(1, '#6a2e12'); return g; };
    // the shikhara: a curved tower with ribs, the amalaka and kalash on top, a saffron flag
    const tw = 300 * s, th = 620 * s, ty = y - 420 * s;
    c.fillStyle = tg(x - tw / 2, x + tw / 2); c.beginPath(); c.moveTo(x - tw / 2, ty); c.bezierCurveTo(x - tw * .5, ty - th * .6, x - tw * .18, ty - th * .95, x, ty - th); c.bezierCurveTo(x + tw * .18, ty - th * .95, x + tw * .5, ty - th * .6, x + tw / 2, ty); c.fill();
    c.strokeStyle = 'rgba(80,30,8,.45)'; c.lineWidth = 3 * s;
    for (let i = 1; i < 12; i++) { const u = i / 12, yy = ty - th * u * .96, hw = tw / 2 * Math.sqrt(1 - u ** 1.6); c.beginPath(); c.moveTo(x - hw, yy); c.quadraticCurveTo(x, yy + 10 * s, x + hw, yy); c.stroke(); }
    for (const k of [-.25, 0, .25]) { c.beginPath(); c.moveTo(x + k * tw, ty); c.quadraticCurveTo(x + k * tw * .9, ty - th * .5, x + k * tw * .2, ty - th * .95); c.stroke(); }
    // two smaller towers either side
    for (const d of [-1, 1]) { const sx = x + d * 230 * s, sw = 150 * s, sh = 300 * s, sy = y - 360 * s; c.fillStyle = tg(sx - sw / 2, sx + sw / 2); c.beginPath(); c.moveTo(sx - sw / 2, sy); c.bezierCurveTo(sx - sw / 2, sy - sh * .6, sx - sw * .15, sy - sh * .95, sx, sy - sh); c.bezierCurveTo(sx + sw * .15, sy - sh * .95, sx + sw / 2, sy - sh * .6, sx + sw / 2, sy); c.fill();
      for (let i = 1; i < 7; i++) { const u = i / 7, yy = sy - sh * u * .95, hw = sw / 2 * Math.sqrt(1 - u ** 1.6); c.beginPath(); c.moveTo(sx - hw, yy); c.quadraticCurveTo(sx, yy + 6 * s, sx + hw, yy); c.stroke(); }
      c.fillStyle = '#e0a860'; c.beginPath(); c.ellipse(sx, sy - sh, 22 * s, 9 * s, 0, 0, TAU); c.fill(); }
    c.fillStyle = '#f0c080'; c.beginPath(); c.ellipse(x, ty - th, 44 * s, 16 * s, 0, 0, TAU); c.fill();
    c.fillStyle = goldBevel(c, x - 20 * s, 0, x + 20 * s, 0); c.beginPath(); c.ellipse(x, ty - th - 34 * s, 22 * s, 26 * s, 0, 0, TAU); c.fill(); c.fillRect(x - 3 * s, ty - th - 120 * s, 6 * s, 90 * s);
    // the mandapa: a wide hall on pillars, with a stepped roof
    const mw = 700 * s, my = y - 420 * s;
    c.fillStyle = tg(x - mw / 2, x + mw / 2); c.beginPath(); c.moveTo(x - mw / 2, my + 10 * s); c.lineTo(x - mw * .42, my - 60 * s); c.lineTo(x + mw * .42, my - 60 * s); c.lineTo(x + mw / 2, my + 10 * s); c.fill();
    c.fillStyle = '#5a2410'; c.fillRect(x - mw / 2, my, mw, 26 * s);
    c.fillStyle = '#e9c08a'; c.fillRect(x - mw / 2 + 10 * s, my + 26 * s, mw - 20 * s, 400 * s);
    for (let i = 0; i <= 6; i++) { const px = x - mw / 2 + 40 * s + i * (mw - 80 * s) / 6; c.fillStyle = tg(px - 18 * s, px + 18 * s); c.fillRect(px - 18 * s, my + 30 * s, 36 * s, 390 * s); c.fillStyle = '#c0884a'; c.fillRect(px - 26 * s, my + 30 * s, 52 * s, 20 * s); c.fillRect(px - 26 * s, my + 400 * s, 52 * s, 20 * s); }
    // the gate: an arch full of warm light
    const gw = 170 * s, gh = 330 * s, gy = y;
    c.fillStyle = '#3a1206'; c.beginPath(); c.moveTo(x - gw / 2 - 16 * s, gy); c.lineTo(x - gw / 2 - 16 * s, gy - gh + gw / 2); c.arc(x, gy - gh + gw / 2, gw / 2 + 16 * s, Math.PI, 0); c.lineTo(x + gw / 2 + 16 * s, gy); c.fill();
    const lg = c.createRadialGradient(x, gy - gh * .4, 10, x, gy - gh * .4, gh); lg.addColorStop(0, '#fff6d0'); lg.addColorStop(.5, '#ffc060'); lg.addColorStop(1, '#c0501a');
    c.fillStyle = lg; c.beginPath(); c.moveTo(x - gw / 2, gy); c.lineTo(x - gw / 2, gy - gh + gw / 2); c.arc(x, gy - gh + gw / 2, gw / 2, Math.PI, 0); c.lineTo(x + gw / 2, gy); c.fill();
    if (lit) glow(c, x, gy - gh * .4, gh * 1.4, 'rgba(255,200,110,.45)');
    // strings of lights along the roof lines
    c.fillStyle = '#fff0b0';
    for (let i = 0; i <= 30; i++) { const u = i / 30; c.beginPath(); c.arc(x - mw / 2 + mw * u, my - 2 * s, 4 * s, 0, TAU); c.fill(); }
    for (let i = 0; i <= 24; i++) { const u = i / 24, a = u * Math.PI; const px = x - Math.cos(a) * tw / 2 * (1 - u * .0), py = ty - Math.sin(a) * 0; c.beginPath(); c.arc(x - tw / 2 + tw * u, ty, 4 * s, 0, TAU); c.fill(); }
  }

  // ---- still art ----
  // the night: sky, temple at the top of a long flight of stone steps, trees (1080 × 3000)
  function nightArt(k) {
    return art('md-night', W, TALL, k, c => {
      const R = rng(3);
      const sg = c.createLinearGradient(0, 0, 0, 1500); sg.addColorStop(0, '#070a24'); sg.addColorStop(.6, '#2a1a4a'); sg.addColorStop(1, '#8a3a2a'); c.fillStyle = sg; c.fillRect(0, 0, W, TALL);
      for (let i = 0; i < 320; i++) { c.fillStyle = `rgba(255,255,255,${R() * .9})`; c.beginPath(); c.arc(R() * W, R() * 1100, R() * 2.2, 0, TAU); c.fill(); }
      glow(c, 860, 240, 220, 'rgba(255,240,210,.35)'); c.fillStyle = '#fff4dc'; c.beginPath(); c.arc(860, 240, 64, 0, TAU); c.fill(); c.fillStyle = '#2a1a4a'; c.beginPath(); c.arc(886, 222, 58, 0, TAU); c.fill();
      glow(c, 540, 1100, 700, 'rgba(255,170,90,.3)');
      temple(c, 540, GATE.y, 1, true);
      // the plinth and the steps, widening towards us
      c.fillStyle = '#6a3018'; c.fillRect(120, GATE.y, 840, 60);
      const top = GATE.y + 60, bot = TALL, n = 22;
      for (let i = 0; i < n; i++) {
        const u0 = i / n, u1 = (i + 1) / n, y0 = lerp(top, bot, u0 ** 1.25), y1 = lerp(top, bot, u1 ** 1.25), w0 = lerp(360, 1300, u0), w1 = lerp(360, 1300, u1);
        const rise = (y1 - y0) * .42;
        c.fillStyle = i % 2 ? '#b8865a' : '#c29262'; c.beginPath(); c.moveTo(540 - w0 / 2, y0); c.lineTo(540 + w0 / 2, y0); c.lineTo(540 + w1 / 2, y1 - rise); c.lineTo(540 - w1 / 2, y1 - rise); c.fill();
        c.fillStyle = '#7a4a2a'; c.fillRect(540 - w1 / 2, y1 - rise, w1, rise);
        const sh = c.createLinearGradient(0, y1 - rise, 0, y1); sh.addColorStop(0, 'rgba(0,0,0,.05)'); sh.addColorStop(1, 'rgba(0,0,0,.3)'); c.fillStyle = sh; c.fillRect(540 - w1 / 2, y1 - rise, w1, rise);
      }
      // a red runner down the middle of the steps, gold-edged, strewn with marigold petals
      c.fillStyle = '#9a1020'; c.beginPath(); c.moveTo(540 - 70, top); c.lineTo(540 + 70, top); c.lineTo(540 + 260, bot); c.lineTo(540 - 260, bot); c.fill();
      c.strokeStyle = '#e8b84a'; c.lineWidth = 6; c.beginPath(); c.moveTo(540 - 62, top); c.lineTo(540 - 245, bot); c.moveTo(540 + 62, top); c.lineTo(540 + 245, bot); c.stroke();
      for (let i = 0; i < 260; i++) { const u = R() ** .8, y = lerp(top, bot, u), hw = lerp(360, 1300, u) / 2 * .9; c.fillStyle = R() > .5 ? '#ff9800' : '#ffc107'; c.beginPath(); c.ellipse(540 + (R() - .5) * 2 * hw, y, 4 + u * 9, 2 + u * 5, R() * 3, 0, TAU); c.fill(); }
      const dark = c.createLinearGradient(0, top, 0, bot); dark.addColorStop(0, 'rgba(10,4,20,.15)'); dark.addColorStop(1, 'rgba(10,4,20,.55)'); c.fillStyle = dark;
      c.beginPath(); c.moveTo(540 - 180, top); c.lineTo(540 + 180, top); c.lineTo(540 + 650, bot); c.lineTo(540 - 650, bot); c.fill();
      // banyan and palm silhouettes either side
      for (const d of [-1, 1]) for (let i = 0; i < 9; i++) { const x = 540 + d * (380 + i * 40 + R() * 60), y = GATE.y + 140 + i * 160; c.fillStyle = `rgba(14,8,24,${.85 + R() * .15})`; for (let j = 0; j < 7; j++) { c.beginPath(); c.arc(x + d * R() * 160, y - R() * 220, 90 + R() * 80, 0, TAU); c.fill(); } }
      for (const d of [-1, 1]) { c.strokeStyle = '#0c0614'; c.lineWidth = 18; c.beginPath(); c.moveTo(540 + d * 470, GATE.y + 300); c.quadraticCurveTo(540 + d * 500, GATE.y - 100, 540 + d * 450, GATE.y - 380); c.stroke();
        c.fillStyle = '#0c0614'; for (let j = 0; j < 9; j++) { c.save(); c.translate(540 + d * 450, GATE.y - 380); c.rotate(j / 9 * TAU); c.beginPath(); c.ellipse(110, 0, 120, 18, .3, 0, TAU); c.fill(); c.restore(); } }
    });
  }
  // the step diyas: positions on the steps' edges (screen units of the night art)
  const STEP_DIYAS = (() => { const out = [], top = GATE.y + 60; for (let i = 1; i < 22; i += 2) { const u = i / 22, y = lerp(top, TALL, u ** 1.25), w = lerp(360, 1300, u); out.push([540 - w / 2 + 50 + u * 40, y, 26 + u * 44], [540 + w / 2 - 50 - u * 40, y, 26 + u * 44]); } return out; })();

  // the sanctum: a carved gold arch over a deep red wall, pillars, a marble seat (Ganesh ji is drawn live)
  function sanctumArt(k) {
    return art('md-sanctum', W, H, k, c => {
      const R = rng(11);
      const g = c.createRadialGradient(540, 760, 60, 540, 900, 1300); g.addColorStop(0, '#c44a1a'); g.addColorStop(.5, '#6a1208'); g.addColorStop(1, '#1e0402'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.globalAlpha = .18; for (let y = 0; y < H; y += 150) for (let x = (y / 150 % 2) * 75; x < W + 75; x += 150) { K.paisley(c, x, y, 40, 0, '#f2c76b'); } c.globalAlpha = 1;
      // the carved arch
      const arch = (inset, col, lw) => { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(150 + inset, 1560); c.lineTo(150 + inset, 620); c.bezierCurveTo(150 + inset, 380, 330, 300, 540, 200 + inset); c.bezierCurveTo(750, 300, 930 - inset, 380, 930 - inset, 620); c.lineTo(930 - inset, 1560); c.stroke(); };
      arch(0, goldBevel(c, 150, 200, 930, 1560), 26); arch(30, 'rgba(242,199,107,.7)', 4); arch(-24, 'rgba(242,199,107,.5)', 3);
      for (let i = 0; i < 26; i++) { const u = i / 25, a = Math.PI * (1 - u); const x = 540 - Math.cos(a) * 380, y = 560 - Math.sin(a) * 300; leaf(c, x, y, 40, 14, -Math.PI / 2 + (u - .5) * 2.2, '#d9a640', false); }
      // pillars
      for (const x of [95, 985]) { c.fillStyle = brassGrad(c, x - 42, x + 42); c.fillRect(x - 36, 420, 72, 1200); for (let y = 460; y < 1600; y += 170) { c.fillStyle = goldBevel(c, x - 50, y, x + 50, y + 26); c.fillRect(x - 48, y, 96, 24); } }
      // the marble seat
      c.fillStyle = '#f6efe2'; c.fillRect(260, 1240, 560, 80); c.fillStyle = '#e2d6c0'; c.fillRect(230, 1320, 620, 60); c.fillStyle = goldBevel(c, 230, 0, 850, 0); c.fillRect(230, 1316, 620, 8);
      for (let i = 0; i < 14; i++) { c.fillStyle = i % 2 ? '#c4161c' : '#ffb300'; c.beginPath(); c.moveTo(270 + i * 40, 1240); c.lineTo(290 + i * 40, 1280); c.lineTo(310 + i * 40, 1240); c.fill(); }
      // marigold garlands hanging in the arch
      for (const d of [-1, 1]) for (let j = 0; j < 22; j++) marigold(c, 540 + d * (170 + Math.sin(j / 21 * Math.PI) * 130), 260 + j * 40, 15, j % 2 ? 40 : 28);
      // floor
      const fl = c.createLinearGradient(0, 1380, 0, H); fl.addColorStop(0, '#3a1206'); fl.addColorStop(1, '#120402'); c.fillStyle = fl; c.fillRect(0, 1380, W, H - 1380);
      for (let i = 0; i < 60; i++) { c.fillStyle = `rgba(255,${120 + R() * 80},40,.5)`; c.beginPath(); c.ellipse(R() * W, 1460 + R() * 440, 10, 5, R() * 3, 0, TAU); c.fill(); }
    });
  }
  // red velvet curtain (one side, 560 × 1920)
  function curtainArt(k) {
    return art('md-curtain', 560, H, k, c => {
      const g = c.createLinearGradient(0, 0, 560, 0); for (let i = 0; i <= 14; i++) g.addColorStop(i / 14, i % 2 ? '#5a0610' : '#a8142a'); c.fillStyle = g; c.fillRect(0, 0, 560, H);
      const sh = c.createLinearGradient(0, 0, 0, H); sh.addColorStop(0, 'rgba(0,0,0,.4)'); sh.addColorStop(.3, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.35)'); c.fillStyle = sh; c.fillRect(0, 0, 560, H);
      c.fillStyle = goldBevel(c, 0, H - 120, 560, H); c.fillRect(0, H - 110, 560, 26); for (let x = 10; x < 560; x += 28) { c.beginPath(); c.moveTo(x, H - 84); c.lineTo(x + 14, H - 40); c.lineTo(x + 28, H - 84); c.fill(); }
    });
  }
  // the temple scroll's paper (unrolls) and its rollers
  function scrollArt(k) {
    return art('md-scroll', 860, 1300, k, c => {
      const R = rng(4);
      const g = c.createLinearGradient(0, 0, 860, 0); g.addColorStop(0, '#e9d2a2'); g.addColorStop(.12, '#fbf0d8'); g.addColorStop(.88, '#fbf0d8'); g.addColorStop(1, '#e2c690'); c.fillStyle = g; c.fillRect(0, 0, 860, 1300);
      for (let i = 0; i < 2500; i++) { c.fillStyle = `rgba(150,100,40,${R() * .06})`; c.fillRect(R() * 860, R() * 1300, 3, 3); }
      c.strokeStyle = '#b0201a'; c.lineWidth = 14; c.strokeRect(34, 30, 792, 1240); c.strokeStyle = goldBevel(c, 0, 0, 860, 1300); c.lineWidth = 4; c.strokeRect(56, 52, 748, 1196);
      for (let x = 70; x < 800; x += 36) { c.fillStyle = '#c9952e'; c.beginPath(); c.moveTo(x, 60); c.lineTo(x + 18, 76); c.lineTo(x + 36, 60); c.fill(); c.beginPath(); c.moveTo(x, 1240); c.lineTo(x + 18, 1224); c.lineTo(x + 36, 1240); c.fill(); }
      c.globalAlpha = .12; mandala(c, 430, 650, 520, '#b0201a'); c.globalAlpha = 1;
    });
  }
  function roller(c, y, w) {
    c.fillStyle = 'rgba(0,0,0,.35)'; rrect(c, 540 - w / 2, y - 18, w, 52, 26); c.fill();
    const g = c.createLinearGradient(0, y - 26, 0, y + 26); g.addColorStop(0, '#5a1a08'); g.addColorStop(.4, '#c4561e'); g.addColorStop(1, '#3a0e04'); c.fillStyle = g; rrect(c, 540 - w / 2, y - 26, w, 52, 26); c.fill();
    for (const d of [-1, 1]) { c.fillStyle = goldBevel(c, 540 + d * w / 2 - 30, y - 30, 540 + d * w / 2 + 30, y + 30); c.beginPath(); c.arc(540 + d * (w / 2 + 14), y, 30, 0, TAU); c.fill(); }
  }
  // a big engraved brass thali (top view), 1000 × 1000
  function thaliArt(k) {
    return art('md-thali', 1000, 1000, k, c => {
      const g = c.createRadialGradient(400, 380, 40, 500, 500, 500); g.addColorStop(0, '#fff2c0'); g.addColorStop(.35, '#e9b850'); g.addColorStop(.75, '#b07a22'); g.addColorStop(.94, '#f2d27a'); g.addColorStop(1, '#6e440c');
      c.fillStyle = g; c.beginPath(); c.arc(500, 500, 496, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(110,64,8,.6)'; c.lineWidth = 3; for (const r of [470, 452, 380, 372]) { c.beginPath(); c.arc(500, 500, r, 0, TAU); c.stroke(); }
      for (let i = 0; i < 48; i++) { c.save(); c.translate(500, 500); c.rotate(i / 48 * TAU); c.beginPath(); c.moveTo(0, -455); c.quadraticCurveTo(14, -425, 0, -388); c.quadraticCurveTo(-14, -425, 0, -455); c.stroke(); c.restore(); }
      c.globalAlpha = .55; mandala(c, 500, 500, 360, 'rgba(110,64,8,.5)'); c.globalAlpha = 1;
      const hl = c.createRadialGradient(330, 300, 10, 330, 300, 420); hl.addColorStop(0, 'rgba(255,255,240,.55)'); hl.addColorStop(1, 'rgba(255,255,240,0)'); c.fillStyle = hl; c.beginPath(); c.arc(500, 500, 490, 0, TAU); c.fill();
      // a pale centre so words read on it
      const cg = c.createRadialGradient(500, 500, 40, 500, 500, 360); cg.addColorStop(0, 'rgba(255,248,226,.9)'); cg.addColorStop(.85, 'rgba(255,240,200,.75)'); cg.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = cg; c.beginPath(); c.arc(500, 500, 370, 0, TAU); c.fill();
    });
  }
  function velvetArt(k) {
    return art('md-velvet', W, H, k, c => {
      const R = rng(9);
      const g = c.createRadialGradient(540, 960, 100, 540, 960, 1200); g.addColorStop(0, '#8a1420'); g.addColorStop(1, '#2a0408'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 220; i++) { const x = R() * W, y = R() * H; if (Math.hypot(x - 540, y - 960) < 520) continue; c.fillStyle = R() > .5 ? '#ff9800' : '#ffc107'; c.globalAlpha = .9; c.beginPath(); c.ellipse(x, y, 12, 7, R() * 3, 0, TAU); c.fill(); }
      c.globalAlpha = 1;
      for (let i = 0; i < 40; i++) { const x = R() * W, y = R() * H; if (Math.hypot(x - 540, y - 960) < 540) continue; rose(c, x, y, 12, '#ff6b8a', '#9a0d24', R() * 3); }
      for (let i = 0; i < 14; i++) { const x = R() * W, y = R() * H; if (Math.hypot(x - 540, y - 960) < 560) continue; marigold(c, x, y, 26, R() > .5 ? 40 : 28); }
    });
  }
  // the lotus pond at night for the floating diyas
  function pondArt(k) {
    return art('md-pond', W, H, k, c => {
      const R = rng(21);
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0a0c2a'); g.addColorStop(.42, '#2a1a4a'); g.addColorStop(.5, '#3a1a3a'); g.addColorStop(1, '#0a0a20'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 200; i++) { c.fillStyle = `rgba(255,255,255,${R() * .8})`; c.beginPath(); c.arc(R() * W, R() * 800, R() * 2, 0, TAU); c.fill(); }
      c.save(); c.globalAlpha = .9; temple(c, 540, 960, .62, true); c.restore();
      c.save(); c.translate(0, 1920); c.scale(1, -.5); c.globalAlpha = .28; temple(c, 540, 1920 - 960 + 960 * 0, .62, true); c.restore();
      const wg = c.createLinearGradient(0, 960, 0, H); wg.addColorStop(0, 'rgba(20,10,40,.4)'); wg.addColorStop(1, 'rgba(5,5,20,.85)'); c.fillStyle = wg; c.fillRect(0, 960, W, H - 960);
      for (let i = 0; i < 26; i++) { const x = R() * W, y = 1000 + R() * 900; lotusPad(c, x, y, 30 + R() * 30, 12, R()); if (i % 3 === 0) lotus(c, x, y - 6, 40, .9); }
    });
  }

  function shlokaBlock(c, P, y, pt, t) {
    SHLOKA.forEach((ln, i) => {
      const a = ease((pt - .6 - i * .45) / .8);
      if (a < .01) return;
      c.save(); c.globalAlpha = a; foil(c, ln, W / 2, y + i * 104 + (1 - a) * 20, { font: '78px "Yatra One"', t }); c.restore();
    });
    if (!hiOf(P)) {
      const a = ease((pt - 2.7) / .8);
      if (a > .01) { c.save(); c.globalAlpha = a; c.fillStyle = '#ffe9c0'; c.font = 'italic 40px "Cormorant Garamond"'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText('O Lord of the curved trunk, radiant as a million suns,', W / 2, y + 450); c.fillText('remove every obstacle from all we begin', W / 2, y + 500); c.restore(); }
    }
  }
  function nameBlock(c, P, y, a, t) {
    const card = P.card, hi = hiOf(P), two = clean(card.host2), name = two ? `${clean(card.host1)} & ${clean(card.host2)}` : clean(card.host1);
    c.save(); c.globalAlpha = a; c.textAlign = 'center'; c.textBaseline = 'middle';
    const sg = c.createLinearGradient(0, y - 160, 0, y + 280); sg.addColorStop(0, 'rgba(20,4,0,0)'); sg.addColorStop(.3, 'rgba(20,4,0,.55)'); sg.addColorStop(.75, 'rgba(20,4,0,.55)'); sg.addColorStop(1, 'rgba(20,4,0,0)'); c.fillStyle = sg; c.fillRect(0, y - 160, W, 440);
    c.fillStyle = '#ffd9a0'; c.font = hi ? '44px "Tiro Devanagari Hindi"' : '34px "Cinzel"'; spacing(c, hi ? 0 : 8);
    c.fillText(hi ? (K.HI.label[card.type] || 'पूजा एवं अनुष्ठान') : `${(clean(card.title) || 'With the blessings of the Almighty')}`.toUpperCase(), W / 2, y - 100, 960); spacing(c, 0);
    let fs = 112; c.font = `${fs}px "Great Vibes"`; while (c.measureText(name).width > 960 && fs > 60) { fs -= 4; c.font = `${fs}px "Great Vibes"`; }
    foil(c, name, W / 2, y, { font: `${fs}px "Great Vibes"`, t });
    const when = dateRange(card, hi);
    if (when) { c.fillStyle = '#fff2dc'; c.font = hi ? '42px "Tiro Devanagari Hindi"' : '38px "Cinzel"'; spacing(c, hi ? 0 : 6); c.fillText(hi ? when : when.toUpperCase(), W / 2, y + 110); spacing(c, 0); }
    c.restore();
  }
  const fade = (pt, d, a0 = .3, l = .8) => ease((pt - a0) / l) * (1 - ease((pt - (d - .5)) / .5));

  return {
    id: 'story-mandir', order: 22, occasion: 'ceremony', tune: 'sitar', thumb: 16,
    name: 'Mandir Darshan', note: 'Up the temple steps as diyas light one by one, bells swing to a Ganesh shloka, the curtains part on Ganesh ji, and every ritual on a brass puja thali',
    names: ['The Joshi Family', ''], ganesha: 'ganesha-01',
    looks: { open: 'temple-lamps', title: 'temple-lamps', invite: 'temple-lamps', events: ['temple-lamps'], date: 'temple-lamps', end: 'temple-lamps', final: 'temple-lamps' },
    titles: [[/puja|pooja|ganesh|पूजा|गणेश/i, 'Shubh Aarambh'], [/havan|hawan|yagya|हवन|यज्ञ/i, 'Pavitra Agni'], [/kirtan|bhajan|sandhya|कीर्तन|भजन/i, 'An Evening of Bhajans'],
      [/jagran|chowki|mata|जागरण|चौकी|माता/i, 'Jai Mata Di'], [/katha|satyanarayan|कथा/i, 'The Sacred Katha'], [/bhoj|lunch|dinner|prasad|langar|भोज|प्रसाद|लंगर/i, 'Prasad & Bhoj'], [/aarti|आरती/i, 'Maha Aarti']],
    look(kind, K) {
      if (kind === 'scroll' || kind === 'plate') return K.palette('temple-golden', { font: { script: 'Great Vibes', serif: 'Gilda Display' }, col: { names: '#8a1420', ink: '#3b1a08', ink2: '#5a3416', accent: '#9a4a12', gold: '#b8862b' }, fx: (c, t) => K.motes(c, t, 10, 'rgba(255,214,140,A)', 7, 10) });
      return K.palette('temple-lamps', { font: { script: 'Great Vibes', serif: 'Gilda Display' }, fx: (c, t) => K.motes(c, t, 12, 'rgba(255,200,120,A)', 3, 14) });
    },
    timeline(S) {
      const at = k => S.findIndex(s => s.k === k);
      S.splice(at('open'), 1, { k: 'reel', reel: 'steps', name: 'The Steps', d: 7 }, { k: 'reel', reel: 'bells', name: 'The Bells', d: 6, cut: true });
      const ti = S[at('title')]; Object.assign(ti, { reel: 'sanctum', d: 6.5, change: 'none', cut: true }); delete ti.couple; delete ti.zone;
      Object.assign(S[at('invite')], { reel: 'scroll', d: 7, board: false, zone: [420, 1460, 700], change: 'bloom' });
      if (at('end') >= 0) S.splice(at('end'), 1);
      const evs = S.filter(s => s.k === 'event'), fixed = S.filter(s => s.k !== 'event').reduce((a, s) => a + s.d, 0);
      const d = evs.length ? clamp((59 - fixed) / evs.length, 3.6, 4.8) : 0;
      evs.forEach((s, i) => { Object.assign(s, { reel: 'plate', d, datebar: true, board: false, zone: [600, 1330, 600], change: i ? 'sparkle' : 'bloom' }); delete s.couple; delete s.coupleEntry; });
      const dt = S[at('date')]; if (dt) Object.assign(dt, { reel: 'evening', board: 'arch', tone: 'cream', zone: [170, 1050, 800], change: 'bloom' });
      const fi = S[at('final')]; if (fi) Object.assign(fi, { reel: 'pond', change: 'sparkle', board: 'carved', tone: 'cream', zone: [300, 1450, 760] });
    },
    shots: {
      steps(c, s, pt, t, P) {
        const k = kOf(P), hi = hiOf(P);
        const zIn = 3.2, into = clamp((pt - 4.6) / (s.d - 4.6)) ** 2;
        let cam = camAt(pt, [[0, { x: 540, y: 2050, z: 1.05 }], [4.6, { x: 540, y: 1180, z: 1 }]]);
        cam = { x: 540, y: lerp(cam.y, GATE.y - 140, into), z: lerp(1, zIn, into) };
        c.save(); camera(c, cam);
        c.drawImage(nightArt(k), 0, 0, W, TALL);
        // the diyas on the steps light as we climb past them (nearest first)
        STEP_DIYAS.forEach(([x, y, sz]) => { if (y > cam.y - 320) diya(c, x, y, sz, t + x * .01); });
        // flags on the shikhara and lamps in the mandapa flicker
        const fy = GATE.y - 420 - 620 - 120;
        c.fillStyle = '#ff7a1a'; c.beginPath(); c.moveTo(543, fy); for (let i = 0; i <= 8; i++) c.lineTo(543 + i * 14, fy + 8 + Math.sin(t * 6 - i * .8) * 6 + i * 1.5); c.lineTo(543 + 112, fy + 34); for (let i = 8; i >= 0; i--) c.lineTo(543 + i * 14, fy + 50 + Math.sin(t * 6 - i * .8) * 6 - i * 1.5); c.fill();
        for (let i = 0; i < 7; i++) flame(c, 300 + i * 80, GATE.y - 8, 14, t, i);
        c.restore();
        const a = fade(pt, 4.8, .15, .8);
        if (a > .01) {
          c.save(); c.globalAlpha = a; const g = c.createLinearGradient(0, 1200, 0, H); g.addColorStop(0, 'rgba(8,4,20,0)'); g.addColorStop(1, 'rgba(8,4,20,.75)'); c.fillStyle = g; c.fillRect(0, 1200, W, H - 1200);
          foil(c, hi ? 'ॐ श्री गणेशाय नमः' : 'Shubh Aarambh', W / 2, 1560, { font: hi ? '96px "Yatra One"' : '130px "Great Vibes"', t });
          c.fillStyle = '#ffe2b0'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = hi ? '44px "Tiro Devanagari Hindi"' : '34px "Cinzel"'; spacing(c, hi ? 0 : 8);
          c.fillText(hi ? 'प्रभु के द्वार, आपका स्वागत है' : 'A JOURNEY TO THE DIVINE', W / 2, 1680); spacing(c, 0); c.restore();
        }
        if (into > .55) { c.fillStyle = `rgba(255,214,150,${((into - .55) / .45 * .9).toFixed(2)})`; c.fillRect(0, 0, W, H); }
      },
      bells(c, s, pt, t, P) {
        const k = kOf(P);
        const bg = art('md-bellbg', W, H, k, g => {
          const gg = g.createRadialGradient(540, 1100, 80, 540, 1000, 1300); gg.addColorStop(0, '#7a2a10'); gg.addColorStop(.6, '#3a0e06'); gg.addColorStop(1, '#140402'); g.fillStyle = gg; g.fillRect(0, 0, W, H);
          g.fillStyle = '#2a0a04'; g.fillRect(0, 0, W, 90); g.fillStyle = goldBevel(g, 0, 80, W, 100); g.fillRect(0, 84, W, 14);
          for (let x = 20; x < W; x += 60) { g.fillStyle = '#5a2008'; g.fillRect(x, 0, 30, 84); }
          g.globalAlpha = .14; mandala(g, 540, 1200, 900, '#f2c76b'); g.globalAlpha = 1;
        });
        // a cut from the light of the gate
        c.drawImage(bg, 0, 0, W, H);
        const cam = camAt(pt, [[0, { x: 540, y: 900, z: 1.12 }], [s.d, { x: 540, y: 960, z: 1 }]]);
        c.save(); camera(c, cam);
        const bells = [[230, 300, 210, 0], [540, 420, 290, .9], [850, 260, 200, 1.7]];
        bells.forEach(([x, len, sz, ph], i) => {
          const strike = (pt + ph) % 2.6, sw = .32 * Math.exp(-strike * 1.1) * Math.sin(strike * 4.6) + .04 * Math.sin(t * 1.3 + i);
          // rings of sound when the clapper strikes
          for (let r = 0; r < 3; r++) { const q = (strike - .15 - r * .18) / 1.2; if (q > 0 && q < 1) { c.strokeStyle = `rgba(255,214,140,${((1 - q) * .45).toFixed(2)})`; c.lineWidth = 4; c.beginPath(); c.arc(x, 98 + len + sz * .8, sz * (.5 + q * 1.4), 0, TAU); c.stroke(); } }
          c.save(); c.translate(x, 98); c.rotate(sw); bigBell(c, len, sz, sw); c.restore();
        });
        for (const x of [60, 1020]) for (let j = 0; j < 18; j++) marigold(c, x, 110 + j * 30, 15, j % 2 ? 40 : 28);
        c.restore();
        shlokaBlock(c, P, 1010, pt, t);
        K.sparks(c, t, 10, '#ffd98a', 7);
        if (pt > s.d - .6) { c.fillStyle = `rgba(255,214,150,${((pt - (s.d - .6)) / .6 * .9).toFixed(2)})`; c.fillRect(0, 0, W, H); }
      },
      sanctum(c, s, pt, t, P) {
        const k = kOf(P);
        const cam = camAt(pt, [[0, { x: 540, y: 900, z: 1.1 }], [s.d, { x: 540, y: 960, z: 1 }]]);
        c.save(); camera(c, cam);
        c.drawImage(sanctumArt(k), 0, 0, W, H);
        // the divine glow: rays and a turning mandala behind Ganesh ji
        const rev = ease((pt - .9) / 1.2);
        rays(c, 540, 840, t, { n: 28, r: 900, col: '255,214,140', a: .22 * rev, spin: .06 });
        glow(c, 540, 860, 420, `rgba(255,220,150,${(.6 * rev).toFixed(2)})`);
        c.save(); c.globalAlpha = rev; mandala(c, 540, 860, 520, 'rgba(255,214,120,.55)', t * .1); mandala(c, 540, 860, 360, 'rgba(255,214,120,.45)', -t * .14); c.restore();
        const g = ganeshaImage(P);
        if (g) { const hh = 760, ww = hh * g.naturalWidth / g.naturalHeight; c.drawImage(g, 540 - ww / 2, 1250 - hh, ww, hh); } else K.ganesha(c, 540, 500, 720, t);
        // brass lamps either side, the aarti plate circling before him
        for (const x of [210, 870]) { lampBody(c, x, 1560, 300); lampFlames(c, x, 1560, 300, t); }
        const a = t * 2.2, ax = 540 + Math.cos(a) * 220, ay = 1150 + Math.sin(a) * 90;
        c.fillStyle = brassGrad(c, ax - 90, ax + 90); c.beginPath(); c.ellipse(ax, ay, 90, 28, 0, 0, TAU); c.fill();
        for (let i = 0; i < 5; i++) diya(c, ax - 50 + i * 25, ay - 2, 14, t + i);
        flame(c, ax, ay - 20, 46, t, 3);
        for (let i = 0; i < 5; i++) { const ph = (t * .25 + i / 5) % 1; glow(c, ax + Math.sin(ph * 6 + i) * 30, ay - 60 - ph * 400, 40 + ph * 70, `rgba(255,240,220,${(.12 * Math.sin(ph * Math.PI)).toFixed(3)})`); }
        c.restore();
        // the curtains part
        const op = ease3((pt - .2) / 1.6);
        if (op < 1) { const cv = curtainArt(k); c.drawImage(cv, -op * 560, 0, 560, H); c.save(); c.translate(W + op * 560, 0); c.scale(-1, 1); c.drawImage(cv, 0, 0, 560, H); c.restore(); }
        nameBlock(c, P, 1590, fade(pt, s.d, 2, 1), t);
        K.petals(c, t, 20, ['#ff9800', '#ffd54f', '#e91e63', '#ffffff'], 13);
      },
      scroll(c, s, pt, t, P) {
        const k = kOf(P);
        c.drawImage(sanctumArt(k), 0, 0, W, H);
        c.fillStyle = 'rgba(20,4,0,.45)'; c.fillRect(0, 0, W, H);
        const u = ease3((pt - .1) / 1.2), hh = 1300 * u, top = 960 - hh / 2;
        if (hh > 4) { const sc = scrollArt(k); c.drawImage(sc, 0, (sc.height - hh * sc.height / 1300) / 2, sc.width, hh * sc.height / 1300, 110, top, 860, hh); }
        roller(c, top - 10, 940); roller(c, top + hh + 10, 940);
        for (const x of [70, 1010]) for (let j = 0; j < 14; j++) marigold(c, x, top + 40 + j * (hh / 14), 14, j % 2 ? 40 : 28);
        const a = ease((pt - 1) / .8) * (1 - ease((pt - (s.d - .5)) / .5));
        if (a > .01) {
          c.save(); c.globalAlpha = a;
          foil(c, '॥ श्री गणेशाय नमः ॥', W / 2, 400, { font: '64px "Yatra One"', t, dark: true });
          for (let i = 0; i < 5; i++) diya(c, 380 + i * 80, 1500, 26, t + i);
          c.fillStyle = '#b0201a'; c.font = '52px "Yatra One"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('शुभ', 250, 1490); c.fillText('लाभ', 830, 1490);
          c.restore();
        }
      },
      plate(c, s, pt, t, P) {
        const k = kOf(P), i = s.i || 0;
        const z = 1.04 - .04 * ease3(pt / s.d);
        c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2);
        c.drawImage(velvetArt(k), 0, 0, W, H);
        // the plate turns very slowly; diyas round its rim light one by one
        c.save(); c.translate(540, 960); c.rotate(i * .7 + pt * .02); c.fillStyle = 'rgba(10,0,0,.45)'; c.beginPath(); c.arc(16, 24, 500, 0, TAU); c.fill(); c.drawImage(thaliArt(k), -500, -500, 1000, 1000); c.restore();
        for (let j = 0; j < 12; j++) { if (pt < .2 + j * .12) continue; const a = j / 12 * TAU - Math.PI / 2; diya(c, 540 + Math.cos(a) * 425, 960 + Math.sin(a) * 425 + 14, 24, t + j); }
        // a kalash and a conch at the top, an incense stick smoking
        kalash(c, 540, 470, 150);
        c.restore();
        for (let j = 0; j < 4; j++) { const ph = (t * .2 + j / 4) % 1; glow(c, 160 + Math.sin(ph * 5) * 30, 1500 - ph * 900, 40 + ph * 80, `rgba(255,240,220,${(.1 * Math.sin(ph * Math.PI)).toFixed(3)})`); }
      },
      evening(c, s, pt, t, P) {
        const k = kOf(P), z = 1.06 - .06 * ease3(pt / s.d);
        c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2);
        c.drawImage(nightArt(k), 0, -500, W, TALL);
        STEP_DIYAS.forEach(([x, y, sz]) => { if (y - 500 < H) diya(c, x, y - 500, sz, t + x * .01); });
        // fireworks over the temple
        for (let j = 0; j < 3; j++) { const ph = ((pt + j * .9) % 2.7) / 2.7, fx = [260, 820, 540][j], fy = [380, 300, 160][j]; if (ph < .8) K.burst(c, fx, fy, ph / .8, ['255,214,120', '255,140,180', '160,220,255'][j], 30, 180); }
        c.restore();
      },
      pond(c, s, pt, t, P) {
        const k = kOf(P);
        c.drawImage(pondArt(k), 0, 0, W, H);
        for (let j = 0; j < 12; j++) { const R = rng(j + 3), x = (R() * W + t * (10 + R() * 14)) % (W + 100) - 50, y = 1100 + R() * 760 + Math.sin(t + j) * 6; c.fillStyle = 'rgba(255,190,90,.15)'; c.beginPath(); c.ellipse(x, y + 18, 60, 12, 0, 0, TAU); c.fill(); diya(c, x, y, 30, t + j); }
      }
    }
  };
})(Cinema.kit));
