import { formatPrice, getCart, saveCart, updateCartCount} from "../assets/js/cartUtils.js";

// ✅ 1. Toggle Cart Modal
const cartModal = document.getElementById('cart-modal');  
const overlay = document.getElementById('overlay');
const cartIconButton = document.getElementById('cart-icon');  
const closeCartButton = document.getElementById('close-cart'); 

cartIconButton.addEventListener('click', (e) => {
  e.preventDefault();
  toggleCartModal(true);
  displayCartModalItems();
  updateCartCount();
  updateCartSubtotal();
});

function toggleCartModal(isOpen) {
  cartModal.classList.toggle('open', isOpen);
  overlay.classList.toggle('show', isOpen);
}

closeCartButton?.addEventListener('click', () => toggleCartModal(false));
overlay?.addEventListener('click', () => toggleCartModal(false));

// ✅ 2. Fetch and Display Products
let products = [];

fetch('../assets/data/product.json')
  .then(response => {
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return response.json();
  })
  .then(data => {
    products = data;
    addDataToHTML();
  })
  .catch(error => {
    console.error("Failed to fetch products:", error);
    document.querySelector('.product-content').innerHTML = '<p class="product-load-fail">Failed to load products.</p>';
  });

// ✅ 3. Function to dynamically add product data to the page
function addDataToHTML() {
  const cart = getCart();
  let productContent = document.querySelector('.product-content');

  productContent.innerHTML = '';

  if (products.length) {
    products.forEach(product => {
      const isAdded = cart.some(item => item.id === product.id);
      let newProduct = document.createElement('div');
      newProduct.classList.add('item');

      newProduct.innerHTML = `
        <div class="row-img">
          <img src="${product.img}" alt="${product.name}">
          <div class="row-left">
            <button
              class="add-to-cart"
              data-id="${product.id}"
              data-name="${product.name}"
              data-price="${product.price}"
              ${isAdded ? 'disabled' : ''}>
              ${isAdded ? 'Added' : product.inStock ? 'Add to Cart' : 'Out of Stock'}
              <i class="fa-solid fa-cart-shopping"></i>
            </button>
          </div>
        </div>
        <h3>${product.name}</h3>
        <div class="stars">
          <a href="#"><i class="fa-solid fa-star" style="color: #FFD43B;"></i></a>
          <a href="#"><i class="fa-solid fa-star" style="color: #FFD43B;"></i></a>
          <a href="#"><i class="fa-solid fa-star" style="color: #FFD43B;"></i></a>
          <a href="#"><i class="fa-solid fa-star" style="color: #FFD43B;"></i></a>
        </div>
        <div class="row-right">
          <p class="product-price">${formatPrice(product.price)}</p>
        </div>
      `;

      productContent.appendChild(newProduct);

      // ✅ Handle Add to Cart
      const addToCartButton = newProduct.querySelector('.add-to-cart');
      addToCartButton.addEventListener('click', () => {
        handleProductClick(product.id, product.name, product.price, product.img, addToCartButton);
      });
    });
  }
}

// ✅ 4. Display Items in the Cart Modal
function displayCartModalItems() {
  const cart = getCart();
  const cartContent = document.querySelector('.cart-content');
  const subtotalElement = document.querySelector('#subtotal');

  if (!cartContent) return;

  let subtotal = 0;

  if (cart.length === 0) {
    cartContent.innerHTML = `
      <div class="empty-cart-modal">
        <img src="../assets/images/oh-no.png" alt="Empty Cart">
        <h2>Your cart is currently empty.</h2>
        <p>Add items from shop to proceed.</p>
      </div>`;
      subtotalElement.textContent = "₦0";
    return;
  }

  cartContent.innerHTML = cart
    .map(item => {
      subtotal += item.price * item.quantity;
      return`
      <div class="cart-item">
        <img src="${item.img}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-details">
          <h6>${item.name}</h6>
          <div class="cart-item-quantity">
            <button class="quantity-btn minus" data-id="${item.id}">-</button>
            <span class="quantity">${item.quantity}</span>
            <button class="quantity-btn plus" data-id="${item.id}">+</button>
          </div>
          <p class="cart-item-total">${formatPrice(item.price * item.quantity)}</p>
        </div>
        <button class="remove-item" data-id="${item.id}">&times;</button>
      </div>
  `})
  .join('');

  subtotalElement.textContent = formatPrice(subtotal);
  setupCartButtons();
}

