"""Page 1 — Executive Overview (mirrors React layout, values from dataset, USD)."""

from __future__ import annotations

from dash import html, dcc

from components.kpi_cards import kpi_row_from_totals, card
from components.charts import (
    revenue_profit_trend, category_profit_bars, leakage_sources_bars,
)
from components.world_map import profit_world_map
from components.tables import sortable_table
from utils.formatting import fmt_usd, fmt_usd_compact, fmt_pct


def layout(agg: dict):
    totals = agg["totals"]
    leak = agg["leakage"]
    trend = agg["trend"]
    country = agg["country"]
    category = agg["category"]
    products = agg["products"]

    hero = html.Div(
        className="hero",
        children=[
            html.Div(children=[
                html.Div("FY 2024–2026 · Executive Summary", className="hero-eyebrow"),
                html.Div(
                    f"{fmt_usd_compact(leak['total'])} in Profit Leakage Identified",
                    className="hero-title",
                ),
                html.Div(
                    f"{fmt_pct(leak['total_pct'])} of revenue lost to discounts, "
                    "returns, shipping and fees",
                    className="hero-sub",
                ),
            ]),
            html.Div(
                className="hero-right",
                children=[
                    html.Div("Net Profit Margin".upper(), className="hero-eyebrow"),
                    html.Div(
                        fmt_pct(
                            totals["net_profit"] / totals["revenue"] * 100
                            if totals["revenue"] else 0
                        ),
                        className="hero-margin",
                    ),
                    html.Div(
                        f"{fmt_usd_compact(totals['net_profit'])} of "
                        f"{fmt_usd_compact(totals['revenue'])} revenue",
                        className="hero-sub",
                    ),
                ],
            ),
        ],
    )

    # Product table data (top 12 by profit)
    prod_top = products.sort_values("profit", ascending=False).head(12)
    prod_cols = [
        {"name": "Product", "id": "product_name"},
        {"name": "Category", "id": "category"},
        {"name": "Revenue (USD)", "id": "revenue_fmt", "type": "numeric"},
        {"name": "Profit (USD)", "id": "profit_fmt", "type": "numeric"},
        {"name": "Margin %", "id": "margin", "type": "numeric",
         "format": {"specifier": ".1f"}},
        {"name": "Avg Discount %", "id": "avg_discount", "type": "numeric",
         "format": {"specifier": ".1f"}},
        {"name": "Return Rate %", "id": "return_rate", "type": "numeric",
         "format": {"specifier": ".1f"}},
    ]
    prod_data = [
        {
            "product_name": r.product_name, "category": r.category,
            "revenue_fmt": fmt_usd(r.revenue), "profit_fmt": fmt_usd(r.profit),
            "margin": round(r.margin, 1),
            "avg_discount": round(r.avg_discount, 1),
            "return_rate": round(r.return_rate, 1),
        }
        for r in prod_top.itertuples()
    ]

    return html.Div(
        className="page",
        children=[
            hero,
            kpi_row_from_totals(totals),
            html.Div(
                className="grid-37-63",
                children=[
                    card(
                        "Revenue vs Profit Trend",
                        "Monthly revenue and gross profit from order_date",
                        [dcc.Graph(figure=revenue_profit_trend(trend),
                                   style={"width": "100%", "height": "100%"},
                                   config={"displayModeBar": False,
                                           "responsive": True})],
                    ),
                    card(
                        "Profit by Country",
                        "Country fill represents profit · pink = negative",
                        [dcc.Graph(figure=profit_world_map(country),
                                   className="map-viewport",
                                   style={"width": "100%", "height": "100%"},
                                   config={"responsive": True,
                                           "scrollZoom": True,
                                           "displayModeBar": True,
                                           "doubleClick": "reset"})],
                    ),
                ],
            ),
            html.Div(
                className="grid-2",
                children=[
                    card(
                        "Profit Leakage Sources",
                        f"{fmt_usd_compact(leak['total'])} identified across "
                        "discounts, returns, shipping and fees",
                        [dcc.Graph(figure=leakage_sources_bars(leak),
                                   config={"displayModeBar": False})],
                    ),
                    card(
                        "Profit by Category",
                        "Positive green · negative pink",
                        [dcc.Graph(figure=category_profit_bars(category),
                                   config={"displayModeBar": False})],
                    ),
                ],
            ),
            card(
                "Product Profitability",
                "Top 12 products by profit · sortable and filterable · USD",
                [sortable_table("exec-products", prod_cols, prod_data,
                                page_size=12)],
            ),
        ],
    )
