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
