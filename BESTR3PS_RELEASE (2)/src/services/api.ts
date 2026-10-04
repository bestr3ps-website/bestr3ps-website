import { Product, ApiResponse } from '../types/product';
import { SHEET_PRODUCTS } from '../data/fallbackProducts';
import { cleanSourceUrl, extractProductId } from '../utils/agentConverter';

// User's provided Apps Script endpoint
const USER_API_URL = 'https://script.google.com/macros/s/AKfycbwhRlI_Y9YS1jpA7owLYcqAJYv9IGTYNGFjuo3DDuFNQCVC6NIJisqF4KuX-fN9OTSt/exec';
const STORAGE_KEY = 'bestr3ps_api_url';
const CACHE_STORAGE_KEY = 'bestr3ps_cached_products';

export function getStoredApiUrl(): string {
  if (typeof window === 'undefined') return USER_API_URL;
  return localStorage.getItem(STORAGE_KEY) || USER_API_URL;
}

export function setStoredApiUrl(url: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, url.trim());
}

/**
 * Detect brand from product name
 */
export function detectBrand(name: string): string {
  const n = (name || '').toLowerCase();
  if (n.includes('nike') || n.includes('air max') || n.includes('dunk') || n.includes('af1') || n.includes('air force')) return 'Nike';
  if (n.includes('jordan') || n.includes('aj4') || n.includes('aj1') || n.includes('aj11')) return 'Jordan';
  if (n.includes('adidas') || n.includes('samba') || n.includes('spezial') || n.includes('campus')) return 'Adidas';
  if (n.includes('yeezy')) return 'Yeezy';
  if (n.includes('balenciaga')) return 'Balenciaga';
  if (n.includes('louis vuitton') || n.includes('lv ')) return 'Louis Vuitton';
  if (n.includes('stone island')) return 'Stone Island';
  if (n.includes('ralph lauren') || n.includes('polo')) return 'Ralph Lauren';
  if (n.includes('corteiz')) return 'Corteiz';
  if (n.includes('travis scott') || n.includes('utopia')) return 'Travis Scott';
  if (n.includes('sp5der') || n.includes('555555')) return 'Sp5der';
  if (n.includes('essentials') || n.includes('fog')) return 'Essentials';
  if (n.includes('hellstar')) return 'Hellstar';
  if (n.includes('trapstar')) return 'Trapstar';
  if (n.includes('syna') || n.includes('syna world')) return 'Syna World';
  if (n.includes('denim tears')) return 'Denim Tears';
  if (n.includes('gallery dept')) return 'Gallery Dept';
  if (n.includes('palm angels')) return 'Palm Angels';
  if (n.includes('stussy')) return 'Stussy';
  if (n.includes('burberry')) return 'Burberry';
  if (n.includes('chrome hearts')) return 'Chrome Hearts';
  if (n.includes('goyard')) return 'Goyard';
  if (n.includes('dior')) return 'Dior';
  if (n.includes('moncler')) return 'Moncler';
  if (n.includes('new balance') || n.includes('new blance')) return 'New Balance';
  if (n.includes('asics')) return 'Asics';
  if (n.includes('on cloud') || n.includes('cloudtilt')) return 'On Running';
  if (n.includes('hermes') || n.includes('hermès')) return 'Hermes';
  if (n.includes('gucci')) return 'Gucci';
  if (n.includes('cartier')) return 'Cartier';
  if (n.includes('apple') || n.includes('airpods')) return 'Apple';
  if (n.includes('world cup') || n.includes('fifa')) return 'World Cup';
  if (n.includes('jersey') || n.includes('training set') || n.includes('football')) return 'Jersey';
  return 'Streetwear';
}

/**
 * Normalizes raw product items coming from the Google Sheets Apps Script API
 */
function normalizeApiProducts(rawItems: any[]): Product[] {
  return rawItems
    .filter(item => {
      if (!item || (!item.name && !item.sourceUrl && !item.productId)) return false;
      const url = String(item.sourceUrl || item.link || item.url || '');
      const pid = String(item.productId || '');
      const cat = String(item.category || '').toUpperCase();
      if (url.includes('kakobuy') || url.toLowerCase().includes('purestyle') || pid.startsWith('772') || cat === 'HOTSALE') {
        return false;
      }
      return true;
    })
    .map((item, index) => {
      const sourceUrl = cleanSourceUrl(item.sourceUrl || item.link || item.url || '');
      const pId = item.productId || extractProductId(sourceUrl);
      const name = item.name || `Item ${pId || index + 1}`;
      return {
        id: item.id || `prod_${index}_${pId || Math.random()}`,
        name,
        sourceUrl,
        price: item.price || '',
        imageUrl: item.imageUrl || item.image || '',
        productId: pId,
        category: (item.category || 'HOTSALE').toUpperCase(),
        brand: detectBrand(name)
      };
    });
}

export interface FetchResult {
  products: Product[];
  isLive: boolean;
  debugStats?: Record<string, number>;
  totalCount: number;
  source: 'live_api' | 'cached' | 'fallback';
  error?: string;
}

/**
 * Fetch products from Apps Script API with timeout and robust fallback
 */

const CUSTOM_PRODUCTS_KEY = 'bestr3ps_custom_products';
const SITE_CONFIG_KEY = 'bestr3ps_site_config';

