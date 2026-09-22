"""Sortable DataTables with pastel styling."""

from __future__ import annotations

from dash import dash_table

TABLE_STYLE_HEADER = {
    "backgroundColor": "#f8f9fc",
    "color": "#5A5C72",
    "fontWeight": "600",
    "fontSize": "11px",
    "border": "none",
    "borderBottom": "2px solid #eceacc",
    "padding": "8px 12px",
}
TABLE_STYLE_CELL = {
    "fontSize": "12px",
    "fontFamily": "Inter, system-ui, sans-serif",
    "color": "#2C2E45",
    "padding": "9px 12px",
    "border": "none",
    "borderBottom": "1px solid #eceacc",
    "textAlign": "left",
}
TABLE_STYLE_TABLE = {"overflowX": "auto", "borderRadius": "12px"}


def sortable_table(
    table_id: str,
    columns: list[dict],
    data: list[dict],
    page_size: int = 12,
    extra_style: dict | None = None,
):
    return dash_table.DataTable(
        id=table_id,
        columns=columns,
        data=data,
        sort_action="native",
        filter_action="native",
        page_action="native",
        page_size=page_size,
        style_header=TABLE_STYLE_HEADER,
        style_cell=TABLE_STYLE_CELL,
        style_table={**TABLE_STYLE_TABLE, **(extra_style or {})},
        style_data_conditional=[
            {"if": {"row_index": "odd"}, "backgroundColor": "#FAFBFE"},
        ],
        filter_options={"case": "insensitive"},
    )
