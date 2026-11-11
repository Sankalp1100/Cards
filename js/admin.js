// Admin panel: pick a design by number, fill in the customer's details, generate (per-guest) links, keep a link
// history, and manage the website's catalog and settings (published through server.mjs, or as a config.js download).
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const { esc, compact, who } = Core;
  const clone = o => JSON.parse(JSON.stringify(o));
  const form = $('#form'), frame = $('#preview');
  const FIELDS = ['title', 'host1', 'host2', 'nick1', 'nick2', 'tagline', 'date', 'venue', 'message', 'photo', 'mapUrl', 'rsvp', 'intro',
    'upi', 'hashtag', 'giftNote', 'venueNote', 'thanks'];
  // The premium sections' list editors: each entry's fields, with their placeholders.
  const XLISTS = {
    story: [['when', 'When, e.g. March 2023', 40], ['title', 'Title, e.g. First Meeting', 60], ['text', 'A line or two', 300]],
    families: [['side', 'e.g. Bride’s Family', 40], ['parents', 'Parents, e.g. Mr. & Mrs. Mehta', 120], ['more', 'Siblings / more (optional)', 160]],
    attire: [['name', 'Function, e.g. Haldi', 40], ['text', 'e.g. Sunshine yellow', 100], ['colors', '#f4c430,#ffb347', 80]]
  };
  const SITE_KEYS = ['url', 'brand', 'designer', 'whatsapp', 'instagram', 'price', 'currency'];
  const STORE_KEY = 'weddingcard.links', DRAFT_KEY = 'weddingcard.config';
  const GALLERY_PAGE = 40;

  let state = clone(PRESETS.wedding.card);
  let touched = false; // the customer's details were typed in, so picking a design must not replace them
  let occasionChosen = false; // an occasion was picked by hand, so picking a design must not change it
  let previewTimer = null;

  // Logged-in mode (the live site, and Start Admin.cmd): catalog, settings, orders and history live in the database.
  // Opened as a file, or with ?offline on this PC (the tests use it), the panel works in this browser only, as before.
  const OFFLINE = location.protocol === 'file:' || (new URLSearchParams(location.search).has('offline') && /^(localhost|127\.0\.0\.1)$/.test(location.hostname));
  const useDb = !OFFLINE && typeof DB !== 'undefined';
  const newId = () => (window.crypto && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

  // ---------- Site settings + catalog (draft until published) ----------
  const normalize = c => ({
    site: Object.fromEntries(SITE_KEYS.map(k => [k, c.site[k] ?? ''])),
    catalog: Catalog.clean(c.catalog)
  });
  let published = normalize({ site: SITE, catalog: CATALOG });
  const loadDraft = () => {
    try { const d = JSON.parse(localStorage.getItem(DRAFT_KEY)); if (d && d.site && d.catalog) return normalize(d); } catch (e) { /* no draft */ }
    return null;
  };
  let cfg = loadDraft() || clone(published);
  const isDirty = () => JSON.stringify(normalize(cfg)) !== JSON.stringify(published);
  const entries = () => Catalog.entries(cfg.site, cfg.catalog);
  const entry = no => entries()[no - 1];

  function saveDraft() {
    try { if (isDirty()) localStorage.setItem(DRAFT_KEY, JSON.stringify(cfg)); else localStorage.removeItem(DRAFT_KEY); } catch (e) { /* private mode */ }
    $('#urlWarn').hidden = !!cfg.site.url;
    if (cfg.site.url) $('#siteLink').href = $('#siteLinkM').href = cfg.site.url;
    if (!isDirty()) { if (!saving && !savedShown) barStatus('', { show: false }); }
    else if (server) { barStatus('✏️ Saving to the website…'); scheduleAutoSave(); }
    else barStatus(offlineHelp, { buttons: true });
  }

  // ---------- Auto-save: every catalog/settings change goes to the website by itself ----------
  // Changes are sent 2 s after the last edit (typing a name sends once, not per letter), one save at a time.
  let autoTimer = null, saving = false, again = false, savedShown = null;
  let offlineHelp = '📝 Saved on this device only.';
  function barStatus(text, { buttons = false, show = true } = {}) {
    $('#publishText').textContent = text;
    $('#publishBar').hidden = !show;
    $('#publishBar .link-actions').hidden = !buttons;
  }
  function scheduleAutoSave() {
    clearTimeout(autoTimer);
    autoTimer = setTimeout(autoSave, 2000);
  }
  async function autoSave() {
    if (saving) { again = true; return; }
    if (!isDirty() || !server) return;
    saving = true;
    barStatus('⏳ Saving to the website…');
    const res = await sendConfig();
    saving = false;
    if (res.saved) {
      barStatus(res.published ? '✅ Saved to the website. It is live in about a minute.' : `✅ Saved. ${res.message}`);
      clearTimeout(savedShown);
      savedShown = setTimeout(() => { savedShown = null; if (!isDirty() && !saving) barStatus('', { show: false }); }, 6000);
    } else barStatus(`⚠️ Not saved to the website: ${res.message}`, { buttons: true });
    if (again || (res.saved && isDirty())) { again = false; scheduleAutoSave(); }
  }

  // ---------- Card state ----------
  // The design's opening as set in the catalog travels in the link (guests' cards never read the database).
  const catalogIntro = () => { const t = design(), e = entry(t.no); return e.intro !== t.intro ? e.intro : ''; };
  const code = overrides => Codec.encode(compact({ ...state, intro: state.intro || catalogIntro(), ...overrides }));
  const occasion = s => (PRESETS[s.type] || PRESETS.wedding);
  const design = () => Templates.get(state.theme) || Templates.get(1);

  // ---------- Paste an order from WhatsApp ----------
  // Orders (from the website's order form, or pasted from WhatsApp) are kept in a list; tapping a customer's name
  // fills everything in. Logged in, the list lives in the database (same on every device); offline, in this browser.
  const ORDERS_KEY = 'weddingcard.orders';
  let ordersCache = [];
  const loadOrders = () => {
    if (useDb) return ordersCache.slice();
    try { return JSON.parse(localStorage.getItem(ORDERS_KEY)) || []; } catch (e) { return []; }
  };
  function saveOrders(list) {
    if (!useDb) {
      try { localStorage.setItem(ORDERS_KEY, JSON.stringify(list)); } catch (e) { toast('Could not save orders in this browser'); }
      return;
    }
    const before = ordersCache, was = new Map(before.map(o => [o.id, o]));
    ordersCache = list;
    const jobs = [];
    const added = list.filter(o => !was.has(o.id));
    if (added.length) jobs.push(DB.insert('orders', added.map(o => ({ id: o.id, code: o.code, names: o.name, occasion: o.type, design_no: o.design || null, event_date: o.date || '' }))));
    for (const o of before) if (!list.some(x => x.id === o.id)) jobs.push(DB.remove('orders', `id=eq.${o.id}`));
    for (const o of list) if (was.has(o.id) && was.get(o.id).done !== o.done) jobs.push(DB.update('orders', `id=eq.${o.id}`, { status: o.done ? 'done' : 'new' }));
    Promise.all(jobs).catch(e => { toast(`Orders not saved: ${e.message}`); $('#orderMsg').textContent = `⚠️ The order could not be saved in the list: ${e.message}`; refreshOrders(); });
  }
  async function refreshOrders() {
    if (!useDb || !DB.user) return;
    try {
      const rows = await DB.select('orders', 'select=*&order=created_at.desc&limit=500');
      ordersCache = rows.map(r => ({ id: r.id, code: r.code, name: r.names || 'Customer', type: r.occasion, design: r.design_no || '', date: r.event_date, received: Date.parse(r.created_at), done: r.status === 'done',
        pdfPath: r.pdf_path || '', pdfName: r.pdf_name || '' }));
      renderOrders();
      if (!navigated && page !== 'orders' && ordersCache.some(o => !o.done)) showPage('orders');
    } catch (e) { /* keep the list we have */ }
  }

  // Saves a pasted order at the top of the list (once), then shows it there: scrolled into view and lit up.
  // Returns whether it is new.
  function rememberOrder(code, order) {
    const list = loadOrders(), known = list.some(o => o.code === code);
    if (!known) {
      const c = order.card;
      list.unshift({ id: newId(), code, name: who(c), type: c.type, design: c.theme || '', date: c.date, received: Date.now(), done: false });
      saveOrders(list);
    }
    renderOrders(code);
    const item = $('#ordersList .order-item.on');
    if (item) { $('#ordersList').scrollTop = item.offsetTop - $('#ordersList').offsetTop - 8; item.classList.add('flash'); }
    return !known;
  }

  // Everything the customer sent, written out the way the order message lists it (without the code line).
  function orderDetails(code) {
    const r = Catalog.readOrder(code);
    if (!r || r.partial) return 'Only the design number is known for this order.';
    const video = (Studio.STORIES[r.video] ? `Story film: ${Studio.STORIES[r.video].name}` : Studio.LOOKS[r.video] ? Studio.lookName(Studio.LOOKS[r.video]) : '')
      + (r.video && r.videoLang ? ` (${r.videoLang === 'hi' ? 'Hindi' : 'English'})` : '');
    const text = Catalog.orderMessage({ ...r.card, design: r.card.theme, guests: r.guests, photo: r.photo, gallery: r.gallery, video: video && r.video, videoName: video }, Catalog.entries());
    return text.split('\n').slice(1).filter(l => l && !/^Order (code|no)/.test(l)).map(l => l.replace(/\*/g, '')).join('\n');
  }

  // Which orders show: new ones, done ones or all, and only those matching the search
  let ordShow = 'open';
  function renderOrders(active) {
    const all = loadOrders().sort((a, b) => (a.done - b.done) || (b.received - a.received));
    const open = all.filter(o => !o.done).length;
    for (const id of ['#ordersCount', '#ordersNav']) { $(id).hidden = !open; $(id).textContent = open; }
    const q = $('#ordSearch').value.trim().toLowerCase();
    // The order just pasted or opened always shows, whatever the filter
    const list = all.filter(o => o.code === active || ((ordShow === 'all' || (ordShow === 'done') === !!o.done) &&
      (!q || [o.name, Catalog.refOf(o.code), o.design && Templates.serial(o.design), (PRESETS[o.type] || {}).label].join(' ').toLowerCase().includes(q))));
    $('#ordersEmpty').hidden = list.length > 0;
    $('#ordersList').innerHTML = list.map(o => {
      const when = Core.parseDate(o.date);
      return `
        <div class="order-item${o.done ? ' done' : ''}${o.code === active ? ' on' : ''}">
          <button type="button" class="order-open" data-open="${esc(o.code)}" title="Fill the editor with this order">
            <b>${esc(o.name)}${Catalog.refOf(o.code) ? ` <span class="order-ref">${Catalog.refOf(o.code)}</span>` : ''}${o.pdfPath ? ' <span class="order-ref" title="The customer sent their card PDF">📄 PDF</span>' : ''}</b>
            <small>${(PRESETS[o.type] || PRESETS.wedding).icon} ${esc((PRESETS[o.type] || PRESETS.wedding).label)}${o.design ? ` · ${Templates.serial(o.design)}` : ''}${when ? ` · ${when.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}` : ''}</small>
            <small class="ago">Received ${new Date(o.received).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</small>
          </button>
          ${o.pdfPath ? `<button type="button" class="btn-small" data-pdf="${esc(o.id)}" title="${esc(o.pdfName || 'card.pdf')}">⬇ Download PDF</button>
          <button type="button" class="btn-small" data-pdf-video="${esc(o.id)}" title="Read this PDF in the Video Studio and make its video">⚡ Make video</button>` : ''}
          <button type="button" class="btn-small" data-video="${esc(o.code)}" title="Make this order's video">🎬 Video</button>
          <button type="button" class="btn-small" data-done="${esc(o.code)}" title="${o.done ? 'Mark as not done' : 'Mark as done'}">${o.done ? '↺' : '✓'}</button>
          <button type="button" class="btn-small danger" data-forget="${esc(o.code)}" aria-label="Delete order">✕</button>
          <details class="order-details"><summary>View details</summary><pre>${esc(orderDetails(o.code))}</pre></details>
        </div>`;
    }).join('');
  }

  $('#ordersList').addEventListener('click', e => {
    const open = e.target.closest('[data-open]'), done = e.target.closest('[data-done]'), forget = e.target.closest('[data-forget]'), video = e.target.closest('[data-video]');
    const pdf = e.target.closest('[data-pdf], [data-pdf-video]');
    if (pdf) {
      orderPdf(pdf, pdf.hasAttribute('data-pdf-video'));
    } else if (open) {
      const order = Catalog.readOrder(open.dataset.open);
      if (order) { fillOrder(order); renderOrders(open.dataset.open); goTo('create', '.create-grid'); }
    } else if (video) {
      openStudioFor(video.dataset.video);
    } else if (done) {
      saveOrders(loadOrders().map(o => o.code === done.dataset.done ? { ...o, done: !o.done } : o));
      renderOrders(done.dataset.done); // it stays in view (greyed when done) until the list is filtered again
    } else if (forget && confirm('Delete this order from the list?')) {
      saveOrders(loadOrders().filter(o => o.code !== forget.dataset.forget));
      renderOrders();
    }
  });

  // A website order's card PDF (kept in the private storage, so it needs the login): saved to this device,
  // or handed to the Video Studio's "Card PDF → video" (readPdf)
  async function orderPdf(btn, makeVideo) {
    const o = loadOrders().find(x => x.id === btn.dataset.pdf || x.id === btn.dataset.pdfVideo);
    if (!o || !o.pdfPath || !useDb) return;
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = '⏳ Getting PDF…';
    try {
      const name = o.pdfName || 'card.pdf';
      const blob = await DB.downloadPdf(o.pdfPath);
      if (makeVideo) {
        await openStudio();
        readPdf(new File([blob], name, { type: 'application/pdf' }));
      } else download(name, blob, 'application/pdf');
    } catch (err) {
      toast(`Could not get the PDF: ${err.message}`);
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  }

  async function fillFromOrder() {
    let text = $('#orderPaste').value;
    const msg = $('#orderMsg');
    // A short order number ("Order no: WC-7K2Q9H"): the details are in the order list (saved by the website).
    const ref = !/WC1\./.test(text) && Catalog.refOf(text);
    if (ref) {
      msg.textContent = `Looking up order ${ref}…`;
      await refreshOrders();
      const found = loadOrders().find(o => String(o.code).startsWith(ref + ' '));
      if (!found) { msg.textContent = `Order ${ref} was not found. Check the number, or ask the customer to send the order again.`; return; }
      text = found.code;
    }
    const order = Catalog.readOrder(text);
    if (!order) {
      msg.textContent = 'No order found. Paste the whole message, including the line "Order no: WC-…".';
      return;
    }
    if (order.partial) {
      chooseDesign(order.card.theme);
      msg.textContent = `Design ${Templates.serial(order.card.theme)} selected. This message has no order code, so please type the details below.`;
      return;
    }
    // A message without its code is read line by line, and saved in the list with a code made from what it says
    const code = ref ? text : order.typed
      ? Catalog.orderCode({ ...order.card, design: order.card.theme || '', guests: order.guests, photo: order.photo, gallery: order.gallery, videoLang: order.videoLang })
      : text.match(/WC1\.[A-Za-z0-9_-]+/)[0];
    const added = rememberOrder(code, order);
    $('#orderPaste').value = '';
    fillOrder(order);
    $('#orderMsg').textContent = `${added ? '📥 Saved in the orders list below ↓' : '📥 Already in the orders list below ↓'} · ${$('#orderMsg').textContent}`;
    $('#orderGo').hidden = false;
  }

  function fillOrder(order) {
    const msg = $('#orderMsg');
    state = { ...Core.blankCard(), ...order.card, theme: order.card.theme || design().no };
    touched = true;
    occasionChosen = true;
    fillForm();
    updatePreview(true);
    fastMap(form.elements.mapUrl);
    $('#guests').value = order.guests.join('\n');
    msg.textContent = `✅ Filled: ${who(state)} · ${PRESETS[state.type].label} · ${order.card.theme ? `design ${Templates.serial(state.theme)}` : 'no design chosen, pick one below'}` +
      (order.guests.length ? ` · ${order.guests.length} guest link${order.guests.length > 1 ? 's' : ''} ready to make` : '') +
      (order.photo ? ' · 📷 the customer will send a photo on WhatsApp: upload it under Extras.' : '') +
      (order.gallery ? ' · 🖼️ gallery photos coming on WhatsApp: add them under Premium sections.' : '') +
      (order.typed ? ' · Read from the message (it had no order code): please check the dates and times.' : '') +
      ' Check the headline and tagline, then Get links.';
    toast('Order filled in ✨');
  }
  $('#orderFill').addEventListener('click', fillFromOrder);
  $('#ordFilter').addEventListener('click', e => {
    const b = e.target.closest('[data-show]');
    if (!b) return;
    ordShow = b.dataset.show;
    document.querySelectorAll('#ordFilter [data-show]').forEach(x => x.classList.toggle('on', x === b));
    renderOrders();
  });
  $('#ordSearch').addEventListener('input', () => renderOrders());
  // Pasting fills straight away.
  $('#orderPaste').addEventListener('paste', () => setTimeout(fillFromOrder, 0));

  // ---------- Design number ----------
  function chooseDesign(no, { quiet } = {}) {
    const t = Templates.get(no);
    if (!t) { $('#designMsg').textContent = `There is no design ${esc(String(no))}. Numbers go from 1 to ${Templates.all.length}.`; return false; }
    state.theme = t.no;
    const e = entry(t.no);
    // A fresh invite follows the design's occasion so the sample text and labels match it.
    if (!touched && !occasionChosen && e.occasion !== state.type) {
      state = { ...clone(PRESETS[e.occasion].card), theme: t.no };
      fillForm();
    }
    markDesign();
    updatePreview(true);
    if (!quiet) toast(`Design ${Templates.serial(t.no)} selected: ${e.name}`);
    return true;
  }

  function markDesign() {
    const t = design(), e = entry(t.no);
    $('#designNo').value = String(t.no).padStart(3, '0');
    $('#designMsg').textContent = e.hidden ? 'Note: this design is hidden on the website, but links made with it still work.' : '';
    $('#designChosen').innerHTML = `
      <span class="dot" style="--a:${t.vars['--accent']};--b:${t.vars['--bg']}">${t.emoji}</span>
      <span><b>${Templates.serial(t.no)} · ${esc(e.name)}</b><small>${PRESETS[e.occasion].icon} ${esc(PRESETS[e.occasion].label)}</small></span>`;
    $('#themeName').textContent = `${Templates.serial(t.no)} ${e.name}`;
    // Opening animation: the design's own (as set in the catalog) unless this invite picks another.
    $('#introSelect').innerHTML = `<option value="">Design's own: ${INTROS[e.intro]}</option>` +
      Object.entries(INTROS).map(([k, label]) => `<option value="${k}">${label}</option>`).join('');
    $('#introSelect').value = INTROS[state.intro] ? state.intro : '';
    document.querySelectorAll('#gallery .tpl').forEach(el => el.classList.toggle('on', +el.dataset.no === t.no));
  }

  let designTimer;
  $('#designNo').addEventListener('input', e => {
    const v = e.target.value.replace(/\D/g, '');
    e.target.value = v;
    clearTimeout(designTimer);
    if (v) designTimer = setTimeout(() => chooseDesign(+v), 400);
  });
  $('#designNo').addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.value) { clearTimeout(designTimer); chooseDesign(+e.target.value); } });
  $('#designNo').addEventListener('focus', e => e.target.select());

  // ---------- Rendering the form ----------
  function renderTypes() {
    $('#typeChips').innerHTML = Object.entries(PRESETS).map(([k, p]) =>
      `<button type="button" class="occasion${state.type === k ? ' on' : ''}" data-type="${k}">
         <span>${p.icon}</span><b>${esc(p.label)}</b></button>`).join('');
  }

  function renderEvents() {
    $('#events').innerHTML = (state.events || []).map((e, i) => `
      <div class="event-row" data-i="${i}">
        <input data-k="name" placeholder="Function, e.g. 🎶 Sangeet" value="${esc(e.name)}">
        <input data-k="date" type="datetime-local" min="${Core.nowLocal()}" value="${esc(e.date)}">
        <input data-k="venue" placeholder="Venue (optional)" value="${esc(e.venue)}">
        <input data-k="dress" placeholder="Dress code (optional)" value="${esc(e.dress)}">
        <button type="button" class="x" data-remove="${i}" aria-label="Remove function">✕</button>
      </div>`).join('');
    const have = new Set((state.events || []).map(e => e.name));
    const ideas = occasion(state).card.events.map(e => e.name).filter(n => !have.has(n));
    $('#quickEvents').innerHTML = ideas.map(n => `<button type="button" class="chip mini-chip" data-quick="${esc(n)}">+ ${esc(n)}</button>`).join('');
  }

  function renderPhoto() {
    const p = state.photo || '';
    const uploaded = p.startsWith('data:');
    const input = form.elements.photo;
    input.value = uploaded ? '' : p;
    input.disabled = uploaded;
    input.placeholder = uploaded ? 'Uploaded photo is in use' : '…or paste a public image link https://...';
    $('#photoThumb').innerHTML = p ? `<img src="${esc(p)}" alt="">` : '📷';
    $('#photoRemove').hidden = !p;
    $('#photoInfo').textContent = uploaded ? `Packed into the link (${Math.round(p.length / 1024)} KB)` : '';
  }

  // Square-crop and shrink the photo so it fits inside the link and still opens from WhatsApp.
  function compressPhoto(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const size = 200, side = Math.min(img.width, img.height);
        const cv = Object.assign(document.createElement('canvas'), { width: size, height: size });
        cv.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
        URL.revokeObjectURL(img.src);
        let out = cv.toDataURL('image/webp', 0.55);
        if (!out.startsWith('data:image/webp')) out = cv.toDataURL('image/jpeg', 0.6);
        resolve(out);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  $('#photoFile').addEventListener('change', async e => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      state.photo = await compressPhoto(file);
      touched = true;
      renderPhoto();
      updatePreview(true);
      toast('Photo added 📸');
    } catch (err) { toast('Could not read that image'); }
  });

  $('#photoRemove').addEventListener('click', () => {
    state.photo = '';
    renderPhoto();
    updatePreview(true);
  });

  // ---------- Premium sections ----------
  function renderXLists() {
    for (const [key, fields] of Object.entries(XLISTS)) {
      $(`[data-list="${key}"]`).innerHTML = (state[key] || []).map((e, i) => `
        <div class="xrow" data-xl="${key}" data-i="${i}">
          ${fields.map(([f, ph, max]) => f === 'text' && key === 'story'
            ? `<textarea data-xk="${f}" rows="2" maxlength="${max}" placeholder="${esc(ph)}">${esc(e[f] || '')}</textarea>`
            : `<input data-xk="${f}" maxlength="${max}" placeholder="${esc(ph)}" value="${esc(e[f] || '')}">`).join('')}
          <button type="button" class="x" data-xdel="${key}" data-i="${i}" aria-label="Remove">✕</button>
        </div>`).join('');
    }
    renderGallery2();
  }
  function renderGallery2() {
    const g = state.gallery || [];
    $('#galEdit').innerHTML = g.map((src, i) => `<div class="gal-thumb"><img src="${esc(src)}" alt=""><button type="button" class="x" data-galdel="${i}" aria-label="Remove photo">✕</button></div>`).join('');
    $('#galInfo').textContent = g.length ? `${g.length}/8 photos · ${Math.round(g.join('').length / 1024)} KB in the link` : '';
  }
  // Gallery photos: shrunk harder than the main photo (several fit in one link), keeping their shape.
  function compressGalleryPhoto(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 360 / Math.max(img.width, img.height));
        const cv = Object.assign(document.createElement('canvas'), { width: Math.round(img.width * scale), height: Math.round(img.height * scale) });
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        URL.revokeObjectURL(img.src);
        let out = cv.toDataURL('image/webp', 0.5);
        if (!out.startsWith('data:image/webp')) out = cv.toDataURL('image/jpeg', 0.55);
        resolve(out);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }
  $('#galFile').addEventListener('change', async e => {
    const files = [...e.target.files];
    e.target.value = '';
    state.gallery = state.gallery || [];
    for (const f of files) {
      if (state.gallery.length >= 8) { toast('The gallery holds up to 8 photos'); break; }
      try { state.gallery.push(await compressGalleryPhoto(f)); } catch (err) { toast('Could not read one of the images'); }
    }
    touched = true;
    renderGallery2();
    updatePreview(true);
  });
  form.addEventListener('click', e => {
    const add = e.target.closest('[data-add]'), del = e.target.closest('[data-xdel]'), gdel = e.target.closest('[data-galdel]');
    if (add) {
      const key = add.dataset.add;
      (state[key] = state[key] || []).push(Object.fromEntries(XLISTS[key].map(([f]) => [f, ''])));
      renderXLists();
      $(`[data-list="${key}"] .xrow:last-child [data-xk]`).focus();
    } else if (del) { state[del.dataset.xdel].splice(+del.dataset.i, 1); renderXLists(); }
    else if (gdel) { state.gallery.splice(+gdel.dataset.galdel, 1); renderGallery2(); }
    else return;
    touched = true;
    updatePreview();
  });

  // "Time not decided yet": the date box asks only for the day, and the card shows the date without a time.
  function showDateMode() {
    const box = form.elements.date, noTime = !!state.date && !Core.hasTime(state.date);
    form.elements.noTime.checked = noTime;
    box.type = noTime ? 'date' : 'datetime-local';
    box.min = noTime ? Core.nowLocal().slice(0, 10) : Core.nowLocal(); // past dates can't be picked
    box.value = state.date || '';
  }
  form.elements.noTime.addEventListener('change', e => {
    const day = (state.date || '').slice(0, 10);
    state.date = e.target.checked ? day : day ? day + 'T19:00' : '';
    if (e.target.checked && !day) { form.elements.date.type = 'date'; form.elements.date.min = Core.nowLocal().slice(0, 10); form.elements.date.focus(); return; }
    touched = true;
    showDateMode();
    updatePreview();
  });

  function fillForm() {
    const sample = occasion(state).card;
    for (const f of FIELDS) {
      form.elements[f].value = state[f] || '';
      if (sample[f] && f !== 'photo') form.elements[f].placeholder = sample[f];
    }
    showDateMode(); // a date without a time when the time is not decided yet
    form.elements.rsvp.value = tenDigits(state.rsvp);
    showMobileHint(form.elements.rsvp);
    renderPhoto();
    form.elements.music.checked = state.music !== false;
    form.elements.rsvpForm.checked = state.rsvpForm === true;
    renderXLists();
    const labels = occasion(state).labels;
    $('#lbl1').textContent = labels[0];
    $('#lbl2').textContent = labels[1];
    renderTypes();
    renderEvents();
    markDesign();
  }

  // ---------- Preview ----------
  function updatePreview(now) {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => { frame.src = 'card.html?preview#' + code(); }, now ? 0 : 350);
  }

  // Mobile-number boxes (customer RSVP, your WhatsApp in Settings): digits only, at most 10, with a live hint.
  const showMobileHint = Core.wireMobileInputs(document);
  const tenDigits = n => Core.mobileInput(n); // 919876543210 is shown as 9876543210

  // ---------- Form events ----------
  form.addEventListener('input', e => {
    const t = e.target;
    if (t.closest('.event-row')) state.events[t.closest('.event-row').dataset.i][t.dataset.k] = t.value;
    else if (t.closest('.xrow')) { const r = t.closest('.xrow'); state[r.dataset.xl][r.dataset.i][t.dataset.xk] = t.value; }
    else if (t.name === 'music') state.music = t.checked;
    else if (t.name === 'rsvpForm') state.rsvpForm = t.checked;
    else if (FIELDS.includes(t.name)) state[t.name] = t.value;
    else return;
    touched = true;
    if (t.name === 'photo') renderPhoto();
    updatePreview();
  });

  // A pasted maps.app.goo.gl link becomes the full Google Maps link (the short ones open very slowly for guests).
  form.addEventListener('change', e => { if (e.target.name === 'mapUrl') fastMap(e.target); });
  async function fastMap(t) {
    if (OFFLINE || !/^https:\/\/(maps\.app\.)?goo\.gl\//.test(t.value.trim())) return;
    const short = t.value.trim();
    try {
      const r = await fetch('api/maplink?u=' + encodeURIComponent(short));
      const { url } = r.ok ? await r.json() : {};
      if (!url || t.value.trim() !== short) return;
      t.value = state.mapUrl = url;
      updatePreview();
      toast('Map link made faster ✓');
    } catch (err) { /* keep the short link */ }
  }

  form.addEventListener('click', e => {
    const remove = e.target.closest('[data-remove]'), quick = e.target.closest('[data-quick]');
    if (remove) state.events.splice(+remove.dataset.remove, 1);
    else if (quick) (state.events = state.events || []).push({ name: quick.dataset.quick, date: state.date || '', venue: '', dress: '' });
    else return;
    renderEvents();
    updatePreview();
  });

  $('#typeChips').addEventListener('click', e => {
    const chip = e.target.closest('[data-type]');
    if (!chip) return;
    occasionChosen = true;
    const theme = state.theme;
    state = touched
      ? { ...state, type: chip.dataset.type } // keep what was typed, only switch the occasion
      : { ...clone(PRESETS[chip.dataset.type].card), theme };
    fillForm();
    updatePreview(true);
  });

  $('#sampleBtn').addEventListener('click', () => {
    // The sample text includes example premium sections, so the preview shows the whole page.
    state = { ...Core.blankCard(), ...clone(occasion(state).card), ...clone(EXTRAS[state.type] || {}), theme: state.theme };
    touched = false;
    fillForm();
    updatePreview(true);
  });

  $('#clearBtn').addEventListener('click', () => {
    state = { ...Core.blankCard(), type: state.type, theme: state.theme, music: state.music };
    touched = true;
    fillForm();
    updatePreview(true);
    form.elements.host1.focus();
  });

  $('#addEvent').addEventListener('click', () => {
    (state.events = state.events || []).push({ name: '', date: state.date || '', venue: '', dress: '' });
    renderEvents();
    $('#events .event-row:last-child input').focus();
  });

  $('#replay').addEventListener('click', () => {
    frame.src = 'about:blank';
    setTimeout(() => { frame.src = 'card.html?preview#' + code(); }, 50);
  });

  // ---------- Design gallery ----------
  let galFilter = '', galQuery = '', galShown = 0, galList = [];
  function renderGalleryFilters() {
    $('#galFilters').innerHTML = [['', '✨ All']].concat([['trending', '🔥 Trending']], Object.entries(PRESETS).map(([k, p]) => [k, `${p.icon} ${p.label}`]))
      .map(([k, label]) => `<button type="button" class="chip${k === galFilter ? ' on' : ''}" data-occ="${k}">${esc(label)}</button>`).join('');
  }
  function galleryCard(e) {
    return `
      <div class="tpl${e.no === design().no ? ' on' : ''}${e.hidden ? ' off' : ''}" data-no="${e.no}">
        ${Catalog.poster(e, 'button', `type="button" data-pick="${e.no}" aria-label="Use design ${Templates.serial(e.no)}"`)}
        <span class="serial">Design No. <b>${Templates.serial(e.no)}</b></span>
        <span class="tpl-name">${esc(e.name)}</span>
        ${e.hidden ? '<small>Hidden on website</small>' : ''}
        <a class="tpl-demo" href="card.html?demo#${Catalog.demoCode(e)}" target="_blank" rel="noopener">Live demo ↗</a>
      </div>`;
  }
  function galleryMore() {
    const next = galList.slice(galShown, galShown + GALLERY_PAGE);
    $('#gallery').insertAdjacentHTML('beforeend', next.map(galleryCard).join(''));
    galShown += next.length;
    $('#galMore').hidden = galShown >= galList.length;
    $('#galMore').textContent = `Show more (${galList.length - galShown} left)`;
  }
  function renderGallery() {
    const all = entries();
    galList = galFilter === 'trending'
      ? all.filter(e => e.featured && Catalog.matches(e, galQuery))
      : all.filter(e => Catalog.matches(e, galQuery, galFilter));
    galShown = 0;
    $('#gallery').innerHTML = galList.length ? '' : '<p class="muted">No design matches.</p>';
    galleryMore();
  }
  $('#galMore').addEventListener('click', galleryMore);
  $('#galFilters').addEventListener('click', e => {
    const chip = e.target.closest('[data-occ]');
    if (!chip) return;
    galFilter = chip.dataset.occ;
    renderGalleryFilters();
    renderGallery();
  });
  let galTimer;
  $('#galSearch').addEventListener('input', e => {
    clearTimeout(galTimer);
    galTimer = setTimeout(() => { galQuery = e.target.value; renderGallery(); }, 150);
  });
  $('#gallery').addEventListener('click', e => {
    const pick = e.target.closest('[data-pick]');
    if (!pick) return;
    chooseDesign(+pick.dataset.pick);
    goTo('create');
  });

  // ---------- Link generation ----------
  let lastResults = [];
  // A card needs a name, and its date (if any) must not have passed.
  function cardReady() {
    if (!state.host1) { toast('Please fill in a name first'); form.elements.host1.focus(); return false; }
    if (state.date && state.date < (Core.hasTime(state.date) ? Core.nowLocal() : Core.nowLocal().slice(0, 10))) { toast('That date has already passed. Please choose a future date'); form.elements.date.focus(); return false; }
    if (state.rsvp && !Core.mobile(state.rsvp)) { toast('RSVP number: please enter a valid 10-digit mobile number (starts with 6, 7, 8 or 9)'); form.elements.rsvp.focus(); return false; }
    return true;
  }

  // A short random code for a short link: 7 letters/digits (3.5 trillion possibilities, so nobody can guess one).
  const shortCode = () => {
    const A = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    return [...crypto.getRandomValues(new Uint8Array(7))].map(b => A[b % A.length]).join('');
  };

  $('#generate-btn').addEventListener('click', async () => {
    if (!cardReady()) return;
    const c = code();
    const guests = $('#guests').value.split('\n').map(g => g.trim()).filter(Boolean);
    const list = guests.length ? guests : [''];
    const now = Date.now();
    const site = cfg.site.url || location.href;
    let urls;
    if (useDb && DB.user) {
      // Logged in: short links (cardalbum.vercel.app/i#Xy7Kq2p). The card is saved once under a general code
      // (what guests forward), plus one code per guest with their name.
      const btn = $('#generate-btn');
      btn.disabled = true;
      toast('Making short links…');
      try {
        const card = Codec.decode(c), general = shortCode();
        const rows = [{ id: general, data: card, guest: null, share: null }]
          .concat(guests.map(g => ({ id: shortCode(), data: card, guest: g, share: general })));
        await DB.insert('cards', rows);
        const base = new URL('i', site).href;
        urls = guests.length ? rows.slice(1).map(r => `${base}#${r.id}`) : [`${base}#${general}`];
      } catch (e) {
        toast(`Could not make short links (${e.message}). Making full links instead.`);
      } finally {
        btn.disabled = false;
      }
    }
    lastResults = list.map((g, i) => ({
      id: newId(), guest: g, who: who(state), type: state.type, theme: design().no,
      // What the WhatsApp message says about the celebration (names, day, venue).
      card: { type: state.type, host1: state.host1, host2: state.host2, date: state.date, venue: state.venue, tagline: state.tagline },
      url: urls ? urls[i] : Core.cardUrl(site, c, g), created: now
    }));
    saveLinks([...lastResults, ...loadLinks()]);
    renderResults();
    renderLinks();
    toast(`${lastResults.length} link${lastResults.length > 1 ? 's' : ''} ready 🎉`);
    if (window.Fun) Fun.burstAt($('#generate-btn'));
  });

  function linkActions(r) {
    return `
      <button type="button" class="btn-small" data-copy="${esc(r.url)}">Copy</button>
      <button type="button" class="btn-small" data-copy="${esc(Core.inviteText({ guest: r.guest, card: r.card, who: r.who, label: occasion(r).label, link: r.url }))}">Copy message</button>
      <a class="btn-small wa" target="_blank" rel="noopener" href="https://api.whatsapp.com/send?text=${encodeURIComponent(Core.inviteText({ guest: r.guest, card: r.card, who: r.who, label: occasion(r).label, link: r.url }))}">WhatsApp</a>
      <a class="btn-small" target="_blank" rel="noopener" href="${esc(r.url)}">Open</a>`;
  }

  function renderResults() {
    $('#resultsHead').hidden = false;
    $('#resultsCount').textContent = `${lastResults.length} link${lastResults.length > 1 ? 's' : ''} ready`;
    $('#results').innerHTML = lastResults.map(r => `
      <div class="result">
        <b>${r.guest ? '🙋 ' + esc(r.guest) : '🌐 Common link (for everyone)'}</b>
        <input readonly value="${esc(r.url)}">
        <div class="link-actions">${linkActions(r)}</div>
      </div>`).join('');
  }

  $('#copyAll').addEventListener('click', () => {
    copy(lastResults.map(r => `${r.guest || 'Everyone'}: ${r.url}`).join('\n'), 'All links copied');
  });

  // ---------- Video ----------
  // Chrome/Edge film this tab cropped to the phone-sized card, so the video is exactly what guests see.
  // The music is the same synthesized tune, recorded straight from the audio graph. The file is only downloaded.
  const VIDEO_TYPES = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm'];
  // A finished video is opened before it is handed over: it has to load, show a picture and know its length,
  // and a frame a second in has to show too (a broken file fails here instead of on the customer's phone).
  function playable(blob) {
    return new Promise(resolve => {
      const v = Object.assign(document.createElement('video'), { muted: true, preload: 'auto', src: URL.createObjectURL(blob) });
      const done = ok => { clearTimeout(timer); URL.revokeObjectURL(v.src); v.removeAttribute('src'); resolve(ok); };
      const timer = setTimeout(() => done(false), 15000);
      v.onerror = () => done(false);
      v.onloadeddata = () => {
        if (!v.videoWidth || !(v.duration > 1)) return done(false);
        v.onseeked = () => done(v.readyState >= 2);
        v.currentTime = Math.min(1, v.duration / 2);
      };
    });
  }
  const recFrame = $('#recFrame');
  let recStream = null, recSeen = new Set(), recWaiters = {};

  addEventListener('message', e => {
    const msg = e.data && e.data.wcRecord;
    if (!msg || e.source !== recFrame.contentWindow) return;
    recSeen.add(msg);
    if (recWaiters[msg]) recWaiters[msg]();
  });

  // Resolves when the card reports `msg`; fails if the tab stops being shared or it takes too long.
  function recWait(msg, ms) {
    return new Promise((resolve, reject) => {
      if (recSeen.has(msg)) return resolve();
      const timer = setTimeout(() => reject(new Error('the card did not respond in time')), ms);
      recWaiters[msg] = () => { clearTimeout(timer); resolve(); };
      recStream?.getVideoTracks()[0]?.addEventListener('ended', () => { clearTimeout(timer); reject(new Error('sharing was stopped')); }, { once: true });
    });
  }

  function recStatus(text, progress) {
    $('#recStatus').textContent = text;
    $('#recBar').style.width = progress == null ? '0' : `${Math.round(progress * 100)}%`;
  }

  function openRecorder() {
    const h = Math.max(480, Math.min(800, innerHeight - 120)), w = Math.round(h * 9 / 16);
    Object.assign($('#recStage').style, { width: `${w}px`, height: `${h}px` });
    recSeen = new Set();
    recWaiters = {};
    $('#recVideo').hidden = true;
    $('#recDownload').hidden = $('#recShare').hidden = true;
    recShareFile = null;
    $('#recModal').hidden = false;
    recFrame.src = 'card.html?record#' + code({ music: false });
  }

  function closeRecorder() {
    recStream?.getTracks().forEach(t => t.stop());
    recStream = null;
    $('#recModal').hidden = true;
    recFrame.src = 'about:blank';
    const v = $('#recVideo');
    if (v.src) { URL.revokeObjectURL(v.src); v.removeAttribute('src'); }
  }
  $('#recClose').addEventListener('click', closeRecorder);

  $('#videoBtn').addEventListener('click', async () => {
    if (!cardReady()) return;
    if (!(navigator.mediaDevices?.getDisplayMedia && window.MediaRecorder && window.CropTarget)) {
      toast('Videos need Chrome or Edge on a computer');
      return;
    }
    openRecorder();
    recStatus('Chrome will ask to share this tab: click "Allow" (or "Share"). Only the card is recorded.');
    try {
      // Has to run straight from the click.
      // Full HD at a steady 30 frames: 4K made the computer drop frames, so the video stuttered.
      recStream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: { ideal: 30, max: 30 }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false, preferCurrentTab: true, selfBrowserSurface: 'include', surfaceSwitching: 'exclude' });
    } catch (e) {
      recStatus('Video cancelled. Click "Download video" again and choose Allow.');
      return;
    }
    try { await makeVideo(); }
    catch (e) { recStatus(`Could not make the video: ${e.message}. Close and try again.`); }
    finally { recStream?.getTracks().forEach(t => t.stop()); }
  });

  async function makeVideo() {
    const [track] = recStream.getVideoTracks();
    if (track.getSettings().displaySurface && track.getSettings().displaySurface !== 'browser') throw new Error('please share this tab, not a window or the screen');
    await track.cropTo(await CropTarget.fromElement($('#recStage')));
    recStatus('Getting the card ready…');
    await recWait('ready', 15000);

    // The tab capture is not recorded as it is: it sends frames only when something moves, and its size can change
    // mid-way, which restarts the encoder and left broken frames that WhatsApp would not preview. Each frame is
    // painted onto a fixed 1080×1920 canvas instead, which is recorded at a steady 30 frames a second (as the Video
    // Studio does).
    const live = Object.assign(document.createElement('video'), { muted: true, playsInline: true, srcObject: new MediaStream([track]) });
    await live.play();
    const canvas = Object.assign(document.createElement('canvas'), { width: 1080, height: 1920 }), cx = canvas.getContext('2d');
    let painting = true;
    const paint = () => {
      if (!painting) return;
      const vw = live.videoWidth, vh = live.videoHeight;
      if (vw && vh) {
        // Cropped to the card (9:16, give or take a pixel): fill the frame with it. If the browser did not crop
        // (the whole tab came through), cut the card's own place out of the tab's picture.
        let [sx, sy, sw, sh] = [0, 0, vw, vh];
        if (Math.abs(vw / vh - 9 / 16) > .04) {
          const r = $('#recStage').getBoundingClientRect(), fx = vw / innerWidth, fy = vh / innerHeight;
          [sx, sy, sw, sh] = [r.left * fx, r.top * fy, r.width * fx, r.height * fy];
        }
        cx.drawImage(live, sx, sy, sw, sh, 0, 0, 1080, 1920);
      }
      requestAnimationFrame(paint);
    };
    paint();
    const tracks = [canvas.captureStream(30).getVideoTracks()[0]];
    let box = null;
    if (state.music !== false) {
      box = new MusicBox(design().tempo, design().song);
      if (box.start()) {
        const dest = box.ctx.createMediaStreamDestination();
        box.master.connect(dest);
        tracks.push(...dest.stream.getAudioTracks());
      }
    }
    const mimeType = VIDEO_TYPES.find(t => MediaRecorder.isTypeSupported(t)) || '';
    const recorder = new MediaRecorder(new MediaStream(tracks), { mimeType, videoBitsPerSecond: 3.5e6 }); // a card is mostly still: sharp at 1080p and small enough for WhatsApp
    const chunks = [];
    recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    const stopped = new Promise(r => { recorder.onstop = r; });

    const t0 = Date.now(), expected = 40000;
    const tick = setInterval(() => recStatus(`🔴 Recording… ${Math.round((Date.now() - t0) / 1000)}s. Keep this window open.`, Math.min(0.97, (Date.now() - t0) / expected)), 250);
    recorder.start(500);
    recFrame.contentWindow.postMessage({ wcRecord: 'start' }, '*');
    try { await recWait('done', 75000); }
    finally {
      clearInterval(tick);
      if (recorder.state !== 'inactive') recorder.stop();
      if (box) { box.stop(); box.ctx.close(); }
    }
    await stopped;
    painting = false;
    tracks[0].stop();
    live.srcObject = null;

    let blob = new Blob(chunks, { type: recorder.mimeType });
    // Browsers record a 'fragmented' MP4 that WhatsApp treats as a broken document: rebuild it as a standard
    // MP4 (same video and sound, just re-indexed, with the right length).
    if (recorder.mimeType.includes('mp4')) {
      try { blob = new Blob([MP4Fix.defragment(new Uint8Array(await blob.arrayBuffer()))], { type: 'video/mp4' }); } catch (e) { /* keep it as recorded */ }
    }
    if (!(await playable(blob))) throw new Error('the recording did not come out right (it would not play)');
    const ext = recorder.mimeType.includes('mp4') ? 'mp4' : 'webm';
    const name = `${who(state)} invitation.${ext}`.replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, ' ');
    const url = URL.createObjectURL(blob);
    Object.assign($('#recVideo'), { src: url, hidden: false });
    Object.assign($('#recDownload'), { href: url, download: name, hidden: false });
    $('#recDownload').click();
    recShareFile = new File([blob], name, { type: blob.type.split(';')[0] });
    $('#recShare').hidden = !canShareFile(recShareFile);
    keepVideo(recShareFile);
    recStatus(`✅ Saved "${name}" (${(blob.size / 1048576).toFixed(1)} MB) to your Downloads.` +
      (ext === 'webm' ? ' This browser can only make WebM, which WhatsApp does not accept: update Chrome to get MP4.' : ''), 1);
    toast('Video downloaded 🎬');
  }

  // ---------- Video Studio ----------
  // Story videos painted on a canvas (js/studio.js), on their own full screen: pick a look, the words and the music,
  // watch it, then record it straight from the canvas as an MP4 (no screen sharing, so it also works on a phone).
  const stCanvas = $('#stCanvas');
  const st = { player: null, fplayer: null, card: null, opt: null, t: 0, playing: true, last: 0, raf: 0, rec: null, made: false };
  // The player on screen: a premium film (js/films.js) or a story film / look (js/studio.js)
  const SP = () => (st.opt && st.opt.film ? st.fplayer : st.player);
  const mmss = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const stStatus = (text, progress) => {
    $('#stStatus').textContent = text;
    $('#stRecBar').style.width = progress == null ? '0' : `${Math.round(progress * 100)}%`;
  };

  // The customer orders that carry their details (the website's order form sends everything in the code).
  const studioOrders = () => loadOrders().filter(o => { const r = Catalog.readOrder(o.code); return r && !r.partial && r.card.host1; })
    .sort((a, b) => (a.done - b.done) || (b.received - a.received));

  // Loads a card into the Studio (the one in the editor, or an order's), with fresh words for its occasion.
  // `video`: the look the customer chose on the website, if any (it wins over the occasion's look).
  // Pictures and branding: real photos (Ganesh ji, the couple) or the drawings or none, and whether the video shows
  // the website and "Designed by". The Ganesh ji photo and the brand choice are kept on this PC; a couple's photo is
  // for this video only.
  const ART_KEY = 'weddingcard.studioArt';
  const art = (() => { try { return JSON.parse(localStorage.getItem(ART_KEY)) || {}; } catch (e) { return {}; } })();
  art.photos = {};
  const studioArt = () => ({ brand: art.brand !== false, signature: art.signature !== false, ganeshaArt: art.ganeshaArt || 'photo', coupleArt: art.coupleArt || 'photo', photos: art.photos });
  const saveArt = () => { try { localStorage.setItem(ART_KEY, JSON.stringify({ brand: art.brand, signature: art.signature, ganeshaArt: art.ganeshaArt, coupleArt: art.coupleArt, ganeshaPhoto: art.ganeshaPhoto })); } catch (e) { toast('This photo is too big to remember: it is used for this session only'); } };
  // A photo shrunk to at most 1200 px (sharp in the video, small to keep), as a canvas the video can draw
  const loadPhoto = src => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 1200 / Math.max(img.width, img.height)), cv = document.createElement('canvas');
      cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      resolve(cv);
    };
    img.onerror = () => reject(new Error('not a picture'));
    img.src = src;
  });
  if (art.ganeshaPhoto) loadPhoto(art.ganeshaPhoto).then(cv => { art.photos.ganesha = cv; }).catch(() => {});
  function showArt() {
    const a = studioArt();
    document.querySelectorAll('#stGanesha [data-art]').forEach(b => b.classList.toggle('on', b.dataset.art === a.ganeshaArt));
    document.querySelectorAll('#stCouple [data-art]').forEach(b => b.classList.toggle('on', b.dataset.art === a.coupleArt));
    $('#stBrand').checked = a.brand;
    $('#stSign').checked = a.signature;
  }
  function setArt(change) {
    Object.assign(art, change);
    saveArt();
    if (st.opt) { Object.assign(st.opt, studioArt()); refreshStudio(); }
    showArt();
  }
  for (const [box, key, file] of [['#stGanesha', 'ganeshaArt', '#stGaneshaFile'], ['#stCouple', 'coupleArt', '#stCoupleFile']]) {
    $(box).addEventListener('click', e => {
      const b = e.target.closest('[data-art]');
      if (!b || st.rec) return;
      // The couple's photo has to come from them; Ganesh ji has a real photo built in (an upload replaces it)
      if (b.dataset.art === 'photo' && key === 'coupleArt' && !art.photos.couple) { $(file).click(); return; }
      setArt({ [key]: b.dataset.art });
    });
    $(file).addEventListener('change', e => {
      const f = e.target.files[0];
      e.target.value = '';
      if (!f) return;
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const cv = await loadPhoto(reader.result), which = key === 'ganeshaArt' ? 'ganesha' : 'couple';
          art.photos[which] = cv;
          if (which === 'ganesha') art.ganeshaPhoto = cv.toDataURL('image/jpeg', .86);
          setArt({ [key]: 'photo' });
          toast(which === 'ganesha' ? 'Ganesh ji photo added 🙏' : 'Couple photo added 💑');
        } catch (err) { toast('That file is not a picture. Please choose a JPG or PNG photo.'); }
      };
      reader.readAsDataURL(f);
    });
  }
  $('#stBrand').addEventListener('change', e => { if (!st.rec) setArt({ brand: e.target.checked }); else e.target.checked = !e.target.checked; });
  $('#stSign').addEventListener('change', e => { if (!st.rec) setArt({ signature: e.target.checked }); else e.target.checked = !e.target.checked; });

  // ---- Your own songs ----
  // Every video has a song: by default each look and story film gets one of your songs in turn (neighbours differ),
  // or, while you have none, the look's own tune. The songs stay on this PC and never go to the website.
  let songs = []; // [{ name, bytes, buffer, cut: { start, end } | null }]
  async function decodeSong(name, bytes, cut = null) {
    const AC = window.AudioContext || window.webkitAudioContext, c = new AC();
    try { return { name, bytes, cut, buffer: await c.decodeAudioData(bytes.slice(0)) }; } finally { c.close(); }
  }
  const saveSongs = () => musicStore('put', songs.map(({ name, bytes, cut }) => ({ name, bytes, cut: cut || null })));
  // The song a look gets: its place among the story films and looks, so neighbouring videos never share one
  const songFor = (story, look, film) => {
    if (!songs.length) return null;
    const i = [...Films.LIST.map(f => f.id), ...Object.keys(Studio.STORIES), ...Object.keys(Studio.LOOKS)].indexOf(film || story || look);
    return songs[Math.max(0, i) % songs.length];
  };
  // The song this video plays (if one of yours), and its own tune otherwise
  const videoSong = () => { const m = st.opt.music; return m === 'auto' ? songFor(st.opt.story, st.opt.look, st.opt.film) : /^song:/.test(m) ? songs[+m.slice(5)] || null : null; };
  const videoTune = () => st.opt.film ? Films.byId[st.opt.film].tune : st.opt.story ? Studio.STORIES[st.opt.story].tune : Studio.LOOKS[st.opt.look].music;
  // A tiny IndexedDB store for the songs (too big for localStorage)
  function musicStore(op, value, key = 'songs') {
    return new Promise(resolve => {
      try {
        const req = indexedDB.open('cardalbum-studio', 1);
        req.onupgradeneeded = () => req.result.createObjectStore('music');
        req.onerror = () => resolve(null);
        req.onsuccess = () => {
          const tx = req.result.transaction('music', op === 'get' ? 'readonly' : 'readwrite'), store = tx.objectStore('music');
          const r = op === 'get' ? store.get(key) : store.put(value, key);
          r.onsuccess = () => resolve(r.result || null); r.onerror = () => resolve(null);
        };
      } catch (e) { resolve(null); }
    });
  }
  (async () => {
    // The list of songs (an older single song is taken in too)
    const saved = (await musicStore('get')) || [], old = await musicStore('get', null, 'song');
    if (old && !saved.some(s => s.name === old.name)) saved.push(old);
    for (const s of saved) { try { songs.push(await decodeSong(s.name, s.bytes, s.cut)); } catch (e) { /* a file this browser cannot play */ } }
    if (old) saveSongs();
    if (st.player) { renderMusicChips(); refreshStudio(); }
  })();
  function renderMusicChips() {
    const auto = songs.length ? `🎵 My songs, a different one per video (${songs.length})` : '🎵 The look’s own tune';
    $('#stMusic').innerHTML = [['auto', auto], ...songs.map((s, i) => [`song:${i}`, `🎶 ${s.name}`]), ...(songs.length ? [['look', 'The look’s own tune']] : []),
      ...Object.entries(TUNES).map(([k, T]) => [k, T.label]), ['card', 'The card’s music box']]
      .map(([k, label]) => `<button type="button" class="chip" data-music="${k}">${esc(label)}</button>`).join('')
      + (songs.length ? '<button type="button" class="chip" data-music-clear>🗑 Remove my songs</button>' : '');
    $('#stSongNow').textContent = songNow();
  }
  // Which music this video gets, in words
  function songNow() {
    if (!st.opt) return '';
    const m = st.opt.music, s = videoSong(), cut = s && s.cut ? ` (${mmss(s.cut.start)}–${mmss(s.cut.end)})` : '';
    return s ? `This video’s song: ${s.name}${cut}` : m === 'card' ? 'This video’s music: the card’s music box'
      : `This video’s music: ${TUNES[TUNES[m] ? m : videoTune()].label}`;
  }

  // `video`: the look or story film the customer chose on the website, if any (it wins over the occasion's look);
  // `lang`: the language they asked for.
  function studioLoad(card, video, lang) {
    // The same order in another language keeps what was set for its screens; another order starts afresh
    const same = st.card === card && st.opt;
    st.card = card;
    st.lang = lang === 'hi' || lang === 'en' ? lang : st.lang || 'en';
    const auto = Studio.defaults(st.card, st.lang);
    const kept = st.picked && st.opt;
    const film = Films.byId[video] ? video : Studio.STORIES[video] || Studio.LOOKS[video] ? '' : st.opt ? st.opt.film || '' : '';
    const story = Studio.STORIES[video] ? video : kept ? st.opt.story : '';
    // The look the occasion suits, unless one was picked by hand in this visit
    const look = story ? Studio.STORIES[story].open : Studio.LOOKS[video] ? video : kept ? st.opt.look : auto.look;
    st.opt = { ...auto, look, story, film, music: st.opt ? st.opt.music : 'auto', ...studioArt(),
      screens: same ? st.opt.screens : [], swapNames: same ? st.opt.swapNames : false };
    document.querySelectorAll('#stLang [data-lang]').forEach(b => b.classList.toggle('on', b.dataset.lang === st.lang));
    $('#stWho').textContent = `${who(st.card)} · ${occasion(st.card).label}`;
    $('#stBless').checked = st.opt.blessing;
    $('#stBlessText').value = st.opt.blessingText;
    $('#stInvite').value = st.opt.inviteLine;
    $('#stParents').checked = st.opt.parents;
    renderNameOrder();
    renderScreens();
    st.t = 0;
    if (st.player) refreshStudio();
  }

  // Whose name comes first: as in the order, or the other way round (the bride's first, or the groom's)
  function renderNameOrder() {
    const a = (st.card.host1 || '').trim(), b = (st.card.host2 || '').trim();
    $('#stNameOrder').innerHTML = b ? [[false, a], [true, b]].map(([swap, n]) =>
      `<button type="button" class="chip${!!st.opt.swapNames === swap ? ' on' : ''}" data-swap="${swap}">${esc(n)} first</button>`).join('')
      : '<small class="muted">Only one name in this order</small>';
  }
  $('#stNameOrder').addEventListener('click', e => {
    const b = e.target.closest('[data-swap]');
    if (!b || st.rec) return;
    st.opt.swapNames = b.dataset.swap === 'true';
    renderNameOrder(); refreshStudio();
  });

  // What each function's screen shows: the order's own details by default; any line can be changed or left out,
  // and a quote added (suggestions for that function in the video's language).
  const studioEvents = () => (st.card.events || []).filter(e => e && String(e.name || '').trim()).slice(0, 6);
  function renderScreens() {
    const evs = studioEvents(), sc = st.opt.screens;
    if (!evs.length) { $('#stScreens').innerHTML = '<small class="muted">This order has no functions.</small>'; return; }
    const val = (i, k, d) => (sc[i] && sc[i][k] != null ? sc[i][k] : d);
    const box = (i, k, label) => `<label class="st-check"><input type="checkbox" data-i="${i}" data-k="${k}"${val(i, k, true) !== false ? ' checked' : ''}> ${label}</label>`;
    $('#stScreens').innerHTML = `<span class="muted">Function screens: what each one shows</span>` + evs.map((e, i) => {
      const d = Core.parseDate(e.date);
      return `<details class="st-screen" data-i="${i}"><summary>${esc(e.name)}${d ? ` · ${esc(d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }))}` : ''}</summary>
        <label>Line above <input data-i="${i}" data-k="top" maxlength="60" value="${esc(val(i, 'top', Studio.eventTop(st.lang)))}"></label>
        <label>Heading <input data-i="${i}" data-k="title" maxlength="40" value="${esc(val(i, 'title', ''))}" placeholder="${esc(e.name)}"></label>
        <label>Venue line <input data-i="${i}" data-k="venue" maxlength="120" value="${esc(val(i, 'venue', e.venue || ''))}"></label>
        <label>Quote <textarea data-i="${i}" data-k="quote" rows="2" maxlength="120" placeholder="Pick one below or write your own">${esc(val(i, 'quote', ''))}</textarea></label>
        <div class="chips st-quotes">${Studio.quotesFor(e.name, st.lang).map(q => `<button type="button" class="chip" data-i="${i}" data-quote="${esc(q)}">${esc(q)}</button>`).join('')}</div>
        <div class="st-shows">${box(i, 'date', 'Date')}${box(i, 'time', 'Time')}${box(i, 'venue', 'Venue')}${box(i, 'dress', 'Dress code')}${box(i, 'couple', 'Couple picture')}</div>
      </details>`;
    }).join('');
  }
  const setScreen = (i, k, v) => { (st.opt.screens[i] = st.opt.screens[i] || {})[k] = v; refreshStudio(); };
  // The video jumps to the screen being edited, so the change shows straight away
  const showScreen = i => { const sc = st.player && st.player.tl.scenes.find(s => s.k === 'event' && s.i === +i); if (sc) st.t = sc.t0 + sc.d * .6; };
  $('#stScreens').addEventListener('input', e => {
    const t = e.target;
    if (!t.dataset.k || st.rec) return;
    setScreen(+t.dataset.i, t.dataset.k, t.type === 'checkbox' ? t.checked : t.value);
    showScreen(t.dataset.i);
  });
  $('#stScreens').addEventListener('click', e => {
    const q = e.target.closest('[data-quote]');
    if (!q || st.rec) return;
    const ta = $(`#stScreens textarea[data-i="${q.dataset.i}"]`);
    ta.value = q.dataset.quote;
    setScreen(+q.dataset.i, 'quote', q.dataset.quote);
    showScreen(q.dataset.i);
  });
  $('#stScreens').addEventListener('toggle', e => { if (e.target.open) showScreen(e.target.dataset.i); }, true);
  const orderVideo = code => (code && (Catalog.readOrder(code) || {}).video) || '';
  const orderLang = code => (code && (Catalog.readOrder(code) || {}).videoLang) || '';
  function orderCard(code) {
    const r = Catalog.readOrder(code);
    return { ...Core.blankCard(), ...r.card, theme: r.card.theme || design().no };
  }

  async function openStudio() {
    st.picked = false;
    st.details = null; // set again by a card's details or the last project
    const orders = studioOrders();
    if (state.host1 && !cardReady()) return;
    $('#stOrder').innerHTML = (state.host1 ? `<option value="">✏️ The invite in the editor: ${esc(who(state))}</option>` : '') +
      orders.map(o => `<option value="${esc(o.code)}">${o.done ? '✓ ' : '🆕 '}${esc(o.name)} · ${esc(occasion(o).label)}${Catalog.refOf(o.code) ? ` · ${Catalog.refOf(o.code)}` : ''}</option>`).join('');
    if (stLoadDraft()) resumeDraft(); // the project left here last time comes back as it was (the list above still opens the editor's invite or an order)
    else if (state.host1) studioLoad(clone(state), '', '');
    else if (orders.length) studioLoad(orderCard(orders[0].code), orderVideo(orders[0].code), orderLang(orders[0].code));
    else studioLoad({ ...Core.blankCard(), ...Studio.sample('vrindavan') }, Films.LIST[0].id, 'en'); // a sample until a card PDF is added
    $('#stVideo').hidden = $('#stDownload').hidden = $('#stShare').hidden = true;
    stShareFile = null;
    stStatus(st.resumed ? '📂 Your last project is back, just as you left it. Make the video, or change anything first.' : 'Watch it on the left, then make the video. It records in real time, so keep this tab open.');
    st.resumed = false;
    $('#stResume').hidden = !stLoadDraft() || !!st.details;
    // the list shows with orders, or when the last project opened over the editor's invite (to switch to it)
    $('#stOrderRow').hidden = !orders.length && !(st.details && state.host1);
    $('#studio').hidden = false;
    document.body.classList.add('studio-open');
    showArt();
    // Make video waits for this too: its frames come from the preview loop started below
    // the preview starts once the Studio's letters are in; the premium films' letters keep loading meanwhile
    // (a video waits for both before it records)
    st.filmFonts = st.filmFonts || Films.fontsReady();
    st.ready = Studio.fontsReady();
    // The preview starts at once (Safari took ~8s to fetch every letter); when the letters arrive, the
    // screens are laid out again with them. Recording still waits for st.ready / st.filmFonts.
    const relayout = () => { if (!$('#studio').hidden && st.player && !st.rec) refreshStudio(); };
    st.ready.then(relayout, () => {});
    st.filmFonts.then(relayout, () => {});
    st.player = st.player || new Studio.Player(stCanvas);
    st.fplayer = st.fplayer || new Films.Player(stCanvas, 1);
    st.t = 0;
    st.playing = true;
    refreshStudio();
    renderLooks();
    cancelAnimationFrame(st.raf);
    st.last = performance.now();
    st.raf = requestAnimationFrame(studioFrame);
  }
  function closeStudio() {
    if (st.rec) return toast('Please wait: the video is still recording');
    if (st.details) { stSaveDraft(); toast('💾 Saved: your project opens here next time'); }
    soundOff(); stopCropSound();
    $('#stSound').textContent = '🔇';
    cancelAnimationFrame(st.raf);
    $('#studio').hidden = true;
    document.body.classList.remove('studio-open');
    const v = $('#stVideo');
    if (v.src) { URL.revokeObjectURL(v.src); v.removeAttribute('src'); }
  }

  // Applies the chosen options; the preview keeps its place.
  function refreshStudio() {
    if (st.details) setTimeout(stSaveDraft);
    if (st.opt.film) st.fplayer.set(st.opt.film, st.lang, st.card, filmOpts());
    else st.player.set(st.card, st.opt, cfg.site);
    const P = SP();
    st.t = Math.min(st.t, P.total - .05);
    $('#stScenes').innerHTML = P.tl.scenes.map((s, i) =>
      `<button type="button" class="st-seg" data-scene="${i}" style="flex:${s.d.toFixed(2)} 1 0"><span>${esc(st.opt.film ? Films.SCENE_NAME[s.k] + (s.k === 'day' && s.n > 1 ? ' ' + (s.i + 1) : '') : Studio.sceneName(s))}</span></button>`).join('');
    document.querySelectorAll('#stEvents [data-ev]').forEach(b => b.classList.toggle('on', b.dataset.ev === st.opt.events));
    document.querySelectorAll('#stMusic [data-music]').forEach(b => b.classList.toggle('on', b.dataset.music === st.opt.music));
    $('#stSongNow').textContent = songNow();
    const scene = Studio.LOOKS[st.opt.look].scene;
    document.querySelectorAll('#stFilms [data-film]').forEach(b => b.classList.toggle('on', b.dataset.film === st.opt.film));
    document.querySelectorAll('#stStories [data-story]').forEach(b => b.classList.toggle('on', !st.opt.film && b.dataset.story === st.opt.story));
    document.querySelectorAll('#stLooks [data-look]').forEach(b => b.classList.toggle('on', !st.opt.film && !st.opt.story && b.dataset.look === scene));
    renderCrop();
    $('#stMoods').innerHTML = st.opt.story || st.opt.film ? '' : Object.entries(Studio.LOOKS).filter(([, L]) => L.scene === scene)
      .map(([id, L]) => `<button type="button" class="chip${id === st.opt.look ? ' on' : ''}" data-look="${id}">${esc(L.mood)}</button>`).join('');
  }

  // The ten scenes as buttons with their painted picture (drawn one by one, so the screen never freezes);
  // the chosen scene's three moods show as chips under them.
  function renderLooks() {
    const box = $('#stLooks');
    if (box.children.length) return;
    box.innerHTML = Studio.SCENES.map(id => { const L = Studio.LOOKS[id];
      return `<button type="button" class="st-look" data-look="${id}" title="${esc(L.note)}"><canvas width="135" height="240"></canvas><span>${esc(L.name)}</span></button>`; }).join('');
    $('#stStories').innerHTML = Object.entries(Studio.STORIES).map(([id, S]) =>
      `<button type="button" class="st-look" data-story="${id}" data-look="${S.title}" title="${esc(S.note)} · ${esc(TUNES[S.tune].label)}"><canvas width="135" height="240"></canvas><span>${esc(S.name)}</span></button>`).join('');
    $('#stFilms').innerHTML = Films.LIST.map(f => `<button type="button" class="st-film" data-film="${f.id}" title="${esc(Films.describe(f))}"><img src="img/films/${f.id}.jpg" alt="" loading="lazy" width="135" height="240"><span>${esc(f.name)}</span></button>`).join('');
    renderMusicChips();
    // Painted after the preview has started, one at a time in idle moments, so the preview never stalls
    const idle = fn => (window.requestIdleCallback ? requestIdleCallback(fn, { timeout: 800 }) : setTimeout(fn, 60));
    // ...and only once its tile is actually on screen (they sit in the Look tab, hidden when the Studio opens)
    const paint = b => idle(() => Studio.thumb(b.dataset.look, b.querySelector('canvas')));
    const tiles = [...box.querySelectorAll('[data-look]'), ...$('#stStories').querySelectorAll('[data-look]')];
    if ('IntersectionObserver' in window) {
      const seen = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { seen.unobserve(e.target); paint(e.target); } }), { rootMargin: '200px' });
      tiles.forEach(b => seen.observe(b));
    } else tiles.forEach((b, i) => setTimeout(() => paint(b), 1200 + i * 250));
    refreshStudio();
  }

  function studioFrame(now) {
    // The preview keeps real time, even when a frame comes late (only a long pause, like a hidden tab, is skipped)
    const p = SP(), dt = Math.max(0, Math.min(.5, (now - st.last) / 1000));
    st.last = now;
    if (st.rec) st.t = Math.max(0, now - st.rec.t0) / 1000;
    else if (st.playing) st.t = (st.t + dt) % p.total;
    const scene = p.draw(st.t);
    $('#stBar').style.width = `${Math.min(100, st.t / p.total * 100)}%`;
    $('#stHeadMark').style.left = `${Math.min(100, st.t / p.total * 100)}%`;
    $('#stTime').textContent = `${mmss(st.t)} / ${mmss(p.total)}`;
    const on = p.tl.scenes.indexOf(scene);
    document.querySelectorAll('#stScenes [data-scene]').forEach(b => b.classList.toggle('on', +b.dataset.scene === on));
    if (st.rec && st.t >= p.total) st.rec.done();
    st.raf = requestAnimationFrame(studioFrame);
  }

  document.querySelectorAll('[data-studio]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); openStudio(); }));
  $('#stClose').addEventListener('click', closeStudio);
  // The options in tabs: Look, Pictures, Words, Functions, Music (the order, language and Make video stay in view)
  $('#stTabs').addEventListener('click', e => {
    const b = e.target.closest('[data-tab]');
    if (!b) return;
    document.querySelectorAll('#stTabs [data-tab]').forEach(x => x.classList.toggle('on', x === b));
    document.querySelectorAll('.st-tab').forEach(t => { t.hidden = t.dataset.tab !== b.dataset.tab; });
  });
  $('#stPlay').addEventListener('click', () => { if (st.rec) return; st.playing = !st.playing; showPlay(); });
  // The timeline: press and drag anywhere to look at that moment (the video holds still while dragging)
  const scrubAt = e => { const r = $('#stScrub').getBoundingClientRect(); return Math.max(0, Math.min(.999, (e.clientX - r.left) / r.width)) * SP().total; };
  let scrubbing = null, scrubMoved = false;
  $('#stScrub').addEventListener('pointerdown', e => {
    if (st.rec || !SP()) return;
    scrubbing = { was: st.playing, x: e.clientX }; scrubMoved = false;
    st.playing = false; st.t = scrubAt(e);
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  $('#stScrub').addEventListener('pointermove', e => {
    if (!SP()) return;
    const t = scrubAt(e), h = $('#stHover');
    h.textContent = mmss(t); h.style.left = `${t / SP().total * 100}%`;
    if (scrubbing) { st.t = t; if (Math.abs(e.clientX - scrubbing.x) > 4) scrubMoved = true; }
  });
  const endScrub = () => { if (!scrubbing) return; st.playing = scrubbing.was; scrubbing = null; showPlay(); };
  $('#stScrub').addEventListener('pointerup', endScrub);
  $('#stScrub').addEventListener('pointercancel', endScrub);
  // Screen by screen, and 5 seconds back or on
  const sceneIndex = () => { const S = SP().tl.scenes; let i = S.findIndex(s => st.t < s.t0 + s.d); return i < 0 ? S.length - 1 : i; };
  const jump = t => { if (!st.rec && SP()) st.t = Math.max(0, Math.min(SP().total - .05, t)); };
  const prevScene = () => { const S = SP().tl.scenes, i = sceneIndex(); jump(st.t - S[i].t0 > 1 || !i ? S[i].t0 + .01 : S[i - 1].t0 + .01); };
  const nextScene = () => { const S = SP().tl.scenes, i = sceneIndex(); if (S[i + 1]) jump(S[i + 1].t0 + .01); };
  function showPlay() {
    $('#stPlay').textContent = st.playing ? '❚❚' : '▶';
    $('#stPlay').setAttribute('aria-label', st.playing ? 'Pause' : 'Play');
  }
  $('#stPrev').addEventListener('click', prevScene);
  $('#stNext').addEventListener('click', nextScene);
  $('#stBack').addEventListener('click', () => jump(st.t - 5));
  $('#stFwd').addEventListener('click', () => jump(st.t + 5));
  document.addEventListener('keydown', e => {
    if ($('#studio').hidden || !$('#pickSheet').hidden || e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable) return;
    const k = e.key;
    if (k === ' ') { e.preventDefault(); if (!st.rec) { st.playing = !st.playing; showPlay(); } }
    else if (k === 'ArrowLeft') { e.preventDefault(); jump(st.t - (e.shiftKey ? 1 : 5)); }
    else if (k === 'ArrowRight') { e.preventDefault(); jump(st.t + (e.shiftKey ? 1 : 5)); }
    else if (k === 'j' || k === 'J') prevScene();
    else if (k === 'l' || k === 'L') nextScene();
    else if (k === 'Home') jump(0);
    else if (k === 'End') jump(SP().total);
    else if (k === 'm' || k === 'M') $('#stSound').click();
    else if (k === 'Escape' && !st.rec) closeStudio();
  });
  // A tap on a screen's block (without dragging) starts that screen
  $('#stScenes').addEventListener('click', e => {
    const b = e.target.closest('[data-scene]');
    if (!b || st.rec || scrubMoved) return;
    st.t = SP().tl.scenes[+b.dataset.scene].t0 + .01;
  });
  const pickLook = e => {
    const b = e.target.closest('[data-look]');
    if (!b || st.rec) return;
    st.opt.film = '';
    st.opt.story = b.dataset.story || '';
    st.opt.look = st.opt.story ? Studio.STORIES[st.opt.story].open : b.dataset.look;
    st.picked = true;
    refreshStudio();
    if (previewSound && (st.opt.music === 'look' || st.opt.music === 'auto')) soundOn();
  };
  $('#stStories').addEventListener('click', pickLook);
  $('#stFilms').addEventListener('click', e => {
    const b = e.target.closest('[data-film]');
    if (!b || st.rec) return;
    st.opt.film = b.dataset.film; st.picked = true; st.t = 0;
    refreshStudio();
    if (previewSound && (st.opt.music === 'look' || st.opt.music === 'auto')) soundOn();
  });
  // English or Hindi: every fixed word, the dates and times, and the invitation line follow
  $('#stLang').addEventListener('click', e => {
    const b = e.target.closest('[data-lang]');
    if (!b || st.rec) return;
    st.picked = true;
    studioLoad(st.card, '', b.dataset.lang);
  });
  $('#stLooks').addEventListener('click', pickLook);
  $('#stMoods').addEventListener('click', pickLook);
  $('#stEvents').addEventListener('click', e => {
    const b = e.target.closest('[data-ev]');
    if (b && !st.rec) { st.opt.events = b.dataset.ev; refreshStudio(); }
  });
  $('#stMusic').addEventListener('click', e => {
    if (st.rec) return;
    if (e.target.closest('[data-music-clear]')) {
      if (!confirm(`Remove your ${songs.length} song${songs.length === 1 ? '' : 's'} from this PC? The videos go back to the looks’ own tunes.`)) return;
      songs = []; saveSongs(); st.opt.music = 'auto';
      renderMusicChips(); refreshStudio(); if (previewSound) soundOn();
      return;
    }
    const b = e.target.closest('[data-music]');
    if (!b) return;
    st.opt.music = b.dataset.music; refreshStudio(); if (previewSound) soundOn();
  });
  // Your own songs (several at once): decoded once, kept on this PC (IndexedDB) so they are there next time too
  $('#stMusicFile').addEventListener('change', async e => {
    const files = [...e.target.files];
    e.target.value = '';
    let added = 0;
    for (const f of files) {
      const name = f.name.replace(/\.[^.]+$/, '');
      if (songs.some(s => s.name === name)) continue;
      try { songs.push(await decodeSong(name, await f.arrayBuffer())); added++; }
      catch (err) { toast(`“${name}” is not a song this browser can play. Please choose an MP3, M4A or WAV.`); }
    }
    if (!added) return;
    saveSongs();
    st.opt.music = `song:${songs.length - added}`; // the first new song plays in this video
    renderMusicChips();
    refreshStudio(); if (previewSound) soundOn();
    toast(`🎵 ${added === 1 ? 'Song added' : added + ' songs added'}: cut the part you want below`);
  });
  [['stBless', 'blessing', 'checked'], ['stBlessText', 'blessingText', 'value'], ['stInvite', 'inviteLine', 'value'], ['stParents', 'parents', 'checked']]
    .forEach(([id, key, prop]) => $('#' + id).addEventListener('input', e => {
      if (st.rec) return;
      st.opt[key] = e.target[prop];
      refreshStudio();
    }));

  // The music for the video (always some): one of your songs, a story tune (js/tunes.js) or the card's music box.
  function studioMusic() {
    const m = st.opt.music, song = videoSong();
    if (song) { const f = new FileTune(song.buffer, song.cut); return f.start() ? f : null; }
    if (m === 'card') { const b = new MusicBox(design().tempo, design().song); return b.start() ? b : null; }
    const t = new Tune(TUNES[m] ? m : videoTune());
    return t.start() ? t : null;
  }
  // 🔊 on the preview: hear the music while watching (it follows the music choice)
  let previewSound = null;
  function soundOff() { if (previewSound) { previewSound.stop(); if (previewSound.close) previewSound.close(); else previewSound.ctx.close(); previewSound = null; } }
  function soundOn() { soundOff(); previewSound = studioMusic(); }
  $('#stSound').addEventListener('click', () => {
    const on = !previewSound && !st.rec;
    if (on) soundOn(); else soundOff();
    $('#stSound').textContent = previewSound ? '🔊' : '🔇';
    $('#stSound').setAttribute('aria-label', previewSound ? 'Sound off' : 'Sound on');
  });

  $('#stOrder').addEventListener('change', e => {
    if (st.rec) return;
    st.details = null; // another card: the saved project stays as it was (the 📂 button brings it back)
    studioLoad(e.target.value ? orderCard(e.target.value) : clone(state), orderVideo(e.target.value), orderLang(e.target.value));
    $('#stResume').hidden = !stLoadDraft();
  });
  // One tap: take the chosen order's details and make the video straight away.
  $('#stAuto').addEventListener('click', () => {
    if (st.rec) return;
    const code = $('#stOrder').value;
    studioLoad(code ? orderCard(code) : clone(state), orderVideo(code), orderLang(code));
    const when = Core.parseDate(st.card.date);
    if (when && when < new Date(new Date().toDateString())) return stStatus('⚠️ This order’s date has already passed. Please check the date with the customer first.');
    makeStudioVideo();
  });

  $('#stMake').addEventListener('click', () => makeStudioVideo());
  $('#stCancel').addEventListener('click', () => { if (st.rec) { st.rec.cancelled = true; st.rec.done(); } });
  async function makeStudioVideo() {
    if (st.rec) return;
    await st.ready; // the Studio may still be opening (a tap straight after opening it)
    if (st.opt.film) { stStatus('Getting the film’s letters ready…'); await st.filmFonts; }
    if (!(window.MediaRecorder && stCanvas.captureStream)) return stStatus('This browser cannot make videos. Please use Chrome, Edge or Safari.');
    const btn = $('#stMake');
    btn.disabled = $('#stAuto').disabled = true;
    $('#stVideo').hidden = $('#stDownload').hidden = $('#stShare').hidden = true;
    stShareFile = null;
    let box = null;
    const hadSound = !!previewSound;
    soundOff();
    try {
      const stream = stCanvas.captureStream(30);
      box = studioMusic();
      if (box) {
        const dest = box.ctx.createMediaStreamDestination();
        box.master.connect(dest);
        dest.stream.getAudioTracks().forEach(tr => stream.addTrack(tr));
        if (box.fadeOut) box.fadeOut(SP().total - 2.6, 2.4); // the music fades away with the closing scene
      }
      const mimeType = VIDEO_TYPES.find(t => MediaRecorder.isTypeSupported(t)) || '';
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType, videoBitsPerSecond: 5e6 } : { videoBitsPerSecond: 5e6 });
      const chunks = [];
      recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      const stopped = new Promise(r => { recorder.onstop = r; });
      const total = SP().total;
      const rec = { t0: performance.now(), cancelled: false };
      $('#stCancel').hidden = false;
      await new Promise(resolve => {
        rec.done = resolve;
        st.rec = rec;
        recorder.start(500);
        const tick = setInterval(() => {
          if (!st.rec) return clearInterval(tick);
          const left = Math.max(0, Math.ceil(total - st.t));
          stStatus(`🔴 Recording… ${mmss(st.t)} / ${mmss(total)} · ${left}s left. Keep this tab open.`, Math.min(.99, st.t / total));
        }, 250);
      });
      st.rec = null;
      $('#stCancel').hidden = true;
      recorder.stop();
      await stopped;
      if (rec.cancelled) { stStatus('Stopped. Nothing was saved: change anything you like, then make the video again.', 0); toast('Recording stopped'); return; }
      const type = recorder.mimeType || mimeType || 'video/webm';
      let blob = new Blob(chunks, { type });
      // Browsers record a 'fragmented' MP4 that WhatsApp treats as a broken document: rebuild it as a standard MP4.
      if (type.includes('mp4')) {
        try { blob = new Blob([MP4Fix.defragment(new Uint8Array(await blob.arrayBuffer()))], { type: 'video/mp4' }); } catch (e) { /* keep it as recorded */ }
      }
      if (!(await playable(blob))) throw new Error('the recording did not come out right (it would not play)');
      const ext = type.includes('mp4') ? 'mp4' : 'webm';
      const name = `${who(st.card)} ${st.opt.film ? Films.byId[st.opt.film].name : st.opt.story ? Studio.STORIES[st.opt.story].name : Studio.LOOKS[st.opt.look].name} ${st.lang === 'hi' ? 'Hindi' : 'English'} video.${ext}`.replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, ' ');
      const url = URL.createObjectURL(blob);
      const v = $('#stVideo');
      if (v.src) URL.revokeObjectURL(v.src);
      Object.assign(v, { src: url, hidden: false });
      Object.assign($('#stDownload'), { href: url, download: name, hidden: false });
      $('#stDownload').click();
      stShareFile = new File([blob], name, { type: type.split(';')[0] });
      $('#stShare').hidden = !canShareFile(stShareFile);
      keepVideo(stShareFile);
      stStatus(`✅ Saved "${name}" (${(blob.size / 1048576).toFixed(1)} MB) to your Downloads.` +
        (ext === 'webm' ? ' This browser can only make WebM, which WhatsApp does not accept: please update Chrome to get MP4.' : ''), 1);
      toast('Video downloaded 🎬');
      if (window.Fun) Fun.burst(null, null, 140);
      st.made = true;
      $('#stRemake').hidden = false;
    } catch (e) {
      st.rec = null;
      $('#stCancel').hidden = true;
      stStatus(`Could not make the video: ${e.message}. Please try again.`);
    } finally {
      if (box) { box.stop(); if (box.close) box.close(); else box.ctx.close(); }
      btn.disabled = $('#stAuto').disabled = false;
      if (hadSound) soundOn();
    }
  }

  // ---------- Text & branding ----------
  // The strip at the bottom (designer line, website, both or nothing, in any words), the film's screens, the venue.
  const BRAND_KEY = 'cardalbum.studio.brand', BRAND0 = { strip: 'both', credit: 'Designed by Sankalp', site: 'cardalbum.vercel.app', skip: [], venueStyle: 'full' };
  let brand = { ...BRAND0 };
  try { brand = { ...BRAND0, ...JSON.parse(localStorage.getItem(BRAND_KEY) || '{}') }; } catch (e) { /* first visit */ }
  const hasCredit = () => brand.strip === 'both' || brand.strip === 'credit', hasSite = () => brand.strip === 'both' || brand.strip === 'site';
  const filmOpts = () => ({ credit: hasCredit() ? brand.credit.trim() : '', site: hasSite() ? brand.site.trim() : '', skip: brand.skip, venueStyle: brand.venueStyle });
  function renderBrand() {
    document.querySelectorAll('#stStrip [data-strip]').forEach(b => b.classList.toggle('on', b.dataset.strip === brand.strip));
    document.querySelectorAll('#stVenueStyle [data-venue]').forEach(b => b.classList.toggle('on', b.dataset.venue === brand.venueStyle));
    document.querySelectorAll('#stSkip [data-skip]').forEach(c => { c.checked = !brand.skip.includes(c.dataset.skip); });
    if (document.activeElement !== $('#stCredit')) $('#stCredit').value = brand.credit;
    if (document.activeElement !== $('#stSiteText')) $('#stSiteText').value = brand.site;
    $('#stCredit').disabled = !hasCredit(); $('#stSiteText').disabled = !hasSite();
    const o = filmOpts();
    $('#stStripDemo').innerHTML = o.credit || o.site ? `<span><i>${esc(o.credit)}</i>${o.credit && o.site ? ' • ' : ''}<b>${esc(o.site)}</b></span>` : '<small class="muted">No strip at the bottom</small>';
  }
  function setBrand(change) {
    if (st.rec) return;
    Object.assign(brand, change);
    try { localStorage.setItem(BRAND_KEY, JSON.stringify(brand)); } catch (e) { /* private window */ }
    // story films and looks: the designer line and the website (QR) on or off
    if (art.signature !== hasCredit() || art.brand !== hasSite()) setArt({ signature: hasCredit(), brand: hasSite() });
    renderBrand();
    if (st.opt) refreshStudio();
  }
  $('#stStrip').addEventListener('click', e => { const b = e.target.closest('[data-strip]'); if (b) setBrand({ strip: b.dataset.strip }); });
  $('#stVenueStyle').addEventListener('click', e => { const b = e.target.closest('[data-venue]'); if (b) setBrand({ venueStyle: b.dataset.venue }); });
  $('#stSkip').addEventListener('change', () => setBrand({ skip: [...document.querySelectorAll('#stSkip [data-skip]')].filter(c => !c.checked).map(c => c.dataset.skip) }));
  $('#stCredit').addEventListener('input', e => setBrand({ credit: e.target.value }));
  $('#stSiteText').addEventListener('input', e => setBrand({ site: e.target.value }));
  $('#stBrandReset').addEventListener('click', () => setBrand({ strip: 'both', credit: BRAND0.credit, site: BRAND0.site }));
  renderBrand();

  // ---------- Card PDF → video ----------
  // Drop a card PDF: its details are read (PdfCard) into a form to check, and a picker asks which video to make;
  // the video is then made by itself with those details.
  const stepTo = tab => {
    document.querySelectorAll('#stTabs [data-tab]').forEach(x => x.classList.toggle('on', x.dataset.tab === tab));
    document.querySelectorAll('.st-tab').forEach(t => { t.hidden = t.dataset.tab !== tab; });
  };
  const pdfStatus = (msg, bad) => { const p = $('#stPdfStatus'); p.hidden = !msg; p.textContent = msg || ''; p.classList.toggle('bad', !!bad); };
  $('#fType').innerHTML = Object.entries(PRESETS).map(([k, P]) => `<option value="${k}">${esc(P.label || k)}</option>`).join('');
  function evRow(e = {}) {
    return `<div class="st-ev"><input data-f="name" placeholder="Function (e.g. Haldi)" maxlength="40" value="${esc(e.name || '')}">
      <input data-f="date" type="datetime-local" value="${esc(/T/.test(e.date || '') ? e.date : e.date ? e.date + 'T00:00' : '')}">
      <input data-f="venue" placeholder="Venue (if different)" maxlength="120" value="${esc(e.venue || '')}">
      <button type="button" class="btn-small danger" data-ev-del title="Remove">✕</button></div>`;
  }
  function fillDetails(d, pictures = []) {
    $('#fType').value = PRESETS[d.type] ? d.type : 'wedding';
    $('#fLang').value = d.lang === 'hi' ? 'hi' : 'en';
    $('#fHost1').value = d.host1 || ''; $('#fHost2').value = d.host2 || '';
    $('#fParents1').value = d.parents1 || ''; $('#fParents2').value = d.parents2 || '';
    $('#fEvents').innerHTML = (d.events.length ? d.events : [{}]).map(evRow).join('');
    $('#fVenue').value = d.venue || ''; $('#fAddress').value = d.address || '';
    $('#fPhones').value = (d.phones || []).join(', ');
    $('#stPages').innerHTML = pictures.map((u, i) => `<a href="${u}" target="_blank" rel="noopener" title="Page ${i + 1}"><img src="${u}" alt="Card page ${i + 1}"></a>`).join('');
    $('#stForm').hidden = false;
  }
  function readDetails() {
    const evs = [...document.querySelectorAll('#fEvents .st-ev')].map(r => ({ name: r.querySelector('[data-f="name"]').value.trim(),
      date: r.querySelector('[data-f="date"]').value.replace(/T00:00$/, ''), venue: r.querySelector('[data-f="venue"]').value.trim() })).filter(e => e.name);
    return { type: $('#fType').value, lang: $('#fLang').value, host1: $('#fHost1').value.trim(), host2: $('#fHost2').value.trim(),
      parents1: $('#fParents1').value.trim(), parents2: $('#fParents2').value.trim(), events: evs, venue: $('#fVenue').value.trim(),
      address: $('#fAddress').value.trim(), phones: $('#fPhones').value.split(/[,;]+/).map(x => x.trim()).filter(Boolean), hashtag: (st.pdf && st.pdf.hashtag) || '' };
  }
  // The details into the Studio (the chosen video stays)
  function useDetails() {
    const d = readDetails();
    if (!d.host1) { toast('Please write at least the first name'); $('#fHost1').focus(); return false; }
    studioLoad({ ...Core.blankCard(), ...PdfCard.toCard(d), theme: design().no }, '', d.lang);
    st.details = d;
    stSaveDraft();
    $('#stResume').hidden = true;
    return true;
  }
  // ---------- Draft: the project in the Studio is kept, so leaving never loses it ----------
  const ST_DRAFT = 'cardalbum.studio.draft';
  function stSaveDraft() {
    if (!st.details || !st.opt) return;
    try { localStorage.setItem(ST_DRAFT, JSON.stringify({ details: st.details, video: st.opt.film || st.opt.story || st.opt.look || '', lang: st.lang, at: Date.now() })); } catch (e) { /* storage full or blocked */ }
  }
  function stLoadDraft() {
    try { const d = JSON.parse(localStorage.getItem(ST_DRAFT) || 'null'); return d && d.details && d.details.host1 ? d : null; } catch (e) { return null; }
  }
  function resumeDraft() {
    const d = stLoadDraft();
    if (!d) return false;
    fillDetails(d.details);
    studioLoad({ ...Core.blankCard(), ...PdfCard.toCard(d.details), theme: design().no }, d.video, d.lang);
    st.details = d.details; st.picked = true; st.resumed = true;
    if (st.player) refreshStudio();
    return true;
  }
  $('#stResume').addEventListener('click', () => {
    if (st.rec) return toast('Please wait: a video is still recording');
    if (resumeDraft()) { $('#stResume').hidden = true; stStatus('📂 Your last project is back, just as you left it.'); toast('📂 Last project opened'); }
  });
  $('#fEvents').addEventListener('click', e => { const b = e.target.closest('[data-ev-del]'); if (b) b.parentElement.remove(); });
  $('#fAddEv').addEventListener('click', () => $('#fEvents').insertAdjacentHTML('beforeend', evRow()));
  $('#stForm').addEventListener('submit', e => { e.preventDefault(); if (st.rec) return; if (useDetails()) { stepTo('look'); toast('✅ Details in: now pick a style'); } });
  $('#fPick').addEventListener('click', () => { if (!st.rec && useDetails()) openPick(); });
  async function readPdf(file) {
    if (!file) return;
    if (st.rec) return toast('Please wait: a video is still recording');
    if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') return pdfStatus('Please choose a PDF file of the card.', true);
    stepTo('details');
    pdfStatus(`📄 Reading “${file.name}”…`);
    try {
      await st.ready;
      const r = await PdfCard.read(file);
      st.pdf = r.details || { lang: 'en', type: 'wedding', events: [], phones: [] };
      fillDetails(st.pdf, r.pictures);
      if (!r.readable) {
        pdfStatus('⚠️ This PDF has no readable text (it is a picture, or uses an old Hindi font). Please type the details from the page shown, then pick a video.', true);
        $('#fHost1').focus();
        return;
      }
      const n = st.pdf.events.length;
      pdfStatus(`✅ Read: ${[st.pdf.host1, st.pdf.host2].filter(Boolean).join(' & ') || 'no names found'} · ${n} function${n === 1 ? '' : 's'}${st.pdf.venue ? ' · ' + st.pdf.venue : ''}. Check below if you like.`);
      if (st.pdf.host1) { useDetails(); openPick(); }
    } catch (e) {
      pdfStatus(`Could not read this PDF: ${e.message}`, true);
    }
  }
  $('#stPdfFile').addEventListener('change', e => { const f = e.target.files[0]; e.target.value = ''; readPdf(f); });
  const drop = $('#stPdfDrop');
  ['dragenter', 'dragover'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(t => drop.addEventListener(t, () => drop.classList.remove('over')));
  drop.addEventListener('drop', e => { e.preventDefault(); readPdf(e.dataTransfer.files[0]); });
  // From the main page: choose the PDF straight away (the Studio opens behind the file chooser)
  $('#pdfVideoBtn').addEventListener('click', () => { $('#stPdfFile').click(); openStudio().then(() => stepTo('details')); });
  $('#stHeadPdf').addEventListener('click', () => { stepTo('details'); $('#stPdfFile').click(); });

  // The picker: premium films or story films; a tap makes the video
  let pickTab = 'films';
  function openPick() {
    $('#pickWho').textContent = ` · ${who(st.card)} · ${occasion(st.card).label}`;
    renderPick();
    $('#pickSheet').hidden = false;
  }
  function renderPick() {
    document.querySelectorAll('#pickTabs [data-pick]').forEach(b => b.classList.toggle('on', b.dataset.pick === pickTab));
    $('#pickGrid').innerHTML = pickTab === 'films'
      ? Films.LIST.map(f => `<button type="button" class="pick-tile" data-film="${f.id}"><img src="img/films/${f.id}.jpg" alt="" loading="lazy" width="135" height="240"><span><b>${esc(f.name)}</b><small>👑 Premium film</small></span></button>`).join('')
      : Object.entries(Studio.STORIES).map(([id, S]) => `<button type="button" class="pick-tile" data-story="${id}"><img src="img/stories/${id}.jpg" alt="" loading="lazy" width="135" height="240" onerror="this.style.visibility='hidden'"><span><b>${esc(S.name)}</b><small>${esc(TUNES[S.tune].label)}</small></span></button>`).join('');
  }
  $('#pickTabs').addEventListener('click', e => { const b = e.target.closest('[data-pick]'); if (b) { pickTab = b.dataset.pick; renderPick(); } });
  $('#pickClose').addEventListener('click', () => { $('#pickSheet').hidden = true; });
  $('#pickSheet').addEventListener('click', e => { if (e.target === e.currentTarget) $('#pickSheet').hidden = true; });
  $('#pickGrid').addEventListener('click', e => {
    const b = e.target.closest('.pick-tile');
    if (!b || st.rec) return;
    $('#pickSheet').hidden = true;
    st.opt.film = b.dataset.film || '';
    st.opt.story = b.dataset.story || '';
    if (st.opt.story) st.opt.look = Studio.STORIES[st.opt.story].open;
    st.picked = true; st.t = 0;
    refreshStudio();
    stepTo('music');
    makeStudioVideo();
  });

  // ---------- Cutting a song ----------
  // The song this video plays, drawn as a wave; two sliders (or a tap on the wave) set where it starts and ends.
  let cropSound = null, cropRaf = 0;
  function peaks(song, n = 900) {
    if (song.peaks) return song.peaks;
    const d = song.buffer.getChannelData(0), step = Math.max(1, Math.floor(d.length / n)), out = new Float32Array(n);
    for (let i = 0; i < n; i++) { let m = 0; for (let j = i * step, e = Math.min(d.length, j + step); j < e; j += 16) m = Math.max(m, Math.abs(d[j])); out[i] = m; }
    return (song.peaks = out);
  }
  function drawWave(song) {
    const c = $('#cropWave'), g = c.getContext('2d'), W = c.width, H = c.height, pk = peaks(song, W), len = song.buffer.duration;
    const cut = song.cut || { start: 0, end: len }, x0 = cut.start / len * W, x1 = cut.end / len * W;
    g.clearRect(0, 0, W, H);
    g.fillStyle = 'rgba(232,184,74,.12)'; g.fillRect(x0, 0, x1 - x0, H);
    for (let x = 0; x < W; x++) { const h = Math.max(1, pk[x] * H * .9); g.fillStyle = x >= x0 && x <= x1 ? '#e8b84a' : 'rgba(255,255,255,.25)'; g.fillRect(x, (H - h) / 2, 1, h); }
    g.fillStyle = '#ff3d8b'; g.fillRect(x0 - 1, 0, 3, H); g.fillRect(x1 - 2, 0, 3, H);
  }
  function renderCrop() {
    const song = videoSong(), box = $('#stCrop');
    box.hidden = !song;
    if (!song) return;
    const len = song.buffer.duration, cut = song.cut || { start: 0, end: len };
    $('#cropName').textContent = `✂️ ${song.name}`;
    $('#cropLen').textContent = ` · ${mmss(len)} long · the video is ${mmss(SP() ? SP().total : 0)}`;
    [['cropStart', cut.start], ['cropEnd', cut.end]].forEach(([id, v]) => { const r = $('#' + id); r.max = len.toFixed(1); r.value = v.toFixed(1); });
    $('#cropStartOut').textContent = mmss(cut.start); $('#cropEndOut').textContent = mmss(cut.end);
    const part = cut.end - cut.start, video = SP() ? SP().total : 0;
    $('#cropNote').textContent = part + .5 < video ? `This part is ${mmss(part)}: it repeats to fill the ${mmss(video)} video. Tap “Fit to the video” for one long part.` : `This part plays from ${mmss(cut.start)}; the music fades out with the last scene.`;
    drawWave(song);
  }
  let saveTimer = 0;
  function setCut(start, end) {
    const song = videoSong();
    if (!song || st.rec) return;
    const len = song.buffer.duration;
    start = Math.max(0, Math.min(start, len - 1)); end = Math.max(start + 1, Math.min(end, len));
    song.cut = start <= .05 && end >= len - .05 ? null : { start: Math.round(start * 10) / 10, end: Math.round(end * 10) / 10 };
    renderCrop();
    $('#stSongNow').textContent = songNow();
    clearTimeout(saveTimer); saveTimer = setTimeout(() => { saveSongs(); if (previewSound) soundOn(); }, 400);
  }
  $('#cropStart').addEventListener('input', e => { const s2 = videoSong(); if (s2) setCut(+e.target.value, (s2.cut || { end: s2.buffer.duration }).end); });
  $('#cropEnd').addEventListener('input', e => { const s2 = videoSong(); if (s2) setCut((s2.cut || { start: 0 }).start, +e.target.value); });
  // a tap on the wave moves the nearer edge there
  $('#cropWave').addEventListener('pointerdown', e => {
    const s2 = videoSong(); if (!s2) return;
    const r = e.currentTarget.getBoundingClientRect(), t = (e.clientX - r.left) / r.width * s2.buffer.duration, cut = s2.cut || { start: 0, end: s2.buffer.duration };
    if (Math.abs(t - cut.start) < Math.abs(t - cut.end)) setCut(t, cut.end); else setCut(cut.start, t);
  });
  $('#cropFit').addEventListener('click', () => { const s2 = videoSong(); if (s2) { const a = (s2.cut || { start: 0 }).start; setCut(a, a + SP().total); } });
  $('#cropAll').addEventListener('click', () => { const s2 = videoSong(); if (s2) setCut(0, s2.buffer.duration); });
  function stopCropSound() { cancelAnimationFrame(cropRaf); if (cropSound) { cropSound.close(); cropSound = null; } $('#cropPlay').textContent = '▶ Listen'; $('#cropHead').style.left = '-10px'; }
  $('#cropPlay').addEventListener('click', () => {
    const song = videoSong();
    if (cropSound || !song) return stopCropSound();
    soundOff(); $('#stSound').textContent = '🔇';
    cropSound = new FileTune(song.buffer, song.cut);
    if (!cropSound.start()) { cropSound = null; return; }
    $('#cropPlay').textContent = '■ Stop';
    const t0 = cropSound.ctx.currentTime, from = cropSound.from, part = cropSound.to - cropSound.from, len = song.buffer.duration;
    const move = () => { if (!cropSound) return; const at = from + ((cropSound.ctx.currentTime - t0) % part); $('#cropHead').style.left = `${at / len * 100}%`; cropRaf = requestAnimationFrame(move); };
    move();
  });
  $('#stSongDrop').addEventListener('click', () => $('#stMusicFile').click());
  $('#stRemake').addEventListener('click', () => { stopCropSound(); makeStudioVideo(); });

  // ---------- ⚡ Auto Video Studio ----------
  // Its own screen: drop a card PDF and the best films for that card (its occasion, its language, the most liked
  // styles, all different) play straight away with the card's own names, dates and venue. Pick one, add a song
  // from this computer and cut it, make the video. Nothing to fill or choose beyond that.
  const au = { card: null, lang: 'en', details: null, picks: [], film: '', minis: [], big: null, t: 0, playing: true, raf: 0, last: 0, rr: 0, music: 'film', rec: null, sound: null, listen: null, file: null };
  const FAMILY = { wedding: 'w', engagement: 'w', reception: 'w', sangeet: 'p', haldi: 'w', mehendi: 'w', anniversary: 'w', birthday: 'p', babyshower: 'k', naming: 's', housewarming: 's', puja: 's' };
  // the card's occasion in the films' words
  const filmOcc = type => ({ bday: 'birthday', kidsbday: 'birthday', kitty: 'sangeet', retirement: 'reception', corporate: 'reception', ceremony: 'puja', thread: 'puja', mundan: 'naming', roka: 'engagement', griha: 'housewarming' }[type] || (FAMILY[type] ? type : 'wedding'));
  function bestFilms(card, lang, n = 6) {
    const want = filmOcc(card.type), fam = FAMILY[want], hi = lang === 'hi';
    const score = f => {
      const c = f.concept || 'heritage';
      let s = f.occ === want ? 12 : FAMILY[f.occ] === fam ? 5 : 0;
      if (['monogram', 'jharokha', 'temple'].includes(c)) s += 2; // what sells most right now
      if (fam === 's' && ['temple', 'rangoli', 'scroll', 'heritage'].includes(c)) s += 5;
      if (fam === 'p' && ['neon', 'marquee', 'polaroid', 'cinema', 'deco'].includes(c)) s += 4;
      if (fam === 'w' && ['monogram', 'jharokha', 'heritage', 'cinema', 'floral', 'deco', 'scroll'].includes(c)) s += 3;
      if (fam === 'k' && ['floral', 'polaroid', 'botanical', 'minimal'].includes(c)) s += 4;
      if (hi && ['heritage', 'jharokha', 'temple', 'scroll', 'rangoli'].includes(c)) s += 2;
      if (f.id === 'film-royal-darbar' && fam === 'w') s += 3;
      return s;
    };
    const ranked = Films.LIST.map((f, i) => ({ f, s: score(f), i })).sort((a, b) => b.s - a.s || a.i - b.i);
    const out = [], used = new Set();
    for (const r of ranked) { const c = r.f.concept || 'heritage'; if (used.has(c)) continue; used.add(c); out.push(r.f); if (out.length === n) break; }
    return out;
  }
  // The card's colours, read from its first page: the background (light or dark) and its main colour.
  // Gold work is noticed, but the card's own colour wins (a green card with gold work gives green films).
  const HUE_WORDS = [[12, 'Crimson'], [28, 'Terracotta'], [44, 'Saffron'], [62, 'Golden'], [85, 'Lime'], [165, 'Emerald'], [200, 'Peacock'], [255, 'Royal Blue'], [292, 'Purple'], [343, 'Rani Pink'], [352, 'Rose'], [361, 'Crimson']];
  function cardTone(src) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const w = 90, h = Math.round(img.height / img.width * 90) || 120, c = Object.assign(document.createElement('canvas'), { width: w, height: h }), g = c.getContext('2d');
        g.drawImage(img, 0, 0, w, h);
        const px = g.getImageData(0, 0, w, h).data, buckets = {}, bins = Array.from({ length: 24 }, () => ({ w: 0, h: 0, s: 0, l: 0 }));
        let all = 0;
        for (let i = 0; i < px.length; i += 4) { const key = (px[i] >> 5) + ',' + (px[i + 1] >> 5) + ',' + (px[i + 2] >> 5); buckets[key] = (buckets[key] || 0) + 1; all++; }
        const bgRGB = Object.entries(buckets).sort((a, b) => b[1] - a[1])[0][0].split(',').map(v => +v * 32 + 16);
        for (let i = 0; i < px.length; i += 4) {
          const r = px[i] / 255, gg = px[i + 1] / 255, b = px[i + 2] / 255, mx = Math.max(r, gg, b), mn = Math.min(r, gg, b), l = (mx + mn) / 2, d = mx - mn;
          // the further from the background, the more a pixel counts (the soft edges of thin print mix both colours)
          const far = Math.hypot(px[i] - bgRGB[0], px[i + 1] - bgRGB[1], px[i + 2] - bgRGB[2]) / 441, k = far * far;
          if (!d || k < .02) continue;
          const s = d / (1 - Math.abs(2 * l - 1)); if (s < .25 || l < .1 || l > .85) continue;
          let hue = mx === r ? ((gg - b) / d) % 6 : mx === gg ? (b - r) / d + 2 : (r - gg) / d + 4; hue = (hue * 60 + 360) % 360;
          const wt = s * k, bin = bins[Math.floor(hue / 15) % 24]; bin.w += wt; bin.h += hue * wt; bin.s += s * wt; bin.l += l * wt;
        }
        const top = Object.entries(buckets).sort((a, b) => b[1] - a[1])[0][0].split(',').map(v => (+v * 32 + 16) / 255);
        const bgL = (Math.max(...top) + Math.min(...top)) / 2;
        const ranked = bins.filter(b => b.w > 0).sort((a, b) => b.w - a.w);
        const isGold = b => { const hue = b.h / b.w; return hue >= 33 && hue <= 56; };
        // the main colour: the strongest one, unless that is the gold work and another colour is clearly there too
        let main = ranked[0];
        if (main && isGold(main) && ranked[1] && ranked[1].w > main.w * .25 && !isGold(ranked[1])) main = ranked[1];
        if (!main || main.w < all * .0004) return resolve({ h: 40, s: .05, dark: bgL < .45, word: bgL < .45 ? 'Noir' : 'Ivory', gold: 'gold', swatch: bgL < .45 ? '#161616' : '#f4eee2' });
        const hue = main.h / main.w, sat = Math.min(1, main.s / main.w), lig = main.l / main.w;
        let word = HUE_WORDS.find(([upTo]) => hue < upTo)[1];
        if ((word === 'Crimson' || word === 'Rose') && lig < .32) word = 'Maroon';
        if (word === 'Royal Blue' && lig < .3) word = 'Midnight';
        if (word === 'Emerald' && lig > .55) word = 'Sage';
        resolve({ h: hue, s: sat, dark: bgL < .45, word, gold: word === 'Rani Pink' || word === 'Rose' ? 'rose' : 'gold',
          swatch: `hsl(${Math.round(hue)} ${Math.round(sat * 100)}% ${Math.round(Math.min(.6, Math.max(.3, lig)) * 100)}%)` });
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }
  const auStatus = (msg, bad) => { const p = $('#auStatus'); p.textContent = msg; p.classList.toggle('bad', !!bad); };
  async function openAuto() {
    if (st.rec) return toast('Please wait: the Video Studio is still recording');
    $('#auto').hidden = false;
    document.body.classList.add('studio-open');
    au.fonts = au.fonts || Films.fontsReady();
    if (au.card) startAuto(); else showAutoStart();
  }
  function showAutoStart() {
    $('#auDrop').hidden = false; $('#auWork').hidden = true; $('#auNew').hidden = true; $('#auFill').hidden = true;
    auStatus('');
  }
  function closeAuto() {
    if (au.rec) return toast('Please wait: the video is still recording');
    auSoundOff(); auStopListen();
    cancelAnimationFrame(au.raf);
    $('#auto').hidden = true;
    document.body.classList.remove('studio-open');
  }
  async function autoPdf(file) {
    if (!file) return;
    if (au.rec) return toast('Please wait: a video is still recording');
    if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') return auStatus('Please choose the PDF file of the card.', true);
    auStatus(`📄 Reading “${file.name}” and making your videos…`);
    $('#auDrop').classList.add('busy');
    try {
      const r = await PdfCard.read(file);
      let d = r.details || {};
      // no text in the PDF (a picture of the card, or an old Hindi font): read the picture itself
      if (!r.readable || !d.host1) {
        auStatus('🔎 This card is a picture: reading its words from the picture… (the first time takes about half a minute)');
        try {
          const found = PdfCard.parse(await ocrLines(r.big || r.pictures[0]), { ocr: true });
          if (found.host1) d = found; else d = { ...found, ...d };
        } catch (e) { /* offline: the short form below */ }
      }
      au.pendingR = r;
      if (!d.host1) { showFill(d); return; }
      await useAutoDetails(d, r);
    } catch (e) {
      auStatus(`Could not read this PDF: ${e.message}`, true);
    } finally { $('#auDrop').classList.remove('busy'); }
  }
  // Reading a card's picture (OCR, English + Hindi), loaded only when a card needs it
  let ocrLib = null;
  const loadOcr = () => ocrLib = ocrLib || new Promise((resolve, reject) => {
    if (window.Tesseract) return resolve(window.Tesseract);
    const sc = Object.assign(document.createElement('script'), { src: 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js' });
    sc.onload = () => resolve(window.Tesseract);
    sc.onerror = () => { ocrLib = null; reject(new Error('offline')); };
    document.head.appendChild(sc);
  });
  async function ocrLines(src) {
    if (!src) return [];
    const T = await loadOcr();
    const { data } = await T.recognize(src, 'eng+hin', { logger: m => { if (m.status === 'recognizing text') auStatus(`🔎 Reading the words on the card… ${Math.round(m.progress * 100)}%`); } });
    // "चि॰" is often read as "चि०" (a zero): put the abbreviation mark back so the name is found
    return String(data.text || '').split('\n').map(x => x.replace(/([\u0900-\u0965\u0970-\u097F])०/g, '$1॰').replace(/\s+/g, ' ').trim()).filter(Boolean);
  }
  // Still no names: four short boxes, then the videos are made the same way (in the card's colours)
  function showFill(d) {
    $('#auFType').innerHTML = Object.entries(PRESETS).map(([k, p]) => `<option value="${k}"${k === (d.type || 'wedding') ? ' selected' : ''}>${p.icon || ''} ${esc(p.label)}</option>`).join('');
    $('#auF1').value = d.host1 || ''; $('#auF2').value = d.host2 || '';
    $('#auFDate').value = (d.events && d.events[0] && d.events[0].date ? d.events[0].date.slice(0, 10) : '');
    $('#auFVenue').value = d.venue || '';
    $('#auFill').hidden = false;
    auStatus('✍️ The words on this card could not be read. Type the names below (10 seconds), and the videos are made in your card colours.', true);
    $('#auF1').focus();
  }
  $('#auFill').addEventListener('submit', async e => {
    e.preventDefault();
    const h1 = $('#auF1').value.trim();
    if (!h1) { $('#auF1').focus(); return toast('Please write at least the first name'); }
    const type = $('#auFType').value, date = $('#auFDate').value, venue = $('#auFVenue').value.trim();
    const words = h1 + $('#auF2').value;
    const d = { type, lang: /[\u0900-\u097F]/.test(words) ? 'hi' : 'en', host1: h1, host2: $('#auF2').value.trim(), parents1: '', parents2: '',
      events: date ? [{ name: PRESETS[type] ? PRESETS[type].label : 'Celebration', date, venue }] : [], venue, address: '', phones: [], hashtag: '' };
    $('#auFill').hidden = true;
    await useAutoDetails(d, au.pendingR || { pictures: [] });
  });
  async function useAutoDetails(d, r) {
    {
      $('#auFill').hidden = true;
      au.details = d; au.lang = d.lang === 'hi' ? 'hi' : 'en';
      au.card = { ...Core.blankCard(), ...PdfCard.toCard(d), theme: design().no };
      // new films made in the card's own colours (not the ready-made ones)
      au.page = (r.pictures && r.pictures[0]) || '';
      au.tone = au.page ? await cardTone(au.page) : null;
      const styles = bestFilms(au.card, au.lang);
      au.picks = au.tone ? styles.map(f => Films.recolour(f, au.tone)) : styles;
      au.film = au.picks[0];
      au.file = null;
      $('#auVideo').hidden = $('#auDone').hidden = true;
      await au.fonts;
      startAuto();
      if (window.Fun) Fun.burst(null, null, 70);
    }
  }
  function startAuto() {
    const d = au.details, n = d.events.length;
    $('#auDrop').hidden = true; $('#auWork').hidden = false; $('#auNew').hidden = false;
    auStatus('');
    $('#auRead').innerHTML = (au.page ? `<img class="au-page" src="${au.page}" alt="The card">` : '') + `<span>✅ Read from the card: <b>${esc([d.host1, d.host2].filter(Boolean).join(' & '))}</b> · ${esc(occasion(au.card).label)}${n ? ` · ${n} function${n === 1 ? '' : 's'}` : ''}${d.venue ? ' · ' + esc(d.venue) : ''} · ${au.lang === 'hi' ? 'हिन्दी' : 'English'}`
      + (au.tone ? `<br>🎨 Colours from your card: <i class="au-swatch" style="background:${au.tone.swatch}"></i> <b>${esc(au.tone.word)}</b> on ${au.tone.dark ? 'dark' : 'light'}. Every video below is made new in them.` : '') + '</span>';
    $('#auGrid').innerHTML = au.picks.map((f, i) => `<button type="button" class="au-pick${f === au.film ? ' on' : ''}" data-i="${i}" style="--i:${i}">
      <canvas></canvas>${i === 0 ? '<em>Best match</em>' : ''}<b>${esc(f.name)}</b><small>${esc(Films.conceptName(f))}${f.fromCard ? ' · your card colours' : ''}</small></button>`).join('');
    au.minis = [...$('#auGrid').querySelectorAll('canvas')].map((c, i) => { const P = new Films.Player(c, .25); P.set(au.picks[i], au.lang, au.card, filmOpts()); return P; });
    au.big = au.big || new Films.Player($('#auCanvas'), .5);
    setAutoFilm(au.film);
    renderAutoSongs();
    au.playing = true; $('#auPlay').textContent = '❚❚';
    cancelAnimationFrame(au.raf); au.last = performance.now(); au.t0 = au.last;
    au.raf = requestAnimationFrame(autoFrame);
  }
  function setAutoFilm(f) {
    au.film = f;
    au.big.set(f, au.lang, au.card, filmOpts());
    au.t = 0;
    document.querySelectorAll('#auGrid .au-pick').forEach(b => b.classList.toggle('on', au.picks[+b.dataset.i] === f));
    renderAutoCrop();
  }
  function autoFrame(now) {
    const dt = Math.min(.5, (now - au.last) / 1000); au.last = now;
    if (au.rec) au.t = Math.max(0, now - au.rec.t0) / 1000;
    else if (au.playing) au.t = (au.t + dt) % au.big.total;
    au.big.draw(au.t);
    $('#auBar').style.width = `${Math.min(100, au.t / au.big.total * 100)}%`;
    $('#auTime').textContent = `${mmss(au.t)} / ${mmss(au.big.total)}`;
    // the small previews take turns (one per frame), each on its own clock, so the page stays smooth
    if (au.minis.length && !au.rec) { const i = au.rr++ % au.minis.length, P = au.minis[i]; P.draw(((now - au.t0) / 1000 + i * 1.7) % P.total); }
    if (au.rec && au.t >= au.big.total) au.rec.done();
    au.raf = requestAnimationFrame(autoFrame);
  }
  $('#auGrid').addEventListener('click', e => {
    const b = e.target.closest('[data-i]');
    if (!b || au.rec) return;
    setAutoFilm(au.picks[+b.dataset.i]);
    if (au.sound) auSoundOn();
    if (window.Fun) Fun.buzz(10);
  });
  $('#auPlay').addEventListener('click', () => { if (au.rec) return; au.playing = !au.playing; $('#auPlay').textContent = au.playing ? '❚❚' : '▶'; });
  $('#auScrub').addEventListener('pointerdown', e => {
    if (au.rec) return;
    const r = e.currentTarget.getBoundingClientRect();
    au.t = Math.max(0, Math.min(.999, (e.clientX - r.left) / r.width)) * au.big.total;
  });

  // The song: the film's own tune, one of your saved songs, or a new one from this computer (cut to the part you want)
  const autoSong = () => /^song:/.test(au.music) ? songs[+au.music.slice(5)] || null : null;
  function renderAutoSongs() {
    const f = au.film;
    $('#auSongs').innerHTML = [['film', `🎼 The film's own music`], ...songs.map((s, i) => [`song:${i}`, `🎶 ${s.name}`])]
      .map(([k, label]) => `<button type="button" class="chip${au.music === k ? ' on' : ''}" data-au-music="${k}">${esc(label)}</button>`).join('');
    renderAutoCrop();
    return f;
  }
  $('#auSongs').addEventListener('click', e => {
    const b = e.target.closest('[data-au-music]');
    if (!b || au.rec) return;
    au.music = b.dataset.auMusic; auStopListen(); renderAutoSongs();
    if (au.sound) auSoundOn();
  });
  $('#auAddSong').addEventListener('click', () => $('#auSongFile').click());
  $('#auSongFile').addEventListener('change', async e => {
    const f = e.target.files[0]; e.target.value = '';
    if (!f) return;
    const name = f.name.replace(/\.[^.]+$/, '');
    let i = songs.findIndex(s => s.name === name);
    if (i < 0) {
      try { songs.push(await decodeSong(name, await f.arrayBuffer())); i = songs.length - 1; saveSongs(); if (st.player) renderMusicChips(); }
      catch (err) { return toast(`“${name}” is not a song this browser can play. Please choose an MP3, M4A or WAV.`); }
    }
    au.music = `song:${i}`;
    renderAutoSongs();
    toast('🎵 Song added: drag the sliders to cut the part you want');
    if (au.sound) auSoundOn();
  });
  function drawAutoWave(song) {
    const c = $('#auWave'), g = c.getContext('2d'), W = c.width, H = c.height, pk = peaks(song, W), len = song.buffer.duration;
    const cut = song.cut || { start: 0, end: len }, x0 = cut.start / len * W, x1 = cut.end / len * W;
    g.clearRect(0, 0, W, H);
    g.fillStyle = 'rgba(232,184,74,.12)'; g.fillRect(x0, 0, x1 - x0, H);
    for (let x = 0; x < W; x++) { const h = Math.max(1, pk[x] * H * .9); g.fillStyle = x >= x0 && x <= x1 ? '#e8b84a' : 'rgba(255,255,255,.25)'; g.fillRect(x, (H - h) / 2, 1, h); }
    g.fillStyle = '#ff3d8b'; g.fillRect(x0 - 1, 0, 3, H); g.fillRect(x1 - 2, 0, 3, H);
  }
  function renderAutoCrop() {
    const song = autoSong();
    $('#auCrop').hidden = !song;
    if (!song || !au.big) return;
    const len = song.buffer.duration, cut = song.cut || { start: 0, end: len }, video = au.big.total;
    $('#auSongName').textContent = `✂️ ${song.name}`;
    $('#auSongLen').textContent = ` · ${mmss(len)} long · the video is ${mmss(video)}`;
    [['auStart', cut.start], ['auEnd', cut.end]].forEach(([id, v]) => { const r = $('#' + id); r.max = len.toFixed(1); r.value = v.toFixed(1); });
    $('#auStartOut').textContent = mmss(cut.start); $('#auEndOut').textContent = mmss(cut.end);
    const part = cut.end - cut.start;
    $('#auCropNote').textContent = part + .5 < video ? `This part is ${mmss(part)}: it repeats to fill the ${mmss(video)} video. Tap “Fit to the video” for one long part.` : `It plays from ${mmss(cut.start)} and fades out with the last screen.`;
    drawAutoWave(song);
  }
  let auSave = 0;
  function setAutoCut(start, end) {
    const song = autoSong();
    if (!song || au.rec) return;
    const len = song.buffer.duration;
    start = Math.max(0, Math.min(start, len - 1)); end = Math.max(start + 1, Math.min(end, len));
    song.cut = start <= .05 && end >= len - .05 ? null : { start: Math.round(start * 10) / 10, end: Math.round(end * 10) / 10 };
    renderAutoCrop();
    clearTimeout(auSave); auSave = setTimeout(() => { saveSongs(); if (au.sound) auSoundOn(); }, 400);
  }
  $('#auStart').addEventListener('input', e => { const s = autoSong(); if (s) setAutoCut(+e.target.value, (s.cut || { end: s.buffer.duration }).end); });
  $('#auEnd').addEventListener('input', e => { const s = autoSong(); if (s) setAutoCut((s.cut || { start: 0 }).start, +e.target.value); });
  $('#auWave').addEventListener('pointerdown', e => {
    const s = autoSong(); if (!s) return;
    const r = e.currentTarget.getBoundingClientRect(), t = (e.clientX - r.left) / r.width * s.buffer.duration, cut = s.cut || { start: 0, end: s.buffer.duration };
    if (Math.abs(t - cut.start) < Math.abs(t - cut.end)) setAutoCut(t, cut.end); else setAutoCut(cut.start, t);
  });
  $('#auFit').addEventListener('click', () => { const s = autoSong(); if (s) { const a = (s.cut || { start: 0 }).start; setAutoCut(a, a + au.big.total); } });
  $('#auWhole').addEventListener('click', () => { const s = autoSong(); if (s) setAutoCut(0, s.buffer.duration); });
  let auHeadRaf = 0;
  function auStopListen() { cancelAnimationFrame(auHeadRaf); if (au.listen) { au.listen.close(); au.listen = null; } $('#auListen').textContent = '▶ Listen'; $('#auHead').style.left = '-10px'; }
  $('#auListen').addEventListener('click', () => {
    const song = autoSong();
    if (au.listen || !song) return auStopListen();
    auSoundOff();
    au.listen = new FileTune(song.buffer, song.cut);
    if (!au.listen.start()) { au.listen = null; return; }
    $('#auListen').textContent = '■ Stop';
    const t0 = au.listen.ctx.currentTime, from = au.listen.from, part = au.listen.to - au.listen.from, len = song.buffer.duration;
    const move = () => { if (!au.listen) return; $('#auHead').style.left = `${(from + ((au.listen.ctx.currentTime - t0) % part)) / len * 100}%`; auHeadRaf = requestAnimationFrame(move); };
    move();
  });
  // the music itself (for the preview's 🔊 and for the video)
  function autoMusic() {
    const song = autoSong();
    if (song) { const f = new FileTune(song.buffer, song.cut); return f.start() ? f : null; }
    const t = new Tune(au.film.tune);
    return t.start() ? t : null;
  }
  function auSoundOff() { if (au.sound) { au.sound.stop(); if (au.sound.close) au.sound.close(); else au.sound.ctx.close(); au.sound = null; } $('#auSound').textContent = '🔇'; }
  function auSoundOn() { auSoundOff(); auStopListen(); au.sound = autoMusic(); $('#auSound').textContent = au.sound ? '🔊' : '🔇'; }
  $('#auSound').addEventListener('click', () => { if (au.rec) return; if (au.sound) auSoundOff(); else { au.t = 0; auSoundOn(); } });

  // Make it: the big preview is recorded in full size with the music, then saved as an MP4
  const auMsg = (m, p) => { $('#auMsg').textContent = m; if (p != null) $('#auRecBar').style.width = `${Math.round(p * 100)}%`; };
  $('#auMake').addEventListener('click', makeAutoVideo);
  $('#auStop').addEventListener('click', () => { if (au.rec) { au.rec.cancelled = true; au.rec.done(); } });
  async function makeAutoVideo() {
    if (au.rec || !au.big) return;
    if (!(window.MediaRecorder && HTMLCanvasElement.prototype.captureStream)) return auMsg('This browser cannot make videos. Please use Chrome, Edge or Safari.');
    await au.fonts;
    const hadSound = !!au.sound;
    auSoundOff(); auStopListen();
    const canvas = $('#auCanvas');
    // full size while recording, the preview size again afterwards
    au.big = new Films.Player(canvas, 1); au.big.set(au.film, au.lang, au.card, filmOpts());
    $('#auMake').disabled = true; $('#auStop').hidden = false; $('#auVideo').hidden = $('#auDone').hidden = true;
    document.querySelectorAll('#auGrid .au-pick, #auSongs .chip, #auAddSong').forEach(b => { b.disabled = true; });
    let box = null;
    try {
      const stream = canvas.captureStream(30);
      box = autoMusic();
      if (box) {
        const dest = box.ctx.createMediaStreamDestination(); box.master.connect(dest);
        dest.stream.getAudioTracks().forEach(tr => stream.addTrack(tr));
        if (box.fadeOut) box.fadeOut(au.big.total - 2.6, 2.4);
      }
      const mimeType = VIDEO_TYPES.find(t => MediaRecorder.isTypeSupported(t)) || '';
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType, videoBitsPerSecond: 5e6 } : { videoBitsPerSecond: 5e6 });
      const chunks = []; recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      const stopped = new Promise(r => { recorder.onstop = r; });
      const total = au.big.total, rec = { t0: performance.now(), cancelled: false };
      await new Promise(resolve => {
        rec.done = resolve; au.rec = rec; au.t = 0;
        recorder.start(500);
        const tick = setInterval(() => {
          if (!au.rec) return clearInterval(tick);
          auMsg(`🔴 Recording… ${mmss(au.t)} / ${mmss(total)} · ${Math.max(0, Math.ceil(total - au.t))}s left. Keep this tab open.`, Math.min(.99, au.t / total));
        }, 250);
      });
      au.rec = null;
      recorder.stop(); await stopped;
      if (rec.cancelled) { auMsg('Stopped. Nothing was saved: change anything you like, then make it again.', 0); return; }
      const type = recorder.mimeType || mimeType || 'video/webm';
      let blob = new Blob(chunks, { type });
      if (type.includes('mp4')) { try { blob = new Blob([MP4Fix.defragment(new Uint8Array(await blob.arrayBuffer()))], { type: 'video/mp4' }); } catch (e) { /* keep it as recorded */ } }
      if (!(await playable(blob))) throw new Error('the recording did not come out right (it would not play)');
      const ext = type.includes('mp4') ? 'mp4' : 'webm';
      const name = `${who(au.card)} ${au.film.name} ${au.lang === 'hi' ? 'Hindi' : 'English'} video.${ext}`.replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, ' ');
      const url = URL.createObjectURL(blob), v = $('#auVideo');
      if (v.src) URL.revokeObjectURL(v.src);
      Object.assign(v, { src: url, hidden: false });
      Object.assign($('#auDownload'), { href: url, download: name });
      $('#auDownload').click();
      au.file = new File([blob], name, { type: type.split(';')[0] });
      $('#auShare').hidden = !canShareFile(au.file);
      $('#auDone').hidden = false;
      keepVideo(au.file);
      auMsg(`✅ Saved "${name}" (${(blob.size / 1048576).toFixed(1)} MB) to your Downloads.` + (ext === 'webm' ? ' This browser makes WebM only: please update Chrome for MP4 (WhatsApp needs it).' : ''), 1);
      toast('Video downloaded 🎬');
      if (window.Fun) Fun.burst(null, null, 140);
    } catch (e) {
      au.rec = null;
      auMsg(`Could not make the video: ${e.message}. Please try again.`);
    } finally {
      if (box) { box.stop(); if (box.close) box.close(); else box.ctx.close(); }
      au.big = new Films.Player(canvas, .5); au.big.set(au.film, au.lang, au.card, filmOpts());
      $('#auMake').disabled = false; $('#auStop').hidden = true;
      document.querySelectorAll('#auGrid .au-pick, #auSongs .chip, #auAddSong').forEach(b => { b.disabled = false; });
      if (hadSound) auSoundOn();
    }
  }
  $('#auShare').addEventListener('click', () => au.file && shareFile(au.file, 'Invitation video'));
  $('#auFile').addEventListener('change', e => { const f = e.target.files[0]; e.target.value = ''; autoPdf(f); });
  const auDrop = $('#auDrop');
  ['dragenter', 'dragover'].forEach(t => auDrop.addEventListener(t, e => { e.preventDefault(); auDrop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(t => auDrop.addEventListener(t, () => auDrop.classList.remove('over')));
  auDrop.addEventListener('drop', e => { e.preventDefault(); autoPdf(e.dataTransfer.files[0]); });
  $('#auNew').addEventListener('click', () => { if (!au.rec) { auSoundOff(); auStopListen(); cancelAnimationFrame(au.raf); showAutoStart(); $('#auFile').click(); } });
  $('#auClose').addEventListener('click', closeAuto);
  addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#auto').hidden) closeAuto(); });
  document.querySelectorAll('[data-auto]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); openAuto(); }));

  // ---------- Link history ----------
  // Logged in: kept in the database (the same on your phone and PC). Offline: in this browser.
  let linksCache = [];
  function loadLinks() {
    if (useDb) return linksCache.slice();
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; } catch (e) { return []; }
  }
  function saveLinks(list) {
    if (!useDb) {
      try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (e) { toast('Could not save history in this browser'); }
      return;
    }
    const before = linksCache, had = new Set(before.map(r => r.id)), keep = new Set(list.map(r => r.id));
    linksCache = list;
    const jobs = [];
    const added = list.filter(r => !had.has(r.id));
    if (added.length) jobs.push(DB.insert('invites', added.map(r => ({ id: r.id, guest: r.guest, who: r.who, occasion: r.type, design_no: r.theme, url: r.url, created_at: new Date(r.created).toISOString() }))));
    const gone = before.filter(r => !keep.has(r.id));
    if (gone.length && !list.length) jobs.push(DB.remove('invites', 'id=not.is.null'));
    else if (gone.length) jobs.push(DB.remove('invites', `id=in.(${gone.map(r => r.id).join(',')})`));
    Promise.all(jobs).catch(e => { toast(`History not saved: ${e.message}`); refreshLinks(); });
  }
  async function refreshLinks() {
    if (!useDb || !DB.user) return;
    try {
      const rows = await DB.select('invites', 'select=*&order=created_at.desc&limit=2000');
      linksCache = rows.map(r => ({ id: r.id, guest: r.guest || '', who: r.who || '', type: r.occasion, theme: r.design_no, url: r.url, created: Date.parse(r.created_at) }));
      renderLinks();
    } catch (e) { /* keep the list we have */ }
  }
  const designLabel = id => {
    const t = Templates.get(id) || Templates.get(1);
    return `${Templates.serial(t.no)} ${entry(t.no).name}`;
  };

  function renderLinks() {
    const all = loadLinks();
    const q = $('#search').value.trim().toLowerCase();
    const list = q ? all.filter(r => `${r.guest} ${r.who} ${designLabel(r.theme)}`.toLowerCase().includes(q)) : all;
    $('#linkCount').textContent = all.length;
    $('#linkCount').hidden = !all.length;
    $('#emptyLinks').hidden = list.length > 0;
    $('#linksTable tbody').innerHTML = list.map(r => `
        <tr data-id="${esc(r.id)}">
          <td>${r.guest ? esc(r.guest) : '<i>Everyone</i>'}</td>
          <td><b>${esc(r.who)}</b><br><small>${esc((PRESETS[r.type] || PRESETS.wedding).label)}</small></td>
          <td>${esc(designLabel(r.theme))}</td>
          <td><small>${new Date(r.created).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</small></td>
          <td class="acts">
            <button type="button" class="btn-small" data-copy="${esc(r.url)}">Copy</button>
            <a class="btn-small" target="_blank" rel="noopener" href="${esc(r.url)}">Open</a>
            <button type="button" class="btn-small" data-edit="${esc(r.id)}" title="Load into editor">Edit</button>
            <button type="button" class="btn-small danger" data-del="${esc(r.id)}" aria-label="Delete">✕</button>
          </td>
        </tr>`).join('');
  }

  $('#search').addEventListener('input', renderLinks);

  $('#linksTable').addEventListener('click', async e => {
    const edit = e.target.closest('[data-edit]'), del = e.target.closest('[data-del]');
    if (edit) {
      const r = loadLinks().find(x => x.id === edit.dataset.edit);
      if (!r) return;
      // Start from a blank card so preset values never fill fields the saved link left empty.
      try {
        const hash = r.code || new URL(r.url).hash.slice(1);
        // A short link holds only a code: its card is in the database.
        const card = /^[A-Za-z0-9]{6,16}$/.test(hash) && useDb
          ? (await DB.select('cards', `select=data&id=eq.${hash}`))[0].data
          : Codec.decode(hash);
        state = Object.assign(Core.blankCard(), card);
      } catch (err) { toast('That saved link is damaged'); return; }
      state.theme = (Templates.get(state.theme) || Templates.get(1)).no;
      touched = true;
      fillForm();
      updatePreview(true);
      goTo('create');
      toast('Loaded into editor. Change it and get a new link');
    } else if (del) {
      saveLinks(loadLinks().filter(x => x.id !== del.dataset.del));
      renderLinks();
    }
  });

  $('#clearAll').addEventListener('click', () => {
    if (!loadLinks().length || !confirm('Delete all saved links from this browser? (Links already shared keep working.)')) return;
    saveLinks([]);
    renderLinks();
  });

  $('#csv').addEventListener('click', () => {
    const rows = [['Guest', 'Invitation', 'Occasion', 'Design', 'Created', 'Link']].concat(loadLinks().map(r => [
      r.guest || 'Everyone', r.who, (PRESETS[r.type] || PRESETS.wedding).label, designLabel(r.theme), new Date(r.created).toISOString(), r.url
    ]));
    const csv = rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    download('wedding-card-links.csv', '﻿' + csv, 'text/csv');
  });

  // ---------- Catalog ----------
  $('#catOcc').innerHTML = '<option value="">All occasions</option>' + Object.entries(PRESETS).map(([k, p]) => `<option value="${k}">${p.icon} ${esc(p.label)}</option>`).join('');
  const occOptions = sel => Object.entries(PRESETS).map(([k, p]) => `<option value="${k}"${k === sel ? ' selected' : ''}>${p.icon} ${esc(p.label)}</option>`).join('');

  function catalogRows() {
    const q = $('#catSearch').value, occ = $('#catOcc').value, show = $('#catShow').value;
    return entries().filter(e => Catalog.matches(e, q, occ) && (
      !show || (show === 'trending' && e.featured) || (show === 'hidden' && e.hidden) || (show === 'changed' && cfg.catalog[e.no])));
  }

  // 50 rows at a time ("Show more" adds the next 50); a new search or filter starts again from the top
  const CAT_PAGE = 50;
  let catShown = CAT_PAGE;
  function renderCatalog() {
    const all = catalogRows(), cur = cfg.site.currency || '', rows = all.slice(0, catShown);
    $('#catCount').textContent = `${all.length} design${all.length === 1 ? '' : 's'} · ${entries().filter(e => !e.hidden).length} on the website`;
    $('#catMore').hidden = all.length <= rows.length;
    $('#catMore').textContent = `Show more (${all.length - rows.length} left)`;
    $('#catTable tbody').innerHTML = rows.map(e => {
      const own = cfg.catalog[e.no] || {};
      return `
        <tr data-no="${e.no}" class="${e.hidden ? 'off' : ''}">
          <td><span class="dot" style="--a:${e.vars['--accent']};--b:${e.vars['--bg']}">${e.emoji}</span> <b>${Templates.serial(e.no)}</b></td>
          <td><input data-f="name" value="${esc(e.name)}" placeholder="${esc(Templates.get(e.no).name)}" aria-label="Name"></td>
          <td><select data-f="occasion" aria-label="Occasion">${occOptions(e.occasion)}</select></td>
          <td><select data-f="intro" aria-label="Opening">${Object.entries(INTROS).map(([k, label]) => `<option value="${k}"${k === e.intro ? " selected" : ""}>${label}</option>`).join("")}</select></td>
          <td><input data-f="price" class="price-in" inputmode="numeric" value="${esc(own.price ?? '')}" placeholder="${esc(cfg.site.price ? cur + cfg.site.price : '-')}" aria-label="Price"></td>
          <td><label class="switch"><input type="checkbox" data-f="show"${e.hidden ? '' : ' checked'}><span></span></label></td>
          <td><label class="switch"><input type="checkbox" data-f="featured"${e.featured ? ' checked' : ''}><span></span></label></td>
          <td><button type="button" class="btn-small" data-use="${e.no}">Use</button></td>
        </tr>`;
    }).join('');
  }

  function setCatalog(no, field, value) {
    const o = { ...(cfg.catalog[no] || {}) };
    if (field === 'show') { if (value) delete o.hidden; else o.hidden = true; }
    else if (field === 'featured') { if (value) o.featured = true; else delete o.featured; }
    else if (field === 'price') { const v = String(value).replace(/[^\d.]/g, ''); if (v) o.price = Number(v); else delete o.price; }
    else o[field] = value;
    cfg.catalog = Catalog.clean({ ...cfg.catalog, [no]: o });
    saveDraft();
  }

  let catTimer;
  $('#catTable').addEventListener('input', e => {
    const f = e.target.dataset.f, no = +e.target.closest('tr')?.dataset.no;
    if (!f || !no) return;
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setCatalog(no, f, value);
    if (e.target.type === 'checkbox' || e.target.tagName === 'SELECT') {
      e.target.closest('tr').classList.toggle('off', !!(cfg.catalog[no] || {}).hidden);
      clearTimeout(catTimer);
      catTimer = setTimeout(() => { renderGallery(); markDesign(); }, 300);
    }
  });
  $('#catTable').addEventListener('change', e => { if (e.target.dataset.f === 'name') { renderGallery(); markDesign(); } });
  $('#catTable').addEventListener('click', e => {
    const use = e.target.closest('[data-use]');
    if (!use) return;
    chooseDesign(+use.dataset.use);
    goTo('create');
  });
  ['catSearch', 'catOcc', 'catShow'].forEach(id => $('#' + id).addEventListener('input', () => { catShown = CAT_PAGE; renderCatalog(); }));
  $('#catMore').addEventListener('click', () => { catShown += CAT_PAGE; renderCatalog(); });
  document.querySelectorAll('[data-bulk]').forEach(b => b.addEventListener('click', () => {
    const rows = catalogRows(), show = b.dataset.bulk === 'show';
    if (!rows.length || (!show && !confirm(`Hide ${rows.length} designs from the website?`))) return;
    rows.forEach(e => setCatalog(e.no, 'show', show));
    renderCatalog();
    renderGallery();
    toast(`${rows.length} designs ${show ? 'shown' : 'hidden'}. Publish to update the website.`);
  }));

  // ---------- Settings ----------
  const siteForm = $('#siteForm');
  function fillSettings() {
    for (const k of SITE_KEYS) siteForm.elements[k].value = cfg.site[k] ?? '';
    siteForm.elements.whatsapp.value = tenDigits(cfg.site.whatsapp);
    showMobileHint(siteForm.elements.whatsapp);
  }
  // The website address and WhatsApp number are saved only when complete and valid (on leaving the field),
  // so auto-save never puts a half-typed number on the live site.
  const CHECKED = ['url', 'whatsapp'];
  siteForm.addEventListener('input', e => {
    if (SITE_KEYS.includes(e.target.name) && !CHECKED.includes(e.target.name)) {
      cfg.site[e.target.name] = e.target.value.trim();
      saveDraft();
    }
  });
  siteForm.addEventListener('change', e => {
    const k = e.target.name, value = e.target.value.trim();
    if (k === 'url') {
      let u = value;
      if (u && !/^https?:\/\//i.test(u)) u = 'https://' + u;
      const url = u ? Core.safeUrl(u.replace(/\/*$/, '/')) : '';
      if (u && !url) toast('That website address does not look right');
      else cfg.site.url = url;
    }
    if (k === 'whatsapp') {
      const number = Core.mobile(value);
      if (value && !number) toast('WhatsApp number: please enter a 10-digit mobile number');
      else cfg.site.whatsapp = number;
    }
    if (k === 'price') cfg.site.price = String(cfg.site.price).replace(/[^\d.]/g, '');
    if (k === 'instagram') cfg.site.instagram = cfg.site.instagram.replace(/^@/, '');
    fillSettings();
    saveDraft();
    renderCatalog();
  });

  // ---------- Publish ----------
  let server = false;
  async function detectServer() {
    if (useDb) {
      // Logged in: every change goes straight into the database and the website shows it at once.
      server = true;
      $('#publishHelp').innerHTML = '✅ <b>Auto-save is on.</b> Every change is saved to the database and the website shows it right away. You only need this button to retry.';
      saveDraft();
      return;
    }
    let status = {};
    // The panel server on this PC (Start Admin.cmd) answers here; the live site's /api needs no asking.
    if (location.protocol.startsWith('http') && /^(localhost|127\.0\.0\.1)$/.test(location.hostname)) {
      try { status = await (await fetch('api/status', { cache: 'no-store' })).json(); } catch (e) { status = {}; }
    }
    // On your PC the panel server can always save; online it needs the GitHub token set in Vercel.
    server = status.ok === true && (!status.online || status.git === true);
    $('#publishHelp').innerHTML = server
      ? '✅ <b>Auto-save is on.</b> Every change here is saved to the website by itself and is live in about a minute. You only need this button to retry.'
      : status.online
        ? 'Auto-save to the website needs <b>GITHUB_TOKEN</b> in Vercel (see README). Until then, changes stay on this device and this button downloads <b>config.js</b>.'
        : 'Open the panel with <b>Start Admin.cmd</b> and every change saves to the website by itself. Opened as a file, this button downloads <b>config.js</b> instead.';
    offlineHelp = status.online
      ? '📝 Saved on this device only. To save to the website automatically, add GITHUB_TOKEN in Vercel (see Settings).'
      : '📝 Saved on this device only. Open the panel with Start Admin.cmd to save to the website automatically.';
    saveDraft(); // refresh the bar, and send any change left from last time
  }

  // Logged in: writes the settings and the catalog into the database (the website reads them on every visit).
  async function saveToDb(c) {
    const now = new Date().toISOString();
    await DB.update('site_settings', 'id=eq.1', { data: c.site, updated_at: now });
    const rows = Object.entries(c.catalog).map(([no, data]) => ({ design_no: +no, data, updated_at: now }));
    if (rows.length) await DB.upsert('catalog', rows);
    // Designs no longer changed by you go back to their defaults.
    await DB.remove('catalog', rows.length ? `design_no=not.in.(${rows.map(r => r.design_no).join(',')})` : 'design_no=gte.1');
  }

  // Sends the current settings + catalog: to the database when logged in, otherwise to the panel server
  // on this PC, which saves js/config.js and puts it live.
  async function sendConfig() {
    const c = normalize(cfg);
    const log = $('#publishLog');
    if (useDb) {
      try {
        await saveToDb(c);
        published = c;
        try { if (!isDirty()) localStorage.removeItem(DRAFT_KEY); } catch (e) { /* private mode */ }
        log.hidden = true;
        return { saved: true, published: false, message: 'The website shows it right away.' };
      } catch (e) {
        log.hidden = false;
        log.textContent = e.message;
        return { saved: false, published: false, message: /JWT|expired|auth/i.test(e.message) ? 'your login expired, please log in again' : e.message };
      }
    }
    try {
      const res = await (await fetch('api/publish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ config: Catalog.configFile(c.site, c.catalog) }) })).json();
      log.hidden = false;
      log.textContent = res.message + (res.log ? '\n\n' + res.log : '');
      if (res.saved) {
        published = c;
        try { if (!isDirty()) localStorage.removeItem(DRAFT_KEY); } catch (e) { /* private mode */ }
      }
      return res;
    } catch (e) {
      return { saved: false, published: false, message: 'the panel server is not responding (is Start Admin.cmd still open?)' };
    }
  }

  async function publish() {
    if (!server) {
      const c = normalize(cfg);
      download('config.js', Catalog.configFile(c.site, c.catalog), 'text/javascript');
      toast('config.js downloaded. Put it in the js folder and deploy.');
      return;
    }
    clearTimeout(autoTimer);
    document.querySelectorAll('[data-publish]').forEach(b => { b.disabled = true; });
    await autoSave();
    document.querySelectorAll('[data-publish]').forEach(b => { b.disabled = false; });
  }
  document.querySelectorAll('[data-publish]').forEach(b => b.addEventListener('click', publish));

  $('#discardBtn').addEventListener('click', () => {
    if (!confirm('Undo all catalog and settings changes that are not published yet?')) return;
    cfg = clone(published);
    saveDraft();
    fillSettings();
    renderCatalog();
    renderGallery();
    markDesign();
  });

  // ---------- Shared helpers ----------
  document.addEventListener('click', async e => {
    const b = e.target.closest('[data-copy]');
    if (!b) return;
    await copy(b.dataset.copy, 'Link copied ✓');
    // Feedback right on the button (the message at the bottom is easy to miss)
    if (!b.dataset.label) b.dataset.label = b.textContent;
    b.textContent = '✓ Copied';
    b.classList.add('copied');
    clearTimeout(b.copiedTimer);
    b.copiedTimer = setTimeout(() => { b.textContent = b.dataset.label; b.classList.remove('copied'); }, 2000);
  });

  function download(name, text, type) {
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([text], { type })), download: name });
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  // Videos can be shared from the device's share sheet (WhatsApp, Instagram, Mail…). The Share button only shows
  // where the browser can share files; otherwise the video is just downloaded.
  let recShareFile = null, stShareFile = null;
  const canShareFile = file => !!(navigator.share && navigator.canShare && navigator.canShare({ files: [file] }));
  async function shareFile(file, title) {
    try { await navigator.share({ files: [file], title }); }
    catch (e) { if (e.name !== 'AbortError') toast(`Could not share: ${e.message}`); }
  }
  $('#recShare').addEventListener('click', () => recShareFile && shareFile(recShareFile, 'Invitation video'));
  $('#stShare').addEventListener('click', () => stShareFile && shareFile(stShareFile, 'Story video'));

  // The last video made on this page, downloadable from the main screen (also after its window is closed).
  let lastVideo = null;
  function keepVideo(file) {
    lastVideo = file;
    $('#lastVideoBtn').disabled = false;
  }
  $('#lastVideoBtn').addEventListener('click', () => {
    if (!lastVideo) return;
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(lastVideo), download: lastVideo.name });
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  // ---------- Ready videos ----------
  // Finished videos kept in videos/ (720×1280 MP4 with a poster). Add one here, e.g.
  // { file: 'videos/name.mp4', poster: 'videos/name.jpg', name: 'Rahul ✦ Priya', note: 'Wedding invite · 55 sec', save: 'Rahul-Priya.mp4' }
  // Everything in videos/ is public once the site is published: use sample names, never a client's address or phone.
  const READY_VIDEOS = [];
  function renderReady() {
    if (!READY_VIDEOS.length) { $('#readyGrid').innerHTML = '<p class="muted">No ready videos yet. The 81 premium films are on the website under Story videos.</p>'; return; }
    $('#readyGrid').innerHTML = READY_VIDEOS.map((v, i) => `
      <figure class="ready-card panel">
        <video src="${esc(v.file)}" poster="${esc(v.poster)}" controls playsinline preload="none"></video>
        <figcaption><b>${esc(v.name)}</b><small class="muted">${esc(v.note)}</small></figcaption>
        <div class="link-actions">
          <a class="btn-small go" href="${esc(v.file)}" download="${esc(v.save)}">⬇ Download</a>
          <button type="button" class="btn-small" data-ready-share="${i}">📤 Share</button>
        </div>
      </figure>`).join('');
  }
  $('#readyGrid').addEventListener('click', async e => {
    const b = e.target.closest('[data-ready-share]');
    if (!b) return;
    const v = READY_VIDEOS[+b.dataset.readyShare];
    b.disabled = true;
    try {
      const file = new File([await (await fetch(v.file)).blob()], v.save, { type: 'video/mp4' });
      if (canShareFile(file)) await shareFile(file, v.name);
      else { await copy(new URL(v.file, location.href).href, 'Sharing is not available here: video link copied'); }
    } catch (err) { toast(`Could not load the video: ${err.message}`); }
    b.disabled = false;
  });

  async function copy(text, msg) {
    try { await navigator.clipboard.writeText(text); }
    catch (e) {
      const ta = Object.assign(document.createElement('textarea'), { value: text });
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
    }
    toast(msg);
  }

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
  }

  // ---------- Pages ----------
  // One page at a time (Orders, Create, Designs, History, Catalog, Settings) instead of one very long page.
  // A link to any part (#generate, #settings…) opens its page and scrolls to it.
  const PAGES = ['orders', 'create', 'designs', 'ready', 'links', 'catalog', 'settings'];
  let page = '', navigated = false;
  function showPage(p) {
    if (!PAGES.includes(p)) return;
    page = p;
    document.querySelectorAll('main > section[data-page]').forEach(s => { s.hidden = s.dataset.page !== p; });
    document.querySelectorAll('.side-nav a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + p));
    history.replaceState(null, '', '#' + p);
    if (p === 'create') updatePreview(true); // the preview was hidden: draw it again at its size
  }
  function goTo(p, target) {
    navigated = true;
    showPage(p);
    const el = target && (typeof target === 'string' ? $(target) : target);
    if (el && el !== $('#' + p)) el.scrollIntoView({ behavior: 'smooth' }); else scrollTo({ top: 0 });
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    const sec = a && !a.hasAttribute('data-studio') && document.getElementById(a.getAttribute('href').slice(1));
    if (!sec || !sec.dataset.page) return;
    e.preventDefault();
    goTo(sec.dataset.page, sec);
  });
  // The first page: the one in the address, else the orders when some are waiting, else Create
  function firstPage() {
    const h = location.hash.slice(1), sec = h && document.getElementById(h);
    if (sec && sec.dataset.page) { navigated = true; return sec.dataset.page; }
    return loadOrders().some(o => !o.done) ? 'orders' : 'create';
  }
  // The Video Studio for one order (its 🎬 button in the list)
  async function openStudioFor(code) {
    await openStudio();
    const sel = $('#stOrder');
    if ([...sel.options].some(o => o.value === code)) { sel.value = code; sel.dispatchEvent(new Event('change')); }
    else toast('This order has no names yet: fill it in first');
  }

  let started = false;
  function startApp() {
    if (started) return;
    started = true;
    renderGalleryFilters();
    renderGallery();
    fillForm();
    fillSettings();
    renderCatalog();
    renderLinks();
    renderReady();
    renderOrders();
    saveDraft();
    detectServer();
    showPage(firstPage());
    updatePreview(true);
  }

  // ---------- Login (database mode) ----------
  let loginMode = 'login'; // login | forgot | set (choose a password from an invite or reset email)
  const LOGIN_TEXT = {
    login: ['Admin login', 'Log in with your admin email and password.', 'Log in'],
    forgot: ['Reset your password', 'Enter your admin email. We will email you a link to choose a new password.', 'Email me a link'],
    set: ['Choose your password', 'Choose a password for your admin login (at least 8 characters).', 'Save password']
  };
  function showLogin(mode, msg = '') {
    loginMode = mode;
    const f = $('#loginForm').elements, [title, note, button] = LOGIN_TEXT[mode];
    document.body.classList.add('logged-out');
    $('#loginScreen').hidden = false;
    $('#loginTitle').textContent = title;
    $('#loginNote').textContent = note;
    $('#loginBtn').textContent = button;
    $('#emailRow').hidden = mode === 'set';
    $('#pwRow').hidden = mode === 'forgot';
    $('#pw2Row').hidden = mode !== 'set';
    f.password.autocomplete = mode === 'set' ? 'new-password' : 'current-password';
    $('#forgotBtn').hidden = mode === 'set';
    $('#forgotBtn').textContent = mode === 'login' ? 'Forgot password?' : '← Back to login';
    $('#loginMsg').textContent = msg;
    $('#loginMsg').classList.remove('ok');
    (mode === 'set' ? f.password : f.email).focus();
  }
  const friendly = m => /invalid login|invalid_grant|invalid credentials/i.test(m) ? 'Wrong email or password.'
    : /rate|too many|security purposes/i.test(m) ? 'Too many tries. Please wait a minute and try again.'
      : /fetch|network|abort/i.test(m) ? 'No internet connection. Please try again.' : m;

  $('#forgotBtn').addEventListener('click', () => showLogin(loginMode === 'login' ? 'forgot' : 'login'));
  $('#loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target.elements, msg = $('#loginMsg'), btn = $('#loginBtn');
    btn.disabled = true;
    msg.textContent = '';
    msg.classList.remove('ok');
    try {
      if (loginMode === 'login') {
        if (!f.email.value.trim() || !f.password.value) throw new Error('Please enter your email and password.');
        await DB.signIn(f.email.value, f.password.value);
        await enter();
      } else if (loginMode === 'forgot') {
        if (!/^\S+@\S+\.\S+$/.test(f.email.value.trim())) throw new Error('Please enter your email address.');
        await DB.recover(f.email.value, location.origin + location.pathname);
        msg.textContent = '✉️ Sent! If this email is an admin login, a reset link arrives in a minute (check Spam too). Open it on this device.';
        msg.classList.add('ok'); // good news, so not in the error colour
      } else {
        if (f.password.value.length < 8) throw new Error('Please use at least 8 characters.');
        if (f.password.value !== f.password2.value) throw new Error('The two passwords are not the same.');
        await DB.setPassword(f.password.value);
        await enter('✅ Password saved. Welcome!');
      }
    } catch (err) {
      msg.textContent = friendly(err.message);
    } finally {
      btn.disabled = false;
    }
  });

  // Logged in: check this account is an admin, load the live catalog and settings, then open the panel.
  async function enter(welcome) {
    let admin = false;
    try { admin = await DB.isOwner(); } catch (e) { return showLogin('login', friendly(e.message)); }
    if (!admin) {
      await DB.signOut();
      return showLogin('login', 'This account is not an admin.');
    }
    try {
      const live = await DB.loadCatalog({ timeout: 8000 });
      published = normalize({ site: { ...SITE, ...live.site }, catalog: live.catalog });
      cfg = loadDraft() || clone(published);
      if (cfg.site.brand === 'Wedding Card') cfg.site.brand = 'CardAlbum'; // a draft from before the rename
    } catch (e) {
      toast(`Could not load the catalog: ${friendly(e.message)}`);
    }
    $('#loginScreen').hidden = true;
    document.body.classList.remove('logged-out');
    $('#whoAmI').hidden = false;
    $('#whoAmI').textContent = `Logged in as ${DB.user.email}`;
    document.querySelectorAll('[data-logout]').forEach(b => { b.hidden = false; });
    startApp();
    refreshOrders();
    refreshLinks();
    // New website orders show up by themselves.
    setInterval(refreshOrders, 60000);
    addEventListener('focus', refreshOrders);
    if (welcome) toast(welcome);
  }

  document.querySelectorAll('[data-logout]').forEach(b => b.addEventListener('click', async e => {
    e.preventDefault();
    if (!confirm('Log out of the admin panel?')) return;
    await DB.signOut();
    location.replace(location.pathname);
  }));

  async function boot() {
    if (!useDb) return startApp();
    document.body.classList.add('logged-out');
    const hash = new URLSearchParams(location.hash.slice(1));
    if (hash.get('error_description')) {
      history.replaceState(null, '', location.pathname);
      return showLogin('login', 'That email link has expired or was already used. Use "Forgot password?" for a new one.');
    }
    let type = null;
    try { type = await DB.fromLink(location.hash); } catch (e) { return showLogin('login', 'That email link has expired. Use "Forgot password?" for a new one.'); }
    if (type) history.replaceState(null, '', location.pathname);
    if (type === 'invite' || type === 'recovery') return showLogin('set');
    if (DB.user) return enter();
    showLogin('login');
  }
  boot();
})();
