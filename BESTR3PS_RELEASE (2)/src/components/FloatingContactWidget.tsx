import React from 'react';

interface FloatingContactWidgetProps {
  onOpenRequest?: () => void;
}

export const FloatingContactWidget: React.FC<FloatingContactWidgetProps> = ({ onOpenRequest }) => {
  return (
    <aside 
      aria-label="Quick contact links"
      className="fixed bottom-6 right-5 z-40 flex flex-col items-center gap-2.5 select-none"
    >
      {/* Discord Icon Button */}
      <a
        href="https://discord.gg/CrDeuBsKD"
        target="_blank"
        rel="noopener noreferrer"
        className="w-11 h-11 rounded-full bg-[#5865F2] hover:bg-[#4752C4] text-white flex items-center justify-center shadow-lg shadow-[#5865F2]/30 hover:scale-110 active:scale-95 transition-all duration-200 group relative border border-white/20"
        title="Join our Discord Community"
        aria-label="Discord"
      >
        {/* Official Discord SVG Logo */}
        <svg 
          className="w-5 h-5 fill-current" 
          viewBox="0 0 127.14 96.36"
        >
          <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.12,53,91.08,65.69,84.69,65.69Z"/>
        </svg>

        {/* Hover Tooltip */}
        <span className="absolute right-13 px-2 py-1 bg-neutral-900 border border-neutral-700 text-neutral-100 text-[11px] font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150">
          Discord
        </span>
      </a>

      {/* WhatsApp Icon Button */}
      <a
        href="https://wa.me/8619927561270"
        target="_blank"
        rel="noopener noreferrer"
        className="w-11 h-11 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-lg shadow-[#25D366]/30 hover:scale-110 active:scale-95 transition-all duration-200 group relative border border-white/20"
        title="Chat on WhatsApp (+86 19927561270)"
        aria-label="WhatsApp"
      >
        {/* Official WhatsApp SVG Logo */}
        <svg 
          className="w-5 h-5 fill-current" 
          viewBox="0 0 24 24"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>

        {/* Hover Tooltip */}
        <span className="absolute right-13 px-2 py-1 bg-neutral-900 border border-neutral-700 text-neutral-100 text-[11px] font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150">
          WhatsApp
        </span>
      </a>
    </aside>
  );
};
