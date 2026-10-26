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
    return { type: 'wedding', theme: 1, title: '', host1: '', host2: '', nick1: '', nick2: '', tagline: '', date: '', venue: '', message: '', photo: '', mapUrl: '', rsvp: '', events: [], music: true };
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

  // An Indian mobile number as WhatsApp needs it: "9876543210", "+91 98765-43210" or "919876543210"
  // all give "919876543210". Anything else (wrong length, not starting with 6-9) gives "".
  mobile(s) {
    let d = String(s || '').replace(/\D/g, '');
    if (d.length === 11 && d[0] === '0') d = d.slice(1);
    if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
    return /^[6-9]\d{9}$/.test(d) ? '91' + d : '';
  },

  // What a mobile-number box may hold while typing: digits only, at most 10. A pasted "+91 98765-43210"
  // or "09876543210" keeps just the 10-digit number.
  mobileInput(s) {
    let d = String(s || '').replace(/\D/g, '');
    if (d.length > 10 && (d.startsWith('91') || d.startsWith('0'))) d = d.replace(/^(91|0)/, '');
    return d.slice(0, 10);
  },

  // The hint under a mobile-number box: [text, state] where state is '' (typing), 'ok' or 'bad'.
  mobileHint(digits) {
    if (!digits) return ['', ''];
    if (digits.length < 10) return [`${digits.length}/10 digits`, ''];
    return Core.mobile(digits) ? ['10/10 ✓', 'ok'] : ['Mobile numbers start with 6, 7, 8 or 9', 'bad'];
  },

  // Browser only: every <input data-mobile> takes digits only (at most 10) and shows a live hint below it.
  // Runs before the page's own input handlers (capture), so they always see the cleaned number.
  wireMobileInputs(doc) {
    const show = input => {
      const hint = input.parentElement.querySelector('.mobile-hint');
      if (!hint) return;
      const [text, state] = Core.mobileHint(input.value);
      hint.textContent = text;
      hint.className = `mobile-hint ${state}`;
    };
    doc.addEventListener('input', e => {
      const input = e.target;
      if (!input.matches || !input.matches('[data-mobile]')) return;
      const clean = Core.mobileInput(input.value);
      if (input.value !== clean) input.value = clean;
      show(input);
    }, true);
    return show;
  },

  // Now, as a datetime-local value ("2026-10-25T21:05"): the earliest date that can be picked.
  nowLocal(now = new Date()) {
    return new Date(now.getTime() - now.getTimezoneOffset() * 6e4).toISOString().slice(0, 16);
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

  // How bright a #rrggbb colour looks, 0 (black) to 1 (white).
  luminance(hex) {
    const [r, g, b] = [1, 3, 5].map(i => parseInt(String(hex).slice(i, i + 2), 16) / 255);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b || 0;
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
