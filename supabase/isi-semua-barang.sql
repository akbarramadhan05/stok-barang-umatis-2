-- ============================================================
-- ISI BANYAK BARANG — Stokbar Umatis
-- Jalankan di: Supabase Dashboard → SQL Editor → New query → Run
-- Aman dijalankan ulang (tidak duplikat jika ID sudah ada)
-- ============================================================

INSERT INTO inventory (id, sku, name, category, description, stock, unit, min_stock, is_active) VALUES
-- Biji Kopi (10)
('i1', 'KOP-001', 'Arabica Gayo', 'Biji Kopi', 'Biji Arabica origin Gayo', 8.5, 'kg', 3, true),
('i2', 'KOP-002', 'Robusta Lampung', 'Biji Kopi', 'Biji Robusta', 12, 'kg', 5, true),
('i3', 'KOP-003', 'Espresso Blend House', 'Biji Kopi', 'Blend espresso signature', 15, 'kg', 5, true),
('i4', 'KOP-004', 'Decaf Colombia', 'Biji Kopi', 'Biji tanpa kafein', 4, 'kg', 2, true),
('i5', 'KOP-005', 'Kopi Toraja', 'Biji Kopi', 'Single origin Toraja', 6, 'kg', 3, true),
('i6', 'KOP-006', 'Cold Brew Concentrate', 'Biji Kopi', 'Bahan cold brew', 8, 'liter', 4, true),
('i43', 'KOP-007', 'Liberica Bengkulu', 'Biji Kopi', 'Single origin Liberica', 5, 'kg', 2, true),
('i44', 'KOP-008', 'Kopi Flores Bajawa', 'Biji Kopi', 'Origin Flores', 7, 'kg', 3, true),
('i45', 'KOP-009', 'House Blend Dark Roast', 'Biji Kopi', 'Roast gelap untuk espresso', 10, 'kg', 4, true),
('i46', 'KOP-010', 'Kopi Celup Drip Bag', 'Biji Kopi', 'Drip bag retail', 80, 'pcs', 30, true),
-- Susu (8)
('i7', 'SUS-001', 'Susu UHT Full Cream', 'Susu', 'Susu UHT untuk latte', 24, 'liter', 10, true),
('i8', 'SUS-002', 'Susu Oat', 'Susu', 'Susu oat', 6, 'liter', 8, true),
('i9', 'SUS-003', 'Susu Almond', 'Susu', 'Non-dairy almond', 10, 'liter', 5, true),
('i10', 'SUS-004', 'Susu Soy', 'Susu', 'Susu kedelai', 8, 'liter', 4, true),
('i11', 'SUS-005', 'Whipped Cream Spray', 'Susu', 'Krim topping', 12, 'pcs', 6, true),
('i12', 'SUS-006', 'Fresh Milk 1L', 'Susu', 'Susu segar harian', 18, 'liter', 8, true),
('i47', 'SUS-007', 'Susu Kurma', 'Susu', 'Varian kurma', 6, 'liter', 4, true),
('i48', 'SUS-008', 'Butter Salted 200g', 'Susu', 'Mentega pastry', 20, 'pcs', 8, true),
-- Sirup (8)
('i13', 'SIR-001', 'Sirup Vanilla', 'Sirup', 'Rasa vanilla', 2.5, 'liter', 2, true),
('i14', 'SIR-002', 'Sirup Caramel', 'Sirup', 'Rasa caramel', 1.8, 'liter', 2, true),
('i15', 'SIR-003', 'Sirup Hazelnut', 'Sirup', 'Rasa hazelnut', 3, 'liter', 2, true),
('i16', 'SIR-004', 'Sirup Pandan', 'Sirup', 'Rasa pandan', 2.2, 'liter', 2, true),
('i17', 'SIR-005', 'Sirup Chocolate', 'Sirup', 'Untuk mocha', 4, 'liter', 2, true),
('i18', 'SIR-006', 'Sirup Matcha', 'Sirup', 'Matcha latte', 1.5, 'liter', 2, true),
('i49', 'SIR-007', 'Sirup Brown Sugar', 'Sirup', 'Gula aren cair premium', 3, 'liter', 2, true),
('i50', 'SIR-008', 'Sirup Strawberry', 'Sirup', 'Minuman buah', 2, 'liter', 2, true),
-- Cup & Kemasan (10)
('i19', 'CUP-001', 'Cup Hot 8oz', 'Cup & Kemasan', 'Cup kertas hot 8oz', 450, 'pcs', 200, true),
('i20', 'CUP-002', 'Cup Iced 16oz', 'Cup & Kemasan', 'Cup iced 16oz', 180, 'pcs', 150, true),
('i21', 'CUP-003', 'Cup Hot 12oz', 'Cup & Kemasan', 'Cup hot besar', 320, 'pcs', 150, true),
('i22', 'CUP-004', 'Cup Iced 22oz', 'Cup & Kemasan', 'Cup iced jumbo', 200, 'pcs', 100, true),
('i23', 'CUP-005', 'Tutup Cup Hitam', 'Cup & Kemasan', 'Tutup dome & flat', 600, 'pcs', 250, true),
('i24', 'CUP-006', 'Sedotan Paper', 'Cup & Kemasan', 'Sedotan kertas', 800, 'pcs', 300, true),
('i25', 'CUP-007', 'Paper Bag Take Away', 'Cup & Kemasan', 'Kantong take away', 150, 'pcs', 50, true),
('i26', 'CUP-008', 'Sleeve Cup', 'Cup & Kemasan', 'Pelindung panas', 400, 'pcs', 150, true),
('i51', 'CUP-009', 'Cup Gelas Kaca 12oz', 'Cup & Kemasan', 'Dine-in', 60, 'pcs', 20, true),
('i52', 'CUP-010', 'Napkin 1 Ply', 'Cup & Kemasan', 'Tisu meja', 500, 'pcs', 150, true),
-- Bahan Pendukung (12)
('i27', 'BHN-001', 'Gula Aren Cair', 'Bahan Pendukung', 'Pemanis gula aren', 4, 'liter', 3, true),
('i28', 'BHN-002', 'Gula Pasir', 'Bahan Pendukung', 'Gula station', 10, 'kg', 3, true),
('i29', 'BHN-003', 'Cokelat Bubuk', 'Bahan Pendukung', 'Cocoa powder', 5, 'kg', 2, true),
('i30', 'BHN-004', 'Teh Celup Earl Grey', 'Bahan Pendukung', 'Teh premium', 120, 'pcs', 40, true),
('i31', 'BHN-005', 'Teh Celup Chamomile', 'Bahan Pendukung', 'Teh herbal', 80, 'pcs', 30, true),
('i32', 'BHN-006', 'Air Mineral Galon', 'Bahan Pendukung', 'Air mesin kopi', 8, 'pcs', 3, true),
('i33', 'BHN-007', 'Es Batu Kemasan', 'Bahan Pendukung', 'Bahan iced', 25, 'kg', 10, true),
('i34', 'BHN-008', 'Salted Caramel Sauce', 'Bahan Pendukung', 'Saus topping', 3, 'liter', 1.5, true),
('i35', 'BHN-009', 'Matcha Powder', 'Bahan Pendukung', 'Serbuk matcha', 2, 'kg', 1, true),
('i53', 'BHN-010', 'Madu Sachet', 'Bahan Pendukung', 'Pemanis teh', 200, 'pcs', 50, true),
('i54', 'BHN-011', 'Lemon Slice Frozen', 'Bahan Pendukung', 'Minuman lemon', 15, 'kg', 5, true),
('i55', 'BHN-012', 'Syrup Pump Head', 'Bahan Pendukung', 'Spare part pump', 8, 'pcs', 2, true),
-- Snack (10)
('i36', 'SNK-001', 'Croissant Frozen', 'Snack', 'Pastry beku', 35, 'pcs', 20, true),
('i37', 'SNK-002', 'Banana Bread Slice', 'Snack', 'Roti pisang', 28, 'pcs', 15, true),
('i38', 'SNK-003', 'Cookies Choco Chip', 'Snack', 'Kue kering', 45, 'pcs', 20, true),
('i39', 'SNK-004', 'Waffle Frozen', 'Snack', 'Waffle beku', 22, 'pcs', 12, true),
('i40', 'SNK-005', 'Granola Bar', 'Snack', 'Snack healthy', 36, 'pcs', 15, true),
('i41', 'SNK-006', 'Sandwich Tuna Frozen', 'Snack', 'Sandwich dingin', 18, 'pcs', 10, true),
('i42', 'SNK-007', 'Brownies Potong', 'Snack', 'Brownies display', 24, 'pcs', 12, true),
('i56', 'SNK-008', 'Donat Glaze Frozen', 'Snack', 'Donat display', 30, 'pcs', 15, true),
('i57', 'SNK-009', 'Puff Pastry Almond', 'Snack', 'Pastry almond', 25, 'pcs', 12, true),
('i58', 'SNK-010', 'Chips Kentang Kemasan', 'Snack', 'Snack retail', 40, 'pcs', 15, true)
ON CONFLICT (id) DO NOTHING;

-- Cek jumlah barang setelah dijalankan:
-- SELECT COUNT(*) AS total_barang FROM inventory;
