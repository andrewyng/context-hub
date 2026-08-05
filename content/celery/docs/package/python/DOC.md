---
name: package
description: "Celery distributed task queue for Python workers, retries, scheduling, and broker-backed background jobs"
metadata:
  languages: "python"
  versions: "5.6.3"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "celery,python,task-queue,workers,async,redis,rabbitmq,django"
---

# Celery Python Package Guide

Use `celery` when Python code needs broker-backed background jobs, scheduled tasks, retries, and horizontally scalable worker processes.

## Golden Rule

- Define one importable Celery app module and point both producers and workers at it.
- Use RabbitMQ or Redis unless you have a specific reason to pick another transport.
- Treat task payloads as JSON by default and keep tasks idempotent.
- Only configure a result backend if you actually need task states or return values.

## Version Covered

- Package: `celery`
- Ecosystem: `pypi`
- Version: `5.6.3`
- Release date: `2026-03-26`
- Python requirement on PyPI: `>=3.9`

## Install

Base install:

```bash
pip install celery==5.6.3
```

Common extras from PyPI:

```bash
# Redis broker and/or result backend support
pip install "celery[redis]==5.6.3"

# Task-side Pydantic validation helpers
pip install "celery[pydantic]==5.6.3"

# pytest plugin support
pip install "celery[pytest]==5.6.3"
```

## Core Model

Celery has four moving parts:

1. A Python app object created with `Celery(...)`.
2. A broker that carries task messages.
3. One or more worker processes that execute tasks.
4. An optional result backend for task state and return values.

Recurring schedules are handled by a separate `beat` process.

## App Config

Create an importable module such as `tasks.py`. Configure `broker_url` and (optionally) `result_backend` either as constructor arguments or via `app.conf`.

```python
import os

from celery import Celery

app = Celery(
    "tasks",
    broker=os.environ.get("CELERY_BROKER_URL", "pyamqp://guest@localhost//"),
    backend=os.environ.get("CELERY_RESULT_BACKEND"),
)

app.conf.update(
    broker_url=os.environ.get("CELERY_BROKER_URL", "pyamqp://guest@localhost//"),
    result_backend=os.environ.get("CELERY_RESULT_BACKEND"),
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)
```

Common broker URLs:

```text
pyamqp://guest:guest@localhost//        # RabbitMQ
redis://localhost:6379/0                 # Redis
sqs://AWS_ACCESS:AWS_SECRET@/            # Amazon SQS
```

Common result backends:

```text
redis://localhost:6379/1
db+postgresql://user:pass@localhost/celery
rpc://                                   # short-lived RPC results over the broker
```

You can also load config from a module:

```python
app.config_from_object("celeryconfig")
```

## Defining Tasks With @app.task

```python
@app.task(
    bind=True,
    autoretry_for=(ConnectionError, TimeoutError),
    retry_backoff=True,
    retry_jitter=True,
    max_retries=5,
)
def fetch_remote(self, url: str) -> str:
    # Put explicit I/O timeouts in the code you call from tasks.
    return f"fetched {url}"
```

`@shared_task` is preferred inside reusable apps because it doesn't bind to a specific app instance:

```python
from celery import shared_task


@shared_task
def add(x: int, y: int) -> int:
    return x + y
```

Common `@task` options:

- `bind=True` injects `self` so you can call `self.retry(...)`, access `self.request.id`, etc.
- `name="myapp.tasks.add"` fixes the task name across renames.
- `ignore_result=True` skips storing return values.
- `acks_late=True` only ack after the task completes (useful with idempotent tasks).
- `autoretry_for=(...)`, `retry_backoff=`, `retry_backoff_max=`, `retry_jitter=`, `max_retries=`.
- `pydantic=True` (5.5+) for task-side Pydantic argument/return validation.

## Calling Tasks: .delay() and .apply_async()

Use `delay()` for the common case and `apply_async()` when you need execution options:

```python
from tasks import fetch_remote

# Equivalent
fetch_remote.delay("https://example.com/a")
fetch_remote.apply_async(args=("https://example.com/a",))

# With options
fetch_remote.apply_async(
    args=("https://example.com/b",),
    kwargs={},
    countdown=10,
    expires=60,
    queue="downloads",
    priority=5,
    headers={"trace_id": "abc"},
)
```

Useful `apply_async()` options:

- `countdown` (seconds) or `eta` (datetime) for delayed execution
- `expires` (seconds or datetime) to drop stale work
- `queue` to route to a specific queue
- `priority` (broker-dependent)
- `link` and `link_error` for callbacks and errbacks
- `task_id` to set a deterministic id

Do not use `countdown` or `eta` for large volumes of far-future jobs. Celery keeps those tasks in worker memory until execution time, and Redis brokers can redeliver them when the delay exceeds the broker visibility timeout.

## Running A Worker

Basic worker:

