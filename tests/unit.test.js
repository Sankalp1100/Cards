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
  test('inviteText is personal when a guest is given', () => {
    const t = Core.inviteText({ guest: 'Rahul', who: 'Diya & Aarav', label: 'Wedding', link: 'https://x/card.html#a' });
    assert.match(t, /^💌 Dear Rahul, you're invited!/);
    assert.match(t, /Diya & Aarav · Wedding/);
    assert.ok(t.endsWith('https://x/card.html#a'));
    assert.match(Core.inviteText({ guest: '', who: 'A', label: 'B', link: 'L' }), /^💌 You're invited!/);
  });
});

test.describe('Core.fontsUrl', () => {
  test('builds a Google Fonts URL with weights and no duplicates', () => {
    const url = Core.fontsUrl({ display: "'Playfair Display', serif", script: "'Great Vibes', cursive", body: "'Playfair Display', serif" });
    assert.equal(url, 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Great+Vibes&display=swap');
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
      assert.ok(html.includes(`<meta property="og:image" content="https://cardalbum.vercel.app/img/${img}">`), `${f} preview image`);
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

  test('neighbouring designs look different', () => {
    for (let i = 1; i < all.length; i++) {
      assert.notEqual(all[i].vars['--bg'] + all[i].occasion, all[i - 1].vars['--bg'] + all[i - 1].occasion, `#${i} and #${i + 1}`);
      assert.notEqual(all[i].layout, all[i - 1].layout, `#${i} and #${i + 1} share a layout`);
    }
  });

  test('every design has a valid layout, decor, name style and section style, and each is well used', () => {
    const options = {
      layout: ['classic', 'arch', 'monogram', 'ticket', 'split'],
      decor: ['mandala', 'blobs', 'frame', 'florals', 'sunburst', 'deco', 'lights', 'stars', 'lace'],
      nameStyle: ['shimmer', 'solid', 'outline', 'duo'],
      cardStyle: ['soft', 'sharp', 'pill', 'outline']
    };
    for (const [key, values] of Object.entries(options)) {
      for (const t of all) assert.ok(values.includes(t[key]), `#${t.no} ${key} "${t[key]}"`);
      for (const v of values) assert.ok(all.filter(t => t[key] === v).length >= 10, `${key} "${v}" is used by at least 10 designs`);
    }
  });

  test('no two of the 300 designs look alike', () => {
    const looks = all.map(t => [t.layout, t.decor, t.nameStyle, t.cardStyle, JSON.stringify(t.fonts)].join('|'));
    assert.equal(new Set(looks).size, 300);
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
    assert.match(html, /^\s*<a class="poster d-mandala"/);
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
        events: [{ name: '🎂 Cake Cutting', date: '2026-11-28T21:30', venue: '', dress: '' }], theme: 47
      },
      guests: ['Rahul Uncle', 'Priya Di'], photo: true
    });
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
