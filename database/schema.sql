-- ============================================================
-- Stokbar Umatis — Database MySQL
-- Import file ini lewat phpMyAdmin (tab Import)
-- ============================================================

CREATE DATABASE IF NOT EXISTS stokbar_umatis
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE stokbar_umatis;

-- ------------------------------------------------------------
-- Tabel users
-- ------------------------------------------------------------
CREATE TABLE users (
  id VARCHAR(32) PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'owner', 'barista') NOT NULL DEFAULT 'barista',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Tabel inventory (stok barang)
-- ------------------------------------------------------------
CREATE TABLE inventory (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(80) NOT NULL,
  stock DECIMAL(12,2) NOT NULL DEFAULT 0,
  unit ENUM('kg', 'liter', 'pcs') NOT NULL DEFAULT 'kg',
  min_stock DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Tabel suppliers
-- ------------------------------------------------------------
CREATE TABLE suppliers (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(120) NOT NULL,
  address TEXT,
  categories JSON,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Tabel transactions (barang masuk / keluar)
-- ------------------------------------------------------------
CREATE TABLE transactions (
  id VARCHAR(32) PRIMARY KEY,
  type ENUM('in', 'out') NOT NULL,
  item_id VARCHAR(32) NOT NULL,
  item_name VARCHAR(150) NOT NULL,
  quantity DECIMAL(12,2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  note TEXT,
  user_id VARCHAR(32) NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  tx_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES inventory(id) ON DELETE RESTRICT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_tx_date (tx_date),
  INDEX idx_tx_type (type)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Tabel settings
-- ------------------------------------------------------------
CREATE TABLE settings (
  setting_key VARCHAR(50) PRIMARY KEY,
  setting_value TEXT NOT NULL
) ENGINE=InnoDB;

-- ============================================================
-- Data awal (seed)
-- ============================================================

INSERT INTO users (id, username, password, name, role) VALUES
('u1', 'admin', 'admin123', 'ratih Admin', 'admin'),
('u2', 'owner', 'owner123', 'Sari Owner', 'owner'),
('u3', 'barista', 'barista123', 'Andi Barista', 'barista');

INSERT INTO inventory (id, name, category, stock, unit, min_stock) VALUES
('i1', 'Arabica Gayo', 'Biji Kopi', 8.50, 'kg', 3),
('i2', 'Robusta Lampung', 'Biji Kopi', 12.00, 'kg', 5),
('i3', 'Susu UHT Full Cream', 'Susu', 24.00, 'liter', 10),
('i4', 'Susu Oat', 'Susu', 6.00, 'liter', 8),
('i5', 'Sirup Vanilla', 'Sirup', 2.50, 'liter', 2),
('i6', 'Sirup Caramel', 'Sirup', 1.80, 'liter', 2),
('i7', 'Cup Hot 8oz', 'Cup & Kemasan', 450.00, 'pcs', 200),
('i8', 'Cup Iced 16oz', 'Cup & Kemasan', 180.00, 'pcs', 150),
('i9', 'Gula Aren Cair', 'Bahan Pendukung', 4.00, 'liter', 3),
('i10', 'Croissant Frozen', 'Snack', 35.00, 'pcs', 20);

INSERT INTO suppliers (id, name, phone, email, address, categories, notes) VALUES
('s1', 'Kopi Nusantara Co.', '6281234567890', 'order@kopinusantara.id', 'Jl. Raya Kopi No. 12, Bandung', '["Biji Kopi"]', 'Pengiriman Senin & Kamis'),
('s2', 'Dairy Fresh Supply', '6289876543210', 'sales@dairyfresh.co.id', 'Kawasan Industri Cikarang Blok B-5', '["Susu"]', 'Minimal order 20 liter'),
('s3', 'Syrup House Indonesia', '6281122334455', 'hello@syruphouse.id', 'Surabaya, Jawa Timur', '["Sirup", "Bahan Pendukung"]', ''),
('s4', 'PackPro Kemasan', '6285566778899', 'info@packpro.id', 'Tangerang Selatan', '["Cup & Kemasan"]', 'Stok cup sering ready');

INSERT INTO settings (setting_key, setting_value) VALUES
('cafe_name', 'Stokbar Umatis'),
('low_stock_notify', '1'),
('currency', 'IDR');
