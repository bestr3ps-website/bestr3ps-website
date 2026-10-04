import { BRAND_LOGO_MAP } from './BrandFilters';
import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  ExternalLink, 
  Copy, 
  Check, 
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { Product, AgentType } from '../types/product';
import { AGENTS } from '../utils/agentConverter';
import { trackProductClick, trackProductView } from '../services/adminService';
import { CurrencyCode, formatPrice } from '../utils/currency';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  activeAgent: AgentType;
  onAgentChange: (agent: AgentType) => void;
  isFavorite: boolean;
  onToggleFavorite: (product: Product) => void;
  currency?: CurrencyCode;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  activeAgent,
  onAgentChange,
  isFavorite,
  onToggleFavorite,
  currency = 'USD'
}) => {
    React.useEffect(() => {
    if (product) {
      trackProductView(product);
    }
  }, [product?.id]);

const [copiedAgent, setCopiedAgent] = useState<string | null>(null);

  if (!product) return null;

  const currentAgent = AGENTS[activeAgent] || AGENTS.litbuy;
  const currentAgentUrl = currentAgent.buildUrl(product.sourceUrl, product.productId);

  const handleCopy = (agentId: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedAgent(agentId);
    setTimeout(() => setCopiedAgent(null), 1500);
  };

  const displayPrice = formatPrice(product.price, currency);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col md:flex-row max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-neutral-950/80 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Side: Product Image */}
        <div className="md:w-1/2 bg-neutral-950 flex items-center justify-center p-6 relative">
          <div className="w-full aspect-square relative rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-neutral-600">
                <ShoppingBag className="w-16 h-16 opacity-30 text-amber-500 mb-2" />
                <span className="text-xs font-medium text-neutral-400">Streetwear Batch</span>
              </div>
            )}

            {product.brand && (() => {
              const bMeta = BRAND_LOGO_MAP[product.brand];
              return (
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1.5 rounded-xl bg-neutral-950/90 backdrop-blur-md border border-neutral-800 text-xs font-bold text-neutral-200 flex items-center gap-2 shadow-lg">
                    {bMeta?.logoPath ? (
                      <div className="w-5 h-5 rounded-md bg-neutral-900 border border-neutral-700/80 flex items-center justify-center p-0.5">
                        <img 
                          src={bMeta.logoPath} 
                          alt="" 
                          className={`w-full h-full object-contain ${bMeta.colorClass}`}
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      </div>
                    ) : null}
                    <span className="text-amber-400">{product.brand}</span>
                  </span>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Right Side: Details & 9 Agent Launchers */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto max-h-[60vh] md:max-h-[90vh]">
          <div className="space-y-4">
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-neutral-400 mb-1">
                <span>{product.category}</span>
                {product.productId && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-neutral-400">ID: {product.productId}</span>
                  </>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white leading-tight">
                {product.name}
              </h2>
              <div className="mt-2 text-2xl font-black text-amber-400 font-mono">
                {displayPrice || 'Best Price'}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleFavorite(product)}
                className={`flex-1 py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                  isFavorite
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
                <span>{isFavorite ? 'Saved in Favorites' : 'Add to Favorites'}</span>
              </button>

              <button
                onClick={() => handleCopy('main', currentAgentUrl)}
                className="py-2 px-3 rounded-xl border border-neutral-700 bg-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Copy product link"
              >
                {copiedAgent === 'main' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Share2 className="w-3.5 h-3.5" />
                )}
                <span>Share</span>
              </button>
            </div>

            {/* Primary Action Button */}
            <a
              href={currentAgentUrl}
              onClick={() => trackProductClick(product, currentAgent.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all text-sm"
            >
              <span>Buy on {currentAgent.name}</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* All 9 Agents Options */}
            <div className="pt-2">
              <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Or Select from 9 Agents:</span>
                <span className="text-[10px] text-amber-400 font-mono">CLEAN LINKS</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-52 overflow-y-auto pr-1">
                {Object.values(AGENTS).map((ag) => {
                  const url = ag.buildUrl(product.sourceUrl, product.productId);
                  const isSelected = activeAgent === ag.id;

                  return (
                    <div
                      key={ag.id}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-xs transition-colors ${
                        isSelected 
                          ? 'bg-neutral-800 border-amber-500/80 text-amber-400' 
                          : 'bg-neutral-950/60 border-neutral-800/80 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <button
                        onClick={() => onAgentChange(ag.id)}
                        className="text-left font-medium truncate flex-1 hover:underline cursor-pointer flex items-center gap-2"
                        title={ag.tagline}
                      >
                        {ag.logoUrl ? (
                          <img 
                            src={ag.logoUrl} 
                            alt="" 
                            className="w-4 h-4 object-contain rounded bg-neutral-900 border border-neutral-800 p-0.5" 
                            onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                          />
                        ) : null}
                        <span>{ag.name}</span>
                      </button>

                      <div className="flex items-center gap-1 shrink-0 ml-1">
                        <button
                          onClick={() => handleCopy(ag.id, url)}
                          className="p-1 rounded hover:bg-neutral-800 text-neutral-500 hover:text-neutral-300"
                          title="Copy link"
                        >
                          {copiedAgent === ag.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>

                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-amber-400"
                          title={`Open ${ag.name}`}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
