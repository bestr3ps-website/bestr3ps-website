const API_URL =
  "https://script.google.com/macros/s/AKfycbxtFiRVCd9Y1MZ6l8-YlmmzRa97RZ6xppFLYoQgTEOBddtlx6wE6q9PnUaCdu3D94BR/exec";


/* =========================================================
   CATEGORIES
   ========================================================= */

const CATEGORIES = [
  "SNEAKERS",
  "T-SHIRTS/SHORTS",
  "HOODIE/PANTS",
  "DOWNJACKET",
  "ACCESSORIES",
  "BAGS",
  "HOTSALE"
];


/* =========================================================
   STATE
   ========================================================= */

let allProducts = [];

let currentCategory = "ALL";

let currentAgent = "LITBUY";

let isLoading = false;


/* =========================================================
   INIT
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    setupCategoryButtons();

    setupAgentButtons();

    setupSearch();

    setupHeroSearch();

    setupRefresh();

    setupMobileMenu();

    loadProducts();

  }
);


/* =========================================================
   LOAD PRODUCTS
   ========================================================= */

async function loadProducts() {

  if (isLoading) return;

  isLoading = true;

  setStatus("Loading products...");

  const grid =
    document.getElementById(
      "productGrid"
    );

  if (grid) {
    grid.innerHTML = `
      <div class="loadingState">
        Loading products...
      </div>
    `;
  }

  try {

    const response =
      await fetch(
        API_URL +
        "?t=" +
        Date.now(),
        {
          method: "GET",
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


    if (!data || data.success === false) {

      throw new Error(
        data && data.error
          ? data.error
          : "Invalid API response"
      );
    }


    /*
     * 支持：
     *
     * {
     *   success:true,
     *   data:{
     *      SNEAKERS:[...],
     *      ...
     *   }
     * }
     */

    const source =
      data.data || data;


    allProducts = [];


    CATEGORIES.forEach(
      category => {

        const items =
          Array.isArray(
            source[category]
          )
            ? source[category]
            : [];


        items.forEach(
          product => {

            allProducts.push({

              name:
                product.name || "",

              link:
                product.link || "",

              price:
                product.price || "",

              image:
                product.image || "",

              category:
                category

            });

          }
        );

      }
    );


    allProducts =
      removeDuplicates(
        allProducts
      );


    renderProducts();


  } catch (error) {

    console.error(error);

    allProducts = [];

    const grid =
      document.getElementById(
        "productGrid"
      );

    if (grid) {

      grid.innerHTML = `
        <div class="loadingState">
          Unable to load products
        </div>
      `;

    }

    setStatus(
      "Unable to load products"
    );

  } finally {

    isLoading = false;

  }
}


/* =========================================================
   RENDER
   ========================================================= */

function renderProducts() {

  const grid =
    document.getElementById(
      "productGrid"
    );

  if (!grid) return;


  let visibleProducts =
    allProducts;


  /* CATEGORY */

  if (
    currentCategory !== "ALL"
  ) {

    visibleProducts =
      visibleProducts.filter(
        product =>
          product.category ===
          currentCategory
      );

  }


  /* SEARCH */

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


  if (search) {

    visibleProducts =
      visibleProducts.filter(
        product => {

          const name =
            String(
              product.name || ""
            ).toLowerCase();

          const category =
            String(
              product.category || ""
            ).toLowerCase();

          const link =
            String(
              product.link || ""
            ).toLowerCase();

          return (
            name.includes(search) ||
            category.includes(search) ||
            link.includes(search)
          );

        }
      );

  }


  setStatus(
    `${visibleProducts.length} products loaded`
  );


  if (
    visibleProducts.length === 0
  ) {

    grid.innerHTML = `
      <div class="loadingState">
        No products found
      </div>
    `;

    return;
  }


  grid.innerHTML =
    visibleProducts
      .map(
        product =>
          createProductCard(
            product
          )
      )
      .join("");

}


/* =========================================================
   PRODUCT CARD
   ========================================================= */

function createProductCard(
  product
) {

  const name =
    escapeHtml(
      product.name ||
      "Untitled Product"
    );


  const price =
    escapeHtml(
      product.price || ""
    );


  const category =
    escapeHtml(
      product.category || ""
    );


  const link =
    product.link || "";


  const safeLink =
    escapeAttribute(
      link
    );


  let imageHTML;


  if (product.image) {

    const image =
      escapeAttribute(
        product.image
      );

    imageHTML = `
      <div class="productImageWrap">
        <img
          class="productImage"
          src="${image}"
          alt="${name}"
          loading="lazy"
          referrerpolicy="no-referrer"
          onerror="this.style.display='none'; this.parentElement.querySelector('.imageFallback').style.display='flex';"
        >

        <div
          class="noImage imageFallback"
          style="display:none;"
        >
          NO IMAGE
        </div>
      </div>
    `;

  } else {

    imageHTML = `
      <div class="productImageWrap">
        <div class="noImage">
          NO IMAGE
        </div>
      </div>
    `;

  }


  return `
    <article class="productCard">

      <a
        class="productImageLink"
        href="${safeLink}"
        target="_blank"
        rel="noopener noreferrer"
      >
        ${imageHTML}
      </a>

      <div class="productInfo">

        <div class="productCategory">
          ${category}
        </div>

        <div class="productName">
          ${name}
        </div>

        <div class="productBottom">

          <div class="productPrice">
            ${price}
          </div>

          <a
            class="productButton"
            href="${safeLink}"
            target="_blank"
            rel="noopener noreferrer"
          >
            VIEW →
          </a>

        </div>

      </div>

    </article>
  `;
}


/* =========================================================
   CATEGORY BUTTONS
   ========================================================= */

function setupCategoryButtons() {

  const buttons =
    document.querySelectorAll(
      ".categoryButton"
    );


  buttons.forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          buttons.forEach(
            item =>
              item.classList.remove(
                "active"
              )
          );


          button.classList.add(
            "active"
          );


          currentCategory =
            button.dataset.category ||
            "ALL";


          renderProducts();


          const finds =
            document.getElementById(
              "finds"
            );

          if (finds) {

            window.scrollTo({
              top:
                finds.offsetTop - 70,
              behavior:
                "smooth"
            });

          }

        }
      );

    }
  );

}


