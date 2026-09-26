const API_URL =
  "https://script.google.com/macros/s/AKfycbxtFiRVCd9Y1MZ6l8-YlmmzRa97RZ6xppFLYoQgTEOBddtlx6wE6q9PnUaCdu3D94BR/exec";


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


const agents = [
  "LITBUY",
  "OOPBUY",
  "KAKOBUY",
  "HIPOBUY",
  "LOVEGOBUY",
  "RIZZITGO",
  "BOONBUY",
  "USFANS"
];


let products = [];

let currentCategory = "ALL";

let currentPage = 1;

let totalPages = 1;

let currentAgent = "LITBUY";

let isLoading = false;


// =====================================================
// HTML escape
// =====================================================

function escapeHtml(
  value
) {

  return String(
    value ?? ""
  )
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


// =====================================================
// API
// =====================================================

async function fetchProducts(
  category,
  page
) {

  const url =
    API_URL +
    "?category=" +
    encodeURIComponent(
      category
    ) +
    "&page=" +
    page +
    "&t=" +
    Date.now();


  const response =
    await fetch(
      url,
      {
        method: "GET",
        cache: "no-store"
      }
    );


  if (
    !response.ok
  ) {

    throw new Error(
      "HTTP " +
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
      "API Error"
    );

  }


  return data;

}


// =====================================================
// Load
// =====================================================

async function loadProducts(
  category = currentCategory,
  page = 1
) {

  if (isLoading) {

    return;

  }


  isLoading = true;


  setStatus(
    "Loading products..."
  );


  showLoading();


  try {

    const data =
      await fetchProducts(
        category,
        page
      );


    products =
      (data.products || [])
        .map(
          item => ({

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
              extractProductId(
                item.sourceUrl ||
                item.url ||
                ""
              )

          })
        )
        .filter(
          product =>
            product.name ||
            product.sourceUrl ||
            product.imageUrl
        );


    currentCategory =
      category;


    currentPage =
      data.page ||
      page;


    totalPages =
      data.totalPages ||
      1;


    renderCategories();

    renderProducts();

    renderPagination();


    setStatus(
      `${products.length} products loaded`
    );


  } catch (error) {

    console.error(
      "BESTR3PS API:",
      error
    );


    showError(
      error.message ||
      "Failed to fetch"
    );


  } finally {

    isLoading = false;

  }

}


// =====================================================
// Product ID
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
// Status
// =====================================================

function setStatus(
  text
) {

  const element =
    document.getElementById(
      "status"
    );


  if (element) {

    element.textContent =
      text;

  }

}


// =====================================================
// Loading
// =====================================================

function showLoading() {

  const grid =
    document.getElementById(
      "productGrid"
    );


  if (!grid) {

    return;

  }


  grid.innerHTML = `

    <div class="loadingState">

      <div class="loadingSpinner"></div>

      <p>
        Loading products...
      </p>

    </div>

  `;

}


// =====================================================
// Error
// =====================================================

function showError(
  message
) {

  const grid =
    document.getElementById(
      "productGrid"
    );


  if (!grid) {

    return;

  }


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
          message
        )}
      </p>

    </div>

  `;


  setStatus(
    "Unable to load products"
  );

}


// =====================================================
// Category buttons
// =====================================================

function renderCategories() {

  const bar =
    document.getElementById(
      "categoryBar"
    );


  if (!bar) {

    return;

  }


  const all =
    [
      "ALL",
      ...categories
    ];


  bar.innerHTML =
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
            data-category="${escapeHtml(
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


  bar
    .querySelectorAll(
      ".categoryButton"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const category =
              button.dataset.category;


            currentPage =
              1;


            loadProducts(
              category,
              1
            );

          }
        );

      }
    );

}


// =====================================================
// Category tiles
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
        (category, index) => `

          <button
            class="categoryTile"
            data-category="${escapeHtml(
              category
            )}"
          >

            <span
              class="categoryTileNumber"
            >
              ${String(
                index + 1
              ).padStart(
                2,
                "0"
              )}
            </span>

            <span
              class="categoryTileName"
            >
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


            loadProducts(
              category,
              1
            );


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
    );

}


