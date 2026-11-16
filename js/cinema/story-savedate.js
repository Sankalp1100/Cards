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
    c.strokeStyle = '#b8862b'; c.lineWidth = 4; c.beginPath(); c.moveTo(cx, 0); c.lineTo(cx, 70); c.stroke();
    const g = c.createLinearGradient(0, 70, 0, 250); g.addColorStop(0, '#f6dfa0'); g.addColorStop(.6, '#d6a957'); g.addColorStop(1, '#a8752a');
    c.fillStyle = g; c.beginPath(); c.moveTo(cx - 215, 250); c.bezierCurveTo(cx - 200, 110, cx - 80, 72, cx, 70); c.bezierCurveTo(cx + 80, 72, cx + 200, 110, cx + 215, 250); c.closePath(); c.fill();
    c.save(); c.clip(); c.strokeStyle = 'rgba(255,240,200,.55)'; c.lineWidth = 2;
    for (let i = -12; i <= 12; i++) { c.beginPath(); c.moveTo(cx + i * 18, 60); c.lineTo(cx + i * 36, 260); c.stroke(); }
    for (let y = 100; y < 260; y += 26) { c.beginPath(); c.ellipse(cx, y + 60, 260, 90, 0, Math.PI * 1.05, Math.PI * 1.95); c.stroke(); }
    c.restore();
    blossom(c, cx, 74, 22, '#f5a8ba', '#fff', 0, 6);
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
    c.fillStyle = col; c.fillText(s, x, y);
    c.restore();
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
    if (card && card.sampleOf) return new Date(2026, 11, 3, 19, 0);
    const all = days(card || {}).filter(d => d.date);
    const wed = all.find(d => d.events.some(e => /wedding|vivah|shaadi|shadi|phere|lagan|विवाह|शादी|फेरे/i.test(e.name)));
    if (wed) return wed.date;
    if (typeof Core !== 'undefined' && card && card.date) { const d = Core.parseDate(card.date); if (d) return d; }
    return all.length ? all[0].date : new Date(2026, 11, 3, 19, 0);
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
    c.translate(0, (1 - a) * 140);
    c.drawImage(img, 540 - w / 2, foot - h, w, h);
    c.restore();
  }

  function calendarShot(c, s, pt, t, P) {
    const hi = P.opt.lang === 'hi', { date, G, target, stops } = setFor(s, P);
    const fade = clamp(pt / .9);
    backdrop(c, P, pt, t, true);
    // words
    say(c, hi ? 'शुभ तिथि याद रखें' : 'Save The Date', 540, 400, 'title', 78, RED, ease((pt - .5) / .5), 900, ease((pt - .5) / 1.1));
    say(c, hi ? 'हम विवाह बंधन में बंध रहे हैं' : 'We are getting married on', 540, 484, 'serif', 44, INK, ease((pt - 1.1) / .7));
    const ma = ease((pt - 1.5) / .8);
    c.save(); c.translate(540, 584); c.scale(.85 + .15 * ma, .85 + .15 * ma);
    say(c, `${(hi ? HI_MONTHS : MONTH_EN)[G.m]} ${G.y}`.toUpperCase(), 0, 0, 'title', 88, WINE, ma, 760);
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
    petals(c, t, 26, ['#f4a6b8', '#e9768f', '#ffd3dc', '#c8435f'], 41, 1);
    if (fade < 1) { c.fillStyle = `rgba(253,246,236,${(1 - fade) * .85})`; c.fillRect(0, 0, W, H); }
  }

  function groomBride(P) {
    const c = P.card || {};
    return { groom: clean(c.host2) || 'Shivam', bride: clean(c.host1) || 'Anaya Gupta' };
  }
  function coupleLine(P, hi) { const { groom, bride } = groomBride(P); return `${groom.split(' ')[0]} ${hi ? 'संग' : '&'} ${bride.split(' ')[0]}`; }

  function namesShot(c, s, pt, t, P) {
    const hi = P.opt.lang === 'hi', { date } = setFor(s, P), { groom, bride } = groomBride(P);
    backdrop(c, P, pt, t, false);
    const a1 = ease((pt - .3) / .8), a2 = ease((pt - .9) / .7), a3 = ease((pt - 1.4) / .8), a4 = ease((pt - 2.1) / .8);
    say(c, hi ? '॥ शुभ विवाह ॥' : 'Together with their families', 540, 430, hi ? 'title' : 'ital', hi ? 52 : 46, INK2, a1);
    c.save(); c.translate(0, (1 - a2) * 30);
    say(c, groom, 540, 560, 'script', 132, WINE, a2, 900);
    c.restore();
    say(c, hi ? 'संग' : 'weds', 540, 668, 'ital', 56, RED, a3);
    c.save(); c.translate(0, (1 - a3) * 30);
    say(c, bride, 540, 780, 'script', 132, WINE, a3, 900);
    c.restore();
    // a fine divider with a heart, then the day and the place
    c.save(); c.globalAlpha = a4; c.strokeStyle = 'rgba(184,134,43,.9)'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(540 - 260 * a4, 878); c.lineTo(520, 878); c.moveTo(560, 878); c.lineTo(540 + 260 * a4, 878); c.stroke();
    heartPath(c, 540, 882, 14); c.fillStyle = '#b3243a'; c.fill(); c.restore();
    const dd = date.getDate(), mon = (hi ? HI_MONTHS : MONTH_EN)[date.getMonth()];
    say(c, hi ? `${HI_DAY[date.getDay()]}, ${dd} ${mon} ${date.getFullYear()}` : `${EN_DAY[date.getDay()]}, ${dd} ${mon} ${date.getFullYear()}`, 540, 948, 'title', 44, INK, a4, 900);
    const venue = clean((P.card || {}).venue);
    if (venue) say(c, venue, 540, 1010, 'serif', 36, INK2, ease((pt - 2.5) / .8), 860);
    drawCouple(c, P, pt, t, 1, 700, 1900);
    corners(c, P, pt, t, false);
    petals(c, t + 20, 30, ['#f4a6b8', '#e9768f', '#ffd3dc', '#c8435f'], 43, 1);
  }

  return {
    id: 'story-savedate', order: 3, occasion: 'wedding', tune: 'romantic', thumb: 8.6,
    name: 'Save The Date', note: 'A jhoomar of roses swings over a cream page as a little heart hops across the calendar and lands on the wedding day, then the couple’s names in script',
    names: ['Anaya Gupta', 'Shivam'], ganesha: 'ganesha-01',
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
