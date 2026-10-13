import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  RotateCcw, 
  CheckCircle2, 
  Briefcase, 
  Sparkles, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { AppState, Department } from '../../types';
import { NavTab } from '../Sidebar';

interface OverviewViewProps {
  appState: AppState;
  onNavigateTab: (tab: NavTab) => void;
  onGenerateSmartRoster: () => void;
  onUpdateOccupancy: (occupancy: number, arrivals: number) => void;
  onSendCandidateOffer: (candidateId: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  appState,
  onNavigateTab,
  onGenerateSmartRoster,
  onUpdateOccupancy,
  onSendCandidateOffer,
}) => {
  const [selectedDay, setSelectedDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'>('Wed');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('All Departments');
  const [candidateSearch, setCandidateSearch] = useState('');
  const [occupancyInput, setOccupancyInput] = useState(appState.metrics.hotelOccupancy);
  const [arrivalsInput, setArrivalsInput] = useState(appState.metrics.expectedGuestArrivals);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const handleOccupancyBlur = () => {
    onUpdateOccupancy(occupancyInput, arrivalsInput);
  };

  const handleSmartRosterClick = () => {
    onGenerateSmartRoster();
    setSuccessBanner('Smart Roster optimization executed! All vacant positions resolved & stored locally.');
    setTimeout(() => setSuccessBanner(null), 5000);
  };

  // Days for the upcoming schedule widget
  const days = [
    { day: 'Mon', num: 21 },
    { day: 'Tue', num: 22 },
    { day: 'Wed', num: 23 },
    { day: 'Thu', num: 24 },
    { day: 'Fri', num: 25 },
    { day: 'Sat', num: 26 },
    { day: 'Sun', num: 27 },
  ];

  // Candidates for Temporary Worker Matches table
  const matchedWorkers = [
    {
      id: 'tc-wm-1',
      name: 'Emily Davis',
      rating: '4.8',
      dept: 'Housekeeping',
      skills: 'Cleaning, Laundry',
      dates: 'Apr 23 - Apr 25',
      match: 96,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'tc-wm-2',
      name: 'James Miller',
      rating: '4.6',
      dept: 'Kitchen',
      skills: 'Cooking, Food Prep',
      dates: 'Apr 23 - Apr 27',
      match: 88,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'tc-wm-3',
      name: 'Sophia Brown',
      rating: '4.7',
      dept: 'Restaurant',
      skills: 'Service, POS',
      dates: 'Apr 24 - Apr 28',
      match: 82,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'tc-wm-4',
      name: 'Daniel Wilson',
      rating: '4.5',
      dept: 'Reception',
      skills: 'Guest Support, CRM',
      dates: 'Apr 23 - Apr 26',
      match: 76,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'tc-wm-5',
      name: 'Olivia Martinez',
      rating: '4.4',
      dept: 'Housekeeping',
      skills: 'Cleaning, Inventory',
      dates: 'Apr 24 - Apr 27',
      match: 68,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    },
  ];

  const filteredMatchedWorkers = matchedWorkers.filter((w) => {
    const matchesSearch = w.name.toLowerCase().includes(candidateSearch.toLowerCase()) ||
                          w.dept.toLowerCase().includes(candidateSearch.toLowerCase()) ||
                          w.skills.toLowerCase().includes(candidateSearch.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Toast alert if triggered */}
      {successBanner && (
        <div className="p-3 bg-teal-600 text-white rounded-xl shadow-md flex items-center justify-between text-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-200" />
            <span className="font-medium">{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-white hover:text-teal-200 font-bold px-2">✕</button>
        </div>
      )}

      {/* Top Banner & KPI Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome Back, Manager</h1>
          <p className="text-sm text-slate-500">Your hotel's workforce at a glance.</p>
        </div>

        {/* 3 mini cards on top right */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Active Employees</div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-slate-900 tabular-nums">{appState.metrics.activeEmployees}</span>
                <span className="text-xs font-semibold text-emerald-600">↑ 12%</span>
              </div>
              <div className="text-[10px] text-slate-400">vs. last week</div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">New Shift Confirmations</div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-slate-900 tabular-nums">{appState.metrics.newShiftConfirmations}</span>
                <span className="text-xs font-semibold text-emerald-600">↑ 24%</span>
              </div>
              <div className="text-[10px] text-slate-400">vs. last week</div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Staff Turnover Rate</div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-slate-900 tabular-nums">{appState.metrics.turnoverRate}%</span>
                <span className="text-xs font-semibold text-emerald-600">↓ 1.2%</span>
              </div>
              <div className="text-[10px] text-slate-400">vs. last month</div>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Employees */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-teal-50 flex items-center justify-center text-teal-700 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Total Employees</div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">{appState.metrics.totalEmployees}</div>
            <div className="text-xs text-emerald-600 font-medium">↑ 12% <span className="text-slate-400 font-normal">vs. last week</span></div>
          </div>
        </div>

        {/* Available Today */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Available Today</div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">{appState.metrics.availableToday}</div>
            <div className="text-xs text-emerald-600 font-medium">↑ 8% <span className="text-slate-400 font-normal">vs. yesterday</span></div>
          </div>
        </div>

        {/* Open Positions */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Open Positions</div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">{appState.metrics.openPositions}</div>
            <div className="text-xs text-emerald-600 font-medium">↓ 20% <span className="text-slate-400 font-normal">vs. last week</span></div>
          </div>
        </div>

        {/* Dynamic Occupancy & Arrivals Inputs */}
        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-600 font-medium mb-1">
            <span>Hotel Occupancy (%)</span>
            <span className="text-teal-700 font-bold">{occupancyInput}%</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="20"
              max="100"
              value={occupancyInput}
              onChange={(e) => setOccupancyInput(Number(e.target.value))}
              onMouseUp={handleOccupancyBlur}
              onTouchEnd={handleOccupancyBlur}
              className="w-full accent-teal-600 cursor-pointer"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-600 font-medium mt-2">
            <span>Expected Guest Arrivals</span>
            <input
              type="number"
              value={arrivalsInput}
              onChange={(e) => setArrivalsInput(Number(e.target.value))}
              onBlur={handleOccupancyBlur}
              className="w-16 px-1.5 py-0.5 text-right font-bold text-slate-800 border border-slate-200 rounded text-xs"
            />
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs flex flex-col justify-center gap-2">
          <button
            onClick={handleSmartRosterClick}
            className="w-full py-2 px-3 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <Sparkles className="w-4 h-4 text-teal-200" />
            <span>Generate Smart Roster</span>
          </button>
          <button
            onClick={() => onNavigateTab('talent')}
            className="w-full py-2 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition"
          >
            <Users className="w-4 h-4 text-slate-500" />
            <span>Find Temporary Staff</span>
          </button>
        </div>
      </div>

      {/* Middle Row: Coverage Tracker + Demand Forecast + Upcoming Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Workforce Coverage Tracker */}
        <div className="lg:col-span-3 bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col">
          <h2 className="text-base font-bold text-slate-900 mb-4">Workforce Coverage Tracker</h2>

          {/* Donut Chart Gauge */}
          <div className="flex flex-col items-center justify-center py-2 relative">
            <svg className="w-36 h-36 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#E2E8F0"
                strokeWidth="11"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#0D9488"
                strokeWidth="11"
                strokeDasharray={`${(appState.metrics.coveragePercentage / 100) * 251.2} 251.2`}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                {appState.metrics.coveragePercentage}%
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Shift Coverage</span>
            </div>
          </div>

          <div className="text-center mt-2 mb-4">
            <span className="text-sm font-semibold text-slate-800">
              {appState.metrics.vacantShifts} Vacancies
            </span>
            <span className="text-xs text-slate-500"> of {appState.metrics.totalShiftPositions} total positions</span>
          </div>

          {/* Filled vs Vacant Legend */}
          <div className="flex items-center justify-around py-2 border-y border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-teal-600"></span>
              <span className="text-slate-600">Filled Shifts</span>
              <span className="font-bold text-slate-900 tabular-nums">{appState.metrics.filledShifts}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-300"></span>
              <span className="text-slate-600">Vacant Shifts</span>
              <span className="font-bold text-slate-900 tabular-nums">{appState.metrics.vacantShifts}</span>
            </div>
          </div>

          {/* Coverage by Department Progress Bars */}
          <div className="mt-4 space-y-3">
            <div className="text-xs font-semibold text-slate-700">Coverage by Department</div>
            
            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Housekeeping</span>
                <span className="font-semibold text-slate-800">94%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-teal-600 h-2 rounded-full" style={{ width: '94%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Reception</span>
                <span className="font-semibold text-slate-800">88%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-teal-600 h-2 rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Restaurant</span>
                <span className="font-semibold text-slate-800">90%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-teal-600 h-2 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Kitchen</span>
                <span className="font-semibold text-slate-800">92%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-teal-600 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. AI Staffing Demand Forecast Chart */}
        <div className="lg:col-span-5 bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">AI Staffing Demand Forecast</h2>
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-teal-600"
            >
              <option>All Departments</option>
              <option>Housekeeping</option>
              <option>Front Desk</option>
              <option>Restaurant</option>
              <option>Kitchen</option>
            </select>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center gap-4 text-xs mb-3 text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
              <span>Predicted Required Staff</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-lime-500"></span>
              <span>Available Employees</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Peak Demand</span>
            </div>
          </div>

          {/* Interactive SVG Chart */}
          <div className="w-full h-56 relative pt-2">
            <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
              {/* Grid lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="40" y1="60" x2="480" y2="60" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="40" y1="100" x2="480" y2="100" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="40" y1="140" x2="480" y2="140" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="40" y1="180" x2="480" y2="180" stroke="#E2E8F0" strokeWidth="1" />

              {/* Y Axis text */}
              <text x="15" y="25" fill="#94A3B8" fontSize="10">100</text>
              <text x="20" y="65" fill="#94A3B8" fontSize="10">80</text>
              <text x="20" y="105" fill="#94A3B8" fontSize="10">60</text>
              <text x="20" y="145" fill="#94A3B8" fontSize="10">40</text>
              <text x="25" y="185" fill="#94A3B8" fontSize="10">0</text>

              {/* Peak demand highlight column for Apr 25 & Apr 26 */}
              <rect x="290" y="20" width="130" height="160" fill="#FEF3C7" opacity="0.4" rx="4" />

              {/* Line 1: Predicted Required Staff (Teal) */}
              {/* Points: Mon(48) Tue(54) Wed(62) Thu(78) Fri(70) Sat(82) Sun(64) */}
              <path
                d="M 60 130 Q 120 120, 180 110 T 250 80 T 320 95 T 390 70 T 460 100"
                fill="none"
                stroke="#0D9488"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Line 2: Available Employees (Lime) */}
              {/* Points: Mon(40) Tue(46) Wed(52) Thu(60) Fri(60) Sat(64) Sun(52) */}
              <path
                d="M 60 145 Q 120 135, 180 128 T 250 115 T 320 115 T 390 105 T 460 122"
                fill="none"
                stroke="#84CC16"
                strokeWidth="2"
                strokeDasharray="4 2"
                strokeLinecap="round"
              />

              {/* Node dots */}
              {/* Predicted nodes */}
              <circle cx="60" cy="130" r="3.5" fill="#0D9488" />
              <circle cx="180" cy="110" r="3.5" fill="#0D9488" />
              <circle cx="250" cy="80" r="4.5" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.5" />
              <circle cx="320" cy="95" r="3.5" fill="#0D9488" />
              <circle cx="390" cy="70" r="4.5" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.5" />
              <circle cx="460" cy="100" r="3.5" fill="#0D9488" />

              {/* Available nodes */}
              <circle cx="60" cy="145" r="3" fill="#84CC16" />
              <circle cx="180" cy="128" r="3" fill="#84CC16" />
              <circle cx="250" cy="115" r="3" fill="#84CC16" />
              <circle cx="320" cy="115" r="3" fill="#84CC16" />
              <circle cx="390" cy="105" r="3" fill="#84CC16" />
              <circle cx="460" cy="122" r="3" fill="#84CC16" />
            </svg>
          </div>

          {/* X Axis Labels */}
          <div className="flex justify-between px-6 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <div className="text-center"><div>Apr 21</div><div className="text-slate-400">Mon</div></div>
            <div className="text-center"><div>Apr 22</div><div className="text-slate-400">Tue</div></div>
            <div className="text-center font-bold text-teal-700"><div>Apr 23</div><div>Wed</div></div>
            <div className="text-center"><div>Apr 24</div><div className="text-slate-400">Thu</div></div>
            <div className="text-center font-bold text-amber-700"><div>Apr 25</div><div>Fri (Peak)</div></div>
            <div className="text-center font-bold text-amber-700"><div>Apr 26</div><div>Sat (Peak)</div></div>
            <div className="text-center"><div>Apr 27</div><div className="text-slate-400">Sun</div></div>
          </div>
        </div>

        {/* 3. Upcoming Schedule & Today's Shifts */}
        <div className="lg:col-span-4 bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900">Upcoming Schedule</h2>
              <div className="flex items-center gap-1.5">
                <button className="p-1 rounded hover:bg-slate-100 text-slate-600"><ChevronLeft className="w-4 h-4" /></button>
                <span className="text-xs font-semibold text-slate-700">Apr 23, 2025</span>
                <button className="p-1 rounded hover:bg-slate-100 text-slate-600"><ChevronRight className="w-4 h-4" /></button>
                <button className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 ml-1">Today</button>
              </div>
            </div>

            {/* Week Date Picker */}
            <div className="grid grid-cols-7 gap-1 py-2 text-center text-xs border-b border-slate-100">
              {days.map((d) => {
                const isSelected = selectedDay === d.day;
                return (
                  <button
                    key={d.day}
                    onClick={() => setSelectedDay(d.day as any)}
                    className={`py-1.5 rounded-lg flex flex-col items-center transition ${
                      isSelected
                        ? 'bg-teal-800 text-white font-bold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-[10px] opacity-80">{d.day}</span>
                    <span className="text-sm font-semibold">{d.num}</span>
                  </button>
                );
              })}
            </div>

            {/* Today's Shifts Header */}
            <div className="flex items-center justify-between mt-3 mb-2">
              <span className="text-xs font-bold text-slate-800">Today's Shifts</span>
              <button 
                onClick={() => onNavigateTab('schedule')}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900"
              >
                View All
              </button>
            </div>

            {/* Today's Shift Slots */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                  <span className="font-semibold text-slate-800">06:00 - 14:00</span>
                  <span className="text-slate-600">Housekeeping</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-600">12 / 12</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Full</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span className="font-semibold text-slate-800">08:00 - 16:00</span>
                  <span className="text-slate-600">Reception</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-600">8 / 10</span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">Partial</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="font-semibold text-slate-800">11:00 - 19:00</span>
                  <span className="text-slate-600">Restaurant</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-600">15 / 18</span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">Partial</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  <span className="font-semibold text-slate-800">16:00 - 00:00</span>
                  <span className="text-slate-600">Kitchen</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-600">10 / 10</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Full</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 text-center">
            Offline cache ready · Synced with local roster storage
          </div>
        </div>
      </div>

      {/* Bottom Row: Department Staffing Demand + Temporary Worker Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Department Staffing Demand Stacked Bars */}
        <div className="lg:col-span-5 bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Department Staffing Demand</h2>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-teal-700"></span> Required</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-lime-500"></span> Available</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span> Shortage</span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Headers */}
            <div className="flex justify-between text-[11px] font-semibold text-slate-400 pb-1 border-b border-slate-100">
              <span>Department</span>
              <div className="flex gap-6 pr-1">
                <span>Required</span>
                <span>Available</span>
                <span className="text-amber-600">Gap</span>
              </div>
            </div>

            {/* Housekeeping */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-slate-800">Housekeeping</span>
                <div className="flex gap-8 text-slate-600 tabular-nums">
                  <span>42</span>
                  <span>40</span>
                  <span className="text-amber-600 font-bold">2</span>
                </div>
              </div>
              <div className="h-4 w-full bg-slate-100 rounded flex overflow-hidden">
                <div className="bg-teal-700 h-full" style={{ width: '45%' }}></div>
                <div className="bg-lime-500 h-full" style={{ width: '45%' }}></div>
                <div className="bg-amber-500 h-full" style={{ width: '10%' }}></div>
              </div>
            </div>

            {/* Reception */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-slate-800">Reception</span>
                <div className="flex gap-8 text-slate-600 tabular-nums">
                  <span>28</span>
                  <span>26</span>
                  <span className="text-amber-600 font-bold">2</span>
                </div>
              </div>
              <div className="h-4 w-full bg-slate-100 rounded flex overflow-hidden">
                <div className="bg-teal-700 h-full" style={{ width: '45%' }}></div>
                <div className="bg-lime-500 h-full" style={{ width: '45%' }}></div>
                <div className="bg-amber-500 h-full" style={{ width: '10%' }}></div>
              </div>
            </div>

            {/* Restaurant */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-slate-800">Restaurant</span>
                <div className="flex gap-8 text-slate-600 tabular-nums">
                  <span>36</span>
                  <span>31</span>
                  <span className="text-amber-600 font-bold">5</span>
                </div>
              </div>
              <div className="h-4 w-full bg-slate-100 rounded flex overflow-hidden">
                <div className="bg-teal-700 h-full" style={{ width: '40%' }}></div>
                <div className="bg-lime-500 h-full" style={{ width: '45%' }}></div>
                <div className="bg-amber-500 h-full" style={{ width: '15%' }}></div>
              </div>
            </div>

            {/* Kitchen */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-slate-800">Kitchen</span>
                <div className="flex gap-8 text-slate-600 tabular-nums">
                  <span>32</span>
                  <span>29</span>
                  <span className="text-amber-600 font-bold">3</span>
                </div>
              </div>
              <div className="h-4 w-full bg-slate-100 rounded flex overflow-hidden">
                <div className="bg-teal-700 h-full" style={{ width: '42%' }}></div>
                <div className="bg-lime-500 h-full" style={{ width: '46%' }}></div>
                <div className="bg-amber-500 h-full" style={{ width: '12%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Temporary Worker Matches Table */}
        <div className="lg:col-span-7 bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-base font-bold text-slate-900">Temporary Worker Matches</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by name, skills, or department..."
                  value={candidateSearch}
                  onChange={(e) => setCandidateSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 w-56 focus:outline-teal-600"
                />
              </div>
              <select className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700">
                <option>All Departments</option>
                <option>Housekeeping</option>
                <option>Kitchen</option>
                <option>Restaurant</option>
                <option>Reception</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="py-2 font-medium">Name</th>
                  <th className="py-2 font-medium">Department</th>
                  <th className="py-2 font-medium">Skills</th>
                  <th className="py-2 font-medium">Availability</th>
                  <th className="py-2 font-medium text-center">Match Status</th>
                  <th className="py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMatchedWorkers.map((worker) => (
                  <tr key={worker.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={worker.avatar}
                          alt={worker.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-semibold text-slate-800">{worker.name}</div>
                          <div className="text-[11px] text-amber-500 font-medium">★ {worker.rating}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 text-slate-600 font-medium">{worker.dept}</td>
                    <td className="py-2.5 text-slate-500">{worker.skills}</td>
                    <td className="py-2.5 text-slate-600">{worker.dates}</td>
                    <td className="py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        worker.match >= 90
                          ? 'bg-teal-100 text-teal-800'
                          : worker.match >= 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : worker.match >= 75
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {worker.match}% Match
                      </span>
                    </td>
                    <td className="py-2.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => onNavigateTab('talent')}
                        className="px-2.5 py-1 text-xs rounded border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium transition"
                      >
                        Review
                      </button>
                      <button
                        onClick={() => {
                          onSendCandidateOffer(worker.id);
                          setSuccessBanner(`Offer dispatched locally to ${worker.name}!`);
                          setTimeout(() => setSuccessBanner(null), 4000);
                        }}
                        className="px-2.5 py-1 text-xs rounded bg-teal-700 hover:bg-teal-800 text-white font-semibold shadow-2xs transition"
                      >
                        Offer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
