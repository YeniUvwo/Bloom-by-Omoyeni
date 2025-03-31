<?php
require 'config.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $data = json_decode(file_get_contents("php://input"), true);
    $email = $data['email'] ?? '';
    $firstName = $data['firstName'] ?? '';
    $lastName = $data['lastName'] ?? '';
    $phone = $data['phone'] ?? '';
    $address = $data['address'] ?? '';
    $totalPrice = $data['totalPrice'] ?? 0;
    $paymentMode = $data['paymentMode'] ?? 'Paystack';
    $paymentId = $data['paymentId'] ?? '';

    $orderId = uniqid("FLWR_"); // Unique order ID

    // Insert order into database
    $stmt = $conn->prepare("INSERT INTO orders (user_id, firstName, lastName, email, phone, address, total_price, payment_mode, reference, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $status = "pending";
    $stmt->bind_param("ssssssdsss", $orderId, $firstName, $lastName, $email, $phone, $address, $totalPrice, $paymentMode, $paymentId, $status);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Order placed successfully!", "orderId" => $orderId]);
    } else {
        echo json_encode(["status" => "error", "message" => "Database error: " . $stmt->error]);
    }

    $stmt->close();
    $conn->close();
} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method Not Allowed"]);
}
?>
