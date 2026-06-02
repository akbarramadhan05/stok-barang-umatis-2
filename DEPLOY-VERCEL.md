# Deploy Stokbar Umatis ke Vercel

## 1. Siapkan Supabase

1. [supabase.com](https://supabase.com) → buat project
2. **SQL Editor** → jalankan `supabase/schema.sql`
3. (Opsional) jalankan `supabase/seed-barang-tambahan.sql`
4. **Settings → API** → salin:
   - **Project URL** → `https://xxxxx.supabase.co` (tanpa `/rest/v1/`)
   - **anon public** key (panjang, diawali `eyJ...`)

## 2. Push ke GitHub

```bash
cd stok-barang-umatis
git add .
git commit -m "Deploy Vercel + Supabase"
git push origin main
```

Repo Anda: `https://github.com/akbarramadhan05/stok-barang-umatis-2`

## 3. Import ke Vercel

1. Buka [vercel.com](https://vercel.com) → login dengan GitHub
2. **Add New Project** → pilih repo `stok-barang-umatis-2`
3. Framework: **Other**
4. **Environment Variables** — tambahkan:

| Name | Value |
|------|--------|
| `SUPABASE_URL` | `https://klblycxszklteapdfwyf.supabase.co` |
| `SUPABASE_ANON_KEY` | anon public key dari Supabase |

5. Klik **Deploy**

## 4. Link website Anda

Setelah deploy selesai:

```
https://stokbar-umatis-2.vercel.app
```

atau nama custom dari Vercel (lihat di dashboard **Domains**).

Login: `http://localhost/...` diganti dengan link Vercel + `/login.html`

## 5. Tes

- Buka link Vercel → halaman login
- Login: `admin` / `admin123`
- Banner hijau: **Terhubung ke Supabase Cloud**

## Lokal vs Vercel

| | Lokal (XAMPP) | Vercel |
|--|---------------|--------|
| Config | `js/supabase-config.js` manual | Env vars → auto generate saat build |
| File config di Git | Di-ignore (aman) | Tidak perlu commit key |

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Login gagal | Cek env `SUPABASE_URL` & `SUPABASE_ANON_KEY` di Vercel → Redeploy |
| URL salah | Jangan pakai `/rest/v1/` di akhir URL |
| Key salah | Pakai **anon public**, bukan service_role / secret |
| Data kosong | Import `schema.sql` di Supabase |
