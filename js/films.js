// Premium films: invitation videos drawn live on a canvas, in the style of the maroon-and-gold "Royal Darbar" film.
// An opening, the names, the invitation card, one card per day of functions, the venue, the families, a little
// note and a finale signed by Sankalp. Every film is its own palette × frame (no two share both), with its own
// opening, sparkle and occasion, and made-up sample names, places and numbers (no real person's details).
// js/site.js shows them under Story videos; tools/film-posters.mjs draws their pictures into img/films/.
// Art: couples and Ganesh ji come from img/films-art/*.webp (light copies of img/couples/cut and img/art/cut); they
// load when a film is set and fade in, and a film still plays (code-drawn) if one is missing.
// AI scenes (optional): a full-scene picture at img/scenes/<function>-NN.<jpg|jpeg|png|webp>, listed by its full file
// name in js/scenes.js (SCENE_ART, shared with the cards; films.js loads that list itself when the page has not).
// function: ganesh, invite, haldi, mehendi, sangeet, baraat, wedding, reception, vidai, family, thanks; couple-NN (a
// full-scene couple) also serves invite and thanks. A scene of that function (opening = ganesh/invite, names/card =
// invite, a day = its first function, families/note = family, finale = thanks) shows it full-bleed (cover, scaled
// once to the player's size, slow Ken Burns drift) under a readability scrim; Royal Heritage, Rangoli, Farmaan,
// Jharokha and Temple use it for every scene, the other concepts on their day screens. Films pick 01…NN by number.
// Only listed files are requested; a missing or broken one is skipped and the painted scene is drawn instead.
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
    while (picked.length < 10) {
      const last = picked[picked.length - 1] || list[0];
      const k = pairs.findIndex(([t, f]) => !last || (t !== (last[0] || last.theme) && f !== (last[1] || last.frame)));
      picked.push(pairs.splice(k < 0 ? 0 : k, 1)[0]);
    }
    const SOLO = ['birthday', 'naming', 'housewarming', 'puja'];
    let solo = 0;
    const groups = { heritage: picked.slice(0, 10).map(([theme, frame], n) => ({ concept: 'heritage', theme, frame, occ: OCC_SEQ[(n + 1) % OCC_SEQ.length], n })) };
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
    // Everything else printed on the card (read from its PDF) goes into the film too
    const txt = v => String(v || '').trim();
    // the card's invocation: a Ganesh one is already written by the film itself; any other (ॐ नमः शिवाय…) goes on top
    if (txt(card.invocation)) { if (/गणेश|ganesh/i.test(card.invocation)) out.sacred = true; else out.top = txt(card.invocation); }
    const inviters = (card.inviters || []).map(txt).filter(Boolean), grand = (card.grandparents || []).map(txt).filter(Boolean);
    const pages = (head, list) => { const p = []; for (let i = 0; i < list.length; i += 4) p.push([head, ...list.slice(i, i + 4)]); return p; };
    if (inviters.length || grand.length) {
      out.regardsPages = [...pages(L('WITH BEST COMPLIMENTS', 'निवेदक'), inviters), ...pages(L('WITH BLESSINGS FROM', 'आशीर्वाद सहित'), grand)].slice(0, 4);
      out.regards = out.regardsPages[0];
    }
    // a shloka or a couplet, in two lines (at a pause, else near the middle)
    const twoLines = quote => {
      const words = quote.replace(/[“”"]/g, '').split(/\s+/).filter(Boolean);
      const mid = words.length / 2, score = i => Math.abs(i + 1 - mid) - (/[।॥|]$/.test(words[i]) ? 3 : 0);
      const pauses = words.map((w, i) => i).filter(i => i < words.length - 1 && /[,।|;॥]$/.test(words[i])).sort((a, b) => score(a) - score(b));
      const cut = pauses.length && Math.abs(pauses[0] + 1 - mid) <= mid * .6 ? pauses[0] + 1 : Math.ceil(mid);
      return [words.slice(0, cut).join(' '), words.slice(cut).join(' ')].filter(Boolean);
    };
    const quotes = (Array.isArray(card.quotes) ? card.quotes : [card.quote]).map(txt).filter(Boolean);
    if (quotes[0]) out.note = { label: L('Blessings', 'शुभाशीष'), lines: twoLines(quotes[0]), by: out.note ? out.note.by : '' };
    // every other shloka gets a screen of its own
    out.verses = quotes.slice(1, 5).map(twoLines);
    if (txt(card.kids)) out.kids = txt(card.kids);
    // the little ones' request: its lines, the names last
    out.kidsLines = String(card.kids || '').split('\n').map(txt).filter(Boolean).slice(0, 5);
    // every other line printed on the card, a few to a screen
    const more = (card.more || []).map(txt).filter(Boolean).slice(0, 24);
    out.morePages = [];
    for (let i = 0; i < more.length; i += 5) out.morePages.push(more.slice(i, i + 5));
    return out;
  }
  // The scene buttons' names in the Studio
  const SCENE_NAME = { open: 'Opening', title: 'Names', card: 'Invitation', day: 'Functions', venue: 'Venue', regards: 'Families', note: 'Note', verse: 'Shloka', kids: 'Little ones', words: 'Card words', finale: 'Finale' };

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
    // the card's other words, right after the invitation
    if (!skip.has('words')) (D.morePages || []).forEach((lines, i) => s.push({ k: 'words', lines, i, d: 3 + lines.length * .9 }));
    if (!skip.has('day')) D.days.forEach((day, i) => s.push({ k: 'day', day, i, n: D.days.length, d: D.days.length > 1 ? 3.4 : 4.2 }));
    if (!skip.has('venue') && D.V) s.push({ k: 'venue', d: 4.5 });
    if (D.regards && !skip.has('regards')) (D.regardsPages || [D.regards]).forEach((group, i) => s.push({ k: 'regards', group: D.regardsPages ? group : null, i, d: 4.5 }));
    if (!skip.has('verse')) (D.verses || []).forEach((lines, i) => s.push({ k: 'verse', lines, i, d: 5 }));
    if (!skip.has('kids') && D.kidsLines && D.kidsLines.length) s.push({ k: 'kids', d: 5.5 });
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
    // big letters get real foil: a bright crown, a deeper band where the light turns, a bright lip below
    const g = ctx.createLinearGradient(0, y - z * .85, 0, y + z * .22), [hi, mid, lo] = th.gold;
    if (z < 44) { g.addColorStop(0, hi); g.addColorStop(.55, mid); g.addColorStop(1, lo); return g; }
    g.addColorStop(0, hi); g.addColorStop(.3, mid); g.addColorStop(.5, lo); g.addColorStop(.6, mid); g.addColorStop(.82, hi); g.addColorStop(1, mid);
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
    if (color === 'gold' && size >= 34) {
      // pressed foil: a soft dark bed under the letters, then the metal, then a fine dark edge
      ctx.save(); ctx.shadowColor = 'transparent'; ctx.fillStyle = th.dark ? 'rgba(0,0,0,.55)' : rgba(hex6(th.gold[2]), .35);
      ctx.filter = 'none'; ctx.fillText(spaced, x, yy + Math.max(2, size * .035)); ctx.restore();
    }
    ctx.fillText(spaced, x, yy);
    if (color === 'gold' && size >= 60) { ctx.save(); ctx.shadowColor = 'transparent'; ctx.lineWidth = Math.max(1, size * .012); ctx.strokeStyle = rgba(hex6(th.gold[2]), .55); ctx.strokeText(spaced, x, yy); ctx.restore(); }
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

  // ---------- Premium kit: foil, paper, silk, flowers, gilt frames, art and painted stages ----------
  // Static layers (backgrounds, stages, gilt boards, flower sprites) are painted once at the player's scale on
  // offscreen canvases and reused every frame, so a phone only redraws the moving parts.
  const HAS_DOM = typeof document !== 'undefined' && typeof Image !== 'undefined';
  let SCALE = .5;
  const LAYERS = new Map();
  function layer(key, paint, w = W, h = H) {
    if (!HAS_DOM) return null;
    const k = `${key}@${SCALE}`;
    let c = LAYERS.get(k);
    if (c) { LAYERS.delete(k); LAYERS.set(k, c); return c; }
    c = document.createElement('canvas');
    const s = w * h > 300000 ? SCALE : Math.max(SCALE, 1); // little sprites stay sharp
    c.width = Math.max(1, Math.round(w * s)); c.height = Math.max(1, Math.round(h * s));
    const g = c.getContext('2d'); g.scale(s, s);
    try { paint(g, w, h); } catch (e) { /* a layer that fails stays blank */ }
    LAYERS.set(k, c);
    // iPhone Safari caps canvas memory: drop the oldest layers and release their pixels at once
    while (LAYERS.size > 28) { const old = LAYERS.keys().next().value, oc = LAYERS.get(old); LAYERS.delete(old); oc.width = oc.height = 0; }
    return c;
  }
  const put = (ctx, c, x = 0, y = 0, w = W, h = H) => { if (c && c.width) ctx.drawImage(c, x, y, w, h); };
  const thKey = th => `${th.word}|${th.bg[0]}|${th.accent}|${th.gold[1]}`;
  const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
  const mix = (a, b, k) => { const p = parseInt(a.slice(1), 16), q = parseInt(b.slice(1), 16), f = s => Math.round(((p >> s) & 255) * (1 - k) + ((q >> s) & 255) * k); return '#' + [16, 8, 0].map(s => f(s).toString(16).padStart(2, '0')).join(''); };
  const hex6 = c => /^#[0-9a-f]{6}$/i.test(c) ? c : '#808080';
  // Brushed foil: light and dark bands across, like real gold leaf catching the light
  function foil(ctx, th, x0, y0, x1, y1) {
    const [hi, mid, lo] = th.gold, g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, mid); g.addColorStop(.18, hi); g.addColorStop(.36, mid); g.addColorStop(.52, lo); g.addColorStop(.68, mid); g.addColorStop(.84, hi); g.addColorStop(1, mid);
    return g;
  }
  // A grain of noise over a layer (paper tooth, silk weave)
  let GRAIN = null;
  function grain(g, a = .05, w = W, h = H, mode = 'overlay') {
    if (!HAS_DOM) return;
    if (!GRAIN) {
      GRAIN = document.createElement('canvas'); GRAIN.width = GRAIN.height = 160;
      const gc = GRAIN.getContext('2d'), d = gc.createImageData(160, 160), r = rng(99);
      for (let i = 0; i < d.data.length; i += 4) { const v = 70 + r() * 120; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
      gc.putImageData(d, 0, 0);
    }
    g.save(); g.globalAlpha = a; g.globalCompositeOperation = mode; g.fillStyle = g.createPattern(GRAIN, 'repeat'); g.fillRect(0, 0, w, h); g.restore();
  }
  // A paisley (buta), the motif woven into silk and printed on cards
  function buta(g, x, y, s, rot) {
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(s / 100, s / 100);
    g.beginPath(); g.moveTo(0, 50); g.bezierCurveTo(-48, 40, -50, -20, -10, -36); g.bezierCurveTo(20, -48, 46, -30, 30, -60);
    g.bezierCurveTo(62, -30, 52, 30, 0, 50); g.closePath(); g.fill();
    g.restore();
  }
  function damask(g, col, a, w = W, h = H, step = 150) {
    g.save(); g.globalAlpha = a; g.fillStyle = col; g.strokeStyle = col; g.lineWidth = 2;
    for (let y = -step; y < h + step; y += step) for (let x = -step; x < w + step; x += step) {
      const ox = ((y / step) % 2 ? step / 2 : 0);
      buta(g, x + ox, y, 46, .5);
      g.beginPath(); g.arc(x + ox + step / 2, y + step / 2, 5, 0, Math.PI * 2); g.fill();
      for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(x + ox + step / 2 + Math.cos(i * Math.PI / 2) * 14, y + step / 2 + Math.sin(i * Math.PI / 2) * 14, 7, 3, i * Math.PI / 2, 0, Math.PI * 2); g.fill(); }
    }
    g.restore();
  }
  // Silk / velvet: a lit centre, woven motif, grain and a deep vignette
  function silkBg(g, c0, c1, motif, ma, w = W, h = H, light = false) {
    const b = g.createRadialGradient(w / 2, h * .36, 40, w / 2, h * .5, h * .78);
    b.addColorStop(0, c0); b.addColorStop(1, c1); g.fillStyle = b; g.fillRect(0, 0, w, h);
    damask(g, motif, ma, w, h);
    // the sheen of silk: soft diagonal bands
    g.save(); g.globalCompositeOperation = light ? 'multiply' : 'screen'; g.globalAlpha = light ? .04 : .035;
    for (let i = -2; i < 6; i++) { const s = g.createLinearGradient(i * 300, 0, i * 300 + 420, h * .4); s.addColorStop(0, 'rgba(255,255,255,0)'); s.addColorStop(.5, light ? '#a07040' : '#ffffff'); s.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = s; g.fillRect(0, 0, w, h); }
    g.restore();
    grain(g, light ? .06 : .09, w, h);
    const v = g.createRadialGradient(w / 2, h * .45, h * .28, w / 2, h * .5, h * .75);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, light ? 'rgba(90,50,10,.22)' : 'rgba(0,0,0,.6)'); g.fillStyle = v; g.fillRect(0, 0, w, h);
  }
  // Handmade paper: tone, fibres, tooth
  function paperFill(g, col, w, h, seed = 3) {
    g.fillStyle = col; g.fillRect(0, 0, w, h);
    const r = rng(seed);
    g.save(); g.lineWidth = 1;
    for (let i = 0; i < w * h / 2400; i++) {
      const x = r() * w, y = r() * h, a = r() * Math.PI, l = 6 + r() * 16;
      g.strokeStyle = r() < .5 ? 'rgba(120,90,50,.07)' : 'rgba(255,255,255,.22)';
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * .5 + 3, y + Math.sin(a) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
    g.restore();
    grain(g, .07, w, h, 'multiply');
    const e = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .35, w / 2, h / 2, Math.max(w, h) * .72);
    e.addColorStop(0, 'rgba(0,0,0,0)'); e.addColorStop(1, 'rgba(110,70,20,.13)'); g.fillStyle = e; g.fillRect(0, 0, w, h);
  }
  const paperLayer = (col, w, h) => layer(`paper|${col}|${w}x${h}`, g => paperFill(g, hex6(col), w, h), w, h);
  // Fill the current path with paper (clipped)
  function paperIn(ctx, col, x, y, w, h) { ctx.save(); ctx.clip(); const p = paperLayer(col, Math.round(w), Math.round(h)); if (p && p.width) ctx.drawImage(p, x, y, w, h); else { ctx.fillStyle = col; ctx.fillRect(x, y, w, h); } ctx.restore(); }
  // A gilt corner: a bracket, a scroll that curls, leaves and a bead
  function filigree(ctx, th, x, y, s, sx, sy, a = 1) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(x, y); ctx.scale(sx * s / 100, sy * s / 100);
    const f = foil(ctx, th, 0, 0, 120, 120);
    ctx.strokeStyle = f; ctx.fillStyle = f; ctx.lineCap = 'round'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(0, 130); ctx.lineTo(0, 12); ctx.quadraticCurveTo(0, 0, 12, 0); ctx.lineTo(130, 0); ctx.stroke();
    ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(16, 104); ctx.bezierCurveTo(14, 40, 40, 14, 104, 16); ctx.stroke();
    const curl = (cx, cy, r, dir, a0) => { ctx.beginPath(); for (let k = 0; k <= 26; k++) { const t = k / 26 * Math.PI * 1.8, q = r * (1 - k / 34); ctx.lineTo(cx + Math.cos(a0 + t * dir) * q, cy + Math.sin(a0 + t * dir) * q); } ctx.stroke(); };
    curl(112, 28, 13, 1, Math.PI); curl(28, 112, 13, -1, -Math.PI / 2 + Math.PI * 1.5);
    const lf = (lx, ly, ang, L) => { ctx.save(); ctx.translate(lx, ly); ctx.rotate(ang); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(L * .5, -L * .38, L, 0); ctx.quadraticCurveTo(L * .5, L * .38, 0, 0); ctx.fill(); ctx.restore(); };
    lf(22, 22, Math.PI / 4, 40); lf(46, 26, -.15, 26); lf(26, 46, Math.PI / 2 + .15, 26); lf(70, 20, -.35, 18); lf(20, 70, Math.PI / 2 + .35, 18);
    ctx.beginPath(); ctx.arc(16, 16, 7, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(142, 0, 5, 0, Math.PI * 2); ctx.arc(0, 142, 5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function filigreeCorners(ctx, th, x, y, w, h, s, a = 1, inset = 0) {
    filigree(ctx, th, x + inset, y + inset, s, 1, 1, a); filigree(ctx, th, x + w - inset, y + inset, s, -1, 1, a);
    filigree(ctx, th, x + inset, y + h - inset, s, 1, -1, a); filigree(ctx, th, x + w - inset, y + h - inset, s, -1, -1, a);
  }
  // A carved gilt moulding around a rectangle (a frame, a signboard)
  function gilt(ctx, th, x, y, w, h, bw = 24, r = 8, shadow = true) {
    ctx.save();
    if (shadow) { ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18; }
    rr(ctx, x, y, w, h, r); ctx.fillStyle = th.gold[2]; ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.lineWidth = bw; ctx.strokeStyle = foil(ctx, th, x, y, x + w * .7, y + h); rr(ctx, x + bw / 2, y + bw / 2, w - bw, h - bw, Math.max(1, r - bw / 2)); ctx.stroke();
    ctx.lineWidth = 2; ctx.strokeStyle = rgba(hex6(th.gold[2]), .9); rr(ctx, x + bw * .42, y + bw * .42, w - bw * .84, h - bw * .84, r); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,248,220,.75)'; ctx.lineWidth = 1.6; rr(ctx, x + 2, y + 2, w - 4, h - 4, r); ctx.stroke();
    ctx.strokeStyle = 'rgba(40,20,0,.55)'; ctx.lineWidth = 2; rr(ctx, x + bw, y + bw, w - 2 * bw, h - 2 * bw, Math.max(1, r - bw)); ctx.stroke();
    // beading along the moulding
    ctx.fillStyle = th.gold[0]; ctx.globalAlpha *= .8;
    const step = 22, bx = x + bw * .7, by = y + bw * .7, bw2 = w - bw * 1.4, bh2 = h - bw * 1.4;
    for (let p = step; p < bw2 - 4; p += step) { ctx.beginPath(); ctx.arc(bx + p, by, 2.4, 0, Math.PI * 2); ctx.arc(bx + p, by + bh2, 2.4, 0, Math.PI * 2); ctx.fill(); }
    for (let p = step; p < bh2 - 4; p += step) { ctx.beginPath(); ctx.arc(bx, by + p, 2.4, 0, Math.PI * 2); ctx.arc(bx + bw2, by + p, 2.4, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }
  // Flower sprites: marigold, rose, jasmine and a leaf, shaded, drawn once
  function marigold(col) {
    return layer(`mg|${col}`, g => {
      const c = hex6(col), cx = 40, cy = 40;
      const b = g.createRadialGradient(cx - 6, cy - 8, 2, cx, cy, 36); b.addColorStop(0, shade(c, .35)); b.addColorStop(.6, c); b.addColorStop(1, shade(c, -.35));
      g.fillStyle = b; g.beginPath(); g.arc(cx, cy, 34, 0, Math.PI * 2); g.fill();
      for (let ring = 0; ring < 4; ring++) {
        const r = 32 - ring * 8, n = 16 - ring * 3;
        for (let i = 0; i < n; i++) {
          const a = i / n * Math.PI * 2 + ring * .4, x = cx + Math.cos(a) * r * .8, y = cy + Math.sin(a) * r * .8;
          g.fillStyle = i % 2 ? shade(c, .18 - ring * .02) : shade(c, -.12);
          g.beginPath(); g.ellipse(x, y, 7, 4.5, a, 0, Math.PI * 2); g.fill();
        }
      }
      g.fillStyle = shade(c, -.4); g.globalAlpha = .5; g.beginPath(); g.arc(cx, cy, 5, 0, Math.PI * 2); g.fill();
    }, 80, 80);
  }
  function rose(col) {
    return layer(`rose|${col}`, g => {
      const c = hex6(col), cx = 50, cy = 50;
      for (let ring = 0; ring < 4; ring++) {
        const n = [6, 5, 4, 3][ring], r = [44, 34, 24, 14][ring];
        for (let i = 0; i < n; i++) {
          const a = i / n * Math.PI * 2 + ring * .7;
          const pg = g.createRadialGradient(cx, cy, 2, cx + Math.cos(a) * r * .5, cy + Math.sin(a) * r * .5, r);
          pg.addColorStop(0, shade(c, -.25)); pg.addColorStop(.7, shade(c, .12 + ring * .05)); pg.addColorStop(1, shade(c, .35));
          g.fillStyle = pg; g.beginPath(); g.ellipse(cx + Math.cos(a) * r * .35, cy + Math.sin(a) * r * .35, r * .62, r * .48, a, 0, Math.PI * 2); g.fill();
          g.strokeStyle = shade(c, -.3); g.globalAlpha = .25; g.lineWidth = 1; g.stroke(); g.globalAlpha = 1;
        }
      }
      g.strokeStyle = shade(c, -.4); g.lineWidth = 2; g.beginPath(); for (let k = 0; k < 30; k++) { const t = k / 30 * Math.PI * 3, q = 2 + k * .3; g.lineTo(cx + Math.cos(t) * q, cy + Math.sin(t) * q); } g.stroke();
    }, 100, 100);
  }
  function leafSprite(col) {
    return layer(`leaf|${col}`, g => {
      const c = hex6(col), lg = g.createLinearGradient(0, 0, 0, 40); lg.addColorStop(0, shade(c, .25)); lg.addColorStop(1, shade(c, -.3));
      g.fillStyle = lg; g.beginPath(); g.moveTo(4, 20); g.quadraticCurveTo(40, -4, 96, 20); g.quadraticCurveTo(40, 44, 4, 20); g.fill();
      g.strokeStyle = shade(c, .4); g.globalAlpha = .6; g.lineWidth = 1.5; g.beginPath(); g.moveTo(6, 20); g.quadraticCurveTo(50, 18, 92, 20); g.stroke();
    }, 100, 40);
  }
  const sprite = (ctx, c, x, y, s, rot = 0, a = 1) => {
    if (!c || !c.width) return;
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); if (rot) ctx.rotate(rot);
    const iw = c.width / Math.max(SCALE, 1), ih = c.height / Math.max(SCALE, 1), k = s / Math.max(iw, ih);
    ctx.drawImage(c, -iw * k / 2, -ih * k / 2, iw * k, ih * k); ctx.restore();
  };
  const MARI = ['#ff9f1c', '#ffc93c', '#ff7b00', '#ffd23f'];
  // A marigold garland hanging between two points
  function garland(ctx, x0, y0, x1, y1, sag, s = 34, cols = MARI, leafCol = '#3f7a2a') {
    const n = Math.max(4, Math.round(Math.hypot(x1 - x0, y1 - y0) / (s * .62)));
    for (let i = 0; i <= n; i++) {
      const u = i / n, x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u + Math.sin(u * Math.PI) * sag;
      if (i % 4 === 2) sprite(ctx, leafSprite(leafCol), x, y + s * .35, s * 1.1, Math.PI / 2 + .4);
      sprite(ctx, marigold(cols[i % cols.length]), x, y, s);
    }
  }
  // A string of marigolds falling straight down (a ladi), ending in a tassel
  function ladi(ctx, x, y, len, s = 30, cols = MARI, sway = 0) {
    const n = Math.max(2, Math.round(len / (s * .7)));
    for (let i = 0; i <= n; i++) { const u = i / n; sprite(ctx, marigold(cols[(i + 1) % cols.length]), x + Math.sin(u * 2 + sway) * 3, y + u * len, s * (i % 3 === 2 ? .7 : 1)); }
    sprite(ctx, rose('#c2185b'), x, y + len + s * .7, s * .9);
  }
  // ---------- The art: couple illustrations and Ganesh ji (img/films-art, light WebP copies of img/couples/cut and img/art/cut) ----------
  const ART_LIB = {
    wedding: ['wedding-01', 'wedding-02', 'wedding-05', 'wedding-06', 'wedding-07', 'wedding-08', 'wedding-09', 'wedding-12', 'wedding-14', 'wedding-03', 'wedding-10', 'wedding-11'],
    engagement: ['engagement-01', 'engagement-02', 'engagement-03', 'roka-01', 'engagement-04', 'roka-02', 'engagement-05'],
    reception: ['reception-02', 'reception-03', 'reception-01', 'reception-04', 'reception-05'], sangeet: ['sangeet-01', 'sangeet-02', 'sangeet-03'],
    haldi: ['haldi-01', 'haldi-02', 'haldi-03', 'haldi-04'], mehendi: ['mehendi-01', 'mehendi-02', 'mehendi-03'], anniversary: ['anniversary-01'],
    babyshower: ['babyshower-01', 'babyshower-02'], kid: ['kid-01', 'kid-02'], family: ['family-01', 'family-02'],
    ganesha: ['ganesha-01', 'ganesha-06', 'ganesha-02', 'ganesha-07', 'ganesha-08', 'ganesha-09', 'ganesha-10', 'ganesha-11', 'ganesha-12']
  };
  const ART_OF = { wedding: 'wedding', engagement: 'engagement', reception: 'reception', sangeet: 'sangeet', haldi: 'haldi', mehendi: 'mehendi', anniversary: 'anniversary',
    birthday: 'kid', babyshower: 'babyshower', naming: 'kid', housewarming: 'family', puja: 'family' };
  const IMGS = {};
  function loadImg(src) {
    if (!HAS_DOM) return null;
    let a = IMGS[src];
    if (!a) {
      a = IMGS[src] = { img: new Image(), ok: false, bad: false, at: 0 };
      // decoded off the main thread before it counts as in, so the first frame that shows it never stalls
      a.done = new Promise(res => { a.img.onload = () => { Promise.resolve(a.img.decode ? a.img.decode() : 0).catch(() => {}).then(() => { a.ok = true; a.at = Date.now(); res(a); }); }; a.img.onerror = () => { a.bad = true; res(a); }; });
      a.img.decoding = 'async'; a.img.src = src;
    }
    return a;
  }
  // the picture, once it has arrived (it fades in over half a second if it came late)
  const ready = a => a && a.ok ? clamp((Date.now() - a.at) / 500) : 0;
  const artSrc = id => `img/films-art/${id}.webp`;
  function pickArt(kind, n) { const l = ART_LIB[kind] || ART_LIB.wedding; return l[((n % l.length) + l.length) % l.length]; }
  // A couple or Ganesh ji standing on the scene: a soft floor shadow, a halo of light behind, the figure
  function figure(ctx, id, cx, bottom, h, a = 1, o = {}) {
    const im = loadImg(artSrc(id)), k = ready(im) * clamp(a);
    if (k <= 0) return false;
    const w = h * im.img.naturalWidth / im.img.naturalHeight;
    ctx.save(); ctx.globalAlpha *= k;
    if (o.halo) { const g = ctx.createRadialGradient(cx, bottom - h * .55, 10, cx, bottom - h * .55, h * .62); g.addColorStop(0, o.halo); g.addColorStop(1, 'rgba(255,220,150,0)'); ctx.fillStyle = g; ctx.fillRect(cx - h, bottom - h * 1.2, h * 2, h * 1.3); }
    if (o.shadow !== false) { const s = ctx.createRadialGradient(cx, bottom - 6, 4, cx, bottom - 6, w * .55); s.addColorStop(0, 'rgba(0,0,0,.4)'); s.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = s; ctx.save(); ctx.translate(cx, bottom - 6); ctx.scale(1, .16); ctx.translate(-cx, -(bottom - 6)); ctx.beginPath(); ctx.arc(cx, bottom - 6, w * .55, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    if (o.flip) { ctx.translate(cx, 0); ctx.scale(-1, 1); ctx.translate(-cx, 0); }
    ctx.drawImage(im.img, cx - w / 2, bottom - h, w, h);
    ctx.restore();
    return true;
  }
  // The same figure as a toned print (sepia newspaper photo, duotone poster), made once from the picture's pixels
  function tonedArt(id, dark, light) {
    const im = loadImg(artSrc(id));
    if (!im || !im.ok) return null;
    return layer(`tone|${id}|${dark}|${light}`, g => {
      // toned at the size it is shown (a print is never more than ~1000 px tall on the 1920 frame)
      const k = Math.min(1, Math.ceil(1000 * Math.max(SCALE, .25)) / im.img.naturalHeight), w = Math.round(im.img.naturalWidth * k), h = Math.round(im.img.naturalHeight * k);
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(im.img, 0, 0, w, h);
      const d = x.getImageData(0, 0, w, h), p = d.data, A = parseInt(dark.slice(1), 16), B = parseInt(light.slice(1), 16);
      for (let i = 0; i < p.length; i += 4) {
        let l = (p[i] * .3 + p[i + 1] * .59 + p[i + 2] * .11) / 255; l = clamp((l - .5) * 1.25 + .55);
        p[i] = ((A >> 16) & 255) * (1 - l) + ((B >> 16) & 255) * l; p[i + 1] = ((A >> 8) & 255) * (1 - l) + ((B >> 8) & 255) * l; p[i + 2] = (A & 255) * (1 - l) + (B & 255) * l;
      }
      x.putImageData(d, 0, 0); g.drawImage(c, 0, 0, im.img.naturalWidth, im.img.naturalHeight);
    }, im.img.naturalWidth, im.img.naturalHeight);
  }
  // ---------- AI scenes (optional): the pictures listed in js/scenes.js (SCENE_ART), see the note at the top ----------
  const SCENE_FNS = ['ganesh', 'invite', 'haldi', 'mehendi', 'sangeet', 'baraat', 'wedding', 'reception', 'vidai', 'family', 'thanks'];
  let SCENE_LIST = null, sceneListP = null;
  function sceneList() {
    if (SCENE_LIST) return SCENE_LIST;
    if (typeof SCENE_ART !== 'undefined' && Array.isArray(SCENE_ART)) return (SCENE_LIST = SCENE_ART.filter(f => typeof f === 'string'));
    if (!HAS_DOM) return [];
    if (!sceneListP) { // the page did not load the list: fetch it once (it is tiny, and names only files that exist)
      const had = document.querySelector('script[src$="scenes.js"]');
      if (had) sceneListP = new Promise(r => { had.addEventListener('load', r); had.addEventListener('error', r); setTimeout(r, 4000); });
      else {
        const tag = document.createElement('script'); tag.src = 'js/scenes.js'; tag.dataset.filmScenes = '1';
        sceneListP = new Promise(r => { tag.onload = tag.onerror = r; setTimeout(r, 4000); });
        document.head.appendChild(tag);
      }
    }
    return [];
  }
  // a function's pictures: <function>-NN.(jpg|jpeg|png|webp); invite and thanks may also use couple-NN (a full-scene couple)
  function scenePics(fn) {
    if (!SCENE_FNS.includes(fn)) return [];
    const re = f => new RegExp('^' + f + '-[0-9]+[.](jpe?g|png|webp)$', 'i'), list = sceneList();
    const own = list.filter(f => re(fn).test(f)), extra = fn === 'invite' || fn === 'thanks' ? list.filter(f => re('couple').test(f)) : [];
    return own.concat(extra).sort();
  }
  function aiScene(fn, n) {
    const pics = scenePics(fn);
    for (let i = 0; i < pics.length; i++) { const a = loadImg(`img/scenes/${pics[(n + i) % pics.length]}`); if (a && a.ok) return a; if (a && !a.bad) return null; }
    return null;
  }
  const FN_OF_ICON = { diya: 'ganesh', bell: 'ganesh', pot: 'haldi', leaf: 'mehendi', note: 'sangeet', drum: 'baraat', arch: 'baraat', ring: 'wedding', glass: 'reception', dish: 'reception', cake: 'family', balloon: 'family' };
  function sceneFn(film, D, sc) {
    if (sc.k === 'open') return D.sacred ? 'ganesh' : 'invite';
    if (sc.k === 'day') { const e = sc.day.events[0] || {}; return /phere|फेरे|mandap|vivah|विवाह|wedding|jaimala/i.test(e.name || '') ? 'wedding' : /vidai|विदाई/i.test(e.name || '') ? 'vidai' : FN_OF_ICON[e.icon] || 'invite'; }
    if (sc.k === 'venue') return film.occ === 'wedding' ? 'wedding' : film.occ === 'reception' ? 'reception' : 'invite';
    if (['regards', 'kids', 'note'].includes(sc.k)) return 'family';
    if (sc.k === 'finale') return 'thanks';
    return 'invite';
  }
  // The AI picture full-bleed (cover), drifting slowly (Ken Burns), under a scrim so the words stay readable
  function drawAi(ctx, a, th, lt, d, seed) {
    const k = ready(a); if (k <= 0) return false;
    const iw = a.img.naturalWidth || 1, ih = a.img.naturalHeight || 1;
    // a cover-fit copy at the player's size, made once: a big photo stays sharp but light to redraw
    const L = layer(`ai|${a.img.src}`, g => { const s = Math.max(W * 1.1 / iw, H * 1.1 / ih); g.drawImage(a.img, W * .55 - iw * s / 2, H * .55 - ih * s / 2, iw * s, ih * s); }, Math.round(W * 1.1), Math.round(H * 1.1));
    const z = 1 + .06 * clamp(lt / d), dx = (hash(seed) - .5) * 50 * clamp(lt / d), w = W * 1.1 * z, h = H * 1.1 * z;
    ctx.save(); ctx.globalAlpha *= k;
    if (L) ctx.drawImage(L, W / 2 - w / 2 + dx, H / 2 - h / 2, w, h);
    const g = ctx.createLinearGradient(0, 0, 0, H), c = th.dark ? '0,0,0' : '255,250,240';
    g.addColorStop(0, `rgba(${c},.5)`); g.addColorStop(.3, `rgba(${c},.2)`); g.addColorStop(.7, `rgba(${c},.2)`); g.addColorStop(1, `rgba(${c},.55)`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
    return k >= 1;
  }
  // ---------- Painted stages: one per function, full-bleed behind the words ----------
  function multifoil(g, x, y, w, h) {
    // a cusped Mughal arch: lobes along the curve, then the pillars down
    const cx = x + w / 2, spring = y + w * .55;
    g.beginPath(); g.moveTo(x, y + h); g.lineTo(x, spring);
    const N = 7, pts = [];
    for (let i = 0; i <= N; i++) { const t = i / N, a = Math.PI + t * Math.PI; pts.push([cx + Math.cos(a) * w / 2, spring + Math.sin(a) * (spring - y) * (1 + .12 * Math.sin(t * Math.PI))]); }
    for (let i = 1; i <= N; i++) { const [px, py] = pts[i - 1], [qx, qy] = pts[i], mx = (px + qx) / 2, my = (py + qy) / 2, nx = mx - cx, ny = my - spring, l = Math.hypot(nx, ny) || 1; g.quadraticCurveTo(mx - nx / l * 26, my - ny / l * 26, qx, qy); }
    g.lineTo(x + w, y + h); g.closePath();
  }
  function pillar(g, x, y, w, h, col, gold) {
    const pg = g.createLinearGradient(x, 0, x + w, 0); pg.addColorStop(0, shade(col, -.35)); pg.addColorStop(.35, shade(col, .2)); pg.addColorStop(.6, col); pg.addColorStop(1, shade(col, -.45));
    g.fillStyle = pg; g.fillRect(x, y, w, h);
    g.fillStyle = gold; [y, y + 30, y + h - 46].forEach(yy => g.fillRect(x - 10, yy, w + 20, 16));
    g.fillRect(x - 16, y + h - 20, w + 32, 20);
    g.globalAlpha = .35; g.fillStyle = shade(col, -.5); for (let i = 1; i < 4; i++) g.fillRect(x + i * w / 4 - 1, y + 50, 2, h - 110); g.globalAlpha = 1;
  }
  function floorPersp(g, c0, c1, y0, gold) {
    const f = g.createLinearGradient(0, y0, 0, H); f.addColorStop(0, c0); f.addColorStop(1, c1); g.fillStyle = f; g.fillRect(0, y0, W, H - y0);
    g.save(); g.strokeStyle = gold; g.globalAlpha = .18; g.lineWidth = 2;
    for (let i = -12; i <= 12; i++) { g.beginPath(); g.moveTo(W / 2 + i * 30, y0); g.lineTo(W / 2 + i * 260, H); g.stroke(); }
    for (let k = 1; k < 9; k++) { const yy = y0 + (H - y0) * Math.pow(k / 9, 1.7); g.beginPath(); g.moveTo(0, yy); g.lineTo(W, yy); g.stroke(); }
    g.restore();
  }
  function drape(g, x0, x1, y, depth, col) {
    const fg = g.createLinearGradient(0, y, 0, y + depth); fg.addColorStop(0, shade(col, -.3)); fg.addColorStop(.6, col); fg.addColorStop(1, shade(col, -.25));
    g.fillStyle = fg; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.quadraticCurveTo((x0 + x1) / 2, y + depth * 2, x0, y); g.fill();
    g.save(); g.strokeStyle = shade(col, .35); g.globalAlpha = .35; g.lineWidth = 3;
    for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(x0 + 8, y + i * 6); g.quadraticCurveTo((x0 + x1) / 2, y + depth * 2 * (i / 4.2), x1 - 8, y + i * 6); g.stroke(); }
    g.restore();
  }
  function sideCurtain(g, x, w, col, flip) {
    for (let f = 0; f < 6; f++) {
      const fx = x + (flip ? -1 : 1) * f * w / 6, cg = g.createLinearGradient(fx, 0, fx + (flip ? -1 : 1) * w / 6, 0);
      cg.addColorStop(0, shade(col, -.45)); cg.addColorStop(.5, shade(col, .12)); cg.addColorStop(1, shade(col, -.45));
      g.fillStyle = cg; g.beginPath(); g.moveTo(fx, 0); g.lineTo(fx + (flip ? -1 : 1) * w / 6, 0);
      g.quadraticCurveTo(fx + (flip ? -1 : 1) * w / 6 * (1 - f / 6) * .3, H * .5, fx + (flip ? -1 : 1) * (w / 6) * .4, H); g.lineTo(fx, H); g.closePath(); g.fill();
    }
  }
  function fairy(g, n, col, y0, y1, seed) {
    const r = rng(seed);
    for (let i = 0; i < n; i++) {
      const x = r() * W, y = y0 + r() * (y1 - y0), s = 3 + r() * 5;
      const gl = g.createRadialGradient(x, y, 0, x, y, s * 5); gl.addColorStop(0, col); gl.addColorStop(1, 'rgba(255,220,150,0)');
      g.globalAlpha = .55 + r() * .45; g.fillStyle = gl; g.fillRect(x - s * 5, y - s * 5, s * 10, s * 10);
      g.fillStyle = '#fff8e0'; g.beginPath(); g.arc(x, y, s * .6, 0, Math.PI * 2); g.fill();
    }
    g.globalAlpha = 1;
  }
  function lightStrands(g, n, col, seed) {
    const r = rng(seed);
    for (let i = 0; i < n; i++) {
      const x = 30 + i * (W - 60) / (n - 1), len = 400 + r() * 700;
      g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, len); g.stroke();
      for (let y = 20 + r() * 30; y < len; y += 46) { const gl = g.createRadialGradient(x, y, 0, x, y, 16); gl.addColorStop(0, col); gl.addColorStop(1, 'rgba(255,220,150,0)'); g.fillStyle = gl; g.fillRect(x - 16, y - 16, 32, 32); g.fillStyle = '#fffbe8'; g.beginPath(); g.arc(x, y, 2.6, 0, Math.PI * 2); g.fill(); }
    }
  }
  function chandelier(g, x, y, s, gold) {
    g.save(); g.translate(x, y); g.scale(s, s);
    g.strokeStyle = gold; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -400); g.lineTo(0, 0); g.stroke();
    const glow = g.createRadialGradient(0, 40, 4, 0, 40, 220); glow.addColorStop(0, 'rgba(255,240,200,.55)'); glow.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = glow; g.fillRect(-230, -180, 460, 460);
    for (let tier = 0; tier < 3; tier++) {
      const r = 120 - tier * 32, yy = 20 + tier * 48;
      g.beginPath(); g.ellipse(0, yy, r, r * .22, 0, 0, Math.PI * 2); g.stroke();
      for (let i = 0; i < 14 - tier * 3; i++) { const a = i / (14 - tier * 3) * Math.PI * 2, px = Math.cos(a) * r, py = yy + Math.sin(a) * r * .22; g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.moveTo(px, py); g.lineTo(px - 4, py + 18); g.lineTo(px, py + 32); g.lineTo(px + 4, py + 18); g.closePath(); g.fill(); g.fillStyle = '#fff6d0'; g.beginPath(); g.arc(px, py - 6, 3.5, 0, Math.PI * 2); g.fill(); }
    }
    g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.moveTo(0, 150); g.lineTo(-10, 180); g.lineTo(0, 220); g.lineTo(10, 180); g.closePath(); g.fill();
    g.restore();
  }
  function bush(g, x, y, s, cols, leafCol, seed) {
    const r = rng(seed);
    for (let i = 0; i < 26; i++) { const a = r() * Math.PI * 2, d = r() * s; sprite(g, leafSprite(leafCol), x + Math.cos(a) * d * 1.1, y + Math.sin(a) * d * .6, s * .5, a); }
    for (let i = 0; i < 22; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * s; sprite(g, rose(cols[i % cols.length]), x + Math.cos(a) * d, y + Math.sin(a) * d * .55, s * (.34 + r() * .18), r() * 6); }
  }
  function urli(g, x, y, s, gold) {
    const b = g.createLinearGradient(x - s, y, x + s, y); b.addColorStop(0, shade(gold, -.4)); b.addColorStop(.4, shade(gold, .3)); b.addColorStop(1, shade(gold, -.45));
    g.fillStyle = b; g.beginPath(); g.ellipse(x, y, s, s * .22, 0, 0, Math.PI); g.lineTo(x - s, y); g.fill();
    g.beginPath(); g.ellipse(x, y, s, s * .2, 0, 0, Math.PI * 2); g.fillStyle = shade(gold, -.2); g.fill();
    for (let i = 0; i < 12; i++) sprite(g, marigold(MARI[i % 4]), x + (hash(i + s) - .5) * s * 1.5, y + (hash(i * 3 + s) - .5) * s * .25, s * .26);
  }
  function brassDiyas(g, n, y, spread, gold) {
    for (let i = 0; i < n; i++) {
      const x = W / 2 + (i - (n - 1) / 2) * spread;
      const gl = g.createRadialGradient(x, y - 30, 2, x, y - 30, 90); gl.addColorStop(0, 'rgba(255,190,80,.55)'); gl.addColorStop(1, 'rgba(255,160,40,0)'); g.fillStyle = gl; g.fillRect(x - 90, y - 120, 180, 180);
      const b = g.createLinearGradient(x - 30, y, x + 30, y); b.addColorStop(0, shade(gold, -.4)); b.addColorStop(.5, shade(gold, .3)); b.addColorStop(1, shade(gold, -.4));
      g.fillStyle = b; g.beginPath(); g.ellipse(x, y, 32, 13, 0, 0, Math.PI); g.lineTo(x - 32, y); g.fill();
      const fl = g.createRadialGradient(x, y - 20, 1, x, y - 20, 22); fl.addColorStop(0, '#fffbd0'); fl.addColorStop(.5, '#ffb22e'); fl.addColorStop(1, 'rgba(255,90,0,0)');
      g.fillStyle = fl; g.beginPath(); g.moveTo(x, y - 50); g.quadraticCurveTo(x + 13, y - 18, x, y - 4); g.quadraticCurveTo(x - 13, y - 18, x, y - 50); g.fill();
    }
  }
  function fireworks(g, seed) {
    const r = rng(seed), cols = ['#ffd36b', '#ff7aa8', '#8fe3ff', '#ffffff', '#ffb347'];
    for (let b = 0; b < 6; b++) {
      const x = 120 + r() * (W - 240), y = 160 + r() * 520, R = 70 + r() * 110, c = cols[b % cols.length];
      for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2, l = R * (.75 + r() * .3); const lg = g.createLinearGradient(x, y, x + Math.cos(a) * l, y + Math.sin(a) * l); lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(1, c); g.strokeStyle = lg; g.lineWidth = 2.2; g.beginPath(); g.moveTo(x + Math.cos(a) * l * .25, y + Math.sin(a) * l * .25); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); g.fillStyle = c; g.beginPath(); g.arc(x + Math.cos(a) * l, y + Math.sin(a) * l, 2.6, 0, Math.PI * 2); g.fill(); }
    }
  }
  function palaceSkyline(g, y, col, lights) {
    g.fillStyle = col; g.beginPath(); g.moveTo(0, H);
    const parts = [[0, 120], [90, 200], [170, 150], [260, 260], [400, 330], [540, 420], [680, 330], [820, 260], [910, 150], [990, 200], [1080, 120]];
    parts.forEach(([x, hh]) => { g.lineTo(x, y - hh); });
    g.lineTo(W, H); g.closePath(); g.fill();
    // domes and chhatris
    [[540, 420, 90], [400, 330, 60], [680, 330, 60], [260, 260, 40], [820, 260, 40]].forEach(([x, hh, r]) => { g.beginPath(); g.ellipse(x, y - hh, r, r * 1.1, 0, Math.PI, 0); g.fill(); g.fillRect(x - 3, y - hh - r * 1.1 - 40, 6, 44); });
    if (lights) { g.fillStyle = lights; for (let i = 0; i < 160; i++) { const x = hash(i) * W, yy = y - hash(i + 40) * 300; g.globalAlpha = .5 + hash(i + 9) * .5; g.fillRect(x, yy, 3, 3); } g.globalAlpha = 1; }
  }
  // kind: ganesh, haldi, mehendi, sangeet, baraat, wedding, reception, family, invite, thanks, vidai
  function stage(kind, th) {
    return layer(`stage|${kind}|${thKey(th)}`, g => {
      const gold = hex6(th.gold[1]), acc = hex6(th.accent);
      if (kind === 'haldi') {
        const s = g.createLinearGradient(0, 0, 0, H); s.addColorStop(0, '#fff6c8'); s.addColorStop(.55, '#ffd25a'); s.addColorStop(1, '#f0a020'); g.fillStyle = s; g.fillRect(0, 0, W, H);
        g.save(); g.globalAlpha = .9; multifoil(g, 160, 260, W - 320, 1300); const ag = g.createRadialGradient(W / 2, 900, 40, W / 2, 900, 700); ag.addColorStop(0, '#fffbe6'); ag.addColorStop(1, '#ffcf4d'); g.fillStyle = ag; g.fill(); g.restore();
        for (let i = 0; i < 14; i++) ladi(g, 40 + i * 77, 0, 520 + (i % 2) * 160 + Math.sin(i * 1.7) * 90, 34);
        pillar(g, 60, 600, 70, 1000, '#f6e2a8', gold); pillar(g, W - 130, 600, 70, 1000, '#f6e2a8', gold);
        floorPersp(g, '#f3b23a', '#c9761a', 1500, '#fff0c0');
        urli(g, 230, 1640, 110, gold); urli(g, W - 230, 1660, 120, gold);
        for (let i = 0; i < 70; i++) sprite(g, marigold(MARI[i % 4]), hash(i) * W, 1520 + hash(i + 7) * 380, 18 + hash(i + 3) * 14);
      } else if (kind === 'mehendi') {
        const s = g.createLinearGradient(0, 0, 0, H); s.addColorStop(0, '#1f5a34'); s.addColorStop(.6, '#2f7a3e'); s.addColorStop(1, '#173f22'); g.fillStyle = s; g.fillRect(0, 0, W, H);
        damask(g, '#9fd38a', .09);
        g.save(); multifoil(g, 150, 300, W - 300, 1250); g.fillStyle = '#fbe6ee'; g.fill(); g.clip(); damask(g, '#e98fb0', .22); g.restore();
        g.save(); g.lineWidth = 34; g.strokeStyle = '#2a6a3a'; multifoil(g, 150, 300, W - 300, 1250); g.stroke(); g.restore();
        const fl = ['#ff5c8a', '#ff9f1c', '#ffd23f', '#e8467c', '#ffffff'];
        for (let i = 0; i < 46; i++) { const t = i / 45, a = Math.PI + t * Math.PI, x = W / 2 + Math.cos(a) * (W - 300) / 2, y = 300 + (W - 300) * .55 + Math.sin(a) * (W - 300) * .55; sprite(g, i % 3 ? rose(fl[i % 5]) : marigold(MARI[i % 4]), x, y, 54, i); }
        for (let y = 900; y < 1560; y += 50) { sprite(g, rose(fl[(y / 50) % 5 | 0]), 150, y, 50, y); sprite(g, rose(fl[(y / 50 + 2) % 5 | 0]), W - 150, y, 50, y); }
        floorPersp(g, '#e9c9a0', '#b98a5a', 1480, '#fff');
        const cols = ['#e8467c', '#ff9f1c', '#7b2fbf', '#1fa37a', '#ffd23f', '#e8467c'];
        cols.forEach((c, i) => { const x = 110 + i * 172, cg = g.createRadialGradient(x - 20, 1560, 5, x, 1580, 90); cg.addColorStop(0, shade(c, .35)); cg.addColorStop(1, shade(c, -.35)); g.fillStyle = cg; rr(g, x - 80, 1520, 160, 110, 40); g.fill(); g.strokeStyle = '#ffd36b'; g.lineWidth = 4; g.stroke(); });
      } else if (kind === 'sangeet') {
        const s = g.createLinearGradient(0, 0, 0, H); s.addColorStop(0, '#12062a'); s.addColorStop(.6, '#3a0f5a'); s.addColorStop(1, '#1a0526'); g.fillStyle = s; g.fillRect(0, 0, W, H);
        lightStrands(g, 22, 'rgba(255,215,140,.9)', 4);
        [[-1, '#ff4fd8'], [1, '#4fd8ff'], [0, '#ffd36b']].forEach(([sd, c]) => { g.save(); g.translate(W / 2 + sd * 420, -20); g.rotate(-sd * .32); const b = g.createLinearGradient(0, 0, 0, H * 1.1); b.addColorStop(0, rgba(c, .5)); b.addColorStop(1, rgba(c, 0)); g.fillStyle = b; g.beginPath(); g.moveTo(-20, 0); g.lineTo(-260, H * 1.1); g.lineTo(260, H * 1.1); g.lineTo(20, 0); g.fill(); g.restore(); });
        drape(g, 0, W / 2, 0, 120, '#7a1f6a'); drape(g, W / 2, W, 0, 120, '#7a1f6a');
        floorPersp(g, '#2a0a3a', '#0a0210', 1450, '#ff9be8');
        const st = g.createRadialGradient(W / 2, 1560, 20, W / 2, 1560, 500); st.addColorStop(0, 'rgba(255,200,255,.35)'); st.addColorStop(1, 'rgba(255,200,255,0)'); g.fillStyle = st; g.fillRect(0, 1200, W, 720);
      } else if (kind === 'baraat') {
        const s = g.createLinearGradient(0, 0, 0, H); s.addColorStop(0, '#060b2a'); s.addColorStop(.55, '#1c2a6a'); s.addColorStop(1, '#3a1a3a'); g.fillStyle = s; g.fillRect(0, 0, W, H);
        fireworks(g, 11);
        palaceSkyline(g, 1420, '#120a1e', '#ffd36b');
        floorPersp(g, '#3a1a2a', '#140610', 1420, '#ffb347');
        garland(g, -20, 60, W / 2, 60, 140, 40); garland(g, W / 2, 60, W + 20, 60, 140, 40);
        for (let i = 0; i < 9; i++) ladi(g, 60 + i * 120, 40, 160 + (i % 2) * 80, 30);
        fairy(g, 50, 'rgba(255,200,110,.9)', 1450, 1900, 5);
      } else if (kind === 'reception' || kind === 'thanks') {
        const s = g.createLinearGradient(0, 0, 0, H); s.addColorStop(0, '#0b1636'); s.addColorStop(.6, '#1a2850'); s.addColorStop(1, '#0a1024'); g.fillStyle = s; g.fillRect(0, 0, W, H);
        for (let i = 0; i < 3; i++) { const x = -150 + i * 460, w = 400; g.save(); multifoil(g, x, 380, w, 1100); const ag = g.createLinearGradient(0, 380, 0, 1480); ag.addColorStop(0, '#2c3f78'); ag.addColorStop(1, '#5a6fa8'); g.fillStyle = ag; g.fill(); g.lineWidth = 10; g.strokeStyle = gold; g.stroke(); g.restore(); }
        fairy(g, 70, 'rgba(255,230,180,.9)', 400, 1400, 8);
        chandelier(g, 230, 300, .8, gold); chandelier(g, W - 230, 300, .8, gold); chandelier(g, W / 2, 200, 1, gold);
        floorPersp(g, '#e9ecf4', '#8a94b0', 1480, '#ffffff');
        bush(g, 90, 1520, 170, ['#ffffff', '#fbe9ef', '#fff6e6'], '#2f5a3a', 3); bush(g, W - 90, 1520, 170, ['#ffffff', '#fbe9ef', '#fff6e6'], '#2f5a3a', 4);
      } else if (kind === 'wedding' || kind === 'vidai') {
        const s = g.createLinearGradient(0, 0, 0, H); s.addColorStop(0, '#5a0a14'); s.addColorStop(.6, '#8a1a1e'); s.addColorStop(1, '#3a0408'); g.fillStyle = s; g.fillRect(0, 0, W, H);
        damask(g, '#ffb347', .07);
        // the mandap: a dome canopy on four pillars
        g.save(); g.fillStyle = foil(g, th, 140, 260, 940, 520); g.beginPath(); g.moveTo(110, 560); g.quadraticCurveTo(W / 2, 140, W - 110, 560); g.closePath(); g.fill(); g.restore();
        g.fillStyle = '#fff3d6'; g.beginPath(); g.moveTo(150, 560); g.quadraticCurveTo(W / 2, 210, W - 150, 560); g.closePath(); g.globalAlpha = .25; g.fill(); g.globalAlpha = 1;
        pillar(g, 130, 560, 64, 1000, '#f3dfb0', gold); pillar(g, W - 194, 560, 64, 1000, '#f3dfb0', gold);
        drape(g, 110, W - 110, 560, 120, '#c2182e');
        for (let i = 0; i < 9; i++) ladi(g, 170 + i * 92, 560, 220 + (i % 2) * 120, 28);
        const fire = g.createRadialGradient(W / 2, 1500, 10, W / 2, 1500, 480); fire.addColorStop(0, 'rgba(255,170,60,.6)'); fire.addColorStop(1, 'rgba(255,120,30,0)'); g.fillStyle = fire; g.fillRect(0, 1000, W, 920);
        floorPersp(g, '#7a1a14', '#2a0604', 1540, '#ffcf6b');
        for (let i = 0; i < 60; i++) sprite(g, i % 3 ? rose('#d81b3c') : marigold(MARI[i % 4]), hash(i + 5) * W, 1560 + hash(i + 17) * 340, 20 + hash(i) * 14, i);
      } else if (kind === 'ganesh') {
        const s = g.createLinearGradient(0, 0, 0, H); s.addColorStop(0, '#3a0a04'); s.addColorStop(.5, '#7a2a08'); s.addColorStop(1, '#2a0602'); g.fillStyle = s; g.fillRect(0, 0, W, H);
        damask(g, '#ffcf6b', .07);
        g.save(); multifoil(g, 170, 340, W - 340, 1240); const ag = g.createRadialGradient(W / 2, 1000, 30, W / 2, 1000, 760); ag.addColorStop(0, '#ffe6a8'); ag.addColorStop(.6, '#e89a3a'); ag.addColorStop(1, '#8a3a0c'); g.fillStyle = ag; g.fill(); g.lineWidth = 26; g.strokeStyle = foil(g, th, 170, 340, W - 170, 1580); g.stroke(); g.restore();
        garland(g, -20, 70, W / 2, 70, 160, 40); garland(g, W / 2, 70, W + 20, 70, 160, 40);
        for (let i = 0; i < 10; i++) ladi(g, 50 + i * 109, 50, 200 + (i % 3) * 90, 30);
        floorPersp(g, '#5a1a06', '#200602', 1560, '#ffcf6b');
        brassDiyas(g, 7, 1660, 150, gold);
      } else if (kind === 'family') {
        const s = g.createLinearGradient(0, 0, 0, H); s.addColorStop(0, '#fbeedd'); s.addColorStop(1, '#e9c9a0'); g.fillStyle = s; g.fillRect(0, 0, W, H);
        damask(g, '#c08a4a', .08);
        g.save(); multifoil(g, 130, 300, W - 260, 1300); g.fillStyle = '#fff8ec'; g.fill(); g.lineWidth = 18; g.strokeStyle = foil(g, th, 0, 300, W, 1600); g.stroke(); g.restore();
        garland(g, -20, 60, W / 2, 60, 120, 36); garland(g, W / 2, 60, W + 20, 60, 120, 36);
        floorPersp(g, '#e2b884', '#a8743e', 1560, '#fff');
        bush(g, 70, 1560, 150, ['#f48fb1', '#ffffff', '#ffb74d'], '#4a7a3a', 9); bush(g, W - 70, 1560, 150, ['#f48fb1', '#ffffff', '#ffb74d'], '#4a7a3a', 10);
      } else {
        // invite: an ivory palace hall of arches, pink and white flowers
        const s = g.createLinearGradient(0, 0, 0, H); s.addColorStop(0, '#f7f1ea'); s.addColorStop(1, '#e6d6c4'); g.fillStyle = s; g.fillRect(0, 0, W, H);
        for (let i = 0; i < 3; i++) { const x = -170 + i * 470, w = 400; g.save(); multifoil(g, x, 330, w, 1200); const ag = g.createLinearGradient(0, 330, 0, 1530); ag.addColorStop(0, '#fffdf8'); ag.addColorStop(1, '#efe3d2'); g.fillStyle = ag; g.fill(); g.lineWidth = 12; g.strokeStyle = foil(g, th, x, 330, x + w, 1530); g.stroke(); g.restore(); }
        pillar(g, 230, 560, 50, 1000, '#fbf6ee', gold); pillar(g, W - 280, 560, 50, 1000, '#fbf6ee', gold);
        floorPersp(g, '#f3ece2', '#cdbba6', 1530, '#b48a4a');
        bush(g, 60, 1560, 170, ['#f8bbd0', '#ffffff', '#f48fb1'], '#5a7a4a', 1); bush(g, W - 60, 1560, 170, ['#f8bbd0', '#ffffff', '#f48fb1'], '#5a7a4a', 2);
        for (let i = 0; i < 60; i++) sprite(g, rose(i % 2 ? '#f8bbd0' : '#ffffff'), hash(i + 2) * W, 1600 + hash(i + 33) * 300, 14 + hash(i) * 10, i);
      }
      grain(g, .07);
      const v = g.createRadialGradient(W / 2, H * .45, H * .3, W / 2, H * .5, H * .8); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.42)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
    });
  }
  const STAGE_TONE = { haldi: false, mehendi: true, sangeet: true, baraat: true, reception: true, thanks: true, wedding: true, vidai: true, ganesh: true, family: false, invite: false };
  // Falling petals and gold dust, drawn live over a stage
  function petals(ctx, t, n = 22, cols = ['#ff8fa3', '#ffb347', '#ffd23f', '#e8467c']) {
    ctx.save();
    for (let i = 0; i < n; i++) {
      const r1 = hash(i + 300), r2 = hash(i + 350), r3 = hash(i + 399);
      const y = ((r2 * H + t * (70 + r3 * 70)) % (H + 80)) - 40, x = r1 * W + Math.sin(t * .9 + i) * 50, rot = t * (r3 - .5) * 3 + i;
      ctx.globalAlpha = .85; ctx.fillStyle = cols[i % cols.length];
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(1, .55 + .45 * Math.sin(t * 2 + i));
      ctx.beginPath(); ctx.moveTo(0, -12); ctx.quadraticCurveTo(10, -4, 0, 12); ctx.quadraticCurveTo(-10, -4, 0, -12); ctx.fill(); ctx.restore();
    }
    ctx.restore();
  }

  // ---------- Backgrounds ----------
  function background(ctx, th, t, tint) {
    const [c0, c1] = tint ? [tint, shade(tint, -.6)] : th.bg, dk = th.dark || tint;
    // woven silk with a buta damask (dark palettes) or a printed paper (light ones), painted once
    const L = layer(`bg|${thKey(th)}|${tint || ''}`, g => {
      silkBg(g, c0, c1, dk ? th.gold[1] : th.gold[2], dk ? .05 : .07, W, H, !dk);
      // a warm light from above, like a lamp over a table
      const top = g.createRadialGradient(W / 2, -120, 20, W / 2, -120, H * .7); top.addColorStop(0, dk ? 'rgba(255,220,160,.12)' : 'rgba(255,255,255,.5)'); top.addColorStop(1, 'rgba(255,220,160,0)');
      g.fillStyle = top; g.fillRect(0, 0, W, H);
    });
    if (L) put(ctx, L);
    else { const g = ctx.createRadialGradient(W / 2, H * .42, 60, W / 2, H * .5, H * .75); g.addColorStop(0, c0); g.addColorStop(1, c1); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
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
    // a gilt rule: a broad band of brushed foil with a fine line inside it
    const f = film.frame;
    rr(ctx, x, y, w, h, 10); ctx.lineWidth = 8; ctx.strokeStyle = foil(ctx, th, x, y, x + w * .6, y + h); ctx.stroke();
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,248,220,.45)'; ctx.stroke();
    rr(ctx, x + 18, y + 18, w - 36, h - 36, 6); stroke(ctx, th.dark ? th.gold[2] : th.gold[1], 2);
    if (f === 'arch' || f === 'lotus' || f === 'deco') filigreeCorners(ctx, th, x, y, w, h, 110, k, 28);
    else if (f === 'lattice') filigreeCorners(ctx, th, x, y, w, h, 100, k, 58);
    else if (f === 'toran') { filigree(ctx, th, x + 40, y + h - 28, 100, 1, -1, k); filigree(ctx, th, x + w - 40, y + h - 28, 100, -1, -1, k); }
    const MB = (bx, by, r, c) => HAS_DOM ? sprite(ctx, marigold(c), bx, by, r * 2.7) : bead(ctx, bx, by, r, c);
    if (f === 'toran') {
      // a marigold toran: five swags, short strings with brass bells, two long strings down the sides
      const swags = 5, sw = (w - 20) / swags;
      for (let i = 0; i < swags; i++) {
        const x0 = x + 10 + i * sw;
        for (let j = 0; j <= 13; j++) { const u = j / 13; if (u > k * 1.2) break; const bx = x0 + u * sw, by = y + 24 + Math.sin(u * Math.PI) * 62; if (j === 6 && HAS_DOM) sprite(ctx, leafSprite('#3f7a2a'), bx, by + 22, 38, Math.PI / 2); MB(bx, by, 13, j % 2 ? '#ff8a1c' : '#ffc23a'); }
        const hx = x + 10 + i * sw;
        if (i) { for (let j = 0; j < 4; j++) MB(hx, y + 40 + j * 24, 11, j % 2 ? '#ff8a1c' : '#ffc23a'); bell(ctx, th, hx, y + 130); }
      }
      [x + 14, x + w - 14].forEach(sx => { for (let j = 0; j < 22 * k; j++) MB(sx, y + 40 + j * 24, 11, j % 2 ? '#ff8a1c' : '#ffc23a'); bell(ctx, th, sx, y + 40 + 22 * 24); });
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
    ctx.fillStyle = th.paper; ctx.fill();
    ctx.shadowColor = 'transparent';
    // handmade paper, a deckle of foil round the edge
    if (/^#[0-9a-f]{6}$/i.test(th.paper)) paperIn(ctx, th.paper, x, y, w, h);
    ctx.lineWidth = 7; ctx.strokeStyle = foil(ctx, th, x, y, x + w, y + h); ctx.stroke();
    // inner rule and gilt corners
    ctx.save(); ctx.clip();
    ctx.beginPath();
    if (film.frame === 'arch') { const i = 22; ctx.moveTo(x + i, y + h - i); ctx.lineTo(x + i, y + 228); ctx.quadraticCurveTo(x + i, y + 40, x + w / 2, y + i + 4); ctx.quadraticCurveTo(x + w - i, y + 40, x + w - i, y + 228); ctx.lineTo(x + w - i, y + h - i); ctx.closePath(); }
    else rr(ctx, x + 22, y + 22, w - 44, h - 44, 14);
    stroke(ctx, th.gold[1], 1.6);
    ctx.strokeStyle = th.gold[1]; ctx.lineWidth = 2;
    const cs = film.frame === 'arch' ? [[x + 34, y + h - 34, 1, -1], [x + w - 34, y + h - 34, -1, -1]] : [[x + 34, y + 34, 1, 1], [x + w - 34, y + 34, -1, 1], [x + 34, y + h - 34, 1, -1], [x + w - 34, y + h - 34, -1, -1]];
    cs.forEach(([px, py, sx, sy]) => filigree(ctx, th, px, py, 62, sx, sy));
    // a little ornament at the foot of the card
    ctx.fillStyle = th.gold[1];
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
      // Ganesh ji rises in the light for a sacred occasion; otherwise the couple's monogram
      const gz = .82 + .18 * ap(lt, .1, 1.4);
      if (!(D.sacred && figure(ctx, ganeshArt(film), cx, cy + 230 * gz, 470 * gz, ap(lt, .1, .9), { halo: 'rgba(255,225,160,.7)', shadow: false })))
        monogram(ctx, th, cx, cy, 120 * (.6 + .4 * ap(lt, .1, 1)), D.sacred ? 'ॐ' : D.mono, ap(lt, 0, .8));
      if (D.sacred) text(ctx, th, '॥ श्री गणेशाय नमः ॥', cx, cy + 380, { z: 44, font: 'deva', color: th.dark ? 'gold' : th.accent, a: ap(lt, 1.2), glow: th.dark ? 14 : 0 });
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
      // Ganesh ji (or the monogram) on top, the names, and the couple standing at the foot of the frame
      const g = D.sacred && HAS_DOM && ready(loadImg(artSrc(ganeshArt(film)))) > 0;
      if (g) figure(ctx, ganeshArt(film), cx, 500, 210, ap(lt, .1), { halo: 'rgba(255,215,140,.55)', shadow: false });
      else monogram(ctx, th, cx, 400, 66, D.sacred ? 'ॐ' : D.mono, ap(lt, .1));
      if (D.sacred) text(ctx, th, '॥ श्री गणेशाय नमः ॥', cx, 545, { z: 30, font: 'deva', color: c, a: ap(lt, .3) });
      text(ctx, th, D.heading, cx, 665, { z: hiHead ? 104 : 88, font: hiHead ? 'name' : 'head', color: c, a: ap(lt, .5), rise: 40, glow: th.dark ? 18 : 0, maxW: 760 });
      text(ctx, th, '— ✦ —', cx, 715, { z: 28, font: 'caps', color: c, a: ap(lt, .7) });
      if (D.solo) text(ctx, th, D.A, cx, 850, { z: 100, font: 'name', color: ink, a: ap(lt, .9), rise: 40, glow, maxW: 760 });
      else {
        text(ctx, th, D.A, cx, 820, { z: 100, font: 'name', color: ink, a: ap(lt, .9), rise: 40, glow, maxW: 760 });
        text(ctx, th, D.join, cx, 890, { z: 66, font: 'script', color: c, a: ap(lt, 1.15) });
        text(ctx, th, D.B, cx, 985, { z: 100, font: 'name', color: ink, a: ap(lt, 1.35), rise: 40, glow, maxW: 760 });
      }
      by = D.solo ? 960 : 1075;
      const shown = figure(ctx, coupleArt(film), cx, 1640 + (1 - out((lt - 1.4) / 1.2)) * 60, D.solo ? 470 : 480, ap(lt, 1.4, 1), { halo: th.dark ? 'rgba(255,215,150,.4)' : 'rgba(255,255,255,.7)' });
      if (!shown) diyas(ctx, th, cx, 1500, ap(lt, 2.2), lt);
      film = { ...film, noDiyas: true };
    }
    ctx.save(); ctx.globalAlpha = ap(lt, 1.7);
    ctx.font = FONT.caps(30, isHi(D.date)); const dw = Math.min(700, ctx.measureText(D.date).width + 80);
    ctx.strokeStyle = th.dark ? th.gold[1] : th.gold[2]; ctx.lineWidth = 2; ctx.strokeRect(cx - dw / 2, by - 44, dw, 64); ctx.strokeRect(cx - dw / 2 + 6, by - 38, dw - 12, 52);
    ctx.restore();
    text(ctx, th, D.date, cx, by, { z: 30, font: 'caps', color: ink, a: ap(lt, 1.7), maxW: 640 });
    text(ctx, th, [D.V, D.CITY].filter(Boolean).join(' · '), cx, by + 76, { z: 34, font: 'body', color: c, a: ap(lt, 2) });
    if (!film.noDiyas) diyas(ctx, th, cx, 1500, ap(lt, 2.2), lt);
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
  // A day of functions: the function's own painted stage, its couple (or Ganesh ji) standing in it, and a gilt
  // signboard hanging on marigold strings with the day, the functions and their times
  function signboard(ctx, th, x, y, w, h, velvet) {
    const L = layer(`board|${thKey(th)}|${w}x${h}|${velvet ? 1 : 0}`, g => {
      gilt(g, th, 20, 20, w, h, 26, 10);
      g.save(); rr(g, 46, 46, w - 52, h - 52, 4); g.clip();
      if (velvet) { const v = g.createRadialGradient(20 + w / 2, 20 + h * .4, 20, 20 + w / 2, 20 + h / 2, w * .8); v.addColorStop(0, shade(th.accent, -.05)); v.addColorStop(1, shade(th.accent, -.6)); g.fillStyle = v; g.fillRect(0, 0, w + 40, h + 40); damask(g, th.gold[1], .07, w + 40, h + 40, 110); grain(g, .1, w + 40, h + 40); }
      else { g.translate(46, 46); paperFill(g, /^#[0-9a-f]{6}$/i.test(th.paper) ? th.paper : '#fbf4e6', w - 52, h - 52); g.setTransform(1, 0, 0, 1, 0, 0); }
      g.restore();
      const s = Math.max(SCALE, 1) === 1 ? 1 : 1; // corners on the board itself
      g.save(); g.scale(s, s); filigreeCorners(g, th, 58, 58, w - 76, h - 76, 70, 1, 0); g.restore();
    }, w + 40, h + 40);
    if (L) ctx.drawImage(L, x - 20, y - 20, w + 40, h + 40);
    else { rr(ctx, x, y, w, h, 10); ctx.fillStyle = velvet ? th.accent : th.paper; ctx.fill(); stroke(ctx, th.gold[1], 6); }
  }
  function sceneDay(ctx, film, th, D, sc, lt) {
    const hi = D.lang === 'hi', cx = W / 2, fn = sceneFn(film, D, sc), sk = stageKind(film, fn), night = STAGE_TONE[sk] !== false;
    const L = AI_ON ? null : stage(sk, th);
    if (L) put(ctx, L); else if (!AI_ON) { background(ctx, th, lt, sc.n > 1 ? th.days[sc.i % 3] : shade(th.accent, th.dark ? .05 : -.15)); dayLife(ctx, sc.i % 3, lt); }
    // the figure walks in from below and settles
    const isG = sk === 'ganesh', art = dayArt(film, fn), rise = (1 - out((lt - .2) / 1.1)) * 90;
    if (!AI_ON) figure(ctx, art, cx, (isG ? 1610 : H - 40) + rise, isG ? 640 : 900, ap(lt, .2, 1), { halo: night ? 'rgba(255,225,160,.45)' : 'rgba(255,255,255,.6)' });
    if (sk === 'baraat' || sk === 'sangeet' || sk === 'reception') particles(ctx, th, 'sparkle', lt + sc.t0, true); else petals(ctx, lt + sc.t0, 20);
    // the signboard drops in on its strings and swings to rest
    const ev = sc.day.events, n = ev.length, bw = 800, bh = 330 + n * 132, bx = cx - bw / 2;
    const drop = (1 - out((lt - .1) / 1)) * -900, by = 250 + drop, sw = Math.sin(lt * 2.2) * .02 * Math.max(0, 1 - lt / 3);
    ctx.save(); ctx.translate(cx, 0); ctx.rotate(sw); ctx.translate(-cx, 0);
    if (HAS_DOM) { ladi(ctx, bx + 110, -20, by + 24, 30); ladi(ctx, bx + bw - 110, -20, by + 24, 30); }
    const velvet = !night;
    signboard(ctx, th, bx, by, bw, bh, velvet);
    const tb = velvet ? { ...th, dark: true } : { ...th, dark: false }, ink = velvet ? '#fff6e0' : th.ink, gold = velvet ? 'gold' : th.gold[2];
    const label = sc.n > 1 ? (hi ? `दिन ${sc.i + 1}` : `DAY 0${sc.i + 1}`) : (hi ? 'कार्यक्रम' : 'THE CELEBRATION');
    let y = by + 120;
    text(ctx, tb, label, cx, y, { z: 36, font: 'caps', color: gold, a: ap(lt, .5), ls: 4, maxW: bw - 160 });
    ctx.save(); ctx.globalAlpha = ap(lt, .55); ctx.strokeStyle = velvet ? th.gold[0] : th.gold[1]; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx - 230, y + 30); ctx.lineTo(cx - 24, y + 30); ctx.moveTo(cx + 24, y + 30); ctx.lineTo(cx + 230, y + 30); ctx.stroke();
    ctx.fillStyle = ctx.strokeStyle; ctx.beginPath(); ctx.moveTo(cx, y + 18); ctx.lineTo(cx + 12, y + 30); ctx.lineTo(cx, y + 42); ctx.lineTo(cx - 12, y + 30); ctx.closePath(); ctx.fill(); ctx.restore();
    y += 140;
    ev.forEach((e, i) => {
      const a = ap(lt, .8 + i * .25);
      text(ctx, tb, e.name, cx, y, { z: 84, font: 'name', color: velvet ? 'gold' : th.accent, a, rise: 20, maxW: bw - 140 });
      text(ctx, tb, e.time, cx, y + 48, { z: 30, font: 'caps', color: ink, a, ls: 2, maxW: bw - 160 });
      y += 132;
    });
    text(ctx, tb, `${sc.day.wd} · ${sc.day.d} ${sc.day.month}`, cx, by + bh - 66, { z: 40, font: 'body', color: ink, a: ap(lt, 1.3), maxW: bw - 160 });
    ctx.restore();
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
    const groups = sc.group ? [sc.group] : [D.regards, D.compliments].filter(Boolean);
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
      // the names, then the couple (or Ganesh ji for a puja) under a soft light, then Sankalp's signature
      text(ctx, th, D.heading, cx, 480, { z: isHi(D.heading) ? 92 : 76, font: isHi(D.heading) ? 'name' : 'head', color: c, a, glow: th.dark ? 16 : 0, maxW: 740 });
      text(ctx, th, D.A, cx, 610, { z: 88, font: 'name', color: ink, a: ap(lt, 2.3), maxW: 740 });
      if (D.B) { text(ctx, th, D.join, cx, 680, { z: 60, font: 'script', color: c, a: ap(lt, 2.5) }); text(ctx, th, D.B, cx, 770, { z: 88, font: 'name', color: ink, a: ap(lt, 2.7), maxW: 740 }); }
      text(ctx, th, D.date, cx, D.B ? 840 : 700, { z: 30, font: 'caps', color: ink, a: ap(lt, 2.9), maxW: 640 });
      const art = ['puja', 'housewarming'].includes(film.occ) && D.sacred ? ganeshArt(film) : coupleArt(film);
      if (!figure(ctx, art, cx, 1415 + (1 - out((lt - 2.6) / 1.4)) * 50, D.B ? 520 : 600, ap(lt, 2.6, 1.2), { halo: th.dark ? 'rgba(255,215,150,.5)' : 'rgba(255,255,255,.75)' })) diyas(ctx, th, cx, 1330, ap(lt, 3), lt);
      if (D.credit) text(ctx, th, D.credit === 'Designed by Sankalp' ? 'Designed with ♥ by Sankalp' : D.credit, cx, 1500, { z: 50, font: 'script', color: c, a: ap(lt, 3.4), glow: th.dark ? 12 : 0 });
      if (D.site) text(ctx, th, D.site, cx, 1556, { z: 28, font: 'caps', color: ink, a: ap(lt, 3.6), ls: 2 });
    }
  }
  // A shloka on its own screen
  function sceneVerse(ctx, film, th, D, sc, lt) {
    const c = holder(ctx, film, th, lt, 100), cx = c.cx; th = c.th || th;
    const lightTh = { ...th, dark: false }, mid = c.y + c.h / 2;
    mandalaAt(ctx, th, cx, mid - 250, 80, ap(lt, .2) * .7); monogram(ctx, th, cx, mid - 250, 44, 'ॐ', ap(lt, .3), false);
    const h = sc.lines.length * 84;
    sc.lines.forEach((l, i) => text(ctx, lightTh, l, cx, mid - h / 2 + 60 + i * 84, { z: 50, font: 'deva', color: th.accent, a: ap(lt, .6 + i * .35), rise: 20, maxW: c.w - 110 }));
    text(ctx, lightTh, '— ✦ —', cx, mid + h / 2 + 90, { z: 30, font: 'caps', color: th.gold[1], a: ap(lt, 1.4) });
  }
  // The little ones' request (bal manuhar): a ribbon box with their lines, their names last
  function sceneKids(ctx, film, th, D, sc, lt) {
    const c = holder(ctx, film, th, lt, 100), cx = c.cx; th = c.th || th;
    const lightTh = { ...th, dark: false }, dk = { ...th, dark: true }, lines = D.kidsLines;
    const hi = isHi(lines.join(' ')), names = lines.length > 1 ? lines[lines.length - 1] : '', words = names ? lines.slice(0, -1) : lines;
    const bw = c.w - 90, bh = 150 + words.length * 74 + (names ? 120 : 0), by = c.y + (c.h - bh) / 2 + 20;
    ctx.save(); ctx.globalAlpha = ap(lt, .2); rr(ctx, cx - bw / 2, by, bw, bh, 22); ctx.fillStyle = th.accent; ctx.fill(); stroke(ctx, th.gold[1], 3);
    rr(ctx, cx - 160, by - 28, 320, 56, 28); ctx.fillStyle = goldFill(ctx, th, by + 10, 60); ctx.fill(); ctx.restore();
    text(ctx, lightTh, hi ? 'बाल मनुहार' : 'A LITTLE REQUEST', cx, by + 12, { z: 30, font: 'caps', color: th.ink, a: ap(lt, .35), maxW: 290 });
    words.forEach((l, i) => text(ctx, dk, l, cx, by + 120 + i * 74, { z: 46, font: 'name', color: '#fff', a: ap(lt, .6 + i * .3), rise: 16, maxW: bw - 70 }));
    if (names) {
      const ny = by + 120 + words.length * 74 + 30;
      ctx.save(); ctx.globalAlpha = ap(lt, 1.2); rr(ctx, cx - bw / 2 + 60, ny - 50, bw - 120, 74, 8); ctx.fillStyle = goldFill(ctx, th, ny, 70); ctx.fill(); ctx.restore();
      text(ctx, lightTh, names, cx, ny, { z: 40, font: 'name', color: th.ink, a: ap(lt, 1.3), maxW: bw - 160 });
    }
  }
  // The card's other words, line by line
  function sceneWords(ctx, film, th, D, sc, lt) {
    const c = holder(ctx, film, th, lt, 100), cx = c.cx; th = c.th || th;
    const lightTh = { ...th, dark: false };
    const draw = (y, ghost) => {
      ctx.save(); if (ghost) ctx.globalAlpha = 0;
      monogram(ctx, th, cx, y, 40, D.sacred ? 'ॐ' : D.mono, ap(lt, .2), false); y += 110;
      sc.lines.forEach((l, i) => { y += para(ctx, lightTh, l, cx, y, { z: isHi(l) ? 40 : 38, font: isHi(l) ? 'deva' : 'body', color: i % 2 ? shade(th.ink, .2) : th.ink, a: ap(lt, .4 + i * .45), rise: 16, maxW: c.w - 130, lines: 3 }) + 34; });
      text(ctx, lightTh, '— ✦ —', cx, y + 20, { z: 30, font: 'caps', color: th.gold[1], a: ap(lt, .6 + sc.lines.length * .45) });
      ctx.restore(); return y + 40;
    };
    const top = c.y + (film.frame === 'arch' ? 200 : 120), room = c.y + c.h - 120 - top, used = draw(top, true) - top;
    draw(top + Math.max(0, (room - used) / 2), false);
  }
  const SCENES = { open: sceneOpen, title: sceneTitle, card: sceneCard, day: sceneDay, venue: sceneVenue, regards: sceneRegards, note: sceneNote, verse: sceneVerse, kids: sceneKids, words: sceneWords, finale: sceneFinale };

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

  // a concept's still background, painted once per palette
  function cbg(ctx, key, th, paint) { const L = layer(`cbg|${key}|${thKey(th)}`, g => paint(g)); if (L) put(ctx, L); else paint(ctx); }
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
      cbg(ctx, 'minimal', th, g => {
        // cotton paper with a blind-debossed border and a fine foil hairline
        if (th.dark) { silkBg(g, th.bg[0], th.bg[1], th.gold[1], .025); } else paperFill(g, th.bg[0], W, H, 11);
        g.save(); g.strokeStyle = th.dark ? 'rgba(0,0,0,.6)' : 'rgba(0,0,0,.08)'; g.lineWidth = 6; g.strokeRect(64, 64, W - 128, H - 128);
        g.strokeStyle = th.dark ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,.8)'; g.lineWidth = 2; g.strokeRect(68, 68, W - 136, H - 136);
        g.strokeStyle = foil(g, th, 0, 0, W, H); g.lineWidth = 1.6; g.strokeRect(92, 92, W - 184, H - 184); g.restore();
      });
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
      // the couple, set into the white space at the right like an editorial photograph
      figure(ctx, coupleArt(film), 790, (FIN ? 1610 : 1745) + (1 - out((lt - .8) / 1.4)) * 40, FIN ? 470 : 620, ap(lt, .8, 1.2), { halo: th.dark ? 'rgba(255,240,210,.18)' : 'rgba(255,255,255,.9)' });
      text(ctx, th, D.date, x, 1240, { z: 40, font: 'caps', color: th.ink, align: 'left', a: ap(lt, 1.5), maxW: 470, ls: 2 });
      para(ctx, th, [D.V, D.CITY].filter(Boolean).join(', '), x + 235, 1305, { z: 34, font: 'body', color: th.accent, a: ap(lt, 1.7), maxW: 430, lines: 3 });
      ctx.save(); ctx.translate(W - 120, 640); ctx.rotate(-Math.PI / 2);
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
    if (HAS_DOM) { sprite(ctx, rose(hex6(cols[0])), x, y, r * 2.3 * Math.min(1, k), rot, clamp(k * 2)); return; }
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
    if (HAS_DOM && k > 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(k, k); sprite(ctx, leafSprite(hex6(col)), len / 2, 0, len); ctx.restore(); return; }
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
      cbg(ctx, 'floral', th, g => {
        // cold-press watercolour paper with soft blooms of colour bleeding at the edges
        paperFill(g, th.bg[0], W, H, 5);
        const r = rng(17);
        [[120, 160, 460, th.fl[1]], [W - 80, H - 220, 520, th.fl[0]], [W - 160, 360, 300, th.leaf], [140, H - 420, 340, th.fl[2]], [W / 2, H * .5, 700, th.bg[1]]].forEach(([x, y, rad, c]) => {
          for (let k = 0; k < 7; k++) { const xx = x + (r() - .5) * rad * .5, yy = y + (r() - .5) * rad * .5, rr2 = rad * (.5 + r() * .5); const w2 = g.createRadialGradient(xx, yy, 10, xx, yy, rr2); w2.addColorStop(0, c + '30'); w2.addColorStop(.7, c + '18'); w2.addColorStop(1, c + '00'); g.fillStyle = w2; g.beginPath(); g.arc(xx, yy, rr2, 0, Math.PI * 2); g.fill(); }
        });
        grain(g, .05);
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
      text(ctx, th, D.date, cx, 1225, { z: 40, font: 'caps', color: th.ink, a: ap(lt, 1.6), ls: 2, maxW: 820 });
      text(ctx, th, [D.V, D.CITY].filter(Boolean).join(' · '), cx, 1290, { z: 40, font: 'body', color: th.accent, a: ap(lt, 1.8), maxW: 820 });
      // the couple in a nest of blooms
      const fy = FIN ? -150 : 0; figure(ctx, coupleArt(film), cx, 1770 + fy, FIN ? 320 : 440, ap(lt, 1.4, 1.2), { halo: 'rgba(255,255,255,.85)' });
      bouquet(ctx, th, cx - 300, 1640 + fy, FIN ? .8 : 1, lt, ease((lt - 1.6) / 1)); bouquet(ctx, th, cx + 300, 1660 + fy, FIN ? .8 : 1, lt, ease((lt - 1.8) / 1), -1);
    },
    panel(ctx, film, th, a) {
      const r = { x: 130, y: 340, w: W - 260, h: 1240 }; r.cx = r.x + r.w / 2;
      ctx.save(); ctx.globalAlpha *= clamp(a); ctx.shadowColor = 'rgba(120,60,60,.18)'; ctx.shadowBlur = 50; rr(ctx, r.x, r.y, r.w, r.h, 40); ctx.fillStyle = th.paper; ctx.fill(); ctx.shadowColor = 'transparent'; paperIn(ctx, th.paper, r.x, r.y, r.w, r.h);
      rr(ctx, r.x + 26, r.y + 26, r.w - 52, r.h - 52, 28); ctx.lineWidth = 3; ctx.strokeStyle = foil(ctx, th, r.x, r.y, r.x + r.w, r.y + r.h); ctx.stroke(); ctx.restore();
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
      cbg(ctx, 'cinema', th, g => {
        const b = g.createRadialGradient(W / 2, H * .42, 50, W / 2, H * .5, H * .8); b.addColorStop(0, th.bg[0]); b.addColorStop(1, th.bg[1]); g.fillStyle = b; g.fillRect(0, 0, W, H);
        // smoke in the projector light
        const r = rng(23); for (let i = 0; i < 26; i++) { const x = r() * W, y = r() * H, rad = 120 + r() * 260, h2 = g.createRadialGradient(x, y, 0, x, y, rad); h2.addColorStop(0, 'rgba(255,255,255,.05)'); h2.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = h2; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
        grain(g, .14);
      });
      [-1, 1].forEach(s => {
        ctx.save(); ctx.translate(W / 2 + s * 460, H); ctx.rotate(s * (-.35 + Math.sin(t * .5 + s) * .18));
        const b = ctx.createLinearGradient(0, 0, 0, -H * 1.1); b.addColorStop(0, th.accent + '40'); b.addColorStop(1, th.accent + '00');
        ctx.fillStyle = b; ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(-260, -H * 1.1); ctx.lineTo(260, -H * 1.1); ctx.lineTo(30, 0); ctx.fill(); ctx.restore();
      });
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 150); ctx.fillRect(0, H - 170, W, 170);
      ctx.fillStyle = foil(ctx, th, 0, 0, W, 0); ctx.fillRect(0, 148, W, 2); ctx.fillRect(0, H - 170, W, 2);
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
      // a film poster: billing on top, the couple lit from behind, the title block and the small print below
      const t2 = tw(th, true), cx = W / 2, hi = D.lang === 'hi';
      ctx.save(); ctx.beginPath(); ctx.rect(0, 150, W, H - 320); ctx.clip();
      const rim = ctx.createRadialGradient(cx, 1150, 30, cx, 1150, 620); rim.addColorStop(0, rgba(hex6(th.accent), .4)); rim.addColorStop(1, rgba(hex6(th.accent), 0)); ctx.fillStyle = rim; ctx.fillRect(0, 500, W, 1300);
      figure(ctx, coupleArt(film), cx, 1790 - (ap(lt, .3, 2.4)) * 30, 1000, ap(lt, .3, 1), { shadow: false });
      const fade = ctx.createLinearGradient(0, 1330, 0, H - 170); fade.addColorStop(0, rgba(hex6(th.bg[1]), 0)); fade.addColorStop(.55, rgba(hex6(th.bg[1]), .9)); fade.addColorStop(1, th.bg[1]); ctx.fillStyle = fade; ctx.fillRect(0, 1330, W, 420);
      const top = ctx.createLinearGradient(0, 150, 0, 760); top.addColorStop(0, rgba(hex6(th.bg[1]), .85)); top.addColorStop(1, rgba(hex6(th.bg[1]), 0)); ctx.fillStyle = top; ctx.fillRect(0, 150, W, 610);
      ctx.restore();
      text(ctx, t2, hi ? 'प्रस्तुत करते हैं' : 'STARRING', cx, 250, { z: 30, font: 'caps', color: th.accent, a: ap(lt, .2), ls: 10 });
      if (D.solo) text(ctx, t2, D.A, cx, 420, { z: 120, font: 'name', color: 'gold', a: ap(lt, .5), glow: 22, maxW: 900 });
      else {
        text(ctx, t2, D.A, cx, 380, { z: 104, font: 'name', color: 'gold', a: ap(lt, .5), glow: 22, maxW: 900 });
        text(ctx, t2, hi ? 'और' : 'AND', cx, 450, { z: 30, font: 'caps', color: '#fff', a: ap(lt, .8), ls: 8 });
        text(ctx, t2, D.B, cx, 560, { z: 104, font: 'name', color: 'gold', a: ap(lt, 1), glow: 22, maxW: 900 });
      }
      text(ctx, t2, `${hi ? '' : 'IN CINEMAS · '}${D.date}`, cx, 1560, { z: 40, font: 'caps', color: '#fff', a: ap(lt, 1.5), ls: 3, maxW: 880, glow: 10 });
      text(ctx, t2, [D.V, D.CITY].filter(Boolean).join(' · '), cx, 1620, { z: 38, font: 'body', color: th.accent, a: ap(lt, 1.7), maxW: 880 });
      text(ctx, t2, hi ? 'परिवार की ओर से एक प्रेम कहानी · संगीत: शहनाई · निर्देशन: प्यार' : 'A FAMILY PRODUCTION · MUSIC BY THE SHEHNAI · DIRECTED BY LOVE · ★★★★★', cx, 1690, { z: 20, font: 'caps', color: 'rgba(255,255,255,.7)', a: ap(lt, 2), ls: 2, maxW: 860 });
    },
    panel(ctx, film, th, a) {
      const r = { x: 120, y: 260, w: W - 240, h: 1360 }; r.cx = r.x + r.w / 2;
      ctx.save(); ctx.globalAlpha *= clamp(a); rr(ctx, r.x, r.y, r.w, r.h, 18); ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fill(); stroke(ctx, th.accent + 'aa', 1.5); ctx.restore();
      return r;
    },
    day(ctx, film, th, D, sc, lt) {
      const t2 = tw(th, true), cx = W / 2, b = dateBits(D, sc), hi = D.lang === 'hi';
      // the day's couple as a toned film still rising out of the dark
      const still = tonedArt(dayArt(film, sceneFn(film, D, sc)), hex6(th.bg[1]), hex6(th.accent));
      if (still) { const iw = still.width / SCALE, ih = still.height / SCALE, k = 900 / ih; ctx.save(); ctx.beginPath(); ctx.rect(0, 150, W, H - 320); ctx.clip(); ctx.globalAlpha = ap(lt, .2, 1.5) * .55; ctx.drawImage(still, cx - iw * k / 2, H - 170 - ih * k + (1 - ap(lt, 0, 3)) * 40, iw * k, ih * k);
        const f = ctx.createLinearGradient(0, H - 600, 0, H - 170); f.addColorStop(0, rgba(hex6(th.bg[1]), 0)); f.addColorStop(1, th.bg[1]); ctx.globalAlpha = 1; ctx.fillStyle = f; ctx.fillRect(0, H - 600, W, 430); ctx.restore(); }
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
    ctx.save(); ctx.strokeStyle = foil(ctx, th, cx - R, cy - R, cx + R, cy); ctx.lineWidth = 3;
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
      cbg(ctx, 'deco', th, g => {
        if (th.dark) silkBg(g, th.bg[0], th.bg[1], th.gold[1], 0); else paperFill(g, th.bg[0], W, H, 8);
        // a sunburst of fine gold rays and a stepped skyline of chevrons
        g.save(); g.globalAlpha = th.dark ? .14 : .18; g.strokeStyle = foil(g, th, 0, 0, W, H); g.lineWidth = 2;
        for (let i = 0; i <= 48; i++) { const a = Math.PI + i * Math.PI / 48; g.beginPath(); g.moveTo(W / 2, H * .62); g.lineTo(W / 2 + Math.cos(a) * 1400, H * .62 + Math.sin(a) * 1400); g.stroke(); }
        g.globalAlpha = th.dark ? .1 : .14; for (let x = 40; x < W; x += 40) { g.beginPath(); g.moveTo(x, H * .7); g.lineTo(x, H); g.stroke(); }
        g.restore();
        g.save(); g.strokeStyle = foil(g, th, 0, 0, W, H); g.lineWidth = 6; octagon(g, 46, 46, W - 92, H - 92, 74); g.stroke(); g.lineWidth = 1.5; octagon(g, 64, 64, W - 128, H - 128, 64); g.stroke(); octagon(g, 74, 74, W - 148, H - 148, 60); g.stroke();
        // stepped deco corners
        [[46, 46, 1, 1], [W - 46, 46, -1, 1], [46, H - 46, 1, -1], [W - 46, H - 46, -1, -1]].forEach(([x, y, sx, sy]) => { g.fillStyle = foil(g, th, x, y, x + sx * 120, y + sy * 120); for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(x + sx * (90 + k * 26), y + sy * 20); g.lineTo(x + sx * (100 + k * 26), y + sy * 20); g.lineTo(x + sx * 20, y + sy * (100 + k * 26)); g.lineTo(x + sx * 20, y + sy * (90 + k * 26)); g.closePath(); g.fill(); } });
        g.restore(); grain(g, .06);
      });
    },
    open(ctx, film, th, D, sc, lt) {
      fan(ctx, th, W / 2, H * .62, 520, ease(lt / 1.6));
      diamond(ctx, th, W / 2, H * .62 - 30, 70 * ap(lt, 1.2));
      text(ctx, th, D.mono, W / 2, H * .62 - 16, { z: 44, font: 'caps', color: th.dark ? '#111' : '#fff', a: ap(lt, 1.5), maxW: 120 });
      text(ctx, th, D.heading.toUpperCase(), W / 2, H * .62 + 160, { z: 64, font: 'head', color: 'gold', a: ap(lt, 1.8), ls: 4 });
    },
    title(ctx, film, th, D, sc, lt) {
      const cx = W / 2;
      ctx.save(); ctx.globalAlpha = ap(lt, 0, 1.2); octagon(ctx, 150, 380, W - 300, 1100, 90); ctx.fillStyle = th.dark ? 'rgba(0,0,0,.35)' : 'rgba(255,255,255,.45)'; ctx.fill();
      ctx.strokeStyle = foil(ctx, th, 150, 380, W - 150, 1480); ctx.lineWidth = 7; ctx.stroke(); ctx.lineWidth = 1.5; octagon(ctx, 172, 402, W - 344, 1056, 82); ctx.stroke(); ctx.restore();
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
  // a gilt photo corner (the album corners hold the prints; w is kept from the old tape)
  function tape(ctx, x, y, w, ang) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang + Math.PI / 4);
    const s = Math.min(70, w * .4), g = ctx.createLinearGradient(-s, -s, s, s); g.addColorStop(0, '#8a5a14'); g.addColorStop(.35, '#f6dc8a'); g.addColorStop(.6, '#c8952e'); g.addColorStop(1, '#7a4a0c');
    ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-s, s * .3); ctx.lineTo(0, -s * .7); ctx.lineTo(s, s * .3); ctx.closePath(); ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.strokeStyle = 'rgba(255,245,200,.7)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-s * .7, s * .15); ctx.lineTo(0, -s * .5); ctx.lineTo(s * .7, s * .15); ctx.stroke();
    ctx.restore();
  }
  function polaroid(ctx, th, x, y, w, h, ang, k, draw) {
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.globalAlpha *= clamp(k);
    ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18; ctx.fillStyle = '#fffdf8'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.shadowColor = 'transparent';
    ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, h); paperIn(ctx, '#fffdf6', -w / 2, -h / 2, w, h);
    // the print: a soft studio backdrop and a gloss
    const pw = w - 60, ph = h - 190, g = ctx.createRadialGradient(0, -h / 2 + ph * .4, 20, 0, -h / 2 + ph * .5, ph * .8); g.addColorStop(0, shade(th.accent, .7)); g.addColorStop(.6, shade(th.accent, .35)); g.addColorStop(1, shade(th.accent, -.1));
    ctx.fillStyle = g; ctx.fillRect(-pw / 2, -h / 2 + 30, pw, ph);
    ctx.save(); ctx.beginPath(); ctx.rect(-pw / 2, -h / 2 + 30, pw, ph); ctx.clip();
    if (draw) draw(-pw / 2, -h / 2 + 30, pw, ph);
    const gl = ctx.createLinearGradient(-pw / 2, -h / 2, pw / 2, -h / 2 + ph); gl.addColorStop(0, 'rgba(255,255,255,.28)'); gl.addColorStop(.4, 'rgba(255,255,255,0)'); gl.addColorStop(1, 'rgba(255,255,255,.06)'); ctx.fillStyle = gl; ctx.fillRect(-pw / 2, -h / 2 + 30, pw, ph);
    ctx.restore();
    ctx.strokeStyle = 'rgba(0,0,0,.12)'; ctx.lineWidth = 2; ctx.strokeRect(-pw / 2, -h / 2 + 30, pw, ph);
    ctx.restore();
  }
  function heart(ctx, x, y, s, col, fill = true) { ctx.save(); ctx.translate(x, y); ctx.scale(s / 100, s / 100); ctx.beginPath(); ctx.moveTo(0, 30); ctx.bezierCurveTo(-60, -10, -40, -70, 0, -38); ctx.bezierCurveTo(40, -70, 60, -10, 0, 30); ctx.closePath(); if (fill) { ctx.fillStyle = col; ctx.fill(); } else { ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.stroke(); } ctx.restore(); }
  const POLAROID = {
    short: 'Polaroid', name: 'Polaroid Memories', trans: 'slide', fx: 'none',
    face: face('400 {z}px "Great Vibes", cursive', '700 {z}px "Caveat", cursive', '600 {z}px "Jost", sans-serif', '500 {z}px "Caveat", cursive', '400 {z}px "Great Vibes", cursive'),
    pals: [P6('Kraft', false, ['#d2b48c', '#b8956a'], ['#6b4a2a', '#4a321a', '#2a1a0a'], '#fffdf6', '#3a2a1a', '#c0524a'),
      P6('Linen', false, ['#f3ece0', '#e4d8c4'], ['#8a6a4a', '#5a4430', '#2e2216'], '#fffefb', '#2e2620', '#3f7fa8'),
      P6('Sage Board', false, ['#c9d3bf', '#aebba2'], ['#4a5a3a', '#34422a', '#1e2818'], '#fffffa', '#26301e', '#c76b4a'),
      P6('Blush Board', false, ['#efd3d0', '#dfb7b2'], ['#7a4a46', '#5a3230', '#341a18'], '#fffafa', '#3a2220', '#7a5ac0'),
      P6('Sky Board', false, ['#cfe1ee', '#b1cbde'], ['#3a5a74', '#28425a', '#14263a'], '#fffffd', '#1e2e3e', '#e0864a'),
      P6('Chalk', true, ['#2d3a33', '#1c2420'], ['#ffffff', '#e8e8e0', '#b8b8b0'], '#fffdf6', '#f4f4ec', '#f2c94c')],
    bg(ctx, th, t) {
      cbg(ctx, 'polaroid', th, g => {
        // a linen-bound album page: woven cloth, a stitched border, gold-stamped corners
        const b = g.createRadialGradient(W / 2, H * .4, 80, W / 2, H / 2, H * .8); b.addColorStop(0, shade(th.bg[0], .08)); b.addColorStop(1, shade(th.bg[1], -.12)); g.fillStyle = b; g.fillRect(0, 0, W, H);
        g.save(); g.globalAlpha = .07; g.strokeStyle = th.dark ? '#fff' : '#3a2a1a'; g.lineWidth = 1;
        for (let y = 0; y < H; y += 4) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); } g.globalAlpha = .05; for (let x = 0; x < W; x += 4) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
        g.restore(); grain(g, .12);
        g.save(); g.setLineDash([14, 10]); g.strokeStyle = th.dark ? 'rgba(255,255,255,.35)' : 'rgba(255,255,255,.6)'; g.lineWidth = 3; g.strokeRect(54, 54, W - 108, H - 108); g.restore();
        filigreeCorners(g, { ...th, gold: GOLD }, 80, 80, W - 160, H - 160, 90, .85);
        const v = g.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.3)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
      });
    },
    open(ctx, film, th, D, sc, lt) {
      const drop = (s, y0) => y0 - (1 - out((lt - s) / .7)) * 1400;
      polaroid(ctx, th, W / 2 - 160, drop(.1, 820), 460, 560, -.16, ap(lt, .1, .2));
      polaroid(ctx, th, W / 2 + 170, drop(.5, 900), 460, 560, .12, ap(lt, .5, .2));
      polaroid(ctx, th, W / 2, drop(.9, 1000), 500, 610, -.03, ap(lt, .9, .2), (x, y, w, h) => { if (!figure(ctx, coupleArt(film), x + w / 2, y + h + 20, h * 1.05, 1, { shadow: false })) heart(ctx, x + w / 2, y + h / 2, 220, 'rgba(255,255,255,.85)'); });
      tape(ctx, W / 2, drop(.9, 1000) - 300, 180, .08);
      text(ctx, th, D.lang === 'hi' ? 'हमारी कहानी…' : 'our story…', W / 2, 1520, { z: 96, font: 'script', color: th.dark ? '#fff' : th.ink, a: ap(lt, 1.8) });
    },
    title(ctx, film, th, D, sc, lt) {
      const cx = W / 2, k = out(lt / .8);
      polaroid(ctx, th, cx, 800 - (1 - k) * 300, 700, 860, -.05, k, (x, y, w, h) => {
        heart(ctx, x + w / 2, y + h / 2 + 30, 300, 'rgba(255,255,255,.25)');
        if (!figure(ctx, coupleArt(film), x + w / 2, y + h + 30, h * 1.08, 1, { shadow: false }))
          text(ctx, tw(th, true), D.mono.replace(' | ', ' ♥ '), x + w / 2, y + h / 2 + 50, { z: 150, font: 'name', color: '#fff', maxW: w - 40 });
      });
      ctx.save(); ctx.translate(cx, 800 - (1 - k) * 300); ctx.rotate(-.05);
      text(ctx, { ...th, dark: false }, who2(D, D.lang === 'hi'), 0, 370, { z: 92, font: 'name', color: '#2a2a2a', a: ap(lt, .6), maxW: 620 });
      ctx.restore();
      tape(ctx, cx - 250, 390, 170, -.5); tape(ctx, cx + 250, 390, 170, .5);
      ctx.save(); ctx.translate(cx + 250, 1440); ctx.rotate(.07); ctx.globalAlpha = ap(lt, 1.2); ctx.shadowColor = 'rgba(0,0,0,.3)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8; ctx.fillStyle = '#fbf5e8'; ctx.fillRect(-190, -150, 380, 300); ctx.shadowColor = 'transparent';
      ctx.beginPath(); ctx.rect(-190, -150, 380, 300); paperIn(ctx, '#fbf5e8', -190, -150, 380, 300);
      ctx.strokeStyle = foil(ctx, { gold: GOLD }, -190, -150, 190, 150); ctx.lineWidth = 4; ctx.strokeRect(-176, -136, 352, 272); ctx.restore();
      seal(ctx, th, cx + 410, 1300, 46, initials(D), ap(lt, 1.6, .4));
      ctx.save(); ctx.translate(cx + 250, 1440); ctx.rotate(.07);
      text(ctx, { ...th, dark: false }, D.lang === 'hi' ? 'याद रखना!' : 'save the date!', 0, -70, { z: 50, font: 'script', color: th.accent, a: ap(lt, 1.3) });
      text(ctx, { ...th, dark: false }, D.date, 0, 10, { z: 40, font: 'body', color: '#2a2a2a', a: ap(lt, 1.4), maxW: 340 });
      text(ctx, { ...th, dark: false }, D.V, 0, 70, { z: 34, font: 'body', color: '#2a2a2a', a: ap(lt, 1.5), maxW: 340 });
      ctx.restore();
      text(ctx, th, D.heading, cx - 220, 1460, { z: 64, font: 'head', color: th.dark ? '#fff' : th.ink, a: ap(lt, 1), maxW: 440 });
    },
    panel(ctx, film, th, a) {
      const r = { x: 120, y: 300, w: W - 240, h: 1320 }; r.cx = r.x + r.w / 2;
      ctx.save(); ctx.globalAlpha *= clamp(a); ctx.shadowColor = 'rgba(0,0,0,.3)'; ctx.shadowBlur = 36; ctx.shadowOffsetY = 14; ctx.fillStyle = th.paper; ctx.fillRect(r.x, r.y, r.w, r.h); ctx.shadowColor = 'transparent';
      ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); paperIn(ctx, th.paper, r.x, r.y, r.w, r.h);
      ctx.strokeStyle = foil(ctx, { gold: GOLD }, r.x, r.y, r.x + r.w, r.y + r.h); ctx.lineWidth = 3; ctx.strokeRect(r.x + 28, r.y + 28, r.w - 56, r.h - 56); ctx.lineWidth = 1; ctx.strokeRect(r.x + 38, r.y + 38, r.w - 76, r.h - 76); ctx.restore();
      [[r.x, r.y, -Math.PI / 2], [r.x + r.w, r.y, 0], [r.x + r.w, r.y + r.h, Math.PI / 2], [r.x, r.y + r.h, Math.PI]].forEach(([x, y, a2]) => tape(ctx, x, y, 160, a2 - Math.PI / 4 + Math.PI / 2));
      return { ...r, th: { ...th, ink: '#2a2a2a', dark: false } };
    },
    day(ctx, film, th, D, sc, lt) {
      const cx = W / 2, b = dateBits(D, sc), x = 160, w = W - 320, y = 360, k = out(lt / .6);
      ctx.save(); ctx.globalAlpha = k; ctx.translate(0, (1 - k) * 200); ctx.shadowColor = 'rgba(0,0,0,.3)'; ctx.shadowBlur = 36; ctx.shadowOffsetY = 14; ctx.fillStyle = '#fffdf8'; ctx.fillRect(x, y, w, 1160); ctx.shadowColor = 'transparent';
      ctx.beginPath(); ctx.rect(x, y, w, 1160); paperIn(ctx, '#fffdf8', x, y, w, 1160);
      const hb = ctx.createLinearGradient(0, y, 0, y + 170); hb.addColorStop(0, shade(th.accent, .1)); hb.addColorStop(1, shade(th.accent, -.25)); ctx.fillStyle = hb; ctx.fillRect(x, y, w, 170);
      ctx.fillStyle = foil(ctx, { gold: GOLD }, x, y, x + w, y); ctx.fillRect(x, y + 166, w, 6);
      for (let i = 0; i < 9; i++) { const rx = x + 60 + i * (w - 120) / 8, rg = ctx.createLinearGradient(rx - 10, 0, rx + 10, 0); rg.addColorStop(0, '#7a5a1a'); rg.addColorStop(.5, '#f6dc8a'); rg.addColorStop(1, '#7a5a1a'); ctx.strokeStyle = rg; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(rx, y, 16, Math.PI * .9, Math.PI * 2.1); ctx.stroke(); }
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
      cbg(ctx, 'neon', th, g => {
        g.fillStyle = '#0a0606'; g.fillRect(0, 0, W, H);
        const r = rng(31);
        for (let row = 0; row < 40; row++) for (let x = (row % 2) * -60; x < W; x += 120) {
          const y = row * 48, v = r(), bc = g.createLinearGradient(0, y, 0, y + 44); bc.addColorStop(0, `rgb(${70 + v * 30},${32 + v * 12},${26 + v * 8})`); bc.addColorStop(1, `rgb(${40 + v * 20},${18 + v * 8},${14 + v * 6})`);
          g.fillStyle = bc; rr(g, x + 3, y + 3, 114, 42, 4); g.fill();
        }
        g.globalCompositeOperation = 'multiply'; g.globalAlpha = .55; g.fillStyle = shade(th.accent, -.2); g.fillRect(0, 0, W, H); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
        grain(g, .2);
        const dark = g.createRadialGradient(W / 2, H * .45, 200, W / 2, H * .5, H * .7); dark.addColorStop(0, 'rgba(0,0,0,.05)'); dark.addColorStop(1, 'rgba(0,0,0,.75)'); g.fillStyle = dark; g.fillRect(0, 0, W, H);
        // edison bulbs on long cords
        for (let i = 0; i < 7; i++) { const x = 90 + i * 150, len = 90 + (i % 3) * 70; g.strokeStyle = '#1a1210'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, len); g.stroke(); const gl = g.createRadialGradient(x, len + 26, 2, x, len + 26, 120); gl.addColorStop(0, 'rgba(255,190,110,.55)'); gl.addColorStop(1, 'rgba(255,170,80,0)'); g.fillStyle = gl; g.fillRect(x - 120, len - 94, 240, 240); g.fillStyle = '#ffd9a0'; g.beginPath(); g.ellipse(x, len + 26, 14, 20, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#3a2a1a'; g.fillRect(x - 8, len, 16, 10); }
        const fl = g.createLinearGradient(0, H - 380, 0, H); fl.addColorStop(0, 'rgba(0,0,0,0)'); fl.addColorStop(.25, '#120a0c'); fl.addColorStop(1, '#050304'); g.fillStyle = fl; g.fillRect(0, H - 380, W, 380);
      });
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
    short: 'Rangoli', name: 'Rangoli Utsav', ai: true, trans: 'zoom', fx: 'petals',
    face: face('400 {z}px "Yatra One", serif', '400 {z}px "Yatra One", serif', '400 {z}px "Marcellus", serif', '400 {z}px "Marcellus", serif', '400 {z}px "Yatra One", serif'),
    pals: [P6('Festive', false, ['#fff3df', '#ffd9a8'], GOLD, '#ffffff', '#5a1030', '#d81b60', { rg: ['#d81b60', '#ff9800', '#fdd835', '#43a047'] }),
      P6('Peacock', false, ['#eafaf7', '#c6ece6'], GOLD, '#ffffff', '#0b3a5a', '#00838f', { rg: ['#1565c0', '#00897b', '#7cb342', '#fbc02d'] }),
      P6('Lotus', false, ['#fff0f3', '#ffd2dc'], GOLD, '#ffffff', '#6a0f2a', '#e91e63', { rg: ['#e91e63', '#f06292', '#ffffff', '#66bb6a'] }),
      P6('Sunset', false, ['#fff1e6', '#ffcfa8'], GOLD, '#ffffff', '#5a1a0a', '#e65100', { rg: ['#e65100', '#c62828', '#7b1fa2', '#ffb300'] }),
      P6('Royal', false, ['#f6efff', '#e0cdfa'], GOLD, '#ffffff', '#36125a', '#7b1fa2', { rg: ['#7b1fa2', '#ffb300', '#ec407a', '#26a69a'] }),
      P6('Tulsi', false, ['#f1fae8', '#d6efc0'], GOLD, '#ffffff', '#1f3a10', '#2e7d32', { rg: ['#2e7d32', '#fdd835', '#e53935', '#fb8c00'] })],
    bg(ctx, th, t) {
      cbg(ctx, 'rangoli', th, g => {
        // a lime-washed courtyard wall, dotted for the kolam, a marigold toran with mango leaves across the top
        paperFill(g, th.bg[0], W, H, 21);
        const b = g.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, H * .7); b.addColorStop(0, 'rgba(255,255,255,0)'); b.addColorStop(1, rgba(hex6(th.bg[1]), .9)); g.fillStyle = b; g.fillRect(0, 0, W, H);
        g.save(); g.globalAlpha = .12; g.fillStyle = th.ink; for (let y = 300; y < H; y += 60) for (let x = 40 + ((y / 60) % 2) * 30; x < W; x += 60) { g.beginPath(); g.arc(x, y, 3, 0, Math.PI * 2); g.fill(); } g.restore();
        for (let i = 0; i < 12; i++) sprite(g, leafSprite('#2e7d32'), 45 + i * 90, 52, 90, Math.PI / 2 + (i % 2 ? .3 : -.3));
        garland(g, -20, 30, W + 20, 30, 0, 44); garland(g, -20, 30, W / 2, 30, 110, 38); garland(g, W / 2, 30, W + 20, 30, 110, 38);
        for (let i = 0; i < 6; i++) ladi(g, 90 + i * 180, 60, 120 + (i % 2) * 60, 28);
        grain(g, .05);
      });
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
      cbg(ctx, 'botanical', th, g => {
        paperFill(g, th.bg[0], W, H, 13);
        const b = g.createLinearGradient(0, H * .55, 0, H); b.addColorStop(0, rgba(hex6(th.bg[1]), 0)); b.addColorStop(1, rgba(hex6(th.bg[1]), 1)); g.fillStyle = b; g.fillRect(0, H * .55, W, H * .45);
        // pressed-leaf shadows in the paper
        g.save(); g.globalAlpha = .07; for (let i = 0; i < 14; i++) sprig(g, hash(i + 3) * W, hash(i + 13) * H, 220, hash(i) * 6, th.lf, 1, th.round); g.restore();
        g.strokeStyle = foil(g, th, 0, 0, W, H); g.lineWidth = 2; g.strokeRect(70, 70, W - 140, H - 140);
      });
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
      text(ctx, th, D.date, cx, 1260, { z: 36, font: 'caps', color: th.ink, a: ap(lt, 1.4), ls: 4, maxW: 700 });
      text(ctx, th, [D.V, D.CITY].filter(Boolean).join(', '), cx, 1316, { z: 34, font: 'body', color: th.accent, a: ap(lt, 1.6), maxW: 700 });
      const by2 = FIN ? 1615 : 1775; figure(ctx, coupleArt(film), cx, by2, FIN ? 280 : 420, ap(lt, 1.6, 1.2), { halo: 'rgba(255,255,255,.8)' });
      sprig(ctx, cx - 140, by2 - 15, FIN ? 220 : 320, -2.4, th.lf, ease((lt - 1.6) / 1.2), th.round); sprig(ctx, cx + 140, by2 - 15, FIN ? 220 : 320, -.74, th.lf, ease((lt - 1.8) / 1.2), th.round);
    },
    panel(ctx, film, th, a) {
      const r = { x: 150, y: 330, w: W - 300, h: 1270 }; r.cx = r.x + r.w / 2;
      ctx.save(); ctx.globalAlpha *= clamp(a); ctx.fillStyle = th.paper; ctx.shadowColor = 'rgba(40,60,30,.2)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 12; ctx.beginPath(); ctx.moveTo(r.x, r.y + r.h); ctx.lineTo(r.x, r.y + r.w / 2); ctx.arc(r.cx, r.y + r.w / 2, r.w / 2, Math.PI, 0); ctx.lineTo(r.x + r.w, r.y + r.h); ctx.closePath(); ctx.fill(); ctx.shadowColor = 'transparent';
      paperIn(ctx, th.paper, r.x, r.y, r.w, r.h); ctx.strokeStyle = foil(ctx, th, r.x, r.y, r.x + r.w, r.y + r.h); ctx.lineWidth = 4; ctx.stroke(); ctx.restore();
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
      cbg(ctx, 'marquee', th, g => {
        // a theatre's velvet curtain: deep folds with a sheen on each crest, a swagged valance with gold fringe
        for (let i = 0; i < 16; i++) { const x = i * W / 16, c = g.createLinearGradient(x, 0, x + W / 16, 0); c.addColorStop(0, shade(th.bg[0], -.6)); c.addColorStop(.35, shade(th.bg[0], -.1)); c.addColorStop(.5, shade(th.bg[0], .18)); c.addColorStop(.65, shade(th.bg[0], -.1)); c.addColorStop(1, shade(th.bg[0], -.6)); g.fillStyle = c; g.fillRect(x, 0, W / 16 + 1, H); }
        grain(g, .1);
        for (let i = 0; i < 4; i++) drape(g, i * W / 4 - 10, (i + 1) * W / 4 + 10, 0, 90, mix(hex6(th.bg[0]), '#ffffff', .06));
        g.fillStyle = foil(g, th, 0, 0, W, 0); g.fillRect(0, 0, W, 22);
        for (let i = 0; i < 4; i++) { const x0 = i * W / 4; for (let k = 0; k <= 20; k++) { const u = k / 20, x = x0 + u * W / 4, y = 20 + Math.sin(u * Math.PI) * 170; g.fillStyle = foil(g, th, x - 4, y, x + 4, y + 40); g.fillRect(x - 3, y, 6, 34); g.beginPath(); g.arc(x, y + 36, 5, 0, Math.PI * 2); g.fill(); } }
        const v = g.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, H * .7); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.65)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
      });
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
      cbg(ctx, 'editorial', th, g => {
        // a broadsheet on a linen table: the sheet of newsprint, fibres and foxing, a soft shadow under it
        g.fillStyle = shade(th.bg[1], -.35); g.fillRect(0, 0, W, H); grain(g, .15);
        g.save(); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 50; g.shadowOffsetY = 16; g.fillStyle = th.bg[0]; g.fillRect(56, 150, W - 112, H - 300); g.restore();
        g.save(); g.beginPath(); g.rect(56, 150, W - 112, H - 300); g.clip(); g.translate(56, 150); paperFill(g, th.bg[0], W - 112, H - 300, 41); g.restore();
        g.save(); g.globalAlpha = .05; g.fillStyle = '#000'; for (let y = 150; y < H - 150; y += 9) for (let x = 56 + (y % 18); x < W - 56; x += 18) g.fillRect(x, y, 2, 2); g.restore();
      });
    },
    // a column of type: grey lines broken into words, the way print looks from arm's length
    column(ctx, th, x, y, w, n, a) {
      ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = th.ink;
      for (let i = 0; i < n; i++) { let xx = x; const end = i % 7 === 6 ? x + w * .55 : x + w; while (xx < end - 12) { const ww = Math.min(end - xx, 18 + hash(i * 31 + xx) * 60); ctx.globalAlpha = a * (.32 + hash(i + xx) * .12); ctx.fillRect(xx, y + i * 26, ww, 9); xx += ww + 9; } }
      ctx.restore();
    },
    page(ctx, th, D, lt, small, film) {
      const cx = W / 2, hi = D.lang === 'hi', a = s => small ? 1 : ap(lt, s);
      text(ctx, th, hi ? 'शुभ समाचार' : 'The Wedding Times', cx, 380, { z: hi ? 110 : 120, font: hi ? 'name' : 'head', color: th.ink, a: a(0), maxW: 900 });
      ctx.save(); ctx.globalAlpha = a(.1); ctx.fillStyle = th.ink; ctx.fillRect(90, 420, W - 180, 6); ctx.fillRect(90, 432, W - 180, 2); ctx.fillRect(90, 488, W - 180, 2); ctx.restore();
      text(ctx, th, `${hi ? 'अंक 1' : 'VOL. I'}  ·  ${D.date}  ·  ${hi ? 'मूल्य: आपका आशीर्वाद' : 'PRICE: YOUR BLESSINGS'}`, cx, 470, { z: 24, font: 'caps', color: th.ink, a: a(.2), maxW: 880, ls: 1 });
      text(ctx, th, who2(D, hi).toUpperCase(), cx, 650, { z: 150, font: 'name', color: th.ink, a: a(.4), maxW: 900, rise: 20 });
      text(ctx, th, D.solo ? (hi ? 'का जश्न!' : 'CELEBRATES!') : (hi ? 'विवाह बंधन में बंधेंगे!' : 'TO TIE THE KNOT!'), cx, 760, { z: 80, font: 'name', color: th.accent, a: a(.6), maxW: 900 });
      // the front-page photograph: the couple printed in sepia, a caption under it; columns of type beside
      ctx.save(); ctx.globalAlpha = a(.8); ctx.fillStyle = shade(th.bg[0], -.08); ctx.fillRect(90, 830, 440, 520);
      const tone = film && tonedArt(coupleArt(film), mix(hex6(th.ink), '#4a2e14', .45), mix(hex6(th.bg[0]), '#fff8e8', .4));
      if (tone) { ctx.save(); ctx.beginPath(); ctx.rect(96, 836, 428, 508); ctx.clip(); const iw = tone.width / SCALE, ih = tone.height / SCALE, k = 560 / ih; ctx.drawImage(tone, 310 - iw * k / 2, 1360 - ih * k, iw * k, ih * k); ctx.restore(); }
      else { ctx.fillStyle = th.accent; ctx.fillRect(90, 830, 440, 520); }
      ctx.strokeStyle = th.ink; ctx.lineWidth = 3; ctx.strokeRect(90, 830, 440, 520); ctx.restore();
      if (!tone) text(ctx, tw(th, true), D.mono, 310, 1130, { z: 150, font: 'name', color: '#fff', a: a(.9), maxW: 400 });
      text(ctx, th, hi ? 'चित्र: परिवार संग्रह' : 'The happy couple — family archive', 310, 1385, { z: 22, font: 'body', color: th.ink, a: a(.9), maxW: 440 });
      text(ctx, th, hi ? 'विशेष संवाददाता' : 'BY OUR SPECIAL CORRESPONDENT', 790, 850, { z: 20, font: 'caps', color: th.accent, a: a(.85), maxW: 420 });
      EDITORIAL.column(ctx, th, 570, 880, 420, 18, a(.9));
      text(ctx, th, `${hi ? 'स्थान' : 'VENUE'}: ${[D.V, D.CITY].filter(Boolean).join(', ')}`, cx, 1420, { z: 34, font: 'body', color: th.ink, a: a(1.1), maxW: 900 });
      ctx.save(); ctx.globalAlpha = a(1.2); ctx.fillStyle = th.ink; ctx.fillRect(90, 1460, W - 180, 2); ctx.restore();
      text(ctx, th, D.heading, cx, 1540, { z: 60, font: 'script', color: th.accent, a: a(1.3) });
    },
    open(ctx, film, th, D, sc, lt) {
      const k = ease(lt / 2.4);
      ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate((1 - k) * Math.PI * 6); ctx.scale(.08 + .92 * k, .08 + .92 * k); ctx.translate(-W / 2, -H / 2);
      ctx.fillStyle = th.paper; ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 60; ctx.fillRect(60, 260, W - 120, 1400); ctx.shadowColor = 'transparent';
      EDITORIAL.page(ctx, th, D, lt, true, film); ctx.restore();
      if (lt > 2.4) { ctx.save(); ctx.globalAlpha = ap(lt, 2.4, .3); ctx.translate(W / 2 + 230, 300); ctx.rotate(-.18); ctx.strokeStyle = th.accent; ctx.lineWidth = 6; ctx.strokeRect(-200, -60, 400, 120); ctx.restore(); text(ctx, th, D.lang === 'hi' ? 'ताज़ा ख़बर!' : 'EXTRA! EXTRA!', W / 2 + 230, 320, { z: 50, font: 'caps', color: th.accent, a: ap(lt, 2.4, .3) }); }
    },
    title(ctx, film, th, D, sc, lt) { EDITORIAL.page(ctx, th, D, lt, false, film); },
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
    const sh = Math.max(1, bottom - top);
    const P = layer(`parch|${th.paper}`, g => {
      paperFill(g, hex6(th.paper), w, 1400, 7);
      const e = g.createLinearGradient(0, 0, w, 0); e.addColorStop(0, 'rgba(110,60,10,.35)'); e.addColorStop(.1, 'rgba(110,60,10,0)'); e.addColorStop(.9, 'rgba(110,60,10,0)'); e.addColorStop(1, 'rgba(110,60,10,.35)'); g.fillStyle = e; g.fillRect(0, 0, w, 1400);
      const r = rng(5); for (let i = 0; i < 18; i++) { const fx = r() * w, fy = r() * 1400, fr = 10 + r() * 40, f = g.createRadialGradient(fx, fy, 0, fx, fy, fr); f.addColorStop(0, 'rgba(140,90,30,.12)'); f.addColorStop(1, 'rgba(140,90,30,0)'); g.fillStyle = f; g.fillRect(fx - fr, fy - fr, fr * 2, fr * 2); }
      g.strokeStyle = foil(g, th, 0, 0, w, 1400); g.lineWidth = 3; g.strokeRect(34, 60, w - 68, 1280); g.lineWidth = 1; g.strokeRect(44, 70, w - 88, 1260);
    }, w, 1400);
    if (P) { const ps = P.width / w, ch = Math.min(1400, sh); ctx.drawImage(P, 0, (1400 - ch) / 2 * ps, P.width, ch * ps, x, top, w, sh); }
    else { ctx.fillStyle = th.paper; ctx.fillRect(x, top, w, sh); }
    ctx.restore();
    [top, bottom].forEach(y => { ctx.save(); ctx.globalAlpha *= clamp(a); const r = ctx.createLinearGradient(0, y - 30, 0, y + 30); r.addColorStop(0, '#3a1e08'); r.addColorStop(.3, '#a8662a'); r.addColorStop(.5, '#e0a860'); r.addColorStop(.7, '#8a4e1c'); r.addColorStop(1, '#2a1404'); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 8; ctx.fillStyle = r; rr(ctx, x - 50, y - 30, w + 100, 60, 30); ctx.fill(); ctx.shadowColor = 'transparent';
      [x - 66, x + w + 66].forEach(fx => { ctx.fillStyle = foil(ctx, th, fx - 30, y - 40, fx + 30, y + 40); ctx.beginPath(); ctx.arc(fx, y, 34, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(fx + (fx < x ? -40 : 40), y, 16, 24, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = 'rgba(60,30,0,.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(fx, y, 22, 0, Math.PI * 2); ctx.stroke(); });
      ctx.restore(); });
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
    short: 'Farmaan', name: 'Royal Farmaan', ai: true, trans: 'fade', fx: 'sparkle',
    face: face('400 {z}px "Pinyon Script", cursive', '400 {z}px "Cinzel", serif', '400 {z}px "Cinzel", serif', 'italic 400 {z}px "Cormorant Garamond", serif', '400 {z}px "Pinyon Script", cursive'),
    pals: [P6('Maroon', true, ['#5c0f1e', '#1a0307'], GOLD, '#f3e2b8', '#4a2a10', '#9b1b30'),
      P6('Emerald', true, ['#0f4a32', '#03140d'], GOLD, '#f2e3bd', '#3a2a10', '#1b6b45'),
      P6('Indigo', true, ['#1b2560', '#05081a'], GOLD, '#f1e4c2', '#2a2410', '#2a3f9e'),
      P6('Ebony', true, ['#2a2420', '#070605'], GOLD, '#efdfb4', '#3a2810', '#7a1a1a'),
      P6('Aubergine', true, ['#4a1a4e', '#120414'], GOLD, '#f2e2c0', '#3a2414', '#7a2a7e'),
      P6('Saffron', true, ['#8a3a0c', '#240c02'], GOLD, '#f4e4bc', '#4a2a10', '#c2570e')],
    bg(ctx, th, t) {
      cbg(ctx, 'scroll', th, g => { silkBg(g, th.bg[0], th.bg[1], th.gold[1], .07); g.save(); g.globalAlpha = .05; g.strokeStyle = th.gold[1]; g.lineWidth = 2; for (let i = -H; i < W; i += 70) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + H, H); g.stroke(); g.beginPath(); g.moveTo(i + H, 0); g.lineTo(i, H); g.stroke(); } g.restore(); });
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
      if (D.sacred) figure(ctx, ganeshArt(film), cx, 395, 120, ap(lt, .1), { shadow: false });
      text(ctx, th, D.sacred ? '॥ श्री गणेशाय नमः ॥' : (hi ? 'शाही निमन्त्रण' : 'BY ROYAL INVITATION'), cx, 440, { z: 34, font: D.sacred ? 'deva' : 'caps', color: th.accent, a: ap(lt, .2), ls: 3 });
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

  // ---------- Trend concepts: what sells most in Indian e-invites right now ----------
  const goldGrad = (ctx, th, x0, y0, x1, y1) => {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, th.gold[2]); g.addColorStop(.35, th.gold[1]); g.addColorStop(.5, th.gold[0]); g.addColorStop(.65, th.gold[1]); g.addColorStop(1, th.gold[2]);
    return g;
  };
  const initials = D => D.solo ? D.A.slice(0, 1) : `${D.A.slice(0, 1)}${D.B.slice(0, 1)}`;
  // Two laurel branches hugging a circle, leaf by leaf as k goes 0 → 1
  function laurel(ctx, th, cx, cy, r, k) {
    if (k <= 0) return;
    ctx.save(); ctx.fillStyle = goldGrad(ctx, th, cx - r, cy - r, cx + r, cy + r);
    const n = 12;
    for (const side of [-1, 1]) for (let i = 0; i < n * k; i++) {
      const ang = Math.PI / 2 + side * (.42 + i * .19), x = cx + Math.cos(ang) * r, y = cy + Math.sin(ang) * r;
      ctx.save(); ctx.translate(x, y); ctx.rotate(ang + Math.PI / 2 + side * .55);
      ctx.beginPath(); ctx.ellipse(side * 14, 0, 24, 9, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    ctx.restore();
  }
  function crest(ctx, th, D, cx, cy, r, k, lt) {
    if (k <= 0) return;
    ctx.save(); ctx.strokeStyle = goldGrad(ctx, th, cx - r, cy - r, cx + r, cy + r); ctx.lineWidth = Math.max(3, r * .035);
    ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ease(k)); ctx.stroke();
    ctx.lineWidth = Math.max(1.5, r * .015); ctx.beginPath(); ctx.arc(cx, cy, r * .88, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ease(k)); ctx.stroke();
    ctx.restore();
    laurel(ctx, th, cx, cy, r * 1.18, (k - .4) / .6);
    const s = initials(D);
    text(ctx, th, s.length > 1 ? `${s[0]}·${s[1]}` : s, cx, cy + r * .28, { z: r * (s.length > 1 ? .62 : .9), font: 'name', color: 'gold', a: ap(lt, .9), maxW: r * 1.6 });
  }
  const MONOGRAM = {
    short: 'Monogram', name: 'Monogram Luxe', trans: 'fade', fx: 'sparkle',
    face: face('700 {z}px "Playfair Display", serif', '400 {z}px "Cinzel", serif', '400 {z}px "Cinzel", serif', 'italic 400 {z}px "Cormorant Garamond", serif', '400 {z}px "Pinyon Script", cursive'),
    pals: [P6('Noir', true, ['#161616', '#050505'], GOLD, '#1b1b1b', '#f5efe2', '#d9b25e'),
      P6('Ivory', false, ['#fbf7ef', '#efe5d1'], GOLD, '#fffdf8', '#2b2216', '#a37a2c'),
      P6('Emerald', true, ['#0e3d2f', '#03140f'], GOLD, '#10392c', '#f4ecd8', '#e2bf6a'),
      P6('Midnight', true, ['#14213f', '#050a17'], GOLD, '#16223f', '#f2ecdc', '#e0bd6c'),
      P6('Blush', false, ['#fcf0ec', '#f1dad3'], ROSE, '#fffaf8', '#3c2420', '#a5604a'),
      P6('Wine', true, ['#4a0f20', '#13030a'], GOLD, '#460e1e', '#f6ebdc', '#e3b866')],
    bg(ctx, th, t) {
      cbg(ctx, 'monogram', th, g => {
        if (th.dark) silkBg(g, th.bg[0], th.bg[1], th.gold[1], 0);
        else {
          // white marble: soft grey veins that wander and branch
          const b = g.createRadialGradient(W / 2, H * .42, 80, W / 2, H / 2, H * .8); b.addColorStop(0, th.bg[0]); b.addColorStop(1, th.bg[1]); g.fillStyle = b; g.fillRect(0, 0, W, H);
          const r = rng(77);
          for (let v = 0; v < 9; v++) { let x = r() * W, y = -50, a = Math.PI / 2 + (r() - .5); g.strokeStyle = `rgba(120,110,100,${.08 + r() * .12})`; g.lineWidth = .8 + r() * 2.4; g.beginPath(); g.moveTo(x, y); while (y < H + 50) { a += (r() - .5) * .5; x += Math.cos(a) * 18; y += Math.abs(Math.sin(a)) * 18 + 4; g.lineTo(x, y); } g.stroke(); }
          grain(g, .05);
        }
        g.save(); g.globalAlpha = th.dark ? .06 : .07; g.strokeStyle = th.gold[1]; g.lineWidth = 1.5;
        for (let y = 0; y < H + 90; y += 90) for (let x = (y / 90 % 2) * 45; x < W + 90; x += 90) { g.beginPath(); g.moveTo(x, y - 20); g.lineTo(x + 14, y); g.lineTo(x, y + 20); g.lineTo(x - 14, y); g.closePath(); g.stroke(); }
        g.restore();
        g.strokeStyle = foil(g, th, 0, 0, W, H); g.lineWidth = 6; g.strokeRect(44, 44, W - 88, H - 88); g.lineWidth = 1.5; g.strokeRect(62, 62, W - 124, H - 124);
        filigreeCorners(g, th, 62, 62, W - 124, H - 124, 120, 1, 12);
      });
    },
    open(ctx, film, th, D, sc, lt) {
      crest(ctx, th, D, W / 2, H / 2 - 80, 230, lt / 1.6, lt);
      text(ctx, th, D.heading.toUpperCase(), W / 2, H / 2 + 300, { z: 34, font: 'caps', color: th.ink, a: ap(lt, 1.8), ls: 6 });
      text(ctx, th, D.lang === 'hi' ? 'आपको सादर आमंत्रित करते हैं' : 'request the pleasure of your company', W / 2, H / 2 + 370, { z: 40, font: 'body', color: th.accent, a: ap(lt, 2.2) });
    },
    title(ctx, film, th, D, sc, lt) {
      const cx = W / 2, hi = D.lang === 'hi';
      crest(ctx, th, D, cx, 380, 110, 1, 99);
      text(ctx, th, hi ? D.heading : D.heading.toUpperCase(), cx, 640, { z: 34, font: 'caps', color: th.accent, a: ap(lt, .2), ls: 6 });
      if (D.solo) text(ctx, th, D.A, cx, 900, { z: 150, font: 'name', color: th.ink, a: ap(lt, .5), rise: 30 });
      else {
        text(ctx, th, D.A, cx, 830, { z: 130, font: 'name', color: th.ink, a: ap(lt, .5), rise: 30 });
        text(ctx, th, hi ? 'संग' : '&', cx, 965, { z: hi ? 60 : 96, font: hi ? 'caps' : 'name', color: 'gold', a: ap(lt, .8) });
        text(ctx, th, D.B, cx, 1110, { z: 130, font: 'name', color: th.ink, a: ap(lt, 1.1), rise: 30 });
      }
      const k = ap(lt, 1.3, 1);
      ctx.save(); ctx.strokeStyle = goldGrad(ctx, th, cx - 260, 0, cx + 260, 0); ctx.lineWidth = 2.5; ctx.globalAlpha = k;
      ctx.beginPath(); ctx.moveTo(cx - 260 * k, 1210); ctx.lineTo(cx - 22, 1210); ctx.moveTo(cx + 22, 1210); ctx.lineTo(cx + 260 * k, 1210); ctx.stroke();
      ctx.fillStyle = th.gold[1]; ctx.beginPath(); ctx.moveTo(cx, 1196); ctx.lineTo(cx + 12, 1210); ctx.lineTo(cx, 1224); ctx.lineTo(cx - 12, 1210); ctx.closePath(); ctx.fill(); ctx.restore();
      text(ctx, th, D.date, cx, 1300, { z: 44, font: 'caps', color: th.ink, a: ap(lt, 1.5), ls: 2 });
      text(ctx, th, [D.V, D.CITY].filter(Boolean).join(', '), cx, 1370, { z: 40, font: 'body', color: th.accent, a: ap(lt, 1.7) });
      // the couple stamped in gold foil, like an engraved keepsake
      const tone = tonedArt(coupleArt(film), hex6(th.gold[2]), hex6(th.gold[0]));
      if (tone) { const iw = tone.width / SCALE, ih = tone.height / SCALE, k = (FIN ? 190 : 330) / ih; ctx.save(); ctx.globalAlpha = ap(lt, 1.8, 1.2) * .95; ctx.drawImage(tone, cx - iw * k / 2, 1440, iw * k, ih * k); ctx.restore(); }
    },
    panel(ctx, film, th, a) {
      const r = { x: 110, y: 270, w: W - 220, h: 1380 }; r.cx = r.x + r.w / 2;
      ctx.save(); ctx.globalAlpha *= clamp(a); ctx.fillStyle = th.paper; ctx.globalAlpha *= .92; ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.globalAlpha = clamp(a); ctx.strokeStyle = goldGrad(ctx, th, r.x, r.y, r.x + r.w, r.y + r.h); ctx.lineWidth = 3; ctx.strokeRect(r.x + 18, r.y + 18, r.w - 36, r.h - 36);
      ctx.lineWidth = 1.2; ctx.strokeRect(r.x + 30, r.y + 30, r.w - 60, r.h - 60); ctx.restore();
      return r;
    },
    day(ctx, film, th, D, sc, lt) {
      const b = dateBits(D, sc), cx = W / 2;
      crest(ctx, th, D, cx, 330, 80, 1, 99);
      text(ctx, th, dayLabel(D, sc), cx, 530, { z: 36, font: 'caps', color: th.accent, a: ap(lt, .1), ls: 6 });
      text(ctx, th, b.d, cx, 800, { z: 260, font: 'name', color: 'gold', a: ap(lt, .3), rise: 40 });
      text(ctx, th, `${b.m} · ${b.wd}`, cx, 880, { z: 40, font: 'caps', color: th.ink, a: ap(lt, .5), ls: 4 });
      rows(ctx, th, sc.day, 170, 1040, W - 340, lt, { z: 62, gap: 140, start: .7, col: th.ink, tcol: th.accent });
    }
  };

  // Mughal / Rajasthani palace window: an ogee arch with a lobed crown
  function archPath(ctx, x, y, w, h) {
    const cx = x + w / 2, spring = y + w * .5;
    ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x, spring);
    ctx.bezierCurveTo(x, spring - w * .3, cx - w * .14, y + w * .14, cx, y);
    ctx.bezierCurveTo(cx + w * .14, y + w * .14, x + w, spring - w * .3, x + w, spring);
    ctx.lineTo(x + w, y + h); ctx.closePath();
  }
  function jaali(ctx, th, x, y, w, h, col, a = .5) {
    ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = col; ctx.lineWidth = 2;
    const s = 46;
    for (let yy = y; yy < y + h; yy += s) for (let xx = x; xx < x + w; xx += s) {
      ctx.beginPath(); ctx.arc(xx + s / 2, yy + s / 2, s * .32, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(xx + s / 2, yy); ctx.lineTo(xx + s, yy + s / 2); ctx.lineTo(xx + s / 2, yy + s); ctx.lineTo(xx, yy + s / 2); ctx.closePath(); ctx.stroke();
    }
    ctx.restore();
  }
  function palaceArch(ctx, th, x, y, w, h, a = 1) {
    ctx.save(); ctx.globalAlpha *= clamp(a);
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20;
    archPath(ctx, x - 26, y - 26, w + 52, h + 52); ctx.fillStyle = foil(ctx, th, x, y, x + w * .7, y + h); ctx.fill(); ctx.restore();
    ctx.strokeStyle = 'rgba(60,30,0,.5)'; ctx.lineWidth = 2; archPath(ctx, x - 12, y - 12, w + 24, h + 24); ctx.stroke();
    archPath(ctx, x, y, w, h); ctx.fillStyle = th.paper; ctx.fill(); paperIn(ctx, th.paper, x, y, w, h);
    ctx.strokeStyle = th.accent; ctx.lineWidth = 3; archPath(ctx, x + 18, y + 26, w - 36, h - 44); ctx.stroke();
    // the little lobed crown on top
    ctx.fillStyle = th.gold[1]; ctx.beginPath(); ctx.arc(x + w / 2, y - 34, 16, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + w / 2, y - 92); ctx.lineTo(x + w / 2 + 10, y - 52); ctx.lineTo(x + w / 2 - 10, y - 52); ctx.closePath(); ctx.fill();
    ctx.restore();
    return { x: x + 40, y: y + w * .32, w: w - 80, h: h - w * .32 - 30, cx: x + w / 2 };
  }
  const JHAROKHA = {
    short: 'Jharokha', name: 'Palace Jharokha', ai: true, trans: 'zoom', fx: 'lanterns',
    face: face('400 {z}px "Great Vibes", cursive', '700 {z}px "Cinzel Decorative", serif', '400 {z}px "Marcellus", serif', 'italic 400 {z}px "Cormorant Garamond", serif', '400 {z}px "Great Vibes", cursive'),
    pals: [P6('Peacock', true, ['#0b3a4a', '#02121a'], GOLD, '#f6ead2', '#1e2a2e', '#0f6b7a'),
      P6('Rani', true, ['#5a0f3c', '#1a0312'], GOLD, '#f8e9dc', '#3a1028', '#b0185a'),
      P6('Marigold', true, ['#7a3b05', '#211002'], GOLD, '#fbedd2', '#3a1f06', '#c0620a'),
      P6('Sandstone', false, ['#f4e6cf', '#e3cba5'], GOLD, '#fff8ec', '#3a2a14', '#9a4f16'),
      P6('Jade', true, ['#0f4a3a', '#031711'], GOLD, '#f2ecd6', '#1d2e26', '#1f7a5e'),
      P6('Dusk', true, ['#3b1d3d', '#100510'], GOLD, '#f7e8ee', '#2e1630', '#a5487a')],
    bg(ctx, th, t) {
      cbg(ctx, 'jharokha', th, g => {
        silkBg(g, th.bg[0], th.bg[1], th.gold[1], .03, W, H, !th.dark);
        // three storeys of small jharokhas, each glowing with a lamp inside, a carved band between storeys
        for (let row = 0; row < 4; row++) {
          const y = 120 + row * 470;
          g.fillStyle = foil(g, th, 0, y + 380, W, y + 400); g.globalAlpha = .55; g.fillRect(0, y + 384, W, 14); g.globalAlpha = 1;
          for (let i = 0; i < 5; i++) {
            const x = 20 + i * 220, glow = g.createRadialGradient(x + 80, y + 260, 10, x + 80, y + 230, 200);
            glow.addColorStop(0, th.dark ? 'rgba(255,200,110,.55)' : 'rgba(255,255,240,.9)'); glow.addColorStop(1, th.dark ? 'rgba(255,160,60,.05)' : 'rgba(255,240,200,.2)');
            archPath(g, x, y + 90, 160, 280); g.fillStyle = glow; g.fill();
            g.save(); g.clip(); jaali(g, th, x, y + 90, 160, 280, th.dark ? th.gold[2] : th.gold[1], .35); g.restore();
            g.lineWidth = 6; g.strokeStyle = foil(g, th, x, y, x + 160, y + 370); archPath(g, x, y + 90, 160, 280); g.stroke();
            g.fillStyle = th.gold[1]; g.beginPath(); g.ellipse(x + 80, y + 80, 34, 18, 0, Math.PI, 0); g.fill();
          }
        }
        const v = g.createRadialGradient(W / 2, H * .5, H * .25, W / 2, H * .5, H * .7); v.addColorStop(0, rgba(hex6(th.bg[1]), .55)); v.addColorStop(1, rgba(hex6(th.bg[1]), .85)); g.fillStyle = v; g.fillRect(0, 0, W, H);
        grain(g, .06);
      });
    },
    open(ctx, film, th, D, sc, lt) {
      const x = 170, y = 380, w = W - 340, h = 1200;
      const r = palaceArch(ctx, th, x, y, w, h, ap(lt, 0, .5));
      text(ctx, th, D.lang === 'hi' ? 'शुभ विवाह' : D.heading.toUpperCase(), W / 2, r.y + 260, { z: 40, font: 'caps', color: th.accent, a: ap(lt, 1.6), ls: 4, maxW: r.w });
      text(ctx, th, who2(D, D.lang === 'hi'), W / 2, r.y + 460, { z: 120, font: 'name', color: th.ink, a: ap(lt, 1.9), maxW: r.w });
      // the two carved shutters swing open
      const k = ease((lt - .5) / 1.4), half = w / 2;
      ctx.save(); archPath(ctx, x, y, w, h); ctx.clip();
      for (const side of [-1, 1]) {
        const sw = half * (1 - k); if (sw < 2) continue;
        const sx = side < 0 ? x : x + w - sw;
        ctx.fillStyle = th.accent; ctx.fillRect(sx, y - 40, sw, h + 80);
        jaali(ctx, th, sx, y - 40, sw, h + 80, th.gold[0], .55);
        ctx.fillStyle = shade(th.accent, -.4); ctx.fillRect(side < 0 ? sx + sw - 8 : sx, y - 40, 8, h + 80);
      }
      ctx.restore();
    },
    title(ctx, film, th, D, sc, lt) {
      const r = palaceArch(ctx, th, 130, 300, W - 260, 1250), cx = W / 2, hi = D.lang === 'hi';
      text(ctx, th, D.sacred ? '॥ श्री गणेशाय नमः ॥' : (hi ? D.heading : D.heading.toUpperCase()), cx, r.y + 120, { z: 34, font: D.sacred ? 'deva' : 'caps', color: th.accent, a: ap(lt, .2), ls: 3, maxW: r.w });
      if (D.solo) text(ctx, th, D.A, cx, r.y + 420, { z: 160, font: 'name', color: th.ink, a: ap(lt, .5), maxW: r.w });
      else {
        text(ctx, th, D.A, cx, r.y + 350, { z: 140, font: 'name', color: th.ink, a: ap(lt, .5), maxW: r.w });
        text(ctx, th, hi ? 'संग' : 'weds', cx, r.y + 450, { z: 44, font: 'caps', color: th.accent, a: ap(lt, .8), ls: 4 });
        text(ctx, th, D.B, cx, r.y + 600, { z: 140, font: 'name', color: th.ink, a: ap(lt, 1.1), maxW: r.w });
      }
      jaali(ctx, th, r.x + 60, r.y + 660, r.w - 120, 46, th.accent, .35 * ap(lt, 1.3));
      text(ctx, th, D.date, cx, r.y + 800, { z: 42, font: 'caps', color: th.ink, a: ap(lt, 1.5), ls: 2, maxW: r.w });
      text(ctx, th, [D.V, D.CITY].filter(Boolean).join(' · '), cx, r.y + 870, { z: 38, font: 'body', color: th.accent, a: ap(lt, 1.7), maxW: r.w });
    },
    panel(ctx, film, th, a) { const r = palaceArch(ctx, th, 120, 250, W - 240, 1430, a); return { x: r.x - 10, y: 250 + 200, w: r.w + 20, h: 1180, cx: r.cx }; },
    day(ctx, film, th, D, sc, lt) {
      const b = dateBits(D, sc), r = palaceArch(ctx, th, 140, 300, W - 280, 1380), cx = W / 2;
      text(ctx, th, dayLabel(D, sc), cx, r.y + 110, { z: 38, font: 'caps', color: th.accent, a: ap(lt, .1), ls: 4, maxW: r.w });
      text(ctx, th, b.d, cx, r.y + 330, { z: 220, font: 'head', color: th.ink, a: ap(lt, .3), rise: 30 });
      text(ctx, th, `${b.m} · ${b.wd}`, cx, r.y + 410, { z: 40, font: 'caps', color: th.accent, a: ap(lt, .5), ls: 4 });
      rows(ctx, th, sc.day, r.x + 20, r.y + 560, r.w - 40, lt, { z: 78, gap: 165, align: 'center', col: th.ink, tcol: th.accent, start: .7 });
    }
  };

  // South Indian temple: a diya that flickers, kolam, a gopuram, a zig-zag temple border
  function diya(ctx, th, x, y, s, lt, k = 1) {
    if (k <= 0) return;
    ctx.save(); ctx.globalAlpha *= clamp(k);
    const fl = 1 + Math.sin(lt * 11 + x) * .08 + Math.sin(lt * 17) * .05;
    const glow = ctx.createRadialGradient(x, y - s * .9, 2, x, y - s * .9, s * 2.4); glow.addColorStop(0, 'rgba(255,200,90,.55)'); glow.addColorStop(1, 'rgba(255,200,90,0)');
    ctx.fillStyle = glow; ctx.fillRect(x - s * 2.5, y - s * 3.4, s * 5, s * 5);
    ctx.fillStyle = goldGrad(ctx, th, x - s, y, x + s, y + s * .6);
    ctx.beginPath(); ctx.moveTo(x - s, y); ctx.quadraticCurveTo(x, y + s * 1.05, x + s, y); ctx.quadraticCurveTo(x + s * .55, y - s * .12, x + s * 1.2, y - s * .28); ctx.lineTo(x - s, y); ctx.closePath(); ctx.fill();
    ctx.translate(x + s * .1, y - s * .08); ctx.scale(1, fl);
    const f = ctx.createLinearGradient(0, -s * 1.4, 0, 0); f.addColorStop(0, '#fff6c8'); f.addColorStop(.5, '#ffb23b'); f.addColorStop(1, '#e8541c');
    ctx.fillStyle = f; ctx.beginPath(); ctx.moveTo(0, -s * 1.4); ctx.bezierCurveTo(s * .45, -s * .7, s * .32, 0, 0, 0); ctx.bezierCurveTo(-s * .32, 0, -s * .45, -s * .7, 0, -s * 1.4); ctx.fill();
    ctx.restore();
  }
  function templeBorder(ctx, th, y, flip, a = 1) {
    ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = goldGrad(ctx, th, 0, y, W, y);
    const s = 54;
    ctx.fillRect(0, flip ? y : y - 10, W, 10);
    for (let x = 0; x < W + s; x += s) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + s / 2, y + (flip ? -s * .6 : s * .6)); ctx.lineTo(x + s, y); ctx.closePath(); ctx.fill(); }
    ctx.globalAlpha *= .9; for (let x = s / 2; x < W; x += s) { ctx.beginPath(); ctx.arc(x, y + (flip ? -s * .95 : s * .95), 6, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }
  function gopuram(ctx, th, cx, base, w, a) {
    ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = th.gold[1];
    let ww = w, y = base;
    for (let i = 0; i < 6; i++) { const hh = 70 - i * 4, top = ww * .86; ctx.beginPath(); ctx.moveTo(cx - ww / 2, y); ctx.lineTo(cx - top / 2, y - hh); ctx.lineTo(cx + top / 2, y - hh); ctx.lineTo(cx + ww / 2, y); ctx.closePath(); ctx.fill(); y -= hh + 6; ww = top * .92; }
    ctx.beginPath(); ctx.ellipse(cx, y - 24, ww * .6, 30, 0, Math.PI, 0); ctx.fill();
    ctx.fillRect(cx - 4, y - 90, 8, 40);
    ctx.restore();
  }
  function kolam(ctx, th, cx, cy, r, k) {
    if (k <= 0) return;
    ctx.save(); ctx.fillStyle = th.paper; ctx.globalAlpha = .9 * clamp(k * 2);
    for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) if (Math.abs(i) + Math.abs(j) <= 3) { ctx.beginPath(); ctx.arc(cx + i * r / 2.5, cy + j * r / 2.5, 6, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = th.paper; ctx.lineWidth = 4; ctx.globalAlpha = .85;
    const n = Math.floor(clamp((k - .2) / .8) * 8);
    for (let i = 0; i < n; i++) { ctx.save(); ctx.translate(cx, cy); ctx.rotate(i * Math.PI / 4); ctx.beginPath(); ctx.ellipse(0, -r * .55, r * .2, r * .5, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
    ctx.restore();
  }
  const TEMPLE = {
    short: 'Temple', name: 'Temple Gold', ai: true, trans: 'fade', fx: 'sparkle',
    face: face('700 {z}px "Cinzel Decorative", serif', '400 {z}px "Cinzel", serif', '400 {z}px "Cinzel", serif', '400 {z}px "Marcellus", serif', '400 {z}px "Great Vibes", cursive'),
    pals: [P6('Kumkum', true, ['#5e0b0b', '#1c0202'], GOLD, '#fff1d6', '#f8ecd0', '#f0b429'),
      P6('Banana Leaf', true, ['#0f3d1c', '#03130a'], GOLD, '#fff1d6', '#f4ecd2', '#e6b422'),
      P6('Turmeric', true, ['#7a4a00', '#231500'], GOLD, '#fff3d8', '#fbf0d6', '#ffcf4a'),
      P6('Kanjivaram', true, ['#4a0d4a', '#150315'], GOLD, '#fff0dc', '#f7ead6', '#e9b23a'),
      P6('Sandal', false, ['#fbf1dc', '#efdcb4'], GOLD, '#7a3b05', '#3f2008', '#a0520b'),
      P6('Temple Night', true, ['#141a3a', '#050714'], GOLD, '#fff1d6', '#f2ecdc', '#f0b429')],
    bg(ctx, th, t) {
      cbg(ctx, 'temple', th, g => {
        silkBg(g, th.bg[0], th.bg[1], th.gold[1], .045, W, H, !th.dark);
        gopuram(g, th, W / 2, H - 120, 760, th.dark ? .16 : .2);
        // little niches in the gopuram's tiers
        g.save(); g.globalAlpha = th.dark ? .18 : .2; g.fillStyle = th.bg[1]; let ww = 760, yy = H - 120;
        for (let i = 0; i < 6; i++) { const hh = 70 - i * 4, n = 7 - i; for (let k = 0; k < n; k++) { archPath(g, W / 2 - ww * .4 + k * ww * .8 / Math.max(1, n - 1) - 12, yy - hh + 14, 24, hh - 22); g.fill(); } yy -= hh + 6; ww *= .79; }
        g.restore();
        templeBorder(g, th, 70, false, .95);
        templeBorder(g, th, H - 70, true, .95);
        // brass bells hanging from the top border
        for (let i = 0; i < 6; i++) { const x = 110 + i * 172, len = 70 + (i % 2) * 50; g.strokeStyle = foil(g, th, x - 2, 0, x + 2, len); g.lineWidth = 3; g.beginPath(); g.moveTo(x, 100); g.lineTo(x, 100 + len); g.stroke(); g.save(); g.translate(x, 100 + len); g.scale(1.6, 1.6); g.translate(-x, -(100 + len)); bell(g, th, x, 100 + len); g.restore(); }
        grain(g, .05);
      });
    },
    open(ctx, film, th, D, sc, lt) {
      kolam(ctx, th, W / 2, H / 2 - 120, 300, lt / 1.6);
      diya(ctx, th, W / 2 - 300, H / 2 + 330, 60, lt, ap(lt, .3));
      diya(ctx, th, W / 2 + 300, H / 2 + 330, 60, lt, ap(lt, .6));
      text(ctx, th, D.sacred || D.lang === 'hi' ? '॥ शुभ मंगल ॥' : 'WITH THE BLESSINGS OF THE DIVINE', W / 2, H / 2 + 420, { z: 34, font: D.sacred || D.lang === 'hi' ? 'deva' : 'caps', color: th.accent, a: ap(lt, 1.5), ls: 2 });
      text(ctx, th, who2(D, D.lang === 'hi'), W / 2, H / 2 + 560, { z: 110, font: 'name', color: 'gold', a: ap(lt, 1.9), maxW: 860 });
    },
    title(ctx, film, th, D, sc, lt) {
      const cx = W / 2, hi = D.lang === 'hi';
      text(ctx, th, D.sacred ? '॥ श्री गणेशाय नमः ॥' : (hi ? '॥ शुभ विवाह ॥' : '— AUSPICIOUS INVITATION —'), cx, 330, { z: 36, font: D.sacred || hi ? 'deva' : 'caps', color: th.accent, a: ap(lt, .2), ls: 2 });
      text(ctx, th, hi ? D.heading : D.heading.toUpperCase(), cx, 440, { z: 46, font: 'caps', color: th.ink, a: ap(lt, .4), ls: 3 });
      if (D.solo) text(ctx, th, D.A, cx, 760, { z: 150, font: 'name', color: 'gold', a: ap(lt, .6), glow: 18 });
      else {
        text(ctx, th, D.A, cx, 700, { z: 128, font: 'name', color: 'gold', a: ap(lt, .6), glow: 18 });
        text(ctx, th, hi ? 'संग' : 'with', cx, 810, { z: 48, font: 'script', color: th.ink, a: ap(lt, .9) });
        text(ctx, th, D.B, cx, 950, { z: 128, font: 'name', color: 'gold', a: ap(lt, 1.1), glow: 18 });
      }
      diya(ctx, th, cx - 340, 1110, 46, lt, ap(lt, 1.2)); diya(ctx, th, cx, 1110, 46, lt, ap(lt, 1.35)); diya(ctx, th, cx + 340, 1110, 46, lt, ap(lt, 1.5));
      text(ctx, th, D.date, cx, 1250, { z: 44, font: 'caps', color: th.ink, a: ap(lt, 1.6), ls: 2 });
      text(ctx, th, [D.V, D.CITY].filter(Boolean).join(' · '), cx, 1315, { z: 40, font: 'body', color: th.accent, a: ap(lt, 1.8) });
      // Ganesh ji (or the couple) in the temple's doorway, lit by the lamps
      figure(ctx, D.sacred ? ganeshArt(film) : coupleArt(film), cx, FIN ? 1630 : 1790, (D.sacred ? 380 : 420) * (FIN ? .7 : 1), ap(lt, 1.6, 1.2), { halo: 'rgba(255,205,120,.5)', shadow: !D.sacred });
    },
    panel(ctx, film, th, a) {
      const r = { x: 110, y: 270, w: W - 220, h: 1380 }; r.cx = r.x + r.w / 2;
      ctx.save(); ctx.globalAlpha *= clamp(a);
      ctx.fillStyle = th.dark ? 'rgba(0,0,0,.35)' : 'rgba(255,255,255,.55)'; ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeStyle = goldGrad(ctx, th, r.x, r.y, r.x + r.w, r.y + r.h); ctx.lineWidth = 4; ctx.strokeRect(r.x + 14, r.y + 14, r.w - 28, r.h - 28);
      ctx.fillStyle = th.gold[1]; for (const [qx, qy] of [[r.x + 14, r.y + 14], [r.x + r.w - 14, r.y + 14], [r.x + 14, r.y + r.h - 14], [r.x + r.w - 14, r.y + r.h - 14]]) { ctx.beginPath(); ctx.arc(qx, qy, 12, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
      return r;
    },
    day(ctx, film, th, D, sc, lt) {
      const b = dateBits(D, sc), cx = W / 2;
      text(ctx, th, dayLabel(D, sc), cx, 300, { z: 40, font: 'caps', color: th.accent, a: ap(lt, .1), ls: 4 });
      kolam(ctx, th, cx, 500, 110, ap(lt, .2, 1.2));
      text(ctx, th, b.d, cx, 800, { z: 170, font: 'name', color: 'gold', a: ap(lt, .5), glow: 16 });
      text(ctx, th, `${b.m} · ${b.wd}`, cx, 890, { z: 40, font: 'caps', color: th.ink, a: ap(lt, .6), ls: 4 });
      rows(ctx, th, sc.day, 170, 1040, W - 340, lt, { z: 66, gap: 145, start: .8, col: th.ink, tcol: th.accent });
      diya(ctx, th, cx, 1640, 44, lt, ap(lt, 1));
    }
  };

  const CONCEPTS = { minimal: MINIMAL, floral: FLORAL, cinema: CINEMA, deco: DECO, polaroid: POLAROID, neon: NEON, rangoli: RANGOLI, botanical: BOTANICAL, marquee: MARQUEE, editorial: EDITORIAL, scroll: SCROLL, monogram: MONOGRAM, jharokha: JHAROKHA, temple: TEMPLE };
  const CONCEPT_OCC = {
    minimal: ['wedding', 'engagement', 'reception', 'anniversary', 'wedding'],
    floral: ['wedding', 'mehendi', 'babyshower', 'engagement', 'haldi'],
    cinema: ['wedding', 'reception', 'engagement', 'anniversary', 'sangeet'],
    deco: ['reception', 'anniversary', 'wedding', 'engagement', 'sangeet'],
    polaroid: ['engagement', 'birthday', 'anniversary', 'babyshower', 'wedding'],
    neon: ['birthday', 'sangeet', 'reception', 'birthday', 'engagement'],
    rangoli: ['wedding', 'haldi', 'mehendi', 'housewarming', 'puja'],
    botanical: ['wedding', 'engagement', 'haldi', 'babyshower', 'reception'],
    marquee: ['wedding', 'sangeet', 'reception', 'birthday', 'engagement'],
    editorial: ['wedding', 'engagement', 'anniversary', 'birthday', 'reception'],
    scroll: ['wedding', 'engagement', 'puja', 'housewarming', 'reception'],
    monogram: ['wedding', 'engagement', 'reception', 'anniversary', 'wedding'],
    jharokha: ['wedding', 'sangeet', 'mehendi', 'reception', 'engagement'],
    temple: ['wedding', 'puja', 'housewarming', 'naming', 'engagement']
  };
  const themeOf = film => film.custom || (film.concept && CONCEPTS[film.concept] ? CONCEPTS[film.concept].pals[film.pal] : THEMES[film.theme]);

  // ---------- A film in the card's own colours (the Auto Video Studio) ----------
  // tone = { h: 0-360, s: 0-1, dark: true|false, word: 'Emerald', gold: 'gold' | 'rose' | 'silver' }, read from the card's PDF.
  // Every colour of the film's palette keeps its lightness (so the design keeps its contrast and stays readable);
  // its hue moves to the card's colour and its strength follows the card's. Creams, whites and greys stay as they are.
  const hexHsl = hex => {
    const n = parseInt(hex.slice(1), 16), r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
    if (!d) return [0, 0, l];
    const s = d / (1 - Math.abs(2 * l - 1));
    const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [(h * 60 + 360) % 360, s, l];
  };
  const hslHex = (h, s, l) => {
    const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
    const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
    return '#' + [r, g, b].map(v => Math.round((v + m) * 255).toString(16).padStart(2, '0')).join('');
  };
  function tintTheme(th, tone) {
    const t = c => {
      if (typeof c !== 'string' || !/^#[0-9a-f]{6}$/i.test(c)) return c;
      const [h, s, l] = hexHsl(c);
      if (s < .12 || l > .97) return c; // whites and greys
      if (l > .86 && h >= 25 && h <= 60) return c; // creams and ivory paper
      const ns = tone.s < .14 ? s * .18 : clamp(s * .55 + tone.s * .6, .3, 1);
      return hslHex(tone.h, ns, l);
    };
    const gold = tone.gold === 'rose' ? ROSE : tone.gold === 'silver' ? SILVER : th.gold;
    const out = { ...th, word: tone.word, gold };
    // every colour of the palette (flowers, lights, days…) follows, except the gold work, the paper and green leaves
    for (const [k, v] of Object.entries(th)) {
      if (['word', 'dark', 'gold', 'paper', 'leaf'].includes(k)) continue;
      out[k] = Array.isArray(v) ? v.map(t) : t(v);
    }
    return out;
  }
  // The film's palette nearest to the card (light or dark first, then the closest colour) as the starting point
  function nearestPal(pals, tone) {
    const dist = p => { const [h, s] = hexHsl(p.bg[0]); const dh = Math.min(Math.abs(h - tone.h), 360 - Math.abs(h - tone.h)) / 180; return (p.dark === tone.dark ? 0 : 2) + dh + Math.abs(s - tone.s) * .3; };
    return pals.slice().sort((a, b) => dist(a) - dist(b))[0];
  }
  function recolour(film, tone) {
    const f = typeof film === 'string' ? byId[film] : film;
    const C = f.concept && CONCEPTS[f.concept];
    const base = C ? nearestPal(C.pals, tone) : nearestPal(Object.values(THEMES), tone);
    const short = C ? C.short : FRAMES[f.frame];
    return { ...f, id: `${f.id}~card`, name: `${tone.word} ${short}`, custom: tintTheme(base, tone), fromCard: true };
  }
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
    FIN = true; try { C.title(ctx, film, th, D, sc, lt); } finally { FIN = false; }
    credit(ctx, th, D, lt, 1690, th.dark ? '#fff' : th.accent);
  }

  // ---------- The player ----------
  // Which painted stage and which figure a function's day screen takes
  function stageKind(film, fn) {
    if (fn === 'wedding' && film.occ !== 'wedding') return 'reception';
    if (fn === 'family' && film.occ === 'birthday') return 'sangeet';
    return fn;
  }
  function dayArt(film, fn) {
    const own = ART_OF[film.occ] || 'wedding', n = film.cast;
    const kind = { haldi: 'haldi', mehendi: 'mehendi', sangeet: film.occ === 'sangeet' || film.occ === 'wedding' ? 'sangeet' : own, baraat: 'wedding', ganesh: 'ganesha',
      wedding: own, reception: film.occ === 'wedding' ? 'reception' : own, family: own, vidai: 'wedding' }[fn] || own;
    return pickArt(kind, n + (kind === own ? 0 : 1));
  }
  const coupleArt = film => pickArt(ART_OF[film.occ] || 'wedding', film.cast);
  const ganeshArt = film => pickArt('ganesha', film.cast);
  // every picture a film may show, loaded when it is set
  function filmArt(film, P) {
    const ids = new Set([coupleArt(film)]);
    if (P.D.sacred) ids.add(ganeshArt(film));
    P.scenes.forEach(sc => { if (sc.k === 'day') ids.add(dayArt(film, sceneFn(film, P.D, sc))); });
    return [...ids].map(artSrc);
  }
  let AI_ON = false, FIN = false; // FIN: a names screen drawn again as the finale (its art steps up to leave room for the signature) // an AI picture is filling the scene (the painted stage and figure step back)
  function drawScene(ctx, film, th, P, sc, lt) {
    const C = CONCEPTS[film.concept];
    FACE = C ? C.face : FACE0;
    // a slow camera push through every scene
    const z = 1 + .028 * ease(clamp(lt / sc.d)), cy = H * .46;
    ctx.save(); ctx.translate(W / 2, cy); ctx.scale(z, z); ctx.translate(-W / 2, -cy);
    const ai = (!C || C.ai || sc.k === 'day') ? aiScene(sceneFn(film, P.D, sc), film.cast) : null;
    AI_ON = false;
    try {
      if (!C) {
        if (sc.k !== 'day') { background(ctx, th, lt + sc.t0, null); if (ai) AI_ON = drawAi(ctx, ai, th, lt, sc.d, film.cast); particles(ctx, th, film.fx, lt + sc.t0, false); }
        else if (ai) AI_ON = drawAi(ctx, ai, th, lt, sc.d, film.cast);
        return SCENES[sc.k](ctx, film, th, P.D, sc, lt);
      }
      C.bg(ctx, th, lt + sc.t0, sc);
      if (ai) AI_ON = drawAi(ctx, ai, th, lt, sc.d, film.cast);
      if (C.fx !== 'none') particles(ctx, th, C.fx, lt + sc.t0, false);
      if (sc.k === 'open') C.open(ctx, film, th, P.D, sc, lt);
      else if (sc.k === 'title') C.title(ctx, film, th, P.D, sc, lt);
      else if (sc.k === 'day') C.day(ctx, film, th, P.D, sc, lt);
      else if (sc.k === 'finale') conceptFinale(ctx, film, th, P.D, sc, lt, C);
      else SCENES[sc.k](ctx, film, th, P.D, sc, lt);
    } finally { ctx.restore(); }
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
      // start fetching the film's pictures now (they fade in when they arrive)
      this.art = HAS_DOM ? filmArt(this.film, this.P) : [];
      this.art.forEach(loadImg);
      if (HAS_DOM) sceneList();
    }
    // resolves when the film's pictures (and any AI scenes it uses) are in: the poster maker waits for it
    ready() {
      if (!HAS_DOM) return Promise.resolve();
      return Promise.resolve(sceneListP).then(() => {
        const fns = new Set(this.P.scenes.map(sc => sceneFn(this.film, this.P.D, sc)));
        const ai = [...fns].flatMap(fn => scenePics(fn)).map(f => `img/scenes/${f}`);
        return Promise.all([...this.art, ...ai].map(src => loadImg(src).done));
      }).then(all => { all.forEach(a => { if (a.ok) a.at = 0; }); });
    }
    // The moment shown as the film's picture: the names, fully arrived
    posterTime() { const s = this.P.scenes.find(x => x.k === 'title'); return s.t0 + s.d - .7; }
    draw(t) {
      const { ctx, film } = this, th = themeOf(film), C = CONCEPTS[film.concept], S = this.P.scenes, FADE = C && C.trans === 'slide' ? .7 : .55;
      t = clamp(t, 0, this.total - .001); NOW = t; SCALE = this.s;
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

  const artReady = p => p && p.ready ? p.ready() : Promise.resolve();
  return { artReady, recolour, W, H, THEMES, FRAMES, OPENINGS, FX, LIST, byId, describe, CONCEPTS, conceptName, themeOf, details, fromCard, script, Player, fontsReady, SCENE_NAME };
})();

if (typeof module !== 'undefined') module.exports = Films;
