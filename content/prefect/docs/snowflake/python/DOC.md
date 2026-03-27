---
name: snowflake
description: "Prefect Snowflake integration for storing Snowflake credentials in Prefect blocks and running Snowflake queries from Python flows"
metadata:
  languages: "python"
  versions: "0.28.7"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "prefect,snowflake,python,workflow,orchestration,database,sql,blocks"
---

# Prefect Snowflake Python Package Guide

## Golden Rule

Use `prefect-snowflake` as the Prefect integration layer for Snowflake access. Keep orchestration in core `prefect`; use this package for `SnowflakeCredentials`, `SnowflakeConnector`, and Snowflake query helpers inside flows and tasks.

If you only need a plain Snowflake client outside Prefect orchestration, start with the Snowflake Python connector directly.

## Install

Pin the package version your project expects:

```bash
python -m pip install "prefect-snowflake==0.28.7"
```

Official Prefect docs also support installing the matching extra from `prefect`:

```bash
python -m pip install "prefect[snowflake]"
```

Common alternatives:

```bash
uv add prefect-snowflake
poetry add prefect-snowflake
```

Sanity-check the install:

```bash
python -m pip show prefect-snowflake
python -c "import prefect_snowflake; print(prefect_snowflake.__file__)"
```

PyPI lists `prefect-snowflake 0.28.7` as requiring Python `>=3.10`.

## Prerequisites And Environment

Before you save blocks or run flows, make sure you have:

- a Snowflake account, user, and an authentication method supported by `SnowflakeCredentials`
- a database, schema, and warehouse you can query
- `PREFECT_API_URL` configured if you want saved named blocks instead of in-memory objects
- `PREFECT_API_KEY` as well when you use Prefect Cloud

Typical environment variables:

```bash
export PREFECT_API_URL="https://api.prefect.cloud/api/accounts/<account-id>/workspaces/<workspace-id>"
export PREFECT_API_KEY="pnu_..."

export SNOWFLAKE_ACCOUNT="xy12345.us-east-1"
export SNOWFLAKE_USER="analytics_user"
export SNOWFLAKE_PASSWORD="..."
export SNOWFLAKE_DATABASE="ANALYTICS"
export SNOWFLAKE_SCHEMA="PUBLIC"
export SNOWFLAKE_WAREHOUSE="COMPUTE_WH"
export SNOWFLAKE_ROLE="ANALYST"
```

If you use a self-hosted Prefect server instead of Cloud:

```bash
prefect server start
prefect config set PREFECT_API_URL="http://127.0.0.1:4200/api"
```

Register the integration blocks if you want to view and manage them in the Prefect UI:

```bash
prefect block register -m prefect_snowflake
```

## Create And Save Blocks

The two common block types are:

- `SnowflakeCredentials` for authentication details
- `SnowflakeConnector` for the database, schema, warehouse, and fetch settings

Create and save both blocks:

```python
import os

from prefect_snowflake import SnowflakeConnector, SnowflakeCredentials


credentials = SnowflakeCredentials(
    account=os.environ["SNOWFLAKE_ACCOUNT"],
    user=os.environ["SNOWFLAKE_USER"],
    password=os.environ["SNOWFLAKE_PASSWORD"],
    role=os.getenv("SNOWFLAKE_ROLE"),
    authenticator="snowflake",
)
credentials.save("snowflake-credentials", overwrite=True)

connector = SnowflakeConnector(
    credentials=credentials,
    database=os.environ["SNOWFLAKE_DATABASE"],
    schema=os.environ["SNOWFLAKE_SCHEMA"],
    warehouse=os.environ["SNOWFLAKE_WAREHOUSE"],
    fetch_size=500,
)
connector.save("snowflake-analytics", overwrite=True)
```

Load the saved connector later:

```python
from prefect_snowflake import SnowflakeConnector


connector = SnowflakeConnector.load("snowflake-analytics")
```

## Run Queries In A Flow

Use the connector as a context manager so the Snowflake connection and cursors are closed cleanly after the task or flow finishes.

```python
from prefect import flow, task
from prefect_snowflake import SnowflakeConnector


@task
def setup_demo_table() -> None:
    with SnowflakeConnector.load("snowflake-analytics") as connector:
        connector.execute(
            """
            CREATE TABLE IF NOT EXISTS demo_customers (
                id INT,
                name STRING,
                status STRING
            )
            """
        )
        connector.execute_many(
            """
            INSERT INTO demo_customers (id, name, status)
            VALUES (%(id)s, %(name)s, %(status)s)
            """,
            seq_of_parameters=[
                {"id": 1, "name": "Marvin", "status": "active"},
                {"id": 2, "name": "Ford", "status": "inactive"},
                {"id": 3, "name": "Trillian", "status": "active"},
            ],
        )


@task
def fetch_active_customers() -> list[tuple]:
    with SnowflakeConnector.load("snowflake-analytics") as connector:
        return connector.fetch_all(
            """
            SELECT id, name, status
            FROM demo_customers
            WHERE status = %(status)s
            ORDER BY id
            """,
            parameters={"status": "active"},
        )


@flow(log_prints=True)
def snowflake_demo() -> None:
    setup_demo_table()
    rows = fetch_active_customers()
    print(rows)


if __name__ == "__main__":
    snowflake_demo()
```

