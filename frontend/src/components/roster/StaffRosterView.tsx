import React, { useState } from 'react';
import { Employee, Shift } from '../../types';

interface StaffRosterViewProps {
  employees: Employee[];
  onOpenSmartRoster: () => void;
  onTriggerToast: (msg: string) => void;
  onUpdateShift: (shiftId: string, updates: Partial<Shift>) => void;
  onNavigateTab?: (tab: any) => void;
}

export const StaffRosterView: React.FC<StaffRosterViewProps> = ({
  employees,
  onOpenSmartRoster,
  onTriggerToast,
  onUpdateShift,
  onNavigateTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [shiftFilter, setShiftFilter] = useState('ALL');
  const [selectedShift, setSelectedShift] = useState<{
    shift: Shift;
    employee: Employee;
  } | null>(null);

  // Initialize selectedShift to Pooja Nair's Wednesday shift for instant rich inspector view
  React.useEffect(() => {
    if (!selectedShift && employees.length > 2) {
      const pooja = employees.find(e => e.name === 'Pooja Nair') || employees[2];
      const wedShift = pooja.shifts.find(s => s.dayIndex === 2) || pooja.shifts[2];
      setSelectedShift({ shift: wedShift, employee: pooja });
    }
  }, [employees]);

  const days = [
    { name: 'Mon', date: 'Apr 21', isToday: false },
    { name: 'Tue', date: 'Apr 22', isToday: false },
    { name: 'Wed', date: 'Apr 23', isToday: true },
    { name: 'Thu', date: 'Apr 24', isToday: false },
    { name: 'Fri', date: 'Apr 25', isToday: false },
    { name: 'Sat', date: 'Apr 26', isToday: false },
    { name: 'Sun', date: 'Apr 27', isToday: false },
  ];

  // Filtering
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = 
      searchTerm === '' ||
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = deptFilter === 'ALL' || emp.department === deptFilter;

    let matchesShift = true;
    if (shiftFilter === 'Vacant') {
      matchesShift = emp.shifts.some(s => s.status === 'Vacant');
    } else if (shiftFilter !== 'ALL') {
      matchesShift = emp.shifts.some(s => s.shiftLabel.toLowerCase() === shiftFilter.toLowerCase());
    }

    return matchesSearch && matchesDept && matchesShift;
  });

  const handleExport = () => {
    onTriggerToast('Exporting weekly roster matrix to QuickShift_Roster_Apr21_27.csv...');
  };

  const handleFillWithAI = (shift: Shift) => {
    onUpdateShift(shift.id, {
      status: 'Confirmed',
      shiftLabel: 'Morning',
      timeRange: '08:00 - 16:00',
      role: 'Staffed by Floater (Priya Sharma)',
      staffNeeded: 0,
    });
    onTriggerToast(`AI assigned top candidate Priya Sharma to ${shift.role}!`);
    if (selectedShift) {
      setSelectedShift({
        ...selectedShift,
        shift: {
          ...selectedShift.shift,
          status: 'Confirmed',
          shiftLabel: 'Morning',
          timeRange: '08:00 - 16:00',
          role: 'Staffed by Floater (Priya Sharma)',
        }
      });
    }
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Top Utility & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Staff Roster & Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage weekly shift rotations, staff coverage, and real-time vacancies across departments.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Week Date Picker */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl shadow-2xs p-1">
            <button 
              onClick={() => onTriggerToast('Jumped to current week (Apr 21 – Apr 27)')}
              className="px-3 py-1 rounded-lg text-xs font-bold text-teal-700 hover:bg-slate-50 transition-colors"
            >
              Today
            </button>
            <div className="h-4 w-px bg-slate-200 mx-1"></div>
            <button 
              onClick={() => onTriggerToast('Viewing shifts for Apr 14 – Apr 20, 2025')}
              className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-50"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <span className="text-xs font-bold text-slate-800 px-2 select-none">
              Apr 21, 2025 – Apr 27, 2025
            </span>
            <button 
              onClick={() => onTriggerToast('Viewing shifts for Apr 28 – May 04, 2025')}
              className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-50"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl shadow-2xs text-xs font-semibold transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">file_download</span>
            <span>Export</span>
          </button>

          <button
            onClick={onOpenSmartRoster}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-sm text-xs font-semibold transition-all group active:scale-[0.99]"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:rotate-12 transition-transform">
              auto_awesome
            </span>
            <span>Generate Smart Roster</span>
          </button>
        </div>
      </div>

      {/* Filter & Metric Strip */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white border border-slate-200/90 p-2.5 rounded-xl shadow-2xs mb-5">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search */}
          <div className="relative min-w-[240px] flex-1 max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-2 text-[18px] text-slate-400">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by employee name or role..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 text-slate-800 placeholder:text-slate-400 text-xs rounded-lg outline-none focus:bg-white focus:ring-1 focus:ring-teal-500 border border-slate-200"
            />
          </div>

          {/* Department Filter */}
          <div className="relative">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="appearance-none bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold py-1.5 pl-3 pr-8 rounded-lg outline-none cursor-pointer border border-slate-200"
            >
              <option value="ALL">All Departments</option>
              <option value="Housekeeping">Housekeeping (2)</option>
              <option value="Front Desk">Front Desk (3)</option>
              <option value="Restaurant">Restaurant (1)</option>
              <option value="Kitchen">Kitchen (2)</option>
              <option value="Maintenance">Maintenance (1)</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-2 text-[16px] text-slate-400 pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Shift Type Filter */}
          <div className="relative">
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="appearance-none bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold py-1.5 pl-3 pr-8 rounded-lg outline-none cursor-pointer border border-slate-200"
            >
              <option value="ALL">All Shift Types</option>
              <option value="Morning">Morning (06:00 - 15:00)</option>
              <option value="Day">Day (09:00 - 18:00)</option>
              <option value="Evening">Evening (14:00 - 22:00)</option>
              <option value="Vacant">Unfilled / Vacant Only</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-2 text-[16px] text-slate-400 pointer-events-none">
              expand_more
            </span>
          </div>
        </div>

        {/* Real-time metrics counters */}
        <div className="flex items-center gap-4 px-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-teal-600"></span>
            <span>Scheduled: <strong className="text-slate-900 font-bold">58/63</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span className="text-rose-600 font-bold">5 Vacancies</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            <span>AI Efficiency: <strong className="text-indigo-600 font-bold">96.4%</strong></span>
          </div>
        </div>
      </div>

      {/* 7-Day Matrix Table */}
      <div className="relative w-full overflow-x-auto rounded-xl shadow-2xs border border-slate-200/90 bg-white">
        <div className="min-w-[1240px]">
          {/* Calendar Headers */}
          <div className="grid grid-cols-[220px_130px_repeat(7,1fr)] bg-slate-50/80 text-slate-700 text-xs font-bold py-2.5 px-3 border-b border-slate-200 select-none">
            <div className="uppercase tracking-wider text-[11px] text-slate-400 pl-1 flex items-center">
              Employee
            </div>
            <div className="uppercase tracking-wider text-[11px] text-slate-400 flex items-center">
              Department
            </div>
            {days.map((d, i) => (
              <div
                key={i}
                className={`text-center py-0.5 rounded-lg ${
                  d.isToday ? 'bg-teal-50 text-teal-800 font-extrabold ring-1 ring-teal-300/60' : 'text-slate-700'
                }`}
              >
                <div className="text-[11px] uppercase tracking-wider">{d.name}</div>
                <div className="text-xs font-black flex items-center justify-center gap-1">
                  {d.date}
                  {d.isToday && <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>}
                </div>
              </div>
            ))}
          </div>

          {/* Roster Rows */}
          <div className="divide-y divide-slate-100">
            {filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                className="grid grid-cols-[220px_130px_repeat(7,1fr)] items-center px-3 py-2 hover:bg-slate-50/60 transition-colors"
              >
                {/* Employee Info */}
                <div className="flex items-center gap-2.5 pl-1">
                  <img
                    src={emp.avatarUrl}
                    alt={emp.name}
                    className="w-9 h-9 rounded-full object-cover shadow-2xs ring-1 ring-slate-200"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">{emp.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {emp.role} • {emp.totalWeeklyHours}h
                    </div>
                  </div>
                </div>

                {/* Department Tag */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      emp.department === 'Housekeeping'
                        ? 'bg-teal-600'
                        : emp.department === 'Front Desk'
                        ? 'bg-sky-500'
                        : emp.department === 'Restaurant'
                        ? 'bg-emerald-500'
                        : emp.department === 'Kitchen'
                        ? 'bg-indigo-600'
                        : 'bg-slate-500'
                    }`}
                  ></span>
                  <span>{emp.department}</span>
                </div>

                {/* 7 Days Shifts */}
                {emp.shifts.map((shift, dayIdx) => {
                  const isSelected = selectedShift?.shift.id === shift.id;
                  const isTodayCol = days[dayIdx].isToday;

                  if (shift.status === 'Vacant') {
                    return (
                      <div key={shift.id} className={`p-1 ${isTodayCol ? 'bg-teal-50/30 rounded-lg' : ''}`}>
                        <div
                          onClick={() => setSelectedShift({ shift, employee: emp })}
                          className={`
                            p-2 rounded-lg cursor-pointer transition-all shadow-2xs flex flex-col gap-0.5 border
                            bg-rose-50/90 hover:bg-rose-100/90 border-rose-200 text-rose-950
                            ${isSelected ? 'ring-2 ring-rose-500' : ''}
                          `}
                        >
                          <span className="text-[11px] font-extrabold text-rose-600 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">warning</span>
                            Open Shift
                          </span>
                          <span className="text-[10px] text-rose-800 font-semibold leading-tight">
                            {shift.staffNeeded || 1} staff needed
                          </span>
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-rose-600 font-bold mt-0.5">
                            <span className="material-symbols-outlined text-[11px]">lock_open</span> Vacant
                          </span>
                        </div>
                      </div>
                    );
                  }

                  if (shift.status === 'Leave' || shift.status === 'Sick Leave' || shift.status === 'Vacation' || shift.status === 'Unavailability') {
                    return (
                      <div key={shift.id} className={`p-1 ${isTodayCol ? 'bg-teal-50/30 rounded-lg' : ''}`}>
                        <div
                          onClick={() => setSelectedShift({ shift, employee: emp })}
                          className="bg-slate-100/80 text-slate-500 p-2 rounded-lg flex flex-col items-center justify-center gap-0.5 h-full min-h-[58px] cursor-pointer hover:bg-slate-200/80 transition-colors"
                        >
                          <span className="text-[11px] font-bold flex items-center gap-1 text-slate-600">
                            <span className="material-symbols-outlined text-[13px]">event_busy</span>
                            OFF
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium truncate max-w-[90px]">
                            {shift.role}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  // Confirmed shift styling per department
                  const getDeptShiftBg = () => {
                    if (emp.department === 'Housekeeping') return 'bg-teal-50/90 hover:bg-teal-100/90 text-teal-900 border-teal-200/60';
                    if (emp.department === 'Front Desk') return 'bg-sky-50/90 hover:bg-sky-100/90 text-sky-900 border-sky-200/60';
                    if (emp.department === 'Restaurant') return 'bg-emerald-50/90 hover:bg-emerald-100/90 text-emerald-900 border-emerald-200/60';
                    if (emp.department === 'Kitchen') return 'bg-indigo-50/90 hover:bg-indigo-100/90 text-indigo-900 border-indigo-200/60';
                    return 'bg-slate-100/90 hover:bg-slate-200/90 text-slate-900 border-slate-200/60';
                  };

                  return (
                    <div key={shift.id} className={`p-1 ${isTodayCol ? 'bg-teal-50/30 rounded-lg' : ''}`}>
                      <div
                        onClick={() => setSelectedShift({ shift, employee: emp })}
                        className={`
                          p-2 rounded-lg cursor-pointer transition-all shadow-2xs flex flex-col gap-0.5 border
                          ${getDeptShiftBg()}
                          ${isSelected ? 'ring-2 ring-teal-600 shadow-sm' : ''}
                        `}
                      >
                        <span className="text-[11px] font-bold leading-tight">
                          {shift.timeRange}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium leading-tight">
                          {shift.shiftLabel}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-teal-700 font-bold mt-0.5">
                          <span className="material-symbols-outlined text-[12px]">check_circle</span>
                          Confirmed
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table Footnote & Department/Status Legend */}
      <div className="mt-4 flex flex-col lg:flex-row items-center justify-between gap-4 px-1">
        <span className="text-xs text-slate-500">
          Showing <strong className="text-slate-900 font-bold">{filteredEmployees.length} of {employees.length}</strong> active roster employees • Next sync in 12 min
        </span>

        {/* Legend */}
        <div className="flex items-center flex-wrap gap-x-5 gap-y-2 text-xs">
          <div className="flex items-center gap-3 text-slate-600 text-[11px] font-medium">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sky-500"></span> Front Desk</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal-600"></span> Housekeeping</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Restaurant</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-600"></span> Kitchen</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-500"></span> Maintenance</span>
          </div>

          <div className="h-3.5 w-px bg-slate-300 hidden sm:block"></div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-teal-700 font-bold">
              <span className="material-symbols-outlined text-[13px]">check_circle</span> Confirmed
            </span>
            <span className="flex items-center gap-1 text-rose-600 font-bold">
              <span className="material-symbols-outlined text-[13px]">warning</span> Vacant (Shortage)
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <span className="material-symbols-outlined text-[13px]">event_busy</span> Leave / Unavailable
            </span>
          </div>
        </div>
      </div>

      {/* Floating / Docked Shift Details Inspector Panel */}
      {selectedShift && (
        <div className="fixed right-6 bottom-6 z-40 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-5 animate-in slide-in-from-bottom-6 duration-200">
          <div className="flex items-start justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm ring-1 ring-teal-200">
                {selectedShift.employee.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 leading-tight">
                  {selectedShift.shift.status === 'Vacant' ? 'Open Unfilled Shift' : selectedShift.employee.name}
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {selectedShift.employee.department} • {selectedShift.employee.role}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedShift(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              aria-label="Close details"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Shift Metadata */}
          <div className="flex flex-col gap-2.5 py-3 my-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-2 text-xs text-slate-800">
              <span className="material-symbols-outlined text-[16px] text-teal-700">calendar_today</span>
              <span className="font-semibold">{selectedShift.shift.dayName}, {selectedShift.shift.dateStr}, 2025</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-800">
              <span className="material-symbols-outlined text-[16px] text-teal-700">schedule</span>
              <span>{selectedShift.shift.timeRange} ({selectedShift.shift.duration})</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-800">
              <span className="material-symbols-outlined text-[16px] text-indigo-600">dinner_dining</span>
              <span>{selectedShift.shift.role}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
              <span className="text-[10px] uppercase font-bold text-slate-400">Shift Status</span>
              {selectedShift.shift.status === 'Vacant' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  <span className="material-symbols-outlined text-[13px]">warning</span>
                  Vacant ({selectedShift.shift.staffNeeded || 1} Needed)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  <span className="material-symbols-outlined text-[13px]">check_circle</span>
                  {selectedShift.shift.status}
                </span>
              )}
            </div>
          </div>

          {/* AI Staffing Recommendations pill */}
          <div className="mb-4 p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs text-slate-700">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-indigo-600">psychology</span>
              <span>Predicted Dining Demand: <strong className="text-slate-900 font-bold">Peak (+18%)</strong></span>
            </div>
            <span className="text-teal-700 font-bold text-[11px]">Adequate</span>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onTriggerToast(`Editing shift for ${selectedShift.employee.name}`)}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors text-center"
            >
              Edit
            </button>
            <button
              onClick={() => onTriggerToast(`Reassigned shift for ${selectedShift.employee.name}`)}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors text-center"
            >
              Reassign
            </button>
            {selectedShift.shift.status === 'Vacant' ? (
              <button
                onClick={() => handleFillWithAI(selectedShift.shift)}
                className="flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors text-center shadow-xs flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                <span>Fill AI</span>
              </button>
            ) : (
              <button
                onClick={() => onTriggerToast('AI verified staffing coverage for this rotation.')}
                className="flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors text-center shadow-xs"
              >
                Optimize
              </button>
            )}
          </div>

          {/* Quick WhatsApp Dispatch Action */}
          {onNavigateTab && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => onNavigateTab('whatsapp-simulator')}
                className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <span className="material-symbols-outlined text-[16px] text-emerald-600">chat</span>
                <span>Dispatch Shift via WhatsApp Simulator</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
