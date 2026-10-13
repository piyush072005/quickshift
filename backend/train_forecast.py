from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error


# ---------------------------------------------------------
# Configuration
# ---------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "hotel_bookings_full.csv"
MODEL_DIR = BASE_DIR / "models"
MODEL_PATH = MODEL_DIR / "arrival_forecast.joblib"

TEST_DAYS = 90
RANDOM_STATE = 42


# ---------------------------------------------------------
# Load and prepare the dataset
# ---------------------------------------------------------

def load_daily_arrivals():
    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found: {DATA_PATH}\n"
            "Place hotel_bookings_full.csv inside backend/data/."
        )

    df = pd.read_csv(DATA_PATH)

    required_columns = [
        "is_canceled",
        "arrival_date_year",
        "arrival_date_month",
        "arrival_date_day_of_month",
    ]

    missing = [c for c in required_columns if c not in df.columns]

    if missing:
        raise ValueError(f"Missing required columns: {missing}")

    month_map = {
        "January": 1,
        "February": 2,
        "March": 3,
        "April": 4,
        "May": 5,
        "June": 6,
        "July": 7,
        "August": 8,
        "September": 9,
        "October": 10,
        "November": 11,
        "December": 12,
    }

    month_numbers = df["arrival_date_month"].map(month_map)

    if month_numbers.isna().any():
        raise ValueError("Unexpected value in arrival_date_month.")

    arrival_dates = pd.to_datetime(
        {
            "year": df["arrival_date_year"].astype(int),
            "month": month_numbers.astype(int),
            "day": df["arrival_date_day_of_month"].astype(int),
        },
        errors="raise",
    )

    # Use completed, non-cancelled reservations as the target proxy.
    non_cancelled = df.loc[df["is_canceled"] == 0].copy()
    non_cancelled["arrival_date"] = arrival_dates.loc[
        non_cancelled.index
    ]

    daily = (
        non_cancelled.groupby("arrival_date")
        .size()
        .sort_index()
    )

    if daily.empty:
        raise ValueError("No non-cancelled bookings were found.")

    # Include dates with zero recorded arrivals.
    full_dates = pd.date_range(
        start=daily.index.min(),
        end=daily.index.max(),
        freq="D",
    )

    daily = daily.reindex(full_dates, fill_value=0).astype(float)
    daily.index.name = "date"
    daily.name = "arrivals"

    print(f"Source rows: {len(df):,}")
    print(f"Non-cancelled reservations: {len(non_cancelled):,}")
    print(f"Daily observations: {len(daily):,}")
    print(f"Date range: {daily.index.min().date()} to "
          f"{daily.index.max().date()}")

    return daily


# ---------------------------------------------------------
# Feature engineering — every feature uses past information
# ---------------------------------------------------------

def make_features(series):
    dates = series.index

    features = pd.DataFrame(index=dates)

    features["day_of_week"] = dates.dayofweek
    features["day_of_month"] = dates.day
    features["month"] = dates.month
    features["day_of_year"] = dates.dayofyear
    features["is_weekend"] = (dates.dayofweek >= 5).astype(int)

    # Represent yearly seasonality smoothly.
    features["year_sin"] = np.sin(
        2 * np.pi * dates.dayofyear / 365.25
    )
    features["year_cos"] = np.cos(
        2 * np.pi * dates.dayofyear / 365.25
    )

    # Trend relative to the beginning of the available series.
    features["trend_day"] = np.arange(len(series))

    # Lag features: historical arrivals, never today's target.
    for lag in [1, 7, 14, 28]:
        features[f"lag_{lag}"] = series.shift(lag)

    # Shift first so the current date's actual arrivals are excluded.
    past_values = series.shift(1)

    features["rolling_mean_7"] = past_values.rolling(7).mean()
    features["rolling_mean_28"] = past_values.rolling(28).mean()
    features["rolling_std_7"] = past_values.rolling(7).std()

    return features


# ---------------------------------------------------------
# Evaluation helpers
# ---------------------------------------------------------

