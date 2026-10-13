import React, { useState, useEffect } from 'react';
import { NavigationTab } from '../../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavigationTab) => void;
  onTriggerToast: (msg: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onTriggerToast,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickLinks = [
    { title: 'Sunita Rao', type: 'Employee • Housekeeping', tab: 'staff-roster' as NavigationTab, icon: 'person' },
    { title: 'Pooja Nair', type: 'Employee • Lead Server', tab: 'staff-roster' as NavigationTab, icon: 'person' },
    { title: 'Priya Sharma', type: 'Talent Pool • 92% Match', tab: 'talent-pool' as NavigationTab, icon: 'badge' },
    { title: 'AI Staffing Demand Forecast', type: 'View Peak Curve', tab: 'ai-forecast' as NavigationTab, icon: 'insights' },
    { title: 'Housekeeping (6 Short)', type: 'Department Demand', tab: 'overview' as NavigationTab, icon: 'cleaning_services' },
    { title: 'WhatsApp Shift Dispatch Simulator', type: 'Manager to Employee WhatsApp', tab: 'whatsapp-simulator' as NavigationTab, icon: 'chat' },
    { title: 'Workforce Rules & Overtime', type: 'System Settings', tab: 'settings' as NavigationTab, icon: 'tune' },
  ];

  const filteredLinks = query.trim() === ''
    ? quickLinks
    : quickLinks.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) || 
        item.type.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Search Input Bar */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
          <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search employee, shift, role, or talent pool..."
            className="flex-1 text-sm bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
          />
          <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-400 text-[10px] font-semibold uppercase">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="p-2 max-h-80 overflow-y-auto divide-y divide-slate-100">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {query.trim() === '' ? 'Quick Access' : 'Matching Results'}
          </div>

          {filteredLinks.length > 0 ? (
            filteredLinks.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onNavigate(item.tab);
                  onClose();
                  onTriggerToast(`Navigated to ${item.title}`);
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-teal-50 group-hover:text-teal-700 transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 leading-tight">{item.title}</div>
                    <div className="text-[11px] text-slate-400 leading-tight mt-0.5">{item.type}</div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[16px] text-slate-300 group-hover:text-teal-600 transition-colors">
                  arrow_forward
                </span>
              </button>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-slate-400">
              No matching records found for "{query}".
            </div>
          )}
        </div>

        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Navigate with arrows or click to open</span>
          <span className="font-semibold text-teal-700">QuickShift Search</span>
        </div>
      </div>
    </div>
  );
};
