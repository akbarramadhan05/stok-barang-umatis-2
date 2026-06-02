/**
 * Stokbar Umatis — localStorage helpers (opsional, dimuat sebelum data.js)
 * Jika file ini gagal dimuat, data.js tetap menyediakan getJSON.
 */
if (typeof STORAGE_KEYS === "undefined") {
  var STORAGE_KEYS = {
    users: "stokbar_users",
    session: "stokbar_session",
    inventory: "stokbar_inventory",
    transactions: "stokbar_transactions",
    suppliers: "stokbar_suppliers",
    settings: "stokbar_settings",
  };
}

if (typeof getJSON === "undefined") {
  function getJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }
}

if (typeof setJSON === "undefined") {
  function setJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
