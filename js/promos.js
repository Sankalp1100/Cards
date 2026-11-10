// Clients' own story videos, written scene by scene from their printed card, played by v.html (?id=…).
// Each scene picks a painted look from js/studio.js and its lines: 'hname' names (Amita), 'hser' text,
// 'deva' headings. The last scene ends on the website's QR code with the designer's signature in the corner.
const SITE_QR = ["0000000000000000000000000000000", "0111111100101011101100011111110", "0100000101001100100001010000010", "0101110101110001010010010111010", "0101110101110101101001010111010", "0101110100101011101111010111010", "0100000100011111010000010000010", "0111111101010101010101011111110", "0000000001000110000110000000000", "0100000101011101101101110011100", "0110110000100101001110001101100", "0000010100101000001001100100000", "0000000001011001110101101110000", "0100010100100111000011011000010", "0001001001111011000111011100110", "0110110101001011110100010011000", "0110101011001111010010010101010", "0000010111001101101001001011000", "0110111001001100010011011101110", "0110111100000111011111110110010", "0100010011101001110111010100000", "0100110101001000011011111101110", "0000000001101010010001000110000", "0111111100011111110111010111000", "0100000100000010000101000100100", "0101110100011110110111111110000", "0101110100101000011110100011100", "0101110100111011001011011111100", "0100000100011000100000111011010", "0111111101101100000110000101000", "0000000000000000000000000000000"]; // https://cardalbum.vercel.app/

// A couple from the library by its file name (js/couples.js; without it the video's own couple is used)
const pic = id => (typeof COUPLES !== 'undefined' && COUPLES.find(c => c.id === id)) || null;

// Sudhanshu ❤ Yadu, from their printed card (Jain Cards, Hapur): the reference video's order of scenes, every scene
// in its own colours with a couple for its function; 59 s, the length of their song.
const SY = {
  ganesh: { look: 'temple-golden', d: 6, doors: true, shower: true, ganesha: { y: 620, s: 680 }, zone: [250, 540, 860] },
  invite: { look: 'jharokha-champagne', d: 5, couple: { y: 1850, s: 640 }, coupleEntry: pic('wedding-05'), zone: [300, 1080, 760] },
  haldi: { look: 'haldi-saffron', d: 4.5, couple: { y: 1850, s: 600 }, coupleEntry: pic('haldi-03'), zone: [330, 1150, 780] },
  mehendi: { look: 'mehendi-emerald', d: 4.5, couple: { y: 1850, s: 600 }, coupleEntry: pic('mehendi-02'), zone: [330, 1150, 780] },
  baraat: { look: 'haveli-pink', d: 6, couple: { y: 1860, s: 520 }, coupleEntry: pic('wedding-07'), zone: [250, 1300, 640] },
  reception: { look: 'palace-plum', d: 6, couple: { y: 1860, s: 560 }, coupleEntry: pic('reception-03'), zone: [230, 1220, 760] },
  manuhar: { look: 'clouds-sakura', d: 4, couple: { y: 1860, s: 520 }, coupleEntry: pic('kid-02'), zone: [300, 1250, 800] },
  regards: { look: 'rosegarden-golden', d: 6, couple: { y: 1860, s: 500 }, coupleEntry: pic('wedding-09'), zone: [270, 1300, 600] },
  thanks: { look: 'mandap-roseblush', d: 5, sigCorner: true, zone: [330, 1400, 760] }
};

