"""Plotly world choropleths (country-fill, NOT bubbles)."""

from __future__ import annotations

import numpy as np
import plotly.graph_objects as go

from .theme import (
    PROFIT_COLORSCALE, SHIPPING_COLORSCALE,
    MAP_NODATA, PALETTE, base_layout,
)


def profit_world_map(country_df) -> go.Figure:
    """Country fill = profit. Negative pink / low-med-high blue-lavender."""
    df = country_df.copy()
    pos = df.loc[df["profit"] > 0, "profit"]
    lo, hi = (float(pos.quantile(0.33)), float(pos.quantile(0.66))) if len(pos) else (0.0, 1.0)
    if hi <= lo:
        hi = lo + 1.0

    custom = np.stack([
        df["revenue"].values,
        df["profit"].values,
        df["margin"].values,
        df["orders"].values,
    ], axis=-1)

    fig = go.Figure(go.Choropleth(
        locations=df["country"],
        locationmode="country names",
        z=df["profit"],
        zmin=min(0.0, float(df["profit"].min())) if len(df) else 0,
        zmax=float(df["profit"].max()) if len(df) else 1,
        colorscale=PROFIT_COLORSCALE,
        marker_line_color="white",
        marker_line_width=0.6,
        colorbar=dict(
            title=dict(text="Profit (USD)", font=dict(size=10)),
            tickprefix="$", tickfont=dict(size=9),
            thickness=7, len=0.5, y=0.5, x=1.0,
            outlinewidth=0,
        ),
        customdata=custom,
        hovertemplate=(
            "<b>%{location}</b><br>"
            "Revenue: $%{customdata[0]:,.0f}<br>"
            "Profit: $%{customdata[1]:,.0f}<br>"
            "Profit Margin: %{customdata[2]:.1f}%<br>"
            "Orders: %{customdata[3]:,.0f}<extra></extra>"
        ),
    ))
    fig.update_layout(**base_layout(height=420))
    fig.update_layout(
        autosize=True,
        margin=dict(l=0, r=0, t=0, b=0),
        geo=dict(
            scope="world",
            showframe=False, showcoastlines=True, coastlinecolor="#d5dae5",
            showland=True, landcolor=MAP_NODATA,
            showocean=True, oceancolor="#f6f8fc",
            projection_type="equirectangular",
            lonaxis=dict(range=[-180, 180]),
            lataxis=dict(range=[-90, 90]),
            domain=dict(x=[0, 1], y=[0, 1]),
        ),
        annotations=[dict(
            text=f"Low ≤ ${lo:,.0f} · Medium ≤ ${hi:,.0f} · High > ${hi:,.0f} · Pink = negative",
            x=0.01, y=0.01, xref="paper", yref="paper",
            showarrow=False, font=dict(size=9, color=PALETTE["text_m"]),
        )],
    )
    # Interactive geographic viewport: wheel zoom + drag pan stay inside the
    # card; double-click resets. (Plotly Geo has no `fixed` property, so
    # container fixity is enforced via the .map-viewport CSS below.)
    fig.update_geos(projection_type="equirectangular")
    return fig


def shipping_world_map(ship_df) -> go.Figure:
    """Country fill = total shipping cost (USD)."""
    df = ship_df.copy()
    custom = np.stack([
        df["shipping_cost"].values,
        df["orders"].values,
        df["failed_pct"].values,
        df["avg_days"].values,
    ], axis=-1)
    fig = go.Figure(go.Choropleth(
        locations=df["shipping_country"],
        locationmode="country names",
        z=df["shipping_cost"],
        colorscale=SHIPPING_COLORSCALE,
        marker_line_color="white",
        marker_line_width=0.6,
        colorbar=dict(
            title=dict(text="Shipping (USD)", font=dict(size=10)),
            tickprefix="$", tickfont=dict(size=9),
            thickness=7, len=0.5, y=0.5, x=1.0,
            outlinewidth=0,
        ),
        customdata=custom,
        hovertemplate=(
            "<b>%{location}</b><br>"
            "Shipping Cost: $%{customdata[0]:,.0f}<br>"
            "Orders: %{customdata[1]:,.0f}<br>"
            "Failed Delivery: %{customdata[2]:.1f}%<br>"
            "Avg Delivery: %{customdata[3]:.1f} days<extra></extra>"
        ),
    ))
    fig.update_layout(**base_layout(height=480))
    fig.update_layout(
        autosize=True,
        margin=dict(l=0, r=0, t=0, b=0),
        geo=dict(
            scope="world",
            showframe=False, showcoastlines=True, coastlinecolor="#d5dae5",
            showland=True, landcolor=MAP_NODATA,
            showocean=True, oceancolor="#f4f7fb",
            projection_type="equirectangular",
            lonaxis=dict(range=[-180, 180]),
            lataxis=dict(range=[-90, 90]),
            domain=dict(x=[0, 1], y=[0, 1]),
        ),
    )
    # Same interactive viewport behavior as the profit map above.
    fig.update_geos(projection_type="equirectangular")
    return fig
