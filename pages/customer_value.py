"""Page 3 — Customer Value (segments from actual profitability tertiles)."""

from __future__ import annotations

from dash import html, dcc

from components.kpi_cards import card
from components.charts import customer_value_scatter, clv_bars
from components.tables import sortable_table
from utils.formatting import fmt_usd, fmt_usd_compact, fmt_int, fmt_pct


def _segment_cards(cust):
    cards = []
    for seg, kind in [("High", "green"), ("Medium", "blue"), ("Low", "pink")]:
        sub = cust[cust["segment"] == seg]
        n = len(sub)
        rev = sub["revenue"].sum()
        prof = sub["profit"].sum()
        avg_clv = sub["clv"].mean() if n else 0
        avg_aov = sub["aov"].mean() if n else 0
        dot = {"green": "#9abe30", "blue": "#6ec8f0", "pink": "#c8608a"}[kind]
        cards.append(
            html.Div(
                className="card seg-card",
                children=[
                    html.Div(
                        className="seg-head",
                        children=[
                            html.Span(className="nav-dot",
                                      style={"background": dot,
                                             "width": "12px", "height": "12px"}),
                            html.Div(children=[
                                html.Div(f"{seg} Value", className="card-title"),
                                html.Div(f"{fmt_int(n)} customers",
                                         className="card-sub"),
                            ]),
                        ],
                    ),
                    html.Div(
                        className="seg-grid",
                        children=[
                            html.Div(children=[
                                html.Div("Revenue", className="kpi-sub"),
                                html.Div(fmt_usd_compact(rev),
                                         className="seg-val"),
                            ]),
                            html.Div(children=[
                                html.Div("Profit", className="kpi-sub"),
                                html.Div(fmt_usd_compact(prof),
                                         className="seg-val"),
                            ]),
                            html.Div(children=[
                                html.Div("Avg CLV", className="kpi-sub"),
                                html.Div(fmt_usd(avg_clv),
                                         className="seg-val"),
                            ]),
                            html.Div(children=[
                                html.Div("Avg AOV", className="kpi-sub"),
                                html.Div(fmt_usd(avg_aov),
                                         className="seg-val"),
                            ]),
                        ],
                    ),
                ],
            )
        )
    return html.Div(cards, className="seg-row")


def layout(agg: dict):
    cust = agg["customers"]
    top = cust.sort_values("clv", ascending=False).head(50)

    cols = [
        {"name": "Customer", "id": "customer_name"},
        {"name": "Segment", "id": "segment"},
        {"name": "Country", "id": "country"},
        {"name": "Revenue (USD)", "id": "revenue"},
        {"name": "Profit (USD)", "id": "profit"},
        {"name": "Orders", "id": "orders", "type": "numeric"},
        {"name": "AOV (USD)", "id": "aov"},
        {"name": "Return Rate %", "id": "return_rate", "type": "numeric",
         "format": {"specifier": ".1f"}},
        {"name": "CLV / Profit (USD)", "id": "clv"},
    ]
    data = [
        {
            "customer_name": r.customer_name, "segment": r.segment,
            "country": r.country,
            "revenue": fmt_usd(r.revenue), "profit": fmt_usd(r.profit),
            "orders": int(r.orders), "aov": fmt_usd(r.aov),
            "return_rate": round(r.return_rate, 1), "clv": fmt_usd(r.clv),
        }
        for r in top.itertuples()
    ]

    seg_counts = cust["segment"].value_counts().to_dict()
    seg_note = (
        f"Segments derived from customer profit tertiles · "
        f"High {fmt_int(seg_counts.get('High', 0))} · "
        f"Medium {fmt_int(seg_counts.get('Medium', 0))} · "
        f"Low {fmt_int(seg_counts.get('Low', 0))} · "
        f"{fmt_int(len(cust))} customers total"
    )

    return html.Div(
        className="page",
        children=[
            _segment_cards(cust),
            html.Div(children=[seg_note], className="note"),
            html.Div(
                className="grid-2",
                children=[
                    card(
                        "Customer Value Map",
                        "X = customer revenue · Y = customer profit · "
                        "color = High / Medium / Low",
                        [dcc.Graph(figure=customer_value_scatter(cust),
                                   config={"displayModeBar": False})],
                    ),
                    card(
                        "Customer Lifetime Value",
                        "Top customers by lifetime profit (CLV proxy)",
                        [dcc.Graph(figure=clv_bars(cust),
                                   config={"displayModeBar": False})],
                    ),
                ],
            ),
            card(
                "Customer Detail — Value, Behaviour and Profitability",
                "Top 50 by CLV · sortable and filterable · USD",
                [sortable_table("cust-detail", cols, data, page_size=12)],
            ),
        ],
    )
