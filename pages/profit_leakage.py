"""Page 2 — Profit Leakage (breakdown, waterfall, scatter, global shipping)."""

from __future__ import annotations

from dash import html, dcc

from components.kpi_cards import card, summary_card
from components.charts import (
    waterfall_chart, discount_margin_scatter,
    shipping_cost_bars, delivery_performance_bars,
)
from components.world_map import shipping_world_map
from components.tables import sortable_table
from utils.formatting import fmt_usd, fmt_usd_compact, fmt_pct, fmt_int


def _severity(pct: float) -> tuple[str, str]:
    if pct >= 4:
        return "Critical", "#c8608a"
    if pct >= 2:
        return "High", "#d4b800"
    if pct >= 1:
        return "Medium", "#9abe30"
    return "Low", "#6ec8f0"


def layout(agg: dict):
    totals = agg["totals"]
    leak = agg["leakage"]
    ship = agg["shipping"]
    scatter = agg["scatter"]

    drivers = {
        "Discounts": "Highest avg discount categories",
        "Returns / Refunds": "order_status = Returned",
        "Shipping Costs": "All shipments",
        "Failed Deliveries": "delivery_status = Failed (shipping wasted)",
        "Payment Fees (est.)": "Estimated by payment_method",
    }
    rows = [
        ("Discounts", leak["discounts"], leak["discounts_pct"]),
        ("Returns / Refunds", leak["returns"], leak["returns_pct"]),
        ("Shipping Costs", leak["shipping"], leak["shipping_pct"]),
        ("Failed Deliveries", leak["failed"], leak["failed_pct"]),
        ("Payment Fees (est.)", leak["fees"], leak["fees_pct"]),
    ]
    leak_cols = [
        {"name": "Source", "id": "source"},
        {"name": "Amount (USD)", "id": "amount"},
        {"name": "% Revenue", "id": "pct"},
        {"name": "Severity", "id": "severity"},
        {"name": "Primary Driver", "id": "driver"},
    ]
    leak_data = []
    for src, amt, pct in rows:
        sev, _ = _severity(pct)
        leak_data.append({
            "source": src, "amount": fmt_usd(amt), "pct": fmt_pct(pct),
            "severity": sev, "driver": drivers[src],
        })

    # Shipping summary cards (computed)
    top_cost = ship.iloc[0]
    top_failed = ship.sort_values("failed_pct", ascending=False).iloc[0]
    top_orders = ship.sort_values("orders", ascending=False).iloc[0]
    top_days = ship.sort_values("avg_days", ascending=False).iloc[0]

    return html.Div(
        className="page",
        children=[
            card(
                "Profit Leakage Breakdown",
                f"Revenue: {fmt_usd_compact(leak['revenue'])} · "
                f"Identified leakage: {fmt_usd_compact(leak['total'])} · "
                f"Net profit: {fmt_usd_compact(totals['net_profit'])} "
                "(fees estimated by payment method)",
                [sortable_table("leak-breakdown", leak_cols, leak_data,
                                page_size=6)],
            ),
            html.Div(
                className="grid-2",
                children=[
                    card(
                        "Revenue to Profit Waterfall",
                        "Revenue minus leakage components to net profit "
                        "(shipping split: successful vs failed)",
                        [dcc.Graph(
                            figure=waterfall_chart(leak, totals["net_profit"]),
                            config={"displayModeBar": False})],
                    ),
                    card(
                        "Discount vs Profit Margin",
                        "Each point is a sampled order · discount_percent vs "
                        "profit_margin_percent",
                        [dcc.Graph(figure=discount_margin_scatter(scatter),
                                   config={"displayModeBar": False})],
                    ),
                ],
            ),
            card(
                "Global Shipping and Delivery Analysis",
                "Geography uses shipping_country · country fill = shipping cost",
                children=[
                    dcc.Graph(figure=shipping_world_map(ship),
                              className="map-viewport",
                              style={"width": "100%", "height": "100%"},
                              config={"responsive": True,
                                      "scrollZoom": True,
                                      "displayModeBar": True,
                                      "doubleClick": "reset"}),
                    html.Div(
                        className="summary-row",
                        children=[
                            summary_card(
                                "Highest Shipping Cost",
                                fmt_usd_compact(top_cost["shipping_cost"]),
                                f"{top_cost['shipping_country']} · "
                                f"{fmt_int(top_cost['orders'])} orders",
                                kind="blue"),
                            summary_card(
                                "Highest Failed Delivery Rate",
                                fmt_pct(top_failed["failed_pct"]),
                                f"{top_failed['shipping_country']} · "
                                f"{fmt_pct(top_failed['failed_pct'])} failed",
                                kind="pink"),
                            summary_card(
                                "Highest Order Volume",
                                fmt_int(top_orders["orders"]),
                                f"{top_orders['shipping_country']}",
                                kind="green"),
                            summary_card(
                                "Longest Average Delivery",
                                f"{top_days['avg_days']:.1f} days",
                                f"{top_days['shipping_country']}",
                                kind="yellow"),
                        ],
                    ),
                    html.Div(
                        className="grid-2",
                        children=[
                            html.Div(children=[
                                html.Div("Shipping Cost by Country",
                                         className="mini-title"),
                                html.Div("Total shipping spend in USD",
                                         className="card-sub"),
                                dcc.Graph(figure=shipping_cost_bars(ship),
                                          config={"displayModeBar": False}),
                            ]),
                            html.Div(children=[
                                html.Div("Delivery Performance by Country",
                                         className="mini-title"),
                                html.Div("Average delivery days vs failed rate",
                                         className="card-sub"),
                                dcc.Graph(
                                    figure=delivery_performance_bars(ship),
                                    config={"displayModeBar": False}),
                            ]),
                        ],
                    ),
                ],
            ),
        ],
    )
