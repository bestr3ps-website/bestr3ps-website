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


let currentCategory =
  CATEGORIES[0];

let currentProducts = [];

let visibleCount =
  PAGE_SIZE;

const cache = {};

let observer;


/* =========================
   初始化
========================= */

document.addEventListener(
  "DOMContentLoaded",
  init
);


function init() {

  renderCategories();

  setupSearch();

  setupRefresh();

  loadCategory(
    currentCategory
  );
}


/* =========================
   分类
========================= */

function renderCategories() {

  const nav =
    document.getElementById(
      "categoryNav"
    );

  if (!nav) return;

  nav.innerHTML = "";

  CATEGORIES.forEach(
    category => {

      const button =
        document.createElement(
          "button"
        );

      button.textContent =
        category;

      if (
        category ===
        currentCategory
      ) {
        button.classList.add(
          "active"
        );
      }

      button.onclick =
        () => {

          currentCategory =
            category;

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

          button.classList.add(
            "active"
          );

          loadCategory(
            category
          );
        };

      nav.appendChild(
        button
      );
    }
  );
}


/* =========================
   加载分类
========================= */

async function loadCategory(
  category
) {

  visibleCount =
    PAGE_SIZE;

  currentProducts = [];

  showLoading();


  /*
    已经加载过：
    直接显示
  */

  if (
    cache[category]
  ) {

    currentProducts =
      cache[category];

    renderProducts();

    return;
  }


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
          cache: "default"
        }
      );


    if (!response.ok) {
      throw new Error(
        response.status
      );
    }


    const data =
      await response.json();


    currentProducts =
      Array.isArray(
        data.products
      )
        ? data.products
        : [];


    cache[category] =
      currentProducts;


    renderProducts();

  } catch (error) {

    console.error(error);

    showError();
  }
}


/* =========================
   商品
========================= */

function renderProducts() {

  const grid =
    document.getElementById(
      "productGrid"
    );

  if (!grid) return;


  const input =
    document.getElementById(
      "searchInput"
    );


  const keyword =
    input
      ? input.value
          .trim()
          .toLowerCase()
      : "";


  let products =
    currentProducts;


  if (keyword) {

    products =
      products.filter(
        p =>
          String(
            p.name || ""
          )
            .toLowerCase()
            .includes(
              keyword
            )
      );
  }


  if (!products.length) {

    grid.innerHTML = "";

    showEmpty();

    return;
  }


  hideEmpty();


  const visible =
    products.slice(
      0,
      visibleCount
    );


  grid.innerHTML =
    visible
      .map(
        createCard
      )
      .join("");


  if (
    products.length >
    visibleCount
  ) {

    const button =
      document.createElement(
        "button"
      );

    button.className =
      "load-more";

    button.textContent =
      "LOAD MORE";


    button.onclick =
      () => {

        visibleCount +=
          PAGE_SIZE;

        renderProducts();
      };


    grid.appendChild(
      button
    );
  }


  lazyLoadImages();

  updateStatus(
    products.length +
      " products"
  );
}


/* =========================
   商品卡片
========================= */

function createCard(
  product
) {

  const name =
    escape(
      product.name ||
      "Product"
    );

  const price =
    escape(
      product.price || ""
    );

  const image =
    product.imageUrl ||
    "";

  const url =
    product.sourceUrl ||
    "#";


  return `
    <div class="product-card">

      <a
        href="${escape(url)}"
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
                  data-src="${escape(
                    image
                  )}"
                  alt="${name}"
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


/* =========================
   图片懒加载
========================= */

function lazyLoadImages() {

  const images =
    document.querySelectorAll(
      ".lazy-image"
    );


  if (
    !("IntersectionObserver" in window)
  ) {

    images.forEach(
      loadImage
    );

    return;
  }


  if (observer) {
    observer.disconnect();
  }


  observer =
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

              observer.unobserve(
                entry.target
              );
            }
          }
        );

      },
      {
        rootMargin:
          "600px"
      }
    );


  images.forEach(
    img =>
      observer.observe(img)
  );
}


function loadImage(img) {

  const src =
    img.dataset.src;

  if (!src) return;

  img.src = src;

  delete img.dataset.src;

  img.onerror =
    () => {

      img.style.display =
        "none";
    };
}


/* =========================
   搜索
========================= */

function setupSearch() {

  const input =
    document.getElementById(
      "searchInput"
    );

  if (!input) return;


  let timer;


  input.addEventListener(
    "input",
    () => {

      clearTimeout(timer);

      timer =
        setTimeout(
          renderProducts,
          150
        );
    }
  );
}


/* =========================
   刷新
========================= */

function setupRefresh() {

  const button =
    document.getElementById(
      "refreshBtn"
    );

  if (!button) return;


  button.onclick =
    () => {

      delete cache[
        currentCategory
      ];

      loadCategory(
        currentCategory
      );
    };
}


/* =========================
   状态
========================= */

function showLoading() {

  const grid =
    document.getElementById(
      "productGrid"
    );

  if (!grid) return;

  grid.innerHTML =
    `
      <div class="loading">
        Loading products...
      </div>
    `;

  updateStatus(
    "Loading..."
  );
}


function showError() {

  const grid =
    document.getElementById(
      "productGrid"
    );

  if (!grid) return;

  grid.innerHTML =
    `
      <div class="loading">
        Failed to load products.
      </div>
    `;

  updateStatus(
    "Load failed"
  );
}


function showEmpty() {

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


function hideEmpty() {

  const empty =
    document.getElementById(
      "emptyMessage"
    );

  if (empty) {

    empty.style.display =
      "none";
  }
}


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


/* =========================
   安全
========================= */

function escape(value) {

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
