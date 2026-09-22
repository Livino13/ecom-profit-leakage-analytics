"""Shared Plotly chart builders (pastel, USD, interactive hovers)."""

from __future__ import annotations

import numpy as np
import plotly.express as px
import plotly.graph_objects as go

from .theme import PALETTE, SEGMENT_COLORS, base_layout


def revenue_profit_trend(trend_df) -> go.Figure:
    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=trend_df["year_month"], y=trend_df["revenue"],
        mode="lines", name="Revenue",
        line=dict(color=PALETTE["pink_deep"], width=2.5),
        fill="tozeroy", fillcolor="rgba(237,154,193,0.18)",
        hovertemplate="Revenue: $%{y:,.0f}<extra>%{x}</extra>",
    ))
    fig.add_trace(go.Scatter(
        x=trend_df["year_month"], y=trend_df["profit"],
        mode="lines", name="Profit",
        line=dict(color=PALETTE["green"], width=2.5),
        fill="tozeroy", fillcolor="rgba(224,239,112,0.30)",
        hovertemplate="Profit: $%{y:,.0f}<extra>%{x}</extra>",
    ))
    fig.update_layout(**base_layout(title="", height=410))
    fig.update_layout(
        autosize=True,
        margin=dict(l=48, r=12, t=36, b=44),
        xaxis_title="", yaxis_title="",
        yaxis_tickprefix="$",
        xaxis_tickangle=-30, xaxis_tickfont=dict(size=9),
    )
    return fig


def category_profit_bars(cat_df) -> go.Figure:
    colors = [PALETTE["pink"] if p < 0 else PALETTE["green"] for p in cat_df["profit"]]
    fig = go.Figure(go.Bar(
        x=cat_df["category"], y=cat_df["profit"],
        marker_color=colors, marker_line_width=0,
        text=[f"${v:,.0f}" for v in cat_df["profit"]],
        textposition="outside", textfont=dict(size=9),
        hovertemplate="%{x}<br>Profit: $%{y:,.0f}<extra></extra>",
        name="Profit",
    ))
    fig.update_layout(**base_layout(height=240))
    fig.update_layout(yaxis_tickprefix="$")
    return fig


def category_revenue_profit(cat_df) -> go.Figure:
    fig = go.Figure()
    fig.add_trace(go.Bar(
        x=cat_df["category"], y=cat_df["revenue"], name="Revenue",
        marker_color=PALETTE["blue_pale"],
        hovertemplate="%{x}<br>Revenue: $%{y:,.0f}<extra></extra>",
    ))
    colors = [PALETTE["pink"] if p < 0 else PALETTE["green"] for p in cat_df["profit"]]
    fig.add_trace(go.Bar(
        x=cat_df["category"], y=cat_df["profit"], name="Profit",
        marker_color=colors,
        hovertemplate="%{x}<br>Profit: $%{y:,.0f}<extra></extra>",
    ))
    fig.update_layout(**base_layout(height=260))
    fig.update_layout(barmode="group", yaxis_tickprefix="$",
                      xaxis_tickfont=dict(size=9))
    return fig


def product_ranking_bars(prod_df, n: int = 16) -> go.Figure:
    df = prod_df.sort_values("profit", ascending=True).tail(n)
    colors = [PALETTE["pink"] if p < 0 else PALETTE["green"] for p in df["profit"]]
    fig = go.Figure(go.Bar(
        x=df["profit"], y=df["product_name"], orientation="h",
        marker_color=colors,
        text=[f"${v:,.0f}" for v in df["profit"]],
        textposition="outside", textfont=dict(size=8),
        customdata=np.stack([df["category"].values, df["revenue"].values,
                             df["margin"].values], axis=-1),
        hovertemplate=("<b>%{y}</b><br>Profit: $%{x:,.0f}<br>"
                       "Category: %{customdata[0]}<br>"
                       "Revenue: $%{customdata[1]:,.0f}<br>"
                       "Margin: %{customdata[2]:.1f}%<extra></extra>"),
    ))
    fig.update_layout(**base_layout(height=340))
    fig.update_layout(xaxis_tickprefix="$", yaxis_tickfont=dict(size=8),
                      margin=dict(l=8, r=70, t=8, b=8))
    fig.add_vline(x=0, line_color=PALETTE["border"], line_width=1.5)
    return fig


