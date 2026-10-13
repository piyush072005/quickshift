import React from 'react';
import { WifiOff, Database } from 'lucide-react';

interface OfflineIndicatorProps {
  isSimulatedOffline: boolean;
  onToggleSimulatedOffline: () => void;
  onOpenStorageModal: () => void;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  isSimulatedOffline,
  onToggleSimulatedOffline,
  onOpenStorageModal,
}) => {
  const isBrowserOffline = typeof navigator !== 'undefined' ? !navigator.onLine : false;
  const isOffline = isSimulatedOffline || isBrowserOffline;

  if (!isOffline) return null;

  return (
    <aside
      aria-label="Offline Mode Status"
      className="fixed bottom-4 left-4 z-40 flex items-center gap-3 rounded-xl bg-slate-900/95 text-white px-4 py-2.5 shadow-2xl border border-slate-700 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 text-xs"
    >
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
        <WifiOff className="w-4 h-4 text-amber-400" />
        <span className="font-semibold text-slate-100">
          {isSimulatedOffline ? 'Simulated Offline Mode Active' : 'Offline Mode — Local Storage Active'}
        </span>
      </div>

      <div className="flex items-center gap-2 pl-3 border-l border-slate-700">
        <button
          onClick={onOpenStorageModal}
          className="text-teal-400 hover:text-teal-300 font-medium underline flex items-center gap-1"
        >
          <Database className="w-3.5 h-3.5" />
          <span>Storage DB</span>
        </button>

        {isSimulatedOffline && (
          <button
            onClick={onToggleSimulatedOffline}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-600"
          >
            Go Online
          </button>
        )}
      </div>
    </aside>
  );
};
