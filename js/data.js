/**
 * Stokbar Umatis — Data layer (Supabase / fallback localStorage)
 */

const STORAGE_KEYS = {
  users: "stokbar_users",
  session: "stokbar_session",
  inventory: "stokbar_inventory",
  transactions: "stokbar_transactions",
  suppliers: "stokbar_suppliers",
  settings: "stokbar_settings",
};

const ROLES = { ADMIN: "admin", OWNER: "owner", BARISTA: "barista" };

const ROLE_LABELS = { admin: "Admin", owner: "Owner", barista: "Tim Barista" };

const CATEGORIES = [
  "Biji Kopi", "Susu", "Sirup", "Cup & Kemasan", "Bahan Pendukung", "Snack",
];

const DataCache = { inventory: [], suppliers: [], transactions: [], users: [], settings: null };

const DEFAULT_USERS = [
  { id: "u1", username: "admin", password: "admin123", name: "Budi Admin", role: ROLES.ADMIN },
  { id: "u2", username: "owner", password: "owner123", name: "Sari Owner", role: ROLES.OWNER },
  { id: "u3", username: "barista", password: "barista123", name: "Andi Barista", role: ROLES.BARISTA },
];

function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

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

function rowToInventory(r) {
  return {
    id: r.id,
    sku: r.sku || "",
    name: r.name,
    category: r.category,
    description: r.description || "",
    stock: parseFloat(r.stock),
    unit: r.unit,
    minStock: parseFloat(r.min_stock),
    isActive: r.is_active !== false,
  };
}

function inventoryToRow(data) {
  return {
    id: data.id,
    sku: data.sku || null,
    name: data.name,
    category: data.category,
    description: data.description || "",
    stock: data.stock,
    unit: data.unit,
    min_stock: data.minStock,
    is_active: data.isActive !== false,
    updated_at: new Date().toISOString(),
  };
}

function rowToSupplier(r) {
  let cats = r.categories;
  if (typeof cats === "string") {
    try { cats = JSON.parse(cats); } catch { cats = []; }
  }
  return {
    id: r.id,
    name: r.name,
    phone: r.phone,
    email: r.email,
    address: r.address || "",
    categories: cats || [],
    notes: r.notes || "",
  };
}

function rowToTransaction(r) {
  return {
    id: r.id,
    type: r.type,
    itemId: r.item_id,
    itemName: r.item_name,
    quantity: parseFloat(r.quantity),
    unit: r.unit,
    note: r.note || "",
    userId: r.user_id,
    userName: r.user_name,
    date: r.tx_date,
    createdAt: r.created_at,
  };
}

function settingsToObject(rows) {
  const out = { cafeName: "Stokbar Umatis", lowStockNotify: true, currency: "IDR" };
  rows.forEach((r) => {
    if (r.setting_key === "cafe_name") out.cafeName = r.setting_value;
    if (r.setting_key === "low_stock_notify") out.lowStockNotify = r.setting_value === "1";
    if (r.setting_key === "currency") out.currency = r.setting_value;
  });
  return out;
}

function initLocalData() {
  if (!localStorage.getItem(STORAGE_KEYS.users)) setJSON(STORAGE_KEYS.users, DEFAULT_USERS);
  if (!localStorage.getItem(STORAGE_KEYS.inventory)) setJSON(STORAGE_KEYS.inventory, []);
  if (!localStorage.getItem(STORAGE_KEYS.suppliers)) setJSON(STORAGE_KEYS.suppliers, []);
  if (!localStorage.getItem(STORAGE_KEYS.transactions)) setJSON(STORAGE_KEYS.transactions, []);
  if (!localStorage.getItem(STORAGE_KEYS.settings)) {
    setJSON(STORAGE_KEYS.settings, { cafeName: "Stokbar Umatis", lowStockNotify: true, currency: "IDR" });
  }
}

// --- Supabase loaders ---
async function refreshInventory() {
  if (USE_SUPABASE) {
    const sb = getSupabase();
    const { data, error } = await sb.from("inventory").select("*").order("name");
    if (error) throw error;
    DataCache.inventory = (data || []).map(rowToInventory).filter((i) => i.isActive !== false);
    return DataCache.inventory;
  }
  if (typeof USE_API !== "undefined" && USE_API) {
    const res = await apiGet("inventory");
    DataCache.inventory = res.data || [];
    return DataCache.inventory;
  }
  DataCache.inventory = getJSON(STORAGE_KEYS.inventory, []);
  return DataCache.inventory;
}

