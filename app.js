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


let allProducts = [];
let currentCategory = "SNEAKERS";
let currentAgent = "litbuy";


document.addEventListener("DOMContentLoaded", () => {

  setupEvents();
  loadProducts();

});


function setupEvents() {

  const searchInput =
    document.getElementById("searchInput");

  const agentSelect =
    document.getElementById("agentSelect");

  const refreshBtn =
    document.getElementById("refreshBtn");


  if (searchInput) {

    searchInput.addEventListener(
      "input",
      renderProducts
    );

  }


  if (agentSelect) {

    agentSelect.addEventListener(
      "change",
      () => {

        currentAgent =
          agentSelect.value;

        renderProducts();

      }
    );

  }


  if (refreshBtn) {

    refreshBtn.addEventListener(
      "click",
      loadProducts
    );

  }

}


async function loadProducts() {

  setStatus("Loading products...");

  try {

    const response = await fetch(
      API_URL + "?time=" + Date.now(),
      {
        method: "GET",
        cache: "no-store"
      }
    );


    if (!response.ok) {

      throw new Error(
        "API error: " + response.status
      );

    }


    const data =
      await response.json();


    allProducts = [];


    categories.forEach(category => {

      const products =
        Array.isArray(data[category])
          ? data[category]
          : [];


      products.forEach(product => {

        allProducts.push({

          category: category,

          name:
            product.name || "",

          price:
            product.price ?? "",

          sourceUrl:
            product.sourceUrl || "",

          imageUrl:
            product.imageUrl || "",

          productId:
            product.productId ||
            extractProductId(
              product.sourceUrl || ""
            )

        });

      });

    });


    renderCategoryNav();

    renderProducts();


    setStatus(
      allProducts.length +
      " products"
    );


  } catch (error) {

    console.error(
      "Failed to load products:",
      error
    );


    setStatus(
      "Failed to load products"
    );


    const emptyMessage =
      document.getElementById(
        "emptyMessage"
      );


    if (emptyMessage) {

      emptyMessage.textContent =
        "Unable to load products.";

      emptyMessage.style.display =
        "block";

    }

  }

}


function renderCategoryNav() {

  const nav =
    document.getElementById(
      "categoryNav"
    );


  if (!nav) return;


  nav.innerHTML = "";


  categories.forEach(category => {

    const button =
      document.createElement("button");


    button.className =
      "category-button";


    if (
      category === currentCategory
    ) {

      button.classList.add(
        "active"
      );

    }


    button.textContent =
      category;


    button.addEventListener(
      "click",
      () => {

        currentCategory =
          category;


        document
          .querySelectorAll(
            ".category-button"
          )
          .forEach(btn => {

            btn.classList.remove(
              "active"
            );

          });


        button.classList.add(
          "active"
        );


        renderProducts();

      }
    );


    nav.appendChild(button);

  });

}


function renderProducts() {

  const grid =
    document.getElementById(
      "productGrid"
    );


  const emptyMessage =
    document.getElementById(
      "emptyMessage"
    );


  if (!grid) return;


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


  let products =
    allProducts.filter(
      product =>
        product.category ===
        currentCategory
    );


  if (search) {

    products =
      products.filter(product => {

        const name =
          String(
            product.name || ""
          ).toLowerCase();


        const sourceUrl =
          String(
            product.sourceUrl || ""
          ).toLowerCase();


        return (
          name.includes(search) ||
          sourceUrl.includes(search)
        );

      });

  }


  grid.innerHTML = "";


  if (!products.length) {

    if (emptyMessage) {

      emptyMessage.textContent =
        "No products found.";

      emptyMessage.style.display =
        "block";

    }

    return;

  }


  if (emptyMessage) {

    emptyMessage.style.display =
      "none";

  }


  const fragment =
    document.createDocumentFragment();


  products.forEach(product => {

    const card =
      createProductCard(product);


    fragment.appendChild(card);

  });


  grid.appendChild(fragment);

}


