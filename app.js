const API_URL =
  "https://script.google.com/macros/s/AKfycbxn9DVmH7b3isG3CyaNEJ7b6DrGrLimfIc7YVX9YU1NkAftIfcQPNyFNKFP8ko_d7JX/exec";

let products = [];

const categories = [
  "SUMMER Pick",
  "SNEAKERS",
  "T-SHIRTS/SHORTS",
  "HOODIE/PANTS",
  "DOWNJACKET",
  "ACCESSORIES",
  "BAGS"
];

let currentCategory = "ALL";
let currentAgent = "litbuy";


// =====================================================
// 读取 Google Sheet 数据
// =====================================================

async function loadProducts() {

  const status = document.getElementById("status");

  status.textContent = "Loading products...";

  try {

    const response = await fetch(
      API_URL + "?time=" + Date.now()
    );

    if (!response.ok) {
      throw new Error("Failed to load data");
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.message || "Apps Script error");
    }

    products = [];


    // =================================================
    // 只读取这 7 个分类
    // =================================================

    categories.forEach(category => {

      const rows = data[category];

      if (!Array.isArray(rows)) {
        return;
      }


      rows.forEach(row => {

        const name =
          String(row.name || "").trim();

        const price =
          row.price ?? "";

        const sourceUrl =
          String(row.sourceUrl || "").trim();

        const imageUrl =
          String(row.imageUrl || "").trim();


        // 没有商品名称，不显示
        if (!name) {
          return;
        }


        // 没有真实商品链接，不显示
        if (!sourceUrl) {
          return;
        }


        products.push({

          category: category,

          name: name,

          price: price,

          sourceUrl: sourceUrl,

          imageUrl: imageUrl,

          productId: extractProductId(sourceUrl)

        });

      });

    });


    renderCategories();

    renderProducts();


  } catch (error) {

    console.error(error);

    status.textContent =
      "Failed to load Google Sheet";

    alert(
      "无法读取 Google Sheet，请检查 Apps Script。"
    );

  }

}


// =====================================================
// 提取商品 ID
// =====================================================

function extractProductId(url) {

  if (!url) {
    return "";
  }


  // LITBUY
  let match = url.match(
    /\/product\/[^/]+\/(\d+)/i
  );

  if (match) {
    return match[1];
  }


  // Weidian
  match = url.match(
    /[?&]itemID=(\d+)/i
  );

  if (match) {
    return match[1];
  }


  // goodsId
  match = url.match(
    /[?&]goodsId=(\d+)/i
  );

  if (match) {
    return match[1];
  }


  // id
  match = url.match(
    /[?&]id=(\d+)/i
  );

  if (match) {
    return match[1];
  }


  return "";
}


// =====================================================
// 根据 Agent 生成商品链接
// =====================================================

function getProductUrl(product) {

  const id = product.productId;


  if (!id) {
    return product.sourceUrl;
  }


  // LITBUY
  if (currentAgent === "litbuy") {

    return product.sourceUrl;

  }


  // OOPBUY
  if (currentAgent === "oopbuy") {

    return (
      "https://oopbuy.com/product/weidian/" +
      id
    );

  }


  // KAKOBUY
  if (currentAgent === "kakobuy") {

    const weidianUrl =
      "https://weidian.com/item.html?itemID=" +
      id;

    return (
      "https://item.kakobuy.com/item/details?url=" +
      encodeURIComponent(weidianUrl)
    );

  }


  // HIPOBUY
  if (currentAgent === "hipobuy") {

    return (
      "https://hipobuy.com/product/weidian/" +
      id
    );

  }


  // LOVEGOBUY
  if (currentAgent === "lovegobuy") {

    return (
      "https://lovegobuy.com/product?id=" +
      id +
      "&shop_type=weidian"
    );

  }


  // RIZZITGO
  if (currentAgent === "rizzitgo") {

    return (
      "https://rizzitgo.com/detail-page/?goodsId=" +
      id +
      "&source=3&rno=75FB20"
    );

  }


  // BOONBUY
  if (currentAgent === "boonbuy") {

    return (
      "https://boonbuy.com/product/2/" +
      id
    );

  }


  // USFANS
  if (currentAgent === "usfans") {

    return (
      "https://usfans.com/product/3/" +
      id
    );

  }


  return product.sourceUrl;

}


