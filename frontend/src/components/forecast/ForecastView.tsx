import React, { useState } from 'react';
import { FORECAST_7_DAYS, SEASONAL_FACTORS } from '../../data/mockData';

interface ForecastViewProps {
  onTriggerToast: (msg: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const ForecastView: React.FC<ForecastViewProps> = ({
  onTriggerToast,
  onNavigateTab,
}) => {
  const [period, setPeriod] = useState<'7d' | '14d' | '30d'>('7d');
  const [viewMode, setViewMode] = useState<'predicted' | 'actual'>('predicted');
  const [sortBy, setSortBy] = useState('date');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<number | null>(4); // Default to Friday Peak (index 4)

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      onTriggerToast('Demand forecast recalibrated with latest booking engine inflow!');
    }, 600);
  };

  const handleExport = () => {
    onTriggerToast('Exported AI Demand Curve to Forecast_Report_Q2_2025.pdf');
  };

  const handleDispatchFloaters = () => {
    onTriggerToast('Dispatched automated shift offers to 8 pre-vetted talent pool floaters!');
    setTimeout(() => {
      onNavigateTab('talent-pool');
    }, 600);
  };

  // 10 shifts forecast table data
  const forecastTableRows = [
    { date: 'Apr 21, 2025 (Mon)', dept: 'Housekeeping', color: '#00685f', req: 32, avail: 28, gap: -4, status: 'Shortage Expected' },
    { date: 'Apr 21, 2025 (Mon)', dept: 'Front Desk', color: '#4648d4', req: 38, avail: 35, gap: -3, status: 'Shortage Expected' },
    { date: 'Apr 21, 2025 (Mon)', dept: 'Restaurant', color: '#008378', req: 28, avail: 26, gap: -2, status: 'Covered' },
    { date: 'Apr 21, 2025 (Mon)', dept: 'Kitchen', color: '#6063ee', req: 18, avail: 18, gap: 0, status: 'Covered' },
    { date: 'Apr 22, 2025 (Tue)', dept: 'Housekeeping', color: '#00685f', req: 34, avail: 31, gap: -3, status: 'Shortage Expected' },
    { date: 'Apr 22, 2025 (Tue)', dept: 'Front Desk', color: '#4648d4', req: 42, avail: 40, gap: -2, status: 'Covered' },
    { date: 'Apr 22, 2025 (Tue)', dept: 'Restaurant', color: '#008378', req: 31, avail: 28, gap: -3, status: 'Shortage Expected' },
    { date: 'Apr 22, 2025 (Tue)', dept: 'Kitchen', color: '#6063ee', req: 20, avail: 18, gap: -2, status: 'Covered' },
    { date: 'Apr 23, 2025 (Wed)', dept: 'Housekeeping', color: '#00685f', req: 38, avail: 35, gap: -3, status: 'Shortage Expected' },
    { date: 'Apr 23, 2025 (Wed)', dept: 'Front Desk', color: '#4648d4', req: 46, avail: 42, gap: -4, status: 'Shortage Expected' },
  ];

  const sortedRows = [...forecastTableRows].sort((a, b) => {
    if (sortBy === 'severity') return a.gap - b.gap;
    if (sortBy === 'dept') return a.dept.localeCompare(b.dept);
    if (sortBy === 'headcount') return b.req - a.req;
    return 0; // Default date order
  });

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Top Header & Filter Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Demand Forecasting
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-800 text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-300 animate-ping"></span>
              Neural Model v3.4
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Anticipate hotel staffing requirements and occupancy surges before peak guest arrival windows.
          </p>
        </div>

        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Forecast Period Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 px-2 hidden sm:inline">Forecast Period:</span>
            <button
              onClick={() => { setPeriod('7d'); onTriggerToast('Forecast period set to 7 Days'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                period === '7d' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => { setPeriod('14d'); onTriggerToast('Forecast period set to 14 Days'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                period === '14d' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              14 Days
            </button>
            <button
              onClick={() => { setPeriod('30d'); onTriggerToast('Forecast period set to 30 Days (Full Month)'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                period === '30d' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30 Days
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs hover:bg-slate-50 transition-all"
            >
              <span className={`material-symbols-outlined text-[18px] text-teal-600 ${isRefreshing ? 'animate-spin' : ''}`}>
                autorenew
              </span>
              <span>Refresh Forecast</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs hover:bg-slate-50 transition-all"
            >
              <span className="material-symbols-outlined text-[18px] text-slate-500">download</span>
              <span>Export Forecast</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dominant Multi-Department Curve Chart Card */}
      <div className="w-full bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs mb-6 relative overflow-hidden">
        {/* Chart Header & Legend */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-2 text-slate-800">
              <span className="w-3 h-3 rounded-full bg-teal-700"></span>
              <span>Housekeeping</span>
            </div>
            <div className="flex items-center gap-2 text-slate-800">
              <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
              <span>Front Desk</span>
            </div>
            <div className="flex items-center gap-2 text-slate-800">
              <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
              <span>Restaurant</span>
            </div>
            <div className="flex items-center gap-2 text-slate-800">
              <span className="w-3 h-3 rounded-full bg-purple-600"></span>
              <span>Kitchen</span>
            </div>
          </div>

          {/* Mode Toggle: Predicted vs Actual */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('predicted')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'predicted' ? 'bg-teal-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">psychology</span>
              Predicted (AI)
            </button>
            <button
              onClick={() => { setViewMode('actual'); onTriggerToast('Switching to actual punch-clock hours from hotel biometric terminals'); }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'actual' ? 'bg-teal-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Actual
            </button>
          </div>
        </div>

        {/* Chart Canvas with Peak Stripe & Interactive Tooltip */}
        <div className="relative w-full h-[360px] select-none pt-4">
          {/* Peak Demand Callout Stripe on Apr 25 (Friday) */}
          <div className="absolute left-[64%] right-[22%] top-3 bottom-8 bg-rose-50/60 border-x border-rose-200/60 rounded-xl pointer-events-none flex flex-col items-center pt-2">
            <div className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] flex items-center gap-1 shadow-2xs border border-rose-200">
              <span className="material-symbols-outlined text-[13px] text-rose-600">warning</span>
              Peak Demand
            </div>
            <div className="w-px flex-1 border-l border-dashed border-rose-300 mt-1"></div>
          </div>

          {/* SVG Multi-curve Line Chart */}
          <svg className="w-full h-full overflow-visible" viewBox="0 0 980 320" preserveAspectRatio="none">
            {/* Horizontal Grid lines for 0 to 60 (step 10) */}
            <g stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,4">
              <line x1="45" x2="960" y1="20" y2="20" />
              <line x1="45" x2="960" y1="65" y2="65" />
              <line x1="45" x2="960" y1="110" y2="110" />
              <line x1="45" x2="960" y1="155" y2="155" />
              <line x1="45" x2="960" y1="200" y2="200" />
              <line x1="45" x2="960" y1="245" y2="245" />
              <line x1="45" x2="960" y1="290" y2="290" />
            </g>

            {/* Y-Axis Labels */}
            <g fill="#94a3b8" fontSize="10" textAnchor="end" className="font-mono">
              <text x="35" y="24">60</text>
              <text x="35" y="69">50</text>
              <text x="35" y="114">40</text>
              <text x="35" y="159">30</text>
              <text x="35" y="204">20</text>
              <text x="35" y="249">10</text>
              <text x="35" y="294">0</text>
            </g>

            {/* 1. Front Desk Curve (Indigo) */}
            <path
              d="M90 119 C 160 115, 175 101, 235 101 C 295 101, 320 83, 380 83 C 440 83, 465 110, 525 110 C 585 110, 615 65, 670 65 C 725 65, 755 101, 815 101 C 875 101, 890 119, 940 119"
              fill="none"
              stroke="#4648d4"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* 2. Housekeeping Curve (Teal) */}
            <path
              d="M90 146 C 160 144, 175 137, 235 137 C 295 137, 320 119, 380 119 C 440 119, 465 141, 525 141 C 585 141, 615 101, 670 101 C 725 101, 755 132, 815 132 C 875 132, 890 146, 940 146"
              fill="none"
              stroke="#00685f"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* 3. Restaurant Curve (Emerald) */}
            <path
              d="M90 164 C 160 160, 175 150.5, 235 150.5 C 295 150.5, 320 137, 380 137 C 440 137, 465 159.5, 525 159.5 C 585 159.5, 615 128, 670 128 C 725 128, 755 155, 815 155 C 875 155, 890 173, 940 173"
              fill="none"
              stroke="#008378"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* 4. Kitchen Curve (Purple) */}
            <path
              d="M90 209 C 160 206, 175 200, 235 200 C 295 200, 320 191, 380 191 C 440 191, 465 204.5, 525 204.5 C 585 204.5, 615 182, 670 182 C 725 182, 755 195.5, 815 195.5 C 875 195.5, 890 213.5, 940 213.5"
              fill="none"
              stroke="#6063ee"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Data Points */}
            {/* Mon (90) */}
            <circle cx="90" cy="119" r="4" fill="#ffffff" stroke="#4648d4" strokeWidth="2.5" />
            <circle cx="90" cy="146" r="4" fill="#ffffff" stroke="#00685f" strokeWidth="2.5" />
            <circle cx="90" cy="164" r="3.5" fill="#ffffff" stroke="#008378" strokeWidth="2" />
            <circle cx="90" cy="209" r="3.5" fill="#ffffff" stroke="#6063ee" strokeWidth="2" />

            {/* Tue (235) */}
            <circle cx="235" cy="101" r="4" fill="#ffffff" stroke="#4648d4" strokeWidth="2.5" />
            <circle cx="235" cy="137" r="4" fill="#ffffff" stroke="#00685f" strokeWidth="2.5" />
            <circle cx="235" cy="150.5" r="3.5" fill="#ffffff" stroke="#008378" strokeWidth="2" />
            <circle cx="235" cy="200" r="3.5" fill="#ffffff" stroke="#6063ee" strokeWidth="2" />

            {/* Wed (380) */}
            <circle cx="380" cy="83" r="4" fill="#ffffff" stroke="#4648d4" strokeWidth="2.5" />
            <circle cx="380" cy="119" r="4" fill="#ffffff" stroke="#00685f" strokeWidth="2.5" />
            <circle cx="380" cy="137" r="3.5" fill="#ffffff" stroke="#008378" strokeWidth="2" />
            <circle cx="380" cy="191" r="3.5" fill="#ffffff" stroke="#6063ee" strokeWidth="2" />

            {/* Thu (525) */}
            <circle cx="525" cy="110" r="4" fill="#ffffff" stroke="#4648d4" strokeWidth="2.5" />
            <circle cx="525" cy="141" r="4" fill="#ffffff" stroke="#00685f" strokeWidth="2.5" />
            <circle cx="525" cy="159.5" r="3.5" fill="#ffffff" stroke="#008378" strokeWidth="2" />
            <circle cx="525" cy="204.5" r="3.5" fill="#ffffff" stroke="#6063ee" strokeWidth="2" />

            {/* Fri Peak (670) */}
            <circle cx="670" cy="65" r="6" fill="#ba1a1a" stroke="#ffffff" strokeWidth="2.5" className="animate-pulse" />
            <circle cx="670" cy="101" r="5" fill="#00685f" stroke="#ffffff" strokeWidth="2" />
            <circle cx="670" cy="128" r="4.5" fill="#008378" stroke="#ffffff" strokeWidth="2" />
            <circle cx="670" cy="182" r="4.5" fill="#6063ee" stroke="#ffffff" strokeWidth="2" />

            {/* Sat (815) */}
            <circle cx="815" cy="101" r="4" fill="#ffffff" stroke="#4648d4" strokeWidth="2.5" />
            <circle cx="815" cy="132" r="4" fill="#ffffff" stroke="#00685f" strokeWidth="2.5" />
            <circle cx="815" cy="155" r="3.5" fill="#ffffff" stroke="#008378" strokeWidth="2" />
            <circle cx="815" cy="195.5" r="3.5" fill="#ffffff" stroke="#6063ee" strokeWidth="2" />

            {/* Sun (940) */}
            <circle cx="940" cy="119" r="4" fill="#ffffff" stroke="#4648d4" strokeWidth="2.5" />
            <circle cx="940" cy="146" r="4" fill="#ffffff" stroke="#00685f" strokeWidth="2.5" />
            <circle cx="940" cy="173" r="3.5" fill="#ffffff" stroke="#008378" strokeWidth="2" />
            <circle cx="940" cy="213.5" r="3.5" fill="#ffffff" stroke="#6063ee" strokeWidth="2" />
          </svg>

          {/* Hover Tooltip Box at Friday Peak (x ~ 70%) */}
          <div className="absolute left-[70%] top-6 bg-white p-4 rounded-xl shadow-xl border border-slate-200/90 w-52 pointer-events-none z-10">
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900">Apr 25, 2025</span>
              <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">
                Fri Peak
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  Front Desk
                </span>
                <span className="text-slate-900 font-bold">48 <span className="text-slate-400 font-normal">(46 avail)</span></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-teal-700"></span>
                  Housekeeping
                </span>
                <span className="text-slate-900 font-bold">38 <span className="text-slate-400 font-normal">(35 avail)</span></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  Restaurant
                </span>
                <span className="text-slate-900 font-bold">32 <span className="text-slate-400 font-normal">(28 avail)</span></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                  Kitchen
                </span>
                <span className="text-slate-900 font-bold">22 <span className="text-slate-400 font-normal">(20 avail)</span></span>
              </div>
            </div>
          </div>

          {/* X-Axis Labels positioned along the bottom */}
          <div className="absolute left-10 right-5 bottom-0 flex justify-between text-center select-none text-xs text-slate-600">
            <div className="flex flex-col"><span className="font-bold text-slate-900">Apr 21</span><span className="text-[10px] text-slate-400">Mon</span></div>
            <div className="flex flex-col"><span className="font-bold text-slate-900">Apr 22</span><span className="text-[10px] text-slate-400">Tue</span></div>
            <div className="flex flex-col"><span className="font-bold text-slate-900">Apr 23</span><span className="text-[10px] text-slate-400">Wed</span></div>
            <div className="flex flex-col"><span className="font-bold text-slate-900">Apr 24</span><span className="text-[10px] text-slate-400">Thu</span></div>
            <div className="flex flex-col text-rose-700 font-black"><span className="text-rose-600">Apr 25</span><span className="text-[10px]">Fri</span></div>
            <div className="flex flex-col"><span className="font-bold text-slate-900">Apr 26</span><span className="text-[10px] text-slate-400">Sat</span></div>
            <div className="flex flex-col"><span className="font-bold text-slate-900">Apr 27</span><span className="text-[10px] text-slate-400">Sun</span></div>
          </div>
        </div>
      </div>

      {/* Bottom Split Layout: 65% Table / 35% Seasonal Demand Analysis */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left Panel: Staffing Forecast Table (8 cols / ~66%) */}
        <div className="xl:col-span-8 bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-2 gap-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-700 text-[20px]">table_chart</span>
                <h2 className="text-sm font-bold text-slate-900">Staffing Forecast</h2>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">
                  10 Shifts Tracked
                </span>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="date">Date (Newest First)</option>
                  <option value="severity">Shortage Severity</option>
                  <option value="dept">Department A-Z</option>
                  <option value="headcount">Required Headcount</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-2.5 px-3 rounded-l-lg">Forecast Date</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3 text-center">Predicted Req.</th>
                    <th className="py-2.5 px-3 text-center">Available</th>
                    <th className="py-2.5 px-3 text-center">Staffing Gap</th>
                    <th className="py-2.5 px-3 text-right rounded-r-lg">Forecast Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedRows.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                        {row.date}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="flex items-center gap-2 font-medium text-slate-800">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: row.color }}></span>
                          {row.dept}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                        {row.req}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-500">
                        {row.avail}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold">
                        <span className={row.gap < 0 ? 'text-rose-600' : 'text-teal-700'}>
                          {row.gap}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {row.status === 'Shortage Expected' ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Shortage Expected
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Covered
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 mt-2 flex items-center justify-between border-t border-slate-100 text-xs text-slate-500">
            <span>Showing 10 of 28 department schedules</span>
            <div className="flex items-center gap-1">
              <button className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold">
                Previous
              </button>
              <span className="px-2 text-slate-800 font-bold">1</span>
              <button className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold">
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Seasonal Demand Analysis (4 cols / ~34%) */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Seasonal Demand Analysis
                </h2>
                <span
                  className="material-symbols-outlined text-[16px] text-slate-400 cursor-pointer hover:text-slate-700"
                  title="Factors driving the predictive demand model"
                >
                  info
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[10px] font-bold">
                (Demo data)
              </span>
            </div>

            <div className="space-y-3">
              {SEASONAL_FACTORS.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 hover:bg-slate-100/70 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: item.bgColor, color: item.color }}
                      >
                        <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 leading-tight">{item.title}</h3>
                        <span className="text-[10px] text-slate-400 leading-tight">{item.dates}</span>
                      </div>
                    </div>
                    <span
                      className="text-xs font-black px-2 py-0.5 rounded-md"
                      style={{ backgroundColor: item.bgColor, color: item.color }}
                    >
                      {item.percent}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 leading-snug">
                    {item.description}
                  </p>
                  <div className="w-full bg-slate-200/70 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${item.progress}%`, backgroundColor: item.color }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick AI Action Callout Box */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-teal-700 to-teal-900 text-white shadow-md flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                <span className="material-symbols-outlined text-[22px] text-teal-300">smart_toy</span>
              </div>
              <div>
                <div className="text-xs font-bold leading-tight">Auto-Balance Apr 25 Deficit?</div>
                <div className="text-[11px] text-teal-200 leading-tight mt-0.5">Dispatch call to 8 pre-vetted floaters.</div>
              </div>
            </div>
            <button
              onClick={handleDispatchFloaters}
              className="px-3.5 py-1.5 rounded-lg bg-white text-teal-900 text-xs font-bold hover:bg-teal-50 shadow-sm shrink-0 transition-transform active:scale-95"
            >
              Dispatch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