async function refreshSuppliers() {
  if (USE_SUPABASE) {
    const sb = getSupabase();
    const { data, error } = await sb.from("suppliers").select("*").order("name");
    if (error) throw error;
    DataCache.suppliers = (data || []).map(rowToSupplier);
    return DataCache.suppliers;
  }
  if (typeof USE_API !== "undefined" && USE_API) {
    const res = await apiGet("suppliers");
    DataCache.suppliers = res.data || [];
    return DataCache.suppliers;
  }
  DataCache.suppliers = getJSON(STORAGE_KEYS.suppliers, []);
  return DataCache.suppliers;
}

async function refreshTransactions(opts = {}) {
  if (USE_SUPABASE) {
    const sb = getSupabase();
    let q = sb.from("transactions").select("*").order("created_at", { ascending: false });
    if (opts.type) q = q.eq("type", opts.type);
    if (opts.date) q = q.eq("tx_date", opts.date);
    if (opts.limit) q = q.limit(opts.limit);
    const { data, error } = await q;
    if (error) throw error;
    DataCache.transactions = (data || []).map(rowToTransaction);
    return DataCache.transactions;
  }
  if (typeof USE_API !== "undefined" && USE_API) {
    const res = await apiGet("transactions", opts);
    DataCache.transactions = res.data || [];
    return DataCache.transactions;
  }
  DataCache.transactions = getJSON(STORAGE_KEYS.transactions, []);
  return DataCache.transactions;
}

async function refreshUsers() {
  if (USE_SUPABASE) {
    const sb = getSupabase();
    const { data, error } = await sb.from("users").select("id, username, name, role");
    if (error) throw error;
    DataCache.users = data || [];
    return DataCache.users;
  }
  if (typeof USE_API !== "undefined" && USE_API) {
    const res = await apiGet("users");
    DataCache.users = res.data || [];
    return DataCache.users;
  }
  DataCache.users = getJSON(STORAGE_KEYS.users, []);
  return DataCache.users;
}

async function refreshSettings() {
  if (USE_SUPABASE) {
    const sb = getSupabase();
    const { data, error } = await sb.from("settings").select("*");
    if (error) throw error;
    DataCache.settings = settingsToObject(data || []);
    return DataCache.settings;
  }
  if (typeof USE_API !== "undefined" && USE_API) {
    const res = await apiGet("settings");
    DataCache.settings = res.data;
    return DataCache.settings;
  }
  DataCache.settings = getJSON(STORAGE_KEYS.settings, {});
  return DataCache.settings;
}

function getInventory() {
  if (USE_SUPABASE || (typeof USE_API !== "undefined" && USE_API)) return DataCache.inventory;
  return getJSON(STORAGE_KEYS.inventory, []);
}

function getSuppliers() {
  if (USE_SUPABASE || (typeof USE_API !== "undefined" && USE_API)) return DataCache.suppliers;
  return getJSON(STORAGE_KEYS.suppliers, []);
}

function getTransactions() {
  if (USE_SUPABASE || (typeof USE_API !== "undefined" && USE_API)) return DataCache.transactions;
  return getJSON(STORAGE_KEYS.transactions, []);
}

function getUsers() {
  if (USE_SUPABASE || (typeof USE_API !== "undefined" && USE_API)) return DataCache.users;
  return getJSON(STORAGE_KEYS.users, []);
}

function getItemById(id) {
  return getInventory().find((i) => i.id === id);
}

function getLowStockItems() {
  return getInventory().filter((i) => i.stock <= i.minStock);
}

async function saveInventoryItem(data) {
  if (USE_SUPABASE) {
    const sb = getSupabase();
    const row = inventoryToRow(data);
    if (data.id) {
      const { error } = await sb.from("inventory").update(row).eq("id", data.id);
      if (error) throw error;
    } else {
      row.id = generateId("i");
      row.created_at = new Date().toISOString();
      const { error } = await sb.from("inventory").insert(row);
      if (error) throw error;
    }
    await refreshInventory();
    return;
  }
  if (typeof USE_API !== "undefined" && USE_API) {
    await apiPost("inventory_save", data);
    await refreshInventory();
    return;
  }
  let items = getJSON(STORAGE_KEYS.inventory, []);
  if (data.id) {
    const idx = items.findIndex((i) => i.id === data.id);
    items[idx] = { ...items[idx], ...data };
  } else {
    items.push({ id: generateId("i"), isActive: true, ...data });
  }
  setJSON(STORAGE_KEYS.inventory, items);
  DataCache.inventory = items;
}

