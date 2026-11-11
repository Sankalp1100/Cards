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

  test('there are exactly 600, numbered 1 to 600 in order', () => {
    assert.equal(all.length, 600);
    all.forEach((t, i) => assert.equal(t.no, i + 1));
  });

  test('every occasion gets 20 designs', () => {
    for (const k of Object.keys(PRESETS)) assert.equal(all.filter(t => t.occasion === k).length, 30, k);
  });

  test('names are unique', () => {
    assert.equal(new Set(all.map(t => t.name)).size, 600);
  });

  test('numbers are stable: the first designs never move (links store the number)', () => {
    assert.deepEqual(plain(all.slice(0, 13).map(t => t.name)), ['Royal Maharaja', 'Blush Garden', 'Midnight Glam', 'Haldi Sunshine', 'Mehendi Green',
      'Neon Love (Y2K)', 'Candy Party', 'Baby Cloud', 'Disco Kitty', 'Filmy Bollywood', 'Golden Hour', 'Lavender Dream', 'Ruby Rajwada']);
    assert.equal(Templates.get(47).name, 'Cobalt Milestone');
    assert.equal(Templates.get(200).name, all[199].name);
    assert.equal(Templates.get(201).name, 'Lime Saat Phere', 'the new designs start at #201');
    assert.equal(Templates.get(300).name, 'Saffron Diamond Years', '#300 is still the last of the first ten occasions');
    assert.equal(Templates.get(301).occasion, 'reception', 'the ten later occasions start at #301');
    assert.deepEqual(plain(all.slice(300, 310).map(t => t.occasion)), ['reception', 'haldi', 'mehendi', 'roka', 'housewarming', 'mundan', 'janeu', 'retirement', 'festive', 'corporate']);
    assert.ok(all.slice(0, 300).every(t => !['reception', 'haldi', 'mehendi', 'roka', 'housewarming', 'mundan', 'janeu', 'retirement', 'festive', 'corporate'].includes(t.occasion)));
  });

  test('get() accepts numbers, padded strings, # and old names', () => {
    for (const id of [47, '47', '047', '#047', ' #47 ']) assert.equal(Templates.get(id).no, 47, String(id));
    assert.equal(Templates.get('royal').no, 1);
    assert.equal(Templates.get('lavender').no, 12);
    assert.equal(Templates.get('#301').no, 301);
    for (const id of [0, 601, -1, 1.5, '', 'abc', null, undefined, {}]) assert.equal(Templates.get(id), null, String(id));
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
      if (s.voice === 'pluck') assert.ok(['sangeet', 'kitty', 'bday', 'birthday', 'festive', 'corporate'].includes(t.occasion), `#${t.no}: playful pluck only for parties`);
    }
    assert.equal(new Set(all.map(t => JSON.stringify(t.song))).size, 600);
    assert.deepEqual(plain(all[0].song), { prog: 0, pattern: 0, voice: 'musicbox', key: 0 });
  });
});

