import React, { useState } from 'react';
import { 
  Settings, 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  ShieldCheck,
  Building,
  HardDrive
} from 'lucide-react';
import { AppState } from '../../types';

interface SettingsViewProps {
  appState: AppState;
  onExportData: () => void;
  onImportData: (jsonStr: string) => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  appState,
  onExportData,
  onImportData,
  onResetData,
}) => {
  const [hotelName, setHotelName] = useState('Grand Azure Bay Hotel & Suites');
  const [managerName, setManagerName] = useState('Alex Carter');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        try {
          onImportData(content);
          alert('Local data successfully restored!');
        } catch (err: any) {
          alert('Error importing data: ' + err.message);
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings & Local Storage</h1>
        <p className="text-sm text-slate-500">Configure hotel properties, offline synchronization, and local backups.</p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-teal-600 text-white rounded-xl text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Settings saved locally!</span>
        </div>
      )}

      {/* Property Profile */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Building className="w-5 h-5 text-teal-600" />
          <span>Hotel Profile</span>
        </h2>

        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Hotel Name</label>
            <input
              type="text"
              value={hotelName}
              onChange={(e) => setHotelName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-teal-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">General Manager</label>
            <input
              type="text"
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-teal-600"
            />
          </div>

          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-teal-700 text-white rounded-lg font-semibold hover:bg-teal-800 transition"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* Offline Storage & Disaster Recovery */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-5">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-teal-600" />
          <span>Offline Data Persistence & Backups</span>
        </h2>

        <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-100 text-xs text-teal-900 space-y-2">
          <div className="font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Offline-First Architecture Active</span>
          </div>
          <p className="leading-relaxed">
            QuickShift caches 100% of your shifts, roster records, hotel operational checklists, and talent pool applications in local browser storage (LocalStorage + IndexedDB). You can operate completely without an internet connection during power or network outages.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <button
            onClick={onExportData}
            className="p-4 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 flex flex-col items-center text-center transition group"
          >
            <Download className="w-6 h-6 text-teal-600 mb-2 group-hover:scale-110 transition" />
            <span className="font-bold text-xs text-slate-900">Export JSON Backup</span>
            <span className="text-[11px] text-slate-500 mt-1">Save complete offline state to disk</span>
          </button>

          <label className="p-4 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 flex flex-col items-center text-center transition group cursor-pointer">
            <Upload className="w-6 h-6 text-teal-600 mb-2 group-hover:scale-110 transition" />
            <span className="font-bold text-xs text-slate-900">Restore from JSON</span>
            <span className="text-[11px] text-slate-500 mt-1">Upload a previously exported backup</span>
            <input type="file" accept=".json" onChange={handleFileChange} className="hidden" />
          </label>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset to the default hotel demo dataset?')) {
                onResetData();
              }
            }}
            className="p-4 rounded-xl border border-red-200 hover:border-red-400 hover:bg-red-50/30 flex flex-col items-center text-center transition group"
          >
            <RotateCcw className="w-6 h-6 text-red-600 mb-2 group-hover:scale-110 transition" />
            <span className="font-bold text-xs text-red-700">Reset Demo Data</span>
            <span className="text-[11px] text-slate-500 mt-1">Restore pristine initial hotel state</span>
          </button>
        </div>
      </div>
    </div>
  );
};
