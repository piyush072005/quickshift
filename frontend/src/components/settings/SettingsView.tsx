import React, { useState } from 'react';
import { API_BASE_URL } from '../../lib/api';

interface SettingsViewProps {
  onTriggerToast: (msg: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onTriggerToast }) => {
  // Hotel state
  const [hotelName, setHotelName] = useState('Grand Vista Hotel (Sunrise Grand)');
  const [hotelAddress, setHotelAddress] = useState('123 Hospitality Lane, Mumbai, MH 400001');
  const [timezone, setTimezone] = useState('Asia/Kolkata (GMT+5:30)');
  const [currency, setCurrency] = useState('INR (₹)');

  // Workforce state
  const [shiftLength, setShiftLength] = useState('8 hours');
  const [restPeriod, setRestPeriod] = useState('12 hours');
  const [maxWeekly, setMaxWeekly] = useState(48);
  const [overtimeThreshold, setOvertimeThreshold] = useState(40);
  const [allowSplitShifts, setAllowSplitShifts] = useState(true);
  const [autoAssign, setAutoAssign] = useState(true);
  const [notifyShortage, setNotifyShortage] = useState(true);

  // Notification toggles
  const [notifConfirm, setNotifConfirm] = useState(true);
  const [notifShortage, setNotifShortage] = useState(true);
  const [notifOffers, setNotifOffers] = useState(true);
  const [notifConflicts, setNotifConflicts] = useState(true);
  const [notifUpdates, setNotifUpdates] = useState(true);

  // Skills
  const [skills, setSkills] = useState([
    'Food Safety',
    'Customer Service',
    'Cleaning',
    'Cooking',
    'Teamwork',
    'Basic English',
  ]);
  const [newSkillText, setNewSkillText] = useState('');
  const [showAddSkillInput, setShowAddSkillInput] = useState(false);

  // System
  const [defaultView, setDefaultView] = useState('Overview');
  const [language, setLanguage] = useState('English');
  const [dateFormat, setDateFormat] = useState('MMM dd, yyyy (Apr 26, 2025)');

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState('Apr 26, 2025 • 10:42 AM');

  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSynced('Just now');
      onTriggerToast('Data synced with biometric punches and booking engine!');
    }, 800);
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
    onTriggerToast(`Removed ${skill} from matched competencies`);
  };

  const handleAddSkill = () => {
    if (newSkillText.trim() && !skills.includes(newSkillText.trim())) {
      setSkills([...skills, newSkillText.trim()]);
      onTriggerToast(`Added new competency: ${newSkillText.trim()}`);
      setNewSkillText('');
      setShowAddSkillInput(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Manage your hotel, team and system preferences.</p>
      </div>

      {/* 3-Column Layout Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* CARD 1: Hotel Information */}
        <section className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start gap-3.5 mb-5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">apartment</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 leading-tight">Hotel Information</h2>
                <p className="text-xs text-slate-500 mt-0.5">Update your hotel details and preferences.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Hotel Name</label>
                <input
                  type="text"
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 bg-slate-50/70 py-2 px-3 text-slate-800 focus:bg-white focus:border-teal-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Address</label>
                <input
                  type="text"
                  value={hotelAddress}
                  onChange={(e) => setHotelAddress(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 bg-slate-50/70 py-2 px-3 text-slate-800 focus:bg-white focus:border-teal-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-200 bg-slate-50/70 py-2 px-2 text-slate-800 focus:bg-white outline-none cursor-pointer"
                  >
                    <option>Asia/Kolkata (GMT+5:30)</option>
                    <option>UTC (GMT+0:00)</option>
                    <option>America/New_York (GMT-5:00)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-200 bg-slate-50/70 py-2 px-2 text-slate-800 focus:bg-white outline-none cursor-pointer"
                  >
                    <option>INR (₹)</option>
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-2">
            <button
              onClick={() => onTriggerToast('Hotel details saved successfully.')}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            >
              Save Changes
            </button>
          </div>
        </section>

        {/* CARD 2: Workforce Settings */}
        <section className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start gap-3.5 mb-5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">badge</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 leading-tight">Workforce Settings</h2>
                <p className="text-xs text-slate-500 mt-0.5">Configure workforce rules and preferences.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Default Shift Length</label>
                  <select
                    value={shiftLength}
                    onChange={(e) => setShiftLength(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-200 bg-slate-50/70 py-2 px-2 text-slate-800 focus:bg-white outline-none cursor-pointer"
                  >
                    <option>8 hours</option>
                    <option>6 hours</option>
                    <option>10 hours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Minimum Rest Period</label>
                  <select
                    value={restPeriod}
                    onChange={(e) => setRestPeriod(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-200 bg-slate-50/70 py-2 px-2 text-slate-800 focus:bg-white outline-none cursor-pointer"
                  >
                    <option>12 hours</option>
                    <option>10 hours</option>
                    <option>14 hours</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Max Weekly Hours</label>
                  <input
                    type="number"
                    value={maxWeekly}
                    onChange={(e) => setMaxWeekly(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-slate-200 bg-slate-50/70 py-2 px-3 text-slate-800 focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Overtime Threshold</label>
                  <input
                    type="number"
                    value={overtimeThreshold}
                    onChange={(e) => setOvertimeThreshold(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-slate-200 bg-slate-50/70 py-2 px-3 text-slate-800 focus:bg-white outline-none"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-1">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allowSplitShifts}
                    onChange={() => setAllowSplitShifts(!allowSplitShifts)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 accent-teal-600"
                  />
                  <span className="text-xs text-slate-700 font-medium">Allow Split Shifts</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoAssign}
                    onChange={() => setAutoAssign(!autoAssign)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 accent-teal-600"
                  />
                  <span className="text-xs text-slate-700 font-medium">Enable Auto-Assignment</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={notifyShortage}
                    onChange={() => setNotifyShortage(!notifyShortage)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 accent-teal-600"
                  />
                  <span className="text-xs text-slate-700 font-medium">Notify on Staffing Shortage</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-2">
            <button
              onClick={() => onTriggerToast('Workforce rules updated.')}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            >
              Save Changes
            </button>
          </div>
        </section>

        {/* CARD 3: Notifications */}
        <section className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start gap-3.5 mb-5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">notifications_active</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 leading-tight">Notifications</h2>
                <p className="text-xs text-slate-500 mt-0.5">Choose what you want to be notified about.</p>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              {[
                { label: 'New shift confirmations', state: notifConfirm, setter: setNotifConfirm },
                { label: 'Staffing shortages', state: notifShortage, setter: setNotifShortage },
                { label: 'Temporary worker offers', state: notifOffers, setter: setNotifOffers },
                { label: 'Shift conflicts', state: notifConflicts, setter: setNotifConflicts },
                { label: 'System updates', state: notifUpdates, setter: setNotifUpdates },
              ].map((n, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                    <span className="text-xs text-slate-700 font-medium">{n.label}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={n.state}
                    onChange={() => n.setter(!n.state)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 accent-teal-600 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-2">
            <button
              onClick={() => onTriggerToast('Notification preferences saved.')}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            >
              Save Changes
            </button>
          </div>
        </section>

        {/* CARD 4: Departments & Roles */}
        <section className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start gap-3.5 mb-5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">lan</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 leading-tight">Departments & Roles</h2>
                <p className="text-xs text-slate-500 mt-0.5">Manage departments, roles and skills used for matching.</p>
              </div>
            </div>

            <div className="space-y-3.5">
              {[
                { name: 'Housekeeping', dot: 'bg-teal-600', roles: 'Housekeeper, Room Attendant, Cleaner' },
                { name: 'Front Desk', dot: 'bg-sky-500', roles: 'Receptionist, Guest Service, Bell Attendant' },
                { name: 'Restaurant', dot: 'bg-emerald-500', roles: 'Server, Host, Bartender' },
                { name: 'Kitchen', dot: 'bg-indigo-600', roles: 'Cook, Chef, Dishwasher' },
              ].map((dept, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-start gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${dept.dot} mt-1 shrink-0`}></span>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 leading-tight">{dept.name}</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Roles: {dept.roles}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onTriggerToast(`Editing roles for ${dept.name} department`)}
                    className="text-xs px-2.5 py-1 rounded border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-2">
            <button
              onClick={() => onTriggerToast('Add Department dialog: Enter department name and headcount budget')}
              className="w-fit px-3 py-1.5 rounded-lg border border-teal-600/40 text-teal-700 hover:bg-teal-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span className="text-sm leading-none">+</span> Add Department
            </button>
          </div>
        </section>

        {/* CARD 5: Skills & Certifications */}
        <section className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start gap-3.5 mb-5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">verified</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 leading-tight">Skills & Certifications</h2>
                <p className="text-xs text-slate-500 mt-0.5">Add skills and certifications for better matching.</p>
              </div>
            </div>

            <div className="space-y-2">
              {skills.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-1.5 bg-slate-50 hover:bg-slate-100/80 rounded-lg border border-slate-200/80 text-xs text-slate-700"
                >
                  <span className="font-medium">{s}</span>
                  <button
                    onClick={() => handleRemoveSkill(s)}
                    className="text-slate-400 hover:text-slate-700 text-sm leading-none font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}

              {showAddSkillInput && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newSkillText}
                    onChange={(e) => setNewSkillText(e.target.value)}
                    placeholder="Enter skill name..."
                    className="flex-1 text-xs border border-slate-200 rounded-lg px-2.5 py-1 outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                  />
                  <button
                    onClick={handleAddSkill}
                    className="px-2.5 py-1 bg-teal-700 text-white text-xs font-bold rounded-lg"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-2">
            <button
              onClick={() => setShowAddSkillInput(true)}
              className="w-fit px-3 py-1.5 rounded-lg border border-teal-600/40 text-teal-700 hover:bg-teal-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span className="text-sm leading-none">+</span> Add Skill
            </button>
          </div>
        </section>

        {/* CARD 6: System Preferences */}
        <section className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start gap-3.5 mb-5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">tune</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 leading-tight">System Preferences</h2>
                <p className="text-xs text-slate-500 mt-0.5">Customize your application experience.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Default View</label>
                <select
                  value={defaultView}
                  onChange={(e) => setDefaultView(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 bg-slate-50/70 py-2 px-3 text-slate-800 focus:bg-white outline-none cursor-pointer"
                >
                  <option>Overview</option>
                  <option>Staff Roster</option>
                  <option>Talent Pool</option>
                  <option>AI Forecast</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 bg-slate-50/70 py-2 px-3 text-slate-800 focus:bg-white outline-none cursor-pointer"
                >
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Spanish</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date Format</label>
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 bg-slate-50/70 py-2 px-3 text-slate-800 focus:bg-white outline-none cursor-pointer"
                >
                  <option>MMM dd, yyyy (Apr 26, 2025)</option>
                  <option>DD/MM/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-2">
            <button
              onClick={() => onTriggerToast('System preferences saved.')}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            >
              Save Changes
            </button>
          </div>
        </section>

        {/* CARD 7: API & Integrations (Full Width) */}
        <section className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 col-span-1 md:col-span-2 lg:col-span-3">
          <div className="flex items-start gap-3.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">cloud_sync</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">API & Integrations</h2>
              <p className="text-xs text-slate-500 mt-0.5">Connect with your backend services and external tools.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1: Backend API */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 mb-2">Backend API Service</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-semibold text-emerald-700">Connected & Synced</span>
              </div>
              <input
                type="text"
                readOnly
                value={API_BASE_URL}
                className="w-full text-xs rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-slate-700 font-mono outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1.5">
                Local WebSocket endpoint for biometric shift attendance logs.
              </p>
            </div>

            {/* Column 2: Third-party Integrations */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 mb-2">Third-party Integrations</h3>
              <div className="space-y-2">
                <div
                  onClick={() => onTriggerToast('Google Calendar sync connected!')}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px] text-slate-500">calendar_month</span>
                    <span className="text-xs font-medium text-slate-800">Calendar (Google Calendar)</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Connect →</span>
                </div>

                <div
                  onClick={() => onTriggerToast('HR System (Workday / ADP) connected!')}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px] text-slate-500">groups</span>
                    <span className="text-xs font-medium text-slate-800">HR System (Workday)</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Connect →</span>
                </div>

                <div
                  onClick={() => onTriggerToast('Payroll System (Razorpay / Gusto) connected!')}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px] text-slate-500">payments</span>
                    <span className="text-xs font-medium text-slate-800">Payroll System</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Connect →</span>
                </div>
              </div>
            </div>

            {/* Column 3: Data Sync */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 mb-2">Data Sync</h3>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center">
                    <span className={`material-symbols-outlined text-[18px] ${isSyncing ? 'animate-spin' : ''}`}>
                      sync
                    </span>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Last Synced</div>
                    <div className="text-xs font-bold text-slate-900">{lastSynced}</div>
                  </div>
                </div>
                <button
                  onClick={handleSyncNow}
                  className="text-xs px-3 py-1.5 border border-teal-600/40 text-teal-700 rounded-lg font-semibold hover:bg-teal-50 flex items-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">sync</span>
                  Sync Now
                </button>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-emerald-600">verified</span>
                <span className="text-xs font-semibold text-emerald-900">System is up to date</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
