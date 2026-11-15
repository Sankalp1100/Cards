// Golden Gala: a grown-up birthday in black and gold. Gold dust drifts through the dark and gathers into the
// invitation's first words; a black gift box with a gold satin ribbon unties itself, the lid lifts in a burst of light
// and the milestone number rises out of it in foil; a champagne bottle pops and two flutes clink; each part of the
// evening sits in its own Art Deco frame on black marble; the rooftop skyline holds the date, and gold confetti the thanks.
Cinema.register((K => {
  const { W, H, TAU, rng, clamp, ease, ease3, lerp, mix, art, glow, rrect, clean, foil, rays, sparks, goldBevel, camAt, camera } = K;
  const back = u => { u = clamp(u); const s = 1.4; return 1 + (s + 1) * (u - 1) ** 3 + s * (u - 1) ** 2; };
  const kOf = P => Math.min(1.25, Math.max(.5, P.k));
  const hiOf = P => P.opt.lang === 'hi';
  const ageOf = card => { const m = /(\d{1,3})/.exec(`${clean(card.tagline)} ${clean(card.title)}`); return m ? m[1] : ''; };
  const GOLD = [[0, '#fff4c2'], [.3, '#f3cf7a'], [.6, '#c8952e'], [1, '#7a5212']];
  const goldGrad = (c, x0, y0, x1, y1) => { const g = c.createLinearGradient(x0, y0, x1, y1); GOLD.forEach(([o, col]) => g.addColorStop(o, col)); return g; };

  // ---- backgrounds ----
  function velvetArt(k) {
    return art('gg-velvet', W, H, k, c => {
      const g = c.createRadialGradient(540, 820, 60, 540, 960, 1300); g.addColorStop(0, '#2a2118'); g.addColorStop(.5, '#120e0a'); g.addColorStop(1, '#030303'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      const R = rng(5);
      c.globalAlpha = .05; c.strokeStyle = '#f3cf7a'; c.lineWidth = 2;
      for (let i = 0; i < 26; i++) { c.beginPath(); c.arc(540, 2200, 600 + i * 70, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
      c.globalAlpha = 1;
      for (let i = 0; i < 1400; i++) { c.fillStyle = `rgba(255,230,170,${(R() * .05).toFixed(3)})`; c.fillRect(R() * W, R() * H, 2, 2); }
    });
  }
  function marbleArt(k) {
    return art('gg-marble', W, H, k, c => {
      const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#16130f'); g.addColorStop(.5, '#0a0908'); g.addColorStop(1, '#1b1712'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      const R = rng(71);
      for (let v = 0; v < 22; v++) {
        let x = R() * W, y = -50; const gold = v % 4 === 0;
        c.strokeStyle = gold ? `rgba(230,190,110,${(.25 + R() * .3).toFixed(2)})` : `rgba(200,200,210,${(.04 + R() * .06).toFixed(2)})`; c.lineWidth = gold ? 1.5 + R() * 2 : 1 + R() * 5;
        c.beginPath(); c.moveTo(x, y);
        while (y < H + 50) { x += (R() - .45) * 90; y += 40 + R() * 70; c.lineTo(x, y); }
        c.stroke();
      }
      const v2 = c.createRadialGradient(540, 960, 300, 540, 960, 1150); v2.addColorStop(0, 'rgba(0,0,0,0)'); v2.addColorStop(1, 'rgba(0,0,0,.7)'); c.fillStyle = v2; c.fillRect(0, 0, W, H);
    });
  }
  function skylineArt(k) {
    return art('gg-skyline', W, H, k, c => {
      const g = c.createLinearGradient(0, 0, 0, H); [[0, '#05060c'], [.55, '#1a1426'], [.78, '#4a2a2a'], [1, '#0b0806']].forEach(([o, col]) => g.addColorStop(o, col)); c.fillStyle = g; c.fillRect(0, 0, W, H);
      const R = rng(33);
      for (let i = 0; i < 160; i++) { c.fillStyle = `rgba(255,245,220,${(.2 + R() * .7).toFixed(2)})`; c.beginPath(); c.arc(R() * W, R() * 900, .7 + R() * 1.8, 0, TAU); c.fill(); }
      glow(c, 540, 1420, 900, 'rgba(255,170,90,.25)');
      for (const [base, hmax, col, lit] of [[1500, 520, '#1a1622', .35], [1580, 380, '#100d14', .55]]) {
        let x = -20;
        while (x < W) {
          const w = 50 + R() * 110, h = 120 + R() * hmax; c.fillStyle = col; c.fillRect(x, base - h, w, h + 400);
          if (R() < .3) { c.fillRect(x + w * .4, base - h - 60, 6, 60); }
          for (let yy = base - h + 20; yy < base; yy += 26) for (let xx = x + 8; xx < x + w - 10; xx += 18) if (R() < lit) { c.fillStyle = R() < .8 ? 'rgba(255,214,140,.85)' : 'rgba(255,250,235,.95)'; c.fillRect(xx, yy, 8, 12); c.fillStyle = col; }
          x += w + 4;
        }
      }
      // the rooftop terrace: a gold rail and the floor
      c.fillStyle = '#0d0a08'; c.fillRect(0, 1640, W, H - 1640);
      const fl = c.createLinearGradient(0, 1640, 0, H); fl.addColorStop(0, 'rgba(255,200,120,.18)'); fl.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = fl; c.fillRect(0, 1640, W, H - 1640);
      c.strokeStyle = goldGrad(c, 0, 1560, 0, 1660); c.lineWidth = 8; c.beginPath(); c.moveTo(0, 1570); c.lineTo(W, 1570); c.stroke();
      c.lineWidth = 4; for (let x = 20; x < W; x += 60) { c.beginPath(); c.moveTo(x, 1570); c.lineTo(x, 1640); c.stroke(); }
    });
  }

  // ---- the gift box ----
  const BOX = { w: 520, h: 400, lidH: 120 };
  function boxArt(k) {
    return art('gg-box', 640, 520, k, c => {
      c.translate(320, 500);
      const { w, h } = BOX, g = c.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, '#1d1a17'); g.addColorStop(.4, '#2e2924'); g.addColorStop(1, '#070605');
      c.fillStyle = g; c.fillRect(-w / 2, -h, w, h);
      c.save(); c.beginPath(); c.rect(-w / 2, -h, w, h); c.clip(); c.globalAlpha = .18; c.strokeStyle = '#d9b26a'; c.lineWidth = 2;
      for (let i = -10; i < 10; i++) { c.beginPath(); c.moveTo(i * 60, -h); c.lineTo(i * 60 + 300, 0); c.moveTo(i * 60 + 300, -h); c.lineTo(i * 60, 0); c.stroke(); }
      c.restore();
      c.fillStyle = goldGrad(c, -40, 0, 40, 0); c.fillRect(-36, -h, 72, h);
      c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(-20, -h, 8, h);
      c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(-w / 2, -h, w, 18);
      c.strokeStyle = 'rgba(243,207,122,.6)'; c.lineWidth = 3; c.strokeRect(-w / 2 + 2, -h + 2, w - 4, h - 4);
    });
  }
  function lidArt(k) {
    return art('gg-lid', 640, 200, k, c => {
      c.translate(320, 160);
      const w = BOX.w + 36, h = BOX.lidH, g = c.createLinearGradient(0, -h, 0, 0); g.addColorStop(0, '#3a332c'); g.addColorStop(.4, '#1c1815'); g.addColorStop(1, '#080706');
      c.fillStyle = g; c.fillRect(-w / 2, -h, w, h);
      c.fillStyle = goldGrad(c, -40, 0, 40, 0); c.fillRect(-36, -h, 72, h);
      c.strokeStyle = goldGrad(c, 0, -h, 0, 0); c.lineWidth = 5; c.strokeRect(-w / 2 + 3, -h + 3, w - 6, h - 6);
      c.fillStyle = 'rgba(255,240,200,.25)'; c.fillRect(-w / 2, -h, w, 6);
    });
  }
  function bow(c, x, y, s, t) {
    if (s <= .02) return;
    c.save(); c.translate(x, y); c.scale(s, s);
    for (const d of [-1, 1]) {
      c.save(); c.scale(d, 1); c.rotate(-.25 + Math.sin(t * 2) * .02);
      const g = goldGrad(c, 0, -90, 0, 30); c.fillStyle = g;
      c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(60, -130, 190, -110, 170, -20); c.bezierCurveTo(160, 20, 70, 20, 0, 0); c.fill();
      c.fillStyle = 'rgba(90,60,10,.4)'; c.beginPath(); c.moveTo(10, -6); c.bezierCurveTo(60, -80, 140, -80, 140, -30); c.bezierCurveTo(110, -10, 60, -4, 10, -6); c.fill();
      c.fillStyle = g; c.beginPath(); c.moveTo(0, 0); c.lineTo(70, 150); c.lineTo(100, 130); c.lineTo(40, 0); c.fill();
      c.restore();
    }
    c.fillStyle = goldGrad(c, 0, -30, 0, 30); c.beginPath(); c.ellipse(0, 0, 38, 30, 0, 0, TAU); c.fill();
    c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(-10, -10, 12, 6, -.4, 0, TAU); c.fill();
    c.restore();
  }

  // ---- champagne ----
  function bottleArt(k) {
    return art('gg-bottle', 260, 900, k, c => {
      c.translate(130, 880);
      const body = () => { c.beginPath(); c.moveTo(-95, 0); c.lineTo(-95, -460); c.bezierCurveTo(-95, -560, -36, -580, -32, -660); c.lineTo(-30, -820); c.lineTo(30, -820); c.lineTo(32, -660); c.bezierCurveTo(36, -580, 95, -560, 95, -460); c.lineTo(95, 0); c.closePath(); };
      const g = c.createLinearGradient(-95, 0, 95, 0); g.addColorStop(0, '#05140d'); g.addColorStop(.25, '#1f4a35'); g.addColorStop(.35, '#3d7a5c'); g.addColorStop(.5, '#0e2a1d'); g.addColorStop(1, '#020604');
      c.fillStyle = g; body(); c.fill();
      c.save(); body(); c.clip();
      c.fillStyle = goldGrad(c, -40, -830, 40, -620); c.fillRect(-60, -830, 120, 230);
      c.fillStyle = 'rgba(0,0,0,.3)'; for (let y = -820; y < -620; y += 16) c.fillRect(-60, y, 120, 3);
      // the label
      c.fillStyle = '#0b0b0b'; c.fillRect(-96, -360, 192, 210);
      c.strokeStyle = goldGrad(c, 0, -360, 0, -150); c.lineWidth = 4; c.strokeRect(-84, -348, 168, 186);
      c.fillStyle = goldGrad(c, 0, -300, 0, -200); c.font = '700 54px "Cinzel Decorative"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('✦', 0, -300);
      c.font = '26px "Cinzel"'; c.fillText('CUVÉE', 0, -240); c.font = '18px "Cinzel"'; c.fillText('CELEBRATION', 0, -200);
      c.fillStyle = 'rgba(255,255,255,.22)'; c.fillRect(-58, -560, 12, 540);
      c.restore();
      c.fillStyle = '#c8952e'; c.fillRect(-34, -840, 68, 22);
    });
  }
  function flute(c, x, y, s, fill, t, tilt) {
    c.save(); c.translate(x, y); c.rotate(tilt); c.scale(s, s);
    const bowl = () => { c.beginPath(); c.moveTo(-52, -420); c.bezierCurveTo(-56, -260, -44, -170, 0, -150); c.bezierCurveTo(44, -170, 56, -260, 52, -420); c.closePath(); };
    if (fill > 0) {
      c.save(); bowl(); c.clip();
      const top = lerp(-160, -380, fill), lg = c.createLinearGradient(0, top, 0, -150); lg.addColorStop(0, '#fff2b8'); lg.addColorStop(.3, '#f0c45a'); lg.addColorStop(1, '#b8801c');
      c.fillStyle = lg; c.fillRect(-60, top, 120, 300);
      c.fillStyle = 'rgba(255,250,230,.9)'; c.fillRect(-60, top - 6, 120, 10);
      const R = rng(3); c.fillStyle = 'rgba(255,255,240,.85)';
      for (let i = 0; i < 16; i++) { const bx = (R() - .5) * 70, sp = 60 + R() * 60, by = -150 - ((t * sp + R() * 300) % (Math.max(10, -150 - top))); c.beginPath(); c.arc(bx, by, 2 + R() * 2.5, 0, TAU); c.fill(); }
      c.restore();
    }
    c.fillStyle = 'rgba(255,255,255,.07)'; bowl(); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 3; bowl(); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 6; c.beginPath(); c.moveTo(-36, -400); c.quadraticCurveTo(-40, -260, -20, -190); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.6)'; c.fillRect(-4, -150, 8, 150); c.beginPath(); c.ellipse(0, 0, 56, 11, 0, 0, TAU); c.fill();
    c.strokeStyle = goldGrad(c, 0, -430, 0, -410); c.lineWidth = 4; c.beginPath(); c.ellipse(0, -420, 52, 8, 0, 0, TAU); c.stroke();
    c.restore();
  }

  // ---- an Art Deco frame (live, cheap) ----
  function deco(c, x, y, w, h, a, t, fill = 'rgba(8,7,6,.82)') {
    if (a <= 0) return;
    c.save(); c.globalAlpha = a;
    c.fillStyle = fill; c.beginPath();
    const cut = 46; c.moveTo(x + cut, y); c.lineTo(x + w - cut, y); c.lineTo(x + w, y + cut); c.lineTo(x + w, y + h - cut); c.lineTo(x + w - cut, y + h); c.lineTo(x + cut, y + h); c.lineTo(x, y + h - cut); c.lineTo(x, y + cut); c.closePath(); c.fill();
    c.strokeStyle = goldGrad(c, x, y, x + w, y + h); c.lineWidth = 4; c.stroke();
    c.lineWidth = 1.6; c.strokeRect(x + 22, y + 22, w - 44, h - 44);
    // stepped corners and a sunburst crown
    for (const [cx, cy, sx, sy] of [[x + 22, y + 22, 1, 1], [x + w - 22, y + 22, -1, 1], [x + 22, y + h - 22, 1, -1], [x + w - 22, y + h - 22, -1, -1]]) {
      c.beginPath(); for (let i = 1; i <= 3; i++) { c.moveTo(cx, cy + sy * i * 18); c.lineTo(cx + sx * i * 18, cy + sy * i * 18); c.lineTo(cx + sx * i * 18, cy); } c.stroke();
    }
    c.save(); c.beginPath(); c.rect(x, y - 140, w, 140); c.clip(); c.translate(x + w / 2, y);
    for (let i = 0; i <= 12; i++) { const an = Math.PI + i * Math.PI / 12; c.beginPath(); c.moveTo(Math.cos(an) * 40, Math.sin(an) * 40); c.lineTo(Math.cos(an) * (i % 2 ? 100 : 130), Math.sin(an) * (i % 2 ? 100 : 130)); c.stroke(); }
    c.fillStyle = goldGrad(c, 0, -40, 0, 0); c.beginPath(); c.arc(0, 0, 36, Math.PI, 0); c.fill();
    c.restore();
    // a gleam along the top edge
    const u = (t * .25) % 1, gx = x + u * w; c.fillStyle = 'rgba(255,248,220,.8)'; c.fillRect(gx - 40, y - 2, 80, 4);
    c.restore();
  }
  function textBox(P, s) {
    try { const T = P.sceneText(s, P.shotLook(s.reel), 'center', P.pic(s)), h = T.M.reduce((a, m, i) => a + m.h + (i < T.M.length - 1 ? m.gap : 0), 0); return { y: T.y0, h }; }
    catch (e) { return { y: s.zone[0], h: s.zone[1] - s.zone[0] }; }
  }
  // gold dust drifting (sprite discs, additive only on small areas)
  function dust(c, t, n, seed, rise = 20) {
    const R = rng(seed);
    for (let i = 0; i < n; i++) {
      const x = R() * W + Math.sin(t * .3 + i) * 40, y = ((R() * H - t * rise * (.4 + R())) % H + H) % H, r = 1.5 + R() * 3.5, a = .4 + .6 * Math.abs(Math.sin(t * (.6 + R()) + i));
      c.fillStyle = `rgba(255,${200 + (i % 3) * 18},120,${a.toFixed(2)})`; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    }
  }
  function bokehGold(c, t, seed, n = 10) {
    const R = rng(seed);
    for (let i = 0; i < n; i++) {
      const r = 50 + R() * 120, x = ((R() * W + t * (10 + R() * 16)) % (W + 2 * r)) - r, y = R() * H + Math.sin(t * .3 + i) * 40, a = .1 + .12 * (.5 + .5 * Math.sin(t * .5 + i * 2));
      const g = c.createRadialGradient(x, y, r * .2, x, y, r); g.addColorStop(0, `rgba(255,214,140,${a.toFixed(3)})`); g.addColorStop(.85, `rgba(255,200,120,${(a * .8).toFixed(3)})`); g.addColorStop(1, 'rgba(255,200,120,0)');
      c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    }
  }
  function goldConfetti(c, t, n, seed) {
    const R = rng(seed);
    for (let i = 0; i < n; i++) {
      const x0 = R() * W, sp = 70 + R() * 80, ph = R() * TAU, sz = 10 + R() * 10, y = ((R() * H + t * sp) % (H + 80)) - 40, x = x0 + Math.sin(t * 1.1 + ph) * 34;
      c.save(); c.translate(x, y); c.rotate(ph + t * 2); c.scale(1, Math.cos(t * 3 + ph));
      c.fillStyle = i % 4 === 0 ? '#fff4d6' : i % 2 ? '#f3cf7a' : '#c8952e'; c.fillRect(-sz / 2, -sz / 4, sz, sz / 2); c.restore();
    }
  }
  // the milestone number in deep 3D foil
  function bigNumber(c, txt, x, y, z, t, a) {
    c.save(); c.globalAlpha = a; c.font = `700 ${z}px "Cinzel Decorative"`; c.textAlign = 'center'; c.textBaseline = 'middle';
    for (let d = 14; d >= 1; d--) { c.fillStyle = d > 11 ? '#2a1a04' : mix('#7a5212', '#3a2606', d / 14); c.fillText(txt, x + d * .8, y + d * 1.4); }
    c.restore();
    c.save(); c.globalAlpha = a; foil(c, txt, x, y, { font: `700 ${z}px "Cinzel Decorative"`, t }); c.restore();
  }

  const pal = {};
  const look = (kind, K2) => pal.x || (pal.x = K2.palette('clouds-champagne', { font: { script: 'Great Vibes', serif: 'Cinzel' },
    col: { names: '#f3cf7a', ink: '#f6ead2', ink2: '#e2d2b0', accent: '#d9b26a', gold: '#d9b26a' }, shadow: ['rgba(0,0,0,.85)', 10] }));

  return {
    id: 'story-goldengala', order: 21, occasion: 'bday', tune: 'cinematic', thumb: 10,
    name: 'Golden Gala', note: 'Black and gold: a gift box unties to reveal the milestone in foil, champagne pops, a rooftop night',
    names: ['Ananya', 'Rehaan'],
    looks: { open: 'clouds-champagne', title: 'clouds-champagne', invite: 'clouds-champagne', events: ['clouds-champagne'], date: 'clouds-champagne', end: 'clouds-champagne', final: 'clouds-champagne' },
    titles: [[/drink|cocktail|welcome|mocktail|ड्रिंक/i, 'Cheers & Welcome'], [/cake|केक/i, 'The Midnight Cake'], [/dinner|lunch|food|भोज|खाना/i, 'A Fine Dinner'],
      [/dance|dj|music|नाच|संगीत/i, 'Dance Till Dawn'], [/puja|pooja|पूजा|हवन/i, 'Blessings First'], [/game|खेल/i, 'Games Night']],
    look,
    timeline(S, K2, card, opt) {
      const hi = opt.lang === 'hi', at = k => S.findIndex(s => s.k === k);
      const first = clean(card.title) || (hi ? 'चलिए जश्न मनाएँ' : 'Let’s celebrate');
      S.splice(at('open'), 1, { k: 'reel', reel: 'dust', name: 'Gold Dust', d: 5, line: first });
      Object.assign(S[at('title')], { reel: 'gift', d: 8, change: 'none' }); delete S[at('title')].couple; delete S[at('title')].zone;
      Object.assign(S[at('invite')], { reel: 'champagne', d: 7, change: 'flash', board: false, zone: [200, 760, 760] });
      let n = 0;
      S.forEach(s => { if (s.k !== 'event') return; Object.assign(s, { reel: 'deco', datebar: true, board: false, zone: [560, 1360, 700], change: n % 2 ? 'bloom' : 'sparkle' }); delete s.couple; n++; });
      const di = at('date'); if (di >= 0) Object.assign(S[di], { reel: 'rooftop', board: false, change: 'bloom', zone: [380, 1240, 700] });
      const ei = at('end'); if (ei >= 0) Object.assign(S[ei], { reel: 'toast', board: false, change: 'sparkle', zone: [300, 900, 720] });
      Object.assign(S[at('final')], { reel: 'gold', board: false, change: 'sparkle', zone: [420, 1500, 680] });
      let total = S.reduce((a, s) => a + s.d, 0);
      if (total > 59.5 && at('end') >= 0) { total -= S[at('end')].d; S.splice(at('end'), 1); }
      const evs = S.filter(s => s.k === 'event'), ed = evs.reduce((a, s) => a + s.d, 0);
      if (total > 59.5 && ed) { const f = (59.5 - (total - ed)) / ed; evs.forEach(s => { s.d = Math.max(3.4, s.d * f); }); }
    },
    shots: {
      dust(c, s, pt, t, P) {
        const k = kOf(P), z = 1.12 - .1 * ease3(pt / s.d);
        c.save(); c.translate(540, 960); c.scale(z, z); c.translate(-540, -960); c.drawImage(velvetArt(k), 0, 0, W, H); c.restore();
        bokehGold(c, t, 4, 12);
        // gold dust swirls in and gathers at the centre
        const R = rng(9), g = ease3((pt - .1) / 2);
        for (let i = 0; i < 140; i++) {
          const a0 = R() * TAU, r0 = 300 + R() * 900, a = a0 + (1 - g) * 2.4 + t * .2, r = lerp(r0, 40 + R() * 380, g);
          const x = 540 + Math.cos(a) * r, y = 900 + Math.sin(a) * r * .55, sz = 1.5 + R() * 3.5;
          c.fillStyle = `rgba(255,${205 + (i % 3) * 16},130,${(.35 + .6 * Math.abs(Math.sin(t * 2 + i))).toFixed(2)})`; c.beginPath(); c.arc(x, y, sz, 0, TAU); c.fill();
        }
        const la = ease((pt - 1.1) / 1);
        if (la > 0) {
          glow(c, 540, 900, 520 * la, `rgba(255,200,110,${(.22 * la).toFixed(2)})`);
          c.save(); c.globalAlpha = la; c.textAlign = 'center'; c.textBaseline = 'middle';
          const hi = hiOf(P), deva = /[ऀ-ॿ]/.test(s.line);
          c.font = deva ? '700 140px "Amita"' : '180px "Great Vibes"'; let zz = deva ? 140 : 180;
          while (c.measureText(s.line).width > 940 && zz > 60) { zz *= .93; c.font = deva ? `700 ${zz}px "Amita"` : `${zz}px "Great Vibes"`; }
          foil(c, s.line, 540, 880, { font: c.font, t });
          c.font = hi ? '44px "Tiro Devanagari Hindi"' : '40px "Cinzel"'; if (!hi) K.spacing(c, 14); c.fillStyle = '#d9b26a';
          c.fillText(hi ? 'एक सुनहरी शाम' : 'AN EVENING IN GOLD', 540, 1040); K.spacing(c, 0);
          c.strokeStyle = goldGrad(c, 300, 0, 780, 0); c.lineWidth = 2; c.beginPath(); c.moveTo(540 - 260 * la, 980); c.lineTo(540 + 260 * la, 980); c.moveTo(540 - 260 * la, 1100); c.lineTo(540 + 260 * la, 1100); c.stroke();
          c.restore();
        }
        dust(c, t, 40, 3);
        if (pt < .7) { c.fillStyle = `rgba(0,0,0,${(1 - pt / .7).toFixed(2)})`; c.fillRect(0, 0, W, H); }
      },
      gift(c, s, pt, t, P) {
        const k = kOf(P), card = P.card, hi = hiOf(P);
        const cam = camAt(pt, [[0, { y: 1250, z: 1.3 }], [2.6, { y: 1150, z: 1.08 }], [4.2, { y: 1000, z: 1 }], [8, { y: 960, z: 1 }]]);
        c.drawImage(velvetArt(k), 0, 0, W, H);
        bokehGold(c, t, 11, 8);
        c.save(); camera(c, cam);
        const bx = 540, by = 1500, untie = ease3((pt - .8) / 1.2), lift = ease3((pt - 2) / 1.3), open = lift;
        // floor reflection and shadow
        c.fillStyle = 'rgba(0,0,0,.55)'; c.beginPath(); c.ellipse(bx, by + 6, 330, 40, 0, 0, TAU); c.fill();
        if (open > 0) { rays(c, bx, by - BOX.h, t, { n: 22, r: 1500, col: '255,214,140', a: .28 * open, spin: .04 }); glow(c, bx, by - BOX.h - 40, 600 * open, `rgba(255,220,150,${(.5 * open).toFixed(2)})`); }
        c.drawImage(boxArt(k), bx - 320, by - 500, 640, 520);
        // the number rises out of the open box
        const age = ageOf(card), rise = ease3((pt - 2.6) / 1.6);
        if (rise > 0) {
          c.save(); c.beginPath(); c.rect(0, -2000, W, by - BOX.h + 2000); c.clip();
          if (age) bigNumber(c, age, bx, lerp(by - BOX.h + 260, 760, rise), age.length > 2 ? 380 : 520, t, 1);
          else bigNumber(c, '✦', bx, lerp(by - BOX.h + 260, 760, rise), 420, t, 1);
          c.restore();
        }
        // the lid lifts and tumbles away; the bow loosens first
        const ly = by - BOX.h - lift * 1200, lr = lift * -.5, lx = bx + lift * 420;
        c.save(); c.translate(lx, ly); c.rotate(lr); c.drawImage(lidArt(k), -320, -160, 640, 200); bow(c, 0, -BOX.lidH, 1.1 * (1 - untie * .25), t); c.restore();
        if (rise > .3) dust(c, t, 30, 17, 60);
        c.restore();
        // the name and tagline in foil
        const na = ease((pt - 4.4) / .9);
        if (na > 0) {
          c.save(); c.globalAlpha = na; c.textAlign = 'center'; c.textBaseline = 'middle';
          const name = clean(card.host2) ? `${clean(card.host1)} & ${clean(card.host2)}` : clean(card.host1), deva = /[ऀ-ॿ]/.test(name);
          let zz = deva ? 120 : 150; c.font = deva ? `700 ${zz}px "Amita"` : `${zz}px "Great Vibes"`;
          while (c.measureText(name).width > 920 && zz > 60) { zz *= .93; c.font = deva ? `700 ${zz}px "Amita"` : `${zz}px "Great Vibes"`; }
          foil(c, name, 540, 250 + (1 - na) * 20, { font: c.font, t });
          c.font = hi ? '40px "Tiro Devanagari Hindi"' : '36px "Cinzel"'; if (!hi) K.spacing(c, 10); c.fillStyle = '#d9b26a';
          const lab = hi ? '— का जन्मदिन —' : '—  TURNS  —'; c.fillText(lab, 540, 400); K.spacing(c, 0);
          const tag = clean(card.tagline).replace(/^is\s+/i, '');
          if (tag) { c.font = 'italic 56px "Cormorant Garamond"'; c.fillStyle = '#f6ead2'; c.fillText(tag, 540, 1650, 940); }
          c.restore();
        }
        if (pt > 3) goldConfetti(c, t, Math.round(40 * ease((pt - 3) / 1)), 23);
      },
      champagne(c, s, pt, t, P) {
        const k = kOf(P);
        c.drawImage(velvetArt(k), 0, 0, W, H);
        bokehGold(c, t, 21, 12);
        const b = textBox(P, s); deco(c, 110, b.y - 110, 860, b.h + 220, ease((pt - .2) / .6), t);
        // the bottle tilts, the cork flies, gold foam sprays; two flutes come together and clink
        const pop = 1.0, tilt = lerp(.15, .55, ease3(pt / pop)) + (pt > pop ? Math.sin((pt - pop) * 20) * .03 * Math.exp(-(pt - pop) * 3) : 0);
        const bxx = 300, byy = 1900;
        c.save(); c.translate(bxx, byy); c.rotate(tilt); c.drawImage(bottleArt(k), -130, -880, 260, 900); c.restore();
        const nx = bxx + Math.sin(tilt) * 840, ny = byy - Math.cos(tilt) * 840;
        if (pt > pop) {
          const q = pt - pop, cx = nx + q * 900, cy = ny - q * 1300 + q * q * 900;
          if (q < 1.4) { c.fillStyle = '#c8952e'; c.beginPath(); c.ellipse(cx, cy, 22, 30, q * 8, 0, TAU); c.fill(); }
          const R = rng(5);
          for (let i = 0; i < 90; i++) { const life = (q * 1.4 + R()) % 1.2, an = tilt - Math.PI / 2 + (R() - .5) * .7, sp = 500 + R() * 700;
            const x = nx + Math.cos(an) * sp * life, y = ny + Math.sin(an) * sp * life + life * life * 900, a = Math.max(0, 1 - life / 1.2) * Math.min(1, q * 4);
            c.fillStyle = `rgba(255,${230 + (i % 2) * 20},${170 + (i % 3) * 30},${(a * .9).toFixed(2)})`; c.beginPath(); c.arc(x, y, 3 + R() * 6, 0, TAU); c.fill(); }
          if (q < .3) glow(c, nx, ny, 260, `rgba(255,240,200,${(.8 * (1 - q / .3)).toFixed(2)})`);
        }
        const meet = ease3((pt - 2.4) / 1.2), clink = pt > 3.6 ? Math.exp(-(pt - 3.6) * 4) * Math.sin((pt - 3.6) * 30) * .02 : 0;
        flute(c, lerp(1180, 640, meet), 1790, 1.05, ease((pt - 1.4) / 2), t, lerp(.3, .1, meet) + clink);
        flute(c, lerp(1500, 840, meet), 1800, 1.05, ease((pt - 1.6) / 2), t, lerp(-.1, -.12, meet) - clink);
        if (pt > 3.6 && pt < 4.6) { const q = (pt - 3.6); glow(c, 740, 1385, 200 * (1 - q), `rgba(255,248,220,${(.9 * (1 - q)).toFixed(2)})`); sparks(c, t, 0, '#fff', 1); }
        dust(c, t, 30, 8);
      },
      deco(c, s, pt, t, P) {
        const k = kOf(P), i = s.i || 0, z = 1.06 - .05 * ease3(pt / s.d);
        c.save(); c.translate(540, 960); c.scale(z, z); c.rotate(i % 2 ? .02 : -.02); c.translate(-540, -960); c.drawImage(marbleArt(k), 0, 0, W, H); c.restore();
        // a great sunburst fan behind, a different geometry for each part of the night
        c.save(); c.translate(540, i % 2 ? 1900 : 300); c.strokeStyle = 'rgba(217,178,106,.28)'; c.lineWidth = 2;
        const nf = 18 + (i % 3) * 6;
        for (let j = 0; j < nf; j++) { const an = (i % 2 ? Math.PI : 0) + j / nf * Math.PI + t * .02 * (i % 2 ? -1 : 1); c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(an) * 1600, Math.sin(an) * 1600); c.stroke(); }
        for (let r = 200; r < 1600; r += 160) { c.beginPath(); c.arc(0, 0, r, i % 2 ? Math.PI : 0, i % 2 ? TAU : Math.PI); c.stroke(); }
        c.restore();
        bokehGold(c, t, 31 + i, 8);
        const b = textBox(P, s), a = ease(pt / .6);
        deco(c, 120, b.y - 150, 840, b.h + 280, a, t);
        // a roman numeral medallion on the crown
        if (a > 0) { c.save(); c.globalAlpha = a; c.translate(540, b.y - 150); c.fillStyle = '#0a0908'; c.beginPath(); c.arc(0, 0, 58, 0, TAU); c.fill(); c.strokeStyle = goldGrad(c, 0, -58, 0, 58); c.lineWidth = 4; c.stroke();
          foil(c, ['I', 'II', 'III', 'IV', 'V', 'VI'][i % 6], 0, 4, { font: '700 46px "Cinzel"', t }); c.restore(); }
        dust(c, t, 34, 40 + i);
      },
      rooftop(c, s, pt, t, P) {
        const k = kOf(P), z = 1.08 - .08 * ease3(pt / s.d);
        c.save(); c.translate(540, 1100); c.scale(z, z); c.translate(-540, -1100); c.drawImage(skylineArt(k), 0, 0, W, H); c.restore();
        // gold string lights swaying over the terrace
        for (const [y0, sag, seed] of [[120, 120, 2], [260, 90, 5]]) {
          c.strokeStyle = 'rgba(60,45,25,.9)'; c.lineWidth = 2; c.beginPath();
          for (let j = 0; j <= 30; j++) { const u = j / 30, x = u * W, y = y0 + Math.sin(u * Math.PI) * sag + Math.sin(t + u * 3) * 4; j ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
          for (let j = 1; j < 18; j++) { const u = j / 18, x = u * W, y = y0 + Math.sin(u * Math.PI) * sag + Math.sin(t + u * 3) * 4 + 10, a = .6 + .4 * Math.sin(t * 2 + j * seed);
            glow(c, x, y, 34, `rgba(255,200,110,${(.45 * a).toFixed(2)})`); c.fillStyle = `rgba(255,236,190,${a.toFixed(2)})`; c.beginPath(); c.arc(x, y, 7, 0, TAU); c.fill(); }
        }
        bokehGold(c, t, 41, 9);
        const b = textBox(P, s); deco(c, 130, b.y - 110, 820, b.h + 220, ease(pt / .6), t, 'rgba(8,7,6,.78)');
        dust(c, t, 24, 12);
      },
      toast(c, s, pt, t, P) {
        const k = kOf(P);
        c.drawImage(velvetArt(k), 0, 0, W, H);
        bokehGold(c, t, 51, 14);
        flute(c, 430, 1840, 1.1, 1, t, .12); flute(c, 650, 1850, 1.1, 1, t, -.12);
        glow(c, 540, 1360, 260, `rgba(255,240,200,${(.35 + .15 * Math.sin(t * 2)).toFixed(2)})`);
        const b = textBox(P, s); deco(c, 120, b.y - 110, 840, b.h + 220, ease(pt / .6), t);
        dust(c, t, 40, 22);
      },
      gold(c, s, pt, t, P) {
        const k = kOf(P);
        c.drawImage(velvetArt(k), 0, 0, W, H);
        rays(c, 540, 300, t, { n: 20, r: 1600, col: '255,214,140', a: .12, spin: .03 });
        bokehGold(c, t, 61, 12);
        goldConfetti(c, t, 70, 9);
        const b = textBox(P, s); deco(c, 150, b.y - 110, 780, b.h + 220, ease(pt / .6), t, 'rgba(10,9,8,.9)');
        dust(c, t, 30, 31);
      }
    }
  };
})(Cinema.kit));
