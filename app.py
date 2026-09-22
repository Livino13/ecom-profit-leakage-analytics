"""ProfitLens — Global E-Commerce Profit Leakage & Customer Value Analytics.

Python / Dash / Plotly / Pandas implementation.
Loads the dataset ONCE at startup, precomputes all aggregates,
then serves 4 pages from memory (no per-page reloads).

Run:
    python app.py            # dev server on http://127.0.0.1:8050
"""

from __future__ import annotations

import traceback

from dash import Dash, html, dcc, Input, Output

from utils.data_processing import load_dataset, get_aggregates
from components.sidebar import sidebar, page_header
from pages import executive_overview, profit_leakage, customer_value, product_analysis

TITLE_MAP = {
    "/": ("Executive Overview", "Executive Overview"),
    "/leakage": ("Profit Leakage", "Profit Leakage"),
    "/customers": ("Customer Value", "Customer Value"),
    "/products": ("Product Analysis", "Product Analysis"),
}

print("Loading Global E-Commerce dataset (once) ...", flush=True)
try:
    DF = load_dataset()
    print(f"Dataset ready: {len(DF):,} rows.", flush=True)
except Exception as exc:
    print(f"DATASET LOAD FAILED: {exc}", flush=True)
    traceback.print_exc()
    raise

print("Precomputing aggregates ...", flush=True)
AGG = get_aggregates(DF)
print("Aggregates ready.", flush=True)

app = Dash(
    __name__,
    title="ProfitLens Analytics Suite",
    suppress_callback_exceptions=True,
)
server = app.server

app.layout = html.Div(
    className="app-shell",
    children=[
        dcc.Location(id="url", refresh=False),
        html.Div(id="sidebar-wrap"),
        html.Div(
            className="main",
            children=[
                html.Div(id="header-wrap"),
                html.Main(id="page-content", className="content"),
            ],
        ),
    ],
)


@app.callback(
    Output("sidebar-wrap", "children"),
    Output("header-wrap", "children"),
    Output("page-content", "children"),
    Input("url", "pathname"),
)
def render_page(pathname: str | None):
    path = pathname or "/"
    title, crumb = TITLE_MAP.get(path, TITLE_MAP["/"])
    if path == "/leakage":
        page = profit_leakage.layout(AGG)
    elif path == "/customers":
        page = customer_value.layout(AGG)
    elif path == "/products":
        page = product_analysis.layout(AGG)
    else:
        path = "/"
        title, crumb = TITLE_MAP["/"]
        page = executive_overview.layout(AGG)
    return sidebar(path), page_header(title, crumb), page


if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=8050)
