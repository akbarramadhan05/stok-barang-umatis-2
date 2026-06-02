/**
 * Stokbar Umatis — Supabase client
 */
let _supabaseClient = null;

function normalizeSupabaseUrl(url) {
  if (!url || typeof url !== "string") return "";
  try {
    const u = new URL(url.trim().replace(/\/+$/, ""));
    if (!u.hostname.includes("supabase.co")) return "";
    return u.origin;
  } catch {
    return "";
  }
}

function getSupabaseUrl() {
  return normalizeSupabaseUrl(window.SUPABASE_URL || "");
}

function getSupabaseKey() {
  const key = (window.SUPABASE_ANON_KEY || "").trim().replace(/^["']|["']$/g, "");
  return key;
}

function isSupabaseConfigured() {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  return (
    url.length > 10 &&
    key.length > 20 &&
    !key.includes("ISI_ANON") &&
    (key.startsWith("eyJ") || key.startsWith("sb_publishable_"))
  );
}

function getSupabase() {
  if (!isSupabaseConfigured()) return null;
  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  if (!_supabaseClient && window.supabase) {
    _supabaseClient = window.supabase.createClient(url, key);
  }
  return _supabaseClient;
}

/** Login via REST jika RPC client error (mis. Invalid path) */
async function supabaseRpcLogin(username, password) {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  const headers = {
    apikey: key,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
  if (key.startsWith("eyJ")) {
    headers.Authorization = `Bearer ${key}`;
  }
  const res = await fetch(`${url}/rest/v1/rpc/login_user`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      p_username: username,
      p_password: password,
    }),
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg =
      (data && data.message) ||
      (data && data.error) ||
      text ||
      `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return typeof data === "string" ? JSON.parse(data) : data;
}

const USE_SUPABASE = isSupabaseConfigured();

function supabaseRestHeaders() {
  const key = getSupabaseKey();
  const headers = { apikey: key, Accept: "application/json" };
  if (key.startsWith("eyJ")) headers.Authorization = `Bearer ${key}`;
  return headers;
}

/** GET tabel via REST (lebih andal jika URL client salah / publishable key) */
async function supabaseRestGet(table, query = "select=*") {
  const base = getSupabaseUrl();
  if (!base) throw new Error("SUPABASE_URL tidak valid");
  const sep = query.startsWith("?") ? "" : "?";
  const res = await fetch(`${base}/rest/v1/${table}${sep}${query}`, {
    headers: supabaseRestHeaders(),
  });
  const text = await res.text();
  let data = [];
  try {
    data = text ? JSON.parse(text) : [];
  } catch {
    data = null;
  }
  if (!res.ok) {
    const msg =
      (data && data.message) || (typeof data === "string" ? data : text) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return Array.isArray(data) ? data : [];
}

async function testSupabaseConnection() {
  if (!isSupabaseConfigured()) throw new Error("Supabase belum dikonfigurasi");
  await Promise.race([
    supabaseRestGet("settings", "select=setting_key&limit=1"),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Koneksi Supabase timeout")), 8000)
    ),
  ]);
  return true;
}
