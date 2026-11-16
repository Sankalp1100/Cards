// Made by `node tools/cinema.mjs` from js/cinema/story-*.js: do not edit (edit the films, then run it again).

// ---------- js/cinema/story-balloonride.js ----------
try {
// Balloon Ride: a kids' birthday film. Dawn over a pastel sky: a candy-striped hot-air balloon rises through puffy
// clouds, the child's name inflates in glossy toy letters, the balloon drifts over a candy town with a toy train,
// each party moment gets its own carnival ticket, the cake's candles light one by one, then a balloon-arch garden
// and a night of fireworks with the thank you. Everything is drawn here (soft 3D: gradients, gloss, rim light).
Cinema.register((K => {
  const { W, H, TAU, rng, clamp, ease, ease3, lerp, mix, art, glow, rrect, clean, splitIcon, flame, bulbs, burst, confetti, sparks, camAt, camera } = K;
  const back = u => { u = clamp(u); const s = 1.9; return 1 + (s + 1) * (u - 1) ** 3 + s * (u - 1) ** 2; };
  const kOf = P => Math.min(1.25, Math.max(.5, P.k));
  const hiOf = P => P.opt.lang === 'hi';
  const CANDY = ['#ff5d8f', '#ffc93c', '#36c5d6', '#9b7bff', '#5fd38d', '#ff8a3d'];
  const SH = 3072; // the tall sky the camera climbs

  // ---- soft 3D helpers (used inside painted art) ----
  function puff(c, x, y, s, R, tint = '#d8d2f4') {
    c.fillStyle = 'rgba(120,110,190,.13)'; c.beginPath(); c.ellipse(x, y + s * .07, s * .52, s * .07, 0, 0, TAU); c.fill();
    const blobs = [];
    for (let i = 0; i < 11; i++) { const dx = (R() - .5) * s * .86, top = 1 - Math.abs(dx) / (s * .5); blobs.push([x + dx, y - s * .04 - top * s * (.1 + R() * .12), s * (.11 + R() * .09 + top * .05)]); }
    blobs.sort((a, b) => a[1] - b[1]);
    for (const [bx, by, r] of blobs) {
      const g = c.createRadialGradient(bx - r * .35, by - r * .45, r * .05, bx, by, r * 1.05);
      g.addColorStop(0, '#ffffff'); g.addColorStop(.55, '#fbf7ff'); g.addColorStop(1, tint);
      c.fillStyle = g; c.beginPath(); c.arc(bx, by, r, 0, TAU); c.fill();
    }
    const bg = c.createLinearGradient(0, y - s * .08, 0, y + s * .05); bg.addColorStop(0, 'rgba(255,255,255,0)'); bg.addColorStop(1, tint);
    c.fillStyle = bg; rrect(c, x - s * .46, y - s * .08, s * .92, s * .12, s * .06); c.fill();
  }
  function glossBall(c, x, y, rx, ry, col) {
    const g = c.createRadialGradient(x - rx * .35, y - ry * .4, rx * .05, x, y, Math.max(rx, ry) * 1.1);
    g.addColorStop(0, mix(col, '#ffffff', .65)); g.addColorStop(.35, col); g.addColorStop(1, mix(col, '#2a0838', .45));
    c.fillStyle = g; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU); c.fill();
    c.fillStyle = 'rgba(255,255,255,.75)'; c.beginPath(); c.ellipse(x - rx * .38, y - ry * .45, rx * .2, ry * .12, -.6, 0, TAU); c.fill();
  }
  function partyBalloon(c, x, y, r, col, tail = 1) {
    if (tail) { c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x, y + r * 1.2); c.bezierCurveTo(x + r * .3, y + r * 1.8, x - r * .3, y + r * 2.2, x + r * .1, y + r * 2.9); c.stroke(); }
    glossBall(c, x, y, r, r * 1.16, col);
    c.fillStyle = mix(col, '#000000', .2); c.beginPath(); c.moveTo(x, y + r * 1.1); c.lineTo(x + r * .14, y + r * 1.28); c.lineTo(x - r * .14, y + r * 1.28); c.fill();
  }
  // the hot-air balloon, centred on its envelope (0, 0); envelope width w
  function airBalloonArt(k) {
    return art('br-balloon', 560, 900, k, c => {
      c.translate(280, 380);
      const w = 460, h = 560, top = -h * .5;
      const env = () => { c.beginPath(); c.moveTo(0, top); c.bezierCurveTo(w * .64, top, w * .6, h * .06, w * .13, h * .4); c.lineTo(-w * .13, h * .4); c.bezierCurveTo(-w * .6, h * .06, -w * .64, top, 0, top); c.closePath(); };
      // ropes and basket
      c.strokeStyle = '#7a5532'; c.lineWidth = 3;
      for (const [a, b] of [[-w * .13, -54], [-w * .05, -22], [w * .05, 22], [w * .13, 54]]) { c.beginPath(); c.moveTo(a, h * .4); c.lineTo(b, h * .6); c.stroke(); }
      const bx = -70, by = h * .6, bw = 140, bh = 96;
      const bg = c.createLinearGradient(bx, 0, bx + bw, 0); bg.addColorStop(0, '#8a5a2e'); bg.addColorStop(.35, '#d39a5c'); bg.addColorStop(1, '#6e4320');
      c.fillStyle = bg; c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + bw, by); c.lineTo(bx + bw - 12, by + bh); c.quadraticCurveTo(0, by + bh + 10, bx + 12, by + bh); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(70,40,15,.45)'; c.lineWidth = 2;
      for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(bx + 4, by + i * bh / 6); c.lineTo(bx + bw - 4, by + i * bh / 6); c.stroke(); }
      for (let i = 1; i < 9; i++) { c.beginPath(); c.moveTo(bx + i * bw / 9, by); c.lineTo(bx + i * bw / 9 - (i - 4.5) * 1.5, by + bh); c.stroke(); }
      c.fillStyle = '#5a3418'; rrect(c, bx - 8, by - 10, bw + 16, 20, 10); c.fill(); c.fillStyle = 'rgba(255,220,170,.4)'; c.fillRect(bx, by - 8, bw, 4);
      // a gift and a pennant peeking out of the basket
      c.fillStyle = '#ff5d8f'; c.fillRect(bx + 18, by - 46, 50, 40); c.fillStyle = '#ffd23f'; c.fillRect(bx + 38, by - 46, 10, 40); c.fillRect(bx + 18, by - 32, 50, 8);
      c.beginPath(); c.ellipse(bx + 34, by - 52, 12, 7, .5, 0, TAU); c.ellipse(bx + 52, by - 52, 12, 7, -.5, 0, TAU); c.fill();
      c.strokeStyle = '#6e4320'; c.lineWidth = 3; c.beginPath(); c.moveTo(bx + 110, by - 4); c.lineTo(bx + 112, by - 90); c.stroke();
      c.fillStyle = '#36c5d6'; c.beginPath(); c.moveTo(bx + 112, by - 90); c.lineTo(bx + 160, by - 76); c.lineTo(bx + 112, by - 62); c.fill();
      // the envelope: candy gores, a scalloped belt, light and shade
      c.save(); env(); c.clip();
      const gores = 12, cols = ['#ff5d8f', '#fff3e0', '#36c5d6', '#ffc93c', '#fff3e0', '#9b7bff'];
      const mer = th => [Math.sin(th) * w * .56, Math.sin(th) * w * .13];
      for (let i = 0; i < gores; i++) {
        const a0 = -Math.PI / 2 + i * Math.PI / gores, a1 = a0 + Math.PI / gores, [m0, n0] = mer(a0), [m1, n1] = mer(a1);
        c.fillStyle = cols[i % cols.length]; c.beginPath(); c.moveTo(0, top - 10);
        c.bezierCurveTo(m0 * 1.12, top, m0 * 1.06, h * .06, n0, h * .42); c.lineTo(n1, h * .42); c.bezierCurveTo(m1 * 1.06, h * .06, m1 * 1.12, top, 0, top - 10); c.closePath(); c.fill();
      }
      c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(0, top + 30, 70, 40, 0, 0, TAU); c.fill();
      const by0 = h * .14; c.fillStyle = '#f2b632'; c.fillRect(-w, by0 - 16, w * 2, 32);
      c.fillStyle = '#ff5d8f'; for (let x = -w * .6; x < w * .6; x += 34) { c.beginPath(); c.arc(x + 17, by0 + 16, 17, 0, Math.PI); c.fill(); }
      c.fillStyle = '#fff6d8'; for (let x = -w * .6; x < w * .6; x += 34) { c.beginPath(); c.arc(x + 17, by0, 4, 0, TAU); c.fill(); }
      const sh = c.createRadialGradient(-w * .22, -h * .24, 10, 0, 0, w * .78);
      sh.addColorStop(0, 'rgba(255,255,255,.55)'); sh.addColorStop(.3, 'rgba(255,255,255,.08)'); sh.addColorStop(.62, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(50,10,70,.5)');
      c.fillStyle = sh; c.fillRect(-w, -h, w * 2, h * 2);
      const rim = c.createLinearGradient(w * .2, 0, w * .56, 0); rim.addColorStop(0, 'rgba(255,200,150,0)'); rim.addColorStop(1, 'rgba(255,210,160,.35)'); c.fillStyle = rim; c.fillRect(0, -h, w, h * 2);
      c.restore();
      c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.ellipse(-w * .25, -h * .26, 34, 70, .45, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.ellipse(-w * .3, -h * .34, 10, 18, .45, 0, TAU); c.fill();
      c.fillStyle = '#4a3a52'; rrect(c, -w * .13, h * .4 - 6, w * .26, 16, 6); c.fill();
    });
  }
  const BAL = { ox: 280, oy: 380, w: 560, h: 900 };
  function drawAirBalloon(c, k, x, y, s, t, rot = 0) {
    c.save(); c.translate(x, y); c.rotate(rot + Math.sin(t * .9) * .02); c.scale(s, s);
    flame(c, 0, 560 * .4 + 48, 40 + Math.sin(t * 7) * 6, t, 3);
    c.drawImage(airBalloonArt(k), -BAL.ox, -BAL.oy, BAL.w, BAL.h);
    c.restore();
  }

  // ---- the sky: dawn, layered clouds ----
  function skyArt(k) {
    return art('br-sky', W, SH, k, c => {
      const g = c.createLinearGradient(0, 0, 0, SH);
      [[0, '#5fb6ef'], [.35, '#9fd5f8'], [.62, '#d8ecfb'], [.8, '#ffd9e8'], [1, '#ffe2bf']].forEach(([o, col]) => g.addColorStop(o, col));
      c.fillStyle = g; c.fillRect(0, 0, W, SH);
      glow(c, 760, SH - 900, 900, 'rgba(255,240,205,.75)');
      glow(c, 760, SH - 900, 240, 'rgba(255,252,236,.95)');
      const R = rng(12);
      for (let i = 0; i < 14; i++) puff(c, R() * W, 200 + R() * (SH - 600), 220 + R() * 260, R, i % 2 ? '#d9d6f6' : '#f6d6e6');
    });
  }
  function cloudLayer(k, seed, n, big) {
    return art(`br-clouds${seed}`, W, SH, k, c => {
      const R = rng(seed);
      for (let i = 0; i < n; i++) puff(c, (i % 2 ? .78 : .2) * W + (R() - .5) * 360, 300 + i * (SH - 500) / n + R() * 120, big * (.8 + R() * .5), R, i % 3 ? '#d6d0f2' : '#f5d2e2');
    });
  }

  // ---- the candy town (a wide panorama the balloon drifts over) ----
  const TW = 2600, TH = 1060;
  function townArt(k) {
    return art('br-town', TW, TH, k, c => {
      const R = rng(808);
      const hill = (y0, amp, col, hi, seed) => {
        c.beginPath(); c.moveTo(0, TH);
        for (let x = 0; x <= TW; x += 40) c.lineTo(x, y0 - Math.sin(x / 260 + seed) * amp - Math.sin(x / 97 + seed * 2) * amp * .25);
        c.lineTo(TW, TH); c.closePath();
        const g = c.createLinearGradient(0, y0 - amp, 0, TH); g.addColorStop(0, hi); g.addColorStop(.25, col); g.addColorStop(1, mix(col, '#40206a', .25)); c.fillStyle = g; c.fill();
      };
      hill(260, 70, '#c3b2f2', '#e6dcff', 1);
      // far castle of toy blocks
      const tower = (x, y, w, h, col, roof) => {
        const g = c.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, mix(col, '#ffffff', .35)); g.addColorStop(.5, col); g.addColorStop(1, mix(col, '#2a0838', .3));
        c.fillStyle = g; c.fillRect(x, y - h, w, h);
        c.fillStyle = mix(col, '#ffffff', .25); for (let i = 0; i < w; i += w / 4) c.fillRect(x + i, y - h - 18, w / 8, 18);
        if (roof) { const rg = c.createLinearGradient(x, 0, x + w, 0); rg.addColorStop(0, mix(roof, '#ffffff', .4)); rg.addColorStop(1, mix(roof, '#2a0838', .3)); c.fillStyle = rg;
          c.beginPath(); c.moveTo(x - 10, y - h); c.lineTo(x + w / 2, y - h - w * 1.3); c.lineTo(x + w + 10, y - h); c.fill();
          c.strokeStyle = '#7a5a8a'; c.lineWidth = 3; c.beginPath(); c.moveTo(x + w / 2, y - h - w * 1.3); c.lineTo(x + w / 2, y - h - w * 1.3 - 50); c.stroke();
          c.fillStyle = CANDY[Math.floor(R() * 6)]; c.beginPath(); c.moveTo(x + w / 2, y - h - w * 1.3 - 50); c.lineTo(x + w / 2 + 40, y - h - w * 1.3 - 38); c.lineTo(x + w / 2, y - h - w * 1.3 - 26); c.fill(); }
        c.fillStyle = 'rgba(255,240,180,.9)'; rrect(c, x + w * .32, y - h * .62, w * .36, h * .22, w * .18); c.fill();
      };
      const cx0 = 1500;
      tower(cx0 - 260, 330, 110, 230, '#ffb3c7', '#9b7bff'); tower(cx0 + 150, 330, 110, 230, '#a8e6f0', '#ff5d8f');
      tower(cx0 - 140, 340, 280, 190, '#ffe08a', null); tower(cx0 - 60, 160, 120, 140, '#c8b5ff', '#ffc93c');
      c.fillStyle = '#7a4a9a'; rrect(c, cx0 - 40, 260, 80, 80, 40); c.fill();
      hill(420, 60, '#8fdcbf', '#c9f5e3', 4);
      // candy houses
      const house = (x, y, w, h, wall, roof) => {
        c.fillStyle = 'rgba(40,40,90,.15)'; c.beginPath(); c.ellipse(x + w / 2, y + 6, w * .62, 14, 0, 0, TAU); c.fill();
        const g = c.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, mix(wall, '#ffffff', .4)); g.addColorStop(.55, wall); g.addColorStop(1, mix(wall, '#3a1050', .25));
        c.fillStyle = g; rrect(c, x, y - h, w, h, 14); c.fill();
        const rg = c.createLinearGradient(0, y - h - w * .7, 0, y - h); rg.addColorStop(0, mix(roof, '#ffffff', .35)); rg.addColorStop(1, mix(roof, '#3a1050', .2));
        c.fillStyle = rg; c.beginPath(); c.moveTo(x - 22, y - h + 6); c.quadraticCurveTo(x + w / 2, y - h - w * .95, x + w + 22, y - h + 6); c.closePath(); c.fill();
        c.fillStyle = '#fffaf2'; c.beginPath(); c.moveTo(x - 22, y - h + 6);
        for (let i = 0; i <= 8; i++) { const xx = x - 22 + i * (w + 44) / 8; c.quadraticCurveTo(xx - (w + 44) / 16, y - h + 30 + (i % 2) * 16, xx, y - h + 6); }
        c.lineTo(x - 22, y - h + 6); c.fill();
        c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(x + w * .3, y - h - w * .25, w * .12, 8, -.5, 0, TAU); c.fill();
        c.fillStyle = '#ffe9a8'; for (const wx of [.18, .62]) { rrect(c, x + w * wx, y - h * .7, w * .2, w * .2, w * .1); c.fill(); }
        c.fillStyle = mix(wall, '#3a1050', .45); rrect(c, x + w * .4, y - h * .38, w * .2, h * .38, w * .1); c.fill();
        c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(x + w * .55, y - h * .18, 4, 0, TAU); c.fill();
      };
      const lolly = (x, y, r, a, b) => {
        c.fillStyle = '#fff4ea'; c.fillRect(x - 5, y - r * 2.6, 10, r * 2.6);
        c.save(); c.translate(x, y - r * 2.6); glossBall(c, 0, 0, r, r, a);
        c.strokeStyle = b; c.lineWidth = r * .16; c.beginPath(); for (let i = 0; i < 60; i++) { const u = i / 60, ang = u * TAU * 2.6, rr = u * r * .88; i ? c.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr) : c.moveTo(0, 0); } c.stroke();
        c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.ellipse(-r * .4, -r * .45, r * .22, r * .12, -.6, 0, TAU); c.fill(); c.restore();
      };
      const gum = (x, y, r, col) => { glossBall(c, x, y, r, r * .8, col); c.fillStyle = 'rgba(255,255,255,.8)'; for (let i = 0; i < 6; i++) c.fillRect(x + (R() - .5) * r, y + (R() - .7) * r * .6, 3, 3); };
      for (let i = 0; i < 9; i++) house(80 + i * 290 + R() * 40, 560 + R() * 30, 150 + R() * 40, 140 + R() * 50, ['#ffd1dc', '#c9f0ff', '#fff0b3', '#e1d4ff', '#c8f5d9'][i % 5], CANDY[(i * 2) % 6]);
      for (let i = 0; i < 12; i++) lolly(30 + i * 225 + R() * 60, 590 + R() * 20, 34 + R() * 14, CANDY[i % 6], '#ffffff');
      hill(660, 40, '#ffc2d8', '#ffe6ef', 8);
      for (let i = 0; i < 26; i++) gum(R() * TW, 690 + R() * 60, 26 + R() * 18, CANDY[i % 6]);
      // the toy train's track
      c.fillStyle = '#c99a6a'; for (let x = 0; x < TW; x += 46) c.fillRect(x, 838, 26, 30);
      c.fillStyle = '#9a9ab0'; c.fillRect(0, 842, TW, 7); c.fillRect(0, 860, TW, 7);
      hill(930, 30, '#8fdcbf', '#bff2dc', 2);
      for (let i = 0; i < 30; i++) { const x = R() * TW, y = 960 + R() * 80; K.blossom(c, x, y, 16 + R() * 8, CANDY[i % 6], '#fff', R() * 6); }
    });
  }
  function train(c, x, y, t) {
    const car = (cx, col, engine) => {
      c.fillStyle = 'rgba(40,30,80,.2)'; c.beginPath(); c.ellipse(cx, y + 6, 70, 10, 0, 0, TAU); c.fill();
      const g = c.createLinearGradient(0, y - 90, 0, y); g.addColorStop(0, mix(col, '#ffffff', .45)); g.addColorStop(1, mix(col, '#3a1050', .2));
      c.fillStyle = g; rrect(c, cx - 62, y - 70, 124, 56, 14); c.fill();
      if (engine) { rrect(c, cx - 10, y - 120, 66, 56, 12); c.fill(); c.fillStyle = '#3a3050'; c.fillRect(cx - 50, y - 108, 22, 40); c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(cx + 66, y - 42, 10, 0, TAU); c.fill(); }
      else { c.fillStyle = CANDY[(Math.round(cx) / 7 | 0) % 6]; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(cx - 34 + i * 34, y - 76, 16, Math.PI, 0); c.fill(); } }
      for (const wx of [-36, 36]) { c.fillStyle = '#3a3050'; c.beginPath(); c.arc(cx + wx, y - 8, 17, 0, TAU); c.fill(); c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(cx + wx, y - 8, 7, 0, TAU); c.fill();
        c.strokeStyle = '#ffd23f'; c.lineWidth = 3; const a = -t * 6; c.beginPath(); c.moveTo(cx + wx + Math.cos(a) * 14, y - 8 + Math.sin(a) * 14); c.lineTo(cx + wx - Math.cos(a) * 14, y - 8 - Math.sin(a) * 14); c.stroke(); }
    };
    car(x, '#ff5d8f', true); car(x - 150, '#36c5d6'); car(x - 300, '#ffc93c'); car(x - 450, '#9b7bff');
    for (let i = 0; i < 4; i++) { const u = ((t * .8 + i / 4) % 1); c.fillStyle = `rgba(255,255,255,${(.8 * (1 - u)).toFixed(2)})`; c.beginPath(); c.arc(x - 40 - u * 120, y - 140 - u * 110, 16 + u * 30, 0, TAU); c.fill(); }
  }

  // where the scene's words sit (the player's own layout), so a panel can hug them
  function textBox(P, s) {
    try { const T = P.sceneText(s, P.shotLook(s.reel), 'center', P.pic(s)), h = T.M.reduce((a, m, i) => a + m.h + (i < T.M.length - 1 ? m.gap : 0), 0); return { y: T.y0, h }; }
    catch (e) { return { y: s.zone[0], h: s.zone[1] - s.zone[0] }; }
  }
  // ---- a glossy cream panel for words ----
  function panel(c, x, y, w, h, a, accent = '#ff5d8f') {
    if (a <= 0) return;
    c.save(); c.globalAlpha = a;
    c.fillStyle = 'rgba(70,30,110,.18)'; rrect(c, x + 10, y + 22, w, h, 56); c.fill();
    c.fillStyle = accent; rrect(c, x - 10, y - 10, w + 20, h + 20, 64); c.fill();
    const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#fffdf8'); g.addColorStop(1, '#fff1f6');
    c.fillStyle = g; rrect(c, x, y, w, h, 54); c.fill();
    c.strokeStyle = mix(accent, '#ffffff', .45); c.lineWidth = 4; c.setLineDash([16, 14]); rrect(c, x + 22, y + 22, w - 44, h - 44, 38); c.stroke(); c.setLineDash([]);
    c.fillStyle = 'rgba(255,255,255,.55)'; rrect(c, x - 2, y - 4, w * .5, 12, 6); c.fill();
    c.restore();
  }

  // ---- the cake ----
  function roomArt(k) {
    return art('br-room', W, H, k, c => {
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#ffd6e6'); g.addColorStop(.55, '#ffe9d6'); g.addColorStop(1, '#f7c7da'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      const R = rng(41);
      for (let i = 0; i < 60; i++) { const x = R() * W, y = R() * 1000, r = 30 + R() * 60; c.globalAlpha = .18 + R() * .25; glossBall(c, x, y, r, r * 1.15, CANDY[i % 6]); }
      c.globalAlpha = 1;
      glow(c, 540, 820, 700, 'rgba(255,248,230,.85)');
      // the table and its cloth
      c.fillStyle = '#f9e4ee'; c.beginPath(); c.ellipse(540, 1370, 640, 150, 0, 0, TAU); c.fill();
      const cl = c.createLinearGradient(0, 1370, 0, H); cl.addColorStop(0, '#ffb3cb'); cl.addColorStop(1, '#e77fa4'); c.fillStyle = cl;
      c.fillRect(-100, 1370, W + 200, H - 1370);
      for (let x = -60; x <= W + 60; x += 120) { const fg = c.createLinearGradient(x - 60, 0, x + 60, 0); fg.addColorStop(0, 'rgba(150,30,80,.18)'); fg.addColorStop(.5, 'rgba(255,255,255,.22)'); fg.addColorStop(1, 'rgba(150,30,80,.18)'); c.fillStyle = fg; c.fillRect(x - 60, 1400, 120, H - 1400); }
      c.fillStyle = '#fff4f8'; c.beginPath(); c.moveTo(-100, 1400); for (let x = -100; x <= W + 100; x += 80) c.quadraticCurveTo(x + 40, 1470, x + 80, 1400); c.lineTo(W + 100, 1380); c.lineTo(-100, 1380); c.fill();
      const tg = c.createRadialGradient(540, 1340, 50, 540, 1370, 640); tg.addColorStop(0, '#fff8fb'); tg.addColorStop(1, '#f3cfe0'); c.fillStyle = tg; c.beginPath(); c.ellipse(540, 1360, 620, 140, 0, 0, TAU); c.fill();
      // the stand and cake
      c.fillStyle = 'rgba(120,40,80,.18)'; c.beginPath(); c.ellipse(540, 1380, 380, 60, 0, 0, TAU); c.fill();
      const st = c.createLinearGradient(160, 0, 920, 0); st.addColorStop(0, '#d9d9e6'); st.addColorStop(.35, '#ffffff'); st.addColorStop(1, '#a9a9bd');
      c.fillStyle = st; c.beginPath(); c.ellipse(540, 1330, 360, 50, 0, 0, TAU); c.fill(); c.fillRect(500, 1330, 80, 40); c.beginPath(); c.ellipse(540, 1372, 140, 24, 0, 0, TAU); c.fill();
      const tier = (y, w, h, col, drip, dec) => {
        const g2 = c.createLinearGradient(540 - w, 0, 540 + w, 0); g2.addColorStop(0, mix(col, '#7a2050', .22)); g2.addColorStop(.3, mix(col, '#ffffff', .35)); g2.addColorStop(.6, col); g2.addColorStop(1, mix(col, '#5a1040', .35));
        c.fillStyle = g2; c.fillRect(540 - w, y - h, w * 2, h); c.beginPath(); c.ellipse(540, y, w, w * .14, 0, 0, Math.PI); c.fill();
        c.fillStyle = mix(col, '#ffffff', .45); c.beginPath(); c.ellipse(540, y - h, w, w * .14, 0, 0, TAU); c.fill();
        c.fillStyle = drip; c.beginPath(); c.ellipse(540, y - h, w, w * .14, 0, 0, TAU); c.fill();
        c.beginPath(); c.moveTo(540 - w, y - h);
        for (let i = 0; i <= 14; i++) { const x = 540 - w + i * w / 7, dd = (i % 3 === 1 ? .62 : i % 2 ? .4 : .22) * h; c.lineTo(x, y - h + w * .1 * Math.sin(Math.PI * i / 14) + dd); c.arc(x, y - h + w * .1 * Math.sin(Math.PI * i / 14) + dd, 7, 0, Math.PI); }
        c.lineTo(540 + w, y - h); c.closePath(); c.fill();
        c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.ellipse(540 - w * .55, y - h * .45, w * .05, h * .25, 0, 0, TAU); c.fill();
        dec(y, w, h);
      };
      const pearls = (y, w) => { for (let i = 0; i <= 22; i++) { const a = Math.PI * i / 22, x = 540 - Math.cos(a) * w, yy = y + Math.sin(a) * w * .14; glossBall(c, x, yy - 4, 9, 9, '#fff4d6'); } };
      tier(1320, 300, 190, '#ffd1df', '#fff8fc', (y, w) => { pearls(y, w); for (let i = 0; i < 7; i++) { const x = 540 - w * .78 + i * w * .26; glossBall(c, x, y - 70, 22, 22, CANDY[i % 6]); } });
      tier(1135, 220, 170, '#bfeef6', '#ffffff', (y, w) => { pearls(y, w); for (let i = 0; i < 40; i++) { c.fillStyle = CANDY[i % 6]; c.save(); c.translate(540 - w * .9 + R() * w * 1.8, y - 130 + R() * 110); c.rotate(R() * 3); rrect(c, -9, -3, 18, 6, 3); c.fill(); c.restore(); } });
      tier(970, 150, 150, '#fff0b8', '#ff8fb1', (y, w) => { pearls(y, w); for (let i = 0; i < 5; i++) { c.fillStyle = '#ff5d8f'; const x = 540 - w * .7 + i * w * .35; c.beginPath(); c.moveTo(x, y - 90); for (let j = 0; j < 10; j++) { const a = j * TAU / 10 - Math.PI / 2, r = j % 2 ? 9 : 22; c.lineTo(x + Math.cos(a) * r, y - 70 + Math.sin(a) * r); } c.fill(); } });
    });
  }
  const CAKE_TOP = { y: 820, w: 150 };

  // ---- dusk garden with a balloon arch ----
  function gardenArt(k) {
    return art('br-garden', W, H, k, c => {
      const g = c.createLinearGradient(0, 0, 0, H); [[0, '#3b2a78'], [.4, '#8a5bb8'], [.68, '#ff9fb8'], [1, '#ffd29a']].forEach(([o, col]) => g.addColorStop(o, col)); c.fillStyle = g; c.fillRect(0, 0, W, H);
      const R = rng(7);
      for (let i = 0; i < 90; i++) { c.fillStyle = `rgba(255,255,255,${(.3 + R() * .6).toFixed(2)})`; c.beginPath(); c.arc(R() * W, R() * 700, 1 + R() * 2.4, 0, TAU); c.fill(); }
      for (let i = 0; i < 6; i++) puff(c, R() * W, 900 + R() * 400, 260 + R() * 160, R, '#e9b6d6');
      // lawn
      const lg = c.createLinearGradient(0, 1480, 0, H); lg.addColorStop(0, '#6fcf97'); lg.addColorStop(1, '#2f8f63'); c.fillStyle = lg;
      c.beginPath(); c.moveTo(0, 1500); c.quadraticCurveTo(540, 1420, W, 1500); c.lineTo(W, H); c.lineTo(0, H); c.fill();
      // the balloon arch: clusters along a big arc
      const pts = [];
      for (let i = 0; i <= 46; i++) { const a = Math.PI + i / 46 * Math.PI; pts.push([540 + Math.cos(a) * 470, 1560 + Math.sin(a) * 1180]); }
      pts.forEach(([x, y], i) => { for (let j = 0; j < 3; j++) { const r = 44 + R() * 26; glossBall(c, x + (R() - .5) * 90, y + (R() - .5) * 70, r, r * 1.08, CANDY[(i + j * 2) % 6]); } });
      pts.forEach(([x, y], i) => { if (i % 3 === 0) glossBall(c, x + (R() - .5) * 60, y + (R() - .5) * 60, 22, 22, '#fff4d6'); });
      for (let i = 0; i < 40; i++) K.blossom(c, R() * W, 1560 + R() * 340, 14 + R() * 10, CANDY[i % 6], '#fff', R() * 6);
    });
  }
  // ---- night of fireworks ----
  function nightArt(k) {
    return art('br-night', W, H, k, c => {
      const g = c.createLinearGradient(0, 0, 0, H); [[0, '#0d1240'], [.6, '#2b2370'], [1, '#6b3c8f']].forEach(([o, col]) => g.addColorStop(o, col)); c.fillStyle = g; c.fillRect(0, 0, W, H);
      const R = rng(99);
      for (let i = 0; i < 220; i++) { c.fillStyle = `rgba(255,255,255,${(.2 + R() * .8).toFixed(2)})`; c.beginPath(); c.arc(R() * W, R() * H * .8, .8 + R() * 2.2, 0, TAU); c.fill(); }
      glow(c, 840, 300, 420, 'rgba(255,240,200,.35)');
      const mg = c.createRadialGradient(800, 270, 10, 840, 300, 130); mg.addColorStop(0, '#fffbe8'); mg.addColorStop(1, '#f2dca0'); c.fillStyle = mg; c.beginPath(); c.arc(840, 300, 130, 0, TAU); c.fill();
      c.fillStyle = 'rgba(200,170,110,.35)'; for (const [x, y, r] of [[800, 260, 22], [880, 330, 16], [830, 360, 12]]) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
      for (let i = 0; i < 5; i++) puff(c, R() * W, 1500 + R() * 300, 300 + R() * 200, R, '#6b5aa8');
      c.globalAlpha = .9; c.fillStyle = '#1a1446';
      c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W; x += 60) c.lineTo(x, 1700 + Math.sin(x / 140) * 40 - (x % 180 < 60 ? 80 : 0)); c.lineTo(W, H); c.fill(); c.globalAlpha = 1;
      c.fillStyle = 'rgba(255,220,140,.9)'; for (let i = 0; i < 40; i++) c.fillRect(R() * W, 1720 + R() * 160, 6, 8);
    });
  }
  function fireworks(c, t, seed, n = 4) {
    const R = rng(seed);
    for (let i = 0; i < n; i++) {
      const per = 1.6 + R() * .8, off = R() * per, x = 160 + R() * 760, y = 260 + R() * 600, col = ['255,93,143', '255,201,60', '54,197,214', '155,123,255', '255,255,255'][i % 5];
      const p = ((t + off) % per) / per;
      if (p < .2) { c.fillStyle = `rgba(${col},.9)`; c.beginPath(); c.arc(x, y + (1 - p / .2) * 500, 5, 0, TAU); c.fill(); }
      else { const q = (p - .2) / .8, d = ease(q) * 260, fall = q * q * 60, a = (1 - q);
        if (q < .25) glow(c, x, y, 220, `rgba(${col},${(.5 * (1 - q / .25)).toFixed(2)})`);
        c.strokeStyle = `rgba(${col},${a.toFixed(2)})`; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath();
        for (let j = 0; j < 32; j++) { const an = j / 32 * TAU + i; c.moveTo(x + Math.cos(an) * d * .62, y + Math.sin(an) * d * .62 + fall); c.lineTo(x + Math.cos(an) * d, y + Math.sin(an) * d + fall); }
        c.stroke(); c.fillStyle = `rgba(255,255,240,${a.toFixed(2)})`;
        for (let j = 0; j < 16; j++) { const an = j / 16 * TAU + i + .1; c.beginPath(); c.arc(x + Math.cos(an) * d * 1.08, y + Math.sin(an) * d * 1.08 + fall * 1.2, 4, 0, TAU); c.fill(); } }
    }
  }

  // the words' palette (playful fonts, candy colours)
  const pal = {};
  const look = (kind, K2) => {
    const night = kind === 'night', dusk = kind === 'garden';
    return pal[kind] || (pal[kind] = K2.palette('clouds-champagne', { font: { script: 'Pacifico', serif: 'Fredoka' },
      col: night ? { names: '#ff5d8f', ink: '#3a2a5c', ink2: '#5b4a7a', accent: '#ff7a2f', gold: '#f2b632' }
        : dusk ? { names: '#e8457c', ink: '#3a2a5c', ink2: '#5b4a7a', accent: '#8a4fd8', gold: '#f2b632' }
          : { names: '#e8457c', ink: '#3a2a5c', ink2: '#5b4a7a', accent: '#f0782a', gold: '#f2b632' },
      shadow: ['rgba(255,255,255,.85)', 6] }));
  };

  // puffy toy letters (drawn live; a name of any length fits)
  function puffyText(c, text, cx, y, maxW, z0, pt, t, start) {
    const deva = /[ऀ-ॿ]/.test(text), fam = deva ? '700 Z "Amita"' : '600 Z "Fredoka"';
    let z = z0; c.font = fam.replace('Z', z + 'px');
    const chars = deva ? [text] : [...text];
    const width = () => chars.reduce((a, ch) => a + c.measureText(ch).width, 0) + (chars.length - 1) * z * .02;
    while (width() > maxW && z > 60) { z *= .94; c.font = fam.replace('Z', z + 'px'); }
    let x = cx - width() / 2; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
    chars.forEach((ch, i) => {
      const wch = c.measureText(ch).width, u = (pt - start - i * .1) / .55, s = back(u);
      if (u <= 0 || ch === ' ') { x += wch + z * .02; return; }
      const col = CANDY[i % CANDY.length], bob = Math.sin(t * 2.2 + i * .8) * z * .025, lx = x + wch / 2, ly = y + bob;
      c.save(); c.translate(lx, ly - z * .35); c.scale(s, s); c.rotate(Math.sin(t * 1.6 + i) * .03); c.translate(-wch / 2, z * .35);
      c.lineJoin = 'round'; c.strokeStyle = '#ffffff'; c.lineWidth = z * .16; c.strokeText(ch, 0, 0);
      c.fillStyle = 'rgba(80,30,120,.25)'; c.fillText(ch, z * .05, z * .1);
      const dk = mix(col, '#3a0a50', .45);
      for (let d = 8; d >= 1; d--) { c.fillStyle = d > 6 ? mix(dk, '#000000', .15) : dk; c.fillText(ch, d * z * .006, d * z * .008); }
      const g = c.createLinearGradient(0, -z * .8, 0, z * .05); g.addColorStop(0, mix(col, '#ffffff', .55)); g.addColorStop(.5, col); g.addColorStop(1, mix(col, '#5a0a50', .25));
      c.fillStyle = g; c.fillText(ch, 0, 0);
      const hg = c.createLinearGradient(0, -z * .8, 0, -z * .3); hg.addColorStop(0, 'rgba(255,255,255,.75)'); hg.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = hg; c.fillText(ch, 0, 0);
      c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.ellipse(wch * .3, -z * .58, z * .035, z * .06, .5, 0, TAU); c.fill();
      c.restore();
      x += wch + z * .02;
    });
    return z;
  }
  const ageOf = card => { const m = /(\d{1,3})/.exec(`${clean(card.tagline)} ${clean(card.title)}`); return m ? +m[1] : 0; };

  return {
    id: 'story-balloonride', order: 20, occasion: 'birthday', tune: 'festive', thumb: 9.5,
    name: 'Balloon Ride', note: 'A candy-striped hot-air balloon rises at dawn, flies over a toy town to the cake and a night of fireworks',
    names: ['Aarohi', 'Vivaan'],
    looks: { open: 'clouds-champagne', title: 'clouds-champagne', invite: 'clouds-champagne', events: ['clouds-champagne'], date: 'clouds-champagne', end: 'clouds-champagne', final: 'clouds-champagne' },
    titles: [[/magic|jadu|जादू/i, 'Abracadabra!'], [/cake|केक/i, 'The Big Wish'], [/dinner|lunch|food|gift|खाना|भोज|उपहार/i, 'Treats & Surprises'],
      [/game|play|खेल/i, 'Let the Games Begin'], [/dance|dj|music|नाच|संगीत/i, 'Dance Party'], [/puja|pooja|हवन|पूजा/i, 'Blessings First']],
    look,
    timeline(S, K2, card, opt) {
      const hi = opt.lang === 'hi', at = k => S.findIndex(s => s.k === k);
      S.splice(at('open'), 1, { k: 'reel', reel: 'rise', name: 'Sunrise', d: 5.5 });
      Object.assign(S[at('title')], { reel: 'name', d: 6, cut: true, change: 'none' }); delete S[at('title')].couple; delete S[at('title')].zone;
      Object.assign(S[at('invite')], { reel: 'town', d: 7, change: 'none', board: false, zone: [250, 1000, 760] });
      let n = 0;
      S.forEach(s => {
        if (s.k !== 'event') return;
        Object.assign(s, { reel: 'ticket', datebar: true, board: false, zone: [470, 1290, 700], change: n % 2 ? 'iris' : 'wipe' }); delete s.couple; n++;
      });
      const cake = { k: 'reel', reel: 'cake', name: 'The Cake', d: 6, change: 'bloom',
        wish: [{ t: 'text', s: hi ? 'मन की मुराद माँगो!' : 'Make a wish!', f: hi ? 'hname' : 'script', z: 120, col: 'names' }] };
      const di = at('date');
      if (di >= 0) { S.splice(di, 0, cake); Object.assign(S[di + 1], { reel: 'garden', board: false, change: 'sparkle', zone: [560, 1420, 720] }); }
      else S.splice(at('end'), 0, cake);
      const ei = at('end'); if (ei >= 0) Object.assign(S[ei], { reel: 'garden', board: false, change: 'petals', zone: [560, 1420, 720], dusk: 1 });
      Object.assign(S[at('final')], { reel: 'night', board: false, change: 'iris', zone: [640, 1640, 680] });
      // fit one WhatsApp status: drop the regards, then trim
      let total = S.reduce((a, s) => a + s.d, 0);
      if (total > 59.5 && at('end') >= 0) { total -= S[at('end')].d; S.splice(at('end'), 1); }
      if (total > 59.5) { const f = (59.5 - (total - S.filter(s => s.k === 'event').reduce((a, s) => a + s.d, 0))) / S.filter(s => s.k === 'event').reduce((a, s) => a + s.d, 0); S.forEach(s => { if (s.k === 'event') s.d = Math.max(3.4, s.d * f); }); }
    },
    shots: {
      rise(c, s, pt, t, P) {
        const k = kOf(P), u = pt / s.d;
        const cy = lerp(SH - 1000, SH - 1500, ease3(u));
        c.save(); c.translate(0, -(cy - H / 2)); c.drawImage(skyArt(k), 0, 0, W, SH); c.restore();
        c.save(); c.translate(0, -(cy - H / 2) * 1.35 - 300); c.drawImage(cloudLayer(k, 3, 7, 420), 0, 0, W, SH); c.restore();
        // party balloons drifting up
        const R = rng(5);
        for (let i = 0; i < 9; i++) { const x = R() * W, sp = 120 + R() * 140, y = H + 200 - ((pt * sp + R() * 900) % (H + 500)); partyBalloon(c, x + Math.sin(t + i) * 30, y, 30 + R() * 24, CANDY[i % 6]); }
        const by = lerp(H + 40, 820, ease3(pt / (s.d * .95)));
        drawAirBalloon(c, k, 540 + Math.sin(t * .5) * 40, by, 1.05, t, -.04);
        c.save(); c.translate(0, -(cy - H / 2) * 1.9 - 1400); c.globalAlpha = .95; c.drawImage(cloudLayer(k, 9, 5, 620), 0, 0, W, SH); c.restore();
        sparks(c, t, 10, '#fff6d0', 4);
        if (pt < .8) { c.fillStyle = `rgba(255,248,236,${(1 - pt / .8).toFixed(2)})`; c.fillRect(0, 0, W, H); }
      },
      name(c, s, pt, t, P) {
        const k = kOf(P), card = P.card, hi = hiOf(P);
        const cy = SH - 1500 - pt * 60;
        c.save(); c.translate(0, -(cy - H / 2)); c.drawImage(skyArt(k), 0, 0, W, SH); c.restore();
        c.save(); c.translate(0, -(cy - H / 2) * 1.35 - 300); c.drawImage(cloudLayer(k, 3, 7, 420), 0, 0, W, SH); c.restore();
        // the balloon floats up and away, a ribbon of bunting trails under it
        const by = lerp(820, -560, ease3((pt - .2) / 2.4));
        if (by > -500) drawAirBalloon(c, k, 540 + Math.sin(t * .5) * 40, by, 1.05, t, -.04);
        const R = rng(31);
        for (let i = 0; i < 6; i++) partyBalloon(c, (i % 2 ? 860 : 220) + (R() - .5) * 160 + Math.sin(t * .9 + i) * 18, 1500 + i * 60 - ease3((pt - .5) / 2) * 120 + Math.sin(t * 1.3 + i) * 14, 46 + R() * 20, CANDY[(i + 2) % 6]);
        // label, puffy name, the age medallion and the tagline ribbon
        const la = ease((pt - 1.1) / .6);
        if (la > 0) { c.save(); c.globalAlpha = la; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = hi ? '52px "Tiro Devanagari Hindi"' : '48px "Fredoka"'; if (!hi) K.spacing(c, 8);
          c.fillStyle = '#5b3a9a'; c.fillText(hi ? 'जन्मदिन की पार्टी' : 'BIRTHDAY PARTY', 540, 520); K.spacing(c, 0); c.restore(); }
        const two = clean(card.host2), y1 = two ? 760 : 840;
        puffyText(c, clean(card.host1) || 'Birthday', 540, y1, 960, 290, pt, t, 1.2);
        if (two) puffyText(c, `& ${two}`, 540, y1 + 230, 900, 170, pt, t, 1.9);
        const age = ageOf(card), ma = back((pt - 2.4) / .7);
        if (ma > 0) {
          c.save(); c.translate(540, 1240); c.scale(ma, ma); c.rotate(Math.sin(t * 1.2) * .05);
          c.fillStyle = 'rgba(80,30,120,.22)'; c.beginPath(); c.arc(8, 16, 150, 0, TAU); c.fill();
          c.beginPath(); for (let j = 0; j < 24; j++) { const a = j * TAU / 24, r = j % 2 ? 132 : 158; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath();
          const sg = c.createRadialGradient(-40, -50, 10, 0, 0, 160); sg.addColorStop(0, '#fff3b0'); sg.addColorStop(.5, '#ffc93c'); sg.addColorStop(1, '#e08a12'); c.fillStyle = sg; c.fill();
          glossBall(c, 0, 0, 112, 112, '#ff5d8f');
          c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `600 ${age > 9 ? 120 : 150}px "Fredoka"`; c.lineWidth = 12; c.strokeStyle = '#ffffff'; c.lineJoin = 'round';
          const txt = age ? String(age) : '★'; c.strokeText(txt, 0, 8); c.fillStyle = '#7a1f8a'; c.fillText(txt, 4, 14); c.fillStyle = '#fff6d8'; c.fillText(txt, 0, 8);
          c.restore();
        }
        const ra = ease((pt - 2.2) / .5), tag = clean(card.tagline).replace(/^is\s+/i, '');
        if (ra > 0 && tag) {
          c.save(); c.globalAlpha = ra; c.translate(540, 1490);
          c.font = hi ? '50px "Tiro Devanagari Hindi"' : '54px "Fredoka"'; c.textAlign = 'center'; c.textBaseline = 'middle';
          const tw = Math.min(900, c.measureText(tag).width + 120);
          c.fillStyle = '#c23d6e'; for (const d of [-1, 1]) { c.beginPath(); c.moveTo(d * tw / 2, -40); c.lineTo(d * (tw / 2 + 80), -30); c.lineTo(d * (tw / 2 + 50), 6); c.lineTo(d * (tw / 2 + 80), 44); c.lineTo(d * tw / 2, 40); c.fill(); }
          const rg = c.createLinearGradient(0, -46, 0, 46); rg.addColorStop(0, '#ff8fb1'); rg.addColorStop(1, '#e8457c'); c.fillStyle = rg; rrect(c, -tw / 2, -46, tw, 92, 20); c.fill();
          c.fillStyle = 'rgba(255,255,255,.3)'; rrect(c, -tw / 2 + 10, -40, tw - 20, 18, 9); c.fill();
          c.fillStyle = '#ffffff'; c.fillText(tag, 0, 4, tw - 60); c.restore();
        }
        confetti(c, t, 26, CANDY, 77);
      },
      town(c, s, pt, t, P) {
        const k = kOf(P), u = pt / s.d;
        c.save(); c.translate(0, -(SH - 1900 - H / 2)); c.drawImage(skyArt(k), 0, 0, W, SH); c.restore();
        const tx = -lerp(200, 1300, ease3(u * .9 + .05)), ty = H - TH + 80 - (1 - ease3(pt / 1.6)) * 200;
        c.drawImage(townArt(k), tx, ty, TW, TH);
        train(c, tx + ((pt * 260 + 600) % (TW + 900)), ty + 840, t);
        drawAirBalloon(c, k, 900 + Math.sin(t * .6) * 20, 240 + Math.sin(t * .8) * 16, .5, t, .05);
        const R = rng(17);
        for (let i = 0; i < 4; i++) partyBalloon(c, 80 + i * 70 + Math.sin(t + i) * 10, 1060 + (i % 2) * 50 + Math.sin(t * 1.2 + i) * 10, 34, CANDY[i]);
        const b = textBox(P, s); panel(c, 540 - 430, b.y - 90, 860, b.h + 180, ease(pt / .5), '#36c5d6');
      },
      ticket(c, s, pt, t, P) {
        const theme = [['#ff7aa2', '#ffd1df', '#ff5d8f'], ['#36c5d6', '#c9f3f8', '#1fa6b8'], ['#9b7bff', '#e2d8ff', '#7b5ae0'], ['#ffc93c', '#fff1c2', '#e89d12'], ['#5fd38d', '#d6f6e2', '#2fb06a'], ['#ff8a3d', '#ffe0c9', '#e86a1a']][(s.i || 0) % 6];
        c.fillStyle = theme[1]; c.fillRect(0, 0, W, H);
        // carnival stripes turning slowly round the top of a tent
        c.save(); c.translate(540, -200); c.rotate(t * .06);
        c.fillStyle = theme[0]; for (let i = 0; i < 18; i++) { c.rotate(TAU / 18); c.beginPath(); c.moveTo(0, 0); c.lineTo(-180, 2600); c.lineTo(180, 2600); c.fill(); }
        c.restore();
        const vg = c.createRadialGradient(540, 900, 200, 540, 960, 1200); vg.addColorStop(0, 'rgba(255,255,255,.55)'); vg.addColorStop(1, 'rgba(60,20,90,.35)'); c.fillStyle = vg; c.fillRect(0, 0, W, H);
        bulbs(c, -40, W + 40, 120, 140, t, 16, ['#fff6c8', '#ffd23f', '#ffffff'], 3 + (s.i || 0));
        bulbs(c, -40, W + 40, 300, 90, t + 1, 14, ['#fff6c8', '#ff8fb1', '#ffffff'], 9);
        // the stage and balloon bunches
        const sg = c.createLinearGradient(0, 1500, 0, H); sg.addColorStop(0, theme[2]); sg.addColorStop(1, mix(theme[2], '#2a0838', .4)); c.fillStyle = sg; c.beginPath(); c.ellipse(540, 1760, 760, 260, 0, 0, TAU); c.fill();
        c.fillStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.ellipse(540, 1640, 600, 60, 0, 0, TAU); c.fill();
        for (const sx of [-1, 1]) for (let j = 0; j < 5; j++) partyBalloon(c, 540 + sx * (400 + (j % 2) * 70) + Math.sin(t * 1.1 + j) * 10, 1360 + j * 46 - (j % 3) * 60 + Math.sin(t + j) * 10, 50, CANDY[(j * 2 + (sx > 0 ? 1 : 0) + (s.i || 0)) % 6]);
        // the ticket
        const a = back(pt / .6), b = textBox(P, s), x = 540, w = 820, h = b.h + 330, y = b.y + b.h / 2 - 50;
        c.save(); c.translate(x, y); c.scale(a, a); c.rotate((1 - Math.min(1, a)) * .2 + Math.sin(t * .8) * .006);
        c.fillStyle = 'rgba(60,20,90,.22)'; rrect(c, -w / 2 + 12, -h / 2 + 24, w, h, 40); c.fill();
        c.fillStyle = '#fffaf2'; c.beginPath(); rrect(c, -w / 2, -h / 2, w, h, 40); c.fill();
        c.fillStyle = theme[1]; for (const d of [-1, 1]) { c.beginPath(); c.arc(d * w / 2, -h / 2 + 150, 34, 0, TAU); c.fill(); }
        c.strokeStyle = theme[0]; c.lineWidth = 4; c.setLineDash([14, 12]); c.beginPath(); c.moveTo(-w / 2 + 40, -h / 2 + 150); c.lineTo(w / 2 - 40, -h / 2 + 150); c.stroke(); rrect(c, -w / 2 + 22, -h / 2 + 22, w - 44, h - 44, 28); c.stroke(); c.setLineDash([]);
        const { icon } = splitIcon(s.e ? s.e.name : '');
        c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '600 46px "Fredoka"'; K.spacing(c, 10); c.fillStyle = theme[2];
        c.fillText(hiOf(P) ? 'प्रवेश पत्र' : `ADMIT ONE  ·  No. ${String((s.i || 0) + 1).padStart(2, '0')}`, 0, -h / 2 + 80); K.spacing(c, 0);
        c.restore();
        if (icon) { const ia = back((pt - .5) / .6); if (ia > 0) { c.save(); c.translate(540, 1640 + Math.sin(t * 2) * 10); c.scale(ia, ia); glossBall(c, 0, 0, 110, 110, '#ffffff'); c.font = '120px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(icon, 0, 8); c.restore(); } }
        confetti(c, t, 18, CANDY, 30 + (s.i || 0));
      },
      cake(c, s, pt, t, P) {
        const k = kOf(P), card = P.card;
        const cam = camAt(pt, [[0, { x: 540, y: 1150, z: 1.25 }], [2.6, { x: 540, y: 1000, z: 1.02 }], [6, { x: 540, y: 980, z: 1 }]]);
        c.save(); camera(c, cam); c.drawImage(roomArt(k), 0, 0, W, H);
        const n = Math.max(1, Math.min(9, ageOf(card) || 5)), R = rng(3);
        for (let i = 0; i < n; i++) {
          const x = 540 + (n > 1 ? (i - (n - 1) / 2) / ((n - 1) / 2) : 0) * CAKE_TOP.w * .7, y = CAKE_TOP.y + 4 + Math.abs(x - 540) * .03;
          const cg = c.createLinearGradient(x - 9, 0, x + 9, 0); cg.addColorStop(0, CANDY[i % 6]); cg.addColorStop(.5, mix(CANDY[i % 6], '#ffffff', .5)); cg.addColorStop(1, mix(CANDY[i % 6], '#000000', .2));
          c.fillStyle = cg; rrect(c, x - 9, y - 110, 18, 110, 6); c.fill();
          c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 4; for (let j = 0; j < 4; j++) { c.beginPath(); c.moveTo(x - 9, y - 96 + j * 26); c.lineTo(x + 9, y - 84 + j * 26); c.stroke(); }
          const lit = 1.6 + i * (1.4 / n);
          if (pt > lit) flame(c, x, y - 112, 44 * ease((pt - lit) / .25), t, i * 3 + R());
        }
        if (pt > 1.6) glow(c, 540, CAKE_TOP.y - 160, 420, `rgba(255,214,140,${(.35 * ease((pt - 1.6) / 1.5)).toFixed(2)})`);
        // the spark that lights them
        const sp = (pt - 1.4) / 1.6;
        if (sp > 0 && sp < 1) { const x = 540 + (sp * 2 - 1) * CAKE_TOP.w * .75, y = CAKE_TOP.y - 150 - Math.sin(sp * Math.PI * n) * 20; glow(c, x, y, 70, 'rgba(255,240,180,.9)'); sparks(c, t, 0, '#fff', 1); }
        c.restore();
        if (pt > 3.6) { const p = (pt - 3.6) / 1.2; if (p < 1) { burst(c, 300, 600, p, '255,93,143', 30, 240); burst(c, 780, 520, p, '54,197,214', 30, 240); burst(c, 540, 380, p, '255,201,60', 36, 280); } confetti(c, t, 60, CANDY, 12); }
        K.words(c, P, s.wish, { zone: [230, 420, 900], L: look('cake', K), p: pt - 3.2, d: s.d, t });
        sparks(c, t, 12, '#fff6d0', 8);
      },
      garden(c, s, pt, t, P) {
        const k = kOf(P), z = 1.05 - .05 * ease3(pt / s.d);
        c.save(); c.translate(540, 960); c.scale(z, z); c.translate(-540, -960); c.drawImage(gardenArt(k), 0, 0, W, H); c.restore();
        bulbs(c, 60, 1020, 230, 90, t, 18, ['#fff6c8', '#ffd23f', '#ff8fb1'], s.dusk ? 21 : 12);
        const R = rng(s.dusk ? 8 : 2);
        for (let i = 0; i < 6; i++) { const y = H + 160 - ((pt * (100 + R() * 80) + R() * 900) % (H + 400)); partyBalloon(c, R() * W, y, 30 + R() * 16, CANDY[i % 6]); }
        const b = textBox(P, s); panel(c, 540 - 420, b.y - 100, 840, b.h + 200, ease(pt / .5), s.dusk ? '#9b7bff' : '#ff5d8f');
      },
      night(c, s, pt, t, P) {
        const k = kOf(P);
        c.drawImage(nightArt(k), 0, 0, W, H);
        fireworks(c, t, 21, 5);
        drawAirBalloon(c, k, 200 + pt * 30, 1400 - pt * 60 + Math.sin(t) * 10, .42, t, .06);
        const b = textBox(P, s); panel(c, 540 - 400, b.y - 90, 800, b.h + 180, ease(pt / .5), '#ff5d8f');
        sparks(c, t, 14, '#fff6d0', 13);
      }
    }
  };
})(Cinema.kit));

} catch (e) { if (typeof console !== 'undefined') console.warn('Cinema: story-balloonride.js', e); }

// ---------- js/cinema/story-crystalgala.js ----------
try {
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

} catch (e) { if (typeof console !== 'undefined') console.warn('Cinema: story-crystalgala.js', e); }

// ---------- js/cinema/story-folio.js ----------
try {
// The Golden Folio: a royal maroon-and-gold wedding booklet. Gold dust gathers into an Om, Shri Ganesh blesses the
// day, carved palace doors open on a velvet booklet; its pages turn in 3D: the invitation, each day of the
// celebrations on its own coloured page (a date medallion, function cards, the couple dressed for it), the whole
// schedule, the venue with a pin, the families and a bal manuhar; then the pages fan out for thank you.
Cinema.register((K => {
  const { W, H, TAU, rng, clamp, ease, ease3, lerp, mix, glow, rrect, leaf, marigold, mandala, diya, bell, cornerScroll, goldBevel, goldFill, gem,
    clean, splitIcon, days, dateRange, parents, coupleImage, ganeshaImage, cutout, pageTurn, dateMedallion, pin, petals, sparks, motes, rays, foil, HI, MONTHS, DAYS } = K;

  // ---------- lettering ----------
  const DEV = /[ऀ-ॿ]/;
  function fontFor(f, z, s) {
    if (DEV.test(s)) return f === 'script' ? `700 ${Math.round(z * .62)}px "Amita"` : f === 'display' ? `${Math.round(z * .82)}px "Yatra One"` : `${Math.round(z * .9)}px "Tiro Devanagari Hindi"`;
    return f === 'script' ? `${z}px "Great Vibes"` : f === 'caps' ? `${z}px "Cinzel"` : f === 'display' ? `700 ${z}px "Cinzel Decorative"` : f === 'ital' ? `italic ${z}px "Cormorant Garamond"` : `${z}px "Gilda Display"`;
  }
  let scratch = null;
  const mctx = () => (scratch = scratch || K.canvasOf(8, 8).getContext('2d'));
  function setFont(c, l, maxW) {
    let z = l.z;
    const ls = DEV.test(l.s) ? 0 : (l.ls || 0);
    for (let i = 0; i < 30; i++) {
      c.font = fontFor(l.f, z, l.s); K.spacing(c, ls * z / l.z);
      if (c.measureText(l.s).width <= maxW || z < 14) break;
      z *= .94;
    }
    return z;
  }
  // one line of words: gold foil, or ink; a = alpha, rise = pixels below its place
  function say(c, l, x, y, a = 1, t) {
    if (!l || !l.s || a <= .01) return;
    c.save(); c.globalAlpha *= a;
    const z = setFont(c, l, l.maxW || 760);
    if (l.gold) { const ls = DEV.test(l.s) ? 0 : (l.ls || 0) * z / l.z; foil(c, l.s, x, y, { font: c.font, dark: l.gold === 'dark', t, spacing: ls }); }
    else { c.textAlign = l.align || 'center'; c.textBaseline = 'middle'; c.fillStyle = l.col || '#4a1a20'; c.fillText(l.s, x, y); }
    K.spacing(c, 0); c.restore();
  }
  // words that wrap into lines no wider than maxW
  function wrap(s, l, maxW, max = 3) {
    const c = mctx(); c.font = fontFor(l.f, l.z, s); K.spacing(c, 0);
    const out = []; let cur = '';
    for (const w of String(s).split(/\s+/)) { const tryS = cur ? cur + ' ' + w : w; if (c.measureText(tryS).width > maxW && cur) { out.push(cur); cur = w; } else cur = tryS; }
    if (cur) out.push(cur);
    return out.slice(0, max);
  }
  // a column of lines laid out from y0: [{ s, f, z, col, gold, gap, wrap }] → [{ ...line, y }]
  function flow(specs, y0, maxW = 720) {
    const out = []; let y = y0;
    specs.filter(l => l && clean(l.s)).forEach(l => {
      const parts = l.wrap ? wrap(clean(l.s), l, maxW, l.wrap) : [clean(l.s)];
      parts.forEach((s, i) => { const h = l.z * (DEV.test(s) ? 1.32 : 1.18); out.push({ ...l, s, y: y + h / 2, maxW }); y += h + (i === parts.length - 1 ? (l.gap || 0) : 4); });
    });
    return out;
  }
  const HIFN = [[/haldi|pithi|ubtan/i, 'हल्दी'], [/mehe?n?d/i, 'मेहँदी'], [/sangeet/i, 'संगीत संध्या'], [/cocktail/i, 'कॉकटेल संध्या'], [/dj|dance/i, 'नृत्य संध्या'],
    [/phera|vivah|wedding|shaadi/i, 'पाणिग्रहण संस्कार'], [/varmala|jaimala/i, 'वरमाला'], [/baraat|barat/i, 'बारात'], [/ghud|ghod/i, 'घुड़चढ़ी'], [/reception/i, 'प्रीतिभोज'],
    [/dinner|bhoj/i, 'रात्रिभोज'], [/lunch/i, 'दोपहर भोज'], [/ring|engage|sagai/i, 'सगाई'], [/roka/i, 'रोका'], [/puja|pooja|ganesh/i, 'गणेश पूजन'], [/kirtan/i, 'कीर्तन'], [/tilak/i, 'तिलक']];
  const fnName = (n, hi) => (hi && !DEV.test(n) && (HIFN.find(([re]) => re.test(n)) || [])[1]) || n;
  const isMain = n => /phera|vivah|wedding|shaadi|varmala|jaimala|फेरे|विवाह|शादी/i.test(n);

  // ---------- palette ----------
  const MAROON = '#7a1426', DEEP = '#3d0710', CREAM = '#fbf3e2', INK = '#4a1a20', GOLD = '#b8862b';
  const MOODS = [
    [/haldi|pithi|ubtan|हल्दी/i, { a: '#f7c234', b: '#b86a04', med: '#b8560c', fx: 'haldi' }],
    [/mehe?n?d|मेहँदी|मेहंदी/i, { a: '#7fae4a', b: '#244d1c', med: '#2f6b2a', fx: 'mehendi' }],
    [/sangeet|cocktail|dj|dance|garba|dandiya|संगीत/i, { a: '#4b3c9a', b: '#100b33', med: '#33287a', fx: 'night' }],
    [/phera|vivah|wedding|shaadi|varmala|jaimala|mandap|फेरे|विवाह/i, { a: '#c41d34', b: '#4d0410', med: '#8a0f22', fx: 'mandap' }],
    [/reception|dinner|bhoj|swagat|स्वागत/i, { a: '#7a2c7e', b: '#22082a', med: '#5a1a60', fx: 'gala' }]];
  const moodOf = n => (MOODS.find(([re]) => re.test(n)) || [0, { a: '#a3253a', b: '#3d0710', med: MAROON, fx: 'mandap' }])[1];

  // ---------- still art ----------
  const kOf = P => Math.min(1.25, Math.max(.5, P.k)), kPage = P => Math.min(1, Math.max(.5, P.k));
  // the dark table the booklet lies on: maroon velvet, a faint paisley, a gold border
  const table = k => K.velvet(k, '#5a0c18');
  // a marigold garland in swags with mango leaves and little bells (W × 300)
  function toranArt(k) {
    return K.art('folio-toran', W, 300, k, c => {
      const R = rng(41);
      for (let i = 0; i < 26; i++) leaf(c, i * 43 + 10, 18 + (i % 2) * 8, 70, 22, Math.PI / 2 + (R() - .5) * .5, i % 2 ? '#2e6b2a' : '#3f8a34');
      const sw = 5, wd = W / sw;
      for (let j = 0; j < sw; j++) for (let i = 0; i <= 22; i++) {
        const u = i / 22, x = j * wd + u * wd, y = 22 + Math.sin(u * Math.PI) * 120;
        marigold(c, x, y, 17, i % 3 === 1 ? 46 : 32);
      }
      for (let j = 0; j <= sw; j++) { const x = j * wd; for (let i = 0; i < 8; i++) marigold(c, x, 30 + i * 30, 15, i % 2 ? 46 : 30); bell(c, x, 270, 34); }
      for (let i = 0; i < 26; i++) { c.fillStyle = '#c0262d'; c.beginPath(); c.arc(R() * W, 20 + R() * 10, 8, 0, TAU); c.fill(); }
    });
  }
  // a big faint mandala that turns behind things
  const mandalaArt = (k, col) => K.art(`folio-mandala-${col}`, 1000, 1000, k, c => { mandala(c, 500, 500, 490, col, 0); mandala(c, 500, 500, 300, col, .3); });
  // ornate palace doors (one leaf, 540 × 1920; the other is its mirror)
  function doorArt(k) {
    return K.art('folio-door', 540, H, k, c => {
      const g = c.createLinearGradient(0, 0, 540, 0); g.addColorStop(0, '#4d0812'); g.addColorStop(.5, '#8c1a2c'); g.addColorStop(1, '#5a0a16');
      c.fillStyle = g; c.fillRect(0, 0, 540, H);
      c.strokeStyle = goldBevel(c, 0, 0, 540, H); c.lineWidth = 10; c.strokeRect(30, 40, 480, H - 80); c.lineWidth = 3; c.strokeRect(52, 62, 436, H - 124);
      for (const y of [520, 1400]) {
        c.save(); c.globalAlpha = .9; mandala(c, 270, y, 190, '#e8bf62', 0); c.restore();
        c.strokeStyle = goldBevel(c, 70, y - 220, 470, y + 220); c.lineWidth = 6; c.beginPath(); c.arc(270, y, 205, 0, TAU); c.stroke();
        gem(c, 270, y, 26, '#c0262d');
      }
      for (let y = 90; y < H - 80; y += 64) for (const x of [41, 499]) { c.fillStyle = goldBevel(c, x - 8, y - 8, x + 8, y + 8); c.beginPath(); c.arc(x, y, 8, 0, TAU); c.fill(); }
      c.strokeStyle = goldBevel(c, 0, 900, 540, 1020); c.lineWidth = 5; c.strokeRect(70, 900, 400, 120);
      const sh = c.createLinearGradient(440, 0, 540, 0); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.45)'); c.fillStyle = sh; c.fillRect(440, 0, 100, H);
      // the brass ring handle near the middle
      c.strokeStyle = goldBevel(c, 470, 960, 530, 1060); c.lineWidth = 9; c.beginPath(); c.arc(492, 1000, 34, 0, TAU); c.stroke();
      c.fillStyle = goldFill(c, 940, 980); c.beginPath(); c.arc(492, 962, 14, 0, TAU); c.fill();
    });
  }

  // ---------- the booklet's pages (painted once per card and language) ----------
  const PG = { x: 100, y: 240, w: 880, h: 1420 };
  function pageFrame(c, w, h, dark) {
    // the page: maroon with a cream arched panel (or all maroon for the cover)
    const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#8e1a2e'); g.addColorStop(1, '#5a0a18');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.globalAlpha = .08; for (let y = 40; y < h; y += 150) for (let x = (y / 150 % 2) * 75; x < w; x += 150) K.paisley(c, x, y, 34, 0, '#f2c76b'); c.globalAlpha = 1;
    c.strokeStyle = goldBevel(c, 0, 0, w, h); c.lineWidth = 6; c.strokeRect(18, 18, w - 36, h - 36); c.lineWidth = 2; c.strokeRect(32, 32, w - 64, h - 64);
    for (const [x, y, sx, sy] of [[32, 32, 1, 1], [w - 32, 32, -1, 1], [32, h - 32, 1, -1], [w - 32, h - 32, -1, -1]]) cornerScroll(c, x + sx * 8, y + sy * 8, sx, sy, 60);
    if (dark) return;
    const px = 70, pw = w - 140, top = 150, bot = h - 80, r = pw / 2;
    c.save(); c.beginPath(); c.moveTo(px, bot); c.lineTo(px, top + r * .55); c.quadraticCurveTo(px, top, px + r, top); c.quadraticCurveTo(px + pw, top, px + pw, top + r * .55); c.lineTo(px + pw, bot); c.closePath();
    const cg = c.createRadialGradient(w / 2, h * .4, 50, w / 2, h / 2, h * .7); cg.addColorStop(0, '#fffaf0'); cg.addColorStop(1, '#f1e1c2'); c.fillStyle = cg;
    c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 24; c.fill(); c.shadowColor = 'transparent';
    c.strokeStyle = goldBevel(c, px, top, px + pw, bot); c.lineWidth = 5; c.stroke(); c.restore();
    c.save(); c.globalAlpha = .07; mandala(c, w / 2, h * .55, 380, '#9a5b16', 0); c.restore();
    // a little crown of gold at the arch's peak
    K.crestTop(c, w / 2, top - 6, 46, '#c0262d');
  }
  function backArt(k) {
    return K.art('folio-back', PG.w, PG.h, k, c => {
      const g = c.createLinearGradient(0, 0, PG.w, 0); g.addColorStop(0, '#f3e4c4'); g.addColorStop(1, '#fffaf0'); c.fillStyle = g; c.fillRect(0, 0, PG.w, PG.h);
      c.globalAlpha = .12; mandala(c, PG.w / 2, PG.h / 2, 360, '#9a5b16', 0); c.globalAlpha = 1;
      c.strokeStyle = 'rgba(184,134,43,.6)'; c.lineWidth = 3; c.strokeRect(30, 30, PG.w - 60, PG.h - 60);
    });
  }
  function divider(c, x, y, w, col = GOLD) {
    c.save(); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 2;
    for (const d of [-1, 1]) { c.beginPath(); c.moveTo(x + d * 26, y); c.lineTo(x + d * w / 2, y); c.stroke(); c.beginPath(); c.arc(x + d * w / 2, y, 4, 0, TAU); c.fill(); }
    c.beginPath(); c.moveTo(x, y - 12); c.lineTo(x + 12, y); c.lineTo(x, y + 12); c.lineTo(x - 12, y); c.closePath(); c.fill(); c.restore();
  }

  // Every page: its painted base (no words) and its words, laid out once per card and language
  function book(P) {
    const hi = P.opt.lang === 'hi', card = P.card;
    if (P.__folio && P.__folio.card === card && P.__folio.hi === hi && P.__folio.kk === kPage(P)) return P.__folio;
    const kk = kPage(P), two = !!clean(card.host2), [p1, p2] = parents(card, P.opt.lang), D = days(card, hi), when = dateRange(card, hi);
    const B = { card, hi, kk, D, pages: {} };
    const fams = (card.families || []).filter(f => f && clean(f.parents)).slice(0, 3);
    // the cover
    const cover = flow([
      { s: hi ? '॥ श्री गणेशाय नमः ॥' : '|| Shri Ganeshaya Namah ||', f: 'caps', z: 30, gold: true, ls: 4, gap: 50 },
      { s: hi ? 'शुभ विवाह' : 'Shubh Vivah', f: 'display', z: hi ? 120 : 76, gold: true, gap: 40 },
      { s: card.host1, f: 'script', z: 150, gold: true, gap: 0 },
      two ? { s: hi ? 'संग' : 'weds', f: 'ital', z: 54, col: '#f6dca0', gap: 0 } : null,
      two ? { s: card.host2, f: 'script', z: 150, gold: true, gap: 40 } : null,
      { s: when, f: 'caps', z: 34, col: '#fff1d0', ls: 3, gap: 16, plaque: true },
      { s: card.venue, f: 'ital', z: 36, col: '#f2d9a8', wrap: 2 }], 330, 700);
    // the invitation
    const invite = flow([
      { s: hi ? 'श्री गणेश जी की असीम कृपा से' : 'With the divine blessings of Lord Ganesha', f: 'caps', z: hi ? 34 : 22, col: '#9a5b16', ls: 4, gap: 22 },
      ...(hi ? HI.invite.wedding.split('\n') : ['Together with their families,', 'we joyfully invite you to the wedding of']).map(s => ({ s, f: 'ital', z: 36, col: INK, gap: 4 })),
      { s: ' ', f: 'serif', z: 10, gap: 10 },
      { s: card.host1, f: 'script', z: 124, col: MAROON, gap: 0 },
      { s: p1, f: 'serif', z: 28, col: '#6b4a2a', wrap: 2, gap: 18 },
      two ? { s: hi ? 'संग' : 'weds', f: 'ital', z: 46, col: GOLD, gap: 12, div: true } : null,
      two ? { s: card.host2, f: 'script', z: 124, col: MAROON, gap: 0 } : null,
      two ? { s: p2, f: 'serif', z: 28, col: '#6b4a2a', wrap: 2, gap: 34 } : null,
      { s: hi ? 'शुभ विवाह के मंगल अवसर पर' : 'on the auspicious occasion of their wedding', f: 'ital', z: 34, col: INK, gap: 14 },
      { s: when, f: 'caps', z: 32, col: MAROON, ls: 3, gap: 6 }], 360, 680);
    // the schedule: one row a day
    const sched = flow([{ s: hi ? 'मांगलिक कार्यक्रम' : 'The Celebrations', f: hi ? 'display' : 'script', z: hi ? 84 : 110, gold: 'dark', gap: 8 },
      { s: hi ? 'आपकी उपस्थिति हमारा सौभाग्य' : 'every moment is sweeter with you', f: 'ital', z: 32, col: '#6b4a2a' }], 250, 680);
    // the venue
    const venue = flow([{ s: hi ? 'समारोह स्थल' : 'The Venue', f: hi ? 'display' : 'script', z: hi ? 84 : 110, gold: 'dark', gap: 0 }], 240, 680);
    const venue2 = flow([
      { s: card.venue, f: 'caps', z: 44, col: MAROON, wrap: 2, gap: 14, ls: 1 },
      { s: card.venueNote, f: 'ital', z: 30, col: '#6b4a2a', wrap: 2, gap: 20 },
      { s: hi ? 'शुभ तिथि' : 'On', f: 'caps', z: 22, col: '#9a5b16', ls: 6, gap: 6 },
      { s: when, f: 'serif', z: 40, col: INK, gap: 30 },
      { s: hi ? 'आपके आगमन की प्रतीक्षा में' : 'We look forward to welcoming you', f: 'ital', z: 34, col: '#9a5b16' }], 900, 680);
    // the families and a bal manuhar
    const fam = flow([
      { s: hi ? 'दर्शनाभिलाषी' : 'With Warm Regards', f: hi ? 'display' : 'script', z: hi ? 80 : 104, gold: 'dark', gap: 24 },
      ...fams.flatMap(f => [{ s: hi ? (/bride/i.test(f.side) ? 'वधू पक्ष' : /groom/i.test(f.side) ? 'वर पक्ष' : clean(f.side)) : clean(f.side), f: 'caps', z: 22, col: '#9a5b16', ls: 5, gap: 4 },
        { s: f.parents, f: 'serif', z: 46, col: MAROON, wrap: 2, gap: 6 }, { s: clean(f.more), f: 'ital', z: 30, col: '#6b4a2a', gap: 20 }]),
      { s: clean(card.hashtag) && `#${clean(card.hashtag).replace(/^#+/, '')}`, f: 'serif', z: 34, col: GOLD, gap: 8 },
      { s: K.phoneText(card.rsvp) && `${hi ? 'संपर्क' : 'RSVP'} · ${K.phoneText(card.rsvp)}`, f: 'serif', z: 30, col: INK }], 230, 680);
    const manuhar = flow([
      { s: hi ? 'बाल मनुहार' : 'From the little ones', f: 'caps', z: hi ? 30 : 22, col: '#ffe3a3', ls: 5, gap: 10 },
      { s: hi ? 'हमारे भैया-दीदी की शादी में' : 'Do come to the wedding,', f: 'serif', z: 40, col: '#fff4de', gap: 2 },
      { s: hi ? 'ज़रूर-ज़रूर आना!' : 'we are saving a dance for you!', f: 'serif', z: 40, col: '#fff4de' }], 0, 600);
    B.lines = { cover, invite, sched, venue, venue2, fam, manuhar };
    const mk = (name, dark, words, extra) => {
      const base = K.canvasOf(PG.w * kk, PG.h * kk), c = base.getContext('2d'); c.scale(kk, kk); pageFrame(c, PG.w, PG.h, dark); if (extra) extra(c, true);
      const full = K.canvasOf(PG.w * kk, PG.h * kk), f = full.getContext('2d'); f.scale(kk, kk); f.drawImage(base, 0, 0, PG.w, PG.h);
      words(f, 99, 0); B.pages[name] = { base, full };
    };
    mk('cover', true, (c, p, t) => drawCover(c, B, p, t), (c) => coverStill(c));
    mk('invite', false, (c, p, t) => drawInvite(c, B, p, t, P));
    mk('sched', false, (c, p, t) => drawSched(c, B, p, t));
    mk('venue', false, (c, p, t) => drawVenue(c, B, p, t), c => palaceVignette(c));
    mk('fam', false, (c, p, t) => drawFam(c, B, p, t, P));
    return (P.__folio = B);
  }
  const fade = (p, i, gap = .2, d = .6, at = .3) => ease((p - at - i * gap) / d);
  function sayAll(c, lines, p, t, o = {}) {
    lines.forEach((l, i) => {
      const a = fade(p, i, o.gap, o.d, o.at), y = l.y + (1 - a) * 18;
      if (l.plaque && a > .01) {
        c.save(); c.globalAlpha = a; const z = setFont(c, l, 700), w = Math.min(760, c.measureText(l.s).width + 90);
        c.fillStyle = 'rgba(40,4,10,.6)'; rrect(c, PG.w / 2 - w / 2, y - z * .95, w, z * 1.9, z * .95); c.fill();
        c.strokeStyle = goldBevel(c, PG.w / 2 - w / 2, y - z, PG.w / 2 + w / 2, y + z); c.lineWidth = 2.5; rrect(c, PG.w / 2 - w / 2 + 6, y - z * .95 + 6, w - 12, z * 1.9 - 12, z * .8); c.stroke(); c.restore();
      }
      if (l.div && a > .01) { c.save(); c.globalAlpha = a; divider(c, PG.w / 2, y, 360); c.restore(); c.save(); c.globalAlpha = a; c.fillStyle = '#fffaf0'; c.fillRect(PG.w / 2 - 60, y - 26, 120, 52); c.restore(); }
      say(c, l, PG.w / 2, y, a, l.gold ? t : undefined);
    });
  }
  function coverStill(c) {
    // the Om in a gold ring at the top of the cover, a mandala and the toran's little swag
    c.save(); c.globalAlpha = .12; mandala(c, PG.w / 2, 760, 420, '#f2c76b', 0); c.restore();
    c.fillStyle = goldBevel(c, PG.w / 2 - 70, 120, PG.w / 2 + 70, 260); c.beginPath(); c.arc(PG.w / 2, 190, 66, 0, TAU); c.fill();
    c.fillStyle = MAROON; c.beginPath(); c.arc(PG.w / 2, 190, 56, 0, TAU); c.fill();
    c.font = '78px "Tiro Devanagari Hindi"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = goldFill(c, 150, 230); c.fillText('ॐ', PG.w / 2, 198);
    for (let i = 0; i <= 26; i++) { const u = i / 26, x = 40 + u * (PG.w - 80), y = 40 + Math.sin(u * Math.PI * 3) ** 2 * 50; marigold(c, x, y, 13, i % 3 ? 34 : 46); }
  }
  const drawCover = (c, B, p, t) => sayAll(c, B.lines.cover, p, t, { gap: .22 });
  function drawInvite(c, B, p, t, P) {
    const img = ganeshaImage(P), a = ease(p / .8);
    if (a > .01) {
      c.save(); c.globalAlpha = a; glow(c, PG.w / 2, 250, 140, 'rgba(255,200,110,.5)');
      if (img && img.complete && img.naturalWidth) { const s = 170 / img.naturalHeight; c.drawImage(img, PG.w / 2 - img.naturalWidth * s / 2, 170, img.naturalWidth * s, 170); }
      else K.ganesha(c, PG.w / 2, 170, 160, t);
      c.restore();
    }
    sayAll(c, B.lines.invite, p, t, { gap: .17 });
  }
  function drawSched(c, B, p, t) {
    sayAll(c, B.lines.sched, p, t);
    const D = B.D.slice(0, 6), n = D.length, top = 440, rowH = Math.min(170, 880 / Math.max(1, n));
    D.forEach((d, i) => {
      const a = fade(p, i, .22, .6, .7), y = top + i * rowH + rowH / 2, x = (1 - a) * 80;
      if (a <= .01) return;
      c.save(); c.globalAlpha = a; c.translate(x, 0);
      const main = d.events.some(e => isMain(e.name)), r = rowH * .36;
      if (d.date) dateMedallion(c, 175, y, r, d.date, { base: main ? '#b8862b' : MAROON, hi: B.hi });
      const cx = 175 + r + 30, cw = PG.w - 110 - cx;
      c.fillStyle = main ? 'rgba(232,196,106,.25)' : 'rgba(255,255,255,.75)'; rrect(c, cx, y - rowH * .38, cw, rowH * .76, 18); c.fill();
      c.strokeStyle = 'rgba(184,134,43,.55)'; c.lineWidth = 2; rrect(c, cx + 5, y - rowH * .38 + 5, cw - 10, rowH * .76 - 10, 14); c.stroke();
      const ev = d.events.slice(0, 3), ew = cw / ev.length;
      ev.forEach((e, j) => {
        const ex = cx + ew * j + ew / 2;
        say(c, { s: `${e.icon ? e.icon + ' ' : ''}${fnName(e.name, B.hi)}`, f: 'serif', z: Math.min(36, rowH * .24), col: MAROON }, ex, y - rowH * .1, 1);
        if (e.time) say(c, { s: e.time, f: 'caps', z: Math.min(22, rowH * .15), col: '#9a5b16', ls: 2 }, ex, y + rowH * .16, 1);
        if (j) { c.strokeStyle = 'rgba(184,134,43,.5)'; c.beginPath(); c.moveTo(cx + ew * j, y - rowH * .25); c.lineTo(cx + ew * j, y + rowH * .25); c.stroke(); }
      });
      c.restore();
    });
    const da = fade(p, n, .22, .6, .9);
    if (da > .01) { c.save(); c.globalAlpha = da; for (const dx of [-120, 0, 120]) diya(c, PG.w / 2 + dx, PG.h - 150, 44, t); c.restore(); }
  }
  // a little painted palace in an arched window: the venue's picture
  function palaceVignette(c) {
    const x = 170, y = 380, w = 540, h = 440;
    c.save(); c.beginPath(); c.moveTo(x, y + h); c.lineTo(x, y + w / 2); c.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); c.lineTo(x + w, y + h); c.closePath(); c.clip();
    const s = c.createLinearGradient(0, y, 0, y + h); s.addColorStop(0, '#f6c98a'); s.addColorStop(.6, '#f3a77c'); s.addColorStop(1, '#c9707a'); c.fillStyle = s; c.fillRect(x, y, w, h);
    glow(c, x + w * .7, y + h * .45, 160, 'rgba(255,240,200,.8)');
    c.fillStyle = '#7a2c3a';
    const base = y + h - 90;
    c.fillRect(x + 60, base - 120, w - 120, 120);
    for (const [cx, r] of [[x + w / 2, 78], [x + 150, 46], [x + w - 150, 46]]) { c.beginPath(); c.arc(cx, base - 120, r, Math.PI, 0); c.fill(); c.fillRect(cx - 3, base - 120 - r - 30, 6, 30); }
    for (const cx of [x + 80, x + w - 80]) { c.fillRect(cx - 12, base - 230, 24, 230); c.beginPath(); c.arc(cx, base - 230, 18, Math.PI, 0); c.fill(); }
    c.fillStyle = '#ffcf7a'; for (let i = 0; i < 9; i++) { c.beginPath(); const wx = x + 110 + i * 40; c.moveTo(wx - 9, base - 20); c.lineTo(wx - 9, base - 60); c.arc(wx, base - 60, 9, Math.PI, 0); c.lineTo(wx + 9, base - 20); c.fill(); }
    const lake = c.createLinearGradient(0, base, 0, y + h); lake.addColorStop(0, '#9a4a5a'); lake.addColorStop(1, '#5a2a44'); c.fillStyle = lake; c.fillRect(x, base, w, 90);
    c.fillStyle = 'rgba(255,207,122,.45)'; for (let i = 0; i < 9; i++) c.fillRect(x + 104 + i * 40, base + 8 + (i % 2) * 6, 12, 30);
    c.restore();
    c.strokeStyle = goldBevel(c, x, y, x + w, y + h); c.lineWidth = 10; c.beginPath(); c.moveTo(x, y + h); c.lineTo(x, y + w / 2); c.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); c.lineTo(x + w, y + h); c.closePath(); c.stroke();
  }
  function drawVenue(c, B, p, t) {
    sayAll(c, B.lines.venue, p, t);
    // the pin drops onto the palace, bounces, and rings ripple out
    const q = clamp((p - .5) / .7), y = 700 - (1 - ease3(q)) * 420 - Math.abs(Math.sin(clamp((p - 1.2) / .6) * Math.PI)) * 24 * (1 - clamp((p - 1.2) / .6));
    if (q > 0) {
      for (let i = 0; i < 3; i++) { const r = ((p - 1.2 + i * .5) % 1.5) / 1.5; if (p > 1.2 && r > 0) { c.strokeStyle = `rgba(122,20,38,${(1 - r) * .6})`; c.lineWidth = 4; c.beginPath(); c.ellipse(PG.w / 2, 700, 30 + r * 120, (30 + r * 120) * .32, 0, 0, TAU); c.stroke(); } }
      c.save(); c.globalAlpha = Math.min(1, q * 3); pin(c, PG.w / 2, y, 110, MAROON); c.restore();
    }
    sayAll(c, B.lines.venue2, p, t, { at: 1.0, gap: .18 });
  }
  function drawFam(c, B, p, t, P) {
    sayAll(c, B.lines.fam, p, t, { gap: .16 });
    const last = B.lines.fam[B.lines.fam.length - 1], img = coupleImage(P), ia = fade(p, 0, 0, .8, .9);
    if (img && ia > .01) {
      const top = (last ? last.y : 400) + 50, bottomY = PG.h - 160 - 230, hh = Math.min(470, bottomY - top);
      if (hh > 220) {
        c.save(); c.globalAlpha = ia; glow(c, PG.w / 2, top + hh / 2, hh * .7, 'rgba(232,196,106,.35)');
        for (const d of [-1, 1]) { c.save(); c.translate(PG.w / 2 + d * hh * .62, top + hh * .55); c.globalAlpha = ia * .5; mandala(c, 0, 0, hh * .2, '#b8862b', t * .2 * d); c.restore(); }
        cutout(c, img, PG.w / 2, top + hh, hh, 'arch', P.shotLook('fam'), t); c.restore();
      }
    }
    const a = fade(p, 0, 0, .7, 1.4);
    if (a <= .01) return;
    const M = B.lines.manuhar, h = M.reduce((s, l) => Math.max(s, l.y), 0) + 60, y0 = PG.h - 150 - h, bx = 120, bw = PG.w - 240;
    c.save(); c.globalAlpha = a; c.translate(0, (1 - a) * 40);
    c.fillStyle = MAROON; rrect(c, bx, y0, bw, h + 40, 26); c.fill();
    c.strokeStyle = goldBevel(c, bx, y0, bx + bw, y0 + h); c.lineWidth = 3; rrect(c, bx + 10, y0 + 10, bw - 20, h + 20, 20); c.stroke();
    for (const x of [bx + 70, bx + bw - 70]) { c.font = '56px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(x < PG.w / 2 ? '👧' : '👦', x, y0 + h / 2 + 20); }
    M.forEach(l => say(c, { ...l, maxW: bw - 220 }, PG.w / 2, y0 + 40 + l.y, 1));
    c.restore();
  }

  // ---------- drawing the book on the table ----------
  function onTable(c, P, cam) {
    c.save(); K.camera(c, cam); c.drawImage(table(kOf(P)), 0, 0, W, H);
    const g = c.createRadialGradient(W / 2, H * .45, 100, W / 2, H * .5, 1000); g.addColorStop(0, 'rgba(255,200,120,.16)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    // the book's shadow and the pages' edges beneath the top page
    c.fillStyle = 'rgba(0,0,0,.45)'; rrect(c, PG.x + 14, PG.y + 26, PG.w, PG.h, 10); c.fill();
    for (let i = 4; i > 0; i--) { c.fillStyle = i % 2 ? '#e9d6b0' : '#f7ead0'; c.fillRect(PG.x + i * 3, PG.y + i * 4, PG.w, PG.h); }
    return () => c.restore();
  }
  // a page shot: the page flat (its words writing in), then turning over onto the next page
  function pageShot(c, s, pt, t, P, name, next, draw) {
    const B = book(P), kk = B.kk, turnAt = s.d - 1.25, u = ease3((pt - turnAt) / 1.15);
    const cam = { x: W / 2, y: H / 2, z: 1 + .035 * Math.sin(Math.PI * clamp(pt / s.d)) };
    const done = onTable(c, P, cam);
    if (u > 0 && next) c.drawImage(B.pages[next].base, PG.x, PG.y, PG.w, PG.h);
    if (u <= 0 || !next) {
      c.save(); c.translate(PG.x, PG.y); c.drawImage(B.pages[name].base, 0, 0, PG.w, PG.h); draw(c, B, pt, t); c.restore();
    } else pageTurn(c, u, PG.x, PG.y, PG.w, PG.h, B.pages[name].full, backArt(kk), { depth: .18 });
    done();
  }

  // ---------- the days ----------
  function dayBack(k, m) {
    return K.art(`folio-day-${m.a}`, W, H, k, c => {
      const g = c.createRadialGradient(W / 2, H * .38, 80, W / 2, H * .5, H * .8); g.addColorStop(0, m.a); g.addColorStop(1, m.b); c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.globalAlpha = .07; for (let y = 0; y < H + 160; y += 160) for (let x = (y / 160 % 2) * 80; x < W + 80; x += 160) K.paisley(c, x, y, 40, 0, '#fff2c8'); c.globalAlpha = 1;
      K.goldFrame(c, 26, 26, W - 52, H - 52, 140);
    });
  }
  function fnCard(c, x, y, w, h, e, hi, main) {
    c.save();
    c.fillStyle = 'rgba(0,0,0,.28)'; rrect(c, x + 6, y + 12, w, h, 26); c.fill();
    const g = c.createLinearGradient(x, y, x, y + h); g.addColorStop(0, main ? '#fff3cf' : '#fffdf6'); g.addColorStop(1, main ? '#f1d58e' : '#f4e6c8');
    c.fillStyle = g; rrect(c, x, y, w, h, 26); c.fill();
    c.strokeStyle = goldBevel(c, x, y, x + w, y + h); c.lineWidth = 3; rrect(c, x + 10, y + 10, w - 20, h - 20, 18); c.stroke();
    const ix = x + 86, iy = y + h / 2;
    c.fillStyle = goldBevel(c, ix - 54, iy - 54, ix + 54, iy + 54); c.beginPath(); c.arc(ix, iy, 54, 0, TAU); c.fill();
    c.fillStyle = MAROON; c.beginPath(); c.arc(ix, iy, 46, 0, TAU); c.fill();
    c.font = '50px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(e.icon || '✨', ix, iy + 3);
    const tx = x + 170, tw = w - 200;
    say(c, { s: fnName(e.name, hi), f: 'serif', z: 52, col: MAROON, align: 'left', maxW: tw }, tx, y + h * .33, 1);
    say(c, { s: [e.time, e.venue].filter(Boolean).join('  ·  '), f: 'ital', z: 34, col: '#7a4a1a', align: 'left', maxW: tw }, tx, y + h * .7, 1);
    c.restore();
  }
  const DAYNO = ['पहला दिन', 'दूसरा दिन', 'तीसरा दिन', 'चौथा दिन', 'पाँचवाँ दिन', 'छठा दिन'];
  function dayShot(c, s, pt, t, P) {
    const B = book(P), d = B.D[s.day], hi = B.hi, k = kOf(P);
    if (!d) return;
    const first = d.events[0].name, m = moodOf(first), main = d.events.some(e => isMain(e.name));
    const z = 1.06 - .06 * ease3(pt / s.d);
    c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2); c.drawImage(dayBack(k, m), 0, 0, W, H); c.restore();
    c.save(); c.globalAlpha = .16; c.translate(W / 2, 560); c.rotate(t * .06); c.drawImage(mandalaArt(k, '#fff0c0'), -520, -520, 1040, 1040); c.restore();
    rays(c, W / 2, 560, t, { n: 22, r: 900, a: .1 });
    // the moving things of the day's mood
    if (m.fx === 'haldi') petals(c, t, 26, ['#ffd23f', '#ff9f1c', '#fff3b0'], 11);
    else if (m.fx === 'mehendi') { petals(c, t, 18, ['#9ccc65', '#f48fb1', '#ffffff'], 12); }
    else if (m.fx === 'night') {
      sparks(c, t, 26, '#fff4c8', 13);
      c.save(); c.fillStyle = '#fff1c4'; glow(c, 860, 300, 160, 'rgba(255,240,200,.35)'); c.beginPath(); c.arc(860, 300, 62, 0, TAU); c.fill(); c.fillStyle = m.b; c.globalAlpha = .9; c.beginPath(); c.arc(884, 284, 56, 0, TAU); c.fill(); c.restore();
      const R = rng(5); c.save(); c.fillStyle = '#ffd98a'; c.textAlign = 'center';
      for (let i = 0; i < 12; i++) { const x = R() * W, sp = 40 + R() * 50, y = H - ((R() * H + t * sp) % H); c.globalAlpha = .5 + .4 * Math.sin(t * 2 + i); c.font = `${40 + R() * 40}px serif`; c.fillText(i % 2 ? '♪' : '♫', x + Math.sin(t + i) * 20, y); }
      c.restore();
    } else if (m.fx === 'gala') { sparks(c, t, 30, '#ffe7a6', 14); motes(c, t, 10, 'rgba(255,220,160,A)', 15); }
    else petals(c, t, 30, ['#ff8f00', '#ffca28', '#c62828', '#ffffff'], 16);
    c.drawImage(toranArt(k), 0, -10 + Math.sin(t * 1.3) * 4, W, 300);
    // "Day 01", the date medallion dropping in, the function cards sliding in, the couple dressed for the day
    const ta = ease((pt - .1) / .6);
    const title = main ? (hi ? 'शुभ विवाह दिवस' : 'THE BIG DAY') : (hi ? DAYNO[s.day] || `दिन ${s.day + 1}` : `DAY ${String(s.day + 1).padStart(2, '0')}`);
    if (ta > .01) {
      c.save(); c.globalAlpha = ta; c.translate(0, (1 - ta) * 30);
      c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.moveTo(150, 288); c.lineTo(930, 288); c.lineTo(900, 340); c.lineTo(930, 392); c.lineTo(150, 392); c.lineTo(180, 340); c.closePath(); c.fill();
      c.fillStyle = m.med; c.beginPath(); c.moveTo(160, 282); c.lineTo(920, 282); c.lineTo(890, 334); c.lineTo(920, 386); c.lineTo(160, 386); c.lineTo(190, 334); c.closePath(); c.fill();
      c.strokeStyle = goldBevel(c, 160, 282, 920, 386); c.lineWidth = 3; c.stroke(); c.restore();
    }
    say(c, { s: title, f: 'caps', z: 58, gold: true, ls: 14, maxW: 640 }, W / 2, 336 + (1 - ta) * 30, ta, t);
    const ma = ease3((pt - .15) / .7), sc = ma < 1 ? ma * (1 + .15 * Math.sin(ma * Math.PI)) : 1;
    if (d.date && ma > 0) { c.save(); c.translate(W / 2, 530); c.scale(sc, sc); glow(c, 0, 0, 220, 'rgba(255,220,150,.45)'); dateMedallion(c, 0, 0, 118, d.date, { base: main ? '#b8862b' : m.med, hi, day: true }); c.restore(); }
    const ev = d.events.slice(0, 3), ch = 170, top = 700;
    ev.forEach((e, i) => { const a = ease3((pt - .45 - i * .22) / .7); if (a > 0) { c.save(); c.globalAlpha = Math.min(1, a * 1.5); fnCard(c, 110 + (1 - a) * 900, top + i * (ch + 26), 860, ch, e, hi, isMain(e.name)); c.restore(); } });
    const img = coupleImage(P, first), bottom = top + ev.length * (ch + 26);
    if (img) {
      const ca = ease((pt - .8) / .9), hh = Math.min(860, 1880 - bottom - 10);
      if (ca > .01 && hh > 300) { c.save(); c.globalAlpha = ca; cutout(c, img, W / 2, 1890 + (1 - ca) * 80, hh, 'full', P.shotLook('day'), t); c.restore(); }
    }
  }

  // ---------- the opening ----------
  function omShot(c, s, pt, t, P) {
    const k = kOf(P), hi = P.opt.lang === 'hi';
    c.drawImage(K.art('folio-dark', W, H, k, g => { const r = g.createRadialGradient(W / 2, H * .42, 50, W / 2, H / 2, H * .8); r.addColorStop(0, '#4a0b16'); r.addColorStop(1, '#0d0204'); g.fillStyle = r; g.fillRect(0, 0, W, H); }), 0, 0, W, H);
    const form = ease3(pt / 1.7), up = ease3((pt - 2.6) / 1.2), cy = lerp(820, 380, up), sc = lerp(1, .62, up);
    if (pt > 1.4) rays(c, W / 2, cy, t, { n: 28, r: 1500, a: .16 * ease((pt - 1.4) / .6) });
    // gold dust swirls in and gathers into the Om's ring
    const R = rng(3);
    c.fillStyle = '#ffd76a';
    for (let i = 0; i < 160; i++) {
      const sx = R() * W, sy = R() * H, ang = R() * TAU, rr = 210 + (R() - .5) * 40, sw = (1 - form) * 2.4;
      const tx = W / 2 + Math.cos(ang + sw) * rr * sc, ty = cy + Math.sin(ang + sw) * rr * sc;
      const x = lerp(sx, tx, form), y = lerp(sy, ty, form), a = form < 1 ? .9 : Math.max(0, .9 - (pt - 1.7) * 1.2);
      if (a <= 0) continue; c.globalAlpha = a; c.beginPath(); c.arc(x, y, 2 + (i % 4), 0, TAU); c.fill();
    }
    c.globalAlpha = 1;
    const on = ease((pt - 1.3) / .6);
    if (pt > 1.3 && pt < 2.4) glow(c, W / 2, cy, 520, `rgba(255,220,140,${(.7 * (1 - clamp((pt - 1.5) / .9))).toFixed(2)})`);
    if (on > 0) {
      c.save(); c.globalAlpha = on; c.translate(W / 2, cy); c.scale(sc * (.9 + .1 * on), sc * (.9 + .1 * on));
      c.drawImage(K.art('folio-om', 520, 520, k, g => {
        g.fillStyle = goldBevel(g, 20, 20, 500, 500); g.beginPath(); g.arc(260, 260, 240, 0, TAU); g.fill();
        const r = g.createRadialGradient(220, 220, 10, 260, 260, 220); r.addColorStop(0, '#a3253a'); r.addColorStop(1, '#4d0812'); g.fillStyle = r; g.beginPath(); g.arc(260, 260, 214, 0, TAU); g.fill();
        g.strokeStyle = goldBevel(g, 40, 40, 480, 480); g.lineWidth = 3; g.beginPath(); g.arc(260, 260, 196, 0, TAU); g.stroke();
        for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; g.fillStyle = '#f2c76b'; g.beginPath(); g.arc(260 + Math.cos(a) * 227, 260 + Math.sin(a) * 227, 5, 0, TAU); g.fill(); }
        g.font = '260px "Tiro Devanagari Hindi"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = goldFill(g, 120, 380); g.fillText('ॐ', 260, 292);
      }), -260, -260, 520, 520);
      c.restore();
    }
    // Shri Ganesh rises beneath it, with the shloka
    const ga = ease((pt - 2.9) / 1);
    if (ga > .01 && P.opt.ganeshaArt !== 'none') {
      const img = ganeshaImage(P);
      c.save(); c.globalAlpha = ga; glow(c, W / 2, 960, 460, 'rgba(255,200,110,.45)');
      if (img && img.complete && img.naturalWidth) { const h = 640, w = img.naturalWidth * h / img.naturalHeight; c.drawImage(img, W / 2 - w / 2, 640 + (1 - ga) * 60, w, h); }
      else K.ganesha(c, W / 2, 640 + (1 - ga) * 60, 600, t);
      c.restore();
    }
    const a1 = ease((pt - 3.5) / .7), a2 = ease((pt - 4.0) / .7);
    say(c, { s: hi ? '॥ श्री गणेशाय नमः ॥' : '|| Shri Ganeshaya Namah ||', f: 'caps', z: 56, gold: true, ls: 4, maxW: 940 }, W / 2, 1400 + (1 - a1) * 20, a1, t);
    say(c, { s: 'वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ', f: 'serif', z: 44, col: '#f6dca0', maxW: 900 }, W / 2, 1490, a2);
    say(c, { s: hi ? 'निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा' : 'May every step of this union be free of obstacles', f: hi ? 'serif' : 'ital', z: hi ? 44 : 40, col: '#f6dca0', maxW: 900 }, W / 2, 1560, a2);
  }
  // the cover lying on the table (shared by the doors and the cover shot)
  function coverFlat(c, P, pt, t, z) {
    const B = book(P);
    const done = onTable(c, P, { x: W / 2, y: H / 2, z });
    c.save(); c.translate(PG.x, PG.y); c.drawImage(B.pages.cover.base, 0, 0, PG.w, PG.h); drawCover(c, B, pt, t);
    for (const dx of [-170, 0, 170]) diya(c, PG.w / 2 + dx, PG.h - 140, 50, t);
    c.restore(); done();
  }
  function doorsShot(c, s, pt, t, P) {
    const k = kOf(P), u = ease3(clamp((pt - .9) / 2.0)), z = lerp(1.25, 1.16, ease(pt / s.d));
    coverFlat(c, P, -1, t, z);
    glow(c, W / 2, H / 2, 900 * (.3 + u), `rgba(255,226,170,${(.55 * (1 - u * .6)).toFixed(2)})`);
    const door = doorArt(k);
    pageTurn(c, u * .5, 0, 0, 540, H, door, null, { depth: .1, strips: 20 });
    c.save(); c.translate(W, 0); c.scale(-1, 1); pageTurn(c, u * .5, 0, 0, 540, H, door, null, { depth: .1, strips: 20 }); c.restore();
    // the plaque with their initials across the closed doors
    const pa = 1 - ease((pt - .7) / .4);
    if (pa > .01) {
      c.save(); c.globalAlpha = pa; c.fillStyle = 'rgba(40,4,10,.85)'; rrect(c, 300, 905, 480, 110, 20); c.fill(); c.strokeStyle = goldBevel(c, 300, 905, 780, 1015); c.lineWidth = 4; rrect(c, 308, 913, 464, 94, 16); c.stroke();
      const two = clean(P.card.host2);
      say(c, { s: two ? `${clean(P.card.host1).toUpperCase()}  ✦  ${clean(P.card.host2).toUpperCase()}` : clean(P.card.host1).toUpperCase(), f: 'caps', z: 34, gold: true, ls: 6, maxW: 440 }, W / 2, 962, 1, t);
      c.restore();
    }
    c.drawImage(toranArt(k), 0, -20 + Math.sin(t * 1.2) * 4, W, 300);
    if (pt > s.d - .5) { c.fillStyle = `rgba(255,236,200,${((pt - (s.d - .5)) / .5 * .7).toFixed(2)})`; c.fillRect(0, 0, W, H); }
  }
  function coverShot(c, s, pt, t, P) {
    const B = book(P), z = lerp(1.16, 1, ease3(pt / 2.4)), turnAt = s.d - 1.3, u = ease3((pt - turnAt) / 1.2);
    if (u <= 0) coverFlat(c, P, pt, t, z);
    else {
      const done = onTable(c, P, { x: W / 2, y: H / 2, z: 1 });
      c.drawImage(B.pages.invite.base, PG.x, PG.y, PG.w, PG.h);
      pageTurn(c, u, PG.x, PG.y, PG.w, PG.h, B.pages.cover.full, backArt(B.kk), { depth: .18 });
      done();
    }
    if (pt < .6) { c.fillStyle = `rgba(255,236,200,${((1 - pt / .6) * .7).toFixed(2)})`; c.fillRect(0, 0, W, H); }
  }

  // ---------- the finale: the pages fan out, thank you ----------
  function fanShot(c, s, pt, t, P) {
    const B = book(P), k = kOf(P), hi = B.hi;
    c.drawImage(table(k), 0, 0, W, H);
    rays(c, W / 2, 900, t, { n: 26, r: 1300, a: .12 });
    const order = ['fam', 'venue', 'sched', 'invite', 'cover'].map(n => B.pages[n].full);
    const u = ease3((pt - .2) / 1.6), up = ease3((pt - 2.2) / 1.1), w = lerp(560, 360, up), cy = lerp(1500, 1110, up);
    K.fan(c, order, u, W / 2, cy, { w, spread: 1.15 });
    const ta = ease((pt - 2.4) / .8);
    say(c, { s: hi ? 'धन्यवाद' : 'Thank You', f: 'script', z: hi ? 150 : 170, gold: true }, W / 2, 230 + (1 - ta) * 30, ta, t);
    say(c, { s: hi ? 'आशीर्वाद की इस पुस्तिका में आपका स्वागत' : 'a folio of blessings, waiting for you', f: 'ital', z: 40, col: '#f6dca0' }, W / 2, 340, ta);
    K.words(c, P, s.tail, { zone: [1180, 1640, 760], L: P.shotLook('fan'), p: pt - 2.7 });
    sparks(c, t, 20, '#ffe7a6', 21);
  }

  return {
    id: 'story-folio', order: 12, occasion: 'wedding', tune: 'shehnai', thumb: 10.5,
    name: 'The Golden Folio', note: 'An Om of gold dust, Shri Ganesh, palace doors, then a maroon-and-gold booklet whose pages turn: every day, the venue, the families',
    names: ['Aanvi', 'Raghav'], ganesha: 'ganesha-06',
    looks: { open: 'palace', title: 'palace', invite: 'palace', events: ['palace'], date: 'palace', end: 'palace', final: 'palace' },
    look: (kind, K) => K.palette('palace', { font: { script: 'Great Vibes', serif: 'Gilda Display' }, col: { names: '#ffd98a', ink: '#fff4de', ink2: '#efd9b6', accent: '#ffc46b', gold: '#e8c46a' },
      shadow: ['rgba(20,8,4,.75)', 10], fx: () => {} }),
    timeline(S, K, card, opt) {
      const hi = opt.lang === 'hi', D = days(card, hi).slice(0, 6), dd = D.length ? Math.max(2.9, Math.min(4.2, 17.4 / D.length)) : 0;
      const out = [
        { k: 'reel', reel: 'om', d: 5.8, name: 'Om & Shri Ganesh' },
        { k: 'reel', reel: 'doors', d: 3.4, name: 'Palace Doors', change: 'flash' },
        { k: 'reel', reel: 'cover', d: 5, name: 'The Folio', cut: true, change: 'none' },
        { k: 'reel', reel: 'invite', d: 6.6, name: 'Invitation', cut: true, change: 'none' }];
      D.forEach((d, i) => out.push({ k: 'reel', reel: 'day', day: i, d: dd, name: `Day ${i + 1}`, change: i ? 'sparkle' : 'petals' }));
      if (D.length) out.push({ k: 'reel', reel: 'sched', d: 4.6, name: 'The Celebrations', change: 'bloom' });
      out.push({ k: 'reel', reel: 'venue', d: 5, name: 'Venue', cut: !!D.length, change: D.length ? 'none' : 'bloom' });
      out.push({ k: 'reel', reel: 'fam', d: 5, name: 'Families', cut: true, change: 'none' });
      out.push({ k: 'reel', reel: 'fan', d: 6.6, name: 'Thank You', change: 'sparkle', sigCorner: opt.signature !== false,
        tail: [{ t: 'qr', rows: K.SITE_QR, z: 220, gap: 22 }, { t: 'text', s: hi ? 'ऐसा ही निमन्त्रण बनवाएँ' : 'Your invitation, made like this', f: hi ? 'hser' : 'italic', z: 34, col: 'ink2', gap: 6 },
          { t: 'text', s: 'cardalbum.vercel.app', f: 'serif', z: 42, col: 'names' }] });
      return out;
    },
    shots: {
      om: omShot, doors: doorsShot, cover: coverShot,
      invite: (c, s, pt, t, P) => pageShot(c, s, pt, t, P, 'invite', null, (g, B, p, tt) => drawInvite(g, B, p, tt, P)),
      day: dayShot,
      sched: (c, s, pt, t, P) => pageShot(c, s, pt, t, P, 'sched', 'venue', drawSched),
      venue: (c, s, pt, t, P) => pageShot(c, s, pt, t, P, 'venue', 'fam', drawVenue),
      fam: (c, s, pt, t, P) => pageShot(c, s, pt, t, P, 'fam', null, (g, B, p, tt) => drawFam(g, B, p, tt, P)),
      fan: fanShot
    }
  };
})(Cinema.kit));

} catch (e) { if (typeof console !== 'undefined') console.warn('Cinema: story-folio.js', e); }

// ---------- js/cinema/story-glam.js ----------
try {
// The Glam Issue: a kitty party or get-together as a glossy fashion magazine. Covers flip on a pink marble table,
// landing on the club as this issue's Cover Star (flashbulbs popping); the fashion-week runway lights up for the
// welcome; an editor's note carries the invitation; every game and treat gets its own feature page; the VIP pass
// holds the date and venue; the back cover says thank you.
Cinema.register((K => {
  const { W, H, TAU, rng, clamp, ease, ease3, lerp, art, glow, rrect, rose, clean, dateRange, splitIcon, days, camAt, camera, foil, spacing, goldBevel, pageTurn } = K;
  const kOf = P => Math.min(1.25, Math.max(.5, P.k));
  const hiOf = P => P.opt.lang === 'hi';
  const PINK = '#e8337f', HOT = '#c2185b', BLACK = '#141014', CREAM = '#fff6f2';
  const noEmoji = s => clean(s).replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '').replace(/\s+/g, ' ').trim();
  const club = card => noEmoji(card.host2 ? `${card.host1} & ${card.host2}` : card.host1) || 'The Kitty Club';
  const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const issue = card => { const d = Date.parse(card.date || ''); return isNaN(d) ? 'PARTY ISSUE' : `${MON[new Date(d).getMonth()]} ${new Date(d).getFullYear()}`; };

  // ---- glam props ----
  function lips(c, x, y, s, col = '#d01848') {
    c.save(); c.translate(x, y); c.scale(s / 100, s / 100);
    const g = c.createLinearGradient(0, -40, 0, 50); g.addColorStop(0, col); g.addColorStop(1, '#7a0a24'); c.fillStyle = g;
    c.beginPath(); c.moveTo(-100, 0); c.bezierCurveTo(-70, -30, -40, -46, -18, -40); c.quadraticCurveTo(0, -30, 18, -40); c.bezierCurveTo(40, -46, 70, -30, 100, 0); c.quadraticCurveTo(0, 12, -100, 0); c.fill();
    c.beginPath(); c.moveTo(-100, 2); c.quadraticCurveTo(0, 16, 100, 2); c.bezierCurveTo(70, 50, 30, 62, 0, 62); c.bezierCurveTo(-30, 62, -70, 50, -100, 2); c.fill();
    c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.ellipse(-30, 34, 26, 8, -.1, 0, TAU); c.fill(); c.beginPath(); c.ellipse(34, -24, 18, 5, .2, 0, TAU); c.fill();
    c.restore();
  }
  function shades(c, x, y, s, rot = 0) {
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(s / 100, s / 100);
    for (const d of [-1, 1]) { const g = c.createLinearGradient(d * 60, -40, d * 60, 40); g.addColorStop(0, '#2a1020'); g.addColorStop(.6, '#7a1a4a'); g.addColorStop(1, '#ff6aa8');
      c.fillStyle = '#e8b84a'; c.beginPath(); c.moveTo(d * 12, -18); c.quadraticCurveTo(d * 60, -52, d * 118, -40); c.quadraticCurveTo(d * 120, 30, d * 70, 40); c.quadraticCurveTo(d * 18, 40, d * 12, -18); c.fill();
      c.fillStyle = g; c.beginPath(); c.moveTo(d * 20, -14); c.quadraticCurveTo(d * 60, -42, d * 108, -32); c.quadraticCurveTo(d * 110, 24, d * 70, 32); c.quadraticCurveTo(d * 26, 32, d * 20, -14); c.fill();
      c.fillStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.ellipse(d * 50, -12, 18, 6, d * -.4, 0, TAU); c.fill(); }
    c.fillStyle = '#e8b84a'; c.fillRect(-14, -20, 28, 7); c.restore();
  }
  function heel(c, x, y, s, col = '#d01848') {
    c.save(); c.translate(x, y); c.scale(s / 100, s / 100);
    const g = c.createLinearGradient(-100, -100, 100, 40); g.addColorStop(0, col); g.addColorStop(1, '#5a0418'); c.fillStyle = g;
    c.beginPath(); c.moveTo(-110, 30); c.quadraticCurveTo(-120, -10, -80, -20); c.quadraticCurveTo(-20, -30, 20, -70); c.quadraticCurveTo(50, -110, 80, -120); c.lineTo(100, -110); c.quadraticCurveTo(70, -60, 74, 0); c.lineTo(58, 0); c.quadraticCurveTo(40, -40, 0, 0); c.quadraticCurveTo(-40, 30, -110, 30); c.fill();
    c.fillStyle = '#1a0a10'; c.beginPath(); c.moveTo(66, -10); c.lineTo(80, -10); c.lineTo(76, 120); c.lineTo(72, 120); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(-90, -8); c.quadraticCurveTo(-30, -18, 10, -52); c.quadraticCurveTo(-20, -28, -90, -2); c.fill();
    c.fillStyle = '#e8b84a'; c.fillRect(-112, 26, 60, 8); c.restore();
  }
  function martini(c, x, y, s, liq = '#ff4f9a') {
    c.save(); c.translate(x, y); c.scale(s / 100, s / 100);
    c.fillStyle = liq; c.globalAlpha = .9; c.beginPath(); c.moveTo(-80, -90); c.lineTo(80, -90); c.lineTo(0, 0); c.fill(); c.globalAlpha = 1;
    c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 5; c.beginPath(); c.moveTo(-100, -110); c.lineTo(0, 0); c.lineTo(100, -110); c.stroke();
    c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 120); c.moveTo(-50, 124); c.quadraticCurveTo(0, 112, 50, 124); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.moveTo(-60, -84); c.lineTo(-40, -84); c.lineTo(-8, -20); c.fill();
    c.strokeStyle = '#e8b84a'; c.lineWidth = 4; c.beginPath(); c.moveTo(40, -150); c.lineTo(-10, -50); c.stroke(); c.fillStyle = '#5a9a2a'; c.beginPath(); c.arc(22, -112, 16, 0, TAU); c.fill(); c.fillStyle = '#d01848'; c.beginPath(); c.arc(26, -114, 5, 0, TAU); c.fill();
    c.restore();
  }
  function teacup(c, x, y, s, col = '#ff8fbf') {
    c.save(); c.translate(x, y); c.scale(s / 100, s / 100);
    c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(6, 40, 130, 26, 0, 0, TAU); c.fill();
    c.fillStyle = '#fffaf6'; c.beginPath(); c.ellipse(0, 34, 130, 26, 0, 0, TAU); c.fill(); c.strokeStyle = '#e8b84a'; c.lineWidth = 4; c.stroke();
    const g = c.createLinearGradient(-80, 0, 80, 0); g.addColorStop(0, '#f6f0ee'); g.addColorStop(.4, '#ffffff'); g.addColorStop(1, '#e2d6d2'); c.fillStyle = g;
    c.beginPath(); c.moveTo(-86, -60); c.quadraticCurveTo(-84, 30, 0, 30); c.quadraticCurveTo(84, 30, 86, -60); c.closePath(); c.fill();
    c.strokeStyle = '#fffaf6'; c.lineWidth = 14; c.beginPath(); c.arc(98, -24, 26, -1.6, 1.6); c.stroke(); c.strokeStyle = '#e8b84a'; c.lineWidth = 3; c.beginPath(); c.arc(98, -24, 26, -1.6, 1.6); c.stroke();
    c.fillStyle = col; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(-56 + i * 28, -18 + (i % 2) * 10, 9, 0, TAU); c.fill(); }
    c.fillStyle = '#8a4a2a'; c.beginPath(); c.ellipse(0, -60, 86, 14, 0, 0, TAU); c.fill(); c.strokeStyle = '#e8b84a'; c.lineWidth = 5; c.beginPath(); c.ellipse(0, -60, 86, 14, 0, 0, TAU); c.stroke();
    c.restore();
  }
  function steam(c, x, y, t, s) { c.save(); c.lineCap = 'round'; for (let i = 0; i < 3; i++) { const ph = t * .8 + i * 2; c.strokeStyle = `rgba(255,255,255,${(.25 + .1 * Math.sin(ph)).toFixed(2)})`; c.lineWidth = 8 * s; c.beginPath(); c.moveTo(x - 30 * s + i * 30 * s, y); c.bezierCurveTo(x - 50 * s + i * 30 * s + Math.sin(ph) * 20 * s, y - 60 * s, x + i * 30 * s - 10 * s + Math.cos(ph) * 20 * s, y - 100 * s, x - 20 * s + i * 30 * s, y - 150 * s); c.stroke(); } c.restore(); }
  function pearls(c, pts, r) { for (let i = 0; i < pts.length; i++) { const [x, y] = pts[i], g = c.createRadialGradient(x - r * .35, y - r * .35, r * .1, x, y, r); g.addColorStop(0, '#ffffff'); g.addColorStop(.6, '#f2e6e0'); g.addColorStop(1, '#b8a8a4'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); } }
  const pearlArc = (cx, cy, rx, ry, a0, a1, n) => Array.from({ length: n }, (_, i) => { const a = lerp(a0, a1, i / (n - 1)); return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  function lipstick(c, x, y, s, rot = 0) {
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(s / 100, s / 100);
    c.fillStyle = goldBevel(c, -30, 0, 30, 0); c.fillRect(-30, 0, 60, 120); c.fillStyle = '#1a0a10'; c.fillRect(-30, 40, 60, 10);
    c.fillStyle = goldBevel(c, -24, 0, 24, 0); c.fillRect(-24, -40, 48, 40);
    const g = c.createLinearGradient(-20, 0, 20, 0); g.addColorStop(0, '#9a0a2a'); g.addColorStop(.5, '#ff3a6a'); g.addColorStop(1, '#8a0a24'); c.fillStyle = g; c.beginPath(); c.moveTo(-20, -40); c.lineTo(-20, -90); c.lineTo(20, -120); c.lineTo(20, -40); c.fill();
    c.restore();
  }
  function crown(c, x, y, s) {
    c.save(); c.translate(x, y); c.scale(s / 100, s / 100);
    c.fillStyle = goldBevel(c, -100, -100, 100, 20); c.beginPath(); c.moveTo(-100, 20); c.lineTo(-110, -70); c.lineTo(-55, -20); c.lineTo(0, -100); c.lineTo(55, -20); c.lineTo(110, -70); c.lineTo(100, 20); c.closePath(); c.fill();
    for (const [gx, gy, col] of [[-110, -76, '#e8337f'], [0, -108, '#4ac0ff'], [110, -76, '#e8337f'], [-50, 0, '#4ac0ff'], [0, 0, '#e8337f'], [50, 0, '#4ac0ff']]) K.gem(c, gx, gy, 12, col);
    c.restore();
  }
  function tambola(c, x, y, s, R) {
    c.save(); c.translate(x, y); c.scale(s / 100, s / 100); c.rotate(-.06);
    c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(-176, -66, 360, 140); c.fillStyle = '#fffdf6'; c.fillRect(-180, -72, 360, 140);
    c.strokeStyle = PINK; c.lineWidth = 2; for (let i = 0; i <= 9; i++) { c.beginPath(); c.moveTo(-180 + i * 40, -72); c.lineTo(-180 + i * 40, 68); c.stroke(); } for (let j = 0; j <= 3; j++) { c.beginPath(); c.moveTo(-180, -72 + j * 46.7); c.lineTo(180, -72 + j * 46.7); c.stroke(); }
    c.fillStyle = BLACK; c.font = '24px "Fredoka"'; c.textAlign = 'center'; c.textBaseline = 'middle';
    for (let j = 0; j < 3; j++) for (let i = 0; i < 9; i++) if ((i + j * 2) % 3 !== 1) { const n = i * 10 + 1 + Math.floor(R() * 9); c.fillText(String(n), -160 + i * 40, -49 + j * 46.7); if ((i * 7 + j) % 5 === 0) { c.strokeStyle = 'rgba(232,51,127,.8)'; c.lineWidth = 4; c.beginPath(); c.arc(-160 + i * 40, -49 + j * 46.7, 15, 0, TAU); c.stroke(); } }
    c.restore();
  }
  function ball(c, x, y, r, n, col) { const g = c.createRadialGradient(x - r * .35, y - r * .35, r * .1, x, y, r); g.addColorStop(0, '#ffffff'); g.addColorStop(.5, col); g.addColorStop(1, '#5a0a2a'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y, r * .5, 0, TAU); c.fill(); c.fillStyle = BLACK; c.font = `${Math.round(r * .55)}px "Fredoka"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(n), x, y + 2); }
  function cakeStand(c, x, y, s) {
    c.save(); c.translate(x, y); c.scale(s / 100, s / 100);
    c.strokeStyle = goldBevel(c, -10, -260, 10, 0); c.lineWidth = 8; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -300); c.stroke();
    [[0, 150], [-110, 115], [-215, 80]].forEach(([yy, r], i) => {
      c.fillStyle = '#fffaf6'; c.beginPath(); c.ellipse(0, yy, r, r * .18, 0, 0, TAU); c.fill(); c.strokeStyle = '#e8b84a'; c.lineWidth = 3; c.stroke();
      const n = 5 - i; for (let j = 0; j < n; j++) { const cx = -r * .7 + j * (r * 1.4 / Math.max(1, n - 1)), cols = ['#ff8fbf', '#ffd27a', '#b8e0c8', '#d9b8ff'];
        c.fillStyle = cols[(j + i) % 4]; rrect(c, cx - 22, yy - 40, 44, 34, 10); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(cx, yy - 42, 14, Math.PI, 0); c.fill(); c.fillStyle = '#d01848'; c.beginPath(); c.arc(cx, yy - 56, 6, 0, TAU); c.fill(); }
    });
    c.fillStyle = goldBevel(c, -10, -320, 10, -300); c.beginPath(); c.arc(0, -306, 10, 0, TAU); c.fill(); c.restore();
  }
  function discoBall(c, x, y, r, t) {
    glow(c, x, y, r * 2.2, 'rgba(255,200,240,.35)');
    c.save(); c.beginPath(); c.arc(x, y, r, 0, TAU); c.clip();
    c.fillStyle = '#3a3040'; c.fillRect(x - r, y - r, r * 2, r * 2);
    const n = 24, rot = t * .5;
    for (let j = 0; j < n; j++) { const lat = -Math.PI / 2 + (j + .5) / n * Math.PI, cy = y + Math.sin(lat) * r, rr = Math.cos(lat) * r, m = Math.max(6, Math.round(n * 2 * Math.cos(lat))), h = Math.PI / n * r * Math.cos(lat * .9) * .94 + 2;
      for (let i = 0; i < m; i++) { const lon = i / m * TAU + rot, vis = Math.cos(lon); if (vis < .02) continue; const cx = x + Math.sin(lon) * rr, w = TAU / m * rr * vis * .9;
        const spec = Math.max(0, Math.sin(lon * 1.3 - .9) * Math.cos(lat + .6)), tw = (Math.sin(i * 12.9 + j * 7.3 + t * 5) + 1) / 2;
        const l = 38 + vis * 30 + spec * 30 + (tw > .93 ? 30 : 0), hue = (i * 37 + j * 53) % 3 === 0 ? 320 : (i + j) % 5 === 0 ? 200 : 280;
        c.fillStyle = `hsl(${hue},${12 + spec * 30}%,${Math.min(97, l)}%)`; c.fillRect(cx - w / 2, cy - h / 2, Math.max(1, w), h); } }
    const g = c.createRadialGradient(x - r * .4, y - r * .45, r * .05, x, y, r); g.addColorStop(0, 'rgba(255,255,255,.45)'); g.addColorStop(.35, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(30,0,30,.55)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
    c.restore();
    for (let i = 0; i < 6; i++) { const a = i * 1.1 + t * .3, sx = x + Math.cos(a) * r * .75, sy = y + Math.sin(a * 1.3) * r * .7, tw = Math.max(0, Math.sin(t * 4 + i * 2)); if (tw > .3) star(c, sx, sy, 30 * tw, '#ffffff'); }
  }
  function star(c, x, y, s, col) { c.save(); c.translate(x, y); c.fillStyle = col; c.beginPath(); c.moveTo(0, -s); c.quadraticCurveTo(0, 0, s, 0); c.quadraticCurveTo(0, 0, 0, s); c.quadraticCurveTo(0, 0, -s, 0); c.quadraticCurveTo(0, 0, 0, -s); c.fill(); c.restore(); glow(c, x, y, s * 1.6, 'rgba(255,255,255,.5)'); }
  function flashes(c, t, n, seed, y0, y1) {
    const R = rng(seed);
    for (let i = 0; i < n; i++) { const x = R() * W, y = y0 + R() * (y1 - y0), per = 1.2 + R() * 1.8, ph = ((t + R() * per) % per) / per; if (ph < .12) { const a = 1 - ph / .12; glow(c, x, y, 160 * a + 40, `rgba(255,255,255,${(.8 * a).toFixed(2)})`); star(c, x, y, 34 * a + 6, '#ffffff'); } }
  }
  function sequins(c, w, h, R, cols) { for (let i = 0; i < w * h / 900; i++) { c.fillStyle = cols[Math.floor(R() * cols.length)]; c.globalAlpha = .15 + R() * .4; c.beginPath(); c.arc(R() * w, R() * h, 2 + R() * 5, 0, TAU); c.fill(); } c.globalAlpha = 1; }
  function barcode(c, x, y, w, h, R) { c.fillStyle = '#fff'; c.fillRect(x - 10, y - 10, w + 20, h + 46); c.fillStyle = BLACK; let xx = x; while (xx < x + w) { const bw = 2 + Math.floor(R() * 4); if (R() > .4) c.fillRect(xx, y, bw, h); xx += bw + 1; } c.font = '20px "Fredoka"'; c.textAlign = 'center'; c.fillText('8 901234 567890', x + w / 2, y + h + 22); }

  // ---- still art ----
  function marbleArt(k) {
    return art('gl-marble', W, H, k, c => {
      const R = rng(7);
      const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#fbe4ea'); g.addColorStop(.5, '#f6d2dc'); g.addColorStop(1, '#efc2d0'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 26; i++) { c.strokeStyle = `rgba(${R() > .5 ? '255,255,255' : '190,130,150'},${.2 + R() * .3})`; c.lineWidth = 1 + R() * 3; let x = R() * W, y = R() * H; c.beginPath(); c.moveTo(x, y); for (let j = 0; j < 8; j++) { x += (R() - .3) * 180; y += (R() - .5) * 160; c.lineTo(x, y); } c.stroke(); }
      for (let i = 0; i < 6; i++) { c.strokeStyle = 'rgba(214,170,90,.5)'; c.lineWidth = 2; let x = R() * W, y = R() * H; c.beginPath(); c.moveTo(x, y); for (let j = 0; j < 6; j++) { x += (R() - .4) * 220; y += (R() - .5) * 200; c.lineTo(x, y); } c.stroke(); }
      // props on the table around the magazine
      shades(c, 880, 230, 150, .4); lipstick(c, 150, 1650, 140, -.9); lips(c, 900, 1720, 90, '#ff3a6a');
      pearls(c, pearlArc(170, 260, 170, 120, .2, 3.4, 26), 11);
      for (let i = 0; i < 9; i++) rose(c, 950 + (R() - .5) * 160, 1060 + (R() - .5) * 220, 26 + R() * 10, '#ffc0d0', '#e0507a', R() * 3);
      teacup(c, 140, 900, 110);
    });
  }
  // a magazine cover, n: 0 lips & shades, 1 the cocktail, 2 heels & pearls (760 × 1010)
  const CV = { w: 760, h: 1010 };
  function coverArt(k, n, card) {
    const name = club(card);
    return art(`gl-cover-${n}-${name}`, CV.w, CV.h, k, c => {
      const R = rng(40 + n), bgs = [['#ff5c9d', '#c2185b'], ['#1a1420', '#3a1a3a'], ['#ffd9e6', '#f39ab8']][n], light = n === 2;
      const g = c.createLinearGradient(0, 0, 0, CV.h); g.addColorStop(0, bgs[0]); g.addColorStop(1, bgs[1]); c.fillStyle = g; c.fillRect(0, 0, CV.w, CV.h);
      sequins(c, CV.w, CV.h, R, light ? ['#ffffff', '#e8b84a'] : ['#ffffff', '#ffd27a', '#ff9ac4']);
      c.textAlign = 'center'; c.textBaseline = 'alphabetic';
      if (n === 0) { glow(c, 380, 600, 380, 'rgba(255,255,255,.35)'); lips(c, 380, 640, 300, '#d01848'); shades(c, 380, 460, 260, -.08); }
      if (n === 1) { glow(c, 380, 560, 380, 'rgba(255,90,170,.4)'); martini(c, 380, 640, 230); for (let i = 0; i < 12; i++) star(c, 160 + R() * 440, 300 + R() * 420, 8 + R() * 14, '#ffd27a'); }
      if (n === 2) { glow(c, 380, 620, 380, 'rgba(255,255,255,.6)'); heel(c, 400, 600, 250, '#c2185b'); pearls(c, pearlArc(380, 760, 260, 70, 0, Math.PI, 30), 12); }
      c.fillStyle = light ? BLACK : '#ffffff'; c.font = '200px "Gilda Display"'; spacing(c, 6); c.fillText('GLAM', CV.w / 2, 220); spacing(c, 0);
      c.font = '22px "Cinzel"'; spacing(c, 8); c.fillText(['THE KITTY ISSUE', 'THE PARTY ISSUE', 'THE STYLE ISSUE'][n], CV.w / 2, 260); spacing(c, 0);
      c.textAlign = 'left'; c.font = '34px "Gilda Display"'; c.fillStyle = light ? HOT : '#ffd27a';
      [['Kitty Secrets', 'Party Season'], ['Mocktails & Mixers', 'After Dark'], ['Best Dressed', 'Pearls & Heels']][n].forEach((ln, i) => { c.fillText(ln, 40, 380 + i * 120); c.font = 'italic 24px "Cormorant Garamond"'; c.fillStyle = light ? BLACK : '#ffffff'; c.fillText('the inside story', 40, 412 + i * 120); c.font = '34px "Gilda Display"'; c.fillStyle = light ? HOT : '#ffd27a'; });
      c.textAlign = 'center'; c.fillStyle = light ? BLACK : '#ffffff'; c.font = '60px "Satisfy"'; c.fillText(name, CV.w / 2, 900, 700);
      barcode(c, 600, 940, 120, 40, R);
      const sh = c.createLinearGradient(0, 0, CV.w, CV.h); sh.addColorStop(0, 'rgba(255,255,255,.22)'); sh.addColorStop(.35, 'rgba(255,255,255,0)'); sh.addColorStop(.7, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(255,255,255,.12)'); c.fillStyle = sh; c.fillRect(0, 0, CV.w, CV.h);
    });
  }
  const insideArt = k => art('gl-inside', CV.w, CV.h, k, c => { c.fillStyle = '#fff6f2'; c.fillRect(0, 0, CV.w, CV.h); c.fillStyle = 'rgba(20,16,20,.12)'; for (let y = 120; y < CV.h - 80; y += 24) c.fillRect(60, y, CV.w - 120 - (y % 96 === 0 ? 200 : 0), 6); c.fillStyle = PINK; c.fillRect(60, 60, 220, 30); });
  // the cover star: the full-screen cover with the club as its headline (words over it are drawn live)
  function starArt(k) {
    return art('gl-star', W, H, k, c => {
      const R = rng(77);
      const g = c.createRadialGradient(540, 900, 100, 540, 960, 1300); g.addColorStop(0, '#ff6aa8'); g.addColorStop(.6, '#d01868'); g.addColorStop(1, '#6a0838'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      sequins(c, W, H, R, ['#ffffff', '#ffd27a', '#ffb0d0']);
      c.fillStyle = BLACK; c.fillRect(0, 0, W, 70); c.fillStyle = '#ffd27a'; c.font = '28px "Cinzel"'; c.textAlign = 'center'; c.textBaseline = 'middle'; spacing(c, 10); c.fillText('THE KITTY ISSUE  ·  COLLECTOR’S EDITION', W / 2, 36); spacing(c, 0);
      c.fillStyle = '#ffffff'; c.font = '330px "Gilda Display"'; c.textBaseline = 'alphabetic'; spacing(c, 10); c.fillText('GLAM', W / 2, 400); spacing(c, 0);
      // props around where the disco ball hangs
      heel(c, 200, 1690, 190, '#ffd27a'); martini(c, 900, 1640, 140, '#ffd27a');
      pearls(c, pearlArc(540, 1250, 360, 90, .1, Math.PI - .1, 34), 13);
      const R2 = rng(5); barcode(c, 860, 1700, 150, 60, R2);
      c.fillStyle = '#ffffff'; c.font = '30px "Cinzel"'; c.textAlign = 'left'; spacing(c, 4); c.fillText('₹ PRICELESS', 60, 1760); spacing(c, 0);
    });
  }
  // the runway in perspective: lights along its edges, the audience, a step-and-repeat wall at the far end
  const VPY = 760;
  function runwayArt(k, name) {
    return art(`gl-runway-${name}`, W, H, k, c => {
      const R = rng(12);
      c.fillStyle = '#0c0810'; c.fillRect(0, 0, W, H);
      // the wall at the end with the club's name repeated
      c.fillStyle = '#fff2f6'; c.fillRect(250, 360, 580, 400);
      c.fillStyle = HOT; c.font = '30px "Gilda Display"'; c.textAlign = 'center'; c.textBaseline = 'middle';
      for (let y = 390; y < 760; y += 52) for (let x = 250 + ((y - 390) / 52 % 2) * 90; x < 860; x += 180) { c.fillText('GLAM', x, y); }
      c.fillStyle = 'rgba(255,255,255,.85)'; rrect(c, 300, 500, 480, 130, 16); c.fill(); c.fillStyle = BLACK; c.font = '52px "Satisfy"'; c.fillText(name, 540, 568, 440);
      // the runway floor
      const rg = c.createLinearGradient(0, VPY, 0, H); rg.addColorStop(0, '#2a1a26'); rg.addColorStop(1, '#0e0a10'); c.fillStyle = rg; c.beginPath(); c.moveTo(440, VPY); c.lineTo(640, VPY); c.lineTo(980, H); c.lineTo(100, H); c.fill();
      const rf = c.createLinearGradient(0, VPY, 0, H); rf.addColorStop(0, 'rgba(255,240,248,.5)'); rf.addColorStop(1, 'rgba(255,120,190,.12)'); c.fillStyle = rf; c.beginPath(); c.moveTo(500, VPY); c.lineTo(580, VPY); c.lineTo(700, H); c.lineTo(380, H); c.fill();
      c.strokeStyle = '#e8b84a'; c.lineWidth = 3; c.beginPath(); c.moveTo(440, VPY); c.lineTo(100, H); c.moveTo(640, VPY); c.lineTo(980, H); c.stroke();
      // the audience: rows of heads either side
      for (const d of [-1, 1]) for (let row = 0; row < 7; row++) { const u = row / 6, y = lerp(VPY + 40, H - 80, u), sz = lerp(16, 60, u); for (let i = 0; i < 6; i++) { const x = 540 + d * (lerp(120, 470, u) + i * sz * 2.1 + R() * 6); if (x < -40 || x > W + 40) continue; c.fillStyle = `rgba(${30 + R() * 20},${16 + R() * 10},${30 + R() * 20},1)`; c.beginPath(); c.arc(x, y - sz * 1.4, sz * .6, 0, TAU); c.fill(); c.beginPath(); c.ellipse(x, y, sz, sz * .9, 0, Math.PI, 0); c.fill(); } }
      // a lighting truss at the top
      c.strokeStyle = '#3a3040'; c.lineWidth = 10; c.beginPath(); c.moveTo(0, 150); c.lineTo(W, 150); c.moveTo(0, 190); c.lineTo(W, 190); c.stroke(); c.lineWidth = 4; for (let x = 0; x < W; x += 40) { c.beginPath(); c.moveTo(x, 150); c.lineTo(x + 40, 190); c.stroke(); }
    });
  }
  // a magazine page (editor's note and features): white with a colour block and a page number
  function pageArt(k, n) {
    return art(`gl-page-${n % 3}`, W, H, k, c => {
      const R = rng(60 + n), col = [PINK, BLACK, '#f39ab8'][n % 3];
      c.fillStyle = CREAM; c.fillRect(0, 0, W, H);
      c.fillStyle = col; c.fillRect(0, 1180, W, H - 1180);
      sequins(c, W, H - 1180 > 0 ? H : 0, rng(3), ['#ffffff']);
      c.fillStyle = CREAM; c.fillRect(0, 0, W, 1180);
      c.fillStyle = col; c.fillRect(60, 120, 10, 1000); c.fillRect(W - 70, 120, 10, 1000);
      c.strokeStyle = 'rgba(184,134,43,.6)'; c.lineWidth = 2; c.strokeRect(100, 150, W - 200, 1010);
      c.fillStyle = 'rgba(20,16,20,.4)'; c.font = '26px "Cinzel"'; c.textAlign = 'left'; c.textBaseline = 'middle'; spacing(c, 6); c.fillText('GLAM', 100, 90); c.textAlign = 'right'; c.fillText(`P. ${String(12 + n * 6).padStart(2, '0')}`, W - 100, 90); spacing(c, 0);
    });
  }
  function vipArt(k) {
    return art('gl-vip', W, H, k, c => {
      const R = rng(81);
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1a0820'); g.addColorStop(1, '#3a0a30'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 40; i++) { const x = R() * W, y = R() * H, r = 30 + R() * 90; const gg = c.createRadialGradient(x, y, 0, x, y, r); const col = R() > .5 ? '255,90,170' : '255,210,120'; gg.addColorStop(0, `rgba(${col},.35)`); gg.addColorStop(1, `rgba(${col},0)`); c.fillStyle = gg; c.fillRect(x - r, y - r, r * 2, r * 2); }
    });
  }
  function passArt(k) {
    return art('gl-pass', 900, 1460, k, c => {
      c.save(); c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 50; c.shadowOffsetY = 24; c.fillStyle = BLACK; rrect(c, 20, 20, 860, 1420, 40); c.fill(); c.restore();
      const g = c.createLinearGradient(20, 20, 880, 1440); g.addColorStop(0, '#241a24'); g.addColorStop(.5, '#100c10'); g.addColorStop(1, '#2a1424'); c.fillStyle = g; rrect(c, 20, 20, 860, 1420, 40); c.fill();
      sequins(c, 900, 1460, rng(9), ['#ffd27a', '#ff8fc4']);
      c.strokeStyle = goldBevel(c, 20, 20, 880, 1440); c.lineWidth = 8; rrect(c, 40, 40, 820, 1380, 30); c.stroke(); c.lineWidth = 2; rrect(c, 60, 60, 780, 1340, 24); c.stroke();
      c.fillStyle = '#0c080c'; rrect(c, 400, 50, 100, 26, 13); c.fill();
      c.fillStyle = PINK; c.fillRect(40, 1330, 820, 60); c.fillStyle = '#fff'; c.font = '30px "Cinzel"'; c.textAlign = 'center'; c.textBaseline = 'middle'; spacing(c, 12); c.fillText('GLAM · THE KITTY ISSUE', 450, 1361); spacing(c, 0);
    });
  }
  function backArt(k) {
    return art('gl-back', W, H, k, c => {
      const R = rng(91);
      const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#fff0f5'); g.addColorStop(1, '#ffd6e4'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      sequins(c, W, H, R, ['#e8b84a', '#ff8fbf']);
      c.fillStyle = HOT; c.fillRect(0, 0, W, 110); c.fillStyle = '#fff'; c.font = '70px "Gilda Display"'; c.textAlign = 'center'; c.textBaseline = 'middle'; spacing(c, 14); c.fillText('GLAM', W / 2, 58); spacing(c, 0);
      teacup(c, 880, 1640, 120); martini(c, 200, 1600, 130); lips(c, 540, 1760, 70, '#d01848');
      pearls(c, pearlArc(540, 200, 520, 120, .15, Math.PI - .15, 40), 10);
    });
  }

  const TITLES = [[/tambola|housie|bingo|तंबोला|हाउजी/i, 'Feature · Lucky Numbers'], [/dress|best|contest|queen|crown|ramp|ड्रेस|प्रतियोगिता/i, 'Feature · The Style Edit'],
    [/tea|high tea|snack|चाय/i, 'Feature · Tea & Gossip'], [/cocktail|mocktail|drink|bar|ड्रिंक/i, 'Feature · Mixology'], [/lunch|dinner|brunch|food|खाना|लंच|डिनर/i, 'Feature · The Menu'],
    [/game|games|गेम|खेल/i, 'Feature · Game On'], [/dance|dj|disco|डांस/i, 'Feature · After Dark']];
  const kindOf = name => /tambola|housie|bingo|तंबोला|हाउजी/i.test(name) ? 'tambola' : /dress|best|contest|queen|crown|ramp|ड्रेस|प्रतियोगिता/i.test(name) ? 'style' : /tea|snack|चाय|cake/i.test(name) ? 'tea' : /cocktail|mocktail|drink|bar|dance|dj|disco/i.test(name) ? 'drinks' : 'glam';

  return {
    id: 'story-glam', order: 24, occasion: 'kitty', tune: 'festive', thumb: 9.2,
    name: 'The Glam Issue', note: 'Glossy magazine covers flip to the club as Cover Star, the runway lights up, every game gets a feature page and the date comes on a VIP pass',
    names: ['Divas & Desserts Club', ''],
    looks: { open: 'disco-champagne', title: 'disco-champagne', invite: 'disco-champagne', events: ['disco-champagne'], date: 'disco-champagne', end: 'disco-champagne', final: 'disco-champagne' },
    titles: TITLES,
    look(kind, K) {
      if (kind === 'page' || kind === 'feature' || kind === 'back') return K.palette('blush-champagne', { font: { script: 'Satisfy', serif: 'Gilda Display' }, col: { names: HOT, ink: BLACK, ink2: '#4a3a44', accent: '#b8862b', gold: '#b8862b' }, shadow: ['rgba(255,255,255,.9)', 8], fx: (c, t) => K.sparks(c, t, 8, '#e8b84a', 3) });
      return K.palette('disco-champagne', { font: { script: 'Satisfy', serif: 'Gilda Display' }, col: { names: '#ffd27a', ink: '#ffffff', ink2: '#ffd9ea', accent: '#ff8fc4', gold: '#ffd27a' }, fx: (c, t) => K.sparks(c, t, 10, '#ffd27a', 5) });
    },
    timeline(S) {
      const at = k => S.findIndex(s => s.k === k);
      S.splice(at('open'), 1, { k: 'reel', reel: 'covers', name: 'The Covers', d: 7 });
      const ti = S[at('title')]; Object.assign(ti, { reel: 'star', d: 6.5, change: 'flash', cut: true }); delete ti.couple; delete ti.zone;
      S.splice(at('title') + 1, 0, { k: 'reel', reel: 'runway', name: 'The Runway', d: 6, change: 'flash' });
      Object.assign(S[at('invite')], { reel: 'page', d: 7, board: false, zone: [400, 1120, 760], change: 'wipe' });
      if (at('end') >= 0) S.splice(at('end'), 1);
      const evs = S.filter(s => s.k === 'event'), fixed = S.filter(s => s.k !== 'event').reduce((a, s) => a + s.d, 0);
      const d = evs.length ? clamp((59 - fixed) / evs.length, 3.5, 4.8) : 0;
      evs.forEach((s, i) => { Object.assign(s, { reel: 'feature', d, datebar: true, board: false, zone: [300, 1120, 760], change: i % 2 ? 'wipe' : 'flash' }); delete s.couple; delete s.coupleEntry; });
      const dt = S[at('date')]; if (dt) Object.assign(dt, { reel: 'vip', board: false, zone: [420, 1560, 720], change: 'flash' });
      const fi = S[at('final')]; if (fi) Object.assign(fi, { reel: 'back', change: 'wipe', board: false, zone: [380, 1460, 820] });
      ti.d = 6.5;
    },
    shots: {
      covers(c, s, pt, t, P) {
        const k = kOf(P), card = P.card, hi = hiOf(P);
        // the magazine on the table: three covers flip over (on their spine), then we fly into the last one
        const into = clamp((pt - 5.4) / (s.d - 5.4)) ** 2, mx = 160, my = 420;
        const zC = K.fillZoom(CV.w, CV.h, 1.0);
        let cam = camAt(pt, [[0, { x: 540, y: 960, z: 1.06, r: -.05 }], [5.4, { x: 540, y: 940, z: 1.0, r: 0 }]]);
        cam = { x: lerp(cam.x, mx + CV.w / 2, into), y: lerp(cam.y, my + CV.h / 2, into), z: lerp(cam.z, zC, into), r: lerp(cam.r, 0, into) };
        c.save(); camera(c, cam);
        c.drawImage(marbleArt(k), 0, 0, W, H);
        c.fillStyle = 'rgba(80,20,40,.3)'; c.fillRect(mx + 18, my + 26, CV.w, CV.h);
        // the cover that stays on top is the Cover Star's (drawn as the star art, cropped)
        c.drawImage(starArt(k), mx, my, CV.w, CV.h);
        c.save(); c.beginPath(); c.rect(mx, my, CV.w, CV.h); c.clip(); c.translate(mx, my); c.scale(CV.w / W, CV.h / H); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 3; c.beginPath(); c.moveTo(540, 70); c.lineTo(540, 600); c.stroke(); discoBall(c, 540, 860, 270, t); c.restore();
        for (let n = 2; n >= 0; n--) {
          const u = ease3((pt - (1.2 + n * 1.25)) / 1.0);
          if (u >= 1) continue;
          pageTurn(c, u, mx, my, CV.w, CV.h, coverArt(k, n, card), insideArt(k), { strips: 24, depth: .1 });
        }
        c.restore();
        flashes(c, t, 4, 3, 100, 1800);
        const a = ease((pt - .3) / .7) * (1 - ease((pt - 4.6) / .6));
        if (a > .01) { c.save(); c.globalAlpha = a; c.fillStyle = BLACK; rrect(c, 190, 120, 700, 110, 55); c.fill(); c.fillStyle = '#ffffff'; c.font = hi ? '52px "Tiro Devanagari Hindi"' : '44px "Cinzel"'; c.textAlign = 'center'; c.textBaseline = 'middle'; spacing(c, hi ? 0 : 10);
          c.fillText(hi ? 'नया अंक आ गया है!' : 'THE NEW ISSUE', W / 2, 176); spacing(c, 0); c.restore(); }
        if (into > .7) { c.fillStyle = `rgba(255,255,255,${((into - .7) / .3).toFixed(2)})`; c.fillRect(0, 0, W, H); }
      },
      star(c, s, pt, t, P) {
        const k = kOf(P), card = P.card, hi = hiOf(P);
        const z = 1.0 + .04 * ease3(pt / s.d);
        c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2);
        c.drawImage(starArt(k), 0, 0, W, H);
        // the disco ball hangs over the masthead and turns
        c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 3; c.beginPath(); c.moveTo(540, 70); c.lineTo(540, 600); c.stroke();
        discoBall(c, 540, 860, 270, t);
        c.restore();
        // the headline: the club as Cover Star, the date as the issue, the games as cover lines
        const tag = ease3((pt - .4) / .6);
        if (tag > .01) { c.save(); c.translate(820, 560); c.rotate(.18); c.scale(tag, tag); c.fillStyle = '#ffd27a'; c.beginPath(); for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, r = i % 2 ? 120 : 140; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.fill();
          c.fillStyle = BLACK; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = hi ? '40px "Tiro Devanagari Hindi"' : '36px "Cinzel"'; c.fillText(hi ? 'कवर' : 'COVER', 0, -22); c.fillText(hi ? 'स्टार' : 'STAR', 0, 22); c.restore(); }
        const name = club(card), na = ease((pt - .8) / .8);
        c.save(); c.globalAlpha = na; c.textAlign = 'center'; c.textBaseline = 'middle';
        let fs = 120; c.font = `${fs}px "Satisfy"`; while (c.measureText(name).width > 980 && fs > 60) { fs -= 4; c.font = `${fs}px "Satisfy"`; }
        c.fillStyle = 'rgba(60,0,30,.5)'; c.fillText(name, W / 2 + 4, 1330 + 6); c.fillStyle = '#ffffff'; c.fillText(name, W / 2, 1330);
        const tl = noEmoji(card.tagline || card.title); if (tl) { c.font = hi ? '42px "Tiro Devanagari Hindi"' : 'italic 46px "Cormorant Garamond"'; c.fillStyle = '#fff2f8'; c.fillText(hi ? 'आपको हमारी किटी पार्टी में आमन्त्रित करता है' : tl, W / 2, 1430, 960); }
        c.fillStyle = BLACK; rrect(c, 290, 1490, 500, 70, 35); c.fill(); c.fillStyle = '#ffd27a'; c.font = hi ? '38px "Tiro Devanagari Hindi"' : '32px "Cinzel"'; spacing(c, hi ? 0 : 6); c.fillText(dateRange(card, hi) || issue(card), W / 2, 1526); spacing(c, 0);
        c.restore();
        // the cover lines slide in from the left: the club's games
        const evs = K.events(card).slice(0, 3);
        evs.forEach((e, i) => { const a = ease3((pt - 1.2 - i * .25) / .6); if (a < .01) return; const { name: nm } = splitIcon(e.name);
          c.save(); c.globalAlpha = a; c.translate((1 - a) * -200, 0); c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = '#ffd27a'; c.font = '700 64px "Cinzel Decorative"'; c.fillText(String(i + 1), 50, 520 + i * 130);
          c.fillStyle = '#ffffff'; c.font = '40px "Gilda Display"'; c.fillText(noEmoji(nm), 110, 506 + i * 130, 330); c.font = 'italic 28px "Cormorant Garamond"'; c.fillStyle = '#ffe0ee'; c.fillText(hi ? 'अंदर पढ़ें' : 'inside, page ' + (12 + i * 6), 110, 546 + i * 130); c.restore(); });
        flashes(c, t, 6, 11, 200, 1800);
      },
      runway(c, s, pt, t, P) {
        const k = kOf(P), card = P.card, hi = hiOf(P);
        const cam = camAt(pt, [[0, { x: 540, y: 1100, z: 1.18 }], [s.d, { x: 540, y: 960, z: 1.0 }]]);
        c.save(); camera(c, cam);
        c.drawImage(runwayArt(k, club(card)), 0, 0, W, H);
        // bulbs chase along the runway's edges
        for (const d of [-1, 1]) for (let i = 0; i < 18; i++) { const u = (i / 18) ** 1.4, x = lerp(540 + d * 100, 540 + d * 440, u), y = lerp(VPY, H, u), on = (Math.floor(t * 8) - i) % 4 === 0 ? 1 : .35; glow(c, x, y, lerp(14, 46, u) * (1 + on), `rgba(255,220,240,${(on * .8).toFixed(2)})`); c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y, lerp(3, 9, u), 0, TAU); c.fill(); }
        // three spotlights sweep over the runway
        c.save(); c.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 3; i++) { const sx = 200 + i * 340, a = Math.sin(t * .9 + i * 2.1) * .35, len = 1800; c.save(); c.translate(sx, 170); c.rotate(a);
          const g = c.createLinearGradient(0, 0, 0, len); g.addColorStop(0, `rgba(255,${[180, 230, 160][i]},${[230, 200, 255][i]},.2)`); g.addColorStop(1, 'rgba(255,200,240,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(-14, 0); c.lineTo(14, 0); c.lineTo(190, len); c.lineTo(-190, len); c.fill(); c.restore(); }
        c.restore();
        c.restore();
        flashes(c, t, 10, 21, 900, 1800);
        K.confetti(c, t, 26, ['#ffd27a', '#ff8fc4', '#ffffff'], 8);
        const a = ease((pt - .6) / .8) * (1 - ease((pt - (s.d - .5)) / .5));
        if (a > .01) {
          c.save(); c.globalAlpha = a; const g = c.createLinearGradient(0, 1250, 0, 1750); g.addColorStop(0, 'rgba(12,8,16,0)'); g.addColorStop(.4, 'rgba(12,8,16,.7)'); g.addColorStop(1, 'rgba(12,8,16,0)'); c.fillStyle = g; c.fillRect(0, 1250, W, 500);
          const title = hi ? 'पार्टी का समय है, लेडीज़!' : (noEmoji(card.title) || 'Ladies, it’s party time!');
          foil(c, title, W / 2, 1440, { font: hi ? '78px "Amita"' : '96px "Satisfy"', t });
          c.fillStyle = '#ffd9ea'; c.font = hi ? '40px "Tiro Devanagari Hindi"' : '34px "Cinzel"'; c.textAlign = 'center'; c.textBaseline = 'middle'; spacing(c, hi ? 0 : 10); c.fillText(hi ? 'रनवे आपका इंतज़ार कर रहा है' : 'THE RUNWAY IS YOURS', W / 2, 1560); spacing(c, 0); c.restore();
        }
      },
      page(c, s, pt, t, P) {
        const k = kOf(P), hi = hiOf(P);
        c.drawImage(pageArt(k, 0), 0, 0, W, H);
        c.textAlign = 'center'; c.textBaseline = 'middle';
        const a = ease((pt - .1) / .6);
        c.save(); c.globalAlpha = a; c.fillStyle = HOT; c.font = hi ? '72px "Amita"' : '84px "Gilda Display"'; spacing(c, hi ? 0 : 6); c.fillText(hi ? 'संपादक की ओर से' : 'EDITOR’S NOTE', W / 2, 300); spacing(c, 0);
        c.fillStyle = HOT; c.fillRect(W / 2 - 80, 370, 160, 4);
        c.fillStyle = '#4a3a44'; c.font = hi ? '40px "Tiro Devanagari Hindi"' : 'italic 44px "Cormorant Garamond"'; c.fillText(hi ? 'इस अंक की सबसे ख़ास ख़बर…' : 'The only headline that matters this month…', W / 2, 450);
        c.fillStyle = HOT; c.font = hi ? '60px "Amita"' : '80px "Satisfy"'; c.fillText(hi ? 'ढेर सारा प्यार' : 'xoxo', W / 2 - 60, 1030); lips(c, W / 2 + 130, 1030, 50, '#d01848');
        c.fillStyle = 'rgba(232,51,127,.2)'; c.font = '300px "Gilda Display"'; c.fillText('“', 190, 420); c.fillText('”', 890, 1090); c.restore();
        // a little still life of the party at the foot of the page
        const rise = (1 - ease3(pt / 1.2)) * 120;
        teacup(c, 260, 1500 + rise, 150); steam(c, 260, 1380 + rise, t, 1.2); cakeStand(c, 600, 1780 + rise, 130); martini(c, 880, 1560 + rise, 150);
        pearls(c, pearlArc(540, 1840 + rise, 460, 60, Math.PI + .1, TAU - .1, 30), 10);
      },
      feature(c, s, pt, t, P) {
        const k = kOf(P), i = s.i || 0, name = s.e ? s.e.name : '', kind = kindOf(name);
        c.drawImage(pageArt(k, i + 1), 0, 0, W, H);
        // a giant page number and the feature's own picture in the colour block
        c.save(); c.fillStyle = [PINK, BLACK, '#f39ab8'][(i + 1) % 3]; c.font = '700 150px "Cinzel Decorative"'; c.textAlign = 'right'; c.textBaseline = 'middle'; c.globalAlpha = .9; c.fillText(String(i + 1).padStart(2, '0'), W - 130, 1060); c.font = '26px "Cinzel"'; spacing(c, 8); c.textAlign = 'left'; c.fillText('FEATURE', 130, 1100); spacing(c, 0); c.restore();
        const rise = (1 - ease3(pt / 1)) * 140, by = 1560 + rise, R = rng(i + 4);
        if (kind === 'tambola') { tambola(c, 540, by - 60, 190, R); [[200, 1420, 7, PINK], [880, 1460, 42, '#ffd27a'], [300, 1760, 88, '#4ac0ff'], [800, 1780, 15, '#9be37a']].forEach(([x, y, n, col], j) => ball(c, x, y + rise + Math.abs(Math.sin(t * 3 + j)) * -30, 56, n, col)); }
        else if (kind === 'style') { crown(c, 540, by - 150, 150); heel(c, 300, by + 140, 150, '#ffd27a'); heel(c, 760, by + 140, 150, '#ffffff'); for (let j = 0; j < 8; j++) star(c, 140 + R() * 800, 1260 + R() * 560, 10 + Math.abs(Math.sin(t * 3 + j)) * 18, '#ffffff'); }
        else if (kind === 'tea') { cakeStand(c, 360, by + 260, 150); teacup(c, 780, by + 120, 150); steam(c, 780, by, t, 1.2); }
        else if (kind === 'drinks') { martini(c, 380, by + 40, 190, '#ff4f9a'); martini(c, 720, by + 60, 170, '#ffd27a'); for (let j = 0; j < 10; j++) star(c, 140 + R() * 800, 1260 + R() * 560, 8 + Math.abs(Math.sin(t * 3 + j)) * 16, '#ffffff'); }
        else { lips(c, 360, by, 170); shades(c, 720, by - 20, 200, .1); lipstick(c, 540, by + 220, 130, .3); }
        flashes(c, t, 2, 30 + i, 1250, 1850);
      },
      vip(c, s, pt, t, P) {
        const k = kOf(P), hi = hiOf(P);
        const sw = Math.sin(pt * 3) * .03 * Math.exp(-pt * .8), drop = (1 - ease3(pt / .6)) * -800;
        c.drawImage(vipArt(k), 0, 0, W, H);
        c.save(); c.translate(540, 0); c.rotate(sw); c.translate(0, drop);
        for (const d of [-1, 1]) { c.strokeStyle = PINK; c.lineWidth = 40; c.beginPath(); c.moveTo(d * 300, -900); c.lineTo(d * 60, 190); c.stroke(); c.strokeStyle = '#ffd27a'; c.lineWidth = 3; c.beginPath(); c.moveTo(d * 300, -900); c.lineTo(d * 60, 190); c.stroke(); }
        c.fillStyle = goldBevel(c, -40, 170, 40, 230); rrect(c, -40, 170, 80, 60, 10); c.fill();
        c.translate(-540, 0);
        c.drawImage(passArt(k), 90, 200, 900, 1460);
        foil(c, 'VIP', W / 2, 340, { font: '700 120px "Cinzel Decorative"', t, spacing: 20 });
        c.fillStyle = '#ffd9ea'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = hi ? '38px "Tiro Devanagari Hindi"' : '28px "Cinzel"'; spacing(c, hi ? 0 : 10); c.fillText(hi ? 'सिर्फ़ ख़ास मेहमानों के लिए' : 'ALL ACCESS · ADMIT ONE DIVA', W / 2, 430); spacing(c, 0);
        c.restore();
        flashes(c, t, 3, 41, 100, 1800);
      },
      back(c, s, pt, t, P) {
        const k = kOf(P);
        c.drawImage(backArt(k), 0, 0, W, H);
        steam(c, 880, 1580, t, 1);
      }
    }
  };
})(Cinema.kit));

} catch (e) { if (typeof console !== 'undefined') console.warn('Cinema: story-glam.js', e); }

// ---------- js/cinema/story-goldengala.js ----------
try {
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

} catch (e) { if (typeof console !== 'undefined') console.warn('Cinema: story-goldengala.js', e); }

// ---------- js/cinema/story-grihapravesh.js ----------
try {
// Shubh Griha Pravesh: a carved teak front door under a mango-leaf toran, swastik and shubh-labh either side, opens
// on a warm light; the camera walks in over a rangoli drawing itself in front of the mandir, kneels by the havan's
// fire for the family's name, then the family at their own threshold, each ritual in its own scene, the new home
// lit at dusk, and thank you. Warm saffron and gold throughout. Designed by Sankalp.
Cinema.register((K => {
  const { W, H, TAU, rng, clamp, ease, ease3, lerp, art, glow, rrect, leaf, marigold, rose, kalash, diya, flame, mandala, foliage, blossom,
    clean, dateRange, coupleImage, ganeshaImage, cutout, camAt, camera, foil, spacing, goldBevel, bell } = K;
  const kOf = P => Math.min(1.25, Math.max(.5, P.k));
  const hiOf = P => P.opt.lang === 'hi';
  const DOOR = { x: 240, y: 470, w: 600, h: 1130 };

  // ---- small painted parts ----
  function stud(c, x, y, r) {
    const g = c.createRadialGradient(x - r * .35, y - r * .35, r * .1, x, y, r); g.addColorStop(0, '#fff3c0'); g.addColorStop(.5, '#d9a53c'); g.addColorStop(1, '#6e440c');
    c.fillStyle = 'rgba(30,12,2,.45)'; c.beginPath(); c.arc(x + r * .25, y + r * .3, r, 0, TAU); c.fill();
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
  }
  function swastik(c, x, y, s, col) {
    c.save(); c.translate(x, y); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = s * .13; c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(0, -s); c.lineTo(0, s); c.moveTo(-s, 0); c.lineTo(s, 0);
    c.moveTo(0, -s); c.lineTo(s, -s); c.moveTo(s, 0); c.lineTo(s, s); c.moveTo(0, s); c.lineTo(-s, s); c.moveTo(-s, 0); c.lineTo(-s, -s); c.stroke();
    for (const [dx, dy] of [[.5, -.5], [.5, .5], [-.5, .5], [-.5, -.5]]) { c.beginPath(); c.arc(dx * s, dy * s, s * .11, 0, TAU); c.fill(); }
    c.restore();
  }
  // a mango-leaf toran with marigold swags between two points
  function toranLine(c, x0, x1, y, R) {
    c.strokeStyle = '#6a3a14'; c.lineWidth = 5; c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke();
    const n = Math.round((x1 - x0) / 34);
    for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n; leaf(c, x, y + 2, 96 + (i % 3) * 8, 26, Math.PI / 2 + (i % 2 ? .12 : -.12), i % 2 ? '#2e7d32' : '#4f9a3a'); }
    for (let i = 0; i <= n; i++) marigold(c, x0 + (x1 - x0) * i / n, y + 4, 14, i % 2 ? 40 : 28);
    const sw = 5;
    for (let k = 0; k < sw; k++) {
      const a = x0 + (x1 - x0) * k / sw, b = x0 + (x1 - x0) * (k + 1) / sw;
      for (let i = 1; i < 10; i++) { const u = i / 10; marigold(c, lerp(a, b, u), y + 16 + Math.sin(u * Math.PI) * 74, 12, (i + k) % 2 ? 44 : 30); }
    }
    for (let k = 0; k <= sw; k++) {
      const x = x0 + (x1 - x0) * k / sw, len = 5 + (k % 2) * 3;
      for (let j = 0; j < len; j++) marigold(c, x, y + 26 + j * 24, 12, j % 2 ? 26 : 40);
      rose(c, x, y + 34 + len * 24, 16, '#ff6b8a', '#a80d2a');
    }
  }
  function rangoliRings(hi) {
    return [[1, 24, '#e91e63', .26], [.84, 20, '#ff9800', .22], [.68, 16, '#ffd54f', .2], [.52, 12, '#2e9e57', .2], [.36, 10, '#1e88e5', .24], [.2, 8, '#ffffff', .3]];
  }
  // a rangoli drawn petal by petal: u 0 … 1 (how much is drawn); an ellipse when sy < 1 (the floor in perspective)
  function rangoliDraw(c, x, y, r, u, sy, t) {
    const rings = rangoliRings(), total = rings.reduce((a, q) => a + q[1], 0) + 40;
    let left = u * total;
    c.save(); c.translate(x, y); c.scale(1, sy);
    // the white outline ring of dots first
    const dots = Math.min(40, left); left -= 40;
    c.fillStyle = '#fff8ec'; for (let i = 0; i < dots; i++) { const a = i / 40 * TAU; c.beginPath(); c.arc(Math.cos(a) * r * 1.08, Math.sin(a) * r * 1.08, r * .022, 0, TAU); c.fill(); }
    let tip = null;
    for (const [k, n, col, wid] of rings) {
      if (left <= 0) break;
      const m = Math.min(n, Math.ceil(left)); left -= n;
      for (let i = 0; i < m; i++) {
        const a = i / n * TAU;
        c.save(); c.rotate(a); c.beginPath(); c.moveTo(0, -r * k * .42);
        c.quadraticCurveTo(r * k * wid, -r * k * .78, 0, -r * k); c.quadraticCurveTo(-r * k * wid, -r * k * .78, 0, -r * k * .42);
        c.fillStyle = col; c.fill(); c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = r * .008; c.stroke(); c.restore();
        tip = [Math.sin(a) * r * k, -Math.cos(a) * r * k];
      }
    }
    if (u > .98) { c.fillStyle = '#ffeb3b'; c.beginPath(); c.arc(0, 0, r * .12, 0, TAU); c.fill(); c.fillStyle = '#e91e63'; c.beginPath(); c.arc(0, 0, r * .06, 0, TAU); c.fill(); }
    c.restore();
    if (tip && u < .98) glow(c, x + tip[0], y + tip[1] * sy, 60, 'rgba(255,240,190,.8)');
  }
  function smoke(c, x, y, t, n, a) {
    for (let i = 0; i < n; i++) {
      const ph = (t * .32 + i / n) % 1, yy = y - ph * 700, xx = x + Math.sin(ph * 5 + i) * 60 * ph;
      glow(c, xx, yy, 60 + ph * 160, `rgba(255,236,214,${(a * Math.sin(ph * Math.PI)).toFixed(3)})`);
    }
  }
  function embers(c, x, y, t, n, spread) {
    const R = rng(41);
    for (let i = 0; i < n; i++) {
      const sp = 120 + R() * 160, ph = (t * sp / 600 + R()) % 1, xx = x + (R() - .5) * spread + Math.sin(t * 2 + i) * 30 * ph, yy = y - ph * 620;
      c.fillStyle = `rgba(255,${180 + Math.round(R() * 60)},90,${(1 - ph).toFixed(2)})`; c.beginPath(); c.arc(xx, yy, 2 + R() * 3, 0, TAU); c.fill();
    }
  }
  // tall tongues of fire (a havan)
  function fire(c, x, y, w, h, t) {
    glow(c, x, y - h * .4, w * 1.6, 'rgba(255,150,40,.45)');
    for (let i = 0; i < 9; i++) {
      const u = (i - 4) / 4, hh = h * (1 - Math.abs(u) * .5) * (.82 + .18 * Math.sin(t * 7 + i * 1.7)), xx = x + u * w * .45 + Math.sin(t * 5 + i) * 8;
      const g = c.createLinearGradient(0, y - hh, 0, y); g.addColorStop(0, 'rgba(255,240,180,0)'); g.addColorStop(.25, 'rgba(255,214,90,.95)'); g.addColorStop(.7, 'rgba(255,120,20,.95)'); g.addColorStop(1, 'rgba(200,40,10,.9)');
      c.fillStyle = g; c.beginPath(); c.moveTo(xx - w * .14, y);
      c.bezierCurveTo(xx - w * .16, y - hh * .5, xx + Math.sin(t * 6 + i) * w * .1, y - hh * .7, xx + Math.sin(t * 4 + i) * w * .06, y - hh);
      c.bezierCurveTo(xx + w * .1, y - hh * .6, xx + w * .16, y - hh * .4, xx + w * .14, y); c.fill();
    }
    for (let i = 0; i < 4; i++) flame(c, x + (i - 1.5) * w * .18, y - 6, h * .35, t, i * 2);
  }
  function kund(c, x, y, s) {
    // a square copper havan kund seen from the front: its top face in perspective, three stepped bands, a dark mouth
    const w = s, fh = s * .3, th = s * .14, top = y - fh;
    const g = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0); g.addColorStop(0, '#5a2a10'); g.addColorStop(.3, '#d98a4a'); g.addColorStop(.55, '#f6c088'); g.addColorStop(1, '#5a2410');
    c.fillStyle = 'rgba(10,2,0,.45)'; c.beginPath(); c.ellipse(x, y + 6, w * .62, s * .05, 0, 0, TAU); c.fill();
    c.fillStyle = g; c.fillRect(x - w / 2, top, w, fh);
    c.strokeStyle = 'rgba(70,24,6,.55)'; c.lineWidth = 3; for (let i = 1; i < 3; i++) { c.beginPath(); c.moveTo(x - w / 2, top + fh * i / 3); c.lineTo(x + w / 2, top + fh * i / 3); c.stroke(); }
    c.fillStyle = 'rgba(255,230,180,.35)'; c.fillRect(x - w / 2, top, w, 5);
    for (let i = 0; i < 5; i++) { c.fillStyle = '#c4161c'; swastik(c, x - w * .32 + i * w * .16, top + fh * .5, fh * .12, 'rgba(196,22,28,.8)'); }
    const tg = c.createLinearGradient(0, top - th, 0, top); tg.addColorStop(0, '#f6c088'); tg.addColorStop(1, '#b8642a'); c.fillStyle = tg;
    c.beginPath(); c.moveTo(x - w / 2, top); c.lineTo(x - w / 2 + th * 1.2, top - th); c.lineTo(x + w / 2 - th * 1.2, top - th); c.lineTo(x + w / 2, top); c.closePath(); c.fill();
    c.fillStyle = '#2a0e04'; c.beginPath(); c.moveTo(x - w * .34, top - th * .15); c.lineTo(x - w * .3, top - th * .8); c.lineTo(x + w * .3, top - th * .8); c.lineTo(x + w * .34, top - th * .15); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,140,40,.6)'; c.beginPath(); c.ellipse(x, top - th * .45, w * .26, th * .22, 0, 0, TAU); c.fill();
  }
  // ---- still art ----
  // the facade: sandstone, the carved frame, plaque, swastik and shubh-labh, the step, kalash, rangoli (the door leaves
  // and the toran are separate: they move)
  function facadeArt(k, name) {
    return art(`gp-facade-${name}`, W, H, k, c => {
      const R = rng(17);
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#b9773d'); g.addColorStop(.6, '#a2612f'); g.addColorStop(1, '#6e3a18'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.strokeStyle = 'rgba(70,30,8,.22)'; c.lineWidth = 2;
      for (let y = 0; y < H; y += 96) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); for (let x = (y / 96 % 2) * 110; x < W; x += 220) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 96); c.stroke(); } }
      for (let i = 0; i < 6000; i++) { c.fillStyle = `rgba(${R() > .5 ? '255,230,190' : '60,25,5'},${R() * .07})`; c.fillRect(R() * W, R() * H, 2, 2); }
      glow(c, 540, 900, 900, 'rgba(255,214,150,.35)');
      // carved stone frame and arch top
      const fx = DOOR.x - 80, fw = DOOR.w + 160, fy = DOOR.y - 150;
      c.save(); c.shadowColor = 'rgba(40,14,2,.55)'; c.shadowBlur = 40; c.shadowOffsetY = 18;
      c.fillStyle = '#e9cfa2'; c.beginPath(); c.moveTo(fx, DOOR.y + DOOR.h + 20); c.lineTo(fx, fy + 120); c.quadraticCurveTo(540, fy - 120, fx + fw, fy + 120); c.lineTo(fx + fw, DOOR.y + DOOR.h + 20); c.closePath(); c.fill(); c.restore();
      const sg = c.createLinearGradient(fx, 0, fx + fw, 0); sg.addColorStop(0, '#c9a06a'); sg.addColorStop(.5, '#f4e2c0'); sg.addColorStop(1, '#b88c56');
      c.fillStyle = sg; c.beginPath(); c.moveTo(fx + 14, DOOR.y + DOOR.h + 20); c.lineTo(fx + 14, fy + 128); c.quadraticCurveTo(540, fy - 100, fx + fw - 14, fy + 128); c.lineTo(fx + fw - 14, DOOR.y + DOOR.h + 20); c.closePath(); c.fill();
      // carved bead-and-leaf bands on the jambs
      for (const x of [fx + 40, fx + fw - 40]) {
        for (let y = DOOR.y; y < DOOR.y + DOOR.h; y += 44) {
          c.fillStyle = 'rgba(120,70,30,.5)'; c.beginPath(); c.arc(x, y, 10, 0, TAU); c.fill();
          leaf(c, x, y + 22, 26, 10, Math.PI / 2 + .6, 'rgba(140,84,36,.55)', false); leaf(c, x, y + 22, 26, 10, Math.PI / 2 - .6, 'rgba(140,84,36,.55)', false);
        }
      }
      // the lintel: a brass name plaque under a carved Ganesh-kalash crest
      c.save(); c.translate(540, DOOR.y - 66);
      c.fillStyle = 'rgba(40,14,2,.4)'; rrect(c, -236, -40, 480, 92, 16); c.fill();
      c.fillStyle = goldBevel(c, -240, -46, 240, 46); rrect(c, -240, -46, 480, 92, 16); c.fill();
      c.fillStyle = '#5a2a08'; rrect(c, -224, -32, 448, 64, 10); c.fill();
      c.fillStyle = goldBevel(c, -200, -20, 200, 20); c.textAlign = 'center'; c.textBaseline = 'middle';
      let fs = 40; c.font = `${fs}px "Cinzel"`; spacing(c, 4); const label = name.toUpperCase();
      while (c.measureText(label).width > 410 && fs > 22) { fs -= 2; c.font = `${fs}px "Cinzel"`; }
      c.fillText(label, 0, 2); spacing(c, 0); c.restore();
      kalash(c, 540, DOOR.y - 150, 70);
      // swastik and shubh-labh in vermilion either side
      for (const [x, word] of [[105, 'शुभ'], [975, 'लाभ']]) {
        glow(c, x, 860, 120, 'rgba(255,220,170,.25)');
        swastik(c, x, 860, 46, '#c4161c');
        c.fillStyle = '#c4161c'; c.font = '64px "Yatra One"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(word, x, 990);
        for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(x - 30 + i * 30, 1060, 7, 0, TAU); c.fill(); }
      }
      // the marble step and the threshold
      const st = DOOR.y + DOOR.h;
      const mg = c.createLinearGradient(0, st, 0, st + 90); mg.addColorStop(0, '#fff8ec'); mg.addColorStop(1, '#cdbba0'); c.fillStyle = mg; c.fillRect(110, st + 6, 860, 70);
      c.fillStyle = '#e8d8bc'; c.fillRect(60, st + 76, 960, 60);
      c.fillStyle = 'rgba(80,40,10,.25)'; c.fillRect(110, st + 70, 860, 8);
      const fl = c.createLinearGradient(0, st + 136, 0, H); fl.addColorStop(0, '#e9dcc6'); fl.addColorStop(1, '#b8a283'); c.fillStyle = fl; c.fillRect(0, st + 136, W, H - st - 136);
      // a finished rangoli on the floor before the door
      c.save(); rangoliDraw(c, 540, st + 230, 230, 1, .3, 0); c.restore();
      // kalash on the step, marigold heaps and plants in brass pots at the sides
      for (const x of [175, 905]) {
        glow(c, x, 1530, 220, 'rgba(255,200,120,.25)');
        kalash(c, x, st + 70, 190);
        for (let i = 0; i < 26; i++) marigold(c, x + (R() - .5) * 150, st + 90 + R() * 30, 15, R() > .5 ? 40 : 28);
      }
      for (const x of [40, 1040]) { foliage(c, R, x, 1420, 90, 230, 70, 110, 32, 34, 48); for (let i = 0; i < 12; i++) blossom(c, x + (R() - .5) * 140, 1260 + R() * 330, 14, R() > .5 ? '#ff9800' : '#ffd54f', '#fff', R() * 6); }
      const v = c.createRadialGradient(540, 960, 500, 540, 960, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(30,10,0,.55)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
    });
  }
  // one door leaf: teak planks, three carved panels in brass, rows of studs, a ring handle (300 × 1130)
  function leafArt(k) {
    return art('gp-leaf', 300, DOOR.h, k, c => {
      const R = rng(5), w = 300, h = DOOR.h;
      const g = c.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#5a2c10'); g.addColorStop(.5, '#8a4a1e'); g.addColorStop(1, '#4e240c'); c.fillStyle = g; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 70; i++) { c.strokeStyle = `rgba(${R() > .5 ? '40,16,4' : '170,100,50'},${.08 + R() * .1})`; c.lineWidth = 1 + R() * 2; const x = R() * w; c.beginPath(); c.moveTo(x, 0); c.bezierCurveTo(x + 8, h * .3, x - 8, h * .6, x + 4, h); c.stroke(); }
      c.strokeStyle = goldBevel(c, 0, 0, w, h); c.lineWidth = 8; c.strokeRect(6, 6, w - 12, h - 12);
      const panel = (x, y, pw, ph, arch, inner) => {
        c.save(); c.fillStyle = 'rgba(30,10,2,.45)'; c.beginPath();
        if (arch) { c.moveTo(x, y + ph); c.lineTo(x, y + pw / 2); c.arc(x + pw / 2, y + pw / 2, pw / 2, Math.PI, 0); c.lineTo(x + pw, y + ph); c.closePath(); } else c.rect(x, y, pw, ph);
        c.fill(); c.clip();
        const pg = c.createLinearGradient(x, y, x + pw, y + ph); pg.addColorStop(0, '#9a5a2a'); pg.addColorStop(1, '#5e2e10'); c.fillStyle = pg; c.fillRect(x + 6, y + 6, pw - 12, ph - 12);
        inner(x + pw / 2, y + ph / 2, Math.min(pw, ph)); c.restore();
        c.strokeStyle = goldBevel(c, x, y, x + pw, y + ph); c.lineWidth = 5; c.beginPath();
        if (arch) { c.moveTo(x, y + ph); c.lineTo(x, y + pw / 2); c.arc(x + pw / 2, y + pw / 2, pw / 2, Math.PI, 0); c.lineTo(x + pw, y + ph); c.closePath(); } else c.rect(x, y, pw, ph);
        c.stroke();
      };
      const lotusCarve = (cx, cy, s) => { c.fillStyle = 'rgba(255,214,140,.5)'; for (let i = 0; i < 8; i++) { c.save(); c.translate(cx, cy); c.rotate(i / 8 * TAU); c.beginPath(); c.ellipse(0, -s * .22, s * .08, s * .2, 0, 0, TAU); c.fill(); c.restore(); } stud(c, cx, cy, s * .08); };
      panel(40, 50, 220, 330, true, (cx, cy, s) => { mandala(c, cx, cy + 20, s * .9, 'rgba(255,214,140,.55)'); lotusCarve(cx, cy + 20, s * .8); });
      panel(40, 420, 220, 300, false, (cx, cy, s) => { mandala(c, cx, cy, s * 1.05, 'rgba(255,214,140,.45)'); lotusCarve(cx, cy, s * .9); });
      panel(40, 760, 220, 320, false, (cx, cy, s) => { for (let i = 0; i < 5; i++) leaf(c, cx, cy + 90, 150 - i * 10, 30, -Math.PI / 2 + (i - 2) * .35, 'rgba(255,214,140,.4)', false); stud(c, cx, cy + 96, 12); });
      for (const y of [30, 400, 740, 1100]) for (let x = 30; x <= 270; x += 40) stud(c, x, y, 7);
      for (let y = 60; y < h - 40; y += 60) { stud(c, 20, y, 6); stud(c, 280, y, 6); }
    });
  }
  // inside: the hall in perspective, a carved marble mandir at the far wall, side jharokhas, bells, garlands, the floor
  const VP = { x: 540, y: 980 };
  function hallArt(k) {
    return art('gp-hall', W, H, k, c => {
      const R = rng(23);
      // ceiling, side walls, back wall, floor
      const back = { x0: 250, x1: 830, y0: 380, y1: 1120 };
      const cg = c.createLinearGradient(0, 0, 0, back.y0); cg.addColorStop(0, '#7a3a14'); cg.addColorStop(1, '#c47a3a'); c.fillStyle = cg; c.beginPath(); c.moveTo(0, 0); c.lineTo(W, 0); c.lineTo(back.x1, back.y0); c.lineTo(back.x0, back.y0); c.fill();
      for (const side of [0, 1]) {
        const xo = side ? W : 0, xb = side ? back.x1 : back.x0, wg = c.createLinearGradient(xo, 0, xb, 0); wg.addColorStop(0, '#a85a24'); wg.addColorStop(1, '#e9b77a');
        c.fillStyle = wg; c.beginPath(); c.moveTo(xo, 0); c.lineTo(xb, back.y0); c.lineTo(xb, back.y1); c.lineTo(xo, H); c.fill();
        // arched niches with lamps on the side walls, in perspective
        for (const f of [.3, .66]) {
          const x = lerp(xo, xb, f), sc = 1 - f * .55, yB = lerp(1250, back.y1 - 160, f), hw = 70 * sc, hh = 300 * sc, yT = yB - hh;
          c.fillStyle = 'rgba(90,40,10,.55)'; c.beginPath(); c.moveTo(x - hw - 8, yB + 8); c.lineTo(x - hw - 8, yT + hw); c.arc(x, yT + hw, hw + 8, Math.PI, 0); c.lineTo(x + hw + 8, yB + 8); c.fill();
          const lg = c.createRadialGradient(x, yB - hh * .3, 4, x, yB - hh * .4, hh); lg.addColorStop(0, '#ffe7b0'); lg.addColorStop(1, '#a8501a'); c.fillStyle = lg;
          c.beginPath(); c.moveTo(x - hw, yB); c.lineTo(x - hw, yT + hw); c.arc(x, yT + hw, hw, Math.PI, 0); c.lineTo(x + hw, yB); c.fill();
          diya(c, x, yB - 6, 26 * sc, 0);
          c.fillStyle = goldBevel(c, x - hw, 0, x + hw, 0); c.fillRect(x - hw - 14, yB, hw * 2 + 28, 10 * sc);
        }
      }
      const bg = c.createLinearGradient(0, back.y0, 0, back.y1); bg.addColorStop(0, '#f6dcae'); bg.addColorStop(1, '#e7b880'); c.fillStyle = bg; c.fillRect(back.x0, back.y0, back.x1 - back.x0, back.y1 - back.y0);
      // floor: marble with a perspective grid
      const fg = c.createLinearGradient(0, back.y1, 0, H); fg.addColorStop(0, '#d9c3a0'); fg.addColorStop(1, '#f6ead6'); c.fillStyle = fg;
      c.beginPath(); c.moveTo(back.x0, back.y1); c.lineTo(back.x1, back.y1); c.lineTo(W, H); c.lineTo(0, H); c.fill();
      c.strokeStyle = 'rgba(150,110,70,.35)'; c.lineWidth = 2;
      for (let i = -8; i <= 8; i++) { c.beginPath(); c.moveTo(540 + i * 36, back.y1); c.lineTo(540 + i * 200, H); c.stroke(); }
      for (let j = 1; j < 9; j++) { const u = (j / 9) ** 1.8, y = lerp(back.y1, H, u), xl = lerp(back.x0, 0, u), xr = lerp(back.x1, W, u); c.beginPath(); c.moveTo(xl, y); c.lineTo(xr, y); c.stroke(); }
      glow(c, 540, 1500, 600, 'rgba(255,240,210,.35)');
      // the mandir on the back wall: white marble with a shikhara, an arched niche (Ganesh ji is drawn live in it)
      const mx = 540, my = 1100;
      glow(c, mx, 800, 420, 'rgba(255,230,160,.6)');
      c.fillStyle = '#fbf4e6'; c.beginPath(); c.moveTo(mx - 200, my); c.lineTo(mx - 200, 640); c.lineTo(mx - 150, 600); c.quadraticCurveTo(mx - 120, 470, mx, 420); c.quadraticCurveTo(mx + 120, 470, mx + 150, 600); c.lineTo(mx + 200, 640); c.lineTo(mx + 200, my); c.fill();
      c.strokeStyle = 'rgba(200,150,80,.7)'; c.lineWidth = 3; c.stroke();
      for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(mx - 150 + i * 6, 600 - i * 30); c.quadraticCurveTo(mx, 470 + i * 8, mx + 150 - i * 6, 600 - i * 30); c.stroke(); }
      c.fillStyle = goldBevel(c, mx - 12, 400, mx + 12, 430); c.beginPath(); c.moveTo(mx, 370); c.lineTo(mx + 14, 424); c.lineTo(mx - 14, 424); c.fill();
      c.fillStyle = '#c4161c'; c.beginPath(); c.moveTo(mx, 330); c.lineTo(mx + 34, 345); c.lineTo(mx, 360); c.fill(); c.fillRect(mx - 2, 330, 4, 50);
      c.fillStyle = '#7a1a10'; c.beginPath(); c.moveTo(mx - 130, my - 20); c.lineTo(mx - 130, 760); c.arc(mx, 760, 130, Math.PI, 0); c.lineTo(mx + 130, my - 20); c.fill();
      const ng = c.createRadialGradient(mx, 830, 20, mx, 860, 220); ng.addColorStop(0, '#ffe2a0'); ng.addColorStop(1, '#a8401a'); c.fillStyle = ng;
      c.beginPath(); c.moveTo(mx - 112, my - 30); c.lineTo(mx - 112, 760); c.arc(mx, 760, 112, Math.PI, 0); c.lineTo(mx + 112, my - 30); c.fill();
      for (const x of [mx - 165, mx + 165]) { c.fillStyle = '#efe2c8'; c.fillRect(x - 14, 650, 28, my - 650); c.fillStyle = goldBevel(c, x - 18, 0, x + 18, 0); c.fillRect(x - 18, 650, 36, 14); c.fillRect(x - 18, my - 24, 36, 14); }
      c.fillStyle = '#c03018'; c.fillRect(mx - 210, my, 420, 26); c.fillStyle = goldBevel(c, mx - 210, 0, mx + 210, 0); c.fillRect(mx - 210, my + 22, 420, 8);
      for (const x of [mx - 250, mx + 250]) kalash(c, x, my + 20, 120);
      // garland strings from the ceiling corners, and a toran over the mandir
      for (const [x0, x1] of [[0, back.x0], [W, back.x1]]) for (let i = 0; i < 16; i++) { const u = i / 15; marigold(c, lerp(x0, x1, u), lerp(60, back.y0 - 20, u) + Math.sin(u * Math.PI) * 140, lerp(22, 12, u), i % 2 ? 40 : 28); }
      toranLine(c, back.x0, back.x1, back.y0 + 14, R);
      for (const x of [0, W - 110]) {
        const pg = c.createLinearGradient(x, 0, x + 110, 0); pg.addColorStop(0, '#6a2c0c'); pg.addColorStop(.45, '#e0a860'); pg.addColorStop(1, '#5a240a');
        c.fillStyle = pg; c.fillRect(x, 0, 110, H);
        for (let y = 120; y < H; y += 260) { c.fillStyle = goldBevel(c, x, y, x + 110, y + 30); c.fillRect(x - 6, y, 122, 26); for (let i = 0; i < 4; i++) leaf(c, x + 55, y + 60, 60, 20, Math.PI / 2 + (i - 1.5) * .5, 'rgba(255,214,140,.5)', false); }
      }
      for (const side of [-1, 1]) { const x0 = side < 0 ? 0 : W; c.fillStyle = '#b8261a'; c.beginPath(); c.moveTo(x0, 0); c.lineTo(x0 + side * -420, 0); c.quadraticCurveTo(x0 + side * -260, 120, x0, 300); c.fill(); c.fillStyle = 'rgba(255,200,120,.35)'; c.beginPath(); c.moveTo(x0 + side * -380, 0); c.quadraticCurveTo(x0 + side * -220, 90, x0, 240); c.lineTo(x0, 260); c.quadraticCurveTo(x0 + side * -240, 110, x0 + side * -400, 0); c.fill(); }
      const v = c.createRadialGradient(540, 900, 400, 540, 960, 1200); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(40,14,0,.5)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
    });
  }
  // a dark warm backdrop for the fire and the rituals: maroon with a faint gold mandala, carved arch edges and a toran
  function riteArt(k) {
    return art('gp-rite', W, H, k, c => {
      const R = rng(31);
      const g = c.createRadialGradient(540, 760, 80, 540, 900, 1300); g.addColorStop(0, '#a3361a'); g.addColorStop(.55, '#5e1408'); g.addColorStop(1, '#250602'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.globalAlpha = .22; mandala(c, 540, 820, 980, '#f2c76b'); mandala(c, 540, 820, 600, '#f2c76b', .2); c.globalAlpha = 1;
      // carved arch frame
      c.fillStyle = '#2a0804'; c.beginPath(); c.rect(0, 0, W, H); c.moveTo(90, H); c.lineTo(90, 520); c.quadraticCurveTo(90, 200, 540, 150); c.quadraticCurveTo(990, 200, 990, 520); c.lineTo(990, H); c.closePath(); c.fill('evenodd');
      c.strokeStyle = goldBevel(c, 90, 150, 990, H); c.lineWidth = 10; c.beginPath(); c.moveTo(90, H); c.lineTo(90, 520); c.quadraticCurveTo(90, 200, 540, 150); c.quadraticCurveTo(990, 200, 990, 520); c.lineTo(990, H); c.stroke();
      c.lineWidth = 3; c.beginPath(); c.moveTo(112, H); c.lineTo(112, 525); c.quadraticCurveTo(112, 224, 540, 174); c.quadraticCurveTo(968, 224, 968, 525); c.lineTo(968, H); c.stroke();
      for (let y = 560; y < H; y += 70) { for (const x of [45, 1035]) { c.fillStyle = goldBevel(c, x - 16, y - 16, x + 16, y + 16); c.beginPath(); c.moveTo(x, y - 18); c.lineTo(x + 14, y); c.lineTo(x, y + 18); c.lineTo(x - 14, y); c.fill(); } }
      toranLine(c, 0, W, 34, R);
      const fl = c.createLinearGradient(0, 1500, 0, H); fl.addColorStop(0, 'rgba(60,16,4,0)'); fl.addColorStop(1, 'rgba(20,4,0,.8)'); c.fillStyle = fl; c.fillRect(0, 1500, W, H - 1500);
    });
  }
  // a brass plate of offerings (rice, kumkum, flowers, a diya's place)
  function thaliArt(k) {
    return art('gp-thali', 520, 220, k, c => {
      const R = rng(9);
      c.fillStyle = 'rgba(20,6,0,.4)'; c.beginPath(); c.ellipse(266, 128, 250, 82, 0, 0, TAU); c.fill();
      const g = c.createLinearGradient(20, 0, 500, 0); g.addColorStop(0, '#8a5a14'); g.addColorStop(.4, '#f6d77d'); g.addColorStop(.7, '#c9952e'); g.addColorStop(1, '#7a4c10');
      c.fillStyle = g; c.beginPath(); c.ellipse(260, 110, 250, 82, 0, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,240,200,.35)'; c.beginPath(); c.ellipse(260, 104, 210, 62, 0, 0, TAU); c.fill();
      const bowl = (x, y, col) => { c.fillStyle = '#b07a22'; c.beginPath(); c.ellipse(x, y, 46, 18, 0, 0, TAU); c.fill(); c.fillStyle = col; c.beginPath(); c.ellipse(x, y - 4, 38, 13, 0, 0, TAU); c.fill(); };
      bowl(140, 100, '#d0141a'); bowl(380, 100, '#fff4dc'); bowl(260, 140, '#ffb300');
      for (let i = 0; i < 18; i++) marigold(c, 200 + R() * 120, 70 + R() * 30, 11, R() > .5 ? 40 : 28);
      for (let i = 0; i < 6; i++) rose(c, 120 + R() * 280, 120 + R() * 30, 10, '#ff8fa8', '#b0102e', R() * 3);
    });
  }
  // a banana-leaf feast seen from above at a slant
  function feastArt(k) {
    return art('gp-feast', 900, 420, k, c => {
      const R = rng(12);
      c.save(); c.translate(450, 220); c.rotate(-.06);
      c.fillStyle = 'rgba(10,4,0,.4)'; c.beginPath(); c.ellipse(12, 16, 430, 170, 0, 0, TAU); c.fill();
      const lg = c.createLinearGradient(0, -170, 0, 170); lg.addColorStop(0, '#3f9a3a'); lg.addColorStop(1, '#1f6a24'); c.fillStyle = lg;
      c.beginPath(); c.moveTo(-430, 0); c.quadraticCurveTo(-380, -170, 0, -168); c.quadraticCurveTo(400, -170, 430, 0); c.quadraticCurveTo(380, 170, 0, 168); c.quadraticCurveTo(-380, 170, -430, 0); c.fill();
      c.strokeStyle = 'rgba(200,255,180,.35)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-420, 0); c.lineTo(420, 0); c.stroke();
      for (let i = -9; i <= 9; i++) { c.lineWidth = 1.5; c.beginPath(); c.moveTo(i * 44, 0); c.lineTo(i * 44 + 30, -150); c.moveTo(i * 44, 0); c.lineTo(i * 44 + 30, 150); c.stroke(); }
      const katori = (x, y, col, r = 50) => { c.fillStyle = '#b0b4bc'; c.beginPath(); c.ellipse(x, y, r, r * .5, 0, 0, TAU); c.fill(); c.fillStyle = '#e8ebf0'; c.beginPath(); c.ellipse(x, y - 4, r * .86, r * .42, 0, 0, TAU); c.fill(); c.fillStyle = col; c.beginPath(); c.ellipse(x, y - 2, r * .72, r * .32, 0, 0, TAU); c.fill(); };
      katori(-300, -70, '#e8a23a'); katori(-180, -100, '#3f7a2a'); katori(-60, -110, '#c8401a'); katori(70, -110, '#f6e7c8'); katori(200, -95, '#a8501a');
      c.fillStyle = '#fffaf0'; c.beginPath(); c.ellipse(-60, 50, 130, 60, 0, 0, TAU); c.fill(); for (let i = 0; i < 80; i++) { c.fillStyle = 'rgba(220,210,190,.8)'; c.beginPath(); c.ellipse(-60 + (R() - .5) * 220, 50 + (R() - .5) * 90, 5, 2.4, R() * 3, 0, TAU); c.fill(); }
      for (let i = 0; i < 3; i++) { const g = c.createRadialGradient(170 + i * 60, 60 - i * 10, 4, 170 + i * 60, 60 - i * 10, 60); g.addColorStop(0, '#f6c66a'); g.addColorStop(1, '#a8601a'); c.fillStyle = g; c.beginPath(); c.ellipse(170 + i * 60, 60 - i * 10, 62, 50, 0, 0, TAU); c.fill(); }
      for (let i = 0; i < 3; i++) { c.fillStyle = '#f2a03a'; c.beginPath(); c.arc(330, -20 + i * 40, 22, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,240,200,.5)'; c.beginPath(); c.arc(324, -26 + i * 40, 7, 0, TAU); c.fill(); }
      c.restore();
    });
  }
  // the new home at dusk: a two-storey house with a lit doorway, fairy lights, diyas on the parapet, a garden
  function houseArt(k) {
    return art('gp-house', W, 900, k, c => {
      const R = rng(66), y0 = 0;
      for (let i = 0; i < 22; i++) foliage(c, R, i * 52, 330 + R() * 40, 80, 70, 40, 120, 18, 30, 30);
      c.fillStyle = '#e9d8bc'; c.fillRect(180, 160, 720, 520); c.fillStyle = '#d4bf9c'; c.fillRect(180, 400, 720, 20);
      c.fillStyle = '#8a3a1a'; c.beginPath(); c.moveTo(130, 170); c.lineTo(540, 40); c.lineTo(950, 170); c.closePath(); c.fill();
      c.fillStyle = '#6a2a10'; c.fillRect(130, 160, 820, 22);
      const win = (x, y, w, h) => { const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#ffe6a8'); g.addColorStop(1, '#ff9a3c'); c.fillStyle = '#5a2a10'; c.fillRect(x - 8, y - 8, w + 16, h + 16); c.fillStyle = g; c.fillRect(x, y, w, h); c.strokeStyle = '#5a2a10'; c.lineWidth = 6; c.beginPath(); c.moveTo(x + w / 2, y); c.lineTo(x + w / 2, y + h); c.moveTo(x, y + h * .45); c.lineTo(x + w, y + h * .45); c.stroke(); };
      win(240, 230, 120, 140); win(720, 230, 120, 140); win(480, 230, 120, 140); win(240, 480, 120, 150); win(720, 480, 120, 150);
      c.fillStyle = '#4a1a08'; c.fillRect(455, 450, 170, 230); const dg = c.createLinearGradient(0, 460, 0, 680); dg.addColorStop(0, '#fff0c0'); dg.addColorStop(1, '#ffb050'); c.fillStyle = dg; c.fillRect(470, 466, 140, 214);
      toranLine(c, 450, 630, 450, R);
      c.fillStyle = '#cdb894'; c.fillRect(100, 680, 880, 40); c.fillStyle = '#b8a07a'; c.fillRect(60, 720, 960, 40);
      c.fillStyle = '#3a5a2a'; c.fillRect(0, 760, W, 140);
      for (let i = 0; i < 40; i++) blossom(c, R() * W, 780 + R() * 110, 10 + R() * 8, ['#ff9800', '#ffd54f', '#e91e63', '#ffffff'][i % 4], '#fff', R() * 6);
      for (const x of [70, 1010]) { c.fillStyle = '#2e4a22'; c.fillRect(x - 6, 420, 12, 340); foliage(c, R, x, 380, 110, 160, 60, 120, 22, 40, 36); }
    });
  }

  // a family name and the date in gold, drawn on a shot
  function nameBlock(c, P, y, a, t, dark) {
    const card = P.card, hi = hiOf(P), two = clean(card.host2), name = two ? `${clean(card.host1)} & ${clean(card.host2)}` : clean(card.host1);
    c.save(); c.globalAlpha = a;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = dark ? '#7a2a08' : '#ffe2a8'; c.font = hi ? '44px "Tiro Devanagari Hindi"' : 'italic 46px "Cormorant Garamond"';
    c.fillText(hi ? 'सपरिवार आपको सादर आमन्त्रित करते हैं' : clean(card.tagline) || 'invite you to the Griha Pravesh of our new home', W / 2, y + 120, 940);
    let fs = 116; c.font = `${fs}px "Great Vibes"`; while (c.measureText(name).width > 960 && fs > 60) { fs -= 4; c.font = `${fs}px "Great Vibes"`; }
    foil(c, name, W / 2, y, { font: `${fs}px "Great Vibes"`, t, dark });
    const when = dateRange(card, hi);
    if (when) { c.fillStyle = dark ? '#5a2006' : '#fff2dc'; c.font = hi ? '42px "Tiro Devanagari Hindi"' : '40px "Cinzel"'; spacing(c, hi ? 0 : 6); c.fillText(hi ? when : when.toUpperCase(), W / 2, y + 200); spacing(c, 0); }
    c.restore();
  }

  const TITLES = [[/puja|pooja|ganesh|katha|satyanarayan|पूजा|गणेश|कथा/i, 'A Sacred Beginning'], [/havan|hawan|yagya|yajna|हवन|यज्ञ/i, 'The Sacred Fire'],
    [/bhoj|lunch|dinner|meal|prasad|feast|भोज|भोजन|प्रसाद/i, 'A Feast of Blessings'], [/kalash|grih|griha|pravesh|गृह|कलश/i, 'Shubh Aagman']];

  return {
    id: 'story-grihapravesh', order: 21, occasion: 'housewarming', tune: 'shehnai', thumb: 3.6,
    name: 'Shubh Griha Pravesh', note: 'A carved door under a mango-leaf toran opens; walk in over a rangoli drawing itself, to the havan, the family and the new home lit at dusk',
    names: ['The Kulkarni Family', ''], ganesha: 'ganesha-01',
    looks: { open: 'marigold-saffron', title: 'marigold-saffron', invite: 'marigold-saffron', events: ['marigold-saffron'], date: 'marigold-saffron', end: 'marigold-saffron', final: 'marigold-saffron' },
    titles: TITLES,
    look(kind, K) {
      if (kind === 'blessing') return K.palette('temple-golden', { font: { script: 'Great Vibes', serif: 'Gilda Display' }, fx: (c, t) => K.petals(c, t, 14, ['#ff9800', '#ffd54f', '#e91e63'], 5) });
      return K.palette('marigold-saffron', { font: { script: 'Great Vibes', serif: 'Gilda Display' }, fx: (c, t) => K.motes(c, t, 12, 'rgba(255,214,140,A)', 5, 10) });
    },
    timeline(S, K2, card, opt) {
      const at = k => S.findIndex(s => s.k === k);
      S.splice(at('open'), 1, { k: 'reel', reel: 'door', name: 'The Door', d: 7.5 }, { k: 'reel', reel: 'hall', name: 'Welcome Home', d: 6.5, cut: true });
      const ti = S[at('title')]; Object.assign(ti, { reel: 'havan', d: 5.5, change: 'flash' }); delete ti.couple; delete ti.zone;
      Object.assign(S[at('invite')], { reel: 'family', d: 7, board: 'cartouche', tone: 'cream', zone: [150, 1010, 820], change: 'bloom' });
      if (at('end') >= 0) S.splice(at('end'), 1);
      const evs = S.filter(s => s.k === 'event'), fixed = S.filter(s => s.k !== 'event').reduce((a, s) => a + s.d, 0);
      const d = evs.length ? clamp((59 - fixed) / evs.length, 3.6, 4.8) : 0;
      evs.forEach((s, i) => { Object.assign(s, { reel: 'rite', d, datebar: true, board: i % 2 ? 'arch' : 'carved', tone: 'cream', zone: [200, 1180, 800], change: i ? 'sparkle' : 'petals' }); delete s.couple; delete s.coupleEntry; });
      const dt = S[at('date')]; if (dt) Object.assign(dt, { reel: 'dusk', board: 'arch', tone: 'cream', zone: [170, 1050, 800], change: 'iris' });
      const fi = S[at('final')]; if (fi) Object.assign(fi, { reel: 'blessing', change: 'petals', board: false, zone: [330, 1500, 860] });
    },
    shots: {
      door(c, s, pt, t, P) {
        const k = kOf(P), hi = hiOf(P), card = P.card;
        const open = ease3((pt - 2.6) / 2.2), into = clamp((pt - 4.6) / (s.d - 4.6)) ** 2.2;
        const zIn = K.fillZoom(DOOR.w, DOOR.h, 1.04);
        let cam = camAt(pt, [[0, { x: 540, y: 1020, z: 1.0 }], [2.6, { x: 540, y: 1000, z: 1.1 }]]);
        cam = { x: 540, y: lerp(cam.y, DOOR.y + DOOR.h / 2, into), z: lerp(cam.z, zIn, into), r: 0 };
        c.save(); camera(c, cam);
        c.drawImage(facadeArt(k, clean(card.host1) || 'Shubh Griha Pravesh'), 0, 0, W, H);
        // inside, through the opening door
        c.save(); c.beginPath(); c.rect(DOOR.x, DOOR.y, DOOR.w, DOOR.h); c.clip();
        if (open > 0) {
          const kk = Math.max(DOOR.w / W, DOOR.h / H), hw = W * kk, hh = H * kk;
          c.drawImage(hallArt(k), DOOR.x + DOOR.w / 2 - hw / 2, DOOR.y + DOOR.h - hh, hw, hh);
          c.fillStyle = `rgba(255,236,190,${(.55 * (1 - open * .6)).toFixed(3)})`; c.fillRect(DOOR.x, DOOR.y, DOOR.w, DOOR.h);
        }
        // the two leaves swing inwards on their hinges
        const L = leafArt(k), ang = open * 1.32, cos = Math.cos(ang), lw = 300 * cos, n = 20;
        for (const side of [-1, 1]) {
          if (lw < 2) break;
          const hinge = side < 0 ? DOOR.x : DOOR.x + DOOR.w;
          for (let i = 0; i < n; i++) {
            const f = i / n, f2 = (i + 1) / n, shrink = 1 - (f + f2) / 2 * Math.sin(ang) * .16, gh = DOOR.h * shrink;
            const sx = side < 0 ? f * 300 : (1 - f2) * 300, dx = side < 0 ? hinge + f * lw : hinge - f2 * lw;
            c.drawImage(L, sx * L.width / 300, 0, L.width / n + 1, L.height, dx, DOOR.y + (DOOR.h - gh) * .5, lw / n + .8, gh);
          }
          const sg = c.createLinearGradient(hinge, 0, hinge - side * lw, 0); sg.addColorStop(0, `rgba(0,0,0,${(.15 * open).toFixed(2)})`); sg.addColorStop(1, `rgba(0,0,0,${(.6 * open).toFixed(2)})`);
          c.fillStyle = sg; c.fillRect(side < 0 ? hinge : hinge - lw, DOOR.y, lw, DOOR.h);
          // the ring handle
          const hx = side < 0 ? hinge + lw - 34 * cos : hinge - lw + 34 * cos;
          c.strokeStyle = goldBevel(c, hx - 30, 1000, hx + 30, 1060); c.lineWidth = 9; c.beginPath(); c.ellipse(hx, 1050, 26 * cos + 3, 30, 0, 0, TAU); c.stroke();
        }
        c.restore();
        // light spilling out once they part
        if (open > 0) { c.save(); c.globalAlpha = open; glow(c, 540, 1040, 760, 'rgba(255,214,140,.45)'); c.restore(); }
        // the toran sways a little in the breeze
        const tor = art('gp-toran', 760, 300, k, g => toranLine(g, 20, 740, 30, rng(3)));
        c.save(); c.translate(540, DOOR.y - 26); c.rotate(Math.sin(t * 1.3) * .006); c.drawImage(tor, -380, -30, 760, 300); c.restore();
        // diyas along the step (they light one by one), hanging brass bells either side
        for (let i = 0; i < 7; i++) { if (pt > .3 + i * .22) diya(c, 300 + i * 80, DOOR.y + DOOR.h + 54, 30, t + i); }
        for (const x of [70, 1010]) {
          const sw = Math.sin(t * 2.1 + x) * .12 * (pt > 2.4 && pt < 4.6 ? 1.6 : .6);
          c.save(); c.translate(x, 0); c.rotate(sw); c.strokeStyle = '#c9952e'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 300); c.stroke();
          for (let j = 0; j < 4; j++) marigold(c, 0, 80 + j * 50, 14, j % 2 ? 40 : 28); bell(c, 0, 300, 90); c.restore();
        }
        c.restore();
        // the title above the door, gone as the doors open
        const ta = ease((pt - .5) / 1) * (1 - ease((pt - 3.4) / .8));
        if (ta > .01) {
          c.save(); c.globalAlpha = ta;
          const sg2 = c.createLinearGradient(0, 0, 0, 420); sg2.addColorStop(0, 'rgba(40,10,0,.7)'); sg2.addColorStop(1, 'rgba(40,10,0,0)'); c.fillStyle = sg2; c.fillRect(0, 0, W, 420);
          foil(c, '॥ शुभ गृह प्रवेश ॥', W / 2, 150, { font: '92px "Yatra One"', t });
          c.fillStyle = '#fff0d0'; c.textAlign = 'center'; c.textBaseline = 'middle';
          if (hi) { c.font = '44px "Tiro Devanagari Hindi"'; c.fillText('नए घर में आपका स्वागत है', W / 2, 260); } else { c.font = '38px "Cinzel"'; spacing(c, 10); c.fillText('A NEW HOME · A NEW BEGINNING', W / 2, 260); spacing(c, 0); }
          c.restore();
        }
        if (into > .6) { c.fillStyle = `rgba(255,240,205,${((into - .6) / .4 * .7).toFixed(2)})`; c.fillRect(0, 0, W, H); }
      },
      hall(c, s, pt, t, P) {
        const k = kOf(P), hi = hiOf(P);
        const cam = camAt(pt, [[0, { x: 540, y: 960, z: 1.0 }], [2.2, { x: 540, y: 1050, z: 1.08 }], [s.d, { x: 540, y: 1130, z: 1.2 }]]);
        c.save(); camera(c, cam);
        c.drawImage(hallArt(k), 0, 0, W, H);
        // Ganesh ji in the niche, diyas before him
        const g = ganeshaImage(P);
        if (g) { const hh = 250, ww = hh * g.naturalWidth / g.naturalHeight; glow(c, 540, 850, 200, 'rgba(255,230,160,.55)'); c.drawImage(g, 540 - ww / 2, 1072 - hh, ww, hh); }
        else K.ganesha(c, 540, 830, 230, t);
        for (let i = 0; i < 4; i++) diya(c, 450 + i * 60, 1094, 18, t + i);
        // the rangoli draws itself on the floor; diyas light round it once it is done
        const u = ease((pt - .3) / 3.6);
        rangoliDraw(c, 540, 1500, 330, u, .34, t);
        for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, on = pt > 4 + i * .12; if (on) diya(c, 540 + Math.cos(a) * 410, 1500 + Math.sin(a) * 140, 26, t + i); }
        for (const x of [130, 950]) { glow(c, x, 1650, 200, 'rgba(255,200,120,.3)'); kalash(c, x, 1760, 230); }
        // the bells overhead sway as we pass under them
        for (const [x, len] of [[200, 260], [880, 260], [540, 140]]) { c.save(); c.translate(x, 0); c.rotate(Math.sin(t * 2.4 + x) * .1); c.strokeStyle = '#c9952e'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, len); c.stroke(); bell(c, 0, len, 80); c.restore(); }
        c.restore();
        const wa = ease((pt - 3.6) / .9) * (1 - ease((pt - (s.d - .5)) / .5));
        if (wa > .01) {
          c.save(); c.globalAlpha = wa; const sg = c.createLinearGradient(0, 0, 0, 380); sg.addColorStop(0, 'rgba(60,20,0,.6)'); sg.addColorStop(1, 'rgba(60,20,0,0)'); c.fillStyle = sg; c.fillRect(0, 0, W, 380);
          foil(c, hi ? 'शुभ स्वागतम्' : 'Welcome Home', W / 2, 180, { font: hi ? '100px "Amita"' : '130px "Great Vibes"', t }); c.restore();
        }
      },
      havan(c, s, pt, t, P) {
        const k = kOf(P);
        const cam = camAt(pt, [[0, { x: 540, y: 1100, z: 1.12 }], [s.d, { x: 540, y: 1000, z: 1.0 }]]);
        c.save(); camera(c, cam);
        c.drawImage(riteArt(k), 0, 0, W, H);
        smoke(c, 540, 1300, t, 7, .12);
        kund(c, 540, 1700, 600);
        fire(c, 540, 1460, 320, 360 + Math.sin(t * 3) * 20, t);
        embers(c, 540, 1400, t, 26, 260);
        c.drawImage(thaliArt(k), 40, 1680, 340, 144); c.drawImage(thaliArt(k), 700, 1690, 340, 144);
        // a spoon of ghee offered into the fire, again and again
        const cyc = (pt % 2.4) / 2.4, tilt = Math.sin(clamp((cyc - .2) / .5) * Math.PI) * .7;
        c.save(); c.translate(820, 1180); c.rotate(-.5 - tilt); c.fillStyle = goldBevel(c, -260, -10, 0, 10); c.fillRect(-300, -8, 300, 16); c.beginPath(); c.ellipse(-310, 0, 40, 26, 0, 0, TAU); c.fill(); c.restore();
        if (tilt > .4) { c.fillStyle = 'rgba(255,220,120,.9)'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(600 + Math.sin(i) * 6, 1270 + i * 22 + (pt * 200 % 22), 5, 0, TAU); c.fill(); } }
        c.restore();
        nameBlock(c, P, 560, ease((pt - .4) / 1) * (1 - ease((pt - (s.d - .5)) / .5)), t, false);
        c.save(); c.globalAlpha = ease((pt - .2) / .8); foil(c, 'ॐ', W / 2, 300, { font: '150px "Yatra One"', t }); c.restore();
      },
      family(c, s, pt, t, P) {
        const k = kOf(P), card = P.card;
        const cam = camAt(pt, [[0, { x: 540, y: 1080, z: 1.08 }], [s.d, { x: 540, y: 1000, z: 1.0 }]]);
        c.save(); camera(c, cam);
        c.drawImage(facadeArt(k, clean(card.host1) || 'Shubh Griha Pravesh'), 0, 0, W, H);
        // the doors open, the hall glowing behind, the family at their threshold
        c.save(); c.beginPath(); c.rect(DOOR.x, DOOR.y, DOOR.w, DOOR.h); c.clip();
        const kk = Math.max(DOOR.w / W, DOOR.h / H); c.drawImage(hallArt(k), DOOR.x + DOOR.w / 2 - W * kk / 2, DOOR.y + DOOR.h - H * kk, W * kk, H * kk);
        c.fillStyle = 'rgba(255,236,190,.25)'; c.fillRect(DOOR.x, DOOR.y, DOOR.w, DOOR.h); c.restore();
        const tor = art('gp-toran', 760, 300, k, g => toranLine(g, 20, 740, 30, rng(3)));
        c.drawImage(tor, 160, DOOR.y - 56, 760, 300);
        for (let i = 0; i < 7; i++) diya(c, 300 + i * 80, DOOR.y + DOOR.h + 54, 30, t + i);
        c.restore();
        const img = coupleImage(P);
        if (img) { c.save(); c.globalAlpha = ease((pt - .2) / 1); cutout(c, img, W / 2, 1890 + (1 - ease3(pt / 1.4)) * 60, 800, 'full', P.shotLook ? P.shotLook('family') : K.LOOKS['marigold-saffron'], t, false); c.restore(); }
        K.petals(c, t, 18, ['#ff9800', '#ffd54f', '#e91e63', '#ffffff'], 21);
      },
      rite(c, s, pt, t, P) {
        const k = kOf(P), name = s.e ? s.e.name : '';
        const kind = /havan|hawan|yagya|yajna|हवन|यज्ञ/i.test(name) ? 'havan' : /bhoj|lunch|dinner|meal|prasad|feast|भोज|भोजन|प्रसाद/i.test(name) ? 'feast' : /puja|pooja|ganesh|katha|पूजा|गणेश|कथा/i.test(name) ? 'ganesh' : 'kalash';
        const z = 1.06 - .06 * ease3(pt / s.d);
        c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2);
        c.drawImage(riteArt(k), 0, 0, W, H);
        const by = 1880, rise = (1 - ease3(pt / 1.2)) * 80;
        if (kind === 'havan') { smoke(c, 540, by - 300, t, 6, .1); kund(c, 540, by - 40 + rise, 640); fire(c, 540, by - 290 + rise, 340, 440, t); embers(c, 540, by - 240, t, 18, 220); }
        else if (kind === 'feast') { c.drawImage(feastArt(k), 90, by - 420 + rise, 900, 420); for (let i = 0; i < 2; i++) diya(c, 150 + i * 780, by - 120, 34, t + i); smoke(c, 420, by - 300, t, 3, .07); }
        else if (kind === 'ganesh') {
          const g = ganeshaImage(P); glow(c, 540, by - 300, 380, 'rgba(255,214,120,.45)'); mandala(c, 540, by - 330, 420, 'rgba(242,199,107,.35)', t * .1);
          if (g) { const hh = 600, ww = hh * g.naturalWidth / g.naturalHeight; c.drawImage(g, 540 - ww / 2, by - 40 - hh + rise, ww, hh); } else K.ganesha(c, 540, by - 600 + rise, 560, t);
          for (const x of [170, 910]) diya(c, x, by - 90, 44, t + x);
        } else { for (const x of [300, 780]) kalash(c, x, by - 20 + rise, 300); for (let i = 0; i < 5; i++) diya(c, 340 + i * 100, by - 70, 30, t + i); }
        c.drawImage(thaliArt(k), -60, by - 180, 300, 127); c.drawImage(thaliArt(k), 840, by - 170, 300, 127);
        c.restore();
      },
      dusk(c, s, pt, t, P) {
        const k = kOf(P), z = 1.05 - .05 * ease3(pt / s.d);
        const skyA = art('gp-dusk', W, H, k, g => {
          const sg = g.createLinearGradient(0, 0, 0, H); sg.addColorStop(0, '#1a1240'); sg.addColorStop(.45, '#6a2a5a'); sg.addColorStop(.75, '#e2703a'); sg.addColorStop(1, '#f6b05a'); g.fillStyle = sg; g.fillRect(0, 0, W, H);
          const R = rng(8); for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(255,255,255,${R() * .8})`; g.beginPath(); g.arc(R() * W, R() * H * .5, R() * 2.2, 0, TAU); g.fill(); }
          glow(g, 820, 300, 140, 'rgba(255,240,210,.5)'); g.fillStyle = '#fff6e0'; g.beginPath(); g.arc(820, 300, 48, 0, TAU); g.fill();
        });
        c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2);
        c.drawImage(skyA, 0, 0, W, H);
        // a few sky lanterns rising
        for (let i = 0; i < 6; i++) { const ph = (t * .05 + i / 6) % 1, x = 120 + i * 170 + Math.sin(t * .5 + i) * 30, y = 1200 - ph * 1300; c.globalAlpha = Math.sin(ph * Math.PI); glow(c, x, y, 50, 'rgba(255,190,90,.7)'); c.fillStyle = '#ffcf7a'; c.beginPath(); c.moveTo(x - 14, y - 20); c.lineTo(x + 14, y - 20); c.lineTo(x + 10, y + 18); c.lineTo(x - 10, y + 18); c.fill(); c.globalAlpha = 1; }
        const rise = (1 - ease3(pt / 1.4)) * 120;
        c.drawImage(houseArt(k), 0, H - 900 + rise, W, 900);
        // fairy lights on the eaves and diyas on the step, twinkling
        const y0 = H - 900 + rise;
        for (let i = 0; i <= 26; i++) { const u = i / 26, x = lerp(130, 950, u), y = y0 + 170 + Math.sin(u * TAU * 3) * 14 + 12, on = .5 + .5 * Math.sin(t * 4 + i * 1.7); glow(c, x, y, 22, `rgba(255,214,120,${(.4 + on * .5).toFixed(2)})`); c.fillStyle = '#fff2c0'; c.beginPath(); c.arc(x, y, 4, 0, TAU); c.fill(); }
        for (let i = 0; i < 9; i++) diya(c, 160 + i * 95, y0 + 690, 22, t + i);
        c.restore();
      },
      blessing(c, s, pt, t, P) {
        const k = kOf(P);
        const bg = art('gp-bless', W, H, k, g => {
          const gg = g.createRadialGradient(540, 800, 60, 540, 900, 1250); gg.addColorStop(0, '#fffaf0'); gg.addColorStop(.6, '#f9e2b8'); gg.addColorStop(1, '#e9a860'); g.fillStyle = gg; g.fillRect(0, 0, W, H);
          toranLine(g, 0, W, 30, rng(4));
          for (const x of [130, 950]) kalash(g, x, 1650, 220);
        });
        c.drawImage(bg, 0, 0, W, H);
        c.save(); c.globalAlpha = .45; mandala(c, 540, 880, 900, 'rgba(201,146,44,.6)', t * .05); c.restore();
        for (let i = 0; i < 6; i++) diya(c, 290 + i * 100, 1700, 28, t + i);
      }
    }
  };
})(Cinema.kit));

} catch (e) { if (typeof console !== 'undefined') console.warn('Cinema: story-grihapravesh.js', e); }

// ---------- js/cinema/story-haldi.js ----------
try {
// Haldi in the Marigold Courtyard: sheer yellow drapes blow open on a sunlit haveli courtyard (marigold ladis, a
// flower swing, brass urlis), a brass bowl of turmeric with their monogram, turmeric splashes carry us from screen
// to screen, carved wooden signboards on marigold strings for every function, a haldi thaal for the date and a
// shower of petals (phoolon ki holi) for the thank you.
Cinema.register((K => {
  const { W, H, TAU, rng, clamp, ease, ease3, lerp, mix, art, glow, rrect, clean, dateRange, spacing, coupleImage, foil, marigold, rose, leaf, banana, rangoli, diya } = K;
  const hiOf = P => P.opt.lang === 'hi';
  const deva = card => /[ऀ-ॿ]/.test(`${card.host1 || ''}${card.host2 || ''}`);
  const kOf = P => Math.min(1.25, Math.max(.5, P.k));
  const SAFFRON = ['#ff9f1c', '#ffb703', '#ffd23f', '#f77f00'];

  // ---- painted pieces ----
  // a string (ladi) of marigolds hanging from (x, y0) down to y1, with a tassel of leaves at the end
  function ladi(c, x, y0, y1, R, big = 15) {
    c.strokeStyle = 'rgba(90,60,20,.5)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y0); c.lineTo(x, y1); c.stroke();
    let i = 0;
    for (let y = y0 + 10; y < y1; y += big * 1.45, i++) {
      if (i % 7 === 6) { rose(c, x, y, big * .9, '#ffd0dc', '#e0607e', R() * 3); continue; }
      marigold(c, x + (R() - .5) * 2, y, big, i % 2 ? 38 : 28);
    }
    leaf(c, x - 6, y1 + 10, 40, 14, Math.PI / 2 + .4, '#3f7a3c'); leaf(c, x + 6, y1 + 10, 40, 14, Math.PI / 2 - .4, '#5d9450');
  }
  // a swag of marigolds between two points (sagging)
  function swag(c, x0, x1, y, sag, R, big = 14) {
    const n = Math.max(6, Math.round((x1 - x0) / (big * 1.5)));
    for (let i = 0; i <= n; i++) { const u = i / n; marigold(c, lerp(x0, x1, u), y + Math.sin(u * Math.PI) * sag, big, (i + Math.round(x0)) % 2 ? 38 : 26); }
    void R;
  }
  // a brass urli: a wide shallow bowl of water with floating marigolds and petals (painted once per size)
  const urli = (k, s) => art(`hd-urli-${s}`, s * 2.4, s * 1.2, k, c => {
    const cx = s * 1.2, cy = s * .42, R = rng(s);
    c.save(); c.shadowColor = 'rgba(80,40,0,.4)'; c.shadowBlur = s * .2; c.shadowOffsetY = s * .1;
    const bg = c.createLinearGradient(0, cy, 0, cy + s * .7); bg.addColorStop(0, '#f7d77a'); bg.addColorStop(.4, '#c9952e'); bg.addColorStop(1, '#6e4208');
    c.fillStyle = bg; c.beginPath(); c.ellipse(cx, cy, s * 1.12, s * .32, 0, 0, Math.PI); c.quadraticCurveTo(cx - s * .9, cy + s * .72, cx, cy + s * .72); c.quadraticCurveTo(cx + s * .9, cy + s * .72, cx + s * 1.12, cy); c.fill(); c.restore();
    c.fillStyle = '#f2c24e'; c.beginPath(); c.ellipse(cx, cy, s * 1.14, s * .33, 0, 0, TAU); c.fill();
    const wg = c.createRadialGradient(cx - s * .3, cy - s * .1, 4, cx, cy, s); wg.addColorStop(0, '#fff3c4'); wg.addColorStop(.5, '#f7c948'); wg.addColorStop(1, '#d9901a');
    c.fillStyle = wg; c.beginPath(); c.ellipse(cx, cy, s * 1.02, s * .27, 0, 0, TAU); c.fill();
    for (let i = 0; i < 9; i++) { const a = R() * TAU, d = R() * .8; marigold(c, cx + Math.cos(a) * s * d, cy + Math.sin(a) * s * .2 * d, s * (.13 + R() * .05), i % 2 ? 38 : 28); }
    for (let i = 0; i < 14; i++) { c.fillStyle = i % 2 ? '#e0405e' : '#ff8fab'; c.beginPath(); c.ellipse(cx + (R() - .5) * s * 1.7, cy + (R() - .5) * s * .4, s * .05, s * .025, R() * 3, 0, TAU); c.fill(); }
    c.strokeStyle = 'rgba(255,250,220,.6)'; c.lineWidth = 2; c.beginPath(); c.ellipse(cx, cy, s * 1.08, s * .3, 0, Math.PI * 1.1, Math.PI * 1.6); c.stroke();
  });

  // The courtyard: a sunlit haveli wall with scalloped arches and jharokhas, saffron drapes, marigold ladis, a stone
  // floor with a rangoli; tone 0 morning, 1 noon, 2 late (warmer). The swing and the people are drawn live.
  const courtArt = (k, tone) => art(`hd-court-${tone}`, W, H, k, c => {
    const R = rng(70 + tone), skyT = [['#fff6d6', '#ffe08a'], ['#fff9e8', '#ffd25e'], ['#ffe9c4', '#ffb35c']][tone];
    const sk = c.createLinearGradient(0, 0, 0, 700); sk.addColorStop(0, skyT[0]); sk.addColorStop(1, skyT[1]); c.fillStyle = sk; c.fillRect(0, 0, W, 700);
    glow(c, 160, 120, 600, 'rgba(255,255,240,.8)');
    // the haveli wall
    const wall = [['#f6deaa', '#e9c27a'], ['#f8e4b4', '#efc983'], ['#f4cf9a', '#e0a866']][tone], wg = c.createLinearGradient(0, 260, 0, 1400); wg.addColorStop(0, wall[0]); wg.addColorStop(1, wall[1]);
    c.fillStyle = wg; c.fillRect(0, 300, W, 1100);
    for (let i = 0; i < 5000; i++) { c.fillStyle = `rgba(150,90,30,${R() * .05})`; c.fillRect(R() * W, 300 + R() * 1100, 3, 3); }
    // the cornice and parapet with little domes (chhatris) at the corners
    c.fillStyle = '#e2b26a'; c.fillRect(0, 300, W, 40); c.fillStyle = '#c98f45'; c.fillRect(0, 340, W, 10);
    for (let x = 0; x < W; x += 54) { c.fillStyle = '#efcf8f'; c.beginPath(); c.arc(x + 27, 300, 22, Math.PI, 0); c.fill(); }
    for (const x of [90, W - 90]) K.chhatri(c, x, 300, 150, '#f3dcaa', '#c99a55');
    // upper floor: three jharokha balconies
    for (const x of [230, 540, 850]) {
      c.fillStyle = '#d9a35a'; rrect(c, x - 95, 420, 190, 230, 14); c.fill();
      c.fillStyle = '#7a4a1e'; c.beginPath(); c.moveTo(x - 70, 640); c.lineTo(x - 70, 520); c.quadraticCurveTo(x, 430, x + 70, 520); c.lineTo(x + 70, 640); c.fill();
      c.strokeStyle = 'rgba(255,230,170,.55)'; c.lineWidth = 2; for (let j = -60; j <= 60; j += 15) { c.beginPath(); c.moveTo(x + j, 470); c.lineTo(x + j, 640); c.stroke(); }
      c.fillStyle = '#c98f45'; c.fillRect(x - 110, 640, 220, 20); for (let j = -100; j <= 100; j += 25) { c.fillStyle = '#e2b26a'; c.beginPath(); c.moveTo(x + j - 8, 660); c.lineTo(x + j + 8, 660); c.lineTo(x + j, 690); c.fill(); }
      K.chhatri(c, x, 420, 120, '#f3dcaa', '#c99a55');
    }
    // the ground floor: three scalloped arches opening into shade
    for (const [x, w] of [[180, 230], [540, 330], [900, 230]]) {
      const top = 820, bot = 1400;
      c.fillStyle = '#6a3a18'; c.beginPath(); c.moveTo(x - w / 2, bot); c.lineTo(x - w / 2, top + w * .45);
      const n = 7; for (let i = 0; i <= n; i++) { const a = Math.PI + i / n * Math.PI, rr = w / 2; const px = x + Math.cos(a) * rr, py = top + w * .45 + Math.sin(a) * rr * 1.05; c.quadraticCurveTo(px + Math.cos(a) * 14, py + Math.sin(a) * 14, px, py); }
      c.lineTo(x + w / 2, bot); c.closePath();
      const ig = c.createLinearGradient(0, top, 0, bot); ig.addColorStop(0, '#e6b070'); ig.addColorStop(.5, '#c08048'); ig.addColorStop(1, '#7a4220'); c.fillStyle = ig; c.fill();
      c.save(); c.clip();
      // the inner room: a lit back wall with a jaali window, a niche with a diya, a marigold toran
      const jx = x, jy = top + w * .55, jw = w * .42, jh = w * .62;
      glow(c, jx, jy, w * .7, 'rgba(255,220,150,.55)');
      c.fillStyle = '#ffe9b8'; c.beginPath(); c.moveTo(jx - jw / 2, jy + jh / 2); c.lineTo(jx - jw / 2, jy - jh / 4); c.quadraticCurveTo(jx, jy - jh * .75, jx + jw / 2, jy - jh / 4); c.lineTo(jx + jw / 2, jy + jh / 2); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(150,80,30,.75)'; c.lineWidth = 3;
      for (let gx = -jw / 2; gx <= jw / 2; gx += 16) for (let gy = -jh / 2; gy <= jh / 2; gy += 16) { c.beginPath(); c.arc(jx + gx, jy + gy, 6, 0, TAU); c.stroke(); }
      c.strokeStyle = '#c98f45'; c.lineWidth = 6; c.stroke();
      c.fillStyle = 'rgba(90,40,10,.35)'; c.fillRect(x - w / 2, bot - 120, w, 120);
      for (let q = 0; q < 5; q++) { const yy = bot - 110 + q * 22; c.fillStyle = `rgba(255,214,140,${.05 + q * .02})`; c.fillRect(x - w / 2, yy, w, 4); }
      swag(c, x - w / 2, x + w / 2, top + 8, w * .22, R, 12);
      c.restore();
      c.strokeStyle = '#c98f45'; c.lineWidth = 12; c.stroke(); c.strokeStyle = '#f6dca0'; c.lineWidth = 3; c.stroke();
      K.pillar(c, x - w / 2 - 22, top - 40, bot, 34); K.pillar(c, x + w / 2 + 22, top - 40, bot, 34);
    }
    // a wooden beam for the swing across the middle arch
    // the floor: warm stone in perspective with a big rangoli
    const fg = c.createLinearGradient(0, 1400, 0, H); fg.addColorStop(0, '#e8b878'); fg.addColorStop(1, '#c98a4a'); c.fillStyle = fg; c.fillRect(0, 1400, W, H - 1400);
    c.strokeStyle = 'rgba(120,70,30,.25)'; c.lineWidth = 2; for (let i = -10; i <= 10; i++) { c.beginPath(); c.moveTo(W / 2 + i * 70, 1400); c.lineTo(W / 2 + i * 260, H); c.stroke(); }
    for (let j = 1; j < 8; j++) { const yy = 1400 + (H - 1400) * (j / 8) ** 1.5; c.beginPath(); c.moveTo(0, yy); c.lineTo(W, yy); c.stroke(); }
    c.save(); c.translate(W / 2, 1720); c.scale(1, .36); rangoli(c, 0, 0, 340); c.restore();
    c.fillStyle = 'rgba(80,40,10,.25)'; c.fillRect(0, 1400, W, 14);
    // banana plants and brass pots at the sides
    for (const [x, d] of [[40, 1], [W - 40, -1]]) { banana(c, x, 1500, 520, d, R); c.fillStyle = '#c9952e'; c.beginPath(); c.ellipse(x + d * 20, 1500, 90, 30, 0, 0, TAU); c.fill(); }
    // saffron drapes looped across the top and down the sides
    const drapeCol = ['#ffb703', '#ff9f1c', '#ffd23f'];
    for (let i = 0; i < 3; i++) {
      const y = 0 + i * 30, g = c.createLinearGradient(0, y, 0, y + 260); g.addColorStop(0, mix(drapeCol[i], '#ffffff', .2)); g.addColorStop(.6, drapeCol[i]); g.addColorStop(1, mix(drapeCol[i], '#7a3a00', .3));
      c.fillStyle = g; c.globalAlpha = .92;
      for (let s2 = 0; s2 < 3; s2++) { const x0 = (s2 + (i % 2) * .5 - .25) * W / 3, x1 = x0 + W / 3; c.beginPath(); c.moveTo(x0, y); c.quadraticCurveTo((x0 + x1) / 2, y + 260 - i * 40, x1, y); c.lineTo(x1, y - 20); c.quadraticCurveTo((x0 + x1) / 2, y + 200 - i * 40, x0, y - 20); c.fill(); }
      c.globalAlpha = 1;
    }
    for (const d of [0, 1]) { const x = d ? W - 120 : 0, g = c.createLinearGradient(x, 0, x + 120, 0); g.addColorStop(0, d ? '#ffd23f' : '#e88a00'); g.addColorStop(.5, '#ffb703'); g.addColorStop(1, d ? '#e88a00' : '#ffd23f');
      c.fillStyle = g; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 120, 0); c.quadraticCurveTo(d ? x + 40 : x + 80, 900, x + (d ? 60 : 60), 1250); c.quadraticCurveTo(d ? x + 120 : x, 900, d ? x + 120 : x, 0); c.fill(); }
    // marigold ladis hanging along the top, longer at the sides
    for (let x = 30; x < W; x += 58) { const u = Math.abs(x - W / 2) / (W / 2); ladi(c, x, 0, 200 + u * u * 420 + R() * 60, R, 14); }
    swag(c, 0, W, 40, 120, R, 18); swag(c, 0, W / 2, 60, 80, R, 13); swag(c, W / 2, W, 60, 80, R, 13);
  });

  // the swing: a carved plank with cushions on ropes wrapped in marigolds, swinging from the top
  function swing(c, x, top, seatY, w, ang, k) {
    const seat = art('hd-seat', 520, 150, k, g => {
      const wg = g.createLinearGradient(0, 40, 0, 110); wg.addColorStop(0, '#a8683a'); wg.addColorStop(1, '#5a3418'); g.fillStyle = wg; rrect(g, 10, 60, 500, 46, 12); g.fill();
      g.fillStyle = '#e2b26a'; for (let x = 30; x < 500; x += 40) { g.beginPath(); g.arc(x, 106, 8, 0, Math.PI); g.fill(); }
      for (const [x, col] of [[110, '#e0405e'], [260, '#ffb703'], [410, '#2a9d8f']]) { g.fillStyle = col; rrect(g, x - 70, 10, 140, 60, 26); g.fill(); g.strokeStyle = '#f2c24e'; g.lineWidth = 4; g.stroke(); g.fillStyle = '#f2c24e'; g.beginPath(); g.arc(x, 40, 8, 0, TAU); g.fill(); }
    });
    c.save(); c.translate(x, top); c.rotate(ang);
    const L = seatY - top;
    for (const d of [-1, 1]) { c.strokeStyle = '#7a4a1e'; c.lineWidth = 6; c.beginPath(); c.moveTo(d * w * .45, 0); c.lineTo(d * w * .45, L); c.stroke();
      for (let y = 20; y < L - 10; y += 26) marigold(c, d * w * .45, y, 13, (y / 26 | 0) % 2 ? 38 : 26); }
    c.drawImage(seat, -w / 2, L - 80, w, w * 150 / 520);
    c.restore();
  }
  // the turmeric splash: cover (p 0 → 1 the screen turns turmeric) or uncover (a hole opens from the middle)
  function blob(c, cx, cy, r, seed, keep) {
    const R = rng(seed), n = 48, rad = [];
    for (let i = 0; i < n; i++) rad.push(1 + (R() - .5) * .22 + (R() < .18 ? R() * .35 : 0));
    if (!keep) c.beginPath();
    for (let i = 0; i <= n; i++) { const a = i / n * TAU, rr = r * rad[i % n], px = cx + Math.cos(a) * rr, py = cy + Math.sin(a) * rr; i ? c.lineTo(px, py) : c.moveTo(px, py); }
    c.closePath();
  }
  const turmeric = (c, y0, y1) => { const g = c.createLinearGradient(0, y0, W, y1); g.addColorStop(0, '#ffd23f'); g.addColorStop(.5, '#f7b500'); g.addColorStop(1, '#e88a00'); return g; };
  // the splash's own texture: turmeric with darker splatter, paste streaks and marigold petals (painted once)
  const splashTex = k => art('hd-splashtex', W, H, k, c => {
    const R = rng(91); c.fillStyle = turmeric(c, 0, H); c.fillRect(0, 0, W, H);
    for (let i = 0; i < 140; i++) { c.fillStyle = `rgba(${R() > .5 ? '200,110,0' : '255,236,140'},${(.15 + R() * .3).toFixed(2)})`; c.beginPath(); c.arc(R() * W, R() * H, 4 + R() * 40, 0, TAU); c.fill(); }
    c.strokeStyle = 'rgba(255,240,170,.35)'; c.lineCap = 'round'; for (let i = 0; i < 40; i++) { c.lineWidth = 6 + R() * 14; const x = R() * W, y = R() * H; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + (R() - .5) * 300, y + (R() - .5) * 300, x + (R() - .5) * 400, y + (R() - .5) * 400); c.stroke(); }
    for (let i = 0; i < 70; i++) { const x = R() * W, y = R() * H; if (i % 3 === 0) marigold(c, x, y, 14 + R() * 10, i % 2 ? 38 : 28); else { c.save(); c.translate(x, y); c.rotate(R() * 6); c.fillStyle = i % 2 ? '#e0405e' : '#ff8fab'; c.beginPath(); c.ellipse(0, 0, 16, 9, 0, 0, TAU); c.fill(); c.restore(); } }
  });
  // the turmeric splash: cover (p 0 -> 1 the splash grows to fill the screen) or uncover (a hole bursts open);
  // fully covered only for a blink, and always textured, never a flat field of colour
  function splash(c, k, p, cover, seed, cx = W / 2, cy = H / 2) {
    if (p <= 0 || p >= 1) return;
    const R = rng(seed), tex = splashTex(k);
    c.save();
    if (cover) {
      const r = ease3(p) * 1250 + p * 150;
      c.save(); blob(c, cx, cy, r, seed); c.clip(); c.drawImage(tex, 0, 0, W, H); c.restore();
      c.fillStyle = '#f7b500';
      for (let i = 0; i < 46; i++) { const a = R() * TAU, d = r * (1.04 + R() * .45), s2 = 6 + R() * 28; c.beginPath(); c.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, s2 * (1 - p * .4), 0, TAU); c.fill(); }
    } else {
      const r = ease(p) * 1750;
      c.save(); c.beginPath(); c.rect(0, 0, W, H); blob(c, cx, cy, r, seed + 1, true); c.clip('evenodd'); c.drawImage(tex, 0, 0, W, H); c.restore();
      c.fillStyle = '#f7b500';
      for (let i = 0; i < 30; i++) { const a = R() * TAU, d = r * (.7 + R() * .25), s2 = 8 + R() * 20; c.globalAlpha = 1 - p; c.beginPath(); c.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, s2, 0, TAU); c.fill(); }
    }
    c.restore();
  }
  // sunlight: slanted shafts from the top-left, shimmering
  function shafts(c, t, a = 1) {
    c.save();
    for (let i = 0; i < 6; i++) {
      const x = -300 + i * 230 + Math.sin(t * .3 + i) * 30, w = 70 + (i % 3) * 50, al = (.08 + .05 * Math.sin(t * .9 + i * 1.7)) * a;
      const g = c.createLinearGradient(x, 0, x + 700, H); g.addColorStop(0, `rgba(255,250,220,${al.toFixed(3)})`); g.addColorStop(1, 'rgba(255,250,220,0)');
      c.fillStyle = g; c.beginPath(); c.moveTo(x, -40); c.lineTo(x + w, -40); c.lineTo(x + w + 900, H); c.lineTo(x + 900, H); c.closePath(); c.fill();
    }
    c.restore();
  }
  // petals and marigold heads tumbling (playful confetti)
  function petalRain(c, t, n, seed, wind = 40) {
    const R = rng(seed);
    for (let i = 0; i < n; i++) {
      const sp = 90 + R() * 160, y = ((R() * H + t * sp) % (H + 120)) - 60, x = (R() * W + Math.sin(t * .8 + i) * wind + t * 20) % W, rot = t * (1 + R() * 2) + i;
      if (i % 5 === 0) { marigold(c, x, y, 12 + R() * 6, i % 2 ? 38 : 28); continue; }
      c.save(); c.translate(x, y); c.rotate(rot); c.scale(1, Math.abs(Math.cos(t * 2 + i)) * .8 + .2);
      c.fillStyle = ['#ff9f1c', '#ffd23f', '#e0405e', '#ff8fab', '#ffffff'][i % 5]; c.beginPath(); c.ellipse(0, 0, 14, 8, 0, 0, TAU); c.fill(); c.restore();
    }
  }
  // sheer drapes blowing across the screen (a layered veil), opening outwards: open 0 … 1
  function sheer(c, open, t) {
    for (let j = 0; j < 4; j++) {
      const col = ['255,214,90', '255,183,3', '255,230,150', '255,159,28'][j], side = j % 2 ? 1 : -1, o = ease3(clamp(open * 1.25 - j * .08));
      c.save(); c.globalAlpha = .55 - j * .06;
      const g = c.createLinearGradient(0, 0, W, 0); g.addColorStop(0, `rgba(${col},.95)`); g.addColorStop(.5, `rgba(${col},.55)`); g.addColorStop(1, `rgba(${col},.95)`); c.fillStyle = g;
      c.beginPath();
      const edge = y => W / 2 + side * (o * 760 + 40 * Math.sin(y / 230 + t * 1.6 + j)) + side * (y / H) * o * 220;
      c.moveTo(side < 0 ? -10 : W + 10, -10);
      for (let y = -10; y <= H + 10; y += 40) c.lineTo(edge(y), y);
      c.lineTo(side < 0 ? -10 : W + 10, H + 10); c.closePath(); c.fill();
      // folds
      c.strokeStyle = `rgba(255,255,255,${(.18 * (1 - o)).toFixed(2)})`; c.lineWidth = 6;
      for (let f = 1; f < 5; f++) { c.beginPath(); for (let y = 0; y <= H; y += 60) { const x = lerp(side < 0 ? 0 : W, edge(y), f / 5) + Math.sin(y / 180 + t + f) * 14; y ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
      c.restore();
    }
  }
  const nm = card => { const a = clean(card.host1), b = clean(card.host2); return { a, b, two: !!b }; };
  const look = { names: '#b3361e', ink: '#5a3208', ink2: '#7a4a14', accent: '#2f7a3a', gold: '#b8862b' };

  return {
    id: 'story-haldi', order: 21, occasion: 'haldi', tune: 'santoor', thumb: 5.2,
    name: 'Marigold Courtyard Haldi', note: 'Yellow drapes blow open on a sunlit courtyard, a flower swing, brass urlis, turmeric splashes and a shower of petals',
    names: ['Tara', 'Neel'], ganesha: 'ganesha-06',
    looks: { open: 'haldi', title: 'haldi', invite: 'haldi-ivory', events: ['haldi', 'haldi-saffron', 'marigold'], date: 'haldi-champagne', end: 'haldi', final: 'haldi-ivory' },
    titles: [[/haldi|pithi|ubtan|हल्दी/i, 'Sunshine & Turmeric'], [/phool|holi|flower|फूल/i, 'A Holi of Petals'], [/lunch|brunch|bhoj|भोज/i, 'A Golden Afternoon'],
      [/mehe?n?d|मेहँदी|मेहंदी/i, 'Henna & Hues'], [/sangeet|dance|dj|संगीत/i, 'Songs in the Courtyard'], [/phera|vivah|wedding|फेरे|विवाह/i, 'The Sacred Vows'],
      [/reception|dinner|स्वागत/i, 'An Evening of Elegance'], [/puja|pooja|ganesh|पूजा/i, 'A Sacred Beginning'], [/ring|engage|sagai|सगाई/i, 'The Promise']],
    look(kind, K) {
      const base = K.palette('haldi', { col: look, font: { script: 'Playball', serif: 'Gilda Display' }, shadow: ['rgba(255,250,228,.95)', 12] });
      return { ...base, scene: 'reel', fx: () => {} };
    },
    timeline(S) {
      const at = k => S.findIndex(s => s.k === k);
      S.splice(at('open'), 1, { k: 'reel', reel: 'drapes', name: 'The Courtyard', d: 6.8 });
      const ti = S[at('title')]; Object.assign(ti, { reel: 'urli', d: 5.6, cut: true, change: 'none', name: 'Turmeric Bowl' }); delete ti.couple; delete ti.zone;
      Object.assign(S[at('invite')], { reel: 'swing', d: 7.5, cut: true, change: 'none', board: 'wood', hang: false, zone: [150, 1150, 800] });
      if (at('end') >= 0) S.splice(at('end'), 1);
      const ev = S.filter(s => s.k === 'event');
      ev.forEach((s, i) => { Object.assign(s, { reel: 'court', datebar: true, board: 'wood', hang: true, cut: true, change: 'none', zone: [240, 1050, 760] }); delete s.couple; void i; });
      const d = S.find(s => s.k === 'date'); if (d) Object.assign(d, { reel: 'thaal', cut: true, change: 'none', board: false, zone: [380, 1500, 640], d: 5.6 });
      const f = S.find(s => s.k === 'final'); if (f) Object.assign(f, { reel: 'holi', d: 6, cut: true, change: 'none', board: false, scrim: true, zone: [260, 1480, 800] });
      const fixed = S.filter(s => s.k !== 'event').reduce((a, s) => a + s.d, 0);
      ev.forEach(s => { s.d = clamp((59.4 - fixed) / Math.max(1, ev.length), 3.8, 5.6); });
    },
    shots: {
      drapes(c, s, pt, t, P) {
        const k = kOf(P), hi = hiOf(P), card = P.card, open = ease3((pt - .5) / 2.6), z = 1.12 - .1 * ease3(pt / s.d);
        c.save(); c.translate(W / 2, H / 2 + 40 * (1 - ease3(pt / s.d))); c.scale(z, z); c.translate(-W / 2, -H / 2);
        c.drawImage(courtArt(k, 0), 0, 0, W, H);
        swing(c, W / 2, 330, 1290, 420, Math.sin(t * 1.1) * .07, k);
        const u = urli(k, 120); c.drawImage(u, 130, 1480, 288, 144); c.drawImage(u, W - 418, 1480, 288, 144);
        for (const x of [330, 750]) diya(c, x, 1600, 40, t);
        // the couple steps in under the swing once the drapes have parted
        const img = coupleImage(P, 'Haldi'), ci = ease((pt - 3.2) / 1.1);
        if (img && ci > 0) { c.save(); c.globalAlpha = ci; K.cutout(c, img, W / 2, 1900 + (1 - ci) * 60, 700, 'full', P.shotLook ? P.shotLook('drapes') : null, t); c.restore(); }
        c.restore();
        shafts(c, t, 1);
        K.motes(c, t, 26, 'rgba(255,240,190,A)', 3, 10);
        // the title, arriving on the swing's seat level once the drapes part
        const ta = ease((pt - 2.4) / .9);
        if (ta > 0) {
          c.save(); c.globalAlpha = ta; c.textAlign = 'center'; c.textBaseline = 'middle';
          const g = c.createRadialGradient(W / 2, 920, 30, W / 2, 920, 520); g.addColorStop(0, 'rgba(255,250,230,.82)'); g.addColorStop(1, 'rgba(255,250,230,0)'); c.fillStyle = g; c.fillRect(0, 380, W, 1100);
          const sc = .85 + .15 * ease3((pt - 2.4) / 1.2); c.translate(W / 2, 900); c.scale(sc, sc);
          c.font = hi ? '40px "Tiro Devanagari Hindi"' : '34px "Marcellus"'; spacing(c, hi ? 0 : 10); c.fillStyle = '#7a4a14'; c.fillText(hi ? 'हल्दी की रस्म' : 'THE CEREMONY OF', 0, -170); spacing(c, 0);
          foil(c, hi ? 'हल्दी' : 'Haldi', 0, -20, { font: hi ? '230px "Yatra One"' : '250px "Playball"', dark: true, t });
          const { a, b, two } = nm(card);
          c.font = deva(card) ? '84px "Amita"' : '104px "Great Vibes"'; c.fillStyle = '#b3361e'; c.shadowColor = 'rgba(255,250,228,.95)'; c.shadowBlur = 10;
          c.fillText(two ? `${a} & ${b}` : a, 0, 150); c.restore();
        }
        sheer(c, open, t);
      },
      urli(c, s, pt, t, P) {
        const k = kOf(P), hi = hiOf(P), card = P.card, letters = P.ctx.letters, u = pt / s.d;
        // straight down into a big brass bowl of turmeric on a banana leaf, petals floating round their monogram
        const bg = art('hd-leaf', W, H, k, g => {
          const R = rng(5), gr = g.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 1200); gr.addColorStop(0, '#f6deaa'); gr.addColorStop(1, '#c98a4a'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
          for (let i = 0; i < 6000; i++) { g.fillStyle = `rgba(120,70,20,${R() * .06})`; g.fillRect(R() * W, R() * H, 3, 3); }
          // banana leaves under the bowl
          for (const [a, l] of [[-.6, 1200], [.5, 1150], [2.4, 1100], [3.6, 1180]]) { g.save(); g.translate(W / 2, H / 2); g.rotate(a); const lg = g.createLinearGradient(0, -120, 0, 120); lg.addColorStop(0, '#2f6a2a'); lg.addColorStop(.5, '#5d9a40'); lg.addColorStop(1, '#2f6a2a'); g.fillStyle = lg; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(l * .5, -200, l, -30); g.quadraticCurveTo(l * .5, 160, 0, 0); g.fill(); g.strokeStyle = 'rgba(220,240,180,.45)'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(l * .5, -20, l, -30); g.stroke(); for (let x = 60; x < l; x += 34) { g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, -10 * x / l); g.lineTo(x + 40, -120 * (1 - x / l)); g.moveTo(x, -10 * x / l); g.lineTo(x + 40, 110 * (1 - x / l)); g.stroke(); } g.restore(); }
          // little brass katoris of kumkum, rice and rose petals around
          for (const [x, y, col] of [[150, 520, '#d62839'], [930, 540, '#fff6e0'], [170, 1600, '#ff8fab'], [900, 1580, '#ff9f1c']]) {
            const bb = g.createRadialGradient(x - 20, y - 20, 4, x, y, 110); bb.addColorStop(0, '#fff0b0'); bb.addColorStop(.6, '#c9952e'); bb.addColorStop(1, '#6e4208'); g.fillStyle = bb; g.beginPath(); g.arc(x, y, 110, 0, TAU); g.fill();
            g.fillStyle = col; g.beginPath(); g.arc(x, y, 82, 0, TAU); g.fill(); for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.arc(x + (R() - .5) * 140, y + (R() - .5) * 140, 4, 0, TAU); g.fill(); }
          }
          // the big bowl: brass rim and turmeric paste
          const cx = W / 2, cy = H / 2, rb = g.createRadialGradient(cx - 120, cy - 140, 40, cx, cy, 470); rb.addColorStop(0, '#fff2b8'); rb.addColorStop(.5, '#d9a640'); rb.addColorStop(.8, '#8a5a10'); rb.addColorStop(1, '#5a3a08');
          g.save(); g.shadowColor = 'rgba(60,30,0,.5)'; g.shadowBlur = 60; g.shadowOffsetY = 30; g.fillStyle = rb; g.beginPath(); g.arc(cx, cy, 460, 0, TAU); g.fill(); g.restore();
          g.strokeStyle = 'rgba(255,240,190,.7)'; g.lineWidth = 6; g.beginPath(); g.arc(cx, cy, 430, 0, TAU); g.stroke();
          for (let i = 0; i < 48; i++) { const a = i / 48 * TAU; g.fillStyle = '#f6d27a'; g.beginPath(); g.arc(cx + Math.cos(a) * 445, cy + Math.sin(a) * 445, 6, 0, TAU); g.fill(); }
          const pg = g.createRadialGradient(cx - 80, cy - 90, 20, cx, cy, 400); pg.addColorStop(0, '#ffe066'); pg.addColorStop(.6, '#f7b500'); pg.addColorStop(1, '#d98a00'); g.fillStyle = pg; g.beginPath(); g.arc(cx, cy, 400, 0, TAU); g.fill();
          g.strokeStyle = 'rgba(180,100,0,.18)'; g.lineWidth = 10; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(cx + (R() - .5) * 200, cy + (R() - .5) * 200, 120 + R() * 200, R() * 6, R() * 6 + 1.5); g.stroke(); }
        });
        const z = 1.25 - .2 * ease3(u), rot = u * .25;
        c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.rotate(rot); c.translate(-W / 2, -H / 2); c.drawImage(bg, 0, 0, W, H);
        // marigold heads drifting slowly round the paste
        for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + t * .12, r = 330 + (i % 3) * 18; marigold(c, W / 2 + Math.cos(a) * r, H / 2 + Math.sin(a) * r, 26 + (i % 2) * 6, i % 2 ? 38 : 28); }
        for (let i = 0; i < 10; i++) { const a = i / 10 * TAU - t * .08; rose(c, W / 2 + Math.cos(a) * 250, H / 2 + Math.sin(a) * 250, 18, '#ffd0dc', '#e0607e', a); }
        c.restore();
        // the monogram pressed into the turmeric, then their names on the rim
        const ma = ease((pt - .4) / 1);
        if (ma > 0) {
          c.save(); c.globalAlpha = ma; c.textAlign = 'center'; c.textBaseline = 'middle';
          c.font = `700 ${letters.length > 1 ? 190 : 240}px "Cinzel Decorative"`; c.fillStyle = 'rgba(150,70,0,.55)'; c.fillText(letters.join(''), W / 2 + 4, H / 2 - 6);
          c.fillStyle = 'rgba(255,240,170,.75)'; c.fillText(letters.join(''), W / 2 - 3, H / 2 - 12);
          c.restore();
        }
        const na = ease((pt - 1.2) / .9);
        if (na > 0) {
          const { a, b, two } = nm(card);
          c.save(); c.globalAlpha = na; c.textAlign = 'center'; c.textBaseline = 'middle';
          const g = c.createLinearGradient(0, 1500, 0, H); g.addColorStop(0, 'rgba(255,248,225,0)'); g.addColorStop(.35, 'rgba(255,248,225,.88)'); c.fillStyle = g; c.fillRect(0, 1450, W, H - 1450);
          c.font = deva(card) ? '84px "Amita"' : '104px "Great Vibes"'; c.fillStyle = '#b3361e'; c.fillText(two ? `${a} & ${b}` : a, W / 2, 1640 + (1 - na) * 20);
          c.font = hi ? '40px "Tiro Devanagari Hindi"' : 'italic 42px "Cormorant Garamond"'; c.fillStyle = '#5a3208'; c.fillText(dateRange(card, hi), W / 2, 1735);
          c.restore();
          const g2 = c.createLinearGradient(0, 0, 0, 380); g2.addColorStop(0, `rgba(255,248,225,${(.88 * na).toFixed(2)})`); g2.addColorStop(1, 'rgba(255,248,225,0)'); c.fillStyle = g2; c.fillRect(0, 0, W, 380);
          c.save(); c.globalAlpha = na; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = hi ? '48px "Tiro Devanagari Hindi"' : '38px "Marcellus"'; spacing(c, hi ? 0 : 9); c.fillStyle = '#7a4a14';
          c.fillText(hi ? 'थोड़ी हल्दी, ढेर सारा प्यार' : 'A LITTLE TURMERIC, A LOT OF LOVE', W / 2, 200); spacing(c, 0); c.restore();
        }
        petalRain(c, t, 18, 4);
        splash(c, k, (pt - (s.d - .5)) / .5, true, 11, W / 2, H / 2);
      },
      swing(c, s, pt, t, P) {
        const k = kOf(P), z = 1.04 - .04 * ease3(pt / s.d);
        c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2);
        c.drawImage(courtArt(k, 1), 0, 0, W, H);
        swing(c, W / 2, 330, 1520, 420, Math.sin(t * 1.1) * .08, k);
        const u = urli(k, 120); c.drawImage(u, 120, 1560, 288, 144); c.drawImage(u, W - 408, 1560, 288, 144);
        c.restore();
        shafts(c, t, .8);
        petalRain(c, t, 16, 9);
        splash(c, k, pt / .45, false, 11);
      },
      court(c, s, pt, t, P) {
        const k = kOf(P), i = s.i || 0, tone = i % 3, z = 1.06 - .06 * ease3(pt / s.d);
        c.save(); c.translate(W / 2 + (i % 2 ? -1 : 1) * 20 * ease3(pt / s.d), H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2);
        c.drawImage(courtArt(k, tone), 0, 0, W, H);
        // the couple for this function, in front of the middle arch
        const img = coupleImage(P, s.e && s.e.name ? (/haldi|हल्दी/i.test(s.e.name) ? s.e.name : `Haldi ${s.e.name}`) : 'Haldi'), L = P.shotLook ? P.shotLook('court') : null;
        const ci = ease((pt - .4) / 1);
        if (img) { c.save(); c.globalAlpha = ci; K.cutout(c, img, W / 2, 1890 + (1 - ci) * 50, 800, 'full', L, t); c.restore(); }
        else { swing(c, W / 2, 330, 1500, 420, Math.sin(t * 1.1) * .08, k); }
        const u = urli(k, 110); c.drawImage(u, 30, 1690, 264, 132); c.drawImage(u, W - 294, 1690, 264, 132);
        c.restore();
        shafts(c, t, .7);
        petalRain(c, t, /holi|phool|फूल/i.test(s.e ? s.e.name : '') ? 60 : 18, 20 + i);
        splash(c, k, pt / .45, false, 30 + i * 7, i % 2 ? 300 : 780, 1100);
        splash(c, k, (pt - (s.d - .5)) / .5, true, 31 + i * 7, i % 2 ? 780 : 300, 900);
      },
      thaal(c, s, pt, t, P) {
        const k = kOf(P);
        const bg = art('hd-thaal', W, H, k, g => {
          const R = rng(17); g.fillStyle = '#f7b500'; g.fillRect(0, 0, W, H);
          const gr = g.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 1200); gr.addColorStop(0, '#ffe7a0'); gr.addColorStop(1, '#e89a0c'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
          // a frame of marigolds and rose petals on the yellow cloth
          for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(255,255,255,${R() * .06})`; g.fillRect(R() * W, R() * H, 2, 2); }
          const cx = W / 2, cy = 960, rb = g.createRadialGradient(cx - 150, cy - 200, 40, cx, cy, 560); rb.addColorStop(0, '#fff6c8'); rb.addColorStop(.6, '#e2b24a'); rb.addColorStop(1, '#8a5a10');
          g.save(); g.shadowColor = 'rgba(90,40,0,.45)'; g.shadowBlur = 50; g.shadowOffsetY = 24; g.fillStyle = rb; g.beginPath(); g.arc(cx, cy, 520, 0, TAU); g.fill(); g.restore();
          g.fillStyle = '#fffaf0'; g.beginPath(); g.arc(cx, cy, 440, 0, TAU); g.fill();
          g.strokeStyle = '#d9a640'; g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, 420, 0, TAU); g.stroke(); g.lineWidth = 1.5; g.beginPath(); g.arc(cx, cy, 408, 0, TAU); g.stroke();
          for (let i = 0; i < 36; i++) { const a = i / 36 * TAU; g.save(); g.translate(cx + Math.cos(a) * 480, cy + Math.sin(a) * 480); g.rotate(a); g.fillStyle = '#c9952e'; g.beginPath(); g.ellipse(0, 0, 18, 9, 0, 0, TAU); g.fill(); g.restore(); }
          // engraving on the brass rim: a ring of dots and a scalloped line
          g.strokeStyle = 'rgba(120,70,10,.55)'; g.lineWidth = 2.5; g.beginPath(); for (let i = 0; i <= 240; i++) { const a = i / 240 * TAU, r = 500 + Math.abs(Math.sin(a * 24)) * 10; i ? g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : g.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } g.stroke();
          for (let i = 0; i < 72; i++) { const a = i / 72 * TAU; g.fillStyle = 'rgba(255,240,190,.8)'; g.beginPath(); g.arc(cx + Math.cos(a) * 458, cy + Math.sin(a) * 458, 4, 0, TAU); g.fill(); }
          // little brass katoris on the rim: kumkum, rice, haldi, petals
          for (const [a, col] of [[-2.36, '#d62839'], [-.78, '#fff6e0'], [.78, '#ffb703'], [2.36, '#ff8fab']]) {
            const x = cx + Math.cos(a) * 560, y = cy + Math.sin(a) * 600, kb = g.createRadialGradient(x - 20, y - 20, 4, x, y, 92);
            kb.addColorStop(0, '#fff3c0'); kb.addColorStop(.6, '#d9a640'); kb.addColorStop(1, '#6e4208'); g.save(); g.shadowColor = 'rgba(80,40,0,.45)'; g.shadowBlur = 24; g.shadowOffsetY = 10; g.fillStyle = kb; g.beginPath(); g.arc(x, y, 92, 0, TAU); g.fill(); g.restore();
            g.fillStyle = col; g.beginPath(); g.arc(x, y, 68, 0, TAU); g.fill(); for (let j = 0; j < 30; j++) { g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.arc(x + (R() - .5) * 110, y + (R() - .5) * 110, 3, 0, TAU); g.fill(); }
          }
          // two rings of marigolds hugging the thaal, with mango leaves between
          for (let i = 0; i < 44; i++) { const a = i / 44 * TAU; leaf(g, cx + Math.cos(a) * 610, cy + Math.sin(a) * 650, 70, 24, a, i % 2 ? '#3f7a3c' : '#5d9450'); }
          for (let i = 0; i < 40; i++) { const a = i / 40 * TAU; marigold(g, cx + Math.cos(a) * 575, cy + Math.sin(a) * 615, 28, i % 2 ? 38 : 26); }
          for (let i = 0; i < 30; i++) { const a = (i + .5) / 30 * TAU; marigold(g, cx + Math.cos(a) * 690, cy + Math.sin(a) * 730, 34, i % 2 ? 28 : 40); }
          for (let i = 0; i < 30; i++) { const a = (i + .5) / 30 * TAU; rose(g, cx + Math.cos(a) * 640, cy + Math.sin(a) * 680, 16, '#ffd0dc', '#e0607e', a); }
          for (let i = 0; i < 40; i++) { const a = R() * TAU, d = 560 + R() * 260; g.fillStyle = R() > .5 ? '#e0405e' : '#ff8fab'; g.beginPath(); g.ellipse(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 1.1, 16, 9, R() * 3, 0, TAU); g.fill(); }
          for (const [x, y] of [[150, 160], [930, 160], [150, 1760], [930, 1760]]) { for (let j = 0; j < 6; j++) leaf(g, x, y, 90, 30, j * 1.05, j % 2 ? '#3f7a3c' : '#5d9450'); marigold(g, x, y, 44, 34); }
        });
        const z = 1.08 - .08 * ease3(pt / s.d);
        c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2); c.drawImage(bg, 0, 0, W, H); c.restore();
        for (const [x, y] of [[300, 1700], [780, 1700]]) diya(c, x, y, 46, t);
        petalRain(c, t, 12, 2);
        splash(c, k, pt / .45, false, 51);
      },
      holi(c, s, pt, t, P) {
        const k = kOf(P), z = 1.1 - .06 * ease3(pt / s.d);
        c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2);
        c.drawImage(courtArt(k, 2), 0, 0, W, H);
        swing(c, W / 2, 330, 1290, 420, Math.sin(t * 1.1) * .07, k);
        c.restore();
        c.fillStyle = 'rgba(255,246,220,.35)'; c.fillRect(0, 0, W, H);
        shafts(c, t, 1.2);
        // a burst of petals thrown up, then raining down
        if (pt < 2.4) for (const [x, y] of [[240, 1700], [840, 1700], [540, 1800]]) K.burst(c, x, y, pt / 2.4, '255,170,40', 26, 620);
        petalRain(c, t, 90, 33, 70);
        splash(c, k, pt / .45, false, 61);
      },
    }
  };
})(Cinema.kit));

} catch (e) { if (typeof console !== 'undefined') console.warn('Cinema: story-haldi.js', e); }

// ---------- js/cinema/story-lovestory.js ----------
try {
// Our Love Story: the reference film for the cinema kit (see js/cinema.js). A café table seen from above, a phone a
// hand picks up, the phone's photo framed on a wall of memories, down to the TV, through it into the sky where a gold
// monogram rises; then the invitation over a resort, every function with its own name, the venue and thank you.
// Copy this file's shape for a new film: a def with an id, looks, a timeline (which shots, how long) and shots.
Cinema.register((K => {
  const { W, H, TAU, rng, clamp, ease, ease3, lerp, mix, art, glow, sky, rrect, leaf, foliage, blossom, rose, lotus, lotusPad, rangoli, eucalyptus, palm, planks,
    portrait, phone, PHONE, hand, skyArt, monogramArt, orchidSpray, bougainvillea, clean, dateRange, spacing, coupleImage } = K;

  // ---- still art, painted once (K.art caches it per size) ----
  function tableArt(k, letters) {
    return art(`table-${letters.join('')}`, W, H, k, c => {
      const R = rng(77);
      planks(c, 0, 0, W, H, '#5b3b24', R);
      c.save(); c.shadowColor = 'rgba(0,0,0,.55)'; c.shadowBlur = 60; c.shadowOffsetX = 18; c.shadowOffsetY = 30;
      c.beginPath(); c.arc(620, 880, 760, 0, TAU); c.fillStyle = '#8a5530'; c.fill(); c.restore();
      c.save(); c.beginPath(); c.arc(620, 880, 760, 0, TAU); c.clip();
      planks(c, -200, 0, W + 400, H, '#a86f43', R, false);
      const g = c.createRadialGradient(480, 600, 100, 620, 880, 780); g.addColorStop(0, 'rgba(255,220,170,.28)'); g.addColorStop(.7, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(40,18,6,.45)');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.restore();
      c.strokeStyle = '#6a3c1e'; c.lineWidth = 14; c.beginPath(); c.arc(620, 880, 752, 0, TAU); c.stroke();
      c.strokeStyle = 'rgba(255,220,170,.35)'; c.lineWidth = 3; c.beginPath(); c.arc(620, 880, 742, 0, TAU); c.stroke();
      // roses in kraft paper (top right)
      c.save(); c.translate(820, 330); c.rotate(-.55);
      c.save(); c.shadowColor = 'rgba(30,12,2,.45)'; c.shadowBlur = 30; c.shadowOffsetY = 16;
      for (const [w0, col] of [[300, '#c9a27a'], [250, '#b88f66']]) { c.fillStyle = col; c.beginPath(); c.moveTo(-w0, -60); c.lineTo(w0, -60); c.lineTo(46, 520); c.lineTo(-46, 520); c.closePath(); c.fill(); }
      c.restore();
      c.strokeStyle = 'rgba(90,60,30,.35)'; c.lineWidth = 2; for (const x of [-120, 0, 110]) { c.beginPath(); c.moveTo(x, -50); c.lineTo(x * .12, 500); c.stroke(); }
      const rb = c.createLinearGradient(-80, 300, 80, 340); rb.addColorStop(0, '#e9a4b4'); rb.addColorStop(.5, '#f8d3dc'); rb.addColorStop(1, '#d98a9e');
      c.fillStyle = rb; c.beginPath(); c.moveTo(-98, 300); c.lineTo(98, 300); c.lineTo(92, 336); c.lineTo(-92, 336); c.closePath(); c.fill();
      for (const d of [-1, 1]) { c.beginPath(); c.moveTo(d * 10, 330); c.quadraticCurveTo(d * 40, 420, d * 26, 500); c.lineTo(d * 44, 492); c.quadraticCurveTo(d * 56, 420, d * 22, 330); c.fill(); }
      for (let i = 0; i < 22; i++) leaf(c, (R() - .5) * 460, -60 + (R() - .5) * 220, 110 + R() * 60, 34, R() * TAU, R() > .5 ? '#3f7a3c' : '#5d9450');
      const spots = [[0, -80, 92], [-150, -40, 80], [150, -50, 82], [-80, -200, 78], [90, -200, 80], [-220, -150, 64], [220, -160, 66], [0, 40, 70], [-10, -300, 66]];
      spots.forEach(([x, y, r], i) => rose(c, x, y, r, i % 3 ? '#ffc3d1' : '#ffd9e2', i % 3 ? '#e0607e' : '#e98aa2', R() * 3));
      for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.arc((R() - .5) * 460, -80 + (R() - .5) * 300, 5 + R() * 4, 0, TAU); c.fill(); }
      c.restore();
      // a little card by the flowers
      c.save(); c.translate(500, 640); c.rotate(.12); c.shadowColor = 'rgba(0,0,0,.3)'; c.shadowBlur = 12; c.shadowOffsetY = 6;
      c.fillStyle = '#e8d3b4'; c.fillRect(-90, -55, 180, 110); c.shadowColor = 'transparent';
      c.fillStyle = '#7a4a26'; c.font = '44px "Great Vibes"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Forever', 0, 4); c.restore();
      // the latte: saucer, cup, foam with their monogram
      const lx = 300, ly = 1010;
      c.save(); c.shadowColor = 'rgba(30,12,2,.5)'; c.shadowBlur = 36; c.shadowOffsetX = 10; c.shadowOffsetY = 20;
      c.fillStyle = '#f2ece4'; c.beginPath(); c.arc(lx, ly, 190, 0, TAU); c.fill(); c.restore();
      const sg = c.createRadialGradient(lx - 50, ly - 60, 20, lx, ly, 190); sg.addColorStop(0, '#ffffff'); sg.addColorStop(1, '#ddd3c6'); c.fillStyle = sg; c.beginPath(); c.arc(lx, ly, 186, 0, TAU); c.fill();
      c.fillStyle = '#f7f3ee'; rrect(c, lx + 110, ly - 26, 110, 52, 26); c.fill();
      c.save(); c.shadowColor = 'rgba(0,0,0,.25)'; c.shadowBlur = 14; c.fillStyle = '#ffffff'; c.beginPath(); c.arc(lx, ly, 140, 0, TAU); c.fill(); c.restore();
      const fg = c.createRadialGradient(lx, ly, 10, lx, ly, 120); fg.addColorStop(0, '#f1dcb9'); fg.addColorStop(.7, '#d9ae78'); fg.addColorStop(1, '#8a5428');
      c.fillStyle = fg; c.beginPath(); c.arc(lx, ly, 120, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(250,236,210,.85)'; c.lineWidth = 4;
      for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(lx, ly + 6, 96 - i * 9, Math.PI * .15, Math.PI * .85); c.stroke(); }
      c.fillStyle = 'rgba(110,62,26,.82)'; c.font = `700 ${letters.length > 1 ? 92 : 120}px "Cinzel Decorative"`; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.save(); c.shadowColor = 'rgba(110,62,26,.6)'; c.shadowBlur = 6;
      if (letters.length > 1) { c.fillText(letters[0], lx - 26, ly - 18); c.fillText(letters[1], lx + 30, ly + 22); } else c.fillText(letters[0] || '♥', lx, ly);
      c.restore();
      // keys with a leather tag
      c.save(); c.translate(760, 1190); c.rotate(.4);
      c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 10; c.shadowOffsetY = 6;
      c.strokeStyle = '#b9bcc4'; c.lineWidth = 8; c.beginPath(); c.arc(0, 0, 36, 0, TAU); c.stroke();
      for (const [a, len] of [[.4, 150], [1.2, 130]]) { c.save(); c.rotate(a); const kg = c.createLinearGradient(0, -12, 0, 12); kg.addColorStop(0, '#e8eaee'); kg.addColorStop(1, '#8d929c'); c.fillStyle = kg;
        c.beginPath(); c.arc(56, 0, 24, 0, TAU); c.fill(); c.fillRect(70, -9, len, 18); for (let t2 = 0; t2 < 4; t2++) c.fillRect(100 + t2 * 22, 9, 10, 10 + (t2 % 2) * 6); c.restore(); }
      c.fillStyle = '#7a4524'; c.save(); c.rotate(-1.2); rrect(c, 30, -24, 110, 48, 16); c.fill(); c.restore();
      c.restore();
      // warm window light across the table
      const wl = c.createLinearGradient(0, 0, W, H); wl.addColorStop(0, 'rgba(255,226,170,.22)'); wl.addColorStop(.5, 'rgba(255,226,170,0)'); wl.addColorStop(1, 'rgba(0,0,0,.25)');
      c.fillStyle = wl; c.fillRect(0, 0, W, H);
    });
  }
  // The living room: a wall of framed memories (the big one is their portrait), shelves, plants, the TV on a
  // bookshelf, a rug. 1080 wide, 2700 tall; the camera moves down it.
  const HOME = { h: 2700, frame: { x: 540, y: 640, w: 470, h: 600, border: 26, mat: 46 }, tv: { x: 540, y: 1690, w: 700, h: 394 } };
  function homeArt(k) {
    return art('home', W, HOME.h, k, c => {
      const R = rng(909);
      const wg = c.createLinearGradient(0, 0, 0, HOME.h); wg.addColorStop(0, '#f0dfc8'); wg.addColorStop(1, '#e2c7a6'); c.fillStyle = wg; c.fillRect(0, 0, W, HOME.h);
      for (let i = 0; i < 9000; i++) { c.fillStyle = `rgba(120,80,40,${R() * .05})`; c.fillRect(R() * W, R() * HOME.h, 2, 2); }
      glow(c, 160, 300, 900, 'rgba(255,246,226,.55)');
      const frame = (x, y, w, h, wood, inner) => {
        c.save(); c.shadowColor = 'rgba(60,35,15,.35)'; c.shadowBlur = 22; c.shadowOffsetX = 8; c.shadowOffsetY = 14;
        c.fillStyle = wood; c.fillRect(x - w / 2, y - h / 2, w, h); c.restore();
        c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = 2; c.strokeRect(x - w / 2 + 2, y - h / 2 + 2, w - 4, h - 4);
        c.fillStyle = '#fbf8f2'; const b = Math.min(w, h) * .06; c.fillRect(x - w / 2 + b, y - h / 2 + b, w - b * 2, h - b * 2);
        if (inner) inner(x - w / 2 + b * 2.2, y - h / 2 + b * 2.2, w - b * 4.4, h - b * 4.4);
      };
      const hills = (x, y, w, h) => { c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); sky(c, [[0, '#cfe3ee'], [1, '#f6e2c6']], y, y + h); c.fillStyle = '#f3c77c'; c.beginPath(); c.arc(x + w * .7, y + h * .35, h * .1, 0, TAU); c.fill();
        [['#9db884', .55], ['#7a9e6a', .68], ['#5c8452', .82]].forEach(([col, k2]) => { c.fillStyle = col; c.beginPath(); c.moveTo(x, y + h); for (let i = 0; i <= 8; i++) c.lineTo(x + w * i / 8, y + h * k2 - Math.sin(i * 1.3 + k2 * 9) * h * .08); c.lineTo(x + w, y + h); c.fill(); }); c.restore(); };
      const botanical = (x, y, w, h) => { c.fillStyle = '#f3efe4'; c.fillRect(x, y, w, h); eucalyptus(c, x + w * .2, y + h * .85, h * .75, -1.25, '#8fae94'); };
      const abstract = (x, y, w, h) => { c.fillStyle = '#efe4d2'; c.fillRect(x, y, w, h); c.fillStyle = '#d99a6c'; c.beginPath(); c.arc(x + w * .4, y + h * .45, w * .26, 0, TAU); c.fill(); c.fillStyle = '#7f9a86'; c.beginPath(); c.ellipse(x + w * .6, y + h * .7, w * .3, h * .12, 0, 0, TAU); c.fill(); };
      const F = HOME.frame;
      // the big portrait frame (its photo is drawn live); the other frames around it
      frame(F.x, F.y, F.w, F.h, '#b98b5a');
      c.fillStyle = '#fbf8f2'; c.fillRect(F.x - F.w / 2 + F.border, F.y - F.h / 2 + F.border, F.w - F.border * 2, F.h - F.border * 2);
      [[170, 260, 200, 250, '#c49a6c', hills], [170, 600, 180, 220, '#3d2b1f', botanical], [175, 900, 220, 170, '#c49a6c', abstract],
        [905, 240, 210, 170, '#3d2b1f', hills], [910, 520, 190, 240, '#c49a6c', null], [900, 830, 170, 200, '#c49a6c', botanical], [540, 210, 230, 150, '#3d2b1f', abstract]]
        .forEach(([x, y, w, h, wood, inner]) => frame(x, y, w, h, wood, inner));
      // a floating shelf with plants and books
      c.fillStyle = '#8a5a34'; c.fillRect(640, 1080, 380, 22); c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(640, 1102, 380, 10);
      const pot = (x, y, s, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(x - s * .5, y - s * .7); c.lineTo(x + s * .5, y - s * .7); c.lineTo(x + s * .38, y); c.lineTo(x - s * .38, y); c.fill(); foliage(c, R, x, y - s * 1.2, s * .9, s * .7, 70, 115, 36, s * .4, 45); };
      pot(700, 1080, 90, '#e9e2d6'); pot(960, 1080, 80, '#c9774a');
      ['#7a2e2e', '#2e4a6a', '#c9a24a', '#3d6a4a'].forEach((col, i) => { c.fillStyle = col; c.fillRect(790 + i * 26, 1080 - 110 + i * 6, 22, 110 - i * 6); });
      // a hanging plant
      c.strokeStyle = '#c8b48a'; c.lineWidth = 3; for (const dx of [-30, 0, 30]) { c.beginPath(); c.moveTo(1000, 0); c.lineTo(1000 + dx, 330); c.stroke(); }
      pot(1000, 400, 90, '#f0ebe2');
      for (let i = 0; i < 6; i++) { c.strokeStyle = '#4f8a44'; c.lineWidth = 4; c.beginPath(); c.moveTo(980 + i * 8, 400); c.quadraticCurveTo(960 + i * 12, 520, 990 + i * 6, 640 + i * 20); c.stroke(); for (let j = 0; j < 8; j++) leaf(c, 980 + i * 8 - j * 2, 410 + j * 30 + i * 3, 30, 12, Math.PI / 2 + (j % 2 ? .8 : -.8), '#5d9a4c', false); }
      // the bookshelf console under the TV
      const top = 1960;
      c.save(); c.shadowColor = 'rgba(60,35,15,.4)'; c.shadowBlur = 30; c.shadowOffsetY = 16; c.fillStyle = '#9a6a3e'; c.fillRect(60, top, 960, 470); c.restore();
      c.fillStyle = '#b07c4c'; c.fillRect(50, top - 22, 980, 30);
      for (const [sy, sh] of [[top + 30, 200], [top + 250, 200]]) {
        c.fillStyle = '#5a3a20'; c.fillRect(90, sy, 900, sh);
        let bx = 100;
        while (bx < 960) {
          const bw = 18 + R() * 26, bh = sh * (.62 + R() * .32);
          if (R() < .12) { c.fillStyle = '#e9e2d6'; c.beginPath(); c.ellipse(bx + 30, sy + sh - 40, 30, 40, 0, 0, TAU); c.fill(); bx += 70; continue; }
          c.fillStyle = ['#8a2e2e', '#2e4a6a', '#c9a24a', '#3d6a4a', '#e2d3b4', '#6a3a5a', '#b45a2a'][Math.floor(R() * 7)];
          c.fillRect(bx, sy + sh - bh, bw, bh); c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(bx + 3, sy + sh - bh + 10, bw - 6, 4);
          bx += bw + 2;
        }
      }
      // plants either side of the TV
      for (const [x, s] of [[110, 230], [970, 210]]) { c.fillStyle = '#d9cfbf'; rrect(c, x - s * .35, top - s * .7, s * .7, s * .7, 14); c.fill(); foliage(c, R, x, top - s * 1.25, s * .8, s * .7, 260, 112, 34, s * .28, 50); for (let i = 0; i < 8; i++) blossom(c, x + (R() - .5) * s, top - s * (1 + R() * .6), 16, R() > .5 ? '#e2348f' : '#ffb238', '#fff', R() * 6); }
      // floor and rug
      c.fillStyle = '#a77a52'; c.fillRect(0, 2440, W, HOME.h - 2440);
      const rg = (x, y, w, h) => { c.fillStyle = '#9c2f2f'; c.fillRect(x, y, w, h); c.fillStyle = '#1f3e6a'; c.fillRect(x + 30, y + 30, w - 60, h - 60); c.fillStyle = '#d9b66a'; c.fillRect(x + 60, y + 60, w - 120, h - 120); c.fillStyle = '#9c2f2f'; c.fillRect(x + 80, y + 80, w - 160, h - 160);
        for (let i = 0; i < 12; i++) { c.fillStyle = i % 2 ? '#f0e2c0' : '#1f3e6a'; const cx = x + 120 + i * (w - 240) / 11; c.beginPath(); c.moveTo(cx, y + 110); c.lineTo(cx + 22, y + 140); c.lineTo(cx, y + 170); c.lineTo(cx - 22, y + 140); c.fill(); }
        rangoli(c, x + w / 2, y + h * .55, 90); };
      rg(40, 2480, 1000, 260);
      const sh = c.createLinearGradient(0, 2440, 0, 2520); sh.addColorStop(0, 'rgba(40,20,8,.35)'); sh.addColorStop(1, 'rgba(40,20,8,0)'); c.fillStyle = sh; c.fillRect(0, 2440, W, 80);
    });
  }
  function tv(c, x, y, w, h, on, skyCv) {
    c.save(); c.shadowColor = 'rgba(30,15,5,.45)'; c.shadowBlur = 30; c.shadowOffsetY = 14; c.fillStyle = '#121216'; rrect(c, x - w / 2, y - h / 2, w, h, 10); c.fill(); c.restore();
    c.fillStyle = '#2a2a30'; c.fillRect(x - 100, y + h / 2, 200, 16); c.fillRect(x - 160, y + h / 2 + 16, 320, 10);
    const sx = x - w / 2 + 12, sy = y - h / 2 + 12, sw = w - 24, sh = h - 24;
    c.fillStyle = '#050508'; c.fillRect(sx, sy, sw, sh);
    if (on > 0) {
      c.save(); c.beginPath(); c.rect(sx, sy, sw, sh); c.clip(); c.globalAlpha = on;
      const k = Math.max(sw / W, sh / H); c.drawImage(skyCv, x - W * k / 2, y - H * k / 2, W * k, H * k);
      c.restore();
      if (on < 1) { c.fillStyle = `rgba(255,255,255,${(1 - on) * .9})`; c.fillRect(sx, y - 2 - (1 - on) * 6, sw, 4 + (1 - on) * 12); }
    } else { const gl = c.createLinearGradient(sx, sy, sx + sw, sy + sh); gl.addColorStop(0, 'rgba(255,255,255,.07)'); gl.addColorStop(.6, 'rgba(255,255,255,0)'); c.fillStyle = gl; c.fillRect(sx, sy, sw, sh); }
  }
  // The resort at the foot of the invitation: a modern villa, a pool with lotus, palms and flowers
  function resortArt(k) {
    return art('resort', W, 760, k, c => {
      const R = rng(55), y0 = 0;
      for (let i = 0; i < 26; i++) foliage(c, R, i * 44, y0 + 180 + R() * 30, 70, 60, 40, 110, 30, 30, 40);
      // a two-storey villa: stone and glass, warm lights inside, a deep roof
      c.fillStyle = '#efe9de'; c.fillRect(260, y0 + 70, 560, 110); c.fillStyle = '#d9cfbf'; c.fillRect(230, y0 + 58, 620, 18);
      c.fillStyle = '#f4f1ea'; c.fillRect(120, y0 + 180, 840, 140); c.fillStyle = '#ded6c8'; c.fillRect(80, y0 + 166, 920, 22);
      c.fillStyle = '#b9a07a'; c.fillRect(120, y0 + 188, 120, 132); c.fillRect(840, y0 + 188, 120, 132);
      for (const [x0, x1, yy, hh] of [[290, 790, 88, 76], [260, 820, 206, 96]]) for (let x = x0; x < x1; x += 62) {
        const wg = c.createLinearGradient(0, y0 + yy, 0, y0 + yy + hh); wg.addColorStop(0, '#2c4a54'); wg.addColorStop(1, '#ffcf8a'); c.fillStyle = wg; c.fillRect(x, y0 + yy, 46, hh);
        c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(x + 5, y0 + yy + 4, 8, hh - 8); }
      c.fillStyle = '#d9cfbf'; c.fillRect(0, y0 + 320, W, 70);
      c.fillStyle = '#3fb4c8'; c.beginPath(); c.moveTo(150, y0 + 390); c.lineTo(930, y0 + 390); c.lineTo(1080, y0 + 640); c.lineTo(0, y0 + 640); c.closePath(); c.fill();
      const pg = c.createLinearGradient(0, y0 + 390, 0, y0 + 640); pg.addColorStop(0, 'rgba(255,255,255,.35)'); pg.addColorStop(1, 'rgba(0,60,90,.25)'); c.fillStyle = pg; c.fill();
      c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 2; for (let i = 0; i < 26; i++) { const yy = y0 + 400 + R() * 220, xx = 100 + R() * 880; c.beginPath(); c.moveTo(xx, yy); c.quadraticCurveTo(xx + 20, yy - 6, xx + 40, yy); c.stroke(); }
      for (let i = 0; i < 12; i++) { const x = i % 2 ? 60 + R() * 220 : 800 + R() * 220, y = y0 + 560 + R() * 70; lotusPad(c, x, y, 40, 14, R()); if (i % 3 === 0) lotus(c, x, y - 6, 46, .8); }
      for (const [x, h] of [[70, 300], [1010, 330]]) palm(c, x, y0 + 470, h, x < 500 ? .3 : -.3, R);
      c.fillStyle = '#5d9450'; c.fillRect(0, y0 + 640, W, 120);
      for (let i = 0; i < 60; i++) blossom(c, R() * W, y0 + 650 + R() * 100, 12 + R() * 8, ['#e2348f', '#ffffff', '#f06aaf', '#ffd166'][i % 4], '#fff', R() * 6);
      for (let i = 0; i < 40; i++) leaf(c, R() * W, y0 + 660 + R() * 100, 60, 20, -Math.PI / 2 + (R() - .5) * 2, '#3f7a3c');
    });
  }

  return {
    id: 'story-lovestory', order: 1, occasion: 'wedding', tune: 'romantic', thumb: 2.5,
    name: 'Our Love Story', note: 'A café table, a phone, a wall of memories, then through the TV into the sky: a love story that moves',
    names: ['Myra', 'Arjun'], ganesha: 'ganesha-01',
    // the painted looks the standard scenes use (the functions take theirs by name from fn)
    looks: { open: 'clouds-champagne', title: 'clouds-champagne', invite: 'clouds-champagne', events: ['haldi', 'lights', 'mandap-ivory'], date: 'rosegarden-golden', end: 'rosegarden-golden', final: 'blush-champagne' },
    fn: [[/haldi|pithi|ubtan|हल्दी|हलदी|पीठी|उबटन/i, 'haldi'], [/mehe?n?d|मेहँदी|मेहंदी|मेंहदी/i, 'mehendi-rani'], [/baraat|barat|ghud|ghod|sehra|बारात|घुड़चढ़ी|घुडचढी|सेहरा/i, 'haveli-roseblush'],
      [/sangeet|dance|dj|garba|dandiya|cocktail|संगीत|गरबा|डांडिया/i, 'lights'], [/lunch|daylight|brunch/i, 'temple-golden'], [/phera|vivah|wedding|varmala|jaimala|mandap|shaadi|फेरे|विवाह|शादी|वरमाला|जयमाला|मंडप/i, 'mandap-ivory'],
      [/reception|dinner|bhoj|swagat|स्वागत|रिसेप्शन|प्रीतिभोज|भोज/i, 'palace-rose']],
    // each function's own name over its screen
    titles: [[/haldi|pithi|ubtan|हल्दी/i, 'Sunshine Soirée'], [/mehe?n?d|मेहँदी|मेहंदी/i, 'Henna & Hues'], [/sangeet|dance|dj|cocktail|संगीत/i, 'Glitz, Glam & Grooves'],
      [/baraat|barat|ghud|बारात/i, 'The Grand Arrival'], [/lunch|daylight|brunch/i, 'The Daylight Gala'], [/phera|vivah|wedding|mandap|फेरे|विवाह/i, 'The Sacred Vows'],
      [/reception|dinner|स्वागत/i, 'An Evening of Elegance'], [/ring|engage|sagai|सगाई/i, 'The Promise'], [/puja|pooja|ganesh|पूजा/i, 'A Sacred Beginning']],
    // shots an owner's picture (img/scenes) may replace: the invitation's resort
    pictures: ['resort'],
    // The scenes, from the standard list (open, title, invite, event…, date, end, final): the café and home shots
    // replace the doors, the title becomes the sky shot, the invitation sits over the resort, no regards screen.
    timeline(S) {
      const at = k => S.findIndex(s => s.k === k);
      S.splice(at('open'), 1, { k: 'reel', reel: 'table', name: 'Café', d: 5.5 }, { k: 'reel', reel: 'home', name: 'Our Home', d: 7.5, cut: true, change: 'flash' });
      Object.assign(S[at('title')], { reel: 'sky', d: 4.5, cut: true, change: 'bloom' });
      delete S[at('title')].couple; delete S[at('title')].zone;
      Object.assign(S[at('invite')], { reel: 'resort', d: 6.5, change: 'none', board: false, scrim: true, zone: [150, 1150, 860] });
      if (at('end') >= 0) S.splice(at('end'), 1);
      let prev = '';
      S.forEach(s => {
        if (s.k !== 'event') return;
        s.datebar = true; s.scrim = true; s.pose = 'full'; s.board = false;
        s.change = /sangeet|dance|dj|cocktail|reception|संगीत|स्वागत/i.test(prev) ? 'clink' : 'sparkle';
        prev = s.e.name;
      });
      const d = S.find(s => s.k === 'date'); if (d) d.change = 'petals';
    },
    // One function per shot: (c, s, pt, t, P, K) — s: the scene, pt: seconds into it, t: seconds into the video, P: the player
    shots: {
      table(c, s, pt, t, P) {
        const k = Math.min(1.25, Math.max(.5, P.k)), card = P.card, img = coupleImage(P), letters = P.ctx.letters, u = pt / s.d;
        // phone: lying on the table → lit by a tap → lifted towards the camera; the camera then flies into its screen
        const lift = ease3((pt - 2.3) / 1.3), px = lerp(390, 540, lift), py = lerp(1360, 1080, lift), pa = lerp(-.2, 0, lift), ps = lerp(1, 1.18, lift);
        const lit = ease((pt - 1.8) / .35);
        const zEnd = Math.max(W / ((PHONE.w - PHONE.inset * 2) * 1.18), H / ((PHONE.h - PHONE.inset * 2) * 1.18)) * 1.02;
        const fly = ease3((pt - 2.9) / (s.d - 3.05)), z = lerp(1.06 + .05 * clamp(pt / 2.9), zEnd, fly);
        const cx = lerp(560, px, fly), cy = lerp(940, py, fly);
        c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-cx, -cy);
        c.drawImage(tableArt(k, letters), 0, 0, W, H);
        // steam over the latte
        c.save();
        for (let i = 0; i < 3; i++) { const ph = t * .7 + i * 2.1; c.strokeStyle = `rgba(255,250,240,${(.13 + .06 * Math.sin(ph)).toFixed(2)})`; c.lineWidth = 14; c.lineCap = 'round';
          c.beginPath(); c.moveTo(280 + i * 24, 990); c.bezierCurveTo(250 + i * 24 + Math.sin(ph) * 30, 900, 330 + i * 20 + Math.cos(ph) * 30, 840, 290 + i * 24, 760); c.stroke(); }
        c.restore();
        // the hand reaches in, taps the screen awake, and lets go as the phone rises
        const reach = ease3((pt - .3) / 1.3), tap = Math.sin(clamp((pt - 1.6) / .4) * Math.PI) * 14, away = ease3((pt - 2.25) / .9);
        const hx = lerp(760, 470, reach) + away * 220, hy = lerp(2350, 1500, reach) + tap + away * 900;
        phone(c, px, py, pa, ps, lit, img, t, card);
        if (reach > 0 && away < 1) hand(c, hx, hy, lerp(-.42, -.3, reach), 1.02);
        c.restore();
      },
      home(c, s, pt, t, P) {
        const k = Math.min(1.25, Math.max(.5, P.k)), card = P.card, img = coupleImage(P), letters = P.ctx.letters, u = pt / s.d;
        // into the portrait (as the phone's photo was) → out to the wall → down to the TV → it lights → through it
        const F = HOME.frame, T2 = HOME.tv, pw = F.w - F.border * 2 - F.mat * 2, ph2 = F.h - F.border * 2 - F.mat * 2;
        const z0 = Math.max(W / pw, H / ph2) * 1.02, out = ease3(pt / 2.6), down = ease3((pt - 2.7) / 1.7), on = ease((pt - 4.5) / .6);
        const zTv = Math.max(W / (T2.w - 24), H / (T2.h - 24)) * 1.05, into = clamp((pt - 5.2) / (s.d - 5.2)) ** 2.4;
        let z = lerp(z0, 1, out), cy = lerp(F.y, 960, out), cx = 540;
        cy = lerp(cy, 1620, down); z = lerp(z, 1.04, down);
        z = lerp(z, zTv, into); cy = lerp(cy, T2.y, into);
        c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-cx, -cy);
        c.drawImage(homeArt(k), 0, 0, W, HOME.h);
        portrait(c, img, F.x - pw / 2, F.y - ph2 / 2, pw, ph2, t);
        // two small memories in the gallery
        portrait(c, img, 910 - 70, 520 - 95, 140, 190, t, 1.6);
        tv(c, T2.x, T2.y, T2.w, T2.h, on, skyArt(k));
        c.restore();
        if (into > .55) { c.fillStyle = `rgba(255,252,245,${((into - .55) / .45 * .85).toFixed(2)})`; c.fillRect(0, 0, W, H); }
      },
      sky(c, s, pt, t, P) {
        const k = Math.min(1.25, Math.max(.5, P.k)), card = P.card, img = coupleImage(P), letters = P.ctx.letters, u = pt / s.d;
        const z = 1 + .06 * u;
        c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2); c.drawImage(skyArt(k), 0, 0, W, H); c.restore();
        const inn = ease3(pt / 1.6), spray = art('spray', 640, 640, k, g => orchidSpray(g, 40, 40, .62, 470, 5, rng(12)));
        // orchid sprays grow in from the four corners (one painted spray, mirrored)
        for (const [fx, fy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
          c.save(); c.translate(fx > 0 ? 0 : W, fy > 0 ? 0 : H); c.scale(fx, fy);
          c.translate((1 - inn) * -260 + Math.sin(t * .6 + fx * 2 + fy) * 6, (1 - inn) * -200);
          c.drawImage(spray, -40, -40, 640, 640); c.restore();
        }
        const m = monogramArt(letters, k), a = ease((pt - .3) / 1.1), sc = .82 + .18 * ease3((pt - .3) / 1.6);
        c.save(); c.globalAlpha = a; c.translate(W / 2, 820 + Math.sin(t * .8) * 6); c.scale(sc, sc);
        c.drawImage(m, -500, -560, 1000, 900);
        c.restore();
        // a gleam across the monogram
        const sh = (pt - 1.4) / 1.1;
        if (sh > 0 && sh < 1) { c.save(); c.globalCompositeOperation = 'screen'; const gx = 140 + sh * 800, g = c.createLinearGradient(gx - 90, 300, gx + 90, 900); g.addColorStop(0, 'rgba(255,248,220,0)'); g.addColorStop(.5, 'rgba(255,248,220,.55)'); g.addColorStop(1, 'rgba(255,248,220,0)'); c.fillStyle = g; c.fillRect(150, 260, 780, 760); c.restore(); }
        const two = clean(card.host2), na = ease((pt - 1.2) / .9);
        if (na > .01) {
          c.save(); c.globalAlpha = na; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '62px "Cinzel"'; spacing(c, 10);
          const txt = (two ? `${clean(card.host1)}  &  ${clean(card.host2)}` : clean(card.host1)).toUpperCase(), y = 1270;
          const ng = c.createLinearGradient(0, y - 34, 0, y + 30); ng.addColorStop(0, '#d9a640'); ng.addColorStop(.5, '#9a6414'); ng.addColorStop(1, '#6e4208');
          c.shadowColor = 'rgba(255,252,240,.95)'; c.shadowBlur = 22; c.fillStyle = ng; c.fillText(txt, W / 2, y); c.shadowBlur = 6; c.shadowColor = 'rgba(255,240,200,.8)'; c.fillText(txt, W / 2, y);
          c.shadowColor = 'rgba(255,252,240,.95)'; c.shadowBlur = 14; spacing(c, 6); c.font = 'italic 44px "Cormorant Garamond"'; c.fillStyle = '#6e4208'; c.fillText(dateRange(card, P.opt.lang === 'hi'), W / 2, y + 80);
          spacing(c, 0); c.restore();
        }
      },
      resort(c, s, pt, t, P) {
        const k = Math.min(1.25, Math.max(.5, P.k)), card = P.card, img = coupleImage(P), letters = P.ctx.letters, u = pt / s.d;
        const z = 1.04 - .04 * ease3(u);
        c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2 - 30 * (1 - u)); c.drawImage(skyArt(k), 0, 0, W, H); c.restore();
        const rise = ease3(pt / 1.6);
        c.drawImage(resortArt(k), 0, H - 760 + (1 - rise) * 260, W, 760);
        const bg = art('bouga', W, 300, k, g => { const R = rng(3); for (let i = 0; i < 7; i++) bougainvillea(g, 40 + i * 170, 70 + (i % 2) * 50, 140, R); });
        c.drawImage(bg, 0, -20 + Math.sin(t * .7) * 5 - (1 - rise) * 120, W, 300);
      },
    }
  };
})(Cinema.kit));

} catch (e) { if (typeof console !== 'undefined') console.warn('Cinema: story-lovestory.js', e); }

// ---------- js/cinema/story-mandir.js ----------
try {
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

} catch (e) { if (typeof console !== 'undefined') console.warn('Cinema: story-mandir.js', e); }

// ---------- js/cinema/story-mehendi.js ----------
try {
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

} catch (e) { if (typeof console !== 'undefined') console.warn('Cinema: story-mehendi.js', e); }

// ---------- js/cinema/story-namkaran.js ----------
try {
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

} catch (e) { if (typeof console !== 'undefined') console.warn('Cinema: story-namkaran.js', e); }

// ---------- js/cinema/story-popupbook.js ----------
try {
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

} catch (e) { if (typeof console !== 'undefined') console.warn('Cinema: story-popupbook.js', e); }

// ---------- js/cinema/story-sangeet.js ----------
try {
// Filmy Sangeet: a Bollywood stage night. Velvet curtains part on a marquee of chasing bulbs, a clapperboard snaps
// the first take, a film poster starring the couple, a record spins the invitation, every function on a lit dance
// floor (musical notes sweep from one to the next), a cinema hoarding for the date and a confetti curtain call.
Cinema.register((K => {
  const { W, H, TAU, rng, clamp, ease, ease3, lerp, mix, art, glow, rrect, clean, dateRange, spacing, coupleImage, foil, rays, discoBall } = K;
  const hiOf = P => P.opt.lang === 'hi';
  const kOf = P => Math.min(1.25, Math.max(.5, P.k));

  // ---- small painted pieces ----
  // a marquee bulb, on (warm, with its halo) or off, painted once
  const bulb = (on, k) => art(`sg-bulb-${on ? 1 : 0}`, 64, 64, k, c => {
    if (on) { glow(c, 32, 32, 32, 'rgba(255,214,120,.55)'); }
    const g = c.createRadialGradient(28, 27, 2, 32, 32, 13); g.addColorStop(0, on ? '#ffffff' : '#9a8668'); g.addColorStop(.45, on ? '#fff1bd' : '#6a5a44'); g.addColorStop(1, on ? '#f2a83a' : '#3a2e22');
    c.fillStyle = '#5a4524'; c.beginPath(); c.arc(32, 32, 14.5, 0, TAU); c.fill(); c.fillStyle = g; c.beginPath(); c.arc(32, 32, 12, 0, TAU); c.fill();
  });
  // bulbs round a rectangle, chasing (every third lit, moving), with a few always-on sparkle
  function bulbRing(c, x, y, w, h, gap, t, k, speed = 7) {
    const on = bulb(true, k), off = bulb(false, k), per = 2 * (w + h), n = Math.round(per / gap), step = Math.floor(t * speed);
    for (let i = 0; i < n; i++) {
      let d = i / n * per, px, py;
      if (d < w) { px = x + d; py = y; } else if ((d -= w) < h) { px = x + w; py = y + d; } else if ((d -= h) < w) { px = x + w - d; py = y + h; } else { d -= w; px = x; py = y + h - d; }
      c.drawImage((i + step) % 3 === 0 || (i * 7) % 11 === 0 ? on : off, px - 22, py - 22, 44, 44);
    }
  }
  // an eighth note (or a pair) in gold
  function note(c, x, y, s, rot, col, pair) {
    c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = col; c.strokeStyle = col; c.lineWidth = s * .09;
    const head = hx => { c.save(); c.translate(hx, 0); c.rotate(-.4); c.beginPath(); c.ellipse(0, 0, s * .26, s * .19, 0, 0, TAU); c.fill(); c.restore(); };
    head(0); c.beginPath(); c.moveTo(s * .23, -s * .05); c.lineTo(s * .23, -s); c.stroke();
    if (pair) { head(s * .62); c.beginPath(); c.moveTo(s * .85, -s * .05); c.lineTo(s * .85, -s * 1.02); c.stroke(); c.lineWidth = s * .16; c.beginPath(); c.moveTo(s * .23, -s); c.lineTo(s * .85, -s * 1.02); c.stroke(); }
    else { c.beginPath(); c.moveTo(s * .23, -s); c.quadraticCurveTo(s * .6, -s * .78, s * .5, -s * .45); c.quadraticCurveTo(s * .48, -s * .7, s * .23, -s * .74); c.fill(); }
    c.restore();
  }
  const noteSprite = (pair, k) => art(`sg-note-${pair ? 2 : 1}`, 120, 140, k, c => { glow(c, 60, 80, 60, 'rgba(255,200,90,.35)'); const g = c.createLinearGradient(0, 20, 0, 130); g.addColorStop(0, '#fff3c4'); g.addColorStop(.5, '#f0c24e'); g.addColorStop(1, '#a8701a'); note(c, pair ? 30 : 46, 110, 90, 0, g, pair); });
  // a ribbon of notes sweeping across (a change from one function to the next): p 0 … 1
  function noteSweep(c, p, k, seed) {
    if (p <= 0 || p >= 1) return;
    const R = rng(seed), n1 = noteSprite(false, k), n2 = noteSprite(true, k);
    c.save(); c.globalAlpha = Math.sin(p * Math.PI) * .35; c.fillStyle = '#ffe9b0'; c.fillRect(0, 0, W, H); c.restore();
    for (let i = 0; i < 46; i++) {
      const lane = R(), off = R() * .5, u = clamp((p - off * .6) * 1.7), x = -200 + u * (W + 400), y = 1900 - u * 1500 + (lane - .5) * 900 + Math.sin(u * 6 + i) * 60, s = .6 + R() * 1.1;
      if (u <= 0 || u >= 1) continue;
      c.save(); c.globalAlpha = Math.sin(u * Math.PI); c.translate(x, y); c.rotate(Math.sin(u * 5 + i) * .4); c.drawImage(i % 3 ? n1 : n2, -60 * s, -80 * s, 120 * s, 140 * s); c.restore();
    }
  }
  // a beam of light from a fixture at (x0, y0) to a pool at (x1, y1) of half-width w
  function beam(c, x0, y0, x1, y1, w, col, a) {
    const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(.75, `rgba(${col},${a * .35})`); g.addColorStop(1, `rgba(${col},0)`);
    const ang = Math.atan2(y1 - y0, x1 - x0) + Math.PI / 2, dx = Math.cos(ang), dy = Math.sin(ang);
    c.fillStyle = g; c.beginPath(); c.moveTo(x0 - dx * 14, y0 - dy * 14); c.lineTo(x0 + dx * 14, y0 + dy * 14); c.lineTo(x1 + dx * w, y1 + dy * w); c.lineTo(x1 - dx * w, y1 - dy * w); c.closePath(); c.fill();
    c.save(); c.translate(x1, y1); c.scale(1, .28); const pg = c.createRadialGradient(0, 0, 0, 0, 0, w * 1.1); pg.addColorStop(0, `rgba(${col},${a * 1.3})`); pg.addColorStop(1, `rgba(${col},0)`); c.fillStyle = pg; c.beginPath(); c.arc(0, 0, w * 1.1, 0, TAU); c.fill(); c.restore();
  }
  // a stage spotlight fixture (a can with a lens)
  function fixture(c, x, y, ang, s) {
    c.save(); c.translate(x, y); c.rotate(ang); c.fillStyle = '#16121c'; rrect(c, -s * .42, -s * .7, s * .84, s * 1.1, s * .16); c.fill();
    c.strokeStyle = '#3a3242'; c.lineWidth = 3; c.stroke(); const g = c.createRadialGradient(0, s * .38, 2, 0, s * .38, s * .36); g.addColorStop(0, '#ffffff'); g.addColorStop(.5, '#ffe9a8'); g.addColorStop(1, '#c08a22');
    c.fillStyle = g; c.beginPath(); c.ellipse(0, s * .4, s * .36, s * .14, 0, 0, TAU); c.fill(); c.restore();
  }

  // ---- the theatre: velvet curtain halves, the valance with fringe, the stage behind ----
  const curtainHalf = k => art('sg-curtain', 600, H, k, c => {
    const n = 9, fw = 600 / n;
    for (let i = 0; i < n; i++) {
      const g = c.createLinearGradient(i * fw, 0, (i + 1) * fw, 0);
      g.addColorStop(0, '#3a0610'); g.addColorStop(.35, '#a3152c'); g.addColorStop(.55, '#c8253c'); g.addColorStop(.8, '#6e0a1c'); g.addColorStop(1, '#3a0610');
      c.fillStyle = g; c.fillRect(i * fw - 1, 0, fw + 2, H);
    }
    const v = c.createLinearGradient(0, 0, 0, H); v.addColorStop(0, 'rgba(0,0,0,.45)'); v.addColorStop(.25, 'rgba(0,0,0,0)'); v.addColorStop(.85, 'rgba(0,0,0,.1)'); v.addColorStop(1, 'rgba(0,0,0,.55)'); c.fillStyle = v; c.fillRect(0, 0, 600, H);
    // gold braid along the inner edge and the hem
    const gb = c.createLinearGradient(0, 0, 40, 0); gb.addColorStop(0, '#8a5a10'); gb.addColorStop(.5, '#ffe08a'); gb.addColorStop(1, '#8a5a10');
    c.fillStyle = gb; c.fillRect(570, 0, 30, H); c.fillRect(0, H - 60, 600, 26);
    c.fillStyle = 'rgba(255,230,160,.8)'; for (let y = 10; y < H; y += 26) { c.beginPath(); c.arc(585, y, 5, 0, TAU); c.fill(); }
  });
  const valance = k => art('sg-valance', W, 300, k, c => {
    const R = rng(4);
    for (let i = 0; i < 7; i++) { // swags
      const x = i * W / 7, w = W / 7, g = c.createLinearGradient(0, 0, 0, 220); g.addColorStop(0, '#5a0814'); g.addColorStop(.6, '#b51d34'); g.addColorStop(1, '#6a0a1a');
      c.fillStyle = g; c.beginPath(); c.moveTo(x - 10, 0); c.lineTo(x + w + 10, 0); c.lineTo(x + w + 10, 120); c.quadraticCurveTo(x + w / 2, 260, x - 10, 120); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 3; for (let j = 1; j < 4; j++) { c.beginPath(); c.moveTo(x + 6, 40 + j * 22); c.quadraticCurveTo(x + w / 2, 120 + j * 40, x + w - 6, 40 + j * 22); c.stroke(); }
      // gold fringe along the swag
      for (let u = 0; u <= 1; u += .04) { const fx = x - 10 + u * (w + 20), fy = 120 + Math.sin(u * Math.PI) * 70; c.strokeStyle = u * 25 % 2 < 1 ? '#f2c24e' : '#c08a22'; c.lineWidth = 4; c.beginPath(); c.moveTo(fx, fy); c.lineTo(fx, fy + 26); c.stroke(); }
      // a tassel between swags
      const tg = c.createLinearGradient(x - 16, 0, x + 16, 0); tg.addColorStop(0, '#8a5a10'); tg.addColorStop(.5, '#ffe08a'); tg.addColorStop(1, '#8a5a10');
      c.fillStyle = tg; c.beginPath(); c.arc(x, 130, 14, 0, TAU); c.fill(); c.beginPath(); c.moveTo(x - 8, 140); c.lineTo(x + 8, 140); c.lineTo(x + 16, 200); c.lineTo(x - 16, 200); c.fill();
    }
    const gb = c.createLinearGradient(0, 0, 0, 36); gb.addColorStop(0, '#6e4208'); gb.addColorStop(.5, '#f6d27a'); gb.addColorStop(1, '#8a5a10'); c.fillStyle = gb; c.fillRect(0, 0, W, 34);
    for (let x = 20; x < W; x += 60) { c.fillStyle = '#fff2c0'; c.beginPath(); c.arc(x, 17, 6, 0, TAU); c.fill(); }
    void R;
  });
  function drawCurtains(c, open, k, t) {
    // each half bunches towards its side as it opens (folds compress, the hem lifts into a sweep)
    const half = curtainHalf(k), w = lerp(W / 2 + 6, 96, open);
    for (const d of [-1, 1]) {
      c.save();
      if (d > 0) { c.translate(W, 0); c.scale(-1, 1); }
      const sway = Math.sin(t * 1.3 + d) * 4 * (1 - open);
      c.drawImage(half, 0, 0, half.width, half.height, 0, -open * 40, w + sway, H + open * 40);
      c.restore();
    }
  }
  // the stage behind: a deep purple house, haze, a marquee sign of bulbs for the title, the floor
  const stageArt = (k, hi) => art(`sg-stage-${hi ? 'hi' : 'en'}`, W, H, k, c => {
    const R = rng(21), g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#12051c'); g.addColorStop(.55, '#2a0a36'); g.addColorStop(1, '#0a0410'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    // a sequinned backdrop of tiny lights
    for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(255,${180 + R() * 60 | 0},${200 + R() * 55 | 0},${(R() * .45).toFixed(2)})`; c.beginPath(); c.arc(R() * W, R() * 1250, R() * 2.6 + .4, 0, TAU); c.fill(); }
    glow(c, W / 2, 760, 700, 'rgba(255,90,170,.22)');
    // the marquee board (its bulbs are drawn live)
    const bx = 120, by = 480, bw = 840, bh = 520;
    c.save(); c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 40; c.shadowOffsetY = 20; c.fillStyle = '#1c0a14'; rrect(c, bx - 30, by - 30, bw + 60, bh + 60, 40); c.fill(); c.restore();
    const gf = c.createLinearGradient(bx, by, bx + bw, by + bh); gf.addColorStop(0, '#f6d27a'); gf.addColorStop(.5, '#a8701a'); gf.addColorStop(1, '#f6d27a');
    c.strokeStyle = gf; c.lineWidth = 10; rrect(c, bx - 18, by - 18, bw + 36, bh + 36, 30); c.stroke();
    const ig = c.createRadialGradient(W / 2, by + bh / 2, 40, W / 2, by + bh / 2, bw * .6); ig.addColorStop(0, '#4a0a2e'); ig.addColorStop(1, '#16040e'); c.fillStyle = ig; rrect(c, bx + 34, by + 34, bw - 68, bh - 68, 16); c.fill();
    c.strokeStyle = 'rgba(246,210,122,.5)'; c.lineWidth = 2; rrect(c, bx + 48, by + 48, bw - 96, bh - 96, 12); c.stroke();
    // art-deco fans at the board's top
    c.save(); c.translate(W / 2, by - 30); for (let i = -6; i <= 6; i++) { c.save(); c.rotate(i * .14); c.fillStyle = i % 2 ? '#f0c24e' : '#a8701a'; c.beginPath(); c.moveTo(-5, 0); c.lineTo(0, -120); c.lineTo(5, 0); c.fill(); c.restore(); } c.restore();
    // the title in gold
    c.textAlign = 'center'; c.textBaseline = 'middle';
    if (hi) foil(c, 'संगीत', W / 2, by + 220, { font: '210px "Yatra One"' }); else foil(c, 'SANGEET', W / 2, by + 220, { font: '700 150px "Cinzel Decorative"', spacing: 6 });
    // the stage floor: polished boards in perspective with a reflection band
    const fy = 1380, fg = c.createLinearGradient(0, fy, 0, H); fg.addColorStop(0, '#3a1a10'); fg.addColorStop(1, '#120604'); c.fillStyle = fg; c.fillRect(0, fy, W, H - fy);
    c.strokeStyle = 'rgba(255,200,150,.12)'; c.lineWidth = 2; for (let i = -12; i <= 12; i++) { c.beginPath(); c.moveTo(W / 2 + i * 40, fy); c.lineTo(W / 2 + i * 220, H); c.stroke(); }
    for (let j = 1; j < 9; j++) { const yy = fy + (H - fy) * (j / 9) ** 1.6; c.beginPath(); c.moveTo(0, yy); c.lineTo(W, yy); c.stroke(); }
    const rf = c.createLinearGradient(0, fy, 0, fy + 220); rf.addColorStop(0, 'rgba(255,140,200,.25)'); rf.addColorStop(1, 'rgba(255,140,200,0)'); c.fillStyle = rf; c.fillRect(bx, fy, bw, 220);
    // the stage lip with footlights
    c.fillStyle = '#2a1008'; c.fillRect(0, 1840, W, 80); c.fillStyle = '#c08a22'; c.fillRect(0, 1836, W, 6);
  });

  // ---- the dance floor for the functions: LED tiles in perspective, the house, a truss of lights ----
  const PALS = [{ a: '255,80,170', b: '120,90,255', c: '255,200,90', bg: ['#14041e', '#3a0b3c'] }, { a: '60,220,255', b: '255,90,140', c: '255,230,120', bg: ['#030c1e', '#0c2a46'] },
    { a: '255,190,60', b: '255,90,90', c: '255,240,190', bg: ['#1a0804', '#3e1606'] }, { a: '160,110,255', b: '60,255,190', c: '255,170,230', bg: ['#0a0420', '#24104a'] }];
  const houseArt = (k, i) => art(`sg-house-${i}`, W, H, k, c => {
    const P0 = PALS[i], R = rng(50 + i), g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, P0.bg[0]); g.addColorStop(.6, P0.bg[1]); g.addColorStop(1, P0.bg[0]); c.fillStyle = g; c.fillRect(0, 0, W, H);
    // tiered arches of a stage set, outlined in gold
    for (let j = 0; j < 4; j++) {
      const w = 980 - j * 170, top = 260 + j * 110, x = W / 2 - w / 2, base = 1240;
      c.strokeStyle = `rgba(246,210,122,${.55 - j * .1})`; c.lineWidth = 6 - j; c.beginPath(); c.moveTo(x, base); c.lineTo(x, top + w / 2); c.arc(W / 2, top + w / 2, w / 2, Math.PI, 0); c.lineTo(x + w, base); c.stroke();
      c.fillStyle = `rgba(0,0,0,${.12 + j * .05})`; c.fill();
    }
    for (let n = 0; n < 500; n++) { c.fillStyle = `rgba(${P0.c},${(R() * .5).toFixed(2)})`; c.beginPath(); c.arc(R() * W, R() * 1200, R() * 2.4 + .3, 0, TAU); c.fill(); }
    // the lighting truss across the top
    c.strokeStyle = '#8a8f9a'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, 120); c.lineTo(W, 120); c.moveTo(0, 170); c.lineTo(W, 170); c.stroke();
    c.lineWidth = 3; for (let x = 0; x < W; x += 50) { c.beginPath(); c.moveTo(x, 120); c.lineTo(x + 25, 170); c.lineTo(x + 50, 120); c.stroke(); }
    // speakers either side
    for (const x of [40, W - 190]) { c.fillStyle = '#0c0a10'; rrect(c, x, 1050, 150, 300, 14); c.fill(); for (const [yy, r] of [[1120, 46], [1250, 62]]) { c.fillStyle = '#1e1a26'; c.beginPath(); c.arc(x + 75, yy, r, 0, TAU); c.fill(); c.fillStyle = '#05040a'; c.beginPath(); c.arc(x + 75, yy, r * .45, 0, TAU); c.fill(); } }
  });
  function ledFloor(c, t, i) {
    const P0 = PALS[i % PALS.length], y0 = 1320, rows = 7, cols = 8;
    const at = (u, v) => { const yy = y0 + (H - y0) * v ** 1.35, sp = lerp(.55, 1.6, v); return [W / 2 + (u - .5) * W * sp, yy]; };
    for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
      const [x0, y1] = at(q / cols, r / rows), [x1] = at((q + 1) / cols, r / rows), [x2, y2] = at((q + 1) / cols, (r + 1) / rows), [x3] = at(q / cols, (r + 1) / rows);
      const ph = Math.sin(t * 3 + q * 1.7 + r * 2.3) + Math.sin(t * 1.3 - q * .9 + r), col = ph > .8 ? P0.a : ph < -.8 ? P0.b : P0.c, a = .2 + .55 * Math.abs(Math.sin(t * 2.2 + q + r * 1.3));
      c.fillStyle = `rgba(${col},${a.toFixed(2)})`; c.beginPath(); c.moveTo(x0 + 3, y1 + 2); c.lineTo(x1 - 3, y1 + 2); c.lineTo(x2 - 3, y2 - 2); c.lineTo(x3 + 3, y2 - 2); c.closePath(); c.fill();
    }
    const sh = c.createLinearGradient(0, y0, 0, y0 + 160); sh.addColorStop(0, 'rgba(0,0,0,.65)'); sh.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = sh; c.fillRect(0, y0, W, 160);
  }

  // ---- film-strip edges (sprockets running) ----
  function filmEdges(c, t, a = 1) {
    c.save(); c.globalAlpha = a;
    for (const x of [0, W - 64]) {
      c.fillStyle = '#0b0708'; c.fillRect(x, 0, 64, H);
      const off = (t * 160) % 90;
      c.fillStyle = 'rgba(255,240,215,.85)'; for (let y = -90 + off; y < H; y += 90) { rrect(c, x + 18, y, 28, 46, 6); c.fill(); }
    }
    c.restore();
  }
  // gold confetti strips
  function confettiStrips(c, t, n, seed, cols) {
    const R = rng(seed);
    for (let i = 0; i < n; i++) {
      const x = R() * W, sp = 120 + R() * 200, y = ((R() * H + t * sp) % (H + 200)) - 100, rot = t * (1 + R() * 3) + R() * 6, w = 10 + R() * 10, h = 24 + R() * 16;
      c.save(); c.translate(x + Math.sin(t * 1.5 + i) * 30, y); c.rotate(rot); c.scale(1, Math.cos(t * 4 + i)); c.fillStyle = cols[i % cols.length]; c.fillRect(-w / 2, -h / 2, w, h); c.restore();
    }
  }
  const names = card => { const a = clean(card.host1), b = clean(card.host2); return { a, b, two: !!b }; };
  // the couple for a shot: the dancing library picture, else the drawn pair
  // a function name that brings a chosen library couple (the dancing pair for the poster), else the name itself
  const pickCache = {};
  function nameFor(P, want, words) {
    const key = `${want}|${(P.couple || {}).id}|${P.opt.story}`;
    if (pickCache[key]) return pickCache[key];
    const list = ['sangeet-01', 'sangeet-02', 'sangeet-03'].filter(id => id !== (P.couple || {}).id);
    let out = words[0];
    for (const w of words) { let h = 5; for (const ch of (P.opt.story || '') + w) h = (h * 37 + ch.charCodeAt(0)) >>> 0; if (list[h % list.length] === want) { out = w; break; } }
    return (pickCache[key] = out);
  }
  const SANGEET_WORDS = ['Sangeet', 'Sangeet Night', 'The Sangeet', 'Sangeet Sandhya', 'Sangeet Party', 'Sangeet Mehfil', 'Sangeet Evening', 'Sangeet Show', 'Grand Sangeet', 'Sangeet Gala'];
  function dancers(c, P, eventName, cx, foot, s, t, L) {
    const img = coupleImage(P, eventName || nameFor(P, 'sangeet-01', SANGEET_WORDS));
    if (img) K.cutout(c, img, cx, foot, s, 'full', L, t);
    else K.drawnCouple(c, cx, foot, s * .92, t);
  }

  const look = { names: '#ffd27a', ink: '#fff6ea', ink2: '#f2dcf0', accent: '#ff9ed8', gold: '#f2c46a' };
  return {
    id: 'story-sangeet', order: 20, occasion: 'sangeet', tune: 'garba', thumb: 5.6,
    name: 'Filmy Sangeet Night', note: 'Velvet curtains part on a marquee, a clapperboard snaps, a film poster of the couple and a lit dance floor for every function',
    names: ['Aditi', 'Kabir'], ganesha: 'ganesha-02',
    looks: { open: 'disco', title: 'disco', invite: 'palace-plum', events: ['disco', 'lights-lavender', 'galaxy-plum'], date: 'palace-rose', end: 'palace-rose', final: 'disco-plum' },
    titles: [[/perform|showstop/i, 'The Showstoppers'], [/sangeet|संगीत/i, 'Lights, Camera, Sangeet'], [/dj|after|party/i, 'The After Party'], [/cocktail/i, 'Glitz, Glam & Grooves'],
      [/haldi|हल्दी/i, 'Sunshine & Turmeric'], [/mehe?n?d|मेहँदी|मेहंदी/i, 'Henna & Hues'], [/garba|dandiya|गरबा/i, 'Raas Under the Stars'], [/phera|vivah|wedding|फेरे|विवाह/i, 'The Grand Premiere'],
      [/reception|dinner|स्वागत/i, 'The Red Carpet'], [/ring|engage|सगाई/i, 'The Promise']],
    look(kind, K) {
      const base = K.palette('disco', { col: look, font: { script: 'Playball', serif: 'Gilda Display' }, shadow: ['rgba(12,2,22,.9)', 16] });
      return { ...base, scene: 'reel', fx: () => {} };
    },
    timeline(S) {
      const at = k => S.findIndex(s => s.k === k);
      S.splice(at('open'), 1, { k: 'reel', reel: 'curtain', name: 'Curtain Up', d: 7 }, { k: 'reel', reel: 'clapper', name: 'Take One', d: 4.6, cut: true });
      const ti = S[at('title')]; Object.assign(ti, { reel: 'poster', d: 6.8, cut: true, change: 'flash', name: 'The Poster' }); delete ti.couple; delete ti.zone;
      Object.assign(S[at('invite')], { reel: 'vinyl', d: 7.5, change: 'none', board: false, scrim: true, zone: [290, 1180, 800] });
      if (at('end') >= 0) S.splice(at('end'), 1);
      const ev = S.filter(s => s.k === 'event');
      ev.forEach(s => { Object.assign(s, { reel: 'floor', datebar: true, scrim: true, board: false, change: 'none', zone: [150, 1000, 860] }); delete s.couple; });
      const d = S.find(s => s.k === 'date'); if (d) Object.assign(d, { reel: 'marquee', change: 'none', board: false, zone: [330, 1560, 720], d: 5.5 });
      const f = S.find(s => s.k === 'final'); if (f) Object.assign(f, { reel: 'finale', d: 6, change: 'none', board: false, zone: [250, 1500, 800] });
      // the functions share what is left of a WhatsApp status (60 s)
      const fixed = S.filter(s => s.k !== 'event').reduce((a, s) => a + s.d, 0);
      ev.forEach(s => { s.d = clamp((59.4 - fixed) / Math.max(1, ev.length), 3.8, 5.6); });
    },
    shots: {
      curtain(c, s, pt, t, P) {
        const k = kOf(P), hi = hiOf(P), card = P.card, open = ease3((pt - 2.2) / 2.6), z = 1.04 - .05 * ease3(pt / s.d);
        c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2);
        c.drawImage(stageArt(k, hi), 0, 0, W, H);
        bulbRing(c, 120, 480, 840, 520, 52, t, k);
        // neon script under the title, flickering on as the curtains open
        const nf = open > .6 ? (Math.sin(pt * 40) > -.6 || pt > 5.2 ? 1 : .3) * ease((pt - 3.8) / .5) : 0;
        if (nf > 0) {
          c.save(); c.globalAlpha = nf; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = hi ? '96px "Amita"' : '120px "Pacifico"';
          c.shadowColor = 'rgba(255,60,170,.95)'; c.shadowBlur = 30; c.fillStyle = '#ffd0ee'; c.fillText(hi ? 'संध्या' : 'Night', W / 2, 860);
          c.shadowBlur = 0; c.restore();
        }
        // names on the stage floor, rising
        const { a, b, two } = names(card), na = ease((pt - 4.4) / .8);
        if (na > 0) {
          c.save(); c.globalAlpha = na; c.textAlign = 'center'; c.textBaseline = 'middle';
          foil(c, two ? `${a}  &  ${b}` : a, W / 2, 1180 + (1 - na) * 30, { font: `${hi ? '' : ''}96px "Great Vibes"`, t });
          c.font = '34px "Marcellus"'; spacing(c, 8); c.fillStyle = '#f2dcf0'; c.fillText(hi ? 'प्रस्तुत करते हैं' : 'PRESENT', W / 2, 1280 + (1 - na) * 30); spacing(c, 0);
          c.restore();
        }
        // sweeping spotlights once the house is revealed
        const sw = ease(open);
        if (sw > 0) for (const [fx, ph, col] of [[180, 0, '255,220,160'], [900, 2, '255,140,210'], [540, 4, '200,180,255']]) {
          const tx = W / 2 + Math.sin(t * .9 + ph) * 380; beam(c, fx, 60, tx, 1500, 200, col, .16 * sw);
        }
        c.restore();
        // the curtains (closed: a pool of spotlight on them with the families' line)
        drawCurtains(c, open, k, t);
        if (open < .4) {
          const a2 = (1 - open / .4) * ease((pt - .2) / .8), sx = W / 2 + Math.sin(pt * 1.4) * 60 * (1 - ease(pt / 1.8));
          c.save(); c.globalAlpha = a2; c.translate(sx, 1000); c.scale(1, 1.15);
          const g = c.createRadialGradient(0, 0, 0, 0, 0, 420); g.addColorStop(0, 'rgba(255,240,200,.55)'); g.addColorStop(.7, 'rgba(255,220,160,.18)'); g.addColorStop(1, 'rgba(255,220,160,0)');
          c.fillStyle = g; c.beginPath(); c.arc(0, 0, 420, 0, TAU); c.fill(); c.restore();
          c.save(); c.globalAlpha = a2 * ease((pt - .6) / .7); c.textAlign = 'center'; c.textBaseline = 'middle';
          c.font = hi ? '52px "Tiro Devanagari Hindi"' : 'italic 58px "Cormorant Garamond"'; c.fillStyle = '#fff2d8'; c.shadowColor = 'rgba(40,0,10,.9)'; c.shadowBlur = 12;
          c.fillText(hi ? 'देवियों और सज्जनों…' : 'Ladies & gentlemen…', W / 2, 960);
          c.font = hi ? '44px "Tiro Devanagari Hindi"' : '38px "Marcellus"'; spacing(c, hi ? 0 : 6); c.fillText(hi ? 'शो शुरू होने वाला है' : 'THE SHOW IS ABOUT TO BEGIN', W / 2, 1050); spacing(c, 0);
          c.restore();
        }
        c.drawImage(valance(k), 0, -10, W, 300);
        // footlights
        for (let x = 60; x < W; x += 120) glow(c, x, 1900, 90, `rgba(255,214,140,${(.35 + .1 * Math.sin(t * 3 + x)).toFixed(2)})`);
      },
      clapper(c, s, pt, t, P) {
        const k = kOf(P), hi = hiOf(P), card = P.card, { a, b, two } = names(card);
        // a film set at night: a dark floor with tape marks, a director's chair edge, the board front and centre
        const bg = art('sg-set', W, H, k, g => { const R = rng(8), gr = g.createRadialGradient(W / 2, H * .45, 60, W / 2, H / 2, H * .8); gr.addColorStop(0, '#3a2a30'); gr.addColorStop(1, '#0a0608'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
          for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(255,255,255,${R() * .04})`; g.fillRect(R() * W, R() * H, 2, 2); }
          g.strokeStyle = 'rgba(255,214,90,.6)'; g.lineWidth = 16; g.beginPath(); g.moveTo(80, 1700); g.lineTo(260, 1700); g.moveTo(170, 1610); g.lineTo(170, 1790); g.moveTo(820, 260); g.lineTo(1000, 260); g.stroke();
          // a film reel lying at the corner
          g.save(); g.translate(900, 1650); g.fillStyle = '#7a7f8a'; g.beginPath(); g.arc(0, 0, 230, 0, TAU); g.fill(); g.fillStyle = '#2a2d34'; g.beginPath(); g.arc(0, 0, 200, 0, TAU); g.fill();
          g.fillStyle = '#5a4030'; g.beginPath(); g.arc(0, 0, 150, 0, TAU); g.fill(); g.fillStyle = '#9aa0aa'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(Math.cos(i * TAU / 6) * 95, Math.sin(i * TAU / 6) * 95, 38, 0, TAU); g.fill(); } g.fillStyle = '#2a2d34'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(Math.cos(i * TAU / 6) * 95, Math.sin(i * TAU / 6) * 95, 30, 0, TAU); g.fill(); } g.restore(); });
        const slate = art(`sg-slate-${hi ? 'h' : 'e'}-${a}-${b}`, 860, 620, k, g => {
          g.fillStyle = '#121214'; rrect(g, 0, 0, 860, 620, 26); g.fill(); g.strokeStyle = '#e8e2d6'; g.lineWidth = 4;
          const row = (y) => { g.beginPath(); g.moveTo(30, y); g.lineTo(830, y); g.stroke(); };
          row(150); row(300); row(450); g.beginPath(); g.moveTo(430, 300); g.lineTo(430, 450); g.moveTo(290, 450); g.lineTo(290, 600); g.moveTo(570, 450); g.lineTo(570, 600); g.stroke();
          g.fillStyle = '#e8e2d6'; g.textBaseline = 'middle'; g.textAlign = 'left';
          const lab = (s, x, y) => { g.font = hi ? '26px "Tiro Devanagari Hindi"' : '24px "Marcellus"'; spacing(g, hi ? 0 : 5); g.fillStyle = 'rgba(232,226,214,.7)'; g.fillText(s, x, y); spacing(g, 0); };
          const chalk = (s, x, y, z, f) => { g.font = `${z}px ${f || '"Satisfy"'}`; g.fillStyle = '#fbf7ee'; g.fillText(s, x, y); };
          lab(hi ? 'प्रोडक्शन' : 'PRODUCTION', 40, 40); chalk(hi ? 'संगीत संध्या' : 'The Sangeet', 40, 100, hi ? 56 : 66, hi ? '"Amita"' : null);
          lab(hi ? 'मुख्य भूमिका' : 'STARRING', 40, 190); chalk(two ? `${a} & ${b}` : a, 40, 250, two && (a + b).length > 14 ? 54 : 66);
          lab(hi ? 'दृश्य' : 'SCENE', 40, 335); chalk('01', 40, 395, 70, '"Cinzel"'); lab(hi ? 'टेक' : 'TAKE', 460, 335); chalk(hi ? 'पहला' : 'One & only', 460, 395, hi ? 52 : 60, hi ? '"Amita"' : null);
          lab(hi ? 'तारीख़' : 'DATE', 40, 485); chalk(dateRange(card, hi).replace(/\s*\d{4}$/, ''), 40, 545, 38, hi ? '"Tiro Devanagari Hindi"' : '"Marcellus"');
          lab(hi ? 'रोल' : 'ROLL', 310, 485); chalk('∞', 320, 545, 64, '"Cinzel"'); lab(hi ? 'साउंड' : 'SOUND', 590, 485); chalk(hi ? 'ढोल' : 'Dhol!', 590, 545, 56);
        });
        const stick = art('sg-stick', 880, 110, k, g => { g.fillStyle = '#121214'; rrect(g, 0, 0, 880, 110, 14); g.fill(); g.save(); rrect(g, 0, 0, 880, 110, 14); g.clip();
          g.fillStyle = '#f4f0e6'; for (let x = -100; x < 980; x += 140) { g.beginPath(); g.moveTo(x, 110); g.lineTo(x + 70, 110); g.lineTo(x + 140, 0); g.lineTo(x + 70, 0); g.fill(); } g.restore(); });
        // the camera pushes in; the stick opens then snaps shut at 2.0 s (a flash, a jolt), then the dolly rushes in
        const snap = 2.0, open = pt < snap ? ease3(clamp((pt - .2) / .7)) * (1 - ease(clamp((pt - snap + .14) / .14) ** 2)) : 0;
        const jolt = pt > snap ? Math.exp(-(pt - snap) * 9) * Math.sin((pt - snap) * 60) * 10 : 0, rush = clamp((pt - 3.4) / 1.2) ** 2.2;
        const z = lerp(.92, 1.0, ease3(pt / snap)) + rush * .9;
        c.drawImage(bg, 0, 0, W, H);
        c.save(); c.translate(W / 2 + jolt, 1000); c.scale(z, z); c.rotate(-.04 + rush * .04);
        c.save(); c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 50; c.shadowOffsetY = 30; c.fillStyle = '#121214'; c.fillRect(-430, -250, 860, 620); c.restore();
        c.drawImage(slate, -430, -250, 860, 620);
        // the hinge and the clapstick
        c.save(); c.translate(-430, -262); c.rotate(-open * .5); c.drawImage(stick, 0, -110, 880, 110); c.restore();
        c.fillStyle = '#8a8f9a'; c.beginPath(); c.arc(-404, -262, 16, 0, TAU); c.fill();
        c.restore();
        // the take's flash, and white into the poster
        if (pt > snap && pt < snap + .5) { c.fillStyle = `rgba(255,248,230,${(.75 * (1 - (pt - snap) / .5)).toFixed(2)})`; c.fillRect(0, 0, W, H); }
        if (rush > .12) { const wa = clamp((rush - .12) / .3); glow(c, W / 2, 1000, 1200, `rgba(255,236,190,${(wa * .9).toFixed(2)})`); c.fillStyle = `rgba(255,236,200,${(wa ** 1.5 * .7).toFixed(2)})`; c.fillRect(0, 0, W, H); rays(c, W / 2, 1000, t, { n: 30, r: 1500, col: '255,214,140', a: .35 * wa, spin: .3 }); K.sparks(c, t, 26, '#fff3c8', 13); }
        // a whispered "Action!"
        const ac = ease((pt - snap - .1) / .3) * (1 - ease((pt - 3.3) / .4));
        if (ac > 0) { c.save(); c.globalAlpha = ac; c.textAlign = 'center'; c.textBaseline = 'middle'; foil(c, hi ? 'एक्शन!' : 'Action!', W / 2, 1540, { font: hi ? '120px "Yatra One"' : '130px "Pacifico"', t }); c.restore(); }
      },
      poster(c, s, pt, t, P) {
        const k = kOf(P), hi = hiOf(P), card = P.card, { a, b, two } = names(card), u = pt / s.d;
        const bg = art('sg-poster', W, H, k, g => { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#2a0838'); gr.addColorStop(.45, '#a0185c'); gr.addColorStop(.7, '#f06a3a'); gr.addColorStop(1, '#3a0a18'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
          glow(g, W / 2, 1080, 760, 'rgba(255,214,140,.55)');
          // a city of lights on the horizon
          const R = rng(31); g.fillStyle = '#1a0614'; for (let x = 0; x < W; x += 30 + R() * 50) { const h = 80 + R() * 260; g.fillRect(x, 1500 - h, 26 + R() * 40, h + 420); }
          g.fillStyle = 'rgba(255,214,120,.7)'; for (let i = 0; i < 300; i++) g.fillRect(R() * W, 1260 + R() * 260, 4, 5); });
        const z = 1.06 - .06 * ease3(u);
        c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2); c.drawImage(bg, 0, 0, W, H);
        rays(c, W / 2, 1080, t, { n: 28, r: 1500, col: '255,220,160', a: .16, spin: .08 });
        for (const [fx, ph, col] of [[100, 0, '255,160,220'], [980, 1.6, '255,230,170']]) beam(c, fx, -40, W / 2 + Math.sin(t * 1.1 + ph) * 320, 1650, 210, col, .18);
        c.restore();
        // the couple, rising in from below
        const rise = ease3((pt - .2) / 1.4);
        c.save(); c.globalAlpha = rise; dancers(c, P, null, W / 2, 1760 + (1 - rise) * 160, 1080, t, P.shotLook ? P.shotLook('poster') : null); c.restore();
        // the title block at the top: names stacked like a film title
        const ta = ease((pt - .7) / .8), sc = 1.25 - .25 * ease3((pt - .7) / 1);
        c.save(); c.globalAlpha = ta; c.translate(W / 2, 330); c.scale(sc, sc); c.textAlign = 'center'; c.textBaseline = 'middle';
        c.font = hi ? '40px "Tiro Devanagari Hindi"' : '34px "Marcellus"'; spacing(c, hi ? 0 : 12); c.fillStyle = '#ffe9f4'; c.shadowColor = 'rgba(40,0,30,.9)'; c.shadowBlur = 14;
        c.fillText(hi ? 'परिवार प्रस्तुत करते हैं' : 'THE FAMILIES PRESENT', 0, -200); spacing(c, 0); c.shadowBlur = 0;
        const nm = two ? `${a} & ${b}` : a, fz = nm.length > 16 ? 108 : 132;
        foil(c, nm, 0, -90, { font: `${fz}px "Great Vibes"`, t });
        c.font = hi ? '44px "Amita"' : 'italic 46px "Cormorant Garamond"'; c.fillStyle = '#fff2d8'; c.shadowColor = 'rgba(40,0,30,.9)'; c.shadowBlur = 12; c.fillText(hi ? 'अभिनीत' : 'in', 0, 10);
        c.shadowBlur = 0; foil(c, hi ? 'फ़िल्मी संगीत संध्या' : 'A FILMY SANGEET', 0, 100, { font: hi ? '84px "Yatra One"' : '700 64px "Cinzel Decorative"', t: t + 1.3 });
        c.restore();
        // poster credits at the foot
        const ca = ease((pt - 1.6) / .8);
        if (ca > 0) {
          c.save(); c.globalAlpha = ca; c.textAlign = 'center'; c.textBaseline = 'middle';
          const g = c.createLinearGradient(0, 1600, 0, H); g.addColorStop(0, 'rgba(20,4,16,0)'); g.addColorStop(.5, 'rgba(20,4,16,.85)'); g.addColorStop(1, 'rgba(20,4,16,.95)'); c.fillStyle = g; c.fillRect(0, 1560, W, H - 1560);
          c.font = hi ? '34px "Tiro Devanagari Hindi"' : '26px "Marcellus"'; spacing(c, hi ? 0 : 6); c.fillStyle = 'rgba(255,236,246,.75)';
          c.fillText(hi ? 'संगीत · नृत्य · मस्ती · और ढेर सारा प्यार' : 'MUSIC · DANCE · MASTI · AND A WHOLE LOT OF LOVE', W / 2, 1700);
          spacing(c, hi ? 0 : 10); c.font = hi ? '52px "Tiro Devanagari Hindi"' : '46px "Cinzel"'; c.fillStyle = '#ffd27a'; c.fillText(hi ? `${dateRange(card, true)} से` : `IN CINEMAS ${dateRange(card, false).toUpperCase()}`, W / 2, 1772);
          spacing(c, 0); c.restore();
        }
        filmEdges(c, t, .9);
        K.sparks(c, t, 14, '#fff3c8', 5);
      },
      vinyl(c, s, pt, t, P) {
        const k = kOf(P), letters = P.ctx.letters;
        const bg = art('sg-plum', W, H, k, g => { const gr = g.createRadialGradient(W / 2, 600, 80, W / 2, 800, 1300); gr.addColorStop(0, '#5a1450'); gr.addColorStop(.6, '#2a0830'); gr.addColorStop(1, '#0c0310'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
          g.globalAlpha = .07; for (let y = 0; y < H; y += 160) for (let x = (y / 160 % 2) * 80; x < W; x += 160) K.paisley(g, x, y, 40, .4, '#f2c76b'); g.globalAlpha = 1;
          K.goldFrame(g, 30, 30, W - 60, H - 60, 120);
          // the turntable plinth (walnut), seen from a little above
          const px = 90, py = 1330, pw = 900, ph = 520; g.save(); g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 50; g.shadowOffsetY = 26;
          const wg = g.createLinearGradient(px, py, px + pw, py + ph); wg.addColorStop(0, '#7a4a26'); wg.addColorStop(.5, '#a8683a'); wg.addColorStop(1, '#5a3418'); g.fillStyle = wg; rrect(g, px, py, pw, ph, 30); g.fill(); g.restore();
          g.strokeStyle = 'rgba(255,220,170,.35)'; g.lineWidth = 3; rrect(g, px + 10, py + 10, pw - 20, ph - 20, 24); g.stroke();
          g.fillStyle = '#c9c4ba'; g.beginPath(); g.ellipse(470, 1590, 380, 170, 0, 0, TAU); g.fill(); g.fillStyle = '#1a1a1e'; g.beginPath(); g.ellipse(470, 1586, 366, 162, 0, 0, TAU); g.fill();
          for (const [x, y] of [[860, 1790], [920, 1790]]) { g.fillStyle = '#d8d2c6'; g.beginPath(); g.arc(x, y, 18, 0, TAU); g.fill(); }
          g.fillStyle = '#b9bcc4'; g.beginPath(); g.arc(880, 1420, 46, 0, TAU); g.fill(); g.fillStyle = '#6a6e78'; g.beginPath(); g.arc(880, 1420, 22, 0, TAU); g.fill(); });
        const rec = art(`sg-record-${letters.join('')}`, 720, 720, k, g => { g.translate(360, 360); g.fillStyle = '#0c0c0e'; g.beginPath(); g.arc(0, 0, 356, 0, TAU); g.fill();
          for (let r = 140; r < 350; r += 5) { g.strokeStyle = `rgba(255,255,255,${r % 15 === 0 ? .1 : .04})`; g.lineWidth = 1.5; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.stroke(); }
          const lg = g.createRadialGradient(0, 0, 10, 0, 0, 130); lg.addColorStop(0, '#f2c24e'); lg.addColorStop(1, '#b0245a'); g.fillStyle = lg; g.beginPath(); g.arc(0, 0, 130, 0, TAU); g.fill();
          g.fillStyle = '#fff4d8'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '700 72px "Cinzel Decorative"'; g.fillText(letters.join(' '), 0, -6);
          g.font = '20px "Marcellus"'; spacing(g, 6); g.fillText('SIDE A · SANGEET', 0, 70); spacing(g, 0); g.fillStyle = '#0c0c0e'; g.beginPath(); g.arc(0, 0, 9, 0, TAU); g.fill(); });
        c.drawImage(bg, 0, 0, W, H);
        glow(c, W / 2, 620, 620, `rgba(255,120,200,${(.14 + .05 * Math.sin(t * 1.6)).toFixed(2)})`);
        for (const [fx, ph] of [[60, 0], [1020, 2.5]]) beam(c, fx, 40, W / 2 + Math.sin(t * .7 + ph) * 160, 1240, 260, '255,214,170', .1);
        K.bulbs(c, 120, W - 120, 300, 70, t, 14, ['rgba(255,210,122,A)', 'rgba(255,158,216,A)', 'rgba(255,242,192,A)'], 4);
        drawCurtains(c, .94, k, t);
        c.drawImage(valance(k), 0, -10, W, 300);
        // the record spins (a disc squashed into the platter's ellipse), with a sheen that stays put
        const spin = t * 3.4;
        c.save(); c.translate(470, 1586); c.scale(1, .44); c.rotate(spin); c.drawImage(rec, -350, -350, 700, 700); c.restore();
        c.save(); c.translate(470, 1586); c.scale(1, .44); const sh = c.createLinearGradient(-350, -350, 350, 350); sh.addColorStop(.35, 'rgba(255,255,255,0)'); sh.addColorStop(.5, 'rgba(255,255,255,.14)'); sh.addColorStop(.65, 'rgba(255,255,255,0)'); c.fillStyle = sh; c.beginPath(); c.arc(0, 0, 350, 0, TAU); c.fill(); c.restore();
        // the tonearm swings in and drops onto the groove
        const arm = ease3(clamp((pt - .2) / 1.2));
        c.save(); c.translate(880, 1420); c.rotate(lerp(-.15, .55, arm)); c.strokeStyle = '#d8dce4'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.lineTo(-30, 220); c.lineTo(-120, 300); c.stroke();
        c.fillStyle = '#2a2d34'; c.fillRect(-150, 290, 46, 30); c.restore();
        // notes drifting up from the record once it plays
        const n1 = noteSprite(false, k), n2 = noteSprite(true, k), R = rng(3);
        for (let i = 0; i < 9; i++) {
          const ph = ((pt - 1.4) * .45 + R()) % 1; if (pt < 1.4) break;
          const x = 300 + R() * 360 + Math.sin(ph * 7 + i) * 50, y = 1520 - ph * 520, sz = .5 + R() * .5;
          c.save(); c.globalAlpha = Math.sin(ph * Math.PI) * .9; c.drawImage(i % 2 ? n1 : n2, x - 60 * sz, y - 70 * sz, 120 * sz, 140 * sz); c.restore();
        }
      },
      floor(c, s, pt, t, P) {
        const k = kOf(P), i = (s.i || 0) % PALS.length, P0 = PALS[i];
        const z = 1.05 - .05 * ease3(pt / s.d);
        c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2);
        c.drawImage(houseArt(k, i), 0, 0, W, H);
        ledFloor(c, t, i);
        // light pools from the disco ball wander over the walls
        const R = rng(9 + i);
        for (let n = 0; n < 26; n++) { const x = (R() * W + t * (40 + R() * 60)) % W, y = 200 + R() * 1000 + Math.sin(t + n) * 30; c.fillStyle = `rgba(${n % 2 ? P0.a : P0.c},${(.3 + .3 * Math.sin(t * 4 + n)).toFixed(2)})`; c.beginPath(); c.arc(x, y, 5 + R() * 6, 0, TAU); c.fill(); }
        for (const [fx, ph, col] of [[150, 0, P0.a], [930, 2.2, P0.b], [540, 4.1, P0.c]]) { const tx = W / 2 + Math.sin(t * 1.2 + ph) * 420; beam(c, fx, 175, tx, 1650, 190, col, .15); }
        for (const fx of [150, 540, 930]) fixture(c, fx, 160, Math.sin(t * 1.2 + fx) * .3, 60);
        discoBall(c, W / 2, 360, 70, t);
        // the couple dancing in the middle of the floor
        const L = P.shotLook ? P.shotLook('floor') : null;
        const ci = ease((pt - .3) / .9);
        c.save(); c.globalAlpha = ci; dancers(c, P, s.e && s.e.name, W / 2, 1880 + (1 - ci) * 60, 760, t, L); c.restore();
        c.restore();
        noteSweep(c, pt / 1.1, k, 40 + i);
      },
      marquee(c, s, pt, t, P) {
        const k = kOf(P), hi = hiOf(P);
        const bg = art('sg-hoarding', W, H, k, g => { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#3a0614'); gr.addColorStop(.5, '#6a0c22'); gr.addColorStop(1, '#2a040e'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
          // art-deco sunburst lines and gold rules
          g.strokeStyle = 'rgba(246,210,122,.12)'; g.lineWidth = 2; for (let i = 0; i < 40; i++) { const a = Math.PI + i / 39 * Math.PI; g.beginPath(); g.moveTo(W / 2, 1900); g.lineTo(W / 2 + Math.cos(a) * 2200, 1900 + Math.sin(a) * 2200); g.stroke(); }
          const gf = g.createLinearGradient(0, 0, W, 0); gf.addColorStop(0, '#a8701a'); gf.addColorStop(.5, '#ffe08a'); gf.addColorStop(1, '#a8701a'); g.strokeStyle = gf; g.lineWidth = 8; rrect(g, 70, 90, W - 140, H - 200, 36); g.stroke(); g.lineWidth = 2; rrect(g, 110, 130, W - 220, H - 280, 26); g.stroke();
          g.fillStyle = '#1a040c'; rrect(g, 240, 150, 600, 120, 24); g.fill(); g.strokeStyle = gf; g.lineWidth = 4; rrect(g, 240, 150, 600, 120, 24); g.stroke(); });
        c.drawImage(bg, 0, 0, W, H);
        bulbRing(c, 70, 90, W - 140, H - 200, 56, t, k, 9);
        bulbRing(c, 240, 150, 600, 120, 44, t + .3, k, 9);
        c.save(); c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = hi ? '58px "Yatra One"' : '700 50px "Cinzel"'; spacing(c, hi ? 0 : 8);
        c.fillStyle = '#ffe9b0'; c.shadowColor = 'rgba(255,160,60,.9)'; c.shadowBlur = 18; c.fillText(hi ? '★ अब प्रदर्शित ★' : '★ NOW SHOWING ★', W / 2, 212); c.restore();
        // two golden tickets tucked into the hoarding's corners
        const tk = art(`sg-ticket-${hi ? 'h' : 'e'}`, 420, 200, k, g => {
          const gg = g.createLinearGradient(0, 0, 420, 200); gg.addColorStop(0, '#ffe9a8'); gg.addColorStop(.5, '#e2b24a'); gg.addColorStop(1, '#b8862b');
          g.fillStyle = gg; g.beginPath(); g.moveTo(16, 0); g.lineTo(404, 0); g.arc(420, 100, 22, -Math.PI / 2, Math.PI / 2, true); g.lineTo(404, 200); g.lineTo(16, 200); g.arc(0, 100, 22, Math.PI / 2, -Math.PI / 2, true); g.closePath(); g.fill();
          g.strokeStyle = '#7a4a10'; g.setLineDash([8, 8]); g.lineWidth = 3; g.beginPath(); g.moveTo(310, 14); g.lineTo(310, 186); g.stroke(); g.setLineDash([]); g.strokeRect(14, 14, 392, 172);
          g.fillStyle = '#5a1a10'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = hi ? '52px "Yatra One"' : '700 46px "Cinzel"'; g.fillText(hi ? 'प्रवेश' : 'ADMIT', 160, 72); g.font = hi ? '34px "Tiro Devanagari Hindi"' : '30px "Marcellus"'; g.fillText(hi ? 'सपरिवार' : 'ONE & ALL', 160, 128);
          g.save(); g.translate(360, 100); g.rotate(-Math.PI / 2); g.font = '22px "Marcellus"'; g.fillText('Nº 0001', 0, 0); g.restore(); });
        for (const [x, y, a, ph] of [[230, 1700, -.32, 0], [850, 1700, .3, 1.7]]) { c.save(); c.translate(x, y + Math.sin(t * 1.2 + ph) * 6); c.rotate(a + Math.sin(t * .9 + ph) * .03); c.drawImage(tk, -210, -100, 420, 200); c.restore(); }
        for (const [fx, ph, col] of [[120, 0, '255,200,150'], [960, 2.4, '255,150,210']]) beam(c, fx, 300, W / 2 + Math.sin(t * .9 + ph) * 260, 1500, 200, col, .1);
        K.sparks(c, t, 12, '#fff3c8', 8);
        // a spotlight pool under the words
        glow(c, W / 2, 900, 640, `rgba(255,190,120,${(.16 + .04 * Math.sin(t * 2)).toFixed(2)})`);
      },
      finale(c, s, pt, t, P) {
        const k = kOf(P), hi = hiOf(P);
        c.drawImage(stageArt(k, hi), 0, 0, W, H);
        c.fillStyle = 'rgba(14,3,20,.9)'; c.fillRect(0, 0, W, H);
        for (const [fx, ph, col] of [[150, 0, '255,200,150'], [930, 2, '255,140,210']]) beam(c, fx, 60, W / 2 + Math.sin(t * .8 + ph) * 200, 1500, 230, col, .14);
        glow(c, W / 2, 1000, 700, 'rgba(255,214,150,.18)');
        // the curtains drawn back to the sides, swaying, the valance on top
        drawCurtains(c, .9 - .05 * Math.sin(pt * .8), k, t);
        c.drawImage(valance(k), 0, -10, W, 300);
        // a burst of confetti as the curtain call begins
        if (pt < 2.2) for (const [x, y] of [[220, 1500], [860, 1500]]) K.burst(c, x, y, pt / 2.2, '255,214,120', 30, 520);
        confettiStrips(c, t, 70, 12, ['#f2c24e', '#ffe9b0', '#ff7ab8', '#c08a22', '#ffffff']);
        for (let x = 60; x < W; x += 120) glow(c, x, 1900, 90, 'rgba(255,214,140,.35)');
      },
    }
  };
})(Cinema.kit));

} catch (e) { if (typeof console !== 'undefined') console.warn('Cinema: story-sangeet.js', e); }

// ---------- js/cinema/story-savedate.js ----------
try {
// Save The Date: a cream page under a jhoomar of roses that drops in and keeps swinging, pink roses blooming in the
// corners and petals drifting down; "Save The Date", the month and its calendar write themselves in, the couple rises
// below, and a little heart hops from date to date until it lands on the wedding day and fills it in red. Then a
// second page: the couple's names ("Shivam weds Anaya Gupta"), the day, time and venue.
Cinema.register((K => {
  const { W, H, TAU, rng, clamp, ease, lerp, glow, leaf, rose, blossom, clean, days, petals, MONTHS } = K;
  const kOf = P => Math.min(1.25, Math.max(.5, P.k));
  const DEV = /[ऀ-ॿ]/;
  const RED = '#9e2a2b', WINE = '#7a1f24', INK = '#43281c', INK2 = '#6b3a2a';
  const HI_MONTHS = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितम्बर', 'अक्टूबर', 'नवम्बर', 'दिसम्बर'];
  const EN_WD = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'], HI_WD = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];
  const EN_DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], HI_DAY = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
  const MONTH_EN = (MONTHS && MONTHS.length === 12) ? MONTHS : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // ---------- the couple (our own illustration: red lehenga, ivory sherwani) ----------
  let COUPLE = null;
  function couple(P) {
    if (typeof Image === 'undefined' || (typeof location !== 'undefined' && location.protocol === 'file:')) return K.coupleImage(P);
    if (!COUPLE) { COUPLE = new Image(); COUPLE.src = 'img/couples/cut/wedding-05.png'; }
    return COUPLE.complete && COUPLE.naturalWidth ? COUPLE : K.coupleImage(P);
  }
  couple({});

  // ---------- still art, painted once ----------
  const memo = new Map();
  function still(key, w, h, k, draw) {
    const id = `${key}@${k}`;
    if (memo.has(id)) return memo.get(id);
    const cv = K.canvasOf(Math.max(1, Math.round(w * k)), Math.max(1, Math.round(h * k))), c = cv.getContext('2d');
    c.scale(k, k); draw(c);
    memo.set(id, cv);
    if (memo.size > 40) memo.delete(memo.keys().next().value);
    return cv;
  }

  // the page: warm cream paper, soft light from the top-left, a fine gold double rule down both sides
  const page = k => still('page', W, H, k, c => {
    const g = c.createRadialGradient(W * .45, H * .38, 80, W / 2, H / 2, H * .75);
    g.addColorStop(0, '#fdf6ec'); g.addColorStop(.6, '#f8ead9'); g.addColorStop(1, '#efd6bd');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    const R = rng(7);
    for (let i = 0; i < 1400; i++) { c.fillStyle = `rgba(${R() < .5 ? '160,110,70' : '255,255,255'},${(.03 + R() * .05).toFixed(3)})`; c.fillRect(R() * W, R() * H, 2, 2); }
    // a faint gold mandala behind the calendar, like a watermark pressed into the paper
    c.save(); c.translate(540, 820); c.strokeStyle = 'rgba(184,134,43,.10)'; c.fillStyle = 'rgba(184,134,43,.05)'; c.lineWidth = 2;
    [[120, 12, 70], [230, 18, 100], [350, 24, 120], [460, 32, 110]].forEach(([r, n, len]) => {
      for (let i = 0; i < n; i++) {
        c.save(); c.rotate(i / n * TAU + r);
        c.beginPath(); c.moveTo(0, -r + len * .35); c.quadraticCurveTo(len * .32, -r - len * .2, 0, -r - len * .62); c.quadraticCurveTo(-len * .32, -r - len * .2, 0, -r + len * .35); c.fill(); c.stroke();
        c.restore();
      }
      c.beginPath(); c.arc(0, 0, r - len * .42, 0, TAU); c.stroke();
    });
    c.restore();
    [[30, 40], [W - 30, W - 40]].forEach(([a, b]) => {
      const gg = c.createLinearGradient(0, 0, 0, H); gg.addColorStop(0, '#c9a25a'); gg.addColorStop(.5, '#f1d898'); gg.addColorStop(1, '#b8862b');
      c.strokeStyle = gg; c.lineWidth = 3; c.beginPath(); c.moveTo(a, 0); c.lineTo(a, H); c.stroke();
      c.lineWidth = 1.5; c.beginPath(); c.moveTo(b, 0); c.lineTo(b, H); c.stroke();
      for (let y = 60; y < H; y += 46) { c.fillStyle = gg; c.beginPath(); c.arc((a + b) / 2, y, 2.6, 0, TAU); c.fill(); }
    });
  });
  // long diagonal sun rays (drawn over the page, their strength breathes)
  const rays = k => still('rays', W, H, k, c => {
    c.save(); c.translate(-200, -300); c.rotate(.5);
    [[0, 90], [180, 50], [300, 130], [520, 60], [660, 110], [900, 70]].forEach(([x, w]) => {
      const g = c.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,255,.45)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = g; c.fillRect(x, 0, w, 2600);
    });
    c.restore();
  });

  // a cluster of pink roses, blossoms, buds and leaves; anchor at (0, 0) = the page corner, growing into +x, +y
  function cluster(c, seed, n, sc) {
    const R = rng(seed);
    for (let i = 0; i < 34; i++) {
      const a = R() * Math.PI / 2, d = (60 + R() * 380) * sc;
      leaf(c, Math.cos(a) * d * .9, Math.sin(a) * d, (60 + R() * 50) * sc, (18 + R() * 8) * sc, a + (R() - .5) * 1.4, `hsl(${78 + R() * 20},${30 + R() * 15}%,${34 + R() * 14}%)`);
    }
    for (let i = 0; i < 26; i++) {
      const a = R() * Math.PI / 2, d = (200 + R() * 260) * sc, x = Math.cos(a) * d, y = Math.sin(a) * d;
      c.strokeStyle = '#7d6a3a'; c.lineWidth = 2 * sc; c.beginPath(); c.moveTo(x * .7, y * .7); c.lineTo(x, y); c.stroke();
      c.fillStyle = R() < .5 ? '#f3a3b5' : '#e9768f'; c.beginPath(); c.ellipse(x, y, 9 * sc, 13 * sc, a, 0, TAU); c.fill();
    }
    for (let i = 0; i < n; i++) {
      const a = R() * Math.PI / 2, d = (30 + Math.sqrt(R()) * 300) * sc, x = Math.cos(a) * d, y = Math.sin(a) * d, r = (34 + R() * 34) * sc;
      if (R() < .55) rose(c, x, y, r, R() < .5 ? '#ffc4cf' : '#f7a2b4', R() < .5 ? '#c8435f' : '#b02c48', R() * TAU);
      else blossom(c, x, y, r * 1.25, R() < .5 ? '#f6b3c3' : '#f9d0d8', '#fff6f2', R() * TAU, 5);
    }
    for (let i = 0; i < 40; i++) { const a = R() * Math.PI / 2, d = (40 + R() * 380) * sc; c.fillStyle = 'rgba(255,250,245,.9)'; c.beginPath(); c.arc(Math.cos(a) * d, Math.sin(a) * d, (3 + R() * 4) * sc, 0, TAU); c.fill(); }
  }
  const cornerTop = k => still('ctop', 520, 560, k, c => { c.translate(-10, -10); cluster(c, 11, 16, .95); });
  const cornerBot = k => still('cbot', 560, 620, k, c => { c.translate(-10, 630); c.scale(1, -1); cluster(c, 23, 20, 1.1); });

  // the jhoomar: a gold dome laced with lattice, a rim of tiny roses, a fringe of gold beads and pearl strings
  const jhoomar = k => still('jhoomar', 560, 400, k, c => {
    const cx = 280;
    // a twisted gold chain, then a little kalash finial on the crown
    for (let y = 0; y < 52; y += 9) { c.strokeStyle = y % 18 ? '#d9b062' : '#a8752a'; c.lineWidth = 3; c.beginPath(); c.ellipse(cx, y + 4, 4, 6, 0, 0, TAU); c.stroke(); }
    const kg = c.createRadialGradient(cx - 6, 58, 2, cx, 62, 16); kg.addColorStop(0, '#fff3c8'); kg.addColorStop(1, '#b8862b');
    c.fillStyle = kg; c.beginPath(); c.arc(cx, 62, 13, 0, TAU); c.fill();
    // the dome: lit from the upper left, with fluted ribs and two carved bands
    const dome = () => { c.beginPath(); c.moveTo(cx - 215, 250); c.bezierCurveTo(cx - 200, 110, cx - 80, 72, cx, 70); c.bezierCurveTo(cx + 80, 72, cx + 200, 110, cx + 215, 250); c.closePath(); };
    const g = c.createRadialGradient(cx - 70, 110, 10, cx, 180, 260); g.addColorStop(0, '#fff1c4'); g.addColorStop(.35, '#e9c47a'); g.addColorStop(.75, '#c0903e'); g.addColorStop(1, '#8e5f22');
    c.fillStyle = g; dome(); c.fill();
    c.save(); dome(); c.clip();
    for (let i = -11; i <= 11; i++) {
      const x0 = cx + i * 4, x1 = cx + i * 20;
      c.strokeStyle = 'rgba(120,80,25,.35)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x0, 70); c.quadraticCurveTo(cx + i * 15, 150, x1, 252); c.stroke();
      c.strokeStyle = 'rgba(255,245,215,.45)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x0 + 2, 70); c.quadraticCurveTo(cx + i * 15 + 3, 150, x1 + 3, 252); c.stroke();
    }
    [[150, 9], [205, 11]].forEach(([y, r]) => {
      c.fillStyle = 'rgba(120,80,25,.45)'; c.fillRect(0, y - r, 560, r * 2);
      const bg = c.createLinearGradient(0, y - r, 0, y + r); bg.addColorStop(0, '#fbe6a6'); bg.addColorStop(1, '#b8862b'); c.fillStyle = bg; c.fillRect(0, y - r + 2, 560, r * 2 - 4);
      for (let x = 0; x < 560; x += 16) { c.fillStyle = (x / 16) % 2 ? '#b3243a' : '#fffaf0'; c.beginPath(); c.arc(x, y, r * .38, 0, TAU); c.fill(); }
    });
    c.restore();
    blossom(c, cx, 76, 20, '#f5a8ba', '#fff', 0, 6);
    c.fillStyle = '#8a5a1e'; c.fillRect(cx - 228, 246, 456, 30);
    const gb = c.createLinearGradient(0, 246, 0, 276); gb.addColorStop(0, '#f3d58e'); gb.addColorStop(1, '#b8862b'); c.fillStyle = gb; c.fillRect(cx - 226, 248, 452, 26);
    for (let x = cx - 212; x <= cx + 212; x += 28) rose(c, x, 261, 13, '#ffc4cf', '#c8435f', x);
    for (let x = cx - 220; x <= cx + 220; x += 22) {
      const i = Math.round((x - cx) / 22), len = 40 + (Math.abs(i) % 3) * 22 + (10 - Math.abs(i)) * 3;
      c.strokeStyle = 'rgba(184,134,43,.8)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, 276); c.lineTo(x, 276 + len); c.stroke();
      for (let y = 284; y < 276 + len; y += 11) { c.fillStyle = (y / 11) % 2 < 1 ? '#fffaf0' : '#e8c27a'; c.beginPath(); c.arc(x, y, 3.6, 0, TAU); c.fill(); }
      c.fillStyle = i % 2 ? '#e9768f' : '#f3d58e'; c.beginPath(); c.moveTo(x, 276 + len); c.lineTo(x + 6, 288 + len); c.lineTo(x, 300 + len); c.lineTo(x - 6, 288 + len); c.fill();
    }
  });

  // ---------- lettering ----------
  function font(f, z, s) {
    if (DEV.test(s)) return f === 'script' ? `700 ${Math.round(z * .8)}px "Amita"` : f === 'title' ? `${Math.round(z * .9)}px "Yatra One"` : `${Math.round(z * .9)}px "Tiro Devanagari Hindi"`;
    return f === 'script' ? `${z}px "Great Vibes"` : f === 'title' ? `700 ${z}px "Cinzel"` : f === 'caps' ? `${z}px "Marcellus"` : f === 'ital' ? `italic ${z}px "Cormorant Garamond"` : `${z}px "Gilda Display"`;
  }
  function say(c, s, x, y, f, z, col, a = 1, maxW = 940, reveal = 1) {
    if (!clean(s) || a <= .01) return;
    c.save(); c.globalAlpha *= a; c.textAlign = 'center'; c.textBaseline = 'middle';
    let zz = z; for (let i = 0; i < 20; i++) { c.font = font(f, zz, s); if (c.measureText(s).width <= maxW) break; zz *= .94; }
    if (reveal < 1) { const w = c.measureText(s).width; c.beginPath(); c.rect(x - w / 2 - 40, y - zz, (w + 80) * reveal, zz * 2); c.clip(); }
    c.fillStyle = typeof col === 'function' ? col(c, x, c.measureText(s).width, zz) : col; c.fillText(s, x, y);
    c.restore();
  }
  // a band of light that sweeps across lettering (p 0 -> 1), drawn over the same words
  const sheen = p => (c, x, w) => {
    const g = c.createLinearGradient(x - w / 2 - 120, 0, x + w / 2 + 120, 0), u = clamp(p) * .9 + .05;
    g.addColorStop(0, 'rgba(255,236,190,0)'); g.addColorStop(Math.max(0, u - .06), 'rgba(255,236,190,0)'); g.addColorStop(u, 'rgba(255,244,214,.95)');
    g.addColorStop(Math.min(1, u + .06), 'rgba(255,236,190,0)'); g.addColorStop(1, 'rgba(255,236,190,0)'); return g;
  };
  // deep gold lettering
  const goldInk = (c, x, w, z) => { const g = c.createLinearGradient(0, -z * .6, 0, z * .6); g.addColorStop(0, '#d9a94c'); g.addColorStop(.5, '#8a5a1e'); g.addColorStop(1, '#c08a34'); return g; };
  function shine(c, s, x, y, f, z, a, t, at, maxW) { const p = (t - at) / 1.3; if (p > 0 && p < 1) say(c, s, x, y, f, z, sheen(p), a, maxW); }
  // a warm light leak that drifts across the frame once
  function leak(c, p) {
    if (p <= 0 || p >= 1) return;
    const x = lerp(-400, W + 400, p), g = c.createRadialGradient(x, H * .35, 0, x, H * .35, 700);
    g.addColorStop(0, `rgba(255,214,170,${(.38 * Math.sin(p * Math.PI)).toFixed(3)})`); g.addColorStop(1, 'rgba(255,214,170,0)');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
  }
  function flourish(c, x, y, dir, a, col = WINE) {
    c.save(); c.globalAlpha *= a; c.strokeStyle = col; c.lineWidth = 3; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x + dir * 30, y - 26, x + dir * 60, y + 18, x + dir * 90, y - 4); c.stroke();
    c.beginPath(); c.arc(x + dir * 96, y - 8, 6, 0, TAU); c.stroke();
    c.restore();
  }
  function heartPath(c, x, y, s) {
    c.beginPath(); c.moveTo(x, y + s * .35);
    c.bezierCurveTo(x - s * 1.1, y - s * .35, x - s * .55, y - s * 1.05, x, y - s * .45);
    c.bezierCurveTo(x + s * .55, y - s * 1.05, x + s * 1.1, y - s * .35, x, y + s * .35);
  }

  // ---------- the card's details ----------
  function weddingDate(card) {
    if (card && card.sampleOf) return new Date(2026, 11, 2, 19, 0);
    const all = days(card || {}).filter(d => d.date);
    const wed = all.find(d => d.events.some(e => /wedding|vivah|shaadi|shadi|phere|lagan|विवाह|शादी|फेरे/i.test(e.name)));
    if (wed) return wed.date;
    if (typeof Core !== 'undefined' && card && card.date) { const d = Core.parseDate(card.date); if (d) return d; }
    return all.length ? all[0].date : new Date(2026, 11, 2, 19, 0);
  }
  function grid(date) {
    const y = date.getFullYear(), m = date.getMonth(), first = new Date(y, m, 1).getDay(), n = new Date(y, m + 1, 0).getDate();
    const cells = [];
    for (let d = 1; d <= n; d++) { const i = first + d - 1; cells.push({ d, col: i % 7, row: Math.floor(i / 7) }); }
    return { y, m, cells, rows: Math.floor((first + n - 1) / 7) + 1 };
  }
  const CX = col => 540 + (col - 3) * 112, ROW0 = 742, ROWH = 66, RY = row => ROW0 + row * ROWH;

  function setFor(s, P) {
    if (s.cal) return s.cal;
    const date = weddingDate(P.card), G = grid(date), target = G.cells.find(x => x.d === date.getDate()) || G.cells[0];
    // the heart's hops: a few dates around the month, then the wedding day
    const R = rng(date.getDate() * 13 + G.m), stops = [];
    let pick = G.cells[Math.floor(R() * 4)];
    for (let i = 0; i < 5; i++) {
      stops.push(pick);
      let next; do next = G.cells[Math.floor(R() * G.cells.length)]; while (next === pick || next === target || Math.abs(next.row - pick.row) > 2);
      pick = next;
    }
    stops.push(target);
    return (s.cal = { date, G, target, stops });
  }

  // ---------- shots ----------
  function backdrop(c, P, pt, t, intro) {
    const k = kOf(P);
    c.drawImage(page(k), 0, 0, W, H);
    c.save(); c.globalAlpha = .55 + .25 * Math.sin(t * .9); c.drawImage(rays(k), 0, 0, W, H); c.restore();
    // the jhoomar drops in on a spring, then swings gently for ever
    const dp = intro ? clamp((pt - .2) / 1.3) : 1, drop = intro ? (1 - dp) * -420 + Math.sin(dp * 9) * (1 - dp) * 60 : 0;
    const sw = Math.sin(t * 1.6) * .035 * (intro ? Math.min(1, pt) : 1) + (intro ? Math.sin(dp * 12) * (1 - dp) * .12 : 0);
    c.save(); c.translate(540, drop - 6); c.rotate(sw); c.drawImage(jhoomar(k), -280, 0, 560, 400); c.restore();
  }
  function corners(c, P, pt, t, intro) {
    const k = kOf(P), b = intro ? ease(pt / 1.6) : 1;
    const put = (img, x, bottom, fx, w, h, ph) => {
      const g = .55 + .45 * b;
      c.save(); c.translate(x, bottom ? H : 0); c.scale(fx * g, g); c.rotate(Math.sin(t * .8 + ph) * .02 * (bottom ? -1 : 1));
      c.globalAlpha = b; c.drawImage(img, 0, bottom ? -h : 0, w, h); c.restore();
    };
    put(cornerTop(k), 0, false, 1, 420, 450, 0); put(cornerTop(k), W, false, -1, 420, 450, 1.3);
    put(cornerBot(k), 0, true, 1, 440, 500, 2.1); put(cornerBot(k), W, true, -1, 440, 500, 3.4);
  }
  function drawCouple(c, P, pt, t, rise, hgt = 760, foot = 1900) {
    const img = couple(P); if (!img) return;
    const a = ease(rise), h = hgt * (1 + .008 * Math.sin(t * 1.3)), w = h * img.naturalWidth / img.naturalHeight;
    c.save(); c.globalAlpha = a;
    glow(c, 540, foot - h * .55, h * .62, 'rgba(255,248,236,.85)');
    c.translate(540, foot + (1 - a) * 140); c.rotate(Math.sin(t * .9) * .008); c.scale(.92 + .08 * a, .92 + .08 * a);
    c.drawImage(img, -w / 2, -h, w, h);
    c.restore();
  }

  function calendarShot(c, s, pt, t, P) {
    const hi = P.opt.lang === 'hi', { date, G, target, stops } = setFor(s, P);
    const fade = clamp(pt / .9), zc = 1.045 - .045 * ease(pt / 3) + .03 * clamp((pt - 3) / 7.6);
    c.save(); c.translate(540, 900); c.scale(zc, zc); c.translate(-540, -900);
    backdrop(c, P, pt, t, true);
    // words
    say(c, hi ? 'शुभ तिथि याद रखें' : 'Save The Date', 540, 400, 'title', 78, RED, ease((pt - .5) / .5), 900, ease((pt - .5) / 1.1));
    shine(c, hi ? 'शुभ तिथि याद रखें' : 'Save The Date', 540, 400, 'title', 78, 1, pt, 1.7, 900);
    shine(c, hi ? 'शुभ तिथि याद रखें' : 'Save The Date', 540, 400, 'title', 78, 1, pt, 9.0, 900);
    say(c, hi ? 'हम विवाह बंधन में बंध रहे हैं' : 'We are getting married on', 540, 484, 'serif', 44, INK, ease((pt - 1.1) / .7));
    const ma = ease((pt - 1.5) / .8);
    c.save(); c.translate(540, 584); c.scale(.85 + .15 * ma, .85 + .15 * ma);
    say(c, `${(hi ? HI_MONTHS : MONTH_EN)[G.m]} ${G.y}`.toUpperCase(), 0, 0, 'title', 88, WINE, ma, 760);
    shine(c, `${(hi ? HI_MONTHS : MONTH_EN)[G.m]} ${G.y}`.toUpperCase(), 0, 0, 'title', 88, 1, pt, 2.4, 760);
    c.restore();
    flourish(c, 150, 590, -1, ma * .9); flourish(c, 930, 590, 1, ma * .9);
    // weekday row and rule
    const ha = ease((pt - 1.9) / .6);
    (hi ? HI_WD : EN_WD).forEach((d, i) => say(c, d, CX(i), 676, 'caps', hi ? 28 : 26, INK2, ha));
    c.save(); c.globalAlpha = ha; c.strokeStyle = 'rgba(122,31,36,.55)'; c.lineWidth = 2; c.beginPath(); c.moveTo(540 - 380 * ha, 700); c.lineTo(540 + 380 * ha, 700); c.stroke(); c.restore();
    // the dates pop in row by row
    const HOP = .78, h0 = 3.2, land = h0 + (stops.length - 1) * HOP, lp = clamp((pt - land) / .5);
    G.cells.forEach(x => {
      const p = ease((pt - 2.1 - x.row * .14 - x.col * .03) / .45);
      if (p <= 0) return;
      const isT = x === target && pt >= land;
      if (isT) {
        const pulse = 1 + .12 * Math.sin(Math.max(0, pt - land) * 5) * Math.exp(-(pt - land) * .8);
        c.save(); c.translate(CX(x.col), RY(x.row) + 2); c.scale(lp * pulse, lp * pulse);
        glow(c, 0, 0, 90, 'rgba(232,92,110,.35)');
        heartPath(c, 0, 4, 46); c.fillStyle = '#b3243a'; c.fill();
        c.restore();
      }
      c.save(); c.translate(CX(x.col), RY(x.row)); c.scale(p, p);
      say(c, String(x.d), 0, 0, 'serif', 40, isT ? '#fff8f0' : INK, p);
      c.restore();
    });
    // the heart hops from date to date, then lands on the day
    if (pt > h0 - .5) {
      const u = (pt - h0) / HOP, i = Math.max(0, Math.min(stops.length - 1, Math.floor(u))), f = clamp(u - i);
      const A = stops[i], B = stops[Math.min(stops.length - 1, i + 1)];
      let x, y, sc = 1;
      if (pt >= land) { x = CX(target.col); y = RY(target.row); sc = 1 - lp; }
      else {
        const m = clamp(f / .7), e = m * m * (3 - 2 * m);
        x = lerp(CX(A.col), CX(B.col), e); y = lerp(RY(A.row), RY(B.row), e) - Math.sin(e * Math.PI) * 70;
        sc = 1 + Math.sin(e * Math.PI) * .25;
      }
      const a = clamp((pt - (h0 - .5)) / .4) * (pt >= land ? 1 - lp : 1);
      if (a > .01) {
        c.save(); c.globalAlpha = a; c.translate(x, y + 2); c.scale(sc, sc); c.rotate(Math.sin(pt * 6) * .12);
        heartPath(c, 0, 4, 34); c.lineWidth = 5; c.strokeStyle = '#3a1612'; c.lineJoin = 'round'; c.stroke();
        c.restore();
      }
    }
    // a gold ring draws itself around the day, with three lights going slowly round it
    if (pt >= land + .2) {
      const q = ease((pt - land - .2) / .7), x = CX(target.col), y = RY(target.row) + 2;
      c.save(); c.strokeStyle = '#c99a45'; c.lineWidth = 3; c.beginPath(); c.arc(x, y, 50, -Math.PI / 2, -Math.PI / 2 + TAU * q); c.stroke();
      c.lineWidth = 1.2; c.beginPath(); c.arc(x, y, 58, Math.PI / 2, Math.PI / 2 + TAU * q); c.stroke();
      for (let i = 0; i < 3; i++) { const an = t * 1.6 + i * TAU / 3; glow(c, x + Math.cos(an) * 54, y + Math.sin(an) * 54, 14 * q, 'rgba(255,236,180,.9)'); }
      c.restore();
    }
    // a ring of light and gold sparks where it lands
    if (pt >= land && pt < land + 1.4) {
      const q = (pt - land) / 1.4, x = CX(target.col), y = RY(target.row);
      c.save(); c.globalAlpha = 1 - q; c.strokeStyle = '#e8c27a'; c.lineWidth = 6 * (1 - q) + 1; c.beginPath(); c.arc(x, y, 40 + q * 120, 0, TAU); c.stroke(); c.restore();
      K.burst(c, x, y, q, '214,64,90', 22, 150);
      K.burst(c, x, y, Math.min(1, q * 1.2), '232,194,122', 16, 110);
    }
    // the couple rises below, then their names appear once the day is chosen
    drawCouple(c, P, pt, t, (pt - 1.9) / 1.4);
    const names = coupleLine(P, hi), na = ease((pt - land - .5) / .8);
    if (na > 0) {
      const ny = RY(G.rows - 1) + 92;
      c.save(); c.translate(0, (1 - na) * 24);
      say(c, names, 540, ny, 'script', 72, WINE, na, 860);
      c.restore();
    }
    corners(c, P, pt, t, true);
    K.sparks(c, t, 16, '#e8c27a', 5);
    petals(c, t, 26, ['#f4a6b8', '#e9768f', '#ffd3dc', '#c8435f'], 41, 1);
    leak(c, (pt - .6) / 3.2); leak(c, (pt - land) / 2.6);
    c.restore();
    if (fade < 1) { c.fillStyle = `rgba(253,246,236,${(1 - fade) * .85})`; c.fillRect(0, 0, W, H); }
  }

  function groomBride(P) {
    const c = P.card || {};
    return { groom: clean(c.host2) || 'Shivam Gupta', bride: clean(c.host1) || 'Anaya Gupta' };
  }
  function coupleLine(P, hi) { const { groom, bride } = groomBride(P); return `${groom.split(' ')[0]} ${hi ? 'संग' : '&'} ${bride.split(' ')[0]}`; }

  function namesShot(c, s, pt, t, P) {
    const hi = P.opt.lang === 'hi', { date } = setFor(s, P), { groom, bride } = groomBride(P);
    const zc = 1.06 - .06 * ease(pt / 5.6);
    c.save(); c.translate(540, 800); c.scale(zc, zc); c.translate(-540, -800);
    backdrop(c, P, pt, t, false);
    K.motes(c, t, 14, 'rgba(255,214,140,A)', 9, 18);
    const a1 = ease((pt - .3) / .8), a2 = ease((pt - .7) / .4), a3 = ease((pt - 1.6) / .4), a4 = ease((pt - 2.6) / .8);
    // a Mughal arch in fine gold draws itself round the names (two lines, from the foot up over the crown)
    const fp = ease((pt - .2) / 1.8);
    const arch = (inset) => {
      const L = 150 + inset, Rr = 930 - inset, B = 1170 - inset * .4, S = 640 + inset * .3, top = 430 + inset;
      c.beginPath(); c.moveTo(L, B); c.lineTo(L, S);
      c.bezierCurveTo(L, S - 120, 540 - 170, top + 70, 540, top);
      c.bezierCurveTo(540 + 170, top + 70, Rr, S - 120, Rr, S); c.lineTo(Rr, B);
    };
    c.save(); c.strokeStyle = '#c99a45'; c.lineCap = 'round';
    c.lineWidth = 3; c.setLineDash([2400 * fp, 2400]); arch(0); c.stroke();
    c.lineWidth = 1.2; arch(16); c.stroke(); c.restore();
    const cr = ease((pt - 1.4) / .6);
    if (cr > 0) { // a lotus finial on the crown and a blossom at each foot
      blossom(c, 540, 428, 24 * cr, '#f3a3b5', '#fff6f2', t * .3, 6); glow(c, 540, 428, 50 * cr, 'rgba(255,230,170,.5)');
      c.fillStyle = '#e8c27a'; c.beginPath(); c.arc(540, 428, 6 * cr, 0, TAU); c.fill();
      [150, 930].forEach((x, i) => blossom(c, x, 1170, 22 * cr, '#f3a3b5', '#fff6f2', t * .3 + i, 5));
    }
    const [g1, ...gs] = groom.split(' '), [b1, ...bs] = bride.split(' '), gSur = gs.join(' '), bSur = bs.join(' ');
    say(c, hi ? '॥ शुभ विवाह ॥' : 'Together with their families', 540, 540, hi ? 'title' : 'ital', hi ? 48 : 42, INK2, a1, 600);
    // the names write in from left to right, then a band of light runs over them; the surname in spaced gold capitals
    say(c, g1, 540, 650, 'script', 136, WINE, Math.min(1, a2 * 3), 680, ease((pt - .7) / 1.1));
    shine(c, g1, 540, 650, 'script', 136, 1, pt, 2.0, 680);
    if (gSur) { c.save(); K.spacing(c, 12); say(c, gSur.toUpperCase(), 540, 734, 'title', 32, goldInk, ease((pt - 1.3) / .6), 600); K.spacing(c, 0); c.restore(); }
    say(c, hi ? 'संग' : 'weds', 540, 806, 'ital', 54, RED, a3);
    say(c, b1, 540, 892, 'script', 136, WINE, Math.min(1, a3 * 3), 680, ease((pt - 1.7) / 1.2));
    shine(c, b1, 540, 892, 'script', 136, 1, pt, 3.0, 680);
    if (bSur) { c.save(); K.spacing(c, 12); say(c, bSur.toUpperCase(), 540, 976, 'title', 32, goldInk, ease((pt - 2.4) / .6), 600); K.spacing(c, 0); c.restore(); }
    // a fine divider with a beating heart, then the day and the place
    c.save(); c.globalAlpha = a4; c.strokeStyle = 'rgba(184,134,43,.9)'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(540 - 220 * a4, 1032); c.lineTo(520, 1032); c.moveTo(560, 1032); c.lineTo(540 + 220 * a4, 1032); c.stroke();
    heartPath(c, 540, 1036, 13 * (1 + .15 * Math.sin(t * 4))); c.fillStyle = '#b3243a'; c.fill(); c.restore();
    const dd = date.getDate(), mon = (hi ? HI_MONTHS : MONTH_EN)[date.getMonth()];
    say(c, hi ? `${HI_DAY[date.getDay()]}, ${dd} ${mon} ${date.getFullYear()}` : `${EN_DAY[date.getDay()]}, ${dd} ${mon} ${date.getFullYear()}`, 540, 1092, 'title', 40, WINE, a4, 700);
    const venue = clean((P.card || {}).venue);
    if (venue) say(c, venue, 540, 1140, 'serif', 32, INK2, ease((pt - 3) / .8), 680);
    drawCouple(c, P, pt, t, .35 + pt / 1.4, 640, 1900);
    corners(c, P, pt, t, false);
    K.sparks(c, t, 14, '#e8c27a', 6);
    petals(c, t + 20, 30, ['#f4a6b8', '#e9768f', '#ffd3dc', '#c8435f'], 43, 1);
    leak(c, (pt - .1) / 3);
    c.restore();
  }

  return {
    id: 'story-savedate', order: 3, occasion: 'wedding', tune: 'romantic', thumb: 8.6,
    name: 'Save The Date', note: 'A jhoomar of roses swings over a cream page as a little heart hops across the calendar and lands on the wedding day, then the couple’s names in script',
    names: ['Anaya Gupta', 'Shivam Gupta'], ganesha: 'ganesha-01',
    looks: { open: 'blush-champagne', title: 'blush-champagne', invite: 'blush-champagne', events: ['blush-champagne'], date: 'blush-champagne', end: 'blush-champagne', final: 'blush-champagne' },
    look: (kind, K) => K.palette('blush-champagne', { font: { script: 'Great Vibes', serif: 'Gilda Display' }, col: { names: WINE, ink: INK, ink2: INK2, accent: RED, gold: '#b8862b' },
      shadow: ['rgba(255,252,245,.9)', 6], fx: () => {} }),
    timeline(S, K, card, opt) {
      return [{ k: 'reel', reel: 'calendar', d: 10.6, name: 'Save The Date' },
        { k: 'reel', reel: 'names', d: 5.6, name: 'The Couple', change: 'petals' }];
    },
    shots: { calendar: calendarShot, names: namesShot }
  };
})(Cinema.kit));

} catch (e) { if (typeof console !== 'undefined') console.warn('Cinema: story-savedate.js', e); }

// ---------- js/cinema/story-shubhvivah.js ----------
try {
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

} catch (e) { if (typeof console !== 'undefined') console.warn('Cinema: story-shubhvivah.js', e); }

// ---------- js/cinema/story-velvetpromise.js ----------
try {
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

} catch (e) { if (typeof console !== 'undefined') console.warn('Cinema: story-velvetpromise.js', e); }

// ---------- js/cinema/story-vinyl.js ----------
try {
// Side A, Our Story: a vintage memory film for an anniversary. A record player on a walnut table in lamplight, the
// needle drops and the label turns; into it, the couple on their wedding day in an oval frame, sepia warming into
// colour, then the two of them today; the years count up in gold foil; a love-letter slips from its sealed envelope
// with the invitation; each function a track on the record; the dance floor; roses and thank you.
Cinema.register((K => {
  const { W, H, TAU, rng, clamp, ease, ease3, lerp, art, glow, rrect, leaf, rose, foliage, blossom, eucalyptus, planks,
    clean, dateRange, coupleImage, cutout, portrait, camAt, camera, foil, spacing, goldBevel, crestTop, rays, cornerScroll } = K;
  const kOf = P => Math.min(1.25, Math.max(.5, P.k));
  const hiOf = P => P.opt.lang === 'hi';
  const DISC = { x: 470, y: 980, r: 330 };
  // how many years, from the card's title or tagline (25 when it does not say); the wedding year from the date
  const yearsOf = card => { const m = /(\d{1,2})\s*(st|nd|rd|th)?\s*(years|year|yrs|साल|वर्ष|anniversary|सालगिरह)/i.exec(`${card.title || ''} ${card.tagline || ''}`) || /(\d{1,2})/.exec(`${card.title || ''} ${card.tagline || ''}`); const n = m ? +m[1] : 25; return n > 0 && n < 80 ? n : 25; };
  const yearNow = card => { const d = Date.parse(card.date || ''); return isNaN(d) ? 2026 : new Date(d).getFullYear(); };
  const jubilee = (n, hi) => { const J = { 1: ['Paper', 'प्रथम'], 10: ['Tin', 'दसवीं'], 15: ['Crystal', ''], 20: ['China', ''], 25: ['Silver Jubilee', 'रजत जयंती'], 30: ['Pearl Jubilee', 'मोती जयंती'], 40: ['Ruby Jubilee', 'माणिक जयंती'], 50: ['Golden Jubilee', 'स्वर्ण जयंती'], 60: ['Diamond Jubilee', 'हीरक जयंती'] }[n]; return J ? (hi ? J[1] || '' : J[0]) : ''; };
  const initials = card => [clean(card.host1), clean(card.host2)].filter(Boolean).map(s => Array.from(s)[0].toUpperCase());

  // ---- still art ----
  // the walnut table from above in lamplight: the record player (its disc and arm move), roses, letters, glasses
  function tableArt(k, card) {
    const ini = initials(card).join(' & ');
    return art(`vy-table-${ini}`, W, H, k, c => {
      const R = rng(19);
      planks(c, 0, 0, W, H, '#4a2a18', R);
      glow(c, 300, 500, 1100, 'rgba(255,200,130,.35)');
      // the record player: a walnut plinth with brass trim, platter well, speed knobs
      c.save(); c.shadowColor = 'rgba(10,4,0,.6)'; c.shadowBlur = 50; c.shadowOffsetX = 16; c.shadowOffsetY = 26;
      c.fillStyle = '#6a3a1a'; rrect(c, 70, 560, 900, 840, 30); c.fill(); c.restore();
      const wg = c.createLinearGradient(70, 560, 970, 1400); wg.addColorStop(0, '#9a5a2a'); wg.addColorStop(.5, '#6e3a18'); wg.addColorStop(1, '#4a2410'); c.fillStyle = wg; rrect(c, 70, 560, 900, 840, 30); c.fill();
      for (let i = 0; i < 40; i++) { c.strokeStyle = `rgba(40,16,4,${.1 + R() * .15})`; c.lineWidth = 1 + R() * 2; const y = 570 + R() * 820; c.beginPath(); c.moveTo(80, y); c.bezierCurveTo(400, y + 10, 600, y - 10, 960, y + 5); c.stroke(); }
      c.strokeStyle = goldBevel(c, 70, 560, 970, 1400); c.lineWidth = 6; rrect(c, 84, 574, 872, 812, 24); c.stroke();
      c.fillStyle = '#1a0e08'; c.beginPath(); c.arc(DISC.x, DISC.y, DISC.r + 26, 0, TAU); c.fill();
      c.fillStyle = '#c0c4cc'; c.beginPath(); c.arc(DISC.x, DISC.y, DISC.r + 12, 0, TAU); c.fill();
      // the arm's base (top right) and two brass knobs
      c.fillStyle = goldBevel(c, 820, 640, 900, 720); c.beginPath(); c.arc(860, 680, 56, 0, TAU); c.fill(); c.fillStyle = '#2a1a10'; c.beginPath(); c.arc(860, 680, 30, 0, TAU); c.fill();
      for (const [x, y] of [[860, 1290], [760, 1300]]) { c.fillStyle = goldBevel(c, x - 30, y - 30, x + 30, y + 30); c.beginPath(); c.arc(x, y, 30, 0, TAU); c.fill(); c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(x - 2, y - 26, 4, 18); }
      c.fillStyle = '#f2d27a'; c.font = '26px "Cinzel"'; c.textAlign = 'left'; spacing(c, 4); c.fillText('33 · 45', 820, 1355); spacing(c, 0);
      // roses in a cut-glass bowl (top left), old letters tied with a ribbon (bottom), a pair of glasses
      c.save(); c.translate(150, 300);
      c.fillStyle = 'rgba(10,4,0,.4)'; c.beginPath(); c.arc(18, 26, 190, 0, TAU); c.fill();
      for (let i = 0; i < 18; i++) leaf(c, (R() - .5) * 300, (R() - .5) * 300, 110, 34, R() * TAU, R() > .5 ? '#2f5a2c' : '#4a7a3c');
      [[0, 0, 70], [-90, -40, 58], [80, -50, 60], [-40, 80, 56], [70, 70, 54], [-110, 50, 48], [10, -110, 52]].forEach(([x, y, r], i) => rose(c, x, y, r, i % 2 ? '#e0405a' : '#f06a80', i % 2 ? '#7a0a1e' : '#9a1a30', R() * 3));
      c.restore();
      c.save(); c.translate(380, 1640); c.rotate(-.08);
      for (let i = 0; i < 4; i++) { c.save(); c.rotate((i - 1.5) * .06); c.fillStyle = 'rgba(10,4,0,.35)'; c.fillRect(-250 + 10, -110 + 14, 500, 220); c.fillStyle = ['#efe0c0', '#e6d2a8', '#f3e6cc', '#e9d8b4'][i]; c.fillRect(-250, -110, 500, 220);
        c.strokeStyle = 'rgba(120,80,40,.3)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-250, -110); c.lineTo(0, 10); c.lineTo(250, -110); c.stroke(); c.restore(); }
      c.fillStyle = '#9a1a2a'; c.fillRect(-260, -14, 520, 26); c.fillRect(-14, -120, 28, 240);
      c.beginPath(); c.ellipse(-30, -10, 40, 20, -.5, 0, TAU); c.ellipse(30, -10, 40, 20, .5, 0, TAU); c.fill();
      c.fillStyle = '#c42030'; c.beginPath(); c.arc(0, 0, 26, 0, TAU); c.fill();
      c.restore();
      c.save(); c.translate(860, 1640); c.rotate(.3); c.strokeStyle = '#c9952e'; c.lineWidth = 6; for (const d of [-1, 1]) { c.beginPath(); c.ellipse(d * 60, 0, 52, 40, 0, 0, TAU); c.stroke(); } c.beginPath(); c.moveTo(-10, -6); c.quadraticCurveTo(0, -18, 10, -6); c.stroke();
      c.beginPath(); c.moveTo(-112, -8); c.lineTo(-190, -60); c.moveTo(112, -8); c.lineTo(190, -60); c.stroke(); c.fillStyle = 'rgba(255,255,255,.12)'; for (const d of [-1, 1]) { c.beginPath(); c.ellipse(d * 60, 0, 48, 36, 0, 0, TAU); c.fill(); } c.restore();
      // a record sleeve peeking out (top right)
      c.save(); c.translate(860, 300); c.rotate(.2); c.fillStyle = 'rgba(10,4,0,.4)'; c.fillRect(-170, -150, 360, 340); c.fillStyle = '#e9d8b4'; c.fillRect(-180, -170, 360, 340);
      c.fillStyle = '#7a1a2a'; c.fillRect(-160, -150, 320, 300); c.fillStyle = '#f2d27a'; c.font = '700 70px "Cinzel Decorative"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(ini || '♥', 0, -10);
      c.font = 'italic 30px "Cormorant Garamond"'; c.fillText('Love Songs', 0, 80); c.restore();
      const v = c.createRadialGradient(400, 800, 300, 540, 960, 1300); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(10,4,0,.65)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
    });
  }
  // the vinyl disc with its grooves (still: grooves look the same turning) and the label (it turns)
  function discArt(k) {
    return art('vy-disc', 700, 700, k, c => {
      const g = c.createRadialGradient(350, 350, 100, 350, 350, 350); g.addColorStop(0, '#1a1a1e'); g.addColorStop(1, '#08080a'); c.fillStyle = g; c.beginPath(); c.arc(350, 350, 340, 0, TAU); c.fill();
      for (let r = 130; r < 336; r += 3) { c.strokeStyle = `rgba(255,255,255,${(r % 15 === 0 ? .07 : .025)})`; c.lineWidth = 1; c.beginPath(); c.arc(350, 350, r, 0, TAU); c.stroke(); }
      for (const r of [200, 262]) { c.strokeStyle = 'rgba(0,0,0,.8)'; c.lineWidth = 5; c.beginPath(); c.arc(350, 350, r, 0, TAU); c.stroke(); }
    });
  }
  function labelArt(k, card, year) {
    const ini = initials(card);
    return art(`vy-label-${ini.join('')}-${year}`, 260, 260, k, c => {
      const g = c.createRadialGradient(110, 100, 10, 130, 130, 130); g.addColorStop(0, '#c4283a'); g.addColorStop(1, '#6a0a18'); c.fillStyle = g; c.beginPath(); c.arc(130, 130, 128, 0, TAU); c.fill();
      c.strokeStyle = '#f2d27a'; c.lineWidth = 3; c.beginPath(); c.arc(130, 130, 116, 0, TAU); c.stroke(); c.lineWidth = 1.5; c.beginPath(); c.arc(130, 130, 108, 0, TAU); c.stroke();
      c.fillStyle = '#f6dc8a'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.font = '20px "Cinzel"'; spacing(c, 5); c.fillText('SIDE A', 130, 48); spacing(c, 0);
      c.font = '700 54px "Cinzel Decorative"'; c.fillText(ini.length > 1 ? `${ini[0]}♥${ini[1]}` : (ini[0] || '♥'), 130, 112);
      c.font = 'italic 24px "Cormorant Garamond"'; c.fillText('Our Story', 130, 172); c.font = '18px "Cinzel"'; spacing(c, 4); c.fillText(`EST. ${year}`, 130, 206); spacing(c, 0);
      c.fillStyle = '#e8e8ec'; c.beginPath(); c.arc(130, 130, 9, 0, TAU); c.fill();
    });
  }
  function disc(c, k, card, year, x, y, r, ang) {
    c.drawImage(discArt(k), x - r * 700 / 680, y - r * 700 / 680, r * 2 * 700 / 680, r * 2 * 700 / 680);
    c.save(); c.translate(x, y); c.rotate(ang); const lr = r * .38; c.drawImage(labelArt(k, card, year), -lr, -lr, lr * 2, lr * 2); c.restore();
    // the light on the grooves stays where the lamp is
    c.save(); c.beginPath(); c.arc(x, y, r, 0, TAU); c.arc(x, y, r * .4, 0, TAU, true); c.clip();
    for (const a of [-.9, 2.25]) { const g = c.createLinearGradient(x + Math.cos(a) * r, y + Math.sin(a) * r, x, y); g.addColorStop(0, 'rgba(255,240,220,.22)'); g.addColorStop(1, 'rgba(255,240,220,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(x, y); c.arc(x, y, r, a - .22, a + .22); c.fill(); }
    c.restore();
  }
  function tonearm(c, ang) {
    c.save(); c.translate(860, 680); c.rotate(ang);
    c.fillStyle = 'rgba(0,0,0,.35)'; c.save(); c.translate(10, 14); c.fillRect(-8, 0, 16, 470); c.restore();
    const g = c.createLinearGradient(-10, 0, 10, 0); g.addColorStop(0, '#8a8e96'); g.addColorStop(.5, '#f4f6fa'); g.addColorStop(1, '#7a7e86'); c.fillStyle = g; c.fillRect(-8, -60, 16, 520);
    c.fillStyle = '#2a2a30'; rrect(c, -22, -110, 44, 60, 10); c.fill();
    c.save(); c.translate(0, 460); c.rotate(-.35); c.fillStyle = goldBevel(c, -26, 0, 26, 80); rrect(c, -24, 0, 48, 86, 8); c.fill(); c.restore();
    c.fillStyle = goldBevel(c, -30, -30, 30, 30); c.beginPath(); c.arc(0, 0, 30, 0, TAU); c.fill();
    c.restore();
  }
  // a burgundy damask wall for the memory frames
  function wallArt(k) {
    return art('vy-wall', W, 2400, k, c => {
      const g = c.createLinearGradient(0, 0, 0, 2400); g.addColorStop(0, '#4a1a22'); g.addColorStop(1, '#2a0a12'); c.fillStyle = g; c.fillRect(0, 0, W, 2400);
      for (let x = 0; x < W; x += 120) { c.fillStyle = 'rgba(255,214,140,.04)'; c.fillRect(x, 0, 60, 2400); }
      c.globalAlpha = .13; for (let y = 0; y < 2400; y += 220) for (let x = (y / 220 % 2) * 120; x < W + 120; x += 240) { K.paisley(c, x, y, 70, 0, '#f2c76b'); K.paisley(c, x, y + 10, 70, Math.PI, '#f2c76b'); } c.globalAlpha = 1;
      glow(c, 540, 600, 700, 'rgba(255,200,130,.22)'); glow(c, 540, 1700, 700, 'rgba(255,200,130,.22)');
      c.fillStyle = '#2a1008'; c.fillRect(0, 2280, W, 120); c.fillStyle = goldBevel(c, 0, 2276, W, 2290); c.fillRect(0, 2274, W, 10);
    });
  }
  // an ornate oval gold frame (its photo drawn live), centre (x, y), size w × h
  function ovalFrame(c, x, y, w, h) {
    c.save(); c.shadowColor = 'rgba(0,0,0,.55)'; c.shadowBlur = 40; c.shadowOffsetY = 20; c.fillStyle = '#3a2008'; c.beginPath(); c.ellipse(x, y, w / 2 + 40, h / 2 + 40, 0, 0, TAU); c.fill(); c.restore();
    c.strokeStyle = goldBevel(c, x - w / 2, y - h / 2, x + w / 2, y + h / 2); c.lineWidth = 46; c.beginPath(); c.ellipse(x, y, w / 2 + 20, h / 2 + 20, 0, 0, TAU); c.stroke();
    c.strokeStyle = 'rgba(110,64,8,.7)'; c.lineWidth = 2; for (const d of [2, 38]) { c.beginPath(); c.ellipse(x, y, w / 2 + d, h / 2 + d, 0, 0, TAU); c.stroke(); }
    for (let i = 0; i < 48; i++) { const a = i / 48 * TAU; c.fillStyle = i % 2 ? '#fff0b8' : '#b07a22'; c.beginPath(); c.arc(x + Math.cos(a) * (w / 2 + 20), y + Math.sin(a) * (h / 2 + 20), 6, 0, TAU); c.fill(); }
    crestTop(c, x, y - h / 2 - 54, 70, '#b0102e');
    for (const d of [-1, 1]) { c.save(); c.translate(x, y + h / 2 + 46); c.scale(d, 1); for (let i = 0; i < 4; i++) leaf(c, 30 + i * 30, 0, 70, 20, -.3 + i * .2, goldBevel(c, 0, -30, 150, 30), false); c.restore(); }
  }
  // the couple's picture in an oval: sepia (painted once per picture) or colour
  function photo(c, k, img, x, y, w, h, t, sep, key) {
    c.save(); c.beginPath(); c.ellipse(x, y, w / 2, h / 2, 0, 0, TAU); c.clip();
    if (sep < 1) portrait(c, img, x - w / 2, y - h / 2, w, h, t);
    if (sep > 0) {
      const cv = art(`vy-sep-${key}-${img ? (img.src || '').slice(-24) : 'x'}`, w, h, k, g => {
        portrait(g, img, 0, 0, w, h, 0);
        g.globalCompositeOperation = 'saturation'; g.fillStyle = '#808080'; g.fillRect(0, 0, w, h);
        g.globalCompositeOperation = 'multiply'; g.fillStyle = '#e0b880'; g.fillRect(0, 0, w, h);
        g.globalCompositeOperation = 'source-over'; const R = rng(5); for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${R() > .5 ? '255,240,210' : '60,30,10'},${R() * .12})`; g.fillRect(R() * w, R() * h, 2, 2); }
        const v = g.createRadialGradient(w / 2, h / 2, w * .25, w / 2, h / 2, w * .75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(60,30,10,.5)'); g.fillStyle = v; g.fillRect(0, 0, w, h);
      });
      c.globalAlpha = sep; c.drawImage(cv, x - w / 2, y - h / 2, w, h); c.globalAlpha = 1;
    }
    const gl = c.createLinearGradient(x - w / 2, y - h / 2, x + w / 2, y + h / 2); gl.addColorStop(0, 'rgba(255,255,255,.18)'); gl.addColorStop(.4, 'rgba(255,255,255,0)'); c.fillStyle = gl; c.fillRect(x - w / 2, y - h / 2, w, h);
    c.restore();
  }
  // the letter paper and the envelope
  function paperArt(k) {
    return art('vy-paper', 820, 1100, k, c => {
      const R = rng(8);
      const g = c.createLinearGradient(0, 0, 820, 1100); g.addColorStop(0, '#fbf3e2'); g.addColorStop(1, '#efdcb8'); c.fillStyle = g; c.fillRect(0, 0, 820, 1100);
      for (let i = 0; i < 1800; i++) { c.fillStyle = `rgba(140,90,40,${R() * .05})`; c.fillRect(R() * 820, R() * 1100, 3, 3); }
      c.strokeStyle = 'rgba(160,110,60,.25)'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 367); c.lineTo(820, 367); c.moveTo(0, 733); c.lineTo(820, 733); c.stroke();
      c.strokeStyle = goldBevel(c, 0, 0, 820, 1100); c.lineWidth = 3; c.strokeRect(30, 30, 760, 1040);
      for (const [x, y, sx, sy] of [[30, 30, 1, 1], [790, 30, -1, 1], [30, 1070, 1, -1], [790, 1070, -1, -1]]) cornerScroll(c, x + sx * 8, y + sy * 8, sx, sy, 60);
      for (let i = 0; i < 5; i++) rose(c, 700 + (i % 3) * 30 - 20, 1000 - Math.floor(i / 2) * 40, 22, '#f8a0b0', '#b0203a', i);
      for (let i = 0; i < 6; i++) leaf(c, 690, 1010, 70, 20, -Math.PI / 2 - 1 + i * .3, '#7a9a6a', false);
    });
  }
  function envelopeArt(k, front) {
    return art(`vy-env-${front ? 'f' : 'b'}`, 900, 600, k, c => {
      c.fillStyle = '#d9b98a'; c.fillRect(0, 0, 900, 600);
      if (front) {
        c.fillStyle = '#e6caa0'; c.beginPath(); c.moveTo(0, 600); c.lineTo(450, 290); c.lineTo(900, 600); c.fill();
        c.fillStyle = '#ddc094'; c.beginPath(); c.moveTo(0, 0); c.lineTo(400, 320); c.lineTo(0, 600); c.fill(); c.beginPath(); c.moveTo(900, 0); c.lineTo(500, 320); c.lineTo(900, 600); c.fill();
        c.strokeStyle = 'rgba(120,80,30,.3)'; c.lineWidth = 2; c.strokeRect(1, 1, 898, 598);
      }
    });
  }
  function flap(c, x, y, w, u) {
    // the top flap folds up (u 0 closed … 1 open), a wax seal on its point
    const hgt = 330 * Math.cos(u * Math.PI);
    c.fillStyle = u < .5 ? '#cfae7e' : '#e9d2aa'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + w / 2, y + hgt); c.lineTo(x + w, y); c.fill();
    c.strokeStyle = 'rgba(120,80,30,.35)'; c.lineWidth = 2; c.stroke();
    if (u < .5) { const sx = x + w / 2, sy = y + hgt - 20; c.fillStyle = '#9a0a1e'; c.beginPath(); for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, r = 52 + (i % 2) * 6; c.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r * Math.max(.2, Math.cos(u * Math.PI))); } c.fill();
      c.fillStyle = '#c42030'; c.beginPath(); c.ellipse(sx, sy, 38, 38 * Math.max(.2, Math.cos(u * Math.PI)), 0, 0, TAU); c.fill(); c.fillStyle = '#7a0010'; c.font = '700 40px "Cinzel Decorative"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('♥', sx, sy + 2); }
  }
  const notes = (c, t, x, y, n) => { for (let i = 0; i < n; i++) { const ph = (t * .22 + i / n) % 1, xx = x + Math.sin(ph * 6 + i) * 120 + i * 30 - n * 15, yy = y - ph * 800; c.save(); c.globalAlpha = Math.sin(ph * Math.PI) * .9; c.fillStyle = goldBevel(c, xx - 30, yy - 50, xx + 30, yy + 20); c.font = `${60 + (i % 3) * 18}px "Segoe UI Symbol","Noto Music","Apple Symbols",serif`; c.textAlign = 'center'; c.fillText(i % 2 ? '♪' : '♫', xx, yy); c.restore(); } };

  return {
    id: 'story-vinyl', order: 23, occasion: 'anniversary', tune: 'cinematic', thumb: 10,
    name: 'Side A, Our Story', note: 'A record player in lamplight, their wedding photo warming from sepia to colour, the years counting up in gold, a love-letter and the dance floor',
    names: ['Shalini', 'Vikram'],
    looks: { open: 'palace-champagne', title: 'palace-champagne', invite: 'palace-champagne', events: ['palace-champagne'], date: 'palace-champagne', end: 'palace-champagne', final: 'palace-champagne' },
    titles: [[/cocktail|drinks|toast|कॉकटेल/i, 'Track 01 · A Toast to Us'], [/dinner|dance|बॉल|डिनर|नृत्य/i, 'Track 02 · The Last Dance'], [/cake|कटिंग/i, 'Track 03 · Sweet Moments'],
      [/renewal|vow|phera|वचन|फेरे/i, 'Side B · The Vows Again'], [/puja|pooja|पूजा/i, 'A Prayer of Thanks'], [/lunch|brunch|भोज/i, 'Track 04 · Family Table']],
    look(kind, K) {
      if (kind === 'roses') return K.palette('blush-champagne', { font: { script: 'Great Vibes', serif: 'Gilda Display' }, col: { names: '#8a1f3c', ink: '#3b2414', ink2: '#5e4428', accent: '#9a5b16', gold: '#b8862b' }, fx: (c, t) => K.petals(c, t, 14, ['#f48fb1', '#ffffff', '#e0405a'], 9) });
      return K.palette('palace-champagne', { font: { script: 'Great Vibes', serif: 'Gilda Display' }, fx: (c, t) => K.motes(c, t, 12, 'rgba(255,220,160,A)', 4, 8) });
    },
    timeline(S, K2, card, opt) {
      const at = k => S.findIndex(s => s.k === k);
      S.splice(at('open'), 1, { k: 'reel', reel: 'record', name: 'The Record', d: 7 }, { k: 'reel', reel: 'album', name: 'Then & Now', d: 8, cut: true });
      const ti = S[at('title')]; Object.assign(ti, { reel: 'years', d: 5.5, change: 'sparkle' }); delete ti.couple; delete ti.zone;
      S.splice(at('invite'), 1, { k: 'reel', reel: 'letter', name: 'The Letter', d: 7.5, change: 'none' });
      if (at('end') >= 0) S.splice(at('end'), 1);
      const evs = S.filter(s => s.k === 'event'), fixed = S.filter(s => s.k !== 'event').reduce((a, s) => a + s.d, 0);
      const d = evs.length ? clamp((59 - fixed) / evs.length, 3.6, 4.8) : 0;
      evs.forEach((s, i) => { Object.assign(s, { reel: 'track', d, datebar: true, board: 'cartouche', tone: 'cream', zone: [190, 1130, 800], change: i ? 'clink' : 'bloom' }); delete s.couple; delete s.coupleEntry; });
      const dt = S[at('date')]; if (dt) Object.assign(dt, { reel: 'ballroom', board: 'arch', tone: 'cream', zone: [150, 1000, 800], change: 'sparkle' });
      const fi = S[at('final')]; if (fi) Object.assign(fi, { reel: 'roses', change: 'petals', board: false, zone: [380, 1460, 820] });
    },
    shots: {
      record(c, s, pt, t, P) {
        const k = kOf(P), card = P.card, year = yearNow(card) - yearsOf(card), hi = hiOf(P);
        const drop = ease3((pt - .5) / 1.4), spin = clamp((pt - 1.8) / 1) ;
        const ang = pt < 1.8 ? 0 : (pt - 1.8) * 3.5 - (1 - spin) * .5;
        const zL = K.fillZoom(DISC.r * .76, DISC.r * .76, 1.1), into = clamp((pt - 4.8) / (s.d - 4.8)) ** 2.2;
        let cam = camAt(pt, [[0, { x: 540, y: 980, z: 1.02 }], [4.8, { x: 500, y: 980, z: 1.22 }]]);
        cam = { x: lerp(cam.x, DISC.x, into), y: lerp(cam.y, DISC.y, into), z: lerp(cam.z, zL, into), r: into * .6 };
        c.save(); camera(c, cam);
        c.drawImage(tableArt(k, card), 0, 0, W, H);
        disc(c, k, card, year, DISC.x, DISC.y, DISC.r, ang);
        tonearm(c, lerp(.15, .62, drop));
        c.restore();
        if (pt > 2) notes(c, t, 560, 1100, 6);
        const a = ease((pt - 2.2) / 1) * (1 - ease((pt - 4.6) / .5));
        if (a > .01) { c.save(); c.globalAlpha = a; const g = c.createLinearGradient(0, 0, 0, 420); g.addColorStop(0, 'rgba(10,4,0,.75)'); g.addColorStop(1, 'rgba(10,4,0,0)'); c.fillStyle = g; c.fillRect(0, 0, W, 420);
          foil(c, hi ? 'हमारी कहानी' : 'Side A · Our Story', W / 2, 160, { font: hi ? '96px "Amita"' : '120px "Great Vibes"', t });
          c.fillStyle = '#ffe8c0'; c.font = hi ? '42px "Tiro Devanagari Hindi"' : '34px "Cinzel"'; c.textAlign = 'center'; c.textBaseline = 'middle'; spacing(c, hi ? 0 : 8); c.fillText(hi ? `${year} से अब तक` : `PLAYING SINCE ${year}`, W / 2, 280); spacing(c, 0); c.restore(); }
        if (into > .5) { c.fillStyle = `rgba(255,236,200,${((into - .5) / .5 * .85).toFixed(2)})`; c.fillRect(0, 0, W, H); }
      },
      album(c, s, pt, t, P) {
        const k = kOf(P), card = P.card, hi = hiOf(P), n = yearsOf(card), y1 = yearNow(card), y0 = y1 - n;
        const then = coupleImage(P, 'wedding') || coupleImage(P), now = coupleImage(P);
        const cam = camAt(pt, [[0, { x: 540, y: 640, z: 1.12 }], [3.4, { x: 540, y: 660, z: 1.05 }], [5.4, { x: 540, y: 1740, z: 1.05 }], [s.d, { x: 540, y: 1760, z: 1.0 }]]);
        c.save(); camera(c, cam);
        c.drawImage(wallArt(k), 0, 0, W, 2400);
        // a wall lamp over each frame
        for (const y of [150, 1250]) { glow(c, 540, y + 40, 260, 'rgba(255,214,150,.5)'); c.fillStyle = goldBevel(c, 470, y, 610, y + 40); rrect(c, 470, y, 140, 34, 14); c.fill(); }
        const sep = 1 - ease((pt - 1) / 2);
        ovalFrame(c, 540, 660, 560, 720); photo(c, k, then, 540, 660, 560, 720, t, sep, 'then');
        ovalFrame(c, 540, 1760, 560, 720); photo(c, k, now, 540, 1760, 560, 720, t, 0, 'now');
        const lab = (y, big, small, a) => { if (a < .01) return; c.save(); c.globalAlpha = a; c.fillStyle = 'rgba(20,6,8,.65)'; rrect(c, 290, y - 60, 500, 140, 70); c.fill(); foil(c, big, 540, y - 6, { font: '72px "Cinzel"', t, spacing: 8 }); c.fillStyle = '#ffe8c0'; c.font = hi ? '34px "Tiro Devanagari Hindi"' : 'italic 38px "Cormorant Garamond"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(small, 540, y + 50); c.restore(); };
        lab(1130, String(y0), hi ? 'जहाँ से सब शुरू हुआ' : 'where it all began', ease((pt - 1.6) / .8));
        lab(2230, String(y1), hi ? 'आज भी, साथ-साथ' : 'still us, still in love', ease((pt - 5.4) / .8));
        c.restore();
        // a film-strip glow and dust in the projector light
        K.motes(c, t, 16, 'rgba(255,230,190,A)', 12, 6);
        if (pt > s.d - .5) { c.fillStyle = `rgba(255,236,200,${((pt - (s.d - .5)) / .5 * .8).toFixed(2)})`; c.fillRect(0, 0, W, H); }
      },
      years(c, s, pt, t, P) {
        const k = kOf(P), card = P.card, hi = hiOf(P), n = yearsOf(card);
        c.drawImage(K.velvet(k, '#3a0a16'), 0, 0, W, H);
        rays(c, 540, 760, t, { n: 30, r: 1200, col: '255,214,140', a: .16, spin: .04 });
        glow(c, 540, 760, 520, 'rgba(255,200,120,.35)');
        // the number counts up in foil, landing with a burst
        const u = ease3(clamp((pt - .2) / 2.2)), num = Math.max(1, Math.round(u * n)), land = pt - 2.4;
        const sc = land > 0 ? 1 + .12 * Math.exp(-land * 4) * Math.sin(land * 14) : .9 + .1 * u;
        c.save(); c.translate(540, 760); c.scale(sc, sc); foil(c, String(num), 0, 0, { font: `700 ${num > 9 ? 470 : 520}px "Cinzel Decorative"`, t: land > 0 ? land + 3.5 : null }); c.restore();
        if (land > 0 && land < 1.4) K.burst(c, 540, 760, land / 1.4, '255,214,140', 40, 420);
        c.save(); c.globalAlpha = ease((pt - 2.4) / .8);
        c.fillStyle = '#ffe8c0'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = hi ? '60px "Tiro Devanagari Hindi"' : '46px "Cinzel"'; spacing(c, hi ? 0 : 12);
        c.fillText(hi ? 'साल साथ-साथ' : 'YEARS OF TOGETHERNESS', 540, 1100); spacing(c, 0);
        const jb = jubilee(n, hi); if (jb) foil(c, jb, 540, 1190, { font: hi ? '64px "Amita"' : '84px "Great Vibes"', t });
        c.restore();
        const two = clean(card.host2), name = two ? `${clean(card.host1)} & ${clean(card.host2)}` : clean(card.host1);
        c.save(); c.globalAlpha = ease((pt - 3) / .9) * (1 - ease((pt - (s.d - .5)) / .5));
        let fs = 120; c.font = `${fs}px "Great Vibes"`; while (c.measureText(name).width > 960 && fs > 60) { fs -= 4; c.font = `${fs}px "Great Vibes"`; }
        foil(c, name, 540, 1420, { font: `${fs}px "Great Vibes"`, t });
        const when = dateRange(card, hi); if (when) { c.fillStyle = '#fff2dc'; c.font = hi ? '42px "Tiro Devanagari Hindi"' : '38px "Cinzel"'; c.textAlign = 'center'; c.textBaseline = 'middle'; spacing(c, hi ? 0 : 6); c.fillText(hi ? when : when.toUpperCase(), 540, 1550); spacing(c, 0); }
        c.restore();
        K.sparks(c, t, 14, '#ffe6a0', 3);
      },
      letter(c, s, pt, t, P) {
        const k = kOf(P), card = P.card;
        c.drawImage(tableArt(k, card), 0, 0, W, H); disc(c, k, card, yearNow(card) - yearsOf(card), DISC.x, DISC.y, DISC.r, t * 3.5); tonearm(c, .62);
        c.fillStyle = 'rgba(10,4,0,.5)'; c.fillRect(0, 0, W, H);
        // the envelope slides in, its seal lifts, the letter rises out and unfolds
        const inE = ease3(pt / .8), op = ease3((pt - .7) / .6), rise = ease3((pt - 1.2) / .9), unf = ease3((pt - 1.9) / .8), away = ease3((pt - 1.9) / .8);
        const ex = 90, ey = lerp(2100, 1150, inE) + away * 900;
        if (away < 1) {
          c.drawImage(envelopeArt(k, false), ex, ey, 900, 600);
          if (op > .5) flap(c, ex, ey, 900, op);
          const ph = 1100 * (unf > 0 ? lerp(.33, 1, unf) : .33), py = lerp(ey + 60, ey - 520, rise);
          if (rise > 0 && unf <= 0) c.drawImage(paperArt(k), 0, 0, 820 * k, 367 * k, 130, py, 820, 367);
          c.drawImage(envelopeArt(k, true), ex, ey, 900, 600);
          if (op <= .5) flap(c, ex, ey, 900, op);
        }
        if (unf > 0) {
          const ph = 1100 * lerp(.33, 1, unf), top = lerp(ey - 520, 400, unf);
          c.save(); c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(146, top + 20, 820, ph); c.restore();
          c.drawImage(paperArt(k), 130, top, 820, ph);
          if (unf < 1) { c.fillStyle = `rgba(80,50,20,${(.3 * (1 - unf)).toFixed(2)})`; c.fillRect(130, top + ph * .33, 820, 4); }
        }
        // the invitation on the letter
        s.items = s.items || K.lines({ k: 'invite', reel: true }, card, P.opt);
        const L = P.shotLook('roses');
        if (pt > 2.5) K.words(c, P, s.items, { zone: [480, 1430, 680], L, p: pt - 2.5, d: s.d - 2.5, t });
      },
      track(c, s, pt, t, P) {
        const k = kOf(P), card = P.card, year = yearNow(card) - yearsOf(card);
        const z = 1.05 - .05 * ease3(pt / s.d);
        c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2);
        c.drawImage(wallArt(k), 0, -200, W, 2400);
        // a shelf of records behind, and the turntable spinning in front
        const sh = art('vy-shelf', W, 420, k, g => { const R = rng(14); g.fillStyle = '#2a1008'; g.fillRect(0, 300, W, 120); g.fillStyle = goldBevel(g, 0, 296, W, 310); g.fillRect(0, 296, W, 10);
          let x = 20; while (x < W - 20) { const w = 18 + R() * 16, h = 200 + R() * 90; g.fillStyle = ['#7a1a2a', '#e9d8b4', '#1a2a4a', '#c9952e', '#2a4a3a', '#5a2a5a'][Math.floor(R() * 6)]; g.fillRect(x, 296 - h, w, h); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(x + 3, 296 - h + 8, w - 6, 4); x += w + 3; } });
        c.drawImage(sh, 0, 1220, W, 420);
        c.restore();
        const by = 1760 + (1 - ease3(pt / 1.2)) * 140;
        c.save(); c.translate(540, by); c.scale(1, .42);
        c.fillStyle = '#4a2410'; c.beginPath(); c.arc(0, 0, 470, 0, TAU); c.fill();
        disc(c, k, card, year, 0, 0, 430, pt * 3.5 + (s.i || 0));
        c.restore();
        notes(c, t, 540, 1600, 4);
      },
      ballroom(c, s, pt, t, P) {
        const k = kOf(P), z = 1.05 - .05 * ease3(pt / s.d);
        const bg = art('vy-ball', W, H, k, g => {
          const R = rng(30);
          const gg = g.createLinearGradient(0, 0, 0, H); gg.addColorStop(0, '#1a0a1e'); gg.addColorStop(.6, '#3a1428'); gg.addColorStop(1, '#120610'); g.fillStyle = gg; g.fillRect(0, 0, W, H);
          for (let i = 0; i < 7; i++) { const x = 80 + i * 155; g.fillStyle = 'rgba(255,214,150,.06)'; g.fillRect(x - 40, 0, 80, 1500); }
          // drapes and strings of lights, a polished floor
          for (const d of [-1, 1]) { g.save(); if (d > 0) { g.translate(W, 0); g.scale(-1, 1); } const dg = g.createLinearGradient(0, 0, 240, 0); for (let i = 0; i <= 8; i++) dg.addColorStop(i / 8, i % 2 ? '#4a0a1e' : '#8a1a34'); g.fillStyle = dg; g.beginPath(); g.moveTo(0, 0); g.lineTo(260, 0); g.quadraticCurveTo(150, 700, 40, 1500); g.lineTo(0, 1500); g.fill(); g.restore(); }
          const fl = g.createLinearGradient(0, 1450, 0, H); fl.addColorStop(0, '#5a2a1a'); fl.addColorStop(1, '#1a0806'); g.fillStyle = fl; g.fillRect(0, 1450, W, H - 1450);
          g.strokeStyle = 'rgba(255,214,150,.12)'; g.lineWidth = 2; for (let i = -10; i <= 10; i++) { g.beginPath(); g.moveTo(540 + i * 40, 1450); g.lineTo(540 + i * 160, H); g.stroke(); }
        });
        c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2);
        c.drawImage(bg, 0, 0, W, H);
        // a chandelier glinting, fairy lights, a spotlight on the couple
        for (let r = 0; r < 3; r++) for (let i = 0; i <= 18; i++) { const u = i / 18, x = lerp(120, 960, u), y = 40 + r * 70 + Math.sin(u * Math.PI) * 120, on = .5 + .5 * Math.sin(t * 3 + i + r * 2); glow(c, x, y, 20, `rgba(255,220,150,${(.35 + on * .45).toFixed(2)})`); }
        c.save(); c.globalAlpha = .5; const sp = c.createLinearGradient(540, 0, 540, H); sp.addColorStop(0, 'rgba(255,236,200,.0)'); sp.addColorStop(1, 'rgba(255,236,200,.35)'); c.fillStyle = sp; c.beginPath(); c.moveTo(470, 0); c.lineTo(610, 0); c.lineTo(900, H); c.lineTo(180, H); c.fill(); c.restore();
        c.restore();
        const img = coupleImage(P);
        if (img) { c.save(); c.globalAlpha = ease((pt - .2) / 1); cutout(c, img, W / 2, 1900, 760, 'full', P.shotLook('ballroom'), t); c.restore(); }
        K.confetti(c, t, 30, ['#f2d27a', '#ffffff', '#e0405a'], 4);
      },
      roses(c, s, pt, t, P) {
        const k = kOf(P), card = P.card, n = yearsOf(card);
        const bg = art(`vy-roses-${n}`, W, H, k, g => {
          const gg = g.createRadialGradient(540, 900, 80, 540, 960, 1200); gg.addColorStop(0, '#fffaf2'); gg.addColorStop(1, '#f0d8c8'); g.fillStyle = gg; g.fillRect(0, 0, W, H);
          g.save(); g.globalAlpha = .1; g.fillStyle = '#b8862b'; g.font = '700 900px "Cinzel Decorative"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), 540, 940); g.restore();
          K.goldFrame(g, 40, 40, W - 80, H - 80);
          const R = rng(2);
          for (const [cx, cy, dx, dy] of [[0, 0, 1, 1], [W, 0, -1, 1]]) { for (let i = 0; i < 16; i++) leaf(g, cx + dx * R() * 260, cy + dy * R() * 260, 100, 30, R() * TAU, R() > .5 ? '#5a7a4a' : '#8aa070'); [[60, 60, 80], [190, 50, 60], [60, 200, 64], [170, 170, 52], [290, 90, 44]].forEach(([x, y, r], i) => rose(g, cx + dx * x, cy + dy * y, r, i % 2 ? '#f8b0c0' : '#e0405a', i % 2 ? '#c04060' : '#7a0a1e', R() * 3)); }
          K.florals(g, [['#f8b0c0', '#c04060'], ['#e0405a', '#7a0a1e'], ['#ffe0e6', '#d07090']], 0);
        });
        c.drawImage(bg, 0, 0, W, H);
      }
    }
  };
})(Cinema.kit));

} catch (e) { if (typeof console !== 'undefined') console.warn('Cinema: story-vinyl.js', e); }
