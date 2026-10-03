import React, { useState } from 'react';
import { 
  X, 
  Save, 
  Image as ImageIcon, 
  Tag, 
  DollarSign, 
  Link as LinkIcon, 
  Sparkles, 
  Layers, 
  Eye, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { Product } from '../types/product';
import { saveProductOverride, deleteProductOverride } from '../services/api';

interface EditProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  showToast: (msg: string) => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onSaved,
  showToast
}) => {
  if (!isOpen || !product) return null;

  const [name, setName] = useState(product.name || '');
  const [imageUrl, setImageUrl] = useState(product.imageUrl || '');
  const [price, setPrice] = useState(product.price || '');
  const [brand, setBrand] = useState(product.brand || '');
  const [category, setCategory] = useState(product.category || 'SNEAKERS');
  const [sourceUrl, setSourceUrl] = useState(product.sourceUrl || '');
  const [imgError, setImgError] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('请输入商品名称');
      return;
    }

    const updates: Partial<Product> = {
      name: name.trim(),
      imageUrl: imageUrl.trim(),
      price: price.trim(),
      brand: brand.trim(),
      category: category.trim(),
      sourceUrl: sourceUrl.trim()
    };

    const targetId = product.productId || product.id;
    saveProductOverride(targetId, updates);
    saveProductOverride(product.id, updates);

    showToast(`商品「${name.slice(0, 15)}...」修改已保存并即时生效！`);
    onSaved();
    onClose();
  };

  const handleResetToOriginal = () => {
    const targetId = product.productId || product.id;
    deleteProductOverride(targetId);
    deleteProductOverride(product.id);
    showToast('已重置为表格原始数据！');
    onSaved();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl shadow-black overflow-hidden ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                  编辑商品资料与换图 (Edit Product)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300 text-[10px] font-mono">
                  ID: {product.productId || product.id}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                支持更换高清实物图片、调整商品标题、改价、更改品牌与分类，即时生效。
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

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Image URL & Live Preview */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span>商品主图 URL (支持更换任意图床/微店/淘宝高清直链)</span>
              </label>
              <span className="text-[11px] text-neutral-500 font-mono">实时预览</span>
            </div>

            <div className="flex gap-4 items-center">
              {/* Image Preview Box */}
              <div className="w-20 h-20 rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden shrink-0 relative flex items-center justify-center group">
                {imageUrl && !imgError ? (
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    onError={() => setImgError(true)}
                    onLoad={() => setImgError(false)}
                  />
                ) : (
                  <span className="text-[10px] text-neutral-500 font-mono text-center px-1">
                    {imgError ? '图片加载失败' : '无预览图'}
                  </span>
                )}
              </div>

              {/* URL Input */}
              <div className="flex-1 space-y-1.5">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImgError(false);
                  }}
                  placeholder="https://... 粘贴新图片直链"
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none font-mono"
                />
                <p className="text-[10px] text-neutral-400">
                  支持来自微店、淘宝、Imgur、第三方图床等任何直接图片链接 (.jpg/.png/.webp)。
                </p>
              </div>
            </div>
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5">
              商品全称 (Product Title / Name) *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如: LV Trainer Sneaker Monogram Denim"
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none"
              required
            />
          </div>

          {/* Price & Brand (2 columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                <span>价格 (Price / CNY 或 USD)</span>
              </label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="例如: ¥320 或 $48"
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-sky-400" />
                <span>品牌 (Brand)</span>
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="例如: Louis Vuitton, Nike, Ralph Lauren"
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Category & Source URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>分类归属 (Category)</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="SNEAKERS">球鞋 (SNEAKERS)</option>
                <option value="HOODIE/PANTS">卫衣与长裤 (HOODIE/PANTS)</option>
                <option value="T-SHIRTS/SHORTS">短袖与短裤 (T-SHIRTS/SHORTS)</option>
                <option value="DOWNJACKET">羽绒服/棉服 (DOWNJACKET)</option>
                <option value="COATS/JACKETS">大衣与夹克 (COATS/JACKETS)</option>
                <option value="BAGS">箱包配饰 (BAGS)</option>
                <option value="ACCESSORIES">潮流配件 (ACCESSORIES)</option>
                <option value="SUITS">西服套装 (SUITS)</option>
                <option value="JERSEYS">复古球衣 (JERSEYS)</option>
                <option value="HOTSALE">热销爆款 (HOTSALE)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>原始微店/淘宝链接 (Source URL)</span>
              </label>
              <input
                type="text"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://weidian.com/..."
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-800/80">
            <button
              type="button"
              onClick={handleResetToOriginal}
              className="px-3.5 py-2 rounded-xl border border-neutral-800 hover:border-rose-500/50 text-neutral-400 hover:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="清除所有本地自定义修改，恢复表格原始数据"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>恢复表格原始值</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                取消
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>保存并即时生效</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
