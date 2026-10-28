// Minimal headless-Chrome driver over the DevTools protocol (no npm dependencies).
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium'
].filter(Boolean);

export const chromePath = CANDIDATES.find(p => fs.existsSync(p));
const sleep = ms => new Promise(r => setTimeout(r, ms));

export async function launch({ headful = false, args = [] } = {}) {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'wc-test-'));
  // Port 0: Chrome takes a free port and writes it to DevToolsActivePort in its own profile, so two browsers
  // started at the same time can never end up talking to each other (a random port sometimes collided).
  const proc = spawn(chromePath, [...(headful ? [] : ['--headless=new']), ...args, '--remote-debugging-port=0', '--no-first-run', '--hide-scrollbars', '--auto-accept-this-tab-capture', '--autoplay-policy=no-user-gesture-required', `--user-data-dir=${profile}`, 'about:blank']);
  let target, port;
  for (let i = 0; i < 60 && !target; i++) {
    await sleep(250);
    try {
      port = port || +fs.readFileSync(path.join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0];
      target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t => t.type === 'page');
    } catch { /* not up yet */ }
  }
  if (!target) throw new Error('Chrome did not start');

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0;
  const pending = new Map();
  const errors = [];
  ws.onmessage = m => {
    const d = JSON.parse(m.data);
    if (d.id) { pending.get(d.id)?.(d); pending.delete(d.id); return; }
    if (d.method === 'Runtime.exceptionThrown') errors.push(d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text);
    if (d.method === 'Page.javascriptDialogOpening') send('Page.handleJavaScriptDialog', { accept: true });
  };
  // Every call has a time limit: a Chrome that stops answering fails the test with a message instead of hanging the run
  const send = (method, params = {}, ms = 30000) => new Promise((res, rej) => {
    const i = ++id, timer = setTimeout(() => { pending.delete(i); rej(new Error(`Chrome did not answer ${method} within ${ms / 1000}s`)); }, ms);
    pending.set(i, d => { clearTimeout(timer); res(d); });
    ws.send(JSON.stringify({ id: i, method, params }));
  });
  await send('Runtime.enable');
  await send('Page.enable');

  const page = {
    errors,
    send,
    async viewport(width, height) {
      await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 });
    },
    async goto(url, settle = 800) {
      errors.length = 0;
      await send('Page.navigate', { url: 'about:blank' });
      await send('Page.navigate', { url });
      await page.waitFor('document.readyState === "complete"', 15000);
      await sleep(settle);
    },
    async eval(expr) {
      const r = (await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result;
      if (r.exceptionDetails) throw new Error(`eval failed: ${r.exceptionDetails.exception?.description || r.exceptionDetails.text}\n${expr}`);
      return r.result.value;
    },
    async waitFor(expr, timeout = 8000) {
      const end = Date.now() + timeout;
      while (Date.now() < end) {
        try { if (await page.eval(`!!(${expr})`)) return; } catch { /* page still loading */ }
        await sleep(100);
      }
      throw new Error(`Timed out waiting for: ${expr}`);
    },
    async screenshot(file) {
      const r = (await send('Page.captureScreenshot', { format: 'png' })).result;
      fs.writeFileSync(file, Buffer.from(r.data, 'base64'));
    },
    async close() {
      ws.close();
      proc.kill();
      await sleep(300);
      try { fs.rmSync(profile, { recursive: true, force: true }); } catch { /* Chrome may still hold files */ }
    }
  };
  return page;
}
