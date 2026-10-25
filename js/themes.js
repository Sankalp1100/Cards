// Shared by every page: the 200 numbered templates and the occasion presets.
// A template's number (#001–#200) never changes, because card links store it.

const FONT_SETS = {
  regal: { display: "'Cinzel Decorative', serif", script: "'Great Vibes', cursive", body: "'Cormorant Garamond', serif" },
  garden: { display: "'Playfair Display', serif", script: "'Parisienne', cursive", body: "'Cormorant Garamond', serif" },
  retro: { display: "'Righteous', sans-serif", script: "'Pacifico', cursive", body: "'Poppins', sans-serif" },
  playful: { display: "'Fredoka', sans-serif", script: "'Pacifico', cursive", body: "'Fredoka', sans-serif" },
  modern: { display: "'Playfair Display', serif", script: "'Great Vibes', cursive", body: "'Poppins', sans-serif" },
  heritage: { display: "'Marcellus', serif", script: "'Alex Brush', cursive", body: "'Lora', serif" },
  dreamy: { display: "'Marcellus', serif", script: "'Pinyon Script', cursive", body: "'Cormorant Garamond', serif" },
  festive: { display: "'Yatra One', serif", script: "'Dancing Script', cursive", body: "'Poppins', sans-serif" },
  soft: { display: "'Baloo 2', sans-serif", script: "'Dancing Script', cursive", body: "'Baloo 2', sans-serif" }
};

// How the invitation opens before the card shows. Each design has one; the catalog or a single invite can change it.
const INTROS = {
  envelope: '✉️ Envelope',
  doors: '🚪 Palace doors',
  curtains: '🎭 Curtain raise',
  scroll: '📜 Royal scroll',
  giftbox: '🎁 Gift box',
  cardflip: '💌 Folding card'
};

// How each design is laid out and styled, on top of colours, fonts, decor and opening. Combined so that
// no two of the 200 designs are alike (tests/unit.test.js checks it).
const LAYOUTS = ['classic', 'arch', 'monogram', 'ticket', 'split'];
const NAME_STYLES = ['shimmer', 'solid', 'outline', 'duo'];
const CARD_STYLES = ['soft', 'sharp', 'pill', 'outline'];
const DECORS = ['mandala', 'blobs', 'frame', 'florals', 'sunburst', 'deco', 'lights', 'stars', 'lace'];

