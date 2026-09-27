/* =========================================================
   BESTR3PS - app.js
   FAST CATEGORY LOADING
   ========================================================= */

const API_URL =
  "https://script.google.com/macros/s/AKfycbxtFiRVCd9Y1MZ6l8-YlmmzRa97RZ6xppFLYoQgTEOBddtlx6wE6q9PnUaCdu3D94BR/exec";


const PAGE_SIZE = 30;


const CATEGORIES = [

  {
    key: "SNEAKERS",
    label: "SNEAKERS"
  },

  {
    key: "T-SHIRTS/SHORTS",
    label: "T-SHIRTS / SHORTS"
  },

  {
    key: "HOODIE/PANTS",
    label: "HOODIE / PANTS"
  },

  {
    key: "DOWNJACKET",
    label: "DOWNJACKET"
  },

  {
    key: "ACCESSORIES",
    label: "ACCESSORIES"
  },

  {
    key: "BAGS",
    label: "BAGS"
  }

];


let currentCategory =
  "SNEAKERS";


let currentPage =
  1;


let searchKeyword =
  "";


let allProducts =
  [];


let filteredProducts =
  [];


let categoryCache =
  new Map();


let loading =
  false;


/* =========================================================
   INIT
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    setupEvents();

    renderCategoryButtons();

    loadCategory(
      currentCategory
    );

  }
);


/* =========================================================
   EVENTS
   ========================================================= */

function setupEvents() {

  const input =
    document.getElementById(
      "searchInput"
    );


  if (input) {

    input.addEventListener(
      "input",
      debounce(
        function () {

          searchKeyword =
            this.value
              .trim()
              .toLowerCase();


          currentPage = 1;

          applyFilterAndRender();

        },
        180
      )
    );


    input.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Enter"
        ) {

          searchKeyword =
            input.value
              .trim()
              .toLowerCase();


          currentPage = 1;

          applyFilterAndRender();

        }

      }
    );

  }


  const searchButton =
    document.getElementById(
      "searchButton"
    );


  if (searchButton) {

    searchButton.addEventListener(
      "click",
      () => {

        if (!input) {
          return;
        }


        searchKeyword =
          input.value
            .trim()
            .toLowerCase();


        currentPage = 1;

        applyFilterAndRender();

      }
    );

  }


  const refreshButton =
    document.getElementById(
      "refreshBtn"
    );


  if (refreshButton) {

    refreshButton.addEventListener(
      "click",
      () => {

        categoryCache.delete(
          currentCategory
        );


        loadCategory(
          currentCategory,
          true
        );

      }
    );

  }

}


/* =========================================================
   CATEGORY BUTTONS
   ========================================================= */

function renderCategoryButtons() {

  const nav =
    document.getElementById(
      "categoryNav"
    );


  if (!nav) {
    return;
  }


  nav.innerHTML = "";


  const wrapper =
    document.createElement(
      "div"
    );


  wrapper.className =
    "categories";


  CATEGORIES.forEach(
    category => {

      const button =
        document.createElement(
          "button"
        );


      button.type =
        "button";


      button.className =
        "category-btn";


      button.dataset.category =
        category.key;


      button.textContent =
        category.label;


      if (
        category.key ===
        currentCategory
      ) {

        button.classList.add(
          "active"
        );

      }


      button.addEventListener(
        "click",
        () => {

          switchCategory(
            category.key
          );

        }
      );


      wrapper.appendChild(
        button
      );

    }
  );


  nav.appendChild(
    wrapper
  );

}


/* =========================================================
   SWITCH CATEGORY
   ========================================================= */

function switchCategory(
  category
) {

  if (
    loading &&
    category ===
      currentCategory
  ) {

    return;

  }


  currentCategory =
    category;


  currentPage =
    1;


  searchKeyword =
    "";


  const input =
    document.getElementById(
      "searchInput"
    );


  if (input) {
    input.value = "";
  }


  document
    .querySelectorAll(
      ".category-btn"
    )
    .forEach(
      button => {

        button.classList.toggle(
          "active",
          button.dataset.category ===
            category
        );

      }
    );


  /*
    如果这个分类已经加载过，
    直接使用缓存。
  */

  if (
    categoryCache.has(
      category
    )
  ) {

    allProducts =
      categoryCache.get(
        category
      );


    applyFilterAndRender();

    return;

  }


  /*
    第一次进入该分类，
    才向 Apps Script 请求。
  */

  loadCategory(
    category
  );

}


