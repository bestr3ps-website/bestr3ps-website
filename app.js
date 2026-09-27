const API_URL =
  "https://script.google.com/macros/s/AKfycbxn9DVmH7b3isG3CyaNEJ7b6DrGrLimfIc7YVX9YU1NkAftIfcQPNyFNKFP8ko_d7JX/exec";

let products = [];

/*
 * =========================================================
 * BESTR3PS
 * 网站只显示第一份 Google Sheet 中的这 6 个类目
 * =========================================================
 */
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


/* =========================================================
   初始化
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  loadProducts(true);
  setupScrollListener();
  setupAgentSelector();
  setupSearch();
  setupMobileMenu();
  setupRefresh();
});


/* =========================================================
   加载商品
   ========================================================= */

async function loadProducts(showLoading = true) {
  const status = document.getElementById("status");

  if (showLoading && status) {
    status.textContent = "Loading products...";
  }

  try {
    const response = await fetch(API_URL + "?time=" + Date.now(), {
      method: "GET",
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("API request failed: " + response.status);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.message || "API returned an error");
    }

    products = [];

    /*
     * 只读取我们需要的 6 个类目。
     * 即使 API 中以后出现其他类目，
     * 前端也不会显示它们。
     */
    categories.forEach(category => {
      const list = Array.isArray(data[category])
        ? data[category]
        : [];

      list.forEach(item => {
        if (!item) return;

        const name = String(item.name || "").trim();
        const sourceUrl = String(item.sourceUrl || "").trim();
        const imageUrl = String(item.imageUrl || "").trim();

        // 没有商品名的空数据直接跳过
        if (!name) return;

        products.push({
          category: category,
          name: name,
          price: item.price || "",
          sourceUrl: sourceUrl,
          imageUrl: imageUrl,
          productId:
            item.productId ||
            extractProductId(sourceUrl)
        });
      });
    });

    renderCategoryTiles();
    renderCategories();
    renderProducts();
    updateStatus();

  } catch (error) {
    console.error("BESTR3PS API Error:", error);

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
   Product ID
   ========================================================= */

function extractProductId(url) {
  if (!url) return "";

  const value = String(url);

  let match;

  // Litbuy:
  // /product/weidian/123456
  // /product/2/123456
  match = value.match(/\/product\/(?:weidian|2)\/(\d+)/i);
  if (match) return match[1];

  // Weidian:
  // itemID=123456
  match = value.match(/[?&]itemID=(\d+)/i);
  if (match) return match[1];

  // Rizzitgo:
  // goodsId=123456
  match = value.match(/[?&]goodsId=(\d+)/i);
  if (match) return match[1];

  // Generic:
  // id=123456
  match = value.match(/[?&]id=(\d+)/i);
  if (match) return match[1];

  return "";
}


/* =========================================================
   商品链接
   ========================================================= */

function getProductUrl(product) {
  /*
   * 目前保持第一份表格里的原始链接。
   *
   * 不在这里强行转换 Litbuy / Oopbuy /
   * Kakobuy / Rizzitgo 等链接。
   *
   * 这样可以避免之前 Agent 切换功能
   * 对已经正常工作的商品链接造成影响。
   */
  return product.sourceUrl || "#";
}


/* =========================================================
   搜索
   ========================================================= */

function setupSearch() {
  const searchInput = document.getElementById("searchInput");

  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    renderProducts();
  });

  searchInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      renderProducts();
    }
  });

  const searchButton = document.getElementById("searchBtn");

  if (searchButton) {
    searchButton.addEventListener("click", () => {
      renderProducts();
    });
  }
}


/* =========================================================
   分类 Tiles
   ========================================================= */

