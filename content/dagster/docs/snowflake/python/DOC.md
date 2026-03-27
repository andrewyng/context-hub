---
name: snowflake
description: "dagster-snowflake package guide for querying Snowflake from Dagster assets and wiring Snowflake-backed asset storage"
metadata:
  languages: "python"
  versions: "0.28.18"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "dagster,dagster-snowflake,python,snowflake,sql,assets,data-warehouse"
---

# dagster-snowflake Python Package Guide

## Golden Rule

Use `dagster-snowflake` for Snowflake connections inside Dagster, keep credentials in environment variables, and pin it to the same Dagster release line as the rest of your Dagster packages.

For this guide, `dagster-snowflake==0.28.18` belongs to the Dagster `1.12.18` release line.

## Install

Install the Snowflake integration alongside matching Dagster packages:

```bash
python -m pip install \
  "dagster==1.12.18" \
  "dagster-webserver==1.12.18" \
  "dagster-snowflake==0.28.18"
```

If you want Dagster to load and store Pandas DataFrames as Snowflake tables, install the companion I/O manager package too:

```bash
python -m pip install \
  "dagster-snowflake==0.28.18" \
  "dagster-snowflake-pandas==0.28.18"
```

PyPI lists Python `>=3.10,<3.15` for `dagster-snowflake 0.28.18`.

## Prerequisites

Before wiring this into Dagster, make sure you already have:

- a Snowflake account
- a Dagster project with a loadable `defs = dg.Definitions(...)`
- a database, schema, and warehouse your Snowflake user can access
- the same package set installed anywhere your Dagster code location, webserver, or daemon imports the code

The Dagster Snowflake quickstart uses these environment variables:

```bash
export SNOWFLAKE_ACCOUNT="xy12345.us-east-1"
export SNOWFLAKE_USER="analytics_user"
export SNOWFLAKE_PASSWORD="your-password"
export SNOWFLAKE_DATABASE="ANALYTICS"
export SNOWFLAKE_SCHEMA="PUBLIC"
export SNOWFLAKE_WAREHOUSE="COMPUTE_WH"
```

The official Snowflake tutorial documents password authentication and notes that private-key authentication is also supported. The examples here use password auth.

## Query Snowflake With `SnowflakeResource`

`SnowflakeResource` is the main integration point when your asset or op needs to run SQL directly.

```python
import dagster as dg
from dagster_snowflake import SnowflakeResource


@dg.asset
def top_customers(snowflake: SnowflakeResource) -> list[tuple]:
    with snowflake.get_connection() as conn:
        rows = (
            conn.cursor()
            .execute(
                """
                select customer_id, total_spend
                from top_customers
                order by total_spend desc
                limit 10
                """
            )
            .fetchall()
        )
    return rows


defs = dg.Definitions(
    assets=[top_customers],
    resources={
        "snowflake": SnowflakeResource(
            account=dg.EnvVar("SNOWFLAKE_ACCOUNT"),
            user=dg.EnvVar("SNOWFLAKE_USER"),
            password=dg.EnvVar("SNOWFLAKE_PASSWORD"),
            database=dg.EnvVar("SNOWFLAKE_DATABASE"),
            schema=dg.EnvVar("SNOWFLAKE_SCHEMA"),
            warehouse=dg.EnvVar("SNOWFLAKE_WAREHOUSE"),
        ),
    },
)
```

Important details:

- the resource key in `resources={"snowflake": ...}` must match the asset parameter name `snowflake`
- `snowflake.get_connection()` is the documented Dagster entry point for obtaining a Snowflake connection
- once you have the connection, use the normal Snowflake Python connector cursor API such as `cursor.execute(...)` and `fetchall()`
- if you need a non-default Snowflake role, add `role="TRANSFORMER"` or `role=dg.EnvVar("SNOWFLAKE_ROLE")` to the resource configuration

## Store Pandas Assets In Snowflake Tables

If your Dagster assets already produce Pandas DataFrames, the documented Snowflake table workflow uses `SnowflakePandasIOManager` from `dagster-snowflake-pandas`.

