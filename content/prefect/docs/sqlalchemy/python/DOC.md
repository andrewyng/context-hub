---
name: sqlalchemy
description: "Prefect SQLAlchemy integration for storing database connection settings in blocks and running sync or async SQL from Prefect flows"
metadata:
  languages: "python"
  versions: "0.6.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "prefect,sqlalchemy,python,database,postgresql,sqlite,blocks"
---

# Prefect SQLAlchemy Python Package Guide

## Golden Rule

Use `prefect-sqlalchemy` as the Prefect integration layer for SQLAlchemy-backed databases. Keep writing flows and tasks with core `prefect`; use `SqlAlchemyConnector` blocks to store connection settings, open SQLAlchemy engines or connections, and run SQL inside a flow.

If you only need plain SQLAlchemy outside Prefect orchestration, start with SQLAlchemy directly instead of this integration package.

## Install

Install the integration package version this guide covers:

```bash
python -m pip install "prefect-sqlalchemy==0.6.1"
```

If your project is also pinning Prefect itself, install them together:

```bash
python -m pip install "prefect==3.6.21" "prefect-sqlalchemy==0.6.1"
```

Prefect also supports installing the integration through the main package extra:

```bash
python -m pip install "prefect[sqlalchemy]"
```

Sanity-check the install:

```bash
python -m pip show prefect-sqlalchemy
python -c "import prefect_sqlalchemy; print(prefect_sqlalchemy.__file__)"
```

## Prerequisites And Environment

Before you save or load a named block, make sure Prefect is connected to a real API:

```bash
export PREFECT_API_URL="https://api.prefect.cloud/api/accounts/<account-id>/workspaces/<workspace-id>"
export PREFECT_API_KEY="pnu_..."
```

For a local self-hosted API instead of Prefect Cloud:

```bash
prefect server start
prefect config set PREFECT_API_URL="http://127.0.0.1:4200/api"
```

Register the block types after installing a new integration so they appear in Prefect:

```bash
prefect block register -m prefect_sqlalchemy
```

Typical database environment variables:

```bash
export DB_HOST="db.example.internal"
export DB_PORT="5432"
export DB_NAME="app"
export DB_USER="app_user"
export DB_PASSWORD="..."
```

Direct instantiation of a block in Python does not require a Prefect API. Saving or loading it by name does.

## Create A Connector Block

The documented connector block is `SqlAlchemyConnector`. You can build it from structured connection components or from a SQLAlchemy URL string.

### PostgreSQL with structured connection components

```python
import os

from prefect_sqlalchemy import ConnectionComponents, SqlAlchemyConnector, SyncDriver


postgres_connector = SqlAlchemyConnector(
    connection_info=ConnectionComponents(
        driver=SyncDriver.POSTGRESQL_PSYCOPG2,
        username=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
        host=os.environ["DB_HOST"],
        port=int(os.environ.get("DB_PORT", "5432")),
        database=os.environ["DB_NAME"],
    ),
    fetch_size=100,
)

postgres_connector.save("warehouse-postgres", overwrite=True)
```

### SQLite with a connection string

```python
from prefect_sqlalchemy import SqlAlchemyConnector


sqlite_connector = SqlAlchemyConnector(
    connection_info="sqlite+pysqlite:///./app.db"
)

sqlite_connector.save("local-sqlite", overwrite=True)
```

Use a URL string when your runtime already has a complete SQLAlchemy database URL. Use `ConnectionComponents` when you want clearer typed fields for driver, host, username, and database.

## Load A Saved Block In A Flow

Load the block where the database work actually happens:

```python
from prefect import flow, task
from prefect_sqlalchemy import SqlAlchemyConnector


@task
def load_active_users() -> list[tuple]:
    with SqlAlchemyConnector.load("warehouse-postgres") as connector:
        rows = connector.fetch_many(
            "SELECT id, email FROM users WHERE is_active = true ORDER BY id"
        )
        return list(rows)


@flow(log_prints=True)
def sync_users() -> None:
    for row in load_active_users():
        print(row)


if __name__ == "__main__":
    sync_users()
```

The block works as a context manager. That is the safest default because it closes opened resources when the block exits.

## Run SQL Statements

`SqlAlchemyConnector` exposes a small set of helper methods that cover the common cases.

### Execute DDL or DML

```python
from prefect import flow
from prefect_sqlalchemy import SqlAlchemyConnector


@flow
def create_and_seed() -> None:
    with SqlAlchemyConnector.load("local-sqlite") as connector:
        connector.execute(
            "CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY, email TEXT NOT NULL)"
        )
        connector.execute_many(
            "INSERT INTO customers (email) VALUES (:email)",
            seq_of_parameters=[
                {"email": "ada@example.com"},
                {"email": "grace@example.com"},
            ],
        )


if __name__ == "__main__":
    create_and_seed()
```

### Fetch one row, many rows, or all rows

