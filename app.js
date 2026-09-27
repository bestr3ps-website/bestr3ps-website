```javascript
const API_URL =
  "https://script.google.com/macros/s/AKfycbxn9DVmH7b3isG3CyaNEJ7b6DrGrLimfIc7YVX9YU1NkAftIfcQPNyFNKFP8ko_d7JX/exec";


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
// LOAD PRODUCTS
// =========================================================

async function loadProducts() {

  const status =
    document.getElementById("status");

  if (status) {
    status.textContent =
      "Loading products...";
  }

  try {

    const response =
      await fetch(
        API_URL +
        "?time=" +
        Date.now(),
        {
          cache: "no-store"
        }
      );


    if (!response.ok) {
      throw new Error(
        "API request failed: " +
        response.status
      );
    }


    const data =
      await response.json();


    if (data.error) {
      throw new Error(
        data.message ||
        "API returned an error"
      );
    }


    products = [];


    categories.forEach(
      category => {

        const rows =
          Array.isArray(
            data[category]
          )
            ? data[category]
            : [];


        rows.forEach(
          item => {

            if (!item) return;


            const name =
              item.name || "";


            const price =
              item.price || "";


            const sourceUrl =
              item.sourceUrl ||
              item.url ||
              "";


            const imageUrl =
              item.imageUrl ||
              item.image ||
              "";


            const productId =
              item.productId ||
              extractProductId(
                sourceUrl
              );


            if (
              !name &&
              !sourceUrl &&
              !imageUrl
            ) {
              return;
            }


            products.push({

              category:
                category,

              name:
                name,

              price:
                price,

              sourceUrl:
                sourceUrl,

              imageUrl:
                imageUrl,

              productId:
                productId

            });

          }
        );

      }
    );


    renderCategoryTiles();

    renderCategories();

    renderProducts();

    updateStatus();


  } catch (error) {

    console.error(
      "加载商品失败:",
      error
    );


    products = [];


    const container =
      document.getElementById(
        "productGrid"
      );


    if (container) {

      container.innerHTML = `
        <div class="emptyState">

          <div class="emptyIcon">
            !
          </div>

          <h3>
            Unable to load products
          </h3>

          <p>
            Please try refreshing the page.
          </p>

        </div>
      `;

    }


    if (status) {
      status.textContent =
        "Unable to load products";
    }

  }

}


// =========================================================
// STATUS
// =========================================================

function updateStatus() {

  const status =
    document.getElementById(
      "status"
    );

  if (!status) return;


  let visibleProducts =
    [...products];


  if (
    currentCategory !==
    "ALL"
  ) {

    visibleProducts =
      visibleProducts.filter(
        product =>
          product.category ===
          currentCategory
      );

  }


  const searchInput =
    document.getElementById(
      "searchInput"
    );


  if (searchInput) {

    const keyword =
      searchInput.value
        .trim()
        .toLowerCase();


    if (keyword) {

      visibleProducts =
        visibleProducts.filter(
          product => {

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

          }
        );

    }

  }


  status.textContent =
    visibleProducts.length +
    (
      visibleProducts.length === 1
        ? " product"
        : " products"
    );

}


// =========================================================
// PRODUCT ID
// =========================================================

function extractProductId(url) {

  if (!url) return "";


  let value =
    String(url);


  for (
    let i = 0;
    i < 3;
    i++
  ) {

    try {

      const decoded =
        decodeURIComponent(
          value
        );


      if (
        decoded === value
      ) {
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
// PRODUCT URL
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
// CATEGORY TILES
// =========================================================

function renderCategoryTiles() {

  const container =
    document.getElementById(
      "categoryTiles"
    );


  if (!container) return;


  container.innerHTML = "";


  categories.forEach(
    (category, index) => {

      const tile =
        document.createElement(
          "div"
        );


      tile.className =
        "categoryTile";


      tile.dataset.category =
        category;


      tile.innerHTML = `

        <div class="categoryTileNumber">
          ${String(index + 1).padStart(2, "0")}
        </div>

        <div class="categoryTileName">
          ${escapeHtml(category)}
        </div>

      `;


      tile.addEventListener(
        "click",
        () => {

          currentCategory =
            category;


          renderCategories();

          renderProducts();


          const productSection =
            document.getElementById(
              "productGrid"
            );


          if (productSection) {

            productSection.scrollIntoView(
              {
                behavior: "smooth",
                block: "start"
              }
            );

          }

        }
      );


      container.appendChild(
        tile
      );

    }
  );

}


// =========================================================
// CATEGORY NAV
// =========================================================

function renderCategories() {

  const container =
    document.getElementById(
      "categoryNav"
    );


  if (!container) return;


  container.innerHTML = "";


  const allButton =
    document.createElement(
      "button"
    );


  allButton.type =
    "button";


  allButton.className =
    "categoryButton";


  allButton.textContent =
    "ALL";


  if (
    currentCategory ===
    "ALL"
  ) {

    allButton.classList.add(
      "active"
    );

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


  categories.forEach(
    category => {

      const button =
        document.createElement(
          "button"
        );


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

        button.classList.add(
          "active"
        );

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


      container.appendChild(
        button
      );

    }
  );

}


// =========================================================
// PRODUCTS
// =========================================================

function renderProducts() {

  const container =
    document.getElementById(
      "productGrid"
    );


  if (!container) return;


  container.innerHTML = "";


  let filteredProducts =
    [...products];


  if (
    currentCategory !==
    "ALL"
  ) {

    filteredProducts =
      filteredProducts.filter(
        product =>
          product.category ===
          currentCategory
      );

  }


  const searchInput =
    document.getElementById(
      "searchInput"
    );


  if (searchInput) {

    const keyword =
      searchInput.value
        .trim()
        .toLowerCase();


    if (keyword) {

      filteredProducts =
        filteredProducts.filter(
          product => {

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

          }
        );

    }

  }


  if (
    filteredProducts.length ===
    0
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


  filteredProducts.forEach(
    product => {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "productCard";


      const productUrl =
        getProductUrl(
          product
        );


      card.innerHTML = `

        <a
          href="${escapeAttribute(productUrl)}"
          target="_blank"
          rel="noopener noreferrer"
          class="productLink"
        >

          <div class="productImage">

            ${
              product.imageUrl

                ? `

                  <img
                    src="${escapeAttribute(product.imageUrl)}"
                    alt="${escapeAttribute(product.name)}"
                    loading="lazy"
                    onerror="
                      this.style.display='none';
                      this.parentElement.innerHTML='<div class=\\'imageFallback\\'>NO IMAGE</div>';
                    "
                  >

                `

                : `

                  <div class="imageFallback">
                    NO IMAGE
                  </div>

                `
            }

          </div>


          <div class="productInfo">

            <div class="productName">
              ${escapeHtml(product.name)}
            </div>


            ${
              product.price

                ? `

                  <div class="productPrice">
                    ${escapeHtml(product.price)}
                  </div>

                `

                : `

                  <div class="productPrice">
                    —
                  </div>

                `
            }


            <div class="viewButton">
              VIEW PRODUCT →
            </div>


            <div class="productCategory">
              ${escapeHtml(product.category)}
            </div>

          </div>

        </a>

      `;


      container.appendChild(
        card
      );

    }
  );


  updateStatus();

}


// =========================================================
// SEARCH
// =========================================================

function setupSearch() {

  const searchInput =
    document.getElementById(
      "searchInput"
    );


  if (!searchInput) return;


  searchInput.addEventListener(
    "input",
    () => {

      renderProducts();

    }
  );

}


// =========================================================
// HERO SEARCH
// =========================================================

function setupHeroSearch() {

  const heroInput =
    document.getElementById(
      "heroSearchInput"
    );


  const heroButton =
    document.getElementById(
      "heroSearchButton"
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


  function executeSearch() {

    searchInput.value =
      heroInput.value;


    currentCategory =
      "ALL";


    renderCategories();

    renderProducts();


    const productGrid =
      document.getElementById(
        "productGrid"
      );


    if (productGrid) {

      productGrid.scrollIntoView(
        {
          behavior: "smooth",
          block: "start"
        }
      );

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
// AGENT
// =========================================================

function setupAgentSelector() {

  const headerSelect =
    document.getElementById(
      "agentSelect"
    );


  const desktopSelect =
    document.getElementById(
      "desktopAgentSelect"
    );


  function changeAgent(
    value
  ) {

    currentAgent =
      value ||
      "litbuy";


    if (headerSelect) {

      headerSelect.value =
        currentAgent;

    }


    if (desktopSelect) {

      desktopSelect.value =
        currentAgent;

    }


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
// REFRESH
// =========================================================

function setupRefreshButton() {

  const refreshBtn =
    document.getElementById(
      "refreshBtn"
    );


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
// MOBILE MENU
// =========================================================

function setupMobileMenu() {

  const menuButton =
    document.getElementById(
      "mobileMenuButton"
    );


  const mobileMenu =
    document.getElementById(
      "mobileNav"
    );


  if (
    !menuButton ||
    !mobileMenu
  ) {

    return;

  }


  menuButton.addEventListener(
    "click",
    () => {

      mobileMenu.classList.toggle(
        "open"
      );

    }
  );


  mobileMenu
    .querySelectorAll("a")
    .forEach(
      link => {

        link.addEventListener(
          "click",
          () => {

            mobileMenu.classList.remove(
              "open"
            );

          }
        );

      }
    );

}


// =========================================================
// LOGO
// =========================================================

function setupLogo() {

  const logo =
    document.getElementById(
      "homeLogo"
    );


  if (!logo) return;


  logo.addEventListener(
    "click",
    () => {

      currentCategory =
        "ALL";


      const searchInput =
        document.getElementById(
          "searchInput"
        );


      const heroInput =
        document.getElementById(
          "heroSearchInput"
        );


      if (searchInput) {
        searchInput.value =
          "";
      }


      if (heroInput) {
        heroInput.value =
          "";
      }


      renderCategories();

      renderProducts();

    }
  );

}


// =========================================================
// ESCAPE
// =========================================================

function escapeHtml(value) {

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


function escapeAttribute(
  value
) {

  return escapeHtml(
    value
  );

}


// =========================================================
// INIT
// =========================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    setupSearch();

    setupHeroSearch();

    setupAgentSelector();

    setupRefreshButton();

    setupMobileMenu();

    setupLogo();

    loadProducts();

  }
);
```