// ✅ 5. Handle Quantity & Remove Buttons inside Cart Modal (Event Delegation)
document.querySelector('.cart-content').addEventListener('click', (e) => {
  let cart = getCart();
  const id = parseInt(e.target.dataset.id, 10);
  let itemIndex = cart.findIndex(item => item.id == id);

  if (itemIndex === -1) return;  

  if (e.target.classList.contains('minus')) {
      if (cart[itemIndex].quantity > 1) {
          cart[itemIndex].quantity--;
      } else {
          cart.splice(itemIndex, 1);
      }
  } else if (e.target.classList.contains('plus')) {
      cart[itemIndex].quantity++;
  } else if (e.target.classList.contains('remove-item')) {
      cart.splice(itemIndex, 1);
  }

  saveCart(cart);
  displayCartModalItems();
  updateCartCount();
  updateCartSubtotal();
  toggleCartButtons();
});

// ✅ 6. Update cart subtotal
function updateCartSubtotal() {
  const cart = getCart();
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const subtotalElement = document.getElementById('subtotal');
  if (subtotalElement) {
    subtotalElement.textContent = formatPrice(subtotal);
  }
}

// ✅ 7. Initialize the cart count when the page loads
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  displayCartModalItems();
  updateCartSubtotal();
  toggleCartButtons();
})

// ✅ Prevent checkout if cart is empty
// document.querySelector('.btn-checkout').addEventListener('click', (event) => {
//   if (cart.length === 0) {
//     event.preventDefault();
//   }
// });

// ✅ Prevent view cart if cart is empty
document.querySelector('.btn-viewcart').addEventListener('click', (event) => { 
  if (cart.length === 0) {
    event.preventDefault();
  }
});

// ✅ Disable "View Cart" and "Checkout" buttons when cart is empty
function toggleCartButtons() {
  const cart = getCart();
  // const checkoutButton = document.querySelector('.btn-checkout');
  const viewCartButton = document.querySelector('.btn-viewcart');

  if (!viewCartButton) return;

  if (cart.length === 0) {
      // checkoutButton.classList.add('disabled');
      // checkoutButton.setAttribute('aria-disabled', 'true');
      // checkoutButton.style.pointerEvents = "none"; 

      viewCartButton.classList.add('disabled');
      viewCartButton.setAttribute('aria-disabled', 'true');
      viewCartButton.style.pointerEvents = "none";
  } else {
      // checkoutButton.classList.remove('disabled');
      // checkoutButton.removeAttribute('aria-disabled');
      // checkoutButton.style.pointerEvents = "auto"; 

      viewCartButton.classList.remove('disabled');
      viewCartButton.removeAttribute('aria-disabled');
      viewCartButton.style.pointerEvents = "auto";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  fetch("../assets/data/bestsellers.json")
    .then(response => response.json())
    .then(data => {
      const bestSellersContainer = document.querySelector(".selling-content");

      bestSellersContainer.innerHTML = data.map(item => {
        let formattedImgPath = `/assets/images/${item.img.split('/').pop()}`;
        return`
        <div class="selling-col" data-id="${item.id}" data-price="${item.price}">
            <div class="selling-col-img">
              <img src="${formattedImgPath}" alt="${item.name}">
            </div>
            <div class="selling-col-icon">
              <a href="#" class="add-to-cart" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}" data-img="${item.img}">
              <i class="ri-shopping-cart-line"></i>
                </a>
            </div>
        </div>
      `}).join("");

      document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          const id = parseInt(this.dataset.id);
          const name = this.dataset.name;
          const price = parseInt(this.dataset.price);
          const img = this.dataset.img;
          addToCart(id, name, price, img);
        });
      });
      
     setupBestSellers();
    })
    .catch(error => console.error("Error loading Best Sellers:", error));
});

