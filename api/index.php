<?php
/**
 * Stokbar Umatis — REST API (MySQL)
 */

session_start();

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

try {
    $db = getDb();

    switch ($action) {

        case 'ping':
            jsonResponse(['success' => true, 'message' => 'API aktif', 'database' => getConfig()['db_name']]);

        case 'login':
            if ($method !== 'POST') {
                jsonResponse(['success' => false, 'message' => 'Method tidak valid'], 405);
            }
            $body = getJsonBody();
            $username = trim($body['username'] ?? '');
            $password = $body['password'] ?? '';
            $stmt = $db->prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?) AND password = ? LIMIT 1');
            $stmt->execute([$username, $password]);
            $row = $stmt->fetch();
            if (!$row) {
                jsonResponse(['success' => false, 'message' => 'Username atau password salah.']);
            }
            $_SESSION['user_id'] = $row['id'];
            $_SESSION['user_name'] = $row['name'];
            $_SESSION['user_role'] = $row['role'];
            $_SESSION['username'] = $row['username'];
            jsonResponse(['success' => true, 'user' => rowToUser($row)]);
            break;

        case 'logout':
            session_destroy();
            jsonResponse(['success' => true]);
            break;

        case 'session':
            if (empty($_SESSION['user_id'])) {
                jsonResponse(['success' => false, 'loggedIn' => false]);
            }
            jsonResponse([
                'success' => true,
                'loggedIn' => true,
                'user' => [
                    'id' => $_SESSION['user_id'],
                    'name' => $_SESSION['user_name'],
                    'role' => $_SESSION['user_role'],
                    'username' => $_SESSION['username'] ?? '',
                ],
            ]);
            break;

        case 'inventory':
            requireLogin();
            $stmt = $db->query('SELECT * FROM inventory ORDER BY name ASC');
            $items = array_map('rowToInventory', $stmt->fetchAll());
            jsonResponse(['success' => true, 'data' => $items]);
            break;

        case 'inventory_save':
            requireRole(['admin']);
            $body = getJsonBody();
            $id = $body['id'] ?? '';
            $name = trim($body['name'] ?? '');
            $category = trim($body['category'] ?? '');
            $unit = $body['unit'] ?? 'kg';
            $stock = (float) ($body['stock'] ?? 0);
            $minStock = (float) ($body['minStock'] ?? 0);

            if ($name === '' || $category === '') {
                jsonResponse(['success' => false, 'message' => 'Nama dan kategori wajib diisi.']);
            }

            if ($id) {
                $stmt = $db->prepare(
                    'UPDATE inventory SET name=?, category=?, stock=?, unit=?, min_stock=? WHERE id=?'
                );
                $stmt->execute([$name, $category, $stock, $unit, $minStock, $id]);
            } else {
                $id = newId('i');
                $stmt = $db->prepare(
                    'INSERT INTO inventory (id, name, category, stock, unit, min_stock) VALUES (?,?,?,?,?,?)'
                );
                $stmt->execute([$id, $name, $category, $stock, $unit, $minStock]);
            }
            $stmt = $db->prepare('SELECT * FROM inventory WHERE id = ?');
            $stmt->execute([$id]);
            jsonResponse(['success' => true, 'data' => rowToInventory($stmt->fetch())]);
            break;

        case 'inventory_delete':
            requireRole(['admin']);
            $body = getJsonBody();
            $id = $body['id'] ?? '';
            try {
                $stmt = $db->prepare('DELETE FROM inventory WHERE id = ?');
                $stmt->execute([$id]);
                jsonResponse(['success' => true]);
            } catch (PDOException $e) {
                jsonResponse(['success' => false, 'message' => 'Tidak bisa hapus: barang masih punya riwayat transaksi.']);
            }
            break;

        case 'suppliers':
            $user = requireLogin();
            if ($user['role'] === 'barista') {
                jsonResponse(['success' => false, 'message' => 'Akses ditolak.'], 403);
            }
            $stmt = $db->query('SELECT * FROM suppliers ORDER BY name ASC');
            $items = array_map('rowToSupplier', $stmt->fetchAll());
            jsonResponse(['success' => true, 'data' => $items]);
            break;

        case 'supplier_save':
            requireRole(['admin']);
            $body = getJsonBody();
            $id = $body['id'] ?? '';
            $name = trim($body['name'] ?? '');
            $phone = trim($body['phone'] ?? '');
            $email = trim($body['email'] ?? '');
            $address = trim($body['address'] ?? '');
            $categories = json_encode($body['categories'] ?? [], JSON_UNESCAPED_UNICODE);
            $notes = trim($body['notes'] ?? '');

            if ($id) {
                $stmt = $db->prepare(
                    'UPDATE suppliers SET name=?, phone=?, email=?, address=?, categories=?, notes=? WHERE id=?'
                );
                $stmt->execute([$name, $phone, $email, $address, $categories, $notes, $id]);
            } else {
                $id = newId('s');
                $stmt = $db->prepare(
                    'INSERT INTO suppliers (id, name, phone, email, address, categories, notes) VALUES (?,?,?,?,?,?,?)'
                );
                $stmt->execute([$id, $name, $phone, $email, $address, $categories, $notes]);
            }
            $stmt = $db->prepare('SELECT * FROM suppliers WHERE id = ?');
            $stmt->execute([$id]);
            jsonResponse(['success' => true, 'data' => rowToSupplier($stmt->fetch())]);
            break;

        case 'supplier_delete':
            requireRole(['admin']);
            $body = getJsonBody();
            $stmt = $db->prepare('DELETE FROM suppliers WHERE id = ?');
            $stmt->execute([$body['id'] ?? '']);
            jsonResponse(['success' => true]);
            break;

        case 'transactions':
            requireLogin();
            $type = $_GET['type'] ?? '';
            $date = $_GET['date'] ?? '';
            $limit = min((int) ($_GET['limit'] ?? 100), 500);

            $sql = 'SELECT * FROM transactions WHERE 1=1';
            $params = [];
            if ($type !== '') {
                $sql .= ' AND type = ?';
                $params[] = $type;
            }
            if ($date !== '') {
                $sql .= ' AND tx_date = ?';
                $params[] = $date;
            }
            $sql .= ' ORDER BY created_at DESC LIMIT ' . $limit;

            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            $items = array_map('rowToTransaction', $stmt->fetchAll());
            jsonResponse(['success' => true, 'data' => $items]);
            break;

        case 'transaction_add':
            requireRole(['admin', 'barista']);
            $user = requireLogin();
            $body = getJsonBody();
            $type = $body['type'] ?? '';
            $itemId = $body['itemId'] ?? '';
            $quantity = (float) ($body['quantity'] ?? 0);
            $note = trim($body['note'] ?? '');

            if (!in_array($type, ['in', 'out'], true)) {
                jsonResponse(['success' => false, 'message' => 'Tipe transaksi tidak valid.']);
            }
            if ($quantity <= 0) {
                jsonResponse(['success' => false, 'message' => 'Jumlah tidak valid.']);
            }

            $stmt = $db->prepare('SELECT * FROM inventory WHERE id = ?');
            $stmt->execute([$itemId]);
            $item = $stmt->fetch();
            if (!$item) {
                jsonResponse(['success' => false, 'message' => 'Barang tidak ditemukan.']);
            }

            $stock = (float) $item['stock'];
            if ($type === 'out' && $stock < $quantity) {
                jsonResponse([
                    'success' => false,
                    'message' => 'Stok tidak cukup. Tersedia: ' . $stock . ' ' . $item['unit'],
                ]);
            }

            $db->beginTransaction();
            try {
                if ($type === 'in') {
                    $newStock = round($stock + $quantity, 2);
                } else {
                    $newStock = round($stock - $quantity, 2);
                }
                $upd = $db->prepare('UPDATE inventory SET stock = ? WHERE id = ?');
                $upd->execute([$newStock, $itemId]);

                $txId = newId('tx');
                $today = date('Y-m-d');
                $ins = $db->prepare(
                    'INSERT INTO transactions (id, type, item_id, item_name, quantity, unit, note, user_id, user_name, tx_date)
                     VALUES (?,?,?,?,?,?,?,?,?,?)'
                );
                $ins->execute([
                    $txId,
                    $type,
                    $itemId,
                    $item['name'],
                    $quantity,
                    $item['unit'],
                    $note,
                    $user['id'],
                    $user['name'],
                    $today,
                ]);
                $db->commit();

                $stmt = $db->prepare('SELECT * FROM transactions WHERE id = ?');
                $stmt->execute([$txId]);
                jsonResponse(['success' => true, 'data' => rowToTransaction($stmt->fetch())]);
            } catch (Throwable $e) {
                $db->rollBack();
                throw $e;
            }
            break;

        case 'users':
            requireRole(['admin']);
            $stmt = $db->query('SELECT id, username, name, role FROM users ORDER BY name ASC');
            jsonResponse(['success' => true, 'data' => $stmt->fetchAll()]);
            break;

        case 'user_save':
            requireRole(['admin']);
            $body = getJsonBody();
            $id = $body['id'] ?? '';
            $name = trim($body['name'] ?? '');
            $username = trim($body['username'] ?? '');
            $password = $body['password'] ?? '';
            $role = $body['role'] ?? 'barista';

            if ($id) {
                if ($password !== '') {
                    $stmt = $db->prepare('UPDATE users SET name=?, username=?, password=?, role=? WHERE id=?');
                    $stmt->execute([$name, $username, $password, $role, $id]);
                } else {
                    $stmt = $db->prepare('UPDATE users SET name=?, username=?, role=? WHERE id=?');
                    $stmt->execute([$name, $username, $role, $id]);
                }
            } else {
                if ($password === '') {
                    jsonResponse(['success' => false, 'message' => 'Password wajib diisi.']);
                }
                $chk = $db->prepare('SELECT id FROM users WHERE username = ?');
                $chk->execute([$username]);
                if ($chk->fetch()) {
                    jsonResponse(['success' => false, 'message' => 'Username sudah dipakai.']);
                }
                $id = newId('u');
                $stmt = $db->prepare('INSERT INTO users (id, username, password, name, role) VALUES (?,?,?,?,?)');
                $stmt->execute([$id, $username, $password, $name, $role]);
            }
            jsonResponse(['success' => true]);
            break;

        case 'settings':
            requireRole(['admin']);
            $stmt = $db->query('SELECT * FROM settings');
            jsonResponse(['success' => true, 'data' => settingsToObject($stmt->fetchAll())]);
            break;

        case 'settings_save':
            requireRole(['admin']);
            $body = getJsonBody();
            $pairs = [
                'cafe_name' => $body['cafeName'] ?? 'Stokbar Umatis',
                'low_stock_notify' => !empty($body['lowStockNotify']) ? '1' : '0',
                'currency' => $body['currency'] ?? 'IDR',
            ];
            $stmt = $db->prepare(
                'INSERT INTO settings (setting_key, setting_value) VALUES (?,?)
                 ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)'
            );
            foreach ($pairs as $k => $v) {
                $stmt->execute([$k, $v]);
            }
            jsonResponse(['success' => true]);
            break;

        default:
            jsonResponse(['success' => false, 'message' => 'Action tidak dikenal: ' . $action], 404);
    }
} catch (Throwable $e) {
    jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
}
