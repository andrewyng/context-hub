---
name: package
description: "cytoolz package guide for Python projects using the cytoolz and toolz maintainer docs"
metadata:
  languages: "python"
  versions: "1.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "cytoolz,toolz,python,functional,iterators,dictionaries"
---

# cytoolz Python Package Guide

## Golden Rule

Use `cytoolz` when you want the `toolz` API with the Cython-backed implementation. The maintainers document `cytoolz` as implementing the same API as `toolz`, so the practical references are the `cytoolz` package page plus the `toolz` documentation.

## Install

Pin the package version your project expects:

```bash
python -m pip install "cytoolz==1.1.0"
```

`cytoolz` supports Python 3.9+. It is developed in Cython and may need a working C compiler when `pip` cannot use a prebuilt wheel for your platform.

## Imports And Setup

`cytoolz` is a local utility library. There is no client initialization, authentication flow, or required environment variable.

Common imports:

```python
from cytoolz import compose, frequencies, groupby, merge_with, pipe, update_in, valmap
from cytoolz.curried import filter, map
```

Use the base `cytoolz` namespace for direct function calls, and `cytoolz.curried` when you want partially applied `map`, `filter`, and other higher-order helpers in pipelines.

## Common Workflows

### Compose small functions into one reusable transform

```python
from cytoolz import compose, frequencies
from cytoolz.curried import map

def normalize(word: str) -> str:
    return word.lower().rstrip(",.!?:;'-\"").lstrip("'\"")

wordcount = compose(frequencies, map(normalize), str.split)

print(wordcount("This cat jumped over this other cat!"))
# {'this': 2, 'cat': 2, 'jumped': 1, 'over': 1, 'other': 1}
```

This is the core `toolz` style: build a larger operation from small functions instead of writing one monolithic loop.

### Build left-to-right pipelines with curried helpers

```python
from cytoolz import pipe
from cytoolz.curried import filter, map

users = [
    {"email": "a@example.com", "active": True},
    {"email": "b@example.com", "active": False},
    {"email": "c@example.com", "active": True},
]

active_emails = pipe(
    users,
    filter(lambda user: user["active"]),
    map(lambda user: user["email"]),
    list,
)

print(active_emails)
# ['a@example.com', 'c@example.com']
```

If you want this style, import from `cytoolz.curried`; the curried namespace is what turns helpers like `map` and `filter` into pipeline-friendly callables.

### Process large iterables lazily

Many iterator helpers are lazy and only compute values when you consume them.

```python
from cytoolz import partition_all

records = range(10)
batches = partition_all(4, records)

for batch in batches:
    print(batch)

# (0, 1, 2, 3)
# (4, 5, 6, 7)
# (8, 9)
```

This is useful when you want to keep memory usage low while reading files, database rows, or other large streams. Materialize the result with `list(...)` or `tuple(...)` only when you actually need all values in memory.

### Group and reduce collections

```python
from cytoolz import groupby, merge_with

orders = [
    {"region": "us", "total": 12},
    {"region": "eu", "total": 7},
    {"region": "us", "total": 5},
]

orders_by_region = groupby("region", orders)
print(orders_by_region["us"])
# [{'region': 'us', 'total': 12}, {'region': 'us', 'total': 5}]

daily_counts = merge_with(sum, {"paid": 3, "failed": 1}, {"paid": 2, "refunded": 1})
print(daily_counts)
# {'paid': 5, 'failed': 1, 'refunded': 1}
```

`groupby`, `frequencies`, `countby`, and `merge_with` are the high-value helpers when you are replacing ad hoc aggregation code.

### Update nested dictionaries without mutating in place

```python
from cytoolz import assoc_in, update_in, valmap

config = {
    "db": {"host": "localhost", "port": 5432},
    "features": {"search": True, "billing": False},
}

next_config = assoc_in(config, ["db", "host"], "db.internal")
next_config = update_in(next_config, ["db", "port"], lambda port: port + 1)
feature_flags = valmap(str, next_config["features"])

print(next_config)
# {'db': {'host': 'db.internal', 'port': 5433}, 'features': {'search': True, 'billing': False}}

print(feature_flags)
# {'search': 'True', 'billing': 'False'}
```

These helpers are useful when you want explicit data transformation without mutating a shared dictionary in place.

## Common Pitfalls

- Many sequence helpers are lazy iterators. If you iterate once, the values are consumed. Convert to `list(...)` at the boundary where you need reuse.
- Use `cytoolz.curried` for pipeline composition. Importing from `cytoolz` alone does not automatically give you curried `map`, `filter`, or `reduce`.
- `cytoolz` is a compiled package. If installation falls back to a source build, missing compiler toolchains will fail the install.
- Python 3.13 free-threading support is marked experimental by the maintainers, and they explicitly warn that `cytoolz` has not been developed or tested for thread safety.

## Version-Sensitive Notes For 1.1.0

- PyPI lists `1.1.0` as the current package version for this guide.
- The maintainers document Python 3.9+ support for the current codebase.
- The documented API surface is still the `toolz` API, so the `toolz` docs remain the authoritative function reference for `cytoolz` usage.

## Official Sources

- cytoolz GitHub repository: https://github.com/pytoolz/cytoolz
- cytoolz PyPI page: https://pypi.org/project/cytoolz/
- cytoolz 1.1.0 release page on PyPI: https://pypi.org/project/cytoolz/1.1.0/
- Toolz installation guide: https://toolz.readthedocs.io/en/latest/install.html
- Toolz curry and curried namespace guide: https://toolz.readthedocs.io/en/latest/curry.html
- Toolz laziness guide: https://toolz.readthedocs.io/en/latest/laziness.html
- Toolz API reference: https://toolz.readthedocs.io/en/latest/api.html
