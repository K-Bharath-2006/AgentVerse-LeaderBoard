import { useState, useEffect } from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  isPrompt?: boolean;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (inputValue?: string) => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  isPrompt = false,
  placeholder = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel
}: ConfirmationModalProps) {
  const [inputValue, setInputValue] = useState('');

  // Reset input when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setInputValue('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPrompt && !inputValue.trim()) return;
    onConfirm(isPrompt ? inputValue : undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onCancel}
      />

      {/* Modal Dialog Card */}
      <div 
        className="relative bg-white rounded-3xl border border-slate-200 p-6 shadow-premium w-full max-w-md transform scale-100 transition-all duration-300 z-10 space-y-5"
        style={{ animation: 'modalEntrance 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
      >
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl ${isPrompt ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'} flex-shrink-0`}>
            {isPrompt ? <HelpCircle className="w-5 h-5 animate-pulse" /> : <AlertCircle className="w-5 h-5" />}
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="text-base font-black text-slate-900 tracking-tight">{title}</h3>
            <p className="text-xs font-semibold text-slate-500 leading-relaxed">{message}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isPrompt && (
            <div>
              <input
                type="text"
                autoFocus
                placeholder={placeholder}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl text-xs font-extrabold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              type="submit"
              disabled={isPrompt && !inputValue.trim()}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all cursor-pointer shadow-md ${
                isPrompt && !inputValue.trim() 
                  ? 'opacity-50 cursor-not-allowed bg-slate-400' 
                  : isPrompt 
                    ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg' 
                    : 'bg-rose-600 hover:bg-rose-700 hover:shadow-lg'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </form>
      </div>

      {/* Embedded entrance keyframes */}
      <style>{`
        @keyframes modalEntrance {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
