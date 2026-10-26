// Connection to the Supabase database: the owner's login, the live catalog and settings, orders and invite history.
// The key below is the PUBLIC (anon) key: it is meant to be in the browser. What anyone can read or change is
// decided by the database's security rules (supabase/schema.sql): visitors may read the catalog and place an
// order; only the logged-in owner may change anything or see orders.
const DB = (() => {
  const URL = 'https://ozaaltohnihlpmywinah.supabase.co';
  const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96YWFsdG9obmlobHBteXdpbmFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5NDE2NDgsImV4cCI6MjEwODUxNzY0OH0.rTyJqHJ-gd7g9W0NW-VFe1LWmMRrwcJtA_beLQENMmg';
  const SESSION_KEY = 'weddingcard.session';

  let session = null;
  try { session = JSON.parse(localStorage.getItem(SESSION_KEY)); } catch (e) { /* no saved login */ }
  const keep = s => {
    session = s;
    try { if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s)); else localStorage.removeItem(SESSION_KEY); } catch (e) { /* private mode */ }
  };
  const withExpiry = s => ({ ...s, expires_at: s.expires_at || Math.floor(Date.now() / 1000) + (s.expires_in || 3600) });

  async function call(path, { method = 'GET', body, auth = true, prefer, keepalive = false, timeout = 10000 } = {}) {
    if (auth) await fresh();
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeout);
    try {
      const headers = { apikey: KEY, Authorization: `Bearer ${auth && session ? session.access_token : KEY}`, 'Content-Type': 'application/json' };
      if (prefer) headers.Prefer = prefer;
      const res = await fetch(URL + path, { method, headers, keepalive, signal: ctrl.signal, body: body === undefined ? undefined : JSON.stringify(body) });
      const text = await res.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
      if (!res.ok) throw new Error((data && (data.msg || data.message || data.error_description || data.error)) || `${res.status} ${res.statusText}`);
      return data;
    } finally {
      clearTimeout(timer);
    }
  }

  // Renews the login a minute before it runs out (logins last an hour; the refresh keeps you logged in).
  let refreshing = null;
  async function fresh() {
    if (!session || session.expires_at * 1000 > Date.now() + 60000) return;
    refreshing = refreshing || call('/auth/v1/token?grant_type=refresh_token', { method: 'POST', auth: false, body: { refresh_token: session.refresh_token } })
      .then(s => keep(withExpiry(s)), () => keep(null))
      .finally(() => { refreshing = null; });
    await refreshing;
  }

  return {
    get user() { return session && session.user; },

    async signIn(email, password) {
      keep(withExpiry(await call('/auth/v1/token?grant_type=password', { method: 'POST', auth: false, body: { email: email.trim(), password } })));
      return session.user;
    },
    async signOut() {
      try { await call('/auth/v1/logout', { method: 'POST' }); } catch (e) { /* already logged out */ }
      keep(null);
    },
    // "Forgot password": Supabase emails a link back to the control panel.
    recover(email, redirectTo) {
      return call(`/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`, { method: 'POST', auth: false, body: { email: email.trim() } });
    },
    // Invite and password-reset links arrive as #access_token=…&type=invite|recovery: log in with them.
    async fromLink(hash) {
      const p = new URLSearchParams(String(hash || '').replace(/^#/, ''));
      if (!p.get('access_token')) return null;
      const s = withExpiry({ access_token: p.get('access_token'), refresh_token: p.get('refresh_token'), expires_in: +p.get('expires_in') || 3600 });
      keep(s);
      keep({ ...s, user: await call('/auth/v1/user') });
      return p.get('type');
    },
    async setPassword(password) {
      keep({ ...session, user: await call('/auth/v1/user', { method: 'PUT', body: { password } }) });
    },
    isOwner() { return call('/rest/v1/rpc/is_owner', { method: 'POST', body: {} }); },
    // A short invitation link's card (cardalbum.vercel.app/i#Xy7Kq2p), by its exact code only.
    getCard(code) { return call('/rest/v1/rpc/get_card', { method: 'POST', auth: false, body: { code } }); },

    // Table helpers (PostgREST). `auth: false` = as a visitor.
    select(table, query = 'select=*', opts = {}) { return call(`/rest/v1/${table}?${query}`, opts); },
    insert(table, rows, opts = {}) { return call(`/rest/v1/${table}`, { method: 'POST', body: rows, prefer: 'return=minimal', ...opts }); },
    upsert(table, rows) { return call(`/rest/v1/${table}`, { method: 'POST', body: rows, prefer: 'resolution=merge-duplicates,return=minimal' }); },
    update(table, filter, patch) { return call(`/rest/v1/${table}?${filter}`, { method: 'PATCH', body: patch, prefer: 'return=minimal' }); },
    remove(table, filter) { return call(`/rest/v1/${table}?${filter}`, { method: 'DELETE', prefer: 'return=minimal' }); },

    // The website's live settings and catalog, merged over js/config.js (which stays as the fallback).
    async loadCatalog(opts = { auth: false, timeout: 4000 }) {
      const [settings, rows] = await Promise.all([
        this.select('site_settings', 'select=data&id=eq.1', opts),
        this.select('catalog', 'select=design_no,data', opts)
      ]);
      const site = { ...((settings[0] && settings[0].data) || {}) };
      // The brand was renamed from "Wedding Card" to "CardAlbum"; settings saved before that still say the old name.
      // (The new name is stored with the next settings change.)
      if (site.brand === 'Wedding Card') site.brand = 'CardAlbum';
      return { site, catalog: Object.fromEntries(rows.map(r => [r.design_no, r.data])) };
    }
  };
})();
