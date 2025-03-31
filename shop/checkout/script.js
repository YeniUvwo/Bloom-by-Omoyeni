import { getCart } from "/../assets/js/cartUtils.js";

// Constants
const STORAGE_KEYS = {
  REDIRECTED: "redirected",
  SUBTOTAL: "subtotal",
  TOTAL_AMOUNT: "totalAmount",
  SHIPPING_METHOD: "shippingMethod",
  SHIPPING_COST: "shippingCost",
  ORDER_DETAILS: "orderDetails"
};

document.addEventListener("DOMContentLoaded", function () {
	 // ✅ Ensure cart is not empty before proceeding
	 const cart = getCart();

	 if (!cart || cart.length === 0) {
		 sessionStorage.clear();
		 setTimeout(() => window.location.href = "../index.html", 2000);
		 return;
	 }

	// ✅ Handle successful payment redirection
  const redirectedFlag = sessionStorage.getItem(STORAGE_KEYS.REDIRECTED);
  if (redirectedFlag === "true") {
      sessionStorage.removeItem(STORAGE_KEYS.REDIRECTED); // Remove flag immediately
      window.location.href = "http://127.0.0.1/bloombyomoyeni/shop/checkout/order_success.php";
  }  

  // ✅ Retrieve shipping details from sessionStorage
  let shippingMethod = sessionStorage.getItem(STORAGE_KEYS.SHIPPING_METHOD) || "delivery";
  let shippingCost = parseInt(sessionStorage.getItem(STORAGE_KEYS.SHIPPING_COST), 10) || 0;

  // ✅ Ensure subtotal is stored
  let subtotal = parseInt(sessionStorage.getItem(STORAGE_KEYS.SUBTOTAL), 10);
    if (!subtotal || isNaN(subtotal)) {
      subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      sessionStorage.setItem(STORAGE_KEYS.SUBTOTAL, subtotal)
    }

  // ✅ Display checkout details and set up shipping selection
  displayCheckoutDetails(cart, shippingMethod, shippingCost);
  autoFillUserInfo();

  // ✅ Attach event listener to checkout form
  const checkoutForm = document.getElementById("checkoutForm");
  if (checkoutForm) {
      checkoutForm.addEventListener("submit", handleCheckout);
  }
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
  sessionStorage.setItem(STORAGE_KEYS.SUBTOTAL, subtotal);
  sessionStorage.setItem(STORAGE_KEYS.TOTAL_AMOUNT, subtotal + shippingCost);
  sessionStorage.setItem(STORAGE_KEYS.SHIPPING_COST, shippingCost);

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
  localStorage.setItem(STORAGE_KEYS.SUBTOTAL, subtotal);
  localStorage.setItem(STORAGE_KEYS.TOTAL_AMOUNT, totalAmount);
  localStorage.setItem(STORAGE_KEYS.SHIPPING_METHOD, shippingMethod);
  localStorage.setItem(STORAGE_KEYS.SHIPPING_COST, shippingCost);
}

// ✅ Checkout process
let checkoutProcessing = false;

function handleCheckout(event) {
  event.preventDefault();

  if (checkoutProcessing || sessionStorage.getItem("redirected") === "true") return;
  checkoutProcessing = true;

  sessionStorage.removeItem("redirected");
  document.getElementById("error-message").textContent = "";

  let firstName = document.getElementById("firstName")?.value.trim() || "";
  let lastName = document.getElementById("lastName")?.value.trim() || "";
  let email = document.getElementById("email")?.value.trim() || "";
  let phone = document.getElementById("phone")?.value.trim() || "0000000000";
  let address = document.getElementById("address")?.value.trim() || "Not Provided";
  let totalAmount = parseInt(sessionStorage.getItem(STORAGE_KEYS.TOTAL_AMOUNT), 10) || 0;

  // ✅ Generate a unique userId if not already set
  let userId = Math.floor(Math.random() * 1000000); // Unique ID
  sessionStorage.setItem("userId", userId);

  let orderId = userId + "_" + Date.now();
  
  let errors = validateCheckoutForm(firstName, lastName, email, phone, address, totalAmount);
  if (Object.keys(errors).length > 0) {
    for (let field in errors) {
      displayError(field, errors[field]);
    }
    checkoutProcessing = false;
    return;
  }

  // ✅ Store order details in session storage
  const orderDetails = {
    userId: userId,
    firstName: firstName,
    lastName: lastName,
    email: email,
    phone: phone,
    address: address,
    totalPrice: totalAmount,
    paymentMode: "Paystack",
    paymentId: ""
  };

  sessionStorage.setItem("orderDetails", JSON.stringify(orderDetails));

  let handler = PaystackPop.setup({
    key: "pk_test_3a662d07dfe3e3a74d308f8a4836b9bb73dbec84",
    email: email,
    amount: totalAmount * 100,
    currency: "NGN",
    ref: orderId,

    metadata: {
      custom_fields: [
        { display_name: "User ID", variable_name: "userId", value: userId },
        { display_name: "First Name", variable_name: "firstName", value: firstName },
        { display_name: "Last Name", variable_name: "lastName", value: lastName },
        { display_name: "Phone", variable_name: "phone", value: phone },
        { display_name: "Address", variable_name: "address", value: address }
      ]
    },
    callback: function (response) {
      sessionStorage.setItem("redirected", "true");
      orderDetails.paymentId = response.reference;
      sessionStorage.setItem("orderDetails", JSON.stringify(orderDetails));

      let verifyUrl = `http://127.0.0.1/bloombyomoyeni/shop/checkout/verify.php?reference=${response.reference}&userId=${userId}`;

      fetch(verifyUrl, { method: "GET" })
        .then(res => res.json())
        .then(data => {
          if (data && data.status === "success") {
            orderDetails.paymentId = response.reference;
            sessionStorage.setItem("orderDetails", JSON.stringify(orderDetails));

            // ✅ Set redirected flag **only after** successful verification
            sessionStorage.setItem("redirected", "true");
            setTimeout(() => {
              window.location.href = `http://127.0.0.1/bloombyomoyeni/shop/checkout/order_success.php?reference=${response.reference}`;
            }, 2000);
          } else {
            document.getElementById("error-message").textContent = `Payment verification failed: ${data.message}`;
            checkoutProcessing = false;
          }
        })
        .catch(error => {
          document.getElementById("error-message").textContent = `Error verifying payment: ${error}`;
          checkoutProcessing = false;
        });
    }
  });

  handler.openIframe();
}

// Function to validate checkout form
function validateCheckoutForm(firstName, lastName, email, phone, address, totalAmount) {
  let errors = {};

  if (!firstName) errors.firstName = "First name is required.";
  if (!lastName) errors.lastName = "Last name is required.";
  if (!email) errors.email = "Email is required.";
  if (!phone) errors.phone = "Phone number is required.";
  if (!address) errors.address = "Address is required.";
  if (totalAmount === 0) errors.totalAmount = "Total amount cannot be zero.";

  let phoneRegex = /^(\+234|0)[0-9]{10}$/;
  if (phone && !phoneRegex.test(phone)) {
      errors.phone = "Enter a valid phone number (10-11 digits).";
  }

  let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
      errors.email = "Enter a valid email address.";
  }

  return errors;
}

// Function to display error messages under inputs
function displayError(field, message) {
    let inputField = document.getElementById(field);
    if (!inputField) return;

    let errorElement = inputField.nextElementSibling;
    if (errorElement && errorElement.classList.contains("error-message")) {
        errorElement.textContent = message;
    } else {
        errorElement = document.createElement("div");
        errorElement.className = "error-message";
        errorElement.textContent = message;
        errorElement.style.color = "red";
        errorElement.style.fontSize = "0.875rem";
        errorElement.style.marginTop = "0.25rem";
        inputField.insertAdjacentElement("afterend", errorElement);
    }
}

// Function to clear all error messages
function clearErrorMessages() {
    let errorMessages = document.querySelectorAll(".error-message");
    errorMessages.forEach(error => error.remove());
}

// Attach event listener
document.getElementById("confirm-order-btn").addEventListener("click", handleCheckout);