// The original 12 hand-made designs are #001–#012. `key` keeps links made before numbering working.
const CLASSICS = [
  {
    key: 'royal', name: 'Royal Maharaja', emoji: '👑', occasion: 'wedding', decor: 'mandala', layout: 'classic', nameStyle: 'shimmer', cardStyle: 'soft', intro: 'envelope',
    vars: { '--bg': '#2b0a14', '--bg2': '#5c0f24', '--ink': '#fbeedd', '--muted': '#e8cfa9', '--accent': '#e9b949', '--accent2': '#ff8f3f', '--card': 'rgba(255,255,255,.06)', '--line': 'rgba(233,185,73,.25)' },
    fonts: FONT_SETS.regal,
    particles: { types: ['marigold', 'petal'], colors: ['#ff9f1c', '#ffbf3f', '#e63946', '#ffd166'], count: 38 },
    tempo: 0.3
  },
  {
    key: 'floral', name: 'Blush Garden', emoji: '🌸', occasion: 'engagement', decor: 'florals', layout: 'arch', nameStyle: 'solid', cardStyle: 'pill', intro: 'cardflip',
    vars: { '--bg': '#fff6f4', '--bg2': '#ffe0e7', '--ink': '#5a2a3a', '--muted': '#8a5a6a', '--accent': '#c9577a', '--accent2': '#e8a87c', '--card': 'rgba(255,255,255,.65)', '--line': 'rgba(201,87,122,.22)' },
    fonts: FONT_SETS.garden,
    particles: { types: ['petal'], colors: ['#f7a8b8', '#f4c2c2', '#ffd6e0', '#ffffff', '#e8879c'], count: 45 },
    tempo: 0.32
  },
  {
    key: 'midnight', name: 'Midnight Glam', emoji: '✨', occasion: 'anniversary', decor: 'stars', layout: 'monogram', nameStyle: 'outline', cardStyle: 'sharp', intro: 'curtains',
    vars: { '--bg': '#07071a', '--bg2': '#1d1446', '--ink': '#f3eefe', '--muted': '#b9b0d9', '--accent': '#e0c27a', '--accent2': '#c9a7ff', '--card': 'rgba(255,255,255,.06)', '--line': 'rgba(224,194,122,.25)' },
    fonts: FONT_SETS.regal,
    particles: { types: ['sparkle'], colors: ['#ffffff', '#e0c3fc', '#ffd700'], count: 90, fireworks: true },
    tempo: 0.28
  },
  {
    key: 'haldi', name: 'Haldi Sunshine', emoji: '🌼', occasion: 'ceremony', decor: 'sunburst', layout: 'split', nameStyle: 'duo', cardStyle: 'soft', intro: 'scroll',
    vars: { '--bg': '#fff7d6', '--bg2': '#ffe08a', '--ink': '#5b3200', '--muted': '#8a5a10', '--accent': '#d97706', '--accent2': '#e11d48', '--card': 'rgba(255,255,255,.55)', '--line': 'rgba(217,119,6,.25)' },
    fonts: { display: "'Playfair Display', serif", script: "'Great Vibes', cursive", body: "'Cormorant Garamond', serif" },
    particles: { types: ['marigold', 'petal'], colors: ['#ffb703', '#fb8500', '#ffd60a', '#ff7b00'], count: 40 },
    tempo: 0.26
  },
  {
    key: 'mehendi', name: 'Mehendi Green', emoji: '🌿', occasion: 'wedding', decor: 'lace', layout: 'arch', nameStyle: 'shimmer', cardStyle: 'outline', intro: 'doors',
    vars: { '--bg': '#10261a', '--bg2': '#24513a', '--ink': '#f2efdc', '--muted': '#c9d6b4', '--accent': '#d4b46a', '--accent2': '#a7c957', '--card': 'rgba(255,255,255,.06)', '--line': 'rgba(212,180,106,.25)' },
    fonts: { display: "'Cinzel Decorative', serif", script: "'Parisienne', cursive", body: "'Cormorant Garamond', serif" },
    particles: { types: ['leaf', 'petal'], colors: ['#6a994e', '#a7c957', '#f2e8cf', '#bc4749'], count: 36 },
    tempo: 0.3
  },
  {
    key: 'neon', name: 'Neon Love (Y2K)', emoji: '💖', occasion: 'bday', decor: 'blobs', layout: 'classic', nameStyle: 'solid', cardStyle: 'outline', intro: 'curtains', flavor: 'neon',
    vars: { '--bg': '#0d0221', '--bg2': '#2a0a4a', '--ink': '#ffffff', '--muted': '#d1f7ff', '--accent': '#ff2a6d', '--accent2': '#05d9e8', '--card': 'rgba(5,217,232,.07)', '--line': 'rgba(255,42,109,.4)' },
    fonts: FONT_SETS.retro,
    particles: { types: ['heart', 'sparkle'], colors: ['#ff2a6d', '#05d9e8', '#d1f7ff', '#f9c80e'], count: 45, fireworks: true },
    tempo: 0.22
  },
  {
    key: 'kids', name: 'Candy Party', emoji: '🎈', occasion: 'birthday', decor: 'blobs', layout: 'ticket', nameStyle: 'duo', cardStyle: 'pill', intro: 'giftbox', flavor: 'playful',
    vars: { '--bg': '#eaf8ff', '--bg2': '#ffe3f1', '--ink': '#2b2d6e', '--muted': '#5a5c9e', '--accent': '#ff4f9a', '--accent2': '#3bceac', '--card': 'rgba(255,255,255,.75)', '--line': 'rgba(94,96,206,.2)' },
    fonts: FONT_SETS.playful,
    particles: { types: ['balloon', 'confetti', 'confetti'], colors: ['#ff5fa2', '#ffd23f', '#3bceac', '#5e60ce', '#ff8c42'], count: 40 },
    tempo: 0.2
  },
  {
    key: 'baby', name: 'Baby Cloud', emoji: '🍼', occasion: 'babyshower', decor: 'stars', layout: 'split', nameStyle: 'solid', cardStyle: 'pill', intro: 'giftbox', flavor: 'playful',
    vars: { '--bg': '#f2f7ff', '--bg2': '#fde8f1', '--ink': '#38456b', '--muted': '#6b7699', '--accent': '#7b9fe0', '--accent2': '#f29bbf', '--card': 'rgba(255,255,255,.7)', '--line': 'rgba(123,159,224,.25)' },
    fonts: { display: "'Fredoka', sans-serif", script: "'Parisienne', cursive", body: "'Poppins', sans-serif" },
    particles: { types: ['heart', 'sparkle', 'balloon'], colors: ['#a9c6ff', '#f9b9d2', '#fff1a8', '#c7f0db'], count: 38 },
    tempo: 0.3
  },
  {
    key: 'disco', name: 'Disco Kitty', emoji: '🪩', occasion: 'kitty', decor: 'lights', layout: 'monogram', nameStyle: 'shimmer', cardStyle: 'sharp', intro: 'curtains',
    vars: { '--bg': '#16041f', '--bg2': '#5b0e5e', '--ink': '#fff4fd', '--muted': '#f3c4ec', '--accent': '#ff4fd8', '--accent2': '#ffd400', '--card': 'rgba(255,79,216,.08)', '--line': 'rgba(255,79,216,.4)' },
    fonts: FONT_SETS.retro,
    particles: { types: ['sparkle', 'confetti'], colors: ['#ff4fd8', '#ffd400', '#7df9ff', '#ffffff'], count: 60, fireworks: true },
    tempo: 0.2
  },
  {
    key: 'bollywood', name: 'Filmy Bollywood', emoji: '🎬', occasion: 'sangeet', decor: 'sunburst', layout: 'ticket', nameStyle: 'outline', cardStyle: 'sharp', intro: 'curtains',
    vars: { '--bg': '#140500', '--bg2': '#7a1a00', '--ink': '#fff3dc', '--muted': '#ffd59a', '--accent': '#ffcc00', '--accent2': '#ff3c00', '--card': 'rgba(255,204,0,.07)', '--line': 'rgba(255,204,0,.35)' },
    fonts: { display: "'Righteous', sans-serif", script: "'Great Vibes', cursive", body: "'Poppins', sans-serif" },
    particles: { types: ['marigold', 'sparkle'], colors: ['#ffcc00', '#ff7a00', '#ff3c00', '#fff1b8'], count: 45, fireworks: true },
    tempo: 0.22
  },
  {
    key: 'sunset', name: 'Golden Hour', emoji: '🌅', occasion: 'bday', decor: 'lights', layout: 'split', nameStyle: 'duo', cardStyle: 'soft', intro: 'giftbox',
    vars: { '--bg': '#2a1636', '--bg2': '#a33a4f', '--ink': '#fff1e6', '--muted': '#ffcfb3', '--accent': '#ffb86b', '--accent2': '#ff6b9d', '--card': 'rgba(255,255,255,.07)', '--line': 'rgba(255,184,107,.35)' },
    fonts: FONT_SETS.modern,
    particles: { types: ['balloon', 'confetti', 'sparkle'], colors: ['#ffb86b', '#ff6b9d', '#ffe29a', '#c38dff'], count: 42 },
    tempo: 0.24
  },
  {
    key: 'lavender', name: 'Lavender Dream', emoji: '🪻', occasion: 'naming', decor: 'mandala', layout: 'arch', nameStyle: 'solid', cardStyle: 'outline', intro: 'scroll',
    vars: { '--bg': '#f8f3ff', '--bg2': '#e4d6ff', '--ink': '#3b2a5a', '--muted': '#6e5a94', '--accent': '#8e6cd6', '--accent2': '#e88fbd', '--card': 'rgba(255,255,255,.65)', '--line': 'rgba(142,108,214,.25)' },
    fonts: FONT_SETS.garden,
    particles: { types: ['petal'], colors: ['#b79ced', '#d9c7ff', '#f4b6d2', '#ffffff'], count: 42 },
    tempo: 0.32
  }
];

