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
('u1', 'admin', 'admin123', 'ratih Admin', 'admin'),
('u2', 'owner', 'owner123', 'Sari Owner', 'owner'),
('u3', 'barista', 'barista123', 'Andi Barista', 'barista');

INSERT INTO inventory (id, sku, name, category, description, stock, unit, min_stock) VALUES
('i1', 'KOP-001', 'Arabica Gayo', 'Biji Kopi', 'Biji kopi Arabica origin Gayo', 8.5, 'kg', 3),
('i2', 'KOP-002', 'Robusta Lampung', 'Biji Kopi', 'Biji kopi Robusta', 12, 'kg', 5),
('i3', 'SUS-001', 'Susu UHT Full Cream', 'Susu', 'Susu UHT untuk latte', 24, 'liter', 10),
('i4', 'SUS-002', 'Susu Oat', 'Susu', 'Susu oat alternatif', 6, 'liter', 8),
('i5', 'SIR-001', 'Sirup Vanilla', 'Sirup', 'Sirup rasa vanilla', 2.5, 'liter', 2),
('i6', 'SIR-002', 'Sirup Caramel', 'Sirup', 'Sirup rasa caramel', 1.8, 'liter', 2),
('i7', 'CUP-001', 'Cup Hot 8oz', 'Cup & Kemasan', 'Cup kertas hot 8oz', 450, 'pcs', 200),
('i8', 'CUP-002', 'Cup Iced 16oz', 'Cup & Kemasan', 'Cup plastik iced 16oz', 180, 'pcs', 150),
('i9', 'BHN-001', 'Gula Aren Cair', 'Bahan Pendukung', 'Pemanis gula aren', 4, 'liter', 3),
('i10', 'SNK-001', 'Croissant Frozen', 'Snack', 'Pastry beku siap oven', 35, 'pcs', 20);

INSERT INTO suppliers (id, name, phone, email, address, categories, notes) VALUES
('s1', 'Kopi Nusantara Co.', '6281234567890', 'order@kopinusantara.id', 'Jl. Raya Kopi No. 12, Bandung', '["Biji Kopi"]', 'Pengiriman Senin & Kamis'),
('s2', 'Dairy Fresh Supply', '6289876543210', 'sales@dairyfresh.co.id', 'Kawasan Industri Cikarang', '["Susu"]', 'Minimal order 20 liter'),
('s3', 'Syrup House Indonesia', '6281122334455', 'hello@syruphouse.id', 'Surabaya', '["Sirup", "Bahan Pendukung"]', ''),
('s4', 'PackPro Kemasan', '6285566778899', 'info@packpro.id', 'Tangerang Selatan', '["Cup & Kemasan"]', 'Stok cup sering ready');

INSERT INTO settings (setting_key, setting_value) VALUES
('cafe_name', 'Stokbar Umatis'),
('low_stock_notify', '1'),
('currency', 'IDR');
