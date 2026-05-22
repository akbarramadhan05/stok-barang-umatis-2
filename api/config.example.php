<?php
/**
 * Salin file ini menjadi config.php lalu sesuaikan dengan MySQL Anda.
 * cp config.example.php config.php
 */

return [
    'db_host' => '127.0.0.1',
    'db_port' => 3306,
    'db_name' => 'stokbar_umatis',
    'db_user' => 'root',      // default XAMPP
    'db_pass' => '',          // default XAMPP kosong; Laragon juga sering kosong
    'db_charset' => 'utf8mb4',
];
