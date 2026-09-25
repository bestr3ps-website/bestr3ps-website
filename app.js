const API_URL =
  "https://script.google.com/macros/s/AKfycbx5yy3DL89m_w2pJXQXMM1QbQDvdMUZ-erwzpKE8XYG1-_vD6fzhhZtP1jfkP8ZtNKl/exec";

let products = [];
let categories = [];
let currentCategory = "ALL";
let currentAgent = "litbuy";


async function loadProducts() {

  const status =
    document.getElementById("status");

  status.textContent =
    "Loading products...";

  try {

    const response =
      await fetch(
        API_URL + "?time=" + Date.now()
      );

    if (!response.ok) {
      throw new Error(
        "Failed to load data"
      );
    }

    const data =
      await response.json();

    products = [];

    categories =
      Object.keys(data);


    categories.forEach(category => {

      const rows =
        data[category];

      if (!Array.isArray(rows)) {
        return;
      }


      rows.forEach(row => {

        const name =
          String(
            row.name || ""
          ).trim();

        const price =
          row.price || "";

        const sourceUrl =
          String(
            row.sourceUrl || ""
          ).trim();


        // 没有真实链接的内容不显示
        if (!sourceUrl) {
          return;
        }

        // 没有商品名称不显示
        if (!name) {
          return;
        }


        products.push({

          category: category,

          name: name,

          price: price,

          sourceUrl: sourceUrl,

          productId:
            extractProductId(
              sourceUrl
            )

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



function extractProductId(url) {

  if (!url) {
    return "";
  }


  // LITBUY
  let match =
    url.match(
      /\/product\/[^/]+\/(\d+)/i
    );

  if (match) {
    return match[1];
  }


  // Weidian
  match =
    url.match(
      /[?&]itemID=(\d+)/i
    );

  if (match) {
    return match[1];
  }


  // goodsId
  match =
    url.match(
      /[?&]goodsId=(\d+)/i
    );

  if (match) {
    return match[1];
  }


  // id
  match =
    url.match(
      /[?&]id=(\d+)/i
    );

  if (match) {
    return match[1];
  }


  return "";
}



function getProductUrl(product) {

  const id =
    product.productId;


  if (!id) {
    return product.sourceUrl;
  }



  // =====================
  // LITBUY
  // =====================

  if (
    currentAgent === "litbuy"
  ) {

    return product.sourceUrl;

  }



  // =====================
  // OOPBUY
  // =====================

  if (
    currentAgent === "oopbuy"
  ) {

    return (
      "https://oopbuy.com/product/weidian/" +
      id
    );

  }



  // =====================
  // KAKOBUY
  // =====================

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



  // =====================
  // HIPOBUY
  // =====================

  if (
    currentAgent === "hipobuy"
  ) {

    return (
      "https://hipobuy.com/product/weidian/" +
      id
    );

  }



  // =====================
  // LOVEGOBUY
  // =====================

  if (
    currentAgent === "lovegobuy"
  ) {

    return (
      "https://lovegobuy.com/product?id=" +
      id +
      "&shop_type=weidian"
    );

  }



  // =====================
  // RIZZITGO
  // =====================

  if (
    currentAgent === "rizzitgo"
  ) {

    return (
      "https://rizzitgo.com/detail-page/?goodsId=" +
      id +
      "&source=3&rno=75FB20"
    );

  }



  // =====================
  // BOONBUY
  // =====================

  if (
    currentAgent === "boonbuy"
  ) {

    return (
      "https://boonbuy.com/product/2/" +
      id
    );

  }



  // =====================
  // USFANS
  // =====================

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



function renderCategories() {

  const nav =
    document.getElementById(
      "categoryNav"
    );

  nav.innerHTML = "";


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



function renderProducts() {

  const grid =
    document.getElementById(
      "productGrid"
    );


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
            .includes(search) ||
          product.category
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


  if (
    filtered.length === 0
  ) {

    empty.style.display =
      "block";

  } else {

    empty.style.display =
      "none";

  }


  filtered.forEach(
    product => {

      const card =
        document.createElement(
          "div"
        );

      card.className =
        "productCard";


      const image =
        document.createElement(
          "div"
        );

      image.className =
        "productImage";

      image.textContent =
        "IMAGE";


      const info =
        document.createElement(
          "div"
        );

      info.className =
        "productInfo";


      const name =
        document.createElement(
          "div"
        );

      name.className =
        "productName";

      name.textContent =
        product.name;


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


      const category =
        document.createElement(
          "div"
        );

      category.className =
        "productCategory";

      category.textContent =
        product.category;


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

  status.textContent =
    filtered.length +
    " products";

}



document
  .getElementById(
    "searchInput"
  )
  .addEventListener(
    "input",
    renderProducts
  );


document
  .getElementById(
    "agentSelect"
  )
  .addEventListener(
    "change",
    function(event) {

      currentAgent =
        event.target.value;

      renderProducts();

    }
  );


document
  .getElementById(
    "refreshBtn"
  )
  .addEventListener(
    "click",
    loadProducts
  );


loadProducts();
