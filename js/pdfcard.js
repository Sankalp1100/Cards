// Reads a printed invitation card (PDF) for the Video Studio: its text and a picture of each page, then finds
// every detail on it: the heading, the couple, parents, grandparents, every function with its own date, time and
// venue, the main venue, the home address, phones, verses, the inviters and the children's line. Nothing is lost:
// `lines` keeps every word and `extra` the lines no field took.
// The guesses are only a start: the Studio shows them in a form to check and correct before the video is made.
// `PdfCard.parse(lines)` works on plain text lines (tested in tests/unit.test.js); `PdfCard.read(file)` loads
// pdf.js from cdnjs on first use.
const PdfCard = (() => {
  const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';

  const MONTHS = { jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2, apr: 3, april: 3, may: 4, jun: 5, june: 5, jul: 6, july: 6, aug: 7, august: 7,
    sep: 8, sept: 8, september: 8, oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11,
    'जनवरी': 0, 'फरवरी': 1, 'फ़रवरी': 1, 'मार्च': 2, 'अप्रैल': 3, 'मई': 4, 'जून': 5, 'जुलाई': 6, 'अगस्त': 7, 'सितम्बर': 8, 'सितंबर': 8,
    'अक्टूबर': 9, 'अक्तूबर': 9, 'नवम्बर': 10, 'नवंबर': 10, 'दिसम्बर': 11, 'दिसंबर': 11 };
  // Functions, with the name the Studio shows (English, Hindi)
  const EVENTS = [
    [/ganesh\s*(puja|pujan|sthapana)|ganpati\s*(puja|pujan|sthapana)|गणेश\s*(पूजन|पूजा|स्थापना)|गणपति\s*(पूजन|पूजा|स्थापना)|विनायक/i, 'Ganesh Puja', 'गणेश पूजन'],
    [/sunder\s*kand|sundarkand|सुन्दरकाण्ड|सुंदरकांड|सुन्दरकांड|सुंदर\s*कांड/i, 'Sunderkand', 'सुंदरकांड'],
    [/satya\s*narayan|सत्यनारायण|सत्य\s*नारायण/i, 'Satyanarayan Katha', 'सत्यनारायण कथा'],
    [/bhagwat|bhagvat|भागवत/i, 'Bhagwat Katha', 'भागवत कथा'],
    [/katha\b|कथा/i, 'Katha', 'कथा'],
    [/havan|hawan|हवन|यज्ञ/i, 'Havan', 'हवन'],
    [/bhandara|भंडारा|भण्डारा/i, 'Bhandara', 'भंडारा'],
    [/mata\s*ki\s*chowki|jagran|जागरण|माता\s*की\s*चौकी|चौकी/i, 'Mata ki Chowki', 'माता की चौकी'],
    [/kirtan|bhajan|कीर्तन|भजन/i, 'Kirtan & Bhajan', 'कीर्तन भजन'],
    [/rat[\s;:.']*j[\s;:.']*aga|ratjaga|रतजगा/i, 'Ratjaga', 'रतजगा'],
    [/tilak|तिलक|टीका/i, 'Tilak', 'तिलक'],
    [/roka|रोका/i, 'Roka', 'रोका'],
    [/ring\s*ceremony|engagement|sagai|सगाई|रिंग\s*सेरेमनी|मुद्रिका/i, 'Engagement', 'सगाई'],
    [/lagan\s*patrika|lagan\b|लगन/i, 'Lagan', 'लगन'],
    [/haldi|tel\s*baan|हल्दी|हलदी|हलदि|उबटन|तेल\s*बान|तेलबान/i, 'Haldi', 'हल्दी'],
    [/mehe?n?di|mehandi|mec?hen?di|mehndi|मेहँदी|मेहंदी|मेंहदी|मेहन्दी|मेंहदि|मेहदी/i, 'Mehendi', 'मेहँदी'],
    [/ladies\s*sangeet|sangeet|लेडीज़?\s*संगीत|संगीत/i, 'Sangeet', 'संगीत'],
    [/chooda|chura|चूड़ा|चूडा/i, 'Chooda', 'चूड़ा'],
    [/bhaat|bhat\b|mayra|mayro|mamera|भात|मायरा|मायरो|मामेरा/i, 'Bhaat', 'भात'],
    [/mandap|मण्डप|मंडप|मांडा|माण्डा/i, 'Mandap', 'मण्डप'],
    [/sehra\s*bandi|सेहरा\s*बंदी|सेहराबंदी/i, 'Sehra Bandi', 'सेहरा बंदी'],
    [/gh[ou][dr]h?\s*ch[ah]{0,2}[dr]h?i|ghudchadi|ghurchari|ghodi|[घच][ुो][ड़ड]़?\s*च[ढ़ढ]़?ी|घोड़ी|घोडी/i, 'Ghudchadhi', 'घुड़चढ़ी'],
    [/baraat|barat\b|nikasi|बारात|बरात|निकासी|निकरौसी/i, 'Baraat', 'बारात'],
    [/dwar\s*char|dwarchar|द्वाराचार|द्वार\s*पूजा/i, 'Dwarchar', 'द्वाराचार'],
    [/jai\s*mala|var\s*mala|varmala|jaimala|जयमाला|जयमाल|वरमाला/i, 'Jaimala', 'जयमाला'],
    [/phere|pheras|saat\s*phere|फेरे|पाणिग्रहण|शुभ\s*लग्न|लग्न/i, 'Pheras', 'फेरे'],
    [/reception|स्वागत\s*समारोह|रिसेप्शन|आशीर्वाद\s*समारोह/i, 'Reception', 'स्वागत समारोह'],
    [/lunch|दोपहर\s*का\s*भोजन/i, 'Lunch', 'प्रीतिभोज'],
    [/prit[ie]\s*bhoj|bhoj|dinner|प्रीतिभोज|प्रीति\s*भोज|भोज|भोजन/i, 'Dinner', 'प्रीतिभोज'],
    [/vidai|विदाई/i, 'Vidai', 'विदाई'],
    [/cocktail|कॉकटेल/i, 'Cocktail', 'कॉकटेल'],
    [/cake\s*cutting|केक\s*कटिंग/i, 'Cake Cutting', 'केक कटिंग'],
    // the occasion itself, only when it comes with its own date (not the card's title "Shubh Vivah")
    [/griha\s*pravesh|house\s*warming|गृह\s*प्रवेश/i, 'Griha Pravesh', 'गृह प्रवेश', { needsDate: true }],
    [/birthday|जन्मदिन/i, 'Birthday', 'जन्मदिन', { needsDate: true }],
    [/\bwedding\s*(ceremony|day)?\b(?!\s*invitation)|\bshaadi\b|\bshadi\b|शादी|विवाह\s*(संस्कार|समारोह)|शुभ\s*विवाह/i, 'Wedding', 'शुभ विवाह', { needsDate: true }]
  ];
  const OCCASIONS = [
    [/wedding|marriage|shubh\s*vivah|vivah|विवाह|शादी|परिणय|पाणिग्रहण/i, 'wedding'],
    [/engagement|ring\s*ceremony|sagai|सगाई/i, 'engagement'],
    [/reception|स्वागत\s*समारोह/i, 'reception'],
    [/birthday|जन्मदिन/i, 'birthday'],
    [/anniversary|वर्षगाँठ|वर्षगांठ/i, 'anniversary'],
    [/griha\s*pravesh|house\s*warming|गृह\s*प्रवेश/i, 'housewarming'],
    [/godh\s*bharai|baby\s*shower|गोद\s*भराई/i, 'babyshower'],
    [/naam\s*karan|naming|नामकरण/i, 'naming'],
    [/satya\s*narayan|सत्यनारायण|sunder\s*kand|sundarkand|सुन्दरकाण्ड|सुंदरकांड|jagran|जागरण|चौकी|havan|हवन|\bpu?ja\b|pooja|पूजन|पूजा|कथा|kirtan|कीर्तन/i, 'puja']
  ];
  // The function the card is about when it prints only a date (a birthday, a Griha Pravesh…)
  const MAIN_EVENT = { wedding: ['Wedding', 'शुभ विवाह'], engagement: ['Engagement', 'सगाई'], reception: ['Reception', 'स्वागत समारोह'], birthday: ['Birthday', 'जन्मदिन'],
    anniversary: ['Anniversary', 'वर्षगाँठ'], housewarming: ['Griha Pravesh', 'गृह प्रवेश'], babyshower: ['Godh Bharai', 'गोद भराई'], naming: ['Naamkaran', 'नामकरण'], puja: ['Puja', 'पूजा'] };
  const VENUE_WORDS = /hotel|resort|banquet|lawns?|gardens?|palace|farm|hall|vatika|bhawan|bhavan|mahal|marriage\s*home|club|haveli|greens|retreat|temple|mandir|dharamshala|community\s*cent|होटल|रिसोर्ट|रिसॉर्ट|बैंक्वेट|लॉन|गार्डन|पैलेस|फार्म|हॉल|वाटिका|भवन|महल|मैरिज\s*होम|हवेली|मन्दिर|मंदिर|धर्मशाला/i;
  // "at home" for a function
  const HOME = /निवास\s*(स्थान\s*)?पर|घर\s*पर|at\s*(our\s*)?(residence|home)|^residence$/i;

  // "Venue:", "समारोह स्थल:" and the like in front of a place (MAIN_LABEL: the card's own venue)
  const LABEL = /^(?:@\s*|(venue|marriage venue|wedding venue|समारोह स्थल|विवाह स्थल|कार्यक्रम स्थल|आयोजन स्थल|स्थान|स्थल|at)(?=[\s:\-–]|$)[\s:\-–]*)/i;
  const MAIN_LABEL = /^(venue|marriage venue|wedding venue|reception venue|समारोह स्थल|विवाह स्थल|कार्यक्रम स्थल|आयोजन स्थल)(?=[\s:\-–]|$)/i;
  const ADDRESS = /^.*?(address|residence|res\.|निवास स्थान|निवास|पता)\s*[:\-–]\s*/i;
  const PHONE = /(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b/g, hasPhone = s => /(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b/.test(digits(s));
  const PHONE_LABEL = /^(contact|sampark|contact\s*no\.?|mob(ile)?\.?|ph(one)?\.?|call|tel\.?|सम्पर्क|संपर्क|सम्पर्क\s*सूत्र|मो[॰.]?|मोबाइल|फोन|फ़ोन)\s*(no\.?|नं[॰.]?)?\s*[:\-–]?\s*/i;
  const ROADISH = /,|\b\d{6}\b|road|marg|nagar|colony|sector|street|lane|chowk|near|opp|मार्ग|रोड|नगर|कॉलोनी|कालोनी|सेक्टर|चौक|निकट|समीप/i;
  // The line that opens a card ("॥ श्री गणेशाय नमः ॥", "Om Shri Ganeshaya Namah")
  const INVOCATION = /गणेशाय|नम[ः:]\s*[॥।|]*\s*$|गणपतये|विनायकाय|श्री\s*गणेश|ganeshaya?|ganpataye|ganapataye|shr[ie]e?\s*ganesh|जय\s*माता\s*दी|jai\s*mata\s*di|^[\s॥।|*~:.-]*ॐ|^[\s॥।|*~:.-]*om\b|^[\s॥।|*~:.-]*श्री[\s॥।|*~:.-]*$|जय\s*श्री|श्री\s*राधे|श्री\s*हरि|वाहेगुरु|waheguru|ੴ|bismillah|बिस्मिल्लाह/i;
  // The card's heading
  const TITLE = /^(?:॥\s*)?(?:श्री\s*)?(?:शुभ\s*(?:विवाह|परिणय|लग्न|गृह\s*प्रवेश)|परिणय\s*(?:सूत्र|बंधन|उत्सव)|विवाह\s*(?:निमंत्रण|आमंत्रण|आमन्त्रण|समारोह|उत्सव)|शादी\s*का\s*निमंत्रण|wedding\s*invit|shubh\s*viv|shubh\s*vivaah|save\s*the\s*date|you'?re\s*invited|you\s*are\s*invited|happy\s*birthday|birthday\s*(?:invitation|party|bash|celebration)|griha\s*pravesh|house\s*warming|गृह\s*प्रवेश|जन्मदिन|.{0,30}\bbirthday\b|engagement\s*(?:ceremony|invitation)|सगाई|श्री\s*सत्यनारायण|सत्यनारायण|सुन्दरकाण्ड|सुंदरकांड|.{0,20}\b(?:pooja|puja)\b|.{0,20}पूजन)/i;
  const INVITE_WORD = /invitation|invite|आमंत्रण|आमन्त्रण|निमंत्रण|निमन्त्रण|celebrat|उत्सव/i;
  // Who invites (निवेदक…) and the children's line (बाल मनुहार…)
  const INVITERS = /(?<![ऀ-ॿ])(?:निवेदक|निवेदिका|दर्शनाभिलाषी|दर्शनाभिलाषि|दर्शनाकांक्षी|दर्शनाकांक्षी|स्वागतोत्सुक|स्वागतकर्ता|स्वागतकर्त्ता|विनीत(?!ा)|आकांक्षी|आकांक्षी|प्रतीक्षारत|निमंत्रक)|darshanabhilashi|nivedak|swagatotsuk|with\s*best\s*compliments(?:\s*from)?|best\s*compliments(?:\s*from)?|compliments\s*from|\brsvp\b|r\.s\.v\.p\.?|\bregards\b|with\s*love\s*from|invited\s*by|\binviters?\b|eagerly\s*awaiting(?:\s*your\s*presence)?|awaiting\s*your\s*presence/i;
  const KIDS = /बाल\s*-?\s*मनुहार|बालमनुहार|बाल\s*आग्रह|मनुहार|little\s*ones?|little\s*hearts?|tiny\s*tots|kids\s*(?:corner|request|invite)|नन्हे\s*(?:मेहमान|मुन्ने)/i;
  const KIDS_LINE = /(?:चाचू|चाचा|चाचु|मामा|मामू|बुआ|दीदी|भैया|भइया|मौसी)\s*(?:जी\s*)?की\s*शादी|(?:chachu|chacha|mamu|mama|didi|bhaiya|bua|masi)'?s?\s*(?:ki\s*)?(?:wedding|shaadi)/i;
  const VERSE = /मंगलम्|मंगलं|मङ्गलम्|भवन्तु|सर्वदा|कुरु\s*मे|समप्रभ|हरि[ः:]|आशीर्वाद|आशीष|शुभाशीष|सौभाग्य|मंगल\s*भवन/;
  // words of a sentence, never part of a name ("TOGETHER WITH THEIR FAMILIES" is not a couple)
  const COMMON = /\b(together|families|family|their|our|invite[sd]?|inviting|request|requests|honour|honor|presence|pleasure|celebrate|celebrating|join|us|you|your|with|the|of|ceremony|friends|relatives|parents|blessings?|love)\b|परिवार|परिवारजन|आमंत्रित|आमन्त्रित|सादर|पधारें|समस्त|सहित|आप|हम|निवेदन/i;
  const HONOR =/^(shri|smt|sh|mr|mrs|ms|miss|dr|late|श्रीमती|श्री|स्व|सुश्री|डॉ)(?=[\s.॰]|$)[\s.॰]*/i;
  // The two sides: groom (s/o, सुपुत्र, पौत्र) and bride (d/o, सुपुत्री, पौत्री)
  const PARENT = [/\bs\/o\b|(?<![a-z])(?<!grand\s)son\s+of\b|सुपुत्र(?!ी)|(?<![\u0900-\u097F])पुत्र(?!ी)/i, /\bd\/o\b|(?<![a-z])(?<!grand\s)daughter\s+of\b|सुपुत्री|(?<![\u0900-\u097F])पुत्री/i];
  const GRAND = [/grand\s?son(\s+of)?\b|(?:प्र)?पौत्र(?!ी)|दौहित्र(?!ी)|नाती(?!न)/i, /grand\s?daughter(\s+of)?\b|(?:प्र)?पौत्री|दौहित्री|नातिन/i];
  const GROOM = /(?<![a-z])(?:chi(?:[.॰]|\s)|chiranjeevi?\b)|(?<![\u0900-\u097F])(?:चि(?:[॰.]|\s)|चिरंजीवी?)/i;
  const BRIDE = /(?<![a-z])(?:ayu(?:[.॰]|\s)|ayushmati\b|sau(?:[.॰]|\s)|kum(?:[.॰]|\s)|sushri\b)|(?<![\u0900-\u097F])(?:आयु(?:[॰.]|\s)|आयुष्मती|सौ(?:[॰.]|\s)|कु(?:[॰.])|सुश्री|सौभाग्यकांक्षिणी)/i;
  const WEEKDAYS = /\b(?:mon|tues?|wed(?:nes)?|thu(?:rs)?|fri|sat(?:ur)?|sun)(?:day)?\b\.?|सोमवार|मंगलवार|बुधवार|गुरुवार|बृहस्पतिवार|वीरवार|शुक्रवार|शनिवार|रविवार/gi;

  const clean = s => String(s || '').replace(/[​-‍﻿]/g, '').replace(/\s+/g, ' ').trim();
  // Hindi digits to 0-9 (one character for one, so places in the line stay the same)
  const digits = s => s.replace(/[०-९]/g, d => '०१२३४५६७८९'.indexOf(d));
  const DEV = /[\u0900-\u0963\u0971-\u097F]/;

  // Every date on a line with where it sits: "12 December 2026", "12th Dec", "Saturday, 12 December 2026",
  // "Dec 12, 2026", "12.12.2026", "12/12/26", "१२ दिसम्बर २०२६" → [{ at, end, dt: { y, m, d } }]
  const YEAR = '(?:[\\s.,\'’-]*(\\d{4}(?!\\d)|\\d{2}(?![:.]?\\d|\\s*(?:a\\.?m|p\\.?m|बजे))))?';
  const D_MON = new RegExp(`(?<!\\d)(\\d{1,2})(?:st|nd|rd|th)?(?:\\s*of)?[\\s.,-]*([A-Za-z]{3,9}(?![A-Za-z])|[\\u0900-\\u0963\\u0971-\\u097F]{3,9})${YEAR}`, 'g');
  const MON_D = /(?<![A-Za-z])([A-Za-z]{3,9})\.?[\s,-]+(\d{1,2})(?:st|nd|rd|th)?(?!\d)(?:[\s.,]+(\d{4})(?!\d))?/g;
  const NUM_D = /(?<!\d)(\d{1,2})[./-](\d{1,2})[./-](\d{4}|\d{2})(?!\d)/g;
  function dateSpans(line, year) {
    const s = digits(String(line || '')), out = [];
    const y4 = y => y ? +(y.length === 2 ? '20' + y : y) : year;
    const add = (m, d, mo, y) => { const at = m.index, end = at + m[0].replace(/[\s.,'’-]+$/, '').length;
      if (mo != null && d >= 1 && d <= 31 && !out.some(o => at < o.end && end > o.at)) out.push({ at, end, dt: { d, m: mo, y: y4(y) } }); };
    for (const m of s.matchAll(NUM_D)) if (+m[2] >= 1 && +m[2] <= 12) add(m, +m[1], +m[2] - 1, m[3]);
    for (const m of s.matchAll(D_MON)) add(m, +m[1], MONTHS[m[2].toLowerCase()], m[3]);
    for (const m of s.matchAll(MON_D)) add(m, +m[2], MONTHS[m[1].toLowerCase()], m[3]);
    return out.sort((a, b) => a.at - b.at);
  }
  const findDates = (line, year) => dateSpans(line, year).map(x => x.dt);
  const findDate = (line, year) => (dateSpans(line, year)[0] || {}).dt || null;

  // Every time on a line: "7:30 PM", "19:30", "सायं 7:30 बजे", "रात्रि 8 बजे से" → [{ at, end, t: "19:30", upto }]
  // (upto: where "से / onwards" ends, so "रात्रि 8 बजे से" can be kept as printed)
  const PART = '(प्रातःकाल|प्रातः|प्रात:|प्रात|सुबह|दोपहर|अपराह्न|मध्याह्न|सायंकाल|सायं|साये|साँय|सांय|साय|शाम|रात्रि|रात)';  // OCR: "साये", "साय"
  const TIMES = [
    new RegExp(`(?:${PART}\\s*)?(?<![\\d:./-])(\\d{1,2})(?:[:.](\\d{2}))?\\s*(a\\.?m\\.?|p\\.?m\\.?)(?![a-z])`, 'gi'),
    new RegExp(`(?:${PART}\\s*)?(?<![\\d:./-])(\\d{1,2})(?:[:.](\\d{2}))?\\s*बजे`, 'g'),
    new RegExp(`${PART}\\s*(\\d{1,2})(?:[:.](\\d{2}))?(?![\\d:./-])()`, 'g'),
    // Hinglish: "sham 7 baje", "raat 11 baje"
    /(?:(subah|dopahar|sham|shaam|raat|ratri)\s*)?(?<![\d:./-])(\d{1,2})(?:[:.](\d{2}))?\s*baje()/gi,
    /()(?<![\d:./-])([01]?\d|2[0-3]):([0-5]\d)(?![\d:])()/g
  ];
  const ONWARDS = /^\s*(?:से\s*(?:प्रारम्भ|आरम्भ|प्रारंभ)?|onwards?|तक|till\s*late)/i;
  function hour(h, mm, ampm, part) {
    h = +h;
    if (ampm) { h = h % 12 + (/p/i.test(ampm) ? 12 : 0); } else if (part && !/प्रात|सुबह|subah/i.test(part)) {
      if (/दोपहर|अपराह्न|मध्याह्न|dopahar/i.test(part) && h < 5) h += 12;
      if (/साय|साँय|सांय|शाम|रात|sham|raat|ratri/i.test(part) && h < 12) h += 12;
    }
    return `${String(h % 24).padStart(2, '0')}:${mm || '00'}`;
  }
  function timeSpans(line, skip = []) {
    const s = digits(String(line || '')), out = [];
    for (const re of TIMES) for (const m of s.matchAll(re)) {
      const at = m.index, end = at + m[0].length;
      if ([...skip, ...out].some(o => at < o.end && end > o.at)) continue;
      const on = s.slice(end).match(ONWARDS);
      out.push({ at, end, upto: on ? end + on[0].length : 0, t: hour(m[2], m[3], m[4], m[1]) });
    }
    return out.sort((a, b) => a.at - b.at);
  }
  const findTimes = line => timeSpans(line, dateSpans(line, 2000)).map(x => x.t);
  const findTime = line => findTimes(line)[0] || '';
  const iso = (dt, time) => dt ? `${dt.y}-${String(dt.m + 1).padStart(2, '0')}-${String(dt.d).padStart(2, '0')}${time ? 'T' + time : ''}` : '';

  // Hindi as PDFs give it back: the "ि" sign drawn before its letter comes first, and joined letters (श्र, ल्द…)
  // often come out as an empty character. Put "ि" after its letter, an empty one before a letter is that "ि",
  // and the common words are mended (श्री, हल्दी); any other empty character is dropped.
  function mendHindi(s) {
    if (!/[ऀ-ॿ]/.test(s)) return s.replace(/\u0000/g, '');
    const C = '[\\u0915-\\u0939\\u0958-\\u095F]\\u093C?', CL = `${C}(?:\\u094D${C})*`;
    s = s.replace(new RegExp(`\\u093F(${CL})`, 'g'), '$1ि');
    s = s.replace(new RegExp(`\\u0000(${CL})(?!\\u093F)`, 'g'), '$1ि');
    s = s.replace(/(^|[\s(:,॥])\u0000ी/g, '$1श्री').replace(/ह\u0000ी/g, 'हल्दी').replace(/शा\u0000\u0000/g, 'शान्ति').replace(/सम्प\s?क\s?\u0000/g, 'सम्पर्क');
    s = s.replace(/\u0000/g, '');
    // no word starts with a vowel sign: a space before one is a gap between pieces of the same letter
    s = s.replace(/\s+(?=[ँ-ःा-्ॢॣ])/g, '').replace(/्\s+/g, '्');
    // words a card always has, put back together where pieces left a gap inside them
    for (const w of HINDI_WORDS) s = s.replace(w.re, w.word);
    return s.replace(/\s+([,:।])/g, '$1');
  }
  const HINDI_WORDS = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'जुलाई', 'अगस्त', 'सितम्बर', 'सितंबर', 'अक्टूबर', 'नवम्बर', 'नवंबर', 'दिसम्बर', 'दिसंबर',
    'स्थल', 'स्थान', 'प्रातः', 'प्रस्थान', 'सम्पर्क', 'निवास', 'प्रीतिभोज', 'स्वागत', 'समारोह', 'सुपुत्र', 'सुपुत्री', 'श्रीमती', 'आमन्त्रित']
    .map(word => ({ word, re: new RegExp([...word].map(c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s?'), 'g') }));

  // One line as printed → tidy (OCR noise: stray "|", "०" read for "॰", "||" for "॥")
  function tidy(s) {
    return s.replace(/[​-‍﻿]/g, '').replace(/\|\||।।/g, '॥').replace(/([\u0900-\u0963\u0971-\u097F])०(?![०-९\d])/g, '$1॰')
      .replace(/([\u0900-\u0963\u0971-\u097F])\|(?=\s*$)/, '$1।').replace(/^[\s|¦]+|[\s|¦]+$/g, '');
  }
  // Text a line keeps once the dates, times, week days and the given pieces are taken out, as short pieces
  // ("Haldi: Friday, 11 December 2026, 11 AM, Poolside" → ["Poolside"]); "रात्रि 8 बजे से" stays whole
  const FILLER = /^(on|at|from|to|and|date|time|dated|day|onwards?|ceremony|function|rasam|दिनांक|दि[॰.]?|तिथि|तारीख|समय|दिन|वार|को|पर|से|बजे|hrs?|रस्म|समारोह|कार्यक्रम|संस्कार|एवं|व|और)$/i;
  function pieces(line, cut = [], year = 2000) {
    const ds = dateSpans(line, year), ts = timeSpans(line, ds), wd = [...String(line).matchAll(WEEKDAYS)].map(m => ({ at: m.index, end: m.index + m[0].length }));
    const gone = [...cut, ...ds, ...ts.filter(t => !t.upto), ...wd].sort((a, b) => a.at - b.at);
    let s = '', p = 0;
    for (const g of gone) { if (g.at >= p) s += line.slice(p, g.at) + ' , '; p = Math.max(p, g.end); }
    s += line.slice(p);
    return s.split(/\s*(?:[,;|·•«»]|\s[–—+-]\s)\s*|\s+(?=@)/).map(x => clean(x.replace(/^[\s:–—-]+|[\s:–—-]+$/g, '').replace(/^(date|time|day|दिनांक|तिथि|समय|वार)\s*[:\-–]\s*/i, '')))
      .filter(x => x && !FILLER.test(x) && /[A-Za-z0-9\u0900-\u097F]/.test(x));
  }
  // Pieces → [note, venue]: the venue starts at the first piece that names a place
  function split(ps) {
    const v = ps.findIndex(x => LABEL.test(x) || VENUE_WORDS.test(x) || HOME.test(x));
    return v < 0 ? [ps.join(', '), ''] : [ps.slice(0, v).join(', '), clean([ps[v].replace(LABEL, ''), ...ps.slice(v + 1)].join(', '))];
  }

  // Plain lines of text → the card's details (anything not found stays empty)
  // opts.ocr: the words were read from a picture, so they are already in the right order (no PDF-text repair)
  // Card layouts that put a function's date apart from it: a round date badge ("29" / "NOV" / "Sunday") beside
  // "Kirtan 1:00 PM", or one box with two functions and two times ("01 Haldi Mehendi" / "DEC 11:00 AM 5:00 PM").
  // Each becomes one plain line per function ("Haldi 01 DEC 11:00 AM") before the card is read.
  const MON_START = /^(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|जनवरी|फ़रवरी|फरवरी|मार्च|अप्रैल|मई|जून|जुलाई|अगस्त|सितम्बर|सितंबर|अक्टूबर|अक्तूबर|नवम्बर|नवंबर|दिसम्बर|दिसंबर)\.?(?=[\s,]|$)/i;
  const WEEKDAY_ONLY = /^(?:mon|tues?|wed(?:nes)?|thu(?:rs)?|fri|sat(?:ur)?|sun)(?:day)?\.?$|^(?:सोमवार|मंगलवार|बुधवार|गुरुवार|बृहस्पतिवार|वीरवार|शुक्रवार|शनिवार|रविवार)$/i;
  function layout(input) {
    const L = (input || []).map(x => String(x || '').trim()).filter(Boolean), out = []; // wide gaps kept: they mark side-by-side columns
    const badge = i => { const a = digits(L[i] || '').match(/^(\d{1,2})(?:st|nd|rd|th)?(?:\s+(.*))?$/), b = L[i + 1] && digits(L[i + 1]).match(MON_START);
      return a && b && +a[1] >= 1 && +a[1] <= 31 && !MON_START.test((a[2] || '').trim()) ? { d: a[1], rest: (a[2] || '').trim(), mon: b[1], tail: L[i + 1].slice(b[0].length).trim() } : null; };
    for (let i = 0; i < L.length; i++) {
      const bg = badge(i);
      if (!bg) { out.push(L[i]); continue; }
      let j = i + 2, text = [bg.rest, bg.tail].filter(Boolean).join(' ');
      if (L[j] && WEEKDAY_ONLY.test(L[j])) j++;
      // a badge with its functions on the lines after it (until the next badge)
      if (!EVENTS.some(([re]) => re.test(text))) {
        const more = [];
        while (L[j] && !badge(j) && more.length < 4 && (EVENTS.some(([re]) => re.test(L[j])) || findTimes(L[j]).length) && !findDate(L[j], 2000)) { more.push(L[j]); j++; }
        if (L[j] && WEEKDAY_ONLY.test(L[j])) j++;
        text = [text, ...more].filter(Boolean).join(' ');
      }
      const when = `${bg.d} ${bg.mon}`, names = [];
      EVENTS.forEach(ev => { const m = ev[0].exec(text); if (m) names.push({ at: m.index, s: m[0] }); });
      names.sort((a, b) => a.at - b.at);
      const kept = names.filter((n, k) => !names.slice(0, k).some(p => n.at < p.at + p.s.length));
      const times = findTimes(text);
      if (kept.length >= 2 && times.length === kept.length) kept.forEach((n, k) => out.push(`${n.s} ${when} ${times[k]}`));
      else if (kept.length) { const n = kept[0]; out.push(`${n.s} ${when} ${(text.slice(0, n.at) + ' ' + text.slice(n.at + n.s.length)).replace(/\s+/g, ' ').trim()}`.trim()); }
      else out.push(`${when} ${text}`.trim());
      i = j - 1;
    }
    return blocks(out);
  }
  const WEEKDAY_NUM = [[/^sun/i, 0], [/^mon/i, 1], [/^tue/i, 2], [/^wed/i, 3], [/^thu/i, 4], [/^fri/i, 5], [/^sat/i, 6], [/रविवार/, 0], [/सोमवार/, 1], [/मंगलवार/, 2], [/बुधवार/, 3], [/गुरुवार|बृहस्पतिवार|वीरवार/, 4], [/शुक्रवार/, 5], [/शनिवार/, 6]];
  const dayOfWeek = t => { const w = t.replace(/\s+/g, ''); const m = WEEKDAY_NUM.find(([re]) => re.test(w)); return m ? m[1] : -1; };
  function blocks(L) {
    const yearOf = (L.join(' ').match(/\b(20[2-4]\d)\b/) || [])[1];
    // the card's date range: a line with two dates ("29 NOV – 2 DEC 2026")
    let range = null;
    let rangeAt = -1;
    for (const [k, l] of L.entries()) { const ds = findDates(l, +yearOf || new Date().getFullYear()); if (ds.length >= 2) { range = [ds[0], ds[ds.length - 1]]; rangeAt = k; break; } }
    const isWd = l => WEEKDAY_ONLY.test(l.replace(/\s+/g, '')) || /^(?:sun|mon|tues?|wed(?:nes)?|thu(?:rs)?|fri|sat(?:ur)?)\w{0,5}\s?\w{0,2}$/i.test(l.trim()) && dayOfWeek(l) >= 0;
    const dayTok = l => { const t = l.trim().replace(/^[Oo]([l1I|])$/, '01').replace(/^([0-3])[Oo]$/, '$10').replace(/^[Oo]([0-9])$/, '0$1').replace(/^(\d)[lI|]$/, '$11'); const m = digits(t).match(/^(\d{1,2})(?:\s+(.*))?$/); return m && +m[1] >= 1 && +m[1] <= 31 ? { d: +m[1], rest: (m[2] || '').trim() } : null; };
    const out = [];
    let start = 0;
    for (let i = 0; i < L.length; i++) {
      const lineTimes = findTimes(L[i]), bare = L[i].replace(/\b\d{1,2}(?:[:.]\d{2})?\s*(?:a\.?m\.?|p\.?m\.?)/gi, '').trim();
      if (!(isWd(L[i]) || lineTimes.length && bare && isWd(bare))) { out.push(L[i]); continue; }
      // the box ends with its weekday; it starts after the previous weekday (at most 7 lines back)
      // it reaches back to the line after the last one with a full date (a heading's date range, the box before)
      const fullDate = l => !MON_START.test(digits(l).trim()) && !!findDate(l, 2000);
      let from = i; while (from > start && i - from < 7 && !fullDate(L[from - 1])) from--;
      const part = L.slice(from, i);
      let names = [], times = [], mon = null, day = null;
      part.forEach(l => {
        const m = digits(l).trim().match(MON_START); if (m) mon = m[1];
        const dt = dayTok(l); if (dt && !day) day = dt.d;
        EVENTS.forEach(ev => { const x = ev[0].exec(l); if (x && !(ev[3] && ev[3].needsDate) && !names.some(n => n.s === x[0])) names.push({ s: x[0], line: l }); });
        times.push(...findTimes(l));
      });
      times.push(...lineTimes);
      // times printed just under the weekday (read lower down than it)
      let after = 0;
      while (times.length < names.length && L[i + 1 + after] && findTimes(L[i + 1 + after]).length && !EVENTS.some(([re]) => re.test(L[i + 1 + after])) && after < 2) { times.push(...findTimes(L[i + 1 + after])); after++; }
      // a box whose lines already carry a full date is left as it is (a badge's "NOV 1:00 PM" is a month and a time, not 1 November)
      if (!names.length || part.some(l => !MON_START.test(digits(l).trim()) && findDate(l, 2000))) { out.push(L[i]); start = i + 1; continue; }
      let when = '';
      if (day && mon) when = `${day} ${mon}`;
      else if (range) {
        // the weekday inside the card's range (and in that month, when the month was read)
        const wd = dayOfWeek(L[i]), y0 = range[0].y, s0 = new Date(y0, range[0].m, range[0].d), s1 = new Date(range[1].y, range[1].m, range[1].d);
        for (let d = new Date(s0); d <= s1; d.setDate(d.getDate() + 1)) {
          if (d.getDay() !== wd) continue;
          const mName = Object.keys(MONTHS).find(k => MONTHS[k] === d.getMonth() && k.length === 3);
          if (!mon || MONTHS[mon.toLowerCase()] === d.getMonth()) { when = `${d.getDate()} ${mName} ${d.getFullYear()}`; break; }
        }
      }
      if (!when) { out.push(L[i]); start = i + 1; continue; }
      // the lines of this box are replaced by one plain line per function
      out.splice(out.length - (i - from), i - from);
      names.forEach((n, k) => out.push(`${n.s} ${when}${times.length >= names.length ? ' ' + times[times.length - names.length + k] : names.length === 1 && times.length ? ' ' + times[0] : ''}`));
      start = i + 1 + after; i += after;
      continue;
    }
    return out;
  }
  // Section headings that many cards print on a line of their own, the details under them
  const H_VENUE = /^(?:marriage|wedding|reception|ceremony|party|function)?\s*venue\s*:?$|^(?:समारोह|विवाह|कार्यक्रम|आयोजन)\s*स्थल\s*:?$/i;
  const H_ADDRESS = /^(?:home|our|residential)?\s*(?:address|residence)\s*:?$|^(?:निवास(?:\s*स्थान)?|पता|घर\s*का\s*पता)\s*:?$/i;
  const H_INVITE = /^(?:cordial(?:ly)?(?:\s+invit(?:ation|ed)(?:\s+(?:from|by))?)?|invitation\s+from|invited\s+by|with\s+warm\s+regards\s+from|warm\s+regards|with\s+best\s+compliments(?:\s+from)?|best\s+compliments(?:\s+from)?|compliments\s+from)\s*:?$/i;
  const H_ANY = /^[A-Z][A-Z0-9 &'’.,-]{3,40}$/;
  const PLACE_WORDS = /,|\b\d{6}\b|\broad\b|\bnear\b|\bsector\b|\bcolony\b|\bnagar\b|\bvihar\b|\bmarg\b|\bgali\b|\bstreet\b|\bphase\b|\bresidency\b|\bopp\.?\b|\bdist\.?\b|मार्ग|नगर|कॉलोनी|गली|पास|सामने|जिला/i;
  function tidyUp(out, lines, used) {
    const norm2 = x => String(x || '').toLowerCase().replace(/[^a-z0-9\u0900-\u097F]/g, '');
    const bareHead = l => l.replace(/^[^A-Za-z\u0900-\u0965\u0970-\u097F]+/, '');
    const isHead = l => { const b = bareHead(l); return H_VENUE.test(b) || H_ADDRESS.test(b) || H_INVITE.test(b) || INVITERS.test(b) && b.split(' ').length <= 5 || KIDS.test(b) && b.split(' ').length <= 3 || H_ANY.test(b) && !/\d/.test(b) || /^(?:for\s+details|contact|rsvp|call)\b/i.test(b); };
    const realHead = l => { const b = bareHead(l); return H_VENUE.test(b) || H_ADDRESS.test(b) || H_INVITE.test(b) || KIDS.test(b) && b.split(' ').length <= 3 || /^(?:for\s+details|contact|rsvp|call)\b/i.test(b); };
    const block = (i, max, keep, first) => { const got = []; let k = i + 1; while (k < lines.length && H_VENUE.test(bareHead(lines[k])) && H_VENUE.test(bareHead(lines[i]))) { used[k] = true; k++; }
      for (; k < lines.length && got.length < max; k++) { const l = lines[k];
        // a stray short word between the lines (a divider read as letters, "bad") is stepped over when the next line belongs
        if (got.length && !keep(l, got.length) && /^\S{1,5}$/.test(l.trim()) && lines[k + 1] && !isHead(lines[k + 1]) && keep(lines[k + 1], got.length)) { used[k] = true; continue; }
        if ((got.length === 0 && first ? realHead(l) : isHead(l)) || !keep(l, got.length)) break; got.push(k); } return got; };
    lines.forEach((l, i) => {
      // MARRIAGE VENUE: the hall's name and every address line under it
      if (H_VENUE.test(bareHead(l))) {
        if (i > 0 && H_VENUE.test(bareHead(lines[i - 1]))) return; // the second line of a repeated heading
        const ks = block(i, 4, (x, n) => n === 0 ? !findTimes(x).length : PLACE_WORDS.test(x) && !/\b[6-9]\d{4}\s?\d{5}\b/.test(digits(x)), true);
        if (ks.length) { out.venue = ks.map(k => lines[k]).join(', ').replace(/,\s*,/g, ',').replace(/,\s*$/, ''); used[i] = true; ks.forEach(k => { used[k] = true; }); }
      }
      // HOME ADDRESS: the lines under it
      if (H_ADDRESS.test(bareHead(l))) {
        const ks = block(i, 3, x => (PLACE_WORDS.test(x) || /\d/.test(x)) && !realHead(x));
        if (ks.length) { out.address = ks.map(k => lines[k]).join(', ').replace(/,\s*,/g, ',').replace(/,\s*$/, ''); used[i] = true; ks.forEach(k => { used[k] = true; }); }
      }
      // CORDIAL INVITATION FROM / WITH BEST COMPLIMENTS FROM: one inviter per line under it
      if (H_INVITE.test(bareHead(l))) {
        const ks = block(i, 6, x => !KIDS.test(x) && !KIDS_LINE.test(x) && (!findDate(x, 2000) && !PLACE_WORDS.test(x.replace(/,/g, '')) || /&|,/.test(x) && !/\d/.test(x)));
        ks.forEach(k => { const v = lines[k].replace(/^[&,\s]+|[,\s]+$/g, ''); used[k] = true; if (v && /[A-Za-z\u0900-\u097F]{2,}/.test(v) && !out.inviters.some(x => norm2(x) === norm2(v))) out.inviters.push(v); });
        if (ks.length) used[i] = true;
      }
    });
    // Grandparents printed above "of their beloved grandson" (or "पौत्र") instead of after it
    const looksName = x => /\b(?:late|smt|shri|sh|mr|mrs|dr)\b\.?|स्व[॰.]|स्वर्गीय|श्रीमती|श्री/i.test(x);
    [['grandparents1', /grand\s?son|(?:प्र)?पौत्र(?!ी)/i], ['grandparents2', /grand\s?daughter|(?:प्र)?पौत्री/i]].forEach(([key, re]) => {
      if (out[key] && looksName(out[key])) return;
      const i = lines.findIndex(l => re.test(l) && !looksName(l));
      if (i < 0) return;
      for (let k = i - 1; k >= Math.max(0, i - 4); k--) if (looksName(lines[k]) && !/son of|daughter of|s\/o|d\/o|सुपुत्र/i.test(lines[k])) { out[key] = lines[k]; used[k] = true; used[i] = true; return; }
      if (out[key] && !looksName(out[key])) out[key] = '';
    });
    // "Late Smt. … & Late Shri …" on a line of its own, when no grandparents were found
    if (!out.grandparents1 && !out.grandparents2) { const i = lines.findIndex((l, k) => !used[k] && /^(?:late|स्व[॰.]|स्वर्गीय)\s/i.test(l)); if (i >= 0) { out.grandparents1 = lines[i]; used[i] = true; } }
    // "Resi. Kannauj (U.P.)" right under a parents line belongs to those parents
    lines.forEach((l, i) => {
      if (!/^(?:resi(?:dence)?\.?|r\/o|निवासी|निवास)\s*[:\-–]?\s*\S/i.test(l) || i === 0) return;
      const prev = lines[i - 1], side = /daughter of|d\/o|सुपुत्री|पुत्री/i.test(prev) ? 'parents2' : /son of|s\/o|सुपुत्र|पुत्र/i.test(prev) ? 'parents1' : '';
      if (side && out[side] && !out[side].includes(l)) { out[side] += `, ${l}`; used[i] = true; if (out.address === l) out.address = ''; }
    });
    // The full name when the card prints it somewhere ("Shivam" on the cover, "Shivam Gupta" inside)
    ['host1', 'host2'].forEach(key => {
      const h = out[key]; if (!h || h.split(' ').length > 1) return;
      const full = lines.find(l => new RegExp(`^${h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+[A-Z\\u0900-\\u097F][\\w\\u0900-\\u097F.]{1,20}$`).test(l) && !NOT_A_NAME.test(l));
      if (full) out[key] = full;
    });
    // A sentence that only mentions a function ("Baraat will depart from our residence…") is not a function of its own
    out.events = out.events.filter(e => e.date || !out.events.some(x => x !== e && x.name === e.name && x.date))
      .filter(e => e.date || e.venue || String(e.note || '').split(' ').length < 6);
    // a function named as the card prints it ("Kirtan" stays "Kirtan" unless the card also says Bhajan)
    if (!lines.some(l => /bhajan|भजन/i.test(l))) out.events.forEach(e => { if (e.name === 'Kirtan & Bhajan') e.name = 'Kirtan'; if (e.name === 'कीर्तन भजन') e.name = 'कीर्तन'; });
    if (!lines.some(l => /kirtan|कीर्तन/i.test(l))) out.events.forEach(e => { if (e.name === 'Kirtan & Bhajan') e.name = 'Bhajan Sandhya'; if (e.name === 'कीर्तन भजन') e.name = 'भजन संध्या'; });
    // "Shubh Vivah" printed as a heading over that day's functions is not a function of its own
    out.events = out.events.filter(e => !(/^(wedding|शुभ विवाह)$/i.test(e.name) && e.date.length <= 10 && out.events.some(x => x !== e && x.date.slice(0, 10) === e.date.slice(0, 10))));
    // inviters are people or families: not a monogram ("S|A"), not a sentence ("Baraat will depart from…")
    out.inviters = out.inviters.map(v => v.replace(/(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{0,5}\b/g, '').replace(/[\s,·|-]+$/, '').trim())
      .filter((v, k, all) => !all.slice(0, k).some(x => norm2(x) === norm2(v) || norm2(x).length > 6 && (norm2(x).includes(norm2(v)) || norm2(v).includes(norm2(x))) || Math.abs(norm2(x).length - norm2(v).length) <= 2 && similar(norm2(x), norm2(v)) > .7))
      .filter(v => /[A-Za-z]{4,}|[\u0900-\u097F]{3,}/.test(v) && !/\b(?:will|depart|proceed|residence|request|invite)\b/i.test(v) && v.split(/\s+/).length <= 10);
    // the little ones' request: its line and the lines under it (their names), up to the next heading
    if (out.kids && !/\n/.test(out.kids)) {
      const i = lines.findIndex(l => l === out.kids || out.kids.startsWith(l));
      if (i >= 0) { const more = []; for (let k = i + 1; k < lines.length && more.length < 3; k++) { const l = lines[k]; if (H_ADDRESS.test(l) || H_VENUE.test(l) || H_INVITE.test(l) || H_ANY.test(l) || /\d{3}/.test(digits(l)) || l.split(' ').length > 9) break; more.push(l); used[k] = true; } if (more.length) out.kids = [out.kids, ...more].join('\n'); }
    }
    if (out.kids) out.kids = [...new Set(out.kids.split('\n').map(l => l.replace(/^(?:[OoQ0)(\]\[|।.\s]+)(?=[\u0900-\u097FA-Za-z])/, '').replace(/[\s)(\]\[|«»]+$/, '').trim())
      .filter(l => /[A-Za-z]{3,}|[\u0900-\u097F]{2,}/.test(l) && !KIDS.test(l) || KIDS.test(l) && l.replace(KIDS, '').trim().length > 6))].join('\n');
    out.quotes = out.quotes.filter(q => /[॥]/.test(q) || !/करें|करते\s*हैं|पधार|आमंत्रित|उपस्थिति|सादर|request|invite/i.test(q));
    // a well-known verse whose two halves were read apart (or the wrong way round) is put back together
    for (let k = 0; k + 1 < VERSES.length; k += 2) {
      const a = out.quotes.findIndex(q => q.split('\n').includes(VERSES[k])), b = out.quotes.findIndex(q => q.split('\n').includes(VERSES[k + 1]));
      if (a >= 0 && b >= 0 && a !== b) { const keep = Math.min(a, b); out.quotes[keep] = VERSES[k] + '\n' + VERSES[k + 1]; out.quotes.splice(Math.max(a, b), 1); }
    }
    // the invocation is not a quote too
    out.quotes = out.quotes.filter(q => norm2(q) !== norm2(out.invocation));
  }
  const VERSES = ['वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।', 'निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥', 'विघ्न हरण मंगल करण, श्री गणपति महाराज।', 'प्रथम निमंत्रण आपको, पूरण कीजै काज॥',
    'मंगलम् भगवान विष्णुः, मंगलम् गरुड़ध्वजः।', 'मंगलम् पुण्डरीकाक्षः, मंगलाय तनो हरिः॥', 'सर्वमंगल मांगल्ये शिवे सर्वार्थ साधिके।', 'शरण्ये त्र्यम्बके गौरी नारायणि नमोऽस्तु ते॥',
    'गजाननं भूतगणादि सेवितं, कपित्थ जम्बू फलचारु भक्षणम्।', 'उमासुतं शोक विनाशकारकं, नमामि विघ्नेश्वर पाद पंकजम्॥',
    'मंगलम् भगवान विष्णु, मंगलम् गरुड़ध्वजः।', 'मंगलम् पुण्डरीकाक्ष, मंगलाय तनो हरिः॥', 'लम्बोदरं महाकायं गजवक्त्रं चतुर्भुजम्।', 'आवाहयाम्यहं देवं गणेशं सिद्धिदायकम्॥'];
  const vnorm = x => String(x || '').replace(/[^\u0900-\u097F]/g, '').replace(/[ंँ]/g, 'ं');
  function similar(a, b) { // share of letter pairs in common
    const pairs = x => { const p = []; for (let i = 0; i < x.length - 1; i++) p.push(x.slice(i, i + 2)); return p; };
    const A = pairs(a), B = pairs(b); if (!A.length || !B.length) return 0;
    let hit = 0; const pool = B.slice(); A.forEach(p => { const k = pool.indexOf(p); if (k >= 0) { hit++; pool.splice(k, 1); } });
    return 2 * hit / (A.length + B.length);
  }
  const mendVerse = l => { const n = vnorm(l); if (n.length < 16 || /गणेशाय|गणपतये|नमः|नम:/.test(l) && n.length < 22) return l; let best = null, sc = 0;
    VERSES.forEach(v => { const x = similar(n, vnorm(v)); if (x > sc) { sc = x; best = v; } }); return sc > .62 ? best : l; };
  function parse(lines, opts = {}) {
    lines = layout((lines || []).map(l => /[\u0900-\u097F]{3}/.test(String(l || '')) ? mendVerse(String(l)) : l));
    // Each line as printed (raw keeps wide gaps between side-by-side words) and tidied; "चि॰" alone joins its name
    const rows = [];
    // Repair only text that is really broken (a "ि" before its letter, or empty characters): many PDFs give clean Hindi
    const broken = !opts.ocr && (lines || []).some(l => / |(^|[\sा-ौ])ि/.test(String(l || '')));
    for (const l of lines || []) {
      const raw = tidy(broken ? mendHindi(String(l || '')) : String(l || '')), t = clean(raw);
      if (!t || /^[\s|¦\-_~.,:;'"`*•·]+$/.test(t)) continue;
      const prev = rows[rows.length - 1];
      if (prev && /(^|\s)(चि|आयु|सौ|कु|कां|chi|ayu|sau|kum)[॰.]?$/i.test(prev.t) && prev.t.length < 25) { prev.t += ' ' + t; prev.raw += ' ' + raw; continue; }
      rows.push({ t, raw });
    }
    lines = rows.map(r => r.t);
    const text = lines.join('\n'), hi = (text.match(/[ऀ-ॿ]/g) || []).length > (text.match(/[A-Za-z]/g) || []).length;
    const year = +((digits(text).match(/\b(20[2-4]\d)\b/) || [])[1] || new Date().getFullYear());
    const out = { lang: hi ? 'hi' : 'en', type: 'wedding', title: '', invocation: '', host1: '', host2: '', parents1: '', parents2: '', grandparents1: '', grandparents2: '',
      events: [], venue: '', address: '', phones: [], hashtag: '', quotes: [], inviters: [], kids: '', lines: lines.slice(), extra: [] };
    const occ = OCCASIONS.find(([re]) => re.test(text));
    if (occ) out.type = occ[1];
    const used = lines.map(() => false), free = i => i >= 0 && i < lines.length && !used[i];
    const hasDate = l => dateSpans(l, year).length > 0, hasTime = l => findTimes(l).length > 0;
    const noPhones = l => clean(digits(l).replace(PHONE, ' ').replace(PHONE_LABEL, '').replace(/^[\s:,–—-]+|[\s:,–—-]+$/g, ''));
    const phoneOnly = l => hasPhone(l) && !/[A-Za-z\u0900-\u097F]{3}/.test(noPhones(l).replace(INVITERS, ''));

    // The opening line (invocation) and the heading
    const inv = lines.findIndex((l, i) => i < 5 && INVOCATION.test(l) && l.split(' ').length <= 7 && !hasDate(l));
    if (inv >= 0) { out.invocation = lines[inv]; used[inv] = true; }
    const titleOk = (l, i) => free(i) && i < 12 && !hasDate(l) && !hasPhone(l) && !INVITERS.test(l) && !KIDS.test(l) && !GROOM.test(l) && !BRIDE.test(l) && !PARENT.some(r => r.test(l)) && !/\bweds?\b|\s&\s|संग/i.test(l);
    let ti = lines.findIndex((l, i) => titleOk(l, i) && TITLE.test(l) && l.split(' ').length <= 8);
    if (ti < 0) ti = lines.findIndex((l, i) => titleOk(l, i) && l.split(' ').length <= 4 && /^[॥\s]*[A-Z\u0900-\u097F]/.test(l) && (INVITE_WORD.test(l) || OCCASIONS.some(([re]) => re.test(l))));
    if (ti >= 0) { out.title = lines[ti]; used[ti] = true; }

    // Verses: lines in quotes or between ॥ ॥, or ending a verse with ॥ (the half before it joins)
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (!free(i) || hasDate(l) || hasPhone(l)) continue;
      if (/^["“‘'«]/.test(l)) {
        let k = i; const v = [l];
        while (!/["”’'»]\W*$/.test(lines[k]) && k - i < 4 && free(k + 1)) v.push(lines[++k]);
        if (/["”’'»]\W*$/.test(lines[k])) { out.quotes.push(v.join('\n')); for (let j = i; j <= k; j++) used[j] = true; i = k; }
      } else if (/॥/.test(l) && /[\u0900-\u097F]{2}/.test(l.replace(/॥/g, ''))) {
        if (free(i - 1) && /[।,]$/.test(lines[i - 1]) && !hasDate(lines[i - 1])) { out.quotes.push(lines[i - 1] + '\n' + l); used[i - 1] = true; }
        else out.quotes.push(l);
        used[i] = true;
      } else if (/[।,]$/.test(l) && VERSE.test(l) && free(i + 1) && /॥\s*$/.test(lines[i + 1])) {
        out.quotes.push(l + '\n' + lines[i + 1]); used[i] = used[i + 1] = true; i++;
      }
    }

    // A heading (निवेदक, बाल मनुहार, RSVP…) and the lines under it, up to the next part of the card
    const evLine = i => isEventLine(lines[i]);
    const stop = i => !free(i) || INVITERS.test(lines[i]) || KIDS.test(lines[i]) || ADDRESS.test(lines[i]) || LABEL.test(lines[i]) || PHONE_LABEL.test(lines[i]) ||
      GROOM.test(lines[i]) || BRIDE.test(lines[i]) || PARENT.some(r => r.test(lines[i])) || GRAND.some(r => r.test(lines[i])) || hasDate(lines[i]) || /^#/.test(lines[i]) || evLine(i);
    const under = (i, max) => { const ks = []; for (let k = i + 1; k < lines.length && ks.length < max && !stop(k); k++) ks.push(k); return ks; };
    // Children's line
    lines.forEach((l, i) => {
      if (!free(i) || (!KIDS.test(l) && !KIDS_LINE.test(l))) return;
      const own = clean(l.replace(KIDS, '').replace(/^[\s:–—-]+/, '')), ks = KIDS.test(l) || /[:–—-]$/.test(l) ? under(i, 3) : under(i, 1).filter(k => /^[-–—~]/.test(lines[k]));
      out.kids = [out.kids, own, ...ks.map(k => lines[k])].filter(Boolean).join('\n');
      used[i] = true; ks.forEach(k => { used[k] = true; });
    });
    // Inviters: each person or family once ("श्री सुरेश शर्मा, श्री दिनेश शर्मा" is two)
    const people = l => { const s = noPhones(l).replace(/^[\s:–—-]+|[\s:–—-]+$/g, ''); if (!s || !/[A-Za-z\u0900-\u097F]{2}/.test(s)) return [];
      const parts = s.split(/\s*,\s*/); return parts.length > 1 && parts.every(p => HONOR.test(p)) ? parts : [s]; };
    lines.forEach((l, i) => {
      if (!free(i) || !INVITERS.test(l) || GROOM.test(l) || BRIDE.test(l)) return;
      const own = l.replace(INVITERS, ' ').replace(/^[\s:–—-]+/, ''), ks = [];
      for (let k = i + 1; k < lines.length && ks.length < 8 && (phoneOnly(lines[k]) && free(k) || !stop(k) && !PHONE_LABEL.test(lines[k])); k++) ks.push(k);
      out.inviters.push(...people(own), ...ks.filter(k => !phoneOnly(lines[k])).flatMap(k => people(lines[k])));
      used[i] = true; ks.forEach(k => { used[k] = true; });
    });

    // The couple: "Rahul weds Priya", "Rahul & Priya", "राहुल संग प्रिया"; else the names after Chi. / Ayu. (चि॰ / आयु॰ / सौ॰)
    const NAME = "([A-Z\\u0900-\\u097F][\\w\\u0900-\\u097F.'’ ]{1,30}?)", JOIN = '(?:weds|wed|with|&|and|sang|संग|सँग|के\\s*साथ|❤|♥|💕|❤️)';
    lines.forEach((l, i) => {
      const m = !out.host1 && free(i) && l.match(new RegExp(`^${NAME}\\s+${JOIN}\\s+${NAME}$`, 'i'));
      if (m && !COMMON.test(m[1]) && !COMMON.test(m[2]) && !HONOR.test(l)) { out.host1 = cleanName(m[1]); out.host2 = cleanName(m[2]); used[i] = true; }
    });
    // names on lines of their own, with "weds" / "संग" / "&" alone between them
    const nameLike = i => free(i) && /^[A-Z\u0900-\u097F]/.test(lines[i]) && lines[i].split(' ').length <= 5 && !/\d|:/.test(lines[i]) && !HONOR.test(lines[i]) && !COMMON.test(lines[i]) &&
      !PARENT.some(r => r.test(lines[i])) && !GRAND.some(r => r.test(lines[i])) && !INVITERS.test(lines[i]) && !OCCASIONS.some(([re]) => re.test(lines[i])) && !evLine(i);
    lines.forEach((l, i) => {
      if (!free(i) || !new RegExp(`^${JOIN}$`, 'i').test(l)) return;
      used[i] = true;
      if (!out.host1 && nameLike(i - 1) && nameLike(i + 1)) { out.host1 = cleanName(lines[i - 1]); out.host2 = cleanName(lines[i + 1]); used[i - 1] = used[i + 1] = true; }
    });
    const marked = re => { const i = lines.findIndex((x, k) => free(k) && re.test(x) && !INVITERS.test(x)); if (i < 0) return '';
      used[i] = true; return cleanName(lines[i].replace(new RegExp('^.*?(?:' + re.source + ')\\s*', 'i'), '').replace(/^(कां|kan)[॰.]\s*/i, '').split(/\(|,|सुपुत्र|सुपुत्री|पौत्र|s\/o|d\/o|son of|daughter of/i)[0]); };
    if (!out.host1) out.host1 = marked(GROOM);
    if (!out.host2) out.host2 = marked(BRIDE);
    // a birthday: "Aarav's 1st Birthday", "आरव का प्रथम जन्मदिन"
    if (!out.host1 && out.type === 'birthday') {
      lines.some((l, i) => { const m = l.match(/^(?:.*\bcelebrate\s+)?([A-Z][\w ]{1,25}?)['’]s\s+(?:\d+\w*\s+)?birthday/i) || l.match(/^([\u0900-\u097F][\u0900-\u097F ]{1,25}?)\s+(?:का|के|की)\s+(?:\S+\s+)?जन्मदिन/);
        if (m && !HONOR.test(m[1]) && free(i)) { out.host1 = cleanName(m[1]); used[i] = true; return true; } return false; });
    }

    // a Griha Pravesh or a puja: the family that invites
    if (!out.host1 && ['housewarming', 'puja', 'naming'].includes(out.type)) {
      const k = lines.findIndex((l, i) => free(i) && /(?<![ऀ-ॿ])परिवार|\bfamily\b/i.test(l) && l.split(' ').length <= 5);
      if (out.inviters.length) out.host1 = out.inviters[0]; else if (k >= 0) { out.host1 = lines[k]; used[k] = true; }
    }

    // Parents and grandparents: the words after "S/o", "सुपुत्र", "पौत्र"…, or before "के सुपुत्र", or on the next line
    const family = (re, notRe) => {
      const res = [];
      lines.forEach((l, i) => {
        if (!re.test(l) || (notRe && notRe.test(l)) || (used[i] && !GROOM.test(l) && !BRIDE.test(l))) return;
        const m = l.match(re), before = clean(l.slice(0, m.index).replace(/[()]/g, ' ').replace(/\s*(के|की|का|,|-)\s*$/, '')), after = clean(l.slice(m.index + m[0].length).replace(/^[\s:,–—-]+/, '').replace(/[()]/g, ' '));
        let s = after, k = i;
        if (!s && before && !GROOM.test(before) && !BRIDE.test(before) && /[A-Za-z\u0900-\u097F]{3}/.test(before)) s = before;
        else if (!s && /^(के|की|का)\s/.test(l) && free(i - 1)) { s = lines[i - 1]; used[i - 1] = true; } else if (!s && free(i + 1)) s = lines[k = i + 1];
        while (s && /(?:^|\s)(?:&|and|एवं|व)$|,$/i.test(s) && free(k + 1) && k - i < 2) s += ' ' + lines[++k];
        if (!s) return;
        for (let j = i; j <= k; j++) used[j] = true;
        res.push({ i, s: clean(s.replace(/[।|]+\s*$/, '')).slice(0, 160) });
      });
      return res;
    };
    const g1 = family(GRAND[0], GRAND[1]), g2 = family(GRAND[1]);
    const p1 = family(PARENT[0], PARENT[1]), p2 = family(PARENT[1]);
    out.parents1 = (p1[0] || {}).s || ''; out.parents2 = (p2[0] || {}).s || '';
    // "स्व. श्री …" right under a family line belongs to the grandparents of that side
    [[g1, p1], [g2, p2]].forEach(([g, p]) => [...g, ...p].forEach(x => { const k = x.i + 1; if (free(k) && /^(स्व[॰.]|late\b|\(late\))/i.test(lines[k])) { g.push({ i: k, s: lines[k] }); used[k] = true; } }));
    out.grandparents1 = g1.map(x => x.s).join('; '); out.grandparents2 = g2.map(x => x.s).join('; ');
    // a name printed just above "Son of …" (or just below "… के सुपुत्र")
    [['host1', p1], ['host2', p2]].forEach(([h, p]) => {
      if (out[h] || !p.length) return;
      const i = p[0].i, k = nameLike(i - 1) ? i - 1 : nameLike(i + 1) ? i + 1 : -1;
      if (k >= 0) { out[h] = cleanName(lines[k]); used[k] = true; }
    });

    // Functions: a line naming one, with its date, time, venue and other words on it or on the lines under it
    // (up to the next function); when several sit side by side, the lines under them hold theirs in the same order
    const labels = lines.filter(l => LABEL.test(l)).length, mains = lines.filter(l => MAIN_LABEL.test(l)).length;
    // the card's own venue line ("Venue: …" once, after the functions) is not one function's venue
    const mainVenueLine = l => (labels === 1 && LABEL.test(l)) || (mains === 1 && MAIN_LABEL.test(l));
    let lastDate = null;
    lines.forEach((l, i) => {
      const dt = findDate(l, year);
      const list = free(i) ? eventHits(l) : [];
      if (list.length && !isEventLine(l)) list.length = 0;
      const block = [];
      if (list.length) for (let k = i + 1; k < lines.length && block.length < 4; k++) {
        if (!free(k) || isEventLine(lines[k]) || mainVenueLine(lines[k]) || ADDRESS.test(lines[k]) || PHONE_LABEL.test(lines[k]) || phoneOnly(lines[k]) || INVITERS.test(lines[k])) break;
        block.push(k);
      }
      const take = new Set();
      list.forEach((h, j) => {
        // the function's own words ("कीर्तन भजन": both) are not a note
        const seg = list.length > 1 ? l.slice(h.at, list[j + 1] ? list[j + 1].at : undefined) : l;
        const cut = [...seg.matchAll(new RegExp(h.ev[0].source, 'gi'))].map(m => ({ at: m.index, end: m.index + m[0].length }));
        let d = findDate(seg, year), t = findTime(seg), [note, venue] = split(pieces(seg, cut, year));
        const notes = note ? [note] : [];
        if (list.length > 1) {
          // side by side: the lines under hold the dates, times (and venues) in the same order
          for (const k of block) {
            const ds = findDates(lines[k], year), ts = findTimes(lines[k]), parts = rows[k].raw.split(/\s{2,}|\s[·|•«»+\-–—]\s/).map(clean).filter(Boolean);
            if (ds.length < list.length && ts.length < list.length && (ds.length || ts.length || parts.length !== list.length)) break;
            if (!d && ds.length >= list.length) d = ds[j];
            if (!t && ts.length >= list.length) t = ts[j];
            if (!ds.length && !ts.length && !venue) venue = clean(parts[j].replace(LABEL, ''));
            take.add(k);
          }
        } else {
          let vk = -1;
          for (const k of block) {
            const L = lines[k], ds = findDates(L, year), ts = findTimes(L);
            if (ds.length || ts.length) {
              if ((ds.length && d) || (!ds.length && t)) break;
              d = d || ds[0]; t = t || ts[0];
              const [n2, v2] = split(pieces(L, [], year)); if (n2) notes.push(n2); if (v2 && !venue) venue = v2;
            } else if (!venue && (LABEL.test(L) || VENUE_WORDS.test(L) || HOME.test(L))) { venue = clean(L.replace(LABEL, '')); vk = k; }
            else if (venue && vk === k - 1 && ROADISH.test(L)) { venue = venue.replace(/,$/, '') + ', ' + L; vk = k; }
            else if (/dress|theme|attire|colou?r\s*code|ड्रेस|पोशाक|थीम|note|नोट/i.test(L)) notes.push(L);
            else break;
            take.add(k);
          }
        }
        if (!d && h.ev[3] && h.ev[3].needsDate) return;
        d = d || lastDate;
        const name = hi ? h.ev[2] : h.ev[1];
        used[i] = true;
        if (out.events.some(e => e.name === name && (!d || e.date.slice(0, 10) === iso(d, '').slice(0, 10)))) return;
        out.events.push({ name, date: iso(d, t), venue: clean(venue).slice(0, 160), note: notes.join('; '), at: i });
      });
      take.forEach(k => { used[k] = true; });
      if (dt) lastDate = dt;
    });

    // The venue: after "Venue / समारोह स्थल / स्थान", else the main function's venue, else the first line with a venue word
    const venueAt = i => { used[i] = true; let v = clean(lines[i].replace(LABEL, '')); if (!v && free(i + 1)) { v = lines[i + 1]; used[i + 1] = true; i++; }
      if (free(i + 1) && ROADISH.test(lines[i + 1]) && !ADDRESS.test(lines[i + 1]) && !hasDate(lines[i + 1]) && !hasPhone(lines[i + 1]) && (!/,/.test(v) || /,$/.test(v))) { v = clean(v.replace(/,$/, '') + ', ' + lines[i + 1]); used[i + 1] = true; }
      return v; };
    let vi = lines.findIndex((l, i) => free(i) && MAIN_LABEL.test(l));
    if (vi < 0) vi = lines.findIndex((l, i) => free(i) && LABEL.test(l) && !/^at\s/i.test(l));
    const mainEv = out.events.find(e => e.venue && /Wedding|Pheras|Reception|Baraat|Jaimala|Griha|Birthday|विवाह|फेरे|स्वागत|बारात|जयमाला|गृह|जन्मदिन/.test(e.name)) || out.events.find(e => e.venue);
    if (vi >= 0) out.venue = venueAt(vi);
    else if (mainEv) out.venue = mainEv.venue;
    else { const k = lines.findIndex((l, i) => free(i) && VENUE_WORDS.test(l) && l.length < 90 && !ADDRESS.test(l)); if (k >= 0) out.venue = venueAt(k); }
    out.venue = out.venue.slice(0, 160);
    // The home address: after "Address / निवास / पता", else a line with a 6-digit PIN code
    const ai = lines.findIndex((l, i) => free(i) && ADDRESS.test(l) && !HOME.test(l));
    if (ai >= 0) {
      used[ai] = true; let k = ai, a = clean(lines[ai].replace(ADDRESS, ''));
      if (!a && free(ai + 1)) a = lines[k = ai + 1];
      while (/,$/.test(a) && free(k + 1) && k - ai < 3) a += ' ' + lines[++k];
      for (let j = ai; j <= k; j++) used[j] = true;
      out.address = clean(noPhonesKeep(a)).slice(0, 200);
    } else { const k = lines.findIndex((l, i) => free(i) && /\b\d{6}\b/.test(digits(l))); if (k >= 0) { out.address = lines[k].slice(0, 200); used[k] = true; } }

    // A card with only a date on it (a birthday, a Griha Pravesh): that is its function
    if (!out.events.some(e => e.date)) {
      const k = lines.findIndex((l, i) => free(i) && hasDate(l));
      if (k >= 0) {
        const n = MAIN_EVENT[out.type] || MAIN_EVENT.wedding, tk = hasTime(lines[k]) ? k : free(k + 1) && hasTime(lines[k + 1]) && !hasDate(lines[k + 1]) ? k + 1 : k;
        const ps = [...pieces(lines[k], [], year), ...(tk !== k ? pieces(lines[tk], [], year) : [])], [note, v] = split(ps);
        out.events.push({ name: hi ? n[1] : n[0], date: iso(findDate(lines[k], year), findTime(lines[tk])), venue: v || out.venue, note });
        used[k] = used[tk] = true;
      }
    }
    // a function named once without a date (in a heading) and again with one: the dated one stays
    out.events = out.events.filter(e => {
      if (e.date || !out.events.some(o => o.name === e.name && o.date)) return true;
      used[e.at] = false; return false;
    });
    // in the order they happen (by day; on one day, by time where both have one, else as printed)
    const day = e => e.date.slice(0, 10) || '9';
    out.events = out.events.map((e, k) => ({ e, k })).sort((a, b) => day(a.e) < day(b.e) ? -1 : day(a.e) > day(b.e) ? 1
      : a.e.date.length > 10 && b.e.date.length > 10 && a.e.date !== b.e.date ? (a.e.date < b.e.date ? -1 : 1) : a.k - b.k)
      .map(({ e }) => ({ name: e.name, date: e.date, venue: e.venue, note: e.note })).slice(0, 24);
    // a line with only a date that some function took ("Saturday, 12 December 2026" above its functions) is used
    lines.forEach((l, i) => { const d = findDate(l, year); if (free(i) && d && !pieces(l, [], year).length && out.events.some(e => e.date.startsWith(iso(d, '')))) used[i] = true; });

    // Phone numbers (Indian mobiles), each once; lines with only numbers on them are used
    const ph = digits(text).match(PHONE) || [];
    out.phones = [...new Set(ph.map(p => p.replace(/\D/g, '').slice(-10)))].slice(0, 8).map(p => `${p.slice(0, 5)} ${p.slice(5)}`);
    lines.forEach((l, i) => { if (free(i) && phoneOnly(l)) used[i] = true; });
    out.hashtag = (text.match(/#[\wऀ-ॿ]{3,40}/) || [''])[0];
    lines.forEach((l, i) => { if (free(i) && out.hashtag && l === out.hashtag) used[i] = true; });
    // Verses with no marks around them: a blessing word on a line of its own (a doha's halves together)
    lines.forEach((l, i) => {
      if (!free(i) || !VERSE.test(l) || /\d/.test(digits(l)) || l.split(' ').length < 3 || INVITERS.test(l)) return;
      const both = free(i + 1) && /[।,]$/.test(l) && /[।॥]$/.test(lines[i + 1]) && !/\d/.test(digits(lines[i + 1]));
      out.quotes.push(both ? l + '\n' + lines[i + 1] : l); used[i] = true; if (both) used[i + 1] = true;
    });
    const JOINER = /^(?:weds?|&|and|with|संग|सँग|❤|♥)$/i;
    if (LATE.test(out.host1) || LATE.test(out.host2)) {
      if (LATE.test(out.host1)) out.host1 = ''; if (LATE.test(out.host2)) out.host2 = '';
      if (!out.host1 && out.host2) { out.host1 = out.host2; out.host2 = ''; }
    }
    // late people joined by "AND" / "&" on lines of their own are the grandparents ("Lt. Smt. Dropati" / AND / "Lt. Sh. Angur Singh")
    lines.forEach((l, i) => {
      if (!LATE.test(l)) return;
      const both = JOINER.test(lines[i + 1] || '') && LATE.test(lines[i + 2] || '') ? `${l} & ${lines[i + 2]}` : l;
      if (!out.grandparents1 && !out.grandparents2 || both !== l && !(out.grandparents1 || '').includes(lines[i + 2])) out.grandparents1 = both;
    });
    // the couple: the names around a "weds" / "&" / "संग" line of its own (never a late person or a sentence)
    if (!out.host1) {
      const nameish = x => x && x.split(' ').length <= 4 && !LATE.test(x) && !PHRASE.test(x) && !NOT_A_NAME.test(x) && !/\d/.test(digits(x)) && /^[A-Z\u0900-\u097F]/.test(x);
      const i = lines.findIndex((l, k) => JOINER.test(l) && nameish(lines[k - 1]) && nameish(lines[k + 1]));
      if (i > 0) { out.host1 = cleanName(lines[i - 1]); out.host2 = cleanName(lines[i + 1]); }
    }
    tidyUp(out, lines, used);
    out.extra = lines.filter((l, i) => !used[i]);
    return out;
  }
  const noPhonesKeep = s => s.replace(/\s*(?:[,;]\s*)?(?:mob|ph|phone|contact|मो|सम्पर्क)[॰.:]*\s*(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b/gi, '');

  // Functions named on a line, left to right (a word that fits two entries counts once; not inside a longer word)
  function eventHits(l) {
    const hits = [];
    EVENTS.forEach(ev => {
      for (const m of l.matchAll(new RegExp(ev[0].source, 'gi'))) {
        const b = l[m.index - 1] || '', a = l[m.index + m[0].length] || '';
        if (DEV.test(b) || /[A-Za-z]/.test(b) || (/[A-Za-z]$/.test(m[0]) && /[A-Za-z]/.test(a) && !/^s(?![A-Za-z])/.test(l.slice(m.index + m[0].length)))) continue;
        hits.push({ ev, at: m.index, end: m.index + m[0].length }); break;
      }
    });
    hits.sort((a, b) => a.at - b.at);
    return hits.filter((h, j) => !hits.slice(0, j).some(p => h.at < p.end));
  }
  // A function's line starts with its name ("Haldi: …", "Our Haldi", "हल्दी मेहंदी"), or names it next to a date or time;
  // "12, Tilak Nagar" is an address, "मेरे चाचू की शादी" is not a function line
  function isEventLine(l) {
    const hits = eventHits(l);
    if (!hits.length) return false;
    const pre = l.slice(0, hits[0].at), first = !/\d/.test(pre) && (pre.match(/[A-Za-z\u0900-\u097F]+/g) || []).length <= 2;
    const dated = dateSpans(l, 2000).length > 0 || findTimes(l).length > 0;
    // "\u0936\u0941\u092D \u0935\u093F\u0935\u093E\u0939" / "Birthday" alone: a short line of its own, or one with a date
    if (hits.every(h => h.ev[3])) return dated || (first && l.split(' ').length <= 4);
    return first || dated;
  }
  function cleanName(s) {
    s = clean(String(s || ''));
    for (let k = 0; k < 3; k++) s = s.replace(/^(shri|smt|sh|mr|mrs|ms|miss|dr|chi|chiranjeevi?|ayu|ayushmati|sau|kum|kumari|sushri|kan|श्रीमती|श्री|कुमारी|कु|सुश्री|चिरंजीवी?|चि|आयुष्मती|आयुष्मान|आयु|सौभाग्यकांक्षिणी|सौ|कां|डॉ)(?:[\s.॰]+|$)/i, '');
    return clean(s.replace(/[,()।|].*$/, '')).slice(0, 40);
  }

  // A card's details → the Studio's card (names, parents as families, functions, venue)
  function toCard(f, base = {}) {
    const date = (f.events.find(e => e.date) || {}).date || '';
    return { ...base, type: f.type, host1: f.host1, host2: f.host2, date, venue: f.venue,
      events: f.events.filter(e => e.name).map(e => ({ name: e.name, date: e.date, venue: e.venue || '' })),
      families: [f.parents1 && { side: f.lang === 'hi' ? 'वर पक्ष' : 'Groom’s family', parents: f.parents1 }, f.parents2 && { side: f.lang === 'hi' ? 'वधु पक्ष' : 'Bride’s family', parents: f.parents2 }].filter(Boolean),
      rsvp: (f.phones[0] || '').replace(/\D/g, ''), hashtag: f.hashtag || '', address: f.address, phones: f.phones };
  }

  // ---- In the browser: the PDF's text lines and a picture of its first page ----
  let lib = null;
  function load() {
    if (typeof window === 'undefined') return Promise.reject(new Error('no browser'));
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    return lib || (lib = new Promise((resolve, reject) => {
      const s = Object.assign(document.createElement('script'), { src: PDFJS + 'pdf.min.js' });
      s.onload = () => {
        const L = window.pdfjsLib;
        L.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.js';
        // A worker cannot start straight from another site (Safari stops it): start one from this page that loads it
        try {
          const url = URL.createObjectURL(new Blob([`importScripts(${JSON.stringify(PDFJS + 'pdf.worker.min.js')});`], { type: 'text/javascript' }));
          L.GlobalWorkerOptions.workerPort = new Worker(url);
        } catch (e) { /* pdf.js falls back to reading on the page */ }
        resolve(L);
      };
      s.onerror = () => { lib = null; reject(new Error('could not load the PDF reader (check the internet)')); };
      document.head.appendChild(s);
    }));
  }
  async function read(file, opts = {}) {
    const pdfjs = await load();
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()), cMapUrl: PDFJS + 'cmaps/', cMapPacked: true }).promise;
    const pages = [], pictures = [];
    for (let n = 1; n <= Math.min(pdf.numPages, 8); n++) {
      const page = await pdf.getPage(n);
      // text items grouped into lines by their height on the page
      const tc = await page.getTextContent(), rows = [], pl = [], ps = [];
      for (const it of tc.items) {
        if (!it.str || !it.str.trim()) continue;
        const y = Math.round(it.transform[5]), row = rows.find(r => Math.abs(r.y - y) < 4);
        (row || (rows.push({ y, items: [] }), rows[rows.length - 1])).items.push({ x: it.transform[4], w: it.width || 0, z: Math.hypot(it.transform[2], it.transform[3]) || it.height || 10, s: it.str });
      }
      // Pieces of one word sit side by side; a space only where there is a real gap (Hindi comes in many small pieces)
      rows.sort((a, b) => b.y - a.y).forEach(r => {
        let out = '', prev = null;
        for (const i of r.items.sort((a, b) => a.x - b.x)) {
          if (prev) out += i.x - (prev.x + prev.w) > Math.max(prev.z, i.z) * .18 ? ' ' : '';
          out += i.s; prev = i;
        }
        pl.push(out); ps.push(Math.max(...r.items.map(i => i.z)));
      });
      const vp = page.getViewport({ scale: 1 }), k = 900 / Math.max(vp.width, vp.height), c = document.createElement('canvas');
      const v2 = page.getViewport({ scale: k });
      c.width = Math.round(v2.width); c.height = Math.round(v2.height);
      await page.render({ canvasContext: c.getContext('2d'), viewport: v2 }).promise;
      pictures.push(c.toDataURL('image/jpeg', .85));
      const text = pl.join(' ');
      // Old Hindi fonts (Kruti Dev and the like) come out as Latin gibberish; pictures of cards have no text at all
      const usable = text.replace(/\s/g, '').length > 30 && !/[¼½¾ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÑÒÓÔÕÖ×ØÙÚÛÜÝÞß]{3}/.test(text);
      pages.push({ n, page, lines: pl, sizes: ps, usable });
    }
    const lines = pages.flatMap(p => p.lines), sizes = pages.flatMap(p => p.sizes);
    const readable = pages.some(p => p.usable);
    let details = readable ? withNames(parse(lines), lines, sizes) : null, how = 'text', seen = lines, big = '';
    // Every page without usable text (pictures of the card, old Hindi fonts) is read off the page itself (OCR);
    // when the text there has no names at all, every page is read that way
    const todo = pages.filter(p => !p.usable).length ? pages.filter(p => !p.usable) : details && details.host1 ? [] : pages;
    if (opts.ocr !== false && todo.length) {
      try {
        for (const [k, p] of todo.entries()) {
          const vp = p.page.getViewport({ scale: 1 }), v2 = p.page.getViewport({ scale: 2200 / Math.max(vp.width, vp.height) }), c = document.createElement('canvas');
          c.width = Math.round(v2.width); c.height = Math.round(v2.height);
          const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
          await p.page.render({ canvasContext: g, viewport: v2 }).promise;
          const src = c.toDataURL('image/png'); if (!big) big = src;
          const say = (f, msg) => opts.progress && opts.progress((k + Math.min(1, f || 0)) / todo.length, `Page ${p.n} of ${pages.length}: ${msg || `reading every word… ${Math.round((f || 0) * 100)}%`}`);
          p.ocr = await ocr(src, say);
        }
        let all = pages.flatMap(p => p.ocr ? p.ocr.lines : p.lines), allSizes = pages.flatMap(p => p.ocr ? p.ocr.sizes : p.sizes);
        let found = withNames(parse(all, { ocr: pages.every(p => p.ocr) }), all, allSizes);
        const couple = d => d && d.host1 && (d.host2 || !/wedding|engagement|reception|anniversary|sangeet|haldi|mehendi/.test(d.type));
        for (const how of [{ passes: true }, { florence: true }]) {
          if (couple(found)) break;
          await addStylish(pages.filter(p => p.ocr), opts.progress, how);
          all = pages.flatMap(p => p.ocr ? p.ocr.lines : p.lines); allSizes = pages.flatMap(p => p.ocr ? p.ocr.sizes : p.sizes);
          found = withNames(parse(all, { ocr: pages.every(p => p.ocr) }), all, allSizes);
        }
        seen = all;
        if (found.host1 || !details) { details = found; how = readable ? 'text + pictures' : 'pictures'; }
      } catch (e) { /* offline: the details are typed instead */ }
    }
    if (details && !details.lines) details.lines = seen.map(clean).filter(Boolean);
    return { lines, seen, pictures, big, pages: pdf.numPages, readable: !!(details && details.host1) || readable, details, how };
  }
  // Stylish English names Tesseract could not read: the vision model looks at the first pages (where names are
  // printed) only when the names are still missing, and its lines are put in their place on the page
  async function addStylish(pages, progress, how = { passes: true, florence: true }) {
    for (const [k, p] of pages.slice(0, 2).entries()) {
      if (!p.ocr || !p.ocr.img) continue;
      let extra = [];
      // more Tesseract passes first (other sizes and ways of reading), then the vision model for script fonts
      if (how.passes) try { const more = await ocr(p.ocr.img.src, (f, msg) => progress && progress(f, `Page ${k + 1}: ${msg || `looking closer… ${Math.round((f || 0) * 100)}%`}`), { passes: EXTRA_PASSES });
        more.lines.forEach((s, i) => extra.push({ s, y: more.ys[i], z: more.sizes[i] })); } catch (e) { /* keep what was read */ }
      if (how.florence) try { extra.push(...await florenceLines(p.ocr.img, (f, msg) => progress && progress(f, `Page ${k + 1}: ${msg}`))); } catch (e) { /* too slow here: skipped */ }
      for (const f of extra) {
        if (p.ocr.lines.some((l, i) => Math.abs((p.ocr.ys[i] || 0) - f.y) < .02 && norm(l).includes(norm(f.s).slice(0, 5)))) continue;
        const at = p.ocr.ys.findIndex(y => y > f.y), i = at < 0 ? p.ocr.lines.length : at;
        p.ocr.lines.splice(i, 0, f.s); p.ocr.sizes.splice(i, 0, f.z); p.ocr.ys.splice(i, 0, f.y);
      }
    }
  }
  // The pages of a card as pictures (screenshots, photos, JPG/PNG/WebP), in the order of their file names
  // ("page 2" before "page 10"): every picture is read like a picture page of a PDF (OCR in several passes + the
  // vision model), then the details are taken from all the pages together.
  const fileUrl = f => new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = () => reject(new Error(`could not open ${f.name}`)); r.readAsDataURL(f); });
  async function readImages(files, opts = {}) {
    const list = [...(files || [])].filter(f => /^image\//.test(f.type) || /\.(jpe?g|png|webp|gif|bmp)$/i.test(f.name))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })).slice(0, 12);
    if (!list.length) throw new Error('please choose pictures (JPG, PNG or WebP) of the card');
    const pictures = [], pages = [];
    for (const f of list) {
      const img = await loadImg(await fileUrl(f)).catch(() => { throw new Error(`${f.name} is not a picture this browser can open (iPhone HEIC: take a screenshot or save it as JPG)`); });
      const small = document.createElement('canvas'), k = 900 / Math.max(img.width, img.height);
      small.width = Math.round(img.width * Math.min(1, k)); small.height = Math.round(img.height * Math.min(1, k));
      small.getContext('2d').drawImage(img, 0, 0, small.width, small.height);
      pictures.push(small.toDataURL('image/jpeg', .85));
      // the reader works on a sharp copy: small screenshots are enlarged, huge photos brought down
      const big = document.createElement('canvas'), kb = 2200 / Math.max(img.width, img.height);
      big.width = Math.round(img.width * kb); big.height = Math.round(img.height * kb);
      const g = big.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, big.width, big.height); g.imageSmoothingQuality = 'high';
      g.drawImage(img, 0, 0, big.width, big.height);
      pages.push({ name: f.name, src: big.toDataURL('image/png') });
    }
    for (const [k, p] of pages.entries()) {
      const say = (f, msg) => opts.progress && opts.progress((k + Math.min(1, f || 0)) / pages.length, `Picture ${k + 1} of ${pages.length}: ${msg || `reading every word… ${Math.round((f || 0) * 100)}%`}`);
      p.ocr = await ocr(p.src, say);
    }
    let all = pages.flatMap(p => p.ocr.lines), sizes = pages.flatMap(p => p.ocr.sizes);
    let details = withNames(parse(all, { ocr: true }), all, sizes);
    const couple = d => d && d.host1 && (d.host2 || !/wedding|engagement|reception|anniversary|sangeet|haldi|mehendi/.test(d.type));
    for (const how of [{ passes: true }, { florence: true }]) {
      if (couple(details)) break;
      await addStylish(pages, opts.progress, how);
      all = pages.flatMap(p => p.ocr.lines); sizes = pages.flatMap(p => p.ocr.sizes);
      details = withNames(parse(all, { ocr: true }), all, sizes);
    }
    if (details && !details.lines) details.lines = all.map(clean).filter(Boolean);
    return { lines: [], seen: all, pictures, big: pages[0] && pages[0].src, pages: pages.length, readable: !!(details && details.host1), details, how: 'pictures', files: list.map(f => f.name) };
  }
  // When the wording gives no names (no "weds", no Chi./Ayu.), the biggest short lines on the card are the names:
  // the heading, the invocation, dates and places are left out. "Aarav & Diya" in one big line is split.
  const NOT_A_NAME = /invit|wedding|marriage|ceremony|save\s*the\s*date|together|celebrat|request|pleasure|family|blessing|ganesh|ganesha|namah|shubh|vivah|reception|engagement|birthday|anniversary|programme|venue|rsvp|विवाह|शुभ|गणेश|नमः|ॐ|आमंत्रण|आमन्त्रण|निमंत्रण|निमन्त्रण|सादर|परिवार|कार्यक्रम|स्थल|स्थान|निवेदक|दर्शनाभिलाषी|सगाई|जन्मदिन|मंगल|आशीर्वाद/i;
  const PHRASE = /\b(together|families|family|their|invite|request|honour|honor|presence|pleasure|celebrate|join\s*us|you)\b|परिवार|आमंत्रित|सादर|पधारें/i;
  const LATE = /^(?:late|lt\.?|swargiya|swargiy|स्व[॰.]?|स्वर्गीय|स्वर्गवासी)(?=[\s.]|$)/i;
  function withNames(d, lines, sizes) {
    if (d && (PHRASE.test(d.host1 || '') || PHRASE.test(d.host2 || '') || LATE.test(d.host1 || '') || LATE.test(d.host2 || ''))) {
      const late = [d.host1, d.host2].filter(h => LATE.test(h || ''));
      d = { ...d, host1: '', host2: '', grandparents1: d.grandparents1 || late.join(' & ') };
    }
    if (!d || d.host1 || !lines || !lines.length) return d;
    const JOIN = /\s+(?:weds|wed|with|and|&|संग|सँग|❤|♥)\s+/i;
    const cand = lines.map((l, i) => ({ l: clean(l).replace(/^[^A-Za-z\u0900-\u097F]+|[^A-Za-z\u0900-\u097F.]+$/g, ''), z: sizes[i] || 0, i }))
      .filter(c => c.l.length >= 2 && c.l.split(' ').length <= 5 && !/\d/.test(digits(c.l)) && !NOT_A_NAME.test(c.l.replace(JOIN, ' ')) && !PHRASE.test(c.l) && !LATE.test(c.l) && !/^(?:smt|shri|sh|mr|mrs|श्रीमती|श्री)\b\.?\s/i.test(c.l)
        && !EVENTS.some(([re]) => re.test(c.l)) && !VENUE_WORDS.test(c.l) && !/^(&|and|weds|संग|के साथ)$/i.test(c.l))
      .sort((a, b) => b.z - a.z || a.i - b.i);
    if (!cand.length) return d;
    const top = cand[0];
    if (JOIN.test(top.l)) { const [a, b] = top.l.split(JOIN); return { ...d, host1: cleanName(a), host2: cleanName(b || '') }; }
    // a second name: nearly as big, close by (within a few lines)
    const second = cand.slice(1).find(c => c.z >= top.z * .75 && Math.abs(c.i - top.i) <= 4);
    const [h1, h2] = second && second.i < top.i ? [second, top] : [top, second];
    return { ...d, host1: cleanName(h1.l), host2: h2 ? cleanName(h2.l) : (d.host2 || '') };
  }
  // Reading a page picture (English + Hindi) with Tesseract, loaded only when a card needs it
  let ocrLib = null;
  const loadOcr = () => ocrLib = ocrLib || new Promise((resolve, reject) => {
    if (window.Tesseract) return resolve(window.Tesseract);
    const sc = Object.assign(document.createElement('script'), { src: 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js' });
    sc.onload = () => resolve(window.Tesseract);
    sc.onerror = () => { ocrLib = null; reject(new Error('offline')); };
    document.head.appendChild(sc);
  });
  // Reading the page picture, thoroughly: the picture is prepared several ways (grey with strong contrast, turned
  // light-on-dark into dark-on-light when the card is dark, pure black and white) and read at two sizes (big for
  // small print, smaller for big decorative names) and two ways (the whole page, and scattered text). The lines
  // from every pass are merged: for each line on the card the most confident reading wins, in top-to-bottom order.
  function loadImg(src) {
    return new Promise((resolve, reject) => { const im = new Image(); im.onload = () => resolve(im); im.onerror = reject; im.src = src; });
  }
  function prepared(img, width, mode) {
    const k = width / img.width, c = document.createElement('canvas');
    c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    const g = c.getContext('2d'); g.drawImage(img, 0, 0, c.width, c.height);
    const im = g.getImageData(0, 0, c.width, c.height), p = im.data, n = p.length / 4, grey = new Uint8ClampedArray(n);
    let sum = 0; const hist = new Array(256).fill(0);
    for (let q = 0; q < n; q++) { const v = Math.round(p[q * 4] * .299 + p[q * 4 + 1] * .587 + p[q * 4 + 2] * .114); grey[q] = v; sum += v; hist[v]++; }
    const dark = sum / n < 128;
    // contrast: stretch the 2nd–98th percentile to the full range
    let lo = 0, hi = 255, acc = 0; for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc > n * .02) { lo = v; break; } }
    acc = 0; for (let v = 255; v >= 0; v--) { acc += hist[v]; if (acc > n * .02) { hi = v; break; } }
    // Otsu's threshold for the black-and-white pass
    let best = 128; if (mode === 'bw') { let wB = 0, sB = 0, maxV = -1, total = 0; for (let v = 0; v < 256; v++) total += v * hist[v];
      for (let v = 0; v < 256; v++) { wB += hist[v]; if (!wB) continue; const wF = n - wB; if (!wF) break; sB += v * hist[v]; const mB = sB / wB, mF = (total - sB) / wF, b2 = wB * wF * (mB - mF) * (mB - mF); if (b2 > maxV) { maxV = b2; best = v; } } }
    for (let q = 0; q < n; q++) {
      let v = Math.max(0, Math.min(255, (grey[q] - lo) * 255 / Math.max(1, hi - lo)));
      if (dark !== (mode === 'neg')) v = 255 - v; // dark cards turned light; the negative pass turns light-on-dark badges around
      if (mode === 'bw') v = (dark ? 255 - grey[q] : grey[q]) > (dark ? 255 - best : best) ? 255 : 0;
      p[q * 4] = p[q * 4 + 1] = p[q * 4 + 2] = v; p[q * 4 + 3] = 255;
    }
    g.putImageData(im, 0, 0);
    return c;
  }
  const norm = x => x.toLowerCase().replace(/[^a-z0-9\u0900-\u097F]/g, '');

  // Decorations read as letters ("PD 0000000", "डे NY डे", "[ J [ J"): no real word, only marks and stray letters.
  // A day number, a month, a weekday or a time on its own is kept (date badges are printed that way).
  function ocrNoise(t, conf) {
    if (/(.)\1{5,}/.test(t.replace(/\s/g, ''))) return true;
    const s = t.replace(/[^\w\u0900-\u097F:.,&#@'’/-]+/g, ' ').trim();
    if (/^\d{1,2}$/.test(digits(s)) || MON_START.test(s) || WEEKDAY_ONLY.test(s.replace(/\s/g, '')) || findTimes(s).length && s.length < 14) return false;
    const words = s.split(/\s+/).filter(w => /[A-Za-z]{3,}|[\u0900-\u097F]{2,}[\u093E-\u094D\u0902\u0903]*[\u0900-\u097F]/.test(w) || /^\d{3,}$/.test(w) || /^#/.test(w));
    if (!words.length) return true;
    const letters = (s.match(/[A-Za-z\u0900-\u097F]/g) || []).length;
    return letters < s.replace(/\s/g, '').length * .45 && conf < 85;
  }
  // A second reader for stylish English (script fonts Tesseract cannot read): Microsoft's Florence-2 vision model,
  // run in the browser with Transformers.js (no key, no server). About 200 MB the first time, then cached.
  let flo = null;
  const loadFlorence = report => flo = flo || (async () => {
    const T = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1');
    const id = 'onnx-community/Florence-2-base-ft', gpu = !!(navigator.gpu && await navigator.gpu.requestAdapter().catch(() => null));
    const files = {};
    const opts = { device: gpu ? 'webgpu' : 'wasm',
      dtype: gpu ? { embed_tokens: 'fp16', vision_encoder: 'fp16', encoder_model: 'q4', decoder_model_merged: 'q4' } : { embed_tokens: 'fp32', vision_encoder: 'fp32', encoder_model: 'q8', decoder_model_merged: 'q8' },
      progress_callback: p => { if (report && p.status === 'progress' && p.total) { files[p.file] = [p.loaded, p.total]; const all = Object.values(files), got = all.reduce((a, f) => a + f[0], 0), tot = all.reduce((a, f) => a + f[1], 0); report(got / tot); } } };
    const [model, processor, tokenizer] = await Promise.all([T.Florence2ForConditionalGeneration.from_pretrained(id, opts), T.AutoProcessor.from_pretrained(id), T.AutoTokenizer.from_pretrained(id)]);
    return { T, model, processor, tokenizer };
  })().catch(e => { flo = null; throw e; });
  // The card in square pieces from top to bottom (the model looks at a square, so tall cards are read in parts)
  async function florenceLines(img, progress) {
    const say = (f, msg) => progress && progress(f, msg);
    const { T, model, processor, tokenizer } = await loadFlorence(f => say(f, `Getting the AI reader ready (first time only, about 200 MB)… ${Math.round(f * 100)}%`));
    const W = 900, H = Math.round(img.height * W / img.width), step = Math.round(W * .75), out = [];
    const tops = []; for (let y = 0; y < H; y += step) { tops.push(Math.min(y, Math.max(0, H - W))); if (y + W >= H) break; }
    for (const [k, top] of tops.entries()) {
      const t0 = Date.now(), tick = setInterval(() => { const sec = Math.round((Date.now() - t0) / 1000); say((k + Math.min(.95, sec / 60)) / tops.length, `Reading stylish writing… part ${k + 1} of ${tops.length} · ${sec}s`); }, 1000);
      const c = document.createElement('canvas'); c.width = W; c.height = Math.min(W, H);
      const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
      g.drawImage(img, 0, -top, W, H);
      const image = await T.RawImage.fromURL(c.toDataURL('image/png'));
      const task = '<OCR_WITH_REGION>';
      const inputs = { ...tokenizer(processor.construct_prompts(task)), ...(await processor(image)) };
      let ids;
      try { ids = await Promise.race([model.generate({ ...inputs, max_new_tokens: 512 }), new Promise((_, no) => setTimeout(() => no(new Error('too slow on this computer')), 90000))]); }
      finally { clearInterval(tick); }
      const text = tokenizer.batch_decode(ids, { skip_special_tokens: false })[0];
      const r = processor.post_process_generation(text, task, image.size)[task] || { labels: [], quad_boxes: [] };
      r.labels.forEach((label, i) => {
        const s = String(label || '').replace(/<\/?s>|<pad>/g, '').replace(/\s+/g, ' ').trim(), q = r.quad_boxes[i] || [];
        if (!/[A-Za-z]{2}/.test(s) || /[\u0900-\u097F]/.test(s)) return; // English only: Hindi is Tesseract's
        const ys = [q[1], q[3], q[5], q[7]].filter(v => v != null), y0 = Math.min(...ys), y1 = Math.max(...ys);
        const xs = [q[0], q[2], q[4], q[6]].filter(v => v != null);
        out.push({ s, conf: 82, y: (top + (y0 + y1) / 2) / H, z: (y1 - y0) / H * 1000, x0: Math.min(...xs) / W, x1: Math.max(...xs) / W, src: 'florence' });
      });
    }
    return out;
  }
  // A few Tesseract workers, made once (each loads the English + Hindi data) and closed after a minute unused
  let pool = null, poolTimer = 0;
  async function ocrWorkers(T) {
    clearTimeout(poolTimer);
    if (!pool) {
      const n = Math.max(1, Math.min(3, (navigator.hardwareConcurrency || 2) - 1));
      pool = Promise.all(Array.from({ length: n }, async () => { const w = { onProgress: null }; w.worker = await T.createWorker('eng+hin', 1, { logger: m => { if (w.onProgress && m.status === 'recognizing text') w.onProgress(m.progress); } }); return w; }))
        .catch(e => { pool = null; throw e; });
    }
    return pool;
  }
  function ocrIdle() {
    clearTimeout(poolTimer);
    poolTimer = setTimeout(async () => { const p = pool; pool = null; if (p) (await p).forEach(w => w.worker.terminate()); }, 60000);
  }
  // Badges: small dark shapes on a light page (round date badges, ribbons, labels) hold light words that a
  // whole-page read skips. Each is found (a patch of dark pixels, compact and not too big), cut out, turned
  // light-on-dark into dark-on-light, enlarged and read on its own; its words keep their place on the page.
  async function badgeLines(img, worker) {
    const W = 600, H = Math.round(img.height * W / img.width), c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0, W, H);
    const px = g.getImageData(0, 0, W, H).data, lum = new Uint8Array(W * H);
    let sum = 0; for (let i = 0; i < W * H; i++) { lum[i] = px[i * 4] * .299 + px[i * 4 + 1] * .587 + px[i * 4 + 2] * .114; sum += lum[i]; }
    if (sum / (W * H) < 128) return []; // a dark page is read turned around already
    const dark = new Uint8Array(W * H); for (let i = 0; i < W * H; i++) dark[i] = lum[i] < 110 ? 1 : 0;
    const seen = new Uint8Array(W * H), boxes = [], stack = [];
    for (let i = 0; i < W * H; i++) {
      if (!dark[i] || seen[i]) continue;
      let n = 0, x0 = W, y0 = H, x1 = 0, y1 = 0; stack.push(i); seen[i] = 1;
      while (stack.length) { const k = stack.pop(), x = k % W, y = (k / W) | 0; n++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
        for (const q of [k - 1, k + 1, k - W, k + W]) if (q >= 0 && q < W * H && !seen[q] && dark[q] && Math.abs((q % W) - x) <= 1) { seen[q] = 1; stack.push(q); } }
      const w = x1 - x0 + 1, h = y1 - y0 + 1, area = w * h;
      if (w < 24 || h < 18 || area < W * H * .002 || area > W * H * .12 || n / area < .35 || w / h > 6 || h / w > 2.5) continue;
      boxes.push({ x0, y0, x1, y1 });
    }
    const out = [], k = img.width / W;
    for (const b of boxes.slice(0, 16)) {
      const pad = 3, sx = Math.max(0, (b.x0 - pad) * k), sy = Math.max(0, (b.y0 - pad) * k), sw = Math.min(img.width - sx, (b.x1 - b.x0 + 2 * pad) * k), sh = Math.min(img.height - sy, (b.y1 - b.y0 + 2 * pad) * k);
      const scale = 520 / Math.max(sw, sh), cc = document.createElement('canvas'); cc.width = Math.round(sw * scale); cc.height = Math.round(sh * scale);
      const cg = cc.getContext('2d'); cg.drawImage(img, sx, sy, sw, sh, 0, 0, cc.width, cc.height);
      const im = cg.getImageData(0, 0, cc.width, cc.height), p = im.data;
      for (let i = 0; i < p.length; i += 4) { const v = 255 - (p[i] * .299 + p[i + 1] * .587 + p[i + 2] * .114); p[i] = p[i + 1] = p[i + 2] = v > 140 ? 255 : v < 90 ? 0 : v; }
      cg.putImageData(im, 0, 0);
      await worker.setParameters({ tessedit_pageseg_mode: '6', preserve_interword_spaces: '1' });
      const { data } = await worker.recognize(cc);
      for (const l of data.lines || []) {
        const words = (l.words || []).filter(x => x.text && x.text.trim());
        const conf = words.length ? words.reduce((a, x) => a + x.confidence, 0) / words.length : l.confidence;
        const text = String(l.text || '').replace(/\s+/g, ' ').trim();
        if (!text || conf < 40) continue;
        const cy = (sy + (l.bbox.y0 + l.bbox.y1) / 2 / scale) / img.height;
        out.push({ s: text, conf: Math.min(conf, 80), y: cy, z: (l.bbox.y1 - l.bbox.y0) / scale / img.height * 1000, x0: sx / img.width, x1: (sx + sw) / img.width, src: 'badge' });
      }
    }
    return out;
  }
  const EXTRA_PASSES = [[1400, 'grey', '6'], [1100, 'bw', '11'], [600, 'bw', '11'], [500, 'grey', '11']];
  async function ocr(src, progress, opts2 = {}) {
    if (!src) return { lines: [], sizes: [] };
    const T = await loadOcr(), img = await loadImg(src);
    const passes = opts2.passes || [[2000, 'grey', '3'], [2000, 'grey', '11'], [1100, 'grey', '11'], [2000, 'bw', '3'], [750, 'grey', '11'], [1600, 'neg', '11'], [1000, 'neg', '11']];
    // "चि॰" is often read as "चि०" (a zero): the abbreviation mark goes back so the name is found
    const fix = x => String(x || '').replace(/([\u0900-\u0965\u0970-\u097F])०/g, '$1॰').replace(/[|_~]+/g, ' ').replace(/\s+/g, ' ').trim()
      .replace(/^(?:[@©®=«»*%&$¢•·°§¶+>]+\s*)+(?=[A-Za-z\u0900-\u097F])/, '').replace(/(?:\s+[«»*%&$¢•·°§¶+<>=©®]+|\s+[ःः]|\s[A-Za-z])$/, '').replace(/(\w);(\w)/g, '$1$2');
    const found = [], share = passes.map(() => 0), tell = () => progress && progress(share.reduce((a, b) => a + b, 0) / passes.length);
    // the passes run side by side on a few Tesseract workers (one per spare processor core), kept ready between pages
    const workers = await ocrWorkers(T);
    let next = 0;
    await Promise.all(workers.map(async w => {
      while (next < passes.length) {
        const k = next++, [width, mode, psm] = passes[k];
        const c = prepared(img, width, mode);
        w.onProgress = f => { share[k] = f; tell(); };
        await w.worker.setParameters({ tessedit_pageseg_mode: psm, preserve_interword_spaces: '1' });
        const { data } = await w.worker.recognize(c);
        share[k] = 1; tell();
        for (const l of data.lines || []) {
          const words = (l.words || []).filter(x => x.text && x.text.trim());
          const conf = words.length ? words.reduce((a, x) => a + x.confidence, 0) / words.length : l.confidence;
          const text = fix(l.text);
          if (window.__ocrDebug) window.__ocrDebug.push([width, mode, psm, Math.round(conf), text]);
          if (!text || conf < 45 || norm(text).length < 2) continue;
          if (ocrNoise(text, conf)) continue;
          found.push({ s: text, conf, y: (l.bbox.y0 + l.bbox.y1) / 2 / c.height, z: (l.bbox.y1 - l.bbox.y0) / c.height * 1000, x0: l.bbox.x0 / c.width, x1: l.bbox.x1 / c.width });
        }
      }
    }));
    // the badges' words, read one badge at a time
    try { for (const b of await badgeLines(img, workers[0].worker)) if (!ocrNoise(b.s, b.conf)) found.push({ ...b, s: fix(b.s) }); }
    catch (e) { if (window.__ocrDebug) window.__ocrDebug.push(['badges failed', e.message]); }
    ocrIdle();
    // stylish English: the vision model reads what Tesseract could not (its readings join the same merge)
    if (opts2.florence === true) {
      try { found.push(...await florenceLines(img, progress)); }
      catch (e) { if (window.__ocrDebug) window.__ocrDebug.push(['florence failed', e.message]); }
    }
    // one reading per place on the card: lines at the same height are the same line (the most confident wins);
    // a line seen in several passes gets a bonus
    found.sort((a, b) => b.conf - a.conf);
    const kept = [];
    const alike = (a, b) => { const x = norm(a), y = norm(b); if (!x || !y) return false; if (x.includes(y.slice(0, 6)) || y.includes(x.slice(0, 6))) return true;
      let same = 0; for (let i = 0; i < Math.min(x.length, y.length); i++) if (x[i] === y[i]) same++; return same / Math.max(x.length, y.length) > .6; };
    // how much two readings cover the same stretch of the line, left to right (0 = side by side, 1 = same place)
    const across = (a, b) => { if (a.x0 == null || b.x0 == null) return 1; const o = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0); return o <= 0 ? 0 : o / Math.max(.01, Math.min(a.x1 - a.x0, b.x1 - b.x0)); };
    for (const f of found) {
      const near = Math.max(.012, f.z / 1000 * .6);
      const same = kept.find(k => Math.abs(k.y - f.y) < Math.max(near, k.z / 1000 * .6) && (across(k, f) > .5 || alike(k.s, f.s) && across(k, f) > .15));
      if (same) {
        same.seen++;
        const key = f.s.replace(/\s+/g, ' '); same.votes[key] = (same.votes[key] || 0) + 1 + f.conf / 1000;
        // a longer reading of the same line (a pass caught more of it) replaces a cut one
        if (norm(f.s).length > norm(same.s).length * 1.3 && f.conf > same.conf - 8) { same.s = f.s; same.votes = { [key]: same.votes[key] + 2 }; }
        continue;
      }
      kept.push({ ...f, seen: 1, votes: { [f.s.replace(/\s+/g, ' ')]: 1 + f.conf / 1000 } });
    }
    // each line as most passes read it ("Aanya" read four times beats "Aanva" read once)
    kept.forEach(k => { const best = Object.entries(k.votes).sort((a, b) => b[1] - a[1])[0]; if (best) k.s = best[0]; });
    // a line holding the same words twice ("वेश, माधवी एवं मायरा वंश, माधवी एवं मायरा"): one copy, the one another pass read on its own
    kept.forEach(k => { const w = k.s.split(' ').filter(x => /[\w\u0900-\u097F]/.test(x) && !/^[।॥|]+$/.test(x)), h = Math.floor(w.length / 2);
      if (w.length < 4 || w.length % 2) return;
      const a = w.slice(0, h).join(' '), b = w.slice(h).join(' ');
      if (!alike(a, b)) return;
      const alone = Object.keys(k.votes).map(v => v.trim());
      k.s = alone.includes(a) && !alone.includes(b) ? a : b; });
    // a line read once short and once whole, one under the other: the whole one stays
    kept.sort((a, b) => a.y - b.y);
    for (let i = kept.length - 1; i > 0; i--) { const a = norm(kept[i].s), b = norm(kept[i - 1].s);
      if (a.length >= 8 && b.length >= 8 && Math.abs(kept[i].y - kept[i - 1].y) < .03) { if (b.startsWith(a)) kept.splice(i, 1); else if (a.startsWith(b)) kept.splice(i - 1, 1); } }
    // a short piece that a longer reading of the same row already holds
    const sameRow = (a, b) => Math.abs(a.y - b.y) < Math.max(.006, Math.min(a.z, b.z) / 1000 * .55);
    for (let i = kept.length - 1; i >= 0; i--) {
      const small = kept[i];
      if (kept.some(big => big !== small && sameRow(big, small) && norm(big.s).length > norm(small.s).length && norm(big.s).includes(norm(small.s)) && (big.x0 == null || small.x0 == null || small.x0 >= big.x0 - .03 && small.x1 <= big.x1 + .03))) kept.splice(i, 1);
    }
    // top to bottom; readings on the same line from left to right
    kept.sort((a, b) => Math.abs(a.y - b.y) < Math.max(.008, Math.min(a.z, b.z) / 1000 * .4) ? (a.x0 || 0) - (b.x0 || 0) : a.y - b.y);
    return { lines: kept.map(k => k.s), sizes: kept.map(k => k.z * (k.conf > 70 ? 1 : .8)), ys: kept.map(k => k.y), img };
  }

  return { parse, layout, toCard, read, readImages, findDate, findDates, findTime, findTimes, EVENTS };
})();

if (typeof module !== 'undefined') module.exports = PdfCard;
