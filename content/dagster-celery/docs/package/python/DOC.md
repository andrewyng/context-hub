---
name: package
description: "Dagster Celery executor integration for running Dagster job steps on Celery workers backed by Redis, RabbitMQ, or another Celery broker/backend."
metadata:
  languages: "python"
  versions: "0.28.18"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "dagster,celery,python,executor,distributed-execution,workflow-orchestration"
---

# `dagster-celery` for Python

Use `dagster-celery` when a Dagster deployment needs a Celery-backed executor for a job. The package plugs a Celery executor into Dagster so job steps can run on Celery workers instead of only in the process that launched the run.

This package is not a full queueing stack by itself. You still need:

- a working Dagster code location
- a running Celery broker such as Redis or RabbitMQ
- a Celery result backend
- worker processes that can import your Dagster code and its dependencies

## Install

Pin the package version if you want the exact release covered here:

```bash
python -m pip install "dagster-celery==0.28.18"
```

In practice, keep `dagster-celery` on a release line that matches the rest of your Dagster deployment instead of mixing unrelated Dagster package versions.

## What to configure

`dagster-celery` does not add a separate client object or authentication flow. The main integration point is the executor definition exported by the package:

```python
from dagster_celery import celery_executor
```

Credentials and connectivity usually come from the Celery URLs you provide for:

- the broker
- the result backend

A practical environment-variable pattern is:

```bash
export DAGSTER_CELERY_BROKER_URL="redis://localhost:6379/0"
export DAGSTER_CELERY_RESULT_BACKEND="redis://localhost:6379/1"
```

If you use RabbitMQ instead of Redis, a broker URL commonly looks like:

```bash
export DAGSTER_CELERY_BROKER_URL="amqp://guest:guest@localhost:5672//"
export DAGSTER_CELERY_RESULT_BACKEND="rpc://"
```

## Minimal job using `celery_executor`

The package is used at job definition time by setting `executor_def=celery_executor`.

```python
import os

from dagster import Definitions, job, op
from dagster_celery import celery_executor

CELERY_BROKER_URL = os.environ["DAGSTER_CELERY_BROKER_URL"]
CELERY_RESULT_BACKEND = os.environ["DAGSTER_CELERY_RESULT_BACKEND"]


@op
def ping() -> str:
    return "ok"


@job(
    executor_def=celery_executor,
    config={
        "execution": {
            "config": {
                "broker": CELERY_BROKER_URL,
                "backend": CELERY_RESULT_BACKEND,
            }
        }
    },
)
def celery_job():
    ping()


defs = Definitions(jobs=[celery_job])
```

This is the core pattern to remember:

- import `celery_executor` from `dagster_celery`
- attach it to a Dagster job with `executor_def=celery_executor`
- provide Celery connection settings through executor config

## Common workflow

1. Start the broker and result backend your Celery deployment uses.
2. Make sure the same Dagster code and Python dependencies are available to worker processes.
3. Add `executor_def=celery_executor` to the jobs that should use Celery-backed step execution.
4. Supply broker and backend configuration from environment variables or run config.
5. Run those jobs through your normal Dagster deployment flow.

If only one job should use Celery, configure that job directly. You do not need to move every Dagster job to Celery at once.

## Important pitfalls

### `execute_in_process()` is not a Celery test

Dagster's in-process execution path is useful for unit tests, but it does not exercise distributed Celery execution the same way a real deployment does.

### Workers must be able to import your code

The Celery workers need the same user code and importable Python dependencies as the Dagster process that defines the job. If the workers cannot import your project, step execution will fail after the run is launched.

### Broker and backend connectivity must work from every process

It is not enough for the webserver or launcher process to reach Redis or RabbitMQ. The worker side needs the same network access and credentials.

### Keep secrets out of checked-in config

Treat broker URLs and backend credentials like any other secret. Put them in environment variables or your deployment secret manager instead of hardcoding them in source control.

## Version notes for `0.28.18`

- This guide targets `dagster-celery==0.28.18`.
- Pin the integration package explicitly when you need repeatable environments.
- Upgrade the rest of your Dagster deployment deliberately alongside this package instead of bumping only one Dagster library in isolation.

## Official sources

- Maintainer repository: https://github.com/dagster-io/dagster/tree/master/python_modules/libraries/dagster-celery
- Package README in the maintainer repository: https://github.com/dagster-io/dagster/blob/master/python_modules/libraries/dagster-celery/README.md
- PyPI project page: https://pypi.org/project/dagster-celery/