def margin_vs_discount(cat_df) -> go.Figure:
    fig = go.Figure()
    fig.add_trace(go.Bar(
        x=cat_df["category"], y=cat_df["avg_discount"], name="Avg Discount %",
        marker_color=PALETTE["yellow"],
        hovertemplate="%{x}<br>Avg Discount: %{y:.1f}%<extra></extra>",
    ))
    colors = [PALETTE["pink"] if m < 0 else PALETTE["green"] for m in cat_df["margin"]]
    fig.add_trace(go.Bar(
        x=cat_df["category"], y=cat_df["margin"], name="Profit Margin %",
        marker_color=colors,
        hovertemplate="%{x}<br>Margin: %{y:.1f}%<extra></extra>",
    ))
    fig.update_layout(**base_layout(height=250))
    fig.update_layout(barmode="group", yaxis_ticksuffix="%",
                      xaxis_tickfont=dict(size=9))
    fig.add_hline(y=0, line_color=PALETTE["border"], line_width=1.5)
    return fig


def waterfall_chart(leak: dict, net_profit: float) -> go.Figure:
    names = ["Revenue", "Discounts", "Returns", "Shipping\n(success)", "Failed\nDelivery",
             "Pay Fees", "Net Profit"]
    values = [leak["revenue"], -leak["discounts"], -leak["returns"],
              -leak["shipping_success"], -leak["failed"], -leak["fees"], net_profit]
    kinds = ["total", "loss", "loss", "loss", "loss", "loss", "profit"]
    colors = [PALETTE["green"] if k == "total" else
              PALETTE["green_mid"] if k == "profit" else PALETTE["pink_deep"]
              for k in kinds]
    fig = go.Figure(go.Bar(
        x=names, y=values, marker_color=colors,
        text=[f"${abs(v):,.0f}" for v in values],
        textposition="outside", textfont=dict(size=8),
        hovertemplate="%{x}: $%{y:,.0f}<extra></extra>",
    ))
    fig.update_layout(**base_layout(height=280))
    fig.update_layout(yaxis_tickprefix="$", xaxis_tickfont=dict(size=8))
    return fig


def discount_margin_scatter(sample_df) -> go.Figure:
    df = sample_df.copy()
    df["band"] = np.where(df["profit_margin_percent"] < 0, "Negative",
                   np.where(df["profit_margin_percent"] < 10, "Low (<10%)", "Healthy"))
    color_map = {"Negative": PALETTE["pink"], "Low (<10%)": PALETTE["yellow"],
                 "Healthy": "#d8ec7a"}
    fig = px.scatter(
        df, x="discount_percent", y="profit_margin_percent", color="band",
        color_discrete_map=color_map,
        hover_data={"product_name": True, "category": True,
                    "total_price_usd": ":,.0f", "profit_usd": ":,.0f"},
        opacity=0.65,
    )
    fig.update_layout(**base_layout(height=280))
    fig.update_layout(xaxis_title="Discount %", yaxis_title="Profit Margin %",
                      yaxis_ticksuffix="%", xaxis_ticksuffix="%",
                      legend_title_text="")
    fig.add_hline(y=0, line_color=PALETTE["pink_deep"], line_dash="dash", line_width=1.2)
    fig.add_vline(x=25, line_color=PALETTE["yellow_deep"], line_dash="dash",
                  line_width=1.2,
                  annotation_text="25% threshold", annotation_font_size=9)
    fig.update_traces(marker=dict(size=6, line=dict(width=0)))
    return fig


def customer_value_scatter(cust_df, n: int = 3000) -> go.Figure:
    df = cust_df if len(cust_df) <= n else cust_df.sample(n, random_state=7)
    fig = px.scatter(
        df, x="revenue", y="profit", color="segment",
        color_discrete_map=SEGMENT_COLORS,
        hover_data={"customer_name": True, "country": True, "orders": True,
                    "clv": ":,.0f"},
        opacity=0.7,
    )
    fig.update_layout(**base_layout(height=270))
    fig.update_layout(xaxis_title="Customer Revenue (USD)",
                      yaxis_title="Customer Profit (USD)",
                      xaxis_tickprefix="$", yaxis_tickprefix="$",
                      legend_title_text="Segment")
    fig.update_traces(marker=dict(size=7, line=dict(width=0)))
    return fig


