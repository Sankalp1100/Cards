// Tells the online admin panel whether it can publish (password-protected by middleware.js).
module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ ok: true, online: true, git: !!process.env.GITHUB_TOKEN });
};
