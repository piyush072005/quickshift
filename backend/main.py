from random import SystemRandom
from math import ceil, isfinite

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from ortools.sat.python import cp_model

from forecast_model import (
    forecast_from_history,
    forecast_from_saved_history,
)
from whatsapp_routes import router as whatsapp_router


app = FastAPI(
    title="QuickShift API",
    description="Hotel demand forecasting and workforce scheduling",
    version="0.1.0",
)

app.include_router(whatsapp_router)


# ---------- CORS ----------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3002",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Request schemas ----------

class ForecastRequest(BaseModel):
    historical_bookings: list[float] = Field(min_length=7)
    horizon_days: int = Field(default=7, ge=1, le=30)


class MLForecastRequest(BaseModel):
    historical_bookings: list[float] = Field(min_length=28)
    horizon_days: int = Field(default=7, ge=1, le=30)


class ScheduleRequest(BaseModel):
    employee_names: list[str] = Field(min_length=1)
    days: int = Field(default=7, ge=1, le=14)

    shift_requirements: dict[str, int] = Field(
        default_factory=lambda: {
            "Morning": 2,
            "Afternoon": 2,
            "Night": 1,
        }
    )

    min_shifts_per_employee: int = Field(default=3, ge=0)
    max_shifts_per_employee: int = Field(default=5, ge=1)


class StaffingDemandRequest(BaseModel):
    horizon_days: int = Field(default=7, ge=1, le=30)

    bookings_per_staff_per_day: dict[str, float] = Field(
        ...,
        description=(
            "Assumed daily booking workload per staff member "
            "for each department."
        ),
    )

    available_staff: dict[str, int] = Field(
        ...,
        description="Number of staff available per department per day.",
    )

    min_shifts_per_employee: int = Field(default=3, ge=0)
    max_shifts_per_employee: int = Field(default=5, ge=1)


class RosterEmployeeRequest(BaseModel):
    name: str = Field(min_length=1)

    departments: list[str] = Field(
        min_length=1,
        description="Departments this employee can work in.",
    )

    unavailable_days: list[int] = Field(
        default_factory=list,
        description="Unavailable day numbers, starting at 1.",
    )

    previous_assigned_days: list[int] = Field(
        default_factory=list,
        description=(
            "Days assigned in the previous roster, starting at 1. "
            "Used to prefer rotation when otherwise equally good."
        ),
    )

    max_shifts: int = Field(default=5, ge=0, le=14)


class OptimizedStaffingScheduleRequest(BaseModel):
    horizon_days: int = Field(default=7, ge=1, le=14)

    bookings_per_staff_per_day: dict[str, float]

    employees: list[RosterEmployeeRequest] = Field(min_length=1)


# ---------- Health check ----------

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "application": "QuickShift API",
    }


# ---------- Demand forecasting baseline ----------

@app.post("/api/forecast")
def forecast_demand(request: ForecastRequest):
    """
    Seven-day moving-average baseline.

    This is a statistical baseline, not a trained ML model.
    """

    history = request.historical_bookings

    if any(not isfinite(value) or value < 0 for value in history):
        raise HTTPException(
            status_code=422,
            detail="Historical booking counts must be finite and non-negative.",
        )

    recent_values = history[-7:]
    forecasts = []

    for _ in range(request.horizon_days):
        prediction = round(
            sum(recent_values) / len(recent_values),
            2,
        )

        forecasts.append(prediction)
        recent_values = recent_values[1:] + [prediction]

    return {
        "model": "7-day moving-average baseline",
        "is_trained_ml_model": False,
        "forecast_days": request.horizon_days,
        "historical_points_received": len(history),
        "predicted_daily_bookings": forecasts,
        "note": (
            "Booking forecasts are not employee counts. Workforce "
            "requirements must be calibrated separately."
        ),
    }


# ---------- General shift scheduling ----------

