---
name: package
description: "Cloudpickle Python package guide for serializing lambdas, closures, and interactive code"
metadata:
  languages: "python"
  versions: "3.1.2"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "cloudpickle,python,serialization,pickle,distributed-computing"
---

# cloudpickle Python Package Guide

## Golden Rule

Use `cloudpickle` when the standard library `pickle` module cannot serialize the Python object you need to send between short-lived Python processes, especially lambdas, nested functions, and functions or classes defined interactively in `__main__`, a shell, or a notebook. Treat the result as trusted, short-lived process-to-process data: upstream documents that producer and consumer should run the exact same Python version, and long-term object storage is explicitly discouraged.

## Install

Pin the version your project expects:

```bash
python -m pip install "cloudpickle==3.1.2"
```

Common alternatives:

```bash
uv add "cloudpickle==3.1.2"
poetry add "cloudpickle==3.1.2"
```

Upstream package metadata for `3.1.2` says:

- `Requires-Python: >=3.8`
- no mandatory runtime dependencies
- classifiers list CPython and PyPy, with Python `3.8` through `3.14`

## Initialize And Setup

`cloudpickle` has no client object, auth flow, or environment variables. Import it where you serialize values, and use standard `pickle` or `cloudpickle` to deserialize them.

```python
import cloudpickle
import pickle
```

The top-level APIs you will typically use are:

- `cloudpickle.dumps(obj)` to serialize to in-memory bytes
- `cloudpickle.dump(obj, file)` to write to a file-like object
- `pickle.loads(data)` or `cloudpickle.loads(data)` to deserialize bytes
- `pickle.load(file)` or `cloudpickle.load(file)` to deserialize from a file-like object

`cloudpickle` does not ship a separate unpickling format. Its `load` and `loads` names are convenience aliases to `pickle.load` and `pickle.loads`.

## Core Usage

### Serialize a lambda or nested function

```python
import cloudpickle
import pickle

scale = 3
transform = lambda value: value * scale

payload = cloudpickle.dumps(transform)
restored = pickle.loads(payload)

print(restored(5))
```

### Serialize a function defined in `__main__`

```python
import cloudpickle
import pickle

PREFIX = "task:"

def build_name(item_id):
    return f"{PREFIX}{item_id}"

payload = cloudpickle.dumps(build_name)
restored = pickle.loads(payload)

print(restored(42))
```

### Write payloads to a file

```python
import cloudpickle
import pickle
from pathlib import Path

def make_record(name):
    return {"name": name.upper()}

path = Path("payload.pkl")

with path.open("wb") as handle:
    cloudpickle.dump(make_record, handle)

with path.open("rb") as handle:
    restored = pickle.load(handle)

print(restored("alice"))
```

### Force an importable module to serialize by value

By default, importable functions and classes are serialized by reference, which means the unpickling environment must be able to import the same module. If you are actively developing a local module and remote workers do not have that version installed yet, upstream provides `register_pickle_by_value(module)` as an explicit override.

```python
import cloudpickle
import my_worker_code

cloudpickle.register_pickle_by_value(my_worker_code)
try:
    payload = cloudpickle.dumps(my_worker_code.transform)
finally:
    cloudpickle.unregister_pickle_by_value(my_worker_code)
```

Pass the imported module object itself, not a module name string.

## Configuration And Compatibility

There is no runtime service configuration. The settings that matter are the pickle protocol and your Python-version compatibility assumptions.

Use the default protocol when both sides run the same Python version:

```python
import cloudpickle

payload = cloudpickle.dumps(obj)
```

If you need an older protocol number, pass it explicitly from `pickle`:

```python
import cloudpickle
import pickle

payload = cloudpickle.dumps(obj, protocol=pickle.DEFAULT_PROTOCOL)
```

Important upstream behavior:

- `protocol=None` uses `cloudpickle.DEFAULT_PROTOCOL`, which is an alias for `pickle.HIGHEST_PROTOCOL`
- the default favors communication speed between processes running the same Python version
- using `pickle.DEFAULT_PROTOCOL` can help when you need an older pickle protocol, but upstream does not guarantee compatibility across Python versions because `cloudpickle` relies on Python implementation details

## Common Pitfalls

- Never unpickle data from untrusted sources. Upstream repeats the standard pickle security warning: loading pickle data can execute arbitrary code.
- Do not use `cloudpickle` as a stable long-term storage format for saved application state.
- Keep the producer and consumer on the exact same Python version.
- `register_pickle_by_value()` is experimental. Upstream documents failure cases when a by-value function or class body relies on imports that are unavailable in the unpickling environment.
- Avoid mixing assumptions about by-reference and by-value code paths. Upstream also documents cases where a function pickled by reference can fail when it depends at runtime on a function that was pickled by value.
- `register_pickle_by_value()` and `unregister_pickle_by_value()` expect imported module objects. They raise `ValueError` for invalid inputs or for modules that were not registered.

## Version-Sensitive Notes For 3.1.2

- The published `3.1.2` package sets `__version__ = "3.1.2"`.
- The public top-level API exports `Pickler`, `CloudPickler`, `dump`, `dumps`, `load`, `loads`, `register_pickle_by_value`, and `unregister_pickle_by_value`.
- `CloudPickler` is a backward-compatible alias for `Pickler`.
- PyPI metadata for `3.1.2` advertises Python `>=3.8` and classifiers through Python `3.14`.

## Official Sources

- GitHub repository and maintainer README: `https://github.com/cloudpipe/cloudpickle`
- PyPI package page: `https://pypi.org/project/cloudpickle/`
