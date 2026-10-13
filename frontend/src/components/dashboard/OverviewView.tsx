import React, { useState } from 'react';
import { NavigationTab } from '../../types';
import { TALENT_CANDIDATES, FORECAST_OVERVIEW_DAYS } from '../../data/mockData';

interface OverviewViewProps {
  onNavigateTab: (tab: NavigationTab) => void;
  onOpenSmartRoster: () => void;
  onTriggerToast: (msg: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onNavigateTab,
  onOpenSmartRoster,
  onTriggerToast,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [occupancyInput, setOccupancyInput] = useState('78%');
  const [guestCountInput, setGuestCountInput] = useState('1,240');
  const [forecastPeriod, setForecastPeriod] = useState('7days');
  const [forecastDept, setForecastDept] = useState('all');
  const [searchTalent, setSearchTalent] = useState('');
  const [offeredWorkers, setOfferedWorkers] = useState<string[]>([]);

  const handleSendOffer = (candidateName: string) => {
    if (!offeredWorkers.includes(candidateName)) {
      setOfferedWorkers([...offeredWorkers, candidateName]);
    }
    onTriggerToast(`Instant shift assignment offer dispatched to ${candidateName}!`);
  };

  const handleAutoFillGaps = () => {
    onTriggerToast('Auto-matching top verified candidates to active department gaps...');
    setTimeout(() => {
      onTriggerToast('22 temporary slots filled! Roster coverage increased to 94.6%.');
    }, 1200);
  };

  const handleUpdateSimulator = () => {
    onTriggerToast(`Simulator updated: Occupancy set to ${occupancyInput}, expected guests: ${guestCountInput}.`);
  };

  // Top candidates matching table
  const candidatesList = TALENT_CANDIDATES.slice(0, 5).filter(c =>
    searchTalent === '' || 
    c.name.toLowerCase().includes(searchTalent.toLowerCase()) ||
    c.role.toLowerCase().includes(searchTalent.toLowerCase()) ||
    c.department.toLowerCase().includes(searchTalent.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full pb-12">
      {/* Top Welcome Hero Banner */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome Back, Alex
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-100/80 text-teal-800 text-xs font-semibold flex items-center gap-1.5 border border-teal-200">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-ping"></span>
              Live Ops Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Sunrise Grand Hotel, Goa • Workforce allocation, demand shifts, and coverage forecast at a glance.
          </p>
        </div>

        {/* Right Stats & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Mini Occupancy & Inflow Pill */}
          <div className="flex items-center gap-4 px-4 py-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">bed</span>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Occupancy Rate</div>
                <div className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1">
                  78% <span className="text-[10px] font-bold text-emerald-600">↑ 6%</span>
                </div>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200"></div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">luggage</span>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Guest Inflow (7D)</div>
                <div className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1">
                  1,240 <span className="text-[10px] font-bold text-emerald-600">↑ 12%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSmartRoster}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm hover:shadow transition-all flex items-center gap-2 group active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[18px] group-hover:rotate-12 transition-transform">
                auto_awesome
              </span>
              <span>Generate Smart Roster</span>
            </button>
            <button
              onClick={() => onNavigateTab('talent-pool')}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-teal-800 border border-slate-200/90 text-xs font-semibold shadow-2xs transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px] text-teal-600">person_search</span>
              <span>Find Temporary Staff</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Top Metric KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Card 1: Total Employees */}
        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Employees</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700">
              <span className="material-symbols-outlined text-[20px]">groups</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2.5 mb-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">142</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200">
              ↑ 5% vs last week
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 text-xs text-slate-500 border-t border-slate-100">
            <span>114 on active duty</span>
            <span>•</span>
            <span>28 scheduled off</span>
          </div>
        </div>

        {/* Card 2: Available Today */}
        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Available Today</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <span className="material-symbols-outlined text-[20px]">event_available</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2.5 mb-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">37</span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-xs border border-indigo-200">
              ↑ 12% vs last week
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 text-xs text-slate-500 border-t border-slate-100">
            <span>26% reserve capacity</span>
            <span className="text-indigo-600 font-semibold">14 on stand-by ready</span>
          </div>
        </div>

        {/* Card 3: Open Shift Gaps */}
        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Open Positions / Gaps</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">warning</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2.5 mb-2">
            <span className="text-3xl font-extrabold text-rose-600 tracking-tight">8</span>
            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold text-xs border border-rose-200">
              ↑ 2 urgent
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 text-xs text-slate-500 border-t border-slate-100">
            <span>5.6% total roster variance</span>
            <span className="text-rose-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span> Action Required
            </span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Circular Gauge (3 cols), AI Demand Chart (5 cols), Today's Shifts (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
        {/* Col 1: Circular Shift Coverage Gauge (3 cols) */}
        <div className="lg:col-span-3 rounded-xl bg-white border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Workforce Coverage</h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                On Track
              </span>
            </div>

            {/* Circular SVG Gauge */}
            <div className="relative flex flex-col items-center justify-center my-4">
              <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  className="text-slate-100"
                  cx="60"
                  cy="60"
                  fill="transparent"
                  r="50"
                  stroke="currentColor"
                  strokeWidth="10"
                />
                {/* 82% of 314.16 is ~257.6 */}
                <circle
                  className="text-teal-600 transition-all duration-1000 ease-out"
                  cx="60"
                  cy="60"
                  fill="transparent"
                  r="50"
                  stroke="currentColor"
                  strokeWidth="10"
                  strokeDasharray="314.159"
                  strokeDashoffset="56.5"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-slate-900 tracking-tight">82%</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Shift Coverage</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <span className="material-symbols-outlined text-teal-600 text-[18px]">verified_user</span>
                <span>Staffed Shifts</span>
              </div>
              <span className="text-xs font-bold text-slate-900">142 / 174</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50/70 border border-rose-100">
              <div className="flex items-center gap-2 text-xs text-rose-800">
                <span className="material-symbols-outlined text-rose-600 text-[18px]">assignment_late</span>
                <span>Remaining Vacancies</span>
              </div>
              <span className="text-xs font-bold text-rose-700">32 slots</span>
            </div>
          </div>
        </div>

        {/* Col 2: AI Staffing Demand Forecast with Peak Callout (5 cols) */}
        <div className="lg:col-span-5 rounded-xl bg-white border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  AI Staffing Demand Forecast
                </h2>
                <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold px-1.5 py-0.2 rounded">
                  Model 4.2
                </span>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-1.5">
                <select
                  value={forecastPeriod}
                  onChange={(e) => setForecastPeriod(e.target.value)}
                  className="text-xs font-semibold bg-slate-50 border-slate-200 rounded-lg py-1 px-2 text-slate-700 focus:ring-1 focus:ring-teal-500"
                >
                  <option value="7days">Next 7 Days</option>
                  <option value="14days">Next 14 Days</option>
                  <option value="month">Full Month</option>
                </select>
                <select
                  value={forecastDept}
                  onChange={(e) => setForecastDept(e.target.value)}
                  className="text-xs font-semibold bg-slate-50 border-slate-200 rounded-lg py-1 px-2 text-slate-700 focus:ring-1 focus:ring-teal-500"
                >
                  <option value="all">All Departments</option>
                  <option value="housekeeping">Housekeeping</option>
                  <option value="reception">Reception</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="kitchen">Kitchen</option>
                </select>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs mb-2 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-teal-700 rounded-full"></span>
                <span className="text-slate-600">Predicted Required Staff</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-sky-400 rounded-full"></span>
                <span className="text-slate-600">Available Employees</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="text-slate-600">Peak Spike</span>
              </div>
            </div>

            {/* Inline SVG Chart */}
            <div className="relative w-full h-52 pt-2">
              {/* Peak Demand Badge Hovering Wed Apr 30 (around 62% horizontal) */}
              <div className="absolute left-[62%] top-0 -translate-x-1/2 bg-amber-500 text-white shadow-md px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 z-10 animate-bounce pointer-events-none">
                <span className="material-symbols-outlined text-[13px]">warning</span>
                <span>Peak Demand: 68</span>
              </div>

              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 170" preserveAspectRatio="none">
                {/* Horizontal guide lines */}
                <line x1="0" x2="500" y1="30" y2="30" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="0" x2="500" y1="75" y2="75" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="0" x2="500" y1="120" y2="120" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="0" x2="500" y1="160" y2="160" stroke="#f1f5f9" strokeWidth="1" />

                {/* Vertical guide for peak day */}
                <line x1="315" x2="315" y1="20" y2="160" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,4" />

                <defs>
                  <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#0d9488" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Area under Required curve */}
                <path
                  d="M 15 130 Q 80 140 100 135 T 180 100 T 260 85 T 315 45 T 390 90 T 485 100 L 485 160 L 15 160 Z"
                  fill="url(#areaGradient)"
                />

                {/* Available curve (Sky Blue) */}
                <path
                  d="M 15 145 Q 80 155 100 150 T 180 125 T 260 110 T 315 75 T 390 115 T 485 125"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Predicted Required curve (Teal) */}
                <path
                  d="M 15 130 Q 80 140 100 135 T 180 100 T 260 85 T 315 45 T 390 90 T 485 100"
                  fill="none"
                  stroke="#0f766e"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Dots along Required curve */}
                <circle cx="15" cy="130" r="3.5" fill="#ffffff" stroke="#0f766e" strokeWidth="2" />
                <circle cx="100" cy="135" r="3.5" fill="#ffffff" stroke="#0f766e" strokeWidth="2" />
                <circle cx="180" cy="100" r="3.5" fill="#ffffff" stroke="#0f766e" strokeWidth="2" />
                <circle cx="260" cy="85" r="3.5" fill="#ffffff" stroke="#0f766e" strokeWidth="2" />
                <circle cx="315" cy="45" r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" className="animate-pulse" />
                <circle cx="390" cy="90" r="3.5" fill="#ffffff" stroke="#0f766e" strokeWidth="2" />
                <circle cx="485" cy="100" r="3.5" fill="#ffffff" stroke="#0f766e" strokeWidth="2" />

                {/* Dots on Available curve */}
                <circle cx="315" cy="75" r="4" fill="#ffffff" stroke="#38bdf8" strokeWidth="2" />
              </svg>
            </div>

            {/* X-Axis Labels */}
            <div className="grid grid-cols-7 text-center pt-2 text-[11px] text-slate-500 border-t border-slate-100">
              {FORECAST_OVERVIEW_DAYS.map((d, i) => (
                <div key={i} className={d.isPeak ? 'text-amber-700 font-bold' : ''}>
                  <span className="block font-semibold">{d.day}</span>
                  <span className="text-[10px] text-slate-400">{d.date.split(' ')[1]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1.5 text-teal-700 font-medium">
              <span className="material-symbols-outlined text-[16px]">lightbulb</span>
              AI Suggestion: Overbook +8 Housekeeping for Apr 30 Banquet
            </span>
            <button
              onClick={() => onNavigateTab('ai-forecast')}
              className="text-teal-700 font-bold hover:underline"
            >
              View Full Curve →
            </button>
          </div>
        </div>

        {/* Col 3: Upcoming Schedule & Today's Shift Status (4 cols) */}
        <div className="lg:col-span-4 rounded-xl bg-white border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Today's Shifts</h2>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 font-bold text-[10px] text-slate-700">
                  Sat, Apr 26
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
                <button 
                  onClick={() => onTriggerToast('Viewing previous week')}
                  className="p-1 hover:bg-slate-100 rounded text-slate-400"
                >
                  ‹
                </button>
                <span>Apr 26 - May 02</span>
                <button 
                  onClick={() => onTriggerToast('Viewing next week')}
                  className="p-1 hover:bg-slate-100 rounded text-slate-400"
                >
                  ›
                </button>
              </div>
            </div>

            {/* Day Selector Strip */}
            <div className="grid grid-cols-7 gap-1 p-1 bg-slate-100 rounded-lg mb-3.5 text-center">
              {[
                { day: 'SAT', num: '26' },
                { day: 'SUN', num: '27' },
                { day: 'MON', num: '28' },
                { day: 'TUE', num: '29' },
                { day: 'WED', num: '30' },
                { day: 'THU', num: '01' },
                { day: 'FRI', num: '02' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`py-1.5 rounded transition-all ${
                    selectedDayIndex === idx
                      ? 'bg-teal-700 text-white font-bold shadow-xs'
                      : 'hover:bg-white text-slate-700'
                  }`}
                >
                  <span className="block text-[9px] uppercase leading-none opacity-80">{item.day}</span>
                  <span className="block text-xs font-bold leading-tight mt-0.5">{item.num}</span>
                </button>
              ))}
            </div>

            {/* Shift Department Status Rows */}
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-7 rounded-full bg-slate-400"></div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Housekeeping</div>
                    <div className="text-[10px] text-slate-500 font-medium">06:00 – 14:00 (Morning)</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="text-right">
                    <span className="font-bold text-slate-900 text-xs">18</span>
                    <span className="text-[10px] text-slate-400">/20</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                    -2 Under
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-7 rounded-full bg-teal-600"></div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Front Desk & Concierge</div>
                    <div className="text-[10px] text-slate-500 font-medium">08:00 – 16:00 (Regular)</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="text-right">
                    <span className="font-bold text-slate-900 text-xs">12</span>
                    <span className="text-[10px] text-slate-400">/12</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                    Optimal
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-7 rounded-full bg-indigo-600"></div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Restaurant Service</div>
                    <div className="text-[10px] text-slate-500 font-medium">11:00 – 19:00 (Lunch/Tea)</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="text-right">
                    <span className="font-bold text-slate-900 text-xs">15</span>
                    <span className="text-[10px] text-slate-400">/18</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                    -3 Under
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-7 rounded-full bg-slate-600"></div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Kitchen Operations</div>
                    <div className="text-[10px] text-slate-500 font-medium">16:00 – 00:00 (Dinner)</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="text-right">
                    <span className="font-bold text-slate-900 text-xs">10</span>
                    <span className="text-[10px] text-slate-400">/12</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                    -2 Under
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('staff-roster')}
            className="w-full mt-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Open Interactive Staff Roster</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Bottom Grid: Department Demand (5 cols) + Smart Temporary Worker Matches (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Department Staffing Demand Breakdown */}
        <div className="lg:col-span-5 rounded-xl bg-white border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Department Staffing Demand
                </h2>
                <p className="text-[11px] text-slate-400">Current weekly staffing deficits by operational area</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-teal-700"></span> Active
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-200"></span> Target
                </span>
              </div>
            </div>

            <div className="space-y-3.5 my-3">
              {/* Housekeeping */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-1">
                  <span className="text-slate-800 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-teal-700">cleaning_services</span>
                    Housekeeping
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-600 text-[11px]">42 / 48 Needed</span>
                    <span className="px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">
                      -6 Short
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
                  <div className="bg-teal-700 h-2.5 rounded-full" style={{ width: '87.5%' }}></div>
                </div>
              </div>

              {/* Reception */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-1">
                  <span className="text-slate-800 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-sky-700">desk</span>
                    Reception & Front Desk
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-600 text-[11px]">32 / 36 Needed</span>
                    <span className="px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">
                      -4 Short
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
                  <div className="bg-sky-600 h-2.5 rounded-full" style={{ width: '88.8%' }}></div>
                </div>
              </div>

              {/* Restaurant */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-1">
                  <span className="text-slate-800 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-emerald-700">restaurant</span>
                    Restaurant & Bar Service
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-600 text-[11px]">38 / 44 Needed</span>
                    <span className="px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">
                      -6 Short
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
                  <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: '86.3%' }}></div>
                </div>
              </div>

              {/* Kitchen */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-1">
                  <span className="text-slate-800 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-indigo-700">skillet</span>
                    Kitchen & Culinary
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-600 text-[11px]">40 / 46 Needed</span>
                    <span className="px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">
                      -6 Short
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
                  <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '86.9%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Adjustment Simulator Strip */}
          <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-teal-600">tune</span>
                Quick Simulator: Need 22 temporary fills to hit target?
              </span>
              <button
                onClick={handleAutoFillGaps}
                className="px-2.5 py-1 rounded-md bg-teal-700 hover:bg-teal-800 text-white font-bold text-[10px] transition-colors"
              >
                Auto-Fill Gaps
              </button>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
              <input
                type="text"
                value={occupancyInput}
                onChange={(e) => setOccupancyInput(e.target.value)}
                placeholder="Occupancy"
                className="w-1/3 text-xs font-bold py-1 px-2 border-slate-200 rounded-md bg-white text-center border"
              />
              <input
                type="text"
                value={guestCountInput}
                onChange={(e) => setGuestCountInput(e.target.value)}
                placeholder="Guest Count"
                className="w-1/3 text-xs font-bold py-1 px-2 border-slate-200 rounded-md bg-white text-center border"
              />
              <button
                onClick={handleUpdateSimulator}
                className="w-1/3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-md transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        </div>

        {/* Right: Smart Temporary Worker Matches Table */}
        <div className="lg:col-span-7 rounded-xl bg-white border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Smart Temporary Worker Matches
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold">
                    AI Ranked
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Pre-vetted candidates tailored for upcoming high-demand days</p>
              </div>

              {/* Quick Search */}
              <div className="relative">
                <span className="material-symbols-outlined text-[16px] text-slate-400 absolute left-2.5 top-2">
                  search
                </span>
                <input
                  type="text"
                  value={searchTalent}
                  onChange={(e) => setSearchTalent(e.target.value)}
                  placeholder="Filter talent..."
                  className="pl-8 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none w-44 focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Candidate Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100">
                    <th className="py-2.5 pl-2">Candidate</th>
                    <th className="py-2.5">Dept & Role</th>
                    <th className="py-2.5">Key Skills</th>
                    <th className="py-2.5 text-center">AI Match</th>
                    <th className="py-2.5 text-right pr-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {candidatesList.map((worker) => {
                    const isOffered = offeredWorkers.includes(worker.name);
                    return (
                      <tr key={worker.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2 pl-2">
                          <div className="flex items-center gap-2.5">
                            {worker.avatarUrl ? (
                              <img
                                src={worker.avatarUrl}
                                alt={worker.name}
                                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                                {worker.initials || worker.name.slice(0, 2)}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-slate-900 leading-none">{worker.name}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{worker.availabilityRange}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2">
                          <span className="font-semibold text-slate-800">{worker.department}</span>
                          <span className="block text-[10px] text-slate-400">{worker.role}</span>
                        </td>
                        <td className="py-2">
                          <div className="flex flex-wrap gap-1">
                            {worker.skills.slice(0, 2).map((s, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-2 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px]">
                            {worker.matchScore}%
                          </span>
                        </td>
                        <td className="py-2 text-right pr-2">
                          <button
                            onClick={() => handleSendOffer(worker.name)}
                            disabled={isOffered}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                              isOffered
                                ? 'bg-slate-100 text-slate-400 cursor-default'
                                : 'bg-teal-700 hover:bg-teal-800 text-white shadow-2xs'
                            }`}
                          >
                            {isOffered ? 'Offer Sent' : 'Send Offer'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600"></span>
              <span>18 total verified temporary hospitality staff available</span>
            </div>
            <button
              onClick={() => onNavigateTab('talent-pool')}
              className="text-teal-700 font-bold hover:underline flex items-center gap-1"
            >
              <span>View All in Talent Pool</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
