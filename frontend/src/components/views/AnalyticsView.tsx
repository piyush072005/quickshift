import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  Users, 
  Database,
  ArrowUpRight
} from 'lucide-react';
import { AppState } from '../../types';

interface AnalyticsViewProps {
  appState: AppState;
  onOpenStorageModal: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ appState, onOpenStorageModal }) => {
  const totalShifts = appState.shifts.length;
  const confirmedShifts = appState.shifts.filter((s) => s.status === 'Confirmed').length;
  const vacantShifts = appState.shifts.filter((s) => s.status === 'Vacant').length;
  const completedTasks = appState.tasks.filter((t) => t.status === 'Completed').length;
  const totalTasks = appState.tasks.length;

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Workforce Analytics</h1>
        <p className="text-sm text-slate-500">Real-time productivity, shift fulfillment metrics, and local audit logs.</p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
            <span>Shift Fulfillment Rate</span>
            <span className="text-emerald-600 font-bold">↑ 4.2%</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {Math.round((confirmedShifts / (totalShifts || 1)) * 100)}%
          </div>
          <div className="text-xs text-slate-400 mt-1">{confirmedShifts} of {totalShifts} shifts confirmed</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
            <span>Operational Task Completion</span>
            <span className="text-teal-600 font-bold">On track</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {Math.round((completedTasks / (totalTasks || 1)) * 100)}%
          </div>
          <div className="text-xs text-slate-400 mt-1">{completedTasks} of {totalTasks} tickets completed</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
            <span>Weekly Labor Cost (Est.)</span>
            <span className="text-slate-400">Apr 21–27</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">$34,850</div>
          <div className="text-xs text-slate-400 mt-1">~1,420 scheduled roster hours</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
            <span>Offline Local Database Status</span>
            <span className="text-teal-600 font-bold">100% Synced</span>
          </div>
          <div className="text-2xl font-bold text-teal-800 tabular-nums">IndexedDB</div>
          <div className="text-xs text-slate-400 mt-1">Zero cloud latency required</div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Local Storage Sync & Mutation Log</h2>
            <p className="text-xs text-slate-500">Every offline user action, smart roster computation, and state mutation.</p>
          </div>
          <button
            onClick={onOpenStorageModal}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition"
          >
            Manage Local DB
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] text-slate-400 border-b border-slate-100 font-medium">
              <tr>
                <th className="py-2.5">Timestamp</th>
                <th className="py-2.5">Action</th>
                <th className="py-2.5">Item Type</th>
                <th className="py-2.5">Target ID</th>
                <th className="py-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {appState.syncLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-2.5 font-sans font-medium text-slate-800">{log.action}</td>
                  <td className="py-2.5 text-slate-600">{log.itemType}</td>
                  <td className="py-2.5 text-slate-400">{log.itemId}</td>
                  <td className="py-2.5 text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      Local Stored
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