test.describe('Occasion presets', () => {
  test('there are 20 occasions, Reception among them', () => {
    assert.equal(Object.keys(PRESETS).length, 20);
    for (const k of ['reception', 'haldi', 'mehendi', 'roka', 'housewarming', 'mundan', 'janeu', 'retirement', 'festive', 'corporate']) assert.ok(PRESETS[k], k);
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
    assert.equal(e.length, 600);
    assert.equal(Catalog.visible(e).length, 600);
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
    assert.equal(v.length, 599);
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
    assert.equal(e.filter(x => Catalog.matches(x, '')).length, 600);
    assert.equal(e.filter(x => Catalog.matches(x, '', 'reception')).length, 30);
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
    assert.equal(Core.orderUrl('+91 98765 43210', 'Hi'), 'https://api.whatsapp.com/send?phone=919876543210&text=Hi');
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
    assert.match(html, /--fs:&quot;(Playball|Dancing Script|Satisfy|Cookie|Pacifico|Yellowtail)&quot;, cursive/, 'and its own fonts');
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
      guests: ['Rahul Uncle', 'Priya Di'], photo: true, gallery: false, video: '', videoLang: ''
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

  test('pasting anything never breaks the panel: random text, cut-off and garbled orders, odd dates', () => {
    let seed = 7;
    const rnd = n => { seed = (seed * 1103515245 + 12345) >>> 0; return seed % n; };
    const CHARS = 'ab Z09#*•:;,()&-–\n\t/.@+🌼हिWC1.-_' + '\u0000￿';
    const msg = Catalog.orderMessage({ ...order, type: 'wedding', host2: 'Arjun', events: [{ name: 'Haldi', date: '2026-11-27T10:00', venue: 'Home', dress: 'Yellow' }] }, Catalog.entries(site, {}));
    const typed = msg.split('\n').filter(l => !/Order code/.test(l)).join('\n');
    const texts = [
      ...Array.from({ length: 300 }, () => Array.from({ length: rnd(200) }, () => CHARS[rnd(CHARS.length)]).join('')),
      ...Array.from({ length: Math.ceil(msg.length / 5) }, (_, i) => msg.slice(0, i * 5)), // cut off anywhere, the code too
      ...Array.from({ length: Math.ceil(typed.length / 5) }, (_, i) => typed.slice(i * 5)),
      typed.replace(/:/g, ''), typed.replace(/\(/g, '').replace(/\)/g, ''), typed.toUpperCase(), typed.replace(/;/g, ';;;'),
      '* Names: \n* Functions: ;;;', '* Functions: (((', '* Date: 99 Foo 2026', 'WC1.' + 'A'.repeat(5000), 'x'.repeat(100000)
    ];
    for (const text of texts) {
      let r;
      assert.doesNotThrow(() => { r = Catalog.readOrder(text); }, JSON.stringify(text.slice(0, 80)));
      if (!r) continue;
      if (r.partial) { assert.ok(Templates.get(r.card.theme)); continue; }
      assert.ok(PRESETS[r.card.type], 'a known occasion');
      for (const k of ['host1', 'host2', 'venue', 'message', 'title', 'tagline']) assert.equal(typeof r.card[k], 'string', k);
      assert.ok(Array.isArray(r.card.events) && Array.isArray(r.guests));
      for (const s of [r.card.date, ...r.card.events.map(e => e.date)]) if (s) assert.ok(Core.parseDate(s) && !isNaN(Core.parseDate(s)), `a real date: ${s}`);
    }
    // Dates: only real ones, in the card's own format
    for (const [s, want] of [['31 Feb 2026', ''], ['0 Dec 2026', ''], ['32/1/2026', ''], ['1/13/2026', ''], ['12 Dec 2026, 25:00', '2026-12-12'],
      ['12 Dec 2026 12 am', '2026-12-12T00:00'], ['12 Dec 2026 12:30 pm', '2026-12-12T12:30'], ['Sat, 12th Dec 2026, 7 pm', '2026-12-12T19:00'], ['', '']]) {
      assert.equal(Catalog.readWhen(s), want, s);
    }
  });

  test('a message without its order code is read from its lines: the same order, emoji aside', () => {
    const full = {
      ...order, type: 'wedding', host2: 'Arjun', nick2: 'Arju', mapUrl: 'https://maps.app.goo.gl/abc',
      events: [{ name: 'Haldi', date: '2026-11-27T10:00', venue: 'Poolside', dress: 'Yellow' }, { name: 'Sangeet', date: '2026-11-27', venue: 'Home, Agra', dress: '' },
        { name: 'Pheras', date: '2026-11-28T23:30', venue: '', dress: 'Red' }],
      ...Catalog.specialLines({ story: '2001 – Met at college – Same bus every day', families: 'Her family – Mr. & Mrs. Rao – With Kiran', attire: 'Party – Gold' }),
      upi: 'neha@okicici', hashtag: '#Neha30', giftNote: 'No gifts please', venueNote: 'Parking at gate 2', thanks: 'Love you all',
      title: 'Party time', tagline: 'is turning thirty', gallery: true, music: false
    };
    const msg = Catalog.orderMessage(full, Catalog.entries(site, {}));
    const coded = Catalog.readOrder(msg), noEmoji = s => String(s).replace(/[\u{10000}-\u{10FFFF}️]/gu, '').trim();
    const without = msg.split('\n').filter(l => !/Order code/.test(l)).join('\n');
    // As sent, with WhatsApp's own "*" bullets, and as one long line (WhatsApp for Windows drops the line breaks)
    for (const text of [without, without.replace(/•/g, '*'), without.replace(/\n/g, ' ')]) {
      const r = Catalog.readOrder(text);
      assert.equal(r.typed, true);
      for (const k of ['type', 'theme', 'host1', 'host2', 'date', 'venue', 'mapUrl', 'message', 'rsvp', 'title', 'tagline', 'music', 'upi', 'hashtag', 'giftNote', 'venueNote', 'thanks'])
        assert.equal(r.card[k], coded.card[k], k);
      assert.equal(r.card.nick1, 'Nehu');
      assert.deepEqual(plain(r.card.events), plain(coded.card.events).map(e => ({ ...e, name: noEmoji(e.name) })));
      for (const k of ['story', 'families']) assert.deepEqual(plain(r.card[k]), plain(coded.card[k]), k);
      assert.equal(r.card.attire[0].text, 'Gold');
      assert.deepEqual(plain(r.guests), plain(coded.guests));
      assert.equal(r.photo, true); assert.equal(r.gallery, true);
    }
    // Dates as people type them
    assert.equal(Catalog.readWhen('Tue, 1 dec, 2026, 9:00 pm'), '2026-12-01T21:00');
    assert.equal(Catalog.readWhen('12th December 2026'), '2026-12-12');
    assert.equal(Catalog.readWhen('5/1/2027 7:05 am'), '2027-01-05T07:05');
    assert.equal(Catalog.readWhen('soon'), '');
    // Only a design number: still just the design
    assert.equal(Catalog.readOrder('I like design #083').partial, true);
  });

  test('premium sections are cleaned before they are shown (only safe colours, links and sizes)', () => {
    const x = Core.extras({
      story: [{ title: 'x'.repeat(500), when: 5 }, 'junk', null], gallery: ['javascript:alert(1)', 'https://a.com/p.jpg', 'data:text/html,hi'],
      attire: [{ name: 'Haldi', colors: '#ffcc00, red, #12345, url(x)' }], upi: 'a b<script>@ok'
    });
    assert.equal(x.story.length, 1);
    assert.equal(x.story[0].title.length, 60);
    assert.equal(x.story[0].when, '');
    assert.deepEqual(plain(x.gallery), ['https://a.com/p.jpg']);
    assert.deepEqual(plain(x.attire[0].colors), ['#ffcc00']);
    assert.equal(x.upi, 'abscript@ok');
    assert.equal(x.rsvpForm, false, 'no RSVP form unless switched on');
    assert.equal(Core.extras({ rsvpForm: true }).rsvpForm, true);
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

  test('the story: doors and blessing, title, invitation, the functions, the venue, regards, thank you', () => {
    const c = card({ families: [] });
    const { scenes, total } = story(c, { events: 'each' });
    assert.deepEqual(plain(scenes.map(s => s.k)), ['open', 'title', 'invite', 'event', 'event', 'event', 'event', 'event', 'date', 'end', 'final']);
    assert.equal(total, scenes.reduce((a, s) => a + s.d, 0));
    assert.ok(total <= 60, `${total}s fits one WhatsApp status`);
    scenes.forEach((s, i) => assert.equal(s.t0, scenes.slice(0, i).reduce((a, x) => a + x.d, 0)));
    assert.ok(scenes[0].doors && scenes[0].ganesha, 'a wedding opens on doors and Shri Ganesh');
    assert.ok(!scenes[1].couple, 'no couple without their photo');
    assert.ok(story(c, { coupleArt: 'drawn' }).scenes[1].couple, 'the drawn couple when chosen');
    assert.ok(story(c, { photos: { couple: {} } }).scenes[1].couple, 'their photo on the title');
    assert.ok(!story(c, { ganeshaArt: 'none' }).scenes[0].ganesha, 'Ganesh ji can be left out');
    assert.ok(!story(c, { signature: false }).scenes.some(s => s.sigCorner), 'signature off: no "Designed by"');
    assert.ok(story(c, { brand: false }).scenes.some(s => s.sigCorner), 'website off, signature on: still signed');
    assert.ok(scenes[scenes.length - 1].sigCorner, 'the designer signs the last scene');
    assert.deepEqual(plain(story(c, { events: 'list' }).scenes.map(s => s.k)), ['open', 'title', 'invite', 'events', 'date', 'end', 'final']);
    assert.deepEqual(plain(story(c, { events: 'none' }).scenes.map(s => s.k)), ['open', 'title', 'invite', 'date', 'end', 'final']);
    assert.equal(Studio.defaults(c).events, 'each', 'every function on its own screen by default');
    // Each function in its own scenery, in the look's mood: Haldi, Mehendi, Sangeet, Pheras, Reception all differ
    const looks = story(c, { look: 'blush-ocean' }).scenes.filter(s => s.k === 'event').map(s => s.look);
    assert.equal(new Set(looks).size, looks.length, looks.join(', '));
    assert.ok(looks.every(l => Studio.LOOKS[l]), looks.join(', '));
    const sceneOf = l => l.split('-')[0];
    assert.ok(['haldi', 'vrindavan', 'clouds', 'rosegarden'].includes(sceneOf(looks[0])) && ['mandap', 'temple', 'lotusnight', 'diwali'].includes(sceneOf(looks[3])), looks.join(', '));
    for (const look of Object.keys(Studio.LOOKS)) {
      const sc = story(c, { look }).scenes;
      sc.forEach((s, i) => { if (s.k === 'event' && sc[i - 1].k === 'event') assert.notEqual(s.look, sc[i - 1].look, `${look}: two function screens in a row share ${s.look}`); });
    }
    const six = story(card({ families: [], events: ['Haldi', 'Mehendi', 'Sangeet', 'Baraat', 'Pheras', 'Reception'].map(name => ({ name })) }));
    assert.ok(six.total <= 60, `six functions: ${six.total}s still fits a WhatsApp status`);
    assert.equal(Studio.defaults(card({ events: c.events.slice(0, 2) })).events, 'each');
    assert.equal(story(card({ events: Array(9).fill({ name: 'Puja' }) }), { events: 'each' }).scenes.filter(s => s.k === 'event').length, 6, 'at most six');
    assert.deepEqual(plain(story(card({ date: '', venue: '', events: [] })).scenes.map(s => s.k)), ['open', 'title', 'invite', 'end', 'final'], 'no date and no venue: no venue scene');
    const party = story(plain(PRESETS.bday.card)).scenes;
    assert.ok(!party[0].ganesha && !party[1].couple, 'a birthday: no Ganesha, no couple');
  });

  test('parents go under the right names: by what the family side says, else in order (and in Hindi)', () => {
    const fam = [{ side: "Groom's family", parents: 'Mr. & Mrs. Singh' }, { side: "Bride's family", parents: 'Mr. & Mrs. Bhatia' }];
    assert.deepEqual(plain(Studio.parents(card({ families: fam }))), ['D/o Mr. & Mrs. Bhatia', 'S/o Mr. & Mrs. Singh']);
    assert.deepEqual(plain(Studio.parents(card({ families: fam }), 'hi')), ['सुपुत्री Mr. & Mrs. Bhatia', 'सुपुत्र Mr. & Mrs. Singh']);
    assert.deepEqual(plain(Studio.parents(card({ families: [{ side: 'A', parents: 'P1' }, { side: 'B', parents: 'P2' }] }))), ['D/o P1', 'S/o P2']);
    assert.deepEqual(plain(Studio.parents(card({ families: [{ side: 'x', parents: '  ' }] }))), ['', '']);
    assert.deepEqual(plain(Studio.parents({ ...plain(PRESETS.bday.card), families: fam })), ['', ''], 'only weddings and engagements');
  });

  test('the blessing, the title and the invitation, in English and in Hindi', () => {
    const c = card({ host1: 'Saumya', host2: 'Gaurav', families: [{ side: 'Bride', parents: 'Mr. Sunil Bhatia' }],
      date: '2026-12-12T19:30', events: [{ name: 'Haldi', date: '2026-12-09T13:00' }] });
    const open = { k: 'open', ganesha: { y: 600, s: 760 } };
    assert.deepEqual(plain(texts(open, c)), ['॥ श्री गणेशाय नमः ॥']);
    assert.ok(Studio.lines(open, c, Studio.defaults(c))[0].gold, 'gold lettering');
    const fin = texts({ k: 'final' }, c, { brand: false });
    assert.ok(!fin.includes('qr') && !fin.includes('cardalbum.vercel.app'), 'branding off: no QR code, no website');
    assert.deepEqual(plain(texts({ k: 'title' }, c)), ['mono', 'Wedding Invitation', 'Saumya & Gaurav', '9 – 12 December 2026']);
    assert.deepEqual(plain(texts({ k: 'title' }, c, { lang: 'hi' })), ['mono', 'शुभ विवाह', 'Saumya & Gaurav', '9 से 12 दिसम्बर 2026']);
    const t = texts({ k: 'invite' }, c);
    for (const want of ['Request your gracious presence', 'Saumya', 'D/o Mr. Sunil Bhatia', 'Gaurav']) assert.ok(t.includes(want), want);
    assert.equal(Studio.lines({ k: 'invite' }, c, Studio.defaults(c)).find(l => l.t === 'div').word, 'Weds');
    const h = Studio.lines({ k: 'invite' }, c, Studio.defaults(c, 'hi'));
    assert.equal(h.find(l => l.t === 'div').word, 'संग');
    assert.ok(h.some(l => l.s === 'सुपुत्री Mr. Sunil Bhatia'));
    assert.ok(h.filter(l => l.t === 'text').every(l => /^(hname|hser|deva)$/.test(l.f)), 'Hindi lettering throughout');
    assert.ok(!texts({ k: 'invite' }, c, { parents: false }).includes('D/o Mr. Sunil Bhatia'));
    assert.deepEqual(plain(texts({ k: 'invite' }, c, { inviteLine: 'Line one\nLine two' }).slice(0, 2)), ['Line one', 'Line two']);
    assert.equal(Studio.defaults(plain(PRESETS.kitty.card)).blessing, false, 'no blessing for a kitty party');
    assert.ok(!texts({ k: 'invite' }, { ...plain(PRESETS.bday.card), host2: '' }).includes('div'), 'one name: no "&" divider');
  });

  test('functions show the icon apart, a time only when one was given, and Hindi days and times', () => {
    const c = card();
    const ev = texts({ k: 'event', e: { name: '🌼 Haldi', date: '2026-12-10T10:00', venue: 'Lawn', dress: 'Yellow' } }, c);
    assert.ok(ev.includes('Haldi') && ev.includes('🌼') && ev.includes('10:00 AM onwards') && ev.includes('Thursday, 10th December 2026') && ev.includes('Dress code · Yellow'));
    const noTime = texts({ k: 'event', e: { name: 'Haldi', date: '2026-12-10' } }, c);
    assert.ok(!noTime.some(x => /onwards/.test(x)) && noTime.includes('Thursday, 10th December 2026'));
    const hi = ev2 => texts({ k: 'event', e: ev2 }, c, { lang: 'hi' });
    assert.ok(hi({ name: 'Haldi', date: '2026-12-09T13:00' }).includes('दोपहर 1 बजे') && hi({ name: 'Haldi', date: '2026-12-09T13:00' }).includes('बुधवार, 9 दिसम्बर 2026'));
    assert.ok(hi({ name: 'Mehendi', date: '2026-12-10T18:30' }).includes('सायं 6:30 बजे'));
    assert.ok(hi({ name: 'Puja', date: '2026-12-10T09:00' }).includes('प्रातः 9 बजे'));
    assert.ok(hi({ name: 'Sangeet', date: '2026-12-10T20:00' }).includes('रात्रि 8 बजे'));
    assert.deepEqual(plain(Studio.splitIcon('🥂 Reception')), { icon: '🥂', name: 'Reception' });
    assert.deepEqual(plain(Studio.splitIcon('Reception')), { icon: '', name: 'Reception' });
    const cal = Studio.lines({ k: 'date' }, card({ date: '2026-12-12' }), Studio.defaults(card())).find(l => l.t === 'cal');
    assert.equal(cal.timed, false, 'date only: the calendar shows no time');
  });

  test('the closing has the families, one # on the hashtag and the RSVP number; the last scene the QR code', () => {
    const c = card({ hashtag: '##GauSa', rsvp: '98765 43210', families: [{ parents: 'Mr. & Mrs. Bhatia' }] });
    const t = texts({ k: 'end' }, c);
    assert.ok(t.includes('#GauSa') && t.includes('RSVP · +91 98765 43210') && t.includes('Mr. & Mrs. Bhatia') && t.includes('Awaiting your presence'));
    assert.ok(texts({ k: 'end' }, c, { lang: 'hi' }).includes('आपकी प्रतीक्षा में'));
    const fin = Studio.lines({ k: 'final' }, c, Studio.defaults(c));
    assert.ok(fin.some(l => l.t === 'qr' && l.rows === Studio.SITE_QR) && fin.some(l => l.s === 'cardalbum.vercel.app'));
    assert.ok(Studio.SITE_QR.length >= 21 && Studio.SITE_QR.every(r => r.length === Studio.SITE_QR.length && /^[01]+$/.test(r)), 'a square QR code');
    assert.equal(Studio.phone('12345'), '');
  });

  test('thirteen story films: real looks for every part, a function takes a scenery that suits it, each its own tune', () => {
    const { TUNES } = require(path.join(ROOT, 'js', 'tunes.js'));
    const films = Object.entries(Studio.STORIES);
    assert.equal(films.length, 13);
    for (const [id, S] of films) {
      assert.match(id, /^story-[a-z]+$/);
      assert.ok(TUNES[S.tune], `${id} tune`);
      const tl = story(card(), { story: id, events: 'each' });
      for (const sc of tl.scenes) assert.ok(Studio.LOOKS[sc.look], `${id}: ${sc.k} → ${sc.look}`);
      assert.ok(tl.total <= 60, `${id}: ${tl.total}s`);
    }
    const looks = story(card({ events: [{ name: '🌼 Haldi' }, { name: 'Mehendi Night' }, { name: 'Baraat' }] }), { story: 'story-night', events: 'each' }).scenes.filter(s => s.k === 'event').map(s => s.look);
    assert.ok(['haldi', 'vrindavan', 'clouds', 'rosegarden'].includes(looks[0].split('-')[0]), looks[0]);
    assert.ok(['mehendi', 'rosegarden', 'jharokha', 'blush'].includes(looks[1].split('-')[0]), looks[1]);
    assert.ok(['haveli', 'palace', 'marigold', 'diwali'].includes(looks[2].split('-')[0]), looks[2]);
    assert.ok(new Set(films.map(([, S]) => S.tune)).size >= 11, 'nearly every film sounds different');
  });

  test('variety: Haldi, Mehendi, Sangeet… look different from video to video (never the same in neighbouring videos)', () => {
    const c = card({ families: [] }), isLight = L => { const m = String(L.shadow[0]).match(/\d+/g) || []; return m.length >= 3 && +m[0] > 200 && +m[1] > 200 && +m[2] > 200; };
    const videos = [...Object.keys(Studio.STORIES).map(story => ({ story })), ...Object.keys(Studio.LOOKS).map(look => ({ look }))];
    const seen = {};
    let before = null;
    for (const v of videos) {
      const sc = story(c, { ...v, look: v.look || Studio.STORIES[v.story].open }).scenes, byName = {};
      sc.forEach((s, i) => {
        if (s.k !== 'event') return;
        assert.ok(Studio.LOOKS[s.look], s.look);
        assert.notEqual(s.look.split('-')[0], sc[i - 1].look && sc[i - 1].look.split('-')[0], `${v.story || v.look}: ${s.e.name} in the same scenery as the screen before`);
        if (/Haldi|Mehendi/.test(s.e.name)) assert.ok(isLight(Studio.LOOKS[s.look]), `${s.e.name} is a daytime function: ${s.look}`);
        if (/Sangeet|Reception/.test(s.e.name)) assert.ok(!isLight(Studio.LOOKS[s.look]), `${s.e.name} is an evening function: ${s.look}`);
        byName[s.e.name] = s.look;
        (seen[s.e.name] = seen[s.e.name] || new Set()).add(s.look);
      });
      if (before) for (const k in byName) assert.notEqual(byName[k], before[k], `${v.story || v.look}: ${k} the same as the video before`);
      before = byName;
    }
    for (const [k, set] of Object.entries(seen)) assert.ok(set.size >= 40, `${k}: only ${set.size} different screens`);
  });

  test('each function’s screen shows what was set for it: its own heading, venue line and quote, with any part left out', () => {
    const c = card({ families: [] });
    const set = { screens: [{ title: 'Haldi Ceremony', top: '', venue: 'Our home', quote: 'Haldi ka rang, apno ka sang', dress: false, couple: false, time: false }] };
    const sc = story(c, set).scenes.filter(s => s.k === 'event');
    assert.ok(!sc[0].couple, 'the couple left out where asked'); // (the library pictures are not loaded here)
    const words = s => Studio.lines(s, c, { ...Studio.defaults(c), ...set }).map(l => l.s).filter(Boolean);
    const first = words(sc[0]);
    for (const w of ['Haldi Ceremony', 'Our home', 'Haldi ka rang, apno ka sang']) assert.ok(first.includes(w), w);
    assert.ok(!first.some(w => /Dress code|onwards|cordially/.test(w)), first.join(' | '));
    assert.ok(words(sc[1]).some(w => /Dress code/.test(w)) && words(sc[1]).includes('Garden Courtyard'), 'the other screens as in the order');
    // Suggested quotes: for the function, in the video's language
    assert.ok(Studio.quotesFor('🌼 Haldi', 'en')[0].includes('turmeric'));
    assert.ok(/हल्दी/.test(Studio.quotesFor('हल्दी', 'hi')[0]));
    assert.ok(Studio.quotesFor('Something else', 'en').length >= 3, 'general ones for any function');
    // The second name first
    const sw = Studio.swapNames({ ...c, nick1: 'Di', nick2: 'Aaru', families: [{ parents: 'A' }, { parents: 'B' }] });
    assert.deepEqual(plain([sw.host1, sw.host2, sw.nick1, sw.families[0].parents]), ['Aarav', 'Diya', 'Aaru', 'B']);
    assert.equal(Studio.swapNames({ ...c, host2: '' }).host1, 'Diya', 'one name: nothing to swap');
  });

  test('functions named in Hindi get the scenery that suits them too', () => {
    const c = card({ families: [], events: ['हल्दी', 'मेहँदी', 'संगीत', 'बारात', 'फेरे', 'प्रीतिभोज'].map(name => ({ name, date: '2026-12-01T10:00' })) });
    const looks = story(c, { look: 'vrindavan' }).scenes.filter(s => s.k === 'event').map(s => s.look.split('-')[0]);
    const want = [['haldi', 'vrindavan', 'clouds', 'rosegarden'], ['mehendi', 'rosegarden', 'jharokha', 'blush'], ['lights', 'disco', 'party', 'galaxy'],
      ['haveli', 'palace', 'marigold', 'diwali'], ['mandap', 'temple', 'lotusnight', 'diwali'], ['palace', 'galaxy', 'lights', 'diwali']];
    looks.forEach((l, i) => assert.ok(want[i].includes(l), `${c.events[i].name} → ${l}`));
    const film = story(c, { story: 'story-shahi' }).scenes.filter(s => s.k === 'event').map(s => s.look);
    assert.deepEqual(plain(film), ['haldi-saffron', 'mehendi-emerald', 'lights-roseblush', 'haveli-pink', 'mandap-golden', 'palace-plum']);
  });

  test('variety: every look opens, changes scene and lays out its words in its own way', () => {
    const fmt = id => JSON.stringify(plain(Studio.variant(id)));
    const looks = Object.keys(Studio.LOOKS), films = Object.keys(Studio.STORIES);
    for (const id of [...looks, ...films]) {
      const v = Studio.variant(id);
      assert.ok(Studio.OPENINGS.includes(v.open) && Studio.CHANGES.includes(v.change) && Studio.LAYOUTS_V.includes(v.layout) && Studio.ENTRANCES.includes(v.enter), id);
    }
    assert.equal(new Set(films.map(fmt)).size, films.length, 'no two story films alike');
    for (const scene of Studio.SCENES) {
      const moods = looks.filter(id => Studio.LOOKS[id].scene === scene);
      assert.ok(new Set(moods.map(fmt)).size >= 12, `${scene}: its moods differ`);
    }
    for (const k of ['open', 'change', 'layout', 'enter']) assert.equal(new Set(looks.map(id => Studio.variant(id)[k])).size, { open: 6, change: 5, layout: 5, enter: 4 }[k], `every ${k} is used`);
    assert.equal(fmt('vrindavan'), fmt('vrindavan'), 'the same look always plays the same way');
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
      assert.ok(require(path.join(ROOT, 'js', 'tunes.js')).TUNES[L.music], `${id} tune`);
      for (const [op] of L.tint || []) assert.ok(['multiply', 'soft-light', 'screen', 'color'].includes(op), id);
    }
    assert.equal(new Set(looks.map(([, L]) => Studio.lookName(L))).size, 300, 'every look has its own name');
    assert.equal(new Set(looks.map(([, L]) => L.music)).size, 12, 'twelve different tunes across the scenes');
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
    // a story film, in Hindi
    const film = Catalog.orderMessage({ ...order, video: 'story-rajwada', videoName: 'Story film: Royal Rajwada', videoLang: 'hi' }, Catalog.entries());
    assert.match(film, /• Video invitation: Story film: Royal Rajwada \(Hindi\)/);
    assert.deepEqual([Catalog.readOrder(film).video, Catalog.readOrder(film).videoLang], ['story-rajwada', 'hi']);
  });

  test('the website lists every Video Studio scene, each with its picture', () => {
    const ctx = vm.createContext({ TextEncoder, TextDecoder, btoa, atob, URL, URLSearchParams, console });
    for (const f of ['config.js', 'themes.js', 'codec.js', 'core.js', 'studio.js']) vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'), ctx, { filename: f });
    const Studio = vm.runInContext('Studio', ctx);
    const site = fs.readFileSync(path.join(ROOT, 'js', 'site.js'), 'utf8');
    const listed = [...site.slice(site.indexOf('const VIDEO_SCENES'), site.indexOf('];', site.indexOf('const VIDEO_SCENES'))).matchAll(/\['(\w+)', '([^']+)'/g)];
    assert.deepEqual(listed.map(m => m[1]), plain(Studio.SCENES));
    for (const [, id, name] of listed) assert.equal(name, Studio.LOOKS[id].name, id);
    // All 300 looks and the 12 story films are on the website (js/videolooks.js), each with its picture
    const { VIDEO_LOOKS, VIDEO_STORIES } = require(path.join(ROOT, 'js', 'videolooks.js'));
    const { TUNES } = require(path.join(ROOT, 'js', 'tunes.js'));
    assert.deepEqual(VIDEO_LOOKS, Object.entries(Studio.LOOKS).map(([id, L]) => [id, L.scene, L.mood]), 'js/videolooks.js matches the Video Studio');
    assert.deepEqual(VIDEO_STORIES, Object.entries(Studio.STORIES).map(([id, S]) => [id, S.name, S.note, TUNES[S.tune].label]));
    assert.equal(VIDEO_LOOKS.length, 300);
    for (const [id] of VIDEO_LOOKS) assert.ok(fs.statSync(path.join(ROOT, 'img', 'videos', id + '.jpg')).size > 4000, `img/videos/${id}.jpg`);
    for (const [id] of VIDEO_STORIES) assert.ok(fs.statSync(path.join(ROOT, 'img', 'stories', id + '.jpg')).size > 4000, `img/stories/${id}.jpg`);
  });
});

test.describe('Client videos (v.html)', { skip: !fs.existsSync(path.join(ROOT, 'js', 'promos.js')) && 'no client videos here' }, () => {
  const ctx = vm.createContext({ TextEncoder, TextDecoder, btoa, atob, URL, URLSearchParams, console });
  if (fs.existsSync(path.join(ROOT, 'js', 'promos.js'))) for (const f of ['config.js', 'themes.js', 'codec.js', 'core.js', 'studio.js', 'promos.js']) vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'), ctx, { filename: f });
  const { Studio, PROMOS, SITE_QR } = fs.existsSync(path.join(ROOT, 'js', 'promos.js')) ? vm.runInContext('({ Studio, PROMOS, SITE_QR })', ctx) : {};

  test('every client video is complete: real looks, under a minute, ends on the QR code and the signature', () => {
    for (const [id, p] of Object.entries(PROMOS)) {
      const tl = Studio.timeline(p.card, { ...Studio.defaults(p.card), script: p.script });
      assert.ok(tl.total <= 60, `${id}: ${tl.total}s fits one WhatsApp status`);
      for (const s of p.script) assert.ok(Studio.LOOKS[s.look], `${id}: look ${s.look}`);
      const last = p.script[p.script.length - 1];
      assert.ok(last.sigCorner, `${id}: ends with the designer's signature`);
      assert.ok(last.items.some(it => it.t === 'qr'), `${id}: ends with the QR code`);
      assert.ok(require(path.join(ROOT, 'js', 'tunes.js')).TUNES[p.music], id);
      assert.ok(fs.existsSync(path.join(ROOT, 'img', 'promo', id + '.jpg')), `${id}: link preview picture`);
    }
    assert.ok(SITE_QR.length >= 21 && SITE_QR.every(r => r.length === SITE_QR.length && /^[01]+$/.test(r)), 'a square QR code');
  });

  test('the video page opens the website at the end, and /v leads to it', () => {
    const page = fs.readFileSync(path.join(ROOT, 'v.html'), 'utf8');
    assert.match(page, /t >= player\.total - \.1/);
    assert.match(page, /location\.href = site/);
    assert.ok(JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8')).rewrites.some(r => r.source === '/v' && r.destination === '/v.html'));
  });
});

// ---------- MP4Fix: the browser's recording made into a standard MP4 that WhatsApp accepts ----------
test.describe('MP4Fix', () => {
  const MP4Fix = require('../js/mp4fix.js');
  const crypto = require('node:crypto');
  const fixture = name => new Uint8Array(fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', name)));
  // A plain reader for standard MP4s (its own, not MP4Fix's): the boxes, and each track's samples
  // from its sample tables (sizes, chunk offsets, samples per chunk, durations, keyframes).
  const boxes = (d, s, e) => {
    const out = [];
    for (let o = s; o + 8 <= e;) {
      const v = new DataView(d.buffer, d.byteOffset);
      let size = v.getUint32(o), head = 8;
      if (size === 1) { size = Number(v.getBigUint64(o + 8)); head = 16; } else if (size === 0) size = e - o;
      out.push({ type: String.fromCharCode(...d.subarray(o + 4, o + 8)), start: o, end: o + size, body: o + head });
      o += size;
    }
    return out;
  };
  const kid = (d, b, t) => boxes(d, b.body, b.end).find(x => x.type === t);
  function tracks(d) {
    const v = new DataView(d.buffer, d.byteOffset), u = o => v.getUint32(o), res = {};
    const moov = boxes(d, 0, d.length).find(x => x.type === 'moov');
    for (const trak of boxes(d, moov.body, moov.end).filter(x => x.type === 'trak')) {
      const tkhd = kid(d, trak, 'tkhd'), id = u(tkhd.body + (d[tkhd.body] ? 20 : 12));
      const stbl = kid(d, kid(d, kid(d, trak, 'mdia'), 'minf'), 'stbl'), get = t => kid(d, stbl, t);
      const sz = get('stsz'), fixed = u(sz.body + 4), n = u(sz.body + 8);
      const sizes = Array.from({ length: n }, (_, i) => fixed || u(sz.body + 12 + i * 4));
      const co = get('stco'), offsets = Array.from({ length: u(co.body + 4) }, (_, i) => u(co.body + 8 + i * 4));
      const sc = get('stsc'), runs = Array.from({ length: u(sc.body + 4) }, (_, i) => [u(sc.body + 8 + i * 12), u(sc.body + 12 + i * 12)]);
      const ts = get('stts'), durations = [];
      for (let i = 0; i < u(ts.body + 4); i++) for (let k = 0; k < u(ts.body + 8 + i * 8); k++) durations.push(u(ts.body + 12 + i * 8));
      const ss = get('stss'), sync = ss ? Array.from({ length: u(ss.body + 4) }, (_, i) => u(ss.body + 8 + i * 4)) : null;
      const at = [];
      let s = 0;
      offsets.forEach((off, c) => {
        const per = runs.filter(([first]) => first <= c + 1).pop()[1];
        for (let k = 0; k < per && s < n; k++, s++) { at.push(off); off += sizes[s]; }
      });
      const md5 = crypto.createHash('md5');
      sizes.forEach((size, i) => md5.update(d.subarray(at[i], at[i] + size)));
      res[id] = { count: n, duration: durations.reduce((a, x) => a + x, 0), md5: md5.digest('hex'), sync, durations };
    }
    return res;
  }
  // Worked out separately (tests/fixtures, read sample by sample by an independent reader): an 8-second Chrome
  // recording, H.264 video (track 1) and AAC sound (track 2), in three fragments
  const EXPECTED = { 1: { count: 188, duration: 240315, md5: 'b4f3a47638baf17e9c0cbf63612092a7' }, 2: { count: 355, duration: 363238, md5: '5324f3f0fd521b2cf613a677a003a565' } };

  for (const name of ['chrome-recording.mp4', 'chrome-recording-split.mp4']) {
    test(`${name}: every frame and sound sample kept, in order, with its timing, in a standard fast-start MP4`, () => {
      const out = MP4Fix.defragment(fixture(name));
      assert.deepEqual(boxes(out, 0, out.length).map(b => b.type), ['ftyp', 'moov', 'mdat'], 'index first, then the media: no fragments');
      const moov = boxes(out, 0, out.length).find(b => b.type === 'moov');
      assert.equal(boxes(out, moov.body, moov.end).some(b => b.type === 'mvex'), false, 'no fragment defaults left');
      const got = tracks(out);
      for (const [id, want] of Object.entries(EXPECTED)) {
        assert.deepEqual({ count: got[id].count, duration: got[id].duration, md5: got[id].md5 }, want, `track ${id}`);
      }
      assert.equal(got[1].sync[0], 1, 'the video starts on a keyframe');
      assert.ok(got[1].sync.length < got[1].count, 'only some frames are keyframes');
      assert.ok(got[1].durations.every(x => x > 0), 'no frame without a length');
    });
  }

  test('a standard MP4, or bytes that are not an MP4, come back as they are', () => {
    const once = MP4Fix.defragment(fixture('chrome-recording.mp4'));
    assert.equal(MP4Fix.defragment(once), once);
    const junk = new Uint8Array(500).map((_, i) => (i * 37) & 255);
    assert.equal(MP4Fix.defragment(junk), junk);
  });
});

test.describe('premium films (js/films.js)', () => {
  const Films = require('../js/films.js');
  test('81 films, Royal Darbar first, no two alike', () => {
    assert.equal(Films.LIST.length, 81);
    assert.equal(Films.LIST[0].id, 'film-royal-darbar');
    const uniq = f => new Set(Films.LIST.map(f)).size;
    assert.equal(uniq(f => f.id), 81, 'ids');
    assert.equal(uniq(f => f.name), 81, 'names');
    assert.equal(uniq(f => f.theme + '|' + f.frame), 81, 'every film its own palette × frame');
    Films.LIST.slice(1).forEach((f, i) => {
      const prev = Films.LIST[i];
      assert.ok(f.theme !== prev.theme && f.frame !== prev.frame, `${f.id} looks different from the film before it`);
    });
  });
  test('every film has its own sample names, and no real client details', () => {
    const who = Films.LIST.map(f => { const d = Films.details(f, 'en'); return d.solo ? d.A : `${d.A} & ${d.B}`; });
    assert.equal(new Set(who).size, 81);
    for (const lang of ['en', 'hi']) for (const f of Films.LIST) {
      const all = JSON.stringify(Films.script(f, lang));
      assert.doesNotMatch(all, /Shivam|Aanya|Ashirwad|98180|91368|शिवम|आन्या/i, `${f.id} (${lang})`);
    }
  });
  test('each film plays in English and Hindi with all its parts', () => {
    for (const f of Films.LIST) for (const lang of ['en', 'hi']) {
      const { scenes, total } = Films.script(f, lang);
      assert.ok(total > 25 && total < 60, `${f.id} lasts ${total}s`);
      for (const k of ['open', 'title', 'card', 'day', 'venue', 'finale']) assert.ok(scenes.some(s => s.k === k), `${f.id} has ${k}`);
    }
  });
  test('every film has its picture', () => {
    for (const f of Films.LIST) assert.ok(fs.existsSync(path.join(ROOT, 'img', 'films', f.id + '.jpg')), f.id);
  });
});

test.describe('card PDF → details (js/pdfcard.js)', () => {
  const PdfCard = require('../js/pdfcard.js'), Films = require('../js/films.js');
  test('an English card: names, parents, functions with dates and times, venue, address, phones', () => {
    const d = PdfCard.parse(['|| Shri Ganeshaya Namah ||', 'Wedding Invitation', 'Rohit weds Ananya', 'S/o Smt. Sunita & Shri Mahesh Sharma', 'D/o Smt. Kiran & Shri Rakesh Gupta',
      'Haldi: Friday, 11 December 2026, 11:00 AM', 'Mehendi: 11 December 2026, 5:00 PM', 'Baraat: Saturday, 12 December 2026, 7:30 PM',
      'Venue: Sunshine Banquet Hall, MG Road, Lucknow', 'Residence: 45, Green Park Colony, Lucknow - 226010', 'RSVP: 98765 12345, +91 99887-76655']);
    assert.equal(d.lang, 'en'); assert.equal(d.type, 'wedding');
    assert.deepEqual([d.host1, d.host2], ['Rohit', 'Ananya']);
    assert.equal(d.parents1, 'Smt. Sunita & Shri Mahesh Sharma'); assert.equal(d.parents2, 'Smt. Kiran & Shri Rakesh Gupta');
    assert.deepEqual(d.events.map(e => [e.name, e.date]), [['Haldi', '2026-12-11T11:00'], ['Mehendi', '2026-12-11T17:00'], ['Baraat', '2026-12-12T19:30']]);
    assert.equal(d.venue, 'Sunshine Banquet Hall, MG Road, Lucknow');
    assert.equal(d.address, '45, Green Park Colony, Lucknow - 226010');
    assert.deepEqual(d.phones, ['98765 12345', '99887 76655']);
  });
  test('a Hindi card as PDFs give its text back (pieces, "ि" before its letter, empty joined letters)', () => {
    const lines = ['॥ \u0000ी गणेशाय नमः ॥', 'शुभ िववाह', '\u0000च॰ अंिकत', 'सुपुत्र \u0000ीमती रेखा एवं \u0000ी िवनोद अग्रवाल', 'संग', 'आयु॰ नेहा',
      'सुपुत्र ी \u0000ीमती मीना एवं \u0000ी अजय बंसल', 'ह\u0000ी · बुधवार, 9 िदसम्ब र 2026 ·  प्र ातः 11 बजे', 'मेहँदी · 9 िदसम्ब र 2026 · सायं 5 बजे',
      'बारात  प्र स्थ ान · 10 िदसम्ब र 2026 · सायं 7 बजे', 'समारोह  स्थ ल: आनन्द वािटका, \u0000सिवल लाइन्स , आगरा', 'िनवास: 12, शा\u0000\u0000 नगर, आगरा 282001', 'सम्प क\u0000 : 91234 56780'];
    const d = PdfCard.parse(lines);
    assert.equal(d.lang, 'hi');
    assert.deepEqual([d.host1, d.host2], ['अंकित', 'नेहा']);
    assert.equal(d.parents1, 'श्रीमती रेखा एवं श्री विनोद अग्रवाल');
    assert.equal(d.parents2, 'श्रीमती मीना एवं श्री अजय बंसल');
    assert.deepEqual(d.events.map(e => [e.name, e.date]), [['हल्दी', '2026-12-09T11:00'], ['मेहँदी', '2026-12-09T17:00'], ['बारात', '2026-12-10T19:00']]);
    assert.equal(d.venue, 'आनन्द वाटिका, सिविल लाइन्स, आगरा');
    assert.equal(d.address, '12, शान्ति नगर, आगरा 282001');
    assert.deepEqual(d.phones, ['91234 56780']);
  });
  test('times and dates in many ways', () => {
    assert.equal(PdfCard.findTime('7:30 pm'), '19:30'); assert.equal(PdfCard.findTime('सायं 7 बजे'), '19:00');
    assert.equal(PdfCard.findTime('प्रातः 10:30 बजे'), '10:30'); assert.equal(PdfCard.findTime('दोपहर 1 बजे'), '13:00');
    for (const s of ['12th Dec, 2026', 'Dec 12, 2026', '12/12/2026', '12 दिसम्बर 2026']) assert.deepEqual(PdfCard.findDate(s), { d: 12, m: 11, y: 2026 }, s);
  });
  test('a premium film shows the card, with nothing made up left in it', () => {
    const card = PdfCard.toCard(PdfCard.parse(['Rohit weds Ananya', 'S/o Smt. Sunita & Shri Mahesh Sharma', 'Haldi 11 December 2026 11 AM', 'Baraat 12 December 2026 7:30 PM', 'Venue: Sunshine Banquet Hall, Lucknow', 'Contact: 98765 12345']));
    for (const f of Films.LIST.slice(0, 12)) for (const lang of ['en', 'hi']) {
      const { D, scenes } = Films.script(f, lang, card);
      assert.deepEqual([D.A, D.B, D.V], ['Rohit', 'Ananya', 'Sunshine Banquet Hall']);
      assert.equal(scenes.filter(s => s.k === 'day').length, 2, 'one screen per day');
      assert.doesNotMatch(JSON.stringify(D), /Rahul|Priya|Rose Garden|98765 43210|Aarav|Kiara|Grand Palace/, `${f.id} ${lang}`);
    }
    const strip = Films.script(Films.LIST[0], 'en', card, { credit: 'Made by Me', site: '', skip: ['card', 'regards'], venueStyle: 'name' });
    assert.deepEqual([strip.D.credit, strip.D.site, strip.D.venueStyle], ['Made by Me', '', 'name']);
    assert.ok(!strip.scenes.some(s => s.k === 'card' || s.k === 'regards'), 'screens can be left out');
  });

  // Every field of a card, compared in one go (events as [name, date, venue, note])
  const fields = (d, want) => {
    const got = { ...d, events: d.events.map(e => [e.name, e.date, e.venue, e.note]) };
    for (const k of Object.keys(want)) assert.deepEqual(got[k], want[k], k);
    for (const k of ['lang', 'type', 'title', 'invocation', 'host1', 'host2', 'parents1', 'parents2', 'grandparents1', 'grandparents2', 'events', 'venue', 'address', 'phones', 'hashtag', 'quotes', 'inviters', 'kids', 'lines', 'extra']) assert.ok(k in d, `has ${k}`);
  };
  test('a full Hindi wedding card: verse, grandparents, functions side by side with their own venues, निवेदक, बाल मनुहार', () => {
    const lines = ['॥ श्री गणेशाय नमः ॥', 'वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।', 'निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥', 'शुभ विवाह',
      'स्व. श्री रामलाल शर्मा एवं स्व. श्रीमती कमला देवी के पौत्र', 'श्रीमती सुनीता एवं श्री महेश शर्मा के सुपुत्र', 'चि॰ रोहित शर्मा', 'संग', 'आयु॰ अनन्या',
      'सुपुत्री श्रीमती किरण एवं श्री राकेश गुप्ता', 'पौत्री श्रीमती शान्ति देवी एवं श्री हरिप्रसाद गुप्ता', 'के शुभ विवाह के मांगलिक अवसर पर आप सादर आमन्त्रित हैं।',
      'मांगलिक कार्यक्रम', 'हल्दी  मेहंदी  घुड़चढ़ी', '9 दिसम्बर 2026  9 दिसम्बर 2026  10 दिसम्बर 2026', 'प्रातः 11 बजे  सायं 5 बजे  सायं 7 बजे', 'निवास पर  निवास पर  आनन्द वाटिका',
      'कीर्तन भजन : 8 दिसम्बर 2026, रात्रि 8 बजे से', 'स्थान : श्री राम मन्दिर, गांधी नगर', 'बारात प्रस्थान : 10 दिसम्बर 2026, रात्रि 9 बजे', 'स्थान : आनन्द वाटिका, आगरा',
      'फेरे : 11 दिसम्बर 2026, प्रातः 4 बजे', 'समारोह स्थल : होटल ग्रैंड पैलेस, फतेहाबाद रोड, आगरा', 'निवास : 12, शान्ति नगर, आगरा 282001',
      'दर्शनाभिलाषी', 'श्री सुरेश शर्मा, श्री दिनेश शर्मा', 'समस्त शर्मा परिवार', 'बाल मनुहार', 'मेरे चाचू की शादी में जरूर-जरूर आना', '- पीहू, आरव', 'सम्पर्क : 98765 12345, 91234 56780'];
    fields(PdfCard.parse(lines, { ocr: true }), {
      lang: 'hi', type: 'wedding', title: 'शुभ विवाह', invocation: '॥ श्री गणेशाय नमः ॥', host1: 'रोहित शर्मा', host2: 'अनन्या',
      parents1: 'श्रीमती सुनीता एवं श्री महेश शर्मा', parents2: 'श्रीमती किरण एवं श्री राकेश गुप्ता',
      grandparents1: 'स्व. श्री रामलाल शर्मा एवं स्व. श्रीमती कमला देवी', grandparents2: 'श्रीमती शान्ति देवी एवं श्री हरिप्रसाद गुप्ता',
      events: [['कीर्तन भजन', '2026-12-08T20:00', 'श्री राम मन्दिर, गांधी नगर', 'रात्रि 8 बजे से'], ['हल्दी', '2026-12-09T11:00', 'निवास पर', ''], ['मेहँदी', '2026-12-09T17:00', 'निवास पर', ''],
        ['घुड़चढ़ी', '2026-12-10T19:00', 'आनन्द वाटिका', ''], ['बारात', '2026-12-10T21:00', 'आनन्द वाटिका, आगरा', 'प्रस्थान'], ['फेरे', '2026-12-11T04:00', '', '']],
      venue: 'होटल ग्रैंड पैलेस, फतेहाबाद रोड, आगरा', address: '12, शान्ति नगर, आगरा 282001', phones: ['98765 12345', '91234 56780'], hashtag: '',
      quotes: ['वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।\nनिर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥'], inviters: ['श्री सुरेश शर्मा', 'श्री दिनेश शर्मा', 'समस्त शर्मा परिवार'],
      kids: 'मेरे चाचू की शादी में जरूर-जरूर आना\n- पीहू, आरव', lines: lines.map(l => l.replace(/\s+/g, ' ')),
      extra: ['के शुभ विवाह के मांगलिक अवसर पर आप सादर आमन्त्रित हैं।', 'मांगलिक कार्यक्रम'] });
  });
  test('a full English wedding card: Son of / Daughter of, grandparents, a quote in “ ”, each function with its venue lines, compliments, RSVP', () => {
    const lines = ['Om Shri Ganeshaya Namah', '“Two souls, one heart —', 'a journey of forever begins.”', 'Wedding Invitation', 'Together with their families', 'Rohit Sharma', 'Son of',
      'Mrs. Sunita & Mr. Mahesh Sharma', 'Grandson of Late Shri Ramlal Sharma & Smt. Kamla Devi', 'weds', 'Ananya Gupta', 'Daughter of Mrs. Kiran & Mr. Rakesh Gupta',
      'Granddaughter of Smt. Shanti Devi & Shri Hariprasad Gupta', 'Wedding Celebrations', 'Mehendi', 'Thursday, 10th December 2026 | 4:00 PM onwards', 'Poolside Lawns, Hotel Clarks Amer',
      'Haldi', 'Friday, 11 Dec 2026 | 10:30 AM', 'Dress code: Yellow', 'Sangeet', '11.12.2026 · 7:30 PM', 'The Grand Ballroom, Hotel Clarks Amer', 'Pheras', 'Saturday, 12 December 2026, 9 PM',
      'Jai Mahal Palace, Jacob Road,', 'Civil Lines, Jaipur 302006', 'Reception', 'December 13, 2026 at 8:00 PM', 'Rambagh Palace, Bhawani Singh Road, Jaipur', 'With best compliments from',
      'Mahesh & Sunita Sharma', 'All relatives & friends', 'Little ones: Pihu & Aarav can\'t wait to dance at chachu\'s wedding!', 'RSVP', 'Mahesh Sharma - 98765 12345', 'Rakesh Gupta - 99887 76655', '#RoAnTogether'];
    fields(PdfCard.parse(lines), {
      lang: 'en', type: 'wedding', title: 'Wedding Invitation', invocation: 'Om Shri Ganeshaya Namah', host1: 'Rohit Sharma', host2: 'Ananya Gupta',
      parents1: 'Mrs. Sunita & Mr. Mahesh Sharma', parents2: 'Mrs. Kiran & Mr. Rakesh Gupta', grandparents1: 'Late Shri Ramlal Sharma & Smt. Kamla Devi', grandparents2: 'Smt. Shanti Devi & Shri Hariprasad Gupta',
      events: [['Mehendi', '2026-12-10T16:00', 'Poolside Lawns, Hotel Clarks Amer', '4:00 PM onwards'], ['Haldi', '2026-12-11T10:30', '', 'Dress code: Yellow'],
        ['Sangeet', '2026-12-11T19:30', 'The Grand Ballroom, Hotel Clarks Amer', ''], ['Pheras', '2026-12-12T21:00', 'Jai Mahal Palace, Jacob Road, Civil Lines, Jaipur 302006', ''],
        ['Reception', '2026-12-13T20:00', 'Rambagh Palace, Bhawani Singh Road, Jaipur', '']],
      venue: 'Jai Mahal Palace, Jacob Road, Civil Lines, Jaipur 302006', address: '', phones: ['98765 12345', '99887 76655'], hashtag: '#RoAnTogether',
      quotes: ['“Two souls, one heart —\na journey of forever begins.”'], inviters: ['Mahesh & Sunita Sharma', 'All relatives & friends', 'Mahesh Sharma', 'Rakesh Gupta'],
      kids: 'Pihu & Aarav can\'t wait to dance at chachu\'s wedding!', lines, extra: ['Together with their families', 'Wedding Celebrations'] });
  });
  test('a Hinglish card: Chi. / Sau. Kan., "sang", 12/12/26, "sham 7 baje", 13 Dec without a year, "@ venue"', () => {
    fields(PdfCard.parse(['|| Shree Ganeshay Namah ||', 'Shubh Vivah', 'Chi. Aman', '(Grandson of Smt. Kamla Devi & Late Shri Ram Prasad Verma)', 'S/o Smt. Rekha & Shri Vinod Verma', 'sang',
      'Sau. Kan. Pooja', 'D/o Smt. Meena & Shri Ajay Bansal', 'Tilak - 12/12/26, Sham 7 baje', 'Ladies Sangeet: 13 Dec, 8 PM onwards @ Farmhouse, Sohna Road', 'Pheras: 14 Dec 2026, raat 11 baje',
      'Venue: Sunshine Resort, Gurugram', 'Sampark: 98100 12345', 'Darshanabhilashi: Verma Parivar']), {
      lang: 'en', type: 'wedding', title: 'Shubh Vivah', invocation: '॥ Shree Ganeshay Namah ॥', host1: 'Aman', host2: 'Pooja',
      parents1: 'Smt. Rekha & Shri Vinod Verma', parents2: 'Smt. Meena & Shri Ajay Bansal', grandparents1: 'Smt. Kamla Devi & Late Shri Ram Prasad Verma', grandparents2: '',
      events: [['Tilak', '2026-12-12T19:00', '', ''], ['Sangeet', '2026-12-13T20:00', 'Farmhouse, Sohna Road', '8 PM onwards'], ['Pheras', '2026-12-14T23:00', '', '']],
      venue: 'Sunshine Resort, Gurugram', address: '', phones: ['98100 12345'], quotes: [], inviters: ['Verma Parivar'], kids: '', extra: [] });
  });
  test('a birthday card: the child\'s name, a date line above its functions, RSVP', () => {
    fields(PdfCard.parse(['You\'re Invited!', 'Join us to celebrate Aarav\'s 1st Birthday', 'Saturday, 19 December 2026', 'Cake cutting at 7:00 PM, Dinner to follow',
      'Venue: The Party Hall, Hotel Royal Inn, Sector 18, Noida', 'Dress code: Superheroes', 'RSVP: Neha & Rahul Mehta - 98111 22334']), {
      lang: 'en', type: 'birthday', title: 'You\'re Invited!', invocation: '', host1: 'Aarav', host2: '', parents1: '', parents2: '',
      events: [['Cake Cutting', '2026-12-19T19:00', '', ''], ['Dinner', '2026-12-19', '', 'to follow']],
      venue: 'The Party Hall, Hotel Royal Inn, Sector 18, Noida', phones: ['98111 22334'], inviters: ['Neha & Rahul Mehta'], extra: ['Dress code: Superheroes'] });
  });
  test('a Griha Pravesh card: Hindi numerals, a lunar date (left as it is), verse, functions by time only', () => {
    fields(PdfCard.parse(['॥ ॐ श्री गणेशाय नमः ॥', 'गृह प्रवेश', 'मंगलम् भगवान विष्णुः, मंगलम् गरुड़ध्वजः।', 'मंगलम् पुण्डरीकाक्षः, मंगलाय तनो हरिः॥',
      'प्रभु कृपा से हमारे नए घर का गृह प्रवेश एवं श्री सत्यनारायण कथा का आयोजन', 'मार्गशीर्ष शुक्ल पंचमी, शनिवार', 'दिनांक: १२ दिसम्बर २०२६', 'कथा: प्रातः 10 बजे से',
      'प्रीतिभोज: दोपहर 1 बजे', 'स्थान: 45, गणेश नगर, जयपुर 302001', 'निवेदक', 'शर्मा परिवार', 'सम्पर्क: 98290 11223'], { ocr: true }), {
      lang: 'hi', type: 'housewarming', title: 'गृह प्रवेश', invocation: '॥ ॐ श्री गणेशाय नमः ॥', host1: 'शर्मा परिवार', host2: '',
      events: [['कथा', '2026-12-12T10:00', '', 'प्रातः 10 बजे से'], ['प्रीतिभोज', '2026-12-12T13:00', '', '']],
      venue: '45, गणेश नगर, जयपुर 302001', address: '', phones: ['98290 11223'], inviters: ['शर्मा परिवार'], kids: '',
      quotes: ['मंगलम् भगवान विष्णुः, मंगलम् गरुड़ध्वजः।\nमंगलम् पुण्डरीकाक्षः, मंगलाय तनो हरिः॥'],
      extra: ['प्रभु कृपा से हमारे नए घर का गृह प्रवेश एवं श्री सत्यनारायण कथा का आयोजन', 'मार्गशीर्ष शुक्ल पंचमी, शनिवार'] });
  });
  test('a noisy OCR card: stray "|", "चि०" with the name on the next line, "आयु" without ॰, "नम:", OCR typos, « between side-by-side functions', () => {
    fields(PdfCard.parse(['| ॥ श्री गणेशाय नम: ॥ |', 'शुभ  विवाह', 'चि०', 'राहुल', 'सुपुत्र श्रीमती  रेखा एवं श्री  विनोद अग्रवाल |', 'संग', 'आयु नेहा', 'सुपुत्री श्रीमती मीना एवं श्री अजय बंसल',
      'हल्दी « मेहंदी « चुड़चढ़ी', '9 दिसम्बर 2026 « 9 दिसम्बर 2026 « 10 दिसम्बर 2026', 'प्रातः 11 बजे « साये 5 बजे « साय 7 बजे', 'geal - बुधवार, 8 दिसम्बर 2026', '|',
      'समारोह स्थल : आनन्द वाटिका, आगरा', 'स्वागतोत्सुक : समस्त अग्रवाल परिवार', 'सम्पर्क : 9876512345'], { ocr: true }), {
      lang: 'hi', type: 'wedding', title: 'शुभ विवाह', invocation: '॥ श्री गणेशाय नम: ॥', host1: 'राहुल', host2: 'नेहा',
      parents1: 'श्रीमती रेखा एवं श्री विनोद अग्रवाल', parents2: 'श्रीमती मीना एवं श्री अजय बंसल',
      events: [['हल्दी', '2026-12-09T11:00', '', ''], ['मेहँदी', '2026-12-09T17:00', '', ''], ['घुड़चढ़ी', '2026-12-10T19:00', '', '']],
      venue: 'आनन्द वाटिका, आगरा', phones: ['98765 12345'], inviters: ['समस्त अग्रवाल परिवार'], extra: ['geal - बुधवार, 8 दिसम्बर 2026'] });
    // other separators OCR gives between side-by-side items
    const d = PdfCard.parse(['हल्दी + मेहंदी', '9 दिसम्बर 2026 - 10 दिसम्बर 2026', 'सायं 4 बजे | सायं 7:30 बजे'], { ocr: true });
    assert.deepEqual(d.events.map(e => [e.name, e.date]), [['हल्दी', '2026-12-09T16:00'], ['मेहँदी', '2026-12-10T19:30']]);
  });
  test('a Sunderkand / Mata ki Chowki card: 18.12.2026, "सायं 7:30 बजे", a heading naming the functions, विनीत', () => {
    fields(PdfCard.parse(['जय माता दी', 'श्री सुन्दरकाण्ड पाठ एवं माता की चौकी', 'आप सपरिवार सादर आमन्त्रित हैं', 'सुन्दरकाण्ड पाठ : शुक्रवार 18.12.2026 सायं 4 बजे से',
      'माता की चौकी : 18.12.2026 सायं 7:30 बजे', 'भण्डारा : रात्रि 10 बजे', 'स्थान : श्री दुर्गा मन्दिर, राजनगर, गाजियाबाद', 'विनीत', 'श्री रमेश गुप्ता एवं समस्त गुप्ता परिवार', 'मो. 98765 43211'], { ocr: true }), {
      lang: 'hi', type: 'puja', title: 'श्री सुन्दरकाण्ड पाठ एवं माता की चौकी', invocation: 'जय माता दी', host1: 'श्री रमेश गुप्ता एवं समस्त गुप्ता परिवार',
      events: [['सुंदरकांड', '2026-12-18T16:00', '', 'पाठ, सायं 4 बजे से'], ['माता की चौकी', '2026-12-18T19:30', '', ''], ['भंडारा', '2026-12-18T22:00', '', '']],
      venue: 'श्री दुर्गा मन्दिर, राजनगर, गाजियाबाद', phones: ['98765 43211'], inviters: ['श्री रमेश गुप्ता एवं समस्त गुप्ता परिवार'], extra: ['आप सपरिवार सादर आमन्त्रित हैं'] });
  });
  test('a "Venue:" line after the list of functions is the main venue, not the venue of the functions above it', () => {
    const d = PdfCard.parse(['Rohit weds Ananya', 'Haldi: Friday, 11 December 2026, 11:00 AM', 'Mehendi: 11 December 2026, 5:00 PM', 'Baraat: Saturday, 12 December 2026, 7:30 PM',
      'Reception: 13 December 2026, 8:00 PM', 'Venue: Sunshine Banquet Hall, MG Road, Lucknow', 'Residence: 45, Green Park Colony, Lucknow - 226010']);
    assert.deepEqual(d.events.map(e => [e.name, e.date, e.venue]), [['Haldi', '2026-12-11T11:00', ''], ['Mehendi', '2026-12-11T17:00', ''], ['Baraat', '2026-12-12T19:30', ''], ['Reception', '2026-12-13T20:00', '']]);
    assert.equal(d.venue, 'Sunshine Banquet Hall, MG Road, Lucknow'); assert.equal(d.address, '45, Green Park Colony, Lucknow - 226010');
    assert.deepEqual(d.lines.length, 7); assert.deepEqual(d.extra, []);
  });
  test('"TOGETHER WITH THEIR FAMILIES" is never the couple; names on their own lines around "&"; a card with only a date gets its main function', () => {
    fields(PdfCard.parse(['TOGETHER WITH THEIR FAMILIES', 'AARAV', '&', 'DIYA', 'REQUEST THE PLEASURE OF YOUR COMPANY', 'AT THE CELEBRATION OF THEIR MARRIAGE',
      'SATURDAY, 12 DECEMBER 2026 AT 7 PM', 'THE LEELA PALACE, UDAIPUR']), {
      lang: 'en', type: 'wedding', title: '', host1: 'AARAV', host2: 'DIYA', events: [['Wedding', '2026-12-12T19:00', 'THE LEELA PALACE, UDAIPUR', '']],
      venue: 'THE LEELA PALACE, UDAIPUR', extra: ['TOGETHER WITH THEIR FAMILIES', 'REQUEST THE PLEASURE OF YOUR COMPANY', 'AT THE CELEBRATION OF THEIR MARRIAGE'] });
    assert.deepEqual([PdfCard.parse(['Together with their families']).host1, PdfCard.parse(['Rohit with Ananya']).host1], ['', 'Rohit']);
  });
  test('more dates and times', () => {
    const D = { d: 12, m: 11, y: 2026 };
    for (const s of ['12.12.2026', '12/12/26', 'Saturday, 12 December 2026', '१२ दिसम्बर २०२६', '12th of December 2026', 'शनिवार, 12-12-2026']) assert.deepEqual(PdfCard.findDate(s, 2026), D, s);
    assert.deepEqual(PdfCard.findDate('12th Dec', 2026), D); assert.equal(PdfCard.findDate('मार्गशीर्ष शुक्ल पंचमी', 2026), null);
    assert.deepEqual(PdfCard.findDates('9 दिसम्बर 2026  9 दिसम्बर 2026  10 दिसम्बर 2026', 2026).map(x => x.d), [9, 9, 10]);
    assert.equal(PdfCard.findTime('सायं 7:30 बजे'), '19:30'); assert.equal(PdfCard.findTime('रात्रि 8 बजे से'), '20:00'); assert.equal(PdfCard.findTime('7.30 p.m.'), '19:30');
    assert.equal(PdfCard.findTime('Sector 12 Amer Road'), '', 'not "12 AM"'); assert.equal(PdfCard.findTime('12 Dec 07:30 PM'), '19:30');
    assert.deepEqual(PdfCard.findDate('12 Dec 07:30 PM', 2026), D, 'the time is not a year');
  });
});

test.describe('card PDFs from the website (js/db.js)', () => {
  const ctx = vm.createContext({ console });
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'db.js'), 'utf8'), ctx, { filename: 'db.js' });
  const DB = vm.runInContext('DB', ctx);
  test('file names are made safe for storage, always ending in .pdf', () => {
    assert.equal(DB.safeName("Riya & Kabir's Card (final).PDF"), 'Riya-Kabir-s-Card-final.pdf');
    assert.equal(DB.safeName('C:\\Users\\me\\Désktop\\card.pdf'), 'card.pdf');
    assert.equal(DB.safeName('../../etc/passwd'), 'passwd.pdf');
    assert.equal(DB.safeName('शादी कार्ड.pdf'), 'card.pdf', 'nothing left: "card"');
    assert.equal(DB.safeName(''), 'card.pdf');
    assert.equal(DB.safeName('...pdf'), 'card.pdf');
    assert.equal(DB.safeName('Ananyá Café.pdf'), 'Ananya-Cafe.pdf');
    assert.ok(DB.safeName('a'.repeat(300) + '.pdf').length <= 64);
    assert.match(DB.safeName('Mehta--wedding__2026 v2.pdf'), /^[A-Za-z0-9._-]+\.pdf$/);
  });
  test('the storage path: year/month/random id-name.pdf, never the same twice', () => {
    assert.equal(DB.pdfPath('My Card.pdf', new Date(2026, 10, 11), 'ab12'), '2026/11/ab12-My-Card.pdf');
    assert.equal(DB.pdfPath('x.pdf', new Date(2027, 0, 3), 'id'), '2027/01/id-x.pdf');
    const a = DB.pdfPath('card.pdf'), b = DB.pdfPath('card.pdf');
    assert.notEqual(a, b);
    // the same rule as the orders.pdf_path check in supabase/schema.sql
    const rule = fs.readFileSync(path.join(ROOT, 'supabase', 'schema.sql'), 'utf8').match(/pdf_path ~ '([^']+)'/)[1];
    for (const p of [a, DB.pdfPath('a'.repeat(300) + '.pdf'), DB.pdfPath('शादी.pdf')]) assert.match(p, new RegExp(rule), p);
  });
  test('only PDFs, at most 10 MB', async () => {
    assert.equal(DB.PDF_MAX, 10 * 1024 * 1024);
    assert.ok(DB.isPdf({ name: 'CARD.PDF', type: '' }));
    assert.ok(DB.isPdf({ name: 'card', type: 'application/pdf' }));
    assert.ok(!DB.isPdf({ name: 'card.jpg', type: 'image/jpeg' }));
    await assert.rejects(DB.uploadPdf({ name: 'card.jpg', type: 'image/jpeg', size: 10 }), /Not a PDF/);
    await assert.rejects(DB.uploadPdf({ name: 'card.pdf', type: 'application/pdf', size: DB.PDF_MAX + 1 }), /10 MB/);
  });
});

test('premium films: 15 different concepts (with the trend ones: monogram, palace jharokha, temple gold), at least 5 films each, never the same concept twice in a row', () => {
  const Films = require('../js/films.js');
  const by = {};
  Films.LIST.forEach(f => { by[f.concept] = (by[f.concept] || 0) + 1; });
  assert.equal(Object.keys(by).length, 15, Object.keys(by).join(', '));
  for (const c of ['monogram', 'jharokha', 'temple']) assert.ok(by[c], `trend concept ${c}`);
  for (const [c, n] of Object.entries(by)) assert.ok(n >= 5, `${c}: ${n} films`);
  Films.LIST.slice(1).forEach((f, i) => assert.notEqual(f.concept, Films.LIST[i].concept, `${Films.LIST[i].id} then ${f.id}`));
  for (const f of Films.LIST) assert.ok(Films.themeOf(f) && Films.themeOf(f).bg, `${f.id} has its colours`);
});

test('auto video studio: a film is made new in the card colours (hue follows the card, lightness and paper stay)', () => {
  const Films = require('../js/films.js');
  const hsl = hex => { const n = parseInt(hex.slice(1), 16), r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
    if (!d) return [0, 0, l]; const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [(h * 60 + 360) % 360, d / (1 - Math.abs(2 * l - 1)), l]; };
  const green = { h: 145, s: .6, dark: true, word: 'Emerald', gold: 'gold' };
  for (const base of [Films.LIST[0], Films.LIST.find(f => f.concept === 'jharokha'), Films.LIST.find(f => f.concept === 'temple')]) {
    const f = Films.recolour(base, green), th = Films.themeOf(f), orig = Films.themeOf(base);
    assert.equal(f.name, `Emerald ${base.concept === 'heritage' ? f.name.split(' ').slice(1).join(' ') : Films.CONCEPTS[base.concept].short}`);
    assert.ok(f.fromCard && f.id !== base.id, 'a new film, not the ready one');
    const [h, , l] = hsl(th.bg[0]);
    assert.ok(Math.abs(h - 145) < 2, `${f.id} background is green (${th.bg[0]})`);
    assert.ok(l < .3, 'a dark card gives a dark film');
    assert.ok(hsl(th.paper)[2] > .85, 'the paper stays a light cream, so words on it stay readable');
    assert.ok(orig.bg[0] !== th.bg[0]);
  }
  // the player takes the new film as it is
  assert.doesNotThrow(() => Films.script(Films.recolour(Films.LIST[5], green), 'en'));
});
