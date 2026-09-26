// =====================================================
// BESTR3PS FRONTEND
// 双 Spreadsheet 分页版
// =====================================================


const API_URL =
  "https://script.google.com/macros/s/AKfycbxtFiRVCd9Y1MZ6l8-YlmmzRa97RZ6xppFLYoQgTEOBddtlx6wE6q9PnUaCdu3D94BR/exec";


const PAGE_SIZE = 24;


// =====================================================
// 数据
// =====================================================

let products = [];

let currentCategory = "ALL";

let currentAgent = "litbuy";

let currentPage = 1;

let totalPages = 1;

let isLoading = false;


// =====================================================
// 分类
// =====================================================

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


// =====================================================
// HTML 安全
// =====================================================

function escapeHtml(value) {

  return String(value ?? "")
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


function escapeAttribute(value) {

  return escapeHtml(value);

}


// =====================================================
// API 请求
// =====================================================

async function fetchCategory(
  category,
  page = 1
) {

  const url =
    API_URL +
    "?category=" +
    encodeURIComponent(category) +
    "&page=" +
    page +
    "&limit=" +
    PAGE_SIZE +
    "&time=" +
    Date.now();


  const response =
    await fetch(
      url,
      {
        method: "GET",
        cache: "no-store"
      }
    );


  if (!response.ok) {

    throw new Error(
      "API HTTP " +
      response.status
    );

  }


  const data =
    await response.json();


  if (
    data.error ||
    data.success === false
  ) {

    throw new Error(
      data.message ||
      "API returned an error"
    );

  }


  return data;

}


// =====================================================
// 加载分类
// =====================================================

async function loadCategory(
  category,
  page = 1
) {

  if (isLoading) {
    return;
  }


  isLoading = true;


  const status =
    document.getElementById(
      "status"
    );


  if (status) {

    status.textContent =
      "Loading products...";

  }


  try {

    const data =
      await fetchCategory(
        category,
        page
      );


    products =
      (data.products || [])
        .map(
          item => ({

            category:
              category,

            name:
              item.name || "",

            price:
              item.price ?? "",

            sourceUrl:
              item.sourceUrl ||
              item.url ||
              "",

            imageUrl:
              item.imageUrl ||
              item.image ||
              "",

            productId:
              item.productId ||
              extractProductId(
                item.sourceUrl ||
                item.url ||
                ""
              )

          })
        )
        .filter(
          item =>
            item.sourceUrl ||
            item.name ||
            item.imageUrl
        );


    currentCategory =
      category;


    currentPage =
      data.page || page;


    totalPages =
      data.totalPages || 1;


    renderProducts();


    renderPagination();


    updateStatus(
      data.total || products.length
    );


  } catch (error) {

    console.error(
      "BESTR3PS API ERROR:",
      error
    );


    products = [];


    const grid =
      document.getElementById(
        "productGrid"
      );


    if (grid) {

      grid.innerHTML = `

        <div class="emptyState">

          <div class="emptyStateIcon">
            !
          </div>

          <h3>
            Unable to load products
          </h3>

          <p>
            ${escapeHtml(
              error.message ||
              "Failed to fetch"
            )}
          </p>

        </div>

      `;

    }


    if (status) {

      status.textContent =
        "Unable to load products";

    }


  } finally {

    isLoading = false;

  }

}


// =====================================================
// 提取商品 ID
// =====================================================

function extractProductId(
  url
) {

  if (!url) {
    return "";
  }


  const text =
    String(url);


  let match =
    text.match(
      /\/product\/[^/]+\/(\d+)/i
    );


  if (match) {
    return match[1];
  }


  match =
    text.match(
      /[?&]itemID=(\d+)/i
    );


  if (match) {
    return match[1];
  }


  match =
    text.match(
      /[?&]goodsId=(\d+)/i
    );


  if (match) {
    return match[1];
  }


  match =
    text.match(
      /[?&]id=(\d+)/i
    );


  if (match) {
    return match[1];
  }


  return "";

}


// =====================================================
// 商品链接
// =====================================================

function getProductUrl(
  product
) {

  return (
    product.sourceUrl ||
    ""
  );

}


// =====================================================
// Status
// =====================================================

function updateStatus(
  total
) {

  const status =
    document.getElementById(
      "status"
    );


  if (!status) {
    return;
  }


  const start =
    products.length
      ? (
          (currentPage - 1) *
            PAGE_SIZE +
          1
        )
      : 0;


  const end =
    products.length
      ? (
          start +
          products.length -
          1
        )
      : 0;


  if (!total) {

    status.textContent =
      "No products found";

    return;

  }


  status.textContent =
    `Showing ${start}-${end} of ${total} products`;

}


// =====================================================
// Category Tiles
// =====================================================

function renderCategoryTiles() {

  const container =
    document.getElementById(
      "categoryTiles"
    );


  if (!container) {
    return;
  }


  container.innerHTML =
    categories
      .map(
        category => `

          <button
            class="categoryTile"
            data-category="${escapeAttribute(
              category
            )}"
          >

            <span class="categoryTileNumber">
              ${String(
                categories.indexOf(
                  category
                ) + 1
              ).padStart(2, "0")}
            </span>

            <span class="categoryTileName">
              ${escapeHtml(
                category
              )}
            </span>

          </button>

        `
      )
      .join("");


  container
    .querySelectorAll(
      ".categoryTile"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const category =
              button.dataset.category;


            setCategory(
              category
            );

          }
        );

      }
    );

}


