import React from 'react';

interface BrandIconProps {
  brand: string;
  className?: string;
}

export const BrandIcon: React.FC<BrandIconProps> = ({ brand, className = "w-4 h-4" }) => {
  const norm = brand.trim().toLowerCase();

  // 1. Louis Vuitton (LV Interlocked Monogram)
  if (norm.includes('louis vuitton') || norm === 'lv') {
    return (
      <svg viewBox="0 0 100 100" fill="currentColor" className={className} aria-label="Louis Vuitton">
        {/* Iconic LV Overlapping Monogram */}
        <path d="M22 18 h12 v48 h30 v12 H22 Z" />
        <path d="M42 22 l18 56 h14 l18 -56 h-13 l-12 40 l-12 -40 Z" />
      </svg>
    );
  }

  // 2. Ralph Lauren (Polo Player Silhouette & Classic Crest)
  if (norm.includes('ralph lauren') || norm.includes('polo')) {
    return (
      <svg viewBox="0 0 100 100" fill="currentColor" className={className} aria-label="Ralph Lauren">
        {/* Iconic Ralph Lauren Polo Mallet & Horse Rider Silhouette */}
        <path d="M52 10 c3 0 5 2 5 5 c0 2-1 4-3 5 l12 -8 l3 4 l-16 11 l-3 -2 c-2 4-6 6-10 6 c-3 0-5-2-5-4 c0-2 2-4 5-5 l5 -1 l-2 -4 c2 -4 5 -7 9 -7 Z" />
        <path d="M46 32 c6 0 12 3 16 8 l16 -10 l-4 8 l12 -2 l-8 8 l14 12 l-18 -4 l-8 14 l-6 -6 l-12 18 l-6 -10 l8 -12 l-10 -4 l4 -8 c-4 -6-2 -12 6 -14 Z" />
        <path d="M30 68 l10 16 l12 -6 l-8 -14 Z" />
        <path d="M60 62 l8 20 l14 -8 l-10 -16 Z" />
      </svg>
    );
  }

  // 3. Nike Swoosh
  if (norm.includes('nike')) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="Nike">
        <path d="M21.71 5.46c-2.73 2.87-6.9 6.27-11.75 9.07-2.67 1.54-5.32 2.73-7.5 3.32-.48.13-.91.22-1.28.27-.3.04-.6.04-.84-.03-.23-.07-.37-.22-.39-.42-.03-.26.06-.57.26-.9.4-.66 1.05-1.46 1.93-2.38 2.54-2.65 6.47-5.69 10.9-8.15 3.1-1.72 6.07-2.85 8.67-2.78.36.01.69.07.97.18.25.1.42.24.49.4.08.19.03.43-.16.71-.4.59-1.07 1.25-1.92 1.97.23-.42.43-.84.62-1.26z"/>
      </svg>
    );
  }

  // 4. Jordan Jumpman
  if (norm.includes('jordan')) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="Jordan">
        <path d="M12.75 3.25c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm4.18 5.76l3.37-3.37-.88-.88-3.48 3.48-2.69 2.69v3.42l4.89 6.65h2.86v-1.25h-2.12l-4.14-5.63 2.19-5.11zm-8.86-.01L4.69 5.62l-.88.88 3.37 3.37 2.19 5.11-4.14 5.63H3.11v1.25h2.86l4.89-6.65v-3.42l-2.79-2.8z"/>
      </svg>
    );
  }

  // 5. Adidas Three Stripes
  if (norm.includes('adidas')) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="Adidas">
        <path d="M2.5 19.5h3.2l2.8-5.5H5.3L2.5 19.5zm5.5 0h3.2l5.1-10.2h-3.2L8 19.5zm5.5 0h3.2L24 4.5h-3.2l-7.3 15z"/>
      </svg>
    );
  }

  // 6. Balenciaga
  if (norm.includes('balenciaga')) {
    return (
      <svg viewBox="0 0 100 100" fill="currentColor" className={className} aria-label="Balenciaga">
        <path d="M25 20 h28 c14 0 22 7 22 16 c0 7 -5 12 -12 14 c9 2 15 8 15 16 c0 11 -10 18 -25 18 H25 Z M37 31 v14 h14 c6 0 10 -3 10 -7 c0 -5 -4 -7 -10 -7 Z M37 55 v18 h16 c7 0 11 -3 11 -9 c0 -6 -4 -9 -11 -9 Z" />
      </svg>
    );
  }

  // 7. Stone Island Compass
  if (norm.includes('stone island')) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="Stone Island">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14l-2 6-6 2 6 2 2 6 2-6 6-2-6-2z"/>
      </svg>
    );
  }

  // 8. Dior
  if (norm.includes('dior')) {
    return (
      <svg viewBox="0 0 100 100" fill="currentColor" className={className} aria-label="Dior">
        <path d="M25 25 h22 c18 0 30 11 30 25 c0 15 -12 25 -30 25 H25 Z M37 36 v28 h10 c10 0 18 -6 18 -14 c0 -9 -8 -14 -18 -14 Z" />
      </svg>
    );
  }

  // 9. Moncler
  if (norm.includes('moncler')) {
    return (
      <svg viewBox="0 0 100 100" fill="currentColor" className={className} aria-label="Moncler">
        <path d="M50 15 L78 60 H64 L50 35 L36 60 H22 Z M50 50 L60 75 H40 Z" />
        <circle cx="50" cy="80" r="6" />
      </svg>
    );
  }

  // Fallback monogram badge
  return (
    <span className="font-mono font-black text-[9px] uppercase tracking-tighter">
      {brand.slice(0, 2)}
    </span>
  );
};
