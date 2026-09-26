const API_URL =
  "https://script.google.com/macros/s/AKfycbxtFiRVCd9Y1MZ6l8-YlmmzRa97RZ6xppFLYoQgTEOBddtlx6wE6q9PnUaCdu3D94BR/exec";

const categories = [
  "SNEAKERS",
  "T-SHIRTS/SHORTS",
  "HOODIE/PANTS",
  "DOWNJACKET",
  "ACCESSORIES",
  "BAGS"
];

let data = {};
let currentCategory = "SNEAKERS";
let currentAgent = "litbuy";

document.addEventListener("DOMContentLoaded", () => {
  setupEvents();
  loadProducts();
});

function setupEvents() {
  const searchInput = document.getElementById("searchInput");
  const agentSelect = document.getElementById("agentSelect");
  const refreshBtn = document.getElementById("refreshBtn");

  if (searchInput) {
    searchInput.addEventListener("input", renderProducts);
  }

  if (agentSelect) {
    agentSelect.addEventListener("change", () => {
      currentAgent = agentSelect.value;
      renderProducts();
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener("click", loadProducts);
  }
}

async function loadProducts() {
  setStatus("Loading products...");

  try {
    const response = await fetch(
      API_URL + "?time=" + Date.now()
    );

    if (!response.ok) {
      throw new Error(
        "API request failed: " + response.status
      );
    }

    const json = await response.json();

    data = json;

    renderCategoryNav();
    renderProducts();

    let total = 0;

    categories.forEach(category => {
      if (Array.isArray(data[category])) {
        total += data[category].length;
      }
    });

    setStatus(total + " products");

  } catch (error) {
    console.error(error);

    setStatus("Failed to load products");

    const grid =
      document.getElementById("productGrid");

    if (grid) {
      grid.innerHTML = "";
    }

    const empty =
      document.getElementById("emptyMessage");

    if (empty) {
      empty.textContent =
        "Unable to load products.";
      empty.style.display = "block";
    }
  }
}

function renderCategoryNav() {
  const nav =
    document.getElementById("categoryNav");

  if (!nav) return;

  nav.innerHTML = "";

  categories.forEach(category => {
    const button =
      document.createElement("button");

    button.className =
      "category-button";

    if (category === currentCategory) {
      button.classList.add("active");
    }

    button.textContent = category;

    button.addEventListener("click", () => {
      currentCategory = category;

      document
        .querySelectorAll(".category-button")
        .forEach(btn => {
          btn.classList.remove("active");
        });

      button.classList.add("active");

      renderProducts();
    });

    nav.appendChild(button);
  });
}

function renderProducts() {
  const grid =
    document.getElementById("productGrid");

  const empty =
    document.getElementById("emptyMessage");

  if (!grid) return;

  const searchInput =
    document.getElementById("searchInput");

  const search =
    searchInput
      ? searchInput.value.trim().toLowerCase()
      : "";

  let products =
    Array.isArray(data[currentCategory])
      ? data[currentCategory]
      : [];

  if (search) {
    products = products.filter(product => {
      const name =
        String(product.name || "")
          .toLowerCase();

      return name.includes(search);
    });
  }

  grid.innerHTML = "";

  if (!products.length) {
    if (empty) {
      empty.textContent = "No products found.";
      empty.style.display = "block";
    }
    return;
  }

  if (empty) {
    empty.style.display = "none";
  }

  products.forEach(product => {
    const card =
      document.createElement("div");

    card.className = "product-card";

    const image =
      document.createElement("img");

    image.className = "product-image";

    image.alt =
      product.name || "Product";

    /*
     * 直接使用 API 返回的图片地址
     */
    if (product.imageUrl) {
      image.src = product.imageUrl;
    }

    const info =
      document.createElement("div");

    info.className = "product-info";

    const name =
      document.createElement("div");

    name.className = "product-name";

    name.textContent =
      product.name || "";

    const price =
      document.createElement("div");

    price.className = "product-price";

    price.textContent =
      formatPrice(product.price);

    const button =
      document.createElement("a");

    button.className =
      "product-button";

    button.textContent =
      "VIEW PRODUCT";

    button.target = "_blank";

    button.rel =
      "noopener noreferrer";

    button.href =
      getProductUrl(
        product,
        currentAgent
      );

    info.appendChild(name);
    info.appendChild(price);
    info.appendChild(button);

    card.appendChild(image);
    card.appendChild(info);

    grid.appendChild(card);
  });
}

function formatPrice(price) {
  if (
    price === null ||
    price === undefined ||
    price === ""
  ) {
    return "";
  }

  const number = Number(price);

  if (Number.isNaN(number)) {
    return String(price);
  }

  return "$" + number.toFixed(2);
}

function extractProductId(url) {
  if (!url) return "";

  let match;

  match =
    url.match(
      /\/product\/[^\/]+\/(\d+)/i
    );

  if (match) {
    return match[1];
  }

  match =
    url.match(
      /itemID[=\/](\d+)/i
    );

  if (match) {
    return match[1];
  }

  match =
    url.match(
      /goodsId[=\/](\d+)/i
    );

  if (match) {
    return match[1];
  }

  match =
    url.match(
      /[?&]id=(\d+)/i
    );

  if (match) {
    return match[1];
  }

  return "";
}

function getProductUrl(product, agent) {
  /*
   * LITBUY
   * 保留原始链接和原始 inviteCode
   */
  if (agent === "litbuy") {
    return product.sourceUrl || "#";
  }

  const id =
    product.productId ||
    extractProductId(
      product.sourceUrl || ""
    );

  if (!id) {
    return product.sourceUrl || "#";
  }

  if (agent === "oopbuy") {
    return (
      "https://oopbuy.com/product/weidian/" +
      id
    );
  }

  if (agent === "kakobuy") {
    return (
      "https://item.kakobuy.com/item/details?url=https://weidian.com/item.html?itemID=" +
      id
    );
  }

  if (agent === "hipobuy") {
    return (
      "https://hipobuy.com/product/weidian/" +
      id
    );
  }

  if (agent === "lovegobuy") {
    return (
      "https://lovegobuy.com/product?id=" +
      id +
      "&shop_type=weidian"
    );
  }

  if (agent === "rizzitgo") {
    return (
      "https://rizzitgo.com/detail-page/?goodsId=" +
      id +
      "&source=3&rno=75FB20"
    );
  }

  if (agent === "boonbuy") {
    return (
      "https://boonbuy.com/product/2/" +
      id
    );
  }

  if (agent === "usfans") {
    return (
      "https://usfans.com/product/3/" +
      id
    );
  }

  return product.sourceUrl || "#";
}

function setStatus(text) {
  const status =
    document.getElementById("status");

  if (status) {
    status.textContent = text;
  }
}
