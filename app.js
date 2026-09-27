// 基于你提供的发布链接自动转为高并发 CSV 接口
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS7WC8B9WroU1IbsPbBAKVrK8a_FawnxbF-TidHt-ZHgf4zeh0rxJbMFmO4ZMpqXfkR7-5w7HyfOJJp/pub?output=csv";

const PAGE_SIZE = 20; // 首次极速渲染 20 个，向下滚动瀑布流加载
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;

document.addEventListener("DOMContentLoaded", () => {
  initSearch();
  setupScrollListener();
  fetchAndParseCSV();
});

/* =========================================
   1. 获取并毫秒级解析全表数据
========================================= */
async function fetchAndParseCSV() {
  showLoadingState("⚡ 正在极速加载数据...");
  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) throw new Error("网络响应异常");
    
    const csvText = await response.text();

    // 纯前端内存提取
    Papa.parse(csvText, {
      skipEmptyLines: true,
      complete: (results) => {
        processRawData(results.data);
      }
    });
  } catch (error) {
    console.error("加载失败:", error);
    showErrorState("数据加载失败，请重试");
  }
}

/* =========================================
   2. 数据清洗（强效正则提取图片直链、剥离大标题）
========================================= */
function processRawData(rows) {
  let extracted = [];

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;

    // 每 4 列为一组：商品名, 链接, 价格, 图片
    for (let c = 0; c < row.length; c += 4) {
      const rawName = cleanString(row[c]);
      if (!rawName || rawName.length < 2) continue;

      const rawLink = cleanString(row[c + 1]);
      const rawPrice = cleanString(row[c + 2]);
      const rawImg = cleanString(row[c + 3]);

      // 提取字符串/公式里的网络直链 (例如提取 =IMAGE("https://...") 里的 URL)
      const link = extractUrl(rawLink);
      const img = extractUrl(rawImg);

      // 过滤大标题（如 SNEAKERS、TEE 等没有图片和价格的纯文本列）与广告语
      if (isNoiseOrHeader(rawName, rawPrice, img)) continue;

      extracted.push({
        name: rawName,
        price: formatPrice(rawPrice),
        sourceUrl: link,
        imageUrl: img
      });
    }
  }

  // 商品自动去重
  allProducts = removeDuplicates(extracted);
  filteredProducts = [...allProducts];

  currentPage = 1;
  renderProducts(true);
}

/* 正则强效抽取字符串里的 http/https 地址 */
function extractUrl(text) {
  if (!text) return "";
  const match = text.match(/https?:\/\/[^\s"'\)\>]+/i);
  return match ? match[0] : "";
}

/* 过滤非商品噪声及空壳分类标题 */
function isNoiseOrHeader(name, price, imgUrl) {
  // 如果没有图片且没有价格，绝大多数是分类大标题（如 SNEAKERS、SLIPPERS）
  if (!imgUrl && !price) return true;

  const lower = name.toLowerCase();
  const blockedKeywords = [
    "product", "link", "price", "image", "discord", "coupon",
    "giveaway", "partner", "supplier", "1:1 quality", "litbuy", "manufacturers"
  ];

  return blockedKeywords.some(kw => lower.includes(kw));
}

function cleanString(val) {
  return val ? String(val).trim() : "";
}

function formatPrice(price) {
  if (!price) return "";
  if (price.startsWith("http")) return "";
  return price.startsWith("$") \vert{}\vert{} price.startsWith("€") \vert{}\vert{} price.startsWith("¥") ? price : "$" + price;
}

function removeDuplicates(list) {
  const seen = new Set();
  return list.filter(item => {
    const key = item.name + "|" + item.sourceUrl;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/* =========================================
   3. 渲染页面与懒加载
========================================= */
function renderProducts(isReset = false) {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  if (isReset) {
    grid.innerHTML = "";
  }

  const start = (currentPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageItems = filteredProducts.slice(start, end);

  if (pageItems.length === 0 && isReset) {
    showEmptyState();
    return;
  }

  hideEmptyState();

  const cardsHtml = pageItems.map(p => `
    <div class="product-card">
      <a href="${p.sourceUrl || '#'}" target="_blank" rel="noopener noreferrer" class="product-link">
        <div class="product-image">
          ${p.imageUrl 
            ? `<img src="${p.imageUrl}" alt="${escapeHtml(p.name)}" loading="lazy" onerror="this.onerror=null; this.parentNode.innerHTML='<div class=\"image-placeholder\">No Image</div>';">`
            : `<div class="image-placeholder">No Image</div>`}
        </div>
        <div class="product-info">
          <div class="product-name">${escapeHtml(p.name)}</div>
          ${p.price ? `<div class="product-price">${escapeHtml(p.price)}</div>` : ''}
        </div>
      </a>
    </div>
  `).join("");

  grid.insertAdjacentHTML("beforeend", cardsHtml);

  const total = filteredProducts.length;
  const loadedCount = Math.min(end, total);
  updateStatus(loadedCount >= total ? `已加载全部 ${total} 个商品` : `已展示 ${loadedCount} / ${total} 个商品（向下滚动加载更多）`);
}

/* 滚动触底自动翻页 */
function setupScrollListener() {
  window.addEventListener("scroll", () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
      if (currentPage * PAGE_SIZE < filteredProducts.length) {
        currentPage++;
        renderProducts(false);
      }
    }
  });
}

/* 实时搜索过滤 */
function initSearch() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  let timer = null;
  input.addEventListener("input", (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const keyword = e.target.value.trim().toLowerCase();
      if (!keyword) {
        filteredProducts = [...allProducts];
      } else {
        filteredProducts = allProducts.filter(p => p.name.toLowerCase().includes(keyword));
      }
      currentPage = 1;
      renderProducts(true);
    }, 200);
  });
}

function showLoadingState(msg) {
  const grid = document.getElementById("productGrid");
  if (grid) grid.innerHTML = `<div class="loading">${msg}</div>`;
}

function showErrorState(msg) {
  const grid = document.getElementById("productGrid");
  if (grid) grid.innerHTML = `<div class="loading">${msg}</div>`;
}

function showEmptyState() {
  const empty = document.getElementById("emptyMessage");
  if (empty) empty.style.display = "block";
}

function hideEmptyState() {
  const empty = document.getElementById("emptyMessage");
  if (empty) empty.style.display = "none";
}

function updateStatus(txt) {
  const status = document.getElementById("status");
  if (status) status.textContent = txt;
}

function escapeHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
