const API_URL =
  "https://script.google.com/macros/s/AKfycbxtFiRVCd9Y1MZ6l8-YlmmzRa97RZ6xppFLYoQgTEOBddtlx6wE6q9PnUaCdu3D94BR/exec";

const PAGE_SIZE = 30;

const CATEGORIES = [
  "SNEAKERS",
  "T-SHIRTS/SHORTS",
  "HOODIE/PANTS",
  "DOWNJACKET",
  "ACCESSORIES",
  "BAGS",
  "HOTSALE",
  "COATS/JACKETS"
];

let currentCategory = CATEGORIES[0];
let currentProducts = [];
let visibleCount = PAGE_SIZE;
const categoryCache = {};

function init() {
  renderCategoryButtons();
  showLoadingState();
  loadCategory(currentCategory);
}

function renderCategoryButtons() {
  const nav = document.getElementById("categoryNav");
  if (!nav) return;

  nav.innerHTML = "";

  CATEGORIES.forEach(category => {
    const btn = document.createElement("button");
    btn.textContent = category;
    btn.className = category === currentCategory ? "active" : "";

    btn.addEventListener("click", () => {
      currentCategory = category;
      visibleCount = PAGE_SIZE;

      document
        .querySelectorAll("#categoryNav button")
        .forEach(b => b.classList.remove("active"));

      btn.classList.add("active");

      loadCategory(category);
    });

    nav.appendChild(btn);
  });
}

async function loadCategory(category) {
  currentProducts = [];
  visibleCount = PAGE_SIZE;

  showLoadingState();

  if (categoryCache[category]) {
    currentProducts = categoryCache[category];
    renderProducts();
    return;
  }

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
      throw new Error("HTTP " + response.status);
    }

    const data = await response.json();

    let products = [];

    if (Array.isArray(data)) {
      products = data;
    } else if (data && Array.isArray(data[category])) {
      products = data[category];
    } else if (data && Array.isArray(data.products)) {
      products = data.products;
    }

    currentProducts = products;
    categoryCache[category] = products;

    renderProducts();
  } catch (error) {
    console.error("Load products error:", error);
    showErrorState();
  }
}

function renderProducts() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  const searchInput = document.getElementById("searchInput");
  const keyword = searchInput
    ? searchInput.value.trim().toLowerCase()
    : "";

  let products = currentProducts;

  if (keyword) {
    products = currentProducts.filter(product => {
      const name = String(
        product.name ||
        product.title ||
        product.product ||
        ""
      ).toLowerCase();

      return name.includes(keyword);
    });
  }

  if (!products.length) {
    grid.innerHTML = "";
    showEmptyState();
    return;
  }

  hideEmptyState();

  const visibleProducts = products.slice(0, visibleCount);

  grid.innerHTML = visibleProducts
    .map(product => {
      const name = escapeHtml(
        product.name ||
        product.title ||
        product.product ||
        "Product"
      );

      const price = escapeHtml(
        product.price ||
        product.usd ||
        ""
      );

      const url =
        product.sourceUrl ||
        product.url ||
        product.link ||
        "#";

      const image =
        product.imageUrl ||
        product.image ||
        "";

      return `
        <div class="product-card">
          <a
            href="${escapeAttribute(url)}"
            target="_blank"
            rel="noopener noreferrer"
            class="product-link"
          >
            <div class="product-image">
              ${
                image
                  ? `
                    <img
                      class="lazy-image"
                      data-src="${escapeAttribute(image)}"
                      alt="${name}"
                      loading="lazy"
                    >
                  `
                  : `
                    <div class="image-placeholder">
                      No Image
                    </div>
                  `
              }
            </div>

            <div class="product-info">
              <div class="product-name">
                ${name}
              </div>

              ${
                price
                  ? `
                    <div class="product-price">
                      ${price}
                    </div>
                  `
                  : ""
              }
            </div>
          </a>
        </div>
      `;
    })
    .join("");

  if (products.length > visibleCount) {
    const loadMore = document.createElement("button");
    loadMore.className = "load-more";
    loadMore.textContent = `LOAD MORE (${Math.min(
      PAGE_SIZE,
      products.length - visibleCount
    )})`;

    loadMore.addEventListener("click", () => {
      visibleCount += PAGE_SIZE;
      renderProducts();
    });

    grid.appendChild(loadMore);
  }

  setupImageObserver();

  updateStatus(`${products.length} products`);
}

function setupImageObserver() {
  const images = document.querySelectorAll(".lazy-image");

  if (!("IntersectionObserver" in window)) {
    images.forEach(loadImage);
    return;
  }

  if (window._imageObserver) {
    window._imageObserver.disconnect();
  }

  window._imageObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadImage(entry.target);
          window._imageObserver.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "300px"
    }
  );

  images.forEach(image => {
    window._imageObserver.observe(image);
  });
}

function loadImage(img) {
  const src = img.dataset.src;
  if (!src) return;

  img.src = src;
  img.removeAttribute("data-src");

  img.onerror = () => {
    img.style.display = "none";
  };
}

function setupSearch() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  let timer = null;

  input.addEventListener("input", () => {
    clearTimeout(timer);

    timer = setTimeout(() => {
      visibleCount = PAGE_SIZE;
      renderProducts();
    }, 200);
  });
}

function showLoadingState() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  grid.innerHTML = `
    <div class="loading">
      Loading products...
    </div>
  `;

  hideEmptyState();
  updateStatus("Loading...");
}

function showErrorState() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  grid.innerHTML = `
    <div class="loading">
      Failed to load products.
      <br>
      Please try again.
    </div>
  `;

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

document.addEventListener("DOMContentLoaded", () => {
  setupSearch();
  init();
});
