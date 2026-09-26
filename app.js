const API_URL =
  "https://script.google.com/macros/s/AKfycbxn9DVmH7b3isG3CyaNEJ7b6DrGrLimfIc7YVX9YU1NkAftIfcQPNyFNKFP8ko_d7JX/exec";

let products = [];

// 现在网站一共显示 8 个分类
const categories = [
  "SNEAKERS",
  "T-SHIRTS/SHORTS",
  "HOODIE/PANTS",
  "DOWNJACKET",
  "ACCESSORIES",
  "BAGS",
  "HOTSALE",
  "COATS/JACKETS"
];

let currentCategory = "ALL";
let currentAgent = "litbuy";


// =========================
// 加载商品
// =========================
async function loadProducts() {
  try {
    const response = await fetch(API_URL + "?time=" + Date.now());

    if (!response.ok) {
      throw new Error("API request failed");
    }

    const data = await response.json();

    products = [];

    // 按照网站分类读取 API 返回的数据
    categories.forEach(category => {
      const rows = data[category] || [];

      rows.forEach(item => {
        if (!item) return;

        const name = item.name || "";
        const price = item.price || "";
        const sourceUrl = item.sourceUrl || item.url || "";
        const imageUrl = item.imageUrl || item.image || "";

        if (!name && !sourceUrl && !imageUrl) return;

        products.push({
          category: category,
          name: name,
          price: price,
          sourceUrl: sourceUrl,
          imageUrl: imageUrl,
          productId: extractProductId(sourceUrl)
        });
      });
    });

    renderCategoryTiles();
    renderCategories();
    renderProducts();

  } catch (error) {
    console.error("加载商品失败:", error);
  }
}


// =========================
// 提取商品 ID
// =========================
function extractProductId(url) {
  if (!url) return "";

  url = String(url);

  // Litbuy
  let match = url.match(/\/product\/(?:weidian\/)?(\d+)/i);
  if (match) return match[1];

  // Weidian
  match = url.match(/[?&]itemID=(\d+)/i);
  if (match) return match[1];

  // Rizzitgo
  match = url.match(/[?&]goodsId=(\d+)/i);
  if (match) return match[1];

  // 通用 id
  match = url.match(/[?&]id=(\d+)/i);
  if (match) return match[1];

  return "";
}


// =========================
// 根据当前 Agent 获取商品链接
// =========================
function getProductUrl(product) {
  if (!product) return "";

  const sourceUrl = product.sourceUrl || "";
  const productId = product.productId || "";

  if (!productId && sourceUrl) {
    return sourceUrl;
  }

  switch (currentAgent) {
    case "litbuy":
      return sourceUrl;

    case "oopbuy":
      return sourceUrl;

    case "kakobuy":
      return sourceUrl;

    case "hipobuy":
      return sourceUrl;

    case "lovegobuy":
      return sourceUrl;

    case "rizzitgo":
      return sourceUrl;

    case "boonbuy":
      return sourceUrl;

    case "usfans":
      return sourceUrl;

    default:
      return sourceUrl;
  }
}


// =========================
// 分类卡片
// =========================
function renderCategoryTiles() {
  const container = document.getElementById("categoryTiles");

  if (!container) return;

  container.innerHTML = "";

  categories.forEach(category => {
    const tile = document.createElement("div");

    tile.className = "categoryTile";

    tile.dataset.category = category;

    tile.innerHTML = `
      <div class="categoryTileTitle">
        ${category}
      </div>
    `;

    tile.addEventListener("click", () => {
      currentCategory = category;

      renderCategories();
      renderProducts();

      const productSection = document.getElementById("productGrid");

      if (productSection) {
        productSection.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });

    container.appendChild(tile);
  });
}


// =========================
// 分类导航
// =========================
function renderCategories() {
  const container = document.getElementById("categoryNav");

  if (!container) return;

  container.innerHTML = "";

  // ALL
  const allButton = document.createElement("button");

  allButton.type = "button";
  allButton.textContent = "ALL";

  if (currentCategory === "ALL") {
    allButton.classList.add("active");
  }

  allButton.addEventListener("click", () => {
    currentCategory = "ALL";

    renderCategories();
    renderProducts();
  });

  container.appendChild(allButton);


  // 其他分类
  categories.forEach(category => {
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = category;

    if (currentCategory === category) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      currentCategory = category;

      renderCategories();
      renderProducts();
    });

    container.appendChild(button);
  });
}


