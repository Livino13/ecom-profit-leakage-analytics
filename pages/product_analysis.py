"""Page 4 — Product Analysis (category + product, all from dataset)."""

from __future__ import annotations

from dash import html, dcc

from components.kpi_cards import card
from components.charts import (
    category_revenue_profit, product_ranking_bars, margin_vs_discount,
)
from components.tables import sortable_table
from utils.formatting import fmt_usd


def layout(agg: dict):
    category = agg["category"]
    products_ranked = agg["products_ranked"]
    products = agg["products"]

    low = products[products["margin"] < 10].sort_values("margin").head(50)

    def issue(r) -> str:
        if r.avg_discount > 30:
            return "Over-discounted"
        if r.return_rate > 18:
            return "High returns"
        if r.profit < 0:
            return "Margin-negative"
        return "Low margin"

    cols = [
        {"name": "Product", "id": "product_name"},
        {"name": "Category", "id": "category"},
        {"name": "Revenue (USD)", "id": "revenue"},
        {"name": "Profit (USD)", "id": "profit"},
        {"name": "Margin %", "id": "margin", "type": "numeric",
         "format": {"specifier": ".1f"}},
        {"name": "Avg Discount %", "id": "avg_discount", "type": "numeric",
         "format": {"specifier": ".1f"}},
        {"name": "Return Rate %", "id": "return_rate", "type": "numeric",
         "format": {"specifier": ".1f"}},
        {"name": "Issue", "id": "issue"},
    ]
    data = [
        {
            "product_name": r.product_name, "category": r.category,
            "revenue": fmt_usd(r.revenue), "profit": fmt_usd(r.profit),
            "margin": round(r.margin, 1),
            "avg_discount": round(r.avg_discount, 1),
            "return_rate": round(r.return_rate, 1),
            "issue": issue(r),
        }
        for r in low.itertuples()
    ]

    return html.Div(
        className="page",
        children=[
            html.Div(
                className="grid-2",
                children=[
                    card(
                        "Category: Revenue vs Profit",
                        "Revenue and profit summed from profit_usd · USD",
                        [dcc.Graph(figure=category_revenue_profit(category),
                                   config={"displayModeBar": False})],
                    ),
                    card(
                        "Product Profitability Ranking",
                        "Top winners and worst losers by profit_usd · "
                        "green = positive, pink = negative",
                        [dcc.Graph(figure=product_ranking_bars(products_ranked),
                                   config={"displayModeBar": False})],
                    ),
                ],
            ),
            card(
                "Category: Profit Margin vs Avg Discount",
                "Average discount_percent against realized profit margin",
                [dcc.Graph(figure=margin_vs_discount(category),
                           config={"displayModeBar": False})],
            ),
            html.Div(
                className="card alert-card",
                children=[
                    html.Div(
                        className="alert-head",
                        children=[
                            html.Span("Action Required", className="alert-pill"),
                            html.Span("Low / Negative Margin Products",
                                      className="card-title"),
                        ],
                    ),
                    html.Div(
                        "Products with margin below 10% · computed from "
                        "revenue, profit, discount and returns",
                        className="card-sub",
                    ),
                    html.Div(children=[
                        sortable_table("low-margin", cols, data, page_size=12)
                    ], className="card-body"),
                ],
            ),
        ],
    )
