// Updated index.js

// Initialize user login state
let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

// Check and define auth-popup container if missing
function ensureAuthPopup() {
    let authPopup = document.getElementById('auth-popup');
    if (!authPopup) {
        const popupHTML = `
            <div id="auth-popup" style="display: none;" class="popup-container">
                <div class="popup">
                    <h3 id="auth-title">Sign In</h3>
                    <form id="auth-form">
                        <label for="auth-email">Email</label>
                        <input type="email" id="auth-email" required>
                        <label for="auth-password">Password</label>
                        <input type="password" id="auth-password" required>
                        <button id="auth-submit-btn" type="submit">Sign In</button>
                    </form>
                    <p id="auth-toggle">Don't have an account? <a href="#" onclick="toggleAuthMode()">Sign Up</a></p>
                    <button onclick="closeAuthPopup()">Close</button>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', popupHTML);
    }
}

ensureAuthPopup();

// Function to open the auth popup
function openAuthPopup() {
    document.getElementById('auth-popup').style.display = 'flex';
}

// Function to close the auth popup
function closeAuthPopup() {
    document.getElementById('auth-popup').style.display = 'none';
}

// Toggle between Sign In and Sign Up modes
function toggleAuthMode() {
    const authTitle = document.getElementById('auth-title');
    const authToggle = document.getElementById('auth-toggle');
    const authSubmitBtn = document.getElementById('auth-submit-btn');

    if (authTitle.innerText === 'Sign In') {
        authTitle.innerText = 'Sign Up';
        authToggle.innerHTML = 'Already have an account? <a href="#" onclick="toggleAuthMode()">Sign In</a>';
        authSubmitBtn.innerText = 'Sign Up';
    } else {
        authTitle.innerText = 'Sign In';
        authToggle.innerHTML = 'Don\'t have an account? <a href="#" onclick="toggleAuthMode()">Sign Up</a>';
        authSubmitBtn.innerText = 'Sign In';
    }
}

// Handle auth form submission
document.getElementById('auth-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const authTitle = document.getElementById('auth-title').innerText;

    if (authTitle === 'Sign In') {
        const storedEmail = localStorage.getItem('userEmail');
        const storedPassword = localStorage.getItem('userPassword');
        if (email === storedEmail && password === storedPassword) {
            isLoggedIn = true;
            localStorage.setItem('isLoggedIn', 'true');
            alert('Sign in successful!');
            closeAuthPopup();
            checkPendingActions();
        } else {
            alert('Invalid email or password.');
        }
    } else {
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userPassword', password);
        isLoggedIn = true;
        localStorage.setItem('isLoggedIn', 'true');
        alert('Sign up successful!');
        closeAuthPopup();
        checkPendingActions();
    }
    updateAuthLinks();
});

// Function to update navigation based on login state
function updateAuthLinks() {
    const accountLink = document.querySelector('nav ul li a[href="account.html"]');
    if (isLoggedIn) {
        accountLink.innerText = 'My Account';
    } else {
        accountLink.innerText = 'Sign In';
    }
}

// Function to handle sign out
function signOut() {
    isLoggedIn = false;
    localStorage.setItem('isLoggedIn', 'false');
    alert('You have been signed out.');
    updateAuthLinks();
}

// Add to Cart function with login check
function addToCart(productName, productPrice) {
    if (!isLoggedIn) {
        openAuthPopup();
        localStorage.setItem('pendingAddToCart', JSON.stringify({ name: productName, price: productPrice }));
    } else {
        proceedToAddToCart(productName, productPrice);
    }
}

// Function to proceed with adding to cart
function proceedToAddToCart(productName, productPrice) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProduct = cart.find(item => item.name === productName);
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ name: productName, price: productPrice, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert(`${productName} has been added to your cart!`);
}

// Check if there is a pending add to cart action after login
function checkPendingActions() {
    const pendingAddToCart = JSON.parse(localStorage.getItem('pendingAddToCart'));
    if (isLoggedIn && pendingAddToCart) {
        proceedToAddToCart(pendingAddToCart.name, pendingAddToCart.price);
        localStorage.removeItem('pendingAddToCart');
    }
}

// Function to update cart count in the navigation menu
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    document.getElementById('cart-count').innerText = cart.reduce((total, item) => total + item.quantity, 0);
}

// Function to display cart items on cart.html
function displayCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cartItemsContainer.innerHTML = '';
    let cartTotal = 0;

    cart.forEach((item, index) => {
        const subtotal = item.price * item.quantity;
        cartTotal += subtotal;
        cartItemsContainer.innerHTML += `
          <tr>
            <td>${item.name}</td>
            <td>₹${item.price}</td>
            <td>
              <button onclick="changeQuantity(${index}, -1)">-</button>
              ${item.quantity}
              <button onclick="changeQuantity(${index}, 1)">+</button>
            </td>
            <td>₹${subtotal}</td>
            <td><button onclick="removeFromCart(${index})">Remove</button></td>
          </tr>
        `;
    });

    cartTotalElement.innerText = cartTotal;
    updateCartCount();
}

// Function to change the quantity of a cart item
function changeQuantity(index, delta) {
    let cart = JSON.parse(localStorage.getItem('cart'));
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCartItems();
}

// Function to remove an item from the cart
function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('cart'));
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCartItems();
}

// Function to handle checkout
function checkout() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    window.location.href = `payment.html?total=${encodeURIComponent(totalAmount)}`;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    updateAuthLinks();
    checkPendingActions();
    if (window.location.pathname.endsWith('cart.html')) {
        displayCartItems();
    }
});
