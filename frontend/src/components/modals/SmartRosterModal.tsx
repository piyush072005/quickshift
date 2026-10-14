import React, { useEffect, useState } from 'react';
import type { Employee } from '../../types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const DEPARTMENTS = [
  'Housekeeping',
  'Front Desk',
  'Restaurant',
  'Kitchen',
] as const;

type Department = (typeof DEPARTMENTS)[number];

interface DepartmentAssignment {
  required_staff: number;
  assigned_staff: number;
  assigned_employees: string[];
  unfilled_positions: number;
  status: string;
}

interface RosterDay {
  date: string;
  predicted_arrivals: number;
  departments: Record<Department, DepartmentAssignment>;
}

export interface OptimizedRosterResponse {
  status: string;
  solver_status: string;
  model: string;
  training_data_last_date: string;
  horizon_days: number;
  daily_roster: RosterDay[];
  employee_total_shifts: Record<string, number>;
  summary: {
    required_positions: number;
    assigned_positions: number;
    unfilled_positions: number;
  };
  note: string;
  optimization?: {
    coverage_positions: number;
    fairness_cost: number;
    repeated_previous_assignments: number;
    priorities: string[];
  };
}

interface SmartRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onApplyRoster: (result: OptimizedRosterResponse) => void;
}

const WORKLOAD: Record<Department, number> = {
  Housekeeping: 15,
  'Front Desk': 60,
  Restaurant: 30,
  Kitchen: 40,
};

const UNAVAILABLE_STATUSES = new Set([
  'Leave',
  'Sick Leave',
  'Vacation',
  'Unavailability',
]);

const isOptimizerRestDay = (shift: Employee['shifts'][number]) =>
  shift.status === 'Unavailability' &&
  shift.role === 'Rest day' &&
  shift.shiftLabel === 'OFF';

