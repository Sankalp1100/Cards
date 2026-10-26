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

  // What customers see: hidden designs removed, trending first, then by number.
  visible(entries) {
    return entries.filter(e => !e.hidden).sort((a, b) => (b.featured - a.featured) || (a.no - b.no));
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

  orderCode(order) {
    const o = Core.compact({
      design: order.design || '', type: order.type, host1: order.host1, host2: order.host2, nick1: order.nick1, nick2: order.nick2, date: order.date, venue: order.venue, mapUrl: Catalog.mapLink(order.mapUrl),
      events: (order.events || []).map(ev => ({ name: ev.name, date: ev.date, venue: ev.venue, dress: ev.dress })), message: order.message,
      rsvp: Core.mobile(order.rsvp), guests: (order.guests || []).map(g => String(g).trim()).filter(Boolean).join('\n'), photo: order.photo ? 1 : '',
      story: order.story, families: order.families, attire: order.attire, upi: order.upi, hashtag: order.hashtag,
      giftNote: order.giftNote, venueNote: order.venueNote, thanks: order.thanks, title: order.title, tagline: order.tagline,
      morePhotos: order.gallery ? 1 : '', music: order.music === false ? false : '' // ("gallery" is the card's photo list)
    });
    return Catalog.ORDER_TAG + Codec.encode(o);
  },

  // Reads a pasted WhatsApp order back. Returns { card, guests, photo } or null when there is no valid code.
  readOrder(text) {
    const m = String(text || '').match(/WC1\.([A-Za-z0-9_-]+)/);
    let o = null;
    if (m) { try { o = Codec.decode(m[1]); } catch (e) { o = null; } }
    if (!Core.isCard(o)) {
      // No code (typed by hand): at least pick up the design number.
      const d = String(text || '').match(/#\s?(\d{1,3})\b/);
      return d && Templates.get(+d[1]) ? { card: { theme: +d[1] }, guests: [], photo: false, partial: true } : null;
    }
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
    return { card, guests, photo: !!o.photo, gallery: !!o.morePhotos };
  },

  // The sample card for a design, using the sample text of its occasion.
  // A catalog-chosen opening travels in the link, so the card never needs the database.
  demoCode(e) {
    const intro = e.intro && e.intro !== (Templates.get(e.no) || {}).intro ? e.intro : '';
    return Codec.encode(Core.compact({ ...PRESETS[e.occasion].card, ...(EXTRAS[e.occasion] || {}), theme: e.no, intro }));
  },

  // Lightweight poster (plain HTML/CSS, no iframe). `tag`/`attrs` let each page make it a link or a button.
  // It shows the design's own fonts, layout, background, frame and name finish, so no two posters look alike.
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
          ${e.emblem ? `<span class="p-emoji p-medal">${Core.esc(Core.initials(c))}</span>` : `<span class="p-emoji">${e.emoji}</span>`}
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
