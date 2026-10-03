import React from "react";
import { 
  Flame, 
  Search, 
  Heart, 
  ChevronDown,
  Globe,
  Share2, 
  Check,
  ShieldCheck,
  Wrench,
  Sparkles,
  SlidersHorizontal,
  Settings,
  X
} from "lucide-react";
import { AgentType } from "../types/product";
import { AGENTS } from "../utils/agentConverter";
import { CurrencyCode, CURRENCIES } from "../utils/currency";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeAgent: AgentType;
  onAgentChange: (agent: AgentType) => void;
  favoritesCount: number;
  onOpenFavorites: () => void;
  currentCurrency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  onOpenAdmin: () => void;
  onOpenEndorsementGuide: () => void;
  onOpenTools?: () => void;
  onOpenRequest?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  activeAgent,
  onAgentChange,
  favoritesCount,
  onOpenFavorites,
  currentCurrency,
  onCurrencyChange,
  onOpenAdmin,
  onOpenEndorsementGuide,
  onOpenTools,
  onOpenRequest
}) => {
  const [showAgentMenu, setShowAgentMenu] = React.useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = React.useState(false);
  const [shareCopied, setShareCopied] = React.useState(false);

  const currentAgentConfig = AGENTS[activeAgent] || AGENTS.litbuy;

  const handleShareClick = () => {
    try {
      const shareUrl = window.location.href;
      navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-neutral-950/95 backdrop-blur-xl border-b border-neutral-800/80 shadow-lg shadow-black/40">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3 shrink-0">
            <a href="#" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-all ring-1 ring-amber-400/40">
                <Flame className="w-5 h-5 text-neutral-950 fill-neutral-950" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-wider bg-gradient-to-r from-white via-neutral-100 to-amber-400 bg-clip-text text-transparent font-['Space_Grotesk']">
                  BESTR3PS
                </span>
                <span className="text-[9px] tracking-widest text-neutral-400 uppercase -mt-1 font-mono flex items-center gap-1">
                  <span>AGENT VAULT</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </span>
              </div>
            </a>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-xl relative hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search sneakers, hoodies, tees, brands (Nike, Sp5der, Trapstar)..."
                className="w-full bg-neutral-900/90 border border-neutral-800/90 hover:border-neutral-700 rounded-full pl-10 pr-9 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs cursor-pointer bg-neutral-800 rounded-full w-4 h-4 flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Action buttons & Agent Avatar Switcher */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">

            {/* Endorsement Guide Button */}
            

            {/* Language & Currency Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowCurrencyMenu(!showCurrencyMenu);
                  setShowAgentMenu(false);
                }}
                className="flex items-center gap-1.5 bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 rounded-xl px-2.5 py-1.5 text-xs text-neutral-200 transition-colors cursor-pointer shadow-sm"
                title="Select Currency & Region"
              >
                <span className="text-base leading-none">{CURRENCIES[currentCurrency].flag}</span>
                <span className="font-bold text-amber-400 text-xs font-mono">{currentCurrency}</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {showCurrencyMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowCurrencyMenu(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-52 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl py-2 z-20 text-xs">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider border-b border-neutral-800 flex items-center justify-between">
                      <span>Currency & Region</span>
                      <Globe className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    {Object.values(CURRENCIES).map((c) => (
                      <button
                        key={c.code}
                        onClick={() => {
                          onCurrencyChange(c.code);
                          setShowCurrencyMenu(false);
                        }}
                        className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-neutral-800/80 transition-colors cursor-pointer ${
                          currentCurrency === c.code ? "bg-amber-500/10 text-amber-400 font-semibold" : "text-neutral-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{c.flag}</span>
                          <div>
                            <span className="font-bold font-mono">{c.code}</span>
                            <span className="text-neutral-500 text-[11px] ml-1.5">{c.symbol}</span>
                          </div>
                        </div>
                        {currentCurrency === c.code && (
                          <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Agent Switcher Dropdown WITH VISUAL AVATARS */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowAgentMenu(!showAgentMenu);
                  setShowCurrencyMenu(false);
                }}
                className="flex items-center gap-2.5 bg-neutral-900/90 border border-neutral-800 hover:border-amber-500/60 rounded-xl px-2.5 py-1.5 text-xs text-neutral-200 transition-all cursor-pointer shadow-sm hover:shadow-amber-500/10"
                title="Select preferred Chinese Shopping Agent (Instant 1-Click Conversion)"
              >
                {/* Official Agent Logo Badge */}
                <div className={`w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-700/80 flex items-center justify-center shadow-sm shrink-0 overflow-hidden relative p-0.5`}>
                  {currentAgentConfig.logoUrl ? (
                    <img 
                      src={currentAgentConfig.logoUrl} 
                      alt={currentAgentConfig.name}
                      className="w-full h-full object-contain filter drop-shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : null}
                  <div className={`absolute inset-0 bg-gradient-to-br ${currentAgentConfig.avatarBg} ${currentAgentConfig.avatarColor} flex items-center justify-center text-[9px] -z-10 font-black`}>
                    {currentAgentConfig.shortCode}
                  </div>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] text-neutral-400 uppercase font-mono tracking-wider">Agent</span>
                  <span className="font-bold text-amber-400 flex items-center gap-1 leading-none text-xs">
                    {currentAgentConfig.name}
                    <ChevronDown className="w-3 h-3 text-neutral-400" />
                  </span>
                </div>
              </button>

              {showAgentMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowAgentMenu(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-neutral-900/95 backdrop-blur-xl border border-neutral-800 rounded-2xl shadow-2xl py-2 z-20 text-xs max-h-[80vh] overflow-y-auto divide-y divide-neutral-850">
                    <div className="px-3.5 py-2 text-[11px] font-bold text-neutral-300 uppercase tracking-wider flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Select Shopping Agent</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                        9 Active
                      </span>
                    </div>

                    <div className="py-1">
                      {Object.values(AGENTS).map((agent) => (
                        <button
                          key={agent.id}
                          onClick={() => {
                            onAgentChange(agent.id);
                            setShowAgentMenu(false);
                          }}
                          className={`w-full px-3 py-2 text-left flex items-center gap-3 hover:bg-neutral-800/80 transition-colors cursor-pointer ${
                            activeAgent === agent.id ? "bg-amber-500/10 text-amber-400 font-semibold" : "text-neutral-300"
                          }`}
                        >
                          {/* Official Agent Logo Icon */}
                          <div className="w-8 h-8 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-xs shadow-md shrink-0 ring-1 ring-white/10 overflow-hidden relative p-1">
                            {agent.logoUrl ? (
                              <img 
                                src={agent.logoUrl} 
                                alt={agent.name}
                                className="w-full h-full object-contain filter drop-shadow-sm"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            ) : null}
                            <div className={`absolute inset-0 bg-gradient-to-br ${agent.avatarBg} ${agent.avatarColor} flex items-center justify-center text-[10px] -z-10 font-black`}>
                              {agent.shortCode}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-white">{agent.name}</span>
                              {activeAgent === agent.id && (
                                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-neutral-400 truncate mt-0.5">
                              {agent.tagline}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>



            {/* Admin Management Dashboard Button (网站后台管理) */}
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/50 rounded-xl px-2.5 py-1.5 text-xs text-neutral-300 hover:text-amber-400 transition-all cursor-pointer shadow-sm"
              title="Open Merchant CMS Admin Dashboard (上传商品 / 调整内容)"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-[11px] hidden sm:inline">Admin CMS</span>
            </button>

            {/* Favorites Drawer Toggle */}
            <button
              onClick={onOpenFavorites}
              className="relative p-2 rounded-xl border border-neutral-800 bg-neutral-900/90 hover:bg-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer shadow-sm"
              title="View saved items"
            >
              <Heart className="w-4 h-4 text-red-400 fill-red-400/20" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center font-mono">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Share Site Link Button */}
            <button
              onClick={handleShareClick}
              className="p-2 rounded-xl border border-neutral-800 bg-neutral-900/90 hover:bg-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer shadow-sm"
              title="Share Catalog Link"
            >
              {shareCopied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Share2 className="w-4 h-4 text-neutral-400 hover:text-neutral-200" />
              )}
            </button>
          </div>

        </div>

        {/* Mobile Search Bar */}
        <div className="mt-2.5 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search sneakers, hoodies, tees..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-8 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};