```bash
celery -A tasks worker --loglevel=INFO
```

Named workers with explicit concurrency and routing:

```bash
celery -A proj worker --loglevel=INFO --concurrency=10 -n worker1@%h
celery -A proj worker --loglevel=INFO --concurrency=10 -n worker2@%h -Q downloads,default
```

Useful flags:

- `--concurrency=N` worker process pool size
- `--pool=prefork|gevent|eventlet|solo|threads`
- `-Q queue1,queue2` consume only specific queues
- `-n worker@%h` give each worker a unique node name
- `--loglevel=INFO|DEBUG|WARNING`
- `--max-tasks-per-child=N` recycle a worker after N tasks to bound memory growth
- `--time-limit=` / `--soft-time-limit=` per-task limits

Inspect a running cluster:

```bash
celery -A tasks inspect active
celery -A tasks inspect registered
celery -A tasks inspect scheduled
celery -A tasks status
celery -A tasks control shutdown
```

## Periodic Tasks (Beat)

Run the scheduler separately. Beat sends scheduled tasks to the broker; the workers execute them.

```bash
celery -A tasks beat -l INFO
```

Inline schedule:

```python
from celery.schedules import crontab

app.conf.beat_schedule = {
    "refresh-every-30-seconds": {
        "task": "tasks.refresh_cache",
        "schedule": 30.0,
    },
    "billing-nightly": {
        "task": "tasks.run_billing",
        "schedule": crontab(hour=2, minute=30),
        "args": (),
        "options": {"queue": "billing"},
    },
}
app.conf.timezone = "UTC"
```

Run only one beat process per cluster, or use a coordinated scheduler like `django-celery-beat` to store schedules in the DB.

## Retries

Two retry styles:

### Declarative

```python
@app.task(
    autoretry_for=(ConnectionError, TimeoutError),
    retry_backoff=True,
    retry_backoff_max=600,
    retry_jitter=True,
    max_retries=7,
)
def sync_invoice(invoice_id: str) -> None:
    ...
```

### Imperative

```python
@app.task(bind=True, max_retries=5)
def push(self, payload):
    try:
        do_push(payload)
    except TransientError as exc:
        raise self.retry(exc=exc, countdown=10)
```

`retry_backoff=True` enables exponential backoff. `retry_backoff_max` caps the wait. `retry_jitter=True` randomizes the wait to spread retries.

## Results

Results are off by default. Configure `result_backend` only if you need:

- `AsyncResult.get()`
- task state inspection
- chords or workflows that depend on stored results

```python
from tasks import fetch_remote

result = fetch_remote.delay("https://example.com/c")
print(result.id)
print(result.state)         # "PENDING" / "STARTED" / "SUCCESS" / "FAILURE" / "RETRY"
value = result.get(timeout=10, propagate=True)
result.forget()              # remove stored result from backend
```

If you do not need return values, set `ignore_result=True` on the task or use `task_ignore_result=True` globally to reduce backend load.

Set `result_expires` (seconds) to clean up stored results automatically.

## Chains, Groups, and Chords

Compose tasks with primitives from `celery`:

```python
from celery import chain, chord, group

from tasks import add, multiply, summarize

# Chain: run tasks one after another, passing results forward
chain(add.s(2, 2), multiply.s(4)).apply_async()
# or with pipe operator
(add.s(2, 2) | multiply.s(4)).apply_async()

# Group: run tasks in parallel
group(add.s(i, i) for i in range(5)).apply_async()

# Chord: parallel group then a callback on the collected results
chord(
    (add.s(i, i) for i in range(5)),
    summarize.s(),
).apply_async()
```

`task.s(...)` builds a signature (immutable: `task.si(...)`). Chords require a result backend that supports them (Redis and most DB backends do).

## Monitoring Basics

- `celery events` shows a curses TUI of task lifecycle events; workers must be started with `-E` or `worker_send_task_events=True`.
- `flower` is the most common dashboard:

```bash
pip install flower
celery -A tasks flower --port=5555
```

- `celery -A tasks inspect ...` reports per-worker state.
- Workers expose Prometheus metrics through third-party exporters.
- For ad-hoc debugging, run a worker with `--loglevel=DEBUG`.

Note: Amazon SQS does not support monitoring or remote control commands.

## Production-Oriented Configuration

```python
app.conf.update(
    broker_url="pyamqp://user:pass@rabbitmq.example.com/vhost",
    result_backend="redis://redis.example.com/0",
    accept_content=["json"],
    task_serializer="json",
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    task_reject_on_worker_lost=False,
    task_time_limit=300,
    task_soft_time_limit=270,
    result_expires=24 * 3600,
)
```

Notes:

