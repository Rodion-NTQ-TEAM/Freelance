<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  exit; // для CORS preflight
}

$baseDir = __DIR__;
$dataDir = $baseDir . '/data';
if (!is_dir($dataDir)) mkdir($dataDir, 0777, true);

$projectsFile   = $dataDir . '/projects.json';
$newsFile       = $dataDir . '/news.json';
$apartmentsFile = $dataDir . '/apartments.json';

function readJson($file) {
  return file_exists($file) ? json_decode(file_get_contents($file), true) : [];
}
function saveJson($file, $data) {
  file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// === ROUTING ===
$uri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

if (strpos($uri, '/api/projects') !== false) {
  if ($method === 'GET') {
    echo json_encode(readJson($projectsFile), JSON_UNESCAPED_UNICODE);
  } elseif ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $data = readJson($projectsFile);
    $data[] = $body;
    saveJson($projectsFile, $data);
    echo json_encode(['ok' => true]);
  } elseif ($method === 'DELETE') {
    saveJson($projectsFile, []); echo json_encode(['ok'=>true]);
  }
  exit;
}

if (strpos($uri, '/api/news') !== false) {
  if ($method === 'GET') {
    echo json_encode(readJson($newsFile), JSON_UNESCAPED_UNICODE);
  } elseif ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $data = readJson($newsFile);
    $data[] = $body;
    saveJson($newsFile, $data);
    echo json_encode(['ok' => true]);
  } elseif ($method === 'DELETE') {
    saveJson($newsFile, []); echo json_encode(['ok'=>true]);
  }
  exit;
}

if (strpos($uri, '/api/apartments') !== false) {
  if ($method === 'GET') {
    echo json_encode(readJson($apartmentsFile), JSON_UNESCAPED_UNICODE);
  } elseif ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $data = readJson($apartmentsFile);
    $data[] = $body;
    saveJson($apartmentsFile, $data);
    echo json_encode(['ok' => true]);
  } elseif ($method === 'DELETE') {
    saveJson($apartmentsFile, []); echo json_encode(['ok'=>true]);
  }
  exit;
}

http_response_code(404);
echo json_encode(['error' => 'Unknown endpoint']);
