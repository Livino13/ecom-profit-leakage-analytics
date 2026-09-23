# ProfitLens — Global E-Commerce Profit Leakage & Customer Value Analytics

## Live Demo

**https://profitlens-dashboard.onrender.com**

> Hosted on Render's free tier — the first load can take a minute while the
> instance wakes up. The live demo serves a 20k-row sample
> (`data/demo.parquet`); the full 1M+ rows run locally (see Dataset below).

A Python analytics dashboard built with **Dash**, **Plotly**, **Pandas**, and **NumPy**.
All KPIs, charts, maps, and tables are calculated from the Global E-Commerce
Dataset (1M+ records, 2024–2026). Values are in **USD**. No hardcoded metrics.

## Quick start

Single-file submission bundle (what this repo tracks):

```bash
pip install -r requirements.txt
python dashboard.py   # dev server at http://127.0.0.1:8050
```

Multi-file dev layout (local only, not tracked here):

```bash
pip install -r requirements.txt
python build_cache.py   # one-time: converts the 376 MB XLSX to data/processed.parquet
python app.py           # dev server at http://127.0.0.1:8050
```

The dataset file `ecommerce_dataset_+1m.xlsx` must sit at the repo root (or in
`data/`). On startup the app loads `data/processed.parquet` once and serves all
four pages from memory — the CSV/XLSX is never reloaded per page.

## Dataset

Global E-Commerce Dataset (1M+ records, 2024–2026):
https://www.kaggle.com/datasets/akrambelha/global-e-commerce-dataset-1m-records-20242026

Download the XLSX and place it at the repo root as `ecommerce_dataset_+1m.xlsx`,
then run `python build_cache.py`.

## Pages

| Route | Page | Contents |
|---|---|---|
| `/` | Executive Overview | KPI cards, Revenue vs Profit trend, Profit by Country world map, leakage sources, profit by category, product table |
| `/leakage` | Profit Leakage | Leakage breakdown, Revenue-to-Profit waterfall, Discount vs Margin scatter, Global Shipping & Delivery map + summary cards |
| `/customers` | Customer Value | High/Medium/Low segment cards (profit tertiles), customer revenue-vs-profit scatter, CLV ranking, customer detail table |
| `/products` | Product Analysis | Category revenue vs profit, product profit ranking, margin vs discount, low/negative-margin action table |

## Project structure

```
app.py                  # Dash app: loads data once, sidebar routing, 4 pages
build_cache.py          # one-time XLSX -> Parquet conversion + verification
requirements.txt
pages/                  # executive_overview, profit_leakage, customer_value, product_analysis
components/             # sidebar, kpi_cards, charts, world_map, tables, theme
utils/                  # data_processing, calculations, formatting
assets/style.css        # pastel enterprise theme (auto-served by Dash)
data/processed.parquet  # cache built by build_cache.py (git-ignored if large)
```

## Calculation notes

- **Revenue** = `SUM(total_price_usd)`; **Orders** = unique `order_id`;
  **AOV** = revenue / orders.
- **Leakage**: discounts `SUM(discount_amount_usd)`; returns `SUM(total_price_usd
  WHERE order_status = 'Returned')`; shipping `SUM(shipping_cost_usd)`; failed
  delivery = shipping `WHERE delivery_status = 'Failed'` (memo subset, split out
  in the waterfall so nothing is double counted).
- **Payment fees** are estimated per `payment_method` (Credit 2.2%, PayPal 2.5%,
  Apple Pay 2.0%, Debit 1.8%, Bank Transfer 1.0%) and labelled "Estimated" —
  the dataset has no fee column.
- **Net profit** = `SUM(profit_usd)` − shipping − fees.
- **Geography** is country-level only (`country` for profit, `shipping_country`
  for shipping). No regional groupings.
- **Customer segments** High/Medium/Low come from tertiles of actual customer
  profit; **CLV** = lifetime profit per customer.
