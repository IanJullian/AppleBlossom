document.addEventListener('DOMContentLoaded', function () {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  if (!isLoggedIn) {
    window.location.href = 'login.html';
  }

  document.getElementById('logoutBtn').addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  });
});

// Load Leaflet CSS & JS
const leafletCSS = document.createElement('link');
leafletCSS.rel = 'stylesheet';
leafletCSS.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
document.head.appendChild(leafletCSS);

const leafletJS = document.createElement('script');
leafletJS.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
leafletJS.onload = initMap;
document.head.appendChild(leafletJS);

let map;
let marker;

function initMap() {
  if (document.getElementById('map')) {
    map = L.map('map').setView([-7.4315, 109.2479], 15); // Default lokasi Purwokerto
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    marker = L.marker([-7.4315, 109.2479], {
      draggable: true
    }).addTo(map);

    marker.on('dragend', function(e) {
      document.getElementById('latitude').value = marker.getLatLng().lat;
      document.getElementById('longitude').value = marker.getLatLng().lng;
    });
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const cartBox = document.getElementById('cart-box');
  const cartCount = document.getElementById('cart-count');
  const cartPopup = document.getElementById('cart-popup');
  const cartItemsContainer = document.getElementById('cart-items');
  const closeCartBtn = document.querySelector('#cart-popup .close-cart');
  const cartTotal = document.querySelector('#cart-popup .cart-total');
  const addCartButtons = document.querySelectorAll('.btn-add-cart');
  const checkoutBtn = document.querySelector('#cart-popup .checkout-btn');

  const checkoutPopup = document.getElementById('checkout-popup');
  const closeCheckoutBtn = document.querySelector('.close-checkout');
  const checkoutSubtotal = document.getElementById('checkout-subtotal');
  const checkoutFee = document.getElementById('checkout-fee');
  const checkoutTotal = document.getElementById('checkout-total');
  const checkoutBtnFinal = document.querySelector('.checkout-btn-final');
  const checkoutSuccess = document.querySelector('.checkout-success');
  const paymentMethod = document.getElementById('payment-method');
  const rekeningInfo = document.querySelector('.rekening-info');
  const inputNama = document.getElementById('input-nama');
  const inputTelepon = document.getElementById('input-telepon');
  const inputAlamat = document.getElementById('input-alamat');

  checkoutBtn.addEventListener('click', () => {
      if (typeof L !== 'undefined' && !map) {
        initMap();
      }
    });

  function getCart() {
    return JSON.parse(localStorage.getItem('appleBlossomCart')) || [];
  }

  function saveCart(cart) {
    localStorage.setItem('appleBlossomCart', JSON.stringify(cart));
  }

  function updateCartCount() {
    const cart = getCart();
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    if (totalQty > 0) {
      cartCount.style.display = 'flex';
      cartCount.textContent = totalQty;
    } else {
      cartCount.style.display = 'none';
    }
  }

  function renderCartItems() {
    const cart = getCart();
    const checkoutBtn = document.querySelector('#cart-popup .checkout-btn');

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p class="empty-msg">Keranjang belanja kosong.</p>';
      cartTotal.textContent = '';
      if (checkoutBtn) checkoutBtn.style.display = 'none';
      return;
    }

    cartItemsContainer.innerHTML = '';
    cart.forEach(item => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">Rp${(item.price * item.qty).toLocaleString()}</div>
          <div class="cart-qty-box">
            <button class="cart-qty-btn" data-action="minus" data-id="${item.id}">-</button>
            <span class="cart-qty">${item.qty}</span>
            <button class="cart-qty-btn" data-action="plus" data-id="${item.id}">+</button>
            <button class="cart-remove-btn" data-id="${item.id}" title="Hapus"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      `;
      cartItemsContainer.appendChild(div);
    });

    cartTotal.textContent = "Subtotal: Rp" + cart.reduce((sum, item) => sum + item.price * item.qty, 0).toLocaleString();
    if (checkoutBtn) {
      checkoutBtn.style.display = 'block';
      checkoutBtn.onclick = () => {
        if (cart.length === 0) {
          alert("Keranjang kamu masih kosong, isi dulu dong!");
          return;
        }
        cartPopup.style.display = 'none';
        updateCheckoutSummary();
        checkoutPopup.style.display = 'flex';
        checkoutSuccess.style.display = 'none';
        checkoutBtnFinal.style.display = 'block';
        checkoutBtnFinal.disabled = false;
        checkoutBtnFinal.textContent = "Proses Checkout";
      };
    }
  }

  function addToCart(id, name, price) {
    const cart = getCart();
    const index = cart.findIndex(item => item.id === id);
    if (index >= 0) {
      cart[index].qty += 1;
    } else {
      cart.push({ id, name, price, qty: 1 });
    }
    saveCart(cart);
    updateCartCount();
  }

  addCartButtons.forEach(button => {
    button.addEventListener('click', () => {
      const product = button.closest('.product');
      const id = product.getAttribute('data-id');
      const name = product.getAttribute('data-name');
      const price = parseInt(product.getAttribute('data-price'));
      addToCart(id, name, price);
      updateCartCount();
      alert(`Produk "${name}" berhasil ditambahkan ke keranjang.`);
    });
  });

  cartBox.addEventListener('click', () => {
    renderCartItems();
    cartPopup.style.display = cartPopup.style.display === 'block' ? 'none' : 'block';
  });

  closeCartBtn.addEventListener('click', () => {
    cartPopup.style.display = 'none';
  });

  cartItemsContainer.addEventListener('click', function (e) {
    const cart = getCart();

    if (e.target.matches('.cart-qty-btn')) {
      const id = e.target.getAttribute('data-id');
      const action = e.target.getAttribute('data-action');
      const idx = cart.findIndex(item => item.id === id);

      if (idx >= 0) {
        if (action === 'plus') {
          cart[idx].qty += 1;
        } else if (action === 'minus' && cart[idx].qty > 1) {
          cart[idx].qty -= 1;
        }
        saveCart(cart);
        renderCartItems();
        updateCartCount();
      }
    }

    if (e.target.closest('.cart-remove-btn')) {
      const id = e.target.closest('.cart-remove-btn').getAttribute('data-id');
      const idx = cart.findIndex(item => item.id === id);

      if (idx >= 0) {
        cart.splice(idx, 1);
        saveCart(cart);
        renderCartItems();
        updateCartCount();
      }
    }
  });

  function updateCheckoutSummary() {
    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const fee = 2000;
    checkoutSubtotal.textContent = "Rp" + subtotal.toLocaleString();
    checkoutFee.textContent = "Rp" + fee.toLocaleString();
    checkoutTotal.textContent = "Rp" + (subtotal + fee).toLocaleString();
  }

  closeCheckoutBtn.addEventListener('click', () => {
    checkoutPopup.style.display = 'none';
  });

  paymentMethod.addEventListener('change', (e) => {
  document.querySelectorAll('.payment-info').forEach(el => {
    el.style.display = 'none';
  });
  
  if (e.target.value === 'bank') {
    document.getElementById('payment-info-bank').style.display = 'block';
  } else if (e.target.value === 'ewallet') {
    document.getElementById('payment-info-ewallet').style.display = 'block';
  }
});

  // KODE BARU PENGGANTI
document.getElementById('checkout-form').addEventListener('submit', function(e) {
  e.preventDefault(); // Menghentikan form submit default
  
  // Validasi input wajib
  const nama = document.getElementById('nama').value;
  const telepon = document.getElementById('telepon').value;
  const alamat = document.getElementById('alamat').value;
  
  if (!nama || !telepon || !alamat) {
    alert('Harap lengkapi semua informasi pengiriman!');
    return;
  }
  
  // Tampilkan loading state
  const checkoutBtn = document.querySelector('.checkout-btn-final');
  checkoutBtn.disabled = true;
  checkoutBtn.textContent = "Memproses...";
  
  // Simulasi proses checkout (2 detik)
  setTimeout(() => {
    // Tampilkan pesan sukses
    document.querySelector('.checkout-success').style.display = 'block';
    checkoutBtn.style.display = 'none';
    
    // Kosongkan keranjang
    saveCart([]);
    updateCartCount();
    
    // Reset form setelah 2 detik
    setTimeout(() => {
      checkoutPopup.style.display = 'none';
      document.getElementById('checkout-form').reset(); // Reset form
      document.querySelector('.checkout-success').style.display = 'none';
      checkoutBtn.style.display = 'block';
      checkoutBtn.disabled = false;
      checkoutBtn.textContent = "Proses Checkout";
    }, 2000);
  }, 1500);
});

  updateCartCount();
});

// Hamburger Menu Functionality
function toggleMenu() {
  const hamburger = document.querySelector('.hamburger-menu');
  const sidebar = document.getElementById('mobileSidebar');
  const overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  
  hamburger.classList.toggle('active');
  
  if (sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
    document.querySelector('.sidebar-overlay')?.remove();
  } else {
    sidebar.classList.add('open');
    document.body.appendChild(overlay);
    
    // Tutup sidebar saat overlay diklik
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.remove();
      hamburger.classList.remove('active');
    });
  }
}

// Close menu when clicking on a link
document.querySelectorAll('.sidebar-content a').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelector('.hamburger-menu').classList.remove('active');
    document.getElementById('mobileSidebar').classList.remove('open');
    document.querySelector('.sidebar-overlay')?.remove();
  });
});