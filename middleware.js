// Vercel Routing Middleware: puts the admin panel and its API behind a login on the live site (HTTP Basic Auth).
// The browser shows a login box. User name: ADMIN_USER in Vercel, otherwise ADMIN_USER_DEFAULT below.
// Password: ADMIN_PASSWORD in Vercel, otherwise the one whose salted SHA-256 is ADMIN_HASH below.
// Setting both in Vercel (Settings → Environment Variables) keeps them out of this public code.
export const config = { matcher: ['/admin', '/admin.html', '/js/admin.js', '/css/admin.css', '/api/:path*'] };

const SALT = 'wedding-card-admin:';
const ADMIN_USER_DEFAULT = 'card.com';
const ADMIN_HASH = 'c5d3ec6e9f4df866229c6d78dafbb997f8ddb407b5b22c8e84614e8d1250e446';

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

// Constant-time comparison of two hex strings of equal length.
function same(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function loginOk(header, env = {}) {
  const [scheme, value] = String(header || '').split(' ');
  if (scheme !== 'Basic' || !value) return false;
  let decoded;
  try { decoded = new TextDecoder().decode(Uint8Array.from(atob(value), c => c.charCodeAt(0))); } catch (e) { return false; }
  const colon = decoded.indexOf(':');
  if (colon < 0) return false;
  const user = decoded.slice(0, colon).trim().toLowerCase(), password = decoded.slice(colon + 1);
  const expectedUser = (env.user || ADMIN_USER_DEFAULT).trim().toLowerCase();
  const expectedPass = env.password ? await sha256(SALT + env.password) : ADMIN_HASH;
  // Both are always checked, so a wrong user name takes as long as a wrong password.
  const userOk = same(await sha256(SALT + user), await sha256(SALT + expectedUser));
  const passOk = same(await sha256(SALT + password), expectedPass);
  return userOk && passOk;
}

export default async function middleware(request) {
  const env = typeof process !== 'undefined' ? { user: process.env.ADMIN_USER, password: process.env.ADMIN_PASSWORD } : {};
  if (await loginOk(request.headers.get('authorization'), env)) return; // carry on to the file
  return new Response('Login needed for the admin panel.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Wedding Card admin", charset="UTF-8"', 'Cache-Control': 'no-store' }
  });
}
