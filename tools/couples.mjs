// Builds the couple art library: `node tools/couples.mjs`
// Takes every picture in img/couples/ (PNG, JPG or WEBP; name it "<occasion>-NN", e.g. wedding-01.png, haldi-02.jpg),
// removes a plain white or grey-checkerboard background (only what touches the edges, so white outfits stay),
// trims the empty space, sizes it to at most 1400 px tall, and saves it to img/couples/cut/<name>.png.
// Then writes js/couples.js, the list the cards and the videos pick from.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname).replace(/^\/(\w:)/, '$1'), '..');
const SRC = path.join(ROOT, 'img', 'couples'), OUT = path.join(SRC, 'cut');
const { launch } = await import(pathToFileURL(path.join(ROOT, 'tests', 'cdp.mjs')).href);
fs.mkdirSync(OUT, { recursive: true });

const OCCASIONS = ['wedding', 'reception', 'engagement', 'sangeet', 'haldi', 'mehendi', 'roka', 'anniversary', 'babyshower', 'naming', 'family', 'kid'];
const files = fs.readdirSync(SRC).filter(f => /\.(png|jpe?g|webp)$/i.test(f)).sort();
const list = [];
if (files.length) {
  const page = await launch();
  await page.goto('about:blank', 100);
  for (const f of files) {
    const name = f.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9-]+/g, '-');
    const occasion = OCCASIONS.find(o => name.startsWith(o)) || 'wedding';
    const data = 'data:image/' + (/png$/i.test(f) ? 'png' : /webp$/i.test(f) ? 'webp' : 'jpeg') + ';base64,' + fs.readFileSync(path.join(SRC, f)).toString('base64');
    const res = await page.eval(`(async () => {
      const img = new Image(); img.src = ${JSON.stringify(data)}; await img.decode();
      const k = Math.min(1, 1400 / img.height), w = Math.round(img.width * k), h = Math.round(img.height * k);
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      const c = cv.getContext('2d'); c.drawImage(img, 0, 0, w, h);
      const d = c.getImageData(0, 0, w, h), px = d.data;
      // The background: light, low-colour pixels (white, or the grey and white squares of a fake "transparent" checkerboard)
      const bg = i => px[i + 3] < 20 || (Math.min(px[i], px[i + 1], px[i + 2]) > 200 && Math.max(px[i], px[i + 1], px[i + 2]) - Math.min(px[i], px[i + 1], px[i + 2]) < 18);
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
    fs.writeFileSync(path.join(OUT, name + '.png'), Buffer.from(res.url.split(',')[1], 'base64'));
    list.push({ id: name, occasion, w: res.w, h: res.h });
    console.log(`  ✔ ${f} → cut/${name}.png (${res.w}×${res.h}, ${Math.round(res.cut * 100)}% background removed)`);
  }
  await page.close();
}
fs.writeFileSync(path.join(ROOT, 'js', 'couples.js'), `// The couple art library (img/couples/cut), made by \`node tools/couples.mjs\` from the pictures in img/couples.
// id = file name, occasion = what it suits; w × h in pixels. Cards and videos pick a different one per design.
const COUPLES = ${JSON.stringify(list, null, 1).replace(/\n\s*/g, ' ')};
if (typeof module !== 'undefined') module.exports = COUPLES;
`);
console.log(`${list.length} couple picture${list.length === 1 ? '' : 's'} in js/couples.js`);
