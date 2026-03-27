---
name: package
description: "multiprocess package guide for Python projects using the official multiprocess docs"
metadata:
  languages: "python"
  versions: "0.70.19"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "multiprocess,python,parallelism,processes,pool,dill"
---

# multiprocess Python Package Guide

## Golden Rule

Use `multiprocess` when you want the `multiprocessing` API with `dill`-backed serialization. The package is a fork of Python's standard-library `multiprocessing`, so the core API is intentionally familiar: `Process`, `Queue`, `Pool`, `Manager`, locks, semaphores, and shared values all work the same way, with broader object serialization support.

For `0.70.19`, use the stable docs and stable PyPI metadata as the source of truth. The `latest` Read the Docs site is already on `0.70.20.dev0`.

## Install

`multiprocess` requires Python 3.9+ and `dill >= 0.4.1`.

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "multiprocess==0.70.19"
```

Common alternatives:

```bash
uv add "multiprocess==0.70.19"
poetry add "multiprocess==0.70.19"
```

## Environment Variables And Initialization

`multiprocess` does not use API keys, service URLs, or package-specific environment variables.

Import the primitives you need directly from `multiprocess`:

```python
from multiprocess import (
    Manager,
    Pool,
    Process,
    Queue,
    freeze_support,
    set_start_method,
)
```

If your application needs an explicit start method, set it once before creating processes or pools:

```python
from multiprocess import freeze_support, set_start_method


def main() -> None:
    ...


if __name__ == "__main__":
    freeze_support()
    set_start_method("spawn")
    main()
```

Use `freeze_support()` for frozen executables and keep startup code under the `if __name__ == "__main__":` guard, as shown in both the `multiprocess` and Python docs.

## Start A Single Worker Process

This is the smallest useful pattern for background work and process-to-process communication:

```python
from multiprocess import Process, Queue


def worker(queue: Queue) -> None:
    queue.put("hello from child")


if __name__ == "__main__":
    queue = Queue()
    proc = Process(target=worker, args=(queue,))
    proc.start()

    print(queue.get())

    proc.join()
```

Use a `Queue` when you need to pass Python objects back to the parent process.

## Use A Pool For Parallel Map And Async Work

`Pool` is the main API for fan-out work across multiple child processes:

```python
from multiprocess import Pool, TimeoutError


def square(x: int) -> int:
    return x * x


if __name__ == "__main__":
    with Pool(processes=4) as pool:
        print(pool.map(square, range(6)))

        result = pool.apply_async(square, (10,))
        print(result.get(timeout=1))
```

Use `map()` for bulk synchronous work and `apply_async()` when you want an `AsyncResult` that you can wait on later with `.get(timeout=...)`.

## Use Dill-Backed Serialization For Callables That Stdlib multiprocessing Often Rejects

The main practical reason to choose `multiprocess` over `multiprocessing` is that `dill` extends serialization to most Python objects.

```python
from multiprocess import Pool


if __name__ == "__main__":
    with Pool(processes=4) as pool:
        values = pool.map(
            lambda x: (lambda y: y ** 2)(x) + x,
            range(5),
        )
        print(values)
```

This is useful when your worker function closes over state or is not a simple top-level function.

## Share Mutable State With A Manager

Managers let you create shared objects backed by a manager process:

```python
from multiprocess import Manager, Process


def append_item(shared_list, item: int) -> None:
    shared_list.append(item)


if __name__ == "__main__":
    with Manager() as manager:
        shared_list = manager.list([1, 2, 3])

        proc = Process(target=append_item, args=(shared_list, 4))
        proc.start()
        proc.join()

        print(list(shared_list))
```

Use `manager.list()`, `manager.dict()`, `manager.Queue()`, and similar helpers when several processes need coordinated access to mutable state.

## Share Simple Data In Shared Memory

For simple numeric data, use `Value` and `Array`:

```python
from multiprocess import Array, Process, Value


def bump(counter: Value, numbers: Array) -> None:
    with counter.get_lock():
        counter.value += 1
    numbers[0] = numbers[0] + 10


if __name__ == "__main__":
    counter = Value("i", 0)
    numbers = Array("i", [1, 2, 3])

    proc = Process(target=bump, args=(counter, numbers))
    proc.start()
    proc.join()

    print(counter.value)
    print(list(numbers))
```

Use shared memory for small, simple data structures. For richer Python objects, a manager-backed proxy is usually easier.

## Common Pitfalls

- Keep process and pool creation inside `if __name__ == "__main__":`. The official examples do this for a reason.
- If you call `set_start_method()`, do it before creating a `Process`, `Pool`, `Manager`, `Queue`, `Value`, or `Array`. Python's multiprocessing docs note that the global start method can only be set once unless you force-reset it.
- Manage pools explicitly. Use `with Pool(...) as pool:` or call `close()` and `join()` yourself. The Python docs warn that relying on garbage collection can leave a program hanging during shutdown.
- Pool workers need the main module to be importable. That means ad hoc REPL snippets and notebook-local functions are a poor fit for many pool examples unless the worker function lives in an importable module.
- Use the stable `0.70.19` docs when you are pinned to `0.70.19`. The `latest` docs currently describe the unreleased `0.70.20.dev0` line.

## Version-Sensitive Notes For 0.70.19

- PyPI lists `0.70.19` as the current stable release, published on January 19, 2026.
- PyPI lists the runtime requirement as Python 3.9+, while the `latest` docs page tracks `0.70.20.dev0`. Avoid copying behavior from `latest` unless you confirm it is also present in `0.70.19`.
- The stable docs explicitly position `multiprocess` as a fork of `multiprocessing`, so Python's standard `multiprocessing` reference is still relevant for start methods, contexts, pool lifecycle, and other process-model details.

## Official Sources

- Stable docs root: https://multiprocess.readthedocs.io/en/stable/
- Development docs root (`latest`): https://multiprocess.readthedocs.io/en/latest/
- PyPI package page: https://pypi.org/project/multiprocess/
- Python `multiprocessing` reference: https://docs.python.org/3/library/multiprocessing.html
