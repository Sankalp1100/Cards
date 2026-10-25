// Local control-panel server: `npm run admin`. Serves this folder on your PC only (127.0.0.1) and lets the
// panel save js/config.js and publish it (git commit + push; Vercel then redeploys the site by itself).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFile, exec } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
// The same data-only check the online admin uses (api/_check.js).
export const { checkConfig } = createRequire(import.meta.url)('./api/_check.js');
const PORT = +process.env.PORT || 5050;
const CONFIG = path.join(ROOT, 'js', 'config.js');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp' };

const git = (...args) => new Promise(resolve => {
  execFile('git', args, { cwd: ROOT, timeout: 120000 }, (err, stdout, stderr) => resolve({ ok: !err, out: (stdout + stderr).trim() }));
});

async function publish(text) {
  const { SITE } = checkConfig(text);
  fs.writeFileSync(CONFIG, text);
  const steps = [];
  const remote = await git('remote');
  if (!remote.ok || !remote.out) return { saved: true, published: false, message: 'Saved js/config.js. This folder has no git remote, so it was not published.' };
  await git('add', 'js/config.js');
  const diff = await git('diff', '--cached', '--quiet', '--', 'js/config.js');
  if (diff.ok) return { saved: true, published: true, message: 'No changes to publish: the website already has these settings.', url: SITE.url };
  const commit = await git('commit', '-m', 'Update site settings and design catalog', '--', 'js/config.js');
  steps.push(commit.out);
  if (!commit.ok) return { saved: true, published: false, message: 'Saved, but git commit failed:\n' + commit.out };
  const push = await git('push');
  steps.push(push.out);
  if (!push.ok) return { saved: true, published: false, message: 'Saved and committed, but git push failed (check your internet / GitHub login):\n' + push.out };
  return { saved: true, published: true, message: 'Published. Vercel updates the live site in about a minute.', url: SITE.url, log: steps.join('\n') };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > 600000) { reject(new Error('too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

const json = (res, code, data) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(data)); };

export const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/api/status') return json(res, 200, { ok: true, git: !!(await git('remote')).out });
  if (url.pathname === '/api/publish' && req.method === 'POST') {
    // Same-origin only: another website open in your browser must not be able to publish.
    if (req.headers.origin && req.headers.origin !== `http://${req.headers.host}`) return json(res, 403, { message: 'Forbidden' });
    try { return json(res, 200, await publish(JSON.parse(await readBody(req)).config)); }
    catch (e) { return json(res, 400, { saved: false, published: false, message: e.message }); }
  }
  let file = path.normalize(path.join(ROOT, decodeURIComponent(url.pathname === '/' ? '/admin.html' : url.pathname)));
  if (!file.startsWith(ROOT) || /[\\/]\.(git|vercel)/.test(file.slice(ROOT.length))) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
});

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const link = `http://localhost:${PORT}/admin.html`;
  const open = () => { if (!process.env.NO_OPEN) exec(process.platform === 'win32' ? `start "" "${link}"` : process.platform === 'darwin' ? `open ${link}` : `xdg-open ${link}`); };
  server.on('error', e => {
    if (e.code !== 'EADDRINUSE') throw e;
    // Started twice: the panel is already running in another window, so just show it.
    console.log(`\n  The control panel is already running: ${link}\n  (Or another program uses port ${PORT}: set PORT=5060 and start again.)\n`);
    open();
  });
  server.listen(PORT, '127.0.0.1', () => {
    console.log(`\n  Control panel running: ${link}\n  Keep this window open while you work. Press Ctrl+C to stop.\n`);
    open();
  });
}
