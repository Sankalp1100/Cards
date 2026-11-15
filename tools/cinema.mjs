// The cinema films (js/cinema/<id>.js, see js/cinema.js):
//   node tools/cinema.mjs                   check every film, rebuild js/cinema/bundle.js and js/videolooks.js
//   node tools/cinema.mjs thumbs [id …]     their pictures, img/stories/<id>.jpg (360 × 640; all films when no id)
//   node tools/cinema.mjs sheet <id> [hi]   a frame per second as one picture (prints where it is saved)
//   node tools/cinema.mjs record <id>       plays it in real time while recording it, and reports dropped frames
// Safe to run any time, from several places at once: the generated files come only from the films' own files.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'js', 'cinema');
const require = createRequire(import.meta.url);
const [cmd = 'build', ...args] = process.argv.slice(2);

const filmFiles = () => fs.readdirSync(DIR).filter(f => /^story-[a-z]+\.js$/.test(f)).sort();
function context() {
  const ctx = vm.createContext({ console: { log() {}, warn: (...a) => ctx.__warn.push(a.join(' ')) }, __warn: [], TextEncoder, TextDecoder, URL, URLSearchParams, btoa, atob });
  for (const f of ['config.js', 'themes.js', 'codec.js', 'core.js', 'studio.js', 'cinema.js']) vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'), ctx, { filename: f });
  return ctx;
}

function build() {
  const ok = [], report = [];
  const { TUNES } = require(path.join(ROOT, 'js', 'tunes.js'));
  for (const f of filmFiles()) {
    const id = f.replace(/\.js$/, ''), src = fs.readFileSync(path.join(DIR, f), 'utf8');
    try {
      new vm.Script(src, { filename: f });
      const ctx = context();
      vm.runInContext(src, ctx, { filename: f });
      const S = vm.runInContext('Studio', ctx), st = S.STORIES[id];
      if (!st) throw new Error(ctx.__warn.join('; ') || `it did not register '${id}' (the id must match the file name)`);
      if (!TUNES[st.tune]) throw new Error(`unknown tune '${st.tune}'`);
      const PRESETS = vm.runInContext('PRESETS', ctx), problems = [];
      for (const occ of [...new Set([st.occasion || 'wedding', 'wedding'])]) {
        const card = JSON.parse(JSON.stringify(PRESETS[occ].card));
        for (const lang of ['en', 'hi']) for (const events of [card.events || [], []]) {
          const tl = S.timeline({ ...card, events }, { ...S.defaults({ ...card, events }, lang), story: id, look: st.open, events: 'each' });
          if (tl.total > 60) problems.push(`${occ}/${lang}${events.length ? '' : '/no functions'}: ${tl.total.toFixed(1)} s (over 60)`);
          for (const sc of tl.scenes) {
            if (!S.LOOKS[sc.look]) problems.push(`${sc.k}: no look '${sc.look}'`);
            if (sc.k === 'reel' && !st.shots[sc.reel]) problems.push(`no shot '${sc.reel}'`);
          }
        }
      }
      if (problems.length) throw new Error([...new Set(problems)].join('; '));
      ok.push({ f, id, src });
      report.push(`  ok    ${id}  (${st.name})`);
    } catch (e) {
      report.push(`  SKIP  ${f}: ${e.message}`);
    }
  }
  const bundle = ['// Made by `node tools/cinema.mjs` from js/cinema/story-*.js: do not edit (edit the films, then run it again).',
    ...ok.map(({ f, src }) => `\n// ---------- js/cinema/${f} ----------\ntry {\n${src}\n} catch (e) { if (typeof console !== 'undefined') console.warn('Cinema: ${f}', e); }`), ''].join('\n');
  fs.writeFileSync(path.join(DIR, 'bundle.js'), bundle);
  // the website's list of looks and story films (js/videolooks.js), now with the films
  const ctx = context();
  vm.runInContext(bundle, ctx, { filename: 'bundle.js' });
  const S = vm.runInContext('Studio', ctx), file = path.join(ROOT, 'js', 'videolooks.js'), old = fs.readFileSync(file, 'utf8');
  const head = old.slice(0, old.indexOf('const VIDEO_STORIES')), tail = old.slice(old.lastIndexOf('];') + 2);
  const stories = Object.entries(S.STORIES).map(([id, s]) => '  ' + JSON.stringify([id, s.name, s.note, TUNES[s.tune].label])).join(',\n');
  const looks = Object.entries(S.LOOKS).map(([id, L]) => '  ' + JSON.stringify([id, L.scene, L.mood])).join(',\n');
  fs.writeFileSync(file, `${head}const VIDEO_STORIES = [\n${stories}\n];\nconst VIDEO_LOOKS = [\n${looks}\n];${tail}`);
  console.log(`Cinema films:\n${report.join('\n')}\nWrote js/cinema/bundle.js (${ok.length} films) and js/videolooks.js.`);
  const missing = ok.filter(({ id }) => !fs.existsSync(path.join(ROOT, 'img', 'stories', `${id}.jpg`))).map(x => x.id);
  if (missing.length) console.log(`No picture yet: ${missing.join(', ')} → node tools/cinema.mjs thumbs ${missing.join(' ')}`);
}

