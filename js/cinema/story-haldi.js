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
