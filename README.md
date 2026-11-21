# 💌 CardAlbum

Animated invitations for weddings, sangeet, engagements, kitty parties, birthdays, kids' parties, baby showers, naming ceremonies, pujas and anniversaries, shared as a single link.

**Live site:** https://cardalbum.vercel.app

Customers browse **600 numbered designs** (30 for each of the 20 occasions) and order one on WhatsApp by its number (e.g. *#047*). Each guest opens their link and gets the whole show: an envelope with a wax seal that opens, a confetti blast, music, petals, balloons and fireworks, the couple's or child's photo, a live countdown, the function timeline, directions, Save the Date and RSVP on WhatsApp.

## Screenshots

<!-- Add a clean screenshot at docs/screenshot.png and replace this comment with:
![CardAlbum designs](docs/screenshot.png) -->

See the designs live at https://cardalbum.vercel.app.

## Features

- **600 designs, 20 occasions**, each with its own number that never changes.
- **10 hand-designed styles**: Royal Ivory, Palace Night, Bloom, Modern Minimal, Marigold, Mehendi, Pichwai Lotus, Filmy Retro, Neon Night and Toybox.
- **6 opening animations**: envelope, palace doors, curtain raise, royal scroll, gift box, folding card.
- **Premium invitation page**: story, celebrations, venue illustration, families, gallery, dress code, gifts (UPI), RSVP form and a thank-you finale.
- **Personal links**: one link per guest (*"Dear Rahul Uncle,"*).
- **Trending designs** that change every day by themselves.
- **Video export**: films the real card as a 9:16 MP4 for WhatsApp status or Instagram.
- **Synthesized music** and particle effects, no audio files.
- **Mobile first**: bottom tab bar on phones.
- Designed with ♥ by Sankalp.

The admin panel is password protected.

## Pages

| Page | What it is |
|---|---|
| `index.html` | Sales website: all designs, occasion picker, search by number, trending, live demos, order on WhatsApp |
| `card.html` | The animated invitation guests open |

## Tech stack

- Plain HTML, CSS and JavaScript (no framework, no build step)
- Supabase (database and login)
- Vercel (hosting)
- Node.js built-in test runner, headless Chrome/Edge for browser tests

## Run the tests

```
npm test            # everything (about 9 minutes: every one of the 600 designs is opened in a browser)
npm run test:unit   # logic only, under 1 second, no browser needed
npm run test:e2e    # drives the real pages in headless Chrome/Edge
```

No packages to install: Node 20+ is enough. The browser tests find Chrome or Edge automatically (set `CHROME_PATH` to override) and are skipped if neither is installed.
