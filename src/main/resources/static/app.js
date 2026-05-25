const API_BASE = window.location.origin;

// DOM Elements
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const userInfo = document.getElementById('user-info');
const welcomeMsg = document.getElementById('welcome-msg');
const logoutBtn = document.getElementById('logout-btn');
const loadProductsBtn = document.getElementById('load-products-btn');
const productsList = document.getElementById('products-list');

// Admin Elements
const adminControls = document.getElementById('admin-controls');
const showAddProductBtn = document.getElementById('show-add-product-btn');
const addProductFormContainer = document.getElementById('add-product-form-container');
const addProductForm = document.getElementById('add-product-form');
const cancelAddBtn = document.getElementById('cancel-add-btn');

let token = localStorage.getItem('jwt');
let userRole = null;

// Helper to decode JWT and extract the role
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

// Initialization
function init() {
    if (token) {
        const payload = parseJwt(token);
        if (payload) {
            userRole = payload.role;
            showDashboard();
        } else {
            // Invalid token
            logout();
        }
    } else {
        showAuth();
    }
}

function showAuth() {
    authSection.classList.remove('hidden');
    dashboardSection.classList.add('hidden');
    userInfo.classList.add('hidden');
}

function showDashboard() {
    authSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    userInfo.classList.remove('hidden');
    
    // Welcome message showing role
    const displayRole = userRole === 'ROLE_ADMIN' ? 'Admin' : 'User';
    welcomeMsg.innerText = `Logged In as ${displayRole}`;
    
    // Conditionally show Admin controls (Add Product button)
    if (userRole === 'ROLE_ADMIN') {
        adminControls.classList.remove('hidden');
    } else {
        adminControls.classList.add('hidden');
        addProductFormContainer.classList.add('hidden');
    }
    
    loadProducts();
}

// Auth Handlers
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
            token = text;
            localStorage.setItem('jwt', token);
            
            const payload = parseJwt(token);
            userRole = payload ? payload.role : null;
            
            alert('Login Successful!');
            showDashboard();
        } else {
            alert('Login Failed: ' + text);
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
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
            alert(text);
            registerForm.reset();
        } else {
            alert('Registration Failed: ' + text);
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
});

function logout() {
    token = null;
    userRole = null;
    localStorage.removeItem('jwt');
    showAuth();
}

logoutBtn.addEventListener('click', logout);

// Product Handlers
loadProductsBtn.addEventListener('click', loadProducts);

async function loadProducts() {
    if (!token) return;
    try {
        const res = await fetch(`${API_BASE}/products`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
            const products = await res.json();
            renderProducts(products);
        } else {
            alert('Failed to load products. Check console/auth.');
        }
    } catch (err) {
        alert('Error loading products: ' + err.message);
    }
}

function renderProducts(products) {
    productsList.innerHTML = '';
    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        // Only add the Delete button if the user is an ADMIN
        const deleteButtonHtml = userRole === 'ROLE_ADMIN' 
            ? `<button onclick="deleteProduct(${p.id})">Delete</button>` 
            : '';
            
        card.innerHTML = `
            <h4>${p.name}</h4>
            <p>${p.description || 'No description'}</p>
            <p class="price">$${p.price.toFixed(2)}</p>
            <p>Stock: ${p.stock}</p>
            <p>Status: ${p.status}</p>
            ${deleteButtonHtml}
        `;
        productsList.appendChild(card);
    });
}

// Add Product UI
showAddProductBtn.addEventListener('click', () => {
    addProductFormContainer.classList.remove('hidden');
});

cancelAddBtn.addEventListener('click', () => {
    addProductFormContainer.classList.add('hidden');
    addProductForm.reset();
});

addProductForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!token) return;

    const product = {
        name: document.getElementById('prod-name').value,
        description: document.getElementById('prod-desc').value,
        price: parseFloat(document.getElementById('prod-price').value),
        stock: parseInt(document.getElementById('prod-stock').value),
        status: document.getElementById('prod-status').value
    };

    try {
        const res = await fetch(`${API_BASE}/products/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(product)
        });

        if (res.ok) {
            alert('Product added successfully!');
            addProductForm.reset();
            addProductFormContainer.classList.add('hidden');
            loadProducts();
        } else {
            alert('Failed to add product (Requires Admin Role).');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
});

// Delete Product
window.deleteProduct = async (id) => {
    if (!token) return;
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        const res = await fetch(`${API_BASE}/products/delete/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            alert('Product deleted!');
            loadProducts();
        } else {
            alert('Failed to delete product (Requires Admin Role).');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
};

init();