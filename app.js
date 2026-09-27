/* =========================================================
   BESTR3PS - app.js
   FIRST GOOGLE SHEET VERSION
   ========================================================= */

const API_URL =
  "https://script.google.com/macros/s/AKfycbxtFiRVCd9Y1MZ6l8-YlmmzRa97RZ6xppFLYoQgTEOBddtlx6wE6q9PnUaCdu3D94BR/exec";


const PAGE_SIZE = 30;


/* =========================================================
   CATEGORIES
   ========================================================= */

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


/* =========================================================
   STATE
   ========================================================= */

let categoryProducts = {};

let allProducts = [];

let filteredProducts = [];

let currentCategory =
  "SNEAKERS";

let currentPage = 1;

let searchKeyword = "";

let isLoading = false;

let apiLoaded = false;


/* =========================================================
   INIT
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  init
);


function init() {

  setupEvents();

  renderCategoryButtons();

  showLoadingState();

  loadAllProducts();

}


/* =========================================================
   EVENTS
   ========================================================= */

function setupEvents() {

  /*
    SEARCH
  */

  const searchInput =
    document.getElementById(
      "searchInput"
    );


  if (searchInput) {

    searchInput.addEventListener(
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

  }


  /*
    SEARCH BUTTON
  */

  const searchButton =
    document.getElementById(
      "searchButton"
    );


  if (searchButton) {

    searchButton.addEventListener(
      "click",
      performSearch
    );

  }


  /*
    ENTER KEY
  */

  if (searchInput) {

    searchInput.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Enter"
        ) {

          performSearch();

        }

      }
    );

  }


  /*
    REFRESH
  */

  const refreshButton =
    document.getElementById(
      "refreshBtn"
    );


  if (refreshButton) {

    refreshButton.addEventListener(
      "click",
      () => {

        if (!isLoading) {
          loadAllProducts(true);
        }

      }
    );

  }

}


function performSearch() {

  const input =
    document.getElementById(
      "searchInput"
    );


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


/* =========================================================
   CATEGORY BUTTONS
   ========================================================= */

function renderCategoryButtons() {

  const container =
    document.getElementById(
      "categoryNav"
    );


  if (!container) {
    return;
  }


  container.innerHTML = "";


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


  container.appendChild(
    wrapper
  );

}


/* =========================================================
   SWITCH CATEGORY
   ========================================================= */

function switchCategory(
  category
) {

  currentCategory =
    category;


  currentPage = 1;

  searchKeyword = "";


  const searchInput =
    document.getElementById(
      "searchInput"
    );


  if (searchInput) {
    searchInput.value = "";
  }


  /*
    Update active button
  */

  document
    .querySelectorAll(
      ".category-btn"
    )
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.category ===
        category
      );

    });


  /*
    If API hasn't finished,
    show loading.
  */

  if (!apiLoaded) {

    showLoadingState();

    return;

  }


  allProducts =
    categoryProducts[
      category
    ] || [];


  applyFilterAndRender();

}


/* =========================================================
   LOAD ALL PRODUCTS
   ========================================================= */

async function loadAllProducts(
  forceRefresh = false
) {

  if (isLoading) {
    return;
  }


  isLoading = true;


  showLoadingState();


  updateStatus(
    "Loading products..."
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

    /*
      Cache bust only when refreshing.
    */

    let url =
      API_URL;


    if (forceRefresh) {

      url +=
        "?t=" +
        Date.now();

    }


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
          : "API returned an error"
      );

    }


    /*
      Read category data.
    */

    const newCategoryProducts =
      {};


    CATEGORIES.forEach(
      category => {

        let products = [];


        /*
          New API format
        */

        if (
          data.categories &&
          Array.isArray(
            data.categories[
              category.key
            ]
          )
        ) {

          products =
            data.categories[
              category.key
            ];

        }


        /*
          Backward compatibility
        */

        else if (
          Array.isArray(
            data[
              category.key
            ]
          )
        ) {

          products =
            data[
              category.key
            ];

        }


        /*
          Normalize products
        */

        newCategoryProducts[
          category.key
        ] =
          normalizeProducts(
            products
          );

      }
    );


    categoryProducts =
      newCategoryProducts;


    apiLoaded =
      true;


    allProducts =
      categoryProducts[
        currentCategory
      ] || [];


    currentPage = 1;


    applyFilterAndRender();


    /*
      Total number of products
    */

    const total =
      Object.values(
        categoryProducts
      )
      .reduce(
        (
          sum,
          products
        ) =>
          sum +
          products.length,
        0
      );


    updateStatus(
      total.toLocaleString() +
      " products"
    );


  } catch (error) {

    console.error(
      "BESTR3PS ERROR:",
      error
    );


    apiLoaded =
      false;


    showErrorState(
      "Products could not be loaded."
    );


    updateStatus(
      "Unable to load products"
    );


  } finally {

    isLoading =
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


      const name =
        product.name ||
        product.title ||
        product.product ||
        "";


      const price =
        product.price ||
        product.usd ||
        "";


      const sourceUrl =
        product.sourceUrl ||
        product.url ||
        product.link ||
        "";


      const imageUrl =
        product.imageUrl ||
        product.image ||
        "";


      const productId =
        product.productId ||
        extractProductId(
          sourceUrl
        );


      const normalized = {

        name:
          String(name)
            .trim(),

        price:
          String(price)
            .trim(),

        sourceUrl:
          String(sourceUrl)
            .trim(),

        imageUrl:
          String(imageUrl)
            .trim(),

        productId:
          String(
            productId || ""
          ).trim()

      };


      /*
        Ignore completely empty records.
      */

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
   SEARCH / FILTER
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


  currentPage = 1;

  renderProducts();

}


