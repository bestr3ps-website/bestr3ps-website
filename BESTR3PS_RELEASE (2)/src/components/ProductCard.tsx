import { BRAND_LOGO_MAP } from './BrandFilters';
import React, { useState } from 'react';
import { 
  Heart, 
  ExternalLink, 
  Check, 
  Copy, 
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { Product, AgentType } from '../types/product';
import { AGENTS } from '../utils/agentConverter';
import { trackProductClick, trackProductView } from '../services/adminService';
import { CurrencyCode, formatPrice } from '../utils/currency';

interface ProductCardProps {
  product: Product;
  activeAgent: AgentType;
  isFavorite: boolean;
  onToggleFavorite: (product: Product) => void;
  onOpenDetails: (product: Product) => void;
  currency?: CurrencyCode;
  showDealBadge?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  activeAgent,
  isFavorite,
  onToggleFavorite,
  onOpenDetails,
  currency = 'USD',
  showDealBadge = false
}) => {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const agentConfig = AGENTS[activeAgent] || AGENTS.litbuy;
  const agentUrl = agentConfig.buildUrl(product.sourceUrl, product.productId);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(agentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(product);
  };

  const handleBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackProductClick(product, activeAgent);
    window.open(agentUrl, '_blank', 'noopener,noreferrer');
  };

  const displayPrice = formatPrice(product.price, currency);
  // Strikethrough price and -45% discount ONLY shown when showDealBadge is active (e.g. in Random Grail lucky modal)
  const origPriceVal = showDealBadge
    ? (product.originalPrice || (product.price ? '$' + (parseFloat(product.price.replace(/[^0-9.]/g, '') || '0') * 1.82).toFixed(2) : ''))
    : '';
  const displayOriginalPrice = origPriceVal ? formatPrice(origPriceVal, currency) : '';
  const discountRate = product.discountPercent || 45;

  return (
    <div 
      onClick={() => { trackProductView(product); onOpenDetails(product); }}
      className="group relative bg-neutral-900/70 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700/80 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col hover:-translate-y-1 shadow-sm hover:shadow-xl hover:shadow-black/50 cursor-pointer"
    >
      {/* Product Image Area */}
      <div className="relative aspect-square w-full bg-neutral-950 overflow-hidden">
        {product.imageUrl && !imgError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            onError={() => setImgError(true)}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-neutral-900 to-neutral-950 text-neutral-600">
            <ShoppingBag className="w-10 h-10 mb-2 opacity-40 text-amber-500" />
            <span className="text-[11px] font-medium text-neutral-400 text-center line-clamp-1">
              {product.brand || 'Streetwear'}
            </span>
          </div>
        )}

        {/* Brand Badge & Deal Tag */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
          {product.brand && (() => {
            const bMeta = BRAND_LOGO_MAP[product.brand];
            return (
              <span className="px-2 py-0.5 rounded-md bg-neutral-950/90 backdrop-blur-md border border-neutral-800 text-[10px] font-semibold text-neutral-200 tracking-wider flex items-center gap-1.5 shadow-sm">
                {bMeta?.logoPath ? (
                  <img 
                    src={bMeta.logoPath} 
                    alt="" 
                    className={`w-3.5 h-3.5 object-contain ${bMeta.colorClass}`}
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                ) : null}
                <span>{product.brand}</span>
              </span>
            );
          })()}
          {showDealBadge && (
            <span className="px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-tight shadow-md flex items-center gap-0.5 animate-pulse">
              -{discountRate}% OFF
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${
            isFavorite
              ? 'bg-rose-500 border-rose-400 text-white'
              : 'bg-neutral-950/70 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
          title={isFavorite ? 'Remove from saved' : 'Save find'}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Subtle quick ID tag */}
        {product.productId && (
          <div className="absolute bottom-2 left-2.5">
            <span className="text-[9px] font-mono text-neutral-400/80 bg-neutral-950/60 px-1.5 py-0.5 rounded backdrop-blur-xs">
              #{product.productId.slice(-5)}
            </span>
          </div>
        )}
      </div>

      {/* Product Content Details */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          {/* Price, Strikethrough & Category */}
          <div className="flex items-baseline justify-between gap-1 mb-1">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-sm sm:text-base font-extrabold text-amber-400 font-mono tracking-tight">
                {displayPrice || 'Best Price'}
              </span>
              {displayOriginalPrice && (
                <span className="text-[11px] sm:text-xs text-neutral-400 font-mono line-through opacity-85">
                  {displayOriginalPrice}
                </span>
              )}
            </div>
            <span className="text-[10px] text-neutral-400 font-medium truncate max-w-[80px]">
              {product.category}
            </span>
          </div>

          {/* Product Title */}
          <h3 
            className="text-xs sm:text-sm font-semibold text-neutral-200 group-hover:text-white line-clamp-2 leading-snug"
            title={product.name}
          >
            {product.name}
          </h3>
        </div>

        {/* Bottom Actions Row */}
        <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between gap-2">
          {/* Direct Agent Purchase Button */}
          <button
            onClick={handleBuyClick}
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold py-1.5 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <span>Buy with {agentConfig.name}</span>
            <ExternalLink className="w-3 h-3 shrink-0" />
          </button>

          {/* Copy Clean Link */}
          <button
            onClick={handleCopyLink}
            className="p-1.5 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors shrink-0"
            title="Copy clean link"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
