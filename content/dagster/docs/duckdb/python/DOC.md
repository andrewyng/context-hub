---
name: duckdb
description: "Dagster DuckDB integration for querying DuckDB from assets and storing asset tables in DuckDB"
metadata:
  languages: "python"
  versions: "0.28.18"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "dagster,duckdb,python,database,assets,io-manager"
---

# dagster-duckdb

Use `dagster-duckdb` when a Dagster project needs a DuckDB connection inside assets or ops, or when you want DuckDB-backed asset storage through Dagster I/O managers.

This guide targets `dagster-duckdb 0.28.18`, which is in the Dagster `1.12.18` release line.

## Install

Install the DuckDB integration alongside the matching Dagster packages:

```bash
python -m pip install \
  "dagster==1.12.18" \
  "dagster-webserver==1.12.18" \
  "dagster-duckdb==0.28.18"
```

If you want the ready-made Pandas I/O manager shown below, install the `pandas` extra:

```bash
python -m pip install \
  "dagster==1.12.18" \
  "dagster-webserver==1.12.18" \
  "dagster-duckdb[pandas]==0.28.18"
```

PyPI currently lists `dagster-duckdb` as requiring Python `>=3.10,<3.15`.

## Configure The Database Path

This package does not have a separate auth flow. You point it at a DuckDB database path and Dagster opens connections for you.

Common local setup:

```bash
export DUCKDB_DATABASE="$PWD/storage/analytics.duckdb"
export DUCKDB_SCHEMA="analytics"
mkdir -p "$(dirname "$DUCKDB_DATABASE")"
```

If you set `database=":memory:"`, Dagster uses an in-memory DuckDB database instead of a file-backed one.

## Query DuckDB With `DuckDBResource`

`DuckDBResource` is the simplest way to execute SQL from an asset or op.

```python
import os

import dagster as dg
from dagster_duckdb import DuckDBResource


@dg.asset
def create_orders_table(duckdb: DuckDBResource) -> None:
    with duckdb.get_connection() as conn:
        conn.execute(
            """
            create schema if not exists analytics;
            create or replace table analytics.orders as
            select 1 as order_id, 42.50 as total
            union all
            select 2 as order_id, 19.99 as total
            """
        )


@dg.asset(deps=[create_orders_table])
def order_count(duckdb: DuckDBResource) -> int:
    with duckdb.get_connection() as conn:
        row = conn.execute(
            "select count(*) from analytics.orders"
        ).fetchone()
    return int(row[0])


defs = dg.Definitions(
    assets=[create_orders_table, order_count],
    resources={
        "duckdb": DuckDBResource(
            database=os.environ["DUCKDB_DATABASE"],
        ),
    },
)
```

Use `connection_config` when you need DuckDB connection options:

```python
DuckDBResource(
    database=os.environ["DUCKDB_DATABASE"],
    connection_config={"arrow_large_buffer_size": True},
)
```

## Store DataFrame Assets In DuckDB

For table-backed assets, Dagster's DuckDB integration is usually paired with a typed I/O manager. The official Dagster integration example for Pandas uses `DuckDBPandasIOManager`.

```python
import os

import dagster as dg
import pandas as pd
from dagster_duckdb_pandas import DuckDBPandasIOManager


@dg.asset(key_prefix=["analytics"])
def orders() -> pd.DataFrame:
    return pd.DataFrame(
        [
            {"order_id": 1, "total": 42.50},
            {"order_id": 2, "total": 19.99},
        ]
    )


@dg.asset(
    ins={"orders": dg.AssetIn(metadata={"columns": ["order_id"]})}
)
def order_ids(orders: pd.DataFrame) -> pd.DataFrame:
    return orders


defs = dg.Definitions(
    assets=[orders, order_ids],
    resources={
        "io_manager": DuckDBPandasIOManager(
            database=os.environ["DUCKDB_DATABASE"],
            schema=os.environ.get("DUCKDB_SCHEMA", "analytics"),
        )
    },
)
```

Important behavior:

- Asset tables use the asset key for their table name and schema.
- A configured I/O manager `schema=` sets the default schema.
- Asset `metadata={"schema": "..."}` overrides `key_prefix`.
- If no schema is set anywhere, the DuckDB I/O manager defaults to `public`.
- `AssetIn(..., metadata={"columns": [...]})` loads only those columns from the upstream table.

For op outputs instead of assets, set schema metadata on the output:

```python
import dagster as dg


@dg.op(out={"orders": dg.Out(metadata={"schema": "analytics"})})
def build_orders() -> list[dict]:
    return [{"order_id": 1, "total": 42.50}]
```

## When To Use The Base I/O Manager API

`dagster-duckdb` provides the base `DuckDBIOManager` class and `build_duckdb_io_manager(...)` helper for custom type handlers.

Use that layer when:

- you want DuckDB-backed storage for a type other than the built-in companion integrations
- you need a custom default load type
- you are standardizing one DuckDB I/O manager implementation for your own project

If you only need Pandas or PySpark support, prefer the packaged integrations and matching extras instead of building your own type handlers first.

## Common Pitfalls

- Keep the release line aligned. `dagster-duckdb 0.28.18` belongs with Dagster `1.12.18`.
- `dagster-duckdb` gives you the DuckDB resource and base I/O manager APIs. For a ready-made Pandas or PySpark table handler, install the matching extras or companion package.
- The DuckDB I/O manager overwrites previous materializations for the same asset table.
- Schema selection is easy to misread: asset metadata wins over `key_prefix`, and both override the I/O manager default schema.
- `connection_config` is passed through to DuckDB connection options. Keep those settings consistent anywhere the same Dagster definitions run.

## Official Sources

- https://docs.dagster.io/api/duckdb
- https://dagster.io/integrations/dagster-duckdb
- https://raw.githubusercontent.com/dagster-io/dagster/master/python_modules/libraries/dagster-duckdb/dagster_duckdb/resource.py
- https://raw.githubusercontent.com/dagster-io/dagster/master/python_modules/libraries/dagster-duckdb/dagster_duckdb/io_manager.py
- https://pypi.org/project/dagster-duckdb/
- https://pypi.org/project/dagster/