- `accept_content=['json']` keeps workers from accepting untrusted pickle or yaml payloads.
- `worker_prefetch_multiplier=1` helps fairness when tasks are long-running.
- `task_acks_late=True` only makes sense for idempotent tasks.
- Turning on `task_reject_on_worker_lost=True` can requeue work after a worker process dies, but it can also create message loops if you do not understand the failure mode.

Celery also supports:

- separate `broker_read_url` and `broker_write_url`
- multiple broker URLs for failover
- app config modules via `app.config_from_object("celeryconfig")`

## Task Design Patterns

### Idempotent retryable task

```python
from celery import shared_task


@shared_task(
    autoretry_for=(ConnectionError, TimeoutError),
    retry_backoff=True,
    retry_backoff_max=600,
    retry_jitter=True,
    max_retries=7,
)
def sync_invoice(invoice_id: str) -> None:
    # Safe to run more than once.
    ...
```

### Task with no stored result

```python
from celery import shared_task


@shared_task(ignore_result=True)
def send_webhook(payload: dict) -> None:
    ...
```

### Pydantic task-side validation

Celery 5.5 added task-side Pydantic argument and return-value conversion:

```python
from celery import Celery
from pydantic import BaseModel

app = Celery("tasks")


class JobIn(BaseModel):
    url: str


class JobOut(BaseModel):
    status: str


@app.task(pydantic=True)
def run_job(job: JobIn) -> JobOut:
    return JobOut(status=f"queued:{job.url}")
```

Important: `pydantic=True` validates on the task side. You still need to serialize task arguments correctly when calling `delay()` or `apply_async()`.

## Django Integration

Celery works with Django directly; a separate integration package is no longer required.

Typical `proj/celery.py`:

```python
import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "proj.settings")

app = Celery("proj")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()
```

Important Django notes:

- Put Celery settings in Django settings as `CELERY_BROKER_URL`, `CELERY_RESULT_BACKEND`, and similar.
- Use `@shared_task` inside reusable apps.
- If a task depends on committed DB state, prefer `delay_on_commit()` over `delay()` in Django transaction flows.
- `delay_on_commit()` was added in Celery 5.4 and does not return a task id because sending is deferred until commit.

## Testing

For unit tests, prefer mocking task behavior or the code inside tasks.

Important testing caveats:

- `task_always_eager=True` is not a faithful unit-test substitute for a real worker.
- If you need eager execution plus stored results, also set `task_store_eager_result=True`.
- `celery.contrib.pytest` and `pytest-celery` are different and not compatible with each other.

## Common Pitfalls

- No result backend configured: `AsyncResult.get()` and state inspection will not behave the way you expect.
- Non-idempotent tasks with `acks_late=True`: worker crashes can duplicate side effects.
- No I/O timeouts inside tasks: a stuck request can block worker capacity indefinitely.
- Accepting `pickle` or `yaml` content from an untrusted broker: this widens your attack surface.
- Large or distant `countdown` loads: workers hold those messages in memory.
- Long-running tasks with default prefetch: one worker can reserve too much work early.
- Triggering Django tasks before transaction commit: the worker may not see the saved rows yet.
- Running multiple beat processes: schedules will fire more than once.

## Version-Sensitive Notes for 5.6.3

- Stable docs and PyPI both identify the current covered release as `5.6.3` (released 2026-03-26).
- PyPI project metadata requires Python `>=3.9`.
- Task-side Pydantic validation via `pydantic=True` is available in Celery `5.5+`.
- `delay_on_commit()` for Django is available in Celery `5.4+`.
- The PyPI long description may still contain some stale `5.5.x` references; prefer the stable docs root and PyPI metadata over older prose when checking current support statements.
- The project still says Microsoft Windows is unsupported, even though it may work in some environments.

## Official Sources

- Docs root: https://docs.celeryq.dev/en/stable/
- First steps: https://docs.celeryq.dev/en/stable/getting-started/first-steps-with-celery.html
- Brokers and backends: https://docs.celeryq.dev/en/stable/getting-started/backends-and-brokers/index.html
- Configuration: https://docs.celeryq.dev/en/stable/userguide/configuration.html
- Tasks: https://docs.celeryq.dev/en/stable/userguide/tasks.html
- Calling tasks: https://docs.celeryq.dev/en/stable/userguide/calling.html
- Canvas (chains, groups, chords): https://docs.celeryq.dev/en/stable/userguide/canvas.html
- Workers: https://docs.celeryq.dev/en/stable/userguide/workers.html
- Monitoring and management: https://docs.celeryq.dev/en/stable/userguide/monitoring.html
- Periodic tasks: https://docs.celeryq.dev/en/stable/userguide/periodic-tasks.html
- Testing: https://docs.celeryq.dev/en/stable/userguide/testing.html
- Django: https://docs.celeryq.dev/en/stable/django/first-steps-with-django.html
- Changelog: https://docs.celeryq.dev/en/stable/changelog.html
- PyPI: https://pypi.org/project/celery/
