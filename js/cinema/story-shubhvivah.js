// Shubh Vivah: a Hindi-first journey from the temple to the mandap. Temple bells swing and a row of diyas lights at
// dawn before Shri Ganesh; a kalash crowned with mango leaves under torans that unroll, the names on a gold arch;
// a nimantran scroll unrolls across a haveli wall; then the camera walks from courtyard to courtyard, each
// function in its own painted scene with the couple dressed for it and a carved gold signboard in Devanagari;
// the sacred fire of the mandap for the muhurat, the families at a marigold doorway, and thank you.
Cinema.register((K => {
  const { W, H, TAU, rng, clamp, ease, ease3, lerp, glow, rrect, leaf, marigold, mandala, rangoli, diya, bell, kalash, goldBevel, goldFill,
    clean, days, dateRange, parents, coupleImage, ganeshaImage, cutout, petals, sparks, motes, rays, foil, HI, board, flame, havan, pillar, drape,
    paperLantern, bulbs, sunflower, banana, peacock, foliage, blossom, lotus, burst, dateMedallion } = K;

  // ---------- lettering (Devanagari first) ----------
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
    if (l.gold) foil(c, l.s, x, y, { font: c.font, dark: l.gold === 'dark', t, spacing: DEV.test(l.s) ? 0 : (l.ls || 0) * z / l.z });
    else { c.textAlign = l.align || 'center'; c.textBaseline = 'middle'; c.fillStyle = l.col || '#5a1a0a'; if (l.halo) { c.lineWidth = l.halo; c.strokeStyle = 'rgba(255,248,230,.85)'; c.lineJoin = 'round'; c.strokeText(l.s, x, y); } c.fillText(l.s, x, y); }
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
  const sayAll = (c, lines, p, t, at = .3, gap = .18, cx = W / 2) => lines.forEach((l, i) => { const a = ease((p - at - i * gap) / .6); say(c, l, cx, l.y + (1 - a) * 18, a, l.gold ? t : undefined); });
  const HIFN = [[/haldi|pithi|ubtan/i, 'हल्दी'], [/mehe?n?d/i, 'मेहँदी'], [/sangeet/i, 'संगीत संध्या'], [/cocktail/i, 'कॉकटेल संध्या'], [/dj|dance/i, 'नृत्य संध्या'],
    [/phera|vivah|wedding|shaadi/i, 'पाणिग्रहण संस्कार'], [/varmala|jaimala/i, 'वरमाला'], [/baraat|barat/i, 'बारात'], [/ghud|ghod/i, 'घुड़चढ़ी'], [/reception/i, 'प्रीतिभोज'],
    [/dinner|bhoj/i, 'रात्रिभोज'], [/lunch/i, 'दोपहर भोज'], [/ring|engage|sagai/i, 'सगाई'], [/roka/i, 'रोका'], [/puja|pooja|ganesh/i, 'गणेश पूजन'], [/kirtan/i, 'कीर्तन'], [/tilak/i, 'तिलक'], [/mayra|bhaat/i, 'भात']];
  const hiName = n => (DEV.test(n) ? n : (HIFN.find(([re]) => re.test(n)) || [])[1]) || '';
  const kOf = P => Math.min(1.25, Math.max(.5, P.k));
  const SAFF = '#e2701a', VERM = '#b3261e', INK = '#5a1a0a', CREAM = '#fff6e4';

  // ---------- still art ----------
  // a mango-leaf and marigold toran with hanging strands (W × 340)
  const toranArt = k => K.art('sv-toran', W, 340, k, c => K.toran(c));
  // the temple at dawn: a shikhara, a glowing sanctum door, steps, pillars, two kalash
  function templeArt(k) {
    return K.art('sv-temple', W, H, k, c => {
      const s = c.createLinearGradient(0, 0, 0, H); s.addColorStop(0, '#f7b267'); s.addColorStop(.42, '#f4845f'); s.addColorStop(.62, '#f9c784'); s.addColorStop(1, '#8a3b12');
      c.fillStyle = s; c.fillRect(0, 0, W, H);
      glow(c, W / 2, 560, 620, 'rgba(255,240,190,.75)');
      c.fillStyle = '#fff0c8'; c.beginPath(); c.arc(W / 2, 560, 120, 0, TAU); c.fill();
      for (let i = 0; i < 5; i++) { c.fillStyle = `rgba(255,245,230,${.25 - i * .03})`; c.beginPath(); c.ellipse(200 + i * 190, 300 + (i % 2) * 90, 160, 34, 0, 0, TAU); c.fill(); }
      // the shikhara: stacked tiers rising to a kalash and a saffron flag
      const st = c.createLinearGradient(240, 0, 840, 0); st.addColorStop(0, '#9a4a22'); st.addColorStop(.5, '#e0a060'); st.addColorStop(1, '#8a3e1a');
      c.fillStyle = st;
      c.beginPath(); c.moveTo(250, 1250); c.bezierCurveTo(280, 900, 420, 640, 540, 520); c.bezierCurveTo(660, 640, 800, 900, 830, 1250); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(90,30,10,.35)'; c.lineWidth = 3;
      for (let i = 1; i < 12; i++) { const y = 520 + i * 62, half = 40 + Math.pow(i / 12, .8) * 250; c.beginPath(); c.moveTo(540 - half, y); c.quadraticCurveTo(540, y - 22, 540 + half, y); c.stroke(); }
      for (let i = 0; i < 9; i++) { const y = 600 + i * 70, half = 50 + i * 26; c.fillStyle = 'rgba(255,220,160,.35)'; c.fillRect(540 - half, y, 8, 40); c.fillRect(540 + half - 8, y, 8, 40); }
      c.fillStyle = goldFill(c, 430, 520); c.beginPath(); c.ellipse(540, 495, 36, 30, 0, 0, TAU); c.fill(); c.fillRect(534, 420, 12, 60);
      c.fillStyle = '#ff7a00'; c.beginPath(); c.moveTo(546, 380); c.lineTo(660, 400); c.lineTo(546, 440); c.fill();
      c.strokeStyle = '#5a2a10'; c.lineWidth = 4; c.beginPath(); c.moveTo(546, 380); c.lineTo(546, 470); c.stroke();
      // the mandapa in front: a wide base with pillars and the sanctum door
      c.fillStyle = '#c8783c'; c.fillRect(120, 1150, 840, 420);
      c.fillStyle = '#e8a35c'; c.fillRect(90, 1110, 900, 60); c.fillStyle = '#b0602a'; c.fillRect(90, 1165, 900, 14);
      for (const x of [170, 300, 780, 910]) { const g = c.createLinearGradient(x - 30, 0, x + 30, 0); g.addColorStop(0, '#a0521e'); g.addColorStop(.5, '#f0b878'); g.addColorStop(1, '#a0521e'); c.fillStyle = g; c.fillRect(x - 28, 1180, 56, 390); c.fillStyle = '#e8a35c'; c.fillRect(x - 40, 1180, 80, 22); c.fillRect(x - 40, 1550, 80, 22); }
      // the sanctum door (lit from within)
      c.save(); c.beginPath(); c.moveTo(390, 1570); c.lineTo(390, 1330); c.quadraticCurveTo(390, 1210, 540, 1200); c.quadraticCurveTo(690, 1210, 690, 1330); c.lineTo(690, 1570); c.closePath();
      const dg = c.createRadialGradient(540, 1400, 20, 540, 1400, 260); dg.addColorStop(0, '#fff3c4'); dg.addColorStop(.6, '#ffc35a'); dg.addColorStop(1, '#c86a1a'); c.fillStyle = dg; c.fill(); c.restore();
      c.strokeStyle = goldBevel(c, 380, 1190, 700, 1580); c.lineWidth = 12; c.beginPath(); c.moveTo(390, 1570); c.lineTo(390, 1330); c.quadraticCurveTo(390, 1210, 540, 1200); c.quadraticCurveTo(690, 1210, 690, 1330); c.lineTo(690, 1570); c.stroke();
      // steps
      for (let i = 0; i < 5; i++) { c.fillStyle = i % 2 ? '#d99a5e' : '#e9b077'; c.fillRect(60 - i * 20, 1570 + i * 70, 960 + i * 40, 70); c.fillStyle = 'rgba(90,40,10,.25)'; c.fillRect(60 - i * 20, 1630 + i * 70, 960 + i * 40, 10); }
      kalash(c, 300, 1570, 190); kalash(c, 780, 1570, 190);
      // rangoli at the threshold
      rangoli(c, 540, 1760, 120);
    });
  }
  // the kalash title: cream and saffron with a mandala, a lotus pond line at the foot
  function kalashArt(k) {
    return K.art('sv-kalashbg', W, H, k, c => {
      const g = c.createRadialGradient(W / 2, 760, 80, W / 2, 900, 1300); g.addColorStop(0, '#fff8e6'); g.addColorStop(.6, '#ffd9a0'); g.addColorStop(1, '#e98a3a'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.globalAlpha = .18; mandala(c, W / 2, 760, 520, '#c2410c', 0); mandala(c, W / 2, 760, 330, '#c2410c', .2); c.globalAlpha = 1;
      for (const d of [-1, 1]) { c.save(); c.translate(W / 2 + d * 470, 1250); for (let i = 0; i < 7; i++) banana(c, d * 10, 600, 760 - i * 30, d, rng(7 + i)); c.restore(); }
    });
  }
  // a haveli wall: terracotta, three jharokha arches with lattice, a stone floor
  function havelArt(k) {
    return K.art('sv-haveli', W, H, k, c => {
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#f2a07b'); g.addColorStop(1, '#d9673f'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      const R = rng(9); for (let i = 0; i < 4000; i++) { c.fillStyle = `rgba(120,40,10,${R() * .06})`; c.fillRect(R() * W, R() * H, 3, 3); }
      for (const [x, w, y, h] of [[60, 260, 380, 620], [760, 260, 380, 620]]) {
        c.fillStyle = '#7a2a12'; c.beginPath(); c.moveTo(x, y + h); c.lineTo(x, y + w / 2); c.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); c.lineTo(x + w, y + h); c.closePath(); c.fill();
        c.save(); c.clip(); c.strokeStyle = 'rgba(255,200,140,.5)'; c.lineWidth = 3; for (let i = -10; i < 20; i++) { c.beginPath(); c.moveTo(x + i * 30, y); c.lineTo(x + i * 30 + h, y + h); c.stroke(); c.beginPath(); c.moveTo(x + i * 30, y + h); c.lineTo(x + i * 30 + h, y); c.stroke(); } c.restore();
        c.strokeStyle = '#f6d38a'; c.lineWidth = 10; c.beginPath(); c.moveTo(x, y + h); c.lineTo(x, y + w / 2); c.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); c.lineTo(x + w, y + h); c.stroke();
        c.fillStyle = '#f6d38a'; c.fillRect(x - 30, y + h, w + 60, 30);
      }
      c.fillStyle = '#b5532c'; c.fillRect(0, 1640, W, 280); c.fillStyle = '#8a3a1a'; c.fillRect(0, 1640, W, 16);
      for (let i = 0; i < 6; i++) { c.strokeStyle = 'rgba(60,20,8,.3)'; c.beginPath(); c.moveTo(i * 200, 1656); c.lineTo(i * 200 - 120, H); c.stroke(); }
      for (const x of [140, 940]) { c.save(); c.translate(x, 1700); for (let i = 0; i < 20; i++) marigold(c, (i % 5 - 2) * 34, -Math.floor(i / 5) * 30, 22, i % 2 ? 40 : 30); c.restore(); }
    });
  }

  // ---------- each function's painted courtyard (the camera walks from one to the next) ----------
  const SCENES = [
    [/haldi|pithi|ubtan|हल्दी/i, 'haldi'], [/mehe?n?d|मेहँदी|मेहंदी/i, 'mehendi'], [/sangeet|cocktail|dj|dance|garba|dandiya|संगीत/i, 'sangeet'],
    [/phera|vivah|wedding|shaadi|varmala|jaimala|mandap|फेरे|विवाह/i, 'mandap'], [/reception|dinner|bhoj|swagat|स्वागत|प्रीतिभोज/i, 'gala'], [/baraat|barat|ghud|बारात/i, 'baraat']];
  const sceneOf = n => (SCENES.find(([re]) => re.test(n)) || [0, 'temple'])[1];
  function sceneArt(k, kind) {
    return K.art(`sv-scene-${kind}`, W, H, k, c => {
      const R = rng(kind.length * 17);
      if (kind === 'haldi') {
        const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#ffe27a'); g.addColorStop(.7, '#ffc23a'); g.addColorStop(1, '#e89a10'); c.fillStyle = g; c.fillRect(0, 0, W, H);
        glow(c, W / 2, 700, 700, 'rgba(255,255,230,.6)');
        for (let x = 30; x < W; x += 70) for (let y = 0; y < 1100 - Math.abs(x - W / 2) * .6; y += 30) marigold(c, x, y, 15, (x / 70 + y / 30) % 3 ? 44 : 32);
        c.fillStyle = '#c87a14'; c.fillRect(0, 1560, W, 360);
        c.fillStyle = goldFill(c, 1600, 1700); c.beginPath(); c.ellipse(W / 2, 1640, 300, 70, 0, 0, Math.PI); c.fill();
        for (let i = 0; i < 26; i++) marigold(c, W / 2 - 240 + R() * 480, 1630 + R() * 30, 20, R() > .5 ? 44 : 30);
        for (const [x, d] of [[60, 1], [1020, -1]]) for (let i = 0; i < 4; i++) banana(c, x, 1650, 900 - i * 80, d, R);
        for (let i = 0; i < 12; i++) sunflower(c, 40 + i * 92, 1820 + (i % 2) * 40, 58, R() * TAU);
      } else if (kind === 'mehendi') {
        const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#d8f0c0'); g.addColorStop(.6, '#9fd08a'); g.addColorStop(1, '#3f7a3a'); c.fillStyle = g; c.fillRect(0, 0, W, H);
        for (let i = 0; i < 14; i++) foliage(c, R, i * 85, 180 + R() * 120, 160, 140, 60, 110, 38, 46, 45);
        c.globalAlpha = .25; for (const [x, y] of [[180, 820], [900, 820]]) { mandala(c, x, y, 160, '#2f5a22', 0); } c.globalAlpha = 1;
        // the jhoola frame decked with flowers
        c.strokeStyle = '#7a4a1a'; c.lineWidth = 26; c.beginPath(); c.moveTo(170, 1700); c.lineTo(250, 520); c.lineTo(830, 520); c.lineTo(910, 1700); c.stroke();
        for (let i = 0; i <= 30; i++) { const u = i / 30; blossom(c, 250 + u * 580, 520 + Math.sin(u * Math.PI * 4) * 16, 24, i % 2 ? '#f06aaf' : '#ffffff', '#ffd166', i); }
        for (const x of [250, 830]) for (let i = 0; i < 18; i++) blossom(c, x + Math.sin(i) * 10, 540 + i * 60, 18, i % 3 ? '#f48fb1' : '#fff', '#ffd166', i);
        peacock(c, 120, 1500, 300, 1, 5); peacock(c, 960, 1500, 300, -1, 6);
        c.fillStyle = '#3a6b2a'; c.fillRect(0, 1700, W, 220);
        for (let i = 0; i < 40; i++) blossom(c, R() * W, 1720 + R() * 180, 16, ['#f06aaf', '#ffffff', '#ffd166'][i % 3], '#fff', R() * 6);
      } else if (kind === 'sangeet') {
        const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#120c3a'); g.addColorStop(.6, '#3a1a6a'); g.addColorStop(1, '#6a1f5a'); c.fillStyle = g; c.fillRect(0, 0, W, H);
        for (let i = 0; i < 120; i++) { c.fillStyle = `rgba(255,255,255,${R() * .8})`; c.beginPath(); c.arc(R() * W, R() * 900, R() * 2.5, 0, TAU); c.fill(); }
        K.drapes(c, ['#b0245a', '#e8c46a', '#5a1030'], false);
        c.fillStyle = '#2a0f30'; c.fillRect(0, 1600, W, 320); c.fillStyle = '#e8c46a'; c.fillRect(0, 1600, W, 10);
        for (let i = 0; i < 8; i++) { const g2 = c.createLinearGradient(0, 1600, 0, 1000); g2.addColorStop(0, 'rgba(255,220,150,.18)'); g2.addColorStop(1, 'rgba(255,220,150,0)'); c.fillStyle = g2; c.beginPath(); c.moveTo(100 + i * 125, 1600); c.lineTo(60 + i * 125, 1000); c.lineTo(160 + i * 125, 1000); c.fill(); }
      } else if (kind === 'mandap') {
        const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#5a0a10'); g.addColorStop(.5, '#a3202a'); g.addColorStop(1, '#3d0508'); c.fillStyle = g; c.fillRect(0, 0, W, H);
        glow(c, W / 2, 1300, 700, 'rgba(255,170,80,.45)');
        for (const x of [120, 960]) pillar(c, x, 360, 1640, 60);
        for (const x of [300, 780]) pillar(c, x, 470, 1560, 40);
        c.fillStyle = goldFill(c, 260, 380); c.beginPath(); c.moveTo(40, 380); c.quadraticCurveTo(540, 160, 1040, 380); c.lineTo(1040, 410); c.quadraticCurveTo(540, 200, 40, 410); c.fill();
        drape(c, 120, 400, 540, 560, 'rgba(255,230,190,.8)'); drape(c, 540, 400, 960, 560, 'rgba(255,230,190,.8)');
        for (const x of [120, 300, 780, 960]) for (let i = 0; i < 26; i++) marigold(c, x + Math.sin(i * .7) * 6, 420 + i * 40, 16, i % 2 ? 44 : 30);
        c.fillStyle = '#7a1414'; c.fillRect(0, 1640, W, 280); c.fillStyle = goldFill(c, 1630, 1660); c.fillRect(0, 1636, W, 12);
        rangoli(c, W / 2, 1790, 110);
        for (const x of [240, 840]) kalash(c, x, 1640, 150);
      } else if (kind === 'gala') {
        const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0e0a2a'); g.addColorStop(.55, '#3a1648'); g.addColorStop(1, '#1a0820'); c.fillStyle = g; c.fillRect(0, 0, W, H);
        for (let i = 0; i < 100; i++) { c.fillStyle = `rgba(255,255,255,${R() * .7})`; c.beginPath(); c.arc(R() * W, R() * 800, R() * 2, 0, TAU); c.fill(); }
        c.fillStyle = '#2a1030'; c.fillRect(60, 1000, 960, 640);
        for (const [x, r] of [[540, 190], [220, 110], [860, 110]]) { c.beginPath(); c.arc(x, 1000, r, Math.PI, 0); c.fill(); c.fillRect(x - 4, 1000 - r - 50, 8, 50); }
        for (let j = 0; j < 3; j++) for (let i = 0; i < 12; i++) { const wx = 110 + i * 76, wy = 1080 + j * 150; c.fillStyle = '#ffcf7a'; c.beginPath(); c.moveTo(wx - 16, wy + 80); c.lineTo(wx - 16, wy + 20); c.arc(wx, wy + 20, 16, Math.PI, 0); c.lineTo(wx + 16, wy + 80); c.fill(); }
        c.fillStyle = '#140818'; c.fillRect(0, 1640, W, 280);
        c.fillStyle = 'rgba(255,207,122,.25)'; for (let i = 0; i < 12; i++) c.fillRect(100 + i * 76, 1660 + (i % 3) * 8, 20, 120);
      } else if (kind === 'baraat') {
        const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#ffb35a'); g.addColorStop(1, '#c2410c'); c.fillStyle = g; c.fillRect(0, 0, W, H);
        for (let i = 0; i < 7; i++) K.chhatri(c, 80 + i * 155, 1200 + (i % 2) * 40, 150);
        c.fillStyle = '#8a3a12'; c.fillRect(0, 1600, W, 320);
      } else {
        c.drawImage(templeArt(k), 0, 0, W, H);
      }
    });
  }
  // the moving parts of each courtyard
  function sceneLive(c, kind, t) {
    if (kind === 'haldi') petals(c, t, 24, ['#ffd23f', '#ff9f1c', '#fff3b0'], 31);
    else if (kind === 'mehendi') petals(c, t, 18, ['#f48fb1', '#ffffff', '#9ccc65'], 32);
    else if (kind === 'sangeet') {
      bulbs(c, 0, W, 300, 120, t, 26, ['rgba(255,215,106,A)', 'rgba(255,143,177,A)', 'rgba(143,211,255,A)'], 3); bulbs(c, 0, W, 480, 90, t, 22, ['rgba(255,215,106,A)', 'rgba(255,255,255,A)'], 4);
      for (const [x, y, col] of [[200, 640, '#e2348f'], [540, 600, '#ffb238'], [880, 640, '#7e57c2']]) paperLantern(c, x, y + Math.sin(t * 1.4 + x) * 8, 54, col, 1);
      sparks(c, t, 16, '#fff4c8', 33);
    } else if (kind === 'mandap') {
      havan(c, W / 2, 1640, 120, t); for (let i = 0; i < 4; i++) flame(c, W / 2 - 60 + i * 40, 1590, 110 + Math.sin(t * 3 + i) * 12, t, i * 3);
      petals(c, t, 26, ['#ff8f00', '#ffca28', '#c62828'], 34); motes(c, t, 10, 'rgba(255,200,120,A)', 35);
    } else if (kind === 'gala') {
      for (let i = 0; i < 3; i++) { const p = ((t * .45 + i * .33) % 1), x = 220 + i * 320, y = 360 + (i % 2) * 120; if (p < .8) burst(c, x, y, p / .8, ['255,214,120', '255,140,190', '160,220,255'][i], 34, 240); }
      sparks(c, t, 20, '#ffe7a6', 36);
    } else petals(c, t, 22, ['#ff8f00', '#ffca28', '#ffffff'], 37);
  }

  // ---------- the shots ----------
  function templeShot(c, s, pt, t, P) {
    const k = kOf(P), hi = P.opt.lang === 'hi';
    const cam = K.camAt(pt, [[0, { y: 900, z: 1.05 }], [s.d, { y: 1200, z: 1.32 }]]);
    c.save(); K.camera(c, cam); c.drawImage(templeArt(k), 0, 0, W, H);
    // Shri Ganesh glowing in the sanctum
    const img = ganeshaImage(P), ga = ease((pt - .6) / 1.2);
    if (ga > .01 && P.opt.ganeshaArt !== 'none') {
      c.save(); c.globalAlpha = ga; glow(c, 540, 1420, 260, 'rgba(255,240,180,.8)');
      if (img && img.complete && img.naturalWidth) { const h = 300, w = img.naturalWidth * h / img.naturalHeight; c.drawImage(img, 540 - w / 2, 1262, w, h); } else K.ganesha(c, 540, 1270, 280, t);
      c.restore();
    }
    // the diyas light one by one along the steps
    for (let i = 0; i < 9; i++) { const lit = ease((pt - .3 - i * .18) / .3); const x = 120 + i * 105; if (lit > 0) { c.save(); c.globalAlpha = lit; diya(c, x, 1650, 34, t); c.restore(); } else { c.fillStyle = '#7a3a12'; c.beginPath(); c.ellipse(x, 1645, 21, 12, 0, 0, Math.PI); c.fill(); } }
    c.restore();
    // temple bells swing in the foreground
    for (const [x, len, ph] of [[150, 360, 0], [360, 250, 1.3], [720, 250, 2.1], [930, 360, .7]]) {
      const ang = Math.sin(t * 2.6 + ph) * .16 * (1 - .4 * clamp(pt / s.d));
      c.save(); c.translate(x, -10); c.rotate(ang); c.strokeStyle = '#6a3a10'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, len); c.stroke();
      for (let i = 0; i < 6; i++) marigold(c, 0, 30 + i * (len - 60) / 6, 14, i % 2 ? 44 : 30);
      bell(c, 0, len, 90); c.restore();
    }
    const a1 = ease((pt - 1.4) / .7), a2 = ease((pt - 2.2) / .7);
    c.save(); c.globalAlpha = Math.max(a1, a2) * .85; const g = c.createLinearGradient(0, 380, 0, 900); g.addColorStop(0, 'rgba(90,20,0,0)'); g.addColorStop(.5, 'rgba(90,20,0,.45)'); g.addColorStop(1, 'rgba(90,20,0,0)'); c.fillStyle = g; c.fillRect(0, 380, W, 520); c.restore();
    say(c, { s: '॥ श्री गणेशाय नमः ॥', f: 'display', z: 92, gold: true, maxW: 940 }, W / 2, 530 + (1 - a1) * 20, a1, t);
    say(c, { s: 'मंगलम् भगवान विष्णुः मंगलम् गरुड़ध्वजः', f: 'serif', z: 46, col: '#fff3d6', maxW: 940 }, W / 2, 650, a2);
    say(c, { s: 'मंगलम् पुण्डरीकाक्षः मंगलाय तनो हरिः', f: 'serif', z: 46, col: '#fff3d6', maxW: 940 }, W / 2, 720, a2);
    if (!hi) say(c, { s: 'May all that is auspicious bless this union', f: 'ital', z: 40, col: '#ffe2b0', maxW: 900 }, W / 2, 800, ease((pt - 2.8) / .7));
    if (pt > s.d - .6) { c.fillStyle = `rgba(255,240,210,${((pt - s.d + .6) / .6 * .8).toFixed(2)})`; c.fillRect(0, 0, W, H); }
  }
  function kalashShot(c, s, pt, t, P) {
    const k = kOf(P), hi = P.opt.lang === 'hi', card = P.card, two = !!clean(card.host2);
    const z = 1.08 - .08 * ease3(pt / s.d);
    c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2); c.drawImage(kalashArt(k), 0, 0, W, H); c.restore();
    rays(c, W / 2, 1450, t, { n: 24, r: 1300, a: .14, col: '255,200,110' });
    // the rangoli blooms under the kalash, the kalash settles, torans unroll from above
    const ra = ease3((pt - .2) / 1.2);
    if (ra > 0) { c.save(); c.translate(W / 2, 1720); c.scale(ra, ra * .42); c.rotate(t * .1); rangoli(c, 0, 0, 300); c.restore(); }
    const ka = ease3((pt - .4) / 1);
    c.save(); c.globalAlpha = ka; c.translate(0, (1 - ka) * 120); glow(c, W / 2, 1520, 320, 'rgba(255,230,160,.6)'); kalash(c, W / 2, 1760, 380);
    c.font = '90px "Tiro Devanagari Hindi"'; c.textAlign = 'center'; c.fillStyle = '#b3261e'; c.fillText('卐', W / 2, 1662); c.restore();
    for (const x of [300, 780]) { c.save(); c.globalAlpha = ka; diya(c, x, 1760, 60, t); c.restore(); }
    const ta = ease3((pt - .1) / 1.1); c.save(); c.beginPath(); c.rect(0, 0, W, 340 * ta + 1); c.clip(); c.drawImage(toranArt(k), 0, 0, W, 340); c.restore();
    // the names on a gold arch
    const ba = ease3((pt - 1.0) / .9), bx = 130, by = 400, bw = 820, bh = 840;
    if (ba > .01) {
      c.save(); c.globalAlpha = ba; c.translate(W / 2, by + bh / 2); c.scale(.9 + .1 * ba, .9 + .1 * ba); c.translate(-W / 2, -(by + bh / 2));
      board(c, { style: 'arch', tone: 'cream', x: bx, y: by, w: bw, h: bh, k, gem: '#c0262d' });
      c.restore();
      const L = s.lines || (s.lines = flow([
        { s: 'शुभ विवाह', f: 'display', z: 128, col: VERM, gap: 6 },
        { s: hi ? 'मंगल परिणय' : 'The Wedding Celebration of', f: hi ? 'serif' : 'caps', z: hi ? 40 : 26, col: '#9a5b16', ls: 4, gap: 20 },
        { s: card.host1, f: 'script', z: 112, col: INK, gap: 0 },
        two ? { s: hi ? 'संग' : 'with', f: 'ital', z: 44, col: '#b8862b', gap: 0 } : null,
        two ? { s: card.host2, f: 'script', z: 112, col: INK, gap: 18 } : null,
        { s: dateRange(card, hi), f: 'serif', z: 38, col: '#7a3a12' }], by + 150, 640));
      sayAll(c, L, pt, t, 1.3, .2);
    }
    petals(c, t, 20, ['#ff8f00', '#ffca28', '#e53935'], 41);
    if (pt < .6) { c.fillStyle = `rgba(255,240,210,${((1 - pt / .6) * .8).toFixed(2)})`; c.fillRect(0, 0, W, H); }
  }
  function nimantranShot(c, s, pt, t, P) {
    const k = kOf(P), hi = P.opt.lang === 'hi', card = P.card, two = !!clean(card.host2), [p1, p2] = parents(card, P.opt.lang);
    c.drawImage(havelArt(k), 0, 0, W, H);
    c.drawImage(toranArt(k), 0, Math.sin(t) * 3, W, 340);
    // the scroll: a wooden rod at the top, the paper unrolling down to a second rod
    const u = ease3((pt - .2) / 1.4), top = 330, full = 1240, h = full * u, x = 140, w = 800;
    c.save(); c.fillStyle = 'rgba(60,20,8,.35)'; c.fillRect(x + 14, top + 20, w, h);
    const pg = c.createLinearGradient(x, 0, x + w, 0); pg.addColorStop(0, '#f1dcae'); pg.addColorStop(.1, '#fff6e0'); pg.addColorStop(.9, '#fff6e0'); pg.addColorStop(1, '#f1dcae');
    c.fillStyle = pg; c.fillRect(x, top, w, h);
    c.beginPath(); c.rect(x, top, w, h); c.clip();
    c.strokeStyle = '#c2410c'; c.lineWidth = 4; c.strokeRect(x + 30, top + 30, w - 60, full - 60); c.lineWidth = 1.5; c.strokeRect(x + 42, top + 42, w - 84, full - 84);
    c.globalAlpha = .1; mandala(c, W / 2, top + full / 2, 330, '#c2410c', 0); c.globalAlpha = 1;
    const L = s.lines || (s.lines = flow([
      { s: 'निमन्त्रण', f: 'display', z: 96, col: VERM, gap: 0 },
      { s: hi ? '' : 'An Invitation', f: 'caps', z: 24, col: '#9a5b16', ls: 6, gap: 16 },
      ...(hi ? HI.invite.wedding.split('\n') : ['With the blessings of the Almighty and our elders,', 'we request your gracious presence at the wedding of']).map(x => ({ s: x, f: hi ? 'serif' : 'ital', z: hi ? 38 : 36, col: INK, gap: 2 })),
      { s: ' ', f: 'serif', z: 10, gap: 8 },
      { s: card.host1, f: 'script', z: 118, col: VERM, gap: 0 }, { s: p1, f: 'serif', z: 30, col: '#7a3a12', wrap: 2, gap: 10 },
      two ? { s: hi ? 'संग' : 'with', f: 'ital', z: 44, col: '#b8862b', gap: 6 } : null,
      two ? { s: card.host2, f: 'script', z: 118, col: VERM, gap: 0 } : null, two ? { s: p2, f: 'serif', z: 30, col: '#7a3a12', wrap: 2, gap: 20 } : null,
      { s: hi ? 'आपकी गरिमामयी उपस्थिति प्रार्थनीय है' : 'Your presence will make it complete', f: hi ? 'serif' : 'ital', z: 36, col: '#9a5b16' }], top + 110, 680));
    sayAll(c, L, pt, t, 1.0, .16);
    c.restore();
    // the rods, with gold finials
    for (const y of [top - 10, top + h]) { const rg = c.createLinearGradient(0, y - 18, 0, y + 18); rg.addColorStop(0, '#a0521e'); rg.addColorStop(.5, '#e0a060'); rg.addColorStop(1, '#6a2a0a'); c.fillStyle = rg; rrect(c, x - 40, y - 18, w + 80, 36, 18); c.fill(); for (const fx of [x - 50, x + w + 50]) { c.fillStyle = goldFill(c, y - 26, y + 26); c.beginPath(); c.arc(fx, y, 26, 0, TAU); c.fill(); } }
    petals(c, t, 14, ['#ff8f00', '#ffca28', '#ffffff'], 42);
  }
  // one function: its courtyard (walked into from the last one), the couple, a gold signboard
  function fnShot(c, s, pt, t, P) {
    const k = kOf(P), hi = P.opt.lang === 'hi', e = s.ev, kind = sceneOf(e.name), walk = s.prevKind ? ease3(pt / .9) : 1;
    const drawScene = (kd, x) => { c.save(); c.translate(x, 0); const z = 1.04; c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2 - Math.sin(t * .2) * 8, -H / 2); c.drawImage(sceneArt(k, kd), 0, 0, W, H); sceneLive(c, kd, t); c.restore(); };
    if (walk < 1) drawScene(s.prevKind, -W * walk);
    drawScene(kind, W * (1 - walk));
    c.drawImage(toranArt(k), 0, -30 + Math.sin(t * 1.1) * 3, W, 340);
    // the couple, dressed for it
    const img = coupleImage(P, e.name), ca = ease((pt - .5) / .8);
    if (img && ca > .01) { c.save(); c.globalAlpha = ca; cutout(c, img, W / 2, 1880 + (1 - ca) * 60, 830, 'full', P.shotLook('fn'), t); c.restore(); }
    // the signboard swings down on its strings
    const ba = ease3((pt - .3) / .8), sw = Math.sin(pt * 4) * .05 * Math.exp(-pt * 1.6), bx = 160, by = 330, bw = 760, bh = 640;
    if (ba > .01) {
      c.save(); c.translate(W / 2, 0); c.rotate(sw); c.translate(-W / 2, -(1 - ba) * 700);
      c.strokeStyle = goldBevel(c, 0, 0, W, by); c.lineWidth = 5; for (const x of [bx + 110, bx + bw - 110]) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, by + 30); c.stroke(); for (let i = 0; i < 6; i++) marigold(c, x, 60 + i * 48, 13, i % 2 ? 44 : 30); }
      const hn = hiName(e.name), d = e.date;
      const L = s.lines || (s.lines = flow([
        { s: hi ? 'आप सादर आमन्त्रित हैं' : 'You are invited to the', f: hi ? 'serif' : 'ital', z: 34, col: '#9a5b16', gap: 8 },
        { s: hn || e.name, f: hn ? 'display' : 'script', z: hn ? 116 : 120, col: VERM, gap: 0 },
        { s: hi ? '' : (hn ? e.name.toUpperCase() : ''), f: 'caps', z: 26, col: '#9a5b16', ls: 8, gap: 14 },
        { s: d ? (hi ? K.hiDay(d) : K.dayText(d)) : '', f: 'serif', z: 44, col: INK, gap: 6 },
        { s: e.time, f: hi ? 'serif' : 'caps', z: hi ? 40 : 30, col: '#9a5b16', ls: 3, gap: 8 },
        { s: e.venue, f: 'ital', z: 40, col: '#7a3a12', wrap: 2 }], by + (s.style === 'arch' ? 190 : 130), 600));
      const last = L[L.length - 1], fh = Math.round(Math.max(440, last.y + 80 - by));
      board(c, { style: s.style, tone: 'cream', x: bx, y: by, w: bw, h: fh, k, gem: '#c0262d' });
      sayAll(c, L, pt, t, .9, .14);
      c.restore();
    }
  }
  function muhuratShot(c, s, pt, t, P) {
    const k = kOf(P), hi = P.opt.lang === 'hi', card = P.card;
    const z = lerp(1.18, 1.02, ease3(pt / s.d));
    c.save(); c.translate(W / 2, 1300); c.scale(z, z); c.translate(-W / 2, -1300); c.drawImage(sceneArt(k, 'mandap'), 0, 0, W, H); sceneLive(c, 'mandap', t); c.restore();
    // seven little flames for the seven vows
    for (let i = 0; i < 7; i++) { const a = ease((pt - .4 - i * .2) / .4), ang = Math.PI + (i / 6) * Math.PI, x = W / 2 + Math.cos(ang) * 380, y = 1200 + Math.sin(ang) * 160; if (a > 0) { c.save(); c.globalAlpha = a; diya(c, x, y, 40, t); c.restore(); } }
    const cimg = coupleImage(P, 'Pheras'), cia = ease((pt - .6) / .9);
    if (cimg && cia > .01) { c.save(); c.globalAlpha = cia; cutout(c, cimg, W / 2, 1590, 660, 'full', P.shotLook('muhurat'), t); c.restore(); havan(c, W / 2, 1640, 120, t); for (let i = 0; i < 4; i++) flame(c, W / 2 - 60 + i * 40, 1590, 110 + Math.sin(t * 3 + i) * 12, t, i * 3); }
    const g = c.createLinearGradient(0, 200, 0, 980); g.addColorStop(0, 'rgba(40,0,4,.85)'); g.addColorStop(.75, 'rgba(40,0,4,.6)'); g.addColorStop(1, 'rgba(40,0,4,0)'); c.fillStyle = g; c.fillRect(0, 0, W, 980);
    const D = days(card, hi), main = D.flatMap(d => d.events).find(e => /phera|vivah|wedding|फेरे|विवाह/i.test(e.name));
    const L = s.lines || (s.lines = flow([
      { s: 'शुभ मुहूर्त', f: 'display', z: 112, gold: true, gap: 0 },
      { s: hi ? 'सात फेरे · सात वचन' : 'Seven rounds · seven promises', f: hi ? 'serif' : 'ital', z: 42, col: '#ffe2b0', gap: 30 },
      { s: main && main.e && main.e.date ? '' : '', f: 'serif', z: 10 }], 250, 860));
    sayAll(c, L, pt, t, .3, .22);
    const md = main ? K.days({ events: [main.e] }, hi)[0] : D[D.length - 1], da = ease3((pt - 1.0) / .7);
    if (md && md.date && da > 0) { c.save(); c.translate(W / 2, 560); c.scale(da, da); glow(c, 0, 0, 210, 'rgba(255,200,120,.5)'); dateMedallion(c, 0, 0, 104, md.date, { base: '#9a1420', hi, day: true }); c.restore(); }
    const L2 = s.lines2 || (s.lines2 = flow([
      { s: main ? main.time : '', f: hi ? 'serif' : 'caps', z: hi ? 44 : 32, col: '#fff1d0', ls: 4, gap: 10 },
      { s: card.venue, f: 'caps', z: 40, col: '#ffd98a', ls: 2, wrap: 2, gap: 8 },
      { s: card.venueNote, f: 'ital', z: 32, col: '#ffe2b0', wrap: 2 }], 690, 880));
    sayAll(c, L2, pt, t, 1.5, .18);
  }
  function aagmanShot(c, s, pt, t, P) {
    const k = kOf(P), hi = P.opt.lang === 'hi', card = P.card;
    c.drawImage(havelArt(k), 0, 0, W, H);
    // a carved wooden door frame hung with marigolds, the families on a wood board
    const ba = ease3((pt - .2) / .8);
    c.drawImage(toranArt(k), 0, Math.sin(t) * 3, W, 340);
    if (ba > .01) {
      c.save(); c.globalAlpha = ba; c.translate(0, (1 - ba) * 60);
      c.restore();
      const fams = (card.families || []).filter(f => f && clean(f.parents)).slice(0, 3);
      const L = s.lines || (s.lines = flow([
        { s: 'आपकी प्रतीक्षा में', f: 'display', z: 92, col: VERM, gap: 4 },
        { s: hi ? '' : 'Awaiting your blessings', f: 'caps', z: 24, col: '#9a5b16', ls: 6, gap: 26 },
        { s: 'दर्शनाभिलाषी', f: 'serif', z: 46, col: '#9a5b16', gap: 14 },
        ...fams.map(f => ({ s: f.parents, f: 'serif', z: 54, col: INK, wrap: 2, gap: 12 })),
        { s: ' ', f: 'serif', z: 10, gap: 14 },
        { s: hi ? 'बाल मनुहार' : 'From the little ones', f: hi ? 'serif' : 'caps', z: hi ? 34 : 22, col: '#b8862b', ls: 5, gap: 4 },
        { s: hi ? 'मेरे भैया-दीदी की शादी में ज़रूर-ज़रूर आना' : 'Please come, we have planned the dance just for you!', f: hi ? 'serif' : 'ital', z: 40, col: '#7a3a12', wrap: 2, gap: 18 },
        { s: K.phoneText(card.rsvp) && `${hi ? 'संपर्क' : 'RSVP'} · ${K.phoneText(card.rsvp)}`, f: 'serif', z: 34, col: INK }], 600, 660));
      const fh = Math.max(600, L[L.length - 1].y + 110 - 460);
      c.save(); c.globalAlpha = ba; c.translate(0, (1 - ba) * 60); board(c, { style: 'carved', tone: 'cream', x: 130, y: 460, w: 820, h: fh, k, gem: '#1f8a5a' }); c.restore();
      const img = coupleImage(P), ia = ease((pt - 1.2) / .8), top = 460 + fh + 40;
      if (img && ia > .01 && 1600 - top > 250) { c.save(); c.globalAlpha = ia; cutout(c, img, W / 2, 1620, Math.min(560, 1620 - top), 'arch', P.shotLook('aagman'), t); c.restore(); }
      sayAll(c, L, pt, t, .7, .14);
    }
    for (const x of [90, 990]) { c.save(); c.translate(x, 0); for (let i = 0; i < 30; i++) marigold(c, Math.sin(t * 1.5 + i * .3) * (i / 30) * 10, 300 + i * 46, 18, i % 2 ? 44 : 30); c.restore(); }
    for (const x of [280, 540, 800]) diya(c, x, 1640, 48, t);
  }
  function thanksShot(c, s, pt, t, P) {
    const k = kOf(P), hi = P.opt.lang === 'hi';
    c.drawImage(kalashArt(k), 0, 0, W, H);
    rays(c, W / 2, 700, t, { n: 24, r: 1300, a: .12, col: '255,200,110' });
    c.drawImage(toranArt(k), 0, Math.sin(t) * 3, W, 340);
    const ba = ease3(pt / .8);
    c.save(); c.globalAlpha = ba; board(c, { style: 'arch', tone: 'cream', x: 170, y: 360, w: 740, h: 1240, k, gem: '#c0262d' }); c.restore();
    say(c, { s: 'धन्यवाद', f: 'display', z: 130, col: VERM }, W / 2, 610, ease((pt - .4) / .6));
    say(c, { s: hi ? 'हमारी ख़ुशियों में शामिल होने के लिए' : 'Thank you for being part of our joy', f: hi ? 'serif' : 'ital', z: 38, col: '#7a3a12', maxW: 620 }, W / 2, 720, ease((pt - .7) / .6));
    K.words(c, P, s.tail, { zone: [790, 1480, 620], L: P.shotLook('thanks'), p: pt - .8 });
    for (const x of [300, 780]) diya(c, x, 1700, 54, t);
    petals(c, t, 22, ['#ff8f00', '#ffca28', '#e53935', '#ffffff'], 43);
  }

  return {
    id: 'story-shubhvivah', order: 13, occasion: 'wedding', tune: 'shehnai', thumb: 7.5,
    name: 'Shubh Vivah', note: 'Temple bells and diyas at dawn, a kalash under unrolling torans, then a walk from courtyard to courtyard: every function painted with the couple and a Devanagari signboard',
    names: ['Gauri', 'Madhav'], ganesha: 'ganesha-02',
    looks: { open: 'temple', title: 'temple', invite: 'temple', events: ['temple'], date: 'temple', end: 'temple', final: 'temple' },
    look: (kind, K) => K.palette('temple', { font: { script: 'Great Vibes', serif: 'Gilda Display' }, col: { names: '#b3261e', ink: '#5a1a0a', ink2: '#7a3a12', accent: '#9a5b16', gold: '#b8862b' },
      shadow: kind === 'fn' || kind === 'muhurat' ? ['rgba(20,8,4,.75)', 10] : ['rgba(255,250,236,.9)', 8], fx: () => {} }),
    timeline(S, K, card, opt) {
      const hi = opt.lang === 'hi', evs = days(card, hi).flatMap(d => d.events.map(e => ({ ...e, date: d.date }))).slice(0, 6), fd = evs.length ? Math.max(3.4, Math.min(4.4, 22 / evs.length)) : 0;
      const out = [
        { k: 'reel', reel: 'temple', d: 6, name: 'Temple at Dawn' },
        { k: 'reel', reel: 'kalash', d: 5.8, name: 'Shubh Vivah', cut: true, change: 'none' },
        { k: 'reel', reel: 'nimantran', d: 6.6, name: 'Nimantran', change: 'petals' }];
      let prev = null;
      evs.forEach((e, i) => { const kind = sceneOf(e.name); out.push({ k: 'reel', reel: 'fn', ev: e, d: fd, name: e.name, style: ['arch', 'cartouche', 'carved'][i % 3], prevKind: prev, cut: !!prev, change: prev ? 'none' : 'bloom' }); prev = kind; });
      out.push({ k: 'reel', reel: 'muhurat', d: 5.2, name: 'Shubh Muhurat', change: 'flash' });
      out.push({ k: 'reel', reel: 'aagman', d: 5.6, name: 'Aapki Prateeksha', change: 'petals' });
      out.push({ k: 'reel', reel: 'thanks', d: 5.6, name: 'Dhanyavaad', change: 'sparkle', sigCorner: opt.signature !== false,
        tail: [{ t: 'qr', rows: K.SITE_QR, z: 230, gap: 22 }, { t: 'text', s: hi ? 'ऐसा ही निमन्त्रण बनवाएँ' : 'Your invitation, made like this', f: hi ? 'hser' : 'italic', z: 34, col: 'ink2', gap: 6 },
          { t: 'text', s: 'cardalbum.vercel.app', f: 'serif', z: 40, col: 'names' }] });
      return out;
    },
    shots: { temple: templeShot, kalash: kalashShot, nimantran: nimantranShot, fn: fnShot, muhurat: muhuratShot, aagman: aagmanShot, thanks: thanksShot }
  };
})(Cinema.kit));
