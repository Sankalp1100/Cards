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
    return { type: 'wedding', theme: 1, title: '', host1: '', host2: '', nick1: '', nick2: '', tagline: '', date: '', venue: '', message: '', photo: '', mapUrl: '', rsvp: '', events: [], music: true,
      story: [], families: [], attire: [], gallery: [], venueNote: '', upi: '', giftNote: '', hashtag: '', thanks: '', rsvpForm: true };
  },

  // The premium sections' lists, and the field that must be filled for an entry to count.
  LISTS: { events: 'name', story: 'title', families: 'parents', attire: 'name' },

  // Drop empty values (and list entries without their main field) so the link stays short.
  compact(card) {
    const out = {};
    for (const [k, v] of Object.entries(card)) {
      if (Core.LISTS[k]) {
        const list = (Array.isArray(v) ? v : []).filter(e => e && typeof e[Core.LISTS[k]] === 'string' && e[Core.LISTS[k]].trim()).map(e => {
          const o = {};
          for (const [ek, evv] of Object.entries(e)) if (evv) o[ek] = evv;
          return o;
        });
        if (list.length) out[k] = list;
      } else if (k === 'gallery') {
        const g = (Array.isArray(v) ? v : []).filter(s => typeof s === 'string' && s);
        if (g.length) out.gallery = g;
      } else if (k === 'rsvpForm') {
        if (v === false) out.rsvpForm = false; // on unless switched off
      } else if (v !== '' && v != null) out[k] = v;
    }
    return out;
  },

  // Everything the premium sections show, read safely from a decoded link: only strings of sane length,
  // at most a few entries, colours only as #rrggbb, photos only as http(s) or inline images.
  extras(d) {
    const str = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
    const list = (v, max, f) => (Array.isArray(v) ? v : []).filter(e => e && typeof e === 'object').slice(0, max).map(f);
    const story = list(d.story, 8, e => ({ when: str(e.when, 40), title: str(e.title, 60), text: str(e.text, 300) })).filter(e => e.title);
    const families = list(d.families, 4, e => ({ side: str(e.side, 40), parents: str(e.parents, 120), more: str(e.more, 160) })).filter(e => e.parents);
    const attire = list(d.attire, 8, e => ({ name: str(e.name, 40), text: str(e.text, 100),
      colors: str(e.colors, 80).split(',').map(c => c.trim()).filter(c => /^#[0-9a-f]{6}$/i.test(c)).slice(0, 4) })).filter(e => e.name);
    const gallery = (Array.isArray(d.gallery) ? d.gallery : []).slice(0, 8).map(u => Core.safeUrl(u, true)).filter(Boolean);
    return {
      story, families, attire, gallery,
      venueNote: str(d.venueNote, 200), upi: str(d.upi, 60).replace(/[^\w.@-]/g, ''), giftNote: str(d.giftNote, 200),
      hashtag: str(d.hashtag, 40).replace(/\s+/g, ''), thanks: str(d.thanks, 200), rsvpForm: d.rsvpForm !== false
    };
  },

  // Decoded link data must be a plain object; anything else means a broken link.
  isCard(d) {
    // (The premium sections are checked field by field when shown: Core.extras.)
    return !!d && typeof d === 'object' && !Array.isArray(d) && (d.events === undefined || Array.isArray(d.events));
  },

  parseDate(s) {
    // "2026-12-12" (time not decided yet) means that day in local time, not midnight UTC.
    const day = typeof s === 'string' && s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const d = day ? new Date(+day[1], day[2] - 1, +day[3]) : s ? new Date(s) : null;
    return d && !isNaN(d) ? d : null;
  },

  // Whether a date also says the time ("2026-12-12T19:30") or only the day ("2026-12-12": time not decided yet).
  hasTime(s) {
    return typeof s === 'string' && /T\d/.test(s);
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

  // The short link to a design's sample: "https://site/d?n=12". Empty without a website address.
  sampleUrl(base, no) {
    const b = Core.safeUrl(base);
    return b && no ? new URL(`d?n=${no}`, b.endsWith('/') ? b : b + '/').href : '';
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
    const weights = { 'Cinzel Decorative': '400;700', 'Cormorant Garamond': 'ital,wght@0,400;0,600;1,400;1,500', 'Playfair Display': 'ital,wght@0,400;0,700;1,400', 'Poppins': '300;500', 'Fredoka': '400;600',
      'Lora': '400;600', 'Baloo 2': '400;600', 'Dancing Script': '400;700', 'Jost': '300;400;500;600', 'Cinzel': '400;600', 'Unbounded': '400;600' };
    const families = [...new Set(Object.values(fonts).map(f => (f.match(/'([^']+)'/) || [])[1]).filter(Boolean))];
    // "ital,wght@…" also loads the italics (Cormorant and Playfair italics are part of the elegant styles).
    const spec = w => (w.startsWith('ital') ? `:${w}` : `:wght@${w}`);
    const q = families.map(f => `family=${f.replace(/ /g, '+')}${weights[f] ? spec(weights[f]) : ''}`).join('&');
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

  // The WhatsApp message that goes with an invitation link, written for the occasion:
  // "With joy in our hearts, we invite you to the wedding of *Sankalp weds Sonal*", the date, the venue, the link.
  // Only symbols from the basic set (✨ ♥), because WhatsApp for Windows breaks emoji in pre-filled messages.
  // `card` needs type, host1, host2, date, venue (and tagline for a puja); old saved links pass who and label instead.
  inviteText({ guest, card, who, label, link }) {
    const c = card || {};
    const a = String(c.host1 || '').trim(), b = String(c.host2 || '').trim();
    const pair = j => (b ? `*${a} ${j} ${b}*` : `*${a}*`);
    const lines = {
      wedding: ['With joy in our hearts, we invite you to the wedding of', pair('weds'), 'Your presence and blessings will make our day complete. ♥'],
      engagement: ['Two hearts, one promise. You are invited to the engagement of', pair('&'), 'Come celebrate the beginning of our forever. ♥'],
      sangeet: ['Get your dancing shoes ready! You are invited to the Sangeet of', pair('&'), 'Music, dance and a whole lot of masti await you.'],
      kitty: [`${pair('&')} invites you to a fabulous kitty party`, '', 'Dress to impress and bring your best moves!'],
      bday: [`Let's celebrate! You are invited to the birthday party of`, pair('&'), 'Good food, great music and the best people. See you there!'],
      naming: [`With blessings and joy, ${pair('&')} invite you to the naming ceremony of their little one`, '', 'Your blessings mean the world to our family. ♥'],
      birthday: ['Balloons, cake and lots of fun! You are invited to the birthday party of', pair('&'), 'Come play, eat cake and make memories with us!'],
      babyshower: ['A little miracle is on the way! Join us for the baby shower of', pair('&'), 'Your blessings mean the world to us and our little one. ♥'],
      ceremony: [`With the blessings of the Almighty, ${pair('&')} ${String(c.tagline || 'invites you to a special ceremony').trim()}`, '', 'Please join us with your family to seek blessings.'],
      anniversary: ['Celebrating a lifetime of love! You are invited to the anniversary of', pair('&'), 'Come raise a toast to many more years together. ♥'],
      reception: ['With love and joy, you are invited to the wedding reception of', pair('&'), 'Dinner, music and a night to remember. ♥'],
      haldi: ['Get ready to turn yellow! You are invited to the Haldi of', pair('&'), 'Come in yellow and bring your brightest smile. 🌼'],
      mehendi: ['Henna, music and dance! You are invited to the Mehendi of', pair('&'), 'Come with your dancing shoes. 🌿'],
      roka: ['Two families, one new bond. You are invited to the Roka of', pair('&'), 'Your blessings will make it complete. ♥'],
      housewarming: [`With joy, ${pair('&')} invite you to the Griha Pravesh of their new home`, '', 'Please come with your family to bless our new beginning.'],
      mundan: ['With blessings and joy, you are invited to the ceremony of our little one', pair('&'), 'Your blessings mean the world to us. ♥'],
      janeu: ['With the blessings of the Almighty, you are invited to the Upanayana (Janeu) of', pair('&'), 'Please join us to bless him on his sacred day.'],
      retirement: ['A career to celebrate! You are invited to the retirement party of', pair('&'), 'Come raise a toast to the next chapter.'],
      festive: [`${pair('&')} invite you to a festive celebration`, '', 'Lights, sweets and lots of laughter. See you there!'],
      corporate: [`${pair('&')} invite you to get together`, '', 'Old friends, new stories. Do not miss it!']
    }[c.type];
    if (!lines || !a) {
      return `✨ ${guest ? `Dear ${guest}, y` : 'Y'}ou're invited! ✨\n${who || ''}${label ? ` · ${label}` : ''}\n\nOpen your invitation:\n${link}`;
    }
    const when = Core.parseDate(c.date);
    const day = when && when.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const time = when && Core.hasTime(c.date) ? `, ${when.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}` : '';
    return [
      '✨ *You\'re Invited* ✨', '',
      guest ? `Dear ${guest},` : '',
      lines[0], lines[1], '',
      day ? `Date: ${day}${time}` : '',
      c.venue ? `Venue: ${String(c.venue).trim()}` : '',
      '', 'Open your invitation:', link, '', lines[2]
    ].filter((l, i, all) => l !== '' || (all[i - 1] !== '' && i > 0)).join('\n').trim();
  }
};

if (typeof module !== 'undefined') module.exports = Core;
