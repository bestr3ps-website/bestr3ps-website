import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Upload, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  HelpCircle,
  Image as ImageIcon,
  Flame,
  ShieldCheck,
  Check
} from 'lucide-react';
import { saveCustomProductRequest } from '../services/adminService';

interface CustomerRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
}

export const CustomerRequestModal: React.FC<CustomerRequestModalProps> = ({
  isOpen,
  onClose,
  showToast
}) => {
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [contactType, setContactType] = useState<'discord' | 'whatsapp' | 'email'>('discord');
  const [contactHandle, setContactHandle] = useState('');
  const [targetBudget, setTargetBudget] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const image = new Image();
        image.onload = () => {
          // Resize to max 1000px width/height with 0.82 JPEG quality
          const maxDim = 1000;
          let width = image.width;
          let height = image.height;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(image, 0, 0, width, height);
            // High quality, tiny footprint ~80-180KB
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
            resolve(compressedDataUrl);
          } else {
            resolve(readerEvent.target?.result as string);
          }
        };
        image.src = readerEvent.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file);
        setImagePreview(compressedBase64);
      } catch {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productName.trim() && !imagePreview) {
      showToast('Please provide a Product Name or upload a Reference Image.');
      return;
    }
    if (!contactHandle.trim()) {
      showToast('Please provide your Discord tag, WhatsApp number, or contact info.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      productName: productName.trim() || 'Custom Requested Item (Image Reference)',
      description: description.trim(),
      referenceImages: imagePreview ? [imagePreview] : [],
      contactType,
      contactHandle: contactHandle.trim(),
      targetBudget: targetBudget.trim()
    };

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000); // 10s timeout for image upload

      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timer);

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Server failed to record request');
      }

      // Record successfully persisted in central database
      setIsSubmitting(false);
      setIsSubmitted(true);
      showToast('Item request submitted successfully! Request ID: ' + (json.data?.id || 'ACCEPTED'));
    } catch (err: any) {
      console.error('Customer request submission failed:', err);
      setIsSubmitting(false);
      const errMsg = err?.message || 'Failed to submit request. Please check your network and try again.';
      alert('Submission Error: ' + errMsg);
      showToast('Error: ' + errMsg);
    }
  };

  const handleResetAndClose = () => {
    setProductName('');
    setDescription('');
    setContactHandle('');
    setTargetBudget('');
    setImagePreview('');
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={handleResetAndClose}
    >
      <div 
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl shadow-black overflow-hidden ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with High-Visibility Guarantee Badge */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
                  Custom Item Sourcing & Request Window
                </h3>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Looking for a grail not in our spreadsheet? Tell us what you want!
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 24-Hour Fulfillment Promise Banner */}
        <div className="bg-gradient-to-r from-amber-500/20 via-neutral-900 to-amber-500/10 border-b border-amber-500/30 px-6 py-3 flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0 font-bold">
            <Clock className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div className="text-xs">
            <span className="font-extrabold text-amber-400 uppercase tracking-wide">
              ⚡ 24-Hour Guaranteed Catalog Sourcing & Update Promise
            </span>
            <p className="text-neutral-300 text-[11px] mt-0.5">
              Leave your requested grail details below. Our China-based sourcing specialists will locate top batches (Weidian/Taobao/1688) and <strong className="text-white">update our catalog within 24 hours</strong>, notifying you via Discord or WhatsApp!
            </p>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isSubmitted ? (
            <div className="py-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-white font-['Space_Grotesk']">
                Request Dispatched to Sourcing Team!
              </h4>
              <p className="text-xs text-neutral-300 max-w-md mx-auto leading-relaxed">
                Thank you! We have logged your grail request into our daily sourcing queue. Our procurement team will find the highest quality 1:1 batch, add it to the live catalog within 24 hours, and ping you directly on <strong className="text-amber-400">{contactType.toUpperCase()}</strong>: {contactHandle}.
              </p>
              <div className="pt-4">
                <button
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  Back to Catalog
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* How it Works / Instructions Box */}
              <div className="p-3.5 rounded-2xl bg-neutral-950/70 border border-neutral-800 text-xs text-neutral-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span>How This Sourcing Service Works (3 Simple Steps)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-neutral-400 pt-1">
                  <div className="p-2 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
                    <strong className="text-amber-400 block mb-0.5">1. Submit Details</strong>
                    Provide the sneaker or apparel name, batch preference, or upload a screenshot/photo.
                  </div>
                  <div className="p-2 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
                    <strong className="text-amber-400 block mb-0.5">2. 24h Batch Hunting</strong>
                    We verify factory QC flaws, price-to-quality ratios, and seller reliability in China.
                  </div>
                  <div className="p-2 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
                    <strong className="text-amber-400 block mb-0.5">3. Instant Notification</strong>
                    Item is published to BESTR3PS catalog and direct purchasing links are sent to your contact.
                  </div>
                </div>
              </div>

              {/* Product Name Input */}
              <div>
                <label className="block text-xs font-bold text-neutral-200 mb-1">
                  Item Name or Model Code <span className="text-neutral-500">(Required if no image uploaded)</span>
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Travis Scott Jordan 1 Low 'Canary', Sp5der Pink Web Hoodie, Corteiz Windbreaker..."
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none"
                />
              </div>

              {/* Image Upload Area */}
              <div>
                <label className="block text-xs font-bold text-neutral-200 mb-1">
                  Upload Reference Image / Screenshot <span className="text-amber-400 font-normal">(Optional but highly recommended)</span>
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-neutral-800 hover:border-amber-500/50 rounded-2xl p-4 bg-neutral-950/50 cursor-pointer transition-colors group">
                    <Upload className="w-5 h-5 text-neutral-500 group-hover:text-amber-400 mb-1 transition-colors" />
                    <span className="text-xs text-neutral-300 font-medium">Click to upload photo or screenshot</span>
                    <span className="text-[10px] text-neutral-500 mt-0.5">PNG, JPG, WEBP up to 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  {imagePreview && (
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-neutral-700 bg-neutral-950 shrink-0 group">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImagePreview('')}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/80 text-white flex items-center justify-center text-xs hover:bg-red-500 transition-colors cursor-pointer"
                        title="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Batch or Size / Budget Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-200 mb-1">
                    Specific Batch / Size / Colorway Details
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Size 44, prefer LJR or PK 4.0 batch, black colorway"
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-200 mb-1">
                    Target Budget (USD or RMB)
                  </label>
                  <input
                    type="text"
                    value={targetBudget}
                    onChange={(e) => setTargetBudget(e.target.value)}
                    placeholder="e.g. Under $60 / 400 RMB"
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Contact Method for Guaranteed 24h Notification */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-white flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-amber-400" />
                    <span>Your Contact for 24h Notification</span>
                  </label>
                  <span className="text-[10px] text-amber-400 font-mono font-bold">
                    Guaranteed ping within 24h
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setContactType('discord')}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
                      contactType === 'discord'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-sm'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>Discord</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setContactType('whatsapp')}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
                      contactType === 'whatsapp'
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow-sm'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setContactType('email')}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
                      contactType === 'email'
                        ? 'bg-amber-600/20 border-amber-500 text-amber-400 shadow-sm'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>Email / Social</span>
                  </button>
                </div>

                <input
                  type="text"
                  value={contactHandle}
                  onChange={(e) => setContactHandle(e.target.value)}
                  placeholder={
                    contactType === 'discord' 
                      ? 'Enter your Discord username (e.g. repbuyer#1234 or @username)'
                      : contactType === 'whatsapp'
                      ? 'Enter WhatsApp phone number with country code (e.g. +1 555 123 4567)'
                      : 'Enter your email address or telegram handle'
                  }
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-500 rounded-xl px-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none font-mono"
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <span className="font-bold">Error:</span> {errorMessage}
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-neutral-950 font-black py-3 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Sourcing Request (24h Guaranteed Update)</span>
                </button>
                <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-500 mt-2 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>100% Free VIP Sourcing Service • Zero Commission • Factory Direct Finding</span>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
