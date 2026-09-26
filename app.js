/* =========================================================
   BESTR3PS
   Google Sheets → Apps Script → Website

   IMPORTANT:
   Backend/API is NOT changed.
========================================================= */


const API_URL =
  "https://script.google.com/macros/s/AKfycbxn9DVmH7b3isG3CyaNEJ7b6DrGrLimfIc7YVX9YU1NkAftIfcQPNyFNKFP8ko_d7JX/exec";


let products = [];


// =========================================================
// ONLY THESE 6 CATEGORIES
// =========================================================

const categories = [
  "SNEAKERS",
  "T-SHIRTS/SHORTS",
  "HOODIE/PANTS",
  "DOWNJACKET",
  "ACCESSORIES",
  "BAGS"
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
    status.textContent = "Loading products...";
  }

  try {

    const response =
      await fetch(
        API_URL + "?time=" + Date.now()
      );


    if (!response.ok) {

      throw new Error(
        "HTTP " + response.status
      );

    }


    const data =
      await response.json();


    console.log(
      "BESTR3PS API DATA:",
      data
    );


    if (data.error) {

      throw new Error(
        data.message ||
        "Apps Script error"
      );

    }


    products = [];


    // -----------------------------------------------------
    // ONLY LOAD THE 6 TARGET CATEGORIES
    // -----------------------------------------------------

    categories.forEach(category => {

      let rows =
        data[category];


      /*
       * If API category name has
       * small formatting differences,
       * find it by trimmed lowercase name.
       */

      if (!Array.isArray(rows)) {

        const key =
          Object.keys(data).find(k => {

            return (
              k.trim().toLowerCase() ===
              category.trim().toLowerCase()
            );

          });


        if (key) {

          rows = data[key];

        }

      }


      if (!Array.isArray(rows)) {

        console.log(
          "No array found for:",
          category
        );

        return;

      }


      console.log(
        category,
        "=>",
        rows.length,
        "products"
      );


      rows.forEach(row => {

        if (
          !row ||
          typeof row !== "object"
        ) {

          return;

        }


        const name =
          String(
            row.name || ""
          ).trim();


        const price =
          row.price ?? "";


        const sourceUrl =
          String(
            row.sourceUrl || ""
          ).trim();


        const imageUrl =
          String(
            row.imageUrl || ""
          ).trim();


        if (!name) {
          return;
        }


        if (!sourceUrl) {
          return;
        }


        products.push({

          category: category,

          name: name,

          price: price,

          sourceUrl: sourceUrl,

          imageUrl: imageUrl,

          productId:
            extractProductId(
              sourceUrl
            )

        });

      });

    });


    console.log(
      "BESTR3PS TOTAL PRODUCTS:",
      products.length
    );


    renderCategoryTiles();

    renderCategories();

    renderProducts();


    const statusText =
      document.getElementById("status");


    if (statusText) {

      statusText.textContent =
        products.length +
        " products loaded";

    }


  } catch (error) {

    console.error(
      "BESTR3PS LOAD ERROR:",
      error
    );


    const statusElement =
      document.getElementById("status");


    if (statusElement) {

      statusElement.textContent =
        "Failed to load products";

    }


    alert(
      "无法读取 Google Sheet。\n\n" +
      "错误：" +
      error.message
    );

  }

}


// =========================================================
// EXTRACT PRODUCT ID
// =========================================================

function extractProductId(url) {

  if (!url) {

    return "";

  }


  // Litbuy
  let match =
    url.match(
      /\/product\/[^/]+\/(\d+)/i
    );


  if (match) {

    return match[1];

  }


  // Weidian itemID
  match =
    url.match(
      /[?&]itemID=(\d+)/i
    );


  if (match) {

    return match[1];

  }


  // Rizzitgo goodsId
  match =
    url.match(
      /[?&]goodsId=(\d+)/i
    );


  if (match) {

    return match[1];

  }


  // Generic id
  match =
    url.match(
      /[?&]id=(\d+)/i
    );


  if (match) {

    return match[1];

  }


  return "";

}


// =========================================================
// GET AGENT PRODUCT URL
// =========================================================

