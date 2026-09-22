"""Sidebar + header (persistent navigation, 4 pages)."""

from __future__ import annotations

from dash import html, dcc

NAV = [
    {"path": "/", "label": "Executive Overview", "dot": "#9abe30"},
    {"path": "/leakage", "label": "Profit Leakage", "dot": "#c8608a"},
    {"path": "/customers", "label": "Customer Value", "dot": "#6ec8f0"},
    {"path": "/products", "label": "Product Analysis", "dot": "#d4b800"},
]


def sidebar(active_path: str):
    links = []
    for item in NAV:
        active = (active_path or "/") == item["path"]
        links.append(
            dcc.Link(
                href=item["path"],
                className="nav-link" + (" active" if active else ""),
                children=[
                    html.Span(className="nav-dot",
                              style={"background": item["dot"],
                                     "opacity": 1 if active else 0.45}),
                    html.Span(item["label"]),
                    html.Span(className="nav-bar") if active else None,
                ],
            )
        )
    return html.Aside(
        className="sidebar",
        children=[
            html.Div(
                className="brand",
                children=[
                    html.Div(className="brand-mark"),
                    html.Div(children=[
                        html.Div("ProfitLens", className="brand-name"),
                        html.Div("ANALYTICS SUITE", className="brand-sub"),
                    ]),
                ],
            ),
            html.Nav(
                className="nav",
                children=[html.Div("Dashboard", className="nav-heading")] + links,
            ),
            html.Div(
                className="sidebar-footer",
                children=[
                    html.Div(
                        className="live-badge",
                        children=[
                            html.Span(className="live-dot"),
                            html.Span("Live Data · USD"),
                        ],
                    ),
                    html.Div(
                        className="user-row",
                        children=[
                            html.Div("A", className="avatar"),
                            html.Div(children=[
                                html.Div("Admin", className="user-name"),
                                html.Div("Global E-Commerce · 2024–2026",
                                        className="user-email"),
                            ]),
                        ],
                    ),
                ],
            ),
        ],
    )


def page_header(title: str, crumb: str):
    return html.Header(
        className="topbar",
        children=[
            html.Div(children=[
                html.Div(f"ProfitLens / {crumb}", className="crumb"),
                html.Div(title, className="page-title"),
            ]),
            html.Div("Global E-Commerce Dataset · Values in USD",
                     className="topbar-right"),
        ],
    )
