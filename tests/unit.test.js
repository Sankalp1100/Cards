const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { loadApp, plain, ROOT } = require('./load');

const { Templates, PRESETS, Codec, Core, Catalog, INTROS } = loadApp();
const PARTICLE_TYPES = ['petal', 'leaf', 'marigold', 'confetti', 'heart', 'sparkle', 'balloon'];
const REQUIRED_VARS = ['--bg', '--bg2', '--ink', '--muted', '--accent', '--accent2', '--card', '--line'];

test.describe('Codec', () => {
  test('round-trips a full preset', () => {
    for (const p of Object.values(PRESETS)) {
      assert.deepEqual(plain(Codec.decode(Codec.encode(p.card))), plain(p.card));
    }
  });

  test('round-trips Hindi, emoji and special characters', () => {
    const card = { host1: 'दिया', host2: 'Aarav 💍', message: `Quotes " ' & <tags> \n new line`, events: [{ name: '🔥 फेरे' }] };
    assert.deepEqual(plain(Codec.decode(Codec.encode(card))), card);
  });

  test('output is URL-safe (no + / = characters)', () => {
    const s = Codec.encode({ x: '???>>>~~~ÿÿÿ'.repeat(20), y: 'दिया'.repeat(10) });
    assert.match(s, /^[A-Za-z0-9_-]+$/);
  });

  test('decodes strings of every padding length', () => {
    for (const v of ['a', 'ab', 'abc', 'abcd']) assert.equal(Codec.decode(Codec.encode(v)), v);
  });

  test('throws on garbage instead of returning junk', () => {
    assert.throws(() => Codec.decode('%%%not-base64%%%'));
    assert.throws(() => Codec.decode(Codec.encode({ a: 1 }).slice(0, 5)));
  });
});

test.describe('Core.esc', () => {
  test('escapes all HTML-significant characters', () => {
    assert.equal(Core.esc(`<img src=x onerror="a('b')">&`), '&lt;img src=x onerror=&quot;a(&#39;b&#39;)&quot;&gt;&amp;');
  });
  test('handles null, undefined and numbers', () => {
    assert.equal(Core.esc(null), '');
    assert.equal(Core.esc(undefined), '');
    assert.equal(Core.esc(5), '5');
  });
});

test.describe('Core.safeUrl', () => {
  const base = 'https://site.example/card.html';
  test('allows http and https', () => {
    assert.equal(Core.safeUrl('https://maps.app.goo.gl/abc', false, base), 'https://maps.app.goo.gl/abc');
    assert.equal(Core.safeUrl('http://example.com/a.jpg', false, base), 'http://example.com/a.jpg');
  });
  test('resolves relative paths against the base', () => {
    assert.equal(Core.safeUrl('img/a.png', false, base), 'https://site.example/img/a.png');
  });
  test('blocks script and other dangerous schemes', () => {
    for (const u of ['javascript:alert(1)', ' JavaScript:alert(1)', 'java\tscript:alert(1)', 'vbscript:x', 'file:///C:/secret.txt', 'data:text/html;base64,PHNjcmlwdD4=']) {
      assert.equal(Core.safeUrl(u, true, base), '', u);
    }
  });
  test('allows inline raster images only when asked', () => {
    const img = 'data:image/webp;base64,UklGRhIAAABXRUJQ';
    assert.equal(Core.safeUrl(img, true, base), img);
    assert.equal(Core.safeUrl(img, false, base), '');
    assert.equal(Core.safeUrl('data:image/svg+xml;base64,PHN2Zz4=', true, base), '');
  });
  test('rejects empty and non-string input', () => {
    for (const u of ['', null, undefined, 42, {}]) assert.equal(Core.safeUrl(u, true, base), '');
  });
});

test.describe('Core.compact', () => {
  test('drops empty fields but keeps music:false', () => {
    const out = Core.compact({ title: 'Hi', host2: '', photo: null, music: false, rsvp: undefined });
    assert.deepEqual(plain(out), { title: 'Hi', music: false });
  });
  test('removes nameless functions and empty function fields', () => {
    const out = Core.compact({ events: [{ name: '  ' }, { name: 'Haldi', date: '', venue: 'Lawn', dress: '' }, null] });
    assert.deepEqual(plain(out), { events: [{ name: 'Haldi', venue: 'Lawn' }] });
  });
  test('omits events entirely when none are left', () => {
    assert.deepEqual(plain(Core.compact({ events: [{ name: '' }] })), {});
  });
  test('compacting makes links shorter', () => {
    const full = { ...Core.blankCard(), host1: 'Kabir' };
    assert.ok(Codec.encode(Core.compact(full)).length < Codec.encode(full).length);
  });
});

test.describe('Core.isCard', () => {
  test('accepts card objects', () => {
    assert.equal(Core.isCard({}), true);
    assert.equal(Core.isCard({ host1: 'A', events: [] }), true);
  });
  test('rejects anything else', () => {
    for (const v of [null, undefined, 123, 'str', [], { events: 'nope' }]) assert.equal(Core.isCard(v), false, String(v));
  });
});

test.describe('Core.blankCard', () => {
  test('has no names or text, so nothing can leak into an edited card', () => {
    const b = Core.blankCard();
    for (const k of ['title', 'host1', 'host2', 'tagline', 'date', 'venue', 'message', 'photo', 'mapUrl', 'rsvp']) assert.equal(b[k], '', k);
    assert.equal(b.events.length, 0);
  });
  test('returns a fresh object every time', () => {
    const a = Core.blankCard();
    a.events.push({ name: 'x' });
    assert.equal(Core.blankCard().events.length, 0);
  });
});

test.describe('Core.who / Core.initials', () => {
  test('who joins two names, falls back gracefully', () => {
    assert.equal(Core.who({ host1: 'Diya', host2: 'Aarav' }), 'Diya & Aarav');
    assert.equal(Core.who({ host1: 'Kabir', host2: '  ' }), 'Kabir');
    assert.equal(Core.who({ host1: '', host2: 'Aarav' }), 'Aarav');
    assert.equal(Core.who({}), 'Our celebration');
  });
  test('initials handle Hindi, emoji and missing names', () => {
    assert.equal(Core.initials({ host1: 'Diya', host2: 'Aarav' }), 'D&A');
    assert.equal(Core.initials({ host1: 'दिया', host2: 'Aarav' }), 'द&A');
    assert.equal(Core.initials({ host1: '😀Kabir' }), '😀');
    assert.equal(Core.initials({}), '♥');
  });
});

