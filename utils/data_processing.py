"""Dataset loading (once) + reusable Pandas aggregations.

Dataset: Global E-Commerce Dataset (+1M records, 2024-2026), XLSX at repo root.
Financial values are USD.

Strategy:
- Needed columns only (keeps memory down).
- First run converts XLSX -> data/processed.parquet (fast Calamine engine).
- Subsequent runs load the parquet cache in seconds.
- All pages share ONE loaded dataframe + precomputed aggregates
  (see get_aggregates); never reload CSV per page.

Leakage definitions (all computed from the dataset, no hardcoded totals):
- Discounts        = SUM(discount_amount_usd)
- Returns/Refunds  = SUM(total_price_usd) WHERE order_status == 'Returned'
- Shipping costs   = SUM(shipping_cost_usd)
- Failed delivery  = SUM(shipping_cost_usd) WHERE delivery_status == 'Failed'
                     (memo subset of shipping; shown separately, and the
                     waterfall splits shipping into successful vs failed so
                     nothing is double counted)
- Payment fees     = SUM(total_price_usd * rate[ payment_method ]) using
                     documented per-method estimates (dataset has no fee
                     column). Labelled "Estimated" in the UI.
"""

from __future__ import annotations

from pathlib import Path
import pandas as pd
import numpy as np

BASE_DIR = Path(__file__).resolve().parent.parent
XLSX_CANDIDATES = [
    BASE_DIR / "ecommerce_dataset_+1m.xlsx",
    BASE_DIR / "data" / "ecommerce_dataset_+1m.xlsx",
]
CACHE_PATH = BASE_DIR / "data" / "processed.parquet"

NEEDED_COLS = [
    "order_id", "order_date", "order_status", "order_priority",
    "customer_id", "customer_name", "customer_segment", "country", "city",
    "product_id", "product_name", "category",
    "unit_price_usd", "quantity", "discount_percent", "discount_amount_usd",
    "total_price_usd", "cost_usd", "profit_usd", "profit_margin_percent", "tax_usd",
    "shipping_method", "shipping_cost_usd", "delivery_days",
    "shipping_country", "delivery_status",
    "payment_method", "payment_status",
    "coupon_used", "return_reason", "rating",
]

# Documented payment-fee estimates by method (dataset has no fee column).
PAYMENT_FEE_RATES = {
    "Credit Card": 0.022,
    "Debit Card": 0.018,
    "PayPal": 0.025,
    "Apple Pay": 0.020,
    "Bank Transfer": 0.010,
}
DEFAULT_FEE_RATE = 0.018


def _find_xlsx() -> Path | None:
    for p in XLSX_CANDIDATES:
        if p.exists():
            return p
    # fallback: any large xlsx at root
    for p in BASE_DIR.glob("*.xlsx"):
        return p
    return None