/* =========================================================
   RENDER PRODUCTS
   ========================================================= */

function renderProducts() {

  const container =
    document.getElementById(
      "productGrid"
    );


  if (!container) {
    return;
  }


  container.innerHTML = "";


  /*
    Remove old load more.
  */

  const oldLoadMore =
    document.getElementById(
      "loadMoreWrapper"
    );


  if (oldLoadMore) {
    oldLoadMore.remove();
  }


  /*
    Empty
  */

  if (
    filteredProducts.length === 0
  ) {

    showEmptyState();

    updateProductCount(0);

    return;

  }


  hideEmptyState();


  /*
    Current visible products
  */

  const visibleCount =
    PAGE_SIZE *
    currentPage;


  const visibleProducts =
    filteredProducts.slice(
      0,
      visibleCount
    );


  const fragment =
    document.createDocumentFragment();


  visibleProducts.forEach(
    product => {

      fragment.appendChild(
        createProductCard(
          product
        )
      );

    }
  );


  container.appendChild(
    fragment
  );


  updateProductCount(
    filteredProducts.length
  );


  /*
    Load more
  */

  if (
    visibleCount <
    filteredProducts.length
  ) {

    renderLoadMore(
      visibleCount
    );

  }


  /*
    Start image loading
  */

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


  /*
    IMAGE
  */

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

    imageWrapper.innerHTML = `
      <div class="no-image">
        NO IMAGE
      </div>
    `;

  }


  /*
    CONTENT
  */

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


  /*
    PRICE
  */

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


  /*
    BUTTON
  */

  const button =
    document.createElement(
      "a"
    );


  button.className =
    "product-button";


  button.textContent =
    "VIEW PRODUCT";


  button.target =
    "_blank";


  button.rel =
    "noopener noreferrer";


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


    button.addEventListener(
      "click",
      event => {
        event.preventDefault();
      }
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
   IMAGE OBSERVER
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
          "500px 0px"
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
   LOAD IMAGE
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

function renderLoadMore(
  visibleCount
) {

  const old =
    document.getElementById(
      "loadMoreWrapper"
    );


  if (old) {
    old.remove();
  }


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


  button.className =
    "load-more-button";


  button.type =
    "button";


  button.textContent =
    "LOAD MORE";


  button.addEventListener(
    "click",
    () => {

      currentPage++;


      const previousHeight =
        document.body.scrollHeight;


      renderProducts();


      /*
        Keep the page position stable.
      */

      if (
        document.body.scrollHeight <
        previousHeight
      ) {

        window.scrollTo(
          0,
          window.scrollY
        );

      }

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

  const container =
    document.getElementById(
      "productGrid"
    );


  if (!container) {
    return;
  }


  container.innerHTML = `

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

  const container =
    document.getElementById(
      "productGrid"
    );


  if (!container) {
    return;
  }


  container.innerHTML = `

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

        loadAllProducts(
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
   PRODUCT COUNT
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
   PRODUCT ID
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
   ESCAPE HTML
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

  loadAllProducts,

  switchCategory,

  applyFilterAndRender,

  renderProducts

};
