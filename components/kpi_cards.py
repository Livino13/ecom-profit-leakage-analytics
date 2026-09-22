"""Reusable KPI / card components."""

from __future__ import annotations

from dash import html

from utils.formatting import fmt_usd_compact, fmt_int, fmt_pct


KPI_GRADIENTS = {
    "revenue": ("#ffd6e7", "#ffe8f2", "#c8608a"),
    "orders": ("#e0eea3", "#eef4c4", "#6e9a10"),
    "profit": ("#c4faf8", "#ddfdf9", "#10a8a4"),
    "aov": ("#fcc2ff", "#fde0ff", "#b020c0"),
    "leakage": ("#fff4b7", "#fffad6", "#c8a000"),
    "green": ("#e4f3c4", "#f2fae2", "#6e9a10"),
    "blue": ("#d9efff", "#eef7ff", "#3d8fd1"),
    "pink": ("#ffd6e7", "#fff0f6", "#c8608a"),
    "yellow": ("#fff4b7", "#fffde8", "#a88f00"),
}


def kpi_card(label: str, value: str, sub: str = "", kind: str = "green"):
    grad_from, grad_to, accent = KPI_GRADIENTS.get(kind, KPI_GRADIENTS["green"])
    return html.Div(
        className="kpi-card",
        style={
            "background": f"linear-gradient(135deg, {grad_from} 0%, {grad_to} 100%)",
            "border": f"1px solid {accent}22",
        },
        children=[
            html.Div(label.upper(), className="kpi-label"),
            html.Div(value, className="kpi-value"),
            html.Div(sub, className="kpi-sub") if sub else None,
        ],
    )


def kpi_row_from_totals(totals: dict):
    return html.Div(
        className="kpi-row",
        children=[
            kpi_card("Total Revenue", fmt_usd_compact(totals["revenue"]),
                     "All orders · USD", kind="revenue"),
            kpi_card("Total Orders", fmt_int(totals["orders"]),
                     "Transactions", kind="orders"),
            kpi_card("Net Profit", fmt_usd_compact(totals["net_profit"]),
                     "Gross profit − shipping − fees", kind="profit"),
            kpi_card("Average Order Value", fmt_usd_compact(totals["aov"]),
                     "Per transaction", kind="aov"),
            kpi_card("Profit Leakage", fmt_usd_compact(totals["leakage_total"]),
                     f"{fmt_pct(totals['leakage_pct'])} of revenue", kind="leakage"),
        ],
    )


def summary_card(title: str, value: str, sub: str, kind: str = "blue"):
    grad_from, grad_to, accent = KPI_GRADIENTS.get(kind, KPI_GRADIENTS["blue"])
    return html.Div(
        className="summary-card",
        style={
            "background": f"linear-gradient(135deg, {grad_from}, {grad_to})",
            "border": f"1px solid {accent}22",
        },
        children=[
            html.Div(title.upper(), className="summary-title"),
            html.Div(value, className="summary-value"),
            html.Div(sub, className="summary-sub", style={"color": accent}),
        ],
    )


def card(title: str, subtitle: str = "", children=None):
    return html.Div(
        className="card",
        children=[
            html.Div(title, className="card-title"),
            html.Div(subtitle, className="card-sub") if subtitle else None,
            html.Div(children=children, className="card-body"),
        ],
    )
