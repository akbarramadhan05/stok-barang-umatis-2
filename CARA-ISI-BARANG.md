# Cara mengisi banyak barang di website (Supabase)

Website mengambil data dari **database Supabase**, bukan dari file di komputer.  
Agar di web tampil **banyak barang**, jalankan script SQL ini sekali.

## Langkah

1. Buka [supabase.com](https://supabase.com) → login → pilih project **klblycxszklteapdfwyf**
2. Menu kiri **SQL Editor** → **New query**
3. Buka file di project ini: **`supabase/isi-semua-barang.sql`**
4. **Copy semua** isinya → paste di SQL Editor → klik **Run**
5. (Opsional) Jalankan query cek:
   ```sql
   SELECT COUNT(*) AS total_barang FROM inventory;
   ```
   Harus sekitar **58 barang** (atau 42+ jika sebagian sudah ada).
6. Buka website → **Ctrl + Shift + R** → masuk **Katalog Barang** / **Stok Barang**

## Database masih kosong total?

Jalankan dulu **`supabase/schema.sql`** (buat tabel + user), baru **`isi-semua-barang.sql`**.

## Transaksi masuk/keluar error?

Jalankan juga **`supabase/fix-transaksi.sql`**.

## Muncul "Barang tidak ditemukan"?

Biasanya salah satu ini:

1. **Fungsi transaksi belum ada** → jalankan `supabase/fix-transaksi.sql` di SQL Editor.
2. **Barang cuma tampil di layar, belum tersimpan di database** → buka **Katalog Barang**, edit barang (mis. greenfileds), klik **Simpan** lagi.
3. Cek di SQL Editor:
   ```sql
   SELECT id, name FROM inventory WHERE name ILIKE '%green%';
   ```
   Kalau kosong, barang belum ada di database — tambah lewat Katalog atau `isi-semua-barang.sql`.
4. **Ctrl + Shift + R** lalu pilih barang lagi sebelum simpan.

## Ubah di Supabase tapi web tidak berubah?

1. Lihat banner di atas halaman:
   - **✅ Supabase — X barang** = web baca dari database (benar).
   - **⚠️ Mode LOKAL** = web **tidak** baca Supabase. Isi `SUPABASE_ANON_KEY` di **Vercel → Environment Variables** → redeploy.
2. Klik tombol **↻ Muat ulang** di banner hijau.
3. Pastikan edit di tabel **`inventory`** (schema **public**), project **`klblycxszklteapdfwyf`**.
4. Kolom **`is_active`** harus `true` (kalau `false`, barang disembunyikan di web).
5. **Ctrl + Shift + R** setelah edit di Supabase.

## Tambah barang sendiri lewat SQL

```sql
INSERT INTO inventory (id, sku, name, category, description, stock, unit, min_stock, is_active)
VALUES ('i99', 'KOP-099', 'Nama Barang Baru', 'Biji Kopi', 'Deskripsi', 10, 'kg', 3, true)
ON CONFLICT (id) DO NOTHING;
```

Satuan hanya: `kg`, `liter`, atau `pcs`.
