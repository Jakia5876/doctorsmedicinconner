// ===== Doctors Medicin Cornner - Main JavaScript =====

// --- GLOBAL CART STATE MANAGEMENT ---
let cart = [];

function initCart() {
  if (localStorage.getItem('dmc_cart')) {
    cart = JSON.parse(localStorage.getItem('dmc_cart'));
  } else {
    // First time? Try to scrape existing cart.html rows to seed data
    const rows = document.querySelectorAll('#cartBody tr');
    if (rows.length > 0) {
      rows.forEach((row, index) => {
        cart.push({
          id: 'item_' + index,
          price: parseFloat(row.getAttribute('data-price')) || 0,
          name: row.querySelector('h4')?.textContent || 'Product',
          category: row.querySelector('.cart-product span')?.textContent || '',
          img: row.querySelector('img')?.src || '',
          qty: parseInt(row.querySelector('input[type="number"]')?.value) || 1
        });
      });
      saveCart();
    }
  }
  updateCartCountUI();
}

function saveCart() {
  localStorage.setItem('dmc_cart', JSON.stringify(cart));
  updateCartCountUI();
}

function updateCartCountUI() {
  const countEls = document.querySelectorAll('.cart-count, #cartCount');
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  countEls.forEach(el => {
    el.textContent = count;
  });
}

function addToCart(productObj) {
  const existing = cart.find(item => item.id === productObj.id || item.name === productObj.name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...productObj, qty: 1 });
  }
  saveCart();
}

function removeFromCartState(index) {
  cart.splice(index, 1);
  saveCart();
  if (document.getElementById('cartPage')) renderCartPage();
  if (document.getElementById('checkoutSidebar')) renderCheckoutPage();
}

function updateCartItemQty(index, change) {
  cart[index].qty += change;
  if (cart[index].qty < 1) cart[index].qty = 1;
  if (cart[index].qty > 10) cart[index].qty = 10;
  saveCart();
  if (document.getElementById('cartPage')) renderCartPage();
}


// --- PAGE SPECIFIC RENDERING ---