/* =========================================================
   LOAD ONE CATEGORY
   ========================================================= */

async function loadCategory(
  category,
  forceRefresh = false
) {

  if (loading) {
    return;
  }


  loading =
    true;


  showLoadingState();


  updateStatus(
    "Loading " +
    category +
    "..."
  );


  const refreshButton =
    document.getElementById(
      "refreshBtn"
    );


  if (refreshButton) {

    refreshButton.disabled =
      true;

  }


  try {

    const separator =
      API_URL.includes("?")
        ? "&"
        : "?";


    const url =
      API_URL +
      separator +
      "category=" +
      encodeURIComponent(
        category
      ) +
      (
        forceRefresh
          ? "&t=" +
            Date.now()
          : ""
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

      throw new Error(
        "HTTP " +
        response.status
      );

    }


    const data =
      await response.json();


    if (
      !data ||
      data._SUCCESS === false
    ) {

      throw new Error(
        data &&
        data.error
          ? data.error
          : "API error"
      );

    }


    let products =
      Array.isArray(
        data.products
      )
        ? data.products
        : [];


    products =
      normalizeProducts(
        products
      );


    categoryCache.set(
      category,
      products
    );


    /*
      防止快速点击其他分类时，
      旧请求覆盖新分类。
    */

    if (
      category !==
      currentCategory
    ) {

      return;

    }


    allProducts =
      products;


    currentPage =
      1;


    applyFilterAndRender();


    updateStatus(
      products.length
        .toLocaleString() +
      " products"
    );


  } catch (error) {

    console.error(
      "BESTR3PS API ERROR:",
      error
    );


    if (
      category ===
      currentCategory
    ) {

      showErrorState(
        "Products could not be loaded."
      );


      updateStatus(
        "Unable to load products"
      );

    }

  } finally {

    loading =
      false;


    if (refreshButton) {

      refreshButton.disabled =
        false;

    }

  }

}


/* =========================================================
   NORMALIZE
   ========================================================= */

function normalizeProducts(
  products
) {

  if (
    !Array.isArray(products)
  ) {

    return [];

  }


  const seen =
    new Set();


  const result = [];


  products.forEach(
    product => {

      if (!product) {
        return;
      }


      const normalized = {

        name:
          String(
            product.name ||
            product.title ||
            product.product ||
            ""
          ).trim(),

        price:
          String(
            product.price ||
            product.usd ||
            ""
          ).trim(),

        sourceUrl:
          String(
            product.sourceUrl ||
            product.url ||
            product.link ||
            ""
          ).trim(),

        imageUrl:
          String(
            product.imageUrl ||
            product.image ||
            ""
          ).trim(),

        productId:
          String(
            product.productId ||
            extractProductId(
              product.sourceUrl ||
              product.url ||
              product.link ||
              ""
            ) ||
            ""
          ).trim()

      };


      if (
        !normalized.name &&
        !normalized.sourceUrl &&
        !normalized.imageUrl
      ) {

        return;

      }


      const key =
        normalized.productId ||
        normalized.sourceUrl ||
        (
          normalized.name +
          "|" +
          normalized.imageUrl
        );


      if (
        seen.has(key)
      ) {

        return;

      }


      seen.add(key);

      result.push(
        normalized
      );

    }
  );


  return result;

}


/* =========================================================
   FILTER
   ========================================================= */

function applyFilterAndRender() {

  const keyword =
    searchKeyword
      .trim()
      .toLowerCase();


  if (!keyword) {

    filteredProducts =
      allProducts.slice();

  } else {

    filteredProducts =
      allProducts.filter(
        product => {

          const text = [

            product.name,

            product.productId,

            product.sourceUrl

          ]
            .join(" ")
            .toLowerCase();


          return text.includes(
            keyword
          );

        }
      );

  }


  currentPage =
    1;


  renderProducts();

}


