// Admin panel: build a card, pick a template, generate unlimited (optionally per-guest) links, keep a link history.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const { esc, compact, who } = Core;
  const clone = o => JSON.parse(JSON.stringify(o));
  const form = $('#form'), frame = $('#preview');
  const FIELDS = ['title', 'host1', 'host2', 'tagline', 'date', 'venue', 'message', 'photo', 'mapUrl', 'rsvp'];
  const STORE_KEY = 'weddingcard.links';

  let state = clone(PRESETS.wedding.card);
  let previewTimer = null, galleryTimer = null;

  // ---------- Card state ----------
  const code = (overrides) => Codec.encode(compact({ ...state, ...overrides }));
  const occasion = s => (PRESETS[s.type] || PRESETS.wedding);

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
        <input data-k="date" type="datetime-local" value="${esc(e.date)}">
        <input data-k="venue" placeholder="Venue (optional)" value="${esc(e.venue)}">
        <input data-k="dress" placeholder="Dress code (optional)" value="${esc(e.dress)}">
        <button type="button" class="x" data-remove="${i}" aria-label="Remove function">✕</button>
      </div>`).join('');
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

  function fillForm() {
    for (const f of FIELDS) form.elements[f].value = state[f] || '';
    renderPhoto();
    form.elements.music.checked = state.music !== false;
    const labels = occasion(state).labels;
    $('#lbl1').textContent = labels[0];
    $('#lbl2').textContent = labels[1];
    renderTypes();
    renderEvents();
    markTheme();
  }

  function markTheme() {
    const t = THEMES[state.theme] || THEMES.royal;
    $('#themeName').textContent = `${t.emoji} ${t.name}`;
    document.querySelectorAll('.tpl').forEach(el => el.classList.toggle('on', el.dataset.theme === state.theme));
  }

  // ---------- Previews ----------
  function updatePreview(now) {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => { frame.src = 'card.html?preview#' + code(); }, now ? 0 : 300);
    clearTimeout(galleryTimer);
    galleryTimer = setTimeout(updateGallery, now ? 50 : 900);
  }

  function buildGallery() {
    $('#gallery').innerHTML = Object.entries(THEMES).map(([k, t]) => `
      <button type="button" class="tpl" data-theme="${k}" style="--a:${t.vars['--accent']};--b:${t.vars['--bg']}">
        <div class="mini"><iframe tabindex="-1" loading="lazy" title="${esc(t.name)} preview"></iframe></div>
        <span class="tpl-name">${t.emoji} ${esc(t.name)}</span>
        <span class="tpl-pick">Selected ✓</span>
      </button>`).join('');
  }

  function updateGallery() {
    document.querySelectorAll('.tpl').forEach(el => {
      el.querySelector('iframe').src = 'card.html?preview&auto#' + code({ theme: el.dataset.theme, music: false });
    });
  }

  // ---------- Form events ----------
  form.addEventListener('input', e => {
    const t = e.target;
    if (t.closest('.event-row')) state.events[t.closest('.event-row').dataset.i][t.dataset.k] = t.value;
    else if (t.name === 'music') state.music = t.checked;
    else if (FIELDS.includes(t.name)) state[t.name] = t.value;
    else return;
    if (t.name === 'photo') renderPhoto();
    updatePreview();
  });

  form.addEventListener('click', e => {
    const remove = e.target.closest('[data-remove]');
    if (!remove) return;
    state.events.splice(+remove.dataset.remove, 1);
    renderEvents();
    updatePreview();
  });

  $('#typeChips').addEventListener('click', e => {
    const chip = e.target.closest('[data-type]');
    if (!chip) return;
    state = clone(PRESETS[chip.dataset.type].card);
    fillForm();
    updatePreview(true);
  });

  $('#gallery').addEventListener('click', e => {
    const tpl = e.target.closest('[data-theme]');
    if (!tpl) return;
    state.theme = tpl.dataset.theme;
    markTheme();
    clearTimeout(previewTimer);
    frame.src = 'card.html?preview#' + code();
    toast(`Template set: ${THEMES[state.theme].name}`);
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

  // ---------- Link generation ----------
  let lastResults = [];
  $('#generate-btn').addEventListener('click', () => {
    if (!state.host1) { toast('Please fill in a name first'); form.elements.host1.focus(); return; }
    const c = code();
    const guests = $('#guests').value.split('\n').map(g => g.trim()).filter(Boolean);
    const list = guests.length ? guests : [''];
    const now = Date.now();
    lastResults = list.map((g, i) => ({
      id: `${now}-${i}`, guest: g, who: who(state), type: state.type, theme: state.theme,
      url: Core.cardUrl(location.href, c, g), created: now
    }));
    saveLinks([...lastResults, ...loadLinks()]);
    renderResults();
    renderLinks();
    $('#fileWarn').hidden = location.protocol !== 'file:';
    toast(`${lastResults.length} link${lastResults.length > 1 ? 's' : ''} generated 🎉`);
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

  // ---------- Link history ----------
  function loadLinks() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; } catch (e) { return []; }
  }
  function saveLinks(list) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (e) { toast('Could not save history in this browser'); }
  }

  function renderLinks() {
    const all = loadLinks();
    const q = $('#search').value.trim().toLowerCase();
    const list = q ? all.filter(r => `${r.guest} ${r.who}`.toLowerCase().includes(q)) : all;
    $('#linkCount').textContent = all.length;
    $('#emptyLinks').hidden = list.length > 0;
    $('#linksTable tbody').innerHTML = list.map(r => {
      const t = THEMES[r.theme] || THEMES.royal;
      return `
        <tr data-id="${esc(r.id)}">
          <td>${r.guest ? esc(r.guest) : '<i>Everyone</i>'}</td>
          <td><b>${esc(r.who)}</b><br><small>${esc((PRESETS[r.type] || PRESETS.wedding).label)}</small></td>
          <td>${t.emoji} ${esc(t.name)}</td>
          <td><small>${new Date(r.created).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</small></td>
          <td class="acts">
            <button type="button" class="btn-small" data-copy="${esc(r.url)}">Copy</button>
            <a class="btn-small" target="_blank" rel="noopener" href="${esc(r.url)}">Open</a>
            <button type="button" class="btn-small" data-edit="${esc(r.id)}" title="Load into editor">Edit</button>
            <button type="button" class="btn-small danger" data-del="${esc(r.id)}" aria-label="Delete">✕</button>
          </td>
        </tr>`;
    }).join('');
  }

  $('#search').addEventListener('input', renderLinks);

  $('#linksTable').addEventListener('click', e => {
    const edit = e.target.closest('[data-edit]'), del = e.target.closest('[data-del]');
    if (edit) {
      const r = loadLinks().find(x => x.id === edit.dataset.edit);
      if (!r) return;
      // Start from a blank card so preset values never fill fields the saved link left empty.
      try { state = Object.assign(Core.blankCard(), Codec.decode(r.code || new URL(r.url).hash.slice(1))); } catch (err) { toast('That saved link is damaged'); return; }
      fillForm();
      updatePreview(true);
      $('#create').scrollIntoView({ behavior: 'smooth' });
      toast('Loaded into editor. Change it and generate a new link');
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
    const rows = [['Guest', 'Invitation', 'Occasion', 'Template', 'Created', 'Link']].concat(loadLinks().map(r => [
      r.guest || 'Everyone', r.who, (PRESETS[r.type] || PRESETS.wedding).label, (THEMES[r.theme] || THEMES.royal).name, new Date(r.created).toISOString(), r.url
    ]));
    const csv = rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv' })), download: 'wedding-card-links.csv'
    });
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  // ---------- Shared helpers ----------
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-copy]');
    if (b) copy(b.dataset.copy, 'Link copied ✓');
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
    toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  }

  // Highlight the sidebar item for the section in view.
  const navIO = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) document.querySelectorAll('.side-nav a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + en.target.id));
  }), { rootMargin: '-40% 0px -55% 0px' });
  document.querySelectorAll('.block').forEach(s => navIO.observe(s));

  buildGallery();
  fillForm();
  renderLinks();
  updatePreview(true);
})();
