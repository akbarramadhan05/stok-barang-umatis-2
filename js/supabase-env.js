/**
 * Supabase + helper global — HARUS dimuat paling awal di setiap halaman.
 */
window.SUPABASE_URL = window.SUPABASE_URL || "https://klblycxszklteapdfwyf.supabase.co";
window.SUPABASE_ANON_KEY =
  window.SUPABASE_ANON_KEY || "sb_publishable_McbDBTwIW6jnG0BUxquqFw_AqSgyZ3T";

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
