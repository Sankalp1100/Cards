// One set of gold line icons (24×24, same stroke) used instead of emoji across the home page: the feature tiles, the
// occasions, the steps, the quick questions and the bottom bar. Places that want one carry data-gi="name" and keep
// their emoji as the text, so without this script the page still shows the emoji.
(function () {
  const P = {
    // features
    envelope: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3.5 6.5 12 13l8.5-6.5"/>',
    hearts: '<path d="M9 19s-6-3.6-6-8.2A3.3 3.3 0 0 1 9 9a3.3 3.3 0 0 1 6 1.8C15 15.4 9 19 9 19z"/><path d="M15.5 5.6A2.6 2.6 0 0 1 21 7c0 3.3-4 6-4 6"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4M8 13h2M12 13h2M8 16.5h2"/>',
    venue: '<path d="M4 20V10l8-5 8 5v10"/><path d="M9.5 20v-5a2.5 2.5 0 0 1 5 0v5M3 20h18"/><path d="M12 5V2.5M12 2.5l2 1"/>',
    chat: '<path d="M20 11.5a7.5 7.5 0 0 1-11 6.6L4 19.5l1.4-4.4A7.5 7.5 0 1 1 20 11.5z"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"/>',
    photo: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="m3.5 17 5-4.5 3.5 3 3-2.5 5.5 4.5"/>',
    dress: '<path d="M9 3h6l-1 4 4 13H6l4-13-1-4z"/><path d="M10 7h4"/>',
    gift: '<rect x="3.5" y="8.5" width="17" height="4" rx="1"/><path d="M5 12.5V20h14v-7.5M12 8.5V20"/><path d="M12 8.5C10.5 5 7 5 7 7s3 1.5 5 1.5zM12 8.5c1.5-3.5 5-3.5 5-1.5s-3 1.5-5 1.5z"/>',
    guest: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/><path d="m17.5 4 .6 1.3 1.4.2-1 1 .2 1.4-1.2-.7-1.3.7.3-1.4-1-1 1.4-.2z"/>',
    video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10.5 5-3v9l-5-3z"/>',
    // steps
    palette: '<path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.8 1.8-1.7 0-1.4-1.3-1.6-1.3-2.8 0-.9.7-1.5 1.7-1.5H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="14.5" cy="7" r="1"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    rocket: '<path d="M12 15 9 12c1-4 4-8.5 10-9-.5 6-5 9-9 10"/><path d="M9 12H5l2.5-3H11M12 15v4l3-2.5V13"/><path d="M6.5 17.5C5 18 4.5 19.5 4.5 19.5s1.5-.5 2-2"/>',
    // quick questions
    price: '<path d="M3.5 12.5V4.5h8l9 9-8 8z"/><circle cx="8" cy="9" r="1.5"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    letter: '<path d="M5 18.5 10 5.5h1L16 18.5M6.8 14h7.4"/><path d="M18 9v9.5"/>',
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
    users: '<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M15.5 6a3 3 0 0 1 0 5.5M17.5 14a5.5 5.5 0 0 1 3 5"/>',
    // bottom bar
    home: '<path d="M4 11 12 4l8 7"/><path d="M6 9.5V20h12V9.5M10 20v-5h4v5"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    flame: '<path d="M12 21a6 6 0 0 0 6-6c0-4-3-6-4-9-1 2-2 3-3.5 3.5C9 8 9 6.5 9.5 5 7 7 6 10.5 6 15a6 6 0 0 0 6 6z"/><path d="M12 21a2.5 2.5 0 0 1-2.5-2.5c0-1.7 1.5-2.5 2.5-4 1 1.5 2.5 2.3 2.5 4A2.5 2.5 0 0 1 12 21z"/>',
    film: '<rect x="3.5" y="4" width="17" height="16" rx="2"/><path d="M7.5 4v16M16.5 4v16M3.5 9h4M3.5 15h4M16.5 9h4M16.5 15h4"/>',
    // occasions
    rings: '<circle cx="9" cy="14" r="5"/><circle cx="15" cy="14" r="5"/><path d="m10.5 4 1.5 2 1.5-2"/>',
    ring: '<circle cx="12" cy="15" r="5.5"/><path d="M9.5 6.5 12 9.5l2.5-3L13 4.5h-2z"/>',
    music: '<path d="M9 18V5.5l11-2V16"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
    cocktail: '<path d="M4 4h16l-8 9z"/><path d="M12 13v7M8 20h8M15 7.5h.01"/>',
    cake: '<path d="M4 20h16v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2z"/><path d="M4 16c1.3 1 2.7 1 4 0s2.7-1 4 0 2.7 1 4 0 2.7-1 4 0M12 12V8M12 5.5c.8-.6.8-1.6 0-2.5-.8.9-.8 1.9 0 2.5z"/>',
    cradle: '<path d="M4 11h16a8 8 0 0 1-16 0z"/><path d="M8 19l-1.5 2M16 19l1.5 2M6 11a6 6 0 0 1 9-5.2"/><circle cx="14" cy="8.5" r="1.2"/>',
    balloon: '<path d="M12 15c3.3 0 5.5-3 5.5-6.2A5.5 5.5 0 0 0 6.5 8.8C6.5 12 8.7 15 12 15z"/><path d="m11 15 1 1.5 1-1.5M12 16.5c0 2.5-2 2.5-2 5"/>',
    rattle: '<circle cx="9" cy="9" r="5.5"/><path d="m13 13 6.5 6.5M18 21l3-3M7 9h4M9 7v4"/>',
    diya: '<path d="M3 13h18c-1 4-4.5 6-9 6s-8-2-9-6z"/><path d="M12 10c-1.4-1.2-1.4-3 0-5.5 1.4 2.5 1.4 4.3 0 5.5z"/>',
    twohearts: '<path d="M8.5 19S3 15.8 3 11.6A3 3 0 0 1 8.5 10a3 3 0 0 1 5.5 1.6c0 4.2-5.5 7.4-5.5 7.4z"/><path d="M14.5 13.6S21 10.5 21 6.6A2.8 2.8 0 0 0 16 5.3"/>',
    cheers: '<path d="M6 3h5l-.5 5a2.5 2.5 0 0 1-4 0zM13 3h5l-.5 5a2.5 2.5 0 0 1-4 0z"/><path d="M8.5 10v8M15.5 10v8M6 21h5M13 21h5"/>',
    bowl: '<path d="M3 11h18a9 7 0 0 1-18 0z"/><path d="M8 20h8M9 7.5c0-1.5 1-2.5 3-2.5s3 1 3 2.5"/>',
    henna: '<path d="M7 21v-8l-2-3.5a1.5 1.5 0 0 1 2.6-1.5L9 10V4.5a1.5 1.5 0 0 1 3 0V10V3.5a1.5 1.5 0 0 1 3 0V10V5a1.5 1.5 0 0 1 3 0v8a8 8 0 0 1-3 6.5V21"/><circle cx="12" cy="15" r="1.6"/>',
    kalash: '<path d="M7 11a5 5 0 0 0 10 0zM8 21h8l-1-3.5a5 5 0 0 0-6 0z"/><path d="M9 11V9h6v2M12 9c-2-2-4-2.5-5-2 1-2 3.5-2.5 5 0 1.5-2.5 4-2 5 0-1-.5-3 0-5 2z"/>',
    house: '<path d="M3.5 11.5 12 4.5l8.5 7"/><path d="M5.5 10v10h13V10M10 20v-5.5h4V20"/><path d="M8 7.5h.01M16 7.5h.01"/>',
    scissors: '<circle cx="6" cy="17.5" r="2.5"/><circle cx="18" cy="17.5" r="2.5"/><path d="M7.8 15.8 16 4M16.2 15.8 8 4"/>',
    om: '<path d="M5 9.5c2.5-2 6 0 4 2.5 3-1 4.5 2 2.5 4.5S5 18 5 15"/><path d="M15 11c2-1.5 4.5 0 4.5 2.5S17 18.5 14.5 17M15.5 6.5c1 1 3 1 4-.5M18.5 3.5h.01"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>',
    star: '<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2M3 12.5h18M11 12.5v2h2v-2"/>',
    heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>'
  };
  // each occasion's icon
  const OCC = { wedding: 'rings', engagement: 'ring', sangeet: 'music', kitty: 'cocktail', bday: 'cake', naming: 'cradle', birthday: 'balloon',
    babyshower: 'rattle', ceremony: 'diya', anniversary: 'twohearts', reception: 'cheers', haldi: 'bowl', mehendi: 'henna', roka: 'kalash',
    housewarming: 'house', mundan: 'scissors', janeu: 'om', retirement: 'sun', festive: 'star', corporate: 'briefcase' };
  const svg = name => P[name] ? `<svg class="gi" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${P[name]}</svg>` : '';
  // the gold gradient every icon strokes with, defined once
  if (!document.getElementById('giGold')) {
    const defs = document.createElement('div');
    defs.setAttribute('aria-hidden', 'true');
    defs.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    defs.innerHTML = '<svg width="0" height="0"><defs><linearGradient id="giGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffb547"/><stop offset=".5" stop-color="#ff3d8b"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs></svg>';
    document.body.prepend(defs);
  }
  // swap the emoji of every [data-gi] for its icon (the emoji stays as the label for screen readers)
  function apply(root = document) {
    root.querySelectorAll('[data-gi]:not(.gi-on)').forEach(el => {
      const s = svg(el.dataset.gi);
      if (!s) return;
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML = s;
      el.classList.add('gi-on');
    });
  }
  apply();
  window.GoldIcons = { svg, occasion: k => svg(OCC[k]), apply };
})();
