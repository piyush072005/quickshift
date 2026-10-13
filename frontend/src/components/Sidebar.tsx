import React from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  CalendarDays, 
  Users, 
  BarChart3, 
  Settings, 
  HelpCircle,
  CheckSquare,
  HardDrive
} from 'lucide-react';

export type NavTab = 'overview' | 'forecast' | 'schedule' | 'talent' | 'tasks' | 'analytics' | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  openLocalStorageModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, openLocalStorageModal }) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'forecast', label: 'AI Forecast', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'schedule', label: 'Staff Roster', icon: <CalendarDays className="w-5 h-5" /> },
    { id: 'talent', label: 'Talent Pool', icon: <Users className="w-5 h-5" /> },
    { id: 'tasks', label: 'Task Operations', icon: <CheckSquare className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 bg-[#0F1E36] text-slate-300 flex flex-col shrink-0 min-h-screen select-none border-r border-slate-800/60">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800/40">
        <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white shadow-sm shadow-teal-500/30">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="3" ry="3"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
            <path d="m9 16 2 2 4-4"></path>
          </svg>
        </div>
        <span className="text-xl font-bold tracking-tight text-white">QuickShift</span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#008080] text-white shadow-sm shadow-teal-900/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Offline Storage Quick Pill */}
      <div className="px-4 py-3 border-t border-slate-800/50">
        <button
          onClick={openLocalStorageModal}
          className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-xs transition"
          title="Open Local Storage & Sync Manager"
        >
          <div className="flex items-center gap-2 text-slate-300">
            <HardDrive className="w-3.5 h-3.5 text-teal-400" />
            <span>Local Storage</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] text-teal-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
            Synced
          </span>
        </button>
      </div>

      {/* Support Section */}
      <div className="p-4 border-t border-slate-800/50">
        <button 
          onClick={() => alert("QuickShift 24/7 Hotel Support Hotline: +1 (800) 555-SHIFT\nOffline Local Documentation & Guides Available.")}
          className="flex items-center gap-3 text-slate-400 hover:text-white text-sm transition px-2 py-1.5 w-full rounded"
        >
          <HelpCircle className="w-5 h-5 text-slate-400" />
          <span>Support</span>
        </button>
      </div>
    </aside>
  );
};
