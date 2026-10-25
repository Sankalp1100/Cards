// Browser tests: drive the real pages in headless Chrome. Skipped automatically if Chrome/Edge is not installed.
import test from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { createRequire } from 'node:module';
import { launch, chromePath } from './cdp.mjs';
import { server } from '../server.mjs';

const require = createRequire(import.meta.url);
const { loadApp, ROOT } = require('./load.js');
const { PRESETS, Codec, Core, Templates } = loadApp();

const base = pathToFileURL(path.join(ROOT, 'index.html')).href.replace(/index\.html$/, '');
const cardLink = (card, query = '') => `${base}card.html${query}#${Codec.encode(Core.compact(card))}`;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const type = (sel, value) => `(() => { const i = document.querySelector(${JSON.stringify(sel)}); i.value = ${JSON.stringify(value)}; i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true })); })()`;

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
  test('landing page sells 200 numbered designs, 24 at a time, without iframes', async () => {
    await page.viewport(1300, 900);
    await page.goto(base + 'index.html');
    assert.equal(await page.eval(`document.querySelector('#tplCount').textContent`), '200');
    assert.equal(await page.eval(`document.querySelectorAll('#showcase .tpl').length`), 24);
    assert.equal(await page.eval(`document.querySelectorAll('iframe').length`), 0, 'no embedded live cards (they made the page slow)');
    assert.match(await page.eval(`document.querySelector('#demoBtn').href`), /card\.html\?demo#/);
    assert.match(await page.eval(`document.querySelector('#showcase .tpl .serial').textContent`), /Design No\. #\d{3}/);
    noErrors();
  });

  test('trending designs come first with a badge', async () => {
    const first = await page.eval(`[...document.querySelectorAll('#showcase .tpl')].slice(0, 6).map(t => [t.dataset.no, !!t.querySelector('.p-badge')])`);
    assert.deepEqual(first, [['1', true], ['7', true], ['9', true], ['10', true], ['13', true], ['22', true]]);
  });

  test('"Show more" loads the next page until all 200 are shown', async () => {
    for (let i = 0; i < 10 && !(await page.eval(`document.querySelector('#moreBtn').hidden`)); i++) await page.eval(`document.querySelector('#moreBtn').click()`);
    assert.equal(await page.eval(`document.querySelectorAll('#showcase .tpl').length`), 200);
    assert.equal(await page.eval(`new Set([...document.querySelectorAll('#showcase .tpl')].map(t => t.dataset.no)).size`), 200);
  });

  test('searching a design number shows exactly that design', async () => {
    await page.eval(type('#tplSearch', '47'));
    await page.waitFor(`document.querySelectorAll('#showcase .tpl').length === 1`);
    assert.equal(await page.eval(`document.querySelector('#showcase .tpl .serial b').textContent`), '#047');
    await page.eval(type('#tplSearch', 'zzzz'));
    await page.waitFor(`!document.querySelector('#noMatch').hidden`);
    await page.eval(type('#tplSearch', ''));
    await page.waitFor(`document.querySelectorAll('#showcase .tpl').length === 24`);
  });

  test('occasion and trending filters', async () => {
    await page.eval(`document.querySelector('[data-occ="kitty"]').click()`);
    await page.waitFor(`document.querySelectorAll('#showcase .tpl').length === 20`);
    assert.equal(await page.eval(`document.querySelector('#moreBtn').hidden`), true);
    await page.eval(`document.querySelector('[data-occ="trending"]').click()`);
    assert.equal(await page.eval(`document.querySelectorAll('#showcase .tpl').length`), 6);
    await page.eval(`document.querySelector('[data-occ=""]').click()`);
  });

  test('landing page never shows the admin panel to customers', async () => {
    const links = await page.eval(`[...document.querySelectorAll('a')].map(a => a.getAttribute('href') + ' ' + a.textContent).join(' ')`);
    assert.ok(!/admin/i.test(links), 'a link mentions admin');
    assert.ok(!/admin/i.test(await page.eval(`document.body.innerText`)), 'page text mentions admin');
  });

  test('every Live demo opens a working card of its own design', async () => {
    const hrefs = await page.eval(`[...document.querySelectorAll('#showcase .poster')].map(a => [a.closest('.tpl').dataset.no, a.href])`);
    for (const [no, h] of hrefs) {
      const card = Codec.decode(new URL(h).hash.slice(1));
      assert.ok(Core.isCard(card), h);
      assert.equal(card.theme, +no);
    }
  });

  test('order buttons quote the design number (WhatsApp when a number is set)', async () => {
    const orders = await page.eval(`[...document.querySelectorAll('.order')].map(a => [a.textContent, a.href])`);
    const number = await page.eval(`Core.waNumber(SITE.whatsapp)`);
    assert.equal(orders.length, 24);
    for (const [text, h] of orders) {
      assert.match(text, /Order #\d{3}/);
      if (number) assert.match(decodeURIComponent(h), new RegExp(`^https://wa\\.me/${number}\\?text=.*design #\\d{3}`));
      else assert.ok(h.endsWith('#order'), h);
    }
  });

  // ---------- Card ----------
  test('demo card: envelope opens and every section renders', async () => {
    await page.viewport(420, 860);
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
    assert.match(await page.eval(`document.querySelector('footer a').getAttribute('href')`), /^index\.html$/, 'footer sells the service');
    assert.equal(await page.eval(`!!document.querySelector('#demoBar')`), false, 'guests never see the sample bar');
    const fonts = await page.eval(`document.querySelector('#themeFonts').href`);
    assert.equal((fonts.match(/family=/g) || []).length, 3, 'only the 3 fonts this design uses');
    noErrors();
  });

  test('a card opened from the catalog shows its design number and an order button', async () => {
    await page.goto(cardLink({ ...PRESETS.bday.card, theme: 47 }, '?demo'));
    assert.match(await page.eval(`document.querySelector('#demoBar').textContent`), /#047/);
    assert.match(await page.eval(`document.querySelector('#demoBar a').textContent`), /Order #047/);
    assert.ok(await page.eval(`document.body.classList.contains('theme-47')`));
  });

  test('old links that name a design ("royal", "neon") still open the same design', async () => {
    await page.goto(cardLink({ ...PRESETS.wedding.card, theme: 'neon' }, '?auto'));
    assert.ok(await page.eval(`document.body.classList.contains('theme-6') && document.body.classList.contains('flavor-neon')`));
    await page.goto(cardLink({ ...PRESETS.wedding.card, theme: 'unknown-design' }, '?auto'));
    assert.ok(await page.eval(`document.body.classList.contains('theme-1')`), 'unknown design falls back to #001');
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

  test('all 200 designs render without errors, with their decor and particles', async () => {
    for (const t of Templates.all) {
      await page.goto(cardLink({ ...PRESETS[t.occasion].card, theme: t.no }, '?preview&auto'), 0);
      await page.waitFor(`document.body.classList.contains('theme-${t.no}') && document.body.classList.contains('opened')`, 5000);
      const decor = { mandala: '.mandala', blobs: '.blob', frame: '.frame' }[t.decor];
      assert.ok(await page.eval(`!!document.querySelector('${decor}')`), `#${t.no} decor ${t.decor}`);
      assert.deepEqual(page.errors, [], `errors in design #${t.no}`);
    }
  });

  test('malicious content is shown as text and dangerous links are blocked', async () => {
    const evil = {
      host1: '<img src=x onerror="window.__xss=1">', host2: '"><script>window.__xss=2</script>',
      title: '<b>bold</b>', venue: 'Hall', mapUrl: 'javascript:window.__xss=3', photo: 'javascript:window.__xss=4',
      rsvp: '123', theme: '<img src=x onerror="window.__xss=7">', events: [{ name: '<svg onload="window.__xss=5">', venue: '<i>x</i>' }]
    };
    await page.goto(cardLink(evil, '?demo&to=' + encodeURIComponent('<img src=x onerror="window.__xss=6">')));
    await openEnvelope();
    assert.equal(await page.eval(`window.__xss`), undefined, 'no injected script ran');
    assert.equal(await page.eval(`document.querySelectorAll('#card img, #card script, #card svg [onload], #envelope img, #demoBar img').length`), 0);
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

  test('card animates smoothly (sprites, no live glow blur)', async () => {
    await page.goto(cardLink({ ...PRESETS.anniversary.card, theme: 3 }, '?auto'), 1500);
    const fps = await page.eval(`new Promise(res => { let n = 0; const end = performance.now() + 1500; const f = t => { n++; t < end ? requestAnimationFrame(f) : res(n / 1.5); }; requestAnimationFrame(f); })`);
    assert.ok(fps > 40, `${fps.toFixed(0)} fps`);
  });

  // ---------- Admin ----------
  test('admin: lists 10 occasions and the first 40 designs', async () => {
    await page.viewport(1300, 900);
    await page.goto(base + 'admin.html');
    assert.equal(await page.eval(`document.querySelectorAll('.occasion').length`), 10);
    assert.equal(await page.eval(`document.querySelectorAll('#gallery .tpl').length`), 40);
    assert.equal(await page.eval(`document.querySelector('#gallery .tpl.on').dataset.no`), '1');
    assert.equal(await page.eval(`document.querySelector('#designNo').value`), '001');
    assert.equal(await page.eval(`document.querySelectorAll('iframe').length`), 1, 'only the big preview is a live card');
    assert.equal(await page.eval(`document.querySelector('#publishBar').hidden`), true, 'nothing to publish yet');
    noErrors();
  });

  test('admin: typing a design number selects it and loads its occasion', async () => {
    await page.eval(type('#designNo', '47'));
    await page.waitFor(`document.querySelector('#themeName').textContent.includes('#047')`, 3000);
    assert.equal(await page.eval(`document.querySelector('.occasion.on').dataset.type`), Templates.get(47).occasion);
    assert.equal(await page.eval(`document.querySelector('[name=host1]').value`), PRESETS[Templates.get(47).occasion].card.host1);
    await page.waitFor(`Codec.decode(new URL(document.querySelector('#preview').src).hash.slice(1)).theme === 47`);
  });

  test('admin: a number that does not exist explains the range', async () => {
    await page.eval(type('#designNo', '999'));
    await page.waitFor(`/from 1 to 200/.test(document.querySelector('#designMsg').textContent)`, 3000);
    assert.match(await page.eval(`document.querySelector('#themeName').textContent`), /#047/, 'selection unchanged');
  });

  test('admin: typing updates the live preview', async () => {
    await page.eval(`document.querySelector('[data-type="wedding"]').click()`);
    await page.eval(type('[name=host1]', 'Zoya'));
    await sleep(700);
    const hash = await page.eval(`new URL(document.querySelector('#preview').src).hash.slice(1)`);
    assert.equal(Codec.decode(hash).host1, 'Zoya');
  });

  test('admin: once details are typed, picking a design keeps them', async () => {
    await page.eval(type('#designNo', '7'));
    await page.waitFor(`document.querySelector('#themeName').textContent.includes('#007')`, 3000);
    assert.equal(await page.eval(`document.querySelector('[name=host1]').value`), 'Zoya');
    assert.equal(await page.eval(`document.querySelector('.occasion.on').dataset.type`), 'wedding');
  });

  test('admin: Clear all empties the form, Sample text refills it', async () => {
    await page.eval(`document.querySelector('#clearBtn').click()`);
    assert.equal(await page.eval(`document.querySelector('[name=host1]').value`), '');
    assert.equal(await page.eval(`document.querySelector('[name=host1]').placeholder`), 'Diya', 'sample shown as a hint');
    assert.equal(await page.eval(`document.querySelectorAll('.event-row').length`), 0);
    assert.ok(await page.eval(`document.querySelectorAll('#quickEvents .chip').length`) >= 5, 'quick-add functions offered');
    await page.eval(`document.querySelector('#quickEvents .chip').click()`);
    assert.equal(await page.eval(`document.querySelectorAll('.event-row').length`), 1);
    await page.eval(`document.querySelector('#sampleBtn').click()`);
    assert.equal(await page.eval(`document.querySelector('[name=host1]').value`), 'Diya');
  });

  test('admin: switching occasion loads its preset and labels', async () => {
    await page.eval(`document.querySelector('[data-type="birthday"]').click()`);
    assert.equal(await page.eval(`document.querySelector('[name=host1]').value`), 'Kabir');
    assert.equal(await page.eval(`document.querySelector('[name=host2]').value`), '');
    assert.equal(await page.eval(`document.querySelector('#lbl1').textContent`), "Birthday star's name");
  });

  test('admin: picking a design in the gallery selects it', async () => {
    await page.eval(`document.querySelector('#galSearch').value = '6'; document.querySelector('#galSearch').dispatchEvent(new Event('input'))`);
    await page.waitFor(`document.querySelectorAll('#gallery .tpl').length === 1`);
    await page.eval(`document.querySelector('#gallery [data-pick="6"]').click()`);
    assert.equal(await page.eval(`document.querySelector('#gallery .tpl.on').dataset.no`), '6');
    assert.match(await page.eval(`document.querySelector('#themeName').textContent`), /Neon Love/);
    await page.eval(`document.querySelector('#galSearch').value = ''; document.querySelector('#galSearch').dispatchEvent(new Event('input'))`);
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
    await page.eval(type('[name=host1]', ''));
    await page.eval(`document.querySelector('#generate-btn').click()`);
    assert.match(await page.eval(`document.querySelector('#toast').textContent`), /fill in a name/);
    assert.equal(await page.eval(`document.querySelectorAll('#results .result').length`), 0);
    await page.eval(type('[name=host1]', 'Kabir'));
  });

  test('admin: generates one personal link per guest and saves them', async () => {
    await page.eval(`document.querySelector('#guests').value = ['Rahul Uncle', '', '  Sharma Family  ', 'Priya Di'].join('\\n')`);
    await page.eval(`document.querySelector('#generate-btn').click()`);
    assert.equal(await page.eval(`document.querySelectorAll('#results .result').length`), 3);
    assert.equal(await page.eval(`document.querySelector('#resultsHead').hidden`), false);
    assert.equal(await page.eval(`document.querySelector('#linkCount').textContent`), '3');
    assert.equal(await page.eval(`document.querySelectorAll('#linksTable tbody tr').length`), 3);
    assert.match(await page.eval(`document.querySelector('#linksTable tbody td:nth-child(3)').textContent`), /#006 Neon Love/);
    const links = await page.eval(`[...document.querySelectorAll('#results .result input')].map(i => i.value)`);
    assert.deepEqual(links.map(l => new URL(l).searchParams.get('to')), ['Rahul Uncle', 'Sharma Family', 'Priya Di']);
    const card = Codec.decode(new URL(links[0]).hash.slice(1));
    assert.equal(card.host1, 'Kabir');
    assert.equal(card.theme, 6);
    assert.match(card.photo, /^data:image\//);
    const wa = await page.eval(`decodeURIComponent(document.querySelector('#results .wa').href)`);
    assert.match(wa, /Dear Rahul Uncle/);
    assert.match(wa, /Kids Birthday/);
  });

  test('admin: a generated link opens the right card', async () => {
    const link = new URL(await page.eval(`document.querySelector('#results .result input').value`));
    assert.match(link.pathname, /card\.html$/);
    await page.viewport(420, 860);
    await page.goto(`${base}card.html?auto&${link.search.slice(1)}${link.hash}`);
    await page.waitFor(`document.body.classList.contains('opened')`, 5000);
    assert.equal(await page.eval(`document.querySelector('.env-to').textContent`), 'Dear Rahul Uncle,');
    assert.equal(await page.eval(`document.body.classList.contains('theme-6')`), true);
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
    assert.equal(await page.eval(`document.querySelector('[name=host2]').value`), 'Aarav');
    await page.eval(`document.querySelector('[data-edit]').click()`);
    assert.equal(await page.eval(`document.querySelector('[name=host1]').value`), 'Kabir');
    assert.equal(await page.eval(`document.querySelector('[name=host2]').value`), '', 'host2 must stay empty');
    assert.equal(await page.eval(`document.querySelector('.occasion.on').dataset.type`), 'birthday');
    assert.equal(await page.eval(`document.querySelector('#designNo').value`), '006');
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

  test('admin catalog: lists all 200 and filters them', async () => {
    assert.equal(await page.eval(`document.querySelectorAll('#catTable tbody tr').length`), 200);
    await page.eval(`(() => { const s = document.querySelector('#catShow'); s.value = 'trending'; s.dispatchEvent(new Event('input')); })()`);
    assert.equal(await page.eval(`document.querySelectorAll('#catTable tbody tr').length`), 6);
    await page.eval(`(() => { const s = document.querySelector('#catShow'); s.value = ''; s.dispatchEvent(new Event('input')); })()`);
    await page.eval(type('#catSearch', '47'));
    assert.equal(await page.eval(`document.querySelectorAll('#catTable tbody tr').length`), 1);
  });

  test('admin catalog: edits are kept as a draft and offered for publishing', async () => {
    await page.eval(type('#catTable tr[data-no="47"] [data-f="name"]', 'Shaadi Gold'));
    await page.eval(`document.querySelector('#catTable tr[data-no="47"] [data-f="featured"]').click()`);
    await page.eval(`document.querySelector('#catTable tr[data-no="47"] [data-f="show"]').click()`);
    await page.eval(type('#catTable tr[data-no="47"] [data-f="price"]', '₹1,499'));
    assert.equal(await page.eval(`document.querySelector('#publishBar').hidden`), false);
    const draft = await page.eval(`JSON.parse(localStorage.getItem('weddingcard.config')).catalog[47]`);
    assert.deepEqual(draft, { name: 'Shaadi Gold', price: 1499, hidden: true, featured: true });
    await page.goto(base + 'admin.html');
    assert.equal(await page.eval(`document.querySelector('#publishBar').hidden`), false, 'draft survives a reload');
    await page.eval(type('#designNo', '47'));
    await page.waitFor(`/hidden on the website/.test(document.querySelector('#designMsg').textContent)`, 3000);
    assert.match(await page.eval(`document.querySelector('#themeName').textContent`), /Shaadi Gold/);
  });

  test('admin settings: cleans the website address and WhatsApp number', async () => {
    await page.eval(type('#siteForm [name=url]', 'my-cards.vercel.app'));
    await page.eval(type('#siteForm [name=whatsapp]', '+91 98765 43210'));
    assert.equal(await page.eval(`document.querySelector('#siteForm [name=url]').value`), 'https://my-cards.vercel.app/');
    assert.equal(await page.eval(`document.querySelector('#siteForm [name=whatsapp]').value`), '919876543210');
    assert.equal(await page.eval(`document.querySelector('#urlWarn').hidden`), true);
    await page.eval(type('#guests', ''));
    await page.eval(`document.querySelector('#generate-btn').click()`);
    assert.match(await page.eval(`document.querySelector('#results input').value`), /^https:\/\/my-cards\.vercel\.app\/card\.html#/, 'links use the live address');
    await page.eval(`document.querySelector('#clearAll').click()`);
  });

  test('admin: without the panel server, Publish downloads config.js', async () => {
    assert.match(await page.eval(`document.querySelector('#publishHelp').textContent`), /npm run admin/);
  });

  test('admin: Undo changes restores the published catalog', async () => {
    await page.eval(`document.querySelector('#discardBtn').click()`);
    assert.equal(await page.eval(`document.querySelector('#publishBar').hidden`), true);
    assert.equal(await page.eval(`localStorage.getItem('weddingcard.config')`), null);
    assert.equal(await page.eval(`document.querySelector('#siteForm [name=url]').value`), loadApp().SITE.url, 'back to the published address');
    noErrors();
  });

  // ---------- Panel server ----------
  test.describe('panel server', () => {
    let origin;
    test.before(async () => {
      await new Promise(r => server.listen(0, '127.0.0.1', r));
      origin = `http://127.0.0.1:${server.address().port}`;
    });
    test.after(() => new Promise(r => server.close(r)));

    test('serves the panel and offers one-click publishing', async () => {
      await page.viewport(1300, 900);
      await page.goto(origin + '/');
      await page.waitFor(`/pushes it to GitHub/.test(document.querySelector('#publishHelp').textContent)`, 4000);
      noErrors();
    });

    test('refuses publishing from another website', async () => {
      const res = await fetch(origin + '/api/publish', { method: 'POST', headers: { Origin: 'https://evil.example' }, body: '{}' });
      assert.equal(res.status, 403);
    });

    test('refuses a config that is not plain data, and leaves config.js alone', async () => {
      const fs = await import('node:fs');
      const before = fs.readFileSync(path.join(ROOT, 'js', 'config.js'), 'utf8');
      const res = await fetch(origin + '/api/publish', { method: 'POST', body: JSON.stringify({ config: 'const SITE = {}; const CATALOG = {}; require("child_process")' }) });
      assert.equal(res.status, 400);
      assert.equal(fs.readFileSync(path.join(ROOT, 'js', 'config.js'), 'utf8'), before);
    });

    test('does not serve files outside the project or the .git folder', async () => {
      assert.equal((await fetch(origin + '/.git/config')).status, 403);
      assert.notEqual((await fetch(origin + '/..%2f..%2fWindows%2fwin.ini')).status, 200);
    });
  });

  // ---------- Phones ----------
  test('mobile: no page scrolls sideways', async () => {
    for (const w of [360, 390]) {
      await page.viewport(w, 800);
      for (const p of ['index.html', 'admin.html', 'card.html?auto', 'card.html?demo&auto#' + Codec.encode({ ...PRESETS.kitty.card, theme: 26 })]) {
        await page.goto(base + p);
        assert.ok(await page.eval(`document.documentElement.scrollWidth <= innerWidth + 1`), `${p} wider than a ${w}px screen`);
        noErrors();
      }
    }
  });

  test('mobile: catalog posters fit two per row with the order button visible', async () => {
    await page.viewport(390, 844);
    await page.goto(base + 'index.html');
    const cols = await page.eval(`getComputedStyle(document.querySelector('#showcase')).gridTemplateColumns.split(' ').length`);
    assert.equal(cols, 2);
    const fits = await page.eval(`[...document.querySelectorAll('#showcase .tpl')].slice(0, 4).every(t => { const p = t.querySelector('.p-play').getBoundingClientRect(), b = t.querySelector('.poster').getBoundingClientRect(); return p.bottom <= b.bottom + 1; })`);
    assert.ok(fits, '"Live demo" button is cut off on a phone');
  });

  test('mobile: the sample bar and music button do not overlap', async () => {
    await page.viewport(360, 740);
    await page.goto(cardLink({ ...PRESETS.wedding.card, theme: 13 }, '?demo'));
    await openEnvelope();
    const [bar, btn] = await page.eval(`[document.querySelector('#demoBar'), document.querySelector('#musicBtn')].map(e => e.getBoundingClientRect().toJSON())`);
    assert.ok(bar.right <= btn.left, `bar ends at ${bar.right}, button starts at ${btn.left}`);
  });
});
