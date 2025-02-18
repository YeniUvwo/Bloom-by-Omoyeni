<?php
// ✅ Prevent accidental whitespace output
ob_start(); // Start output buffering to prevent premature output

header("Content-Type: application/json");

error_reporting(E_ALL);
ini_set("display_errors", 1);

$logFile = __DIR__ . "/config_debug_log.txt";
file_put_contents($logFile, "✅ config.php execution started\n", FILE_APPEND);
flush();
sleep(1);

// ✅ Step 1: Require `vendor/autoload.php`
file_put_contents($logFile, "✅ Step 1: Checking vendor/autoload.php\n", FILE_APPEND);
if (!file_exists(__DIR__ . '/vendor/autoload.php')) {
    file_put_contents($logFile, "❌ Step 1: vendor/autoload.php is missing\n", FILE_APPEND);
    ob_end_clean(); // Clear buffer before sending error response
    echo json_encode(["status" => "error", "message" => "vendor/autoload.php is missing"]);
    exit();
}
require_once __DIR__ . '/vendor/autoload.php';
file_put_contents($logFile, "✅ Step 1: vendor/autoload.php loaded\n", FILE_APPEND);
flush();
sleep(1);

// ✅ Step 2: Load `.env` variables
file_put_contents($logFile, "✅ Step 2: Attempting to load .env file\n", FILE_APPEND);
use Dotenv\Dotenv;
$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();
file_put_contents($logFile, "✅ Step 2: .env file loaded successfully\n", FILE_APPEND);
flush();
sleep(1);

// ✅ Step 3: Check PAYSTACK_SECRET
$PAYSTACK_SECRET = $_ENV['PAYSTACK_SECRET'] ?? "";
if (empty($PAYSTACK_SECRET)) {
    file_put_contents($logFile, "❌ Step 3: PAYSTACK_SECRET is missing\n", FILE_APPEND);
    ob_end_clean(); // Clear buffer before sending error response
    echo json_encode(["status" => "error", "message" => "PAYSTACK_SECRET missing in .env"]);
    exit();
}
file_put_contents($logFile, "✅ Step 3: PAYSTACK_SECRET exists\n", FILE_APPEND);
flush();
sleep(1);

// ✅ Step 4: Final Log Before Exit
file_put_contents($logFile, "✅ Step 4: config.php is about to exit\n", FILE_APPEND);
flush();
sleep(1);

ob_end_clean(); // Clear any output before verify.php sends headers
