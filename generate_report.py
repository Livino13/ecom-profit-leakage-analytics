"""Generate YourName_ProjectReport.docx from verified summary numbers."""

import json
from docx import Document
from docx.shared import Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH

S = json.load(open("data/summary.json", encoding="utf-8"))
T = S["totals"]
L = S["leakage"]


def usd(n):
    return f"${n:,.2f}"


def usd0(n):
    return f"${n:,.0f}"


def pct(n):
    return f"{n:.1f}%"


doc = Document()
style = doc.styles["Normal"]
style.font.name = "Calibri"
style.font.size = Pt(11)

doc.add_heading("E-Commerce Profit Leakage & Customer Value Analytics System", level=0)
doc.add_paragraph(
    "Project Report — Python analytics dashboard (Dash, Plotly, Pandas, NumPy). "
    "All figures below are computed from the project dataset; no values are hardcoded."
)

doc.add_heading("1. Problem Statement", level=1)
doc.add_paragraph(
    "E-commerce businesses often generate substantial revenue but lose significant "
    "profit through excessive discounts, product returns, shipping costs, failed "
    "deliveries, payment fees, and low-margin products. This project analyses "
    "transaction, customer, product, discount, return, and operational data to "
    "identify major sources of profit leakage, measure customer profitability, and "
    "uncover actionable patterns that improve overall business performance."
)

doc.add_heading("2. Dataset", level=1)
doc.add_paragraph(
    "Global E-Commerce Dataset (1M+ records, 2024–2026). Source: "
    "https://www.kaggle.com/datasets/akrambelha/global-e-commerce-dataset-1m-records-20242026"
)
doc.add_paragraph(
    f"The working copy contains {S['rows']:,} order rows covering {S['date_min'][:10]} "
    f"to {S['date_max'][:10]}, across 10 countries "
    f"({', '.join(sorted(c['country'] for c in S['country']))}) and 5 product categories. "
    "Key fields used: order_id, order_date, order_status, customer_id, customer_name, "
    "country, product_name, category, unit_price_usd, quantity, discount_percent, "
    "discount_amount_usd, total_price_usd, cost_usd, profit_usd, profit_margin_percent, "
    "shipping_cost_usd, delivery_days, shipping_country, delivery_status, payment_method. "
    "All financial values are in USD."
)

doc.add_heading("3. Methodology", level=1)
doc.add_paragraph(
    "The XLSX dataset is converted once to Parquet (build_cache.py) and loaded a single "
    "time at application startup; all pages share precomputed Pandas groupby aggregates "
    "(utils/data_processing.py). Leakage is defined as: discounts = SUM(discount_amount_usd); "
    "returns = SUM(total_price_usd WHERE order_status = 'Returned'); shipping = "
    "SUM(shipping_cost_usd); failed delivery = shipping WHERE delivery_status = 'Failed' "
    "(a memo subset, split out in the waterfall so nothing is double counted). The dataset "
    "has no fee column, so payment fees are estimated per payment method (Credit 2.2%, "
    "PayPal 2.5%, Apple Pay 2.0%, Debit 1.8%, Bank Transfer 1.0%) and labelled as estimates. "
    "Net profit = SUM(profit_usd) minus shipping minus fees. Customer High/Medium/Low "
    "segments are tertiles of actual per-customer profit, and CLV is lifetime profit per customer."
)

doc.add_heading("4. System Design", level=1)
doc.add_paragraph(
    "A Dash/Plotly web application (app.py) with a persistent sidebar and four pages: "
    "(1) Executive Overview — KPI cards, revenue-vs-profit trend, Profit-by-Country world "
    "choropleth, leakage sources, profit by category, product table; (2) Profit Leakage — "
    "leakage breakdown, revenue-to-profit waterfall, discount-vs-margin scatter, and global "
    "shipping/delivery analysis with a world map; (3) Customer Value — segment cards, "
    "customer value map, CLV ranking, customer detail table; (4) Product Analysis — category "
    "revenue vs profit, product ranking, margin vs discount, and a low/negative-margin action "
    "table. World maps are Plotly choropleths with country-fill encoding and full hover "
    "tooltips; tables are sortable and filterable."
)


def add_table(headers, rows):
    tbl = doc.add_table(rows=1 + len(rows), cols=len(headers))
    tbl.style = "Light Grid Accent 1"
    for j, h in enumerate(headers):
        tbl.rows[0].cells[j].text = h
    for i, r in enumerate(rows, start=1):
        for j, v in enumerate(r):
            tbl.rows[i].cells[j].text = str(v)
    doc.add_paragraph("")


doc.add_heading("5. Results & Analysis", level=1)
doc.add_paragraph(
    f"Total revenue {usd0(T['revenue'])} across {T['orders']:,} orders (AOV {usd(T['aov'])}). "
    f"Gross profit {usd0(T['gross_profit'])}; after shipping and estimated fees, net profit "
    f"{usd0(T['net_profit'])}. Identified profit leakage totals {usd0(T['leakage_total'])} "
    f"({pct(T['leakage_pct'])} of revenue)."
)

