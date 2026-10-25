// Vercel Routing Middleware: puts the admin panel and its API behind a password on the live site (HTTP Basic Auth).
// The browser shows a login box; any user name works. The password is the ADMIN_PASSWORD environment variable
// in Vercel when it is set, otherwise the one whose salted SHA-256 is ADMIN_HASH below.
export const config = { matcher: ['/admin', '/admin.html', '/js/admin.js', '/css/admin.css', '/api/:path*'] };

const SALT = 'wedding-card-admin:';
const ADMIN_HASH = '04719cf493bfd908f17f453c376771d2b55cb68ebc2b2f51686ac449c01f2f6a';

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

export async function passwordOk(header, envPassword) {
  const [scheme, value] = String(header || '').split(' ');
  if (scheme !== 'Basic' || !value) return false;
  let decoded;
  try { decoded = new TextDecoder().decode(Uint8Array.from(atob(value), c => c.charCodeAt(0))); } catch (e) { return false; }
  const password = decoded.slice(decoded.indexOf(':') + 1);
  const expected = envPassword ? await sha256(SALT + envPassword) : ADMIN_HASH;
  return same(await sha256(SALT + password), expected);
}

export default async function middleware(request) {
  const env = typeof process !== 'undefined' ? process.env.ADMIN_PASSWORD : '';
  if (await passwordOk(request.headers.get('authorization'), env)) return; // carry on to the file
  return new Response('Password needed for the admin panel.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Wedding Card admin", charset="UTF-8"', 'Cache-Control': 'no-store' }
  });
}
