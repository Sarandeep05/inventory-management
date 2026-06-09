const API_BASE = window.location.origin;

// Views
const authView = document.getElementById('auth-view');
const dashboardView = document.getElementById('dashboard-view');
const storefrontView = document.getElementById('storefront-view');
const storeOrdersModal = document.getElementById('store-orders-modal');
const storeCartModal = document.getElementById('store-cart-modal');

// Auth Forms
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const logoutTriggers = document.querySelectorAll('.logout-btn-trigger');

let token = localStorage.getItem('jwt');
let userRole = null;
let globalProducts = [];
let cart = [];

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) { return null; }
}

function init() {
    if (token) {
        const payload = parseJwt(token);
        if (payload) {
            userRole = payload.role; // e.g., "ROLE_ADMIN" or "ROLE_USER"
            showApp();
        } else {
            logout();
        }
    } else {
        showAuth();
    }
}

function showAuth() {
    authView.classList.remove('hidden');
    dashboardView.classList.add('hidden');
    storefrontView.classList.add('hidden');
}

function showApp() {
    authView.classList.add('hidden');
    
    if (userRole === 'ROLE_ADMIN') {
        dashboardView.classList.remove('hidden');
        storefrontView.classList.add('hidden');
        initAdminDashboard();
    } else {
        dashboardView.classList.add('hidden');
        storefrontView.classList.remove('hidden');
        initStorefront();
    }
}

function logout() {
    token = null;
    userRole = null;
    localStorage.removeItem('jwt');
    showAuth();
}
logoutTriggers.forEach(btn => btn.addEventListener('click', logout));

// ==========================================
// STOREFRONT LOGIC (ROLE_USER)
// ==========================================
function initStorefront() {
    const payload = parseJwt(token);
    document.getElementById('store-user-name').innerText = payload.sub || 'Customer';
    
    updateCartBadge();
    loadCategoriesForStore();
    loadProductsForStore('');
}

async function loadCategoriesForStore() {
    try {
        const res = await fetch(`${API_BASE}/categories`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
            const categories = await res.json();
            const pillsContainer = document.getElementById('store-category-pills');
            pillsContainer.innerHTML = '<button class="pill active" data-id="">All</button>';
            
            categories.forEach(c => {
                const btn = document.createElement('button');
                btn.className = 'pill';
                btn.setAttribute('data-id', c.id);
                btn.innerText = c.name;
                pillsContainer.appendChild(btn);
            });
            
            // Add click listeners to pills
            document.querySelectorAll('.pill').forEach(pill => {
                pill.addEventListener('click', (e) => {
                    document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
                    e.target.classList.add('active');
                    loadProductsForStore(e.target.getAttribute('data-id'));
                });
            });
        }
    } catch (err) {}
}

async function loadProductsForStore(catId) {
    const url = catId ? `${API_BASE}/products/category/${catId}` : `${API_BASE}/products`;
    try {
        const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
            const products = await res.json();
            globalProducts = products;
            renderStoreProducts(products);
        }
    } catch (err) {}
}

