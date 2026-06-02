/**
 * Supabase + helper global — HARUS dimuat paling awal di setiap halaman.
 */
(function () {
  const DEFAULT_URL = "https://klblycxszklteapdfwyf.supabase.co";

  function normalizeSupabaseUrl(url) {
    if (!url || typeof url !== "string") return "";
    const trimmed = url.trim().replace(/\/+$/, "");
    try {
      const u = new URL(trimmed);
      if (!u.hostname.includes("supabase.co")) return "";
      return u.origin;
    } catch {
      return "";
    }
  }

  function normalizeKey(key) {
    if (!key || typeof key !== "string") return "";
    return key.trim().replace(/^["']|["']$/g, "");
  }

  window.SUPABASE_URL =
    normalizeSupabaseUrl(window.SUPABASE_URL) || DEFAULT_URL;
  window.SUPABASE_ANON_KEY = normalizeKey(window.SUPABASE_ANON_KEY) || "";

  window.STORAGE_KEYS = window.STORAGE_KEYS || {
    users: "stokbar_users",
    session: "stokbar_session",
    inventory: "stokbar_inventory",
    transactions: "stokbar_transactions",
    suppliers: "stokbar_suppliers",
    settings: "stokbar_settings",
  };

  if (typeof window.getJSON !== "function") {
    window.getJSON = function (key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch {
        return fallback;
      }
    };
  }

  if (typeof window.setJSON !== "function") {
    window.setJSON = function (key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    };
  }
})();
