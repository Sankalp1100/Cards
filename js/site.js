// Sales page: numbered design posters (the real animated card opens only on "Live demo"), WhatsApp order buttons.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const { esc } = Core;
  const PAGE = 24;
  const order = text => Core.orderUrl(SITE.whatsapp, text);
  const external = SITE.whatsapp ? ' target="_blank" rel="noopener"' : '';

  document.querySelectorAll('.brand').forEach(el => { el.textContent = SITE.brand; });
  document.querySelectorAll('[data-order]').forEach(a => {
    a.href = order(`Hi! I'd like to order an animated invitation 💌`);
    if (a.href.startsWith('https://wa.me/')) { a.target = '_blank'; a.rel = 'noopener'; }
  });
  if (SITE.instagram) {
    $('#social').innerHTML = `📸 <a href="https://instagram.com/${encodeURIComponent(SITE.instagram)}" target="_blank" rel="noopener">@${esc(SITE.instagram)}</a>`;
  }

  // ---------- Catalog ----------
  const designs = Catalog.visible(Catalog.entries());
  const occasions = Object.keys(PRESETS).filter(k => designs.some(d => d.occasion === k));
  let filter = '', query = '', shown = 0, list = designs;

  $('#tplCount').textContent = designs.length;
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
          <small>${PRESETS[d.occasion].icon} ${esc(PRESETS[d.occasion].label)}${price ? ` · <b class="price">${esc(price)}</b>` : ''}</small>
        </div>
        <a class="btn-small order" href="${esc(order(Catalog.orderText(d)))}"${external}>💬 Order ${Templates.serial(d.no)}</a>
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
      el.style.transitionDelay = `${(i % 4) * 80}ms`;
      el.addEventListener('transitionend', () => { el.style.transitionDelay = ''; }, { once: true });
      io.observe(el);
    });
  }
  reveal(document.querySelectorAll('.tile, .builder-head, .cta-band, .stepcard'));
  refresh();
})();