// =====================================================
// Category Navigation
// =====================================================

function renderCategories() {

  const container =
    document.getElementById(
      "categoryBar"
    );


  if (!container) {
    return;
  }


  const all =
    [
      "ALL",
      ...categories
    ];


  container.innerHTML =
    all
      .map(
        category => `

          <button
            class="categoryButton ${
              category ===
              currentCategory
                ? "active"
                : ""
            }"
            data-category="${escapeAttribute(
              category
            )}"
          >
            ${escapeHtml(
              category
            )}
          </button>

        `
      )
      .join("");


  container
    .querySelectorAll(
      ".categoryButton"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            setCategory(
              button.dataset.category
            );

          }
        );

      }
    );

}


// =====================================================
// 设置分类
// =====================================================

async function setCategory(
  category
) {

  currentCategory =
    category;

  currentPage = 1;


  renderCategories();


  if (
    category === "ALL"
  ) {

    await loadAllFirstPages();

  } else {

    await loadCategory(
      category,
      1
    );

  }


  const finds =
    document.getElementById(
      "finds"
    );


  if (finds) {

    finds.scrollIntoView({
      behavior: "smooth"
    });

  }

}


// =====================================================
// ALL
//
// 为了避免一次请求全部数据，
// 每个分类只读取第一页。
// =====================================================

async function loadAllFirstPages() {

  if (isLoading) {
    return;
  }


  isLoading = true;


  const status =
    document.getElementById(
      "status"
    );


  const grid =
    document.getElementById(
      "productGrid"
    );


  if (status) {

    status.textContent =
      "Loading products...";

  }


  if (grid) {

    grid.innerHTML = `

      <div class="loadingState">

        <div class="loadingSpinner"></div>

        <p>
          Loading products...
        </p>

      </div>

    `;

  }


  try {

    const allProducts = [];


    // 一次只请求一个分类。
    // 避免 Apps Script 同时执行 8 个大请求。

    for (
      const category of categories
    ) {

      try {

        const data =
          await fetchCategory(
            category,
            1
          );


        const items =
          (data.products || [])
            .map(
              item => ({

                category:
                  category,

                name:
                  item.name || "",

                price:
                  item.price ?? "",

                sourceUrl:
                  item.sourceUrl ||
                  item.url ||
                  "",

                imageUrl:
                  item.imageUrl ||
                  item.image ||
                  "",

                productId:
                  item.productId ||
                  extractProductId(
                    item.sourceUrl ||
                    item.url ||
                    ""
                  )

              })
            );


        allProducts.push(
          ...items
        );

      } catch (categoryError) {

        console.error(
          "Category failed:",
          category,
          categoryError
        );

      }

    }


    products =
      allProducts;


    currentCategory =
      "ALL";


    currentPage =
      1;


    // ALL 模式这里不使用一个假的总页数。
    // 下一页会继续请求各分类下一页。

    totalPages =
      calculateAllPages();


    renderCategories();

    renderProducts();

    renderPagination();

    updateStatus(
      allProducts.length
    );


  } catch (error) {

    console.error(
      error
    );


    if (grid) {

      grid.innerHTML = `

        <div class="emptyState">

          <div class="emptyStateIcon">
            !
          </div>

          <h3>
            Unable to load products
          </h3>

          <p>
            ${escapeHtml(
              error.message ||
              "Failed to fetch"
            )}
          </p>

        </div>

      `;

    }

  } finally {

    isLoading = false;

  }

}


// =====================================================
// ALL 页数
// =====================================================

function calculateAllPages() {

  if (!products.length) {
    return 1;
  }


  return Math.max(
    1,
    Math.ceil(
      products.length /
      PAGE_SIZE
    )
  );

}


// =====================================================
// 产品渲染
// =====================================================

