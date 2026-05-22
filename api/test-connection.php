<?php
/**
 * Cek koneksi ke MySQL — buka di browser setelah setup XAMPP:
 * http://localhost/stok-barang-umatis/api/test-connection.php
 */

header('Access-Control-Allow-Origin: *');

try {
    require_once __DIR__ . '/db.php';
    $db = getDb();
    $c = getConfig();

    $tables = $db->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);
    $userCount = (int) $db->query('SELECT COUNT(*) FROM users')->fetchColumn();

    jsonResponse([
        'success' => true,
        'message' => 'Koneksi ke MySQL berhasil!',
        'database' => $c['db_name'],
        'host' => $c['db_host'],
        'tables' => $tables,
        'users_count' => $userCount,
        'phpmyadmin_hint' => 'Kelola data di http://localhost/phpmyadmin → database: ' . $c['db_name'],
    ]);
} catch (Throwable $e) {
    jsonResponse([
        'success' => false,
        'message' => 'Koneksi gagal: ' . $e->getMessage(),
        'tips' => [
            'Pastikan XAMPP/Laragon: Apache + MySQL sudah START (hijau)',
            'Import database/schema.sql lewat phpMyAdmin',
            'Cek username/password di api/config.php (root / password kosong untuk XAMPP default)',
        ],
    ], 500);
}
