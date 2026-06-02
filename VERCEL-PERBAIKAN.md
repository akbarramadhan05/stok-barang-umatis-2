# Perbaikan Deploy Vercel (WAJIB dibaca)

## Masalah
URL `stok-barang-umatis-m46d.vercel.app` masih menyajikan **file JavaScript lama/salah**:
- `/js/data.js` berisi SQL (bukan kode JS)
- `/js/auth.js` versi PHP lama

Itu artinya project Vercel **belum terhubung** ke repo GitHub terbaru:
`https://github.com/akbarramadhan05/stok-barang-umatis-2`

## Langkah perbaikan di Vercel

1. Buka [vercel.com](https://vercel.com) → project **stok-barang-umatis-m46d**
2. **Settings** → **Git** → pastikan repo = `akbarramadhan05/stok-barang-umatis-2` branch `main`
3. **Settings** → **Environment Variables** (Production):
   - `SUPABASE_URL` = `https://klblycxszklteapdfwyf.supabase.co`
   - `SUPABASE_ANON_KEY` = anon key dari Supabase (Settings → API)
4. **Deployments** → **Redeploy** (centang "Use existing Build Cache" = **OFF**)
5. Setelah deploy, tes buka:
   - `https://...vercel.app/js/stokbar-data.js` → harus kode JavaScript
   - `https://...vercel.app/login.html` → login admin / admin123

## Login sementara
`login.html` sudah punya script login **inline** — bisa masuk mode demo meski file JS lain rusak, asalkan halaman `login.html` ter-deploy versi terbaru.
