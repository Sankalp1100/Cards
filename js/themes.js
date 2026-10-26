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
const LAYOUTS = ['classic', 'arch', 'monogram', 'ticket', 'split', 'editorial', 'orbit'];
const NAME_STYLES = ['shimmer', 'solid', 'outline', 'duo', 'chrome', 'holo', 'glow'];
const CARD_STYLES = ['soft', 'sharp', 'pill', 'outline'];
const DECORS = ['mandala', 'blobs', 'frame', 'florals', 'sunburst', 'deco', 'lights', 'stars', 'lace'];
const EVENT_STYLES = ['timeline', 'cards', 'zigzag', 'tickets', 'chapters'];
const COUNTDOWNS = ['boxes', 'rings', 'strip', 'minimal'];
const TITLE_STYLES = ['flourish', 'bar', 'lines'];
// The moving parts: the animated background behind the whole card, how the names arrive,
// the frame around the photo (or emoji), and how each section appears while scrolling.
const SCENES = ['none', 'glow', 'aurora', 'mesh', 'grain', 'bokeh', 'rays', 'waves', 'grid', 'holo', 'silk'];
const NAME_FX = ['drop', 'rise', 'blur', 'flip', 'stamp', 'scatter', 'type', 'swing'];
const FRAMES = ['ring', 'arch', 'polaroid', 'blob', 'halo'];
const REVEALS = ['up', 'zoom', 'flip', 'slide', 'blur', 'wipe'];
// Backgrounds that would only repeat a decor's pattern.
const CLASHES = { sunburst: 'rays', deco: 'grid', mandala: 'rays', blobs: 'mesh' };

// The premium page: what hangs across the top of the first screen, and how the venue is drawn.
const MOTIFS = ['none', 'toran', 'bunting', 'lanterns', 'bells', 'diyas', 'garland'];
const VENUE_ARTS = ['palace', 'temple', 'garden', 'city', 'home'];
// Per occasion: the motifs and venue drawings that suit it, and the words for the connector and the chapters.
const OCCASION_STYLE = {
  wedding: { motifs: ['toran', 'garland', 'bells', 'lanterns', 'diyas'], venues: ['palace', 'garden', 'temple'], join: 'weds', story: 'Our Story', fests: 'Shubh Muhurat' },
  engagement: { motifs: ['garland', 'lanterns', 'toran', 'bunting'], venues: ['garden', 'palace', 'city'], join: '&', story: 'Our Story', fests: 'The Celebration' },
  sangeet: { motifs: ['bunting', 'lanterns', 'toran', 'garland'], venues: ['palace', 'city', 'garden'], join: '&', story: 'Our Story', fests: 'The Line-up' },
  kitty: { motifs: ['bunting', 'lanterns', 'garland'], venues: ['city', 'garden', 'home'], join: '&', story: 'Our Club', fests: 'The Plan' },
  bday: { motifs: ['bunting', 'lanterns', 'garland'], venues: ['city', 'garden', 'home'], join: '&', story: 'Through the Years', fests: 'The Plan' },
  naming: { motifs: ['garland', 'bells', 'lanterns', 'diyas'], venues: ['home', 'temple', 'garden'], join: '&', story: 'Our Little Journey', fests: 'The Ceremony' },
  birthday: { motifs: ['bunting', 'garland', 'lanterns'], venues: ['garden', 'home', 'city'], join: '&', story: 'Growing Up', fests: 'The Fun' },
  babyshower: { motifs: ['bunting', 'garland', 'lanterns', 'bells'], venues: ['home', 'garden', 'palace'], join: '&', story: 'Our Little Journey', fests: 'The Ceremony' },
  ceremony: { motifs: ['toran', 'bells', 'diyas', 'garland'], venues: ['temple', 'home', 'palace'], join: '&', story: 'Our Home', fests: 'Shubh Muhurat' },
  anniversary: { motifs: ['lanterns', 'garland', 'toran', 'bells'], venues: ['palace', 'garden', 'city'], join: '&', story: 'Our Journey', fests: 'The Evening' }
};