async function deleteInventoryItem(id) {
  if (USE_SUPABASE) {
    const sb = getSupabase();
    const { error } = await sb.from("inventory").delete().eq("id", id);
    if (error) throw new Error(error.message.includes("violates") ? "Barang masih punya riwayat transaksi." : error.message);
    await refreshInventory();
    return;
  }
  if (typeof USE_API !== "undefined" && USE_API) {
    await apiPost("inventory_delete", { id });
    await refreshInventory();
    return;
  }
  const items = getJSON(STORAGE_KEYS.inventory, []).filter((i) => i.id !== id);
  setJSON(STORAGE_KEYS.inventory, items);
  DataCache.inventory = items;
}

async function saveSupplierItem(data) {
  if (USE_SUPABASE) {
    const sb = getSupabase();
    const row = {
      id: data.id,
      name: data.name,
      phone: data.phone,
      email: data.email,
      address: data.address || "",
      categories: data.categories || [],
      notes: data.notes || "",
    };
    if (data.id) {
      const { error } = await sb.from("suppliers").update(row).eq("id", data.id);
      if (error) throw error;
    } else {
      row.id = generateId("s");
      const { error } = await sb.from("suppliers").insert(row);
      if (error) throw error;
    }
    await refreshSuppliers();
    return;
  }
  if (typeof USE_API !== "undefined" && USE_API) {
    await apiPost("supplier_save", data);
    await refreshSuppliers();
    return;
  }
  let list = getJSON(STORAGE_KEYS.suppliers, []);
  if (data.id) {
    const idx = list.findIndex((s) => s.id === data.id);
    list[idx] = { ...list[idx], ...data };
  } else {
    list.push({ id: generateId("s"), ...data });
  }
  setJSON(STORAGE_KEYS.suppliers, list);
  DataCache.suppliers = list;
}

async function deleteSupplierItem(id) {
  if (USE_SUPABASE) {
    const sb = getSupabase();
    const { error } = await sb.from("suppliers").delete().eq("id", id);
    if (error) throw error;
    await refreshSuppliers();
    return;
  }
  if (typeof USE_API !== "undefined" && USE_API) {
    await apiPost("supplier_delete", { id });
    await refreshSuppliers();
    return;
  }
  const list = getJSON(STORAGE_KEYS.suppliers, []).filter((s) => s.id !== id);
  setJSON(STORAGE_KEYS.suppliers, list);
  DataCache.suppliers = list;
}

async function saveUserItem(data) {
  if (USE_SUPABASE) {
    const sb = getSupabase();
    if (data.id) {
      const row = { name: data.name, username: data.username, role: data.role };
      if (data.password) row.password = data.password;
      const { error } = await sb.from("users").update(row).eq("id", data.id);
      if (error) throw error;
    } else {
      const { error } = await sb.from("users").insert({
        id: generateId("u"),
        name: data.name,
        username: data.username,
        password: data.password,
        role: data.role,
      });
      if (error) throw error;
    }
    await refreshUsers();
    return;
  }
  if (typeof USE_API !== "undefined" && USE_API) {
    await apiPost("user_save", data);
    await refreshUsers();
    return;
  }
  let users = getJSON(STORAGE_KEYS.users, []);
  if (data.id) {
    const idx = users.findIndex((u) => u.id === data.id);
    users[idx] = { ...users[idx], name: data.name, username: data.username, role: data.role };
    if (data.password) users[idx].password = data.password;
  } else {
    users.push({ id: generateId("u"), ...data });
  }
  setJSON(STORAGE_KEYS.users, users);
  DataCache.users = users;
}

