import React, { useState } from 'react';
import { 
  RotateCw, 
  Download, 
  Calendar, 
  TrendingUp, 
  Info, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { AppState, Department, StaffingForecastItem } from '../../types';

interface ForecastViewProps {
  appState: AppState;
}

export const ForecastView: React.FC<ForecastViewProps> = ({ appState }) => {
  const [period, setPeriod] = useState<'7' | '14' | '30'>('7');
  const [mode, setMode] = useState<'predicted' | 'actual'>('predicted');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'gap'>('newest');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(4); // Default hover on Apr 25 (index 4)
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Date,Department,Predicted,Available,Gap,Status\n" +
      tableRows.map(e => `"${e.date}","${e.department}",${e.predictedRequired},${e.availableStaff},${e.gap},"${e.status}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `quickshift-demand-forecast-${period}days.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Staffing Forecast Table Data (matching Image 1)
  const tableRows: StaffingForecastItem[] = [
    { id: '1', date: 'Apr 21, 2025 (Mon)', department: 'Housekeeping', predictedRequired: 32, availableStaff: 28, gap: -4, status: 'Shortage Expected' },
    { id: '2', date: 'Apr 21, 2025 (Mon)', department: 'Front Desk', predictedRequired: 38, availableStaff: 35, gap: -3, status: 'Shortage Expected' },
    { id: '3', date: 'Apr 21, 2025 (Mon)', department: 'Restaurant', predictedRequired: 28, availableStaff: 26, gap: -2, status: 'Covered' },
    { id: '4', date: 'Apr 21, 2025 (Mon)', department: 'Kitchen', predictedRequired: 18, availableStaff: 18, gap: 0, status: 'Covered' },
    
    { id: '5', date: 'Apr 22, 2025 (Tue)', department: 'Housekeeping', predictedRequired: 34, availableStaff: 31, gap: -3, status: 'Shortage Expected' },
    { id: '6', date: 'Apr 22, 2025 (Tue)', department: 'Front Desk', predictedRequired: 42, availableStaff: 40, gap: -2, status: 'Covered' },
    { id: '7', date: 'Apr 22, 2025 (Tue)', department: 'Restaurant', predictedRequired: 31, availableStaff: 28, gap: -3, status: 'Shortage Expected' },
    { id: '8', date: 'Apr 22, 2025 (Tue)', department: 'Kitchen', predictedRequired: 20, availableStaff: 18, gap: -2, status: 'Covered' },
    
    { id: '9', date: 'Apr 23, 2025 (Wed)', department: 'Housekeeping', predictedRequired: 38, availableStaff: 35, gap: -3, status: 'Shortage Expected' },
    { id: '10', date: 'Apr 23, 2025 (Wed)', department: 'Front Desk', predictedRequired: 46, availableStaff: 42, gap: -4, status: 'Shortage Expected' },
    { id: '11', date: 'Apr 23, 2025 (Wed)', department: 'Restaurant', predictedRequired: 34, availableStaff: 30, gap: -4, status: 'Shortage Expected' },
    { id: '12', date: 'Apr 23, 2025 (Wed)', department: 'Kitchen', predictedRequired: 22, availableStaff: 20, gap: -2, status: 'Covered' },
  ];

  const sortedRows = [...tableRows].sort((a, b) => {
    if (sortBy === 'gap') return a.gap - b.gap;
    if (sortBy === 'oldest') return a.id.localeCompare(b.id);
    return b.id.localeCompare(a.id);
  });

  const deptColors: Record<Department, string> = {
    'Housekeeping': '#0D9488', // Teal
    'Front Desk': '#0284C7',   // Sky/Blue
    'Restaurant': '#65A30D',   // Green
    'Kitchen': '#9333EA',      // Purple
    'Maintenance': '#64748B',  // Slate
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Demand Forecasting</h1>
          <p className="text-sm text-slate-500">Anticipate hotel staffing requirements before demand peaks.</p>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-3">
          {/* Period selector */}
          <div className="flex items-center p-1 bg-white border border-slate-200 rounded-lg shadow-2xs">
            <span className="text-xs text-slate-400 font-medium px-2 hidden sm:inline">Forecast Period</span>
            <button
              onClick={() => setPeriod('7')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                period === '7' ? 'bg-[#007A78] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setPeriod('14')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                period === '14' ? 'bg-[#007A78] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              14 Days
            </button>
            <button
              onClick={() => setPeriod('30')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                period === '30' ? 'bg-[#007A78] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30 Days
            </button>
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg shadow-2xs hover:bg-slate-50 transition"
          >
            <RotateCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Forecast</span>
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg shadow-2xs hover:bg-slate-50 transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Forecast</span>
          </button>
        </div>
      </div>

      {/* Main Multi-Line Interactive Chart Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs relative">
        {/* Chart header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          {/* Department Legend */}
          <div className="flex flex-wrap items-center gap-5 text-xs font-medium text-slate-700">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488]"></span>
              <span>Housekeeping</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]"></span>
              <span>Front Desk</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#65A30D]"></span>
              <span>Restaurant</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#9333EA]"></span>
              <span>Kitchen</span>
            </div>
          </div>

          {/* Predicted (AI) vs Actual Switch */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200/60">
            <button
              onClick={() => setMode('predicted')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                mode === 'predicted' ? 'bg-[#007A78] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Predicted (AI)
            </button>
            <button
              onClick={() => setMode('actual')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                mode === 'actual' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Actual
            </button>
          </div>
        </div>

        {/* SVG Multi-Line Chart Canvas */}
        <div className="w-full h-80 relative select-none">
          <svg className="w-full h-full" viewBox="0 0 900 300" preserveAspectRatio="none">
            {/* Horizontal Grid lines */}
            <line x1="60" y1="30" x2="880" y2="30" stroke="#F1F5F9" strokeWidth="1" />
            <line x1="60" y1="75" x2="880" y2="75" stroke="#F1F5F9" strokeWidth="1" />
            <line x1="60" y1="120" x2="880" y2="120" stroke="#F1F5F9" strokeWidth="1" />
            <line x1="60" y1="165" x2="880" y2="165" stroke="#F1F5F9" strokeWidth="1" />
            <line x1="60" y1="210" x2="880" y2="210" stroke="#F1F5F9" strokeWidth="1" />
            <line x1="60" y1="255" x2="880" y2="255" stroke="#E2E8F0" strokeWidth="1" />

            {/* Y Axis Values */}
            <text x="25" y="34" fill="#94A3B8" fontSize="11" fontFamily="sans-serif">60</text>
            <text x="25" y="79" fill="#94A3B8" fontSize="11" fontFamily="sans-serif">50</text>
            <text x="25" y="124" fill="#94A3B8" fontSize="11" fontFamily="sans-serif">40</text>
            <text x="25" y="169" fill="#94A3B8" fontSize="11" fontFamily="sans-serif">30</text>
            <text x="25" y="214" fill="#94A3B8" fontSize="11" fontFamily="sans-serif">20</text>
            <text x="25" y="259" fill="#94A3B8" fontSize="11" fontFamily="sans-serif">10</text>
            <text x="32" y="295" fill="#94A3B8" fontSize="11" fontFamily="sans-serif">0</text>

            {/* Y Axis Title rotated */}
            <text x="-160" y="16" fill="#94A3B8" fontSize="10" transform="rotate(-90)" fontFamily="sans-serif">
              Required Staff Count
            </text>

            {/* Apr 25 Peak Demand Vertical Shaded Column & Dotted Line */}
            {/* Position of Apr 25: x = 600 */}
            <rect x="580" y="25" width="40" height="235" fill="#FEF3C7" opacity="0.35" rx="3" />
            <line x1="600" y1="25" x2="600" y2="255" stroke="#F87171" strokeWidth="1.5" strokeDasharray="3 3" />

            {/* X coordinates for 7 days:
                Mon 21: 100
                Tue 22: 225
                Wed 23: 350
                Thu 24: 475
                Fri 25: 600 (Peak)
                Sat 26: 725
                Sun 27: 850
            */}

            {/* Front Desk Line (Blue) - Peaks at 48 on Friday */}
            {/* Values approx: 32, 38, 43, 37, 48, 40, 37 */}
            <path
              d="M 100 160 Q 160 148, 225 140 T 350 120 T 475 142 T 600 95 T 725 135 T 850 148"
              fill="none"
              stroke="#0284C7"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Housekeeping Line (Teal) - Peaks at 38 on Friday */}
            {/* Values approx: 25, 27, 32, 30, 38, 30, 28 */}
            <path
              d="M 100 190 Q 160 185, 225 180 T 350 160 T 475 170 T 600 135 T 725 170 T 850 180"
              fill="none"
              stroke="#0D9488"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Restaurant Line (Green) - Peaks at 32 on Friday */}
            {/* Values approx: 19, 21, 26, 22, 32, 25, 22 */}
            <path
              d="M 100 215 Q 160 210, 225 205 T 350 185 T 475 200 T 600 160 T 725 190 T 850 205"
              fill="none"
              stroke="#65A30D"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Kitchen Line (Purple) - Peaks at 22 on Friday */}
            {/* Values approx: 14, 16, 19, 17, 22, 19, 16 */}
            <path
              d="M 100 238 Q 160 232, 225 228 T 350 215 T 475 222 T 600 200 T 725 215 T 850 228"
              fill="none"
              stroke="#9333EA"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Nodes on Line */}
            {/* Front Desk nodes */}
            <circle cx="100" cy="160" r="3.5" fill="#0284C7" />
            <circle cx="225" cy="140" r="3.5" fill="#0284C7" />
            <circle cx="350" cy="120" r="3.5" fill="#0284C7" />
            <circle cx="475" cy="142" r="3.5" fill="#0284C7" />
            <circle cx="600" cy="95" r="5" fill="#EA580C" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx="725" cy="135" r="3.5" fill="#0284C7" />
            <circle cx="850" cy="148" r="3.5" fill="#0284C7" />

            {/* Housekeeping nodes */}
            <circle cx="100" cy="190" r="3.5" fill="#0D9488" />
            <circle cx="225" cy="180" r="3.5" fill="#0D9488" />
            <circle cx="350" cy="160" r="3.5" fill="#0D9488" />
            <circle cx="475" cy="170" r="3.5" fill="#0D9488" />
            <circle cx="600" cy="135" r="4.5" fill="#0D9488" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="725" cy="170" r="3.5" fill="#0D9488" />
            <circle cx="850" cy="180" r="3.5" fill="#0D9488" />

            {/* Restaurant nodes */}
            <circle cx="100" cy="215" r="3" fill="#65A30D" />
            <circle cx="225" cy="205" r="3" fill="#65A30D" />
            <circle cx="350" cy="185" r="3" fill="#65A30D" />
            <circle cx="475" cy="200" r="3" fill="#65A30D" />
            <circle cx="600" cy="160" r="4" fill="#65A30D" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="725" cy="190" r="3" fill="#65A30D" />
            <circle cx="850" cy="205" r="3" fill="#65A30D" />

            {/* Kitchen nodes */}
            <circle cx="100" cy="238" r="3" fill="#9333EA" />
            <circle cx="225" cy="228" r="3" fill="#9333EA" />
            <circle cx="350" cy="215" r="3" fill="#9333EA" />
            <circle cx="475" cy="222" r="3" fill="#9333EA" />
            <circle cx="600" cy="200" r="4" fill="#9333EA" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="725" cy="215" r="3" fill="#9333EA" />
            <circle cx="850" cy="228" r="3" fill="#9333EA" />
          </svg>

          {/* Peak Demand Badge on top of Apr 25 line */}
          <div className="absolute top-1 left-[63%] -translate-x-1/2 bg-red-100 text-red-700 text-[11px] font-bold px-2 py-0.5 rounded shadow-2xs border border-red-200">
            Peak Demand
          </div>

          {/* Interactive Inspection Tooltip (exact match to Image 1) */}
          <div className="absolute top-10 left-[66%] bg-white rounded-lg p-3 shadow-lg border border-slate-200 w-44 z-20 pointer-events-none">
            <div className="text-[11px] font-bold text-slate-800 pb-1.5 border-b border-slate-100 mb-1.5">
              Apr 25, 2025 (Fri)
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0284C7]"></span>
                  <span className="text-slate-600">Front Desk</span>
                </div>
                <div className="font-bold text-slate-900">
                  48 <span className="text-[10px] text-slate-400 font-normal">(46 avail)</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0D9488]"></span>
                  <span className="text-slate-600">Housekeeping</span>
                </div>
                <div className="font-bold text-slate-900">
                  38 <span className="text-[10px] text-slate-400 font-normal">(35 avail)</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#65A30D]"></span>
                  <span className="text-slate-600">Restaurant</span>
                </div>
                <div className="font-bold text-slate-900">
                  32 <span className="text-[10px] text-slate-400 font-normal">(28 avail)</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#9333EA]"></span>
                  <span className="text-slate-600">Kitchen</span>
                </div>
                <div className="font-bold text-slate-900">
                  22 <span className="text-[10px] text-slate-400 font-normal">(20 avail)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* X Axis Date Labels */}
        <div className="flex justify-between pl-12 pr-4 pt-2 text-xs text-slate-600 border-t border-slate-100">
          <div className="text-center"><div>Apr 21</div><div className="text-slate-400 text-[11px]">Mon</div></div>
          <div className="text-center"><div>Apr 22</div><div className="text-slate-400 text-[11px]">Tue</div></div>
          <div className="text-center"><div>Apr 23</div><div className="text-slate-400 text-[11px]">Wed</div></div>
          <div className="text-center"><div>Apr 24</div><div className="text-slate-400 text-[11px]">Thu</div></div>
          <div className="text-center font-bold text-red-600"><div>Apr 25</div><div className="text-[11px]">Fri</div></div>
          <div className="text-center"><div>Apr 26</div><div className="text-slate-400 text-[11px]">Sat</div></div>
          <div className="text-center"><div>Apr 27</div><div className="text-slate-400 text-[11px]">Sun</div></div>
        </div>
      </div>

      {/* Bottom Section: Staffing Forecast Table + Seasonal Demand Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Staffing Forecast Table */}
        <div className="lg:col-span-7 bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Staffing Forecast</h2>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-medium"
              >
                <option value="newest">Date (Newest First)</option>
                <option value="oldest">Date (Oldest First)</option>
                <option value="gap">Staffing Gap</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-400 border-b border-slate-100 font-medium">
                <tr>
                  <th className="py-2.5">Forecast Date</th>
                  <th className="py-2.5">Department</th>
                  <th className="py-2.5 text-center">Predicted Staff Required</th>
                  <th className="py-2.5 text-center">Available Staff</th>
                  <th className="py-2.5 text-center">Staffing Gap</th>
                  <th className="py-2.5 text-right">Forecast Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 font-medium text-slate-800 whitespace-nowrap">{row.date}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: deptColors[row.department] || '#94A3B8' }}
                        ></span>
                        <span className="text-slate-700">{row.department}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-center font-bold text-slate-800 tabular-nums">
                      {row.predictedRequired}
                    </td>
                    <td className="py-2.5 text-center text-slate-600 tabular-nums">
                      {row.availableStaff}
                    </td>
                    <td className="py-2.5 text-center">
                      <span className={`font-bold tabular-nums ${row.gap < 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {row.gap}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        row.status === 'Shortage Expected'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Seasonal Demand Analysis Cards */}
        <div className="lg:col-span-5 bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-bold text-slate-900">Seasonal Demand Analysis</h2>
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <span className="text-xs text-slate-400">(Demo data)</span>
          </div>

          <div className="space-y-3">
            {appState.seasonalFactors.map((factor) => {
              const isPositive = factor.type === 'positive';
              return (
                <div
                  key={factor.id}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 rounded-lg bg-teal-50 text-teal-700 mt-0.5 shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{factor.title}</div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{factor.description}</p>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {factor.dateRange} <span className="mx-1">|</span> {factor.departments}
                        </div>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold tabular-nums shrink-0 ${
                      isPositive
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {factor.impactPercentage > 0 ? `+${factor.impactPercentage}%` : `${factor.impactPercentage}%`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
