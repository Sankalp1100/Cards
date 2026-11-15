// Maintenance mode for the website's home page (switched on in the control panel: Settings → Maintenance mode).
// While SITE.maintenance is true, visitors see a full-screen "something crazy is coming" teaser instead of the
// home page. Card links (card.html), videos (v.html) and the control panel are never affected, so customers'
// invitations keep working. Add ?preview to the address to see the real home page while maintenance is on.
const Maintenance = (() => {
  const skip = () => /[?&]preview\b/.test(location.search);
  let shown = false, timer = 0;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const CSS = `
  html.mt-on, html.mt-on body { overflow: hidden !important; height: 100%; }
  #mt { position: fixed; inset: 0; z-index: 2147483000; display: grid; place-items: safe center; overflow-x: hidden; overflow-y: auto; padding: 24px 16px;
    color: #f6ecd9; text-align: center; font-family: 'Space Grotesk', system-ui, sans-serif;
    background: radial-gradient(120% 80% at 50% 0%, #4a1235 0%, #1a0716 45%, #07040c 100%); }
  #mt * { box-sizing: border-box; }
  #mt .mt-glow { position: absolute; width: 70vmax; height: 70vmax; border-radius: 50%; filter: blur(80px); opacity: .45; pointer-events: none;
    background: conic-gradient(from 0deg, #ff3d8b, #ffb547, #8b5cf6, #ff3d8b); animation: mtSpin 18s linear infinite; }
  #mt canvas { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
  #mt .mt-box { position: relative; max-width: 640px; display: grid; justify-items: center; gap: clamp(10px, 2.2vh, 18px); }
  @media (max-height: 820px) and (min-width: 700px) { #mt .mt-orb { width: 72px; height: 72px; font-size: 2rem; } #mt h1 br { display: none; } }
  #mt .mt-brand { display: inline-flex; align-items: center; gap: 10px; font: 600 .78rem/1 inherit; letter-spacing: .42em; text-transform: uppercase; color: #e9c46a; }
  #mt .mt-brand::before, #mt .mt-brand::after { content: ''; width: 34px; height: 1px; background: linear-gradient(90deg, transparent, #e9c46a); }
  #mt .mt-brand::after { transform: scaleX(-1); }
  #mt .mt-orb { width: 96px; height: 96px; border-radius: 50%; display: grid; place-items: center; font-size: 2.6rem;
    background: radial-gradient(circle at 35% 30%, #fff6d8, #e9b949 40%, #8a5a10 100%); box-shadow: 0 0 0 8px rgba(233,185,73,.12), 0 0 60px rgba(255,181,71,.55);
    animation: mtPulse 2.6s ease-in-out infinite; }
  #mt h1 { margin: 0; font: 800 clamp(2.2rem, min(9vw, 7.5vh), 4.6rem)/1.02 'Unbounded', 'Space Grotesk', sans-serif; letter-spacing: -.01em;
    background: linear-gradient(100deg, #fff 0%, #ffd27a 30%, #ff7aa8 55%, #b98cff 80%, #fff 100%); background-size: 220% 100%;
    -webkit-background-clip: text; background-clip: text; color: transparent; animation: mtShine 5s linear infinite; }
  #mt .mt-rot { height: 1.6em; overflow: hidden; font: italic 500 clamp(1.15rem, 4.4vw, 1.6rem)/1.6 'Cormorant Garamond', Georgia, serif; color: #f3dca8; }
  #mt .mt-rot span { display: block; animation: mtRot 12s cubic-bezier(.7,0,.2,1) infinite; }
  #mt p.mt-msg { margin: 0; max-width: 46ch; font-size: 1.02rem; line-height: 1.6; color: #d9c6d4; }
  #mt .mt-cd { display: flex; gap: 10px; }
  #mt .mt-cd div { min-width: 70px; padding: 12px 8px 10px; border-radius: 16px; border: 1px solid rgba(233,185,73,.35); background: rgba(255,255,255,.05); backdrop-filter: blur(6px); }
  #mt .mt-cd b { display: block; font: 700 1.7rem/1 'Unbounded', sans-serif; color: #ffd27a; }
  #mt .mt-cd small { font-size: .68rem; letter-spacing: .2em; text-transform: uppercase; color: #bfa9b8; }
  #mt .mt-bar { width: min(320px, 80vw); height: 4px; border-radius: 4px; background: rgba(255,255,255,.1); overflow: hidden; }
  #mt .mt-bar i { display: block; height: 100%; width: 40%; border-radius: 4px; background: linear-gradient(90deg, #ffb547, #ff3d8b, #8b5cf6); animation: mtLoad 2.4s ease-in-out infinite; }
  #mt .mt-acts { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-top: 4px; }
  #mt .mt-acts a { display: inline-flex; align-items: center; gap: 8px; padding: 13px 22px; border-radius: 999px; font-weight: 700; text-decoration: none; }
  #mt .mt-wa { color: #2a1400; background: linear-gradient(135deg, #ffd27a, #e9a23b); box-shadow: 0 10px 30px rgba(233,162,59,.35); }
  #mt .mt-ig { color: #f6ecd9; border: 1px solid rgba(246,236,217,.35); }
  #mt .mt-sig { margin-top: 10px; font-size: .7rem; letter-spacing: .3em; text-transform: uppercase; color: #a8909f; }
  #mt .mt-sig b { display: block; margin-top: 4px; font: 400 1.9rem/1 'Great Vibes', 'Dancing Script', cursive; letter-spacing: 0; text-transform: none; color: #e9c46a; }
  #mt .mt-in { animation: mtIn 1s cubic-bezier(.2,.8,.2,1) both; animation-delay: calc(var(--d, 0) * 120ms); }
  @keyframes mtSpin { to { transform: rotate(360deg); } }
  @keyframes mtPulse { 50% { transform: scale(1.06); box-shadow: 0 0 0 14px rgba(233,185,73,.08), 0 0 90px rgba(255,181,71,.7); } }
  @keyframes mtShine { to { background-position: -220% 0; } }
  @keyframes mtLoad { 0% { transform: translateX(-110%); } 100% { transform: translateX(260%); } }
  @keyframes mtIn { from { opacity: 0; transform: translateY(24px); filter: blur(6px); } to { opacity: 1; transform: none; filter: none; } }
  @keyframes mtRot { 0%, 18% { transform: translateY(0); } 25%, 43% { transform: translateY(-100%); } 50%, 68% { transform: translateY(-200%); } 75%, 93% { transform: translateY(-300%); } 100% { transform: translateY(-400%); } }
  @media (prefers-reduced-motion: reduce) { #mt *, #mt .mt-glow { animation: none !important; } }`;

  // Gold sparkles drifting upwards
  function sparkles(cv) {
    const c = cv.getContext('2d'), P = [];
    const fit = () => { const k = Math.min(devicePixelRatio || 1, 2); cv.width = innerWidth * k; cv.height = innerHeight * k; c.setTransform(k, 0, 0, k, 0, 0); };
    fit(); addEventListener('resize', fit);
    for (let i = 0; i < 70; i++) P.push({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, r: .6 + Math.random() * 2, v: .2 + Math.random() * .6, t: Math.random() * 6 });
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const tick = () => {
      if (!document.getElementById('mt')) return;
      c.clearRect(0, 0, innerWidth, innerHeight);
      for (const p of P) {
        p.y -= p.v; p.t += .03; if (p.y < -10) { p.y = innerHeight + 10; p.x = Math.random() * innerWidth; }
        c.globalAlpha = .35 + .35 * Math.sin(p.t); c.fillStyle = p.r > 2 ? '#fff3c4' : '#ffc95e';
        c.beginPath(); c.arc(p.x, p.y, p.r, 0, 7); c.fill();
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function countdown(box, until) {
    const end = new Date(until).getTime();
    if (!until || isNaN(end) || end <= Date.now()) return;
    box.hidden = false;
    const tick = () => {
      const ms = Math.max(0, end - Date.now());
      const v = { d: Math.floor(ms / 864e5), h: Math.floor(ms / 36e5) % 24, m: Math.floor(ms / 6e4) % 60, s: Math.floor(ms / 1e3) % 60 };
      for (const k in v) box.querySelector(`[data-u=${k}]`).textContent = String(v[k]).padStart(2, '0');
      if (!ms) clearInterval(timer);
    };
    tick(); timer = setInterval(tick, 1000);
  }

  function show(site) {
    if (shown) return;
    shown = true;
    const st = document.createElement('style'); st.id = 'mtCss'; st.textContent = CSS; document.head.appendChild(st);
    const font = document.createElement('link'); font.rel = 'stylesheet';
    font.href = 'https://fonts.googleapis.com/css2?family=Unbounded:wght@700;800&family=Cormorant+Garamond:ital,wght@1,500&family=Great+Vibes&family=Space+Grotesk:wght@400;600;700&display=swap';
    document.head.appendChild(font);
    document.documentElement.classList.add('mt-on');
    const wa = String(site.whatsapp || '').replace(/\D/g, '');
    const ig = String(site.instagram || '').replace(/^@/, '');
    const el = document.createElement('div');
    el.id = 'mt'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Coming soon');
    el.innerHTML = `
      <div class="mt-glow" aria-hidden="true"></div><canvas aria-hidden="true"></canvas>
      <div class="mt-box">
        <p class="mt-brand mt-in">${esc(site.brand || 'CardAlbum')}</p>
        <div class="mt-orb mt-in" style="--d:1" aria-hidden="true">✨</div>
        <h1 class="mt-in" style="--d:2">Something crazy <br>is coming</h1>
        <div class="mt-rot mt-in" style="--d:3" aria-hidden="true"><span>Premium invitation videos…<br>Cinematic love stories…<br>Hand-made card links…<br>All-new designs…<br>Premium invitation videos…</span></div>
        <p class="mt-msg mt-in" style="--d:4">${esc(site.maintenanceMsg || 'We are crafting an all-new, premium CardAlbum for every celebration. Back very soon, bigger and better than ever.')}</p>
        <div class="mt-cd mt-in" style="--d:5" hidden><div><b data-u="d">00</b><small>Days</small></div><div><b data-u="h">00</b><small>Hours</small></div><div><b data-u="m">00</b><small>Mins</small></div><div><b data-u="s">00</b><small>Secs</small></div></div>
        <div class="mt-bar mt-in" style="--d:5" aria-hidden="true"><i></i></div>
        <div class="mt-acts mt-in" style="--d:6">
          ${wa ? `<a class="mt-wa" href="https://wa.me/${wa}?text=${encodeURIComponent('Hi! I want an invitation made.')}" target="_blank" rel="noopener">💬 Order on WhatsApp</a>` : ''}
          ${ig ? `<a class="mt-ig" href="https://instagram.com/${encodeURIComponent(ig)}" target="_blank" rel="noopener">📸 Instagram</a>` : ''}
        </div>
        <p class="mt-sig mt-in" style="--d:7">Designed by<b>${esc(site.designer || 'Sankalp')}</b></p>
      </div>`;
    (document.body || document.documentElement).appendChild(el);
    sparkles(el.querySelector('canvas'));
    countdown(el.querySelector('.mt-cd'), site.maintenanceUntil);
  }

  function hide() {
    if (!shown) return;
    shown = false; clearInterval(timer);
    document.getElementById('mt')?.remove();
    document.getElementById('mtCss')?.remove();
    document.documentElement.classList.remove('mt-on');
  }

  // Called with the site settings: from js/config.js at load, and again when the live settings arrive.
  function apply(site) {
    if (skip()) return;
    if (site && site.maintenance === true) show(site); else hide();
  }
  return { apply };
})();
if (typeof SITE !== 'undefined') {
  if (document.body) Maintenance.apply(SITE);
  else document.addEventListener('DOMContentLoaded', () => Maintenance.apply(SITE));
}
