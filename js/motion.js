// Motion for the home page: every section animates once as it scrolls in (one IntersectionObserver), numbers count
// up, FAQ answers glide open, the steps draw a connecting line, the hero sparkles and its phones float, buttons ripple
// on press and the bottom bar's active tab has a sliding marker. Transform and opacity only. Nothing is hidden unless
// this script runs (it adds .mv first), and nothing moves for visitors who ask for reduced motion.
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = s => document.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---------- Scroll reveal ----------
  const seen = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add('in');
    seen.unobserve(en.target);
    // a sideways-scrolling row reveals all its cards together when the row comes in
    if (en.target.dataset.mvGroup !== undefined) $$(':scope > .mv', en.target).forEach(c => c.classList.add('in'));
    if (en.target.dataset.count !== undefined) countUp(en.target);
  }), { threshold: 0.12, rootMargin: '0px 0px 10% 0px' });

  // kind: up (default), scale or fade. Children of one group get a small stagger.
  function reveal(els, kind = 'up', step = 70) {
    els.forEach((el, i) => {
      if (!el || el.classList.contains('mv') || el.classList.contains('rv')) return; // .rv: site.js already reveals it
      el.classList.add('mv', `mv-${kind}`);
      el.style.setProperty('--mv-d', `${Math.min(i, 8) * step}ms`);
      seen.observe(el);
    });
  }
  const SECTIONS = [
    ['.lux-bottom > *', 'up', 60],
    ['.sec-intro > *, .vids-head > *, .hot-head > *, .how > .section-h, .faq > .section-h', 'up', 80],
    ['.vids-sub, .vids-more, .hot-sub', 'up'],
    ['.occ-picker-wrap, .cat-tools, .see-all-wrap', 'up'],
    ['.faq-list details', 'up', 60],
    ['.enq-head > *', 'up', 70],
    ['.enq-form > *', 'up', 40],
    ['.cta-btns > *', 'scale', 90],
    ['.foot > p', 'fade', 120],
    ['.hot-occ > *', 'scale', 50]
  ];
  if (!reduce) {
    document.documentElement.classList.add('motion');
    SECTIONS.forEach(([sel, kind, step]) => {
      // stagger restarts in each parent, so a long grid never waits seconds for its last items
      const groups = new Map();
      $$(sel).forEach(el => { const p = el.parentElement; if (!groups.has(p)) groups.set(p, []); groups.get(p).push(el); });
      groups.forEach(list => reveal(list, kind, step));
    });
    // The film and scene grids are drawn by site.js (and grow with "Show more"): reveal what arrives.
    ['#filmGrid', '#storyGrid', '#vidsGrid', '#hotOcc'].forEach(id => {
      const grid = $(id);
      if (!grid) return;
      const run = () => reveal($$(':scope > *:not(.mv)', grid), 'scale', 55);
      run();
      new MutationObserver(run).observe(grid, { childList: true });
    });
    const reel = $('#styleReel');
    if (reel) {
      $$(':scope > *', reel).forEach((c, i) => { c.classList.add('mv', 'mv-up'); c.style.setProperty('--mv-d', `${Math.min(i, 6) * 70}ms`); });
      reel.dataset.mvGroup = '';
      seen.observe(reel);
    }
    const steps = $('.steps');
    if (steps) seen.observe(steps); // its connecting line draws on .in
  }

  // ---------- Numbers count up when they scroll in ----------
  function countUp(el) {
    const to = +el.dataset.count, t0 = performance.now(), dur = 1200;
    const tick = now => {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e).toLocaleString('en-IN');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  if (!reduce) $$('.trust b').forEach(b => {
    const n = parseInt(b.textContent.replace(/\D/g, ''), 10);
    if (!n || n < 10) return; // "1 link" stays as it is
    b.dataset.count = n;
    b.style.minWidth = `${b.textContent.length}ch`; // the box keeps its width while counting
    seen.observe(b);
  });

  // ---------- FAQ: the answer glides in when a question opens ----------
  $$('.faq details').forEach(d => d.addEventListener('toggle', () => {
    if (!d.open || reduce) return;
    const p = d.querySelector('p');
    if (p && p.animate) p.animate([{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.2,.9,.3,1)' });
  }));

  // ---------- Hero: sparkles in the background ----------
  const hero = $('.hero.lux');
  if (hero && !reduce) {
    const box = document.createElement('div');
    box.className = 'lux-sparks';
    box.setAttribute('aria-hidden', 'true');
    // fixed positions (no randomness), so the hero looks the same on every visit
    const P = [[6, 18, 0], [14, 62, 1.2], [24, 30, 2.4], [37, 8, .6], [46, 74, 1.8], [58, 16, 3], [66, 58, .3], [74, 28, 2.1], [83, 70, 1.5], [92, 12, 2.7], [88, 44, .9], [30, 88, 3.3], [52, 40, 1.1], [8, 86, 2]];
    box.innerHTML = P.map(([x, y, d], i) => `<i style="left:${x}%;top:${y}%;--sd:${d}s;--ss:${i % 3 ? 1 : 1.6}"></i>`).join('');
    hero.prepend(box);
  }

  // ---------- Hero headline: "invitations for every celebration → weddings → birthdays → …" ----------
  // The words share one grid cell (as wide as the longest), so the line never jumps. Reduced motion keeps
  // "every celebration".
  const rot = $('#luxRot');
  if (rot && !reduce) {
    const words = $$('em', rot);
    let i = 0;
    setInterval(() => {
      if (document.hidden) return;
      const was = words[i];
      i = (i + 1) % words.length;
      was.classList.remove('on'); was.classList.add('out');
      setTimeout(() => was.classList.remove('out'), 600);
      words[i].classList.add('on');
    }, 2400);
  }

  // ---------- Buttons: a ripple from where they are pressed ----------
  if (!reduce) document.addEventListener('pointerdown', e => {
    const b = e.target.closest('.btn-glow, .btn-line, .btn-small, .btn-enq, .chip, .nav-cta, .nav-enq, .os-choice');
    if (!b) return;
    const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2.2;
    const dot = document.createElement('span');
    dot.className = 'mv-ripple';
    dot.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
    if (getComputedStyle(b).position === 'static') b.classList.add('mv-rel');
    b.appendChild(dot);
    dot.addEventListener('animationend', () => dot.remove(), { once: true });
  }, { passive: true });

  // ---------- Bottom bar: a marker that slides to the active tab ----------
  const bar = $('.bottom-nav');
  if (bar) {
    const mark = document.createElement('i');
    mark.className = 'bn-mark';
    mark.setAttribute('aria-hidden', 'true');
    bar.appendChild(mark);
    const place = () => {
      const on = bar.querySelector('a.on:not(.bn-order)');
      if (!on || !bar.offsetParent) { mark.style.opacity = '0'; return; }
      mark.style.opacity = '1';
      mark.style.width = `${on.offsetWidth - 20}px`;
      mark.style.transform = `translateX(${on.offsetLeft + 10}px)`;
    };
    new MutationObserver(place).observe(bar, { subtree: true, attributes: true, attributeFilter: ['class'] });
    addEventListener('resize', place, { passive: true });
    requestAnimationFrame(place);
  }
})();
