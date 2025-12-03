/* script.js - logic SPA sederhana
   - menggunakan localStorage untuk users & orders
   - menggunakan sessionStorage untuk session (session)
   - menggunakan document.cookie untuk remember me
*/

const PRODUCTS = [
  { id: 1, title: "Pupuk Organik 5kg", price: 45000, desc: "Pupuk organik untuk sayuran.", cssClass: "prod-1" },
  { id: 2, title: "Pupuk NPK 10-10-10 5kg", price: 60000, desc: "Seimbang untuk pertumbuhan.", cssClass: "prod-2" },
  { id: 3, title: "Pupuk Cair 1L", price: 25000, desc: "Pupuk cair konsentrat.", cssClass: "prod-3" }
];

/* ----- Utility: storage & cookies ----- */
function saveUsers(users){ localStorage.setItem('pupp_users', JSON.stringify(users)); }
function loadUsers(){ return JSON.parse(localStorage.getItem('pupp_users') || '[]'); }

function saveOrders(orders){ localStorage.setItem('pupp_orders', JSON.stringify(orders)); }
function loadOrders(){ return JSON.parse(localStorage.getItem('pupp_orders') || '[]'); }

function setCookie(name, value, days=30){
  const d = new Date(); d.setTime(d.getTime() + (days*24*60*60*1000));
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${d.toUTCString()}; path=/`;
}
function getCookie(name){
  const raw = document.cookie.split('; ').find(r=>r.startsWith(name+'='));
  return raw ? decodeURIComponent(raw.split('=')[1]) : null;
}
function eraseCookie(name){ document.cookie = name+'=; Max-Age=0; path=/'; }

/* ----- Session management ----- */
function setSession(username){
  sessionStorage.setItem('pupp_session', username);
}
function getSession(){ return sessionStorage.getItem('pupp_session'); }
function clearSession(){ sessionStorage.removeItem('pupp_session'); }

/* ----- Cart management (localStorage per browser) ----- */
function loadCart(){ return JSON.parse(localStorage.getItem('pupp_cart') || '[]'); }
function saveCart(cart){ localStorage.setItem('pupp_cart', JSON.stringify(cart)); updateCartCount(); }
function addToCart(productId, qty=1){
  const cart = loadCart();
  const item = cart.find(i=>i.id===productId);
  if(item) item.qty += qty;
  else cart.push({ id: productId, qty });
  saveCart(cart);
}
function updateCartCount(){
  const count = loadCart().reduce((s,i)=>s+i.qty,0);
  document.getElementById('cart-count').textContent = count;
}

/* ----- DOM & Views ----- */
const productsEl = document.getElementById('products');
const cartPanel = document.getElementById('cart-panel');
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const ordersListEl = document.getElementById('orders-list');
const welcomeText = document.getElementById('welcome-text');

function renderProducts(){
  productsEl.innerHTML = '';
  PRODUCTS.forEach(p=>{
    const card = document.createElement('div'); card.className = 'card';
    const img = document.createElement('div'); img.className = `prod-img ${p.cssClass}`;
    const title = document.createElement('div'); title.className = 'prod-title'; title.textContent = p.title;
    const desc = document.createElement('div'); desc.className = 'prod-desc'; desc.textContent = p.desc;
    const bottom = document.createElement('div'); bottom.className='prod-bottom';
    const price = document.createElement('div'); price.innerHTML = `<strong>Rp ${p.price.toLocaleString()}</strong>`;
    const btn = document.createElement('button'); btn.className='btn primary'; btn.textContent='Tambah'; btn.onclick=()=>{ addToCart(p.id); alert('Ditambahkan ke keranjang'); };
    bottom.appendChild(price); bottom.appendChild(btn);
    card.appendChild(img); card.appendChild(title); card.appendChild(desc); card.appendChild(bottom);
    productsEl.appendChild(card);
  });
}

/* ----- Cart UI ----- */
function openCart(){
  renderCart();
  cartPanel.classList.remove('hidden');
}
function closeCart(){ cartPanel.classList.add('hidden'); }
function renderCart(){
  const cart = loadCart();
  cartItemsEl.innerHTML = '';
  let total = 0;
  if(cart.length===0){ cartItemsEl.innerHTML = '<div class="small">Keranjang kosong</div>'; cartTotalEl.textContent = '0'; return; }
  cart.forEach(ci=>{
    const prod = PRODUCTS.find(p=>p.id===ci.id);
    const row = document.createElement('div'); row.className='cart-item';
    const img = document.createElement('div'); img.style.width='64px'; img.style.height='54px'; img.style.background = `url("${getCssImage(prod.cssClass)}") center/cover`; img.style.borderRadius='6px';
    const info = document.createElement('div'); info.style.flex='1';
    info.innerHTML = `<div style="font-weight:600">${prod.title}</div><div class="small">Rp ${prod.price.toLocaleString()}</div>`;
    const controls = document.createElement('div'); controls.className='qty-controls';
    const minus = document.createElement('button'); minus.textContent='-'; minus.className='btn secondary'; minus.onclick=()=>{ changeQty(prod.id, -1); };
    const qtyEl = document.createElement('div'); qtyEl.textContent = ci.qty; qtyEl.style.minWidth='20px'; qtyEl.style.textAlign='center';
    const plus = document.createElement('button'); plus.textContent='+'; plus.className='btn secondary'; plus.onclick=()=>{ changeQty(prod.id, 1); };
    const remove = document.createElement('button'); remove.textContent='Hapus'; remove.className='btn'; remove.onclick=()=>{ removeFromCart(prod.id); };
    controls.appendChild(minus); controls.appendChild(qtyEl); controls.appendChild(plus);
    row.appendChild(img); row.appendChild(info); row.appendChild(controls); row.appendChild(remove);
    cartItemsEl.appendChild(row);
    total += prod.price * ci.qty;
  });
  cartTotalEl.textContent = total.toLocaleString();
}
function getCssImage(cssClass){
  // map cssClass to same urls used in CSS (duplicate mapping)
  if(cssClass==='prod-1') return 'https://images.unsplash.com/photo-1601758123927-3c2f51d845a6?q=80&w=800&auto=format&fit=crop';
  if(cssClass==='prod-2') return 'https://images.unsplash.com/photo-1560193479-6e2a6b8e2baf?q=80&w=800&auto=format&fit=crop';
  return 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=800&auto=format&fit=crop';
}
function changeQty(id, delta){
  const cart = loadCart();
  const item = cart.find(i=>i.id===id);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0) {
    const idx = cart.findIndex(i=>i.id===id); cart.splice(idx,1);
  }
  saveCart(cart);
  renderCart();
}
function removeFromCart(id){
  const cart = loadCart().filter(i=>i.id!==id);
  saveCart(cart);
  renderCart();
}

/* ----- Checkout: create order and save to localStorage ----- */
function checkout(){
  const user = getSession();
  if(!user){ alert('Silakan login terlebih dahulu untuk checkout'); return; }
  const cart = loadCart();
  if(cart.length===0){ alert('Keranjang kosong'); return; }
  const orders = loadOrders();
  const total = cart.reduce((s,i)=> s + (PRODUCTS.find(p=>p.id===i.id).price * i.qty), 0);
  const newOrder = {
    id: 'ORD' + Date.now(),
    user,
    items: cart,
    total,
    status: 'Dalam Proses',
    createdAt: new Date().toISOString()
  };
  orders.push(newOrder);
  saveOrders(orders);
  localStorage.removeItem('pupp_cart');
  updateCartCount();
  closeCart();
  alert('Pembelian berhasil! ID Pesanan: ' + newOrder.id);
  showOrders();
}

/* ----- Orders UI ----- */
function renderOrders(){
  const orders = loadOrders().filter(o => getSession() ? o.user === getSession() : true);
  ordersListEl.innerHTML = '';
  if(orders.length===0){ ordersListEl.innerHTML = '<div class="small">Belum ada pesanan.</div>'; return; }
  orders.forEach(o=>{
    const card = document.createElement('div'); card.className='card';
    card.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><div><strong>${o.id}</strong><div class="small">${new Date(o.createdAt).toLocaleString()}</div></div><div><span class="small">Status:</span><div><strong>${o.status}</strong></div></div></div>`;
    const list = document.createElement('div'); list.style.marginTop='8px';
    o.items.forEach(it=>{
      const p = PRODUCTS.find(px=>px.id===it.id);
      list.innerHTML += `<div class="small">${p.title} x ${it.qty} — Rp ${(p.price*it.qty).toLocaleString()}</div>`;
    });
    card.appendChild(list);
    card.innerHTML += `<div style="margin-top:8px"><strong>Total: Rp ${o.total.toLocaleString()}</strong></div>`;
    ordersListEl.appendChild(card);
  });
}

