-- ============================================================
-- TAMBAH BARANG — jalankan di Supabase SQL Editor
-- (Database sudah ada, hanya menambah item baru)
-- Pakai INSERT IGNORE agar tidak error jika ID sudah ada
-- ============================================================

INSERT INTO inventory (id, sku, name, category, description, stock, unit, min_stock) VALUES
-- Biji Kopi
('i11', 'KOP-003', 'Espresso Blend House', 'Biji Kopi', 'Blend espresso signature kafe', 15, 'kg', 5),
('i12', 'KOP-004', 'Decaf Colombia', 'Biji Kopi', 'Biji kopi tanpa kafein', 4, 'kg', 2),
('i13', 'KOP-005', 'Kopi Toraja', 'Biji Kopi', 'Single origin Toraja', 6, 'kg', 3),
('i14', 'KOP-006', 'Cold Brew Concentrate', 'Biji Kopi', 'Bahan cold brew siap encer', 8, 'liter', 4),
-- Susu
('i15', 'SUS-003', 'Susu Almond', 'Susu', 'Susu almond untuk non-dairy', 10, 'liter', 5),
('i16', 'SUS-004', 'Susu Soy', 'Susu', 'Susu kedelai', 8, 'liter', 4),
('i17', 'SUS-005', 'Whipped Cream Spray', 'Susu', 'Krim penyemprot topping', 12, 'pcs', 6),
('i18', 'SUS-006', 'Fresh Milk 1L', 'Susu', 'Susu segar harian', 18, 'liter', 8),
-- Sirup
('i19', 'SIR-003', 'Sirup Hazelnut', 'Sirup', 'Rasa hazelnut', 3, 'liter', 2),
('i20', 'SIR-004', 'Sirup Pandan', 'Sirup', 'Rasa pandan lokal', 2.2, 'liter', 2),
('i21', 'SIR-005', 'Sirup Chocolate', 'Sirup', 'Cokelat untuk mocha', 4, 'liter', 2),
('i22', 'SIR-006', 'Sirup Matcha', 'Sirup', 'Matcha latte', 1.5, 'liter', 2),
-- Cup & Kemasan
('i23', 'CUP-003', 'Cup Hot 12oz', 'Cup & Kemasan', 'Cup kertas hot besar', 320, 'pcs', 150),
('i24', 'CUP-004', 'Cup Iced 22oz', 'Cup & Kemasan', 'Cup iced jumbo', 200, 'pcs', 100),
('i25', 'CUP-005', 'Tutup Cup Hitam', 'Cup & Kemasan', 'Tutup dome & flat', 600, 'pcs', 250),
('i26', 'CUP-006', 'Sedotan Paper', 'Cup & Kemasan', 'Sedotan kertas eco', 800, 'pcs', 300),
('i27', 'CUP-007', 'Paper Bag Take Away', 'Cup & Kemasan', 'Kantong kertas branding', 150, 'pcs', 50),
('i28', 'CUP-008', 'Sleeve Cup', 'Cup & Kemasan', 'Pelindung panas cup', 400, 'pcs', 150),
-- Bahan Pendukung
('i29', 'BHN-002', 'Gula Pasir', 'Bahan Pendukung', 'Gula halus station', 10, 'kg', 3),
('i30', 'BHN-003', 'Cokelat Bubuk', 'Bahan Pendukung', 'Cocoa powder', 5, 'kg', 2),
('i31', 'BHN-004', 'Teh Celup Earl Grey', 'Bahan Pendukung', 'Teh celup premium', 120, 'pcs', 40),
('i32', 'BHN-005', 'Teh Celup Chamomile', 'Bahan Pendukung', 'Teh herbal', 80, 'pcs', 30),
('i33', 'BHN-006', 'Air Mineral Galon', 'Bahan Pendukung', 'Air untuk mesin kopi', 8, 'pcs', 3),
('i34', 'BHN-007', 'Es Batu Kemasan', 'Bahan Pendukung', 'Bahan iced drink', 25, 'kg', 10),
('i35', 'BHN-008', 'Salted Caramel Sauce', 'Bahan Pendukung', 'Saus topping', 3, 'liter', 1.5),
('i36', 'BHN-009', 'Matcha Powder', 'Bahan Pendukung', 'Serbuk matcha culinary', 2, 'kg', 1),
-- Snack
('i37', 'SNK-002', 'Banana Bread Slice', 'Snack', 'Roti pisang siap saji', 28, 'pcs', 15),
('i38', 'SNK-003', 'Cookies Choco Chip', 'Snack', 'Kue kering display', 45, 'pcs', 20),
('i39', 'SNK-004', 'Waffle Frozen', 'Snack', 'Waffle beku', 22, 'pcs', 12),
('i40', 'SNK-005', 'Granola Bar', 'Snack', 'Snack bar healthy', 36, 'pcs', 15),
('i41', 'SNK-006', 'Sandwich Tuna Frozen', 'Snack', 'Sandwich dingin', 18, 'pcs', 10),
('i42', 'SNK-007', 'Brownies Potong', 'Snack', 'Brownies display case', 24, 'pcs', 12)
ON CONFLICT (id) DO NOTHING;
