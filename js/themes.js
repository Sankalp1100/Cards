// Shared by the editor (index.html) and the card viewer (card.html).

const THEMES = {
  royal: {
    name: 'Royal Maharaja', emoji: '👑', mandala: true,
    vars: { '--bg': '#2b0a14', '--bg2': '#5c0f24', '--ink': '#fbeedd', '--muted': '#e8cfa9', '--accent': '#e9b949', '--accent2': '#ff8f3f', '--card': 'rgba(255,255,255,.06)', '--line': 'rgba(233,185,73,.25)' },
    fonts: { display: "'Cinzel Decorative', serif", script: "'Great Vibes', cursive", body: "'Cormorant Garamond', serif" },
    particles: { types: ['marigold', 'petal'], colors: ['#ff9f1c', '#ffbf3f', '#e63946', '#ffd166'], count: 38 },
    tempo: 0.3
  },
  floral: {
    name: 'Blush Garden', emoji: '🌸', mandala: true,
    vars: { '--bg': '#fff6f4', '--bg2': '#ffe0e7', '--ink': '#5a2a3a', '--muted': '#8a5a6a', '--accent': '#c9577a', '--accent2': '#e8a87c', '--card': 'rgba(255,255,255,.65)', '--line': 'rgba(201,87,122,.22)' },
    fonts: { display: "'Playfair Display', serif", script: "'Parisienne', cursive", body: "'Cormorant Garamond', serif" },
    particles: { types: ['petal'], colors: ['#f7a8b8', '#f4c2c2', '#ffd6e0', '#ffffff', '#e8879c'], count: 45 },
    tempo: 0.32
  },
  midnight: {
    name: 'Midnight Glam', emoji: '✨', mandala: true,
    vars: { '--bg': '#07071a', '--bg2': '#1d1446', '--ink': '#f3eefe', '--muted': '#b9b0d9', '--accent': '#e0c27a', '--accent2': '#c9a7ff', '--card': 'rgba(255,255,255,.06)', '--line': 'rgba(224,194,122,.25)' },
    fonts: { display: "'Cinzel Decorative', serif", script: "'Great Vibes', cursive", body: "'Cormorant Garamond', serif" },
    particles: { types: ['sparkle'], colors: ['#ffffff', '#e0c3fc', '#ffd700'], count: 90, fireworks: true },
    tempo: 0.28
  },
  haldi: {
    name: 'Haldi Sunshine', emoji: '🌼', mandala: true,
    vars: { '--bg': '#fff7d6', '--bg2': '#ffe08a', '--ink': '#5b3200', '--muted': '#8a5a10', '--accent': '#d97706', '--accent2': '#e11d48', '--card': 'rgba(255,255,255,.55)', '--line': 'rgba(217,119,6,.25)' },
    fonts: { display: "'Playfair Display', serif", script: "'Great Vibes', cursive", body: "'Cormorant Garamond', serif" },
    particles: { types: ['marigold', 'petal'], colors: ['#ffb703', '#fb8500', '#ffd60a', '#ff7b00'], count: 40 },
    tempo: 0.26
  },
  mehendi: {
    name: 'Mehendi Green', emoji: '🌿', mandala: true,
    vars: { '--bg': '#10261a', '--bg2': '#24513a', '--ink': '#f2efdc', '--muted': '#c9d6b4', '--accent': '#d4b46a', '--accent2': '#a7c957', '--card': 'rgba(255,255,255,.06)', '--line': 'rgba(212,180,106,.25)' },
    fonts: { display: "'Cinzel Decorative', serif", script: "'Parisienne', cursive", body: "'Cormorant Garamond', serif" },
    particles: { types: ['leaf', 'petal'], colors: ['#6a994e', '#a7c957', '#f2e8cf', '#bc4749'], count: 36 },
    tempo: 0.3
  },
  neon: {
    name: 'Neon Love (Y2K)', emoji: '💖', mandala: false,
    vars: { '--bg': '#0d0221', '--bg2': '#2a0a4a', '--ink': '#ffffff', '--muted': '#d1f7ff', '--accent': '#ff2a6d', '--accent2': '#05d9e8', '--card': 'rgba(5,217,232,.07)', '--line': 'rgba(255,42,109,.4)' },
    fonts: { display: "'Righteous', sans-serif", script: "'Pacifico', cursive", body: "'Poppins', sans-serif" },
    particles: { types: ['heart', 'sparkle'], colors: ['#ff2a6d', '#05d9e8', '#d1f7ff', '#f9c80e'], count: 45, fireworks: true },
    tempo: 0.22
  },
  kids: {
    name: 'Candy Party', emoji: '🎈', mandala: false,
    vars: { '--bg': '#eaf8ff', '--bg2': '#ffe3f1', '--ink': '#2b2d6e', '--muted': '#5a5c9e', '--accent': '#ff4f9a', '--accent2': '#3bceac', '--card': 'rgba(255,255,255,.75)', '--line': 'rgba(94,96,206,.2)' },
    fonts: { display: "'Fredoka', sans-serif", script: "'Pacifico', cursive", body: "'Fredoka', sans-serif" },
    particles: { types: ['balloon', 'confetti', 'confetti'], colors: ['#ff5fa2', '#ffd23f', '#3bceac', '#5e60ce', '#ff8c42'], count: 40 },
    tempo: 0.2
  },
  baby: {
    name: 'Baby Cloud', emoji: '🍼', mandala: false,
    vars: { '--bg': '#f2f7ff', '--bg2': '#fde8f1', '--ink': '#38456b', '--muted': '#6b7699', '--accent': '#7b9fe0', '--accent2': '#f29bbf', '--card': 'rgba(255,255,255,.7)', '--line': 'rgba(123,159,224,.25)' },
    fonts: { display: "'Fredoka', sans-serif", script: "'Parisienne', cursive", body: "'Poppins', sans-serif" },
    particles: { types: ['heart', 'sparkle', 'balloon'], colors: ['#a9c6ff', '#f9b9d2', '#fff1a8', '#c7f0db'], count: 38 },
    tempo: 0.3
  },
  disco: {
    name: 'Disco Kitty', emoji: '🪩', mandala: false,
    vars: { '--bg': '#16041f', '--bg2': '#5b0e5e', '--ink': '#fff4fd', '--muted': '#f3c4ec', '--accent': '#ff4fd8', '--accent2': '#ffd400', '--card': 'rgba(255,79,216,.08)', '--line': 'rgba(255,79,216,.4)' },
    fonts: { display: "'Righteous', sans-serif", script: "'Pacifico', cursive", body: "'Poppins', sans-serif" },
    particles: { types: ['sparkle', 'confetti'], colors: ['#ff4fd8', '#ffd400', '#7df9ff', '#ffffff'], count: 60, fireworks: true },
    tempo: 0.2
  },
  bollywood: {
    name: 'Filmy Bollywood', emoji: '🎬', mandala: true,
    vars: { '--bg': '#140500', '--bg2': '#7a1a00', '--ink': '#fff3dc', '--muted': '#ffd59a', '--accent': '#ffcc00', '--accent2': '#ff3c00', '--card': 'rgba(255,204,0,.07)', '--line': 'rgba(255,204,0,.35)' },
    fonts: { display: "'Righteous', sans-serif", script: "'Great Vibes', cursive", body: "'Poppins', sans-serif" },
    particles: { types: ['marigold', 'sparkle'], colors: ['#ffcc00', '#ff7a00', '#ff3c00', '#fff1b8'], count: 45, fireworks: true },
    tempo: 0.22
  },
  sunset: {
    name: 'Golden Hour', emoji: '🌅', mandala: false,
    vars: { '--bg': '#2a1636', '--bg2': '#a33a4f', '--ink': '#fff1e6', '--muted': '#ffcfb3', '--accent': '#ffb86b', '--accent2': '#ff6b9d', '--card': 'rgba(255,255,255,.07)', '--line': 'rgba(255,184,107,.35)' },
    fonts: { display: "'Playfair Display', serif", script: "'Great Vibes', cursive", body: "'Poppins', sans-serif" },
    particles: { types: ['balloon', 'confetti', 'sparkle'], colors: ['#ffb86b', '#ff6b9d', '#ffe29a', '#c38dff'], count: 42 },
    tempo: 0.24
  },
  lavender: {
    name: 'Lavender Dream', emoji: '🪻', mandala: true,
    vars: { '--bg': '#f8f3ff', '--bg2': '#e4d6ff', '--ink': '#3b2a5a', '--muted': '#6e5a94', '--accent': '#8e6cd6', '--accent2': '#e88fbd', '--card': 'rgba(255,255,255,.65)', '--line': 'rgba(142,108,214,.25)' },
    fonts: { display: "'Playfair Display', serif", script: "'Parisienne', cursive", body: "'Cormorant Garamond', serif" },
    particles: { types: ['petal'], colors: ['#b79ced', '#d9c7ff', '#f4b6d2', '#ffffff'], count: 42 },
    tempo: 0.32
  }
};

const PRESETS = {
  wedding: {
    label: 'Wedding', icon: '💍', labels: ['Bride / Partner 1', 'Groom / Partner 2'],
    card: {
      type: 'wedding', theme: 'royal', title: 'Together with their families',
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
      type: 'engagement', theme: 'floral', title: 'Save the date',
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
      type: 'sangeet', theme: 'bollywood', title: 'Lights. Camera. Shaadi!',
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
      type: 'kitty', theme: 'disco', title: "Ladies, it's party time!",
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
      type: 'bday', theme: 'sunset', title: "Let's celebrate",
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
      type: 'naming', theme: 'lavender', title: 'A little star has arrived',
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
      type: 'birthday', theme: 'kids', title: "You're invited to a party!",
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
      type: 'babyshower', theme: 'baby', title: 'Oh baby!',
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
      type: 'ceremony', theme: 'haldi', title: 'With the blessings of the Almighty',
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
      type: 'anniversary', theme: 'midnight', title: '25 years of love',
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
