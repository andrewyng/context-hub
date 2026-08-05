---
name: package
description: "DuckDB Python package guide for 1.5.3: in-process API, connect, execute/sql/df, read_parquet/csv, pandas/polars/arrow integration"
metadata:
  languages: "python"
  versions: "1.5.3"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "duckdb,python,sql,analytics,parquet,pandas,polars,arrow"
---

# duckdb Python Package Guide

## Golden Rule

Use `duckdb.connect(...)` for application code, persistent databases, and threaded work. Reserve top-level `duckdb.sql(...)` for short interactive queries.

## In-Process API

`duckdb` runs DuckDB inside your Python process — no server, no socket. It can:

- run SQL over local Parquet/CSV/JSON via `read_*`
- query pandas/polars/arrow objects by variable name
- persist to a `.duckdb` file or stay in memory
- read from S3-compatible storage with extensions and secrets

## Install

```bash
pip install duckdb==1.5.3
```

```bash
python -c "import duckdb; print(duckdb.__version__)"
```

Requires Python 3.9+.

## duckdb.connect

```python
import duckdb

# in-memory (private to this connection)
con = duckdb.connect()

# persistent file
con = duckdb.connect("app.duckdb")

# read-only (safe when another process has the file)
con = duckdb.connect("app.duckdb", read_only=True)

# with engine config
con = duckdb.connect(
    "app.duckdb",
    config={"threads": 4, "memory_limit": "4GB"},
)

# shared named in-memory database (cross-connection state)
con_a = duckdb.connect("file::memory:?cache=shared&name=analytics")

con.close()
```

Use a dedicated connection per unit of work or per thread.

## execute / sql / df

### `execute()` — parameterized, returns the cursor

```python
con = duckdb.connect()

con.execute(
    "SELECT * FROM range(?) WHERE range < ?",
    [100, 10],
).fetchall()

con.execute(
    "SELECT * FROM range($n) WHERE range < $m",
    {"n": 100, "m": 10},
).fetchall()
```

Use parameters; do not interpolate user input into SQL.

### `sql()` — returns a relation

```python
rel = duckdb.sql("SELECT * FROM range(5)")

rel.fetchall()
rel.fetchone()
rel.df()                  # pandas DataFrame
rel.pl()                  # polars DataFrame
rel.fetch_arrow_table()   # pyarrow Table
rel.fetchnumpy()          # dict of numpy arrays
```

Relations are composable:

```python
rel = duckdb.sql("SELECT * FROM 'data/orders.parquet'")
rel.filter("amount > 100").project("user_id, amount").order("amount DESC").df()
```

### Cursor on a specific connection

```python
con = duckdb.connect("app.duckdb")
con.execute("SELECT count(*) FROM events").fetchone()
con.sql("SELECT * FROM events LIMIT 10").df()
```

## Reading Parquet and CSV

```python
import duckdb

con = duckdb.connect()

# Parquet
con.sql("SELECT * FROM read_parquet('data/orders/*.parquet')").df()
con.sql("SELECT * FROM 'data/orders/*.parquet'").df()  # shorthand for some formats

# CSV
con.sql("""
    SELECT *
    FROM read_csv('data/events.csv',
                  header=true,
                  delim=',',
                  sample_size=100000)
""").df()

# JSON / NDJSON
con.sql("SELECT * FROM read_json_auto('data/payload.json')").df()

# Filter pushdown into Parquet
con.sql("""
    SELECT user_id, sum(amount) AS total
    FROM read_parquet('data/orders/*.parquet')
    WHERE order_date >= DATE '2026-01-01'
    GROUP BY user_id
""").df()
```

Glob patterns, partition discovery, and Hive partitioning are all SQL-side options on `read_parquet`.

## Writing

```python
con.execute("""
    COPY (SELECT * FROM events WHERE kind = 'signup')
    TO 'out/signups.parquet'
    (FORMAT PARQUET, COMPRESSION ZSTD)
""")

con.execute("COPY events TO 'out/events.csv' (HEADER, DELIMITER ',')")
```

## Integration With pandas / polars / arrow

DuckDB queries Python variables by name in the current scope:

```python
import duckdb
import pandas as pd
import polars as pl
import pyarrow as pa

orders_pd = pd.DataFrame([{"user_id": 1, "total": 25}, {"user_id": 2, "total": 50}])
orders_pl = pl.DataFrame({"user_id": [1, 2], "total": [25, 50]})
orders_arrow = pa.table({"user_id": [1, 2], "total": [25, 50]})

# Each works the same way — variable name becomes the table name
duckdb.sql("SELECT user_id, sum(total) AS s FROM orders_pd GROUP BY user_id").df()
duckdb.sql("SELECT * FROM orders_pl WHERE total > 30").pl()
duckdb.sql("SELECT * FROM orders_arrow").fetch_arrow_table()
```