export interface SiteConfig {
  siteTitle: string;
  siteSubtitle: string;
  announcementText: string;
  bannerDiscountText: string;
  contactDiscord: string;
  contactWhatsApp: string;
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  siteTitle: 'BESTR3PS ARCHIVE',
  siteSubtitle: 'Curated Streetwear & Designer Finds Catalog',
  announcementText: '🔥 Daily Verified QC Photos • 0% Extra Agent Fees • Direct Link Conversion',
  bannerDiscountText: '⚡ TODAY ONLY: 45% OFF PROMO ACTIVE ON RANDOM GRAIL VAULT',
  contactDiscord: 'https://discord.gg',
  contactWhatsApp: '+86 188 8888 8888'
};

export function getStoredSiteConfig(): SiteConfig {
  if (typeof window === 'undefined') return DEFAULT_SITE_CONFIG;
  try {
    const raw = localStorage.getItem(SITE_CONFIG_KEY);
    if (raw) return { ...DEFAULT_SITE_CONFIG, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_SITE_CONFIG;
}

export function saveStoredSiteConfig(config: SiteConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SITE_CONFIG_KEY, JSON.stringify(config));
}

export function getCustomProducts(): Product[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_PRODUCTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}


export function saveBatchCustomProducts(products: Product[]): void {
  if (typeof window === 'undefined' || !products.length) return;
  const list = getCustomProducts();
  // Filter out any duplicates by ID
  const newIds = new Set(products.map(p => p.id));
  const remaining = list.filter(p => !newIds.has(p.id));
  const merged = [...products, ...remaining];
  localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(merged));
}

export function saveCustomProduct(product: Product): void {
  if (typeof window === 'undefined') return;
  const list = getCustomProducts();
  const existingIdx = list.findIndex(p => p.id === product.id);
  if (existingIdx >= 0) {
    list[existingIdx] = product;
  } else {
    list.unshift(product);
  }
  localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(list));
}

export function deleteCustomProduct(productId: string): void {
  if (typeof window === 'undefined') return;
  const list = getCustomProducts().filter(p => p.id !== productId);
  localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(list));
}

export function clearCustomProducts(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CUSTOM_PRODUCTS_KEY);
}


// -------------------------------------------------------------------------
// Master Product Overrides (Edit Image, Name, Price, Brand, Category, URL)
// Applies instantly to BOTH Google Sheet synced items and Custom Uploads!
// -------------------------------------------------------------------------
const PRODUCT_OVERRIDES_KEY = 'bestr3ps_product_overrides';

export function getProductOverrides(): Record<string, Partial<Product>> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(PRODUCT_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveProductOverride(productId: string, updates: Partial<Product>): void {
  if (typeof window === 'undefined') return;
  const current = getProductOverrides();
  current[productId] = {
    ...(current[productId] || {}),
    ...updates,
    id: productId
  };
  localStorage.setItem(PRODUCT_OVERRIDES_KEY, JSON.stringify(current));
}

export function deleteProductOverride(productId: string): void {
  if (typeof window === 'undefined') return;
  const current = getProductOverrides();
  delete current[productId];
  localStorage.setItem(PRODUCT_OVERRIDES_KEY, JSON.stringify(current));
}

export function applyOverridesToProducts(items: Product[]): Product[] {
  const overrides = getProductOverrides();
  if (Object.keys(overrides).length === 0) return items;

  return items.map(p => {
    const pId = p.productId || p.id;
    const match = overrides[p.id] || (p.productId ? overrides[p.productId] : undefined);
    if (match) {
      return {
        ...p,
        ...match
      };
    }
    return p;
  });
}

export async function fetchCatalog(apiUrlOverride?: string, forceRefresh: boolean = false): Promise<FetchResult> {
  const url = apiUrlOverride || getStoredApiUrl();

  try {
    const fetchUrl = new URL(url);
    if (forceRefresh) {
      fetchUrl.searchParams.set('refresh', 'true');
    }
    fetchUrl.searchParams.set('_t', Date.now().toString());

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(fetchUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: ApiResponse = await response.json();
    
    let rawList: any[] = [];
    if (Array.isArray((data as any).products) && (data as any).products.length > 0) {
      rawList = (data as any).products;
    } else if (data.data && typeof data.data === 'object') {
      Object.keys(data.data).forEach(cat => {
        const catItems = data.data![cat];
        if (Array.isArray(catItems)) {
          catItems.forEach(item => {
            rawList.push({ ...item, category: cat });
          });
        }
      });
    }

    if (rawList.length > 0) {
      const normalized = normalizeApiProducts(rawList);
      
      try {
        localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify({
          timestamp: Date.now(),
          products: normalized,
          debugStats: data.DEBUG || {}
        }));
      } catch {
        // ignore
      }

      const custom = getCustomProducts();
      const merged = applyOverridesToProducts([...custom, ...normalized]);
      return {
        products: merged,
        isLive: true,
        debugStats: data.DEBUG,
        totalCount: normalized.length,
        source: 'live_api'
      };
    }
  } catch (err: any) {
    // If user's script has not been updated with doGet yet, fallback gracefully
    console.warn('Apps Script returned error or cold start, using parsed items:', err);
  }

  const custom = getCustomProducts();
  const merged = applyOverridesToProducts([...custom, ...SHEET_PRODUCTS]);
  return {
    products: merged,
    isLive: false,
    totalCount: SHEET_PRODUCTS.length,
    source: 'fallback'
  };
}
