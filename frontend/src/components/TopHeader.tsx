import React, { useState } from 'react';
import { 
  Bell, 
  Mail, 
  ChevronDown, 
  Wifi, 
  WifiOff, 
  Database,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { NavTab } from './Sidebar';
import { AppState } from '../types';

interface TopHeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  appState: AppState;
  isSimulatedOffline: boolean;
  onToggleSimulatedOffline: () => void;
  onOpenStorageModal: () => void;
  onOpenNewTaskModal: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentTab,
  onSelectTab,
  appState,
  isSimulatedOffline,
  onToggleSimulatedOffline,
  onOpenStorageModal,
  onOpenNewTaskModal
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  // Real or simulated connectivity
  const isOnline = !isSimulatedOffline && (typeof navigator !== 'undefined' ? navigator.onLine : true);

  const pendingOffersCount = appState.talentPool.filter((c) => c.status === 'Offer Sent').length;
  const vacantShiftsCount = appState.shifts.filter((s) => s.status === 'Vacant').length;

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Tab Navigation Pill Strip */}
      <div className="flex items-center gap-1 sm:gap-2">
        {[
          { id: 'overview' as NavTab, label: 'Overview' },
          { id: 'forecast' as NavTab, label: 'AI Forecast' },
          { id: 'schedule' as NavTab, label: 'Staff Roster' },
          { id: 'talent' as NavTab, label: 'Talent Pool' },
          { id: 'tasks' as NavTab, label: 'Task Operations' },
          { id: 'analytics' as NavTab, label: 'Analytics' },
        ].map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-teal-50 text-teal-800 font-semibold border-b-2 border-teal-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Right Action Icons & Profile */}
      <div className="flex items-center gap-3">
        {/* New Task / Shift Quick Button */}
        <button
          onClick={onOpenNewTaskModal}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 shadow-xs transition"
        >
          <span>+ Schedule Shift/Task</span>
        </button>

        {/* Offline / Online Connectivity Pill & Simulator */}
        <button
          onClick={onToggleSimulatedOffline}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition ${
            isOnline
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200 font-semibold shadow-xs'
          }`}
          title="Click to toggle offline simulation mode to test local data storage & zero network latency"
        >
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span>Online Mode</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>Offline Ready (Local)</span>
            </>
          )}
        </button>

        {/* Local Storage & Backup Button */}
        <button
          onClick={onOpenStorageModal}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition"
          title="Manage local data storage, JSON export/import & sync"
        >
          <Database className="w-3.5 h-3.5 text-teal-600" />
          <span className="hidden lg:inline">Local Storage</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowMessages(false);
            }}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition relative"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {vacantShiftsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in duration-150">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-900">Shift & Task Alerts</span>
                <span className="text-xs text-teal-600 font-medium">Local Storage Active</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                <div className="p-3 text-xs hover:bg-slate-50 transition">
                  <div className="flex items-start gap-2">
                    <span className="p-1 rounded bg-amber-100 text-amber-700 mt-0.5">⚠️</span>
                    <div>
                      <p className="font-medium text-slate-800">Vacant Shift Alert</p>
                      <p className="text-slate-500">2 Kitchen workers needed for Apr 26 (12:00 - 20:00).</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">15 mins ago · Stored offline</span>
                    </div>
                  </div>
                </div>
                <div className="p-3 text-xs hover:bg-slate-50 transition">
                  <div className="flex items-start gap-2">
                    <span className="p-1 rounded bg-emerald-100 text-emerald-700 mt-0.5">✓</span>
                    <div>
                      <p className="font-medium text-slate-800">Smart Roster Ready</p>
                      <p className="text-slate-500">Peak demand forecast model computed for Apr 25.</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">1 hour ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mail / Messaging Icon */}
        <div className="relative">
          <button
            onClick={() => {
              setShowMessages(!showMessages);
              setShowNotifications(false);
            }}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition relative"
            aria-label="View messages and talent offers"
          >
            <Mail className="w-5 h-5" />
            {pendingOffersCount > 0 && (
              <span className="absolute top-1 right-1 px-1 min-w-4 h-4 bg-teal-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {pendingOffersCount}
              </span>
            )}
          </button>

          {showMessages && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-3 z-50">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-900">Talent Communications</span>
                <span className="text-xs text-slate-400">{pendingOffersCount} pending</span>
              </div>
              <div className="p-3 text-xs space-y-2">
                <div className="p-2 rounded-lg bg-teal-50/70 border border-teal-100">
                  <p className="font-medium text-teal-900">Priya Sharma (Restaurant)</p>
                  <p className="text-teal-700 text-[11px]">Offer pending: 12:00 - 20:00 Shift</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="font-medium text-slate-800">Ananya Patel (Housekeeping)</p>
                  <p className="text-slate-600 text-[11px]">Turnover shift offer dispatched</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
            alt="Alex Carter"
            className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-2xs"
          />
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-900 leading-tight">Alex Carter</div>
            <div className="text-[11px] text-slate-500 leading-tight">Hotel Manager</div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
        </div>
      </div>
    </header>
  );
};
