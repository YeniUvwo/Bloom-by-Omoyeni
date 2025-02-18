import { getCart, saveCart} from '/../assets/js/cartUtils.js';

document.addEventListener('DOMContentLoaded', () => {
  displayCartItems();
  setupShippingSelection();
});

// ✅ Display Cart Items
function displayCartItems() {
  const cart = getCart();

  const cartContent = document.querySelector('.cart-content');
  let subtotal = 0;

  cartContent.innerHTML = cart.map(item => {
    subtotal += item.price * item.quantity;

    let imagePath = item.img;

    if (!imagePath.startsWith("/assets/")) {
      let currentPage = window.location.pathname;
      
      if (currentPage.includes("/shop/cart/")) {
        imagePath = `../../assets/images/${imagePath.split('/').pop()}`;
      }
      else if (currentPage.includes("/shop/")) {
        imagePath = `../assets/images/${imagePath.split('/').pop()}`;
      }
      else {
        imagePath = `/assets/images/${imagePath.split('/').pop()}`;
      }
    }

    return `
      <div class="cart-item">
        <img src="${imagePath}" alt="${item.name}" class="cart-item-img">
        <div class="inner-cart-item">
          <h6>${item.name}</h6>
          <p class="price">₦${item.price}</p>
          <div class="cart-item-quantity">
            <button class="quantity-btn minus" data-id="${item.id}">-</button>
            <span class="quantity">${item.quantity}</span>
            <button class="quantity-btn plus" data-id="${item.id}">+</button>
          </div>
        </div>
        <p class="quantity-price">₦${(item.price * item.quantity).toLocaleString('en-NG')}</p>
        <button class="remove-item" data-id="${item.id}">&times;</button>
      </div>
    `;
  }).join('');

  // Update subtotal display
  document.getElementById('subtotal').textContent = subtotal.toLocaleString('en-NG');

  const shippingCost = subtotal >= 100000 ? 0 : getSelectedShipping();
  updateTotalAmount(subtotal, shippingCost);

  const backToShopButton = `
    <div class="back-to-shop-container">
      <a href="../index.html" class="btn back-to-shop">← Back to Shop</a>
    </div>
  `;

  cartContent.innerHTML += backToShopButton;
}

// ✅ Handle Cart Item Quantity and Removal
document.addEventListener('click', (event) => {
  let cart = getCart();
  const id = parseInt(event.target.dataset.id);

  if (event.target.classList.contains('plus')) {
    // Increase quantity
    const item = cart.find(item => item.id === id);
    if (item) {
      item.quantity++;
      saveCart(cart);
      displayCartItems();
    }
  }

  if (event.target.classList.contains('minus')) {
    const item = cart.find(item => item.id === id);
    if (item && item.quantity > 1) {
      item.quantity--;
      saveCart(cart);
      displayCartItems();
    }
  }

  if (event.target.classList.contains('remove-item')) {
    cart = cart.filter(item => item.id !== id);
    saveCart(cart);

    if (cart.length === 0) {
      window.location.href = "/shop";
    } else {
      displayCartItems();
    }
  }
});

// ✅ Shipping Selection & Total Update
function setupShippingSelection() {
  document.querySelectorAll('.location-option input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => {
        const strongElement = radio.closest('.location-option')?.querySelector('strong');
        
        let selectedShipping = 0; 
        if (strongElement) {
            selectedShipping = parseInt(strongElement.textContent.replace(/[^\d]/g, ''), 10);
        }

        const subtotalElement = document.getElementById('subtotal');
        if (!subtotalElement) return; 

        const subtotal = parseInt(subtotalElement.textContent.replace(/[^\d]/g, ''), 10);
        const shippingCost = subtotal >= 100000 ? 0 : selectedShipping;

        updateTotalAmount(subtotal, shippingCost);
    });
  });
}

// ✅ Update Total Amount (Subtotal + Shipping)
function updateTotalAmount(subtotal, shipping = 0) {
  const totalAmountElement = document.getElementById('total-amount');
  const totalAmountContainer = totalAmountElement.closest('.total-amount-container'); // Adjust if needed
  const shippingContainer = document.querySelector('.shipping-container');

  totalAmountElement.textContent = (subtotal + shipping).toLocaleString('en-NG');

  if (subtotal >= 100000) {
    shippingContainer.style.display = "none";

    // ✅ Move Free Delivery Message above total-amount-container
    let freeDeliveryMessage = document.querySelector('.free-delivery');
    if (!freeDeliveryMessage) {
      freeDeliveryMessage = document.createElement('p');
      freeDeliveryMessage.classList.add('free-delivery');
      freeDeliveryMessage.innerHTML = "🎉 Free Delivery Applied!";
      totalAmountContainer.parentElement.insertBefore(freeDeliveryMessage, totalAmountContainer);
    }
  } else {
    // ✅ Show shipping options again if free delivery is not applicable
    shippingContainer.style.display = "block";

    // ✅ Ensure "Free Delivery" message is removed
    const freeDeliveryMessage = document.querySelector('.free-delivery');
    if (freeDeliveryMessage) freeDeliveryMessage.remove();
  }
}

