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
    Promise.all(jobs).catch(e => { toast(`Orders not saved: ${e.message}`); refreshOrders(); });
  }
  async function refreshOrders() {
    if (!useDb || !DB.user) return;
    try {
      const rows = await DB.select('orders', 'select=*&order=created_at.desc&limit=500');
      ordersCache = rows.map(r => ({ id: r.id, code: r.code, name: r.names || 'Customer', type: r.occasion, design: r.design_no || '', date: r.event_date, received: Date.parse(r.created_at), done: r.status === 'done' }));
      renderOrders();
    } catch (e) { /* keep the list we have */ }
  }

  function rememberOrder(code, order) {
    const list = loadOrders();
    if (list.some(o => o.code === code)) { renderOrders(code); return; } // already in the list
    const c = order.card;
    list.unshift({ id: newId(), code, name: who(c), type: c.type, design: c.theme || '', date: c.date, received: Date.now(), done: false });
    saveOrders(list);
    renderOrders(code);
  }

  // Everything the customer sent, written out the way the order message lists it (without the code line).
  function orderDetails(code) {
    const r = Catalog.readOrder(code);
    if (!r || r.partial) return 'Only the design number is known for this order.';
    const text = Catalog.orderMessage({ ...r.card, design: r.card.theme, guests: r.guests, photo: r.photo, gallery: r.gallery }, Catalog.entries());
    return text.split('\n').slice(1).filter(l => l && !/^Order (code|no)/.test(l)).map(l => l.replace(/\*/g, '')).join('\n');
  }

  function renderOrders(active) {
    const list = loadOrders().sort((a, b) => (a.done - b.done) || (b.received - a.received));
    const open = list.filter(o => !o.done).length;
    $('#ordersCount').hidden = !open;
    $('#ordersCount').textContent = open;
    $('#ordersList').innerHTML = list.map(o => {
      const when = Core.parseDate(o.date);
      return `
        <div class="order-item${o.done ? ' done' : ''}${o.code === active ? ' on' : ''}">
          <button type="button" class="order-open" data-open="${esc(o.code)}" title="Fill the editor with this order">
            <b>${esc(o.name)}${Catalog.refOf(o.code) ? ` <span class="order-ref">${Catalog.refOf(o.code)}</span>` : ''}</b>
            <small>${(PRESETS[o.type] || PRESETS.wedding).icon} ${esc((PRESETS[o.type] || PRESETS.wedding).label)}${o.design ? ` · ${Templates.serial(o.design)}` : ''}${when ? ` · ${when.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}` : ''}</small>
            <small class="ago">Received ${new Date(o.received).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</small>
          </button>
          <button type="button" class="btn-small" data-done="${esc(o.code)}" title="${o.done ? 'Mark as not done' : 'Mark as done'}">${o.done ? '↺' : '✓'}</button>
          <button type="button" class="btn-small danger" data-forget="${esc(o.code)}" aria-label="Delete order">✕</button>
          <details class="order-details"><summary>View details</summary><pre>${esc(orderDetails(o.code))}</pre></details>
        </div>`;
    }).join('');
  }

  $('#ordersList').addEventListener('click', e => {
    const open = e.target.closest('[data-open]'), done = e.target.closest('[data-done]'), forget = e.target.closest('[data-forget]');
    if (open) {
      const order = Catalog.readOrder(open.dataset.open);
      if (order) { fillOrder(order); renderOrders(open.dataset.open); $('.create-grid').scrollIntoView({ behavior: 'smooth' }); }
    } else if (done) {
      saveOrders(loadOrders().map(o => o.code === done.dataset.done ? { ...o, done: !o.done } : o));
      renderOrders();
    } else if (forget && confirm('Delete this order from the list?')) {
      saveOrders(loadOrders().filter(o => o.code !== forget.dataset.forget));
      renderOrders();
    }
  });

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
    rememberOrder(ref ? text : text.match(/WC1\.[A-Za-z0-9_-]+/)[0], order);
    $('#orderPaste').value = '';
    fillOrder(order);
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
      ' Check the headline and tagline, then Get links.';
    toast('Order filled in ✨');
  }
  $('#orderFill').addEventListener('click', fillFromOrder);
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

  function fillForm() {
    const sample = occasion(state).card;
    for (const f of FIELDS) {
      form.elements[f].value = state[f] || '';
      if (sample[f] && f !== 'photo') form.elements[f].placeholder = sample[f];
    }
    form.elements.date.min = Core.nowLocal(); // past dates can't be picked
    form.elements.rsvp.value = tenDigits(state.rsvp);
    showMobileHint(form.elements.rsvp);
    renderPhoto();
    form.elements.music.checked = state.music !== false;
    form.elements.rsvpForm.checked = state.rsvpForm !== false;
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
    $('#create').scrollIntoView({ behavior: 'smooth' });
  });

  // ---------- Link generation ----------
  let lastResults = [];
  // A card needs a name, and its date (if any) must not have passed.
  function cardReady() {
    if (!state.host1) { toast('Please fill in a name first'); form.elements.host1.focus(); return false; }
    if (state.date && state.date < Core.nowLocal()) { toast('That date has already passed. Please choose a future date'); form.elements.date.focus(); return false; }
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
      url: urls ? urls[i] : Core.cardUrl(site, c, g), created: now
    }));
    saveLinks([...lastResults, ...loadLinks()]);
    renderResults();
    renderLinks();
    toast(`${lastResults.length} link${lastResults.length > 1 ? 's' : ''} ready 🎉`);
  });

  function linkActions(r) {
    return `
      <button type="button" class="btn-small" data-copy="${esc(r.url)}">Copy</button>
      <a class="btn-small wa" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(Core.inviteText({ guest: r.guest, who: r.who, label: occasion(r).label, link: r.url }))}">WhatsApp</a>
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
    $('#recDownload').hidden = true;
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
      recStream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30, width: { ideal: 3840 }, height: { ideal: 2160 }, resizeMode: 'none' }, audio: false, preferCurrentTab: true, selfBrowserSurface: 'include', surfaceSwitching: 'exclude' });
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

    const tracks = [track];
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
    const recorder = new MediaRecorder(new MediaStream(tracks), { mimeType, videoBitsPerSecond: 6e6 });
    const chunks = [];
    recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    const stopped = new Promise(r => { recorder.onstop = r; });

    const t0 = Date.now(), expected = 23000;
    const tick = setInterval(() => recStatus(`🔴 Recording… ${Math.round((Date.now() - t0) / 1000)}s. Keep this window open.`, Math.min(0.97, (Date.now() - t0) / expected)), 250);
    recorder.start(500);
    recFrame.contentWindow.postMessage({ wcRecord: 'start' }, '*');
    try { await recWait('done', 60000); }
    finally {
      clearInterval(tick);
      if (recorder.state !== 'inactive') recorder.stop();
      if (box) { box.stop(); box.ctx.close(); }
    }
    await stopped;

    let blob = new Blob(chunks, { type: recorder.mimeType });
    // Browsers record a 'fragmented' MP4 that WhatsApp treats as a broken document: rebuild it as a standard
    // MP4 (same video and sound, just re-indexed, with the right length).
    if (recorder.mimeType.includes('mp4')) {
      try { blob = new Blob([MP4Fix.defragment(new Uint8Array(await blob.arrayBuffer()))], { type: 'video/mp4' }); } catch (e) { /* keep it as recorded */ }
    }
    const ext = recorder.mimeType.includes('mp4') ? 'mp4' : 'webm';
    const name = `${who(state)} invitation.${ext}`.replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, ' ');
    const url = URL.createObjectURL(blob);
    Object.assign($('#recVideo'), { src: url, hidden: false });
    Object.assign($('#recDownload'), { href: url, download: name, hidden: false });
    $('#recDownload').click();
    recStatus(`✅ Saved "${name}" (${(blob.size / 1048576).toFixed(1)} MB) to your Downloads.` +
      (ext === 'webm' ? ' This browser can only make WebM, which WhatsApp does not accept: update Chrome to get MP4.' : ''), 1);
    toast('Video downloaded 🎬');
  }

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
      $('#create').scrollIntoView({ behavior: 'smooth' });
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

  function renderCatalog() {
    const rows = catalogRows(), cur = cfg.site.currency || '';
    $('#catCount').textContent = `${rows.length} design${rows.length === 1 ? '' : 's'} · ${entries().filter(e => !e.hidden).length} on the website`;
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
    $('#create').scrollIntoView({ behavior: 'smooth' });
  });
  ['catSearch', 'catOcc', 'catShow'].forEach(id => $('#' + id).addEventListener('input', renderCatalog));
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

  // Highlight the sidebar item for the section in view.
  const navIO = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) document.querySelectorAll('.side-nav a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + en.target.id));
  }), { rootMargin: '-40% 0px -55% 0px' });
  document.querySelectorAll('.block').forEach(s => navIO.observe(s));

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
    renderOrders();
    saveDraft();
    detectServer();
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
