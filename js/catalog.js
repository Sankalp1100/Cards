// The sellable catalog: the 200 templates merged with the per-design settings in config.js, plus poster markup.
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

  // The sample card for a design, using the sample text of its occasion.
  demoCode(e) {
    return Codec.encode(Core.compact({ ...PRESETS[e.occasion].card, theme: e.no }));
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
// e.g. "47": { "name": "...", "occasion": "wedding", "price": 1499, "hidden": true, "featured": true }.
const SITE = ${JSON.stringify(site, null, 2)};

const CATALOG = ${JSON.stringify(catalog, null, 2)};
`;
  }
};

if (typeof module !== 'undefined') module.exports = Catalog;
