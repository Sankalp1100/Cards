// Video Studio (admin only): story-style invitation videos drawn on a canvas (1080×1920, phone portrait), in six
// painted looks. The story: opening monogram and date, the invitation (blessing, names, parents), each function,
// save the date with the venue, and the closing with the "Designed by" signature. Every picture is drawn from code
// (no image files), so any card's details fit any look, and nothing is ever sent anywhere.
const Studio = (() => {
  const W = 1080, H = 1920, TAU = Math.PI * 2;
  const rng = seed => () => {
    seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => 1 - (1 - clamp(t)) ** 3;

  // ---------- Words ----------
  const INVITE_LINES = {
    wedding: 'Request your gracious presence\nat the wedding celebration of',
    engagement: 'Request the pleasure of your company\nat the engagement of',
    sangeet: 'Invite you to an evening of music & dance\nat the Sangeet of',
    kitty: 'You are invited to a fabulous\nkitty party by',
    bday: 'Join us to celebrate\nthe birthday of',
    naming: 'With joy we invite you\nto the naming ceremony hosted by',
    birthday: 'Come play, eat cake & celebrate\nthe birthday of',
    babyshower: 'Join us to shower love\nat the baby shower of',
    ceremony: 'With the blessings of the Almighty\nwe invite you to a ceremony hosted by',
    anniversary: 'Join us to celebrate\nthe anniversary of',
    reception: 'Request the pleasure of your company\nat the wedding reception of',
    haldi: 'Invite you to a morning of turmeric & joy\nat the Haldi of',
    mehendi: 'Invite you to an evening of henna & music\nat the Mehendi of',
    roka: 'With the blessings of our elders\nwe invite you to the Roka of',
    housewarming: 'With joy we invite you\nto the Griha Pravesh hosted by',
    mundan: 'With blessings we invite you\nto the ceremony of our little',
    janeu: 'With the blessings of the Almighty\nwe invite you to the Upanayana of',
    retirement: 'Join us to celebrate\nthe retirement of',
    festive: 'Join us for an evening of\nlights, sweets & laughter with',
    corporate: 'You are invited to\nan evening together with'
  };
  const CLOSINGS = {
    wedding: 'Awaiting your presence', engagement: 'Awaiting your presence', sangeet: 'Let’s dance together',
    kitty: 'See you there!', bday: 'See you there!', birthday: 'See you there!', naming: 'With love & blessings',
    babyshower: 'With love & blessings', ceremony: 'With blessings', anniversary: 'Cheers to love',
    reception: 'Awaiting your presence', haldi: 'See you in yellow!', mehendi: 'Let’s dance together', roka: 'With love & blessings',
    housewarming: 'With blessings', mundan: 'With love & blessings', janeu: 'With blessings', retirement: 'Here’s to the next chapter',
    festive: 'See you there!', corporate: 'See you there!'
  };
  const BLESSED = ['wedding', 'engagement', 'naming', 'ceremony', 'babyshower', 'haldi', 'mehendi', 'roka', 'housewarming', 'mundan', 'janeu'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const ordinal = n => n + ((n % 100 >= 11 && n % 100 <= 13) ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th');
  const clean = s => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
  const timeText = d => `${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() < 12 ? 'AM' : 'PM'}`;
  const dayText = d => `${DAYS[d.getDay()]}, ${ordinal(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  // "🌼 Haldi" → { icon: '🌼', name: 'Haldi' }
  function splitIcon(s) {
    const m = clean(s).match(/^((?:\p{Extended_Pictographic}|\p{Emoji_Presentation})(?:️|‍(?:\p{Extended_Pictographic}|\p{Emoji_Presentation}))*)\s*(.*)$/u);
    return m ? { icon: m[1], name: m[2] || '' } : { icon: '', name: clean(s) };
  }
  // "919876543210" → "+91 98765 43210"
  const phone = s => { const m = Core.mobile(s); return m ? `+91 ${m.slice(2, 7)} ${m.slice(7)}` : ''; };
  const initial = s => (Array.from(clean(s))[0] || '').toUpperCase();

  // The two families as "D/o …" / "S/o …" lines (wedding and engagement only), matched by what their side says,
  // else in order: the first family goes with the first name (the bride's side in the order form).
  function parents(card, lang) {
    if (!/^(wedding|engagement|reception|roka)$/.test(card.type)) return ['', ''];
    const fam = (card.families || []).filter(f => f && clean(f.parents));
    const bride = fam.find(f => /bride|ladki|daughter|girl|dulhan/i.test(f.side || ''));
    const groom = fam.find(f => /groom|ladka|\bson\b|boy|dulha/i.test(f.side || ''));
    const p1 = bride || fam.find(f => f !== groom), p2 = groom || fam.find(f => f !== p1);
    const [d, so] = lang === 'hi' ? ['सुपुत्री', 'सुपुत्र'] : ['D/o', 'S/o'];
    return [p1 ? `${d} ${clean(p1.parents)}` : '', p2 ? `${so} ${clean(p2.parents)}` : ''];
  }

  // ---------- Hindi ----------
  const HI = {
    months: ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितम्बर', 'अक्टूबर', 'नवम्बर', 'दिसम्बर'],
    days: ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'],
    label: { wedding: 'शुभ विवाह', engagement: 'सगाई समारोह', sangeet: 'संगीत संध्या', kitty: 'किटी पार्टी', bday: 'जन्मदिन समारोह',
      naming: 'नामकरण संस्कार', birthday: 'जन्मदिन', babyshower: 'गोद भराई', ceremony: 'पूजा एवं अनुष्ठान', anniversary: 'वैवाहिक वर्षगाँठ',
      reception: 'स्वागत समारोह', haldi: 'हल्दी रस्म', mehendi: 'मेहँदी रस्म', roka: 'रोका समारोह', housewarming: 'गृह प्रवेश',
      mundan: 'मुंडन संस्कार', janeu: 'उपनयन संस्कार', retirement: 'सेवानिवृत्ति समारोह', festive: 'उत्सव', corporate: 'मिलन समारोह' },
    invite: { wedding: 'परमपिता परमात्मा की असीम अनुकम्पा से\nआपको सादर आमन्त्रित करते हैं', engagement: 'आपको सपरिवार सादर आमन्त्रित करते हैं\nसगाई समारोह में',
      sangeet: 'संगीत और नृत्य की एक शाम\nआपके बिना अधूरी है', kitty: 'आप सादर आमन्त्रित हैं\nकिटी पार्टी में', bday: 'आइए, मिलकर मनाएँ\nजन्मदिन',
      naming: 'हर्षोल्लास के साथ आमन्त्रित करते हैं\nनामकरण संस्कार में', birthday: 'केक, खेल और ढेर सारी मस्ती\nजन्मदिन पर आइए', babyshower: 'आपका आशीर्वाद चाहिए\nगोद भराई में',
      ceremony: 'प्रभु की कृपा से\nआपको सादर आमन्त्रित करते हैं', anniversary: 'प्रेम के अनमोल वर्ष\nहमारे साथ मनाइए', reception: 'आपको सपरिवार सादर आमन्त्रित करते हैं\nस्वागत समारोह में',
      haldi: 'हल्दी की रस्म में\nआप सादर आमन्त्रित हैं', mehendi: 'मेहँदी की रस्म में\nआप सादर आमन्त्रित हैं', roka: 'बड़ों के आशीर्वाद से\nरोका समारोह में आमन्त्रित करते हैं',
      housewarming: 'नए घर में प्रवेश पर\nआपका आशीर्वाद चाहिए', mundan: 'संस्कार के शुभ अवसर पर\nआप सादर आमन्त्रित हैं', janeu: 'उपनयन संस्कार के शुभ अवसर पर\nआप सादर आमन्त्रित हैं',
      retirement: 'सेवा के सुनहरे वर्षों का उत्सव\nहमारे साथ मनाइए', festive: 'रोशनी, मिठाई और खुशियों के साथ\nआप सादर आमन्त्रित हैं', corporate: 'पुराने दोस्त, नई यादें\nआप सादर आमन्त्रित हैं' },
    closing: { wedding: 'आपकी प्रतीक्षा में', engagement: 'आपकी प्रतीक्षा में', reception: 'आपकी प्रतीक्षा में', roka: 'आपकी प्रतीक्षा में',
      sangeet: 'आइए, साथ झूमें', kitty: 'ज़रूर आइए!', bday: 'ज़रूर आइए!', birthday: 'ज़रूर आइए!', naming: 'प्रेम एवं आशीर्वाद सहित',
      babyshower: 'प्रेम एवं आशीर्वाद सहित', ceremony: 'आशीर्वाद सहित', anniversary: 'प्रेम के नाम', haldi: 'पीले रंग में मिलते हैं!',
      mehendi: 'आइए, साथ झूमें', housewarming: 'आशीर्वाद सहित', mundan: 'प्रेम एवं आशीर्वाद सहित', janeu: 'आशीर्वाद सहित',
      retirement: 'नए सफ़र की शुभकामनाएँ', festive: 'ज़रूर आइए!', corporate: 'ज़रूर आइए!' }
  };
  const hiDay = d => `${HI.days[d.getDay()]}, ${d.getDate()} ${HI.months[d.getMonth()]} ${d.getFullYear()}`;
  function hiTime(d) {
    const h = d.getHours(), m = d.getMinutes();
    const part = h < 4 ? 'रात्रि' : h < 12 ? 'प्रातः' : h < 16 ? 'दोपहर' : h < 19 ? 'सायं' : 'रात्रि';
    return `${part} ${h % 12 || 12}${m ? `:${String(m).padStart(2, '0')}` : ''} बजे`;
  }
  // "9 – 13 December 2026" (or "9 से 13 दिसम्बर 2026"): the first and last day of the card and its functions
  function dateRange(card, hi) {
    const ds = [card.date, ...(card.events || []).map(e => e && e.date)].map(s => Core.parseDate(s)).filter(Boolean).sort((a, b) => a - b);
    if (!ds.length) return '';
    const [a, b] = [ds[0], ds[ds.length - 1]], M = hi ? HI.months : MONTHS;
    const one = d => `${d.getDate()} ${M[d.getMonth()]} ${d.getFullYear()}`;
    if (a.toDateString() === b.toDateString()) return hi ? one(a) : `${ordinal(a.getDate())} ${MONTHS[a.getMonth()]} ${a.getFullYear()}`;
    const join = hi ? ' से ' : ' – ';
    if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) return `${a.getDate()}${join}${one(b)}`;
    return `${a.getDate()} ${M[a.getMonth()]}${join}${one(b)}`;
  }
  // In Hindi every fixed word is Hindi and the lettering is Devanagari: names in Amita, text in Tiro Devanagari Hindi
  const HINDI_FONT = { script: ['hname', .74], serif: ['hser', 1], italic: ['hser', .96], display: ['deva', .9] };
  const toHindi = it => {
    if (it.t !== 'text' || !HINDI_FONT[it.f]) return it;
    const [f, k] = HINDI_FONT[it.f];
    return { ...it, f, z: Math.round(it.z * k), up: false, ls: 0 };
  };

  // The couple art library (js/couples.js, made by tools/couples.mjs): which pictures suit an occasion, best first
  const library = () => (typeof COUPLES !== 'undefined' && Array.isArray(COUPLES) ? COUPLES : []);
  // In turn by the look's place (story films, then the 300 looks), so neighbouring videos never share a couple
  const coupleFor = (card, key) => {
    const ids = [...Object.keys(STORIES), ...Object.keys(LOOKS)], i = ids.indexOf(key);
    return Core.coupleFor(card.type, i >= 0 ? i : key);
  };
  // Opened from a file (admin.html double-clicked), pictures would stop the video from recording, so none are used
  const localFile = () => typeof location !== 'undefined' && location.protocol === 'file:';
  const EVENT_COUPLES = [[/haldi|pithi|ubtan/i, 'haldi'], [/mehe?n?d/i, 'mehendi'], [/sangeet|dance|dj|garba|dandiya|cocktail/i, 'sangeet'],
    [/reception|dinner|swagat|bhoj/i, 'reception'], [/phera|vivah|wedding|varmala|jaimala|shaadi|baraat|barat/i, 'wedding'], [/ring|engage|sagai|roka/i, 'engagement']];
  function eventCouple(name, key, avoid) {
    const occ = (EVENT_COUPLES.find(([re]) => re.test(name)) || [])[1];
    let list = library().filter(x => x.occasion === occ);
    if (list.length > 1 && avoid) list = list.filter(x => x.id !== avoid.id);
    if (!list.length) return null;
    let h = 5;
    for (const ch of key + name) h = (h * 37 + ch.charCodeAt(0)) >>> 0;
    return list[h % list.length];
  }
  const libImages = {};
  function libImage(entry) {
    if (!entry || typeof Image === 'undefined' || localFile()) return null;
    if (!libImages[entry.id]) { const img = new Image(); img.src = `img/couples/cut/${entry.id}.png`; libImages[entry.id] = img; }
    const img = libImages[entry.id];
    return img.complete && img.naturalWidth ? img : null;
  }

  // Couples are drawn on the title scene (bride and groom); these occasions have a couple
  const COUPLE_TYPES = ['wedding', 'engagement', 'reception', 'roka', 'anniversary', 'sangeet', 'haldi', 'mehendi'];
  const hasCouple = card => COUPLE_TYPES.includes(card.type) && !!clean(card.host1) && !!clean(card.host2);

  const defaults = (card, lang = 'en') => ({
    look: OCCASION_LOOK[card.type] || 'vrindavan',
    story: '',
    lang,
    blessing: BLESSED.includes(card.type),
    blessingText: '॥ श्री गणेशाय नमः ॥',
    inviteLine: (lang === 'hi' ? HI.invite : INVITE_LINES)[card.type] || (lang === 'hi' ? HI.invite.wedding : INVITE_LINES.wedding),
    parents: true,
    events: 'each', // every function on its own screen, in its own scenery
    music: 'look',
    brand: true, // the website and its QR code at the end (off: neither appears)
    signature: true, // "Designed by Sankalp" (off: it appears nowhere in the video)
    ganeshaArt: 'photo', coupleArt: 'photo', // 'photo' (a real one), 'drawn' or 'none'; a couple shows only with their photo
    photos: {}
  });

  // ---------- The story: which scenes, how long each ----------
  // Doors open on the blessing (with Ganesha) → the title (monogram, names, dates, the couple) → the invitation
  // (with the parents) → each function → the venue → the closing wishes → Thank You, the website's QR code and the
  // designer's signature in the corner.
  function timeline(card, opt) {
    if (Array.isArray(opt.script)) {
      let t = 0;
      const scenes = opt.script.map(x => { const sc = { k: 'custom', ...x, t0: t }; t += sc.d; return sc; });
      return { scenes, total: t };
    }
    const photos = opt.photos || {}, lib = opt.coupleArt !== 'none' && coupleFor(card, opt.story || opt.look || '');
    // A couple (or a family, a child) shows with their own photo, a picture from the library, or the drawing when chosen
    const couple = opt.coupleArt === 'drawn' ? hasCouple(card) : opt.coupleArt !== 'none' && (!!photos.couple && hasCouple(card) || !!lib);
    const god = opt.blessing && opt.ganeshaArt !== 'none';
    const S = [god
      ? { k: 'open', d: 6, doors: true, shower: true, ganesha: { y: 600, s: 760 }, zone: [200, 500, 940] }
      : { k: 'open', d: 5.5, doors: true, shower: true }];
    S.push(couple ? { k: 'title', d: 6, couple: { y: 1880, s: 860 }, zone: [250, 960, 780] } : { k: 'title', d: 5.5 });
    const [p1, p2] = opt.parents ? parents(card, opt.lang) : ['', ''];
    S.push({ k: 'invite', d: p1 || p2 ? 7.5 : 6.5 });
    const evs = (card.events || []).filter(e => clean(e.name)).slice(0, 6);
    const evD = evs.length > 5 ? 4 : 0; // six functions: a little shorter each, so the video still fits a WhatsApp status
    const art = opt.coupleArt !== 'none' && opt.coupleArt !== 'drawn' && !(opt.photos || {}).couple;
    if (opt.events === 'each') evs.forEach(e => {
      const pic = art && eventCouple(clean(e.name), opt.story || opt.look || '', couple && !(opt.photos || {}).couple && coupleFor(card, opt.story || opt.look || ''));
      S.push(pic ? { k: 'event', e, d: evD || 5, couple: { y: 1880, s: 820 }, coupleEntry: pic, zone: [230, 940, 780] } : { k: 'event', e, d: evD || 4.5 });
    });
    else if (opt.events === 'list' && evs.length) S.push({ k: 'events', evs, d: 4 + evs.length });
    if (Core.parseDate(card.date) || clean(card.venue)) S.push({ k: 'date', d: 5.5 });
    S.push({ k: 'end', d: 6 });
    S.push({ k: 'final', d: 5, sigCorner: opt.signature !== false });
    if (opt.story && STORIES[opt.story]) storyLooks(S, STORIES[opt.story], opt.story);
    else eventLooks(S, opt.look);
    let t = 0;
    S.forEach(s => { s.t0 = t; t += s.d; });
    return { scenes: S, total: t };
  }
  const sceneName = s => s.name || ({ open: 'Opening', title: 'Title', invite: 'Invitation', events: 'Functions', date: 'Venue', end: 'Regards', final: 'Thank You' })[s.k]
    || splitIcon(s.e.name).name || 'Function';

  // What each scene says, as a list of lines for the layout below.
  function lines(s, card, opt) {
    if (s.k === 'custom') return (s.items || []).filter(Boolean).map(it => ({ gap: 12, ...it }));
    const hi = opt.lang === 'hi', two = !!clean(card.host2), when = Core.parseDate(card.date), timed = when && Core.hasTime(card.date);
    const T = (str, f, z, col, more) => clean(str) ? { t: 'text', s: clean(str), f, z, col, gap: 12, ...more } : null;
    const label = hi ? HI.label[card.type] || HI.label.wedding : `${(PRESETS[card.type] || PRESETS.wedding).label} Invitation`;
    const day = d => hi ? hiDay(d) : dayText(d), time = d => hi ? hiTime(d) : `${timeText(d)} onwards`;
    let L = [];
    if (s.k === 'open') {
      L = s.ganesha
        ? [T(opt.blessingText, /[ऀ-ॿ]/.test(opt.blessingText) ? 'deva' : 'serif', 104, 'names', { gold: true })]
        : [{ t: 'crest', h: 210, gap: 30 }, T(hi ? 'आप आमन्त्रित हैं' : 'You’re Invited', 'script', 150, 'names', { gold: true, gap: 16 }), T(label, 'serif', 34, 'accent', { up: true, ls: 6 })];
    } else if (s.k === 'title') {
      const names = two ? `${clean(card.host1)} & ${clean(card.host2)}` : clean(card.host1);
      L = [{ t: 'mono', z: s.couple ? 220 : (two ? 280 : 320), gap: 26 },
        T(label, 'serif', 50, 'accent', { gap: 10 }),
        T(names, 'script', names.length > 18 ? 96 : 116, 'names', { gap: 12 }),
        T(dateRange(card, hi), 'serif', 44, 'ink')];
    } else if (s.k === 'invite') {
      const [p1, p2] = opt.parents ? parents(card, opt.lang) : ['', ''];
      const req = String(opt.inviteLine || '').split('\n').map(x => T(x, 'serif', 44, 'ink', { gap: 6 })).filter(Boolean);
      if (req.length) req[req.length - 1].gap = 30;
      L.push(...req, T(card.host1, 'script', 150, 'names', { gap: p1 ? 4 : 18 }), T(p1, 'serif', 34, 'ink2', { wrap: 2, gap: 26 }));
      if (two) {
        L.push({ t: 'div', word: hi ? 'संग' : card.type === 'wedding' ? 'Weds' : '&', z: 50, gap: 22, hi },
          T(card.host2, 'script', 150, 'names', { gap: 4 }), T(p2, 'serif', 34, 'ink2', { wrap: 2 }));
      }
    } else if (s.k === 'event') {
      const { icon, name } = splitIcon(s.e.name), d = Core.parseDate(s.e.date);
      L = [T(hi ? 'मांगलिक कार्यक्रम' : 'We cordially invite you to the', hi ? 'serif' : 'italic', hi ? 44 : 38, 'accent', { gap: 14 }),
        icon ? { t: 'emoji', s: icon, z: 92, gap: 10 } : null,
        T(name, 'script', 150, 'names', { gap: 16 }), { t: 'div', word: '', z: 40, gap: 30 },
        d ? T(day(d), 'serif', 44, 'ink', { gap: 10 }) : null,
        d && Core.hasTime(s.e.date) ? T(time(d), 'serif', 40, 'accent', { gap: 26 }) : null,
        T(s.e.venue, 'serif', 42, 'ink', { wrap: 2, gap: 14 }),
        T(s.e.dress && `${hi ? 'परिधान' : 'Dress code'} · ${clean(s.e.dress)}`, 'italic', 40, 'ink2', { wrap: 2 })];
    } else if (s.k === 'events') {
      L = [T(hi ? 'मांगलिक कार्यक्रम' : 'The Celebrations', 'script', 124, 'names', { gap: 6 }), { t: 'div', word: '', z: 40, gap: 36 }];
      s.evs.forEach(e => {
        const d = Core.parseDate(e.date);
        const short = d && (hi ? `${HI.days[d.getDay()]}, ${d.getDate()} ${HI.months[d.getMonth()]}` : `${DAYS[d.getDay()].slice(0, 3)}, ${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`);
        L.push(T(e.name, 'serif', 50, 'ink', { gap: 6 }),
          T([short, d && Core.hasTime(e.date) && (hi ? hiTime(d) : timeText(d)), clean(e.venue)].filter(Boolean).join('  ·  ') || ' ',
            'italic', 38, 'ink2', { wrap: 2, gap: 30 }));
      });
    } else if (s.k === 'date') {
      L = [T(when ? (hi ? 'शुभ तिथि' : 'Save the Date') : (hi ? 'समारोह स्थल' : 'Join us at'), 'script', 132, 'names', { gap: 26 }),
        when ? (hi ? T(hiDay(when), 'serif', 52, 'ink', { gap: 8 }) : { t: 'cal', d: when, timed, gap: 30 }) : null,
        when && hi && timed ? T(hiTime(when), 'serif', 46, 'accent', { gap: 20 }) : null,
        { t: 'div', word: '', z: 40, gap: 30 },
        when && clean(card.venue) ? T(hi ? 'स्थान' : 'Venue', 'serif', 30, 'accent', { up: true, ls: 8, gap: 12 }) : null,
        T(card.venue, 'serif', 48, 'ink', { wrap: 3, gap: 14 }), T(card.venueNote, 'italic', 40, 'ink2', { wrap: 2 })];
    } else if (s.k === 'end') {
      const fams = /^(wedding|engagement|reception|roka)$/.test(card.type) ? (card.families || []).map(f => clean(f && f.parents)).filter(Boolean).slice(0, 3) : [];
      const tag = clean(card.hashtag).replace(/^#+/, '');
      L = [T(hi ? HI.closing[card.type] || HI.closing.wedding : CLOSINGS[card.type] || CLOSINGS.wedding, 'script', 116, 'names', { gap: 22 }),
        T(card.thanks || card.message, 'italic', 46, 'ink', { wrap: 4, gap: 34 }),
        fams.length ? T(hi ? 'दर्शनाभिलाषी' : 'Warm regards', 'serif', 30, 'accent', { up: true, ls: 5, gap: 12 }) : null,
        ...fams.map((f, i) => T(f, 'serif', 38, 'ink2', { wrap: 2, gap: i === fams.length - 1 ? 28 : 8 })),
        T(tag && `#${tag}`, 'serif', 42, 'accent', { gap: 14 }),
        T(phone(card.rsvp) && `${hi ? 'संपर्क' : 'RSVP'}  ·  ${phone(card.rsvp)}`, 'serif', 36, 'ink')];
    } else if (s.k === 'final' && opt.brand === false) {
      L = [T(hi ? 'धन्यवाद' : 'Thank You', 'script', 160, 'names', { gap: 10 }),
        T(hi ? 'हमारी ख़ुशियों में शामिल होने के लिए' : 'for being part of our celebration', 'italic', 44, 'ink2', { gap: 30 }),
        T(clean(card.host2) ? `${clean(card.host1)} & ${clean(card.host2)}` : card.host1, 'script', 96, 'accent')];
    } else if (s.k === 'final') {
      L = [T(hi ? 'धन्यवाद' : 'Thank You', 'script', 140, 'names', { gap: 4 }),
        T(hi ? 'हमारी ख़ुशियों में शामिल होने के लिए' : 'for being part of our celebration', 'italic', 38, 'ink2', { gap: 36 }),
        { t: 'qr', rows: SITE_QR, z: 260, gap: 36 },
        T(hi ? 'ऐसा ही निमन्त्रण बनवाएँ' : 'Your invitation, made like this', 'italic', 34, 'ink2', { gap: 6 }),
        T('cardalbum.vercel.app', 'serif', 44, 'names', { lat: true })];
    }
    L = L.filter(Boolean);
    return hi ? L.map(it => (it.lat ? it : toHindi(it))) : L;
  }

  // ---------- Story films: the scenery changes from scene to scene, each film with its own tune ----------
  // Each names the look for every part of the story; a function takes the look its name suggests (Haldi, Mehendi,
  // Baraat, Pheras, Reception…), else the film's own next one.
  const STORIES = {
    // Shahi Parampara: the film made for Sudhanshu & Yadu, for every order. Doors open on Ganesh ji, then each
    // function in its own colours (fn: the look a function's name takes) with a couple for it.
    'story-shahi': { name: 'Shahi Parampara', note: 'Curtains open on Ganesh ji, and every function in its own colours', tune: 'royal', opening: 'curtains',
      open: 'temple-golden', title: 'jharokha-champagne', invite: 'vrindavan-roseblush', events: ['haveli-pink', 'palace-plum', 'rosegarden-golden'],
      date: 'blush-peach', end: 'rosegarden-golden', final: 'mandap-roseblush', ganesha: 'ganesha-01',
      fn: [[/haldi|pithi|ubtan/i, 'haldi-saffron'], [/mehe?n?d/i, 'mehendi-emerald'], [/baraat|barat|ghud|ghod|sehra/i, 'haveli-pink'],
        [/sangeet|dance|dj|garba|dandiya|cocktail/i, 'lights-roseblush'], [/phera|vivah|wedding|varmala|jaimala|mandap|shaadi/i, 'mandap-golden'],
        [/reception|dinner|bhoj|swagat/i, 'palace-plum']] },
    'story-rajwada': { name: 'Royal Rajwada', note: 'Temple → jharokha → haveli → palace → mandap', tune: 'shehnai',
      open: 'temple', title: 'jharokha', invite: 'blush', events: ['haveli', 'palace', 'mandap'], date: 'palace', end: 'rosegarden', final: 'mandap' },
    'story-pastel': { name: 'Pastel Blossom', note: 'Soft florals and a pink mandap', tune: 'romantic',
      open: 'temple-sandal', title: 'rosegarden', invite: 'blush', events: ['mandap', 'blush-peach', 'rosegarden-sakura'], date: 'mandap', end: 'blush-sage', final: 'rosegarden' },
    'story-night': { name: 'Starlit Night', note: 'Lotus pond, palace lights and a starry sky', tune: 'cinematic',
      open: 'lotusnight', title: 'palace-blue', invite: 'galaxy', events: ['lights', 'palace', 'galaxy-plum'], date: 'lights', end: 'palace', final: 'diwali' },
    'story-mehfil': { name: 'Mughal Mehfil', note: 'Jharokhas, haveli doors and a sufi evening', tune: 'sufi',
      open: 'lotusnight-dawn', title: 'jharokha-night', invite: 'haveli-blue', events: ['haveli', 'jharokha-rose', 'lights'], date: 'palace-rose', end: 'haveli', final: 'jharokha' },
    'story-baraat': { name: 'Baraat Dhamaka', note: 'Marigolds, haveli doors and a dhol beat', tune: 'baraat',
      open: 'temple', title: 'marigold', invite: 'haveli-pink', events: ['haveli', 'marigold-green', 'palace'], date: 'palace', end: 'marigold', final: 'diwali' },
    'story-garden': { name: 'Garden Romance', note: 'Vrindavan, roses and fairy lights', tune: 'royal',
      open: 'vrindavan', title: 'rosegarden', invite: 'blush-sage', events: ['vrindavan-golden', 'lights', 'mandap'], date: 'lights', end: 'rosegarden', final: 'vrindavan' },
    'story-destination': { name: 'Destination Dreams', note: 'Beach sunset to Himalayan peaks', tune: 'santoor',
      open: 'beach', title: 'himalaya', invite: 'beach-golden', events: ['lights', 'himalaya-golden', 'beach-moonlit'], date: 'beach', end: 'himalaya', final: 'lights' },
    'story-utsav': { name: 'Festive Utsav', note: 'Diya steps, marigolds and garba', tune: 'garba',
      open: 'diwali', title: 'marigold', invite: 'mehendi', events: ['mehendi-rani', 'marigold-royal', 'diwali'], date: 'marigold', end: 'mehendi-green', final: 'diwali' },
    'story-raag': { name: 'Raag Royale', note: 'Dawn over the lotus pond, a sitar raag', tune: 'sitar',
      open: 'lotusnight-dawn', title: 'jharokha', invite: 'temple-lamps', events: ['haveli', 'lotusnight', 'palace'], date: 'palace', end: 'jharokha-rose', final: 'temple' },
    'story-little': { name: 'Little Star', note: 'Clouds, balloons and a lullaby', tune: 'lullaby',
      open: 'clouds', title: 'party', invite: 'clouds-lavender', events: ['party', 'clouds', 'galaxy'], date: 'clouds', end: 'party', final: 'clouds' },
    'story-party': { name: 'Party Night', note: 'Disco lights, confetti and a dance floor', tune: 'festive',
      open: 'disco', title: 'party-neon', invite: 'galaxy', events: ['disco', 'lights', 'party'], date: 'lights', end: 'disco', final: 'party' },
    'story-sacred': { name: 'Sacred Blessings', note: 'Temple lamps, kalash and diyas', tune: 'calm',
      open: 'temple', title: 'temple-lamps', invite: 'haveli', events: ['temple', 'mandap', 'diwali'], date: 'haveli', end: 'temple-sandal', final: 'diwali' }
  };
  function storyLooks(S, st, key) {
    let n = 0, f = 0, prev = '';
    S.forEach(s => {
      // A film's own look for the function, else one that suits it
      const own = s.k === 'event' && ((st.fn || []).find(([re]) => re.test(s.e.name)) || [])[1];
      const byName = s.k === 'event' && (own || eventLook(s.e.name, videoNo(key), f, prev, false));
      if (s.k === 'event') f++;
      s.look = byName || ({ open: st.open, title: st.title, invite: st.invite, date: st.date, end: st.end, final: st.final })[s.k]
        || st.events[n++ % st.events.length];
      if (!LOOKS[s.look]) s.look = s.look.split('-')[0]; // a mood a scene does not have: its own first look
      prev = s.look.split('-')[0];
    });
  }

  // Every function is its own screen, and the same function looks different from video to video: each has a few
  // sceneries that suit it, and each scenery 15 moods, so a Haldi screen comes round again only after ~60 videos.
  // Video n takes the scenery n (in turn) in mood n / sceneries, so neighbouring videos never share one; two screens
  // in a row in one video never share a scenery either.
  // (A daytime function takes only the light moods, an evening one only the dark ones.)
  const EVENT_SCENES = [[/haldi|pithi|ubtan/i, ['haldi', 'vrindavan', 'clouds', 'rosegarden'], 'day'],
    [/mehe?n?d/i, ['mehendi', 'rosegarden', 'jharokha', 'blush'], 'day'],
    [/sangeet|dance|dj|garba|dandiya|cocktail/i, ['lights', 'disco', 'party', 'galaxy'], 'night'],
    [/baraat|barat|ghud|ghod|sehra/i, ['haveli', 'palace', 'marigold', 'diwali']],
    [/phera|vivah|wedding|varmala|jaimala|mandap|shaadi/i, ['mandap', 'temple', 'lotusnight', 'diwali']],
    [/reception|dinner|bhoj|swagat/i, ['palace', 'galaxy', 'lights', 'diwali'], 'night'],
    [/puja|pooja|havan|ganesh|katha|aarti/i, ['temple', 'lotusnight', 'diwali', 'himalaya']],
    [/cake|party|games/i, ['party', 'disco', 'lights', 'beach']]];
  const EVENT_SPARE = ['rosegarden', 'jharokha', 'lotusnight', 'marigold', 'vrindavan', 'himalaya', 'clouds', 'beach'];
  const moodsOf = scene => Object.keys(LOOKS).filter(id => id === scene || id.startsWith(scene + '-'));
  // A video's place among the story films and the looks (as the couples and songs are given out)
  const videoNo = key => Math.max(0, [...Object.keys(STORIES), ...Object.keys(LOOKS)].indexOf(key));
  // The look for function number `f` of video `n`, not in scenery `avoid` (a name it does not know: a spare scenery, or null)
  function eventLook(name, n, f, avoid, spare = true) {
    const [, named, when] = EVENT_SCENES.find(([re]) => re.test(name)) || [], pool = named || (spare ? EVENT_SPARE : null);
    if (!pool) return null;
    let scene = pool[(n + f * (pool === EVENT_SPARE ? 3 : 0)) % pool.length];
    // Two places on, not one: the next scenery is the neighbouring video's own
    if (scene === avoid) scene = pool[(pool.indexOf(scene) + 2) % pool.length];
    const all = moodsOf(scene), fit = all.filter(id => !when || isLight(LOOKS[id]) === (when === 'day')), moods = fit.length ? fit : all;
    return moods.length ? moods[(Math.floor(n / pool.length) * 7 + f * 4) % moods.length] : null;
  }
  function eventLooks(S, look) {
    if (!LOOKS[look] || !S.some(s => s.k === 'event')) return;
    const n = videoNo(look);
    let prev = look.split('-')[0], f = 0;
    S.forEach(s => {
      if (s.k !== 'event') { s.look = look; return; } // the look's own scenery, so a function screen fades in and out of it
      s.look = eventLook(s.e.name, n, f++, prev) || look;
      prev = s.look.split('-')[0];
    });
  }

  // Each scene has its own tune (its moods share it), so every template sounds different
  const SCENE_TUNES = { vrindavan: 'royal', jharokha: 'shehnai', lotusnight: 'sitar', marigold: 'baraat', palace: 'cinematic', blush: 'romantic',
    temple: 'santoor', haveli: 'sufi', mehendi: 'garba', party: 'festive', beach: 'calm', himalaya: 'santoor', lights: 'romantic',
    mandap: 'shehnai', galaxy: 'cinematic', haldi: 'festive', clouds: 'lullaby', disco: 'festive', diwali: 'garba', rosegarden: 'royal' };

  // The website's QR code (https://cardalbum.vercel.app/), shown at the end of every video
  const SITE_QR = ["0000000000000000000000000000000", "0111111100101011101100011111110", "0100000101001100100001010000010", "0101110101110001010010010111010", "0101110101110101101001010111010", "0101110100101011101111010111010", "0100000100011111010000010000010", "0111111101010101010101011111110", "0000000001000110000110000000000", "0100000101011101101101110011100", "0110110000100101001110001101100", "0000010100101000001001100100000", "0000000001011001110101101110000", "0100010100100111000011011000010", "0001001001111011000111011100110", "0110110101001011110100010011000", "0110101011001111010010010101010", "0000010111001101101001001011000", "0110111001001100010011011101110", "0110111100000111011111110110010", "0100010011101001110111010100000", "0100110101001000011011111101110", "0000000001101010010001000110000", "0111111100011111110111010111000", "0100000100000010000101000100100", "0101110100011110110111111110000", "0101110100101000011110100011100", "0101110100111011001011011111100", "0100000100011000100000111011010", "0111111101101100000110000101000", "0000000000000000000000000000000"];

  // ---------- Drawing helpers ----------
  function leaf(c, x, y, len, wid, ang, fill, rib = true) {
    c.save(); c.translate(x, y); c.rotate(ang);
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(len * .5, -wid, len, 0); c.quadraticCurveTo(len * .5, wid, 0, 0);
    c.fillStyle = fill; c.fill();
    if (rib) { c.strokeStyle = 'rgba(255,255,255,.14)'; c.lineWidth = Math.max(1, wid * .08); c.beginPath(); c.moveTo(len * .08, 0); c.lineTo(len * .9, 0); c.stroke(); }
    c.restore();
  }
  // A cloud of leaves; lighter towards the top-left, like light falling on a bush.
  function foliage(c, R, cx, cy, rx, ry, n, hue, light, size, sat = 45) {
    for (let i = 0; i < n; i++) {
      const a = R() * TAU, d = Math.sqrt(R()), x = cx + Math.cos(a) * rx * d, y = cy + Math.sin(a) * ry * d;
      const l = light + (R() - .5) * 12 - (y - cy) / ry * 6 - (x - cx) / rx * 3;
      leaf(c, x, y, size * (.6 + R() * .6), size * (.2 + R() * .1), R() * TAU, `hsl(${hue + (R() - .5) * 18},${sat + R() * 15}%,${l}%)`, false);
    }
  }
  function blossom(c, x, y, r, col, mid = '#fff', rot = 0, petals = 5, flat = false) {
    c.save(); c.translate(x, y); c.rotate(rot);
    for (let i = 0; i < petals; i++) {
      c.rotate(TAU / petals);
      if (flat) c.fillStyle = col;
      else { const g = c.createRadialGradient(0, -r * .2, 0, 0, -r * .5, r * .7); g.addColorStop(0, mid); g.addColorStop(1, col); c.fillStyle = g; }
      c.beginPath(); c.ellipse(0, -r * .52, r * .36, r * .55, 0, 0, TAU); c.fill();
    }
    c.beginPath(); c.arc(0, 0, r * .2, 0, TAU); c.fillStyle = '#f7cf5a'; c.fill();
    c.restore();
  }
  function lotus(c, x, y, s, open = 1) {
    c.save(); c.translate(x, y);
    const grad = l => { const g = c.createLinearGradient(0, 0, 0, -s * l); g.addColorStop(0, '#fde7ef'); g.addColorStop(.55, '#f48fb1'); g.addColorStop(1, '#d81b60'); return g; };
    const petal = (ang, len, wid) => {
      c.save(); c.rotate(ang); c.beginPath(); c.moveTo(0, 0);
      c.bezierCurveTo(wid, -len * .35, wid * .6, -len * .8, 0, -len); c.bezierCurveTo(-wid * .6, -len * .8, -wid, -len * .35, 0, 0);
      c.fillStyle = grad(len / s); c.fill(); c.strokeStyle = 'rgba(160,30,80,.25)'; c.lineWidth = Math.max(1, s * .012); c.stroke(); c.restore();
    };
    const k = .55 * open + .3;
    [-1.3, 1.3].forEach(a => petal(a * k, s * .62, s * .26));
    [-.9, .9].forEach(a => petal(a * k, s * .78, s * .28));
    [-.45, .45].forEach(a => petal(a * k, s * .9, s * .3));
    petal(0, s, s * .32);
    c.restore();
  }
  function lotusPad(c, x, y, rx, ry, rot = 0) {
    c.save(); c.translate(x, y); c.rotate(rot);
    const g = c.createRadialGradient(0, 0, 0, 0, 0, rx); g.addColorStop(0, '#5d9a52'); g.addColorStop(1, '#2f6a3a');
    c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, rx, ry, 0, .25, TAU - .05); c.lineTo(0, 0); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(200,240,170,.25)'; c.lineWidth = 2;
    for (let i = 0; i < 9; i++) { const a = .4 + i / 8 * (TAU - .6); c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * rx * .9, Math.sin(a) * ry * .9); c.stroke(); }
    c.restore();
  }
  function feather(c, x, y, len, ang, eye = len * .13) {
    c.save(); c.translate(x, y); c.rotate(ang);
    const g = c.createLinearGradient(0, 0, len, 0); g.addColorStop(0, 'rgba(120,150,60,0)'); g.addColorStop(.35, 'rgba(110,150,55,.8)'); g.addColorStop(1, 'rgba(60,110,45,.95)');
    c.fillStyle = g; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(len * .62, -len * .17, len * 1.03, 0); c.quadraticCurveTo(len * .62, len * .17, 0, 0); c.fill();
    c.strokeStyle = 'rgba(200,230,130,.35)'; c.lineWidth = Math.max(1, len * .006);
    for (let i = 2; i < 15; i++) {
      const u = i / 15 * len, h = len * .13 * Math.sin(Math.PI * i / 15);
      c.beginPath(); c.moveTo(u, 0); c.lineTo(u + len * .06, -h); c.moveTo(u, 0); c.lineTo(u + len * .06, h); c.stroke();
    }
    c.strokeStyle = '#dcc57e'; c.lineWidth = Math.max(1.4, len * .012); c.beginPath(); c.moveTo(0, 0); c.lineTo(len * .98, 0); c.stroke();
    const ex = len * .83, r = eye;
    [[1, '#a6c23f'], [.8, '#c08a2a'], [.64, '#1fa08e'], [.48, '#1d5fbf'], [.27, '#0c1f4f']].forEach(([k, col]) => {
      c.beginPath(); c.ellipse(ex, 0, r * k * 1.3, r * k, 0, 0, TAU); c.fillStyle = col; c.fill();
    });
    c.restore();
  }
  // A peacock standing at (x, y) (its feet), `s` tall, facing right (dir 1) or left (dir -1). Its train trails
  // along the ground behind it, or hangs straight down (`hang`) when it sits on a pillar.
  function peacock(c, x, y, s, dir = 1, seed = 7, hang = false) {
    const R = rng(seed);
    c.save(); c.translate(x, y); c.scale(dir, 1);
    const hx = -s * .04, hy = -s * .26, n = 30;
    const tg = c.createLinearGradient(hx, hy, hx + (hang ? 0 : -s * 1.8), hy + (hang ? s * 1.4 : s * .2));
    tg.addColorStop(0, '#1d4f2a'); tg.addColorStop(1, 'rgba(40,90,40,0)');
    c.fillStyle = tg; c.beginPath(); c.moveTo(hx, hy - s * .05);
    if (hang) { c.quadraticCurveTo(hx - s * .5, hy + s * .6, hx - s * .55, hy + s * 1.4); c.lineTo(hx + s * .2, hy + s * 1.4); }
    else { c.quadraticCurveTo(hx - s, hy - s * .12, hx - s * 1.9, hy + s * .1); c.lineTo(hx - s * 1.7, hy + s * .3); }
    c.closePath(); c.fill();
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1), a = hang ? Math.PI / 2 - .12 + u * .5 : Math.PI - .02 - u * .26;
      feather(c, hx, hy, s * (hang ? 1.05 + R() * .35 : 1.4 + R() * .5 + Math.sin(u * Math.PI) * .25), a + (R() - .5) * .05, s * (.07 + R() * .025));
    }
    c.strokeStyle = '#8a7a66'; c.lineWidth = s * .025; c.lineCap = 'round';
    c.beginPath(); c.moveTo(s * .08, -s * .2); c.lineTo(s * .06, 0); c.moveTo(s * .18, -s * .2); c.lineTo(s * .21, 0); c.stroke();
    const bg = c.createRadialGradient(s * .18, -s * .38, s * .02, s * .12, -s * .3, s * .32);
    bg.addColorStop(0, '#3a8ae6'); bg.addColorStop(.6, '#1747a6'); bg.addColorStop(1, '#0b2466');
    c.fillStyle = bg; c.beginPath(); c.ellipse(s * .12, -s * .31, s * .27, s * .16, -.3, 0, TAU); c.fill();
    c.save(); c.beginPath(); c.ellipse(s * .03, -s * .29, s * .19, s * .1, -.22, 0, TAU); c.clip();
    c.fillStyle = '#b8935c'; c.fillRect(-s * .2, -s * .45, s * .5, s * .3);
    c.strokeStyle = 'rgba(70,45,20,.55)'; c.lineWidth = s * .012;
    for (let k = -6; k < 9; k++) { c.beginPath(); c.moveTo(-s * .15 + k * s * .03, -s * .45); c.lineTo(-s * .2 + k * s * .03, -s * .15); c.stroke(); }
    c.restore();
    const ng = c.createLinearGradient(s * .2, -s * .8, s * .3, -s * .35); ng.addColorStop(0, '#1e88e5'); ng.addColorStop(1, '#0d47a1');
    c.fillStyle = ng; c.beginPath();
    c.moveTo(s * .33, -s * .38); c.bezierCurveTo(s * .42, -s * .5, s * .31, -s * .63, s * .38, -s * .76);
    c.lineTo(s * .29, -s * .8); c.bezierCurveTo(s * .21, -s * .67, s * .27, -s * .53, s * .14, -s * .43); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(130,205,255,.4)'; c.lineWidth = s * .01;
    c.beginPath(); c.moveTo(s * .35, -s * .42); c.bezierCurveTo(s * .4, -s * .53, s * .32, -s * .64, s * .37, -s * .74); c.stroke();
    c.beginPath(); c.ellipse(s * .345, -s * .8, s * .058, s * .047, -.2, 0, TAU); c.fillStyle = '#1565c0'; c.fill();
    c.fillStyle = '#9e9e8a'; c.beginPath(); c.moveTo(s * .395, -s * .815); c.lineTo(s * .465, -s * .795); c.lineTo(s * .395, -s * .78); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.ellipse(s * .355, -s * .807, s * .024, s * .009, -.2, 0, TAU); c.fill();
    c.fillStyle = '#111'; c.beginPath(); c.arc(s * .36, -s * .806, s * .008, 0, TAU); c.fill();
    c.strokeStyle = '#3a5f2a'; c.lineWidth = s * .006;
    for (let k = 0; k < 5; k++) {
      const ex = s * (.3 + k * .02), ey = -s * (.93 + Math.sin(k / 4 * Math.PI) * .03);
      c.beginPath(); c.moveTo(s * .335, -s * .84); c.lineTo(ex, ey); c.stroke();
      c.beginPath(); c.arc(ex, ey, s * .012, 0, TAU); c.fillStyle = '#1e88e5'; c.fill();
    }
    c.restore();
  }
  function stoneGrad(c, x0, x1, tone, shade) {
    const g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, shade); g.addColorStop(.45, tone); g.addColorStop(1, shade); return g;
  }
  function chhatri(c, x, y, s, tone = '#efe2c4', shade = '#c9b48a') {
    c.save(); c.translate(x, y);
    const block = (x0, y0, w, h) => { c.fillStyle = stoneGrad(c, x0, x0 + w, tone, shade); c.fillRect(x0, y0, w, h); };
    block(-s * .5, -s * .08, s, s * .08);
    block(-s * .44, -s * .13, s * .88, s * .05);
    for (const px of [-.38, -.13, .13, .38]) block(px * s - s * .03, -s * .6, s * .06, s * .47);
    c.fillStyle = 'rgba(70,55,30,.2)';
    for (const [a, b] of [[-.35, -.16], [-.1, .1], [.16, .35]]) {
      c.beginPath(); c.moveTo(a * s, -s * .13); c.lineTo(a * s, -s * .45); c.quadraticCurveTo((a + b) / 2 * s, -s * .6, b * s, -s * .45); c.lineTo(b * s, -s * .13); c.fill();
    }
    block(-s * .46, -s * .68, s * .92, s * .08);
    c.fillStyle = shade; c.beginPath(); c.moveTo(-s * .54, -s * .68); c.lineTo(s * .54, -s * .68); c.lineTo(s * .46, -s * .61); c.lineTo(-s * .46, -s * .61); c.fill();
    const g = c.createRadialGradient(-s * .12, -s * .95, s * .02, 0, -s * .8, s * .45); g.addColorStop(0, '#fffaf0'); g.addColorStop(1, shade);
    c.fillStyle = g; c.beginPath(); c.moveTo(-s * .37, -s * .68);
    c.bezierCurveTo(-s * .4, -s * .95, -s * .1, -s * 1.02, 0, -s * 1.12); c.bezierCurveTo(s * .1, -s * 1.02, s * .4, -s * .95, s * .37, -s * .68); c.fill();
    c.fillStyle = '#c9a24a'; c.fillRect(-s * .012, -s * 1.24, s * .024, s * .13); c.beginPath(); c.arc(0, -s * 1.16, s * .03, 0, TAU); c.fill();
    c.restore();
  }
  function rabbit(c, x, y, s, dir = 1) {
    c.save(); c.translate(x, y); c.scale(dir, 1);
    c.fillStyle = 'rgba(30,40,10,.18)'; c.beginPath(); c.ellipse(0, 0, s * .55, s * .08, 0, 0, TAU); c.fill();
    const g = c.createRadialGradient(-s * .1, -s * .4, s * .05, 0, -s * .25, s * .55); g.addColorStop(0, '#fff'); g.addColorStop(1, '#d9d2c6');
    c.fillStyle = g;
    c.beginPath(); c.ellipse(-s * .05, -s * .25, s * .38, s * .27, 0, 0, TAU); c.fill();
    c.beginPath(); c.ellipse(s * .3, -s * .48, s * .17, s * .15, 0, 0, TAU); c.fill();
    for (const [ex, a] of [[.24, -.3], [.36, .05]]) {
      c.save(); c.translate(s * ex, -s * .6); c.rotate(a);
      c.fillStyle = g; c.beginPath(); c.ellipse(0, -s * .18, s * .055, s * .2, 0, 0, TAU); c.fill();
      c.fillStyle = '#f3c1c8'; c.beginPath(); c.ellipse(0, -s * .18, s * .025, s * .14, 0, 0, TAU); c.fill();
      c.restore();
    }
    c.fillStyle = '#3a2a2a'; c.beginPath(); c.arc(s * .38, -s * .5, s * .022, 0, TAU); c.fill();
    c.fillStyle = '#f3a7b5'; c.beginPath(); c.arc(s * .46, -s * .45, s * .02, 0, TAU); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(-s * .42, -s * .26, s * .08, 0, TAU); c.fill();
    c.restore();
  }
  function butterfly(c, x, y, s, flap, col) {
    c.save(); c.translate(x, y);
    for (const d of [-1, 1]) {
      c.save(); c.scale(d * Math.max(.15, Math.abs(Math.cos(flap))), 1); c.fillStyle = col;
      c.beginPath(); c.ellipse(s * .5, -s * .3, s * .5, s * .36, -.4, 0, TAU); c.fill();
      c.beginPath(); c.ellipse(s * .38, s * .24, s * .3, s * .24, .5, 0, TAU); c.fill();
      c.restore();
    }
    c.fillStyle = '#3a2a2a'; c.fillRect(-s * .04, -s * .4, s * .08, s * .8);
    c.restore();
  }
  function bell(c, x, y, s) {
    const g = c.createLinearGradient(x - s * .5, 0, x + s * .5, 0); g.addColorStop(0, '#8a5a12'); g.addColorStop(.45, '#f6d77d'); g.addColorStop(1, '#9a6a1a');
    c.fillStyle = g; c.beginPath(); c.moveTo(x - s * .22, y);
    c.quadraticCurveTo(x - s * .45, y + s * .2, x - s * .5, y + s * .85); c.lineTo(x + s * .5, y + s * .85); c.quadraticCurveTo(x + s * .45, y + s * .2, x + s * .22, y); c.closePath(); c.fill();
    c.beginPath(); c.arc(x, y + s * .95, s * .12, 0, TAU); c.fill();
  }
  function diya(c, x, y, s, t = 0) {
    const fl = 1 + Math.sin(t * 9 + x) * .06 + Math.sin(t * 13.7 + y) * .04;
    const g = c.createRadialGradient(x, y - s * .5, 0, x, y - s * .5, s * 1.7 * fl);
    g.addColorStop(0, 'rgba(255,190,90,.5)'); g.addColorStop(1, 'rgba(255,150,50,0)');
    c.fillStyle = g; c.beginPath(); c.arc(x, y - s * .5, s * 1.7 * fl, 0, TAU); c.fill();
    const b = c.createLinearGradient(x, y - s * .2, x, y + s * .3); b.addColorStop(0, '#e39a52'); b.addColorStop(1, '#7a3a12');
    c.fillStyle = b; c.beginPath(); c.ellipse(x, y - s * .14, s * .62, s * .4, 0, 0, Math.PI); c.fill();
    c.fillStyle = '#f3b26b'; c.beginPath(); c.ellipse(x, y - s * .14, s * .62, s * .09, 0, 0, TAU); c.fill();
    c.save(); c.translate(x, y - s * .2); c.scale(1 / fl, fl);
    const f = c.createLinearGradient(0, -s * .8, 0, 0); f.addColorStop(0, '#fff6d0'); f.addColorStop(.4, '#ffd060'); f.addColorStop(1, '#ff7a1a');
    c.fillStyle = f; c.beginPath(); c.moveTo(0, -s * .8); c.quadraticCurveTo(s * .24, -s * .25, 0, 0); c.quadraticCurveTo(-s * .24, -s * .25, 0, -s * .8); c.fill();
    c.restore();
  }
  function marigold(c, x, y, r, hue) {
    const g = c.createRadialGradient(x - r * .3, y - r * .3, r * .1, x, y, r);
    g.addColorStop(0, `hsl(${hue},100%,72%)`); g.addColorStop(.7, `hsl(${hue},100%,52%)`); g.addColorStop(1, `hsl(${hue - 8},95%,34%)`);
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    c.strokeStyle = `hsla(${hue - 12},90%,28%,.45)`; c.lineWidth = Math.max(1, r * .07);
    for (let i = 0; i < 7; i++) { const a = i / 7 * TAU; c.beginPath(); c.arc(x + Math.cos(a) * r * .45, y + Math.sin(a) * r * .45, r * .36, a + 2, a + 4.2); c.stroke(); }
  }
  function mandala(c, x, y, r, col, rot = 0) {
    c.save(); c.translate(x, y); c.rotate(rot); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = Math.max(1.2, r * .006);
    for (const [rr, n, pl] of [[.3, 10, .22], [.52, 16, .2], [.74, 24, .18], [.94, 32, .1]]) {
      const b = rr * r * .82;
      c.beginPath(); c.arc(0, 0, b, 0, TAU); c.stroke();
      for (let i = 0; i < n; i++) {
        c.save(); c.rotate(i / n * TAU); c.beginPath(); c.moveTo(0, -b);
        c.quadraticCurveTo(rr * r * pl * .6, -b - rr * r * pl / 2, 0, -b - rr * r * pl); c.quadraticCurveTo(-rr * r * pl * .6, -b - rr * r * pl / 2, 0, -b); c.stroke(); c.restore();
      }
    }
    c.restore();
  }
  function rangoli(c, x, y, r) {
    c.save(); c.translate(x, y);
    [[1, 16, '#e91e63'], [.82, 16, '#ff9800'], [.64, 12, '#ffd54f'], [.46, 12, '#43a047'], [.3, 8, '#29b6f6']].forEach(([k, n, col], j) => {
      for (let i = 0; i < n; i++) {
        c.save(); c.rotate(i / n * TAU + j * .2); c.beginPath(); c.moveTo(0, -r * k * .4);
        c.quadraticCurveTo(r * k * .24, -r * k * .75, 0, -r * k); c.quadraticCurveTo(-r * k * .24, -r * k * .75, 0, -r * k * .4); c.fillStyle = col; c.fill(); c.restore();
      }
    });
    c.fillStyle = '#fff';
    for (let i = 0; i < 28; i++) { const a = i / 28 * TAU; c.beginPath(); c.arc(Math.cos(a) * r * 1.06, Math.sin(a) * r * 1.06, r * .025, 0, TAU); c.fill(); }
    c.beginPath(); c.arc(0, 0, r * .14, 0, TAU); c.fillStyle = '#ffeb3b'; c.fill();
    c.restore();
  }
  function rose(c, x, y, r, light, dark, rot = 0) {
    c.save(); c.translate(x, y); c.rotate(rot);
    for (let ring = 0; ring < 4; ring++) {
      const k = 1 - ring * .22, n = 6 - ring % 2;
      for (let i = 0; i < n; i++) {
        c.save(); c.rotate(i / n * TAU + ring * .5);
        const g = c.createRadialGradient(0, -r * k * .55, 0, 0, -r * k * .3, r * k * .6); g.addColorStop(0, light); g.addColorStop(1, dark);
        c.fillStyle = g; c.beginPath(); c.ellipse(0, -r * k * .42, r * k * .42, r * k * .5, 0, 0, TAU); c.fill();
        c.strokeStyle = 'rgba(120,40,70,.12)'; c.lineWidth = 1.5; c.stroke();
        c.restore();
      }
    }
    c.strokeStyle = 'rgba(120,40,70,.3)'; c.lineWidth = r * .025; c.beginPath();
    for (let a = 0; a < 12; a += .2) { const rr = r * .02 * a; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    c.stroke(); c.restore();
  }
  function eucalyptus(c, x, y, len, ang, col = '#9fb8a2') {
    c.save(); c.translate(x, y); c.rotate(ang);
    c.strokeStyle = '#7d8f6e'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(len * .5, -len * .08, len, 0); c.stroke();
    for (let i = 1; i < 8; i++) {
      const u = i / 8 * len, r = 22 - i * 1.6;
      for (const d of [-1, 1]) { c.fillStyle = i % 2 ? col : '#b6c9b4'; c.beginPath(); c.ellipse(u, d * r * .9 - len * .04 * Math.sin(i / 8 * Math.PI), r, r * .8, 0, 0, TAU); c.fill(); }
    }
    c.restore();
  }
  function rrect(c, x, y, w, h, r) {
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  // Points along a pointed (Mughal) arch from (l, spring) over the apex to (r, spring), evenly spaced.
  function archPts(l, r, spring, apex, n) {
    const cx = (l + r) / 2, hw = (r - l) / 2, dense = [], len = [0];
    for (let i = 0; i <= 240; i++) { const u = i / 120 - 1; dense.push([cx + u * hw, spring - (spring - apex) * Math.pow(1 - Math.abs(u), .55)]); }
    for (let i = 1; i < dense.length; i++) len.push(len[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]));
    const out = [];
    for (let k = 0, j = 0; k <= n; k++) {
      const goal = len[len.length - 1] * k / n;
      while (j < len.length - 2 && len[j + 1] < goal) j++;
      const f = (goal - len[j]) / ((len[j + 1] - len[j]) || 1);
      out.push([dense[j][0] + (dense[j + 1][0] - dense[j][0]) * f, dense[j][1] + (dense[j + 1][1] - dense[j][1]) * f]);
    }
    return out;
  }
  // The arch opening as a path: scalloped (multifoil) when `lobes` is given.
  function archPath(c, l, r, spring, apex, bottom, lobes) {
    const P = archPts(l, r, spring, apex, lobes || 80), cx = (l + r) / 2;
    c.moveTo(l, bottom); c.lineTo(l, spring);
    for (let i = 1; i < P.length; i++) {
      if (!lobes) { c.lineTo(P[i][0], P[i][1]); continue; }
      const [x0, y0] = P[i - 1], [x1, y1] = P[i], mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
      const nx = mx - cx, ny = my - spring, nl = Math.hypot(nx, ny) || 1, seg = Math.hypot(x1 - x0, y1 - y0);
      c.quadraticCurveTo(mx + nx / nl * seg * .5, my + ny / nl * seg * .5, x1, y1);
    }
    c.lineTo(r, bottom); c.closePath();
  }
  function sky(c, stops, y0 = 0, y1 = H) {
    const g = c.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, col]) => g.addColorStop(o, col)); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0);
  }
  function glow(c, x, y, r, col) {
    const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, col.replace(/[\d.]+\)$/, '0)'));
    c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // A garland hanging from the top, swaying.
  function vine(c, x, y, len, sway, col, i0 = 0) {
    const pts = [];
    for (let i = 0; i <= 12; i++) { const u = i / 12; pts.push([x + Math.sin(u * 2.4 + i0) * 12 + sway * u * u * len * .14, y + u * len]); }
    c.strokeStyle = '#4d6b2f'; c.lineWidth = 3; c.beginPath(); pts.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.stroke();
    pts.forEach(([px, py], i) => {
      if (!i) return;
      leaf(c, px, py, 30, 10, (i % 2 ? .7 : -.7) + Math.PI / 2 + sway * .2, i % 3 ? '#5f8a3a' : '#7aa04a', false);
      if (i % 3 === 0 || i === 12) blossom(c, px, py, i === 12 ? 22 : 16, col, '#fff', i + i0, 5, true);
    });
  }

  // ---------- Moving things (stateless: the frame at any time t is the same, so the preview can jump) ----------
  function petals(c, t, n, cols, seed, size = 1) {
    const R = rng(seed);
    for (let i = 0; i < n; i++) {
      const x0 = R() * W, y0 = R() * H, sp = 50 + R() * 70, sz = (9 + R() * 12) * size, ph = R() * TAU, rs = (R() - .5) * 2;
      const y = ((y0 + t * sp) % (H + 120)) - 60, x = x0 + Math.sin(t * .8 + ph) * 46;
      c.save(); c.translate(x, y); c.rotate(ph + t * rs); c.scale(1, Math.abs(Math.cos(t * 1.4 + ph)) * .6 + .4);
      c.fillStyle = cols[i % cols.length]; c.globalAlpha = .88;
      c.beginPath(); c.moveTo(0, -sz); c.quadraticCurveTo(sz * .9, 0, 0, sz * .7); c.quadraticCurveTo(-sz * .9, 0, 0, -sz); c.fill();
      c.restore();
    }
  }
  function motes(c, t, n, col, seed, rise = 12) {
    const R = rng(seed);
    for (let i = 0; i < n; i++) {
      const x = R() * W + Math.sin(t * .4 + i) * 30, y = ((R() * H - t * rise * (.5 + R())) % H + H) % H, r = 3 + R() * 6;
      const a = .35 + .65 * Math.abs(Math.sin(t * (.8 + R()) + i));
      glow(c, x, y, r * 4, col.replace('A', (a * .6).toFixed(2)));
    }
  }
  function sparks(c, t, n, col, seed) {
    const R = rng(seed);
    for (let i = 0; i < n; i++) {
      const x = R() * W, y = R() * H, s = 6 + R() * 12, a = Math.max(0, Math.sin(t * (1 + R() * 1.5) + R() * TAU));
      if (a < .05) continue;
      c.save(); c.translate(x, y); c.globalAlpha = a; c.fillStyle = col; c.beginPath();
      c.moveTo(0, -s); c.quadraticCurveTo(0, 0, s, 0); c.quadraticCurveTo(0, 0, 0, s); c.quadraticCurveTo(0, 0, -s, 0); c.quadraticCurveTo(0, 0, 0, -s); c.fill();
      c.restore();
    }
  }

  // ---------- More drawing helpers (temple, haveli, mehendi, party) ----------
  function flame(c, x, y, h, t, seed = 0) {
    const fl = 1 + Math.sin(t * 9 + seed) * .07 + Math.sin(t * 13.3 + seed * 2) * .05;
    glow(c, x, y - h * .5, h * 2.2 * fl, 'rgba(255,180,80,.45)');
    c.save(); c.translate(x, y); c.scale(1 / fl, fl);
    const f = c.createLinearGradient(0, -h, 0, 0); f.addColorStop(0, '#fff6d0'); f.addColorStop(.4, '#ffd060'); f.addColorStop(1, '#ff7a1a');
    c.fillStyle = f; c.beginPath(); c.moveTo(0, -h); c.quadraticCurveTo(h * .32, -h * .3, 0, 0); c.quadraticCurveTo(-h * .32, -h * .3, 0, -h); c.fill();
    c.restore();
  }
  const brass = (c, x0, x1) => { const g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, '#7a4c10'); g.addColorStop(.38, '#f5d47c'); g.addColorStop(.62, '#c48a2a'); g.addColorStop(1, '#6e440c'); return g; };
  function gopuram(c, x, y, w, tone, shade) {
    let tw = w, ty = y;
    const th = 74;
    for (let i = 0; i < 7; i++) {
      const nw = tw * .86;
      c.fillStyle = stoneGrad(c, x - tw / 2, x + tw / 2, tone, shade);
      c.beginPath(); c.moveTo(x - tw / 2, ty); c.lineTo(x + tw / 2, ty); c.lineTo(x + nw / 2, ty - th); c.lineTo(x - nw / 2, ty - th); c.fill();
      c.fillStyle = shade; c.fillRect(x - tw / 2 - 6, ty - 8, tw + 12, 8);
      c.fillStyle = 'rgba(80,40,10,.28)';
      const n = Math.max(2, Math.round(nw / 70));
      for (let k = 0; k < n; k++) {
        const nx = x - nw / 2 + (k + .5) * nw / n;
        c.beginPath(); c.moveTo(nx - 10, ty - 12); c.lineTo(nx - 10, ty - th + 30); c.quadraticCurveTo(nx, ty - th + 14, nx + 10, ty - th + 30); c.lineTo(nx + 10, ty - 12); c.fill();
      }
      tw = nw; ty -= th;
    }
    c.fillStyle = stoneGrad(c, x - tw / 2, x + tw / 2, tone, shade);
    c.beginPath(); c.moveTo(x - tw / 2 - 20, ty); c.quadraticCurveTo(x - tw / 2 - 20, ty - 70, x, ty - 80); c.quadraticCurveTo(x + tw / 2 + 20, ty - 70, x + tw / 2 + 20, ty); c.fill();
    for (let k = 0; k < 5; k++) {
      const kx = x - tw / 2 + k * tw / 4, ky = ty - 70 - (k === 2 ? 12 : 0);
      c.fillStyle = '#d4a63a'; c.beginPath(); c.ellipse(kx, ky, 9, 14, 0, 0, TAU); c.fill(); c.fillRect(kx - 2, ky - 30, 4, 20);
    }
  }
  function banana(c, x, y, s, dir, R) {
    c.save(); c.translate(x, y); c.scale(dir, 1);
    const tg = c.createLinearGradient(-s * .06, 0, s * .06, 0); tg.addColorStop(0, '#4f6b22'); tg.addColorStop(1, '#8aab40');
    c.fillStyle = tg; c.beginPath(); c.moveTo(-s * .06, 0); c.lineTo(s * .06, 0); c.lineTo(s * .035, -s * .9); c.lineTo(-s * .035, -s * .9); c.fill();
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI / 2 + (i - 3) * .42 + (R() - .5) * .1, len = s * (.7 + R() * .25);
      c.save(); c.translate(0, -s * .88); c.rotate(a);
      const g = c.createLinearGradient(0, -len * .15, 0, len * .15); g.addColorStop(0, '#3a7a2a'); g.addColorStop(1, '#74b23e');
      c.fillStyle = g; c.beginPath(); c.moveTo(0, 0);
      c.quadraticCurveTo(len * .5, -len * .24, len, len * .14); c.quadraticCurveTo(len * .5, len * .1, 0, 0); c.fill();
      c.strokeStyle = 'rgba(230,245,190,.55)'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(len * .5, -len * .07, len, len * .14); c.stroke();
      c.strokeStyle = 'rgba(230,245,190,.3)'; c.lineWidth = 1.5;
      for (let k = 1; k < 9; k++) { const u = k / 9; c.beginPath(); c.moveTo(len * u, -len * .03 + len * .1 * u * u); c.lineTo(len * u + 6, -len * .17 * Math.sin(u * Math.PI)); c.stroke(); }
      c.restore();
    }
    c.restore();
  }
  // A string of jasmine buds (with an orange kanakambaram every few), swaying.
  function jasmine(c, x, y, len, sway) {
    const pts = [];
    for (let i = 0; i <= 14; i++) { const u = i / 14; pts.push([x + sway * u * u * len * .12, y + u * len]); }
    c.strokeStyle = 'rgba(90,110,60,.6)'; c.lineWidth = 1.5; c.beginPath(); pts.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.stroke();
    pts.forEach(([px, py], i) => {
      if (!i) return;
      c.fillStyle = i % 4 === 0 ? '#ff8c3a' : '#fffaf0'; c.beginPath(); c.ellipse(px, py, 7, 9, 0, 0, TAU); c.fill();
      c.fillStyle = 'rgba(200,190,160,.6)'; c.beginPath(); c.arc(px, py + 4, 3, 0, TAU); c.fill();
    });
    const [ex, ey] = pts[14];
    blossom(c, ex, ey + 14, 14, '#ff6b3a', '#ffd0a8', 0, 5, true);
  }
  function lampBody(c, x, y, s) {
    c.fillStyle = brass(c, x - s * .32, x + s * .32);
    c.beginPath(); c.ellipse(x, y, s * .32, s * .07, 0, 0, TAU); c.fill();
    c.beginPath(); c.moveTo(x - s * .22, y - s * .02); c.quadraticCurveTo(x, y - s * .22, x - s * .04, y - s * .3); c.lineTo(x + s * .04, y - s * .3); c.quadraticCurveTo(x, y - s * .22, x + s * .22, y - s * .02); c.fill();
    c.fillStyle = brass(c, x - s * .05, x + s * .05); c.fillRect(x - s * .035, y - s * .86, s * .07, s * .56);
    c.fillStyle = brass(c, x - s * .32, x + s * .32);
    for (const k of [.45, .62, .8]) { c.beginPath(); c.ellipse(x, y - s * k, s * .075, s * .03, 0, 0, TAU); c.fill(); }
    c.beginPath(); c.ellipse(x, y - s * .88, s * .3, s * .07, 0, 0, Math.PI); c.fill();
    c.beginPath(); c.ellipse(x, y - s * .88, s * .3, s * .045, 0, 0, TAU); c.fill();
    c.fillRect(x - s * .02, y - s * 1.1, s * .04, s * .22);
    c.beginPath(); c.ellipse(x, y - s * 1.14, s * .05, s * .07, 0, 0, TAU); c.fill();
  }
  const lampFlames = (c, x, y, s, t) => [-.26, -.13, 0, .13, .26].forEach((dx, i) => flame(c, x + dx * s, y - s * .9, s * .13, t, x + i * 1.7));
  function kalash(c, x, y, s) {
    for (let i = 0; i < 7; i++) leaf(c, x, y - s * .74, s * .46, s * .1, -Math.PI / 2 + (i - 3) * .38, i % 2 ? '#2e7d32' : '#43a047');
    const g = c.createRadialGradient(x - s * .15, y - s * .45, s * .05, x, y - s * .35, s * .45);
    g.addColorStop(0, '#ffe9a8'); g.addColorStop(.5, '#d9a23a'); g.addColorStop(1, '#8a5a12');
    c.fillStyle = g; c.beginPath(); c.ellipse(x, y - s * .33, s * .36, s * .32, 0, 0, TAU); c.fill();
    c.fillRect(x - s * .15, y - s * .72, s * .3, s * .12);
    c.beginPath(); c.ellipse(x, y - s * .72, s * .22, s * .05, 0, 0, TAU); c.fill();
    const cg = c.createRadialGradient(x - s * .06, y - s * .98, s * .02, x, y - s * .92, s * .2); cg.addColorStop(0, '#c58a4a'); cg.addColorStop(1, '#6b3e18');
    c.fillStyle = cg; c.beginPath(); c.ellipse(x, y - s * .92, s * .17, s * .2, 0, 0, TAU); c.fill();
    c.strokeStyle = '#b71c1c'; c.lineWidth = s * .03; c.beginPath(); c.moveTo(x - s * .32, y - s * .4); c.quadraticCurveTo(x, y - s * .3, x + s * .32, y - s * .4); c.stroke();
    c.fillStyle = '#d32f2f'; c.beginPath(); c.arc(x, y - s * .52, s * .04, 0, TAU); c.fill();
  }
  function kandil(c, x, y, s) {
    c.strokeStyle = '#b8862b'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + s * .2); c.stroke();
    glow(c, x, y + s * .64, s * .95, 'rgba(255,190,90,.45)');
    c.fillStyle = brass(c, x - s * .2, x + s * .2);
    c.beginPath(); c.moveTo(x - s * .2, y + s * .33); c.quadraticCurveTo(x, y + s * .1, x + s * .2, y + s * .33); c.fill();
    const lg = c.createLinearGradient(0, y + s * .33, 0, y + s * .95); lg.addColorStop(0, '#ffe6a8'); lg.addColorStop(1, '#ff9a3c');
    c.fillStyle = lg; c.beginPath(); c.moveTo(x - s * .2, y + s * .33); c.lineTo(x + s * .2, y + s * .33); c.lineTo(x + s * .26, y + s * .6);
    c.lineTo(x + s * .16, y + s * .95); c.lineTo(x - s * .16, y + s * .95); c.lineTo(x - s * .26, y + s * .6); c.closePath(); c.fill();
    c.strokeStyle = '#8a5a12'; c.lineWidth = 3; c.stroke();
    c.beginPath(); c.moveTo(x, y + s * .33); c.lineTo(x, y + s * .95); c.moveTo(x - s * .26, y + s * .6); c.lineTo(x + s * .26, y + s * .6); c.stroke();
    c.fillStyle = brass(c, x - s * .16, x + s * .16); c.beginPath(); c.moveTo(x - s * .16, y + s * .95); c.lineTo(x + s * .16, y + s * .95); c.lineTo(x, y + s * 1.1); c.fill();
    c.strokeStyle = '#c0392b'; c.lineWidth = 3;
    for (const dx of [-5, 0, 5]) { c.beginPath(); c.moveTo(x, y + s * 1.1); c.lineTo(x + dx, y + s * 1.3); c.stroke(); }
  }
  function paisley(c, x, y, s, rot, col) {
    c.save(); c.translate(x, y); c.rotate(rot); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = Math.max(1.5, s * .022);
    for (const k of [1, .74, .5]) {
      c.beginPath(); c.moveTo(0, s * .5 * k);
      c.bezierCurveTo(-s * .58 * k, s * .48 * k, -s * .52 * k, -s * .32 * k, 0, -s * .36 * k);
      c.bezierCurveTo(s * .42 * k, -s * .42 * k, s * .4 * k, -s * .82 * k, s * .14 * k, -s * k);
      c.bezierCurveTo(s * .9 * k, -s * .72 * k, s * .62 * k, s * .52 * k, 0, s * .5 * k); c.stroke();
    }
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; c.beginPath(); c.arc(Math.cos(a) * s * .62, s * .05 + Math.sin(a) * s * .62, s * .025, 0, TAU); c.fill(); }
    c.beginPath(); c.arc(0, s * .08, s * .09, 0, TAU); c.fill();
    c.restore();
  }
  // A henna mandala: petal rings, dotted rings and a lace of scallops.
  function henna(c, x, y, r, col) {
    mandala(c, x, y, r, col);
    c.save(); c.translate(x, y); c.fillStyle = col; c.strokeStyle = col; c.lineWidth = Math.max(1.2, r * .004);
    for (const [k, n] of [[.18, 18], [.4, 30], [.62, 44], [.84, 60], [1.02, 72]]) {
      for (let i = 0; i < n; i++) { const a = i / n * TAU; c.beginPath(); c.arc(Math.cos(a) * r * k, Math.sin(a) * r * k, r * .008, 0, TAU); c.fill(); }
    }
    for (let i = 0; i < 36; i++) { const a = i / 36 * TAU; c.beginPath(); c.arc(Math.cos(a) * r * 1.1, Math.sin(a) * r * 1.1, r * .06, a + Math.PI / 2, a + Math.PI * 1.5, true); c.stroke(); }
    c.restore();
  }
  function hennaBorder(c, y, col, flip) {
    c.save(); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 2.5;
    c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke();
    for (let x = 0; x < W + 40; x += 44) {
      c.beginPath(); c.arc(x, y, 22, flip ? Math.PI : 0, flip ? TAU : Math.PI); c.stroke();
      c.beginPath(); c.arc(x, y + (flip ? -12 : 12), 4, 0, TAU); c.fill();
      c.beginPath(); c.arc(x + 22, y + (flip ? -34 : 34), 3, 0, TAU); c.fill();
    }
    c.restore();
  }
  function bunting(c, x0, x1, y, sag, cols) {
    const n = Math.round((x1 - x0) / 66), pt = u => [x0 + (x1 - x0) * u, y + Math.sin(u * Math.PI) * sag];
    c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 2;
    c.beginPath(); for (let i = 0; i <= 40; i++) { const [px, py] = pt(i / 40); i ? c.lineTo(px, py) : c.moveTo(px, py); } c.stroke();
    for (let i = 0; i < n; i++) {
      const [ax, ay] = pt((i + .1) / n), [bx, by] = pt((i + .9) / n);
      c.fillStyle = cols[i % cols.length]; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.lineTo((ax + bx) / 2, (ay + by) / 2 + 74); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.arc((ax + bx) / 2, (ay + by) / 2 + 26, 7, 0, TAU); c.fill();
    }
  }
  function balloon(c, x, y, r, col, sway) {
    c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y + r * 1.2);
    for (let k = 1; k <= 9; k++) c.lineTo(x + Math.sin(k * .9 + sway) * 8, y + r * 1.2 + k * r * .36);
    c.stroke();
    c.fillStyle = col; c.beginPath(); c.ellipse(x, y, r, r * 1.18, 0, 0, TAU); c.fill();
    const g = c.createRadialGradient(x - r * .35, y - r * .45, r * .05, x, y, r * 1.2);
    g.addColorStop(0, 'rgba(255,255,255,.8)'); g.addColorStop(.3, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,.28)');
    c.fillStyle = g; c.beginPath(); c.ellipse(x, y, r, r * 1.18, 0, 0, TAU); c.fill();
    c.fillStyle = col; c.beginPath(); c.moveTo(x, y + r * 1.15); c.lineTo(x + 9, y + r * 1.3); c.lineTo(x - 9, y + r * 1.3); c.fill();
  }
  function cake(c, x, y, s, m, R) {
    c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.ellipse(x, y, s * .62, s * .08, 0, 0, TAU); c.fill();
    let ty = y;
    [[.5, .32, m.cake1], [.38, .28, m.cake2], [.26, .24, m.cake1]].forEach(([w, h, col]) => {
      const tw = s * w, th = s * h;
      c.fillStyle = col; c.fillRect(x - tw, ty - th, tw * 2, th); c.beginPath(); c.ellipse(x, ty, tw, s * .05, 0, 0, Math.PI); c.fill();
      c.fillStyle = m.icing; c.beginPath(); c.moveTo(x - tw, ty - th);
      for (let k = 0; k <= 12; k++) c.lineTo(x - tw + k * tw / 6, ty - th + (k % 2 ? s * .08 : s * .035));
      c.lineTo(x + tw, ty - th); c.closePath(); c.fill();
      c.beginPath(); c.ellipse(x, ty - th, tw, s * .05, 0, 0, TAU); c.fill();
      for (let k = 0; k < 14; k++) {
        c.fillStyle = ['#ffd166', '#06d6a0', '#118ab2', '#ef476f', '#fff'][k % 5];
        c.save(); c.translate(x - tw * .85 + R() * tw * 1.7, ty - th * .45 + R() * th * .35); c.rotate(R() * 3); c.fillRect(-5, -1.5, 10, 3); c.restore();
      }
      ty -= th;
    });
    return ty;
  }
  function giftBox(c, x, y, w, h, col, rib) {
    c.fillStyle = col; c.fillRect(x - w / 2, y - h, w, h);
    c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(x - w / 2, y - h, w * .12, h);
    c.fillStyle = col; c.fillRect(x - w * .56, y - h - h * .18, w * 1.12, h * .2);
    c.fillStyle = rib; c.fillRect(x - w * .07, y - h - h * .18, w * .14, h * 1.18); c.fillRect(x - w / 2, y - h * .62, w, h * .12);
    for (const d of [-1, 1]) { c.beginPath(); c.ellipse(x + d * w * .16, y - h - h * .26, w * .17, h * .1, d * .5, 0, TAU); c.fill(); }
  }
  function confetti(c, t, n, cols, seed) {
    const R = rng(seed);
    for (let i = 0; i < n; i++) {
      const x0 = R() * W, y0 = R() * H, sp = 90 + R() * 90, ph = R() * TAU, sz = 8 + R() * 8;
      const y = ((y0 + t * sp) % (H + 80)) - 40, x = x0 + Math.sin(t * 1.3 + ph) * 30;
      c.save(); c.translate(x, y); c.rotate(ph + t * 3); c.scale(1, Math.cos(t * 4 + ph));
      c.fillStyle = cols[i % cols.length]; c.fillRect(-sz / 2, -sz / 4, sz, sz / 2); c.restore();
    }
  }

  // ---------- Drawing helpers for the second ten scenes ----------
  function palm(c, x, y, h, lean, R) {
    const at = u => [x + lean * h * .35 * u * u, y - h * u];
    c.lineCap = 'round';
    for (let i = 0; i < 18; i++) {
      const [ax, ay] = at(i / 18), [bx, by] = at((i + 1) / 18);
      c.lineWidth = 26 - i / 18 * 12; c.strokeStyle = i % 2 ? '#8a6a44' : '#6e5232';
      c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
    }
    const [tx, ty] = at(1);
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI / 2 + (i - 4) * .4 + (R() - .5) * .1, len = h * (.48 + R() * .15);
      c.save(); c.translate(tx, ty); c.rotate(a);
      c.strokeStyle = '#2f6b2a'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(len * .5, -len * .18, len, len * .25); c.stroke();
      for (let k = 2; k < 16; k++) {
        const u = k / 16, px = len * u, py = -len * .18 * Math.sin(u * Math.PI) + len * .25 * u * u;
        for (const d of [-1, 1]) leaf(c, px, py, len * .24 * (1 - u * .5), len * .03, d * (1.2 - u * .3) + .35, k % 2 ? '#3f8a35' : '#2e6f2a', false);
      }
      c.restore();
    }
  }
  function gull(c, x, y, s, flap) {
    c.strokeStyle = 'rgba(60,45,60,.75)'; c.lineWidth = 3.5; c.lineCap = 'round';
    const f = Math.sin(flap) * s * .35;
    c.beginPath(); c.moveTo(x - s, y + f * .4); c.quadraticCurveTo(x - s * .5, y - s * .5 - f, x, y); c.quadraticCurveTo(x + s * .5, y - s * .5 - f, x + s, y + f * .4); c.stroke();
  }
  function range(c, R, y, h, n, col, snow) {
    const pts = [];
    c.fillStyle = col; c.beginPath(); c.moveTo(0, H); c.lineTo(0, y);
    for (let i = 0; i <= n; i++) { const px = i / n * W, py = y - (i % 2 ? h * (.6 + R() * .4) : h * R() * .2); pts.push([px, py]); c.lineTo(px, py); }
    c.lineTo(W, H); c.closePath(); c.fill();
    if (!snow) return;
    c.fillStyle = snow;
    pts.forEach(([px, py], i) => {
      if (i % 2 === 0 || !pts[i + 1]) return;
      const [lx, ly] = pts[i - 1], [rx, ry] = pts[i + 1], k = .3;
      c.beginPath(); c.moveTo(px, py); c.lineTo(px + (lx - px) * k, py + (ly - py) * k);
      c.lineTo(px + (lx - px) * k * .45, py + (ly - py) * k * .75); c.lineTo(px, py + (ly - py) * k * .55);
      c.lineTo(px + (rx - px) * k * .45, py + (ry - py) * k * .75); c.lineTo(px + (rx - px) * k, py + (ry - py) * k); c.closePath(); c.fill();
    });
  }
  function pine(c, x, y, h, col) {
    c.fillStyle = '#4a3420'; c.fillRect(x - h * .03, y - h * .12, h * .06, h * .12);
    c.fillStyle = col;
    for (let k = 0; k < 4; k++) {
      const top = y - h * (.35 + k * .2), w = h * (.36 - k * .07);
      c.beginPath(); c.moveTo(x, top - h * .28); c.lineTo(x + w, top + h * .1); c.lineTo(x - w, top + h * .1); c.closePath(); c.fill();
    }
  }
  function flagLine(c, x0, x1, y, sag, t, cols) {
    const pt = u => [x0 + (x1 - x0) * u, y + Math.sin(u * Math.PI) * sag];
    c.strokeStyle = 'rgba(80,60,40,.7)'; c.lineWidth = 2;
    c.beginPath(); for (let i = 0; i <= 30; i++) { const [px, py] = pt(i / 30); i ? c.lineTo(px, py) : c.moveTo(px, py); } c.stroke();
    const n = Math.round((x1 - x0) / 52);
    for (let i = 0; i < n; i++) {
      const [px, py] = pt((i + .5) / n), sk = Math.sin(t * 3 + i) * 6;
      c.fillStyle = cols[i % cols.length];
      c.beginPath(); c.moveTo(px - 18, py); c.lineTo(px + 18, py); c.lineTo(px + 18 + sk, py + 46); c.lineTo(px - 18 + sk, py + 46); c.closePath(); c.fill();
    }
  }
  function paperLantern(c, x, y, r, col, lit) {
    c.strokeStyle = 'rgba(40,30,20,.5)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y - r * 2.2); c.lineTo(x, y - r); c.stroke();
    if (lit) glow(c, x, y, r * 2.6, `rgba(255,190,110,${(.35 * lit).toFixed(2)})`);
    const g = c.createRadialGradient(x - r * .3, y - r * .3, r * .1, x, y, r);
    g.addColorStop(0, '#fff6dc'); g.addColorStop(.6, col); g.addColorStop(1, 'rgba(120,50,30,.9)');
    c.fillStyle = g; c.beginPath(); c.ellipse(x, y, r, r * .92, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(120,60,30,.35)'; c.lineWidth = 1.5;
    for (let k = -2; k <= 2; k++) { c.beginPath(); c.ellipse(x, y, Math.abs(k) * r * .3 + 1, r * .92, 0, 0, TAU); c.stroke(); }
    c.fillStyle = '#3a2a1a'; c.fillRect(x - r * .3, y - r * .98, r * .6, r * .14); c.fillRect(x - r * .3, y + r * .84, r * .6, r * .14);
  }
  function bulbs(c, x0, x1, y, sag, t, n, cols, seed) {
    const pt = u => [x0 + (x1 - x0) * u, y + Math.sin(u * Math.PI) * sag];
    c.strokeStyle = 'rgba(30,30,30,.55)'; c.lineWidth = 2;
    c.beginPath(); for (let i = 0; i <= 30; i++) { const [px, py] = pt(i / 30); i ? c.lineTo(px, py) : c.moveTo(px, py); } c.stroke();
    for (let i = 0; i < n; i++) {
      const [px, py] = pt((i + .5) / n), a = .55 + .45 * Math.abs(Math.sin(t * 2 + i * 1.7 + seed));
      const col = cols[i % cols.length];
      glow(c, px, py + 8, 26, col.replace('A', (a * .55).toFixed(2)));
      c.fillStyle = col.replace('A', a.toFixed(2)); c.beginPath(); c.ellipse(px, py + 8, 5, 7, 0, 0, TAU); c.fill();
    }
  }
  function pillar(c, x, y0, y1, w) {
    c.fillStyle = brass(c, x - w / 2, x + w / 2); c.fillRect(x - w / 2, y0, w, y1 - y0);
    c.fillStyle = brass(c, x - w * .8, x + w * .8);
    for (const y of [y0, y1 - w * .5]) c.fillRect(x - w * .8, y, w * 1.6, w * .5);
    c.strokeStyle = 'rgba(110,70,10,.45)'; c.lineWidth = 2;
    for (let y = y0 + w; y < y1 - w; y += w * 1.4) { c.beginPath(); c.moveTo(x - w / 2, y); c.lineTo(x + w / 2, y); c.stroke(); blossom(c, x, y + w * .7, w * .32, 'rgba(160,110,30,.7)', 'rgba(255,240,190,.9)', 0, 6, true); }
  }
  function drape(c, x0, y0, x1, y1, col) {
    const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, col); g.addColorStop(1, col.replace(/[\d.]+\)$/, '.15)'));
    c.fillStyle = g; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo((x0 + x1) / 2, y0 + (y1 - y0) * .55, x1, y0);
    c.lineTo(x1, y0 + 30); c.quadraticCurveTo((x0 + x1) / 2, y0 + (y1 - y0) * .55 + 60, x0, y0 + 30); c.closePath(); c.fill();
  }
  function havan(c, x, y, s, t) {
    c.fillStyle = '#a0522d'; c.beginPath(); c.moveTo(x - s, y); c.lineTo(x + s, y); c.lineTo(x + s * .8, y - s * .5); c.lineTo(x - s * .8, y - s * .5); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,220,180,.5)'; c.lineWidth = 2;
    for (let k = 1; k < 3; k++) { c.beginPath(); c.moveTo(x - s + k * s * .1, y - k * s * .17); c.lineTo(x + s - k * s * .1, y - k * s * .17); c.stroke(); }
    [-.4, 0, .4].forEach((dx, i) => flame(c, x + dx * s, y - s * .5, s * (i === 1 ? .9 : .6), t, i * 3));
  }
  function sunflower(c, x, y, r, rot) {
    c.save(); c.translate(x, y); c.rotate(rot);
    for (let ring = 0; ring < 2; ring++) for (let i = 0; i < 16; i++) {
      c.save(); c.rotate(i / 16 * TAU + ring * .2); c.fillStyle = ring ? '#ffc93c' : '#f4a51c';
      c.beginPath(); c.moveTo(0, -r * .4); c.quadraticCurveTo(r * .18, -r * .75, 0, -r); c.quadraticCurveTo(-r * .18, -r * .75, 0, -r * .4); c.fill(); c.restore();
    }
    const g = c.createRadialGradient(0, 0, 0, 0, 0, r * .45); g.addColorStop(0, '#5a3210'); g.addColorStop(1, '#3a1e08');
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, r * .42, 0, TAU); c.fill();
    c.fillStyle = 'rgba(255,200,90,.35)'; for (let i = 0; i < 30; i++) { const a = i * 2.4, d = Math.sqrt(i / 30) * r * .38; c.beginPath(); c.arc(Math.cos(a) * d, Math.sin(a) * d, r * .025, 0, TAU); c.fill(); }
    c.restore();
  }
  function cloud(c, x, y, s, col = '#ffffff') {
    c.fillStyle = col;
    [[0, 0, .5], [-.45, .12, .36], [.45, .1, .4], [-.2, -.22, .38], [.22, -.25, .34], [-.75, .22, .24], [.8, .22, .26]].forEach(([dx, dy, r]) => {
      c.beginPath(); c.arc(x + dx * s, y + dy * s, r * s, 0, TAU); c.fill();
    });
  }
  function discoBall(c, x, y, r, t) {
    c.strokeStyle = 'rgba(220,220,240,.7)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, y - r); c.stroke();
    c.save(); c.beginPath(); c.arc(x, y, r, 0, TAU); c.clip();
    const n = 12;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const v = (Math.sin(i * 1.3 + j * .7 + t * 2) + 1) / 2;
      c.fillStyle = `hsl(${250 + v * 60},${15 + v * 40}%,${45 + v * 45}%)`;
      c.fillRect(x - r + j * 2 * r / n + 1, y - r + i * 2 * r / n + 1, 2 * r / n - 2, 2 * r / n - 2);
    }
    const g = c.createRadialGradient(x - r * .3, y - r * .3, r * .1, x, y, r); g.addColorStop(0, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(0,0,0,.45)');
    c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); c.restore();
  }
  function lovebird(c, x, y, s, dir, col) {
    c.save(); c.translate(x, y); c.scale(dir, 1);
    c.fillStyle = col; c.beginPath(); c.ellipse(0, 0, s * .5, s * .32, -.2, 0, TAU); c.fill();
    c.beginPath(); c.arc(s * .42, -s * .22, s * .2, 0, TAU); c.fill();
    c.beginPath(); c.moveTo(-s * .4, 0); c.lineTo(-s * .85, s * .12); c.lineTo(-s * .45, s * .16); c.fill();
    c.fillStyle = 'rgba(0,0,0,.15)'; c.beginPath(); c.ellipse(-s * .05, -s * .02, s * .28, s * .16, -.3, 0, TAU); c.fill();
    c.fillStyle = '#f6a623'; c.beginPath(); c.moveTo(s * .6, -s * .24); c.lineTo(s * .74, -s * .18); c.lineTo(s * .6, -s * .14); c.fill();
    c.fillStyle = '#222'; c.beginPath(); c.arc(s * .48, -s * .26, s * .035, 0, TAU); c.fill();
    c.restore();
  }
  function burst(c, x, y, p, col, n = 28, size = 120) {
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU, d = ease(p) * size;
      c.fillStyle = `rgba(${col},${(1 - p).toFixed(2)})`; c.beginPath(); c.arc(x + Math.cos(a) * d, y + Math.sin(a) * d + p * p * 30, 4, 0, TAU); c.fill();
    }
  }

  // ---------- The looks: twenty painted scenes, each in fifteen moods (300 in all) ----------
  const LOOKS = {
    vrindavan: {
      name: 'Vrindavan Garden', mood: 'Morning', note: 'Forest light, peacock, flute & feather',
      col: { names: '#b0285e', ink: '#3b3016', ink2: '#5a4a28', accent: '#2f6b3a', gold: '#b8862b' },
      mono: [['#f28bb2', '#c2185b'], ['#3a6fd8', '#14306e']],
      font: { script: 'Dancing Script', serif: 'Marcellus' }, zone: [400, 1440, 820], shadow: ['rgba(255,252,235,.9)', 14], music: 'romantic',
      back(c, R, m) {
        sky(c, [[0, '#fbf6d8'], [.3, '#eef1c8'], [.62, '#b4cb8c'], [1, '#5f7f3e']]);
        for (const [y, l, n] of [[1150, 62, 500], [1250, 55, 500]]) {
          foliage(c, R, 540, y, 640, 150, n, 95, l, 40);
          c.fillStyle = 'rgba(240,242,212,.5)'; c.fillRect(0, y - 200, W, 420);
        }
        chhatri(c, 840, 1520, 290);
        c.fillStyle = 'rgba(240,242,215,.25)'; c.fillRect(680, 1150, 330, 380);
        for (const x of [70, 1010]) {
          const g = c.createLinearGradient(x - 50, 0, x + 50, 0); g.addColorStop(0, '#3e2a16'); g.addColorStop(.5, '#7a5a34'); g.addColorStop(1, '#3a2612');
          c.fillStyle = g; c.beginPath(); c.moveTo(x - 38, 0); c.lineTo(x + 38, 0); c.lineTo(x + 60, 1560); c.lineTo(x - 60, 1560); c.fill();
        }
        for (const [cx, cy] of [[60, 700], [1020, 760]]) foliage(c, R, cx, cy, 220, 520, 700, 105, 34, 46);
        for (const [cx, cy] of [[120, 120], [960, 110]]) {
          foliage(c, R, cx, cy, 380, 300, 900, 100, 30, 52);
          for (let i = 0; i < 26; i++) blossom(c, cx + (R() - .5) * 600, cy + (R() - .3) * 380, 16 + R() * 16, R() > .5 ? '#ec6f9c' : '#f7a8c4', '#fff', R() * 6);
        }
        const mg = c.createLinearGradient(0, 1480, 0, H); mg.addColorStop(0, '#a6c472'); mg.addColorStop(1, '#4f7d33');
        c.fillStyle = mg; c.beginPath(); c.moveTo(0, 1570); c.quadraticCurveTo(540, 1470, W, 1570); c.lineTo(W, H); c.lineTo(0, H); c.fill();
        c.lineWidth = 2.2;
        for (let i = 0; i < 900; i++) {
          const x = R() * W, y = 1540 + R() * 400, h = 14 + R() * 26;
          c.strokeStyle = `hsl(${90 + R() * 30},${40 + R() * 20}%,${30 + R() * 25}%)`;
          c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + (R() - .5) * 10, y - h * .6, x + (R() - .5) * 14, y - h); c.stroke();
        }
        glow(c, 540, 860, 600, 'rgba(255,252,232,.82)');
        for (let i = 0; i < 70; i++) {
          const left = i % 2, x = left ? R() * 300 : W - R() * 360, y = (left ? 1830 : 1720) + R() * (left ? 90 : 200);
          if (R() > .4) blossom(c, x, y, 20 + R() * 18, R() > .5 ? '#ec5f92' : '#f8a5c2', '#fff', R() * 6);
          else { c.fillStyle = '#9b7ad8'; for (let k = 0; k < 6; k++) { c.beginPath(); c.ellipse(x, y - k * 9, 4, 5, 0, 0, TAU); c.fill(); } }
        }
        peacock(c, 400, 1790, 300, 1);
        rabbit(c, 640, 1740, 74);
        rabbit(c, 740, 1765, 64, -1);
      },
      anim(c, t) {
        c.save(); c.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 6; i++) {
          const a = -.5 + i * .2 + Math.sin(t * .2 + i) * .03, alpha = .05 + .03 * Math.sin(t * .7 + i * 1.7);
          c.save(); c.translate(540, -120); c.rotate(a);
          const g = c.createLinearGradient(0, 0, 0, 1700); g.addColorStop(0, `rgba(255,248,210,${alpha * 2})`); g.addColorStop(1, 'rgba(255,248,210,0)');
          c.fillStyle = g; c.beginPath(); c.moveTo(-20, 0); c.lineTo(20, 0); c.lineTo(110, 1700); c.lineTo(-110, 1700); c.fill(); c.restore();
        }
        c.restore();
        [[140, 320], [230, 260], [330, 200], [760, 210], [860, 270], [950, 330]].forEach(([x, len], i) => vine(c, x, 60, len, Math.sin(t * 1.1 + i), '#ec6f9c', i));
        butterfly(c, 300 + Math.sin(t * .5) * 140, 1300 + Math.sin(t * .9) * 90, 34, t * 9, '#f6a821');
        butterfly(c, 820 + Math.cos(t * .45) * 110, 1150 + Math.sin(t * .7 + 1) * 80, 28, t * 10 + 1, '#7ab6ff');
      },
      fx(c, t) { petals(c, t, 18, ['#f48fb1', '#ec6f9c', '#fbc4d8'], 11); motes(c, t, 14, 'rgba(255,250,200,A)', 3); },
      moods: [
        { key: 'golden', mood: 'Golden Hour', tint: [['soft-light', ['#ffb347', '#ff6f61'], .7], ['multiply', '#ffe0b2', .35]], col: { names: '#a3203f', ink: '#3a2410', accent: '#8a4a12' } },
        { key: 'moonlit', mood: 'Moonlit', tint: [['multiply', ['#33417f', '#121b45'], .8]], col: { names: '#ffd98a', ink: '#f6efdc', ink2: '#ddd2b4', accent: '#b5e0b8', gold: '#e8c46a' }, shadow: ['rgba(5,10,35,.85)', 16], mono: [['#ffe9b0', '#e0b04a'], ['#cfe2ff', '#7fa6ff']] }
      ],
      crest(c, x, y, t) {
        const s = 520;
        c.save(); c.translate(x, y + 170);
        feather(c, -s * .34, 0, s * .44, -Math.PI * .7 + Math.sin(t * 1.3) * .03);
        const g = c.createLinearGradient(0, -s * .03, 0, s * .03); g.addColorStop(0, '#f6da8f'); g.addColorStop(.5, '#c98f2e'); g.addColorStop(1, '#7a5214');
        c.fillStyle = g; rrect(c, -s * .5, -s * .022, s, s * .044, s * .022); c.fill();
        c.fillStyle = '#4a2f0e'; for (let i = 0; i < 7; i++) { c.beginPath(); c.ellipse(-s * .06 + i * s * .065, 0, s * .009, s * .007, 0, 0, TAU); c.fill(); }
        c.fillStyle = '#e8c35a'; for (const bx of [-.43, -.31, .37]) c.fillRect(bx * s, -s * .024, s * .012, s * .048);
        for (const [bx, ph] of [[-.47, 0], [.47, 1.3]]) {
          c.save(); c.translate(bx * s, s * .02); c.rotate(Math.sin(t * 2.2 + ph) * .12);
          c.strokeStyle = '#b8862b'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, s * .06); c.stroke(); bell(c, 0, s * .06, s * .055); c.restore();
        }
        blossom(c, s * .5, -s * .01, 20, '#ec6f9c', '#fff', 0);
        c.restore();
      }
    },

    jharokha: {
      name: 'Royal Jharokha', mood: 'Ivory', note: 'Carved arch, peacocks, lotus urli',
      col: { names: '#c8436e', ink: '#2c4529', ink2: '#4c5b3a', accent: '#2f6b3a', gold: '#b88a2e' },
      mono: [['#f08aab', '#c2185b'], ['#46a06a', '#1f5a3a']],
      font: { script: 'Playball', serif: 'Marcellus' }, zone: [450, 1380, 600], shadow: ['rgba(255,252,235,.9)', 12], music: 'royal',
      back(c, R, m) {
        const l = 200, r = 880, spring = 760, apex = 290;
        sky(c, [[0, '#f7f4e0'], [.45, '#e6edcc'], [.75, '#bdd29b'], [1, '#93b273']]);
        foliage(c, R, 540, 1240, 420, 130, 500, 98, 56, 36);
        c.fillStyle = 'rgba(244,244,222,.55)'; c.fillRect(0, 1050, W, 330);
        chhatri(c, 720, 1420, 210); chhatri(c, 380, 1430, 160);
        c.fillStyle = '#ece0c0'; c.fillRect(0, 1430, W, 20);
        for (let x = 210; x < 880; x += 26) { c.fillStyle = stoneGrad(c, x, x + 14, '#f3e8cc', '#cdb98f'); rrect(c, x, 1450, 14, 50, 6); c.fill(); }
        c.fillStyle = '#e4d6b2'; c.fillRect(0, 1500, W, 16);
        glow(c, 540, 900, 460, 'rgba(255,253,240,.85)');
        c.save(); c.beginPath(); archPath(c, l, r, spring, apex, H + 10, 9); c.clip();
        c.shadowColor = 'rgba(70,50,15,.5)'; c.shadowBlur = 50;
        c.beginPath(); c.rect(-200, -200, W + 400, H + 400); archPath(c, l, r, spring, apex, H + 10, 9); c.fillStyle = '#000'; c.fill('evenodd');
        c.restore();
        c.save(); c.beginPath(); c.rect(0, 0, W, H); archPath(c, l, r, spring, apex, H + 10, 9); c.clip('evenodd');
        const sg = c.createLinearGradient(0, 0, W, 0); sg.addColorStop(0, '#d5c196'); sg.addColorStop(.2, '#efe2c4'); sg.addColorStop(.8, '#efe2c4'); sg.addColorStop(1, '#d1bc8f');
        c.fillStyle = sg; c.fillRect(0, 0, W, H);
        c.strokeStyle = 'rgba(150,115,60,.22)'; c.lineWidth = 2;
        for (let y = 230; y < spring; y += 44) for (let x = (y / 44 % 2) * 22; x < W; x += 44) { c.beginPath(); c.moveTo(x, y - 14); c.lineTo(x + 14, y); c.lineTo(x, y + 14); c.lineTo(x - 14, y); c.closePath(); c.stroke(); }
        for (const x0 of [30, 930]) {
          c.fillStyle = 'rgba(255,250,235,.35)'; c.fillRect(x0, 820, 120, H);
          c.strokeStyle = 'rgba(140,105,50,.45)'; c.lineWidth = 3; c.strokeRect(x0 + 10, 830, 100, H);
          for (let y = 900; y < H; y += 120) blossom(c, x0 + 60, y, 30, 'rgba(170,135,80,.55)', 'rgba(250,240,215,.8)', 0, 8);
        }
        c.fillStyle = 'rgba(150,115,60,.35)'; c.fillRect(0, 150, W, 6); c.fillRect(0, 196, W, 3);
        for (let x = 0; x < W; x += 54) { c.beginPath(); c.moveTo(x, 150); c.quadraticCurveTo(x + 27, 100, x + 54, 150); c.fillStyle = 'rgba(170,135,80,.3)'; c.fill(); }
        c.restore();
        c.beginPath(); archPath(c, l - 34, r + 34, spring, apex - 46, H + 10, 0);
        c.strokeStyle = 'rgba(140,105,50,.6)'; c.lineWidth = 5; c.stroke();
        c.beginPath(); archPath(c, l - 60, r + 60, spring, apex - 84, H + 10, 0); c.strokeStyle = 'rgba(140,105,50,.35)'; c.lineWidth = 3; c.stroke();
        archPts(l - 47, r + 47, spring, apex - 65, 22).forEach(([x, y], i) => blossom(c, x, y, 13, 'rgba(160,120,60,.7)', 'rgba(250,240,215,.9)', i, 6));
        c.beginPath(); archPath(c, l, r, spring, apex, H + 10, 9); c.strokeStyle = 'rgba(120,88,36,.6)'; c.lineWidth = 4; c.stroke();
        for (const [x0, dir] of [[20, 1], [840, -1]]) {
          c.fillStyle = stoneGrad(c, x0, x0 + 220, '#f1e5c9', '#bfa878'); c.fillRect(x0, 1600, 220, H - 1600);
          c.fillStyle = stoneGrad(c, x0 - 14, x0 + 234, '#f6ecd4', '#c4ad7e'); c.fillRect(x0 - 14, 1580, 248, 30);
          c.strokeStyle = 'rgba(140,105,50,.4)'; c.lineWidth = 3; c.strokeRect(x0 + 24, 1640, 172, 240);
          blossom(c, x0 + 110, 1760, 46, 'rgba(170,135,80,.6)', 'rgba(250,240,215,.85)', 0, 8);
          peacock(c, x0 + (dir > 0 ? 80 : 140), 1582, 330, dir, dir > 0 ? 3 : 5, true);
        }
        const ux = 540, uy = 1690, w = 330;
        const gold = (x0, x1) => { const g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, '#80520f'); g.addColorStop(.35, '#f5d47c'); g.addColorStop(.62, '#c48a2a'); g.addColorStop(1, '#6e440c'); return g; };
        c.fillStyle = gold(ux - 80, ux + 80); c.beginPath(); c.moveTo(ux - 34, uy + 40); c.lineTo(ux + 34, uy + 40); c.lineTo(ux + 80, H); c.lineTo(ux - 80, H); c.fill();
        for (const [yy, rw] of [[uy + 70, 50], [uy + 150, 66]]) { c.fillStyle = gold(ux - rw, ux + rw); c.beginPath(); c.ellipse(ux, yy, rw, 14, 0, 0, TAU); c.fill(); }
        c.fillStyle = gold(ux - w / 2, ux + w / 2); c.beginPath(); c.ellipse(ux, uy, w / 2, w * .2, 0, 0, Math.PI); c.fill();
        for (let i = 0; i < 7; i++) { const bx = ux - w * .38 + i * w * .127; c.strokeStyle = '#a8742a'; c.lineWidth = 2; c.beginPath(); c.moveTo(bx, uy + w * .12); c.lineTo(bx, uy + w * .2); c.stroke(); bell(c, bx, uy + w * .2, 22); }
        for (let i = 0; i < 13; i++) {
          const a = Math.PI + i / 12 * Math.PI, px = ux + Math.cos(a) * w * .46, py = uy + Math.sin(a) * w * .07;
          c.save(); c.translate(px, py); c.rotate((i / 12 - .5) * 1.4); lotus(c, 0, 0, 46); c.restore();
        }
        c.fillStyle = '#f8f4ea'; c.beginPath(); c.ellipse(ux, uy, w * .44, w * .065, 0, 0, TAU); c.fill();
        c.strokeStyle = '#d9a83a'; c.lineWidth = 6; for (const dx of [-16, 16]) { c.beginPath(); c.ellipse(ux + dx, uy - 4, 24, 9, 0, 0, TAU); c.stroke(); }
        for (let i = 0; i < 60; i++) {
          const left = i % 2, x = left ? R() * 300 : W - R() * 300, y = 1780 + R() * 160;
          if (i % 5 === 0) lotus(c, x, y, 70 + R() * 30, .7 + R() * .3);
          else if (i % 5 === 1) leaf(c, x, y, 120, 40, -Math.PI / 2 + (R() - .5) * 1.4, '#4f8a3c');
          else blossom(c, x, y, 18 + R() * 14, R() > .5 ? '#ec5f92' : '#f8b3cb', '#fff', R() * 6);
        }
      },
      anim(c, t) {
        [[230, 360], [330, 260], [430, 190], [650, 190], [750, 260], [850, 360]].forEach(([x, len], i) => vine(c, x, 210, len, Math.sin(t * 1.1 + i * .8), '#f06a9a', i));
      },
      fx(c, t) { petals(c, t, 16, ['#f48fb1', '#f8bbd0', '#ec6f9c'], 21); sparks(c, t, 10, '#f3d27a', 9); },
      moods: [
        { key: 'rose', mood: 'Rose', tint: [['multiply', '#f9c9d6', .65]], col: { names: '#b0245a', ink: '#4a2232', ink2: '#6a3a4a', accent: '#a0284f' } },
        { key: 'night', mood: 'Royal Night', tint: [['multiply', ['#25306a', '#101638'], .82]], col: { names: '#ffd98a', ink: '#f6efdc', ink2: '#dcd3bb', accent: '#f4b6c8', gold: '#e8c46a' }, shadow: ['rgba(5,8,30,.85)', 16], mono: [['#ffe9b0', '#e0b04a'], ['#ffd0dc', '#e8799d']] }
      ],
      crest(c, x, y, t) {
        c.save(); mandala(c, x, y + 105, 120, 'rgba(184,138,46,.85)', t * .15); c.restore();
        c.font = '96px "Yatra One"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#c2185b'; c.fillText('ॐ', x, y + 110);
      }
    },

    lotusnight: {
      name: 'Lotus Night', mood: 'Moonlit', note: 'Moonlit pond, floating diyas',
      col: { names: '#f7d58b', ink: '#f6eedc', ink2: '#d6caa8', accent: '#f4a9c6', gold: '#e9c46a' },
      mono: [['#fff1c1', '#d4a24c'], ['#fbd0e2', '#d96c9a']],
      font: { script: 'Satisfy', serif: 'Gilda Display' }, zone: [360, 1240, 860], shadow: ['rgba(3,8,25,.85)', 16], music: 'royal',
      back(c, R, m) {
        sky(c, [[0, '#060f26'], [.42, '#0f2850'], [.615, '#1f4474']], 0, 1180);
        for (let i = 0; i < 220; i++) { c.globalAlpha = .3 + R() * .7; c.fillStyle = '#fff'; c.beginPath(); c.arc(R() * W, R() * 1100, .8 + R() * 2, 0, TAU); c.fill(); }
        c.globalAlpha = 1;
        glow(c, 800, 290, 360, 'rgba(255,240,200,.28)');
        const mg = c.createRadialGradient(780, 270, 10, 800, 290, 78); mg.addColorStop(0, '#fffdf0'); mg.addColorStop(1, '#efdcaa');
        c.fillStyle = mg; c.beginPath(); c.arc(800, 290, 76, 0, TAU); c.fill();
        c.fillStyle = 'rgba(190,170,120,.25)'; [[780, 270, 14], [820, 305, 10], [790, 320, 7]].forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); });
        c.fillStyle = '#0b1d3a'; c.beginPath(); c.moveTo(0, 1180);
        for (let x = 0; x <= W; x += 60) c.lineTo(x, 1150 - Math.sin(x / 170) * 26 - R() * 10);
        c.lineTo(W, 1180); c.fill();
        c.fillStyle = '#081530'; c.beginPath(); c.moveTo(150, 1180); c.lineTo(150, 1110); c.lineTo(190, 1110);
        c.quadraticCurveTo(200, 1010, 240, 960); c.quadraticCurveTo(280, 1010, 290, 1110); c.lineTo(330, 1110); c.lineTo(330, 1180); c.fill();
        c.fillRect(236, 930, 8, 34);
        [[205, 1140], [240, 1060], [275, 1140]].forEach(([x, y]) => { glow(c, x, y, 26, 'rgba(255,200,110,.6)'); c.fillStyle = '#ffcf70'; c.fillRect(x - 5, y - 8, 10, 16); });
        sky(c, [[0, '#123766'], [.4, '#0b2347'], [1, '#050f24']], 1180, H);
        for (let i = 0; i < 60; i++) { const y = 1190 + i * 9, w = 120 - i * 1.2 + R() * 40; c.fillStyle = `rgba(255,236,180,${.35 - i * .005})`; c.fillRect(800 - w / 2 + (R() - .5) * 30, y, w, 3); }
        const pads = [];
        for (let i = 0; i < 26; i++) { const y = 1300 + R() * 600, k = (y - 1200) / 700; pads.push([R() * W, y, (60 + R() * 70) * k + 30]); }
        pads.sort((a, b) => a[1] - b[1]).forEach(([x, y, s], i) => {
          if (Math.abs(x - 540) < 200 && y < 1550) return;
          lotusPad(c, x, y, s, s * .32, (R() - .5) * .4);
          if (i % 3 === 0) { glow(c, x, y - s * .4, s * 1.2, 'rgba(255,140,190,.3)'); lotus(c, x, y - s * .05, s * .9, .8); }
        });
        glow(c, 540, 820, 560, 'rgba(4,10,30,.45)');
      },
      anim(c, t) {
        for (let i = 0; i < 40; i++) { const x = (i * 263) % W, y = (i * 97) % 1100, a = Math.max(0, Math.sin(t * 1.7 + i * 2.1)); c.fillStyle = `rgba(255,255,255,${a * .9})`; c.beginPath(); c.arc(x, y, 2.2, 0, TAU); c.fill(); }
        for (let i = 0; i < 6; i++) { const y = 1200 + i * 60, w = 140 - i * 12, dx = Math.sin(t * 2 + i) * 18; c.fillStyle = 'rgba(255,240,200,.18)'; c.fillRect(800 - w / 2 + dx, y, w, 3); }
        for (let i = 0; i < 5; i++) {
          const x = ((i * 260 + t * 16) % (W + 200)) - 100, y = 1360 + (i % 3) * 150 + Math.sin(t + i) * 8, s = 36 + (i % 3) * 14;
          if (Math.abs(x - 540) < 220 && y < 1560) continue;
          diya(c, x, y, s, t);
          c.fillStyle = 'rgba(255,190,90,.18)'; c.fillRect(x - s * .5, y + s * .3, s, 4);
        }
      },
      fx(c, t) { motes(c, t, 22, 'rgba(255,230,140,A)', 5, 18); },
      moods: [
        { key: 'dawn', mood: 'Dawn', tint: [['soft-light', ['#ffb38a', '#ff7eb3', '#6a5acd'], .85], ['screen', '#3a1f4f', .22]] },
        { key: 'emerald', mood: 'Emerald', tint: [['color', '#0f7a62', .5]], col: { names: '#ffe7a3', accent: '#9fe8c8' } }
      ],
      crest(c, x, y, t) { diya(c, x, y + 150, 110, t); }
    },

    marigold: {
      name: 'Marigold Mandap', mood: 'Maroon', note: 'Genda garlands, bells, rangoli',
      col: { names: '#ffd27a', ink: '#fff2dc', ink2: '#f5d3a6', accent: '#ffb347', gold: '#f2c14e' },
      mono: [['#ffe29a', '#f2a900'], ['#ffb38a', '#ff6a3c']],
      font: { script: 'Cookie', serif: 'Gilda Display' }, zone: [470, 1460, 760], shadow: ['rgba(40,0,8,.85)', 14], music: 'festive',
      back(c, R, m) {
        const bg = m.bg || ['#951a2c', '#5c0b19', '#2c040e'];
        const g = c.createRadialGradient(540, 900, 50, 540, 900, 1200); g.addColorStop(0, bg[0]); g.addColorStop(.6, bg[1]); g.addColorStop(1, bg[2]);
        c.fillStyle = g; c.fillRect(0, 0, W, H);
        c.globalAlpha = .1; mandala(c, 540, 930, 600, '#f2c14e'); c.globalAlpha = 1;
        c.strokeStyle = 'rgba(242,193,78,.7)'; c.lineWidth = 3; c.strokeRect(40, 40, W - 80, H - 80); c.lineWidth = 1.5; c.strokeRect(56, 56, W - 112, H - 112);
        for (const [x, y] of [[56, 56], [W - 56, 56], [56, H - 56], [W - 56, H - 56]]) mandala(c, x, y, 70, 'rgba(242,193,78,.8)');
        for (const [x, top, n] of [[110, 120, 26], [180, 120, 18], [900, 120, 18], [970, 120, 26]]) {
          c.strokeStyle = '#3d6b22'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, top); c.lineTo(x, top + n * 32); c.stroke();
          for (let i = 0; i < n; i++) marigold(c, x, top + i * 32, 17, i % 2 ? 38 : 28);
          rose(c, x, top + n * 32 + 14, 22, '#ff5a6e', '#a80d2a');
        }
        for (const [y, sag, hue0] of [[110, 150, 28], [90, 90, 38]]) {
          for (let k = 0; k < 3; k++) {
            const x0 = k * W / 3, x1 = (k + 1) * W / 3;
            for (let i = 0; i <= 18; i++) { const u = i / 18, x = x0 + (x1 - x0) * u, yy = y + Math.sin(u * Math.PI) * sag; marigold(c, x, yy, 19, i % 2 ? hue0 : hue0 + 10); }
          }
        }
        c.fillStyle = '#7a4a1a'; c.fillRect(0, 34, W, 8);
        for (let x = 10; x < W; x += 36) { leaf(c, x, 42, 70, 18, Math.PI / 2 + (x % 72 ? .12 : -.12), x % 72 ? '#2e7d32' : '#4caf50'); if (x % 108 === 10) marigold(c, x + 18, 50, 14, 34); }
        rangoli(c, 540, 1880, 240);
      },
      anim(c, t) {
        for (const [x, n, ph] of [[110, 26, 0], [180, 18, 1], [900, 18, 2], [970, 26, 3]]) {
          const y = 120 + n * 32 + 40;
          c.save(); c.translate(x, y); c.rotate(Math.sin(t * 2 + ph) * .14);
          c.strokeStyle = '#c8902e'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 24); c.stroke(); bell(c, 0, 24, 40); c.restore();
        }
        [170, 320, 760, 910].forEach((x, i) => diya(c, x, 1800 - (i % 2) * 40, 46, t + i));
        glow(c, 540, 960, 520, `rgba(255,170,70,${.08 + .03 * Math.sin(t * 1.5)})`);
      },
      fx(c, t) { petals(c, t, 22, ['#ff9800', '#ffc107', '#ff7043'], 31); sparks(c, t, 12, '#ffd77a', 4); },
      moods: [
        { key: 'green', mood: 'Mehendi Green', m: { bg: ['#1f6b4a', '#0f4a32', '#06261a'] }, col: { names: '#ffe08a', ink: '#f4f7e6', ink2: '#d8e6c6', accent: '#ffc94d' }, shadow: ['rgba(0,25,10,.85)', 14] },
        { key: 'royal', mood: 'Royal Purple', m: { bg: ['#5a2a8a', '#36125e', '#1a0632'] }, col: { names: '#ffd27a', ink: '#f7ecff', ink2: '#e2cff5', accent: '#ffb347' }, shadow: ['rgba(15,0,30,.85)', 14] }
      ],
      crest(c, x, y, t) {
        c.strokeStyle = '#d9a83a'; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 240, y + 20); c.quadraticCurveTo(x, y + 90, x + 240, y + 20); c.stroke();
        for (let i = 0; i <= 12; i++) { const u = i / 12; marigold(c, x - 240 + 480 * u, y + 20 + Math.sin(u * Math.PI) * 35, 15, i % 2 ? 38 : 28); }
        [-120, 0, 120].forEach((dx, i) => {
          c.save(); c.translate(x + dx, y + 60 + (i === 1 ? 20 : 0)); c.rotate(Math.sin(t * 2.4 + i) * .16);
          c.strokeStyle = '#c8902e'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 40); c.stroke(); bell(c, 0, 40, i === 1 ? 70 : 54); c.restore();
        });
      }
    },

    palace: {
      name: 'Palace Dusk', mood: 'Sunset', note: 'Lake palace at sunset, sky lanterns',
      col: { names: '#ffe3a3', ink: '#fff6ea', ink2: '#f7dcc6', accent: '#ffb08a', gold: '#f4c76b' },
      mono: [['#fff0c8', '#e0a84a'], ['#ffd1dc', '#e66b8f']],
      font: { script: 'Playball', serif: 'Cinzel' }, zone: [280, 1000, 860], shadow: ['rgba(30,10,40,.8)', 16], music: 'royal',
      back(c, R, m) {
        sky(c, m.sky || [[0, '#1b1240'], [.28, '#45286a'], [.5, '#a8497a'], [.64, '#ee8a5c'], [.73, '#ffc27c']], 0, 1400);
        glow(c, 540, 1330, 520, 'rgba(255,200,120,.55)');
        c.fillStyle = m.sun || '#ffdca4'; c.beginPath(); c.arc(540, 1330, 110, 0, TAU); c.fill();
        for (let i = 0; i < 9; i++) { c.fillStyle = `rgba(255,${150 + R() * 60},${150 + R() * 40},.18)`; c.beginPath(); c.ellipse(R() * W, 880 + R() * 380, 200 + R() * 260, 10 + R() * 12, 0, 0, TAU); c.fill(); }
        const palaceShape = () => {
          c.beginPath(); c.moveTo(60, 1400); c.lineTo(60, 1240);
          const parts = [[60, 150, 1240], [150, 300, 1190], [300, 420, 1150], [420, 660, 1110], [660, 780, 1150], [780, 930, 1190], [930, 1020, 1240]];
          parts.forEach(([a, b, top]) => {
            c.lineTo(a, top); const m = (a + b) / 2, w = (b - a) * .32;
            c.lineTo(m - w, top); c.bezierCurveTo(m - w * 1.25, top - w * 1.1, m - w * .2, top - w * 1.3, m, top - w * 1.8);
            c.bezierCurveTo(m + w * .2, top - w * 1.3, m + w * 1.25, top - w * 1.1, m + w, top); c.lineTo(b, top);
          });
          c.lineTo(1020, 1400); c.closePath();
          for (const mx of [50, 1030]) { c.rect(mx - 12, 1040, 24, 360); c.moveTo(mx - 22, 1040); c.quadraticCurveTo(mx, 980, mx + 22, 1040); }
        };
        c.fillStyle = '#2a1533'; palaceShape(); c.fill();
        [[60, 150, 1240], [150, 300, 1190], [300, 420, 1150], [420, 660, 1110], [660, 780, 1150], [780, 930, 1190], [930, 1020, 1240]].forEach(([a, b, top]) => {
          for (let y = top + 34; y < 1370; y += 52) for (let x = a + 18; x < b - 24; x += 40) {
            if (R() < .3) continue;
            c.fillStyle = `rgba(255,${185 + R() * 45},${100 + R() * 30},${.5 + R() * .45})`;
            c.beginPath(); c.moveTo(x, y + 26); c.lineTo(x, y + 8); c.quadraticCurveTo(x + 8, y - 6, x + 16, y + 8); c.lineTo(x + 16, y + 26); c.fill();
          }
        });
        sky(c, m.water || [[0, '#d77a6a'], [.15, '#7a3a66'], [1, '#170b26']], 1400, H);
        c.save(); c.translate(0, 2800); c.scale(1, -1); c.globalAlpha = .4; c.fillStyle = '#1a0c22'; palaceShape(); c.fill(); c.restore();
        for (let i = 0; i < 70; i++) { const y = 1410 + R() * 400, w = 40 + R() * 160; c.fillStyle = `rgba(255,200,140,${.25 * (1 - (y - 1400) / 450)})`; c.fillRect(540 - w / 2 + (R() - .5) * 200 * ((y - 1400) / 400), y, w, 2.5); }
        c.fillStyle = '#12081c'; c.fillRect(0, 1790, W, 130);
        for (let x = 10; x < W; x += 52) { rrect(c, x, 1710, 26, 90, 12); c.fill(); }
        c.fillRect(0, 1690, W, 26);
        for (const x of [70, 1010]) { c.beginPath(); c.moveTo(x - 60, 1690); c.lineTo(x + 60, 1690); c.lineTo(x + 44, 1600); c.lineTo(x - 44, 1600); c.fill(); foliage(c, R, x, 1500, 120, 120, 220, 280, 9, 40, 20); }
        glow(c, 540, 720, 520, 'rgba(25,8,40,.35)');
      },
      anim(c, t) {
        for (let i = 0; i < 9; i++) {
          const R = rng(100 + i), x0 = R() * W, sp = 20 + R() * 25, s = 18 + R() * 16;
          const y = 1500 - ((t * sp + R() * 1600) % 1700), x = x0 + Math.sin(t * .5 + i) * 30;
          const fl = .8 + .2 * Math.sin(t * 7 + i * 3);
          glow(c, x, y, s * 3, `rgba(255,170,80,${.35 * fl})`);
          const g = c.createLinearGradient(0, y - s, 0, y + s); g.addColorStop(0, '#ffe2a0'); g.addColorStop(1, '#ff8a3a');
          c.fillStyle = g; c.beginPath(); c.moveTo(x - s * .55, y - s); c.lineTo(x + s * .55, y - s); c.lineTo(x + s * .4, y + s); c.lineTo(x - s * .4, y + s); c.closePath(); c.fill();
        }
        for (let k = 0; k < 2; k++) {
          const cyc = 3.4, n = Math.floor((t + k * 1.7) / cyc), p = ((t + k * 1.7) % cyc) / 1.6;
          if (p > 1) continue;
          const R = rng(n * 7 + k), x = 160 + R() * 760, y = 160 + R() * 260, col = R() > .5 ? '255,214,120' : '255,140,190';
          for (let i = 0; i < 28; i++) {
            const a = i / 28 * TAU, d = ease(p) * (110 + R() * 30);
            c.fillStyle = `rgba(${col},${1 - p})`; c.beginPath(); c.arc(x + Math.cos(a) * d, y + Math.sin(a) * d + p * p * 30, 4, 0, TAU); c.fill();
          }
        }
      },
      fx(c, t) { motes(c, t, 14, 'rgba(255,200,130,A)', 8, 30); },
      moods: [
        { key: 'blue', mood: 'Blue Hour', m: { sky: [[0, '#070c2a'], [.3, '#16245c'], [.52, '#3a4f95'], [.66, '#b88aa8'], [.73, '#f2c0a0']], sun: '#fff0d0', water: [[0, '#9a8ab0'], [.15, '#2c3466'], [1, '#080c22']] }, col: { names: '#ffe9b8', accent: '#a8c8ff' } },
        { key: 'rose', mood: 'Rose Dawn', m: { sky: [[0, '#3a2358'], [.3, '#a25a8e'], [.52, '#f09aa0'], [.66, '#ffc9a0'], [.73, '#ffe6b8']], sun: '#fff4d8', water: [[0, '#f0b0a0'], [.15, '#a25a7e'], [1, '#2a1438']] }, col: { names: '#fff0d0', accent: '#ffd0e0' } }
      ],
      crest(c, x, y, t) {
        c.save(); c.translate(x, y + 196); c.strokeStyle = '#f4c76b'; c.lineWidth = 4; c.fillStyle = 'rgba(244,199,107,.18)';
        c.beginPath(); c.moveTo(-90, 0); c.lineTo(90, 0); c.moveTo(-70, 0); c.lineTo(-70, -60); c.moveTo(70, 0); c.lineTo(70, -60); c.moveTo(0, 0); c.lineTo(0, -60); c.stroke();
        c.beginPath(); c.moveTo(-100, -60); c.lineTo(100, -60); c.stroke();
        c.beginPath(); c.moveTo(-80, -60); c.bezierCurveTo(-84, -120, -24, -136, 0, -165); c.bezierCurveTo(24, -136, 84, -120, 80, -60); c.fill(); c.stroke();
        c.beginPath(); c.moveTo(0, -165); c.lineTo(0, -195); c.stroke(); c.beginPath(); c.arc(0, -200, 7, 0, TAU); c.fillStyle = '#f4c76b'; c.fill();
        c.restore();
      }
    },

    blush: {
      name: 'Blush Floral', mood: 'Blush', note: 'Watercolour roses, gold arch',
      col: { names: '#a8436a', ink: '#553943', ink2: '#7a5c66', accent: '#b98352', gold: '#c9a063' },
      mono: [['#eaa5ba', '#b4527a'], ['#d9b47a', '#9a7440']],
      font: { script: 'Satisfy', serif: 'Gilda Display' }, zone: [440, 1460, 720], shadow: ['rgba(255,250,246,.95)', 10], music: 'calm',
      back(c, R, m) {
        const ro = m.roses || [['#fde3ea', '#e48aa6'], ['#fff3f0', '#e7b9b0'], ['#f9d6df', '#c9708f']];
        c.fillStyle = m.paper || '#fbf2ec'; c.fillRect(0, 0, W, H);
        glow(c, 540, 900, 800, 'rgba(255,255,255,.7)');
        for (let i = 0; i < 5000; i++) { c.fillStyle = `rgba(150,100,90,${R() * .05})`; c.fillRect(R() * W, R() * H, 2, 2); }
        const arch = (inset, w) => { c.beginPath(); c.moveTo(130 + inset, 1780 - inset); c.lineTo(130 + inset, 640); c.arc(540, 640, 410 - inset, Math.PI, 0); c.lineTo(950 - inset, 1780 - inset); c.closePath(); c.lineWidth = w; c.stroke(); };
        const gg = c.createLinearGradient(0, 200, W, 1800); gg.addColorStop(0, '#d8b26e'); gg.addColorStop(.5, '#f3dca4'); gg.addColorStop(1, '#b88a44');
        c.strokeStyle = gg; arch(0, 4); arch(16, 1.5);
        const bunch = (x, y, k, dir) => {
          for (let i = 0; i < 7; i++) eucalyptus(c, x, y, 260 * k, (dir > 0 ? 0 : Math.PI) + (i / 6 - .5) * 2.6 + .3 * dir);
          for (let i = 0; i < 14; i++) leaf(c, x + (R() - .5) * 340 * k, y + (R() - .5) * 340 * k, 90 * k, 26 * k, R() * TAU, R() > .5 ? '#c9a063' : '#a7bfa6');
          rose(c, x, y, 120 * k, ro[0][0], ro[0][1], R());
          rose(c, x + 150 * k * dir, y + 70 * k, 84 * k, ro[1][0], ro[1][1], R());
          rose(c, x - 40 * k * dir, y + 150 * k, 74 * k, ro[2][0], ro[2][1], R());
          rose(c, x + 120 * k * dir, y - 110 * k, 60 * k, ro[0][0], ro[0][1], R());
          for (let i = 0; i < 12; i++) blossom(c, x + (R() - .5) * 420 * k, y + (R() - .5) * 360 * k, 16 * k, '#fff', '#fff6f4', R() * 6);
        };
        bunch(150, 260, 1.15, 1); bunch(930, 1700, 1.15, -1); bunch(980, 330, .55, -1); bunch(110, 1720, .55, 1);
      },
      anim(c, t) {
        c.save(); c.globalCompositeOperation = 'lighter';
        const y = 240 + ((t * 120) % 1700);
        glow(c, 130, y, 60, 'rgba(255,240,200,.35)'); glow(c, 950, H - y, 60, 'rgba(255,240,200,.35)');
        c.restore();
      },
      fx(c, t) { petals(c, t, 16, ['#f4b6c8', '#f8d0dc', '#e89ab4'], 41); sparks(c, t, 14, '#d9b26e', 12); },
      moods: [
        { key: 'sage', mood: 'Sage', m: { paper: '#eef2ea', roses: [['#ffffff', '#c9d6c0'], ['#f6f1e4', '#d8c9a8'], ['#fbe9ec', '#d9a6b4']] }, col: { names: '#4f6b4a', ink: '#3a4636', ink2: '#5a6a56', accent: '#8a7a4a' } },
        { key: 'peach', mood: 'Peach Gold', m: { paper: '#fdf3e7', roses: [['#ffe3cc', '#f2a477'], ['#fff4e6', '#f0c9a0'], ['#ffd9c2', '#e48a62']] }, col: { names: '#b0532e', ink: '#4a2e22', ink2: '#6e4a3a', accent: '#c08a3a' } }
      ],
      crest(c, x, y, t) {
        for (const d of [-1, 1]) eucalyptus(c, x + d * 30, y + 150, 170, d < 0 ? Math.PI + .25 : -.25);
        rose(c, x, y + 140, 58, '#fde3ea', '#e48aa6', t * .1);
        rose(c, x - 64, y + 166, 34, '#fff3f0', '#e7b9b0'); rose(c, x + 64, y + 166, 34, '#f9d6df', '#c9708f');
      }
    },

    temple: {
      name: 'Temple Gateway', mood: 'Sunrise', note: 'Gopuram, banana leaves, jasmine, brass lamps',
      col: { names: '#9b1d20', ink: '#3b1f0e', ink2: '#5a3a1c', accent: '#a0521d', gold: '#b8862b' },
      mono: [['#e0583a', '#9b1d20'], ['#e9b949', '#a0681d']],
      font: { script: 'Playball', serif: 'Marcellus' }, zone: [380, 1330, 720], shadow: ['rgba(255,248,232,.92)', 14], music: 'royal',
      back(c, R, m) {
        sky(c, m.sky || [[0, '#fde8bd'], [.45, '#f7c886'], [.75, '#eb9a5a'], [1, '#c8643a']]);
        glow(c, 540, 760, 560, 'rgba(255,244,214,.75)');
        gopuram(c, 540, 1300, 600, m.stone || '#e3b27a', m.shade || '#b37a45');
        c.fillStyle = 'rgba(253,236,200,.42)'; c.fillRect(0, 500, W, 820);
        c.fillStyle = stoneGrad(c, 0, W, m.stone || '#e3b27a', m.shade || '#b37a45'); c.fillRect(0, 1300, W, 120);
        for (let x = 0; x < W; x += 60) { c.fillStyle = 'rgba(120,60,20,.2)'; c.fillRect(x, 1300, 3, 120); }
        const fg = c.createLinearGradient(0, 1420, 0, H); fg.addColorStop(0, m.floor || '#efcfa0'); fg.addColorStop(1, m.floor2 || '#c98d5a');
        c.fillStyle = fg; c.fillRect(0, 1420, W, H - 1420);
        c.fillStyle = '#fffaf0';
        for (let i = -6; i <= 6; i++) for (let j = -3; j <= 3; j++) {
          if (Math.abs(i) + Math.abs(j) * 2 > 7) continue;
          const px = 540 + i * 34, py = 1800 + j * 34;
          c.beginPath(); c.arc(px, py, 4.5, 0, TAU); c.fill();
          c.strokeStyle = 'rgba(255,250,240,.85)'; c.lineWidth = 2.5; c.beginPath(); c.arc(px, py, 15, 0, TAU); c.stroke();
        }
        glow(c, 540, 900, 520, 'rgba(255,248,232,.8)');
        banana(c, 30, 1760, 380, 1, R); banana(c, 1050, 1760, 380, -1, R);
        banana(c, 150, 1800, 280, 1, R); banana(c, 930, 1800, 280, -1, R);
        lampBody(c, 170, 1860, 300); lampBody(c, 910, 1860, 300);
      },
      anim(c, t) {
        for (let i = 0; i < 12; i++) jasmine(c, 40 + i * 91, -10, 170 + (i % 3) * 70 + (i === 0 || i === 11 ? 120 : 0), Math.sin(t * 1.2 + i * .7));
        lampFlames(c, 170, 1860, 300, t); lampFlames(c, 910, 1860, 300, t);
      },
      fx(c, t) { petals(c, t, 14, ['#fffaf0', '#ff8c3a', '#ffd166'], 51, .9); motes(c, t, 10, 'rgba(255,220,150,A)', 6); },
      crest(c, x, y) { kalash(c, x, y + 200, 200); },
      moods: [
        { key: 'lamps', mood: 'Evening Lamps', tint: [['multiply', ['#3a2a5c', '#24163c'], .78]],
          col: { names: '#ffd27a', ink: '#fff2dc', ink2: '#f0d9b5', accent: '#ffb46b', gold: '#f2c14e' }, shadow: ['rgba(20,8,30,.85)', 16], mono: [['#ffe29a', '#f2a900'], ['#ffb38a', '#ff6a3c']] },
        { key: 'sandal', mood: 'Sandalwood', m: { sky: [[0, '#f6ead8'], [.5, '#e8d2b0'], [1, '#c9a27a']], stone: '#e8cfa6', shade: '#b8925e', floor: '#f1dfc2', floor2: '#cfa977' },
          col: { names: '#7a3b12', ink: '#3a2414', ink2: '#5c4027', accent: '#8a5a2a', gold: '#a8782a' } }
      ]
    },

    haveli: {
      name: 'Haveli Doors', mood: 'Sandstone', note: 'Carved doors open onto a lit courtyard',
      col: { names: '#8a1c1c', ink: '#3a2414', ink2: '#5c4027', accent: '#a0522d', gold: '#b8862b' },
      mono: [['#d9534f', '#8a1c1c'], ['#e9b949', '#9a6a1a']],
      font: { script: 'Cookie', serif: 'Gilda Display' }, zone: [470, 1400, 600], shadow: ['rgba(255,246,226,.9)', 12], music: 'royal',
      back(c, R, m) {
        const wall = m.wall || '#e7c08e', wall2 = m.wall2 || '#c9945c', wood = m.wood || ['#3a160a', '#7a3518', '#3a160a'];
        const wg = c.createLinearGradient(0, 0, W, 0); wg.addColorStop(0, wall2); wg.addColorStop(.5, wall); wg.addColorStop(1, wall2);
        c.fillStyle = wg; c.fillRect(0, 0, W, H);
        for (let i = 0; i < 3000; i++) { c.fillStyle = `rgba(90,50,20,${R() * .06})`; c.fillRect(R() * W, R() * H, 3, 3); }
        const l = 190, r = 890, spring = 720, apex = 360;
        c.save(); c.beginPath(); archPath(c, l, r, spring, apex, 1720, 0); c.clip();
        const cg = c.createRadialGradient(540, 900, 50, 540, 900, 700); cg.addColorStop(0, '#fff6dc'); cg.addColorStop(.6, '#f9dca0'); cg.addColorStop(1, '#e7a95c');
        c.fillStyle = cg; c.fillRect(0, 0, W, H);
        c.strokeStyle = 'rgba(150,90,40,.25)'; c.lineWidth = 3;
        for (const ax of [330, 540, 750]) { c.beginPath(); c.moveTo(ax - 70, 1400); c.lineTo(ax - 70, 1150); c.quadraticCurveTo(ax, 1040, ax + 70, 1150); c.lineTo(ax + 70, 1400); c.stroke(); }
        c.fillStyle = 'rgba(200,140,80,.25)'; c.fillRect(0, 1400, W, 400);
        for (let k = -8; k <= 8; k++) { c.beginPath(); c.moveTo(540 + k * 20, 1400); c.lineTo(540 + k * 120, 1720); c.stroke(); }
        c.restore();
        for (const d of [-1, 1]) {
          const ex = d < 0 ? l : r, ox = d < 0 ? 30 : 1050;
          const dg = c.createLinearGradient(Math.min(ex, ox), 0, Math.max(ex, ox), 0); wood.forEach((col, i) => dg.addColorStop(i / (wood.length - 1), col));
          c.fillStyle = dg; c.beginPath(); c.moveTo(ex, 600); c.lineTo(ox, 520); c.lineTo(ox, 1840); c.lineTo(ex, 1730); c.closePath(); c.fill();
          c.strokeStyle = 'rgba(255,210,140,.25)'; c.lineWidth = 3;
          for (const [y0, y1] of [[640, 1060], [1110, 1660]]) {
            const f = (y, x) => y + (x - ex) / (ox - ex) * (y === y0 ? -60 : 80);
            const xa = ex + (ox - ex) * .2, xb = ex + (ox - ex) * .8;
            c.beginPath(); c.moveTo(xa, f(y0, xa)); c.lineTo(xb, f(y0, xb)); c.lineTo(xb, f(y1, xb)); c.lineTo(xa, f(y1, xa)); c.closePath(); c.stroke();
          }
          c.fillStyle = '#e9c46a';
          for (let y = 660; y < 1700; y += 80) for (let u = .3; u < .8; u += .25) { const sx = ex + (ox - ex) * u; c.beginPath(); c.arc(sx, y + (u - .2) * (d < 0 ? -40 : -40), 5, 0, TAU); c.fill(); }
        }
        c.beginPath(); archPath(c, l - 30, r + 30, spring, apex - 40, 1740, 0); c.strokeStyle = 'rgba(120,70,30,.6)'; c.lineWidth = 10; c.stroke();
        archPts(l - 30, r + 30, spring, apex - 40, 20).forEach(([x, y], i) => blossom(c, x, y, 14, 'rgba(160,100,50,.8)', 'rgba(250,225,180,.9)', i, 6));
        c.fillStyle = '#7a4a1a'; c.fillRect(110, 270, 860, 7);
        for (let x = 120; x < 970; x += 34) { leaf(c, x, 277, 70, 16, Math.PI / 2 + (x % 68 ? .1 : -.1), x % 68 ? '#2e7d32' : '#4caf50'); }
        for (let x = 137; x < 970; x += 68) marigold(c, x, 300, 14, x % 136 === 137 % 136 ? 28 : 38);
        const st = c.createLinearGradient(0, 1720, 0, H); st.addColorStop(0, wall); st.addColorStop(1, wall2);
        c.fillStyle = st; c.fillRect(0, 1730, W, H - 1730);
        c.fillStyle = 'rgba(90,50,20,.25)'; c.fillRect(0, 1730, W, 8);
        rangoli(c, 540, 1900, 200);
        kalash(c, 110, 1890, 190); kalash(c, 970, 1890, 190);
        glow(c, 540, 930, 420, 'rgba(255,248,226,.55)');
      },
      anim(c, t) { [330, 430, 650, 750].forEach((x, i) => diya(c, x, 1790, 38, t + i)); },
      fx(c, t) { petals(c, t, 14, ['#ff9800', '#ffc107', '#e53935'], 61); motes(c, t, 10, 'rgba(255,210,140,A)', 7); },
      crest(c, x, y) { kandil(c, x, y, 190); },
      moods: [
        { key: 'blue', mood: 'Blue City', m: { wall: '#7fa8dc', wall2: '#4f78b0', wood: ['#1c2a4a', '#3b5a8a', '#1c2a4a'] },
          col: { names: '#8a1c3c', ink: '#22253a', ink2: '#3c4258', accent: '#2c5a9a', gold: '#b8862b' } },
        { key: 'pink', mood: 'Pink City', m: { wall: '#eea58c', wall2: '#c9705a', wood: ['#4a1a10', '#8a3a22', '#4a1a10'] },
          col: { names: '#9c1f3c', ink: '#3a1e1a', ink2: '#5a3530', accent: '#b0472f', gold: '#b8862b' } }
      ]
    },

    mehendi: {
      name: 'Mehendi Mandala', mood: 'Henna', note: 'Henna mandala, paisleys and lace borders',
      col: { names: '#7a2e0e', ink: '#4a2a12', ink2: '#6b4a2a', accent: '#3f6b2a', gold: '#a86f22' },
      mono: [['#c0612a', '#7a2e0e'], ['#6b9a3a', '#2f5a1a']],
      font: { script: 'Satisfy', serif: 'Marcellus' }, zone: [420, 1460, 760], shadow: ['rgba(250,244,226,.95)', 12], music: 'festive',
      back(c, R, m) {
        const bg = m.bg || ['#f6efd9', '#e6d6ad'], line = m.line || '#8a3b12';
        const g = c.createRadialGradient(540, 900, 80, 540, 900, 1150); g.addColorStop(0, bg[0]); g.addColorStop(1, bg[1]);
        c.fillStyle = g; c.fillRect(0, 0, W, H);
        for (let i = 0; i < 4000; i++) { c.fillStyle = `rgba(120,80,30,${R() * .05})`; c.fillRect(R() * W, R() * H, 2, 2); }
        c.globalAlpha = .28; henna(c, 540, 930, 560, line); c.globalAlpha = 1;
        hennaBorder(c, 120, line, false); hennaBorder(c, H - 120, line, true);
        c.fillStyle = line; c.fillRect(0, 60, W, 4); c.fillRect(0, H - 64, W, 4);
        paisley(c, 120, 300, 130, -.5, line); paisley(c, 960, 300, 130, .5 + Math.PI, line);
        paisley(c, 120, 1620, 130, .4 + Math.PI, line); paisley(c, 960, 1620, 130, -.4, line);
        for (const [x, y] of [[70, 960], [1010, 960]]) { c.globalAlpha = .7; mandala(c, x, y, 120, line); c.globalAlpha = 1; }
        glow(c, 540, 930, 470, `rgba(${m.glow || '252,247,232'},.85)`);
      },
      anim(c, t) {
        c.save(); c.globalAlpha = .45; mandala(c, 540, 930, 150, (this.m && this.m.line) || '#8a3b12', t * .12); c.restore();
      },
      fx(c, t) { petals(c, t, 14, ['#c0612a', '#e8a33a', '#6b9a3a'], 71, .9); sparks(c, t, 8, '#c08a3a', 13); },
      crest(c, x, y, t) { c.globalAlpha *= .9; paisley(c, x - 60, y + 120, 70, -.9, this.col.accent); paisley(c, x + 60, y + 120, 70, .9 + Math.PI, this.col.accent); blossom(c, x, y + 150, 26, this.col.names, '#fff', t * .2, 8); },
      moods: [
        { key: 'green', mood: 'Mehendi Green', m: { bg: ['#3d5a2a', '#1f3314'], line: '#e2c27a', glow: '40,62,30' },
          col: { names: '#ffe3a0', ink: '#fbf2da', ink2: '#e6dcb8', accent: '#f0c46a', gold: '#e2c27a' }, shadow: ['rgba(10,25,5,.85)', 14], mono: [['#fff0c0', '#e2b25a'], ['#d8f0a8', '#9cc25a']] },
        { key: 'rani', mood: 'Rani Pink', m: { bg: ['#fbe4ea', '#f0bccb'], line: '#a0284f', glow: '253,240,244' },
          col: { names: '#a0284f', ink: '#4a1a2c', ink2: '#6e3a4c', accent: '#c2185b', gold: '#b8862b' }, mono: [['#f06292', '#a0284f'], ['#e9b949', '#a0681d']] }
      ]
    },

    party: {
      name: 'Confetti Party', mood: 'Candy', note: 'Balloons, bunting and a cake with candles',
      col: { names: '#ffffff', ink: '#ffffff', ink2: '#fde8ff', accent: '#ffe066', gold: '#ffd36e' },
      mono: [['#fff7b0', '#ffc93c'], ['#ffffff', '#ffd0f0']],
      font: { script: 'Pacifico', serif: 'Fredoka' }, zone: [330, 1330, 840], shadow: ['rgba(70,10,100,.6)', 16], music: 'festive',
      m: { cake1: '#fff0f6', cake2: '#ffd6e8', icing: '#ff7eb6' },
      back(c, R, m) {
        sky(c, m.sky || [[0, '#ff9ec7'], [.5, '#c08cff'], [1, '#7a5cff']]);
        for (let i = 0; i < 26; i++) glow(c, R() * W, R() * H, 40 + R() * 110, `rgba(255,255,255,${(.08 + R() * .12).toFixed(2)})`);
        bunting(c, -20, 560, 60, 120, ['#ffd166', '#06d6a0', '#ef476f', '#118ab2', '#fff']);
        bunting(c, 520, 1100, 60, 120, ['#ef476f', '#ffd166', '#118ab2', '#06d6a0', '#fff']);
        cake(c, 540, 1860, 380, { cake1: m.cake1 || '#fff0f6', cake2: m.cake2 || '#ffd6e8', icing: m.icing || '#ff7eb6' }, R);
        giftBox(c, 150, 1890, 170, 150, '#ef476f', '#ffd166'); giftBox(c, 280, 1900, 110, 100, '#118ab2', '#fff');
        giftBox(c, 930, 1890, 170, 150, '#06d6a0', '#ef476f'); giftBox(c, 800, 1900, 110, 100, '#ffd166', '#118ab2');
        glow(c, 540, 830, 520, `rgba(${m.glow || '120,40,160'},.18)`);
      },
      anim(c, t) {
        const cols = ['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#ff9ec7', '#c08cff'];
        for (let i = 0; i < 8; i++) {
          const R = rng(200 + i), x0 = 60 + R() * 960, sp = 40 + R() * 40, r = 46 + R() * 22;
          const y = H + 200 - ((t * sp + R() * 2200) % 2400), x = x0 + Math.sin(t * .6 + i) * 40;
          balloon(c, x, y, r, cols[i % cols.length], t * 1.5 + i);
        }
        const top = 1860 - 380 * (.32 + .28 + .24);
        for (const dx of [-50, 0, 50]) {
          c.fillStyle = ['#ffd166', '#118ab2', '#ef476f'][(dx / 50 + 1)]; c.fillRect(540 + dx - 6, top - 66, 12, 62);
          flame(c, 540 + dx, top - 66, 34, t, dx);
        }
      },
      fx(c, t) { confetti(c, t, 40, ['#ffd166', '#06d6a0', '#ef476f', '#118ab2', '#fff'], 81); sparks(c, t, 12, '#fff6c0', 17); },
      crest(c, x, y, t) {
        [[-70, 120, '#ef476f'], [0, 90, '#ffd166'], [70, 120, '#06d6a0']].forEach(([dx, dy, col], i) => balloon(c, x + dx, y + dy, 42, col, t * 2 + i));
      },
      moods: [
        { key: 'neon', mood: 'Midnight Neon', m: { sky: [[0, '#0d0628'], [.5, '#2a0d52'], [1, '#4a0f6b']], cake1: '#2a1a4a', cake2: '#3a1f63', icing: '#ff4fd8', glow: '255,79,216' },
          col: { names: '#ff8ae2', ink: '#ffffff', ink2: '#e6d9ff', accent: '#5ef0ff', gold: '#ffd36e' }, mono: [['#ff9ff0', '#ff4fd8'], ['#a8f6ff', '#3ad6ff']] },
        { key: 'sunshine', mood: 'Sunshine', m: { sky: [[0, '#ffe29a'], [.55, '#ffb36b'], [1, '#ff7a59']], cake1: '#fffaf0', cake2: '#fff0c2', icing: '#ff8a5c', glow: '160,60,20' },
          col: { names: '#ffffff', ink: '#ffffff', ink2: '#fff3e0', accent: '#7a2a00', gold: '#fff3c4' }, shadow: ['rgba(120,40,0,.55)', 14] }
      ]
    }
