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
const { PRESETS, Codec, Core, Templates, INTROS, Catalog } = loadApp();

const base = pathToFileURL(path.join(ROOT, 'index.html')).href.replace(/index\.html$/, '');
const cardLink = (card, query = '') => `${base}card.html${query}#${Codec.encode(Core.compact(card))}`;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const future = days => Core.nowLocal(new Date(Date.now() + days * 864e5)); // a date that never becomes "past"
const type = (sel, value) => `(() => { const i = document.querySelector(${JSON.stringify(sel)}); i.value = ${JSON.stringify(value)}; i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true })); })()`;

test.describe('browser', { skip: !chromePath && 'Chrome/Edge not found' }, () => {
  let page;
  test.before(async () => { page = await launch(); await page.viewport(420, 860); });
  test.after(async () => { await page?.close(); });

  const noErrors = () => assert.deepEqual(page.errors, [], 'JavaScript errors on the page');
  const openEnvelope = async () => {
    await page.eval(`document.querySelector('.intro-tap').click()`);
    await page.waitFor(`document.body.classList.contains('opened')`, 5000);
  };

  // ---------- Landing ----------
  test('landing page sells 600 numbered designs, 24 at a time, without iframes', async () => {
    await page.viewport(1300, 900);
    await page.goto(base + 'index.html');
    assert.equal(await page.eval(`document.querySelector('#tplCount').textContent`), '600');
    assert.equal(await page.eval(`document.querySelectorAll('#occPicker .occ-tile').length`), 20, 'a tile per occasion');
    assert.match(await page.eval(`document.querySelector('#occPicker .occ-tile').textContent`), /Wedding\s*30 designs/);
    assert.equal(await page.eval(`document.querySelectorAll('#showcase .tpl').length`), 24);
    assert.equal(await page.eval(`document.querySelectorAll('iframe').length`), 0, 'no embedded live cards (they made the page slow)');
    assert.match(await page.eval(`document.querySelector('#demoBtn').href`), /card\.html\?demo#/);
    assert.match(await page.eval(`document.querySelector('#showcase .tpl .serial').textContent`), /Design No\. #\d{3}/);
    assert.equal(await page.eval(`document.querySelector('#showcase .tpl[data-no="1"] .opening').textContent`), '✉️ Envelope opening', '#001 opens with the envelope');
    noErrors();
  });

  test("today's ten trending designs come first with a badge, the owner's picks among them", async () => {
    const tiles = await page.eval(`[...document.querySelectorAll('#showcase .tpl')].slice(0, 11).map(t => [+t.dataset.no, !!t.querySelector('.p-badge')])`);
    assert.ok(tiles.slice(0, 10).every(([, badge]) => badge), 'the first ten have the badge');
    assert.equal(tiles[10][1], false, 'the eleventh does not');
    const first = tiles.slice(0, 10).map(([no]) => no);
    for (const no of [1, 7, 9, 10, 13, 22]) assert.ok(first.includes(no), `owner pick #${no} is trending`);
  });

  test('"Show more" loads the next page until all 600 are shown', async () => {
    for (let i = 0; i < 40 && !(await page.eval(`document.querySelector('#moreBtn').hidden`)); i++) await page.eval(`document.querySelector('#moreBtn').click()`);
    assert.equal(await page.eval(`document.querySelectorAll('#showcase .tpl').length`), 600);
    assert.equal(await page.eval(`new Set([...document.querySelectorAll('#showcase .tpl')].map(t => t.dataset.no)).size`), 600);
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
    await page.waitFor(`document.querySelectorAll('#showcase .tpl').length === 24`);
    assert.match(await page.eval(`document.querySelector('#catStatusText').textContent`), /Showing 30 💃 Kitty Party designs of 600/);
    await page.eval(`document.querySelector('#moreBtn').click()`);
    assert.equal(await page.eval(`document.querySelectorAll('#showcase .tpl').length`), 30, 'all 30 kitty designs');
    assert.ok(await page.eval(`[...document.querySelectorAll('#showcase .tpl .tpl-meta small')].every(s => s.textContent.includes('Kitty Party'))`), 'only kitty designs');
    assert.equal(await page.eval(`document.querySelector('#moreBtn').hidden`), true);
    await page.eval(`document.querySelector('#catShowAll').click()`);
    assert.equal(await page.eval(`document.querySelector('#catStatus').hidden`), true, 'Show all clears the filter');
    assert.equal(await page.eval(`document.querySelector('#tplFilters .chip.on').dataset.occ`), '');
    await page.eval(`document.querySelector('[data-occ="trending"]').click()`);
    assert.equal(await page.eval(`document.querySelectorAll('#showcase .tpl').length`), 10, "today's ten trending designs");
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

  test('each design has an Order button with its number', async () => {
    const orders = await page.eval(`[...document.querySelectorAll('#showcase .order')].map(b => [b.textContent, b.dataset.design, b.closest('.tpl').dataset.no])`);
    assert.equal(orders.length, 24);
    for (const [text, design, no] of orders) {
      assert.match(text, /Order #\d{3}/);
      assert.equal(design, no);
    }
  });

  // ---------- Order form ----------
  const fill = (name, value) => `(() => { const i = document.querySelector('#orderForm [name=${name}]'); i.value = ${JSON.stringify(value)}; i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true })); })()`;
  const next = () => page.eval(`document.querySelector('#osNext').click()`);

  test('order form: a design\'s Order button opens it with the design and occasion filled', async () => {
    await page.eval(`SITE.whatsapp = '919999999999'`); // as if a business number were set
    await page.eval(`document.querySelector('#showcase .tpl[data-no="10"] .order').click()`);
    assert.equal(await page.eval(`document.querySelector('#orderSheet').hidden`), false);
    assert.equal(await page.eval(`document.querySelector('#orderForm [name=design]').value`), '10');
    assert.equal(await page.eval(`document.querySelector('#osOcc .chip.on').dataset.type`), 'sangeet');
    assert.match(await page.eval(`document.querySelector('#osDesign').textContent`), /#010 Filmy Bollywood/);
  });

  const errorText = () => page.eval(`document.querySelector('#osError').textContent`);
  const flagged = () => page.eval(`document.querySelector('#orderForm [aria-invalid="true"]')?.name || ''`);

  test('order form: every needed field is asked for, and the missing one is highlighted', async () => {
    await next();
    assert.equal(await page.eval(`document.querySelector('.os-step[data-step="1"]').hidden`), false);
    assert.equal(await page.eval(`document.querySelectorAll('.os-step[data-step="1"] .req:not([hidden])').length`), 5, 'note + Name 1, Name 2, date, venue are marked *');
    await next();
    assert.match(await errorText(), /Please enter: Partner 1/);
    assert.equal(await flagged(), 'host1');
    await page.eval(fill('host1', 'Diya'));
    assert.equal(await flagged(), '', 'typing clears the warning');
    await next();
    assert.match(await errorText(), /Please enter: Partner 2/, 'a couple needs both names');
    await page.eval(fill('host2', 'Aarav'));
    await page.eval(fill('nick1', 'Diyu'));
    await next();
    assert.match(await errorText(), /date/);
    assert.equal(await flagged(), 'date');
    assert.ok(await page.eval(`document.querySelector('#orderForm [name=date]').min`) >= future(-0.01), 'the date picker starts today');
    await page.eval(fill('date', '2020-01-01T10:00'));
    assert.match(await errorText(), /already passed/, 'a past date is refused as soon as it is picked (iPhone Safari ignores min)');
    assert.equal(await page.eval(`document.querySelector('#orderForm [name=date]').value`), '', 'and cleared');
    assert.equal(await flagged(), 'date');
    await page.eval(fill('date', future(60)));
    await next();
    assert.match(await errorText(), /venue/);
    await page.eval(fill('venue', 'Grand Ballroom, Udaipur'));
    await page.eval(fill('mapUrl', 'not a link'));
    await next();
    assert.match(await errorText(), /location should be a link/, 'optional location, but checked when filled');
    await page.eval(fill('mapUrl', 'https://maps.app.goo.gl/abc123'));
    await next();
    assert.equal(await page.eval(`document.querySelector('.os-step[data-step="2"]').hidden`), false);
  });

  test('order form: functions, extras, and one complete WhatsApp message with the order code', async () => {
    await page.eval(`document.querySelector('#osQuick .chip').click()`);
    assert.equal(await page.eval(`document.querySelectorAll('#osEvents .os-event').length`), 1);
    await next();
    await page.eval(fill('rsvp', 'dffhdsjjfdjfdsg'));
    assert.equal(await page.eval(`document.querySelector('#orderForm [name=rsvp]').value`), '', 'letters are not accepted');
    await page.eval(fill('rsvp', '329847923759743'));
    assert.equal(await page.eval(`document.querySelector('#orderForm [name=rsvp]').value`), '3298479237', 'at most 10 digits');
    assert.match(await page.eval(`document.querySelector('#orderForm .mobile-hint').textContent`), /start with 6, 7, 8 or 9/);
    await page.eval(fill('rsvp', '98765 4321'));
    assert.equal(await page.eval(`document.querySelector('#orderForm .mobile-hint').textContent`), '9/10 digits');
    await next();
    assert.match(await errorText(), /10-digit mobile/, 'RSVP number must have 10 digits');
    await page.eval(fill('rsvp', '98765 43210'));
    await page.eval(fill('guests', 'Rahul Uncle\nPriya Di'));
    await next();
    assert.match(await page.eval(`document.querySelector('#osReview').textContent`), /Names: Diya & Aarav[\s\S]*Nicknames: Diyu[\s\S]*Venue: Grand Ballroom[\s\S]*RSVP number: 919876543210[\s\S]*Guests \(2\)/);
    assert.equal(await page.eval(`document.querySelector('#osSend').hidden`), false);
    const href = await page.eval(`document.querySelector('#osSend').href`);
    assert.match(href, /^https:\/\/wa\.me\/919999999999\?text=/);
    const r = Catalog.readOrder(decodeURIComponent(new URL(href).search.slice(6)));
    assert.equal(r.card.theme, 10);
    assert.equal(r.card.type, 'sangeet');
    assert.equal(r.card.host2, 'Aarav');
    assert.equal(r.card.events.length, 1);
    assert.deepEqual([...r.guests], ['Rahul Uncle', 'Priya Di']);
    assert.equal(r.card.nick1, 'Diyu');
    page.lastOrder = decodeURIComponent(new URL(href).search.slice(6));
    // Sending shows the celebration screen
    await page.eval(`(() => { const a = document.querySelector('#osSend'); a.addEventListener('click', e => e.preventDefault(), { once: true }); a.click(); })()`);
    assert.equal(await page.eval(`document.querySelector('#osDone').hidden`), false);
    assert.ok(await page.eval(`document.querySelectorAll('.os-confetti i').length`) > 20, 'confetti');
    assert.equal(await page.eval(`document.querySelector('.os-foot').hidden`), true);
    assert.equal(await page.eval(`document.querySelector('#osDots').hidden && document.querySelector('#osStepNo').hidden`), true, 'no progress bar on the thank-you screen');
    await page.eval(`document.querySelector('#osDoneClose').click()`);
    assert.equal(await page.eval(`document.querySelector('#orderSheet').hidden`), true);
    noErrors();
  });

  test('order form: a tap on the space around it keeps it open; only the ✕ closes it', async () => {
    await page.eval(`document.querySelector('[data-order]').click()`);
    await page.eval(`document.querySelector('#orderSheet').click()`);
    assert.equal(await page.eval(`document.querySelector('#orderSheet').hidden`), false, 'still open after a tap outside');
    await page.eval(`document.querySelector('#osClose').click()`);
    assert.equal(await page.eval(`document.querySelector('#orderSheet').hidden`), true, 'the ✕ closes it');
  });

  test('order form: without a business WhatsApp number it says ordering is not set up', async () => {
    await page.eval(`SITE.whatsapp = ''`);
    await page.eval(`document.querySelector('[data-order]').click()`);
    assert.equal(await page.eval(`document.querySelector('#orderForm [name=design]').value`), '', 'general Order: no design yet');
    await next();
    await page.eval(fill('host1', 'Neha'));
    await page.eval(fill('host2', 'Arjun'));
    await page.eval(fill('date', future(30)));
    await page.eval(fill('venue', 'Pune'));
    for (let i = 0; i < 3; i++) await next();
    assert.equal(await page.eval(`document.querySelector('#osSend').hidden`), true);
    assert.equal(await page.eval(`document.querySelector('#osNoWa').hidden`), false);
    await page.eval(`document.querySelector('#osClose').click()`);
  });

  test('a demo card\'s Order bar opens the order form for that design', async () => {
    await page.goto(base + 'index.html?order=47');
    assert.equal(await page.eval(`document.querySelector('#orderSheet').hidden`), false);
    assert.equal(await page.eval(`document.querySelector('#orderForm [name=design]').value`), '47');
    assert.equal(await page.eval(`location.search`), '', 'the address no longer says ?order=47');
    await page.eval(`location.reload()`);
    await page.waitFor(`document.readyState === 'complete' && !!document.querySelector('#showcase .tpl')`, 8000);
    assert.equal(await page.eval(`document.querySelector('#orderSheet').hidden`), true, 'refreshing does not reopen the order form');
  });

  // ---------- Card ----------
  test('demo card: envelope opens and every section renders', async () => {
    await page.viewport(420, 860);
    await page.goto(base + 'card.html');
    assert.equal(await page.eval(`document.querySelector('.env-seal').textContent`), 'D&A');
    assert.equal(await page.eval(`document.body.classList.contains('locked')`), true, 'page scroll locked before opening');
    await openEnvelope();
    assert.equal(await page.eval(`document.body.classList.contains('locked')`), false);
    assert.equal(await page.eval(`document.querySelector('.names').textContent.replace(/\\s+/g, '')`), 'DiyawedsAarav', 'a wedding joins the names with "weds"');
    assert.equal(await page.eval(`document.querySelectorAll('.event').length`), 5);
    assert.equal(await page.eval(`document.querySelectorAll('.cd-cell').length`), 4);
    assert.match(await page.eval(`document.querySelector('#calBtn').href`), /calendar\.google\.com.*dates=20261212T193000%2F20261212T233000/);
    assert.match(await page.eval(`document.querySelector('.venue a').href`), /^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=The%20Leela/);
    assert.equal(await page.eval(`document.title`), "Diya & Aarav 💌 You're invited");
    assert.match(await page.eval(`document.querySelector('.date-badge b').textContent`), /^7:30\s?pm$/i, '12-hour time');
    assert.match(await page.eval(`document.querySelector('footer a').getAttribute('href')`), /^index\.html$/, 'footer sells the service');
    assert.equal(await page.eval(`document.querySelector('footer a.signature').href`), await page.eval(`SITE.url || new URL('index.html', location.href).href`), 'the signature opens the website');
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

  test('on a sample card, the card\'s buttons open the order form for that design', async () => {
    await page.goto(cardLink({ ...PRESETS.kitty.card, theme: 9 }, '?demo&auto'));
    await page.waitFor(`document.body.classList.contains('opened')`, 5000);
    assert.equal(await page.eval(`document.querySelector('.actions .btn').textContent`), '💬 Order design #009', 'Order leads the row');
    assert.equal(await page.eval(`document.querySelector('.actions .order-this').getAttribute('href')`), 'index.html?order=9');
    // Share shares the design (its occasion, number, live demo and the website)
    await page.eval(`(() => { window.__shared = null; navigator.share = d => { window.__shared = d; return Promise.resolve(); }; document.querySelector('#shareBtn').click(); })()`);
    await page.waitFor(`!!window.__shared`, 3000);
    const shared = await page.eval(`window.__shared.text`);
    assert.match(shared, /Kitty Party invitation · Design #009/);
    assert.match(shared, /See it live:\nhttps:\/\/\S+\/d\?n=9\n/, 'a short link to the sample');
    assert.ok(shared.length < 260, 'the whole message stays short');
    assert.match(shared, /Get yours made on /);
    assert.equal(await page.eval(`location.search`), '?demo&auto', 'sharing stays on the card');
    // The short link opens that design's sample
    await page.goto(base + 'card.html?n=9&auto');
    await page.waitFor(`document.body.classList.contains('opened')`, 5000);
    assert.ok(await page.eval(`document.body.classList.contains('theme-9') && !!document.querySelector('#demoBar')`), '?n=9 is the sample of #009');
    await page.goto(cardLink({ ...PRESETS.kitty.card, theme: 9 }, '?demo&auto'));
    await page.waitFor(`document.body.classList.contains('opened')`, 5000);
    // The other buttons lead to ordering this design
    await page.eval(`document.querySelector('#calBtn').click()`);
    await page.waitFor(`location.pathname.endsWith('index.html') && location.search === '?order=9'`, 5000);
    await page.waitFor(`!document.querySelector('#orderSheet').hidden`, 3000);
    assert.equal(await page.eval(`document.querySelector('#orderForm [name=design]').value`), '9');
  });

  test('"Order design" on a sample opens the order form with that design chosen and shown first', async () => {
    const t = Templates.get(283);
    await page.goto(cardLink({ ...PRESETS[t.occasion].card, theme: 283 }, '?demo&auto'));
    await page.waitFor(`document.body.classList.contains('opened')`, 5000);
    await page.eval(`document.querySelector('.actions .order-this').click()`);
    await page.waitFor(`location.pathname.endsWith('index.html') && document.querySelector('#orderSheet') && !document.querySelector('#orderSheet').hidden`, 8000);
    assert.equal(await page.eval(`document.querySelector('#orderForm [name=design]').value`), '283');
    assert.equal(await page.eval(`document.querySelector('#osOcc .chip.on').dataset.type`), t.occasion);
    assert.equal(await page.eval(`document.querySelector('#osPicks [data-pick]').dataset.pick`), '283', 'the chosen design is first in the row');
    assert.ok(await page.eval(`document.querySelector('#osPicks [data-pick="283"]').classList.contains('on')`), 'and highlighted');
    assert.match(await page.eval(`document.querySelector('#osDesign').textContent`), /#283/);
  });

  test('a sample has a way back to all the designs; a real invitation does not', async () => {
    await page.goto(cardLink({ ...PRESETS.wedding.card, theme: 1 }, '?demo&auto'));
    await page.waitFor(`document.body.classList.contains('opened')`, 5000);
    assert.equal(await page.eval(`document.querySelector('.pbar .home-link')?.getAttribute('href')`), 'index.html');
    await page.goto(cardLink({ ...PRESETS.wedding.card, theme: 1 }, '?auto'));
    await page.waitFor(`document.body.classList.contains('opened')`, 5000);
    assert.equal(await page.eval(`!!document.querySelector('.home-link')`), false, 'guests never see it');
  });

  test('on a real invitation the buttons work normally (no order button)', async () => {
    await page.goto(cardLink(PRESETS.kitty.card, '?auto'));
    await page.waitFor(`document.body.classList.contains('opened')`, 5000);
    assert.equal(await page.eval(`!!document.querySelector('.order-this')`), false);
    assert.match(await page.eval(`document.querySelector('#calBtn').href`), /calendar\.google\.com/);
  });

  test('old links that name a design ("royal", "neon") still open the same design', async () => {
    await page.goto(cardLink({ ...PRESETS.wedding.card, theme: 'neon' }, '?auto'));
    assert.ok(await page.eval(`document.body.classList.contains('theme-6') && document.body.classList.contains('flavor-neon')`));
    await page.goto(cardLink({ ...PRESETS.wedding.card, theme: 'unknown-design' }, '?auto'));
    assert.ok(await page.eval(`document.body.classList.contains('theme-1')`), 'unknown design falls back to #001');
  });

  test('every opening style opens with a tap and greets the guest', async () => {
    for (const kind of Object.keys(INTROS)) {
      await page.goto(cardLink({ ...PRESETS.wedding.card, intro: kind }, '?to=Rahul'), 300);
      assert.ok(await page.eval(`document.querySelector('#envelope').classList.contains('intro-${kind}')`), kind);
      assert.equal(await page.eval(`document.querySelector('.env-to').textContent`), 'Dear Rahul,');
      assert.match(await page.eval(`document.querySelector('.intro-tap').textContent`), /D&A/, `${kind} shows the initials`);
      await openEnvelope();
      assert.deepEqual(page.errors, [], kind);
    }
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
    // Just the button: no name, guests and meal form unless it is switched on for the card
    assert.equal(await page.eval(`document.querySelectorAll('#rsvpForm input, #rsvpForm select').length`), 0, 'no RSVP form by default');
    await page.goto(cardLink({ ...PRESETS.kitty.card, rsvp: '9876543210', rsvpForm: true }, '?auto'));
    assert.ok(await page.eval(`!!document.querySelector('#rsvpForm [name=meal]')`), 'the form when switched on');
  });

  test('RSVP button is hidden when the number has no digits', async () => {
    await page.goto(cardLink({ ...PRESETS.kitty.card, rsvp: 'call me' }, '?auto'));
    assert.equal(await page.eval(`!!document.querySelector('#rsvpBtn')`), false);
  });

  test('scrolling down shows every section, for every scroll effect and every style', async () => {
    const picks = new Map();
    for (const t of Templates.all) { if (!picks.has('rv-' + t.reveal)) picks.set('rv-' + t.reveal, t); if (!picks.has('st-' + t.style)) picks.set('st-' + t.style, t); }
    await page.viewport(1280, 800);
    for (const [why, t] of picks) {
      await page.goto(cardLink({ ...PRESETS[t.occasion].card, theme: t.no, story: [{ when: '2020', title: 'Met' }], families: [{ side: 'Hers', parents: 'Mr & Mrs Rao' }] }));
      await openEnvelope();
      const end = await page.eval('document.documentElement.scrollHeight');
      for (let y = 0; y < end + 800; y += 480) { await page.eval(`scrollTo(0, ${y})`); await sleep(60); }
      await sleep(400);
      assert.deepEqual(await page.eval(`[...document.querySelectorAll('.reveal:not(.in)')].map(e => e.className)`), [], `#${t.no} (${why}): a section stayed hidden after scrolling`);
    }
    await page.viewport(420, 860);
  });

  test('View invitation and the menu scroll down the card and keep the invitation link', async () => {
    await page.goto(cardLink({ ...PRESETS.wedding.card }));
    await openEnvelope();
    const before = await page.eval(`location.hash`);
    await page.eval(`document.querySelector('.view-btn').click()`);
    await sleep(900);
    assert.equal(await page.eval(`location.hash`), before, 'the link still holds the invitation');
    assert.ok(await page.eval(`scrollY > 200`), 'scrolled down to the details');
    assert.doesNotMatch(await page.eval(`document.querySelector('#card').textContent`), /link is incomplete/);
    await page.eval(`document.querySelector('#menuBtn').click()`);
    await page.eval(`document.querySelector('#pmenu a[href="#venue"]').click()`);
    await sleep(900);
    assert.equal(await page.eval(`location.hash`), before);
    assert.doesNotMatch(await page.eval(`document.querySelector('#card').textContent`), /link is incomplete/);
  });

  test('the music button shows only when the invite has music on', async () => {
    for (const music of [true, false]) {
      await page.goto(cardLink({ ...PRESETS.wedding.card, music }));
      await openEnvelope();
      assert.equal(await page.eval(`document.querySelector('#musicBtn').hidden`), !music, `music ${music ? 'on' : 'off'}`);
    }
  });

  test('music stays silent after opening and plays only when the guest taps the button', async () => {
    await page.goto(cardLink({ ...PRESETS.wedding.card, music: true }));
    await openEnvelope();
    await sleep(500);
    assert.equal(await page.eval(`document.querySelector('#musicBtn').classList.contains('playing')`), false, 'no sound on opening');
    await page.eval(`document.querySelector('#musicBtn').click()`);
    assert.equal(await page.eval(`document.querySelector('#musicBtn').classList.contains('playing')`), true, 'a tap plays it');
    await page.eval(`document.querySelector('#musicBtn').click()`);
    assert.equal(await page.eval(`document.querySelector('#musicBtn').classList.contains('playing')`), false, 'a second tap stops it');
  });

  test('all 600 designs render without errors, with their decor and particles', async () => {
    // Its own browser, fresh every 75 designs: one tab loading 300 animated pages in a row wore Chrome out and
    // it stopped answering (around the 150th), although every design opens fine on its own.
    const main = page;
    try {
      for (const [i, t] of Templates.all.entries()) {
        if (i % 75 === 0) { if (page !== main) await page.close(); page = await launch(); await page.viewport(420, 860); }
        await checkDesign(t);
      }
    } finally {
      if (page !== main) await page.close();
      page = main;
    }
  });
  async function checkDesign(t) {
    {
      await page.goto(cardLink({ ...PRESETS[t.occasion].card, theme: t.no }, '?preview&auto'), 0);
      await page.waitFor(`document.body.classList.contains('theme-${t.no}') && document.body.classList.contains('opened')`, 5000);
      assert.ok(await page.eval(`!!document.querySelector('#envelope.intro-${t.intro} .intro-tap')`), `#${t.no} opening ${t.intro}`);
      const decor = { mandala: '.mandala', blobs: '.blob', frame: '.frame', florals: '.florals', sunburst: '.sunburst', deco: '.deco', lights: '.lights', stars: '.stars', lace: '.lace' }[t.decor];
      assert.ok(await page.eval(`!!document.querySelector('.hero.layout-${t.layout}')`), `#${t.no} layout ${t.layout}`);
      assert.ok(await page.eval(`!!document.querySelector('${decor}')`), `#${t.no} decor ${t.decor}`);
      assert.ok(await page.eval(`!!document.querySelector('#scene.scene-${t.scene}') && ['fx-${t.nameFx}', 'pf-${t.frame}', 'rv-${t.reveal}', 'ev-${t.events}', 'cdn-${t.countdown}', 'tt-${t.titles}'].every(c => document.body.classList.contains(c))`), `#${t.no} animated look`);
      assert.match(await page.eval(`document.querySelector('footer .signature').textContent`), /Sankalp/, `#${t.no} signed`);
      // Once the entrance animation has played, every letter of the names is visible (typing takes a few seconds).
      await page.waitFor(`[...document.querySelectorAll('.names .ch')].every(c => +getComputedStyle(c).opacity > .9)`, 8000)
        .catch(() => assert.fail(`#${t.no} names not visible after the ${t.nameFx} entrance`));
      assert.deepEqual(page.errors, [], `errors in design #${t.no}`);
    }
  }

  test('malicious content is shown as text and dangerous links are blocked', async () => {
    const evil = {
      host1: '<img src=x onerror="window.__xss=1">', host2: '"><script>window.__xss=2</script>',
      title: '<b>bold</b>', venue: 'Hall', mapUrl: 'javascript:window.__xss=3', photo: 'javascript:window.__xss=4',
      rsvp: '123', theme: '<img src=x onerror="window.__xss=7">', intro: '<img src=x onerror="window.__xss=8">', events: [{ name: '<svg onload="window.__xss=5">', venue: '<i>x</i>' }]
    };
    await page.goto(cardLink(evil, '?demo&to=' + encodeURIComponent('<img src=x onerror="window.__xss=6">')));
    await openEnvelope();
    assert.equal(await page.eval(`window.__xss`), undefined, 'no injected script ran');
    assert.equal(await page.eval(`document.querySelectorAll('#card img:not(.hero-couple):not(.hero-ganesha), #card script, #card svg [onload], #envelope img, #demoBar img').length`), 0);
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
  test('admin: lists 20 occasions and the first 40 designs', async () => {
    await page.viewport(1300, 900);
    await page.goto(base + 'admin.html');
    assert.equal(await page.eval(`document.querySelectorAll('.occasion').length`), 20);
    assert.equal(await page.eval(`document.querySelectorAll('#gallery .tpl').length`), 40);
    assert.equal(await page.eval(`document.querySelector('#gallery .tpl.on').dataset.no`), '1');
    assert.equal(await page.eval(`document.querySelector('#designNo').value`), '001');
    assert.equal(await page.eval(`[...document.querySelectorAll('iframe')].filter(f => f.src.includes('card.html')).length`), 1, 'only the big preview is a live card (the video maker stays empty until used)');
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
    await page.waitFor(`/from 1 to 600/.test(document.querySelector('#designMsg').textContent)`, 3000);
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

  test('admin: an invite can pick its own opening animation', async () => {
    assert.match(await page.eval(`document.querySelector('#introSelect option').textContent`), /Design's own: 🎭 Curtain raise/);
    await page.eval(`(() => { const s = document.querySelector('#introSelect'); s.value = 'giftbox'; s.dispatchEvent(new Event('input', { bubbles: true })); })()`);
    await sleep(700);
    assert.equal(Codec.decode(await page.eval(`new URL(document.querySelector('#preview').src).hash.slice(1)`)).intro, 'giftbox');
    await page.eval(`(() => { const s = document.querySelector('#introSelect'); s.value = ''; s.dispatchEvent(new Event('input', { bubbles: true })); })()`);
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

  test('admin: refuses a past date, and an RSVP number that is not 10 digits', async () => {
    assert.ok(await page.eval(`document.querySelector('[name=date]').min`) >= future(-0.01), 'the date picker starts today');
    await page.eval(type('[name=date]', '2020-01-01T10:00'));
    await page.eval(`document.querySelector('#generate-btn').click()`);
    assert.match(await page.eval(`document.querySelector('#toast').textContent`), /already passed/);
    await page.eval(type('[name=date]', future(40)));
    await page.eval(type('[name=rsvp]', '12345'));
    await page.eval(`document.querySelector('#generate-btn').click()`);
    assert.match(await page.eval(`document.querySelector('#toast').textContent`), /10-digit/);
    assert.equal(await page.eval(`document.querySelectorAll('#results .result').length`), 0);
    await page.eval(type('[name=rsvp]', ''));
    await page.eval(type('[name=nick1]', 'Kabu'));
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
    await page.eval(`document.querySelector('#results [data-copy]').click()`);
    await page.waitFor(`document.querySelector('#results [data-copy]').textContent === '✓ Copied'`, 3000);
    const wa = await page.eval(`decodeURIComponent(document.querySelector('#results .wa').href)`);
    assert.match(wa, /Dear Rahul Uncle/);
    assert.match(wa, /You are invited to the birthday party of\n\*Kabir\*/, 'the kids-birthday message');
    assert.match(wa, /Venue: FunCity Play Zone, Noida/);
    // "Copy message" copies the same invitation text.
    assert.ok(await page.eval(`[...document.querySelectorAll('#results [data-copy]')].some(b => b.textContent === 'Copy message' && b.dataset.copy.includes('*Kabir*'))`));
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

  test('admin catalog: lists all 600, 50 at a time, and filters them', async () => {
    assert.equal(await page.eval(`document.querySelectorAll('#catTable tbody tr').length`), 50, 'the first 50');
    assert.match(await page.eval(`document.querySelector('#catCount').textContent`), /^600 designs/);
    for (let i = 0; i < 11; i++) await page.eval(`document.querySelector('#catMore').click()`);
    assert.equal(await page.eval(`document.querySelectorAll('#catTable tbody tr').length`), 600, 'Show more adds the rest');
    assert.equal(await page.eval(`document.querySelector('#catMore').hidden`), true);
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
    assert.equal(await page.eval(`document.querySelector('#siteForm [name=whatsapp]').value`), '9876543210', 'shown as 10 digits');
    assert.equal(await page.eval(`document.querySelector('#urlWarn').hidden`), true);
    await page.eval(type('#siteForm [name=whatsapp]', '98765'));
    assert.match(await page.eval(`document.querySelector('#toast').textContent`), /10-digit/);
    assert.equal(await page.eval(`JSON.parse(localStorage.getItem('weddingcard.config')).site.whatsapp`), '919876543210', 'a wrong number is never saved');
    await page.eval(type('#siteForm [name=whatsapp]', '919876543210'));
    await page.eval(type('[name=date]', future(40)));
    await page.eval(type('#guests', ''));
    await page.eval(`document.querySelector('#generate-btn').click()`);
    assert.match(await page.eval(`document.querySelector('#results input').value`), /^https:\/\/my-cards\.vercel\.app\/card\.html#/, 'links use the live address');
    await page.eval(`document.querySelector('#clearAll').click()`);
  });

  test('admin: opened as a file, it explains how to turn on auto-save', async () => {
    assert.match(await page.eval(`document.querySelector('#publishHelp').textContent`), /Start Admin.cmd/);
  });

  test('admin: Undo changes restores the published catalog', async () => {
    await page.eval(`document.querySelector('#discardBtn').click()`);
    assert.equal(await page.eval(`document.querySelector('#publishBar').hidden`), true);
    assert.equal(await page.eval(`localStorage.getItem('weddingcard.config')`), null);
    assert.equal(await page.eval(`document.querySelector('#siteForm [name=url]').value`), loadApp().SITE.url, 'back to the published address');
    noErrors();
  });

  test('admin: pasting a WhatsApp order fills in the whole invite', async () => {
    assert.ok(page.lastOrder, 'order message from the order form test');
    await page.eval(`document.querySelector('#orderPaste').value = ${JSON.stringify('Hi!\n' + (page.lastOrder || ''))}`);
    await page.eval(`document.querySelector('#orderFill').click()`);
    assert.match(await page.eval(`document.querySelector('#orderMsg').textContent`), /Filled: Diya & Aarav · Sangeet Night · design #010 · 2 guest links/);
    assert.match(await page.eval(`document.querySelector('#orderMsg').textContent`), /^📥 Saved in the orders list below/);
    assert.ok(await page.eval(`document.querySelector('#ordersList .order-item.on.flash')`), 'the new order is lit up in the list');
    assert.equal(await page.eval(`document.querySelector('#designNo').value`), '010');
    assert.equal(await page.eval(`document.querySelector('.occasion.on').dataset.type`), 'sangeet');
    assert.equal(await page.eval(`document.querySelector('[name=host1]').value`), 'Diya');
    assert.equal(await page.eval(`document.querySelector('[name=venue]').value`), 'Grand Ballroom, Udaipur');
    assert.equal(await page.eval(`document.querySelector('[name=rsvp]').value`), '9876543210', 'shown as 10 digits');
    assert.equal(await page.eval(`document.querySelectorAll('.event-row').length`), 1);
    assert.equal(await page.eval(`document.querySelector('#guests').value`), 'Rahul Uncle\nPriya Di');
    await page.eval(`document.querySelector('#orderPaste').value = 'Hi, design #33 please'`);
    await page.eval(`document.querySelector('#orderFill').click()`);
    assert.match(await page.eval(`document.querySelector('#orderMsg').textContent`), /Design #033 selected/);
    await page.eval(`document.querySelector('#orderPaste').value = 'hello'`);
    await page.eval(`document.querySelector('#orderFill').click()`);
    assert.match(await page.eval(`document.querySelector('#orderMsg').textContent`), /No order found/);
    noErrors();
  });

  test('admin: pasted orders are kept in a list; tapping the name fills everything again', async () => {
    assert.equal(await page.eval(`document.querySelectorAll('#ordersList .order-item').length`), 1, 'the pasted order was saved once');
    assert.match(await page.eval(`document.querySelector('#ordersList .order-open').textContent`), /Diya & Aarav[\s\S]*Sangeet Night · #010/);
    assert.equal(await page.eval(`document.querySelector('#ordersCount').textContent`), '1');
    // Pasting the same order again does not duplicate it
    await page.eval(`document.querySelector('#orderPaste').value = ${JSON.stringify(page.lastOrder || '')}`);
    await page.eval(`document.querySelector('#orderFill').click()`);
    assert.equal(await page.eval(`document.querySelectorAll('#ordersList .order-item').length`), 1);
    assert.match(await page.eval(`document.querySelector('#orderMsg').textContent`), /^📥 Already in the orders list below/);
    // Start from an empty editor, then tap the customer's name
    await page.eval(`document.querySelector('#clearBtn').click()`);
    assert.equal(await page.eval(`document.querySelector('[name=host1]').value`), '');
    await page.eval(`document.querySelector('#ordersList .order-open').click()`);
    assert.equal(await page.eval(`document.querySelector('[name=host1]').value`), 'Diya');
    assert.equal(await page.eval(`document.querySelector('[name=mapUrl]').value`), 'https://maps.app.goo.gl/abc123', 'optional location filled');
    assert.equal(await page.eval(`document.querySelector('#designNo').value`), '010');
    // Survives a reload; done and delete
    await page.goto(base + 'admin.html');
    assert.equal(await page.eval(`document.querySelectorAll('#ordersList .order-item').length`), 1);
    await page.eval(`document.querySelector('#ordersList [data-done]').click()`);
    assert.ok(await page.eval(`document.querySelector('#ordersList .order-item').classList.contains('done')`));
    assert.equal(await page.eval(`document.querySelector('#ordersCount').hidden`), true, 'no open orders');
    await page.eval(`document.querySelector('#ordersList [data-forget]').click()`);
    assert.equal(await page.eval(`document.querySelectorAll('#ordersList .order-item').length`), 0);
    noErrors();
  });

  test('admin: a WhatsApp message without its order code still fills everything and becomes a new order', async () => {
    const msg = ['*NEW INVITATION ORDER*', '* Design: *#083*', '* Occasion: Wedding', '* Names: Sudhanshu & Yadu', '* Date: Wed, 2 Dec, 2026, 11:00 pm',
      '* Venue: Ashirwad banquet', '* Functions: Haldi (Mon, 30 Nov, 2026, 1:00 pm) at Home, wear Yellow; Mehendi (Mon, 30 Nov, 2026, 6:00 pm) at Home, wear Green; Sangeet (Tue, 1 dec, 2026, 9:00 pm) at Home; Pheras (Wed, 2 Dec, 2026, 11:00 pm) at Ashirwad banquet',
      '* Message: You invited for the full family coming', '* RSVP number: 917530950486'].join('\n');
    await page.eval(`document.querySelector('#clearBtn').click()`);
    await page.eval(`document.querySelector('#orderPaste').value = ${JSON.stringify(msg)}`);
    await page.eval(`document.querySelector('#orderFill').click()`);
    assert.match(await page.eval(`document.querySelector('#orderMsg').textContent`), /Filled: Sudhanshu & Yadu · Wedding · design #083[\s\S]*no order code/);
    assert.equal(await page.eval(`document.querySelector('[name=host2]').value`), 'Yadu');
    assert.equal(await page.eval(`document.querySelector('[name=venue]').value`), 'Ashirwad banquet');
    assert.equal(await page.eval(`document.querySelector('[name=rsvp]').value`), '7530950486');
    assert.equal(await page.eval(`document.querySelector('[name=message]').value`), 'You invited for the full family coming');
    assert.deepEqual(await page.eval(`[...document.querySelectorAll('.event-row')].map(r => r.querySelector('[data-k=name]').value + ' ' + r.querySelector('[data-k=date]').value + ' ' + r.querySelector('[data-k=venue]').value)`),
      ['Haldi 2026-11-30T13:00 Home', 'Mehendi 2026-11-30T18:00 Home', 'Sangeet 2026-12-01T21:00 Home', 'Pheras 2026-12-02T23:00 Ashirwad banquet']);
    // A new order in the list above, which fills everything again and goes to the Video Studio's order picker
    assert.equal(await page.eval(`document.querySelectorAll('#ordersList .order-item').length`), 1);
    assert.match(await page.eval(`document.querySelector('#ordersList .order-open').textContent`), /Sudhanshu & Yadu[\s\S]*Wedding · #083/);
    await page.eval(`document.querySelector('#clearBtn').click()`);
    await page.eval(`document.querySelector('#ordersList .order-open').click()`);
    assert.equal(await page.eval(`document.querySelector('[name=host1]').value`), 'Sudhanshu');
    assert.equal(await page.eval(`document.querySelectorAll('.event-row').length`), 4);
    await page.eval(`window.confirm = () => true; document.querySelector('#ordersList [data-forget]').click()`);
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

    test('serves the panel with auto-save on', async () => {
      await page.viewport(1300, 900);
      await page.goto(origin + '/admin.html?offline'); // offline mode: this test is about the PC server, not the login
      await page.waitFor(`/Auto-save is on/.test(document.querySelector('#publishHelp').textContent)`, 4000);
      noErrors();
    });

    test('admin video: films the card and downloads an MP4 of about half a minute (it rests on every date and venue)', async () => {
      const fs = await import('node:fs'), os = await import('node:os');
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wc-video-'));
      await page.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: dir });
      await page.goto(origin + '/admin.html?offline', 1000);
      // A real mouse click: browsers only allow screen capture from a user gesture.
      const r = await page.eval(`(() => { const b = document.querySelector('#videoBtn'); b.scrollIntoView({ block: 'center', behavior: 'instant' }); const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`);
      for (const type of ['mousePressed', 'mouseReleased']) await page.send('Input.dispatchMouseEvent', { type, x: r.x, y: r.y, button: 'left', clickCount: 1 });
      await page.waitFor(`/Saved|Could not|cancelled/.test(document.querySelector('#recStatus').textContent)`, 60000);
      assert.match(await page.eval(`document.querySelector('#recStatus').textContent`), /Saved "Diya & Aarav invitation\.mp4"/);
      const dur = await page.eval(`new Promise(r => { const v = document.querySelector('#recVideo'); v.readyState ? r(v.duration) : v.onloadedmetadata = () => r(v.duration); })`);
      assert.ok(dur > 15 && dur < 50, `video is ${dur}s`);
      for (let i = 0; i < 20 && !fs.readdirSync(dir).some(f => f.endsWith('.mp4')); i++) await sleep(250);
      const file = fs.readdirSync(dir).find(f => f.endsWith('.mp4'));
      assert.ok(file && fs.statSync(path.join(dir, file)).size > 100000, 'MP4 saved to Downloads');
      const head = fs.readFileSync(path.join(dir, file)).subarray(0, 64).toString('latin1');
      assert.ok(!fs.readFileSync(path.join(dir, file)).toString('latin1').includes('moof'), 'a standard MP4, not the fragmented kind WhatsApp rejects');
      assert.ok(head.indexOf('moov') > 0 && head.indexOf('moov') < 64, 'fast start: the index comes first');
      await page.eval(`document.querySelector('#recClose').click()`);
      assert.equal(await page.eval(`document.querySelector('#recModal').hidden`), true);
      noErrors();
      fs.rmSync(dir, { recursive: true, force: true });
    });

    test('Video Studio: its own screen, 300 looks, the story as scenes, and an MP4 made by itself from a customer order', async () => {
      const fs = await import('node:fs'), os = await import('node:os');
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wc-studio-'));
      await page.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: dir });
      await page.viewport(1300, 900);
      await page.goto(origin + '/admin.html?offline', 1000);
      await page.eval(`document.querySelector('#studioBtn').click()`);
      await page.waitFor(`!document.querySelector('#studio').hidden && document.querySelectorAll('#stScenes [data-scene]').length > 0`, 8000);
      assert.equal(await page.eval(`document.querySelectorAll('#stLooks [data-look]').length`), 20, 'twenty scenes');
      assert.deepEqual(await page.eval(`[...document.querySelectorAll('#stMoods .chip')].map(b => b.textContent)`), ['Morning', 'Golden Hour', 'Moonlit', 'Rose Blush', 'Mint Fresh', 'Lavender Dream', 'Vintage Sepia', 'Royal Night', 'Emerald', 'Sunset Coral', 'Ivory Gold', 'Midnight Blue', 'Peacock Teal', 'Monsoon', 'Saffron Glow'], 'fifteen moods each');
      assert.equal(await page.eval(`document.querySelector('#stOrderRow').hidden`), true, 'no orders yet: no order picker');
      assert.match(await page.eval(`document.querySelector('#stWho').textContent`), /Diya & Aarav · Wedding/);
      // The preview is painted (many colours, not a blank canvas) and plays
      const colours = `(() => { const c = document.querySelector('#stCanvas'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, s = new Set(); for (let i = 0; i < d.length; i += 4 * 997) s.add(d[i] >> 4 << 8 | d[i + 1] >> 4 << 4 | d[i + 2] >> 4); return s.size; })()`;
      await page.eval(`document.querySelector('#stScenes [data-scene="1"]').click()`);
      // Painted once its sceneries are ready (waited for: a busy machine takes longer)
      await page.waitFor(`${colours} > 40`, 8000).catch(() => assert.fail('the scene is painted'));
      const t1 = await page.eval(`document.querySelector('#stTime').textContent`);
      await page.waitFor(`document.querySelector('#stTime').textContent !== ${JSON.stringify(t1)}`, 4000).catch(() => {});
      assert.notEqual(await page.eval(`document.querySelector('#stTime').textContent`), t1, 'the preview plays');
      // Scenes follow the options
      // Whose name comes first, and what each function's screen shows (with quotes for it)
      assert.deepEqual(await page.eval(`[...document.querySelectorAll('#stNameOrder .chip')].map(b => b.textContent)`), ['Diya first', 'Aarav first']);
      await page.eval(`document.querySelector('#stNameOrder [data-swap="true"]').click()`);
      assert.equal(await page.eval(`document.querySelector('#stNameOrder .on').textContent`), 'Aarav first');
      await page.eval(`document.querySelector('#stNameOrder [data-swap="false"]').click()`);
      assert.equal(await page.eval(`document.querySelectorAll('#stScreens details').length`), 5, 'one block per function');
      assert.ok(await page.eval(`document.querySelectorAll('#stScreens details[data-i="0"] [data-quote]').length`) >= 3, 'suggested quotes');
      await page.eval(`document.querySelector('#stScreens details[data-i="0"] [data-quote]').click()`);
      assert.match(await page.eval(`document.querySelector('#stScreens textarea[data-i="0"]').value`), /turmeric/i, 'a tap puts the quote in');
      // Every function on its own screen by default; all on one page when chosen
      assert.deepEqual(await page.eval(`[...document.querySelectorAll('#stScenes .chip')].map(b => b.textContent)`), ['Opening', 'Title', 'Invitation', 'Haldi', 'Mehendi', 'Sangeet', 'Pheras', 'Reception', 'Venue', 'Regards', 'Thank You']);
      await page.eval(`document.querySelector('[data-ev="list"]').click()`);
      assert.deepEqual(await page.eval(`[...document.querySelectorAll('#stScenes .chip')].map(b => b.textContent)`), ['Opening', 'Title', 'Invitation', 'Functions', 'Venue', 'Regards', 'Thank You']);
      await page.eval(`document.querySelector('[data-ev="each"]').click()`);
      await page.eval(`document.querySelector('#stScenes [data-scene="4"]').click()`);
      // Lit by the next painted frame (waited for, not guessed: a busy machine paints later)
      await page.waitFor(`(document.querySelector('#stScenes .chip.on') || {}).textContent === 'Mehendi'`, 5000)
        .catch(() => assert.fail('a scene button jumps there'));
      await page.eval(`document.querySelector('#stLooks [data-look="lotusnight"]').click()`);
      assert.equal(await page.eval(`document.querySelector('#stLooks .on').dataset.look`), 'lotusnight');
      await page.eval(`document.querySelector('#stMoods [data-look="lotusnight-dawn"]').click()`);
      assert.equal(await page.eval(`document.querySelector('#stMoods .on').textContent`), 'Dawn');
      // Story films and the language
      assert.equal(await page.eval(`document.querySelectorAll('#stStories [data-story]').length`), 13, 'thirteen story films');
      await page.eval(`document.querySelector('#stStories [data-story="story-rajwada"]').click()`);
      assert.equal(await page.eval(`document.querySelector('#stStories .on').dataset.story`), 'story-rajwada');
      assert.equal(await page.eval(`document.querySelectorAll('#stMoods .chip').length`), 0, 'a story film has no moods to pick');
      await page.eval(`document.querySelector('#stLang [data-lang="hi"]').click()`);
      assert.equal(await page.eval(`document.querySelector('#stLang .on').dataset.lang`), 'hi');
      assert.ok(await page.eval(`document.querySelectorAll('#stMusic [data-music]').length`) >= 14, 'twelve tunes plus the automatic choice and the music box');
      assert.equal(await page.eval(`document.querySelector('#stMusic [data-music="none"]')`), null, 'every video has music');
      assert.match(await page.eval(`document.querySelector('#stSongNow').textContent`), /This video’s music: /, 'it says which music the video gets');
      // Your own songs: added several at once, each video gets a different one
      await page.eval(`(async () => {
        const wav = (hz) => { const n = 8000, b = new DataView(new ArrayBuffer(44 + n * 2)), w = (o, s) => [...s].forEach((c, i) => b.setUint8(o + i, c.charCodeAt(0)));
          w(0, 'RIFF'); b.setUint32(4, 36 + n * 2, true); w(8, 'WAVEfmt '); b.setUint32(16, 16, true); b.setUint16(20, 1, true); b.setUint16(22, 1, true);
          b.setUint32(24, 8000, true); b.setUint32(28, 16000, true); b.setUint16(32, 2, true); b.setUint16(34, 16, true); w(36, 'data'); b.setUint32(40, n * 2, true);
          for (let i = 0; i < n; i++) b.setInt16(44 + i * 2, Math.sin(i * hz / 8000 * 2 * Math.PI) * 8000, true); return b.buffer; };
        const dt = new DataTransfer();
        ['Song A', 'Song B', 'Song C'].forEach((n, i) => dt.items.add(new File([wav(300 + i * 100)], n + '.wav', { type: 'audio/wav' })));
        const input = document.querySelector('#stMusicFile'); input.files = dt.files; input.dispatchEvent(new Event('change'));
      })()`);
      await page.waitFor(`document.querySelectorAll('#stMusic [data-music^="song:"]').length === 3`, 5000);
      const songOf = async sel => { await page.eval(`document.querySelector(${JSON.stringify(sel)}).click()`); return page.eval(`document.querySelector('#stSongNow').textContent`); };
      const songs = [await songOf('#stStories [data-story="story-rajwada"]'), await songOf('#stStories [data-story="story-rajwada"] + [data-story]'), await songOf('#stLooks [data-look="lotusnight"]')];
      assert.ok(songs.every(s => /^This video’s song: Song [ABC]$/.test(s)), songs.join(' | '));
      assert.notEqual(songs[0], songs[1], 'neighbouring films get different songs');
      await page.eval(`window.confirm = () => true; document.querySelector('[data-music-clear]').click()`);
      assert.equal(await page.eval(`document.querySelectorAll('#stMusic [data-music^="song:"]').length`), 0, 'the songs can be removed');
      await page.eval(`document.querySelector('#stLang [data-lang="en"]').click()`);
      await page.eval(`document.querySelector('#stLooks [data-look="lotusnight"]').click()`);
      // Phones: nothing sticks out sideways
      await page.viewport(390, 844);
      await sleep(300);
      assert.equal(await page.eval(`document.querySelector('.st-body').scrollWidth <= document.querySelector('.st-body').clientWidth`), true);
      await page.viewport(1300, 900);
      // A customer's order (a birthday, as the website sends it): picked in the Studio, it makes the video by itself
      await page.eval(`document.querySelector('#stClose').click()`);
      await page.eval(`(() => { const card = { ...PRESETS.bday.card, theme: 11, events: [] };
        document.querySelector('#orderPaste').value = Catalog.orderMessage({ ...card, design: 11, guests: [], photo: false, gallery: false }, Catalog.entries());
        document.querySelector('#orderFill').click(); })()`);
      await page.eval(`document.querySelector('#clearBtn').click()`);
      await page.eval(`document.querySelector('#studioBtn').click()`);
      await page.waitFor(`!document.querySelector('#studio').hidden && !document.querySelector('#stOrderRow').hidden`, 8000);
      assert.match(await page.eval(`document.querySelector('#stOrder').selectedOptions[0].textContent`), /Neha · Birthday/, 'an empty editor starts on the newest order');
      assert.match(await page.eval(`document.querySelector('#stWho').textContent`), /Neha · Birthday/);
      assert.equal(await page.eval(`document.querySelector('#stLooks .on').dataset.look`), 'party', 'a birthday starts on the party scene');
      await page.eval(`document.querySelector('#stAuto').click()`);
      await page.waitFor(`/Recording/.test(document.querySelector('#stStatus').textContent)`, 5000);
      // The timer shows the new length from the next frame (starting the recorder can hold the page for a moment)
      await page.waitFor(`document.querySelector('#stTime').textContent.endsWith('/ 0:34')`, 3000)
        .catch(() => assert.fail('doors, title, invitation, venue, wishes, thank you: 34 seconds'));
      await page.eval(`document.querySelector('#stClose').click()`);
      assert.equal(await page.eval(`document.querySelector('#studio').hidden`), false, 'it cannot be closed while recording');
      await page.waitFor(`/Saved|Could not/.test(document.querySelector('#stStatus').textContent)`, 60000);
      assert.match(await page.eval(`document.querySelector('#stStatus').textContent`), /Saved "Neha Confetti Party English video\.mp4"/);
      const dur = await page.eval(`new Promise(r => { const v = document.querySelector('#stVideo'); v.readyState ? r(v.duration) : v.onloadedmetadata = () => r(v.duration); })`);
      assert.ok(dur > 32 && dur < 36, `video is ${dur}s`);
      assert.deepEqual(await page.eval(`[document.querySelector('#stVideo').videoWidth, document.querySelector('#stVideo').videoHeight]`), [1080, 1920]);
      for (let i = 0; i < 20 && !fs.readdirSync(dir).some(f => f.endsWith('.mp4')); i++) await sleep(250);
      const file = fs.readdirSync(dir).find(f => f.endsWith('.mp4'));
      assert.ok(file && fs.statSync(path.join(dir, file)).size > 100000, 'MP4 saved to Downloads');
      assert.ok(!fs.readFileSync(path.join(dir, file)).toString('latin1').includes('moof'), 'a standard MP4 that WhatsApp accepts');
      await page.eval(`document.querySelector('#stClose').click()`);
      assert.equal(await page.eval(`document.querySelector('#studio').hidden`), true);
      noErrors();
      fs.rmSync(dir, { recursive: true, force: true });
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
        // innerWidth grows past the phone width when anything is too wide (the browser zooms the page out).
        assert.equal(await page.eval(`innerWidth`), w, `${p} is laid out wider than a ${w}px phone`);
        assert.ok(await page.eval(`document.documentElement.scrollWidth <= innerWidth + 1`), `${p} wider than a ${w}px screen`);
        noErrors();
      }
    }
  });

  test('mobile: catalog posters fit two per row with the order button visible', async () => {
    await page.viewport(390, 844);
    await page.goto(base + 'index.html#designs'); // the cards live in the Designs tab on phones
    const cols = await page.eval(`getComputedStyle(document.querySelector('#showcase')).gridTemplateColumns.split(' ').length`);
    assert.equal(cols, 2);
    const fits = await page.eval(`[...document.querySelectorAll('#showcase .tpl')].slice(0, 4).every(t => { const p = t.querySelector('.p-play').getBoundingClientRect(), b = t.querySelector('.poster').getBoundingClientRect(); return p.bottom <= b.bottom + 1; })`);
    assert.ok(fits, '"Live demo" button is cut off on a phone');
  });

  test('mobile: Designs is its own tab; Home shows a preview; back returns home', async () => {
    await page.viewport(390, 844);
    await page.goto(base + 'index.html');
    assert.equal(await page.eval(`[...document.querySelectorAll('#showcase .tpl')].filter(t => t.offsetParent).length`), 0, 'Home shows no design cards (they live in the Designs tab)');
    assert.equal(await page.eval(`[...document.querySelectorAll('#occPicker .occ-tile')].filter(t => t.offsetParent).length`), 20, 'Home: what are you celebrating?');
    await page.eval(`document.querySelector('#occPicker [data-pick="wedding"]').click()`);
    assert.equal(await page.eval(`document.body.dataset.tab`), 'designs');
    assert.equal(await page.eval(`!!document.querySelector('#occPicker').offsetParent`), false, 'the picker stays on Home');
    assert.match(await page.eval(`document.querySelector('#catStatusText').textContent`), /Showing 30 💍 Wedding designs/);
    assert.ok(await page.eval(`[...document.querySelectorAll('#showcase .tpl .tpl-meta small')].every(s => s.textContent.includes('Wedding'))`), 'only wedding designs');
    await page.eval(`history.back()`);
    await page.waitFor(`document.body.dataset.tab === 'home'`, 3000);
    await page.eval(`document.querySelector('#catShowAll').click()`);
    assert.ok(await page.eval(`!!document.querySelector('#seeAll').offsetParent`), 'See all button on Home');
    assert.equal(await page.eval(`document.querySelector('#seeAll').innerText.trim()`), '🎨 See all 600 designs →', 'spaces around the number (was "all200designs")');
    await page.eval(`document.querySelector('#seeAll').click()`);
    assert.equal(await page.eval(`document.body.dataset.tab`), 'designs');
    assert.equal(await page.eval(`location.hash`), '#designs');
    assert.equal(await page.eval(`!!document.querySelector('.hero').offsetParent`), false, 'only the catalog shows');
    assert.equal(await page.eval(`!!document.querySelector('.nav').offsetParent`), false, 'no floating top bar over the search');
    assert.equal(await page.eval(`[...document.querySelectorAll('#showcase .tpl')].filter(t => t.offsetParent).length`), 24);
    await page.waitFor(`getComputedStyle(document.querySelector('#showcase .tpl.in') || document.body).animationName.includes('dealIn')`, 3000);
    // While cards fly in, the page must not get wider than the phone (it made the bottom bar slide sideways)
    assert.equal(await page.eval(`innerWidth`), 390);
    assert.ok(await page.eval(`document.documentElement.scrollWidth <= innerWidth`), 'no sideways scrolling during the card deal');
    // Each card is dealt once, then stays still
    await page.waitFor(`document.querySelectorAll('#showcase .tpl.dealt').length >= 2`, 5000);
    assert.equal(await page.eval(`getComputedStyle(document.querySelector('#showcase .tpl.dealt')).animationName`), 'none');
    await page.eval(`history.back()`);
    await page.waitFor(`document.body.dataset.tab === 'home' && !!document.querySelector('.hero').offsetParent`, 3000);
    await page.eval(`document.querySelector('.bottom-nav [data-trending]').click()`);
    await page.waitFor(`document.body.dataset.tab === 'trending' && !!document.querySelector('#hot').offsetParent`, 3000);
    assert.equal(await page.eval(`document.querySelectorAll('#hotReel .hot-slide').length`), 10, "Trending tab: today's ten, as ranked slides");
    assert.equal(await page.eval(`!!document.querySelector('#templates').offsetParent`), false, 'not the Designs grid');
    assert.equal(await page.eval(`location.hash`), '#trending');
    assert.ok(await page.eval(`document.documentElement.scrollWidth <= innerWidth`), 'no sideways page scroll');
    noErrors();
  });

  test('mobile: long names are never cut, in every layout; nicknames show under the names', async () => {
    await page.viewport(360, 740);
    for (const theme of [1, 2, 3, 4, 7]) { // classic, arch, monogram, split, ticket
      const card = { ...PRESETS.wedding.card, theme, host1: 'Venkataramanaswamy', host2: 'Subrahmanyeshwari', nick1: 'Venky', nick2: 'Subbu' };
      await page.goto(cardLink(card, '?auto'), 300);
      await page.waitFor(`document.body.classList.contains('opened')`, 5000);
      await page.eval(`document.fonts.ready`);
      await sleep(400);
      const cut = await page.eval(`[...document.querySelectorAll('.names .w')].filter(w => { const r = w.getBoundingClientRect(); return r.left < -1 || r.right > innerWidth + 1; }).length`);
      assert.equal(cut, 0, `#${theme} ${Templates.get(theme).layout}: a name runs off the screen`);
      assert.equal(await page.eval(`document.querySelector('.nicks').textContent`), '“Venky” & “Subbu”');
      noErrors();
    }
  });

  test('card: the scrollbar is hidden but the card still scrolls', async () => {
    await page.viewport(420, 760);
    await page.goto(cardLink(PRESETS.wedding.card, '?auto'), 300);
    await page.waitFor(`document.body.classList.contains('opened')`, 5000);
    assert.equal(await page.eval(`getComputedStyle(document.documentElement).scrollbarWidth`), 'none');
    await page.eval(`scrollTo(0, 600)`);
    assert.ok(await page.eval(`scrollY`) > 0);
  });

  test('desktop: no tabs or card-deal animation', async () => {
    await page.viewport(1300, 900);
    await page.goto(base + 'index.html#designs');
    assert.ok(await page.eval(`!!document.querySelector('.hero').offsetParent`), 'whole page shows on a computer');
    assert.equal(await page.eval(`getComputedStyle(document.querySelector('#showcase .tpl')).animationName`), 'none');
    assert.equal(await page.eval(`getComputedStyle(document.querySelector('.see-all-wrap')).display`), 'none');
  });

  test('story videos: 20 scenes; a tap plays one in its fifteen moods; "Order this video" puts it in the order', async () => {
    await page.viewport(390, 844);
    await page.goto(base + 'index.html');
    await page.eval(`document.querySelector('.bottom-nav [data-videos]').click()`);
    assert.equal(await page.eval(`document.body.dataset.tab`), 'videos');
    assert.equal(await page.eval(`document.querySelectorAll('#vidsGrid .vid-tile').length`), 20, '20 at a time');
    assert.match(await page.eval(`document.querySelector('#vidsCount').textContent`), /Showing 20 of 300 video looks/);
    for (let i = 0; i < 20 && !(await page.eval(`document.querySelector('#vidsMore').hidden`)); i++) await page.eval(`document.querySelector('#vidsMore').click()`);
    assert.equal(await page.eval(`new Set([...document.querySelectorAll('#vidsGrid .vid-tile')].map(t => t.dataset.look)).size`), 300, 'all 300 looks');
    await page.eval(`document.querySelector('#vidsChips [data-vscene="party"]').click()`);
    assert.equal(await page.eval(`document.querySelectorAll('#vidsGrid .vid-tile').length`), 15, 'a scene shows its fifteen moods');
    assert.equal(await page.eval(`document.querySelector('#vidsMore').hidden`), true);
    assert.equal(await page.eval(`!!document.querySelector('.hero').offsetParent`), false, 'the Videos tab shows only the videos');
    await page.eval(`document.querySelector('#vidsGrid [data-look="party"]').click()`);
    await page.waitFor(`document.querySelector('#vidWait').hidden`, 15000);
    assert.equal(await page.eval(`document.querySelectorAll('#vidMoods .chip').length`), 15, 'fifteen moods');
    const bar = await page.eval(`document.querySelector('#vidBar').style.width`);
    await page.waitFor(`document.querySelector('#vidBar').style.width !== ${JSON.stringify(bar)}`, 4000);
    await page.eval(`document.querySelector('#vidMoods .chip:nth-child(3)').click()`);
    const mood = await page.eval(`document.querySelector('#vidMoods .on').textContent`);
    await page.eval(`document.querySelector('#vidOrder').click()`);
    assert.equal(await page.eval(`document.querySelector('#vidSheet').hidden`), true);
    assert.equal(await page.eval(`document.querySelector('#orderSheet').hidden`), false);
    assert.ok((await page.eval(`document.querySelector('#osVideo').textContent`)).includes(`Confetti Party · ${mood}`), 'the order shows the chosen video');
    assert.equal(await page.eval(`document.querySelector('#osOcc .chip.on').dataset.type`), 'bday', 'for the occasion it was shown with');
    await page.eval(`document.querySelector('#osClose').click()`);
    noErrors();
    await page.viewport(420, 860);
  });

  test('mobile: the sample bar and music button do not overlap', async () => {
    await page.viewport(360, 740);
    await page.goto(cardLink({ ...PRESETS.wedding.card, theme: 13 }, '?demo'));
    await openEnvelope();
    const [bar, btn] = await page.eval(`[document.querySelector('#demoBar'), document.querySelector('#musicBtn')].map(e => e.getBoundingClientRect().toJSON())`);
    assert.ok(bar.right <= btn.left, `bar ends at ${bar.right}, button starts at ${btn.left}`);
  });
});
