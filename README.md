# 💌 CardAlbum

Animated invitations for weddings, sangeet, engagements, kitty parties, birthdays, kids' parties, baby showers, naming ceremonies, pujas and anniversaries.

Customers browse **300 numbered designs** (30 for each of the 10 occasions) on the website and order one on WhatsApp by its number (e.g. *#047*). You type that number in the **admin panel**, fill in their details and get the links. Each guest opens their link and gets the whole show: an envelope with a wax seal that opens, a confetti blast, music, petals, balloons and fireworks, the couple's or child's photo, a live countdown, the function timeline, directions, Save the Date and RSVP on WhatsApp.

There's no database. Every invitation is packed inside its own link, so you can make unlimited links.

## Pages

| Page | Who uses it |
|---|---|
| `index.html` | Sales website: 300 designs with their numbers, a "What are you celebrating?" picker, search by number, occasion and 🔥 Trending filters, live demos, Order on WhatsApp |
| `card.html` | The animated invitation your guests open (opened from the website it shows *"Sample of design #047 · Order"*) |
| `admin.html` | **Admin panel**: on your PC (`Start Admin.cmd`) or online at `/admin.html` behind a password: create invites, links, videos, catalog, settings, publish |

Customers can't make cards themselves: the website only shows designs and order buttons.

## Open the admin panel

**Online (phone or any computer):** https://cardalbum.vercel.app/admin.html. The browser asks for a login (user name `card.com`). To change the login, add `ADMIN_USER` and `ADMIN_PASSWORD` in Vercel → Settings → Environment Variables and redeploy; this also keeps them out of the public code.

To **Publish** from the online panel, Vercel needs a GitHub token once: on GitHub create a *fine-grained token* for the `Cards` repo with **Contents: Read and write**, then add it in Vercel as `GITHUB_TOKEN` and redeploy. Without it, Publish online downloads `config.js` instead.

**On your PC:**

```
npm run admin
```

It opens `http://localhost:5050/admin.html` in your browser. Keep that window open while you work.

**Easiest on Windows:** double-click **`Start Admin.cmd`** in this folder. (If `npm run admin` says *"running scripts is disabled"*, that is PowerShell blocking npm; the `.cmd` file avoids it.)

1. **Design number.** Type the number the customer sent (e.g. `47`). The design is selected and its occasion's sample text is loaded. Or browse **Designs** and tap one.
2. **Occasion.** Change it if needed (10 types).
3. **Customer details.** Names, date, venue, message, functions (tap a suggestion like *+ 🌼 Haldi*), photo upload, RSVP number, music. *Clear all* empties the form; the sample text stays as grey hints. The phone on the right shows the real card live.
4. **Get links.** Leave guest names empty for one link, or one name per line for a personal link each (*"Dear Rahul Uncle,"*). Copy, WhatsApp or Copy all.
5. **My links.** Search, copy, open, **Edit** (loads it back into the editor), delete, **Download CSV**.

### Catalog and settings (what the website shows)

- **Catalog:** for each of the 300 designs: name, occasion, price, **On site** (show/hide), **🔥 Trending** (shown first with a badge). Search by number, filter, show/hide many at once.
- **Settings:** live website address, brand, WhatsApp number for orders, Instagram, price for every design, currency.
- **Auto-save:** every change is saved to the website by itself about 2 seconds after you stop typing (several quick edits become one save). It writes `js/config.js`, commits and pushes **only that file** to GitHub, and Vercel updates the live site in about a minute. The bar at the top shows *Saving…* then *✅ Saved*. This works when the panel is opened with `Start Admin.cmd`, or online once `GITHUB_TOKEN` is set in Vercel; otherwise changes stay on that device and **🚀 Publish** downloads `config.js`.
- Opened without `npm run admin` (double-clicking `admin.html`), Publish downloads `config.js` instead: put it in the `js` folder and deploy.

**First time:** set the **Live website address** in Settings (your Vercel domain, e.g. `https://your-site.vercel.app/`) and Publish. Every link you make uses that address, so it opens on any phone.

## Notes

- **Design numbers never change**: links store the number. Old links that used a design name (`royal`, `neon`, …) still open the same design.
- **Photos:** uploads are cropped and shrunk to about 2–10 KB so they fit inside the link. You can also paste a public image URL instead.
- **Admin security:** the live admin files and `/api` are checked by `middleware.js` (Vercel) before anything is sent; without the password nothing loads. `server.mjs` and `Start Admin.cmd` are never uploaded. Turn off GitHub Pages for the repo, it would publish the admin without a password.
- **Opening styles:** every design opens with one of 6 animations: ✉️ envelope, 🚪 palace doors, 🎭 curtain raise, 📜 royal scroll, 🎁 gift box, 💌 folding card. Change it per design in Catalog, or per invite in the editor.
- **Every design is different:** each of the 300 combines its own layout (classic, arch, monogram, ticket, split, editorial magazine, orbit text ring), background decor (mandala, glow, frame, flower corners, sunburst, art-deco, fairy lights, stars & moon, lace), **animated background** (aurora, gradient mesh, film grain, bokeh, god-rays, waves, synthwave grid, holographic foil, silk, glow), **name entrance** (drop, rise, blur, 3D flip, stamp, scatter, typewriter, swing), name finish (shimmer, solid, outline, duo, chrome, holographic, neon glow), photo frame (ring, arch, polaroid, morphing blob, halo), scroll reveal, function list (timeline, cards, zigzag, tickets, chapters), countdown (boxes, rings, strip, minimal), section titles, colours, fonts, opening and **song**. Designs of the same occasion differ in at least 5 of the 12 visible features, neighbours in at least 8; tests check it.
- **Signature:** every card ends with *"Designed with ♥ by Sankalp"* and every poster on the website says *by Sankalp*. To change the name, fill in **Designer name** in the admin Settings (empty = Sankalp).
- **Posters** on the website use each design's own fonts, layout, background, frame and name finish.
- **Order form rules:** names (both for couples), date and venue are required; past dates can't be picked; mobile numbers must be 10 digits (saved with 91). Nicknames are optional and show under the names on the card. Long names shrink to fit, so nothing is cut.
- **Videos:** in *Get links*, **🎬 Download video** films the real card (about 22 s, 9:16, with music) and saves an MP4 for WhatsApp status or Instagram. Needs Chrome or Edge on a computer; Chrome asks once to share the tab.
- **Phones:** the website and the admin have a bottom tab bar on phones.
- **Link history** is stored in your browser. Use Download CSV for a backup.
- **Adding an occasion:** add it to `PRESETS` and a recipe to `RECIPES` in `js/themes.js`.

## Files

```
index.html / admin.html / card.html
server.mjs      admin panel server on your PC: serves the folder, saves + publishes config.js
middleware.js   password for the online admin (Vercel)
api/            online publish (GitHub) + shared config check
css/style.css   site + shared styles     css/admin.css  admin panel
css/card.css    invitation animations
js/config.js    site settings + catalog (written by Publish)
js/themes.js    300 numbered designs + 10 occasion presets
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
npm test            # everything (about 9 minutes: every one of the 300 designs is opened in a browser)
npm run test:unit   # logic only, under 1 second, no browser needed
npm run test:e2e    # drives the real pages in headless Chrome/Edge
```

No packages to install: it uses Node's built-in test runner (Node 20+). The browser tests find Chrome or Edge automatically (set `CHROME_PATH` to override) and are skipped if neither is installed.

- `tests/unit.test.js`: link encoding, URL safety, escaping, dates; all 300 designs complete, unique, readable (contrast) and stable; catalog settings, search, prices, config file; the server's config check.
- `tests/e2e.test.mjs`: the sales site (numbers, search, filters, show more, order buttons), the envelope, countdown, personal links, RSVP, all 300 designs, old links, injection attempts, broken links, smoothness, the full admin flow (design number, editor, photo, links, history, catalog, settings, undo), the panel server's safety checks, and phone widths.
