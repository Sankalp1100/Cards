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
