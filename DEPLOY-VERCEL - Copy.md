# Cara Share Stokbar Umatis (Vercel & alternatif)

## Penting: batasan Vercel

| Di XAMPP (lokal) | Di Vercel |
|------------------|-----------|
| PHP (`api/index.php`) | Tidak didukung untuk project ini |
| MySQL (phpMyAdmin) | Perlu database cloud terpisah |
| Satu link localhost | Link `https://nama-app.vercel.app` |

**Kesimpulan:** Upload ke Vercel **hanya file HTML/CSS/JS** = tampilan jalan, tapi **login ke MySQL tidak jalan** kecuali API dipindah (Node/Supabase) atau backend di hosting lain.

---

## Opsi A — Demo cepat di Vercel (tanpa database bersama)

Cocok: teman lihat tampilan & coba UI. Data **per browser** (localStorage), tidak sinkron antar orang.

1. Buat akun [GitHub](https://github.com) + [Vercel](https://vercel.com)
2. Push folder proyek ke GitHub (repo public/private)
3. Vercel → **Add New Project** → import repo
4. Framework: **Other** (static)
5. Deploy → dapat link: `https://stokbar-umatis.vercel.app`

**Login demo:** admin / admin123 (data di browser masing-masing, bukan phpMyAdmin).

---

## Opsi B — Link share + database bersama (disarankan)

Agar teman pakai **data yang sama** seperti Anda:

### B1. Render.com (paling mirip XAMPP, PHP + MySQL)

1. [render.com](https://render.com) → buat **MySQL** gratis
2. Import `database/schema.sql` lewat client SQL
3. Deploy **Web Service** (PHP) — upload project
4. Dapat URL: `https://stokbar-umatis.onrender.com`
5. (Opsional) Vercel hanya untuk frontend, API mengarah ke Render

### B2. Vercel (frontend) + Supabase (database)

Perlu ubah `js/data.js` ke Supabase (PostgreSQL). Butuh development tambahan.

---

## Opsi C — Vercel + backend terpisah (hybrid)

```
Teman buka → https://app.vercel.app (HTML/JS)
                    ↓
              API di Render / Railway
                    ↓
              MySQL cloud (PlanetScale / Render DB)
```

Langkah ringkas:
1. Deploy API+DB di **Render** atau **Railway**
2. Di Vercel set environment variable: `VITE_API_URL` atau edit `js/api-client.js`
3. Deploy static files ke Vercel

---

## Deploy ke Vercel (langkah GitHub)

```bash
cd stok-barang-umatis
git init
git add .
git commit -m "Stokbar Umatis"
git remote add origin https://github.com/USERNAME/stokbar-umatis.git
git push -u origin main
```

Di Vercel: Import repo → Deploy (file `vercel.json` sudah disiapkan).

---

## Ringkas pilihan

| Kebutuhan | Platform |
|-----------|----------|
| Link cepat, demo UI saja | **Vercel** (Opsi A) |
| Teman pakai data sama + PHP | **Render** (Opsi B1) |
| Mau tetap pakai Vercel + DB cloud | **Vercel + Supabase** (perlu coding ulang API) |

---

## Setelah deploy

- Ganti password demo (`admin123`) di database production
- Jangan commit `api/config.php` dengan password asli (sudah di `.gitignore`)
