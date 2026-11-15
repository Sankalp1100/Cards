// Little Star (Namkaran): a naming-ceremony film. In a dark prayer room a row of diyas lights one by one up to Shri
// Ganesh among marigolds; then a night nursery where a mobile of gold stars turns over the cradle, and the stars fly
// off it to spell the ceremony's name; the carved wooden jhula swings under garlands for the invitation; every
// function sits over a rangoli that draws itself in petals; dawn in the courtyard for the date; the stars again for thanks.
Cinema.register((K => {
  const { W, H, TAU, rng, clamp, ease, ease3, lerp, mix, art, glow, rrect, clean, foil, diya, marigold, bell, leaf, lotus, petals, sparks, rays, camAt, camera } = K;
  const back = u => { u = clamp(u); const s = 1.5; return 1 + (s + 1) * (u - 1) ** 3 + s * (u - 1) ** 2; };
  const kOf = P => Math.min(1.25, Math.max(.5, P.k));
  const hiOf = P => P.opt.lang === 'hi';
  const goldG = (c, y0, y1) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, '#fff1c0'); g.addColorStop(.45, '#f0c24e'); g.addColorStop(.75, '#c08a22'); g.addColorStop(1, '#8a5a10'); return g; };
  const starPath = (c, x, y, r, inner = .45) => { c.beginPath(); for (let j = 0; j < 10; j++) { const a = j * TAU / 10 - Math.PI / 2, rr = j % 2 ? r * inner : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); };
  function goldStar(c, x, y, r, rot = 0) {
    c.save(); c.translate(x, y); c.rotate(rot);
    glow(c, 0, 0, r * 2.6, 'rgba(255,220,140,.35)');
    starPath(c, 0, 0, r); c.fillStyle = goldG(c, -r, r); c.fill();
    c.fillStyle = 'rgba(255,255,255,.55)'; starPath(c, -r * .12, -r * .12, r * .42); c.fill();
    c.restore();
  }
  function garland(c, x0, y0, x1, y1, sag, n, R) {
    for (let i = 0; i <= n; i++) { const u = i / n, x = lerp(x0, x1, u), y = lerp(y0, y1, u) + Math.sin(u * Math.PI) * sag; marigold(c, x, y, 17, i % 3 === 1 ? 46 : 32); if (i % 4 === 2) leaf(c, x, y + 14, 40, 13, Math.PI / 2 + (R() - .5), '#3f7a3c'); }
  }

  // ---- still art ----
  function shrineArt(k) {
    return art('nk-shrine', W, H, k, c => {
      const g = c.createRadialGradient(540, 760, 50, 540, 900, 1250); g.addColorStop(0, '#5a2412'); g.addColorStop(.55, '#2a0e08'); g.addColorStop(1, '#0c0403'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      const R = rng(4);
      // a carved arch niche
      c.save(); c.globalAlpha = .55; c.strokeStyle = '#b8862b'; c.lineWidth = 6;
      for (const ins of [0, 28]) { c.beginPath(); c.moveTo(170 + ins, 1500); c.lineTo(170 + ins, 700); c.bezierCurveTo(170 + ins, 420, 400, 330 + ins, 540, 220 + ins); c.bezierCurveTo(680, 330 + ins, 910 - ins, 420, 910 - ins, 700); c.lineTo(910 - ins, 1500); c.stroke(); }
      c.restore();
      const ng = c.createLinearGradient(0, 300, 0, 1500); ng.addColorStop(0, 'rgba(120,40,20,.5)'); ng.addColorStop(1, 'rgba(40,12,6,.2)'); c.fillStyle = ng;
      c.beginPath(); c.moveTo(226, 1500); c.lineTo(226, 700); c.bezierCurveTo(226, 450, 420, 380, 540, 276); c.bezierCurveTo(660, 380, 854, 450, 854, 700); c.lineTo(854, 1500); c.fill();
      // the shelf (a low carved chowki in red cloth with gold border)
      c.fillStyle = '#8a1424'; c.fillRect(150, 1420, 780, 120); c.fillStyle = goldG(c, 1420, 1450); c.fillRect(150, 1420, 780, 14); c.fillRect(150, 1526, 780, 10);
      for (let x = 170; x < 920; x += 46) { c.fillStyle = 'rgba(240,194,78,.6)'; c.beginPath(); c.moveTo(x, 1450); c.lineTo(x + 23, 1500); c.lineTo(x + 46, 1450); c.fill(); }
      c.fillStyle = '#3a1a0c'; c.fillRect(120, 1540, 840, 40); c.fillRect(150, 1580, 40, 200); c.fillRect(890, 1580, 40, 200);
      // garlands framing the niche, and hanging strings of marigold
      garland(c, 120, 220, 960, 220, 140, 26, R);
      for (const x of [140, 940]) for (let y = 230; y < 1400; y += 30) marigold(c, x + Math.sin(y / 80) * 4, y, 15, (y / 30) % 3 ? 34 : 46);
      for (const x of [110, 970]) { bell(c, x, 1420, 60); }
      const fl = c.createLinearGradient(0, 1580, 0, H); fl.addColorStop(0, '#2a120a'); fl.addColorStop(1, '#0a0402'); c.fillStyle = fl; c.fillRect(0, 1580, W, H - 1580);
      for (let i = 0; i < 22; i++) { const x = 60 + R() * 960, y = 1640 + R() * 220; c.fillStyle = ['#ff8a1a', '#ffc02e', '#e2348f'][i % 3]; c.beginPath(); c.ellipse(x, y, 12, 6, R() * 3, 0, TAU); c.fill(); }
    });
  }
  function nurseryArt(k) {
    return art('nk-nursery', W, H, k, c => {
      const g = c.createLinearGradient(0, 0, 0, H); [[0, '#0b1338'], [.55, '#1f2a63'], [1, '#3c3a7a']].forEach(([o, col]) => g.addColorStop(o, col)); c.fillStyle = g; c.fillRect(0, 0, W, H);
      const R = rng(12);
      for (let i = 0; i < 260; i++) { c.fillStyle = `rgba(255,248,220,${(.2 + R() * .8).toFixed(2)})`; c.beginPath(); c.arc(R() * W, R() * H * .85, .7 + R() * 2, 0, TAU); c.fill(); }
      glow(c, 180, 230, 420, 'rgba(255,236,190,.28)');
      const mg = c.createRadialGradient(150, 200, 10, 180, 230, 100); mg.addColorStop(0, '#fffbe6'); mg.addColorStop(1, '#f0d690'); c.fillStyle = mg; c.beginPath(); c.arc(180, 230, 98, 0, TAU); c.fill();
      c.fillStyle = '#0d1640'; c.beginPath(); c.arc(222, 205, 86, 0, TAU); c.fill();
      // soft clouds low in the sky
      for (let i = 0; i < 7; i++) { const x = R() * W, y = 1350 + R() * 300, s = 260 + R() * 200; for (let j = 0; j < 9; j++) { const gx = x + (R() - .5) * s, gy = y + (R() - .5) * s * .25, r = s * (.15 + R() * .12);
        const cg = c.createRadialGradient(gx, gy - r * .4, r * .1, gx, gy, r); cg.addColorStop(0, 'rgba(150,140,220,.55)'); cg.addColorStop(1, 'rgba(90,80,170,0)'); c.fillStyle = cg; c.beginPath(); c.arc(gx, gy, r, 0, TAU); c.fill(); } }
    });
  }
  // the carved wooden jhula (cradle), drawn centred on its seat at (0, 0)
  function jhulaArt(k) {
    return art('nk-jhula', 900, 760, k, c => {
      c.translate(450, 380);
      const wood = (x0, x1) => { const g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, '#5a2e12'); g.addColorStop(.35, '#b06a32'); g.addColorStop(.6, '#8a4a20'); g.addColorStop(1, '#3a1a08'); return g; };
      // the cradle body: a boat-shaped carved shell
      c.save(); c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 30; c.shadowOffsetY = 20;
      c.fillStyle = wood(-380, 380); c.beginPath(); c.moveTo(-390, -60); c.quadraticCurveTo(-380, 200, 0, 220); c.quadraticCurveTo(380, 200, 390, -60); c.lineTo(340, -40); c.quadraticCurveTo(0, 30, -340, -40); c.closePath(); c.fill(); c.restore();
      // carving: gold inlay band, lotus medallions
      c.strokeStyle = goldG(c, 0, 200); c.lineWidth = 6; c.beginPath(); c.moveTo(-360, 20); c.quadraticCurveTo(0, 210, 360, 20); c.stroke();
      c.lineWidth = 3; c.beginPath(); c.moveTo(-330, 60); c.quadraticCurveTo(0, 230, 330, 60); c.stroke();
      for (let i = -3; i <= 3; i++) { const x = i * 95, y = 92 + (1 - Math.abs(i) / 3.4) * 50; c.fillStyle = goldG(c, y - 22, y + 22); c.beginPath(); for (let j = 0; j < 8; j++) { const a = j * TAU / 8; c.moveTo(x, y); c.ellipse(x + Math.cos(a) * 12, y + Math.sin(a) * 12, 12, 6, a, 0, TAU); } c.fill(); }
      // the quilt and pillow inside
      const q = c.createLinearGradient(0, -110, 0, 0); q.addColorStop(0, '#fbd3e2'); q.addColorStop(1, '#e79ab8'); c.fillStyle = q;
      c.beginPath(); c.moveTo(-330, -40); c.quadraticCurveTo(-200, -130, 0, -110); c.quadraticCurveTo(200, -130, 330, -40); c.quadraticCurveTo(0, 30, -330, -40); c.fill();
      c.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 14; i++) { c.beginPath(); c.arc(-260 + i * 40, -70 + Math.sin(i) * 10, 5, 0, TAU); c.fill(); }
      c.fillStyle = '#fff4e6'; c.beginPath(); c.ellipse(-230, -90, 90, 40, -.15, 0, TAU); c.fill();
      // the end posts with peacock-head finials
      for (const d of [-1, 1]) {
        c.fillStyle = wood(d * 400 - 22, d * 400 + 22); rrect(c, d * 400 - 22, -150, 44, 300, 18); c.fill();
        c.fillStyle = goldG(c, -200, -140); c.beginPath(); c.arc(d * 400, -170, 30, 0, TAU); c.fill(); c.beginPath(); c.moveTo(d * 400 - 12, -190); c.lineTo(d * 400, -240); c.lineTo(d * 400 + 12, -190); c.fill();
        c.fillStyle = '#ffffff'; c.beginPath(); c.arc(d * 400 - 8, -178, 6, 0, TAU); c.fill();
      }
      // garland along its rim
      const R = rng(2); for (let i = 0; i <= 18; i++) { const u = i / 18, x = lerp(-380, 380, u), y = -50 + Math.sin(u * Math.PI) * 60; marigold(c, x, y, 16, i % 2 ? 34 : 46); if (i % 3 === 0) leaf(c, x, y + 16, 36, 12, Math.PI / 2 + (R() - .5), '#3f7a3c'); }
    });
  }
  function courtyardArt(k) {
    return art('nk-court', W, H, k, c => {
      const g = c.createLinearGradient(0, 0, 0, H); [[0, '#f7c9a0'], [.4, '#fde3c2'], [.62, '#fff2df'], [1, '#e8c39a']].forEach(([o, col]) => g.addColorStop(o, col)); c.fillStyle = g; c.fillRect(0, 0, W, H);
      glow(c, 540, 1000, 700, 'rgba(255,214,140,.7)'); glow(c, 540, 1000, 200, 'rgba(255,250,230,.95)');
      const R = rng(9);
      // pillars and an arched gallery
      for (const x of [0, 900]) { const pg = c.createLinearGradient(x, 0, x + 180, 0); pg.addColorStop(0, '#c98f5e'); pg.addColorStop(.5, '#f3d2a8'); pg.addColorStop(1, '#a8703e'); c.fillStyle = pg; c.fillRect(x, 0, 180, H);
        c.fillStyle = 'rgba(120,60,20,.25)'; for (let y = 120; y < H; y += 260) c.fillRect(x, y, 180, 16); }
      c.fillStyle = '#e9b98a'; c.beginPath(); c.moveTo(180, 0); c.lineTo(900, 0); c.lineTo(900, 300); c.bezierCurveTo(900, 120, 180, 120, 180, 300); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(150,80,30,.5)'; c.lineWidth = 6; c.beginPath(); c.moveTo(180, 300); c.bezierCurveTo(180, 120, 900, 120, 900, 300); c.stroke();
      // the floor with a rangoli and diyas
      const fg = c.createLinearGradient(0, 1500, 0, H); fg.addColorStop(0, '#d7a676'); fg.addColorStop(1, '#a8703e'); c.fillStyle = fg; c.fillRect(0, 1500, W, H - 1500);
      c.save(); c.translate(540, 1720); c.scale(1, .35); K.rangoli(c, 0, 0, 330); c.restore();
      for (let i = 0; i < 4; i++) bell(c, 300 + i * 160, 300 + (i % 2) * 40, 48);
      for (let i = 0; i < 26; i++) { const x = 190 + i * 27; marigold(c, x, 160 + Math.sin(i / 25 * Math.PI) * 70, 15, i % 2 ? 34 : 46); }
      for (let i = 0; i < 30; i++) { c.fillStyle = `rgba(255,255,255,${(R() * .4).toFixed(2)})`; c.beginPath(); c.arc(200 + R() * 680, 300 + R() * 1100, 2 + R() * 3, 0, TAU); c.fill(); }
    });
  }

  // a rangoli drawing itself in petals: rings appear one after another
  function liveRangoli(c, x, y, r, p, t, pal) {
    const rings = 7;
    for (let i = 0; i < rings; i++) {
      const u = ease((p - i * .22) / .5); if (u <= 0) break;
      const rr = r * (i + 1) / rings, n = 8 + i * 4, col = pal[i % pal.length], sz = r / rings * .55;
      c.save(); c.translate(x, y); c.rotate(i % 2 ? t * .05 : -t * .05);
      for (let j = 0; j < Math.round(n * u); j++) {
        const a = j / n * TAU; c.save(); c.rotate(a); c.translate(0, -rr);
        c.fillStyle = col; c.beginPath(); c.ellipse(0, 0, sz * .45, sz, 0, 0, TAU); c.fill();
        c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(-sz * .12, -sz * .3, sz * .12, sz * .35, 0, 0, TAU); c.fill();
        if (i % 2) { c.fillStyle = '#fff3d0'; c.beginPath(); c.arc(0, sz * 1.25, sz * .2, 0, TAU); c.fill(); }
        c.restore();
      }
      c.restore();
    }
    if (p > .1) { c.fillStyle = pal[0]; c.beginPath(); c.arc(x, y, r / rings * .6 * ease(p / .4), 0, TAU); c.fill(); lotus(c, x, y + 10, r / rings * 1.2 * ease(p / .5), .9); }
  }

  const pal = {};
  const look = (kind, K2) => kind === 'stars' ? (pal.n || (pal.n = K2.palette('clouds-champagne', { font: { script: 'Great Vibes', serif: 'Marcellus' },
    col: { names: '#ffd98a', ink: '#fff4de', ink2: '#efe2ff', accent: '#ffc46b', gold: '#e8c46a' }, shadow: ['rgba(10,8,40,.85)', 10] })))
    : pal.x || (pal.x = K2.palette('clouds-champagne', { font: { script: 'Great Vibes', serif: 'Marcellus' },
    col: { names: '#8a1f3c', ink: '#3b2414', ink2: '#5e4428', accent: '#a0561a', gold: '#b8862b' }, shadow: ['rgba(255,250,236,.9)', 6] }));

  return {
    id: 'story-namkaran', order: 23, occasion: 'naming', tune: 'santoor', thumb: 11.5, ganesha: 'ganesha-01',
    name: 'Little Star', note: 'Diyas light up to Shri Ganesh, a mobile of gold stars spells the Naamkaran, a carved jhula swings',
    names: ['Meera', 'Kunal'],
    looks: { open: 'clouds-champagne', title: 'clouds-champagne', invite: 'clouds-champagne', events: ['clouds-champagne'], date: 'clouds-champagne', end: 'clouds-champagne', final: 'clouds-champagne' },
    titles: [[/puja|pooja|havan|पूजा|हवन/i, 'A Sacred Beginning'], [/naam|nam|name|नाम/i, 'A Name Is Whispered'], [/lunch|dinner|bhoj|भोज|खाना/i, 'A Feast of Blessings'],
      [/mundan|मुंडन/i, 'The First Haircut'], [/cake|birthday|जन्मदिन/i, 'The First Candle'], [/annaprashan|अन्नप्राशन/i, 'The First Bite']],
    look,
    timeline(S, K2, card, opt) {
      const hi = opt.lang === 'hi', at = k => S.findIndex(s => s.k === k);
      const word = card.type === 'naming' ? (hi ? 'नामकरण' : 'Naamkaran') : (hi ? 'शुभ संस्कार' : (clean(card.title).length < 14 && clean(card.title)) || 'Blessings');
      const two = clean(card.host2), names = two ? `${clean(card.host1)} & ${two}` : clean(card.host1);
      S.splice(at('open'), 1, { k: 'reel', reel: 'shrine', name: 'Blessing', d: 6, bless: opt.blessingText || '॥ श्री गणेशाय नमः ॥' });
      Object.assign(S[at('title')], { reel: 'stars', d: 7.5, change: 'bloom', word, sub: [
        { t: 'text', s: names, f: /[ऀ-ॿ]/.test(names) ? 'hname' : 'script', z: 124, col: 'names', gap: 14 },
        { t: 'text', s: clean(card.tagline), f: /[ऀ-ॿ]/.test(card.tagline || '') || hi ? 'hser' : 'italic', z: 50, col: 'ink2', wrap: 2 }] });
      delete S[at('title')].couple; delete S[at('title')].zone;
      Object.assign(S[at('invite')], { reel: 'jhula', d: 7.5, change: 'bloom', board: 'arch', zone: [140, 1060, 720] });
      S.forEach(s => { if (s.k !== 'event') return; Object.assign(s, { reel: 'rangoli', datebar: true, board: 'cartouche', zone: [300, 1020, 700], change: 'petals' }); delete s.couple; });
      const di = at('date'); if (di >= 0) Object.assign(S[di], { reel: 'dawn', board: 'carved', change: 'bloom', zone: [380, 1360, 700] });
      const ei = at('end'); if (ei >= 0) Object.assign(S[ei], { reel: 'jhula', board: 'carved', change: 'sparkle', zone: [180, 900, 720], late: 1 });
      Object.assign(S[at('final')], { reel: 'night', change: 'sparkle', board: 'arch', zone: [380, 1500, 640] });
      let total = S.reduce((a, s) => a + s.d, 0);
      if (total > 59.5 && at('end') >= 0) { total -= S[at('end')].d; S.splice(at('end'), 1); }
      const evs = S.filter(s => s.k === 'event'), ed = evs.reduce((a, s) => a + s.d, 0);
      if (total > 59.5 && ed) { const f = (59.5 - (total - ed)) / ed; evs.forEach(s => { s.d = Math.max(3.4, s.d * f); }); }
    },
    shots: {
      shrine(c, s, pt, t, P) {
        const k = kOf(P);
        const cam = camAt(pt, [[0, { x: 540, y: 1270, z: 1.5 }], [3, { x: 540, y: 1150, z: 1.2 }], [6, { x: 540, y: 980, z: 1.02 }]]);
        c.save(); camera(c, cam);
        c.drawImage(shrineArt(k), 0, 0, W, H);
        const n = 9, lit = i => 0.15 + i * .28;
        // Ganesh comes into the light as the diyas reach him
        const ga = ease((pt - 1.6) / 1.6), img = K.ganeshaImage(P);
        if (ga > 0) {
          glow(c, 540, 1000, 520, `rgba(255,190,90,${(.45 * ga).toFixed(2)})`);
          rays(c, 540, 1000, t, { n: 18, r: 900, col: '255,200,120', a: .14 * ga, spin: .03 });
          c.save(); c.globalAlpha = ga;
          if (img) { const ih = 760, iw = ih * img.naturalWidth / img.naturalHeight; c.drawImage(img, 540 - iw / 2, 1420 - ih, iw, ih); }
          else K.ganesha(c, 540, 640, 760, t);
          c.restore();
        }
        for (let i = 0; i < n; i++) { const x = 190 + i * 87.5, y = 1418; if (pt > lit(i)) diya(c, x, y, 34 * Math.min(1, (pt - lit(i)) / .3 + .3), t); else { c.fillStyle = '#7a3a12'; c.beginPath(); c.ellipse(x, y - 4, 22, 12, 0, 0, Math.PI); c.fill(); } }
        c.restore();
        // darkness lifts with the lamps
        const dark = 1 - ease(pt / 2.4); if (dark > 0) { c.fillStyle = `rgba(8,3,2,${(.75 * dark).toFixed(2)})`; c.fillRect(0, 0, W, H); }
        const ba = ease((pt - 3.2) / .9);
        if (ba > 0) { c.save(); c.globalAlpha = ba; foil(c, s.bless, 540, 540, { font: /[ऀ-ॿ]/.test(s.bless) ? '84px "Yatra One"' : '60px "Cinzel"', t }); c.restore(); }
        petals(c, t, 16, ['#ff9a1a', '#ffc02e', '#e2348f'], 31);
      },
      stars(c, s, pt, t, P) {
        const k = kOf(P);
        c.drawImage(nurseryArt(k), 0, 0, W, H);
        // the mobile: a crescent bar turning, stars on threads; the stars fly off to spell the word
        const word = s.word, deva = /[ऀ-ॿ]/.test(word), chars = deva ? Array.from(word.matchAll(/[ऀ-ॿ][ऀ-ःऺ-ॏ॑-ॗॢॣ]*/g), m => m[0]) : [...word];
        const fontZ = deva ? 170 : 190, font = deva ? `700 ${fontZ}px "Amita"` : `${fontZ}px "Great Vibes"`;
        c.font = font; let z = fontZ, F = font; while (c.measureText(word).width > 940 && z > 70) { z *= .93; F = deva ? `700 ${z}px "Amita"` : `${z}px "Great Vibes"`; c.font = F; }
        const tw = c.measureText(word).width, ty = 700;
        let xx = 540 - tw / 2; const pos = chars.map(ch => { const w = c.measureText(ch).width, p = xx + w / 2; xx += w; return p; });
        const mx = 540, my = 360, spin = t * .5, nS = chars.length;
        c.strokeStyle = 'rgba(240,210,150,.6)'; c.lineWidth = 2; c.beginPath(); c.moveTo(mx, 0); c.lineTo(mx, my - 40); c.stroke();
        c.save(); c.translate(mx, my - 40); c.fillStyle = goldG(c, -20, 20); c.beginPath(); c.ellipse(0, 0, 230, 14, 0, 0, TAU); c.fill(); goldStar(c, 0, -6, 30, t * .4); c.restore();
        chars.forEach((ch, i) => {
          const a = spin + i / nS * TAU, ox = mx + Math.cos(a) * 220, depth = (Math.sin(a) + 1) / 2, oy = my + 120 + (i % 3) * 50 + Math.sin(t * 1.4 + i) * 8;
          const go = ease3((pt - 1.4 - i * .18) / 1.2), x = lerp(ox, pos[i], go), y = lerp(oy, ty - 30, go) - Math.sin(go * Math.PI) * 140;
          if (go < 1) { c.strokeStyle = `rgba(240,210,150,${(.5 * (1 - go)).toFixed(2)})`; c.beginPath(); c.moveTo(ox, my - 40); c.lineTo(lerp(ox, x, 1), lerp(my - 40, y, 1)); c.stroke(); }
          const sr = lerp(26 + depth * 14, 14, go) * (go > .85 ? 1 - (go - .85) / .15 : 1);
          if (sr > 1) goldStar(c, x, y, sr, t + i);
          const la = ease((pt - 2.4 - i * .18) / .6);
          if (la > 0) { c.save(); c.globalAlpha = la; foil(c, ch, pos[i], ty, { font: F, t }); c.restore(); if (la < 1) glow(c, pos[i], ty, 120 * (1 - la), 'rgba(255,230,160,.6)'); }
        });
        sparks(c, t, 26, '#fff2c4', 7);
        K.words(c, P, s.sub, { zone: [880, 1360, 900], L: look('stars', K), p: pt - 3.6, d: s.d, t });
        // the cradle glimpsed low, under the clouds
        c.save(); c.globalAlpha = .9; c.drawImage(jhulaArt(k), 540 - 330, 1560 + Math.sin(t) * 6, 660, 557); c.restore();
      },
      jhula(c, s, pt, t, P) {
        const k = kOf(P), sw = Math.sin(t * 1.1) * .045;
        c.drawImage(nurseryArt(k), 0, 0, W, H);
        glow(c, 540, 1400, 700, 'rgba(255,214,150,.25)');
        // the swing: brass chains from the top to the cradle's posts
        const piv = { x: 540, y: -200 }, cy = s.late ? 1500 : 1560;
        c.save(); c.translate(piv.x, piv.y); c.rotate(sw); c.translate(-piv.x, -piv.y);
        for (const d of [-1, 1]) { const x = 540 + d * 300; for (let y = -40; y < cy - 200; y += 22) { c.strokeStyle = (y / 22) % 2 ? '#e8c066' : '#b8862b'; c.lineWidth = 6; c.beginPath(); c.ellipse(x, y, 7, 12, 0, 0, TAU); c.stroke(); } }
        c.drawImage(jhulaArt(k), 540 - 450, cy - 380, 900, 760);
        c.restore();
        petals(c, t, 18, ['#ff9a1a', '#ffc02e', '#f48fb1', '#ffffff'], 17);
        sparks(c, t, 16, '#fff2c4', 23);
      },
      rangoli(c, s, pt, t, P) {
        const i = s.i || 0, pl = [['#e2348f', '#ff9a1a', '#ffc02e', '#2a9d8f', '#ffffff'], ['#7b2cbf', '#ff6b9a', '#ffd166', '#06a77d', '#ffffff'], ['#d62828', '#f77f00', '#fcbf49', '#3a86ff', '#ffffff']][i % 3];
        const g = c.createRadialGradient(540, 1400, 100, 540, 1300, 1300); g.addColorStop(0, '#f6e1c4'); g.addColorStop(1, '#c79a6a'); c.fillStyle = g; c.fillRect(0, 0, W, H);
        c.save(); c.globalAlpha = .07; for (let y = 0; y < H; y += 120) { c.fillStyle = '#5a2e12'; c.fillRect(0, y, W, 3); } c.restore();
        c.save(); c.translate(540, 1500); c.scale(1, .62); liveRangoli(c, 0, 0, 470, pt / 2.2, t, pl); c.restore();
        c.save(); c.translate(0, Math.sin(t * .8) * 3); K.toran(c); c.restore();
        for (const x of [130, 950]) { K.kalash(c, x, 1330, 170); }
        for (let j = 0; j < 8; j++) { const a = j / 8 * TAU + .2, x = 540 + Math.cos(a) * 520, y = 1500 + Math.sin(a) * 320; if (y > 1150) diya(c, x, y, 36, t + j); }
        petals(c, t, 12, pl.slice(0, 3), 40 + i);
      },
      dawn(c, s, pt, t, P) {
        const k = kOf(P), z = 1.06 - .06 * ease3(pt / s.d);
        c.save(); c.translate(540, 1000); c.scale(z, z); c.translate(-540, -1000); c.drawImage(courtyardArt(k), 0, 0, W, H); c.restore();
        rays(c, 540, 1000, t, { n: 20, r: 1300, col: '255,226,170', a: .16, spin: .02 });
        for (let j = 0; j < 5; j++) diya(c, 300 + j * 120, 1640, 34, t + j);
        petals(c, t, 14, ['#ff9a1a', '#ffc02e', '#f48fb1'], 51);
      },
      night(c, s, pt, t, P) {
        const k = kOf(P);
        c.drawImage(nurseryArt(k), 0, 0, W, H);
        const R = rng(8);
        for (let i = 0; i < 9; i++) goldStar(c, 100 + R() * 880, 120 + R() * 260, 12 + R() * 14, t * .3 + i);
        c.drawImage(jhulaArt(k), 540 - 360, 1520 + Math.sin(t) * 6, 720, 608);
        sparks(c, t, 30, '#fff2c4', 9);
      }
    }
  };
})(Cinema.kit));
