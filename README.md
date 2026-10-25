# 💌 Wedding Card

Animated invitations for weddings, sangeet, engagements, kitty parties, birthdays, kids' parties, baby showers, naming ceremonies, pujas and anniversaries.

You fill in the details once in the **admin panel**, pick a template and generate links. Each guest opens their link and gets the whole show automatically: an envelope with a wax seal that opens, a confetti blast, music, petals, balloons and fireworks, the couple's or child's photo, a live countdown, the function timeline, directions, Save the Date and RSVP on WhatsApp.

There's no backend and no database. Every invitation is packed inside its own link, so you can make unlimited links.

## Pages

| Page | Who uses it |
|---|---|
| `index.html` | Landing website with a live showcase of all templates |
| `admin.html` | **Admin panel** (for you): create invites, upload a photo, pick a template, generate links, link history |
| `card.html` | The animated invitation your guests open |

## Admin panel workflow

1. **Choose occasion.** There are 10 types: Wedding, Engagement, Sangeet, Kitty Party, Birthday, Naming Ceremony, Kids Birthday, Baby Shower, Ceremony/Puja, Anniversary. Each one fills in sample text you can edit.
2. **Fill in the details.** Names, date, venue, message, functions (haldi, mehendi, …) with dress codes, a photo upload, RSVP WhatsApp number and music on/off.
3. **Pick a template.** 12 animated templates are shown live with *your* details.
4. **Generate links.**
   - Leave guest names empty to get one common link for everyone.
   - Or type guest names, one per line, to get a personal link each (*"Dear Rahul Uncle,"* on the envelope).
   - Copy, send on WhatsApp, or Copy all.
5. **My links.** Every link you generate is saved: search, copy, open, **Edit** (loads the invite back into the editor), delete, or **Download CSV**.

## Put it online (needed so links work on guests' phones)

Links made from a file on your PC (`file:///...`) only work on that PC. Host the folder for free, then open the admin panel **from the online URL**:

- **Netlify Drop (easiest):** go to https://app.netlify.com/drop and drag the `wedding-card` folder in. You get `https://your-name.netlify.app`, and the admin panel is at `https://your-name.netlify.app/admin.html`.
- **GitHub Pages / Vercel / any static host** works too.
- **Local test:** `npx serve .` inside this folder.

## Notes

- **Photos:** uploads are cropped and shrunk to about 2–10 KB so they fit inside the link. You can also paste a public image URL instead.
- **The admin panel has no password.** Anyone who finds `admin.html` can make cards, but they can't see or change yours (your link history lives only in your browser). If you need a real login, it needs a backend (Firebase or Supabase).
- **Link history** is stored in your browser. Use Download CSV for a backup.
- **Adding a template:** add an entry to `THEMES` in `js/themes.js`. **Adding an occasion:** add it to `PRESETS`. Both show up automatically.

## Files

```
index.html / admin.html / card.html
css/style.css   site + shared styles     css/admin.css  admin panel
css/card.css    invitation animations
js/themes.js    12 templates + 10 occasion presets
js/codec.js     invite data <-> link
js/core.js      shared pure helpers (unit tested)
js/particles.js petals, marigolds, balloons, hearts, sparkles, confetti, fireworks
js/music.js     synthesized background music (no audio files)
js/card.js      invitation viewer
js/admin.js     admin panel
js/site.js      landing page
```

## Tests

```
npm test            # everything (about 1 minute)
npm run test:unit   # logic only, under 1 second, no browser needed
npm run test:e2e    # drives the real pages in headless Chrome/Edge
```

No packages to install: it uses Node's built-in test runner (Node 20+). The browser tests find Chrome or Edge automatically (set `CHROME_PATH` to override) and are skipped if neither is installed.

- `tests/unit.test.js`: link encoding, URL safety, escaping, dates, and checks that every template and occasion is complete.
- `tests/e2e.test.mjs`: the envelope opens, the countdown, personal links, RSVP, all 12 templates, injection attempts, broken links, and the full admin flow (photo upload, link generation, history, edit, delete).
