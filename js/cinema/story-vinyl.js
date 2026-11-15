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
