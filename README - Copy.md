# Stokbar Umatis

Website manajemen inventaris kafe — modern, responsif, dan mudah dipakai di HP/tablet.

## Fitur

- **Login multi-role**: Admin, Owner (read-only), Tim Barista
- **Dashboard**: Ringkasan stok, alert menipis, grafik masuk/keluar
- **Manajemen stok**: Daftar barang, kategori, satuan, status stok
- **Transaksi**: Form cepat barang masuk & keluar
- **Data supplier**: Kontak WA, email, telepon — satu klik hubungi
- **Laporan**: Riwayat transaksi & statistik (Admin & Owner)
- **Manajemen user & pengaturan** (Admin)

## Cara Menjalankan

1. Buka folder proyek ini
2. Jalankan server lokal (opsional, bisa juga buka file langsung):

```bash
# Python
python -m http.server 8080

# Node (npx)
npx serve .
```

3. Buka browser: `http://localhost:8080` atau buka `login.html`

## Akun Demo

| Role    | Username | Password    |
|---------|----------|-------------|
| Admin   | admin    | admin123    |
| Owner   | owner    | owner123    |
| Barista | barista  | barista123  |

## Hak Akses

| Halaman           | Admin | Owner | Barista |
|-------------------|:-----:|:-----:|:-------:|
| Dashboard         | ✅    | ✅    | ✅      |
| Stok Barang       | ✅    | 👁️   | ✅      |
| Barang Masuk      | ✅    | ❌    | ✅      |
| Barang Keluar     | ✅    | ❌    | ✅      |
| Data Supplier     | ✅    | 👁️   | ❌      |
| Laporan           | ✅    | 👁️   | ❌      |
| Manajemen User    | ✅    | ❌    | ❌      |
| Pengaturan        | ✅    | ❌    | ❌      |

👁️ = read-only (tidak bisa edit)

## Struktur File

```
stok-barang-umatis/
├── index.html              # Redirect ke login/dashboard
├── login.html              # Halaman login
├── dashboard.html          # Dashboard utama
├── inventory.html          # Manajemen stok
├── transaction-in.html     # Form barang masuk
├── transaction-out.html    # Form barang keluar
├── suppliers.html          # Data supplier + kontak
├── reports.html            # Laporan & riwayat
├── users.html              # Manajemen user (admin)
├── settings.html           # Pengaturan (admin)
├── css/
│   ├── variables.css       # Variabel desain & warna
│   ├── base.css            # Reset & tipografi
│   └── components.css      # Komponen UI
├── js/
│   ├── data.js             # Data & localStorage
│   ├── auth.js             # Autentikasi & role
│   ├── app.js              # Layout & utilitas UI
│   └── charts.js           # Grafik sederhana
└── README.md
```

## Database MySQL (phpMyAdmin)

Website sudah terhubung ke **MySQL** lewat API PHP saat dijalankan via **XAMPP** (`http://localhost/...`).

1. Import `database/schema.sql` di phpMyAdmin
2. Copy proyek ke `C:\xampp\htdocs\stok-barang-umatis`
3. Start Apache + MySQL
4. Buka `http://localhost/stok-barang-umatis/login.html`
5. Tes: `http://localhost/stok-barang-umatis/api/test-connection.php`

Ubah data di phpMyAdmin → refresh halaman web → data ikut berubah.

Panduan lengkap: `PANDUAN-PHPMYADMIN.md`

## Catatan Teknis

- Via XAMPP: data dari **MySQL** (API `api/index.php`)
- Buka file HTML langsung (`file://`): fallback **localStorage**
- Desain mobile-first dengan sidebar responsif

## Palet Warna

- Background: putih / abu muda (`#f8fafb`)
- Aksen: teal (`#14b8a6`), mint (`#34d399`), oranye hangat (`#fb923c`)