// Recipes for the generated designs: 20 per occasion in total (classics included).
// moods: d = dark, l = light, cycled per design. Lists are cycled too, so neighbours differ.
const RECIPES = {
  wedding: {
    nouns: ['Rajwada', 'Shehnai', 'Mandap', 'Baraat', 'Jharokha', 'Kalira', 'Sindoor', 'Haveli', 'Doli', 'Varmala', 'Toran', 'Chandni', 'Sehra', 'Darbar', 'Palki', 'Kesar', 'Mehrab', 'Zari'],
    emoji: ['👑', '💍', '🪷', '🕌', '🔥', '🌺'], intros: ['doors', 'envelope', 'curtains', 'scroll'], moods: 'dl', gold: true,
    fonts: ['regal', 'heritage', 'garden', 'dreamy'], decor: ['mandala', 'lace', 'florals', 'deco', 'lights', 'frame'],
    particles: [['marigold', 'petal'], ['petal'], ['sparkle'], ['petal', 'sparkle'], ['leaf', 'petal']], count: 40, fireworks: true, tempo: 0.3
  },
  engagement: {
    nouns: ['Promise', 'Sagai', 'Forever', 'Rendezvous', 'Solitaire', 'Roka', 'Vow', 'Charm', 'Bloom', 'Starlight', 'Serenade', 'Muse', 'Cherish', 'Petals', 'Embrace', 'Spark', 'Destiny', 'Kismat', 'Ring Ceremony'],
    emoji: ['💞', '💍', '💐', '🌹'], intros: ['cardflip', 'envelope', 'giftbox'], moods: 'ld',
    fonts: ['garden', 'modern', 'dreamy'], decor: ['florals', 'lights', 'frame', 'sunburst', 'blobs'],
    particles: [['petal'], ['heart', 'sparkle'], ['petal', 'heart']], count: 40, tempo: 0.3
  },
  sangeet: {
    nouns: ['Dhol', 'Thumka', 'Nach', 'Filmy Night', 'Spotlight', 'Jhoomar', 'Ghungroo', 'Mehfil', 'Superstar', 'Premiere', 'Encore', 'Dandiya', 'Tarana', 'Raag', 'Taal', 'Bhangra', 'Jalwa', 'Rangeela', 'Masti'],
    emoji: ['🎶', '🎬', '💃', '🥁', '🎤'], moods: 'd', flavor: ['', 'neon'], intros: ['curtains', 'doors', 'envelope'],
    fonts: ['retro', 'festive', 'modern'], decor: ['lights', 'sunburst', 'deco', 'mandala', 'stars'],
    particles: [['marigold', 'sparkle'], ['sparkle', 'confetti'], ['confetti', 'heart']], count: 48, fireworks: true, tempo: 0.22
  },
  kitty: {
    nouns: ['Glam', 'Diva', 'Brunch', 'Tambola', 'Gossip', 'Chai Party', 'Sequin', 'Velvet', 'Cocktail', 'Soirée', 'Fiesta', 'Glitter', 'Boss Lady', 'High Tea', 'Queen Bee', 'Sassy', 'Lounge', 'Gala', 'Girls Night'],
    emoji: ['💃', '🪩', '👠', '🍸', '💅'], moods: 'ddl', flavor: ['neon', ''], intros: ['curtains', 'giftbox', 'cardflip'],
    fonts: ['retro', 'modern', 'festive'], decor: ['deco', 'lights', 'stars', 'blobs', 'sunburst'],
    particles: [['sparkle', 'confetti'], ['heart', 'sparkle'], ['confetti']], count: 50, fireworks: true, tempo: 0.2
  },
  bday: {
    nouns: ['Fabulous', 'Cheers', 'Rooftop', 'Milestone', 'Toast', 'Sparkler', 'Hooray', 'Bash', 'Wishes', 'Vibes', 'Glow Up', 'Big Night', 'Fizz', 'Afterparty', 'Disco Ball', 'Dirty Thirty', 'Golden Fifty', 'Sweet Sixteen'],
    emoji: ['🥳', '🎉', '🍾', '🎂', '✨'], intros: ['giftbox', 'curtains', 'envelope'], moods: 'dl',
    fonts: ['modern', 'retro', 'soft'], decor: ['sunburst', 'lights', 'stars', 'blobs', 'deco'],
    particles: [['balloon', 'confetti', 'sparkle'], ['confetti', 'sparkle'], ['balloon', 'confetti']], count: 42, fireworks: true, tempo: 0.24
  },
  naming: {
    nouns: ['Little Star', 'Naamkaran', 'Tiny Toes', 'Blessing', 'Moonbeam', 'Cradle', 'Lullaby', 'Angel', 'Twinkle', 'Sunbeam', 'Cherub', 'Snowdrop', 'Butterfly', 'Dewdrop', 'Baby Bloom', 'Wish', 'Cuddle', 'Sweet Pea', 'Rainbow Baby'],
    emoji: ['👶', '⭐', '🌙', '🪔', '🦋'], intros: ['scroll', 'cardflip', 'envelope'], moods: 'l',
    fonts: ['garden', 'soft', 'dreamy'], decor: ['stars', 'florals', 'lace', 'blobs', 'frame'],
    particles: [['petal'], ['sparkle', 'heart'], ['petal', 'sparkle']], count: 40, tempo: 0.32
  },
  birthday: {
    nouns: ['Jungle', 'Superhero', 'Unicorn', 'Dino', 'Rocket', 'Circus', 'Cupcake', 'Lollipop', 'Robot', 'Mermaid', 'Pirate', 'Safari', 'Toy Box', 'Jelly', 'Bubbles', 'Carnival', 'Space', 'Teddy', 'Princess'],
    emoji: ['🦁', '🦸', '🦄', '🦖', '🚀', '🎪', '🧁', '🍭', '🤖', '🧜‍♀️', '🏴‍☠️', '🦒', '🧸', '🍬', '🫧', '🎠', '🪐', '🐻', '👸'], moods: 'llld', flavor: ['playful'], intros: ['giftbox', 'curtains', 'envelope'],
    fonts: ['playful', 'soft'], decor: ['blobs', 'sunburst', 'stars', 'lights'],
    particles: [['balloon', 'confetti', 'confetti'], ['balloon', 'sparkle'], ['confetti', 'heart', 'balloon']], count: 40, tempo: 0.2
  },
  babyshower: {
    nouns: ['Godh Bharai', 'Oh Baby', 'Stork', 'Bundle of Joy', 'Little One', 'Cloud Nine', 'Peekaboo', 'Booties', 'Rattle', 'Baby Bump', 'Hush', 'Nest', 'Blossom', 'Cotton', 'Mama Bear', 'Sweetheart', 'Tiny Hands', 'Pitter Patter', 'Sunshine'],
    emoji: ['🍼', '🧸', '👣', '☁️', '🎀'], moods: 'l', flavor: ['playful', ''], intros: ['giftbox', 'cardflip', 'envelope'],
    fonts: ['soft', 'playful', 'garden'], decor: ['blobs', 'stars', 'florals', 'lace'],
    particles: [['heart', 'sparkle', 'balloon'], ['balloon', 'heart'], ['sparkle', 'petal']], count: 38, tempo: 0.3
  },
  ceremony: {
    nouns: ['Griha Pravesh', 'Ganesh', 'Diya', 'Havan', 'Aarti', 'Kalash', 'Shubh', 'Mangal', 'Pooja', 'Lakshmi', 'Rangoli', 'Toran Gate', 'Sankalp', 'Om', 'Prasad', 'Deepam', 'Kumkum', 'Tulsi', 'Satyanarayan'],
    emoji: ['🪔', '🕉️', '🌼', '🙏', '🏠', '🪷'], intros: ['scroll', 'doors', 'envelope'], moods: 'llld',
    fonts: ['heritage', 'festive', 'regal', 'garden'], decor: ['mandala', 'lace', 'sunburst', 'florals', 'frame'],
    particles: [['marigold', 'petal'], ['marigold'], ['petal', 'leaf'], ['sparkle', 'marigold']], count: 40, tempo: 0.28
  },
  anniversary: {
    nouns: ['Silver Jubilee', 'Golden Years', 'Sacred Vows', 'Forever Us', 'Together', 'Timeless', 'Soulmates', 'Eternity', 'Candlelight', 'Moonlit', 'Memories', 'Devotion', 'Champagne', 'Starry Vows', 'Velvet Night', 'Heirloom', 'Always', 'Ever After', 'Grace'],
    emoji: ['🥂', '💑', '🕯️', '💐', '✨'], intros: ['cardflip', 'doors', 'curtains'], moods: 'ddl', gold: true,
    fonts: ['regal', 'modern', 'dreamy', 'heritage'], decor: ['deco', 'stars', 'frame', 'lights', 'florals'],
    particles: [['sparkle'], ['heart', 'sparkle'], ['petal', 'sparkle']], count: 50, fireworks: true, tempo: 0.28
  }
};

