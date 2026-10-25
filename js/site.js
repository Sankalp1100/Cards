// Landing page: cursor glow, parallax, scroll reveal and the live template showcase.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const { esc } = Core;

  const glow = $('.cursor-glow');
  addEventListener('pointermove', e => {
    glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    document.documentElement.style.setProperty('--mx', (e.clientX / innerWidth - 0.5).toFixed(3));
    document.documentElement.style.setProperty('--my', (e.clientY / innerHeight - 0.5).toFixed(3));
  });

  // One demo card per template, using the occasion that fits it best.
  const demos = Object.entries(THEMES).map(([key, t]) => {
    const preset = Object.values(PRESETS).find(p => p.card.theme === key) || PRESETS.wedding;
    return { key, t, preset, code: Codec.encode({ ...preset.card, theme: key }) };
  });
  $('#tplCount').textContent = demos.length;
  $('#showcase').innerHTML = demos.map(d => `
    <a class="tpl" href="card.html#${d.code}" target="_blank" rel="noopener" style="--a:${d.t.vars['--accent']};--b:${d.t.vars['--bg']}">
      <div class="mini"><iframe tabindex="-1" loading="lazy" title="${esc(d.t.name)}" src="card.html?preview&auto#${d.code}"></iframe></div>
      <span class="tpl-name">${d.t.emoji} ${esc(d.t.name)}</span>
      <small>${d.preset.icon} ${esc(d.preset.label)}</small>
    </a>`).join('');
  $('#demoBtn').href = `card.html#${demos[0].code}`;

  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }), { threshold: 0.12 });
  document.querySelectorAll('.tile, .builder-head, .tpl, .cta-band').forEach((el, i) => {
    el.classList.add('rv');
    el.style.transitionDelay = `${(i % 4) * 80}ms`;
    el.addEventListener('transitionend', () => { el.style.transitionDelay = ''; }, { once: true });
    io.observe(el);
  });
})();
