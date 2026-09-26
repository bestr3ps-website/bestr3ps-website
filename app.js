const API_URL =
  "https://script.google.com/macros/s/AKfycbxn9DVmH7b3isG3CyaNEJ7b6DrGrLimfIcY7VX9YU1NkAftIfcQPNyFNKFP8ko_d7JX/exec";

let products = [];

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


// =========================================================
// HTML 安全处理
// =========================================================

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}


// =========================================================
// DOM
// =========================================================

function getElement(id) {
  return document.getElementById(id);
}


// =========================================================
// API 请求
// =========================================================

async function fetchProductsFromAPI() {

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 30000);

  try {

    const url =
      API_URL +
      (API_URL.includes("?") ? "&" : "?") +
      "_=" +
      Date.now();

    console.log("BESTR3PS API request:", url);

    const response = await fetch(
      url,
      {
        method: "GET",
        cache: "no-store",
        redirect: "follow",
        signal: controller.signal
      }
    );

    console.log(
      "BESTR3PS API status:",
      response.status,
      response.statusText
    );

    if (!response.ok) {

      throw new Error(
        "API returned HTTP " +
        response.status +
        " " +
        response.statusText
      );

    }

    const text =
      await response.text();

    console.log(
      "BESTR3PS API response length:",
      text.length
    );

    if (!text.trim()) {

      throw new Error(
        "API returned an empty response."
      );

    }

    let data;

    try {

      data =
        JSON.parse(text);

    } catch (jsonError) {

      console.error(
        "BESTR3PS JSON parse error:",
        jsonError
      );

      console.error(
        "BESTR3PS raw API response:",
        text.substring(0, 1000)
      );

      throw new Error(
        "API response is not valid JSON."
      );

    }

    if (!data || typeof data !== "object") {

      throw new Error(
        "API returned invalid data."
      );

    }

    if (data.error) {

      throw new Error(
        data.message ||
        data.error ||
        "API returned an error."
      );

    }

    return data;

  } finally {

    clearTimeout(timeout);

  }

}


// =========================================================
// 提取商品 ID
// =========================================================

function extractProductId(url) {

  if (!url) return "";

  let value =
    String(url);

  for (let i = 0; i < 3; i++) {

    try {

      const decoded =
        decodeURIComponent(value);

      if (decoded === value) {
        break;
      }

      value = decoded;

    } catch (error) {

      break;

    }

  }

  let match =
    value.match(
      /\/product\/(?:weidian\/|2\/)?(\d+)/i
    );

  if (match) {
    return match[1];
  }

  match =
    value.match(
      /[?&]itemID=(\d+)/i
    );

  if (match) {
    return match[1];
  }

  match =
    value.match(
      /[?&]goodsId=(\d+)/i
    );

  if (match) {
    return match[1];
  }

  match =
    value.match(
      /[?&]id=(\d+)/i
    );

  if (match) {
    return match[1];
  }

  return "";
}


// =========================================================
// 加载商品
// =========================================================

