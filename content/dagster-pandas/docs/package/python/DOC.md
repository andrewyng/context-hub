---
name: package
description: "dagster-pandas package guide for validating pandas DataFrames in Dagster jobs with typed inputs and outputs"
metadata:
  languages: "python"
  versions: "0.28.18"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "dagster,dagster-pandas,python,pandas,dataframe,data-validation,data-orchestration"
---

# dagster-pandas Python Package Guide

## Golden Rule

Use `dagster-pandas` when you want Dagster to enforce runtime checks on `pandas.DataFrame` values crossing Dagster op boundaries. Define a named dataframe type with `create_dagster_pandas_dataframe_type(...)`, apply it with `In` and `Out`, and keep `dagster-pandas` on the same release line as the rest of your Dagster packages.

For this guide, `dagster-pandas==0.28.18` belongs to the Dagster `1.12.18` release line.

## Install

Install the package alongside matching Dagster packages and `pandas`:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install \
  "dagster==1.12.18" \
  "dagster-webserver==1.12.18" \
  "dagster-pandas==0.28.18" \
  pandas
```

If your project already pins Dagster, keep `dagster-pandas` on the matching release line instead of upgrading it independently.

## Prerequisites

Before using `dagster-pandas`, make sure your runtime already has:

- a Dagster project with a loadable `defs = dg.Definitions(...)`
- `pandas` installed in the same environment as Dagster
- a real data-loading step such as `pd.read_csv(...)`, database access, or an API client that produces a `pandas.DataFrame`

`dagster-pandas` is a local validation library. There is no separate service, token, or authentication flow to configure.

## Configure Your Input Path

This example reads a CSV from an environment variable:

```bash
export ORDERS_CSV_PATH="$PWD/data/orders.csv"
```

## Define A Validated DataFrame Type

The core workflow is:

1. create a Dagster dataframe type
2. load a `pandas.DataFrame`
3. return it from an op whose output uses that Dagster type
4. accept the same type on downstream op inputs when you want the boundary checked again

```python
# src/my_project/orders.py
import os

import dagster as dg
import pandas as pd
from dagster_pandas import (
    PandasColumn,
    create_dagster_pandas_dataframe_type,
)


OrdersDataFrame = create_dagster_pandas_dataframe_type(
    name="OrdersDataFrame",
    description="Orders loaded from a CSV extract",
    columns=[
        PandasColumn.integer_column("order_id"),
        PandasColumn.string_column("customer_id"),
        PandasColumn.datetime_column("created_at"),
    ],
)


@dg.op(out=dg.Out(OrdersDataFrame))
def load_orders() -> pd.DataFrame:
    dataframe = pd.read_csv(
        os.environ["ORDERS_CSV_PATH"],
        parse_dates=["created_at"],
    )
    return dataframe[["order_id", "customer_id", "created_at"]]


@dg.op(ins={"orders": dg.In(OrdersDataFrame)})
def count_orders(orders: pd.DataFrame) -> int:
    return len(orders)


@dg.job
def orders_job():
    count_orders(load_orders())
```

What matters in this example:

- `create_dagster_pandas_dataframe_type(...)` creates the Dagster type Dagster will validate at runtime
- `PandasColumn.*_column(...)` declares expected columns and their logical types
- `parse_dates=["created_at"]` happens in `pandas`; `dagster-pandas` checks the dataframe you return, it does not parse or coerce columns for you
- `dg.Out(OrdersDataFrame)` and `dg.In(OrdersDataFrame)` are what actually attach the custom dataframe type to the Dagster boundary

## Use The Built-In `DataFrame` Type When You Only Need A Pandas Value

If you only need a `pandas.DataFrame` to move between ops and do not need column validation, use the packaged `DataFrame` Dagster type directly:

```python
import os

import dagster as dg
import pandas as pd
from dagster_pandas import DataFrame


@dg.op(out=dg.Out(DataFrame))
def load_raw_orders() -> pd.DataFrame:
    return pd.read_csv(os.environ["ORDERS_CSV_PATH"])
```

This is the simpler choice when schema enforcement is handled elsewhere and you only want a recognized pandas dataframe type in Dagster.

## Expose Definitions And Run Locally

Expose your job from a loadable module:

```python
# src/my_project/definitions.py
import dagster as dg

from .orders import orders_job


defs = dg.Definitions(jobs=[orders_job])
```

Run the code location locally:

```bash
dagster dev -m my_project.definitions
```

## Common Pitfalls

- Version mismatch. Keep `dagster-pandas` on the matching Dagster release line.
- Expecting automatic coercion. Parse datetimes, numbers, and missing values in `pandas` before returning the dataframe.
- Forgetting the Dagster boundary. A custom dataframe type is only enforced where you attach it with `In` or `Out`.
- Validating columns you later drop or rename. The dataframe you return must still match the declared columns exactly.
- Treating the package like an IO layer. `dagster-pandas` validates dataframe values; it does not read files, talk to databases, or manage storage.

## Version Notes For `0.28.18`

- `dagster-pandas==0.28.18` belongs to the Dagster `1.12.18` release line.
- The package is centered on Dagster types for `pandas.DataFrame` values, so it fits best where runtime type checks on op inputs and outputs are the main requirement.

## Official Sources

- `https://github.com/dagster-io/dagster/tree/master/python_modules/libraries/dagster-pandas`
- `https://github.com/dagster-io/dagster/tree/master/python_modules/libraries/dagster-pandas/dagster_pandas`
- `https://docs.dagster.io/api/python-api/libraries/dagster-pandas`
- `https://docs.dagster.io/guides/build/jobs`
- `https://pypi.org/project/dagster-pandas/`
