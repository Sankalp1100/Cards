# Scene pictures for premium videos and cards

Make these pictures in ChatGPT (image), Gemini or any AI image tool, and save them in this folder
(`img/scenes/`). The videos and card links use a picture automatically when its file is here, and fall back
to the drawn scene when it isn't. After adding pictures, tell Claude: "scenes add kar diye" so it lists
them in `js/scenes.js` and re-renders.

## Rules for every picture

- **Size:** vertical 9:16 (1080 × 1920 or larger). Any format works (`.jpg`, `.png` or `.webp`). Name it as listed
  below with your file's own ending, e.g. `haldi-01.jpg` or `haldi-01.png`.
- **No text at all.** No names, dates, letters, watermarks or logos. The text is added by the code.
- **Leave room for text:** keep the upper-middle part calm (sky, wall, an empty ornate frame or signboard), with the
  main action in the lower half.
- **One look for the whole set:** paste the *style line* below at the start of every prompt so all scenes match.
- **Same couple in every scene:** after the first good couple picture, upload it with the next prompt and add
  "same bride and groom as the reference image".

**Style line (paste first in every prompt):**

> 3D animated illustration in a premium Pixar-like style, Indian wedding, vertical 9:16 poster, ultra detailed,
> soft cinematic lighting, warm glow, shallow depth of field, rich colours, elegant and luxurious, clean
> composition, no text, no letters, no watermark, no logo.

## The pictures

| File name | Prompt (after the style line) |
|---|---|
| `ganesh-01.webp` | A white-marble temple hall with carved arches and golden doors, Lord Ganesha idol seated on a lotus pedestal at the bottom centre, marigold garlands, diyas, rose petals on the steps, soft god rays from above, calm empty wall in the upper half. |
| `ganesh-02.webp` | Golden palace doors slightly open with light pouring out, peacocks on both sides, a small Lord Ganesha idol on a decorated stand in front, flower torans, petals floating, empty space above the doors. |
| `invite-01.webp` | A grand white-and-gold palace corridor of arches, an empty ornate gold picture frame on an easel in the centre (frame left empty for text), a small Ganesha carved on top of the frame, pink and white flowers, petals on a marble floor. |
| `invite-02.webp` | A royal jharokha balcony at golden hour, an empty carved ivory signboard hanging in the centre, bougainvillea flowers, hanging brass lanterns, palace domes in the soft background. |
| `haldi-01.webp` | Haldi ceremony: the groom in a yellow kurta playfully applying turmeric to the bride's cheek, both laughing, seated on low cushions, marigold garlands everywhere, brass bowls of haldi, yellow and orange drapes, an empty carved wooden signboard with a marigold border in the upper part. |
| `haldi-02.webp` | A sunny courtyard decorated for Haldi with marigold strings, yellow umbrellas and a floral swing, the bride and groom in yellow outfits on the swing, family members smiling in the soft background, calm sky above. |
| `mehendi-01.webp` | Mehendi ceremony: the bride in a green lehenga showing her hennaed hands, the groom in a pista-green kurta sitting beside her smiling, colourful bolsters and cushions, small brass pots, a flower wall of marigold and pink flowers forming an empty frame in the upper half. |
| `mehendi-02.webp` | A garden mehendi setup with hanging umbrellas, colourful bandhani drapes and fairy lights, the couple seated on a decorated low sofa, plants and flowers around, calm upper area. |
| `sangeet-01.webp` | Sangeet night: the couple dancing on a stage with warm spotlights, crystal chandeliers, purple and gold drapes, glowing fairy lights, confetti in the air, friends cheering in soft focus, a dark elegant upper area. |
| `sangeet-02.webp` | A glamorous cocktail and DJ night in a black-and-gold ballroom, chandeliers, a mirror-ball glow, the couple in modern Indo-western outfits holding hands, sparkles, an empty upper area. |
| `gharoli-01.webp` | Gharoli/ghadoli ritual: the smiling bride carrying a decorated brass pot on her head, women in colourful Punjabi suits clapping and dancing around her, marigold garlands and colourful hanging cloth above. |
| `baraat-01.webp` | Baraat: the groom in a cream sherwani and a pink turban with a sehra, seated on a decorated white horse, dhol players and dancing relatives, marigold garlands, warm evening lights, a palace gate in the background, calm sky above. |
| `baraat-02.webp` | Sehrabandi: the groom in an ivory sherwani holding a sword, smiling, family behind him in colourful outfits, a white palace courtyard with flower garlands, an empty carved signboard above. |
| `wedding-01.webp` | Wedding pheras: the bride in a red lehenga and the groom in a gold sherwani at a decorated mandap with the sacred fire, marigold and rose garlands, diyas, family in soft focus, rich red and gold tones, empty upper area. |
| `wedding-02.webp` | Varmala moment on a floral stage, the couple exchanging garlands, rose petals falling, warm golden lights, a grand floral backdrop forming an empty arch in the upper half. |
| `reception-01.webp` | Reception: a royal ballroom with crystal chandeliers, white roses and gold accents, the couple in elegant evening wear on a floral stage, soft blue night sky through tall arched windows, an empty ornate gold frame in the upper part. |
| `reception-02.webp` | A rooftop reception at night with fairy lights, lanterns and a city palace view, the couple standing together, warm and cool lights, a starry sky above. |
| `vidai-01.webp` | Vidai: the bride in a red lehenga walking towards a flower-decorated vintage car with a "just married" feel (no readable text), family members emotional in the background, a temple-like palace facade, petals in the air. |
| `family-01.webp` | A grand palace hall with chandeliers and white flower arrangements, a large empty ornate gold frame on a stand in the centre for a family welcome message, a reflective marble floor, warm lights. |
| `thanks-01.webp` | A dreamy floral mandap at dusk with rose garlands, gold drapes and hanging diyas, petals falling, the space under the mandap empty and glowing (for a thank-you message). |

## Tips

- If a picture has any text or letters in it, regenerate it or ask the tool to remove the text.
- Make a few versions of the important ones (haldi, wedding, reception) and keep the best. Extra versions can be
  saved as `haldi-03.webp`, `haldi-04.webp` and so on.
- Bigger is better: 1080 × 1920 or larger, so the pictures stay sharp on phones.
