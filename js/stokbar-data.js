/**
 * Stokbar Umatis — Data layer (Supabase / fallback localStorage)
 */

const STORAGE_KEYS = window.STORAGE_KEYS || {
  users: "stokbar_users",
  session: "stokbar_session",
  inventory: "stokbar_inventory",
  transactions: "stokbar_transactions",
  suppliers: "stokbar_suppliers",
  settings: "stokbar_settings",
};
window.STORAGE_KEYS = STORAGE_KEYS;

function getJSON(key, fallback) {
  if (typeof window.getJSON === "function" && window.getJSON !== getJSON) {
    return window.getJSON(key, fallback);
  }
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
window.getJSON = getJSON;

function setJSON(key, value) {
  if (typeof window.setJSON === "function" && window.setJSON !== setJSON) {
    return window.setJSON(key, value);
  }
  localStorage.setItem(key, JSON.stringify(value));
}
window.setJSON = setJSON;

function fetchWithTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} — koneksi timeout (${ms / 1000}s)`)), ms);
    }),
  ]);
}

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

/** Katalog barang default (42 item) — dipakai localStorage & fallback */
const DEFAULT_INVENTORY = [
  { id: "i1", sku: "KOP-001", name: "Arabica Gayo", category: "Biji Kopi", description: "Biji Arabica origin Gayo", stock: 8.5, unit: "kg", minStock: 3, isActive: true },
  { id: "i2", sku: "KOP-002", name: "Robusta Lampung", category: "Biji Kopi", description: "Biji Robusta", stock: 12, unit: "kg", minStock: 5, isActive: true },
  { id: "i3", sku: "KOP-003", name: "Espresso Blend House", category: "Biji Kopi", description: "Blend espresso signature", stock: 15, unit: "kg", minStock: 5, isActive: true },
  { id: "i4", sku: "KOP-004", name: "Decaf Colombia", category: "Biji Kopi", description: "Biji tanpa kafein", stock: 4, unit: "kg", minStock: 2, isActive: true },
  { id: "i5", sku: "KOP-005", name: "Kopi Toraja", category: "Biji Kopi", description: "Single origin Toraja", stock: 6, unit: "kg", minStock: 3, isActive: true },
  { id: "i6", sku: "KOP-006", name: "Cold Brew Concentrate", category: "Biji Kopi", description: "Bahan cold brew", stock: 8, unit: "liter", minStock: 4, isActive: true },
  { id: "i7", sku: "SUS-001", name: "Susu UHT Full Cream", category: "Susu", description: "Susu UHT untuk latte", stock: 24, unit: "liter", minStock: 10, isActive: true },
  { id: "i8", sku: "SUS-002", name: "Susu Oat", category: "Susu", description: "Susu oat", stock: 6, unit: "liter", minStock: 8, isActive: true },
  { id: "i9", sku: "SUS-003", name: "Susu Almond", category: "Susu", description: "Non-dairy almond", stock: 10, unit: "liter", minStock: 5, isActive: true },
  { id: "i10", sku: "SUS-004", name: "Susu Soy", category: "Susu", description: "Susu kedelai", stock: 8, unit: "liter", minStock: 4, isActive: true },
  { id: "i11", sku: "SUS-005", name: "Whipped Cream Spray", category: "Susu", description: "Krim topping", stock: 12, unit: "pcs", minStock: 6, isActive: true },
  { id: "i12", sku: "SUS-006", name: "Fresh Milk 1L", category: "Susu", description: "Susu segar harian", stock: 18, unit: "liter", minStock: 8, isActive: true },
  { id: "i13", sku: "SIR-001", name: "Sirup Vanilla", category: "Sirup", description: "Rasa vanilla", stock: 2.5, unit: "liter", minStock: 2, isActive: true },
  { id: "i14", sku: "SIR-002", name: "Sirup Caramel", category: "Sirup", description: "Rasa caramel", stock: 1.8, unit: "liter", minStock: 2, isActive: true },
  { id: "i15", sku: "SIR-003", name: "Sirup Hazelnut", category: "Sirup", description: "Rasa hazelnut", stock: 3, unit: "liter", minStock: 2, isActive: true },
  { id: "i16", sku: "SIR-004", name: "Sirup Pandan", category: "Sirup", description: "Rasa pandan", stock: 2.2, unit: "liter", minStock: 2, isActive: true },
  { id: "i17", sku: "SIR-005", name: "Sirup Chocolate", category: "Sirup", description: "Untuk mocha", stock: 4, unit: "liter", minStock: 2, isActive: true },
  { id: "i18", sku: "SIR-006", name: "Sirup Matcha", category: "Sirup", description: "Matcha latte", stock: 1.5, unit: "liter", minStock: 2, isActive: true },
  { id: "i19", sku: "CUP-001", name: "Cup Hot 8oz", category: "Cup & Kemasan", description: "Cup kertas hot 8oz", stock: 450, unit: "pcs", minStock: 200, isActive: true },
  { id: "i20", sku: "CUP-002", name: "Cup Iced 16oz", category: "Cup & Kemasan", description: "Cup iced 16oz", stock: 180, unit: "pcs", minStock: 150, isActive: true },
  { id: "i21", sku: "CUP-003", name: "Cup Hot 12oz", category: "Cup & Kemasan", description: "Cup hot besar", stock: 320, unit: "pcs", minStock: 150, isActive: true },
  { id: "i22", sku: "CUP-004", name: "Cup Iced 22oz", category: "Cup & Kemasan", description: "Cup iced jumbo", stock: 200, unit: "pcs", minStock: 100, isActive: true },
  { id: "i23", sku: "CUP-005", name: "Tutup Cup Hitam", category: "Cup & Kemasan", description: "Tutup dome & flat", stock: 600, unit: "pcs", minStock: 250, isActive: true },
  { id: "i24", sku: "CUP-006", name: "Sedotan Paper", category: "Cup & Kemasan", description: "Sedotan kertas", stock: 800, unit: "pcs", minStock: 300, isActive: true },
  { id: "i25", sku: "CUP-007", name: "Paper Bag Take Away", category: "Cup & Kemasan", description: "Kantong take away", stock: 150, unit: "pcs", minStock: 50, isActive: true },
  { id: "i26", sku: "CUP-008", name: "Sleeve Cup", category: "Cup & Kemasan", description: "Pelindung panas", stock: 400, unit: "pcs", minStock: 150, isActive: true },
  { id: "i27", sku: "BHN-001", name: "Gula Aren Cair", category: "Bahan Pendukung", description: "Pemanis gula aren", stock: 4, unit: "liter", minStock: 3, isActive: true },
  { id: "i28", sku: "BHN-002", name: "Gula Pasir", category: "Bahan Pendukung", description: "Gula station", stock: 10, unit: "kg", minStock: 3, isActive: true },
  { id: "i29", sku: "BHN-003", name: "Cokelat Bubuk", category: "Bahan Pendukung", description: "Cocoa powder", stock: 5, unit: "kg", minStock: 2, isActive: true },
  { id: "i30", sku: "BHN-004", name: "Teh Celup Earl Grey", category: "Bahan Pendukung", description: "Teh premium", stock: 120, unit: "pcs", minStock: 40, isActive: true },
  { id: "i31", sku: "BHN-005", name: "Teh Celup Chamomile", category: "Bahan Pendukung", description: "Teh herbal", stock: 80, unit: "pcs", minStock: 30, isActive: true },
  { id: "i32", sku: "BHN-006", name: "Air Mineral Galon", category: "Bahan Pendukung", description: "Air mesin kopi", stock: 8, unit: "pcs", minStock: 3, isActive: true },
  { id: "i33", sku: "BHN-007", name: "Es Batu Kemasan", category: "Bahan Pendukung", description: "Bahan iced", stock: 25, unit: "kg", minStock: 10, isActive: true },
  { id: "i34", sku: "BHN-008", name: "Salted Caramel Sauce", category: "Bahan Pendukung", description: "Saus topping", stock: 3, unit: "liter", minStock: 1.5, isActive: true },
  { id: "i35", sku: "BHN-009", name: "Matcha Powder", category: "Bahan Pendukung", description: "Serbuk matcha", stock: 2, unit: "kg", minStock: 1, isActive: true },
  { id: "i36", sku: "SNK-001", name: "Croissant Frozen", category: "Snack", description: "Pastry beku", stock: 35, unit: "pcs", minStock: 20, isActive: true },
  { id: "i37", sku: "SNK-002", name: "Banana Bread Slice", category: "Snack", description: "Roti pisang", stock: 28, unit: "pcs", minStock: 15, isActive: true },
  { id: "i38", sku: "SNK-003", name: "Cookies Choco Chip", category: "Snack", description: "Kue kering", stock: 45, unit: "pcs", minStock: 20, isActive: true },
  { id: "i39", sku: "SNK-004", name: "Waffle Frozen", category: "Snack", description: "Waffle beku", stock: 22, unit: "pcs", minStock: 12, isActive: true },
  { id: "i40", sku: "SNK-005", name: "Granola Bar", category: "Snack", description: "Snack healthy", stock: 36, unit: "pcs", minStock: 15, isActive: true },
  { id: "i41", sku: "SNK-006", name: "Sandwich Tuna Frozen", category: "Snack", description: "Sandwich dingin", stock: 18, unit: "pcs", minStock: 10, isActive: true },
  { id: "i42", sku: "SNK-007", name: "Brownies Potong", category: "Snack", description: "Brownies display", stock: 24, unit: "pcs", minStock: 12, isActive: true },
];

const DEFAULT_SUPPLIERS = [
  { id: "s1", name: "Kopi Nusantara Co.", phone: "6281234567890", email: "order@kopinusantara.id", address: "Jl. Raya Kopi No. 12, Bandung", categories: ["Biji Kopi"], notes: "Pengiriman Senin & Kamis" },
  { id: "s2", name: "Dairy Fresh Supply", phone: "6289876543210", email: "sales@dairyfresh.co.id", address: "Kawasan Industri Cikarang", categories: ["Susu"], notes: "Minimal order 20 liter" },
  { id: "s3", name: "Syrup House Indonesia", phone: "6281122334455", email: "hello@syruphouse.id", address: "Surabaya", categories: ["Sirup", "Bahan Pendukung"], notes: "" },
  { id: "s4", name: "PackPro Kemasan", phone: "6285566778899", email: "info@packpro.id", address: "Tangerang Selatan", categories: ["Cup & Kemasan"], notes: "Stok cup sering ready" },
];

function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
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
  if (!localStorage.getItem(STORAGE_KEYS.inventory)) setJSON(STORAGE_KEYS.inventory, DEFAULT_INVENTORY);
  if (!localStorage.getItem(STORAGE_KEYS.suppliers)) setJSON(STORAGE_KEYS.suppliers, DEFAULT_SUPPLIERS);
  if (!localStorage.getItem(STORAGE_KEYS.transactions)) setJSON(STORAGE_KEYS.transactions, []);
  if (!localStorage.getItem(STORAGE_KEYS.settings)) {
    setJSON(STORAGE_KEYS.settings, { cafeName: "Stokbar Umatis", lowStockNotify: true, currency: "IDR" });
  }
}

// --- Supabase loaders ---
async function refreshInventory() {
  if (USE_SUPABASE) {
    clearLegacyBrowserCache();
    let rows = null;
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await fetchWithTimeout(
          sb.from("inventory").select("*").order("name", { ascending: true }),
          12000,
          "Memuat barang"
        );
        if (error) throw new Error(error.message || "Gagal membaca inventory");
        rows = data;
      } catch (clientErr) {
        console.warn("refreshInventory client:", clientErr.message);
      }
    }
    if (!rows) {
      rows = await fetchWithTimeout(
        supabaseRestGet("inventory", "select=*&order=name.asc"),
        12000,
        "Memuat barang"
      );
    }
    DataCache.inventory = (rows || []).map(rowToInventory).filter((i) => i.isActive !== false);
    return DataCache.inventory;
  }
  if (typeof USE_API !== "undefined" && USE_API) {
    const res = await apiGet("inventory");
    DataCache.inventory = res.data || [];
    return DataCache.inventory;
  }
  let items = getJSON(STORAGE_KEYS.inventory, null);
  if (!items || items.length === 0) {
    items = DEFAULT_INVENTORY;
    setJSON(STORAGE_KEYS.inventory, items);
  }
  DataCache.inventory = items;
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
    let rows = null;
    const sb = getSupabase();
    if (sb) {
      try {
        let q = sb.from("transactions").select("*").order("created_at", { ascending: false });
        if (opts.type) q = q.eq("type", opts.type);
        if (opts.date) q = q.eq("tx_date", opts.date);
        if (opts.limit) q = q.limit(opts.limit);
        const { data, error } = await fetchWithTimeout(q, 12000, "Memuat transaksi");
        if (!error) rows = data;
        else console.warn("refreshTransactions:", error.message);
      } catch (e) {
        console.warn("refreshTransactions client:", e.message || e);
      }
    }
    if (!rows) {
      try {
        let query = "select=*&order=created_at.desc";
        if (opts.type) query += `&type=eq.${opts.type}`;
        if (opts.date) query += `&tx_date=eq.${opts.date}`;
        if (opts.limit) query += `&limit=${opts.limit}`;
        rows = await fetchWithTimeout(
          supabaseRestGet("transactions", query),
          12000,
          "Memuat transaksi"
        );
      } catch (e) {
        console.warn("refreshTransactions REST:", e.message || e);
        rows = [];
      }
    }
    DataCache.transactions = (rows || []).map(rowToTransaction);
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
      row.is_active = true;
      const { error } = await sb.from("inventory").insert(row);
      if (error) throw new Error(error.message || "Gagal menyimpan barang ke database.");
      const { data: check, error: checkErr } = await sb.from("inventory").select("id").eq("id", row.id).maybeSingle();
      if (checkErr || !check) throw new Error("Barang gagal tersimpan. Cek koneksi Supabase.");
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

/** Transaksi langsung lewat Supabase client (tanpa RPC — lebih andal) */
async function addTransactionSupabaseDirect(sb, { type, itemId, quantity, note, user }) {
  const { data: row, error: fetchErr } = await sb
    .from("inventory")
    .select("id, name, stock, unit")
    .eq("id", itemId)
    .maybeSingle();
  if (fetchErr) throw new Error(fetchErr.message);
  if (!row) {
    throw new Error(
      `Barang tidak ada di database (ID: ${itemId}). Simpan dulu di Katalog Barang, lalu Muat ulang.`
    );
  }

  const stock = parseFloat(row.stock);
  const qty = parseFloat(quantity);
  if (type === "out" && stock < qty) {
    throw new Error(`Stok tidak cukup. Tersedia: ${stock} ${row.unit}`);
  }

  const newStock =
    type === "in"
      ? Math.round((stock + qty) * 100) / 100
      : Math.round((stock - qty) * 100) / 100;

  const { error: updErr } = await sb
    .from("inventory")
    .update({ stock: newStock, updated_at: new Date().toISOString() })
    .eq("id", itemId);
  if (updErr) throw new Error(updErr.message);

  const txId = `tx_${Date.now()}`;
  const { error: txErr } = await sb.from("transactions").insert({
    id: txId,
    type,
    item_id: itemId,
    item_name: row.name,
    quantity: qty,
    unit: row.unit,
    note: note || "",
    user_id: user.id,
    user_name: user.name,
    tx_date: new Date().toISOString().slice(0, 10),
  });
  if (txErr) throw new Error(txErr.message);

  await refreshInventory();
  return { id: txId, itemId, newStock };
}

async function addTransaction({ type, itemId, quantity, note, user }) {
  const id = String(itemId || "").trim();
  if (!id) throw new Error("Pilih barang dulu — pilih dari dropdown atau klik barang di daftar.");

  const qty = parseFloat(quantity);
  if (isNaN(qty) || qty <= 0) throw new Error("Jumlah tidak valid");

  if (!user?.id) throw new Error("Sesi login tidak valid. Silakan logout dan login lagi.");

  await ensureInventoryLoaded();
  const cached = getItemById(id);

  if (USE_SUPABASE) {
    const sb = getSupabase();
    if (!sb) throw new Error("Supabase belum terhubung. Cek js/supabase-env.js atau env Vercel.");
    try {
      return await addTransactionSupabaseDirect(sb, {
        type,
        itemId: id,
        quantity: qty,
        note,
        user,
      });
    } catch (directErr) {
      const { error: rpcErr } = await sb.rpc("process_transaction", {
        p_type: type,
        p_item_id: id,
        p_quantity: qty,
        p_note: note || "",
        p_user_id: user.id,
        p_user_name: user.name,
      });
      if (!rpcErr) {
        await refreshInventory();
        return { ok: true };
      }
      throw new Error(directErr.message || rpcErr.message || "Transaksi gagal.");
    }
  }

  if (typeof USE_API !== "undefined" && USE_API) {
    const res = await apiPost("transaction_add", { type, itemId: id, quantity, note });
    await refreshInventory();
    return res.data;
  }

  const item = cached || getItemById(id);
  if (!item) {
    throw new Error(
      `Barang tidak ditemukan (ID: ${id}). Refresh halaman (F5) atau tambah barang di Katalog.`
    );
  }
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
  if (USE_SUPABASE || (typeof USE_API !== "undefined" && USE_API)) {
    return refreshInventory();
  }
  if (DataCache.inventory && DataCache.inventory.length > 0) return DataCache.inventory;
  await refreshInventory();
  if (DataCache.inventory.length === 0) {
    initLocalData();
    DataCache.inventory = getJSON(STORAGE_KEYS.inventory, DEFAULT_INVENTORY);
  }
  return DataCache.inventory;
}

/** Paksa ambil data terbaru dari Supabase (panggil dari tombol refresh) */
async function forceReloadFromDatabase() {
  DataCache.inventory = [];
  DataCache.suppliers = [];
  DataCache.transactions = [];
  clearLegacyBrowserCache();
  if (USE_SUPABASE) {
    await Promise.all([refreshInventory(), refreshSuppliers(), refreshTransactions({ limit: 200 })]);
    return { inventory: DataCache.inventory.length };
  }
  await refreshInventory();
  return { inventory: DataCache.inventory.length };
}

/** Muat ulang katalog default ke localStorage (reset barang demo) */
function resetLocalInventoryToDefault() {
  setJSON(STORAGE_KEYS.inventory, DEFAULT_INVENTORY);
  DataCache.inventory = [...DEFAULT_INVENTORY];
  return DataCache.inventory;
}

if ((typeof USE_SUPABASE === "undefined" || !USE_SUPABASE) && (typeof USE_API === "undefined" || !USE_API)) {
  initLocalData();
}
