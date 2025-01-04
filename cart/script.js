const cart = JSON.parse(localStorage.getItem('cart')) || [];

function displayCart() {
    const cartContainer = document.getElementById('cart-items');
    cartContainer.innerHTML = '';

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>Your cart is empty.</p>';
        return;
    }

    let total = 0;
    cart.forEach((item, index) => {
        total += parseInt(item.price);
        cartContainer.innerHTML += `
            <div class="d-flex justify-content-between border-bottom pb-2 mb-2">
                <span>${item.name}</span>
                <span>₦${item.price}</span>
                <button class="btn btn-danger btn-sm" onclick="removeFromCart(${index})">Remove</button>
            </div>`;
    });

    cartContainer.innerHTML += `
        <div class="d-flex justify-content-between border-top pt-2 mt-2">
            <strong>Total:</strong>
            <strong>₦${total}</strong>
        </div>`;
}
displayCart();

function removeFromCart(index) {
    cart.splice(index, 1); // Remove the item at the given index
    localStorage.setItem('cart', JSON.stringify(cart)); // Update localStorage
    displayCart(); // Refresh cart display
}

cart.forEach((item, index) => {
    total += parseInt(item.price) * item.quantity;
    cartContainer.innerHTML += `
        <div class="d-flex justify-content-between border-bottom pb-2 mb-2">
            <span>${item.name} (x${item.quantity})</span>
            <span>₦${item.price * item.quantity}</span>
            <button onclick="removeFromCart(${index})" class="btn btn-danger btn-sm">Remove</button>
        </div>`;
});
