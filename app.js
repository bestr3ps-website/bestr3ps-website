const API_URL =
  "https://script.google.com/macros/s/AKfycbxn9DVm7Hb3isG3CyaNEJ7b6DrGrLimfIc7YVX9YU1NkAftIfcQPNyFNKFP8ko_d7JX/exec";


/*
=========================================================
BESTR3PS FRONTEND
=========================================================
*/


let products = [];


/*
=========================================================
网站只显示这 6 个分类
=========================================================
*/

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

let searchKeyword = "";


/*
=========================================================
页面加载
=========================================================
*/

document.addEventListener(
  "DOMContentLoaded",
  function() {

    loadProducts();

    setupSearch();

    setupAgentSelector();

    setupRefreshButton();

    setupScrollListener();

    setupMobileMenu();

  }
);


/*
=========================================================
加载商品
=========================================================
*/

async function loadProducts() {

  setStatus(
    "Loading products..."
  );


  try {

    const response =
      await fetch(
        API_URL +
        "?time=" +
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


    /*
    Apps Script 错误
    */

    if (data.error) {

      throw new Error(
        data.message ||
        "Apps Script returned an error"
      );

    }


    /*
    清空旧数据
    */

    products = [];


    /*
    只读取六个分类
    */

    categories.forEach(
      function(category) {

        const list =
          Array.isArray(
            data[category]
          )
            ? data[category]
            : [];


        list.forEach(
          function(product) {

            /*
            再次过滤。

            后端已经过滤一次，
            前端再过滤一次。
            */

            if (
              !product ||
              !product.sourceUrl
            ) {

              return;

            }


            if (
              !isValidProductUrl(
                product.sourceUrl
              )
            ) {

              return;

            }


            products.push({

              category:
                category,

              name:
                product.name ||
                "Unnamed Product",

              price:
                product.price ||
                "",

              sourceUrl:
                product.sourceUrl,

              imageUrl:
                product.imageUrl ||
                "",

              productId:
                product.productId ||
                ""

            });

          }
        );

      }
    );


    /*
    初始化
    */

    currentCategory = "ALL";

    searchKeyword = "";


    /*
    清空搜索框
    */

    const searchInput =
      document.getElementById(
        "searchInput"
      );


    if (searchInput) {

      searchInput.value = "";

    }


    /*
    渲染
    */

    renderCategoryTiles();

    renderCategories();

    renderProducts();

    updateStatus();


  } catch (error) {

    console.error(
      "BESTR3PS:",
      error
    );


    setStatus(
      "Unable to load products. Refresh"
    );

  }

}


/*
=========================================================
验证 Litbuy 商品 URL
=========================================================
*/

function isValidProductUrl(url) {

  if (!url) {
    return false;
  }


  const text =
    String(url).trim();


  if (
    !/^https?:\/\/(?:www\.)?litbuy\.com\//i.test(text)
  ) {

    return false;

  }


  if (
    !/\/product\//i.test(text)
  ) {

    return false;

  }


  return !!extractProductId(text);

}


/*
=========================================================
提取商品 ID
=========================================================
*/

function extractProductId(url) {

  if (!url) {
    return "";
  }


  const text =
    String(url);


  let match =
    text.match(
      /\/product\/(?:[^\/]+\/)?(\d+)/i
    );


  if (
    match &&
    match[1]
  ) {

    return match[1];

  }


  match =
    text.match(
      /itemID=(\d+)/i
    );


  if (
    match &&
    match[1]
  ) {

    return match[1];

  }


  match =
    text.match(
      /goodsId=(\d+)/i
    );


  if (
    match &&
    match[1]
  ) {

    return match[1];

  }


  match =
    text.match(
      /[?&]id=(\d+)/i
    );


  if (
    match &&
    match[1]
  ) {

    return match[1];

  }


  return "";

}


/*
=========================================================
分类卡片
=========================================================
*/

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
    function(category) {

      const count =
        products.filter(
          function(product) {
            return product.category === category;
          }
        ).length;


      const tile =
        document.createElement(
          "button"
        );


      tile.className =
        "category-tile";


      if (
        currentCategory === category
      ) {

        tile.classList.add(
          "active"
        );

      }


      tile.innerHTML = `

        <span class="category-tile-name">
          ${escapeHtml(category)}
        </span>

        <span class="category-tile-count">
          ${count} PRODUCTS
        </span>

      `;


      tile.addEventListener(
        "click",
        function() {

          currentCategory =
            category;


          renderCategoryTiles();

          renderCategories();

          renderProducts();

          scrollToProducts();

        }
      );


      container.appendChild(
        tile
      );

    }
  );

}


