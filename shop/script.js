// Ensure the page is fully loaded before running the script
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
  displayProducts(products);
  updateCartCount();
});

// Product Data
const products = [
  { id: "vase1", name: "Elegant Vase", price: 5000, category: "Vases", img: "images/elegant_vase.jpg", inStock: true },
  { id: "pot1", name: "Stylish Pot", price: 3000, category: "Pots", img: "images/stylish_vase.jpg", inStock: true },
  { id: "vase2", name: "Modern Vase", price: 7000, category: "Vases", img: "images/modern_vase.jpg", inStock: true },
];

// Function to display products
function displayProducts(productList) {
  const productContainer = document.getElementById('product-list');
  productContainer.innerHTML = '';
  productList.forEach(product => {
    productContainer.innerHTML += `
      <div class="col-md-4 mb-4">
        <div class="card">
          <img src="${product.img}" class="card-img-top" alt="${product.name}">
          <div class="card-body">
            <h5 class="card-title">${product.name}</h5>
            <p class="card-text">₦${product.price}</p>
            <button class="btn add-to-cart" data-id="${product.id} aria-label="Add ${product.name} to cart" 
                    data-name="${product.name}" data-price="${product.price}"
                    ${product.inStock ? '' : 'disabled'}>${product.inStock ? 'Add to Cart' : 'Out of Stock'}</button>
          </div>
        </div>
      </div>`;
  });
}

// Function to update cart count
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  document.getElementById('cart-count').innerHTML = `<i class="fa-solid fa-cart-shopping"></i> (${cart.length})`;
}

// Add to Cart functionality
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('add-to-cart')) {
    const id = e.target.dataset.id;
    const name = e.target.dataset.name;
    const price = parseFloat(e.target.dataset.price);
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push({ id, name, price, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert(`${name} has been added to your cart!`);
  }
});

// Search functionality
const searchInput = document.getElementById('productSearch');
const searchButton = document.getElementById('search-button');

searchButton.addEventListener('click', () => {
  filterProductsBySearch();
});

searchInput.addEventListener('input', () => {
  if (searchInput.value === '') {
    displayProducts(products);
  } else {
    filterProductsBySearch();
  }
});

function filterProductsBySearch() {
  const searchQuery = searchInput.value.toLowerCase();
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery)
  );
  displayProducts(filteredProducts);
}

// Price Range Filter
const priceRange = document.getElementById('price-range');
priceRange.addEventListener('input', () => {
  const maxPrice = parseInt(priceRange.value);
  document.getElementById('price-display').textContent = `₦0 - ₦${maxPrice}`;
  const filteredProducts = products.filter(product => product.price <= maxPrice);
  displayProducts(filteredProducts);
});

// Display Cart Items
function displayCartItems() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartContent = document.querySelector('.cart-content');
  if (cart.length === 0) {
    cartContent.innerHTML = '<p>Your cart is empty.</p>';
  } else {
    cartContent.innerHTML = cart.map(item => `
      <div class="cart-item">
        <p>${item.name} x${item.quantity} - ₦${item.price * item.quantity}</p>
      </div>`).join('');
  }
}

// Show/Hide Cart Modal
const cartModal = document.getElementById('cart-modal');
const overlay = document.getElementById('overlay');
const cartCountButton = document.getElementById('cart-count');
const closeCartButton = document.getElementById('close-cart');

cartCountButton.addEventListener('click', (e) => {
  e.preventDefault();
  cartModal.classList.add('open');
  overlay.classList.add('show');
  displayCartItems();
});

closeCartButton.addEventListener('click', () => {
  cartModal.classList.remove('open');
  overlay.classList.remove('show');
});

overlay.addEventListener('click', () => {
  cartModal.classList.remove('open');
  overlay.classList.remove('show');
});

// Checkout redirection
document.querySelector('.btn-checkout').addEventListener('click', () => {
  window.location.href = 'checkout.html';
});
