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

const categoryCache = {};

let imageObserver = null;


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


      button.type = "button";

      button.textContent =
        category;


      /*
        保持原来的 CSS
      */

      button.className =
        "category-button";


      if (
        category ===
        currentCategory
      ) {

        button.classList.add(
          "active"
        );
      }


      button.onclick =
        function () {

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


  /*
    有缓存直接显示
  */

  if (
    categoryCache[
      category
    ]
  ) {

    currentProducts =
      categoryCache[
        category
      ];

    renderProducts();

    return;
  }


  showLoading();


  try {

    const url =
      API_URL +
      "?category=" +
      encodeURIComponent(
        category
      ) +
      "&v=3";


    const response =
      await fetch(
        url,
        {
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
      data &&
      Array.isArray(
        data.products
      )
    ) {

      currentProducts =
        data.products;

    } else {

      currentProducts = [];
    }


    /*
      只有有商品才缓存
    */

    if (
      currentProducts.length
    ) {

      categoryCache[
        category
      ] = currentProducts;
    }


    renderProducts();


  } catch (error) {

    console.error(
      error
    );

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


  const search =
    document.getElementById(
      "searchInput"
    );


  const keyword =
    search
      ? search.value
          .trim()
          .toLowerCase()
      : "";


  let products =
    currentProducts;


  if (keyword) {

    products =
      products.filter(
        product =>
          String(
            product.name || ""
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
        createProductCard
      )
      .join("");


  if (
    products.length >
    visibleCount
  ) {

    const loadMore =
      document.createElement(
        "button"
      );


    loadMore.type =
      "button";


    loadMore.className =
      "load-more";


    loadMore.textContent =
      "LOAD MORE";


    loadMore.onclick =
      function () {

        visibleCount +=
          PAGE_SIZE;

        renderProducts();
      };


    grid.appendChild(
      loadMore
    );
  }


  setupImageObserver();


  updateStatus(
    products.length +
      " products"
  );
}


/* =========================
   商品卡片
========================= */

function createProductCard(
  product
) {

  const name =
    escapeHtml(
      product.name ||
      "Product"
    );


  const price =
    escapeHtml(
      product.price ||
      ""
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
        href="${escapeHtml(url)}"
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
                  data-src="${escapeHtml(
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

function setupImageObserver() {

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


  if (imageObserver) {

    imageObserver.disconnect();
  }


  imageObserver =
    new IntersectionObserver(
      function (entries) {

        entries.forEach(
          function (entry) {

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
          "500px"
      }
    );


  images.forEach(
    function (image) {

      imageObserver.observe(
        image
      );
    }
  );
}


function loadImage(img) {

  const src =
    img.dataset.src;


  if (!src) return;


  img.src = src;


  img.removeAttribute(
    "data-src"
  );


  img.onerror =
    function () {

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
    function () {

      clearTimeout(timer);


      timer =
        setTimeout(
          function () {

            visibleCount =
              PAGE_SIZE;

            renderProducts();

          },
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
    function () {

      delete categoryCache[
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


  grid.innerHTML = `
    <div class="loading">
      Loading products...
    </div>
  `;


  hideEmpty();


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


  grid.innerHTML = `
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
