const API_URL =
  "https://script.google.com/macros/s/AKfycbxn9DVm7Hb3isG3CyaNEJ7b6DrGrLimfIc7YVX9YU1NkAftIfcQPNyFNKFP8ko_d7JX/exec";

/* =========================================================
   BESTR3PS
   Frontend Product Loader
   Only accepts real Litbuy product URLs
   ========================================================= */

let products = [];

const categories = [
  "SNEAKERS",
  "T-SHIRTS/SHORTS",
  "HOODIE/PANTS",
  "DOWNJACKET",
  "ACCESSORIES",
  "BAGS"
];

let currentCategory = "ALL";
let currentAgent = "litbuy";
let searchKeyword = "";


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  setupSearch();
  setupAgentSelector();
  setupRefreshButton();
  setupMobileMenu();

  loadProducts();
});


/* =========================================================
   LOAD PRODUCTS
   ========================================================= */

async function loadProducts() {
  const status = document.getElementById("status");

  if (status) {
    status.textContent = "Loading products...";
  }

  try {
    const response = await fetch(API_URL, {
      method: "GET",
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("API request failed: " + response.status);
    }

    const data = await response.json();

    /*
     API should return:

     {
       "SNEAKERS": [],
       "T-SHIRTS/SHORTS": [],
       "HOODIE/PANTS": [],
       "DOWNJACKET": [],
       "ACCESSORIES": [],
       "BAGS": []
     }
    */

    products = normalizeProducts(data);

    renderCategoryTiles();
    renderCategories();
    renderProducts();

    updateStatus();

  } catch (error) {
    console.error("BESTR3PS API ERROR:", error);

    products = [];

    renderCategoryTiles();
    renderCategories();
    renderProducts();

    if (status) {
      status.textContent = "Unable to load products.";
    }
  }
}


/* =========================================================
   NORMALIZE API DATA
   ========================================================= */

function normalizeProducts(data) {
  const result = [];

  if (!data || typeof data !== "object") {
    return result;
  }

  categories.forEach(category => {
    const list = Array.isArray(data[category])
      ? data[category]
      : [];

    list.forEach(item => {
      if (!item || typeof item !== "object") {
        return;
      }

      const name = cleanText(
        item.name ||
        item.product ||
        item.title ||
        ""
      );

      const price = cleanText(
        item.price ||
        ""
      );

      const sourceUrl = cleanText(
        item.sourceUrl ||
        item.url ||
        item.link ||
        ""
      );

      const imageUrl = cleanText(
        item.imageUrl ||
        item.image ||
        ""
      );

      /*
       IMPORTANT:
       Only real Litbuy product URLs are accepted.
       Anything else is completely discarded.
      */

      if (!isValidProductUrl(sourceUrl)) {
        return;
      }

      /*
       Reject obvious non-product names.
      */

      if (!isValidProductName(name)) {
        return;
      }

      result.push({
        name: name,
        price: price,
        sourceUrl: sourceUrl,
        imageUrl: imageUrl,
        category: category
      });
    });
  });

  /*
   Remove duplicate products.
  */

  const seen = new Set();

  return result.filter(product => {
    const key = product.sourceUrl.trim();

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}


/* =========================================================
   STRICT PRODUCT URL VALIDATION
   ========================================================= */

function isValidProductUrl(url) {
  if (!url) {
    return false;
  }

  if (typeof url !== "string") {
    return false;
  }

  const value = url.trim();

  if (!value) {
    return false;
  }

  /*
   Absolutely reject placeholders.
  */

  if (
    value === "#" ||
    value === "/" ||
    value === "javascript:void(0)" ||
    value === "undefined" ||
    value === "null"
  ) {
    return false;
  }

  /*
   Must be HTTP/HTTPS.
  */

  if (!/^https?:\/\//i.test(value)) {
    return false;
  }

  /*
   Must be Litbuy.
  */

  let parsed;

  try {
    parsed = new URL(value);
  } catch (error) {
    return false;
  }

  const hostname = parsed.hostname.toLowerCase();

  if (
    hostname !== "litbuy.com" &&
    hostname !== "www.litbuy.com"
  ) {
    return false;
  }

  /*
   Must contain /product/
  */

  if (!parsed.pathname.toLowerCase().includes("/product/")) {
    return false;
  }

  /*
   Product URL must contain a numeric product ID.
   Examples:

   /product/2/7835801380
   /product/weidian/7735364129
  */

  const idMatch = parsed.pathname.match(/\/(\d{6,})\/?$/);

  if (!idMatch) {
    return false;
  }

  /*
   Product ID must be at least 6 digits.
  */

  const productId = idMatch[1];

  if (!/^\d{6,}$/.test(productId)) {
    return false;
  }

  return true;
}


/* =========================================================
   PRODUCT NAME VALIDATION
   ========================================================= */

function isValidProductName(name) {
  if (!name) {
    return false;
  }

  const value = name
    .trim()
    .replace(/\s+/g, " ");

  if (!value) {
    return false;
  }

  /*
   Reject spreadsheet structure words.
  */

  const blockedNames = [
    "PRODUCT",
    "PRODUCTS",
    "LINK",
    "IMAGE",
    "PRICE",
    "CELLIMAGE",
    "CELL IMAGE",
    "VIEW PRODUCT",
    "TEE",
    "SHORTS",
    "SNEAKERS",
    "ACCESORIOS",
    "ACCESSORIES",
    "HOODIE",
    "PANTS",
    "DOWNJACKET",
    "ELECTRONICS",
    "SUITS",
    "TOP"
  ];

  const normalized = value
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();

  if (blockedNames.includes(normalized)) {
    return false;
  }

  /*
   Reject spreadsheet/promotional text.
  */

  const blockedPatterns = [
    /JOIN LITBUY DISCORD/i,
    /REGISTER FOR LITBUY/i,
    /INTERACTIVE MENU/i,
    /ALL PRODUCTS ON THIS PAGE/i,
    /BEST CHINESE SUPPLIER/i,
    /PARTNERED WITH THE BEST MANUFACTURERS/i,
    /1:1 QUALITY/i,
    /COUPONS/i,
    /GIVEAWAYS/i,
    /SHIPPING COUPON/i
  ];

  for (const pattern of blockedPatterns) {
    if (pattern.test(value)) {
      return false;
    }
  }

  /*
   Very short structural values are usually not products.
  */

  if (value.length < 2) {
    return false;
  }

  return true;
}


/* =========================================================
   CLEAN TEXT
   ========================================================= */

function cleanText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}


/* =========================================================
   CATEGORY TILES
   ========================================================= */

function renderCategoryTiles() {
  const container = document.getElementById("categoryTiles");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  const allTile = createCategoryTile(
    "ALL",
    "ALL FINDS",
    products.length
  );

  container.appendChild(allTile);

  categories.forEach(category => {
    const count = products.filter(
      product => product.category === category
    ).length;

    const tile = createCategoryTile(
      category,
      formatCategoryName(category),
      count
    );

    container.appendChild(tile);
  });
}


function createCategoryTile(category, label, count) {
  const tile = document.createElement("button");

  tile.className = "category-tile";

  if (currentCategory === category) {
    tile.classList.add("active");
  }

  tile.innerHTML = `
    <span class="category-tile-name">
      ${escapeHtml(label)}
    </span>

    <span class="category-tile-count">
      ${count}
    </span>
  `;

  tile.addEventListener("click", () => {
    currentCategory = category;

    renderCategoryTiles();
    renderCategories();
    renderProducts();

    const findsSection = document.getElementById("finds");

    if (findsSection) {
      findsSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  });

  return tile;
}


/* =========================================================
   CATEGORY NAV
   ========================================================= */

function renderCategories() {
  const container = document.getElementById("categoryNav");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  const allButton = document.createElement("button");

  allButton.className = "category-btn";

  if (currentCategory === "ALL") {
    allButton.classList.add("active");
  }

  allButton.textContent = "ALL";

  allButton.addEventListener("click", () => {
    currentCategory = "ALL";

    renderCategories();
    renderCategoryTiles();
    renderProducts();
  });

  container.appendChild(allButton);

  categories.forEach(category => {
    const button = document.createElement("button");

    button.className = "category-btn";

    if (currentCategory === category) {
      button.classList.add("active");
    }

    button.textContent = formatCategoryName(category);

    button.addEventListener("click", () => {
      currentCategory = category;

      renderCategories();
      renderCategoryTiles();
      renderProducts();
    });

    container.appendChild(button);
  });
}


/* =========================================================
   RENDER PRODUCTS
   ========================================================= */

function renderProducts() {
  const container = document.getElementById("productGrid");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  let filteredProducts = [...products];

  /*
   Category filter
  */

  if (currentCategory !== "ALL") {
    filteredProducts = filteredProducts.filter(
      product =>
        product.category === currentCategory
    );
  }

  /*
   Search filter
  */

  if (searchKeyword) {
    const keyword = searchKeyword.toLowerCase();

    filteredProducts = filteredProducts.filter(product => {
      return (
        product.name.toLowerCase().includes(keyword) ||
        product.category.toLowerCase().includes(keyword)
      );
    });
  }

  /*
   No products
  */

  if (filteredProducts.length === 0) {
    const empty = document.createElement("div");

    empty.className = "empty-state";

    empty.innerHTML = `
      <div class="empty-state-title">
        No products found
      </div>

      <div class="empty-state-text">
        Try another category or search keyword.
      </div>
    `;

    container.appendChild(empty);

    return;
  }

  /*
   Create product cards.

   IMPORTANT:
   createProductCard() can return null.
   Null cards are NOT appended.
  */

  filteredProducts.forEach(product => {
    const card = createProductCard(product);

    if (card) {
      container.appendChild(card);
    }
  });
}


/* =========================================================
   CREATE PRODUCT CARD
   ========================================================= */

function createProductCard(product) {
  if (!product) {
    return null;
  }

  /*
   FINAL FRONTEND SAFETY CHECK

   Even if the API accidentally sends bad data,
   the frontend refuses to display it.
  */

  if (!isValidProductUrl(product.sourceUrl)) {
    return null;
  }

  if (!isValidProductName(product.name)) {
    return null;
  }

  const card = document.createElement("article");

  card.className = "product-card";

  const image = product.imageUrl
    ? `
      <div class="product-image-wrap">
        <img
          class="product-image"
          src="${escapeAttribute(product.imageUrl)}"
          alt="${escapeAttribute(product.name)}"
          loading="lazy"
          onerror="this.parentElement.classList.add('image-error'); this.style.display='none';"
        >
      </div>
    `
    : `
      <div class="product-image-wrap image-placeholder">
        <span>BESTR3PS</span>
      </div>
    `;

  const price = product.price
    ? escapeHtml(product.price)
    : "";

  card.innerHTML = `
    ${image}

    <div class="product-card-body">

      <div class="product-category">
        ${escapeHtml(formatCategoryName(product.category))}
      </div>

      <h3 class="product-title">
        ${escapeHtml(product.name)}
      </h3>

      ${
        price
          ? `<div class="product-price">${price}</div>`
          : ""
      }

      <a
        class="product-button"
        href="${escapeAttribute(product.sourceUrl)}"
        target="_blank"
        rel="noopener noreferrer"
      >
        VIEW PRODUCT
      </a>

    </div>
  `;

  return card;
}


/* =========================================================
   PRODUCT URL
   ========================================================= */

function getProductUrl(product) {
  if (!product) {
    return null;
  }

  if (!isValidProductUrl(product.sourceUrl)) {
    return null;
  }

  return product.sourceUrl;
}


/* =========================================================
   FORMAT CATEGORY NAME
   ========================================================= */

function formatCategoryName(category) {
  const names = {
    "T-SHIRTS/SHORTS": "T-SHIRTS / SHORTS",
    "HOODIE/PANTS": "HOODIE / PANTS",
    "DOWNJACKET": "DOWNJACKET",
    "SNEAKERS": "SNEAKERS",
    "ACCESSORIES": "ACCESSORIES",
    "BAGS": "BAGS"
  };

  return names[category] || category;
}


/* =========================================================
   SEARCH
   ========================================================= */

function setupSearch() {
  const inputs = [
    document.getElementById("searchInput"),
    document.getElementById("heroSearchInput")
  ].filter(Boolean);

  inputs.forEach(input => {
    input.addEventListener("input", event => {
      searchKeyword = event.target.value.trim();

      /*
       Keep all search boxes synchronized.
      */

      inputs.forEach(otherInput => {
        if (otherInput !== input) {
          otherInput.value = event.target.value;
        }
      });

      renderProducts();
      updateStatus();
    });
  });
}


/* =========================================================
   AGENT SELECTOR
   ========================================================= */

function setupAgentSelector() {
  const selectors = [
    document.getElementById("desktopAgentSelect"),
    document.getElementById("agentSelect")
  ].filter(Boolean);

  selectors.forEach(select => {
    select.addEventListener("change", event => {
      currentAgent = event.target.value;

      selectors.forEach(otherSelect => {
        if (otherSelect !== select) {
          otherSelect.value = currentAgent;
        }
      });

      /*
       Currently the products are loaded from Litbuy.
       Agent selection is preserved for the existing UI.
      */

      renderProducts();
    });
  });
}


/* =========================================================
   REFRESH BUTTON
   ========================================================= */

function setupRefreshButton() {
  const button = document.getElementById("refreshBtn");

  if (!button) {
    return;
  }

  button.addEventListener("click", async () => {
    button.disabled = true;

    const originalText = button.textContent;

    button.textContent = "REFRESHING...";

    try {
      await loadProducts();
    } finally {
      button.disabled = false;
      button.textContent = originalText || "REFRESH";
    }
  });
}


/* =========================================================
   STATUS
   ========================================================= */

function updateStatus() {
  const status = document.getElementById("status");

  if (!status) {
    return;
  }

  let visibleProducts = products;

  if (currentCategory !== "ALL") {
    visibleProducts = visibleProducts.filter(
      product =>
        product.category === currentCategory
    );
  }

  if (searchKeyword) {
    const keyword = searchKeyword.toLowerCase();

    visibleProducts = visibleProducts.filter(product => {
      return (
        product.name.toLowerCase().includes(keyword) ||
        product.category.toLowerCase().includes(keyword)
      );
    });
  }

  status.textContent =
    `${visibleProducts.length} products`;
}


/* =========================================================
   MOBILE MENU
   ========================================================= */

function setupMobileMenu() {
  const menuButton =
    document.getElementById("mobileMenuButton");

  const mobileMenu =
    document.getElementById("mobileMenu");

  if (!menuButton || !mobileMenu) {
    return;
  }

  menuButton.addEventListener("click", () => {
    mobileMenu.classList.toggle("open");
  });

  mobileMenu
    .querySelectorAll("a")
    .forEach(link => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("open");
      });
    });
}


/* =========================================================
   HTML ESCAPING
   ========================================================= */

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
