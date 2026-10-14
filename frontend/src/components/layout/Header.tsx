import React, { useState } from 'react';
import { API_BASE_URL } from '../../lib/api';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenSearch: () => void;
  onTriggerToast: (msg: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onOpenSearch,
  onTriggerToast,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [managerName, setManagerName] = useState('Alex Carter');
  const [managerRole, setManagerRole] = useState('General Manager');

  const notifications = [
    { id: 1, title: 'Shift Shortage Alert', desc: 'North Wing Banquet requires +4 housekeeping staff for Apr 30.', time: '10 min ago', unread: true },
    { id: 2, title: 'Freelancer Accepted', desc: 'Amit Sharma confirmed housekeeping shift for Saturday Apr 26.', time: '28 min ago', unread: true },
    { id: 3, title: 'Smart Roster Optimized', desc: 'AI auto-scheduled 58 of 63 weekly rotation shifts with 96.4% efficiency.', time: '1 hr ago', unread: false },
  ];

  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 z-40 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-xs">
      {/* Left: Mobile hamburger & Global Search bar */}
      <div className="flex items-center gap-3 w-full max-w-md">
        <button 
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        {/* Global Search input pill */}
        <div 
          onClick={onOpenSearch}
          className="flex items-center w-full px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-600 gap-2.5 cursor-pointer transition-all border border-transparent hover:border-slate-300"
        >
          <span className="material-symbols-outlined text-[18px] text-slate-400">search</span>
          <span className="text-xs flex-1 text-slate-400 select-none truncate">
            Search employee, shift, role, or talent...
          </span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-500 text-[10px] font-semibold uppercase shadow-2xs">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Cluster: Occupancy, Notifications, Messages, User Profile */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Occupancy pill */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-slate-700">
          <span className="material-symbols-outlined text-[16px] text-teal-600">hotel</span>
          <span className="text-xs font-semibold text-slate-800">North Wing • 94% Occupancy</span>
        </div>

        {/* Notifications Button & Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors relative"
            aria-label="View notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Notifications</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-700">2 New</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => onTriggerToast(`Viewed: ${n.title}`)}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">{n.desc}</p>
                  </div>
                ))}
              </div>
              <div className="px-3 pt-2 border-t border-slate-100 text-center">
                <button 
                  onClick={() => { setShowNotifications(false); onTriggerToast('All alerts marked as read.'); }}
                  className="text-xs font-semibold text-teal-700 hover:underline py-1"
                >
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Chat / Messages Button */}
        <button 
          onClick={() => onTriggerToast('Shift Team Chat: 4 unread messages in Operations channel.')}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          aria-label="Messages"
        >
          <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
        </button>

        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

        {/* User Profile Pill */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 pl-1.5 pr-2 py-1 rounded-full border border-slate-200/90 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-xs ring-1 ring-teal-700/20 shadow-2xs">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-slate-900 leading-tight">{managerName}</div>
              <div className="text-[10px] text-slate-500 leading-tight">{managerRole}</div>
            </div>
            <span className="material-symbols-outlined text-[16px] text-slate-400">arrow_drop_down</span>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-900">{managerName}</div>
                <div className="text-[11px] text-slate-500">Sunrise Grand Hotel, Goa</div>
              </div>
              <button 
                onClick={() => {
                  setManagerName(managerName === 'Alex Carter' ? 'Rohan Mehta' : 'Alex Carter');
                  setManagerRole(managerRole === 'General Manager' ? 'Hotel Manager' : 'General Manager');
                  setShowProfileMenu(false);
                  onTriggerToast(`Switched active profile to ${managerName === 'Alex Carter' ? 'Rohan Mehta' : 'Alex Carter'}`);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px] text-teal-600">switch_account</span>
                <span>Switch Manager Profile</span>
              </button>
              <div className="px-3 py-1.5 text-[10px] text-slate-400 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>API: {API_BASE_URL}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