function renderProducts() {

  const grid =
    document.getElementById(
      "productGrid"
    );


  if (!grid) {
    return;
  }


  const searchInput =
    document.getElementById(
      "searchInput"
    );


  const search =
    searchInput
      ? searchInput.value
          .toLowerCase()
          .trim()
      : "";


  let filtered =
    products;


  if (search) {

    filtered =
      products.filter(
        product => {

          return (
            String(
              product.name
            )
              .toLowerCase()
              .includes(
                search
              ) ||

            String(
              product.category
            )
              .toLowerCase()
              .includes(
                search
              )
          );

        }
      );

  }


  if (!filtered.length) {

    grid.innerHTML = `

      <div class="emptyState">

        <div class="emptyStateIcon">
          !
        </div>

        <h3>
          No products found
        </h3>

        <p>
          Try another search or category.
        </p>

      </div>

    `;

    return;

  }


  grid.innerHTML =
    filtered
      .map(
        product => {

          const url =
            getProductUrl(
              product
            );


          const image =
            product.imageUrl;


          const name =
            product.name ||
            "Product";


          const price =
            product.price !== "" &&
            product.price !== null &&
            product.price !== undefined
              ? product.price
              : "";


          return `

            <article
              class="productCard"
            >

              <a
                class="productImageLink"
                href="${escapeAttribute(
                  url
                )}"
                target="_blank"
                rel="noopener noreferrer"
              >

                ${
                  image
                    ? `
                      <img
                        class="productImage"
                        src="${escapeAttribute(
                          image
                        )}"
                        alt="${escapeAttribute(
                          name
                        )}"
                        loading="lazy"
                        onerror="
                          this.style.display='none';
                          this.parentElement.classList.add('imageFailed');
                        "
                      >
                    `
                    : `
                      <div class="noImage">
                        NO IMAGE
                      </div>
                    `
                }

                <div class="productImageOverlay">
                  VIEW PRODUCT
                </div>

              </a>


              <div class="productInfo">

                <div class="productCategory">
                  ${escapeHtml(
                    product.category
                  )}
                </div>

                <h3 class="productName">
                  ${escapeHtml(
                    name
                  )}
                </h3>

                ${
                  price !== ""
                    ? `
                      <div class="productPrice">
                        ${escapeHtml(
                          price
                        )}
                      </div>
                    `
                    : ""
                }

                <a
                  class="productButton"
                  href="${escapeAttribute(
                    url
                  )}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  VIEW
                </a>

              </div>

            </article>

          `;

        }
      )
      .join("");

}


// =====================================================
// 分页
// =====================================================

function renderPagination() {

  const container =
    document.getElementById(
      "pagination"
    );


  if (!container) {
    return;
  }


  if (
    totalPages <= 1
  ) {

    container.innerHTML =
      "";

    return;

  }


  container.innerHTML = `

    <button
      class="paginationButton"
      id="previousPage"
      ${
        currentPage <= 1
          ? "disabled"
          : ""
      }
    >
      ← PREVIOUS
    </button>


    <span class="paginationInfo">
      PAGE ${currentPage}
      /
      ${totalPages}
    </span>


    <button
      class="paginationButton"
      id="nextPage"
      ${
        currentPage >= totalPages
          ? "disabled"
          : ""
      }
    >
      NEXT →
    </button>

  `;


  const previous =
    document.getElementById(
      "previousPage"
    );


  const next =
    document.getElementById(
      "nextPage"
    );


  if (previous) {

    previous.addEventListener(
      "click",
      () => {

        if (
          currentPage <= 1
        ) {
          return;
        }


        goToPage(
          currentPage - 1
        );

      }
    );

  }


  if (next) {

    next.addEventListener(
      "click",
      () => {

        if (
          currentPage >= totalPages
        ) {
          return;
        }


        goToPage(
          currentPage + 1
        );

      }
    );

  }

}


// =====================================================
// 下一页
// =====================================================

async function goToPage(
  page
) {

  if (
    page < 1
  ) {
    return;
  }


  if (
    page > totalPages
  ) {
    return;
  }


  if (
    currentCategory === "ALL"
  ) {

    await loadAllPage(
      page
    );

  } else {

    await loadCategory(
      currentCategory,
      page
    );

  }


  window.scrollTo({
    top:
      document.getElementById(
        "finds"
      )?.offsetTop || 0,
    behavior:
      "smooth"
  });

}


// =====================================================
// ALL 下一页
//
// 每个分类只请求对应页。
// 然后把结果合并。
// =====================================================

