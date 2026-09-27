```javascript
/* =========================================================
   BESTR3PS - app.js
   Fast loading / Lazy images / Pagination
   ========================================================= */

const API_URL =
  "https://script.google.com/macros/s/AKfycbxtFiRVCd9Y1MZ6l8-YlmmzRa97RZ6xppFLYoQgTEOBddtlx6wE6q9PnUaCdu3D94BR/exec";

const PAGE_SIZE = 30;

const CATEGORIES = [
  { key: "SNEAKERS", label: "SNEAKERS" },
  { key: "T-SHIRTS/SHORTS", label: "T-SHIRTS / SHORTS" },
  { key: "HOODIE/PANTS", label: "HOODIE / PANTS" },
  { key: "DOWNJACKET", label: "DOWNJACKET" },
  { key: "ACCESSORIES", label: "ACCESSORIES" },
  { key: "BAGS", label: "BAGS" },
  { key: "HOTSALE", label: "HOT SALE" },
  { key: "COATS/JACKETS", label: "COATS / JACKETS" }
];

let allProducts = [];
let filteredProducts = [];
let currentCategory = "SNEAKERS";
let currentPage = 1;
let loading = false;
let searchKeyword = "";

const productCache = new Map();

document.addEventListener("DOMContentLoaded", init);

function init() {
  setupEvents();
  renderCategoryButtons();

  // 先显示页面，不等待 API
  showLoadingState();

  // 只加载默认分类
  loadCategory(currentCategory);
}


/* =========================================================
   EVENTS
   ========================================================= */

function setupEvents() {
  const searchInput = document.getElementById("searchInput");

  if (searchInput) {
    searchInput.addEventListener(
      "input",
      debounce(function () {
        searchKeyword = this.value.trim().toLowerCase();
        currentPage = 1;
        applyFilterAndRender();
      }, 180)
    );
  }

  const searchButton = document.getElementById("searchButton");

  if (searchButton) {
    searchButton.addEventListener("click", function () {
      const input = document.getElementById("searchInput");

      if (input) {
        searchKeyword = input.value.trim().toLowerCase();
        currentPage = 1;
        applyFilterAndRender();
      }
    });
  }
}


/* =========================================================
   CATEGORY BUTTONS
   ========================================================= */

function renderCategoryButtons() {
  const container =
    document.getElementById("categoryButtons") ||
    document.querySelector(".category-buttons") ||
    document.querySelector(".categories");

  if (!container) return;

  container.innerHTML = "";

  CATEGORIES.forEach(category => {
    const button = document.createElement("button");

    button.className = "category-btn";
    button.dataset.category = category.key;
    button.textContent = category.label;

    if (category.key === currentCategory) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      switchCategory(category.key);
    });

    container.appendChild(button);
  });
}


async function switchCategory(category) {
  if (loading) return;

  currentCategory = category;
  currentPage = 1;
  searchKeyword = "";

  const searchInput = document.getElementById("searchInput");

  if (searchInput) {
    searchInput.value = "";
  }

  document.querySelectorAll(".category-btn").forEach(btn => {
    btn.classList.toggle(
      "active",
      btn.dataset.category === category
    );
  });

  // 如果已经缓存，直接显示
  if (productCache.has(category)) {
    allProducts = productCache.get(category);
    applyFilterAndRender();
    return;
  }

  await loadCategory(category);
}


/* =========================================================
   API
   ========================================================= */

async function loadCategory(category) {
  if (loading) return;

  loading = true;

  showLoadingState();

  try {
    const url =
      API_URL +
      "?category=" +
      encodeURIComponent(category) +
      "&t=" +
      Date.now();

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("API HTTP " + response.status);
    }

    const data = await response.json();

    let products = [];

    /*
      支持以下 API 格式：

      {
        "SNEAKERS": [...]
      }

      或：

      {
        "products": [...]
      }

      或：

      [...]
    */

    if (Array.isArray(data)) {
      products = data;
    } else if (Array.isArray(data[category])) {
      products = data[category];
    } else if (Array.isArray(data.products)) {
      products = data.products;
    }

    products = normalizeProducts(products);

    productCache.set(category, products);

    allProducts = products;

    applyFilterAndRender();

  } catch (error) {
    console.error("BESTR3PS API ERROR:", error);

    showErrorState(
      "Products could not be loaded. Please refresh the page."
    );

  } finally {
    loading = false;
  }
}


/* =========================================================
   NORMALIZE PRODUCTS
   ========================================================= */

function normalizeProducts(products) {
  const seen = new Set();

  return products
    .map(product => {
      if (!product) return null;

      const name =
        product.name ||
        product.title ||
        product.product ||
        "";

      const price =
        product.price ||
        product.usd ||
        "";

      const sourceUrl =
        product.sourceUrl ||
        product.url ||
        product.link ||
        "";

      const imageUrl =
        product.imageUrl ||
        product.image ||
        "";

      const productId =
        product.productId ||
        extractProductId(sourceUrl);

      return {
        name: String(name).trim(),
        price: String(price).trim(),
        sourceUrl: String(sourceUrl).trim(),
        imageUrl: String(imageUrl).trim(),
        productId: String(productId || "").trim()
      };
    })
    .filter(product => {
      if (!product) return false;

      if (!product.name && !product.sourceUrl) {
        return false;
      }

      const uniqueKey =
        product.productId ||
        product.sourceUrl ||
        product.name;

      if (seen.has(uniqueKey)) {
        return false;
      }

      seen.add(uniqueKey);

      return true;
    });
}


/* =========================================================
   SEARCH
   ========================================================= */

function applyFilterAndRender() {
  const keyword = searchKeyword.toLowerCase();

  if (!keyword) {
    filteredProducts = allProducts;
  } else {
    filteredProducts = allProducts.filter(product => {
      const text = [
        product.name,
        product.productId,
        product.sourceUrl
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(keyword);
    });
  }

  currentPage = 1;

  renderProducts();
}


/* =========================================================
   RENDER
   ========================================================= */

function renderProducts() {
  const container =
    document.getElementById("productGrid") ||
    document.querySelector(".product-grid") ||
    document.querySelector(".products");

  if (!container) return;

  container.innerHTML = "";

  if (!filteredProducts.length) {
    container.innerHTML = `
      <div class="empty-state">
        No products found.
      </div>
    `;

    updateProductCount(0);
    return;
  }

  const start = 0;
  const end = PAGE_SIZE * currentPage;

  const visibleProducts =
    filteredProducts.slice(start, end);

  const fragment = document.createDocumentFragment();

  visibleProducts.forEach(product => {
    fragment.appendChild(createProductCard(product));
  });

  container.appendChild(fragment);

  updateProductCount(filteredProducts.length);

  renderLoadMore(container, end < filteredProducts.length);
}


/* =========================================================
   PRODUCT CARD
   ========================================================= */

function createProductCard(product) {
  const card = document.createElement("article");

  card.className = "product-card";

  const imageWrapper = document.createElement("div");
  imageWrapper.className = "product-image-wrapper";

  const image = document.createElement("img");

  image.className = "product-image";
  image.loading = "lazy";
  image.decoding = "async";
  image.alt = product.name || "Product";

  /*
    不立即加载全部图片。
    data-src 会在图片进入可视区域后再加载。
  */

  if (product.imageUrl) {
    image.dataset.src = product.imageUrl;
  }

  imageWrapper.appendChild(image);

  const content = document.createElement("div");
  content.className = "product-content";

  const title = document.createElement("div");
  title.className = "product-name";
  title.textContent =
    product.name || "Unnamed Product";

  content.appendChild(title);

  if (product.price) {
    const price = document.createElement("div");

    price.className = "product-price";

    price.textContent = formatPrice(product.price);

    content.appendChild(price);
  }

  const button = document.createElement("a");

  button.className = "product-button";
  button.target = "_blank";
  button.rel = "noopener noreferrer";

  button.textContent = "VIEW PRODUCT";

  /*
    sourceUrl 已经是最终商品链接。
    如果后端有 productId，也保留。
  */

  button.href = product.sourceUrl || "#";

  if (!product.sourceUrl) {
    button.removeAttribute("href");
    button.classList.add("disabled");
  }

  card.appendChild(imageWrapper);
  card.appendChild(content);
  card.appendChild(button);

  return card;
}


/* =========================================================
   IMAGE LAZY LOADING
   ========================================================= */

let imageObserver = null;

function setupImageObserver() {
  if (imageObserver) {
    imageObserver.disconnect();
  }

  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll("img[data-src]").forEach(loadImage);
    return;
  }

  imageObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadImage(entry.target);
          imageObserver.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "500px 0px"
    }
  );

  document.querySelectorAll("img[data-src]").forEach(img => {
    imageObserver.observe(img);
  });
}


function loadImage(img) {
  const src = img.dataset.src;

  if (!src) return;

  img.src = src;

  img.onload = function () {
    img.classList.add("loaded");
  };

  img.onerror = function () {
    img.classList.add("image-error");
  };

  delete img.dataset.src;
}


/*
  MutationObserver：
  每次商品 DOM 更新以后自动启动懒加载。
*/

const productMutationObserver =
  new MutationObserver(() => {
    setupImageObserver();
  });


function observeProductGrid() {
  const container =
    document.getElementById("productGrid") ||
    document.querySelector(".product-grid");

  if (!container) return;

  productMutationObserver.observe(container, {
    childList: true
  });

  setupImageObserver();
}


/* =========================================================
   LOAD MORE
   ========================================================= */

function renderLoadMore(container, hasMore) {
  const oldButton =
    document.getElementById("loadMoreButton");

  if (oldButton) {
    oldButton.remove();
  }

  if (!hasMore) return;

  const wrapper = document.createElement("div");

  wrapper.className = "load-more-wrapper";

  const button = document.createElement("button");

  button.id = "loadMoreButton";
  button.className = "load-more-button";
  button.textContent = "LOAD MORE";

  button.addEventListener("click", () => {
    currentPage++;

    const oldScroll =
      window.scrollY;

    renderProducts();

    window.requestAnimationFrame(() => {
      window.scrollTo({
        top: oldScroll,
        behavior: "instant"
      });
    });
  });

  wrapper.appendChild(button);

  container.parentNode.appendChild(wrapper);
}


/* =========================================================
   UI STATES
   ========================================================= */

function showLoadingState() {
  const container =
    document.getElementById("productGrid") ||
    document.querySelector(".product-grid") ||
    document.querySelector(".products");

  if (!container) return;

  container.innerHTML = `
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <div>Loading products...</div>
    </div>
  `;
}


function showErrorState(message) {
  const container =
    document.getElementById("productGrid") ||
    document.querySelector(".product-grid") ||
    document.querySelector(".products");

  if (!container) return;

  container.innerHTML = `
    <div class="error-state">
      <div>${escapeHtml(message)}</div>
      <button class="retry-button" onclick="loadCategory(currentCategory)">
        RETRY
      </button>
    </div>
  `;
}


function updateProductCount(count) {
  const elements = document.querySelectorAll(
    "[data-product-count]"
  );

  elements.forEach(element => {
    element.textContent =
      count.toLocaleString();
  });
}


/* =========================================================
   HELPERS
   ========================================================= */

function extractProductId(url) {
  if (!url) return "";

  const patterns = [
    /itemID[=/](\d+)/i,
    /goodsId[=/](\d+)/i,
    /product[=/](\d+)/i,
    /\/(\d{7,})/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);

    if (match) {
      return match[1];
    }
  }

  return "";
}


function formatPrice(price) {
  if (!price) return "";

  const value = String(price).trim();

  if (
    value.includes("$") ||
    value.includes("USD") ||
    value.includes("€") ||
    value.includes("EUR")
  ) {
    return value;
  }

  return "$" + value;
}


function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function debounce(func, wait) {
  let timeout;

  return function (...args) {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}


/* =========================================================
   START OBSERVING PRODUCT GRID
   ========================================================= */

window.addEventListener("load", () => {
  observeProductGrid();
});


/* =========================================================
   GLOBAL
   ========================================================= */

window.BESTR3PS = {
  loadCategory,
  switchCategory,
  renderProducts
};
```
