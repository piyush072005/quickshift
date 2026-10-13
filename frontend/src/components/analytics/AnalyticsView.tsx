import React, { useState } from 'react';

interface AnalyticsViewProps {
  onTriggerToast: (msg: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onTriggerToast }) => {
  const [dateRange, setDateRange] = useState('Apr 2025 (MTD)');

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Workforce & Cost Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time audit of hotel labor spend, shift fill rates, and overtime containment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => {
              setDateRange(e.target.value);
              onTriggerToast(`Analytics filtered to ${e.target.value}`);
            }}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 outline-none cursor-pointer shadow-2xs"
          >
            <option>Apr 2025 (MTD)</option>
            <option>Q1 2025 (Jan - Mar)</option>
            <option>Last 30 Days</option>
            <option>Year to Date (2025)</option>
          </select>

          <button
            onClick={() => onTriggerToast('Exported Executive Workforce Analytics to PDF')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs text-xs font-semibold transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Labor Spend</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 tracking-tight">₹4,82,400</span>
            <span className="text-xs font-bold text-emerald-600">↓ 8.2%</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">₹37,600 under projected budget</span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Shift Fill Rate</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 tracking-tight">96.4%</span>
            <span className="text-xs font-bold text-emerald-600">↑ 4.1%</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">58 of 63 scheduled shifts staffed</span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Overtime Rate</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 tracking-tight">3.8%</span>
            <span className="text-xs font-bold text-emerald-600">↓ 7.6%</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Down from 11.4% prior to QuickShift</span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Floater Acceptance</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 tracking-tight">88.5%</span>
            <span className="text-xs font-bold text-emerald-600">↑ 12%</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Avg response time: 24 mins</span>
        </div>
      </div>

      {/* Grid: 2 Large Chart Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
        {/* Left: Overtime vs Regular Hours (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Weekly Scheduled vs. Actual Hours</h2>
              <p className="text-xs text-slate-400">Monitoring labor distribution and overtime risk</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-teal-700"></span> Standard Hours</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span> Overtime Hours</span>
            </div>
          </div>

          {/* Bar Chart Bars */}
          <div className="space-y-3 pt-2">
            {[
              { dept: 'Housekeeping', standard: 380, ot: 18, max: 420 },
              { dept: 'Front Desk', standard: 320, ot: 8, max: 420 },
              { dept: 'Restaurant & Bar', standard: 340, ot: 22, max: 420 },
              { dept: 'Kitchen & Culinary', standard: 360, ot: 24, max: 420 },
              { dept: 'Maintenance', standard: 140, ot: 4, max: 420 },
            ].map((row, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>{row.dept}</span>
                  <span className="text-slate-500 font-normal">
                    {row.standard}h standard <span className="text-amber-700 font-bold">+{row.ot}h OT</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                  <div className="bg-teal-700 h-full" style={{ width: `${(row.standard / row.max) * 100}%` }}></div>
                  <div className="bg-amber-500 h-full" style={{ width: `${(row.ot / row.max) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Department Productivity & Efficiency (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-1">Staffing Cost Efficiency Score</h2>
            <p className="text-xs text-slate-400 mb-4">Algorithmic score based on guest satisfaction vs. labor ratio</p>

            <div className="space-y-3">
              {[
                { name: 'Housekeeping', score: 98, status: 'Optimal' },
                { name: 'Front Desk', score: 96, status: 'Optimal' },
                { name: 'Restaurant & Bar', score: 92, status: 'Good' },
                { name: 'Kitchen Operations', score: 94, status: 'Optimal' },
                { name: 'Facilities & Maintenance', score: 90, status: 'Adequate' },
              ].map((d, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-xs font-bold text-slate-800">{d.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {d.score}%
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">{d.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Overall Hotel Rating: <strong>4.8 / 5.0 ★</strong></span>
            <span className="text-emerald-600 font-bold">Target Exceeded</span>
          </div>
        </div>
      </div>
    </div>
  );
};
