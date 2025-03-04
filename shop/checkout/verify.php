<?php
session_start();
header("Content-Type: application/json");

// Add CORS headers
header("Access-Control-Allow-Origin: *"); // Allow all domains (or specify your domain)
header("Access-Control-Allow-Methods: GET, POST, OPTIONS"); // Allow specific HTTP methods
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Allow specific headers

require_once "config.php";

// Retrieve JSON data from the request body
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['reference']) || empty($data['reference'])) {
    echo json_encode(["status" => "error", "message" => "No reference supplied"]);
    exit();
}

$reference = htmlspecialchars($data['reference']);

// ✅ Step 1: Call Paystack API
$url = "https://api.paystack.co/transaction/verify/" . rawurlencode($reference);
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer " . $PAYSTACK_SECRET]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if (!$response) {
    echo json_encode(["status" => "error", "message" => "cURL Error: " . $curlError]);
    exit();
}

$result = json_decode($response, true);

// ✅ Step 2: Handle Verification Result
if ($httpCode === 200 && isset($result['data']['status']) && $result['data']['status'] === 'success') {
    // Set session data
    $_SESSION['orderId'] = $reference;
    $_SESSION['customerFirstName'] = $data['firstName'] ?? "Not Provided";
    $_SESSION['customerLastName'] = $data['lastName'] ?? "";
    $_SESSION['customerEmail'] = $data['email'] ?? "Not Provided";

    // Debug: Log session data
    error_log("Session Data Set in verify.php: " . print_r($_SESSION, true));

    session_write_close(); // Ensure session is saved
    echo json_encode(["status" => "success", "message" => "Payment verified. Redirecting..."]);
    exit();
} else {
    echo json_encode(["status" => "error", "message" => "Payment verification failed."]);
    exit();
}
?>