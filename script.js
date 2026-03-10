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
          // Redirect to shop page in a real implementation
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

// Quantity Control (Cart Page)
function updateQty(btn, change) {
  const input = btn.parentElement.querySelector('input');
  let val = parseInt(input.value) || 1;
  val = Math.max(1, Math.min(10, val + change));
  input.value = val;
}

// Notification System
function showNotification(message) {
  // Remove existing
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
  `;

  // Add animation keyframes
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

// Remove item from cart
document.querySelectorAll('.remove-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    const row = this.closest('tr');
    if (row) {
      row.style.opacity = '0';
      row.style.transform = 'translateX(50px)';
      row.style.transition = 'all 0.3s ease';
      setTimeout(() => {
        row.remove();
        showNotification('Item removed from cart');
      }, 300);
    }
  });
});
