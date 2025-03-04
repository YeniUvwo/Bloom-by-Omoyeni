import { getCart, saveCart } from '/../assets/js/cartUtils.js';

document.addEventListener('DOMContentLoaded', () => {
      // Load and display cart items
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      if (cart.length > 0) {
          displayCartItems(cart);
      } else {
          // Display a message if the cart is empty
          document.getElementById("cart-items").innerHTML = "<p>Your cart is empty.</p>";
      }
      
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
      const shippingText = radio.closest('.location-option').querySelector('p').textContent.toLowerCase();
      const strongElement = radio.closest('.location-option')?.querySelector('strong');
      
      let selectedShipping = 0;
      let shippingMethod = "delivery"; // Default is delivery

      if (shippingText.includes("pickup")) {
        shippingMethod = "pickup";
        selectedShipping = 0;
      } else if (strongElement) {
        selectedShipping = parseInt(strongElement.textContent.replace(/[^\d]/g, ''), 10);
      }

      // Store shipping method and cost in sessionStorage
      sessionStorage.setItem("shippingMethod", shippingMethod);
      sessionStorage.setItem("shippingCost", selectedShipping);

      console.log("🚚 Shipping method and cost updated:", shippingMethod, selectedShipping);

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
  const totalAmountContainer = totalAmountElement.closest('.total-amount-container');
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

// ✅ Get Selected Shipping Cost
function getSelectedShipping() {
  const selectedOption = document.querySelector('.location-option input[type="radio"]:checked');

  if (!selectedOption) return 0;

  const shippingText = selectedOption.closest('.location-option').querySelector('strong').textContent.trim().toLowerCase();

  if (shippingText.includes("pickup")) {
    return 0;
  }

  return parseInt(shippingText.replace(/[^\d]/g, ''), 10);
}

// ✅ Handle Checkout Button Click
document.querySelector(".checkout-button").addEventListener("click", function (event) {
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

  // Store data in sessionStorage
  sessionStorage.setItem("cart", JSON.stringify(cart));
  sessionStorage.setItem("subtotal", subtotal);
  sessionStorage.setItem("shippingCost", shippingCost);
  sessionStorage.setItem("totalAmount", totalAmount);
  sessionStorage.setItem("pickup", pickupSelected ? "true" : "false");
  sessionStorage.setItem("shippingMethod", pickupSelected ? "pickup" : "delivery");

  console.log("🚀 Storing data before checkout:");
  console.log("Cart:", sessionStorage.getItem("cart"));
  console.log("Pickup Selected:", sessionStorage.getItem("pickup"));
  console.log("Shipping Method:", sessionStorage.getItem("shippingMethod"));
  console.log("Shipping Cost:", sessionStorage.getItem("shippingCost"));

  setTimeout(() => {
    window.location.href = "../checkout/index.html";
  }, 300);
});