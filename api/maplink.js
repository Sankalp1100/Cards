// Turns a short Google Maps link (maps.app.goo.gl/…) into the full google.com/maps link it points to.
// The short links can take 20+ seconds to redirect on some networks, so cards store the full link instead.
// Public (see middleware.js), but it only ever follows Google short links and only returns Google Maps links.
const SHORT = /^(maps\.app\.goo\.gl|goo\.gl)$/;
const MAPS = /^(www\.)?google\.[a-z.]+$|^maps\.google\.[a-z.]+$/;

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=86400');
  let url;
  try { url = new URL(String(req.query.u || '')); } catch (e) { return res.status(400).json({ error: 'bad link' }); }
  if (url.protocol !== 'https:' || !SHORT.test(url.hostname)) return res.status(400).json({ error: 'not a Google Maps short link' });
  try {
    for (let hop = 0; hop < 5; hop++) {
      const r = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(8000) });
      const next = r.headers.get('location');
      if (!next) break;
      url = new URL(next, url);
      if (MAPS.test(url.hostname) && url.pathname.startsWith('/maps')) return res.status(200).json({ url: url.href });
      if (!SHORT.test(url.hostname)) break;
    }
  } catch (e) { /* timed out or unreachable */ }
  res.status(404).json({ error: 'could not open the link' });
};
