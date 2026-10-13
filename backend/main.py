from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from ortools.sat.python import cp_model
from forecast_model import (
    forecast_from_history,
    forecast_from_saved_history,
)

app = FastAPI(
    title="QuickShift API",
    description="Hotel demand forecasting and workforce scheduling",
    version="0.1.0",
)

# Allow the local React/Vite frontend to call the backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
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
    historical_bookings: list[float] = Field(
        ..., min_length=28
    )
    horizon_days: int = Field(
        default=7, ge=1, le=30
    )

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

    This is a statistical baseline, NOT a trained ML model.
    A trained model can replace it after we prepare the dataset.
    """

    history = request.historical_bookings

    if any(value < 0 for value in history):
        raise HTTPException(
            status_code=422,
            detail="Historical booking counts cannot be negative.",
        )

    recent_values = history[-7:]
    forecasts = []

    for _ in range(request.horizon_days):
        prediction = sum(recent_values) / len(recent_values)
        prediction = round(prediction, 2)

        forecasts.append(prediction)

        # Recursive forecast for the next day.
        recent_values = recent_values[1:] + [prediction]

    return {
        "model": "7-day moving-average baseline",
        "is_trained_ml_model": False,
        "forecast_days": request.horizon_days,
        "historical_points_received": len(history),
        "predicted_daily_bookings": forecasts,
        "note": (
            "Booking forecasts are not employee counts. "
            "Workforce requirements must be calibrated separately."
        ),
    }


# ---------- Shift scheduling optimization ----------

@app.post("/api/schedule")
def optimize_schedule(request: ScheduleRequest):
    """
    Generate a weekly roster using Google OR-Tools CP-SAT.

    Constraints:
    - Exactly the requested number of staff per shift.
    - No employee works more than one shift per day.
    - Weekly shifts stay within minimum and maximum limits.
    """

    names = [name.strip() for name in request.employee_names]

    if any(not name for name in names):
        raise HTTPException(
            status_code=422,
            detail="Employee names cannot be blank.",
        )

    if len(set(names)) != len(names):
        raise HTTPException(
            status_code=422,
            detail="Employee names must be unique.",
        )

    if request.min_shifts_per_employee > request.max_shifts_per_employee:
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
        not isinstance(count, int) or isinstance(count, bool) or count < 0
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

    if total_required > num_employees * request.max_shifts_per_employee:
        raise HTTPException(
            status_code=422,
            detail="Not enough employee capacity for the requested staffing.",
        )

    if total_required < num_employees * request.min_shifts_per_employee:
        raise HTTPException(
            status_code=422,
            detail="Minimum weekly shift requirements exceed available work.",
        )

    model = cp_model.CpModel()

    # work[e, d, s] is 1 if employee e works shift s on day d.
    work = {
        (e, d, s): model.NewBoolVar(f"work_{e}_{d}_{s}")
        for e in range(num_employees)
        for d in range(num_days)
        for s in range(num_shifts)
    }

    # Constraint 1: meet each shift's staffing requirement.
    for d in range(num_days):
        for s, shift_name in enumerate(shift_names):
            model.Add(
                sum(
                    work[e, d, s]
                    for e in range(num_employees)
                )
                == requirements[shift_name]
            )

    # Constraint 2: at most one shift per employee per day.
    for e in range(num_employees):
        for d in range(num_days):
            model.Add(
                sum(
                    work[e, d, s]
                    for s in range(num_shifts)
                )
                <= 1
            )

    # Constraint 3: weekly minimum and maximum workload.
    for e in range(num_employees):
        weekly_shifts = sum(
            work[e, d, s]
            for d in range(num_days)
            for s in range(num_shifts)
        )

        model.Add(weekly_shifts >= request.min_shifts_per_employee)
        model.Add(weekly_shifts <= request.max_shifts_per_employee)

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