```python
from prefect import flow
from prefect_sqlalchemy import SqlAlchemyConnector


@flow
def query_customers() -> None:
    with SqlAlchemyConnector.load("local-sqlite") as connector:
        first_row = connector.fetch_one(
            "SELECT id, email FROM customers ORDER BY id"
        )
        print(first_row)

        next_rows = connector.fetch_many(
            "SELECT id, email FROM customers ORDER BY id",
            size=10,
        )
        print(list(next_rows))

        connector.reset_connections()

        all_rows = connector.fetch_all(
            "SELECT id, email FROM customers ORDER BY id"
        )
        print(list(all_rows))


if __name__ == "__main__":
    query_customers()
```

Why `reset_connections()` matters: the connector caches opened connections and result objects. Repeating the same fetch operation without a reset can advance through an existing result set instead of re-running the SQL from the beginning.

## Use Raw SQLAlchemy Clients When Needed

If you need an engine or a low-level connection, the block can return SQLAlchemy clients directly.

```python
from sqlalchemy import text

from prefect_sqlalchemy import SqlAlchemyConnector


with SqlAlchemyConnector.load("warehouse-postgres") as connector:
    engine = connector.get_client("engine")
    with engine.begin() as connection:
        result = connection.execute(text("SELECT 1"))
        print(result.scalar())
```

You can also request a connection from the block itself:

```python
from sqlalchemy import text

from prefect_sqlalchemy import SqlAlchemyConnector


with SqlAlchemyConnector.load("warehouse-postgres") as connector:
    connection = connector.get_connection(begin=False)
    try:
        result = connection.execute(text("SELECT current_database()"))
        print(result.scalar())
    finally:
        connection.close()
```

Use these lower-level entry points when existing SQLAlchemy code already expects an engine or connection object.

## Async Usage

The SDK reference documents async support on `SqlAlchemyConnector` when you configure an async driver.

```python
import asyncio
import os

from prefect_sqlalchemy import AsyncDriver, ConnectionComponents, SqlAlchemyConnector


async def main() -> None:
    connector = SqlAlchemyConnector(
        connection_info=ConnectionComponents(
            driver=AsyncDriver.POSTGRESQL_ASYNCPG,
            username=os.environ["DB_USER"],
            password=os.environ["DB_PASSWORD"],
            host=os.environ["DB_HOST"],
            port=int(os.environ.get("DB_PORT", "5432")),
            database=os.environ["DB_NAME"],
        )
    )
    async with connector as loaded:
        rows = await loaded.fetch_all("SELECT id, email FROM users ORDER BY id")
        print(list(rows))


if __name__ == "__main__":
    asyncio.run(main())
```

Use the async pattern only when the driver is async, such as `postgresql+asyncpg` or `sqlite+aiosqlite`.

## Common Pitfalls

- Installing `prefect-sqlalchemy` does not replace core `prefect`; you still use `prefect` for `@flow`, `@task`, deployments, workers, and configuration.
- Saving or loading a block by name requires a reachable Prefect API. Direct instantiation in Python does not.
- Register block types after installation with `prefect block register -m prefect_sqlalchemy` or the block may not appear in the UI.
- Keep database credentials in environment variables, your secret manager, or Prefect blocks. Do not hard-code them in flow source.
- The runtime environment that executes the flow still needs the database driver that matches your SQLAlchemy URL or documented driver enum.
- Prefer using the block as a context manager. The SDK reference explicitly recommends this when blocks cross task or flow boundaries.
- If you repeat a fetch and get the "next" rows instead of the full result again, call `reset_connections()` for sync usage or `reset_async_connections()` for async usage before re-running the query.

## Version Notes For `prefect-sqlalchemy` 0.6.1

- This guide covers the PyPI package version `0.6.1`.
- The current Prefect integrations page shows async examples, but the SDK reference is the reliable source for the concrete async API surface. Follow the `SqlAlchemyConnector` reference methods shown above when you need async support.
- Treat this package as a Prefect integration layered on top of SQLAlchemy, not as a replacement for SQLAlchemy's own engine, dialect, or ORM documentation.

## Official Sources

- Prefect docs root: `https://docs.prefect.io/v3/`
- Prefect integrations overview: `https://docs.prefect.io/integrations/`
- Prefect SQLAlchemy integration page: `https://docs.prefect.io/integrations/prefect-sqlalchemy`
- Prefect integrations install guidance: `https://docs.prefect.io/integrations/use-integrations`
- Prefect SQLAlchemy SDK reference: `https://reference.prefect.io/prefect_sqlalchemy/database/`
- Prefect SQLAlchemy credentials reference: `https://reference.prefect.io/prefect_sqlalchemy/credentials/`
- Prefect settings and profiles: `https://docs.prefect.io/v3/concepts/settings-and-profiles`
- PyPI package page: `https://pypi.org/project/prefect-sqlalchemy/`
