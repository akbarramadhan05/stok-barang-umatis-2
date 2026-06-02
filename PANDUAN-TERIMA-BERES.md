# Panduan terima beres — Stokbar Umatis

Ikuti **urutan ini** sekali saja, lalu website siap dipakai.

## 1. Supabase (database)

1. Login [supabase.com](https://supabase.com) → project **klblycxszklteapdfwyf**
2. **SQL Editor** → jalankan berurutan:
   - `supabase/schema.sql` (jika database masih kosong)
   - `supabase/fix-transaksi.sql`
   - `supabase/isi-semua-barang.sql`
3. Cek: `SELECT COUNT(*) FROM inventory;` → harus > 0

## 2. Vercel (website)

1. [vercel.com](https://vercel.com) → project website Anda
2. **Settings → Git** → repo: `akbarramadhan05/stok-barang-umatis-2`, branch `main`
3. **Settings → Environment Variables**:
   - `SUPABASE_URL` = `https://klblycxszklteapdfwyf.supabase.co`
   - `SUPABASE_ANON_KEY` = (anon key dari Supabase → Settings → API)
4. **Deployments → Redeploy** (tanpa cache)

## 3. Tes di website

1. Buka URL Vercel → **Ctrl + Shift + R**
2. Login: **admin** / **admin123**
3. Banner atas harus: **✅ Supabase — X barang**
4. **Katalog Barang** → + Tambah Katalog → Simpan
5. **Barang Masuk** → pilih barang → jumlah → Simpan
6. **Barang Keluar** → sama

## Masalah?

| Gejala | Solusi |
|--------|--------|
| Banner **Mode LOKAL** | Isi env Vercel → redeploy |
| Barang tidak ditemukan | Klik **↻ Muat ulang**, pilih barang lagi |
| Data Supabase tidak muncul | Klik **↻ Muat ulang** atau Ctrl+Shift+R |
| Login gagal | Jalankan `fix-transaksi.sql` + cek user di tabel `users` |

File kunci di project: `js/supabase-env.js`, `js/stokbar-data.js`, `js/stokbar-auth.js`
