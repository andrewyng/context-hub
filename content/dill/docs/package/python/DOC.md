---
name: package
description: "dill package guide for serializing Python callables, closures, and interpreter state"
metadata:
  languages: "python"
  versions: "0.4.1"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "dill,python,serialization,pickle,functions,sessions"
---

# dill Python Package Guide

## Golden Rule

Use `dill` when standard `pickle` is too limited for your Python-only workflow. The API mirrors `pickle`, but `dill` is designed to serialize more Python objects, including many user-defined functions, lambdas, closures, and interpreter state.

`dill` is a local serialization library, not a network service. There are no API keys, environment variables, or client objects to initialize.

## Install

Install `dill` into the same environment as the code that will create or load the serialized objects:

```bash
python -m pip install "dill==0.4.1"
```

Common alternatives:

```bash
uv add "dill==0.4.1"
poetry add "dill==0.4.1"
```

## Basic Usage

`dill` follows the same core API as `pickle`: `dump`, `dumps`, `load`, and `loads`.

### Serialize to bytes

```python
import dill


def make_multiplier(factor: int):
    def multiply(value: int) -> int:
        return factor * value
    return multiply


multiply_by_4 = make_multiplier(4)

payload = {
    "message": "hello",
    "transform": multiply_by_4,
}

blob = dill.dumps(payload)
restored = dill.loads(blob)

print(restored["message"])
print(restored["transform"](10))
```

### Serialize to a file

```python
from pathlib import Path
import dill


cache_path = Path("build/artifacts.pkl")
cache_path.parent.mkdir(parents=True, exist_ok=True)

data = {
    "numbers": [1, 2, 3],
    "callback": lambda value: value + 1,
}

with cache_path.open("wb") as file:
    dill.dump(data, file)

with cache_path.open("rb") as file:
    restored = dill.load(file)

print(restored["callback"](41))
```

## Serialize Functions And Closures

One of the main reasons to use `dill` instead of `pickle` is that it can handle many callables that are defined locally in your application code.

```python
import dill


def build_greeter(prefix: str):
    suffix = "!"

    def greet(name: str) -> str:
        return f"{prefix}, {name}{suffix}"

    return greet


greeter = build_greeter("Hello")

blob = dill.dumps(greeter)
restored_greeter = dill.loads(blob)

print(restored_greeter("Ada"))
```

This pattern is useful for Python worker processes, local caching, distributed experiments, and checkpointing application state that includes dynamically defined functions.

## Control What Gets Serialized

`dill` exposes the same per-call API shape as `pickle`, plus additional options that matter for larger Python object graphs.

### `recurse=True`

Use `recurse=True` when serializing a function and you want `dill` to trace the globals that the function actually references instead of storing the entire globals dictionary.

```python
import dill

SCALE = 100


def normalize(value: int) -> float:
    return value / SCALE


blob = dill.dumps(normalize, recurse=True)
restored = dill.loads(blob)

print(restored(25))
```

### `byref=True`

Use `byref=True` when you want certain objects, such as modules, to be serialized by reference instead of trying to capture their full contents.

```python
import dill
import math


payload = {
    "module": math,
    "sqrt": math.sqrt,
}

blob = dill.dumps(payload, byref=True)
restored = dill.loads(blob)

print(restored["sqrt"](81))
```

You can also set process-wide defaults through `dill.settings`:

```python
import dill


dill.settings["recurse"] = True
dill.settings["byref"] = True
```

Set these deliberately. Global settings change how every later `dill.dump` or `dill.dumps` call behaves in the current process.

## Save And Restore Module State

`dill` can save the state of `__main__` or another module, which is useful when you need to checkpoint an interactive session or a script's working state.

### Save the current `__main__` state

```python
import dill


counter = 3


def bump() -> int:
    return counter + 1


dill.dump_module("session.pkl")
```

### Restore it later

```python
import dill


dill.load_module("session.pkl")

print(counter)
print(bump())
```

This is the `dill` feature to reach for when you need session-style persistence, not just object-level serialization.

## Debug Serialization Failures

When a payload is hard to serialize, `dill.detect.trace()` helps show what `dill` is walking.

```python
import dill


def make_handler(prefix: str):
    return lambda name: f"{prefix}: {name}"


handler = make_handler("user")

with dill.detect.trace():
    dill.dumps(handler)
```

Use this when an object graph unexpectedly pulls in large globals or fails during pickling.

## Common Pitfalls

- Do not load `dill` data from untrusted sources. `dill` uses the same trust model as `pickle`, and unpickling can execute arbitrary code.
- Keep the writing and reading environments compatible. Serialized objects that depend on local modules, local classes, or locally defined functions are easiest to restore in a similar Python environment.
- Be careful with globals. Without `recurse=True`, serializing a function can capture more module state than you intended.
- Use `byref=True` when the target environment already has importable modules or objects and you do not want to embed as much state in the pickle.
- Prefer JSON or another interoperable format for long-term storage or cross-language exchange. `dill` is for Python object serialization.

## Practical Recommendations

- Start with `dill.dumps()` and `dill.loads()` during development so failures stay easy to inspect.
- Switch to `dill.dump()` and `dill.load()` for file-based caches, checkpoints, or task handoff between Python processes.
- Reach for `dump_module()` and `load_module()` only when you really need session-level persistence.
- Keep serialized payloads scoped to one application or environment instead of treating them as a stable public format.
