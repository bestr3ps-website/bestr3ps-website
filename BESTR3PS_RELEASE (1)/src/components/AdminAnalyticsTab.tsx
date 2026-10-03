import React, { useState } from 'react';
import { 
  BarChart3,
  Calendar,
  Filter, 
  Eye, 
  Package, 
  ExternalLink, 
  TrendingUp, 
  Store, 
  Activity, 
  Save, 
  Clock, 
  Sparkles, 
  Search 
} from 'lucide-react';
import { AGENTS } from '../utils/agentConverter';
import { trackPageView, trackProductView, trackProductClick, clearAllAnalyticsData } from '../services/adminService';
import { AgentType, Product } from '../types/product';
import { 
  DailyAnalyticsSummary, 
  MonthlyAnalyticsSummary, 
  AgentAnalyticsRecord, 
  ProductAnalyticsRecord, 
  GoogleAnalyticsConfig,
  saveGa4Config 
} from '../services/adminService';

interface AdminAnalyticsTabProps {
  products: Product[];
  dailyStats: Record<string, DailyAnalyticsSummary>;
  monthlyStats: Record<string, MonthlyAnalyticsSummary>;
  agentStats: Record<string, AgentAnalyticsRecord>;
  productStats: Record<string, ProductAnalyticsRecord>;
  ga4Config: GoogleAnalyticsConfig;
  setGa4Config: React.Dispatch<React.SetStateAction<GoogleAnalyticsConfig>>;
  showToast: (msg: string) => void;
}

