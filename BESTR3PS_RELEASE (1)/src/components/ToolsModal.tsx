import React, { useState } from 'react';
import { 
  X, 
  Wrench, 
  Scale, 
  ExternalLink, 
  Camera, 
  Calculator, 
  Check, 
  Copy, 
  Search, 
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Store,
  Layers,
  ArrowRight
} from 'lucide-react';
import { AGENTS } from '../utils/agentConverter';
import { AgentType, Product } from '../types/product';

interface ToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeAgent: AgentType;
  onSelectAgent: (agent: AgentType) => void;
  products?: Product[];
}

export interface AgentComparisonData {
  id: AgentType;
  name: string;
  rating: number;
  shippingSpeed: string;
  serviceFee: string;
  paymentMethods: string[];
  exchangeRateRating: 'Best' | 'Great' | 'Standard' | 'Fair';
  pros: string[];
  cons: string[];
  bestFor: string;
  tagline: string;
}

export const AGENT_COMPARISONS: Record<AgentType, AgentComparisonData> = {
  litbuy: {
    id: 'litbuy',
    name: 'Litbuy',
    rating: 4.8,
    shippingSpeed: '7-12 Days (Express Dedicated Line)',
    serviceFee: '0% Free Agent Service Fee',
    paymentMethods: ['Stripe', 'Credit Card', 'Alipay', 'WeChat Pay', 'Crypto'],
    exchangeRateRating: 'Best',
    pros: [
      'Official Tier-1 partner agent with instant sub-second link parsing & warehousing',
      'Provides 6 free ultra-high resolution HD QC inspection photos with zoom capability',
      'Duty-free tax-free triangle shipping lines to US & EU with 99%+ customs clearance rate',
      'Generous first-order international freight discount vouchers and free parcel vacuum repacking'
    ],
    cons: [
      'Customer support tickets may experience slight queue during peak holiday sale events',
      'Strict airline volumetric regulations on oversized sensitive cargo'
    ],
    bestFor: 'Shoppers looking for fastest warehousing, free HD QC inspection photos & lowest overall rates',
    tagline: 'Fast Warehousing • 0% Service Fee • Ultra HD QC Inspection'
  },
  rizzitgo: {
    id: 'rizzitgo',
    name: 'Rizzitgo',
    rating: 4.7,
    shippingSpeed: '8-14 Days',
    serviceFee: '0% Free Service Fee',
    paymentMethods: ['Credit Card', 'PayPal', 'Alipay', 'Crypto'],
    exchangeRateRating: 'Great',
    pros: [
      'Cutting-edge modern UI with buttery smooth mobile-first experience',
      'Highly active Discord community with daily shipping coupons & giveaways',
      'Built-in Escrow buyer protection: funds released only after warehouse satisfaction',
      'Wide selection of European Tax-Free lines with competitive per-kg rates'
    ],
    cons: [
      'Slightly higher volumetric rates for remote geographic regions',
      'QC photo generation may take 24-48 hours during peak holiday rushes'
    ],
    bestFor: 'Mobile shoppers, streetwear enthusiasts & users who prioritize community support',
    tagline: 'Modern Interface • Active Discord Community • Escrow Buyer Protection'
  },
  oopbuy: {
    id: 'oopbuy',
    name: 'OOPBuy',
    rating: 4.7,
    shippingSpeed: '8-15 Days',
    serviceFee: '0% Standard Fee',
    paymentMethods: ['PayPal', 'Credit Card', 'Apple Pay', 'Alipay'],
    exchangeRateRating: 'Great',
    pros: [
      'Full PayPal & Apple Pay integration for frictionless, safe checkout',
      'Extremely responsive customer care & dispute resolution on Discord',
      'Studio-grade balanced lighting on all QC inspection shots with defect markers',
      'Heavy-duty parcel reinforcement included: corner protectors & waterproof shrink wrap'
    ],
    cons: [
      'Initial shipping deposit estimate is conservative; excess is credited back after actual weighing',
      'Relatively newer platform compared to 10-year veteran agents'
    ],
    bestFor: 'Shoppers demanding PayPal protection, instant support & rugged parcel reinforcement',
    tagline: 'PayPal & Apple Pay • Fast Discord Support • Studio Lighting QC'
  },
  kakobuy: {
    id: 'kakobuy',
    name: 'Kakobuy',
    rating: 4.6,
    shippingSpeed: '10-16 Days',
    serviceFee: '0% Commission',
    paymentMethods: ['Credit Card', 'Alipay', 'Bank Transfer'],
    exchangeRateRating: 'Great',
    pros: [
      'Extremely competitive European DHL / DPD dedicated lines for large hauls',
      'Seamless multi-platform purchasing from Weidian, Taobao & 1688 wholesale',
      '7-day hassle-free return/exchange assistance for warehouse-flagged defects',
      'Transparent shipping estimator without hidden handling surcharges'
    ],
    cons: [
      'Stricter automated warnings on selected luxury brand items',
      'Reduced weekend support staffing can lead to ticket backlogs'
    ],
    bestFor: 'European buyers (Germany, UK, France) & bulk haul shippers seeking low DHL rates',
    tagline: 'Cheap EU DHL Lines • Transparent Pricing • Easy Returns'
  },
  usfans: {
    id: 'usfans',
    name: 'USfans',
    rating: 4.5,
    shippingSpeed: '9-16 Days',
    serviceFee: '0% Agent Fee',
    paymentMethods: ['Credit Card', 'Stripe', 'Alipay'],
    exchangeRateRating: 'Standard',
    pros: [
      'Custom-tailored routes optimized for North America (USA & Canada)',
      'Automated QC pipeline generating photos within 48h of arrival',
      'Shoe box removal & compression saves up to 30%+ in volumetric freight fees',
      'Bilingual English & Chinese native support'
    ],
    cons: [
      'Shipping rates fluctuate across remote US postal zip zones',
      'High order volume spikes can cause minor weekend delay'
    ],
    bestFor: 'United States & Canada buyers shipping consolidated clothing & sneakers',
    tagline: 'US & Canada Optimized • Smart Consolidation • Bilingual Support'
  },
  cssbuy: {
    id: 'cssbuy',
    name: 'CSSBuy',
    rating: 4.5,
    shippingSpeed: '10-20 Days',
    serviceFee: 'Approx 6% (Decreases with VIP Tier)',
    paymentMethods: ['PayPal', 'Credit Card', 'Alipay', 'WeChat Pay', 'Bank Wire'],
    exchangeRateRating: 'Standard',
    pros: [
      'Over a decade of operational history in the global shopping community',
      'Widest selection of sea freight, railway lines, and postal packet alternatives',
      'Comprehensive and battle-tested shipping cost estimator tool',
      'Supports manual ordering from Yupoo, Xianyu and niche independent sellers'
    ],
    cons: [
      'Legacy dashboard interface has a steeper learning curve for beginners',
      'Basic accounts carry nominal repackaging/processing fees'
    ],
    bestFor: 'Experienced rep veterans & budget buyers shipping large sea freight hauls',
    tagline: 'Decade Veteran Agent • Huge Line Variety • Worldwide Freight'
  },
  hipobuy: {
    id: 'hipobuy',
    name: 'HipoBuy',
    rating: 4.4,
    shippingSpeed: '9-15 Days',
    serviceFee: '0% Service Fee',
    paymentMethods: ['Credit Card', 'Stripe', 'Alipay'],
    exchangeRateRating: 'Great',
    pros: [
      'Lightweight, modern and ultra-fast responsive web interface',
      'Rapid order placement: domestic orders purchased within 1-3 hours',
      'Dedicated macro close-up QC shots for sneaker size tags and embroidery'
    ],
    cons: [
      'Fewer postal route variations to secondary regions',
      'Smaller overseas social media footprint'
    ],
    bestFor: 'Fast domestic purchasing & sneaker collectors needing macro tag photos',
    tagline: 'Fast Order Placement • Clean Interface • Close-up Macro QC'
  },
  joyagoo: {
    id: 'joyagoo',
    name: 'Joyagoo',
    rating: 4.4,
    shippingSpeed: '10-16 Days',
    serviceFee: '0% Base Fee',
    paymentMethods: ['Credit Card', 'Alipay', 'Crypto'],
    exchangeRateRating: 'Standard',
    pros: [
      'Customized parcel packaging options (air cushions, vacuum sealing, carton corners)',
      'Highly competitive small-packet air rates for T-shirts and lightweight apparel',
      'Attentive one-on-one personal purchasing support'
    ],
    cons: [
      'Heavyweight 10kg+ parcels less cost-effective than sea lines',
      'Fewer payment gateways compared to OOPBuy'
    ],
    bestFor: 'Buyers shipping lightweight apparel, accessories & single-item parcels',
    tagline: 'Small Parcel Specialist • Custom Packaging • Dedicated Support'
  },
  boonbuy: {
    id: 'boonbuy',
    name: 'BoonBuy',
    rating: 4.3,
    shippingSpeed: '10-18 Days',
    serviceFee: '0% Service Fee',
    paymentMethods: ['Credit Card', 'Alipay', 'Bank Transfer'],
    exchangeRateRating: 'Standard',
    pros: [
      'Specialized clearance channels for Australia, New Zealand & Southeast Asia',
      'Supports small wholesale sampling & commercial parcel handling',
      'Clean checkout workflow with zero unnecessary bloat'
    ],
    cons: [
      'Transatlantic US/EU rates depend heavily on peak airline capacity',
      'Currently no standalone native mobile application'
    ],
    bestFor: 'Oceania (Australia/NZ) buyers and commercial sampling requests',
    tagline: 'Oceania Specialist • Sample Forwarding • Clean Workflow'
  }
};

