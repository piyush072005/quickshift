import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Search, 
  Clock, 
  Calendar, 
  User, 
  CheckCircle2, 
  AlertCircle,
  Trash2,
  Edit2,
  HardDrive
} from 'lucide-react';
import { AppState, HotelTask, Department, TaskPriority, TaskStatus } from '../../types';

interface TasksViewProps {
  appState: AppState;
  onAddTask: (task: HotelTask) => void;
  onUpdateTask: (task: HotelTask) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleChecklistItem: (taskId: string, itemId: string) => void;
  onOpenNewTaskModal: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  appState,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleChecklistItem,
  onOpenNewTaskModal,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const filteredTasks = appState.tasks.filter((task) => {
    if (selectedDept !== 'All' && task.department !== selectedDept) return false;
    if (statusFilter !== 'All' && task.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = task.title.toLowerCase().includes(q) ||
                    (task.assignedEmployeeName && task.assignedEmployeeName.toLowerCase().includes(q)) ||
                    task.checklist.some((c) => c.text.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'High':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Medium':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Low':
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'In Progress':
        return 'bg-sky-100 text-sky-800';
      case 'Pending':
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Hotel Task Operations</h1>
          <p className="text-sm text-slate-500">
            Offline-first shift task checklists, room turnover tickets, and departmental compliance items.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200">
            <HardDrive className="w-3.5 h-3.5 text-teal-600" />
            <span>Local Storage Dual-Sync Active</span>
          </div>
          <button
            onClick={onOpenNewTaskModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Hotel Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Department Filter */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-400 font-medium">Department:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium"
            >
              <option value="All">All Departments</option>
              <option value="Housekeeping">Housekeeping</option>
              <option value="Front Desk">Front Desk</option>
              <option value="Restaurant">Restaurant</option>
              <option value="Kitchen">Kitchen</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search tasks, staff or checklist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 w-64 focus:outline-teal-600"
          />
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTasks.map((task) => {
          const completedCount = task.checklist.filter((c) => c.completed).length;
          const totalCount = task.checklist.length;
          const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;

          return (
            <div
              key={task.id}
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs hover:shadow-xs transition flex flex-col justify-between"
            >
              <div>
                {/* Header: Priority, Department, Status */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPriorityBadge(task.priority)}`}>
                    {task.priority} Priority
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">{task.department}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusBadge(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-slate-900 leading-snug mb-2">
                  {task.title}
                </h3>

                {/* Time & Assignee */}
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{task.timeWindow}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{task.assignedEmployeeName || 'Unassigned'}</span>
                  </div>
                </div>

                {/* Checklist Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
                    <span>Checklist Progress</span>
                    <span className="font-bold text-teal-800">{completedCount} / {totalCount} ({percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        percent === 100 ? 'bg-emerald-600' : 'bg-teal-600'
                      }`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Checklist Items (Interactive checkboxes) */}
                <div className="space-y-2 mb-3">
                  {task.checklist.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-start gap-2.5 text-xs cursor-pointer group select-none text-slate-700 hover:text-slate-900"
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => onToggleChecklistItem(task.id, item.id)}
                        className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                      />
                      <span className={`leading-relaxed ${item.completed ? 'line-through text-slate-400' : ''}`}>
                        {item.text}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Notes if present */}
                {task.notes && (
                  <div className="p-2 rounded bg-slate-50 text-[11px] text-slate-500 italic border border-slate-100 mb-2">
                    Note: {task.notes}
                  </div>
                )}
              </div>

              {/* Card Footer: Quick Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span className="text-[10px]">Saved locally</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const newStatus: TaskStatus = task.status === 'Completed' ? 'In Progress' : 'Completed';
                      onUpdateTask({ ...task, status: newStatus });
                    }}
                    className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-[11px]"
                  >
                    {task.status === 'Completed' ? 'Reopen' : 'Mark Done'}
                  </button>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1 rounded text-slate-400 hover:text-red-600"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
