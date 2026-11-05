class Cart {
  constructor() {
    this.key = 'swaroop_cart';
    this.items = JSON.parse(localStorage.getItem(this.key)) || [];
    this.appliedPromo = JSON.parse(localStorage.getItem('swaroop_cart_promo')) || null;
  }

  save() {
    localStorage.setItem(this.key, JSON.stringify(this.items));
    if (this.appliedPromo) {
      localStorage.setItem('swaroop_cart_promo', JSON.stringify(this.appliedPromo));
    } else {
      localStorage.removeItem('swaroop_cart_promo');
    }
    this.updateBadge();
  }

  addItem(productId, quantity = 1) {
    const id = Number(productId);
    const qty = Math.max(1, Number(quantity) || 1);
    const product = typeof PRODUCTS !== 'undefined' ? PRODUCTS.find(p => p.id === id) : null;
    if (!product) {
      console.error('Product not found for ID:', productId);
      return;
    }

    const existingItem = this.items.find(item => item.id === id);
    if (existingItem) {
      existingItem.quantity += qty;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        gradient: product.gradient,
        icon: product.icon,
        image: product.image,
        category: product.category,
        quantity: qty
      });
    }
    this.save();
    showToast(`${product.name} added to cart`, 'success');
  }

  removeFromCart(productId) {
    const id = Number(productId);
    const itemToRemove = this.items.find(item => item.id === id);
    this.items = this.items.filter(item => item.id !== id);
    this.save();
    if (itemToRemove) {
      showToast(`${itemToRemove.name} removed from cart`, 'info');
    }
  }

  updateQuantity(productId, quantity) {
    const id = Number(productId);
    const qty = Number(quantity);
    if (qty <= 0) {
      this.removeFromCart(id);
      return;
    }
    const item = this.items.find(item => item.id === id);
    if (item) {
      item.quantity = qty;
      this.save();
    }
  }

  getTotal() {
    return this.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  getCount() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  clear() {
    this.items = [];
    this.appliedPromo = null;
    this.save();
  }

  applyPromoCode(code) {
    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode) {
      showToast('Please enter a promo code', 'warning');
      return false;
    }

    const promoCodes = {
      'SWAROOP10': { discountPercent: 10, name: 'SWAROOP10 (10% OFF)' },
      'PROMO20': { discountPercent: 20, name: 'PROMO20 (20% OFF)' },
      'SAVE15': { discountPercent: 15, name: 'SAVE15 (15% OFF)' }
    };

    if (promoCodes[cleanCode]) {
      this.appliedPromo = { code: cleanCode, ...promoCodes[cleanCode] };
      this.save();
      showToast(`Promo code ${cleanCode} applied successfully!`, 'success');
      return true;
    } else {
      showToast('Invalid promo code. Try SWAROOP10 or SAVE15', 'error');
      return false;
    }
  }

  removePromoCode() {
    this.appliedPromo = null;
    this.save();
    showToast('Promo code removed', 'info');
  }

  updateBadge() {
    const count = this.getCount();
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'inline-flex' : 'none';
    });
  }
}

// Global cart instance attached to window
window.cart = new Cart();
var cart = window.cart;

// Cross-tab sync
window.addEventListener('storage', (e) => {
  if (e.key === cart.key) {
    cart.items = JSON.parse(e.newValue || '[]');
    cart.appliedPromo = JSON.parse(localStorage.getItem('swaroop_cart_promo')) || null;
    cart.updateBadge();
    if (typeof renderCart === 'function') {
      renderCart();
    }
  }
});

function createToastContainer() {
  if (!document.getElementById('toast-container')) {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
}

function showToast(message, type = 'info') {
  createToastContainer();
  const container = document.getElementById('toast-container');
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'ℹ';
  if (type === 'success') icon = '✓';
  if (type === 'error') icon = '✕';
  if (type === 'warning') icon = '⚠';

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close">&times;</button>
  `;

  container.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => toast.classList.add('toast-show'), 10);

  const closeToast = () => {
    toast.classList.remove('toast-show');
    setTimeout(() => toast.remove(), 300);
  };

  toast.querySelector('.toast-close').addEventListener('click', closeToast);
  setTimeout(closeToast, 3000);
}

function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const overlay = document.querySelector('.nav-overlay');
  
  if(!hamburger) return;

  const toggleMenu = () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.classList.toggle('menu-open');
  };

  hamburger.addEventListener('click', toggleMenu);
  if(overlay) overlay.addEventListener('click', toggleMenu);
}

function initScrollAnimations() {
  // All elements are now visible immediately via CSS animation
  // Just add animate-in class for any JS that checks for it
  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    el.classList.add('animate-in');
  });
}

function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if(!navbar) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

function generateStars(rating) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars += '<span class="star filled">★</span>';
    } else if (rating >= i - 0.5) {
      stars += '<span class="star half">★</span>';
    } else {
      stars += '<span class="star">★</span>';
    }
  }
  return stars;
}

function createProductCard(product) {
  const badgeHtml = product.badge ? `<span class="product-badge badge-${product.badge.toLowerCase()}">${product.badge}</span>` : '';
  const discountHtml = product.originalPrice > product.price 
    ? `<span class="product-discount">-${Math.round((1 - product.price/product.originalPrice) * 100)}%</span>` 
    : '';

  return `
    <div class="product-card animate-on-scroll" data-id="${product.id}">
      <a href="product.html?id=${product.id}" class="product-image">
        <img src="${product.image}" alt="${product.name}" class="product-img" loading="lazy">
        ${badgeHtml}
        ${discountHtml}
      </a>
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3 class="product-name"><a href="product.html?id=${product.id}">${product.name}</a></h3>
        <div class="product-rating">
          ${generateStars(product.rating)}
          <span class="rating-count">(${product.reviews})</span>
        </div>
        <div class="product-pricing">
          <span class="product-price">$${product.price.toFixed(2)}</span>
          ${product.originalPrice > product.price ? `<span class="product-original-price">$${product.originalPrice.toFixed(2)}</span>` : ''}
        </div>
        <button class="btn btn-add-cart" onclick="event.preventDefault(); event.stopPropagation(); cart.addItem(${product.id})">
          Add to Cart
        </button>
      </div>
    </div>
  `;
}

function renderProducts(containerId, productsToRender) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = productsToRender.map(p => createProductCard(p)).join('');
}

function renderTestimonials(containerId) {
  const container = document.getElementById(containerId);
  if (!container || typeof TESTIMONIALS === 'undefined') return;
  
  container.innerHTML = TESTIMONIALS.map(t => `
    <div class="testimonial-card animate-on-scroll">
      <div class="testimonial-stars">
        ${'★'.repeat(t.rating)}
      </div>
      <p class="testimonial-text">"${t.text}"</p>
      <div class="testimonial-author">
        <div class="testimonial-avatar">
          <img src="${t.avatar}" alt="${t.name}" class="testimonial-avatar-img">
        </div>
        <div class="testimonial-info">
          <h4 class="name">${t.name}</h4>
          <p class="role">${t.role}</p>
        </div>
      </div>
    </div>
  `).join('');
}

// Attach all key utility functions to window for universal access
window.showToast = showToast;
window.createProductCard = createProductCard;
window.renderProducts = renderProducts;
window.renderTestimonials = renderTestimonials;
window.generateStars = generateStars;

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initNavbarScroll();
  initScrollAnimations();
  cart.updateBadge();
});

