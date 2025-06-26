// Shopping Cart functionality
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cartItems')) || [];
        this.init();
    }

    init() {
        this.updateCartCount();
        this.bindEvents();
        this.createCartModal();
    }

    bindEvents() {
        // Add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.add-to-cart') || e.target.closest('.add-to-cart')) {
                e.preventDefault();
                const button = e.target.matches('.add-to-cart') ? e.target : e.target.closest('.add-to-cart');
                this.addToCart(button);
            }
        });

        // Cart icon click
        const cartIcon = document.querySelector('.cart-icon');
        if (cartIcon) {
            cartIcon.addEventListener('click', () => this.toggleCart());
        }

        // Search functionality
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.searchProducts(e.target.value));
        }
    }

    addToCart(button) {
        const productCard = button.closest('.col-3, .card, .concol').parentElement;
        const productName = productCard.querySelector('h4').textContent;
        const productPrice = productCard.querySelector('.fa, .price').textContent.replace('Price: ', '');
        const productImage = productCard.querySelector('img').src;

        const item = {
            id: Date.now(),
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: 1
        };

        // Check if item already exists
        const existingItem = this.items.find(cartItem => cartItem.name === item.name);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push(item);
        }

        this.saveCart();
        this.updateCartCount();
        this.showAddedToCartMessage(item.name);
    }

    removeFromCart(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.saveCart();
        this.updateCartCount();
        this.renderCartItems();
    }

    updateQuantity(itemId, newQuantity) {
        const item = this.items.find(item => item.id === itemId);
        if (item) {
            item.quantity = Math.max(1, newQuantity);
            this.saveCart();
            this.renderCartItems();
        }
    }

    saveCart() {
        localStorage.setItem('cartItems', JSON.stringify(this.items));
    }

    updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'block' : 'none';
        }
    }

    createCartModal() {
        const cartModal = document.createElement('div');
        cartModal.className = 'cart-modal';
        cartModal.innerHTML = `
            <div class="cart-content">
                <div class="cart-header">
                    <h3>Shopping Cart</h3>
                    <button class="close-cart">&times;</button>
                </div>
                <div class="cart-items"></div>
                <div class="cart-footer">
                    <div class="cart-total">
                        <strong>Total: <span class="total-amount">₦0</span></strong>
                    </div>
                    <button class="checkout-btn">Proceed to Checkout</button>
                </div>
            </div>
        `;
        document.body.appendChild(cartModal);

        // Close cart events
        cartModal.querySelector('.close-cart').addEventListener('click', () => this.toggleCart());
        cartModal.addEventListener('click', (e) => {
            if (e.target === cartModal) this.toggleCart();
        });

        // Checkout button
        cartModal.querySelector('.checkout-btn').addEventListener('click', () => this.checkout());
    }

    toggleCart() {
        const cartModal = document.querySelector('.cart-modal');
        cartModal.classList.toggle('active');
        if (cartModal.classList.contains('active')) {
            this.renderCartItems();
        }
    }

    renderCartItems() {
        const cartItemsContainer = document.querySelector('.cart-items');
        const totalAmountElement = document.querySelector('.total-amount');

        if (this.items.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
            totalAmountElement.textContent = '₦0';
            return;
        }

        cartItemsContainer.innerHTML = this.items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p class="item-price">${item.price}</p>
                </div>
                <div class="quantity-controls">
                    <button class="qty-btn minus" onclick="cart.updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="qty-btn plus" onclick="cart.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
                <button class="remove-item" onclick="cart.removeFromCart(${item.id})">×</button>
            </div>
        `).join('');

        // Calculate total
        const total = this.items.reduce((sum, item) => {
            const price = parseInt(item.price.replace(/[₦,]/g, ''));
            return sum + (price * item.quantity);
        }, 0);

        totalAmountElement.textContent = `₦${total.toLocaleString()}`;
    }

    showAddedToCartMessage(productName) {
        const message = document.createElement('div');
        message.className = 'cart-message';
        message.innerHTML = `
            <div class="message-content">
                <i class="fa fa-check-circle"></i>
                <span>${productName} added to cart!</span>
            </div>
        `;
        document.body.appendChild(message);

        setTimeout(() => {
            message.classList.add('show');
        }, 100);

        setTimeout(() => {
            message.classList.remove('show');
            setTimeout(() => message.remove(), 300);
        }, 2000);
    }

    searchProducts(query) {
        const products = document.querySelectorAll('.col-3, .card');
        const searchQuery = query.toLowerCase();

        products.forEach(product => {
            const productName = product.querySelector('h4').textContent.toLowerCase();
            const productContainer = product.closest('.col-3') || product;
            
            if (productName.includes(searchQuery)) {
                productContainer.style.display = 'block';
            } else {
                productContainer.style.display = 'none';
            }
        });
    }

    checkout() {
        if (this.items.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        // Simple checkout simulation
        const total = this.items.reduce((sum, item) => {
            const price = parseInt(item.price.replace(/[₦,]/g, ''));
            return sum + (price * item.quantity);
        }, 0);

        const confirmed = confirm(`Proceed with checkout for ₦${total.toLocaleString()}?`);
        if (confirmed) {
            alert('Thank you for your order! We will contact you soon.');
            this.items = [];
            this.saveCart();
            this.updateCartCount();
            this.toggleCart();
        }
    }
}

// Mobile menu functionality
class MobileMenu {
    constructor() {
        this.init();
    }

    init() {
        this.createMobileMenuButton();
        this.bindEvents();
    }

    createMobileMenuButton() {
        const navbar = document.querySelector('.navbar');
        if (navbar && !document.querySelector('.mobile-menu-btn')) {
            const menuBtn = document.createElement('button');
            menuBtn.className = 'mobile-menu-btn';
            menuBtn.innerHTML = '<span></span><span></span><span></span>';
            navbar.appendChild(menuBtn);
        }
    }

    bindEvents() {
        const menuBtn = document.querySelector('.mobile-menu-btn');
        const nav = document.querySelector('nav');

        if (menuBtn && nav) {
            menuBtn.addEventListener('click', () => {
                nav.classList.toggle('active');
                menuBtn.classList.toggle('active');
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!nav.contains(e.target) && !menuBtn.contains(e.target)) {
                    nav.classList.remove('active');
                    menuBtn.classList.remove('active');
                }
            });
        }
    }
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Image lazy loading
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize cart
    window.cart = new ShoppingCart();
    
    // Initialize mobile menu
    new MobileMenu();
    
    // Initialize smooth scrolling
    initSmoothScrolling();
    
    // Initialize lazy loading
    initLazyLoading();

    // Add loading animation
    document.body.classList.add('loaded');
});

// Newsletter subscription
function subscribeNewsletter() {
    const email = document.querySelector('.newsletter-input')?.value;
    if (email && email.includes('@')) {
        alert('Thank you for subscribing to our newsletter!');
        document.querySelector('.newsletter-input').value = '';
    } else {
        alert('Please enter a valid email address.');
    }
}