@app.post("/api/schedule")
def optimize_schedule(request: ScheduleRequest):
    """
    Generate a weekly roster using Google OR-Tools CP-SAT.

    Constraints:
    - Meet staffing requirements for each shift.
    - At most one shift per employee per day.
    - Enforce weekly minimum and maximum shift limits.
    """

    names = [name.strip() for name in request.employee_names]

    if any(not name for name in names):
        raise HTTPException(
            status_code=422,
            detail="Employee names cannot be blank.",
        )

    if len(set(name.casefold() for name in names)) != len(names):
        raise HTTPException(
            status_code=422,
            detail="Employee names must be unique.",
        )

    if (
        request.min_shifts_per_employee
        > request.max_shifts_per_employee
    ):
        raise HTTPException(
            status_code=422,
            detail="Minimum shifts cannot exceed maximum shifts.",
        )

    requirements = request.shift_requirements

    if not requirements:
        raise HTTPException(
            status_code=422,
            detail="Provide at least one shift requirement.",
        )

    if any(not shift.strip() for shift in requirements):
        raise HTTPException(
            status_code=422,
            detail="Shift names cannot be blank.",
        )

    if any(
        not isinstance(count, int)
        or isinstance(count, bool)
        or count < 0
        for count in requirements.values()
    ):
        raise HTTPException(
            status_code=422,
            detail="Staffing requirements must be non-negative integers.",
        )

    shift_names = list(requirements.keys())
    num_employees = len(names)
    num_days = request.days
    num_shifts = len(shift_names)

    total_required = num_days * sum(requirements.values())

    if (
        total_required
        > num_employees * request.max_shifts_per_employee
    ):
        raise HTTPException(
            status_code=422,
            detail=(
                "Not enough employee capacity for the requested staffing."
            ),
        )

    if (
        total_required
        < num_employees * request.min_shifts_per_employee
    ):
        raise HTTPException(
            status_code=422,
            detail=(
                "Minimum weekly shift requirements exceed available work."
            ),
        )

    model = cp_model.CpModel()

    work = {
        (e, d, s): model.NewBoolVar(f"work_{e}_{d}_{s}")
        for e in range(num_employees)
        for d in range(num_days)
        for s in range(num_shifts)
    }

    # Meet each shift's staffing requirement.
    for d in range(num_days):
        for s, shift_name in enumerate(shift_names):
            model.Add(
                sum(
                    work[e, d, s]
                    for e in range(num_employees)
                )
                == requirements[shift_name]
            )

    # At most one shift per employee per day.
    for e in range(num_employees):
        for d in range(num_days):
            model.Add(
                sum(
                    work[e, d, s]
                    for s in range(num_shifts)
                )
                <= 1
            )

    # Weekly minimum and maximum shifts.
    for e in range(num_employees):
        weekly_shifts = sum(
            work[e, d, s]
            for d in range(num_days)
            for s in range(num_shifts)
        )

        model.Add(
            weekly_shifts >= request.min_shifts_per_employee
        )
        model.Add(
            weekly_shifts <= request.max_shifts_per_employee
        )

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 5.0

    status = solver.Solve(model)

    if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        raise HTTPException(
            status_code=422,
            detail=(
                "No feasible roster found. Check staffing requirements "
                "and weekly workload limits."
            ),
        )

    schedule = []

    for d in range(num_days):
        day_schedule = {"day": d + 1, "shifts": {}}

        for s, shift_name in enumerate(shift_names):
            assigned = [
                names[e]
                for e in range(num_employees)
                if solver.Value(work[e, d, s]) == 1
            ]

            day_schedule["shifts"][shift_name] = assigned

        schedule.append(day_schedule)

    employee_totals = {
        names[e]: sum(
            solver.Value(work[e, d, s])
            for d in range(num_days)
            for s in range(num_shifts)
        )
        for e in range(num_employees)
    }

    return {
        "status": "success",
        "solver_status": solver.StatusName(status),
        "days": num_days,
        "schedule": schedule,
        "employee_total_shifts": employee_totals,
        "total_assigned_shifts": total_required,
    }


# ---------- POST: forecast using supplied historical data ----------

@app.post("/api/forecast-ml")
def forecast_ml(request: MLForecastRequest):
    try:
        return forecast_from_history(
            request.historical_bookings,
            request.horizon_days,
        )

    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=503,
            detail="Trained model is missing. Train it first.",
        ) from exc

    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc


# ---------- Staffing demand calculation ----------

