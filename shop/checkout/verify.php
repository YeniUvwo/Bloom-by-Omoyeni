<?php
session_start();
header("Content-Type: application/json");

error_reporting(E_ALL);
ini_set("display_errors", 1);

$logFile = __DIR__ . "/verify_log.txt";
file_put_contents($logFile, "✅ Step 1: verify.php started\n", FILE_APPEND);
flush();
sleep(1);

// ✅ Step 2: Check if `reference` is received
if (!isset($_GET['reference']) || empty($_GET['reference'])) {
    file_put_contents($logFile, "❌ Step 2: No reference supplied\n", FILE_APPEND);
    echo json_encode(["step" => 2, "message" => "No reference supplied"]);
    exit();
}

$reference = htmlspecialchars($_GET['reference']);
file_put_contents($logFile, "✅ Step 2: Reference received: " . $reference . "\n", FILE_APPEND);
flush();
sleep(1);

// ✅ Step 3: Load Config
file_put_contents($logFile, "✅ Step 3: Loading config.php\n", FILE_APPEND);
flush();
sleep(1);
require_once "config.php";
file_put_contents($logFile, "✅ Step 3.5: config.php successfully loaded\n", FILE_APPEND);
flush();
sleep(1);

// ✅ Step 4: Proceed with Paystack verification
file_put_contents($logFile, "✅ Step 4: Initiating Paystack verification...\n", FILE_APPEND);
flush();
sleep(1);

$url = "https://api.paystack.co/transaction/verify/" . rawurlencode($reference);
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer " . $PAYSTACK_SECRET]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

// ✅ Step 5: Log Paystack Response
file_put_contents($logFile, "✅ Step 5: Paystack API Response:\n" . $response . "\n", FILE_APPEND);
flush();
sleep(1);

// ✅ Step 6: Handle Errors
if (!$response) {
    file_put_contents($logFile, "❌ Step 6: cURL Error: " . $curlError . "\n", FILE_APPEND);
    echo json_encode(["status" => "error", "message" => "cURL Error: " . $curlError]);
    exit();
}

$result = json_decode($response, true);

// ✅ Step 7: Check if Payment was Successful
if ($httpCode === 200 && isset($result['data']['status']) && $result['data']['status'] === 'success') {
    $_SESSION['order_id'] = $reference;
    session_write_close();

    file_put_contents($logFile, "✅ Step 7: Payment Verified\n", FILE_APPEND);

    echo json_encode([
        "status" => "success",
        "message" => "Payment verified. Redirecting...",
        "redirect_url" => "success.php?order_id=" . urlencode($reference)
    ]);
    exit();
} else {
    file_put_contents($logFile, "❌ Step 7: Payment verification failed: " . json_encode($result) . "\n", FILE_APPEND);
    echo json_encode(["status" => "error", "message" => "Payment verification failed."]);
    exit();
}