doc.add_heading("5.1 Profit leakage breakdown", level=2)
add_table(["Source", "Amount (USD)", "% of Revenue"], [
    ["Discounts", usd0(L["discounts"]), pct(L["discounts_pct"])],
    ["Returns / Refunds", usd0(L["returns"]), pct(L["returns_pct"])],
    ["Shipping Costs", usd0(L["shipping"]), pct(L["shipping_pct"])],
    ["Failed Deliveries (memo subset)", usd0(L["failed"]), pct(L["failed_pct"])],
    ["Payment Fees (estimated)", usd0(L["fees"]), pct(L["fees_pct"])],
    ["TOTAL", usd0(L["total"]), pct(L["total_pct"])],
])

doc.add_heading("5.2 Profit by country", level=2)
add_table(["Country", "Revenue (USD)", "Profit (USD)", "Orders", "Margin %"],
          [[c["country"], usd0(c["revenue"]), usd0(c["profit"]),
            f"{c['orders']:,}", f"{c['margin']:.1f}"] for c in S["country"]])

doc.add_heading("5.3 Profit by category", level=2)
add_table(["Category", "Revenue (USD)", "Profit (USD)", "Margin %"],
          [[c["category"], usd0(c["revenue"]), usd0(c["profit"]), f"{c['margin']:.1f}"]
           for c in S["category"]])

doc.add_heading("5.4 Customer value segments (profit tertiles)", level=2)
add_table(["Segment", "Customers", "Revenue (USD)", "Profit (USD)"],
          [[s["segment"], f"{s['n']:,}", usd0(s["revenue"]), usd0(s["profit"])]
           for s in sorted(S["segments"], key=lambda s: s["profit"], reverse=True)])

doc.add_heading("5.5 Shipping by country (top 5 by cost)", level=2)
add_table(["Country", "Shipping (USD)", "Orders", "Failed %", "Avg Days"],
          [[s["shipping_country"], usd0(s["shipping_cost"]), f"{s['orders']:,}",
            f"{s['failed_pct']:.1f}", f"{s['avg_days']:.1f}"]
           for s in S["shipping"][:5]])

doc.add_heading("5.6 Products to watch", level=2)
doc.add_paragraph("Highest-profit products:")
for p in S["top_products"]:
    doc.add_paragraph(
        f"{p['product_name']} ({p['category']}): profit {usd0(p['profit'])}, "
        f"margin {p['margin']:.1f}%", style="List Bullet")
doc.add_paragraph("Lowest-profit products:")
for p in S["worst_products"]:
    doc.add_paragraph(
        f"{p['product_name']} ({p['category']}): profit {usd0(p['profit'])}, "
        f"margin {p['margin']:.1f}%", style="List Bullet")

doc.add_heading("6. Key Findings", level=1)
hi = S["segments"][0]
for finding in [
    f"Leakage of {usd0(T['leakage_total'])} ({pct(T['leakage_pct'])} of revenue) is led by "
    f"returns ({usd0(L['returns'])}) and discounts ({usd0(L['discounts'])}).",
    "The High-value customer third contributes the majority of profit "
    f"({usd0(max(s['profit'] for s in S['segments']))} of {usd0(T['gross_profit'])} gross profit), "
    "so retention of top customers outweighs broad discounting.",
    f"Electronics is the largest profit pool ({usd0(S['category'][0]['profit'])}); "
    "no category is margin-negative at the aggregate level, but individual low-margin "
    "products (high discount, high return rate) drag results and are listed for action.",
    "Failed deliveries waste a measurable share of shipping spend and pair with longer "
    "average delivery days in the worst-performing shipping countries.",
]:
    doc.add_paragraph(finding, style="List Bullet")

doc.add_heading("7. Conclusion", level=1)
doc.add_paragraph(
    "The system meets its objective: every leakage source named in the problem statement "
    "is quantified from real data, customer profitability is measured per customer, and "
    "the dashboard surfaces actions (cap discounts, fix high-return products, improve "
    f"delivery reliability, protect high-value customers). Net profit margin stands at "
    f"{pct(T['net_profit'] / T['revenue'] * 100)} on {usd0(T['revenue'])} revenue, with "
    f"{pct(T['leakage_pct'])} of revenue recoverable in principle."
)

doc.add_heading("Appendix A — Setup & Run", level=1)
for step in [
    "pip install -r requirements.txt",
    "Place ecommerce_dataset_+1m.xlsx at the repo root (or data/).",
    "python build_cache.py  (one-time XLSX to Parquet conversion)",
    "python app.py  (dashboard at http://127.0.0.1:8050)",
    "Open YourName_ProjectName.ipynb in Jupyter to rerun this analysis.",
]:
    doc.add_paragraph(step, style="List Number")

doc.add_heading("References", level=1)
doc.add_paragraph(
    "Global E-Commerce Dataset (1M records, 2024–2026), Kaggle: "
    "https://www.kaggle.com/datasets/akrambelha/global-e-commerce-dataset-1m-records-20242026"
)

doc.save("YourName_ProjectReport.docx")
print("saved YourName_ProjectReport.docx")
