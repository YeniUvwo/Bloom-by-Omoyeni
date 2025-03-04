<?php
session_start();
error_log("Session Data Retrieved in success.php: " . print_r($_SESSION, true));

// Retrieve data from query parameters
$order_id  = $_GET['order_id'] ?? "Unknown";
$firstName = $_GET['firstName'] ?? "Not Provided";
$lastName  = $_GET['lastName'] ?? "";
$email     = $_GET['email'] ?? "Not Provided";
$fullName  = trim("$firstName $lastName");

error_log("Order ID: $order_id, Name: $fullName, Email: $email");
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Complete</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <div class="text-center mb-4">
            <h2 class="text-success">Payment Successful!</h2>
        </div>

        <div class="alert alert-info">
            <p>Your order has been placed successfully. Thank you.</p>
            <p>A confirmation email has been sent to <?php echo htmlspecialchars($email); ?>.</p>
        </div>

        <div class="card">
            <div class="card-header">
                <h4>Order Details</h4>
            </div>
            <div class="card-body">
                <p><strong>Order Number:</strong> <span id="order-id"><?php echo htmlspecialchars($order_id); ?></span></p>
                <p><strong>Name:</strong> <span id="full-name"><?php echo htmlspecialchars($fullName); ?></span></p>
                <p><strong>Email:</strong> <span id="email"><?php echo htmlspecialchars($email); ?></span></p>
            </div>
        </div>

        <div class="text-center mt-4">
            <a href="../index.html" class="btn btn-success">Return to Home</a>
        </div>
    </div>

    <script>
        document.addEventListener("DOMContentLoaded", function () {
            console.log("✅ Success page loaded.");
            console.log("🔍 Checking sessionStorage after redirection:", sessionStorage);

            // Clear sessionStorage and localStorage after a delay
            setTimeout(() => {
                console.log("🧹 Clearing sessionStorage and localStorage now...");
                sessionStorage.clear();
                localStorage.removeItem("cart");
            }, 5000);
        });
    </script>
</body>
</html>