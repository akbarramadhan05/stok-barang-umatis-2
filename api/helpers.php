<?php

function getJsonBody(): array
{
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function rowToUser(array $row, bool $includePassword = false): array
{
    $u = [
        'id' => $row['id'],
        'username' => $row['username'],
        'name' => $row['name'],
        'role' => $row['role'],
    ];
    if ($includePassword) {
        $u['password'] = $row['password'];
    }
    return $u;
}

function rowToInventory(array $row): array
{
    return [
        'id' => $row['id'],
        'name' => $row['name'],
        'category' => $row['category'],
        'stock' => (float) $row['stock'],
        'unit' => $row['unit'],
        'minStock' => (float) $row['min_stock'],
    ];
}

function rowToSupplier(array $row): array
{
    $cats = $row['categories'];
    if (is_string($cats)) {
        $cats = json_decode($cats, true) ?: [];
    }
    return [
        'id' => $row['id'],
        'name' => $row['name'],
        'phone' => $row['phone'],
        'email' => $row['email'],
        'address' => $row['address'] ?? '',
        'categories' => $cats,
        'notes' => $row['notes'] ?? '',
    ];
}

function rowToTransaction(array $row): array
{
    return [
        'id' => $row['id'],
        'type' => $row['type'],
        'itemId' => $row['item_id'],
        'itemName' => $row['item_name'],
        'quantity' => (float) $row['quantity'],
        'unit' => $row['unit'],
        'note' => $row['note'] ?? '',
        'userId' => $row['user_id'],
        'userName' => $row['user_name'],
        'date' => $row['tx_date'],
        'createdAt' => $row['created_at'],
    ];
}

function settingsToObject(array $rows): array
{
    $out = [
        'cafeName' => 'Stokbar Umatis',
        'lowStockNotify' => true,
        'currency' => 'IDR',
    ];
    foreach ($rows as $r) {
        if ($r['setting_key'] === 'cafe_name') {
            $out['cafeName'] = $r['setting_value'];
        }
        if ($r['setting_key'] === 'low_stock_notify') {
            $out['lowStockNotify'] = $r['setting_value'] === '1';
        }
        if ($r['setting_key'] === 'currency') {
            $out['currency'] = $r['setting_value'];
        }
    }
    return $out;
}

function requireLogin(): array
{
    if (empty($_SESSION['user_id'])) {
        jsonResponse(['success' => false, 'message' => 'Silakan login terlebih dahulu.'], 401);
    }
    return [
        'id' => $_SESSION['user_id'],
        'name' => $_SESSION['user_name'],
        'role' => $_SESSION['user_role'],
        'username' => $_SESSION['username'] ?? '',
    ];
}

function requireRole(array $roles): array
{
    $user = requireLogin();
    if (!in_array($user['role'], $roles, true)) {
        jsonResponse(['success' => false, 'message' => 'Akses ditolak.'], 403);
    }
    return $user;
}

function newId(string $prefix): string
{
    return $prefix . '_' . time() . '_' . substr(bin2hex(random_bytes(4)), 0, 6);
}
