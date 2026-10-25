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

  orderMessage(order, entries) {
    const p = PRESETS[order.type] || PRESETS.wedding;
    const e = order.design && entries ? entries[order.design - 1] : null;
    const when = s => {
      const d = Core.parseDate(s);
      return d ? d.toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';
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
    add(events.length, `• Functions: ${events.map(ev => `${plain(ev.name)}${when(ev.date) ? ` (${when(ev.date)})` : ''}${plain(ev.venue) ? ` at ${plain(ev.venue)}` : ''}`).join('; ')}`);
    add(plain(order.message), `• Message: ${plain(order.message)}`);
    add(Core.mobile(order.rsvp), `• RSVP number: ${Core.mobile(order.rsvp)}`);
    add(guests.length, `• Guests (${guests.length}): ${guests.join(', ')}`);
    add(order.photo, `• Photo: I'll send it in this chat`);
    lines.push('', `Order code (please keep): ${Catalog.orderCode(order)}`);
    return lines.join('\n');
  },

  // Optional Google Maps location: only plain http(s) links are kept.
  mapLink(u) {
    const s = typeof u === 'string' ? u.trim() : '';
    return /^https?:\/\/[^\s<>"']+$/i.test(s) && s.length <= 500 ? s : '';
  },

  orderCode(order) {
    const o = Core.compact({
      design: order.design || '', type: order.type, host1: order.host1, host2: order.host2, nick1: order.nick1, nick2: order.nick2, date: order.date, venue: order.venue, mapUrl: Catalog.mapLink(order.mapUrl),
      events: (order.events || []).map(ev => ({ name: ev.name, date: ev.date, venue: ev.venue })), message: order.message,
      rsvp: Core.mobile(order.rsvp), guests: (order.guests || []).map(g => String(g).trim()).filter(Boolean).join('\n'), photo: order.photo ? 1 : ''
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
      type, title: PRESETS[type].card.title, tagline: PRESETS[type].card.tagline, music: true,
      host1: str(o.host1), host2: str(o.host2), nick1: str(o.nick1).slice(0, 24), nick2: str(o.nick2).slice(0, 24), date: str(o.date), venue: str(o.venue), mapUrl: Catalog.mapLink(o.mapUrl), message: str(o.message), rsvp: Core.mobile(o.rsvp),
      events: (o.events || []).filter(ev => ev && typeof ev.name === 'string' && ev.name.trim()).slice(0, 15)
        .map(ev => ({ name: str(ev.name), date: str(ev.date), venue: str(ev.venue), dress: '' }))
    };
    const t = Templates.get(o.design);
    if (t) card.theme = t.no;
    const guests = (typeof o.guests === 'string' ? o.guests : '').split('\n').map(g => g.trim().slice(0, 60)).filter(Boolean).slice(0, 500);
    return { card, guests, photo: !!o.photo };
  },

  // The sample card for a design, using the sample text of its occasion.
  // A catalog-chosen opening travels in the link, so the card never needs the database.
  demoCode(e) {
    const intro = e.intro && e.intro !== (Templates.get(e.no) || {}).intro ? e.intro : '';
    return Codec.encode(Core.compact({ ...PRESETS[e.occasion].card, theme: e.no, intro }));
  },

  // Lightweight poster (plain HTML/CSS, no iframe). `tag`/`attrs` let each page make it a link or a button.
  poster(e, tag, attrs) {
    const c = PRESETS[e.occasion].card, v = e.vars;
    return `
      <${tag} class="poster d-${e.decor}" ${attrs} style="--a:${v['--accent']};--a2:${v['--accent2']};--b:${v['--bg']};--c:${v['--bg2']};--i:${v['--ink']}">
        ${e.featured ? '<span class="p-badge">🔥 Trending</span>' : ''}
        <span class="p-emoji">${e.emoji}</span>
        <span class="p-title">${Core.esc(c.title)}</span>
        <span class="p-names">${Core.esc(c.host1)}${c.host2 ? `<i>&amp;</i>${Core.esc(c.host2)}` : ''}</span>
        <span class="p-tag">${Core.esc(c.tagline)}</span>
        <span class="p-play">▶ Live demo</span>
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