const PROMOS = {
  'sudhanshu-yadu': {
    title: 'सुधांशु ❤ यदु · शुभ विवाह',
    card: { type: 'wedding', host1: 'Sudhanshu', host2: 'Yadu' },
    music: 'royal',
    opening: 'curtains', ganeshaId: 'ganesha-01',
    script: [
      { name: 'श्री गणेश', ...SY.ganesh, items: [
        { t: 'text', s: '॥ श्री गणेशाय नमः ॥', f: 'deva', z: 84, col: 'names', gold: true, gap: 20 },
        { t: 'text', s: 'विघ्न हरन मंगल करन, गणनायक महाराज।', f: 'hser', z: 40, col: 'ink', wrap: 2, gap: 6 },
        { t: 'text', s: 'प्रथम निमन्त्रण आपको, सकल सुधारो काज॥', f: 'hser', z: 40, col: 'ink', wrap: 2 }
      ] },
      { name: 'शुभ विवाह', ...SY.invite, items: [
        { t: 'mono', z: 220, gap: 24 },
        { t: 'text', s: 'शुभ विवाह', f: 'hname', z: 120, col: 'names', gap: 8 },
        { t: 'text', s: 'सुधांशु', f: 'hname', z: 84, col: 'accent', gap: 0 },
        { t: 'text', s: 'संग', f: 'hser', z: 42, col: 'ink2', gap: 0 },
        { t: 'text', s: 'यदु', f: 'hname', z: 84, col: 'accent', gap: 10 },
        { t: 'text', s: '9 से 13 दिसम्बर 2026', f: 'deva', z: 50, col: 'ink' }
      ] },
      { name: 'वर', look: 'vrindavan-roseblush', d: 6, zone: [330, 1560, 590], items: [
        { t: 'text', s: '॥ मंगलम् भगवान विष्णुः मंगलम् गरुड़ध्वजः ॥', f: 'deva', z: 36, col: 'accent', wrap: 2, gap: 22 },
        { t: 'text', s: 'परमपिता परमात्मा की असीम अनुकम्पा से', f: 'hser', z: 40, col: 'ink2', wrap: 2, gap: 18 },
        { t: 'text', s: 'श्रीमती अनीता एवं', f: 'hser', z: 50, col: 'ink', gap: 2 },
        { t: 'text', s: 'श्री ब्रह्मपाल सिंह तेवतिया', f: 'hser', z: 54, col: 'ink', gap: 14 },
        { t: 'text', s: 'अपने प्रिय सुपुत्र', f: 'hser', z: 42, col: 'ink2', gap: 6 },
        { t: 'text', s: 'चि॰ सुधांशु', f: 'hname', z: 140, col: 'names', gap: 10 },
        { t: 'text', s: '(सुपौत्र स्व॰ श्रीमती अजय कौर एवं स्व॰ श्री बालचरन सिंह तेवतिया)', f: 'hser', z: 34, col: 'ink2', wrap: 3 }
      ] },
      { name: 'वधु', look: 'blush-peach', d: 5.5, zone: [380, 1520, 800], items: [
        { t: 'div', word: 'संग', z: 54, gap: 16, hi: true },
        { t: 'text', s: 'आयु॰ यदु', f: 'hname', z: 140, col: 'names', gap: 8 },
        { t: 'text', s: '(सुपुत्री श्रीमती शशी देवी एवं स्व॰ श्री राजसिंह)', f: 'hser', z: 36, col: 'ink2', wrap: 3, gap: 26 },
        { t: 'text', s: 'के शुभ-विवाहोपरान्त', f: 'hname', z: 76, col: 'accent', gap: 12 },
        { t: 'text', s: 'की मांगलिक बेला पर आपको सादर आमन्त्रित करते हैं। आपसे अनुरोध है कि आप अपनी उपस्थिति से इस पल को और भी गौरवमयी बनायें एवं नव-दम्पत्ति को आशीर्वाद प्रदान कर हमें अनुग्रहीत करें।', f: 'hser', z: 36, col: 'ink', wrap: 6 }
      ] },
      { name: 'हल्दी', ...SY.haldi, items: [
        { t: 'text', s: 'आप सादर आमन्त्रित हैं', f: 'hser', z: 38, col: 'ink2', gap: 4 },
        { t: 'text', s: 'हल्दी', f: 'hname', z: 150, col: 'names', gap: 8 },
        { t: 'text', s: 'बुधवार, 9 दिसम्बर 2026', f: 'deva', z: 48, col: 'ink', gap: 4 },
        { t: 'text', s: 'दोपहर 1 बजे · निवास पर', f: 'hser', z: 46, col: 'accent' }
      ] },
      { name: 'मेहँदी', ...SY.mehendi, items: [
        { t: 'text', s: 'आप सादर आमन्त्रित हैं', f: 'hser', z: 38, col: 'ink2', gap: 4 },
        { t: 'text', s: 'मेहँदी', f: 'hname', z: 150, col: 'names', gap: 8 },
        { t: 'text', s: 'गुरुवार, 10 दिसम्बर 2026', f: 'deva', z: 48, col: 'ink', gap: 4 },
        { t: 'text', s: 'सायं 5 बजे · निवास पर', f: 'hser', z: 46, col: 'accent' }
      ] },
      { name: 'बारात', ...SY.baraat, items: [
        { t: 'text', s: 'बारात निमन्त्रण', f: 'hname', z: 104, col: 'names', gap: 6 },
        { t: 'text', s: 'मान्यवर आप बारात में सादर आमन्त्रित हैं', f: 'hser', z: 36, col: 'ink2', wrap: 2, gap: 14 },
        { t: 'text', s: 'शुक्रवार, 11 दिसम्बर 2026', f: 'deva', z: 50, col: 'ink', gap: 14 },
        { t: 'text', s: 'घुड़चढ़ी · सायं 4 बजे', f: 'hser', z: 46, col: 'accent', gap: 4 },
        { t: 'text', s: 'बारात प्रस्थान · सायं 5 बजे', f: 'hser', z: 46, col: 'accent', gap: 14 },
        { t: 'text', s: 'बारात बस द्वारा बी-60, पंचशील कालोनी, मेरठ रोड, हापुड़ से ‘9Z फार्म’, जी॰टी॰ रोड, चन्देरू, निकट जेल, बुलन्दशहर (उ॰प्र॰) के लिये प्रस्थान करेगी।', f: 'hser', z: 34, col: 'ink', wrap: 4 }
      ] },
      { name: 'स्वागत', ...SY.reception, items: [
        { t: 'text', s: 'रविवार, 13 दिसम्बर 2026', f: 'deva', z: 48, col: 'accent', gap: 8 },
        { t: 'text', s: 'वर-वधु स्वागत एवं प्रीतिभोज', f: 'hname', z: 80, col: 'names', wrap: 2, gap: 6 },
        { t: 'text', s: 'सायं 5 बजे से', f: 'hser', z: 44, col: 'ink', gap: 18 },
        { t: 'text', s: 'समारोह स्थल', f: 'deva', z: 40, col: 'accent', gap: 4 },
        { t: 'text', s: '‘देवकृपा फार्म हाउस’', f: 'hname', z: 72, col: 'names', gap: 4 },
        { t: 'text', s: 'मिशन स्कूल के सामने, मेरठ रोड, असौड़ा (हापुड़)', f: 'hser', z: 36, col: 'ink', wrap: 2 }
      ] },
      { name: 'बाल मनुहार', ...SY.manuhar, items: [
        { t: 'text', s: 'बाल मनुहार', f: 'deva', z: 50, col: 'accent', gap: 14 },
        { t: 'text', s: 'हल्दी है चन्दन है,', f: 'hname', z: 82, col: 'names', gap: 2 },
        { t: 'text', s: 'रिश्तों का बन्धन है,', f: 'hname', z: 82, col: 'names', gap: 14 },
        { t: 'text', s: 'हमारे मामा के रिसेप्शन में आपका अभिनन्दन है…', f: 'hser', z: 40, col: 'ink', wrap: 2, gap: 12 },
        { t: 'text', s: '— अमोघ चौधरी, मान्या', f: 'hser', z: 38, col: 'ink2' }
      ] },
      { name: 'परिवार', ...SY.regards, items: [
        { t: 'text', s: 'दर्शनाभिलाषी', f: 'deva', z: 44, col: 'accent', gap: 4 },
        { t: 'text', s: 'आकाश, विकास, केशव, सनी, मनीष, निपुण, हनी आदि तेवतिया एवं समस्त तेवतिया परिवार', f: 'hser', z: 34, col: 'ink', wrap: 3, gap: 14 },
        { t: 'text', s: 'विनीत', f: 'deva', z: 44, col: 'accent', gap: 4 },
        { t: 'text', s: 'सुरेन्द्र सिंह, अमरपाल सिंह, ऋषिपाल सिंह, सुभाष सिंह एवं सुजीत सिंह तेवतिया', f: 'hser', z: 34, col: 'ink', wrap: 3, gap: 14 },
        { t: 'text', s: 'प्रेषक: ब्रह्मपाल सिंह तेवतिया', f: 'hname', z: 56, col: 'names', gap: 4 },
        { t: 'text', s: '9456601373 · 7983758325 · 7895222189', f: 'serif', z: 32, col: 'ink2' }
      ] },
      { name: 'आपकी प्रतीक्षा', ...SY.thanks, items: [
        { t: 'text', s: 'आपकी प्रतीक्षा में', f: 'hname', z: 104, col: 'names', gap: 4 },
        { t: 'text', s: 'तेवतिया परिवार', f: 'deva', z: 52, col: 'accent', gap: 36 },
        { t: 'qr', rows: SITE_QR, z: 260, gap: 34 },
        { t: 'text', s: 'Your invitation, made like this', f: 'italic', z: 36, col: 'ink2', gap: 6 },
        { t: 'text', s: 'cardalbum.vercel.app', f: 'serif', z: 44, col: 'names' }
      ] }
    ]
  },
  'sudhanshu-yadu-en': {
    title: 'Sudhanshu ❤ Yadu · Wedding Invitation',
    card: { type: 'wedding', host1: 'Sudhanshu', host2: 'Yadu' },
    music: 'royal',
    opening: 'curtains', ganeshaId: 'ganesha-01',
    script: [
      { name: 'Shri Ganesh', ...SY.ganesh, items: [
        { t: 'text', s: '॥ श्री गणेशाय नमः ॥', f: 'deva', z: 84, col: 'names', gold: true, gap: 20 },
        { t: 'text', s: 'With the blessings of Lord Ganesha', f: 'italic', z: 42, col: 'ink' }
      ] },
      { name: 'Invitation', ...SY.invite, items: [
        { t: 'mono', z: 220, gap: 24 },
        { t: 'text', s: 'Wedding Invitation', f: 'serif', z: 44, col: 'accent', up: true, ls: 4, gap: 12 },
        { t: 'text', s: 'Sudhanshu', f: 'script', z: 104, col: 'names', gap: 0 },
        { t: 'text', s: '&', f: 'script', z: 60, col: 'accent', gap: 0 },
        { t: 'text', s: 'Yadu', f: 'script', z: 104, col: 'names', gap: 10 },
        { t: 'text', s: '9 – 13 December 2026', f: 'serif', z: 44, col: 'ink' }
      ] },
      { name: 'The Families', look: 'vrindavan-roseblush', d: 7, zone: [330, 1560, 590], items: [
        { t: 'text', s: 'With the infinite grace of the Almighty, we invite you to celebrate the wedding of', f: 'italic', z: 42, col: 'ink2', wrap: 3, gap: 18 },
        { t: 'text', s: 'Sudhanshu', f: 'script', z: 136, col: 'names', gap: 4 },
        { t: 'text', s: 'S/O Mrs. Anita & Mr. Brahmpal Singh Teotia', f: 'serif', z: 40, col: 'ink', wrap: 2, gap: 4 },
        { t: 'text', s: 'Grandson of Late Mrs. Ajay Kaur & Late Mr. Balcharan Singh Teotia', f: 'italic', z: 34, col: 'ink2', wrap: 2, gap: 16 },
        { t: 'div', word: '&', z: 50, gap: 16 },
        { t: 'text', s: 'Yadu', f: 'script', z: 136, col: 'names', gap: 4 },
        { t: 'text', s: 'D/O Mrs. Shashi Devi & Late Mr. Rajsingh', f: 'serif', z: 40, col: 'ink', wrap: 2 }
      ] },
      { name: 'Haldi', ...SY.haldi, items: [
        { t: 'text', s: 'We cordially invite you to the', f: 'italic', z: 38, col: 'ink2', gap: 4 },
        { t: 'text', s: 'Haldi', f: 'script', z: 156, col: 'names', gap: 8 },
        { t: 'text', s: 'Wednesday · 9 | December | 2026', f: 'serif', z: 44, col: 'ink', gap: 4 },
        { t: 'text', s: '1:00 PM · At our residence', f: 'serif', z: 44, col: 'accent' }
      ] },
      { name: 'Mehendi', ...SY.mehendi, items: [
        { t: 'text', s: 'We cordially invite you to the', f: 'italic', z: 38, col: 'ink2', gap: 4 },
        { t: 'text', s: 'Mehendi', f: 'script', z: 156, col: 'names', gap: 8 },
        { t: 'text', s: 'Thursday · 10 | December | 2026', f: 'serif', z: 44, col: 'ink', gap: 4 },
        { t: 'text', s: '5:00 PM · At our residence', f: 'serif', z: 44, col: 'accent' }
      ] },
      { name: 'Baraat', ...SY.baraat, items: [
        { t: 'text', s: 'We cordially invite you to the', f: 'italic', z: 36, col: 'ink2', gap: 4 },
        { t: 'text', s: 'Baraat', f: 'script', z: 136, col: 'names', gap: 8 },
        { t: 'text', s: 'Friday · 11 | December | 2026', f: 'serif', z: 44, col: 'ink', gap: 14 },
        { t: 'text', s: 'Ghudchadhi · 4:00 PM', f: 'serif', z: 44, col: 'accent', gap: 4 },
        { t: 'text', s: 'Baraat departs · 5:00 PM', f: 'serif', z: 44, col: 'accent', gap: 14 },
        { t: 'text', s: 'By bus from B-60, Panchsheel Colony, Meerut Road, Hapur to ‘9Z Farm’, G.T. Road, Chanderu, near Jail, Bulandshahr (U.P.)', f: 'serif', z: 34, col: 'ink', wrap: 4 }
      ] },
      { name: 'Reception', ...SY.reception, items: [
        { t: 'text', s: 'You are cordially invited to the', f: 'serif', z: 28, col: 'accent', up: true, ls: 4, gap: 8 },
        { t: 'text', s: 'RECEPTION', f: 'display', z: 74, col: 'names', gap: 6 },
        { t: 'text', s: 'Var-Vadhu Swagat & Preetibhoj', f: 'italic', z: 40, col: 'ink', gap: 14 },
        { t: 'text', s: 'Sunday, 13th December 2026', f: 'serif', z: 40, col: 'ink', gap: 2 },
        { t: 'text', s: '5:00 PM Onwards', f: 'serif', z: 40, col: 'accent', gap: 14 },
        { t: 'text', s: 'Devkripa Farm House', f: 'script', z: 80, col: 'names', gap: 4 },
        { t: 'text', s: 'Opp. Mission School, Meerut Road, Asaura (Hapur)', f: 'serif', z: 34, col: 'ink2', wrap: 2 }
      ] },
      { name: 'Bal Manuhar', ...SY.manuhar, items: [
        { t: 'text', s: 'बाल मनुहार', f: 'deva', z: 50, col: 'accent', gap: 14 },
        { t: 'text', s: 'हल्दी है चन्दन है,', f: 'hname', z: 82, col: 'names', gap: 2 },
        { t: 'text', s: 'रिश्तों का बन्धन है,', f: 'hname', z: 82, col: 'names', gap: 14 },
        { t: 'text', s: 'हमारे मामा के रिसेप्शन में आपका अभिनन्दन है…', f: 'hser', z: 40, col: 'ink', wrap: 2, gap: 12 },
        { t: 'text', s: '— Amogh Chaudhary & Manya', f: 'italic', z: 38, col: 'ink2' }
      ] },
      { name: 'Warm Regards', ...SY.regards, items: [
        { t: 'text', s: 'Warm Regards', f: 'script', z: 116, col: 'names', gap: 6 },
        { t: 'text', s: 'Mr. Brahmpal Singh Teotia & Family', f: 'serif', z: 42, col: 'ink', wrap: 2, gap: 12 },
        { t: 'text', s: 'With Surendra, Amarpal, Rishipal, Subhash & Sujeet Singh Teotia', f: 'italic', z: 34, col: 'ink2', wrap: 2, gap: 8 },
        { t: 'text', s: 'Eagerly awaiting you: Akash, Vikas, Keshav, Sunny, Manish, Nipun, Hunny & the Teotia family', f: 'italic', z: 34, col: 'ink2', wrap: 3, gap: 12 },
        { t: 'text', s: '9456601373 · 7983758325 · 7895222189', f: 'serif', z: 32, col: 'ink' }
      ] },
      { name: 'Thank You', ...SY.thanks, items: [
        { t: 'text', s: 'Thank You', f: 'script', z: 140, col: 'names', gap: 4 },
        { t: 'text', s: 'for being part of our celebration', f: 'italic', z: 38, col: 'ink2', gap: 34 },
        { t: 'qr', rows: SITE_QR, z: 260, gap: 34 },
        { t: 'text', s: 'Your invitation, made like this', f: 'italic', z: 34, col: 'ink2', gap: 6 },
        { t: 'text', s: 'cardalbum.vercel.app', f: 'serif', z: 44, col: 'names' }
      ] }
    ]
  }
};

if (typeof module !== 'undefined') module.exports = { PROMOS, SITE_QR };