function renderCategoryTiles() {
  const container = document.getElementById("categoryTiles");

  if (!container) return;

  container.innerHTML = "";

  categories.forEach(category => {
    const count = products.filter(
      product => product.category === category
    ).length;

    const tile = document.createElement("button");

    tile.className = "category-tile";
    tile.type = "button";

    tile.innerHTML = `
      <span class="category-tile-name">
        ${escapeHtml(category)}
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

      const finds = document.getElementById("finds");

      if (finds) {
        finds.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });

    container.appendChild(tile);
  });
}


/* =========================================================
   分类导航
   ========================================================= */

function renderCategories() {
  const nav = document.getElementById("categoryNav");

  if (!nav) return;

  nav.innerHTML = "";

  /*
   * ALL
   */
  const allButton = document.createElement("button");

  allButton.type = "button";
  allButton.className =
    currentCategory === "ALL"
      ? "active"
      : "";

  allButton.textContent = "ALL";

  allButton.addEventListener("click", () => {
    currentCategory = "ALL";
    renderCategories();
    renderCategoryTiles();
    renderProducts();
  });

  nav.appendChild(allButton);


  /*
   * 只生成 6 个类目
   */
  categories.forEach(category => {
    const button = document.createElement("button");

    button.type = "button";

    button.className =
      currentCategory === category
        ? "active"
        : "";

    button.textContent = category;

    button.addEventListener("click", () => {
      currentCategory = category;

      renderCategories();
      renderCategoryTiles();
      renderProducts();
    });

    nav.appendChild(button);
  });
}


/* =========================================================
   商品渲染
   ========================================================= */

function renderProducts() {
  const grid = document.getElementById("productGrid");

  if (!grid) return;

  grid.innerHTML = "";

  const searchInput = document.getElementById("searchInput");

  const keyword = searchInput
    ? searchInput.value.trim().toLowerCase()
    : "";

  let filtered = products.filter(product => {

    /*
     * 再次保险：
     * 即使以后 API 返回其他类目，
     * 前端也绝对不显示。
     */
    if (!categories.includes(product.category)) {
      return false;
    }

    /*
     * 当前分类
     */
    if (
      currentCategory !== "ALL" &&
      product.category !== currentCategory
    ) {
      return false;
    }

    /*
     * 搜索
     */
    if (keyword) {
      const text =
        String(product.name || "").toLowerCase();

      if (!text.includes(keyword)) {
        return false;
      }
    }

    return true;
  });


  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        No products found.
      </div>
    `;

    updateStatus();
    return;
  }


  filtered.forEach(product => {
    const card = createProductCard(product);
    grid.appendChild(card);
  });

  updateStatus();
}


/* =========================================================
   商品卡片
   ========================================================= */

function createProductCard(product) {
  const card = document.createElement("article");

  card.className = "product-card";

  const url = getProductUrl(product);

  const image = product.imageUrl
    ? `
      <img
        src="${escapeAttribute(product.imageUrl)}"
        alt="${escapeAttribute(product.name)}"
        loading="lazy"
        onerror="this.style.display='none'"
      >
    `
    : `
      <div class="product-image-placeholder"></div>
    `;

  const price =
    product.price !== undefined &&
    product.price !== null &&
    String(product.price).trim() !== ""
      ? `
        <div class="product-price">
          ${escapeHtml(String(product.price))}
        </div>
      `
      : "";

  card.innerHTML = `
    <a
      class="product-card-link"
      href="${escapeAttribute(url)}"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div class="product-image">
        ${image}
      </div>

      <div class="product-info">
        <div class="product-category">
          ${escapeHtml(product.category)}
        </div>

        <div class="product-name">
          ${escapeHtml(product.name)}
        </div>

        ${price}
      </div>
    </a>
  `;

  return card;
}


/* =========================================================
   Status
   ========================================================= */

function updateStatus() {
  const status = document.getElementById("status");

  if (!status) return;

  let visibleProducts = products.filter(product => {

    if (!categories.includes(product.category)) {
      return false;
    }

    if (
      currentCategory !== "ALL" &&
      product.category !== currentCategory
    ) {
      return false;
    }

    const searchInput =
      document.getElementById("searchInput");

    const keyword = searchInput
      ? searchInput.value.trim().toLowerCase()
      : "";

    if (keyword) {
      return String(product.name || "")
        .toLowerCase()
        .includes(keyword);
    }

    return true;
  });

  status.textContent =
    `${visibleProducts.length} products`;
}


/* =========================================================
   Refresh
   ========================================================= */

function setupRefresh() {
  const refreshBtn =
    document.getElementById("refreshBtn");

  if (!refreshBtn) return;

  refreshBtn.addEventListener("click", async () => {
    refreshBtn.disabled = true;

    const oldText = refreshBtn.textContent;
    refreshBtn.textContent = "Loading...";

    try {
      await loadProducts(true);
    } finally {
      refreshBtn.disabled = false;
      refreshBtn.textContent = oldText;
    }
  });
}


/* =========================================================
   Agent Selector
   ========================================================= */

function setupAgentSelector() {
  const headerSelect =
    document.getElementById("agentSelect");

  const desktopSelect =
    document.getElementById("desktopAgentSelect");


  function syncSelects(value) {
    currentAgent = value;

    if (headerSelect) {
      headerSelect.value = value;
    }

    if (desktopSelect) {
      desktopSelect.value = value;
    }

    /*
     * 当前版本不转换商品链接。
     *
     * 先保证第一份表格商品稳定显示。
     * Agent 链接转换以后单独处理。
     */
    renderProducts();
  }


  if (headerSelect) {
    headerSelect.addEventListener("change", () => {
      syncSelects(headerSelect.value);
    });
  }


  if (desktopSelect) {
    desktopSelect.addEventListener("change", () => {
      syncSelects(desktopSelect.value);
    });
  }
}


/* =========================================================
   Mobile Menu
   ========================================================= */

function setupMobileMenu() {
  const menuButton =
    document.getElementById("mobileMenuBtn");

  const mobileMenu =
    document.getElementById("mobileMenu");

  if (!menuButton || !mobileMenu) return;

  menuButton.addEventListener("click", () => {
    mobileMenu.classList.toggle("open");
  });
}


/* =========================================================
   Scroll
   ========================================================= */

function setupScrollListener() {
  /*
   * 保留接口，避免与现有 HTML / CSS 结构冲突。
   */
}


/* =========================================================
   HTML 安全处理
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
