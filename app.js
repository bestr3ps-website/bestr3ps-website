```javascript
const API_URL =
  "https://script.google.com/macros/s/AKfycbxtFiRVCd9Y1MZ6l8-YlmmzRa97RZ6xppFLYoQgTEOBddtlx6wE6q9PnUaCdu3D94BR/exec";


/*
=========================================================
SETTINGS
=========================================================
*/

const PAGE_SIZE = 30;

const CACHE_VERSION = "v2";


/*
=========================================================
CONFIRMED CATEGORIES
=========================================================
*/

const CATEGORIES = [
  "SUMMER Pick",
  "SNEAKERS",
  "T-SHIRTS/SHORTS",
  "HOODIE/PANTS",
  "DOWNJACKET",
  "ACCESSORIES",
  "BAGS"
];


let currentCategory =
  CATEGORIES[0];

let currentProducts = [];

let visibleCount =
  PAGE_SIZE;


/*
内存缓存

当前页面打开期间，
已经加载过的分类不会重复请求。
*/

const categoryCache = {};


/*
=========================================================
INIT
=========================================================
*/

function init() {

  renderCategoryButtons();

  showLoadingState();

  loadCategory(
    currentCategory
  );
}


/*
=========================================================
CATEGORY BUTTONS
=========================================================
*/

function renderCategoryButtons() {

  const nav =
    document.getElementById(
      "categoryNav"
    );

  if (!nav) {
    return;
  }


  nav.innerHTML = "";


  CATEGORIES.forEach(
    category => {

      const btn =
        document.createElement(
          "button"
        );


      btn.textContent =
        category;


      btn.className =
        category ===
        currentCategory
          ? "active"
          : "";


      btn.addEventListener(
        "click",
        () => {

          if (
            currentCategory ===
            category
          ) {

            return;
          }


          currentCategory =
            category;


          visibleCount =
            PAGE_SIZE;


          document
            .querySelectorAll(
              "#categoryNav button"
            )
            .forEach(
              b =>
                b.classList.remove(
                  "active"
                )
            );


          btn.classList.add(
            "active"
          );


          loadCategory(
            category
          );

        }
      );


      nav.appendChild(
        btn
      );

    }
  );
}


/*
=========================================================
LOAD CATEGORY
=========================================================
*/

async function loadCategory(
  category
) {

  currentProducts = [];

  visibleCount =
    PAGE_SIZE;


  showLoadingState();


  /*
  -------------------------------------------------------
  1. 当前页面内存缓存
  -------------------------------------------------------
  */

  if (
    categoryCache[category]
  ) {

    currentProducts =
      categoryCache[
        category
      ];

    renderProducts();

    return;
  }


  /*
  -------------------------------------------------------
  2. 浏览器 localStorage 缓存
  -------------------------------------------------------
  */

  const storageKey =
    getStorageKey(
      category
    );


  try {

    const saved =
      localStorage.getItem(
        storageKey
      );


    if (saved) {

      const parsed =
        JSON.parse(saved);


      if (
        Array.isArray(parsed) &&
        parsed.length > 0
      ) {

        currentProducts =
          parsed;


        categoryCache[
          category
        ] = parsed;


        renderProducts();


        /*
        -------------------------------------------------
        后台更新数据

        用户已经看到商品，
        不需要一直等 API。
        -------------------------------------------------
        */

        refreshCategoryInBackground(
          category
        );


        return;
      }
    }

  } catch (error) {

    console.warn(
      "Local cache error:",
      error
    );

  }


  /*
  -------------------------------------------------------
  3. 第一次加载 → 请求 Apps Script
  -------------------------------------------------------
  */

  await fetchCategory(
    category
  );
}


/*
=========================================================
FETCH CATEGORY
=========================================================
*/

async function fetchCategory(
  category
) {

  try {

    const url =
      API_URL +
      "?category=" +
      encodeURIComponent(
        category
      );


    const response =
      await fetch(
        url,
        {
          method: "GET",
          cache: "default"
        }
      );


    if (!response.ok) {

      throw new Error(
        "HTTP " +
        response.status
      );
    }


    const data =
      await response.json();


    /*
    -----------------------------------------------------
    新 API 格式
    -----------------------------------------------------
    */

    let products = [];


    if (
      data &&
      Array.isArray(
        data.products
      )
    ) {

      products =
        data.products;

    }


    /*
    -----------------------------------------------------
    兼容旧 API

    如果以后 API 返回：

    {
      "SNEAKERS": [...]
    }

    也仍然可以读取。
    -----------------------------------------------------
    */

    else if (
      data &&
      Array.isArray(
        data[category]
      )
    ) {

      products =
        data[category];

    }


    /*
    如果 API 直接返回数组
    */

    else if (
      Array.isArray(data)
    ) {

      products =
        data;

    }


    /*
    -----------------------------------------------------
    重要：

    不缓存 0 product。

    防止 API 临时异常时，
    把空数据保存下来。
    -----------------------------------------------------
    */

    if (
      !Array.isArray(products) ||
      products.length === 0
    ) {

      currentProducts = [];

      showEmptyState();

      return;
    }


    /*
    -----------------------------------------------------
    保存到内存缓存
    -----------------------------------------------------
    */

    currentProducts =
      products;


    categoryCache[
      category
    ] = products;


    /*
    -----------------------------------------------------
    保存到浏览器缓存
    -----------------------------------------------------
    */

    saveLocalCache(
      category,
      products
    );


    renderProducts();


  } catch (error) {

    console.error(
      "Load products error:",
      error
    );


    showErrorState();
  }
}


/*
=========================================================
BACKGROUND REFRESH
=========================================================
*/

async function refreshCategoryInBackground(
  category
) {

  try {

    const url =
      API_URL +
      "?category=" +
      encodeURIComponent(
        category
      );


    const response =
      await fetch(
        url,
        {
          method: "GET",
          cache: "no-store"
        }
      );


    if (!response.ok) {
      return;
    }


    const data =
      await response.json();


    let products = [];


    if (
      data &&
      Array.isArray(
        data.products
      )
    ) {

      products =
        data.products;

    }


    else if (
      data &&
      Array.isArray(
        data[category]
      )
    ) {

      products =
        data[category];

    }


    if (
      products.length > 0
    ) {

      categoryCache[
        category
      ] = products;


      saveLocalCache(
        category,
        products
      );


      /*
      只有用户仍然停留在这个分类，
      才更新当前页面。
      */

      if (
        currentCategory ===
        category
      ) {

        currentProducts =
          products;

        renderProducts();
      }
    }

  } catch (error) {

    console.warn(
      "Background refresh failed:",
      error
    );

  }
}


/*
=========================================================
LOCAL STORAGE KEY
=========================================================
*/

function getStorageKey(
  category
) {

  return (
    "bestr3ps_products_" +
    CACHE_VERSION +
    "_" +
    category
  );
}


/*
=========================================================
SAVE LOCAL CACHE
=========================================================
*/

function saveLocalCache(
  category,
  products
) {

  try {

    localStorage.setItem(
      getStorageKey(
        category
      ),
      JSON.stringify(
        products
      )
    );

  } catch (error) {

    /*
    localStorage 空间不足时，
    不影响网站正常运行。
    */

    console.warn(
      "Could not save cache:",
      error
    );

  }
}


/*
=========================================================
RENDER PRODUCTS
=========================================================
*/

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


  const keyword =
    searchInput
      ? searchInput.value
          .trim()
          .toLowerCase()
      : "";


  let products =
    currentProducts;


  /*
  -------------------------------------------------------
  SEARCH
  -------------------------------------------------------
  */

  if (keyword) {

    products =
      currentProducts.filter(
        product => {

          const name =
            String(
              product.name ||
              product.title ||
              product.product ||
              ""
            ).toLowerCase();


          return name.includes(
            keyword
          );

        }
      );
  }


  /*
  -------------------------------------------------------
  EMPTY
  -------------------------------------------------------
  */

  if (
    !products.length
  ) {

    grid.innerHTML = "";

    showEmptyState();

    return;
  }


  hideEmptyState();


  /*
  -------------------------------------------------------
  ONLY RENDER FIRST 30
  -------------------------------------------------------
  */

  const visibleProducts =
    products.slice(
      0,
      visibleCount
    );


  grid.innerHTML =
    visibleProducts
      .map(
        product =>
          createProductCard(
            product
          )
      )
      .join("");


  /*
  -------------------------------------------------------
  LOAD MORE
  -------------------------------------------------------
  */

  if (
    products.length >
    visibleCount
  ) {

    const loadMore =
      document.createElement(
        "button"
      );


    loadMore.className =
      "load-more";


    loadMore.textContent =
      `LOAD MORE (${Math.min(
        PAGE_SIZE,
        products.length -
          visibleCount
      )})`;


    loadMore.addEventListener(
      "click",
      () => {

        visibleCount +=
          PAGE_SIZE;

        renderProducts();

      }
    );


    grid.appendChild(
      loadMore
    );
  }


  /*
  -------------------------------------------------------
  LAZY IMAGES
  -------------------------------------------------------
  */

  setupImageObserver();


  updateStatus(
    `${products.length} products`
  );
}


/*
=========================================================
CREATE PRODUCT CARD
=========================================================
*/

function createProductCard(
  product
) {

  const name =
    escapeHtml(
      product.name ||
      product.title ||
      product.product ||
      "Product"
    );


  const price =
    escapeHtml(
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
                  data-src="${escapeAttribute(
                    image
                  )}"
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
}


/*
=========================================================
IMAGE OBSERVER
=========================================================
*/

function setupImageObserver() {

  const images =
    document.querySelectorAll(
      ".lazy-image"
    );


  if (
    !images.length
  ) {
    return;
  }


  /*
  不支持 IntersectionObserver
  */

  if (
    !(
      "IntersectionObserver"
      in window
    )
  ) {

    images.forEach(
      loadImage
    );

    return;
  }


  /*
  清除旧 observer
  */

  if (
    window._imageObserver
  ) {

    window
      ._imageObserver
      .disconnect();
  }


  window._imageObserver =
    new IntersectionObserver(
      entries => {

        entries.forEach(
          entry => {

            if (
              entry.isIntersecting
            ) {

              loadImage(
                entry.target
              );


              window
                ._imageObserver
                .unobserve(
                  entry.target
                );
            }

          }
        );

      },
      {
        rootMargin:
          "400px"
      }
    );


  images.forEach(
    image => {

      window
        ._imageObserver
        .observe(
          image
        );

    }
  );
}


/*
=========================================================
LOAD IMAGE
=========================================================
*/

function loadImage(img) {

  const src =
    img.dataset.src;


  if (!src) {
    return;
  }


  img.src = src;


  img.removeAttribute(
    "data-src"
  );


  img.onerror = () => {

    img.style.display =
      "none";

  };
}


/*
=========================================================
SEARCH
=========================================================
*/

function setupSearch() {

  const input =
    document.getElementById(
      "searchInput"
    );


  if (!input) {
    return;
  }


  let timer = null;


  input.addEventListener(
    "input",
    () => {

      clearTimeout(
        timer
      );


      timer =
        setTimeout(
          () => {

            visibleCount =
              PAGE_SIZE;

            renderProducts();

          },
          200
        );

    }
  );
}


/*
=========================================================
LOADING
=========================================================
*/

function showLoadingState() {

  const grid =
    document.getElementById(
      "productGrid"
    );


  if (!grid) {
    return;
  }


  grid.innerHTML = `
    <div class="loading">
      Loading products...
    </div>
  `;


  hideEmptyState();


  updateStatus(
    "Loading..."
  );
}


/*
=========================================================
ERROR
=========================================================
*/

function showErrorState() {

  const grid =
    document.getElementById(
      "productGrid"
    );


  if (!grid) {
    return;
  }


  grid.innerHTML = `
    <div class="loading">
      Failed to load products.
      <br>
      Please try again.
    </div>
  `;


  updateStatus(
    "Load failed"
  );
}


/*
=========================================================
EMPTY
=========================================================
*/

function showEmptyState() {

  const empty =
    document.getElementById(
      "emptyMessage"
    );


  if (empty) {

    empty.style.display =
      "block";
  }


  updateStatus(
    "0 products"
  );
}


/*
=========================================================
HIDE EMPTY
=========================================================
*/

function hideEmptyState() {

  const empty =
    document.getElementById(
      "emptyMessage"
    );


  if (empty) {

    empty.style.display =
      "none";
  }
}


/*
=========================================================
STATUS
=========================================================
*/

function updateStatus(
  text
) {

  const status =
    document.getElementById(
      "status"
    );


  if (status) {

    status.textContent =
      text;
  }
}


/*
=========================================================
ESCAPE HTML
=========================================================
*/

function escapeHtml(
  value
) {

  return String(value)

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


/*
=========================================================
ESCAPE ATTRIBUTE
=========================================================
*/

function escapeAttribute(
  value
) {

  return escapeHtml(
    value
  );
}


/*
=========================================================
REFRESH BUTTON
=========================================================
*/

function setupRefreshButton() {

  const button =
    document.getElementById(
      "refreshBtn"
    );


  if (!button) {
    return;
  }


  button.addEventListener(
    "click",
    async () => {

      /*
      清掉当前分类的本地缓存
      */

      try {

        localStorage.removeItem(
          getStorageKey(
            currentCategory
          )
        );

      } catch (error) {}


      /*
      清掉内存缓存
      */

      delete categoryCache[
        currentCategory
      ];


      /*
      重新加载
      */

      await fetchCategory(
        currentCategory
      );

    }
  );
}


/*
=========================================================
START
=========================================================
*/

document.addEventListener(
  "DOMContentLoaded",
  () => {

    setupSearch();

    setupRefreshButton();

    init();

  }
);
```