/* =========================================================
   RENDER
   ========================================================= */

function renderProducts() {

  const grid =
    document.getElementById(
      "productGrid"
    );


  if (!grid) {
    return;
  }


  grid.innerHTML = "";


  const oldLoadMore =
    document.getElementById(
      "loadMoreWrapper"
    );


  if (oldLoadMore) {
    oldLoadMore.remove();
  }


  if (
    filteredProducts.length === 0
  ) {

    showEmptyState();

    updateProductCount(
      0
    );

    return;

  }


  hideEmptyState();


  const visibleCount =
    PAGE_SIZE *
    currentPage;


  const visible =
    filteredProducts.slice(
      0,
      visibleCount
    );


  const fragment =
    document.createDocumentFragment();


  visible.forEach(
    product => {

      fragment.appendChild(
        createProductCard(
          product
        )
      );

    }
  );


  grid.appendChild(
    fragment
  );


  updateProductCount(
    filteredProducts.length
  );


  if (
    visibleCount <
    filteredProducts.length
  ) {

    renderLoadMore();

  }


  requestAnimationFrame(
    setupImageObserver
  );

}


/* =========================================================
   PRODUCT CARD
   ========================================================= */

function createProductCard(
  product
) {

  const card =
    document.createElement(
      "article"
    );


  card.className =
    "product-card";


  const imageWrapper =
    document.createElement(
      "div"
    );


  imageWrapper.className =
    "product-image-wrapper";


  if (product.imageUrl) {

    const image =
      document.createElement(
        "img"
      );


    image.className =
      "product-image";


    image.loading =
      "lazy";


    image.decoding =
      "async";


    image.alt =
      product.name ||
      "Product";


    image.dataset.src =
      product.imageUrl;


    imageWrapper.appendChild(
      image
    );

  } else {

    imageWrapper.innerHTML =
      `
        <div class="no-image">
          NO IMAGE
        </div>
      `;

  }


  const content =
    document.createElement(
      "div"
    );


  content.className =
    "product-content";


  const title =
    document.createElement(
      "div"
    );


  title.className =
    "product-name";


  title.textContent =
    product.name ||
    "Unnamed Product";


  content.appendChild(
    title
  );


  if (product.price) {

    const price =
      document.createElement(
        "div"
      );


    price.className =
      "product-price";


    price.textContent =
      formatPrice(
        product.price
      );


    content.appendChild(
      price
    );

  }


  const button =
    document.createElement(
      "a"
    );


  button.className =
    "product-button";


  button.target =
    "_blank";


  button.rel =
    "noopener noreferrer";


  button.textContent =
    "VIEW PRODUCT";


  if (
    product.sourceUrl
  ) {

    button.href =
      product.sourceUrl;

  } else {

    button.href =
      "#";


    button.classList.add(
      "disabled"
    );

  }


  card.appendChild(
    imageWrapper
  );


  card.appendChild(
    content
  );


  card.appendChild(
    button
  );


  return card;

}


/* =========================================================
   IMAGE LAZY LOAD
   ========================================================= */

let imageObserver = null;


function setupImageObserver() {

  const images =
    document.querySelectorAll(
      "img[data-src]"
    );


  if (
    images.length === 0
  ) {

    return;

  }


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


  if (imageObserver) {

    imageObserver.disconnect();

  }


  imageObserver =
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


              imageObserver.unobserve(
                entry.target
              );

            }

          }
        );

      },
      {
        rootMargin:
          "600px 0px"
      }
    );


  images.forEach(
    image => {

      imageObserver.observe(
        image
      );

    }
  );

}


/* =========================================================
   IMAGE
   ========================================================= */

function loadImage(
  image
) {

  const src =
    image.dataset.src;


  if (!src) {
    return;
  }


  image.onload =
    () => {

      image.classList.add(
        "loaded"
      );

    };


  image.onerror =
    () => {

      image.classList.add(
        "image-error"
      );

    };


  image.src =
    src;


  delete image.dataset.src;

}


