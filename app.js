// ⚠️ 替换为您自己的 Google Apps Script 部署链接
const API_URL = "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE";

let currentPage = 1;
const pageSize = 20;
let isLoading = false;
let hasMore = true;

document.addEventListener("DOMContentLoaded", () => {
  loadProducts(true);
  setupScrollListener();
});

async function loadProducts(isReset = false) {
  if (isLoading || (!hasMore && !isReset)) return;
  
  isLoading = true;
  if (isReset) {
    currentPage = 1;
    hasMore = true;
    showLoadingState("正在加载商品数据...");
  } else {
    updateStatus("正在请求下一页数据...");
  }

  try {
    const response = await fetch(`${API_URL}?page=${currentPage}&pageSize=${pageSize}`);
    const data = await response.json();

    if (data._SUCCESS) {
      hasMore = data.hasMore;
      renderProducts(data.products, isReset);
      currentPage++;
      
      if (hasMore) {
        updateStatus("向下滚动加载更多商品");
      } else {
        updateStatus("已加载全部商品");
      }
    } else {
      updateStatus("加载失败，请刷新页面重试");
    }
  } catch (error) {
    console.error("Fetch Error:", error);
    updateStatus("网络连接失败，请检查网络");
  } finally {
    isLoading = false;
  }
}

function renderProducts(products, isReset) {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  if (isReset) {
    grid.innerHTML = "";
  }

  if (products.length === 0 && isReset) {
    showEmptyState();
    return;
  }

  hideEmptyState();

  const html = products.map(p => `
    <div class="product-card">
      <a href="${p.sourceUrl || '#'}" target="_blank" rel="noopener noreferrer" class="product-link">
        <div class="product-image">
          ${p.imageUrl 
            ? `<img src="${p.imageUrl}" alt="${escapeHtml(p.name)}" onerror="this.onerror=null; this.parentNode.innerHTML='<div class=\"image-placeholder\">No Image</div>';">`
            : `<div class="image-placeholder">No Image</div>`}
        </div>
        <div class="product-info">
          <div class="product-name">${escapeHtml(p.name)}</div>
          ${p.price ? `<div class="product-price">${escapeHtml(p.price)}</div>` : ''}
        </div>
      </a>
    </div>
  `).join("");

  grid.insertAdjacentHTML("beforeend", html);
}

function setupScrollListener() {
  window.addEventListener("scroll", () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 400) {
      loadProducts(false);
    }
  });
}

function showLoadingState(msg) {
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
  return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