async function loadProducts() {

  const status =
    getElement("status");

  const container =
    getElement("productGrid");

  if (status) {

    status.textContent =
      "Loading products...";

  }

  if (container) {

    container.innerHTML = `
      <div class="loadingState">
        <div class="loadingSpinner"></div>
        <div>Loading products...</div>
      </div>
    `;

  }

  try {

    const data =
      await fetchProductsFromAPI();

    products = [];

    categories.forEach(category => {

      const rows =
        Array.isArray(data[category])
          ? data[category]
          : [];

      rows.forEach(item => {

        if (!item) return;

        const name =
          String(item.name ?? "").trim();

        const price =
          item.price ?? "";

        const sourceUrl =
          String(
            item.sourceUrl ||
            item.url ||
            ""
          ).trim();

        const imageUrl =
          String(
            item.imageUrl ||
            item.image ||
            ""
          ).trim();

        const productId =
          item.productId ||
          extractProductId(sourceUrl);

        /*
         * 没有 sourceUrl 的数据不是商品。
         * 这会自动过滤掉：
         *
         * TEE / SHORTS
         * SNEAKERS / ACCESORIOS
         * HOODIE / PANTS
         * DOWNJACKET / ELECTRONICS
         */

        if (!sourceUrl) {
          return;
        }

        if (!name && !imageUrl) {
          return;
        }

        products.push({
          category,
          name,
          price,
          sourceUrl,
          imageUrl,
          productId
        });

      });

    });

    console.log(
      "BESTR3PS products loaded:",
      products.length
    );

    console.log(
      "BESTR3PS first product:",
      products[0]
    );

    console.log(
      "BESTR3PS category counts:",
      categories.reduce(
        (result, category) => {
          result[category] =
            products.filter(
              product =>
                product.category === category
            ).length;
          return result;
        },
        {}
      )
    );

    renderCategoryTiles();
    renderCategories();
    renderProducts();
    updateStatus();

  } catch (error) {

    console.error(
      "BESTR3PS loadProducts error:",
      error
    );

    products = [];

    if (container) {

      container.innerHTML = `

        <div class="emptyState errorState">

          <div class="emptyIcon">
            !
          </div>

          <h3>
            Unable to load products
          </h3>

          <p>
            ${escapeHtml(
              error.message ||
              "Unable to connect to the product API."
            )}
          </p>

          <button
            type="button"
            class="retryButton"
            id="retryProductsButton"
          >
            TRY AGAIN
          </button>

        </div>

      `;

      const retryButton =
        getElement(
          "retryProductsButton"
        );

      if (retryButton) {

        retryButton.addEventListener(
          "click",
          () => {
            loadProducts();
          }
        );

      }

    }

    if (status) {

      status.textContent =
        "Unable to load products";

    }

  }

}


// =========================================================
// 更新商品数量
// =========================================================

function getFilteredProducts() {

  let result =
    [...products];

  if (currentCategory !== "ALL") {

    result =
      result.filter(
        product =>
          product.category ===
          currentCategory
      );

  }

  const searchInput =
    getElement("searchInput");

  if (searchInput) {

    const keyword =
      searchInput.value
        .trim()
        .toLowerCase();

    if (keyword) {

      result =
        result.filter(product => {

          return (

            String(
              product.name || ""
            )
              .toLowerCase()
              .includes(keyword)

            ||

            String(
              product.category || ""
            )
              .toLowerCase()
              .includes(keyword)

          );

        });

    }

  }

  return result;
}


function updateStatus() {

  const status =
    getElement("status");

  if (!status) return;

  const visibleProducts =
    getFilteredProducts();

  status.textContent =
    visibleProducts.length +
    (
      visibleProducts.length === 1
        ? " product"
        : " products"
    );

}


// =========================================================
// 商品 URL
// =========================================================

function getProductUrl(product) {

  if (!product) {
    return "#";
  }

  return (
    product.sourceUrl ||
    "#"
  );

}


// =========================================================
// 分类卡片
// =========================================================

function renderCategoryTiles() {

  const container =
    getElement("categoryTiles");

  if (!container) return;

  container.innerHTML = "";

  categories.forEach(
    (category, index) => {

      const tile =
        document.createElement("button");

      tile.type =
        "button";

      tile.className =
        "categoryTile";

      tile.dataset.category =
        category;

      tile.innerHTML = `

        <span class="categoryTileNumber">
          ${String(index + 1).padStart(2, "0")}
        </span>

        <span class="categoryTileName">
          ${escapeHtml(category)}
        </span>

        <span class="categoryTileArrow">
          →
        </span>

      `;

      tile.addEventListener(
        "click",
        () => {

          currentCategory =
            category;

          renderCategories();
          renderProducts();

          const productGrid =
            getElement("productGrid");

          if (productGrid) {

            productGrid.scrollIntoView({
              behavior: "smooth",
              block: "start"
            });

          }

        }
      );

      container.appendChild(tile);

    }
  );

}


// =========================================================
// 分类导航
// =========================================================

