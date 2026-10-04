import React, { useState } from "react";
import { 
  Sparkles, 
  Dices, 
  ShieldCheck,
  Wrench, 
  X,
  Truck,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Camera
} from "lucide-react";
import { AgentType } from "../types/product";
import { AGENTS } from "../utils/agentConverter";

interface HeroBannerProps {
  onOpenRequest?: () => void;
  totalCount: number;
  onSelectCategory?: (cat: any) => void;
  isLoading: boolean;
  onRefresh: () => void;
  onRandomFind: () => void;
  activeAgent: AgentType;
  onSelectSpecialFilter?: (type: "top_rated" | "budget") => void;
  onOpenEndorsementGuide?: () => void;
  onOpenTools?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onOpenRequest,
  isLoading,
  onRefresh,
  onRandomFind,
  activeAgent,
  onOpenEndorsementGuide,
  onOpenTools
}) => {
  const [showInternalGuide, setShowInternalGuide] = useState(false);
  const activeAgentConfig = AGENTS[activeAgent] || AGENTS.litbuy;

  return (
    <div className="relative overflow-hidden bg-neutral-950 border-b border-neutral-800/80">
      {/* Background ambient accents */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-7">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Main Title & Authority Endorsement Badge */}
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/90 border border-neutral-800 text-xs shadow-inner">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-amber-400 font-bold tracking-wider font-mono uppercase text-[10px]">
                OFFICIAL SPREADSHEET ARCHIVE
              </span>
              <span className="text-neutral-700">•</span>
              <span className="text-neutral-300 font-medium text-[11px]">
                Powered by Chinese Shopping Agents
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight font-['Space_Grotesk']">
              Curated Chinese Shopping Agent <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-orange-400 bg-clip-text text-transparent">Spreadsheet & Vault</span>
            </h1>
            
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-xl">
              Handpicked verified finds from Weidian, Taobao & 1688 with HD Quality Check (QC) inspection. Instant 1-click link conversion to <span className="text-amber-400 font-semibold">{activeAgentConfig.name}</span> and 8 premier Chinese shopping agents.
            </p>

            {/* 3 Endorsement Trust Highlights */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-neutral-300">
              <div className="flex items-center gap-1.5 bg-neutral-900/70 border border-neutral-800/80 px-2.5 py-1 rounded-lg">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Zero Bait-and-Switch (QC Checked)</span>
              </div>
              <div className="flex items-center gap-1.5 bg-neutral-900/70 border border-neutral-800/80 px-2.5 py-1 rounded-lg">
                <Truck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>Tax-Free & Express Doorstep Lines</span>
              </div>
              <div className="flex items-center gap-1.5 bg-neutral-900/70 border border-neutral-800/80 px-2.5 py-1 rounded-lg">
                <DollarSign className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>0% Extra Commission</span>
              </div>
            </div>
          </div>

          {/* 4 Feature Hub Buttons Arranged in 2 Rows (两排舒适布局，名称完整可见，手机端适配极佳) */}
          <div className="w-full lg:w-[480px] shrink-0">
            <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
              {/* 1. Lucky Random Grail Deal Showcase */}
              <button
                onClick={onRandomFind}
                className="group relative flex items-center gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-400 to-yellow-500 hover:brightness-105 text-neutral-950 shadow-xl shadow-amber-500/20 border border-amber-300/60 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-left overflow-hidden"
                title="Roll 8 lucky finds from your spreadsheet with limited 45% discount!"
              >
                <div className="w-10 h-10 rounded-xl bg-neutral-950/90 flex items-center justify-center text-amber-400 shrink-0 shadow-md">
                  <Dices className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-xs sm:text-sm text-neutral-950 tracking-tight leading-tight whitespace-nowrap">
                      Random Grail
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-neutral-950 text-amber-400 text-[10px] font-mono font-black shrink-0">
                      -45%
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-900/80 font-medium truncate mt-0.5">
                    8 Lucky Bargains
                  </div>
                </div>
              </button>

              {/* 2. Custom Item Sourcing Request (24h Update) */}
              <button
                data-tally-open="aQ8Nay"
                data-tally-emoji-text="👋"
                data-tally-emoji-animation="wave"
                onClick={() => {
                  if (typeof (window as any).Tally !== 'undefined') {
                    (window as any).Tally.openPopup('aQ8Nay', { emoji: { text: '👋', animation: 'wave' } });
                  } else if (onOpenRequest) {
                    onOpenRequest();
                  }
                }}
                className="group relative flex items-center gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-amber-400 hover:brightness-105 text-neutral-950 shadow-xl shadow-orange-500/20 border border-amber-300/60 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-left overflow-hidden"
                title="Submit photo or product name - Guaranteed 24h catalog finding & update!"
              >
                <div className="w-10 h-10 rounded-xl bg-neutral-950/90 flex items-center justify-center text-orange-400 shrink-0 shadow-md">
                  <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-xs sm:text-sm text-neutral-950 tracking-tight leading-tight whitespace-nowrap">
                      Request Item
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-neutral-950 text-orange-400 text-[10px] font-mono font-black shrink-0">
                      24h
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-900/80 font-medium truncate mt-0.5">
                    Grail Sourcing
                  </div>
                </div>
              </button>

              {/* 3. 海淘实用工具箱 (Tools Hub 4-in-1) */}
              <button
                onClick={onOpenTools}
                className="group relative flex items-center gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 text-white border border-neutral-750 hover:border-amber-500/50 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-left shadow-lg shadow-black/40 overflow-hidden"
                title="Open Reps Tools Suite (Agent Breakdown, Universal Link Converter, Live QC & Shipping Estimator)"
              >
                <div className="w-10 h-10 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                  <Wrench className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs sm:text-sm text-neutral-100 tracking-tight leading-tight whitespace-nowrap">
                      Tools Hub
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold shrink-0">
                      4-in-1
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400 truncate mt-0.5">
                    QC & Converter
                  </div>
                </div>
              </button>

              {/* 4. Sourcing & Agent Endorsement Guide */}
              <button
                onClick={onOpenEndorsementGuide || (() => setShowInternalGuide(true))}
                className="group relative flex items-center gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 text-white border border-neutral-750 hover:border-emerald-500/50 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-left shadow-lg shadow-black/40 overflow-hidden"
                title="Learn how Chinese Shopping Agents work & how to place orders"
              >
                <div className="w-10 h-10 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                  <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs sm:text-sm text-neutral-100 tracking-tight leading-tight whitespace-nowrap">
                      Agent Guide
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold shrink-0">
                      Safe
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400 truncate mt-0.5">
                    Ordering Tutorial
                  </div>
                </div>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Internal Fast Guide Modal (Fallback if onOpenEndorsementGuide not passed) */}
      {showInternalGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-neutral-200">
            <button
              onClick={() => setShowInternalGuide(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                  How Chinese Shopping Agents Work
                </h3>
                <p className="text-xs text-neutral-400">Order from China directly in 3 easy steps</p>
              </div>
            </div>

            <div className="space-y-3 text-xs mb-6">
              <div className="flex gap-3 items-start bg-neutral-950/60 p-3 rounded-2xl border border-neutral-800">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-neutral-950 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                <div>
                  <p className="font-bold text-white mb-0.5">Select Your Agent & Find Items</p>
                  <p className="text-neutral-400 text-[11px] leading-relaxed">Choose your agent ({activeAgentConfig.name}, Rizzitgo, etc.) at the top. When you click Buy, our system opens the agent product checkout page instantly.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start bg-neutral-950/60 p-3 rounded-2xl border border-neutral-800">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-neutral-950 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                <div>
                  <p className="font-bold text-white mb-0.5">Warehouse Arrival & Free QC Inspection</p>
                  <p className="text-neutral-400 text-[11px] leading-relaxed">The seller ships the item to your agent warehouse in 2-4 days. Professional staff inspect the batch and upload detailed QC photos.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start bg-neutral-950/60 p-3 rounded-2xl border border-neutral-800">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-neutral-950 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                <div>
                  <p className="font-bold text-white mb-0.5">Consolidate & Ship to Your Doorstep</p>
                  <p className="text-neutral-400 text-[11px] leading-relaxed">Once you approve the QC photos, submit your items together into a haul for direct shipping to your doorstep (Tax-Free, DHL, FedEx, EMS).</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowInternalGuide(false)}
              className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
            >
              Start Exploring
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
