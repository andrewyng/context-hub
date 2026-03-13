---
name: package
description: "Dagster PostgreSQL storage package for persistent run, event log, and schedule state in Dagster OSS"
metadata:
  languages: "python"
  versions: "0.28.18"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "dagster,postgres,postgresql,python,storage,orchestration"
---

# dagster-postgres

Use `dagster-postgres` to back a Dagster OSS instance with PostgreSQL. In normal usage, you install it in the same environment as your Dagster services and configure `dagster.yaml`; Dagster then uses PostgreSQL for run storage, event log storage, and schedule or sensor state.

This guide targets `dagster-postgres 0.28.18`, which belongs to the Dagster `1.12.18` release line.

## Install

Install `dagster-postgres` alongside the matching Dagster packages used by your deployment:

```bash
python -m pip install \
  "dagster==1.12.18" \
  "dagster-postgres==0.28.18" \
  "dagster-webserver==1.12.18"
```

If you run the daemon for schedules or sensors, install the same package set in that runtime too.

## Before You Configure It

You need:

- a reachable PostgreSQL server
- a database and user for Dagster instance metadata
- a shared `DAGSTER_HOME` directory for the processes that should use this instance

Example shell setup:

```bash
export DAGSTER_HOME="$PWD/.dagster"
mkdir -p "$DAGSTER_HOME"

export DAGSTER_PG_HOST="127.0.0.1"
export DAGSTER_PG_PORT="5432"
export DAGSTER_PG_DB="dagster"
export DAGSTER_PG_USERNAME="dagster"
export DAGSTER_PG_PASSWORD="change-me"
```

This package does not have a separate SDK auth flow. Authentication is PostgreSQL authentication through the connection settings you give Dagster.

## Configure Shared PostgreSQL Storage

The usual setup is a single `storage:` block in `$DAGSTER_HOME/dagster.yaml`:

```yaml
# $DAGSTER_HOME/dagster.yaml
storage:
  postgres:
    postgres_db:
      username:
        env: DAGSTER_PG_USERNAME
      password:
        env: DAGSTER_PG_PASSWORD
      hostname:
        env: DAGSTER_PG_HOST
      db_name:
        env: DAGSTER_PG_DB
      port:
        env: DAGSTER_PG_PORT
```

With that file in place, start Dagster normally:

```bash
dg dev -m my_project.definitions
```

If your deployment uses schedules or sensors, run the daemon against the same `DAGSTER_HOME`:

```bash
dagster-daemon run
```

The important operational rule is consistency: the webserver, daemon, and any other Dagster process that should share run history and schedule state must point at the same instance configuration.

## Configure The Storage Components Explicitly

If you need to wire the instance storages separately, `dagster-postgres` provides one class per storage type:

```yaml
run_storage:
  module: dagster_postgres.run_storage
  class: PostgresRunStorage
  config:
    postgres_db:
      username:
        env: DAGSTER_PG_USERNAME
      password:
        env: DAGSTER_PG_PASSWORD
      hostname:
        env: DAGSTER_PG_HOST
      db_name:
        env: DAGSTER_PG_DB
      port:
        env: DAGSTER_PG_PORT

event_log_storage:
  module: dagster_postgres.event_log
  class: PostgresEventLogStorage
  config:
    postgres_db:
      username:
        env: DAGSTER_PG_USERNAME
      password:
        env: DAGSTER_PG_PASSWORD
      hostname:
        env: DAGSTER_PG_HOST
      db_name:
        env: DAGSTER_PG_DB
      port:
        env: DAGSTER_PG_PORT

schedule_storage:
  module: dagster_postgres.schedule_storage
  class: PostgresScheduleStorage
  config:
    postgres_db:
      username:
        env: DAGSTER_PG_USERNAME
      password:
        env: DAGSTER_PG_PASSWORD
      hostname:
        env: DAGSTER_PG_HOST
      db_name:
        env: DAGSTER_PG_DB
      port:
        env: DAGSTER_PG_PORT
```

For most deployments, prefer the single `storage:` block unless you have a specific reason to override the components individually.

## Python Imports For Direct Initialization

Most projects let Dagster construct these storages from `dagster.yaml`, but the package also exposes the storage classes directly:

```python
import os

from dagster_postgres.event_log import PostgresEventLogStorage
from dagster_postgres.run_storage import PostgresRunStorage
from dagster_postgres.schedule_storage import PostgresScheduleStorage

postgres_url = os.environ["DAGSTER_PG_URL"]

run_storage = PostgresRunStorage(postgres_url)
event_log_storage = PostgresEventLogStorage(postgres_url)
schedule_storage = PostgresScheduleStorage(postgres_url)
```

Use this shape for tests or custom instance wiring. For everyday Dagster OSS setup, the `dagster.yaml` configuration is the public interface most users need.

## Common Upgrade Workflow

When you upgrade Dagster and `dagster-postgres`, upgrade the release line together and migrate the instance schema before resuming normal traffic:

```bash
python -m pip install --upgrade \
  "dagster==1.12.18" \
  "dagster-postgres==0.28.18" \
  "dagster-webserver==1.12.18"

dagster instance migrate
```

Run the migration command with `DAGSTER_HOME` pointing at the instance you want to upgrade.

## Common Pitfalls

- Keep Dagster package versions aligned. `dagster-postgres 0.28.18` is for the Dagster `1.12.18` release line, not an arbitrary core version.
- Install the package anywhere the instance config is loaded. If the webserver or daemon cannot import `dagster_postgres`, Dagster cannot construct the storage backend.
- Use one shared instance configuration for all cooperating processes. Separate `DAGSTER_HOME` directories produce separate run history and scheduler state.
- Keep PostgreSQL credentials in environment variables or another secrets mechanism, not hard-coded in `dagster.yaml`.
- This package stores Dagster instance metadata. It does not replace IO managers or the storage layer for your actual asset data.
- After upgrades, run `dagster instance migrate` before assuming the existing PostgreSQL schema is ready.

## Version Notes

- Dagster library packages and Dagster core use different visible version numbers in the same release train. For this guide, that means `dagster-postgres 0.28.18` with Dagster core `1.12.18`.
- If you are pinning a production deployment, pin the related Dagster packages together instead of upgrading `dagster-postgres` in isolation.

## Official Sources Used

- Dagster `dagster-postgres` package source: `https://github.com/dagster-io/dagster/tree/master/python_modules/libraries/dagster-postgres`
- PyPI package page: `https://pypi.org/project/dagster-postgres/`
- Dagster docs root: `https://docs.dagster.io/`
- Dagster CLI and OSS docs root: `https://docs.dagster.io/api/clis`
- Dagster releases: `https://github.com/dagster-io/dagster/releases`
