// The Velvet Promise: an engagement (or roka) film. A rose-velvet ring box opens in 3D on a solitaire that bursts
// into light; the camera dives into the diamond's facets and out through a gold ring that frames their names; a
// wax-sealed envelope cracks open and the invitation card rises out of it; each ceremony under a rose arch with the
// couple; two families joined by a red thread with a knot of a heart; save the date with a heart drawn round the
// day; two rings interlock and turn for thank you.
Cinema.register((K => {
  const { W, H, TAU, rng, clamp, ease, ease3, lerp, glow, rrect, rose, leaf, blossom, foliage, clean, days, dateRange, parents, coupleImage, cutout,
    petals, sparks, motes, burst, rays, HI, MONTHS, DAYS } = K;

  // ---------- lettering ----------
  const DEV = /[ऀ-ॿ]/;
  function fontFor(f, z, s) {
    if (DEV.test(s)) return f === 'script' ? `700 ${Math.round(z * .62)}px "Amita"` : f === 'display' ? `${Math.round(z * .82)}px "Yatra One"` : `${Math.round(z * .9)}px "Tiro Devanagari Hindi"`;
    return f === 'script' ? `${z}px "Great Vibes"` : f === 'caps' ? `${z}px "Cinzel"` : f === 'display' ? `700 ${z}px "Cinzel Decorative"` : f === 'ital' ? `italic ${z}px "Cormorant Garamond"` : `${z}px "Gilda Display"`;
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
    if (l.gold) K.foil(c, l.s, x, y, { font: c.font, dark: l.gold === 'dark', t, spacing: DEV.test(l.s) ? 0 : (l.ls || 0) * z / l.z });
    else { c.textAlign = l.align || 'center'; c.textBaseline = 'middle'; c.fillStyle = l.col || INK; c.fillText(l.s, x, y); }
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
  const sayAll = (c, L, p, t, at = .3, gap = .18, cx = W / 2) => L.forEach((l, i) => { const a = ease((p - at - i * gap) / .6); say(c, l, cx, l.y + (1 - a) * 16, a, l.gold ? t : undefined); });
  const HIFN = [[/ring|engage|sagai|ring ceremony/i, 'अंगूठी रस्म'], [/roka/i, 'रोका रस्म'], [/dinner|bhoj/i, 'रात्रिभोज'], [/dance|dj/i, 'नृत्य संध्या'], [/lunch/i, 'दोपहर भोज'],
    [/chunni|chunri/i, 'चुन्नी रस्म'], [/tilak/i, 'तिलक'], [/shagun|sagan/i, 'शगुन'], [/cocktail/i, 'कॉकटेल संध्या'], [/puja|pooja/i, 'पूजा']];
  const fnName = (n, hi) => (hi && !DEV.test(n) && (HIFN.find(([re]) => re.test(n)) || [])[1]) || n;
  const kOf = P => Math.min(1.25, Math.max(.5, P.k));
  const WINE = '#6a0f33', BLUSH = '#f7dfe0', INK = '#4a1530', ROSE = '#b0305a';
  const label = (card, hi) => hi ? (HI.label[card.type] || 'सगाई समारोह') : card.type === 'roka' ? 'Roka Ceremony' : 'Engagement Ceremony';

  // ---------- still art ----------
  function velvetBg(k) {
    return K.art('vp-velvet', W, H, k, c => {
      const g = c.createRadialGradient(W / 2, 1000, 60, W / 2, 1000, 1300); g.addColorStop(0, '#a3254f'); g.addColorStop(.55, '#5a0c2a'); g.addColorStop(1, '#1e0310'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      const R = rng(2); for (let i = 0; i < 22000; i++) { c.fillStyle = `rgba(255,200,220,${R() * .035})`; c.fillRect(R() * W, R() * H, 2, 2); }
      // satin folds catching light
      for (let i = 0; i < 6; i++) { const y = 1350 + i * 90; const sg = c.createLinearGradient(0, y - 60, 0, y + 60); sg.addColorStop(0, 'rgba(255,190,210,0)'); sg.addColorStop(.5, 'rgba(255,190,210,.08)'); sg.addColorStop(1, 'rgba(255,190,210,0)'); c.fillStyle = sg; c.beginPath(); c.moveTo(0, y); c.bezierCurveTo(300, y - 80, 700, y + 80, W, y - 20); c.lineTo(W, y + 60); c.bezierCurveTo(700, y + 140, 300, y, 0, y + 70); c.fill(); }
      const RR = rng(12); for (const [x, y] of [[60, 1820], [1020, 1800], [1000, 120], [80, 90]]) { for (let i = 0; i < 10; i++) leaf(c, x + (RR() - .5) * 240, y + (RR() - .5) * 200, 70, 24, RR() * TAU, RR() > .5 ? '#2f5a2a' : '#46703a'); for (let i = 0; i < 6; i++) rose(c, x + (RR() - .5) * 200, y + (RR() - .5) * 170, 40 + RR() * 18, i % 2 ? '#ffd0dc' : '#fff0f2', i % 2 ? '#b8325a' : '#d88aa0', RR() * 3); }
    });
  }
  // a rose arch in a garden, by day or at dusk
  function archArt(k, dusk) {
    return K.art(`vp-arch-${dusk ? 1 : 0}`, W, H, k, c => {
      const R = rng(dusk ? 8 : 7);
      const g = c.createLinearGradient(0, 0, 0, H);
      (dusk ? [[0, '#2a1a4a'], [.45, '#a4507a'], [.7, '#f4a07a'], [1, '#2a3a2a']] : [[0, '#f9d7c4'], [.5, '#fbe8d8'], [.75, '#f2c9a8'], [1, '#6a8a4a']]).forEach(([o, col]) => g.addColorStop(o, col));
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      glow(c, W / 2, 1150, 600, dusk ? 'rgba(255,200,150,.45)' : 'rgba(255,250,235,.7)');
      if (dusk) for (let i = 0; i < 80; i++) { c.fillStyle = `rgba(255,255,255,${R() * .7})`; c.beginPath(); c.arc(R() * W, R() * 600, R() * 2, 0, TAU); c.fill(); }
      for (let i = 0; i < 16; i++) foliage(c, R, i * 72, 1240 + R() * 60, 90, 80, 50, dusk ? 140 : 100, dusk ? 22 : 34, 34, 40);
      c.fillStyle = dusk ? '#2a3a26' : '#7a9a56'; c.fillRect(0, 1380, W, 540);
      c.fillStyle = dusk ? '#e9d8d0' : '#fffaf2'; c.beginPath(); c.moveTo(440, 1380); c.lineTo(640, 1380); c.lineTo(860, H); c.lineTo(220, H); c.closePath(); c.fill();
      // the arch: two posts and a curve, smothered in roses and leaves
      const pts = []; for (let i = 0; i <= 40; i++) { const u = i / 40, a = Math.PI + u * Math.PI; pts.push([540 + Math.cos(a) * 400, 820 + Math.sin(a) * 420]); }
      for (let y = 820; y < 1700; y += 46) { pts.push([140, y]); pts.push([940, y]); }
      c.strokeStyle = dusk ? '#c9b8a8' : '#ffffff'; c.lineWidth = 22; c.beginPath(); c.moveTo(140, 1700); c.lineTo(140, 820); c.arc(540, 820, 400, Math.PI, 0); c.lineTo(940, 1700); c.stroke();
      pts.forEach(([x, y], i) => { for (let j = 0; j < 3; j++) leaf(c, x + (R() - .5) * 60, y + (R() - .5) * 60, 56, 20, R() * TAU, R() > .5 ? '#3f7a3c' : '#5d9450'); });
      pts.forEach(([x, y], i) => { const n = i % 3 ? 1 : 2; for (let j = 0; j < n; j++) rose(c, x + (R() - .5) * 50, y + (R() - .5) * 50, 26 + R() * 16, ['#ffd0dc', '#ffffff', '#ffe2c4'][i % 3], ['#d0587a', '#e8c8cc', '#e0a080'][i % 3], R() * 3); if (i % 4 === 0) blossom(c, x + (R() - .5) * 60, y + (R() - .5) * 60, 14, '#ffffff', '#ffd166', R() * 6); });
      for (let i = 0; i < 50; i++) blossom(c, R() * W, 1400 + R() * 500, 10 + R() * 8, ['#ffd0dc', '#ffffff', '#f4a3b8'][i % 3], '#ffd166', R() * 6);
    });
  }

  // ---------- the ring box (drawn in simple 3D: x right, y up, z towards us) ----------
  const BOX = { cx: 540, y0: 1260, hw: 230, h: 230, d: 110, lid: 120 };
  const proj = (x, y, z) => [BOX.cx + x * (1 + z * .0005), BOX.y0 - y + z * .36];
  function quad(c, P4, fill) { c.beginPath(); P4.forEach(([x, y, z], i) => { const [sx, sy] = proj(x, y, z); i ? c.lineTo(sx, sy) : c.moveTo(sx, sy); }); c.closePath(); c.fillStyle = fill; c.fill(); }
  function velvetFill(c, y0, y1, dark) { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, dark ? '#7a1438' : '#c23a68'); g.addColorStop(1, dark ? '#3a0618' : '#7a1438'); return g; }
  function ringOnCushion(c, t, glowA, x = BOX.cx, y = BOX.y0 - BOX.h - 22, s = 1.12) {
    c.save(); c.translate(x, y); c.scale(s, s);
    if (glowA > 0) glow(c, 0, -110, 260, `rgba(255,250,235,${(.55 * glowA).toFixed(2)})`);
    // the band
    const bg = c.createLinearGradient(-90, 0, 90, 0); bg.addColorStop(0, '#9a7a3a'); bg.addColorStop(.3, '#fff2c4'); bg.addColorStop(.6, '#d4a84a'); bg.addColorStop(1, '#8a6a2a');
    c.strokeStyle = bg; c.lineWidth = 16; c.beginPath(); c.ellipse(0, -40, 70, 82, 0, 0, TAU); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 3; c.beginPath(); c.ellipse(0, -40, 62, 74, 0, Math.PI * 1.1, Math.PI * 1.6); c.stroke();
    // the solitaire: a faceted diamond in prongs
    c.translate(0, -132);
    const facets = [['#ffffff', [[-40, 0], [0, -34], [40, 0]]], ['#d6ecff', [[-40, 0], [0, 50], [0, 0]]], ['#f4fbff', [[0, 0], [0, 50], [40, 0]]], ['#b8dcff', [[-40, 0], [-22, -22], [0, -34]]], ['#e8f6ff', [[40, 0], [22, -22], [0, -34]]]];
    facets.forEach(([col, pts]) => { c.fillStyle = col; c.beginPath(); pts.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.closePath(); c.fill(); });
    c.strokeStyle = 'rgba(140,170,210,.8)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-40, 0); c.lineTo(40, 0); c.moveTo(-22, -22); c.lineTo(22, -22); c.stroke();
    c.fillStyle = '#d4a84a'; for (const px of [-36, 36]) { c.fillRect(px - 4, -4, 8, 40); }
    const tw = Math.max(0, Math.sin(t * 4)), z = 30 + 40 * tw;
    c.fillStyle = `rgba(255,255,255,${(.5 + .5 * tw) * glowA})`; c.beginPath(); c.moveTo(14, -24 - z); c.quadraticCurveTo(14, -24, 14 + z, -24); c.quadraticCurveTo(14, -24, 14, -24 + z); c.quadraticCurveTo(14, -24, 14 - z, -24); c.quadraticCurveTo(14, -24, 14, -24 - z); c.fill();
    c.restore();
  }
  function ringBox(c, th, t, glowA, mono) {
    BOX.mono = mono;
    const { hw, h, d, lid } = BOX;
    // shadow
    c.fillStyle = 'rgba(0,0,0,.4)'; c.beginPath(); c.ellipse(BOX.cx, BOX.y0 + 60, hw * 1.3, 50, 0, 0, TAU); c.fill();
    // body: front face and the open top (a satin cushion with a slit)
    quad(c, [[-hw, 0, d], [hw, 0, d], [hw, h, d], [-hw, h, d]], velvetFill(c, ...[proj(0, h, d)[1], proj(0, 0, d)[1]]));
    const sat = c.createLinearGradient(0, proj(0, h, -d)[1], 0, proj(0, h, d)[1]); sat.addColorStop(0, '#f6e6e0'); sat.addColorStop(1, '#d9b8b4');
    quad(c, [[-hw, h, -d], [hw, h, -d], [hw, h, d], [-hw, h, d]], '#5a0a26');
    quad(c, [[-hw + 18, h, -d + 14], [hw - 18, h, -d + 14], [hw - 18, h, d - 14], [-hw + 18, h, d - 14]], sat);
    const [sx0, sy0] = proj(-120, h, 0), [sx1] = proj(120, h, 0); c.strokeStyle = 'rgba(120,70,70,.5)'; c.lineWidth = 4; c.beginPath(); c.moveTo(sx0, sy0); c.lineTo(sx1, sy0); c.stroke();
    // velvet sheen down the front, satin pleats, the gold seam
    { const [fx0, fy0] = proj(-hw, h, d), [fx1, fy1] = proj(hw, 0, d), sg = c.createLinearGradient(fx0, 0, fx1, 0); sg.addColorStop(0, 'rgba(0,0,0,.25)'); sg.addColorStop(.3, 'rgba(255,190,215,.18)'); sg.addColorStop(.45, 'rgba(0,0,0,0)'); sg.addColorStop(1, 'rgba(0,0,0,.3)'); c.fillStyle = sg; c.fillRect(fx0, fy0, fx1 - fx0, fy1 - fy0); }
    for (let i = -3; i <= 3; i++) { const [a0, b0] = proj(i * 50, h, -d + 14), [a1, b1] = proj(i * 56, h, d - 14); c.strokeStyle = 'rgba(160,110,110,.18)'; c.lineWidth = 3; c.beginPath(); c.moveTo(a0, b0); c.lineTo(a1, b1); c.stroke(); }
    const [gx0, gy0] = proj(-hw, h, d), [gx1] = proj(hw, h, d); c.strokeStyle = K.goldBevel(c, gx0, gy0 - 4, gx1, gy0 + 4); c.lineWidth = 7; c.beginPath(); c.moveTo(gx0, gy0); c.lineTo(gx1, gy0); c.stroke();
    // the lid, hinged at the back of the top
    const rot = (x, dy, dz) => { const ys = dy * Math.cos(th) + dz * Math.sin(th), zs = -dy * Math.sin(th) + dz * Math.cos(th); return [x, h + ys, -d + zs]; };
    const L = (x, dy, dz) => rot(x, dy, dz);
    const inner = Math.sin(th) - .36 * Math.cos(th) > 0;
    if (th > .02 && !inner) ringOnCushion(c, t, glowA);
    if (inner) {
      const ig = c.createLinearGradient(0, proj(0, h + 2 * d, -d)[1], 0, proj(0, h, -d)[1]); ig.addColorStop(0, '#fff6f0'); ig.addColorStop(1, '#e9cfc8');
      quad(c, [L(-hw, 0, 0), L(hw, 0, 0), L(hw, 0, 2 * d), L(-hw, 0, 2 * d)], ig);
      quad(c, [L(-hw + 24, 0, 18), L(hw - 24, 0, 18), L(hw - 24, 0, 2 * d - 18), L(-hw + 24, 0, 2 * d - 18)], 'rgba(255,255,255,.35)');
    }
    if (Math.cos(th) + .36 * Math.sin(th) > 0) quad(c, [L(-hw, 0, 2 * d), L(hw, 0, 2 * d), L(hw, lid, 2 * d), L(-hw, lid, 2 * d)], velvetFill(c, proj(0, h + lid, d)[1] - 60, proj(0, h, d)[1], false));
    if (!inner) quad(c, [L(-hw, lid, 0), L(hw, lid, 0), L(hw, lid, 2 * d), L(-hw, lid, 2 * d)], velvetFill(c, proj(0, h + lid, -d)[1], proj(0, h + lid, d)[1], false));
    if (Math.cos(th) + .36 * Math.sin(th) > 0) { const q0 = proj(...L(-hw, 4, 2 * d)), q1 = proj(...L(hw, 4, 2 * d)), mid = proj(...L(0, lid / 2, 2 * d)); c.strokeStyle = K.goldBevel(c, q0[0], q0[1] - 4, q1[0], q1[1] + 4); c.lineWidth = 6; c.beginPath(); c.moveTo(q0[0], q0[1]); c.lineTo(q1[0], q1[1]); c.stroke();
      const sy = Math.max(.05, Math.cos(th)); c.save(); c.translate(mid[0], mid[1]); c.scale(1, sy); c.fillStyle = K.goldBevel(c, -40, -26, 40, 26); rrect(c, -46, -24, 92, 48, 12); c.fill(); c.fillStyle = '#7a1438'; c.font = '700 28px "Cinzel Decorative"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(BOX.mono || '', 0, 2); c.restore(); }
    if (th < .02) { const [x0, y0] = proj(-hw, h + lid, d); c.strokeStyle = 'rgba(255,190,210,.35)'; c.lineWidth = 3; c.beginPath(); c.moveTo(x0, y0); c.lineTo(proj(hw, h + lid, d)[0], y0); c.stroke(); }
    if (th > .02 && inner) ringOnCushion(c, t, glowA);
  }

  // ---------- the shots ----------
  function boxShot(c, s, pt, t, P) {
    const k = kOf(P), hi = P.opt.lang === 'hi';
    const cam = K.camAt(pt, [[0, { y: 1120, z: 1.7 }], [2.2, { y: 1060, z: 1.35 }], [s.d, { y: 1000, z: 1.42 }]]);
    c.drawImage(velvetBg(k), 0, 0, W, H);
    K.bokeh(c, t, false, 5);
    const open = ease3((pt - 1.6) / 1.4), th = open * 1.85, glowA = ease((pt - 2.2) / .8);
    if (glowA > 0) rays(c, BOX.cx, 980, t, { n: 26, r: 1300, a: .16 * glowA, col: '255,230,240' });
    c.save(); K.camera(c, cam); ringBox(c, th, t, glowA, P.ctx.letters.join('')); c.restore();
    if (pt > 2.4 && pt < 3.6) burst(c, W / 2, 900, (pt - 2.4) / 1.2, '255,250,235', 40, 380);
    if (glowA > 0) { c.save(); c.globalAlpha = glowA; sparks(c, t, 24, '#fff6e8', 7); c.restore(); }
    const a1 = ease((pt - .3) / .8), a2 = ease((pt - 3.2) / .8);
    say(c, { s: hi ? 'एक वादा' : 'A PROMISE', f: hi ? 'display' : 'caps', z: hi ? 70 : 44, col: '#ffd6e0', ls: 18 }, W / 2, 300, a1);
    say(c, { s: hi ? 'हमेशा के लिए' : 'of forever', f: hi ? 'serif' : 'script', z: hi ? 56 : 110, gold: true }, W / 2, 410, a1, t);
    say(c, { s: hi ? 'उसने हाँ कह दी!' : 'She said yes!', f: hi ? 'display' : 'script', z: hi ? 96 : 130, gold: true }, W / 2, 1560, a2, t);
    say(c, { s: hi ? 'और दो दिल एक हो गए' : 'and two hearts became one story', f: hi ? 'serif' : 'ital', z: 44, col: '#ffe4ea' }, W / 2, 1680, ease((pt - 3.7) / .7));
    if (pt > s.d - .7) { c.fillStyle = `rgba(255,255,255,${((pt - s.d + .7) / .7).toFixed(2)})`; c.fillRect(0, 0, W, H); }
  }
  // through the diamond: prismatic facets, then a gold ring framing their names
  function prismShot(c, s, pt, t, P) {
    const k = kOf(P), hi = P.opt.lang === 'hi', card = P.card, two = !!clean(card.host2);
    c.drawImage(K.art('vp-blush', W, H, k, g => { const r = g.createRadialGradient(W / 2, 900, 50, W / 2, 900, 1300); r.addColorStop(0, '#fff8f4'); r.addColorStop(.6, '#f8dcdc'); r.addColorStop(1, '#e2a8b0'); g.fillStyle = r; g.fillRect(0, 0, W, H); }), 0, 0, W, H);
    // a kaleidoscope of facets spinning open
    const fa = 1 - ease((pt - .4) / 1.4);
    if (fa > .01) {
      c.save(); c.globalAlpha = fa; c.translate(W / 2, H / 2); c.rotate(t * .4); const sc = 2.2 + pt * 1.6; c.scale(sc, sc);
      const cols = ['rgba(255,220,235,.8)', 'rgba(210,230,255,.8)', 'rgba(255,255,255,.9)', 'rgba(255,236,200,.8)', 'rgba(220,255,240,.7)'];
      for (let ring = 0; ring < 4; ring++) for (let i = 0; i < 12; i++) { const a0 = i / 12 * TAU + ring * .26, r0 = ring * 200, r1 = r0 + 200; c.fillStyle = cols[(i + ring) % 5]; c.beginPath(); c.moveTo(Math.cos(a0) * r0, Math.sin(a0) * r0); c.lineTo(Math.cos(a0 + .52) * r1, Math.sin(a0 + .52) * r1); c.lineTo(Math.cos(a0) * r1, Math.sin(a0) * r1); c.closePath(); c.fill(); c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 2; c.stroke(); }
      c.restore();
    }
    // the gold ring as a frame
    const ra = ease3((pt - .8) / 1.2), rs = lerp(1.6, 1, ra);
    if (ra > .01) {
      c.save(); c.globalAlpha = ra; c.translate(W / 2, 930); c.scale(rs, rs);
      const bg = c.createLinearGradient(-420, -420, 420, 420); bg.addColorStop(0, '#fff2c4'); bg.addColorStop(.3, '#c9962e'); bg.addColorStop(.55, '#fff6d8'); bg.addColorStop(.8, '#b8862b'); bg.addColorStop(1, '#f2d27a');
      c.strokeStyle = bg; c.lineWidth = 34; c.beginPath(); c.arc(0, 0, 400, 0, TAU); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 4; c.beginPath(); c.arc(0, 0, 388, Math.PI * 1.1, Math.PI * 1.5); c.stroke();
      ringOnCushion(c, t, 1, 0, -362, 1.15);
      for (let i = 0; i < 26; i++) { const a = i / 26 * TAU; rose(c, Math.cos(a) * 430, Math.sin(a) * 430, i % 2 ? 22 : 16, '#ffd0dc', '#d0587a', i); if (i % 2) leaf(c, Math.cos(a + .1) * 440, Math.sin(a + .1) * 440, 40, 14, a + 1.5, '#5d9450'); }
      c.restore();
    }
    const L = s.lines || (s.lines = flow([
      { s: label(card, hi), f: hi ? 'display' : 'caps', z: hi ? 60 : 30, col: ROSE, ls: 8, gap: 16 },
      { s: card.host1, f: 'script', z: 140, gold: 'dark', gap: 0 },
      two ? { s: hi ? 'संग' : '&', f: hi ? 'serif' : 'script', z: 70, col: ROSE, gap: 0 } : null,
      two ? { s: card.host2, f: 'script', z: 140, gold: 'dark', gap: 18 } : null,
      { s: dateRange(card, hi), f: hi ? 'serif' : 'caps', z: 32, col: INK, ls: 5 }], 680, 640));
    sayAll(c, L, pt, t, 1.5, .22);
    petals(c, t, 22, ['#f8bbd0', '#ffffff', '#f48fb1'], 21);
    if (pt < .5) { c.fillStyle = `rgba(255,255,255,${(1 - pt / .5).toFixed(2)})`; c.fillRect(0, 0, W, H); }
  }
  function envelopeShot(c, s, pt, t, P) {
    const k = kOf(P), hi = P.opt.lang === 'hi', card = P.card, two = !!clean(card.host2), [p1, p2] = parents(card, P.opt.lang), letters = P.ctx.letters;
    c.drawImage(K.art('vp-satin', W, H, k, g => {
      const r = g.createLinearGradient(0, 0, W, H); r.addColorStop(0, '#f9e4e2'); r.addColorStop(.5, '#f2cfd0'); r.addColorStop(1, '#e8b8bc'); g.fillStyle = r; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 8; i++) { const y = i * 260; const sg = g.createLinearGradient(0, y, 0, y + 200); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(.5, 'rgba(255,255,255,.25)'); sg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sg; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(400, y - 100, 700, y + 160, W, y + 40); g.lineTo(W, y + 160); g.bezierCurveTo(700, y + 280, 400, y + 40, 0, y + 150); g.fill(); }
      const R = rng(6); for (const [x, y] of [[80, 160], [1000, 260], [60, 1780], [1010, 1700], [940, 120]]) for (let i = 0; i < 4; i++) rose(g, x + (R() - .5) * 120, y + (R() - .5) * 120, 44, '#ffd0dc', '#c2385e', R() * 3);
    }), 0, 0, W, H);
    const ex = 140, ew = 800, ey = 1060, eh = 520, flap = ease3((pt - .9) / .8), rise = ease3((pt - 1.6) / 1.4);
    // the card rises out of the envelope and grows towards us
    const cw = lerp(740, 880, rise), ch = lerp(500, 1400, rise), cx = W / 2, cy = lerp(ey + 260, 990, rise);
    const back = () => { c.fillStyle = '#e9c9c4'; c.fillRect(ex, ey, ew, eh); };
    const front = () => {
      c.fillStyle = '#f6dcd6'; c.beginPath(); c.moveTo(ex, ey); c.lineTo(ex + ew / 2, ey + eh * .55); c.lineTo(ex + ew, ey); c.lineTo(ex + ew, ey + eh); c.lineTo(ex, ey + eh); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(160,90,90,.3)'; c.lineWidth = 2; c.beginPath(); c.moveTo(ex, ey + eh); c.lineTo(ex + ew / 2, ey + eh * .48); c.lineTo(ex + ew, ey + eh); c.stroke();
    };
    const drawCard = () => {
      c.save(); c.fillStyle = 'rgba(0,0,0,.18)'; rrect(c, cx - cw / 2 + 10, cy - ch / 2 + 18, cw, ch, 18); c.fill();
      const cg = c.createLinearGradient(0, cy - ch / 2, 0, cy + ch / 2); cg.addColorStop(0, '#fffdf8'); cg.addColorStop(1, '#f6ece0'); c.fillStyle = cg; rrect(c, cx - cw / 2, cy - ch / 2, cw, ch, 18); c.fill();
      c.strokeStyle = K.goldBevel(c, cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2); c.lineWidth = 4; rrect(c, cx - cw / 2 + 22, cy - ch / 2 + 22, cw - 44, ch - 44, 10); c.stroke();
      c.lineWidth = 1.5; rrect(c, cx - cw / 2 + 34, cy - ch / 2 + 34, cw - 68, ch - 68, 8); c.stroke();
      c.restore();
    };
    if (rise < .35) {
      back();
      // the flap, opening upwards on its fold
      const fy = ey, fh = eh * .55 * Math.cos(flap * Math.PI);
      if (flap > .5) { c.fillStyle = '#efd2cc'; c.beginPath(); c.moveTo(ex, fy); c.lineTo(ex + ew / 2, fy + fh); c.lineTo(ex + ew, fy); c.closePath(); c.fill(); }
      c.save(); c.beginPath(); c.rect(0, 0, W, ey + eh * .6); c.clip(); drawCard(); c.restore();
      front();
      if (flap <= .5) { c.fillStyle = '#f2d4ce'; c.beginPath(); c.moveTo(ex, fy); c.lineTo(ex + ew / 2, fy + fh); c.lineTo(ex + ew, fy); c.closePath(); c.fill(); c.strokeStyle = 'rgba(160,90,90,.3)'; c.stroke(); }
      // the wax seal with their initials cracks in two
      const sp = ease((pt - .6) / .5) * 40, sa = 1 - ease((pt - 1.1) / .4);
      if (sa > .01) for (const d of [-1, 1]) { c.save(); c.globalAlpha = sa; c.translate(W / 2 + d * sp, ey + eh * .55 + Math.abs(sp) * .6); c.beginPath(); c.rect(d < 0 ? -80 : 0, -80, 80, 160); c.clip();
        const wg = c.createRadialGradient(-20, -20, 5, 0, 0, 70); wg.addColorStop(0, '#d8486e'); wg.addColorStop(1, '#7a0f33'); c.fillStyle = wg; c.beginPath(); c.arc(0, 0, 70, 0, TAU); c.fill();
        c.strokeStyle = 'rgba(255,200,210,.5)'; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, 54, 0, TAU); c.stroke(); c.fillStyle = '#ffd6e0'; c.font = '700 54px "Cinzel Decorative"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(letters.join(''), 0, 4); c.restore(); }
    } else {
      c.save(); c.globalAlpha = 1 - ease((rise - .35) / .3); back(); front(); c.restore();
      drawCard();
    }
    const L = s.lines || (s.lines = flow([
      { s: hi ? 'बड़ों के आशीर्वाद से' : 'WITH THE BLESSINGS OF OUR ELDERS', f: hi ? 'serif' : 'caps', z: hi ? 40 : 24, col: '#9a5b16', ls: 5, gap: 18 },
      ...(hi ? ['आपको सपरिवार सादर आमन्त्रित करते हैं', 'सगाई के शुभ अवसर पर'] : ['we invite you to celebrate', 'the engagement of']).map(x => ({ s: x, f: hi ? 'serif' : 'ital', z: 40, col: INK, gap: 2 })),
      { s: ' ', f: 'serif', z: 10, gap: 10 },
      { s: card.host1, f: 'script', z: 124, gold: 'dark', gap: 0 }, { s: p1, f: 'serif', z: 30, col: '#7a4a5a', wrap: 2, gap: 14 },
      two ? { s: hi ? 'संग' : '&', f: hi ? 'serif' : 'script', z: 66, col: ROSE, gap: 4 } : null,
      two ? { s: card.host2, f: 'script', z: 124, gold: 'dark', gap: 0 } : null, two ? { s: p2, f: 'serif', z: 30, col: '#7a4a5a', wrap: 2, gap: 26 } : null,
      { s: hi ? 'एक अंगूठी, एक वादा और ढेर सारी ख़ुशियाँ' : card.message, f: hi ? 'serif' : 'ital', z: 36, col: ROSE, wrap: 3, gap: 30 },
      { s: dateRange(card, hi), f: hi ? 'serif' : 'caps', z: 32, col: '#7a0f33', ls: 5 }], 420, 700));
      { const hgt = s.lines[s.lines.length - 1].y - s.lines[0].y, off = 990 - hgt / 2 - s.lines[0].y; s.lines.forEach(l => { l.y += off; }); }
    if (rise > .8) sayAll(c, L, pt - 2.5, t, .1, .14);
    petals(c, t, 16, ['#f8bbd0', '#ffffff', '#f48fb1'], 22);
  }
  function fnShot(c, s, pt, t, P) {
    const k = kOf(P), hi = P.opt.lang === 'hi', e = s.ev, dusk = s.dusk;
    const z = 1.1 - .08 * ease3(pt / s.d);
    c.save(); c.translate(W / 2, 1200); c.scale(z, z); c.translate(-W / 2, -1200); c.drawImage(archArt(k, dusk), 0, 0, W, H);
    if (dusk) { for (const [x, y] of [[140, 900], [940, 900], [140, 1300], [940, 1300], [540, 430]]) { glow(c, x, y, 70, 'rgba(255,214,150,.6)'); c.fillStyle = '#fff1c8'; c.beginPath(); c.arc(x, y, 9 + Math.sin(t * 3 + x) * 2, 0, TAU); c.fill(); } motes(c, t, 14, 'rgba(255,230,180,A)', 31, 6); }
    c.restore();
    const img = coupleImage(P, e.name), ca = ease((pt - .3) / .8);
    if (img && ca > .01) { c.save(); c.globalAlpha = ca; cutout(c, img, W / 2, 1890 + (1 - ca) * 50, 900, 'full', P.shotLook('fn'), t); c.restore(); }
    // a satin ribbon banner with the ceremony's name, the details on a little card beneath
    const ba = ease3((pt - .2) / .8), by = 330;
    if (ba > .01) {
      c.save(); c.globalAlpha = ba; c.translate(W / 2, by); c.scale(ba, 1); c.translate(-W / 2, -by);
      c.fillStyle = '#7a0f33'; for (const d of [-1, 1]) { c.beginPath(); c.moveTo(W / 2 + d * 340, by - 50); c.lineTo(W / 2 + d * 470, by - 50); c.lineTo(W / 2 + d * 430, by); c.lineTo(W / 2 + d * 470, by + 50); c.lineTo(W / 2 + d * 340, by + 50); c.fill(); }
      const rg = c.createLinearGradient(0, by - 70, 0, by + 70); rg.addColorStop(0, '#d8486e'); rg.addColorStop(.5, '#b0305a'); rg.addColorStop(1, '#7a0f33'); c.fillStyle = rg;
      c.beginPath(); c.moveTo(W / 2 - 380, by - 70); c.quadraticCurveTo(W / 2, by - 110, W / 2 + 380, by - 70); c.lineTo(W / 2 + 380, by + 70); c.quadraticCurveTo(W / 2, by + 30, W / 2 - 380, by + 70); c.closePath(); c.fill();
      c.strokeStyle = '#f2d27a'; c.lineWidth = 3; c.stroke();
      c.restore();
      const n = fnName(e.name, hi);
      say(c, { s: n, f: DEV.test(n) ? 'display' : 'script', z: DEV.test(n) ? 84 : 96, col: '#fff4f6', maxW: 640 }, W / 2, by - 18, ba);
    }
    const da = ease3((pt - .7) / .7);
    if (da > .01) {
      const L = s.lines || (s.lines = flow([
        { s: e.date ? (hi ? K.hiDay(e.date) : K.dayText(e.date)) : '', f: 'serif', z: 40, col: INK, gap: 4 },
        { s: e.time, f: hi ? 'serif' : 'caps', z: hi ? 38 : 28, col: ROSE, ls: 4, gap: 4 },
        { s: e.venue, f: 'ital', z: 36, col: '#7a4a5a', wrap: 2, gap: 2 },
        { s: e.e.dress && `${hi ? 'परिधान' : 'Dress code'} · ${clean(e.e.dress)}`, f: hi ? 'serif' : 'ital', z: 32, col: '#9a5b16' }], 470, 560));
      const h = (L.length ? L[L.length - 1].y - L[0].y : 0) + 110;
      c.save(); c.globalAlpha = da; c.translate(0, (1 - da) * 30);
      c.fillStyle = 'rgba(0,0,0,.15)'; rrect(c, 236, 420, 620, h, 22); c.fill();
      c.fillStyle = 'rgba(255,252,248,.95)'; rrect(c, 230, 410, 620, h, 22); c.fill(); c.strokeStyle = '#d4a84a'; c.lineWidth = 2; rrect(c, 242, 422, 596, h - 24, 16); c.stroke();
      c.restore();
      sayAll(c, L, pt, t, .9, .12);
    }
    petals(c, t, 16, ['#f8bbd0', '#ffffff', '#f48fb1'], 23);
  }
  function familiesShot(c, s, pt, t, P) {
    const k = kOf(P), hi = P.opt.lang === 'hi', card = P.card;
    c.drawImage(velvetBg(k), 0, 0, W, H);
    K.bokeh(c, t, false, 9);
    const fams = (card.families || []).filter(f => f && clean(f.parents)).slice(0, 2);
    say(c, { s: hi ? 'दो परिवार, एक रिश्ता' : 'Two families, one promise', f: hi ? 'display' : 'script', z: hi ? 84 : 116, gold: true }, W / 2, 300, ease((pt - .2) / .7), t);
    say(c, { s: hi ? 'आपकी उपस्थिति हमारा सौभाग्य होगी' : 'your blessings would mean the world to us', f: hi ? 'serif' : 'ital', z: 42, col: '#ffe4ea' }, W / 2, 420, ease((pt - .5) / .7));
    // the red thread runs from one family to the other and ties a heart in the middle
    const draw = ease3((pt - .8) / 1.4), y = 760;
    c.save(); c.strokeStyle = '#e0303a'; c.lineWidth = 7; c.lineCap = 'round';
    const path = new Path2D(); path.moveTo(425, y); path.bezierCurveTo(470, y + 60, 480, y - 20, 540, y + 60); path.bezierCurveTo(470, y - 40, 470, y - 120, 540, y - 60); path.bezierCurveTo(610, y - 120, 610, y - 40, 540, y + 60); path.bezierCurveTo(600, y - 20, 610, y + 60, 655, y);
    c.setLineDash([2400]); c.lineDashOffset = 2400 * (1 - draw); c.stroke(path); c.restore();
    if (draw > .95) { glow(c, 540, y, 140, 'rgba(255,120,140,.4)'); sparks(c, t, 10, '#ffe0e6', 41); }
    const img = coupleImage(P), ia = ease((pt - 2.0) / .8);
    if (img && ia > .01) { c.save(); c.globalAlpha = ia; cutout(c, img, W / 2, 1600, 620, 'arch', P.shotLook('families'), t); c.restore(); }
    fams.forEach((f, i) => {
      const x = i ? 830 : 250, a = ease((pt - .5 - i * .3) / .7);
      if (a <= .01) return;
      c.save(); c.globalAlpha = a;
      const g = c.createLinearGradient(x - 150, 0, x + 150, 0); g.addColorStop(0, '#c9962e'); g.addColorStop(.5, '#fff2c4'); g.addColorStop(1, '#b8862b');
      c.fillStyle = g; c.beginPath(); c.arc(x, y, 175, 0, TAU); c.fill(); c.fillStyle = '#fff8f4'; c.beginPath(); c.arc(x, y, 160, 0, TAU); c.fill();
      for (let j = 0; j < 14; j++) { const aa = j / 14 * TAU; rose(c, x + Math.cos(aa) * 186, y + Math.sin(aa) * 186, 18, '#ffd0dc', '#d0587a', j); }
      c.restore();
      const side = hi ? (/bride/i.test(f.side) ? 'वधू पक्ष' : /groom/i.test(f.side) ? 'वर पक्ष' : clean(f.side)) : clean(f.side).toUpperCase();
      say(c, { s: side, f: hi ? 'serif' : 'caps', z: hi ? 38 : 24, col: ROSE, ls: 4, maxW: 270 }, x, y - 60, a);
      const parts = wrap(clean(f.parents), { f: 'serif', z: 40 }, 270, 3);
      parts.forEach((p2, j) => say(c, { s: p2, f: 'serif', z: 40, col: INK, maxW: 280 }, x, y + 6 + j * 46 - (parts.length - 1) * 12, a));
    });
    const ra = ease((pt - 2.4) / .7);
    say(c, { s: K.phoneText(card.rsvp) && `${hi ? 'संपर्क' : 'RSVP'} · ${K.phoneText(card.rsvp)}`, f: 'caps', z: 30, col: '#ffe4ea', ls: 4 }, W / 2, 1720, ra);
  }
  function dateShot(c, s, pt, t, P) {
    const k = kOf(P), hi = P.opt.lang === 'hi', card = P.card;
    c.drawImage(K.art('vp-satin2', W, H, k, g => { const r = g.createRadialGradient(W / 2, 800, 50, W / 2, 900, 1300); r.addColorStop(0, '#fff6f2'); r.addColorStop(1, '#efc4c8'); g.fillStyle = r; g.fillRect(0, 0, W, H); const R = rng(4); for (let i = 0; i < 40; i++) rose(g, R() * W, R() < .5 ? R() * 220 : H - R() * 220, 30 + R() * 20, '#ffd0dc', '#c2385e', R() * 3); }), 0, 0, W, H);
    const D = days(card, hi), d = (D.find(x => x.date) || {}).date;
    say(c, { s: hi ? 'शुभ तिथि' : 'Save the Date', f: hi ? 'display' : 'script', z: hi ? 110 : 150, gold: 'dark' }, W / 2, 330, ease((pt - .1) / .7), t);
    if (d) {
      // a calendar page for the month, the day circled with a heart drawn by hand
      const x = 150, y = 470, w = 780, h = 760, ca = ease3((pt - .3) / .7);
      c.save(); c.globalAlpha = ca; c.translate(0, (1 - ca) * 50);
      c.fillStyle = 'rgba(0,0,0,.14)'; rrect(c, x + 10, y + 16, w, h, 26); c.fill(); c.fillStyle = '#fffdfa'; rrect(c, x, y, w, h, 26); c.fill();
      c.fillStyle = '#7a0f33'; rrect(c, x, y, w, 130, 26); c.fill(); c.fillRect(x, y + 100, w, 30);
      say(c, { s: hi ? `${HI.months[d.getMonth()]} ${d.getFullYear()}` : `${MONTHS[d.getMonth()]} ${d.getFullYear()}`.toUpperCase(), f: hi ? 'serif' : 'caps', z: 50, col: '#ffe4ea', ls: 8 }, W / 2, y + 66, 1);
      const first = new Date(d.getFullYear(), d.getMonth(), 1).getDay(), n = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(), cw = (w - 60) / 7;
      (hi ? ['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S']).forEach((dn, i) => say(c, { s: dn, f: hi ? 'serif' : 'caps', z: 30, col: ROSE }, x + 30 + cw * (i + .5), y + 180, 1));
      let hx = 0, hy = 0;
      for (let i = 1; i <= n; i++) { const cell = first + i - 1, cx = x + 30 + cw * (cell % 7 + .5), cy = y + 250 + Math.floor(cell / 7) * 88; if (i === d.getDate()) { hx = cx; hy = cy; } say(c, { s: String(i), f: 'serif', z: 38, col: i === d.getDate() ? '#b0305a' : INK }, cx, cy, 1); }
      c.restore();
      const hd = ease3((pt - 1.0) / 1.0);
      if (hd > 0) { c.save(); c.strokeStyle = '#d0304a'; c.lineWidth = 7; c.lineCap = 'round'; const hp = new Path2D(); const r = 58; hp.moveTo(hx, hy + r * .9); hp.bezierCurveTo(hx - r * 1.9, hy - r * .2, hx - r * .8, hy - r * 1.6, hx, hy - r * .55); hp.bezierCurveTo(hx + r * .8, hy - r * 1.6, hx + r * 1.9, hy - r * .2, hx, hy + r * .9); c.setLineDash([600]); c.lineDashOffset = 600 * (1 - hd); c.stroke(hp); c.restore(); }
    }
    const L = s.lines || (s.lines = flow([
      { s: d ? (hi ? K.hiDay(d) : K.dayText(d)) : dateRange(card, hi), f: 'serif', z: 46, col: INK, gap: 6 },
      { s: card.venue, f: 'caps', z: 40, col: '#7a0f33', ls: 2, wrap: 2, gap: 6 },
      { s: card.venueNote, f: 'ital', z: 32, col: '#7a4a5a', wrap: 2 }], d ? 1310 : 700, 820));
    sayAll(c, L, pt, t, 1.4, .18);
    petals(c, t, 14, ['#f8bbd0', '#ffffff', '#f48fb1'], 24);
  }
  function ringsShot(c, s, pt, t, P) {
    const k = kOf(P), hi = P.opt.lang === 'hi';
    c.drawImage(velvetBg(k), 0, 0, W, H);
    K.bokeh(c, t, false, 13);
    rays(c, W / 2, 700, t, { n: 24, r: 1200, a: .12, col: '255,220,235' });
    // two rings interlocked, turning slowly
    const a = ease3(pt / 1.2), spin = Math.cos(t * .9);
    for (const [dx, col, back] of [[-60, ['#fff2c4', '#c9962e'], 0], [60, ['#ffe0d4', '#c98a70'], 1]]) {
      c.save(); c.globalAlpha = a; c.translate(W / 2 + dx * a, 690); c.scale(.6 + .4 * Math.abs(spin * (back ? -1 : 1)) , 1);
      const g = c.createLinearGradient(-140, -140, 140, 140); g.addColorStop(0, col[0]); g.addColorStop(.5, col[1]); g.addColorStop(1, col[0]);
      c.strokeStyle = g; c.lineWidth = 26; c.beginPath(); c.arc(0, 0, 130, 0, TAU); c.stroke(); c.restore();
    }
    if (a > .9) { c.save(); c.globalAlpha = (a - .9) * 10; ringOnCushion(c, t, 1, W / 2 - 60 + 0, 690 - 130 + 132 - 10, .7); c.restore(); }
    const ta = ease((pt - .8) / .7);
    say(c, { s: hi ? 'धन्यवाद' : 'Thank You', f: hi ? 'display' : 'script', z: hi ? 130 : 170, gold: true }, W / 2, 1000 - 720 + 10, ta, t);
    say(c, { s: hi ? 'हमारी ख़ुशियों में शामिल होने के लिए' : 'for being part of our forever', f: hi ? 'serif' : 'ital', z: 42, col: '#ffe4ea' }, W / 2, 400, ta);
    K.words(c, P, s.tail, { zone: [970, 1640, 700], L: P.shotLook('rings'), p: pt - 1.1 });
    sparks(c, t, 18, '#fff4f6', 43);
  }

  return {
    id: 'story-velvetpromise', order: 15, occasion: 'engagement', tune: 'romantic', thumb: 4.2,
    name: 'The Velvet Promise', note: 'A velvet ring box opens on a solitaire, through the diamond to their names, a wax-sealed envelope, each ceremony under a rose arch',
    names: ['Tanvi', 'Advait'],
    looks: { open: 'blush', title: 'blush', invite: 'blush', events: ['blush'], date: 'blush', end: 'blush', final: 'blush' },
    look: (kind, K) => K.palette('blush', { font: { script: 'Great Vibes', serif: 'Gilda Display' }, col: { names: '#ffd6e0', ink: '#fff2f4', ink2: '#ffe0e6', accent: '#ffc2d0', gold: '#e8c46a' },
      shadow: ['rgba(30,4,14,.75)', 10], fx: () => {} }),
    timeline(S, K, card, opt) {
      const hi = opt.lang === 'hi', evs = days(card, hi).flatMap(d => d.events.map(e => ({ ...e, date: d.date }))).slice(0, 6), fd = evs.length ? Math.max(3.6, Math.min(5.2, 17 / evs.length)) : 0;
      const out = [
        { k: 'reel', reel: 'box', d: 6.4, name: 'The Ring Box' },
        { k: 'reel', reel: 'prism', d: 5.4, name: 'Through the Diamond', cut: true, change: 'none' },
        { k: 'reel', reel: 'envelope', d: 6.6, name: 'Invitation', change: 'petals' }];
      evs.forEach((e, i) => out.push({ k: 'reel', reel: 'fn', ev: e, d: fd, name: e.name, dusk: !!(e.date && e.e.date && /T(1[7-9]|2\d)/.test(e.e.date)), change: i ? 'sparkle' : 'bloom' }));
      out.push({ k: 'reel', reel: 'families', d: 5.6, name: 'Two Families', change: 'iris' });
      if (days(card, hi).some(d => d.date) || clean(card.venue)) out.push({ k: 'reel', reel: 'date', d: 5.4, name: 'Save the Date', change: 'petals' });
      out.push({ k: 'reel', reel: 'rings', d: 6.2, name: 'Thank You', change: 'sparkle', sigCorner: opt.signature !== false,
        tail: [{ t: 'qr', rows: K.SITE_QR, z: 230, gap: 22 }, { t: 'text', s: hi ? 'ऐसा ही निमन्त्रण बनवाएँ' : 'Your invitation, made like this', f: hi ? 'hser' : 'italic', z: 34, col: 'ink2', gap: 6 },
          { t: 'text', s: 'cardalbum.vercel.app', f: 'serif', z: 40, col: 'names' }] });
      const tot = out.reduce((a, x) => a + x.d, 0);
      if (tot < 46) out.forEach(x => { x.d *= Math.min(1.3, 46 / tot); });
      return out;
    },
    shots: { box: boxShot, prism: prismShot, envelope: envelopeShot, fn: fnShot, families: familiesShot, date: dateShot, rings: ringsShot }
  };
})(Cinema.kit));
