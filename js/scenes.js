// SCENE_ART: optional full-bleed painted pictures (AI or hand painted) for the invitation page.
// (Named SCENE_ART so it never clashes with the animated-background list SCENES in js/themes.js.)
//
// Where they show, each behind a soft scrim so the words stay readable:
//   invite / couple → behind the names on the first screen (couple-NN = a full-scene picture of a couple)
//   ganesh, haldi, mehendi, sangeet, baraat, wedding, reception, vidai → behind that function's full-screen chapter
//                     (ganesh is used for a puja, kirtan, path or Ganesh chapter)
//   family          → behind "With Love, Our Families"
//   thanks          → behind the thank-you at the end
//
// How to add one:
//   1. Put the picture in img/scenes/ named <function>-NN.<ext>, e.g. haldi-01.jpg, wedding-02.png, invite-01.webp
//      (.jpg, .jpeg, .png or .webp; portrait about 1080 × 1920 looks best; keep it under ~300 KB).
//   2. Add the full file name, with its extension, to the list below: 'haldi-01.jpg'.
//   A function can have several pictures; each design picks one of them by its design number.
//
// Only files named here are ever requested, so an empty list means no extra downloads and no missing-file
// errors. A listed file that is missing is simply left out (the card keeps its painted gradient and mandala).
const SCENE_ART = [];
if (typeof module !== 'undefined') module.exports = SCENE_ART;
