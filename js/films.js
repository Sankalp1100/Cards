// Premium films: invitation videos drawn live on a canvas, in the style of the maroon-and-gold "Royal Darbar" film.
// An opening, the names, the invitation card, one card per day of functions, the venue, the families, a little
// note and a finale signed by Sankalp. Every film is its own palette × frame (no two share both), with its own
// opening, sparkle and occasion, and made-up sample names, places and numbers (no real person's details).
// js/site.js shows them under Story videos; tools/film-posters.mjs draws their pictures into img/films/.
const Films = (() => {
  const W = 1080, H = 1920;

  // ---------- Palettes ----------
  // bg: centre → edge; gold: highlight, body, shadow; paper/ink: the cream cards; days: the three day screens
  const T = (word, dark, bg, gold, paper, ink, accent, days) => ({ word, dark, bg, gold, paper, ink, accent, days });
  const GOLD = ['#fff3c4', '#e8b84a', '#9c6a14'], ROSE = ['#ffe1d2', '#d49577', '#8a5038'], SILVER = ['#ffffff', '#d3d9e6', '#7c869b'];
  const THEMES = {
    maroon: T('Maroon', true, ['#7d1526', '#270408'], GOLD, '#fbf4e6', '#5a0f1a', '#9b1b30', ['#a8680c', '#0f205e', '#59691a']),
    emerald: T('Emerald', true, ['#11604a', '#03201a'], GOLD, '#f7f3e4', '#0c4434', '#0f6b4f', ['#8a5a0c', '#132a5c', '#7a1f3a']),
    sapphire: T('Sapphire', true, ['#1d3283', '#060a27'], GOLD, '#f6f2e8', '#14235e', '#2a3f9e', ['#a0620e', '#3a1250', '#1d5a46']),
    plum: T('Plum', true, ['#5e1d61', '#1b051f'], GOLD, '#f9f1ec', '#4a1450', '#7a2a7e', ['#9a5b10', '#10245a', '#5d6a1a']),
    onyx: T('Onyx', true, ['#2c2822', '#040404'], GOLD, '#f8f2e2', '#2a2216', '#8a6a1a', ['#7d5410', '#16234a', '#4a1a22']),
    wine: T('Wine', true, ['#80224a', '#2a0716'], ROSE, '#fbf1f1', '#5e1434', '#a32a5a', ['#a35a24', '#24124e', '#365a2a']),
    teal: T('Peacock', true, ['#0e6470', '#021e24'], GOLD, '#f4f2e6', '#0a4048', '#0f7480', ['#9a6510', '#1d1659', '#6e2240']),
    forest: T('Forest', true, ['#33521e', '#0c1705'], GOLD, '#f6f4e4', '#2a3f16', '#4d6b25', ['#9a5e10', '#14275a', '#6a1e30']),
    saffron: T('Saffron', true, ['#bb560e', '#461802'], GOLD, '#fdf5e8', '#6b2a05', '#c2570e', ['#7a1a2a', '#10265e', '#3f5a14']),
    midnight: T('Midnight', true, ['#252d43', '#06080e'], SILVER, '#f4f5f8', '#1d2433', '#3d4a66', ['#5a4a7a', '#0e1c44', '#2d4a4a']),
    ivory: T('Ivory', false, ['#fdf6e7', '#e6cfa4'], ['#e9bc55', '#b8862b', '#6e4c10'], '#fffdf8', '#6b1420', '#9b1b30', ['#c9822a', '#2a3d7a', '#6b7a2a']),
    blush: T('Blush', false, ['#fdeaea', '#e5b3b8'], ['#f3c7b0', '#c48064', '#7f4a34'], '#fffafa', '#7a2e3c', '#b24a62', ['#c77a52', '#5a3a7a', '#5a7a5a']),
    peach: T('Peach', false, ['#fff0e0', '#f2b78f'], ['#f0b34f', '#c47f26', '#6e420c'], '#fffcf7', '#7a3410', '#c25a1e', ['#b8591e', '#2e3f7a', '#4f7a2e']),
    lilac: T('Lilac', false, ['#f3ecfc', '#c8b3ea'], ['#e9cf8e', '#b0893a', '#5e4614'], '#fffdff', '#4a2e7a', '#7a4ec2', ['#b07a3a', '#3a2a7a', '#3a7a6a']),
    mint: T('Mint', false, ['#eaf7f0', '#b0dac3'], ['#e6c56a', '#b08a2c', '#5e4612'], '#fffffb', '#1f5a3e', '#2f8a5e', ['#b07a2a', '#24467a', '#7a3a4a'])
  };
  const FRAMES = { toran: 'Toran', arch: 'Jharokha', mandala: 'Mandala', vine: 'Bagh', deco: 'Deco', lattice: 'Jaali', lotus: 'Kamal' };
  const OPENINGS = ['doors', 'curtains', 'burst', 'envelope', 'mandala'];
  const FX = ['sparkle', 'petals', 'stars', 'bokeh', 'confetti', 'lanterns'];
  const TUNE_FOR = { wedding: ['shehnai', 'royal', 'sitar', 'cinematic', 'sufi', 'santoor'], engagement: ['romantic', 'cinematic'], reception: ['cinematic', 'sufi'],
    sangeet: ['garba', 'baraat'], haldi: ['santoor', 'festive'], mehendi: ['sufi', 'garba'], anniversary: ['romantic', 'calm'], birthday: ['festive'],
    babyshower: ['lullaby'], naming: ['lullaby', 'calm'], housewarming: ['calm', 'santoor'], puja: ['calm', 'sitar'] };

  // ---------- Sample (made-up) people and places ----------
  const COUPLES = [['Rahul', 'Priya', 'राहुल', 'प्रिया'], ['Arjun', 'Meera', 'अर्जुन', 'मीरा'], ['Kabir', 'Ananya', 'कबीर', 'अनन्या'], ['Rohan', 'Isha', 'रोहन', 'ईशा'],
    ['Vivaan', 'Diya', 'विवान', 'दिया'], ['Aditya', 'Kavya', 'आदित्य', 'काव्या'], ['Karan', 'Riya', 'करन', 'रिया'], ['Dev', 'Tara', 'देव', 'तारा'],
    ['Aman', 'Sneha', 'अमन', 'स्नेहा'], ['Yash', 'Nisha', 'यश', 'निशा'], ['Ishaan', 'Pooja', 'ईशान', 'पूजा'], ['Nikhil', 'Aditi', 'निखिल', 'अदिति'],
    ['Varun', 'Simran', 'वरुण', 'सिमरन'], ['Sahil', 'Tanvi', 'साहिल', 'तन्वी'], ['Harsh', 'Neha', 'हर्ष', 'नेहा'], ['Manav', 'Shreya', 'मानव', 'श्रेया']];
  const KIDS = [['Aarav', 'आरव'], ['Kiara', 'कियारा'], ['Advik', 'अद्विक'], ['Myra', 'मायरा'], ['Reyansh', 'रेयांश'], ['Saanvi', 'सान्वी'], ['Vihaan', 'विहान'], ['Anaya', 'अनाया'],
    ['Atharv', 'अथर्व'], ['Pari', 'परी'], ['Shaurya', 'शौर्य'], ['Ira', 'इरा'], ['Kian', 'कियान'], ['Navya', 'नव्या'], ['Rudra', 'रुद्र'], ['Aadya', 'आद्या']];
  const SURNAMES = [['Sharma', 'शर्मा'], ['Verma', 'वर्मा'], ['Agarwal', 'अग्रवाल'], ['Mehta', 'मेहता'], ['Kapoor', 'कपूर'], ['Joshi', 'जोशी'], ['Malhotra', 'मल्होत्रा'], ['Saxena', 'सक्सेना'],
    ['Gupta', 'गुप्ता'], ['Bansal', 'बंसल'], ['Chauhan', 'चौहान'], ['Mittal', 'मित्तल'], ['Rastogi', 'रस्तोगी'], ['Khanna', 'खन्ना'], ['Tiwari', 'तिवारी'], ['Goel', 'गोयल']];
  const CITIES = [['Jaipur', 'जयपुर', '302001'], ['Udaipur', 'उदयपुर', '313001'], ['Lucknow', 'लखनऊ', '226001'], ['Agra', 'आगरा', '282001'],
    ['Indore', 'इंदौर', '452001'], ['Varanasi', 'वाराणसी', '221001'], ['Delhi', 'दिल्ली', '110001'], ['Pune', 'पुणे', '411001']];
  const VENUES = [['The Grand Palace Lawns', 'द ग्रैंड पैलेस लॉन्स'], ['Rose Garden Resort', 'रोज़ गार्डन रिज़ॉर्ट'], ['Shubh Mangal Banquet', 'शुभ मंगल बैंक्वेट'],
    ['Royal Heritage Haveli', 'रॉयल हेरिटेज हवेली'], ['Lotus Greens', 'लोटस ग्रीन्स'], ['Moti Mahal Gardens', 'मोती महल गार्डन्स']];
  const PHONES = '98765 43210 · 91234 56789';

  // ---------- The films ----------
  // Royal Darbar first (the reference film's order of scenes), then 80 more, each a palette × frame no other film uses
  const OCC_SEQ = ['wedding', 'engagement', 'wedding', 'reception', 'haldi', 'wedding', 'sangeet', 'anniversary', 'wedding', 'mehendi', 'birthday',
    'wedding', 'babyshower', 'housewarming', 'wedding', 'puja', 'naming', 'engagement', 'wedding', 'reception'];
  const OCC_LABEL = { wedding: 'Wedding', engagement: 'Engagement', reception: 'Reception', sangeet: 'Sangeet', haldi: 'Haldi', mehendi: 'Mehendi',
    anniversary: 'Anniversary', birthday: 'Birthday', babyshower: 'Baby shower', naming: 'Naming ceremony', housewarming: 'Griha pravesh', puja: 'Puja' };
  function rng(seed) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }
  function buildList() {
    const list = [{ id: 'film-royal-darbar', name: 'Royal Darbar', concept: 'heritage', occ: 'wedding', theme: 'maroon', frame: 'toran', open: ['burst', 'doors'], layout: 'stack', fx: 'sparkle', tune: 'shehnai', lang: 'en', cast: 0 }];
    const pairs = [];
    Object.keys(THEMES).forEach(t => Object.keys(FRAMES).forEach(f => { if (!(t === 'maroon' && f === 'toran')) pairs.push([t, f]); }));
    const r = rng(20261110);
    for (let i = pairs.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [pairs[i], pairs[j]] = [pairs[j], pairs[i]]; }
    // neighbours never share a palette or a frame
    const picked = [];
    while (picked.length < 14) {
      const last = picked[picked.length - 1] || list[0];
      const k = pairs.findIndex(([t, f]) => !last || (t !== (last[0] || last.theme) && f !== (last[1] || last.frame)));
      picked.push(pairs.splice(k < 0 ? 0 : k, 1)[0]);
    }
    const SOLO = ['birthday', 'naming', 'housewarming', 'puja'];
    let solo = 0;
    const groups = { heritage: picked.slice(0, 14).map(([theme, frame], n) => ({ concept: 'heritage', theme, frame, occ: OCC_SEQ[(n + 1) % OCC_SEQ.length], n })) };
    Object.keys(CONCEPT_OCC).forEach(c => { groups[c] = CONCEPT_OCC[c].map((occ, n) => ({ concept: c, pal: n, occ, n })); });
    // smooth weighted round robin: each concept comes up in proportion, never twice in a row
    const keys = Object.keys(groups), weight = Object.fromEntries(keys.map(k => [k, groups[k].length])), total = keys.reduce((s, k) => s + weight[k], 0), cur = Object.fromEntries(keys.map(k => [k, 0]));
    let last = 'heritage';
    for (let i = 1; i <= total; i++) {
      keys.forEach(k => { cur[k] += weight[k]; });
      const k = keys.filter(x => groups[x].length && x !== last).sort((a, b) => cur[b] - cur[a])[0] || keys.find(x => groups[x].length);
      cur[k] -= total; last = k;
      const g = groups[k].shift(), occ = g.occ, tunes = TUNE_FOR[occ];
      const base = { occ, tune: tunes[i % tunes.length], lang: i % 3 === 2 ? 'hi' : 'en', cast: i, solo: SOLO.includes(occ) ? solo++ : 0 };
      if (k === 'heritage') {
        const name = `${THEMES[g.theme].word} ${FRAMES[g.frame]}`;
        list.push({ id: 'film-' + name.toLowerCase().replace(/\s+/g, '-'), name, concept: 'heritage', theme: g.theme, frame: g.frame, open: [OPENINGS[i % OPENINGS.length]],
          layout: ['stack', 'mono', 'split'][i % 3], fx: FX[(i * 5 + Math.floor(i / 6)) % FX.length], ...base });
      } else {
        const C = CONCEPTS[k], pal = C.pals[g.pal], name = `${pal.word} ${C.short}`;
        list.push({ id: 'film-' + `${k}-${pal.word}`.toLowerCase().replace(/\s+/g, '-'), name, concept: k, pal: g.pal, theme: `${k}:${pal.word}`, frame: k, open: [k], fx: C.fx, ...base });
      }
    }
    return list;
  }
  const conceptName = f => f.concept && f.concept !== 'heritage' ? CONCEPTS[f.concept].name : 'Royal Heritage';
  const describe = f => `${conceptName(f)} · ${OCC_LABEL[f.occ]}${f.lang === 'hi' ? ' · हिन्दी' : ''}`;

  // ---------- What each film says (sample details, in English or Hindi) ----------
  function details(film, lang) {
    const hi = lang === 'hi', L = (en, h) => hi ? h : en, n = film.cast;
    const g = COUPLES[n % 16], br = COUPLES[(n + 5 * Math.floor(n / 16)) % 16], c = [g[0], br[1], g[2], br[3]];
    const o = film.solo || 0, kid = KIDS[(film.solo != null && film.occ !== 'wedding' ? o * 5 : n * 7) % 16], kid2 = KIDS[(n * 7 + 3) % 16];
    const s1 = SURNAMES[(['housewarming', 'puja'].includes(film.occ) ? o * 3 + 1 : n * 3 + Math.floor(n / 16)) % 16], s2 = SURNAMES[(n * 3 + 7) % 16], city = CITIES[n % CITIES.length], venue = VENUES[n % VENUES.length];
    const A = L(c[0], c[2]), B = L(c[1], c[3]), S1 = L(s1[0], s1[1]), S2 = L(s2[0], s2[1]), CITY = L(city[0], city[1]), V = L(venue[0], venue[1]);
    const day0 = 8 + (n % 14), month = L('Dec', 'दिसम्बर'), year = 2026;
    const WEEK = hi ? ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'] : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const wd = d => WEEK[new Date(year, 11, d).getDay()];
    const address = L(`House No. ${12 + n % 40}, Rose Garden Colony, ${city[0]} – ${city[2]}`, `मकान नं॰ ${12 + n % 40}, रोज़ गार्डन कॉलोनी, ${city[1]} – ${city[2]}`);
    const venueAddr = L(`Near City Park, Ring Road, ${city[0]} – ${city[2]}`, `सिटी पार्क के पास, रिंग रोड, ${city[1]} – ${city[2]}`);
    const ev = (en, h, icon, time) => ({ name: L(en, h), icon, time });
    const T12 = (h, m = 0) => hi ? `${h > 12 ? h - 12 : h}:${String(m).padStart(2, '0')} ${h < 12 ? 'प्रातः' : h < 17 ? 'दोपहर' : 'सायं'}` : `${h > 12 ? h - 12 : h}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
    const day = (d, events) => ({ d: day0 + d, month, wd: wd(day0 + d), events });
    const d = { lang, A, B, S1, S2, CITY, V, address, venueAddr, phones: PHONES, mono: L(`${c[0][0]} | ${c[1][0]}`, `${c[2][0]} | ${c[3][0]}`),
      hashtag: `#${c[0]}Weds${c[1]}`, kids: L(`${kid[0]}, ${kid2[0]} & ${KIDS[(n * 7 + 5) % 16][0]}`, `${kid[1]}, ${kid2[1]} एवं ${KIDS[(n * 7 + 5) % 16][1]}`) };
    const range = days => L(`${day0} – ${day0 + days - 1} ${month.toUpperCase()} ${year}`, `${day0} – ${day0 + days - 1} ${month} ${year}`);
    const one = L(`${wd(day0)}, ${day0} ${month} ${year}`, `${wd(day0)}, ${day0} ${month} ${year}`);
    const blessing = L('॥ Shri Ganeshaya Namah ॥', '॥ श्री गणेशाय नमः ॥');
    switch (film.occ) {
      case 'wedding': return { ...d, sacred: true, blessing, heading: 'शुभ विवाह', join: L('weds', 'संग'), date: range(3), cardTitle: L('Wedding Ceremony', 'शुभ विवाह'),
        top: L(`With the blessings of Late Smt. Kamla Devi & Late Shri Ramesh ${s1[0]}`, `स्व॰ श्रीमती कमला देवी एवं स्व॰ श्री रमेश ${s1[1]} के आशीर्वाद से`),
        line1: L(`Smt. Sunita & Shri Mahesh ${s1[0]} request the honour of your presence at the wedding of their son`, `श्रीमती सुनीता एवं श्री महेश ${s1[1]} अपने सुपुत्र के शुभ विवाह में आपको सादर आमन्त्रित करते हैं`),
        sub1: L(`Son of Smt. Sunita & Shri Mahesh ${s1[0]}`, `सुपुत्र श्रीमती सुनीता एवं श्री महेश ${s1[1]}`), sub2: L(`Daughter of Smt. Anita & Shri Suresh ${s2[0]}`, `सुपुत्री श्रीमती अनीता एवं श्री सुरेश ${s2[1]}`),
        full1: `${A} ${S1}`, full2: `${B} ${S2}`,
        days: [day(0, [ev('Ganesh Puja', 'गणेश पूजन', 'diya', T12(10)), ev('Kirtan', 'कीर्तन', 'bell', T12(16))]), day(1, [ev('Haldi', 'हल्दी', 'pot', T12(11)), ev('Mehendi', 'मेहँदी', 'leaf', T12(17))]),
          day(2, [ev('Ghudchadhi', 'घुड़चढ़ी', 'arch', T12(16)), ev('Baraat', 'बारात', 'drum', T12(19))])],
        venueLabel: L('MARRIAGE VENUE', 'विवाह स्थल'), venueTop: L('The baraat will leave from our home for', 'बारात निवास से प्रस्थान करके पहुँचेगी'),
        regards: [L('CORDIAL INVITATION FROM', 'दर्शनाभिलाषी'), L(`Smt. Rekha & Shri Vinod ${s1[0]}`, `श्रीमती रेखा एवं श्री विनोद ${s1[1]}`), L(`Smt. Meena & Shri Ajay ${s1[0]}`, `श्रीमती मीना एवं श्री अजय ${s1[1]}`), L(`& the ${s1[0]} family`, `एवं समस्त ${s1[1]} परिवार`)],
        compliments: [L('WITH BEST COMPLIMENTS FROM', 'स्वागतोत्सुक'), d.kids],
        note: { label: L('A little request', 'बाल मनुहार'), lines: L(['Our chachu is getting married,', 'please come, come soon!'], ['हमारे चाचू की शादी में', 'जल्दी-जल्दी आना…']), by: `— ${d.kids}` } };
      case 'engagement': return { ...d, sacred: true, blessing, heading: L('Ring Ceremony', 'सगाई'), join: L('&', 'संग'), date: one, cardTitle: L('Engagement', 'सगाई समारोह'),
        top: L('With the blessings of our elders', 'बड़ों के आशीर्वाद से'), line1: L('Together with their families, invite you to the engagement of', 'अपने परिवारों के साथ आपको सगाई समारोह में आमन्त्रित करते हैं'),
        sub1: L(`Son of Mr. & Mrs. ${s1[0]}`, `सुपुत्र श्री एवं श्रीमती ${s1[1]}`), sub2: L(`Daughter of Mr. & Mrs. ${s2[0]}`, `सुपुत्री श्री एवं श्रीमती ${s2[1]}`), full1: `${A} ${S1}`, full2: `${B} ${S2}`,
        days: [day(0, [ev('Ring Ceremony', 'अँगूठी रस्म', 'ring', T12(18)), ev('Dinner', 'भोज', 'dish', T12(20))])],
        venueLabel: L('VENUE', 'समारोह स्थल'), venueTop: L('Join us at', 'आप पधारें'), regards: [L('WITH LOVE FROM', 'स्नेहाभिलाषी'), L(`The ${s1[0]} & ${s2[0]} families`, `${s1[1]} एवं ${s2[1]} परिवार`)],
        note: { label: L('RSVP', 'कृपया सूचित करें'), lines: L(['Your blessings mean', 'the world to us'], ['आपका आशीर्वाद', 'हमारे लिए अनमोल है']), by: `— ${A} & ${B}` } };
      case 'reception': return { ...d, heading: L('Reception', 'स्वागत समारोह'), join: L('&', 'संग'), date: one, cardTitle: L('Wedding Reception', 'प्रीतिभोज'),
        top: L('Please join us to celebrate the newly-weds', 'नवदम्पति को आशीर्वाद देने हेतु'), line1: L(`Mr. & Mrs. ${s1[0]} invite you to the reception of`, `श्री एवं श्रीमती ${s1[1]} आपको स्वागत समारोह में आमन्त्रित करते हैं`),
        sub1: '', sub2: '', full1: A, full2: B, days: [day(0, [ev('Reception', 'स्वागत', 'glass', T12(19)), ev('Dinner', 'प्रीतिभोज', 'dish', T12(20, 30))])],
        venueLabel: L('VENUE', 'समारोह स्थल'), venueTop: L('An evening at', 'एक शाम'), regards: [L('AWAITING YOU', 'आपकी प्रतीक्षा में'), L(`The ${s1[0]} family`, `${s1[1]} परिवार`)] };
      case 'sangeet': return { ...d, heading: L('Sangeet Night', 'संगीत संध्या'), join: L('&', 'संग'), date: one, cardTitle: L('Sangeet', 'संगीत'),
        top: L('Music, dance and a lot of love', 'संगीत, नृत्य और ढेर सारा प्यार'), line1: L('Come dance with us at the sangeet of', 'संगीत संध्या में नाचने आइए'),
        sub1: '', sub2: '', full1: A, full2: B, days: [day(0, [ev('Sangeet', 'संगीत', 'note', T12(19)), ev('DJ Night', 'डीजे नाइट', 'drum', T12(21))])],
        venueLabel: L('VENUE', 'स्थान'), venueTop: L('Dance floor at', 'डांस फ्लोर'), regards: [L('DRESS CODE', 'ड्रेस कोड'), L('Indo-western, bright colours', 'इंडो-वेस्टर्न, चटक रंग')] };
      case 'haldi': case 'mehendi': {
        const h = film.occ === 'haldi';
        return { ...d, sacred: true, blessing, heading: L(h ? 'Haldi' : 'Mehendi', h ? 'हल्दी' : 'मेहँदी'), join: L('&', 'संग'), date: one, cardTitle: L(h ? 'Haldi Ceremony' : 'Mehendi Ceremony', h ? 'हल्दी रस्म' : 'मेहँदी रस्म'),
          top: L(h ? 'A splash of yellow, a lot of love' : 'Henna, songs and a lot of love', h ? 'पीले रंग की खुशियाँ' : 'मेहँदी के रंग, गीतों के संग'), line1: L(`Join us for the ${h ? 'haldi' : 'mehendi'} of`, `${h ? 'हल्दी' : 'मेहँदी'} की रस्म में आप सादर आमन्त्रित हैं`),
          sub1: '', sub2: '', full1: A, full2: B, days: [day(0, [h ? ev('Haldi', 'हल्दी', 'pot', T12(11)) : ev('Mehendi', 'मेहँदी', 'leaf', T12(16)), ev('Lunch', 'भोज', 'dish', T12(13))])],
          venueLabel: L('AT OUR HOME', 'निवास पर'), venueTop: L('Come in', h ? 'yellow' : 'green', 'पधारें'), regards: [L('DRESS CODE', 'ड्रेस कोड'), L(h ? 'Yellow' : 'Green', h ? 'पीला' : 'हरा')] };
      }
      case 'anniversary': return { ...d, heading: L('25 Years', '25 वर्ष'), join: L('&', 'संग'), date: one, cardTitle: L('Silver Jubilee', 'रजत जयंती'),
        top: L('Twenty-five years of togetherness', 'साथ के पच्चीस वर्ष'), line1: L('Please join us to celebrate the anniversary of', 'वैवाहिक वर्षगाँठ के उत्सव में आप आमन्त्रित हैं'),
        sub1: '', sub2: '', full1: `${L('Mr.', 'श्री')} ${A}`, full2: `${L('Mrs.', 'श्रीमती')} ${B}`, days: [day(0, [ev('Celebration', 'उत्सव', 'glass', T12(19)), ev('Dinner', 'भोज', 'dish', T12(20, 30))])],
        venueLabel: L('VENUE', 'स्थान'), venueTop: L('An evening at', 'एक शाम'), regards: [L('WITH LOVE FROM', 'स्नेह सहित'), L('Their children and grandchildren', 'बच्चे एवं नाती-पोते')] };
      case 'birthday': return { ...d, solo: true, heading: L('Birthday Bash', 'जन्मदिन'), A: L(kid[0], kid[1]), B: '', join: '', date: one, cardTitle: L('Turning 1', 'पहला जन्मदिन'), mono: L(kid[0][0], kid[1][0]),
        top: L('Cake, balloons and you!', 'केक, गुब्बारे और आप!'), line1: L('Come celebrate the first birthday of', 'पहले जन्मदिन की खुशियों में शामिल हों'),
        sub1: L(`Son of Mr. & Mrs. ${s1[0]}`, `सुपुत्र श्री एवं श्रीमती ${s1[1]}`), sub2: '', full1: L(kid[0], kid[1]), full2: '', days: [day(0, [ev('Cake Cutting', 'केक कटिंग', 'cake', T12(18)), ev('Games', 'खेल', 'balloon', T12(19))])],
        venueLabel: L('PARTY AT', 'पार्टी स्थल'), venueTop: L('See you at', 'मिलते हैं'), regards: [L('HOSTED BY', 'आयोजक'), L(`The ${s1[0]} family`, `${s1[1]} परिवार`)] };
      case 'babyshower': return { ...d, solo: true, heading: L('Baby Shower', 'गोद भराई'), A: `${B} & ${A}`, B: '', date: one, cardTitle: L('Godh Bharai', 'गोद भराई'),
        top: L('A little one is on the way', 'नन्हा मेहमान आने वाला है'), line1: L('Join us to shower love and blessings on', 'आशीर्वाद देने पधारें'),
        sub1: '', sub2: '', full1: `${B} & ${A}`, full2: '', days: [day(0, [ev('Godh Bharai', 'गोद भराई', 'pot', T12(12)), ev('Lunch', 'भोज', 'dish', T12(14))])],
        venueLabel: L('VENUE', 'स्थान'), venueTop: L('Join us at', 'आप पधारें'), regards: [L('WITH LOVE FROM', 'स्नेह सहित'), L(`The ${s1[0]} family`, `${s1[1]} परिवार`)] };
      case 'naming': return { ...d, solo: true, sacred: true, blessing, heading: L('Naamkaran', 'नामकरण'), A: L(kid[0], kid[1]), B: '', date: one, cardTitle: L('Naming Ceremony', 'नामकरण संस्कार'), mono: L(kid[0][0], kid[1][0]),
        top: L('Our little star has a name', 'हमारे नन्हे सितारे का नाम'), line1: L('Bless our baby at the naming ceremony', 'नामकरण संस्कार में आशीर्वाद दें'),
        sub1: L(`Child of Mr. & Mrs. ${s1[0]}`, `सन्तान श्री एवं श्रीमती ${s1[1]}`), sub2: '', full1: L(kid[0], kid[1]), full2: '', days: [day(0, [ev('Havan', 'हवन', 'diya', T12(10)), ev('Lunch', 'भोज', 'dish', T12(13))])],
        venueLabel: L('AT OUR HOME', 'निवास पर'), venueTop: L('Please come to', 'कृपया पधारें'), regards: [L('WITH LOVE FROM', 'स्नेह सहित'), L(`The ${s1[0]} family`, `${s1[1]} परिवार`)] };
      case 'housewarming': return { ...d, solo: true, sacred: true, blessing, heading: L('Griha Pravesh', 'गृह प्रवेश'), A: L(`The ${s1[0]} Family`, `${s1[1]} परिवार`), B: '', date: one, cardTitle: L('Our New Home', 'नया घर'), mono: L(s1[0][0], s1[1][0]),
        top: L('A new home, a new beginning', 'नया घर, नई शुरुआत'), line1: L('Please bless our new home', 'हमारे नए घर को आशीर्वाद दें'),
        sub1: '', sub2: '', full1: L(`The ${s1[0]} Family`, `${s1[1]} परिवार`), full2: '', days: [day(0, [ev('Vastu Puja', 'वास्तु पूजा', 'diya', T12(9)), ev('Lunch', 'भोज', 'dish', T12(13))])],
        venueLabel: L('OUR NEW HOME', 'नया निवास'), venueTop: L('Please come to', 'कृपया पधारें'), regards: [L('AWAITING YOU', 'आपकी प्रतीक्षा में'), L(`The ${s1[0]} family`, `${s1[1]} परिवार`)] };
      default: return { ...d, solo: true, sacred: true, blessing, heading: L('Satyanarayan Katha', 'सत्यनारायण कथा'), A: L(`The ${s1[0]} Family`, `${s1[1]} परिवार`), B: '', date: one, cardTitle: L('Puja', 'पूजा'), mono: 'ॐ',
        top: L('With the grace of the Lord', 'प्रभु की कृपा से'), line1: L('Please join us for the katha and prasad', 'कथा एवं प्रसाद में आप सादर आमन्त्रित हैं'),
        sub1: '', sub2: '', full1: L(`The ${s1[0]} Family`, `${s1[1]} परिवार`), full2: '', days: [day(0, [ev('Katha', 'कथा', 'diya', T12(11)), ev('Prasad', 'प्रसाद', 'dish', T12(13))])],
        venueLabel: L('AT OUR HOME', 'निवास पर'), venueTop: L('Please come to', 'कृपया पधारें'), regards: [L('AWAITING YOU', 'आपकी प्रतीक्षा में'), L(`The ${s1[0]} family`, `${s1[1]} परिवार`)] };
    }
  }

  // ---------- The order of scenes ----------
  // ---------- A real card's details in a film (from an order or a card PDF, in the Video Studio) ----------
  // The film keeps its look; every name, date, place and number comes from the card (nothing made up is left).
  const OCC_OF = { bday: 'birthday', kid: 'birthday', kitty: 'birthday', ceremony: 'puja', festive: 'puja', corporate: 'reception', retirement: 'reception',
    roka: 'engagement', mundan: 'naming', janeu: 'puja' };
  const MONTH = { en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    hi: ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितम्बर', 'अक्टूबर', 'नवम्बर', 'दिसम्बर'] };
  const WEEKDAY = { en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], hi: ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'] };
  const ICON_OF = [[/haldi|हल्दी|ubtan/i, 'pot'], [/mehe?n?di|मेहँदी|मेहंदी/i, 'leaf'], [/sangeet|संगीत|dj/i, 'note'], [/baraat|बारात|ghud|घुड़/i, 'drum'],
    [/ring|sagai|सगाई|engagement/i, 'ring'], [/reception|स्वागत|cocktail/i, 'glass'], [/dinner|lunch|bhoj|भोज|prasad|प्रसाद/i, 'dish'], [/kirtan|कीर्तन/i, 'bell'],
    [/cake|birthday|जन्मदिन/i, 'cake'], [/phere|फेरे|mandap|मण्डप|jaimala|जयमाला/i, 'ring']];
  const iconFor = name => (ICON_OF.find(([re]) => re.test(name)) || [0, 'diya'])[1];
  function when(s) {
    const m = typeof s === 'string' && s.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
    return m ? { date: new Date(+m[1], m[2] - 1, +m[3]), h: m[4] != null ? +m[4] : null, min: m[5] != null ? +m[5] : 0 } : null;
  }
  function clock(h, min, hi) {
    if (h == null) return '';
    const hh = h % 12 || 12, mm = String(min).padStart(2, '0');
    return hi ? `${h < 12 ? 'प्रातः' : h < 17 ? 'दोपहर' : 'सायं'} ${hh}:${mm}` : `${hh}:${mm} ${h < 12 ? 'AM' : 'PM'}`;
  }
  function fromCard(film, lang, card) {
    const hi = lang === 'hi', L = (en, h) => hi ? h : en;
    const occ = OCC_OF[card.type] || (OCC_LABEL[card.type] ? card.type : 'wedding');
    const base = details({ ...film, occ }, lang);
    const A = String(card.host1 || '').trim() || base.A, B = String(card.host2 || '').trim(), solo = !B;
    const fam = (card.families || []).map(f => String(f.parents || '').trim()).filter(Boolean);
    // functions grouped by day (at most four days, three functions a day)
    const groups = [];
    (card.events || []).filter(e => e && String(e.name || '').trim()).forEach(e => {
      const w = when(e.date), key = w ? w.date.toDateString() : 'later';
      let g = groups.find(x => x.key === key);
      if (!g) groups.push(g = { key, w, events: [] });
      g.events.push({ name: String(e.name).trim(), icon: iconFor(e.name), time: w ? clock(w.h, w.min, hi) : '' });
    });
    groups.sort((a, b) => (a.w ? a.w.date : Infinity) - (b.w ? b.w.date : Infinity));
    const days = groups.slice(0, 4).map(g => ({ d: g.w ? g.w.date.getDate() : '✦', month: g.w ? MONTH[lang][g.w.date.getMonth()] : '', wd: g.w ? WEEKDAY[lang][g.w.date.getDay()] : '', events: g.events.slice(0, 3) }));
    if (!days.length) { const w = when(card.date); if (w) days.push({ d: w.date.getDate(), month: MONTH[lang][w.date.getMonth()], wd: WEEKDAY[lang][w.date.getDay()], events: [{ name: base.heading, icon: 'glass', time: clock(w.h, w.min, hi) }] }); }
    const dated = groups.filter(g => g.w).map(g => g.w.date), first = dated[0] || (when(card.date) || {}).date, last = dated[dated.length - 1] || first;
    const fmt = d => `${d.getDate()} ${MONTH[lang][d.getMonth()]}`;
    const date = !first ? '' : first.toDateString() === last.toDateString() ? `${WEEKDAY[lang][first.getDay()]}, ${fmt(first)} ${first.getFullYear()}`
      : first.getMonth() === last.getMonth() ? `${first.getDate()} – ${last.getDate()} ${MONTH[lang][first.getMonth()]} ${first.getFullYear()}` : `${fmt(first)} – ${fmt(last)} ${last.getFullYear()}`;
    const venue = String(card.venue || '').trim(), cut = venue.indexOf(',');
    const V = cut > 0 ? venue.slice(0, cut).trim() : venue, venueAddr = cut > 0 ? venue.slice(cut + 1).trim() : '';
    const phones = (card.phones && card.phones.length ? card.phones : card.rsvp ? [card.rsvp] : []).map(p => String(p).replace(/^91(?=\d{10}$)/, '')).join(' · ');
    const address = String(card.address || '').trim();
    const initial = s => (s.match(/[A-Za-z\u0900-\u097F]/) || [''])[0];
    const out = { ...base, solo, A, B, CITY: '', V, venueAddr, date, days, phones, address, compliments: null, kids: '',
      mono: solo ? initial(A) : `${initial(A)} | ${initial(B)}`, hashtag: card.hashtag || (B && /^[A-Za-z]+$/.test(A + B) ? `#${A}Weds${B}` : ''),
      full1: A, full2: B, sub1: '', sub2: '', top: L('With the blessings of our elders', 'बड़ों के आशीर्वाद से'), line1: L('You are warmly invited to celebrate with us', 'आप सादर आमन्त्रित हैं') };
    if (occ === 'wedding') {
      out.line1 = fam[0] ? L(`${fam[0]} request the honour of your presence at the wedding of`, `${fam[0]} आपको शुभ विवाह में सादर आमन्त्रित करते हैं`) : L('request the honour of your presence at the wedding of', 'शुभ विवाह में आप सादर आमन्त्रित हैं');
      out.sub1 = fam[0] ? L(`Son of ${fam[0]}`, `सुपुत्र ${fam[0]}`) : '';
      out.sub2 = fam[1] ? L(`Daughter of ${fam[1]}`, `सुपुत्री ${fam[1]}`) : '';
    }
    if (occ === 'anniversary') out.heading = L('Anniversary', 'वर्षगाँठ');
    out.regards = fam.length ? [L('WITH BLESSINGS FROM', 'आशीर्वाद सहित'), ...fam.slice(0, 3)] : null;
    out.note = phones || address ? { label: L('With love', 'सादर'), lines: L(['We look forward to', 'celebrating with you'], ['आपकी उपस्थिति', 'हमारा सौभाग्य']), by: `— ${solo ? A : `${A} & ${B}`}` } : null;
    return out;
  }
  // The scene buttons' names in the Studio
  const SCENE_NAME = { open: 'Opening', title: 'Names', card: 'Invitation', day: 'Functions', venue: 'Venue', regards: 'Families', note: 'Note', finale: 'Finale' };

  // opts: { skip: ['card', 'day', 'venue', 'regards', 'note'], venueStyle: 'full' | 'name', credit, site }
  function script(film, lang, card, opts = {}) {
    const D = card ? fromCard(film, lang, card) : details(film, lang), s = [];
    D.credit = opts.credit == null ? 'Designed by Sankalp' : opts.credit;
    D.site = opts.site == null ? 'cardalbum.vercel.app' : opts.site;
    D.venueStyle = opts.venueStyle || 'full';
    film.open.forEach(o => s.push({ k: 'open', o, d: o === 'burst' ? 3 : 3.6 }));
    s.push({ k: 'title', d: 5 });
    const skip = new Set(opts.skip || []);
    if (!skip.has('card')) s.push({ k: 'card', d: 6 });
    if (!skip.has('day')) D.days.forEach((day, i) => s.push({ k: 'day', day, i, n: D.days.length, d: D.days.length > 1 ? 3.4 : 4.2 }));
    if (!skip.has('venue') && D.V) s.push({ k: 'venue', d: 4.5 });
    if (D.regards && !skip.has('regards')) s.push({ k: 'regards', d: 4.5 });
    if (D.note && !skip.has('note')) s.push({ k: 'note', d: 5 });
    s.push({ k: 'finale', d: 6 });
    let t = 0;
    s.forEach(x => { x.t0 = t; t += x.d; });
    return { D, scenes: s, total: t };
  }

  // ---------- Drawing helpers ----------
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const ease = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  const out = x => 1 - Math.pow(1 - clamp(x), 3);
  const ap = (lt, start, dur = .7) => out((lt - start) / dur); // 0 → 1 as an element arrives
  function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  // The letters (each concept has its own; Hindi always in Amita / Yatra One / Tiro Devanagari Hindi)
  const FACE0 = { name: '700 {z}px "Playfair Display", serif', head: '400 {z}px "Cinzel", serif', caps: '400 {z}px "Cinzel", serif',
    body: 'italic 400 {z}px "Cormorant Garamond", serif', script: '400 {z}px "Great Vibes", cursive' };
  let FACE = FACE0;
  const lat = (k, z) => FACE[k].replace('{z}', z);
  const FONT = {
    name: (z, hi) => hi ? `700 ${z}px "Amita", serif` : lat('name', z),
    head: (z, hi) => hi ? `${z}px "Yatra One", serif` : lat('head', z),
    caps: (z, hi) => hi ? `${z}px "Tiro Devanagari Hindi", serif` : lat('caps', z),
    body: (z, hi) => hi ? `${z}px "Tiro Devanagari Hindi", serif` : lat('body', z),
    script: (z, hi) => hi ? `700 ${z}px "Amita", serif` : lat('script', z),
    deva: z => `${z}px "Tiro Devanagari Hindi", "Yatra One", serif`
  };
  let NOW = 0; // the film's clock, for the foil shimmer
  const isHi = s => /[ऀ-ॿ]/.test(s);
  function goldFill(ctx, th, y, z) {
    const g = ctx.createLinearGradient(0, y - z * .8, 0, y + z * .25);
    g.addColorStop(0, th.gold[0]); g.addColorStop(.5, th.gold[1]); g.addColorStop(1, th.gold[2]);
    return g;
  }
  // One line of text, shrunk to fit; colour 'gold' paints it in the palette's foil
  function text(ctx, th, s, x, y, o) {
    if (!s) return;
    const { z = 40, font = 'body', color = th.ink, align = 'center', a = 1, maxW = 820, ls = 0, glow = 0, rise = 0 } = o;
    const hi = isHi(s);
    let size = z;
    ctx.font = FONT[font](size, hi);
    const spaced = ls && !hi ? s.split('').join(' '.repeat(Math.max(1, Math.round(ls)))) : s;
    while (ctx.measureText(spaced).width > maxW && size > 14) { size -= 2; ctx.font = FONT[font](size, hi); }
    ctx.save();
    ctx.globalAlpha *= clamp(a);
    ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = color === 'gold' ? goldFill(ctx, th, y, size) : color;
    if (glow) { ctx.shadowColor = th.dark ? 'rgba(255,200,90,.55)' : 'rgba(120,60,10,.25)'; ctx.shadowBlur = glow; }
    const yy = y + (1 - clamp(a)) * rise;
    ctx.fillText(spaced, x, yy);
    if (color === 'gold') {
      const w = ctx.measureText(spaced).width, x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
      const p = ((NOW * .35 + x0 * .0007) % 1.6) - .3, sh = ctx.createLinearGradient(x0 - 60, yy - size, x0 + w + 60, yy);
      const band = q => clamp(q, 0, 1);
      sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(band(p - .08), 'rgba(255,255,255,0)'); sh.addColorStop(band(p), 'rgba(255,255,240,.75)');
      sh.addColorStop(band(p + .08), 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.shadowColor = 'transparent'; ctx.fillStyle = sh; ctx.fillText(spaced, x, yy);
    }
    ctx.restore();
  }
  // Text over several lines (by words), returns the height used
  function para(ctx, th, s, x, y, o) {
    const { z = 34, font = 'body', maxW = 700, lh = 1.35, lines: max = 3 } = o;
    ctx.font = FONT[font](z, isHi(s));
    const words = s.split(' '), lines = [];
    let cur = '';
    words.forEach(w => { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; });
    if (cur) lines.push(cur);
    lines.slice(0, max).forEach((l, i) => text(ctx, th, l, x, y + i * z * lh, { ...o, maxW: maxW + 40 }));
    return Math.min(lines.length, max) * z * lh;
  }
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  const stroke = (ctx, c, w) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.stroke(); };

  // ---------- Backgrounds ----------
  function background(ctx, th, t, tint) {
    const [c0, c1] = tint ? [tint, shade(tint, -.6)] : th.bg;
    const g = ctx.createRadialGradient(W / 2, H * .42, 60, W / 2, H * .5, H * .75);
    g.addColorStop(0, c0); g.addColorStop(1, c1);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const v = ctx.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .72);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, th.dark || tint ? 'rgba(0,0,0,.45)' : 'rgba(90,50,10,.18)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    // a faint mandala watermark, turning slowly
    ctx.save(); ctx.translate(W / 2, H * .45); ctx.rotate(t * .03); ctx.globalAlpha = th.dark || tint ? .07 : .12;
    ctx.strokeStyle = th.dark || tint ? th.gold[1] : th.gold[2]; ctx.lineWidth = 2;
    for (let r = 120; r <= 520; r += 100) { ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke(); }
    for (let i = 0; i < 24; i++) { ctx.rotate(Math.PI / 12); ctx.beginPath(); ctx.ellipse(0, 330, 34, 120, 0, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
  }
  function shade(hex, k) {
    const n = parseInt(hex.slice(1), 16), f = c => Math.round(k < 0 ? c * (1 + k) : c + (255 - c) * k);
    return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
  }
  function particles(ctx, th, fx, t, light) {
    ctx.save();
    const gold = th.gold[0], dark = th.dark || light;
    for (let i = 0; i < 46; i++) {
      const r1 = hash(i), r2 = hash(i + 50), r3 = hash(i + 99);
      if (fx === 'sparkle') {
        const x = r1 * W, y = r2 * H, tw = .5 + .5 * Math.sin(t * (1.5 + r3 * 2) + i), s = 6 + r3 * 12;
        ctx.globalAlpha = (dark ? .75 : .5) * tw; ctx.fillStyle = dark ? gold : th.gold[1];
        ctx.beginPath(); ctx.moveTo(x, y - s); ctx.quadraticCurveTo(x, y, x + s, y); ctx.quadraticCurveTo(x, y, x, y + s); ctx.quadraticCurveTo(x, y, x - s, y); ctx.quadraticCurveTo(x, y, x, y - s); ctx.fill();
      } else if (fx === 'petals') {
        const y = ((r2 * H + t * (60 + r3 * 70)) % (H + 80)) - 40, x = r1 * W + Math.sin(t * .8 + i) * 40;
        ctx.globalAlpha = .7; ctx.fillStyle = i % 3 ? '#ff8fa3' : '#ffb347';
        ctx.save(); ctx.translate(x, y); ctx.rotate(t * (r3 - .5) * 2 + i); ctx.beginPath(); ctx.ellipse(0, 0, 9 + r3 * 6, 5 + r3 * 3, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      } else if (fx === 'stars') {
        const x = r1 * W, y = r2 * H, tw = .4 + .6 * Math.abs(Math.sin(t * (1 + r3) + i * 3));
        ctx.globalAlpha = (dark ? .9 : .55) * tw; ctx.fillStyle = dark ? '#fff' : th.gold[1];
        ctx.beginPath(); ctx.arc(x, y, 1.5 + r3 * 2.5, 0, Math.PI * 2); ctx.fill();
      } else if (fx === 'bokeh') {
        if (i > 18) break;
        const y = H - ((r2 * H + t * (25 + r3 * 30)) % (H + 200)) + 100, x = r1 * W + Math.sin(t * .4 + i) * 30, s = 30 + r3 * 70;
        const g = ctx.createRadialGradient(x, y, 0, x, y, s);
        g.addColorStop(0, dark ? 'rgba(255,215,140,.28)' : 'rgba(200,140,60,.18)'); g.addColorStop(1, 'rgba(255,215,140,0)');
        ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill();
      } else if (fx === 'confetti') {
        const y = ((r2 * H + t * (90 + r3 * 80)) % (H + 60)) - 30, x = r1 * W + Math.sin(t + i) * 20;
        ctx.globalAlpha = .8; ctx.fillStyle = ['#ffd166', '#ef476f', '#06d6a0', '#118ab2', '#f78c6b'][i % 5];
        ctx.save(); ctx.translate(x, y); ctx.rotate(t * 3 * (r3 - .5) + i); ctx.fillRect(-7, -3, 14, 6); ctx.restore();
      } else if (fx === 'lanterns') {
        if (i > 16) break;
        const y = H - ((r2 * H + t * (35 + r3 * 25)) % (H + 160)) + 80, x = r1 * W + Math.sin(t * .6 + i) * 25, s = 14 + r3 * 12;
        const g = ctx.createRadialGradient(x, y, 0, x, y, s * 3);
        g.addColorStop(0, 'rgba(255,190,90,.55)'); g.addColorStop(1, 'rgba(255,150,40,0)');
        ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, s * 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffb347'; rr(ctx, x - s * .55, y - s * .8, s * 1.1, s * 1.5, s * .4); ctx.fill();
      }
    }
    ctx.restore();
  }
  // The day screens get their own life: music notes, a moon and stars, falling leaves
  function dayLife(ctx, kind, t) {
    ctx.save();
    for (let i = 0; i < 26; i++) {
      const r1 = hash(i + 7), r2 = hash(i + 70), r3 = hash(i + 170);
      if (kind === 0) {
        const y = H - ((r2 * H + t * (60 + r3 * 40)) % H), x = r1 * W + Math.sin(t + i) * 20;
        ctx.globalAlpha = .75; ctx.fillStyle = '#ffe08a'; ctx.font = `${34 + r3 * 26}px serif`; ctx.fillText(i % 2 ? '♪' : '♫', x, y);
      } else if (kind === 1) {
        ctx.globalAlpha = .4 + .6 * Math.abs(Math.sin(t * 1.3 + i)); ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(r1 * W, r2 * H * .9, 1.5 + r3 * 2.5, 0, Math.PI * 2); ctx.fill();
      } else {
        const y = ((r2 * H + t * (90 + r3 * 60)) % H), x = r1 * W + Math.sin(t * 1.4 + i) * 30;
        ctx.globalAlpha = .8; ctx.fillStyle = i % 3 ? '#9ccc3a' : '#ffcf3a';
        ctx.save(); ctx.translate(x, y); ctx.rotate(t * 2 + i); ctx.beginPath(); ctx.ellipse(0, 0, 10, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }
    }
    if (kind === 1) {
      ctx.globalAlpha = 1; const g = ctx.createRadialGradient(840, 300, 10, 840, 300, 190);
      g.addColorStop(0, 'rgba(255,240,190,.45)'); g.addColorStop(1, 'rgba(255,240,190,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(840, 300, 190, 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.arc(878, 278, 62, 0, Math.PI * 2, true); ctx.clip();
      ctx.fillStyle = '#ffeeb0'; ctx.beginPath(); ctx.arc(840, 300, 70, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    ctx.restore();
  }

  // ---------- Ornaments ----------
  function corners(ctx, th) {
    ctx.save(); ctx.strokeStyle = th.dark ? th.gold[1] : th.gold[2]; ctx.lineWidth = 3; ctx.globalAlpha = .9;
    [[40, 40, 1, 1], [W - 40, 40, -1, 1], [40, H - 40, 1, -1], [W - 40, H - 40, -1, -1]].forEach(([x, y, sx, sy]) => {
      ctx.beginPath(); ctx.moveTo(x, y + sy * 130); ctx.lineTo(x, y); ctx.lineTo(x + sx * 130, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + sx * 16, y + sy * 90); ctx.lineTo(x + sx * 16, y + sy * 16); ctx.lineTo(x + sx * 90, y + sy * 16); ctx.stroke();
      ctx.beginPath(); ctx.arc(x + sx * 30, y + sy * 30, 6, 0, Math.PI * 2); ctx.stroke();
    });
    ctx.restore();
  }
  // The strip at the foot of every screen: the designer's credit and the website (either, both, or neither)
  function signature(ctx, th, credit, site) {
    if (!credit && !site) return;
    ctx.save();
    const F1 = `italic 400 26px "Cormorant Garamond", ${isHi(credit) ? '"Tiro Devanagari Hindi", ' : ''}serif`, F2 = '400 21px "Cinzel", serif';
    ctx.font = F1; const w1 = credit ? ctx.measureText(credit).width : 0;
    ctx.font = F2; const sep = credit && site ? '  •  ' : '', w2 = site ? ctx.measureText(sep + site).width : 0;
    const w = Math.min(W - 160, w1 + w2 + 64), x = (W - w) / 2, y = H - 118;
    rr(ctx, x, y, w, 54, 27); ctx.fillStyle = th.dark ? 'rgba(0,0,0,.45)' : 'rgba(255,255,255,.6)'; ctx.fill();
    stroke(ctx, th.dark ? th.gold[2] : th.gold[1], 2);
    let tx = x + 32;
    ctx.textAlign = 'left';
    if (credit) { ctx.font = F1; ctx.fillStyle = th.dark ? th.gold[0] : th.ink; ctx.fillText(credit, tx, y + 35, w - 64); tx += w1; }
    if (site) { ctx.font = F2; ctx.fillStyle = th.dark ? '#fff' : th.ink; ctx.fillText(sep + site, tx, y + 35, x + w - 32 - tx); }
    ctx.restore();
  }
  const PANEL = { x: 100, y: 230, w: 880, h: 1420 };
  function mandalaAt(ctx, th, cx, cy, r, a) {
    ctx.save(); ctx.translate(cx, cy); ctx.globalAlpha *= a; ctx.strokeStyle = th.gold[1]; ctx.lineWidth = 2.2;
    for (let k = 1; k <= 3; k++) { ctx.beginPath(); ctx.arc(0, 0, r * k / 3, 0, Math.PI * 2); ctx.stroke(); }
    for (let i = 0; i < 16; i++) { ctx.rotate(Math.PI / 8); ctx.beginPath(); ctx.ellipse(0, r * .55, r * .1, r * .3, 0, 0, Math.PI * 2); ctx.stroke(); }
    for (let i = 0; i < 32; i++) { ctx.rotate(Math.PI / 16); ctx.beginPath(); ctx.arc(0, r * .92, r * .04, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
  }
  function bead(ctx, x, y, r, c) {
    const g = ctx.createRadialGradient(x - r * .3, y - r * .3, 1, x, y, r);
    g.addColorStop(0, '#fff2b0'); g.addColorStop(.45, c); g.addColorStop(1, shade(c, -.35));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  function bell(ctx, th, x, y) {
    ctx.fillStyle = goldFill(ctx, th, y + 20, 30);
    ctx.beginPath(); ctx.moveTo(x - 12, y + 26); ctx.quadraticCurveTo(x - 12, y, x, y); ctx.quadraticCurveTo(x + 12, y, x + 12, y + 26); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(x, y + 30, 4, 0, Math.PI * 2); ctx.fill();
  }
  function lotus(ctx, th, x, y, s, a) {
    ctx.save(); ctx.translate(x, y); ctx.globalAlpha *= a;
    const petal = (rot, len, col) => { ctx.save(); ctx.rotate(rot); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-s * .32, -len * .55, 0, -len); ctx.quadraticCurveTo(s * .32, -len * .55, 0, 0); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = th.gold[1]; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore(); };
    [-1.1, 1.1, -.6, .6].forEach(r => petal(r, s * .85, th.dark ? shade(th.accent, .25) : shade(th.accent, .55)));
    petal(0, s, th.dark ? shade(th.accent, .45) : shade(th.accent, .7));
    ctx.restore();
  }
  // The frame around the screen, drawn on as k goes 0 → 1
  function frame(ctx, film, th, k, t) {
    if (k <= 0) return;
    const { x, y, w, h } = PANEL;
    ctx.save(); ctx.globalAlpha *= clamp(k * 1.4);
    // double gold rule
    rr(ctx, x, y, w, h, 10); stroke(ctx, th.dark ? th.gold[1] : th.gold[2], 3);
    rr(ctx, x + 16, y + 16, w - 32, h - 32, 6); stroke(ctx, th.dark ? th.gold[2] : th.gold[1], 1.5);
    const f = film.frame;
    if (f === 'toran') {
      const swags = 4, sw = (w - 20) / swags;
      for (let i = 0; i < swags; i++) {
        const x0 = x + 10 + i * sw;
        for (let j = 0; j <= 16; j++) { const u = j / 16; if (u > k * 1.2) break; const bx = x0 + u * sw, by = y + 26 + Math.sin(u * Math.PI) * 70; bead(ctx, bx, by, 13, j % 2 ? '#ff8a1c' : '#ffc23a'); }
        const hx = x + 10 + i * sw;
        if (i) { for (let j = 0; j < 5; j++) bead(ctx, hx, y + 40 + j * 24, 11, j % 2 ? '#ff8a1c' : '#ffc23a'); bell(ctx, th, hx, y + 152); }
      }
      [x + 14, x + w - 14].forEach(sx => { for (let j = 0; j < 22 * k; j++) bead(ctx, sx, y + 40 + j * 24, 11, j % 2 ? '#ff8a1c' : '#ffc23a'); bell(ctx, th, sx, y + 40 + 22 * 24); });
    } else if (f === 'arch') {
      ctx.strokeStyle = th.dark ? th.gold[1] : th.gold[2]; ctx.lineWidth = 3;
      const ax = x + 60, aw = w - 120, top = y + 60;
      ctx.beginPath(); ctx.moveTo(ax, y + h - 40); ctx.lineTo(ax, top + 260); ctx.quadraticCurveTo(ax, top + 60, ax + aw / 2, top); ctx.quadraticCurveTo(ax + aw, top + 60, ax + aw, top + 260); ctx.lineTo(ax + aw, y + h - 40); ctx.stroke();
      ctx.fillStyle = goldFill(ctx, th, top - 10, 50); ctx.beginPath(); ctx.arc(x + w / 2, top - 22, 16, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x + w / 2 - 6, top - 38); ctx.lineTo(x + w / 2, top - 70); ctx.lineTo(x + w / 2 + 6, top - 38); ctx.fill();
      for (let i = 0; i < 9; i++) [ax - 26, ax + aw + 26].forEach(px => { ctx.beginPath(); ctx.arc(px, y + h - 80 - i * 120, 8, 0, Math.PI * 2); ctx.stroke(); });
    } else if (f === 'mandala') {
      ctx.save(); rr(ctx, x, y, w, h, 10); ctx.clip();
      [[x, y], [x + w, y], [x, y + h], [x + w, y + h]].forEach(([cx, cy], i) => mandalaAt(ctx, th, cx, cy, 230, k * (th.dark ? .55 : .7)));
      ctx.restore();
      ctx.save(); ctx.translate(x + w / 2, y); ctx.rotate(t * .2); mandalaAt(ctx, th, 0, 0, 70, k); ctx.restore();
    } else if (f === 'vine') {
      ctx.strokeStyle = th.dark ? '#6fae5a' : '#4f8a3c'; ctx.lineWidth = 4;
      [x + 34, x + w - 34].forEach((vx, side) => {
        ctx.beginPath();
        for (let j = 0; j <= 40 * k; j++) { const yy = y + 60 + j * 33, xx = vx + Math.sin(j * .7 + side * 2) * 18; j ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
        ctx.stroke();
        for (let j = 0; j < 40 * k; j += 3) {
          const yy = y + 60 + j * 33, xx = vx + Math.sin(j * .7 + side * 2) * 18;
          ctx.fillStyle = th.dark ? '#7cbf62' : '#5f9c48'; ctx.beginPath(); ctx.ellipse(xx + (j % 2 ? 22 : -22), yy, 18, 8, j % 2 ? -.5 : .5, 0, Math.PI * 2); ctx.fill();
          if (j % 6 === 0) { for (let p = 0; p < 5; p++) { const a = p * Math.PI * 2 / 5 + t * .3; ctx.fillStyle = j % 12 ? '#ff9fb2' : '#ffd36b'; ctx.beginPath(); ctx.arc(xx + Math.cos(a) * 11, yy + Math.sin(a) * 11, 8, 0, Math.PI * 2); ctx.fill(); } ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.arc(xx, yy, 6, 0, Math.PI * 2); ctx.fill(); }
        }
      });
    } else if (f === 'deco') {
      ctx.strokeStyle = th.dark ? th.gold[1] : th.gold[2]; ctx.lineWidth = 2.5;
      const cx = x + w / 2;
      for (let i = 0; i <= 12; i++) { const a = Math.PI + i * Math.PI / 12; ctx.beginPath(); ctx.moveTo(cx, y + 150); ctx.lineTo(cx + Math.cos(a) * 140 * k, y + 150 + Math.sin(a) * 140 * k); ctx.stroke(); }
      ctx.beginPath(); ctx.arc(cx, y + 150, 140 * k, Math.PI, 0); ctx.stroke();
      [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]].forEach(([px, py, sx, sy]) => {
        for (let s2 = 1; s2 <= 3; s2++) { ctx.beginPath(); ctx.moveTo(px + sx * 30 * s2, py + sy * 16); ctx.lineTo(px + sx * 30 * s2, py + sy * 30 * s2); ctx.lineTo(px + sx * 16, py + sy * 30 * s2); ctx.stroke(); }
      });
      ctx.beginPath(); ctx.moveTo(cx - 200, y + h - 90); ctx.lineTo(cx + 200, y + h - 90); ctx.moveTo(cx - 150, y + h - 76); ctx.lineTo(cx + 150, y + h - 76); ctx.stroke();
    } else if (f === 'lattice') {
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.rect(x + 46, y + 46, w - 92, h - 92); ctx.clip('evenodd');
      ctx.strokeStyle = th.dark ? th.gold[1] : th.gold[2]; ctx.lineWidth = 1.6; ctx.globalAlpha *= .8 * k;
      for (let d = -h; d < w + h; d += 28) { ctx.beginPath(); ctx.moveTo(x + d, y); ctx.lineTo(x + d + h, y + h); ctx.moveTo(x + d, y + h); ctx.lineTo(x + d + h, y); ctx.stroke(); }
      ctx.restore();
      rr(ctx, x + 46, y + 46, w - 92, h - 92, 4); stroke(ctx, th.dark ? th.gold[1] : th.gold[2], 2);
    } else if (f === 'lotus') {
      for (let i = 0; i < 7; i++) lotus(ctx, th, x + 90 + i * (w - 180) / 6, y + h - 40, 70, clamp(k * 7 - i));
      lotus(ctx, th, x + w / 2, y + 90, 90, k);
      ctx.strokeStyle = th.dark ? th.gold[2] : th.gold[1]; ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); for (let xx = x + 30; xx < x + w - 30; xx += 10) ctx.lineTo(xx, y + h - 20 + i * 0 + Math.sin(xx * .05 + t * 2 + i) * 4 - i * 0); ctx.stroke(); }
    }
    ctx.restore();
  }
  // The cream card inside the frame (its top is an arch in the Jharokha frame)
  function card(ctx, film, th, a, rise) {
    const x = PANEL.x + 70, y = PANEL.y + 120 + (1 - a) * rise, w = PANEL.w - 140, h = PANEL.h - 220;
    ctx.save(); ctx.globalAlpha *= clamp(a);
    ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 14;
    ctx.beginPath();
    if (film.frame === 'arch') { ctx.moveTo(x, y + h); ctx.lineTo(x, y + 220); ctx.quadraticCurveTo(x, y + 20, x + w / 2, y); ctx.quadraticCurveTo(x + w, y + 20, x + w, y + 220); ctx.lineTo(x + w, y + h); ctx.closePath(); }
    else rr(ctx, x, y, w, h, 26);
    const pg = ctx.createLinearGradient(0, y, 0, y + h);
    pg.addColorStop(0, th.paper); pg.addColorStop(1, shade(th.paper.length === 7 ? th.paper : '#ffffff', -.04));
    ctx.fillStyle = pg; ctx.fill();
    ctx.shadowColor = 'transparent';
    stroke(ctx, th.gold[1], 2.5);
    // inner rule and corner flourishes
    ctx.save(); ctx.clip();
    ctx.beginPath();
    if (film.frame === 'arch') { const i = 20; ctx.moveTo(x + i, y + h - i); ctx.lineTo(x + i, y + 228); ctx.quadraticCurveTo(x + i, y + 40, x + w / 2, y + i + 4); ctx.quadraticCurveTo(x + w - i, y + 40, x + w - i, y + 228); ctx.lineTo(x + w - i, y + h - i); ctx.closePath(); }
    else rr(ctx, x + 20, y + 20, w - 40, h - 40, 14);
    stroke(ctx, th.gold[1], 1.2);
    ctx.strokeStyle = th.gold[1]; ctx.lineWidth = 2;
    const cs = film.frame === 'arch' ? [[x + 34, y + h - 34, 1, -1], [x + w - 34, y + h - 34, -1, -1]] : [[x + 34, y + 34, 1, 1], [x + w - 34, y + 34, -1, 1], [x + 34, y + h - 34, 1, -1], [x + w - 34, y + h - 34, -1, -1]];
    cs.forEach(([px, py, sx, sy]) => {
      ctx.beginPath(); ctx.moveTo(px, py + sy * 60); ctx.quadraticCurveTo(px, py, px + sx * 60, py); ctx.stroke();
      ctx.beginPath(); ctx.arc(px + sx * 14, py + sy * 14, 4, 0, Math.PI * 2); ctx.fillStyle = th.gold[1]; ctx.fill();
    });
    // a little ornament at the foot of the card
    const fy = y + h - 70, cx = x + w / 2;
    ctx.beginPath(); ctx.moveTo(cx - 170, fy); ctx.lineTo(cx - 34, fy); ctx.moveTo(cx + 34, fy); ctx.lineTo(cx + 170, fy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, fy - 18); ctx.lineTo(cx + 18, fy); ctx.lineTo(cx, fy + 18); ctx.lineTo(cx - 18, fy); ctx.closePath(); ctx.fill();
    [-1, 1].forEach(sd => { ctx.beginPath(); ctx.arc(cx + sd * 190, fy, 5, 0, Math.PI * 2); ctx.fill(); });
    ctx.restore();
    ctx.restore();
    return { x, y, w, h, cx: x + w / 2 };
  }
  function monogram(ctx, th, cx, cy, r, s, a, onDark = th.dark) {
    ctx.save(); ctx.globalAlpha *= a;
    const g = ctx.createRadialGradient(cx, cy - r * .3, 4, cx, cy, r);
    g.addColorStop(0, shade(th.accent, .15)); g.addColorStop(1, shade(th.accent, -.35));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = goldFill(ctx, th, cy + r * .5, r * 2); ctx.lineWidth = r * .07; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, r * .82, 0, Math.PI * 2); ctx.lineWidth = r * .025; ctx.stroke();
    ctx.restore();
    const om = s === 'ॐ';
    text(ctx, { ...th, dark: true }, s, cx, cy + r * (om ? .3 : .2), { z: r * (om ? 1.05 : .62), font: om ? 'deva' : 'head', color: 'gold', a, maxW: r * 1.6 });
  }
  function diyas(ctx, th, cx, y, a, t, n = 3) {
    ctx.save(); ctx.globalAlpha *= a;
    for (let i = 0; i < n; i++) {
      const x = cx + (i - (n - 1) / 2) * 110, fl = 1 + Math.sin(t * 9 + i * 2) * .08;
      const g = ctx.createRadialGradient(x, y - 30, 2, x, y - 30, 70); g.addColorStop(0, 'rgba(255,190,80,.6)'); g.addColorStop(1, 'rgba(255,150,40,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y - 30, 70, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = goldFill(ctx, th, y + 10, 30); ctx.beginPath(); ctx.ellipse(x, y, 34, 14, 0, 0, Math.PI); ctx.fill();
      const fg = ctx.createRadialGradient(x, y - 22, 1, x, y - 22, 22 * fl); fg.addColorStop(0, '#fff7c2'); fg.addColorStop(.5, '#ffb22e'); fg.addColorStop(1, 'rgba(255,90,0,0)');
      ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(x, y - 52 * fl); ctx.quadraticCurveTo(x + 13, y - 18, x, y - 4); ctx.quadraticCurveTo(x - 13, y - 18, x, y - 52 * fl); ctx.fill();
    }
    ctx.restore();
  }
  const ICON = { diya: '🪔', bell: '🔔', pot: '🏺', leaf: '🌿', arch: '🐎', drum: '🥁', ring: '💍', dish: '🍽️', glass: '🥂', note: '🎶', cake: '🎂', balloon: '🎈' };

  // ---------- Scenes ----------
  function sceneOpen(ctx, film, th, D, sc, lt) {
    const k = lt / sc.d, cx = W / 2, cy = H * .46;
    if (sc.o === 'burst') {
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(lt * .25);
      for (let i = 0; i < 28; i++) {
        ctx.rotate(Math.PI / 14); const g = ctx.createLinearGradient(0, 0, 0, -900);
        g.addColorStop(0, th.dark ? 'rgba(255,220,150,.35)' : 'rgba(190,130,40,.25)'); g.addColorStop(1, 'rgba(255,220,150,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(-60 * ap(lt, 0, 1.2), -900); ctx.lineTo(60 * ap(lt, 0, 1.2), -900); ctx.lineTo(14, 0); ctx.fill();
      }
      ctx.restore();
      mandalaAt(ctx, th, cx, cy, 230 * ap(lt, .2, 1.2), .8);
      monogram(ctx, th, cx, cy, 120 * (.6 + .4 * ap(lt, .1, 1)), D.sacred ? 'ॐ' : D.mono, ap(lt, 0, .8));
    } else if (sc.o === 'doors' || sc.o === 'curtains') {
      const open = ease((lt - 1.3) / 1.9);
      if (open > .02) { monogram(ctx, th, cx, cy, 130, D.sacred ? 'ॐ' : D.mono, open); }
      for (const side of [-1, 1]) {
        ctx.save();
        const dw = W / 2, x0 = side < 0 ? 0 : W / 2;
        ctx.translate(side < 0 ? 0 : W, 0); ctx.scale(1 - open * .92, 1); ctx.translate(side < 0 ? 0 : -W, 0);
        if (sc.o === 'doors') {
          const g = ctx.createLinearGradient(x0, 0, x0 + dw, 0);
          const base = th.dark ? th.bg[0] : shade(th.accent, .1);
          g.addColorStop(0, shade(base, -.25)); g.addColorStop(.5, base); g.addColorStop(1, shade(base, -.25));
          ctx.fillStyle = g; ctx.fillRect(x0, 0, dw, H);
          ctx.strokeStyle = th.gold[1]; ctx.lineWidth = 4; ctx.strokeRect(x0 + 40, 60, dw - 80, H - 120); ctx.lineWidth = 2; ctx.strokeRect(x0 + 58, 78, dw - 116, H - 156);
          mandalaAt(ctx, th, x0 + dw / 2, 520, 150, 1); mandalaAt(ctx, th, x0 + dw / 2, H - 520, 150, 1);
          ctx.strokeStyle = goldFill(ctx, th, cy + 30, 60); ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(side < 0 ? x0 + dw - 46 : x0 + 46, cy + 40, 26, 0, Math.PI * 2); ctx.stroke();
        } else {
          for (let f = 0; f < 9; f++) {
            const fx = x0 + f * dw / 9, g = ctx.createLinearGradient(fx, 0, fx + dw / 9, 0);
            const base = th.dark ? shade(th.accent, -.2) : th.accent;
            g.addColorStop(0, shade(base, -.45)); g.addColorStop(.5, base); g.addColorStop(1, shade(base, -.45));
            ctx.fillStyle = g; ctx.fillRect(fx, 0, dw / 9 + 1, H);
          }
          ctx.fillStyle = goldFill(ctx, th, 70, 80); ctx.fillRect(x0, 0, dw, 26);
          for (let b = 0; b < 12; b++) { ctx.beginPath(); ctx.arc(x0 + 20 + b * dw / 12, 40, 10, 0, Math.PI * 2); ctx.fill(); }
        }
        ctx.restore();
      }
      if (open < .3) text(ctx, th.dark ? th : { ...th, dark: true }, D.solo ? D.A.toUpperCase() : `${D.A.toUpperCase()}  ✦  ${(D.B || '').toUpperCase()}`, cx, cy - 120, { z: 40, font: 'caps', color: 'gold', a: (1 - open / .3) * ap(lt, .2), maxW: 700, ls: 2 });
    } else if (sc.o === 'envelope') {
      const ew = 880, eh = 600, ex = cx - ew / 2, ey = cy - eh / 2 + 160;
      const lift = ease((lt - 1.4) / 1.6), flap = ease((lt - .6) / 1);
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20; ctx.fillStyle = shade(th.paper, -.06); ctx.fillRect(ex, ey, ew, eh); ctx.shadowColor = 'transparent';
      ctx.fillStyle = th.accent; ctx.fillRect(ex + 14, ey + 14, ew - 28, eh * .4); // the coloured liner
      // the card rising out
      const cy2 = ey + 40 - lift * 380;
      ctx.fillStyle = th.paper; rr(ctx, ex + 50, cy2, ew - 100, eh - 60, 14); ctx.fill(); stroke(ctx, th.gold[1], 2);
      text(ctx, { ...th, dark: false }, D.heading, cx, cy2 + 120, { z: 64, font: isHi(D.heading) ? 'name' : 'head', color: th.accent, a: lift, maxW: ew - 160 });
      text(ctx, { ...th, dark: false }, D.solo ? D.A : `${D.A} & ${D.B}`, cx, cy2 + 210, { z: 56, font: 'script', color: th.ink, a: lift, maxW: ew - 160 });
      // front pocket
      ctx.fillStyle = shade(th.paper, -.1); ctx.beginPath(); ctx.moveTo(ex, ey + eh * .35); ctx.lineTo(cx, ey + eh * .7); ctx.lineTo(ex + ew, ey + eh * .35); ctx.lineTo(ex + ew, ey + eh); ctx.lineTo(ex, ey + eh); ctx.closePath(); ctx.fill(); stroke(ctx, th.gold[1], 2);
      // flap
      ctx.save(); ctx.translate(0, ey); ctx.scale(1, 1 - 2 * flap); ctx.fillStyle = shade(th.paper, -.14);
      ctx.beginPath(); ctx.moveTo(ex, 0); ctx.lineTo(cx, eh * .5); ctx.lineTo(ex + ew, 0); ctx.closePath(); ctx.fill(); stroke(ctx, th.gold[1], 3);
      ctx.beginPath(); ctx.moveTo(ex + 40, 14); ctx.lineTo(cx, eh * .5 - 30); ctx.lineTo(ex + ew - 40, 14); stroke(ctx, th.gold[1], 1.5); ctx.restore();
      if (flap < .5) monogram(ctx, th, cx, ey + eh * .5 * (1 - 2 * flap), 78, D.sacred ? 'ॐ' : D.mono, 1 - flap * 2);
      text(ctx, th, D.solo ? D.A : `${D.A} & ${D.B}`, cx, ey - 120, { z: 72, font: 'script', color: th.dark ? 'gold' : th.accent, a: ap(lt, .2) * (1 - lift), maxW: 860 });
      ctx.restore();
    } else {
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(lt * .5); mandalaAt(ctx, th, 0, 0, 420 * ap(lt, 0, 1.6), 1); ctx.rotate(-lt); mandalaAt(ctx, th, 0, 0, 260 * ap(lt, .3, 1.4), .8); ctx.restore();
      monogram(ctx, th, cx, cy, 110, D.mono, ap(lt, .8));
      text(ctx, th, D.heading, cx, cy + 260, { z: 70, font: isHi(D.heading) ? 'name' : 'head', color: th.dark ? 'gold' : th.accent, a: ap(lt, 1.4), rise: 30 });
    }
  }
  function sceneTitle(ctx, film, th, D, sc, lt) {
    const cx = W / 2, c = th.dark ? 'gold' : th.accent, ink = th.dark ? '#fff' : th.ink, hiHead = isHi(D.heading);
    frame(ctx, film, th, ap(lt, 0, 1.6), lt);
    const glow = th.dark ? 10 : 0;
    let by;
    if (film.layout === 'mono') {
      // a big monogram in a turning mandala, the heading, then the names in script
      ctx.save(); ctx.translate(cx, 610); ctx.rotate(lt * .15); mandalaAt(ctx, th, 0, 0, 230 * ap(lt, 0, 1.2), .9); ctx.restore();
      monogram(ctx, th, cx, 610, 140, D.sacred && D.solo ? 'ॐ' : D.mono, ap(lt, .2));
      text(ctx, th, D.heading, cx, 960, { z: hiHead ? 100 : 80, font: hiHead ? 'name' : 'head', color: c, a: ap(lt, .6), rise: 30, glow: th.dark ? 16 : 0, maxW: 760 });
      text(ctx, th, D.solo ? D.A : `${D.A} ${D.lang === 'hi' ? 'संग' : '&'} ${D.B}`, cx, 1110, { z: D.lang === 'hi' ? 92 : 104, font: D.lang === 'hi' ? 'name' : 'script', color: ink, a: ap(lt, 1), rise: 30, glow, maxW: 780 });
      by = 1230;
    } else if (film.layout === 'split') {
      // the names left and right of a tall gold ampersand
      if (D.sacred) text(ctx, th, '॥ श्री गणेशाय नमः ॥', cx, 470, { z: 30, font: 'deva', color: c, a: ap(lt, .2) });
      text(ctx, th, D.heading, cx, 600, { z: hiHead ? 104 : 86, font: hiHead ? 'name' : 'head', color: c, a: ap(lt, .4), rise: 30, glow: th.dark ? 16 : 0, maxW: 760 });
      if (D.solo) { text(ctx, th, D.A, cx, 900, { z: 120, font: 'name', color: ink, a: ap(lt, .8), rise: 40, glow, maxW: 760 }); by = 1060; }
      else {
        text(ctx, th, D.lang === 'hi' ? '&' : '&', cx, 1010, { z: 360, font: 'script', color: c, a: ap(lt, .6) * .55 });
        text(ctx, th, D.A, cx - 30, 830, { z: 112, font: 'name', color: ink, a: ap(lt, .9), rise: 40, glow, maxW: 600, align: 'center' });
        text(ctx, th, D.B, cx + 30, 1090, { z: 112, font: 'name', color: ink, a: ap(lt, 1.2), rise: 40, glow, maxW: 600, align: 'center' });
        by = 1230;
      }
    } else {
      let y = 520;
      monogram(ctx, th, cx, y - 70, 70, D.sacred ? 'ॐ' : D.mono, ap(lt, .1));
      if (D.sacred) text(ctx, th, '॥ श्री गणेशाय नमः ॥', cx, y + 60, { z: 30, font: 'deva', color: c, a: ap(lt, .3) });
      text(ctx, th, D.heading, cx, y + 190, { z: hiHead ? 112 : 92, font: hiHead ? 'name' : 'head', color: c, a: ap(lt, .5), rise: 40, glow: th.dark ? 18 : 0, maxW: 760 });
      text(ctx, th, '— ✦ —', cx, y + 250, { z: 30, font: 'caps', color: c, a: ap(lt, .7) });
      if (D.solo) text(ctx, th, D.A, cx, y + 400, { z: 104, font: 'name', color: ink, a: ap(lt, .9), rise: 40, glow, maxW: 760 });
      else {
        text(ctx, th, D.A, cx, y + 380, { z: 110, font: 'name', color: ink, a: ap(lt, .9), rise: 40, glow, maxW: 760 });
        text(ctx, th, D.join, cx, y + 462, { z: 78, font: 'script', color: c, a: ap(lt, 1.15) });
        text(ctx, th, D.B, cx, y + 570, { z: 110, font: 'name', color: ink, a: ap(lt, 1.35), rise: 40, glow, maxW: 760 });
      }
      by = D.solo ? y + 500 : y + 650;
    }
    ctx.save(); ctx.globalAlpha = ap(lt, 1.7);
    ctx.font = FONT.caps(30, isHi(D.date)); const dw = Math.min(700, ctx.measureText(D.date).width + 80);
    ctx.strokeStyle = th.dark ? th.gold[1] : th.gold[2]; ctx.lineWidth = 2; ctx.strokeRect(cx - dw / 2, by - 44, dw, 64); ctx.strokeRect(cx - dw / 2 + 6, by - 38, dw - 12, 52);
    ctx.restore();
    text(ctx, th, D.date, cx, by, { z: 30, font: 'caps', color: ink, a: ap(lt, 1.7), maxW: 640 });
    text(ctx, th, [D.V, D.CITY].filter(Boolean).join(' · '), cx, by + 76, { z: 34, font: 'body', color: c, a: ap(lt, 2) });
    diyas(ctx, th, cx, 1500, ap(lt, 2.2), lt);
  }
  function sceneCard(ctx, film, th, D, sc, lt) {
    const c = holder(ctx, film, th, lt, 120); th = c.th || th;
    const top = c.y + (film.frame === 'arch' ? 170 : 110), room = c.y + c.h - 130 - top;
    const used = cardBody(ctx, film, th, D, c, top, lt, true) - top;
    cardBody(ctx, film, th, D, c, top + Math.max(0, (room - used) / 2), lt, false);
  }
  // The invitation's words; a ghost pass measures them so short cards sit in the middle
  function cardBody(ctx, film, th, D, c, y, lt, ghost) {
    const lightTh = { ...th, dark: false }, cx = c.cx;
    ctx.save(); if (ghost) ctx.globalAlpha = 0;
    monogram(ctx, th, cx, y, 46, D.sacred ? 'ॐ' : D.mono, ap(lt, .3), false); y += 90;
    if (D.sacred) { text(ctx, lightTh, '॥ श्री गणेशाय नमः ॥', cx, y, { z: 26, font: 'deva', color: th.accent, a: ap(lt, .45) }); y += 50; }
    y += para(ctx, lightTh, D.top, cx, y, { z: 32, font: 'body', color: th.ink, a: ap(lt, .6), maxW: c.w - 120, lines: 2 }) + 16;
    y += para(ctx, lightTh, D.line1, cx, y, { z: 32, font: 'body', color: shade(th.ink, .25), a: ap(lt, .8), maxW: c.w - 120, lines: 3 }) + 30;
    text(ctx, lightTh, D.cardTitle, cx, y + 30, { z: 70, font: 'script', color: th.gold[2], a: ap(lt, 1.05) }); y += 125;
    text(ctx, lightTh, D.full1, cx, y, { z: 80, font: 'name', color: th.accent, a: ap(lt, 1.3), rise: 30, maxW: c.w - 100 }); y += 50;
    if (D.sub1) { text(ctx, lightTh, D.sub1, cx, y, { z: 30, font: 'body', color: shade(th.ink, .3), a: ap(lt, 1.45), maxW: c.w - 100 }); y += 30; }
    if (D.full2) {
      text(ctx, lightTh, D.join || '&', cx, y + 66, { z: 72, font: 'script', color: th.gold[2], a: ap(lt, 1.7) }); y += 160;
      text(ctx, lightTh, D.full2, cx, y, { z: 80, font: 'name', color: th.accent, a: ap(lt, 1.9), rise: 30, maxW: c.w - 100 }); y += 50;
      if (D.sub2) { text(ctx, lightTh, D.sub2, cx, y, { z: 30, font: 'body', color: shade(th.ink, .3), a: ap(lt, 2.05), maxW: c.w - 100 }); y += 30; }
    }
    if (!D.full2) { y += 40; text(ctx, lightTh, D.date, cx, y + 30, { z: 34, font: 'caps', color: th.ink, a: ap(lt, 1.7), maxW: c.w - 120 }); y += 60; }
    ctx.restore();
    return y;
  }
  function sceneDay(ctx, film, th, D, sc, lt) {
    const hi = D.lang === 'hi', cx = W / 2, tint = sc.n > 1 ? th.days[sc.i % 3] : shade(th.accent, th.dark ? .05 : -.15);
    background(ctx, th, lt, tint);
    dayLife(ctx, sc.n > 1 ? sc.i % 3 : film.cast % 3, lt);
    const tw = { ...th, dark: true, gold: GOLD };
    const label = sc.n > 1 ? (hi ? `दिन ${sc.i + 1}` : `DAY 0${sc.i + 1}`) : (hi ? 'कार्यक्रम' : 'THE CELEBRATION');
    text(ctx, tw, D.solo ? D.A : `${D.A} & ${D.B}`, cx, 600, { z: 64, font: 'script', color: '#fff', a: ap(lt, .1), maxW: 820 });
    text(ctx, tw, label, cx, 760, { z: 76, font: 'head', color: 'gold', a: ap(lt, .2), rise: 30, ls: 3, glow: 16 });
    ctx.save(); ctx.globalAlpha = ap(lt, .3); ctx.strokeStyle = th.gold[0]; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx - 260, 800); ctx.lineTo(cx - 30, 800); ctx.moveTo(cx + 30, 800); ctx.lineTo(cx + 260, 800); ctx.stroke(); ctx.restore();
    const slide = 1 - out((lt - .45) / .8), x = 60 + slide * 900, y = 860, w = W - 120, h = 290;
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 40; rr(ctx, x, y, w, h, 24); ctx.fillStyle = th.paper; ctx.fill(); ctx.restore();
    rr(ctx, x, y, w, h, 24); stroke(ctx, th.gold[1], 2.5);
    // date disc
    const dx = x + 120, dy = y + h / 2;
    monogram(ctx, th, dx, dy, 88, '', 1, false);
    const lt2 = { ...th, dark: true };
    text(ctx, lt2, String(sc.day.d).padStart(2, '0'), dx, dy + 6, { z: 64, font: 'name', color: 'gold', maxW: 140 });
    text(ctx, lt2, sc.day.month.toUpperCase(), dx, dy + 40, { z: 22, font: 'caps', color: '#fff', maxW: 140 });
    text(ctx, lt2, sc.day.wd, dx, dy + 66, { z: 20, font: 'body', color: '#ffe9b0', maxW: 150 });
    const lightTh = { ...th, dark: false };
    sc.day.events.forEach((e, i) => {
      const ex = x + 250 + i * (w - 270) / sc.day.events.length, a = ap(lt, .9 + i * .25), ew = (w - 290) / sc.day.events.length;
      text(ctx, lightTh, ICON[e.icon] || '✦', ex + 34, dy - 4, { z: 46, font: 'caps', color: th.accent, a, maxW: 70 });
      text(ctx, lightTh, e.name, ex + 82, dy - 6, { z: 50, font: hi ? 'name' : 'name', color: th.ink, align: 'left', a, maxW: ew - 90 });
      text(ctx, lightTh, e.time, ex + 82, dy + 44, { z: 30, font: 'caps', color: shade(th.ink, .3), align: 'left', a, maxW: ew - 90 });
    });
    text(ctx, tw, `${sc.day.wd} · ${sc.day.d} ${sc.day.month}`, cx, y + h + 110, { z: 40, font: 'body', color: '#fff', a: ap(lt, 1.3) });
    diyas(ctx, th, cx, y + h + 330, ap(lt, 1.5), lt);
  }
  function sceneVenue(ctx, film, th, D, sc, lt) {
    const c = holder(ctx, film, th, lt, 100); th = c.th || th;
    const top = c.y + (film.frame === 'arch' ? 230 : 130), room = c.y + c.h - 130 - top;
    const used = venueBody(ctx, film, th, D, c, top, lt, true) - top;
    venueBody(ctx, film, th, D, c, top + Math.max(0, (room - used) / 2), lt, false);
  }
  function venueBody(ctx, film, th, D, c, y, lt, ghost) {
    const lightTh = { ...th, dark: false }, cx = c.cx;
    ctx.save(); if (ghost) ctx.globalAlpha = 0;
    y += 40;
    y += para(ctx, lightTh, D.venueTop, cx, y, { z: 36, font: 'body', color: shade(th.ink, .25), a: ap(lt, .3), maxW: c.w - 140, lines: 2 }) + 90;
    ctx.save(); ctx.globalAlpha *= ap(lt, .5); const py = y + 10 - (1 - out((lt - .5) / .6)) * 60;
    ctx.strokeStyle = th.gold[1]; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(cx, py + 34, 70 + Math.sin(lt * 3) * 6, 18, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = th.accent; ctx.beginPath(); ctx.arc(cx, py - 44, 46, Math.PI, 0); ctx.lineTo(cx, py + 34); ctx.closePath(); ctx.fill();
    ctx.fillStyle = th.paper; ctx.beginPath(); ctx.arc(cx, py - 46, 18, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    y += 130;
    text(ctx, lightTh, D.venueLabel, cx, y, { z: 32, font: 'caps', color: th.gold[2], a: ap(lt, .8), ls: 2 }); y += 110;
    y += para(ctx, lightTh, D.lang === 'hi' ? D.V : D.V.toUpperCase(), cx, y, { z: 70, font: D.lang === 'hi' ? 'name' : 'head', color: th.accent, a: ap(lt, 1), maxW: c.w - 120, lines: 2, lh: 1.15 }) + 10;
    if (D.venueStyle !== 'name') y += para(ctx, lightTh, D.venueAddr, cx, y, { z: 36, font: 'body', color: th.ink, a: ap(lt, 1.3), maxW: c.w - 160, lines: 2 }) + 20;
    text(ctx, lightTh, '— ✦ —', cx, y + 10, { z: 30, font: 'caps', color: th.gold[1], a: ap(lt, 1.5) });
    text(ctx, lightTh, D.date, cx, y + 90, { z: 40, font: 'caps', color: th.ink, a: ap(lt, 1.6), maxW: c.w - 120 }); y += 130;
    mandalaAt(ctx, th, cx, y + 70, 86, ap(lt, 1.8) * .7); monogram(ctx, th, cx, y + 70, 46, D.mono, ap(lt, 1.8), false); y += 170;
    ctx.restore();
    return y;
  }
  function sceneRegards(ctx, film, th, D, sc, lt) {
    const c = holder(ctx, film, th, lt, 100), cx = c.cx; th = c.th || th;
    const lightTh = { ...th, dark: false };
    const groups = [D.regards, D.compliments].filter(Boolean);
    const blockH = groups.reduce((h, g) => h + 90 + (g.length - 1) * 76, 0) + (groups.length - 1) * 70 + 220;
    let y = c.y + (film.frame === 'arch' ? 90 : 20) + (c.h - blockH) / 2 + 60, n = 0;
    groups.forEach((g, gi) => {
      if (gi) y += 70;
      g.forEach((l, i) => { text(ctx, lightTh, l, cx, y, { z: i ? 46 : 32, font: i ? 'body' : 'caps', color: i ? th.ink : th.gold[2], a: ap(lt, .3 + n++ * .2), ls: i ? 0 : 2, maxW: c.w - 120 }); y += i ? 76 : 90; });
    });
    mandalaAt(ctx, th, cx, y + 120, 110, ap(lt, 1.6) * .7);
    monogram(ctx, th, cx, y + 120, 62, D.mono, ap(lt, 1.8), false);
  }
  function sceneNote(ctx, film, th, D, sc, lt) {
    const c = holder(ctx, film, th, lt, 100), cx = c.cx; th = c.th || th;
    const lightTh = { ...th, dark: false };
    const by = c.y + (film.frame === 'arch' ? 230 : 150), bw = c.w - 100, bh = 330;
    ctx.save(); ctx.globalAlpha = ap(lt, .3); rr(ctx, cx - bw / 2, by, bw, bh, 18); ctx.fillStyle = th.accent; ctx.fill(); stroke(ctx, th.gold[1], 3);
    rr(ctx, cx - 150, by - 26, 300, 52, 26); ctx.fillStyle = goldFill(ctx, th, by + 10, 60); ctx.fill(); ctx.restore();
    text(ctx, lightTh, D.note.label, cx, by + 10, { z: 28, font: 'caps', color: th.ink, a: ap(lt, .4), maxW: 270 });
    const dk = { ...th, dark: true };
    D.note.lines.forEach((l, i) => text(ctx, dk, l, cx, by + 120 + i * 70, { z: 48, font: 'name', color: '#fff', a: ap(lt, .6 + i * .2), maxW: bw - 60 }));
    text(ctx, dk, D.note.by, cx, by + 290, { z: 30, font: 'body', color: th.gold[0], a: ap(lt, 1.1), maxW: bw - 60 });
    let y = by + bh + 110;
    text(ctx, lightTh, D.lang === 'hi' ? 'निवास' : 'HOME ADDRESS', cx, y, { z: 26, font: 'caps', color: th.gold[2], a: ap(lt, 1.3), ls: 2 }); y += 56;
    y += para(ctx, lightTh, D.address, cx, y, { z: 32, font: 'body', color: th.ink, a: ap(lt, 1.4), maxW: c.w - 160, lines: 2 }) + 40;
    text(ctx, lightTh, D.lang === 'hi' ? 'सम्पर्क' : 'FOR DETAILS', cx, y, { z: 26, font: 'caps', color: th.gold[2], a: ap(lt, 1.6), ls: 2 }); y += 70;
    text(ctx, lightTh, D.phones, cx, y, { z: 50, font: 'name', color: th.accent, a: ap(lt, 1.7), maxW: c.w - 100 }); y += 60;
    text(ctx, lightTh, D.hashtag, cx, y, { z: 30, font: 'body', color: shade(th.ink, .3), a: ap(lt, 1.9) });
  }
  function sceneFinale(ctx, film, th, D, sc, lt) {
    const cx = W / 2, c = th.dark ? 'gold' : th.accent, ink = th.dark ? '#fff' : th.ink;
    // a fan of little cards, then the names again
    const fan = 1 - ease((lt - 1.6) / 1);
    if (fan > 0) {
      for (let i = 4; i >= 0; i--) {
        ctx.save(); ctx.globalAlpha = fan; ctx.translate(cx - 60, 1050); ctx.rotate((-.5 + i * .16) * ap(lt, 0, 1.2));
        rr(ctx, -150, -420, 300, 460, 16); ctx.fillStyle = i ? th.paper : th.bg[0]; ctx.fill(); stroke(ctx, th.gold[1], 3);
        if (!i) { text(ctx, { ...th, dark: true }, D.heading, 0, -260, { z: 46, font: isHi(D.heading) ? 'name' : 'head', color: 'gold', maxW: 240 }); text(ctx, { ...th, dark: true }, D.A, 0, -160, { z: 44, font: 'name', color: '#fff', maxW: 240 }); if (D.B) text(ctx, { ...th, dark: true }, D.B, 0, -90, { z: 44, font: 'name', color: '#fff', maxW: 240 }); }
        ctx.restore();
      }
    }
    const a = ease((lt - 2) / 1);
    if (a > 0) {
      frame(ctx, film, th, a, lt);
      monogram(ctx, th, cx, 520, 66, D.sacred ? 'ॐ' : D.mono, a);
      text(ctx, th, D.heading, cx, 740, { z: isHi(D.heading) ? 100 : 84, font: isHi(D.heading) ? 'name' : 'head', color: c, a, glow: th.dark ? 16 : 0, maxW: 760 });
      text(ctx, th, D.A, cx, 900, { z: 96, font: 'name', color: ink, a: ap(lt, 2.3), maxW: 760 });
      if (D.B) { text(ctx, th, D.join, cx, 980, { z: 68, font: 'script', color: c, a: ap(lt, 2.5) }); text(ctx, th, D.B, cx, 1080, { z: 96, font: 'name', color: ink, a: ap(lt, 2.7), maxW: 760 }); }
      text(ctx, th, D.date, cx, 1180, { z: 30, font: 'caps', color: ink, a: ap(lt, 2.9), maxW: 640 });
      diyas(ctx, th, cx, 1330, ap(lt, 3), lt);
      if (D.credit) text(ctx, th, D.credit === 'Designed by Sankalp' ? 'Designed with ♥ by Sankalp' : D.credit, cx, 1470, { z: 46, font: 'script', color: c, a: ap(lt, 3.4), glow: th.dark ? 12 : 0 });
      if (D.site) text(ctx, th, D.site, cx, 1530, { z: 30, font: 'caps', color: ink, a: ap(lt, 3.6), ls: 1 });
    }
  }
  const SCENES = { open: sceneOpen, title: sceneTitle, card: sceneCard, day: sceneDay, venue: sceneVenue, regards: sceneRegards, note: sceneNote, finale: sceneFinale };

  // ---------- Concepts: eleven more ways to tell the story (Royal Heritage is the frames above) ----------
  // Each concept has its own palettes, letters, opening, names screen, day screens, a holder for the words
  // (a card, a polaroid note, a ticket, a scroll, a newspaper column…) and its own way from one screen to the next.
  const P6 = (word, dark, bg, gold, paper, ink, accent, x = {}) => ({ word, dark, bg, gold, paper, ink, accent, days: [accent, accent, accent], ...x });
  const face = (name, head, caps, body, script) => ({ name, head, caps, body, script });
  const tw = (th, dark) => ({ ...th, dark });
  const credit = (ctx, th, D, lt, y, col) => {
    if (D.credit) text(ctx, th, D.credit === 'Designed by Sankalp' ? 'Designed with ♥ by Sankalp' : D.credit, W / 2, y, { z: 44, font: 'script', color: col, a: ap(lt, 2.6) });
    if (D.site) text(ctx, th, D.site, W / 2, y + 56, { z: 28, font: 'caps', color: col, a: ap(lt, 2.8), ls: 1 });
  };
  const who2 = (D, hi) => D.solo ? D.A : `${D.A} ${hi ? 'संग' : '&'} ${D.B}`;
  const dayLabel = (D, sc) => sc.n > 1 ? (D.lang === 'hi' ? `दिन ${sc.i + 1}` : `DAY 0${sc.i + 1}`) : (D.lang === 'hi' ? 'कार्यक्रम' : 'THE CELEBRATION');
  // a day's functions as rows: name on the left, time on the right
  function rows(ctx, th, day, x, y, w, lt, o = {}) {
    const { z = 58, gap = 120, col = th.ink, tcol = th.accent, start = .7, align = 'split' } = o;
    day.events.forEach((e, i) => {
      const a = ap(lt, start + i * .22), yy = y + i * gap;
      if (align === 'center') {
        text(ctx, th, e.name, x + w / 2, yy, { z, font: 'name', color: col, a, rise: 24, maxW: w });
        text(ctx, th, e.time, x + w / 2, yy + z * .75, { z: z * .5, font: 'caps', color: tcol, a, maxW: w });
      } else {
        text(ctx, th, e.name, x, yy, { z, font: 'name', color: col, align: 'left', a, rise: 24, maxW: w * .62 });
        text(ctx, th, e.time, x + w, yy, { z: z * .52, font: 'caps', color: tcol, align: 'right', a, maxW: w * .36 });
        ctx.save(); ctx.globalAlpha = a * .35; ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, yy + 30); ctx.lineTo(x + w, yy + 30); ctx.stroke(); ctx.restore();
      }
    });
  }
  const dateBits = (D, sc) => ({ d: String(sc.day.d).padStart(2, '0'), m: String(sc.day.month).toUpperCase(), wd: sc.day.wd });

  // ===== Minimal Modern: white space, big serif names set to the left, thin lines =====
  const MINIMAL = {
    short: 'Minimal', name: 'Minimal Modern', trans: 'up', fx: 'none',
    face: face('400 {z}px "DM Serif Display", serif', '600 {z}px "Jost", sans-serif', '600 {z}px "Jost", sans-serif', '400 {z}px "Jost", sans-serif', '400 {z}px "Great Vibes", cursive'),
    pals: [P6('Ivory', false, ['#f8f5ef', '#eee7dc'], ['#c9a46a', '#8c6d3f', '#5a4426'], '#ffffff', '#1f1f1f', '#8c6d3f'),
      P6('Sage', false, ['#f0f3ec', '#e0e7d8'], ['#93a57f', '#5f7350', '#3d4a33'], '#fbfcf9', '#22301c', '#5f7350'),
      P6('Terracotta', false, ['#f7efe7', '#ecdbca'], ['#d9926b', '#b05f3a', '#6e3720'], '#fffaf6', '#3a2218', '#b05f3a'),
      P6('Dusk', false, ['#f8efef', '#eddada'], ['#d29c9c', '#a86868', '#6b3d3d'], '#fffafa', '#3b2626', '#a86868'),
      P6('Ink', false, ['#f0f2f7', '#dfe4ee'], ['#7d8fb3', '#34466b', '#1d2a45'], '#ffffff', '#16213a', '#34466b'),
      P6('Noir', true, ['#181818', '#0b0b0b'], ['#ffffff', '#d9c7a7', '#9a8462'], '#1d1d1d', '#f4f4f4', '#d9c7a7')],
    bg(ctx, th, t) {
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, th.bg[0]); g.addColorStop(1, th.bg[1]);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.globalAlpha = .18; ctx.strokeStyle = th.ink; ctx.lineWidth = 1.5; ctx.strokeRect(60, 60, W - 120, H - 120); ctx.restore();
    },
    open(ctx, film, th, D, sc, lt) {
      const cx = W / 2, cy = H / 2, k1 = ease(lt / 1.1), k2 = ease((lt - 1) / 1.1);
      ctx.save(); ctx.strokeStyle = th.ink; ctx.lineWidth = 2.5; ctx.globalAlpha = .8;
      const hw = 340 * k1;
      if (k2 <= 0) { ctx.beginPath(); ctx.moveTo(cx - hw, cy); ctx.lineTo(cx + hw, cy); ctx.stroke(); }
      else { const hh = 420 * k2; ctx.strokeRect(cx - 340, cy - hh, 680, hh * 2); }
      ctx.restore();
      text(ctx, th, D.solo ? D.A.slice(0, 1) : `${D.A.slice(0, 1)} & ${D.B.slice(0, 1)}`, cx, cy + 50, { z: 170, font: 'name', color: th.ink, a: ap(lt, 1.8, .9) });
      text(ctx, th, D.heading.toUpperCase(), cx, cy + 200, { z: 30, font: 'caps', color: th.accent, a: ap(lt, 2.2), ls: 6 });
    },
    title(ctx, film, th, D, sc, lt) {
      const x = 140, sl = s => (1 - ap(lt, s)) * -70, hi = D.lang === 'hi';
      text(ctx, th, (hi ? D.heading : D.heading.toUpperCase()), x + sl(.1), 470, { z: 34, font: 'caps', color: th.accent, align: 'left', a: ap(lt, .1), ls: 6 });
      if (D.solo) text(ctx, th, D.A, x + sl(.4), 820, { z: 170, font: 'name', color: th.ink, align: 'left', a: ap(lt, .4), maxW: 820 });
      else {
        text(ctx, th, D.A, x + sl(.4), 740, { z: 160, font: 'name', color: th.ink, align: 'left', a: ap(lt, .4), maxW: 820 });
        text(ctx, th, '&', x + 10 + sl(.7), 900, { z: 150, font: 'script', color: th.accent, align: 'left', a: ap(lt, .7) });
        text(ctx, th, D.B, x + sl(1), 1080, { z: 160, font: 'name', color: th.ink, align: 'left', a: ap(lt, 1), maxW: 820 });
      }
      ctx.save(); ctx.globalAlpha = ap(lt, 1.3); ctx.strokeStyle = th.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, 1160); ctx.lineTo(x + 320 * ap(lt, 1.3, 1), 1160); ctx.stroke(); ctx.restore();
      text(ctx, th, D.date, x, 1240, { z: 42, font: 'caps', color: th.ink, align: 'left', a: ap(lt, 1.5), maxW: 780, ls: 2 });
      text(ctx, th, [D.V, D.CITY].filter(Boolean).join(', '), x, 1305, { z: 34, font: 'body', color: th.accent, align: 'left', a: ap(lt, 1.7), maxW: 780 });
      ctx.save(); ctx.translate(W - 110, 960); ctx.rotate(-Math.PI / 2);
      text(ctx, th, hi ? 'तारीख़ याद रखें' : 'SAVE THE DATE', 0, 0, { z: 28, font: 'caps', color: th.ink, a: ap(lt, 1.9) * .6, ls: 10 });
      ctx.restore();
    },
    panel(ctx, film, th, a) {
      const r = { x: 120, y: 290, w: W - 240, h: 1330 }; r.cx = r.x + r.w / 2;
      ctx.save(); ctx.globalAlpha *= clamp(a); ctx.strokeStyle = th.ink; ctx.globalAlpha *= .3; ctx.lineWidth = 2; ctx.strokeRect(r.x, r.y, r.w, r.h); ctx.restore();
      return r;
    },
    day(ctx, film, th, D, sc, lt) {
      const x = 140, b = dateBits(D, sc);
      text(ctx, th, dayLabel(D, sc), x, 430, { z: 32, font: 'caps', color: th.accent, align: 'left', a: ap(lt, .1), ls: 6 });
      ctx.save(); ctx.globalAlpha = ap(lt, .2); ctx.font = `400 360px "DM Serif Display", serif`; ctx.lineWidth = 3; ctx.strokeStyle = th.accent; ctx.textAlign = 'left'; ctx.strokeText(b.d, x - 10, 780); ctx.restore();
      text(ctx, th, `${b.m} · ${b.wd}`, x, 860, { z: 40, font: 'caps', color: th.ink, align: 'left', a: ap(lt, .4), ls: 3 });
      rows(ctx, th, sc.day, x, 1040, W - 2 * x, lt, { z: 66, gap: 150, start: .6 });
    }
  };

  // ===== Watercolor Bloom: soft washes, roses blooming at the corners, names in script =====
  function flower(ctx, x, y, r, cols, rot, k) {
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k);
    for (let ring = 0; ring < 3; ring++) {
      const n = [8, 7, 5][ring], rr2 = r * [1, .72, .45][ring];
      ctx.fillStyle = cols[ring % cols.length]; ctx.globalAlpha = .82;
      for (let i = 0; i < n; i++) { ctx.save(); ctx.rotate(i * Math.PI * 2 / n + ring * .4); ctx.beginPath(); ctx.ellipse(0, -rr2 * .55, rr2 * .42, rr2 * .6, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    }
    ctx.globalAlpha = 1; ctx.fillStyle = '#f6d48a'; ctx.beginPath(); ctx.arc(0, 0, r * .16, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function leaf(ctx, x, y, len, ang, col, k = 1) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(k, k); ctx.fillStyle = col; ctx.globalAlpha = .85;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(len * .5, -len * .28, len, 0); ctx.quadraticCurveTo(len * .5, len * .28, 0, 0); ctx.fill(); ctx.restore();
  }
  function bouquet(ctx, th, x, y, s, t, k, flip = 1) {
    const sw = Math.sin(t * 1.2) * .04;
    [[-.9, .2], [-.3, -.8], [.6, -.5], [1, .5], [-.5, 1], [.3, 1.05]].forEach(([a, b], i) => leaf(ctx, x + a * 40 * s * flip, y + b * 40 * s, 120 * s, Math.atan2(b, a * flip) + sw, i % 2 ? th.leaf : shade(th.leaf, -.2), k));
    flower(ctx, x, y, 80 * s, th.fl, sw, k);
    flower(ctx, x + 105 * s * flip, y + 60 * s, 58 * s, [th.fl[1], th.fl[2], th.fl[0]], .6 + sw, ease(k * 1.2 - .2));
    flower(ctx, x - 70 * s * flip, y + 95 * s, 48 * s, [th.fl[2], th.fl[0], th.fl[1]], 1.2 + sw, ease(k * 1.4 - .4));
  }
  const FLORAL = {
    short: 'Bloom', name: 'Watercolor Bloom', trans: 'zoom', fx: 'petals',
    face: face('400 {z}px "Great Vibes", cursive', 'italic 400 {z}px "Cormorant Garamond", serif', '400 {z}px "Cinzel", serif', 'italic 400 {z}px "Cormorant Garamond", serif', '400 {z}px "Great Vibes", cursive'),
    pals: [P6('Rose', false, ['#fff8f6', '#fbe4e1'], ['#e7b98a', '#c48b52', '#7a5226'], '#ffffff', '#6b2f3a', '#c45c74', { fl: ['#f4a6b5', '#f9cdd5', '#e07b92'], leaf: '#8fb08a' }),
      P6('Peony', false, ['#fff6fa', '#f8dceb'], ['#e7b98a', '#b8875a', '#704a26'], '#ffffff', '#5e1f45', '#c2407e', { fl: ['#e86aa8', '#f6b3d2', '#c93d84'], leaf: '#7fa37a' }),
      P6('Lavender', false, ['#faf7ff', '#e9e0f8'], ['#cdb48a', '#a28a5c', '#5e4a2a'], '#ffffff', '#3f2a63', '#8a63c9', { fl: ['#b79ae6', '#dccdf6', '#8f6cd1'], leaf: '#88a98c' }),
      P6('Apricot', false, ['#fff8f1', '#fde3cc'], ['#e9b16a', '#c47f26', '#6e420c'], '#ffffff', '#6a2f12', '#d9733d', { fl: ['#f7a76c', '#fcd0aa', '#e8834a'], leaf: '#91ad7c' }),
      P6('Buttercup', false, ['#fffdf3', '#fbf1c9'], ['#e3c35d', '#b89a2e', '#6b5810'], '#ffffff', '#4f4310', '#c9a227', { fl: ['#f8d55c', '#fff0a8', '#f0b72f'], leaf: '#8db27a' }),
      P6('Hydrangea', false, ['#f6fbff', '#dcebf9'], ['#c9b07a', '#9c8452', '#5b4a24'], '#ffffff', '#1f3a5c', '#4a7fc0', { fl: ['#8db8ea', '#c7defa', '#6a96d9'], leaf: '#86ab92' })],
    bg(ctx, th, t) {
      const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, th.bg[0]); g.addColorStop(1, th.bg[1]); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      [[120, 160, 420, th.fl[1]], [W - 80, H - 220, 480, th.fl[0]], [W - 160, 360, 260, th.leaf], [140, H - 420, 300, th.fl[2]]].forEach(([x, y, r, c]) => {
        const w2 = ctx.createRadialGradient(x, y, 10, x, y, r); w2.addColorStop(0, c + '55'); w2.addColorStop(1, c + '00'); ctx.fillStyle = w2; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      });
    },
    open(ctx, film, th, D, sc, lt) {
      bouquet(ctx, th, 170, 230, 1.5, lt, ease(lt / 1.4));
      bouquet(ctx, th, W - 170, H - 330, 1.6, lt, ease((lt - .4) / 1.4), -1);
      text(ctx, th, D.heading, W / 2, H / 2 - 40, { z: 70, font: 'head', color: th.accent, a: ap(lt, 1.4) });
      text(ctx, th, who2(D, D.lang === 'hi'), W / 2, H / 2 + 110, { z: 120, font: 'name', color: th.ink, a: ap(lt, 1.9), maxW: 860 });
    },
    title(ctx, film, th, D, sc, lt) {
      const cx = W / 2;
      for (let i = 0; i < 7; i++) { const a = Math.PI * (1.08 + i * .14), x = cx + Math.cos(a) * 520, y = 600 + Math.sin(a) * 300; flower(ctx, x, y, 46 + (i % 2) * 18, i % 2 ? th.fl : [th.fl[2], th.fl[1], th.fl[0]], i, ease(lt * 1.6 - i * .15)); leaf(ctx, x + 30, y + 30, 70, a + 2, th.leaf, ease(lt * 1.6 - i * .15)); }
      text(ctx, th, D.heading, cx, 560, { z: 64, font: 'head', color: th.accent, a: ap(lt, .4) });
      if (D.solo) text(ctx, th, D.A, cx, 900, { z: 190, font: 'name', color: th.ink, a: ap(lt, .7), rise: 30, maxW: 900 });
      else {
        text(ctx, th, D.A, cx, 820, { z: 180, font: 'name', color: th.ink, a: ap(lt, .7), rise: 30, maxW: 900 });
        text(ctx, th, D.lang === 'hi' ? 'संग' : 'and', cx, 920, { z: 44, font: 'caps', color: th.accent, a: ap(lt, 1), ls: 4 });
        text(ctx, th, D.B, cx, 1090, { z: 180, font: 'name', color: th.ink, a: ap(lt, 1.2), rise: 30, maxW: 900 });
      }
      text(ctx, th, D.date, cx, 1240, { z: 40, font: 'caps', color: th.ink, a: ap(lt, 1.6), ls: 2, maxW: 820 });
      text(ctx, th, [D.V, D.CITY].filter(Boolean).join(' · '), cx, 1310, { z: 40, font: 'body', color: th.accent, a: ap(lt, 1.8), maxW: 820 });
      bouquet(ctx, th, cx, 1520, 1.1, lt, ease((lt - 1.6) / 1));
    },
    panel(ctx, film, th, a) {
      const r = { x: 130, y: 340, w: W - 260, h: 1240 }; r.cx = r.x + r.w / 2;
      ctx.save(); ctx.globalAlpha *= clamp(a); ctx.shadowColor = 'rgba(120,60,60,.18)'; ctx.shadowBlur = 50; rr(ctx, r.x, r.y, r.w, r.h, 40); ctx.fillStyle = th.paper; ctx.fill(); ctx.restore();
      bouquet(ctx, th, r.x + 40, r.y + 40, .9, NOW, clamp(a)); bouquet(ctx, th, r.x + r.w - 40, r.y + r.h - 40, .7, NOW, clamp(a), -1);
      return r;
    },
    day(ctx, film, th, D, sc, lt) {
      const cx = W / 2, cy = 700, b = dateBits(D, sc);
      for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2 + lt * .1; flower(ctx, cx + Math.cos(a) * 260, cy + Math.sin(a) * 260, 40 + (i % 3) * 8, i % 2 ? th.fl : [th.fl[1], th.fl[2], th.fl[0]], a, ease(lt * 2 - i * .08)); leaf(ctx, cx + Math.cos(a + .2) * 250, cy + Math.sin(a + .2) * 250, 60, a + 1.8, th.leaf, ease(lt * 2 - i * .08)); }
      text(ctx, th, dayLabel(D, sc), cx, cy - 80, { z: 40, font: 'caps', color: th.accent, a: ap(lt, .4), ls: 3 });
      text(ctx, th, b.d, cx, cy + 70, { z: 170, font: 'head', color: th.ink, a: ap(lt, .5) });
      text(ctx, th, `${b.m} · ${b.wd}`, cx, cy + 130, { z: 32, font: 'caps', color: th.accent, a: ap(lt, .6), maxW: 380 });
      rows(ctx, th, sc.day, 140, 1150, W - 280, lt, { z: 92, gap: 170, align: 'center', start: .8 });
    }
  };

  // ===== Cinema Night: letterbox, sweeping lights, "starring", credits that roll =====
  const CINEMA = {
    short: 'Cinema', name: 'Cinema Night', trans: 'fade', fx: 'stars',
    face: face('700 {z}px "Cinzel Decorative", serif', '400 {z}px "Cinzel", serif', '400 {z}px "Cinzel", serif', 'italic 400 {z}px "Cormorant Garamond", serif', '400 {z}px "Great Vibes", cursive'),
    pals: [P6('Midnight', true, ['#16204a', '#02040d'], GOLD, 'rgba(255,255,255,.06)', '#f6efe0', '#e8b84a'),
      P6('Obsidian', true, ['#262626', '#000000'], GOLD, 'rgba(255,255,255,.06)', '#f3f3f3', '#e0c27a'),
      P6('Bordeaux', true, ['#4a0f22', '#0c0205'], ROSE, 'rgba(255,255,255,.06)', '#fbeee8', '#e9a587'),
      P6('Lagoon', true, ['#0b3a44', '#010c10'], GOLD, 'rgba(255,255,255,.06)', '#eefbfb', '#7fe0d8'),
      P6('Jade', true, ['#0e3d2a', '#010d07'], GOLD, 'rgba(255,255,255,.06)', '#f0f8f2', '#e8c66a'),
      P6('Royal', true, ['#33134f', '#07020d'], SILVER, 'rgba(255,255,255,.06)', '#f6f0ff', '#c8b6ff')],
    bg(ctx, th, t) {
      const g = ctx.createRadialGradient(W / 2, H * .45, 50, W / 2, H * .5, H * .8); g.addColorStop(0, th.bg[0]); g.addColorStop(1, th.bg[1]); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      [-1, 1].forEach(s => {
        ctx.save(); ctx.translate(W / 2 + s * 460, H); ctx.rotate(s * (-.35 + Math.sin(t * .5 + s) * .18));
        const b = ctx.createLinearGradient(0, 0, 0, -H * 1.1); b.addColorStop(0, th.accent + '40'); b.addColorStop(1, th.accent + '00');
        ctx.fillStyle = b; ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(-260, -H * 1.1); ctx.lineTo(260, -H * 1.1); ctx.lineTo(30, 0); ctx.fill(); ctx.restore();
      });
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 150); ctx.fillRect(0, H - 170, W, 170);
    },
    open(ctx, film, th, D, sc, lt) {
      const k = ease((lt - .3) / 1.2), cy = H / 2;
      const g = ctx.createLinearGradient(W / 2 - 540 * k, 0, W / 2 + 540 * k, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,250,230,.95)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.save(); ctx.fillStyle = g; ctx.shadowColor = th.accent; ctx.shadowBlur = 40; ctx.fillRect(0, cy - 3, W, 6); ctx.restore();
      const glow = ctx.createRadialGradient(W / 2, cy, 0, W / 2, cy, 260 * k); glow.addColorStop(0, 'rgba(255,245,220,.6)'); glow.addColorStop(1, 'rgba(255,245,220,0)');
      ctx.fillStyle = glow; ctx.fillRect(0, cy - 300, W, 600);
      text(ctx, tw(th, true), D.lang === 'hi' ? 'एक प्रेम कहानी' : 'A  LOVE  STORY', W / 2, cy - 90, { z: 40, font: 'caps', color: '#fff', a: ap(lt, 1.3), ls: 4 });
      text(ctx, tw(th, true), D.heading, W / 2, cy + 130, { z: 64, font: 'head', color: 'gold', a: ap(lt, 1.9), glow: 18 });
    },
    title(ctx, film, th, D, sc, lt) {
      const t2 = tw(th, true), cx = W / 2, hi = D.lang === 'hi';
      text(ctx, t2, hi ? 'प्रस्तुत करते हैं' : 'STARRING', cx, 620, { z: 34, font: 'caps', color: th.accent, a: ap(lt, .2), ls: 10 });
      if (D.solo) text(ctx, t2, D.A, cx, 860, { z: 120, font: 'name', color: 'gold', a: ap(lt, .5), glow: 22, maxW: 900 });
      else {
        text(ctx, t2, D.A, cx, 800, { z: 112, font: 'name', color: 'gold', a: ap(lt, .5), glow: 22, maxW: 900 });
        text(ctx, t2, hi ? 'और' : 'AND', cx, 890, { z: 34, font: 'caps', color: '#fff', a: ap(lt, .8), ls: 8 });
        text(ctx, t2, D.B, cx, 1010, { z: 112, font: 'name', color: 'gold', a: ap(lt, 1), glow: 22, maxW: 900 });
      }
      ctx.save(); ctx.globalAlpha = ap(lt, 1.3) * .7; ctx.strokeStyle = th.accent; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - 200, 1080); ctx.lineTo(cx + 200, 1080); ctx.stroke(); ctx.restore();
      text(ctx, t2, `${hi ? '' : 'IN CINEMAS · '}${D.date}`, cx, 1160, { z: 38, font: 'caps', color: '#fff', a: ap(lt, 1.5), ls: 3, maxW: 880 });
      text(ctx, t2, [D.V, D.CITY].filter(Boolean).join(' · '), cx, 1230, { z: 38, font: 'body', color: th.accent, a: ap(lt, 1.7), maxW: 880 });
      text(ctx, t2, '★ ★ ★ ★ ★', cx, 1360, { z: 36, font: 'caps', color: th.accent, a: ap(lt, 2) });
    },
    panel(ctx, film, th, a) {
      const r = { x: 120, y: 260, w: W - 240, h: 1360 }; r.cx = r.x + r.w / 2;
      ctx.save(); ctx.globalAlpha *= clamp(a); rr(ctx, r.x, r.y, r.w, r.h, 18); ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fill(); stroke(ctx, th.accent + 'aa', 1.5); ctx.restore();
      return r;
    },
    day(ctx, film, th, D, sc, lt) {
      const t2 = tw(th, true), cx = W / 2, b = dateBits(D, sc), hi = D.lang === 'hi';
      text(ctx, t2, sc.n > 1 ? (hi ? `अध्याय ${sc.i + 1}` : `CHAPTER ${['ONE', 'TWO', 'THREE', 'FOUR'][sc.i]}`) : (hi ? 'आज की शाम' : 'TONIGHT'), cx, 560, { z: 36, font: 'caps', color: th.accent, a: ap(lt, .2), ls: 10 });
      text(ctx, t2, sc.day.events.map(e => e.name).join(' · '), cx, 760, { z: 96, font: 'name', color: 'gold', a: ap(lt, .4), glow: 20, maxW: 900 });
      text(ctx, t2, `${b.wd}, ${b.d} ${b.m}`, cx, 860, { z: 40, font: 'caps', color: '#fff', a: ap(lt, .6), ls: 3, maxW: 880 });
      sc.day.events.forEach((e, i) => text(ctx, t2, `${e.name}  —  ${e.time}`, cx, 1040 + i * 90 - (lt * 12), { z: 44, font: 'body', color: '#fff', a: ap(lt, .9 + i * .2) }));
    },
    finale(ctx, film, th, D, sc, lt) {
      const t2 = tw(th, true), cx = W / 2, hi = D.lang === 'hi', roll = Math.max(0, lt - .3) * 140;
      const lines = [[hi ? 'निर्देशन' : 'DIRECTED BY', 'caps', 30, th.accent], [hi ? 'प्यार' : 'Love', 'name', 70, 'gold'], ['', 'caps', 20, '#fff'],
        [hi ? 'मुख्य भूमिका' : 'STARRING', 'caps', 30, th.accent], [D.A, 'name', 90, 'gold'], ...(D.B ? [[D.B, 'name', 90, 'gold']] : []), ['', 'caps', 20, '#fff'],
        ...(D.regards ? [[D.regards[0], 'caps', 30, th.accent], ...D.regards.slice(1).map(r => [r, 'body', 40, '#fff'])] : []), ['', 'caps', 20, '#fff'],
        [D.date, 'caps', 36, '#fff'], [[D.V, D.CITY].filter(Boolean).join(' · '), 'body', 40, th.accent]];
      let y = 1500 - roll;
      lines.forEach(([s, f, z, c]) => { if (y > 160 && y < H - 180) text(ctx, t2, s, cx, y, { z, font: f, color: c, maxW: 880, glow: c === 'gold' ? 14 : 0 }); y += z * 1.6; });
      const end = clamp((lt - 3.2) / .8);
      if (end > 0) { ctx.save(); ctx.globalAlpha = end; ctx.fillStyle = th.bg[1]; ctx.fillRect(0, 150, W, H - 320); ctx.restore(); text(ctx, t2, who2(D, hi), cx, 900, { z: 90, font: 'name', color: 'gold', a: end, glow: 20, maxW: 900 }); credit(ctx, t2, D, lt - 1.2, 1140, '#fff'); }
    }
  };

  // ===== Gatsby Deco: black and gold, a fan that opens, eight-cornered frames =====
  function octagon(ctx, x, y, w, h, c) { ctx.beginPath(); ctx.moveTo(x + c, y); ctx.lineTo(x + w - c, y); ctx.lineTo(x + w, y + c); ctx.lineTo(x + w, y + h - c); ctx.lineTo(x + w - c, y + h); ctx.lineTo(x + c, y + h); ctx.lineTo(x, y + h - c); ctx.lineTo(x, y + c); ctx.closePath(); }
  function fan(ctx, th, cx, cy, R, k, up = true) {
    ctx.save(); ctx.strokeStyle = th.gold[1]; ctx.lineWidth = 2.5;
    const a0 = up ? Math.PI : 0, span = Math.PI * k;
    for (let i = 0; i <= 18; i++) { const a = a0 + (Math.PI - span) / 2 + span * i / 18; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke(); }
    for (let r = R * .35; r <= R; r += R * .22) { ctx.beginPath(); ctx.arc(cx, cy, r, a0 + (Math.PI - span) / 2, a0 + (Math.PI + span) / 2); ctx.stroke(); }
    ctx.restore();
  }
  function diamond(ctx, th, x, y, s) { ctx.save(); ctx.fillStyle = goldFill(ctx, th, y + s, s * 2); ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x + s, y); ctx.lineTo(x, y + s); ctx.lineTo(x - s, y); ctx.closePath(); ctx.fill(); ctx.restore(); }
  const DECO = {
    short: 'Gatsby', name: 'Gatsby Deco', trans: 'wipe', fx: 'sparkle',
    face: face('400 {z}px "Poiret One", sans-serif', '400 {z}px "Poiret One", sans-serif', '400 {z}px "Cinzel", serif', '400 {z}px "Jost", sans-serif', '400 {z}px "Great Vibes", cursive'),
    pals: [P6('Jet', true, ['#1a1a1a', '#050505'], GOLD, '#111111', '#f4ead2', '#e8b84a'),
      P6('Emerald', true, ['#0c3b2c', '#03140e'], GOLD, '#08281e', '#f4ead2', '#e8b84a'),
      P6('Navy', true, ['#13234a', '#050a18'], GOLD, '#0c1733', '#f4ead2', '#e8b84a'),
      P6('Burgundy', true, ['#4b0f1f', '#140306'], GOLD, '#320a15', '#f4ead2', '#e8b84a'),
      P6('Teal', true, ['#0d3c42', '#031214'], GOLD, '#0a2a2e', '#f4ead2', '#e8b84a'),
      P6('Champagne', false, ['#f6efe0', '#e7d9bc'], ['#d4a64a', '#9c7424', '#5a400e'], '#fbf6ea', '#1c1712', '#9c7424')],
    bg(ctx, th, t) {
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, th.bg[0]); g.addColorStop(1, th.bg[1]); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.globalAlpha = th.dark ? .08 : .12; ctx.strokeStyle = th.gold[1]; ctx.lineWidth = 2;
      for (let x = 40; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      ctx.restore();
      ctx.save(); ctx.strokeStyle = th.gold[1]; ctx.lineWidth = 3; octagon(ctx, 50, 50, W - 100, H - 100, 70); ctx.stroke(); ctx.lineWidth = 1.5; octagon(ctx, 66, 66, W - 132, H - 132, 62); ctx.stroke(); ctx.restore();
    },
    open(ctx, film, th, D, sc, lt) {
      fan(ctx, th, W / 2, H * .62, 520, ease(lt / 1.6));
      diamond(ctx, th, W / 2, H * .62 - 30, 70 * ap(lt, 1.2));
      text(ctx, th, D.mono, W / 2, H * .62 - 16, { z: 44, font: 'caps', color: th.dark ? '#111' : '#fff', a: ap(lt, 1.5), maxW: 120 });
      text(ctx, th, D.heading.toUpperCase(), W / 2, H * .62 + 160, { z: 64, font: 'head', color: 'gold', a: ap(lt, 1.8), ls: 4 });
    },
    title(ctx, film, th, D, sc, lt) {
      const cx = W / 2;
      ctx.save(); ctx.globalAlpha = ap(lt, 0, 1.2); ctx.strokeStyle = th.gold[1]; ctx.lineWidth = 3; octagon(ctx, 150, 380, W - 300, 1100, 90); ctx.stroke(); ctx.lineWidth = 1.2; octagon(ctx, 170, 400, W - 340, 1060, 82); ctx.stroke(); ctx.restore();
      fan(ctx, th, cx, 400, 170, ap(lt, .2, 1.2));
      text(ctx, th, D.heading.toUpperCase(), cx, 560, { z: 44, font: 'caps', color: th.accent, a: ap(lt, .4), ls: 8, maxW: 700 });
      if (D.solo) text(ctx, th, D.A, cx, 860, { z: 150, font: 'name', color: 'gold', a: ap(lt, .7), maxW: 700, glow: 10 });
      else {
        text(ctx, th, D.A, cx, 790, { z: 140, font: 'name', color: 'gold', a: ap(lt, .7), maxW: 700, glow: 10 });
        diamond(ctx, th, cx, 880, 22 * ap(lt, .9));
        text(ctx, th, D.B, cx, 1030, { z: 140, font: 'name', color: 'gold', a: ap(lt, 1.1), maxW: 700, glow: 10 });
      }
      text(ctx, th, D.date, cx, 1180, { z: 38, font: 'caps', color: th.ink, a: ap(lt, 1.4), ls: 3, maxW: 680 });
      text(ctx, th, [D.V, D.CITY].filter(Boolean).join(' · '), cx, 1250, { z: 36, font: 'body', color: th.accent, a: ap(lt, 1.6), maxW: 680 });
      [-1, 1].forEach(s => { ctx.save(); ctx.globalAlpha = ap(lt, 1.8); ctx.strokeStyle = th.gold[1]; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx + s * 60, 1340); ctx.lineTo(cx + s * 260, 1340); ctx.stroke(); ctx.restore(); diamond(ctx, th, cx + s * 30, 1340, 10); });
    },
    panel(ctx, film, th, a) {
      const r = { x: 130, y: 300, w: W - 260, h: 1300 }; r.cx = r.x + r.w / 2;
      ctx.save(); ctx.globalAlpha *= clamp(a); octagon(ctx, r.x, r.y, r.w, r.h, 80); ctx.fillStyle = th.paper; ctx.fill(); ctx.strokeStyle = th.gold[1]; ctx.lineWidth = 3; ctx.stroke();
      octagon(ctx, r.x + 16, r.y + 16, r.w - 32, r.h - 32, 72); ctx.lineWidth = 1.2; ctx.stroke(); ctx.restore();
      fan(ctx, th, r.cx, r.y + r.h - 16, 110, clamp(a));
      return r;
    },
    day(ctx, film, th, D, sc, lt) {
      const cx = W / 2, b = dateBits(D, sc), x = 220, w = W - 440, top = 420;
      ctx.save(); ctx.globalAlpha = ap(lt, 0, 1); ctx.strokeStyle = th.gold[1]; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x, 1500); ctx.lineTo(x, top + w / 2); ctx.arc(cx, top + w / 2, w / 2, Math.PI, 0); ctx.lineTo(x + w, 1500); ctx.closePath(); ctx.stroke(); ctx.restore();
      text(ctx, th, dayLabel(D, sc), cx, 600, { z: 34, font: 'caps', color: th.accent, a: ap(lt, .2), ls: 6 });
      text(ctx, th, b.d, cx, 830, { z: 240, font: 'name', color: 'gold', a: ap(lt, .4), glow: 10 });
      text(ctx, th, `${b.m} · ${b.wd}`, cx, 910, { z: 34, font: 'caps', color: th.ink, a: ap(lt, .6), ls: 3, maxW: w - 40 });
      sc.day.events.forEach((e, i) => { const y = 1070 + i * 140, a = ap(lt, .8 + i * .2); diamond(ctx, th, cx, y - 70, 9 * a); text(ctx, th, e.name, cx, y, { z: 70, font: 'name', color: th.ink, a, maxW: w - 60 }); text(ctx, th, e.time, cx, y + 44, { z: 30, font: 'caps', color: th.accent, a, maxW: w - 60 }); });
    }
  };

  // ===== Polaroid Memories: kraft paper, taped polaroids, handwriting =====
  function tape(ctx, x, y, w, ang) { ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.fillStyle = 'rgba(240,226,190,.75)'; ctx.fillRect(-w / 2, -22, w, 44); ctx.restore(); }
  function polaroid(ctx, th, x, y, w, h, ang, k, draw) {
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.globalAlpha *= clamp(k);
    ctx.shadowColor = 'rgba(0,0,0,.28)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12; ctx.fillStyle = '#fffdf8'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.shadowColor = 'transparent';
    const pw = w - 60, ph = h - 190, g = ctx.createLinearGradient(0, -h / 2, 0, -h / 2 + ph); g.addColorStop(0, shade(th.accent, .25)); g.addColorStop(1, shade(th.accent, -.25));
    ctx.fillStyle = g; ctx.fillRect(-pw / 2, -h / 2 + 30, pw, ph);
    if (draw) draw(-pw / 2, -h / 2 + 30, pw, ph);
    ctx.restore();
  }
  function heart(ctx, x, y, s, col, fill = true) { ctx.save(); ctx.translate(x, y); ctx.scale(s / 100, s / 100); ctx.beginPath(); ctx.moveTo(0, 30); ctx.bezierCurveTo(-60, -10, -40, -70, 0, -38); ctx.bezierCurveTo(40, -70, 60, -10, 0, 30); ctx.closePath(); if (fill) { ctx.fillStyle = col; ctx.fill(); } else { ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.stroke(); } ctx.restore(); }
  const POLAROID = {
    short: 'Polaroid', name: 'Polaroid Memories', trans: 'slide', fx: 'none',
    face: face('700 {z}px "Caveat", cursive', '700 {z}px "Caveat", cursive', '500 {z}px "Caveat", cursive', '500 {z}px "Caveat", cursive', '700 {z}px "Caveat", cursive'),
    pals: [P6('Kraft', false, ['#d2b48c', '#b8956a'], ['#6b4a2a', '#4a321a', '#2a1a0a'], '#fffdf6', '#3a2a1a', '#c0524a'),
      P6('Linen', false, ['#f3ece0', '#e4d8c4'], ['#8a6a4a', '#5a4430', '#2e2216'], '#fffefb', '#2e2620', '#3f7fa8'),
      P6('Sage Board', false, ['#c9d3bf', '#aebba2'], ['#4a5a3a', '#34422a', '#1e2818'], '#fffffa', '#26301e', '#c76b4a'),
      P6('Blush Board', false, ['#efd3d0', '#dfb7b2'], ['#7a4a46', '#5a3230', '#341a18'], '#fffafa', '#3a2220', '#7a5ac0'),
      P6('Sky Board', false, ['#cfe1ee', '#b1cbde'], ['#3a5a74', '#28425a', '#14263a'], '#fffffd', '#1e2e3e', '#e0864a'),
      P6('Chalk', true, ['#2d3a33', '#1c2420'], ['#ffffff', '#e8e8e0', '#b8b8b0'], '#fffdf6', '#f4f4ec', '#f2c94c')],
    bg(ctx, th, t) {
      ctx.fillStyle = th.bg[0]; ctx.fillRect(0, 0, W, H);
      ctx.save();
      for (let i = 0; i < 260; i++) { ctx.globalAlpha = .12; ctx.fillStyle = i % 2 ? '#000' : '#fff'; ctx.fillRect(hash(i) * W, hash(i + 300) * H, 2 + hash(i + 7) * 3, 2); }
      ctx.globalAlpha = th.dark ? .25 : .18; ctx.strokeStyle = th.dark ? '#fff' : th.ink; ctx.lineWidth = 3;
      for (let i = 0; i < 9; i++) { const x = hash(i + 41) * W, y = hash(i + 91) * H; if (i % 3) heart(ctx, x, y, 40, ctx.strokeStyle, false); else { ctx.beginPath(); for (let p = 0; p < 5; p++) { const a = -Math.PI / 2 + p * Math.PI * 4 / 5; ctx.lineTo(x + Math.cos(a) * 24, y + Math.sin(a) * 24); } ctx.closePath(); ctx.stroke(); } }
      ctx.restore();
    },
    open(ctx, film, th, D, sc, lt) {
      const drop = (s, y0) => y0 - (1 - out((lt - s) / .7)) * 1400;
      polaroid(ctx, th, W / 2 - 160, drop(.1, 820), 460, 560, -.16, ap(lt, .1, .2));
      polaroid(ctx, th, W / 2 + 170, drop(.5, 900), 460, 560, .12, ap(lt, .5, .2));
      polaroid(ctx, th, W / 2, drop(.9, 1000), 500, 610, -.03, ap(lt, .9, .2), (x, y, w, h) => { heart(ctx, x + w / 2, y + h / 2, 220, 'rgba(255,255,255,.85)'); });
      tape(ctx, W / 2, drop(.9, 1000) - 300, 180, .08);
      text(ctx, th, D.lang === 'hi' ? 'हमारी कहानी…' : 'our story…', W / 2, 1520, { z: 96, font: 'script', color: th.dark ? '#fff' : th.ink, a: ap(lt, 1.8) });
    },
    title(ctx, film, th, D, sc, lt) {
      const cx = W / 2, k = out(lt / .8);
      polaroid(ctx, th, cx, 800 - (1 - k) * 300, 700, 860, -.05, k, (x, y, w, h) => {
        heart(ctx, x + w / 2, y + h / 2 + 30, 260, 'rgba(255,255,255,.22)');
        text(ctx, tw(th, true), D.mono.replace(' | ', ' ♥ '), x + w / 2, y + h / 2 + 50, { z: 150, font: 'name', color: '#fff', maxW: w - 40 });
      });
      ctx.save(); ctx.translate(cx, 800 - (1 - k) * 300); ctx.rotate(-.05);
      text(ctx, { ...th, dark: false }, who2(D, D.lang === 'hi'), 0, 370, { z: 92, font: 'name', color: '#2a2a2a', a: ap(lt, .6), maxW: 620 });
      ctx.restore();
      tape(ctx, cx - 250, 390, 170, -.5); tape(ctx, cx + 250, 390, 170, .5);
      ctx.save(); ctx.translate(cx + 250, 1440); ctx.rotate(.07); ctx.globalAlpha = ap(lt, 1.2); ctx.shadowColor = 'rgba(0,0,0,.2)'; ctx.shadowBlur = 20; ctx.fillStyle = '#fff3a6'; ctx.fillRect(-190, -150, 380, 300); ctx.restore();
      ctx.save(); ctx.translate(cx + 250, 1440); ctx.rotate(.07);
      text(ctx, { ...th, dark: false }, D.lang === 'hi' ? 'याद रखना!' : 'save the date!', 0, -70, { z: 50, font: 'script', color: th.accent, a: ap(lt, 1.3) });
      text(ctx, { ...th, dark: false }, D.date, 0, 10, { z: 40, font: 'body', color: '#2a2a2a', a: ap(lt, 1.4), maxW: 340 });
      text(ctx, { ...th, dark: false }, D.V, 0, 70, { z: 34, font: 'body', color: '#2a2a2a', a: ap(lt, 1.5), maxW: 340 });
      ctx.restore();
      text(ctx, th, D.heading, cx - 220, 1460, { z: 64, font: 'head', color: th.dark ? '#fff' : th.ink, a: ap(lt, 1), maxW: 440 });
    },
    panel(ctx, film, th, a) {
      const r = { x: 120, y: 300, w: W - 240, h: 1320 }; r.cx = r.x + r.w / 2;
      ctx.save(); ctx.globalAlpha *= clamp(a); ctx.shadowColor = 'rgba(0,0,0,.25)'; ctx.shadowBlur = 30; ctx.fillStyle = th.paper; ctx.fillRect(r.x, r.y, r.w, r.h); ctx.shadowColor = 'transparent';
      ctx.strokeStyle = 'rgba(80,130,200,.25)'; ctx.lineWidth = 2; for (let y = r.y + 120; y < r.y + r.h; y += 64) { ctx.beginPath(); ctx.moveTo(r.x, y); ctx.lineTo(r.x + r.w, y); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(220,80,80,.45)'; ctx.beginPath(); ctx.moveTo(r.x + 80, r.y); ctx.lineTo(r.x + 80, r.y + r.h); ctx.stroke(); ctx.restore();
      tape(ctx, r.cx, r.y, 220, -.04);
      return { ...r, th: { ...th, ink: '#2a2a2a', dark: false } };
    },
    day(ctx, film, th, D, sc, lt) {
      const cx = W / 2, b = dateBits(D, sc), x = 160, w = W - 320, y = 360, k = out(lt / .6);
      ctx.save(); ctx.globalAlpha = k; ctx.translate(0, (1 - k) * 200); ctx.shadowColor = 'rgba(0,0,0,.25)'; ctx.shadowBlur = 30; ctx.fillStyle = '#fffdf8'; ctx.fillRect(x, y, w, 1160); ctx.shadowColor = 'transparent';
      ctx.fillStyle = th.accent; ctx.fillRect(x, y, w, 170);
      ctx.fillStyle = '#555'; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(x + 60 + i * (w - 120) / 8, y, 14, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
      const t3 = { ...th, dark: false };
      text(ctx, tw(th, true), `${b.m}  ·  ${dayLabel(D, sc)}`, cx, y + 110, { z: 60, font: 'name', color: '#fff', a: k, maxW: w - 40 });
      text(ctx, t3, b.d, cx, y + 470, { z: 260, font: 'name', color: '#2a2a2a', a: k });
      const c = ap(lt, .6, .9);
      ctx.save(); ctx.strokeStyle = th.accent; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.ellipse(cx, y + 390, 210, 150, -.1, -1.2, -1.2 + Math.PI * 2.1 * c); ctx.stroke(); ctx.restore();
      text(ctx, t3, b.wd, cx, y + 610, { z: 50, font: 'body', color: '#555', a: k });
      rows(ctx, t3, sc.day, x + 60, y + 780, w - 120, lt, { z: 74, gap: 120, col: '#2a2a2a', tcol: th.accent, start: .8 });
    }
  };

  // ===== Neon Nights: a sign that buzzes on, glowing tubes, a dark wall =====
  function neon(ctx, s, x, y, z, font, col, a = 1, flick = 0) {
    if (!s || a <= 0) return;
    const hi = isHi(s);
    ctx.save(); ctx.globalAlpha *= a * (flick && hash(Math.floor(NOW * 18) + flick) < .25 ? .35 : 1);
    ctx.font = FONT[font](z, hi); ctx.textAlign = 'center';
    let size = z; while (ctx.measureText(s).width > 900 && size > 20) { size -= 4; ctx.font = FONT[font](size, hi); }
    ctx.shadowColor = col; ctx.fillStyle = col; ctx.shadowBlur = 50; ctx.fillText(s, x, y); ctx.shadowBlur = 20; ctx.fillText(s, x, y);
    ctx.shadowBlur = 6; ctx.fillStyle = '#fff'; ctx.globalAlpha *= .85; ctx.fillText(s, x, y);
    ctx.restore();
  }
  function neonBox(ctx, x, y, w, h, col, a) { ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 30; ctx.lineWidth = 6; rr(ctx, x, y, w, h, 40); ctx.stroke(); ctx.shadowBlur = 0; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.globalAlpha *= .7; ctx.stroke(); ctx.restore(); }
  const NEON = {
    short: 'Neon', name: 'Neon Nights', trans: 'zoom', fx: 'bokeh',
    face: face('400 {z}px "Righteous", sans-serif', '400 {z}px "Righteous", sans-serif', '600 {z}px "Jost", sans-serif', '400 {z}px "Jost", sans-serif', '400 {z}px "Pacifico", cursive'),
    pals: [P6('Hot Pink', true, ['#1c0a22', '#060208'], ['#ffd1ea', '#ff2e93', '#9a0d55'], 'rgba(255,255,255,.04)', '#ffffff', '#ff2e93', { n2: '#29e6ff' }),
      P6('Electric', true, ['#071a24', '#020609'], ['#c9faff', '#29e6ff', '#0b7d8f'], 'rgba(255,255,255,.04)', '#ffffff', '#29e6ff', { n2: '#ff4fd8' }),
      P6('Ultraviolet', true, ['#160a2c', '#05020c'], ['#ead6ff', '#b34dff', '#5a1a99'], 'rgba(255,255,255,.04)', '#ffffff', '#b34dff', { n2: '#ffe14d' }),
      P6('Lime', true, ['#0e1a08', '#030602'], ['#efffc9', '#a6ff1a', '#4f8a00'], 'rgba(255,255,255,.04)', '#ffffff', '#a6ff1a', { n2: '#ff4fa3' }),
      P6('Tangerine', true, ['#22100a', '#080302'], ['#ffe2c4', '#ff8a1f', '#a04400'], 'rgba(255,255,255,.04)', '#ffffff', '#ff8a1f', { n2: '#3df0ff' }),
      P6('Crimson', true, ['#220a0e', '#080203'], ['#ffd0d6', '#ff3350', '#9a0d20'], 'rgba(255,255,255,.04)', '#ffffff', '#ff3350', { n2: '#ffd23d' })],
    bg(ctx, th, t) {
      ctx.fillStyle = th.bg[1]; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.globalAlpha = .07; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
      for (let r = 0; r < 40; r++) { const y = r * 50; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); for (let x = (r % 2) * 60; x < W; x += 120) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 50); ctx.stroke(); } }
      ctx.restore();
      const g = ctx.createRadialGradient(W / 2, H * .45, 0, W / 2, H * .45, 700); g.addColorStop(0, th.accent + '33'); g.addColorStop(1, th.accent + '00'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const f = ctx.createLinearGradient(0, H - 320, 0, H); f.addColorStop(0, 'rgba(0,0,0,0)'); f.addColorStop(1, th.accent + '30'); ctx.fillStyle = f; ctx.fillRect(0, H - 320, W, 320);
    },
    open(ctx, film, th, D, sc, lt) {
      const k = clamp(lt / 1.6);
      ctx.save(); ctx.translate(W / 2, H * .42); ctx.scale(4.2, 4.2);
      ctx.beginPath(); ctx.moveTo(0, 30); ctx.bezierCurveTo(-60, -10, -40, -70, 0, -38); ctx.bezierCurveTo(40, -70, 60, -10, 0, 30);
      ctx.setLineDash([400 * k, 400]); ctx.strokeStyle = th.accent; ctx.shadowColor = th.accent; ctx.shadowBlur = 12; ctx.lineWidth = 2.4; ctx.stroke(); ctx.restore();
      neon(ctx, D.lang === 'hi' ? 'जश्न की रात' : "let's celebrate", W / 2, H * .64, 110, 'script', th.n2, ap(lt, 1.5), 3);
      neon(ctx, D.heading.toUpperCase(), W / 2, H * .72, 60, 'head', th.accent, ap(lt, 2.1), 5);
    },
    title(ctx, film, th, D, sc, lt) {
      const cx = W / 2, hi = D.lang === 'hi';
      neon(ctx, D.heading.toUpperCase(), cx, 520, 58, 'head', th.n2, ap(lt, .1), 7);
      if (D.solo) neon(ctx, D.A.toUpperCase(), cx, 860, 170, 'name', th.accent, ap(lt, .4), 9);
      else {
        neon(ctx, hi ? D.A : D.A.toUpperCase(), cx, 790, 150, 'name', th.accent, ap(lt, .4), 9);
        neon(ctx, '&', cx, 920, 120, 'script', th.n2, ap(lt, .8), 11);
        neon(ctx, hi ? D.B : D.B.toUpperCase(), cx, 1080, 150, 'name', th.accent, ap(lt, 1.1), 13);
      }
      neonBox(ctx, 170, 1170, W - 340, 210, th.n2, ap(lt, 1.4));
      text(ctx, th, D.date, cx, 1260, { z: 44, font: 'caps', color: '#fff', a: ap(lt, 1.6), maxW: 680, ls: 2 });
      text(ctx, th, [D.V, D.CITY].filter(Boolean).join(' · '), cx, 1330, { z: 36, font: 'body', color: '#fff', a: ap(lt, 1.8), maxW: 680 });
    },
    panel(ctx, film, th, a) {
      const r = { x: 120, y: 290, w: W - 240, h: 1330 }; r.cx = r.x + r.w / 2;
      ctx.save(); ctx.globalAlpha *= clamp(a); rr(ctx, r.x, r.y, r.w, r.h, 40); ctx.fillStyle = 'rgba(10,4,16,.6)'; ctx.fill(); ctx.restore();
      neonBox(ctx, r.x, r.y, r.w, r.h, th.accent, clamp(a));
      return { ...r, th: { ...th, ink: '#ffffff', accent: th.n2, gold: th.gold, dark: true } };
    },
    day(ctx, film, th, D, sc, lt) {
      const cx = W / 2, b = dateBits(D, sc);
      neon(ctx, dayLabel(D, sc), cx, 470, 56, 'head', th.n2, ap(lt, .1), 2);
      neon(ctx, b.d, cx, 860, 360, 'name', th.accent, ap(lt, .3), 4);
      text(ctx, th, `${b.m} · ${b.wd}`, cx, 960, { z: 46, font: 'caps', color: '#fff', a: ap(lt, .5), ls: 4 });
      sc.day.events.forEach((e, i) => { const y = 1150 + i * 150; neon(ctx, e.name.toUpperCase(), cx, y, 76, 'head', i % 2 ? th.n2 : th.accent, ap(lt, .7 + i * .2), 6 + i); text(ctx, th, e.time, cx, y + 56, { z: 34, font: 'caps', color: '#fff', a: ap(lt, .8 + i * .2) }); });
    }
  };

  // ===== Rangoli Utsav: a rangoli that draws itself, diyas, bright festive colours =====
  function rangoli(ctx, cx, cy, R, cols, k, t) {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * .06);
    const ringsN = [8, 12, 16, 24];
    ringsN.forEach((n, ri) => {
      const kr = clamp(k * 4 - ri), r = R * (.28 + ri * .22), len = R * .26;
      for (let i = 0; i < n * kr; i++) {
        ctx.save(); ctx.rotate(i * Math.PI * 2 / n + ri * .2);
        ctx.beginPath(); ctx.moveTo(0, -r + len * .5); ctx.quadraticCurveTo(-len * .4, -r - len * .1, 0, -r - len * .6); ctx.quadraticCurveTo(len * .4, -r - len * .1, 0, -r + len * .5);
        ctx.fillStyle = cols[(i + ri) % cols.length]; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, -r - len * .8, 5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    });
    ctx.fillStyle = cols[0]; ctx.globalAlpha = clamp(k * 3); ctx.beginPath(); ctx.arc(0, 0, R * .2, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.stroke();
    ctx.restore();
  }
  function scallop(ctx, x, y, w, h, cols) {
    const s = 34; let i = 0;
    for (let xx = x; xx <= x + w; xx += s * 1.6) { [[xx, y], [xx, y + h]].forEach(([px, py]) => { ctx.fillStyle = cols[i++ % cols.length]; ctx.beginPath(); ctx.arc(px, py, s * .75, 0, Math.PI * 2); ctx.fill(); }); }
    for (let yy = y; yy <= y + h; yy += s * 1.6) { [[x, yy], [x + w, yy]].forEach(([px, py]) => { ctx.fillStyle = cols[i++ % cols.length]; ctx.beginPath(); ctx.arc(px, py, s * .75, 0, Math.PI * 2); ctx.fill(); }); }
  }
  const RANGOLI = {
    short: 'Rangoli', name: 'Rangoli Utsav', trans: 'zoom', fx: 'petals',
    face: face('400 {z}px "Yatra One", serif', '400 {z}px "Yatra One", serif', '400 {z}px "Marcellus", serif', '400 {z}px "Marcellus", serif', '400 {z}px "Yatra One", serif'),
    pals: [P6('Festive', false, ['#fff3df', '#ffd9a8'], GOLD, '#ffffff', '#5a1030', '#d81b60', { rg: ['#d81b60', '#ff9800', '#fdd835', '#43a047'] }),
      P6('Peacock', false, ['#eafaf7', '#c6ece6'], GOLD, '#ffffff', '#0b3a5a', '#00838f', { rg: ['#1565c0', '#00897b', '#7cb342', '#fbc02d'] }),
      P6('Lotus', false, ['#fff0f3', '#ffd2dc'], GOLD, '#ffffff', '#6a0f2a', '#e91e63', { rg: ['#e91e63', '#f06292', '#ffffff', '#66bb6a'] }),
      P6('Sunset', false, ['#fff1e6', '#ffcfa8'], GOLD, '#ffffff', '#5a1a0a', '#e65100', { rg: ['#e65100', '#c62828', '#7b1fa2', '#ffb300'] }),
      P6('Royal', false, ['#f6efff', '#e0cdfa'], GOLD, '#ffffff', '#36125a', '#7b1fa2', { rg: ['#7b1fa2', '#ffb300', '#ec407a', '#26a69a'] }),
      P6('Tulsi', false, ['#f1fae8', '#d6efc0'], GOLD, '#ffffff', '#1f3a10', '#2e7d32', { rg: ['#2e7d32', '#fdd835', '#e53935', '#fb8c00'] })],
    bg(ctx, th, t) {
      const g = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, H * .7); g.addColorStop(0, th.bg[0]); g.addColorStop(1, th.bg[1]); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.globalAlpha = .18; ctx.fillStyle = th.ink; for (let y = 40; y < H; y += 60) for (let x = 40 + ((y / 60) % 2) * 30; x < W; x += 60) { ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill(); } ctx.restore();
    },
    open(ctx, film, th, D, sc, lt) {
      rangoli(ctx, W / 2, H * .45, 430, th.rg, ease(lt / 2.6), lt);
      diyas(ctx, th, W / 2, H * .45 + 30, ap(lt, 2.2), lt, 1);
      text(ctx, th, D.heading, W / 2, H * .8, { z: 90, font: 'head', color: th.accent, a: ap(lt, 2.4) });
    },
    title(ctx, film, th, D, sc, lt) {
      const cx = W / 2, cy = 820;
      ctx.save(); ctx.globalAlpha = .9; rangoli(ctx, cx, cy, 500, th.rg, 1, lt); ctx.restore();
      ctx.save(); ctx.globalAlpha = ap(lt, .2); ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,.2)'; ctx.shadowBlur = 30; ctx.beginPath(); ctx.arc(cx, cy, 330, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      text(ctx, th, D.heading, cx, cy - 190, { z: 64, font: 'head', color: th.accent, a: ap(lt, .4), maxW: 520 });
      if (D.solo) text(ctx, th, D.A, cx, cy + 40, { z: 120, font: 'name', color: th.ink, a: ap(lt, .6), maxW: 560 });
      else {
        text(ctx, th, D.A, cx, cy - 40, { z: 110, font: 'name', color: th.ink, a: ap(lt, .6), maxW: 560 });
        text(ctx, th, D.lang === 'hi' ? 'संग' : 'weds', cx, cy + 40, { z: 44, font: 'caps', color: th.accent, a: ap(lt, .8) });
        text(ctx, th, D.B, cx, cy + 150, { z: 110, font: 'name', color: th.ink, a: ap(lt, 1), maxW: 560 });
      }
      const by = 1400; ctx.save(); ctx.globalAlpha = ap(lt, 1.3); ctx.fillStyle = th.accent;
      ctx.beginPath(); ctx.moveTo(140, by - 60); ctx.lineTo(W - 140, by - 60); ctx.lineTo(W - 190, by); ctx.lineTo(W - 140, by + 60); ctx.lineTo(140, by + 60); ctx.lineTo(190, by); ctx.closePath(); ctx.fill(); ctx.restore();
      text(ctx, tw(th, true), D.date, cx, by + 14, { z: 44, font: 'caps', color: '#fff', a: ap(lt, 1.4), maxW: 680 });
      text(ctx, th, [D.V, D.CITY].filter(Boolean).join(' · '), cx, by + 130, { z: 40, font: 'body', color: th.ink, a: ap(lt, 1.6), maxW: 820 });
      diyas(ctx, th, cx, 1640, ap(lt, 1.8), lt, 5);
    },
    panel(ctx, film, th, a) {
      const r = { x: 140, y: 320, w: W - 280, h: 1280 }; r.cx = r.x + r.w / 2;
      ctx.save(); ctx.globalAlpha *= clamp(a); scallop(ctx, r.x, r.y, r.w, r.h, th.rg); ctx.fillStyle = th.paper; ctx.fillRect(r.x, r.y, r.w, r.h); ctx.strokeStyle = th.accent; ctx.lineWidth = 4; ctx.strokeRect(r.x + 14, r.y + 14, r.w - 28, r.h - 28); ctx.restore();
      return r;
    },
    day(ctx, film, th, D, sc, lt) {
      const cx = W / 2, b = dateBits(D, sc);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, 760); ctx.clip(); rangoli(ctx, cx, 330, 420, th.rg, ease(lt / 1.4), lt); ctx.restore();
      ctx.save(); ctx.globalAlpha = ap(lt, .2); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx, 330, 170, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      text(ctx, th, b.d, cx, 370, { z: 150, font: 'name', color: th.accent, a: ap(lt, .4) });
      text(ctx, th, `${b.m} · ${b.wd}`, cx, 430, { z: 30, font: 'caps', color: th.ink, a: ap(lt, .5), maxW: 300 });
      text(ctx, th, dayLabel(D, sc), cx, 870, { z: 56, font: 'head', color: th.ink, a: ap(lt, .6) });
      sc.day.events.forEach((e, i) => {
        const y = 1050 + i * 190, a = ap(lt, .8 + i * .2);
        ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = th.rg[i % th.rg.length]; rr(ctx, 150, y - 90, W - 300, 150, 75); ctx.fill(); ctx.restore();
        text(ctx, tw(th, true), e.name, cx, y - 2, { z: 64, font: 'name', color: '#fff', a, maxW: W - 360 });
        text(ctx, tw(th, true), e.time, cx, y + 42, { z: 30, font: 'caps', color: '#fff', a, maxW: W - 360 });
      });
    }
  };

  // ===== Botanical Green: eucalyptus sprigs, an arch of leaves, airy white =====
  function sprig(ctx, x, y, len, ang, col, k, round = false) {
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.strokeStyle = shade(col, -.25); ctx.lineWidth = 3;
    const L = len * clamp(k); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(L * .5, -L * .08, L, 0); ctx.stroke();
    for (let i = 1; i < 9; i++) {
      const p = i / 9; if (p > clamp(k)) break; const px = len * p, s = (1 - p * .5) * Math.min(len * .11, 30);
      [-1, 1].forEach(sd => { ctx.save(); ctx.translate(px, -len * .04 * Math.sin(p * Math.PI)); ctx.rotate(sd * .7); ctx.fillStyle = sd > 0 ? col : shade(col, -.12);
        ctx.beginPath(); if (round) ctx.arc(s * .9, 0, s * .8, 0, Math.PI * 2); else ctx.ellipse(s * 1.1, 0, s * 1.2, s * .5, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); });
    }
    ctx.restore();
  }
  const BOTANICAL = {
    short: 'Botanical', name: 'Botanical Green', trans: 'up', fx: 'none',
    face: face('italic 400 {z}px "Cormorant Garamond", serif', '600 {z}px "Jost", sans-serif', '600 {z}px "Jost", sans-serif', '400 {z}px "Jost", sans-serif', '400 {z}px "Great Vibes", cursive'),
    pals: [P6('Sage', false, ['#fbfaf5', '#eef0e6'], ['#a8b78f', '#6f8456', '#3f4f2c'], '#ffffff', '#24331b', '#6f8456', { lf: '#8fa67a' }),
      P6('Forest', false, ['#f7f9f6', '#e3ece2'], ['#5f8a63', '#3b6640', '#1f3d23'], '#ffffff', '#162b19', '#3b6640', { lf: '#4f7d55' }),
      P6('Olive', false, ['#fbf9f0', '#efead6'], ['#a3a35a', '#7a7a32', '#4a4a14'], '#ffffff', '#2e2e10', '#7a7a32', { lf: '#8c8c48' }),
      P6('Blush Sage', false, ['#fdf6f4', '#f3e3df'], ['#c7a49a', '#9c7268', '#5e3e36'], '#ffffff', '#3a2622', '#b07a70', { lf: '#93a888' }),
      P6('Eucalyptus', false, ['#f6faf9', '#dfece9'], ['#9cc0b6', '#5f8f84', '#2f5850'], '#ffffff', '#183a33', '#4f8478', { lf: '#86aea4', round: true }),
      P6('Moss', false, ['#f9f8f2', '#e8e8d8'], ['#9aa86a', '#66763a', '#38441a'], '#ffffff', '#252e12', '#66763a', { lf: '#77894a', round: true })],
    bg(ctx, th, t) {
      ctx.fillStyle = th.bg[0]; ctx.fillRect(0, 0, W, H);
      const g = ctx.createLinearGradient(0, H * .6, 0, H); g.addColorStop(0, th.bg[0]); g.addColorStop(1, th.bg[1]); ctx.fillStyle = g; ctx.fillRect(0, H * .6, W, H * .4);
      ctx.save(); ctx.globalAlpha = .7; sprig(ctx, -10, 200, 300, -.3 + Math.sin(t) * .02, th.lf, 1, th.round); sprig(ctx, W + 10, H - 200, 300, Math.PI + .3 + Math.sin(t + 1) * .02, th.lf, 1, th.round); ctx.restore();
    },
    open(ctx, film, th, D, sc, lt) {
      sprig(ctx, 160, 1500, 900, -1.1, th.lf, ease(lt / 1.6), th.round);
      sprig(ctx, W - 160, 420, 700, 2.1, th.lf, ease((lt - .5) / 1.4), th.round);
      text(ctx, th, D.heading.toUpperCase(), W / 2, H * .46, { z: 36, font: 'caps', color: th.accent, a: ap(lt, 1.4), ls: 10 });
      text(ctx, th, who2(D, D.lang === 'hi'), W / 2, H * .46 + 140, { z: 120, font: 'name', color: th.ink, a: ap(lt, 1.8), maxW: 860 });
    },
    title(ctx, film, th, D, sc, lt) {
      const cx = W / 2, cy = 900, R = 400;
      for (let i = 0; i < 12; i++) { const a = Math.PI + i / 11 * Math.PI, s = i < 6 ? 1 : -1; sprig(ctx, cx + Math.cos(a) * R, cy + Math.sin(a) * R, 180, a + s * 1.9, th.lf, ease(lt * 1.6 - i * .08), th.round); }
      ctx.save(); ctx.globalAlpha = ap(lt, .2) * .5; ctx.strokeStyle = th.accent; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, R - 40, Math.PI, 0); ctx.lineTo(cx + R - 40, cy + 500); ctx.moveTo(cx - R + 40, cy); ctx.lineTo(cx - R + 40, cy + 500); ctx.stroke(); ctx.restore();
      text(ctx, th, D.lang === 'hi' ? D.heading : D.heading.toUpperCase(), cx, 720, { z: 34, font: 'caps', color: th.accent, a: ap(lt, .4), ls: 8, maxW: 620 });
      if (D.solo) text(ctx, th, D.A, cx, 960, { z: 160, font: 'name', color: th.ink, a: ap(lt, .7), maxW: 700 });
      else {
        text(ctx, th, D.A, cx, 890, { z: 150, font: 'name', color: th.ink, a: ap(lt, .7), maxW: 700 });
        text(ctx, th, '&', cx, 990, { z: 110, font: 'script', color: th.accent, a: ap(lt, .9) });
        text(ctx, th, D.B, cx, 1140, { z: 150, font: 'name', color: th.ink, a: ap(lt, 1.1), maxW: 700 });
      }
      text(ctx, th, D.date, cx, 1300, { z: 36, font: 'caps', color: th.ink, a: ap(lt, 1.4), ls: 4, maxW: 700 });
      text(ctx, th, [D.V, D.CITY].filter(Boolean).join(', '), cx, 1360, { z: 34, font: 'body', color: th.accent, a: ap(lt, 1.6), maxW: 700 });
    },
    panel(ctx, film, th, a) {
      const r = { x: 150, y: 330, w: W - 300, h: 1270 }; r.cx = r.x + r.w / 2;
      ctx.save(); ctx.globalAlpha *= clamp(a); ctx.fillStyle = th.paper; ctx.beginPath(); ctx.moveTo(r.x, r.y + r.h); ctx.lineTo(r.x, r.y + r.w / 2); ctx.arc(r.cx, r.y + r.w / 2, r.w / 2, Math.PI, 0); ctx.lineTo(r.x + r.w, r.y + r.h); ctx.closePath(); ctx.fill(); ctx.strokeStyle = th.accent; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
      sprig(ctx, r.x + 20, r.y + r.h - 20, 260, -.5, th.lf, clamp(a), th.round); sprig(ctx, r.x + r.w - 20, r.y + r.h - 20, 260, Math.PI + .5, th.lf, clamp(a), th.round);
      return { ...r, y: r.y + 120, h: r.h - 160 };
    },
    day(ctx, film, th, D, sc, lt) {
      const cx = W / 2, cy = 700, b = dateBits(D, sc);
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; sprig(ctx, cx + Math.cos(a) * 260, cy + Math.sin(a) * 200, 170, a + 1.9, th.lf, ease(lt * 2 - i * .1), th.round); }
      text(ctx, th, dayLabel(D, sc), cx, cy - 60, { z: 30, font: 'caps', color: th.accent, a: ap(lt, .3), ls: 6 });
      text(ctx, th, b.d, cx, cy + 70, { z: 170, font: 'name', color: th.ink, a: ap(lt, .5) });
      text(ctx, th, `${b.m} · ${b.wd}`, cx, cy + 130, { z: 30, font: 'caps', color: th.ink, a: ap(lt, .6), ls: 3, maxW: 400 });
      rows(ctx, th, sc.day, 170, 1120, W - 340, lt, { z: 80, gap: 150, start: .8 });
    }
  };

  // ===== Bollywood Marquee: chasing bulbs, NOW SHOWING, tickets =====
  function bulbs(ctx, x, y, w, h, t, col = '#ffd36b') {
    const step = 46, pts = [];
    for (let xx = x; xx <= x + w; xx += step) pts.push([xx, y], [xx, y + h]);
    for (let yy = y + step; yy < y + h; yy += step) pts.push([x, yy], [x + w, yy]);
    pts.forEach(([px, py], i) => { const on = (Math.floor(t * 6) + i) % 3 !== 0; ctx.save(); ctx.fillStyle = on ? col : '#5a4a2a'; if (on) { ctx.shadowColor = col; ctx.shadowBlur = 18; } ctx.beginPath(); ctx.arc(px, py, 9, 0, Math.PI * 2); ctx.fill(); ctx.restore(); });
  }
  function ticket(ctx, th, x, y, w, h, a) {
    ctx.save(); ctx.globalAlpha *= clamp(a); ctx.fillStyle = th.paper; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + 120); ctx.arc(x + w, y + 160, 40, -Math.PI / 2, Math.PI / 2, true);
    ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x, y + 200); ctx.arc(x, y + 160, 40, Math.PI / 2, -Math.PI / 2, true); ctx.closePath(); ctx.fill();
    ctx.setLineDash([14, 12]); ctx.strokeStyle = th.accent; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 50, y + 160); ctx.lineTo(x + w - 50, y + 160); ctx.stroke(); ctx.restore();
  }
  const MARQUEE = {
    short: 'Marquee', name: 'Bollywood Marquee', trans: 'slide', fx: 'sparkle',
    face: face('400 {z}px "Bebas Neue", sans-serif', '400 {z}px "Bebas Neue", sans-serif', '400 {z}px "Bebas Neue", sans-serif', '400 {z}px "Jost", sans-serif', '400 {z}px "Great Vibes", cursive'),
    pals: [P6('Ruby', true, ['#9b0f22', '#2a0207'], GOLD, '#fff6e6', '#2a0a0a', '#b3122a'),
      P6('Midnight', true, ['#1a1a2e', '#05050c'], GOLD, '#fff6e6', '#1a1a2e', '#c9302c'),
      P6('Purple', true, ['#4a1470', '#12031c'], GOLD, '#fff6e6', '#2a0a3a', '#7a1fb0'),
      P6('Teal', true, ['#0c4a50', '#021214'], GOLD, '#fff6e6', '#0a2a2e', '#0c7a84'),
      P6('Emerald', true, ['#0d4a2a', '#02140a'], GOLD, '#fff6e6', '#0a2a18', '#0f7a44'),
      P6('Sunset', true, ['#a3360c', '#2a0c02'], GOLD, '#fff6e6', '#2a1004', '#d9480f')],
    bg(ctx, th, t) {
      for (let i = 0; i < 18; i++) { const x = i * W / 18, g = ctx.createLinearGradient(x, 0, x + W / 18, 0); g.addColorStop(0, shade(th.bg[0], -.45)); g.addColorStop(.5, th.bg[0]); g.addColorStop(1, shade(th.bg[0], -.45)); ctx.fillStyle = g; ctx.fillRect(x, 0, W / 18 + 1, H); }
      const v = ctx.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, H * .7); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.65)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
      [-1, 1].forEach(s => { ctx.save(); ctx.translate(W / 2 + s * 380, -40); ctx.rotate(s * (.25 + Math.sin(t * .8 + s) * .12)); const b = ctx.createLinearGradient(0, 0, 0, H); b.addColorStop(0, 'rgba(255,240,200,.28)'); b.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = b; ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(-300, H); ctx.lineTo(300, H); ctx.lineTo(20, 0); ctx.fill(); ctx.restore(); });
    },
    open(ctx, film, th, D, sc, lt) {
      const x = 120, y = 620, w = W - 240, h = 520;
      ctx.save(); ctx.globalAlpha = ap(lt, 0, .5); ctx.fillStyle = '#140a04'; ctx.fillRect(x, y, w, h); ctx.restore();
      bulbs(ctx, x, y, w, h, lt);
      const word = D.lang === 'hi' ? 'अब परदे पर' : 'NOW SHOWING', n = Math.floor(clamp((lt - .4) / 1.6) * word.length);
      text(ctx, tw(th, true), word.slice(0, Math.max(0, n)), W / 2, y + 230, { z: 150, font: 'name', color: 'gold', glow: 24, maxW: w - 80 });
      text(ctx, tw(th, true), who2(D, D.lang === 'hi'), W / 2, y + 400, { z: 80, font: 'name', color: '#fff', a: ap(lt, 2.2), maxW: w - 80 });
    },
    title(ctx, film, th, D, sc, lt) {
      const cx = W / 2, x = 110, y = 300, w = W - 220, h = 1300, t2 = tw(th, true), hi = D.lang === 'hi';
      ctx.save(); ctx.globalAlpha = ap(lt, 0, .6); ctx.fillStyle = 'rgba(10,4,2,.7)'; ctx.fillRect(x, y, w, h); ctx.restore();
      bulbs(ctx, x, y, w, h, lt);
      text(ctx, t2, hi ? 'शुभ विवाह' : `THE ${D.heading.toUpperCase()} OF`, cx, 450, { z: 60, font: 'caps', color: '#fff', a: ap(lt, .2), ls: 3, maxW: w - 80 });
      if (D.solo) text(ctx, t2, D.A.toUpperCase(), cx, 820, { z: 230, font: 'name', color: 'gold', a: ap(lt, .4), glow: 20, maxW: w - 80 });
      else {
        text(ctx, t2, hi ? D.A : D.A.toUpperCase(), cx, 720, { z: 210, font: 'name', color: 'gold', a: ap(lt, .4), glow: 20, maxW: w - 80 });
        text(ctx, t2, '&', cx, 830, { z: 110, font: 'script', color: '#fff', a: ap(lt, .7) });
        text(ctx, t2, hi ? D.B : D.B.toUpperCase(), cx, 1010, { z: 210, font: 'name', color: 'gold', a: ap(lt, 1), glow: 20, maxW: w - 80 });
      }
      text(ctx, t2, '★ ★ ★ ★ ★', cx, 1110, { z: 50, font: 'caps', color: '#ffd36b', a: ap(lt, 1.2) });
      text(ctx, t2, hi ? 'जल्द आ रहा है' : 'COMING SOON', cx, 1200, { z: 56, font: 'caps', color: '#fff', a: ap(lt, 1.4), ls: 6 });
      text(ctx, t2, D.date, cx, 1300, { z: 76, font: 'name', color: 'gold', a: ap(lt, 1.6), maxW: w - 80 });
      text(ctx, t2, [D.V, D.CITY].filter(Boolean).join(' · '), cx, 1380, { z: 40, font: 'body', color: '#fff', a: ap(lt, 1.8), maxW: w - 80 });
    },
    panel(ctx, film, th, a) {
      const r = { x: 130, y: 300, w: W - 260, h: 1320 }; r.cx = r.x + r.w / 2;
      ticket(ctx, th, r.x, r.y, r.w, r.h, a);
      text(ctx, { ...th, dark: false }, D_ADMIT, r.cx, r.y + 105, { z: 56, font: 'caps', color: th.accent, a: clamp(a), ls: 8 });
      return { ...r, y: r.y + 170, h: r.h - 170, th: { ...th, dark: false } };
    },
    day(ctx, film, th, D, sc, lt) {
      const b = dateBits(D, sc), x = 110, y = 560, w = W - 220, h = 820, k = out(lt / .6), t2 = { ...th, dark: false };
      ctx.save(); ctx.translate((1 - k) * 600, 0); ticket(ctx, th, x, y, w, h, k);
      text(ctx, t2, `${dayLabel(D, sc)} · ${D.lang === 'hi' ? 'शो टाइम' : 'SHOW TIME'}`, W / 2, y + 105, { z: 58, font: 'caps', color: th.accent, ls: 4, maxW: w - 80 });
      text(ctx, t2, `${b.d} ${b.m}`, W / 2, y + 330, { z: 150, font: 'name', color: th.ink, maxW: w - 80 });
      text(ctx, t2, b.wd, W / 2, y + 390, { z: 40, font: 'body', color: th.accent });
      ctx.restore();
      rows(ctx, t2, sc.day, x + 70, y + 520, w - 140, lt, { z: 76, gap: 120, col: th.ink, tcol: th.accent, start: .7 });
    }
  };
  const D_ADMIT = 'ADMIT ONE  ·  FRONT ROW';

  // ===== The Wedding Times: a front page with a masthead, a headline and columns =====
  const EDITORIAL = {
    short: 'Times', name: 'The Wedding Times', trans: 'slide', fx: 'none',
    face: face('700 {z}px "Playfair Display", serif', '400 {z}px "UnifrakturMaguntia", serif', '600 {z}px "Jost", sans-serif', 'italic 400 {z}px "Cormorant Garamond", serif', '400 {z}px "Great Vibes", cursive'),
    pals: [P6('Newsprint', false, ['#f4f0e4', '#e9e3d1'], ['#444', '#222', '#000'], '#f9f6ec', '#141414', '#b3121f'),
      P6('Sepia', false, ['#f1e4c9', '#e2cfa8'], ['#7a5a2a', '#5a3e14', '#2e1e06'], '#f7ecd6', '#2e1e0c', '#8a4b14'),
      P6('Evening', false, ['#ededed', '#dcdcdc'], ['#555', '#333', '#111'], '#f6f6f6', '#151515', '#0d4f8c'),
      P6('Gazette', false, ['#f6f1e2', '#ebe1c6'], ['#2a3a5a', '#1a2a4a', '#0a1428'], '#fbf7ea', '#111a2e', '#1a2a4a'),
      P6('Rose Daily', false, ['#fbefed', '#f1dcd8'], ['#7a2a3a', '#5a1a2a', '#2e0a14'], '#fdf6f5', '#231518', '#c2185b'),
      P6('Garden Post', false, ['#eef3e8', '#dbe6cf'], ['#3a5a2a', '#2a4a1a', '#14280a'], '#f6f9f2', '#18241a', '#2e7d32')],
    bg(ctx, th, t) {
      ctx.fillStyle = th.bg[0]; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.globalAlpha = .07; ctx.fillStyle = '#000'; for (let y = 0; y < H; y += 9) for (let x = (y % 18); x < W; x += 18) ctx.fillRect(x, y, 2, 2);
      ctx.globalAlpha = .12; ctx.fillStyle = '#000'; ctx.fillRect(W / 2 - 1, 0, 2, H); ctx.restore();
    },
    page(ctx, th, D, lt, small) {
      const cx = W / 2, hi = D.lang === 'hi', a = s => small ? 1 : ap(lt, s);
      text(ctx, th, hi ? 'शुभ समाचार' : 'The Wedding Times', cx, 380, { z: hi ? 110 : 120, font: hi ? 'name' : 'head', color: th.ink, a: a(0), maxW: 900 });
      ctx.save(); ctx.globalAlpha = a(.1); ctx.fillStyle = th.ink; ctx.fillRect(90, 420, W - 180, 6); ctx.fillRect(90, 432, W - 180, 2); ctx.fillRect(90, 488, W - 180, 2); ctx.restore();
      text(ctx, th, `${hi ? 'अंक 1' : 'VOL. I'}  ·  ${D.date}  ·  ${hi ? 'मूल्य: आपका आशीर्वाद' : 'PRICE: YOUR BLESSINGS'}`, cx, 470, { z: 24, font: 'caps', color: th.ink, a: a(.2), maxW: 880, ls: 1 });
      text(ctx, th, who2(D, hi).toUpperCase(), cx, 650, { z: 150, font: 'name', color: th.ink, a: a(.4), maxW: 900, rise: 20 });
      text(ctx, th, D.solo ? (hi ? 'का जश्न!' : 'CELEBRATES!') : (hi ? 'विवाह बंधन में बंधेंगे!' : 'TO TIE THE KNOT!'), cx, 760, { z: 80, font: 'name', color: th.accent, a: a(.6), maxW: 900 });
      ctx.save(); ctx.globalAlpha = a(.8); ctx.fillStyle = th.accent; ctx.fillRect(90, 830, 440, 520); ctx.fillStyle = th.ink;
      for (let i = 0; i < 16; i++) ctx.fillRect(570, 850 + i * 32, i % 5 === 4 ? 260 : 420, 12);
      ctx.restore();
      text(ctx, tw(th, true), D.mono, 310, 1130, { z: 150, font: 'name', color: '#fff', a: a(.9), maxW: 400 });
      text(ctx, th, `${hi ? 'स्थान' : 'VENUE'}: ${[D.V, D.CITY].filter(Boolean).join(', ')}`, cx, 1420, { z: 34, font: 'body', color: th.ink, a: a(1.1), maxW: 900 });
      ctx.save(); ctx.globalAlpha = a(1.2); ctx.fillStyle = th.ink; ctx.fillRect(90, 1460, W - 180, 2); ctx.restore();
      text(ctx, th, D.heading, cx, 1540, { z: 60, font: 'script', color: th.accent, a: a(1.3) });
    },
    open(ctx, film, th, D, sc, lt) {
      const k = ease(lt / 2.4);
      ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate((1 - k) * Math.PI * 6); ctx.scale(.08 + .92 * k, .08 + .92 * k); ctx.translate(-W / 2, -H / 2);
      ctx.fillStyle = th.paper; ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 60; ctx.fillRect(60, 260, W - 120, 1400); ctx.shadowColor = 'transparent';
      EDITORIAL.page(ctx, th, D, lt, true); ctx.restore();
      if (lt > 2.4) { ctx.save(); ctx.globalAlpha = ap(lt, 2.4, .3); ctx.translate(W / 2 + 230, 300); ctx.rotate(-.18); ctx.strokeStyle = th.accent; ctx.lineWidth = 6; ctx.strokeRect(-200, -60, 400, 120); ctx.restore(); text(ctx, th, D.lang === 'hi' ? 'ताज़ा ख़बर!' : 'EXTRA! EXTRA!', W / 2 + 230, 320, { z: 50, font: 'caps', color: th.accent, a: ap(lt, 2.4, .3) }); }
    },
    title(ctx, film, th, D, sc, lt) { EDITORIAL.page(ctx, th, D, lt, false); },
    panel(ctx, film, th, a) {
      const r = { x: 110, y: 300, w: W - 220, h: 1320 }; r.cx = r.x + r.w / 2;
      ctx.save(); ctx.globalAlpha *= clamp(a); ctx.fillStyle = th.paper; ctx.fillRect(r.x, r.y, r.w, r.h); ctx.fillStyle = th.ink; ctx.fillRect(r.x, r.y, r.w, 8); ctx.fillRect(r.x, r.y + 16, r.w, 2); ctx.fillRect(r.x, r.y + r.h - 8, r.w, 8); ctx.restore();
      return r;
    },
    day(ctx, film, th, D, sc, lt) {
      const cx = W / 2, b = dateBits(D, sc), hi = D.lang === 'hi';
      text(ctx, th, hi ? 'आज का कार्यक्रम' : "TODAY'S PROGRAMME", cx, 480, { z: 90, font: 'name', color: th.ink, a: ap(lt, .1), maxW: 900 });
      ctx.save(); ctx.globalAlpha = ap(lt, .2); ctx.fillStyle = th.ink; ctx.fillRect(90, 530, W - 180, 6); ctx.fillRect(90, 542, W - 180, 2); ctx.restore();
      text(ctx, th, `${dayLabel(D, sc)} — ${b.wd}, ${b.d} ${b.m}`, cx, 620, { z: 40, font: 'caps', color: th.accent, a: ap(lt, .3), maxW: 900 });
      sc.day.events.forEach((e, i) => {
        const y = 820 + i * 170, a = ap(lt, .5 + i * .2);
        text(ctx, th, e.name, 110, y, { z: 80, font: 'name', color: th.ink, align: 'left', a, maxW: 560 });
        text(ctx, th, e.time, W - 110, y, { z: 44, font: 'caps', color: th.ink, align: 'right', a, maxW: 300 });
        ctx.save(); ctx.globalAlpha = a; ctx.setLineDash([4, 10]); ctx.strokeStyle = th.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(110, y + 40); ctx.lineTo(W - 110, y + 40); ctx.stroke(); ctx.restore();
      });
      text(ctx, th, [D.V, D.CITY].filter(Boolean).join(', '), cx, 1500, { z: 40, font: 'body', color: th.ink, a: ap(lt, 1.2), maxW: 900 });
    }
  };

  // ===== Royal Farmaan: a scroll that unrolls on velvet, sealed with wax =====
  function scroll(ctx, th, top, bottom, a = 1) {
    const x = 150, w = W - 300;
    ctx.save(); ctx.globalAlpha *= clamp(a);
    const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, shade(th.paper, -.18)); g.addColorStop(.12, th.paper); g.addColorStop(.88, th.paper); g.addColorStop(1, shade(th.paper, -.18));
    ctx.fillStyle = g; ctx.fillRect(x, top, w, bottom - top);
    ctx.globalAlpha *= .25; ctx.fillStyle = '#7a5a2a'; for (let i = 0; i < 60; i++) ctx.fillRect(x + hash(i) * w, top + hash(i + 9) * (bottom - top), 3, 3);
    ctx.restore();
    [top, bottom].forEach(y => { ctx.save(); ctx.globalAlpha *= clamp(a); const r = ctx.createLinearGradient(0, y - 30, 0, y + 30); r.addColorStop(0, '#5a3214'); r.addColorStop(.5, '#c9883e'); r.addColorStop(1, '#4a280e'); ctx.fillStyle = r; rr(ctx, x - 50, y - 30, w + 100, 60, 30); ctx.fill();
      ctx.fillStyle = goldFill(ctx, th, y + 20, 50); ctx.beginPath(); ctx.arc(x - 60, y, 34, 0, Math.PI * 2); ctx.arc(x + w + 60, y, 34, 0, Math.PI * 2); ctx.fill(); ctx.restore(); });
    return { x: x + 30, y: top + 60, w: w - 60, h: bottom - top - 120, cx: W / 2 };
  }
  function seal(ctx, th, x, y, r, s, a) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(1 + (1 - a) * .6, 1 + (1 - a) * .6);
    ctx.fillStyle = th.accent; ctx.beginPath(); for (let i = 0; i < 24; i++) { const ang = i / 24 * Math.PI * 2, rr2 = r * (i % 2 ? .92 : 1.04); ctx.lineTo(Math.cos(ang) * rr2, Math.sin(ang) * rr2); } ctx.closePath(); ctx.fill();
    ctx.strokeStyle = shade(th.accent, -.35); ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, r * .72, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    text(ctx, tw(th, true), s, x, y + r * .2, { z: r * .55, font: 'caps', color: '#fff', a, maxW: r * 1.3 });
  }
  const SCROLL = {
    short: 'Farmaan', name: 'Royal Farmaan', trans: 'fade', fx: 'sparkle',
    face: face('400 {z}px "Pinyon Script", cursive', '400 {z}px "Cinzel", serif', '400 {z}px "Cinzel", serif', 'italic 400 {z}px "Cormorant Garamond", serif', '400 {z}px "Pinyon Script", cursive'),
    pals: [P6('Maroon', true, ['#5c0f1e', '#1a0307'], GOLD, '#f3e2b8', '#4a2a10', '#9b1b30'),
      P6('Emerald', true, ['#0f4a32', '#03140d'], GOLD, '#f2e3bd', '#3a2a10', '#1b6b45'),
      P6('Indigo', true, ['#1b2560', '#05081a'], GOLD, '#f1e4c2', '#2a2410', '#2a3f9e'),
      P6('Ebony', true, ['#2a2420', '#070605'], GOLD, '#efdfb4', '#3a2810', '#7a1a1a'),
      P6('Aubergine', true, ['#4a1a4e', '#120414'], GOLD, '#f2e2c0', '#3a2414', '#7a2a7e'),
      P6('Saffron', true, ['#8a3a0c', '#240c02'], GOLD, '#f4e4bc', '#4a2a10', '#c2570e')],
    bg(ctx, th, t) {
      const g = ctx.createRadialGradient(W / 2, H * .45, 60, W / 2, H / 2, H * .75); g.addColorStop(0, th.bg[0]); g.addColorStop(1, th.bg[1]); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.globalAlpha = .08; ctx.strokeStyle = th.gold[1]; ctx.lineWidth = 2; for (let i = -H; i < W; i += 70) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke(); ctx.beginPath(); ctx.moveTo(i + H, 0); ctx.lineTo(i, H); ctx.stroke(); } ctx.restore();
    },
    open(ctx, film, th, D, sc, lt) {
      const k = ease((lt - .2) / 1.8), half = 650 * k, cy = H / 2;
      const r = scroll(ctx, th, cy - Math.max(30, half), cy + Math.max(30, half));
      if (k > .7) text(ctx, th, D.lang === 'hi' ? 'शाही निमन्त्रण' : 'A ROYAL INVITATION', W / 2, cy - 60, { z: 54, font: 'caps', color: th.ink, a: ap(lt, 1.6), ls: 3, maxW: r.w });
      if (k > .7) text(ctx, th, who2(D, D.lang === 'hi'), W / 2, cy + 90, { z: 110, font: 'name', color: th.accent, a: ap(lt, 2), maxW: r.w });
      seal(ctx, th, W / 2, cy + 400, 80, D.mono.replace(' | ', ''), ap(lt, 2.6, .5));
    },
    title(ctx, film, th, D, sc, lt) {
      const r = scroll(ctx, th, 260, 1640), cx = W / 2, hi = D.lang === 'hi';
      text(ctx, th, D.sacred ? '॥ श्री गणेशाय नमः ॥' : (hi ? 'शाही निमन्त्रण' : 'BY ROYAL INVITATION'), cx, 430, { z: 34, font: D.sacred ? 'deva' : 'caps', color: th.accent, a: ap(lt, .2), ls: 3 });
      text(ctx, th, D.heading, cx, 560, { z: 70, font: 'caps', color: th.ink, a: ap(lt, .4), maxW: r.w });
      if (D.solo) text(ctx, th, D.A, cx, 860, { z: 170, font: 'name', color: th.accent, a: ap(lt, .6), maxW: r.w });
      else {
        text(ctx, th, D.A, cx, 790, { z: 160, font: 'name', color: th.accent, a: ap(lt, .6), maxW: r.w });
        text(ctx, th, hi ? 'संग' : 'with', cx, 880, { z: 44, font: 'body', color: th.ink, a: ap(lt, .8) });
        text(ctx, th, D.B, cx, 1030, { z: 160, font: 'name', color: th.accent, a: ap(lt, 1), maxW: r.w });
      }
      text(ctx, th, D.date, cx, 1170, { z: 40, font: 'caps', color: th.ink, a: ap(lt, 1.3), ls: 2, maxW: r.w });
      text(ctx, th, [D.V, D.CITY].filter(Boolean).join(' · '), cx, 1240, { z: 40, font: 'body', color: th.ink, a: ap(lt, 1.5), maxW: r.w });
      seal(ctx, th, cx, 1440, 90, D.mono.replace(' | ', ''), ap(lt, 1.9, .4));
    },
    panel(ctx, film, th, a) { return scroll(ctx, th, 260, 1640, a); },
    day(ctx, film, th, D, sc, lt) {
      const b = dateBits(D, sc), k = ease(lt / .9), r = scroll(ctx, th, H / 2 - 620 * k - 30, H / 2 + 620 * k + 30);
      if (k < .6) return;
      text(ctx, th, dayLabel(D, sc), W / 2, 520, { z: 46, font: 'caps', color: th.accent, a: ap(lt, .6), ls: 4 });
      text(ctx, th, `${b.wd}, ${b.d} ${b.m}`, W / 2, 610, { z: 44, font: 'body', color: th.ink, a: ap(lt, .7), maxW: r.w });
      rows(ctx, th, sc.day, r.x + 40, 840, r.w - 80, lt, { z: 100, gap: 200, align: 'center', col: th.accent, tcol: th.ink, start: .9 });
    }
  };

  const CONCEPTS = { minimal: MINIMAL, floral: FLORAL, cinema: CINEMA, deco: DECO, polaroid: POLAROID, neon: NEON, rangoli: RANGOLI, botanical: BOTANICAL, marquee: MARQUEE, editorial: EDITORIAL, scroll: SCROLL };
  const CONCEPT_OCC = {
    minimal: ['wedding', 'engagement', 'reception', 'anniversary', 'wedding', 'engagement'],
    floral: ['wedding', 'mehendi', 'babyshower', 'engagement', 'haldi', 'wedding'],
    cinema: ['wedding', 'reception', 'engagement', 'anniversary', 'sangeet', 'wedding'],
    deco: ['reception', 'anniversary', 'wedding', 'engagement', 'sangeet', 'birthday'],
    polaroid: ['engagement', 'birthday', 'anniversary', 'babyshower', 'wedding', 'naming'],
    neon: ['birthday', 'sangeet', 'reception', 'birthday', 'engagement', 'sangeet'],
    rangoli: ['wedding', 'haldi', 'mehendi', 'housewarming', 'puja', 'naming'],
    botanical: ['wedding', 'engagement', 'haldi', 'babyshower', 'reception', 'wedding'],
    marquee: ['wedding', 'sangeet', 'reception', 'birthday', 'engagement', 'anniversary'],
    editorial: ['wedding', 'engagement', 'anniversary', 'birthday', 'reception', 'babyshower'],
    scroll: ['wedding', 'engagement', 'puja', 'housewarming', 'reception', 'wedding']
  };
  const themeOf = film => film.concept && CONCEPTS[film.concept] ? CONCEPTS[film.concept].pals[film.pal] : THEMES[film.theme];
  // The words' holder in a concept (a card in Royal Heritage)
  function holder(ctx, film, th, lt, rise) {
    const C = CONCEPTS[film.concept];
    if (!C) { frame(ctx, film, th, 1, lt); return card(ctx, film, th, ap(lt, 0, .8), rise); }
    return C.panel(ctx, film, th, ap(lt, 0, .8));
  }
  const LIST = buildList(), byId = Object.fromEntries(LIST.map(f => [f.id, f]));
  // A concept's last screen: its names screen again, then the credit
  function conceptFinale(ctx, film, th, D, sc, lt, C) {
    if (C.finale) return C.finale(ctx, film, th, D, sc, lt);
    C.title(ctx, film, th, D, sc, lt);
    credit(ctx, th, D, lt, 1690, th.dark ? '#fff' : th.accent);
  }

  // ---------- The player ----------
  function drawScene(ctx, film, th, P, sc, lt) {
    const C = CONCEPTS[film.concept];
    FACE = C ? C.face : FACE0;
    if (!C) {
      if (sc.k !== 'day') { background(ctx, th, lt + sc.t0, null); particles(ctx, th, film.fx, lt + sc.t0, false); }
      return SCENES[sc.k](ctx, film, th, P.D, sc, lt);
    }
    C.bg(ctx, th, lt + sc.t0, sc);
    if (C.fx !== 'none') particles(ctx, th, C.fx, lt + sc.t0, false);
    if (sc.k === 'open') C.open(ctx, film, th, P.D, sc, lt);
    else if (sc.k === 'title') C.title(ctx, film, th, P.D, sc, lt);
    else if (sc.k === 'day') C.day(ctx, film, th, P.D, sc, lt);
    else if (sc.k === 'finale') conceptFinale(ctx, film, th, P.D, sc, lt, C);
    else SCENES[sc.k](ctx, film, th, P.D, sc, lt);
  }
  class Player {
    constructor(canvas, scale = .5) {
      this.c = canvas; this.s = scale; canvas.width = Math.round(W * scale); canvas.height = Math.round(H * scale);
      this.ctx = canvas.getContext('2d'); this.total = 1;
    }
    // opts.sign = false leaves out "Designed by Sankalp" (the Studio's branding switch)
    set(film, lang, card, opts = {}) {
      this.film = typeof film === 'string' ? byId[film] : film;
      this.lang = lang || this.film.lang;
      this.P = script(this.film, this.lang, card, opts); this.total = this.P.total;
      if (opts.sign === false) { this.P.D.credit = ''; this.P.D.site = ''; }
      this.tl = { scenes: this.P.scenes }; // the Studio's scene buttons
    }
    // The moment shown as the film's picture: the names, fully arrived
    posterTime() { const s = this.P.scenes.find(x => x.k === 'title'); return s.t0 + s.d - .7; }
    draw(t) {
      const { ctx, film } = this, th = themeOf(film), C = CONCEPTS[film.concept], S = this.P.scenes, FADE = C && C.trans === 'slide' ? .7 : .55;
      t = clamp(t, 0, this.total - .001); NOW = t;
      ctx.setTransform(this.s, 0, 0, this.s, 0, 0);
      const i = S.findIndex(x => t < x.t0 + x.d), sc = S[i < 0 ? S.length - 1 : i], lt = t - sc.t0;
      drawScene(ctx, film, th, this.P, sc, lt);
      const next = S[i + 1];
      if (next && lt > sc.d - FADE) {
        // each concept moves to the next screen its own way
        const a = ease((lt - (sc.d - FADE)) / FADE), tr = C ? C.trans : 'fade';
        ctx.save();
        if (tr === 'slide') ctx.translate((1 - a) * W, 0);
        else if (tr === 'up') { ctx.globalAlpha = a; ctx.translate(0, (1 - a) * 180); }
        else if (tr === 'zoom') { ctx.globalAlpha = a; const k = 1 + (1 - a) * .14; ctx.translate(W / 2, H / 2); ctx.scale(k, k); ctx.translate(-W / 2, -H / 2); }
        else if (tr === 'wipe') { ctx.beginPath(); ctx.arc(W / 2, H / 2, Math.max(1, a * H * .62), 0, Math.PI * 2); ctx.clip(); }
        else ctx.globalAlpha = a;
        drawScene(ctx, film, th, this.P, next, lt - (sc.d - FADE) - FADE);
        ctx.restore();
      }
      FACE = FACE0;
      if (!C) corners(ctx, th);
      signature(ctx, th, this.P.D.credit, this.P.D.site);
      return sc;
    }
  }
  // Fonts the films use (Hindi ones are added to the page when missing)
  function fontsReady() {
    if (typeof document === 'undefined' || !document.fonts) return Promise.resolve();
    let link = document.querySelector('link[data-film-fonts]');
    if (!link) {
      link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Amita:wght@700&family=Tiro+Devanagari+Hindi&family=Yatra+One&family=Cinzel:wght@400&family=Great+Vibes&family=Playfair+Display:wght@700&family=Cormorant+Garamond:ital,wght@1,400&family=Jost:wght@400;600&family=DM+Serif+Display&family=Caveat:wght@500;700&family=Righteous&family=Bebas+Neue&family=Poiret+One&family=UnifrakturMaguntia&family=Cinzel+Decorative:wght@700&family=Marcellus&family=Pacifico&family=Pinyon+Script&display=swap' });
      link.dataset.filmFonts = '1';
      link.loaded = new Promise(r => { link.onload = link.onerror = r; setTimeout(r, 5000); });
      document.head.appendChild(link);
    }
    return Promise.resolve(link.loaded).then(() => loadFonts());
  }
  function loadFonts() {
    const want = ['700 40px "Playfair Display"', '400 40px "Cinzel"', '40px "Great Vibes"', 'italic 400 40px "Cormorant Garamond"', '400 40px "Jost"', '600 40px "Jost"', '40px "DM Serif Display"',
      '700 40px "Caveat"', '500 40px "Caveat"', '40px "Righteous"', '40px "Bebas Neue"', '40px "Poiret One"', '40px "UnifrakturMaguntia"', '700 40px "Cinzel Decorative"', '40px "Marcellus"', '40px "Pacifico"', '40px "Pinyon Script"'].map(f => document.fonts.load(f));
    const hindi = ['700 40px "Amita"', '40px "Tiro Devanagari Hindi"', '40px "Yatra One"'].map(f => document.fonts.load(f, 'ॐ शुभ विवाह'));
    return Promise.race([Promise.all([...want, ...hindi]).then(() => document.fonts.ready), new Promise(r => setTimeout(r, 15000))]).catch(() => {});
  }

  return { W, H, THEMES, FRAMES, OPENINGS, FX, LIST, byId, describe, CONCEPTS, conceptName, themeOf, details, fromCard, script, Player, fontsReady, SCENE_NAME };
})();

if (typeof module !== 'undefined') module.exports = Films;
