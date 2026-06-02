-- Tambah barang (MySQL / phpMyAdmin) — jalankan jika database sudah ada
USE stokbar_umatis;

INSERT IGNORE INTO inventory (id, name, category, stock, unit, min_stock) VALUES
('i11', 'Espresso Blend House', 'Biji Kopi', 15, 'kg', 5),
('i12', 'Decaf Colombia', 'Biji Kopi', 4, 'kg', 2),
('i13', 'Kopi Toraja', 'Biji Kopi', 6, 'kg', 3),
('i14', 'Susu Almond', 'Susu', 10, 'liter', 5),
('i15', 'Susu Soy', 'Susu', 8, 'liter', 4),
('i16', 'Sirup Hazelnut', 'Sirup', 3, 'liter', 2),
('i17', 'Sirup Pandan', 'Sirup', 2.2, 'liter', 2),
('i18', 'Sirup Chocolate', 'Sirup', 4, 'liter', 2),
('i19', 'Cup Hot 12oz', 'Cup & Kemasan', 320, 'pcs', 150),
('i20', 'Tutup Cup Hitam', 'Cup & Kemasan', 600, 'pcs', 250),
('i21', 'Sedotan Paper', 'Cup & Kemasan', 800, 'pcs', 300),
('i22', 'Gula Pasir', 'Bahan Pendukung', 10, 'kg', 3),
('i23', 'Teh Celup Earl Grey', 'Bahan Pendukung', 120, 'pcs', 40),
('i24', 'Matcha Powder', 'Bahan Pendukung', 2, 'kg', 1),
('i25', 'Banana Bread Slice', 'Snack', 28, 'pcs', 15),
('i26', 'Cookies Choco Chip', 'Snack', 45, 'pcs', 20),
('i27', 'Waffle Frozen', 'Snack', 22, 'pcs', 12),
('i28', 'Brownies Potong', 'Snack', 24, 'pcs', 12);
