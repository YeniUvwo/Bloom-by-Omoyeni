<?php
error_reporting(E_ALL);
ini_set("display_errors", 1);

$logFile = __DIR__ . "/config_debug_log.txt";
file_put_contents($logFile, "✅ config.php execution started\n", FILE_APPEND);

// ✅ Step 1: Require Composer Autoload
if (!file_exists(__DIR__ . '/vendor/autoload.php')) {
    file_put_contents($logFile, "❌ vendor/autoload.php is missing\n", FILE_APPEND);
    exit(json_encode(["status" => "error", "message" => "vendor/autoload.php is missing"]));
}
require_once __DIR__ . '/vendor/autoload.php';
file_put_contents($logFile, "✅ vendor/autoload.php loaded\n", FILE_APPEND);

// ✅ Step 2: Load `.env` Variables
use Dotenv\Dotenv;
$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();
file_put_contents($logFile, "✅ .env file loaded\n", FILE_APPEND);

// ✅ Step 3: Validate PAYSTACK_SECRET
$PAYSTACK_SECRET = $_ENV['PAYSTACK_SECRET'] ?? "";
if (empty($PAYSTACK_SECRET)) {
    file_put_contents($logFile, "❌ PAYSTACK_SECRET is missing\n", FILE_APPEND);
    exit(json_encode(["status" => "error", "message" => "PAYSTACK_SECRET missing in .env"]));
}
file_put_contents($logFile, "✅ PAYSTACK_SECRET found\n", FILE_APPEND);

// ✅ Step 4: Database Connection
$servername = $_ENV['DB_HOST'] ?? 'localhost';
$username = $_ENV['DB_USERNAME'] ?? 'root';
$password = $_ENV['DB_PASSWORD'] ?? '';
$dbname = $_ENV['DB_NAME'] ?? 'phpecom';

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    file_put_contents($logFile, "❌ Database connection failed: " . $conn->connect_error . "\n", FILE_APPEND);
    exit(json_encode(["status" => "error", "message" => "Database connection failed"]));
}
file_put_contents($logFile, "✅ Database connected successfully\n", FILE_APPEND);
?>
