import React, { useRef, useState, useEffect } from 'react';
import { CategoryKey } from '../types/product';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryNavProps {
  activeCategory: CategoryKey;
  onSelectCategory: (cat: CategoryKey) => void;
  categoryCounts?: Record<string, number>;
}

interface CategoryCard {
  id: CategoryKey;
  label: string;
  sublabel: string;
  image: string;
}

// Visual category showcase with large icons, top-image layout, and curated Balenciaga LED / Grails
const CATEGORY_ITEMS: CategoryCard[] = [
  { 
    id: 'ALL', 
    label: 'All Finds', 
    sublabel: 'Full Vault',
    // Luxury hype neon sneaker & street showcase
    image: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=600&auto=format&fit=crop&q=90'
  },
  { 
    id: 'SNEAKERS', 
    label: 'Sneakers', 
    sublabel: 'Shoes & Kicks',
    // Balenciaga Track LED
    image: 'https://si.geilicdn.com/open1841495211-1234478995-608a0000019cd1dbb94a0a8115c2_828_828.jpg.webp'
  },
  { 
    id: 'T-SHIRTS/SHORTS', 
    label: 'Tees & Shorts', 
    sublabel: 'T-Shirts & Sets',
    image: 'https://i.postimg.cc/mgVvR0Pq/10.png'
  },
  { 
    id: 'HOODIE/PANTS', 
    label: 'Hoodies & Pants', 
    sublabel: 'Sweats & Denim',
    image: 'https://i.postimg.cc/5291drcR/6.png'
  },
  { 
    id: 'DOWNJACKET', 
    label: 'Coats & Jackets', 
    sublabel: 'Puffers & Parkas',
    image: 'https://i.postimg.cc/gJV2sZb9/1.png'
  },
  { 
    id: 'ACCESSORIES', 
    label: 'Accessories', 
    sublabel: 'Hats, Belts, Caps',
    image: 'https://i.postimg.cc/0y1kWFKJ/1.png'
  },
  { 
    id: 'BAGS', 
    label: 'Bags & Wallets', 
    sublabel: 'Backpacks & Luggage',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=90'
  }
];

export const CategoryNav: React.FC<CategoryNavProps> = ({
  activeCategory,
  onSelectCategory,
  categoryCounts
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -350 : 350;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div className="bg-neutral-900/95 border-b border-neutral-800/90 relative z-10 backdrop-blur-md shadow-md py-2.5">
      <div className="max-w-[1720px] mx-auto px-2 sm:px-6 lg:px-8 relative flex items-center">
        {/* Left Arrow Button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-1 z-10 w-10 h-10 rounded-full bg-neutral-900/95 border border-neutral-700 text-neutral-200 shadow-2xl flex items-center justify-center hover:bg-neutral-800 hover:text-amber-400 transition-all cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Scrollable Container with Top-Image, Bottom-Text Cards */}
        <div 
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex items-center gap-3 sm:gap-4 overflow-x-auto scroll-smooth py-1 px-1 w-full"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#404040 transparent'
          }}
        >
          {CATEGORY_ITEMS.map((item) => {
            const isActive = activeCategory === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectCategory(item.id)}
                className={`group flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl shrink-0 transition-all duration-200 cursor-pointer border text-center min-w-[136px] sm:min-w-[168px] ${
                  isActive
                    ? 'bg-neutral-800 border-amber-500 ring-2 ring-amber-500/40 shadow-xl shadow-amber-500/10 scale-[1.04]'
                    : 'bg-neutral-900/90 border-neutral-800/90 hover:border-neutral-700 hover:bg-neutral-850/90 hover:scale-[1.02]'
                }`}
              >
                {/* Large Round / Square Image on TOP (70px x 70px) */}
                <div className="w-[88px] h-[88px] sm:w-[104px] sm:h-[104px] rounded-2xl overflow-hidden shrink-0 bg-neutral-950 relative border border-neutral-700/80 shadow-md group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={item.image}
                    alt={item.label}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {isActive && (
                    <div className="absolute inset-0 bg-amber-500/10 ring-2 ring-amber-400 inset-0" />
                  )}
                </div>

                {/* Text on BOTTOM */}
                <div className="flex flex-col items-center justify-center mt-2 w-full">
                  <span className={`text-xs sm:text-sm font-bold whitespace-nowrap leading-tight tracking-tight ${
                    isActive ? 'text-amber-400 font-extrabold' : 'text-neutral-200 group-hover:text-white'
                  }`}>
                    {item.label}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-neutral-400 font-medium leading-none mt-1 whitespace-nowrap">
                    {item.sublabel}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Arrow Button */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-1 z-10 w-10 h-10 rounded-full bg-neutral-900/95 border border-neutral-700 text-neutral-200 shadow-2xl flex items-center justify-center hover:bg-neutral-800 hover:text-amber-400 transition-all cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};
