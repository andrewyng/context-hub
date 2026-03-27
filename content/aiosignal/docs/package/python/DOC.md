---
name: package
description: "aiosignal package guide for Python async signal registration and dispatch"
metadata:
  languages: "python"
  versions: "1.4.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aiosignal,python,asyncio,signals,aiohttp,callbacks"
---

# aiosignal Python Package Guide

## Golden Rule

Use `aiosignal` when you need a small, typed async callback registry that you control in-process. The package is maintained by the aio-libs project and exposes one core primitive: `Signal`.

For version `1.4.0`, install it on Python `3.9+`. The maintainer docs landing page still says Python 3.8+, but the PyPI metadata for `1.4.0` requires Python 3.9 or newer.

## Install

```bash
python -m pip install "aiosignal==1.4.0"
```

`aiosignal` has no auth setup and does not read any environment variables.

## Initialize A Signal

Create a `Signal` with an owner object. The owner is mainly for debugging and repr output; your callbacks receive only the values you pass to `send()`.

```python
from aiosignal import Signal


class JobRunner:
    pass


runner = JobRunner()
on_job_finished = Signal(runner)
```

Before freezing the signal, you can treat it like a mutable sequence of async callbacks.

## Register And Send Callbacks

Callbacks must be `async def` callables. Dispatch with `await signal.send(...)`.

```python
import asyncio
from aiosignal import Signal


class JobRunner:
    pass


runner = JobRunner()
on_job_finished = Signal(runner)


async def log_completion(job_id: str, status: str) -> None:
    print(f"{job_id} -> {status}")


async def update_metrics(job_id: str, status: str) -> None:
    print(f"metrics updated for {job_id}")


on_job_finished.append(log_completion)
on_job_finished.append(update_metrics)
on_job_finished.freeze()


async def main() -> None:
    await on_job_finished.send("job-42", "ok")


asyncio.run(main())
```

Use `freeze()` once registration is complete. After that point, treat the signal as immutable and only dispatch it.

## Typed Callbacks

`aiosignal 1.4.0` adds type checking support for signal callback parameters. If you run static type checking, declare the expected argument list on the signal itself.

```python
import asyncio
from aiosignal import Signal


class Worker:
    pass


worker = Worker()
before_flush = Signal[int, str](worker)


async def log_flush(batch_size: int, source: str) -> None:
    print(f"flushing {batch_size} records from {source}")


before_flush.append(log_flush)
before_flush.freeze()


async def main() -> None:
    await before_flush.send(25, "nightly-sync")


asyncio.run(main())
```

On Python versions below 3.13, the `1.4.0` release adds `typing-extensions` as a dependency to support those callback type hints.

## Common Operations Before Freeze

Because `Signal` behaves like a mutable sequence before freezing, you can use familiar list-style operations while wiring your app:

```python
from aiosignal import Signal


signal = Signal(object())


async def handler(message: str) -> None:
    print(message)


signal.append(handler)
print(signal.frozen)  # False

signal.remove(handler)
signal.append(handler)
signal.freeze()
print(signal.frozen)  # True
```

The `frozen` property is useful when you want to guard against late callback registration during application startup.

## Using It Indirectly Through aiohttp

If you use `aiohttp.web`, its application lifecycle signals are built on this same pattern. Register async handlers with `app.on_startup`, `app.on_shutdown`, `app.on_cleanup`, or `app.on_response_prepare`.

```python
from aiohttp import web


async def open_resources(app: web.Application) -> None:
    app["ready"] = True


async def close_resources(app: web.Application) -> None:
    app["ready"] = False


app = web.Application()
app.on_startup.append(open_resources)
app.on_cleanup.append(close_resources)
```

Per the aiohttp docs, these handlers are asynchronous and run sequentially in the order they were added.

## Common Pitfalls

- Do not register synchronous functions. `aiosignal` is for asynchronous callbacks.
- Do not rely on the owner object being passed into callbacks; only the arguments from `send()` are delivered.
- Freeze the signal after startup wiring so later code cannot mutate the callback list unexpectedly.
- Keep callback signatures consistent with the arguments you send, especially if you use the new typed callback support in `1.4.0`.

## Official Links

- Maintainer docs: https://aiosignal.aio-libs.org/en/stable/
- PyPI package: https://pypi.org/project/aiosignal/1.4.0/
- Release notes: https://github.com/aio-libs/aiosignal/releases/tag/v1.4.0
