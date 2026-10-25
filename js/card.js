// Card viewer: reads the invitation from the URL hash and plays it.
(function () {
  const params = new URLSearchParams(location.search);
  const preview = params.has('preview');
  const guest = params.get('to');
  const $ = (s, r = document) => r.querySelector(s);
  const { esc, safeUrl, parseDate, calStamp, initials } = Core;

  let fx = null, music = null, countdownTimer = null, revealObserver = null, opened = false, data = null;

  // No hash = demo card. A hash that does not decode (e.g. a link cut off by a chat app) = null.
  function readData() {
    const raw = location.hash.slice(1);
    if (!raw) return PRESETS.wedding.card;
    try {
      const d = Codec.decode(raw);
      if (Core.isCard(d)) return d;
    } catch (e) { /* fall through */ }
    console.warn('Invalid card link');
    return null;
  }

  function renderBroken() {
    opened = true;
    clearInterval(countdownTimer);
    if (fx) { fx.destroy(); fx = null; }
    applyTheme(Templates.get(1));
    $('#envelope').classList.add('gone');
    document.body.classList.remove('locked');
    document.body.classList.add('opened');
    $('#card').innerHTML = `
      <section class="hero broken">
        <div class="ornament">💌</div>
        <h1 class="section-title">This invitation link is incomplete</h1>
        <p class="tagline">Part of the link may have been cut off when it was shared. Please ask the host to send it again, or copy the full link.</p>
      </section>`;
  }

  function graphemes(s) {
    if (window.Intl && Intl.Segmenter) return [...new Intl.Segmenter().segment(s)].map(x => x.segment);
    return Array.from(s);
  }

  // Letter-by-letter spans for the entrance animation. Indic scripts are split by word so shaping stays intact.
  let letterIndex = 0;
  function letters(text) {
    const parts = /[ऀ-෿]/.test(text) ? text.split(/(\s+)/) : graphemes(text);
    return parts.map(ch => /^\s+$/.test(ch)
      ? '<span class="sp"> </span>'
      : `<span class="ch" style="--i:${letterIndex++}">${esc(ch)}</span>`).join('');
  }

  const fmtDate = d => d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const fmtTime = d => d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  function mandalaSVG() {
    const rings = [[16, 95, 9, 20], [12, 72, 9, 16], [10, 50, 7, 12], [8, 30, 5, 8]];
    let s = '<svg viewBox="-100 -100 200 200" aria-hidden="true">';
    for (const [n, r, rx, ry] of rings) {
      for (let i = 0; i < n; i++) s += `<ellipse cx="0" cy="${-r + ry}" rx="${rx}" ry="${ry}" transform="rotate(${(360 / n) * i})"/>`;
      s += `<circle r="${r}"/>`;
    }
    return s + '<circle r="10"/></svg>';
  }

  function decor(kind) {
    if (kind === 'mandala') return `<div class="mandala m1">${mandalaSVG()}</div><div class="mandala m2">${mandalaSVG()}</div>`;
    if (kind === 'frame') return '<div class="frame" aria-hidden="true"><i></i><i></i><i></i><i></i></div>';
    return '<div class="blob b1"></div><div class="blob b2"></div>';
  }

  // Opened from the website's catalog: show which design this is and how to order it.
  function demoBar(t) {
    if (!params.has('demo') || preview || $('#demoBar')) return;
    const serial = Templates.serial(t.no);
    const text = `Hi! I'd like to order design ${serial} (${t.name}) 💌`;
    const bar = Object.assign(document.createElement('aside'), { id: 'demoBar', className: 'demo-bar' });
    const href = SITE.whatsapp ? Core.orderUrl(SITE.whatsapp, text) : 'index.html#order';
    bar.innerHTML = `<span>Sample of design <b>${serial}</b></span>
      <a class="btn" href="${esc(href)}"${SITE.whatsapp ? ' target="_blank" rel="noopener"' : ''}>💬 Order ${serial}</a>`;
    document.body.appendChild(bar);
  }

  function applyTheme(t) {
    const root = document.documentElement;
    for (const [k, v] of Object.entries(t.vars)) root.style.setProperty(k, v);
    root.style.setProperty('--display', t.fonts.display);
    root.style.setProperty('--script', t.fonts.script);
    root.style.setProperty('--body', t.fonts.body);
    const fonts = Core.fontsUrl(t.fonts);
    if ($('#themeFonts').getAttribute('href') !== fonts) $('#themeFonts').href = fonts;
    document.body.className = document.body.className.replace(/\b(theme|flavor)-\S+/g, '').trim() + ` theme-${t.no}` + (t.flavor ? ` flavor-${t.flavor}` : '');
    const meta = $('meta[name="theme-color"]') || document.head.appendChild(Object.assign(document.createElement('meta'), { name: 'theme-color' }));
    meta.content = t.vars['--bg'];
  }

  function renderEnvelope(d, t) {
    $('#envelope').innerHTML = `
      <div class="env-wrap">
        ${guest ? `<p class="env-to">Dear <b>${esc(guest)}</b>,</p>` : ''}
        <div class="envelope" role="button" tabindex="0" aria-label="Open invitation">
          <div class="env-back"></div>
          <div class="env-letter"><span>${esc(t.emoji)}</span><small>You're invited</small></div>
          <div class="env-front"></div>
          <div class="env-flap"></div>
          <div class="env-seal">${esc(initials(d))}</div>
        </div>
        <p class="env-hint">Tap to open your invitation</p>
      </div>`;
    const env = $('.envelope');
    env.addEventListener('click', openCard);
    env.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openCard(); });
  }

  function eventCard(e, i) {
    const when = parseDate(e.date);
    return `
      <article class="event reveal" style="--i:${i}">
        <div class="event-dot"></div>
        <div class="event-body tilt">
          <h3>${esc(e.name)}</h3>
          ${when ? `<p class="event-when">${esc(fmtDate(when))} · ${esc(fmtTime(when))}</p>` : ''}
          ${e.venue ? `<p>📍 ${esc(e.venue)}</p>` : ''}
          ${e.dress ? `<p class="dress">✨ Dress code: ${esc(e.dress)}</p>` : ''}
        </div>
      </article>`;
  }

  function render(d) {
    const t = Templates.get(d.theme) || Templates.get(1);
    applyTheme(t);
    letterIndex = 0;

    const when = parseDate(d.date);
    const events = (d.events || []).filter(e => e && e.name);
    const photo = safeUrl(d.photo, true);
    const mapUrl = safeUrl(d.mapUrl) || (d.venue ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.venue)}` : '');
    const names = d.host2
      ? `<span class="name">${letters(d.host1 || '')}</span><span class="amp">&amp;</span><span class="name">${letters(d.host2)}</span>`
      : `<span class="name">${letters(d.host1 || '')}</span>`;

    $('#card').innerHTML = `
      <section class="hero">
        ${decor(t.decor)}
        ${photo ? `<div class="photo"><img src="${esc(photo)}" alt=""></div>` : `<div class="ornament">${esc(t.emoji)}</div>`}
        <p class="title fade" style="--d:.2s">${esc(d.title)}</p>
        <h1 class="names">${names}</h1>
        <p class="tagline fade" style="--d:1.6s">${esc(d.tagline)}</p>
        ${when ? `<div class="date-badge fade" style="--d:2s"><span>${esc(fmtDate(when))}</span><b>${esc(fmtTime(when))}</b></div>` : ''}
        <a class="scroll-hint fade" style="--d:2.6s" href="#details" aria-label="Scroll down">⌄</a>
      </section>

      <div id="details"></div>
      ${when ? `
      <section class="countdown reveal">
        <h2 class="section-title">Counting down</h2>
        <div class="cd-grid" id="cd">
          ${['Days', 'Hours', 'Minutes', 'Seconds'].map(u => `<div class="cd-cell"><b data-u="${u}">00</b><span>${u}</span></div>`).join('')}
        </div>
      </section>` : ''}

      ${d.message ? `<section class="message reveal"><span class="quote">“</span><p>${esc(d.message)}</p></section>` : ''}

      ${events.length ? `
      <section class="events">
        <h2 class="section-title reveal">The Celebrations</h2>
        <div class="timeline">${events.map(eventCard).join('')}</div>
      </section>` : ''}

      ${d.venue ? `
      <section class="venue reveal">
        <h2 class="section-title">Venue</h2>
        <div class="venue-pin">📍</div>
        <p class="venue-name">${esc(d.venue)}</p>
        <a class="btn ghost" href="${esc(mapUrl)}" target="_blank" rel="noopener">Get directions</a>
      </section>` : ''}

      <section class="actions reveal">
        ${when ? `<a class="btn" id="calBtn" target="_blank" rel="noopener">📅 Save the date</a>` : ''}
        ${Core.waNumber(d.rsvp) ? `<a class="btn" id="rsvpBtn" target="_blank" rel="noopener">💬 RSVP on WhatsApp</a>` : ''}
        <button class="btn ghost" id="shareBtn" type="button">🔗 Share</button>
      </section>

      <footer>Loved this invitation? <a href="index.html">Get one for your celebration</a> 💌<br><small>${esc(SITE.brand)}</small></footer>`;

    const who = Core.who(d);
    const inviteUrl = Core.shareUrl(location.href);
    if (when) {
      const end = new Date(when.getTime() + 4 * 3600e3);
      const cal = new URL('https://calendar.google.com/calendar/render');
      cal.searchParams.set('action', 'TEMPLATE');
      cal.searchParams.set('text', `${who}: ${PRESETS[d.type]?.label || 'Celebration'}`);
      cal.searchParams.set('dates', `${calStamp(when)}/${calStamp(end)}`);
      cal.searchParams.set('details', `${d.tagline || ''}\n\nInvitation: ${inviteUrl}`);
      if (d.venue) cal.searchParams.set('location', d.venue);
      $('#calBtn').href = cal.href;
    }
    if (Core.waNumber(d.rsvp)) {
      const num = Core.waNumber(d.rsvp);
      const msg = `Hi! ${guest ? guest + ' here. ' : ''}Thank you for the invitation to ${who}'s celebration. I'll be there! 🎉`;
      $('#rsvpBtn').href = `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
    }
    $('#shareBtn').addEventListener('click', share);

    startCountdown(when);
    setupReveal();
    setupTilt();

    if (fx) fx.destroy();
    fx = new FX($('#fx'), t.particles);
    if (music) music.tempo = t.tempo; else music = new MusicBox(t.tempo);

    document.title = `${who} 💌 You're invited`;
    demoBar(t);
    if (!opened) {
      renderEnvelope(d, t);
      if (params.has('auto')) setTimeout(openCard, 700);
    }
  }

  function openCard() {
    if (opened) return;
    opened = true;
    const screen = $('#envelope');
    screen.classList.add('open');
    setTimeout(() => {
      screen.classList.add('gone');
      document.body.classList.remove('locked');
      document.body.classList.add('opened');
      fx.burst(innerWidth / 2, innerHeight * 0.45);
      setTimeout(() => fx.burst(innerWidth * 0.2, innerHeight * 0.6, 70), 350);
      setTimeout(() => fx.burst(innerWidth * 0.8, innerHeight * 0.6, 70), 600);
    }, 1500);
    const btn = $('#musicBtn');
    btn.hidden = params.has('auto') && preview;
    if (data.music !== false && !preview && !params.has('auto') && music.start()) btn.classList.add('playing');
  }

  function startCountdown(when) {
    clearInterval(countdownTimer);
    if (!when) return;
    const tick = () => {
      const grid = $('#cd');
      if (!grid) return;
      let ms = when - Date.now();
      if (ms <= 0) {
        grid.innerHTML = '<p class="cd-done">The celebration has begun! 🎉</p>';
        clearInterval(countdownTimer);
        return;
      }
      const vals = { Days: Math.floor(ms / 864e5), Hours: Math.floor(ms / 36e5) % 24, Minutes: Math.floor(ms / 6e4) % 60, Seconds: Math.floor(ms / 1e3) % 60 };
      for (const [u, v] of Object.entries(vals)) {
        const el = grid.querySelector(`[data-u="${u}"]`);
        const text = String(v).padStart(2, '0');
        if (el.textContent !== text) {
          el.textContent = text;
          el.classList.remove('flip'); void el.offsetWidth; el.classList.add('flip');
        }
      }
    };
    tick();
    countdownTimer = setInterval(tick, 1000);
  }

  function setupReveal() {
    if (revealObserver) revealObserver.disconnect();
    revealObserver = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); revealObserver.unobserve(e.target); }
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  }

  function setupTilt() {
    if (!matchMedia('(hover: hover)').matches) return;
    document.querySelectorAll('.tilt').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(700px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(6px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  async function share() {
    const btn = $('#shareBtn');
    // Forward the general link, never this guest's personal one.
    const url = Core.shareUrl(location.href);
    if (navigator.share) {
      try { await navigator.share({ title: "You're invited 💌", url }); return; } catch (e) { if (e.name === 'AbortError') return; }
    }
    try { await navigator.clipboard.writeText(url); btn.textContent = '✅ Link copied'; }
    catch (e) { prompt('Copy this link:', url); }
  }

  $('#musicBtn').addEventListener('click', e => {
    e.currentTarget.classList.toggle('playing', music.toggle());
  });

  function show() {
    data = readData();
    if (data) render(data); else renderBroken();
  }

  addEventListener('hashchange', show);
  show();
})();