@app.post("/api/staffing-demand")
def calculate_staffing_demand(request: StaffingDemandRequest):
    departments = [
        "Housekeeping",
        "Front Desk",
        "Restaurant",
        "Kitchen",
    ]

    missing_workload = [
        dept for dept in departments
        if dept not in request.bookings_per_staff_per_day
    ]

    missing_availability = [
        dept for dept in departments
        if dept not in request.available_staff
    ]

    if missing_workload or missing_availability:
        raise HTTPException(
            status_code=422,
            detail={
                "missing_workload_departments": missing_workload,
                "missing_availability_departments": missing_availability,
            },
        )

    for dept in departments:
        workload = request.bookings_per_staff_per_day[dept]
        available = request.available_staff[dept]

        if not isfinite(workload) or workload <= 0:
            raise HTTPException(
                status_code=422,
                detail=(
                    f"Workload for {dept} must be finite "
                    "and greater than zero."
                ),
            )

        if (
            not isinstance(available, int)
            or isinstance(available, bool)
            or available < 0
        ):
            raise HTTPException(
                status_code=422,
                detail=(
                    f"Available staff for {dept} must be "
                    "a non-negative integer."
                ),
            )

    try:
        forecast_result = forecast_from_saved_history(
            request.horizon_days
        )
    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=503,
            detail="Trained forecast model is missing.",
        ) from exc
    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc

    daily_results = []

    for forecast_day in forecast_result["forecast"]:
        predicted_reservations = max(
            0.0,
            float(forecast_day["predicted_arrivals"]),
        )

        department_results = []

        for dept in departments:
            workload = request.bookings_per_staff_per_day[dept]
            available = request.available_staff[dept]

            required = ceil(predicted_reservations / workload)
            gap = available - required

            department_results.append({
                "department": dept,
                "required_staff": required,
                "available_staff": available,
                "staffing_gap": gap,
                "shortage": max(0, required - available),
                "status": (
                    "Shortage Expected"
                    if gap < 0
                    else "Covered"
                ),
            })

        daily_results.append({
            "date": forecast_day["date"],
            "predicted_booking_records": round(
                predicted_reservations, 2
            ),
            "departments": department_results,
        })

    return {
        "model": forecast_result["model"],
        "training_data_last_date": (
            forecast_result["training_data_last_date"]
        ),
        "forecast": daily_results,
        "workload_assumptions": (
            request.bookings_per_staff_per_day
        ),
        "available_staff_assumptions": request.available_staff,
        "note": (
            "This is a prototype staffing estimate. The historical dataset "
            "does not contain live bookings for a specific hotel. Workload "
            "ratios and staff availability are supplied assumptions and "
            "must be validated with actual hotel data."
        ),
    }


# ---------- GET: forecast from the saved ML model ----------

@app.get("/api/forecast-ml")
def forecast_ml_saved(horizon_days: int = 7):
    if not 1 <= horizon_days <= 30:
        raise HTTPException(
            status_code=422,
            detail="horizon_days must be between 1 and 30.",
        )

    try:
        return forecast_from_saved_history(horizon_days)

    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=503,
            detail="Trained model is missing. Train it first.",
        ) from exc

    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc


# ---------- Optimized staffing schedule ----------

