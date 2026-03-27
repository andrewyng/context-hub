---
name: package
description: "vine Python package guide for promises, errbacks, barriers, and promise-aware callback utilities"
metadata:
  languages: "python"
  versions: "5.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "vine,python,promise,deferred,callbacks,celery"
---

# vine Python Package Guide

## Golden Rule

Use `vine` as a small in-process promise/deferred library. It helps you chain callbacks, attach errbacks, and adapt callback-style code into promise-aware flows. It is not an event loop, network client, or task queue by itself, so there are no service credentials or client objects to configure.

## Install

Pin the package version your project expects:

```bash
python -m pip install "vine==5.1.0"
```

Common alternatives:

```bash
uv add "vine==5.1.0"
poetry add "vine==5.1.0"
```

PyPI metadata for `5.1.0` requires Python `>=3.6`.

## Setup And Import Patterns

`vine` is a local utility package:

- Environment variables: none
- Authentication: none
- Client initialization: none

Import the helpers you actually use:

```python
from vine import barrier, maybe_promise, promise, transform, wrap
```

The main object is `promise`. You resolve it by calling it like a function, and you reject it with `.throw(...)`.

## Core Workflows

### Resolve a promise and chain callbacks

`promise(fun)` wraps a callback. `.then(...)` attaches the next callback and returns another promise in the chain.

```python
from vine import promise

def load_order(order_id: str) -> dict:
    return {"id": order_id, "status": "packed"}

def notify(order: dict) -> None:
    print(f"order {order['id']} is {order['status']}")

pipeline = promise(load_order).then(notify)
pipeline("A-100")
```

For callback registration without an initial function, start with `promise()`:

```python
from vine import promise

ready = promise()
ready.then(lambda value: print(f"received: {value}"))
ready("shipment-ready")
```

### Attach errbacks and reject explicitly

Use `on_error=` with `.then(...)` for the common success/error split. Reject a promise by calling `.throw(...)`.

```python
from vine import promise

def handle_success(value: str) -> None:
    print(f"ok: {value}")

def handle_error(exc_type, exc, tb) -> None:
    print(f"failed: {exc!r}")

step = promise().then(handle_success, on_error=handle_error)

step("done")
step.throw(ValueError("bad input"))
```

Inside an `except` block, `throw()` with no arguments forwards the current exception:

```python
from vine import promise

result = promise().then(
    lambda value: print(f"parsed: {value}"),
    on_error=lambda exc_type, exc, tb: print(f"error: {exc!r}"),
)

try:
    value = int("not-a-number")
except ValueError:
    result.throw()
else:
    result(value)
```

### Normalize plain values and thenables with `maybe_promise`

`maybe_promise(obj)` returns `obj` unchanged when it is already promise-like, otherwise it wraps the value in a ready promise. Use it when a function may return either a direct value or a promise.

```python
from vine import maybe_promise, promise

cached_value = {"source": "cache"}

pending = promise()
pending({"source": "backend"})

maybe_promise(cached_value).then(print)
maybe_promise(pending).then(print)
```

### Adapt callback-style code with `wrap`

`wrap(p)` returns a function that resolves `p` when called normally and rejects `p` when you call `.throw()` on the wrapper.

```python
from vine import promise, wrap

result = promise().then(
    lambda value: print(f"value: {value}"),
    on_error=lambda exc_type, exc, tb: print(f"failed: {exc!r}"),
)

done = wrap(result)

try:
    done(int("42"))
except ValueError:
    done.throw()
```

This is useful when integrating `vine` into code that already has separate success and exception paths.

### Derive a second promise with `transform`

Use `transform(p, callback)` when you want a new promise whose value is computed from another promise.

```python
from vine import promise, transform

source = promise()
uppercase = transform(source, lambda text: text.upper())

uppercase.then(print)
source("ready")
```

### Wait for multiple promises with `barrier`

`barrier()` lets you join several promises and run one callback when all of them are resolved. If you create an empty barrier and add promises later, call `.finalize()` after registration.

```python
from vine import barrier, promise

first = promise()
second = promise()

joined = barrier([first, second])
joined.then(lambda values: print(f"all done: {values}"))

first("alpha")
second("beta")
```

## Configuration Notes

- Use `weak=True` when you attach bound methods from long-lived objects and you do not want the promise chain to keep those instances alive.
- `promise.cancel()` stops future callback dispatch for that promise chain; use it when a result should no longer be delivered.
- `vine` is synchronous at the library level. It can model deferred completion, but it does not schedule work for you.

## Common Pitfalls

- Calling `promise()` resolves it. New users often expect a separate `.set()` or `.resolve()` method.
- `throw()` is the rejection path. If you catch an exception and then call the promise normally, errbacks will not run.
- Errbacks run with exception info shaped like `sys.exc_info()`, so handlers should accept `(exc_type, exc, tb)` or `*exc_info`.
- `maybe_promise()` only normalizes values into promise-like objects; it does not execute background work.
- `barrier()` created with no initial promises is immediately ready unless you add promises and call `.finalize()`.
- The public Read the Docs pages are older than the current PyPI release. Keep generated code close to the stable top-level helpers in this guide and confirm unusual internals against the repository source.

## Version-Sensitive Notes For `5.1.0`

- PyPI lists `vine 5.1.0` as the current release as of March 13, 2026.
- The package metadata for `5.1.0` requires Python `>=3.6`.
- The official API reference site still serves older `0.9.0` pages, but the core top-level helpers documented there, such as `promise`, `maybe_promise`, `wrap`, `transform`, and `barrier`, are also present in the maintained repository source.

## Official Sources

- Repository: https://github.com/celery/vine
- PyPI package page: https://pypi.org/project/vine/
- PyPI release page for `5.1.0`: https://pypi.org/project/vine/5.1.0/
- API reference: https://vine.readthedocs.io/en/latest/reference/vine.promises.html
- Top-level API index: https://vine.readthedocs.io/en/latest/internals/reference/vine.html
- Promise source: https://github.com/celery/vine/blob/master/vine/promises.py
- Barrier source: https://github.com/celery/vine/blob/master/vine/synchronization.py