// =====================================================
// 分类按钮
// =====================================================

function renderCategories() {

  const nav =
    document.getElementById("categoryNav");

  nav.innerHTML = "";


  // ALL
  const allButton =
    document.createElement("button");

  allButton.className =
    "categoryButton " +
    (
      currentCategory === "ALL"
        ? "active"
        : ""
    );

  allButton.textContent = "ALL";


  allButton.onclick = function() {

    currentCategory = "ALL";

    renderCategories();

    renderProducts();

  };


  nav.appendChild(allButton);


  // 7 个正式分类
  categories.forEach(category => {

    const button =
      document.createElement("button");

    button.className =
      "categoryButton " +
      (
        currentCategory === category
          ? "active"
          : ""
      );

    button.textContent = category;


    button.onclick = function() {

      currentCategory = category;

      renderCategories();

      renderProducts();

    };


    nav.appendChild(button);

  });

}


// =====================================================
// 显示商品
// =====================================================

function renderProducts() {

  const grid =
    document.getElementById("productGrid");

  const searchInput =
    document.getElementById("searchInput");


  const search =
    searchInput
      ? searchInput.value
          .trim()
          .toLowerCase()
      : "";


  grid.innerHTML = "";


  const filtered =
    products.filter(product => {

      const categoryMatch =
        currentCategory === "ALL" ||
        product.category === currentCategory;


      const searchMatch =
        !search ||
        product.name
          .toLowerCase()
          .includes(search);


      return (
        categoryMatch &&
        searchMatch
      );

    });


  const empty =
    document.getElementById("emptyMessage");


  if (filtered.length === 0) {

    empty.style.display = "block";

  } else {

    empty.style.display = "none";

  }


  // =================================================
  // 商品卡片
  // =================================================

  filtered.forEach(product => {

    const card =
      document.createElement("div");

    card.className = "productCard";


    // =================================================
    // 商品图片
    // =================================================

    const image =
      document.createElement("div");

    image.className = "productImage";


    if (product.imageUrl) {

      const img =
        document.createElement("img");

      img.src = product.imageUrl;

      img.alt = product.name;

      img.loading = "lazy";


      img.onerror = function() {

        this.style.display = "none";

        image.textContent = "IMAGE";

      };


      image.appendChild(img);

    } else {

      image.textContent = "IMAGE";

    }


    // =================================================
    // 商品信息
    // =================================================

    const info =
      document.createElement("div");

    info.className = "productInfo";


    // 商品名称
    const name =
      document.createElement("div");

    name.className = "productName";

    name.textContent = product.name;


    // 商品价格
    const price =
      document.createElement("div");

    price.className = "productPrice";


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


    // 商品链接
    const link =
      document.createElement("a");

    link.className = "viewButton";

    link.textContent = "VIEW PRODUCT";

    link.href =
      getProductUrl(product);

    link.target = "_blank";

    link.rel =
      "noopener noreferrer";


    // 分类
    const category =
      document.createElement("div");

    category.className =
      "productCategory";

    category.textContent =
      product.category;


    // 加入商品信息
    info.appendChild(name);

    info.appendChild(price);

    info.appendChild(link);

    info.appendChild(category);


    // 加入商品卡片
    card.appendChild(image);

    card.appendChild(info);


    grid.appendChild(card);

  });


  // =================================================
  // 商品数量
  // =================================================

  const status =
    document.getElementById("status");

  status.textContent =
    filtered.length + " products";

}


// =====================================================
// 搜索
// =====================================================

document
  .getElementById("searchInput")
  .addEventListener(
    "input",
    renderProducts
  );


// =====================================================
// Agent 切换
// =====================================================

document
  .getElementById("agentSelect")
  .addEventListener(
    "change",
    function(event) {

      currentAgent =
        event.target.value;

      renderProducts();

    }
  );


// =====================================================
// Refresh
// =====================================================

document
  .getElementById("refreshBtn")
  .addEventListener(
    "click",
    loadProducts
  );


// =====================================================
// 开始读取 Google Sheet
// =====================================================

loadProducts();
