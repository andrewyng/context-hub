---
name: package
description: "polars package guide for Python 1.41.2: DataFrame, LazyFrame, expressions, scan_*, group_by, joins, SQL, and lazy execution"
metadata:
  languages: "python"
  versions: "1.41.2"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "polars,dataframe,lazyframe,expressions,parquet,sql,lazy"
---

# polars Python Package Guide

## Golden Rule

Stay in the expression API. Use `LazyFrame` + `scan_*` for file pipelines, `.collect()` at the boundary. Avoid `apply`/Python loops.

## Install

```bash
python -m pip install polars==1.41.2
```

```bash
uv add polars==1.41.2
conda install -c conda-forge polars=1.41.2
```

Extras:

```bash
python -m pip install "polars[pyarrow]==1.41.2"
python -m pip install "polars[numpy,fsspec]==1.41.2"
python -m pip install "polars[all]==1.41.2"
```

## DataFrame And LazyFrame

```python
import polars as pl

df = pl.DataFrame(
    {
        "city": ["sf", "nyc", "la"],
        "count": [10, 7, 5],
        "active": [True, True, False],
    }
)

# eager -> lazy
lf = df.lazy()

# lazy -> eager
df2 = lf.collect()
```

Core types:

- `pl.DataFrame` — eager, materialized
- `pl.LazyFrame` — deferred plan
- `pl.Series` — single column
- `pl.Expr` — reusable column expression

## scan_csv / scan_parquet

Lazy readers enable predicate and projection pushdown.

```python
lf = pl.scan_parquet("data/events/*.parquet")
lf = pl.scan_csv("data/events.csv", try_parse_dates=True, infer_schema_length=10_000)
lf = pl.scan_ndjson("data/events.ndjson")
lf = pl.scan_ipc("data/events.arrow")
```

Do not use `pl.read_csv(...).lazy()` — the file is already read eagerly.

## select / filter / with_columns / group_by / agg

```python
import polars as pl

result = (
    pl.scan_parquet("data/events/*.parquet")
    .filter(pl.col("event_date") >= pl.date(2026, 1, 1))
    .with_columns(
        count_doubled=pl.col("count") * 2,
        city_upper=pl.col("city").str.to_uppercase(),
    )
    .select("event_date", "user_id", "city_upper", "count_doubled")
    .group_by("user_id")
    .agg(
        events=pl.len(),
        total=pl.col("count_doubled").sum(),
        first_city=pl.col("city_upper").first(),
    )
    .sort("total", descending=True)
    .collect()
)
```

- `select` — pick/derive columns (replaces output schema)
- `with_columns` — add/replace columns (keeps existing)
- `filter` — row filter; expressions returning Boolean
- `group_by` + `agg` — split-apply-combine
- `sort`, `unique`, `drop_nulls`, `head`, `tail`, `slice`

## Expressions

```python
pl.col("amount")
pl.col("amount") * 1.1
pl.col("name").str.to_lowercase().str.strip_chars()
pl.col("ts").dt.year()

pl.when(pl.col("amount") > 100).then(pl.lit("big")).otherwise(pl.lit("small"))

pl.col("amount").sum().over("user_id")   # window
pl.col("amount").rank(descending=True)
pl.col("ts").is_between(pl.date(2026, 1, 1), pl.date(2026, 12, 31))

pl.col("tags").list.contains("vip")
pl.col("payload").struct.field("price")
```

Combine, reuse, and pass expressions as variables. `pl.len()` for row count.

## Joins

```python
orders = pl.DataFrame({"user_id": [1, 1, 2, 3], "amount": [40, 60, 10, 25]})
users = pl.DataFrame({"user_id": [1, 2, 3], "plan": ["pro", "free", "pro"]})

orders.join(users, on="user_id", how="left")
orders.join(users, left_on="user_id", right_on="user_id", how="inner")
orders.join(users, on="user_id", how="anti")
orders.join(users, on="user_id", how="semi")
orders.join(users, on="user_id", how="full", coalesce=True)

# time-aware joins
orders_sorted = orders.sort("ts")
prices_sorted = prices.sort("ts")
orders_sorted.join_asof(prices_sorted, on="ts", by="symbol", strategy="backward")
```

## SQL Interface

