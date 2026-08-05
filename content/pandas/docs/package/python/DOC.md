---
name: package
description: "pandas package guide for Python 3.0.3: DataFrame/Series, IO, selection, groupby, joins, reshape, datetime, and missing data"
metadata:
  languages: "python"
  versions: "3.0.3"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "pandas,dataframe,series,io,groupby,join,reshape,datetime"
---

# pandas Python Package Guide

## Golden Rule

Use `pandas` when you need labeled tabular data in Python. `Series` is 1D, `DataFrame` is 2D. Prefer vectorized operations over `apply`/`map` over Python loops.

## Installation

```bash
pip install pandas==3.0.3
```

```bash
conda install -c conda-forge pandas
```

Common extras:

```bash
pip install "pandas[parquet]"
pip install "pandas[excel]"
pip install "pandas[performance]"
pip install "pandas[all]"
```

## DataFrame And Series

```python
import pandas as pd

s = pd.Series([1, 2, 3], name="x", index=["a", "b", "c"])

df = pd.DataFrame(
    {
        "city": ["SF", "NYC", "SEA"],
        "sales": [10, 15, 7],
        "date": pd.to_datetime(["2026-01-01", "2026-01-02", "2026-01-03"]),
    }
)

df.dtypes
df.shape
df.head()
df.describe(include="all")
```

## IO

### CSV

```python
df = pd.read_csv("input.csv", parse_dates=["date"], dtype={"id": "int64"})
df.to_csv("out.csv", index=False)
```

### Parquet

```python
df = pd.read_parquet("input.parquet")
df.to_parquet("out.parquet", index=False, compression="zstd")
```

### SQL

```python
from sqlalchemy import create_engine

engine = create_engine("postgresql+psycopg://user:pass@host/db")
df = pd.read_sql("select * from orders where created_at > %(d)s", engine, params={"d": "2026-01-01"})
df.to_sql("orders_copy", engine, if_exists="replace", index=False)
```

For closer database type round-trips, pass `dtype_backend="pyarrow"`.

## Selection

```python
df["sales"]                  # single column -> Series
df[["city", "sales"]]        # multiple columns -> DataFrame

df.loc[0, "sales"]           # label-based
df.loc[df.index[:2], ["city", "sales"]]

df.iloc[0, 1]                # position-based
df.iloc[:2, :]
df.iloc[-1]
```

Rule of thumb:

- `[]` for simple column access
- `loc` for label-based row/column selection
- `iloc` for position-based selection

## Filtering

```python
df[df["sales"] > 8]
df[(df["sales"] > 8) & (df["city"] != "NYC")]
df.query("sales > 8 and city != 'NYC'")
df[df["city"].isin(["SF", "SEA"])]
df[df["city"].str.startswith("S")]
```

Use `&`, `|`, `~` with parentheses, not Python `and`/`or`/`not`.

## GroupBy / Agg

```python
df.groupby("city")["sales"].sum()

df.groupby("city").agg(
    total=("sales", "sum"),
    n=("sales", "count"),
    avg=("sales", "mean"),
)

df.groupby(["city", df["date"].dt.month]).agg({"sales": ["sum", "mean"]})
```

`groupby` is the split-apply-combine tool. Use `dropna=False` to keep NaN groups. Use `value_counts()` for category counts.

## Merge / Join / Concat

```python
customers = pd.DataFrame({"customer_id": [1, 2], "name": ["A", "B"]})
orders = pd.DataFrame({"customer_id": [1, 1, 2], "total": [25, 30, 20]})

# merge on key column
customers.merge(orders, on="customer_id", how="left")

# join on index
customers.set_index("customer_id").join(orders.set_index("customer_id"), how="inner")

# stack DataFrames
pd.concat([df1, df2], axis=0, ignore_index=True)  # rows
pd.concat([df1, df2], axis=1)                     # columns
```

`how=` accepts `"inner"`, `"left"`, `"right"`, `"outer"`, `"cross"`.

## Reshape