export const AdminAnalyticsTab: React.FC<AdminAnalyticsTabProps> = ({
  products,
  dailyStats,
  monthlyStats,
  agentStats,
  productStats,
  ga4Config,
  setGa4Config,
  showToast
}) => {
  const [analyticsViewTab, setAnalyticsViewTab] = useState<'daily' | 'monthly'>('daily');
  const [analyticsSearch, setAnalyticsSearch] = useState('');
  const [analyticsSortBy, setAnalyticsSortBy] = useState<'views' | 'clicks' | 'ctr'>('clicks');
  const [timeRange, setTimeRange] = useState<'all' | 'today' | '7days' | '30days' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Compute date filter boundary
  const todayStr = new Date().toISOString().split('T')[0];
  const d7Ago = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const d30Ago = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

  const allDailyEntries = Object.values(dailyStats).sort((a, b) => b.date.localeCompare(a.date));
  
  const dailyEntries = allDailyEntries.filter(entry => {
    if (timeRange === 'today') return entry.date === todayStr;
    if (timeRange === '7days') return entry.date >= d7Ago;
    if (timeRange === '30days') return entry.date >= d30Ago;
    if (timeRange === 'custom') {
      if (customStartDate && entry.date < customStartDate) return false;
      if (customEndDate && entry.date > customEndDate) return false;
      return true;
    }
    return true;
  });
  const totalPageViews = dailyEntries.reduce((acc, curr) => acc + (curr.pageViews || 0), 0);
  const totalUniqueVisitors = dailyEntries.reduce((acc, curr) => acc + (curr.uniqueVisitors || 0), 0);
  const totalProductViews = dailyEntries.reduce((acc, curr) => acc + (curr.productViews || 0), 0);
  const totalOutboundClicks = dailyEntries.reduce((acc, curr) => acc + (curr.outboundClicks || 0), 0);
  const overallCtr = totalProductViews > 0 ? ((totalOutboundClicks / totalProductViews) * 100).toFixed(1) : '0.0';

  // Process product stats and merge with catalog products
  const allProductRecords: ProductAnalyticsRecord[] = Object.values(productStats);
  const recordedIds = new Set(allProductRecords.map(r => r.productId));
  products.forEach(p => {
    const pId = p.productId || p.id;
    if (!recordedIds.has(pId)) {
      allProductRecords.push({
        productId: pId,
        name: p.name,
        brand: p.brand || 'Unbranded',
        category: p.category || 'GENERAL',
        views: 0,
        clicks: 0,
        shares: 0,
        lastViewedAt: '-',
        agentClicks: {}
      });
      recordedIds.add(pId);
    }
  });

  // Filter & Sort for Products Table
  const filteredList = allProductRecords.filter(item => {
    if (!analyticsSearch.trim()) return true;
    const q = analyticsSearch.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.productId.includes(q) ||
      item.brand.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  }).sort((a, b) => {
    if (analyticsSortBy === 'clicks') return b.clicks - a.clicks;
    if (analyticsSortBy === 'views') return b.views - a.views;
    const ctrA = a.views > 0 ? a.clicks / a.views : 0;
    const ctrB = b.views > 0 ? b.clicks / b.views : 0;
    return ctrB - ctrA;
  });

  // Process Agent Stats Breakdown
  const allAgentStats: AgentAnalyticsRecord[] = (Object.keys(AGENTS) as AgentType[]).map(key => {
    const ag = AGENTS[key];
    const recorded = agentStats[key] || {
      agentId: key,
      name: ag.name,
      views: 0,
      clicks: 0,
      activeSeconds: 0,
      lastActiveAt: '-'
    };
    return {
      ...recorded,
      name: ag.name
    };
  }).sort((a, b) => b.clicks - a.clicks);

  const totalAgentClicks = allAgentStats.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
  const totalAgentSeconds = allAgentStats.reduce((acc, curr) => acc + (curr.activeSeconds || 0), 0);

  const formatTime = (secs: number) => {
    if (!secs || secs <= 0) return '0 分钟';
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    if (mins >= 60) {
      const hours = (mins / 60).toFixed(1);
      return `${hours} 小时`;
    }
    return `${mins} 分 ${remSecs} 秒`;
  };

  const handleSaveGa4 = (e: React.FormEvent) => {
    e.preventDefault();
    saveGa4Config(ga4Config);
    showToast('谷歌分析 GA4 接口配置已成功保存并即时生效！');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <span>每日流量、商品明细与 9 大代理商访问留存分析</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            严格遵循真实访问统计（Zero-Fake Policy）。内建全自动高性能埋点追踪引擎，支持每日与每月维度查看真实渠道来源。
          </p>
        </div>

        <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              if (window.confirm('确定要清空所有历史访问与点击统计数据吗？清空后数据归零，将仅记录后续产生的 100% 真实访问与代理点击。')) {
                clearAllAnalyticsData();
                showToast('已成功彻底清空所有统计数据！正在刷新页面呈现纯净真实数据...');
                setTimeout(() => window.location.reload(), 800);
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
            title="一键彻底清空历史数据并归零"
          >
            <span>🗑️ 清空所有统计数据 (归零)</span>
          </button>

          <button
            onClick={() => {
              trackPageView();
              if (products.length > 0) {
                const sample = products[0];
                trackProductView(sample);
                trackProductClick(sample, 'litbuy');
              }
              showToast('已成功执行真实埋点捕获测试！页面正在刷新展示最新数据...');
              setTimeout(() => window.location.reload(), 1200);
            }}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-1.5"
            title="手动触发一次真实埋点上报以验证检测引擎"
          >
            <span>⚡ 触发真实埋点测试</span>
          </button>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>实时数据引擎监听中</span>
          </span>
        </div>
        </div>
      </div>

      {/* 4 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900/70 border border-neutral-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-1.5 text-neutral-400">
            <span className="text-xs font-bold uppercase tracking-wider">总页面浏览量 (PV)</span>
            <Eye className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{totalPageViews}</div>
          <div className="mt-2 text-[10px] text-sky-400 flex items-center justify-between">
            <span>独立访客 (UV): {totalUniqueVisitors}</span>
            <span className="font-mono">今日活跃: {dailyEntries[0]?.pageViews || 0}</span>
          </div>
        </div>

        <div className="bg-neutral-900/70 border border-neutral-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-1.5 text-neutral-400">
            <span className="text-xs font-bold uppercase tracking-wider">商品总曝光/浏览量</span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{totalProductViews}</div>
          <div className="mt-2 text-[10px] text-neutral-400 flex items-center justify-between">
            <span>真实弹窗与卡片预览</span>
            <span className="text-amber-300 font-mono">今日: {dailyEntries[0]?.productViews || 0} 次</span>
          </div>
        </div>

        <div className="bg-neutral-900/70 border border-neutral-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-1.5 text-neutral-400">
            <span className="text-xs font-bold uppercase tracking-wider">代理商外链点击总量</span>
            <ExternalLink className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{totalOutboundClicks}</div>
          <div className="mt-2 text-[10px] text-emerald-400 flex items-center justify-between">
            <span>全部 9 大代理商累计出海</span>
            <span className="font-mono">今日转化: {dailyEntries[0]?.outboundClicks || 0} 次</span>
          </div>
        </div>

        <div className="bg-neutral-900/70 border border-neutral-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-1.5 text-neutral-400">
            <span className="text-xs font-bold uppercase tracking-wider">综合购买转化率 (CTR)</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400 font-mono">{overallCtr}%</div>
          <div className="mt-2 text-[10px] text-neutral-400 flex items-center justify-between">
            <span>点击 / 浏览比率</span>
            <span className="text-purple-300 font-mono">真实访客行为转化</span>
          </div>
        </div>
      </div>

      {/* 各代理商独立页面浏览、点击与停留时长分析 */}
      <div className="bg-neutral-900/80 border border-neutral-800 p-5 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>各代理商页面访问、点击量与用户停留时长 (代理商驻留与流量明细)</span>
              </h4>
              <p className="text-[11px] text-neutral-400">
                实时追踪买家在各代理商状态下的切换频次、外链购买点击与累计浏览留存时间。
              </p>
            </div>
          </div>

          <div className="text-xs text-neutral-400 font-mono bg-neutral-950 px-3 py-1.5 rounded-xl border border-neutral-800">
            累计总停留时长: <strong className="text-amber-400">{formatTime(totalAgentSeconds)}</strong>
          </div>
        </div>

        {/* 9 Agents Performance Table */}
        <div className="overflow-x-auto rounded-xl border border-neutral-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-4">代理商</th>
                <th className="py-2.5 px-4 text-center">用户切换/访问量 (Views)</th>
                <th className="py-2.5 px-4 text-center">外链购买点击量 (Clicks)</th>
                <th className="py-2.5 px-4 text-center">点击份额占比</th>
                <th className="py-2.5 px-4 text-center">平均/累计停留时长 (Dwell Time)</th>
                <th className="py-2.5 px-4 text-right">活跃状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono">
              {allAgentStats.map((ag) => {
                const config = AGENTS[ag.agentId as AgentType];
                const clickShare = totalAgentClicks > 0 ? ((ag.clicks / totalAgentClicks) * 100).toFixed(1) : '0.0';
                const avgDwell = ag.views > 0 ? Math.round(ag.activeSeconds / ag.views) : 0;

                return (
                  <tr key={ag.agentId} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="py-2.5 px-4 flex items-center gap-2.5 font-bold text-white">
                      {config?.logoUrl ? (
                        <img 
                          src={config.logoUrl} 
                          alt="" 
                          className="w-5 h-5 object-contain rounded p-0.5 bg-neutral-950 border border-neutral-800" 
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      ) : null}
                      <span>{ag.name}</span>
                      <span className="text-[10px] text-neutral-500 font-normal">({ag.agentId})</span>
                    </td>
                    <td className="py-2.5 px-4 text-center font-bold text-sky-400">
                      {ag.views} 次
                    </td>
                    <td className="py-2.5 px-4 text-center font-bold text-emerald-400">
                      {ag.clicks} 次
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-[10px] text-amber-400 font-bold">
                        {clickShare}%
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="font-bold text-purple-400">
                        {formatTime(ag.activeSeconds)}
                      </span>
                      <span className="text-neutral-500 text-[10px] block mt-0.5">
                        (均次约 {avgDwell} 秒)
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right text-emerald-400 text-[11px] font-sans">
                      ● 实时统计
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Google Analytics 4 (GA4) Interface Integration Panel */}
      <div className="p-5 rounded-2xl bg-neutral-900/80 border border-amber-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Google Analytics 4 (GA4) 谷歌分析官方接口</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  ga4Config.enabled && ga4Config.measurementId ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {ga4Config.enabled && ga4Config.measurementId ? '已接入 (Active)' : '未启用 (Standby)'}
                </span>
              </h4>
              <p className="text-[11px] text-neutral-400">
                本站自带高性能轻量级埋点分析引擎，无需接入 GA 也可全面统计；若需连入 Google 官方分析看板，在下方填入测量 ID 即可同步发送事件。
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setGa4Config((prev: GoogleAnalyticsConfig) => ({ ...prev, enabled: !prev.enabled }));
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              ga4Config.enabled
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
            }`}
          >
            {ga4Config.enabled ? 'GA4 接口已开启' : '点击开启 GA4 接口'}
          </button>
        </div>

        <form onSubmit={handleSaveGa4} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-neutral-300 mb-1">
              GA4 测量 ID (Measurement ID)
            </label>
            <input
              type="text"
              value={ga4Config.measurementId}
              onChange={(e) => setGa4Config((prev: GoogleAnalyticsConfig) => ({ ...prev, measurementId: e.target.value.trim() }))}
              placeholder="例如: G-XXXXXXXXXX (在 Google Analytics 后台获取)"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div className="sm:col-span-1 flex items-center h-9">
            <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
              <input
                type="checkbox"
                checked={ga4Config.enabled}
                onChange={(e) => setGa4Config((prev: GoogleAnalyticsConfig) => ({ ...prev, enabled: e.target.checked }))}
                className="rounded bg-neutral-950 border-neutral-800 text-amber-500 focus:ring-0 cursor-pointer"
              />
              <span>启用实时跟踪代码注入</span>
            </label>
          </div>

          <div className="sm:col-span-1 flex justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>保存 GA4 配置</span>
            </button>
          </div>
        </form>
      </div>

      {/* 每日与每月流量多维度统计 (100% 真实数据 + 来源渠道分析) */}
      <div className="bg-neutral-900/60 border border-neutral-800 p-5 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>真实流量精确化监控：每日与每月明细（含流量来源渠道）</span>
            </h4>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              实时记录买家实际访问时间戳、来源平台（Google/Reddit/Direct/TikTok等）及设备类型。
            </p>
          </div>

          {/* Toggle Tab: Daily vs Monthly */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-950 border border-neutral-800">
            <button
              type="button"
              onClick={() => setAnalyticsViewTab('daily')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                analyticsViewTab === 'daily'
                  ? 'bg-amber-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              按每日统计 (Daily)
            </button>
            <button
              type="button"
              onClick={() => setAnalyticsViewTab('monthly')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                analyticsViewTab === 'monthly'
                  ? 'bg-amber-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              按每月统计 (Monthly)
            </button>
          </div>
        </div>

        {/* DAILY VIEW */}
        {analyticsViewTab === 'daily' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">访问日期 (Date)</th>
                  <th className="py-2.5 px-4">页面浏览 (PV)</th>
                  <th className="py-2.5 px-4">独立访客 (UV)</th>
                  <th className="py-2.5 px-4">商品曝光量</th>
                  <th className="py-2.5 px-4">外链点击转化</th>
                  <th className="py-2.5 px-4">主要流量来源渠道</th>
                  <th className="py-2.5 px-4 text-right">转化率 (CTR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono">
                {dailyEntries.length > 0 ? (
                  dailyEntries.map((d) => {
                    const dayCtr = d.productViews > 0 ? ((d.outboundClicks / d.productViews) * 100).toFixed(1) : '0.0';
                    const topSources = d.trafficSources ? Object.entries(d.trafficSources).sort((a, b) => (b[1] as number) - (a[1] as number)) : [];
                    return (
                      <tr key={d.date} className="hover:bg-neutral-800/30 transition-colors">
                        <td className="py-2.5 px-4 font-bold text-white flex items-center gap-1.5">
                          <span>{d.date}</span>
                          {d.date === (new Date().toISOString().split('T')[0]) && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded font-sans">今日</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-sky-400 font-bold">{d.pageViews} 次</td>
                        <td className="py-2.5 px-4 text-neutral-300">{d.uniqueVisitors} 人</td>
                        <td className="py-2.5 px-4 text-amber-400 font-bold">{d.productViews}</td>
                        <td className="py-2.5 px-4 text-emerald-400 font-bold">{d.outboundClicks}</td>
                        <td className="py-2.5 px-4 text-neutral-300 font-sans text-[11px]">
                          {topSources.length > 0 ? (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {topSources.slice(0, 3).map(([src, count]) => (
                                <span key={src} className="px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-[10px]">
                                  {src}: <strong className="text-amber-400 font-mono">{String(count)}</strong>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-neutral-500 text-[10px]">Direct / 直接访问</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-right text-purple-400 font-bold">{dayCtr}%</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-neutral-500 font-sans">
                      暂无今日真实访问数据。当买家打开网站或浏览商品时，系统将自动精确捕获并实时呈现。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* MONTHLY VIEW */}
        {analyticsViewTab === 'monthly' && (() => {
          const monthlyEntries = Object.values(monthlyStats).sort((a, b) => b.month.localeCompare(a.month));
          return (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">月份 (Month)</th>
                    <th className="py-2.5 px-4">月累计浏览 (PV)</th>
                    <th className="py-2.5 px-4">月独立访客 (UV)</th>
                    <th className="py-2.5 px-4">月单品曝光总量</th>
                    <th className="py-2.5 px-4">月外链点击转化</th>
                    <th className="py-2.5 px-4">月度主要渠道来源</th>
                    <th className="py-2.5 px-4 text-right">月平均转化率 (CTR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 font-mono">
                  {monthlyEntries.length > 0 ? (
                    monthlyEntries.map((m) => {
                      const mCtr = m.productViews > 0 ? ((m.outboundClicks / m.productViews) * 100).toFixed(1) : '0.0';
                      const topSources = m.trafficSources ? Object.entries(m.trafficSources).sort((a, b) => (b[1] as number) - (a[1] as number)) : [];
                      return (
                        <tr key={m.month} className="hover:bg-neutral-800/30 transition-colors">
                          <td className="py-2.5 px-4 font-bold text-white flex items-center gap-1.5 font-sans">
                            <span>{m.monthLabel}</span>
                            <span className="text-[10px] text-neutral-500 font-mono">({m.month})</span>
                          </td>
                          <td className="py-2.5 px-4 text-sky-400 font-bold">{m.pageViews} 次</td>
                          <td className="py-2.5 px-4 text-neutral-300">{m.uniqueVisitors} 人</td>
                          <td className="py-2.5 px-4 text-amber-400 font-bold">{m.productViews}</td>
                          <td className="py-2.5 px-4 text-emerald-400 font-bold">{m.outboundClicks}</td>
                          <td className="py-2.5 px-4 text-neutral-300 font-sans text-[11px]">
                            {topSources.length > 0 ? (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {topSources.slice(0, 3).map(([src, count]) => (
                                  <span key={src} className="px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-[10px]">
                                    {src}: <strong className="text-amber-400 font-mono">{String(count)}</strong>
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-neutral-500 text-[10px]">Direct / 直接访问</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-right text-purple-400 font-bold">{mCtr}%</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-neutral-500 font-sans">
                        暂无历史月份数据归档。系统在每月运行期间将自动汇总当月所有浏览与点击指标。
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          );
        })()}
      </div>

      {/* Detailed Per-Product Analytics (每个商品的浏览与点击详情) */}
      <div className="bg-neutral-900/60 border border-neutral-800 p-5 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>每个商品的独立浏览与点击明细排行 (单品明细与转化排行)</span>
            </h4>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              实时统计每件商品的曝光量、点击量、点击率及主要转化代理，精准洞察爆款。
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={analyticsSearch}
                onChange={(e) => setAnalyticsSearch(e.target.value)}
                placeholder="搜索商品名称、品牌或ID..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <select
              value={analyticsSortBy}
              onChange={(e) => setAnalyticsSortBy(e.target.value as any)}
              className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="clicks">按点击量排行 (Top Clicks)</option>
              <option value="views">按浏览曝光排行 (Top Views)</option>
              <option value="ctr">按转化率排行 (Top CTR)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-neutral-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-4">商品 ID</th>
                <th className="py-2.5 px-4">商品名称 (Product Name)</th>
                <th className="py-2.5 px-4">品牌</th>
                <th className="py-2.5 px-4">分类</th>
                <th className="py-2.5 px-4 text-center">曝光浏览 (Views)</th>
                <th className="py-2.5 px-4 text-center">外链点击 (Clicks)</th>
                <th className="py-2.5 px-4 text-center">点击转化率 (CTR)</th>
                <th className="py-2.5 px-4">主要引流代理商</th>
                <th className="py-2.5 px-4 text-right">最近活动时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono">
              {filteredList.slice(0, 30).map((item, rank) => {
                const ctr = item.views > 0 ? ((item.clicks / item.views) * 100).toFixed(1) : '0.0';
                const topAgent = Object.entries(item.agentClicks || {}).sort((a, b) => (b[1] as number) - (a[1] as number))[0];

                return (
                  <tr key={item.productId} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="py-2.5 px-4 text-neutral-500 font-bold">
                      <span className="text-amber-400/90 font-mono">#{rank + 1}</span> {item.productId}
                    </td>
                    <td className="py-2.5 px-4 max-w-xs truncate font-medium text-white font-sans" title={item.name}>
                      {item.name}
                    </td>
                    <td className="py-2.5 px-4 text-neutral-300 font-sans">
                      {item.brand || 'Unbranded'}
                    </td>
                    <td className="py-2.5 px-4 text-[10px] text-neutral-400">
                      {item.category}
                    </td>
                    <td className="py-2.5 px-4 text-center font-bold text-amber-400">
                      {item.views}
                    </td>
                    <td className="py-2.5 px-4 text-center font-bold text-emerald-400">
                      {item.clicks}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        parseFloat(ctr) >= 20 ? 'bg-purple-500/20 text-purple-300' : 'bg-neutral-800 text-neutral-400'
                      }`}>
                        {ctr}%
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-neutral-300">
                      {topAgent ? (
                        <span className="px-2 py-0.5 rounded bg-neutral-800 text-amber-400 text-[10px] font-bold">
                          {topAgent[0].toUpperCase()} ({String(topAgent[1])}次)
                        </span>
                      ) : (
                        <span className="text-neutral-500 text-[10px]">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right text-neutral-500 text-[10px]">
                      {item.lastViewedAt !== '-' ? new Date(item.lastViewedAt).toLocaleTimeString() : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredList.length === 0 && (
          <div className="py-8 text-center text-xs text-neutral-500">
            未搜索到匹配的商品分析数据
          </div>
        )}
      </div>
    </div>
  );
};
