/**
 * Stokbar Umatis — Authentication
 */

/* Fallback jika data.js / storage.js gagal dimuat (mis. deploy Vercel belum lengkap) */
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
if (typeof ROLES === "undefined") {
  var ROLES = { ADMIN: "admin", OWNER: "owner", BARISTA: "barista" };
}
if (typeof DEFAULT_USERS === "undefined") {
  var DEFAULT_USERS = [
    { id: "u1", username: "admin", password: "admin123", name: "Budi Admin", role: "admin" },
    { id: "u2", username: "owner", password: "owner123", name: "Sari Owner", role: "owner" },
    { id: "u3", username: "barista", password: "barista123", name: "Andi Barista", role: "barista" },
  ];
}
if (typeof USE_SUPABASE === "undefined") {
  var USE_SUPABASE = false;
}
if (typeof clearLegacyBrowserCache === "undefined") {
  function clearLegacyBrowserCache() {
    if (typeof USE_SUPABASE !== "undefined" && USE_SUPABASE) {
      ["stokbar_inventory", "stokbar_transactions", "stokbar_suppliers", "stokbar_users", "stokbar_settings"].forEach(
        (k) => localStorage.removeItem(k)
      );
    }
  }
}

const PAGE_PERMISSIONS = {
  "dashboard.html": [ROLES.ADMIN, ROLES.OWNER, ROLES.BARISTA],
  "inventory.html": [ROLES.ADMIN, ROLES.OWNER, ROLES.BARISTA],
  "katalog.html": [ROLES.ADMIN, ROLES.OWNER, ROLES.BARISTA],
  "transaction-in.html": [ROLES.ADMIN, ROLES.BARISTA],
  "transaction-out.html": [ROLES.ADMIN, ROLES.BARISTA],
  "suppliers.html": [ROLES.ADMIN, ROLES.OWNER],
  "reports.html": [ROLES.ADMIN, ROLES.OWNER],
  "users.html": [ROLES.ADMIN],
  "settings.html": [ROLES.ADMIN],
};

const NAV_ITEMS = [
  { href: "dashboard.html", label: "Dashboard", icon: "📊", roles: [ROLES.ADMIN, ROLES.OWNER, ROLES.BARISTA], section: "Utama" },
  { href: "katalog.html", label: "Katalog Barang", icon: "📋", roles: [ROLES.ADMIN, ROLES.OWNER, ROLES.BARISTA], section: "Utama" },
  { href: "inventory.html", label: "Stok Barang", icon: "📦", roles: [ROLES.ADMIN, ROLES.OWNER, ROLES.BARISTA], section: "Utama" },
  { href: "transaction-in.html", label: "Barang Masuk", icon: "📥", roles: [ROLES.ADMIN, ROLES.BARISTA], section: "Transaksi" },
  { href: "transaction-out.html", label: "Barang Keluar", icon: "📤", roles: [ROLES.ADMIN, ROLES.BARISTA], section: "Transaksi" },
  { href: "suppliers.html", label: "Data Supplier", icon: "🏪", roles: [ROLES.ADMIN, ROLES.OWNER], section: "Manajemen" },
  { href: "reports.html", label: "Laporan", icon: "📈", roles: [ROLES.ADMIN, ROLES.OWNER], section: "Manajemen" },
  { href: "users.html", label: "Manajemen User", icon: "👥", roles: [ROLES.ADMIN], section: "Admin" },
  { href: "settings.html", label: "Pengaturan", icon: "⚙️", roles: [ROLES.ADMIN], section: "Admin" },
];

function getSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.session);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setSession(user) {
  const { password, ...safe } = user;
  sessionStorage.setItem(STORAGE_KEYS.session, JSON.stringify(safe));
}

function clearSession() {
  sessionStorage.removeItem(STORAGE_KEYS.session);
}

async function login(username, password) {
  if (USE_SUPABASE) {
    try {
      const sb = getSupabase();
      const { data, error } = await sb.rpc("login_user", {
        p_username: username,
        p_password: password,
      });
      if (error) throw error;
      const user = typeof data === "string" ? JSON.parse(data) : data;
      setSession(user);
      clearLegacyBrowserCache();
      return { success: true, user };
    } catch (e) {
      return { success: false, message: e.message || "Login gagal." };
    }
  }
  if (typeof USE_API !== "undefined" && USE_API) {
    try {
      const res = await apiPost("login", { username, password });
      setSession(res.user);
      return { success: true, user: res.user };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }
  const users = getJSON(STORAGE_KEYS.users, DEFAULT_USERS);
  const user = users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
  );
  if (!user) return { success: false, message: "Username atau password salah." };
  setSession(user);
  return { success: true, user };
}

async function logout() {
  if (typeof USE_API !== "undefined" && USE_API) {
    try { await apiPost("logout"); } catch (_) {}
  }
  clearSession();
  window.location.href = "login.html";
}

function requireAuth() {
  const session = getSession();
  if (!session) {
    window.location.href = "login.html";
    return null;
  }
  const page = window.location.pathname.split("/").pop() || "dashboard.html";
  const allowed = PAGE_PERMISSIONS[page];
  if (allowed && !allowed.includes(session.role)) {
    window.location.href = "dashboard.html";
    return null;
  }
  return session;
}

function isReadOnly() {
  return getSession()?.role === ROLES.OWNER;
}

function canEdit() {
  return getSession()?.role === ROLES.ADMIN;
}

function canEditCatalog() {
  return getSession()?.role === ROLES.ADMIN;
}

function canTransact() {
  const r = getSession()?.role;
  return r === ROLES.ADMIN || r === ROLES.BARISTA;
}

function roleBadgeClass(role) {
  const map = { admin: "badge-role-admin", owner: "badge-role-owner", barista: "badge-role-barista" };
  return map[role] || "badge-info";
}
