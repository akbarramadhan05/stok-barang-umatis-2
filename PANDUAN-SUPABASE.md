# Stokbar Umatis — Setup Supabase + Deploy Vercel

## 1. Buat project Supabase

1. Daftar di [supabase.com](https://supabase.com) (gratis)
2. **New Project** → nama: `stokbar-umatis`
3. Simpan **database password**

## 2. Import database

1. Supabase Dashboard → **SQL Editor**
2. Buka file `supabase/schema.sql` di komputer
3. Copy semua → Paste → **Run**

## 3. Ambil API keys

1. **Project Settings** → **API**
2. Copy:
   - **Project URL** → `https://xxxxx.supabase.co`
   - **anon public** key

## 4. Konfigurasi di project

1. Buka `js/supabase-config.js`
2. Isi:

```javascript
window.SUPABASE_URL = "https://xxxxx.supabase.co";
window.SUPABASE_ANON_KEY = "eyJhbGci...";
```

3. Simpan file

## 5. Tes lokal

Buka via server (Live Server / XAMPP):

```
http://localhost/stok-barang-umatis/login.html
```

Login: `admin` / `admin123`

Banner hijau: **Terhubung ke Supabase Cloud**

## 6. Deploy ke Vercel (share ke teman)

1. Push project ke **GitHub**
2. [vercel.com](https://vercel.com) → Import repo
3. Deploy → dapat link: `https://stokbar-umatis.vercel.app`

**Penting:** File `js/supabase-config.js` harus berisi URL & key yang benar (boleh commit untuk project internal, atau set di Vercel Environment Variables jika nanti pakai build tool).

## Fitur baru

| Fitur | Halaman |
|-------|---------|
| Katalog barang (tambah/edit SKU, deskripsi) | `katalog.html` |
| Unduh CSV transaksi | Laporan → CSV Transaksi |
| Unduh CSV stok | Laporan → CSV Stok |
| Unduh CSV lengkap | Laporan → CSV Lengkap |

File CSV pakai UTF-8 BOM → rapi dibuka di **Excel**.

## Akun demo

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Owner | owner | owner123 |
| Barista | barista | barista123 |

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Login gagal | Pastikan `schema.sql` sudah di-run di Supabase |
| Banner merah | Cek `supabase-config.js` |
| Data kosong | SQL Editor → cek tabel `inventory` ada data |
| CSV kosong | Refresh halaman laporan dulu |