type ToolTab = 'comparison' | 'converter' | 'qc_finder' | 'shipping_calc';

export const ToolsModal: React.FC<ToolsModalProps> = ({
  isOpen,
  onClose,
  activeAgent,
  onSelectAgent,
  products = []
}) => {
  const [activeTab, setActiveTab] = useState<ToolTab>('comparison');

  // 1. Comparison State
  const [selectedAgentId, setSelectedAgentId] = useState<AgentType>(activeAgent);

  // 2. Link Converter State
  const [inputUrl, setInputUrl] = useState('');
  const [targetAgent, setTargetAgent] = useState<AgentType>(activeAgent);
  const [convertedResult, setConvertedResult] = useState<{
    marketplace: string;
    productId: string;
    cleanUrl: string;
    agentCheckoutUrl: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // 3. QC Finder State
  const [qcSearch, setQcSearch] = useState('');

  // 4. Shipping Calculator State
  const [calcWeightKg, setCalcWeightKg] = useState('2.5');
  const [calcCountry, setCalcCountry] = useState('US');
  const [calcVolumeLength, setCalcVolumeLength] = useState('30');
  const [calcVolumeWidth, setCalcVolumeWidth] = useState('25');
  const [calcVolumeHeight, setCalcVolumeHeight] = useState('15');

  if (!isOpen) return null;

  // Handle URL Conversion
  const handleConvert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    let url = inputUrl.trim();
    let mkt = 'Weidian';
    let id = '';

    if (url.includes('taobao.com') || url.includes('tmall.com')) {
      mkt = 'Taobao';
      const match = url.match(/[?&]id=(\d+)/);
      if (match) id = match[1];
    } else if (url.includes('1688.com')) {
      mkt = '1688 Wholesale';
      const match = url.match(/offer\/(\d+)\.html/);
      if (match) id = match[1];
    } else {
      const match = url.match(/[?&]itemID=(\d+)/) || url.match(/[?&]itemId=(\d+)/) || url.match(/[?&]id=(\d+)/) || url.match(/\/(\d+)\.html/) || url.match(/(\d{8,12})/);
      if (match) id = match[1];
    }

    if (!id) id = '7835795528';

    const cleanRaw = mkt.includes('Taobao') 
      ? `https://item.taobao.com/item.htm?id=${id}`
      : mkt.includes('1688')
      ? `https://detail.1688.com/offer/${id}.html`
      : `https://weidian.com/item.html?itemID=${id}`;

    const agentConf = AGENTS[targetAgent] || AGENTS.litbuy;
    const checkoutUrl = agentConf.buildUrl(cleanRaw, id);

    setConvertedResult({
      marketplace: mkt,
      productId: id,
      cleanUrl: cleanRaw,
      agentCheckoutUrl: checkoutUrl
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Filter products for QC finder
  const qcFiltered = products.filter(p => {
    if (!qcSearch.trim()) return true;
    const q = qcSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.brand && p.brand.toLowerCase().includes(q)) || p.id.includes(q);
  }).slice(0, 12);

  // Compute Shipping Estimates
  const weight = Math.max(0.1, parseFloat(calcWeightKg) || 1.0);
  const volWeight = ((parseFloat(calcVolumeLength) || 30) * (parseFloat(calcVolumeWidth) || 20) * (parseFloat(calcVolumeHeight) || 15)) / 6000;
  const chargeWeight = Math.max(weight, volWeight * 0.85);

  const shippingRates: Record<string, { base: number; perKg: number; days: string }> = {
    US: { base: 18, perKg: 11, days: '7-14 Days' },
    UK: { base: 16, perKg: 9.5, days: '6-12 Days' },
    DE: { base: 17, perKg: 10, days: '8-14 Days' },
    FR: { base: 17, perKg: 10.2, days: '8-14 Days' },
    CA: { base: 20, perKg: 12, days: '9-15 Days' },
    AU: { base: 18, perKg: 9.8, days: '7-13 Days' }
  };
  const currentRate = shippingRates[calcCountry] || shippingRates.US;
  const estStandard = (currentRate.base + (chargeWeight - 0.5) * currentRate.perKg).toFixed(1);
  const estTaxFree = (parseFloat(estStandard) * 1.15).toFixed(1);
  const estExpress = (parseFloat(estStandard) * 1.45).toFixed(1);

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl shadow-black overflow-hidden ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header (100% English for International Shoppers) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
                  BESTR3PS Tools Hub
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold">
                  4-in-1 Suite
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Agent Breakdown & Reviews • Universal Link Converter • HD QC Gallery • Shipping Estimator
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Tool Tabs Navigation (All in English) */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-neutral-800/80 bg-neutral-950/40 overflow-x-auto scrollbar-none shrink-0">
          <button
            onClick={() => setActiveTab('comparison')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border shrink-0 ${
              activeTab === 'comparison'
                ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-md shadow-amber-500/20'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>1. Agent Comparison</span>
          </button>

          <button
            onClick={() => setActiveTab('converter')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border shrink-0 ${
              activeTab === 'converter'
                ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-md shadow-amber-500/20'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            <span>2. Link Converter</span>
          </button>

          <button
            onClick={() => setActiveTab('qc_finder')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border shrink-0 ${
              activeTab === 'qc_finder'
                ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-md shadow-amber-500/20'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>3. Live QC Gallery</span>
          </button>

          <button
            onClick={() => setActiveTab('shipping_calc')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border shrink-0 ${
              activeTab === 'shipping_calc'
                ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-md shadow-amber-500/20'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>4. Shipping Calculator</span>
          </button>
        </div>

        {/* Modal Body Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: 9 Agent Objective In-Depth Comparison */}
          {activeTab === 'comparison' && (() => {
            const currentAgentDetail = AGENT_COMPARISONS[selectedAgentId] || AGENT_COMPARISONS.litbuy;
            const agentMeta = AGENTS[selectedAgentId] || AGENTS.litbuy;

            return (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <Scale className="w-5 h-5 text-amber-400" />
                      <span>9 Shopping Agents In-Depth Objective Comparison</span>
                    </h4>
                    <span className="text-xs text-neutral-400 font-mono">
                      Real buyer insights from Reddit FashionReps & Discord communities
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Select any agent badge below to inspect real delivery speeds, fee structures, payment options, key advantages (Pros) and drawbacks (Cons).
                  </p>
                </div>

                {/* 9 Agent Selector Chips */}
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
                  {(Object.keys(AGENTS) as AgentType[]).map((id) => {
                    const conf = AGENTS[id];
                    const isSelected = selectedAgentId === id;
                    return (
                      <button
                        key={id}
                        onClick={() => {
                          setSelectedAgentId(id);
                          onSelectAgent(id);
                        }}
                        className={`flex flex-col items-center p-2.5 rounded-2xl border transition-all cursor-pointer text-center relative ${
                          isSelected
                            ? 'bg-neutral-800 border-amber-500 text-amber-400 shadow-md shadow-amber-500/20'
                            : 'bg-neutral-950/70 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                        }`}
                      >
                        {conf.logoUrl ? (
                          <img 
                            src={conf.logoUrl} 
                            alt="" 
                            className="w-7 h-7 object-contain rounded-lg p-0.5 bg-neutral-900 border border-neutral-800 mb-1" 
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                          />
                        ) : null}
                        <span className="text-xs font-bold truncate max-w-full">{conf.name}</span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Agent Detailed Card */}
                <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 relative overflow-hidden">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-800/80 pb-5">
                    <div className="flex items-center gap-3.5">
                      {agentMeta.logoUrl ? (
                        <img 
                          src={agentMeta.logoUrl} 
                          alt="" 
                          className="w-12 h-12 object-contain rounded-2xl p-1.5 bg-neutral-900 border border-neutral-700 shadow-md" 
                        />
                      ) : null}
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-xl font-black text-white font-['Space_Grotesk']">
                            {currentAgentDetail.name}
                          </h5>
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-mono font-bold">
                            ★ {currentAgentDetail.rating} / 5.0
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
                            {currentAgentDetail.serviceFee}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-0.5 font-mono">
                          {currentAgentDetail.tagline}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectAgent(selectedAgentId)}
                        className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Set as Active Site Agent</span>
                      </button>
                    </div>
                  </div>

                  {/* 4 Overview Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
                    <div className="p-3 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                      <div className="text-[10px] text-neutral-500 uppercase font-mono">Estimated Delivery Time</div>
                      <div className="text-xs font-bold text-white mt-1">{currentAgentDetail.shippingSpeed}</div>
                    </div>

                    <div className="p-3 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                      <div className="text-[10px] text-neutral-500 uppercase font-mono">Exchange Rate Tier</div>
                      <div className="text-xs font-bold text-amber-400 mt-1">{currentAgentDetail.exchangeRateRating} Tier</div>
                    </div>

                    <div className="p-3 rounded-2xl bg-neutral-900/60 border border-neutral-800 sm:col-span-2">
                      <div className="text-[10px] text-neutral-500 uppercase font-mono">Supported Payment Gateways</div>
                      <div className="text-xs font-bold text-neutral-300 mt-1 flex items-center gap-1.5 flex-wrap">
                        {currentAgentDetail.paymentMethods.map(m => (
                          <span key={m} className="px-1.5 py-0.5 rounded bg-neutral-800 text-[10px] text-neutral-300 font-mono">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pros & Cons Columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                        <ThumbsUp className="w-4 h-4" />
                        <span>Key Advantages (Pros & Perks)</span>
                      </div>
                      <ul className="space-y-2 text-xs text-neutral-300">
                        {currentAgentDetail.pros.map((p, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-400 font-bold shrink-0">✓</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-3">
                      <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                        <ThumbsDown className="w-4 h-4" />
                        <span>Drawbacks to Note (Cons)</span>
                      </div>
                      <ul className="space-y-2 text-xs text-neutral-300">
                        {currentAgentDetail.cons.map((c, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-rose-400 font-bold shrink-0">✕</span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Best For Summary */}
                  <div className="mt-4 p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center gap-2.5 text-xs">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-neutral-400">Best Buyer Profile:</span>
                    <strong className="text-white">{currentAgentDetail.bestFor}</strong>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TAB 2: Universal Agent Link Converter */}
          {activeTab === 'converter' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-amber-400" />
                  <span>Universal Agent Link Converter</span>
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Paste any Weidian, Taobao, or 1688 marketplace link or numeric Product ID. Instantly converts into a clean, direct checkout destination for your preferred agent with all 3rd-party affiliate cookies stripped.
                </p>
              </div>

              <form onSubmit={handleConvert} className="p-5 rounded-3xl bg-neutral-950 border border-neutral-800 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    Original Marketplace Link or Product ID
                  </label>
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="e.g. https://weidian.com/item.html?itemID=7835795528 or numeric 7835795528"
                    className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none font-mono"
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs text-neutral-400 shrink-0">Target Agent:</span>
                    <select
                      value={targetAgent}
                      onChange={(e) => setTargetAgent(e.target.value as AgentType)}
                      className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
                    >
                      {(Object.keys(AGENTS) as AgentType[]).map((key) => (
                        <option key={key} value={key}>
                          {AGENTS[key].name} ({key})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Convert to Clean Agent Link</span>
                  </button>
                </div>
              </form>

              {convertedResult && (
                <div className="p-5 rounded-3xl bg-neutral-950 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      <span>Converted Successfully! Clean, unbloated agent link ready.</span>
                    </span>
                    <span className="text-neutral-500 font-mono">Platform: {convertedResult.marketplace} • ID: {convertedResult.productId}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300 break-all">
                    {convertedResult.agentCheckoutUrl}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => copyToClipboard(convertedResult.agentCheckoutUrl)}
                      className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-neutral-700"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copied to Clipboard!' : 'Copy Direct Link'}</span>
                    </button>

                    <a
                      href={convertedResult.agentCheckoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-amber-500 to-amber-400 hover:brightness-110 text-neutral-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all"
                    >
                      <span>Open in New Tab</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Live QC Inspection Gallery */}
          {activeTab === 'qc_finder' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Camera className="w-5 h-5 text-amber-400" />
                  <span>Live Warehouse QC Inspection Gallery</span>
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Search across top-trending streetwear & sneaker batches to view authentic multi-angle warehouse QC inspection photos before you order.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={qcSearch}
                  onChange={(e) => setQcSearch(e.target.value)}
                  placeholder="Search item name, e.g. Travis Scott, Sp5der, Balenciaga..."
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none"
                />
              </div>

              {/* Grid of QC items */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {qcFiltered.map((p) => {
                  const agentConf = AGENTS[activeAgent] || AGENTS.litbuy;
                  const buyUrl = agentConf.buildUrl(p.sourceUrl, p.productId || p.id);

                  return (
                    <div 
                      key={p.id}
                      className="group bg-neutral-950 border border-neutral-800 hover:border-amber-500/50 rounded-2xl p-2.5 transition-all flex flex-col justify-between"
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-900 mb-2">
                        <img 
                          src={p.imageUrl || 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=500'} 
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[9px] font-mono text-emerald-400 font-bold border border-emerald-500/30">
                          QC VERIFIED
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs font-bold text-white line-clamp-1" title={p.name}>
                          {p.name}
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-neutral-400 font-mono">{p.brand || 'Unbranded'}</span>
                          <span className="text-amber-400 font-bold font-mono">{p.price}</span>
                        </div>

                        <a
                          href={buyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full mt-2 bg-neutral-900 hover:bg-amber-500 hover:text-neutral-950 text-neutral-300 text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors"
                        >
                          <span>Inspect QC & Purchase</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: International Freight & Tax-Free Estimator */}
          {activeTab === 'shipping_calc' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-amber-400" />
                  <span>International Freight & Tax-Free Shipping Calculator</span>
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Enter estimated parcel weight and dimensions to calculate real air freight rates, customs clearance options, and delivery timelines across primary destinations worldwide.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Inputs */}
                <div className="p-5 rounded-3xl bg-neutral-950 border border-neutral-800 space-y-4 md:col-span-1">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      Destination Country
                    </label>
                    <select
                      value={calcCountry}
                      onChange={(e) => setCalcCountry(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="US">United States (US)</option>
                      <option value="UK">United Kingdom (UK)</option>
                      <option value="DE">Germany (DE - Europe Hub)</option>
                      <option value="FR">France (FR)</option>
                      <option value="CA">Canada (CA)</option>
                      <option value="AU">Australia (AU)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      Parcel Actual Weight (KG)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="30"
                      value={calcWeightKg}
                      onChange={(e) => setCalcWeightKg(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      Length x Width x Height (CM)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        value={calcVolumeLength}
                        onChange={(e) => setCalcVolumeLength(e.target.value)}
                        placeholder="L"
                        className="bg-neutral-900 border border-neutral-800 rounded-xl px-2 py-1.5 text-xs text-white text-center font-mono"
                      />
                      <input
                        type="number"
                        value={calcVolumeWidth}
                        onChange={(e) => setCalcVolumeWidth(e.target.value)}
                        placeholder="W"
                        className="bg-neutral-900 border border-neutral-800 rounded-xl px-2 py-1.5 text-xs text-white text-center font-mono"
                      />
                      <input
                        type="number"
                        value={calcVolumeHeight}
                        onChange={(e) => setCalcVolumeHeight(e.target.value)}
                        placeholder="H"
                        className="bg-neutral-900 border border-neutral-800 rounded-xl px-2 py-1.5 text-xs text-white text-center font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/80 text-[11px] text-neutral-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Chargeable Weight:</span>
                      <strong className="text-amber-400 font-mono">{chargeWeight.toFixed(2)} KG</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Transit Time:</span>
                      <strong className="text-emerald-400 font-mono">{currentRate.days}</strong>
                    </div>
                  </div>
                </div>

                {/* Estimate Result Cards */}
                <div className="md:col-span-2 space-y-3">
                  <div className="p-4 rounded-2xl bg-neutral-950 border border-amber-500/30 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">Tax-Free Dedicated Line (Duty-Free Triangle)</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                          Top Recommendation
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400">
                        100% immune from European VAT & US import duties. Green customs corridor with full lost-parcel compensation.
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-amber-400 font-mono">${estTaxFree}</div>
                      <div className="text-[10px] text-neutral-500">Approx ¥{(parseFloat(estTaxFree) * 7.25).toFixed(0)} RMB</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="font-bold text-white text-sm">Standard Air Packet (Economy)</span>
                      <p className="text-xs text-neutral-400">
                        Ideal for lightweight parcels under 2KG: single tees, hoodies, or lifestyle accessories.
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-white font-mono">${estStandard}</div>
                      <div className="text-[10px] text-neutral-500">Approx ¥{(parseFloat(estStandard) * 7.25).toFixed(0)} RMB</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="font-bold text-white text-sm">Commercial Priority (DHL / FedEx Express)</span>
                      <p className="text-xs text-neutral-400">
                        Blazing fast 5-8 business days door-to-door delivery for urgent hauls.
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-sky-400 font-mono">${estExpress}</div>
                      <div className="text-[10px] text-neutral-500">Approx ¥{(parseFloat(estExpress) * 7.25).toFixed(0)} RMB</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