def clv_bars(cust_df, n: int = 14) -> go.Figure:
    df = cust_df.sort_values("clv", ascending=True).tail(n)
    colors = [SEGMENT_COLORS.get(s, PALETTE["green"]) for s in df["segment"]]
    fig = go.Figure(go.Bar(
        x=df["clv"], y=df["customer_name"], orientation="h",
        marker_color=colors,
        text=[f"${v:,.0f}" for v in df["clv"]],
        textposition="outside", textfont=dict(size=8),
        customdata=np.stack([df["country"].values, df["revenue"].values,
                             df["orders"].values], axis=-1),
        hovertemplate=("<b>%{y}</b><br>CLV (profit): $%{x:,.0f}<br>"
                       "%{customdata[0]} · Revenue $%{customdata[1]:,.0f} · "
                       "%{customdata[2]:,.0f} orders<extra></extra>"),
    ))
    fig.update_layout(**base_layout(height=300))
    fig.update_layout(xaxis_tickprefix="$", yaxis_tickfont=dict(size=8),
                      margin=dict(l=8, r=70, t=8, b=8))
    return fig


def shipping_cost_bars(ship_df, n: int = 10) -> go.Figure:
    df = ship_df.sort_values("shipping_cost", ascending=True).tail(n)
    fig = go.Figure(go.Bar(
        x=df["shipping_cost"], y=df["shipping_country"], orientation="h",
        marker_color="#b8cef8",
        text=[f"${v:,.0f}" for v in df["shipping_cost"]],
        textposition="outside", textfont=dict(size=8),
        hovertemplate="%{y}<br>Shipping: $%{x:,.0f}<extra></extra>",
    ))
    fig.update_layout(**base_layout(height=280))
    fig.update_layout(xaxis_tickprefix="$", yaxis_tickfont=dict(size=9),
                      margin=dict(l=8, r=70, t=8, b=8))
    return fig


def delivery_performance_bars(ship_df, n: int = 10) -> go.Figure:
    df = ship_df.sort_values("shipping_cost", ascending=False).head(n)
    df = df.sort_values("avg_days", ascending=True)
    fig = go.Figure()
    fig.add_trace(go.Bar(
        x=df["avg_days"], y=df["shipping_country"], orientation="h",
        name="Avg Delivery Days", marker_color="#b8cef8",
        hovertemplate="%{y}<br>Avg days: %{x:.1f}<extra></extra>",
    ))
    fig.add_trace(go.Bar(
        x=df["failed_pct"], y=df["shipping_country"], orientation="h",
        name="Failed Delivery %", marker_color="#f4b8d0",
        hovertemplate="%{y}<br>Failed: %{x:.1f}%<extra></extra>",
    ))
    fig.update_layout(**base_layout(height=280))
    fig.update_layout(barmode="group", yaxis_tickfont=dict(size=9),
                      margin=dict(l=8, r=8, t=30, b=8))
    return fig


def leakage_sources_bars(leak: dict) -> go.Figure:
    import pandas as pd
    rows = [
        ("Discounts", leak["discounts"], PALETTE["pink_deep"]),
        ("Returns", leak["returns"], PALETTE["yellow_deep"]),
        ("Shipping", leak["shipping"], PALETTE["blue"]),
        ("Failed Delivery", leak["failed"], PALETTE["green"]),
        ("Payment Fees (est.)", leak["fees"], PALETTE["pink"]),
    ]
    data = pd.DataFrame(rows, columns=["source", "amount", "color"])
    fig = go.Figure(go.Bar(
        x=data["amount"], y=data["source"], orientation="h",
        marker_color=data["color"],
        text=[f"${v:,.0f}" for v in data["amount"]],
        textposition="outside", textfont=dict(size=9),
        hovertemplate="%{y}: $%{x:,.0f}<extra></extra>",
    ))
    fig.update_layout(**base_layout(height=230))
    fig.update_layout(xaxis_tickprefix="$", margin=dict(l=8, r=70, t=8, b=8))
    return fig