export const SmartRosterModal: React.FC<SmartRosterModalProps> = ({
  isOpen,
  onClose,
  employees,
  onApplyRoster,
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] =
    useState<OptimizedRosterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(false);
      setResult(null);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const runOptimization = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const eligibleEmployees = employees.filter((employee) =>
        (DEPARTMENTS as readonly string[]).includes(
          employee.department.trim()
        )
      );

      if (eligibleEmployees.length === 0) {
        throw new Error(
          'No employees are available in the four supported departments.'
        );
      }

      const normalizedNames = eligibleEmployees.map((employee) =>
        employee.name.trim().toLowerCase()
      );

      if (new Set(normalizedNames).size !== normalizedNames.length) {
        throw new Error(
          'Employee names must be unique to generate a roster.'
        );
      }

      const apiEmployees = eligibleEmployees.map((employee) => {
        const unavailableDays = [
          ...new Set(
            employee.shifts
              .filter(
                (shift) =>
                  UNAVAILABLE_STATUSES.has(shift.status) &&
                  !isOptimizerRestDay(shift)
              )
              .map((shift) => shift.dayIndex + 1)
              .filter((day) => day >= 1 && day <= 7)
          ),
        ];

        const previousAssignedDays = [
          ...new Set(
            employee.shifts
              .filter((shift) => shift.status === 'Confirmed')
              .map((shift) => shift.dayIndex + 1)
              .filter((day) => day >= 1 && day <= 7)
          ),
        ];

        return {
          name: employee.name.trim(),
          departments: [employee.department.trim()],
          unavailable_days: unavailableDays,
          previous_assigned_days: previousAssignedDays,
          max_shifts: Math.min(
            5,
            Math.max(
              0,
              Math.ceil((employee.totalWeeklyHours || 40) / 8)
            )
          ),
        };
      });

      const response = await fetch(
        `${API_BASE_URL}/api/optimize-staffing-schedule`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            horizon_days: 7,
            bookings_per_staff_per_day: WORKLOAD,
            employees: apiEmployees,
          }),
        }
      );

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        const detail = body.detail;

        throw new Error(
          typeof detail === 'string'
            ? detail
            : detail
              ? JSON.stringify(detail)
              : `Optimization failed with HTTP ${response.status}.`
        );
      }

      if (
        body.status !== 'success' ||
        !Array.isArray(body.daily_roster) ||
        !body.summary
      ) {
        throw new Error(
          'The backend returned an unexpected optimization response.'
        );
      }

      setResult(body as OptimizedRosterResponse);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to generate the optimized roster.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!result) {
      return;
    }

    onApplyRoster(result);
    onClose();
  };

  const formatDate = (date: string) =>
    new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const coveragePercent =
    result && result.summary.required_positions > 0
      ? Math.round(
          (result.summary.assigned_positions /
            result.summary.required_positions) *
            100
        )
      : result
        ? 100
        : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="smart-roster-title"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xl">
                auto_awesome
              </span>
            </div>

            <div>
              <h2
                id="smart-roster-title"
                className="text-base sm:text-lg font-bold text-slate-900"
              >
                AI Smart Roster Optimizer
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Forecast-driven staff allocation and workload balancing
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close dialog"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-xl">
              close
            </span>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Input summary */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wide text-slate-400">
                Forecast horizon
              </p>
              <p className="text-sm font-bold text-slate-800 mt-1">
                7 days
              </p>
            </div>

            <div className="border-x border-slate-200 px-3">
              <p className="text-[10px] uppercase font-bold tracking-wide text-slate-400">
                Eligible staff
              </p>
              <p className="text-sm font-bold text-slate-800 mt-1">
                {
                  employees.filter((employee) =>
                    (
                      DEPARTMENTS as readonly string[]
                    ).includes(employee.department.trim())
                  ).length
                }
              </p>
            </div>

            <div className="pl-1">
              <p className="text-[10px] uppercase font-bold tracking-wide text-slate-400">
                Engine
              </p>
              <p className="text-sm font-bold text-teal-700 mt-1">
                OR-Tools
              </p>
            </div>
          </div>

          {!result && !loading && !error && (
            <div className="rounded-xl border border-slate-200 p-5">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-teal-600 text-2xl">
                  psychology
                </span>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Ready to optimize staffing
                  </h3>

                  <p className="text-xs leading-relaxed text-slate-500 mt-1">
                    The backend will use the trained arrival forecast,
                    employee department eligibility, availability,
                    shift limits, and workload assumptions to generate
                    a proposed roster.
                  </p>

                  <p className="text-xs leading-relaxed text-slate-500 mt-2">
                    The optimizer supports Housekeeping, Front Desk,
                    Restaurant, and Kitchen. Review shortages before
                    applying the proposed assignments.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Real processing state */}
          {loading && (
            <div
              role="status"
              className="rounded-xl border border-teal-200 bg-teal-50/60 p-6 text-center"
            >
              <span className="material-symbols-outlined text-4xl text-teal-700 animate-spin">
                progress_activity
              </span>

              <h3 className="text-sm font-bold text-slate-900 mt-3">
                Optimizing your roster
              </h3>

              <p className="text-xs text-slate-600 mt-1">
                Sending employee availability and workload assumptions
                to the scheduling engine...
              </p>
            </div>
          )}

          {/* API error */}
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 p-4"
            >
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-rose-600">
                  error
                </span>

                <div>
                  <h3 className="text-sm font-bold text-rose-800">
                    Optimization failed
                  </h3>

                  <p className="text-xs leading-relaxed text-rose-700 mt-1">
                    {error}
                  </p>

                  <p className="text-xs text-rose-600 mt-2">
                    Check that FastAPI is running and that the backend
                    accepts the current request schema.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actual results from the backend */}
          {result && (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Optimization results
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Model: {result.model}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Solver status: {result.solver_status}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold ${
                    result.summary.unfilled_positions > 0
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {result.summary.unfilled_positions > 0
                    ? 'Shortages remain'
                    : 'Demand covered'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-[10px] text-slate-500">
                    Required positions
                  </p>
                  <p className="text-xl font-extrabold text-slate-900 mt-1">
                    {result.summary.required_positions}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-[10px] text-slate-500">
                    Assigned positions
                  </p>
                  <p className="text-xl font-extrabold text-teal-700 mt-1">
                    {result.summary.assigned_positions}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-[10px] text-slate-500">
                    Unfilled positions
                  </p>
                  <p className="text-xl font-extrabold text-rose-600 mt-1">
                    {result.summary.unfilled_positions}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-[10px] text-slate-500">
                    Coverage
                  </p>
                  <p className="text-xl font-extrabold text-slate-900 mt-1">
                    {coveragePercent}%
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <h4 className="text-sm font-bold text-slate-900">
                    Proposed daily assignments
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Expand a day to review its department assignments.
                  </p>
                </div>

                <div className="divide-y divide-slate-200">
                  {result.daily_roster.map((day) => (
                    <details key={day.date} className="group">
                      <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-50">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {formatDate(day.date)}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {Math.round(day.predicted_arrivals)} predicted
                            arrivals
                          </p>
                        </div>

                        <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform">
                          expand_more
                        </span>
                      </summary>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50/60">
                        {DEPARTMENTS.map((department) => {
                          const assignment =
                            day.departments[department];

                          if (!assignment) {
                            return (
                              <div
                                key={department}
                                className="rounded-lg border border-amber-200 bg-amber-50 p-3"
                              >
                                <p className="text-sm font-bold text-amber-800">
                                  {department}
                                </p>
                                <p className="text-xs text-amber-700 mt-1">
                                  No department result was returned.
                                </p>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={department}
                              className="rounded-lg border border-slate-200 bg-white p-3"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <h5 className="text-sm font-bold text-slate-800">
                                  {department}
                                </h5>

                                <span
                                  className={`text-[10px] font-bold rounded-full px-2 py-1 ${
                                    assignment.unfilled_positions > 0
                                      ? 'bg-rose-50 text-rose-700'
                                      : 'bg-emerald-50 text-emerald-700'
                                  }`}
                                >
                                  {assignment.unfilled_positions > 0
                                    ? `${assignment.unfilled_positions} unfilled`
                                    : 'Covered'}
                                </span>
                              </div>

                              <p className="text-xs text-slate-500 mt-2">
                                Required: {assignment.required_staff}
                                {' · '}
                                Assigned: {assignment.assigned_staff}
                              </p>

                              <div className="flex flex-wrap gap-1.5 mt-3">
                                {assignment.assigned_employees.length > 0 ? (
                                  assignment.assigned_employees.map(
                                    (name) => (
                                      <span
                                        key={name}
                                        className="rounded-md bg-teal-50 text-teal-800 border border-teal-100 px-2 py-1 text-[11px] font-medium"
                                      >
                                        {name}
                                      </span>
                                    )
                                  )
                                ) : (
                                  <span className="text-xs text-slate-400">
                                    No employees assigned
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </details>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <h4 className="text-sm font-bold text-slate-900">
                  Shifts per employee
                </h4>

                <div className="flex flex-wrap gap-2 mt-3">
                  {Object.entries(
                    result.employee_total_shifts
                  ).map(([name, shifts]) => (
                    <div
                      key={name}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2"
                    >
                      <p className="text-xs text-slate-700">{name}</p>
                      <p className="text-sm font-bold text-slate-900 mt-1">
                        {shifts} {shifts === 1 ? 'shift' : 'shifts'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {result.optimization && (
                <div className="rounded-xl border border-slate-200 p-4">
                  <h4 className="text-sm font-bold text-slate-900">
                    Optimization details
                  </h4>

                  <p className="text-xs text-slate-500 mt-2">
                    Previous employee/day assignments repeated:{' '}
                    <span className="font-semibold text-slate-800">
                      {result.optimization.repeated_previous_assignments}
                    </span>
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Workload fairness score:{' '}
                    <span className="font-semibold text-slate-800">
                      {result.optimization.fairness_cost}
                    </span>
                    {' · '}lower is better for the same coverage.
                  </p>
                </div>
              )}

              <p className="text-xs text-slate-500 leading-relaxed">
                {result.note}
              </p>

              <p className="text-xs text-slate-500 leading-relaxed">
                This is a proposed roster. Applying it changes the
                current in-memory roster; permanent storage and
                operational compliance checks must be handled separately.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200/80 disabled:opacity-50"
          >
            {result ? 'Close without applying' : 'Cancel'}
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {result && (
              <button
                type="button"
                onClick={runOptimization}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-100 disabled:opacity-50"
              >
                Run again
              </button>
            )}

            {!result ? (
              <button
                type="button"
                onClick={runOptimization}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-sm font-semibold flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-lg">
                      progress_activity
                    </span>
                    Optimizing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">
                      play_arrow
                    </span>
                    Run Optimization
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleApply}
                className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">
                  done_all
                </span>
                Apply to Live Roster
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};