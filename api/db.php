<?php
/**
 * Koneksi PDO ke MySQL
 */

function getConfig(): array
{
    $path = __DIR__ . '/config.php';
    if (!file_exists($path)) {
        throw new RuntimeException(
            'File api/config.php belum ada. Salin dari api/config.example.php'
        );
    }
    return require $path;
}

function getDb(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $c = getConfig();
    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=%s',
        $c['db_host'],
        (int) $c['db_port'],
        $c['db_name'],
        $c['db_charset']
    );

    $pdo = new PDO($dsn, $c['db_user'], $c['db_pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    return $pdo;
}

function jsonResponse(array $data, int $code = 200): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