// The original 12 hand-made designs are #001–#012. `key` keeps links made before numbering working.
const CLASSICS = [
  {
    key: 'royal', style: 'palace', hue: 345, name: 'Royal Maharaja', emoji: '👑', occasion: 'wedding', decor: 'mandala', layout: 'classic', nameStyle: 'shimmer', cardStyle: 'soft', intro: 'envelope', scene: 'rays', nameFx: 'drop', frame: 'ring', reveal: 'up',
    vars: { '--bg': '#2b0a14', '--bg2': '#5c0f24', '--ink': '#fbeedd', '--muted': '#e8cfa9', '--accent': '#e9b949', '--accent2': '#ff8f3f', '--card': 'rgba(255,255,255,.06)', '--line': 'rgba(233,185,73,.25)' },
    fonts: FONT_SETS.regal,
    particles: { types: ['marigold', 'petal'], colors: ['#ff9f1c', '#ffbf3f', '#e63946', '#ffd166'], count: 38 },
    tempo: 0.3
  },
  {
    key: 'floral', style: 'bloom', hue: 340, name: 'Blush Garden', emoji: '🌸', occasion: 'engagement', decor: 'florals', layout: 'arch', nameStyle: 'solid', cardStyle: 'pill', intro: 'cardflip', scene: 'mesh', nameFx: 'blur', frame: 'arch', reveal: 'zoom',
    vars: { '--bg': '#fff6f4', '--bg2': '#ffe0e7', '--ink': '#5a2a3a', '--muted': '#8a5a6a', '--accent': '#c9577a', '--accent2': '#e8a87c', '--card': 'rgba(255,255,255,.65)', '--line': 'rgba(201,87,122,.22)' },
    fonts: FONT_SETS.garden,
    particles: { types: ['petal'], colors: ['#f7a8b8', '#f4c2c2', '#ffd6e0', '#ffffff', '#e8879c'], count: 45 },
    tempo: 0.32
  },
  {
    key: 'midnight', style: 'palace', hue: 245, name: 'Midnight Glam', emoji: '✨', occasion: 'anniversary', decor: 'stars', layout: 'monogram', nameStyle: 'outline', cardStyle: 'sharp', intro: 'curtains', scene: 'aurora', nameFx: 'flip', frame: 'halo', reveal: 'blur',
    vars: { '--bg': '#07071a', '--bg2': '#1d1446', '--ink': '#f3eefe', '--muted': '#b9b0d9', '--accent': '#e0c27a', '--accent2': '#c9a7ff', '--card': 'rgba(255,255,255,.06)', '--line': 'rgba(224,194,122,.25)' },
    fonts: FONT_SETS.regal,
    particles: { types: ['sparkle'], colors: ['#ffffff', '#e0c3fc', '#ffd700'], count: 90, fireworks: true },
    tempo: 0.28
  },
  {
    key: 'haldi', style: 'marigold', hue: 22, name: 'Haldi Sunshine', emoji: '🌼', occasion: 'ceremony', decor: 'sunburst', layout: 'split', nameStyle: 'duo', cardStyle: 'soft', intro: 'scroll', scene: 'bokeh', nameFx: 'stamp', frame: 'polaroid', reveal: 'slide',
    vars: { '--bg': '#fff7d6', '--bg2': '#ffe08a', '--ink': '#5b3200', '--muted': '#8a5a10', '--accent': '#d97706', '--accent2': '#e11d48', '--card': 'rgba(255,255,255,.55)', '--line': 'rgba(217,119,6,.25)' },
    fonts: { display: "'Playfair Display', serif", script: "'Great Vibes', cursive", body: "'Cormorant Garamond', serif" },
    particles: { types: ['marigold', 'petal'], colors: ['#ffb703', '#fb8500', '#ffd60a', '#ff7b00'], count: 40 },
    tempo: 0.26
  },
  {
    key: 'mehendi', style: 'mehendi', hue: 140, name: 'Mehendi Green', emoji: '🌿', occasion: 'wedding', decor: 'lace', layout: 'arch', nameStyle: 'shimmer', cardStyle: 'outline', intro: 'doors', scene: 'silk', nameFx: 'rise', frame: 'arch', reveal: 'wipe',
    vars: { '--bg': '#10261a', '--bg2': '#24513a', '--ink': '#f2efdc', '--muted': '#c9d6b4', '--accent': '#d4b46a', '--accent2': '#a7c957', '--card': 'rgba(255,255,255,.06)', '--line': 'rgba(212,180,106,.25)' },
    fonts: { display: "'Cinzel Decorative', serif", script: "'Parisienne', cursive", body: "'Cormorant Garamond', serif" },
    particles: { types: ['leaf', 'petal'], colors: ['#6a994e', '#a7c957', '#f2e8cf', '#bc4749'], count: 36 },
    tempo: 0.3
  },
  {
    key: 'neon', style: 'neon', hue: 330, name: 'Neon Love (Y2K)', emoji: '💖', occasion: 'bday', decor: 'blobs', layout: 'classic', nameStyle: 'solid', cardStyle: 'outline', intro: 'curtains', flavor: 'neon', scene: 'grid', nameFx: 'scatter', frame: 'halo', reveal: 'zoom',
    vars: { '--bg': '#0d0221', '--bg2': '#2a0a4a', '--ink': '#ffffff', '--muted': '#d1f7ff', '--accent': '#ff2a6d', '--accent2': '#05d9e8', '--card': 'rgba(5,217,232,.07)', '--line': 'rgba(255,42,109,.4)' },
    fonts: FONT_SETS.retro,
    particles: { types: ['heart', 'sparkle'], colors: ['#ff2a6d', '#05d9e8', '#d1f7ff', '#f9c80e'], count: 45, fireworks: true },
    tempo: 0.22
  },
  {
    key: 'kids', style: 'toybox', hue: 330, name: 'Candy Party', emoji: '🎈', occasion: 'birthday', decor: 'blobs', layout: 'ticket', nameStyle: 'duo', cardStyle: 'pill', intro: 'giftbox', flavor: 'playful', scene: 'waves', nameFx: 'swing', frame: 'blob', reveal: 'flip',
    vars: { '--bg': '#eaf8ff', '--bg2': '#ffe3f1', '--ink': '#2b2d6e', '--muted': '#5a5c9e', '--accent': '#ff4f9a', '--accent2': '#3bceac', '--card': 'rgba(255,255,255,.75)', '--line': 'rgba(94,96,206,.2)' },
    fonts: FONT_SETS.playful,
    particles: { types: ['balloon', 'confetti', 'confetti'], colors: ['#ff5fa2', '#ffd23f', '#3bceac', '#5e60ce', '#ff8c42'], count: 40 },
    tempo: 0.2
  },
  {
    key: 'baby', style: 'toybox', hue: 215, name: 'Baby Cloud', emoji: '🍼', occasion: 'babyshower', decor: 'stars', layout: 'split', nameStyle: 'solid', cardStyle: 'pill', intro: 'giftbox', flavor: 'playful', scene: 'bokeh', nameFx: 'rise', frame: 'blob', reveal: 'up',
    vars: { '--bg': '#f2f7ff', '--bg2': '#fde8f1', '--ink': '#38456b', '--muted': '#6b7699', '--accent': '#7b9fe0', '--accent2': '#f29bbf', '--card': 'rgba(255,255,255,.7)', '--line': 'rgba(123,159,224,.25)' },
    fonts: { display: "'Fredoka', sans-serif", script: "'Parisienne', cursive", body: "'Poppins', sans-serif" },
    particles: { types: ['heart', 'sparkle', 'balloon'], colors: ['#a9c6ff', '#f9b9d2', '#fff1a8', '#c7f0db'], count: 38 },
    tempo: 0.3
  },
  {
    key: 'disco', style: 'neon', hue: 300, name: 'Disco Kitty', emoji: '🪩', occasion: 'kitty', decor: 'lights', layout: 'monogram', nameStyle: 'shimmer', cardStyle: 'sharp', intro: 'curtains', scene: 'holo', nameFx: 'stamp', frame: 'ring', reveal: 'flip',
    vars: { '--bg': '#16041f', '--bg2': '#5b0e5e', '--ink': '#fff4fd', '--muted': '#f3c4ec', '--accent': '#ff4fd8', '--accent2': '#ffd400', '--card': 'rgba(255,79,216,.08)', '--line': 'rgba(255,79,216,.4)' },
    fonts: FONT_SETS.retro,
    particles: { types: ['sparkle', 'confetti'], colors: ['#ff4fd8', '#ffd400', '#7df9ff', '#ffffff'], count: 60, fireworks: true },
    tempo: 0.2
  },
  {
    key: 'bollywood', style: 'retro', hue: 8, name: 'Filmy Bollywood', emoji: '🎬', occasion: 'sangeet', decor: 'sunburst', layout: 'ticket', nameStyle: 'outline', cardStyle: 'sharp', intro: 'curtains', scene: 'rays', nameFx: 'type', frame: 'polaroid', reveal: 'slide',
    vars: { '--bg': '#140500', '--bg2': '#7a1a00', '--ink': '#fff3dc', '--muted': '#ffd59a', '--accent': '#ffcc00', '--accent2': '#ff3c00', '--card': 'rgba(255,204,0,.07)', '--line': 'rgba(255,204,0,.35)' },
    fonts: { display: "'Righteous', sans-serif", script: "'Great Vibes', cursive", body: "'Poppins', sans-serif" },
    particles: { types: ['marigold', 'sparkle'], colors: ['#ffcc00', '#ff7a00', '#ff3c00', '#fff1b8'], count: 45, fireworks: true },
    tempo: 0.22
  },
  {
    key: 'sunset', style: 'bloom', hue: 20, name: 'Golden Hour', emoji: '🌅', occasion: 'bday', decor: 'lights', layout: 'split', nameStyle: 'duo', cardStyle: 'soft', intro: 'giftbox', scene: 'waves', nameFx: 'scatter', frame: 'halo', reveal: 'wipe',
    vars: { '--bg': '#2a1636', '--bg2': '#a33a4f', '--ink': '#fff1e6', '--muted': '#ffcfb3', '--accent': '#ffb86b', '--accent2': '#ff6b9d', '--card': 'rgba(255,255,255,.07)', '--line': 'rgba(255,184,107,.35)' },
    fonts: FONT_SETS.modern,
    particles: { types: ['balloon', 'confetti', 'sparkle'], colors: ['#ffb86b', '#ff6b9d', '#ffe29a', '#c38dff'], count: 42 },
    tempo: 0.24
  },
  {
    key: 'lavender', style: 'bloom', hue: 270, name: 'Lavender Dream', emoji: '🪻', occasion: 'naming', decor: 'mandala', layout: 'arch', nameStyle: 'solid', cardStyle: 'outline', intro: 'scroll', scene: 'aurora', nameFx: 'blur', frame: 'arch', reveal: 'zoom',
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
    scenes: ['rays', 'silk', 'aurora', 'grain', 'bokeh', 'holo', 'mesh', 'glow'],
    nouns: ['Rajwada', 'Shehnai', 'Mandap', 'Baraat', 'Jharokha', 'Kalira', 'Sindoor', 'Haveli', 'Doli', 'Varmala', 'Toran', 'Chandni', 'Sehra', 'Darbar', 'Palki', 'Kesar', 'Mehrab', 'Zari', 'Saat Phere', 'Gathbandhan', 'Jaimala', 'Kanyadaan', 'Mangalsutra', 'Shubh Vivah', 'Royal Tilak', 'Raj Mahal', 'Dulhan', 'Mehfil-e-Ishq'],
    emoji: ['👑', '💍', '🪷', '🕌', '🔥', '🌺'], intros: ['doors', 'envelope', 'curtains', 'scroll'], moods: 'dl', gold: true,
    fonts: ['regal', 'heritage', 'garden', 'dreamy'], decor: ['mandala', 'lace', 'florals', 'deco', 'lights', 'frame'],
    particles: [['marigold', 'petal'], ['petal'], ['sparkle'], ['petal', 'sparkle'], ['leaf', 'petal']], count: 40, fireworks: true, tempo: 0.3
  },
  engagement: {
    scenes: ['mesh', 'bokeh', 'aurora', 'holo', 'silk', 'glow', 'waves', 'grain'],
    nouns: ['Promise', 'Sagai', 'Forever', 'Rendezvous', 'Solitaire', 'Roka', 'Vow', 'Charm', 'Bloom', 'Starlight', 'Serenade', 'Muse', 'Cherish', 'Petals', 'Embrace', 'Spark', 'Destiny', 'Kismat', 'Ring Ceremony', 'Ring Bliss', 'Sagai Rasm', 'Pinky Promise', 'Heartstrings', 'Yes Forever', 'Love Knot', 'Tied Together', 'Rose Garden', 'First Chapter', 'Golden Ring'],
    emoji: ['💞', '💍', '💐', '🌹'], intros: ['cardflip', 'envelope', 'giftbox'], moods: 'ld',
    fonts: ['garden', 'modern', 'dreamy'], decor: ['florals', 'lights', 'frame', 'sunburst', 'blobs'],
    particles: [['petal'], ['heart', 'sparkle'], ['petal', 'heart']], count: 40, tempo: 0.3
  },
  sangeet: {
    scenes: ['grid', 'rays', 'holo', 'aurora', 'bokeh', 'grain', 'mesh', 'glow'],
    nouns: ['Dhol', 'Thumka', 'Nach', 'Filmy Night', 'Spotlight', 'Jhoomar', 'Ghungroo', 'Mehfil', 'Superstar', 'Premiere', 'Encore', 'Dandiya', 'Tarana', 'Raag', 'Taal', 'Bhangra', 'Jalwa', 'Rangeela', 'Masti', 'Dance Floor', 'Mehendi Beats', 'Bollywood Nights', 'Garba', 'Disco Dhol', 'Naach Gaana', 'Showstopper', 'Stage Lights', 'Filmy Dhamaka', 'Sufi Night'],
    emoji: ['🎶', '🎬', '💃', '🥁', '🎤'], moods: 'd', flavor: ['', 'neon'], intros: ['curtains', 'doors', 'envelope'],
    fonts: ['retro', 'festive', 'modern'], decor: ['lights', 'sunburst', 'deco', 'mandala', 'stars'],
    particles: [['marigold', 'sparkle'], ['sparkle', 'confetti'], ['confetti', 'heart']], count: 48, fireworks: true, tempo: 0.22
  },
  kitty: {
    scenes: ['holo', 'grid', 'bokeh', 'silk', 'aurora', 'rays', 'mesh', 'grain'],
    nouns: ['Glam', 'Diva', 'Brunch', 'Tambola', 'Gossip', 'Chai Party', 'Sequin', 'Velvet', 'Cocktail', 'Soirée', 'Fiesta', 'Glitter', 'Boss Lady', 'High Tea', 'Queen Bee', 'Sassy', 'Lounge', 'Gala', 'Girls Night', 'Kitty Royale', 'Lipstick', 'Champagne Brunch', 'Pajama Party', 'Teen Patti', 'Housie', 'Ladies Night', 'Sparkle Club', 'Golden Girls', 'Bollywood Kitty'],
    emoji: ['💃', '🪩', '👠', '🍸', '💅'], moods: 'ddl', flavor: ['neon', ''], intros: ['curtains', 'giftbox', 'cardflip'],
    fonts: ['retro', 'modern', 'festive'], decor: ['deco', 'lights', 'stars', 'blobs', 'sunburst'],
    particles: [['sparkle', 'confetti'], ['heart', 'sparkle'], ['confetti']], count: 50, fireworks: true, tempo: 0.2
  },
  bday: {
    scenes: ['grid', 'bokeh', 'holo', 'aurora', 'waves', 'rays', 'mesh', 'glow'],
    nouns: ['Fabulous', 'Cheers', 'Rooftop', 'Milestone', 'Toast', 'Sparkler', 'Hooray', 'Bash', 'Wishes', 'Vibes', 'Glow Up', 'Big Night', 'Fizz', 'Afterparty', 'Disco Ball', 'Dirty Thirty', 'Golden Fifty', 'Sweet Sixteen', 'Birthday Bash', 'Forty & Fab', 'Midnight Cake', 'Neon Night', 'Retro Party', 'Pool Party', 'Balloon Pop', 'Big Fifty', 'Starry Birthday', 'Garden Party'],
    emoji: ['🥳', '🎉', '🍾', '🎂', '✨'], intros: ['giftbox', 'curtains', 'envelope'], moods: 'dl',
    fonts: ['modern', 'retro', 'soft'], decor: ['sunburst', 'lights', 'stars', 'blobs', 'deco'],
    particles: [['balloon', 'confetti', 'sparkle'], ['confetti', 'sparkle'], ['balloon', 'confetti']], count: 42, fireworks: true, tempo: 0.24
  },
  naming: {
    scenes: ['bokeh', 'mesh', 'waves', 'aurora', 'glow', 'silk', 'holo'],
    nouns: ['Little Star', 'Naamkaran', 'Tiny Toes', 'Blessing', 'Moonbeam', 'Cradle', 'Lullaby', 'Angel', 'Twinkle', 'Sunbeam', 'Cherub', 'Snowdrop', 'Butterfly', 'Dewdrop', 'Baby Bloom', 'Wish', 'Cuddle', 'Sweet Pea', 'Rainbow Baby', 'Lil Prince', 'Lil Princess', 'Baby Sunshine', 'Namakaran', 'Bless the Baby', 'Heaven Sent', 'Precious One', 'Little Moon', 'Pearl Baby', 'Twinkle Star'],
    emoji: ['👶', '⭐', '🌙', '🪔', '🦋'], intros: ['scroll', 'cardflip', 'envelope'], moods: 'llld',
    fonts: ['garden', 'soft', 'dreamy'], decor: ['stars', 'florals', 'lace', 'blobs', 'frame'],
    particles: [['petal'], ['sparkle', 'heart'], ['petal', 'sparkle']], count: 40, tempo: 0.32
  },
  birthday: {
    scenes: ['bokeh', 'waves', 'mesh', 'rays', 'glow', 'holo', 'grid'],
    nouns: ['Jungle', 'Superhero', 'Unicorn', 'Dino', 'Rocket', 'Circus', 'Cupcake', 'Lollipop', 'Robot', 'Mermaid', 'Pirate', 'Safari', 'Toy Box', 'Jelly', 'Bubbles', 'Carnival', 'Space', 'Teddy', 'Princess', 'Dragon', 'Fairy', 'Train', 'Football', 'Cricket', 'Panda', 'Ice Cream', 'Magic Show', 'Ocean', 'Castle'],
    emoji: ['🦁', '🦸', '🦄', '🦖', '🚀', '🎪', '🧁', '🍭', '🤖', '🧜‍♀️', '🏴‍☠️', '🦒', '🧸', '🍬', '🫧', '🎠', '🪐', '🐻', '👸', '🐉', '🧚', '🚂', '⚽', '🏏', '🐼', '🍦', '🪄', '🐳', '🏰'], moods: 'llld', flavor: ['playful'], intros: ['giftbox', 'curtains', 'envelope'],
    fonts: ['playful', 'soft'], decor: ['blobs', 'sunburst', 'stars', 'lights'],
    particles: [['balloon', 'confetti', 'confetti'], ['balloon', 'sparkle'], ['confetti', 'heart', 'balloon']], count: 40, tempo: 0.2
  },
  babyshower: {
    scenes: ['mesh', 'bokeh', 'waves', 'aurora', 'silk', 'glow'],
    nouns: ['Godh Bharai', 'Oh Baby', 'Stork', 'Bundle of Joy', 'Little One', 'Cloud Nine', 'Peekaboo', 'Booties', 'Rattle', 'Baby Bump', 'Hush', 'Nest', 'Blossom', 'Cotton', 'Mama Bear', 'Sweetheart', 'Tiny Hands', 'Pitter Patter', 'Sunshine', 'Mommy To Be', 'Stork Delivery', 'Baby Steps', 'Little Treasure', 'Bundle Love', 'Oh Boy', 'Oh Girl', 'Sweet Arrival', 'Hello Baby', 'Lullaby Shower'],
    emoji: ['🍼', '🧸', '👣', '☁️', '🎀'], moods: 'llld', flavor: ['playful', ''], intros: ['giftbox', 'cardflip', 'envelope'],
    fonts: ['soft', 'playful', 'garden'], decor: ['blobs', 'stars', 'florals', 'lace'],
    particles: [['heart', 'sparkle', 'balloon'], ['balloon', 'heart'], ['sparkle', 'petal']], count: 38, tempo: 0.3
  },
  ceremony: {
    scenes: ['rays', 'grain', 'silk', 'bokeh', 'mesh', 'glow', 'aurora'],
    nouns: ['Griha Pravesh', 'Ganesh', 'Diya', 'Havan', 'Aarti', 'Kalash', 'Shubh', 'Mangal', 'Pooja', 'Lakshmi', 'Rangoli', 'Toran Gate', 'Sankalp', 'Om', 'Prasad', 'Deepam', 'Kumkum', 'Tulsi', 'Satyanarayan', 'Navgraha', 'Mahalakshmi', 'Grih Shanti', 'Mundan', 'Janeu', 'Diwali Puja', 'Akhand Path', 'Sundarkand', 'Bhoomi Pujan', 'Kirtan'],
    emoji: ['🪔', '🕉️', '🌼', '🙏', '🏠', '🪷'], intros: ['scroll', 'doors', 'envelope'], moods: 'llld',
    fonts: ['heritage', 'festive', 'regal', 'garden'], decor: ['mandala', 'lace', 'sunburst', 'florals', 'frame'],
    particles: [['marigold', 'petal'], ['marigold'], ['petal', 'leaf'], ['sparkle', 'marigold']], count: 40, tempo: 0.28
  },
  anniversary: {
    scenes: ['aurora', 'holo', 'silk', 'bokeh', 'grain', 'rays', 'mesh', 'glow'],
    nouns: ['Silver Jubilee', 'Golden Years', 'Sacred Vows', 'Forever Us', 'Together', 'Timeless', 'Soulmates', 'Eternity', 'Candlelight', 'Moonlit', 'Memories', 'Devotion', 'Champagne', 'Starry Vows', 'Velvet Night', 'Heirloom', 'Always', 'Ever After', 'Grace', 'Golden Jubilee', 'Ten Years', 'Still Us', 'Love Story', 'Hand in Hand', 'Second Honeymoon', 'Our Journey', 'Vow Renewal', 'Cherished Years', 'Diamond Years'],
    emoji: ['🥂', '💑', '🕯️', '💐', '✨'], intros: ['cardflip', 'doors', 'curtains'], moods: 'ddl', gold: true,
    fonts: ['regal', 'modern', 'dreamy', 'heritage'], decor: ['deco', 'stars', 'frame', 'lights', 'florals'],
    particles: [['sparkle'], ['heart', 'sparkle'], ['petal', 'sparkle']], count: 50, fireworks: true, tempo: 0.28
  }
};

