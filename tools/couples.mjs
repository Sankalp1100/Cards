// Builds the art libraries: `node tools/couples.mjs`
// - Couples: every picture in img/couples/ (PNG, JPG or WEBP; name it "<occasion>-NN", e.g. wedding-01.png, haldi-02.jpg)
// - Ganesh ji: every picture in img/art/ named "ganesha-NN.png" (or .jpg/.webp, a two-digit number; the older
//   ganesha*.jpg photos are left as they are)
// Each one: a plain white or grey-checkerboard background is removed (only what touches the edges, so white
// outfits stay), the empty space is trimmed, and it is sized to at most 1400 px tall, then saved to
// img/couples/cut/<name>.png or img/art/cut/<name>.png. Exact copies (the same picture under another name) are
// left out. Then writes js/couples.js, the lists the cards and the videos pick from.
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname).replace(/^\/(\w:)/, '$1'), '..');
const { launch } = await import(pathToFileURL(path.join(ROOT, 'tests', 'cdp.mjs')).href);
const OCCASIONS = ['wedding', 'reception', 'engagement', 'sangeet', 'haldi', 'mehendi', 'roka', 'anniversary', 'babyshower', 'naming', 'family', 'kid'];

let page = null;
async function cutAll(src, pick, label) {
  const out = path.join(src, 'cut');
  fs.mkdirSync(out, { recursive: true });
  const seen = new Set();
  const files = fs.readdirSync(src).filter(f => /\.(png|jpe?g|webp)$/i.test(f) && pick(f)).sort().filter(f => {
    const h = crypto.createHash('md5').update(fs.readFileSync(path.join(src, f))).digest('hex');
    if (seen.has(h)) { console.log(`  · ${f}: a copy of another picture, left out`); return false; }
    seen.add(h);
    return true;
  });
  for (const old of fs.readdirSync(out)) fs.unlinkSync(path.join(out, old));
  const list = [];
  for (const f of files) {
    if (!page) { page = await launch(); await page.goto('about:blank', 100); }
    const name = f.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9-]+/g, '-');
    if (list.some(x => x.id === name)) { console.log(`  · ${f}: same name as another picture, left out`); continue; }
    const data = 'data:image/' + (/png$/i.test(f) ? 'png' : /webp$/i.test(f) ? 'webp' : 'jpeg') + ';base64,' + fs.readFileSync(path.join(src, f)).toString('base64');
    const res = await page.eval(`(async () => {
      const img = new Image(); img.src = ${JSON.stringify(data)}; await img.decode();
      const k = Math.min(1, 1400 / img.height), w = Math.round(img.width * k), h = Math.round(img.height * k);
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      const c = cv.getContext('2d'); c.drawImage(img, 0, 0, w, h);
      const d = c.getImageData(0, 0, w, h), px = d.data;
      // The background: light, low-colour pixels (white, or the grey and white squares of a fake "transparent" checkerboard).
      // How light is measured on the picture's own edge, so a pure white background doesn't eat into a white gown.
      const edge = [];
      for (let x = 0; x < w; x += 4) edge.push(Math.min(px[x * 4], px[x * 4 + 1], px[x * 4 + 2]), Math.min(...px.subarray(((h - 1) * w + x) * 4, ((h - 1) * w + x) * 4 + 3)));
      for (let y = 0; y < h; y += 4) edge.push(Math.min(...px.subarray(y * w * 4, y * w * 4 + 3)), Math.min(...px.subarray((y * w + w - 1) * 4, (y * w + w - 1) * 4 + 3)));
      edge.sort((a, b) => a - b);
      const light = edge[Math.floor(edge.length * .1)] >= 250 ? 244 : 200;
      const bg = i => px[i + 3] < 20 || (Math.min(px[i], px[i + 1], px[i + 2]) > light && Math.max(px[i], px[i + 1], px[i + 2]) - Math.min(px[i], px[i + 1], px[i + 2]) < 18);
      const seen = new Uint8Array(w * h), stack = [];
      for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
      for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
      while (stack.length) {
        const p = stack.pop();
        if (seen[p] || !bg(p * 4)) continue;
        seen[p] = 1; px[p * 4 + 3] = 0;
        const x = p % w;
        if (x > 0) stack.push(p - 1); if (x < w - 1) stack.push(p + 1);
        if (p >= w) stack.push(p - w); if (p < w * (h - 1)) stack.push(p + w);
      }
      // Soften the cut edge by one pixel
      for (let p = 0; p < w * h; p++) if (!seen[p] && ((p % w && seen[p - 1]) || seen[p + 1] || seen[p - w] || seen[p + w])) px[p * 4 + 3] = Math.min(px[p * 4 + 3], 170);
      c.putImageData(d, 0, 0);
      // Trim the empty space around the figures
      let x0 = w, y0 = h, x1 = 0, y1 = 0;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (px[(y * w + x) * 4 + 3] > 24) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
      if (x1 <= x0) return null;
      const out = document.createElement('canvas'); out.width = x1 - x0 + 1; out.height = y1 - y0 + 1;
      out.getContext('2d').drawImage(cv, x0, y0, out.width, out.height, 0, 0, out.width, out.height);
      return { url: out.toDataURL('image/png'), w: out.width, h: out.height, cut: seen.reduce((a, v) => a + v, 0) / (w * h) };
    })()`);
    if (!res) { console.log(`  ✖ ${f}: nothing left after removing the background`); continue; }
    fs.writeFileSync(path.join(out, name + '.png'), Buffer.from(res.url.split(',')[1], 'base64'));
    list.push({ id: name, occasion: OCCASIONS.find(o => name.startsWith(o)) || label, w: res.w, h: res.h });
    console.log(`  ✔ ${f} → cut/${name}.png (${res.w}×${res.h}, ${Math.round(res.cut * 100)}% background removed)`);
  }
  return list;
}

const couples = await cutAll(path.join(ROOT, 'img', 'couples'), () => true, 'wedding');
const ganeshas = (await cutAll(path.join(ROOT, 'img', 'art'), f => /^ganesha-\d\d\.(png|jpe?g|webp)$/i.test(f), 'ganesha')).map(({ id, w, h }) => ({ id, w, h }));
if (page) await page.close();
const flat = a => JSON.stringify(a, null, 1).replace(/\n\s*/g, ' ');
fs.writeFileSync(path.join(ROOT, 'js', 'couples.js'), `// The art libraries, made by \`node tools/couples.mjs\`: couples (img/couples/cut; id = file name, occasion = what
// it suits) and Ganesh ji illustrations (img/art/cut); w × h in pixels. Cards and videos pick a different one per design.
const COUPLES = ${flat(couples)};
const GANESHA_ART = ${flat(ganeshas)};
if (typeof module !== 'undefined') { module.exports = COUPLES; module.exports.GANESHA_ART = GANESHA_ART; }
`);
console.log(`${couples.length} couple picture${couples.length === 1 ? '' : 's'} and ${ganeshas.length} Ganesh ji picture${ganeshas.length === 1 ? '' : 's'} in js/couples.js`);
