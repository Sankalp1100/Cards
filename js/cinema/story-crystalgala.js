// The Crystal Ballroom: a modern, glamorous reception film in midnight blue, champagne and rose gold. A grand hotel
// at night with a red carpet and a welcome sign; a crystal chandelier lowers and lights tier by tier with their
// monogram in its glass; silk curtains part on the ballroom; each part of the evening has its own set (a champagne
// tower filling glass by glass, a candlelit banquet, a dance floor under a mirror ball); the couple dance under the
// chandelier; a night garden of fairy lights for the venue; and two flutes clink for thank you.
Cinema.register((K => {
  const { W, H, TAU, rng, clamp, ease, ease3, lerp, glow, rrect, rose, leaf, foliage, blossom, clean, days, dateRange, parents, coupleImage, cutout,
    sparks, motes, confetti, flame, discoBall, bulbs, burst, foil, HI } = K;

  // ---------- lettering ----------
  const DEV = /[ऀ-ॿ]/;
  function fontFor(f, z, s) {
    if (DEV.test(s)) return f === 'script' ? `700 ${Math.round(z * .62)}px "Amita"` : f === 'display' ? `${Math.round(z * .82)}px "Yatra One"` : `${Math.round(z * .9)}px "Tiro Devanagari Hindi"`;
    return f === 'script' ? `${z}px "Great Vibes"` : f === 'caps' ? `${z}px "Cinzel"` : f === 'display' ? `700 ${z}px "Cinzel Decorative"` : f === 'ital' ? `italic ${z}px "Cormorant Garamond"` : `${z}px "Marcellus"`;
  }
  function setFont(c, l, maxW) {
    let z = l.z; const ls = DEV.test(l.s) ? 0 : (l.ls || 0);
    for (let i = 0; i < 30; i++) { c.font = fontFor(l.f, z, l.s); K.spacing(c, ls * z / l.z); if (c.measureText(l.s).width <= maxW || z < 14) break; z *= .94; }
    return z;
  }
  function say(c, l, x, y, a = 1, t) {
    if (!l || !clean(l.s) || a <= .01) return;
    c.save(); c.globalAlpha *= a;
    const z = setFont(c, l, l.maxW || 760);
    c.textAlign = l.align || 'center'; c.textBaseline = 'middle';
    if (l.gold) {
      // champagne-and-rose-gold foil with a travelling gleam
      const w = c.measureText(l.s).width, g = c.createLinearGradient(0, y - z * .6, 0, y + z * .5);
      g.addColorStop(0, '#fff6ec'); g.addColorStop(.45, '#f4d3b8'); g.addColorStop(.8, '#d39a7c'); g.addColorStop(1, '#a8664c');
      c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 12; c.shadowOffsetY = 3; c.fillStyle = g; c.fillText(l.s, x, y); c.shadowColor = 'transparent';
      if (t != null) { const sh = (t % 4.2) / 1.2; if (sh < 1) { const sx = x - w / 2 - 100 + sh * (w + 200), sg = c.createLinearGradient(sx - 60, y, sx + 60, y); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(.5, 'rgba(255,255,255,.85)'); sg.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = sg; c.fillText(l.s, x, y); } }
    } else { c.fillStyle = l.col || '#f6ead8'; if (l.shade !== false) { c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 8; } c.fillText(l.s, x, y); }
    K.spacing(c, 0); c.restore();
  }
  let scratch = null;
  function wrap(s, l, maxW, max = 3) {
    const c = (scratch = scratch || K.canvasOf(8, 8).getContext('2d')); c.font = fontFor(l.f, l.z, s); K.spacing(c, 0);
    const out = []; let cur = '';
    for (const w of String(s).split(/\s+/)) { const tr = cur ? cur + ' ' + w : w; if (c.measureText(tr).width > maxW && cur) { out.push(cur); cur = w; } else cur = tr; }
    if (cur) out.push(cur);
    return out.slice(0, max);
  }
  function flow(specs, y0, maxW = 720) {
    const out = []; let y = y0;
    specs.filter(l => l && clean(l.s)).forEach(l => {
      const parts = l.wrap ? wrap(clean(l.s), l, maxW, l.wrap) : [clean(l.s)];
      parts.forEach((s, i) => { const h = l.z * (DEV.test(s) ? 1.3 : 1.16); out.push({ ...l, s, y: y + h / 2, maxW }); y += h + (i === parts.length - 1 ? (l.gap || 0) : 4); });
    });
    return out;
  }
  const sayAll = (c, L, p, t, at = .3, gap = .18) => L.forEach((l, i) => { const a = ease((p - at - i * gap) / .6); say(c, l, W / 2, l.y + (1 - a) * 16, a, l.gold ? t : undefined); });
  const blockH = L => L.length ? L[L.length - 1].y - L[0].y : 0;
  const HIFN = [[/cocktail/i, 'कॉकटेल संध्या'], [/dinner|bhoj/i, 'रात्रिभोज'], [/dj|dance/i, 'डीजे नाइट'], [/reception/i, 'स्वागत समारोह'], [/lunch/i, 'दोपहर भोज'], [/sangeet/i, 'संगीत संध्या'], [/after ?party/i, 'आफ़्टर पार्टी']];
  const fnName = (n, hi) => (hi && !DEV.test(n) && (HIFN.find(([re]) => re.test(n)) || [])[1]) || n;
  const kOf = P => Math.min(1.25, Math.max(.5, P.k));
  const NIGHT = '#0b1230', ROSE = '#e8b4a0', CHAMP = '#f3e3c3';
  const RG = (c, x0, y0, x1, y1) => { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, '#fbe3d2'); g.addColorStop(.35, '#d9997e'); g.addColorStop(.6, '#fff0e4'); g.addColorStop(1, '#b8735a'); return g; };

  // ---------- still art ----------
  // a frosted glass panel with a rose-gold double edge
  function glassArt(k, w, h) {
    return K.art(`cg-glass-${w}x${h}`, w + 40, h + 40, k, c => {
      c.translate(20, 20);
      c.fillStyle = 'rgba(0,0,0,.35)'; rrect(c, 8, 16, w, h, 34); c.fill();
      const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, 'rgba(255,255,255,.26)'); g.addColorStop(.5, 'rgba(200,215,255,.12)'); g.addColorStop(1, 'rgba(255,255,255,.2)');
      c.fillStyle = 'rgba(14,20,52,.55)'; rrect(c, 0, 0, w, h, 34); c.fill(); c.fillStyle = g; rrect(c, 0, 0, w, h, 34); c.fill();
      const sh = c.createLinearGradient(0, 0, w * .6, h * .5); sh.addColorStop(0, 'rgba(255,255,255,.22)'); sh.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = sh; c.beginPath(); c.moveTo(34, 0); c.lineTo(w * .55, 0); c.lineTo(0, h * .45); c.lineTo(0, 34); c.closePath(); c.fill();
      c.strokeStyle = RG(c, 0, 0, w, h); c.lineWidth = 4; rrect(c, 0, 0, w, h, 34); c.stroke(); c.lineWidth = 1.5; rrect(c, 16, 16, w - 32, h - 32, 24); c.stroke();
      for (const [x, y] of [[16, 16], [w - 16, 16], [16, h - 16], [w - 16, h - 16]]) { c.fillStyle = RG(c, x - 10, y - 10, x + 10, y + 10); c.beginPath(); c.moveTo(x, y - 12); c.lineTo(x + 12, y); c.lineTo(x, y + 12); c.lineTo(x - 12, y); c.fill(); }
    });
  }
  const glass = (c, P, x, y, w, h) => c.drawImage(glassArt(kOf(P), w, h), x - 20, y - 20, w + 40, h + 40);
  // the grand hotel at night: columns, tall glowing windows, a red carpet and brass stanchions
  function hotelArt(k) {
    return K.art('cg-hotel', W, H, k, c => {
      const R = rng(4);
      const s = c.createLinearGradient(0, 0, 0, H); s.addColorStop(0, '#050a22'); s.addColorStop(.5, '#16205a'); s.addColorStop(1, '#0a0e26'); c.fillStyle = s; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 160; i++) { c.fillStyle = `rgba(255,255,255,${R() * .8})`; c.beginPath(); c.arc(R() * W, R() * 600, R() * 2.2, 0, TAU); c.fill(); }
      c.fillStyle = '#f4f0e6'; c.beginPath(); c.arc(860, 200, 70, 0, TAU); c.fill(); glow(c, 860, 200, 260, 'rgba(220,230,255,.3)');
      // facade
      c.fillStyle = '#1c2148'; c.fillRect(0, 520, W, 1000);
      c.fillStyle = '#2a3066'; c.beginPath(); c.moveTo(140, 640); c.lineTo(540, 470); c.lineTo(940, 640); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(243,227,195,.5)'; c.lineWidth = 4; c.stroke();
      for (let j = 0; j < 2; j++) for (let i = 0; i < 7; i++) {
        const x = 70 + i * 150, y = 700 + j * 330;
        const g = c.createLinearGradient(0, y, 0, y + 250); g.addColorStop(0, '#ffe2a8'); g.addColorStop(1, '#ff9f5a');
        c.fillStyle = g; c.beginPath(); c.moveTo(x, y + 250); c.lineTo(x, y + 50); c.arc(x + 40, y + 50, 40, Math.PI, 0); c.lineTo(x + 80, y + 250); c.fill();
        c.strokeStyle = 'rgba(80,40,10,.45)'; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 40, y + 10); c.lineTo(x + 40, y + 250); c.moveTo(x, y + 140); c.lineTo(x + 80, y + 140); c.stroke();
        glow(c, x + 40, y + 140, 150, 'rgba(255,200,120,.18)');
      }
      for (let i = 0; i < 8; i++) { const x = 150 + i * 112; const g = c.createLinearGradient(x - 18, 0, x + 18, 0); g.addColorStop(0, '#8a8fb8'); g.addColorStop(.5, '#e9e6f2'); g.addColorStop(1, '#6a6f98'); c.fillStyle = g; c.fillRect(x - 18, 640, 36, 880); }
      // the entrance and the carpet
      c.fillStyle = '#ffd99a'; c.beginPath(); c.moveTo(430, 1520); c.lineTo(430, 1300); c.arc(540, 1300, 110, Math.PI, 0); c.lineTo(650, 1520); c.fill(); glow(c, 540, 1380, 300, 'rgba(255,214,150,.5)');
      c.fillStyle = '#2a2a3e'; c.fillRect(0, 1520, W, 400);
      c.fillStyle = '#9a1428'; c.beginPath(); c.moveTo(450, 1520); c.lineTo(630, 1520); c.lineTo(900, H); c.lineTo(180, H); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,.08)'; c.beginPath(); c.moveTo(450, 1520); c.lineTo(500, 1520); c.lineTo(300, H); c.lineTo(180, H); c.fill();
      for (const sd of [-1, 1]) for (let i = 0; i < 4; i++) {
        const u = i / 3, x = 540 + sd * lerp(130, 420, u), y = lerp(1560, 1880, u), hh = lerp(70, 160, u);
        c.fillStyle = '#e9c27a'; c.fillRect(x - 5, y - hh, 10, hh); c.beginPath(); c.arc(x, y - hh, 10, 0, TAU); c.fill();
        if (i < 3) { const nx = 540 + sd * lerp(130, 420, (i + 1) / 3), ny = lerp(1560, 1880, (i + 1) / 3), nh = lerp(70, 160, (i + 1) / 3); c.strokeStyle = '#7a0f20'; c.lineWidth = 7; c.beginPath(); c.moveTo(x, y - hh + 12); c.quadraticCurveTo((x + nx) / 2, (y - hh + ny - nh) / 2 + 40, nx, ny - nh + 12); c.stroke(); }
      }
      // two topiaries in planters at the door
      for (const x of [330, 750]) { c.fillStyle = '#c9c4d8'; c.fillRect(x - 40, 1450, 80, 70); foliage(c, R, x, 1380, 60, 60, 60, 120, 28, 26, 40); foliage(c, R, x, 1290, 46, 46, 40, 120, 28, 22, 40); }
    });
  }
  // a crystal chandelier: three tiers of arms, candle bulbs, strands of drops (unlit / lit)
  const CH = { w: 900, h: 900 };
  function chandArt(k, lit) {
    return K.art(`cg-chand-${lit ? 1 : 0}`, CH.w, CH.h, k, c => {
      const cx = CH.w / 2, metal = (x0, x1) => { const g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, '#9a7a4a'); g.addColorStop(.5, lit ? '#fff1cf' : '#e6d0a0'); g.addColorStop(1, '#8a6a3a'); return g; };
      c.strokeStyle = metal(cx - 6, cx + 6); c.lineWidth = 10; c.beginPath(); c.moveTo(cx, 0); c.lineTo(cx, 520); c.stroke();
      const tiers = [[160, 210, 6], [300, 330, 8], [460, 420, 10]];
      for (const [y, r, n] of tiers) {
        // drapes of crystal beads between arms
        for (let i = 0; i < n; i++) {
          const a0 = i / n * TAU, a1 = (i + 1) / n * TAU;
          for (let j = 0; j <= 10; j++) { const u = j / 10, a = lerp(a0, a1, u), x = cx + Math.cos(a) * r, yy = y + Math.sin(a) * r * .22 + Math.sin(u * Math.PI) * 50; c.fillStyle = lit ? 'rgba(235,245,255,.95)' : 'rgba(200,210,230,.7)'; c.beginPath(); c.arc(x, yy, 5, 0, TAU); c.fill(); }
        }
        for (let i = 0; i < n; i++) {
          const a = i / n * TAU, x = cx + Math.cos(a) * r, yy = y + Math.sin(a) * r * .22;
          c.strokeStyle = metal(x - 5, x + 5); c.lineWidth = 7; c.beginPath(); c.moveTo(cx, y - 30); c.quadraticCurveTo((cx + x) / 2, y + 40, x, yy); c.stroke();
          c.fillStyle = metal(x - 14, x + 14); c.beginPath(); c.ellipse(x, yy, 18, 7, 0, 0, TAU); c.fill();
          c.fillStyle = '#fbf6ee'; c.fillRect(x - 6, yy - 40, 12, 40);
          if (lit) { glow(c, x, yy - 52, 60, 'rgba(255,214,150,.75)'); c.fillStyle = '#fff6d0'; c.beginPath(); c.ellipse(x, yy - 50, 8, 14, 0, 0, TAU); c.fill(); }
          // a strand of drops beneath
          for (let j = 0; j < 4; j++) { const dy = yy + 18 + j * 22; c.fillStyle = lit ? 'rgba(240,248,255,.95)' : 'rgba(200,210,230,.75)'; c.beginPath(); c.moveTo(x, dy - 8); c.quadraticCurveTo(x + 7, dy + 4, x, dy + 12); c.quadraticCurveTo(x - 7, dy + 4, x, dy - 8); c.fill(); }
        }
      }
      // the glass medallion at the heart (their monogram is lit in it, live)
      const g = c.createRadialGradient(cx - 30, 560, 10, cx, 580, 110); g.addColorStop(0, lit ? '#ffffff' : '#dfe7f5'); g.addColorStop(1, lit ? 'rgba(200,220,255,.5)' : 'rgba(150,170,210,.5)');
      c.fillStyle = g; c.beginPath(); c.arc(cx, 590, 100, 0, TAU); c.fill(); c.strokeStyle = metal(cx - 100, cx + 100); c.lineWidth = 8; c.stroke();
      for (let j = 0; j < 9; j++) { const dy = 700 + j * 20; c.fillStyle = lit ? 'rgba(240,248,255,.95)' : 'rgba(200,210,230,.7)'; c.beginPath(); c.moveTo(cx, dy - 10); c.quadraticCurveTo(cx + 10, dy + 4, cx, dy + 16); c.quadraticCurveTo(cx - 10, dy + 4, cx, dy - 10); c.fill(); }
      if (lit) glow(c, cx, 400, 420, 'rgba(255,230,190,.25)');
    });
  }
  function chandelier(c, P, x, y, s, light, t) {
    const k = kOf(P);
    c.save(); c.translate(x, y); c.scale(s, s);
    if (light < 1) c.drawImage(chandArt(k, false), -CH.w / 2, 0, CH.w, CH.h);
    if (light > 0) { c.globalAlpha = light; c.drawImage(chandArt(k, true), -CH.w / 2, 0, CH.w, CH.h); }
    c.globalAlpha = 1;
    // crystals catching the light
    if (light > .2) { const R = rng(8); for (let i = 0; i < 22; i++) { const a = R() * TAU, r = 120 + R() * 300, px = Math.cos(a) * r, py = 180 + R() * 400, tw = Math.max(0, Math.sin(t * 3 + i * 1.7)); if (tw > .4) { const z = 10 + 16 * tw; c.fillStyle = `rgba(255,255,255,${(tw * light).toFixed(2)})`; c.beginPath(); c.moveTo(px, py - z); c.quadraticCurveTo(px, py, px + z, py); c.quadraticCurveTo(px, py, px, py + z); c.quadraticCurveTo(px, py, px - z, py); c.quadraticCurveTo(px, py, px, py - z); c.fill(); } } }
    c.restore();
  }
  // the ballroom: tall arched night windows, drapes, a marble floor with round tables and candles
  function ballroomArt(k) {
    return K.art('cg-ballroom', W, H, k, c => {
      const R = rng(22);
      const wall = c.createLinearGradient(0, 0, 0, 1150); wall.addColorStop(0, '#141a44'); wall.addColorStop(1, '#2a2f66'); c.fillStyle = wall; c.fillRect(0, 0, W, 1150);
      for (let i = 0; i < 4; i++) {
        const x = 70 + i * 250, y = 260;
        const g = c.createLinearGradient(0, y, 0, y + 760); g.addColorStop(0, '#0a1440'); g.addColorStop(1, '#3a4a9a'); c.fillStyle = g;
        c.beginPath(); c.moveTo(x, y + 760); c.lineTo(x, y + 90); c.arc(x + 90, y + 90, 90, Math.PI, 0); c.lineTo(x + 180, y + 760); c.fill();
        for (let j = 0; j < 14; j++) { c.fillStyle = `rgba(255,255,255,${R() * .8})`; c.beginPath(); c.arc(x + 20 + R() * 140, y + 40 + R() * 300, R() * 2, 0, TAU); c.fill(); }
        c.strokeStyle = 'rgba(243,227,195,.55)'; c.lineWidth = 6; c.stroke(); c.lineWidth = 2; c.beginPath(); c.moveTo(x + 90, y); c.lineTo(x + 90, y + 760); c.moveTo(x, y + 380); c.lineTo(x + 180, y + 380); c.stroke();
      }
      // the floor in perspective, polished: tiles and reflections
      const fl = c.createLinearGradient(0, 1150, 0, H); fl.addColorStop(0, '#d9d2c4'); fl.addColorStop(1, '#8d8678'); c.fillStyle = fl; c.fillRect(0, 1150, W, H - 1150);
      c.strokeStyle = 'rgba(80,70,60,.25)'; c.lineWidth = 2;
      for (let i = -12; i <= 12; i++) { c.beginPath(); c.moveTo(540 + i * 40, 1150); c.lineTo(540 + i * 220, H); c.stroke(); }
      for (let j = 0; j < 10; j++) { const y = 1150 + Math.pow(j / 10, 1.8) * 770; c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
      c.fillStyle = 'rgba(255,214,150,.12)'; for (let i = 0; i < 4; i++) c.fillRect(110 + i * 250, 1150, 100, 300);
      // round tables with white cloths and candles, near and far
      for (const [x, y, s] of [[200, 1260, .55], [540, 1250, .5], [880, 1260, .55], [120, 1500, .9], [960, 1500, .9]]) {
        c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(x, y + 120 * s, 200 * s, 40 * s, 0, 0, TAU); c.fill();
        const tg = c.createLinearGradient(0, y, 0, y + 130 * s); tg.addColorStop(0, '#ffffff'); tg.addColorStop(1, '#d6d0e2'); c.fillStyle = tg;
        c.beginPath(); c.ellipse(x, y, 190 * s, 50 * s, 0, 0, Math.PI, true); c.lineTo(x + 200 * s, y + 120 * s); c.quadraticCurveTo(x, y + 150 * s, x - 200 * s, y + 120 * s); c.closePath(); c.fill();
        c.fillStyle = '#f6f2ff'; c.beginPath(); c.ellipse(x, y, 190 * s, 50 * s, 0, 0, TAU); c.fill();
        for (let i = 0; i < 6; i++) rose(c, x - 40 * s + R() * 80 * s, y - 20 * s - R() * 40 * s, 22 * s, '#ffd9e2', '#e98aa2', R() * 3);
        for (const dx of [-90, 90]) { c.fillStyle = '#e9c27a'; c.fillRect(x + dx * s - 3, y - 90 * s, 6, 80 * s); }
      }
      // drapes at the sides
      for (const sd of [0, 1]) { const x0 = sd ? W - 150 : 0; const g = c.createLinearGradient(x0, 0, x0 + 150, 0); g.addColorStop(0, '#5a1a3a'); g.addColorStop(.5, '#8a2a5a'); g.addColorStop(1, '#4a1030'); c.fillStyle = g; c.fillRect(x0, 0, 150, 1500); c.fillStyle = RG(c, x0, 900, x0 + 150, 940); c.fillRect(x0, 900, 150, 26); }
    });
  }
  // the champagne tower set: a pyramid of coupes on a mirrored table
  const TOWER = (() => { const g = []; [5, 4, 3, 2, 1].forEach((n, row) => { for (let i = 0; i < n; i++) g.push({ x: 540 + (i - (n - 1) / 2) * 150, y: 1640 - row * 150, row }); }); return g; })();
  function coupe(c, x, y, fill, lit) {
    // y: the rim. The bowl, stem, foot; fill 0..1 of champagne
    c.save();
    if (fill > 0) { c.save(); c.beginPath(); c.ellipse(x, y, 66, 54, 0, 0, Math.PI); c.clip(); const g = c.createLinearGradient(0, y, 0, y + 54); g.addColorStop(0, '#ffe9a8'); g.addColorStop(1, '#e8b440'); c.fillStyle = g; c.fillRect(x - 70, y + 54 * (1 - fill), 140, 60); c.restore(); }
    c.strokeStyle = 'rgba(240,248,255,.9)'; c.lineWidth = 3; c.beginPath(); c.ellipse(x, y, 66, 54, 0, 0, Math.PI); c.stroke();
    c.strokeStyle = 'rgba(240,248,255,.7)'; c.beginPath(); c.ellipse(x, y, 66, 12, 0, 0, TAU); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.ellipse(x - 30, y + 20, 10, 24, .5, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(240,248,255,.85)'; c.lineWidth = 5; c.beginPath(); c.moveTo(x, y + 54); c.lineTo(x, y + 120); c.stroke();
    c.lineWidth = 3; c.beginPath(); c.ellipse(x, y + 122, 34, 8, 0, 0, TAU); c.stroke();
    if (lit && fill > .9) glow(c, x, y + 30, 70, 'rgba(255,220,140,.25)');
    c.restore();
  }
  // a candlelit banquet table running away from us
  function banquetArt(k) {
    return K.art('cg-banquet', W, H, k, c => {
      const R = rng(31);
      const s = c.createLinearGradient(0, 0, 0, H); s.addColorStop(0, '#0e1236'); s.addColorStop(.5, '#2a1f4a'); s.addColorStop(1, '#120a20'); c.fillStyle = s; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 6; i++) bulbs(c, 0, W, 120 + i * 70, 60 + i * 10, 0, 18, ['rgba(255,224,160,A)'], i);
      c.fillStyle = '#f7f3ff'; c.beginPath(); c.moveTo(470, 820); c.lineTo(610, 820); c.lineTo(1080, 1920); c.lineTo(0, 1920); c.closePath(); c.fill();
      const sh = c.createLinearGradient(0, 820, 0, H); sh.addColorStop(0, 'rgba(60,40,90,.35)'); sh.addColorStop(1, 'rgba(60,40,90,0)'); c.fillStyle = sh; c.fill();
      c.fillStyle = RG(c, 500, 820, 580, H); c.beginPath(); c.moveTo(525, 820); c.lineTo(555, 820); c.lineTo(700, H); c.lineTo(380, H); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,214,150,.18)'; c.beginPath(); c.moveTo(470, 820); c.lineTo(610, 820); c.lineTo(1080, 1920); c.lineTo(0, 1920); c.closePath(); c.fill();
      for (let i = 0; i < 70; i++) { const u = R(), y = lerp(840, 1900, u * u), half = lerp(60, 500, u * u); c.fillStyle = ['#f4a3b8', '#ffffff', '#e8b4a0'][i % 3]; c.beginPath(); c.ellipse(540 + (R() - .5) * 2 * half, y, 9 * lerp(.2, 1.4, u), 5 * lerp(.2, 1.4, u), R() * 3, 0, TAU); c.fill(); }
      for (const sd of [-1, 1]) for (let j = 0; j < 6; j++) { const u = Math.pow(j / 5, 1.6), y = lerp(880, 1700, u), x = 540 + sd * lerp(110, 640, u), sc = lerp(.15, 1.1, u); c.fillStyle = '#efe8f6'; rrect(c, x - 50 * sc, y - 220 * sc, 100 * sc, 200 * sc, 30 * sc); c.fill(); c.fillStyle = RG(c, x - 50 * sc, y, x + 50 * sc, y); c.fillRect(x - 50 * sc, y - 140 * sc, 100 * sc, 14 * sc); }
      // plates, florals and candle holders in perspective
      for (let j = 0; j < 7; j++) {
        const u = Math.pow(j / 6, 1.6), y = lerp(860, 1820, u), half = lerp(70, 520, u), sc = lerp(.12, 1, u);
        for (const sd of [-1, 1]) { c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(540 + sd * half * .78, y, 70 * sc, 22 * sc, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(184,134,43,.8)'; c.lineWidth = 3 * sc; c.stroke(); }
        if (j % 2 === 0) { for (let i = 0; i < 9; i++) rose(c, 540 + (R() - .5) * 140 * sc, y - 20 * sc - R() * 50 * sc, 28 * sc, i % 2 ? '#ffd9e2' : '#fff4f6', i % 2 ? '#e98aa2' : '#e0c0c8', R() * 3); for (let i = 0; i < 6; i++) leaf(c, 540 + (R() - .5) * 200 * sc, y - 10 * sc, 60 * sc, 18 * sc, R() * TAU, '#5d8a5a'); }
        else { c.fillStyle = '#e9c27a'; for (const dx of [-60, 0, 60]) c.fillRect(540 + dx * sc - 4 * sc, y - 160 * sc, 8 * sc, 160 * sc); c.fillRect(540 - 70 * sc, y - 100 * sc, 140 * sc, 8 * sc); }
      }
    });
  }
  const BANQ_FLAMES = (() => { const out = []; for (let j = 1; j < 7; j += 2) { const u = Math.pow(j / 6, 1.6), y = lerp(860, 1820, u), sc = lerp(.12, 1, u); for (const dx of [-60, 0, 60]) out.push([540 + dx * sc, y - 160 * sc, 46 * sc]); } return out; })();
  // a night garden: fairy-lit trees, a white pavilion, a path of lanterns
  function gardenArt(k) {
    return K.art('cg-garden', W, H, k, c => {
      const R = rng(55);
      const s = c.createLinearGradient(0, 0, 0, H); s.addColorStop(0, '#060b26'); s.addColorStop(.55, '#1a2a5a'); s.addColorStop(1, '#0a1a1a'); c.fillStyle = s; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 140; i++) { c.fillStyle = `rgba(255,255,255,${R() * .8})`; c.beginPath(); c.arc(R() * W, R() * 700, R() * 2.2, 0, TAU); c.fill(); }
      // the pavilion
      c.fillStyle = '#e9e4f2'; c.beginPath(); c.moveTo(300, 900); c.quadraticCurveTo(540, 720, 780, 900); c.fill();
      for (const x of [330, 450, 630, 750]) c.fillRect(x - 12, 900, 24, 360);
      c.fillRect(280, 1250, 520, 30); glow(c, 540, 1080, 320, 'rgba(255,214,150,.45)');
      // trees either side, dark, wrapped in lights later (live)
      for (const [x, sd] of [[120, 1], [960, -1]]) { c.fillStyle = '#0a1a14'; c.fillRect(x - 24, 700, 48, 900); foliage(c, R, x + sd * 30, 560, 260, 300, 110, 150, 14, 70, 30); }
      c.fillStyle = '#0d2218'; c.fillRect(0, 1300, W, 620);
      c.fillStyle = '#c9c0a8'; c.beginPath(); c.moveTo(470, 1300); c.lineTo(610, 1300); c.lineTo(900, H); c.lineTo(180, H); c.closePath(); c.fill();
      for (let i = 0; i < 60; i++) blossom(c, R() * W, 1320 + R() * 600, 10 + R() * 10, ['#ffffff', '#f4c6d8', '#f3e3c3'][i % 3], '#ffd166', R() * 6);
    });
  }

  // ---------- the shots ----------
  function arrivalShot(c, s, pt, t, P) {
    const k = kOf(P), hi = P.opt.lang === 'hi', card = P.card, two = !!clean(card.host2);
    const cam = K.camAt(pt, [[0, { y: 1000, z: 1.0 }], [s.d, { y: 1240, z: 1.5 }]]);
    c.save(); K.camera(c, cam); c.drawImage(hotelArt(k), 0, 0, W, H);
    // the window lights flicker on in a wave
    for (let i = 0; i < 7; i++) { const a = .3 + .3 * Math.sin(t * 2 + i); glow(c, 110 + i * 150, 830, 90, `rgba(255,220,150,${(a * .3).toFixed(2)})`); }
    c.restore();
    motes(c, t, 14, 'rgba(255,230,190,A)', 3, 10);
    // the welcome sign on an easel (acrylic with rose-gold letters)
    const ea = ease3((pt - .6) / 1), x = 260, y = 360, w = 560, h = 560;
    if (ea > .01) {
      c.save(); c.globalAlpha = ea; c.translate(0, (1 - ea) * 40);
      const L = s.lines || (s.lines = flow([
        { s: hi ? 'स्वागत है' : 'Welcome to', f: hi ? 'serif' : 'caps', z: hi ? 44 : 28, col: CHAMP, ls: 8, gap: 10 },
        { s: hi ? 'स्वागत समारोह' : 'the Reception of', f: hi ? 'display' : 'ital', z: hi ? 70 : 42, col: CHAMP, gap: 20 },
        { s: card.host1, f: 'script', z: 112, gold: true, gap: 0 },
        two ? { s: '&', f: 'script', z: 70, col: ROSE, gap: 0 } : null,
        two ? { s: card.host2, f: 'script', z: 112, gold: true, gap: 14 } : null,
        { s: dateRange(card, hi), f: 'caps', z: 26, col: CHAMP, ls: 5 }], y + 80, 480));
      c.restore(); c.save(); c.globalAlpha = ea; c.translate(0, (1 - ea) * 40);
      glass(c, P, x, y, w, Math.round(blockH(L) + 170));
      sayAll(c, L, pt, t, 1.0, .18);
      c.restore();
    }
    if (pt > s.d - .5) { c.fillStyle = `rgba(255,240,220,${((pt - s.d + .5) / .5 * .9).toFixed(2)})`; c.fillRect(0, 0, W, H); }
  }
  function chandShot(c, s, pt, t, P) {
    const k = kOf(P), hi = P.opt.lang === 'hi', card = P.card, two = !!clean(card.host2), letters = P.ctx.letters;
    c.drawImage(K.art('cg-ceiling', W, H, k, g => {
      const r = g.createRadialGradient(W / 2, 600, 50, W / 2, 800, 1400); r.addColorStop(0, '#2a3270'); r.addColorStop(1, '#05081e'); g.fillStyle = r; g.fillRect(0, 0, W, H);
      g.strokeStyle = 'rgba(243,227,195,.18)'; g.lineWidth = 3; for (let i = 1; i < 6; i++) { g.beginPath(); g.ellipse(W / 2, 0, i * 200, i * 70, 0, 0, Math.PI); g.stroke(); }
    }), 0, 0, W, H);
    const drop = ease3(pt / 2), y = lerp(-900, -60, drop), light = clamp((pt - 1.6) / 1.2);
    if (light > 0) glow(c, W / 2, y + 420, 900, `rgba(255,220,170,${(.35 * light).toFixed(2)})`);
    chandelier(c, P, W / 2, y, 1.15, light, t);
    // their monogram glows into the glass medallion
    const mx = W / 2, my = y + 590 * 1.15, ma = ease((pt - 2.2) / .8);
    if (ma > .01) { c.save(); c.globalAlpha = ma; c.font = `700 ${letters.length > 1 ? 110 : 140}px "Cinzel Decorative"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = RG(c, mx - 100, my - 60, mx + 100, my + 60); c.fillText(letters.join(''), mx, my + 6); c.restore(); }
    const L = s.lines || (s.lines = flow([
      { s: hi ? 'स्वागत समारोह' : 'RECEPTION', f: hi ? 'display' : 'caps', z: hi ? 96 : 54, col: CHAMP, ls: 22, gap: 12 },
      { s: hi ? 'एक जगमगाती शाम' : 'an evening of champagne & chandeliers', f: hi ? 'serif' : 'ital', z: 40, col: ROSE, gap: 30 },
      { s: two ? `${clean(card.host1)}  &  ${clean(card.host2)}` : card.host1, f: 'script', z: 120, gold: true, gap: 12 },
      { s: dateRange(card, hi), f: 'caps', z: 30, col: CHAMP, ls: 6 }], 1260, 900));
    sayAll(c, L, pt, t, 2.4, .25);
    if (pt < .5) { c.fillStyle = `rgba(255,240,220,${((1 - pt / .5) * .9).toFixed(2)})`; c.fillRect(0, 0, W, H); }
  }
  function inviteShot(c, s, pt, t, P) {
    const k = kOf(P), hi = P.opt.lang === 'hi', card = P.card, two = !!clean(card.host2), [p1, p2] = parents(card, P.opt.lang);
    const z = 1.1 - .08 * ease3(pt / s.d);
    c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2); c.drawImage(ballroomArt(k), 0, 0, W, H); c.restore();
    for (const [x, y, sc] of [[200, 1260, .55], [540, 1250, .5], [880, 1260, .55], [120, 1500, .9], [960, 1500, .9]]) for (const dx of [-90, 90]) flame(c, x + dx * sc, y - 90 * sc, 26 * sc, t, x + dx);
    chandelier(c, P, W / 2, -380, .7, 1, t);
    // silk curtains part
    const op = ease3((pt - .1) / 1.4);
    for (const sd of [-1, 1]) {
      const w0 = W / 2 * (1 - op * .82);
      c.save(); c.translate(sd < 0 ? 0 : W, 0); c.scale(sd < 0 ? 1 : -1, 1);
      const g = c.createLinearGradient(0, 0, w0, 0); g.addColorStop(0, '#3a0f2a'); g.addColorStop(.3, '#8a2a5a'); g.addColorStop(.6, '#5a1a3a'); g.addColorStop(1, '#a03a6a'); c.fillStyle = g;
      c.beginPath(); c.moveTo(0, 0); c.lineTo(w0, 0); c.quadraticCurveTo(w0 * .8, H * .5, w0 + 30 * op, H); c.lineTo(0, H); c.fill();
      c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 8; for (let i = 1; i < 5; i++) { c.beginPath(); c.moveTo(w0 * i / 5, 0); c.quadraticCurveTo(w0 * i / 5 * .8, H * .5, w0 * i / 5 + 20 * op, H); c.stroke(); }
      c.restore();
    }
    const ga = ease3((pt - 1.1) / .8), x = 120, y = 420, w = 840;
    const L = s.lines || (s.lines = flow([
      { s: hi ? 'सपरिवार सादर आमन्त्रित' : 'TOGETHER WITH THEIR FAMILIES', f: hi ? 'serif' : 'caps', z: hi ? 40 : 24, col: ROSE, ls: 6, gap: 22 },
      { s: card.host1, f: 'script', z: 120, gold: true, gap: 0 }, { s: p1, f: 'serif', z: 28, col: CHAMP, wrap: 2, gap: 10 },
      two ? { s: '&', f: 'script', z: 80, col: ROSE, gap: 4 } : null,
      two ? { s: card.host2, f: 'script', z: 120, gold: true, gap: 0 } : null, two ? { s: p2, f: 'serif', z: 28, col: CHAMP, wrap: 2, gap: 26 } : null,
      ...(hi ? ['आपको सपरिवार आमन्त्रित करते हैं', 'अपने स्वागत समारोह में'] : ['request the pleasure of your company', 'as they celebrate their marriage']).map(x2 => ({ s: x2, f: hi ? 'serif' : 'ital', z: 40, col: CHAMP, gap: 2 }))], y + 100, 720));
    const h = blockH(L) + 220;
    if (ga > .01) { c.save(); c.globalAlpha = ga; c.translate(W / 2, y + h / 2); c.scale(.94 + .06 * ga, .94 + .06 * ga); c.translate(-W / 2, -(y + h / 2)); glass(c, P, x, y, w, Math.round(h)); c.restore(); sayAll(c, L, pt, t, 1.4, .15); }
    sparks(c, t, 14, '#fff4e0', 51);
  }
  const KINDS = [[/cocktail|drink|toast|champagne|कॉकटेल/i, 'tower'], [/dinner|bhoj|lunch|feast|banquet|भोज/i, 'banquet'], [/dj|dance|party|night|sangeet|डीजे|संगीत/i, 'floor']];
  const kindOf = n => (KINDS.find(([re]) => re.test(n)) || [0, 'garden'])[1];
  function fnPanel(c, s, pt, t, P, y) {
    const hi = P.opt.lang === 'hi', e = s.ev;
    const L = s.lines || (s.lines = flow([
      { s: s.label, f: hi ? 'serif' : 'caps', z: hi ? 36 : 24, col: ROSE, ls: 8, gap: 6 },
      { s: fnName(e.name, hi), f: DEV.test(fnName(e.name, hi)) ? 'display' : 'script', z: 120, gold: true, gap: 6 },
      { s: [e.time, e.venue].filter(Boolean).join('  ·  '), f: 'caps', z: 30, col: CHAMP, ls: 4, gap: 6, wrap: 2 },
      { s: e.e.dress && `${hi ? 'परिधान' : 'Dress code'} · ${clean(e.e.dress)}`, f: hi ? 'serif' : 'ital', z: 34, col: ROSE }], y + 70, 700));
    const ga = ease3((pt - .4) / .7), h = blockH(L) + 150;
    if (ga > .01) { c.save(); c.globalAlpha = ga; c.translate(0, (1 - ga) * 40); glass(c, P, 140, y, 800, Math.round(h)); c.restore(); sayAll(c, L, pt, t, .7, .14); }
  }
  function fnShot(c, s, pt, t, P) {
    const k = kOf(P), kind = kindOf(s.ev.name);
    if (kind === 'tower') {
      c.drawImage(K.art('cg-towerbg', W, H, k, g => {
        const r = g.createRadialGradient(W / 2, 1200, 50, W / 2, 1100, 1300); r.addColorStop(0, '#3a2a5a'); r.addColorStop(1, '#070a20'); g.fillStyle = r; g.fillRect(0, 0, W, H);
        g.fillStyle = '#1a1a34'; g.fillRect(0, 1770, W, 150); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(0, 1770, W, 6);
        for (let i = 0; i < 10; i++) bulbs(g, 0, W, 60 + i * 26, 30, 0, 22, ['rgba(255,224,160,A)', 'rgba(255,255,255,A)'], i + 3);
      }), 0, 0, W, H);
      glow(c, W / 2, 1400, 700, 'rgba(255,214,150,.2)');
      // pouring from the top glass down, row by row
      const pour = clamp(pt / (s.d - .3));
      TOWER.forEach(g => { const f = clamp((pour * 5.2 - (4 - g.row)) / 1); coupe(c, g.x, g.y, f, true); });
      const top = TOWER[TOWER.length - 1];
      // the bottle tilted over the top coupe with a golden stream
      c.save(); c.translate(top.x + 120, top.y - 210); c.rotate(-2.2);
      const bg = c.createLinearGradient(-30, 0, 30, 0); bg.addColorStop(0, '#0d2a1a'); bg.addColorStop(.5, '#2f6a44'); bg.addColorStop(1, '#0a1f14'); c.fillStyle = bg; rrect(c, -40, -40, 80, 220, 26); c.fill(); c.fillRect(-14, -120, 28, 90);
      c.fillStyle = RG(c, -20, -130, 20, -60); c.fillRect(-16, -130, 32, 60); c.fillStyle = '#f3e3c3'; c.fillRect(-36, 40, 72, 70); c.restore();
      c.strokeStyle = 'rgba(255,226,140,.9)'; c.lineWidth = 8; c.beginPath(); c.moveTo(top.x + 30, top.y - 120); c.quadraticCurveTo(top.x + 10, top.y - 60, top.x, top.y); c.stroke();
      const R = rng(9); c.fillStyle = 'rgba(255,248,220,.85)'; for (let i = 0; i < 40; i++) { const g = TOWER[Math.floor(R() * TOWER.length)], ph = (t * (.6 + R()) + R()) % 1; c.beginPath(); c.arc(g.x + (R() - .5) * 80, g.y + 40 - ph * 160, 2 + R() * 3, 0, TAU); c.fill(); }
      sparks(c, t, 16, '#fff3c8', 52);
      fnPanel(c, s, pt, t, P, 240);
    } else if (kind === 'banquet') {
      const z = 1.12 - .1 * ease3(pt / s.d);
      c.save(); c.translate(W / 2, 1100); c.scale(z, z); c.translate(-W / 2, -1100); c.drawImage(banquetArt(k), 0, 0, W, H);
      BANQ_FLAMES.forEach(([x, y, h], i) => flame(c, x, y, h, t, i * 2.3));
      c.restore();
      motes(c, t, 12, 'rgba(255,220,160,A)', 53);
      fnPanel(c, s, pt, t, P, 240);
    } else if (kind === 'floor') {
      c.drawImage(K.art('cg-floorbg', W, H, k, g => { const r = g.createLinearGradient(0, 0, 0, H); r.addColorStop(0, '#05051a'); r.addColorStop(.6, '#1a0a3a'); r.addColorStop(1, '#0a0418'); g.fillStyle = r; g.fillRect(0, 0, W, H); }), 0, 0, W, H);
      // sweeping beams from the mirror ball
      const bx = W / 2, by = 260;
      c.save(); for (let i = 0; i < 6; i++) { const a = Math.PI / 2 + Math.sin(t * .8 + i * 1.1) * .9, col = ['255,120,200', '120,200,255', '255,220,120'][i % 3]; const g = c.createLinearGradient(bx, by, bx + Math.cos(a) * 1600, by + Math.sin(a) * 1600); g.addColorStop(0, `rgba(${col},.32)`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + Math.cos(a - .08) * 1700, by + Math.sin(a - .08) * 1700); c.lineTo(bx + Math.cos(a + .08) * 1700, by + Math.sin(a + .08) * 1700); c.fill(); } c.restore();
      // the LED floor in perspective
      for (let j = 0; j < 7; j++) for (let i = -5; i < 5; i++) {
        const y0 = 1300 + Math.pow(j / 7, 1.5) * 620, y1 = 1300 + Math.pow((j + 1) / 7, 1.5) * 620, sp = u => lerp(60, 230, (u - 1300) / 620);
        const v = (Math.sin(t * 3 + i * 1.3 + j * .9) + 1) / 2, col = [`rgba(255,80,180,${.25 + v * .5})`, `rgba(80,180,255,${.25 + v * .5})`, `rgba(255,210,90,${.25 + v * .5})`][(i + j + 9) % 3];
        c.fillStyle = col; c.beginPath(); c.moveTo(540 + i * sp(y0), y0); c.lineTo(540 + (i + 1) * sp(y0), y0); c.lineTo(540 + (i + 1) * sp(y1), y1); c.lineTo(540 + i * sp(y1), y1); c.closePath(); c.fill();
      }
      discoBall(c, bx, by, 110, t);
      const img = coupleImage(P, s.ev.name), ca = ease((pt - .4) / .8);
      if (img && ca > .01) { c.save(); c.globalAlpha = ca; c.translate(W / 2, 1880); c.rotate(Math.sin(t * 2) * .02); c.translate(-W / 2, -1880); cutout(c, img, W / 2, 1880, 760, 'full', P.shotLook('fn'), t); c.restore(); }
      confetti(c, t, 40, ['#ff5fa2', '#5fd0ff', '#ffd76a', '#ffffff'], 54);
      fnPanel(c, s, pt, t, P, 420);
    } else {
      c.drawImage(gardenArt(k), 0, 0, W, H);
      gardenLights(c, t);
      const img = coupleImage(P, s.ev.name), ca = ease((pt - .4) / .8);
      if (img && ca > .01) { c.save(); c.globalAlpha = ca; cutout(c, img, W / 2, 1880, 760, 'full', P.shotLook('fn'), t); c.restore(); }
      fnPanel(c, s, pt, t, P, 300);
    }
  }
  function gardenLights(c, t) {
    for (const [x, sd] of [[120, 1], [960, -1]]) for (let i = 0; i < 5; i++) bulbs(c, x - 200 * sd, x + 240 * sd, 380 + i * 90, 40, t, 12, ['rgba(255,242,192,A)', 'rgba(255,224,160,A)'], i + (sd > 0 ? 0 : 9));
    bulbs(c, 0, W, 240, 140, t, 24, ['rgba(255,242,192,A)', 'rgba(255,208,224,A)'], 21);
    for (let i = 0; i < 5; i++) { const u = i / 4; for (const sd of [-1, 1]) { const x = 540 + sd * lerp(90, 380, u), y = lerp(1330, 1850, u), r = lerp(14, 36, u); glow(c, x, y - r, r * 4, 'rgba(255,200,120,.45)'); c.fillStyle = '#fff1c8'; rrect(c, x - r * .6, y - r * 2, r * 1.2, r * 1.6, r * .3); c.fill(); } }
    motes(c, t, 16, 'rgba(220,255,170,A)', 61, 6);
  }
  function danceShot(c, s, pt, t, P) {
    const k = kOf(P), hi = P.opt.lang === 'hi', card = P.card, two = !!clean(card.host2);
    c.drawImage(ballroomArt(k), 0, 0, W, H);
    c.fillStyle = 'rgba(5,8,30,.55)'; c.fillRect(0, 0, W, H);
    chandelier(c, P, W / 2, -200, .85, 1, t);
    // a spotlight cone on the couple
    const g = c.createLinearGradient(0, 400, 0, 1900); g.addColorStop(0, 'rgba(255,240,210,.0)'); g.addColorStop(1, 'rgba(255,240,210,.3)');
    c.fillStyle = g; c.beginPath(); c.moveTo(470, 380); c.lineTo(610, 380); c.lineTo(900, 1900); c.lineTo(180, 1900); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,240,210,.25)'; c.beginPath(); c.ellipse(W / 2, 1860, 360, 60, 0, 0, TAU); c.fill();
    const img = coupleImage(P), ca = ease((pt - .2) / .9), sway = Math.sin(t * 1.3) * 14;
    if (img && ca > .01) { c.save(); c.globalAlpha = ca; c.translate(sway, 0); cutout(c, img, W / 2, 1870, 980, 'full', P.shotLook('dance'), t); c.restore(); }
    const L = s.lines || (s.lines = flow([
      { s: hi ? 'नवदम्पति' : 'MR. & MRS.', f: hi ? 'serif' : 'caps', z: hi ? 44 : 34, col: ROSE, ls: 14, gap: 8 },
      { s: two ? `${clean(card.host1)} & ${clean(card.host2)}` : card.host1, f: 'script', z: 130, gold: true, gap: 6 },
      { s: hi ? 'हमारी पहली शाम, आपके साथ' : 'our first dance as one, with you', f: hi ? 'serif' : 'ital', z: 40, col: CHAMP }], 520, 960));
    sayAll(c, L, pt, t, .6, .22);
    petals(c, t, 18, ['#ffffff', '#f4c6d8', '#f3e3c3'], 71);
  }
  const petals = (c, t, n, cols, seed) => K.petals(c, t, n, cols, seed);
  function venueShot(c, s, pt, t, P) {
    const k = kOf(P), hi = P.opt.lang === 'hi', card = P.card;
    const z = 1.12 - .1 * ease3(pt / s.d);
    c.save(); c.translate(W / 2, 1300); c.scale(z, z); c.translate(-W / 2, -1300); c.drawImage(gardenArt(k), 0, 0, W, H); gardenLights(c, t); c.restore();
    // fireworks over the pavilion
    for (let i = 0; i < 3; i++) { const p = ((t * .4 + i * .33) % 1); if (p < .75) burst(c, 260 + i * 280, 220 + (i % 2) * 120, p / .75, ['255,214,170', '255,170,200', '200,220,255'][i], 36, 220); }
    const fams = (card.families || []).filter(f => f && clean(f.parents)).slice(0, 2);
    const L = s.lines || (s.lines = flow([
      { s: hi ? 'समारोह स्थल' : 'THE VENUE', f: hi ? 'display' : 'caps', z: hi ? 80 : 46, col: CHAMP, ls: 16, gap: 18 },
      { s: card.venue, f: 'script', z: 96, gold: true, wrap: 2, gap: 10 },
      { s: dateRange(card, hi), f: 'caps', z: 30, col: CHAMP, ls: 5, gap: 8 },
      { s: card.venueNote, f: 'ital', z: 32, col: ROSE, wrap: 2, gap: 24 },
      fams.length ? { s: hi ? 'आपकी प्रतीक्षा में' : 'WITH LOVE FROM', f: hi ? 'serif' : 'caps', z: hi ? 36 : 22, col: ROSE, ls: 8, gap: 6 } : null,
      ...fams.map(f => ({ s: f.parents, f: 'serif', z: 36, col: CHAMP, gap: 4 })),
      { s: K.phoneText(card.rsvp) && `RSVP · ${K.phoneText(card.rsvp)}`, f: 'caps', z: 26, col: CHAMP, ls: 4 }], 380, 720));
    const h = blockH(L) + 200, ga = ease3((pt - .3) / .8);
    if (ga > .01) { c.save(); c.globalAlpha = ga; glass(c, P, 140, 290, 800, Math.round(h)); c.restore(); sayAll(c, L, pt, t, .6, .14); }
    // the pin drops onto the pavilion path
    const q = ease3((pt - 1.2) / .6), py = lerp(900, 1500, q);
    if (q > 0) { for (let i = 0; i < 2; i++) { const r = ((pt - 1.8 + i * .6) % 1.2) / 1.2; if (pt > 1.8) { c.strokeStyle = `rgba(232,180,160,${(1 - r) * .7})`; c.lineWidth = 4; c.beginPath(); c.ellipse(540, 1500, 30 + r * 140, (30 + r * 140) * .3, 0, 0, TAU); c.stroke(); } } K.pin(c, 540, py, 120, '#c4687a'); }
  }
  function toastShot(c, s, pt, t, P) {
    const k = kOf(P), hi = P.opt.lang === 'hi';
    c.drawImage(K.art('cg-toastbg', W, H, k, g => { const r = g.createRadialGradient(W / 2, 700, 50, W / 2, 900, 1300); r.addColorStop(0, '#2c3478'); r.addColorStop(1, '#05081e'); g.fillStyle = r; g.fillRect(0, 0, W, H); }), 0, 0, W, H);
    chandelier(c, P, W / 2, -420, .6, 1, t);
    K.bokeh(c, t, false, 77);
    // two flutes meet and clink with a burst
    const meet = ease3(pt / 1.1), x = lerp(-200, 362, meet), ang = lerp(-.6, .22, meet);
    const fl = (sx, sd) => { c.save(); c.translate(sx, 1100); c.scale(sd * 1.7, 1.7); c.rotate(ang); c.strokeStyle = 'rgba(240,248,255,.9)'; c.lineWidth = 4;
      c.beginPath(); c.moveTo(-40, -300); c.quadraticCurveTo(-44, -120, 0, -60); c.quadraticCurveTo(44, -120, 40, -300); c.stroke();
      c.save(); c.beginPath(); c.moveTo(-38, -220); c.quadraticCurveTo(-42, -120, 0, -64); c.quadraticCurveTo(42, -120, 38, -220); c.closePath(); const g = c.createLinearGradient(0, -220, 0, -60); g.addColorStop(0, '#ffeaa8'); g.addColorStop(1, '#e0a838'); c.fillStyle = g; c.fill(); c.restore();
      c.beginPath(); c.moveTo(0, -60); c.lineTo(0, 80); c.stroke(); c.beginPath(); c.ellipse(0, 84, 46, 10, 0, 0, TAU); c.stroke(); c.restore(); };
    fl(x, 1); fl(W - x, -1);
    if (pt > 1.0 && pt < 2.2) { burst(c, W / 2, 600, (pt - 1) / 1.2, '255,236,190', 40, 300); glow(c, W / 2, 600, 300, `rgba(255,240,200,${(.5 * (1 - (pt - 1) / 1.2)).toFixed(2)})`); }
    const ta = ease((pt - 1.1) / .7);
    say(c, { s: hi ? 'धन्यवाद' : 'Thank You', f: hi ? 'display' : 'script', z: hi ? 130 : 170, gold: true }, W / 2, 330, ta, t);
    say(c, { s: hi ? 'हमारी ख़ुशियों में शामिल होने के लिए' : 'for raising a glass with us', f: hi ? 'serif' : 'ital', z: 42, col: CHAMP }, W / 2, 450, ta);
    K.words(c, P, s.tail, { zone: [1300, 1700, 700], L: P.shotLook('toast'), p: pt - 1.5 });
    sparks(c, t, 18, '#fff4e0', 79);
  }

  return {
    id: 'story-crystalgala', order: 14, occasion: 'reception', tune: 'cinematic', thumb: 9.5,
    name: 'The Crystal Ballroom', note: 'A red carpet at night, a crystal chandelier lighting tier by tier, a champagne tower, a candlelit banquet, a mirror-ball dance floor',
    names: ['Inaaya', 'Vedant'],
    looks: { open: 'galaxy', title: 'galaxy', invite: 'galaxy', events: ['galaxy'], date: 'galaxy', end: 'galaxy', final: 'galaxy' },
    look: (kind, K) => K.palette('galaxy', { font: { script: 'Great Vibes', serif: 'Marcellus' }, col: { names: '#f4d3b8', ink: '#f6ead8', ink2: '#e8c8b8', accent: '#e8b4a0', gold: '#e8b4a0' },
      shadow: ['rgba(10,8,30,.75)', 10], fx: () => {} }),
    timeline(S, K, card, opt) {
      const hi = opt.lang === 'hi', evs = days(card, hi).flatMap(d => d.events).slice(0, 6), fd = evs.length ? Math.max(3.4, Math.min(4.8, 16 / evs.length)) : 0;
      const labels = hi ? ['शाम की शुरुआत', 'फिर', 'और फिर', 'आगे', 'उसके बाद', 'अंत में'] : ['THE EVENING BEGINS', 'THEN', 'AND THEN', 'NEXT', 'AFTER THAT', 'TO CLOSE THE NIGHT'];
      const out = [
        { k: 'reel', reel: 'arrival', d: 5.6, name: 'Red Carpet' },
        { k: 'reel', reel: 'chand', d: 6.4, name: 'The Chandelier', cut: true, change: 'none' },
        { k: 'reel', reel: 'invite', d: 6.6, name: 'Invitation', change: 'none' }];
      evs.forEach((e, i) => out.push({ k: 'reel', reel: 'fn', ev: e, d: fd, name: e.name, label: labels[i] || '', change: ['sparkle', 'shutter', 'iris', 'bloom'][i % 4] }));
      out.push({ k: 'reel', reel: 'dance', d: 5.4, name: 'First Dance', change: 'bloom' });
      out.push({ k: 'reel', reel: 'venue', d: 6, name: 'The Garden', change: 'sparkle' });
      out.push({ k: 'reel', reel: 'toast', d: 6, name: 'Thank You', change: 'flash', sigCorner: opt.signature !== false,
        tail: [{ t: 'qr', rows: K.SITE_QR, z: 200, gap: 18 }, { t: 'text', s: hi ? 'ऐसा ही निमन्त्रण बनवाएँ' : 'Your invitation, made like this', f: hi ? 'hser' : 'italic', z: 32, col: 'ink2', gap: 4 },
          { t: 'text', s: 'cardalbum.vercel.app', f: 'serif', z: 38, col: 'names' }] });
      if (!evs.length) out.forEach(x => { x.d *= 1.15; });
      return out;
    },
    shots: { arrival: arrivalShot, chand: chandShot, invite: inviteShot, fn: fnShot, dance: danceShot, venue: venueShot, toast: toastShot }
  };
})(Cinema.kit));
