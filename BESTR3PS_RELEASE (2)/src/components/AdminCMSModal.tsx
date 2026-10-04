import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Layers, 
  Sliders, 
  ExternalLink, 
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { Product, CategoryKey } from '../types/product';
import { 
  getCustomProducts, 
  saveCustomProduct, 
  deleteCustomProduct, 
  clearCustomProducts,
  getStoredSiteConfig, 
  saveStoredSiteConfig, 
  SiteConfig,
  DEFAULT_SITE_CONFIG,
  detectBrand
} from '../services/api';
import { cleanSourceUrl, extractProductId } from '../utils/agentConverter';

interface AdminCMSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshCatalog: () => void;
}

export const AdminCMSModal: React.FC<AdminCMSModalProps> = ({
  isOpen,
  onClose,
  onRefreshCatalog
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'manage' | 'siteConfig'>('upload');
  const [customList, setCustomList] = useState<Product[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Form states for new item
  const [itemName, setItemName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState<CategoryKey>('SNEAKERS');
  const [brand, setBrand] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(45);

  const categories: CategoryKey[] = [
    'SNEAKERS', 'T-SHIRTS/SHORTS', 'HOODIE/PANTS', 'DOWNJACKET',
    'COATS/JACKETS', 'SUITS', 'ACCESSORIES', 'BAGS', 'JERSEYS'
  ];

  useEffect(() => {
    if (isOpen) {
      setCustomList(getCustomProducts());
      setSiteConfig(getStoredSiteConfig());
      setSavedNotice(null);
    }
  }, [isOpen]);

  const showNotification = (msg: string) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(null), 3500);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !sourceUrl.trim() || !price.trim()) {
      alert('Please fill in Item Name, Source Link (Weidian/Taobao/1688), and Price!');
      return;
    }

    const clean = cleanSourceUrl(sourceUrl);
    const pId = extractProductId(clean) || Date.now().toString();
    const finalBrand = brand.trim() || detectBrand(itemName);

    let finalPrice = price.trim();
    if (!finalPrice.startsWith('$') && !finalPrice.startsWith('¥')) {
      finalPrice = '$' + finalPrice;
    }

    const newProd: Product = {
      id: 'custom_' + Date.now() + '_' + pId,
      name: itemName.trim(),
      sourceUrl: clean,
      price: finalPrice,
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
      productId: pId,
      category: category,
      brand: finalBrand,
      discountPercent: discountPercent || 45,
      dateAdded: new Date().toISOString()
    };

    saveCustomProduct(newProd);
    setCustomList(getCustomProducts());
    onRefreshCatalog();

    // Reset fields
    setItemName('');
    setSourceUrl('');
    setPrice('');
    setImageUrl('');
    setBrand('');
    showNotification('Product successfully added and published to the live catalog!');
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Are you sure you want to remove this custom item?')) {
      deleteCustomProduct(id);
      setCustomList(getCustomProducts());
      onRefreshCatalog();
      showNotification('Item removed from custom database.');
    }
  };

  const handleSaveSiteConfig = () => {
    saveStoredSiteConfig(siteConfig);
    showNotification('Site contents & announcements updated immediately!');
    onRefreshCatalog();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-neutral-900/98 border border-neutral-800 rounded-3xl p-5 sm:p-8 shadow-2xl shadow-black my-auto text-left backdrop-blur-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-5 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-orange-500 flex items-center justify-center text-neutral-950 shadow-lg shadow-amber-500/25 ring-1 ring-amber-400/40">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-['Space_Grotesk']">
                  Merchant CMS Admin Dashboard
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider border border-amber-500/30">
                  Full Control
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Upload new finds, edit custom items, and dynamically adjust site banners, announcements, and contacts.
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

        {/* Saved Toast Notification */}
        {savedNotice && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{savedNotice}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-neutral-800/60 pb-3 mb-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                : 'bg-neutral-800/70 hover:bg-neutral-800 text-neutral-300 border border-neutral-700/60'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Product (发布商品)</span>
          </button>

          <button
            onClick={() => setActiveTab('manage')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'manage'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                : 'bg-neutral-800/70 hover:bg-neutral-800 text-neutral-300 border border-neutral-700/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Manage Custom Items ({customList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('siteConfig')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'siteConfig'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                : 'bg-neutral-800/70 hover:bg-neutral-800 text-neutral-300 border border-neutral-700/60'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Site Content & Copy Settings (网站内容配置)</span>
          </button>
        </div>

        {/* Tab Content 1: Upload Product */}
        {activeTab === 'upload' && (
          <form onSubmit={handleSaveProduct} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="bg-neutral-950/60 border border-neutral-800 p-4 rounded-2xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Item Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    Product Title / Name *
                  </label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g. Sp5der 555555 Angel Number Pink Web Hoodie"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                {/* Source Link */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5 flex items-center justify-between">
                    <span>Source Marketplace URL (Weidian / Taobao / 1688) *</span>
                    <span className="text-[10px] text-amber-400 font-normal">Auto converts to all 9 agents</span>
                  </label>
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://weidian.com/item.html?itemID=... or Taobao link"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                {/* Selling Price */}
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    Price (USD or CNY) *
                  </label>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. $38 or 240"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    Brand Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Sp5der, Rick Owens, Nike (Auto-detects if blank)"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CategoryKey)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    Image URL (QC / Product Photo)
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... direct image address"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold px-7 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-500/20 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Publish Item Immediately</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab Content 2: Manage Custom Items */}
        {activeTab === 'manage' && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {customList.length === 0 ? (
              <div className="p-8 text-center bg-neutral-950/60 rounded-2xl border border-neutral-800">
                <FileSpreadsheet className="w-10 h-10 text-neutral-600 mx-auto mb-2.5" />
                <p className="text-neutral-400 text-xs">
                  No custom items uploaded yet. Use the "Add New Product" tab to add your first find!
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-neutral-400 pb-1">
                  <span>Showing {customList.length} custom merchant listings</span>
                  <button
                    onClick={() => {
                      if (confirm('Clear all custom uploaded items?')) {
                        clearCustomProducts();
                        setCustomList([]);
                        onRefreshCatalog();
                      }
                    }}
                    className="text-red-400 hover:text-red-300 text-[11px] cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                {customList.map((item) => (
                  <div 
                    key={item.id} 
                    className="p-3.5 rounded-2xl bg-neutral-950/70 border border-neutral-800 flex items-center justify-between gap-4 hover:border-neutral-700 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-12 h-12 rounded-xl object-cover border border-neutral-800 shrink-0 bg-neutral-900"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-white truncate max-w-md">
                          {item.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px]">
                          <span className="text-amber-400 font-mono font-bold">{item.price}</span>
                          <span className="text-neutral-600">•</span>
                          <span className="text-neutral-400 uppercase font-mono text-[10px]">{item.category}</span>
                          {item.brand && (
                            <>
                              <span className="text-neutral-600">•</span>
                              <span className="text-neutral-300 font-semibold">{item.brand}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                        title="Visit source"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer border border-red-500/20"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content 3: Site Content Configuration */}
        {activeTab === 'siteConfig' && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="bg-neutral-950/60 border border-neutral-800 p-4 rounded-2xl space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Website Name / Logo Title
                </label>
                <input
                  type="text"
                  value={siteConfig.siteTitle}
                  onChange={(e) => setSiteConfig({ ...siteConfig, siteTitle: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Website Subtitle / Tagline
                </label>
                <input
                  type="text"
                  value={siteConfig.siteSubtitle}
                  onChange={(e) => setSiteConfig({ ...siteConfig, siteSubtitle: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Top Announcement Ticker Message
                </label>
                <input
                  type="text"
                  value={siteConfig.announcementText}
                  onChange={(e) => setSiteConfig({ ...siteConfig, announcementText: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Promotional Banner Deal Text
                </label>
                <input
                  type="text"
                  value={siteConfig.bannerDiscountText}
                  onChange={(e) => setSiteConfig({ ...siteConfig, bannerDiscountText: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    Discord Contact Link
                  </label>
                  <input
                    type="text"
                    value={siteConfig.contactDiscord}
                    onChange={(e) => setSiteConfig({ ...siteConfig, contactDiscord: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    WhatsApp Contact Number
                  </label>
                  <input
                    type="text"
                    value={siteConfig.contactWhatsApp}
                    onChange={(e) => setSiteConfig({ ...siteConfig, contactWhatsApp: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveSiteConfig}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold px-7 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-500/20 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Site Configurations</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