function renderCartPage() {
  const tbody = document.getElementById('cartBody');
  const emptyCart = document.getElementById('emptyCart');
  const cartActions = document.getElementById('cartActions');
  const cartSummary = document.getElementById('cartSummary');
  const cartTable = document.querySelector('.cart-table');

  if (!tbody) return;

  if (cart.length === 0) {
    tbody.innerHTML = '';
    if (emptyCart) emptyCart.style.display = 'block';
    if (cartActions) cartActions.style.display = 'none';
    if (cartSummary) cartSummary.style.display = 'none';
    if (cartTable) cartTable.style.display = 'none';
    return;
  }

  // Show table layout
  if (emptyCart) emptyCart.style.display = 'none';
  if (cartActions) cartActions.style.display = 'flex';
  if (cartSummary) cartSummary.style.display = 'block';
  if (cartTable) cartTable.style.display = 'table';

  let html = '';
  let subtotal = 0;
  let totalItems = 0;

  cart.forEach((item, index) => {
    const rowSub = item.price * item.qty;
    subtotal += rowSub;
    totalItems += item.qty;

    html += `
      <tr data-price="${item.price}">
        <td>
          <div class="cart-product">
            <div class="cart-product-img">
              <img src="${item.img}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">
            </div>
            <div>
              <h4>${item.name}</h4>
              <span>${item.category}</span>
            </div>
          </div>
        </td>
        <td><strong>$${item.price.toFixed(2)}</strong></td>
        <td>
          <div class="qty-control">
            <button onclick="updateCartItemQty(${index}, -1)">−</button>
            <input type="number" value="${item.qty}" readonly>
            <button onclick="updateCartItemQty(${index}, 1)">+</button>
          </div>
        </td>
        <td class="row-subtotal"><strong>$${rowSub.toFixed(2)}</strong></td>
        <td>
          <button class="remove-btn" title="Remove" onclick="removeRowAnim(this, ${index})"><i class="fas fa-trash-alt"></i></button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;

  // Render Sidebar
  renderCartSummary(subtotal, totalItems);
}

function removeRowAnim(btn, index) {
  const row = btn.closest('tr');
  const name = cart[index].name;
  if (row) {
    row.style.opacity = '0';
    row.style.transform = 'translateX(50px)';
    row.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      removeFromCartState(index);
      showNotification(`${name} removed from cart`);
    }, 300);
  }
}

function renderCheckoutPage() {
  const summaryContainer = document.querySelector('.summary-items');
  if (!summaryContainer) return;

  if (cart.length === 0) {
    showNotification("Your cart is empty. Redirecting to shop...");
    setTimeout(() => { window.location.href = 'shop.html'; }, 1500);
    return;
  }

  let html = '';
  let subtotal = 0;
  let totalItems = 0;

  cart.forEach(item => {
    subtotal += item.price * item.qty;
    totalItems += item.qty;
    
    html += `
      <div class="checkout-item">
        <div class="checkout-item-img"><img src="${item.img}" alt="${item.name}"></div>
        <div class="checkout-item-info"><h4>${item.name}</h4><span>Qty: ${item.qty}</span></div>
        <div class="checkout-item-price">$${(item.price * item.qty).toFixed(2)}</div>
      </div>
    `;
  });

  summaryContainer.innerHTML = html;
  renderCartSummary(subtotal, totalItems);
}

function renderCartSummary(subtotal, totalItems) {
  const shippingCost = subtotal >= 50 ? 0 : 5.99;
  const tax = subtotal * 0.05;
  const total = subtotal + shippingCost + tax;

  const itemCountEl = document.getElementById('itemCount');
  if (itemCountEl) itemCountEl.textContent = totalItems;
  
  // Try to find summary fields on the current page
  const subtotalEls = document.querySelectorAll('#subtotalAmount, .summary-row:nth-child(2) span:last-child');
  const shippingEls = document.querySelectorAll('#shippingAmount, .summary-row:nth-child(3) span:last-child');
  const taxEls = document.querySelectorAll('#taxAmount, .summary-row:nth-child(4) span:last-child');
  const totalEls = document.querySelectorAll('#totalAmount, .summary-row.total span:last-child');

  subtotalEls.forEach(el => el.textContent = `$${subtotal.toFixed(2)}`);
  
  shippingEls.forEach(el => {
    el.textContent = shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`;
    el.style.color = shippingCost === 0 ? 'var(--success)' : '';
  });
  
  taxEls.forEach(el => el.textContent = `$${tax.toFixed(2)}`);
  totalEls.forEach(el => el.textContent = `$${total.toFixed(2)}`);
  
  // Update final checkout form total button if present
  const checkoutSubmitBtn = document.querySelector('button[type="submit"]');
  if (checkoutSubmitBtn && checkoutSubmitBtn.innerHTML.includes('Place Order')) {
    checkoutSubmitBtn.innerHTML = `<i class="fas fa-lock"></i> Place Order — $${total.toFixed(2)}`;
  }
}