For long-lived registration on a specific connection:

```python
con = duckdb.connect()
con.register("orders", orders_pd)
con.sql("SELECT count(*) FROM orders").fetchone()
con.unregister("orders")
```

Materialize into a real table when later queries should not depend on Python scope:

```python
con.execute("CREATE OR REPLACE TABLE orders AS SELECT * FROM orders_pd")
```

## Persistent vs In-Memory

- `duckdb.connect()` — private in-memory database per connection
- `duckdb.connect(":memory:")` — same as above
- `duckdb.connect("file::memory:?cache=shared&name=analytics")` — named in-memory DB, sharable across connections that use the same name
- `duckdb.connect("app.duckdb")` — persistent file
- `duckdb.connect("app.duckdb", read_only=True)` — concurrent-safe reads

Choose persistence early. Switching from `:memory:` to a file mid-project requires either re-running the bootstrap or exporting/loading tables.

## Basic SQL

DuckDB supports standard PostgreSQL-flavored SQL with strong analytics features:

```sql
-- CTEs
WITH recent AS (
    SELECT * FROM events WHERE created_at >= now() - INTERVAL 7 DAY
)
SELECT kind, count(*) FROM recent GROUP BY kind;

-- Window functions
SELECT
    user_id,
    amount,
    sum(amount) OVER (PARTITION BY user_id ORDER BY ts) AS running_total
FROM orders;

-- Struct / list / map types
SELECT {'name': 'a', 'qty': 3} AS rec;
SELECT [1, 2, 3] AS nums;
SELECT unnest([10, 20, 30]) AS n;

-- DESCRIBE / SUMMARIZE
DESCRIBE orders;
SUMMARIZE orders;
```

DuckDB also supports `EXPORT DATABASE` / `IMPORT DATABASE` and `ATTACH 'other.duckdb'` for cross-database queries.

## S3 / HTTP With Secrets

```python
con = duckdb.connect()
con.execute("INSTALL httpfs")
con.execute("LOAD httpfs")

con.execute("""
    CREATE OR REPLACE SECRET s3_creds (
        TYPE s3,
        PROVIDER credential_chain,
        REGION 'us-east-1'
    )
""")

con.sql("""
    SELECT *
    FROM read_parquet('s3://bucket/path/data.parquet')
    LIMIT 10
""").df()
```

`credential_chain` uses the standard AWS credential resolution flow.

## Common Pitfalls

### `duckdb.sql(...)` uses a shared default connection

Top-level helpers operate on a global in-memory connection. Wrong default for request handlers, background jobs, and threaded code.

### Threads

A single connection is thread-safe but locked while a query runs. Use `con.cursor()` or per-thread connections for parallelism.

### `:memory:` vs named in-memory

`:memory:` is private per connection. A named in-memory database can share state — use only when intentional.

### `executemany()` is not the bulk-load path

For bulk ingest, prefer:

- `CREATE TABLE t AS SELECT * FROM df_name`
- `INSERT INTO t SELECT * FROM df_name`
- `read_parquet(...)`, `read_csv(...)`, `COPY`

### DataFrame scan is not a persisted table

Querying a Python variable by name is great for analysis but the underlying object is still in Python scope. Use `CREATE TABLE ... AS SELECT ...` for durability.

### NumPy worker-thread import

If threaded code fetches pandas/numpy results, import `numpy.core.multiarray` before spawning threads.

### Notebook DESCRIBE/SUMMARIZE

Wrap in a subquery if results render empty: `FROM (DESCRIBE tbl)`.

## Version-Sensitive Notes For 1.5.3

- `1.5.x` switched the `httpfs` extension backend from `httplib` to `curl`. Re-test proxy, TLS, and remote filesystem behavior when upgrading from 1.4.x.
- The single-arrow lambda syntax is deprecated; DuckDB 2.0 will disable it by default. Use `lambda x: ...` syntax in new SQL.
- Pin DuckDB and test extension loading in CI when your project relies on extensions.

## Official Sources

- Python client overview: https://duckdb.org/docs/stable/clients/python/overview
- DB-API reference: https://duckdb.org/docs/stable/clients/python/dbapi
- Conversion / result methods: https://duckdb.org/docs/stable/clients/python/conversion
- pandas integration: https://duckdb.org/docs/stable/guides/python/import_pandas
- polars integration: https://duckdb.org/docs/stable/guides/python/polars
- Known Python issues: https://duckdb.org/docs/stable/clients/python/known_issues
- S3 / secrets: https://duckdb.org/docs/stable/core_extensions/httpfs/s3api
- PyPI: https://pypi.org/project/duckdb/
