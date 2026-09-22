"""USD + number formatting helpers (single source of truth for UI)."""

from __future__ import annotations


def fmt_usd(n: float, decimals: int = 2) -> str:
    """$1,234.56 style, with minus sign for negatives."""
    try:
        v = float(n)
    except (TypeError, ValueError):
        return "$0.00"
    sign = "-" if v < 0 else ""
    return f"{sign}${abs(v):,.{decimals}f}"


def fmt_usd_compact(n: float) -> str:
    """$4.2M / $312.5K / $980 style for KPI cards and axes."""
    try:
        v = float(n)
    except (TypeError, ValueError):
        return "$0"
    sign = "-" if v < 0 else ""
    a = abs(v)
    if a >= 1_000_000_000:
        return f"{sign}${a / 1_000_000_000:.2f}B"
    if a >= 1_000_000:
        return f"{sign}${a / 1_000_000:.2f}M"
    if a >= 1_000:
        return f"{sign}${a / 1_000:.1f}K"
    return f"{sign}${a:,.0f}"


def fmt_int(n) -> str:
    try:
        return f"{int(round(float(n))):,}"
    except (TypeError, ValueError):
        return "0"


def fmt_pct(n: float, decimals: int = 1) -> str:
    try:
        return f"{float(n):.{decimals}f}%"
    except (TypeError, ValueError):
        return "0.0%"
