const API_URL =
  "https://script.google.com/macros/s/AKfycbxn9DVmH7b3isG3CyaNEJ7b6DrGrLimfIc7YVX9YU1NkAftIfcQPNyFNKFP8ko_d7JX/exec";


const categories = [
  "SNEAKERS",
  "T-SHIRTS/SHORTS",
  "HOODIE/PANTS",
  "DOWNJACKET",
  "ACCESSORIES",
  "BAGS"
];


let allData = {};
let currentCategory = "ALL";
let currentAgent = "litbuy";


const categoryNav =
  document.getElementById("categoryNav");

const productGrid =
  document.getElementById("productGrid");

const searchInput =
  document.getElementById("searchInput");

const agentSelect =
  document.getElementById("agentSelect");

const refreshBtn =
  document.getElementById("refreshBtn");

const status =
  document.getElementById("status");

const emptyMessage =
  document.getElementById("emptyMessage");


async function loadProducts() {

  status.textContent = "Loading...";

  try {

    const response = await fetch(
      API_URL + "?time=" + Date.now()
    );

    if (!response.ok) {
      throw new Error(
        "HTTP " + response.status
      );
    }

    const data = await response.json();

    console.log("API DATA:", data);
    console.log(
      "API KEYS:",
      Object.keys(data)
    );

    allData = data;

    categories.forEach(category => {

      const products =
        getCategoryData(category);

      console.log(
        category +
        ": " +
        products.length +
        " products"
      );

    });

    renderCategories();
    renderProducts();

    const total =
      categories.reduce(
        (sum, category) =>
          sum +
          getCategoryData(category).length,
        0
      );

    status.textContent =
      total + " products";

  } catch (error) {

    console.error(
      "API ERROR:",
      error
    );

    status.textContent =
      "Failed to load products";

    productGrid.innerHTML = "";

    emptyMessage.style.display =
      "block";

  }
}


function getCategoryData(category) {

  if (
    allData &&
    Array.isArray(allData[category])
  ) {
    return allData[category];
  }

  const key =
    Object.keys(allData || {})
      .find(
        k =>
          k.toLowerCase() ===
          category.toLowerCase()
      );

  if (
    key &&
    Array.isArray(allData[key])
  ) {
    return allData[key];
  }

  return [];
}


function renderCategories() {

  categoryNav.innerHTML = "";

  const allButton =
    document.createElement("button");

  allButton.textContent = "ALL";
  allButton.className =
    currentCategory === "ALL"
      ? "active"
      : "";

  allButton.onclick = () => {

    currentCategory = "ALL";

    renderCategories();
    renderProducts();

  };

  categoryNav.appendChild(allButton);


  categories.forEach(category => {

    const button =
      document.createElement("button");

    button.textContent =
      category;

    button.className =
      currentCategory === category
        ? "active"
        : "";

    button.onclick = () => {

      currentCategory =
        category;

      renderCategories();
      renderProducts();

    };

    categoryNav.appendChild(button);

  });
}


function getProductUrl(product) {

  const id =
    product.productId;

  const sourceUrl =
    product.sourceUrl || "";

  switch (currentAgent) {

    case "litbuy":

      return sourceUrl;

    case "oopbuy":

      return id
        ? `https://oopbuy.com/product/weidian/${id}`
        : sourceUrl;

    case "kakobuy":

      return id
        ? `https://item.kakobuy.com/item/details?url=https://weidian.com/item.html?itemID=${id}`
        : sourceUrl;

    case "hipobuy":

      return id
        ? `https://hipobuy.com/product/weidian/${id}`
        : sourceUrl;

    case "lovegobuy":

      return id
        ? `https://lovegobuy.com/product?id=${id}&shop_type=weidian`
        : sourceUrl;

    case "rizzitgo":

      return id
        ? `https://rizzitgo.com/detail-page/?goodsId=${id}&source=3&rno=75FB20`
        : sourceUrl;

    case "boonbuy":

      return id
        ? `https://boonbuy.com/product/2/${id}`
        : sourceUrl;

    case "usfans":

      return id
        ? `https://usfans.com/product/3/${id}`
        : sourceUrl;

    default:

      return sourceUrl;
  }
}


function renderProducts() {

  productGrid.innerHTML = "";

  const keyword =
    searchInput.value
      .trim()
      .toLowerCase();


  let products = [];


  if (currentCategory === "ALL") {

    categories.forEach(category => {

      products =
        products.concat(
          getCategoryData(category)
        );

    });

  } else {

    products =
      getCategoryData(
        currentCategory
      );

  }


  if (keyword) {

    products =
      products.filter(product => {

        const name =
          String(
            product.name || ""
          ).toLowerCase();

        return name.includes(keyword);

      });

  }


  if (!products.length) {

    emptyMessage.style.display =
      "block";

    return;

  }


  emptyMessage.style.display =
    "none";


  products.forEach(product => {

    const card =
      document.createElement("div");

    card.className =
      "product-card";


    const image =
      document.createElement("img");

    image.className =
      "product-image";

    image.src =
      product.imageUrl || "";

    image.alt =
      product.name || "Product";

    image.loading =
      "lazy";


    image.onerror = () => {

      image.style.display =
        "none";

    };


    const info =
      document.createElement("div");

    info.className =
      "product-info";


    const name =
      document.createElement("div");

    name.className =
      "product-name";

    name.textContent =
      product.name || "";


    const price =
      document.createElement("div");

    price.className =
      "product-price";

    price.textContent =
      product.price || "";


    const link =
      document.createElement("a");

    link.className =
      "product-link";

    link.href =
      getProductUrl(product);

    link.target =
      "_blank";

    link.rel =
      "noopener noreferrer";

    link.textContent =
      "VIEW PRODUCT";


    info.appendChild(name);
    info.appendChild(price);
    info.appendChild(link);


    card.appendChild(image);
    card.appendChild(info);

    productGrid.appendChild(card);

  });

}


searchInput.addEventListener(
  "input",
  renderProducts
);


agentSelect.addEventListener(
  "change",
  () => {

    currentAgent =
      agentSelect.value;

    renderProducts();

  }
);


refreshBtn.addEventListener(
  "click",
  loadProducts
);


loadProducts();
