<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$dataDir = __DIR__ . '/wkl_data';
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
}
$htaccess = $dataDir . '/.htaccess';
if (!file_exists($htaccess)) {
    @file_put_contents($htaccess, "Require all denied\nDeny from all\n");
}

$allowedKeys = [
    'users',
    'deletedDefaultUsers',
    'promos',
    'orders',
    'openTabs',
    'pendingQris',
    'attendance',
    'tables',
    'products',
    'expenses',
    'customers',
    'categories',
    'categoryLabels',
    'materials',
    'packaging'
];

$action = $_GET['action'] ?? '';

if ($action === 'ping') {
    echo json_encode(['ok' => true, 'serverTime' => date('c')]);
    exit;
}

if ($action === 'load_all') {
    $result = [];
    foreach ($allowedKeys as $k) {
        $file = $dataDir . '/' . $k . '.json';
        if (file_exists($file)) {
            $raw = @file_get_contents($file);
            $decoded = json_decode($raw, true);
            if ($decoded !== null) {
                $result[$k] = $decoded;
            }
        }
    }
    echo json_encode(['ok' => true, 'data' => $result, 'serverTime' => date('c')]);
    exit;
}

if ($action === 'save' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $key = $_GET['key'] ?? '';
    if (!in_array($key, $allowedKeys, true)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Invalid collection key']);
        exit;
    }

    $body = file_get_contents('php://input');
    $payload = json_decode($body, true);
    if (!is_array($payload) || !array_key_exists('data', $payload)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Missing data payload']);
        exit;
    }

    $file = $dataDir . '/' . $key . '.json';
    $tmp = $file . '.tmp.' . uniqid('', true);
    $encoded = json_encode($payload['data'], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    if ($encoded === false || @file_put_contents($tmp, $encoded, LOCK_EX) === false) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Failed to write data']);
        exit;
    }
    @rename($tmp, $file);
    echo json_encode(['ok' => true, 'key' => $key, 'updatedAt' => date('c')]);
    exit;
}

http_response_code(400);
echo json_encode(['ok' => false, 'error' => 'Unknown action']);