// --- MAIN EVENT LISTENERS ---

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Global Cart
  initCart();

  if (document.getElementById('cartPage')) {
    renderCartPage();
  }

  if (document.getElementById('checkoutSidebar')) {
    renderCheckoutPage();
  }

  // Mobile Menu Toggle
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

  // Add to Cart Buttons logic (Product Grid)
  const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
  addToCartBtns.forEach((btn, idx) => {
    btn.addEventListener('click', function () {
      const productCard = this.closest('.product-card') || this.closest('.product-info');
      const productName = productCard ? productCard.querySelector('h3')?.textContent : 'Product ' + idx;
      const priceStr = productCard ? productCard.querySelector('.price-current')?.textContent.replace('$', '') : '9.99';
      const category = productCard ? productCard.querySelector('.product-category')?.textContent : 'General';
      
      let img = '';
      if (productCard) {
        const imgEl = productCard.querySelector('img');
        if (imgEl) img = imgEl.src;
        else img = 'https://placehold.co/80x80/e2e8f0/64748b?text=Item';
      }

      // Add to global cart state
      addToCart({
        id: 'p_' + productName.replace(/\s+/g, ''),
        name: productName,
        category: category,
        price: parseFloat(priceStr) || 0,
        img: img
      });

      // Animate button
      this.innerHTML = '<i class="fas fa-check"></i> Added!';
      this.style.background = 'var(--success)';
      this.style.color = '#fff';

      // Visual cart pop animation
      const cartCountEl = document.getElementById('cartCount');
      if (cartCountEl) {
        cartCountEl.style.transform = 'scale(1.3)';
        setTimeout(() => { cartCountEl.style.transform = 'scale(1)'; }, 200);
      }

      // Show notification
      showNotification(`${productName} added to cart!`);

      // Reset button
      setTimeout(() => {
        if (!this.closest('.product-card')) return; // Check if still exists
        this.innerHTML = '<i class="fas fa-cart-plus"></i> Add to Cart';
        this.style.background = '';
        this.style.color = '';
      }, 2000);
    });
  });

  // Search
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        const query = this.value.trim();
        if (query) {
          showNotification(`Searching for "${query}"...`);
          setTimeout(() => { window.location.href = 'shop.html'; }, 800);
        }
      }
    });
  }

  // Observers for animation
  const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.category-card, .product-card, .testimonial-card, .feature-item, .stat-card, .contact-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
  });

  // Navbar shadow
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 10) navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
      else navbar.style.boxShadow = 'var(--shadow-sm)';
    });
  }
});

// --- COUPON & CHECKOUT ---

function applyCoupon() {
  const code = document.getElementById('couponCode')?.value.trim().toUpperCase();
  const msg = document.getElementById('couponMsg');
  if (!code) {
    if (msg) { msg.style.display = 'block'; msg.style.color = 'var(--danger)'; msg.textContent = 'Please enter a coupon code.'; }
    return;
  }
  const coupons = { 'HEALTH10': 10, 'SAVE20': 20, 'WELCOME': 15 };
  if (coupons[code]) {
    if (msg) { msg.style.display = 'block'; msg.style.color = 'var(--success)'; msg.textContent = `✅ Coupon applied! ${coupons[code]}% discount.`; }
    showNotification(`Coupon "${code}" applied - ${coupons[code]}% off!`);
    
    // In a real app we'd save this to state and recalculate total
  } else {
    if (msg) { msg.style.display = 'block'; msg.style.color = 'var(--danger)'; msg.textContent = '❌ Invalid coupon code. Try HEALTH10, SAVE20...'; }
  }
}

function handleCheckout(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  if (!data.fullName || !data.email || !data.phone || !data.address || !data.city) {
    showNotification('Please fill in all required fields.');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    showNotification('Please enter a valid email address.');
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
  submitBtn.disabled = true;
  submitBtn.style.opacity = '0.7';

  setTimeout(() => {
    const orderId = 'DMC-' + Date.now().toString().slice(-8);
    
    document.getElementById('checkoutForm').style.display = 'none';
    document.getElementById('checkoutSidebar').style.display = 'none';
    
    const successEl = document.getElementById('orderSuccess');
    successEl.style.display = 'block';
    successEl.querySelector('#orderId').textContent = orderId;
    successEl.querySelector('#orderEmail').textContent = data.email;

    // Clear cart on successful order
    cart = [];
    saveCart();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 2000);
}

function togglePaymentFields() {
  const method = document.querySelector('input[name="paymentMethod"]:checked')?.value;
  const cardFields = document.getElementById('cardFields');
  const mobileFields = document.getElementById('mobileFields');
  
  if (cardFields) cardFields.style.display = method === 'card' ? 'block' : 'none';
  if (mobileFields) mobileFields.style.display = method === 'mobile' ? 'block' : 'none';
}

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
      @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.4s ease forwards';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}
