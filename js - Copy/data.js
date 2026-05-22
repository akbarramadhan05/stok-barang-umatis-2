/**
 * Stokbar Umatis — Data layer (MySQL via API / fallback localStorage)
 */

const STORAGE_KEYS = {
  users: "stokbar_users",
  session: "stokbar_session",
  inventory: "stokbar_inventory",
  transactions: "stokbar_transactions",
  suppliers: "stokbar_suppliers",
  settings: "stokbar_settings",
};

const ROLES = {
  ADMIN: "admin",
  OWNER: "owner",
  BARISTA: "barista",
};

const ROLE_LABELS = {
  admin: "Admin",
  owner: "Owner",
  barista: "Tim Barista",
};

const CATEGORIES = [
  "Biji Kopi",
  "Susu",
  "Sirup",
  "Cup & Kemasan",
  "Bahan Pendukung",
  "Snack",
];

const DataCache = {
  inventory: [],
  suppliers: [],
  transactions: [],
  users: [],
  settings: null,
};

// --- localStorage fallback (file:// atau API mati) ---
const DEFAULT_USERS = [
  { id: "u1", username: "admin", password: "admin123", name: "Budi Admin", role: ROLES.ADMIN },
  { id: "u2", username: "owner", password: "owner123", name: "Sari Owner", role: ROLES.OWNER },
  { id: "u3", username: "barista", password: "barista123", name: "Andi Barista", role: ROLES.BARISTA },
];

function getJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function initLocalData() {
  if (!localStorage.getItem(STORAGE_KEYS.users)) setJSON(STORAGE_KEYS.users, DEFAULT_USERS);
  if (!localStorage.getItem(STORAGE_KEYS.inventory)) {
    setJSON(STORAGE_KEYS.inventory, [
      { id: "i1", name: "Arabica Gayo", category: "Biji Kopi", stock: 8.5, unit: "kg", minStock: 3 },
      { id: "i2", name: "Robusta Lampung", category: "Biji Kopi", stock: 12, unit: "kg", minStock: 5 },
    ]);
  }
  if (!localStorage.getItem(STORAGE_KEYS.suppliers)) setJSON(STORAGE_KEYS.suppliers, []);
  if (!localStorage.getItem(STORAGE_KEYS.transactions)) setJSON(STORAGE_KEYS.transactions, []);
  if (!localStorage.getItem(STORAGE_KEYS.settings)) {
    setJSON(STORAGE_KEYS.settings, { cafeName: "Stokbar Umatis", lowStockNotify: true, currency: "IDR" });
  }
}

function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// --- Load dari API ---
async function refreshInventory() {
  if (!USE_API) {
    DataCache.inventory = getJSON(STORAGE_KEYS.inventory, []);
    return DataCache.inventory;
  }
  const res = await apiGet("inventory");
  DataCache.inventory = res.data || [];
  return DataCache.inventory;
}

async function refreshSuppliers() {
  if (!USE_API) {
    DataCache.suppliers = getJSON(STORAGE_KEYS.suppliers, []);
    return DataCache.suppliers;
  }
  const res = await apiGet("suppliers");
  DataCache.suppliers = res.data || [];
  return DataCache.suppliers;
}

async function refreshTransactions(opts = {}) {
  if (!USE_API) {
    DataCache.transactions = getJSON(STORAGE_KEYS.transactions, []);
    return DataCache.transactions;
  }
  const res = await apiGet("transactions", opts);
  DataCache.transactions = res.data || [];
  return DataCache.transactions;
}

async function refreshUsers() {
  if (!USE_API) {
    DataCache.users = getJSON(STORAGE_KEYS.users, []);
    return DataCache.users;
  }
  const res = await apiGet("users");
  DataCache.users = res.data || [];
  return DataCache.users;
}

async function refreshSettings() {
  if (!USE_API) {
    DataCache.settings = getJSON(STORAGE_KEYS.settings, {});
    return DataCache.settings;
  }
  const res = await apiGet("settings");
  DataCache.settings = res.data;
  return DataCache.settings;
}

// --- Sync getters (setelah refresh) ---
function getInventory() {
  return USE_API ? DataCache.inventory : getJSON(STORAGE_KEYS.inventory, []);
}

function getSuppliers() {
  return USE_API ? DataCache.suppliers : getJSON(STORAGE_KEYS.suppliers, []);
}

function getTransactions() {
  return USE_API ? DataCache.transactions : getJSON(STORAGE_KEYS.transactions, []);
}

function getUsers() {
  return USE_API ? DataCache.users : getJSON(STORAGE_KEYS.users, []);
}

function getItemById(id) {
  return getInventory().find((i) => i.id === id);
}

function getLowStockItems() {
  return getInventory().filter((i) => i.stock <= i.minStock);
}

// --- Save / mutate ---
async function saveInventoryItem(data) {
  if (!USE_API) {
    let items = getJSON(STORAGE_KEYS.inventory, []);
    if (data.id) {
      const idx = items.findIndex((i) => i.id === data.id);
      items[idx] = { ...items[idx], ...data };
    } else {
      items.push({ id: generateId("i"), ...data });
    }
    setJSON(STORAGE_KEYS.inventory, items);
    DataCache.inventory = items;
    return;
  }
  await apiPost("inventory_save", data);
  await refreshInventory();
}

async function deleteInventoryItem(id) {
  if (!USE_API) {
    const items = getJSON(STORAGE_KEYS.inventory, []).filter((i) => i.id !== id);
    setJSON(STORAGE_KEYS.inventory, items);
    DataCache.inventory = items;
    return;
  }
  await apiPost("inventory_delete", { id });
  await refreshInventory();
}