function renderCategories() {

  const container =
    getElement("categoryNav");

  if (!container) return;

  container.innerHTML = "";

  const allButton =
    document.createElement("button");

  allButton.type =
    "button";

  allButton.className =
    "categoryButton";

  allButton.textContent =
    "ALL";

  if (currentCategory === "ALL") {

    allButton.classList.add("active");

  }

  allButton.addEventListener(
    "click",
    () => {

      currentCategory =
        "ALL";

      renderCategories();
      renderProducts();

    }
  );

  container.appendChild(
    allButton
  );

  categories.forEach(category => {

    const button =
      document.createElement("button");

    button.type =
      "button";

    button.className =
      "categoryButton";

    button.textContent =
      category;

    if (
      currentCategory ===
      category
    ) {

      button.classList.add("active");

    }

    button.addEventListener(
      "click",
      () => {

        currentCategory =
          category;

        renderCategories();
        renderProducts();

      }
    );

    container.appendChild(button);

  });

}


// =========================================================
// 商品图片
// =========================================================

function createProductImage(product) {

  const imageBox =
    document.createElement("div");

  imageBox.className =
    "productImage";

  if (!product.imageUrl) {

    imageBox.innerHTML = `
      <div class="imageFallback">
        NO IMAGE
      </div>
    `;

    return imageBox;

  }

  const image =
    document.createElement("img");

  image.src =
    product.imageUrl;

  image.alt =
    product.name || "Product";

  image.loading =
    "lazy";

  image.decoding =
    "async";

  image.addEventListener(
    "error",
    () => {

      image.remove();

      if (
        !imageBox.querySelector(
          ".imageFallback"
        )
      ) {

        const fallback =
          document.createElement("div");

        fallback.className =
          "imageFallback";

        fallback.textContent =
          "NO IMAGE";

        imageBox.appendChild(
          fallback
        );

      }

    }
  );

  imageBox.appendChild(
    image
  );

  return imageBox;

}


// =========================================================
// 商品列表
// =========================================================

function renderProducts() {

  const container =
    getElement("productGrid");

  if (!container) return;

  container.innerHTML = "";

  const filteredProducts =
    getFilteredProducts();

  if (
    filteredProducts.length === 0
  ) {

    container.innerHTML = `

      <div class="emptyState">

        <div class="emptyIcon">
          ⌕
        </div>

        <h3>
          No products found
        </h3>

        <p>
          Try another search or category.
        </p>

      </div>

    `;

    updateStatus();

    return;

  }

  const fragment =
    document.createDocumentFragment();

  filteredProducts.forEach(product => {

    const card =
      document.createElement("article");

    card.className =
      "productCard";

    const link =
      document.createElement("a");

    link.className =
      "productLink";

    link.href =
      getProductUrl(product);

    link.target =
      "_blank";

    link.rel =
      "noopener noreferrer";

    const imageBox =
      createProductImage(product);

    const info =
      document.createElement("div");

    info.className =
      "productInfo";

    const category =
      document.createElement("div");

    category.className =
      "productCategory";

    category.textContent =
      product.category;

    const name =
      document.createElement("div");

    name.className =
      "productName";

    name.textContent =
      product.name;

    const price =
      document.createElement("div");

    price.className =
      "productPrice";

    if (
      product.price !== "" &&
      product.price !== null &&
      product.price !== undefined
    ) {

      price.textContent =
        String(product.price);

    } else {

      price.textContent =
        "—";

      price.classList.add(
        "emptyPrice"
      );

    }

    const viewButton =
      document.createElement("div");

    viewButton.className =
      "viewButton";

    viewButton.textContent =
      "VIEW PRODUCT →";

    info.appendChild(category);
    info.appendChild(name);
    info.appendChild(price);
    info.appendChild(viewButton);

    link.appendChild(imageBox);
    link.appendChild(info);

    card.appendChild(link);

    fragment.appendChild(card);

  });

  container.appendChild(fragment);

  updateStatus();

}


// =========================================================
// 搜索
// =========================================================

function setupSearch() {

  const searchInput =
    getElement("searchInput");

  if (!searchInput) return;

  searchInput.addEventListener(
    "input",
    () => {

      renderProducts();

    }
  );

}


