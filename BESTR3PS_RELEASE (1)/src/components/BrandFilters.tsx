import React, { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';

interface BrandFiltersProps {
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  availableBrands: string[];
  sortOption: 'default' | 'price-asc' | 'price-desc' | 'name';
  onSortChange: (sort: 'default' | 'price-asc' | 'price-desc' | 'name') => void;
}

// Brand mapping to official logo assets
export const BRAND_LOGO_MAP: Record<string, { logoPath: string; colorClass: string; bgClass: string }> = {
  'Nike': { logoPath: '/brand-logos/nike.svg', colorClass: 'text-white', bgClass: 'bg-neutral-800/90 border-neutral-600/60 shadow-sm' },
  'Jordan': { logoPath: '/brand-logos/jordan.svg', colorClass: 'text-red-500', bgClass: 'bg-neutral-800/90 border-red-500/50 shadow-sm' },
  'Adidas': { logoPath: '/brand-logos/adidas.svg', colorClass: 'text-white', bgClass: 'bg-neutral-800/90 border-neutral-600/60 shadow-sm' },
  'Louis Vuitton': { logoPath: '/brand-logos/louis-vuitton.svg', colorClass: 'text-amber-400', bgClass: 'bg-neutral-800/90 border-amber-500/50 shadow-sm' },
  'Ralph Lauren': { logoPath: '/brand-logos/ralph-lauren.svg', colorClass: 'text-sky-300', bgClass: 'bg-neutral-800/90 border-sky-500/40 shadow-sm' },
  'Balenciaga': { logoPath: '/brand-logos/balenciaga.svg', colorClass: 'text-white', bgClass: 'bg-neutral-800/90 border-neutral-600/60 shadow-sm' },
  'Dior': { logoPath: '/brand-logos/dior.svg', colorClass: 'text-neutral-200', bgClass: 'bg-neutral-800/90 border-neutral-600/60 shadow-sm' },
  'Stone Island': { logoPath: '/brand-logos/stone-island.svg', colorClass: 'text-amber-400', bgClass: 'bg-neutral-950 border-amber-500/30' },
  'Moncler': { logoPath: '/brand-logos/moncler.svg', colorClass: 'text-rose-400', bgClass: 'bg-neutral-900 border-rose-500/30' },
  'Corteiz': { logoPath: '/brand-logos/corteiz.svg', colorClass: 'text-emerald-400', bgClass: 'bg-neutral-950 border-emerald-500/30' },
  'Sp5der': { logoPath: '/brand-logos/sp5der.svg', colorClass: 'text-pink-400', bgClass: 'bg-neutral-900 border-pink-500/30' },
  'Travis Scott': { logoPath: '/brand-logos/travis-scott.svg', colorClass: 'text-amber-500', bgClass: 'bg-neutral-950 border-amber-600/30' },
  'Essentials': { logoPath: '/brand-logos/essentials.svg', colorClass: 'text-neutral-200', bgClass: 'bg-neutral-800/90 border-neutral-600/60 shadow-sm' },
  'Stussy': { logoPath: '/brand-logos/stussy.svg', colorClass: 'text-white', bgClass: 'bg-neutral-800/90 border-neutral-600/60 shadow-sm' },
  'Stüssy': { logoPath: '/brand-logos/stussy.svg', colorClass: 'text-white', bgClass: 'bg-neutral-800/90 border-neutral-600/60 shadow-sm' },
  'Trapstar': { logoPath: '/brand-logos/trapstar.svg', colorClass: 'text-amber-400', bgClass: 'bg-neutral-900 border-amber-500/30' },
  'New Balance': { logoPath: '/brand-logos/new-balance.svg', colorClass: 'text-sky-400', bgClass: 'bg-neutral-900 border-sky-500/30' }
};

export const BrandFilters: React.FC<BrandFiltersProps> = ({
  selectedBrand,
  onSelectBrand,
  availableBrands,
  sortOption,
  onSortChange
}) => {
  return (
    <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
      {/* Brand Chips with Real Uploaded Official Logos */}
      <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
        <button
          onClick={() => onSelectBrand('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer border ${
            selectedBrand === 'ALL'
              ? 'bg-amber-500 border-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/20'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
          }`}
        >
          All Brands
        </button>

        {availableBrands.map((brand) => {
          const isSelected = selectedBrand.toLowerCase() === brand.toLowerCase();
          const brandMeta = BRAND_LOGO_MAP[brand] || {
            logoPath: '',
            colorClass: 'text-amber-400',
            bgClass: 'bg-neutral-900 border-neutral-800'
          };

          return (
            <button
              key={brand}
              onClick={() => onSelectBrand(brand)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all cursor-pointer border group ${
                isSelected
                  ? 'bg-neutral-800 border-amber-500 text-amber-400 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
              }`}
            >
              {/* Official Brand Logo Icon */}
              <div 
                className={`w-5 h-5 rounded-lg ${brandMeta.bgClass} flex items-center justify-center p-0.5 shrink-0 overflow-hidden group-hover:scale-110 transition-transform`}
              >
                {brandMeta.logoPath ? (
                  <img
                    src={brandMeta.logoPath}
                    alt={`${brand} logo`}
                    className="w-full h-full object-contain drop-shadow-sm filter brightness-110 contrast-125"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-[9px] font-black text-amber-400 font-mono">
                    {brand.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              <span>{brand}</span>
            </button>
          );
        })}
      </div>

      {/* Sorting Control */}
      <div className="flex items-center gap-2 self-end md:self-auto shrink-0 text-xs">
        <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
        <span className="text-neutral-500">Sort:</span>
        <select
          value={sortOption}
          onChange={(e) => onSortChange(e.target.value as any)}
          className="bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 cursor-pointer"
        >
          <option value="default">Default Catalog Order</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name">Product Name (A-Z)</option>
        </select>
      </div>
    </div>
  );
};
