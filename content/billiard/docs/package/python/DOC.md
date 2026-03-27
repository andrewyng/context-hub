---
name: package
description: "billiard Python package guide for multiprocessing-style processes, pools, queues, and start methods"
metadata:
  languages: "python"
  versions: "4.2.4"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "billiard,python,multiprocessing,processes,pool,celery"
---

# billiard Python Package Guide

## Golden Rule

Use `billiard` when a project is already built around Celery's multiprocessing fork, and import the process primitives you need from `billiard` itself. The maintainer README describes `billiard` as a fork of Python's `multiprocessing` package with a few extensions used by Celery, so treat it as multiprocessing-style infrastructure rather than as a network client or service SDK.

## Install

PyPI lists `billiard 4.2.4` with `Requires-Python >=3.7`.

```bash
python -m pip install "billiard==4.2.4"
```

Common alternatives:

```bash
uv add "billiard==4.2.4"
poetry add "billiard==4.2.4"
```

## Setup And Runtime Model

`billiard` does not use API keys, service auth, or package-specific environment variables.

There is also no client object to initialize. Setup is:

1. import the process primitives you need
2. optionally choose a start method or context
3. create processes, queues, or pools inside a `__main__` guard

Common imports:

```python
from billiard import Pool, Process, Queue, get_context
from billiard.spawn import freeze_support
```

## Core Workflows

### Start a child process and pass results through a queue

The programming guidelines require protecting process creation with `if __name__ == "__main__":` when using spawn-like start methods or running on Windows.

```python
from billiard import Process, Queue


def worker(result_queue: Queue, value: int) -> None:
    result_queue.put(value * 2)


if __name__ == "__main__":
    result_queue = Queue()
    process = Process(target=worker, args=(result_queue, 21))
    process.start()

    print(result_queue.get())  # 42

    process.join()
```

### Run CPU-bound work in a pool

`Pool.map`, `Pool.imap`, `Pool.imap_unordered`, `Pool.apply`, and `Pool.apply_async` are part of the documented pool API. Use explicit `close()` and `join()` so worker shutdown is predictable.

```python
from billiard import Pool


def square(value: int) -> int:
    return value * value


if __name__ == "__main__":
    pool = Pool(processes=4)
    try:
        print(pool.map(square, [1, 2, 3, 4]))

        total = sum(pool.imap_unordered(square, range(5)))
        print(total)
    finally:
        pool.close()
        pool.join()
```

If a worker should be recycled after a fixed number of tasks, `Pool(..., maxtasksperchild=N)` is part of the documented constructor.

### Choose the start method explicitly

`billiard` exports `get_context()` and `set_start_method()` at the package top level. Use an explicit context when your code must behave consistently across Linux, macOS, and Windows.

```python
from billiard import get_context


def worker(value: int) -> None:
    print(f"child received {value}")


if __name__ == "__main__":
    ctx = get_context("spawn")
    process = ctx.Process(target=worker, args=(42,))
    process.start()
    process.join()
```

Use `"spawn"` when you want the safest cross-platform behavior. Only rely on `"fork"` when the target environment supports it and the code is written with fork semantics in mind.

### Support frozen Windows executables

The maintainer docs call out `freeze_support()` for frozen executables created with tools such as PyInstaller or cx_Freeze.

```python
from billiard import Process
from billiard.spawn import freeze_support


def worker() -> None:
    print("hello from child")


if __name__ == "__main__":
    freeze_support()

    process = Process(target=worker)
    process.start()
    process.join()
```

## Configuration Notes

- No package-specific environment variables are required.
- There is no persistent client or connection object.
- The main configuration choices are process count, queue usage, and start method.
- `Pool(..., maxtasksperchild=N)` is the built-in worker-recycling knob when long-running workers should not stay alive forever.

## Common Pitfalls

- Do not create child processes at import time. Put process and pool startup behind `if __name__ == "__main__":` or spawn and forkserver bootstrapping will fail.
- Call `freeze_support()` in frozen Windows builds before starting child processes.
- Daemonic processes cannot create child processes. If a worker needs to launch more workers, do not mark it daemonic.
- Be deliberate about the start method. Platform defaults differ, and code that only works under `fork` is fragile in cross-platform projects.
- Close and join pools you create. Otherwise workers may linger and shutdown behavior becomes harder to reason about.

## Version-Sensitive Notes For `4.2.4`

- PyPI currently lists `4.2.4` as the latest stable release, with `4.3.0rc1` available as a pre-release.
- The `4.2.4` changelog includes compatibility work for Python 3.13.
- The same changelog notes that the `spawn` and `forkserver` start methods are allowed to execute on Python 3.14 and later.
- The package remains a Celery-maintained multiprocessing fork, so conceptual behavior is still closest to Python's multiprocessing model rather than to a Celery task API.

## Official Sources

- Repository README: https://github.com/celery/billiard/blob/master/README.rst
- Package exports: https://raw.githubusercontent.com/celery/billiard/master/billiard/__init__.py
- Frozen executable support: https://raw.githubusercontent.com/celery/billiard/master/billiard/spawn.py
- Programming guidelines: https://billiard.readthedocs.io/en/latest/library/multiprocessing.html#programming-guidelines
- Pool API reference: https://billiard.readthedocs.io/en/latest/library/multiprocessing.html#module-billiard.pool
- Changelog: https://raw.githubusercontent.com/celery/billiard/master/CHANGES.txt
- PyPI package page: https://pypi.org/project/billiard/
- PyPI JSON metadata: https://pypi.org/pypi/billiard/json
