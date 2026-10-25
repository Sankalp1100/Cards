# 💌 Wedding Card

Animated invitations for weddings, sangeet, engagements, kitty parties, birthdays, kids' parties, baby showers, naming ceremonies, pujas and anniversaries.

Customers browse **200 numbered designs** on the website and order one on WhatsApp by its number (e.g. *#047*). You type that number in the **admin panel**, fill in their details and get the links. Each guest opens their link and gets the whole show: an envelope with a wax seal that opens, a confetti blast, music, petals, balloons and fireworks, the couple's or child's photo, a live countdown, the function timeline, directions, Save the Date and RSVP on WhatsApp.

There's no database. Every invitation is packed inside its own link, so you can make unlimited links.

## Pages

| Page | Who uses it |
|---|---|
| `index.html` | Sales website: 200 designs with their numbers, search by number, occasion and 🔥 Trending filters, live demos, Order on WhatsApp |
| `card.html` | The animated invitation your guests open (opened from the website it shows *"Sample of design #047 · Order"*) |
| `admin.html` | **Admin panel**, only on your PC: create invites, links, catalog, settings, publish |

Customers can't make cards themselves: the website only shows designs and order buttons.

## Start the admin panel

```
npm run admin
```

It opens `http://localhost:5050/admin.html` in your browser. Keep that window open while you work.

1. **Design number.** Type the number the customer sent (e.g. `47`). The design is selected and its occasion's sample text is loaded. Or browse **Designs** and tap one.
2. **Occasion.** Change it if needed (10 types).
3. **Customer details.** Names, date, venue, message, functions (tap a suggestion like *+ 🌼 Haldi*), photo upload, RSVP number, music. *Clear all* empties the form; the sample text stays as grey hints. The phone on the right shows the real card live.
4. **Get links.** Leave guest names empty for one link, or one name per line for a personal link each (*"Dear Rahul Uncle,"*). Copy, WhatsApp or Copy all.
5. **My links.** Search, copy, open, **Edit** (loads it back into the editor), delete, **Download CSV**.

### Catalog and settings (what the website shows)

- **Catalog:** for each of the 200 designs: name, occasion, price, **On site** (show/hide), **🔥 Trending** (shown first with a badge). Search by number, filter, show/hide many at once.
- **Settings:** live website address, brand, WhatsApp number for orders, Instagram, price for every design, currency.
- Changes are kept as a draft in the panel until you press **🚀 Publish**. Publish writes `js/config.js` into this folder, then commits and pushes **only that file** to GitHub, and Vercel updates the live site in about a minute. *Undo changes* drops the draft.
- Opened without `npm run admin` (double-clicking `admin.html`), Publish downloads `config.js` instead: put it in the `js` folder and deploy.

**First time:** set the **Live website address** in Settings (your Vercel domain, e.g. `https://your-site.vercel.app/`) and Publish. Every link you make uses that address, so it opens on any phone.

## Notes

- **Design numbers never change**: links store the number. Old links that used a design name (`royal`, `neon`, …) still open the same design.
- **Photos:** uploads are cropped and shrunk to about 2–10 KB so they fit inside the link. You can also paste a public image URL instead.
- **The admin panel is not published:** `admin.html`, `js/admin.js`, `css/admin.css` and `server.mjs` are in `.vercelignore`. The panel server only listens on your own PC.
- **Link history** is stored in your browser. Use Download CSV for a backup.
- **Adding an occasion:** add it to `PRESETS` and a recipe to `RECIPES` in `js/themes.js`.

## Files

```
index.html / admin.html / card.html
server.mjs      admin panel server: serves the folder, saves + publishes config.js
css/style.css   site + shared styles     css/admin.css  admin panel
css/card.css    invitation animations
js/config.js    site settings + catalog (written by Publish)
js/themes.js    200 numbered designs + 10 occasion presets
js/catalog.js   designs merged with the catalog settings, posters, search (unit tested)
js/codec.js     invite data <-> link
js/core.js      shared pure helpers (unit tested)
js/particles.js petals, marigolds, balloons, hearts, sparkles, confetti, fireworks (cached sprites)
js/music.js     synthesized background music (no audio files)
js/card.js      invitation viewer
js/admin.js     admin panel
js/site.js      sales website
```

## Tests

```
npm test            # everything (about 9 minutes: every one of the 200 designs is opened in a browser)
npm run test:unit   # logic only, under 1 second, no browser needed
npm run test:e2e    # drives the real pages in headless Chrome/Edge
```

No packages to install: it uses Node's built-in test runner (Node 20+). The browser tests find Chrome or Edge automatically (set `CHROME_PATH` to override) and are skipped if neither is installed.

- `tests/unit.test.js`: link encoding, URL safety, escaping, dates; all 200 designs complete, unique, readable (contrast) and stable; catalog settings, search, prices, config file; the server's config check.
- `tests/e2e.test.mjs`: the sales site (numbers, search, filters, show more, order buttons), the envelope, countdown, personal links, RSVP, all 200 designs, old links, injection attempts, broken links, smoothness, the full admin flow (design number, editor, photo, links, history, catalog, settings, undo), the panel server's safety checks, and phone widths.
