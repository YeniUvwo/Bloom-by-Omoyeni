import { getCart } from "/../assets/js/cartUtils.js"; 

console.log("🔄 Page Loaded at:", new Date().toISOString());
console.log("🔎 Redirect Flag on Load:", sessionStorage.getItem("redirected"));


document.addEventListener("DOMContentLoaded", function () {
    console.log("🔄 Checkout page loaded at:", new Date().toISOString());

    // ✅ Debugging: Log sessionStorage on load
    console.log("🔎 Redirect Flag on Load:", sessionStorage.getItem("redirected"));

    // ✅ Prevent infinite redirects
    if (sessionStorage.getItem("redirected") === "true") {
        console.log("🚀 Redirect detected. Moving to success page...");
        sessionStorage.removeItem("redirected"); // ✅ Clear flag before navigating
        window.location.href = "http://127.0.0.1/bloombyomoyeni/shop/checkout/success.php";
        return;
    }

    // ✅ Handle successful payment redirection
    const redirectedFlag = sessionStorage.getItem("redirected");
    console.log("🔎 Checking redirected flag:", redirectedFlag);

    if (redirectedFlag === "true") {
        console.log("✅ Redirect flag found. Redirecting to success page...");
        sessionStorage.removeItem("redirected"); // Remove flag
        window.location.href = "http://127.0.0.1/bloombyomoyeni/shop/checkout/success.php";
        return;
    }

    // ✅ Ensure cart is not empty before proceeding
    console.log("🔍 Checking cart contents...");
    const cart = getCart();
    console.log("🛒 Cart:", cart);

    if (!cart || cart.length === 0) {
        console.warn("❌ No items in the cart. Redirecting to homepage...");
        sessionStorage.clear();
        setTimeout(() => window.location.href = "../index.html", 2000);
        return;
    }

    // ✅ Ensure subtotal is stored
    let subtotal = parseInt(sessionStorage.getItem("subtotal"), 10);
    if (!subtotal || isNaN(subtotal)) {
        subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        sessionStorage.setItem("subtotal", subtotal);
    }
    
    displayCheckoutDetails(cart);
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
function displayCheckoutDetails(cart) {
    console.log("🛒 Updating checkout details...");

    if (!cart || cart.length === 0) {
        console.warn("❌ Cart is empty. No subtotal to update.");
        return;
    }

    let subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let freeShippingThreshold = 100000;

    // 🔹 Debug: Check what is stored in sessionStorage
    console.log("🔎 Checking stored shipping cost...");
    let selectedShippingCost = sessionStorage.getItem("shippingCost");
    console.log("📦 Retrieved shippingCost from sessionStorage:", selectedShippingCost);

    // 🔹 Convert to number (fallback to 0 if null)
    let shippingCost = selectedShippingCost !== null ? parseInt(selectedShippingCost, 10) : 0;

    // 🔹 Apply free shipping logic **ONLY IF** subtotal >= ₦100,000
    if (subtotal >= freeShippingThreshold) {
        console.log("✅ Free shipping applied (₦100,000+ order)");
        shippingCost = 0; // ✅ Override with free shipping
    } else if (shippingCost === 0) {
        console.warn("🚨 Shipping cost is missing. Defaulting to ₦5,000.");
        shippingCost = 5000; // ✅ Default to standard delivery fee if no stored value
    }

    // 🔹 Store final values in sessionStorage
    sessionStorage.setItem("subtotal", subtotal);
    sessionStorage.setItem("totalAmount", subtotal + shippingCost);
    sessionStorage.setItem("shippingCost", shippingCost); // ✅ Ensure shipping cost is correctly saved

    console.log("🔢 Subtotal:", subtotal);
    console.log("🚚 Shipping Cost:", shippingCost);
    console.log("💰 Total Amount:", subtotal + shippingCost);

    // 🔹 Update UI
    if (document.getElementById("subtotal")) {
        document.getElementById("subtotal").textContent = `${subtotal.toLocaleString('en-NG')}`;
    }
    if (document.getElementById("shipping")) {
        document.getElementById("shipping").textContent = 
            shippingCost === 0 ? "Free (₦100,000+ Orders)" : `₦${shippingCost.toLocaleString('en-NG')}`;
    }
    if (document.getElementById("total-amount")) {
        document.getElementById("total-amount").textContent = `₦${(subtotal + shippingCost).toLocaleString('en-NG')}`;
    }

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
}

// ✅ Checkout process
let checkoutProcessing = false; // ✅ Prevents duplicate execution

function handleCheckout(event) {
    event.preventDefault();
    console.log("✅ Confirm Order button clicked!");

    if (checkoutProcessing) {
        console.warn("🚨 Checkout already in progress! Skipping duplicate execution...");
        return;
    }
    checkoutProcessing = true;

    console.log("🔎 Checking redirected flag:", sessionStorage.getItem("redirected"));
    if (sessionStorage.getItem("redirected") === "true") {
        console.warn("🚨 Already redirected! Preventing duplicate processing.");
        return;
    }

    let firstName = document.getElementById("firstName")?.value.trim() || "";
    let lastName = document.getElementById("lastName")?.value.trim() || "";
    let email = document.getElementById("email")?.value.trim() || "";
    let totalAmount = parseInt(sessionStorage.getItem("totalAmount"), 10) || 0;
    let orderId = "FLWR_" + Date.now();

    if (!email || totalAmount === 0 || !firstName) {
        console.error("❌ Missing required details!");
        document.getElementById("error-message").textContent = "Invalid payment details.";
        checkoutProcessing = false;
        return;
    }

    console.log("✅ Storing Order Details in SessionStorage...");
    sessionStorage.setItem("orderId", orderId);
    sessionStorage.setItem("customerEmail", email);
    sessionStorage.setItem("customerFirstName", firstName);
    sessionStorage.setItem("customerLastName", lastName);

    console.log("🚀 Initializing Paystack payment...");

    let handler = PaystackPop.setup({
        key: "pk_test_3a662d07dfe3e3a74d308f8a4836b9bb73dbec84",
        email: email,
        amount: totalAmount * 100,
        currency: "NGN",
        ref: orderId,
        callback: function (response) {
            console.log("✅ Payment successful! Reference:", response.reference);

            sessionStorage.setItem("redirected", "true");
            console.log("🔎 Redirect flag set.");

            let verifyUrl = `http://127.0.0.1/bloombyomoyeni/shop/checkout/verify.php?reference=${response.reference}`;
            console.log("🔍 Verifying payment at:", verifyUrl);

            console.log("🔎 Redirecting with order details:");
            console.log("🔎 Order ID:", orderId);
            console.log("🔎 First Name:", firstName);
            console.log("🔎 Last Name:", lastName);
            console.log("🔎 Email:", email);

            fetch(verifyUrl)
                .then(res => res.json())
                .then(data => {
                    console.log("🔄 Payment verification response:", data);

                    if (data.status === "success") {
                        console.log("✅ Payment verified. Redirecting...");

                        console.log("🔎 Stored Order ID:", sessionStorage.getItem("orderId"));
                        console.log("🔎 Stored Email:", sessionStorage.getItem("customerEmail"));
                        console.log("🔎 Stored Name:", sessionStorage.getItem("customerFirstName"), sessionStorage.getItem("customerLastName"));

                        window.onerror = function (message, source, lineno, colno, error) {
                            console.error("❌ Uncaught Error:", message, "at", source, "line", lineno);
                            console.error("📌 Stack Trace:", error.stack);
                        };
                        
                        setTimeout(() => {
                            console.log("✅ Redirecting to success page...");
                            window.location.href = `http://127.0.0.1/bloombyomoyeni/shop/checkout/success.php?order_id=${encodeURIComponent(orderId)}&firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&email=${encodeURIComponent(email)}`;
                        }, 2000);
                        
                    } else {
                        console.error("❌ Payment verification failed:", data.message);
                        document.getElementById("error-message").textContent = `Payment verification failed: ${data.message}`;
                        checkoutProcessing = false;
                    }
                })
                .catch(error => {
                    console.error("❌ Fetch error:", error);
                    document.getElementById("error-message").textContent = "Network error during payment verification.";
                    checkoutProcessing = false;
                });
        },
        onClose: function () {
            console.warn("❌ Payment window closed by user.");
            document.getElementById("error-message").textContent = "Payment window closed. Try again.";
            checkoutProcessing = false;
        }
    });

    console.log("🚀 Opening Paystack payment window...");
    handler.openIframe();
}


// Attach event listener
document.getElementById("confirm-order-btn").addEventListener("click", handleCheckout);