// ✅ Handle Best Seller Products
function setupBestSellers() {
  const bestSellers = document.querySelectorAll('.selling-col');

  bestSellers.forEach((productCard) => {
      const addToCartButton = productCard.querySelector('.add-to-cart');

      if (!addToCartButton) return;  // Skip if no button

      const id = parseInt(productCard.getAttribute('data-id'), 10);
      const img = productCard.querySelector('img').src;
      const name = productCard.querySelector('img').alt.trim();
      const price = parseFloat(productCard.getAttribute('data-price')) || 0;

      addToCartButton.addEventListener('click', () => {
        handleBestSellerClick(id, name, price, img, addToCartButton);
      });
  });
}

// ✅ Helper function for adding Best Seller items
function handleBestSellerClick(id, name, price, img, button) {
  const cart = getCart();
  const existingItem = cart.find(item => item.id === id);

  if (existingItem) {
      existingItem.quantity++; // ✅ Increment quantity
  } else {
      cart.push({ id, name, price, quantity: 1, img }); // ✅ Add new item
  }

  saveCart(cart);
  updateCartCount();
  displayCartModalItems();
  toggleCartButtons();
  setupCartButtons(); 

  // ✅ Reset button after 2 seconds
  setTimeout(() => {
      button.innerHTML = `<i class="ri-shopping-cart-line"></i>`;
      button.style.backgroundColor = "";
      button.style.color = "";
      button.style.border = "";
  }, 2000);
}

// ✅ Also update normal product click handler
function handleProductClick(id, name, price, img, button) {
  const cart = getCart();
  const existingItem = cart.find(item => item.id === id);

  if (existingItem) {
    existingItem.quantity++; // ✅ Increment quantity if item exists
  } else {
    cart.push({ id, name, price, quantity: 1, img }); // ✅ Add new item
  }

  saveCart(cart);
  updateCartCount();
  displayCartModalItems();
  toggleCartButtons();

  // ✅ Provide visual feedback on button
  button.textContent = 'Added!';
  button.disabled = true;
  button.style.backgroundColor = "#28a745"; // Green
  button.style.color = "white";
  button.style.border = "1px solid #28a745";

  // ✅ Reset button after 2 seconds
  setTimeout(() => {
    button.textContent = 'Add to Cart';
    button.disabled = false;
    button.style.backgroundColor = "";
    button.style.color = "";
    button.style.border = "";
  }, 2000);
}

// ✅ Run Best Seller setup when the page loads
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  displayCartModalItems();
  updateCartSubtotal();
  
  if (!window.bestSellerSetup) {  // ✅ Prevent multiple calls
      setupBestSellers();
      window.bestSellerSetup = true;
  }

  toggleCartButtons();
});

// ✅ Handle Quantity & Remove Buttons inside Cart Modal (Event Delegation)
function setupCartButtons() {
  const cartContent = document.querySelector('.cart-content');
  
  // ✅ Remove existing event listeners before adding new ones
  cartContent.removeEventListener('click', handleCartButtonClick);
  cartContent.addEventListener('click', handleCartButtonClick);
}

// ✅ Handle cart button clicks
function handleCartButtonClick(event) {
  let cart = getCart();
  const id = parseInt(event.target.dataset.id, 10);
  let itemIndex = cart.findIndex(item => item.id === id);

  if (itemIndex === -1) return;

  if (event.target.classList.contains('minus')) {
    if (cart[itemIndex].quantity > 1) {
      cart[itemIndex].quantity--;
    } else {
      cart.splice(itemIndex, 1);
    }
  } else if (event.target.classList.contains('plus')) {
    cart[itemIndex].quantity++;
  } else if (event.target.classList.contains('remove-item')) {
    cart.splice(itemIndex, 1);
  }

  saveCart(cart);
  displayCartModalItems();
  updateCartCount();
  updateCartSubtotal();
  toggleCartButtons();
}

// ✅ Ensure the cart buttons are set up correctly
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  displayCartModalItems();
  updateCartSubtotal();
  toggleCartButtons();
  setupCartButtons();  // ✅ Set up cart buttons once
});