const HUES = [['Ruby', 350], ['Rose', 338], ['Coral', 10], ['Saffron', 26], ['Amber', 38], ['Marigold', 47], ['Lime', 78], ['Jade', 155],
  ['Emerald', 140], ['Teal', 172], ['Aqua', 188], ['Sky', 202], ['Sapphire', 218], ['Cobalt', 230], ['Indigo', 245], ['Violet', 262],
  ['Lavender', 272], ['Orchid', 290], ['Magenta', 315], ['Berry', 328]];

// What tells two designs apart: the style, its layout, and the colours.
const lookOf = t => [t.style, t.variant, t.vars['--bg'], t.vars['--accent']];

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

// ---------- The 10 trending styles ----------
// Every design is one hand-designed style in its own colour. A style fixes the whole art direction (fonts,
// decoration, opening, how the story, functions and countdown look); the design's hue and one of the style's
// layouts make it its own. `deep` darkens a colour until it reads well on the background.
const deep = (h, s, bg, min, l = 44) => { while (contrast(hslHex(h, s, l), bg) < min && l > 4) l -= 2; return hslHex(h, s, l); };
const pal = (vars, colors) => ({ vars, colors });
const STYLES = {
  ivory: {
    label: 'Royal Ivory', emblem: true,
    fonts: { display: "'Cormorant Garamond', serif", script: "'Pinyon Script', cursive", body: "'Jost', sans-serif" },
    look: { nameStyle: 'solid', cardStyle: 'soft', nameFx: 'rise', frame: 'ring', reveal: 'up', events: 'cards', countdown: 'boxes', titles: 'flourish', scene: 'glow' },
    variants: [{ layout: 'classic', decor: 'mandala' }, { layout: 'arch', decor: 'mandala' }, { layout: 'monogram', decor: 'frame' }],
    motifs: ['toran', 'garland', 'bells'], intros: ['envelope', 'cardflip'], venues: ['palace', 'garden', 'temple'], particles: { types: ['petal'], count: 18 },
    palette(h) {
      const bg = hslHex(40, 55, 97), gold = hslHex(38, 62, 44), accent = deep(h, 60, bg, 4.5);
      return pal({ '--bg': bg, '--bg2': hslHex(36, 50, 90), '--ink': deep(h, 55, bg, 9, 22), '--muted': hslHex(h, 22, 36), '--accent': accent, '--accent2': gold,
        '--card': 'rgba(255,253,248,.85)', '--line': hexAlpha(gold, 0.38) }, [accent, gold, hslHex(h, 60, 72), hslHex(40, 80, 66)]);
    }
  },
  palace: {
    label: 'Palace Night', emblem: true,
    fonts: { display: "'Cinzel', serif", script: "'Great Vibes', cursive", body: "'Cormorant Garamond', serif" },
    look: { nameStyle: 'shimmer', cardStyle: 'outline', nameFx: 'blur', frame: 'arch', reveal: 'zoom', events: 'tickets', countdown: 'rings', titles: 'lines', scene: 'bokeh' },
    variants: [{ layout: 'arch', decor: 'deco' }, { layout: 'classic', decor: 'lights' }, { layout: 'split', decor: 'stars' }],
    motifs: ['lanterns', 'bells'], intros: ['doors', 'curtains'], venues: ['palace', 'city'], particles: { types: ['sparkle'], count: 28 },
    palette(h) {
      const gold = hslHex(42, 72, 62), a2 = hslHex(h, 65, 66);
      return pal({ '--bg': hslHex(h, 55, 8), '--bg2': hslHex(h, 55, 17), '--ink': hslHex(42, 55, 93), '--muted': hslHex(40, 30, 76), '--accent': gold, '--accent2': a2,
        '--card': 'rgba(255,255,255,.05)', '--line': hexAlpha(gold, 0.3) }, [gold, '#fff3c4', a2, '#ffffff']);
    }
  },
  bloom: {
    label: 'Bloom', emblem: true,
    fonts: { display: "'Playfair Display', serif", script: "'Parisienne', cursive", body: "'Jost', sans-serif" },
    look: { nameStyle: 'duo', cardStyle: 'pill', nameFx: 'blur', frame: 'arch', reveal: 'up', events: 'cards', countdown: 'rings', titles: 'bar', scene: 'aurora' },
    variants: [{ layout: 'arch', decor: 'florals' }, { layout: 'classic', decor: 'florals' }, { layout: 'split', decor: 'blobs' }],
    motifs: ['garland'], intros: ['cardflip', 'envelope'], venues: ['garden', 'home'], particles: { types: ['petal'], count: 22 },
    palette(h) {
      const bg = hslHex(h, 75, 97), accent = deep(h, 55, bg, 3.6, 50), a2 = hslHex(h + 35, 60, 62);
      return pal({ '--bg': bg, '--bg2': hslHex(h + 25, 70, 91), '--ink': deep(h, 40, bg, 9, 24), '--muted': hslHex(h, 22, 40), '--accent': accent, '--accent2': a2,
        '--card': 'rgba(255,255,255,.78)', '--line': hexAlpha(accent, 0.25) }, [hslHex(h, 70, 80), hslHex(h + 35, 70, 82), '#ffffff', hslHex(h, 60, 70)]);
    }
  },
  minimal: {
    label: 'Modern Minimal', emblem: false,
    fonts: { display: "'DM Serif Display', serif", script: "'Pinyon Script', cursive", body: "'Jost', sans-serif" },
    look: { nameStyle: 'solid', cardStyle: 'sharp', nameFx: 'rise', frame: 'ring', reveal: 'blur', events: 'chapters', countdown: 'minimal', titles: 'lines', scene: 'none' },
    variants: [{ layout: 'editorial', decor: 'frame' }, { layout: 'classic', decor: 'frame' }, { layout: 'split', decor: 'frame' }],
    motifs: ['none'], intros: ['cardflip', 'envelope'], venues: ['city', 'garden'], particles: { types: ['confetti'], count: 6 },
    palette(h) {
      const bg = hslHex(40, 20, 96), accent = deep(h, 45, bg, 5, 38);
      return pal({ '--bg': bg, '--bg2': hslHex(40, 18, 91), '--ink': '#1e1b18', '--muted': hslHex(30, 8, 36), '--accent': accent, '--accent2': hslHex(h, 25, 58),
        '--card': 'rgba(255,255,255,.6)', '--line': 'rgba(30,27,24,.16)' }, [accent, '#1e1b18', hslHex(h, 25, 58)]);
    }
  },
  marigold: {
    label: 'Marigold', emblem: true,
    fonts: { display: "'Marcellus', serif", script: "'Alex Brush', cursive", body: "'Lora', serif" },
    look: { nameStyle: 'solid', cardStyle: 'soft', nameFx: 'rise', frame: 'halo', reveal: 'up', events: 'timeline', countdown: 'boxes', titles: 'flourish', scene: 'glow' },
    variants: [{ layout: 'classic', decor: 'sunburst' }, { layout: 'arch', decor: 'lace' }, { layout: 'ticket', decor: 'lace' }],
    motifs: ['toran', 'diyas'], intros: ['scroll', 'doors'], venues: ['temple', 'home', 'palace'], particles: { types: ['marigold', 'petal'], count: 24 },
    palette(h) {
      const bg = hslHex(46, 95, 95), accent = deep(h, 70, bg, 4.5, 40), a2 = hslHex(28, 95, 52);
      return pal({ '--bg': bg, '--bg2': hslHex(40, 95, 84), '--ink': deep(18, 70, bg, 9, 20), '--muted': hslHex(25, 40, 34), '--accent': accent, '--accent2': a2,
        '--card': 'rgba(255,255,255,.72)', '--line': hexAlpha(a2, 0.35) }, ['#ffb703', '#fb8500', '#ffd60a', accent]);
    }
  },
  mehendi: {
    label: 'Mehendi', emblem: true,
    fonts: { display: "'Marcellus', serif", script: "'Great Vibes', cursive", body: "'Cormorant Garamond', serif" },
    look: { nameStyle: 'shimmer', cardStyle: 'soft', nameFx: 'blur', frame: 'arch', reveal: 'wipe', events: 'zigzag', countdown: 'strip', titles: 'flourish', scene: 'silk' },
    variants: [{ layout: 'arch', decor: 'lace' }, { layout: 'classic', decor: 'florals' }, { layout: 'monogram', decor: 'lace' }],
    motifs: ['bells', 'garland'], intros: ['doors', 'scroll'], venues: ['garden', 'palace'], particles: { types: ['leaf', 'petal'], count: 20 },
    palette(h) {
      // Henna greens from olive to deep teal, following the design's hue, so no two Mehendi designs share a green.
      const g = 100 + Math.round(h / 360 * 84), gold = hslHex(43, 62, 60), a2 = hslHex(h, 60, 64);
      return pal({ '--bg': hslHex(g, 45, 9), '--bg2': hslHex(g, 40, 18), '--ink': hslHex(45, 50, 92), '--muted': hslHex(80, 20, 76), '--accent': gold, '--accent2': a2,
        '--card': 'rgba(255,255,255,.05)', '--line': hexAlpha(gold, 0.3) }, ['#6a994e', '#a7c957', '#f2e8cf', a2]);
    }
  },
  pichwai: {
    label: 'Pichwai Lotus', emblem: true,
    fonts: { display: "'Gilda Display', serif", script: "'Pinyon Script', cursive", body: "'Jost', sans-serif" },
    look: { nameStyle: 'solid', cardStyle: 'outline', nameFx: 'rise', frame: 'halo', reveal: 'zoom', events: 'cards', countdown: 'rings', titles: 'lines', scene: 'glow' },
    variants: [{ layout: 'classic', decor: 'mandala' }, { layout: 'arch', decor: 'stars' }, { layout: 'split', decor: 'mandala' }],
    motifs: ['bells', 'diyas'], intros: ['scroll', 'envelope'], venues: ['temple', 'palace'], particles: { types: ['petal'], count: 18 },
    palette(h) {
      const t = 175 + (h * 3) % 50, pink = hslHex(340 + h % 20, 75, 74), gold = hslHex(43, 70, 60);
      return pal({ '--bg': hslHex(t, 55, 11), '--bg2': hslHex(t, 50, 21), '--ink': hslHex(40, 55, 92), '--muted': hslHex(t, 20, 76), '--accent': pink, '--accent2': gold,
        '--card': 'rgba(255,255,255,.05)', '--line': hexAlpha(gold, 0.3) }, [pink, hslHex(340, 70, 85), gold, '#ffffff']);
    }
  },
  retro: {
    label: 'Filmy Retro', emblem: false,
    fonts: { display: "'Righteous', sans-serif", script: "'Pacifico', cursive", body: "'Poppins', sans-serif" },
    look: { nameStyle: 'solid', cardStyle: 'sharp', nameFx: 'stamp', frame: 'polaroid', reveal: 'slide', events: 'tickets', countdown: 'strip', titles: 'bar', scene: 'rays' },
    variants: [{ layout: 'ticket', decor: 'lights' }, { layout: 'classic', decor: 'lights' }, { layout: 'monogram', decor: 'deco' }],
    motifs: ['bunting', 'lanterns'], intros: ['curtains'], venues: ['city', 'palace'], particles: { types: ['confetti', 'sparkle'], count: 34, fireworks: true },
    palette(h) {
      const y = hslHex(46, 96, 56), a2 = hslHex(h, 85, 58);
      return pal({ '--bg': hslHex(h, 70, 8), '--bg2': hslHex(h, 75, 19), '--ink': hslHex(45, 90, 93), '--muted': hslHex(40, 50, 78), '--accent': y, '--accent2': a2,
        '--card': 'rgba(255,204,0,.06)', '--line': hexAlpha(y, 0.35) }, [y, a2, '#fff1b8', '#ff3c00']);
    }
  },
  neon: {
    label: 'Neon Night', emblem: false, flavor: 'neon',
    fonts: { display: "'Unbounded', sans-serif", script: "'Yellowtail', cursive", body: "'Poppins', sans-serif" },
    look: { nameStyle: 'glow', cardStyle: 'outline', nameFx: 'flip', frame: 'halo', reveal: 'zoom', events: 'cards', countdown: 'rings', titles: 'bar', scene: 'grid' },
    variants: [{ layout: 'classic', decor: 'blobs' }, { layout: 'monogram', decor: 'stars' }, { layout: 'orbit', decor: 'lights' }],
    motifs: ['lanterns', 'bunting'], intros: ['curtains', 'giftbox'], venues: ['city'], particles: { types: ['sparkle', 'confetti'], count: 32, fireworks: true },
    palette(h) {
      const a = hslHex(h, 95, 64), a2 = hslHex(h + 150, 95, 58);
      return pal({ '--bg': hslHex(h, 65, 6), '--bg2': hslHex(h, 60, 15), '--ink': hslHex(h, 40, 95), '--muted': hslHex(h, 40, 82), '--accent': a, '--accent2': a2,
        '--card': hexAlpha(a2, 0.06), '--line': hexAlpha(a, 0.4) }, [a, a2, '#ffffff', hslHex(h + 60, 95, 70)]);
    }
  },
  toybox: {
    label: 'Toybox', emblem: false, flavor: 'playful',
    fonts: { display: "'Fredoka', sans-serif", script: "'Pacifico', cursive", body: "'Fredoka', sans-serif" },
    look: { nameStyle: 'duo', cardStyle: 'pill', nameFx: 'swing', frame: 'blob', reveal: 'zoom', events: 'cards', countdown: 'boxes', titles: 'bar', scene: 'waves' },
    variants: [{ layout: 'classic', decor: 'blobs' }, { layout: 'ticket', decor: 'stars' }, { layout: 'arch', decor: 'blobs' }],
    motifs: ['bunting', 'garland'], intros: ['giftbox'], venues: ['garden', 'home'], particles: { types: ['balloon', 'confetti'], count: 26 },
    palette(h) {
      const bg = hslHex(h, 90, 96), accent = deep(h, 80, bg, 3.4, 50), a2 = hslHex(h + 150, 70, 45);
      return pal({ '--bg': bg, '--bg2': hslHex(h + 60, 85, 91), '--ink': deep(240, 45, bg, 9, 26), '--muted': hslHex(240, 20, 42), '--accent': accent, '--accent2': a2,
        '--card': 'rgba(255,255,255,.8)', '--line': hexAlpha(accent, 0.22) }, [hslHex(h, 85, 62), hslHex(h + 150, 75, 55), '#ffd23f', '#5e60ce', '#ff8c42']);
    }
  }
};
// Which styles suit each occasion (cycled, so neighbouring designs of an occasion are different styles).
const OCCASION_STYLES = {
  wedding: ['ivory', 'palace', 'mehendi', 'pichwai', 'bloom', 'minimal', 'marigold'],
  engagement: ['bloom', 'ivory', 'minimal', 'palace'],
  sangeet: ['retro', 'palace', 'neon', 'mehendi'],
  kitty: ['neon', 'retro', 'bloom', 'minimal'],
  bday: ['neon', 'minimal', 'retro', 'bloom'],
  naming: ['ivory', 'bloom', 'pichwai', 'toybox'],
  birthday: ['toybox', 'bloom', 'retro'],
  babyshower: ['bloom', 'toybox', 'ivory', 'pichwai'],
  ceremony: ['marigold', 'pichwai', 'ivory', 'mehendi', 'palace'],
  anniversary: ['palace', 'ivory', 'minimal', 'pichwai']
};

