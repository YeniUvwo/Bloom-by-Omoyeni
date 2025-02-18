<?php
session_start();

// ✅ Debug: Print the GET request to check received values
error_log("Received GET Data: " . print_r($_GET, true));

// ✅ Retrieve order details from the URL parameters
$order_id  = $_GET['order_id'] ?? "Unknown";
$firstName = $_GET['firstName'] ?? "Not Provided";
$lastName  = $_GET['lastName'] ?? "";
$email     = $_GET['email'] ?? "Not Provided";
$fullName  = trim("$firstName $lastName");

// ✅ Debug: Log received values
error_log("Order ID: $order_id, Name: $fullName, Email: $email");

// ✅ Store details in session for persistence
$_SESSION['orderId'] = $order_id;
$_SESSION['customerFirstName'] = $firstName;
$_SESSION['customerLastName'] = $lastName;
$_SESSION['customerEmail'] = $email;
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
                <p><strong>Order Number:</strong> <?php echo htmlspecialchars($order_id); ?></p>
                <p><strong>Name:</strong> <?php echo htmlspecialchars($fullName); ?></p>
                <p><strong>Email:</strong> <?php echo htmlspecialchars($email); ?></p>
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

            setTimeout(() => {
                console.log("🧹 Clearing sessionStorage now...");
                sessionStorage.clear();
                localStorage.removeItem("cart");
            }, 5000);
        });
    </script>

</body>
</html>