function createProductCard(product) {

  const card =
    document.createElement("article");


  card.className =
    "product-card";


  const imageWrap =
    document.createElement("div");


  imageWrap.className =
    "product-image-wrap";


  const image =
    document.createElement("img");


  image.className =
    "product-image";


  image.alt =
    product.name || "Product";


  image.loading =
    "lazy";


  image.decoding =
    "async";


  /*
   * 这里直接使用 Apps Script 返回的
   * CellImage URL
   */
  if (product.imageUrl) {

    image.src =
      product.imageUrl;


    image.addEventListener(
      "error",
      () => {

        image.style.display =
          "none";


        imageWrap.classList.add(
          "image-error"
        );

      },
      {
        once: true
      }
    );

  } else {

    image.style.display =
      "none";

    imageWrap.classList.add(
      "image-error"
    );

  }


  imageWrap.appendChild(
    image
  );


  const info =
    document.createElement("div");


  info.className =
    "product-info";


  const name =
    document.createElement("h3");


  name.className =
    "product-name";


  name.textContent =
    product.name || "Unnamed Product";


  const price =
    document.createElement("div");


  price.className =
    "product-price";


  price.textContent =
    formatPrice(product.price);


  const button =
    document.createElement("a");


  button.className =
    "product-button";


  button.textContent =
    "VIEW PRODUCT";


  button.target =
    "_blank";


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


  card.appendChild(
    imageWrap
  );

  card.appendChild(
    info
  );


  return card;

}


function formatPrice(price) {

  if (
    price === null ||
    price === undefined ||
    price === ""
  ) {

    return "";

  }


  const number =
    Number(price);


  if (
    Number.isNaN(number)
  ) {

    return String(price);

  }


  return "$" +
    number.toFixed(2);

}


function extractProductId(url) {

  if (!url) {
    return "";
  }


  let match;


  /*
   * Litbuy /product/2/7835834924
   */
  match =
    url.match(
      /\/product\/[^\/]+\/(\d+)/i
    );


  if (match) {
    return match[1];
  }


  /*
   * Weidian itemID
   */
  match =
    url.match(
      /itemID[=\/](\d+)/i
    );


  if (match) {
    return match[1];
  }


  /*
   * goodsId
   */
  match =
    url.match(
      /goodsId[=\/](\d+)/i
    );


  if (match) {
    return match[1];
  }


  /*
   * ?id=
   */
  match =
    url.match(
      /[?&]id=(\d+)/i
    );


  if (match) {
    return match[1];
  }


  return "";

}


function getProductUrl(
  product,
  agent
) {

  /*
   * LITBUY
   *
   * 保留 Google Sheet 里的原始链接
   * 不修改 inviteCode
   */
  if (agent === "litbuy") {

    return product.sourceUrl || "#";

  }


  const id =
    product.productId ||
    extractProductId(
      product.sourceUrl
    );


  if (!id) {

    return product.sourceUrl || "#";

  }


  switch (agent) {


    case "oopbuy":

      return (
        "https://oopbuy.com/product/weidian/" +
        id
      );


    case "kakobuy":

      return (
        "https://item.kakobuy.com/item/details?url=https://weidian.com/item.html?itemID=" +
        id
      );


    case "hipobuy":

      return (
        "https://hipobuy.com/product/weidian/" +
        id
      );


    case "lovegobuy":

      return (
        "https://lovegobuy.com/product?id=" +
        id +
        "&shop_type=weidian"
      );


    case "rizzitgo":

      return (
        "https://rizzitgo.com/detail-page/?goodsId=" +
        id +
        "&source=3&rno=75FB20"
      );


    case "boonbuy":

      return (
        "https://boonbuy.com/product/2/" +
        id
      );


    case "usfans":

      return (
        "https://usfans.com/product/3/" +
        id
      );


    default:

      return (
        product.sourceUrl || "#"
      );

  }

}


function setStatus(text) {

  const status =
    document.getElementById(
      "status"
    );


  if (status) {

    status.textContent =
      text;

  }

}