/*
=========================================================
Finds 分类导航
=========================================================
*/

function renderCategories() {

  const container =
    document.getElementById(
      "categoryNav"
    );


  if (!container) {
    return;
  }


  container.innerHTML = "";


  /*
  ALL
  */

  const allButton =
    createCategoryButton(
      "ALL"
    );


  container.appendChild(
    allButton
  );


  /*
  六个分类
  */

  categories.forEach(
    function(category) {

      container.appendChild(
        createCategoryButton(
          category
        )
      );

    }
  );

}


/*
=========================================================
创建分类按钮
=========================================================
*/

function createCategoryButton(
  category
) {

  const button =
    document.createElement(
      "button"
    );


  button.type =
    "button";


  button.className =
    "category-btn";


  if (
    currentCategory === category
  ) {

    button.classList.add(
      "active"
    );

  }


  button.textContent =
    category;


  button.addEventListener(
    "click",
    function() {

      currentCategory =
        category;


      renderCategoryTiles();

      renderCategories();

      renderProducts();

    }
  );


  return button;

}


/*
=========================================================
渲染商品
=========================================================
*/

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
  过滤分类
  */

  let filtered =
    products.filter(
      function(product) {

        if (
          currentCategory !== "ALL" &&
          product.category !== currentCategory
        ) {

          return false;

        }


        return true;

      }
    );


  /*
  搜索
  */

  if (searchKeyword) {

    const keyword =
      searchKeyword.toLowerCase();


    filtered =
      filtered.filter(
        function(product) {

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


  /*
  没有商品
  */

  if (!filtered.length) {

    container.innerHTML = `

      <div class="empty-products">

        <div>
          No products found.
        </div>

      </div>

    `;


    updateStatus();

    return;

  }


  /*
  创建商品卡片
  */

  filtered.forEach(
    function(product) {

      const card =
        createProductCard(
          product
        );


      container.appendChild(
        card
      );

    }
  );


  updateStatus();

}


/*
=========================================================
商品卡片
=========================================================
*/

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
  当前 Agent 对应链接
  */

  const productUrl =
    getProductUrl(
      product
    );


  /*
  图片
  */

  let imageHtml = "";


  if (
    product.imageUrl
  ) {

    imageHtml = `

      <img
        class="product-image"
        src="${escapeAttribute(
          product.imageUrl
        )}"
        alt="${escapeAttribute(
          product.name
        )}"
        loading="lazy"
        onerror="this.style.display='none';"
      >

    `;

  } else {

    imageHtml = `

      <div class="product-image-placeholder">
        BESTR3PS
      </div>

    `;

  }


  /*
  商品卡片
  */

  card.innerHTML = `

    <a
      class="product-image-wrap"
      href="${escapeAttribute(
        productUrl
      )}"
      target="_blank"
      rel="noopener noreferrer"
    >

      ${imageHtml}

    </a>


    <div class="product-card-body">

      <div class="product-category">
        ${escapeHtml(
          product.category
        )}
      </div>


      <h3 class="product-name">
        ${escapeHtml(
          product.name
        )}
      </h3>


      <div class="product-bottom">

        <span class="product-price">
          ${escapeHtml(
            product.price
          )}
        </span>


        <a
          class="product-link"
          href="${escapeAttribute(
            productUrl
          )}"
          target="_blank"
          rel="noopener noreferrer"
        >
          VIEW
        </a>

      </div>

    </div>

  `;


  return card;

}


/*
=========================================================
Agent URL
=========================================================
*/

function getProductUrl(
  product
) {

  /*
  目前你的第一份表格里面保存的
  是 Litbuy 原始商品链接。

  所以这里直接使用 sourceUrl。

  不改变你的 Litbuy 商品链接。
  */

  if (
    product &&
    product.sourceUrl
  ) {

    return product.sourceUrl;

  }


  return "#";

}


/*
=========================================================
搜索
=========================================================
*/

function setupSearch() {

  const inputs = [

    document.getElementById(
      "searchInput"
    ),

    document.getElementById(
      "heroSearchInput"
    )

  ].filter(Boolean);


  inputs.forEach(
    function(input) {

      input.addEventListener(
        "input",
        function() {

          searchKeyword =
            input.value.trim();


          /*
          同步另一个搜索框
          */

          inputs.forEach(
            function(otherInput) {

              if (
                otherInput !== input
              ) {

                otherInput.value =
                  input.value;

              }

            }
          );


          renderProducts();

        }
      );


      input.addEventListener(
        "keydown",
        function(event) {

          if (
            event.key === "Enter"
          ) {

            event.preventDefault();

            renderProducts();

            scrollToProducts();

          }

        }
      );

    }
  );

}


/*
=========================================================
Agent Selector
=========================================================
*/

function setupAgentSelector() {

  const selectors = [

    document.getElementById(
      "agentSelect"
    ),

    document.getElementById(
      "desktopAgentSelect"
    )

  ].filter(Boolean);


  selectors.forEach(
    function(select) {

      select.value =
        currentAgent;


      select.addEventListener(
        "change",
        function() {

          currentAgent =
            select.value;


          /*
          同步其他 Agent selector
          */

          selectors.forEach(
            function(otherSelect) {

              if (
                otherSelect !== select
              ) {

                otherSelect.value =
                  currentAgent;

              }

            }
          );


          renderProducts();

        }
      );

    }
  );

}


/*
=========================================================
刷新
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
    async function() {

      button.disabled =
        true;


      await loadProducts();


      button.disabled =
        false;

    }
  );

}


/*
=========================================================
状态
=========================================================
*/

function updateStatus() {

  const status =
    document.getElementById(
      "status"
    );


  if (!status) {
    return;
  }


  let visibleProducts =
    products.filter(
      function(product) {

        if (
          currentCategory !== "ALL" &&
          product.category !== currentCategory
        ) {

          return false;

        }


        if (searchKeyword) {

          const keyword =
            searchKeyword.toLowerCase();


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


        return true;

      }
    );


  status.textContent =
    `${visibleProducts.length} PRODUCTS`;

}


/*
=========================================================
设置状态文字
=========================================================
*/

function setStatus(
  message
) {

  const status =
    document.getElementById(
      "status"
    );


  if (status) {

    status.textContent =
      message;

  }

}


/*
=========================================================
滚动到商品
=========================================================
*/

function scrollToProducts() {

  const section =
    document.getElementById(
      "finds"
    );


  if (section) {

    section.scrollIntoView({
      behavior: "smooth"
    });

    return;

  }


  const grid =
    document.getElementById(
      "productGrid"
    );


  if (grid) {

    grid.scrollIntoView({
      behavior: "smooth"
    });

  }

}


/*
=========================================================
滚动监听
=========================================================
*/

function setupScrollListener() {

  /*
  保留接口。
  如果你的 style.css / index.html
  有自己的滚动效果，不干扰。
  */

}


/*
=========================================================
Mobile Menu
=========================================================
*/

function setupMobileMenu() {

  const menuButton =
    document.querySelector(
      ".mobile-menu-toggle"
    );


  const mobileMenu =
    document.querySelector(
      ".mobile-menu"
    );


  if (
    !menuButton ||
    !mobileMenu
  ) {

    return;

  }


  menuButton.addEventListener(
    "click",
    function() {

      mobileMenu.classList.toggle(
        "open"
      );

    }
  );

}


/*
=========================================================
HTML 安全转义
=========================================================
*/

function escapeHtml(
  value
) {

  if (
    value === null ||
    value === undefined
  ) {

    return "";

  }


  return String(value)

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");

}


/*
=========================================================
HTML Attribute 转义
=========================================================
*/

function escapeAttribute(
  value
) {

  return escapeHtml(
    value
  );

}
