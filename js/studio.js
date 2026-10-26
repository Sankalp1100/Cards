// Video Studio (admin only): story-style invitation videos drawn on a canvas (1080×1920, phone portrait), in six
// painted looks. The story: opening monogram and date, the invitation (blessing, names, parents), each function,
// save the date with the venue, and the closing with the "Designed by" signature. Every picture is drawn from code
// (no image files), so any card's details fit any look, and nothing is ever sent anywhere.
const Studio = (() => {
  const W = 1080, H = 1920, TAU = Math.PI * 2;
  const rng = seed => () => {
    seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => 1 - (1 - clamp(t)) ** 3;

  // ---------- Words ----------
  const INVITE_LINES = {
    wedding: 'Request your gracious presence\nat the wedding celebration of',
    engagement: 'Request the pleasure of your company\nat the engagement of',
    sangeet: 'Invite you to an evening of music & dance\nat the Sangeet of',
    kitty: 'You are invited to a fabulous\nkitty party by',
    bday: 'Join us to celebrate\nthe birthday of',
    naming: 'With joy we invite you\nto the naming ceremony hosted by',
    birthday: 'Come play, eat cake & celebrate\nthe birthday of',
    babyshower: 'Join us to shower love\nat the baby shower of',
    ceremony: 'With the blessings of the Almighty\nwe invite you to a ceremony hosted by',
    anniversary: 'Join us to celebrate\nthe anniversary of'
  };
  const CLOSINGS = {
    wedding: 'Awaiting your presence', engagement: 'Awaiting your presence', sangeet: 'Let’s dance together',
    kitty: 'See you there!', bday: 'See you there!', birthday: 'See you there!', naming: 'With love & blessings',
    babyshower: 'With love & blessings', ceremony: 'With blessings', anniversary: 'Cheers to love'
  };
  const BLESSED = ['wedding', 'engagement', 'naming', 'ceremony', 'babyshower'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const ordinal = n => n + ((n % 100 >= 11 && n % 100 <= 13) ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th');
  const clean = s => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
  const timeText = d => `${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() < 12 ? 'AM' : 'PM'}`;
  const dayText = d => `${DAYS[d.getDay()]}, ${ordinal(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  // "🌼 Haldi" → { icon: '🌼', name: 'Haldi' }
  function splitIcon(s) {
    const m = clean(s).match(/^((?:\p{Extended_Pictographic}|\p{Emoji_Presentation})(?:️|‍(?:\p{Extended_Pictographic}|\p{Emoji_Presentation}))*)\s*(.*)$/u);
    return m ? { icon: m[1], name: m[2] || '' } : { icon: '', name: clean(s) };
  }
  // "919876543210" → "+91 98765 43210"
  const phone = s => { const m = Core.mobile(s); return m ? `+91 ${m.slice(2, 7)} ${m.slice(7)}` : ''; };
  const initial = s => (Array.from(clean(s))[0] || '').toUpperCase();

  // The two families as "D/o …" / "S/o …" lines (wedding and engagement only), matched by what their side says,
  // else in order: the first family goes with the first name (the bride's side in the order form).
  function parents(card) {
    if (!/^(wedding|engagement)$/.test(card.type)) return ['', ''];
    const fam = (card.families || []).filter(f => f && clean(f.parents));
    const bride = fam.find(f => /bride|ladki|daughter|girl|dulhan/i.test(f.side || ''));
    const groom = fam.find(f => /groom|ladka|\bson\b|boy|dulha/i.test(f.side || ''));
    const p1 = bride || fam.find(f => f !== groom), p2 = groom || fam.find(f => f !== p1);
    return [p1 ? `D/o ${clean(p1.parents)}` : '', p2 ? `S/o ${clean(p2.parents)}` : ''];
  }

  const defaults = card => ({
    look: 'vrindavan',
    blessing: BLESSED.includes(card.type),
    blessingText: '|| Shree Ganeshay Namah ||',
    inviteLine: INVITE_LINES[card.type] || INVITE_LINES.wedding,
    parents: true,
    events: (card.events || []).filter(e => clean(e.name)).length > 3 ? 'list' : 'each',
    music: 'look'
  });

  // ---------- The story: which scenes, how long each ----------
  function timeline(card, opt) {
    const S = [{ k: 'open', d: 6 }];
    const [p1, p2] = opt.parents ? parents(card) : ['', ''];
    S.push({ k: 'invite', d: p1 || p2 ? 8 : 7 });
    const evs = (card.events || []).filter(e => clean(e.name)).slice(0, 6);
    if (opt.events === 'each') evs.forEach(e => S.push({ k: 'event', e, d: 4.5 }));
    else if (opt.events === 'list' && evs.length) S.push({ k: 'events', evs, d: 4 + evs.length });
    if (Core.parseDate(card.date) || clean(card.venue)) S.push({ k: 'date', d: 6 });
    S.push({ k: 'end', d: 7 });
    let t = 0;
    S.forEach(s => { s.t0 = t; t += s.d; });
    return { scenes: S, total: t };
  }
  const sceneName = s => ({ open: 'Opening', invite: 'Invitation', events: 'Functions', date: 'Save the date', end: 'Closing' })[s.k]
    || splitIcon(s.e.name).name || 'Function';

  // What each scene says, as a list of lines for the layout below.
  function lines(s, card, opt) {
    const two = !!clean(card.host2), when = Core.parseDate(card.date), timed = when && Core.hasTime(card.date);
    const T = (str, f, z, col, more) => clean(str) ? { t: 'text', s: clean(str), f, z, col, gap: 12, ...more } : null;
    const label = (PRESETS[card.type] || PRESETS.wedding).label;
    let L = [];
    if (s.k === 'open') {
      L = [{ t: 'crest', h: 210, gap: 26 }, { t: 'mono', z: two ? 300 : 340, gap: 40 },
        when ? { t: 'date', d: when, z: 66, col: 'names', gap: 22 } : null,
        T(`${label} Invitation`, 'serif', 32, 'accent', { up: true, ls: 7 })];
    } else if (s.k === 'invite') {
      const [p1, p2] = opt.parents ? parents(card) : ['', ''];
      if (opt.blessing) L.push(T('ॐ', 'deva', 78, 'accent', { gap: 2 }), T(opt.blessingText, 'serif', 32, 'accent', { gap: 40, ls: 1 }));
      const req = String(opt.inviteLine || '').split('\n').map(x => T(x, 'serif', 44, 'ink', { gap: 6 })).filter(Boolean);
      if (req.length) req[req.length - 1].gap = 30;
      L.push(...req, T(card.host1, 'script', 150, 'names', { gap: p1 ? 4 : 18 }), T(p1, 'serif', 34, 'ink2', { wrap: 2, gap: 26 }));
      if (two) {
        L.push({ t: 'div', word: card.type === 'wedding' ? 'Weds' : '&', z: 50, gap: 22 },
          T(card.host2, 'script', 150, 'names', { gap: 4 }), T(p2, 'serif', 34, 'ink2', { wrap: 2 }));
      }
    } else if (s.k === 'event') {
      const { icon, name } = splitIcon(s.e.name), d = Core.parseDate(s.e.date);
      L = [T('The Celebrations', 'serif', 30, 'accent', { up: true, ls: 8, gap: 30 }),
        icon ? { t: 'emoji', s: icon, z: 92, gap: 10 } : null,
        T(name, 'script', 150, 'names', { gap: 16 }), { t: 'div', word: '', z: 40, gap: 30 },
        d ? T(dayText(d), 'serif', 44, 'ink', { gap: 10 }) : null,
        d && Core.hasTime(s.e.date) ? T(`${timeText(d)} onwards`, 'serif', 38, 'ink2', { gap: 26 }) : null,
        T(s.e.venue, 'serif', 42, 'ink', { wrap: 2, gap: 14 }),
        T(s.e.dress && `Dress code · ${clean(s.e.dress)}`, 'italic', 42, 'ink2', { wrap: 2 })];
    } else if (s.k === 'events') {
      L = [T('The Celebrations', 'script', 124, 'names', { gap: 6 }), { t: 'div', word: '', z: 40, gap: 36 }];
      s.evs.forEach(e => {
        const d = Core.parseDate(e.date);
        L.push(T(e.name, 'serif', 50, 'ink', { gap: 6 }),
          T([d && `${DAYS[d.getDay()].slice(0, 3)}, ${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`, d && Core.hasTime(e.date) && timeText(d), clean(e.venue)].filter(Boolean).join('  ·  ') || ' ',
            'italic', 38, 'ink2', { wrap: 2, gap: 30 }));
      });
    } else if (s.k === 'date') {
      L = [T(when ? 'Save the Date' : 'Join us at', 'script', 132, 'names', { gap: 26 }),
        when ? { t: 'cal', d: when, timed, gap: 30 } : null, { t: 'div', word: '', z: 40, gap: 30 },
        when && clean(card.venue) ? T('Venue', 'serif', 30, 'accent', { up: true, ls: 8, gap: 12 }) : null,
        T(card.venue, 'serif', 48, 'ink', { wrap: 3, gap: 14 }), T(card.venueNote, 'italic', 40, 'ink2', { wrap: 2 })];
    } else if (s.k === 'end') {
      const fams = /^(wedding|engagement)$/.test(card.type) ? (card.families || []).map(f => clean(f && f.parents)).filter(Boolean).slice(0, 3) : [];
      const tag = clean(card.hashtag).replace(/^#+/, '');
      L = [T(CLOSINGS[card.type] || CLOSINGS.wedding, 'script', 116, 'names', { gap: 22 }),
        T(card.thanks || card.message, 'italic', 46, 'ink', { wrap: 4, gap: 34 }),
        fams.length ? T('Best compliments from', 'serif', 28, 'accent', { up: true, ls: 5, gap: 12 }) : null,
        ...fams.map((f, i) => T(f, 'serif', 38, 'ink2', { wrap: 2, gap: i === fams.length - 1 ? 28 : 8 })),
        T(tag && `#${tag}`, 'serif', 42, 'accent', { gap: 14 }),
        T(phone(card.rsvp) && `RSVP  ·  ${phone(card.rsvp)}`, 'serif', 36, 'ink', { gap: 14 }),
        { t: 'sig', gap: 0, pad: 40 }];
    }
    return L.filter(Boolean);
  }

  // ---------- Drawing helpers ----------
  function leaf(c, x, y, len, wid, ang, fill, rib = true) {
    c.save(); c.translate(x, y); c.rotate(ang);
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(len * .5, -wid, len, 0); c.quadraticCurveTo(len * .5, wid, 0, 0);
    c.fillStyle = fill; c.fill();
    if (rib) { c.strokeStyle = 'rgba(255,255,255,.14)'; c.lineWidth = Math.max(1, wid * .08); c.beginPath(); c.moveTo(len * .08, 0); c.lineTo(len * .9, 0); c.stroke(); }
    c.restore();
  }
  // A cloud of leaves; lighter towards the top-left, like light falling on a bush.
  function foliage(c, R, cx, cy, rx, ry, n, hue, light, size, sat = 45) {
    for (let i = 0; i < n; i++) {
      const a = R() * TAU, d = Math.sqrt(R()), x = cx + Math.cos(a) * rx * d, y = cy + Math.sin(a) * ry * d;
      const l = light + (R() - .5) * 12 - (y - cy) / ry * 6 - (x - cx) / rx * 3;
      leaf(c, x, y, size * (.6 + R() * .6), size * (.2 + R() * .1), R() * TAU, `hsl(${hue + (R() - .5) * 18},${sat + R() * 15}%,${l}%)`, false);
    }
  }
  function blossom(c, x, y, r, col, mid = '#fff', rot = 0, petals = 5, flat = false) {
    c.save(); c.translate(x, y); c.rotate(rot);
    for (let i = 0; i < petals; i++) {
      c.rotate(TAU / petals);
      if (flat) c.fillStyle = col;
      else { const g = c.createRadialGradient(0, -r * .2, 0, 0, -r * .5, r * .7); g.addColorStop(0, mid); g.addColorStop(1, col); c.fillStyle = g; }
      c.beginPath(); c.ellipse(0, -r * .52, r * .36, r * .55, 0, 0, TAU); c.fill();
    }
    c.beginPath(); c.arc(0, 0, r * .2, 0, TAU); c.fillStyle = '#f7cf5a'; c.fill();
    c.restore();
  }
  function lotus(c, x, y, s, open = 1) {
    c.save(); c.translate(x, y);
    const grad = l => { const g = c.createLinearGradient(0, 0, 0, -s * l); g.addColorStop(0, '#fde7ef'); g.addColorStop(.55, '#f48fb1'); g.addColorStop(1, '#d81b60'); return g; };
    const petal = (ang, len, wid) => {
      c.save(); c.rotate(ang); c.beginPath(); c.moveTo(0, 0);
      c.bezierCurveTo(wid, -len * .35, wid * .6, -len * .8, 0, -len); c.bezierCurveTo(-wid * .6, -len * .8, -wid, -len * .35, 0, 0);
      c.fillStyle = grad(len / s); c.fill(); c.strokeStyle = 'rgba(160,30,80,.25)'; c.lineWidth = Math.max(1, s * .012); c.stroke(); c.restore();
    };
    const k = .55 * open + .3;
    [-1.3, 1.3].forEach(a => petal(a * k, s * .62, s * .26));
    [-.9, .9].forEach(a => petal(a * k, s * .78, s * .28));
    [-.45, .45].forEach(a => petal(a * k, s * .9, s * .3));
    petal(0, s, s * .32);
    c.restore();
  }
  function lotusPad(c, x, y, rx, ry, rot = 0) {
    c.save(); c.translate(x, y); c.rotate(rot);
    const g = c.createRadialGradient(0, 0, 0, 0, 0, rx); g.addColorStop(0, '#5d9a52'); g.addColorStop(1, '#2f6a3a');
    c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, rx, ry, 0, .25, TAU - .05); c.lineTo(0, 0); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(200,240,170,.25)'; c.lineWidth = 2;
    for (let i = 0; i < 9; i++) { const a = .4 + i / 8 * (TAU - .6); c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * rx * .9, Math.sin(a) * ry * .9); c.stroke(); }
    c.restore();
  }
  function feather(c, x, y, len, ang, eye = len * .13) {
    c.save(); c.translate(x, y); c.rotate(ang);
    const g = c.createLinearGradient(0, 0, len, 0); g.addColorStop(0, 'rgba(120,150,60,0)'); g.addColorStop(.35, 'rgba(110,150,55,.8)'); g.addColorStop(1, 'rgba(60,110,45,.95)');
    c.fillStyle = g; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(len * .62, -len * .17, len * 1.03, 0); c.quadraticCurveTo(len * .62, len * .17, 0, 0); c.fill();
    c.strokeStyle = 'rgba(200,230,130,.35)'; c.lineWidth = Math.max(1, len * .006);
    for (let i = 2; i < 15; i++) {
      const u = i / 15 * len, h = len * .13 * Math.sin(Math.PI * i / 15);
      c.beginPath(); c.moveTo(u, 0); c.lineTo(u + len * .06, -h); c.moveTo(u, 0); c.lineTo(u + len * .06, h); c.stroke();
    }
    c.strokeStyle = '#dcc57e'; c.lineWidth = Math.max(1.4, len * .012); c.beginPath(); c.moveTo(0, 0); c.lineTo(len * .98, 0); c.stroke();
    const ex = len * .83, r = eye;
    [[1, '#a6c23f'], [.8, '#c08a2a'], [.64, '#1fa08e'], [.48, '#1d5fbf'], [.27, '#0c1f4f']].forEach(([k, col]) => {
      c.beginPath(); c.ellipse(ex, 0, r * k * 1.3, r * k, 0, 0, TAU); c.fillStyle = col; c.fill();
    });
    c.restore();
  }
  // A peacock standing at (x, y) (its feet), `s` tall, facing right (dir 1) or left (dir -1). Its train trails
  // along the ground behind it, or hangs straight down (`hang`) when it sits on a pillar.
  function peacock(c, x, y, s, dir = 1, seed = 7, hang = false) {
    const R = rng(seed);
    c.save(); c.translate(x, y); c.scale(dir, 1);
    const hx = -s * .04, hy = -s * .26, n = 30;
    const tg = c.createLinearGradient(hx, hy, hx + (hang ? 0 : -s * 1.8), hy + (hang ? s * 1.4 : s * .2));
    tg.addColorStop(0, '#1d4f2a'); tg.addColorStop(1, 'rgba(40,90,40,0)');
    c.fillStyle = tg; c.beginPath(); c.moveTo(hx, hy - s * .05);
    if (hang) { c.quadraticCurveTo(hx - s * .5, hy + s * .6, hx - s * .55, hy + s * 1.4); c.lineTo(hx + s * .2, hy + s * 1.4); }
    else { c.quadraticCurveTo(hx - s, hy - s * .12, hx - s * 1.9, hy + s * .1); c.lineTo(hx - s * 1.7, hy + s * .3); }
    c.closePath(); c.fill();
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1), a = hang ? Math.PI / 2 - .12 + u * .5 : Math.PI - .02 - u * .26;
      feather(c, hx, hy, s * (hang ? 1.05 + R() * .35 : 1.4 + R() * .5 + Math.sin(u * Math.PI) * .25), a + (R() - .5) * .05, s * (.07 + R() * .025));
    }
    c.strokeStyle = '#8a7a66'; c.lineWidth = s * .025; c.lineCap = 'round';
    c.beginPath(); c.moveTo(s * .08, -s * .2); c.lineTo(s * .06, 0); c.moveTo(s * .18, -s * .2); c.lineTo(s * .21, 0); c.stroke();
    const bg = c.createRadialGradient(s * .18, -s * .38, s * .02, s * .12, -s * .3, s * .32);
    bg.addColorStop(0, '#3a8ae6'); bg.addColorStop(.6, '#1747a6'); bg.addColorStop(1, '#0b2466');
    c.fillStyle = bg; c.beginPath(); c.ellipse(s * .12, -s * .31, s * .27, s * .16, -.3, 0, TAU); c.fill();
    c.save(); c.beginPath(); c.ellipse(s * .03, -s * .29, s * .19, s * .1, -.22, 0, TAU); c.clip();
    c.fillStyle = '#b8935c'; c.fillRect(-s * .2, -s * .45, s * .5, s * .3);
    c.strokeStyle = 'rgba(70,45,20,.55)'; c.lineWidth = s * .012;
    for (let k = -6; k < 9; k++) { c.beginPath(); c.moveTo(-s * .15 + k * s * .03, -s * .45); c.lineTo(-s * .2 + k * s * .03, -s * .15); c.stroke(); }
    c.restore();
    const ng = c.createLinearGradient(s * .2, -s * .8, s * .3, -s * .35); ng.addColorStop(0, '#1e88e5'); ng.addColorStop(1, '#0d47a1');
    c.fillStyle = ng; c.beginPath();
    c.moveTo(s * .33, -s * .38); c.bezierCurveTo(s * .42, -s * .5, s * .31, -s * .63, s * .38, -s * .76);
    c.lineTo(s * .29, -s * .8); c.bezierCurveTo(s * .21, -s * .67, s * .27, -s * .53, s * .14, -s * .43); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(130,205,255,.4)'; c.lineWidth = s * .01;
    c.beginPath(); c.moveTo(s * .35, -s * .42); c.bezierCurveTo(s * .4, -s * .53, s * .32, -s * .64, s * .37, -s * .74); c.stroke();
    c.beginPath(); c.ellipse(s * .345, -s * .8, s * .058, s * .047, -.2, 0, TAU); c.fillStyle = '#1565c0'; c.fill();
    c.fillStyle = '#9e9e8a'; c.beginPath(); c.moveTo(s * .395, -s * .815); c.lineTo(s * .465, -s * .795); c.lineTo(s * .395, -s * .78); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.ellipse(s * .355, -s * .807, s * .024, s * .009, -.2, 0, TAU); c.fill();
    c.fillStyle = '#111'; c.beginPath(); c.arc(s * .36, -s * .806, s * .008, 0, TAU); c.fill();
    c.strokeStyle = '#3a5f2a'; c.lineWidth = s * .006;
    for (let k = 0; k < 5; k++) {
      const ex = s * (.3 + k * .02), ey = -s * (.93 + Math.sin(k / 4 * Math.PI) * .03);
      c.beginPath(); c.moveTo(s * .335, -s * .84); c.lineTo(ex, ey); c.stroke();
      c.beginPath(); c.arc(ex, ey, s * .012, 0, TAU); c.fillStyle = '#1e88e5'; c.fill();
    }
    c.restore();
  }
  function stoneGrad(c, x0, x1, tone, shade) {
    const g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, shade); g.addColorStop(.45, tone); g.addColorStop(1, shade); return g;
  }
  function chhatri(c, x, y, s, tone = '#efe2c4', shade = '#c9b48a') {
    c.save(); c.translate(x, y);
    const block = (x0, y0, w, h) => { c.fillStyle = stoneGrad(c, x0, x0 + w, tone, shade); c.fillRect(x0, y0, w, h); };
    block(-s * .5, -s * .08, s, s * .08);
    block(-s * .44, -s * .13, s * .88, s * .05);
    for (const px of [-.38, -.13, .13, .38]) block(px * s - s * .03, -s * .6, s * .06, s * .47);
    c.fillStyle = 'rgba(70,55,30,.2)';
    for (const [a, b] of [[-.35, -.16], [-.1, .1], [.16, .35]]) {
      c.beginPath(); c.moveTo(a * s, -s * .13); c.lineTo(a * s, -s * .45); c.quadraticCurveTo((a + b) / 2 * s, -s * .6, b * s, -s * .45); c.lineTo(b * s, -s * .13); c.fill();
    }
    block(-s * .46, -s * .68, s * .92, s * .08);
    c.fillStyle = shade; c.beginPath(); c.moveTo(-s * .54, -s * .68); c.lineTo(s * .54, -s * .68); c.lineTo(s * .46, -s * .61); c.lineTo(-s * .46, -s * .61); c.fill();
    const g = c.createRadialGradient(-s * .12, -s * .95, s * .02, 0, -s * .8, s * .45); g.addColorStop(0, '#fffaf0'); g.addColorStop(1, shade);
    c.fillStyle = g; c.beginPath(); c.moveTo(-s * .37, -s * .68);
    c.bezierCurveTo(-s * .4, -s * .95, -s * .1, -s * 1.02, 0, -s * 1.12); c.bezierCurveTo(s * .1, -s * 1.02, s * .4, -s * .95, s * .37, -s * .68); c.fill();
    c.fillStyle = '#c9a24a'; c.fillRect(-s * .012, -s * 1.24, s * .024, s * .13); c.beginPath(); c.arc(0, -s * 1.16, s * .03, 0, TAU); c.fill();
    c.restore();
  }
  function rabbit(c, x, y, s, dir = 1) {
    c.save(); c.translate(x, y); c.scale(dir, 1);
    c.fillStyle = 'rgba(30,40,10,.18)'; c.beginPath(); c.ellipse(0, 0, s * .55, s * .08, 0, 0, TAU); c.fill();
    const g = c.createRadialGradient(-s * .1, -s * .4, s * .05, 0, -s * .25, s * .55); g.addColorStop(0, '#fff'); g.addColorStop(1, '#d9d2c6');
    c.fillStyle = g;
    c.beginPath(); c.ellipse(-s * .05, -s * .25, s * .38, s * .27, 0, 0, TAU); c.fill();
    c.beginPath(); c.ellipse(s * .3, -s * .48, s * .17, s * .15, 0, 0, TAU); c.fill();
    for (const [ex, a] of [[.24, -.3], [.36, .05]]) {
      c.save(); c.translate(s * ex, -s * .6); c.rotate(a);
      c.fillStyle = g; c.beginPath(); c.ellipse(0, -s * .18, s * .055, s * .2, 0, 0, TAU); c.fill();
      c.fillStyle = '#f3c1c8'; c.beginPath(); c.ellipse(0, -s * .18, s * .025, s * .14, 0, 0, TAU); c.fill();
      c.restore();
    }
    c.fillStyle = '#3a2a2a'; c.beginPath(); c.arc(s * .38, -s * .5, s * .022, 0, TAU); c.fill();
    c.fillStyle = '#f3a7b5'; c.beginPath(); c.arc(s * .46, -s * .45, s * .02, 0, TAU); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(-s * .42, -s * .26, s * .08, 0, TAU); c.fill();
    c.restore();
  }
  function butterfly(c, x, y, s, flap, col) {
    c.save(); c.translate(x, y);
    for (const d of [-1, 1]) {
      c.save(); c.scale(d * Math.max(.15, Math.abs(Math.cos(flap))), 1); c.fillStyle = col;
      c.beginPath(); c.ellipse(s * .5, -s * .3, s * .5, s * .36, -.4, 0, TAU); c.fill();
      c.beginPath(); c.ellipse(s * .38, s * .24, s * .3, s * .24, .5, 0, TAU); c.fill();
      c.restore();
    }
    c.fillStyle = '#3a2a2a'; c.fillRect(-s * .04, -s * .4, s * .08, s * .8);
    c.restore();
  }
  function bell(c, x, y, s) {
    const g = c.createLinearGradient(x - s * .5, 0, x + s * .5, 0); g.addColorStop(0, '#8a5a12'); g.addColorStop(.45, '#f6d77d'); g.addColorStop(1, '#9a6a1a');
    c.fillStyle = g; c.beginPath(); c.moveTo(x - s * .22, y);
    c.quadraticCurveTo(x - s * .45, y + s * .2, x - s * .5, y + s * .85); c.lineTo(x + s * .5, y + s * .85); c.quadraticCurveTo(x + s * .45, y + s * .2, x + s * .22, y); c.closePath(); c.fill();
    c.beginPath(); c.arc(x, y + s * .95, s * .12, 0, TAU); c.fill();
  }
  function diya(c, x, y, s, t = 0) {
    const fl = 1 + Math.sin(t * 9 + x) * .06 + Math.sin(t * 13.7 + y) * .04;
    const g = c.createRadialGradient(x, y - s * .5, 0, x, y - s * .5, s * 1.7 * fl);
    g.addColorStop(0, 'rgba(255,190,90,.5)'); g.addColorStop(1, 'rgba(255,150,50,0)');
    c.fillStyle = g; c.beginPath(); c.arc(x, y - s * .5, s * 1.7 * fl, 0, TAU); c.fill();
    const b = c.createLinearGradient(x, y - s * .2, x, y + s * .3); b.addColorStop(0, '#e39a52'); b.addColorStop(1, '#7a3a12');
    c.fillStyle = b; c.beginPath(); c.ellipse(x, y - s * .14, s * .62, s * .4, 0, 0, Math.PI); c.fill();
    c.fillStyle = '#f3b26b'; c.beginPath(); c.ellipse(x, y - s * .14, s * .62, s * .09, 0, 0, TAU); c.fill();
    c.save(); c.translate(x, y - s * .2); c.scale(1 / fl, fl);
    const f = c.createLinearGradient(0, -s * .8, 0, 0); f.addColorStop(0, '#fff6d0'); f.addColorStop(.4, '#ffd060'); f.addColorStop(1, '#ff7a1a');
    c.fillStyle = f; c.beginPath(); c.moveTo(0, -s * .8); c.quadraticCurveTo(s * .24, -s * .25, 0, 0); c.quadraticCurveTo(-s * .24, -s * .25, 0, -s * .8); c.fill();
    c.restore();
  }
  function marigold(c, x, y, r, hue) {
    const g = c.createRadialGradient(x - r * .3, y - r * .3, r * .1, x, y, r);
    g.addColorStop(0, `hsl(${hue},100%,72%)`); g.addColorStop(.7, `hsl(${hue},100%,52%)`); g.addColorStop(1, `hsl(${hue - 8},95%,34%)`);
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    c.strokeStyle = `hsla(${hue - 12},90%,28%,.45)`; c.lineWidth = Math.max(1, r * .07);
    for (let i = 0; i < 7; i++) { const a = i / 7 * TAU; c.beginPath(); c.arc(x + Math.cos(a) * r * .45, y + Math.sin(a) * r * .45, r * .36, a + 2, a + 4.2); c.stroke(); }
  }
  function mandala(c, x, y, r, col, rot = 0) {
    c.save(); c.translate(x, y); c.rotate(rot); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = Math.max(1.2, r * .006);
    for (const [rr, n, pl] of [[.3, 10, .22], [.52, 16, .2], [.74, 24, .18], [.94, 32, .1]]) {
      const b = rr * r * .82;
      c.beginPath(); c.arc(0, 0, b, 0, TAU); c.stroke();
      for (let i = 0; i < n; i++) {
        c.save(); c.rotate(i / n * TAU); c.beginPath(); c.moveTo(0, -b);
        c.quadraticCurveTo(rr * r * pl * .6, -b - rr * r * pl / 2, 0, -b - rr * r * pl); c.quadraticCurveTo(-rr * r * pl * .6, -b - rr * r * pl / 2, 0, -b); c.stroke(); c.restore();
      }
    }
    c.restore();
  }
  function rangoli(c, x, y, r) {
    c.save(); c.translate(x, y);
    [[1, 16, '#e91e63'], [.82, 16, '#ff9800'], [.64, 12, '#ffd54f'], [.46, 12, '#43a047'], [.3, 8, '#29b6f6']].forEach(([k, n, col], j) => {
      for (let i = 0; i < n; i++) {
        c.save(); c.rotate(i / n * TAU + j * .2); c.beginPath(); c.moveTo(0, -r * k * .4);
        c.quadraticCurveTo(r * k * .24, -r * k * .75, 0, -r * k); c.quadraticCurveTo(-r * k * .24, -r * k * .75, 0, -r * k * .4); c.fillStyle = col; c.fill(); c.restore();
      }
    });
    c.fillStyle = '#fff';
    for (let i = 0; i < 28; i++) { const a = i / 28 * TAU; c.beginPath(); c.arc(Math.cos(a) * r * 1.06, Math.sin(a) * r * 1.06, r * .025, 0, TAU); c.fill(); }
    c.beginPath(); c.arc(0, 0, r * .14, 0, TAU); c.fillStyle = '#ffeb3b'; c.fill();
    c.restore();
  }
  function rose(c, x, y, r, light, dark, rot = 0) {
    c.save(); c.translate(x, y); c.rotate(rot);
    for (let ring = 0; ring < 4; ring++) {
      const k = 1 - ring * .22, n = 6 - ring % 2;
      for (let i = 0; i < n; i++) {
        c.save(); c.rotate(i / n * TAU + ring * .5);
        const g = c.createRadialGradient(0, -r * k * .55, 0, 0, -r * k * .3, r * k * .6); g.addColorStop(0, light); g.addColorStop(1, dark);
        c.fillStyle = g; c.beginPath(); c.ellipse(0, -r * k * .42, r * k * .42, r * k * .5, 0, 0, TAU); c.fill();
        c.strokeStyle = 'rgba(120,40,70,.12)'; c.lineWidth = 1.5; c.stroke();
        c.restore();
      }
    }
    c.strokeStyle = 'rgba(120,40,70,.3)'; c.lineWidth = r * .025; c.beginPath();
    for (let a = 0; a < 12; a += .2) { const rr = r * .02 * a; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    c.stroke(); c.restore();
  }
  function eucalyptus(c, x, y, len, ang, col = '#9fb8a2') {
    c.save(); c.translate(x, y); c.rotate(ang);
    c.strokeStyle = '#7d8f6e'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(len * .5, -len * .08, len, 0); c.stroke();
    for (let i = 1; i < 8; i++) {
      const u = i / 8 * len, r = 22 - i * 1.6;
      for (const d of [-1, 1]) { c.fillStyle = i % 2 ? col : '#b6c9b4'; c.beginPath(); c.ellipse(u, d * r * .9 - len * .04 * Math.sin(i / 8 * Math.PI), r, r * .8, 0, 0, TAU); c.fill(); }
    }
    c.restore();
  }
  function rrect(c, x, y, w, h, r) {
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  // Points along a pointed (Mughal) arch from (l, spring) over the apex to (r, spring), evenly spaced.
  function archPts(l, r, spring, apex, n) {
    const cx = (l + r) / 2, hw = (r - l) / 2, dense = [], len = [0];
    for (let i = 0; i <= 240; i++) { const u = i / 120 - 1; dense.push([cx + u * hw, spring - (spring - apex) * Math.pow(1 - Math.abs(u), .55)]); }
    for (let i = 1; i < dense.length; i++) len.push(len[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]));
    const out = [];
    for (let k = 0, j = 0; k <= n; k++) {
      const goal = len[len.length - 1] * k / n;
      while (j < len.length - 2 && len[j + 1] < goal) j++;
      const f = (goal - len[j]) / ((len[j + 1] - len[j]) || 1);
      out.push([dense[j][0] + (dense[j + 1][0] - dense[j][0]) * f, dense[j][1] + (dense[j + 1][1] - dense[j][1]) * f]);
    }
    return out;
  }
  // The arch opening as a path: scalloped (multifoil) when `lobes` is given.
  function archPath(c, l, r, spring, apex, bottom, lobes) {
    const P = archPts(l, r, spring, apex, lobes || 80), cx = (l + r) / 2;
    c.moveTo(l, bottom); c.lineTo(l, spring);
    for (let i = 1; i < P.length; i++) {
      if (!lobes) { c.lineTo(P[i][0], P[i][1]); continue; }
      const [x0, y0] = P[i - 1], [x1, y1] = P[i], mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
      const nx = mx - cx, ny = my - spring, nl = Math.hypot(nx, ny) || 1, seg = Math.hypot(x1 - x0, y1 - y0);
      c.quadraticCurveTo(mx + nx / nl * seg * .5, my + ny / nl * seg * .5, x1, y1);
    }
    c.lineTo(r, bottom); c.closePath();
  }
  function sky(c, stops, y0 = 0, y1 = H) {
    const g = c.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, col]) => g.addColorStop(o, col)); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0);
  }
  function glow(c, x, y, r, col) {
    const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, col.replace(/[\d.]+\)$/, '0)'));
    c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // A garland hanging from the top, swaying.
  function vine(c, x, y, len, sway, col, i0 = 0) {
    const pts = [];
    for (let i = 0; i <= 12; i++) { const u = i / 12; pts.push([x + Math.sin(u * 2.4 + i0) * 12 + sway * u * u * len * .14, y + u * len]); }
    c.strokeStyle = '#4d6b2f'; c.lineWidth = 3; c.beginPath(); pts.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.stroke();
    pts.forEach(([px, py], i) => {
      if (!i) return;
      leaf(c, px, py, 30, 10, (i % 2 ? .7 : -.7) + Math.PI / 2 + sway * .2, i % 3 ? '#5f8a3a' : '#7aa04a', false);
      if (i % 3 === 0 || i === 12) blossom(c, px, py, i === 12 ? 22 : 16, col, '#fff', i + i0, 5, true);
    });
  }

  // ---------- Moving things (stateless: the frame at any time t is the same, so the preview can jump) ----------
  function petals(c, t, n, cols, seed, size = 1) {
    const R = rng(seed);
    for (let i = 0; i < n; i++) {
      const x0 = R() * W, y0 = R() * H, sp = 50 + R() * 70, sz = (9 + R() * 12) * size, ph = R() * TAU, rs = (R() - .5) * 2;
      const y = ((y0 + t * sp) % (H + 120)) - 60, x = x0 + Math.sin(t * .8 + ph) * 46;
      c.save(); c.translate(x, y); c.rotate(ph + t * rs); c.scale(1, Math.abs(Math.cos(t * 1.4 + ph)) * .6 + .4);
      c.fillStyle = cols[i % cols.length]; c.globalAlpha = .88;
      c.beginPath(); c.moveTo(0, -sz); c.quadraticCurveTo(sz * .9, 0, 0, sz * .7); c.quadraticCurveTo(-sz * .9, 0, 0, -sz); c.fill();
      c.restore();
    }
  }
  function motes(c, t, n, col, seed, rise = 12) {
    const R = rng(seed);
    for (let i = 0; i < n; i++) {
      const x = R() * W + Math.sin(t * .4 + i) * 30, y = ((R() * H - t * rise * (.5 + R())) % H + H) % H, r = 3 + R() * 6;
      const a = .35 + .65 * Math.abs(Math.sin(t * (.8 + R()) + i));
      glow(c, x, y, r * 4, col.replace('A', (a * .6).toFixed(2)));
    }
  }
  function sparks(c, t, n, col, seed) {
    const R = rng(seed);
    for (let i = 0; i < n; i++) {
      const x = R() * W, y = R() * H, s = 6 + R() * 12, a = Math.max(0, Math.sin(t * (1 + R() * 1.5) + R() * TAU));
      if (a < .05) continue;
      c.save(); c.translate(x, y); c.globalAlpha = a; c.fillStyle = col; c.beginPath();
      c.moveTo(0, -s); c.quadraticCurveTo(0, 0, s, 0); c.quadraticCurveTo(0, 0, 0, s); c.quadraticCurveTo(0, 0, -s, 0); c.quadraticCurveTo(0, 0, 0, -s); c.fill();
      c.restore();
    }
  }

  // ---------- The six looks ----------
  const LOOKS = {
    vrindavan: {
      name: 'Vrindavan Garden', note: 'Forest light, peacock, flute & feather',
      col: { names: '#b0285e', ink: '#3b3016', ink2: '#5a4a28', accent: '#2f6b3a', gold: '#b8862b' },
      mono: [['#f28bb2', '#c2185b'], ['#3a6fd8', '#14306e']],
      font: { script: 'Parisienne', serif: 'Marcellus' }, zone: [400, 1440, 820], shadow: ['rgba(255,252,235,.9)', 14], music: 'romantic',
      back(c, R) {
        sky(c, [[0, '#fbf6d8'], [.3, '#eef1c8'], [.62, '#b4cb8c'], [1, '#5f7f3e']]);
        for (const [y, l, n] of [[1150, 62, 500], [1250, 55, 500]]) {
          foliage(c, R, 540, y, 640, 150, n, 95, l, 40);
          c.fillStyle = 'rgba(240,242,212,.5)'; c.fillRect(0, y - 200, W, 420);
        }
        chhatri(c, 840, 1520, 290);
        c.fillStyle = 'rgba(240,242,215,.25)'; c.fillRect(680, 1150, 330, 380);
        for (const x of [70, 1010]) {
          const g = c.createLinearGradient(x - 50, 0, x + 50, 0); g.addColorStop(0, '#3e2a16'); g.addColorStop(.5, '#7a5a34'); g.addColorStop(1, '#3a2612');
          c.fillStyle = g; c.beginPath(); c.moveTo(x - 38, 0); c.lineTo(x + 38, 0); c.lineTo(x + 60, 1560); c.lineTo(x - 60, 1560); c.fill();
        }
        for (const [cx, cy] of [[60, 700], [1020, 760]]) foliage(c, R, cx, cy, 220, 520, 700, 105, 34, 46);
        for (const [cx, cy] of [[120, 120], [960, 110]]) {
          foliage(c, R, cx, cy, 380, 300, 900, 100, 30, 52);
          for (let i = 0; i < 26; i++) blossom(c, cx + (R() - .5) * 600, cy + (R() - .3) * 380, 16 + R() * 16, R() > .5 ? '#ec6f9c' : '#f7a8c4', '#fff', R() * 6);
        }
        const mg = c.createLinearGradient(0, 1480, 0, H); mg.addColorStop(0, '#a6c472'); mg.addColorStop(1, '#4f7d33');
        c.fillStyle = mg; c.beginPath(); c.moveTo(0, 1570); c.quadraticCurveTo(540, 1470, W, 1570); c.lineTo(W, H); c.lineTo(0, H); c.fill();
        c.lineWidth = 2.2;
        for (let i = 0; i < 900; i++) {
          const x = R() * W, y = 1540 + R() * 400, h = 14 + R() * 26;
          c.strokeStyle = `hsl(${90 + R() * 30},${40 + R() * 20}%,${30 + R() * 25}%)`;
          c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + (R() - .5) * 10, y - h * .6, x + (R() - .5) * 14, y - h); c.stroke();
        }
        glow(c, 540, 860, 600, 'rgba(255,252,232,.82)');
        for (let i = 0; i < 70; i++) {
          const left = i % 2, x = left ? R() * 300 : W - R() * 360, y = (left ? 1830 : 1720) + R() * (left ? 90 : 200);
          if (R() > .4) blossom(c, x, y, 20 + R() * 18, R() > .5 ? '#ec5f92' : '#f8a5c2', '#fff', R() * 6);
          else { c.fillStyle = '#9b7ad8'; for (let k = 0; k < 6; k++) { c.beginPath(); c.ellipse(x, y - k * 9, 4, 5, 0, 0, TAU); c.fill(); } }
        }
        peacock(c, 400, 1790, 300, 1);
        rabbit(c, 640, 1740, 74);
        rabbit(c, 740, 1765, 64, -1);
      },
      anim(c, t) {
        c.save(); c.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 6; i++) {
          const a = -.5 + i * .2 + Math.sin(t * .2 + i) * .03, alpha = .05 + .03 * Math.sin(t * .7 + i * 1.7);
          c.save(); c.translate(540, -120); c.rotate(a);
          const g = c.createLinearGradient(0, 0, 0, 1700); g.addColorStop(0, `rgba(255,248,210,${alpha * 2})`); g.addColorStop(1, 'rgba(255,248,210,0)');
          c.fillStyle = g; c.beginPath(); c.moveTo(-20, 0); c.lineTo(20, 0); c.lineTo(110, 1700); c.lineTo(-110, 1700); c.fill(); c.restore();
        }
        c.restore();
        [[140, 320], [230, 260], [330, 200], [760, 210], [860, 270], [950, 330]].forEach(([x, len], i) => vine(c, x, 60, len, Math.sin(t * 1.1 + i), '#ec6f9c', i));
        butterfly(c, 300 + Math.sin(t * .5) * 140, 1300 + Math.sin(t * .9) * 90, 34, t * 9, '#f6a821');
        butterfly(c, 820 + Math.cos(t * .45) * 110, 1150 + Math.sin(t * .7 + 1) * 80, 28, t * 10 + 1, '#7ab6ff');
      },
      fx(c, t) { petals(c, t, 18, ['#f48fb1', '#ec6f9c', '#fbc4d8'], 11); motes(c, t, 14, 'rgba(255,250,200,A)', 3); },
      crest(c, x, y, t) {
        const s = 520;
        c.save(); c.translate(x, y + 170);
        feather(c, -s * .34, 0, s * .44, -Math.PI * .7 + Math.sin(t * 1.3) * .03);
        const g = c.createLinearGradient(0, -s * .03, 0, s * .03); g.addColorStop(0, '#f6da8f'); g.addColorStop(.5, '#c98f2e'); g.addColorStop(1, '#7a5214');
        c.fillStyle = g; rrect(c, -s * .5, -s * .022, s, s * .044, s * .022); c.fill();
        c.fillStyle = '#4a2f0e'; for (let i = 0; i < 7; i++) { c.beginPath(); c.ellipse(-s * .06 + i * s * .065, 0, s * .009, s * .007, 0, 0, TAU); c.fill(); }
        c.fillStyle = '#e8c35a'; for (const bx of [-.43, -.31, .37]) c.fillRect(bx * s, -s * .024, s * .012, s * .048);
        for (const [bx, ph] of [[-.47, 0], [.47, 1.3]]) {
          c.save(); c.translate(bx * s, s * .02); c.rotate(Math.sin(t * 2.2 + ph) * .12);
          c.strokeStyle = '#b8862b'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, s * .06); c.stroke(); bell(c, 0, s * .06, s * .055); c.restore();
        }
        blossom(c, s * .5, -s * .01, 20, '#ec6f9c', '#fff', 0);
        c.restore();
      }
    },

    jharokha: {
      name: 'Royal Jharokha', note: 'Carved arch, peacocks, lotus urli',
      col: { names: '#c8436e', ink: '#2c4529', ink2: '#4c5b3a', accent: '#2f6b3a', gold: '#b88a2e' },
      mono: [['#f08aab', '#c2185b'], ['#46a06a', '#1f5a3a']],
      font: { script: 'Great Vibes', serif: 'Marcellus' }, zone: [450, 1380, 600], shadow: ['rgba(255,252,235,.9)', 12], music: 'royal',
      back(c, R) {
        const l = 200, r = 880, spring = 760, apex = 290;
        sky(c, [[0, '#f7f4e0'], [.45, '#e6edcc'], [.75, '#bdd29b'], [1, '#93b273']]);
        foliage(c, R, 540, 1240, 420, 130, 500, 98, 56, 36);
        c.fillStyle = 'rgba(244,244,222,.55)'; c.fillRect(0, 1050, W, 330);
        chhatri(c, 720, 1420, 210); chhatri(c, 380, 1430, 160);
        c.fillStyle = '#ece0c0'; c.fillRect(0, 1430, W, 20);
        for (let x = 210; x < 880; x += 26) { c.fillStyle = stoneGrad(c, x, x + 14, '#f3e8cc', '#cdb98f'); rrect(c, x, 1450, 14, 50, 6); c.fill(); }
        c.fillStyle = '#e4d6b2'; c.fillRect(0, 1500, W, 16);
        glow(c, 540, 900, 460, 'rgba(255,253,240,.85)');
        c.save(); c.beginPath(); archPath(c, l, r, spring, apex, H + 10, 9); c.clip();
        c.shadowColor = 'rgba(70,50,15,.5)'; c.shadowBlur = 50;
        c.beginPath(); c.rect(-200, -200, W + 400, H + 400); archPath(c, l, r, spring, apex, H + 10, 9); c.fillStyle = '#000'; c.fill('evenodd');
        c.restore();
        c.save(); c.beginPath(); c.rect(0, 0, W, H); archPath(c, l, r, spring, apex, H + 10, 9); c.clip('evenodd');
        const sg = c.createLinearGradient(0, 0, W, 0); sg.addColorStop(0, '#d5c196'); sg.addColorStop(.2, '#efe2c4'); sg.addColorStop(.8, '#efe2c4'); sg.addColorStop(1, '#d1bc8f');
        c.fillStyle = sg; c.fillRect(0, 0, W, H);
        c.strokeStyle = 'rgba(150,115,60,.22)'; c.lineWidth = 2;
        for (let y = 230; y < spring; y += 44) for (let x = (y / 44 % 2) * 22; x < W; x += 44) { c.beginPath(); c.moveTo(x, y - 14); c.lineTo(x + 14, y); c.lineTo(x, y + 14); c.lineTo(x - 14, y); c.closePath(); c.stroke(); }
        for (const x0 of [30, 930]) {
          c.fillStyle = 'rgba(255,250,235,.35)'; c.fillRect(x0, 820, 120, H);
          c.strokeStyle = 'rgba(140,105,50,.45)'; c.lineWidth = 3; c.strokeRect(x0 + 10, 830, 100, H);
          for (let y = 900; y < H; y += 120) blossom(c, x0 + 60, y, 30, 'rgba(170,135,80,.55)', 'rgba(250,240,215,.8)', 0, 8);
        }
        c.fillStyle = 'rgba(150,115,60,.35)'; c.fillRect(0, 150, W, 6); c.fillRect(0, 196, W, 3);
        for (let x = 0; x < W; x += 54) { c.beginPath(); c.moveTo(x, 150); c.quadraticCurveTo(x + 27, 100, x + 54, 150); c.fillStyle = 'rgba(170,135,80,.3)'; c.fill(); }
        c.restore();
        c.beginPath(); archPath(c, l - 34, r + 34, spring, apex - 46, H + 10, 0);
        c.strokeStyle = 'rgba(140,105,50,.6)'; c.lineWidth = 5; c.stroke();
        c.beginPath(); archPath(c, l - 60, r + 60, spring, apex - 84, H + 10, 0); c.strokeStyle = 'rgba(140,105,50,.35)'; c.lineWidth = 3; c.stroke();
        archPts(l - 47, r + 47, spring, apex - 65, 22).forEach(([x, y], i) => blossom(c, x, y, 13, 'rgba(160,120,60,.7)', 'rgba(250,240,215,.9)', i, 6));
        c.beginPath(); archPath(c, l, r, spring, apex, H + 10, 9); c.strokeStyle = 'rgba(120,88,36,.6)'; c.lineWidth = 4; c.stroke();
        for (const [x0, dir] of [[20, 1], [840, -1]]) {
          c.fillStyle = stoneGrad(c, x0, x0 + 220, '#f1e5c9', '#bfa878'); c.fillRect(x0, 1600, 220, H - 1600);
          c.fillStyle = stoneGrad(c, x0 - 14, x0 + 234, '#f6ecd4', '#c4ad7e'); c.fillRect(x0 - 14, 1580, 248, 30);
          c.strokeStyle = 'rgba(140,105,50,.4)'; c.lineWidth = 3; c.strokeRect(x0 + 24, 1640, 172, 240);
          blossom(c, x0 + 110, 1760, 46, 'rgba(170,135,80,.6)', 'rgba(250,240,215,.85)', 0, 8);
          peacock(c, x0 + (dir > 0 ? 80 : 140), 1582, 330, dir, dir > 0 ? 3 : 5, true);
        }
        const ux = 540, uy = 1690, w = 330;
        const gold = (x0, x1) => { const g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, '#80520f'); g.addColorStop(.35, '#f5d47c'); g.addColorStop(.62, '#c48a2a'); g.addColorStop(1, '#6e440c'); return g; };
        c.fillStyle = gold(ux - 80, ux + 80); c.beginPath(); c.moveTo(ux - 34, uy + 40); c.lineTo(ux + 34, uy + 40); c.lineTo(ux + 80, H); c.lineTo(ux - 80, H); c.fill();
        for (const [yy, rw] of [[uy + 70, 50], [uy + 150, 66]]) { c.fillStyle = gold(ux - rw, ux + rw); c.beginPath(); c.ellipse(ux, yy, rw, 14, 0, 0, TAU); c.fill(); }
        c.fillStyle = gold(ux - w / 2, ux + w / 2); c.beginPath(); c.ellipse(ux, uy, w / 2, w * .2, 0, 0, Math.PI); c.fill();
        for (let i = 0; i < 7; i++) { const bx = ux - w * .38 + i * w * .127; c.strokeStyle = '#a8742a'; c.lineWidth = 2; c.beginPath(); c.moveTo(bx, uy + w * .12); c.lineTo(bx, uy + w * .2); c.stroke(); bell(c, bx, uy + w * .2, 22); }
        for (let i = 0; i < 13; i++) {
          const a = Math.PI + i / 12 * Math.PI, px = ux + Math.cos(a) * w * .46, py = uy + Math.sin(a) * w * .07;
          c.save(); c.translate(px, py); c.rotate((i / 12 - .5) * 1.4); lotus(c, 0, 0, 46); c.restore();
        }
        c.fillStyle = '#f8f4ea'; c.beginPath(); c.ellipse(ux, uy, w * .44, w * .065, 0, 0, TAU); c.fill();
        c.strokeStyle = '#d9a83a'; c.lineWidth = 6; for (const dx of [-16, 16]) { c.beginPath(); c.ellipse(ux + dx, uy - 4, 24, 9, 0, 0, TAU); c.stroke(); }
        for (let i = 0; i < 60; i++) {
          const left = i % 2, x = left ? R() * 300 : W - R() * 300, y = 1780 + R() * 160;
          if (i % 5 === 0) lotus(c, x, y, 70 + R() * 30, .7 + R() * .3);
          else if (i % 5 === 1) leaf(c, x, y, 120, 40, -Math.PI / 2 + (R() - .5) * 1.4, '#4f8a3c');
          else blossom(c, x, y, 18 + R() * 14, R() > .5 ? '#ec5f92' : '#f8b3cb', '#fff', R() * 6);
        }
      },
      anim(c, t) {
        [[230, 360], [330, 260], [430, 190], [650, 190], [750, 260], [850, 360]].forEach(([x, len], i) => vine(c, x, 210, len, Math.sin(t * 1.1 + i * .8), '#f06a9a', i));
      },
      fx(c, t) { petals(c, t, 16, ['#f48fb1', '#f8bbd0', '#ec6f9c'], 21); sparks(c, t, 10, '#f3d27a', 9); },
      crest(c, x, y, t) {
        c.save(); mandala(c, x, y + 105, 120, 'rgba(184,138,46,.85)', t * .15); c.restore();
        c.font = '96px "Yatra One"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#c2185b'; c.fillText('ॐ', x, y + 110);
      }
    },

    lotusnight: {
      name: 'Lotus Night', note: 'Moonlit pond, floating diyas',
      col: { names: '#f7d58b', ink: '#f6eedc', ink2: '#d6caa8', accent: '#f4a9c6', gold: '#e9c46a' },
      mono: [['#fff1c1', '#d4a24c'], ['#fbd0e2', '#d96c9a']],
      font: { script: 'Pinyon Script', serif: 'Gilda Display' }, zone: [360, 1240, 860], shadow: ['rgba(3,8,25,.85)', 16], music: 'royal',
      back(c, R) {
        sky(c, [[0, '#060f26'], [.42, '#0f2850'], [.615, '#1f4474']], 0, 1180);
        for (let i = 0; i < 220; i++) { c.globalAlpha = .3 + R() * .7; c.fillStyle = '#fff'; c.beginPath(); c.arc(R() * W, R() * 1100, .8 + R() * 2, 0, TAU); c.fill(); }
        c.globalAlpha = 1;
        glow(c, 800, 290, 360, 'rgba(255,240,200,.28)');
        const mg = c.createRadialGradient(780, 270, 10, 800, 290, 78); mg.addColorStop(0, '#fffdf0'); mg.addColorStop(1, '#efdcaa');
        c.fillStyle = mg; c.beginPath(); c.arc(800, 290, 76, 0, TAU); c.fill();
        c.fillStyle = 'rgba(190,170,120,.25)'; [[780, 270, 14], [820, 305, 10], [790, 320, 7]].forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); });
        c.fillStyle = '#0b1d3a'; c.beginPath(); c.moveTo(0, 1180);
        for (let x = 0; x <= W; x += 60) c.lineTo(x, 1150 - Math.sin(x / 170) * 26 - R() * 10);
        c.lineTo(W, 1180); c.fill();
        c.fillStyle = '#081530'; c.beginPath(); c.moveTo(150, 1180); c.lineTo(150, 1110); c.lineTo(190, 1110);
        c.quadraticCurveTo(200, 1010, 240, 960); c.quadraticCurveTo(280, 1010, 290, 1110); c.lineTo(330, 1110); c.lineTo(330, 1180); c.fill();
        c.fillRect(236, 930, 8, 34);
        [[205, 1140], [240, 1060], [275, 1140]].forEach(([x, y]) => { glow(c, x, y, 26, 'rgba(255,200,110,.6)'); c.fillStyle = '#ffcf70'; c.fillRect(x - 5, y - 8, 10, 16); });
        sky(c, [[0, '#123766'], [.4, '#0b2347'], [1, '#050f24']], 1180, H);
        for (let i = 0; i < 60; i++) { const y = 1190 + i * 9, w = 120 - i * 1.2 + R() * 40; c.fillStyle = `rgba(255,236,180,${.35 - i * .005})`; c.fillRect(800 - w / 2 + (R() - .5) * 30, y, w, 3); }
        const pads = [];
        for (let i = 0; i < 26; i++) { const y = 1300 + R() * 600, k = (y - 1200) / 700; pads.push([R() * W, y, (60 + R() * 70) * k + 30]); }
        pads.sort((a, b) => a[1] - b[1]).forEach(([x, y, s], i) => {
          if (Math.abs(x - 540) < 200 && y < 1550) return;
          lotusPad(c, x, y, s, s * .32, (R() - .5) * .4);
          if (i % 3 === 0) { glow(c, x, y - s * .4, s * 1.2, 'rgba(255,140,190,.3)'); lotus(c, x, y - s * .05, s * .9, .8); }
        });
        glow(c, 540, 820, 560, 'rgba(4,10,30,.45)');
      },
      anim(c, t) {
        for (let i = 0; i < 40; i++) { const x = (i * 263) % W, y = (i * 97) % 1100, a = Math.max(0, Math.sin(t * 1.7 + i * 2.1)); c.fillStyle = `rgba(255,255,255,${a * .9})`; c.beginPath(); c.arc(x, y, 2.2, 0, TAU); c.fill(); }
        for (let i = 0; i < 6; i++) { const y = 1200 + i * 60, w = 140 - i * 12, dx = Math.sin(t * 2 + i) * 18; c.fillStyle = 'rgba(255,240,200,.18)'; c.fillRect(800 - w / 2 + dx, y, w, 3); }
        for (let i = 0; i < 5; i++) {
          const x = ((i * 260 + t * 16) % (W + 200)) - 100, y = 1360 + (i % 3) * 150 + Math.sin(t + i) * 8, s = 36 + (i % 3) * 14;
          if (Math.abs(x - 540) < 220 && y < 1560) continue;
          diya(c, x, y, s, t);
          c.fillStyle = 'rgba(255,190,90,.18)'; c.fillRect(x - s * .5, y + s * .3, s, 4);
        }
      },
      fx(c, t) { motes(c, t, 22, 'rgba(255,230,140,A)', 5, 18); },
      crest(c, x, y, t) { diya(c, x, y + 150, 110, t); }
    },

    marigold: {
      name: 'Marigold Mandap', note: 'Genda garlands, bells, rangoli',
      col: { names: '#ffd27a', ink: '#fff2dc', ink2: '#f5d3a6', accent: '#ffb347', gold: '#f2c14e' },
      mono: [['#ffe29a', '#f2a900'], ['#ffb38a', '#ff6a3c']],
      font: { script: 'Alex Brush', serif: 'Gilda Display' }, zone: [470, 1460, 760], shadow: ['rgba(40,0,8,.85)', 14], music: 'festive',
      back(c, R) {
        const g = c.createRadialGradient(540, 900, 50, 540, 900, 1200); g.addColorStop(0, '#951a2c'); g.addColorStop(.6, '#5c0b19'); g.addColorStop(1, '#2c040e');
        c.fillStyle = g; c.fillRect(0, 0, W, H);
        c.globalAlpha = .1; mandala(c, 540, 930, 600, '#f2c14e'); c.globalAlpha = 1;
        c.strokeStyle = 'rgba(242,193,78,.7)'; c.lineWidth = 3; c.strokeRect(40, 40, W - 80, H - 80); c.lineWidth = 1.5; c.strokeRect(56, 56, W - 112, H - 112);
        for (const [x, y] of [[56, 56], [W - 56, 56], [56, H - 56], [W - 56, H - 56]]) mandala(c, x, y, 70, 'rgba(242,193,78,.8)');
        for (const [x, top, n] of [[110, 120, 26], [180, 120, 18], [900, 120, 18], [970, 120, 26]]) {
          c.strokeStyle = '#3d6b22'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, top); c.lineTo(x, top + n * 32); c.stroke();
          for (let i = 0; i < n; i++) marigold(c, x, top + i * 32, 17, i % 2 ? 38 : 28);
          rose(c, x, top + n * 32 + 14, 22, '#ff5a6e', '#a80d2a');
        }
        for (const [y, sag, hue0] of [[110, 150, 28], [90, 90, 38]]) {
          for (let k = 0; k < 3; k++) {
            const x0 = k * W / 3, x1 = (k + 1) * W / 3;
            for (let i = 0; i <= 18; i++) { const u = i / 18, x = x0 + (x1 - x0) * u, yy = y + Math.sin(u * Math.PI) * sag; marigold(c, x, yy, 19, i % 2 ? hue0 : hue0 + 10); }
          }
        }
        c.fillStyle = '#7a4a1a'; c.fillRect(0, 34, W, 8);
        for (let x = 10; x < W; x += 36) { leaf(c, x, 42, 70, 18, Math.PI / 2 + (x % 72 ? .12 : -.12), x % 72 ? '#2e7d32' : '#4caf50'); if (x % 108 === 10) marigold(c, x + 18, 50, 14, 34); }
        rangoli(c, 540, 1880, 240);
      },
      anim(c, t) {
        for (const [x, n, ph] of [[110, 26, 0], [180, 18, 1], [900, 18, 2], [970, 26, 3]]) {
          const y = 120 + n * 32 + 40;
          c.save(); c.translate(x, y); c.rotate(Math.sin(t * 2 + ph) * .14);
          c.strokeStyle = '#c8902e'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 24); c.stroke(); bell(c, 0, 24, 40); c.restore();
        }
        [170, 320, 760, 910].forEach((x, i) => diya(c, x, 1800 - (i % 2) * 40, 46, t + i));
        glow(c, 540, 960, 520, `rgba(255,170,70,${.08 + .03 * Math.sin(t * 1.5)})`);
      },
      fx(c, t) { petals(c, t, 22, ['#ff9800', '#ffc107', '#ff7043'], 31); sparks(c, t, 12, '#ffd77a', 4); },
      crest(c, x, y, t) {
        c.strokeStyle = '#d9a83a'; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 240, y + 20); c.quadraticCurveTo(x, y + 90, x + 240, y + 20); c.stroke();
        for (let i = 0; i <= 12; i++) { const u = i / 12; marigold(c, x - 240 + 480 * u, y + 20 + Math.sin(u * Math.PI) * 35, 15, i % 2 ? 38 : 28); }
        [-120, 0, 120].forEach((dx, i) => {
          c.save(); c.translate(x + dx, y + 60 + (i === 1 ? 20 : 0)); c.rotate(Math.sin(t * 2.4 + i) * .16);
          c.strokeStyle = '#c8902e'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 40); c.stroke(); bell(c, 0, 40, i === 1 ? 70 : 54); c.restore();
        });
      }
    },

    palace: {
      name: 'Palace Dusk', note: 'Lake palace at sunset, sky lanterns',
      col: { names: '#ffe3a3', ink: '#fff6ea', ink2: '#f7dcc6', accent: '#ffb08a', gold: '#f4c76b' },
      mono: [['#fff0c8', '#e0a84a'], ['#ffd1dc', '#e66b8f']],
      font: { script: 'Great Vibes', serif: 'Cinzel' }, zone: [280, 1000, 860], shadow: ['rgba(30,10,40,.8)', 16], music: 'royal',
      back(c, R) {
        sky(c, [[0, '#1b1240'], [.28, '#45286a'], [.5, '#a8497a'], [.64, '#ee8a5c'], [.73, '#ffc27c']], 0, 1400);
        glow(c, 540, 1330, 520, 'rgba(255,200,120,.55)');
        c.fillStyle = '#ffdca4'; c.beginPath(); c.arc(540, 1330, 110, 0, TAU); c.fill();
        for (let i = 0; i < 9; i++) { c.fillStyle = `rgba(255,${150 + R() * 60},${150 + R() * 40},.18)`; c.beginPath(); c.ellipse(R() * W, 880 + R() * 380, 200 + R() * 260, 10 + R() * 12, 0, 0, TAU); c.fill(); }
        const palaceShape = () => {
          c.beginPath(); c.moveTo(60, 1400); c.lineTo(60, 1240);
          const parts = [[60, 150, 1240], [150, 300, 1190], [300, 420, 1150], [420, 660, 1110], [660, 780, 1150], [780, 930, 1190], [930, 1020, 1240]];
          parts.forEach(([a, b, top]) => {
            c.lineTo(a, top); const m = (a + b) / 2, w = (b - a) * .32;
            c.lineTo(m - w, top); c.bezierCurveTo(m - w * 1.25, top - w * 1.1, m - w * .2, top - w * 1.3, m, top - w * 1.8);
            c.bezierCurveTo(m + w * .2, top - w * 1.3, m + w * 1.25, top - w * 1.1, m + w, top); c.lineTo(b, top);
          });
          c.lineTo(1020, 1400); c.closePath();
          for (const mx of [50, 1030]) { c.rect(mx - 12, 1040, 24, 360); c.moveTo(mx - 22, 1040); c.quadraticCurveTo(mx, 980, mx + 22, 1040); }
        };
        c.fillStyle = '#2a1533'; palaceShape(); c.fill();
        [[60, 150, 1240], [150, 300, 1190], [300, 420, 1150], [420, 660, 1110], [660, 780, 1150], [780, 930, 1190], [930, 1020, 1240]].forEach(([a, b, top]) => {
          for (let y = top + 34; y < 1370; y += 52) for (let x = a + 18; x < b - 24; x += 40) {
            if (R() < .3) continue;
            c.fillStyle = `rgba(255,${185 + R() * 45},${100 + R() * 30},${.5 + R() * .45})`;
            c.beginPath(); c.moveTo(x, y + 26); c.lineTo(x, y + 8); c.quadraticCurveTo(x + 8, y - 6, x + 16, y + 8); c.lineTo(x + 16, y + 26); c.fill();
          }
        });
        sky(c, [[0, '#d77a6a'], [.15, '#7a3a66'], [1, '#170b26']], 1400, H);
        c.save(); c.translate(0, 2800); c.scale(1, -1); c.globalAlpha = .4; c.fillStyle = '#1a0c22'; palaceShape(); c.fill(); c.restore();
        for (let i = 0; i < 70; i++) { const y = 1410 + R() * 400, w = 40 + R() * 160; c.fillStyle = `rgba(255,200,140,${.25 * (1 - (y - 1400) / 450)})`; c.fillRect(540 - w / 2 + (R() - .5) * 200 * ((y - 1400) / 400), y, w, 2.5); }
        c.fillStyle = '#12081c'; c.fillRect(0, 1790, W, 130);
        for (let x = 10; x < W; x += 52) { rrect(c, x, 1710, 26, 90, 12); c.fill(); }
        c.fillRect(0, 1690, W, 26);
        for (const x of [70, 1010]) { c.beginPath(); c.moveTo(x - 60, 1690); c.lineTo(x + 60, 1690); c.lineTo(x + 44, 1600); c.lineTo(x - 44, 1600); c.fill(); foliage(c, R, x, 1500, 120, 120, 220, 280, 9, 40, 20); }
        glow(c, 540, 720, 520, 'rgba(25,8,40,.35)');
      },
      anim(c, t) {
        for (let i = 0; i < 9; i++) {
          const R = rng(100 + i), x0 = R() * W, sp = 20 + R() * 25, s = 18 + R() * 16;
          const y = 1500 - ((t * sp + R() * 1600) % 1700), x = x0 + Math.sin(t * .5 + i) * 30;
          const fl = .8 + .2 * Math.sin(t * 7 + i * 3);
          glow(c, x, y, s * 3, `rgba(255,170,80,${.35 * fl})`);
          const g = c.createLinearGradient(0, y - s, 0, y + s); g.addColorStop(0, '#ffe2a0'); g.addColorStop(1, '#ff8a3a');
          c.fillStyle = g; c.beginPath(); c.moveTo(x - s * .55, y - s); c.lineTo(x + s * .55, y - s); c.lineTo(x + s * .4, y + s); c.lineTo(x - s * .4, y + s); c.closePath(); c.fill();
        }
        for (let k = 0; k < 2; k++) {
          const cyc = 3.4, n = Math.floor((t + k * 1.7) / cyc), p = ((t + k * 1.7) % cyc) / 1.6;
          if (p > 1) continue;
          const R = rng(n * 7 + k), x = 160 + R() * 760, y = 160 + R() * 260, col = R() > .5 ? '255,214,120' : '255,140,190';
          for (let i = 0; i < 28; i++) {
            const a = i / 28 * TAU, d = ease(p) * (110 + R() * 30);
            c.fillStyle = `rgba(${col},${1 - p})`; c.beginPath(); c.arc(x + Math.cos(a) * d, y + Math.sin(a) * d + p * p * 30, 4, 0, TAU); c.fill();
          }
        }
      },
      fx(c, t) { motes(c, t, 14, 'rgba(255,200,130,A)', 8, 30); },
      crest(c, x, y, t) {
        c.save(); c.translate(x, y + 196); c.strokeStyle = '#f4c76b'; c.lineWidth = 4; c.fillStyle = 'rgba(244,199,107,.18)';
        c.beginPath(); c.moveTo(-90, 0); c.lineTo(90, 0); c.moveTo(-70, 0); c.lineTo(-70, -60); c.moveTo(70, 0); c.lineTo(70, -60); c.moveTo(0, 0); c.lineTo(0, -60); c.stroke();
        c.beginPath(); c.moveTo(-100, -60); c.lineTo(100, -60); c.stroke();
        c.beginPath(); c.moveTo(-80, -60); c.bezierCurveTo(-84, -120, -24, -136, 0, -165); c.bezierCurveTo(24, -136, 84, -120, 80, -60); c.fill(); c.stroke();
        c.beginPath(); c.moveTo(0, -165); c.lineTo(0, -195); c.stroke(); c.beginPath(); c.arc(0, -200, 7, 0, TAU); c.fillStyle = '#f4c76b'; c.fill();
        c.restore();
      }
    },

    blush: {
      name: 'Blush Floral', note: 'Watercolour roses, gold arch',
      col: { names: '#a8436a', ink: '#553943', ink2: '#7a5c66', accent: '#b98352', gold: '#c9a063' },
      mono: [['#eaa5ba', '#b4527a'], ['#d9b47a', '#9a7440']],
      font: { script: 'Pinyon Script', serif: 'Gilda Display' }, zone: [440, 1460, 720], shadow: ['rgba(255,250,246,.95)', 10], music: 'romantic',
      back(c, R) {
        c.fillStyle = '#fbf2ec'; c.fillRect(0, 0, W, H);
        glow(c, 540, 900, 800, 'rgba(255,255,255,.7)');
        for (let i = 0; i < 5000; i++) { c.fillStyle = `rgba(150,100,90,${R() * .05})`; c.fillRect(R() * W, R() * H, 2, 2); }
        const arch = (inset, w) => { c.beginPath(); c.moveTo(130 + inset, 1780 - inset); c.lineTo(130 + inset, 640); c.arc(540, 640, 410 - inset, Math.PI, 0); c.lineTo(950 - inset, 1780 - inset); c.closePath(); c.lineWidth = w; c.stroke(); };
        const gg = c.createLinearGradient(0, 200, W, 1800); gg.addColorStop(0, '#d8b26e'); gg.addColorStop(.5, '#f3dca4'); gg.addColorStop(1, '#b88a44');
        c.strokeStyle = gg; arch(0, 4); arch(16, 1.5);
        const bunch = (x, y, k, dir) => {
          for (let i = 0; i < 7; i++) eucalyptus(c, x, y, 260 * k, (dir > 0 ? 0 : Math.PI) + (i / 6 - .5) * 2.6 + .3 * dir);
          for (let i = 0; i < 14; i++) leaf(c, x + (R() - .5) * 340 * k, y + (R() - .5) * 340 * k, 90 * k, 26 * k, R() * TAU, R() > .5 ? '#c9a063' : '#a7bfa6');
          rose(c, x, y, 120 * k, '#fde3ea', '#e48aa6', R());
          rose(c, x + 150 * k * dir, y + 70 * k, 84 * k, '#fff3f0', '#e7b9b0', R());
          rose(c, x - 40 * k * dir, y + 150 * k, 74 * k, '#f9d6df', '#c9708f', R());
          rose(c, x + 120 * k * dir, y - 110 * k, 60 * k, '#fde3ea', '#e48aa6', R());
          for (let i = 0; i < 12; i++) blossom(c, x + (R() - .5) * 420 * k, y + (R() - .5) * 360 * k, 16 * k, '#fff', '#fff6f4', R() * 6);
        };
        bunch(150, 260, 1.15, 1); bunch(930, 1700, 1.15, -1); bunch(980, 330, .55, -1); bunch(110, 1720, .55, 1);
      },
      anim(c, t) {
        c.save(); c.globalCompositeOperation = 'lighter';
        const y = 240 + ((t * 120) % 1700);
        glow(c, 130, y, 60, 'rgba(255,240,200,.35)'); glow(c, 950, H - y, 60, 'rgba(255,240,200,.35)');
        c.restore();
      },
      fx(c, t) { petals(c, t, 16, ['#f4b6c8', '#f8d0dc', '#e89ab4'], 41); sparks(c, t, 14, '#d9b26e', 12); },
      crest(c, x, y, t) {
        for (const d of [-1, 1]) eucalyptus(c, x + d * 30, y + 150, 170, d < 0 ? Math.PI + .25 : -.25);
        rose(c, x, y + 140, 58, '#fde3ea', '#e48aa6', t * .1);
        rose(c, x - 64, y + 166, 34, '#fff3f0', '#e7b9b0'); rose(c, x + 64, y + 166, 34, '#f9d6df', '#c9708f');
      }
    }
  };

  // ---------- Layout and text ----------
  const fontOf = (L, f, z) => f === 'script' ? `${z}px "${L.font.script}"` : f === 'italic' ? `italic ${z}px "Cormorant Garamond"`
    : f === 'deva' ? `${z}px "Yatra One"` : f === 'display' ? `700 ${z}px "Cinzel Decorative"` : `${z}px "${L.font.serif}"`;
  function wrapText(c, s, maxW, max) {
    const words = s.split(' '), out = [];
    let line = '';
    for (const w of words) {
      const next = line ? `${line} ${w}` : w;
      if (c.measureText(next).width > maxW && line) { out.push(line); line = w; } else line = next;
    }
    out.push(line);
    if (out.length > max) { out.length = max; out[max - 1] = out[max - 1].replace(/\s*\S*$/, '') + '…'; }
    return out;
  }
  const lineH = it => it.f === 'script' ? 1.22 : 1.3;
  function measure(c, L, it, k, maxW) {
    const m = { it, gap: (it.gap || 0) * k };
    if (it.t === 'text') {
      let z = it.z * k;
      const s = it.up ? it.s.toUpperCase() : it.s;
      c.font = fontOf(L, it.f, z);
      if (it.wrap) m.lines = wrapText(c, s, maxW, it.wrap);
      else {
        const ls = (it.ls || 0) * k * s.length;
        while (z > it.z * k * .55 && c.measureText(s).width + ls > maxW) { z *= .94; c.font = fontOf(L, it.f, z); }
        m.lines = [s];
      }
      m.z = z; m.h = m.lines.length * z * lineH(it);
    } else if (it.t === 'mono') { m.z = it.z * k; m.h = m.z * .86; }
    else if (it.t === 'crest') m.h = it.h * k;
    else if (it.t === 'div') { m.z = (it.z || 40) * k; m.h = m.z * 1.1; }
    else if (it.t === 'emoji') { m.z = it.z * k; m.h = m.z * 1.2; }
    else if (it.t === 'date') { m.z = it.z * k; m.h = m.z * 1.3; }
    else if (it.t === 'cal') { m.k = k; m.h = (52 + 30 + 170 + (it.timed ? 64 : 0)) * k; }
    else if (it.t === 'sig') { m.k = k; m.h = (it.pad + 30 + 96 + 40) * k; }
    return m;
  }
  function layout(c, L, items) {
    const [top, bottom, maxW] = L.zone, room = bottom - top;
    const build = k => items.map(it => measure(c, L, it, k, maxW));
    const total = M => M.reduce((a, m, i) => a + m.h + (i < M.length - 1 ? m.gap : 0), 0);
    let M = build(1), h = total(M);
    for (let k = .95; h > room && k > .5; k -= .05) { M = build(k); h = total(M); }
    return { M, y0: top + Math.max(0, (room - h) / 2) };
  }

  function setText(c, L, font, col, alpha) {
    c.font = font; c.fillStyle = L.col[col] || col; c.globalAlpha = alpha;
    c.shadowColor = L.shadow[0]; c.shadowBlur = L.shadow[1]; c.shadowOffsetY = 0;
  }
  const spacing = (c, px) => { if ('letterSpacing' in c) c.letterSpacing = `${px}px`; };

  function drawMono(c, L, letters, cx, y, z, p, alpha) {
    c.save(); c.globalAlpha = alpha; c.font = fontOf(L, 'display', z); c.textBaseline = 'alphabetic'; c.textAlign = 'left';
    const ws = letters.map(ch => c.measureText(ch).width), gap = z * .04, tw = ws.reduce((a, b) => a + b, 0) + gap * (letters.length - 1);
    const base = y + z * .78, sc = .86 + .14 * ease(p / 1.2);
    c.translate(cx, base - z * .35); c.scale(sc, sc); c.translate(-cx, -(base - z * .35));
    let x = cx - tw / 2;
    letters.forEach((ch, i) => {
      const [a, b] = L.mono[i % 2], g = c.createLinearGradient(0, base - z * .75, 0, base);
      g.addColorStop(0, a); g.addColorStop(1, b);
      c.shadowColor = 'rgba(0,0,0,.28)'; c.shadowBlur = 24; c.shadowOffsetY = 10;
      c.fillStyle = g; c.fillText(ch, x, base);
      c.shadowColor = 'transparent'; c.lineWidth = Math.max(2, z * .016); c.strokeStyle = L.col.gold; c.strokeText(ch, x, base);
      const shine = (p - .9 - i * .25) / 1.1;
      if (shine > 0 && shine < 1) {
        c.save(); c.beginPath(); c.rect(x, base - z, ws[i], z * 1.1); c.clip();
        const sx = x - ws[i] + shine * ws[i] * 3, sg = c.createLinearGradient(sx - 60, 0, sx + 60, 0);
        sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(.5, 'rgba(255,255,255,.75)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
        c.globalCompositeOperation = 'source-atop'; c.fillStyle = sg; c.fillText(ch, x, base); c.restore();
      }
      x += ws[i] + gap;
    });
    blossom(c, cx - tw / 2 + z * .04, base - z * .68, z * .085, '#ec6f9c', '#fff', p * .3);
    blossom(c, cx + tw / 2 - z * .02, base - z * .06, z * .07, '#f7a8c4', '#fff', -p * .3);
    c.restore();
  }

  function drawDivider(c, L, cx, y, m, alpha) {
    const z = m.z, word = m.it.word, half = word ? 230 : 190;
    c.save(); c.globalAlpha = alpha; c.strokeStyle = L.col.gold; c.fillStyle = L.col.gold; c.lineWidth = 2.5;
    let gapW = 30;
    if (word) { setText(c, L, fontOf(L, 'serif', z), 'accent', alpha); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(word, cx, y); gapW = c.measureText(word).width / 2 + 26; c.shadowBlur = 0; }
    for (const d of [-1, 1]) {
      c.beginPath(); c.moveTo(cx + d * gapW, y); c.lineTo(cx + d * half, y); c.stroke();
      c.beginPath(); c.ellipse(cx + d * (half - 4), y, 10, 4, 0, 0, TAU); c.fill();
    }
    if (!word) { c.beginPath(); c.moveTo(cx, y - 12); c.lineTo(cx + 12, y); c.lineTo(cx, y + 12); c.lineTo(cx - 12, y); c.closePath(); c.fill(); }
    c.restore();
  }

  function drawItem(c, L, m, cx, y, p, alpha, ctx) {
    const it = m.it;
    c.save(); c.textAlign = 'center'; c.textBaseline = 'middle';
    if (it.t === 'text') {
      setText(c, L, fontOf(L, it.f, m.z), it.col, alpha); spacing(c, (it.ls || 0));
      m.lines.forEach((ln, i) => c.fillText(ln, cx, y + (i + .5) * m.z * lineH(it)));
    } else if (it.t === 'mono') drawMono(c, L, ctx.letters, cx, y, m.z, p, alpha);
    else if (it.t === 'crest') { c.globalAlpha = alpha; L.crest(c, cx, y, ctx.t); }
    else if (it.t === 'div') drawDivider(c, L, cx, y + m.h / 2, m, alpha);
    else if (it.t === 'emoji') { c.globalAlpha = alpha; c.font = `${m.z}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif`; c.fillText(it.s, cx, y + m.h / 2); }
    else if (it.t === 'date') {
      const d = it.d, a = String(d.getDate()), suf = ordinal(d.getDate()).slice(a.length), rest = ` ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
      setText(c, L, fontOf(L, 'serif', m.z), it.col, alpha);
      const wa = c.measureText(a).width, wr = c.measureText(rest).width; c.font = fontOf(L, 'serif', m.z * .55); const ws = c.measureText(suf).width;
      let x = cx - (wa + ws + wr) / 2; const yy = y + m.h / 2;
      c.textAlign = 'left'; c.font = fontOf(L, 'serif', m.z); c.fillText(a, x, yy); x += wa;
      c.font = fontOf(L, 'serif', m.z * .55); c.fillText(suf, x, yy - m.z * .28); x += ws;
      c.font = fontOf(L, 'serif', m.z); c.fillText(rest, x, yy);
    } else if (it.t === 'cal') {
      const k = m.k, d = it.d;
      setText(c, L, fontOf(L, 'serif', 46 * k), 'accent', alpha); spacing(c, 10 * k);
      c.fillText(MONTHS[d.getMonth()].toUpperCase(), cx, y + 26 * k);
      const ry = y + (52 + 30 + 85) * k;
      spacing(c, 4 * k); setText(c, L, fontOf(L, 'serif', 34 * k), 'ink', alpha);
      c.textAlign = 'right'; c.fillText(DAYS[d.getDay()].toUpperCase(), cx - 120 * k, ry);
      c.textAlign = 'left'; c.fillText(String(d.getFullYear()), cx + 120 * k, ry);
      c.shadowBlur = 0; c.strokeStyle = L.col.gold; c.lineWidth = 2;
      for (const d2 of [-1, 1]) {
        c.beginPath(); c.moveTo(cx + d2 * 96 * k, ry - 70 * k); c.lineTo(cx + d2 * 96 * k, ry + 70 * k); c.stroke();
        c.beginPath(); c.moveTo(cx + d2 * 120 * k, ry - 34 * k); c.lineTo(cx + d2 * 330 * k, ry - 34 * k); c.moveTo(cx + d2 * 120 * k, ry + 34 * k); c.lineTo(cx + d2 * 330 * k, ry + 34 * k); c.stroke();
      }
      spacing(c, 0); c.textAlign = 'center'; setText(c, L, fontOf(L, 'display', 150 * k), 'names', alpha);
      c.fillText(String(d.getDate()), cx, ry + 8 * k);
      if (it.timed) { spacing(c, 6 * k); setText(c, L, fontOf(L, 'serif', 36 * k), 'ink2', alpha); c.fillText(`${timeText(d)} onwards`.toUpperCase(), cx, ry + (85 + 50) * k); }
    } else if (it.t === 'sig') {
      const k = m.k, yy = y + it.pad * k;
      setText(c, L, fontOf(L, 'serif', 26 * k), 'ink2', alpha); spacing(c, 6 * k); c.fillText('DESIGNED BY', cx, yy + 15 * k);
      spacing(c, 0); setText(c, L, `${96 * k}px "Great Vibes"`, 'gold', alpha); c.fillText(ctx.designer, cx, yy + (30 + 52) * k);
      setText(c, L, fontOf(L, 'serif', 28 * k), 'ink2', alpha * .9); spacing(c, 2 * k); if (ctx.host) c.fillText(ctx.host, cx, yy + (30 + 96 + 22) * k);
    }
    c.restore();
  }

  // ---------- The player: draws frame t of the video on a 1080×1920 canvas ----------
  const layers = new Map();
  function sceneLayer(id) {
    if (layers.has(id)) return layers.get(id);
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    LOOKS[id].back(cv.getContext('2d'), rng(id.length * 977 + 13));
    layers.set(id, cv);
    return cv;
  }

  class Player {
    constructor(canvas) { this.cv = canvas; this.c = canvas.getContext('2d'); canvas.width = W; canvas.height = H; }
    set(card, opt, site = {}) {
      this.card = card; this.opt = opt; this.L = LOOKS[opt.look] || LOOKS.vrindavan;
      this.tl = timeline(card, opt); this.cache = new Map();
      let host = '';
      try { host = site.url ? new URL(site.url).host : ''; } catch (e) { /* no address */ }
      this.ctx = { designer: clean(site.designer) || 'Sankalp', host, letters: [initial(card.host1), initial(card.host2)].filter(Boolean) };
      if (!this.ctx.letters.length) this.ctx.letters = ['♥'];
      this.layer = sceneLayer(this.L === LOOKS[opt.look] ? opt.look : 'vrindavan');
      return this;
    }
    get total() { return this.tl.total; }
    draw(t) {
      const { c, L, tl } = this, { scenes, total } = tl;
      t = clamp(t, 0, total - .001);
      const idx = scenes.findIndex(s => t < s.t0 + s.d), s = scenes[idx < 0 ? scenes.length - 1 : idx], p = t - s.t0, last = s === scenes[scenes.length - 1];
      c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
      const intro = ease(t / 4.5), z = 1.2 - .16 * intro + .05 * (t / total);
      c.translate(W / 2 + Math.sin(t * .15) * 10, H / 2 + (1 - intro) * -50); c.scale(z, z); c.translate(-W / 2, -H / 2);
      c.drawImage(this.layer, 0, 0); L.anim(c, t);
      c.restore();
      if (!this.cache.has(s)) this.cache.set(s, layout(c, L, lines(s, this.card, this.opt)));
      const { M, y0 } = this.cache.get(s), out = last ? 1 : 1 - ease((p - (s.d - .6)) / .6);
      let y = y0;
      M.forEach((m, i) => {
        const a = ease((p - .25 - i * .16) / .7) * out;
        if (a > .01) drawItem(c, L, m, W / 2, y + (1 - a) * 26, p - .25 - i * .16, a, { ...this.ctx, t });
        y += m.h + m.gap;
      });
      L.fx(c, t);
      if (s.k !== 'end') {
        // The credit sits on a soft pill, so it reads on any background
        const light = /^rgba\(255/.test(L.shadow[0]), txt = `Designed by ${this.ctx.designer}`;
        c.save(); c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `26px "${L.font.serif}"`; spacing(c, 2);
        const w = c.measureText(txt).width + 44;
        c.fillStyle = light ? 'rgba(255,253,246,.8)' : 'rgba(15,6,20,.45)'; rrect(c, W / 2 - w / 2, H - 70, w, 44, 22); c.fill();
        c.fillStyle = light ? L.col.ink : '#fff7ea'; c.fillText(txt, W / 2, H - 47); c.restore();
      }
      if (s !== scenes[0] && p < .5) { c.fillStyle = `rgba(255,250,236,${(1 - p / .5) * .22})`; c.fillRect(0, 0, W, H); }
      return s;
    }
  }

  const FONTS = ['Parisienne', 'Great Vibes', 'Pinyon Script', 'Alex Brush', 'Marcellus', 'Gilda Display', 'Cinzel'];
  function fontsReady() {
    if (typeof document === 'undefined' || !document.fonts) return Promise.resolve();
    const want = [...FONTS.map(f => `40px "${f}"`), '700 40px "Cinzel Decorative"', 'italic 40px "Cormorant Garamond"'];
    return Promise.all([...want.map(f => document.fonts.load(f)), document.fonts.load('40px "Yatra One"', 'ॐ')]).catch(() => {});
  }

  return { W, H, LOOKS, defaults, timeline, lines, parents, splitIcon, ordinal, phone, sceneName, sceneLayer, Player, fontsReady };
})();

if (typeof module !== 'undefined') module.exports = Studio;