// =========================
// 商品列表
// =========================
function renderProducts() {
  const container = document.getElementById("productGrid");

  if (!container) return;

  container.innerHTML = "";

  let filteredProducts = [...products];


  // 分类筛选
  if (currentCategory !== "ALL") {
    filteredProducts = filteredProducts.filter(
      product => product.category === currentCategory
    );
  }


  // 搜索
  const searchInput = document.getElementById("searchInput");

  if (searchInput) {
    const keyword = searchInput.value.trim().toLowerCase();

    if (keyword) {
      filteredProducts = filteredProducts.filter(product => {
        return (
          String(product.name || "")
            .toLowerCase()
            .includes(keyword) ||
          String(product.category || "")
            .toLowerCase()
            .includes(keyword)
        );
      });
    }
  }


  // 没有商品
  if (filteredProducts.length === 0) {
    container.innerHTML = `
      <div class="emptyState">
        No products found.
      </div>
    `;

    return;
  }


  // 商品卡片
  filteredProducts.forEach(product => {
    const card = document.createElement("div");

    card.className = "productCard";


    const productUrl = getProductUrl(product);


    card.innerHTML = `
      <a
        href="${productUrl}"
        target="_blank"
        rel="noopener noreferrer"
        class="productLink"
      >
        <div class="productImageWrap">
          ${
            product.imageUrl
              ? `<img
                  src="${product.imageUrl}"
                  alt="${escapeHtml(product.name)}"
                  loading="lazy"
                  onerror="this.style.display='none'"
                >`
              : `<div class="noImage">NO IMAGE</div>`
          }
        </div>

        <div class="productInfo">
          <div class="productName">
            ${escapeHtml(product.name)}
          </div>

          ${
            product.price
              ? `<div class="productPrice">${escapeHtml(product.price)}</div>`
              : ""
          }
        </div>
      </a>
    `;

    container.appendChild(card);
  });
}


// =========================
// HTML 安全处理
// =========================
function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// =========================
// 搜索
// =========================
function setupSearch() {
  const searchInput = document.getElementById("searchInput");

  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    renderProducts();
  });
}


// =========================
// Hero 搜索
// =========================
function setupHeroSearch() {
  const heroSearch = document.getElementById("heroSearch");

  if (!heroSearch) return;

  heroSearch.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      const searchInput = document.getElementById("searchInput");

      if (searchInput) {
        searchInput.value = heroSearch.value;

        currentCategory = "ALL";

        renderCategories();
        renderProducts();

        const productGrid = document.getElementById("productGrid");

        if (productGrid) {
          productGrid.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      }
    }
  });
}


// =========================
// Agent
// =========================
function setupAgentSelector() {
  const agentButtons =
    document.querySelectorAll("[data-agent]");

  agentButtons.forEach(button => {
    button.addEventListener("click", () => {
      currentAgent = button.dataset.agent || "litbuy";

      agentButtons.forEach(btn => {
        btn.classList.remove("active");
      });

      button.classList.add("active");

      renderProducts();
    });
  });
}


// =========================
// 刷新按钮
// =========================
function setupRefreshButton() {
  const refreshBtn = document.getElementById("refreshBtn");

  if (!refreshBtn) return;

  refreshBtn.addEventListener("click", async () => {
    refreshBtn.disabled = true;

    try {
      await loadProducts();
    } finally {
      refreshBtn.disabled = false;
    }
  });
}


// =========================
// 手机菜单
// =========================
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


// =========================
// Logo
// =========================
function setupLogo() {
  const logo = document.getElementById("logo");

  if (!logo) return;

  logo.addEventListener("click", () => {
    currentCategory = "ALL";

    const searchInput =
      document.getElementById("searchInput");

    if (searchInput) {
      searchInput.value = "";
    }

    renderCategories();
    renderProducts();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}


// =========================
// 初始化
// =========================
document.addEventListener("DOMContentLoaded", () => {
  setupSearch();
  setupHeroSearch();
  setupAgentSelector();
  setupRefreshButton();
  setupMobileMenu();
  setupLogo();

  loadProducts();
});