```python
import dagster as dg
import pandas as pd
from dagster_snowflake_pandas import SnowflakePandasIOManager


@dg.asset
def orders() -> pd.DataFrame:
    return pd.DataFrame(
        [
            {"order_id": 1, "total": 125.0},
            {"order_id": 2, "total": 80.0},
        ]
    )


@dg.asset
def cleaned_orders(orders: pd.DataFrame) -> pd.DataFrame:
    return orders.drop_duplicates()


defs = dg.Definitions(
    assets=[orders, cleaned_orders],
    resources={
        "io_manager": SnowflakePandasIOManager(
            account=dg.EnvVar("SNOWFLAKE_ACCOUNT"),
            user=dg.EnvVar("SNOWFLAKE_USER"),
            password=dg.EnvVar("SNOWFLAKE_PASSWORD"),
            database=dg.EnvVar("SNOWFLAKE_DATABASE"),
            schema=dg.EnvVar("SNOWFLAKE_SCHEMA"),
            warehouse=dg.EnvVar("SNOWFLAKE_WAREHOUSE"),
        )
    },
)
```

With that configuration:

- `io_manager` is the reserved resource key for the default asset I/O manager
- the `orders` asset is stored as `ANALYTICS.PUBLIC.ORDERS` when your database is `ANALYTICS` and schema is `PUBLIC`
- downstream assets annotated as `pd.DataFrame` receive Snowflake table data back as DataFrames

## Make An Existing Snowflake Table Available To Dagster

If the table already exists in Snowflake, represent it as a source asset and let the Snowflake I/O manager load it in downstream assets:

```python
import dagster as dg
import pandas as pd


raw_orders = dg.SourceAsset(key="raw_orders")


@dg.asset
def high_value_orders(raw_orders: pd.DataFrame) -> pd.DataFrame:
    return raw_orders[raw_orders["total"] >= 100]
```

When the Snowflake Pandas I/O manager is configured with a database and schema, `SourceAsset(key="raw_orders")` maps to the Snowflake table `DATABASE.SCHEMA.RAW_ORDERS`.

## Common Pitfalls

- Keep Dagster versions aligned. `dagster-snowflake 0.28.18` is for the Dagster `1.12.18` release line, not an arbitrary `dagster` version.
- Install the package in every runtime that imports your definitions. If the code location can import your project but not `dagster_snowflake`, loading will fail.
- Keep secrets in environment variables or your deployment secret manager, not hard-coded in `Definitions`.
- `SnowflakeResource` is for direct connections and SQL. If you want DataFrame assets automatically stored as tables, add the Snowflake Pandas I/O manager package instead of writing that plumbing yourself.
- The Snowflake table mapping is name-based. An asset or source asset key like `raw_orders` maps to `RAW_ORDERS` in the configured database and schema unless you customize the behavior elsewhere.
- Use one Snowflake authentication method consistently. The official tutorial documents password or private-key auth; these examples assume password auth.

## Version Notes For `0.28.18`

- PyPI lists `dagster-snowflake 0.28.18` as released on March 5, 2026.
- Dagster `1.12.19 / 0.28.19` was released on March 12, 2026, so check your project pins before copying these examples into a newer release line.
- PyPI currently lists two extras for this package: `pandas` and `snowflake-sqlalchemy`.

## Official Sources

- https://pypi.org/project/dagster-snowflake/
- https://github.com/dagster-io/dagster/tree/master/python_modules/libraries/dagster-snowflake
- https://github.com/dagster-io/dagster/releases
- https://dagster.io/integrations/dagster-snowflake
- https://legacy-versioned-docs.dagster.dagster-docs.io/integrations/snowflake/using-snowflake-with-dagster
- https://github.com/dagster-io/quickstart-snowflake
- https://docs.snowflake.com/en/developer-guide/python-connector/python-connector-api
- https://docs.snowflake.com/en/developer-guide/python-connector/python-connector-example
