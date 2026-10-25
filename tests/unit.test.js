const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadApp, plain, ROOT } = require('./load');

const { THEMES, PRESETS, Codec, Core } = loadApp();
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

test.describe('Themes', () => {
  const cardHtml = fs.readFileSync(path.join(ROOT, 'card.html'), 'utf8');

  test('there are 12 templates', () => {
    assert.equal(Object.keys(THEMES).length, 12);
  });

  for (const [key, t] of Object.entries(THEMES)) {
    test(`${key}: complete and valid`, () => {
      assert.ok(t.name && t.emoji, 'name and emoji');
      for (const v of REQUIRED_VARS) assert.ok(t.vars[v], `missing ${v}`);
      for (const v of ['--bg', '--bg2', '--ink', '--accent', '--accent2']) assert.match(t.vars[v], /^#[0-9a-f]{6}$/i, v);
      for (const f of ['display', 'script', 'body']) assert.ok(t.fonts[f], `font ${f}`);
      assert.ok(t.particles.types.length > 0);
      for (const p of t.particles.types) assert.ok(PARTICLE_TYPES.includes(p), `unknown particle "${p}"`);
      for (const c of t.particles.colors) assert.match(c, /^#[0-9a-f]{6}$/i);
      assert.ok(t.particles.count > 0 && t.particles.count <= 120);
      assert.ok(t.tempo > 0.1 && t.tempo < 1, 'tempo');
    });

    test(`${key}: every font is loaded by card.html`, () => {
      for (const stack of Object.values(t.fonts)) {
        const family = stack.match(/'([^']+)'/)[1];
        assert.ok(cardHtml.includes(`family=${family.replace(/ /g, '+')}`), `${family} not in Google Fonts link`);
      }
    });
  }
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
      assert.ok(THEMES[p.card.theme], `theme ${p.card.theme} exists`);
      assert.ok(p.card.host1 && p.card.title && p.card.tagline);
      assert.ok(Core.parseDate(p.card.date), 'main date valid');
      for (const e of p.card.events) {
        assert.ok(e.name);
        if (e.date) assert.ok(Core.parseDate(e.date), `${e.name} date valid`);
      }
    });

    test(`${key}: link stays short enough for WhatsApp`, () => {
      const url = Core.cardUrl('https://wedding-card.netlify.app/admin.html', Codec.encode(Core.compact(p.card)), 'Sharma Family');
      assert.ok(url.length < 2500, `${url.length} chars`);
    });
  }

  test('a link with an uploaded photo stays under 16 KB', () => {
    const photo = 'data:image/webp;base64,' + 'A'.repeat(10 * 1024);
    const url = Core.cardUrl('https://x.netlify.app/admin.html', Codec.encode(Core.compact({ ...PRESETS.wedding.card, photo })), 'Rahul');
    assert.ok(url.length < 16 * 1024, `${url.length} chars`);
  });

});
