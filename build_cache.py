"""One-time XLSX -> Parquet conversion (run once, then Dash loads parquet fast).

Usage:
    python build_cache.py
    python build_cache.py --force
"""

from __future__ import annotations

import sys
import time

from utils.data_processing import load_dataset, get_aggregates, CACHE_PATH


def main() -> None:
    force = "--force" in sys.argv
    print("Building parquet cache from Global E-Commerce XLSX ...")
    t0 = time.time()
    df = load_dataset(force_rebuild=True)
    print(f"Loaded {len(df):,} rows x {df.shape[1]} cols in {time.time() - t0:.1f}s")
    print(f"Cache written: {CACHE_PATH}")
    t1 = time.time()
    agg = get_aggregates(df)
    print(f"Aggregates verified in {time.time() - t1:.1f}s:")
    print(f"  revenue=${agg['totals']['revenue']:,.0f} "
          f"net_profit=${agg['totals']['net_profit']:,.0f} "
          f"orders={agg['totals']['orders']:,}")
    print(f"  countries={len(agg['country'])} "
          f"categories={len(agg['category'])} "
          f"customers={len(agg['customers'])} "
          f"products={len(agg['products'])}")


if __name__ == "__main__":
    main()