function renderStoreProducts(products) {
    const grid = document.getElementById('store-products-list');
    grid.innerHTML = '';
    
    // Search filter
    const searchTerm = document.getElementById('store-search-input').value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm) && p.status === 'ACTIVE');
    
    if(filtered.length === 0) {
        grid.innerHTML = '<div class="no-results">No products found.</div>';
        return;
    }
    
    filtered.forEach(p => {
        const card = document.createElement('div');
        card.className = 'store-card';
        
        // Use placeholder images based on category or name
        const imgUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random&color=fff&size=250&font-size=0.33`;
        
        const isOutOfStock = p.stock <= 0;
        const stockBadge = isOutOfStock ? `<span class="out-of-stock-badge">Out of Stock</span>` : `<span class="stock-badge">${p.stock} left</span>`;
        
        card.innerHTML = `
            <div class="store-card-img">
                <img src="${imgUrl}" alt="${p.name}">
                ${stockBadge}
            </div>
            <div class="store-card-body">
                <h3>${p.name}</h3>
                <p class="store-card-desc">${p.description}</p>
                <div class="store-card-footer">
                    <span class="price">$${p.price.toFixed(2)}</span>
                    <button class="btn btn-primary btn-order" ${isOutOfStock ? 'disabled' : ''} onclick="addToCart(${p.id})">
                        <i class="fa-solid fa-cart-plus"></i> Add to Cart
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

document.getElementById('store-search-btn').addEventListener('click', () => {
    const activeCat = document.querySelector('.pill.active').getAttribute('data-id');
    loadProductsForStore(activeCat);
});
document.getElementById('store-search-input').addEventListener('keyup', (e) => {
    if(e.key === 'Enter') document.getElementById('store-search-btn').click();
});

document.getElementById('store-orders-btn').addEventListener('click', () => {
    storeOrdersModal.classList.remove('hidden');
    loadStoreOrders();
});
document.getElementById('close-store-orders-btn').addEventListener('click', () => {
    storeOrdersModal.classList.add('hidden');
});

// Cart Functionality
function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.innerText = count;
    if(count > 0) badge.classList.remove('hidden');
    else badge.classList.add('hidden');
}

window.addToCart = (productId) => {
    const product = globalProducts.find(p => p.id === productId);
    if (!product) return;
    
    if (product.stock <= 0) {
        alert(`Out of stock!`);
        return;
    }
    
    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity++;
        product.stock--;
        alert(`${product.name} quantity increased to ${existing.quantity} in cart!`);
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            stock: product.stock, // original stock if needed
            quantity: 1
        });
        product.stock--;
        alert(`${product.name} added to cart!`);
    }
    
    updateCartBadge();
    renderStoreProducts(globalProducts); // Re-render to show updated stock immediately
};

document.getElementById('store-cart-btn').addEventListener('click', () => {
    renderCartModal();
    storeCartModal.classList.remove('hidden');
});

document.getElementById('close-store-cart-btn').addEventListener('click', () => {
    storeCartModal.classList.add('hidden');
});

function renderCartModal() {
    const list = document.getElementById('cart-items-list');
    const totalEl = document.getElementById('cart-total-price');
    list.innerHTML = '';
    
    if (cart.length === 0) {
        list.innerHTML = '<p class="text-center text-muted">Your cart is empty.</p>';
        totalEl.innerText = '0.00';
        document.getElementById('cart-checkout-btn').disabled = true;
        return;
    }
    
    document.getElementById('cart-checkout-btn').disabled = false;
    let total = 0;
    
    cart.forEach(item => {
        total += (item.price * item.quantity);
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>$${item.price.toFixed(2)} x ${item.quantity}</p>
            </div>
            <div class="cart-item-actions">
                <strong>$${(item.price * item.quantity).toFixed(2)}</strong>
                <button class="btn-icon text-danger ml-2" onclick="removeFromCart(${item.id})"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        list.appendChild(div);
    });
    
    totalEl.innerText = total.toFixed(2);
}

window.removeFromCart = (productId) => {
    const item = cart.find(i => i.id === productId);
    if (item) {
        // Restore virtual stock
        const product = globalProducts.find(p => p.id === productId);
        if (product) {
            product.stock += item.quantity;
        }
        
        cart = cart.filter(i => i.id !== productId);
        updateCartBadge();
        renderCartModal();
        renderStoreProducts(globalProducts); // Re-render to show updated stock
    }
};

