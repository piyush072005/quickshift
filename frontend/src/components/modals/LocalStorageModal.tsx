import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  HardDrive,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { AppState } from '../../types';

interface LocalStorageModalProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppState;
  onExport: () => void;
  onImport: (jsonStr: string) => void;
  onReset: () => void;
}

export const LocalStorageModal: React.FC<LocalStorageModalProps> = ({
  isOpen,
  onClose,
  appState,
  onExport,
  onImport,
  onReset,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'status' | 'logs'>('status');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        try {
          onImport(content);
          alert('Local data successfully restored!');
          onClose();
        } catch (err: any) {
          alert('Error importing data: ' + err.message);
        }
      }
    };
    reader.readAsText(file);
  };

  const stateString = JSON.stringify(appState);
  const sizeKb = (new Blob([stateString]).size / 1024).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-teal-500 text-white">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Local Storage & Offline Engine</h2>
              <p className="text-[11px] text-slate-300">IndexedDB + LocalStorage Dual-Store Architecture</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Nav Tabs */}
        <div className="flex border-b border-slate-200 px-6 pt-3 text-xs font-semibold bg-slate-50">
          <button
            onClick={() => setActiveTab('status')}
            className={`pb-2.5 px-3 border-b-2 transition ${
              activeTab === 'status'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Database Status & Backup
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-2.5 px-3 border-b-2 transition ${
              activeTab === 'logs'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Local Audit Log ({appState.syncLogs.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {activeTab === 'status' ? (
            <>
              {/* Local Storage Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-lg font-bold text-slate-900 tabular-nums">{appState.shifts.length}</div>
                  <div className="text-[11px] text-slate-500">Shifts Stored</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-lg font-bold text-slate-900 tabular-nums">{appState.tasks.length}</div>
                  <div className="text-[11px] text-slate-500">Tasks Stored</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-lg font-bold text-slate-900 tabular-nums">{appState.talentPool.length}</div>
                  <div className="text-[11px] text-slate-500">Talent Profiles</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-lg font-bold text-teal-700 tabular-nums">{sizeKb} KB</div>
                  <div className="text-[11px] text-slate-500">Local Footprint</div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="text-[11px] leading-relaxed">
                  <strong className="block text-emerald-950 font-bold">100% Offline Capable</strong>
                  All rosters, checklist updates, and candidate offers are immediately written to your browser's persistent database. No remote network connectivity required.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <div className="font-bold text-slate-800">Database Tools</div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={onExport}
                    className="p-3 rounded-xl border border-slate-200 hover:border-teal-600 hover:bg-teal-50/50 flex items-center gap-3 text-left transition"
                  >
                    <Download className="w-4 h-4 text-teal-600 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-800">Export Backup</div>
                      <div className="text-[11px] text-slate-400">Download complete state JSON</div>
                    </div>
                  </button>

                  <label className="p-3 rounded-xl border border-slate-200 hover:border-teal-600 hover:bg-teal-50/50 flex items-center gap-3 text-left transition cursor-pointer">
                    <Upload className="w-4 h-4 text-teal-600 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-800">Restore Backup</div>
                      <div className="text-[11px] text-slate-400">Load state from JSON file</div>
                    </div>
                    <input type="file" accept=".json" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (confirm('Reset all shifts, tasks and candidates to the initial screenshot defaults?')) {
                        onReset();
                        onClose();
                      }
                    }}
                    className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-semibold transition text-center flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset to Default Hotel Dataset</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <div className="text-slate-500 text-[11px]">Recent local state mutations:</div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {appState.syncLogs.map((log) => (
                  <div key={log.id} className="py-2 flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-slate-800">{log.action}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {log.itemType} · ID: {log.itemId}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
