// Draws every premium film's picture for the website: `node tools/film-posters.mjs`
// Opens js/films.js in Chrome, draws each film at its names moment and saves img/films/<id>.jpg (270×480).
// Run it again after adding or changing films in js/films.js.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname).replace(/^\/(\w:)/, '$1'), '..');
const { launch } = await import(pathToFileURL(path.join(ROOT, 'tests', 'cdp.mjs')).href);
const OUT = path.join(ROOT, 'img', 'films');
fs.mkdirSync(OUT, { recursive: true });

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/poster')) {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    return res.end('<!doctype html><meta charset="utf-8"><canvas id="c"></canvas><script src="/js/films.js"></script>');
  }
  fs.readFile(path.join(ROOT, decodeURIComponent(req.url.split('?')[0])), (err, data) => {
    if (err) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8' });
    res.end(data);
  });
}).listen(0);
const port = server.address().port;

const page = await launch();
try {
  await page.goto(`http://127.0.0.1:${port}/poster`);
  await page.eval('Films.fontsReady()');
  const ids = await page.eval('Films.LIST.map(f => f.id)');
  for (const id of ids) {
    const url = await page.eval(`(() => {
      const c = document.getElementById('c'), p = new Films.Player(c, .25);
      p.set(${JSON.stringify(id)}); p.draw(p.posterTime());
      return c.toDataURL('image/jpeg', .84);
    })()`);
    fs.writeFileSync(path.join(OUT, id + '.jpg'), Buffer.from(url.split(',')[1], 'base64'));
  }
  // pictures of films that no longer exist
  for (const f of fs.readdirSync(OUT)) if (f.endsWith('.jpg') && !ids.includes(f.slice(0, -4))) fs.unlinkSync(path.join(OUT, f));
  console.log(`${ids.length} film pictures in img/films/`);
} finally {
  await page.close();
  server.close();
}
