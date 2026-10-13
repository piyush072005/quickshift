import React from 'react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-900 text-white shadow-2xl border border-slate-700/60 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <span className="material-symbols-outlined text-teal-400 text-[20px]">
        check_circle
      </span>
      <span className="text-sm font-medium tracking-tight pr-2">{message}</span>
      <button 
        onClick={onClose}
        className="p-1 text-slate-400 hover:text-white transition-colors"
        aria-label="Dismiss notification"
      >
        <span className="material-symbols-outlined text-[16px]">close</span>
      </button>
    </div>
  );
};
