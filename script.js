// ===== Doctors Medicin Cornner - Main JavaScript =====

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', () => {
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const icon = mobileToggle.querySelector('i');
      if (navMenu.classList.contains('active')) {
        icon.className = 'fas fa-times';
      } else {
        icon.className = 'fas fa-bars';
      }
    });
  }

  // Add to Cart functionality
  const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
  addToCartBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      const productCard = this.closest('.product-card') || this.closest('.product-info');
      const productName = productCard ? productCard.querySelector('h3')?.textContent : 'Product';

      // Animate button
      this.innerHTML = '<i class="fas fa-check"></i> Added!';
      this.style.background = 'var(--success)';
      this.style.color = '#fff';

      // Update cart count
      const cartCount = document.getElementById('cartCount');
      if (cartCount) {
        let count = parseInt(cartCount.textContent) || 0;
        cartCount.textContent = count + 1;
        cartCount.style.transform = 'scale(1.3)';
        setTimeout(() => { cartCount.style.transform = 'scale(1)'; }, 200);
      }

      // Show notification
      showNotification(`${productName} added to cart!`);

      // Reset button
      setTimeout(() => {
        this.innerHTML = '<i class="fas fa-cart-plus"></i> Add to Cart';
        this.style.background = '';
        this.style.color = '';
      }, 2000);
    });
  });

  // Search functionality
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        const query = this.value.trim();
        if (query) {
          showNotification(`Searching for "${query}"...`);
          setTimeout(() => {
            window.location.href = 'shop.html';
          }, 800);
        }
      }
    });
  }

  // Scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe cards for animations
  document.querySelectorAll('.category-card, .product-card, .testimonial-card, .feature-item, .stat-card, .contact-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
  });

  // Navbar shadow on scroll
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 10) {
        navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
      } else {
        navbar.style.boxShadow = 'var(--shadow-sm)';
      }
    });
  }
});

// ===== CART FUNCTIONS =====

// Update quantity and recalculate
function updateQty(btn, change) {
  const input = btn.parentElement.querySelector('input');
  let val = parseInt(input.value) || 1;
  val = Math.max(1, Math.min(10, val + change));
  input.value = val;
  recalcCart();
}

// Remove item from cart
function removeCartItem(btn) {
  const row = btn.closest('tr');
  if (row) {
    const productName = row.querySelector('h4')?.textContent || 'Item';
    row.style.opacity = '0';
    row.style.transform = 'translateX(50px)';
    row.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      row.remove();
      recalcCart();
      showNotification(`${productName} removed from cart`);
    }, 300);
  }
}

// Recalculate entire cart
function recalcCart() {
  const rows = document.querySelectorAll('#cartBody tr');
  let subtotal = 0;
  let totalItems = 0;

  rows.forEach(row => {
    const price = parseFloat(row.getAttribute('data-price')) || 0;
    const qtyInput = row.querySelector('input[type="number"]');
    const qty = parseInt(qtyInput?.value) || 1;
    const rowSub = price * qty;
    totalItems += qty;

    // Update row subtotal
    const subtotalCell = row.querySelector('.row-subtotal');
    if (subtotalCell) {
      subtotalCell.innerHTML = `<strong>$${rowSub.toFixed(2)}</strong>`;
    }
    subtotal += rowSub;
  });

  // Shipping logic
  const shippingCost = subtotal >= 50 ? 0 : 5.99;
  const tax = subtotal * 0.05;
  const total = subtotal + shippingCost + tax;

  // Update summary
  const itemCountEl = document.getElementById('itemCount');
  const subtotalEl = document.getElementById('subtotalAmount');
  const shippingEl = document.getElementById('shippingAmount');
  const taxEl = document.getElementById('taxAmount');
  const totalEl = document.getElementById('totalAmount');
  const cartCountEl = document.getElementById('cartCount');

  if (itemCountEl) itemCountEl.textContent = totalItems;
  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  if (shippingEl) {
    shippingEl.textContent = shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`;
    shippingEl.style.color = shippingCost === 0 ? 'var(--success)' : '';
  }
  if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
  if (cartCountEl) cartCountEl.textContent = totalItems;

  // Show/hide empty cart message
  const emptyCart = document.getElementById('emptyCart');
  const cartActions = document.getElementById('cartActions');
  const cartSummary = document.getElementById('cartSummary');
  const cartTable = document.querySelector('.cart-table');

  if (rows.length === 0) {
    if (emptyCart) emptyCart.style.display = 'block';
    if (cartActions) cartActions.style.display = 'none';
    if (cartSummary) cartSummary.style.display = 'none';
    if (cartTable) cartTable.style.display = 'none';
  }
}

// Apply coupon
function applyCoupon() {
  const code = document.getElementById('couponCode')?.value.trim().toUpperCase();
  const msg = document.getElementById('couponMsg');
  if (!code) {
    if (msg) {
      msg.style.display = 'block';
      msg.style.color = 'var(--danger)';
      msg.textContent = 'Please enter a coupon code.';
    }
    return;
  }
  // Demo coupons
  const coupons = { 'HEALTH10': 10, 'SAVE20': 20, 'WELCOME': 15 };
  if (coupons[code]) {
    if (msg) {
      msg.style.display = 'block';
      msg.style.color = 'var(--success)';
      msg.textContent = `✅ Coupon applied! ${coupons[code]}% discount.`;
    }
    showNotification(`Coupon "${code}" applied - ${coupons[code]}% off!`);
  } else {
    if (msg) {
      msg.style.display = 'block';
      msg.style.color = 'var(--danger)';
      msg.textContent = '❌ Invalid coupon code. Try HEALTH10, SAVE20, or WELCOME.';
    }
  }
}

// ===== CHECKOUT FUNCTIONS =====

// Checkout form validation and submission
function handleCheckout(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Validate
  if (!data.fullName || !data.email || !data.phone || !data.address || !data.city) {
    showNotification('Please fill in all required fields.');
    return;
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    showNotification('Please enter a valid email address.');
    return;
  }

  // Show processing
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
  submitBtn.disabled = true;
  submitBtn.style.opacity = '0.7';

  // Simulate order processing
  setTimeout(() => {
    const orderId = 'DMC-' + Date.now().toString().slice(-8);
    
    // Show success page
    document.getElementById('checkoutForm').style.display = 'none';
    document.getElementById('checkoutSidebar').style.display = 'none';
    
    const successEl = document.getElementById('orderSuccess');
    successEl.style.display = 'block';
    successEl.querySelector('#orderId').textContent = orderId;
    successEl.querySelector('#orderEmail').textContent = data.email;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 2000);
}

// Toggle payment fields
function togglePaymentFields() {
  const method = document.querySelector('input[name="paymentMethod"]:checked')?.value;
  const cardFields = document.getElementById('cardFields');
  const mobileFields = document.getElementById('mobileFields');
  
  if (cardFields) cardFields.style.display = method === 'card' ? 'block' : 'none';
  if (mobileFields) mobileFields.style.display = method === 'mobile' ? 'block' : 'none';
}

// Notification System
function showNotification(message) {
  const existing = document.querySelector('.notification-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'notification-toast';
  toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
  toast.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    background: linear-gradient(135deg, #0d9488, #0f766e);
    color: white;
    padding: 16px 28px;
    border-radius: 12px;
    font-size: 0.95rem;
    font-weight: 500;
    box-shadow: 0 10px 30px rgba(13,148,136,0.4);
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 10px;
    animation: slideInRight 0.4s ease;
    font-family: 'Inter', sans-serif;
    max-width: 400px;
  `;

  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.4s ease forwards';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}