/* ----- Auth (register/login) ----- */
function registerUser(form){
  const fd = new FormData(form);
  const name = fd.get('name').trim();
  const username = fd.get('username').trim();
  const password = fd.get('password').trim();
  const users = loadUsers();
  if(users.find(u=>u.username===username)){ alert('Username sudah dipakai'); return; }
  users.push({ name, username, password });
  saveUsers(users);
  alert('Akun berhasil dibuat. Silakan login.');
  showLoginForm();
}
function loginUser(form){
  const fd = new FormData(form);
  const username = fd.get('username').trim();
  const password = fd.get('password').trim();
  const users = loadUsers();
  const u = users.find(x=>x.username===username && x.password===password);
  if(!u){ alert('Login gagal: cek username/password'); return; }
  setSession(username);
  if(document.getElementById('remember-me').checked){
    setCookie('pupp_remember', username, 30);
  } else {
    eraseCookie('pupp_remember');
  }
  updateUIOnAuth();
  closeAuthModal();
}

/* ----- UI helpers ----- */
function updateUIOnAuth(){
  const user = getSession() || getCookie('pupp_remember');
  if(user){
    welcomeText.textContent = `Halo, ${user}`;
    document.getElementById('btn-login').classList.add('hidden');
    document.getElementById('btn-logout').classList.remove('hidden');
    if(!getSession()) setSession(user); // if cookie existed, set session
  } else {
    welcomeText.textContent = '';
    document.getElementById('btn-login').classList.remove('hidden');
    document.getElementById('btn-logout').classList.add('hidden');
  }
}

