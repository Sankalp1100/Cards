// Card viewer: reads the invitation from the URL hash and plays it.
(function () {
  const params = new URLSearchParams(location.search);
  const record = params.has('record'); // being filmed by the video maker
  const preview = params.has('preview') || record;
  let guest = params.get('to');
  // Short links (cardalbum.vercel.app/i#Xy7Kq2p) carry a code; the card itself is in the database.
  const SHORT_CODE = /^[A-Za-z0-9]{6,16}$/;
  let shareCode = '';
  // The link a guest forwards: the general card, never their personal one.
  const shareLink = () => shareCode ? `${location.origin}${location.pathname}#${shareCode}` : Core.shareUrl(location.href);
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
  // Letters are grouped per word (class "w", no wrapping inside), so a long name only breaks between words.
  function letters(text) {
    return text.split(/(\s+)/).filter(Boolean).map(word => {
      if (/^\s+$/.test(word)) return '<span class="sp"> </span>';
      const parts = /[ऀ-෿]/.test(word) ? [word] : graphemes(word);
      return `<span class="w">${parts.map(ch => `<span class="ch" style="--i:${letterIndex++}">${esc(ch)}</span>`).join('')}</span>`;
    }).join('');
  }

  const fmtDate = d => d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  // 12-hour time, the way invitations in India say it: "7:30 pm".
  const fmtTime = d => d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });

  function mandalaSVG() {
    const rings = [[16, 95, 9, 20], [12, 72, 9, 16], [10, 50, 7, 12], [8, 30, 5, 8]];
    let s = '<svg viewBox="-100 -100 200 200" aria-hidden="true">';
    for (const [n, r, rx, ry] of rings) {
      for (let i = 0; i < n; i++) s += `<ellipse cx="0" cy="${-r + ry}" rx="${rx}" ry="${ry}" transform="rotate(${(360 / n) * i})"/>`;
      s += `<circle r="${r}"/>`;
    }
    return s + '<circle r="10"/></svg>';
  }

  // A small cluster of five-petal flowers with leaves, for the flower-corner decor.
  const FLOWERS = (() => {
    const flower = (x, y, r, cls) => `<g class="${cls}" transform="translate(${x} ${y})">${[0, 72, 144, 216, 288]
      .map(a => `<ellipse cx="0" cy="${-r}" rx="${r * 0.62}" ry="${r}" transform="rotate(${a})"/>`).join('')}<circle class="fc" r="${r * 0.42}"/></g>`;
    return `<svg viewBox="0 0 120 120" aria-hidden="true"><path class="lf" d="M10 70 Q40 40 70 52 Q42 62 10 70Z M48 12 Q60 42 46 72 Q40 40 48 12Z"/>
      ${flower(26, 28, 14, 'f1')}${flower(62, 58, 11, 'f2')}${flower(22, 82, 8, 'f2')}${flower(86, 22, 7, 'f1')}</svg>`;
  })();

  // Fairy lights hanging in two loops across the top.
  const LIGHTS = (() => {
    const pts = [];
    for (const [x0, x1] of [[0, 200], [200, 400]]) {
      for (let i = 1; i < 10; i++) {
        const s = i / 10, x = x0 + (x1 - x0) * s, y = (1 - s) * (1 - s) * 8 + 2 * (1 - s) * s * 58 + s * s * 8;
        pts.push([x, y]);
      }
    }
    return `<svg viewBox="0 0 400 80" preserveAspectRatio="none" aria-hidden="true"><path d="M0 8 Q100 58 200 8 Q300 58 400 8"/>
      ${pts.map(([x, y], i) => `<circle cx="${x.toFixed(1)}" cy="${(y + 5).toFixed(1)}" r="4.5" style="--n:${i % 6}"/>`).join('')}</svg>`;
  })();

  // Art-deco fan: concentric arcs with rays.
  const DECO = `<svg viewBox="0 0 200 100" aria-hidden="true">${[90, 72, 54, 36].map(r => `<path d="M${100 - r} 100 A${r} ${r} 0 0 1 ${100 + r} 100"/>`).join('')}
    ${Array.from({ length: 11 }, (_, i) => { const a = Math.PI * (i + 1) / 12; return `<line x1="100" y1="100" x2="${(100 - Math.cos(a) * 90).toFixed(1)}" y2="${(100 - Math.sin(a) * 90).toFixed(1)}"/>`; }).join('')}</svg>`;

  function decor(kind) {
    switch (kind) {
      case 'mandala': return `<div class="mandala m1">${mandalaSVG()}</div><div class="mandala m2">${mandalaSVG()}</div>`;
      case 'frame': return '<div class="frame" aria-hidden="true"><i></i><i></i><i></i><i></i></div>';
      case 'florals': return `<div class="florals" aria-hidden="true">${['tl', 'tr', 'bl', 'br'].map(p => `<div class="fl ${p}">${FLOWERS}</div>`).join('')}</div>`;
      case 'sunburst': return '<div class="sunburst" aria-hidden="true"></div>';
      case 'deco': return `<div class="deco top">${DECO}</div><div class="deco bottom">${DECO}</div>`;
      case 'lights': return `<div class="lights">${LIGHTS}</div>`;
      case 'stars': return `<div class="stars" aria-hidden="true"><i class="moon"></i>${Array.from({ length: 26 }, (_, i) =>
        `<i style="left:${(i * 37 + 11) % 97}%;top:${(i * 53 + 7) % 89}%;--s:${0.5 + (i % 4) * 0.35};--n:${i % 7}"></i>`).join('')}</div>`;
      case 'lace': return '<div class="lace top" aria-hidden="true"></div><div class="lace bottom" aria-hidden="true"></div>';
      default: return '<div class="blob b1"></div><div class="blob b2"></div>';
    }
  }

  // The animated background behind the whole card (fixed, so it never scrolls away). Everything in it moves
  // with transforms only, so it stays smooth on phones.
  function renderScene(kind) {
    const el = $('#scene');
    if (!el || el.dataset.kind === kind) return;
    el.dataset.kind = kind;
    el.className = `scene scene-${kind}`;
    const many = (n, f) => Array.from({ length: n }, (_, i) => f(i)).join('');
    el.innerHTML = {
      aurora: '<i></i><i></i><i></i>',
      mesh: '<i></i><i></i><i></i><i></i>',
      bokeh: many(14, i => `<i style="left:${(i * 41 + 7) % 100}%;--s:${0.5 + (i % 5) * 0.3};--d:${-(i * 1.7).toFixed(1)}s;--t:${12 + (i % 4) * 4}s"></i>`),
      // Two identical swells side by side, so sliding by half loops without a seam.
      waves: many(3, i => `<svg class="w${i}" viewBox="0 0 2400 120" preserveAspectRatio="none"><path d="M0 60 Q300 ${8 + i * 16} 600 60 T1200 60 T1800 60 T2400 60 V120 H0Z"/></svg>`),
      grid: '<b class="sun"></b><b class="floor"></b>',
      rays: '<i></i>',
      holo: '<i></i>',
      silk: '<i></i>',
      grain: '<i></i>'
    }[kind] || '';
  }

  // The host's WhatsApp for RSVPs: a 10-digit mobile gets India's 91; longer numbers already carry a country code.
  function rsvpNumber(d) {
    const digits = Core.waNumber(d.rsvp);
    return Core.mobile(d.rsvp) || (digits.length >= 11 && digits.length <= 15 ? digits : '');
  }

  // Optional nicknames under the names: “Sonu” & “Monu”.
  function nickLine(d) {
    const nicks = [d.nick1, d.nick2].map(n => String(n || '').trim()).filter(Boolean);
    return nicks.length ? `<p class="nicks fade" style="--d:1.3s">${nicks.map(n => `“${esc(n)}”`).join(' <span>&amp;</span> ')}</p>` : '';
  }

  // Names must never be cut: if the longest word is wider than the screen, the names shrink until it fits.
  function fitNames() {
    const box = $('.names');
    if (!box) return;
    box.style.fontSize = '';
    // The space the text really has: the container minus its padding (arch and ticket panels are padded),
    // and never more than the screen.
    const holder = box.parentElement, cs = getComputedStyle(holder);
    const room = Math.min(holder.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), innerWidth - 32) - 8;
    const widest = Math.max(...[...box.querySelectorAll('.w')].map(w => w.scrollWidth));
    if (widest > room) box.style.fontSize = `${parseFloat(getComputedStyle(box).fontSize) * room / widest}px`;
  }

  // The same pieces, arranged by the design's layout.
  function heroLayout(t, d, when, p) {
    const text = `${p.title}${p.names}${p.tagline}`;
    switch (t.layout) {
      case 'arch': return `${p.visual}<div class="hero-panel arch-panel">${text}${p.date}</div>${p.hint}`;
      case 'monogram': return `<div class="monogram" aria-hidden="true">${esc(initials(d))}</div>${p.visual}${text}${p.date}${p.hint}`;
      case 'ticket': {
        const stub = when
          ? `<b>${when.getDate()}</b><span>${esc(when.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }))}</span><small>${esc(fmtTime(when))}</small>`
          : '<b>♥</b><span>Save the date</span>';
        return `${p.visual}<div class="hero-panel ticket"><div class="ticket-main">${text}</div><div class="ticket-stub">${stub}</div></div>${p.hint}`;
      }
      case 'split': return `<div class="split"><div class="split-visual">${p.visual}${p.date}</div><div class="split-text">${text}</div></div>${p.hint}`;
      // Editorial: a magazine cover, with the date as giant outlined numbers and a line of text up the side.
      case 'editorial': {
        const big = when ? `${String(when.getDate()).padStart(2, '0')}<i>.</i>${String(when.getMonth() + 1).padStart(2, '0')}` : '♥';
        const side = `${PRESETS[d.type]?.label || 'Celebration'} · ${when ? when.getFullYear() : 'Save the date'}`;
        return `<div class="ed-num" aria-hidden="true">${big}</div><p class="ed-side" aria-hidden="true">${esc(side)}</p>${p.visual}${text}${p.date}${p.hint}`;
      }
      // Orbit: a ring of text slowly turning around the photo.
      case 'orbit': {
        const ring = `${PRESETS[d.type]?.label || 'Celebration'} ✦ ${initials(d)} ✦ ${when ? when.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Save the date'} ✦ `;
        return `<div class="orbit"><svg class="orbit-ring" viewBox="0 0 200 200" aria-hidden="true"><defs><path id="orbitPath" d="M100 100 m-84 0 a84 84 0 1 1 168 0 a84 84 0 1 1 -168 0"/></defs>
          <text><textPath href="#orbitPath" textLength="526" lengthAdjust="spacing">${esc(ring.toUpperCase())}</textPath></text></svg>${p.visual}</div>${text}${p.date}${p.hint}`;
      }
      default: return `${p.visual}${text}${p.date}${p.hint}`;
    }
  }

  // On a sample card (opened from the website's catalog) the card's buttons have nothing real to save or share,
  // so any of them opens the order form for this design, and an "Order" button leads the row.
  let sampleGuard = false;
  function sampleActions(t) {
    if (!params.has('demo') || preview) return;
    const orderHref = `index.html?order=${t.no}`;
    $('.actions').insertAdjacentHTML('afterbegin', `<a class="btn order-this" href="${orderHref}">💬 Order design ${Templates.serial(t.no)}</a>`);
    if (sampleGuard) return;
    sampleGuard = true;
    $('#card').addEventListener('click', e => {
      const b = e.target.closest('.actions .btn, .venue .btn');
      if (!b || b.classList.contains('order-this')) return;
      e.preventDefault();
      e.stopPropagation();
      location.href = `index.html?order=${(Templates.get(data.theme) || Templates.get(1)).no}`;
    }, true);
  }

  // Opened from the website's catalog: show which design this is and how to order it.
  function demoBar(t) {
    if (!params.has('demo') || preview || $('#demoBar')) return;
    const serial = Templates.serial(t.no);
    const bar = Object.assign(document.createElement('aside'), { id: 'demoBar', className: 'demo-bar' });
    // Opens the website's order form with this design filled in.
    bar.innerHTML = `<span>Sample of design <b>${serial}</b></span>
      <a class="btn" href="index.html?order=${t.no}">💬 Order ${serial}</a>`;
    document.body.appendChild(bar);
    document.body.classList.add('has-demo-bar'); // leaves room so the bar never covers the footer
  }

  function applyTheme(t) {
    const root = document.documentElement;
    for (const [k, v] of Object.entries(t.vars)) root.style.setProperty(k, v);
    root.style.setProperty('--display', t.fonts.display);
    root.style.setProperty('--script', t.fonts.script);
    root.style.setProperty('--body', t.fonts.body);
    const fonts = Core.fontsUrl(t.fonts);
    if ($('#themeFonts').getAttribute('href') !== fonts) $('#themeFonts').href = fonts;
    // Name style only applies without a flavour (neon and playful have their own lettering).
    const cls = [`theme-${t.no}`, t.flavor ? `flavor-${t.flavor}` : `ns-${t.nameStyle || 'shimmer'}`, `cs-${t.cardStyle || 'soft'}`,
      `fx-${t.nameFx || 'drop'}`, `pf-${t.frame || 'ring'}`, `rv-${t.reveal || 'up'}`, `ev-${t.events || 'timeline'}`, `cdn-${t.countdown || 'boxes'}`, `tt-${t.titles || 'flourish'}`,
      // Light or dark background, so metallic, holographic and glowing names stay readable on both.
      `mood-${Core.luminance(t.vars['--bg']) > 0.4 ? 'light' : 'dark'}`];
    document.body.className = document.body.className.replace(/\b(theme|flavor|ns|cs|fx|pf|rv|ev|cdn|tt|mood)-\S+/g, '').trim() + ' ' + cls.join(' ');
    renderScene(t.scene || 'glow');
    const meta = $('meta[name="theme-color"]') || document.head.appendChild(Object.assign(document.createElement('meta'), { name: 'theme-color' }));
    meta.content = t.vars['--bg'];
  }

  // How the invitation opens: the invite's own choice, else the catalog's, else the design's.
  function introOf(d, t) {
    const own = CATALOG[t.no] && CATALOG[t.no].intro;
    return INTROS[d.intro] ? d.intro : INTROS[own] ? own : t.intro || 'envelope';
  }
  const OPEN_MS = { envelope: 1500, doors: 1700, curtains: 1600, scroll: 1800, giftbox: 1500, cardflip: 1700 };
  let introKind = 'envelope';

  function introMarkup(kind, d, t) {
    const seal = esc(initials(d)), emoji = esc(t.emoji);
    const inside = `<span>${emoji}</span><small>You're invited</small>`;
    switch (kind) {
      case 'doors': return `
        <div class="doors">
          <div class="door-light">${inside}</div>
          <div class="door l"><i></i><i></i></div>
          <div class="door r"><i></i><i></i></div>
          <div class="door-seal">${seal}</div>
        </div>`;
      case 'curtains': return `
        <div class="curtains">
          <div class="stage-light">${inside}</div>
          <div class="curtain l"></div>
          <div class="curtain r"></div>
          <div class="valance"></div>
          <div class="curtain-tag">${seal}</div>
        </div>`;
      case 'scroll': return `
        <div class="scroll">
          <div class="rod top"></div>
          <div class="paper">${inside}</div>
          <div class="rod bottom"></div>
          <div class="scroll-seal">${seal}</div>
        </div>`;
      case 'giftbox': return `
        <div class="gift">
          <div class="gift-pop">${emoji}</div>
          <div class="gift-box"><b>${seal}</b></div>
          <div class="gift-lid"><i class="bow"></i></div>
        </div>`;
      case 'cardflip': return `
        <div class="fold">
          <div class="fold-inside">${inside}</div>
          <div class="fold-cover"><b>${seal}</b><small>Save the date</small></div>
        </div>`;
      default: return `
        <div class="envelope">
          <div class="env-back"></div>
          <div class="env-letter">${inside}</div>
          <div class="env-front"></div>
          <div class="env-flap"></div>
          <div class="env-seal">${seal}</div>
        </div>`;
    }
  }

  function renderEnvelope(d, t) {
    introKind = introOf(d, t);
    const screen = $('#envelope');
    screen.className = `envelope-screen intro-${introKind}`;
    screen.innerHTML = `
      <div class="env-wrap">
        ${guest ? `<p class="env-to">Dear <b>${esc(guest)}</b>,</p>` : ''}
        <div class="intro-tap" role="button" tabindex="0" aria-label="Open invitation">${introMarkup(introKind, d, t)}</div>
        <p class="env-hint">Tap to open your invitation</p>
      </div>`;
    const tap = $('.intro-tap');
    tap.addEventListener('click', openCard);
    tap.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openCard(); });
  }

  function eventCard(e, i) {
    const when = parseDate(e.date);
    return `
      <article class="event reveal" style="--i:${i}">
        <div class="event-dot"></div>
        <div class="event-body tilt">
          ${when ? `<div class="event-date" aria-hidden="true"><b>${when.getDate()}</b><span>${esc(when.toLocaleDateString('en-IN', { month: 'short' }))}</span></div>` : ''}
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
      <section class="hero layout-${t.layout || 'classic'}">
        ${decor(t.decor)}
        ${heroLayout(t, d, when, {
          // Without a photo the design's emoji takes its place; the polaroid frame also shows the initials as a caption.
          visual: photo ? `<div class="photo"><img src="${esc(photo)}" alt=""></div>` : `<div class="ornament">${esc(t.emoji)}<small class="orn-cap" aria-hidden="true">${esc(initials(d))}</small></div>`,
          title: `<p class="title fade" style="--d:.2s">${esc(d.title)}</p>`,
          names: `<h1 class="names">${names}</h1>${nickLine(d)}`,
          tagline: `<p class="tagline fade" style="--d:1.6s">${esc(d.tagline)}</p>`,
          date: when ? `<div class="date-badge fade" style="--d:2s"><span>${esc(fmtDate(when))}</span><b>${esc(fmtTime(when))}</b></div>` : '',
          hint: '<a class="scroll-hint fade" style="--d:2.6s" href="#details" aria-label="Scroll down">⌄</a>'
        })}
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
        ${rsvpNumber(d) ? `<a class="btn" id="rsvpBtn" target="_blank" rel="noopener">💬 RSVP on WhatsApp</a>` : ''}
        <button class="btn ghost" id="shareBtn" type="button">🔗 Share</button>
      </section>

      <footer>
        Loved this invitation? <a href="index.html">Get one for your celebration</a> 💌<br><small>${esc(SITE.brand)}</small>
        <p class="signature reveal"><small>Designed by</small><span>${esc(SITE.designer || 'Sankalp')}</span></p>
      </footer>`;

    const who = Core.who(d);
    const inviteUrl = shareLink();
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
    if (rsvpNumber(d)) {
      const num = rsvpNumber(d);
      const msg = `Hi! ${guest ? guest + ' here. ' : ''}Thank you for the invitation to ${who}'s celebration. I'll be there! 🎉`;
      $('#rsvpBtn').href = `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
    }
    $('#shareBtn').addEventListener('click', share);
    sampleActions(t);

    startCountdown(when);
    // Fit the names now, and again once the design's fonts arrive (they change the width).
    fitNames();
    document.fonts.ready.then(fitNames);
    $('#themeFonts').addEventListener('load', () => document.fonts.ready.then(fitNames), { once: true });
    setupReveal();
    setupTilt();

    if (fx) fx.destroy();
    fx = new FX($('#fx'), t.particles);
    if (music) { music.tempo = t.tempo; music.song = t.song; } else music = new MusicBox(t.tempo, t.song);

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
    }, OPEN_MS[introKind] || 1500);
    const btn = $('#musicBtn');
    // No music button when the invite has music switched off; the builder's preview stays silent.
    btn.hidden = preview || data.music === false;
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
        // How full each progress ring is (the "rings" countdown).
        el.parentElement.style.setProperty('--p', Math.min(1, v / { Days: 100, Hours: 24, Minutes: 60, Seconds: 60 }[u]).toFixed(3));
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
    const url = shareLink();
    if (navigator.share) {
      try { await navigator.share({ title: "You're invited 💌", url }); return; } catch (e) { if (e.name === 'AbortError') return; }
    }
    try { await navigator.clipboard.writeText(url); btn.textContent = '✅ Link copied'; }
    catch (e) { prompt('Copy this link:', url); }
  }

  $('#musicBtn').addEventListener('click', e => {
    if (!preview) e.currentTarget.classList.toggle('playing', music.toggle());
  });

  async function show() {
    const raw = location.hash.slice(1);
    if (SHORT_CODE.test(raw) && location.protocol.startsWith('http') && typeof DB !== 'undefined') {
      $('#card').innerHTML = '<p class="opening-note">💌<br>Opening your invitation…</p>';
      let row = null;
      try { row = await DB.getCard(raw); } catch (e) { /* offline or unknown code */ }
      if (row && Core.isCard(row.data)) {
        guest = guest || row.guest || null;
        shareCode = row.share || raw;
        data = row.data;
        $('#card').innerHTML = '';
        return render(data);
      }
      return renderBroken();
    }
    data = readData();
    if (data) render(data); else renderBroken();
  }

  // Video recording: tell the parent page when fonts are in, then on "record-start" play the whole card:
  // envelope, opening, a few seconds on the names, a slow scroll to the end, and "record-done".
  function setupRecording() {
    const tell = msg => parent.postMessage({ wcRecord: msg }, '*');
    const wait = ms => new Promise(r => setTimeout(r, ms));
    document.documentElement.style.scrollBehavior = 'auto';
    const t = Templates.get(data && data.theme) || Templates.get(1);
    const fonts = Object.values(t.fonts).map(f => document.fonts.load(`40px ${f}`).catch(() => null));
    Promise.race([Promise.all(fonts).then(() => document.fonts.ready), wait(5000)]).then(() => tell('ready'));
    addEventListener('message', async e => {
      if (!e.data || e.data.wcRecord !== 'start') return;
      await wait(1200);
      openCard();
      await wait((OPEN_MS[introKind] || 1500) + 3500);
      const el = document.scrollingElement, end = el.scrollHeight - innerHeight;
      const ms = Math.min(14000, Math.max(6000, end * 6));
      const t0 = performance.now();
      await new Promise(done => {
        const step = now => {
          const p = Math.min(1, (now - t0) / ms);
          el.scrollTop = end * (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2);
          p < 1 ? requestAnimationFrame(step) : done();
        };
        requestAnimationFrame(step);
      });
      await wait(2500);
      tell('done');
    });
  }

  addEventListener('hashchange', show);
  addEventListener('resize', () => fitNames());
  show();
  if (record) setupRecording();
})();