// A browser on a page with the Studio and the films loaded (v.html), and a player for a film
async function browser() {
  const { launch } = await import('../tests/cdp.mjs');
  const { server } = await import('../server.mjs');
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const page = await launch(); await page.viewport(540, 960);
  await page.goto(`http://127.0.0.1:${server.address().port}/v.html?rec`, 1500);
  await page.waitFor(`document.querySelector('#wait').hidden`, 60000);
  await page.eval(`Studio.fontsReady()`);
  const done = async () => { await page.close(); server.close(); };
  return { page, done };
}
const setup = (id, k, lang = 'en') => `(async()=>{const st=Studio.STORIES['${id}'];if(!st)throw new Error('no film ${id}: run node tools/cinema.mjs');
  window.C=document.createElement('canvas');window.P=new Studio.Player(C,${k});const card=Studio.sample('vrindavan');
  P.set(card,{...Studio.defaults(card,'${lang || 'en'}'),look:st.open,story:'${id}',events:'each'},typeof SITE!=='undefined'?SITE:{});
  await new Promise(r=>setTimeout(r,1500));P.tl.scenes.forEach(s=>P.draw(s.t0+.1));return P.total})()`;

async function thumbs(ids) {
  const { page, done } = await browser();
  const list = ids.length ? ids : await page.eval(`Object.keys(Studio.STORIES).filter(id=>Studio.STORIES[id].reel)`);
  for (const id of list) {
    await page.eval(setup(id, .75));
    const url = await page.eval(`(()=>{const at=Studio.STORIES['${id}'].thumb??2.5;P.draw(at);const T=document.createElement('canvas');T.width=360;T.height=640;const x=T.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(C,0,0,360,640);return T.toDataURL('image/jpeg',.86)})()`);
    const out = path.join(ROOT, 'img', 'stories', `${id}.jpg`);
    fs.writeFileSync(out, Buffer.from(url.split(',')[1], 'base64'));
    console.log('wrote', path.relative(ROOT, out));
  }
  if (page.errors.length) console.log('page errors:', page.errors);
  await done();
}

async function sheet(id, lang) {
  const { page, done } = await browser();
  const total = await page.eval(setup(id, .5, lang));
  const url = (await page.send('Runtime.evaluate', { awaitPromise: true, returnByValue: true, expression: `(()=>{const n=Math.floor(P.total),cols=10,w=180,h=320,S=document.createElement('canvas');
    S.width=cols*w;S.height=Math.ceil(n/cols)*(h+22);const x=S.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,S.width,S.height);x.font='14px sans-serif';x.fillStyle='#000';
    for(let i=0;i<n;i++){P.draw(i+.5);const cx=(i%cols)*w,cy=Math.floor(i/cols)*(h+22);x.drawImage(C,cx,cy,w,h);x.fillStyle='#000';x.fillText((i+.5)+'s',cx+4,cy+h+16);}
    return S.toDataURL('image/jpeg',.88)})()` }, 300000)).result.result.value;
  const out = path.join(os.tmpdir(), 'cinema', `${id}${lang ? '-' + lang : ''}-sheet.jpg`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, Buffer.from(url.split(',')[1], 'base64'));
  console.log(`${id}: ${total.toFixed(1)} s → ${out}`, page.errors.length ? page.errors : '');
  await done();
}

async function record(id) {
  const { page, done } = await browser();
  await page.eval(setup(id, 1));
  const r = (await page.send('Runtime.evaluate', { awaitPromise: true, returnByValue: true, expression: `new Promise(res=>{const st=C.captureStream(30),rec=new MediaRecorder(st,{mimeType:'video/webm'}),parts=[];
    let n=0,slow=0,worst=0;rec.ondataavailable=e=>parts.push(e.data);rec.onstop=()=>res({seconds:+P.total.toFixed(1),frames:n,fps:+(n/P.total).toFixed(1),slowFrames:slow,worstMs:Math.round(worst),bytes:parts.reduce((a,b)=>a+b.size,0)});
    rec.start(1000);const t0=performance.now();let last=t0;const f=now=>{const t=(now-t0)/1000;worst=Math.max(worst,now-last);if(now-last>50)slow++;last=now;P.draw(Math.min(t,P.total-.001));n++;if(t<P.total)requestAnimationFrame(f);else rec.stop();};requestAnimationFrame(f);})` }, 200000)).result.result.value;
  console.log(id, r, page.errors.length ? page.errors : 'no errors');
  console.log('(headless Chrome draws in software: compare with another film recorded the same way, e.g. story-lovestory)');
  await done();
}

if (cmd === 'build') build();
else if (cmd === 'thumbs') await thumbs(args);
else if (cmd === 'sheet') await sheet(args[0], args[1] === 'hi' ? 'hi' : '');
else if (cmd === 'record') await record(args[0]);
else { console.log('node tools/cinema.mjs [build | thumbs [id …] | sheet <id> [hi] | record <id>]'); process.exitCode = 1; }
process.exit(process.exitCode || 0);
