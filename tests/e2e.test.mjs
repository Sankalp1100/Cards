// Browser tests: drive the real pages in headless Chrome. Skipped automatically if Chrome/Edge is not installed.
import test from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { createRequire } from 'node:module';
import { launch, chromePath } from './cdp.mjs';

const require = createRequire(import.meta.url);
const { loadApp, ROOT } = require('./load.js');
const { PRESETS, Codec, Core } = loadApp();

const base = pathToFileURL(path.join(ROOT, 'index.html')).href.replace(/index\.html$/, '');
const cardLink = (card, query = '') => `${base}card.html${query}#${Codec.encode(Core.compact(card))}`;

test.describe('browser', { skip: !chromePath && 'Chrome/Edge not found' }, () => {
  let page;
  test.before(async () => { page = await launch(); await page.viewport(420, 860); });
  test.after(async () => { await page?.close(); });

  const noErrors = () => assert.deepEqual(page.errors, [], 'JavaScript errors on the page');
  const openEnvelope = async () => {
    await page.eval(`document.querySelector('.envelope').click()`);
    await page.waitFor(`document.body.classList.contains('opened')`, 5000);
  };

  // ---------- Landing ----------
  test('landing page shows all 12 live templates', async () => {
    await page.viewport(1300, 900);
    await page.goto(base + 'index.html');
    assert.equal(await page.eval(`document.querySelectorAll('#showcase .tpl').length`), 12);
    assert.equal(await page.eval(`document.querySelector('#tplCount').textContent`), '12');
    assert.match(await page.eval(`document.querySelector('#demoBtn').href`), /card\.html#/);
    noErrors();
    await page.viewport(420, 860);
  });

  // ---------- Card ----------
  test('demo card: envelope opens and every section renders', async () => {
    await page.goto(base + 'card.html');
    assert.equal(await page.eval(`document.querySelector('.env-seal').textContent`), 'D&A');
    assert.equal(await page.eval(`document.body.classList.contains('locked')`), true, 'page scroll locked before opening');
    await openEnvelope();
    assert.equal(await page.eval(`document.body.classList.contains('locked')`), false);
    assert.equal(await page.eval(`document.querySelector('.names').textContent.replace(/\\s+/g, '')`), 'Diya&Aarav');
    assert.equal(await page.eval(`document.querySelectorAll('.event').length`), 5);
    assert.equal(await page.eval(`document.querySelectorAll('.cd-cell').length`), 4);
    assert.match(await page.eval(`document.querySelector('#calBtn').href`), /calendar\.google\.com.*dates=20261212T193000%2F20261212T233000/);
    assert.match(await page.eval(`document.querySelector('.venue a').href`), /^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=The%20Leela/);
    assert.equal(await page.eval(`document.title`), "Diya & Aarav 💌 You're invited");
    noErrors();
  });

  test('countdown ticks every second', async () => {
    const card = { ...PRESETS.birthday.card, date: new Date(Date.now() + 3 * 864e5 + 5e3).toISOString().slice(0, 16) };
    await page.goto(cardLink(card, '?auto'));
    await page.waitFor(`document.querySelector('[data-u="Days"]').textContent === '03' || document.querySelector('[data-u="Days"]').textContent === '02'`);
    const s1 = await page.eval(`document.querySelector('[data-u="Seconds"]').textContent`);
    await page.waitFor(`document.querySelector('[data-u="Seconds"]').textContent !== ${JSON.stringify(s1)}`, 2500);
    noErrors();
  });

  test('past event shows "celebration has begun"', async () => {
    await page.goto(cardLink({ ...PRESETS.bday.card, date: '2020-01-01T10:00' }, '?auto'));
    assert.match(await page.eval(`document.querySelector('#cd').textContent`), /celebration has begun/);
  });

  test('personal link greets the guest; calendar link does not leak their name', async () => {
    await page.goto(cardLink(PRESETS.wedding.card, '?to=Rahul%20Uncle'));
    assert.equal(await page.eval(`document.querySelector('.env-to').textContent`), 'Dear Rahul Uncle,');
    await openEnvelope();
    const cal = await page.eval(`decodeURIComponent(document.querySelector('#calBtn').href)`);
    assert.ok(cal.includes('card.html'), 'calendar details link back to the card');
    assert.ok(!cal.includes('Rahul'), 'guest name must not be forwarded');
  });

  test('RSVP button uses the cleaned WhatsApp number', async () => {
    await page.goto(cardLink({ ...PRESETS.kitty.card, rsvp: '+91 98765-43210' }, '?to=Neha&auto'));
    const href = await page.eval(`document.querySelector('#rsvpBtn').href`);
    assert.match(href, /^https:\/\/wa\.me\/919876543210\?text=/);
    assert.match(decodeURIComponent(href), /Neha here/);
  });

  test('RSVP button is hidden when the number has no digits', async () => {
    await page.goto(cardLink({ ...PRESETS.kitty.card, rsvp: 'call me' }, '?auto'));
    assert.equal(await page.eval(`!!document.querySelector('#rsvpBtn')`), false);
  });

  test('every template renders without errors', async () => {
    for (const key of Object.keys(loadApp().THEMES)) {
      await page.goto(cardLink({ ...PRESETS.wedding.card, theme: key }, '?preview&auto'), 300);
      await page.waitFor(`document.body.classList.contains('theme-${key}') && document.body.classList.contains('opened')`, 5000);
      assert.deepEqual(page.errors, [], `errors in template ${key}`);
    }
  });

  test('malicious content is shown as text and dangerous links are blocked', async () => {
    const evil = {
      host1: '<img src=x onerror="window.__xss=1">', host2: '"><script>window.__xss=2</script>',
      title: '<b>bold</b>', venue: 'Hall', mapUrl: 'javascript:window.__xss=3', photo: 'javascript:window.__xss=4',
      rsvp: '123', events: [{ name: '<svg onload="window.__xss=5">', venue: '<i>x</i>' }]
    };
    await page.goto(cardLink(evil, '?to=' + encodeURIComponent('<img src=x onerror="window.__xss=6">')));
    await openEnvelope();
    assert.equal(await page.eval(`window.__xss`), undefined, 'no injected script ran');
    assert.equal(await page.eval(`document.querySelectorAll('#card img, #card script, #card svg [onload], #envelope img').length`), 0);
    assert.match(await page.eval(`document.querySelector('.names').textContent`), /<img src=x/);
    assert.match(await page.eval(`document.querySelector('.venue a').href`), /^https:\/\/www\.google\.com\/maps/);
    assert.equal(await page.eval(`!!document.querySelector('.photo')`), false, 'javascript: photo rejected');
  });

  test('broken or cut-off links show a friendly message', async () => {
    const full = Codec.encode(PRESETS.wedding.card);
    for (const hash of ['%%%garbage', full.slice(0, 40), Codec.encode(null), Codec.encode([1, 2])]) {
      await page.goto(`${base}card.html#${hash}`);
      assert.match(await page.eval(`document.querySelector('#card').textContent`), /link is incomplete/, hash);
      assert.equal(await page.eval(`document.body.classList.contains('locked')`), false);
      noErrors();
    }
  });

  test('uploaded photo (data URL) shows on the card', async () => {
    const photo = await page.eval(`(() => { const c = document.createElement('canvas'); c.width = c.height = 50; const g = c.getContext('2d'); g.fillStyle = 'red'; g.fillRect(0, 0, 50, 50); return c.toDataURL('image/png'); })()`);
    await page.goto(cardLink({ ...PRESETS.birthday.card, photo }, '?auto'));
    await page.waitFor(`document.querySelector('.photo img')?.naturalWidth === 50`);
  });

  // ---------- Admin ----------
  test('admin: lists 10 occasions and 12 templates', async () => {
    await page.viewport(1300, 900);
    await page.goto(base + 'admin.html');
    assert.equal(await page.eval(`document.querySelectorAll('.occasion').length`), 10);
    assert.equal(await page.eval(`document.querySelectorAll('.tpl').length`), 12);
    assert.equal(await page.eval(`document.querySelector('.tpl.on').dataset.theme`), 'royal');
    noErrors();
  });

  test('admin: typing updates the live preview', async () => {
    await page.eval(`(() => { const i = document.querySelector('[name=host1]'); i.value = 'Zoya'; i.dispatchEvent(new Event('input', { bubbles: true })); })()`);
    await page.waitFor(`document.querySelector('#preview').src.includes('#')`);
    await new Promise(r => setTimeout(r, 600));
    const hash = await page.eval(`new URL(document.querySelector('#preview').src).hash.slice(1)`);
    assert.equal(Codec.decode(hash).host1, 'Zoya');
  });

  test('admin: switching occasion loads its preset and labels', async () => {
    await page.eval(`document.querySelector('[data-type="birthday"]').click()`);
    assert.equal(await page.eval(`document.querySelector('[name=host1]').value`), 'Kabir');
    assert.equal(await page.eval(`document.querySelector('[name=host2]').value`), '');
    assert.equal(await page.eval(`document.querySelector('#lbl1').textContent`), "Birthday star's name");
    assert.equal(await page.eval(`document.querySelector('.tpl.on').dataset.theme`), 'kids');
  });

  test('admin: picking a template selects it', async () => {
    await page.eval(`document.querySelector('.tpl[data-theme="neon"]').click()`);
    assert.equal(await page.eval(`document.querySelector('.tpl.on').dataset.theme`), 'neon');
    assert.match(await page.eval(`document.querySelector('#themeName').textContent`), /Neon Love/);
  });

  test('admin: functions can be added and removed', async () => {
    const before = await page.eval(`document.querySelectorAll('.event-row').length`);
    await page.eval(`document.querySelector('#addEvent').click()`);
    assert.equal(await page.eval(`document.querySelectorAll('.event-row').length`), before + 1);
    await page.eval(`document.querySelector('.event-row:last-child .x').click()`);
    assert.equal(await page.eval(`document.querySelectorAll('.event-row').length`), before);
  });

  test('admin: photo upload is compressed into the link', async () => {
    await page.eval(`(async () => {
      const c = Object.assign(document.createElement('canvas'), { width: 1600, height: 1200 });
      const g = c.getContext('2d'); g.fillStyle = '#3af'; g.fillRect(0, 0, 1600, 1200);
      const blob = await new Promise(r => c.toBlob(r, 'image/png'));
      const dt = new DataTransfer(); dt.items.add(new File([blob], 'kid.png', { type: 'image/png' }));
      const fi = document.querySelector('#photoFile'); fi.files = dt.files; fi.dispatchEvent(new Event('change'));
    })()`);
    await page.waitFor(`document.querySelector('#photoThumb img')`);
    const info = await page.eval(`document.querySelector('#photoInfo').textContent`);
    const kb = +info.match(/\((\d+) KB\)/)[1];
    assert.ok(kb <= 12, `photo is ${kb} KB`);
    assert.equal(await page.eval(`document.querySelector('[name=photo]').disabled`), true);
  });

  test('admin: refuses to generate without a name', async () => {
    await page.eval(`(() => { const i = document.querySelector('[name=host1]'); i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true })); })()`);
    await page.eval(`document.querySelector('#generate-btn').click()`);
    assert.match(await page.eval(`document.querySelector('#toast').textContent`), /fill in a name/);
    assert.equal(await page.eval(`document.querySelectorAll('#results .result').length`), 0);
    await page.eval(`(() => { const i = document.querySelector('[name=host1]'); i.value = 'Kabir'; i.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  });

  test('admin: generates one personal link per guest and saves them', async () => {
    await page.eval(`document.querySelector('#guests').value = ['Rahul Uncle', '', '  Sharma Family  ', 'Priya Di'].join('\\n')`);
    await page.eval(`document.querySelector('#generate-btn').click()`);
    assert.equal(await page.eval(`document.querySelectorAll('#results .result').length`), 3);
    assert.equal(await page.eval(`document.querySelector('#linkCount').textContent`), '3');
    assert.equal(await page.eval(`document.querySelectorAll('#linksTable tbody tr').length`), 3);
    const links = await page.eval(`[...document.querySelectorAll('#results .result input')].map(i => i.value)`);
    assert.deepEqual(links.map(l => new URL(l).searchParams.get('to')), ['Rahul Uncle', 'Sharma Family', 'Priya Di']);
    const card = Codec.decode(new URL(links[0]).hash.slice(1));
    assert.equal(card.host1, 'Kabir');
    assert.equal(card.theme, 'neon');
    assert.match(card.photo, /^data:image\//);
    const wa = await page.eval(`decodeURIComponent(document.querySelector('#results .wa').href)`);
    assert.match(wa, /Dear Rahul Uncle/);
    assert.match(wa, /Kids Birthday/);
  });

  test('admin: a generated link opens the right card', async () => {
    const link = await page.eval(`document.querySelector('#results .result input').value`);
    await page.viewport(420, 860);
    await page.goto(link.replace('card.html?', 'card.html?auto&'));
    await page.waitFor(`document.body.classList.contains('opened')`, 5000);
    assert.equal(await page.eval(`document.querySelector('.env-to').textContent`), 'Dear Rahul Uncle,');
    assert.equal(await page.eval(`document.body.classList.contains('theme-neon')`), true);
    assert.equal(await page.eval(`document.querySelector('.photo img').naturalWidth`), 200);
    noErrors();
  });

  test('admin: history survives a reload, and search filters it', async () => {
    await page.viewport(1300, 900);
    await page.goto(base + 'admin.html');
    assert.equal(await page.eval(`document.querySelector('#linkCount').textContent`), '3');
    await page.eval(`(() => { const s = document.querySelector('#search'); s.value = 'sharma'; s.dispatchEvent(new Event('input')); })()`);
    assert.equal(await page.eval(`document.querySelectorAll('#linksTable tbody tr').length`), 1);
    await page.eval(`(() => { const s = document.querySelector('#search'); s.value = ''; s.dispatchEvent(new Event('input')); })()`);
  });

  test('admin: Edit loads the saved card without leaking preset values (regression)', async () => {
    // The editor is on the wedding preset (host2 = Aarav); the saved kids link has no host2.
    assert.equal(await page.eval(`document.querySelector('[name=host2]').value`), 'Aarav');
    await page.eval(`document.querySelector('[data-edit]').click()`);
    assert.equal(await page.eval(`document.querySelector('[name=host1]').value`), 'Kabir');
    assert.equal(await page.eval(`document.querySelector('[name=host2]').value`), '', 'host2 must stay empty');
    assert.equal(await page.eval(`document.querySelector('.occasion.on').dataset.type`), 'birthday');
    assert.equal(await page.eval(`document.querySelector('.tpl.on').dataset.theme`), 'neon');
    assert.equal(await page.eval(`!!document.querySelector('#photoThumb img')`), true, 'photo restored');
  });

  test('admin: delete and clear-all remove links', async () => {
    await page.eval(`document.querySelector('[data-del]').click()`);
    assert.equal(await page.eval(`document.querySelector('#linkCount').textContent`), '2');
    await page.eval(`document.querySelector('#clearAll').click()`);
    await page.waitFor(`document.querySelector('#linkCount').textContent === '0'`);
    assert.equal(await page.eval(`document.querySelector('#emptyLinks').hidden`), false);
    noErrors();
  });

  test('admin: mobile layout has no horizontal scroll', async () => {
    await page.viewport(390, 844);
    await page.goto(base + 'admin.html');
    assert.ok(await page.eval(`document.documentElement.scrollWidth <= innerWidth + 1`), 'page wider than screen');
    await page.goto(base + 'index.html');
    assert.ok(await page.eval(`document.documentElement.scrollWidth <= innerWidth + 1`), 'landing wider than screen');
  });
});
