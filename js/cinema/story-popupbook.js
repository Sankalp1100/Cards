// Pop-up Storybook: a baby shower (Godh Bharai) film. A linen storybook lies on a soft quilt; its cover opens and
// paper-craft scenes unfold out of every spread: a night sky with a crescent moon and clouds over a little cradle, a
// garden of paper flowers and butterflies, lotus and diyas for the rituals, toy blocks for the games. Each page turns
// to the next, the words hang above on a paper tag, and the book ends under the moon with the thank you.
Cinema.register((K => {
  const { W, H, TAU, rng, clamp, ease, ease3, lerp, mix, art, glow, rrect, clean, splitIcon, pageTurn, butterfly, flame, sparks, camAt, camera } = K;
  const back = u => { u = clamp(u); const s = 1.5; return 1 + (s + 1) * (u - 1) ** 3 + s * (u - 1) ** 2; };
  const kOf = P => Math.min(1.25, Math.max(.5, P.k));
  const hiOf = P => P.opt.lang === 'hi';
  // the open book: two pages either side of the gutter
  const B = { x: 60, y: 1330, w: 960, h: 440, g: 540, base: 1680 };
  const PW = B.w / 2;

  // ---- paper: a shape with its thickness and a soft shadow (live, cheap) ----
  function paper(c, path, col, sh = 1) {
    c.save(); c.translate(5 * sh, 9 * sh); path(); c.fillStyle = 'rgba(90,60,90,.16)'; c.fill(); c.restore();
    path(); c.fillStyle = mix(col, '#7a5a7a', .25); c.save(); c.translate(0, 3); c.fill(); c.restore();
    path(); const g = c.createLinearGradient(0, 600, 0, BASE + 40); g.addColorStop(0, mix(col, '#ffffff', .35)); g.addColorStop(.7, col); g.addColorStop(1, mix(col, '#6a4a7a', .18)); c.fillStyle = g; c.fill();
    c.save(); c.translate(-2, -2); path(); c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 2; c.stroke(); c.restore();
  }
  const cloudPath = (c, x, y, w) => () => { c.beginPath(); c.moveTo(x - w / 2, y); const n = 5; for (let i = 0; i < n; i++) { const cx = x - w / 2 + (i + .5) * w / n, r = w / n * (i === 2 ? .85 : i % 2 ? .7 : .55); c.arc(cx, y - r * .3, r, Math.PI, 0); } c.lineTo(x + w / 2, y); c.closePath(); };
  const starPath = (c, x, y, r) => () => { c.beginPath(); for (let j = 0; j < 10; j++) { const a = j * TAU / 10 - Math.PI / 2, rr = j % 2 ? r * .45 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); };
  // a pop-up piece: drawn standing on its base line, unfolding upward as u goes 0 → 1
  function pop(c, u, baseY, draw) {
    const s = back(u); if (s <= .01) return;
    c.save(); c.translate(0, baseY); c.scale(1, s); c.translate(0, -baseY); draw(); c.restore();
  }
  // every pop-up stands a little bigger than its page
  const stage = fn => (c, u, t) => { c.save(); c.translate(540, BASE); c.scale(1.16, 1.16); c.translate(-540, -BASE); fn(c, u, t); c.restore(); };

  // ---- still art ----
  function roomArt(k) {
    return art('pb-room', W, H, k, c => {
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#fbe9ef'); g.addColorStop(.6, '#f3e6f7'); g.addColorStop(1, '#e3eefa'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      const R = rng(8);
      // wallpaper of tiny stars and dots
      for (let y = 40; y < 1300; y += 90) for (let x = (y / 90 % 2) * 45 + 20; x < W; x += 90) {
        c.fillStyle = (x + y) % 3 ? 'rgba(200,160,200,.22)' : 'rgba(150,180,220,.25)';
        if ((x * 7 + y) % 5 === 0) { starPath(c, x, y, 10)(); c.fill(); } else { c.beginPath(); c.arc(x, y, 4, 0, TAU); c.fill(); }
      }
      glow(c, 540, 700, 760, 'rgba(255,250,240,.75)');
      // the quilt the book lies on
      const qy = 1260, qg = c.createLinearGradient(0, qy, 0, H); qg.addColorStop(0, '#d8e6f6'); qg.addColorStop(1, '#b9cde8'); c.fillStyle = qg; c.fillRect(0, qy, W, H - qy);
      c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 3; c.setLineDash([10, 9]);
      for (let x = -200; x < W + 200; x += 120) { c.beginPath(); c.moveTo(x, qy); c.lineTo(x + 360, H); c.stroke(); c.beginPath(); c.moveTo(x + 360, qy); c.lineTo(x, H); c.stroke(); }
      c.setLineDash([]);
      for (let x = -60; x < W + 60; x += 120) for (let y = qy + 60; y < H; y += 120) { c.fillStyle = (x / 120 + y / 120) % 2 < 1 ? 'rgba(255,214,226,.55)' : 'rgba(255,255,255,.4)'; c.beginPath(); c.arc(x + 60, y, 10, 0, TAU); c.fill(); }
      const sh = c.createLinearGradient(0, qy, 0, qy + 80); sh.addColorStop(0, 'rgba(120,100,150,.25)'); sh.addColorStop(1, 'rgba(120,100,150,0)'); c.fillStyle = sh; c.fillRect(0, qy, W, 80);
      // the book's hard cover and the page block
      c.save(); c.shadowColor = 'rgba(80,50,90,.35)'; c.shadowBlur = 40; c.shadowOffsetY = 24; c.fillStyle = '#b86f8a'; rrect(c, B.x - 26, B.y - 20, B.w + 52, B.h + 56, 18); c.fill(); c.restore();
      for (let i = 0; i < 6; i++) { c.fillStyle = i % 2 ? '#f3ead9' : '#e6dcc8'; c.fillRect(B.x - 6, B.y + B.h + 2 + i * 4, B.w + 12, 4); }
    });
  }
  function pageArt(k, side) {
    return art(`pb-page${side}`, PW, B.h, k, c => {
      const g = c.createLinearGradient(side === 'L' ? PW : 0, 0, side === 'L' ? 0 : PW, 0); g.addColorStop(0, '#e9dfcc'); g.addColorStop(.12, '#fbf6ec'); g.addColorStop(1, '#fffaf2');
      c.fillStyle = g; c.fillRect(0, 0, PW, B.h);
      const R = rng(side === 'L' ? 3 : 4);
      for (let i = 0; i < 700; i++) { c.fillStyle = `rgba(160,130,100,${(R() * .06).toFixed(3)})`; c.fillRect(R() * PW, R() * B.h, 2, 2); }
      c.strokeStyle = 'rgba(200,160,190,.45)'; c.lineWidth = 2; c.setLineDash([8, 8]); c.strokeRect(24, 24, PW - 48, B.h - 48); c.setLineDash([]);
      for (let i = 0; i < 14; i++) { c.fillStyle = ['rgba(240,170,200,.35)', 'rgba(160,190,235,.35)', 'rgba(250,215,140,.35)'][i % 3]; starPath(c, 50 + R() * (PW - 100), 50 + R() * (B.h - 100), 6 + R() * 6)(); c.fill(); }
    });
  }
  function coverArt(k, title) {
    return art(`pb-cover-${title}`, PW + 26, B.h + 36, k, c => {
      const w = PW + 26, h = B.h + 36, g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#d48aa5'); g.addColorStop(1, '#a95c7a'); c.fillStyle = g; rrect(c, 0, 0, w, h, 16); c.fill();
      const R = rng(2); c.globalAlpha = .12; c.strokeStyle = '#ffffff'; c.lineWidth = 1;
      for (let y = 0; y < h; y += 5) { c.beginPath(); c.moveTo(0, y + R()); c.lineTo(w, y + R()); c.stroke(); }
      for (let x = 0; x < w; x += 5) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
      c.globalAlpha = 1;
      c.fillStyle = 'rgba(60,20,40,.25)'; c.fillRect(0, 0, 20, h);
      const gold = c.createLinearGradient(0, 0, 0, h); gold.addColorStop(0, '#fff1c4'); gold.addColorStop(.5, '#e2b860'); gold.addColorStop(1, '#a8781e');
      c.strokeStyle = gold; c.lineWidth = 4; rrect(c, 46, 30, w - 76, h - 60, 30); c.stroke(); c.lineWidth = 1.5; rrect(c, 58, 42, w - 100, h - 84, 24); c.stroke();
      c.fillStyle = gold; c.beginPath(); c.arc(w / 2 + 10, 150, 64, 0, TAU); c.fill(); c.fillStyle = '#c2779a'; c.beginPath(); c.arc(w / 2 + 38, 132, 58, 0, TAU); c.fill();
      for (const [x, y, r] of [[w / 2 - 70, 110, 12], [w / 2 + 90, 200, 9], [w / 2 - 40, 210, 7], [w / 2 + 110, 90, 8]]) { c.fillStyle = gold; starPath(c, x, y, r)(); c.fill(); }
      c.fillStyle = gold; c.textAlign = 'center'; c.textBaseline = 'middle';
      const deva = /[ऀ-ॿ]/.test(title); let z = deva ? 76 : 88; c.font = deva ? `700 ${z}px "Amita"` : `${z}px "Satisfy"`;
      while (c.measureText(title).width > w - 140 && z > 40) { z *= .92; c.font = deva ? `700 ${z}px "Amita"` : `${z}px "Satisfy"`; }
      c.shadowColor = 'rgba(90,30,50,.45)'; c.shadowBlur = 6; c.shadowOffsetY = 3; c.fillText(title, w / 2 + 10, 320);
      c.shadowColor = 'transparent'; c.lineWidth = 2; c.strokeStyle = gold; c.beginPath(); c.moveTo(w / 2 - 90, 395); c.lineTo(w / 2 + 110, 395); c.stroke();
    });
  }
  function drawSpread(c, k) { c.drawImage(pageArt(k, 'L'), B.x, B.y, PW, B.h); c.drawImage(pageArt(k, 'R'), B.g, B.y, PW, B.h);
    const gs = c.createLinearGradient(B.g - 40, 0, B.g + 40, 0); gs.addColorStop(0, 'rgba(120,90,80,0)'); gs.addColorStop(.5, 'rgba(120,90,80,.3)'); gs.addColorStop(1, 'rgba(120,90,80,0)'); c.fillStyle = gs; c.fillRect(B.g - 40, B.y, 80, B.h); }

  // ---- the pop-up scenes (live paper shapes); u: how far it has unfolded, t: time ----
  const BASE = 1540;
  function moonScene(c, u, t) {
    // the sky arch behind
    pop(c, u, BASE, () => paper(c, () => { c.beginPath(); c.moveTo(150, BASE); c.lineTo(150, 980); c.bezierCurveTo(150, 700, 930, 700, 930, 980); c.lineTo(930, BASE); c.closePath(); }, '#7d8fd0'));
    pop(c, u, BASE, () => { for (const [x, y, r] of [[260, 980, 16], [400, 860, 12], [700, 850, 14], [830, 1000, 11], [560, 920, 9], [320, 1150, 10], [790, 1180, 12]]) paper(c, starPath(c, x, y, r), '#ffe9a8', .5); });
    pop(c, (u - .15) / .85, BASE, () => { for (const [x, y, w, col] of [[300, 1300, 330, '#e9eefc'], [780, 1280, 360, '#f6e6f4'], [540, 1400, 520, '#ffffff']]) paper(c, cloudPath(c, x, y, w), col); });
    // the moon on a thread
    const mu = back((u - .3) / .7), sw = Math.sin(t * 1.1) * .06;
    if (mu > .01) { c.save(); c.translate(560, 700); c.rotate(sw); c.strokeStyle = 'rgba(120,100,140,.7)'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 180 * mu); c.stroke();
      c.translate(0, 180 * mu + 90); c.scale(mu, mu); paper(c, () => { c.beginPath(); c.arc(0, 0, 100, -Math.PI * .65, Math.PI * .65, true); c.arc(40, -10, 84, Math.PI * .62, -Math.PI * .62, false); c.closePath(); }, '#ffe08a');
      c.fillStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.arc(-60, -30, 10, 0, TAU); c.fill(); c.restore(); }
  }
  function cradleScene(c, u, t) {
    const rock = Math.sin(t * 1.4) * .05;
    pop(c, (u - .2) / .8, BASE, () => {
      c.save(); c.translate(540, BASE - 20); c.rotate(rock);
      paper(c, () => { c.beginPath(); c.moveTo(-220, 0); c.quadraticCurveTo(0, 90, 220, 0); c.lineTo(230, 14); c.quadraticCurveTo(0, 110, -230, 14); c.closePath(); }, '#d9a2c0');
      paper(c, () => { c.beginPath(); c.moveTo(-180, -10); c.lineTo(-180, -170); c.quadraticCurveTo(0, -200, 180, -170); c.lineTo(180, -10); c.quadraticCurveTo(0, 50, -180, -10); c.closePath(); }, '#fbe1ec');
      const hood = () => { c.beginPath(); c.moveTo(-190, -160); c.bezierCurveTo(-200, -400, 20, -420, 40, -170); c.quadraticCurveTo(-70, -230, -190, -160); c.closePath(); };
      paper(c, hood, '#f3b8cf');
      c.save(); hood(); c.clip(); c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 12; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(-190 + i * 45, -150); c.quadraticCurveTo(-120 + i * 30, -330, -60 + i * 18, -420); c.stroke(); } c.restore();
      c.fillStyle = '#ffffff'; for (let i = 0; i <= 8; i++) { const u2 = i / 8, x = lerp(-190, 40, u2), y = -160 - Math.sin(u2 * Math.PI) * 40 - u2 * 10; c.beginPath(); c.arc(x, y, 11, 0, TAU); c.fill(); }
      c.fillStyle = 'rgba(255,255,255,.9)'; for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(-150 + i * 37, -150 + Math.sin(i) * 6, 8, 0, TAU); c.fill(); }
      c.strokeStyle = 'rgba(150,110,150,.7)'; c.lineWidth = 2; c.beginPath(); c.moveTo(120, -420); c.lineTo(120, -300); c.stroke();
      for (let i = 0; i < 3; i++) { const sx = 60 + i * 60, sy = -300 + (i % 2) * 40; c.beginPath(); c.moveTo(120, -300); c.lineTo(sx, sy); c.stroke(); paper(c, starPath(c, sx, sy + 26, 22), ['#ffe08a', '#b9d4f4', '#f7b6c8'][i], .4); }
      paper(c, () => { c.beginPath(); c.moveTo(-160, -120); c.quadraticCurveTo(0, -150, 160, -120); c.lineTo(160, -60); c.quadraticCurveTo(0, -30, -160, -60); c.closePath(); }, '#cfe0f7');
      c.restore();
    });
  }
  function gardenScene(c, u, t) {
    pop(c, u, BASE, () => { const cols = ['#f4a6be', '#ffd59a', '#fff3b0', '#bfe6c8', '#b9d4f4', '#d6c2f2'];
      cols.forEach((col, i) => paper(c, () => { const r = 380 - i * 38; c.beginPath(); c.arc(540, BASE, r, Math.PI, 0); c.arc(540, BASE, r - 38, 0, Math.PI, true); c.closePath(); }, col, .5)); });
    pop(c, (u - .15) / .85, BASE, () => {
      const R = rng(4);
      for (let i = 0; i < 9; i++) {
        const x = 150 + i * 98 + (R() - .5) * 30, h = 120 + R() * 170, col = ['#f48fb1', '#ffb74d', '#ce93d8', '#81c7f5'][i % 4];
        c.strokeStyle = '#6aa66e'; c.lineWidth = 6; c.beginPath(); c.moveTo(x, BASE); c.quadraticCurveTo(x + 14, BASE - h / 2, x, BASE - h); c.stroke();
        paper(c, () => { c.beginPath(); c.ellipse(x - 26, BASE - h * .45, 30, 12, -.5, 0, TAU); }, '#8cc890', .4);
        paper(c, () => { c.beginPath(); for (let j = 0; j < 6; j++) { const a = j * TAU / 6 + i; c.moveTo(x, BASE - h); c.ellipse(x + Math.cos(a) * 24, BASE - h + Math.sin(a) * 24, 24, 14, a, 0, TAU); } }, col, .5);
        c.fillStyle = '#ffe08a'; c.beginPath(); c.arc(x, BASE - h, 11, 0, TAU); c.fill();
      }
    });
    const bu = ease((u - .5) / .5);
    if (bu > 0) for (let i = 0; i < 3; i++) { c.save(); c.globalAlpha = bu; butterfly(c, 280 + i * 260 + Math.sin(t * .7 + i) * 60, 980 - i * 60 + Math.cos(t * .9 + i) * 40, 46, Math.sin(t * 9 + i), ['#f48fb1', '#81c7f5', '#ffb74d'][i]); c.restore(); }
  }
  function lotusScene(c, u, t) {
    const arch = (inset) => () => { c.beginPath(); c.moveTo(200 + inset, BASE); c.lineTo(200 + inset, 1150); c.bezierCurveTo(200 + inset, 960, 400, 900, 540, 800 + inset); c.bezierCurveTo(680, 900, 880 - inset, 960, 880 - inset, 1150); c.lineTo(880 - inset, BASE); c.closePath(); };
    pop(c, u, BASE, () => { paper(c, arch(0), '#f08aa8'); paper(c, arch(26), '#ffe2b8', .5);
      for (let i = 0; i < 9; i++) { const a = i / 8; paper(c, () => { c.beginPath(); c.arc(lerp(250, 830, a), 1180 - Math.sin(a * Math.PI) * 160, 16, 0, TAU); }, i % 2 ? '#ff9e3d' : '#ffd23f', .4); } });
    pop(c, (u - .2) / .8, BASE, () => {
      // a big lotus in the middle
      const x = 540, y = BASE - 60;
      for (const [a, r, col] of [[-1.15, 170, '#f7b6c8'], [1.15, 170, '#f7b6c8'], [-.6, 190, '#f49ab5'], [.6, 190, '#f49ab5'], [0, 210, '#fbd0dc']]) {
        paper(c, () => { c.save(); c.translate(x, y); c.rotate(a); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-70, -r * .55, 0, -r); c.quadraticCurveTo(70, -r * .55, 0, 0); c.restore(); }, col, .6);
      }
      paper(c, () => { c.beginPath(); c.ellipse(x, y + 10, 210, 34, 0, 0, TAU); }, '#8cc890', .6);
    });
    // diyas either side
    const du = back((u - .45) / .55);
    if (du > .01) for (const dx of [-300, 300]) {
      c.save(); c.translate(540 + dx, BASE - 30); c.scale(du, du);
      paper(c, () => { c.beginPath(); c.moveTo(-70, -10); c.quadraticCurveTo(0, 60, 70, -10); c.quadraticCurveTo(0, 10, -70, -10); }, '#e07a3a', .6);
      c.restore(); if (du > .9) flame(c, 540 + dx, BASE - 44, 40, t, dx);
    }
  }
  function toyScene(c, u, t) {
    pop(c, u, BASE, () => { [[1180, '#bcd3f5'], [1300, '#c9ebd2'], [1400, '#fbd3e2']].forEach(([y, col], i) => paper(c, () => { c.beginPath(); c.moveTo(150, BASE); c.lineTo(150, y + 40); for (let x = 150; x <= 930; x += 30) c.lineTo(x, y + Math.sin(x / 120 + i * 2) * 40); c.lineTo(930, BASE); c.closePath(); }, col, .5));
      c.strokeStyle = 'rgba(150,110,150,.7)'; c.lineWidth = 2; c.beginPath(); c.moveTo(170, 1020); c.quadraticCurveTo(540, 1120, 910, 1020); c.stroke();
      for (let i = 0; i < 9; i++) { const a = (i + .5) / 9, x = lerp(170, 910, a), y = 1020 + Math.sin(a * Math.PI) * 50; paper(c, () => { c.beginPath(); c.moveTo(x - 30, y); c.lineTo(x + 30, y); c.lineTo(x, y + 60); c.closePath(); }, ['#f48fb1', '#81c7f5', '#ffd166'][i % 3], .4); } });
    const blocks = [[330, 'A', '#f48fb1'], [460, 'B', '#81c7f5'], [590, 'C', '#ffd166'], [395, '♥', '#b39ddb'], [525, '★', '#8cd4a0']];
    blocks.forEach(([x, ch, col], i) => {
      const y = i < 3 ? BASE : BASE - 130, uu = (u - .2 - i * .08) / .6;
      pop(c, uu, y, () => {
        paper(c, () => { c.beginPath(); rrect(c, x - 60, y - 124, 120, 120, 14); }, col);
        c.fillStyle = 'rgba(255,255,255,.95)'; rrect(c, x - 40, y - 104, 80, 80, 10); c.fill();
        c.fillStyle = mix(col, '#3a2050', .35); c.font = '600 64px "Fredoka"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(ch, x, y - 60);
      });
    });
    // a rattle on the right
    pop(c, (u - .5) / .5, BASE, () => { c.save(); c.translate(780, BASE - 10); c.rotate(-.35 + Math.sin(t * 3) * .05);
      paper(c, () => { c.beginPath(); rrect(c, -12, -200, 24, 200, 12); }, '#f3b8cf', .5);
      paper(c, () => { c.beginPath(); c.arc(0, -250, 70, 0, TAU); }, '#ffd59a');
      c.fillStyle = '#ffffff'; for (let j = 0; j < 6; j++) { c.beginPath(); c.arc(Math.cos(j) * 40, -250 + Math.sin(j) * 40, 7, 0, TAU); c.fill(); } c.restore(); });
  }
  const S0 = { moonScene, gardenScene, lotusScene, toyScene, cradleScene };
  const moonS = stage(moonScene), gardenS = stage(gardenScene), lotusS = stage(lotusScene), toyS = stage(toyScene), cradleS = stage(cradleScene);
  const SCENES = [moonS, gardenS, lotusS, toyS, cradleS];
  const sceneFor = name => /godh|ritual|puja|pooja|गोद|पूजा|रस्म/i.test(name) ? lotusS : /game|fun|play|खेल/i.test(name) ? toyS : /lunch|dinner|food|भोज|खाना/i.test(name) ? gardenS : null;

  // the paper tag the words hang on
  function tag(c, x, y, w, h, a, col = '#f3b8cf') {
    if (a <= 0) return;
    c.save(); c.globalAlpha = a;
    c.strokeStyle = 'rgba(150,110,150,.6)'; c.lineWidth = 2.5; for (const dx of [-w * .3, w * .3]) { c.beginPath(); c.moveTo(x + dx, 0); c.lineTo(x + dx, y + 20); c.stroke(); }
    c.fillStyle = 'rgba(110,70,110,.15)'; rrect(c, x - w / 2 + 8, y + 14, w, h, 30); c.fill();
    c.fillStyle = col; rrect(c, x - w / 2 - 8, y - 8, w + 16, h + 16, 36); c.fill();
    const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#fffdf8'); g.addColorStop(1, '#fbf3ea'); c.fillStyle = g; rrect(c, x - w / 2, y, w, h, 30); c.fill();
    c.strokeStyle = mix(col, '#ffffff', .2); c.lineWidth = 2; c.setLineDash([9, 8]); rrect(c, x - w / 2 + 16, y + 16, w - 32, h - 32, 20); c.stroke(); c.setLineDash([]);
    for (const dx of [-w * .3, w * .3]) { c.fillStyle = '#ffffff'; c.beginPath(); c.arc(x + dx, y + 24, 9, 0, TAU); c.fill(); c.strokeStyle = 'rgba(150,110,150,.6)'; c.stroke(); }
    c.restore();
  }
  function textBox(P, s) {
    try { const T = P.sceneText(s, P.shotLook(s.reel), 'center', P.pic(s)), h = T.M.reduce((a, m, i) => a + m.h + (i < T.M.length - 1 ? m.gap : 0), 0); return { y: T.y0, h }; }
    catch (e) { return { y: s.zone[0], h: s.zone[1] - s.zone[0] }; }
  }
  // the page before → this page: the right page turns over the gutter onto the left
  function turn(c, k, pt, d0 = .1, dur = 1.1) {
    const u = ease3((pt - d0) / dur);
    if (u < 1) pageTurn(c, u, B.g, B.y, PW, B.h, pageArt(k, 'R'), pageArt(k, 'L'), { depth: .1 });
    return u;
  }
  function floaters(c, t, seed) {
    const R = rng(seed);
    for (let i = 0; i < 14; i++) { const x = R() * W + Math.sin(t * .4 + i) * 30, y = ((R() * 1200 - t * (14 + R() * 10)) % 1200 + 1200) % 1200, r = 6 + R() * 8;
      c.globalAlpha = .5 + .4 * Math.sin(t + i); c.fillStyle = ['#f7b6c8', '#b9d4f4', '#ffe08a'][i % 3]; starPath(c, x, y, r)(); c.fill(); }
    c.globalAlpha = 1;
  }

  const pal = {};
  const look = (kind, K2) => pal.x || (pal.x = K2.palette('clouds-champagne', { font: { script: 'Satisfy', serif: 'Marcellus' },
    col: { names: '#c2547c', ink: '#4a3b5c', ink2: '#6a5a7c', accent: '#6f86c6', gold: '#d9a2c0' }, shadow: ['rgba(255,255,255,.9)', 6] }));

  return {
    id: 'story-popupbook', order: 22, occasion: 'babyshower', tune: 'lullaby', thumb: 9,
    name: 'Pop-up Storybook', note: 'A linen storybook opens and paper clouds, a moon, a cradle and flowers pop up page after page',
    names: ['Kiara', 'Advait'], ganesha: 'ganesha-01',
    looks: { open: 'clouds-champagne', title: 'clouds-champagne', invite: 'clouds-champagne', events: ['clouds-champagne'], date: 'clouds-champagne', end: 'clouds-champagne', final: 'clouds-champagne' },
    titles: [[/godh|गोद/i, 'A Lap Full of Blessings'], [/ritual|puja|pooja|रस्म|पूजा/i, 'Sacred Rituals'], [/game|fun|play|खेल/i, 'Let the Fun Begin'],
      [/lunch|dinner|food|भोज|खाना/i, 'A Little Feast'], [/name|naam|नाम/i, 'A Name Is Chosen']],
    look,
    timeline(S, K2, card, opt) {
      const hi = opt.lang === 'hi', at = k => S.findIndex(s => s.k === k);
      const label = card.type === 'babyshower' ? (hi ? 'गोद भराई' : 'Baby Shower') : (hi ? 'शुभ अवसर' : 'A Celebration');
      const title = clean(card.title) || (hi ? 'नन्हा मेहमान' : 'Oh baby!');
      const two = clean(card.host2), names = two ? `${clean(card.host1)} & ${two}` : clean(card.host1);
      S.splice(at('open'), 1, { k: 'reel', reel: 'cover', name: 'The Book', d: 5.5, cover: hi ? 'गोद भराई' : (title.length < 18 ? title : 'Our Little Story') });
      Object.assign(S[at('title')], { reel: 'sky', d: 6.5, cut: true, change: 'none', mine: [
        { t: 'text', s: label, f: hi ? 'hser' : 'serif', z: hi ? 46 : 38, col: 'accent', up: !hi, ls: hi ? 0 : 8, gap: 10 },
        { t: 'text', s: title, f: hi || /[ऀ-ॿ]/.test(title) ? 'hname' : 'script', z: 120, col: 'names', gap: 14 },
        { t: 'text', s: names, f: /[ऀ-ॿ]/.test(names) ? 'hser' : 'serif', z: 56, col: 'ink', gap: 6 },
        { t: 'text', s: hi ? 'के घर आने वाला है एक नन्हा मेहमान' : 'are expecting a little miracle', f: hi ? 'hser' : 'italic', z: 42, col: 'ink2' }] });
      delete S[at('title')].couple; delete S[at('title')].zone;
      Object.assign(S[at('invite')], { reel: 'garden', d: 7.5, change: 'none', cut: true, board: false, zone: [150, 760, 760] });
      let prev = gardenS, n = 0;
      S.forEach(s => {
        if (s.k !== 'event') return;
        let sc = sceneFor(s.e.name) || SCENES[(n + 2) % SCENES.length]; if (sc === prev) sc = SCENES[(SCENES.indexOf(sc) + 1) % SCENES.length];
        Object.assign(s, { reel: 'page', datebar: true, board: false, zone: [190, 720, 720], change: 'none', cut: true, prevScene: prev, sc }); delete s.couple; prev = sc; n++;
      });
      const di = at('date'); if (di >= 0) Object.assign(S[di], { reel: 'cradle', board: false, change: 'none', cut: true, zone: [160, 760, 720], prevScene: prev });
      const ei = at('end'); if (ei >= 0) Object.assign(S[ei], { reel: 'stars', board: false, change: 'none', cut: true, zone: [200, 720, 740] });
      Object.assign(S[at('final')], { reel: 'night', board: false, change: 'none', zone: [120, 1000, 640] });
      let total = S.reduce((a, s) => a + s.d, 0);
      if (total > 59.5 && at('end') >= 0) { total -= S[at('end')].d; S.splice(at('end'), 1); }
      const evs = S.filter(s => s.k === 'event'), ed = evs.reduce((a, s) => a + s.d, 0);
      if (total > 59.5 && ed) { const f = (59.5 - (total - ed)) / ed; evs.forEach(s => { s.d = Math.max(3.4, s.d * f); }); }
    },
    shots: {
      cover(c, s, pt, t, P) {
        const k = kOf(P);
        const cam = camAt(pt, [[0, { x: 760, y: 1350, z: 1.7 }], [2.4, { x: 690, y: 1205, z: 1.35 }], [5.5, { x: 540, y: 960, z: 1 }]]);
        c.save(); camera(c, cam); c.drawImage(roomArt(k), 0, 0, W, H);
        drawSpread(c, k);
        const u = ease3((pt - 2.2) / 1.6), cv = coverArt(k, s.cover);
        // the cover lifts over the gutter; then the first pop-up begins to rise
        if (u < 1) pageTurn(c, u, B.g - 6, B.y - 18, PW + 26, B.h + 36, cv, pageArt(k, 'L'), { depth: .12 });
        if (pt > 3.6) moonS(c, (pt - 3.6) / 1.8, t);
        c.restore();
        floaters(c, t, 5);
        if (pt < .6) { c.fillStyle = `rgba(255,248,250,${(1 - pt / .6).toFixed(2)})`; c.fillRect(0, 0, W, H); }
      },
      sky(c, s, pt, t, P) {
        const k = kOf(P);
        const cam = camAt(pt, [[0, { x: 540, y: 960, z: 1 }], [6.5, { x: 540, y: 980, z: 1.03 }]]);
        c.save(); camera(c, cam); c.drawImage(roomArt(k), 0, 0, W, H); drawSpread(c, k);
        moonS(c, 1, t); cradleS(c, (pt + .2) / 1.4, t);
        c.restore();
        floaters(c, t, 6);
        tag(c, 540, 170, 820, 520, ease((pt - .5) / .5));
        K.words(c, P, s.mine, { zone: [210, 650, 740], L: look('sky', K), p: pt - .7, d: s.d, t });
        sparks(c, t, 10, '#ffe9a8', 12);
      },
      garden(c, s, pt, t, P) {
        const k = kOf(P);
        c.drawImage(roomArt(k), 0, 0, W, H); drawSpread(c, k);
        const u = turn(c, k, pt);
        if (u < .5) { moonS(c, 1 - u * 2, t); cradleS(c, 1 - u * 2, t); }
        else gardenS(c, (pt - .7) / 1.4, t);
        floaters(c, t, 7);
        const b = textBox(P, s); tag(c, 540, b.y - 70, 840, b.h + 140, ease((pt - .2) / .4), '#bfe0c8');
      },
      page(c, s, pt, t, P) {
        const k = kOf(P), i = s.i || 0, nm = s.e ? s.e.name : '', sc = s.sc || moonS;
        c.drawImage(roomArt(k), 0, 0, W, H); drawSpread(c, k);
        const u = turn(c, k, pt), prev = s.prevScene || gardenS;
        if (u < .5) prev(c, 1 - u * 2, t); else sc(c, (pt - .7) / 1.4, t);
        floaters(c, t, 8 + i);
        const b = textBox(P, s); tag(c, 540, b.y - 70, 820, b.h + 140, ease((pt - .2) / .4), ['#f3b8cf', '#b9d4f4', '#ffd59a', '#cfe9d4'][i % 4]);
        const { icon } = splitIcon(nm);
        if (icon) { const ia = back((pt - .8) / .5); if (ia > 0) { c.save(); c.translate(540, b.y - 70); c.scale(ia, ia); c.fillStyle = '#ffffff'; c.beginPath(); c.arc(0, 0, 54, 0, TAU); c.fill(); c.strokeStyle = '#e7c3d6'; c.lineWidth = 4; c.stroke();
          c.font = '58px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(icon, 0, 4); c.restore(); } }
      },
      cradle(c, s, pt, t, P) {
        const k = kOf(P);
        c.drawImage(roomArt(k), 0, 0, W, H); drawSpread(c, k);
        const u = turn(c, k, pt);
        if (u < .5) (s.prevScene || gardenS)(c, 1 - u * 2, t);
        else { moonS(c, (pt - .7) / 1.4, t); cradleS(c, (pt - 1) / 1.4, t); }
        floaters(c, t, 9);
        const b = textBox(P, s); tag(c, 540, b.y - 70, 820, b.h + 140, ease((pt - .2) / .4), '#b9d4f4');
      },
      stars(c, s, pt, t, P) {
        const k = kOf(P);
        c.drawImage(roomArt(k), 0, 0, W, H); drawSpread(c, k);
        const u = turn(c, k, pt);
        if (u < .5) { moonS(c, 1 - u * 2, t); cradleS(c, 1 - u * 2, t); } else gardenS(c, (pt - .7) / 1.4, t);
        floaters(c, t, 10);
        const b = textBox(P, s); tag(c, 540, b.y - 70, 840, b.h + 140, ease((pt - .2) / .4), '#f3b8cf');
      },
      night(c, s, pt, t, P) {
        const k = kOf(P), dark = ease(pt / 1.2);
        c.drawImage(roomArt(k), 0, 0, W, H);
        // the nursery light dims to a night-light glow
        c.fillStyle = `rgba(40,40,90,${(.55 * dark).toFixed(2)})`; c.fillRect(0, 0, W, H);
        drawSpread(c, k); moonS(c, 1, t); cradleS(c, 1, t);
        glow(c, 560, 970, 500, `rgba(255,230,160,${(.35 * dark).toFixed(2)})`);
        const R = rng(3);
        for (let i = 0; i < 40; i++) { const a = Math.max(0, Math.sin(t * (1 + R()) + i)) * dark; c.fillStyle = `rgba(255,240,200,${a.toFixed(2)})`; starPath(c, R() * W, R() * 1250, 4 + R() * 6)(); c.fill(); }
        const b = textBox(P, s); tag(c, 540, b.y - 70, 780, b.h + 140, ease((pt - .2) / .5), '#d9a2c0');
      }
    }
  };
})(Cinema.kit));
