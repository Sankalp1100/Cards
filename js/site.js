// Sales page: numbered design posters (the real animated card opens only on "Live demo"), WhatsApp order buttons.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const { esc } = Core;
  const PAGE = 24;

  document.querySelectorAll('.brand').forEach(el => { el.textContent = SITE.brand; });
  // Every "Order" button opens the order form; it ends in one complete WhatsApp message.
  document.querySelectorAll('[data-order]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); openOrder(); }));
  if (SITE.instagram) {
    $('#social').innerHTML = `📸 <a href="https://instagram.com/${encodeURIComponent(SITE.instagram)}" target="_blank" rel="noopener">@${esc(SITE.instagram)}</a>`;
  }

  // ---------- Catalog ----------
  const designs = Catalog.visible(Catalog.entries());
  const occasions = Object.keys(PRESETS).filter(k => designs.some(d => d.occasion === k));
  let filter = '', query = '', shown = 0, list = designs;

  $('#tplCount').textContent = $('#seeAll .n').textContent = designs.length;
  const chips = [['', '✨', 'All']];
  if (designs.some(d => d.featured)) chips.push(['trending', '🔥', 'Trending']);
  $('#tplFilters').innerHTML = chips.concat(occasions.map(k => [k, PRESETS[k].icon, PRESETS[k].label]))
    .map(([k, icon, label]) => `<button type="button" class="chip${k === filter ? ' on' : ''}" data-occ="${k}">${icon} ${esc(label)}</button>`).join('');

  function card(d) {
    const price = Catalog.priceText(d);
    return `
      <article class="tpl" data-no="${d.no}">
        ${Catalog.poster(d, 'a', `href="card.html?demo#${Catalog.demoCode(d)}" target="_blank" rel="noopener" aria-label="Live demo: design ${Templates.serial(d.no)} ${esc(d.name)}"`)}
        <div class="tpl-meta">
          <span class="serial">Design No. <b>${Templates.serial(d.no)}</b></span>
          <span class="tpl-name">${esc(d.name)}</span>
          <span class="opening">${INTROS[d.intro]} opening</span>
          <small>${PRESETS[d.occasion].icon} ${esc(PRESETS[d.occasion].label)}${price ? ` · <b class="price">${esc(price)}</b>` : ''}</small>
        </div>
        <button type="button" class="btn-small order" data-design="${d.no}">💬 Order ${Templates.serial(d.no)}</button>
      </article>`;
  }

  function showMore() {
    const next = list.slice(shown, shown + PAGE);
    $('#showcase').insertAdjacentHTML('beforeend', next.map(card).join(''));
    shown += next.length;
    $('#moreBtn').hidden = shown >= list.length;
    $('#moreBtn').textContent = `Show more designs (${list.length - shown} left)`;
    reveal($('#showcase').querySelectorAll('.tpl:not(.rv)'));
  }

  function refresh() {
    list = filter === 'trending'
      ? designs.filter(d => d.featured && Catalog.matches(d, query))
      : designs.filter(d => Catalog.matches(d, query, filter));
    shown = 0;
    $('#showcase').innerHTML = '';
    $('#noMatch').hidden = list.length > 0;
    showMore();
  }

  $('#moreBtn').addEventListener('click', showMore);
  $('#tplFilters').addEventListener('click', e => {
    const chip = e.target.closest('[data-occ]');
    if (!chip) return;
    filter = chip.dataset.occ;
    document.querySelectorAll('#tplFilters .chip').forEach(c => c.classList.toggle('on', c === chip));
    refresh();
  });
  let searchTimer;
  $('#tplSearch').addEventListener('input', e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { query = e.target.value; refresh(); }, 150);
  });

  if (designs[0]) $('#demoBtn').href = `card.html?demo#${Catalog.demoCode(designs[0])}`;

  // ---------- Motion ----------
  // Cursor glow + parallax, one update per frame. The variables live on the cards' container only:
  // setting them on <html> made the browser restyle the whole page on every mouse move.
  const glow = $('.cursor-glow'), floating = $('.floating-cards');
  let pending = null;
  if (matchMedia('(hover: hover)').matches) addEventListener('pointermove', e => {
    if (pending) return;
    pending = requestAnimationFrame(() => {
      pending = null;
      glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      floating.style.setProperty('--mx', (e.clientX / innerWidth - 0.5).toFixed(3));
      floating.style.setProperty('--my', (e.clientY / innerHeight - 0.5).toFixed(3));
    });
  }, { passive: true });

  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }), { threshold: 0.12 });
  function reveal(els) {
    els.forEach((el, i) => {
      el.classList.add('rv');
      el.style.setProperty('--k', i % 6); // stagger for the phone card-deal animation
      el.style.transitionDelay = `${(i % 4) * 80}ms`;
      el.addEventListener('transitionend', () => { el.style.transitionDelay = ''; }, { once: true });
      io.observe(el);
    });
  }
  reveal(document.querySelectorAll('.tile, .builder-head, .cta-band, .stepcard'));
  io.observe($('#signature')); // its own letter-by-letter animation starts on .in

  // ---------- Bottom tab bar (phones): Home and Designs are separate screens ----------
  // On phones the Designs tab shows only the catalog (CSS hides the rest via body[data-tab]); Home shows a preview.
  const trendingTab = $('.bottom-nav [data-trending]');
  const tabs = [...document.querySelectorAll('.bottom-nav [data-sec]')];
  const pickFilter = occ => {
    const chip = $(`#tplFilters [data-occ="${occ}"]`);
    if (chip && !chip.classList.contains('on')) chip.click(); // rebuilds the grid, so the cards deal in again
  };
  function mark(sec) {
    tabs.forEach(a => a.classList.toggle('on', a.dataset.sec === sec));
    trendingTab.classList.toggle('on', sec === 'trending');
  }
  function setTab(tab, { push = true, trending = false } = {}) {
    const was = document.body.dataset.tab;
    document.body.dataset.tab = tab;
    if (tab === 'designs') {
      pickFilter(trending ? 'trending' : filter === 'trending' ? '' : filter);
      if (was !== 'designs' && !trending) refresh();
      scrollTo({ top: 0, behavior: 'instant' });
      mark(trending ? 'trending' : 'templates');
    }
    if (push && tab !== was) history.pushState({ tab }, '', tab === 'designs' ? '#designs' : location.pathname + location.search);
  }
  document.querySelector('.bottom-nav').addEventListener('click', e => {
    const a = e.target.closest('[data-sec], [data-trending]');
    if (!a) return;
    e.preventDefault();
    if (a.dataset.sec === 'templates' || a.hasAttribute('data-trending')) return setTab('designs', { trending: a.hasAttribute('data-trending') });
    setTab('home');
    requestAnimationFrame(() => document.getElementById(a.dataset.sec).scrollIntoView({ behavior: 'smooth' }));
  });
  $('#seeAll').addEventListener('click', () => setTab('designs'));
  addEventListener('popstate', e => setTab(e.state?.tab || (location.hash === '#designs' ? 'designs' : 'home'), { push: false }));
  document.body.dataset.tab = location.hash === '#designs' ? 'designs' : 'home';

  // On the Home tab, highlight the section in view.
  const tabIO = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting && document.body.dataset.tab === 'home') mark(en.target.id);
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['top', 'templates', 'how'].forEach(id => tabIO.observe(document.getElementById(id)));
  // ---------- Order form ----------
  const sheet = $('#orderSheet'), of = $('#orderForm'), STEPS = 5;
  const allEntries = Catalog.entries();
  let step = 0, ord = null;

  function openOrder(design) {
    const e = Templates.get(design) ? allEntries[Templates.get(design).no - 1] : null;
    ord = { design: e ? e.no : '', type: e ? e.occasion : 'wedding', events: [] };
    of.reset();
    of.elements.design.value = e ? e.no : '';
    renderOccasions();
    renderEvents();
    showDesign();
    goTo(0);
    sheet.hidden = false;
    document.body.classList.add('sheet-open');
  }
  function closeOrder() {
    sheet.hidden = true;
    document.body.classList.remove('sheet-open');
  }

  function renderOccasions() {
    $('#osOcc').innerHTML = Object.entries(PRESETS).map(([k, p]) =>
      `<button type="button" class="chip${k === ord.type ? ' on' : ''}" data-type="${k}">${p.icon} ${esc(p.label)}</button>`).join('');
    const [l1, l2] = PRESETS[ord.type].labels;
    $('#osL1').textContent = l1;
    $('#osL2').textContent = l2;
    $('#osQuick').innerHTML = PRESETS[ord.type].card.events.map(ev => ev.name)
      .filter(n => !ord.events.some(ev => ev.name === n))
      .map(n => `<button type="button" class="chip" data-add="${esc(n)}">+ ${esc(n)}</button>`).join('') +
      '<button type="button" class="chip" data-add="">+ Other</button>';
  }
  function renderEvents() {
    $('#osEvents').innerHTML = ord.events.map((ev, i) => `
      <div class="os-event" data-i="${i}">
        <input data-k="name" value="${esc(ev.name)}" placeholder="Function name" aria-label="Function name">
        <input data-k="date" type="datetime-local" value="${esc(ev.date)}" aria-label="Date and time">
        <button type="button" class="x" data-del="${i}" aria-label="Remove">✕</button>
      </div>`).join('');
  }
  function showDesign() {
    const t = Templates.get(of.elements.design.value);
    const e = t && allEntries[t.no - 1];
    $('#osDesign').textContent = !of.elements.design.value ? 'No design yet? No problem, we will suggest one.'
      : e ? `✓ ${Templates.serial(e.no)} ${e.name} · ${INTROS[e.intro]} opening` : 'There is no design with that number.';
  }

  function collect() {
    const v = n => of.elements[n].value.trim();
    const t = Templates.get(v('design'));
    return {
      design: t ? t.no : '', type: ord.type, host1: v('host1'), host2: v('host2'), date: v('date'), venue: v('venue'), mapUrl: v('mapUrl'),
      events: ord.events.filter(ev => ev.name.trim()), message: v('message'), rsvp: v('rsvp'),
      guests: v('guests').split('\n').map(g => g.trim()).filter(Boolean), photo: of.elements.photo.checked
    };
  }

  // What each step needs before moving on.
  function problem(n) {
    if (n === 0 && of.elements.design.value && !Templates.get(of.elements.design.value)) return 'Please check the design number, or leave it empty.';
    if (n === 1 && !of.elements.host1.value.trim()) return `Please enter: ${PRESETS[ord.type].labels[0]}`;
    if (n === 1 && !of.elements.date.value) return 'Please choose the date and time.';
    if (n === 1 && of.elements.mapUrl.value.trim() && !Catalog.mapLink(of.elements.mapUrl.value)) return 'The location should be a link (https://…), or leave it empty.';
    return '';
  }

  // Optional: fill the location with where the customer is now (useful when they are at the venue).
  $('#osHere').addEventListener('click', () => {
    const msg = $('#osLocMsg');
    if (!navigator.geolocation) { msg.textContent = 'This phone cannot share its location. Paste a Google Maps link instead.'; return; }
    msg.textContent = 'Finding your location…';
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude: lat, longitude: lng } = pos.coords;
      of.elements.mapUrl.value = `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
      msg.textContent = '✓ Location added. Only do this if you are at the venue.';
    }, () => { msg.textContent = 'Location not allowed. You can paste a Google Maps link instead, or skip it.'; }, { enableHighAccuracy: true, timeout: 10000 });
  });

  function goTo(n) {
    step = n;
    of.querySelectorAll('.os-step').forEach(s => { s.hidden = +s.dataset.step !== n; });
    $('#osDots').querySelectorAll('li').forEach((d, i) => d.classList.toggle('on', i <= n));
    $('#osBack').style.visibility = n ? 'visible' : 'hidden';
    $('#osError').textContent = '';
    const last = n === STEPS - 1;
    $('#osNext').hidden = last;
    $('#osSend').hidden = !last || !SITE.whatsapp;
    $('#osNoWa').hidden = !last || !!SITE.whatsapp;
    if (last) {
      const msg = Catalog.orderMessage(collect(), allEntries);
      $('#osReview').textContent = msg.replace(/\*/g, '').replace(/\n\nOrder code.*$/s, '\n\n🔑 An order code is added so we can start right away.');
      $('#osSend').href = Core.orderUrl(SITE.whatsapp, msg);
    }
    $('.os-body').scrollTop = 0;
  }

  $('#osNext').addEventListener('click', () => {
    const p = problem(step);
    if (p) { $('#osError').textContent = p; return; }
    goTo(step + 1);
  });
  $('#osBack').addEventListener('click', () => goTo(Math.max(0, step - 1)));
  $('#osClose').addEventListener('click', closeOrder);
  sheet.addEventListener('click', e => { if (e.target === sheet) closeOrder(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !sheet.hidden) closeOrder(); });
  $('#osSend').addEventListener('click', () => setTimeout(closeOrder, 300));

  of.addEventListener('click', e => {
    const occ = e.target.closest('[data-type]'), add = e.target.closest('[data-add]'), del = e.target.closest('[data-del]');
    if (occ) { ord.type = occ.dataset.type; renderOccasions(); }
    else if (add) {
      ord.events.push({ name: add.dataset.add, date: of.elements.date.value, venue: '' });
      renderEvents();
      renderOccasions();
      if (!add.dataset.add) $('#osEvents .os-event:last-child input').focus();
    } else if (del) { ord.events.splice(+del.dataset.del, 1); renderEvents(); renderOccasions(); }
  });
  of.addEventListener('input', e => {
    const row = e.target.closest('.os-event');
    if (row) ord.events[row.dataset.i][e.target.dataset.k] = e.target.value;
    if (e.target.name === 'design') { e.target.value = e.target.value.replace(/\D/g, ''); showDesign(); }
  });
  // Picking a design number changes the occasion to the design's own (until the customer picks one by hand).
  of.elements.design.addEventListener('change', () => {
    const t = Templates.get(of.elements.design.value);
    if (t) { ord.type = allEntries[t.no - 1].occasion; renderOccasions(); }
  });
  $('#showcase').addEventListener('click', e => {
    const b = e.target.closest('[data-design]');
    if (b) openOrder(+b.dataset.design);
  });

  refresh();
  // Coming from a demo card's "Order" bar: index.html?order=47
  const wanted = new URLSearchParams(location.search).get('order');
  if (wanted !== null) openOrder(+wanted);
})();
