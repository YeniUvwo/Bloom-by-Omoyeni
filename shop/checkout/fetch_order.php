<?php
require 'config.php';

if (!isset($_GET['reference'])) {
    echo json_encode(["status" => "error", "message" => "No reference provided"]);
    exit;
}

$reference = $_GET['reference'];
$query = "SELECT * FROM orders WHERE reference = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("s", $reference);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode($result->fetch_assoc());
} else {
    echo json_encode(["status" => "error", "message" => "Order not found"]);
}
?>