/* =========================================================
   AGENTS
   ========================================================= */

function setupAgentButtons() {

  const buttons =
    document.querySelectorAll(
      ".agentButton"
    );


  buttons.forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          buttons.forEach(
            item =>
              item.classList.remove(
                "active"
              )
          );


          button.classList.add(
            "active"
          );


          currentAgent =
            button.dataset.agent ||
            "LITBUY";


          /*
           * Agent selection is kept
           * as the website UI.
           *
           * Product links remain the
           * direct source links from
           * the spreadsheet.
           */

        }
      );

    }
  );

}


/* =========================================================
   SEARCH
   ========================================================= */

function setupSearch() {

  const input =
    document.getElementById(
      "searchInput"
    );


  if (!input) return;


  input.addEventListener(
    "input",
    () => {

      renderProducts();

    }
  );

}


/* =========================================================
   HERO SEARCH
   ========================================================= */

function setupHeroSearch() {

  const input =
    document.getElementById(
      "heroSearchInput"
    );

  const button =
    document.getElementById(
      "heroSearchButton"
    );


  function performSearch() {

    const mainSearch =
      document.getElementById(
        "searchInput"
      );


    if (mainSearch && input) {

      mainSearch.value =
        input.value;

    }


    currentCategory =
      "ALL";


    document
      .querySelectorAll(
        ".categoryButton"
      )
      .forEach(
        item =>
          item.classList.toggle(
            "active",
            item.dataset.category ===
              "ALL"
          )
      );


    renderProducts();


    const finds =
      document.getElementById(
        "finds"
      );


    if (finds) {

      window.scrollTo({
        top:
          finds.offsetTop - 70,
        behavior:
          "smooth"
      });

    }

  }


  if (button) {

    button.addEventListener(
      "click",
      performSearch
    );

  }


  if (input) {

    input.addEventListener(
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

}


/* =========================================================
   REFRESH
   ========================================================= */

function setupRefresh() {

  const button =
    document.getElementById(
      "refreshButton"
    );


  if (!button) return;


  button.addEventListener(
    "click",
    () => {

      loadProducts();

    }
  );

}


/* =========================================================
   VIEW ALL
   ========================================================= */

const viewAllButton =
  document.getElementById(
    "viewAllButton"
  );


if (viewAllButton) {

  viewAllButton.addEventListener(
    "click",
    () => {

      currentCategory =
        "ALL";


      document
        .querySelectorAll(
          ".categoryButton"
        )
        .forEach(
          button =>
            button.classList.toggle(
              "active",
              button.dataset.category ===
                "ALL"
            )
        );


      renderProducts();

    }
  );

}


/* =========================================================
   MOBILE MENU
   ========================================================= */

function setupMobileMenu() {

  const button =
    document.getElementById(
      "mobileMenuButton"
    );

  const nav =
    document.getElementById(
      "mobileNav"
    );


  if (!button || !nav) return;


  button.addEventListener(
    "click",
    () => {

      nav.classList.toggle(
        "open"
      );

    }
  );


  nav
    .querySelectorAll("a")
    .forEach(
      link => {

        link.addEventListener(
          "click",
          () => {

            nav.classList.remove(
              "open"
            );

          }
        );

      }
    );

}


/* =========================================================
   STATUS
   ========================================================= */

function setStatus(
  text
) {

  const status =
    document.getElementById(
      "productStatus"
    );


  if (status) {

    status.textContent =
      text;

  }

}


/* =========================================================
   DEDUPE
   ========================================================= */

function removeDuplicates(
  products
) {

  const seen =
    new Set();

  const result = [];


  products.forEach(
    product => {

      const key =
        product.link ||
        (
          product.name +
          "|" +
          product.price +
          "|" +
          product.category
        );


      if (
        !key ||
        seen.has(key)
      ) {

        return;

      }


      seen.add(key);

      result.push(product);

    }
  );


  return result;
}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

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


function escapeAttribute(
  value
) {

  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    );

}
