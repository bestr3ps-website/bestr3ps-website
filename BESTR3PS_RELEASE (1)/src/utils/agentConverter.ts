import { AgentConfig, AgentType } from "../types/product";

/**
 * Remove all affiliate/invite/tracking codes completely (especially litbuy inviteCode).
 */
export function cleanSourceUrl(url: string): string {
  if (!url) return "";
  try {
    const parsed = new URL(url.trim());
    const keysToRemove = [
      "inviteCode",
      "invitecode",
      "invite",
      "invitationCode",
      "invitation_code",
      "code",
      "aff",
      "ref",
      "affiliate",
      "spm",
      "scm",
      "track"
    ];
    keysToRemove.forEach(k => parsed.searchParams.delete(k));
    return parsed.toString();
  } catch {
    return url
      .replace(/([?&])(inviteCode|invitecode|invite|invitationCode|code|aff|ref)=[^&#]*/gi, "$1")
      .replace(/[?&]$/, "")
      .replace(/\?&/, "?");
  }
}

/**
 * Detects whether the item is from Taobao, Weidian, or 1688
 */
export function detectMarketplace(url: string): "weidian" | "taobao" | "1688" {
  const lower = (url || "").toLowerCase();
  if (lower.includes("taobao.com") || lower.includes("tmall.com") || lower.includes("/taobao/")) {
    return "taobao";
  }
  if (lower.includes("1688.com") || lower.includes("/1688/")) {
    return "1688";
  }
  return "weidian";
}

/**
 * Extracts pure item ID (numerical) from URLs or text
 */
export function extractProductId(url: string): string {
  if (!url) return "";
  const match = url.match(/(?:itemID|id|offerId|goodsId)=([0-9]+)/i) || 
                url.match(/\/item\/([0-9]+)/i) ||
                url.match(/\/offer\/([0-9]+)/i) ||
                url.match(/([0-9]{8,14})/);
  return match ? match[1] : "";
}

export const AGENTS: Record<AgentType, AgentConfig> = {
  // 1. Litbuy: Official logo from litbuy.com/logo-new.png
  litbuy: {
    id: "litbuy",
    name: "Litbuy",
    tagline: "Chinese Shopping Agent (0% Service Fee)",
    shortCode: "LB",
    avatarBg: "from-amber-500 via-orange-500 to-amber-600",
    avatarColor: "text-neutral-950 font-black",
    logoUrl: "/logos/litbuy.png",
    websiteUrl: "https://litbuy.com",
    enabled: true,
    order: 1,
    buildUrl: (sourceUrl: string, productId?: string): string => {
      const clean = cleanSourceUrl(sourceUrl);
      const pId = productId || extractProductId(clean) || "";
      const market = detectMarketplace(clean);
      if (market === "taobao") return "https://litbuy.com/product/taobao/" + pId;
      if (market === "1688") return "https://litbuy.com/product/1688/" + pId;
      return "https://litbuy.com/product/weidian/" + pId;
    }
  },

  // 2. Rizzitgo: Official logo from cdn.rizzitgoo.com/commons/logo.png
  rizzitgo: {
    id: "rizzitgo",
    name: "Rizzitgo",
    tagline: "Fast Global Forwarder & QC Inspection",
    shortCode: "RZ",
    avatarBg: "from-emerald-500 to-teal-600",
    avatarColor: "text-neutral-950 font-black",
    logoUrl: "/logos/rizzitgo.png",
    websiteUrl: "https://rizzitgo.com",
    enabled: true,
    order: 2,
    buildUrl: (sourceUrl: string, productId?: string): string => {
      const clean = cleanSourceUrl(sourceUrl);
      const pId = productId || extractProductId(clean) || "";
      const market = detectMarketplace(clean);
      const sourceNum = market === "taobao" ? "2" : market === "1688" ? "1" : "3";
      return "https://rizzitgo.com/detail-page/?goodsId=" + pId + "&source=" + sourceNum + "&rno=B73F70";
    }
  },

  // 3. USfans: Official logo from usfans.com/loading-logo.webp
  usfans: {
    id: "usfans",
    name: "USfans",
    tagline: "US & Global Air Express Forwarding",
    shortCode: "US",
    avatarBg: "from-blue-600 via-indigo-600 to-sky-500",
    avatarColor: "text-white font-black",
    logoUrl: "/logos/usfans.webp",
    websiteUrl: "https://usfans.com",
    enabled: true,
    order: 3,
    buildUrl: (sourceUrl: string, productId?: string): string => {
      const clean = cleanSourceUrl(sourceUrl);
      const pId = productId || extractProductId(clean) || "";
      const market = detectMarketplace(clean);
      const code = market === "taobao" ? "2" : market === "1688" ? "1" : "3";
      return "https://usfans.com/product/" + code + "/" + pId;
    }
  },

  // 4. OOPBuy: Official logo from oopbuy.com header static asset
  oopbuy: {
    id: "oopbuy",
    name: "OOPBuy",
    tagline: "High Speed Tax-Free Lines Agent",
    shortCode: "OP",
    avatarBg: "from-violet-600 to-purple-700",
    avatarColor: "text-white font-black",
    logoUrl: "/logos/oopbuy.png",
    websiteUrl: "https://oopbuy.com",
    enabled: true,
    order: 4,
    buildUrl: (sourceUrl: string, productId?: string): string => {
      const clean = cleanSourceUrl(sourceUrl);
      const pId = productId || extractProductId(clean) || "";
      const market = detectMarketplace(clean);
      if (market === "taobao") return "https://oopbuy.com/product/taobao/" + pId;
      if (market === "1688") return "https://oopbuy.com/product/1688/" + pId;
      return "https://oopbuy.com/product/weidian/" + pId;
    }
  },

  // 5. Kakobuy: Official logo from nstatic.kakobuy.com/www/pic/logo.png
  kakobuy: {
    id: "kakobuy",
    name: "Kakobuy",
    tagline: "Instant Automated Checkout Agent",
    shortCode: "KB",
    avatarBg: "from-rose-500 via-red-500 to-orange-500",
    avatarColor: "text-white font-black",
    logoUrl: "/logos/kakobuy.png",
    websiteUrl: "https://kakobuy.com",
    enabled: true,
    order: 5,
    buildUrl: (sourceUrl: string, productId?: string): string => {
      const clean = cleanSourceUrl(sourceUrl);
      const pId = productId || extractProductId(clean) || "";
      const market = detectMarketplace(clean);
      let rawUrl = "https://weidian.com/item.html?itemID=" + pId;
      if (market === "taobao") rawUrl = "https://item.taobao.com/item.htm?id=" + pId;
      if (market === "1688") rawUrl = "https://detail.1688.com/offer/" + pId + ".html";
      return "https://item.kakobuy.com/item/details?url=" + encodeURIComponent(rawUrl);
    }
  },

  // 6. HipoBuy: Official logo from hipobuy.com header favicon.png
  hipobuy: {
    id: "hipobuy",
    name: "HipoBuy",
    tagline: "Reliable Warehouse & Free Storage",
    shortCode: "HP",
    avatarBg: "from-cyan-500 to-blue-600",
    avatarColor: "text-neutral-950 font-black",
    logoUrl: "/logos/hipobuy.png",
    websiteUrl: "https://hipobuy.com",
    enabled: true,
    order: 6,
    buildUrl: (sourceUrl: string, productId?: string): string => {
      const clean = cleanSourceUrl(sourceUrl);
      const pId = productId || extractProductId(clean) || "";
      const market = detectMarketplace(clean);
      if (market === "taobao") return "https://hipobuy.com/product/taobao/" + pId;
      if (market === "1688") return "https://hipobuy.com/product/1688/" + pId;
      return "https://hipobuy.com/product/weidian/" + pId;
    }
  },

  // 7. CSSBuy: Official logo from assets.cssbuy.com/icon/css_192.png
  cssbuy: {
    id: "cssbuy",
    name: "CSSBuy",
    tagline: "Veteran 10-Year Forwarder with IOSS",
    shortCode: "CS",
    avatarBg: "from-yellow-400 via-amber-500 to-yellow-600",
    avatarColor: "text-neutral-950 font-black",
    logoUrl: "/logos/cssbuy.png",
    websiteUrl: "https://www.cssbuy.com",
    enabled: true,
    order: 7,
    buildUrl: (sourceUrl: string, productId?: string): string => {
      const clean = cleanSourceUrl(sourceUrl);
      const pId = productId || extractProductId(clean) || "";
      const market = detectMarketplace(clean);
      const typeStr = market === "taobao" ? "taobao" : market === "1688" ? "1688" : "weidian";
      return "https://www.cssbuy.com/shop/goodsDetail?type=" + typeStr + "&id=" + pId;
    }
  },

  // 8. Joyagoo: Official logo from joyagoo.com site.ico
  joyagoo: {
    id: "joyagoo",
    name: "Joyagoo",
    tagline: "Smart Shopping & Multi-Currency",
    shortCode: "JG",
    avatarBg: "from-pink-500 to-rose-600",
    avatarColor: "text-white font-black",
    logoUrl: "/logos/joyagoo.png",
    websiteUrl: "https://joyagoo.com",
    enabled: true,
    order: 8,
    buildUrl: (sourceUrl: string, productId?: string): string => {
      const clean = cleanSourceUrl(sourceUrl);
      const pId = productId || extractProductId(clean) || "";
      const market = detectMarketplace(clean);
      const plat = market === "taobao" ? "TAOBAO" : market === "1688" ? "1688" : "WEIDIAN";
      return "https://joyagoo.com/product?id=" + pId + "&platform=" + plat + "&";
    }
  },

  // 9. BoonBuy: Official logo from boonbuy.com/logo.png
  boonbuy: {
    id: "boonbuy",
    name: "BoonBuy",
    tagline: "BoonBuy Modern Freight & Parcel Hub",
    shortCode: "BB",
    avatarBg: "from-lime-400 via-emerald-500 to-teal-700",
    avatarColor: "text-neutral-950 font-black",
    logoUrl: "/logos/boonbuy.png",
    websiteUrl: "https://boonbuy.com",
    enabled: true,
    order: 9,
    buildUrl: (sourceUrl: string, productId?: string): string => {
      const clean = cleanSourceUrl(sourceUrl);
      const pId = productId || extractProductId(clean) || "";
      const market = detectMarketplace(clean);
      if (market === "taobao") return "https://boonbuy.com/product/taobao/" + pId;
      if (market === "1688") return "https://boonbuy.com/product/1688/" + pId;
      return "https://boonbuy.com/product/weidian/" + pId;
    }
  }
};