@app.post("/api/optimize-staffing-schedule")
def optimize_staffing_schedule(
    request: OptimizedStaffingScheduleRequest,
):
    departments = [
        "Housekeeping",
        "Front Desk",
        "Restaurant",
        "Kitchen",
    ]

    # Validate workload assumptions.
    missing = [
        dept for dept in departments
        if dept not in request.bookings_per_staff_per_day
    ]

    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"Missing workload ratios for: {missing}",
        )

    for dept in departments:
        ratio = request.bookings_per_staff_per_day[dept]

        if not isfinite(ratio) or ratio <= 0:
            raise HTTPException(
                status_code=422,
                detail=f"Workload ratio for {dept} must be positive.",
            )

    # Validate employee names.
    employees = request.employees
    names = [employee.name.strip() for employee in employees]

    if any(not name for name in names):
        raise HTTPException(
            status_code=422,
            detail="Employee names cannot be blank.",
        )

    if len(set(name.casefold() for name in names)) != len(names):
        raise HTTPException(
            status_code=422,
            detail="Employee names must be unique.",
        )

    department_set = set(departments)

    # Validate department eligibility and day numbers.
    for employee in employees:
        if not employee.departments:
            raise HTTPException(
                status_code=422,
                detail=f"{employee.name} needs an eligible department.",
            )

        unknown = set(employee.departments) - department_set

        if unknown:
            raise HTTPException(
                status_code=422,
                detail=(
                    f"Unknown departments for {employee.name}: "
                    f"{sorted(unknown)}"
                ),
            )

        invalid_days = [
            day for day in employee.unavailable_days
            if day < 1 or day > request.horizon_days
        ]

        if invalid_days:
            raise HTTPException(
                status_code=422,
                detail=(
                    f"Unavailable days for {employee.name} "
                    f"must be between 1 and {request.horizon_days}."
                ),
            )

        invalid_previous_days = [
            day for day in employee.previous_assigned_days
            if day < 1 or day > request.horizon_days
        ]

        if invalid_previous_days:
            raise HTTPException(
                status_code=422,
                detail=(
                    f"Previous assigned days for {employee.name} "
                    f"must be between 1 and {request.horizon_days}."
                ),
            )

    # Retrieve forecasts from the saved model.
    try:
        forecast_result = forecast_from_saved_history(
            request.horizon_days
        )
    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=503,
            detail="Trained forecast model is missing.",
        ) from exc
    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc

    forecast_days = forecast_result["forecast"]

    # Calculate daily staffing demand.
    required_by_day = []

    for forecast_day in forecast_days:
        predicted_arrivals = max(
            0.0,
            float(forecast_day["predicted_arrivals"]),
        )

        daily_requirements = {}

        for dept in departments:
            ratio = request.bookings_per_staff_per_day[dept]
            daily_requirements[dept] = ceil(
                predicted_arrivals / ratio
            )

        required_by_day.append(daily_requirements)

    # ---------- Build the OR-Tools model ----------

    model = cp_model.CpModel()

    employee_count = len(employees)
    day_count = request.horizon_days
    department_count = len(departments)

    # assign[e, d, p] = 1 when employee e works in
    # department p on day d.
    assign = {
        (e, d, p): model.NewBoolVar(
            f"assign_e{e}_d{d}_p{p}"
        )
        for e in range(employee_count)
        for d in range(day_count)
        for p in range(department_count)
    }

    # Employees can work in eligible departments only.
    # Preserve genuine unavailable days.
    # An employee can work at most one department per day.
    for e, employee in enumerate(employees):
        eligible_departments = set(employee.departments)
        unavailable = set(employee.unavailable_days)

        for d in range(day_count):
            for p, dept in enumerate(departments):
                if (
                    dept not in eligible_departments
                    or d + 1 in unavailable
                ):
                    model.Add(assign[e, d, p] == 0)

            model.Add(
                sum(
                    assign[e, d, p]
                    for p in range(department_count)
                ) <= 1
            )

        # Respect maximum weekly shifts.
        model.Add(
            sum(
                assign[e, d, p]
                for d in range(day_count)
                for p in range(department_count)
            ) <= employee.max_shifts
        )

    # Do not assign more employees than the estimated
    # staffing requirement for a department on a given day.
    for d in range(day_count):
        for p, dept in enumerate(departments):
            model.Add(
                sum(
                    assign[e, d, p]
                    for e in range(employee_count)
                ) <= required_by_day[d][dept]
            )

    # ---------- Multi-stage optimization ----------

    # Each stage preserves the best objective values achieved
    # by the earlier stages.
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 10.0

    def solve_or_raise():
        result_status = solver.Solve(model)

        if result_status not in (
            cp_model.OPTIMAL,
            cp_model.FEASIBLE,
        ):
            raise HTTPException(
                status_code=422,
                detail=(
                    "The scheduling optimizer could not find "
                    "a feasible roster. Check staffing demand, "
                    "employee availability, and shift limits."
                ),
            )

        return result_status

    # STAGE 1: Maximize the number of positions covered.
    coverage_expression = sum(assign.values())
    model.Maximize(coverage_expression)

    status = solve_or_raise()
    best_coverage = solver.Value(coverage_expression)

    # Keep staffing coverage at the level achieved above.
    model.Add(coverage_expression == best_coverage)

    # STAGE 2: Balance shift totals between employees.
    #
    # We minimize the sum of squared shift totals.
    # For example, totals [3, 3, 3] have a lower squared
    # total than [5, 2, 2], encouraging a more even workload.
    fairness_terms = []

    for e, employee in enumerate(employees):
        employee_total = sum(
            assign[e, d, p]
            for d in range(day_count)
            for p in range(department_count)
        )

        # For each k, indicator_k is 1 if the employee works
        # at least k shifts. Sum of (2*k - 1) is total_shifts squared.
        for k in range(1, employee.max_shifts + 1):
            works_at_least_k = model.NewBoolVar(
                f"employee_{e}_works_at_least_{k}"
            )

            model.Add(
                employee_total >= k * works_at_least_k
            )

            model.Add(
                employee_total
                <= (k - 1)
                + employee.max_shifts * works_at_least_k
            )

            fairness_terms.append(
                (2 * k - 1) * works_at_least_k
            )

    max_fairness_cost = sum(
        employee.max_shifts ** 2
        for employee in employees
    )

    fairness_cost = model.NewIntVar(
        0,
        max_fairness_cost,
        "fairness_cost",
    )

    model.Add(
        fairness_cost == sum(fairness_terms)
    )

    model.Minimize(fairness_cost)

    status = solve_or_raise()
    best_fairness = solver.Value(fairness_cost)

    # Preserve the best achieved workload balance.
    model.Add(fairness_cost == best_fairness)

    # STAGE 3: Avoid repeating the same employee/day assignment.
    #
    # The frontend sends previous_assigned_days for each employee.
    # Penalize assigning that employee on those same day numbers.
    repeated_assignment_terms = []

    for e, employee in enumerate(employees):
        for day_number in set(employee.previous_assigned_days):
            d = day_number - 1

            repeated_assignment_terms.extend(
                assign[e, d, p]
                for p in range(department_count)
            )

    repeat_count = model.NewIntVar(
        0,
        employee_count * day_count,
        "repeat_assignment_count",
    )

    model.Add(
        repeat_count == sum(repeated_assignment_terms)
    )

    model.Minimize(repeat_count)

    status = solve_or_raise()
    best_repeat_count = solver.Value(repeat_count)

    # Preserve the best achieved rotation preference.
    model.Add(repeat_count == best_repeat_count)

    # STAGE 4: Randomized tie-breaker.
    #
    # All previous priorities are fixed. Random coefficients
    # allow alternative schedules when several assignments
    # are otherwise equally good.
    rng = SystemRandom()

    tie_break_expression = sum(
        rng.randint(1, 1000) * variable
        for variable in assign.values()
    )

    model.Minimize(tie_break_expression)

    status = solve_or_raise()

    # ---------- Build the daily roster ----------

    daily_roster = []
    total_required = 0
    total_assigned = 0
    total_shortages = 0

    for d, forecast_day in enumerate(forecast_days):
        department_results = {}

        for p, dept in enumerate(departments):
            assigned_names = [
                names[e]
                for e in range(employee_count)
                if solver.Value(assign[e, d, p]) == 1
            ]

            required = required_by_day[d][dept]
            assigned_count = len(assigned_names)
            shortage = max(0, required - assigned_count)

            total_required += required
            total_assigned += assigned_count
            total_shortages += shortage

            department_results[dept] = {
                "required_staff": required,
                "assigned_staff": assigned_count,
                "assigned_employees": assigned_names,
                "unfilled_positions": shortage,
                "status": (
                    "Shortage Expected"
                    if shortage > 0
                    else "Covered"
                ),
            }

        daily_roster.append({
            "date": forecast_day["date"],
            "predicted_arrivals": (
                forecast_day["predicted_arrivals"]
            ),
            "departments": department_results,
        })

    # Count assigned shifts for each employee.
    employee_totals = {
        names[e]: sum(
            solver.Value(assign[e, d, p])
            for d in range(day_count)
            for p in range(department_count)
        )
        for e in range(employee_count)
    }

    return {
        "status": "success",
        "solver_status": solver.StatusName(status),
        "model": forecast_result["model"],
        "training_data_last_date": (
            forecast_result["training_data_last_date"]
        ),
        "horizon_days": request.horizon_days,
        "daily_roster": daily_roster,
        "employee_total_shifts": employee_totals,
        "summary": {
            "required_positions": total_required,
            "assigned_positions": total_assigned,
            "unfilled_positions": total_shortages,
        },
        "workload_assumptions": (
            request.bookings_per_staff_per_day
        ),
        "optimization": {
            "coverage_positions": best_coverage,
            "fairness_cost": best_fairness,
            "repeated_previous_assignments": best_repeat_count,
            "priorities": [
                "maximize staffing coverage",
                "balance employee workloads",
                "avoid repeating previous employee/day assignments",
                "randomized tie-break between equally scored schedules",
            ],
        },
        "note": (
            "Prototype schedule based on historical arrival forecasts "
            "and configurable workload assumptions. Workload ratios "
            "must be validated using actual hotel operations. "
            "The solver respects department eligibility, unavailable "
            "days and maximum shifts, but does not yet model shift "
            "timings or minimum rest intervals."
        ),
    }