/* =========================================================
   LOAD MORE
   ========================================================= */

function renderLoadMore() {

  const wrapper =
    document.createElement(
      "div"
    );


  wrapper.id =
    "loadMoreWrapper";


  wrapper.className =
    "load-more-wrapper";


  const button =
    document.createElement(
      "button"
    );


  button.type =
    "button";


  button.className =
    "load-more-button";


  button.textContent =
    "LOAD MORE";


  button.addEventListener(
    "click",
    () => {

      currentPage++;

      renderProducts();

    }
  );


  wrapper.appendChild(
    button
  );


  const grid =
    document.getElementById(
      "productGrid"
    );


  if (
    grid &&
    grid.parentNode
  ) {

    grid.parentNode.appendChild(
      wrapper
    );

  }

}


/* =========================================================
   LOADING
   ========================================================= */

function showLoadingState() {

  const grid =
    document.getElementById(
      "productGrid"
    );


  if (!grid) {
    return;
  }


  grid.innerHTML = `

    <div class="loading-state">

      <div class="loading-spinner"></div>

      <div>
        Loading products...
      </div>

    </div>

  `;


  hideEmptyState();

}


/* =========================================================
   ERROR
   ========================================================= */

function showErrorState(
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

    <div class="error-state">

      <div>
        ${escapeHtml(message)}
      </div>

      <button
        type="button"
        class="retry-button"
        id="retryButton"
      >
        RETRY
      </button>

    </div>

  `;


  const retry =
    document.getElementById(
      "retryButton"
    );


  if (retry) {

    retry.addEventListener(
      "click",
      () => {

        categoryCache.delete(
          currentCategory
        );


        loadCategory(
          currentCategory,
          true
        );

      }
    );

  }

}


/* =========================================================
   EMPTY
   ========================================================= */

function showEmptyState() {

  const message =
    document.getElementById(
      "emptyMessage"
    );


  if (message) {

    message.style.display =
      "flex";

  }

}


function hideEmptyState() {

  const message =
    document.getElementById(
      "emptyMessage"
    );


  if (message) {

    message.style.display =
      "none";

  }

}


/* =========================================================
   STATUS
   ========================================================= */

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


/* =========================================================
   COUNT
   ========================================================= */

function updateProductCount(
  count
) {

  document
    .querySelectorAll(
      "[data-product-count]"
    )
    .forEach(
      element => {

        element.textContent =
          count.toLocaleString();

      }
    );

}


/* =========================================================
   PRICE
   ========================================================= */

function formatPrice(
  price
) {

  if (!price) {
    return "";
  }


  const value =
    String(price).trim();


  if (
    value.includes("$") ||
    value.includes("USD") ||
    value.includes("€") ||
    value.includes("EUR") ||
    value.includes("£")
  ) {

    return value;

  }


  return "$" + value;

}


/* =========================================================
   ID
   ========================================================= */

function extractProductId(
  url
) {

  if (!url) {
    return "";
  }


  const patterns = [

    /itemID[=\/](\d+)/i,

    /goodsId[=\/](\d+)/i,

    /product[=\/](\d+)/i,

    /\/(\d{7,})/

  ];


  for (
    const pattern of patterns
  ) {

    const match =
      String(url).match(
        pattern
      );


    if (match) {

      return match[1];

    }

  }


  return "";

}


/* =========================================================
   ESCAPE
   ========================================================= */

function escapeHtml(
  text
) {

  return String(text)

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}


/* =========================================================
   DEBOUNCE
   ========================================================= */

function debounce(
  func,
  wait
) {

  let timeout;


  return function (...args) {

    clearTimeout(
      timeout
    );


    timeout =
      setTimeout(
        () => {

          func.apply(
            this,
            args
          );

        },
        wait
      );

  };

}


/* =========================================================
   GLOBAL
   ========================================================= */

window.BESTR3PS = {

  loadCategory,

  switchCategory,

  renderProducts,

  applyFilterAndRender

};
