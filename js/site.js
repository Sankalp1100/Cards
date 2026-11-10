// Sales page: numbered design posters (the real animated card opens only on "Live demo"), WhatsApp order buttons.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const { esc } = Core;
  const PAGE = 24;

  // Every "Order" button opens the order form; it ends in one complete WhatsApp message.
  document.querySelectorAll('[data-order]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); openChooser(); }));

  // ---------- Catalog ----------
  // Drawn at once from js/config.js, then again if the live settings in the database differ (catalog changes
  // show up immediately, no redeploy). Opened as a file (tests, or offline) the database is not used.
  let designs = [], occasions = [], allEntries = [];
  let filter = '', query = '', shown = 0, list = designs;

  function applyCatalog() {
    allEntries = Catalog.entries();
    // Today's trending designs (they change by themselves every morning at 8:00 India time).
    designs = Catalog.visible(Catalog.trendingToday(allEntries));
    occasions = Object.keys(PRESETS).filter(k => designs.some(d => d.occasion === k));
    document.querySelectorAll('.brand').forEach(el => { el.textContent = SITE.brand; });
    $('#social').innerHTML = SITE.instagram
      ? `📸 <a href="https://instagram.com/${encodeURIComponent(SITE.instagram)}" target="_blank" rel="noopener">@${esc(SITE.instagram)}</a>` : '';
    $('#tplCount').textContent = $('#seeAll .n').textContent = $('#catShowAll .n').textContent = designs.length;
    const chips = [['', '✨', 'All']];
    if (designs.some(d => d.featured)) chips.push(['trending', '🔥', 'Trending']);
    if (filter && !chips.concat(occasions.map(k => [k])).some(([k]) => k === filter)) filter = '';
    $('#tplFilters').innerHTML = chips.concat(occasions.map(k => [k, PRESETS[k].icon, PRESETS[k].label]))
      .map(([k, icon, label]) => `<button type="button" class="chip${k === filter ? ' on' : ''}" data-occ="${k}">${icon} ${esc(label)}</button>`).join('');
    // "What are you celebrating?": one tile per occasion with its number of designs.
    $('#occPicker').innerHTML = occasions.map(k => {
      const n = designs.filter(d => d.occasion === k).length;
      return `<button type="button" class="occ-tile" data-pick="${k}"><span>${PRESETS[k].icon}</span><b>${esc(PRESETS[k].label)}</b><small>${n} designs</small></button>`;
    }).join('');
    renderHot();
    renderStyles();
  }

  // ---------- Hero phones and the 10 styles ----------
  // One line about each style, for the styles row.
  const STYLE_NOTES = {
    ivory: 'Ivory paper, gold monogram, italic names', palace: 'Velvet night, gold arches, glowing lanterns',
    bloom: 'Watercolour pastels and flower corners', minimal: 'Big serif names, hairlines, lots of space',
    marigold: 'Sunshine yellow, marigold garlands', mehendi: 'Henna green and gold lace',
    pichwai: 'Temple teal with pink lotuses', retro: 'Bollywood marquee lights and tickets',
    neon: 'Glowing neon on a synthwave night', toybox: 'Candy colours, balloons and bunting'
  };
  // The first design of a style that customers can see, a wedding one when there is one.
  const firstOf = s => designs.filter(d => d.style === s).sort((a, b) => (b.occasion === 'wedding') - (a.occasion === 'wedding') || a.no - b.no)[0];
  const demoLink = d => `card.html?demo#${Catalog.demoCode(d)}`;
  function renderStyles() {
    const styles = Object.keys(STYLES).filter(firstOf);
    // Hero: three contrasting styles in phone frames.
    $('#heroPhones').innerHTML = ['palace', 'ivory', 'neon'].filter(firstOf).map((s, i) =>
      `<div class="hphone h${i + 1}"><i class="hp-notch"></i>${Catalog.poster(firstOf(s), 'div', '')}</div>`).join('');
    $('#styleReel').innerHTML = styles.map(s => {
      const d = firstOf(s), n = designs.filter(x => x.style === s).length;
      const occ = [...new Set(designs.filter(x => x.style === s).map(x => PRESETS[x.occasion].label))].slice(0, 3).join(' · ');
      return `<article class="style-card">
        ${Catalog.poster(d, 'a', `href="${demoLink(d)}" target="_blank" rel="noopener" aria-label="Live demo of the ${esc(STYLES[s].label)} style: design ${Templates.serial(d.no)}"`)}
        <h3>${esc(STYLES[s].label)}</h3><p>${esc(STYLE_NOTES[s] || '')}</p><small>${n} designs · ${esc(occ)}</small>
      </article>`;
    }).join('');
  }

  // ---------- Trending tab: ranked slides you swipe through, then the top pick of every occasion ----------
  const colors = d => { const v = d.vars; return `--a:${v['--accent']};--a2:${v['--accent2']};--b:${v['--bg']};--c:${v['--bg2']};--i:${v['--ink']}`; };
  function renderHot() {
    const hot = designs.filter(d => d.featured).slice(0, Catalog.TRENDING_COUNT); // today's order
    $('#hotReel').innerHTML = hot.map((d, i) => {
      const p = PRESETS[d.occasion], demo = `card.html?demo#${Catalog.demoCode(d)}`;
      return `
        <article class="hot-slide${i ? '' : ' on'}" style="${colors(d)}">
                    ${Catalog.poster(d, 'a', `href="${demo}" target="_blank" rel="noopener" aria-label="Live demo: design ${Templates.serial(d.no)}"`)}
          <div class="hot-info">
            <span class="hot-rank" aria-label="Rank ${i + 1}">${i + 1}</span>
            <b>${Templates.serial(d.no)} · ${esc(d.name)}</b>
            <small>${p.icon} ${esc(p.label)} · ${esc(INTROS[d.intro] || '')} opening</small>
          </div>
          <div class="hot-btns">
            <a class="btn-line" href="${demo}" target="_blank" rel="noopener">▶ Watch</a>
            <button type="button" class="btn-glow" data-design="${d.no}"><span>💬 Order this</span></button>
          </div>
        </article>`;
    }).join('');
    $('#hotDots').innerHTML = hot.map((d, i) => `<i class="${i ? '' : 'on'}"></i>`).join('');
    $('#hotOcc').innerHTML = occasions.map(k => {
      const d = designs.find(x => x.occasion === k), n = designs.filter(x => x.occasion === k).length;
      return `<button type="button" class="hot-occ-card" data-occ-go="${k}" style="${colors(d)}">
        <span class="e">${d.emoji}</span><b>${PRESETS[k].icon} ${esc(PRESETS[k].label)}</b><small>${n} designs →</small></button>`;
    }).join('');
    const slides = [...document.querySelectorAll('#hotReel .hot-slide')], dots = [...document.querySelectorAll('#hotDots i')];
    const seen = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      const i = slides.indexOf(en.target);
      slides.forEach((s, j) => s.classList.toggle('on', j === i));
      dots.forEach((s, j) => s.classList.toggle('on', j === i));
    }), { root: $('#hotReel'), threshold: 0.6 });
    slides.forEach(s => seen.observe(s));
    // A tapped dot slides to its design.
    $('#hotDots').onclick = e => {
      const i = dots.indexOf(e.target.closest('i'));
      if (i >= 0) slides[i].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    };
  }
  applyCatalog();
  $('#hot').addEventListener('click', e => {
    const order = e.target.closest('[data-design]'), occ = e.target.closest('[data-occ-go]');
    if (order) openOrder(+order.dataset.design);
    else if (occ) setTab('designs', { occasion: occ.dataset.occGo });
  });

  const online = location.protocol.startsWith('http') && typeof DB !== 'undefined';
  if (online) {
    DB.loadCatalog().then(live => {
      const before = JSON.stringify([SITE, CATALOG]);
      Object.assign(SITE, live.site);
      for (const k of Object.keys(CATALOG)) delete CATALOG[k];
      Object.assign(CATALOG, live.catalog);
      if (JSON.stringify([SITE, CATALOG]) === before) return;
      applyCatalog();
      refresh();
    }).catch(() => { /* keep js/config.js */ });
  }
  $('#occPicker').addEventListener('click', e => {
    const tile = e.target.closest('[data-pick]');
    if (!tile) return;
    // Phones: open the Designs tab on that occasion. Computers: filter in place and scroll to the designs.
    if (matchMedia('(max-width: 640px)').matches) setTab('designs', { occasion: tile.dataset.pick });
    else {
      $(`#tplFilters [data-occ="${tile.dataset.pick}"]`).click();
      $('#tplFilters').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  function card(d) {
    const price = Catalog.priceText(d);
    return `
      <article class="tpl" data-no="${d.no}">
        ${Catalog.poster(d, 'a', `href="card.html?demo#${Catalog.demoCode(d)}" target="_blank" rel="noopener" aria-label="Live demo: design ${Templates.serial(d.no)} ${esc(d.name)}"`)}
        <div class="tpl-meta">
          <span class="serial">Design No. <b>${Templates.serial(d.no)}</b></span>
          <span class="tpl-name">${esc(d.name)}</span>
          <span class="opening">${INTROS[d.intro]} opening</span>
          <small><span class="tpl-occ">${PRESETS[d.occasion].icon} ${esc(PRESETS[d.occasion].label)}</span>${price ? `<b class="price">${esc(price)}</b>` : ''}</small>
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
    // One occasion picked: its name under every card would only repeat itself.
    $('#showcase').classList.toggle('one-occ', !!filter && filter !== 'trending');
    $('#noMatch').hidden = list.length > 0;
    // With a filter or search on, say so plainly, with a way back to everything.
    const narrowed = filter || query.trim();
    $('#catStatus').hidden = !narrowed;
    if (narrowed) {
      const what = filter === 'trending' ? '🔥 Trending' : filter ? `${PRESETS[filter].icon} ${PRESETS[filter].label}` : 'matching';
      $('#catStatusText').textContent = `Showing ${list.length} ${what} design${list.length === 1 ? '' : 's'} of ${designs.length}`;
    }
    showMore();
  }
  $('#catShowAll').addEventListener('click', () => {
    query = '';
    $('#tplSearch').value = '';
    filter = '';
    document.querySelectorAll('#tplFilters .chip').forEach(c => c.classList.toggle('on', c.dataset.occ === ''));
    refresh();
  });

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

  // ---------- Live demo picker ----------
  // "See a live demo" asks which design: pick an occasion, then tap one of its designs, or type a number.
  // (The button's own link still plays the first design if scripts are slow.)
  const demoSheet = $('#demoSheet');
  let demoOcc = 'wedding';
  const demoHref = d => `card.html?demo#${Catalog.demoCode(d)}`;
  function renderDemoPicker() {
    $('#dsOcc').innerHTML = Object.entries(PRESETS).map(([k, p]) =>
      `<button type="button" class="chip${k === demoOcc ? ' on' : ''}" data-docc="${k}">${p.icon} ${esc(p.label)}</button>`).join('');
    $('#dsPicks').innerHTML = designs.filter(d => d.occasion === demoOcc).map(d => {
      const v = d.vars;
      return `<a class="os-pick" href="${demoHref(d)}" target="_blank" rel="noopener" title="${esc(d.name)}" aria-label="Live demo: design ${Templates.serial(d.no)} ${esc(d.name)}"
        style="--a:${v['--accent']};--a2:${v['--accent2']};--b:${v['--bg']};--c:${v['--bg2']};--i:${v['--ink']}">${d.featured ? '<i>🔥</i>' : ''}<span>${d.emoji}</span><b>${Templates.serial(d.no)}</b><small>${esc(d.name)}</small></a>`;
    }).join('');
  }
  function closeDemo() {
    demoSheet.hidden = true;
    document.body.classList.remove('sheet-open');
  }
  $('#demoBtn').addEventListener('click', e => {
    e.preventDefault();
    $('#dsMsg').textContent = '';
    $('#dsNum').reset();
    renderDemoPicker();
    showDemoStep(false);
    demoSheet.hidden = false;
    document.body.classList.add('sheet-open');
  });
  // The demo sheet asks first: a link card (then the design picker) or a video (then a film plays)
  function showDemoStep(cards) {
    $('#dsChoose').hidden = cards;
    $('#dsCards').hidden = !cards;
    $('#dsTitle').textContent = cards ? 'Which design do you want to see?' : 'What do you want to see?';
  }
  $('#dsChoose').addEventListener('click', e => {
    const b = e.target.closest('[data-demo]');
    if (!b) return;
    if (window.Fun) Fun.buzz(10);
    if (b.dataset.demo === 'card') return showDemoStep(true);
    closeDemo();
    const v = $('#videos'); v && v.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const first = document.querySelector('#filmGrid > *');
    if (first) setTimeout(() => first.click(), 500); // the first premium film plays straight away
  });
  $('#dsBack').addEventListener('click', () => showDemoStep(false));
  $('#dsOcc').addEventListener('click', e => {
    const b = e.target.closest('[data-docc]');
    if (!b) return;
    demoOcc = b.dataset.docc;
    renderDemoPicker();
  });
  $('#dsNum').addEventListener('submit', e => {
    e.preventDefault();
    const t = Templates.get(e.target.elements.no.value);
    const d = t && designs.find(x => x.no === t.no);
    if (!d) { $('#dsMsg').textContent = 'There is no design with that number. Pick one above.'; return; }
    window.open(demoHref(d), '_blank', 'noopener');
  });
  $('#dsNum').elements.no.addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, ''); $('#dsMsg').textContent = ''; });
  // A design opened from the picker closes it, so the page is ready when the customer comes back.
  $('#dsPicks').addEventListener('click', e => { if (e.target.closest('a')) setTimeout(closeDemo, 300); });
  $('#dsClose').addEventListener('click', closeDemo);
  demoSheet.addEventListener('click', e => { if (e.target === demoSheet) closeDemo(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !demoSheet.hidden) closeDemo(); });

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
  }), { threshold: 0.12, rootMargin: '0px 0px 15% 0px' }); // starts a little before it scrolls in, so nothing is caught half-way
  function reveal(els) {
    els.forEach((el, i) => {
      el.classList.add('rv');
      el.style.setProperty('--k', i % 6); // stagger for the phone card-deal animation
      // Deal each card once: off-screen cards skip rendering and would otherwise replay it when scrolled back.
      el.addEventListener('animationend', ev => { if (ev.animationName === 'dealIn') el.classList.add('dealt'); });
      el.style.transitionDelay = `${(i % 4) * 80}ms`;
      el.addEventListener('transitionend', () => { el.style.transitionDelay = ''; }, { once: true });
      io.observe(el);
    });
  }
  reveal(document.querySelectorAll('.tile, .builder-head, .cta-band, .stepcard, .enq-box'));
  if (window.Fun) Fun.progress();
  io.observe($('#signature')); // its own letter-by-letter animation starts on .in

  // ---------- Bottom tab bar (phones): Home and Designs are separate screens ----------
  // On phones the Designs tab shows only the catalog (CSS hides the rest via body[data-tab]); Home shows a preview.
  const trendingTab = $('.bottom-nav [data-trending]');
  const tabs = [...document.querySelectorAll('.bottom-nav [data-sec]')];
  const pickFilter = occ => {
    const chip = $(`#tplFilters [data-occ="${occ}"]`);
    if (chip && !chip.classList.contains('on')) chip.click(); // rebuilds the grid, so the cards deal in again
  };
  const videosTab = $('.bottom-nav [data-videos]');
  function mark(sec) {
    tabs.forEach(a => a.classList.toggle('on', a.dataset.sec === sec));
    trendingTab.classList.toggle('on', sec === 'trending');
    videosTab.classList.toggle('on', sec === 'videos');
  }
  function setTab(tab, { push = true, trending = false, occasion = '' } = {}) {
    const was = document.body.dataset.tab;
    document.body.dataset.tab = tab;
    if (tab === 'designs') {
      pickFilter(occasion || (trending ? 'trending' : filter === 'trending' ? '' : filter));
      if (was !== 'designs' && !trending && !occasion) refresh();
      scrollTo({ top: 0, behavior: 'instant' });
      mark(trending ? 'trending' : 'templates');
    }
    if (tab === 'trending') {
      scrollTo({ top: 0, behavior: 'instant' });
      $('#hotReel').scrollLeft = 0;
      mark('trending');
    }
    if (tab === 'videos') {
      scrollTo({ top: 0, behavior: 'instant' });
      mark('videos');
    }
    if (push && tab !== was) history.pushState({ tab }, '', tab === 'home' ? location.pathname + location.search : '#' + tab);
  }
  document.querySelector('.bottom-nav').addEventListener('click', e => {
    const a = e.target.closest('[data-sec], [data-trending], [data-videos]');
    if (!a) return;
    e.preventDefault();
    if (a.hasAttribute('data-trending')) return setTab('trending');
    if (a.hasAttribute('data-videos')) return setTab('videos');
    if (a.dataset.sec === 'templates') return setTab('designs');
    setTab('home');
    requestAnimationFrame(() => document.getElementById(a.dataset.sec).scrollIntoView({ behavior: 'smooth' }));
  });
  $('#seeAll').addEventListener('click', () => setTab('designs'));
  const tabOfHash = () => ({ '#designs': 'designs', '#trending': 'trending', '#videos': 'videos' })[location.hash] || 'home';
  // Other "Videos" links (top bar, hero): the Videos tab on phones, a scroll down on a computer
  const phoneTabs = () => !!$('.bottom-nav').offsetParent;
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-videos]:not(.bottom-nav *), [data-video-go]');
    if (!a) return;
    if (a.hasAttribute('data-video-go') && !sheet.hidden) closeOrder();
    if (phoneTabs()) { e.preventDefault(); setTab('videos'); }
    else if (a.hasAttribute('data-video-go')) { e.preventDefault(); $('#videos').scrollIntoView({ behavior: 'smooth' }); }
  });
  addEventListener('popstate', e => setTab(e.state?.tab || tabOfHash(), { push: false }));
  document.body.dataset.tab = tabOfHash();
  if (tabOfHash() === 'trending') mark('trending');
  if (tabOfHash() === 'videos') mark('videos');

  // On the Home tab, highlight the section in view.
  const tabIO = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting && document.body.dataset.tab === 'home') mark(en.target.id);
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['top', 'templates', 'videos'].forEach(id => tabIO.observe(document.getElementById(id)));
  // ---------- Story videos: the Video Studio's twenty scenes ----------
  // Each shows a picture (img/videos); a tap plays it with sample names. js/studio.js loads only then.
  const VIDEO_SCENES = [
    ['vrindavan', 'Vrindavan Garden', 'Weddings'], ['jharokha', 'Royal Jharokha', 'Weddings'], ['lotusnight', 'Lotus Night', 'Weddings'],
    ['marigold', 'Marigold Mandap', 'Weddings, pujas'], ['palace', 'Palace Dusk', 'Receptions'], ['blush', 'Blush Floral', 'Engagements'],
    ['temple', 'Temple Gateway', 'Pujas, griha pravesh'], ['haveli', 'Haveli Doors', 'Weddings'], ['mehendi', 'Mehendi Mandala', 'Mehendi, sangeet'],
    ['party', 'Confetti Party', 'Birthdays'], ['beach', 'Beach Sunset', 'Destination weddings'], ['himalaya', 'Himalayan Mandap', 'Destination weddings'],
    ['lights', 'Fairy-light Garden', 'Receptions'], ['mandap', 'Floral Mandap', 'Pheras'], ['galaxy', 'Starry Galaxy', 'Anniversaries'],
    ['haldi', 'Haldi Sunshine', 'Haldi'], ['clouds', 'Dreamy Clouds', 'Baby showers, naming'], ['disco', 'Disco Night', 'Kitty parties'],
    ['diwali', 'Diwali Lights', 'Pujas, Diwali'], ['rosegarden', 'Rose Garden', 'Weddings, anniversaries']
  ];
  // One tile per scene, no repeats: each scene's first mood (its other colours are picked inside the player),
  // leaving out the scenes a story film already shows. The look data (js/videolooks.js) stays complete.
  const sceneInfo = Object.fromEntries(VIDEO_SCENES.map(([id, name, hint]) => [id, { name, hint }]));
  const IN_A_STORY = new Set(['jharokha', 'palace', 'himalaya', 'beach', 'clouds', 'disco', 'diwali', 'temple', 'rosegarden', 'marigold']);
  const seenScene = new Set();
  const sceneLooks = VIDEO_LOOKS.filter(([, scene]) => !IN_A_STORY.has(scene) && !seenScene.has(scene) && seenScene.add(scene))
    .map(([id, scene, mood]) => ({ id, scene, mood }));
  $('#vidsGrid').innerHTML = sceneLooks.map(l => {
    const sc = sceneInfo[l.scene];
    return `
    <button type="button" class="vid-tile" data-look="${l.id}" aria-label="Play the ${esc(sc.name)} story video">
      <img src="img/videos/${l.id}.jpg" alt="" loading="lazy" decoding="async" width="270" height="480">
      <span class="vid-play" aria-hidden="true">▶</span>
      <span class="vid-cap"><b>${esc(sc.name)}</b><small>${esc(sc.hint)}</small></span>
    </button>`;
  }).join('');
  // Story films that look like another one (same arch, same family) are left out of the grid
  const LOOKALIKE_STORIES = new Set(['story-shahi', 'story-pastel', 'story-raag', 'story-utsav']);
  $('#storyGrid').innerHTML = VIDEO_STORIES.filter(([id]) => !LOOKALIKE_STORIES.has(id)).map(([id, name, note, tuneLabel]) => `
    <button type="button" class="vid-tile story-tile" data-look="${id}" aria-label="Play the ${esc(name)} story film">
      <img src="img/stories/${id}.jpg" alt="" loading="lazy" decoding="async" width="270" height="480">
      <span class="vid-play" aria-hidden="true">▶</span>
      <span class="vid-cap"><b>${esc(name)}</b><small>🎵 ${esc(tuneLabel)} · ${esc(note)}</small></span>
    </button>`).join('');
  // Premium films (js/films.js): Royal Darbar first, 20 at a time; each plays live with sample names
  const FILM_PAGE = 20;
  let filmShown = FILM_PAGE;
  function renderFilms() {
    $('#filmGrid').innerHTML = Films.LIST.slice(0, filmShown).map(f => `
    <button type="button" class="vid-tile film-tile" data-film="${f.id}" aria-label="Play the ${esc(f.name)} premium film">
      <img src="img/films/${f.id}.jpg" alt="" loading="lazy" decoding="async" width="270" height="480">
      <span class="vid-play" aria-hidden="true">▶</span>
      <span class="vid-cap"><b>${esc(f.name)}</b><small>${esc(Films.describe(f))}</small></span>
    </button>`).join('');
    $('#filmMore').hidden = filmShown >= Films.LIST.length;
  }
  renderFilms();
  $('#filmMore').addEventListener('click', () => { filmShown += FILM_PAGE; renderFilms(); });
  $('#filmGrid').addEventListener('click', e => { const b = e.target.closest('[data-film]'); if (b) openFilm(b.dataset.film); });
  $('#storyGrid').addEventListener('click', e => { const b = e.target.closest('[data-look]'); if (b) openVideo(b.dataset.look); });

  let studioScript = null;
  const script = src => new Promise((resolve, reject) => {
    document.head.appendChild(Object.assign(document.createElement('script'), { src, onload: resolve, onerror: () => reject(new Error('offline')) }));
  });
  // js/tunes.js is loaded once, for whichever video opens first
  let tunesScript = null;
  const loadTunes = () => tunesScript || (tunesScript = script('js/tunes.js').catch(e => { tunesScript = null; throw e; }));
  const loadFilms = loadTunes;
  const loadStudio = () => studioScript || (studioScript = Promise.all([script('js/studio.js'), loadTunes()]).catch(e => { studioScript = null; throw e; }));
  // The look's music while the video plays; 🔇 mutes it (and stays muted for the next video)
  let tune = null, muted = false;
  const tuneOff = () => { if (tune) { tune.close(); tune = null; } };
  function tuneOn() {
    tuneOff();
    if (muted || !vid.look || typeof Tune === 'undefined') return;
    tune = new Tune(vid.film ? Films.byId[vid.film].tune : vid.story ? Studio.STORIES[vid.story].tune : Studio.LOOKS[vid.look].music);
    if (!tune.start()) tune = null;
  }
  const showSound = () => { $('#vidSound').textContent = muted ? '🔇 Sound off' : '🔊 Sound on'; $('#vidSound').setAttribute('aria-pressed', String(!muted)); };
  $('#vidSound').addEventListener('click', () => { muted = !muted; showSound(); if (muted) tuneOff(); else tuneOn(); });
  const vid = { film: '', player: null, card: null, scene: '', look: '', story: '', lang: 'en', t: 0, last: 0, raf: 0 };
  // Story films play with the sample invitation of the occasion they suit
  const STORY_SAMPLE = { 'story-little': 'clouds', 'story-party': 'disco', 'story-sacred': 'temple', 'story-utsav': 'diwali' };

  async function openVideo(look) {
    const story = VIDEO_STORIES.find(v => v[0] === look);
    const scene = story ? STORY_SAMPLE[look] || 'vrindavan' : (VIDEO_LOOKS.find(l => l[0] === look) || VIDEO_LOOKS[0])[1];
    const [, name, hint] = story ? [look, story[1], `Story film · ${story[3]}`] : VIDEO_SCENES.find(v => v[0] === scene) || VIDEO_SCENES[0];
    vid.scene = scene;
    tuneOff();
    vid.look = ''; vid.story = ''; vid.film = '';
    $('#vidTitle').textContent = name;
    $('#vidKicker').textContent = story ? hint : `Story video · ${hint}`;
    $('#vidMoodsH').hidden = !!story;
    $('#vidNote').textContent = '';
    $('#vidMoods').innerHTML = '';
    $('#vidWait').hidden = false;
    $('#vidWait').textContent = 'Loading the video…';
    $('#vidSheet').hidden = false;
    document.body.classList.add('sheet-open');
    try { await loadStudio(); await Studio.fontsReady(); }
    catch (e) { $('#vidWait').textContent = 'The video could not load. Please check your internet and try again.'; return; }
    if ($('#vidSheet').hidden || vid.scene !== scene) return; // closed, or another scene picked, while it loaded
    // Phones draw it smaller (it looks the same, and plays smoothly)
    vid.player = vid.player instanceof Studio.Player ? vid.player : new Studio.Player($('#vidCanvas'), matchMedia('(max-width: 640px)').matches ? .5 : .75);
    vid.card = Studio.sample(scene);
    $('#vidMoods').innerHTML = story ? '' : Object.entries(Studio.LOOKS).filter(([, L]) => L.scene === scene)
      .map(([id, L]) => `<button type="button" class="chip" data-look="${id}">${esc(L.mood)}</button>`).join('');
    vid.t = 0;
    if (story) pickStory(look); else pickMood(look);
    showSound();
    $('#vidWait').hidden = true;
    cancelAnimationFrame(vid.raf);
    vid.last = performance.now();
    vid.raf = requestAnimationFrame(videoFrame);
  }
  // A premium film: drawn by js/films.js in its own language (the switch can change it)
  const FILM_TYPE = { birthday: 'bday', puja: 'ceremony' };
  async function openFilm(id) {
    const f = Films.byId[id];
    tuneOff();
    vid.look = ''; vid.story = ''; vid.film = id; vid.scene = 'film:' + id;
    vid.lang = f.lang;
    document.querySelectorAll('#vidLang [data-lang]').forEach(c => c.classList.toggle('on', c.dataset.lang === f.lang));
    $('#vidTitle').textContent = f.name;
    $('#vidKicker').textContent = `👑 Premium film · ${Films.describe(f)}`;
    $('#vidMoodsH').hidden = true;
    $('#vidMoods').innerHTML = '';
    $('#vidNote').textContent = '';
    $('#vidWait').hidden = false;
    $('#vidWait').textContent = 'Loading the video…';
    $('#vidSheet').hidden = false;
    document.body.classList.add('sheet-open');
    try { await loadFilms(); await Films.fontsReady(); }
    catch (e) { $('#vidWait').textContent = 'The video could not load. Please check your internet and try again.'; return; }
    if ($('#vidSheet').hidden || vid.film !== id) return;
    vid.player = new Films.Player($('#vidCanvas'), matchMedia('(max-width: 640px)').matches ? .5 : .75);
    vid.player.set(id, vid.lang);
    vid.card = { type: FILM_TYPE[f.occ] || f.occ };
    vid.look = id; vid.t = 0;
    $('#vidNote').textContent = `🎵 ${typeof TUNES !== 'undefined' && TUNES[f.tune] ? TUNES[f.tune].label : ''} · Sample names: we make it with yours`;
    tuneOn();
    showSound();
    $('#vidWait').hidden = true;
    cancelAnimationFrame(vid.raf);
    vid.last = performance.now();
    vid.raf = requestAnimationFrame(videoFrame);
  }
  function pickMood(id) {
    const tuneWas = vid.look && Studio.LOOKS[vid.look].music;
    vid.look = id; vid.story = '';
    const L = Studio.LOOKS[id];
    if (!tune || tuneWas !== L.music) tuneOn(); // a new mood with the same tune keeps playing without a restart
    vid.player.set(vid.card, { ...Studio.defaults(vid.card, vid.lang), look: id }, SITE);
    vid.t = Math.min(vid.t, vid.player.total - .05);
    $('#vidNote').textContent = `${L.mood} mood · 🎵 ${TUNES[L.music].label} · ${L.note}`;
    document.querySelectorAll('#vidMoods [data-look]').forEach(b => b.classList.toggle('on', b.dataset.look === id));
  }
  // A story film: every part of the invitation in its own painted scene, each function on its own
  function pickStory(id) {
    const S = Studio.STORIES[id];
    vid.story = id; vid.look = S.open;
    tuneOn();
    vid.player.set(vid.card, { ...Studio.defaults(vid.card, vid.lang), look: S.open, story: id, events: 'each' }, SITE);
    vid.t = Math.min(vid.t, vid.player.total - .05);
    $('#vidNote').textContent = `🎵 ${TUNES[S.tune].label} · ${S.note}`;
  }
  // English or Hindi: the preview switches straight away (the tune keeps playing)
  $('#vidLang').addEventListener('click', e => {
    const b = e.target.closest('[data-lang]');
    if (!b) return;
    vid.lang = b.dataset.lang;
    document.querySelectorAll('#vidLang [data-lang]').forEach(c => c.classList.toggle('on', c === b));
    if (!vid.player || !vid.look) return;
    const keep = tune;
    tune = null;
    if (vid.film) vid.player.set(vid.film, vid.lang);
    else if (vid.story) { vid.player.set(vid.card, { ...Studio.defaults(vid.card, vid.lang), look: vid.look, story: vid.story, events: 'each' }, SITE); }
    else vid.player.set(vid.card, { ...Studio.defaults(vid.card, vid.lang), look: vid.look }, SITE);
    tune = keep;
    vid.t = Math.min(vid.t, vid.player.total - .05);
  });
  function videoFrame(now) {
    const p = vid.player;
    vid.t = (vid.t + Math.max(0, Math.min(.5, (now - vid.last) / 1000))) % p.total;
    vid.last = now;
    p.draw(vid.t);
    $('#vidBar').style.width = `${vid.t / p.total * 100}%`;
    vid.raf = requestAnimationFrame(videoFrame);
  }
  function closeVideo() {
    tuneOff();
    vid.look = ''; vid.film = '';
    cancelAnimationFrame(vid.raf);
    vid.scene = '';
    $('#vidSheet').hidden = true;
    document.body.classList.remove('sheet-open');
  }
  $('#vidsGrid').addEventListener('click', e => { const b = e.target.closest('[data-look]'); if (b) openVideo(b.dataset.look); });
  $('#vidMoods').addEventListener('click', e => { const b = e.target.closest('[data-look]'); if (b) pickMood(b.dataset.look); });
  $('#vidClose').addEventListener('click', closeVideo);
  addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#vidSheet').hidden) closeVideo(); });
  // Order this video: the order form opens with the video look chosen (and the occasion it was shown for)
  $('#vidOrder').addEventListener('click', () => {
    if (!vid.look) return;
    const video = vid.film ? { id: vid.film, name: `Premium film: ${Films.byId[vid.film].name}`, type: vid.card.type, lang: vid.lang }
      : vid.story ? { id: vid.story, name: `Story film: ${Studio.STORIES[vid.story].name}`, type: vid.card.type, lang: vid.lang }
      : { id: vid.look, name: Studio.lookName(Studio.LOOKS[vid.look]), type: vid.card.type, lang: vid.lang };
    closeVideo();
    openOrder('', video);
  });

  // ---------- Enquiry ----------
  // A few fields, sent to our WhatsApp as one message (nothing is stored anywhere else)
  const enq = $('#enqForm');
  $('#enqOcc').innerHTML = ['wedding', 'engagement', 'reception', 'sangeet', 'haldi', 'mehendi', 'anniversary', 'bday', 'babyshower', 'naming', 'housewarming', 'ceremony', 'kitty', 'retirement', 'corporate']
    .filter(k => PRESETS[k]).map(k => `<option value="${esc(PRESETS[k].label)}">${PRESETS[k].icon || ''} ${esc(PRESETS[k].label)}</option>`).join('') + '<option value="Other">✨ Other</option>';
  if (window.Pickers) { Pickers.select($('#enqOcc')); Pickers.date(enq.elements.date); }
  // chips light up when ticked (also where :has() is missing)
  enq.addEventListener('change', e => {
    if (e.target.name !== 'want') return;
    // At least one need stays chosen: the last one can't be switched off (it gives a little shake instead)
    if (!e.target.checked && !enq.querySelector('[name="want"]:checked')) {
      e.target.checked = true;
      const chip = e.target.closest('.chip'); chip.classList.remove('nope'); void chip.offsetWidth; chip.classList.add('nope');
    }
    e.target.closest('.chip').classList.toggle('on', e.target.checked);
  });
  enq.querySelectorAll('[name="want"]').forEach(c => c.closest('.chip').classList.toggle('on', c.checked));
  enq.addEventListener('input', e => { e.target.removeAttribute('aria-invalid'); if (!enq.querySelector('[aria-invalid]')) $('#enqErr').hidden = true; });
  // the mobile number: digits only, at most 10 (a pasted "+91 98765-43210" or "098765…" keeps the 10 digits)
  const phoneBox = enq.querySelector('[name="phone"]');
  const tenDigits = v => { let d = String(v || '').replace(/\D/g, ''); if (d.length > 10 && d.startsWith('91')) d = d.slice(2); if (d.length > 10 && d.startsWith('0')) d = d.slice(1); return d.slice(0, 10); };
  const showCount = () => { const n = phoneBox.value.length; $('#enqCount').textContent = `${n} / 10`; $('#enqCount').classList.toggle('ok', /^[6-9]\d{9}$/.test(phoneBox.value)); };
  phoneBox.addEventListener('input', () => { phoneBox.value = tenDigits(phoneBox.value); showCount(); });
  phoneBox.addEventListener('paste', e => { e.preventDefault(); phoneBox.value = tenDigits((e.clipboardData || window.clipboardData).getData('text')); showCount(); phoneBox.dispatchEvent(new Event('input', { bubbles: true })); });
  function enquiryMessage(f) {
    const d = f.date ? new Date(f.date + 'T00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) : '';
    // plain words, one detail per line (no emoji: some WhatsApp versions show them as “�”)
    const p = f.phone.replace(/\D/g, '');
    const lines = [`*New Enquiry - ${SITE.brand || 'CardAlbum'} Website*`, '', `*Name:* ${f.name}`, `*WhatsApp:* +91 ${p.slice(0, 5)} ${p.slice(5)}`, `*Occasion:* ${f.occasion}`];
    if (d) lines.push(`*Event date:* ${d}`);
    if (f.city) lines.push(`*City:* ${f.city}`);
    if (f.wants.length) lines.push(`*Needs:* ${f.wants.join(', ')}`);
    lines.push('', '*Enquiry:*', f.message.replace(/\r/g, ''));
    return lines.join('\n');
  }
  enq.addEventListener('submit', e => {
    e.preventDefault();
    const v = n => enq.elements[n].value.trim();
    const f = { name: v('name'), phone: v('phone'), occasion: v('occasion'), date: v('date'), city: v('city'), message: v('message'),
      wants: [...enq.querySelectorAll('[name="want"]:checked')].map(c => c.value) };
    const bad = [];
    enq.querySelectorAll('[aria-invalid]').forEach(x => x.removeAttribute('aria-invalid'));
    if (!f.name) bad.push(['name', 'your name']);
    if (!/^[6-9]\d{9}$/.test(f.phone)) bad.push(['phone', 'a 10-digit WhatsApp number (starting with 6, 7, 8 or 9)']);
    if (f.message.length < 5) bad.push(['message', 'your enquiry']);
    if (bad.length) {
      bad.forEach(([n]) => enq.elements[n].setAttribute('aria-invalid', 'true'));
      $('#enqErr').textContent = `Please add ${bad.map(b => b[1]).join(', ')}.`;
      $('#enqErr').hidden = false;
      enq.elements[bad[0][0]].focus();
      return;
    }
    $('#enqErr').hidden = true;
    const url = Core.orderUrl(SITE.whatsapp, enquiryMessage(f));
    if (url === '#order') { $('#enqErr').textContent = 'WhatsApp is not set up on this website yet. Please call us instead.'; $('#enqErr').hidden = false; return; }
    // ('noopener' would make window.open return null, so the page itself would ALSO go to WhatsApp)
    const win = window.open(url, '_blank');
    if (win) { try { win.opener = null; } catch (e) { /* fine */ } } else location.href = url;
    if (window.Fun) { Fun.burstAt(enq.querySelector('[type=submit], button:not([type=button])')); Fun.buzz(); }
    $('#enqNote').textContent = '✅ WhatsApp opened with your enquiry: just tap send.';
    showCount();
  });

  // Quick questions: one tap writes it into the enquiry box (tapping it again takes it out)
  document.querySelectorAll('[data-quick]').forEach(b => b.addEventListener('click', () => {
    const box = enq.elements.message, q = b.dataset.quick;
    const lines = box.value.split(/\n/).map(s => s.trim()).filter(Boolean);
    const had = lines.includes(q);
    box.value = (had ? lines.filter(l => l !== q) : [...lines, q]).join('\n');
    b.classList.toggle('on', !had);
    box.dispatchEvent(new Event('input', { bubbles: true }));
    box.classList.remove('enq-pulse'); void box.offsetWidth; box.classList.add('enq-pulse');
    if (window.Fun) Fun.buzz(10);
  }));
  // Every "Enquiry" button: glide to the form, make it glow once and put the cursor in the first field
  document.querySelectorAll('[data-enquiry]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    const box = document.querySelector('#enquiry .enq-box');
    document.getElementById('enquiry').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    box.classList.remove('enq-flash'); void box.offsetWidth; box.classList.add('enq-flash');
    setTimeout(() => { try { enq.elements.name.focus({ preventScroll: true }); } catch (err) { /* old browser */ } }, 700);
  }));

  // ---------- Order form ----------
  const sheet = $('#orderSheet'), of = $('#orderForm'), STEPS = 5;
  if (window.Pickers) Pickers.attach(of); // our calendar (with time) for every date box in the order form
  let step = 0, ord = null;

  let orderRef = ''; // the short order number shown in the WhatsApp message
  // `video`: a story video look chosen under Videos ({ id, name, type }), ordered with the invitation.
  function openOrder(design, video = null) {
    orderRef = '';
    const e = Templates.get(design) ? allEntries[Templates.get(design).no - 1] : null;
    ord = { design: e ? e.no : '', type: e ? e.occasion : video ? video.type : 'wedding', events: [], video, want: video ? 'Story video (+ invitation if wanted)' : '' };
    of.reset();
    of.elements.design.value = e ? e.no : '';
    of.elements.date.type = 'datetime-local';
    of.elements.date.min = nowLocal(); // past dates can't be picked
    dateHint(of.elements.date);
    $('#osDone').hidden = true;
    $('#osChoose').hidden = true; of.hidden = false; $('#osVideo').hidden = false;
    $('#osTitle').textContent = 'Order your invitation';
    $('.os-foot').hidden = false;
    $('#osDots').hidden = $('#osStepNo').hidden = false;
    renderOccasions();
    renderEvents();
    showDesign();
    showVideo();
    goTo(0);
    sheet.hidden = false;
    document.body.classList.add('sheet-open');
  }
  // "Order now": first ask what they want, then go on from there
  const WANTS = { card: 'Invitation link card', combo: 'Invitation card + story video' };
  function showChooser(on) {
    $('#osChoose').hidden = !on;
    of.hidden = on;
    $('.os-foot').hidden = on;
    $('#osDots').hidden = $('#osStepNo').hidden = on;
    $('#osTitle').textContent = on ? 'Let’s get started' : 'Order your invitation';
  }
  function openChooser() {
    openOrder();
    showChooser(true);
  }
  $('#osChoose').addEventListener('click', e => {
    const b = e.target.closest('[data-choose]');
    if (!b) return;
    const c = b.dataset.choose;
    if (window.Fun) Fun.buzz(12);
    if (c === 'card' || c === 'combo') {
      ord.want = WANTS[c];
      showChooser(false);
      $('#osVideo').hidden = c === 'card';
      goTo(0);
    } else if (c === 'pdf') {
      ord.want = 'From my card PDF';
      showChooser(false);
      $('#osPdfFile').click();
    } else if (c === 'video') {
      closeOrder();
      const v = $('#videos'); v && v.scrollIntoView({ behavior: 'smooth', block: 'start' });
      toast('🎬 Tap any film you like, then "Order this video"');
    } else if (c === 'ask') {
      closeOrder();
      const a = document.querySelector('[data-enquiry]'); a && a.click();
    }
  });
  function closeOrder() {
    sheet.hidden = true;
    document.body.classList.remove('sheet-open');
    showPdfDone(false);
  }

  // ---------- Order with a card PDF ----------
  // The customer picks their card's PDF: its names, date and venue are read (js/pdfcard.js, when it can) into a
  // WhatsApp message to us, WhatsApp opens, and they attach the PDF there and send (a link cannot carry a file).
  let pdfFile = null;
  // a short note at the bottom of the screen
  let toastTimer = 0;
  function toast(msg) {
    let t = document.getElementById('siteToast');
    if (!t) { t = Object.assign(document.createElement('div'), { id: 'siteToast', className: 'site-toast', role: 'status' }); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
  }
  const loadPdfCard = () => typeof PdfCard !== 'undefined' ? Promise.resolve() : script('js/pdfcard.js');
  function showPdfDone(on) {
    $('#osPdfDone').hidden = !on;
    if (on) $('#osChoose').hidden = true;
    of.hidden = on;
    $('.os-foot').hidden = on;
    $('#osDots').hidden = $('#osStepNo').hidden = on;
  }
  function pdfOrderMessage(file, d) {
    const lines = [`*New Order - Card PDF*`, ''];
    if (d) {
      const names = [d.host1, d.host2].filter(Boolean).join(' & ');
      if (names) lines.push(`*Names:* ${names}`);
      if (d.type) lines.push(`*Occasion:* ${(PRESETS[d.type] || {}).label || d.type}`);
      if (d.events.length) lines.push('*Functions:*');
      d.events.slice(0, 6).forEach(e => { const w = e.date ? new Date(e.date).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', ...(/T\d/.test(e.date) ? { hour: 'numeric', minute: '2-digit' } : {}) }) : ''; lines.push(`- ${e.name}${w ? ': ' + w : ''}`); });
      if (d.venue) lines.push(`*Venue:* ${d.venue}`);
      lines.push('');
    }
    if (ord && ord.design) lines.push(`*Design:* ${ord.design}`);
    if (ord && ord.video) lines.push(`*Video:* ${ord.video.name}`);
    lines.push(`I am attaching my card here: *${file.name}*`, '', 'Please share the price and how soon it can be ready. Thank you!');
    return lines.join('\n');
  }
  $('#osPdfFile').addEventListener('change', async e => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') return toast('Please choose the PDF of your card');
    pdfFile = file;
    // The message is made here; WhatsApp opens (in a new tab) when they tap "Send on WhatsApp": a tab opened by
    // the page itself after choosing a file gets blocked as a pop-up, and this page must never turn into WhatsApp
    let details = null;
    try { await loadPdfCard(); const r = await Promise.race([PdfCard.read(file), new Promise((_, no) => setTimeout(() => no(new Error('slow')), 6000))]); details = r.readable ? r.details : null; } catch (err) { /* sent without the details */ }
    const url = Core.orderUrl(SITE.whatsapp, pdfOrderMessage(file, details));
    $('#osPdfWa').href = url;
    $('#osPdfName').textContent = file.name;
    $('#osPdfWhat').textContent = details && details.host1 ? `We read: ${[details.host1, details.host2].filter(Boolean).join(' & ')}${details.events.length ? ` · ${details.events.length} function${details.events.length === 1 ? '' : 's'}` : ''}${details.venue ? ' · ' + details.venue : ''}.` : 'Your order message is ready in WhatsApp.';
    $('#osPdfShare').hidden = !(navigator.canShare && navigator.canShare({ files: [file] }));
    showPdfDone(true);
    if (window.Fun) { Fun.burst(); Fun.buzz(); }
  });
  // Phones: send the PDF itself to WhatsApp from the share sheet
  $('#osPdfShare').addEventListener('click', async () => {
    if (!pdfFile) return;
    try { await navigator.share({ files: [pdfFile], title: 'My card', text: `My card for the order: ${pdfFile.name}` }); }
    catch (err) { if (err.name !== 'AbortError') toast('Could not share: attach it in WhatsApp with 📎'); }
  });
  $('#osPdfBack').addEventListener('click', () => showPdfDone(false));

  function renderOccasions() {
    $('#osOcc').innerHTML = Object.entries(PRESETS).map(([k, p]) =>
      `<button type="button" class="chip${k === ord.type ? ' on' : ''}" data-type="${k}">${p.icon} ${esc(p.label)}</button>`).join('');
    const [l1, l2] = PRESETS[ord.type].labels;
    $('#osL1').textContent = l1;
    $('#osL2').textContent = l2.replace(/\s*\(optional\)/i, '');
    $('#osReq2').hidden = !needsTwo();
    $('#osQuick').innerHTML = PRESETS[ord.type].card.events.map(ev => ev.name)
      .filter(n => !ord.events.some(ev => ev.name === n))
      .map(n => `<button type="button" class="chip" data-add="${esc(n)}">+ ${esc(n)}</button>`).join('') +
      '<button type="button" class="chip" data-add="">+ Other</button>';
    renderPicks();
  }
  // Small tappable swatches of this occasion's designs (trending first), so nobody needs to know a number.
  function renderPicks() {
    const picked = +of.elements.design.value;
    // The chosen design comes first, so it is always in view and highlighted, whatever its number.
    const mine = designs.filter(d => d.occasion === ord.type).sort((a, b) => (b.no === picked) - (a.no === picked));
    $('#osPicks').innerHTML = mine.slice(0, 12).map(d => {
      const v = d.vars;
      return `<button type="button" class="os-pick${d.no === picked ? ' on' : ''}" data-pick="${d.no}" title="${esc(d.name)}" aria-label="Design ${Templates.serial(d.no)} ${esc(d.name)}"
        style="--a:${v['--accent']};--a2:${v['--accent2']};--b:${v['--bg']};--c:${v['--bg2']}"><span>${d.emoji}</span><b>${Templates.serial(d.no)}</b></button>`;
    }).join('') + (mine.length ? `<button type="button" class="os-pick more" data-browse>See all<b>${mine.length} →</b></button>` : '');
  }
  function renderEvents() {
    $('#osEvents').innerHTML = ord.events.map((ev, i) => `
      <div class="os-event" data-i="${i}">
        <input data-k="name" value="${esc(ev.name)}" placeholder="Function name" aria-label="Function name">
        <span class="dt${ev.date ? '' : ' empty'}" data-ph="Date &amp; time"><input data-k="date" type="datetime-local" min="${nowLocal()}" value="${esc(ev.date)}" aria-label="Date and time"></span>
        <input data-k="venue" value="${esc(ev.venue || '')}" maxlength="80" placeholder="Venue (optional)" aria-label="Venue">
        <input data-k="dress" value="${esc(ev.dress || '')}" maxlength="60" placeholder="Dress code (optional)" aria-label="Dress code">
        <button type="button" class="x" data-del="${i}" aria-label="Remove">✕</button>
      </div>`).join('');
  }
  function showDesign() {
    const t = Templates.get(of.elements.design.value);
    const e = t && allEntries[t.no - 1];
    $('#osDesign').innerHTML = !of.elements.design.value ? 'No design yet? No problem, we will suggest one.'
      : e ? `✓ ${Templates.serial(e.no)} ${esc(e.name)} · ${INTROS[e.intro]} opening <a href="card.html?demo#${Catalog.demoCode(e)}" target="_blank" rel="noopener">▶ Preview</a>`
      : 'There is no design with that number.';
    document.querySelectorAll('#osPicks [data-pick]').forEach(b => b.classList.toggle('on', +b.dataset.pick === (e && e.no)));
  }

  // "Time not decided yet": the date box asks only for the day (the card then shows the date without a time).
  function dateMode(noTime) {
    const box = of.elements.date, day = box.value.slice(0, 10);
    box.type = noTime ? 'date' : 'datetime-local';
    box.min = noTime ? nowLocal().slice(0, 10) : nowLocal();
    box.value = noTime ? day : day ? day + 'T19:00' : '';
    box.closest('.dt').dataset.ph = noTime ? 'Tap to choose the date' : 'Tap to choose date & time';
    dateHint(box);
  }
  // Safari on iPhone leaves an empty date box blank, so a hint sits in it until a date is picked.
  function dateHint(box) {
    const wrap = box.closest('.dt');
    if (wrap) wrap.classList.toggle('empty', !box.value);
  }

  function collect() {
    const v = n => of.elements[n].value.trim();
    const t = Templates.get(v('design'));
    return {
      design: t ? t.no : '', type: ord.type, host1: v('host1'), host2: v('host2'), nick1: v('nick1'), nick2: v('nick2'), date: v('date'), venue: v('venue'), mapUrl: v('mapUrl'),
      events: ord.events.filter(ev => ev.name.trim()), message: v('message'), rsvp: v('rsvp'),
      guests: v('guests').split('\n').map(g => g.trim()).filter(Boolean), photo: of.elements.photo.checked,
      ...Catalog.specialLines({ story: v('xStory'), families: v('xFamilies'), attire: v('xAttire') }), upi: v('xUpi'), hashtag: v('xHashtag'),
      giftNote: v('xGiftNote'), venueNote: v('xVenueNote'), thanks: v('xThanks'), title: v('xTitle'), tagline: v('xTagline'),
      gallery: of.elements.xGallery.checked, music: of.elements.xMusic.checked,
      want: ord.want || '',
      video: ord.video ? ord.video.id : '', videoName: ord.video ? ord.video.name : '', videoLang: ord.video ? ord.video.lang : ''
    };
  }
  // The story video in the order (or a nudge to pick one)
  function showVideo() {
    $('#osVideo').innerHTML = ord.video
      ? `🎬 Story video: <b>${esc(ord.video.name)}</b> · ${ord.video.lang === 'hi' ? 'हिन्दी' : 'English'} <button type="button" class="os-unvideo" data-unvideo aria-label="Remove the video">✕</button>`
      : 'Want a story video for WhatsApp too? <a href="#videos" data-video-go>See the story films →</a>';
  }

  // What each step needs before moving on.
  const nowLocal = () => Core.nowLocal();
  // The second name is needed for couples (wedding, engagement…), optional for a birthday or a party host.
  const needsTwo = () => !/optional/i.test(PRESETS[ord.type].labels[1]);

  // What each step needs before moving on: [message, field to highlight], or null.
  function problem(n) {
    const el = of.elements, has = name => el[name].value.trim();
    const [l1, l2] = PRESETS[ord.type].labels;
    if (n === 0 && has('design') && !Templates.get(el.design.value)) return ['Please check the design number, or leave it empty.', 'design'];
    if (n === 3 && has('rsvp') && !Core.mobile(el.rsvp.value)) return ['Please enter a valid 10-digit mobile number (it starts with 6, 7, 8 or 9), or leave it empty.', 'rsvp'];
    if (n !== 1) return null;
    if (!has('host1')) return [`Please enter: ${l1}`, 'host1'];
    if (needsTwo() && !has('host2')) return [`Please enter: ${l2}`, 'host2'];
    if (!el.date.value) return ['Please choose the date and time.', 'date'];
    if (el.date.value < (el.date.type === 'date' ? nowLocal().slice(0, 10) : nowLocal())) return ['That date has already passed. Please choose a future date.', 'date'];
    if (!has('venue')) return ['Please enter the venue.', 'venue'];
    if (has('mapUrl') && !Catalog.mapLink(el.mapUrl.value)) return ['The location should be a link (https://…), or leave it empty.', 'mapUrl'];
    return null;
  }

  // Shows the problem at the field itself: red outline, a little shake, and the cursor placed in it.
  function flag(p) {
    of.querySelectorAll('[aria-invalid]').forEach(i => i.removeAttribute('aria-invalid'));
    $('#osError').textContent = p ? p[0] : '';
    if (!p) return;
    const input = of.elements[p[1]];
    input.setAttribute('aria-invalid', 'true');
    input.classList.remove('shake');
    void input.offsetWidth;
    input.classList.add('shake');
    input.focus({ preventScroll: true });
    input.scrollIntoView({ block: 'center', behavior: 'smooth' });
    navigator.vibrate?.([30, 40, 30]);
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
    n = Math.max(0, Math.min(n, STEPS - 1)); // never past the review step
    step = n;
    of.querySelectorAll('.os-step').forEach(s => { s.hidden = +s.dataset.step !== n; });
    $('#osDots').querySelectorAll('li').forEach((d, i) => d.classList.toggle('on', i <= n));
    $('#osStepNo').textContent = `Step ${n + 1} of ${STEPS}`;
    $('#osBack').style.visibility = n ? 'visible' : 'hidden';
    $('#osError').textContent = '';
    const last = n === STEPS - 1;
    $('#osNext').hidden = last;
    $('#osSend').hidden = !last || !SITE.whatsapp;
    $('#osNoWa').hidden = !last || !!SITE.whatsapp;
    if (last) {
      if (online && !orderRef) orderRef = Catalog.orderRef();
      const msg = Catalog.orderMessage(collect(), allEntries, online ? orderRef : '');
      $('#osReview').textContent = msg.replace(/\*/g, '').replace(/\n\nOrder code.*$/s, '\n\n🔑 An order code is added so we can start right away.');
      $('#osSend').href = Core.orderUrl(SITE.whatsapp, msg);
    }
    $('.os-body').scrollTop = 0;
  }

  $('#osNext').addEventListener('click', () => {
    const p = problem(step);
    flag(p);
    if (p) return;
    navigator.vibrate?.(12);
    goTo(step + 1);
  });
  $('#osBack').addEventListener('click', () => goTo(Math.max(0, step - 1)));
  $('#osClose').addEventListener('click', closeOrder);
  // A tap on the dark space around the form does not close it (the customer would lose what they typed): only the ✕ does.
  addEventListener('keydown', e => { if (e.key === 'Escape' && !sheet.hidden) closeOrder(); });
  // After sending: a celebration screen while WhatsApp opens.
  $('#osSend').addEventListener('click', () => {
    navigator.vibrate?.([20, 50, 20, 50, 60]);
    if (window.Fun) Fun.burstAt($('#osSend'), 120);
    // Also file the order in the owner's order list (keepalive: it still goes through while WhatsApp opens).
    if (online) {
      const o = collect();
      DB.insert('orders', {
        design_no: o.design || null, occasion: o.type, names: [o.host1, o.host2].filter(Boolean).join(' & ').slice(0, 120),
        event_date: o.date, code: `${orderRef} ${Catalog.orderCode(o)}`
      }, { auth: false, keepalive: true }).catch(() => { /* the WhatsApp message still has everything */ });
    }
    of.querySelectorAll('.os-step').forEach(s => { s.hidden = true; });
    $('#osError').textContent = '';
    $('.os-foot').hidden = true;
    $('#osDots').hidden = $('#osStepNo').hidden = true; // the steps are over: no progress bar on the thank-you screen
    $('#osDone').hidden = false;
    const colors = ['#ffc95c', '#ff3d8b', '#8b5cf6', '#22d3ee', '#25d366'];
    $('.os-confetti').innerHTML = Array.from({ length: 40 }, (_, i) =>
      `<i style="--x:${(i * 37) % 100}%;--d:${(i % 8) * 0.12}s;--r:${(i * 47) % 360}deg;--c:${colors[i % 5]}"></i>`).join('');
  });
  $('#osDoneClose').addEventListener('click', closeOrder);

  // Mobile-number boxes: digits only, at most 10, with a live hint.
  Core.wireMobileInputs(document);
  // Typing in a flagged field clears the warning.
  of.addEventListener('input', e => { if (e.target.hasAttribute('aria-invalid')) flag(null); });
  // Keep the field being typed in visible above the phone keyboard.
  of.addEventListener('focusin', e => {
    if (e.target.matches('input, textarea')) setTimeout(() => e.target.scrollIntoView({ block: 'center', behavior: 'smooth' }), 350);
  });
  // The sheet follows the visible area, so the keyboard never covers it.
  if (window.visualViewport) {
    const fit = () => {
      document.documentElement.style.setProperty('--vvh', `${visualViewport.height}px`);
      document.documentElement.style.setProperty('--vvtop', `${visualViewport.offsetTop}px`);
    };
    visualViewport.addEventListener('resize', fit);
    visualViewport.addEventListener('scroll', fit);
    fit();
  }

  of.addEventListener('click', e => {
    if (e.target.closest('[data-unvideo]')) { ord.video = null; showVideo(); return; }
    const occ = e.target.closest('[data-type]'), add = e.target.closest('[data-add]'), del = e.target.closest('[data-del]');
    const pick = e.target.closest('[data-pick]'), browse = e.target.closest('[data-browse]');
    if (pick) {
      of.elements.design.value = pick.dataset.pick;
      showDesign();
      navigator.vibrate?.(10);
    } else if (browse) {
      closeOrder();
      setTab('designs', { occasion: ord.type });
      // Computers have no Designs tab (the whole page shows): go to the designs, filtered to this occasion.
      if (!$('.bottom-nav').offsetParent) requestAnimationFrame(() => $('#tplFilters').scrollIntoView({ behavior: 'smooth', block: 'start' }));
    } else if (occ) { ord.type = occ.dataset.type; renderOccasions(); }
    else if (add) {
      ord.events.push({ name: add.dataset.add, date: of.elements.date.value, venue: '', dress: '' });
      renderEvents();
      renderOccasions();
      if (!add.dataset.add) $('#osEvents .os-event:last-child input').focus();
    } else if (del) { ord.events.splice(+del.dataset.del, 1); renderEvents(); renderOccasions(); }
  });
  // iPhone Safari ignores `min` and lets past days be picked, so a past date is cleared the moment it is chosen.
  of.addEventListener('change', e => {
    const input = e.target;
    if (input.type === 'checkbox' && input.name === 'xNoTime') { dateMode(input.checked); return; }
    const today = input.type === 'date' ? nowLocal().slice(0, 10) : nowLocal();
    if (!/^(datetime-local|date)$/.test(input.type) || !input.value || input.value >= today) return;
    input.value = '';
    const row = input.closest('.os-event');
    if (row) ord.events[row.dataset.i].date = '';
    $('#osError').textContent = 'That date has already passed. Please choose a future date.';
    input.setAttribute('aria-invalid', 'true');
    input.classList.remove('shake');
    void input.offsetWidth;
    input.classList.add('shake');
    navigator.vibrate?.([30, 40, 30]);
  });
  ['input', 'change'].forEach(ev => of.addEventListener(ev, e => { if (e.target.closest('.dt')) dateHint(e.target); }));
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
  if (wanted !== null) {
    openOrder(+wanted);
    // Drop ?order=… from the address, so refreshing the page does not open the form again.
    history.replaceState(history.state, '', location.pathname + location.hash);
  }
})();
