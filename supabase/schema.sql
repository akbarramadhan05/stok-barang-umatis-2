-- ============================================================
-- Stokbar Umatis — Supabase (PostgreSQL)
-- Jalankan di: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- Hapus tabel lama jika re-import (hati-hati di production)
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP FUNCTION IF EXISTS login_user(text, text);

-- ------------------------------------------------------------
-- Users
-- ------------------------------------------------------------
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'owner', 'barista')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Katalog / Inventory (barang)
-- ------------------------------------------------------------
CREATE TABLE inventory (
  id TEXT PRIMARY KEY,
  sku TEXT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT DEFAULT '',
  stock NUMERIC(12,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL CHECK (unit IN ('kg', 'liter', 'pcs')),
  min_stock NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inventory_category ON inventory(category);
CREATE INDEX idx_inventory_active ON inventory(is_active);

-- ------------------------------------------------------------
-- Suppliers
-- ------------------------------------------------------------
CREATE TABLE suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT DEFAULT '',
  categories JSONB DEFAULT '[]'::jsonb,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Transactions
-- ------------------------------------------------------------
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('in', 'out')),
  item_id TEXT NOT NULL REFERENCES inventory(id) ON DELETE RESTRICT,
  item_name TEXT NOT NULL,
  quantity NUMERIC(12,2) NOT NULL,
  unit TEXT NOT NULL,
  note TEXT DEFAULT '',
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  user_name TEXT NOT NULL,
  tx_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_date ON transactions(tx_date);
CREATE INDEX idx_transactions_type ON transactions(type);

-- ------------------------------------------------------------
-- Settings
-- ------------------------------------------------------------
CREATE TABLE settings (
  setting_key TEXT PRIMARY KEY,
  setting_value TEXT NOT NULL
);

-- ------------------------------------------------------------
-- Login RPC (aman: password tidak di-expose lewat SELECT biasa)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION login_user(p_username TEXT, p_password TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  u users%ROWTYPE;
BEGIN
  SELECT * INTO u FROM users
  WHERE LOWER(username) = LOWER(p_username) AND password = p_password
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Username atau password salah.';
  END IF;

  RETURN json_build_object(
    'id', u.id,
    'username', u.username,
    'name', u.name,
    'role', u.role
  );
END;
$$;

GRANT EXECUTE ON FUNCTION login_user(TEXT, TEXT) TO anon, authenticated;

-- Fungsi transaksi (masuk / keluar) — dipanggil dari website
CREATE OR REPLACE FUNCTION process_transaction(
  p_type TEXT, p_item_id TEXT, p_quantity NUMERIC,
  p_note TEXT, p_user_id TEXT, p_user_name TEXT
)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_item inventory%ROWTYPE; v_new_stock NUMERIC; v_tx_id TEXT;
BEGIN
  IF p_type NOT IN ('in', 'out') THEN RAISE EXCEPTION 'Tipe transaksi tidak valid'; END IF;
  IF p_quantity IS NULL OR p_quantity <= 0 THEN RAISE EXCEPTION 'Jumlah tidak valid'; END IF;
  SELECT * INTO v_item FROM inventory WHERE id = p_item_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Barang tidak ditemukan. ID: %', p_item_id; END IF;
  IF p_type = 'out' AND v_item.stock < p_quantity THEN
    RAISE EXCEPTION 'Stok tidak cukup. Tersedia: % %', v_item.stock, v_item.unit;
  END IF;
  v_new_stock := ROUND((CASE WHEN p_type = 'in' THEN v_item.stock + p_quantity ELSE v_item.stock - p_quantity END)::NUMERIC, 2);
  UPDATE inventory SET stock = v_new_stock, updated_at = NOW() WHERE id = p_item_id;
  v_tx_id := 'tx_' || FLOOR(EXTRACT(EPOCH FROM NOW()) * 1000)::TEXT;
  INSERT INTO transactions (id, type, item_id, item_name, quantity, unit, note, user_id, user_name, tx_date)
  VALUES (v_tx_id, p_type, p_item_id, v_item.name, p_quantity, v_item.unit, COALESCE(p_note, ''), p_user_id, p_user_name, CURRENT_DATE);
  RETURN json_build_object('id', v_tx_id, 'itemId', p_item_id, 'itemName', v_item.name, 'newStock', v_new_stock);
END;
$$;
GRANT EXECUTE ON FUNCTION process_transaction(TEXT, TEXT, NUMERIC, TEXT, TEXT, TEXT) TO anon, authenticated;

-- ------------------------------------------------------------
-- RLS: izinkan operasi untuk anon (demo/MVP — perketat di production)
-- ------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_all" ON users FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inventory_all" ON inventory FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "suppliers_all" ON suppliers FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "transactions_all" ON transactions FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_all" ON settings FOR ALL USING (true) WITH CHECK (true);

-- ------------------------------------------------------------
-- Seed data
-- ------------------------------------------------------------
INSERT INTO users (id, username, password, name, role) VALUES
('u1', 'admin', 'admin123', 'Budi Admin', 'admin'),
('u2', 'owner', 'owner123', 'Sari Owner', 'owner'),
('u3', 'barista', 'barista123', 'Andi Barista', 'barista');

INSERT INTO inventory (id, sku, name, category, description, stock, unit, min_stock) VALUES
('i1', 'KOP-001', 'Arabica Gayo', 'Biji Kopi', 'Biji kopi Arabica origin Gayo', 8.5, 'kg', 3),
('i2', 'KOP-002', 'Robusta Lampung', 'Biji Kopi', 'Biji kopi Robusta', 12, 'kg', 5),
('i3', 'KOP-003', 'Espresso Blend House', 'Biji Kopi', 'Blend espresso signature', 15, 'kg', 5),
('i4', 'KOP-004', 'Decaf Colombia', 'Biji Kopi', 'Biji tanpa kafein', 4, 'kg', 2),
('i5', 'KOP-005', 'Kopi Toraja', 'Biji Kopi', 'Single origin Toraja', 6, 'kg', 3),
('i6', 'KOP-006', 'Cold Brew Concentrate', 'Biji Kopi', 'Bahan cold brew', 8, 'liter', 4),
('i7', 'SUS-001', 'Susu UHT Full Cream', 'Susu', 'Susu UHT untuk latte', 24, 'liter', 10),
('i8', 'SUS-002', 'Susu Oat', 'Susu', 'Susu oat alternatif', 6, 'liter', 8),
('i9', 'SUS-003', 'Susu Almond', 'Susu', 'Non-dairy almond', 10, 'liter', 5),
('i10', 'SUS-004', 'Susu Soy', 'Susu', 'Susu kedelai', 8, 'liter', 4),
('i11', 'SUS-005', 'Whipped Cream Spray', 'Susu', 'Krim topping', 12, 'pcs', 6),
('i12', 'SUS-006', 'Fresh Milk 1L', 'Susu', 'Susu segar harian', 18, 'liter', 8),
('i13', 'SIR-001', 'Sirup Vanilla', 'Sirup', 'Rasa vanilla', 2.5, 'liter', 2),
('i14', 'SIR-002', 'Sirup Caramel', 'Sirup', 'Rasa caramel', 1.8, 'liter', 2),
('i15', 'SIR-003', 'Sirup Hazelnut', 'Sirup', 'Rasa hazelnut', 3, 'liter', 2),
('i16', 'SIR-004', 'Sirup Pandan', 'Sirup', 'Rasa pandan', 2.2, 'liter', 2),
('i17', 'SIR-005', 'Sirup Chocolate', 'Sirup', 'Untuk mocha', 4, 'liter', 2),
('i18', 'SIR-006', 'Sirup Matcha', 'Sirup', 'Matcha latte', 1.5, 'liter', 2),
('i19', 'CUP-001', 'Cup Hot 8oz', 'Cup & Kemasan', 'Cup kertas hot 8oz', 450, 'pcs', 200),
('i20', 'CUP-002', 'Cup Iced 16oz', 'Cup & Kemasan', 'Cup iced 16oz', 180, 'pcs', 150),
('i21', 'CUP-003', 'Cup Hot 12oz', 'Cup & Kemasan', 'Cup hot besar', 320, 'pcs', 150),
('i22', 'CUP-004', 'Cup Iced 22oz', 'Cup & Kemasan', 'Cup iced jumbo', 200, 'pcs', 100),
('i23', 'CUP-005', 'Tutup Cup Hitam', 'Cup & Kemasan', 'Tutup dome & flat', 600, 'pcs', 250),
('i24', 'CUP-006', 'Sedotan Paper', 'Cup & Kemasan', 'Sedotan kertas', 800, 'pcs', 300),
('i25', 'CUP-007', 'Paper Bag Take Away', 'Cup & Kemasan', 'Kantong take away', 150, 'pcs', 50),
('i26', 'CUP-008', 'Sleeve Cup', 'Cup & Kemasan', 'Pelindung panas', 400, 'pcs', 150),
('i27', 'BHN-001', 'Gula Aren Cair', 'Bahan Pendukung', 'Pemanis gula aren', 4, 'liter', 3),
('i28', 'BHN-002', 'Gula Pasir', 'Bahan Pendukung', 'Gula station', 10, 'kg', 3),
('i29', 'BHN-003', 'Cokelat Bubuk', 'Bahan Pendukung', 'Cocoa powder', 5, 'kg', 2),
('i30', 'BHN-004', 'Teh Celup Earl Grey', 'Bahan Pendukung', 'Teh premium', 120, 'pcs', 40),
('i31', 'BHN-005', 'Teh Celup Chamomile', 'Bahan Pendukung', 'Teh herbal', 80, 'pcs', 30),
('i32', 'BHN-006', 'Air Mineral Galon', 'Bahan Pendukung', 'Air mesin kopi', 8, 'pcs', 3),
('i33', 'BHN-007', 'Es Batu Kemasan', 'Bahan Pendukung', 'Bahan iced', 25, 'kg', 10),
('i34', 'BHN-008', 'Salted Caramel Sauce', 'Bahan Pendukung', 'Saus topping', 3, 'liter', 1.5),
('i35', 'BHN-009', 'Matcha Powder', 'Bahan Pendukung', 'Serbuk matcha', 2, 'kg', 1),
('i36', 'SNK-001', 'Croissant Frozen', 'Snack', 'Pastry beku', 35, 'pcs', 20),
('i37', 'SNK-002', 'Banana Bread Slice', 'Snack', 'Roti pisang', 28, 'pcs', 15),
('i38', 'SNK-003', 'Cookies Choco Chip', 'Snack', 'Kue kering', 45, 'pcs', 20),
('i39', 'SNK-004', 'Waffle Frozen', 'Snack', 'Waffle beku', 22, 'pcs', 12),
('i40', 'SNK-005', 'Granola Bar', 'Snack', 'Snack healthy', 36, 'pcs', 15),
('i41', 'SNK-006', 'Sandwich Tuna Frozen', 'Snack', 'Sandwich dingin', 18, 'pcs', 10),
('i42', 'SNK-007', 'Brownies Potong', 'Snack', 'Brownies display', 24, 'pcs', 12);

INSERT INTO suppliers (id, name, phone, email, address, categories, notes) VALUES
('s1', 'Kopi Nusantara Co.', '6281234567890', 'order@kopinusantara.id', 'Jl. Raya Kopi No. 12, Bandung', '["Biji Kopi"]', 'Pengiriman Senin & Kamis'),
('s2', 'Dairy Fresh Supply', '6289876543210', 'sales@dairyfresh.co.id', 'Kawasan Industri Cikarang', '["Susu"]', 'Minimal order 20 liter'),
('s3', 'Syrup House Indonesia', '6281122334455', 'hello@syruphouse.id', 'Surabaya', '["Sirup", "Bahan Pendukung"]', ''),
('s4', 'PackPro Kemasan', '6285566778899', 'info@packpro.id', 'Tangerang Selatan', '["Cup & Kemasan"]', 'Stok cup sering ready');

INSERT INTO settings (setting_key, setting_value) VALUES
('cafe_name', 'Stokbar Umatis'),
('low_stock_notify', '1'),
('currency', 'IDR');
