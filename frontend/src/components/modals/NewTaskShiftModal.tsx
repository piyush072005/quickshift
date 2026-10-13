import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  CheckSquare, 
  Users,
  Briefcase
} from 'lucide-react';
import { AppState, Department, Shift, HotelTask, ShiftType, TaskPriority } from '../../types';

interface NewTaskShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppState;
  onAddShift: (shift: Shift) => void;
  onAddTask: (task: HotelTask) => void;
}

export const NewTaskShiftModal: React.FC<NewTaskShiftModalProps> = ({
  isOpen,
  onClose,
  appState,
  onAddShift,
  onAddTask,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'shift' | 'task'>('shift');

  // Shift fields
  const [employeeId, setEmployeeId] = useState(appState.employees[0]?.id || '');
  const [department, setDepartment] = useState<Department>('Housekeeping');
  const [date, setDate] = useState('2025-04-23');
  const [time, setTime] = useState('08:00 - 16:00');
  const [shiftType, setShiftType] = useState<ShiftType>('Morning');
  const [status, setStatus] = useState<string>('Confirmed');

  // Task fields
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('High');
  const [taskTimeWindow, setTaskTimeWindow] = useState('09:00 - 13:00');
  const [taskNotes, setTaskNotes] = useState('');
  const [checklistItems, setChecklistItems] = useState<string[]>([
    'Verify standards and safety protocol',
    'Execute operations and log completion'
  ]);
  const [newChecklistInput, setNewChecklistInput] = useState('');

  const handleAddChecklistItem = () => {
    if (!newChecklistInput.trim()) return;
    setChecklistItems([...checklistItems, newChecklistInput.trim()]);
    setNewChecklistInput('');
  };

  const handleRemoveChecklistItem = (idx: number) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'shift') {
      const emp = appState.employees.find((e) => e.id === employeeId);
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayOfWeek = dayNames[new Date(date).getDay()] || 'Wed';

      const newShift: Shift = {
        id: `sh-${Date.now()}`,
        employeeId: status === 'Vacant' ? undefined : emp?.id,
        employeeName: status === 'Vacant' ? 'Vacant / Unassigned' : emp?.name,
        department,
        date,
        dayOfWeek,
        time,
        hours: 8,
        shiftType,
        status: status as any,
        neededStaffCount: status === 'Vacant' ? 1 : undefined,
      };

      onAddShift(newShift);
      onClose();
    } else {
      if (!taskTitle.trim()) {
        alert('Please enter a task title');
        return;
      }

      const emp = appState.employees.find((e) => e.id === employeeId);
      const newTask: HotelTask = {
        id: `tsk-${Date.now()}`,
        title: taskTitle.trim(),
        department,
        assignedEmployeeId: emp?.id,
        assignedEmployeeName: emp?.name,
        date,
        timeWindow: taskTimeWindow,
        priority: taskPriority,
        status: 'Pending',
        checklist: checklistItems.map((text, idx) => ({
          id: `ci-${Date.now()}-${idx}`,
          text,
          completed: false,
        })),
        notes: taskNotes,
        isOfflineCreated: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onAddTask(newTask);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center text-white font-bold">
              +
            </div>
            <div>
              <h2 className="text-sm font-bold">QuickShift Scheduler</h2>
              <p className="text-[11px] text-slate-300">Creates offline persistent records</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Toggle */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 text-xs font-semibold">
          <button
            onClick={() => setMode('shift')}
            className={`flex-1 pb-2.5 border-b-2 text-center transition ${
              mode === 'shift'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Schedule Shift
          </button>
          <button
            onClick={() => setMode('task')}
            className={`flex-1 pb-2.5 border-b-2 text-center transition ${
              mode === 'task'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Operational Task Ticket
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {mode === 'shift' ? (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Employee</label>
                <select
                  value={employeeId}
                  onChange={(e) => {
                    setEmployeeId(e.target.value);
                    const emp = appState.employees.find((x) => x.id === e.target.value);
                    if (emp) setDepartment(emp.department);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-teal-600"
                >
                  {appState.employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="Housekeeping">Housekeeping</option>
                    <option value="Front Desk">Front Desk</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Kitchen">Kitchen</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Shift Type</label>
                  <select
                    value={shiftType}
                    onChange={(e) => setShiftType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Day">Day</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                    <option value="OFF">OFF</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g. 07:00 - 15:00"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="Vacant">Vacant (Needs worker)</option>
                  <option value="Personal Leave">Personal Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Vacation">Vacation</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Presidential Suite Turnover & Inspection"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="Housekeeping">Housekeeping</option>
                    <option value="Front Desk">Front Desk</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Kitchen">Kitchen</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Worker</label>
                  <select
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  >
                    {appState.employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time Window</label>
                  <input
                    type="text"
                    value={taskTimeWindow}
                    onChange={(e) => setTaskTimeWindow(e.target.value)}
                    placeholder="e.g. 09:00 - 12:00"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              {/* Checklist items */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Action Checklist Items</label>
                <div className="space-y-1.5 mb-2">
                  {checklistItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveChecklistItem(idx)}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add step / inspection item..."
                    value={newChecklistInput}
                    onChange={(e) => setNewChecklistInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddChecklistItem();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleAddChecklistItem}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                  >
                    Add Step
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Special Instructions / Notes</label>
                <textarea
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                  placeholder="Optional operational instructions..."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                ></textarea>
              </div>
            </>
          )}

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-700 text-white rounded-lg font-semibold hover:bg-teal-800 shadow-xs"
            >
              Save to Local Database
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
