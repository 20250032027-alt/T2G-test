/* ============================================================
   T2G database helper (public pages)
   Talks to Supabase through the public functions defined in
   supabase/schema.sql. No library needed; plain fetch.
   Needs assets/site-config.js loaded first.
   ============================================================ */
(function () {
  const CFG = window.T2G_CONFIG || {};

  function enabled() {
    return Boolean(CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY);
  }

  function base() {
    return String(CFG.SUPABASE_URL || '').replace(/\/$/, '');
  }

  /* New-style keys (sb_publishable_...) go in the apikey header only;
     legacy anon keys (eyJ...) are also sent as a Bearer token. */
  function headers(extra) {
    const h = Object.assign({ apikey: CFG.SUPABASE_ANON_KEY }, extra || {});
    if (/^eyJ/.test(CFG.SUPABASE_ANON_KEY || '')) h.Authorization = 'Bearer ' + CFG.SUPABASE_ANON_KEY;
    return h;
  }

  function withTimeout(ms) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    return { signal: ctrl.signal, done: () => clearTimeout(t) };
  }

  /* Error with a message that is safe to show customers.
     Messages raised in our SQL functions (code P0001) are written for people;
     anything else becomes a generic message. */
  class DbError extends Error {
    constructor(message, opts) {
      super(message);
      this.userFacing = Boolean(opts && opts.userFacing);
      this.status = opts && opts.status;
    }
  }

  async function rpc(fn, args, opts) {
    if (!enabled()) throw new DbError('Database not configured');
    const t = withTimeout((opts && opts.timeout) || 12000);
    let res;
    try {
      res = await fetch(`${base()}/rest/v1/rpc/${fn}`, {
        method: 'POST',
        headers: headers({ 'Content-Type': 'application/json', Accept: 'application/json' }),
        body: JSON.stringify(args || {}),
        signal: t.signal,
      });
    } catch (e) {
      throw new DbError('Network error', { status: 0 });
    } finally {
      t.done();
    }
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
    if (!res.ok) {
      const isOurs = data && data.code === 'P0001' && data.message;
      throw new DbError(isOurs ? data.message : 'Request failed', { userFacing: Boolean(isOurs), status: res.status });
    }
    return data;
  }

  async function upload(bucket, path, blob) {
    if (!enabled()) throw new DbError('Database not configured');
    const t = withTimeout(60000);
    try {
      const res = await fetch(`${base()}/storage/v1/object/${bucket}/${path}`, {
        method: 'POST',
        headers: headers({ 'Content-Type': blob.type || 'application/octet-stream', 'x-upsert': 'false' }),
        body: blob,
        signal: t.signal,
      });
      if (!res.ok) throw new DbError('Upload failed', { status: res.status });
      return true;
    } catch (e) {
      if (e instanceof DbError) throw e;
      throw new DbError('Network error', { status: 0 });
    } finally {
      t.done();
    }
  }

  window.T2G_DB = { enabled, rpc, upload, DbError };
})();
