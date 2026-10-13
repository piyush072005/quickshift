import React from 'react';
import { NavigationTab } from '../../types';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  syncTime?: string;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  syncTime = '10:24 AM',
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'overview' as NavigationTab,
      label: 'Overview',
      icon: 'dashboard',
      badge: null,
    },
    {
      id: 'ai-forecast' as NavigationTab,
      label: 'AI Forecast',
      icon: 'insights',
      badge: { text: 'AI', bg: 'bg-indigo-600/80 text-white' },
    },
    {
      id: 'staff-roster' as NavigationTab,
      label: 'Staff Roster',
      icon: 'calendar_view_week',
      badge: { text: 'Live', bg: 'bg-teal-500 text-slate-950 font-bold' },
    },
    {
      id: 'talent-pool' as NavigationTab,
      label: 'Talent Pool',
      icon: 'group_add',
      badge: { text: '5 New', bg: 'bg-emerald-500/20 text-emerald-300 font-semibold' },
    },
    {
      id: 'whatsapp-simulator' as NavigationTab,
      label: 'WhatsApp Sim',
      icon: 'chat',
      badge: { text: 'Live Sim', bg: 'bg-emerald-500/20 text-emerald-300 font-bold' },
    },
    {
      id: 'analytics' as NavigationTab,
      label: 'Analytics',
      icon: 'trending_up',
      badge: null,
    },
    {
      id: 'settings' as NavigationTab,
      label: 'Settings',
      icon: 'settings',
      badge: null,
    },
  ];

  const handleNavClick = (tabId: NavigationTab) => {
    onSelectTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`
        fixed left-0 top-0 h-full w-64 lg:w-72 bg-[#0b1329] text-slate-200 z-50 flex flex-col justify-between shadow-2xl transition-transform duration-300
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col">
          {/* Logo & Brand Header */}
          <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 ring-1 ring-teal-400/30">
                <span className="material-symbols-outlined text-[24px]">auto_awesome_motion</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold tracking-tight text-white leading-none">QuickShift</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">AI</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">Hotel Workforce AI</span>
              </div>
            </div>

            {/* Close button on mobile */}
            <button 
              onClick={onCloseMobile}
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              aria-label="Close menu"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>

          {/* Section Header */}
          <div className="px-6 pt-5 pb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Operations Hub
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 px-3 mt-2">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all text-sm font-medium
                    ${isActive 
                      ? 'bg-teal-600 text-white font-semibold shadow-md shadow-teal-900/40' 
                      : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${item.badge.bg}`}>
                      {item.badge.text}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Property & Sync Indicator */}
        <div className="p-4 flex flex-col gap-3 border-t border-slate-800/60">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white truncate">Sunrise Grand Hotel</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Goa, India</span>
              <span className="text-emerald-400 font-medium">Sync {syncTime}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1 mt-1">
              <div className="bg-teal-500 h-1 rounded-full w-[82%]"></div>
            </div>
          </div>

          <button 
            onClick={() => onSelectTab('settings')}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all text-xs font-medium text-left"
          >
            <span className="material-symbols-outlined text-[18px]">headset_mic</span>
            <span>Enterprise Support Desk</span>
          </button>
        </div>
      </aside>
    </>
  );
};
