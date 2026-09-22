"""Shared pastel palette + Plotly template (mirrors React reference)."""

PALETTE = {
    "green": "#9abe30",
    "green_light": "#f0facc",
    "green_mid": "#b8d840",
    "blue": "#6ec8f0",
    "blue_light": "#e2f5ff",
    "blue_pale": "#c0eaff",
    "lavender": "#c0b4f0",
    "lavender_light": "#efeafd",
    "pink": "#ed9ac1",
    "pink_deep": "#c8608a",
    "pink_light": "#fce4f0",
    "yellow": "#fff680",
    "yellow_deep": "#d4b800",
    "yellow_light": "#fffde0",
    "bg": "#fdfaf6",
    "card": "#ffffff",
    "border": "#eceacc",
    "text": "#2C2E45",
    "text_s": "#5A5C72",
    "text_m": "#9497B0",
    "gray_nodata": "#edeef3",
}

# Map bucket fills required by the spec
MAP_NEGATIVE = "#f4c4d0"   # pastel pink
MAP_LOW = "#d8ecfc"        # light pastel blue
MAP_MEDIUM = "#b0c8f4"     # pastel blue
MAP_HIGH = "#c0b4f0"       # pastel lavender
MAP_NODATA = "#edeef3"     # very light gray

PROFIT_COLORSCALE = [
    [0.0, MAP_NEGATIVE],
    [0.18, MAP_NEGATIVE],
    [0.18, MAP_LOW],
    [0.45, MAP_LOW],
    [0.45, MAP_MEDIUM],
    [0.72, MAP_MEDIUM],
    [0.72, MAP_HIGH],
    [1.0, MAP_HIGH],
]

SHIPPING_COLORSCALE = [
    [0.0, "#e2f5ff"],
    [0.35, "#b8d8f8"],
    [0.65, "#8fbdf0"],
    [1.0, "#6ea8e8"],
]

SEGMENT_COLORS = {"High": "#9abe30", "Medium": "#6ec8f0", "Low": "#c8608a"}


def base_layout(title: str = "", height: int = 260):
    return dict(
        title=dict(text=title, font=dict(size=13, color=PALETTE["text"])) if title else {},
        paper_bgcolor="white",
        plot_bgcolor="white",
        height=height,
        margin=dict(l=8, r=8, t=28 if title else 8, b=8),
        font=dict(family="Inter, system-ui, sans-serif", size=11, color=PALETTE["text_s"]),
        xaxis=dict(gridcolor="#f0f2f8", zeroline=False),
        yaxis=dict(gridcolor="#f0f2f8", zeroline=False),
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1,
                    font=dict(size=10)),
        hoverlabel=dict(bgcolor="white", font_size=11),
    )
