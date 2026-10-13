import React, { useState } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Sparkles, 
  Plus,
  Check, 
  AlertTriangle, 
  Lock, 
  Clock, 
  Calendar,
  X,
  UserCheck
} from 'lucide-react';
import { AppState, Department, Shift, ShiftType, Employee } from '../../types';

interface ScheduleViewProps {
  appState: AppState;
  onUpdateShift: (shift: Shift) => void;
  onDeleteShift: (shiftId: string) => void;
  onGenerateSmartRoster: () => void;
  onOpenNewShiftModal: () => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  appState,
  onUpdateShift,
  onDeleteShift,
  onGenerateSmartRoster,
  onOpenNewShiftModal,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('All Departments');
  const [selectedShiftType, setSelectedShiftType] = useState<string>('All Shift Types');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit popover state
  const [isEditing, setIsEditing] = useState(false);
  const [editEmployeeName, setEditEmployeeName] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editStatus, setEditStatus] = useState<string>('Confirmed');

  const daysHeader = [
    { day: 'Mon', date: 'Apr 21', fullDate: '2025-04-21' },
    { day: 'Tue', date: 'Apr 22', fullDate: '2025-04-22' },
    { day: 'Wed', date: 'Apr 23', fullDate: '2025-04-23', isToday: true },
    { day: 'Thu', date: 'Apr 24', fullDate: '2025-04-24' },
    { day: 'Fri', date: 'Apr 25', fullDate: '2025-04-25' },
    { day: 'Sat', date: 'Apr 26', fullDate: '2025-04-26' },
    { day: 'Sun', date: 'Apr 27', fullDate: '2025-04-27' },
  ];

  const handleExport = () => {
    const csvRows = ['Employee,Department,Date,Shift,Time,Status'];
    appState.shifts.forEach((s) => {
      csvRows.push(`"${s.employeeName || 'Vacant'}","${s.department}","${s.date}","${s.shiftType}","${s.time}","${s.status}"`);
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quickshift-schedule-apr21-27.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSmartRoster = () => {
    onGenerateSmartRoster();
    setToastMessage('Smart Roster optimization complete! Open shifts filled.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenShiftDetails = (shift: Shift) => {
    setSelectedShift(shift);
    setEditEmployeeName(shift.employeeName || '');
    setEditTime(shift.time);
    setEditStatus(shift.status);
    setIsEditing(false);
  };

  const handleSaveShiftEdit = () => {
    if (!selectedShift) return;
    const updated: Shift = {
      ...selectedShift,
      employeeName: editEmployeeName,
      time: editTime,
      status: editStatus as any,
      neededStaffCount: editStatus === 'Vacant' ? 1 : undefined,
    };
    onUpdateShift(updated);
    setSelectedShift(updated);
    setIsEditing(false);
    setToastMessage('Shift updated & stored in local database.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCancelShift = () => {
    if (!selectedShift) return;
    const updated: Shift = {
      ...selectedShift,
      status: 'Vacant',
      time: 'Open shift — 1 staff needed',
      neededStaffCount: 1,
    };
    onUpdateShift(updated);
    setSelectedShift(null);
    setToastMessage('Shift marked as Vacant.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter employees
  const filteredEmployees = appState.employees.filter((emp) => {
    if (selectedDept !== 'All Departments' && emp.department !== selectedDept) {
      return false;
    }
    if (employeeSearch && !emp.name.toLowerCase().includes(employeeSearch.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Department colors for shift cards
  const getCardStyle = (shift: Shift) => {
    if (shift.status === 'Vacant') {
      return 'bg-amber-50/90 border-amber-300 text-amber-900';
    }
    if (shift.status === 'Personal Leave' || shift.status === 'Vacation' || shift.status === 'Unavailability') {
      return 'bg-slate-50 border-slate-200 text-slate-500';
    }
    if (shift.status === 'Sick Leave') {
      return 'bg-red-50 border-red-200 text-red-700';
    }

    switch (shift.department) {
      case 'Housekeeping':
        return 'bg-[#ecfdf5] border-teal-200 text-teal-950 hover:border-teal-400';
      case 'Front Desk':
        return 'bg-[#eff6ff] border-blue-200 text-blue-950 hover:border-blue-400';
      case 'Restaurant':
        return 'bg-[#f0fdf4] border-lime-200 text-emerald-950 hover:border-emerald-400';
      case 'Kitchen':
        return 'bg-[#faf5ff] border-purple-200 text-purple-950 hover:border-purple-400';
      case 'Maintenance':
        return 'bg-[#f8fafc] border-slate-200 text-slate-900 hover:border-slate-400';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-800';
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-[1700px] mx-auto relative">
      {/* Toast */}
      {toastMessage && (
        <div className="p-3 bg-teal-700 text-white rounded-xl shadow-md flex items-center justify-between text-xs font-semibold animate-in fade-in">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-white hover:text-teal-200">✕</button>
        </div>
      )}

      {/* Header & Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Schedule</h1>
      </div>

      {/* Controls Bar (matching Image 4) */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Left filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Department dropdown */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium"
          >
            <option>All Departments</option>
            <option>Front Desk</option>
            <option>Housekeeping</option>
            <option>Restaurant</option>
            <option>Kitchen</option>
            <option>Maintenance</option>
          </select>

          {/* Shift Type dropdown */}
          <select
            value={selectedShiftType}
            onChange={(e) => setSelectedShiftType(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium"
          >
            <option>All Shift Types</option>
            <option>Morning</option>
            <option>Day</option>
            <option>Evening</option>
            <option>OFF</option>
          </select>

          {/* Search employee input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search employee..."
              value={employeeSearch}
              onChange={(e) => setEmployeeSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 w-48 focus:outline-teal-600"
            />
          </div>

          <button className="text-xs font-semibold px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition">
            Today
          </button>
        </div>

        {/* Date range picker & Action buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold text-slate-800">Apr 21, 2025 – Apr 27, 2025</span>
          </div>

          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export</span>
          </button>

          <button
            onClick={handleSmartRoster}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-200" />
            <span>Generate Smart Roster</span>
          </button>

          <button
            onClick={onOpenNewShiftModal}
            className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Shift</span>
          </button>
        </div>
      </div>

      {/* Main Weekly Matrix Grid (matching Image 4) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-x-auto">
        <table className="w-full min-w-[1200px] border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700">
              <th className="py-3 px-4 text-left font-bold w-48">Employee</th>
              <th className="py-3 px-3 text-left font-bold w-32">Department</th>
              {daysHeader.map((d) => (
                <th
                  key={d.fullDate}
                  className={`py-3 px-2 text-center font-bold ${
                    d.isToday ? 'bg-teal-50/90 text-teal-900 border-x border-teal-100' : ''
                  }`}
                >
                  <div className="text-xs">{d.day}</div>
                  <div className={`text-[11px] ${d.isToday ? 'font-bold text-teal-800' : 'text-slate-400 font-normal'}`}>
                    {d.date}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEmployees.map((emp) => {
              // Find shifts for this employee for each day
              const empShifts = appState.shifts.filter((s) => s.employeeId === emp.id);

              return (
                <tr key={emp.id} className="hover:bg-slate-50/40 transition">
                  {/* Employee Info */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={emp.avatar}
                        alt={emp.name}
                        className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">{emp.name}</div>
                        <div className="text-[11px] text-slate-400 truncate">{emp.role}</div>
                      </div>
                    </div>
                  </td>

                  {/* Department badge with colored dot */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5 font-medium text-slate-700">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          emp.department === 'Housekeeping'
                            ? 'bg-teal-600'
                            : emp.department === 'Front Desk'
                            ? 'bg-blue-600'
                            : emp.department === 'Restaurant'
                            ? 'bg-lime-600'
                            : emp.department === 'Kitchen'
                            ? 'bg-purple-600'
                            : 'bg-slate-500'
                        }`}
                      ></span>
                      <span>{emp.department}</span>
                    </div>
                  </td>

                  {/* 7 Days Columns */}
                  {daysHeader.map((day) => {
                    const shift = empShifts.find((s) => s.date === day.fullDate);

                    return (
                      <td
                        key={day.fullDate}
                        className={`py-2 px-1.5 align-top ${
                          day.isToday ? 'bg-teal-50/30 border-x border-teal-100/60' : ''
                        }`}
                      >
                        {shift ? (
                          <div
                            onClick={() => handleOpenShiftDetails(shift)}
                            className={`p-2 rounded-lg border transition cursor-pointer select-none min-h-[72px] flex flex-col justify-between ${getCardStyle(
                              shift
                            )}`}
                          >
                            {/* Card Content based on status */}
                            {shift.status === 'Vacant' ? (
                              <>
                                <div>
                                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-800">
                                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                                    <span>Open shift — {shift.neededStaffCount || 1} staff needed</span>
                                  </div>
                                  <div className="text-[10px] text-amber-700">{shift.department}</div>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700 mt-1">
                                  <Lock className="w-2.5 h-2.5" />
                                  <span>Vacant</span>
                                </div>
                              </>
                            ) : shift.shiftType === 'OFF' ? (
                              <div className="flex flex-col justify-center h-full text-center py-2">
                                <div className="text-[11px] font-bold text-slate-500">OFF</div>
                                <div className="text-[10px] text-slate-400 mt-0.5">{shift.status}</div>
                              </div>
                            ) : (
                              <>
                                <div>
                                  <div className="font-bold text-[11px] tabular-nums leading-tight">
                                    {shift.time}
                                  </div>
                                  <div className="text-[10px] font-medium opacity-80">
                                    {shift.shiftType}
                                  </div>
                                  <div className="text-[10px] opacity-70">
                                    {shift.department}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 mt-1">
                                  <Check className="w-3 h-3" />
                                  <span>Confirmed</span>
                                </div>
                              </>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={onOpenNewShiftModal}
                            className="w-full h-16 border border-dashed border-slate-200 rounded-lg hover:border-teal-400 hover:bg-teal-50/20 text-slate-400 hover:text-teal-600 text-xs flex items-center justify-center transition"
                            title="Schedule Shift"
                          >
                            +
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Footer info strip */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
          <span>Showing {filteredEmployees.length} of {appState.employees.length} employees</span>
          <span className="text-[11px] text-slate-400">All shifts synced with local storage</span>
        </div>
      </div>

      {/* Bottom Color & Status Legend (matching Image 4 bottom) */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Front Desk</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span> Housekeeping</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-lime-500"></span> Restaurant</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Kitchen</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span> Maintenance</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Open Shift / Vacancy</div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1 text-emerald-700 font-medium"><Check className="w-3.5 h-3.5" /> Confirmed</div>
          <div className="flex items-center gap-1 text-amber-600 font-medium"><Lock className="w-3.5 h-3.5" /> Vacant</div>
          <div className="flex items-center gap-1 text-red-600 font-medium"><AlertTriangle className="w-3.5 h-3.5" /> Conflict</div>
          <div className="flex items-center gap-1 text-slate-500 font-medium">⊘ Unavailable</div>
        </div>
      </div>

      {/* Shift Details Modal (Bottom Right Popover from Image 4) */}
      {selectedShift && (
        <div className="fixed bottom-6 right-6 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 p-5 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Shift Details</h3>
            <button
              onClick={() => setSelectedShift(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-4 space-y-3">
            {/* Employee Lockup */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
                {selectedShift.employeeName ? selectedShift.employeeName[0] : 'V'}
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">
                  {selectedShift.employeeName || 'Vacant / Unassigned'}
                </div>
                <div className="text-xs text-slate-500">{selectedShift.department}</div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{selectedShift.date} ({selectedShift.dayOfWeek})</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{selectedShift.time} ({selectedShift.hours || 8}h)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 text-center">🌙</span>
                <span>{selectedShift.shiftType} Shift</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 text-center">🏢</span>
                <span>{selectedShift.department}</span>
              </div>
            </div>

            {/* Status Pill */}
            <div className="pt-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                selectedShift.status === 'Confirmed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : selectedShift.status === 'Vacant'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                {selectedShift.status === 'Confirmed' && <Check className="w-3.5 h-3.5" />}
                {selectedShift.status}
              </span>
            </div>

            {/* Edit mode inputs if active */}
            {isEditing && (
              <div className="p-3 bg-slate-50 rounded-lg space-y-2 border border-slate-200 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Time</label>
                  <input
                    type="text"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Vacant">Vacant</option>
                    <option value="Personal Leave">Personal Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveShiftEdit}
                    className="px-3 py-1 text-xs bg-teal-700 text-white font-semibold rounded hover:bg-teal-800"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons (matching Image 4 bottom right) */}
          {!isEditing && (
            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition text-center"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  // Reassign to another worker
                  const otherEmp = appState.employees.find((e) => e.name !== selectedShift.employeeName);
                  if (otherEmp) {
                    const reassigned = {
                      ...selectedShift,
                      employeeId: otherEmp.id,
                      employeeName: otherEmp.name,
                      status: 'Confirmed' as const,
                    };
                    onUpdateShift(reassigned);
                    setSelectedShift(reassigned);
                    setToastMessage(`Reassigned to ${otherEmp.name}`);
                    setTimeout(() => setToastMessage(null), 3000);
                  }
                }}
                className="flex-1 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition text-center"
              >
                Reassign
              </button>
              <button
                onClick={handleCancelShift}
                className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition text-center"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
