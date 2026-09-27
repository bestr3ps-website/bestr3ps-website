const API_URL =
  "https://script.google.com/macros/s/AKfycbxtFiRVCd9Y1MZ6l8-YlmmzRa97RZ6xppFLYoQgTEOBddtlx6wE6q9PnUaCdu3D94BR/exec";


const PAGE_SIZE = 30;


const CATEGORIES = [
  "SUMMER Pick",
  "SNEAKERS",
  "T-SHIRTS/SHORTS",
  "HOODIE/PANTS",
  "DOWNJACKET",
  "ACCESSORIES",
  "BAGS"
];


let currentCategory = CATEGORIES[0];

let currentProducts = [];

let visibleCount = PAGE_SIZE;

const categoryCache = {};

let imageObserver = null;


/* ================================
   页面初始化
================================ */

document.addEventListener(
  "DOMContentLoaded",
  init
);


function init() {

  renderCategoryButtons();

  setupSearch();

  setupRefresh();

  showLoadingState();

  loadCategory(currentCategory);
}


/* ================================
   分类按钮
================================ */

function renderCategoryButtons() {

  const nav =
    document.getElementById(
      "categoryNav"
    );

  if (!nav) {
    return;
  }

  nav.innerHTML = "";

  CATEGORIES.forEach(category => {

    const button =
      document.createElement("button");

    button.type = "button";

    button.textContent = category;

    button.className =
      category === currentCategory
        ? "active"
        : "";

    button.addEventListener(
      "click",
      () => {

        currentCategory = category;

        document
          .querySelectorAll(
            "#categoryNav button"
          )
          .forEach(btn => {
            btn.classList.remove("active");
          });

        button.classList.add("active");

        loadCategory(category);
      }
    );

    nav.appendChild(button);
  });
}


/* ================================
   加载分类
================================ */

async function loadCategory(category) {

  visibleCount = PAGE_SIZE;

  currentProducts = [];

  showLoadingState();

  /*
    如果已经加载过，
    直接使用缓存
  */

  if (categoryCache[category]) {

    currentProducts =
      categoryCache[category];

    renderProducts();

    return;
  }


  try {

    const url =
      API_URL +
      "?category=" +
      encodeURIComponent(category) +
      "&t=" +
      Date.now();


    const response =
      await fetch(url, {
        method: "GET",
        cache: "no-store"
      });


    if (!response.ok) {

      throw new Error(
        "HTTP " +
        response.status
      );
    }


    const data =
      await response.json();


    /*
      新版 Apps Script
    */

    if (
      data &&
      Array.isArray(data.products)
    ) {

      currentProducts =
        data.products;

    }

    /*
      兼容旧格式
    */

    else if (
      Array.isArray(data)
    ) {

      currentProducts = data;

    }

    else if (
      data &&
      Array.isArray(data[category])
    ) {

      currentProducts =
        data[category];

    }

    else {

      currentProducts = [];
    }


    /*
      缓存
    */

    categoryCache[category] =
      currentProducts;


    renderProducts();

  } catch (error) {

    console.error(
      "Load products error:",
      error
    );

    showErrorState();
  }
}


/* ================================
   显示商品
================================ */

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
    搜索
  */

  if (keyword) {

    products =
      currentProducts.filter(
        product => {

          const name =
            String(
              product.name ||
              product.title ||
              ""
            ).toLowerCase();

          return name.includes(
            keyword
          );
        }
      );
  }


  /*
    没有商品
  */

  if (!products.length) {

    grid.innerHTML = "";

    showEmptyState();

    return;
  }


  hideEmptyState();


  const visibleProducts =
    products.slice(
      0,
      visibleCount
    );


  grid.innerHTML =
    visibleProducts
      .map(createProductCard)
      .join("");


  /*
    Load More
  */

  if (
    products.length >
    visibleCount
  ) {

    const loadMore =
      document.createElement(
        "button"
      );

    loadMore.type = "button";

    loadMore.className =
      "load-more";

    loadMore.textContent =
      `LOAD MORE (${Math.min(
        PAGE_SIZE,
        products.length - visibleCount
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


  setupImageObserver();


  updateStatus(
    `${products.length} products`
  );
}


/* ================================
   商品卡片
================================ */

function createProductCard(product) {

  const name =
    escapeHtml(
      product.name ||
      product.title ||
      "Product"
    );


  const price =
    escapeHtml(
      product.price ||
      ""
    );


  const image =
    product.imageUrl ||
    product.image ||
    "";


  const url =
    product.sourceUrl ||
    product.url ||
    product.link ||
    "#";


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
                  data-src="${escapeAttribute(image)}"
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


/* ================================
   图片懒加载
================================ */

function setupImageObserver() {

  const images =
    document.querySelectorAll(
      ".lazy-image"
    );


  /*
    浏览器不支持时直接加载
  */

  if (
    !("IntersectionObserver" in window)
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

        entries.forEach(entry => {

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
        });

      },
      {
        rootMargin: "300px"
      }
    );


  images.forEach(image => {

    imageObserver.observe(
      image
    );
  });
}


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


/* ================================
   搜索
================================ */

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

      clearTimeout(timer);


      timer = setTimeout(
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


/* ================================
   刷新
================================ */

function setupRefresh() {

  const button =
    document.getElementById(
      "refreshBtn"
    );


  if (!button) {
    return;
  }


  button.addEventListener(
    "click",
    () => {

      delete categoryCache[
        currentCategory
      ];

      loadCategory(
        currentCategory
      );
    }
  );
}


/* ================================
   Loading
================================ */

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


/* ================================
   Error
================================ */

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


/* ================================
   Empty
================================ */

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


/* ================================
   状态
================================ */

function updateStatus(text) {

  const status =
    document.getElementById(
      "status"
    );


  if (status) {

    status.textContent =
      text;
  }
}


/* ================================
   HTML 安全处理
================================ */

function escapeHtml(value) {

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


function escapeAttribute(value) {

  return escapeHtml(value);
}