async function loadAllPage(
  page
) {

  if (isLoading) {
    return;
  }


  isLoading = true;


  const status =
    document.getElementById(
      "status"
    );


  if (status) {

    status.textContent =
      "Loading products...";

  }


  try {

    const allProducts = [];


    for (
      const category of categories
    ) {

      try {

        const data =
          await fetchCategory(
            category,
            page
          );


        const items =
          (data.products || [])
            .map(
              item => ({

                category:
                  category,

                name:
                  item.name || "",

                price:
                  item.price ?? "",

                sourceUrl:
                  item.sourceUrl ||
                  item.url ||
                  "",

                imageUrl:
                  item.imageUrl ||
                  item.image ||
                  "",

                productId:
                  item.productId ||
                  extractProductId(
                    item.sourceUrl ||
                    item.url ||
                    ""
                  )

              })
            );


        allProducts.push(
          ...items
        );

      } catch (error) {

        console.error(
          category,
          error
        );

      }

    }


    products =
      allProducts;


    currentPage =
      page;


    totalPages =
      Math.max(
        1,
        page
      );


    renderProducts();

    renderPagination();

    updateStatus(
      allProducts.length
    );


  } finally {

    isLoading = false;

  }

}


// =====================================================
// 搜索
// =====================================================

function setupSearch() {

  const input =
    document.getElementById(
      "searchInput"
    );


  if (!input) {
    return;
  }


  input.addEventListener(
    "input",
    () => {

      renderProducts();

    }
  );

}


// =====================================================
// Hero 搜索
// =====================================================

function setupHeroSearch() {

  const heroInput =
    document.getElementById(
      "heroSearchInput"
    );


  const searchInput =
    document.getElementById(
      "searchInput"
    );


  if (
    !heroInput ||
    !searchInput
  ) {
    return;
  }


  heroInput.addEventListener(
    "keydown",
    event => {

      if (
        event.key !== "Enter"
      ) {
        return;
      }


      searchInput.value =
        heroInput.value;


      currentCategory =
        "ALL";


      currentPage =
        1;


      renderCategories();

      loadAllFirstPages();


      document
        .getElementById(
          "finds"
        )
        ?.scrollIntoView({
          behavior:
            "smooth"
        });

    }
  );

}


// =====================================================
// Agent Selector
// =====================================================

function setupAgentSelector() {

  const headerSelect =
    document.getElementById(
      "agentSelect"
    );


  const desktopSelect =
    document.getElementById(
      "desktopAgentSelect"
    );


  function sync(
    value
  ) {

    currentAgent =
      value;


    if (
      headerSelect &&
      headerSelect.value !== value
    ) {

      headerSelect.value =
        value;

    }


    if (
      desktopSelect &&
      desktopSelect.value !== value
    ) {

      desktopSelect.value =
        value;

    }


    renderProducts();

  }


  if (headerSelect) {

    headerSelect.addEventListener(
      "change",
      () => {

        sync(
          headerSelect.value
        );

      }
    );

  }


  if (desktopSelect) {

    desktopSelect.addEventListener(
      "change",
      () => {

        sync(
          desktopSelect.value
        );

      }
    );

  }

}


// =====================================================
// Refresh
// =====================================================

function setupRefreshButton() {

  const button =
    document.getElementById(
      "refreshButton"
    );


  if (!button) {
    return;
  }


  button.addEventListener(
    "click",
    async () => {

      currentPage =
        1;


      if (
        currentCategory === "ALL"
      ) {

        await loadAllFirstPages();

      } else {

        await loadCategory(
          currentCategory,
          1
        );

      }

    }
  );

}


// =====================================================
// Mobile menu
// =====================================================

function setupMobileMenu() {

  const button =
    document.querySelector(
      ".mobileMenuButton"
    );


  const menu =
    document.querySelector(
      ".mobileNav"
    );


  if (
    !button ||
    !menu
  ) {
    return;
  }


  button.addEventListener(
    "click",
    () => {

      menu.classList.toggle(
        "open"
      );

    }
  );

}


// =====================================================
// Logo
// =====================================================

function setupLogo() {

  const logo =
    document.querySelector(
      ".logo"
    );


  if (!logo) {
    return;
  }


  logo.addEventListener(
    "click",
    () => {

      window.scrollTo({
        top: 0,
        behavior:
          "smooth"
      });

    }
  );

}


// =====================================================
// 初始化
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    renderCategoryTiles();

    renderCategories();

    setupSearch();

    setupHeroSearch();

    setupAgentSelector();

    setupRefreshButton();

    setupMobileMenu();

    setupLogo();


    // 首次只加载每个分类第一页
    await loadAllFirstPages();

  }
);