def _enrich(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["order_date"] = pd.to_datetime(df["order_date"], errors="coerce")
    df["year_month"] = df["order_date"].dt.to_period("M").astype(str)
    df["is_returned"] = df["order_status"].eq("Returned")
    df["is_failed_delivery"] = df["delivery_status"].eq("Failed")
    rates = df["payment_method"].map(PAYMENT_FEE_RATES).fillna(DEFAULT_FEE_RATE)
    df["payment_fee_est_usd"] = (df["total_price_usd"].fillna(0) * rates).round(2)
    # successful vs failed shipping split (no double counting)
    df["shipping_success_usd"] = np.where(
        df["is_failed_delivery"], 0.0, df["shipping_cost_usd"].fillna(0)
    )
    df["shipping_failed_usd"] = np.where(
        df["is_failed_delivery"], df["shipping_cost_usd"].fillna(0), 0.0
    )
    return df


def load_dataset(force_rebuild: bool = False, sample_n: int | None = None) -> pd.DataFrame:
    """Load the dataset once. Uses parquet cache when available."""
    if CACHE_PATH.exists() and not force_rebuild and sample_n is None:
        df = pd.read_parquet(CACHE_PATH)
        return df
    xlsx = _find_xlsx()
    if xlsx is None:
        raise FileNotFoundError(
            "Dataset XLSX not found. Place 'ecommerce_dataset_+1m.xlsx' at repo root or data/."
        )
    read_kwargs: dict = {"engine": "calamine", "usecols": NEEDED_COLS}
    if sample_n is not None:
        read_kwargs["nrows"] = sample_n
    df = pd.read_excel(xlsx, **read_kwargs)
    df = _enrich(df)
    if sample_n is None:
        CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
        df.to_parquet(CACHE_PATH, index=False)
    return df


# ---------------------------------------------------------------- calculations
def calculate_totals(df: pd.DataFrame) -> dict:
    revenue = float(df["total_price_usd"].sum())
    gross_profit = float(df["profit_usd"].sum())
    shipping = float(df["shipping_cost_usd"].sum())
    fees = float(df["payment_fee_est_usd"].sum())
    net_profit = gross_profit - shipping - fees
    orders = int(df["order_id"].nunique())
    aov = revenue / orders if orders else 0.0
    leakage = calculate_profit_leakage(df)
    return {
        "revenue": revenue,
        "gross_profit": gross_profit,
        "net_profit": net_profit,
        "orders": orders,
        "aov": aov,
        "shipping": shipping,
        "fees": fees,
        "leakage_total": leakage["total"],
        "leakage_pct": (leakage["total"] / revenue * 100) if revenue else 0.0,
    }


def calculate_profit_leakage(df: pd.DataFrame) -> dict:
    revenue = float(df["total_price_usd"].sum())
    discounts = float(df["discount_amount_usd"].sum())
    returns = float(df.loc[df["is_returned"], "total_price_usd"].sum())
    shipping = float(df["shipping_cost_usd"].sum())
    failed = float(df.loc[df["is_failed_delivery"], "shipping_cost_usd"].sum())
    shipping_success = shipping - failed
    fees = float(df["payment_fee_est_usd"].sum())
    total = discounts + returns + shipping + fees  # failed is memo subset of shipping
    def pct(x):
        return (x / revenue * 100) if revenue else 0.0
    return {
        "discounts": discounts,
        "returns": returns,
        "shipping": shipping,
        "shipping_success": shipping_success,
        "failed": failed,
        "fees": fees,
        "total": total,
        "discounts_pct": pct(discounts),
        "returns_pct": pct(returns),
        "shipping_pct": pct(shipping),
        "failed_pct": pct(failed),
        "fees_pct": pct(fees),
        "total_pct": pct(total),
        "revenue": revenue,
    }


def calculate_trend(df: pd.DataFrame) -> pd.DataFrame:
    g = (
        df.dropna(subset=["order_date"])
        .groupby("year_month", as_index=False)
        .agg(revenue=("total_price_usd", "sum"), profit=("profit_usd", "sum"),
             orders=("order_id", "nunique"))
        .sort_values("year_month")
    )
    return g


def calculate_country_profit(df: pd.DataFrame) -> pd.DataFrame:
    g = (
        df.groupby("country", as_index=False)
        .agg(revenue=("total_price_usd", "sum"), profit=("profit_usd", "sum"),
             orders=("order_id", "nunique"))
    )
    g["margin"] = np.where(g["revenue"] != 0, g["profit"] / g["revenue"] * 100, 0.0)
    return g.sort_values("profit", ascending=False)


def calculate_shipping_metrics(df: pd.DataFrame) -> pd.DataFrame:
    g = (
        df.groupby("shipping_country", as_index=False)
        .agg(
            shipping_cost=("shipping_cost_usd", "sum"),
            orders=("order_id", "nunique"),
            avg_days=("delivery_days", "mean"),
            failed_orders=("is_failed_delivery", "sum"),
        )
    )
    g["failed_pct"] = np.where(
        g["orders"] != 0, g["failed_orders"] / g["orders"] * 100, 0.0
    )
    return g.sort_values("shipping_cost", ascending=False)


def calculate_category_metrics(df: pd.DataFrame) -> pd.DataFrame:
    g = (
        df.groupby("category", as_index=False)
        .agg(
            revenue=("total_price_usd", "sum"),
            profit=("profit_usd", "sum"),
            orders=("order_id", "nunique"),
            avg_discount=("discount_percent", "mean"),
        )
    )
    g["margin"] = np.where(g["revenue"] != 0, g["profit"] / g["revenue"] * 100, 0.0)
    return g.sort_values("profit", ascending=False)


def calculate_product_metrics(df: pd.DataFrame, top_n: int | None = None) -> pd.DataFrame:
    g = (
        df.groupby(["product_name", "category"], as_index=False)
        .agg(
            revenue=("total_price_usd", "sum"),
            profit=("profit_usd", "sum"),
            orders=("order_id", "nunique"),
            avg_discount=("discount_percent", "mean"),
            returns=("is_returned", "sum"),
        )
    )
    g["margin"] = np.where(g["revenue"] != 0, g["profit"] / g["revenue"] * 100, 0.0)
    g["return_rate"] = np.where(g["orders"] != 0, g["returns"] / g["orders"] * 100, 0.0)
    g = g.sort_values("profit", ascending=False)
    if top_n is not None:
        # keep top winners + worst losers for a balanced ranking chart
        half = max(1, top_n // 2)
        g = pd.concat([g.head(half), g.tail(top_n - half)]).drop_duplicates()
        g = g.sort_values("profit", ascending=False)
    return g


def calculate_customer_metrics(df: pd.DataFrame) -> pd.DataFrame:
    grp = df.groupby("customer_id", as_index=False).agg(
        customer_name=("customer_name", "first"),
        country=("country", "first"),
        city=("city", "first"),
        raw_segment=("customer_segment", "first"),
        revenue=("total_price_usd", "sum"),
        profit=("profit_usd", "sum"),
        orders=("order_id", "nunique"),
        returns=("is_returned", "sum"),
    )
    grp["aov"] = np.where(grp["orders"] != 0, grp["revenue"] / grp["orders"], 0.0)
    grp["return_rate"] = np.where(grp["orders"] != 0, grp["returns"] / grp["orders"] * 100, 0.0)
    grp["clv"] = grp["profit"]  # CLV proxy = lifetime profit contributed
    # Value segments from actual profitability tertiles -> High / Medium / Low
    try:
        grp["segment"] = pd.qcut(grp["profit"], q=3, labels=["Low", "Medium", "High"])
    except ValueError:
        lo, hi = grp["profit"].quantile(0.33), grp["profit"].quantile(0.66)
        grp["segment"] = np.where(
            grp["profit"] >= hi, "High",
            np.where(grp["profit"] >= lo, "Medium", "Low"),
        )
    grp["segment"] = grp["segment"].astype(str)
    return grp


def discount_margin_sample(df: pd.DataFrame, n: int = 5000, seed: int = 42) -> pd.DataFrame:
    cols = ["discount_percent", "profit_margin_percent", "product_name", "category",
            "total_price_usd", "profit_usd"]
    sub = df[cols].dropna()
    if len(sub) > n:
        sub = sub.sample(n, random_state=seed)
    return sub


def get_aggregates(df: pd.DataFrame) -> dict:
    """Compute every page-level aggregate ONCE; pages only read this dict."""
    totals = calculate_totals(df)
    leakage = calculate_profit_leakage(df)
    return {
        "totals": totals,
        "leakage": leakage,
        "trend": calculate_trend(df),
        "country": calculate_country_profit(df),
        "shipping": calculate_shipping_metrics(df),
        "category": calculate_category_metrics(df),
        "products": calculate_product_metrics(df),
        "products_ranked": calculate_product_metrics(df, top_n=16),
        "customers": calculate_customer_metrics(df),
        "scatter": discount_margin_sample(df),
    }
