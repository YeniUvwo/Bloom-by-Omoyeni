<?php
session_start();
require_once '../auth/auth.php';

if (!isset($_SESSION['user']) || empty($_SESSION['user'])) {
    $user = validateToken($secretKey); 
    if (!$user) {
        header('Location: /auth/register?message=Please%20signup%20to%20continue.');
        exit();
    }
    
    $_SESSION['user'] = $user;
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" href="../assets/images/favicon_io/favicon.ico" type="image/x-icon">
    <title>Tips</title>
    <link rel="stylesheet" href="style.css">
</head>

<body>
    <div class="success-message">
        <h1>Hello <?php echo htmlspecialchars($_SESSION['user']['email']); ?></h1>
        <p class="thanks">Thank you for your purchase</p>
        <p>Your account has been created succesfully.</p>
        <p>For custom tips, please <a href="../tips/">click here</a></p>
        <canvas id="celebrationCanvas"></canvas>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
    <script src="script.js"></script>
</body>

</html>
