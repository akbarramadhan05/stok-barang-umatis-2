# Panduan: Hubungkan Stokbar Umatis ke phpMyAdmin (MySQL)

## Penting dipahami dulu

| Komponen | Fungsi |
|----------|--------|
| **phpMyAdmin** | Website untuk **mengelola** database MySQL (buat tabel, import SQL, lihat data) |
| **MySQL** | Database tempat data disimpan |
| **PHP** | Penghubung antara website Stokbar Umatis ↔ MySQL |
| **HTML/JS Anda** | Tampilan di browser — **tidak bisa** langsung buka phpMyAdmin |

Jadi alurnya:

```
Browser (login.html)  →  PHP (api/*.php)  →  MySQL  ←  phpMyAdmin (kelola DB)
```

Saat ini aplikasi masih pakai **localStorage** (data di browser). File `database/schema.sql` dan folder `api/` sudah disiapkan agar Anda bisa pindah ke MySQL.

---

## Langkah 1 — Install XAMPP (paling mudah di Windows)

1. Download: https://www.apachefriends.org/
2. Install XAMPP (biasanya ke `C:\xampp`)
3. Buka **XAMPP Control Panel**
4. Klik **Start** pada **Apache** dan **MySQL** (harus hijau)

---

## Langkah 2 — Buka phpMyAdmin

1. Buka browser
2. Ketik: **http://localhost/phpmyadmin**
3. Login default XAMPP:
   - **Username:** `root`
   - **Password:** *(kosongkan / biarkan kosong)*

---

## Langkah 3 — Import database

1. Di phpMyAdmin, klik tab **Import** (Impor)
2. Klik **Choose File** / **Pilih file**
3. Pilih file proyek Anda:
   ```
   Desktop\stok-barang-umatis\database\schema.sql
   ```
4. Klik **Go** / **Jalankan**
5. Selesai — database **`stokbar_umatis`** muncul di panel kiri dengan tabel: `users`, `inventory`, `suppliers`, `transactions`, `settings`

---

## Langkah 4 — Copy proyek ke folder XAMPP

Agar PHP jalan, folder proyek harus ada di `htdocs`:

**Opsi A — Copy folder**
```
Copy folder:  stok-barang-umatis
Ke:           C:\xampp\htdocs\stok-barang-umatis
```

**Opsi B — Shortcut (tanpa copy)**  
Buat junction/symbolic link dari `htdocs` ke folder Desktop Anda (opsional).

---

## Langkah 5 — Sesuaikan koneksi database

Buka file: `api/config.php`

```php
'db_user' => 'root',
'db_pass' => '',   // XAMPP default: password KOSONG
```

Jika MySQL Anda pakai password, isi di `db_pass`.

---

## Langkah 6 — Tes koneksi

Buka di browser:

```
http://localhost/stok-barang-umatis/api/test-connection.php
```

**Berhasil** — muncul JSON seperti:
```json
{
  "success": true,
  "message": "Koneksi ke MySQL berhasil!",
  "database": "stokbar_umatis",
  "tables": ["users", "inventory", ...]
}
```

**Gagal** — baca pesan `tips` di JSON, biasanya karena MySQL belum start atau `schema.sql` belum di-import.

---

## Langkah 7 — Kelola data lewat phpMyAdmin

1. Buka http://localhost/phpmyadmin
2. Klik database **`stokbar_umatis`**
3. Klik tabel (misalnya `users`, `inventory`)
4. Tab **Browse** = lihat data, **Insert** = tambah manual, **SQL** = query custom

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| phpMyAdmin tidak bisa dibuka | Start **Apache** di XAMPP |
| Access denied for user 'root' | Cek password di `api/config.php` |
| Unknown database 'stokbar_umatis' | Import ulang `database/schema.sql` |
| test-connection.php 404 | Pastikan folder ada di `C:\xampp\htdocs\stok-barang-umatis` |
| Port 80 bentrok | Di XAMPP ubah Apache port ke 8080, akses: `http://localhost:8080/phpmyadmin` |

---

## Langkah berikutnya (integrasi penuh)

Setelah koneksi tes **berhasil**, aplikasi web perlu di-update agar `js/data.js` memanggil API PHP (bukan localStorage). Jika Anda mau, minta bantuan untuk **migrasi penuh ke PHP + MySQL**.

---

## Ringkasan URL

| Tujuan | URL |
|--------|-----|
| phpMyAdmin | http://localhost/phpmyadmin |
| Website | http://localhost/stok-barang-umatis/login.html |
| Tes koneksi DB | http://localhost/stok-barang-umatis/api/test-connection.php |
