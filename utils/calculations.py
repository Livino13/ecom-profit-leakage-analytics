"""Thin wrappers so pages read like the spec's example API."""

from __future__ import annotations

import pandas as pd

from .data_processing import (
    calculate_totals,
    calculate_profit_leakage,
    calculate_customer_metrics,
    calculate_product_metrics,
    calculate_country_profit,
    calculate_shipping_metrics,
    calculate_category_metrics,
    calculate_trend,
)


def calculate_total_revenue(df: pd.DataFrame) -> float:
    return float(df["total_price_usd"].sum())


def calculate_total_profit(df: pd.DataFrame) -> float:
    totals = calculate_totals(df)
    return totals["net_profit"]


def calculate_profit_leakage(df: pd.DataFrame) -> dict:
    return calculate_profit_leakage(df)


def calculate_customer_metrics_df(df: pd.DataFrame) -> pd.DataFrame:
    return calculate_customer_metrics(df)


def calculate_product_metrics_df(df: pd.DataFrame) -> pd.DataFrame:
    return calculate_product_metrics(df)


def calculate_country_profit_df(df: pd.DataFrame) -> pd.DataFrame:
    return calculate_country_profit(df)


def calculate_shipping_metrics_df(df: pd.DataFrame) -> pd.DataFrame:
    return calculate_shipping_metrics(df)


def calculate_category_metrics_df(df: pd.DataFrame) -> pd.DataFrame:
    return calculate_category_metrics(df)


def calculate_trend_df(df: pd.DataFrame) -> pd.DataFrame:
    return calculate_trend(df)
