const API_URL = "https://script.google.com/macros/s/AKfycbxtFiRVCd9Y1MZ6l8-YlmmzRa97RZ6xppFLYoQgTEOBddtlx6wE6q9PnUaCdu3D94BR/exec";

const PAGE_SIZE = 20; // 每次只加载 20 个，保证秒开！

const CATEGORIES = [
  "SUMMER Pick",
  "SNEAKERS",
  "T-SHIRTS/SHORTS",
  "HOODIE/PANTS",
  "DOWNJACKET",
  "ACCESSORIES",
  "BAGS"
];

let currentCategory = CATEGORIES[0];
let currentProducts = [];
let currentPage = 1;
let isLoading = false;
let hasMore = true;

document.addEventListener("DOMContentLoaded", init);

function init() {
  renderCategoryButtons();
  setupSearch();
  setupRefresh();
  setupScrollListener(); // 绑定触底自动加载

  loadCategory(currentCategory, true);
}

function renderCategoryButtons() {
  const nav = document.getElementById("categoryNav");
  if (!nav) return;

  nav.innerHTML = "";
  CATEGORIES.forEach(category => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = category;
    button.className = category === currentCategory ? "active" : "";

    button.addEventListener("click", () => {
      if (currentCategory === category || isLoading) return;
      currentCategory = category;

      document.querySelectorAll("#categoryNav button").forEach(btn => {
        btn.classList.remove("active");
      });
      button.classList.add("active");

      // 切换分类时，重置页码并重新请求
      loadCategory(category, true);
    });

    nav.appendChild(button);
  });
}

/* ================================
   按需加载的核心：分页 Fetch
================================ */
async function loadCategory(category, isNewCategory = false) {
  if (isLoading) return;
  isLoading = true;

  if (isNewCategory) {
    currentPage = 1;
    currentProducts = [];
    hasMore = true;
    showLoadingState();
  } else {
    showLoadingMoreIndicator();
  }

  try {
    // 每次只请求当前页的数据，传 page 和 limit 参数
    const url = `${API_URL}?category=${encodeURIComponent(category)}&page=${currentPage}&limit=${PAGE_SIZE}&t=${Date.now()}`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error("HTTP " + response.status);
    
    const data = await response.json();
    const newProducts = Array.isArray(data.products) ? data.products : [];
    hasMore = data.hasMore;

    if (isNewCategory) {
      currentProducts = newProducts;
    } else {
      currentProducts = currentProducts.concat(newProducts);
    }

    renderProducts();
    currentPage++;
  } catch (error) {
    console.error("Load error:", error);
    if (isNewCategory) showErrorState();
  } finally {
    isLoading = false;
    hideLoadingMoreIndicator();
  }
}

/* ================================
   渲染商品卡片
================================ */
function renderProducts() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  const searchInput = document.getElementById("searchInput");
  const keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";

  let products = currentProducts;

  if (keyword) {
    products = currentProducts.filter(product => {
      const name = String(product.name || "").toLowerCase();
      return name.includes(keyword);
    });
  }

  if (!products.length) {
    grid.innerHTML = "";
    showEmptyState();
    return;
  }

  hideEmptyState();

  grid.innerHTML = products.map(createProductCard).join("");
  updateStatus(`Loaded ${products.length} products`);
}

function createProductCard(product) {
  const name = escapeHtml(product.name || "Product");
  const price = escapeHtml(product.price || "");
  const image = product.imageUrl || "";
  const url = product.sourceUrl || "#";

  return `
    <div class="product-card">
      <a href="${escapeAttribute(url)}" target="_blank" rel="noopener noreferrer" class="product-link">
        <div class="product-image">
          ${
            image
              ? `<img src="${escapeAttribute(image)}" alt="${name}" loading="lazy" onerror="this.onerror=null; this.parentNode.innerHTML='<div class=\"image-placeholder\">No Image</div>';">`
              : `<div class="image-placeholder">No Image</div>`
          }
        </div>
        <div class="product-info">
          <div class="product-name">${name}</div>
          ${price ? `<div class="product-price">${price}</div>` : ""}
        </div>
      </a>
    </div>
  `;
}

/* ================================
   滚动触底监听（滚动瀑布流加载）
================================ */
function setupScrollListener() {
  window.addEventListener("scroll", () => {
    // 距离底部不到 400px 时自动触发下一页加载
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 400) {
      if (!isLoading && hasMore) {
        loadCategory(currentCategory, false);
      }
    }
  });
}

function setupSearch() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  let timer = null;
  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      renderProducts();
    }, 200);
  });
}

function setupRefresh() {
  const button = document.getElementById("refreshBtn");
  if (!button) return;

  button.addEventListener("click", () => {
    loadCategory(currentCategory, true);
  });
}

function showLoadingState() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;
  grid.innerHTML = `<div class="loading">⚡ Loading products...</div>`;
  hideEmptyState();
  updateStatus("Loading...");
}

function showLoadingMoreIndicator() {
  let indicator = document.getElementById("loadingMore");
  if (!indicator) {
    indicator = document.createElement("div");
    indicator.id = "loadingMore";
    indicator.className = "loading-more";
    indicator.innerHTML = "Loading more products...";
    document.body.appendChild(indicator);
  }
  indicator.style.display = "block";
}

function hideLoadingMoreIndicator() {
  const indicator = document.getElementById("loadingMore");
  if (indicator) indicator.style.display = "none";
}

function showErrorState() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;
  grid.innerHTML = `<div class="loading">Failed to load products. Please try again.</div>`;
  updateStatus("Load failed");
}

function showEmptyState() {
  const empty = document.getElementById("emptyMessage");
  if (empty) empty.style.display = "block";
  updateStatus("0 products");
}

function hideEmptyState() {
  const empty = document.getElementById("emptyMessage");
  if (empty) empty.style.display = "none";
}

function updateStatus(text) {
  const status = document.getElementById("status");
  if (status) status.textContent = text;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