// =====================================================
// Products
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
          .trim()
          .toLowerCase()
      : "";


  let filtered =
    products;


  if (search) {

    filtered =
      products.filter(
        product =>
          String(
            product.name
          )
            .toLowerCase()
            .includes(
              search
            )
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
            product.sourceUrl ||
            "#";


          const image =
            product.imageUrl ||
            "";


          return `

            <article
              class="productCard"
            >

              <a
                class="productImageLink"
                href="${escapeHtml(
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
                        src="${escapeHtml(
                          image
                        )}"
                        alt="${escapeHtml(
                          product.name
                        )}"
                        loading="lazy"
                        onerror="
                          this.style.display='none';
                        "
                      >
                    `
                    : `
                      <div class="noImage">
                        NO IMAGE
                      </div>
                    `
                }

              </a>


              <div
                class="productInfo"
              >

                <div
                  class="productCategory"
                >
                  ${escapeHtml(
                    currentCategory
                  )}
                </div>


                <h3
                  class="productName"
                >
                  ${escapeHtml(
                    product.name
                  )}
                </h3>


                ${
                  product.price
                    ? `
                      <div
                        class="productPrice"
                      >
                        ${escapeHtml(
                          product.price
                        )}
                      </div>
                    `
                    : ""
                }


                <a
                  class="productButton"
                  href="${escapeHtml(
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
// Pagination
// =====================================================

function renderPagination() {

  let container =
    document.getElementById(
      "pagination"
    );


  if (!container) {

    const grid =
      document.getElementById(
        "productGrid"
      );


    if (!grid) {

      return;

    }


    container =
      document.createElement(
        "div"
      );


    container.id =
      "pagination";


    container.className =
      "pagination";


    grid.after(
      container
    );

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


    <span
      class="paginationInfo"
    >
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
          currentPage > 1
        ) {

          loadProducts(
            currentCategory,
            currentPage - 1
          );

        }

      }
    );

  }


  if (next) {

    next.addEventListener(
      "click",
      () => {

        if (
          currentPage <
          totalPages
        ) {

          loadProducts(
            currentCategory,
            currentPage + 1
          );

        }

      }
    );

  }

}


// =====================================================
// Search
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
// Hero Search
// =====================================================

function setupHeroSearch() {

  const input =
    document.getElementById(
      "heroSearchInput"
    );


  const searchInput =
    document.getElementById(
      "searchInput"
    );


  if (
    !input ||
    !searchInput
  ) {

    return;

  }


  input.addEventListener(
    "keydown",
    event => {

      if (
        event.key !== "Enter"
      ) {

        return;

      }


      searchInput.value =
        input.value;


      currentCategory =
        "ALL";


      currentPage =
        1;


      loadProducts(
        "ALL",
        1
      );


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
// Agent
// =====================================================

function setupAgents() {

  const selects =
    document.querySelectorAll(
      "#agentSelect, #desktopAgentSelect"
    );


  selects.forEach(
    select => {

      select.addEventListener(
        "change",
        () => {

          currentAgent =
            select.value;


          selects.forEach(
            other => {

              other.value =
                currentAgent;

            }
          );

        }
      );

    }
  );

}


// =====================================================
// Refresh
// =====================================================

function setupRefresh() {

  const button =
    document.getElementById(
      "refreshButton"
    );


  if (!button) {

    return;

  }


  button.addEventListener(
    "click",
    () => {

      loadProducts(
        currentCategory,
        currentPage
      );

    }
  );

}


// =====================================================
// Mobile Menu
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
// Init
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    renderCategoryTiles();

    renderCategories();

    setupSearch();

    setupHeroSearch();

    setupAgents();

    setupRefresh();

    setupMobileMenu();


    // 首页第一次只读取
    // 每个分类对应的第一页数据。
    //
    // 不读取整个 Spreadsheet。

    loadProducts(
      "ALL",
      1
    );

  }
);
