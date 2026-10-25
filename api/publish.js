// Publish from the online admin panel: saves js/config.js to GitHub, and Vercel redeploys the site by itself.
// Needs these Vercel environment variables: GITHUB_TOKEN (fine-grained token with "Contents: read and write"
// on the repo) and optionally GITHUB_REPO (default Sankalp1100/Cards) and GITHUB_BRANCH (default main).
// Password-protected by middleware.js.
const { checkConfig } = require('./_check');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ message: 'POST only' });
  // Same-origin only: another website open in the browser must not be able to publish.
  if (req.headers.origin && new URL(req.headers.origin).host !== req.headers.host) return res.status(403).json({ message: 'Forbidden' });

  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO || 'Sankalp1100/Cards';
  const branch = process.env.GITHUB_BRANCH || 'main';
  let text, SITE;
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    text = body && body.config;
    ({ SITE } = checkConfig(text));
  } catch (e) {
    return res.status(400).json({ saved: false, published: false, message: e.message });
  }
  if (!token) return res.status(200).json({ saved: false, published: false, message: 'Publishing from the website needs GITHUB_TOKEN in Vercel → Settings → Environment Variables (see README).' });

  const url = `https://api.github.com/repos/${repo}/contents/js/config.js`;
  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'wedding-card-admin' };
  try {
    const current = await fetch(`${url}?ref=${encodeURIComponent(branch)}`, { headers });
    if (!current.ok) throw new Error(`GitHub said ${current.status} when reading config.js`);
    const file = await current.json();
    if (Buffer.from(file.content, 'base64').toString('utf8') === text) {
      return res.status(200).json({ saved: true, published: true, message: 'No changes to publish: the website already has these settings.', url: SITE.url });
    }
    const put = await fetch(url, {
      method: 'PUT', headers,
      body: JSON.stringify({ message: 'Update site settings and design catalog', content: Buffer.from(text, 'utf8').toString('base64'), sha: file.sha, branch })
    });
    if (!put.ok) throw new Error(`GitHub said ${put.status}: ${(await put.text()).slice(0, 200)}`);
    return res.status(200).json({ saved: true, published: true, message: 'Published. Vercel updates the live site in about a minute.', url: SITE.url });
  } catch (e) {
    return res.status(502).json({ saved: false, published: false, message: 'Could not publish: ' + e.message });
  }
};
