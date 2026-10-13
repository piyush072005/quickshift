from functools import lru_cache
from pathlib import Path

import joblib
import numpy as np
import pandas as pd


MODEL_PATH = (
    Path(__file__).resolve().parent
    / "models"
    / "arrival_forecast.joblib"
)


@lru_cache(maxsize=1)
def load_model_bundle():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Trained model not found at {MODEL_PATH}"
        )

    return joblib.load(MODEL_PATH)


def make_features(series):
    dates = series.index
    features = pd.DataFrame(index=dates)

    features["day_of_week"] = dates.dayofweek
    features["day_of_month"] = dates.day
    features["month"] = dates.month
    features["day_of_year"] = dates.dayofyear
    features["is_weekend"] = (dates.dayofweek >= 5).astype(int)

    features["year_sin"] = np.sin(
        2 * np.pi * dates.dayofyear / 365.25
    )
    features["year_cos"] = np.cos(
        2 * np.pi * dates.dayofyear / 365.25
    )

    features["trend_day"] = np.arange(len(series))

    for lag in [1, 7, 14, 28]:
        features[f"lag_{lag}"] = series.shift(lag)

    past = series.shift(1)

    features["rolling_mean_7"] = past.rolling(7).mean()
    features["rolling_mean_28"] = past.rolling(28).mean()
    features["rolling_std_7"] = past.rolling(7).std()

    return features


def forecast_from_history(historical_bookings, horizon_days):
    values = np.asarray(historical_bookings, dtype=float)

    if values.ndim != 1 or len(values) < 28:
        raise ValueError(
            "Provide at least 28 daily booking counts."
        )

    if not np.isfinite(values).all() or (values < 0).any():
        raise ValueError(
            "Booking counts must be finite, non-negative numbers."
        )

    if not 1 <= horizon_days <= 30:
        raise ValueError("horizon_days must be between 1 and 30.")

    bundle = load_model_bundle()
    model = bundle["model"]
    feature_columns = bundle["feature_columns"]

    # Assumption: input is ordered oldest to newest,
    # and its final value represents yesterday.
    yesterday = pd.Timestamp.today().normalize() - pd.Timedelta(days=1)

    dates = pd.date_range(
        end=yesterday,
        periods=len(values),
        freq="D",
    )

    history = pd.Series(values, index=dates, dtype=float)

    results = []

    for step in range(1, horizon_days + 1):
        next_date = history.index[-1] + pd.Timedelta(days=1)

        # Add a placeholder so features for the future date
        # can be calculated from earlier observations.
        history.loc[next_date] = np.nan

        feature_frame = make_features(history)

        row = feature_frame.loc[
            [next_date], feature_columns
        ].copy()

        # Align the trend feature with the end of the
        # training dataset.
        row["trend_day"] = (
            len(bundle["history_arrivals"]) - 1 + step
        )

        prediction = float(model.predict(row)[0])
        prediction = max(0.0, prediction)

        history.loc[next_date] = prediction

        results.append(
            {
                "date": next_date.strftime("%Y-%m-%d"),
                "predicted_arrivals": round(prediction, 2),
            }
        )

    return {
        "model": "RandomForestRegressor",
        "target": "daily_non_cancelled_arrivals",
        "forecast": results,
        "evaluation": bundle["metrics"],
        "note": (
            "Predicted arrivals are a proxy for workforce demand, "
            "not a direct prediction of required employees."
        ),
    }

def forecast_from_saved_history(horizon_days):
    if not 1 <= horizon_days <= 30:
        raise ValueError("horizon_days must be between 1 and 30.")

    bundle = load_model_bundle()

    model = bundle["model"]
    feature_columns = bundle["feature_columns"]

    # Use the actual daily history saved during model training.
    dates = pd.to_datetime(bundle["history_dates"])
    values = bundle["history_arrivals"]

    history = pd.Series(
        values,
        index=dates,
        dtype=float,
    )

    results = []

    for step in range(1, horizon_days + 1):
        next_date = history.index[-1] + pd.Timedelta(days=1)

        # Add the next date so its lag features can be calculated.
        history.loc[next_date] = np.nan

        feature_frame = make_features(history)

        row = feature_frame.loc[
            [next_date],
            feature_columns,
        ]

        prediction = float(model.predict(row)[0])
        prediction = max(0.0, prediction)

        history.loc[next_date] = prediction

        results.append({
            "date": next_date.strftime("%Y-%m-%d"),
            "predicted_arrivals": round(prediction, 2),
        })

    return {
        "model": "RandomForestRegressor",
        "target": bundle["target"],
        "training_data_last_date": bundle["last_date"],
        "forecast": results,
        "evaluation": bundle["metrics"],
        "note": (
            "Forecast is based on the saved public historical dataset. "
            "It is not a live forecast for a specific hotel. "
            "Predicted arrivals are a proxy for workforce demand."
        ),
    }