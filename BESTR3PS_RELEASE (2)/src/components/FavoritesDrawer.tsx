import React from 'react';
import { X, Trash2, ExternalLink, Heart } from 'lucide-react';
import { Product, AgentType } from '../types/product';
import { AGENTS } from '../utils/agentConverter';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: Product[];
  onRemoveFavorite: (productId: string) => void;
  onClearAll: () => void;
  onOpenDetails: (product: Product) => void;
  activeAgent: AgentType;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  favorites,
  onRemoveFavorite,
  onClearAll,
  onOpenDetails,
  activeAgent
}) => {
  if (!isOpen) return null;

  const currentAgent = AGENTS[activeAgent] || AGENTS.litbuy;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-neutral-900 border-l border-neutral-800 text-neutral-100 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/40">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <h2 className="text-base font-bold text-white">Saved Items ({favorites.length})</h2>
            </div>
            <div className="flex items-center gap-2">
              {favorites.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-xs text-neutral-400 hover:text-rose-400 px-2 py-1 rounded transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {favorites.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-14 h-14 rounded-2xl bg-neutral-800 flex items-center justify-center mb-3 text-neutral-500">
                  <Heart className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-neutral-300">Your collection is empty</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                  Tap the heart icon on any sneaker, hoodie or accessory to save it here for comparison.
                </p>
              </div>
            ) : (
              favorites.map((product) => {
                const buyUrl = currentAgent.buildUrl(product.sourceUrl, product.productId);
                return (
                  <div
                    key={product.id}
                    className="p-3 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 flex gap-3 hover:border-neutral-700 transition-colors"
                  >
                    <div 
                      onClick={() => {
                        onOpenDetails(product);
                        onClose();
                      }}
                      className="w-16 h-16 rounded-xl bg-neutral-900 overflow-hidden shrink-0 cursor-pointer flex items-center justify-center border border-neutral-800"
                    >
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-mono font-bold text-neutral-600">
                          {(product.brand || 'B').charAt(0)}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-amber-400 font-mono">
                            {product.price || 'USD Check'}
                          </span>
                          <button
                            onClick={() => onRemoveFavorite(product.id)}
                            className="text-neutral-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h4 
                          onClick={() => {
                            onOpenDetails(product);
                            onClose();
                          }}
                          className="text-xs font-medium text-neutral-200 line-clamp-1 hover:text-amber-400 cursor-pointer transition-colors"
                        >
                          {product.name}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={buyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-neutral-950 text-[11px] font-bold py-1 px-2 rounded-lg text-center transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>Buy on {currentAgent.name}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
