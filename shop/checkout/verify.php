<?php
session_start();
require 'config.php';

if (!isset($_GET['reference'])) {
    die("Invalid request.");
}

$reference = htmlspecialchars($_GET['reference']);
$paystack_secret_key = "sk_test_2b5c1066ff9f90f1d40a0ff22f254de0e006700e";

// Verify payment with Paystack API
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://api.paystack.co/transaction/verify/" . $reference);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer " . $paystack_secret_key,
    "Content-Type: application/json"
]);

$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);

// Log response for debugging
file_put_contents("log.txt", "Paystack Full Response: " . print_r($result, true) . "\n", FILE_APPEND);

// Check if Paystack verification was successful
if ($result['status'] && isset($result['data']) && $result['data']['status'] === "success") {
    $amount = $result['data']['amount'] / 100; // Convert from kobo to naira
    $email = $result['data']['customer']['email'] ?? "";
    $status = "pending"; // Default status before inserting
    $payment_mode = "Paystack";
    $created_at = date("Y-m-d H:i:s");
    $phone = $result['data']['customer']['phone'];

    // Retrieve metadata safely
    $metadata = $result['data']['metadata']['custom_fields'] ?? [];
    $user_id = 0;
    $firstName = $lastName = $address = "";

    foreach ($metadata as $field) {
        if (isset($field['variable_name']) && isset($field['value'])) { 
            if ($field['variable_name'] === 'userId') { 
                $user_id = (int) preg_replace('/\D/', '', $field['value']); // Remove non-numeric characters
            } elseif ($field['variable_name'] === 'firstName') {
                $firstName = $field['value'];
            } elseif ($field['variable_name'] === 'lastName') {
                $lastName = $field['value'];
            } elseif ($field['variable_name'] === 'address') {
                $address = $field['value'];
            } elseif ($field['variable_name'] === 'phone' && !empty($field['value'])) {
                $phone = $field['value'];
            }
        }
    }    

    if ($user_id === 0) {
        file_put_contents("log.txt", "User ID Extraction Failed\n", FILE_APPEND);
        echo json_encode(["status" => "error", "message" => "User ID is invalid"]);
        exit();
    }

    // Insert payment details into the database
    $query = "INSERT INTO orders (user_id, firstName, lastName, email, phone, address, total_price, payment_mode, reference, status, created_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($query);
    if ($stmt) {
        $stmt->bind_param("issssssssss", $user_id, $firstName, $lastName, $email, $phone, $address, $amount, $payment_mode, $reference, $status, $created_at);

        if ($stmt->execute()) {
            file_put_contents("log.txt", "Order Inserted Successfully: Reference = " . $reference . " | Status = " . $status . "\n", FILE_APPEND);
            
            // ✅ Now update the status to "paid" after inserting
            $status = "paid";
            $updateQuery = "UPDATE orders SET status = ? WHERE reference = ?";
            $updateStmt = $conn->prepare($updateQuery);
            if ($updateStmt) {
                $updateStmt->bind_param("ss", $status, $reference);
                $updateStmt->execute();
                $updateStmt->close();
            }

            $_SESSION['order_reference'] = $reference;
            header("Location: order_success.php");
            exit();
        } else {
            file_put_contents("log.txt", "Database Insert Error: " . $stmt->error . "\n", FILE_APPEND);
        }
        $stmt->close();
    } else {
        file_put_contents("log.txt", "SQL Statement Preparation Failed: " . $conn->error . "\n", FILE_APPEND);
        echo json_encode(["status" => "error", "message" => "Database statement preparation failed"]);
    }
} else {
    file_put_contents("log.txt", "Invalid Order Reference: " . $reference . "\n", FILE_APPEND);
    echo json_encode(["status" => "error", "message" => "Invalid Order Reference"]);
}

?>
