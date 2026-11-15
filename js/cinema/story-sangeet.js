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