/** @deprecated gunakan saveInventoryItem */
function saveInventory(items) {
  setJSON(STORAGE_KEYS.inventory, items);
  DataCache.inventory = items;
}

async function saveSupplierItem(data) {
  if (!USE_API) {
    let list = getJSON(STORAGE_KEYS.suppliers, []);
    if (data.id) {
      const idx = list.findIndex((s) => s.id === data.id);
      list[idx] = { ...list[idx], ...data };
    } else {
      list.push({ id: generateId("s"), ...data });
    }
    setJSON(STORAGE_KEYS.suppliers, list);
    DataCache.suppliers = list;
    return;
  }
  await apiPost("supplier_save", data);
  await refreshSuppliers();
}

async function deleteSupplierItem(id) {
  if (!USE_API) {
    const list = getJSON(STORAGE_KEYS.suppliers, []).filter((s) => s.id !== id);
    setJSON(STORAGE_KEYS.suppliers, list);
    DataCache.suppliers = list;
    return;
  }
  await apiPost("supplier_delete", { id });
  await refreshSuppliers();
}

/** @deprecated */
function saveSuppliers(suppliers) {
  setJSON(STORAGE_KEYS.suppliers, suppliers);
  DataCache.suppliers = suppliers;
}

async function saveUserItem(data) {
  if (!USE_API) {
    let users = getJSON(STORAGE_KEYS.users, []);
    if (data.id) {
      const idx = users.findIndex((u) => u.id === data.id);
      const row = { ...users[idx], name: data.name, username: data.username, role: data.role };
      if (data.password) row.password = data.password;
      users[idx] = row;
    } else {
      users.push({ id: generateId("u"), password: data.password, ...data });
    }
    setJSON(STORAGE_KEYS.users, users);
    DataCache.users = users;
    return;
  }
  await apiPost("user_save", data);
  await refreshUsers();
}

/** @deprecated */
function saveUsers(users) {
  setJSON(STORAGE_KEYS.users, users);
  DataCache.users = users;
}

async function saveSettings(data) {
  if (!USE_API) {
    setJSON(STORAGE_KEYS.settings, data);
    DataCache.settings = data;
    return;
  }
  await apiPost("settings_save", data);
  await refreshSettings();
}

async function addTransaction({ type, itemId, quantity, note, user }) {
  if (!USE_API) {
    const item = getItemById(itemId);
    if (!item) throw new Error("Barang tidak ditemukan");
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) throw new Error("Jumlah tidak valid");
    if (type === "out" && item.stock < qty) {
      throw new Error(`Stok tidak cukup. Tersedia: ${item.stock} ${item.unit}`);
    }
    let items = getJSON(STORAGE_KEYS.inventory, []);
    const idx = items.findIndex((i) => i.id === itemId);
    if (type === "in") items[idx].stock = Math.round((items[idx].stock + qty) * 100) / 100;
    else items[idx].stock = Math.round((items[idx].stock - qty) * 100) / 100;
    setJSON(STORAGE_KEYS.inventory, items);
    DataCache.inventory = items;
    const tx = {
      id: generateId("tx"),
      type,
      itemId,
      itemName: item.name,
      quantity: qty,
      unit: item.unit,
      note: note || "",
      userId: user.id,
      userName: user.name,
      date: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
    };
    const txs = getJSON(STORAGE_KEYS.transactions, []);
    txs.unshift(tx);
    setJSON(STORAGE_KEYS.transactions, txs);
    DataCache.transactions = txs;
    return tx;
  }
  const res = await apiPost("transaction_add", { type, itemId, quantity, note });
  await refreshInventory();
  return res.data;
}

function getChartData(days = 7) {
  const txs = getTransactions();
  const labels = [];
  const dataIn = [];
  const dataOut = [];
  const now = new Date();

  for (let d = days - 1; d >= 0; d--) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().slice(0, 10);
    const dayLabel = date.toLocaleDateString("id-ID", { weekday: "short" });
    labels.push(dayLabel);
    const dayTxs = txs.filter((t) => t.date === dateStr);
    dataIn.push(dayTxs.filter((t) => t.type === "in").reduce((s, t) => s + t.quantity, 0));
    dataOut.push(dayTxs.filter((t) => t.type === "out").reduce((s, t) => s + t.quantity, 0));
  }
  return { labels, dataIn, dataOut };
}

function formatStock(value, unit) {
  const n = Number(value);
  if (unit === "pcs") return `${Math.round(n)} ${unit}`;
  return `${n % 1 === 0 ? n : n.toFixed(1)} ${unit}`;
}

function getStockBadge(item) {
  if (item.stock <= item.minStock * 0.5) return "danger";
  if (item.stock <= item.minStock) return "warning";
  return "success";
}

function showDataError(err) {
  const msg = err?.message || "Gagal memuat data dari database.";
  if (typeof showToast === "function") showToast(msg, "error");
  console.error(err);
  const el = document.getElementById("dbStatusBanner");
  if (el) {
    el.style.background = "var(--color-danger-bg)";
    el.style.color = "#991b1b";
    el.textContent = "Error database: " + msg + " — Jalankan SYNC-KE-XAMPP.bat";
  }
}

/** Hapus cache browser lama (localStorage) agar tidak bentrok dengan MySQL */
function clearLegacyBrowserCache() {
  if (!USE_API) return;
  ["stokbar_inventory", "stokbar_transactions", "stokbar_suppliers", "stokbar_users", "stokbar_settings"].forEach(
    (k) => localStorage.removeItem(k)
  );
}

if (!USE_API) {
  initLocalData();
}
