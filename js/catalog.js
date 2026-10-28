// The sellable catalog: the 300 templates merged with the per-design settings in config.js, plus poster markup.
// No DOM access, so it is unit tested in Node (tests/unit.test.js).
const Catalog = {
  entries(site = SITE, catalog = CATALOG) {
    return Templates.all.map(t => {
      const o = catalog[t.no] || {};
      const price = o.price !== undefined && o.price !== '' ? o.price : site.price;
      return {
        ...t,
        name: o.name || t.name,
        occasion: PRESETS[o.occasion] ? o.occasion : t.occasion,
        intro: INTROS[o.intro] ? o.intro : t.intro,
        price: price === '' || price == null ? '' : Number(price),
        hidden: !!o.hidden,
        featured: !!o.featured
      };
    });
  },

  // What customers see: hidden designs removed, trending first (in today's order), then by number.
  visible(entries) {
    return entries.filter(e => !e.hidden).sort((a, b) => (b.featured - a.featured) || ((a.hotRank ?? 99) - (b.hotRank ?? 99)) || (a.no - b.no));
  },

  // ---------- Trending today ----------
  // The trending designs change by themselves every morning at 8:00 India time, the same for everyone (no
  // server needed: the day decides). The owner's own Trending picks always stay; the rest of the ten are drawn
  // for the day, one per occasion in turn, and all of them are shown in a fresh order each day.
  TRENDING_COUNT: 10,
  // Today's number: it moves on at 8:00 in India (UTC+5:30), not at midnight.
  dayKey(now = Date.now()) {
    return Math.floor((now + (5.5 - 8) * 3600e3) / 864e5);
  },
  // Entries with today's trending marked (featured, and hotRank for the order). Returns copies: the catalog
  // settings themselves are never changed, so the panel still shows only the owner's own picks.
  trendingToday(entries, now = Date.now()) {
    let seed = Catalog.dayKey(now) * 2654435761 >>> 0;
    const rnd = () => { seed = (seed + 0x6D2B79F5) >>> 0; let t = seed; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const shuffle = list => { const a = list.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const shown = entries.filter(e => !e.hidden);
    const picked = shown.filter(e => e.featured);
    const byOcc = {};
    for (const e of shown) if (!e.featured) (byOcc[e.occasion] = byOcc[e.occasion] || []).push(e);
    const occs = shuffle(Object.keys(byOcc));
    for (let round = 0; picked.length < Catalog.TRENDING_COUNT && occs.some(o => byOcc[o].length); round++) {
      for (const o of occs) {
        if (picked.length >= Catalog.TRENDING_COUNT || !byOcc[o].length) continue;
        picked.push(byOcc[o].splice(Math.floor(rnd() * byOcc[o].length), 1)[0]);
      }
    }
    const rank = new Map(shuffle(picked).map((e, i) => [e.no, i]));
    return entries.map(e => rank.has(e.no) ? { ...e, featured: true, hotRank: rank.get(e.no) } : e);
  },

  // A number ("47", "#047") finds that one design; text matches the name or occasion.
  matches(e, query, occasion) {
    if (occasion && e.occasion !== occasion) return false;
    const q = String(query || '').trim().toLowerCase();
    if (!q) return true;
    const num = q.match(/^#?0*(\d+)$/);
    if (num) return e.no === +num[1];
    return `${e.name} ${PRESETS[e.occasion].label}`.toLowerCase().includes(q);
  },

  priceText(e, site = SITE) {
    return e.price === '' ? '' : `${site.currency || ''}${e.price.toLocaleString('en-IN')}`;
  },

  orderText(e) {
    return `Hi! I'd like to order design ${Templates.serial(e.no)} (${e.name}) 💌`;
  },

  // ---------- Orders from the website's order form ----------
  // order = { design, type, host1, host2, date, venue, events: [{ name, date, venue }], message, rsvp, guests: [], photo }
  // The WhatsApp message is readable for you, and ends with an order code the control panel turns back into the card.
  ORDER_TAG: 'WC1.',

  // With ref ("WC-7K2Q9H", online only) the message ends with that short order number and the full details
  // are saved with the order in the database; without it, the long order code carries them.
  orderMessage(order, entries, ref) {
    const p = PRESETS[order.type] || PRESETS.wedding;
    const e = order.design && entries ? entries[order.design - 1] : null;
    const when = s => {
      const d = Core.parseDate(s);
      if (!d) return '';
      const day = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
      return Core.hasTime(s) ? `${day}, ${d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}` : `${day} (time not decided yet)`;
    };
    // WhatsApp for Windows turns emoji in a pre-filled message into "�" and can drop the line breaks, so the
    // text uses no emoji and every detail has its own label and bullet: it reads well even as one long line.
    // (The order code keeps everything exactly as typed, emoji included.)
    const plain = s => String(s || '').replace(/[\u{10000}-\u{10FFFF}️‍⃣]/gu, '').replace(/\s+/g, ' ').trim();
    const names = [order.host1, order.host2].map(plain).filter(Boolean).join(' & ');
    const events = (order.events || []).filter(ev => ev && plain(ev.name));
    const guests = (order.guests || []).map(plain).filter(Boolean);
    const lines = ['*NEW INVITATION ORDER*', `• Design: ${e ? `*${Templates.serial(e.no)}* ${plain(e.name)}` : 'please suggest one'}`, `• Occasion: ${p.label}`];
    const add = (show, line) => { if (show) lines.push(line); };
    add(names, `• Names: ${names}`);
    const nicks = [order.nick1, order.nick2].map(plain).filter(Boolean).join(' & ');
    add(nicks, `• Nicknames: ${nicks}`);
    add(when(order.date), `• Date: ${when(order.date)}`);
    add(plain(order.venue), `• Venue: ${plain(order.venue)}`);
    add(Catalog.mapLink(order.mapUrl), `• Location: ${Catalog.mapLink(order.mapUrl)}`);
    add(events.length, `• Functions: ${events.map(ev => `${plain(ev.name)}${when(ev.date) ? ` (${when(ev.date)})` : ''}${plain(ev.venue) ? ` at ${plain(ev.venue)}` : ''}${plain(ev.dress) ? `, wear ${plain(ev.dress)}` : ''}`).join('; ')}`);
    add(plain(order.title), `• Headline: ${plain(order.title)}`);
    add(plain(order.tagline), `• Line under the names: ${plain(order.tagline)}`);
    add(plain(order.message), `• Message: ${plain(order.message)}`);
    add(Core.mobile(order.rsvp), `• RSVP number: ${Core.mobile(order.rsvp)}`);
    add(guests.length, `• Guests (${guests.length}): ${guests.join(', ')}`);
    add(order.photo, `• Photo: I'll send it in this chat`);
    add(order.gallery, `• Gallery: I'll send more photos in this chat`);
    add(order.music === false, `• Music: no background music`);
    add(order.video, `• Video invitation: ${plain(order.videoName || order.video)}${order.videoLang ? ` (${order.videoLang === 'hi' ? 'Hindi' : 'English'})` : ''}`);
    // Every "Make it special" detail, written out so the owner can read the whole order here.
    const list = (k, f) => (order[k] || []).map(f).filter(Boolean).join('; ');
    add((order.story || []).length, `• Our story: ${list('story', s => [s.when, s.title, s.text].map(plain).filter(Boolean).join(' - '))}`);
    add((order.families || []).length, `• Families: ${list('families', f => [f.side, f.parents, f.more].map(plain).filter(Boolean).join(' - '))}`);
    add((order.attire || []).length, `• Dress code: ${list('attire', a => [a.name, a.text].map(plain).filter(Boolean).join(' - '))}`);
    add(plain(order.upi), `• UPI for gifts: ${plain(order.upi)}`);
    add(plain(order.giftNote), `• Gift note: ${plain(order.giftNote)}`);
    add(plain(order.venueNote), `• Venue note: ${plain(order.venueNote)}`);
    add(plain(order.thanks), `• Thank-you line: ${plain(order.thanks)}`);
    add(plain(order.hashtag), `• Hashtag: ${plain(order.hashtag)}`);
    lines.push('', ref ? `Order no: ${ref}` : `Order code (please keep): ${Catalog.orderCode(order)}`);
    return lines.join('\n');
  },

  // "Make it special" in the order form: one entry per line, parts split by " – " (a dash, en dash or colon).
  // Story lines are "when – title – a line about it", family lines "side – parents – siblings",
  // dress lines "function – what to wear". A line without a dash is the title / parents / function alone.
  specialLines({ story = '', families = '', attire = '' }) {
    const rows = s => String(s).split('\n').map(l => l.trim()).filter(Boolean).slice(0, 8)
      .map(l => l.split(/\s+[–—-]\s+|\s*:\s+/).map(p => p.trim()).filter(Boolean));
    return {
      story: rows(story).map(p => p.length === 1 ? { when: '', title: p[0].slice(0, 60), text: '' }
        : { when: p[0].slice(0, 40), title: p[1].slice(0, 60), text: p.slice(2).join(' – ').slice(0, 300) }),
      families: rows(families).map(p => p.length === 1 ? { side: '', parents: p[0].slice(0, 120), more: '' }
        : { side: p[0].slice(0, 40), parents: p[1].slice(0, 120), more: p.slice(2).join(' – ').slice(0, 160) }),
      attire: rows(attire).map(p => ({ name: p[0].slice(0, 40), text: p.slice(1).join(' – ').slice(0, 100) }))
    };
  },

  // Optional Google Maps location: only plain http(s) links are kept.
  mapLink(u) {
    const s = typeof u === 'string' ? u.trim() : '';
    return /^https?:\/\/[^\s<>"']+$/i.test(s) && s.length <= 500 ? s : '';
  },

  // A short, easy-to-read order number. No 0/O, 1/I/L, so it can be read out over the phone.
  orderRef() {
    const abc = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    const bytes = typeof crypto !== 'undefined' ? crypto.getRandomValues(new Uint8Array(6)) : Array.from({ length: 6 }, () => Math.random() * 256 | 0);
    return 'WC-' + Array.from(bytes, n => abc[n % abc.length]).join('');
  },
  refOf(text) {
    const m = String(text || '').match(/\bWC-([A-HJ-KM-NP-Z2-9]{6})\b/i);
    return m ? 'WC-' + m[1].toUpperCase() : '';
  },

  // A video look's id as the Video Studio names it ("beach", "beach-golden"), or '' for anything else.
  videoId(v) {
    return typeof v === 'string' && /^[a-z]{3,12}(-[a-z]{3,12})?$/.test(v) ? v : '';
  },

  orderCode(order) {
    const o = Core.compact({
      design: order.design || '', type: order.type, host1: order.host1, host2: order.host2, nick1: order.nick1, nick2: order.nick2, date: order.date, venue: order.venue, mapUrl: Catalog.mapLink(order.mapUrl),
      events: (order.events || []).map(ev => ({ name: ev.name, date: ev.date, venue: ev.venue, dress: ev.dress })), message: order.message,
      rsvp: Core.mobile(order.rsvp), guests: (order.guests || []).map(g => String(g).trim()).filter(Boolean).join('\n'), photo: order.photo ? 1 : '',
      story: order.story, families: order.families, attire: order.attire, upi: order.upi, hashtag: order.hashtag,
      giftNote: order.giftNote, venueNote: order.venueNote, thanks: order.thanks, title: order.title, tagline: order.tagline,
      morePhotos: order.gallery ? 1 : '', music: order.music === false ? false : '', // ("gallery" is the card's photo list)
      video: Catalog.videoId(order.video), vlang: Catalog.videoId(order.video) && /^(hi|en)$/.test(order.videoLang) ? order.videoLang : ''
    });
    return Catalog.ORDER_TAG + Codec.encode(o);
  },

  // Reads a pasted WhatsApp order back. Returns { card, guests, photo } or null when there is no valid code.
  // Without the code (cut off, or the message typed out), the message's own lines are read instead ({ typed: true });
  // a message with only a design number gives { partial: true }.
  readOrder(text) {
    const m = String(text || '').match(/WC1\.([A-Za-z0-9_-]+)/);
    let o = null;
    if (m) { try { o = Codec.decode(m[1]); } catch (e) { o = null; } }
    if (!Core.isCard(o)) {
      const typed = Catalog.readMessage(text);
      if (typed) return { ...Catalog.fromPayload(typed), typed: true };
      // At least pick up the design number.
      const d = String(text || '').match(/#\s?(\d{1,3})\b/);
      return d && Templates.get(+d[1]) ? { card: { theme: +d[1] }, guests: [], photo: false, partial: true } : null;
    }
    return Catalog.fromPayload(o);
  },

  // The order message's labelled lines ("• Names: Riya & Kabir", "* Date: Sat, 12 Dec 2026, 7:30 pm"…) read back into
  // the order code's fields. Bullets may be • * · or -, and the line breaks may be lost (WhatsApp for Windows).
  // Returns null unless it finds the names or the functions.
  MESSAGE_LABELS: { 'Design': 'design', 'Occasion': 'occasion', 'Names': 'names', 'Nicknames': 'nicks', 'Date': 'date', 'Venue': 'venue',
    'Location': 'mapUrl', 'Functions': 'events', 'Headline': 'title', 'Line under the names': 'tagline', 'Message': 'message', 'RSVP number': 'rsvp',
    'Guests': 'guests', 'Photo': 'photo', 'Gallery': 'gallery', 'Music': 'music', 'Video invitation': 'video', 'Our story': 'story',
    'Families': 'families', 'Dress code': 'attire', 'UPI for gifts': 'upi', 'Gift note': 'giftNote', 'Venue note': 'venueNote',
    'Thank-you line': 'thanks', 'Hashtag': 'hashtag', 'Order no': 'end', 'Order code': 'end' },
  readMessage(text) {
    const s = String(text || '').replace(/\r/g, '').replace(/\s*\(time not decided yet\)/gi, '');
    const names = Object.keys(Catalog.MESSAGE_LABELS).sort((a, b) => b.length - a.length).map(l => l.replace(/[-()]/g, '\\$&'));
    const re = new RegExp(`(?:^|[\\n•*·]|\\s-)\\s*(${names.join('|')})(?:\\s*\\([^)]*\\))?\\s*:`, 'gi');
    const found = [...s.matchAll(re)];
    const v = {};
    found.forEach((m, i) => {
      const key = Catalog.MESSAGE_LABELS[Object.keys(Catalog.MESSAGE_LABELS).find(l => l.toLowerCase() === m[1].toLowerCase())];
      const val = s.slice(m.index + m[0].length, i + 1 < found.length ? found[i + 1].index : s.length).replace(/\s+/g, ' ').replace(/^[\s*•·]+|[\s*•·]+$/g, '').trim();
      if (key && key !== 'end' && !(key in v)) v[key] = val;
    });
    const items = x => (x || '').split(/\s*;\s*/).map(p => p.trim()).filter(Boolean);
    const events = items(v.events).map(p => {
      const e = p.match(/^(.*?)(?:\s*\(([^)]*)\))?(?:\s+at\s+(.*?))?(?:,\s*wear\s+(.*))?$/i) || [];
      return { name: (e[1] || p).trim(), date: Catalog.readWhen(e[2] || ''), venue: (e[3] || '').trim(), dress: (e[4] || '').trim() };
    }).filter(e => e.name);
    const [host1 = '', host2 = ''] = (v.names || '').split(/\s+(?:&|and|weds)\s+/i).map(x => x.trim());
    if (!host1 && !events.length) return null;
    const [nick1 = '', nick2 = ''] = (v.nicks || '').split(/\s*&\s*/);
    const occasion = Object.keys(PRESETS).find(k => PRESETS[k].label.toLowerCase() === (v.occasion || '').toLowerCase());
    const design = ((v.design || '').match(/#\s?(\d{1,3})\b/) || [])[1];
    const lines = k => items(v[k]).map(p => p.replace(/\s+-\s+/g, ' – ')).join('\n');
    const special = Catalog.specialLines({ story: lines('story'), families: lines('families'), attire: lines('attire') });
    return {
      design: design && Templates.get(+design) ? +design : '', type: occasion || (design && Templates.get(+design) ? (Catalog.entries()[design - 1] || {}).occasion : '') || 'wedding',
      host1, host2, nick1, nick2, date: Catalog.readWhen(v.date || ''), venue: v.venue || '', mapUrl: v.mapUrl || '', events,
      title: v.title || '', tagline: v.tagline || '', message: v.message || '', rsvp: v.rsvp || '',
      guests: (v.guests || '').split(/\s*,\s*/).filter(Boolean).join('\n'), photo: v.photo ? 1 : '', morePhotos: v.gallery ? 1 : '',
      music: /^no\b/i.test(v.music || '') ? false : '', vlang: /\bhindi\b/i.test(v.video || '') ? 'hi' : /\benglish\b/i.test(v.video || '') ? 'en' : '',
      story: special.story, families: special.families, attire: special.attire, upi: v.upi || '', giftNote: v.giftNote || '',
      venueNote: v.venueNote || '', thanks: v.thanks || '', hashtag: v.hashtag || ''
    };
  },
  // "Sat, 12 Dec 2026, 7:30 pm", "12 December, 2026" or "12/12/2026 19:30" → "2026-12-12T19:30" (or just the day)
  readWhen(s) {
    const t = String(s || '');
    const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    let y, mo, d;
    const a = t.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]{3,9})\.?,?\s+(\d{4})/i), b = t.match(/\b(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})\b/);
    if (a && MONTHS.includes(a[2].slice(0, 3).toLowerCase())) [d, mo, y] = [+a[1], MONTHS.indexOf(a[2].slice(0, 3).toLowerCase()) + 1, +a[3]];
    else if (b) [d, mo, y] = [+b[1], +b[2], +b[3]];
    else return '';
    // Only a day the calendar has (no 31 February)
    if (mo < 1 || mo > 12 || d < 1 || new Date(y, mo - 1, d).getDate() !== d) return '';
    const day = `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const tm = t.slice((a || b).index + (a || b)[0].length).match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b|(\d{1,2}):(\d{2})/i);
    if (!tm) return day;
    let h = +(tm[1] || tm[4]), min = +(tm[2] || tm[5] || 0);
    if (tm[3]) h = (h % 12) + (/pm/i.test(tm[3]) ? 12 : 0);
    return h < 24 && min < 60 ? `${day}T${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}` : day;
  },

  // An order code's fields, cleaned into the card the editor fills in.
  fromPayload(o) {
    const type = PRESETS[o.type] ? o.type : 'wedding';
    const str = v => (typeof v === 'string' ? v : '').slice(0, 300);
    const card = {
      // The customer's own headline and tagline, or the occasion's sample wording.
      type, title: str(o.title).slice(0, 80) || PRESETS[type].card.title, tagline: str(o.tagline).slice(0, 120) || PRESETS[type].card.tagline, music: o.music !== false,
      host1: str(o.host1), host2: str(o.host2), nick1: str(o.nick1).slice(0, 24), nick2: str(o.nick2).slice(0, 24), date: str(o.date), venue: str(o.venue), mapUrl: Catalog.mapLink(o.mapUrl), message: str(o.message), rsvp: Core.mobile(o.rsvp),
      events: (o.events || []).filter(ev => ev && typeof ev.name === 'string' && ev.name.trim()).slice(0, 15)
        .map(ev => ({ name: str(ev.name), date: str(ev.date), venue: str(ev.venue), dress: str(ev.dress).slice(0, 60) }))
    };
    // "Make it special" sections, cleaned the same way the card cleans them.
    const x = Core.extras(o);
    Object.assign(card, { story: x.story, families: x.families, upi: x.upi, hashtag: x.hashtag, giftNote: x.giftNote, venueNote: x.venueNote, thanks: x.thanks,
      attire: x.attire.map(a => ({ name: a.name, text: a.text, colors: a.colors.join(',') })) });
    const t = Templates.get(o.design);
    if (t) card.theme = t.no;
    const guests = (typeof o.guests === 'string' ? o.guests : '').split('\n').map(g => g.trim().slice(0, 60)).filter(Boolean).slice(0, 500);
    return { card, guests, photo: !!o.photo, gallery: !!o.morePhotos, video: Catalog.videoId(o.video), videoLang: /^(hi|en)$/.test(o.vlang) ? o.vlang : '' };
  },

  // The sample card for a design, using the sample text of its occasion.
  // A catalog-chosen opening travels in the link, so the card never needs the database.
  demoCode(e) {
    const intro = e.intro && e.intro !== (Templates.get(e.no) || {}).intro ? e.intro : '';
    return Codec.encode(Core.compact({ ...PRESETS[e.occasion].card, ...(EXTRAS[e.occasion] || {}), theme: e.no, intro }));
  },

  // Lightweight poster (plain HTML/CSS, no iframe). `tag`/`attrs` let each page make it a link or a button.
  // It shows the design's own fonts, layout, background, frame and name finish, so no two posters look alike.
  // The same couple the design's card shows (two of every three designs of an occasion with library pictures)
  posterCouple(e) {
    const pic = e.no % 3 !== 0 && Core.coupleFor(e.occasion, e.no - Math.floor(e.no / 3));
    return pic ? `<img class="p-couple${pic.flip ? ' flip' : ''}" src="img/couples/cut/${Core.esc(pic.id)}.png" alt="" width="${pic.w}" height="${pic.h}" loading="lazy" decoding="async">` : '';
  },

  poster(e, tag, attrs) {
    const c = PRESETS[e.occasion].card, v = e.vars, d = Core.parseDate(c.date);
    const day = d ? String(d.getDate()).padStart(2, '0') : '♥', month = d ? d.toLocaleDateString('en-IN', { month: 'short' }) : '';
    const look = `ps-${e.style || 'ivory'} d-${e.decor} l-${e.layout || 'classic'} s-${e.scene || 'glow'} n-${e.flavor || e.nameStyle || 'shimmer'} f-${e.frame || 'ring'}`;
    return `
      <${tag} class="poster ${look}" ${attrs} style="--a:${v['--accent']};--a2:${v['--accent2']};--b:${v['--bg']};--c:${v['--bg2']};--i:${v['--ink']};--fd:${e.fonts.display.replace(/'/g, '&quot;')};--fs:${e.fonts.script.replace(/'/g, '&quot;')}">
        <span class="p-scene" aria-hidden="true"></span>
        ${e.featured ? '<span class="p-badge">🔥 Trending</span>' : ''}
        <span class="p-mono" aria-hidden="true">${Core.esc(Core.initials(c))}</span>
        <span class="p-date" aria-hidden="true"><b>${day}</b>${Core.esc(month)}</span>
        <span class="p-body">
          ${Catalog.posterCouple(e) || (e.emblem ? `<span class="p-emoji p-medal">${Core.esc(Core.initials(c))}</span>` : `<span class="p-emoji">${e.emoji}</span>`)}
          <span class="p-title">${Core.esc(c.title)}</span>
          <span class="p-names">${Core.esc(c.host1)}${c.host2 ? `<i>&amp;</i>${Core.esc(c.host2)}` : ''}</span>
          <span class="p-tag">${Core.esc(c.tagline)}</span>
        </span>
        <span class="p-play">▶ Live demo</span>
        <span class="p-by">by ${Core.esc(SITE.designer || 'Sankalp')}</span>
      </${tag}>`;
  },

  // Only settings that differ from the defaults are written, so config.js stays short.
  clean(catalog) {
    const out = {};
    for (const [no, o] of Object.entries(catalog || {})) {
      const t = Templates.get(+no);
      if (!t || !o) continue;
      const c = {}, name = String(o.name || '').trim();
      if (name && name !== t.name) c.name = name;
      if (PRESETS[o.occasion] && o.occasion !== t.occasion) c.occasion = o.occasion;
      if (INTROS[o.intro] && o.intro !== t.intro) c.intro = o.intro;
      if (o.price !== undefined && o.price !== '' && o.price !== null && !isNaN(o.price)) c.price = Number(o.price);
      if (o.hidden) c.hidden = true;
      if (o.featured) c.featured = true;
      if (Object.keys(c).length) out[t.no] = c;
    }
    return out;
  },

  configFile(site, catalog) {
    return `// Site settings and the design catalog, written by the control panel on your PC (Publish).
// SITE.url: live address ending with "/". SITE.whatsapp: order number with country code, digits only.
// SITE.price: price shown under every design, "" hides prices. CATALOG: per-design changes by design number,
// e.g. "47": { "name": "...", "occasion": "wedding", "intro": "doors", "price": 1499, "hidden": true, "featured": true }.
// intro (how the card opens): envelope, doors, curtains, scroll, giftbox or cardflip.
const SITE = ${JSON.stringify(site, null, 2)};

const CATALOG = ${JSON.stringify(catalog, null, 2)};
`;
  }
};

if (typeof module !== 'undefined') module.exports = Catalog;
