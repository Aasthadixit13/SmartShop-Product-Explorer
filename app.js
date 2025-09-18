const API = "https://fakestoreapi.com/products";
const container = document.getElementById("products");
const search = document.getElementById("search");
const filtercategory = document.getElementById("categoryFilter");
const sort = document.getElementById("sort");
const favCount = document.getElementById("favCount");
const cartCount = document.getElementById("cartCount");
const clearBtn = document.getElementById("clearFilters");

let actualData = [];
let favs = new Set(); // favorites
let cart = new Set(); // cart

// fetch products
async function fetchProducts() {
  try {
    const res = await fetch(API);
    actualData = await res.json();

    // populate categories
    const categories = [...new Set(actualData.map(p => p.category))];
    filtercategory.innerHTML = `<option value="">All categories</option>`;
    categories.forEach(cat => {
      filtercategory.innerHTML += `<option value="${cat}">${cat}</option>`;
    });

    displayProducts(actualData);
  } catch (err) {
    container.innerHTML = "❌ Failed to load products.";
    console.error(err);
  }
}

// display products
function displayProducts(items) {
  container.innerHTML = '<div class="row"></div>';
  const row = container.querySelector(".row");

  if (items.length === 0) {
    row.innerHTML = "<p>No products found.</p>";
    return;
  }

  items.forEach(product => {
    const discount = Math.floor(Math.random() * 50) + 1;

    const col = document.createElement("div");
    col.className = "col-12 col-sm-6 col-md-4 col-lg-3 mb-4";

    col.innerHTML = `
      <div class="card shadow-sm h-100 p-2 position-relative" style="border-radius:15px;">
        <!-- Fav icon -->
        <button class="fav-btn position-absolute top-0 end-0 m-2 rounded-circle shadow-sm" data-id="${product.id}">
          <i class="fa-regular fa-heart ${favs.has(product.id) ? 'fa-solid text-danger' : ''}"></i>
        </button>

        <img src="${product.image}" alt="${product.title}" 
             class="card-img-top p-3" 
             style="height:140px; object-fit:contain;">

        <div class="card-body d-flex flex-column">
          <h6 class="card-title">${product.title}</h6>
          <p><strong>₹${product.price}</strong></p>

          <p class="text-warning mb-1">
            ⭐ ${product.rating.rate} 
            <span class="text-muted small">(${product.rating.count} reviews)</span>
          </p>

          <div class="mb-2">
            <span class="badge bg-light text-dark">${product.category}</span>
            <span class="badge bg-light text-dark">${discount}% off</span>
          </div>

          <div class="mt-auto d-flex justify-content-between product-actions">
            <button class="btn btn-outline-secondary btn-sm add-cart" data-id="${product.id}">
              <i class="fa fa-cart-plus"></i> Add
            </button>
            <button class="btn btn-outline-secondary btn-sm view-btn" data-id="${product.id}">View</button>


            

          </div>
        </div>
      </div>
    `;

    row.appendChild(col);
  });

  // fav button toggle
  document.querySelectorAll(".fav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.getAttribute("data-id"));
      const icon = btn.querySelector("i");

      if (favs.has(id)) {
        favs.delete(id);
        icon.classList.remove("fa-solid", "text-danger");
        icon.classList.add("fa-regular");
      } else {
        favs.add(id);
        icon.classList.add("fa-solid", "text-danger");
        icon.classList.remove("fa-regular");
      }
      favCount.textContent = favs.size;
    });
  });

  // add to cart
  document.querySelectorAll(".add-cart").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.getAttribute("data-id"));
      cart.add(id);
      cartCount.textContent = cart.size;
    });
  });
}

// apply filter
function applyFilter() {
  let items = [...actualData];

  // category filter
  if (filtercategory.value) {
    items = items.filter(el => el.category === filtercategory.value);
  }

  // sort
  if (sort.value === "low") {
    items.sort((a, b) => a.price - b.price);
  } else if (sort.value === "high") {
    items.sort((a, b) => b.price - a.price);
  }

  // search
  if (search.value) {
    items = items.filter(el =>
      el.title.toLowerCase().includes(search.value.toLowerCase())
    );
  }

  displayProducts(items);
}

// clear button → reset everything
clearBtn.addEventListener("click", () => {
  favs.clear();
  cart.clear();
  favCount.textContent = 0;
  cartCount.textContent = 0;

  search.value = "";
  filtercategory.value = "";
  sort.value = "";

  displayProducts(actualData);
});

// event listeners
sort.addEventListener("change", applyFilter);
filtercategory.addEventListener("change", applyFilter);
search.addEventListener("input", applyFilter);

// initial load
fetchProducts();


// 🌙 Dark Mode Toggle
const toggleBtn = document.getElementById("modeToggle");
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  toggleBtn.textContent = document.body.classList.contains("dark-mode")
    ? "☀️ Light Mode"
    : "🌙 Dark Mode";
});

// 🍔 Hamburger Toggle
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");
hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});
// 🔎 View button → open product details in new page
document.addEventListener("click", (e) => {
  if (e.target.closest(".view-btn")) {
    const btn = e.target.closest(".view-btn");
    const id = btn.getAttribute("data-id");
    window.open(`product.html?id=${id}`, "_blank"); // open in new tab
  }
});