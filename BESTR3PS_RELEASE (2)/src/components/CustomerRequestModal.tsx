import React, { useEffect } from 'react';
import { X, Sparkles, ExternalLink } from 'lucide-react';

interface CustomerRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast?: (message: string) => void;
}

export const CustomerRequestModal: React.FC<CustomerRequestModalProps> = ({
  isOpen,
  onClose
}) => {
  // If opened directly, trigger official Tally popup automatically
  useEffect(() => {
    if (isOpen) {
      if (typeof (window as any).Tally !== 'undefined') {
        (window as any).Tally.openPopup('aQ8Nay', {
          emoji: { text: '👋', animation: 'wave' },
          onClose: () => onClose()
        });
        onClose();
      }
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-neutral-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
              Request Item Sourcing
            </h3>
            <p className="text-xs text-neutral-400">Guaranteed catalog finding & update within 24h</p>
          </div>
        </div>

        <div className="py-4 text-center space-y-4">
          <p className="text-sm text-neutral-300">
            Click below to open our official Tally Request Form:
          </p>

          <button
            type="button"
            data-tally-open="aQ8Nay"
            data-tally-emoji-text="👋"
            data-tally-emoji-animation="wave"
            onClick={() => {
              if (typeof (window as any).Tally !== 'undefined') {
                (window as any).Tally.openPopup('aQ8Nay', { emoji: { text: '👋', animation: 'wave' } });
              } else {
                window.open('https://tally.so/r/aQ8Nay', '_blank');
              }
              onClose();
            }}
            className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-neutral-950 font-black py-3 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition-all cursor-pointer"
          >
            <span>Open Sourcing Form</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
