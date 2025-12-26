import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { PricingCards } from './PricingCards';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggeredByLimit?: boolean;
}

export function PricingModal({ isOpen, onClose, triggeredByLimit }: PricingModalProps) {
  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full h-full max-h-screen overflow-hidden flex flex-col">
        {/* Close Button */}
        <div className="absolute top-6 right-6 z-20">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg hover:bg-neutral-800 flex items-center justify-center transition-colors bg-neutral-900/80"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="relative z-10 flex-1 overflow-y-auto bg-black px-6 py-12">
          {/* Pricing Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">Pricing</h1>
            <p className="text-lg text-neutral-400">
              {triggeredByLimit
                ? "You've reached the free tier limit. Upgrade to continue building!"
                : "Start for free. Upgrade as you go."}
            </p>
          </div>

          <PricingCards />
        </div>
      </div>
    </div>,
    document.body
  );
}
