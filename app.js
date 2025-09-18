const API = "https://fakestoreapi.com/products";
const container = document.getElementById("products");
const search = document.getElementById("search");
const filtercategory = document.getElementById("categoryFilter");
const sort = document.getElementById("sort");
const favCount = document.getElementById("favCount");
const cartCount = document.getElementById("cartCount");
const clearBtn = document.getElementById("clearFilters");

let actualData = [];
let favs = new Set();
let cart = new Set();

// Fetch products
async function fetchProducts() {
  try {
    console.log("Fetching products...");
    await new Promise(r => setTimeout(r, 500)); // pause for 500ms

    const res = await fetch(API);
    actualData = await res.json();

    // Pause to inspect fetched data
    setTimeout(() => console.log("Fetched data:", actualData), 500);

    // Populate categories
    const categories = [...new Set(actualData.map(p => p.category))];
    filtercategory.innerHTML = `<option value="">All categories</option>`;
    categories.forEach(cat => filtercategory.innerHTML += `<option value="${cat}">${cat}</option>`);

    displayProducts(actualData);
  } catch(err) {
    container.innerHTML = "❌ Failed to load products.";
    console.error(err);
  }
}

// Display products
function displayProducts(items) {
  container.innerHTML = '';
  if(items.length === 0) { 
    container.innerHTML = "<p>No products found.</p>"; 
    return; 
  }

  items.forEach((product, index) => {
    const discount = Math.floor(Math.random() * 50) + 1;

    const col = document.createElement("div");
    col.className = "col-12 col-sm-6 col-md-4 col-lg-3 mb-4";

    col.innerHTML = `
      <div class="card shadow-sm h-100 p-2 position-relative" style="border-radius:15px;">
        <button class="fav-btn position-absolute top-0 end-0 m-2 rounded-circle shadow-sm" data-id="${product.id}">
          <i class="fa-regular fa-heart ${favs.has(product.id)? 'fa-solid text-danger':''}"></i>
        </button>
        <img src="${product.image}" alt="${product.title}" class="card-img-top p-3">
        <div class="card-body d-flex flex-column">
          <h6 class="card-title">${product.title}</h6>
          <p><strong>₹${product.price}</strong></p>
          <p class="text-warning mb-1">⭐ ${product.rating.rate} <span class="text-muted small">(${product.rating.count} reviews)</span></p>
          <div class="mb-2">
            <span class="badge bg-light text-dark">${product.category}</span>
            <span class="badge bg-light text-dark">${discount}% off</span>
          </div>
          <div class="mt-auto d-flex justify-content-between product-actions">
            <button class="btn btn-outline-secondary btn-sm add-cart" data-id="${product.id}">Add</button>
            <button class="btn btn-outline-secondary btn-sm view-btn" data-id="${product.id}">View</button>
          </div>
        </div>
      </div>
    `;
    
    container.appendChild(col);

    // Step-by-step delay using setTimeout
    setTimeout(() => console.log(`Rendered product: ${product.title} (${index+1})`), 200 * index);
  });

  // Fav toggle
  document.querySelectorAll(".fav-btn").forEach(btn => {
    btn.onclick = () => {
      const id = parseInt(btn.dataset.id);
      const icon = btn.querySelector("i");

      setTimeout(() => {
        if(favs.has(id)) { 
          favs.delete(id); 
          icon.classList.remove("fa-solid","text-danger"); 
          icon.classList.add("fa-regular"); 
        } else { 
          favs.add(id); 
          icon.classList.add("fa-solid","text-danger"); 
          icon.classList.remove("fa-regular"); 
        }
        favCount.textContent = favs.size;
        console.log("Favorites updated:", Array.from(favs));
      }, 300); // 300ms pause before toggle
    }
  });

  // Add to cart
  document.querySelectorAll(".add-cart").forEach(btn => {
    btn.onclick = () => {
      const id = parseInt(btn.dataset.id);
      setTimeout(() => {
        cart.add(id); 
        cartCount.textContent = cart.size;
        console.log("Cart updated:", Array.from(cart));
      }, 300);
    }
  });

  // View product
  document.querySelectorAll(".view-btn").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      setTimeout(() => {
        window.location.href = `product.html?id=${id}`;
      }, 200); // small delay before redirect
    }
  });
}

// Apply filter
function applyFilter() {
  let items = [...actualData];
  if(filtercategory.value) items = items.filter(p => p.category === filtercategory.value);
  if(sort.value==="low") items.sort((a,b)=>a.price-b.price);
  else if(sort.value==="high") items.sort((a,b)=>b.price-a.price);
  if(search.value) items = items.filter(p => p.title.toLowerCase().includes(search.value.toLowerCase()));
  
  setTimeout(() => displayProducts(items), 200); // delay before rendering
}

// Clear filters
clearBtn.onclick = () => {
  setTimeout(() => {
    favs.clear();
    cart.clear();
    favCount.textContent = 0;
    cartCount.textContent = 0;
    search.value = "";
    filtercategory.value = "";
    sort.value = "";
    displayProducts(actualData);
    console.log("Filters cleared");
  }, 200);
}

// Event listeners
sort.addEventListener("change", applyFilter);
filtercategory.addEventListener("change", applyFilter);
search.addEventListener("input", applyFilter);

// Dark Mode
const toggleBtn = document.getElementById("modeToggle");
toggleBtn.onclick = () => {
  setTimeout(() => {
    document.body.classList.toggle("dark-mode");
    toggleBtn.textContent = document.body.classList.contains("dark-mode") ? "☀️ Light Mode" : "🌙 Dark Mode";
    console.log("Dark mode toggled:", document.body.classList.contains("dark-mode"));
  }, 100);
}

// Hamburger
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");
if(hamburger) hamburger.onclick = () => {
  setTimeout(() => {
    navLinks.classList.toggle("active");
    console.log("Hamburger toggled:", navLinks.classList.contains("active"));
  }, 100);
}

// Initial load
fetchProducts();
