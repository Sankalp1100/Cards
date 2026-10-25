// Admin panel: pick a design by number, fill in the customer's details, generate (per-guest) links, keep a link
// history, and manage the website's catalog and settings (published through server.mjs, or as a config.js download).
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const { esc, compact, who } = Core;
  const clone = o => JSON.parse(JSON.stringify(o));
  const form = $('#form'), frame = $('#preview');
  const FIELDS = ['title', 'host1', 'host2', 'tagline', 'date', 'venue', 'message', 'photo', 'mapUrl', 'rsvp', 'intro'];
  const SITE_KEYS = ['url', 'brand', 'whatsapp', 'instagram', 'price', 'currency'];
  const STORE_KEY = 'weddingcard.links', DRAFT_KEY = 'weddingcard.config';
  const GALLERY_PAGE = 40;

  let state = clone(PRESETS.wedding.card);
  let touched = false; // the customer's details were typed in, so picking a design must not replace them
  let occasionChosen = false; // an occasion was picked by hand, so picking a design must not change it
  let previewTimer = null;

  // ---------- Site settings + catalog (draft until published) ----------
  const normalize = c => ({
    site: Object.fromEntries(SITE_KEYS.map(k => [k, c.site[k] ?? ''])),
    catalog: Catalog.clean(c.catalog)
  });
  let published = normalize({ site: SITE, catalog: CATALOG });
  let cfg = (() => {
    try { const d = JSON.parse(localStorage.getItem(DRAFT_KEY)); if (d && d.site && d.catalog) return normalize(d); } catch (e) { /* no draft */ }
    return clone(published);
  })();
  const isDirty = () => JSON.stringify(normalize(cfg)) !== JSON.stringify(published);
  const entries = () => Catalog.entries(cfg.site, cfg.catalog);
  const entry = no => entries()[no - 1];

  function saveDraft() {
    try { if (isDirty()) localStorage.setItem(DRAFT_KEY, JSON.stringify(cfg)); else localStorage.removeItem(DRAFT_KEY); } catch (e) { /* private mode */ }
    $('#publishBar').hidden = !isDirty();
    $('#urlWarn').hidden = !!cfg.site.url;
    if (cfg.site.url) $('#siteLink').href = $('#siteLinkM').href = cfg.site.url;
  }

  // ---------- Card state ----------
  const code = overrides => Codec.encode(compact({ ...state, ...overrides }));
  const occasion = s => (PRESETS[s.type] || PRESETS.wedding);
  const design = () => Templates.get(state.theme) || Templates.get(1);

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
        <input data-k="date" type="datetime-local" value="${esc(e.date)}">
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

  function fillForm() {
    const sample = occasion(state).card;
    for (const f of FIELDS) {
      form.elements[f].value = state[f] || '';
      if (sample[f] && f !== 'photo') form.elements[f].placeholder = sample[f];
    }
    renderPhoto();
    form.elements.music.checked = state.music !== false;
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

  // ---------- Form events ----------
  form.addEventListener('input', e => {
    const t = e.target;
    if (t.closest('.event-row')) state.events[t.closest('.event-row').dataset.i][t.dataset.k] = t.value;
    else if (t.name === 'music') state.music = t.checked;
    else if (FIELDS.includes(t.name)) state[t.name] = t.value;
    else return;
    touched = true;
    if (t.name === 'photo') renderPhoto();
    updatePreview();
  });

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
    state = { ...clone(occasion(state).card), theme: state.theme };
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
  $('#generate-btn').addEventListener('click', () => {
    if (!state.host1) { toast('Please fill in a name first'); form.elements.host1.focus(); return; }
    const c = code();
    const guests = $('#guests').value.split('\n').map(g => g.trim()).filter(Boolean);
    const list = guests.length ? guests : [''];
    const now = Date.now();
    lastResults = list.map((g, i) => ({
      id: `${now}-${i}`, guest: g, who: who(state), type: state.type, theme: design().no,
      url: Core.cardUrl(cfg.site.url || location.href, c, g), created: now
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
    if (!state.host1) { toast('Please fill in a name first'); form.elements.host1.focus(); return; }
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
      box = new MusicBox(design().tempo);
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

    const blob = new Blob(chunks, { type: recorder.mimeType });
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
  function loadLinks() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; } catch (e) { return []; }
  }
  function saveLinks(list) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (e) { toast('Could not save history in this browser'); }
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

  $('#linksTable').addEventListener('click', e => {
    const edit = e.target.closest('[data-edit]'), del = e.target.closest('[data-del]');
    if (edit) {
      const r = loadLinks().find(x => x.id === edit.dataset.edit);
      if (!r) return;
      // Start from a blank card so preset values never fill fields the saved link left empty.
      try { state = Object.assign(Core.blankCard(), Codec.decode(r.code || new URL(r.url).hash.slice(1))); } catch (err) { toast('That saved link is damaged'); return; }
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
  }
  siteForm.addEventListener('input', e => {
    if (SITE_KEYS.includes(e.target.name)) cfg.site[e.target.name] = e.target.value.trim();
    saveDraft();
  });
  siteForm.addEventListener('change', e => {
    const k = e.target.name;
    if (k === 'url' && cfg.site.url) {
      let u = cfg.site.url;
      if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
      cfg.site.url = Core.safeUrl(u.replace(/\/*$/, '/')) || '';
      if (!cfg.site.url) toast('That website address does not look right');
    }
    if (k === 'whatsapp') cfg.site.whatsapp = Core.waNumber(cfg.site.whatsapp);
    if (k === 'price') cfg.site.price = String(cfg.site.price).replace(/[^\d.]/g, '');
    if (k === 'instagram') cfg.site.instagram = cfg.site.instagram.replace(/^@/, '');
    fillSettings();
    saveDraft();
    renderCatalog();
  });

  // ---------- Publish ----------
  let server = false;
  async function detectServer() {
    let status = {};
    if (location.protocol.startsWith('http')) {
      try { status = await (await fetch('api/status', { cache: 'no-store' })).json(); } catch (e) { status = {}; }
    }
    // On your PC the panel server can always save; online it needs the GitHub token set in Vercel.
    server = status.ok === true && (!status.online || status.git === true);
    $('#publishHelp').innerHTML = server && status.online
      ? 'Saves <b>js/config.js</b> to GitHub. Vercel puts it live in about a minute.'
      : server
        ? 'Saves <b>js/config.js</b> into your project and pushes it to GitHub. Vercel puts it live in about a minute.'
        : status.online
          ? 'To publish from here, add <b>GITHUB_TOKEN</b> in Vercel (see README). Until then this downloads <b>config.js</b>: put it in the <b>js</b> folder and deploy.'
          : 'Start the panel with <b>npm run admin</b> to publish in one click. Without it, this downloads <b>config.js</b>: put it in the <b>js</b> folder and deploy.';
  }

  async function publish() {
    const c = normalize(cfg);
    const text = Catalog.configFile(c.site, c.catalog);
    const log = $('#publishLog');
    if (!server) {
      download('config.js', text, 'text/javascript');
      toast('config.js downloaded. Put it in the js folder and deploy.');
      return;
    }
    document.querySelectorAll('[data-publish]').forEach(b => { b.disabled = true; });
    toast('Publishing…');
    try {
      const res = await (await fetch('api/publish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ config: text }) })).json();
      log.hidden = false;
      log.textContent = res.message + (res.log ? '\n\n' + res.log : '');
      if (res.saved) {
        published = c;
        saveDraft();
      }
      toast(res.published ? 'Published 🚀' : res.saved ? 'Saved, but not published. See the message below.' : 'Could not publish');
    } catch (e) {
      log.hidden = false;
      log.textContent = 'The panel server is not responding. Is "npm run admin" still running?';
    } finally {
      document.querySelectorAll('[data-publish]').forEach(b => { b.disabled = false; });
    }
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
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-copy]');
    if (b) copy(b.dataset.copy, 'Link copied ✓');
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

  renderGalleryFilters();
  renderGallery();
  fillForm();
  fillSettings();
  renderCatalog();
  renderLinks();
  saveDraft();
  detectServer();
  updatePreview(true);
})();
