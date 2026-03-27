---
name: polars
description: "dagster-polars package guide for loading Polars DataFrames and LazyFrames through Dagster IO managers"
metadata:
  languages: "python"
  versions: "0.27.9"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "dagster,dagster-polars,python,polars,dataframe,lazyframe,io-manager"
---

# dagster-polars Python Package Guide

## Golden Rule

Use `dagster-polars` as a Dagster IO-layer integration for `polars` objects: annotate your assets or ops with `pl.DataFrame` or `pl.LazyFrame`, register the matching IO manager in `dg.Definitions(...)`, and let Dagster load and store those values for you.

The integration defaults to eager `pl.DataFrame` behavior unless you annotate the boundary with `pl.LazyFrame`.

## Install

Create or activate a Python environment first:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "dagster-polars==0.27.9"
```

Optional extras published on PyPI for `0.27.9`:

```bash
python -m pip install "dagster-polars[deltalake]==0.27.9"
python -m pip install "dagster-polars[gcp]==0.27.9"
python -m pip install "dagster-polars[patito]==0.27.9"
```

## Prerequisites

Before wiring this into a project, make sure you already have:

- a Dagster code location with a loadable `defs = dg.Definitions(...)`
- a storage location for your IO manager, such as a local directory, Delta Lake path, or BigQuery dataset
- Python `3.10` or newer

For a simple local Parquet setup, keep the storage root in an environment variable:

```bash
export POLARS_BASE_DIR="$PWD/.dagster/polars"
```

## Register A Polars IO Manager

The simplest setup uses `PolarsParquetIOManager` and a local filesystem path:

```python
# src/my_project/definitions.py
import os

import dagster as dg
import polars as pl
from dagster_polars import PolarsParquetIOManager


@dg.asset(io_manager_key="polars_io")
def orders() -> pl.DataFrame:
    return pl.DataFrame(
        {
            "order_id": [1, 2, 3],
            "customer_id": ["c1", "c1", "c2"],
            "amount": [19.5, 7.0, 12.25],
        }
    )


@dg.asset(io_manager_key="polars_io")
def customer_totals(orders: pl.LazyFrame) -> pl.LazyFrame:
    return orders.group_by("customer_id").agg(pl.col("amount").sum())


defs = dg.Definitions(
    assets=[orders, customer_totals],
    resources={
        "polars_io": PolarsParquetIOManager(
            base_dir=os.environ["POLARS_BASE_DIR"],
        ),
    },
)
```

What this example is doing:

- `PolarsParquetIOManager(base_dir=...)` initializes the storage backend
- `orders() -> pl.DataFrame` writes an eager Polars dataframe
- `customer_totals(orders: pl.LazyFrame) -> pl.LazyFrame` tells the IO manager to scan lazily on load and sink lazily on output
- `io_manager_key="polars_io"` binds both assets to the registered resource

Run the code location locally with:

```bash
dagster dev -m my_project.definitions
```

## Load Only The Columns You Need

The integration supports column projection through input metadata. This is useful when an upstream table is wide and the downstream asset only needs a few fields.

```python
import dagster as dg
import polars as pl


@dg.asset(
    io_manager_key="polars_io",
    ins={
        "orders": dg.AssetIn(
            key="orders",
            metadata={"columns": ["order_id", "amount"]},
        )
    },
)
def order_amounts(orders: pl.DataFrame) -> pl.DataFrame:
    return orders
```

The exact behavior depends on the IO manager, but `dagster-polars` uses the `columns` metadata key for partial loading.

## Partitioned Assets

If your upstream asset is partitioned and each partition lives at a separate path, annotate the input as a dictionary of Polars objects:

```python
from typing import Dict

import dagster as dg
import polars as pl


daily_partitions = dg.DailyPartitionsDefinition(start_date="2026-01-01")


@dg.asset(
    io_manager_key="polars_io",
    partitions_def=daily_partitions,
)
def daily_orders() -> pl.DataFrame:
    return pl.DataFrame({"order_id": [1], "amount": [19.5]})


@dg.asset(io_manager_key="polars_io")
def all_partitions(
    daily_orders: Dict[str, pl.DataFrame],
) -> pl.DataFrame:
    return pl.concat(daily_orders.values())
```

If some upstream partitions may be missing, enable the documented metadata flag:

```python
@dg.asset(
    io_manager_key="polars_io",
    ins={
        "daily_orders": dg.AssetIn(
            metadata={"allow_missing_partitions": True},
        )
    },
)
def maybe_complete(
    daily_orders: Dict[str, pl.LazyFrame],
) -> pl.DataFrame:
    return pl.concat([frame.collect() for frame in daily_orders.values()])
```

## Skip Writes With Optional Outputs

The integration treats optional Polars outputs specially: if the asset returns `None`, the IO manager skips saving that output.

```python
from typing import Optional

import dagster as dg
import polars as pl


@dg.asset(io_manager_key="polars_io")
def latest_snapshot() -> Optional[pl.DataFrame]:
    has_new_data = False
    if not has_new_data:
        return None

    return pl.DataFrame({"status": ["updated"]})
```

## BigQuery IO Manager

`dagster-polars` also ships a BigQuery IO manager. Install the `gcp` extra and configure the GCP project in environment variables:

```bash
export GCP_PROJECT="my-gcp-project"
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

```python
import dagster as dg
import polars as pl
from dagster_polars import PolarsBigQueryIOManager


@dg.asset(io_manager_key="warehouse_io")
def warehouse_orders() -> pl.DataFrame:
    return pl.DataFrame({"order_id": [1], "amount": [19.5]})


defs = dg.Definitions(
    assets=[warehouse_orders],
    resources={
        "warehouse_io": PolarsBigQueryIOManager(
            project=dg.EnvVar("GCP_PROJECT"),
        ),
    },
)
```

The maintainer docs also note a `gcp_credentials` configuration field when you need to pass a base64-encoded service account key instead of relying on standard Google authentication.

## Common Pitfalls

- Type annotation controls load behavior. If you want lazy reads and writes, annotate the boundary with `pl.LazyFrame`; otherwise the integration loads eagerly as `pl.DataFrame`.
- Column projection is metadata-driven. The `columns` hint belongs on the Dagster input definition, not inside Polars code.
- Partition loading changes the input shape. For multi-partition loads, use `dict[str, pl.DataFrame]` or `dict[str, pl.LazyFrame]` instead of a single dataframe.
- Optional outputs are skipped when they return `None`. Do not assume a physical file or table exists for every run.
- Most filesystem-style IO managers write each partition to a separate location. For storage-native partitioning in one dataset, use an IO manager that documents a `partition_by` metadata path, such as the Delta Lake integration.

## Version Notes For `0.27.9`

- PyPI lists `dagster-polars==0.27.9` with `Requires: Python >=3.10`.
- PyPI publishes the extras `deltalake`, `gcp`, and `patito` for `0.27.9`.
- The current Dagster docs page still refers to installing the Delta Lake integration with `dagster-polars[delta]`, but the PyPI metadata for `0.27.9` publishes the extra as `deltalake`.

## Official Sources

- https://docs.dagster.io/api/python-api/libraries/dagster-polars
- https://docs.dagster.io/integrations/libraries/polars
- https://pypi.org/project/dagster-polars/
- https://github.com/dagster-io/community-integrations/tree/main/libraries/dagster-polars