document.getElementById('cart-checkout-btn').addEventListener('click', async () => {
    if (cart.length === 0) return;
    
    document.getElementById('cart-checkout-btn').disabled = true;
    document.getElementById('cart-checkout-btn').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
    
    let hasError = false;
    
    // Process each order sequentially
    for (const item of cart) {
        try {
            const res = await fetch(`${API_BASE}/orders/place?productId=${item.id}&quantity=${item.quantity}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) {
                hasError = true;
            }
        } catch (err) {
            hasError = true;
        }
    }
    
    if (hasError) {
        alert("Some items could not be ordered (possibly out of stock). The rest were placed successfully.");
    } else {
        alert("Checkout successful! All orders placed.");
    }
    
    // Clear cart and refresh
    cart = [];
    updateCartBadge();
    storeCartModal.classList.add('hidden');
    document.getElementById('cart-checkout-btn').innerHTML = '<i class="fa-solid fa-credit-card"></i> Checkout';
    
    const activeCat = document.querySelector('.pill.active')?.getAttribute('data-id') || '';
    loadProductsForStore(activeCat);
});

// ==========================================
// ADMIN DASHBOARD LOGIC (ROLE_ADMIN)
// ==========================================
function initAdminDashboard() {
    // Navigation binding
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');
            document.querySelectorAll('.sidebar-nav .nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
            document.getElementById(targetId).classList.remove('hidden');
            
            document.getElementById('current-tab-title').innerText = link.innerText.trim();
            document.getElementById('add-product-form-container').classList.add('hidden');
        });
    });
    
    document.getElementById('admin-refresh-btn').addEventListener('click', loadAdminProducts);
    document.getElementById('admin-category-filter').addEventListener('change', loadAdminProducts);
    
    loadAdminCategories();
    loadAdminProducts();
}

async function loadAdminCategories() {
    try {
        const res = await fetch(`${API_BASE}/categories`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
            const categories = await res.json();
            
            // Populate filter
            const filter = document.getElementById('admin-category-filter');
            filter.innerHTML = '<option value="">All Categories</option>';
            
            // Populate checkboxes for add product
            const checkboxes = document.getElementById('prod-categories-checkboxes');
            checkboxes.innerHTML = '';
            
            categories.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id; opt.innerText = c.name;
                filter.appendChild(opt);
                
                const lbl = document.createElement('label');
                lbl.innerHTML = `<input type="checkbox" class="cat-checkbox" value="${c.id}"> ${c.name}`;
                checkboxes.appendChild(lbl);
            });
            
            // Populate management list
            const list = document.getElementById('categories-list');
            list.innerHTML = '';
            categories.forEach(c => {
                list.innerHTML += `
                    <tr>
                        <td><strong>${c.name}</strong></td>
                        <td class="text-right"><button onclick="deleteCategory(${c.id})" class="btn-icon text-danger"><i class="fa-solid fa-trash"></i></button></td>
                    </tr>
                `;
            });
        }
    } catch (err) {}
}

async function loadAdminProducts() {
    const catId = document.getElementById('admin-category-filter').value;
    const url = catId ? `${API_BASE}/products/category/${catId}` : `${API_BASE}/products`;

    try {
        const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
            globalProducts = await res.json();
            renderAdminProducts(globalProducts);
        }
    } catch (err) {}
}

function renderAdminProducts(products) {
    const grid = document.getElementById('admin-products-list');
    grid.innerHTML = '';
    
    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        const cats = p.categories && p.categories.length > 0 ? p.categories.map(c => c.name).join(', ') : 'Uncategorized';
        const statusClass = p.status === 'ACTIVE' ? 'status-active' : 'status-inactive';

        card.innerHTML = `
            <div class="product-header">
                <h4 class="product-title">${p.name}</h4>
                <span class="status-badge ${statusClass}">${p.status}</span>
            </div>
            <p class="product-desc">${p.description}</p>
            <div class="product-categories"><i class="fa-solid fa-tags"></i> ${cats}</div>
            <div class="product-meta">
                <span class="product-price">$${p.price.toFixed(2)}</span>
                <span class="product-stock"><i class="fa-solid fa-cubes"></i> ${p.stock}</span>
            </div>
            <div class="product-actions" style="margin-top: 1rem;">
                <button onclick="editProduct(${p.id})" class="btn btn-outline btn-block mb-2"><i class="fa-solid fa-pen"></i> Edit</button>
                <button onclick="deleteProduct(${p.id})" class="btn btn-danger-outline btn-block"><i class="fa-solid fa-trash"></i> Delete</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Admin Product Forms
document.getElementById('show-add-product-btn')?.addEventListener('click', () => {
    document.getElementById('product-form-title').innerText = 'Create New Product';
    document.getElementById('edit-prod-id').value = '';
    document.getElementById('add-product-form').reset();
    document.querySelectorAll('.cat-checkbox').forEach(cb => cb.checked = false);
    document.getElementById('add-product-form-container').classList.remove('hidden');
});

document.getElementById('cancel-add-btn')?.addEventListener('click', () => {
    document.getElementById('add-product-form-container').classList.add('hidden');
});

window.editProduct = (id) => {
    const product = globalProducts.find(p => p.id === id);
    if (!product) return;
    document.getElementById('product-form-title').innerText = 'Edit Product';
    document.getElementById('edit-prod-id').value = product.id;
    document.getElementById('prod-name').value = product.name;
    document.getElementById('prod-desc').value = product.description;
    document.getElementById('prod-price').value = product.price;
    document.getElementById('prod-stock').value = product.stock;
    document.getElementById('prod-status').value = product.status;
    const catIds = product.categories.map(c => c.id);
    document.querySelectorAll('.cat-checkbox').forEach(cb => {
        cb.checked = catIds.includes(parseInt(cb.value));
    });
    document.getElementById('add-product-form-container').classList.remove('hidden');
};

document.getElementById('add-product-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const selectedCats = Array.from(document.querySelectorAll('.cat-checkbox:checked')).map(cb => ({ id: parseInt(cb.value) }));
    const product = {
        name: document.getElementById('prod-name').value,
        description: document.getElementById('prod-desc').value,
        price: parseFloat(document.getElementById('prod-price').value),
        stock: parseInt(document.getElementById('prod-stock').value),
        status: document.getElementById('prod-status').value,
        categories: selectedCats
    };
    const editId = document.getElementById('edit-prod-id').value;
    const url = editId ? `${API_BASE}/products/update/${editId}` : `${API_BASE}/products/add`;
    const method = editId ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(product)
        });
        if (res.ok) {
            document.getElementById('add-product-form-container').classList.add('hidden');
            loadAdminProducts();
        } else alert('Failed to save product.');
    } catch (err) {}
});

// Shared API calls
async function loadStoreOrders() {
    try {
        const res = await fetch(`${API_BASE}/orders/my-orders`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
            const orders = await res.json();
            const list = document.getElementById('store-orders-list');
            list.innerHTML = '';
            if(orders.length === 0) {
                list.innerHTML = '<tr><td colspan="6" class="text-center">No orders found.</td></tr>';
                return;
            }
            orders.forEach(o => {
                let statusBadge = '';
                if (o.status === 'CANCELLED') statusBadge = '<span class="status-badge status-inactive">CANCELLED</span>';
                else statusBadge = '<span class="status-badge status-active">CONFIRMED</span>';
                
                let cancelBtn = '-';
                if (o.status !== 'CANCELLED') {
                    cancelBtn = `<button onclick="cancelOrder(${o.id})" class="btn-icon text-danger"><i class="fa-solid fa-ban"></i> Cancel</button>`;
                }
                
                list.innerHTML += `
                    <tr>
                        <td>#${o.id}</td>
                        <td>${o.product ? o.product.name : 'Unknown'}</td>
                        <td>${o.quantity}</td>
                        <td>$${o.totalPrice ? o.totalPrice.toFixed(2) : '0.00'}</td>
                        <td>${statusBadge}</td>
                        <td class="text-right">${cancelBtn}</td>
                    </tr>
                `;
            });
        }
    } catch (err) {}
}

window.cancelOrder = async (orderId) => {
    if (!confirm('Cancel this order?')) return;
    try {
        const res = await fetch(`${API_BASE}/orders/cancel/${orderId}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            loadStoreOrders();
            // refresh grid stock
            const activeCat = document.querySelector('.pill.active').getAttribute('data-id');
            loadProductsForStore(activeCat);
        } else alert('Failed to cancel order.');
    } catch(err) {}
};

window.deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
        const res = await fetch(`${API_BASE}/products/delete/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) loadAdminProducts();
    } catch (err) {}
};

window.deleteCategory = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
        const res = await fetch(`${API_BASE}/categories/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            loadAdminCategories();
            loadAdminProducts();
        }
    } catch (err) {}
};

document.getElementById('add-category-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('cat-name').value;
    try {
        const res = await fetch(`${API_BASE}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ name })
        });
        if (res.ok) {
            document.getElementById('add-category-form').reset();
            loadAdminCategories();
        }
    } catch (err) {}
});

// Auth Submissions
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const text = await res.text();
        if (res.ok && text.length > 0) {
            localStorage.setItem('jwt', text);
            token = text;
            loginForm.reset();
            init();
        } else alert('Login Failed: ' + text);
    } catch (err) {}
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const role = document.getElementById('reg-role').value;
    try {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role })
        });
        const text = await res.text();
        if (res.ok) {
            alert("Registration successful! Please login.");
            registerForm.reset();
        } else alert('Registration Failed: ' + text);
    } catch (err) {}
});

init();