```python
# wide -> long
long_df = df.melt(id_vars=["city"], value_vars=["sales"], var_name="metric", value_name="val")

# long -> wide
wide_df = long_df.pivot(index="city", columns="metric", values="val")

# aggregated pivot
pd.pivot_table(df, index="city", columns="date", values="sales", aggfunc="sum")

# multi-index reshape
df.set_index(["city", "date"]).unstack("date")
```

## Datetime

```python
df["date"] = pd.to_datetime(df["date"], utc=True)
df["month"] = df["date"].dt.month
df["dow"] = df["date"].dt.day_name()

# date range
pd.date_range("2026-01-01", "2026-12-31", freq="MS")

# resample needs a datetime index
ts = df.set_index("date").sort_index()
ts["sales"].resample("MS").sum()
ts["sales"].rolling("7D").mean()
```

## Missing Data

```python
df.isna()
df.isna().sum()
df.dropna(subset=["sales"])
df.fillna({"sales": 0, "city": "unknown"})
df["sales"].ffill()
df["sales"].bfill()
```

In pandas 3.0 the default string dtype changed; do not assume `object` dtype or a specific missing sentinel. Use `pd.NA`-aware checks.

## Apply / Map vs Vectorized

Vectorized first. Reach for `apply`/`map` only when no vectorized form exists.

```python
# Vectorized (fast)
df["sales_with_tax"] = df["sales"] * 1.1
df["city_lower"] = df["city"].str.lower()

# Series.map: per-element scalar -> scalar
df["region"] = df["city"].map({"SF": "west", "NYC": "east", "SEA": "west"})

# Series.apply: when no vectorized form exists
df["sales_str"] = df["sales"].apply(lambda v: f"${v:,.2f}")

# DataFrame.apply along axis: slow; avoid when possible
df["row_total"] = df[["sales"]].apply(sum, axis=1)
```

For column expressions, pandas 3.0 supports `pd.col()`:

```python
df = df.assign(double_sales=pd.col("sales") * 2)
```

## Common Pitfalls

### Chained assignment

In pandas 3.0, chained assignment will not mutate.

```python
# Wrong
df[df["sales"] > 0]["sales"] = 0

# Right
df.loc[df["sales"] > 0, "sales"] = 0
```

### SettingWithCopyWarning replaced by Copy-on-Write

Operations that used to silently mutate views now produce independent objects. Reassign rather than mutate.

### Boolean operators on Series

Use `&`/`|`/`~` with parentheses around comparisons.

### Optional IO dependencies

`read_excel`, `read_parquet`, `to_markdown`, S3/GCS URLs, and SQLAlchemy backends each need their own packages.

## Version-Sensitive Notes For 3.0.3

- `3.0.0` (Jan 2026) introduced Copy-on-Write defaults, removed chained-assignment as a mutation pattern, added `pd.col()`, and changed the default string dtype.
- `3.0.1` and later patch releases fix `pd.col()` unary operator edge cases, pyarrow string operation regressions, and `merge()` issues with NaN keys on pyarrow-backed strings.
- If a project mixes pyarrow-backed strings with joins or unary `pd.col()`, prefer the latest 3.0.x.

## Official Sources

- Docs root: https://pandas.pydata.org/docs/
- API reference: https://pandas.pydata.org/docs/reference/index.html
- Installation: https://pandas.pydata.org/docs/getting_started/install.html
- IO guide: https://pandas.pydata.org/docs/user_guide/io.html
- GroupBy guide: https://pandas.pydata.org/docs/user_guide/groupby.html
- Merge/join: https://pandas.pydata.org/docs/user_guide/merging.html
- Reshape: https://pandas.pydata.org/docs/user_guide/reshaping.html
- Time series: https://pandas.pydata.org/docs/user_guide/timeseries.html
- Missing data: https://pandas.pydata.org/docs/user_guide/missing_data.html
- Release notes 3.0.0: https://pandas.pydata.org/docs/whatsnew/v3.0.0.html
- PyPI package: https://pypi.org/project/pandas/