```python
import polars as pl

ctx = pl.SQLContext(orders=orders_lf, users=users_lf)

result = ctx.execute(
    """
    select u.plan, sum(o.amount) as total
    from orders o
    join users u using (user_id)
    group by u.plan
    order by total desc
    """,
    eager=True,
)
```

Or inline:

```python
pl.sql(
    "select user_id, sum(amount) as total from orders group by user_id",
    eager=True,
)
```

Expression API is the primary interface; SQL is a convenience layer.

## sink_parquet (and friends)

Stream results to disk without materializing the whole frame:

```python
(
    pl.scan_parquet("raw/*.parquet")
    .filter(pl.col("status") == "ok")
    .group_by("user_id")
    .agg(total=pl.col("amount").sum())
    .sink_parquet("out/user_totals.parquet", compression="zstd")
)
```

Also: `sink_csv`, `sink_ndjson`, `sink_ipc`. These run the plan in streaming mode where supported.

For in-memory writes from a `DataFrame`:

```python
df.write_parquet("out.parquet", compression="zstd", statistics=True)
df.write_csv("out.csv")
df.write_ipc("out.arrow")
```

## Lazy Execution Model

A `LazyFrame` is a query plan, not data. Steps:

1. Build with `scan_*` and expression methods.
2. Inspect plan: `lf.explain()` (logical), `lf.explain(optimized=True)`.
3. Execute: `lf.collect()` (in-memory) or `lf.sink_*` (streaming to disk).

The optimizer applies:

- predicate pushdown
- projection pushdown
- common subexpression elimination
- slice pushdown

Schema access on a lazy plan:

```python
lf.collect_schema()    # preferred; cheap
# Avoid lf.schema / lf.columns / lf.dtypes on lazy frames — can do work and warn.
```

Streaming engine (opt-in, plan-dependent):

```python
lf.collect(engine="streaming")
```

## Pandas / Arrow Interop

```python
import pandas as pd
import polars as pl
import pyarrow as pa

pl_df = pl.from_pandas(pd.DataFrame({"x": [1, 2, 3]}))
pl_df.to_pandas()

pl.from_arrow(pa.table({"x": [1, 2, 3]}))
pl_df.to_arrow()
```

Convert at the edges, not in the middle of a pipeline.

## Cloud Storage

```python
lf = pl.scan_parquet(
    "s3://bucket/events/date=2026-05-29/*.parquet",
    storage_options={"aws_region": "us-west-2"},
)
```

`credential_provider=` is available for codebases that need a programmatic credential source. For shared defaults, see `pl.Config.set_default_credential_provider(...)`.

## Common Pitfalls

- `read_csv(...).lazy()` defeats the point. Use `scan_csv(...)`.
- Python loops / `DataFrame.map_rows` are slow. Stay in expressions.
- CSV schema inference: pass `schema=`, `schema_overrides=`, or a larger `infer_schema_length=`.
- Ambiguous row records: pass `orient="row"` to `pl.DataFrame(...)`.
- Lazy schema warnings: use `collect_schema()` instead of `.schema` on lazy frames.
- Strict casting: invalid values raise; opt into non-strict explicitly.
- pandas habits: Polars is stricter on dtypes and nulls; cast deliberately.

## Version-Sensitive Notes

- This guide targets `1.41.2`, the current PyPI release on 2026-05-29.
- The Version 1 upgrade guide still applies: stricter constructors, `replace_strict`, `orient="row"`, `collect_schema()`.
- Streaming execution is opt-in via `collect(engine="streaming")` or `sink_*` and is plan-dependent.

## Official Sources

- Docs: https://docs.pola.rs/
- User guide: https://docs.pola.rs/user-guide/
- Expressions: https://docs.pola.rs/user-guide/concepts/expressions-and-contexts/
- Lazy API: https://docs.pola.rs/user-guide/lazy/
- SQL: https://docs.pola.rs/user-guide/sql/intro/
- Python API: https://docs.pola.rs/api/python/stable/reference/
- `scan_parquet`: https://docs.pola.rs/api/python/stable/reference/api/polars.scan_parquet.html
- `sink_parquet`: https://docs.pola.rs/api/python/stable/reference/api/polars.LazyFrame.sink_parquet.html
- Version 1 upgrade: https://docs.pola.rs/releases/upgrade/1/
- PyPI: https://pypi.org/project/polars/
