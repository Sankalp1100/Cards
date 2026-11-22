// The Grand Celebration: a palace gate at night under a thick arch of roses and marigolds, a glowing marquee that
// welcomes you to the wedding, children dancing before the carved doors as they swing open on a golden hall; the
// families on a soft white stage before a glowing board with the invitation, bowing in namaste; then one painted
// set per function (Mehendi in sage drapes and lanterns, an evening by the pool under chandeliers, Haldi in sunny
// yellow with marigolds thrown, the Wedding before an illuminated palace with fireworks), and RSVP on the white stage.
Cinema.register((K => {
  const { W, H, TAU, rng, clamp, ease, ease3, lerp, mix, glow, rrect, leaf, rose, marigold, blossom, diya, flame, lampBody, goldBevel, chhatri,
    clean, days, parents, coupleImage, petals, motes, bokeh, finish, HI, MONTHS } = K;

  const kOf = P => Math.min(1.25, Math.max(.5, P.k));
  const DEV = /[ऀ-ॿ]/;

  // ---------- library pictures (the couple library: kids, families, guests) ----------
  const LIB = {};
  function lib(id) {
    if (typeof Image === 'undefined' || (typeof location !== 'undefined' && location.protocol === 'file:')) return null;
    let im = LIB[id];
    if (!im) { im = new Image(); im.src = `img/couples/cut/${id}.png`; LIB[id] = im; }
    return im.complete && im.naturalWidth ? im : null;
  }
  const KIDS = ['kid-02', 'kid-01'], FAMS = ['family-01', 'family-02'];
  const FRIENDS = {
    mehendi: ['mehendi-02', 'sangeet-03', 'mehendi-03', 'sangeet-02', 'mehendi-01', 'sangeet-01'],
    haldi: ['haldi-02', 'haldi-03', 'haldi-04', 'haldi-01'],
    night: ['reception-02', 'sangeet-01', 'reception-03', 'engagement-02', 'reception-05', 'sangeet-02'],
    wedding: ['wedding-03', 'wedding-06', 'wedding-08', 'wedding-10', 'wedding-12', 'wedding-05']
  };
  [...KIDS, ...FAMS, ...Object.values(FRIENDS).flat()].forEach(lib);

  // small still things (boards, doors, guests) are kept here so the kit's big-art cache never churns
  const memo = new Map();
  function still(key, w, h, k, draw) {
    const id = `${key}@${k}`;
    if (memo.has(id)) return memo.get(id);
    const cv = K.canvasOf(Math.max(1, Math.round(w * k)), Math.max(1, Math.round(h * k))), c = cv.getContext('2d');
    c.scale(k, k); draw(c);
    memo.set(id, cv);
    if (memo.size > 60) memo.delete(memo.keys().next().value);
    return cv;
  }

  // ---------- lettering ----------
  function fontFor(f, z, s) {
    if (DEV.test(s)) return f === 'script' || f === 'vibes' ? `700 ${Math.round(z * .78)}px "Amita"` : f === 'title' || f === 'marquee' ? `${Math.round(z * .86)}px "Yatra One"` : `${Math.round(z * .9)}px "Tiro Devanagari Hindi"`;
    return f === 'script' ? `700 ${z}px "Dancing Script"` : f === 'vibes' ? `${z}px "Great Vibes"` : f === 'title' ? `700 ${z}px "Cinzel"` : f === 'marquee' ? `700 ${z}px "Cinzel"`
      : f === 'caps' ? `${z}px "Marcellus"` : f === 'ital' ? `italic ${z}px "Cormorant Garamond"` : `${z}px "Gilda Display"`;
  }
  function setFont(c, l, maxW) {
    let z = l.z; const ls = DEV.test(l.s) ? 0 : (l.ls || 0);
    for (let i = 0; i < 30; i++) { c.font = fontFor(l.f, z, l.s); K.spacing(c, ls * z / l.z); if (c.measureText(l.s).width <= maxW || z < 14) break; z *= .94; }
    return z;
  }
  function say(c, l, x, y, a = 1) {
    if (!l || a <= .01) return;
    c.save(); c.globalAlpha *= a;
    if (l.div) {
      const w = l.w || 200; c.strokeStyle = l.col || '#b8862b'; c.fillStyle = l.col || '#b8862b'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(x - w / 2, y); c.lineTo(x - 14, y); c.moveTo(x + 14, y); c.lineTo(x + w / 2, y); c.stroke();
      c.beginPath(); c.moveTo(x, y - 8); c.lineTo(x + 8, y); c.lineTo(x, y + 8); c.lineTo(x - 8, y); c.fill();
      c.restore(); return;
    }
    if (!clean(l.s)) { c.restore(); return; }
    setFont(c, l, l.maxW || 700);
    c.textAlign = 'center'; c.textBaseline = 'middle';
    if (l.glow) { c.shadowColor = l.glow; c.shadowBlur = 14; }
    c.fillStyle = l.col || '#4a2a14'; c.fillText(l.s, x, y);
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
  // lines laid out from y0 down (each { s, f, z, col, gap, wrap } or { div: true }); returns them with their y
  function flow(specs, y0, maxW = 600) {
    const out = []; let y = y0;
    specs.filter(l => l && (l.div || clean(l.s))).forEach(l => {
      if (l.div) { out.push({ ...l, y: y + 10 }); y += 20 + (l.gap || 0); return; }
      const parts = l.wrap ? wrap(clean(l.s), l, maxW, l.wrap) : [clean(l.s)];
      parts.forEach((s, i) => { const h = l.z * (DEV.test(s) ? 1.32 : (l.f === 'script' || l.f === 'vibes' ? 1.05 : 1.16)); out.push({ ...l, s, y: y + h / 2, maxW }); y += h + (i === parts.length - 1 ? (l.gap || 0) : 2); });
    });
    out.bottom = y;
    return out;
  }
  const sayAll = (c, lines, p, at = .3, gap = .16, cx = W / 2) => lines.forEach((l, i) => { const a = ease((p - at - i * gap) / .55); say(c, l, cx, l.y + (1 - a) * 16, a); });

  // ---------- the card's words ----------
  const surname = s => { const w = clean(s).replace(/\b(mr|mrs|smt|shri|sri|dr|late|sh)\b\.?/gi, ' ').replace(/[&.,]/g, ' ').trim().split(/\s+/).filter(Boolean); return w.length ? w[w.length - 1] : ''; };
  const famsOf = card => (card.families || []).filter(f => f && clean(f.parents));
  const HIFN = [[/haldi|pithi|ubtan/i, 'हल्दी'], [/mehe?n?d/i, 'मेहँदी'], [/sangeet/i, 'संगीत संध्या'], [/sagan|shagun/i, 'शगुन'], [/cocktail/i, 'कॉकटेल संध्या'], [/dj|dance/i, 'नृत्य संध्या'],
    [/phera|vivah|wedding|shaadi/i, 'शुभ विवाह'], [/varmala|jaimala/i, 'वरमाला'], [/baraat|barat/i, 'बारात'], [/ghud|ghod/i, 'घुड़चढ़ी'], [/reception/i, 'प्रीतिभोज'],
    [/dinner|bhoj/i, 'रात्रिभोज'], [/lunch/i, 'दोपहर भोज'], [/ring|engage|sagai/i, 'सगाई'], [/roka/i, 'रोका'], [/puja|pooja|ganesh/i, 'गणेश पूजन'], [/tilak/i, 'तिलक']];
  const hiName = n => (DEV.test(n) ? n : (HIFN.find(([re]) => re.test(n)) || [])[1]) || n;
  const KINDS = [['haldi', /haldi|pithi|ubtan|हल्दी|हलदी|पीठी|उबटन/i], ['mehendi', /mehe?n?d|मेहँदी|मेहंदी|मेंहदी/i],
    ['wedding', /phera|vivah|wedding|varmala|jaimala|mandap|shaadi|baraat|barat|फेरे|विवाह|शादी|वरमाला|जयमाला|मंडप|बारात/i]];
  const kindOf = (name, d) => (KINDS.find(([, re]) => re.test(name)) || [])[0] || (d && d.getHours() >= 7 && d.getHours() < 16 && /puja|pooja|lunch|brunch|tilak|chooda|chura|पूजा/i.test(name) ? 'haldi' : 'night');
  const dateLine = (d, hi) => d ? (hi ? `${d.getDate()} ${HI.months[d.getMonth()]} ${d.getFullYear()}` : `${d.getDate()} ${MONTHS[d.getMonth()].toUpperCase()} ${d.getFullYear()}`) : '';
  const timeLine = (time, hi) => time ? (hi ? `${time} से` : `${time} ONWARDS`) : '';

  // ---------- shapes ----------
  // a Mughal (ogee) arch: top-left x, y, size w × h; sh = how far down its sides start
  function ogee(c, x, y, w, h, sh) {
    c.moveTo(x, y + h); c.lineTo(x, y + sh);
    c.bezierCurveTo(x, y + sh * .42, x + w * .4, y + sh * .5, x + w * .5, y);
    c.bezierCurveTo(x + w * .6, y + sh * .5, x + w, y + sh * .42, x + w, y + sh);
    c.lineTo(x + w, y + h); c.closePath();
  }
  // points along the ogee's outline (for a frame of flowers)
  function ogeePts(x, y, w, h, sh, n) {
    const bz = (p0, p1, p2, p3, u) => { const v = 1 - u; return [v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0], v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1]]; };
    const pts = [];
    for (let i = 0; i <= n; i++) { const u = i / n; pts.push([x, lerp(y + h, y + sh, u)]); }
    for (let i = 1; i <= n; i++) pts.push(bz([x, y + sh], [x, y + sh * .42], [x + w * .4, y + sh * .5], [x + w * .5, y], i / n));
    for (let i = 1; i <= n; i++) pts.push(bz([x + w * .5, y], [x + w * .6, y + sh * .5], [x + w, y + sh * .42], [x + w, y + sh], i / n));
    for (let i = 1; i <= n; i++) { const u = i / n; pts.push([x + w, lerp(y + sh, y + h, u)]); }
    return pts;
  }
  // the cream arch board with a fine gold double line and a little gold crest (painted once per size)
  function archBoard(k, w, h, sh, tone = 'cream') {
    return still(`cel-board-${w}x${h}-${sh}-${tone}`, w + 80, h + 80, k, c => {
      c.translate(40, 40);
      c.save(); c.shadowColor = 'rgba(60,30,8,.4)'; c.shadowBlur = 34; c.shadowOffsetY = 14;
      const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, tone === 'cream' ? '#fdf8ee' : '#fffdf9'); g.addColorStop(1, tone === 'cream' ? '#f1e4cb' : '#f6efe4');
      c.fillStyle = g; c.beginPath(); ogee(c, 0, 0, w, h, sh); c.fill(); c.restore();
      const sg = c.createRadialGradient(w * .5, h * .3, 10, w * .5, h * .45, h * .7); sg.addColorStop(0, 'rgba(255,255,255,.55)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = sg; c.beginPath(); ogee(c, 0, 0, w, h, sh); c.fill();
      c.strokeStyle = goldBevel(c, 0, 0, w, h); c.lineWidth = 5; c.beginPath(); ogee(c, 0, 0, w, h, sh); c.stroke();
      c.lineWidth = 2.5; c.beginPath(); ogee(c, 20, 26, w - 40, h - 46, sh - 6); c.stroke();
      c.lineWidth = 1.2; c.beginPath(); ogee(c, 30, 40, w - 60, h - 70, sh - 10); c.stroke();
      // crest under the apex
      c.fillStyle = goldBevel(c, w / 2 - 40, 0, w / 2 + 40, 140);
      c.save(); c.translate(w / 2, sh * .62);
      for (const a of [-.9, -.45, 0, .45, .9]) { c.save(); c.rotate(a); c.beginPath(); c.ellipse(0, -18, 6, 18, 0, 0, TAU); c.fill(); c.restore(); }
      c.beginPath(); c.arc(0, 4, 7, 0, TAU); c.fill(); c.restore();
      // corner scrolls at the foot
      for (const [x, d] of [[44, 1], [w - 44, -1]]) { c.save(); c.translate(x, h - 44); c.scale(d, 1); c.lineWidth = 2; c.beginPath(); c.arc(14, -14, 14, Math.PI * .5, Math.PI * 2); c.stroke(); c.restore(); }
    });
  }
  // a cluster of roses with leaves (painted into art)
  function roses(c, R, cx, cy, rx, ry, n, cols, size = 34) {
    for (let i = 0; i < n * .9; i++) { const a = R() * TAU, d = Math.sqrt(R()); leaf(c, cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d, size * 1.6, size * .55, R() * TAU, R() > .5 ? '#5f7d4a' : '#86a06a', true); }
    const pts = [];
    for (let i = 0; i < n; i++) { const a = R() * TAU, d = Math.sqrt(R()); pts.push([cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d, size * (.7 + R() * .55)]); }
    pts.sort((p, q) => p[1] - q[1]).forEach(([x, y, r]) => { const [l, d] = cols[Math.floor(R() * cols.length)]; rose(c, x, y, r, l, d, R() * 3); });
  }
  const WHITE = ['#ffffff', '#e8dccd'], BLUSH = ['#fde3e3', '#e9a6ad'], PEACH = ['#ffe6cf', '#efb07e'], PINK = ['#ffd0da', '#df6f8c'], CREAMR = ['#fff6e6', '#e6cfa8'];
  // a string of fairy lights (painted)
  function fairy(c, R, n, x0, x1, y0, y1, r = 2.4) {
    for (let i = 0; i < n; i++) { const x = x0 + R() * (x1 - x0), y = y0 + R() * (y1 - y0), s = r * (.6 + R() * .8); glow(c, x, y, s * 5, 'rgba(255,214,140,.35)'); c.fillStyle = '#fff3cf'; c.beginPath(); c.arc(x, y, s, 0, TAU); c.fill(); }
  }
  // a marigold garland hanging straight down
  function garland(c, x, y0, y1, r = 11, hues = [30, 44]) { for (let y = y0, i = 0; y < y1; y += r * 1.55, i++) marigold(c, x + Math.sin(i * .7) * 1.5, y, r, hues[i % hues.length]); }
  // a scalloped marigold swag from x0 to x1
  function swag(c, x0, x1, y, sag, r = 12, hues = [30, 44], n = 3) {
    const step = (x1 - x0) / n;
    for (let j = 0; j < n; j++) for (let i = 0, m = Math.ceil(step / (r * 1.4)); i <= m; i++) { const u = i / m, x = x0 + step * (j + u); marigold(c, x, y + Math.sin(u * Math.PI) * sag, r, hues[(i + j) % hues.length]); }
  }
  // twinkles at fixed points (live, cheap)
  function twinkle(c, t, pts, col = '255,236,190', r = 16) {
    pts.forEach(([x, y], i) => { const a = .25 + .75 * Math.max(0, Math.sin(t * (1.6 + (i % 5) * .37) + i * 1.7)); glow(c, x, y, r * (.6 + a * .6), `rgba(${col},${(a * .7).toFixed(2)})`); });
  }
  const pts = (seed, n, x0, x1, y0, y1) => { const R = rng(seed), o = []; for (let i = 0; i < n; i++) o.push([x0 + R() * (x1 - x0), y0 + R() * (y1 - y0)]); return o; };

  // ---------- people with life: breathing, sway, a bow, a bob ----------
  // (cx, foot) where they stand, h their height. o: { flip, bow (0–1), dir (which way the bow leans), bob, sway, ph, a, sx (squash) }
  function person(c, img, cx, foot, h, t, o = {}) {
    if (!img) return;
    const w = h * img.naturalWidth / img.naturalHeight, ph = o.ph || 0, a = o.a == null ? 1 : o.a;
    if (a <= .01) return;
    c.save(); c.globalAlpha *= a;
    if (o.shadow !== false) { c.save(); c.translate(cx, foot); c.scale(1, .16); const g = c.createRadialGradient(0, 0, 0, 0, 0, w * .55); g.addColorStop(0, 'rgba(30,14,4,.4)'); g.addColorStop(1, 'rgba(30,14,4,0)'); c.fillStyle = g; c.fillRect(-w * .6, -w * .6, w * 1.2, w * 1.2); c.restore(); }
    const breathe = 1 + .012 * Math.sin(t * 1.7 + ph), bob = o.bob ? -Math.abs(Math.sin(t * (o.bobRate || 4) + ph)) * o.bob : 0;
    c.translate(cx, foot + bob); c.rotate((o.sway == null ? .012 : o.sway) * Math.sin(t * .9 + ph));
    const bow = o.bow || 0;
    if (bow) { c.transform(1, 0, -bow * .22 * (o.dir || 1), 1 - bow * .1, 0, 0); c.rotate(bow * .06 * (o.dir || 1)); }
    c.scale((o.flip ? -1 : 1) * (o.sx || 1), breathe);
    c.drawImage(img, -w / 2, -h, w, h);
    c.restore();
  }
  // a guest in the background: soft (out of focus) and toned to the scene's light (painted once)
  function guestArt(img, id, h, k, tint, soft) {
    const w = Math.round(h * img.naturalWidth / img.naturalHeight);
    return still(`cel-guest-${id}-${h}-${tint}-${soft}`, w, h, k, g => {
      const s = K.canvasOf(Math.max(8, Math.round(w * k / soft)), Math.max(8, Math.round(h * k / soft))), sc = s.getContext('2d');
      sc.drawImage(img, 0, 0, s.width, s.height);
      g.imageSmoothingEnabled = true; g.drawImage(s, 0, 0, w, h);
      if (tint) { g.globalCompositeOperation = 'source-atop'; g.fillStyle = tint; g.fillRect(0, 0, w, h); }
    });
  }
  // a row of guests: [[x, foot, h, flip], …]
  function guests(c, kind, row, t, k, tint, soft, motion = {}) {
    const ids = FRIENDS[kind];
    row.forEach(([x, foot, h, flip], i) => {
      const id = ids[i % ids.length], img = lib(id);
      if (!img) return;
      const cv = guestArt(img, id, h, k, tint, soft), w = cv.width / k, ph = i * 1.3;
      const bob = motion.bob ? -Math.abs(Math.sin(t * (motion.rate || 3) + ph)) * motion.bob : 0, sw = Math.sin(t * 1.1 + ph) * (motion.sway || .015);
      c.save(); c.translate(x, foot + bob); c.rotate(sw); c.scale(flip ? -1 : 1, 1 + .01 * Math.sin(t * 1.6 + ph)); c.drawImage(cv, -w / 2, -h, w, h); c.restore();
    });
  }

  // ======================================================================================================
  // 1. THE WELCOME GATE
  // ======================================================================================================
  const GATE = { l: 255, r: 825, top: 735, spring: 1020, bottom: 1634 };
  function openingPath(c, pad = 0) {
    const cx = (GATE.l + GATE.r) / 2, r = (GATE.r - GATE.l) / 2 + pad;
    c.moveTo(cx - r, GATE.bottom); c.lineTo(cx - r, GATE.spring); c.arc(cx, GATE.spring, r, Math.PI, 0); c.lineTo(cx + r, GATE.bottom); c.closePath();
  }
  function gateArt(k) {
    return K.art('cel-gate', W, H, k, c => {
      const R = rng(11);
      const wg = c.createLinearGradient(0, 0, 0, H); wg.addColorStop(0, '#2a0e04'); wg.addColorStop(.12, '#5a240a'); wg.addColorStop(.5, '#9a4614'); wg.addColorStop(.85, '#7a3410'); wg.addColorStop(1, '#4a1e08');
      c.fillStyle = wg; c.fillRect(0, 0, W, H);
      glow(c, 540, 900, 820, 'rgba(255,170,80,.32)');
      // carved stone panels over the wall
      for (let y = 600; y < 1600; y += 150) for (let x = -20; x < W; x += 130) { c.strokeStyle = 'rgba(255,200,130,.12)'; c.lineWidth = 2; c.strokeRect(x + 12, y + 12, 106, 126); c.strokeStyle = 'rgba(40,14,2,.25)'; c.strokeRect(x + 20, y + 20, 90, 110); }
      // pilasters with capitals
      for (const x of [55, 1025]) {
        const pg = c.createLinearGradient(x - 45, 0, x + 45, 0); pg.addColorStop(0, '#8a4416'); pg.addColorStop(.5, '#e6a25a'); pg.addColorStop(1, '#7a3a12');
        c.fillStyle = pg; c.fillRect(x - 45, 140, 90, 1500); c.fillStyle = 'rgba(60,20,4,.35)'; for (let y = 220; y < 1600; y += 120) c.fillRect(x - 30, y, 60, 4);
      }
      // the cornice and the dark eaves with trees and fairy lights above it
      c.fillStyle = '#1c0a03'; c.fillRect(0, 0, W, 140);
      for (const [cx, cy, rx] of [[60, 40, 260], [1020, 40, 260], [300, -20, 200], [780, -20, 200]]) { c.fillStyle = '#10200e'; for (let i = 0; i < 60; i++) { const a = R() * TAU, d = Math.sqrt(R()); leaf(c, cx + Math.cos(a) * rx * d, cy + Math.sin(a) * rx * .6 * d, 40, 16, R() * TAU, R() > .5 ? '#16301a' : '#1f3d22', false); } }
      fairy(c, R, 260, 0, W, 0, 150, 2.6);
      const cg = c.createLinearGradient(0, 130, 0, 175); cg.addColorStop(0, '#f2b868'); cg.addColorStop(1, '#7a3a12'); c.fillStyle = cg; c.fillRect(0, 132, W, 40);
      for (let x = 10; x < W; x += 36) { c.fillStyle = '#ffe9b8'; c.beginPath(); c.arc(x, 152, 4, 0, TAU); c.fill(); }
      swag(c, 0, W, 176, 36, 11, [30, 44, 18], 6);
      // marigold strings down the wall
      for (const x of [118, 185, 895, 962]) garland(c, x, 190, 760 + (x % 3) * 40, 10, [30, 44]);
      // the sign's dark backing (the sign itself is drawn live)
      // floor: warm stone tiles in perspective
      const fg = c.createLinearGradient(0, 1630, 0, H); fg.addColorStop(0, '#7a3e18'); fg.addColorStop(.3, '#b9773e'); fg.addColorStop(1, '#8a4a20'); c.fillStyle = fg; c.fillRect(0, 1630, W, H - 1630);
      c.strokeStyle = 'rgba(60,24,6,.3)'; c.lineWidth = 2;
      for (let i = -10; i <= 10; i++) { c.beginPath(); c.moveTo(540 + i * 40, 1630); c.lineTo(540 + i * 210, H); c.stroke(); }
      for (const y of [1660, 1700, 1752, 1815, 1890]) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
      glow(c, 540, 1640, 520, 'rgba(255,200,120,.3)');
      // the deep door reveal, then the opening itself is cut out (the hall and doors show through)
      c.fillStyle = '#2a1004'; c.beginPath(); openingPath(c, 26); c.fill();
      const rv = c.createLinearGradient(GATE.l - 26, 0, GATE.r + 26, 0); rv.addColorStop(0, 'rgba(255,190,110,.35)'); rv.addColorStop(.1, 'rgba(0,0,0,0)'); rv.addColorStop(.9, 'rgba(0,0,0,0)'); rv.addColorStop(1, 'rgba(255,190,110,.35)');
      c.fillStyle = rv; c.beginPath(); openingPath(c, 26); c.fill();
      c.globalCompositeOperation = 'destination-out'; c.fillStyle = '#000'; c.beginPath(); openingPath(c); c.fill(); c.globalCompositeOperation = 'source-over';
      // the thick arch of roses and marigolds round the doors
      const cx = 540, rr = 372, band = [];
      for (let i = 0; i <= 60; i++) { const a = Math.PI + i / 60 * Math.PI; band.push([cx + Math.cos(a) * rr, GATE.spring + Math.sin(a) * rr]); }
      for (let i = 0; i <= 22; i++) { band.push([cx - rr, GATE.spring + i * 28]); band.push([cx + rr, GATE.spring + i * 28]); }
      band.forEach(([x, y]) => { for (let j = 0; j < 3; j++) leaf(c, x + (R() - .5) * 130, y + (R() - .5) * 130, 56, 20, R() * TAU, R() > .5 ? '#3f6a32' : '#5d8a48'); });
      const spots = [];
      band.forEach(([x, y]) => { for (let j = 0; j < 4; j++) spots.push([x + (R() - .5) * 115, y + (R() - .5) * 115, 19 + R() * 12]); });
      spots.sort((p, q) => p[1] - q[1]).forEach(([x, y, r], i) => {
        const pick = R();
        if (pick < .14) marigold(c, x, y, r * .8, R() > .5 ? 34 : 44);
        else { const [l, d] = pick < .45 ? PINK : pick < .7 ? WHITE : pick < .88 ? BLUSH : PEACH; rose(c, x, y, r, l, d, R() * 3); }
      });
      // marigold swags across the top of the doorway
      swag(c, GATE.l + 10, GATE.r - 10, GATE.spring - 210, 70, 12, [30, 40, 18], 3);
      swag(c, GATE.l + 40, GATE.r - 40, GATE.spring - 150, 40, 10, [44, 30], 4);
      // tall brass lamp stands at either side
      for (const x of [190, 890]) { lampBody(c, x, 1720, 300); }
    });
  }
  function hallArt(k) {
    const w = GATE.r - GATE.l, h = GATE.bottom - GATE.top;
    return still('cel-hall', w, h, k, c => {
      const g = c.createRadialGradient(w / 2, h * .55, 20, w / 2, h * .55, h * .8); g.addColorStop(0, '#fff6d6'); g.addColorStop(.35, '#ffd27a'); g.addColorStop(1, '#b8651c');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      // the hall's far arch and its golden door
      c.fillStyle = 'rgba(190,120,40,.75)'; c.beginPath(); ogee(c, w * .2, h * .3, w * .6, h * .62, h * .16); c.fill();
      c.fillStyle = '#ffe9b0'; c.beginPath(); ogee(c, w * .26, h * .36, w * .48, h * .56, h * .13); c.fill();
      const dg = c.createLinearGradient(w * .32, 0, w * .68, 0); dg.addColorStop(0, '#c98a32'); dg.addColorStop(.5, '#f3c672'); dg.addColorStop(1, '#b8782a');
      c.fillStyle = dg; c.fillRect(w * .33, h * .55, w * .34, h * .37);
      c.strokeStyle = 'rgba(120,70,20,.5)'; c.lineWidth = 2; for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) c.strokeRect(w * .35 + j * w * .16, h * .57 + i * h * .085, w * .14, h * .07);
      swag(c, w * .22, w * .78, h * .42, 26, 9, [40, 48], 2);
      // chandelier glow and the polished floor
      glow(c, w / 2, h * .18, w * .5, 'rgba(255,250,220,.9)');
      for (let i = 0; i < 14; i++) { c.fillStyle = '#fff8e0'; c.beginPath(); c.arc(w / 2 + Math.cos(i / 14 * TAU) * 60, h * .18 + Math.sin(i / 14 * TAU) * 16, 5, 0, TAU); c.fill(); }
      const fl = c.createLinearGradient(0, h * .9, 0, h); fl.addColorStop(0, 'rgba(255,240,200,.0)'); fl.addColorStop(1, 'rgba(255,240,200,.8)'); c.fillStyle = fl; c.fillRect(0, h * .9, w, h * .1);
      for (const x of [w * .1, w * .9]) { c.fillStyle = 'rgba(214,160,80,.5)'; c.fillRect(x - 16, h * .2, 32, h * .8); }
    });
  }
  function doorArt(k) {
    const w = (GATE.r - GATE.l) / 2, h = GATE.bottom - GATE.top;
    return still('cel-door', w, h, k, c => {
      const g = c.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#5a2a10'); g.addColorStop(.5, '#9a5a2a'); g.addColorStop(1, '#5e2c10');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      const cols = 3, rows = 9, px = 22, pw = (w - px * 2) / cols, phh = (h - 60) / rows;
      for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
        const x = px + j * pw + 5, y = 40 + i * phh + 5, ww = pw - 10, hh = phh - 10;
        c.fillStyle = '#3a1806'; c.fillRect(x, y, ww, hh);
        const pg = c.createLinearGradient(x, y, x + ww, y + hh); pg.addColorStop(0, '#c07a3a'); pg.addColorStop(1, '#6a3412'); c.fillStyle = pg; c.fillRect(x + 5, y + 5, ww - 10, hh - 10);
        c.strokeStyle = 'rgba(255,190,120,.25)'; c.lineWidth = 2; c.beginPath(); c.arc(x + ww / 2, y + hh / 2, Math.min(ww, hh) * .28, 0, TAU); c.stroke();
        c.fillStyle = '#d9a650'; c.beginPath(); c.arc(x + ww / 2, y + hh / 2, 4, 0, TAU); c.fill();
      }
      c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(w - 8, 0, 8, h);
      c.fillStyle = '#c8923e'; for (const y of [h * .45, h * .55]) { c.beginPath(); c.arc(w - 30, y, 10, 0, TAU); c.fill(); }
    });
  }
  // one door leaf swung inwards by angle a on its hinge (side -1: the left leaf, hinge at the left)
  function doorLeaf(c, cv, a, side) {
    const w = (GATE.r - GATE.l) / 2, h = GATE.bottom - GATE.top, n = 22, cos = Math.cos(a), sin = Math.sin(a), vy = 1260;
    const hx = side < 0 ? GATE.l : GATE.r;
    for (let i = 0; i < n; i++) {
      const f0 = i / n, f1 = (i + 1) / n, sc = 1 - (f0 + f1) / 2 * sin * .2;
      const x0 = hx - side * w * cos * f0, x1 = hx - side * w * cos * f1;
      const y0 = vy + (GATE.top - vy) * sc, y1 = vy + (GATE.bottom - vy) * sc;
      const srcX = side < 0 ? f0 * cv.width : (1 - f1) * cv.width;
      c.drawImage(cv, srcX, 0, cv.width / n + .5, cv.height, Math.min(x0, x1), y0, Math.abs(x1 - x0) + .8, y1 - y0);
    }
    if (a > .01) { c.fillStyle = `rgba(20,6,0,${(sin * .45).toFixed(2)})`; const x1 = hx - side * w * cos; c.fillRect(Math.min(hx, x1), GATE.top, Math.abs(x1 - hx), GATE.bottom - GATE.top); }
  }
  function signArt(k, lines, key) {
    return still(`cel-sign-${key}`, 700, 320, k, c => {
      c.save(); c.shadowColor = 'rgba(255,190,90,.8)'; c.shadowBlur = 40; c.fillStyle = '#2a0a12'; rrect(c, 30, 30, 640, 260, 26); c.fill(); c.restore();
      c.fillStyle = goldBevel(c, 30, 30, 670, 290); rrect(c, 30, 30, 640, 260, 26); c.fill();
      const bg = c.createLinearGradient(0, 50, 0, 270); bg.addColorStop(0, '#3a1024'); bg.addColorStop(1, '#22060f'); c.fillStyle = bg; rrect(c, 46, 46, 608, 228, 18); c.fill();
      c.strokeStyle = 'rgba(240,200,120,.7)'; c.lineWidth = 2; rrect(c, 64, 64, 572, 192, 12); c.stroke();
      // bulbs round the edge
      for (let i = 0; i < 26; i++) { const x = 52 + i * 596 / 25; for (const y of [38, 282]) { glow(c, x, y, 14, 'rgba(255,220,150,.7)'); c.fillStyle = '#fff4d0'; c.beginPath(); c.arc(x, y, 5, 0, TAU); c.fill(); } }
      for (let i = 1; i < 9; i++) { const y = 38 + i * 244 / 9; for (const x of [38, 662]) { glow(c, x, y, 14, 'rgba(255,220,150,.7)'); c.fillStyle = '#fff4d0'; c.beginPath(); c.arc(x, y, 5, 0, TAU); c.fill(); } }
      const L = flow(lines, 86, 540);
      const off = (160 - (L.bottom - 86)) / 2;
      L.forEach(l => say(c, l, 350, l.y + off, 1));
    });
  }
  const SIGN_BULBS = (() => { const o = []; for (let i = 0; i < 26; i++) { const x = 52 + i * 596 / 25; o.push([x, 38], [x, 282]); } for (let i = 1; i < 9; i++) { const y = 38 + i * 244 / 9; o.push([38, y], [662, y]); } return o; })();

  function gateShot(c, s, pt, t, P) {
    const k = kOf(P), hi = P.opt.lang === 'hi', card = P.card;
    const a = ease3((pt - 3.0) / 1.9) * 1.32, push = clamp((pt - 4.1) / (s.d - 4.1));
    const z = lerp(1.0, 1.05, ease(pt / 4.1)) * lerp(1, 2.7, push ** 1.7), cx = 540, cy = lerp(1000, 1190, ease(push));
    c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-cx, -cy);
    // behind the doors: the golden hall (its light grows as they open)
    c.drawImage(hallArt(k), GATE.l, GATE.top, GATE.r - GATE.l, GATE.bottom - GATE.top);
    const door = doorArt(k);
    doorLeaf(c, door, a, -1); doorLeaf(c, door, a, 1);
    if (a > .02) { c.save(); c.globalAlpha = clamp(a / 1.32); glow(c, 540, 1300, 420, 'rgba(255,236,190,.55)'); c.restore(); }
    c.drawImage(gateArt(k), 0, 0, W, H);
    // the marquee
    const n1 = clean(card.host2), n2 = clean(card.host1), names = (n1 ? `${n1} & ${n2}` : n2).toUpperCase(), wed = /^(wedding)$/.test(card.type);
    const lines = hi ? [{ s: 'स्वागत है', f: 'serif', z: 34, col: '#ffe9c0', gap: 2 }, { s: wed ? 'शुभ विवाह उत्सव में' : `${HI.label[card.type] || 'उत्सव'} में`, f: 'serif', z: 34, col: '#ffe9c0', gap: 8 }, { s: names, f: 'marquee', z: 50, col: '#fff7e2', glow: 'rgba(255,200,120,.9)' }]
      : [{ s: 'WELCOME TO THE', f: 'title', z: 30, col: '#ffe9c0', ls: 2, gap: 4 }, { s: wed ? 'WEDDING CELEBRATIONS OF' : 'CELEBRATIONS OF', f: 'title', z: 30, col: '#ffe9c0', ls: 2, gap: 10 }, { s: names, f: 'marquee', z: 52, col: '#fff7e2', ls: 2, glow: 'rgba(255,200,120,.9)' }];
    glow(c, 540, 360, 520, 'rgba(255,180,90,.22)');
    c.drawImage(signArt(k, lines, `${names}-${hi}-${wed}`), 190, 200, 700, 320);
    c.save(); c.translate(190, 200);
    SIGN_BULBS.forEach(([x, y], i) => { if ((i + Math.floor(t * 6)) % 4 === 0) glow(c, x, y, 20, 'rgba(255,250,220,.9)'); });
    c.restore();
    // lamp flames, diyas, the fairy lights twinkling
    for (const x of [190, 890]) for (const dx of [-60, 0, 60]) flame(c, x + dx, 1720 - 300 * .86 - (dx ? -18 : 6), 30, t, x + dx);
    twinkle(c, t, GATE_TW, '255,236,190', 14);
    // the children: dancing in a row, then running in through the opened doors
    const row = [[115, 360], [260, 330], [395, 370], [540, 340], [685, 372], [820, 330], [965, 360]];
    row.forEach(([x, h], i) => {
      const img = lib(KIDS[i % 2]); if (!img) return;
      const go = ease((pt - 3.9 - Math.abs(i - 3) * .12) / 2.2), foot = lerp(1790 + (i % 2) * 18, 1600, go), sx = lerp(x, 540 + (x - 540) * .3, go), hh = h * lerp(1, .62, go);
      const spin = Math.cos(t * 3.2 + i * 1.9);
      person(c, img, sx, foot, hh, t, { flip: i % 2 === 1, bob: 34 * (1 - go * .5), bobRate: 5.2 + (i % 3) * .6, ph: i * 1.1, sway: .12, sx: .82 + .18 * Math.abs(spin), a: 1 - ease((go - .78) / .2) });
    });
    for (const x of [60, 330, 750, 1020]) diya(c, x, 1860, 34, t);
    c.restore();
    // light floods out of the hall as the camera goes through
    if (push > 0) { c.fillStyle = `rgba(255,246,226,${(push ** 2.4 * .92).toFixed(3)})`; c.fillRect(0, 0, W, H); }
    petals(c, t, 10, ['#ff9a3c', '#ffd166', '#f7a1b5'], 61, .9);
    motes(c, t, 14, 'rgba(255,214,140,A)', 7);
    vignette(c, k, false); finish(c, t, false);
  }
  const GATE_TW = pts(5, 34, 0, W, 10, 150).concat(pts(6, 10, 230, 850, 160, 520));

  // ======================================================================================================
  // 2 & 7. THE WHITE STAGE (the families' welcome, and RSVP)
  // ======================================================================================================
  const BOARD = { x: 240, y: 170, w: 600, h: 1150 };
  function stageArt(k) {
    return K.art('cel-stage', W, H, k, c => {
      const R = rng(23);
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#f4eee6'); g.addColorStop(.7, '#efe6da'); g.addColorStop(1, '#e8ddce'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      glow(c, 540, 300, 900, 'rgba(255,255,252,.75)');
      for (const x of [150, 890]) { const pg = c.createLinearGradient(x, 0, x + 60, 0); pg.addColorStop(0, '#e6dccf'); pg.addColorStop(.5, '#fbf8f3'); pg.addColorStop(1, '#ddd1c2'); c.fillStyle = pg; c.fillRect(x, 0, 60, 1500); }
      // the stage floor, glossy, with the board's light on it
      const fg = c.createLinearGradient(0, 1470, 0, H); fg.addColorStop(0, '#e2d6c6'); fg.addColorStop(.06, '#f7f2ea'); fg.addColorStop(1, '#efe6d9'); c.fillStyle = fg; c.fillRect(0, 1470, W, H - 1470);
      glow(c, 540, 1560, 520, 'rgba(255,236,200,.6)');
      c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(0, 1470, W, 3);
      // the glowing board
      const B = BOARD;
      c.save(); c.shadowColor = 'rgba(255,206,130,.95)'; c.shadowBlur = 70; c.strokeStyle = '#fff2d2'; c.lineWidth = 14; c.strokeRect(B.x, B.y, B.w, B.h); c.restore();
      c.save(); c.shadowColor = 'rgba(255,214,150,.9)'; c.shadowBlur = 24; c.strokeStyle = '#fffaf0'; c.lineWidth = 6; c.strokeRect(B.x, B.y, B.w, B.h); c.restore();
      const bg = c.createLinearGradient(0, B.y, 0, B.y + B.h); bg.addColorStop(0, '#fffdf9'); bg.addColorStop(1, '#f6efe5'); c.fillStyle = bg; c.fillRect(B.x + 8, B.y + 8, B.w - 16, B.h - 16);
      const ig = c.createRadialGradient(540, 560, 40, 540, 700, 700); ig.addColorStop(0, 'rgba(255,255,255,.9)'); ig.addColorStop(1, 'rgba(240,226,206,.35)'); c.fillStyle = ig; c.fillRect(B.x + 8, B.y + 8, B.w - 16, B.h - 16);
      c.strokeStyle = 'rgba(196,160,110,.55)'; c.lineWidth = 2; c.strokeRect(B.x + 30, B.y + 30, B.w - 60, B.h - 60);
      // white and peach roses down both sides
      roses(c, R, 70, 80, 170, 200, 38, [WHITE, WHITE, BLUSH, PEACH, CREAMR], 36);
      roses(c, R, 95, 380, 140, 190, 30, [WHITE, BLUSH, PEACH, WHITE], 34);
      roses(c, R, 60, 640, 110, 150, 18, [WHITE, PEACH, CREAMR], 30);
      roses(c, R, 1010, 230, 150, 210, 34, [WHITE, WHITE, BLUSH, PEACH, CREAMR], 36);
      roses(c, R, 1000, 520, 130, 170, 24, [WHITE, BLUSH, PEACH], 32);
      roses(c, R, 40, 1640, 150, 110, 20, [WHITE, BLUSH, PEACH], 30);
      roses(c, R, 1040, 1660, 150, 110, 20, [WHITE, PEACH, BLUSH], 30);
    });
  }
  function stageLines(P, rsvp) {
    const card = P.card, hi = P.opt.lang === 'hi', fams = famsOf(card);
    if (rsvp) {
      const list = fams.map(f => surname(f.parents)).filter(Boolean).slice(0, 4).map(n => hi ? `${n} परिवार` : `${n} Family`);
      if (!list.length) list.push(clean(card.host2) ? `${clean(card.host2)} & ${clean(card.host1)}` : clean(card.host1));
      const ph = K.phoneText(card.rsvp);
      return flow([{ s: hi ? 'दर्शनाभिलाषी' : 'RSVP', f: 'script', z: hi ? 110 : 96, col: '#3d2a1c', gap: 34 },
        ...list.map(s => ({ s, f: 'script', z: list.length > 3 ? 54 : 62, col: '#4a3424', gap: list.length > 3 ? 26 : 40 })),
        ph ? { s: ph, f: 'caps', z: 34, col: '#8a6a44', ls: 3, gap: 0 } : null], BOARD.y + 120, 500);
    }
    const [p1, p2] = parents(card, P.opt.lang), two = !!clean(card.host2);
    const groomFam = fams.find(f => /groom|ladka|\bson\b|boy|dulha/i.test(f.side || '')) || fams[1] || fams[0], sn = groomFam ? surname(groomFam.parents) : '';
    const wed = card.type === 'wedding', label = (HI.label[card.type] || '');
    return flow([
      { s: sn ? (hi ? `${sn} परिवार` : `${sn} Family`) : (hi ? 'सपरिवार' : 'Together with our families'), f: 'script', z: sn ? 84 : 60, col: '#3d2a1c', gap: 22 },
      { s: hi ? 'आपको सादर आमन्त्रित करते हैं' : 'cordially invites you for', f: hi ? 'serif' : 'ital', z: 40, col: '#5a4634', gap: 0 },
      { s: hi ? (wed ? 'शुभ विवाह समारोह में' : `${label} में`) : (wed ? 'the wedding ceremony of' : `the ${card.type} celebrations of`), f: hi ? 'serif' : 'ital', z: 40, col: '#5a4634', gap: 56 },
      { s: two ? card.host2 : card.host1, f: 'script', z: 112, col: '#3d2a1c', gap: 14 },
      { s: two ? p2 && `(${p2})` : p1 && `(${p1})`, f: 'serif', z: 32, col: '#6a5440', wrap: 2, gap: two ? 52 : 0 },
      two ? { s: hi ? 'संग' : 'with', f: 'script', z: 70, col: '#3d2a1c', gap: 30 } : null,
      two ? { s: card.host1, f: 'script', z: 112, col: '#3d2a1c', gap: 14 } : null,
      two ? { s: p1 && `(${p1})`, f: 'serif', z: 32, col: '#6a5440', wrap: 2 } : null], BOARD.y + 150, 520);
  }
  function stageShot(c, s, pt, t, P, rsvp) {
    const k = kOf(P), intro = ease3(clamp(pt / 1.8)), z = lerp(1.3, 1.0, intro) + .07 * ease(clamp((pt - 1.8) / (s.d - 1.8)));
    c.save(); c.translate(W / 2, 900); c.scale(z, z); c.translate(-W / 2, -900 + lerp(-220, 0, intro));
    c.drawImage(stageArt(k), 0, 0, W, H);
    // a slow gleam down the board's glowing edge
    const gy = BOARD.y + ((t * 260) % (BOARD.h + 400)) - 200;
    for (const x of [BOARD.x, BOARD.x + BOARD.w]) glow(c, x, gy, 90, 'rgba(255,240,200,.55)');
    const L = s.lines || (s.lines = stageLines(P, rsvp));
    sayAll(c, L, pt, .5, .2);
    if (rsvp && s.tail) K.words(c, P, s.tail, { zone: [Math.max(L.bottom + 20, 1010), BOARD.y + BOARD.h - 40, 420], L: P.shotLook('rsvp'), p: pt - 1.6, enter: 'none' });
    // the families either side: namaste, a slow bow, and up again
    const bowAt = rsvp ? [1.4, 3.6] : [2.2, 4.5], bowOf = p => bowAt.reduce((m, b) => Math.max(m, Math.sin(clamp((p - b) / 1.6) * Math.PI)), 0);
    const ia = ease((pt - .2) / .8);
    [[FAMS[0], 130, 1, false], [FAMS[1], 955, -1, true]].forEach(([id, x, dir, flip], i) => {
      const img = lib(id); if (!img) return;
      const wq = ease3(clamp((pt - .2) / 1.6)), stepB = (1 - wq) > .02 ? Math.abs(Math.sin(pt * 8 + i)) * 14 * (1 - wq) : 0;
      person(c, img, x + (1 - wq) * -dir * 320, 1860 - stepB, 680, t, { flip, bow: bowOf(pt - i * .25) * 1.6, dir, ph: i * 2, a: ia, sway: .025 });
    });
    c.restore();
    petals(c, t, rsvp ? 22 : 10, ['#ffffff', '#ffe0d2', '#f7c6c7', '#ffd9b0'], rsvp ? 71 : 72, 1);
    bokeh(c, t, true, 13);
    finish(c, t, true);
  }

  // ======================================================================================================
  // 3–6. THE FUNCTIONS, each in its own set
  // ======================================================================================================
  function lantern(c, x, y, s) {
    c.strokeStyle = '#8a6a2a'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - s * 1.6); c.lineTo(x, y - s * .6); c.stroke();
    glow(c, x, y + s * .2, s * 2.2, 'rgba(255,190,90,.45)');
    c.fillStyle = goldBevel(c, x - s * .6, y, x + s * .6, y + s); c.beginPath(); c.moveTo(x - s * .3, y - s * .6); c.lineTo(x + s * .3, y - s * .6); c.lineTo(x + s * .55, y - s * .3); c.lineTo(x - s * .55, y - s * .3); c.fill();
    const gg = c.createLinearGradient(0, y - s * .3, 0, y + s * .8); gg.addColorStop(0, '#ffe7a6'); gg.addColorStop(1, '#e89a3a'); c.fillStyle = gg; c.fillRect(x - s * .45, y - s * .3, s * .9, s * 1.1);
    c.strokeStyle = '#a07a2a'; c.lineWidth = 3; for (const dx of [-.45, -.15, .15, .45]) { c.beginPath(); c.moveTo(x + dx * s, y - s * .3); c.lineTo(x + dx * s, y + s * .8); c.stroke(); }
    c.fillStyle = goldBevel(c, x - s * .6, y, x + s * .6, y + s); c.beginPath(); c.moveTo(x - s * .55, y + s * .8); c.lineTo(x + s * .55, y + s * .8); c.lineTo(x + s * .2, y + s * 1.05); c.lineTo(x - s * .2, y + s * 1.05); c.fill();
  }
  function chandelier(c, x, y, s) {
    c.strokeStyle = '#b8902e'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - s * 1.4); c.lineTo(x, y - s * .2); c.stroke();
    glow(c, x, y + s * .2, s * 1.6, 'rgba(255,220,150,.5)');
    for (const [ry, rw, n] of [[0, .9, 14], [.35, .65, 11], [.62, .38, 8]]) {
      c.strokeStyle = goldBevel(c, x - s, y, x + s, y + s); c.lineWidth = 3; c.beginPath(); c.ellipse(x, y + s * ry, s * rw, s * rw * .22, 0, 0, TAU); c.stroke();
      for (let i = 0; i < n; i++) { const a = i / n * TAU, px = x + Math.cos(a) * s * rw, py = y + s * ry + Math.sin(a) * s * rw * .22;
        for (let j = 0; j < 3; j++) { c.fillStyle = j === 2 ? '#fffbe8' : 'rgba(255,248,230,.85)'; c.beginPath(); c.arc(px, py + 8 + j * 9, 3.2 - j * .6, 0, TAU); c.fill(); }
        c.fillStyle = '#fff6d8'; c.beginPath(); c.arc(px, py - 6, 3.5, 0, TAU); c.fill(); }
    }
    c.fillStyle = '#fff8e8'; c.beginPath(); c.arc(x, y + s * .95, 7, 0, TAU); c.fill();
  }
  function cushion(c, x, y, w, h, col, trim = '#d9b45a') {
    const g = c.createRadialGradient(x - w * .2, y - h * .3, 4, x, y, w * .6); g.addColorStop(0, mix(col, '#ffffff', .35)); g.addColorStop(1, mix(col, '#000000', .2));
    c.fillStyle = g; rrect(c, x - w / 2, y - h / 2, w, h, h * .45); c.fill(); c.strokeStyle = trim; c.lineWidth = 4; rrect(c, x - w / 2 + 6, y - h / 2 + 6, w - 12, h - 12, h * .4); c.stroke();
  }
  function urli(c, x, y, rx, ry, fill) {
    c.save(); c.shadowColor = 'rgba(60,30,6,.4)'; c.shadowBlur = 20; c.shadowOffsetY = 10;
    const g = c.createLinearGradient(x - rx, 0, x + rx, 0); g.addColorStop(0, '#8a5a18'); g.addColorStop(.35, '#f0c45a'); g.addColorStop(.6, '#c8902e'); g.addColorStop(1, '#6a4410');
    c.fillStyle = g; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI); c.lineTo(x - rx, y); c.fill(); c.restore();
    c.fillStyle = g; c.beginPath(); c.moveTo(x - rx, y); c.bezierCurveTo(x - rx, y + ry * 2.4, x + rx, y + ry * 2.4, x + rx, y); c.fill();
    c.fillStyle = '#f6d27a'; c.beginPath(); c.ellipse(x, y, rx, ry * .5, 0, 0, TAU); c.fill();
    const R = rng(Math.round(x));
    if (fill) for (let i = 0; i < fill; i++) { const a = R() * TAU, d = Math.sqrt(R()); marigold(c, x + Math.cos(a) * rx * .9 * d, y + Math.sin(a) * ry * .4 * d, 14 + R() * 6, R() > .5 ? 44 : 34); }
  }

  // ---- Mehendi: sage drapes, flower strings, lanterns ----
  function mehendiArt(k) {
    return K.art('cel-mehendi', W, H, k, c => {
      const R = rng(31);
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#e9dcc0'); g.addColorStop(.6, '#efe3c8'); g.addColorStop(1, '#c9a77a'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      // palace arches behind
      for (const x of [-60, 820]) { c.fillStyle = '#e4d2ae'; c.beginPath(); ogee(c, x, 520, 320, 900, 260); c.fill(); c.fillStyle = '#d8c294'; c.beginPath(); ogee(c, x + 30, 560, 260, 860, 220); c.fill(); }
      glow(c, 540, 700, 700, 'rgba(255,240,200,.6)');
      // sage drapes: swags across the top and tall curtains at the sides
      for (const [x0, x1, y, col] of [[-40, 560, 0, '#a9bb8c'], [520, 1120, 0, '#a9bb8c'], [180, 900, 30, '#bfcfa2']]) {
        const dg = c.createLinearGradient(0, y, 0, y + 340); dg.addColorStop(0, mix(col, '#000000', .15)); dg.addColorStop(1, mix(col, '#ffffff', .2)); c.fillStyle = dg;
        c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.quadraticCurveTo((x0 + x1) / 2, y + 420, x0, y); c.fill();
      }
      for (const side of [-1, 1]) {
        c.save(); if (side > 0) { c.translate(W, 0); c.scale(-1, 1); }
        const cg = c.createLinearGradient(0, 0, 240, 0); for (let i = 0; i <= 8; i++) cg.addColorStop(i / 8, i % 2 ? '#8ea270' : '#b9c99c');
        c.fillStyle = cg; c.beginPath(); c.moveTo(0, 0); c.lineTo(250, 0); c.bezierCurveTo(200, 400, 120, 700, 150, 1100); c.lineTo(190, 1500); c.lineTo(0, 1500); c.fill();
        c.restore();
      }
      // flower strings hanging from the top
      for (let x = 30; x < W; x += 62) { const len = 380 + R() * 380; for (let y = 0, i = 0; y < len; y += 22, i++) { if (i % 5 === 4) marigold(c, x, y, 10, 40); else blossom(c, x, y, 11, i % 2 ? '#f6b8c4' : '#fff5ee', '#fff', R() * 3); } }
      fairy(c, R, 220, 0, W, 0, 760, 2.2);
      // the floor: a soft carpet with petals
      const fl = c.createLinearGradient(0, 1480, 0, H); fl.addColorStop(0, '#d8b48a'); fl.addColorStop(1, '#b98a5a'); c.fillStyle = fl; c.fillRect(0, 1480, W, H - 1480);
      c.strokeStyle = 'rgba(160,60,70,.3)'; c.lineWidth = 6; c.strokeRect(80, 1540, 920, 420);
      for (let i = 0; i < 90; i++) blossom(c, R() * W, 1520 + R() * 400, 7 + R() * 5, R() > .4 ? '#e5788f' : '#ff9a3c', '#fff', R() * 6, 5, true);
      for (const x of [140, 940]) lantern(c, x, 560, 60);
    });
  }
  function mehendiFg(k) {
    return still('cel-mehendi-fg', W, 600, k, c => {
      const R = rng(32);
      cushion(c, 120, 270, 300, 130, '#9fb07e'); cushion(c, 960, 260, 300, 130, '#e7a8b4');
      cushion(c, 60, 370, 260, 110, '#e7a8b4'); cushion(c, 1030, 370, 260, 110, '#9fb07e');
      roses(c, R, 70, 470, 150, 120, 26, [BLUSH, PINK, WHITE, PEACH], 34);
      roses(c, R, 1010, 480, 150, 120, 26, [BLUSH, WHITE, PINK, PEACH], 34);
      for (const [x, y] of [[320, 520], [760, 530]]) { c.fillStyle = goldBevel(c, x - 90, y, x + 90, y + 30); c.beginPath(); c.ellipse(x, y, 92, 26, 0, 0, TAU); c.fill();
        for (let i = 0; i < 26; i++) blossom(c, x + (R() - .5) * 140, y - 4 + (R() - .5) * 26, 9, R() > .5 ? '#d9466a' : '#f48aa0', '#fff', R() * 6, 5, true); }
    });
  }
  // ---- the evening: palace courtyard by the pool, chandeliers, fairy lights ----
  function nightArt(k) {
    return K.art('cel-night', W, H, k, c => {
      const R = rng(41);
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#140c06'); g.addColorStop(.35, '#4a3016'); g.addColorStop(.62, '#8a5a24'); g.addColorStop(1, '#5a3612'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      // the palace arcade, lit from inside
      c.fillStyle = '#c9965a'; c.fillRect(0, 760, W, 520);
      for (let i = 0; i < 7; i++) { const x = -40 + i * 170; c.fillStyle = '#e8b870'; c.beginPath(); ogee(c, x + 20, 820, 120, 420, 120); c.fill();
        const wg = c.createLinearGradient(0, 840, 0, 1240); wg.addColorStop(0, '#ffe6a8'); wg.addColorStop(1, '#ffb050'); c.fillStyle = wg; c.beginPath(); ogee(c, x + 32, 840, 96, 400, 100); c.fill(); glow(c, x + 80, 1000, 140, 'rgba(255,200,110,.35)'); }
      c.fillStyle = '#a8763e'; c.fillRect(0, 760, W, 26); c.fillRect(0, 1260, W, 24);
      // a canopy of trees full of fairy lights
      for (let i = 0; i < 500; i++) { const x = R() * W, y = R() * R() * 700; leaf(c, x, y, 34, 12, R() * TAU, R() > .5 ? '#1e1a0c' : '#2c2810', false); }
      glow(c, 540, 300, 700, 'rgba(255,190,100,.18)');
      fairy(c, R, 520, 0, W, 0, 760, 3);
      for (let i = 0; i < 60; i++) { const x = R() * W; c.strokeStyle = 'rgba(255,220,150,.25)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + (R() - .5) * 40, 500 + R() * 300); c.stroke(); }
      for (const [x, y, s] of [[190, 250, 140], [890, 230, 140], [540, 110, 100]]) chandelier(c, x, y, s);
      // the pool
      const pg = c.createLinearGradient(0, 1284, 0, 1440); pg.addColorStop(0, '#1e6a7a'); pg.addColorStop(.5, '#3fa6b4'); pg.addColorStop(1, '#2a7f8c'); c.fillStyle = pg; c.fillRect(0, 1284, W, 156);
      for (let i = 0; i < 7; i++) { const x = -40 + i * 170 + 80; const rg = c.createLinearGradient(0, 1290, 0, 1440); rg.addColorStop(0, 'rgba(255,214,140,.55)'); rg.addColorStop(1, 'rgba(255,214,140,0)'); c.fillStyle = rg; c.fillRect(x - 30, 1290, 60, 150); }
      // the marble floor and a round gold stage
      const fl = c.createLinearGradient(0, 1440, 0, H); fl.addColorStop(0, '#c8955a'); fl.addColorStop(1, '#7a4a1e'); c.fillStyle = fl; c.fillRect(0, 1440, W, H - 1440);
      glow(c, 540, 1600, 600, 'rgba(255,214,150,.3)');
      c.fillStyle = '#e9c27a'; c.beginPath(); c.ellipse(540, 1640, 420, 80, 0, 0, TAU); c.fill();
      const sg = c.createLinearGradient(0, 1600, 0, 1720); sg.addColorStop(0, '#fff0c8'); sg.addColorStop(1, '#c8903e'); c.fillStyle = sg; c.beginPath(); c.ellipse(540, 1625, 410, 70, 0, 0, TAU); c.fill();
      roses(c, R, 150, 1180, 120, 110, 22, [WHITE, BLUSH, PINK, PEACH], 30);
      roses(c, R, 930, 1180, 120, 110, 22, [WHITE, BLUSH, PINK, PEACH], 30);
    });
  }
  function nightFg(k) {
    return still('cel-night-fg', W, 420, k, c => {
      const R = rng(42);
      roses(c, R, 40, 300, 130, 120, 22, [WHITE, BLUSH, PEACH], 32);
      roses(c, R, 1040, 300, 130, 120, 22, [WHITE, PINK, PEACH], 32);
      for (const [x, y, h] of [[120, 260, 120], [210, 330, 90], [870, 330, 90], [960, 260, 120], [330, 390, 70], [750, 390, 70]]) {
        c.fillStyle = 'rgba(255,255,255,.18)'; rrect(c, x - 30, y - h, 60, h, 12); c.fill(); c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 2; rrect(c, x - 30, y - h, 60, h, 12); c.stroke();
        c.fillStyle = '#fbf3e2'; c.fillRect(x - 14, y - h * .55, 28, h * .5);
      }
    });
  }
  const NIGHT_CANDLES = [[120, 260, 120], [210, 330, 90], [870, 330, 90], [960, 260, 120], [330, 390, 70], [750, 390, 70]];
  // ---- Haldi: a sunny courtyard, yellow drapes and marigold strings ----
  function haldiArt(k) {
    return K.art('cel-haldi', W, H, k, c => {
      const R = rng(51);
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#f6e7c4'); g.addColorStop(.6, '#f3dfb4'); g.addColorStop(1, '#d9b070'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      glow(c, 540, 500, 900, 'rgba(255,250,225,.8)');
      // jaali screens and arches
      for (const x of [20, 860]) { c.fillStyle = '#ead6a8'; c.beginPath(); ogee(c, x, 420, 200, 900, 180); c.fill();
        c.strokeStyle = 'rgba(180,140,70,.35)'; c.lineWidth = 2; for (let yy = 560; yy < 1300; yy += 34) for (let xx = x + 24; xx < x + 180; xx += 34) { c.beginPath(); c.arc(xx, yy, 12, 0, TAU); c.stroke(); } }
      // yellow drapes: tall pointed panels and swags
      for (let i = 0; i < 9; i++) { const x = i * 135 - 20, dg = c.createLinearGradient(x, 0, x + 135, 0); dg.addColorStop(0, '#e9b20e'); dg.addColorStop(.5, '#ffd84a'); dg.addColorStop(1, '#e2a40c');
        c.fillStyle = dg; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 135, 0); c.lineTo(x + 67, 360 + (i % 2) * 120); c.fill(); }
      // marigold strings, thick
      for (let x = 20; x < W; x += 54) garland(c, x, 0, 260 + ((x * 7) % 5) * 70, 11, [44, 36, 50]);
      for (const x of [230, 850]) garland(c, x, 300, 1250, 13, [44, 34]);
      // banana leaves at the top corners
      for (const [x, d] of [[60, 1], [1020, -1]]) { c.save(); c.translate(x, 0); c.scale(d, 1); for (let i = 0; i < 6; i++) leaf(c, 0, 0, 380, 70, .4 + i * .18, i % 2 ? '#6c9a34' : '#8ab84a'); c.restore(); }
      // floor with a petal rangoli
      const fl = c.createLinearGradient(0, 1460, 0, H); fl.addColorStop(0, '#f0dcb0'); fl.addColorStop(1, '#d8b47a'); c.fillStyle = fl; c.fillRect(0, 1460, W, H - 1460);
      for (let i = 0; i < 120; i++) blossom(c, R() * W, 1480 + R() * 420, 8 + R() * 5, R() > .5 ? '#ffb000' : '#ff7a00', '#ffe9a0', R() * 6, 5, true);
      roses(c, R, 260, 1250, 90, 90, 14, [CREAMR, ['#fff3b0', '#e8b820'], WHITE], 28);
      roses(c, R, 820, 1250, 90, 90, 14, [CREAMR, ['#fff3b0', '#e8b820'], WHITE], 28);
    });
  }
  function haldiFg(k) {
    return still('cel-haldi-fg', W, 520, k, c => {
      const R = rng(52);
      urli(c, 330, 150, 230, 70, 50); urli(c, 750, 150, 230, 70, 50);
      for (const [x, y] of [[120, 430], [540, 470], [960, 430]]) { c.fillStyle = goldBevel(c, x - 80, y, x + 80, y + 20); c.beginPath(); c.ellipse(x, y, 84, 22, 0, 0, TAU); c.fill();
        for (let i = 0; i < 16; i++) marigold(c, x + (R() - .5) * 120, y - 8 + (R() - .5) * 16, 13, R() > .5 ? 44 : 34); }
      for (const x of [40, 1040]) lantern(c, x, 330, 50);
    });
  }
  // ---- the Wedding: an illuminated Rajasthani palace at night ----
  const WB = { x: 345, y: 640, w: 390, h: 560, sh: 170 };
  function skyArt(k) {
    return still('cel-sky', W, 900, k, c => {
      const g = c.createLinearGradient(0, 0, 0, 900); g.addColorStop(0, '#0a1430'); g.addColorStop(.6, '#1a2c5c'); g.addColorStop(1, '#3a3a5a'); c.fillStyle = g; c.fillRect(0, 0, W, 900);
      const R = rng(61); for (let i = 0; i < 120; i++) { c.fillStyle = `rgba(255,255,255,${(.3 + R() * .6).toFixed(2)})`; c.beginPath(); c.arc(R() * W, R() * 600, .8 + R() * 1.6, 0, TAU); c.fill(); }
    });
  }
  function palaceArt(k) {
    return K.art('cel-palace', W, H, k, c => {
      const R = rng(62);
      const stone = (y0, y1) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, '#f2c999'); g.addColorStop(1, '#d99a5e'); return g; };
      // crown: parapet, chhatris
      c.fillStyle = stone(470, 560); c.fillRect(0, 520, W, 60);
      for (let x = 0; x < W; x += 54) { c.fillRect(x + 6, 492, 34, 30); }
      for (const [x, s] of [[110, 170], [540, 220], [970, 170], [325, 130], [755, 130]]) chhatri(c, x, 528, s, '#f4d2a2', '#c98e52');
      // the facade
      c.fillStyle = stone(560, 1500); c.fillRect(0, 570, W, 930);
      // jharokhas (lit windows) on two storeys
      for (const [y, hh] of [[620, 200], [900, 260]]) for (const x of [40, 175, 795, 930]) {
        c.fillStyle = '#c8874a'; c.beginPath(); ogee(c, x, y, 110, hh, 60); c.fill();
        const wg = c.createLinearGradient(0, y, 0, y + hh); wg.addColorStop(0, '#ffe9b0'); wg.addColorStop(1, '#ff9f3a'); c.fillStyle = wg; c.beginPath(); ogee(c, x + 12, y + 14, 86, hh - 14, 50); c.fill();
        glow(c, x + 55, y + hh * .6, 120, 'rgba(255,190,90,.35)');
        c.fillStyle = '#b8763c'; c.fillRect(x - 10, y + hh, 130, 16);
      }
      for (const x of [20, 280, 800, 1060]) { c.fillStyle = 'rgba(120,60,20,.25)'; c.fillRect(x - 6, 580, 12, 920); }
      // the grand central arch, deep and glowing
      c.fillStyle = '#b97a40'; c.beginPath(); ogee(c, 270, 560, 540, 940, 240); c.fill();
      const ag = c.createLinearGradient(0, 600, 0, 1500); ag.addColorStop(0, '#6a3412'); ag.addColorStop(.6, '#c8742a'); ag.addColorStop(1, '#ffcf7a');
      c.fillStyle = ag; c.beginPath(); ogee(c, 300, 600, 480, 900, 220); c.fill();
      // wall lamps
      for (const [x, y] of [[255, 820], [825, 820], [255, 1180], [825, 1180], [120, 1440], [960, 1440]]) { glow(c, x, y, 90, 'rgba(255,190,100,.5)'); c.fillStyle = '#ffe6a6'; c.beginPath(); c.arc(x, y, 9, 0, TAU); c.fill(); }
      // a frame of roses round the board
      const P0 = ogeePts(WB.x - 36, WB.y - 50, WB.w + 72, WB.h + 50, WB.sh + 30, 18);
      P0.forEach(([x, y]) => { for (let j = 0; j < 2; j++) leaf(c, x + (R() - .5) * 60, y + (R() - .5) * 60, 46, 18, R() * TAU, R() > .5 ? '#3f6a32' : '#5d8a48'); });
      P0.forEach(([x, y]) => { for (let j = 0; j < 2; j++) { const pick = R(), [l, d] = pick < .4 ? PINK : pick < .65 ? WHITE : pick < .85 ? PEACH : ['#ffb0a0', '#c8323a']; rose(c, x + (R() - .5) * 40, y + (R() - .5) * 40, 20 + R() * 8, l, d, R() * 3); } });
      // the courtyard floor, a red runner strewn with petals, flower urns
      const fl = c.createLinearGradient(0, 1500, 0, H); fl.addColorStop(0, '#d8a066'); fl.addColorStop(1, '#8a4e24'); c.fillStyle = fl; c.fillRect(0, 1500, W, H - 1500);
      c.fillStyle = '#9a2a24'; c.beginPath(); c.moveTo(470, 1500); c.lineTo(610, 1500); c.lineTo(820, H); c.lineTo(260, H); c.fill();
      c.strokeStyle = '#e2b25a'; c.lineWidth = 6; c.beginPath(); c.moveTo(478, 1500); c.lineTo(285, H); c.moveTo(602, 1500); c.lineTo(795, H); c.stroke();
      for (let i = 0; i < 110; i++) { const y = 1510 + R() * 410, sp = lerp(70, 280, (y - 1500) / 420); blossom(c, 540 + (R() - .5) * 2 * sp, y, 7 + R() * 5, R() > .4 ? '#e8324a' : '#ff9ab0', '#fff', R() * 6, 5, true); }
      for (const [x, y, s] of [[300, 1540, 60], [780, 1540, 60]]) { c.fillStyle = goldBevel(c, x - s, y - s, x + s, y + s); c.beginPath(); c.moveTo(x - s * .5, y); c.quadraticCurveTo(x - s * .8, y - s * .6, x - s * .4, y - s); c.lineTo(x + s * .4, y - s); c.quadraticCurveTo(x + s * .8, y - s * .6, x + s * .5, y); c.fill();
        roses(c, R, x, y - s * 1.3, s * .9, s * .6, 12, [PINK, WHITE, PEACH], 22); }
    });
  }
  function weddingFg(k) {
    return still('cel-wedding-fg', W, 420, k, c => {
      const R = rng(63);
      for (const [x, y, s] of [[90, 280, 100], [990, 280, 100]]) { c.fillStyle = goldBevel(c, x - s, y - s, x + s, y + s); c.beginPath(); c.moveTo(x - s * .5, y + s); c.quadraticCurveTo(x - s * .9, y + s * .3, x - s * .45, y); c.lineTo(x + s * .45, y); c.quadraticCurveTo(x + s * .9, y + s * .3, x + s * .5, y + s); c.fill();
        roses(c, R, x, y - s * .3, s * 1.1, s * .7, 22, [PINK, WHITE, PEACH, BLUSH], 30); }
      for (const x of [230, 850]) lantern(c, x, 340, 46);
    });
  }
  // fireworks bursting over the palace (live)
  const FW = (() => { const R = rng(64), o = []; for (let i = 0; i < 18; i++) o.push({ t0: i * .5 + R() * .3, x: 110 + R() * 860, y: 140 + R() * 330, s: 230 + R() * 150, col: ['255,226,150', '255,250,235', '255,196,110', '210,226,255', '255,214,120'][i % 5], n: 44 + Math.floor(R() * 14) }); return o; })();
  function fireworks(c, pt) {
    c.save(); c.lineCap = 'round';
    for (const f of FW) {
      const age = pt - f.t0;
      if (age < 0 || age > 2.3) continue;
      if (age < .45) { const u = ease(age / .45), y = lerp(760, f.y, u); c.strokeStyle = `rgba(${f.col},.8)`; c.lineWidth = 3; c.beginPath(); c.moveTo(f.x, y); c.lineTo(f.x, y + 40); c.stroke(); continue; }
      const p = (age - .45) / 1.85, r = f.s * ease3(Math.min(1, p * 1.7)), droop = p * p * 70, al = (1 - p) ** .75;
      if (p < .25) glow(c, f.x, f.y, f.s * .6, `rgba(${f.col},${((.25 - p) * 2).toFixed(2)})`);
      c.strokeStyle = `rgba(${f.col},${al.toFixed(2)})`; c.lineWidth = 4.5;
      c.beginPath();
      for (let i = 0; i < f.n; i++) { const a = i / f.n * TAU, cs = Math.cos(a), sn = Math.sin(a); c.moveTo(f.x + cs * r * .25, f.y + sn * r * .25 + droop * .3); c.lineTo(f.x + cs * r, f.y + sn * r + droop); }
      c.stroke();
      c.strokeStyle = `rgba(255,252,235,${(al * .9).toFixed(2)})`; c.lineWidth = 2; c.beginPath();
      for (let i = 0; i < f.n; i++) { const a = i / f.n * TAU, cs = Math.cos(a), sn = Math.sin(a); c.moveTo(f.x + cs * r * .7, f.y + sn * r * .7 + droop * .7); c.lineTo(f.x + cs * r, f.y + sn * r + droop); }
      c.stroke();
      c.fillStyle = `rgba(255,255,240,${al.toFixed(2)})`;
      for (let i = 0; i < f.n; i += 2) { const a = i / f.n * TAU; c.fillRect(f.x + Math.cos(a) * r - 2, f.y + Math.sin(a) * r + droop - 2, 4, 4); }
    }
    c.restore();
  }

  // the board's words for a function
  function fnLines(s, P, top, maxW, kind) {
    const hi = P.opt.lang === 'hi', e = s.ev, nm = hi ? hiName(e.name) : e.name, ink = kind === 'mehendi' ? '#3f5a2a' : '#5a3a1a';
    let title;
    if (kind === 'night' && !hi) {
      const parts = nm.split(/\s*(?:&|\band\b)\s*/i).filter(Boolean);
      title = parts.length > 1 ? [{ s: parts[0], f: 'vibes', z: 124, col: ink, gap: 0 }, { s: '&', f: 'vibes', z: 76, col: ink, gap: 0 }, { s: parts.slice(1).join(' & '), f: 'vibes', z: 124, col: ink, gap: 20 }]
        : [{ s: nm, f: 'vibes', z: 136, col: ink, gap: 20, wrap: 2 }];
    } else title = [{ s: hi ? nm : nm.toUpperCase(), f: 'title', z: nm.length > 9 ? 70 : 92, col: ink, gap: 20, wrap: 2 }];
    return flow([...title,
      { s: dateLine(e.date, hi), f: 'serif', z: 40, col: '#5a4028', ls: 1, gap: 8 },
      { s: timeLine(e.time, hi), f: 'serif', z: 34, col: '#6a4a2a', ls: 1, gap: 12 },
      { div: true, w: 200, col: '#b8862b', gap: 16 },
      { s: e.venue ? (hi ? e.venue : e.venue.toUpperCase()) : '', f: 'serif', z: 36, col: '#5a4028', wrap: 3, ls: 1 }], top, maxW);
  }
  // ---------- the camera: a push/pull with parallax depth, and whip-pans in and out of every function ----------
  // depth 0 = far background … 1 = the couple … 1.3 = foreground. Each layer moves by its depth, so the set has real depth.
  function camOf(s, pt, seed) {
    const d = s.d, dir = seed % 2 ? 1 : -1;
    const intro = ease3(clamp(pt / 1.5)), drift = ease(clamp((pt - 1.5) / Math.max(.5, d - 1.9)));
    const z = lerp(1.42, 1.0, intro) + .09 * drift;                                   // starts close on the board, pulls back, then pushes in slowly
    let x = dir * (lerp(90, 0, intro) + lerp(0, -70, drift)) + Math.sin(pt * .7 + seed) * 6;
    let y = lerp(-260, 0, intro) + lerp(0, 40, drift) + Math.sin(pt * .9 + seed * 2) * 4;
    const win = 1 - ease3(clamp(pt / .42)), wout = ease3(clamp((pt - (d - .42)) / .42));
    x += dir * 900 * win - dir * 900 * wout;                                            // whip in from one side, out the other
    return { z, x, y, whip: Math.max(win, wout), dir };
  }
  function layer(c, cam, depth, fn) {
    c.save();
    const sc = 1 + (cam.z - 1) * depth;
    c.translate(W / 2, H * .55); c.scale(sc, sc); c.translate(-W / 2 - cam.x * depth, -H * .55 - cam.y * depth);
    fn(); c.restore();
  }
  function whipFx(c, cam) {
    if (cam.whip <= .02) return;
    const a = cam.whip;
    c.save();
    for (let i = 0; i < 14; i++) {                                                       // motion-blur light streaks
      const y = ((i * 151) % H), h = 6 + (i * 37) % 26, len = W * (.6 + (i % 4) * .2);
      const g = c.createLinearGradient(0, 0, W, 0);
      g.addColorStop(0, 'rgba(255,240,210,0)'); g.addColorStop(.5, `rgba(255,236,200,${(.55 * a).toFixed(3)})`); g.addColorStop(1, 'rgba(255,240,210,0)');
      c.fillStyle = g; c.fillRect((W - len) / 2 + cam.dir * (1 - a) * 200, y, len, h);
    }
    c.fillStyle = `rgba(255,244,224,${(a * .5).toFixed(3)})`; c.fillRect(0, 0, W, H);
    c.restore();
  }
  // a springy drop for the boards (overshoots, then settles with a little swing)
  const spring = x => x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.exp(-6 * x) * Math.cos(9 * x);
  function swingBoard(c, pt, B, fn) {
    const q = clamp((pt - .25) / 1.4), sp = spring(q), sw = Math.exp(-3 * q) * Math.sin(q * 14) * .05;
    c.save(); c.translate(B.x + B.w / 2, B.y - 40); c.rotate(sw); c.translate(0, -(1 - sp) * 520); c.translate(-(B.x + B.w / 2), -(B.y - 40));
    fn(Math.min(1, ease(q * 2.2))); c.restore();
  }
  // the couple walks in from the side, step by step, then stands together
  function walkIn(pt, from) {
    const q = ease3(clamp((pt - .35) / 1.7)), step = (1 - q) > .02 ? Math.abs(Math.sin(pt * 9)) * 16 * (1 - q) : 0;
    return { dx: from * 420 * (1 - q), bob: step, a: ease(clamp((pt - .35) / .5)) };
  }
  function fnShot(c, s, pt, t, P) {
    const k = kOf(P), kind = s.kind, u = pt / s.d, card = P.card;
    const img = coupleImage(P, kind === 'night' && !/sangeet|dance|dj|garba|cocktail|reception|dinner/i.test(s.ev.name) ? 'Reception' : s.ev.name || 'Wedding');
    const seed = (s.t0 * 7 | 0) + kind.length, cam = camOf(s, pt, seed), wk = walkIn(pt, seed % 2 ? 1 : -1);
    const ca = wk.a, walk = wk.dx;
    const BW = (B, kind2, off) => swingBoard(c, pt, B, a => boardWith(c, s, P, pt, a, B, k, kind2, off));
    const PERS = (img2, x, foot, h, o) => person(c, img2, x, foot - wk.bob, h, t, o);
    if (kind === 'mehendi') {
      layer(c, cam, .35, () => { c.drawImage(mehendiArt(k), -60, -60, W + 120, H + 120); for (const x of [140, 940]) glow(c, x, 600, 110 + Math.sin(t * 7 + x) * 8, 'rgba(255,200,110,.35)'); twinkle(c, t, MEH_TW, '255,240,200', 12); });
      layer(c, cam, .7, () => guests(c, 'mehendi', [[170, 1420, 470, false], [930, 1420, 470, true], [60, 1480, 540, false], [1030, 1480, 540, true]], t, k, 'rgba(240,230,200,.18)', 2.4, { bob: 16, rate: 4.2, sway: .05 }));
      layer(c, cam, .85, () => BW({ x: 270, y: 150, w: 540, h: 860, sh: 240 }, 'mehendi', 0));
      layer(c, cam, 1, () => { glow(c, 540, 1350, 460, 'rgba(255,240,210,.35)'); if (img) PERS(img, 540 + walk, 1800, 840, { a: ca, ph: .5, sway: .03 }); });
      layer(c, cam, 1.3, () => { c.drawImage(mehendiFg(k), -80, 1340, W + 160, 600); for (const [x, y] of [[230, 1880], [850, 1880]]) diya(c, x, y, 30, t); });
      petals(c, t, 14, ['#f7a1b5', '#ffffff', '#ff9a3c'], 81, .9);
      whipFx(c, cam); vignette(c, k, true); finish(c, t, true);
    } else if (kind === 'night') {
      layer(c, cam, .35, () => { c.drawImage(nightArt(k), -60, -60, W + 120, H + 120); twinkle(c, t, NIGHT_TW, '255,230,170', 12);
        for (let i = 0; i < 12; i++) { const x = ((i * 97 + t * (i % 2 ? 26 : -22)) % W + W) % W, y = 1300 + (i * 37) % 130; c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 24, y); c.quadraticCurveTo(x, y - 5, x + 24, y); c.stroke(); }
        // moving party spotlights
        for (let i = 0; i < 3; i++) { const a = Math.sin(t * .8 + i * 2.1) * .5; c.save(); c.translate(240 + i * 300, -40); c.rotate(a); const g = c.createLinearGradient(0, 0, 0, 1500); g.addColorStop(0, 'rgba(255,230,180,.28)'); g.addColorStop(1, 'rgba(255,230,180,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(-30, 0); c.lineTo(30, 0); c.lineTo(220, 1500); c.lineTo(-220, 1500); c.fill(); c.restore(); } });
      layer(c, cam, .7, () => guests(c, 'night', [[70, 1560, 520, false], [200, 1520, 470, false], [880, 1520, 470, true], [1010, 1560, 520, true], [330, 1460, 380, false], [750, 1460, 380, true]], t, k, 'rgba(200,150,60,.32)', 2.2, { bob: 18, rate: 4.6, sway: .06 }));
      layer(c, cam, .85, () => BW({ x: 270, y: 260, w: 540, h: 960, sh: 250 }, 'night', 30));
      layer(c, cam, 1, () => { glow(c, 540, 1350, 420, 'rgba(255,214,150,.35)'); if (img) PERS(img, 540 - walk, 1650, 720, { a: ca, ph: 1.1, sway: .04, bow: .25 * Math.max(0, Math.sin(pt * 1.1)), dir: 1 }); });
      layer(c, cam, 1.3, () => { c.drawImage(nightFg(k), -80, 1500, W + 160, 420); NIGHT_CANDLES.forEach(([x, y, h], i) => flame(c, x, 1500 + y - h * .55, 22, t, i)); });
      motes(c, t, 16, 'rgba(255,220,150,A)', 9);
      whipFx(c, cam); vignette(c, k, false); finish(c, t, false);
    } else if (kind === 'haldi') {
      layer(c, cam, .35, () => c.drawImage(haldiArt(k), -60, -60, W + 120, H + 120));
      layer(c, cam, .7, () => guests(c, 'haldi', [[150, 1420, 500, false], [930, 1420, 500, true], [40, 1470, 560, false], [1040, 1470, 560, true]], t, k, 'rgba(255,220,120,.16)', 2.2, { bob: 18, rate: 4.4, sway: .06 }));
      layer(c, cam, .85, () => BW({ x: 320, y: 280, w: 440, h: 880, sh: 220 }, 'haldi', 0));
      layer(c, cam, 1, () => { glow(c, 540, 1400, 460, 'rgba(255,240,190,.4)'); if (img) PERS(img, 540 + walk, 1720, 800, { a: ca, ph: 2.1, sway: .03 }); });
      layer(c, cam, 1.3, () => c.drawImage(haldiFg(k), -80, 1400, W + 160, 520));
      c.save(); { const sc = cam.z; c.translate(W / 2, H * .55); c.scale(sc, sc); c.translate(-W / 2 - cam.x, -H * .55 - cam.y); }
      // marigold petals thrown from both sides
      if (pt > .9) for (let i = 0; i < 26; i++) {
        const per = 1.9, q = ((pt - .9) + i * .29) % per / per, side = i % 2 ? -1 : 1, x0 = 540 + side * 360, y0 = 1080 + (i % 3) * 40, x1 = 540 + side * (30 + (i * 37) % 150), y1 = 1300 + (i * 53) % 160;
        if (pt - .9 < i * .29 * .4) continue;
        const x = lerp(x0, x1, q), y = lerp(y0, y1, q) - Math.sin(q * Math.PI) * 240, a = 1 - ease((q - .8) / .2);
        c.globalAlpha = a; marigold(c, x, y, 9 + (i % 3) * 2, i % 3 ? 44 : 32); c.globalAlpha = 1;
      }
      c.restore();
      petals(c, t, 16, ['#ffb000', '#ff8a00', '#ffd84a'], 91, 1);
      whipFx(c, cam); vignette(c, k, true); finish(c, t, true);
    } else {
      layer(c, cam, .15, () => { c.drawImage(skyArt(k), -80, -60, W + 160, 960); fireworks(c, pt % 9); });
      layer(c, cam, .45, () => { c.drawImage(palaceArt(k), -60, -60, W + 120, H + 120); twinkle(c, t, PAL_TW, '255,210,130', 18); });
      layer(c, cam, .75, () => guests(c, 'wedding', [[300, 1500, 270, false], [780, 1500, 270, true], [190, 1540, 320, false], [890, 1540, 320, true], [70, 1590, 370, false], [1010, 1590, 370, true]], t, k, 'rgba(255,200,130,.2)', 2, { bob: 12, rate: 3.8, sway: .05 }));
      layer(c, cam, .85, () => BW(WB, 'wedding', 20));
      // the couple walks up the petal path towards the camera
      layer(c, cam, 1, () => { glow(c, 540, 1450, 400, 'rgba(255,214,150,.35)'); const q = ease3(clamp((pt - .3) / 2.4)); if (img) PERS(img, 540, lerp(1560, 1790, q), lerp(430, 640, q), { a: ca, ph: 3.1, sway: .025 }); });
      layer(c, cam, 1.3, () => c.drawImage(weddingFg(k), -80, 1500, W + 160, 420));
      petals(c, t, 18, ['#e8324a', '#ff9ab0', '#ffd166'], 95, 1);
      whipFx(c, cam); vignette(c, k, false); finish(c, t, false);
    }
  }
  function boardBlooms(k, kind, B) {
    const cols = kind === 'haldi' ? [CREAMR, ['#fff3b0', '#e8b820'], WHITE, PEACH] : kind === 'mehendi' ? [BLUSH, PINK, WHITE, PEACH] : [WHITE, BLUSH, PINK, PEACH];
    return still(`cel-blooms-${kind}-${B.w}x${B.h}`, B.w + 240, B.h + 120, k, c => {
      const R = rng(B.w + B.h);
      roses(c, R, 116, 60 + B.sh * .4, 58, 90, 14, cols, 27);
      roses(c, R, 128 + B.w, 60 + B.h * .86, 60, 100, 12, cols, 26);
      for (let i = 0; i < 10; i++) leaf(c, 100 + (R() - .5) * 20, 60 + B.sh * .4 + 80 + i * 22, 50, 16, Math.PI / 2 + (R() - .5), '#6a8a4a');
    });
  }
  function vignette(c, k, warm) {
    c.drawImage(still(`cel-vig-${warm}`, 540, 960, Math.min(1, k), g => {
      const v = g.createRadialGradient(270, 430, 200, 270, 480, 640); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(.7, warm ? 'rgba(90,40,0,.08)' : 'rgba(30,10,0,.12)'); v.addColorStop(1, warm ? 'rgba(90,40,0,.32)' : 'rgba(20,6,0,.5)');
      g.fillStyle = v; g.fillRect(0, 0, 540, 960);
    }), 0, 0, W, H);
  }
  function boardWith(c, s, P, pt, ba, B, k, kind, off) {
    if (ba <= .01) return;
    c.save(); c.globalAlpha = ba; c.translate(0, (1 - ba) * -40);
    c.drawImage(archBoard(k, B.w, B.h, B.sh), B.x - 40, B.y - 40, B.w + 80, B.h + 80);
    if (kind !== 'wedding') c.drawImage(boardBlooms(k, kind, B), B.x - 120, B.y - 60, B.w + 240, B.h + 120);
    c.restore();
    const L = s.lines || (s.lines = fnLines(s, P, B.y + B.sh * .8 + off, B.w - 90, kind));
    sayAll(c, L, pt, .7, .14);
  }
  const MEH_TW = pts(33, 30, 0, W, 0, 760), NIGHT_TW = pts(43, 46, 0, W, 0, 780), PAL_TW = [[255, 820], [825, 820], [255, 1180], [825, 1180], [95, 720], [985, 720], [230, 720], [850, 720]];

  return {
    id: 'story-celebration', order: 2, occasion: 'wedding', tune: 'baraat', thumb: 2.6,
    name: 'The Grand Celebration', note: 'Children dance at a palace gate of roses as the doors open on a golden hall; the families bow in namaste, then every function in its own glowing set, fireworks over the palace and RSVP',
    names: ['Saisha', 'Arnav'], ganesha: 'ganesha-01',
    looks: { open: 'blush-champagne', title: 'blush-champagne', invite: 'blush-champagne', events: ['blush-champagne'], date: 'blush-champagne', end: 'blush-champagne', final: 'blush-champagne' },
    look: (kind, K) => K.palette('blush-champagne', { font: { script: 'Dancing Script', serif: 'Gilda Display' }, col: { names: '#4a3424', ink: '#4a3424', ink2: '#6a5440', accent: '#8a6a44', gold: '#b8862b' },
      shadow: ['rgba(255,252,245,.9)', 6], fx: () => {} }),
    timeline(S, K, card, opt) {
      const hi = opt.lang === 'hi';
      let evs = days(card, hi).flatMap(d => d.events.map(e => ({ ...e, date: d.date }))).slice(0, 6);
      if (!evs.length) {
        const one = { name: hi ? 'शुभ विवाह' : 'Wedding', date: card.date, venue: card.venue };
        evs = days({ events: [one] }, hi).flatMap(d => d.events.map(e => ({ ...e, date: d.date })));
        if (!evs.length) evs = [{ name: one.name, date: null, time: '', venue: K.clean(card.venue) }];
      }
      const n = evs.length, fd = Math.max(3.6, Math.min(6.2, 24.5 / n));
      const out = [{ k: 'reel', reel: 'gate', d: 7, name: 'Welcome Gate' },
        { k: 'reel', reel: 'stage', d: 7, name: 'The Families', change: 'bloom' }];
      evs.forEach(e => { const kind = kindOf(e.name, e.date); out.push({ k: 'reel', reel: 'fn', ev: e, kind, d: fd + (kind === 'wedding' ? 1.4 : 0), name: e.name, change: 'none' }); });
      out.push({ k: 'reel', reel: 'rsvp', d: 6.6, name: 'RSVP', change: 'none', sigCorner: opt.signature !== false,
        tail: [{ t: 'qr', rows: K.SITE_QR, z: 170, gap: 12 }, { t: 'text', s: 'cardalbum.vercel.app', f: 'serif', z: 30, col: 'accent' }] });
      return out;
    },
    shots: {
      gate: gateShot,
      stage: (c, s, pt, t, P) => stageShot(c, s, pt, t, P, false),
      fn: fnShot,
      rsvp: (c, s, pt, t, P) => stageShot(c, s, pt, t, P, true)
    }
  };
})(Cinema.kit));
