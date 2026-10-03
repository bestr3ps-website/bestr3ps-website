import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      
      // Show when scrolled down more than 350px
      if (scrollTop > 350) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      if (scrollHeight > 0) {
        const progress = Math.min(100, Math.round((scrollTop / scrollHeight) * 100));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-1 animate-fadeIn">
      {/* Scroll to Top Circular Progress Button */}
      <button
        onClick={scrollToTop}
        className="relative group p-3.5 rounded-2xl bg-neutral-900/90 hover:bg-neutral-800 text-amber-400 hover:text-white border border-neutral-700/80 hover:border-amber-500 shadow-xl shadow-black/60 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center"
        title="一键平滑返回顶部 (Back to Top)"
        aria-label="Back to Top"
      >
        {/* Circular SVG Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-0.5" viewBox="0 0 44 44">
          <circle
            cx="22"
            cy="22"
            r="19"
            stroke="currentColor"
            strokeWidth="2.5"
            fill="transparent"
            className="text-neutral-800"
          />
          <circle
            cx="22"
            cy="22"
            r="19"
            stroke="currentColor"
            strokeWidth="2.5"
            fill="transparent"
            strokeDasharray={119.38}
            strokeDashoffset={119.38 - (119.38 * scrollProgress) / 100}
            strokeLinecap="round"
            className="text-amber-500 transition-all duration-150"
          />
        </svg>

        <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform relative z-10" />
      </button>

      {/* Percentage indicator badge */}
      <span className="text-[10px] font-mono font-bold text-neutral-400 bg-neutral-950/80 px-1.5 py-0.5 rounded-md border border-neutral-800">
        {scrollProgress}%
      </span>
    </div>
  );
};