function getProductUrl(product) {

  const id =
    product.productId;


  // If ID cannot be extracted,
  // keep original Litbuy URL.
  if (!id) {

    return product.sourceUrl;

  }


  // -------------------------------------------------------
  // LITBUY
  // -------------------------------------------------------

  if (
    currentAgent === "litbuy"
  ) {

    return product.sourceUrl;

  }


  // -------------------------------------------------------
  // OOPBUY
  // -------------------------------------------------------

  if (
    currentAgent === "oopbuy"
  ) {

    return (
      "https://oopbuy.com/product/weidian/" +
      id
    );

  }


  // -------------------------------------------------------
  // KAKOBUY
  // -------------------------------------------------------

  if (
    currentAgent === "kakobuy"
  ) {

    const weidianUrl =
      "https://weidian.com/item.html?itemID=" +
      id;


    return (
      "https://item.kakobuy.com/item/details?url=" +
      encodeURIComponent(
        weidianUrl
      )
    );

  }


  // -------------------------------------------------------
  // HIPOBUY
  // -------------------------------------------------------

  if (
    currentAgent === "hipobuy"
  ) {

    return (
      "https://hipobuy.com/product/weidian/" +
      id
    );

  }


  // -------------------------------------------------------
  // LOVEGOBUY
  // -------------------------------------------------------

  if (
    currentAgent === "lovegobuy"
  ) {

    return (
      "https://lovegobuy.com/product?id=" +
      id +
      "&shop_type=weidian"
    );

  }


  // -------------------------------------------------------
  // RIZZITGO
  // -------------------------------------------------------

  if (
    currentAgent === "rizzitgo"
  ) {

    return (
      "https://rizzitgo.com/detail-page/?goodsId=" +
      id +
      "&source=3&rno=75FB20"
    );

  }


  // -------------------------------------------------------
  // BOONBUY
  // -------------------------------------------------------

  if (
    currentAgent === "boonbuy"
  ) {

    return (
      "https://boonbuy.com/product/2/" +
      id
    );

  }


  // -------------------------------------------------------
  // USFANS
  // -------------------------------------------------------

  if (
    currentAgent === "usfans"
  ) {

    return (
      "https://usfans.com/product/3/" +
      id
    );

  }


  return product.sourceUrl;

}


// =========================================================
// CATEGORY TILES ON HOMEPAGE
// =========================================================

function renderCategoryTiles() {

  const container =
    document.getElementById(
      "categoryTiles"
    );


  if (!container) {
    return;
  }


  container.innerHTML = "";


  categories.forEach(
    (category, index) => {

      const tile =
        document.createElement(
          "div"
        );


      tile.className =
        "categoryTile";


      const number =
        document.createElement(
          "div"
        );


      number.className =
        "categoryTileNumber";


      number.textContent =
        String(index + 1).padStart(
          2,
          "0"
        );


      const name =
        document.createElement(
          "div"
        );


      name.className =
        "categoryTileName";


      name.textContent =
        category;


      tile.appendChild(number);

      tile.appendChild(name);


      tile.addEventListener(
        "click",
        function() {

          currentCategory =
            category;


          renderCategories();

          renderProducts();


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
      );


      container.appendChild(tile);

    }
  );

}


// =========================================================
// CATEGORY FILTER BUTTONS
// =========================================================

function renderCategories() {

  const nav =
    document.getElementById(
      "categoryNav"
    );


  if (!nav) {
    return;
  }


  nav.innerHTML = "";


  // ALL
  const allButton =
    document.createElement(
      "button"
    );


  allButton.className =
    "categoryButton " +
    (
      currentCategory === "ALL"
        ? "active"
        : ""
    );


  allButton.textContent =
    "ALL";


  allButton.onclick =
    function() {

      currentCategory =
        "ALL";


      renderCategories();

      renderProducts();

    };


  nav.appendChild(
    allButton
  );


  // Six categories
  categories.forEach(
    category => {

      const button =
        document.createElement(
          "button"
        );


      button.className =
        "categoryButton " +
        (
          currentCategory === category
            ? "active"
            : ""
        );


      button.textContent =
        category;


      button.onclick =
        function() {

          currentCategory =
            category;


          renderCategories();

          renderProducts();

        };


      nav.appendChild(
        button
      );

    }
  );

}


// =========================================================
// RENDER PRODUCTS
// =========================================================

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


  const heroSearchInput =
    document.getElementById(
      "heroSearchInput"
    );


  let search = "";


  if (searchInput) {

    search =
      searchInput.value
        .trim()
        .toLowerCase();

  }


  /*
   * Hero search is used when the
   * main search box is empty.
   */

  if (
    !search &&
    heroSearchInput
  ) {

    search =
      heroSearchInput.value
        .trim()
        .toLowerCase();

  }


  grid.innerHTML = "";


  const filtered =
    products.filter(
      product => {

        const categoryMatch =
          currentCategory === "ALL" ||
          product.category ===
          currentCategory;


        const searchMatch =
          !search ||
          product.name
            .toLowerCase()
            .includes(search);


        return (
          categoryMatch &&
          searchMatch
        );

      }
    );


  const empty =
    document.getElementById(
      "emptyMessage"
    );


  if (empty) {

    empty.style.display =
      filtered.length === 0
        ? "block"
        : "none";

  }


  filtered.forEach(
    product => {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "productCard";


      // ---------------------------------------------------
      // IMAGE
      // ---------------------------------------------------

      const image =
        document.createElement(
          "div"
        );


      image.className =
        "productImage";


      if (product.imageUrl) {

        const img =
          document.createElement(
            "img"
          );


        img.src =
          product.imageUrl;


        img.alt =
          product.name;


        img.loading =
          "lazy";


        img.decoding =
          "async";


        img.onerror =
          function() {

            this.style.display =
              "none";


            if (
              !image.querySelector(
                ".imageFallback"
              )
            ) {

              const fallback =
                document.createElement(
                  "span"
                );


              fallback.className =
                "imageFallback";


              fallback.textContent =
                "IMAGE";


              image.appendChild(
                fallback
              );

            }

          };


        image.appendChild(
          img
        );

      } else {

        image.textContent =
          "IMAGE";

      }


      // ---------------------------------------------------
      // INFO
      // ---------------------------------------------------

      const info =
        document.createElement(
          "div"
        );


      info.className =
        "productInfo";


      // Product name
      const name =
        document.createElement(
          "div"
        );


      name.className =
        "productName";


      name.textContent =
        product.name;


      // Price
      const price =
        document.createElement(
          "div"
        );


      price.className =
        "productPrice";


      if (
        product.price !== "" &&
        product.price !== null &&
        product.price !== undefined
      ) {

        const priceText =
          String(product.price);


        price.textContent =
          priceText.startsWith("$")
            ? priceText
            : "$" + priceText;

      }


      // Product link
      const link =
        document.createElement(
          "a"
        );


      link.className =
        "viewButton";


      link.textContent =
        "VIEW PRODUCT";


      link.href =
        getProductUrl(
          product
        );


      link.target =
        "_blank";


      link.rel =
        "noopener noreferrer";


      // Category
      const category =
        document.createElement(
          "div"
        );


      category.className =
        "productCategory";


      category.textContent =
        product.category;


      // Assemble
      info.appendChild(
        name
      );

      info.appendChild(
        price
      );

      info.appendChild(
        link
      );

      info.appendChild(
        category
      );


      card.appendChild(
        image
      );

      card.appendChild(
        info
      );


      grid.appendChild(
        card
      );

    }
  );


  const status =
    document.getElementById(
      "status"
    );


  if (status) {

    if (
      currentCategory === "ALL"
    ) {

      status.textContent =
        filtered.length +
        " products";

    } else {

      status.textContent =
        filtered.length +
        " products · " +
        currentCategory;

    }

  }

}


