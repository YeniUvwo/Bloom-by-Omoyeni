import { getCart } from "/../assets/js/cartUtils.js";

document.addEventListener("DOMContentLoaded", function () {
	 // ✅ Ensure cart is not empty before proceeding
	 const cart = getCart();

	 if (!cart || cart.length === 0) {
		 sessionStorage.clear();
		 setTimeout(() => window.location.href = "../index.html", 2000);
		 return;
	 }

	// ✅ Handle successful payment redirection
	const redirectedFlag = sessionStorage.getItem("redirected");

	if (redirectedFlag === "true") {
			sessionStorage.removeItem("redirected"); // Remove flag
			window.location.href = "http://127.0.0.1/bloombyomoyeni/shop/checkout/success.php";
			return;
	}

  // ✅ Retrieve shipping details from sessionStorage
  let shippingMethod = sessionStorage.getItem("shippingMethod") || "delivery";
  let shippingCost = parseInt(sessionStorage.getItem("shippingCost"), 10) || 0;

  // ✅ Ensure subtotal is stored
  let subtotal = parseInt(sessionStorage.getItem("subtotal"), 10);
  if (!subtotal || isNaN(subtotal)) {
    subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    sessionStorage.setItem("subtotal", subtotal);
  }

  // ✅ Display checkout details and set up shipping selection
  displayCheckoutDetails(cart, shippingMethod, shippingCost);
  autoFillUserInfo();
});

// ✅ Function to auto-fill saved user info
function autoFillUserInfo() {
  ["firstName", "lastName", "email", "phone", "address"].forEach(id => {
    const value = localStorage.getItem(id) || "";
    if (document.getElementById(id)) document.getElementById(id).value = value;
  });
}

// ✅ Function to display checkout details
function displayCheckoutDetails(cart, shippingMethod, shippingCost) {

  if (!cart || cart.length === 0) {
    return;
  }

  // Calculate subtotal
  let subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // ✅ Ensure shipping cost is correct based on shipping method
  if (shippingMethod === "pickup") {
    shippingCost = 0;
  } else if (subtotal >= 100000) {
    shippingCost = 0;
  }

  // Update sessionStorage with correct values
  sessionStorage.setItem("subtotal", subtotal);
  sessionStorage.setItem("totalAmount", subtotal + shippingCost);
  sessionStorage.setItem("shippingCost", shippingCost);

  // Display cart items
  const cartItemsContainer = document.getElementById("cart-items");
  if (!cartItemsContainer) return;

  cartItemsContainer.innerHTML = cart.map(item => `
    <div class="checkout-item">
      <img src="${item.img.startsWith("http") ? item.img : `../${item.img}`}" alt="${item.name}" class="cart-item-img">
      <div class="inner-cart-item">
        <h6>${item.name}</h6>
        <p class="price">₦${item.price.toLocaleString('en-NG')} x ${item.quantity}</p>
      </div>
      <p class="quantity-price">₦${(item.price * item.quantity).toLocaleString('en-NG')}</p>
    </div>
  `).join('');

  // Update order summary
  updateOrderSummary(cart, shippingMethod, shippingCost);
}

// ✅ Function to update order summary
function updateOrderSummary(cart, shippingMethod, shippingCost) {
  let subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // ✅ Ensure shipping cost is correct based on shipping method
  if (shippingMethod === "pickup") {
    shippingCost = 0;
  }

  let shippingMessage = (shippingMethod === "pickup") 
    ? "Pickup - ₦0"
    : (subtotal >= 100000)
        ? "Free Delivery (₦100,000+ Orders)"
        : `₦${shippingCost.toLocaleString('en-NG')}`;

  const totalAmount = subtotal + shippingCost;

  // ✅ Update UI
  if (document.getElementById("subtotal")) {
    document.getElementById("subtotal").textContent = `${subtotal.toLocaleString('en-NG')}`;
  }
  if (document.getElementById("shipping")) {
    document.getElementById("shipping").textContent = shippingMessage;
  }
  if (document.getElementById("total-amount")) {
    document.getElementById("total-amount").textContent = `₦${totalAmount.toLocaleString('en-NG')}`;
  }

  // ✅ Update localStorage to match sessionStorage values
  localStorage.setItem("subtotal", subtotal);
  localStorage.setItem("totalAmount", totalAmount);
  localStorage.setItem("shippingMethod", shippingMethod);
  localStorage.setItem("shippingCost", shippingCost);
}

// ✅ Checkout process
let checkoutProcessing = false; 

function handleCheckout(event) {
    event.preventDefault();

    if (checkoutProcessing) {
        return;
    }
    checkoutProcessing = true;

		if (sessionStorage.getItem("redirected") === "true") {
			return;
		}

    let firstName = document.getElementById("firstName")?.value.trim() || "";
    let lastName = document.getElementById("lastName")?.value.trim() || "";
    let email = document.getElementById("email")?.value.trim() || "";
    let totalAmount = parseInt(sessionStorage.getItem("totalAmount"), 10) || 0;
    let orderId = "FLWR_" + Date.now();

    if (!email || totalAmount === 0 || !firstName) {
        document.getElementById("error-message").textContent = "Invalid payment details.";
        checkoutProcessing = false;
        return;
    }

    sessionStorage.setItem("orderId", orderId);
    sessionStorage.setItem("customerEmail", email);
    sessionStorage.setItem("customerFirstName", firstName);
    sessionStorage.setItem("customerLastName", lastName);

		localStorage.setItem("orderId", orderId);
		localStorage.setItem("customerFirstName", firstName);
		localStorage.setItem("customerLastName", lastName);
		localStorage.setItem("customerEmail", email);

    let handler = PaystackPop.setup({
        key: "pk_test_3a662d07dfe3e3a74d308f8a4836b9bb73dbec84",
        email: email,
        amount: totalAmount * 100,
        currency: "NGN",
        ref: orderId,
        callback: function (response) {
            // Set the redirected flag
            sessionStorage.setItem("redirected", "true");
        
            let verifyUrl = `http://127.0.0.1/bloombyomoyeni/shop/checkout/verify.php?reference=${response.reference}`;
        
           fetch(verifyUrl, {
							method: "POST", 
							headers: {
									"Content-Type": "application/json", 
							},
							body: JSON.stringify({ 
									reference: response.reference,
									firstName: firstName,
									lastName: lastName,
									email: email,
							}),
					})
					.then(res => res.json())
					.then(data => {
							if (data.status === "success") {
									setTimeout(() => {
											// Redirect to the success page with query parameters
											window.location.href = `http://127.0.0.1/bloombyomoyeni/shop/checkout/success.php?order_id=${encodeURIComponent(orderId)}&firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&email=${encodeURIComponent(email)}`;
									}, 2000);
							} else {
									document.getElementById("error-message").textContent = `Payment verification failed: ${data.message}`;
									checkoutProcessing = false;
							}
					})
					.catch(error => {
							document.getElementById("error-message").textContent = "Network error during payment verification.";
							checkoutProcessing = false;
					});
        },
        onClose: function () {
            document.getElementById("error-message").textContent = "Payment window closed. Try again.";
            checkoutProcessing = false;
        }
    });

    handler.openIframe();
}

// Attach event listener
document.getElementById("confirm-order-btn").addEventListener("click", handleCheckout);