async function saveSettings(data) {
  if (USE_SUPABASE) {
    const sb = getSupabase();
    const pairs = [
      { setting_key: "cafe_name", setting_value: data.cafeName },
      { setting_key: "low_stock_notify", setting_value: data.lowStockNotify ? "1" : "0" },
      { setting_key: "currency", setting_value: data.currency || "IDR" },
    ];
    for (const p of pairs) {
      const { error } = await sb.from("settings").upsert(p);
      if (error) throw error;
    }
    await refreshSettings();
    return;
  }
  if (typeof USE_API !== "undefined" && USE_API) {
    await apiPost("settings_save", data);
    await refreshSettings();
    return;
  }
  setJSON(STORAGE_KEYS.settings, data);
  DataCache.settings = data;
}

async function addTransaction({ type, itemId, quantity, note, user }) {
  const id = String(itemId || "").trim();
  if (!id) throw new Error("Pilih barang dulu — pilih dari dropdown atau klik barang di daftar.");

  const qty = parseFloat(quantity);
  if (isNaN(qty) || qty <= 0) throw new Error("Jumlah tidak valid");

  if (!user?.id) throw new Error("Sesi login tidak valid. Silakan logout dan login lagi.");

  await ensureInventoryLoaded();
  const cached = getItemById(id);
  if (!cached) {
    const list = getInventory().map((i) => i.id).slice(0, 5).join(", ");
    throw new Error(
      `Barang tidak ditemukan (ID: ${id}). Refresh (F5). Barang tersedia: ${list || "kosong — import schema.sql di Supabase"}`
    );
  }

  if (USE_SUPABASE) {
    const sb = getSupabase();
    const { data, error } = await sb.rpc("process_transaction", {
      p_type: type,
      p_item_id: id,
      p_quantity: qty,
      p_note: note || "",
      p_user_id: user.id,
      p_user_name: user.name,
    });
    if (error) {
      const msg = error.message || "";
      if (msg.includes("process_transaction") || msg.includes("Could not find the function")) {
        throw new Error(
          "Fungsi database belum ada. Buka Supabase → SQL Editor → jalankan file supabase/fix-transaksi.sql"
        );
      }
      throw new Error(msg || "Transaksi gagal.");
    }
    await refreshInventory();
    return typeof data === "string" ? JSON.parse(data) : data;
  }

  if (typeof USE_API !== "undefined" && USE_API) {
    const res = await apiPost("transaction_add", { type, itemId: id, quantity, note });
    await refreshInventory();
    return res.data;
  }

  const item = getItemById(id);
  if (!item) throw new Error("Barang tidak ditemukan");
  if (type === "out" && item.stock < qty) {
    throw new Error(`Stok tidak cukup. Tersedia: ${item.stock} ${item.unit}`);
  }
  let items = getJSON(STORAGE_KEYS.inventory, []);
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) throw new Error("Barang tidak ditemukan");
  if (type === "in") items[idx].stock = Math.round((items[idx].stock + qty) * 100) / 100;
  else items[idx].stock = Math.round((items[idx].stock - qty) * 100) / 100;
  setJSON(STORAGE_KEYS.inventory, items);
  DataCache.inventory = items;
  const tx = {
    id: generateId("tx"),
    type,
    itemId: id,
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

function getChartData(days = 7) {
  const txs = getTransactions();
  const labels = [], dataIn = [], dataOut = [];
  const now = new Date();
  for (let d = days - 1; d >= 0; d--) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().slice(0, 10);
    labels.push(date.toLocaleDateString("id-ID", { weekday: "short" }));
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
  const msg = err?.message || "Gagal memuat data.";
  if (typeof showToast === "function") showToast(msg, "error");
  console.error(err);
  const el = document.getElementById("dbStatusBanner");
  if (el) {
    el.style.background = "var(--color-danger-bg)";
    el.style.color = "#991b1b";
    el.textContent = "Error: " + msg;
  }
}

function clearLegacyBrowserCache() {
  if (!USE_SUPABASE) return;
  ["stokbar_inventory", "stokbar_transactions", "stokbar_suppliers", "stokbar_users", "stokbar_settings"].forEach(
    (k) => localStorage.removeItem(k)
  );
}

async function ensureInventoryLoaded() {
  if (DataCache.inventory && DataCache.inventory.length > 0) return DataCache.inventory;
  await refreshInventory();
  if (!USE_SUPABASE && DataCache.inventory.length === 0) {
    initLocalData();
    DataCache.inventory = getJSON(STORAGE_KEYS.inventory, []);
  }
  return DataCache.inventory;
}

if (!USE_SUPABASE && (typeof USE_API === "undefined" || !USE_API)) {
  initLocalData();
}
