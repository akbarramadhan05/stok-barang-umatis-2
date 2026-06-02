-- ============================================================
-- SETUP LENGKAP — jalankan SEKALI di Supabase SQL Editor → Run
-- (Schema + transaksi + isi barang)
-- ============================================================

-- Bagian 1–4: salin dari schema.sql (ringkas: hanya jika tabel belum ada)
-- Lebih aman: jalankan dulu schema.sql jika database masih kosong.

-- Fungsi transaksi (wajib untuk barang masuk/keluar)
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
  RETURN json_build_object('id', v_tx_id, 'itemId', p_item_id, 'newStock', v_new_stock);
END;
$$;
GRANT EXECUTE ON FUNCTION process_transaction(TEXT, TEXT, NUMERIC, TEXT, TEXT, TEXT) TO anon, authenticated;

-- Login
CREATE OR REPLACE FUNCTION login_user(p_username TEXT, p_password TEXT)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE u users%ROWTYPE;
BEGIN
  SELECT * INTO u FROM users WHERE LOWER(username) = LOWER(p_username) AND password = p_password LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'Username atau password salah.'; END IF;
  RETURN json_build_object('id', u.id, 'username', u.username, 'name', u.name, 'role', u.role);
END;
$$;
GRANT EXECUTE ON FUNCTION login_user(TEXT, TEXT) TO anon, authenticated;

-- Isi barang (ON CONFLICT = aman dijalankan ulang)
INSERT INTO users (id, username, password, name, role) VALUES
('u1', 'admin', 'admin123', 'Budi Admin', 'admin'),
('u2', 'owner', 'owner123', 'Sari Owner', 'owner'),
('u3', 'barista', 'barista123', 'Andi Barista', 'barista')
ON CONFLICT (id) DO NOTHING;

-- Langkah 2: jalankan juga file isi-semua-barang.sql (isi 58 barang)
-- SELECT COUNT(*) FROM inventory;
