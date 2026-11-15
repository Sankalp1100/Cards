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
