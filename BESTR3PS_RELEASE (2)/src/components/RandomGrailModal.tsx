import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Dices, X, ExternalLink, ShoppingBag, Check, Clock, Calendar } from 'lucide-react';
import { Product, AgentType } from '../types/product';
import { AGENTS } from '../utils/agentConverter';
import { CurrencyCode, formatPrice } from '../utils/currency';

interface RandomGrailModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  activeAgent: AgentType;
  currency: CurrencyCode;
  onSelectProduct: (p: Product) => void;
}

// Generate seeded pseudo-random number from date string (YYYY-MM-DD)
function getDailySeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Deterministic PRNG
function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function() {
    return (s = s * 16807 % 2147483647) / 2147483647;
  };
}

export const RandomGrailModal: React.FC<RandomGrailModalProps> = ({
  isOpen,
  onClose,
  products,
  activeAgent,
  currency,
  onSelectProduct
}) => {
  const [randomItems, setRandomItems] = useState<Product[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const currentAgentConfig = AGENTS[activeAgent] || AGENTS.litbuy;

  // Today's date string
  const todayStr = new Date().toISOString().split('T')[0];

  // Pick deterministic 8 items once per day based on date seed
  useEffect(() => {
    if (!products || products.length === 0) return;

    const validPool = products.filter(p => p.imageUrl && p.imageUrl.startsWith('http'));
    const source = validPool.length >= 8 ? validPool : products;

    // Use date as seed so today's 8 picks stay locked all day for everyone!
    const seed = getDailySeed(todayStr);
    const rng = seededRandom(seed);

    const poolCopy = [...source];
    const picked: Product[] = [];
    
    // Pick 8 unique items deterministically
    const targetCount = Math.min(8, poolCopy.length);
    for (let i = 0; i < targetCount; i++) {
      const idx = Math.floor(rng() * poolCopy.length);
      picked.push(poolCopy[idx]);
      poolCopy.splice(idx, 1);
    }

    setRandomItems(picked);
  }, [products, todayStr]);

  const handleCopyLink = (p: Product) => {
    try {
      const shareUrl = `${window.location.origin}/?product=${p.productId || p.id}&agent=${activeAgent}`;
      navigator.clipboard.writeText(shareUrl);
      setCopiedId(p.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl shadow-black overflow-hidden ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header with Daily Lock Badge */}
        <div className="p-4 sm:p-6 border-b border-neutral-800/80 bg-neutral-950/70 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-orange-500 flex items-center justify-center text-neutral-950 font-black shadow-lg shadow-amber-500/25">
              <Dices className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-xl font-bold text-white font-['Space_Grotesk']">
                  Daily Grail Spotlight
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Refreshes Daily at 00:00 UTC</span>
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Curated lucky spreadsheet grails with exclusive 45% discount, hand-picked for today.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300 font-mono">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Today's Picks ({todayStr})</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 8 Items Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 divide-y divide-neutral-850">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {randomItems.map((p, idx) => {
              const numPrice = typeof p.price === 'number' ? p.price : Number(p.price) || 0;
              const discountedPrice = Math.round(numPrice * 0.55); // -45%
              return (
                <div 
                  key={p.id || idx}
                  className="group bg-neutral-950/80 border border-neutral-800/90 hover:border-amber-500/40 rounded-2xl p-3 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-amber-500/5 relative"
                >
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="px-1.5 py-0.5 rounded bg-amber-500 text-neutral-950 font-black text-[9px] font-mono">
                      #{idx + 1} GRAIL
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold text-[9px] font-mono border border-rose-500/30">
                      -45% OFF
                    </span>
                  </div>

                  {/* Thumbnail Image */}
                  <div 
                    className="relative aspect-square w-full rounded-xl overflow-hidden bg-neutral-900/60 border border-neutral-850 mb-2.5 cursor-pointer"
                    onClick={() => {
                      onSelectProduct(p);
                      onClose();
                    }}
                  >
                    <img 
                      src={p.imageUrl} 
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  {/* Product Title */}
                  <div className="mb-2">
                    <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider mb-0.5">
                      {p.brand || 'Grail Find'}
                    </div>
                    <h4 
                      className="text-xs font-semibold text-white line-clamp-2 cursor-pointer hover:text-amber-400 transition-colors"
                      onClick={() => {
                        onSelectProduct(p);
                        onClose();
                      }}
                      title={p.name}
                    >
                      {p.name}
                    </h4>
                  </div>

                  {/* Price & Buy Button */}
                  <div className="pt-2 border-t border-neutral-800/80 mt-auto">
                    <div className="flex items-baseline gap-1.5 mb-2">
                      <span className="text-sm font-black text-amber-400 font-mono">
                        {formatPrice(discountedPrice, currency)}
                      </span>
                      <span className="text-[10px] text-neutral-500 line-through font-mono">
                        {formatPrice(p.price, currency)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => {
                          onSelectProduct(p);
                          onClose();
                        }}
                        className="w-full py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-bold transition-colors cursor-pointer text-center"
                      >
                        View QC
                      </button>

                      <a
                        href={p.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-[11px] font-black transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                      >
                        <span>{currentAgentConfig.name}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Note */}
        <div className="p-3 sm:p-4 bg-neutral-950 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Handpicked spreadsheet items with verified QC and direct shopping agent conversion.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
