// ============================================================================================================
//  CINEMA: premium story films, one file each (js/cinema/<id>.js), drawn with the Video Studio's kit (Studio.kit).
// ============================================================================================================
//
//  ADD A FILM (nothing else to edit):
//    1. Copy js/cinema/story-lovestory.js to js/cinema/story-<name>.js (id: 'story-' + lowercase letters only).
//    2. Write your def (below) and shots. Use only Cinema.kit (K) and plain canvas calls.
//    3. Run `node tools/cinema.mjs` — checks every film, rebuilds js/cinema/bundle.js and js/videolooks.js (safe to run
//       any time and from several agents: both are generated from the files in js/cinema/, never edited by hand).
//    4. Run `node tools/cinema.mjs thumbs story-<name>` — makes img/stories/story-<name>.jpg (360×640).
//    5. Check it (see VERIFY) and `node --test tests/unit.test.js`.
//    The film then appears everywhere by itself: the website's Story videos, the admin Video Studio, any player.
//
//  THE DEF — Cinema.register({ … }):
//    id        'story-name'                         name, note  shown on the website (note: one line, what happens)
//    order     a number: smaller first (Our Love Story is 1; use 10–99)
//    occasion  the PRESETS card it plays with as a sample ('wedding', 'bday', 'birthday', 'babyshower', 'housewarming',
//              'anniversary', 'kitty', 'ceremony', 'naming', 'engagement', 'reception', 'haldi', 'mehendi', 'sangeet'…)
//    names     ['Bride', 'Groom'] sample names (two-name occasions); pick names no other film uses
//    tune      a key of TUNES in js/tunes.js          thumb  seconds into the film for its picture (default 2.5)
//    looks     { open, title, invite, events: [...], date, end, final }: painted looks (Studio.LOOKS ids) for any
//              standard scene you keep; fn: [[/haldi/i, 'haldi-golden'], …] a function's look by its name;
//              titles: [[/haldi/i, 'Sunshine Soirée'], …] a function's own heading (with s.datebar screens)
//    ganesha   'ganesha-01' (img/art/cut)             pictures  ['shotName'] shots an owner picture may replace
//    look(kind, K)  optional: the palette for words on your shots (K.palette(lookId, { col: {…}, font: {…} }))
//    timeline(S, K, card, opt)  the scenes. S arrives as the standard story:
//              open, title, invite, event (one per function, s.e = the function), date, end, final (QR + signature).
//              Replace, add or drop scenes; a shot is { k: 'reel', reel: 'shotName', d: seconds, name: 'Label' }.
//              Scene options: cut: true (no cross-fade: a match-cut), change: 'flash' | 'iris' | 'wipe' | 'bloom' |
//              'petals' | 'sparkle' | 'shutter' | 'clink' | 'none', items: [...] words laid out over the shot (with
//              zone: [top, bottom, maxW], board: 'carved' | 'arch' | 'cartouche' | 'wood' | false, scrim: true,
//              enter: 'rise' | 'drop' | 'zoom' | 'side' | 'swing' | 'unfold'), sigCorner: true (the signature box).
//              Standard scenes keep their own words (K.lines(scene, card, opt) gives them to you as items).
//              Keep the 'final' scene (thank you + QR + "Designed by Sankalp") or give your last shot sigCorner: true
//              and a { t: 'qr', rows: K.SITE_QR, z: 260 } item. The "Designed by Sankalp" credit line is automatic.
//    shots     { shotName(c, s, pt, t, P, K) { … } } draw the whole frame: s the scene, pt seconds into it,
//              t seconds into the film, P the player (P.card, P.opt.lang ('en' | 'hi'), P.k, P.ctx.letters).
//
//  KIT (Cinema.kit === Studio.kit; read js/studio.js "The cinema kit" for every signature):
//    camera    K.camAt(pt, [[0,{x,y,z}],[2,{…}]]), K.camera(c, cam), K.fillZoom(w, h) (match-cut onto a rect)
//    cache     K.art(key, w, h, k, draw) paints still art once (k = Math.min(1.25, P.k)); K.canvasOf(w, h)
//    words     K.words(c, P, items, { zone, L, p, d }) (items made once), K.palette(), K.foil(c, text, x, y, {font, t})
//    frames    K.board(c, {style, tone, x, y, w, h}), K.goldFrame, K.velvet(k, colour), K.rays, K.monogramArt,
//              K.crestTop, K.cornerScroll, K.gem
//    booklet   K.pageTurn(c, u, x, y, w, h, frontCanvas, backCanvas), K.cardFlip, K.fan, K.dateMedallion,
//              K.functionCard, K.pin, K.days(card) (functions grouped by day)
//    reveals   K.opening(c, 'doors' | 'curtains' | 'scroll' | 'iris' | 'veil' | 'gates', p, t), K.change(c, kind, p, L, t)
//    people    K.coupleImage(P[, eventName]), K.portrait (photo crop), K.cutout (full figure, shadow + rim light),
//              K.ganeshaImage(P), K.ganesha (drawn), K.scenePicture(P, 'haldi') + K.drawPicture
//    light     K.petals, K.sparks, K.motes, K.bokeh, K.confetti, K.burst, K.glow, K.finish
//    props     flowers (rose, marigold, lotus, orchidSpray, bougainvillea, blossom, foliage…), diya, kalash, bell,
//              lamps, balloons, cake, gifts, bunting, lanterns, disco ball, peacock, palm, phone, hand, flute, drapes,
//              toran, florals, mandala, rangoli, paisley, henna, clouds, sky…
//    details   K.clean, K.splitIcon, K.events(card), K.days(card, hi), K.dateRange, K.dayText, K.timeText, K.hiDay,
//              K.hiTime, K.parents(card, lang), K.MONTHS, K.DAYS, K.HI (Hindi words)
//
//  CONVENTIONS: 1080 × 1920 portrait; 45–60 s in all (never over 60: one WhatsApp status); English and Hindi (read
//  P.opt.lang; Hindi words from K.HI or your own); any card (no functions, one name, six functions) must still play;
//  sample names unlike every other film; a designer credit line is drawn on every scene; end on thank you + QR + the
//  signature. Every still thing goes through K.art (painted once); a frame should cost no more than the other films'
//  (`node tools/cinema.mjs record story-x` reports it): avoid shadowBlur, 'screen'/'lighter' blending on large areas
//  and thousands of shapes per frame. No image files except the couple / Ganesh library (K.coupleImage…) and owner
//  scene pictures (K.scenePicture), which may be missing: always draw your own art when they are.
//
//  VERIFY: `node tools/cinema.mjs sheet story-x` (a frame per second, also `… sheet story-x hi`) — look at it
//  critically; `node tools/cinema.mjs record story-x` (plays it in real time and records it: no errors, no stalls);
//  `node tools/cinema.mjs thumbs story-x`; `node --test tests/unit.test.js`.
// ============================================================================================================
const Cinema = (() => {
  const films = [];
  function register(def) {
    try {
      if (typeof Studio === 'undefined' || !Studio.addStory) throw new Error('load js/studio.js first');
      Studio.addStory(def);
      films.push(def.id);
    } catch (e) {
      if (typeof console !== 'undefined') console.warn(`Cinema: could not add ${def && def.id}:`, e.message || e);
    }
  }
  return { films, register, get kit() { return typeof Studio !== 'undefined' ? Studio.kit : null; } };
})();

if (typeof module !== 'undefined') module.exports = Cinema;
