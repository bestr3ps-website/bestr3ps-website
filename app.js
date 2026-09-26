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

async function loadProducts() {
  const status = document.getElementById("status");

  status.textContent = "Loading products...";

  try {
    const response = await fetch(API_URL + "?time=" + Date.now());

    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }

    const data = await response.json();

    console.log("API DATA:", data);
    console.log("API KEYS:", Object.keys(data));

    if (data.error) {
      throw new Error(data.message || "Apps Script error");
    }

    products = [];

    categories.forEach(category => {

      let rows = data[category];

      /*
       * 如果 API 的分类名称存在细微差异，
       * 尝试通过名称寻找对应的数据
       */
      if (!Array.isArray(rows)) {

        const key = Object.keys(data).find(k => {
          return k.trim().toLowerCase() === category.trim().toLowerCase();
        });

        if (key) {
          rows = data[key];
        }
      }

      if (!Array.isArray(rows)) {
        console.log("No array found for:", category);
        return;
      }

      console.log(category, "=>", rows.length, "products");

      rows.forEach(row => {

        if (!row || typeof row !== "object") {
          return;
        }

        const name = String(row.name || "").trim();
        const price = row.price ?? "";
        const sourceUrl = String(row.sourceUrl || "").trim();
        const imageUrl = String(row.imageUrl || "").trim();

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
          productId: extractProductId(sourceUrl)
        });
      });
    });

    console.log("TOTAL PRODUCTS:", products.length);

    renderCategories();
    renderProducts();

  } catch (error) {

    console.error("LOAD ERROR:", error);

    status.textContent = "Failed to load Google Sheet";

    alert(
      "无法读取 Google Sheet。\n\n" +
      "错误：" + error.message
    );
  }
}


function extractProductId(url) {

  if (!url) {
    return "";
  }

  let match = url.match(/\/product\/[^/]+\/(\d+)/i);

  if (match) {
    return match[1];
  }

  match = url.match(/[?&]itemID=(\d+)/i);

  if (match) {
    return match[1];
  }

  match = url.match(/[?&]goodsId=(\d+)/i);

  if (match) {
    return match[1];
  }

  match = url.match(/[?&]id=(\d+)/i);

  if (match) {
    return match[1];
  }

  return "";
}


function getProductUrl(product) {

  const id = product.productId;

  if (!id) {
    return product.sourceUrl;
  }

  if (currentAgent === "litbuy") {
    return product.sourceUrl;
  }

  if (currentAgent === "oopbuy") {
    return "https://oopbuy.com/product/weidian/" + id;
  }

  if (currentAgent === "kakobuy") {

    const weidianUrl =
      "https://weidian.com/item.html?itemID=" + id;

    return (
      "https://item.kakobuy.com/item/details?url=" +
      encodeURIComponent(weidianUrl)
    );
  }

  if (currentAgent === "hipobuy") {
    return "https://hipobuy.com/product/weidian/" + id;
  }

  if (currentAgent === "lovegobuy") {
    return (
      "https://lovegobuy.com/product?id=" +
      id +
      "&shop_type=weidian"
    );
  }

  if (currentAgent === "rizzitgo") {
    return (
      "https://rizzitgo.com/detail-page/?goodsId=" +
      id +
      "&source=3&rno=75FB20"
    );
  }

  if (currentAgent === "boonbuy") {
    return "https://boonbuy.com/product/2/" + id;
  }

  if (currentAgent === "usfans") {
    return "https://usfans.com/product/3/" + id;
  }

  return product.sourceUrl;
}


function renderCategories() {

  const nav = document.getElementById("categoryNav");

  nav.innerHTML = "";

  const allButton = document.createElement("button");

  allButton.className =
    "categoryButton " +
    (currentCategory === "ALL" ? "active" : "");

  allButton.textContent = "ALL";

  allButton.onclick = function() {

    currentCategory = "ALL";

    renderCategories();
    renderProducts();
  };

  nav.appendChild(allButton);


  categories.forEach(category => {

    const button = document.createElement("button");

    button.className =
      "categoryButton " +
      (currentCategory === category ? "active" : "");

    button.textContent = category;

    button.onclick = function() {

      currentCategory = category;

      renderCategories();
      renderProducts();
    };

    nav.appendChild(button);
  });
}


function renderProducts() {

  const grid = document.getElementById("productGrid");

  const searchInput =
    document.getElementById("searchInput");

  const search =
    searchInput
      ? searchInput.value.trim().toLowerCase()
      : "";

  grid.innerHTML = "";


  const filtered = products.filter(product => {

    const categoryMatch =
      currentCategory === "ALL" ||
      product.category === currentCategory;

    const searchMatch =
      !search ||
      product.name.toLowerCase().includes(search);

    return categoryMatch && searchMatch;
  });


  const empty =
    document.getElementById("emptyMessage");

  if (filtered.length === 0) {
    empty.style.display = "block";
  } else {
    empty.style.display = "none";
  }


  filtered.forEach(product => {

    const card =
      document.createElement("div");

    card.className = "productCard";


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


    const info =
      document.createElement("div");

    info.className = "productInfo";


    const name =
      document.createElement("div");

    name.className = "productName";

    name.textContent = product.name;


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


    const link =
      document.createElement("a");

    link.className = "viewButton";

    link.textContent = "VIEW PRODUCT";

    link.href = getProductUrl(product);

    link.target = "_blank";

    link.rel = "noopener noreferrer";


    const category =
      document.createElement("div");

    category.className = "productCategory";

    category.textContent =
      product.category;


    info.appendChild(name);

    info.appendChild(price);

    info.appendChild(link);

    info.appendChild(category);

    card.appendChild(image);

    card.appendChild(info);

    grid.appendChild(card);
  });


  const status =
    document.getElementById("status");

  status.textContent =
    filtered.length + " products";
}


document
  .getElementById("searchInput")
  .addEventListener("input", renderProducts);


document
  .getElementById("agentSelect")
  .addEventListener("change", function(event) {

    currentAgent = event.target.value;

    renderProducts();
  });


document
  .getElementById("refreshBtn")
  .addEventListener("click", loadProducts);


loadProducts();
