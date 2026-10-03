import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  HelpCircle, 
  Truck, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Camera, 
  DollarSign, 
  ArrowRight
} from 'lucide-react';
import { AgentType } from '../types/product';
import { AGENTS } from '../utils/agentConverter';

interface EndorsementGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeAgent: AgentType;
  onSelectAgent: (agent: AgentType) => void;
}

export const EndorsementGuideModal: React.FC<EndorsementGuideModalProps> = ({
  isOpen,
  onClose,
  activeAgent
}) => {
  const [activeTab, setActiveTab] = useState<'about' | 'howToUse' | 'qc' | 'faq'>('about');

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-neutral-900/98 border border-neutral-800 rounded-3xl p-5 sm:p-8 shadow-2xl shadow-black my-auto text-left backdrop-blur-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative flex items-center justify-between border-b border-neutral-800/80 pb-5 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center text-neutral-950 shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-['Space_Grotesk']">
                  Chinese Shopping Agent Guide & Endorsement
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                  Verified Trust Protocol
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Everything you need to know about purchasing via Chinese Shopping Agents (Litbuy, Rizzitgo, USfans, etc.)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-neutral-800/90 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-neutral-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-neutral-800/60 pb-3 mb-6 overflow-x-auto no-scrollbar">
          {[
            { id: 'about', label: 'What is an Agent?', icon: Layers },
            { id: 'howToUse', label: 'How to Order (3 Steps)', icon: ArrowRight },
            { id: 'qc', label: 'Verified QC System', icon: Camera },
            { id: 'faq', label: 'FAQ & Safety Guarantee', icon: HelpCircle }
          ].map((t) => {
            const Icon = t.icon;
            const isTabActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isTabActive
                    ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                    : 'bg-neutral-800/70 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: About Shopping Agents */}
        {activeTab === 'about' && (
          <div className="space-y-5 text-neutral-300 text-xs sm:text-sm leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
            <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-2xl p-4.5 space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                What is a Chinese Shopping Agent?
              </h3>
              <p className="text-neutral-400 text-xs leading-relaxed">
                A <strong>Chinese Shopping Agent</strong> (such as Litbuy, Rizzitgo, USfans, CSSBuy, OOPBuy, etc.) acts as your dedicated personal concierge and forwarding service in China. Because Chinese marketplaces like <strong>Weidian, Taobao, and 1688</strong> typically require Chinese payment methods, phone numbers, and local domestic addresses, overseas buyers cannot easily purchase directly.
              </p>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Our spreadsheet platform indexes thousands of verified streetwear, sneaker, and luxury finds. With our <strong>1-Click Instant Conversion</strong>, clicking any item generates an exact direct-order page on your preferred agent with 0% extra markups.
              </p>
            </div>

            {/* 4 Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="bg-neutral-950/50 border border-neutral-800 p-3.5 rounded-2xl">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold mb-2">
                  <DollarSign className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-white text-xs mb-1">Direct Factory Pricing</h4>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  Eliminates middleman markups. You access the identical prices paid by local Chinese insiders without reselling markups.
                </p>
              </div>

              <div className="bg-neutral-950/50 border border-neutral-800 p-3.5 rounded-2xl">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold mb-2">
                  <Camera className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-white text-xs mb-1">Free Warehouse QC Photos</h4>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  When your item reaches the agent warehouse, high-res photos are taken so you inspect stitching, tags, and measurements before overseas shipping.
                </p>
              </div>

              <div className="bg-neutral-950/50 border border-neutral-800 p-3.5 rounded-2xl">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold mb-2">
                  <Truck className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-white text-xs mb-1">Consolidated Haul Shipping</h4>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  Bundle multiple pairs of shoes, hoodies, and accessories from different sellers into one box to save up to 60% on international shipping.
                </p>
              </div>

              <div className="bg-neutral-950/50 border border-neutral-800 p-3.5 rounded-2xl">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold mb-2">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-white text-xs mb-1">Return & Refund Protection</h4>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  If the QC photos reveal any flaws or wrong sizing, you can request a 100% free return/exchange within China with zero shipping penalty.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: How to Use */}
        {activeTab === 'howToUse' && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {[
              {
                step: '01',
                title: 'Choose Your Agent & Find Items',
                desc: 'Select your preferred agent from the top navigation bar (Litbuy, Rizzitgo, etc.). Browse through sneakers, streetwear, hoodies, or accessories on our spreadsheet catalog.',
                badge: 'One-Click Conversion'
              },
              {
                step: '02',
                title: 'Agent Purchases & Stores In Warehouse',
                desc: 'When you click Buy, the agent automatically places the order with the Chinese seller. The item arrives at the domestic warehouse in 2-4 days, where staff unpack and shoot HD QC photos.',
                badge: '2-4 Days Domestic'
              },
              {
                step: '03',
                title: 'Review QC & Submit for Direct Worldwide Delivery',
                desc: 'Check your QC photos on your agent dashboard. If satisfied, submit your haul using fast Tax-Free lines, DHL, FedEx, or EMS right to your doorstep with full tracking.',
                badge: 'Doorstep Delivery'
              }
            ].map((s, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-neutral-950 font-black text-lg flex items-center justify-center shrink-0 shadow-md">
                  {s.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-white text-sm">{s.title}</h4>
                    <span className="text-[10px] font-mono bg-neutral-800 text-amber-400 px-2 py-0.5 rounded-full border border-neutral-700">
                      {s.badge}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: QC & Sourcing Endorsement */}
        {activeTab === 'qc' && (
          <div className="space-y-4 text-xs sm:text-sm text-neutral-300 max-h-[60vh] overflow-y-auto pr-2">
            <div className="bg-neutral-950/60 border border-neutral-800 p-4 rounded-2xl space-y-2">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                The Importance of Quality Check (QC)
              </h4>
              <p className="text-neutral-400 text-xs leading-relaxed">
                QC (Quality Control) photos are high-resolution pictures taken from all angles (overhead, side profiles, sole, brand tags, wash labels, and tape measure readings) upon warehouse arrival.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-950/40 border border-neutral-800/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-white text-xs">Zero Risk of Bait-and-Switch</h5>
                  <p className="text-[11px] text-neutral-400">You see exactly what the seller dispatched before paying for international postage.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-950/40 border border-neutral-800/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-white text-xs">Accurate Sizing Verification</h5>
                  <p className="text-[11px] text-neutral-400">Agent warehouse staff can measure chest width, total length, or insole cm upon request so garments fit you perfectly.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-950/40 border border-neutral-800/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-white text-xs">Community Endorsed Batches</h5>
                  <p className="text-[11px] text-neutral-400">All spreadsheet listings are cross-referenced with Reddit and Discord batch reputation (e.g. GX, LJR, PK 4.0, Pika, ROF).</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: FAQ */}
        {activeTab === 'faq' && (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {[
              {
                q: 'Is it safe to order through these shopping agents?',
                a: 'Yes. Shopping agents act as trusted escrow services. They hold your funds until the seller delivers, inspect the items for defects, and offer insurance options for international transit.'
              },
              {
                q: 'What payment methods are supported?',
                a: 'Most agents support PayPal, Credit/Debit cards (Visa/Mastercard), Apple Pay, Stripe, and Cryptocurrency.'
              },
              {
                q: 'How long does shipping usually take?',
                a: 'Domestic transit to the agent warehouse takes 2-4 days. International shipping to North America / Europe typically takes 7-14 business days via Tax-Free or Express lines.'
              },
              {
                q: 'Do I have to pay custom duties?',
                a: 'Using triangular Tax-Free / Tariffless lines handles customs clearance automatically, meaning you do not pay extra surprise taxes upon doorstep delivery.'
              }
            ].map((faq, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
                <h4 className="font-bold text-white text-xs mb-1.5 flex items-center gap-1.5">
                  <span className="text-amber-400 font-mono">Q:</span>
                  <span>{faq.q}</span>
                </h4>
                <p className="text-neutral-400 text-[11px] leading-relaxed pl-4">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-neutral-400 text-[11px]">
            Currently using agent: <span className="font-bold text-amber-400">{AGENTS[activeAgent]?.name}</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold px-6 py-2 rounded-xl transition-all cursor-pointer shadow-md"
          >
            Got it, Start Browsing
          </button>
        </div>

      </div>
    </div>
  );
};
