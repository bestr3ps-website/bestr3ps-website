import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Product, 
  CategoryKey, 
  AgentType 
} from './types/product';
import { fetchCatalog } from './services/api';
import { SHEET_PRODUCTS } from './data/fallbackProducts';
import { Header } from './components/Header';
import { CategoryNav } from './components/CategoryNav';
import { BrandFilters } from './components/BrandFilters';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { RandomGrailModal } from './components/RandomGrailModal';
import { EndorsementGuideModal } from './components/EndorsementGuideModal';
import { ToolsModal } from './components/ToolsModal';
import { CustomerRequestModal } from './components/CustomerRequestModal';
import { TrustEndorsementBanner } from './components/TrustEndorsementBanner';
import { trackAgentView, trackAgentDwellTime } from './services/adminService';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminMasterModal } from './components/AdminMasterModal';
import { getAdminSession, trackPageView, initGa4Script, getGa4Config } from './services/adminService';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { HeroBanner } from './components/HeroBanner';
import { FloatingContactWidget } from './components/FloatingContactWidget';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { CurrencyCode } from './utils/currency';
import { 
  Search, 
  ChevronDown
} from 'lucide-react';

const FAVORITES_STORAGE_KEY = 'bestr3ps_favorites';
const AGENT_STORAGE_KEY = 'bestr3ps_agent';
const CURRENCY_STORAGE_KEY = 'bestr3ps_currency';