def calculate_metrics(actual, predicted):
    actual = np.asarray(actual, dtype=float)
    predicted = np.maximum(np.asarray(predicted, dtype=float), 0)

    mae = mean_absolute_error(actual, predicted)
    rmse = np.sqrt(mean_squared_error(actual, predicted))

    total_actual = np.abs(actual).sum()
    wape = (
        np.abs(actual - predicted).sum() / total_actual * 100
        if total_actual > 0
        else float("nan")
    )

    return {
        "mae": round(float(mae), 3),
        "rmse": round(float(rmse), 3),
        "wape_percent": round(float(wape), 2),
    }


# ---------------------------------------------------------
# Train, evaluate and save
# ---------------------------------------------------------

def main():
    daily = load_daily_arrivals()
    features = make_features(daily)

    # Remove early dates where lag/rolling features are unavailable.
    valid = features.notna().all(axis=1)
    X = features.loc[valid]
    y = daily.loc[valid]

    if len(X) <= TEST_DAYS + 30:
        raise ValueError(
            "Not enough daily observations for training and testing."
        )

    test_days = min(TEST_DAYS, max(30, int(len(X) * 0.20)))
    test_start = X.index[-test_days]

    X_train = X.loc[X.index < test_start]
    y_train = y.loc[y.index < test_start]

    X_test = X.loc[X.index >= test_start]
    y_test = y.loc[y.index >= test_start]

    print("\nChronological evaluation")
    print(f"Training observations: {len(X_train):,}")
    print(f"Testing observations: {len(X_test):,}")
    print(f"Test start: {test_start.date()}")

    # Baseline: average arrivals across the preceding seven days.
    baseline_predictions = X_test["rolling_mean_7"].to_numpy()

    baseline_metrics = calculate_metrics(
        y_test,
        baseline_predictions,
    )

    # First ML model: Random Forest regression.
    model = RandomForestRegressor(
        n_estimators=350,
        max_depth=12,
        min_samples_leaf=3,
        max_features=0.9,
        random_state=RANDOM_STATE,
        n_jobs=-1,
    )

    model.fit(X_train, y_train)

    ml_predictions = np.maximum(model.predict(X_test), 0)

    model_metrics = calculate_metrics(
        y_test,
        ml_predictions,
    )

    print("\n--- Baseline: 7-day moving average ---")
    print(f"MAE:  {baseline_metrics['mae']}")
    print(f"RMSE: {baseline_metrics['rmse']}")
    print(f"WAPE: {baseline_metrics['wape_percent']}%")

    print("\n--- Random Forest ---")
    print(f"MAE:  {model_metrics['mae']}")
    print(f"RMSE: {model_metrics['rmse']}")
    print(f"WAPE: {model_metrics['wape_percent']}%")

    if model_metrics["mae"] < baseline_metrics["mae"]:
        print("\nResult: Random Forest has lower test MAE.")
    elif model_metrics["mae"] > baseline_metrics["mae"]:
        print("\nResult: The moving-average baseline has lower test MAE.")
    else:
        print("\nResult: Both have equal test MAE.")

    # Refit the final model on all available historical examples.
    final_model = RandomForestRegressor(
        n_estimators=350,
        max_depth=12,
        min_samples_leaf=3,
        max_features=0.9,
        random_state=RANDOM_STATE,
        n_jobs=-1,
    )

    final_model.fit(X, y)

    bundle = {
        "model": final_model,
        "feature_columns": list(X.columns),
        "last_date": daily.index[-1].strftime("%Y-%m-%d"),
        "history_dates": [
            date.strftime("%Y-%m-%d")
            for date in daily.index
        ],
        "history_arrivals": daily.astype(float).tolist(),
        "target": "daily_non_cancelled_arrivals",
        "test_days": int(test_days),
        "metrics": {
            "baseline_7_day_average": baseline_metrics,
            "random_forest": model_metrics,
        },
    }

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(bundle, MODEL_PATH)

    print(f"\nSaved model to: {MODEL_PATH}")
    print("Model training and evaluation completed.")


if __name__ == "__main__":
    main()