function closeAuthModal(){ document.getElementById('auth-modal').classList.add('hidden'); }
function showAuthModal(){ document.getElementById('auth-modal').classList.remove('hidden'); }
function showRegisterForm(){ document.getElementById('login-form').classList.add('hidden'); document.getElementById('register-form').classList.remove('hidden'); }
function showLoginForm(){ document.getElementById('login-form').classList.remove('hidden'); document.getElementById('register-form').classList.add('hidden'); }

function logout(){
  clearSession();
  eraseCookie('pupp_remember');
  updateUIOnAuth();
  alert('Anda berhasil logout.');
}

/* ----- Navigation (simple SPA switching) ----- */
function showShop(){ document.getElementById('shop-view').classList.remove('hidden'); document.getElementById('orders-view').classList.add('hidden'); }
function showOrders(){ document.getElementById('shop-view').classList.add('hidden'); document.getElementById('orders-view').classList.remove('hidden'); renderOrders(); }

/* ----- Bind UI events ----- */
document.addEventListener('DOMContentLoaded', ()=>{
  renderProducts();
  updateCartCount();
  updateUIOnAuth();

  // nav
  document.getElementById('btn-cart').onclick = openCart;
  document.getElementById('close-cart').onclick = closeCart;
  document.getElementById('checkout-btn').onclick = checkout;
  document.getElementById('show-shop').onclick = showShop;
  document.getElementById('show-orders').onclick = showOrders;

  // auth modal
  document.getElementById('btn-login').onclick = showAuthModal;
  document.getElementById('close-auth').onclick = closeAuthModal;
  document.getElementById('show-register').onclick = showRegisterForm;
  document.getElementById('show-login').onclick = showLoginForm;
  document.getElementById('btn-logout').onclick = logout;

  // forms
  document.getElementById('register-form').addEventListener('submit', function(e){ e.preventDefault(); registerUser(this); });
  document.getElementById('login-form').addEventListener('submit', function(e){ e.preventDefault(); loginUser(this); });

  // If cookie remember exists, auto-login
  const remembered = getCookie('pupp_remember');
  if(remembered && !getSession()){ setSession(remembered); updateUIOnAuth(); }

  // quick open shop
  showShop();
});
