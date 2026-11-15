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
