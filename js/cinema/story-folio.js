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
