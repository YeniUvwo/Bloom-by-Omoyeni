function handleCheckout(event) {
  event.preventDefault(); // Prevent form submission for validation

  const name = document.getElementById('name').value.trim();
  const address = document.getElementById('address').value.trim();
  const payment = document.getElementById('payment').value;

  if (!name || !address || !payment) {
      alert('Please fill out all fields.');
      return false;
  }

  // Proceed with order confirmation
  alert('Order confirmed! Thank you for shopping with us.');
  localStorage.removeItem('cart'); // Clear the cart
  window.location.href = '../shop/index.html'; // Redirect to shop or home
  return true;
}