test.describe('Links', () => {
  const admin = 'https://wed.netlify.app/admin.html';
  test('cardUrl builds a card link next to the admin page', () => {
    assert.equal(Core.cardUrl(admin, 'abc', ''), 'https://wed.netlify.app/card.html#abc');
  });
  test('cardUrl encodes guest names safely', () => {
    const u = new URL(Core.cardUrl(admin, 'abc', '  Rahul & "Family" '));
    assert.equal(u.searchParams.get('to'), 'Rahul & "Family"');
    assert.equal(u.hash, '#abc');
  });
  test('shareUrl strips the personal name and builder flags but keeps the card', () => {
    const u = Core.shareUrl('https://wed.netlify.app/card.html?to=Rahul&preview&auto&utm=x#abc');
    assert.equal(u, 'https://wed.netlify.app/card.html?utm=x#abc');
  });
  test('mobile accepts only 10-digit Indian mobiles and adds 91', () => {
    for (const ok of ['9876543210', '98765 43210', '+91 98765-43210', '919876543210', '09876543210']) assert.equal(Core.mobile(ok), '919876543210', ok);
    for (const bad of ['987654321', '98765432100', '5876543210', '1234567890', '9198765', 'call me', '', null]) assert.equal(Core.mobile(bad), '', String(bad));
  });

  test('a mobile box keeps digits only, at most 10', () => {
    assert.equal(Core.mobileInput('329847923759743'), '3298479237');
    assert.equal(Core.mobileInput('dffhdsjjfdjfdsg'), '');
    assert.equal(Core.mobileInput('+91 98765-43210'), '9876543210');
    assert.equal(Core.mobileInput('09876543210'), '9876543210');
    assert.equal(Core.mobileInput('98abc76'), '9876');
    assert.deepEqual([...Core.mobileHint('9876')], ['4/10 digits', '']);
    assert.deepEqual([...Core.mobileHint('9876543210')], ['10/10 ✓', 'ok']);
    assert.deepEqual([...Core.mobileHint('3298479237')], ['Mobile numbers start with 6, 7, 8 or 9', 'bad']);
  });

  test('nowLocal gives the current local time for date pickers', () => {
    assert.equal(Core.nowLocal(new Date(2026, 9, 25, 21, 5)), '2026-10-25T21:05');
    assert.ok('2026-10-25T21:04' < Core.nowLocal(new Date(2026, 9, 25, 21, 5)), 'earlier times compare as past');
  });

  test('waNumber keeps digits only', () => {
    assert.equal(Core.waNumber('+91 98765-43210'), '919876543210');
    assert.equal(Core.waNumber('call me'), '');
    assert.equal(Core.waNumber(undefined), '');
  });
  test('the invitation message is written for the occasion, with the names, day, venue and link', () => {
    const wedding = Core.inviteText({ guest: 'Rahul Uncle', card: { type: 'wedding', host1: 'Sankalp', host2: 'Sonal', date: '2026-12-12T19:30', venue: 'The Leela, Udaipur' }, link: 'https://x/i#a' });
    for (const part of ['*You\'re Invited*', 'Dear Rahul Uncle,', 'we invite you to the wedding of', '*Sankalp weds Sonal*', 'Date: Saturday, 12 December 2026, 7:30 pm', 'Venue: The Leela, Udaipur', 'https://x/i#a'])
      assert.ok(wedding.includes(part), `wedding message has "${part}"`);
    const kids = Core.inviteText({ card: { type: 'birthday', host1: 'Kabir', date: '2026-11-22' }, link: 'L' });
    assert.match(kids, /birthday party of\n\*Kabir\*/);
    assert.match(kids, /Date: Sunday, 22 November 2026\n/, 'time not decided yet: only the date');
    assert.ok(!/Dear/.test(kids) && !/Venue/.test(kids), 'no empty greeting or venue');
    assert.doesNotMatch(wedding + kids, /[\u{10000}-\u{10FFFF}]/u, 'no emoji WhatsApp for Windows would break');
    // Links saved before the message knew the card still get a tidy message.
    assert.match(Core.inviteText({ guest: 'Rahul', who: 'Diya & Aarav', label: 'Wedding', link: 'L' }), /Dear Rahul, you're invited![\s\S]*Diya & Aarav · Wedding/);
  });

  test('a date without a time is that day, and knows it has no time', () => {
    const d = Core.parseDate('2026-12-12');
    assert.deepEqual([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()], [2026, 11, 12, 0]);
    assert.equal(Core.hasTime('2026-12-12'), false);
    assert.equal(Core.hasTime('2026-12-12T19:30'), true);
  });
});

test.describe('Core.fontsUrl', () => {
  test('builds a Google Fonts URL with weights and no duplicates', () => {
    const url = Core.fontsUrl({ display: "'Playfair Display', serif", script: "'Great Vibes', cursive", body: "'Playfair Display', serif" });
    assert.equal(url, 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Great+Vibes&display=swap', 'with the italics');
  });
});

test.describe('Publishing', () => {
  const ignore = fs.readFileSync(path.join(ROOT, '.vercelignore'), 'utf8').split(/\r?\n/).map(l => l.trim());
  test('the PC-only server and launcher are never uploaded to Vercel', () => {
    for (const f of ['server.mjs', '*.cmd']) assert.ok(ignore.includes(f), `${f} not in .vercelignore`);
  });

  test('the server-side API is behind the password (the admin page uses the Supabase login)', async () => {
    const mw = await import('../middleware.js');
    assert.deepEqual([...mw.config.matcher], ['/api/((?!maplink).*)']);
    const basic = s => 'Basic ' + Buffer.from(s).toString('base64');
    // Built-in login (no Vercel variables): card.com / admin@90
    assert.equal(await mw.loginOk(basic('card.com:admin@90')), true);
    assert.equal(await mw.loginOk(basic(' Card.com :admin@90')), true, 'user name ignores case and spaces');
    assert.equal(await mw.loginOk(basic('admin:admin@90')), false, 'wrong user name');
    assert.equal(await mw.loginOk(basic('card.com:admin@91')), false, 'wrong password');
    assert.equal(await mw.loginOk(basic('card.com:')), false, 'empty password');
    // Vercel variables override both
    const env = { user: 'boss', password: 's3cret pass' };
    assert.equal(await mw.loginOk(basic('boss:s3cret pass'), env), true);
    assert.equal(await mw.loginOk(basic('card.com:admin@90'), env), false, 'built-in login stops working once variables are set');
    assert.equal(await mw.loginOk(basic('boss:wrong'), env), false);
    for (const h of [null, '', 'Bearer x', 'Basic', 'Basic %%%', basic('no-colon')]) assert.equal(await mw.loginOk(h, env), false, String(h));
    const res = await mw.default({ headers: new Headers() });
    assert.equal(res.status, 401);
    assert.match(res.headers.get('WWW-Authenticate'), /^Basic/);
  });

  test('online publish refuses bad requests and explains the missing token', async () => {
    const publish = require('../api/publish.js');
    const call = async (req) => {
      const out = {};
      const res = { setHeader() {}, status(c) { out.status = c; return this; }, json(d) { out.body = d; return this; } };
      await publish({ method: 'POST', headers: { host: 'cardalbum.vercel.app' }, ...req }, res);
      return out;
    };
    assert.equal((await call({ method: 'GET' })).status, 405);
    assert.equal((await call({ headers: { host: 'a.app', origin: 'https://evil.example' }, body: {} })).status, 403);
    assert.equal((await call({ body: { config: 'const SITE = {}; const CATALOG = {}; require("fs")' } })).status, 400);
    const saved = process.env.GITHUB_TOKEN;
    delete process.env.GITHUB_TOKEN;
    const r = await call({ body: { config: fs.readFileSync(path.join(ROOT, 'js', 'config.js'), 'utf8') } });
    if (saved) process.env.GITHUB_TOKEN = saved;
    assert.equal(r.body.published, false);
    assert.match(r.body.message, /GITHUB_TOKEN/);
  });
  test('public pages do not mention the admin panel', () => {
    for (const f of ['index.html', 'card.html', 'js/site.js', 'js/card.js', 'js/catalog.js', 'js/themes.js', 'js/config.js', 'js/db.js']) {
      assert.ok(!/admin/i.test(fs.readFileSync(path.join(ROOT, f), 'utf8')), `${f} mentions admin`);
    }
  });
  test('public pages and the admin panel load the business config', () => {
    for (const f of ['index.html', 'card.html', 'admin.html']) assert.match(fs.readFileSync(path.join(ROOT, f), 'utf8'), /js\/config\.js/, f);
  });

  test('every page has the icon, and shared links get a preview image', () => {
    for (const f of ['index.html', 'card.html', 'admin.html']) {
      const html = fs.readFileSync(path.join(ROOT, f), 'utf8');
      for (const icon of ['img/favicon.svg', 'img/favicon-32.png', 'img/icon-180.png']) assert.ok(html.includes(`href="${icon}"`), `${f}: ${icon}`);
    }
    for (const [f, img] of [['index.html', 'og-site.jpg'], ['card.html', 'og-invite.jpg']]) {
      const html = fs.readFileSync(path.join(ROOT, f), 'utf8');
      // A ?v=N after the file name makes WhatsApp fetch a changed picture instead of its cached one.
      assert.match(html, new RegExp(`<meta property="og:image" content="https://cardalbum\\.vercel\\.app/img/${img.replace('.', '\\.')}(\\?v=\\d+)?">`), `${f} preview image`);
      for (const tag of ['og:title', 'og:description', 'og:url', 'og:image:width', 'twitter:card']) assert.ok(html.includes(tag), `${f}: ${tag}`);
      // WhatsApp shows no preview image when it is over ~300 KB; keep well under.
      assert.ok(fs.statSync(path.join(ROOT, 'img', img)).size < 200 * 1024, `${img} too big for WhatsApp`);
      assert.ok(html.includes('<meta property="og:image:type" content="image/jpeg">'), `${f}: image type`);
    }
    for (const img of ['favicon.svg', 'favicon-32.png', 'icon-180.png', 'icon-192.png', 'icon-512.png']) assert.ok(fs.existsSync(path.join(ROOT, 'img', img)), img);
    const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.webmanifest'), 'utf8'));
    for (const i of manifest.icons) assert.ok(fs.existsSync(path.join(ROOT, i.src)), i.src);
  });
});

test.describe('Dates', () => {
  test('parseDate reads datetime-local values as local time', () => {
    const d = Core.parseDate('2026-12-12T19:30');
    assert.equal(d.getHours(), 19);
    assert.equal(d.getMinutes(), 30);
    assert.equal(d.getDate(), 12);
  });
  test('parseDate returns null for empty or invalid input', () => {
    for (const v of ['', null, undefined, 'next friday', '2026-13-45T99:99']) assert.equal(Core.parseDate(v), null, String(v));
  });
  test('calStamp formats a Google Calendar time', () => {
    assert.equal(Core.calStamp(new Date(2026, 11, 12, 19, 30)), '20261212T193000');
    assert.equal(Core.calStamp(new Date(2027, 0, 5, 9, 5)), '20270105T090500');
  });
});

test.describe('Templates', () => {
  const all = Templates.all;

  test('there are exactly 300, numbered 1 to 300 in order', () => {
    assert.equal(all.length, 300);
    all.forEach((t, i) => assert.equal(t.no, i + 1));
  });

  test('every occasion gets 20 designs', () => {
    for (const k of Object.keys(PRESETS)) assert.equal(all.filter(t => t.occasion === k).length, 30, k);
  });

  test('names are unique', () => {
    assert.equal(new Set(all.map(t => t.name)).size, 300);
  });

  test('numbers are stable: the first designs never move (links store the number)', () => {
    assert.deepEqual(plain(all.slice(0, 13).map(t => t.name)), ['Royal Maharaja', 'Blush Garden', 'Midnight Glam', 'Haldi Sunshine', 'Mehendi Green',
      'Neon Love (Y2K)', 'Candy Party', 'Baby Cloud', 'Disco Kitty', 'Filmy Bollywood', 'Golden Hour', 'Lavender Dream', 'Ruby Rajwada']);
    assert.equal(Templates.get(47).name, 'Cobalt Milestone');
    assert.equal(Templates.get(200).name, all[199].name);
    assert.equal(Templates.get(201).name, 'Lime Saat Phere', 'the new designs start at #201');
    assert.equal(Templates.get(300).name, all[299].name);
  });

  test('get() accepts numbers, padded strings, # and old names', () => {
    for (const id of [47, '47', '047', '#047', ' #47 ']) assert.equal(Templates.get(id).no, 47, String(id));
    assert.equal(Templates.get('royal').no, 1);
    assert.equal(Templates.get('lavender').no, 12);
    for (const id of [0, 301, -1, 1.5, '', 'abc', null, undefined, {}]) assert.equal(Templates.get(id), null, String(id));
  });

  test('serial pads to three digits', () => {
    assert.equal(Templates.serial(7), '#007');
    assert.equal(Templates.serial(200), '#200');
  });

  test('every design is complete and valid', () => {
    for (const t of all) {
      const at = `#${t.no} ${t.name}`;
      assert.ok(t.name && t.emoji && PRESETS[t.occasion], at);
      assert.ok(['mandala', 'blobs', 'frame', 'florals', 'sunburst', 'deco', 'lights', 'stars', 'lace'].includes(t.decor), `${at} decor`);
      assert.ok(['', 'neon', 'playful'].includes(t.flavor), `${at} flavor`);
      assert.ok(INTROS[t.intro], `${at} opening style`);
      for (const v of REQUIRED_VARS) assert.ok(t.vars[v], `${at} missing ${v}`);
      for (const v of ['--bg', '--bg2', '--ink', '--muted', '--accent', '--accent2']) assert.match(t.vars[v], /^#[0-9a-f]{6}$/i, `${at} ${v}`);
      for (const f of ['display', 'script', 'body']) assert.match(t.fonts[f], /^'[^']+', (serif|sans-serif|cursive)$/, `${at} font ${f}`);
      assert.ok(t.particles.types.length > 0, at);
      for (const p of t.particles.types) assert.ok(PARTICLE_TYPES.includes(p), `${at} unknown particle "${p}"`);
      for (const c of t.particles.colors) assert.match(c, /^#[0-9a-f]{6}$/i, at);
      assert.ok(t.particles.count > 0 && t.particles.count <= 120, at);
      assert.ok(t.tempo > 0.1 && t.tempo < 1, `${at} tempo`);
    }
  });

  // WCAG relative luminance contrast between text and background.
  const lum = hex => {
    const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(c => c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

  test('text is readable on every design (contrast ≥ 7 for text, ≥ 3 for generated accents)', () => {
    for (const t of all) {
      assert.ok(contrast(t.vars['--ink'], t.vars['--bg']) >= 7, `#${t.no} ink`);
      // #001–#012 are the original hand-made designs; a few use softer accents on purpose (Candy Party, Baby Cloud).
      if (t.no > 12) assert.ok(contrast(t.vars['--accent'], t.vars['--bg']) >= 3, `#${t.no} accent ${contrast(t.vars['--accent'], t.vars['--bg']).toFixed(2)}`);
    }
  });

  test('each design loads exactly the fonts it uses', () => {
    for (const t of all) {
      const url = Core.fontsUrl(t.fonts);
      const families = new Set(Object.values(t.fonts).map(f => f.match(/'([^']+)'/)[1]));
      for (const family of families) assert.ok(url.includes(`family=${family.replace(/ /g, '+')}`), `#${t.no} ${family} missing`);
      assert.equal((url.match(/family=/g) || []).length, families.size, `#${t.no} no extra or duplicate families`);
    }
  });

  test('there are 6 opening styles and each is used by several designs', () => {
    assert.deepEqual(plain(Object.keys(INTROS)), ['envelope', 'doors', 'curtains', 'scroll', 'giftbox', 'cardflip']);
    for (const k of Object.keys(INTROS)) assert.ok(all.filter(t => t.intro === k).length >= 10, k);
    assert.equal(Templates.get(1).intro, 'envelope', '#001 keeps the original envelope');
  });

  // The designs are built from 10 hand-designed styles (js/themes.js STYLES), each in the design's own colours.
  const STYLE_NAMES = ['ivory', 'palace', 'bloom', 'minimal', 'marigold', 'mehendi', 'pichwai', 'retro', 'neon', 'toybox'];

  test('neighbouring designs look different', () => {
    for (let i = 1; i < all.length; i++) {
      assert.notEqual(all[i].vars['--bg'] + all[i].occasion, all[i - 1].vars['--bg'] + all[i - 1].occasion, `#${i} and #${i + 1}`);
    }
  });

  test('every design uses one of the 10 styles, and every style is well used', () => {
    for (const t of all) {
      assert.ok(STYLE_NAMES.includes(t.style), `#${t.no} style "${t.style}"`);
      assert.ok(['classic', 'arch', 'monogram', 'ticket', 'split', 'editorial', 'orbit'].includes(t.layout), `#${t.no} layout`);
      assert.ok(['none', 'toran', 'bunting', 'lanterns', 'bells', 'diyas', 'garland'].includes(t.motif), `#${t.no} motif`);
    }
    for (const s of STYLE_NAMES) assert.ok(all.filter(t => t.style === s).length >= 10, `style "${s}" is used by at least 10 designs`);
  });

  test('no two designs of an occasion look alike (style, layout and colours together)', () => {
    for (const k of Object.keys(PRESETS)) {
      const looks = all.filter(t => t.occasion === k).map(t => [t.style, t.variant, t.vars['--bg'], t.vars['--accent']].join('|'));
      assert.equal(new Set(looks).size, looks.length, k);
    }
  });

  test('an occasion never shows the same style twice in a row, and spreads each style over its layouts', () => {
    for (const k of Object.keys(PRESETS)) {
      const list = all.filter(t => t.occasion === k);
      for (let i = 1; i < list.length; i++) assert.notEqual(list[i].style, list[i - 1].style, `#${list[i - 1].no} and #${list[i].no} (${k})`);
      const count = {};
      for (const t of list) count[t.style + t.variant] = (count[t.style + t.variant] || 0) + 1;
      assert.ok(Math.max(...Object.values(count)) <= 4, `${k}: one style and layout is repeated too often`);
    }
  });

  test('the classics keep their hand-picked style and opening', () => {
    assert.deepEqual(plain([1, 2, 5, 6, 7, 10].map(n => Templates.get(n).style)), ['palace', 'bloom', 'mehendi', 'neon', 'toybox', 'retro']);
    assert.equal(Templates.get(1).intro, 'envelope');
  });

  test('every design has its own song, and #001 keeps the original tune', () => {
    const { PROGRESSIONS, PATTERNS, VOICES } = require('../js/music.js');
    for (const t of all) {
      const s = t.song;
      assert.ok(PROGRESSIONS[s.prog] && PATTERNS[s.pattern] && VOICES[s.voice] && s.key >= 0 && s.key < 12, `#${t.no} song`);
      if (s.voice === 'pluck') assert.ok(['sangeet', 'kitty', 'bday', 'birthday'].includes(t.occasion), `#${t.no}: playful pluck only for parties`);
    }
    assert.equal(new Set(all.map(t => JSON.stringify(t.song))).size, 300);
    assert.deepEqual(plain(all[0].song), { prog: 0, pattern: 0, voice: 'musicbox', key: 0 });
  });
});

test.describe('Occasion presets', () => {
  test('there are 10 occasions', () => {
    assert.equal(Object.keys(PRESETS).length, 10);
  });

  for (const [key, p] of Object.entries(PRESETS)) {
    test(`${key}: complete and valid`, () => {
      assert.ok(p.label && p.icon);
      assert.equal(p.labels.length, 2);
      assert.equal(p.card.type, key, 'card.type matches the preset key');
      assert.equal(Templates.get(p.card.theme)?.occasion, key, `design ${p.card.theme} belongs to this occasion`);
      assert.ok(p.card.host1 && p.card.title && p.card.tagline);
      assert.ok(Core.parseDate(p.card.date), 'main date valid');
      for (const e of p.card.events) {
        assert.ok(e.name);
        if (e.date) assert.ok(Core.parseDate(e.date), `${e.name} date valid`);
      }
    });

    test(`${key}: link stays short enough for WhatsApp`, () => {
      const url = Core.cardUrl('https://wedding-card.netlify.app/', Codec.encode(Core.compact(p.card)), 'Sharma Family');
      assert.ok(url.length < 2500, `${url.length} chars`);
    });
  }

  test('a link with an uploaded photo stays under 16 KB', () => {
    const photo = 'data:image/webp;base64,' + 'A'.repeat(10 * 1024);
    const url = Core.cardUrl('https://x.netlify.app/', Codec.encode(Core.compact({ ...PRESETS.wedding.card, photo })), 'Rahul');
    assert.ok(url.length < 16 * 1024, `${url.length} chars`);
  });
});

test.describe('Catalog', () => {
  const site = { url: '', brand: 'B', whatsapp: '', instagram: '', price: '999', currency: '₹' };

  test('with no settings every design is on sale with the default price', () => {
    const e = Catalog.entries(site, {});
    assert.equal(e.length, 300);
    assert.equal(Catalog.visible(e).length, 300);
    assert.equal(e[46].price, 999);
    assert.equal(Catalog.priceText(e[46], site), '₹999');
  });

  test('settings rename, move, price, hide and mark designs as trending', () => {
    const e = Catalog.entries(site, { 47: { name: 'Shaadi Gold', occasion: 'wedding', price: 1499, featured: true }, 5: { hidden: true }, 9: { occasion: 'nope' } });
    assert.equal(e[46].name, 'Shaadi Gold');
    assert.equal(e[46].occasion, 'wedding');
    assert.equal(Catalog.priceText(e[46], site), '₹1,499');
    assert.equal(e[8].occasion, 'kitty', 'unknown occasion is ignored');
    const v = Catalog.visible(e);
    assert.equal(v.length, 299);
    assert.ok(!v.some(x => x.no === 5), 'hidden design not shown');
    assert.equal(v[0].no, 47, 'trending designs come first');
    assert.equal(v[1].no, 1);
  });

  // 8:00 in India is 02:30 UTC.
  const at = iso => Date.parse(iso);
  test('trending today: ten designs, the owner\'s picks always in, spread over the occasions', () => {
    const e = Catalog.entries(site, { 47: { featured: true }, 120: { featured: true }, 5: { hidden: true } });
    const t = Catalog.trendingToday(e, at('2026-11-02T06:00:00Z'));
    const hot = Catalog.visible(t).filter(x => x.featured);
    assert.equal(hot.length, 10);
    assert.ok(hot.some(x => x.no === 47) && hot.some(x => x.no === 120), 'owner picks stay');
    assert.ok(!hot.some(x => x.no === 5), 'hidden designs never trend');
    assert.equal(new Set(hot.filter(x => x.no !== 47 && x.no !== 120).map(x => x.occasion)).size, 8, 'the daily ones come from different occasions');
    assert.deepEqual(plain(Catalog.visible(t).slice(0, 10).map(x => x.hotRank)), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 'trending first, in today\'s order');
    assert.equal(e.filter(x => x.featured).length, 2, 'the catalog settings themselves are not changed');
  });

  test('trending today is the same all day and changes at 8:00 in the morning, India time', () => {
    const e = Catalog.entries(site, {});
    const pick = iso => Catalog.visible(Catalog.trendingToday(e, at(iso))).slice(0, 10).map(x => x.no).join(',');
    const morning = pick('2026-11-02T02:30:00Z'); // 08:00 IST
    assert.equal(pick('2026-11-02T18:00:00Z'), morning, 'same at 23:30 IST');
    assert.equal(pick('2026-11-03T02:29:00Z'), morning, 'same at 07:59 IST the next day');
    assert.notEqual(pick('2026-11-03T02:30:00Z'), morning, 'new set at 08:00 IST');
    assert.notEqual(pick('2026-11-02T02:29:00Z'), morning, 'the day before ends at 07:59');
  });

  test('the catalog can change how a design opens', () => {
    const e = Catalog.entries(site, { 47: { intro: 'scroll' }, 48: { intro: 'nope' } });
    assert.equal(e[46].intro, 'scroll');
    assert.equal(e[47].intro, Templates.get(48).intro, 'unknown opening is ignored');
    assert.deepEqual(plain(Catalog.clean({ 47: { intro: 'scroll' }, 1: { intro: 'envelope' }, 2: { intro: 'nope' } })), { 47: { intro: 'scroll' } });
  });

  test('empty price hides prices', () => {
    const e = Catalog.entries({ ...site, price: '' }, {});
    assert.equal(e[0].price, '');
    assert.equal(Catalog.priceText(e[0], site), '');
  });

  test('search: a number finds exactly that design, text matches name or occasion', () => {
    const e = Catalog.entries(site, {});
    for (const q of ['47', '#047', '047', ' 47 ']) assert.deepEqual(plain(e.filter(x => Catalog.matches(x, q)).map(x => x.no)), [47], q);
    assert.deepEqual(plain(e.filter(x => Catalog.matches(x, 'royal maha')).map(x => x.no)), [1]);
    assert.equal(e.filter(x => Catalog.matches(x, 'kitty party')).length, 30);
    assert.equal(e.filter(x => Catalog.matches(x, '', 'birthday')).length, 30);
    assert.equal(e.filter(x => Catalog.matches(x, '47', 'wedding')).length, 0, 'number + wrong occasion');
    assert.equal(e.filter(x => Catalog.matches(x, '')).length, 300);
  });

  test('clean keeps only real changes', () => {
    assert.deepEqual(plain(Catalog.clean({
      1: { name: 'Royal Maharaja', occasion: 'wedding', price: '', hidden: false, featured: false },
      2: { name: '  New name ', price: '1200', hidden: true },
      3: { occasion: 'kitty', featured: true },
      999: { hidden: true }, abc: { hidden: true }, 4: null
    })), { 2: { name: 'New name', price: 1200, hidden: true }, 3: { occasion: 'kitty', featured: true } });
  });

  test('order message names the design number', () => {
    const e = Catalog.entries(site, {})[46];
    assert.equal(Catalog.orderText(e), "Hi! I'd like to order design #047 (Cobalt Milestone) 💌");
    assert.equal(Core.orderUrl('+91 98765 43210', 'Hi'), 'https://wa.me/919876543210?text=Hi');
    assert.equal(Core.orderUrl('', 'Hi'), '#order');
  });

  test('demo code opens that design with its occasion sample text', () => {
    const e = Catalog.entries(site, {})[46];
    const card = Codec.decode(Catalog.demoCode(e));
    assert.equal(card.theme, 47);
    assert.equal(card.type, e.occasion);
    assert.equal(card.host1, PRESETS[e.occasion].card.host1);
  });

  test('poster escapes text and shows the trending badge', () => {
    const e = { ...Catalog.entries(site, {})[0], featured: true };
    const html = Catalog.poster(e, 'a', 'href="#"');
    assert.match(html, /^\s*<a class="poster ps-palace d-deco l-arch s-bokeh n-shimmer f-arch"/, 'the poster shows the design\'s own style and look');
    assert.match(html, /--fd:&quot;Cinzel&quot;, serif/, 'Palace Night lettering');
    assert.match(html, /--fs:&quot;Great Vibes&quot;, cursive/, 'and its own fonts');
    assert.match(html, /<span class="p-by">by Sankalp<\/span>/, 'signed by the designer');
    assert.match(html, /🔥 Trending/);
    assert.match(html, /Diya<i>&amp;<\/i>Aarav/);
  });

  const order = {
    design: 47, type: 'bday', host1: 'Neha', host2: '', nick1: 'Nehu 🌸', date: '2026-11-28T20:00', venue: 'Skybar, Bengaluru',
    events: [{ name: '🎂 Cake Cutting', date: '2026-11-28T21:30', venue: '' }, { name: '  ', date: '' }],
    message: 'Come!', rsvp: '+91 98765 43210', guests: ['Rahul Uncle', ' ', 'Priya Di'], photo: true
  };

  test('order message is complete and readable, and ends with the order code', () => {
    const msg = Catalog.orderMessage(order, Catalog.entries(site, {}));
    for (const part of ['• Design: *#047* Cobalt Milestone', '• Occasion: Birthday', '• Names: Neha', '• Nicknames: Nehu', '• Date: Sat, 28 Nov', '• Venue: Skybar, Bengaluru', '• Functions: Cake Cutting (', '• Message: Come!',
      '• RSVP number: 919876543210', '• Guests (2): Rahul Uncle, Priya Di', "• Photo: I'll send it"]) assert.ok(msg.includes(part), part);
    assert.ok(!/[\u{10000}-\u{10FFFF}]/u.test(msg), 'no emoji: WhatsApp for Windows shows them as �');
    assert.match(msg, /\n\nOrder code \(please keep\): WC1\.[A-Za-z0-9_-]+$/);
    assert.ok(!/\n\n\n/.test(msg), 'no empty lines in the middle');
    const bare = Catalog.orderMessage({ type: 'kitty', host1: 'Glam Club' }, Catalog.entries(site, {}));
    assert.match(bare, /Design: please suggest one/);
    assert.ok(!/Date:|Venue:|Functions:|Message:|RSVP|Guests|Photo:/.test(bare), 'empty fields are left out');
  });

  test('a pasted order fills the whole card, with sample headline and tagline for the occasion', () => {
    const msg = Catalog.orderMessage(order, Catalog.entries(site, {}));
    const r = Catalog.readOrder(`Hello!\n${msg}\nThanks 🙏`);
    assert.deepEqual(plain(r), {
      card: {
        type: 'bday', title: PRESETS.bday.card.title, tagline: PRESETS.bday.card.tagline, music: true,
        host1: 'Neha', host2: '', nick1: 'Nehu 🌸', nick2: '', date: '2026-11-28T20:00', venue: 'Skybar, Bengaluru', mapUrl: '', message: 'Come!', rsvp: '919876543210',
        events: [{ name: '🎂 Cake Cutting', date: '2026-11-28T21:30', venue: '', dress: '' }],
        story: [], families: [], attire: [], upi: '', hashtag: '', giftNote: '', venueNote: '', thanks: '', theme: 47
      },
      guests: ['Rahul Uncle', 'Priya Di'], photo: true, gallery: false, video: ''
    });
  });

  test('"Make it special" lines are read as when – title – details, side – parents – siblings, function – what to wear', () => {
    const special = Catalog.specialLines({
      story: 'March 2023 – First meeting – A Diwali party in Jaipur\nJanuary 2026: The proposal\nJust a line',
      families: "Bride's family – Mr. & Mrs. Mehta – With Ishaan\nThe Sharma family", attire: 'Haldi – Yellow\nSangeet'
    });
    assert.deepEqual(plain(special.story), [{ when: 'March 2023', title: 'First meeting', text: 'A Diwali party in Jaipur' },
      { when: 'January 2026', title: 'The proposal', text: '' }, { when: '', title: 'Just a line', text: '' }]);
    assert.deepEqual(plain(special.families), [{ side: "Bride's family", parents: 'Mr. & Mrs. Mehta', more: 'With Ishaan' }, { side: '', parents: 'The Sharma family', more: '' }]);
    assert.deepEqual(plain(special.attire), [{ name: 'Haldi', text: 'Yellow' }, { name: 'Sangeet', text: '' }]);
  });

  test('every detail a customer gives reaches the panel when the order is pasted, and is readable in the message', () => {
    const full = {
      ...order, events: [{ name: '🌼 Haldi', date: '2026-11-27T10:00', venue: 'Poolside', dress: 'Yellow' }],
      ...Catalog.specialLines({ story: '2001 – Met at college – Same bus every day', families: 'Her family – Mr. & Mrs. Rao – With Kiran', attire: 'Party – Gold' }),
      upi: 'neha@okicici', hashtag: '#Neha30', giftNote: 'No gifts please', venueNote: 'Parking at gate 2', thanks: 'Love you all',
      title: 'Party time', tagline: 'is turning thirty', gallery: true, music: false
    };
    const msg = Catalog.orderMessage(full, Catalog.entries(site, {}));
    for (const line of ['Functions: Haldi (', 'at Poolside, wear Yellow', 'Headline: Party time', 'Line under the names: is turning thirty',
      'Gallery: I\'ll send more photos', 'Music: no background music', 'Our story: 2001 - Met at college - Same bus every day',
      'Families: Her family - Mr. & Mrs. Rao - With Kiran', 'Dress code: Party - Gold', 'UPI for gifts: neha@okicici', 'Gift note: No gifts please',
      'Venue note: Parking at gate 2', 'Thank-you line: Love you all', 'Hashtag: #Neha30']) assert.ok(msg.includes(line), `message shows "${line}"`);
    const r = Catalog.readOrder(msg), c = r.card;
    assert.deepEqual(plain(c.events[0]), { name: '🌼 Haldi', date: '2026-11-27T10:00', venue: 'Poolside', dress: 'Yellow' });
    assert.deepEqual(plain(c.story[0]), { when: '2001', title: 'Met at college', text: 'Same bus every day' });
    assert.deepEqual(plain(c.families[0]), { side: 'Her family', parents: 'Mr. & Mrs. Rao', more: 'With Kiran' });
    assert.equal(c.attire[0].text, 'Gold');
    for (const [k, v] of Object.entries({ upi: 'neha@okicici', hashtag: '#Neha30', giftNote: 'No gifts please', venueNote: 'Parking at gate 2', thanks: 'Love you all',
      title: 'Party time', tagline: 'is turning thirty', music: false })) assert.equal(c[k], v, k);
    assert.equal(r.gallery, true);
    assert.equal(r.photo, true);
  });

  test('premium sections are cleaned before they are shown (only safe colours, links and sizes)', () => {
    const x = Core.extras({
      story: [{ title: 'x'.repeat(500), when: 5 }, 'junk', null], gallery: ['javascript:alert(1)', 'https://a.com/p.jpg', 'data:text/html,hi'],
      attire: [{ name: 'Haldi', colors: '#ffcc00, red, #12345, url(x)' }], upi: 'a b<script>@ok', rsvpForm: false
    });
    assert.equal(x.story.length, 1);
    assert.equal(x.story[0].title.length, 60);
    assert.equal(x.story[0].when, '');
    assert.deepEqual(plain(x.gallery), ['https://a.com/p.jpg']);
    assert.deepEqual(plain(x.attire[0].colors), ['#ffcc00']);
    assert.equal(x.upi, 'abscript@ok');
    assert.equal(x.rsvpForm, false);
  });

  test('the code survives WhatsApp for Windows mangling the message', () => {
    const msg = Catalog.orderMessage(order, Catalog.entries(site, {}));
    const mangled = msg.replace(/[\u{10000}-\u{10FFFF}]/gu, '�').replace(/\n/g, ' ');
    assert.equal(Catalog.readOrder(mangled).card.events[0].name, '🎂 Cake Cutting', 'emoji kept inside the code');
  });

  test('online orders end with a short, easy-to-read order number', () => {
    const ref = Catalog.orderRef();
    assert.match(ref, /^WC-[A-HJKMNP-Z2-9]{6}$/);
    const msg = Catalog.orderMessage(order, Catalog.entries(site, {}), ref);
    assert.ok(msg.endsWith(`\n\nOrder no: ${ref}`));
    assert.ok(!msg.includes('WC1.'), 'no long code');
    assert.equal(Catalog.refOf(`hi\n${msg.toLowerCase()}`), ref);
    assert.equal(Catalog.refOf('no number here'), '');
    // The order list keeps the number in front of the full code, so it still opens.
    assert.equal(Catalog.readOrder(`${ref} ${Catalog.orderCode(order)}`).card.host1, 'Neha');
  });

  test('a message without a code still picks up the design number', () => {
    assert.deepEqual(plain(Catalog.readOrder('Hi, I want design #12 please')), { card: { theme: 12 }, guests: [], photo: false, partial: true });
    assert.equal(Catalog.readOrder('hello there'), null);
    assert.equal(Catalog.readOrder('design #999'), null, 'no such design');
    assert.equal(Catalog.readOrder('WC1.%%%garbage'), null);
  });

  test('a tampered order code cannot inject odd values', () => {
    assert.equal(Catalog.readOrder(Catalog.ORDER_TAG + Codec.encode({ events: 'x' })), null, 'broken functions list: rejected');
    assert.equal(Catalog.readOrder(Catalog.ORDER_TAG + Codec.encode([1, 2])), null, 'not an order: rejected');
    const evil = Catalog.ORDER_TAG + Codec.encode({ type: 'nope', host1: { x: 1 }, design: '<b>', events: [5, { name: { a: 1 } }, null], guests: 5, rsvp: 'call me' });
    const r = Catalog.readOrder(evil);
    assert.equal(r.card.type, 'wedding');
    assert.equal(r.card.host1, '');
    assert.equal(r.card.theme, undefined);
    assert.deepEqual(plain(r.card.events), []);
    assert.deepEqual(plain(r.guests), []);
    assert.equal(r.card.rsvp, '');
  });

  test('configFile round-trips through the config loader', () => {
    const cat = Catalog.clean({ 47: { name: 'Quote " and \\ back', price: 10, featured: true } });
    const text = Catalog.configFile({ ...site, brand: "Ria's <Cards>" }, cat);
    const ctx = vm.createContext({});
    vm.runInContext(text + ';this.out = { SITE, CATALOG };', ctx);
    assert.equal(ctx.out.SITE.brand, "Ria's <Cards>");
    assert.deepEqual(plain(ctx.out.CATALOG), plain(cat));
  });

  test('the shipped config.js is valid and passes the server check', async () => {
    const { checkConfig } = await import('../server.mjs');
    const text = fs.readFileSync(path.join(ROOT, 'js', 'config.js'), 'utf8');
    const { SITE, CATALOG } = checkConfig(text);
    for (const k of ['url', 'brand', 'whatsapp', 'instagram', 'price', 'currency']) assert.ok(k in SITE, k);
    assert.deepEqual(plain(Catalog.clean(CATALOG)), plain(CATALOG), 'config.js holds only real changes');
  });
});

test.describe('Server config check', () => {
  let checkConfig;
  test.before(async () => { ({ checkConfig } = await import('../server.mjs')); });
  const good = Catalog.configFile({ url: 'https://a.vercel.app/', brand: 'X (Y)', whatsapp: '', instagram: '', price: '', currency: '₹' }, { 3: { name: "it's => fine" } });

  test('accepts what the panel writes, even with brackets and quotes inside strings', () => {
    assert.equal(checkConfig(good).CATALOG[3].name, "it's => fine");
  });
  test('rejects anything that runs code', () => {
    for (const bad of [
      'const SITE = {}; const CATALOG = {}; require("fs")',
      'const SITE = (() => ({}))(); const CATALOG = {};',
      'const SITE = {}; const CATALOG = {}; process.exit()',
      'const SITE = {a: `x`}; const CATALOG = {};',
      'const SITE = new Object(); const CATALOG = {};'
    ]) assert.throws(() => checkConfig(bad), /only contain data/, bad);
  });
  test('rejects a file without SITE and CATALOG', () => {
    assert.throws(() => checkConfig('const SITE = {};'));
    assert.throws(() => checkConfig(''));
    assert.throws(() => checkConfig(42));
  });
});

test.describe('Video Studio', () => {
  const ctx = vm.createContext({ TextEncoder, TextDecoder, btoa, atob, URL, URLSearchParams, console });
  for (const f of ['config.js', 'themes.js', 'codec.js', 'core.js', 'studio.js']) vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'), ctx, { filename: f });
  const Studio = vm.runInContext('Studio', ctx);
  const card = extra => ({ ...plain(PRESETS.wedding.card), ...extra });
  const story = (c, o = {}) => Studio.timeline(c, { ...Studio.defaults(c), ...o });
  const texts = (s, c, o = {}) => Studio.lines(s, c, { ...Studio.defaults(c), ...o }).map(l => l.s || l.t);

  test('the story: opening, invitation, the functions, save the date, closing', () => {
    const c = card({ families: [] });
    const { scenes, total } = story(c, { events: 'each' });
    assert.deepEqual(plain(scenes.map(s => s.k)), ['open', 'invite', 'event', 'event', 'event', 'event', 'event', 'date', 'end']);
    assert.equal(total, scenes.reduce((a, s) => a + s.d, 0));
    scenes.forEach((s, i) => assert.equal(s.t0, scenes.slice(0, i).reduce((a, x) => a + x.d, 0)));
    assert.deepEqual(plain(story(c, { events: 'list' }).scenes.map(s => s.k)), ['open', 'invite', 'events', 'date', 'end']);
    assert.deepEqual(plain(story(c, { events: 'none' }).scenes.map(s => s.k)), ['open', 'invite', 'date', 'end']);
    assert.equal(Studio.defaults(c).events, 'list', 'more than three functions go on one page by default');
    assert.equal(Studio.defaults(card({ events: c.events.slice(0, 2) })).events, 'each');
    assert.equal(story(card({ events: Array(9).fill({ name: 'Puja' }) }), { events: 'each' }).scenes.filter(s => s.k === 'event').length, 6, 'at most six');
    assert.deepEqual(plain(story(card({ date: '', venue: '', events: [] })).scenes.map(s => s.k)), ['open', 'invite', 'end'], 'no date and no venue: no save-the-date');
  });

  test('parents go under the right names: by what the family side says, else in order', () => {
    const fam = [{ side: "Groom's family", parents: 'Mr. & Mrs. Singh' }, { side: "Bride's family", parents: 'Mr. & Mrs. Bhatia' }];
    assert.deepEqual(plain(Studio.parents(card({ families: fam }))), ['D/o Mr. & Mrs. Bhatia', 'S/o Mr. & Mrs. Singh']);
    assert.deepEqual(plain(Studio.parents(card({ families: [{ side: 'A', parents: 'P1' }, { side: 'B', parents: 'P2' }] }))), ['D/o P1', 'S/o P2']);
    assert.deepEqual(plain(Studio.parents(card({ families: [{ side: 'x', parents: '  ' }] }))), ['', '']);
    assert.deepEqual(plain(Studio.parents({ ...plain(PRESETS.bday.card), families: fam })), ['', ''], 'only weddings and engagements');
  });

  test('the invitation says the names, the parents and "Weds"; the blessing and the line can be changed', () => {
    const c = card({ host1: 'Saumya', host2: 'Gaurav', families: [{ side: 'Bride', parents: 'Mr. Sunil Bhatia' }] });
    const s = { k: 'invite' };
    const t = texts(s, c);
    for (const want of ['ॐ', '|| Shree Ganeshay Namah ||', 'Request your gracious presence', 'Saumya', 'D/o Mr. Sunil Bhatia', 'Gaurav']) assert.ok(t.includes(want), want);
    assert.equal(Studio.lines(s, c, Studio.defaults(c)).find(l => l.t === 'div').word, 'Weds');
    assert.ok(!texts(s, c, { blessing: false }).includes('ॐ'));
    assert.ok(!texts(s, c, { parents: false }).includes('D/o Mr. Sunil Bhatia'));
    assert.deepEqual(plain(texts(s, c, { inviteLine: 'Line one\nLine two', blessing: false }).slice(0, 2)), ['Line one', 'Line two']);
    assert.equal(Studio.defaults(plain(PRESETS.kitty.card)).blessing, false, 'no blessing for a kitty party');
    assert.ok(!texts(s, { ...plain(PRESETS.bday.card), host2: '' }).includes('div'), 'one name: no "&" divider');
  });

  test('functions show the icon apart, and a time only when one was given', () => {
    const c = card();
    const ev = texts({ k: 'event', e: { name: '🌼 Haldi', date: '2026-12-10T10:00', venue: 'Lawn', dress: 'Yellow' } }, c);
    assert.ok(ev.includes('Haldi') && ev.includes('🌼') && ev.includes('10:00 AM onwards') && ev.includes('Thursday, 10th December 2026') && ev.includes('Dress code · Yellow'));
    const noTime = texts({ k: 'event', e: { name: 'Haldi', date: '2026-12-10' } }, c);
    assert.ok(!noTime.some(x => /onwards/.test(x)) && noTime.includes('Thursday, 10th December 2026'));
    assert.deepEqual(plain(Studio.splitIcon('🥂 Reception')), { icon: '🥂', name: 'Reception' });
    assert.deepEqual(plain(Studio.splitIcon('Reception')), { icon: '', name: 'Reception' });
    const cal = Studio.lines({ k: 'date' }, card({ date: '2026-12-12' }), Studio.defaults(card())).find(l => l.t === 'cal');
    assert.equal(cal.timed, false, 'date only: the calendar shows no time');
  });

  test('the closing has the families, one # on the hashtag, the RSVP number and the signature', () => {
    const c = card({ hashtag: '##GauSa', rsvp: '98765 43210', families: [{ parents: 'Mr. & Mrs. Bhatia' }] });
    const t = texts({ k: 'end' }, c);
    assert.ok(t.includes('#GauSa') && t.includes('RSVP · +91 98765 43210') && t.includes('Mr. & Mrs. Bhatia') && t.includes('Awaiting your presence'));
    assert.equal(t[t.length - 1], 'sig', '"Designed by" closes every video');
    assert.equal(Studio.phone('12345'), '');
  });

  test('ordinals', () => {
    assert.deepEqual(plain([1, 2, 3, 4, 11, 12, 13, 21, 22, 23, 26, 101, 111].map(n => Studio.ordinal(n))),
      ['1st', '2nd', '3rd', '4th', '11th', '12th', '13th', '21st', '22nd', '23rd', '26th', '101st', '111th']);
  });

  test('300 complete looks: twenty painted scenes, each in fifteen moods', () => {
    const looks = Object.entries(Studio.LOOKS);
    assert.equal(looks.length, 300);
    assert.equal(Studio.SCENES.length, 20);
    for (const scene of Studio.SCENES) assert.equal(looks.filter(([, L]) => L.scene === scene).length, 15, scene);
    for (const [id, L] of looks) {
      assert.ok(L.name && L.note && L.mood, id);
      for (const k of ['names', 'ink', 'ink2', 'accent', 'gold']) assert.match(L.col[k], /^#[0-9a-f]{6}$/i, `${id} ${k}`);
      assert.equal(L.mono.length, 2);
      assert.ok(L.font.script && L.font.serif);
      assert.ok(L.zone[0] < L.zone[1] && L.zone[1] <= 1920 && L.zone[2] <= 1080, id);
      for (const f of ['back', 'anim', 'fx', 'crest']) assert.equal(typeof L[f], 'function', `${id}.${f}`);
      assert.ok(['royal', 'romantic', 'festive'].includes(L.music), id);
      for (const [op] of L.tint || []) assert.ok(['multiply', 'soft-light', 'screen', 'color'].includes(op), id);
    }
    assert.equal(new Set(looks.map(([, L]) => Studio.lookName(L))).size, 300, 'every look has its own name');
  });

  test('each occasion starts on a look that suits it', () => {
    const look = type => Studio.defaults(plain(PRESETS[type].card)).look;
    assert.equal(look('wedding'), 'vrindavan');
    assert.equal(Studio.LOOKS[look('bday')].scene, 'party');
    assert.equal(Studio.LOOKS[look('ceremony')].scene, 'temple');
    for (const type of Object.keys(PRESETS)) assert.ok(Studio.LOOKS[look(type)], type);
  });
});

test.describe('Story videos on the website', () => {
  test('an order carries the chosen video look, and the message names it', () => {
    const order = { ...plain(PRESETS.wedding.card), design: 1, guests: [], video: 'beach-golden', videoName: 'Beach Sunset · Golden Hour' };
    const msg = Catalog.orderMessage(order, Catalog.entries());
    assert.match(msg, /• Video invitation: Beach Sunset · Golden Hour/);
    assert.equal(Catalog.readOrder(msg).video, 'beach-golden', 'the order code keeps the look');
    assert.equal(Catalog.readOrder(Catalog.orderMessage({ ...order, video: '' }, Catalog.entries())).video, '', 'no video chosen');
    assert.equal(Catalog.videoId('<script>'), '');
    assert.equal(Catalog.videoId('beach'), 'beach');
  });

  test('the website lists every Video Studio scene, each with its picture', () => {
    const ctx = vm.createContext({ TextEncoder, TextDecoder, btoa, atob, URL, URLSearchParams, console });
    for (const f of ['config.js', 'themes.js', 'codec.js', 'core.js', 'studio.js']) vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'), ctx, { filename: f });
    const Studio = vm.runInContext('Studio', ctx);
    const site = fs.readFileSync(path.join(ROOT, 'js', 'site.js'), 'utf8');
    const listed = [...site.slice(site.indexOf('const VIDEO_SCENES'), site.indexOf('];', site.indexOf('const VIDEO_SCENES'))).matchAll(/\['(\w+)', '([^']+)'/g)];
    assert.deepEqual(listed.map(m => m[1]), plain(Studio.SCENES));
    for (const [, id, name] of listed) {
      assert.equal(name, Studio.LOOKS[id].name, id);
      assert.ok(fs.statSync(path.join(ROOT, 'img', 'videos', id + '.jpg')).size > 5000, `img/videos/${id}.jpg`);
    }
  });
});
