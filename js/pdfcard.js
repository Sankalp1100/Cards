// Reads a printed invitation card (PDF) for the Video Studio: its text and a picture of each page, then guesses
// the names, parents, functions with their dates and times, the venue, the home address and the phone numbers.
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
    [/ganesh\s*(puja|pujan|sthapana)|गणेश\s*(पूजन|पूजा|स्थापना)|विनायक/i, 'Ganesh Puja', 'गणेश पूजन'],
    [/mata\s*ki\s*chowki|jagran|जागरण|चौकी/i, 'Mata ki Chowki', 'माता की चौकी'],
    [/kirtan|कीर्तन/i, 'Kirtan', 'कीर्तन'],
    [/ratjaga|रतजगा/i, 'Ratjaga', 'रतजगा'],
    [/tilak|तिलक/i, 'Tilak', 'तिलक'],
    [/ring\s*ceremony|engagement|sagai|सगाई|रिंग/i, 'Engagement', 'सगाई'],
    [/haldi|हल्दी|हलदी|उबटन/i, 'Haldi', 'हल्दी'],
    [/mehe?n?di|mehandi|मेहँदी|मेहंदी|मेंहदी|मेहन्दी/i, 'Mehendi', 'मेहँदी'],
    [/sangeet|संगीत/i, 'Sangeet', 'संगीत'],
    [/bhaat|bhat\b|भात/i, 'Bhaat', 'भात'],
    [/mandap|मण्डप|मंडप/i, 'Mandap', 'मण्डप'],
    [/ghud\s*chadh?i|ghodi|घुड़चढ़ी|घुड़चढ़ी|घोड़ी/i, 'Ghudchadhi', 'घुड़चढ़ी'],
    [/baraat|barat\b|बारात/i, 'Baraat', 'बारात'],
    [/jai\s*mala|var\s*mala|varmala|jaimala|जयमाला|वरमाला/i, 'Jaimala', 'जयमाला'],
    [/phere|pheras|saat\s*phere|फेरे|पाणिग्रहण|लग्न/i, 'Pheras', 'फेरे'],
    [/reception|स्वागत\s*समारोह|रिसेप्शन/i, 'Reception', 'स्वागत समारोह'],
    [/prit[ie]\s*bhoj|bhoj|dinner|lunch|प्रीतिभोज|प्रीति\s*भोज|भोज/i, 'Dinner', 'प्रीतिभोज'],
    [/vidai|विदाई/i, 'Vidai', 'विदाई'],
    [/cocktail/i, 'Cocktail', 'कॉकटेल']
  ];
  const OCCASIONS = [
    [/wedding|marriage|shubh\s*vivah|vivah|विवाह|शादी|परिणय|पाणिग्रहण/i, 'wedding'],
    [/engagement|ring\s*ceremony|sagai|सगाई/i, 'engagement'],
    [/reception|स्वागत\s*समारोह/i, 'reception'],
    [/birthday|जन्मदिन/i, 'birthday'],
    [/anniversary|वर्षगाँठ|वर्षगांठ/i, 'anniversary'],
    [/griha\s*pravesh|house\s*warming|गृह\s*प्रवेश/i, 'housewarming'],
    [/godh\s*bharai|baby\s*shower|गोद\s*भराई/i, 'babyshower'],
    [/naam\s*karan|naming|नामकरण/i, 'naming']
  ];
  const VENUE_WORDS = /hotel|resort|banquet|lawns?|gardens?|palace|farm|hall|vatika|bhawan|bhavan|mahal|marriage\s*home|club|haveli|greens|retreat|होटल|रिसोर्ट|रिसॉर्ट|बैंक्वेट|लॉन|गार्डन|पैलेस|फार्म|हॉल|वाटिका|भवन|महल|मैरिज\s*होम|हवेली/i;

  // "Venue:", "समारोह स्थल:" and the like in front of a place
  const LABEL = /^(venue|marriage venue|समारोह स्थल|विवाह स्थल|स्थान|स्थल|at)(?=[\s:\-–])[\s:\-–]*/i;
  const clean = s => String(s || '').replace(/[​-‍﻿]/g, '').replace(/\s+/g, ' ').trim();
  const isHindi = s => /[ऀ-ॿ]/.test(s);
  // Hindi digits to 0-9
  const digits = s => s.replace(/[०-९]/g, d => '०१२३४५६७८९'.indexOf(d));

  // "12 December 2026", "12th Dec, 2026", "12/12/2026", "12-12-26", "12 दिसम्बर 2026" → { y, m, d }
  function findDate(line, year) {
    const s = digits(line);
    for (const m of s.matchAll(/(\d{1,2})(?:st|nd|rd|th)?[\s.,-]*([A-Za-z]{3,9}|[ऀ-ॿ]{3,8})(?=[\s.,-]*(\d{4}|\d{2}(?!\s*[A-Za-zऀ-ॿ]))?)/g)) {
      if (MONTHS[m[2].toLowerCase()] != null && +m[1] >= 1 && +m[1] <= 31) return { d: +m[1], m: MONTHS[m[2].toLowerCase()], y: m[3] ? +(m[3].length === 2 ? '20' + m[3] : m[3]) : year };
    }
    let m = s.match(/([A-Za-z]{3,9})[\s.,-]+(\d{1,2})(?:st|nd|rd|th)?[\s.,-]+(\d{4})/);
    if (m && MONTHS[m[1].toLowerCase()] != null) return { d: +m[2], m: MONTHS[m[1].toLowerCase()], y: +m[3] };
    m = s.match(/\b(\d{1,2})[./-](\d{1,2})[./-](\d{4}|\d{2})\b/);
    if (m && +m[2] >= 1 && +m[2] <= 12 && +m[1] <= 31) return { d: +m[1], m: +m[2] - 1, y: +(m[3].length === 2 ? '20' + m[3] : m[3]) };
    return null;
  }
  // "7:30 PM", "7 pm", "19:30", "सायं 7 बजे", "प्रातः 10:30 बजे" → "19:30"
  function findTime(line) {
    const s = digits(line);
    let m = s.match(/\b(\d{1,2})(?:[:.](\d{2}))?\s*(a\.?m\.?|p\.?m\.?)/i);
    if (m) { let h = +m[1] % 12; if (/p/i.test(m[3])) h += 12; return `${String(h).padStart(2, '0')}:${m[2] || '00'}`; }
    m = s.match(/(प्रातः|प्रात:|सुबह|दोपहर|अपराह्न|सायं|साँय|सांय|शाम|रात्रि|रात)\s*(\d{1,2})(?:[:.](\d{2}))?\s*बजे/);
    if (m) { let h = +m[2]; const w = m[1], morning = /प्रात|सुबह/.test(w); if (!morning && /दोपहर|अपराह्न/.test(w) && h < 12) h += h < 5 ? 12 : 0; if (!morning && /सायं|साँय|सांय|शाम|रात्रि|^रात/.test(w) && h < 12) h += 12; return `${String(h % 24).padStart(2, '0')}:${m[3] || '00'}`; }
    m = s.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
    return m ? `${m[1].padStart(2, '0')}:${m[2]}` : '';
  }
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

  // Plain lines of text → the card's details (anything not found stays empty)
  function parse(lines) {
    lines = (lines || []).map(l => clean(mendHindi(String(l || '')))).filter(Boolean);
    const text = lines.join('\n'), hi = (text.match(/[ऀ-ॿ]/g) || []).length > (text.match(/[A-Za-z]/g) || []).length;
    const year = (digits(text).match(/\b(20[2-4]\d)\b/) || [])[1] || new Date().getFullYear();
    const out = { lang: hi ? 'hi' : 'en', type: 'wedding', host1: '', host2: '', parents1: '', parents2: '', events: [], venue: '', address: '', phones: [], hashtag: '' };
    const occ = OCCASIONS.find(([re]) => re.test(text));
    if (occ) out.type = occ[1];

    // The couple: "Rahul weds Priya", "Rahul & Priya", "राहुल संग प्रिया"; else the names after Chi. / Ayu. (चि॰ / आयु॰ / सौ॰)
    const NAME = "([A-Z\\u0900-\\u097F][\\w\\u0900-\\u097F.'’ ]{1,30}?)";
    for (const l of lines) {
      const m = l.match(new RegExp(`^${NAME}\\s+(?:weds|wed|with|&|and|संग|सँग|के\\s*साथ|❤|♥|💕)\\s+${NAME}$`, 'i'));
      if (m && !/family|parivar|परिवार|ceremony|invite/i.test(l)) { out.host1 = cleanName(m[1]); out.host2 = cleanName(m[2]); break; }
    }
    const marked = re => { const l = lines.find(x => re.test(x)); return l ? cleanName(l.replace(re, '').split(/\(|,|सुपुत्र|सुपुत्री|s\/o|d\/o|son of|daughter of/i)[0]) : ''; };
    if (!out.host1) out.host1 = marked(/^.*?(?:\bchi\.?|\bchiranjeev|चि[॰.]?|चिरंजीव)\s*/i);
    if (!out.host2) out.host2 = marked(/^.*?(?:\bayu\.?|\bayushmati|\bsau\.?|आयु[॰.]?|आयुष्मती|सौ[॰.]?\s*(?:कां[॰.]?)?)\s*/i);
    // Parents: "S/o Shri ...", "Son of ...", "सुपुत्र श्री ..."; "D/o", "Daughter of", "सुपुत्री"
    const parentOf = re => { const l = lines.find(x => re.test(x)); if (!l) return ''; return clean(l.replace(/^.*?(s\/o|d\/o|son of|daughter of|सुपुत्री|सुपुत्र|पुत्री|पुत्र)\s*/i, '').replace(/[()]/g, '')).slice(0, 120); };
    out.parents1 = parentOf(/\bs\/o\b|son of|सुपुत्र(?!ी)|(?<!सु)पुत्र(?!ी)/i);
    out.parents2 = parentOf(/\bd\/o\b|daughter of|सुपुत्री|पुत्री/i);

    // Functions: a line naming one, with its date and time on the same line or the next two (else the last date seen)
    let lastDate = null;
    lines.forEach((l, i) => {
      const dt = findDate(l, +year);
      if (dt) lastDate = dt;
      const ev = EVENTS.find(([re]) => re.test(l));
      if (!ev) return;
      const near = [l, lines[i + 1] || '', lines[i + 2] || ''];
      let d = null, t = '';
      for (const n of near) { if (!d) d = findDate(n, +year); if (!t) t = findTime(n); if (d && t) break; }
      d = d || lastDate;
      const name = hi ? ev[2] : ev[1];
      if (out.events.some(e => e.name === name)) return;
      const venueNear = near.find(n => VENUE_WORDS.test(n) && n !== l);
      out.events.push({ name, date: iso(d, t), venue: venueNear ? clean(venueNear.replace(LABEL, '')).slice(0, 120) : '' });
    });
    out.events = out.events.slice(0, 9);
    // The venue: a line after "Venue / स्थान / स्थल", else the first line with a venue word
    const vi = lines.findIndex(l => LABEL.test(l));
    const vLine = vi >= 0 ? (clean(lines[vi].replace(LABEL, '')) || lines[vi + 1] || '') : lines.find(l => VENUE_WORDS.test(l) && l.length < 90) || '';
    out.venue = clean(vLine).slice(0, 120);
    // The home address: after "Address / निवास / पता", else a line with a 6-digit PIN code
    const ai = lines.findIndex(l => /(address|residence|निवास स्थान|निवास|पता)\s*[:\-–]/i.test(l));
    const aLine = ai >= 0 ? clean(lines[ai].replace(/^.*?(address|residence|निवास स्थान|निवास|पता)\s*[:\-–]?\s*/i, '')) || lines[ai + 1] || '' : lines.find(l => /\b\d{6}\b/.test(digits(l)) && l !== vLine) || '';
    out.address = clean(aLine).slice(0, 160);
    // Phone numbers (Indian mobiles), each once
    const ph = digits(text).match(/(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b/g) || [];
    out.phones = [...new Set(ph.map(p => p.replace(/\D/g, '').slice(-10)))].slice(0, 4).map(p => `${p.slice(0, 5)} ${p.slice(5)}`);
    out.hashtag = (text.match(/#[\wऀ-ॿ]{3,40}/) || [''])[0];
    return out;
  }
  function cleanName(s) {
    return clean(String(s || '').replace(/^(shri|smt|sh|mr|mrs|ms|dr|श्री|श्रीमती|कुमारी|कु॰|सुश्री|चि॰|आयु॰|सौ॰)[\s.॰]+/i, '').replace(/[,()।|].*$/, '')).slice(0, 30);
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
  async function read(file) {
    const pdfjs = await load();
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()), cMapUrl: PDFJS + 'cmaps/', cMapPacked: true }).promise;
    const lines = [], pictures = [];
    for (let n = 1; n <= Math.min(pdf.numPages, 6); n++) {
      const page = await pdf.getPage(n);
      // text items grouped into lines by their height on the page
      const tc = await page.getTextContent(), rows = [];
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
        lines.push(out);
      });
      if (pictures.length < 3) {
        const vp = page.getViewport({ scale: 1 }), k = 900 / Math.max(vp.width, vp.height), c = document.createElement('canvas');
        const v2 = page.getViewport({ scale: k });
        c.width = Math.round(v2.width); c.height = Math.round(v2.height);
        await page.render({ canvasContext: c.getContext('2d'), viewport: v2 }).promise;
        pictures.push(c.toDataURL('image/jpeg', .85));
      }
    }
    const text = lines.join(' ');
    // Old Hindi fonts (Kruti Dev and the like) come out as Latin gibberish; pictures of cards have no text at all
    const readable = text.replace(/\s/g, '').length > 30 && !/[¼½¾ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÑÒÓÔÕÖ×ØÙÚÛÜÝÞß]{3}/.test(text);
    return { lines, pictures, pages: pdf.numPages, readable, details: readable ? parse(lines) : null };
  }

  return { parse, toCard, read, findDate, findTime, EVENTS };
})();

if (typeof module !== 'undefined') module.exports = PdfCard;
