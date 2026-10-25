// Pure helpers shared by every page. No DOM access, so they are unit tested in Node (tests/unit.test.js).
const Core = {
  esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  },

  // Only http(s) links, plus inline images when allowData is set; blocks javascript:, data:text/html, etc.
  safeUrl(u, allowData, base) {
    if (!u || typeof u !== 'string') return '';
    if (allowData && /^data:image\/(png|jpe?g|webp|gif);base64,[a-z0-9+/=]+$/i.test(u)) return u;
    try {
      const url = new URL(u, base || (typeof location !== 'undefined' ? location.href : 'http://localhost/'));
      if (url.protocol === 'http:' || url.protocol === 'https:') return url.href;
    } catch (e) { /* invalid URL */ }
    return '';
  },

  // Every field a card can have, all empty. Used as the base when loading a saved link
  // so values from a preset never leak into fields the link left out.
  blankCard() {
    return { type: 'wedding', theme: 1, title: '', host1: '', host2: '', tagline: '', date: '', venue: '', message: '', photo: '', mapUrl: '', rsvp: '', events: [], music: true };
  },

  // Drop empty values (and functions without a name) so the link stays short.
  compact(card) {
    const out = {};
    for (const [k, v] of Object.entries(card)) {
      if (k === 'events') {
        const ev = (v || []).filter(e => e && e.name && e.name.trim()).map(e => {
          const o = {};
          for (const [ek, evv] of Object.entries(e)) if (evv) o[ek] = evv;
          return o;
        });
        if (ev.length) out.events = ev;
      } else if (v !== '' && v != null) out[k] = v;
    }
    return out;
  },

  // Decoded link data must be a plain object; anything else means a broken link.
  isCard(d) {
    return !!d && typeof d === 'object' && !Array.isArray(d) && (d.events === undefined || Array.isArray(d.events));
  },

  parseDate(s) {
    const d = s ? new Date(s) : null;
    return d && !isNaN(d) ? d : null;
  },

  // Local "floating" time stamp for calendar links: 20261212T193000
  calStamp(d) {
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}00`;
  },

  who(card) {
    const a = (card.host1 || '').trim(), b = (card.host2 || '').trim();
    return a && b ? `${a} & ${b}` : a || b || 'Our celebration';
  },

  initials(card) {
    const first = s => Array.from((s || '').trim())[0];
    const a = first(card.host1) || '♥', b = first(card.host2);
    return b ? `${a}&${b}` : a;
  },

  cardUrl(base, code, guest) {
    const url = new URL('card.html', base);
    if (guest && guest.trim()) url.searchParams.set('to', guest.trim());
    url.hash = code;
    return url.href;
  },

  // The link a guest forwards: no personal name and no builder-only flags.
  shareUrl(href) {
    const url = new URL(href);
    for (const k of ['to', 'preview', 'auto']) url.searchParams.delete(k);
    return url.href;
  },

  // Google Fonts URL for just the families one theme uses (instead of every family on every card).
  fontsUrl(fonts) {
    const weights = { 'Cinzel Decorative': '400;700', 'Cormorant Garamond': '400;600', 'Playfair Display': '400;700', 'Poppins': '300;500', 'Fredoka': '400;600', 'Lora': '400;600', 'Baloo 2': '400;600', 'Dancing Script': '400;700' };
    const families = [...new Set(Object.values(fonts).map(f => (f.match(/'([^']+)'/) || [])[1]).filter(Boolean))];
    const q = families.map(f => `family=${f.replace(/ /g, '+')}${weights[f] ? `:wght@${weights[f]}` : ''}`).join('&');
    return `https://fonts.googleapis.com/css2?${q}&display=swap`;
  },

  waNumber(rsvp) {
    return String(rsvp || '').replace(/\D/g, '');
  },

  // WhatsApp chat with the business, or the page's order section when no number is set yet.
  orderUrl(whatsapp, text) {
    const number = Core.waNumber(whatsapp);
    return number ? `https://wa.me/${number}?text=${encodeURIComponent(text)}` : '#order';
  },

  inviteText({ guest, who, label, link }) {
    return `💌 ${guest ? `Dear ${guest}, y` : 'Y'}ou're invited!\n✨ ${who} · ${label}\n\nTap to open your invitation 👇\n${link}`;
  }
};

if (typeof module !== 'undefined') module.exports = Core;
