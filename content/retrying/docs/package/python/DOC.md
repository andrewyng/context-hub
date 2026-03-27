---
name: package
description: "retrying decorators for retry loops, backoff, and polling in synchronous Python code"
metadata:
  languages: "python"
  versions: "1.4.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "retrying,retry,retries,python,decorators,backoff,polling"
---

# retrying Python Package Guide

## Golden Rule

Use `retrying` to decorate your own synchronous functions when you need retry loops around transient failures or poll-until-ready workflows. The upstream README documents decorator-based usage only; there is no client object, auth flow, or package-specific environment configuration.

The most important default is easy to miss: if you call `@retry` with no arguments, the function retries forever with no wait between attempts.

## Install

Pin the version your project expects:

```bash
python -m pip install "retrying==1.4.2"
```

Common alternatives:

```bash
uv add "retrying==1.4.2"
poetry add "retrying==1.4.2"
```

`retrying 1.4.2` declares `Requires-Python >=3.6` on PyPI.

## Core Model

Import the decorator directly:

```python
from retrying import retry
```

There is no initialization step. You control behavior with decorator keyword arguments:

- Stop conditions such as `stop_max_attempt_number=...` and `stop_max_delay=...`
- Wait strategies such as `wait_fixed=...`, `wait_random_min=...`, `wait_random_max=...`, `wait_exponential_multiplier=...`, and `wait_exponential_max=...`
- Retry predicates such as `retry_on_exception=...` and `retry_on_result=...`

Important detail from the upstream examples: wait and delay values are in milliseconds.

## Retry A Transient Exception

Use `stop_max_attempt_number` with `wait_fixed` for the simplest bounded retry:

```python
import requests
from retrying import retry

@retry(stop_max_attempt_number=5, wait_fixed=2000)
def fetch_json(url: str) -> dict:
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    return response.json()
```

This makes up to five attempts and waits two seconds between failures.

## Retry Only Selected Exceptions

Use `retry_on_exception` when some failures are transient but others should stop immediately:

```python
import requests
from retrying import retry

def retry_if_connection_error(exc: Exception) -> bool:
    return isinstance(
        exc,
        (requests.exceptions.ConnectionError, requests.exceptions.Timeout),
    )

@retry(
    retry_on_exception=retry_if_connection_error,
    stop_max_attempt_number=4,
    wait_fixed=1000,
)
def get_status(url: str) -> int:
    response = requests.get(url, timeout=5)
    response.raise_for_status()
    return response.status_code
```

Keep the predicate narrow. If it returns `True`, `retrying` will retry that exception type.

## Poll Until The Result Is Ready

Use `retry_on_result` when the call succeeds but the result says "not ready yet":

```python
from retrying import retry

def retry_if_none(result) -> bool:
    return result is None

@retry(
    retry_on_result=retry_if_none,
    wait_fixed=1000,
    stop_max_delay=10000,
)
def load_report(report_store, report_id: str):
    report = report_store.get(report_id)
    if report is None or report["state"] != "ready":
        return None
    return report
```

This polls once per second and stops after about ten seconds total.

## Exponential Backoff

Use the exponential wait parameters when each retry should wait longer than the last:

```python
import requests
from retrying import retry

@retry(
    wait_exponential_multiplier=1000,
    wait_exponential_max=10000,
    stop_max_attempt_number=6,
)
def fetch_text(url: str) -> str:
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    return response.text
```

The upstream README describes this as sleeping `2^x * wait_exponential_multiplier` milliseconds between retries, capped by `wait_exponential_max`.

## Common Pitfalls

- `@retry` with no arguments retries forever and does not sleep between attempts.
- Wait-related arguments use milliseconds, not seconds.
- `retrying` wraps ordinary synchronous callables. The maintainer docs do not document asyncio usage.
- `retry_on_result` is for return-value-based polling; your wrapped function should return a sentinel such as `None` when the work is not ready yet.
- `wrap_exception=True` changes how errors are surfaced. Use it only if your calling code is prepared for `RetryError`.
- `stop_max_delay` limits total retry time; `stop_max_attempt_number` limits the number of calls. Use one or both explicitly so retry behavior is bounded.

## Version-Sensitive Notes

- PyPI lists `1.4.2` as the current release, published on August 3, 2025.
- PyPI metadata for `1.4.2` declares `Requires-Python >=3.6`.
- The maintained project homepage for current releases is `https://github.com/groodt/retrying`. Older examples and search results may still point at the original `rholder/retrying` repository.

## Official Sources

- Maintainer repository: `https://github.com/groodt/retrying`
- Maintainer README examples: `https://github.com/groodt/retrying/blob/master/README.rst`
- PyPI project page: `https://pypi.org/project/retrying/`
