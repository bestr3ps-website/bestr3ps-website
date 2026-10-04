import React from 'react';
import { ShieldCheck, CheckCircle2, Lock, Camera, Scale, Truck, Award, Sparkles, HelpCircle } from 'lucide-react';
import { AGENTS } from '../utils/agentConverter';
import { AgentType } from '../types/product';

interface TrustEndorsementBannerProps {
  activeAgent: AgentType;
  onOpenGuide: () => void;
}

export const TrustEndorsementBanner: React.FC<TrustEndorsementBannerProps> = ({
  activeAgent,
  onOpenGuide
}) => {
  const currentAgent = AGENTS[activeAgent] || AGENTS.litbuy;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-2">
      {/* Primary Trust Badge Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-900/95 to-neutral-900 border border-neutral-800 p-4 sm:p-5 shadow-2xl backdrop-blur-xl ring-1 ring-white/5">
        {/* Background glow effects */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Left Title & Security Endorsement */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/10">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-1.5">
                  <span>BESTR3PS 平台安全背书与买家保障计划</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                    <CheckCircle2 className="w-3 h-3" /> 100% 放心下单
                  </span>
                </h3>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">
                严格甄选 9 大全球合规转运代理商 • 免费高清 QC 质检验货 • 资金银行级托管 • 瑕疵包退包换
              </p>
            </div>
          </div>

          {/* Right Action Button & Active Agent Badge */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-neutral-800/80">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300">
              {currentAgent.logoUrl ? (
                <img 
                  src={currentAgent.logoUrl} 
                  alt="" 
                  className="w-4 h-4 object-contain rounded p-0.5 bg-neutral-900 border border-neutral-800"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              ) : null}
              <span className="text-[11px] text-neutral-400">当前受保代理:</span>
              <span className="font-bold text-amber-400">{currentAgent.name}</span>
            </div>

            <button
              onClick={onOpenGuide}
              className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-neutral-950 text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>查看买家保障细则与下单教程</span>
            </button>
          </div>
        </div>

        {/* 4 Pillars of Buyer Protection */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-neutral-800/80">
          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-neutral-950/50 border border-neutral-800/50">
            <Camera className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-white">免费高清 QC 质检</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">多角度实物拍照与细节核验</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-neutral-950/50 border border-neutral-800/50">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-white">资金安全托管</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">验货满意后才正式放款发往海外</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-neutral-950/50 border border-neutral-800/50">
            <Scale className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-white">0% 额外中介加价</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">原厂微店/淘宝一手出厂底价</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-neutral-950/50 border border-neutral-800/50">
            <Truck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-white">国际双清包税专线</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">直达欧美全球，丢件全额赔付</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
