<?php
   ob_start();
   session_start();
   include 'config.php';

   // Fetch the latest successful order
   $sql = "SELECT * FROM orders WHERE status = 'paid' ORDER BY id DESC LIMIT 1"; 
   $stmt = $conn->prepare($sql);
   $stmt->execute();
   $result = $stmt->get_result();

   if ($result->num_rows > 0) {
       $order = $result->fetch_assoc();
   } else {
       die("No successful order found.");
   }
?>

<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="shortcut icon" href="../../assets/images/favicon_io/favicon.ico" type="image/x-icon">
        <title>Order Successful</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 50px;
            }
            .container {
                max-width: 500px;
                margin: auto;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 10px;
                background: #f9f9f9;
            }
            h2 {
                color: green;
            }
            .details {
                margin-top: 20px;
                text-align: left;
            }
            .details p {
                font-size: 16px;
            }
            .btn {
                display: inline-block;
                padding: 10px 20px;
                margin-top: 20px;
                background-color: green;
                color: white;
                text-decoration: none;
                border-radius: 5px;
            }
            .btn:hover {
                background-color: darkgreen;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>🎉 Order Successful! 🎉</h2>
            <p>Thank you for your order. Your payment has been confirmed.</p>

            <div class="details">
                <p><strong>Order ID:</strong> <?= htmlspecialchars($order['reference']) ?></p>
                <p><strong>Name:</strong> <?= htmlspecialchars($order['firstName'] . " " . $order['lastName']) ?></p>
                <p><strong>Phone:</strong> <?= htmlspecialchars($order['phone']) ?></p>
                <p><strong>Email:</strong> <?= htmlspecialchars($order['email']) ?></p>
                <p><strong>Total Price:</strong> ₦<?= number_format($order['total_price'], 2) ?></p>
                <p><strong>Payment Mode:</strong> <?= htmlspecialchars($order['payment_mode']) ?></p>
                <p><strong>Status:</strong> <?= ($order['status'] == "paid") ? "Paid" : "Pending" ?></p>
            </div>

            <a href="/bloombyomoyeni/shop/index.html" class="btn">Continue Shopping</a>
        </div>

    </body>
</html>
