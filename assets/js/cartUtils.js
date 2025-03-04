// ✅ Retrieve Cart from LocalStorage
export function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

// ✅ Save Cart to LocalStorage
export function saveCart(cart) {
  if (cart.length === 0) {
      localStorage.removeItem('cart'); // ✅ Clear storage when empty
  } else {
      localStorage.setItem('cart', JSON.stringify(cart));
  }
}

// ✅ Format Price Function
export function formatPrice(price) {
  if (typeof price !== 'number' || isNaN(price)) {
    console.error("formatPrice error: Expected a number but received", price);
    return "₦0";
  }
  return `₦${price.toLocaleString('en-NG')}`; 
}

// ✅ Update Cart Badge & Total
export function updateCartCount() {
  const cart = getCart();
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartBadge = document.querySelector('.cart-badge');
  const cartTotal = document.querySelector('.cart-total');

  const cartIcon = document.querySelector('.cart-icon i');
  cartIcon.classList.add('cart-flash');

  setTimeout(() => {
      cartIcon.classList.remove('cart-flash');
  }, 500);

  if (cartBadge) {
    cartBadge.textContent = totalItems > 0 ? totalItems : '';
    cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
  }

  if (cartTotal) {
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    cartTotal.textContent = formatPrice(subtotal);
  }
}

// ✅ Add Item to Cart
export function addToCart(id, name, price, img) {
  const cart = getCart();
  const existingItem = cart.find(item => item.id === id);

  let formattedImgPath = img;

  if (formattedImgPath.startsWith("http")) {
    formattedImgPath = `/assets/images/${formattedImgPath.split('/').pop()}`;
  } else if (formattedImgPath.includes("../assets/images/") || formattedImgPath.includes("assets/images/")) {
    formattedImgPath = `/assets/images/${formattedImgPath.split('/').pop()}`;
  }

  console.log(`✅ Final Img Path Stored: ${formattedImgPath}`); // Debugging

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ id, name, price, quantity: 1, img: formattedImgPath });
  }

  saveCart(cart);
  updateCartCount();
}

// ✅ Debounce Function (For Search Optimization)
export function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

export function resetShippingMethod() {
  console.log("🚀 Resetting shipping method and cost...");
  
  sessionStorage.setItem("shippingMethod", "pickup");
  localStorage.setItem("shippingMethod", "pickup");

  sessionStorage.setItem("shippingCost", "0");
  localStorage.setItem("shippingCost", "0");

  console.log("📦 Shipping Method Reset: pickup");
  console.log("🚚 Shipping Cost Reset: ₦0");
}