export default function App() {
  // 0s Instant Load: pre-seed with local catalog so user sees products immediately
  
  useEffect(() => {
    trackPageView();
    initGa4Script(getGa4Config());
  }, []);
const [products, setProducts] = useState<Product[]>(() => SHEET_PRODUCTS);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Filters & State
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [sortOption, setSortOption] = useState<'default' | 'price-asc' | 'price-desc' | 'name'>('default');
  
  // Currency State (USD, GBP, EUR, CAD, AUD, CNY)
  const [currentCurrency, setCurrentCurrency] = useState<CurrencyCode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (stored && ['USD', 'GBP', 'EUR', 'CAD', 'AUD', 'CNY'].includes(stored)) {
        return stored as CurrencyCode;
      }
    }
    return 'USD';
  });

  // Active Agent (Synced with URL ?agent=xxx or ?a=xxx and localStorage, default to litbuy)
  const [activeAgent, setActiveAgent] = useState<AgentType>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlAgent = (urlParams.get('agent') || urlParams.get('a') || '').toLowerCase();
      const validAgents = ['litbuy', 'rizzitgo', 'hipobuy', 'kakobuy', 'usfans', 'oopbuy', 'cssbuy', 'joyagoo', 'boonbuy'];
      if (urlAgent && validAgents.includes(urlAgent)) {
        localStorage.setItem(AGENT_STORAGE_KEY, urlAgent);
        return urlAgent as AgentType;
      }
      const stored = localStorage.getItem(AGENT_STORAGE_KEY);
      if (stored && validAgents.includes(stored)) {
        return stored as AgentType;
      }
    }
    return 'litbuy';
  });

  // Favorites
  const [favorites, setFavorites] = useState<Product[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState<boolean>(false);
  const [isRandomGrailOpen, setIsRandomGrailOpen] = useState<boolean>(false);
  const [isEndorsementGuideOpen, setIsEndorsementGuideOpen] = useState<boolean>(false);
  const [isToolsModalOpen, setIsToolsModalOpen] = useState<boolean>(false);
  const [isCustomerRequestOpen, setIsCustomerRequestOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const [isAdminMasterOpen, setIsAdminMasterOpen] = useState<boolean>(false);

  const handleOpenAdmin = () => {
    const session = getAdminSession();
    if (session) {
      setIsAdminMasterOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  // Pagination
  const [visibleCount, setVisibleCount] = useState<number>(48);
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);



  // Load Catalog
  const loadData = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    try {
      const result = await fetchCatalog(undefined, forceRefresh);
      setProducts(result.products);
    } catch {
      // safely handled inside api service
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Persist currency choice
  const handleCurrencyChange = (curr: CurrencyCode) => {
    setCurrentCurrency(curr);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENCY_STORAGE_KEY, curr);
    }
  };

  // Persist agent choice & sync with browser URL query (?agent=xxx)
  const handleAgentChange = (agent: AgentType) => {
    setActiveAgent(agent);
    if (typeof window !== 'undefined') {
      localStorage.setItem(AGENT_STORAGE_KEY, agent);
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('agent', agent);
        window.history.replaceState({}, '', url.toString());
      } catch {
        // ignore
      }
    }
  };

  // Sync initial URL on mount if not already present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (!url.searchParams.get('agent')) {
        url.searchParams.set('agent', activeAgent);
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [activeAgent]);

    // Real tracking only upon user interaction


  // Random Grail Feature: opens dedicated showcase with 6-8 random spreadsheet items with -45% deal
  const handleRandomFind = () => {
    setIsRandomGrailOpen(true);
  };

  // Toggle favorite
  const handleToggleFavorite = (product: Product) => {
    setFavorites(prev => {
      const exists = prev.some(item => item.id === product.id);
      let updated: Product[];
      if (exists) {
        updated = prev.filter(item => item.id !== product.id);
      } else {
        updated = [product, ...prev];
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleRemoveFavorite = (id: string) => {
    setFavorites(prev => {
      const updated = prev.filter(item => item.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleClearFavorites = () => {
    setFavorites([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(FAVORITES_STORAGE_KEY);
    }
  };

  // Compute available popular brands
  const availableBrands = useMemo(() => {
    const brandCounts: Record<string, number> = {};
    products.forEach(p => {
      if (p.brand && p.brand !== 'Streetwear') {
        brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
      }
    });
    return Object.keys(brandCounts)
      .sort((a, b) => brandCounts[b] - brandCounts[a])
      .slice(0, 12);
  }, [products]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: products.length };
    products.forEach(p => {
      const cat = p.category || 'HOTSALE';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Filter and Sort Products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (activeCategory !== 'ALL') {
        if (product.category !== activeCategory) {
          if (activeCategory === 'T-SHIRTS/SHORTS' && (product.category === 'TEE' || product.category === 'TOP' || product.category === 'SHORTS')) {
            // match
          } else if (activeCategory === 'HOODIE/PANTS' && (product.category === 'HOODIE' || product.category === 'PANTS')) {
            // match
          } else {
            return false;
          }
        }
      }

      if (selectedBrand !== 'ALL') {
        if ((product.brand || '').toLowerCase() !== selectedBrand.toLowerCase()) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inName = (product.name || '').toLowerCase().includes(q);
        const inBrand = (product.brand || '').toLowerCase().includes(q);
        const inId = (product.productId || '').toLowerCase().includes(q);
        const inCat = (product.category || '').toLowerCase().includes(q);
        if (!inName && !inBrand && !inId && !inCat) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortOption === 'price-asc') {
        const pa = parseFloat((a.price || '').replace(/[^0-9.]/g, '')) || 0;
        const pb = parseFloat((b.price || '').replace(/[^0-9.]/g, '')) || 0;
        return pa - pb;
      }
      if (sortOption === 'price-desc') {
        const pa = parseFloat((a.price || '').replace(/[^0-9.]/g, '')) || 0;
        const pb = parseFloat((b.price || '').replace(/[^0-9.]/g, '')) || 0;
        return pb - pa;
      }
      if (sortOption === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      }
      return 0;
    });
  }, [products, activeCategory, selectedBrand, searchQuery, sortOption]);

  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  useEffect(() => {
    setVisibleCount(48);
  }, [activeCategory, selectedBrand, searchQuery, sortOption]);

  // Auto Infinite Scroll Sentinel with IntersectionObserver (placed after filteredProducts declaration)
  useEffect(() => {
    const sentinel = loadMoreSentinelRef.current;
    if (!sentinel) return;

    const totalCount = filteredProducts.length;
    const observer = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first && first.isIntersecting) {
        setVisibleCount((prev) => {
          if (prev < totalCount) {
            return Math.min(prev + 48, totalCount);
          }
          return prev;
        });
      }
    }, { rootMargin: '350px 0px 350px 0px' });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredProducts.length]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500 selection:text-neutral-950 relative">
      {/* Top Global Header with Currency / Region Switcher */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeAgent={activeAgent}
        onAgentChange={handleAgentChange}
        favoritesCount={favorites.length}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        currentCurrency={currentCurrency}
        onCurrencyChange={handleCurrencyChange}
        onOpenAdmin={handleOpenAdmin}
        onOpenEndorsementGuide={() => setIsEndorsementGuideOpen(true)}
        onOpenTools={() => setIsToolsModalOpen(true)}
        onOpenRequest={() => setIsCustomerRequestOpen(true)}
      />

      {/* Hero Showcase Banner */}
      <HeroBanner
        totalCount={products.length}
        onSelectCategory={setActiveCategory}
        isLoading={isLoading}
        onRefresh={() => loadData(true)}
        onRandomFind={handleRandomFind}
        activeAgent={activeAgent}
        onOpenEndorsementGuide={() => setIsEndorsementGuideOpen(true)}
        onOpenTools={() => setIsToolsModalOpen(true)}
        onOpenRequest={() => setIsCustomerRequestOpen(true)}
      />

      {/* Rich Category Navigation Bar with Visual Thumbnails */}
      <CategoryNav
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          setSelectedBrand('ALL');
        }}
      />

      {/* Brand Filters with Brand Logos & Sorting */}
      <BrandFilters
        selectedBrand={selectedBrand}
        onSelectBrand={setSelectedBrand}
        availableBrands={availableBrands}
        sortOption={sortOption}
        onSortChange={setSortOption}
      />

      {/* Main Catalog Grid Area */}
      <main className="flex-1 max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* Results summary row - clean luxury catalog header with NO count numbers */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800/60 mb-6 text-xs text-neutral-400">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-neutral-100 text-sm tracking-wide font-['Space_Grotesk']">
              {activeCategory === 'ALL' ? 'Curated Vault' : activeCategory}
            </span>
            {searchQuery && (
              <>
                <span className="text-neutral-700">•</span>
                <span className="text-amber-400/90 font-medium">
                  Matching &ldquo;{searchQuery}&rdquo;
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3.5">
            <div className="flex items-center gap-1.5 text-neutral-300">
              <span className="text-neutral-500">Currency:</span>
              <span className="font-bold text-amber-400 font-mono">{currentCurrency}</span>
            </div>
            <span className="text-neutral-700">•</span>
            <div className="flex items-center gap-1.5 text-neutral-300">
              <span className="text-neutral-500">Agent:</span>
              <span className="font-bold text-amber-400 uppercase font-mono">{activeAgent}</span>
            </div>
          </div>
        </div>

        {/* Empty Search Result */}
        {!isLoading && filteredProducts.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500 mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-neutral-200">No matching products found</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm">
              Try changing search keywords or resetting brand and category filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedBrand('ALL');
                setActiveCategory('ALL');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Product Cards Grid */}
        {visibleProducts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8 gap-3 sm:gap-4.5">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                activeAgent={activeAgent}
                isFavorite={favorites.some(f => f.id === product.id)}
                onToggleFavorite={handleToggleFavorite}
                onOpenDetails={setSelectedProduct}
                currency={currentCurrency}
              />
            ))}
          </div>
        )}

        {/* Auto Infinite Scroll Sentinel & Smooth Loading Indicator */}
        {visibleCount < filteredProducts.length && (
          <div 
            ref={loadMoreSentinelRef} 
            className="pt-8 pb-12 flex flex-col items-center justify-center gap-2 text-neutral-400"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900/90 border border-neutral-800 text-xs text-neutral-300 shadow-md">
              <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span>Loading more finds...</span>
            </div>
            <p className="text-[11px] text-neutral-400">Scroll down for next batch automatically</p>
          </div>
        )}
      </main>

      {/* Floating Right Docked Contact Widget (Discord + WhatsApp) */}
      <FloatingContactWidget onOpenRequest={() => setIsCustomerRequestOpen(true)} />
      {/* 一键返回顶部悬浮按钮 (Smooth Scroll To Top) */}
      <ScrollToTopButton />

      {/* Clean Commercial Footer */}
      <footer className="border-t border-neutral-800 bg-neutral-950/80 mt-16 py-8 text-neutral-400 text-xs">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-amber-400 tracking-wider font-['Space_Grotesk'] text-sm">
              BESTR3PS
            </span>
            <span>•</span>
            <span>Worldwide Streetwear & Sneaker Finds Catalog</span>
          </div>
          <div className="flex items-center gap-4 text-neutral-400">
            <button 
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-neutral-200 transition-colors cursor-pointer"
            >
              Back to Top ⬆️
            </button>
          </div>
        </div>
      </footer>

      {/* Random Grail 6-8 Items Deal Showcase Modal */}
            {/* Chinese Shopping Agent Endorsement Guide Modal */}
            {/* Customer Custom Product Sourcing Request Window */}
      <CustomerRequestModal
        isOpen={isCustomerRequestOpen}
        onClose={() => setIsCustomerRequestOpen(false)}
        showToast={showToast}
      />
      <ToolsModal
        isOpen={isToolsModalOpen}
        onClose={() => setIsToolsModalOpen(false)}
        activeAgent={activeAgent}
        onSelectAgent={handleAgentChange}
        products={products}
      />

      <EndorsementGuideModal
        isOpen={isEndorsementGuideOpen}
        onClose={() => setIsEndorsementGuideOpen(false)}
        activeAgent={activeAgent}
        onSelectAgent={handleAgentChange}
      />

      {/* Admin Login Gateway Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={() => {
          setIsAdminLoginOpen(false);
          setIsAdminMasterOpen(true);
        }}
      />

      {/* Admin Master Management Dashboard Modal */}
      <AdminMasterModal
        isOpen={isAdminMasterOpen}
        onClose={() => setIsAdminMasterOpen(false)}
        products={products}
        activeAgent={activeAgent}
        onRefreshCatalog={() => loadData(true)}
      />

      <RandomGrailModal
        isOpen={isRandomGrailOpen}
        onClose={() => setIsRandomGrailOpen(false)}
        products={products}
        activeAgent={activeAgent}
        currency={currentCurrency}
        onSelectProduct={setSelectedProduct}
      />

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        activeAgent={activeAgent}
        onAgentChange={handleAgentChange}
        isFavorite={selectedProduct ? favorites.some(f => f.id === selectedProduct.id) : false}
        onToggleFavorite={handleToggleFavorite}
        currency={currentCurrency}
      />

      {/* Favorites Drawer */}
      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onRemoveFavorite={handleRemoveFavorite}
        onClearAll={handleClearFavorites}
        onOpenDetails={setSelectedProduct}
        activeAgent={activeAgent}
      />
    </div>
  );
}



