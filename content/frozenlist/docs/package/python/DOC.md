---
name: package
description: "frozenlist package guide for Python projects that need a MutableSequence which can be frozen and hashed"
metadata:
  languages: "python"
  versions: "1.8.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "frozenlist,python,collections,mutable-sequence,aio-libs"
---

# frozenlist Python Package Guide

## Golden Rule

Use `frozenlist.FrozenList` when you need normal list-style mutation during setup and an immutable, hashable sequence afterward. The public API is intentionally small: `FrozenList` implements `collections.abc.MutableSequence`, `freeze()` makes it immutable, and hashing only works after the instance is frozen.

## Install

`frozenlist 1.8.0` requires Python 3.9 or newer.

```bash
python -m pip install "frozenlist==1.8.0"
```

Common alternatives:

```bash
uv add "frozenlist==1.8.0"
poetry add "frozenlist==1.8.0"
```

Most projects should use the published wheels from PyPI. If you are building the package from a source checkout, the 1.8.0 changelog documents `--config-settings=pure-python=true` for explicitly requesting a pure-Python build.

## Imports, Environment Variables, And Setup

There is no auth step, client object, or required runtime environment variable. Import the class directly:

```python
from frozenlist import FrozenList
```

For normal app code, that is all the setup you need.

## Build A List, Then Freeze It

`FrozenList` starts mutable. Use normal `MutableSequence` operations first, then freeze it once the contents are final:

```python
from frozenlist import FrozenList

steps = FrozenList(["parse"])
steps.append("validate")
steps.extend(["enrich", "serialize"])
steps.insert(1, "normalize")

assert not steps.frozen

steps.freeze()

assert steps.frozen
print(steps[0])       # "parse"
print(len(steps))     # 5
print(list(steps))    # ['parse', 'normalize', 'validate', 'enrich', 'serialize']
```

After `freeze()`, mutating operations raise `RuntimeError`.

## Use A FrozenList As A Cache Key Or Dict Key

`FrozenList` becomes hashable only after freezing. Hashing an unfrozen instance raises `RuntimeError`.

```python
from frozenlist import FrozenList

enabled_features = FrozenList(["search", "audit"])

enabled_features.freeze()

cache = {enabled_features: "compiled-config"}
print(cache[enabled_features])
print(hash(enabled_features))
```

This is the main reason to choose `FrozenList` instead of a plain list.

## Make A New Editable Copy

`freeze()` is one-way. If you need to keep editing, build a new `FrozenList` from the current items instead of trying to thaw the existing one:

```python
from frozenlist import FrozenList

base = FrozenList(["read", "write"])
base.freeze()

editable = FrozenList(base)
editable.append("admin")
editable.freeze()
```

## Type Hints

`FrozenList` supports generic type syntax on Python 3.9+:

```python
from frozenlist import FrozenList

names: FrozenList[str] = FrozenList(["alice", "bob"])
names.freeze()
```

## Version Notes For 1.8.0

- PyPI lists `1.8.0` as the current release and requires Python 3.9+.
- The public runtime API remains the same small surface shown in the maintainer docs: `FrozenList`, `.frozen`, and `.freeze()`, plus standard `MutableSequence` behavior.
- `1.7.0` added `copy.deepcopy()` support for `FrozenList`, so that behavior is available in `1.8.0`.
- `1.8.0` changelog entries are packaging-focused. They add CPython 3.14 wheel builds and document `--config-settings=pure-python=true` for explicitly requesting a pure-Python build from source.

## Common Pitfalls

- Do not call `hash()` before `freeze()`. Upstream documents this as a `RuntimeError`.
- Do not expect `freeze()` to be reversible. The docs expose no unfreeze API.
- Do all list edits before freezing. Once frozen, methods like `append()`, `extend()`, item assignment, and deletion stop working.
- `FrozenList` is list-like, not tuple-like. If you need a built-in immutable sequence and do not need staged mutation, a plain `tuple` may be simpler.
- Build-only knobs like `FROZENLIST_CYTHON_TRACING` and `--config-settings=with-cython-tracing=true` are for debugging or packaging workflows, not normal runtime use.

## Official Sources

- Maintainer docs: https://frozenlist.aio-libs.org/en/latest/
- Changelog: https://frozenlist.aio-libs.org/en/latest/changes.html
- PyPI project page: https://pypi.org/project/frozenlist/
