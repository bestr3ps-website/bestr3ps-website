const API_URL =
  "https://script.google.com/macros/s/AKfycbx5yy3DL89m_w2pJXQXMM1QbQDvdMUZ-erwzpKE8XYG1-_vD6fzhhZtP1jfkP8ZtNKl/exec";

let products = [];
let categories = [];
let currentCategory = "ALL";
let currentAgent = "litbuy";


// =========================
// 读取 Google Sheet
// =========================

async function loadProducts() {

  const status = document.getElementById("status");

  if (status) {
    status.textContent = "Loading products...";
  }

  try {

    const response = await fetch(API_URL + "?time=" + Date.now());

    if (!response.ok) {
      throw new Error("Failed to load data");
    }

    const data = await response.json();

    products = [];
    categories = Object.keys(data);

    categories.forEach(category => {

      const rows = data[category];

      rows.forEach(row => {

        // 每4列一个商品
        for (let i = 0; i + 3 < row.length; i += 4) {

          const name = row[i];
          const link = extractUrl(row[i + 1]);
          const price = row[i + 2];

          // 没有商品名和链接就跳过
          if (!name && !link) {
            continue;
          }

          // 跳过表头
          if (
            String(name)
              .trim()
              .toUpperCase() === "PRODUCT"
          ) {
            continue;
          }

          products.push({

            category: category,

            name: String(name || "").trim(),

            price: price,

            sourceUrl: link,

            productId: extractProductId(link)

          });

        }

      });

    });

    renderCategories();

    renderProducts();

  } catch (error) {

    console.error(error);

    if (status) {
      status.textContent = "Failed to load Google Sheet";
    }

    alert(
      "无法读取 Google Sheet，请检查 Apps Script 权限。"
    );

  }

}


// =========================
// 从 HYPER