function generated(occasion, j, c) {
  const r = RECIPES[occasion];
  const [hueName, h] = HUES[(j * 7 + c * 3) % HUES.length];
  const pick = (list, n = j) => list[n % list.length];
  const dark = pick(r.moods) === 'd';
  const p = palette(h, dark, r.gold, j);
  const types = pick(r.particles, j + c);
  return {
    name: `${hueName} ${r.nouns[j]}`, emoji: pick(r.emoji), occasion, hue: h,
    decor: pick(r.decor, j + (j >> 2)), layout: LAYOUTS[(j + 2 * c) % LAYOUTS.length],
    nameStyle: NAME_STYLES[(j * 3 + c) % NAME_STYLES.length], cardStyle: CARD_STYLES[(j + (j >> 2) + c) % CARD_STYLES.length], intro: pick(r.intros, j + (j >> 1)),
    // Neon lettering is white light: it only works on a dark background.
    flavor: r.flavor && !(pick(r.flavor) === 'neon' && !dark) ? pick(r.flavor) : '',
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
  // First #001–#200 (20 per occasion), then #201–#300 (30 per occasion). Numbers never move: links store them.
  for (const perOccasion of [20, 30]) {
    const need = Object.fromEntries(occasions.map(o => [o, perOccasion - CLASSICS.filter(t => t.occasion === o).length]));
    for (let j = 0; list.length < perOccasion * occasions.length; j++) {
      occasions.forEach((o, c) => { if (made[o] < need[o] && made[o] <= j) list.push(generated(o, made[o]++, c)); });
    }
  }
  // Each design takes its style (the classics keep their hand-picked one; the rest cycle through the styles that
  // suit the occasion), its colours from its own hue, and one of the style's layouts. No two designs of an occasion
  // share style, layout and hue.
  const count = {}, last = {}, used = {};
  list.forEach(t => {
    const k = count[t.occasion] = (count[t.occasion] ?? -1) + 1, pool = OCCASION_STYLES[t.occasion];
    let style = t.style || pool[k % pool.length];
    // An occasion never shows the same style twice in a row (a classic may have taken this turn's style).
    if (!t.style && style === last[t.occasion]) style = pool[(k + 1) % pool.length];
    last[t.occasion] = style;
    const st = STYLES[style], u = used[t.occasion] = used[t.occasion] || {};
    // The style's least-used layout in this occasion, so its designs spread over all of them.
    const v = st.variants.map((_, i) => i).sort((a, b) => (u[`${style}|${a}`] || 0) - (u[`${style}|${b}`] || 0) || a - b)[0];
    u[`${style}|${v}`] = (u[`${style}|${v}`] || 0) + 1;
    const p = st.palette(t.hue);
    Object.assign(t, { style, variant: v, ...st.look, ...st.variants[v], flavor: st.flavor || '', vars: p.vars, fonts: st.fonts, emblem: st.emblem,
      particles: { ...st.particles, colors: p.colors, fireworks: !!st.particles.fireworks },
      motif: st.motifs[k % st.motifs.length], venueArt: st.venues[k % st.venues.length],
      intro: t.key ? t.intro : st.intros[k % st.intros.length] }); // the classics keep their opening
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

// Sample text for the premium sections, per occasion. Website demos and the panel's "Sample text" use it;
// a new invite never starts with it, so nobody's card shows an invented love story by accident.
const EXTRAS = {
  wedding: {
    story: [
      { when: 'March 2023', title: 'First Meeting', text: 'A cousin’s Diwali party in Jaipur. One shared plate of jalebi, and neither of them left early.' },
      { when: 'August 2023', title: 'First Date', text: 'Rain on Marine Drive, two cutting chais, and a conversation that ran past midnight.' },
      { when: 'January 2026', title: 'The Proposal', text: 'Sunrise at Nahargarh Fort, with a ring hidden in a box of kaju katli.' }
    ],
    families: [
      { side: 'Bride’s Family', parents: 'Mr. Rajeev & Mrs. Anjali Mehta', more: 'With Ishaan & Sanya' },
      { side: 'Groom’s Family', parents: 'Mr. Vikram & Mrs. Meera Sharma', more: 'With Rohan & Priya' }
    ],
    attire: [
      { name: 'Haldi', text: 'Sunshine yellow and marigold', colors: '#f4c430,#ffb347,#fff1c1' },
      { name: 'Sangeet', text: 'Jewel tones and shimmer', colors: '#1f6f6b,#7a1f5c,#c9a050' },
      { name: 'Wedding', text: 'Royal maroon, gold and ivory', colors: '#6b0f24,#c9a050,#fbf6ec' }
    ],
    venueNote: 'Boats to the palace leave the jetty every 15 minutes from 6:30 pm.',
    upi: 'diya.aarav@okhdfc', giftNote: 'Your presence is the greatest gift. If you wish to bless us further, you can send it here.',
    hashtag: '#DiyaKaAarav', thanks: 'For your love, your blessings, and for being part of our forever.'
  },
  engagement: {
    story: [
      { when: 'June 2024', title: 'Hello', text: 'A wrong table at a friend’s birthday dinner. They stayed for dessert.' },
      { when: 'September 2026', title: 'The Question', text: 'A picnic at Lodhi Garden, a nervous speech, and a very happy yes.' }
    ],
    families: [
      { side: 'Her Family', parents: 'Mr. Sanjay & Mrs. Ritu Kapoor', more: 'With Aditi' },
      { side: 'His Family', parents: 'Mr. Anil & Mrs. Kavita Malhotra', more: 'With Kunal' }
    ],
    attire: [{ name: 'Ring Ceremony', text: 'Pastels and pearls', colors: '#f7c6d0,#c9e4de,#fff4e0' }],
    hashtag: '#AnanyaSaidYes', thanks: 'Thank you for celebrating the start of our forever with us.'
  },
  sangeet: {
    story: [{ when: 'Every family function', title: 'The Dance Floor', text: 'Our families have been dancing at each other’s weddings for years. Now it is our turn.' }],
    attire: [{ name: 'Sangeet', text: 'Bollywood glam, sequins welcome', colors: '#ff2a6d,#ffcc00,#7a1f5c' }],
    hashtag: '#ShaadiKaSangeet', thanks: 'Bring your best moves. We will bring the dhol.'
  },
  kitty: {
    story: [{ when: 'Since 2019', title: 'Glam Girls', text: 'Twelve friends, one WhatsApp group, and a party every month without fail.' }],
    attire: [{ name: 'Disco Night', text: 'Sequins, metallics and big hair', colors: '#ff4fd8,#ffd400,#7df9ff' }],
    hashtag: '#GlamGirlsKitty', thanks: 'Come for the tambola, stay for the gossip.'
  },
  bday: {
    story: [
      { when: '1996', title: 'Hello World', text: 'Arrived three weeks early and has been in a hurry ever since.' },
      { when: '2026', title: 'Thirty & Fabulous', text: 'Thirty years of stories. Tonight we add one more.' }
    ],
    attire: [{ name: 'The Party', text: 'Glam evening wear, a touch of gold', colors: '#ffb86b,#ff6b9d,#1b1b2f' }],
    hashtag: '#NehaTurns30', thanks: 'Thank you for making every year better.'
  },
  naming: {
    story: [
      { when: 'November 2026', title: 'Our Little Star', text: 'She arrived on a starry Sunday morning and changed everything.' },
      { when: 'January 2027', title: 'Her Name', text: 'Chosen with love by both grandmothers, after a lot of friendly debate.' }
    ],
    families: [{ side: 'Grandparents', parents: 'Mr. & Mrs. Sharma · Mr. & Mrs. Iyer', more: 'With all our love' }],
    hashtag: '#WelcomeLittleSharma', thanks: 'Your blessings mean the world to our little one.'
  },
  birthday: {
    story: [
      { when: 'Age 1', title: 'First Steps', text: 'Straight towards the cake, of course.' },
      { when: 'Age 5', title: 'Big Boy Now', text: 'Loves dinosaurs, magic tricks and very loud songs.' }
    ],
    attire: [{ name: 'Party Theme', text: 'Superheroes and capes', colors: '#e63946,#1d3557,#ffd23f' }],
    hashtag: '#KabirTurns5', thanks: 'Thank you for coming to Kabir’s big day!'
  },
  babyshower: {
    story: [{ when: 'Spring 2027', title: 'Coming Soon', text: 'A tiny new member of the family is on the way, and we cannot wait.' }],
    families: [{ side: 'With Love', parents: 'The Sharma & Iyer families', more: 'Grandparents-to-be' }],
    attire: [{ name: 'Godh Bharai', text: 'Soft pastels', colors: '#f9b9d2,#a9c6ff,#fff1a8' }],
    hashtag: '#BabySharmaOnTheWay', thanks: 'Your blessings mean the world to us and our little one.'
  },
  ceremony: {
    story: [{ when: '2026', title: 'Our New Home', text: 'Years of saving and dreaming. Now a home, ready for your blessings.' }],
    families: [{ side: 'With Blessings', parents: 'Shri Ramesh & Smt. Sunita Sharma', more: 'With Amit, Pooja & family' }],
    attire: [{ name: 'Puja', text: 'Traditional, in bright festive colours', colors: '#d97706,#e11d48,#fff7d6' }],
    hashtag: '#SharmaGrihaPravesh', thanks: 'Thank you for blessing our new beginning.'
  },
  anniversary: {
    story: [
      { when: '2001', title: 'The Wedding', text: 'A December wedding in Lucknow, and a promise made for life.' },
      { when: '2026', title: 'Twenty-Five Years', text: 'Two children, four cities and countless chai-time conversations later.' }
    ],
    families: [{ side: 'Hosted by', parents: 'Aryan & Kavya', more: 'Their proud children' }],
    attire: [{ name: 'The Evening', text: 'Silver and black', colors: '#c0c0c0,#1b1b1b,#e0c27a' }],
    hashtag: '#MeeraRaj25', thanks: 'Thank you for being part of our story.'
  }
};