// =========================================================
// SYNC AGENT SELECTORS
// =========================================================

function setAgent(agent) {

  currentAgent =
    agent;


  const mainSelect =
    document.getElementById(
      "agentSelect"
    );


  const desktopSelect =
    document.getElementById(
      "desktopAgentSelect"
    );


  if (mainSelect) {

    mainSelect.value =
      agent;

  }


  if (desktopSelect) {

    desktopSelect.value =
      agent;

  }


  renderProducts();

}


// =========================================================
// MAIN HEADER AGENT
// =========================================================

const agentSelect =
  document.getElementById(
    "agentSelect"
  );


if (agentSelect) {

  agentSelect.addEventListener(
    "change",
    function(event) {

      setAgent(
        event.target.value
      );

    }
  );

}


// =========================================================
// DESKTOP AGENT
// =========================================================

const desktopAgentSelect =
  document.getElementById(
    "desktopAgentSelect"
  );


if (desktopAgentSelect) {

  desktopAgentSelect.addEventListener(
    "change",
    function(event) {

      setAgent(
        event.target.value
      );

    }
  );

}


// =========================================================
// SEARCH
// =========================================================

const searchInput =
  document.getElementById(
    "searchInput"
  );


if (searchInput) {

  searchInput.addEventListener(
    "input",
    function() {

      const heroSearch =
        document.getElementById(
          "heroSearchInput"
        );


      if (heroSearch) {

        heroSearch.value =
          searchInput.value;

      }


      renderProducts();

    }
  );

}


// =========================================================
// HERO SEARCH
// =========================================================

const heroSearchInput =
  document.getElementById(
    "heroSearchInput"
  );


if (heroSearchInput) {

  heroSearchInput.addEventListener(
    "input",
    function() {

      const mainSearch =
        document.getElementById(
          "searchInput"
        );


      if (mainSearch) {

        mainSearch.value =
          heroSearchInput.value;

      }


      renderProducts();

    }
  );

}


// =========================================================
// HERO SEARCH BUTTON
// =========================================================

const heroSearchButton =
  document.getElementById(
    "heroSearchButton"
  );


if (heroSearchButton) {

  heroSearchButton.addEventListener(
    "click",
    function() {

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
  );

}


// =========================================================
// REFRESH
// =========================================================

const refreshBtn =
  document.getElementById(
    "refreshBtn"
  );


if (refreshBtn) {

  refreshBtn.addEventListener(
    "click",
    function() {

      loadProducts();

    }
  );

}


// =========================================================
// MOBILE MENU
// =========================================================

const mobileMenuButton =
  document.getElementById(
    "mobileMenuButton"
  );


const mobileNav =
  document.getElementById(
    "mobileNav"
  );


if (
  mobileMenuButton &&
  mobileNav
) {

  mobileMenuButton.addEventListener(
    "click",
    function() {

      mobileNav.classList.toggle(
        "open"
      );

    }
  );


  mobileNav
    .querySelectorAll("a")
    .forEach(link => {

      link.addEventListener(
        "click",
        function() {

          mobileNav.classList.remove(
            "open"
          );

        }
      );

    });

}


// =========================================================
// LOGO → HOME
// =========================================================

const homeLogo =
  document.getElementById(
    "homeLogo"
  );


if (homeLogo) {

  homeLogo.addEventListener(
    "click",
    function(event) {

      event.preventDefault();

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    }
  );

}


// =========================================================
// START
// =========================================================

loadProducts();
