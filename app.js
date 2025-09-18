    (function () {
      const API = 'https://fakestoreapi.com/products';
      const PRODUCTS_PER_PAGE = 10;
      const STORAGE_KEYS = { FAVS: 'smartshop_favs', CART: 'smartshop_cart' };
      const state = {
        allProducts: [],
        displayed: [],
        page: 0,
        perPage: PRODUCTS_PER_PAGE,
        searchTerm: '',
        category: '',
        sortBy: '',
        priceRange: [0, Infinity],
        minRating: 0
      };

      const $products = document.getElementById('products');
      const $search = document.getElementById('search');
      const $spinner = document.getElementById('spinner');
      const $status = document.getElementById('status');
      const $categoryFilter = document.getElementById('categoryFilter');
      const $sortBy = document.getElementById('sortBy');
      const $sentinel = document.getElementById('sentinel');
      const $favCount = document.getElementById('favCount');
      const $cartCount = document.getElementById('cartCount');
      const $cartView = document.getElementById('cartView');
      const $favView = document.getElementById('favView');
      const $clearFilters = document.getElementById('clearFilters');

      function loadFavs() { try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVS)) || []; } catch (e) { return []; } }
      function saveFavs(arr) { localStorage.setItem(STORAGE_KEYS.FAVS, JSON.stringify(arr)); updateCounts(); }
      function loadCart() { try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.CART)) || {}; } catch (e) { return {}; } }
      function saveCart(obj) { localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(obj)); updateCounts(); }

      function showSpinner(show = true) { $spinner.classList.toggle('visible', !!show); }
      function showError(msg) { $status.innerHTML = '<div class="error">' + escapeHtml(msg) + '</div>'; }
      function clearStatus() { $status.innerHTML = ''; }
      function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

      async function fetchProducts() {
        showSpinner(true); clearStatus();
        try {
          const res = await fetch(API);
          if (!res.ok) throw new Error('Network response not ok: ' + res.status);
          const data = await res.json();
          state.allProducts = data.map(p => ({
            id: p.id,
            title: p.title,
            category: p.category,
            price: Number(p.price),
            description: p.description,
            image: p.image,
            rating: p.rating?.rate || 0,
            discount: p.discount ?? Math.round(Math.random() * 40)
          }));
          populateCategoryFilter();
          applyFilters(true);
        } catch (err) {
          console.error(err);
          showError('Failed to fetch products.');
        } finally {
          showSpinner(false);
        }
      }

      function populateCategoryFilter() {
        const set = new Set(state.allProducts.map(p => p.category));
        $categoryFilter.innerHTML = '<option value="">All categories</option>' + Array.from(set).map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
      }

      function applyFilters(resetPage = false) {
        if (resetPage) state.page = 0;
        const term = state.searchTerm.trim().toLowerCase();
        state.displayed = state.allProducts.filter(p => {
          if (state.category && p.category !== state.category) return false;
          if (p.price < state.priceRange[0] || p.price > state.priceRange[1]) return false;
          if (p.rating < state.minRating) return false;
          if (term) {
            const hay = (p.title + ' ' + p.description + ' ' + p.category).toLowerCase();
            if (!hay.includes(term)) return false;
          }
          return true;
        });
        applySort();
        renderPage(true);
      }

      function applySort() {
        const key = state.sortBy;
        if (!key) return;
        const [prop, dir] = key.split(':');
        const factor = dir === 'asc' ? 1 : -1;
        state.displayed.sort((a, b) => {
          const va = a?.[prop] ?? 0;
          const vb = b?.[prop] ?? 0;
          return (va - vb) * factor;
        });
      }

      function highlight(text, term) {
        if (!term) return escapeHtml(text);
        try {
          const esc = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          return escapeHtml(text).replace(new RegExp(esc, 'gi'), match => `<mark>${match}</mark>`);
        } catch (e) {
          return escapeHtml(text);
        }
      }

      function renderPage(reset = false) {
        const start = state.page * state.perPage;
        const end = start + state.perPage;
        const pageItems = state.displayed.slice(start, end);
        if (reset) $products.innerHTML = '';
        if (pageItems.length === 0 && state.page === 0) {
          $products.innerHTML = '<div style="padding:18px">No products found.</div>';
          return;
        }
        const term = state.searchTerm;
        const favs = loadFavs();
        const cart = loadCart();
        const html = pageItems.map(p => {
          return `
        <article class="card" data-id="${p.id}">
          <div class="thumb"><img alt="${escapeHtml(p.title)}" src="${p.image}"></div>
          <div class="title highlight">${highlight(p.title, term)}</div>
          <div class="meta"><div class="price">₹${p.price.toFixed(2)}</div><div>⭐ ${p.rating}</div></div>
          <div class="meta"><div class="chip">${escapeHtml(p.category)}</div><div class="chip">${p.discount}% off</div></div>
          <div class="actions">
            <button data-action="add-cart" data-id="${p.id}">Add 🛒</button>
            <button data-action="toggle-fav" data-id="${p.id}">${favs.includes(p.id) ? '♥' : '♡'}</button>
            <button data-action="view" data-id="${p.id}">View</button>
          </div>
        </article>`;
        }).join('');
        $products.insertAdjacentHTML('beforeend', html);
        updateCounts();
      }

      function loadNextPage() {
        const maxPage = Math.ceil(state.displayed.length / state.perPage);
        if ((state.page + 1) >= maxPage) return;
        state.page++;
        renderPage(false);
      }

      $products.addEventListener('click', (ev) => {
        const btn = ev.target.closest('[data-action]');
        if (!btn) return;
        const action = btn.dataset.action;
        const id = Number(btn.dataset.id);
        if (action === 'add-cart') { addToCart(id); }
        else if (action === 'toggle-fav') { toggleFavorite(id, btn); }
        else if (action === 'view') {
          // 👉 open details in a new page
          window.location.href = `product.html?id=${id}`;
        }
      });

      function toggleFavorite(id, btnEl) {
        const favs = loadFavs();
        const idx = favs.indexOf(id);
        if (idx >= 0) { favs.splice(idx, 1); } else { favs.push(id); }
        saveFavs(favs);
        if (btnEl) btnEl.textContent = favs.includes(id) ? '♥' : '♡';
        renderSideViews();
      }

      function addToCart(id, qty = 1) {
        const cart = loadCart();
        cart[id] = (cart[id] || 0) + qty;
        saveCart(cart);
        renderSideViews();
      }

      function removeFromCart(id) {
        const cart = loadCart();
        delete cart[id];
        saveCart(cart);
        renderSideViews();
      }

      function updateCounts() {
        $favCount.textContent = loadFavs().length;
        $cartCount.textContent = Object.values(loadCart()).reduce((s, q) => s + q, 0) || 0;
      }

      function renderSideViews() {
        const favs = loadFavs();
        const cart = loadCart();
        $favView.innerHTML = '<strong>Favorites</strong>' + (favs.length ? '<ul>' + favs.map(id => {
          const p = state.allProducts.find(x => x.id === id);
          return `<li>${escapeHtml(p?.title ?? 'Unknown')} <button data-action="toggle-fav" data-id="${id}">remove</button></li>`;
        }).join('') + '</ul>' : '<div>No favorites</div>');
        $cartView.innerHTML = '<strong>Cart</strong>' + (Object.keys(cart).length ? '<ul>' + Object.entries(cart).map(([id, q]) => {
          const p = state.allProducts.find(x => x.id == id);
          return `<li>${escapeHtml(p?.title ?? 'Unknown')} x ${q} <button data-action="cart-remove" data-id="${id}">remove</button></li>`;
        }).join('') + '</ul>' : '<div>Cart empty</div>');
      }

      document.getElementById('sidepanel').addEventListener('click', (ev) => {
        const btn = ev.target.closest('[data-action]');
        if (!btn) return;
        const act = btn.dataset.action, id = Number(btn.dataset.id);
        if (act === 'toggle-fav') toggleFavorite(id);
        if (act === 'cart-remove') removeFromCart(id);
      });

      function debounce(fn, wait = 300) {
        let t;
        return function (...args) {
          clearTimeout(t);
          t = setTimeout(() => fn.apply(this, args), wait);
        }
      }
      const debouncedSearch = debounce((value) => {
        state.searchTerm = value;
        applyFilters(true);
      }, 350);

      $search.addEventListener('input', (e) => debouncedSearch(e.target.value));
      $categoryFilter.addEventListener('change', e => { state.category = e.target.value; applyFilters(true); });
      $sortBy.addEventListener('change', e => { state.sortBy = e.target.value; applyFilters(true); });
      $clearFilters.addEventListener('click', () => {
        state.searchTerm = '';
        state.category = '';
        state.sortBy = '';
        $search.value = '';
        $categoryFilter.value = '';
        $sortBy.value = '';
        applyFilters(true);
      });

      const observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const maxPage = Math.ceil(state.displayed.length / state.perPage);
            if ((state.page + 1) < maxPage) {
              loadNextPage();
            }
          }
        }
      }, { rootMargin: '300px' });
      observer.observe($sentinel);

      function init() {
        updateCounts();
        renderSideViews();
        fetchProducts();
      }
      document.body.addEventListener('click', (ev) => {
        const btn = ev.target.closest('[data-action="cart-remove"]');
        if (btn) { removeFromCart(Number(btn.dataset.id)); }
      });
      init();
    })();