Keep the connector load, query, and close cycle inside one task or flow. The API reference warns that if you pass the block across separate tasks or flows, the connection and cursor state can be lost.

## Stream Large Result Sets

`fetch_many` is the safer default when the result set may be too large to hold in memory at once.

Repeated calls with the same query continue from the previous cursor position until you call `reset_cursors()`.

```python
from prefect import flow
from prefect_snowflake import SnowflakeConnector


@flow
def process_large_query() -> int:
    processed = 0

    with SnowflakeConnector.load("snowflake-analytics") as connector:
        while True:
            rows = connector.fetch_many(
                """
                SELECT id, name
                FROM demo_customers
                ORDER BY id
                """,
                size=1000,
            )
            if not rows:
                break

            processed += len(rows)

        connector.reset_cursors()

    return processed
```

Use `fetch_one` when you expect one row, `fetch_all` when the full result is small, and `fetch_many` when you want chunked reads.

## Use The Underlying Snowflake Connection

If you need connector features that `SnowflakeConnector` does not wrap directly, call `get_connection()` and use the raw Snowflake connection.

This is the documented path for `write_pandas`:

```python
import pandas as pd
from prefect import flow
from prefect_snowflake import SnowflakeConnector
from snowflake.connector.pandas_tools import write_pandas


@flow
def load_dataframe() -> tuple[bool, int]:
    with SnowflakeConnector.load("snowflake-analytics") as connector:
        with connector.get_connection() as connection:
            table_name = "DEMO_METRICS"

            with connection.cursor() as cursor:
                cursor.execute(
                    f"""
                    CREATE TABLE IF NOT EXISTS {table_name} (
                        NAME STRING,
                        VALUE INT
                    )
                    """
                )

            dataframe = pd.DataFrame(
                [("rows_loaded", 2), ("errors", 0)],
                columns=["NAME", "VALUE"],
            )

            success, _, num_rows, _ = write_pandas(
                conn=connection,
                df=dataframe,
                table_name=table_name,
                database=connector.database,
                schema=connector.schema_,
            )

            return success, num_rows
```

Two details matter here:

- `schema` is passed to the block constructor, but the attribute on the block is `schema_`
- the `write_pandas` example depends on Snowflake column-name case matching the DataFrame columns you send

## Authentication Options

`SnowflakeCredentials` supports more than username and password. The current API reference also documents:

- key-pair auth with `private_key` or `private_key_path` and optional `private_key_passphrase`
- `authenticator="snowflake_jwt"` for JWT-style auth
- `authenticator="oauth"` with `token`
- `authenticator="okta_endpoint"` with `endpoint`
- `authenticator="externalbrowser"` when a browser is available on the runtime host
- `authenticator="username_password_mfa"` for MFA-based login flows

Example using a private key file:

```python
import os
from pathlib import Path

from prefect_snowflake import SnowflakeCredentials


credentials = SnowflakeCredentials(
    account=os.environ["SNOWFLAKE_ACCOUNT"],
    user=os.environ["SNOWFLAKE_USER"],
    private_key_path=Path("/path/to/rsa_key.p8"),
    private_key_passphrase=os.getenv("SNOWFLAKE_PRIVATE_KEY_PASSPHRASE"),
    authenticator="snowflake_jwt",
)
```

## Common Pitfalls

- Installing `prefect-snowflake` does not replace core `prefect`; you still use `@flow`, `@task`, deployments, workers, and profiles from Prefect itself.
- Registering blocks with `prefect block register -m prefect_snowflake` makes them available in the UI, but `load()` only works after you have actually saved a block document.
- Load and use `SnowflakeConnector` inside a single task or flow. Do not assume a live connection or cursor survives being passed between tasks.
- Repeated `fetch_one`, `fetch_many`, and `fetch_all` calls with the same query reuse cursor state. Call `reset_cursors()` when you want to start over.
- `externalbrowser` authentication only works in environments where an interactive browser is available.
- If you need connector-specific behavior that the block methods do not expose, switch to `get_connection()` and use the underlying Snowflake client directly.

## Version Notes For `prefect-snowflake` 0.28.7

- This guide covers the PyPI package version `0.28.7`.
- PyPI lists `0.28.7` as released on November 17, 2025.
- PyPI lists Python `>=3.10` as the supported runtime requirement for the current package.

## Official Sources Used

- Prefect integrations overview: `https://docs.prefect.io/integrations/use-integrations`
- Prefect Snowflake integration docs: `https://docs.prefect.io/latest/integrations/prefect-snowflake/`
- Prefect Snowflake credentials API reference: `https://reference.prefect.io/prefect_snowflake/credentials/`
- Prefect Snowflake database API reference: `https://reference.prefect.io/prefect_snowflake/database/`
- PyPI package page: `https://pypi.org/project/prefect-snowflake/`