,

    beach: {
      name: 'Beach Sunset', mood: 'Golden Shore', note: 'Sea at sunset, palms, gulls and fairy lights',
      col: { names: '#b83a4b', ink: '#4a2a2a', ink2: '#6a4040', accent: '#c25a2a', gold: '#c08a3a' },
      mono: [['#ff9a8b', '#c2185b'], ['#ffc46b', '#d9772a']],
      font: { script: 'Playball', serif: 'Gilda Display' }, zone: [300, 1060, 840], shadow: ['rgba(255,244,230,.9)', 14], music: 'romantic',
      back(c, R, m) {
        sky(c, m.sky || [[0, '#ffb39a'], [.35, '#ffd2a8'], [.6, '#ffe7c0']], 0, 1160);
        glow(c, 540, 1150, 520, 'rgba(255,230,170,.75)');
        c.fillStyle = '#fff1c8'; c.beginPath(); c.arc(540, 1160, 140, Math.PI, 0); c.fill();
        sky(c, [[0, '#4a86c8'], [1, '#2a5d9a']], 1160, 1520);
        for (let i = 0; i < 60; i++) { const y = 1170 + R() * 330, w = 30 + R() * 180 * (1 - (y - 1160) / 400); c.fillStyle = `rgba(255,225,170,${(.5 - (y - 1160) / 800).toFixed(2)})`; c.fillRect(540 - w / 2 + (R() - .5) * 120, y, w, 3); }
        const sg = c.createLinearGradient(0, 1500, 0, H); sg.addColorStop(0, '#f6dcaa'); sg.addColorStop(1, '#e0b97e');
        c.fillStyle = sg; c.beginPath(); c.moveTo(0, 1540); c.quadraticCurveTo(540, 1470, W, 1540); c.lineTo(W, H); c.lineTo(0, H); c.fill();
        c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, 1545); c.quadraticCurveTo(540, 1475, W, 1545); c.stroke();
        for (let i = 0; i < 14; i++) { const x = 80 + R() * 920, y = 1640 + R() * 240; c.fillStyle = R() > .5 ? '#f4a3a3' : '#fff3e0'; c.beginPath(); c.ellipse(x, y, 10, 7, R() * 3, 0, TAU); c.fill(); }
        palm(c, 40, 1760, 520, .35, R); palm(c, 1040, 1780, 470, -.35, R);
        glow(c, 540, 720, 480, 'rgba(255,248,236,.55)');
      },
      anim(c, t) {
        for (let i = 0; i < 4; i++) { const x = ((t * (30 + i * 8) + i * 300) % (W + 200)) - 100; gull(c, x, 260 + i * 70 + Math.sin(t + i) * 12, 22, t * 5 + i); }
        for (let i = 0; i < 5; i++) { const y = 1190 + i * 60, dx = Math.sin(t * 1.5 + i) * 20; c.fillStyle = 'rgba(255,240,200,.25)'; c.fillRect(470 + dx, y, 140 - i * 14, 3); }
        bulbs(c, -20, 1100, 40, 110, t, 18, ['rgba(255,236,170,A)'], 1);
      },
      fx(c, t) { motes(c, t, 14, 'rgba(255,240,200,A)', 91, 10); },
      crest(c, x, y) {
        c.strokeStyle = this.col.gold; c.lineWidth = 4;
        c.beginPath(); c.arc(x, y + 170, 60, Math.PI, 0); c.stroke();
        for (let k = 0; k < 9; k++) { const a = Math.PI + k / 8 * Math.PI; c.beginPath(); c.moveTo(x + Math.cos(a) * 74, y + 170 + Math.sin(a) * 74); c.lineTo(x + Math.cos(a) * 96, y + 170 + Math.sin(a) * 96); c.stroke(); }
        for (let k = 0; k < 2; k++) { c.beginPath(); for (let i = 0; i <= 20; i++) { const px = x - 110 + i * 11, py = y + 190 + k * 18 + Math.sin(i * .9) * 6; i ? c.lineTo(px, py) : c.moveTo(px, py); } c.stroke(); }
      }
    },

    himalaya: {
      name: 'Himalayan Mandap', mood: 'Snow Peaks', note: 'Snowy mountains, pines, prayer flags',
      col: { names: '#7a2e3a', ink: '#2c3a4a', ink2: '#4a5a6a', accent: '#2f6b5a', gold: '#a8782a' },
      mono: [['#d9617a', '#7a2e3a'], ['#5fa8a0', '#2f6b5a']],
      font: { script: 'Dancing Script', serif: 'Marcellus' }, zone: [420, 1380, 820], shadow: ['rgba(250,252,255,.9)', 14], music: 'romantic',
      back(c, R, m) {
        sky(c, m.sky || [[0, '#bcd7f0'], [.45, '#e8f0f6'], [1, '#f6f1e6']]);
        range(c, R, 900, 380, 8, '#9fb6cf', '#ffffff');
        c.fillStyle = 'rgba(236,242,248,.45)'; c.fillRect(0, 500, W, 700);
        range(c, R, 1180, 260, 10, '#7e98b3', '#f4f8fc');
        c.fillStyle = 'rgba(236,242,248,.35)'; c.fillRect(0, 900, W, 500);
        for (let i = 0; i < 40; i++) pine(c, R() * W, 1400 + R() * 60, 140 + R() * 80, `hsl(${150 + R() * 20},30%,${22 + R() * 10}%)`);
        const mg = c.createLinearGradient(0, 1450, 0, H); mg.addColorStop(0, '#8fb27a'); mg.addColorStop(1, '#5d8a4a');
        c.fillStyle = mg; c.fillRect(0, 1460, W, H - 1460);
        for (let i = 0; i < 14; i++) pine(c, i % 2 ? 30 + R() * 160 : W - 30 - R() * 160, 1700 + R() * 200, 260 + R() * 120, `hsl(${145 + R() * 20},35%,${18 + R() * 8}%)`);
        const mx = 540, my = 1840;
        c.fillStyle = '#7a4a24'; for (const dx of [-170, 170]) c.fillRect(mx + dx - 9, my - 230, 18, 230);
        c.fillStyle = '#8a5a2e'; c.beginPath(); c.moveTo(mx - 220, my - 230); c.lineTo(mx + 220, my - 230); c.lineTo(mx + 150, my - 300); c.lineTo(mx - 150, my - 300); c.closePath(); c.fill();
        for (let i = 0; i <= 12; i++) { const u = i / 12; marigold(c, mx - 180 + u * 360, my - 220 + Math.sin(u * Math.PI) * 40, 12, i % 2 ? 38 : 28); }
        glow(c, 540, 880, 520, 'rgba(250,252,255,.7)');
      },
      anim(c, t) {
        flagLine(c, -20, 560, 70, 120, t, ['#1e5bd8', '#ffffff', '#d62828', '#2a9d4a', '#f4c20d']);
        flagLine(c, 520, 1100, 70, 120, t + 1, ['#1e5bd8', '#ffffff', '#d62828', '#2a9d4a', '#f4c20d']);
        for (let i = 0; i < 3; i++) cloud(c, ((t * 12 + i * 420) % (W + 400)) - 200, 360 + i * 110, 60, 'rgba(255,255,255,.55)');
      },
      fx(c, t) { petals(c, t, 12, ['#ffffff', '#f4c20d', '#ffb3c6'], 101, .8); },
      crest(c, x, y) {
        c.fillStyle = this.col.accent; c.beginPath(); c.moveTo(x - 110, y + 200); c.lineTo(x - 30, y + 90); c.lineTo(x + 10, y + 140); c.lineTo(x + 50, y + 100); c.lineTo(x + 110, y + 200); c.closePath(); c.fill();
        c.fillStyle = '#fff'; c.beginPath(); c.moveTo(x - 30, y + 90); c.lineTo(x - 48, y + 115); c.lineTo(x - 14, y + 112); c.closePath(); c.fill();
        glow(c, x + 70, y + 70, 40, 'rgba(255,200,90,.7)'); c.fillStyle = '#ffc94d'; c.beginPath(); c.arc(x + 70, y + 70, 18, 0, TAU); c.fill();
      }
    },

    lights: {
      name: 'Fairy-light Garden', mood: 'Twilight', note: 'String lights and paper lanterns over a lawn at night',
      col: { names: '#ffe2a0', ink: '#f6efdc', ink2: '#d9d0b8', accent: '#9fe0c0', gold: '#f2c46a' },
      mono: [['#fff0c0', '#e8b44a'], ['#c8f5e0', '#5fc7a0']],
      font: { script: 'Playball', serif: 'Gilda Display' }, zone: [400, 1360, 820], shadow: ['rgba(5,15,20,.85)', 16], music: 'romantic',
      back(c, R, m) {
        sky(c, m.sky || [[0, '#0b1a2a'], [.6, '#143246'], [1, '#1d3d3a']]);
        for (let i = 0; i < 90; i++) { c.fillStyle = `rgba(255,255,255,${(R() * .6).toFixed(2)})`; c.beginPath(); c.arc(R() * W, R() * 700, 1 + R() * 1.6, 0, TAU); c.fill(); }
        for (const side of [0, 1]) for (let k = 0; k < 3; k++) foliage(c, R, side ? W - 60 - k * 40 : 60 + k * 40, 500 + k * 380, 220, 300, 500, 150, 10 + k * 3, 46, 30);
        const lg = c.createLinearGradient(0, 1500, 0, H); lg.addColorStop(0, '#1f4a36'); lg.addColorStop(1, '#0f2a1e');
        c.fillStyle = lg; c.fillRect(0, 1500, W, H - 1500);
        for (let i = 0; i < 30; i++) glow(c, R() * W, 1500 + R() * 400, 30 + R() * 60, 'rgba(255,210,140,.08)');
        glow(c, 540, 880, 460, 'rgba(10,25,30,.35)');
      },
      anim(c, t) {
        const cols = ['rgba(255,230,160,A)', 'rgba(255,200,140,A)', 'rgba(255,245,210,A)'];
        bulbs(c, -40, 1120, 40, 160, t, 20, cols, 0);
        bulbs(c, -40, 1120, 200, 120, t, 18, cols, 2);
        bulbs(c, -40, 1120, 1450, -60, t, 18, cols, 4);
        [[150, 320, '#ffb36b'], [930, 300, '#ff8ab0'], [300, 470, '#ffd27a'], [780, 460, '#9fe0c0'], [120, 1300, '#ffd27a'], [960, 1320, '#ffb36b']]
          .forEach(([x, y, col], i) => paperLantern(c, x + Math.sin(t + i) * 5, y, 46, col, .7 + .3 * Math.sin(t * 3 + i)));
      },
      fx(c, t) { motes(c, t, 26, 'rgba(255,230,150,A)', 111, 14); },
      crest(c, x, y, t) { paperLantern(c, x, y + 160, 60, '#ffb36b', .8 + .2 * Math.sin(t * 3)); }
    },

    mandap: {
      name: 'Floral Mandap', mood: 'Blush Drapes', note: 'Gold pillars, sheer drapes, garlands and the sacred fire',
      col: { names: '#a21f45', ink: '#4a2232', ink2: '#6a3a4a', accent: '#b8862b', gold: '#b8862b' },
      mono: [['#f06292', '#a21f45'], ['#f2c46a', '#a8782a']],
      font: { script: 'Satisfy', serif: 'Marcellus' }, zone: [470, 1420, 600], shadow: ['rgba(255,248,246,.92)', 12], music: 'royal',
      back(c, R, m) {
        sky(c, m.sky || [[0, '#fbe9ea'], [.6, '#fdf4ef'], [1, '#f3d9cf']]);
        glow(c, 540, 900, 600, 'rgba(255,255,255,.7)');
        const fl = c.createLinearGradient(0, 1600, 0, H); fl.addColorStop(0, '#f1d5c6'); fl.addColorStop(1, '#ddb39e');
        c.fillStyle = fl; c.fillRect(0, 1600, W, H - 1600);
        for (let i = 0; i < 120; i++) { c.fillStyle = ['#e85d75', '#ffffff', '#f6b93b', '#f48fb1'][i % 4]; c.beginPath(); c.ellipse(240 + R() * 600, 1700 + R() * 200, 8, 5, R() * 3, 0, TAU); c.fill(); }
        pillar(c, 170, 300, 1700, 46); pillar(c, 910, 300, 1700, 46);
        c.fillStyle = brass(c, 100, 980); c.beginPath(); c.moveTo(80, 300); c.lineTo(1000, 300); c.lineTo(1000, 260); c.quadraticCurveTo(540, 120, 80, 260); c.closePath(); c.fill();
        for (let x = 100; x < 990; x += 40) { c.fillStyle = '#c99a3a'; c.beginPath(); c.arc(x, 300, 20, 0, Math.PI); c.fill(); }
        drape(c, 80, 300, 540, 760, m.drape || 'rgba(255,214,226,.85)'); drape(c, 540, 300, 1000, 760, m.drape || 'rgba(255,214,226,.85)');
        for (const x of [130, 950]) { c.fillStyle = m.drape || 'rgba(255,214,226,.85)'; c.beginPath(); c.moveTo(x - 40, 300); c.quadraticCurveTo(x + 30, 900, x - 10, 1650); c.lineTo(x + 50, 1650); c.quadraticCurveTo(x + 70, 900, x + 40, 300); c.closePath(); c.fill(); }
        for (let i = 0; i <= 22; i++) { const u = i / 22, x = 90 + u * 900, y = 330 + Math.sin(u * Math.PI) * 60; rose(c, x, y, 18, i % 2 ? '#fff3f0' : '#f9c1cf', i % 2 ? '#e7b9b0' : '#d84a74', i); }
        for (const x of [230, 340, 740, 850]) for (let k = 0; k < 9; k++) blossom(c, x, 380 + k * 38 + (x % 3) * 10, 11, k % 2 ? '#ffffff' : '#f48fb1', '#fff', k, 5, true);
      },
      anim(c, t) { havan(c, 540, 1690, 90, t); },
      fx(c, t) { petals(c, t, 18, ['#e85d75', '#ffffff', '#f48fb1'], 121); sparks(c, t, 8, '#e8c46a', 19); },
      crest(c, x, y) { kalash(c, x, y + 200, 190); }
    },

    galaxy: {
      name: 'Starry Galaxy', mood: 'Milky Way', note: 'Deep space, the Milky Way and shooting stars',
      col: { names: '#f5d0ff', ink: '#f2eeff', ink2: '#cfc6ec', accent: '#9fd8ff', gold: '#e8d38a' },
      mono: [['#ffd6ff', '#c27aff'], ['#c8eeff', '#6ab8ff']],
      font: { script: 'Satisfy', serif: 'Cinzel' }, zone: [400, 1400, 860], shadow: ['rgba(5,3,20,.85)', 16], music: 'romantic',
      back(c, R, m) {
        sky(c, m.sky || [[0, '#05041a'], [.5, '#120a35'], [1, '#1f0c3a']]);
        c.save(); c.globalCompositeOperation = 'screen';
        for (let i = 0; i < 26; i++) { const u = R(), x = u * W, y = 300 + u * 1300 + (R() - .5) * 260; glow(c, x, y, 120 + R() * 200, i % 3 ? 'rgba(120,80,220,.18)' : 'rgba(255,110,190,.14)'); }
        c.restore();
        for (let i = 0; i < 900; i++) {
          const u = R(), band = R() < .6, x = band ? u * W + (R() - .5) * 200 : R() * W, y = band ? 300 + u * 1300 + (R() - .5) * 260 : R() * H;
          c.fillStyle = `rgba(255,255,255,${(.2 + R() * .8).toFixed(2)})`; c.fillRect(x, y, R() < .1 ? 2.5 : 1.5, R() < .1 ? 2.5 : 1.5);
        }
        c.fillStyle = '#f6efd6'; c.beginPath(); c.arc(860, 260, 70, 0, TAU); c.fill();
        c.fillStyle = m.sky ? m.sky[0][1] : '#05041a'; c.beginPath(); c.arc(890, 240, 64, 0, TAU); c.fill();
        glow(c, 540, 900, 520, 'rgba(5,3,20,.4)');
      },
      anim(c, t) {
        for (let i = 0; i < 50; i++) { const x = (i * 197) % W, y = (i * 389) % H, a = Math.max(0, Math.sin(t * 2 + i)); c.fillStyle = `rgba(255,255,255,${a.toFixed(2)})`; c.beginPath(); c.arc(x, y, 2.2, 0, TAU); c.fill(); }
        for (let k = 0; k < 2; k++) {
          const cyc = 4.5, p = ((t + k * 2.2) % cyc) / .9; if (p > 1) continue;
          const R = rng(Math.floor((t + k * 2.2) / cyc) * 13 + k), x = 200 + R() * 700, y = 100 + R() * 500;
          const g = c.createLinearGradient(x, y, x - 220 * p, y + 120 * p); g.addColorStop(0, `rgba(255,255,255,${(1 - p).toFixed(2)})`); g.addColorStop(1, 'rgba(255,255,255,0)');
          c.strokeStyle = g; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 260 * p, y - 140 * p); c.lineTo(x, y); c.stroke();
        }
      },
      fx(c, t) { sparks(c, t, 18, '#ffffff', 131); },
      crest(c, x, y) {
        const pts = [[0, 70], [-60, 10], [-50, -30], [-20, -40], [0, -15], [20, -40], [50, -30], [60, 10], [0, 70]].map(([dx, dy]) => [x + dx, y + 130 + dy]);
        c.strokeStyle = 'rgba(200,220,255,.7)'; c.lineWidth = 2; c.beginPath(); pts.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.stroke();
        pts.forEach(([px, py]) => { glow(c, px, py, 16, 'rgba(255,255,255,.8)'); c.fillStyle = '#fff'; c.beginPath(); c.arc(px, py, 4, 0, TAU); c.fill(); });
      }
    },

    haldi: {
      name: 'Haldi Sunshine', mood: 'Sunflower', note: 'Sunflowers, yellow garlands and haldi bowls',
      col: { names: '#b3541e', ink: '#5a3a0a', ink2: '#7a5520', accent: '#2f7a3a', gold: '#b8862b' },
      mono: [['#ffb347', '#d9661e'], ['#7cc576', '#2f7a3a']],
      font: { script: 'Cookie', serif: 'Gilda Display' }, zone: [430, 1420, 780], shadow: ['rgba(255,250,224,.95)', 14], music: 'festive',
      back(c, R, m) {
        sky(c, m.sky || [[0, '#fff7c2'], [.5, '#ffe680'], [1, '#ffcf3a']]);
        c.save(); c.globalAlpha = .18; c.translate(540, 900);
        for (let i = 0; i < 24; i++) { c.rotate(TAU / 24); c.fillStyle = i % 2 ? '#fff' : '#ffd84d'; c.beginPath(); c.moveTo(0, 0); c.lineTo(-90, -1400); c.lineTo(90, -1400); c.closePath(); c.fill(); }
        c.restore();
        c.fillStyle = '#7a4a1a'; c.fillRect(0, 34, W, 8);
        for (let x = 10; x < W; x += 36) leaf(c, x, 42, 70, 18, Math.PI / 2 + (x % 72 ? .12 : -.12), x % 72 ? '#2e7d32' : '#4caf50');
        for (const [x, n] of [[70, 24], [150, 16], [930, 16], [1010, 24]]) for (let i = 0; i < n; i++) marigold(c, x, 110 + i * 30, 16, i % 2 ? 46 : 40);
        for (const [cx, cy, d] of [[110, 1700, 1], [970, 1700, -1]]) {
          for (let i = 0; i < 6; i++) leaf(c, cx, cy + 60, 160, 44, -Math.PI / 2 + (i - 2.5) * .45 * d, '#3f8a35');
          sunflower(c, cx, cy, 110, 0); sunflower(c, cx + d * 130, cy + 90, 80, .4); sunflower(c, cx - d * 30, cy + 180, 70, .9);
        }
        for (const [x, s] of [[400, 70], [680, 70]]) {
          c.fillStyle = brass(c, x - s, x + s); c.beginPath(); c.ellipse(x, 1830, s, s * .45, 0, 0, Math.PI); c.fill();
          c.fillStyle = '#f2b705'; c.beginPath(); c.ellipse(x, 1830, s * .9, s * .2, 0, 0, TAU); c.fill();
          for (let k = 0; k < 6; k++) marigold(c, x - s * .7 + k * s * .28, 1822, 9, 30 + k % 2 * 10);
        }
        glow(c, 540, 900, 480, 'rgba(255,252,232,.8)');
      },
      anim(c, t) { for (let i = 0; i < 5; i++) butterfly(c, 200 + i * 170 + Math.sin(t * .6 + i) * 60, 1250 + Math.sin(t * .9 + i * 2) * 120, 22, t * 9 + i, i % 2 ? '#ff8c42' : '#ffffff'); },
      fx(c, t) { petals(c, t, 22, ['#ffc107', '#ff9800', '#ffffff'], 141); },
      crest(c, x, y) { sunflower(c, x, y + 140, 70, 0); for (const d of [-1, 1]) marigold(c, x + d * 95, y + 165, 26, 38); }
    },

    clouds: {
      name: 'Dreamy Clouds', mood: 'Pastel Sky', note: 'Pastel clouds, a moon and hanging stars',
      col: { names: '#6b5bd6', ink: '#3e3a6a', ink2: '#5e5a8a', accent: '#e86a9a', gold: '#d8a84a' },
      mono: [['#a99bff', '#6b5bd6'], ['#ffb3cf', '#e86a9a']],
      font: { script: 'Dancing Script', serif: 'Fredoka' }, zone: [460, 1420, 800], shadow: ['rgba(255,255,255,.95)', 14], music: 'calm',
      back(c, R, m) {
        sky(c, m.sky || [[0, '#cfe4ff'], [.55, '#f1e6ff'], [1, '#ffe1ee']]);
        c.save(); c.globalAlpha = .22; c.lineWidth = 28;
        ['#ff8fa3', '#ffc36b', '#fff17a', '#8fe39b', '#7fc8ff', '#b39bff'].forEach((col, i) => { c.strokeStyle = col; c.beginPath(); c.arc(540, 1500, 700 - i * 28, Math.PI, 0); c.stroke(); });
        c.restore();
        cloud(c, 160, 1650, 150); cloud(c, 900, 1700, 170); cloud(c, 520, 1830, 210); cloud(c, 60, 1880, 140); cloud(c, 1050, 1880, 150);
        cloud(c, 200, 300, 80, 'rgba(255,255,255,.85)'); cloud(c, 880, 420, 90, 'rgba(255,255,255,.85)');
        c.fillStyle = '#fff6c8'; c.beginPath(); c.arc(860, 250, 70, 0, TAU); c.fill();
        c.fillStyle = m.sky ? m.sky[0][1] : '#cfe4ff'; c.beginPath(); c.arc(890, 230, 62, 0, TAU); c.fill();
        glow(c, 540, 900, 460, 'rgba(255,255,255,.6)');
      },
      anim(c, t) {
        [[140, 150, '#ffd166'], [280, 260, '#ff9fbf'], [800, 180, '#a99bff'], [960, 330, '#ffd166']].forEach(([x, len, col], i) => {
          const sw = Math.sin(t * 1.4 + i) * .12;
          c.save(); c.translate(x, 0); c.rotate(sw); c.strokeStyle = 'rgba(120,110,160,.5)'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, len); c.stroke();
          c.translate(0, len + 26); c.rotate(t * .5 + i); c.fillStyle = col; c.beginPath();
          for (let k = 0; k < 10; k++) { const r = k % 2 ? 12 : 28, a = k / 10 * TAU - Math.PI / 2; k ? c.lineTo(Math.cos(a) * r, Math.sin(a) * r) : c.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
          c.closePath(); c.fill(); c.restore();
        });
        for (let i = 0; i < 2; i++) cloud(c, ((t * 10 + i * 600) % (W + 400)) - 200, 600 + i * 300, 50, 'rgba(255,255,255,.6)');
      },
      fx(c, t) { sparks(c, t, 16, '#ffffff', 151); },
      crest(c, x, y) {
        c.save(); c.beginPath(); c.arc(x, y + 140, 60, 0, TAU); c.clip();
        c.fillStyle = '#ffe9a0'; c.beginPath(); c.arc(x, y + 140, 60, 0, TAU); c.arc(x + 28, y + 122, 52, 0, TAU); c.fill('evenodd'); c.restore();
        cloud(c, x - 20, y + 200, 40);
      }
    },

    disco: {
      name: 'Disco Night', mood: 'Neon Pink', note: 'Disco ball, sweeping spotlights and a glowing dance floor',
      col: { names: '#ff7ae0', ink: '#ffffff', ink2: '#e6dcff', accent: '#5ef0ff', gold: '#ffd36e' },
      mono: [['#ffa8f0', '#ff3fd0'], ['#a8f6ff', '#2ad6ff']],
      font: { script: 'Pacifico', serif: 'Fredoka' }, zone: [470, 1380, 860], shadow: ['rgba(20,0,40,.85)', 18], music: 'festive',
      back(c, R, m) {
        sky(c, m.sky || [[0, '#0a0418'], [.6, '#1c0838'], [1, '#2a0a3a']]);
        c.strokeStyle = 'rgba(255,80,220,.6)'; c.lineWidth = 4; c.shadowColor = '#ff4fd8'; c.shadowBlur = 20; c.strokeRect(50, 230, W - 100, 1260);
        c.strokeStyle = 'rgba(80,230,255,.5)'; c.shadowColor = '#3ad6ff'; c.strokeRect(70, 250, W - 140, 1220); c.shadowBlur = 0;
        for (let i = 0; i < 8; i++) for (let j = 0; j < 7; j++) {
          const y0 = 1520 + i * (8 + i * 4), y1 = y0 + 8 + i * 4 - 2, sp = (k, y) => 540 + (k - 3.5) * (60 + (y - 1520) * .9);
          c.fillStyle = `hsla(${(i * 47 + j * 83) % 360},80%,55%,.55)`;
          c.beginPath(); c.moveTo(sp(j, y0), y0); c.lineTo(sp(j + 1, y0), y0); c.lineTo(sp(j + 1, y1), y1); c.lineTo(sp(j, y1), y1); c.closePath(); c.fill();
        }
        glow(c, 540, 880, 460, 'rgba(15,0,30,.4)');
      },
      anim(c, t) {
        c.save(); c.globalCompositeOperation = 'lighter';
        [['255,80,220', -1], ['80,220,255', 1], ['255,220,90', -.4]].forEach(([col, d], i) => {
          const a = Math.sin(t * .8 + i * 2) * .5 * d;
          c.save(); c.translate(540 + (i - 1) * 380, 0); c.rotate(a);
          const g = c.createLinearGradient(0, 0, 0, 1700); g.addColorStop(0, `rgba(${col},.35)`); g.addColorStop(1, `rgba(${col},0)`);
          c.fillStyle = g; c.beginPath(); c.moveTo(-14, 0); c.lineTo(14, 0); c.lineTo(160, 1700); c.lineTo(-160, 1700); c.fill(); c.restore();
        });
        c.restore();
        discoBall(c, 540, 150, 70, t);
      },
      fx(c, t) { confetti(c, t, 30, ['#ff4fd8', '#5ef0ff', '#ffd36e', '#ffffff'], 161); sparks(c, t, 14, '#ffffff', 23); },
      crest(c, x, y, t) { discoBall(c, x, y + 140, 54, t); }
    },

    diwali: {
      name: 'Diwali Lights', mood: 'Festive Night', note: 'Steps of diyas, sky lanterns and fireworks',
      col: { names: '#ffd27a', ink: '#fff2dc', ink2: '#f0d9b5', accent: '#ff9f6b', gold: '#f2c14e' },
      mono: [['#ffe29a', '#f2a900'], ['#ffb38a', '#ff6a3c']],
      font: { script: 'Playball', serif: 'Gilda Display' }, zone: [380, 1340, 840], shadow: ['rgba(25,5,25,.85)', 16], music: 'festive',
      back(c, R, m) {
        sky(c, m.sky || [[0, '#14092e'], [.6, '#3a0f3a'], [1, '#5a1626']]);
        for (let i = 0; i < 120; i++) { c.fillStyle = `rgba(255,240,220,${(R() * .5).toFixed(2)})`; c.beginPath(); c.arc(R() * W, R() * 900, 1 + R() * 1.4, 0, TAU); c.fill(); }
        for (let k = 0; k < 3; k++) { c.fillStyle = `hsl(20,35%,${22 - k * 5}%)`; c.fillRect(0, 1560 + k * 120, W, 120); c.fillStyle = 'rgba(255,200,140,.15)'; c.fillRect(0, 1560 + k * 120, W, 6); }
        rangoli(c, 540, 1920, 180);
        glow(c, 540, 860, 480, 'rgba(25,5,25,.35)');
      },
      anim(c, t) {
        for (let k = 0; k < 3; k++) for (let i = 0; i < 9; i++) { const x = 70 + i * 117 + (k % 2) * 58; if (k === 2 && Math.abs(x - 540) < 200) continue; diya(c, x, 1580 + k * 120, 30, t + i + k); }
        for (let i = 0; i < 7; i++) {
          const R = rng(300 + i), x0 = R() * W, sp = 18 + R() * 20, s = 18 + R() * 12, y = 1500 - ((t * sp + R() * 1500) % 1600), x = x0 + Math.sin(t * .5 + i) * 30;
          glow(c, x, y, s * 3, 'rgba(255,170,80,.35)');
          c.fillStyle = '#ffb35c'; c.beginPath(); c.moveTo(x - s * .55, y - s); c.lineTo(x + s * .55, y - s); c.lineTo(x + s * .4, y + s); c.lineTo(x - s * .4, y + s); c.closePath(); c.fill();
        }
        for (let k = 0; k < 2; k++) {
          const cyc = 3, n = Math.floor((t + k * 1.5) / cyc), p = ((t + k * 1.5) % cyc) / 1.5;
          if (p <= 1) { const R = rng(n * 5 + k); burst(c, 150 + R() * 780, 140 + R() * 220, p, R() > .5 ? '255,214,120' : '255,120,170'); }
        }
      },
      fx(c, t) { sparks(c, t, 16, '#ffd77a', 171); },
      crest(c, x, y, t) { diya(c, x, y + 170, 90, t); }
    },

    rosegarden: {
      name: 'Rose Garden', mood: 'Spring', note: 'A rose arbour, lawn and lovebirds',
      col: { names: '#b02a4a', ink: '#3a2a2a', ink2: '#5a4040', accent: '#3f7a3a', gold: '#b8862b' },
      mono: [['#f06a8a', '#b02a4a'], ['#7cc576', '#3f7a3a']],
      font: { script: 'Dancing Script', serif: 'Gilda Display' }, zone: [470, 1420, 640], shadow: ['rgba(255,252,246,.92)', 12], music: 'romantic',
      back(c, R, m) {
        sky(c, m.sky || [[0, '#e8f4e6'], [.6, '#f8f6ee'], [1, '#e2eed8']]);
        glow(c, 540, 900, 560, 'rgba(255,255,250,.8)');
        const lg = c.createLinearGradient(0, 1560, 0, H); lg.addColorStop(0, '#a8cc8a'); lg.addColorStop(1, '#6e9e56');
        c.fillStyle = lg; c.beginPath(); c.moveTo(0, 1600); c.quadraticCurveTo(540, 1540, W, 1600); c.lineTo(W, H); c.lineTo(0, H); c.fill();
        const pts = archPts(160, 920, 760, 300, 60);
        for (const [x, y] of [...pts, ...Array.from({ length: 24 }, (_, i) => [160, 760 + i * 40]), ...Array.from({ length: 24 }, (_, i) => [920, 760 + i * 40])]) {
          for (let k = 0; k < 4; k++) leaf(c, x + (R() - .5) * 50, y + (R() - .5) * 50, 40 + R() * 20, 14, R() * TAU, `hsl(${100 + R() * 25},${40 + R() * 15}%,${28 + R() * 14}%)`, false);
          if (R() < .35) rose(c, x + (R() - .5) * 40, y + (R() - .5) * 40, 20 + R() * 10, R() > .5 ? '#ffd6e0' : '#ff8fab', R() > .5 ? '#e05a7a' : '#c0304f', R() * 6);
        }
        for (const side of [0, 1]) for (let i = 0; i < 8; i++) { const x = side ? W - 40 - R() * 180 : 40 + R() * 180, y = 1640 + R() * 220; foliage(c, R, x, y, 60, 40, 30, 110, 30, 30); rose(c, x, y - 20, 22, '#ffd6e0', '#e05a7a', R() * 6); }
        c.strokeStyle = '#6a4a2a'; c.lineWidth = 8; c.beginPath(); c.moveTo(0, 220); c.quadraticCurveTo(160, 200, 300, 240); c.stroke();
        foliage(c, R, 80, 200, 140, 60, 90, 105, 32, 34);
        lovebird(c, 190, 205, 46, 1, '#5fbf6a'); lovebird(c, 255, 212, 46, -1, '#ff8a5c');
      },
      anim(c, t) { butterfly(c, 380 + Math.sin(t * .5) * 180, 1300 + Math.sin(t * .8) * 100, 26, t * 9, '#ffb3c6'); butterfly(c, 720 + Math.cos(t * .4) * 150, 1180 + Math.sin(t * .7) * 90, 22, t * 10, '#fff'); },
      fx(c, t) { petals(c, t, 18, ['#ff8fab', '#ffd6e0', '#e05a7a'], 181); },
      crest(c, x, y) { lovebird(c, x - 34, y + 150, 56, 1, '#5fbf6a'); lovebird(c, x + 34, y + 156, 56, -1, '#ff8a5c'); blossom(c, x, y + 108, 16, '#e05a7a', '#fff', 0); }
    }

  };
  // The moods: each scene's own colours first, then two more (light, tint and text colours), as looks of their own.
  const SCENES = Object.keys(LOOKS);
  for (const id of SCENES) {
    const B = LOOKS[id];
    B.scene = id;
    for (const md of B.moods || []) {
      LOOKS[`${id}-${md.key}`] = { ...B, ...md, scene: id, m: { ...(B.m || {}), ...(md.m || {}) }, col: { ...B.col, ...(md.col || {}) } };
    }
  }
  // More moods for every scene from a shared set (light, tint and text colours), so each scene has fifteen
  // (300 looks in all). Each scene gets a different mix, and its script font changes from mood to mood.
  const LIGHT_TEXT = { names: '#ffd98a', ink: '#f6efdc', ink2: '#ddd2b4', accent: '#f4c6a8', gold: '#e8c46a' };
  const MOOD_SET = [
    { key: 'golden', mood: 'Golden Hour', tint: [['soft-light', ['#ffb347', '#ff6f61'], .7], ['multiply', '#ffe0b2', .3]], names: ['#a3203f', '#ffd27a'] },
    { key: 'moonlit', mood: 'Moonlit', tint: [['multiply', ['#33417f', '#121b45'], .8]], dark: true },
    { key: 'roseblush', mood: 'Rose Blush', tint: [['multiply', '#f9c9d6', .55]], names: ['#b0245a', '#ffc2d6'] },
    { key: 'mint', mood: 'Mint Fresh', tint: [['soft-light', '#4fd1c5', .6], ['multiply', '#d8f5ee', .35]], names: ['#1f6f5c', '#b8f5e4'] },
    { key: 'lavender', mood: 'Lavender Dream', tint: [['multiply', '#d9c8f5', .55], ['soft-light', '#8a6ad8', .35]], names: ['#5a3a9a', '#e2d2ff'] },
    { key: 'sepia', mood: 'Vintage Sepia', tint: [['color', '#a0703a', .55], ['multiply', '#f2e2c4', .3]], names: ['#7a3b12', '#f6d8a8'] },
    { key: 'royalnight', mood: 'Royal Night', tint: [['multiply', ['#25306a', '#101638'], .82]], dark: true },
    { key: 'emerald', mood: 'Emerald', tint: [['color', '#0f7a62', .5], ['multiply', '#cfe8dc', .25]], names: ['#0f5a46', '#bdf0d8'] },
    { key: 'coral', mood: 'Sunset Coral', tint: [['soft-light', ['#ff8a5c', '#ff4f7a'], .75]], names: ['#a8233a', '#ffd0b8'] },
    { key: 'ivory', mood: 'Ivory Gold', tint: [['color', '#d4b06a', .35], ['screen', '#fff6e0', .2]], names: ['#8a5a12', '#ffe3a3'] },
    { key: 'midnight', mood: 'Midnight Blue', tint: [['multiply', ['#1a2f6a', '#0a1230'], .85]], dark: true },
    { key: 'peacock', mood: 'Peacock Teal', tint: [['multiply', '#7fc8c8', .5], ['soft-light', '#0f6a7a', .4]], names: ['#0f4a5a', '#b8eef0'] },
    { key: 'monsoon', mood: 'Monsoon', tint: [['multiply', '#9fb3b8', .55], ['soft-light', '#3a5a6a', .3]], names: ['#2a4a5a', '#d0e6f0'] },
    { key: 'saffron', mood: 'Saffron Glow', tint: [['soft-light', '#ff9a1f', .65], ['multiply', '#ffe2b0', .3]], names: ['#a8420a', '#ffd08a'] },
    { key: 'sakura', mood: 'Cherry Blossom', tint: [['screen', '#ffd6e6', .25], ['multiply', '#ffd0df', .45]], names: ['#b5265a', '#ffd6e6'] },
    { key: 'champagne', mood: 'Champagne', tint: [['color', '#e8cfa0', .4], ['screen', '#fff4e0', .18]], names: ['#7a5a2a', '#ffe9c0'] },
    { key: 'ocean', mood: 'Ocean Breeze', tint: [['multiply', '#a8d8f0', .55], ['soft-light', '#1a6fb0', .35]], names: ['#164a7a', '#c4e8ff'] },
    { key: 'plum', mood: 'Plum Wine', tint: [['multiply', '#d8a8c8', .55], ['soft-light', '#6a1a4a', .4]], names: ['#6a1a4a', '#ffc4e4'] },
    { key: 'sage', mood: 'Sage Mist', tint: [['color', '#8aa88a', .45], ['screen', '#f0f6ee', .15]], names: ['#3a5a3a', '#d8f0d0'] },
    { key: 'terracotta', mood: 'Terracotta', tint: [['multiply', '#f0b89a', .55], ['soft-light', '#b04a20', .35]], names: ['#8a2e10', '#ffcfb0'] }
  ];
  const SCRIPTS = ['Playball', 'Dancing Script', 'Satisfy', 'Cookie'];
  SCENES.forEach((id, si) => {
    const B = LOOKS[id], dark = +(B.shadow[0].match(/\d+/) || [0])[0] < 200, have = new Set([B.mood, ...(B.moods || []).map(md => md.mood)]);
    const need = 14 - (B.moods || []).length;
    let added = 0;
    for (let k = 0; k < MOOD_SET.length && added < need; k++) {
      const md = MOOD_SET[(si * 3 + k) % MOOD_SET.length];
      // A night mood over a scene that is already dark only made it murky
      if (have.has(md.mood) || LOOKS[`${id}-${md.key}`] || (md.dark && dark)) continue;
      const toDark = md.dark && !dark, onDark = dark || md.dark;
      const col = toDark ? { ...LIGHT_TEXT } : { ...B.col, ...(md.names ? { names: md.names[onDark ? 1 : 0] } : {}) };
      const font = id === 'party' ? B.font : { ...B.font, script: SCRIPTS[(si + added + 1) % SCRIPTS.length] };
      LOOKS[`${id}-${md.key}`] = { ...B, key: md.key, mood: md.mood, tint: md.tint, scene: id, m: { ...(B.m || {}) }, col, font,
        ...(toDark ? { shadow: ['rgba(5,10,35,.85)', 16], mono: [['#ffe9b0', '#e0b04a'], ['#ffd0dc', '#e8799d']] } : {}) };
      added++;
    }
  });
  for (const L of Object.values(LOOKS)) L.music = SCENE_TUNES[L.scene] || L.music;
  const lookName = L => `${L.name} · ${L.mood}`;
  // A look for the occasion, the first time (parties get the party scene, pujas the temple, and so on).
  const OCCASION_LOOK = { bday: 'party', birthday: 'party', kitty: 'disco', ceremony: 'temple', naming: 'clouds', sangeet: 'mehendi', babyshower: 'clouds', anniversary: 'galaxy', engagement: 'jharokha',
    reception: 'lights', haldi: 'haldi', mehendi: 'mehendi', roka: 'jharokha-rose', housewarming: 'haveli', mundan: 'clouds', janeu: 'temple', retirement: 'palace', festive: 'diwali', corporate: 'galaxy' };

  // ---------- Story art: carved doors, a golden Ganesha emblem, and a bride and groom ----------
  // Two carved wooden doors cover the screen and swing open (p: 0 shut … 1 open).
  function doors(c, p) {
    if (p >= 1) return;
    const e = ease(p);
    for (const side of [0, 1]) {
      c.save();
      const hinge = side ? W : 0, w = W / 2 * (1 - e) * (1 - e * .15);
      if (w < 2) { c.restore(); continue; }
      c.translate(hinge, 0); c.scale(side ? -1 : 1, 1);
      const g = c.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#3a1c0c'); g.addColorStop(.5, '#6b3518'); g.addColorStop(1, '#4a230f');
      c.fillStyle = g; c.fillRect(0, 0, w, H);
      const sx = w / (W / 2);
      c.scale(sx, 1);
      // carved panels: a grid of squares, each with a rosette
      for (let r = 0; r < 7; r++) for (let q = 0; q < 2; q++) {
        const x = 40 + q * 240, y = 70 + r * 260;
        c.strokeStyle = 'rgba(20,8,2,.55)'; c.lineWidth = 6; c.strokeRect(x, y, 220, 220);
        c.strokeStyle = 'rgba(200,140,80,.25)'; c.lineWidth = 2; c.strokeRect(x + 10, y + 10, 200, 200);
        blossom(c, x + 110, y + 110, 70, 'rgba(40,16,4,.55)', 'rgba(170,110,60,.6)', 0, 8);
        blossom(c, x + 110, y + 110, 34, 'rgba(120,70,30,.7)', 'rgba(230,180,110,.7)', .4, 6);
      }
      c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(W / 2 - 14, 0, 14, H);
      // the brass ring handle
      c.strokeStyle = '#d9a83a'; c.lineWidth = 8; c.beginPath(); c.arc(W / 2 - 50, H / 2 + 40, 34, 0, TAU); c.stroke();
      c.fillStyle = '#d9a83a'; c.beginPath(); c.arc(W / 2 - 50, H / 2, 14, 0, TAU); c.fill();
      c.restore();
    }
    // a warm light pours through the gap as they open
    if (e > .02 && e < 1) glow(c, W / 2, H / 2, 700 * e + 100, `rgba(255,236,190,${(.5 * (1 - e)).toFixed(2)})`);
  }

  const goldFill = (c, y0, y1) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, '#fff4c2'); g.addColorStop(.45, '#f0c24e'); g.addColorStop(.75, '#c08a22'); g.addColorStop(1, '#8a5a10'); return g; };

  // A golden Ganesha (bust, like an idol): halo, tiered crown, ears, serene face, curling trunk, tusk,
  // shoulders with a marigold garland. (x, y) = the top of the crown, `s` = its height.
  function ganesha(c, x, y, s, t = 0) {
    c.save(); c.translate(x, y);
    const G = goldFill(c, 0, s), line = 'rgba(110,64,8,.85)';
    // halo
    glow(c, 0, s * .42, s * .75, 'rgba(255,214,120,.5)');
    c.strokeStyle = 'rgba(214,160,50,.8)'; c.lineWidth = s * .01; c.beginPath(); c.arc(0, s * .42, s * .4, 0, TAU); c.stroke();
    c.strokeStyle = 'rgba(214,160,50,.45)'; c.lineWidth = s * .006; c.beginPath(); c.arc(0, s * .42, s * .44, 0, TAU); c.stroke();
    for (let i = 0; i < 40; i++) {
      const a = i / 40 * TAU + t * .04, r0 = s * .45, r1 = s * (.5 + (i % 2) * .04);
      c.beginPath(); c.moveTo(Math.cos(a) * r0, s * .42 + Math.sin(a) * r0); c.lineTo(Math.cos(a) * r1, s * .42 + Math.sin(a) * r1); c.stroke();
    }
    c.lineJoin = 'round'; c.lineCap = 'round';
    // shoulders and chest
    c.fillStyle = G; c.strokeStyle = line; c.lineWidth = s * .01;
    c.beginPath(); c.moveTo(-s * .34, s * 1.0); c.quadraticCurveTo(-s * .34, s * .7, -s * .14, s * .64); c.lineTo(s * .14, s * .64);
    c.quadraticCurveTo(s * .34, s * .7, s * .34, s * 1.0); c.closePath(); c.fill(); c.stroke();
    // ears: big soft fans behind the head, with a rosy inner ear
    for (const d of [-1, 1]) {
      c.fillStyle = G; c.beginPath(); c.moveTo(d * s * .13, s * .3);
      c.bezierCurveTo(d * s * .42, s * .2, d * s * .46, s * .58, d * s * .2, s * .62);
      c.bezierCurveTo(d * s * .16, s * .56, d * s * .16, s * .4, d * s * .13, s * .3); c.fill(); c.stroke();
      c.fillStyle = 'rgba(232,150,120,.55)'; c.beginPath(); c.moveTo(d * s * .16, s * .34);
      c.bezierCurveTo(d * s * .36, s * .28, d * s * .38, s * .52, d * s * .21, s * .56); c.bezierCurveTo(d * s * .19, s * .5, d * s * .18, s * .42, d * s * .16, s * .34); c.fill();
    }
    // head
    c.fillStyle = G; c.beginPath(); c.ellipse(0, s * .4, s * .16, s * .15, 0, 0, TAU); c.fill(); c.stroke();
    // tiered crown (mukut)
    c.fillStyle = G;
    const tier = (w0, w1, y0, y1) => { c.beginPath(); c.moveTo(-w0, y0); c.lineTo(w0, y0); c.lineTo(w1, y1); c.lineTo(-w1, y1); c.closePath(); c.fill(); c.stroke(); };
    tier(s * .15, s * .13, s * .28, s * .22); tier(s * .12, s * .1, s * .22, s * .15); tier(s * .09, s * .065, s * .15, s * .09);
    c.beginPath(); c.moveTo(-s * .06, s * .09); c.quadraticCurveTo(-s * .05, s * .02, 0, 0); c.quadraticCurveTo(s * .05, s * .02, s * .06, s * .09); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#c0262d'; c.beginPath(); c.arc(0, s * .25, s * .022, 0, TAU); c.fill();
    c.fillStyle = '#2e8b57'; for (const d of [-1, 1]) { c.beginPath(); c.arc(d * s * .08, s * .25, s * .012, 0, TAU); c.fill(); }
    c.fillStyle = '#fff4c2'; c.beginPath(); c.arc(0, s * .045, s * .014, 0, TAU); c.fill();
    // tripundra tilak and the red dot
    c.strokeStyle = 'rgba(255,250,235,.95)'; c.lineWidth = s * .008;
    for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(-s * .07, s * (.32 + k * .018)); c.quadraticCurveTo(0, s * (.315 + k * .018), s * .07, s * (.32 + k * .018)); c.stroke(); }
    c.fillStyle = '#c0262d'; c.beginPath(); c.arc(0, s * .345, s * .012, 0, TAU); c.fill();
    // serene closed eyes
    c.strokeStyle = '#4a2a08'; c.lineWidth = s * .009;
    for (const d of [-1, 1]) { c.beginPath(); c.arc(d * s * .065, s * .39, s * .03, .3, Math.PI - .3); c.stroke(); }
    // tusk (his right, our left)
    c.fillStyle = '#fffaf0'; c.strokeStyle = line; c.lineWidth = s * .006;
    c.beginPath(); c.moveTo(-s * .06, s * .5); c.quadraticCurveTo(-s * .13, s * .56, -s * .12, s * .62); c.quadraticCurveTo(-s * .09, s * .57, -s * .04, s * .54); c.closePath(); c.fill(); c.stroke();
    // trunk: wide at the top, tapering, curling to his left and up
    c.fillStyle = G; c.strokeStyle = line; c.lineWidth = s * .01;
    c.beginPath(); c.moveTo(-s * .06, s * .44);
    c.bezierCurveTo(-s * .07, s * .58, -s * .04, s * .7, s * .02, s * .78);
    c.bezierCurveTo(s * .07, s * .84, s * .15, s * .82, s * .15, s * .74);
    c.bezierCurveTo(s * .15, s * .7, s * .11, s * .69, s * .1, s * .72);
    c.bezierCurveTo(s * .1, s * .76, s * .07, s * .77, s * .05, s * .73);
    c.bezierCurveTo(s * .03, s * .66, s * .06, s * .56, s * .06, s * .44); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = 'rgba(122,74,12,.45)'; c.lineWidth = s * .005;
    for (let k = 0; k < 6; k++) { const yy = s * (.52 + k * .04); c.beginPath(); c.moveTo(-s * .055 + k * s * .008, yy); c.quadraticCurveTo(0, yy + s * .012, s * .06 - k * s * .003, yy); c.stroke(); }
    // marigold garland over the shoulders
    for (let k = 0; k <= 16; k++) {
      const u = k / 16, a = Math.PI * (.08 + u * .84), gx = Math.cos(a) * s * .26, gy = s * .64 + Math.sin(a) * s * .26;
      marigold(c, gx, gy, s * .028, k % 2 ? 38 : 28);
    }
    c.restore();
  }

  // A real photo (an Image or bitmap) in a gold frame: 'circle' (a glowing halo, for Ganesha) or 'arch' (a royal
  // arch, for the couple). The photo fills the frame (cut to fit, centred); (cx, top) is the frame's top centre.
  function framedPhoto(c, img, cx, top, w, h, shape, L, t = 0) {
    const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    if (!iw || !ih) return;
    const x = cx - w / 2, path = () => {
      c.beginPath();
      if (shape === 'circle') c.arc(cx, top + h / 2, w / 2, 0, TAU);
      else { c.moveTo(x, top + h); c.lineTo(x, top + w / 2); c.arc(cx, top + w / 2, w / 2, Math.PI, 0); c.lineTo(x + w, top + h); c.closePath(); }
    };
    if (shape === 'circle') glow(c, cx, top + h / 2, w * .85, 'rgba(255,214,120,.55)');
    c.save(); c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 40; c.shadowOffsetY = 14; path(); c.fillStyle = '#fff'; c.fill(); c.restore();
    c.save(); path(); c.clip();
    const k = Math.max(w / iw, h / ih), dw = iw * k, dh = ih * k, zoom = 1 + .03 * Math.sin(t * .4);
    c.translate(cx, top + h / 2); c.scale(zoom, zoom);
    c.drawImage(img, -dw / 2, -dh / 2 - (shape === 'arch' ? (dh - h) * .2 : 0), dw, dh);
    c.restore();
    const g = c.createLinearGradient(x, top, x + w, top + h); g.addColorStop(0, '#f6e3a8'); g.addColorStop(.5, '#c9952e'); g.addColorStop(1, '#f2d27a');
    c.save(); path(); c.strokeStyle = g; c.lineWidth = 12; c.stroke();
    c.lineWidth = 3; c.strokeStyle = 'rgba(255,248,225,.85)';
    c.beginPath();
    if (shape === 'circle') c.arc(cx, top + h / 2, w / 2 + 16, 0, TAU);
    else { c.moveTo(x - 16, top + h); c.lineTo(x - 16, top + w / 2); c.arc(cx, top + w / 2, w / 2 + 16, Math.PI, 0); c.lineTo(x + w + 16, top + h); }
    c.stroke(); c.restore();
  }

  // A Ganesh ji illustration (cut out), full-figure inside an s × s square from (cx, top), over a soft golden glow,
  // breathing very gently
  function ganeshaCutout(c, img, cx, top, s, t = 0) {
    const iw = img.naturalWidth, ih = img.naturalHeight, k = Math.min(s * .92 / iw, s * .98 / ih), w = iw * k, h = ih * k;
    const cy = top + s / 2; // held still (no sway or breathing), with a steady glow behind
    glow(c, cx, cy, s * .62, 'rgba(255,214,120,.5)');
    // Behind him a fine gold mandala turns slowly (only the halo moves)
    mandala(c, cx, cy - s * .04, s * .66, 'rgba(201,146,44,.42)', t * .12);
    c.save(); c.translate(cx, cy);
    c.shadowColor = 'rgba(80,40,0,.25)'; c.shadowBlur = 24; c.shadowOffsetY = 10;
    c.drawImage(img, -w / 2, -h / 2, w, h);
    c.restore();
  }

  // A library picture (already cut out): full-length on the ground with a soft shadow and a gentle sway, or set in
  // a gold arch or a round medallion over a soft glow. (cx, foot) = where they stand; `s` = their height.
  function cutout(c, img, cx, foot, s, pose, L, t = 0, flip = false) {
    if (flip) { c.save(); c.translate(cx * 2, 0); c.scale(-1, 1); cutout(c, img, cx, foot, s, pose, L, t); c.restore(); return; }
    const iw = img.naturalWidth, ih = img.naturalHeight;
    if (pose === 'arch' || pose === 'medallion') {
      const w = pose === 'arch' ? s * .82 : s * .9, h = pose === 'arch' ? s * 1.05 : w, top = foot - h;
      const light = isLight(L);
      c.save();
      const path = () => { c.beginPath(); if (pose === 'arch') { c.moveTo(cx - w / 2, top + h); c.lineTo(cx - w / 2, top + w / 2); c.arc(cx, top + w / 2, w / 2, Math.PI, 0); c.lineTo(cx + w / 2, top + h); c.closePath(); } else c.arc(cx, top + h / 2, w / 2, 0, TAU); };
      path(); const g = c.createRadialGradient(cx, top + h * .45, 10, cx, top + h * .5, w * .7);
      g.addColorStop(0, light ? '#fffaf0' : '#3a2a4a'); g.addColorStop(1, light ? '#f3e2c8' : '#1a1024'); c.fillStyle = g; c.fill();
      c.clip();
      const k = Math.min(w * .95 / iw, h * .96 / ih), dw = iw * k, dh = ih * k;
      c.drawImage(img, cx - dw / 2, top + h - dh, dw, dh);
      c.restore();
      const gg = c.createLinearGradient(cx - w / 2, top, cx + w / 2, top + h); gg.addColorStop(0, '#f6e3a8'); gg.addColorStop(.5, '#c9952e'); gg.addColorStop(1, '#f2d27a');
      c.save(); path(); c.strokeStyle = gg; c.lineWidth = 10; c.stroke(); c.restore();
      return;
    }
    const k = s / ih, dw = iw * k, dh = s, sway = Math.sin(t * .9) * .006;
    c.save();
    c.fillStyle = 'rgba(30,15,10,.22)'; c.beginPath(); c.ellipse(cx, foot, dw * .42, dh * .03, 0, 0, TAU); c.fill();
    c.translate(cx, foot); c.rotate(sway); c.drawImage(img, -dw / 2, -dh, dw, dh);
    c.restore();
  }

  // A bride and groom side by side, drawn flat (front view). (x, y) = between their feet, `s` = their height.
  function couple(c, x, y, s, t = 0) {
    const sway = Math.sin(t * 1.2) * s * .003, skin = '#e8b08a', skinD = '#c98a62';
    const face = (cx, cy, r) => {
      const g = c.createRadialGradient(cx - r * .3, cy - r * .3, r * .1, cx, cy, r); g.addColorStop(0, '#f6caa6'); g.addColorStop(1, skin);
      c.fillStyle = g; c.beginPath(); c.ellipse(cx, cy, r * .86, r, 0, 0, TAU); c.fill();
      c.strokeStyle = '#3a2416'; c.lineWidth = r * .06; c.lineCap = 'round';
      for (const d of [-1, 1]) { c.beginPath(); c.arc(cx + d * r * .32, cy - r * .05, r * .14, .2, Math.PI - .2); c.stroke(); }
      c.strokeStyle = '#a8424a'; c.beginPath(); c.arc(cx, cy + r * .32, r * .2, .3, Math.PI - .3); c.stroke();
      c.fillStyle = 'rgba(230,110,110,.25)'; for (const d of [-1, 1]) { c.beginPath(); c.arc(cx + d * r * .48, cy + r * .22, r * .16, 0, TAU); c.fill(); }
    };
    c.save(); c.translate(x, y);
    c.fillStyle = 'rgba(40,20,10,.18)'; c.beginPath(); c.ellipse(0, 0, s * .4, s * .035, 0, 0, TAU); c.fill();

    // ---- the groom (left): ivory sherwani, saffron safa, maroon stole
    c.save(); c.translate(-s * .15 + sway, 0);
    c.fillStyle = '#efe4cc'; c.fillRect(-s * .07, -s * .34, s * .055, s * .32); c.fillRect(s * .015, -s * .34, s * .055, s * .32);
    c.fillStyle = '#c9952e'; for (const d of [-1, 1]) { c.beginPath(); c.ellipse(d * s * .045, -s * .01, s * .05, s * .02, 0, 0, TAU); c.fill(); }
    const sh = c.createLinearGradient(-s * .16, 0, s * .16, 0); sh.addColorStop(0, '#d9c9a4'); sh.addColorStop(.5, '#fbf3e0'); sh.addColorStop(1, '#d6c49c');
    c.fillStyle = sh; c.beginPath();
    c.moveTo(-s * .12, -s * .8); c.lineTo(s * .12, -s * .8); c.lineTo(s * .16, -s * .3); c.lineTo(-s * .16, -s * .3); c.closePath(); c.fill();
    c.strokeStyle = '#c9952e'; c.lineWidth = s * .008; c.stroke();
    c.beginPath(); c.moveTo(0, -s * .8); c.lineTo(0, -s * .3); c.stroke();
    c.fillStyle = '#c9952e'; for (let k = 0; k < 7; k++) { c.beginPath(); c.arc(s * .012, -s * (.76 - k * .06), s * .009, 0, TAU); c.fill(); }
    c.fillStyle = 'rgba(201,149,46,.5)'; c.fillRect(-s * .16, -s * .34, s * .32, s * .03);
    for (const d of [-1, 1]) { c.fillStyle = sh; c.beginPath(); c.moveTo(d * s * .12, -s * .79); c.lineTo(d * s * .17, -s * .5); c.lineTo(d * s * .13, -s * .5); c.lineTo(d * s * .09, -s * .74); c.fill(); c.fillStyle = skin; c.beginPath(); c.arc(d * s * .155, -s * .48, s * .022, 0, TAU); c.fill(); }
    c.fillStyle = '#8a1c2b'; c.beginPath(); c.moveTo(-s * .11, -s * .8); c.lineTo(-s * .06, -s * .8); c.lineTo(s * .13, -s * .42); c.lineTo(s * .09, -s * .38); c.closePath(); c.fill();
    c.strokeStyle = '#f2d27a'; c.lineWidth = s * .006; c.stroke();
    c.strokeStyle = '#f7f1e3'; c.lineWidth = s * .01; c.beginPath(); c.arc(0, -s * .79, s * .07, .3, Math.PI - .3); c.stroke();
    c.fillStyle = '#f3a42a'; for (let k = 0; k < 9; k++) { const a = .3 + k / 8 * (Math.PI - .6); c.beginPath(); c.arc(Math.cos(a) * s * .07, -s * .79 + Math.sin(a) * s * .07, s * .012, 0, TAU); c.fill(); }
    c.fillStyle = skinD; c.fillRect(-s * .025, -s * .84, s * .05, s * .05);
    face(0, -s * .9, s * .07);
    c.strokeStyle = '#2a1a10'; c.lineWidth = s * .008; c.beginPath(); c.moveTo(-s * .025, -s * .875); c.quadraticCurveTo(0, -s * .865, s * .025, -s * .875); c.stroke();
    const tb = c.createLinearGradient(0, -s * 1.04, 0, -s * .94); tb.addColorStop(0, '#ffb238'); tb.addColorStop(1, '#e0601c');
    c.fillStyle = tb; c.beginPath(); c.ellipse(0, -s * .985, s * .085, s * .06, 0, Math.PI, TAU); c.lineTo(s * .085, -s * .95); c.lineTo(-s * .085, -s * .95); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(160,50,10,.5)'; c.lineWidth = s * .005; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(-s * .08, -s * (.96 + k * .022)); c.quadraticCurveTo(0, -s * (1.0 + k * .022), s * .08, -s * (.96 + k * .022)); c.stroke(); }
    c.fillStyle = '#f2d27a'; c.beginPath(); c.arc(s * .02, -s * 1.0, s * .016, 0, TAU); c.fill();
    c.fillStyle = '#fffaf0'; c.beginPath(); c.moveTo(s * .02, -s * 1.0); c.quadraticCurveTo(s * .07, -s * 1.08, s * .05, -s * 1.12); c.quadraticCurveTo(s * .035, -s * 1.06, s * .02, -s * 1.0); c.fill();
    c.restore();

    // ---- the bride (right): red lehenga with a gold border, pink dupatta over her head
    c.save(); c.translate(s * .15 - sway, 0);
    const lg = c.createLinearGradient(-s * .22, 0, s * .22, 0); lg.addColorStop(0, '#8e1730'); lg.addColorStop(.5, '#d63a5a'); lg.addColorStop(1, '#8e1730');
    c.fillStyle = lg; c.beginPath(); c.moveTo(-s * .09, -s * .5); c.lineTo(s * .09, -s * .5); c.quadraticCurveTo(s * .2, -s * .2, s * .23, 0); c.lineTo(-s * .23, 0); c.quadraticCurveTo(-s * .2, -s * .2, -s * .09, -s * .5); c.fill();
    c.fillStyle = '#e9b949'; c.beginPath(); c.moveTo(-s * .225, -s * .045); c.lineTo(s * .225, -s * .045); c.lineTo(s * .23, 0); c.lineTo(-s * .23, 0); c.fill();
    c.fillStyle = 'rgba(244,203,96,.75)';
    for (let r = 0; r < 4; r++) for (let k = -4; k <= 4; k++) { const yy = -s * (.1 + r * .1), xx = k * s * (.035 + r * -.004); c.beginPath(); c.arc(xx, yy, s * .006, 0, TAU); c.fill(); }
    c.fillStyle = '#b8203f'; c.beginPath(); c.moveTo(-s * .085, -s * .78); c.lineTo(s * .085, -s * .78); c.lineTo(s * .09, -s * .5); c.lineTo(-s * .09, -s * .5); c.closePath(); c.fill();
    c.fillStyle = '#e9b949'; c.fillRect(-s * .09, -s * .52, s * .18, s * .02);
    for (const d of [-1, 1]) { c.fillStyle = skin; c.beginPath(); c.moveTo(d * s * .08, -s * .76); c.lineTo(d * s * .12, -s * .55); c.lineTo(d * s * .095, -s * .54); c.lineTo(d * s * .065, -s * .72); c.fill();
      c.fillStyle = '#c0262d'; for (let k = 0; k < 3; k++) c.fillRect(d * s * .095 - s * .015, -s * (.6 - k * .012), s * .03, s * .007); }
    c.strokeStyle = '#f2d27a'; c.lineWidth = s * .009; c.beginPath(); c.arc(0, -s * .79, s * .06, .4, Math.PI - .4); c.stroke();
    c.fillStyle = skinD; c.fillRect(-s * .022, -s * .83, s * .044, s * .05);
    c.fillStyle = '#2a1a12'; c.beginPath(); c.ellipse(0, -s * .9, s * .075, s * .082, 0, 0, TAU); c.fill();
    face(0, -s * .885, s * .064);
    c.fillStyle = '#c0262d'; c.beginPath(); c.arc(0, -s * .925, s * .007, 0, TAU); c.fill();
    c.fillStyle = '#f2d27a'; c.beginPath(); c.arc(0, -s * .955, s * .012, 0, TAU); c.fill();
    c.strokeStyle = '#f2d27a'; c.lineWidth = s * .004; c.beginPath(); c.moveTo(0, -s * .97); c.lineTo(0, -s * .955); c.stroke();
    for (const d of [-1, 1]) { c.fillStyle = '#f2d27a'; c.beginPath(); c.arc(d * s * .058, -s * .86, s * .012, 0, TAU); c.fill(); }
    c.strokeStyle = '#f2d27a'; c.lineWidth = s * .004; c.beginPath(); c.arc(s * .016, -s * .87, s * .012, 0, TAU); c.stroke();
    // dupatta: over the head, down both shoulders, sheer with a gold border
    const flut = Math.sin(t * 1.6) * s * .01;
    c.fillStyle = 'rgba(244,140,170,.55)'; c.beginPath();
    c.moveTo(-s * .03, -s * .99); c.quadraticCurveTo(s * .1, -s * 1.0, s * .11, -s * .86);
    c.quadraticCurveTo(s * .16 + flut, -s * .5, s * .2 + flut, -s * .12); c.lineTo(s * .13 + flut, -s * .1);
    c.quadraticCurveTo(s * .1, -s * .55, s * .06, -s * .82); c.quadraticCurveTo(s * .02, -s * .96, -s * .08, -s * .9);
    c.quadraticCurveTo(-s * .11, -s * .75, -s * .1, -s * .6); c.lineTo(-s * .12, -s * .62); c.quadraticCurveTo(-s * .13, -s * .85, -s * .03, -s * .99); c.fill();
    c.strokeStyle = '#e9b949'; c.lineWidth = s * .007; c.stroke();
    c.restore();
    c.restore();
  }

  // ---------- Variety: every look and story film opens, moves and lays out its words in its own way ----------
  // Six openings, five scene changes, five layouts and four ways for the words to arrive, picked from the look's
  // name, so neighbouring videos never share a format.
  const OPENINGS = ['doors', 'curtains', 'scroll', 'iris', 'veil', 'gates'];
  const CHANGES = ['flash', 'iris', 'wipe', 'bloom', 'petals'];
  const LAYOUTS_V = ['center', 'panel', 'high', 'low', 'framed'];
  const ENTRANCES = ['rise', 'drop', 'zoom', 'side'];
  const POSES = ['full', 'full', 'arch', 'medallion']; // how a library couple is shown
  function variant(key) {
    let h = 7;
    for (const ch of String(key)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const pick = (list, m) => list[Math.floor(h / m) % list.length];
    return { open: pick(OPENINGS, 1), change: pick(CHANGES, 7), layout: pick(LAYOUTS_V, 43), enter: pick(ENTRANCES, 311), pose: pick(POSES, 1709) };
  }

  // Openings: each covers the screen and gives way to the first scene (p: 0 closed … 1 open)
  function curtains(c, p) {
    if (p >= 1) return;
    const e = ease(p);
    for (const side of [-1, 1]) {
      const w = W / 2 * (1 - e), x = side < 0 ? 0 : W - w;
      if (w < 2) continue;
      const g = c.createLinearGradient(x, 0, x + w, 0);
      for (let k = 0; k <= 8; k++) g.addColorStop(k / 8, k % 2 ? '#6e0f22' : '#9c1c34');
      c.fillStyle = g; c.fillRect(x, 0, w, H);
      c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(side < 0 ? x + w - 18 : x, 0, 18, H);
      c.fillStyle = '#d9a83a';
      for (let y = 40; y < H; y += 120) c.fillRect(side < 0 ? x + w - 10 : x + 4, y, 6, 50);
    }
    const valance = c.createLinearGradient(0, 0, 0, 170); valance.addColorStop(0, '#5a0a1a'); valance.addColorStop(1, '#8a1a2e');
    c.fillStyle = valance; c.beginPath(); c.moveTo(0, 0); c.lineTo(W, 0); c.lineTo(W, 120);
    for (let x = W; x >= 0; x -= 90) c.quadraticCurveTo(x - 45, 200, x - 90, 120);
    c.closePath(); c.fill();
    c.strokeStyle = '#e8c46a'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, 118);
    for (let x = 0; x <= W; x += 90) c.quadraticCurveTo(x + 45, 198, x + 90, 118);
    c.stroke();
  }
  function scrollOpen(c, p) {
    if (p >= 1) return;
    const e = ease(p), top = H * e;
    if (top >= H - 4) return;
    const g = c.createLinearGradient(0, top, 0, H); g.addColorStop(0, '#f3e2bd'); g.addColorStop(1, '#e2c58e');
    c.fillStyle = g; c.fillRect(0, top, W, H - top);
    c.strokeStyle = 'rgba(140,90,30,.35)'; c.lineWidth = 4; c.strokeRect(60, top + 60, W - 120, H - top - 120);
    const rod = c.createLinearGradient(0, top - 40, 0, top + 40); rod.addColorStop(0, '#7a4a14'); rod.addColorStop(.5, '#f2c76b'); rod.addColorStop(1, '#6e420f');
    c.fillStyle = rod; rrect(c, -10, top - 38, W + 20, 76, 38); c.fill();
    for (const x of [24, W - 24]) { c.fillStyle = '#c0262d'; c.beginPath(); c.arc(x, top, 30, 0, TAU); c.fill(); }
  }
  function irisOpen(c, p) {
    if (p >= 1) return;
    const r = ease(p) * 1250;
    c.save(); c.beginPath(); c.rect(0, 0, W, H); c.arc(W / 2, H / 2, r, 0, TAU, true); c.fillStyle = '#0b0612'; c.fill('evenodd');
    c.strokeStyle = 'rgba(242,201,110,.9)'; c.lineWidth = 8; c.beginPath(); c.arc(W / 2, H / 2, r, 0, TAU); c.stroke();
    c.restore();
  }
  function veil(c, p, t) {
    if (p >= 1) return;
    const R = rng(91), e = ease(p);
    c.save(); c.globalAlpha = 1 - e;
    c.fillStyle = '#fbe9ef'; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 140; i++) {
      const x = R() * W, y = R() * H + e * (300 + R() * 900), r = 26 + R() * 40;
      blossom(c, x, y, r, ['#f48fb1', '#ffffff', '#ffd166', '#ef8fa8'][i % 4], '#fff', R() * 6 + t);
    }
    c.restore();
  }
  function gates(c, p) {
    if (p >= 1) return;
    const e = ease(p);
    glow(c, W / 2, H / 2, 900, `rgba(255,236,190,${(.9 * (1 - e)).toFixed(2)})`);
    for (const side of [-1, 1]) {
      const w = W / 2 * (1 - e), x = side < 0 ? 0 : W - w;
      if (w < 2) continue;
      const g = c.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, '#f6e3a8'); g.addColorStop(.5, '#c9952e'); g.addColorStop(1, '#8a5a10');
      c.fillStyle = g; c.fillRect(x, 0, w, H);
      c.strokeStyle = 'rgba(90,50,0,.45)'; c.lineWidth = 6;
      for (let y = 160; y < H; y += 220) { c.beginPath(); c.arc(side < 0 ? x + w - 110 : x + 110, y, 70, 0, TAU); c.stroke(); }
    }
  }
  function opening(c, kind, p, t) {
    if (kind === 'curtains') curtains(c, p);
    else if (kind === 'scroll') scrollOpen(c, p);
    else if (kind === 'iris') irisOpen(c, p);
    else if (kind === 'veil') veil(c, p, t);
    else if (kind === 'gates') gates(c, p);
    else doors(c, p);
  }
  // Scene changes: a short effect over the first moments of each scene
  function change(c, kind, p, L) {
    const q = clamp(p / .8);
    if (q >= 1) return;
    if (kind === 'iris') {
      // Opens from a small circle under a soft shade, never from solid black (that flashed at every cut)
      const r = 180 + ease(q) * 1070;
      c.save(); c.beginPath(); c.rect(0, 0, W, H); c.arc(W / 2, H / 2, r, 0, TAU, true); c.fillStyle = `rgba(8,4,14,${(.55 * (1 - q)).toFixed(2)})`; c.fill('evenodd'); c.restore();
    } else if (kind === 'wipe') {
      const y = ease(q) * (H + 400) - 200, g = c.createLinearGradient(0, y - 200, 0, y + 200);
      g.addColorStop(0, 'rgba(255,236,190,0)'); g.addColorStop(.5, 'rgba(255,226,160,.55)'); g.addColorStop(1, 'rgba(255,236,190,0)');
      c.fillStyle = g; c.fillRect(0, y - 200, W, 400);
    } else if (kind === 'bloom') {
      glow(c, W / 2, H / 2, 1100, `rgba(255,214,140,${(.5 * (1 - q)).toFixed(2)})`);
    } else if (kind === 'petals') {
      const R = rng(17);
      for (let i = 0; i < 60; i++) {
        const a = R() * TAU, d = ease(q) * (400 + R() * 900);
        c.save(); c.globalAlpha = 1 - q; blossom(c, W / 2 + Math.cos(a) * d, H / 2 + Math.sin(a) * d, 22 + R() * 18, [L.col.names, '#ffd166', '#ffffff'][i % 3], '#fff', a); c.restore();
      }
    } else { c.fillStyle = `rgba(255,250,236,${((1 - q) * .28).toFixed(2)})`; c.fillRect(0, 0, W, H); }
  }
  // Layouts: where the words sit, and what sits behind them
  function zoneFor(kind, z) {
    if (kind === 'high') return [230, 1080, z[2]];
    if (kind === 'low') return [820, 1720, z[2]];
    if (kind === 'panel' || kind === 'framed') return [Math.max(z[0], 300), Math.min(z[1], 1560), Math.min(z[2], 820)];
    return z;
  }
  function backing(c, kind, L, y0, h, a) {
    if (a <= .01 || !/^(panel|framed|low)$/.test(kind)) return;
    const light = isLight(L);
    c.save(); c.globalAlpha = a;
    if (kind === 'low') {
      const g = c.createLinearGradient(0, y0 - 260, 0, H);
      g.addColorStop(0, light ? 'rgba(255,250,240,0)' : 'rgba(8,4,14,0)'); g.addColorStop(.35, light ? 'rgba(255,250,240,.82)' : 'rgba(8,4,14,.66)');
      c.fillStyle = g; c.fillRect(0, y0 - 260, W, H - y0 + 260);
    } else {
      const x = 90, w = W - 180, top = y0 - 70, hh = h + 140;
      if (kind === 'panel') { c.fillStyle = light ? 'rgba(255,252,246,.8)' : 'rgba(12,6,20,.58)'; rrect(c, x, top, w, hh, 44); c.fill(); }
      c.strokeStyle = L.col.gold; c.lineWidth = 3; rrect(c, x + 16, top + 16, w - 32, hh - 32, 34); c.stroke();
      c.lineWidth = 1.5; rrect(c, x + 28, top + 28, w - 56, hh - 56, 28); c.stroke();
      for (const [cx, cy] of [[x + 16, top + 16], [x + w - 16, top + 16], [x + 16, top + hh - 16], [x + w - 16, top + hh - 16]]) {
        c.fillStyle = L.col.gold; c.beginPath(); c.moveTo(cx, cy - 12); c.lineTo(cx + 12, cy); c.lineTo(cx, cy + 12); c.lineTo(cx - 12, cy); c.fill();
      }
    }
    c.restore();
  }

  // A light look has dark words on a pale scene (its text shadow is a pale glow)
  const isLight = L => { const m = String(L.shadow[0]).match(/\d+/g) || []; return m.length >= 3 && +m[0] > 200 && +m[1] > 200 && +m[2] > 200; };

  // ---------- Layout and text ----------
  // Hindi: 'hname' for names (Amita, calligraphic), 'hser' for text (Tiro Devanagari Hindi), 'deva' for headings
  const fontOf = (L, f, z) => f === 'script' ? `${z}px "${L.font.script}"` : f === 'italic' ? `italic ${z}px "Cormorant Garamond"`
    : f === 'deva' ? `${z}px "Yatra One"` : f === 'hname' ? `700 ${z}px "Amita"` : f === 'hser' ? `${z}px "Tiro Devanagari Hindi"`
    : f === 'display' ? `700 ${z}px "Cinzel Decorative"` : `${z}px "${L.font.serif}"`;
  function wrapText(c, s, maxW, max) {
    const words = s.split(' '), out = [];
    let line = '';
    for (const w of words) {
      const next = line ? `${line} ${w}` : w;
      if (c.measureText(next).width > maxW && line) { out.push(line); line = w; } else line = next;
    }
    out.push(line);
    if (out.length > max) { out.length = max; out[max - 1] = out[max - 1].replace(/\s*\S*$/, '') + '…'; }
    return out;
  }
  const lineH = it => it.f === 'script' ? 1.22 : /^(hname|hser|deva)$/.test(it.f) ? 1.42 : 1.3;
  function measure(c, L, it, k, maxW) {
    const m = { it, gap: (it.gap || 0) * k };
    if (it.t === 'text') {
      let z = it.z * k;
      const s = it.up ? it.s.toUpperCase() : it.s;
      c.font = fontOf(L, it.f, z);
      if (it.wrap) m.lines = wrapText(c, s, maxW, it.wrap);
      else {
        const ls = (it.ls || 0) * k * s.length;
        while (z > it.z * k * .55 && c.measureText(s).width + ls > maxW) { z *= .94; c.font = fontOf(L, it.f, z); }
        m.lines = [s];
      }
      m.z = z; m.h = m.lines.length * z * lineH(it);
    } else if (it.t === 'mono') { m.z = it.z * k; m.h = m.z * .86; }
    else if (it.t === 'crest') m.h = it.h * k;
    else if (it.t === 'div') { m.z = (it.z || 40) * k; m.h = m.z * 1.1; }
    else if (it.t === 'emoji') { m.z = it.z * k; m.h = m.z * 1.2; }
    else if (it.t === 'date') { m.z = it.z * k; m.h = m.z * 1.3; }
    else if (it.t === 'cal') { m.k = k; m.h = (52 + 30 + 170 + (it.timed ? 64 : 0)) * k; }
    else if (it.t === 'qr') { m.z = it.z * k; m.h = m.z; }
    else if (it.t === 'sig') { m.k = k; m.h = (it.pad + 30 + 96 + 40) * k; }
    return m;
  }
  function layout(c, L, items) {
    const [top, bottom, maxW] = L.zone, room = bottom - top;
    const build = k => items.map(it => measure(c, L, it, k, maxW));
    const total = M => M.reduce((a, m, i) => a + m.h + (i < M.length - 1 ? m.gap : 0), 0);
    let M = build(1), h = total(M);
    for (let k = .95; h > room && k > .5; k -= .05) { M = build(k); h = total(M); }
    return { M, y0: top + Math.max(0, (room - h) / 2) };
  }

  function setText(c, L, font, col, alpha) {
    c.font = font; c.fillStyle = L.col[col] || col; c.globalAlpha = alpha;
    c.shadowColor = L.shadow[0]; c.shadowBlur = L.shadow[1]; c.shadowOffsetY = 0;
  }
  const spacing = (c, px) => { if ('letterSpacing' in c) c.letterSpacing = `${px}px`; };

  function drawMono(c, L, letters, cx, y, z, p, alpha) {
    c.save(); c.globalAlpha = alpha; c.font = fontOf(L, 'display', z); c.textBaseline = 'alphabetic'; c.textAlign = 'left';
    const ws = letters.map(ch => c.measureText(ch).width), gap = z * .04, tw = ws.reduce((a, b) => a + b, 0) + gap * (letters.length - 1);
    const base = y + z * .78, sc = .86 + .14 * ease(p / 1.2);
    c.translate(cx, base - z * .35); c.scale(sc, sc); c.translate(-cx, -(base - z * .35));
    let x = cx - tw / 2;
    letters.forEach((ch, i) => {
      const [a, b] = L.mono[i % 2], g = c.createLinearGradient(0, base - z * .75, 0, base);
      g.addColorStop(0, a); g.addColorStop(1, b);
      c.shadowColor = 'rgba(0,0,0,.28)'; c.shadowBlur = 24; c.shadowOffsetY = 10;
      c.fillStyle = g; c.fillText(ch, x, base);
      c.shadowColor = 'transparent'; c.lineWidth = Math.max(2, z * .016); c.strokeStyle = L.col.gold; c.strokeText(ch, x, base);
      const shine = (p - .9 - i * .25) / 1.1;
      if (shine > 0 && shine < 1) {
        c.save(); c.beginPath(); c.rect(x, base - z, ws[i], z * 1.1); c.clip();
        const sx = x - ws[i] + shine * ws[i] * 3, sg = c.createLinearGradient(sx - 60, 0, sx + 60, 0);
        sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(.5, 'rgba(255,255,255,.75)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
        c.globalCompositeOperation = 'source-atop'; c.fillStyle = sg; c.fillText(ch, x, base); c.restore();
      }
      x += ws[i] + gap;
    });
    blossom(c, cx - tw / 2 + z * .04, base - z * .68, z * .085, '#ec6f9c', '#fff', p * .3);
    blossom(c, cx + tw / 2 - z * .02, base - z * .06, z * .07, '#f7a8c4', '#fff', -p * .3);
    c.restore();
  }

  function drawDivider(c, L, cx, y, m, alpha) {
    const z = m.z, word = m.it.word, half = word ? 230 : 190;
    c.save(); c.globalAlpha = alpha; c.strokeStyle = L.col.gold; c.fillStyle = L.col.gold; c.lineWidth = 2.5;
    let gapW = 30;
    if (word) { setText(c, L, fontOf(L, m.it.hi ? 'hser' : 'serif', z), 'accent', alpha); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(word, cx, y); gapW = c.measureText(word).width / 2 + 26; c.shadowBlur = 0; }
    for (const d of [-1, 1]) {
      c.beginPath(); c.moveTo(cx + d * gapW, y); c.lineTo(cx + d * half, y); c.stroke();
      c.beginPath(); c.ellipse(cx + d * (half - 4), y, 10, 4, 0, 0, TAU); c.fill();
    }
    if (!word) { c.beginPath(); c.moveTo(cx, y - 12); c.lineTo(cx + 12, y); c.lineTo(cx, y + 12); c.lineTo(cx - 12, y); c.closePath(); c.fill(); }
    c.restore();
  }

  function drawItem(c, L, m, cx, y, p, alpha, ctx) {
    const it = m.it;
    c.save(); c.textAlign = 'center'; c.textBaseline = 'middle';
    if (it.t === 'text') {
      setText(c, L, fontOf(L, it.f, m.z), it.col, alpha); spacing(c, (it.ls || 0));
      if (it.gold) {
        // Gold lettering with depth: a gold gradient, a soft drop shadow and a fine dark edge
        c.fillStyle = goldFill(c, y, y + m.h); c.shadowColor = 'rgba(90,50,0,.55)'; c.shadowBlur = 10; c.shadowOffsetY = 6;
        c.strokeStyle = 'rgba(110,64,8,.8)'; c.lineWidth = Math.max(1.5, m.z * .025);
      }
      m.lines.forEach((ln, i) => { c.fillText(ln, cx, y + (i + .5) * m.z * lineH(it)); if (it.gold) { c.shadowColor = 'transparent'; c.strokeText(ln, cx, y + (i + .5) * m.z * lineH(it)); } });
    } else if (it.t === 'mono') drawMono(c, L, ctx.letters, cx, y, m.z, p, alpha);
    else if (it.t === 'crest') { c.globalAlpha = alpha; L.crest(c, cx, y, ctx.t); }
    else if (it.t === 'div') drawDivider(c, L, cx, y + m.h / 2, m, alpha);
    else if (it.t === 'emoji') { c.globalAlpha = alpha; c.font = `${m.z}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif`; c.fillText(it.s, cx, y + m.h / 2); }
    else if (it.t === 'date') {
      const d = it.d, a = String(d.getDate()), suf = ordinal(d.getDate()).slice(a.length), rest = ` ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
      setText(c, L, fontOf(L, 'serif', m.z), it.col, alpha);
      const wa = c.measureText(a).width, wr = c.measureText(rest).width; c.font = fontOf(L, 'serif', m.z * .55); const ws = c.measureText(suf).width;
      let x = cx - (wa + ws + wr) / 2; const yy = y + m.h / 2;
      c.textAlign = 'left'; c.font = fontOf(L, 'serif', m.z); c.fillText(a, x, yy); x += wa;
      c.font = fontOf(L, 'serif', m.z * .55); c.fillText(suf, x, yy - m.z * .28); x += ws;
      c.font = fontOf(L, 'serif', m.z); c.fillText(rest, x, yy);
    } else if (it.t === 'cal') {
      const k = m.k, d = it.d;
      setText(c, L, fontOf(L, 'serif', 46 * k), 'accent', alpha); spacing(c, 10 * k);
      c.fillText(MONTHS[d.getMonth()].toUpperCase(), cx, y + 26 * k);
      const ry = y + (52 + 30 + 85) * k;
      spacing(c, 4 * k); setText(c, L, fontOf(L, 'serif', 34 * k), 'ink', alpha);
      c.textAlign = 'right'; c.fillText(DAYS[d.getDay()].toUpperCase(), cx - 120 * k, ry);
      c.textAlign = 'left'; c.fillText(String(d.getFullYear()), cx + 120 * k, ry);
      c.shadowBlur = 0; c.strokeStyle = L.col.gold; c.lineWidth = 2;
      for (const d2 of [-1, 1]) {
        c.beginPath(); c.moveTo(cx + d2 * 96 * k, ry - 70 * k); c.lineTo(cx + d2 * 96 * k, ry + 70 * k); c.stroke();
        c.beginPath(); c.moveTo(cx + d2 * 120 * k, ry - 34 * k); c.lineTo(cx + d2 * 330 * k, ry - 34 * k); c.moveTo(cx + d2 * 120 * k, ry + 34 * k); c.lineTo(cx + d2 * 330 * k, ry + 34 * k); c.stroke();
      }
      spacing(c, 0); c.textAlign = 'center'; setText(c, L, fontOf(L, 'display', 150 * k), 'names', alpha);
      c.fillText(String(d.getDate()), cx, ry + 8 * k);
      if (it.timed) { spacing(c, 6 * k); setText(c, L, fontOf(L, 'serif', 36 * k), 'ink2', alpha); c.fillText(`${timeText(d)} onwards`.toUpperCase(), cx, ry + (85 + 50) * k); }
    } else if (it.t === 'qr') {
      // A QR code on a white card (it.rows: '0'/'1' strings), so phones can scan it straight off the screen
      const n = it.rows.length, cell = m.z / n, x0 = cx - m.z / 2;
      c.globalAlpha = alpha; c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 30;
      c.fillStyle = '#fff'; rrect(c, x0 - 22, y - 22, m.z + 44, m.z + 44, 26); c.fill(); c.shadowBlur = 0;
      c.fillStyle = '#111';
      it.rows.forEach((row, r) => { for (let q = 0; q < n; q++) if (row[q] === '1') c.fillRect(x0 + q * cell, y + r * cell, cell + .6, cell + .6); });
    } else if (it.t === 'sig') {
      const k = m.k, yy = y + it.pad * k;
      setText(c, L, fontOf(L, 'serif', 26 * k), 'ink2', alpha); spacing(c, 6 * k); c.fillText('DESIGNED BY', cx, yy + 15 * k);
      spacing(c, 0); setText(c, L, `${96 * k}px "Great Vibes"`, 'gold', alpha); c.fillText(ctx.designer, cx, yy + (30 + 52) * k);
      setText(c, L, fontOf(L, 'serif', 28 * k), 'ink2', alpha * .9); spacing(c, 2 * k); if (ctx.host) c.fillText(ctx.host, cx, yy + (30 + 96 + 22) * k);
    }
    c.restore();
  }

  // ---------- The player: draws frame t of the video on a 1080×1920 canvas ----------
  // `k` paints at a higher resolution (2 = 4K, for a 2160×3840 video), so the art stays sharp.
  function paint(id, k = 1) {
    const L = LOOKS[id], cv = document.createElement('canvas');
    cv.width = W * k; cv.height = H * k;
    const c = cv.getContext('2d');
    c.scale(k, k);
    L.back(c, rng(L.scene.length * 977 + 13), L.m || {});
    for (const [op, col, alpha] of L.tint || []) {
      c.globalCompositeOperation = op; c.globalAlpha = alpha;
      if (Array.isArray(col)) { const g = c.createLinearGradient(0, 0, 0, H); col.forEach((x, i) => g.addColorStop(i / (col.length - 1), x)); c.fillStyle = g; }
      else c.fillStyle = col;
      c.fillRect(0, 0, W, H);
    }
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    return cv;
  }
  // Full-size scenes are big (8 MB each), so only the two most recent stay in memory.
  const layers = new Map();
  function sceneLayer(id) {
    if (!LOOKS[id]) id = 'vrindavan';
    if (layers.has(id)) { const cv = layers.get(id); layers.delete(id); layers.set(id, cv); return cv; }
    const cv = paint(id);
    layers.set(id, cv);
    while (layers.size > 2) layers.delete(layers.keys().next().value);
    return cv;
  }
  // A small picture of a look for its button (painted, shrunk, and the big one let go).
  function thumb(id, canvas) {
    const big = layers.get(id) || paint(id), tmp = document.createElement('canvas');
    tmp.width = W; tmp.height = H;
    const c = tmp.getContext('2d');
    c.drawImage(big, 0, 0);
    LOOKS[id].anim(c, 2.5); // with its moving parts too (the disco ball, the diyas, the lanterns)
    canvas.getContext('2d').drawImage(tmp, 0, 0, canvas.width, canvas.height);
  }

  class Player {
    // `k` draws smaller (0.5 = 540×960, for previews on the website's phones); the video itself is made at 1.
    constructor(canvas, k = 1) { this.cv = canvas; this.k = k; this.c = canvas.getContext('2d'); canvas.width = Math.round(W * k); canvas.height = Math.round(H * k); }
    set(card, opt, site = {}) {
      this.card = card; this.opt = opt; this.L = LOOKS[opt.look] || LOOKS.vrindavan;
      this.tl = timeline(card, opt); this.cache = new Map();
      // A film (or a client's video) may ask for its own opening, e.g. curtains
      const v = opt.variant || variant(opt.story || opt.look || 'vrindavan'), open = opt.opening || (STORIES[opt.story] || {}).opening;
      this.v = OPENINGS.includes(open) ? { ...v, open } : v;
      this.couple = coupleFor(card, opt.story || opt.look || '');
      libImage(this.couple); // start loading it now
      let host = '';
      try { host = site.url ? new URL(site.url).host : ''; } catch (e) { /* no address */ }
      this.ctx = { designer: clean(site.designer) || 'Sankalp', host, letters: [initial(card.host1), initial(card.host2)].filter(Boolean) };
      if (!this.ctx.letters.length) this.ctx.letters = ['♥'];
      this.layer = sceneLayer(LOOKS[opt.look] ? opt.look : 'vrindavan');
      // A script may give each scene its own look: all are painted now, so the video never stalls on a change.
      this.layers = new Map();
      const art = this.k > 1 ? this.k : 1;
      if (art > 1) this.layer = paint(LOOKS[opt.look] ? opt.look : 'vrindavan', art);
      this.tl.scenes.forEach(sc => { if (sc.look && LOOKS[sc.look] && !this.layers.has(sc.look)) this.layers.set(sc.look, paint(sc.look, art)); });
      return this;
    }
    get total() { return this.tl.total; }
    draw(t) {
      const { c, tl } = this, { scenes, total } = tl;
      t = clamp(t, 0, total - .001);
      const idx = scenes.findIndex(s => t < s.t0 + s.d), s = scenes[idx < 0 ? scenes.length - 1 : idx], p = t - s.t0, last = s === scenes[scenes.length - 1];
      const lookOf = sc => (sc && sc.look && this.layers.has(sc.look) ? sc.look : null);
      const L = lookOf(s) ? LOOKS[s.look] : this.L, layer = lookOf(s) ? this.layers.get(s.look) : this.layer;
      const prev = scenes[scenes.indexOf(s) - 1], prevLook = lookOf(prev), fade = prevLook && prevLook !== s.look ? ease(p / .9) : 1;
      c.setTransform(this.k, 0, 0, this.k, 0, 0);
      c.save(); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
      const intro = ease(t / 4.5), z = 1.2 - .16 * intro + .05 * (t / total);
      c.translate(W / 2 + Math.sin(t * .15) * 10, H / 2 + (1 - intro) * -50); c.scale(z, z); c.translate(-W / 2, -H / 2);
      if (fade < 1) { c.drawImage(this.layers.get(prevLook), 0, 0, W, H); LOOKS[prevLook].anim(c, t); c.globalAlpha = fade; }
      c.drawImage(layer, 0, 0, W, H); L.anim(c, t);
      c.restore();
      // Art in front of the scenery: Ganesha, and the bride and groom rising in at the bottom
      const art = this.opt || {}, photos = art.photos || {};
      if (s.ganesha && art.ganeshaArt !== 'none') {
        c.save(); c.globalAlpha = ease((p - .2) / 1.2);
        const gy = s.ganesha.y; // Shri Ganesh stays still: he only fades in
        const god = photos.ganesha || ganeshaFor(art.story || art.look || '', art.ganeshaId || (STORIES[art.story] || {}).ganesha);
        if (art.ganeshaArt !== 'drawn' && god && ART.cutout && !photos.ganesha) ganeshaCutout(c, god, W / 2, gy, s.ganesha.s, t);
        else if (art.ganeshaArt !== 'drawn' && god) framedPhoto(c, god, W / 2, gy + s.ganesha.s * .06, s.ganesha.s * .92, s.ganesha.s * .92, 'circle', L, t);
        else ganesha(c, W / 2, gy, s.ganesha.s, t);
        c.restore();
      }
      if (s.couple && art.coupleArt !== 'none') {
        c.save(); c.globalAlpha = ease((p - .3) / 1);
        const cy = s.couple.y + (1 - ease((p - .3) / 1.2)) * 60;
        const lib = art.coupleArt !== 'drawn' && !photos.couple && libImage(s.coupleEntry || this.couple);
        if (art.coupleArt !== 'drawn' && photos.couple) { const h = s.couple.s * 1.12, w = h * .78; framedPhoto(c, photos.couple, W / 2, cy - h, w, h, 'arch', L, t); }
        else if (lib) cutout(c, lib, W / 2, cy, s.couple.s, this.v.pose, L, t, !!(s.coupleEntry || this.couple || {}).flip);
        else if (art.coupleArt === 'drawn') couple(c, W / 2, cy, s.couple.s, t);
        c.restore();
      }
      const V = this.v, lay = s.zone ? 'center' : V.layout;
      if (!this.cache.has(s)) this.cache.set(s, layout(c, { ...L, zone: s.zone || zoneFor(lay, L.zone) }, lines(s, this.card, this.opt)));
      const { M, y0 } = this.cache.get(s), out = last ? 1 : 1 - ease((p - (s.d - .6)) / .6);
      const blockH = M.reduce((a, m, i) => a + m.h + (i < M.length - 1 ? m.gap : 0), 0);
      backing(c, lay, L, y0, blockH, ease((p - .1) / .6) * out);
      let y = y0;
      M.forEach((m, i) => {
        const a = ease((p - .25 - i * .16) / .7) * out, k = 1 - a;
        if (a > .01) {
          let x = W / 2, yy = y + k * 26;
          if (V.enter === 'drop') yy = y - k * 34;
          else if (V.enter === 'side') { x = W / 2 + (i % 2 ? 1 : -1) * k * 90; yy = y; }
          if (V.enter === 'zoom') {
            const z = .86 + .14 * a;
            c.save(); c.translate(W / 2, y + m.h / 2); c.scale(z, z); c.translate(-W / 2, -(y + m.h / 2));
            drawItem(c, L, m, x, y, p - .25 - i * .16, a, { ...this.ctx, t });
            c.restore();
          } else drawItem(c, L, m, x, yy, p - .25 - i * .16, a, { ...this.ctx, t });
        }
        y += m.h + m.gap;
      });
      L.fx(c, t);
      if (s.shower) petals(c, t, 70, ['#ff9f1c', '#ffd166', '#ef476f', '#ffffff', '#f4a3c4'], 7, 1.25);
      if (s.sigCorner) {
        // The designer's signature in the bottom-left corner (a client's video ends on it)
        const a = ease((p - .6) / .9), light = isLight(L);
        c.save(); c.globalAlpha = a; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
        c.font = '112px "Great Vibes"';
        const w = Math.max(300, c.measureText(this.ctx.designer).width + 90);
        c.fillStyle = light ? 'rgba(255,253,246,.88)' : 'rgba(10,4,16,.6)'; rrect(c, 36, H - 236, w, 192, 34); c.fill();
        c.strokeStyle = L.col.gold; c.globalAlpha = a * .7; c.lineWidth = 2; rrect(c, 46, H - 226, w - 20, 172, 28); c.stroke(); c.globalAlpha = a;
        c.fillStyle = light ? L.col.ink2 : '#f3e6cf'; c.font = `28px "${L.font.serif}"`; spacing(c, 7); c.fillText('DESIGNED BY', 76, H - 178);
        spacing(c, 0); c.fillStyle = L.col.gold; c.font = '112px "Great Vibes"'; c.fillText(this.ctx.designer, 70, H - 80);
        c.restore();
      } else if (s.k !== 'end' && art.signature !== false) {
        // The credit sits on a soft pill, so it reads on any background
        const light = isLight(L), txt = `Designed by ${this.ctx.designer}`;
        c.save(); c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `26px "${L.font.serif}"`; spacing(c, 2);
        const w = c.measureText(txt).width + 44;
        c.fillStyle = light ? 'rgba(255,253,246,.8)' : 'rgba(15,6,20,.45)'; rrect(c, W / 2 - w / 2, H - 70, w, 44, 22); c.fill();
        c.fillStyle = light ? L.col.ink : '#fff7ea'; c.fillText(txt, W / 2, H - 47); c.restore();
      }
      if (s !== scenes[0]) change(c, this.v.change, p, L);
      if (s.doors) opening(c, this.v.open, clamp((p - .5) / 1.8), t);
      return s;
    }
  }

  const FONTS = ['Dancing Script', 'Great Vibes', 'Playball', 'Satisfy', 'Cookie', 'Marcellus', 'Gilda Display', 'Cinzel', 'Pacifico', 'Fredoka'];
  // Ganesh ji: the illustrations (img/art/cut, listed in js/couples.js as GANESHA_ART) shown full-figure; when
  // there are none, the five photos (credits in img/art/CREDITS.md and credits.html) in a gold circle.
  const GANESHA_PHOTOS = ['ganesha', 'ganesha-2', 'ganesha-3', 'ganesha-4', 'ganesha-5'];
  const ART = { ganeshas: [], cutout: false };
  const loadImg = src => new Promise(resolve => { const img = new Image(); img.onload = () => resolve(img); img.onerror = () => resolve(null); img.src = src; });
  function artReady() {
    if (typeof Image === 'undefined' || ART.ganeshas.length || localFile()) return Promise.resolve();
    const drawn = typeof GANESHA_ART !== 'undefined' && Array.isArray(GANESHA_ART) ? GANESHA_ART : [];
    ART.cutout = drawn.length > 0;
    const srcs = ART.cutout ? drawn.map(g => `img/art/cut/${g.id}.png`) : GANESHA_PHOTOS.map(n => `img/art/${n}.jpg`);
    return Promise.all(srcs.map(loadImg)).then(imgs => { ART.ganeshas = imgs; });
  }
  // Evenly: neighbouring looks and films take the photos in turn (a scene's moods too)
  function ganeshaFor(key, id) {
    const list = ART.ganeshas.filter(Boolean);
    if (!list.length) return null;
    // A film or a client's video may name its own (e.g. 'ganesha-01')
    const own = id && list.find(img => new RegExp(`/${id}\.png$`).test(img.src));
    if (own) return own;
    const ids = [...Object.keys(STORIES), ...Object.keys(LOOKS)], i = ids.indexOf(key);
    if (i >= 0) return list[(i + (i >= Object.keys(STORIES).length ? Math.floor((i - 12) / 20) : 0)) % list.length];
    let h = 3;
    for (const ch of String(key)) h = (h * 29 + ch.charCodeAt(0)) >>> 0;
    return list[h % list.length];
  }
  // Every library picture, so a video never shows a scene before its couple has loaded
  function libReady() {
    return Promise.all(library().map(entry => {
      libImage(entry);
      const img = libImages[entry.id];
      return !img || img.complete ? null : new Promise(r => { img.addEventListener('load', r, { once: true }); img.addEventListener('error', r, { once: true }); });
    }));
  }
  function fontsReady() {
    if (typeof document === 'undefined' || !document.fonts) return Promise.resolve();
    const want = [...FONTS.map(f => `40px "${f}"`), '700 40px "Cinzel Decorative"', 'italic 40px "Cormorant Garamond"'];
    const hindi = ['40px "Yatra One"', '700 40px "Amita"', '40px "Tiro Devanagari Hindi"'].map(f => document.fonts.load(f, 'ॐ शुभ विवाह'));
    return Promise.all([...want.map(f => document.fonts.load(f)), ...hindi, artReady(), libReady()]).catch(() => {});
  }

  // The website's sample video for a scene: the occasion it suits, with sample names (and parents, for weddings).
  const SAMPLE_OCC = { party: 'bday', clouds: 'babyshower', disco: 'kitty', galaxy: 'anniversary', temple: 'ceremony', diwali: 'ceremony', haldi: 'wedding', mehendi: 'sangeet' };
  function sample(scene) {
    const type = SAMPLE_OCC[scene] || 'wedding', card = JSON.parse(JSON.stringify(PRESETS[type].card));
    if (type === 'wedding') card.families = [{ side: 'Bride’s family', parents: 'Mr. & Mrs. Sharma' }, { side: 'Groom’s family', parents: 'Mr. & Mrs. Mehta' }];
    return card;
  }

  return { W, H, LOOKS, SCENES, STORIES, variant, coupleFor, POSES, OPENINGS, CHANGES, LAYOUTS_V, ENTRANCES, SITE_QR, HI, hasCouple, dateRange, lookName, thumb, sample, defaults, timeline, lines, parents, splitIcon, ordinal, phone, sceneName, sceneLayer, Player, fontsReady };
})();

if (typeof module !== 'undefined') module.exports = Studio;