function getSelectedShipping() {
  const selectedOption = document.querySelector('.location-option input[type="radio"]:checked');

  if (!selectedOption) return null;

  const shippingText = selectedOption.closest('.location-option').querySelector('strong').textContent.trim().toLowerCase();

  if (shippingText.includes("pickup")) {
    return 0;
  }

  return parseInt(shippingText.replace(/[^\d]/g, ''), 10);
}


document.addEventListener("DOMContentLoaded", function () {
  const checkoutButton = document.querySelector(".checkout-button");
  const shippingOptions = document.querySelectorAll(".location-option input[type='radio']");
  const subtotalElement = document.getElementById("subtotal");
  const cartSummaryContainer = document.querySelector(".cart-summary-container");

  // Create warning message element
  const warningMessage = document.createElement("p");
  warningMessage.classList.add("checkout-warning");
  warningMessage.textContent = "Please select a delivery option before proceeding to checkout.";
  warningMessage.style.display = "none"; // Hide initially
  cartSummaryContainer.appendChild(warningMessage); // Add warning below checkout button

  function updateCheckoutButton() {
    const subtotal = parseInt(subtotalElement.textContent.replace(/[^\d]/g, ""), 10);
    const selectedOption = document.querySelector(".location-option input[type='radio']:checked");

    if (subtotal >= 100000) {
      // ✅ If free delivery applies, enable checkout & hide warning
      checkoutButton.classList.remove("disabled");
      checkoutButton.style.pointerEvents = "auto";
      warningMessage.style.display = "none"; // Hide warning
    } else if (selectedOption) {
      // ✅ If user selects a delivery option, enable checkout
      checkoutButton.classList.remove("disabled");
      checkoutButton.style.pointerEvents = "auto";
      warningMessage.style.display = "none"; // Hide warning
    } else {
      // ❌ If subtotal is below 100k & no delivery selected, show warning
      checkoutButton.classList.add("disabled");
      checkoutButton.style.pointerEvents = "none";
      warningMessage.style.display = "block"; // Show warning
    }
  }

  // Disable checkout initially (only if subtotal is below 100k)
  updateCheckoutButton();

  // Listen for changes in shipping options
  shippingOptions.forEach(option => {
    option.addEventListener("change", updateCheckoutButton);
  });

  // Prevent checkout if no shipping option is selected and free delivery is not applied
  checkoutButton.addEventListener("click", (event) => {
    const subtotal = parseInt(subtotalElement.textContent.replace(/[^\d]/g, ""), 10);
    const selectedOption = document.querySelector(".location-option input[type='radio']:checked");

    if (subtotal < 100000 && !selectedOption) {
      event.preventDefault(); // Stop navigation
      warningMessage.style.display = "block"; // Show warning
    }
  });
});

document.querySelector(".checkout-button").addEventListener("click", function(event) {
  const cart = getCart();
  const subtotal = parseInt(document.getElementById("subtotal").textContent.replace(/[^\d]/g, ""), 10);
  const selectedOption = document.querySelector(".location-option input[type='radio']:checked");

  if (!selectedOption && subtotal < 100000) {
      event.preventDefault(); 
      document.getElementById("error-message").textContent = "Please select a shipping option before proceeding.";
      return;
  }

  let shippingCost = 0;
  let pickupSelected = false;

  if (selectedOption) {
    const shippingText = selectedOption.closest('.location-option').querySelector('strong').textContent.toLowerCase();
    if (shippingText.includes("pickup")) {
      pickupSelected = true;
      shippingCost = 0;
    } else {
      shippingCost = parseInt(shippingText.replace(/[^\d]/g, ''), 10);
    }
  }

  const totalAmount = subtotal + shippingCost;

  sessionStorage.setItem("cart", JSON.stringify(cart));
  sessionStorage.setItem("subtotal", subtotal);
  sessionStorage.setItem("shippingCost", shippingCost);
  sessionStorage.setItem("totalAmount", totalAmount);
  sessionStorage.setItem("pickup", pickupSelected ? "true" : "false");

  console.log("🚀 Storing data before checkout:");
  console.log("Cart:", sessionStorage.getItem("cart"));
  console.log("Pickup Selected:", sessionStorage.getItem("pickup"));

  setTimeout(() => {
    window.location.href = "../checkout/index.html";
  }, 300);
});

function removeFromCart(index) {
  let cart = JSON.parse(sessionStorage.getItem("cart")) || [];

  cart.splice(index, 1); 

  sessionStorage.setItem("cart", JSON.stringify(cart)); 

  updateCartUI();
}

console.log(sessionStorage.getItem("cart"));
console.log(sessionStorage.getItem("pickup"));