// =========================================================
// Hero 搜索
// =========================================================

function setupHeroSearch() {

  const heroInput =
    getElement("heroSearchInput");

  const heroButton =
    getElement("heroSearchButton");

  const searchInput =
    getElement("searchInput");

  if (
    !heroInput ||
    !searchInput
  ) {
    return;
  }

  function executeSearch() {

    searchInput.value =
      heroInput.value;

    currentCategory =
      "ALL";

    renderCategories();
    renderProducts();

    const productGrid =
      getElement("productGrid");

    if (productGrid) {

      productGrid.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    }

  }

  heroInput.addEventListener(
    "keydown",
    event => {

      if (
        event.key ===
        "Enter"
      ) {

        executeSearch();

      }

    }
  );

  if (heroButton) {

    heroButton.addEventListener(
      "click",
      executeSearch
    );

  }

}


// =========================================================
// Agent
// =========================================================

function setupAgentSelector() {

  const headerSelect =
    getElement("agentSelect");

  const desktopSelect =
    getElement("desktopAgentSelect");

  function changeAgent(value) {

    currentAgent =
      value || "litbuy";

    if (headerSelect) {
      headerSelect.value =
        currentAgent;
    }

    if (desktopSelect) {
      desktopSelect.value =
        currentAgent;
    }

    /*
     * 当前 API 返回的 sourceUrl
     * 已经是商品实际链接。
     *
     * 因此这里暂时不修改 sourceUrl。
     * Agent selector 保留用于后续扩展。
     */

    renderProducts();

  }

  if (headerSelect) {

    headerSelect.addEventListener(
      "change",
      event => {

        changeAgent(
          event.target.value
        );

      }
    );

  }

  if (desktopSelect) {

    desktopSelect.addEventListener(
      "change",
      event => {

        changeAgent(
          event.target.value
        );

      }
    );

  }

}


// =========================================================
// 刷新
// =========================================================

function setupRefreshButton() {

  const refreshBtn =
    getElement("refreshBtn");

  if (!refreshBtn) return;

  refreshBtn.addEventListener(
    "click",
    async () => {

      refreshBtn.disabled =
        true;

      refreshBtn.classList.add(
        "loading"
      );

      try {

        await loadProducts();

      } finally {

        refreshBtn.disabled =
          false;

        refreshBtn.classList.remove(
          "loading"
        );

      }

    }
  );

}


// =========================================================
// 手机菜单
// =========================================================

function setupMobileMenu() {

  const menuButton =
    getElement(
      "mobileMenuButton"
    );

  const mobileMenu =
    getElement("mobileNav");

  if (
    !menuButton ||
    !mobileMenu
  ) {

    return;

  }

  menuButton.addEventListener(
    "click",
    () => {

      const isOpen =
        mobileMenu.classList.toggle(
          "open"
        );

      menuButton.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

    }
  );

  mobileMenu
    .querySelectorAll("a")
    .forEach(link => {

      link.addEventListener(
        "click",
        () => {

          mobileMenu.classList.remove(
            "open"
          );

          menuButton.setAttribute(
            "aria-expanded",
            "false"
          );

        }
      );

    });

}


// =========================================================
// Logo
// =========================================================

function setupLogo() {

  const logo =
    getElement("homeLogo");

  if (!logo) return;

  logo.addEventListener(
    "click",
    () => {

      currentCategory =
        "ALL";

      const searchInput =
        getElement("searchInput");

      const heroInput =
        getElement("heroSearchInput");

      if (searchInput) {
        searchInput.value = "";
      }

      if (heroInput) {
        heroInput.value = "";
      }

      renderCategories();
      renderProducts();

    }
  );

}


// =========================================================
// 初始化
// =========================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    console.log(
      "BESTR3PS app.js loaded."
    );

    setupSearch();
    setupHeroSearch();
    setupAgentSelector();
    setupRefreshButton();
    setupMobileMenu();
    setupLogo();

    renderCategoryTiles();
    renderCategories();

    loadProducts();

  }
);
