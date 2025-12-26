import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  link?: string;
  duration?: number;
}

export function Toast({ message, type, onClose, link, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-5 duration-300">
      <div
        className={`min-w-[320px] max-w-md p-4 rounded-xl border shadow-2xl backdrop-blur-xl ${
          type === 'success'
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-red-500/10 border-red-500/30'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-medium ${
                type === 'success' ? 'text-green-100' : 'text-red-100'
              }`}
            >
              {message}
            </p>
            {link && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-xs text-indigo-300 hover:text-indigo-200 transition-colors"
              >
                View on GitHub
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <button
            onClick={onClose}
            className={`flex-shrink-0 p-1 rounded-lg transition-colors ${
              type === 'success'
                ? 'hover:bg-green-500/20 text-green-300'
                : 'hover:bg-red-500/20 text-red-300'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
