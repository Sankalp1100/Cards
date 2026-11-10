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
  const LIST = (() => {
    const list = [{ id: 'film-royal-darbar', name: 'Royal Darbar', occ: 'wedding', theme: 'maroon', frame: 'toran', open: ['burst', 'doors'], layout: 'stack', fx: 'sparkle', tune: 'shehnai', lang: 'en', cast: 0 }];
    const pairs = [];
    Object.keys(THEMES).forEach(t => Object.keys(FRAMES).forEach(f => { if (!(t === 'maroon' && f === 'toran')) pairs.push([t, f]); }));
    const r = rng(20261110);
    for (let i = pairs.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [pairs[i], pairs[j]] = [pairs[j], pairs[i]]; }
    // neighbours never share a palette or a frame
    const picked = [];
    while (picked.length < 80) {
      const last = picked[picked.length - 1] || list[0];
      const k = pairs.findIndex(([t, f]) => !last || (t !== (last[0] || last.theme) && f !== (last[1] || last.frame)));
      picked.push(pairs.splice(k < 0 ? 0 : k, 1)[0]);
    }
    const SOLO = ['birthday', 'naming', 'housewarming', 'puja'];
    let solo = 0;
    picked.forEach(([theme, frame], n) => {
      const i = n + 1, occ = OCC_SEQ[i % OCC_SEQ.length], tunes = TUNE_FOR[occ];
      const name = `${THEMES[theme].word} ${FRAMES[frame]}`;
      list.push({ id: 'film-' + name.toLowerCase().replace(/\s+/g, '-'), name, occ, theme, frame, open: [OPENINGS[i % OPENINGS.length]],
        layout: ['stack', 'mono', 'split'][i % 3], fx: FX[(i * 5 + Math.floor(i / 6)) % FX.length], tune: tunes[i % tunes.length], lang: i % 3 === 2 ? 'hi' : 'en', cast: i, solo: SOLO.includes(occ) ? solo++ : 0 });
    });
    return list;
  })();
  const byId = Object.fromEntries(LIST.map(f => [f.id, f]));
  const describe = f => `${OCC_LABEL[f.occ]} · ${f.lang === 'hi' ? 'हिन्दी' : 'English'}`;

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
  const FONT = {
    name: (z, hi) => hi ? `700 ${z}px "Amita", serif` : `700 ${z}px "Playfair Display", serif`,
    head: (z, hi) => hi ? `${z}px "Yatra One", serif` : `400 ${z}px "Cinzel", serif`,
    caps: (z, hi) => hi ? `${z}px "Tiro Devanagari Hindi", serif` : `400 ${z}px "Cinzel", serif`,
    body: (z, hi) => hi ? `${z}px "Tiro Devanagari Hindi", serif` : `italic 400 ${z}px "Cormorant Garamond", serif`,
    script: (z, hi) => hi ? `700 ${z}px "Amita", serif` : `400 ${z}px "Great Vibes", cursive`,
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
    frame(ctx, film, th, 1, lt);
    const c = card(ctx, film, th, ap(lt, 0, .8), 120);
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
    frame(ctx, film, th, 1, lt);
    const c = card(ctx, film, th, ap(lt, 0, .8), 100);
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
    const lightTh = { ...th, dark: false };
    frame(ctx, film, th, 1, lt);
    const c = card(ctx, film, th, ap(lt, 0, .8), 100), cx = c.cx;
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
    const lightTh = { ...th, dark: false };
    frame(ctx, film, th, 1, lt);
    const c = card(ctx, film, th, ap(lt, 0, .8), 100), cx = c.cx;
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

  // ---------- The player ----------
  function drawScene(ctx, film, th, P, sc, lt) {
    if (sc.k !== 'day') { background(ctx, th, lt + sc.t0, null); particles(ctx, th, film.fx, lt + sc.t0, false); }
    SCENES[sc.k](ctx, film, th, P.D, sc, lt);
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
      const { ctx, film } = this, th = THEMES[film.theme], S = this.P.scenes, FADE = .55;
      t = clamp(t, 0, this.total - .001); NOW = t;
      ctx.setTransform(this.s, 0, 0, this.s, 0, 0);
      const i = S.findIndex(x => t < x.t0 + x.d), sc = S[i < 0 ? S.length - 1 : i], lt = t - sc.t0;
      drawScene(ctx, film, th, this.P, sc, lt);
      const next = S[i + 1];
      if (next && lt > sc.d - FADE) {
        ctx.save(); ctx.globalAlpha = ease((lt - (sc.d - FADE)) / FADE);
        drawScene(ctx, film, th, this.P, next, lt - (sc.d - FADE) - FADE);
        ctx.restore();
      }
      corners(ctx, th);
      signature(ctx, th, this.P.D.credit, this.P.D.site);
      return sc;
    }
  }
  // Fonts the films use (Hindi ones are added to the page when missing)
  function fontsReady() {
    if (typeof document === 'undefined' || !document.fonts) return Promise.resolve();
    let link = document.querySelector('link[data-film-fonts]');
    if (!link) {
      link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Amita:wght@700&family=Tiro+Devanagari+Hindi&family=Yatra+One&family=Cinzel:wght@400&family=Great+Vibes&family=Playfair+Display:wght@700&family=Cormorant+Garamond:ital,wght@1,400&display=swap' });
      link.dataset.filmFonts = '1';
      link.loaded = new Promise(r => { link.onload = link.onerror = r; setTimeout(r, 5000); });
      document.head.appendChild(link);
    }
    return Promise.resolve(link.loaded).then(() => loadFonts());
  }
  function loadFonts() {
    const want = ['700 40px "Playfair Display"', '400 40px "Cinzel"', '40px "Great Vibes"', 'italic 400 40px "Cormorant Garamond"'].map(f => document.fonts.load(f));
    const hindi = ['700 40px "Amita"', '40px "Tiro Devanagari Hindi"', '40px "Yatra One"'].map(f => document.fonts.load(f, 'ॐ शुभ विवाह'));
    return Promise.race([Promise.all([...want, ...hindi]), new Promise(r => setTimeout(r, 6000))]).catch(() => {});
  }

  return { W, H, THEMES, FRAMES, OPENINGS, FX, LIST, byId, describe, details, fromCard, script, Player, fontsReady, SCENE_NAME };
})();

if (typeof module !== 'undefined') module.exports = Films;
