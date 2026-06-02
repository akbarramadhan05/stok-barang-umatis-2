-- ============================================================
-- JALANKAN DI SUPABASE SQL EDITOR (penting untuk fix transaksi)
-- ============================================================

-- Fungsi transaksi di server (lebih andal dari browser)
CREATE OR REPLACE FUNCTION process_transaction(
  p_type TEXT,
  p_item_id TEXT,
  p_quantity NUMERIC,
  p_note TEXT,
  p_user_id TEXT,
  p_user_name TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item inventory%ROWTYPE;
  v_new_stock NUMERIC;
  v_tx_id TEXT;
BEGIN
  IF p_type NOT IN ('in', 'out') THEN
    RAISE EXCEPTION 'Tipe transaksi tidak valid';
  END IF;

  IF p_quantity IS NULL OR p_quantity <= 0 THEN
    RAISE EXCEPTION 'Jumlah tidak valid';
  END IF;

  SELECT * INTO v_item FROM inventory WHERE id = p_item_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Barang tidak ditemukan. ID: % — pastikan barang ada di tabel inventory.', p_item_id;
  END IF;

  IF p_type = 'out' AND v_item.stock < p_quantity THEN
    RAISE EXCEPTION 'Stok tidak cukup. Tersedia: % %', v_item.stock, v_item.unit;
  END IF;

  IF p_type = 'in' THEN
    v_new_stock := ROUND((v_item.stock + p_quantity)::NUMERIC, 2);
  ELSE
    v_new_stock := ROUND((v_item.stock - p_quantity)::NUMERIC, 2);
  END IF;

  UPDATE inventory
  SET stock = v_new_stock, updated_at = NOW()
  WHERE id = p_item_id;

  v_tx_id := 'tx_' || FLOOR(EXTRACT(EPOCH FROM NOW()) * 1000)::TEXT;

  INSERT INTO transactions (
    id, type, item_id, item_name, quantity, unit, note, user_id, user_name, tx_date
  ) VALUES (
    v_tx_id, p_type, p_item_id, v_item.name, p_quantity, v_item.unit,
    COALESCE(p_note, ''), p_user_id, p_user_name, CURRENT_DATE
  );

  RETURN json_build_object(
    'id', v_tx_id,
    'type', p_type,
    'itemId', p_item_id,
    'itemName', v_item.name,
    'quantity', p_quantity,
    'unit', v_item.unit,
    'newStock', v_new_stock
  );
END;
$$;

GRANT EXECUTE ON FUNCTION process_transaction(TEXT, TEXT, NUMERIC, TEXT, TEXT, TEXT) TO anon, authenticated;

-- Cek jumlah barang (harus > 0)
SELECT COUNT(*) AS total_barang FROM inventory;