const HUES = [['Ruby', 350], ['Rose', 338], ['Coral', 10], ['Saffron', 26], ['Amber', 38], ['Marigold', 47], ['Lime', 78], ['Jade', 155],
  ['Emerald', 140], ['Teal', 172], ['Aqua', 188], ['Sky', 202], ['Sapphire', 218], ['Cobalt', 230], ['Indigo', 245], ['Violet', 262],
  ['Lavender', 272], ['Orchid', 290], ['Magenta', 315], ['Berry', 328]];

function hslHex(h, s, l) {
  h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const c = l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(c * 255).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

const hexAlpha = (hex, a) => `rgba(${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)},${a})`;

// WCAG contrast ratio, used to keep generated accents readable (greens and yellows are bright at the same lightness).
function contrast(a, b) {
  const lum = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(c => c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
    .reduce((s, c, i) => s + c * [0.2126, 0.7152, 0.0722][i], 0);
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

function palette(h, dark, gold, j) {
  if (dark) {
    const accent = gold ? hslHex(38 + (j % 3) * 6, 80, 62) : hslHex(h, 85, 66);
    const accent2 = hslHex(h + 30, 85, 64);
    return {
      vars: { '--bg': hslHex(h, 55, 8), '--bg2': hslHex(h, 60, 22), '--ink': hslHex(h, 35, 94), '--muted': hslHex(h, 30, 78), '--accent': accent, '--accent2': accent2, '--card': 'rgba(255,255,255,.06)', '--line': hexAlpha(accent, 0.28) },
      colors: [accent, accent2, hslHex(h, 85, 72), '#ffffff']
    };
  }
  const bg = hslHex(h, 80, 97);
  let l = 42;
  while (contrast(hslHex(h, 68, l), bg) < 3.4) l -= 2;
  const accent = hslHex(h, 68, l), accent2 = hslHex(h + 35, 70, 55);
  return {
    vars: { '--bg': bg, '--bg2': hslHex(h, 75, 88), '--ink': hslHex(h, 50, 20), '--muted': hslHex(h, 25, 40), '--accent': accent, '--accent2': accent2, '--card': 'rgba(255,255,255,.68)', '--line': hexAlpha(accent, 0.25) },
    colors: [accent, accent2, hslHex(h, 80, 75), hslHex(h + 60, 80, 68)]
  };
}

function generated(occasion, j, c) {
  const r = RECIPES[occasion];
  const [hueName, h] = HUES[(j * 7 + c * 3) % HUES.length];
  const pick = (list, n = j) => list[n % list.length];
  const dark = pick(r.moods) === 'd';
  const p = palette(h, dark, r.gold, j);
  const types = pick(r.particles, j + c);
  return {
    name: `${hueName} ${r.nouns[j]}`, emoji: pick(r.emoji), occasion,
    decor: pick(r.decor, j + (j >> 2)), layout: LAYOUTS[(j + 2 * c) % LAYOUTS.length],
    nameStyle: NAME_STYLES[(j * 3 + c) % NAME_STYLES.length], cardStyle: CARD_STYLES[(j + (j >> 2) + c) % CARD_STYLES.length], intro: pick(r.intros, j + (j >> 1)), flavor: r.flavor ? pick(r.flavor) : '',
    vars: p.vars, fonts: FONT_SETS[pick(r.fonts, j + (j >> 1))],
    particles: { types, colors: p.colors, count: r.count, fireworks: !!(r.fireworks && dark) },
    tempo: r.tempo
  };
}

// Classics first, then the generated designs interleaved by occasion so neighbours look different.
const TEMPLATES = (() => {
  const list = CLASSICS.map(t => ({ flavor: '', ...t }));
  const occasions = Object.keys(RECIPES);
  const made = Object.fromEntries(occasions.map(o => [o, 0]));
  const need = Object.fromEntries(occasions.map(o => [o, 20 - CLASSICS.filter(t => t.occasion === o).length]));
  for (let j = 0; list.length < 200; j++) {
    occasions.forEach((o, c) => { if (made[o] < need[o] && made[o] <= j) list.push(generated(o, made[o]++, c)); });
  }
  // If two designs ever ended up with the same layout, decor, fonts and styles, nudge the later one's styles.
  const seen = new Set();
  const sig = t => [t.layout, t.decor, t.nameStyle, t.cardStyle, JSON.stringify(t.fonts)].join('|');
  list.forEach((t, i) => {
    // Neighbours (#047, #048…) never share a layout.
    if (i && t.layout === list[i - 1].layout) t.layout = LAYOUTS[(LAYOUTS.indexOf(t.layout) + 1) % LAYOUTS.length];
    for (let k = 0; seen.has(sig(t)) && k < 16; k++) {
      t.cardStyle = CARD_STYLES[(CARD_STYLES.indexOf(t.cardStyle) + 1) % CARD_STYLES.length];
      if (k % 4 === 3) t.nameStyle = NAME_STYLES[(NAME_STYLES.indexOf(t.nameStyle) + 1) % NAME_STYLES.length];
    }
    seen.add(sig(t));
  });
  // Every design gets its own song (js/music.js): chord progression, melody pattern, instrument and key.
  // Parties may get the playful pluck; weddings and ceremonies keep softer instruments. #001 keeps the original tune.
  const songs = new Set();
  list.forEach((t, i) => {
    const voices = ['sangeet', 'kitty', 'bday', 'birthday'].includes(t.occasion) ? ['musicbox', 'bells', 'harp', 'pluck'] : ['musicbox', 'bells', 'harp'];
    const song = { prog: i % 8, pattern: (i * 5 + (i >> 3)) % 6, voice: voices[(i * 3 + (i >> 2)) % voices.length], key: (i * 7) % 12 };
    while (songs.has(JSON.stringify(song))) song.key = (song.key + 1) % 12;
    songs.add(JSON.stringify(song));
    t.song = song;
  });
  return list.map((t, i) => ({ no: i + 1, ...t }));
})();

const Templates = {
  all: TEMPLATES,
  // Accepts 47, "47", "047", "#047" or an old name like "royal".
  get(id) {
    if (typeof id === 'string') {
      const legacy = TEMPLATES.find(t => t.key === id);
      if (legacy) return legacy;
      id = id.trim().replace(/^#/, '');
      if (!/^\d+$/.test(id)) return null;
    }
    return Number.isInteger(+id) ? TEMPLATES[+id - 1] || null : null;
  },
  serial(no) {
    return '#' + String(no).padStart(3, '0');
  }
};

const PRESETS = {
  wedding: {
    label: 'Wedding', icon: '💍', labels: ['Bride / Partner 1', 'Groom / Partner 2'],
    card: {
      type: 'wedding', theme: 1, title: 'Together with their families',
      host1: 'Diya', host2: 'Aarav', tagline: 'request the honour of your presence at their wedding',
      date: '2026-12-12T19:30', venue: 'The Leela Palace, Udaipur',
      message: 'Two souls, one journey. Come bless us as we begin our forever.',
      events: [
        { name: '🌼 Haldi', date: '2026-12-10T10:00', venue: 'Poolside Lawn', dress: 'Shades of yellow' },
        { name: '🌿 Mehendi', date: '2026-12-10T17:00', venue: 'Garden Courtyard', dress: 'Green & pink' },
        { name: '🎶 Sangeet', date: '2026-12-11T20:00', venue: 'Grand Ballroom', dress: 'Indo-western glam' },
        { name: '🔥 Pheras', date: '2026-12-12T19:30', venue: 'Lakeside Mandap', dress: 'Traditional' },
        { name: '🥂 Reception', date: '2026-12-13T20:00', venue: 'Crystal Hall', dress: 'Black tie' }
      ],
      music: true
    }
  },
  engagement: {
    label: 'Engagement', icon: '💞', labels: ['Partner 1', 'Partner 2'],
    card: {
      type: 'engagement', theme: 2, title: 'Save the date',
      host1: 'Ananya', host2: 'Vihaan', tagline: 'are getting engaged — and we want you there!',
      date: '2026-11-29T18:00', venue: 'The Rose Garden, Jaipur',
      message: 'A ring, a promise and a party. Join us for the beginning of our forever.',
      events: [
        { name: '💍 Ring Ceremony', date: '2026-11-29T18:00', venue: 'Garden Lawn', dress: 'Pastels' },
        { name: '🍽️ Dinner & Dance', date: '2026-11-29T20:00', venue: 'Terrace', dress: 'Cocktail' }
      ],
      music: true
    }
  },
  sangeet: {
    label: 'Sangeet Night', icon: '🎶', labels: ['Partner 1', 'Partner 2'],
    card: {
      type: 'sangeet', theme: 10, title: 'Lights. Camera. Shaadi!',
      host1: 'Diya', host2: 'Aarav', tagline: 'invite you to a filmy Sangeet night',
      date: '2026-12-11T20:00', venue: 'Grand Ballroom, The Leela, Udaipur',
      message: 'Bring your dancing shoes. The dance floor is waiting for you!',
      events: [
        { name: '💃 Family Performances', date: '2026-12-11T20:00', dress: 'Bollywood glam' },
        { name: '🎧 DJ Night', date: '2026-12-11T22:00' }
      ],
      music: true
    }
  },
  kitty: {
    label: 'Kitty Party', icon: '💃', labels: ['Club / host name', 'Co-host (optional)'],
    card: {
      type: 'kitty', theme: 9, title: "Ladies, it's party time!",
      host1: 'Glam Girls Kitty Club', host2: '', tagline: 'invites you to our Disco Night Kitty 🪩',
      date: '2026-11-18T15:00', venue: 'Café Delhi Heights, Saket',
      message: 'Dress to impress, bring your best moves and your kitty contribution 💸',
      events: [
        { name: '🎲 Tambola', date: '2026-11-18T15:30' },
        { name: '👑 Best Dressed Contest', date: '2026-11-18T16:30', dress: 'Sequins & sparkle' },
        { name: '🍰 High Tea', date: '2026-11-18T17:00' }
      ],
      music: true
    }
  },
  bday: {
    label: 'Birthday', icon: '🥳', labels: ['Birthday name', 'Second name (optional)'],
    card: {
      type: 'bday', theme: 11, title: "Let's celebrate",
      host1: 'Neha', host2: '', tagline: 'is turning 30 & fabulous!',
      date: '2026-11-28T20:00', venue: 'Skybar Rooftop, Bengaluru',
      message: 'Good food, great music and the best people. See you there!',
      events: [
        { name: '🍹 Welcome Drinks', date: '2026-11-28T20:00' },
        { name: '🎂 Cake Cutting', date: '2026-11-28T21:30' }
      ],
      music: true
    }
  },
  naming: {
    label: 'Naming Ceremony', icon: '👶', labels: ['Parent 1', 'Parent 2'],
    card: {
      type: 'naming', theme: 12, title: 'A little star has arrived',
      host1: 'Priya', host2: 'Rohan', tagline: 'invite you to the Naamkaran of their baby girl',
      date: '2027-01-10T11:00', venue: 'Sharma Residence, Pune',
      message: 'Come shower your blessings on our little bundle of joy.',
      events: [
        { name: '🪔 Puja & Naamkaran', date: '2027-01-10T11:00' },
        { name: '🍛 Lunch', date: '2027-01-10T13:00' }
      ],
      music: true
    }
  },
  birthday: {
    label: 'Kids Birthday', icon: '🎂', labels: ["Birthday star's name", 'Second name (optional)'],
    card: {
      type: 'birthday', theme: 7, title: "You're invited to a party!",
      host1: 'Kabir', host2: '', tagline: 'is turning 5! 🎈',
      date: '2026-11-22T16:00', venue: 'FunCity Play Zone, Noida',
      message: 'Games, cake, magic and lots of fun. Come celebrate with us!',
      events: [
        { name: '🎩 Magic Show', date: '2026-11-22T16:30' },
        { name: '🎂 Cake Cutting', date: '2026-11-22T17:30' },
        { name: '🍕 Dinner & Return Gifts', date: '2026-11-22T18:00' }
      ],
      music: true
    }
  },
  babyshower: {
    label: 'Baby Shower', icon: '🍼', labels: ['Parent 1', 'Parent 2'],
    card: {
      type: 'babyshower', theme: 8, title: 'Oh baby!',
      host1: 'Priya', host2: 'Rohan', tagline: 'are expecting a little miracle. Join us for the Godh Bharai',
      date: '2026-12-06T11:00', venue: 'Sharma Residence, Pune',
      message: 'Your blessings mean the world to us and our little one.',
      events: [
        { name: '🪷 Godh Bharai Rituals', date: '2026-12-06T11:00' },
        { name: '🎲 Fun & Games', date: '2026-12-06T12:30' },
        { name: '🍛 Lunch', date: '2026-12-06T13:30' }
      ],
      music: true
    }
  },
  ceremony: {
    label: 'Ceremony / Puja', icon: '🪔', labels: ['Host name', 'Second name (optional)'],
    card: {
      type: 'ceremony', theme: 4, title: 'With the blessings of the Almighty',
      host1: 'The Sharma Family', host2: '', tagline: 'invites you to the Griha Pravesh of our new home',
      date: '2026-11-15T09:00', venue: 'B-204, Green Valley, Gurugram',
      message: 'Please join us with your family to seek blessings and share a meal.',
      events: [
        { name: '🪔 Ganesh Puja', date: '2026-11-15T09:00' },
        { name: '🔥 Havan', date: '2026-11-15T10:30' },
        { name: '🍛 Bhoj', date: '2026-11-15T13:00' }
      ],
      music: true
    }
  },
  anniversary: {
    label: 'Anniversary', icon: '🥂', labels: ['Partner 1', 'Partner 2'],
    card: {
      type: 'anniversary', theme: 3, title: '25 years of love',
      host1: 'Meera', host2: 'Raj', tagline: 'celebrate their Silver Jubilee',
      date: '2026-12-20T19:30', venue: 'Taj Lands End, Mumbai',
      message: 'A quarter century of laughter, love and togetherness. Celebrate with us!',
      events: [
        { name: '🥂 Cocktails', date: '2026-12-20T19:30', dress: 'Silver & black' },
        { name: '💃 Dinner & Dance', date: '2026-12-20T21:00' }
      ],
      music: true
    }
  }
};
