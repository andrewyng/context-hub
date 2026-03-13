---
name: package
description: "mypy-extensions package guide for legacy mypy and mypyc typing helpers in Python"
metadata:
  languages: "python"
  versions: "1.1.0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "python,typing,mypy,mypyc,types"
---

# mypy-extensions Python Package Guide

## Golden Rule

Use `mypy-extensions` only for legacy code or for helpers that are specific to `mypy` and `mypyc`. For new application code, prefer the standard `typing` module or `typing_extensions` when the package itself marks a symbol as deprecated.

## Install

`mypy-extensions` 1.1.0 requires Python 3.8 or later.

```bash
python -m pip install mypy-extensions==1.1.0
```

If you manage dependencies in `pyproject.toml`:

```toml
[project]
dependencies = [
  "mypy-extensions==1.1.0",
]
```

The distribution name on PyPI is `mypy-extensions`, but the import name in code is `mypy_extensions`.

## Initialization And Environment

There are no environment variables, API keys, or client objects to configure. Import the helpers you need directly from `mypy_extensions`.

```python
from mypy_extensions import (
    Arg,
    DefaultArg,
    DefaultNamedArg,
    KwArg,
    NamedArg,
    VarArg,
    i64,
    mypyc_attr,
    trait,
)
```

## Recommended Modern Replacements

Two legacy names exposed by `mypy_extensions` are explicitly deprecated in 1.1.0:

- `mypy_extensions.TypedDict` → use `typing.TypedDict` or `typing_extensions.TypedDict`
- `mypy_extensions.NoReturn` → use `typing.NoReturn` or `typing_extensions.NoReturn`

Use the modern forms in new code:

```python
from typing import NoReturn
from typing_extensions import TypedDict


class UserPayload(TypedDict):
    id: int
    email: str


def fail(message: str) -> NoReturn:
    raise RuntimeError(message)
```

## Common Workflows

### Describe callable argument kinds for `mypy`

`Arg`, `DefaultArg`, `NamedArg`, `DefaultNamedArg`, `VarArg`, and `KwArg` let `mypy` describe argument kinds inside a `Callable[...]` type. At runtime, these helpers simply return the wrapped type.

```python
from collections.abc import Callable

from mypy_extensions import Arg, DefaultNamedArg, KwArg, VarArg

PluginHook = Callable[[
    Arg(str, "event"),
    DefaultNamedArg(bool, "dry_run"),
    VarArg(bytes),
    KwArg(str),
], None]


def emit(
    event: str,
    *payload: bytes,
    dry_run: bool = False,
    **labels: str,
) -> None:
    print(event, payload, dry_run, labels)


hook: PluginHook = emit
```

Use these helpers only in type annotations. They do not enforce argument behavior at runtime.

### Keep a legacy `TypedDict` import working

If you are maintaining older code that already imports `TypedDict` from `mypy_extensions`, the symbol still exists in 1.1.0, but it is deprecated and emits a `DeprecationWarning` when the typed dict class is created.

```python
from mypy_extensions import TypedDict


class LegacyMovie(TypedDict):
    title: str
    year: int


movie: LegacyMovie = {"title": "Alien", "year": 1979}
```

Prefer migrating that import to `typing.TypedDict` or `typing_extensions.TypedDict` instead of adding new uses of the legacy form.

### Mark classes for `mypyc`

`trait` and `mypyc_attr(...)` are decorators used by tooling in the `mypy` and `mypyc` ecosystem. At runtime they behave like identity decorators.

```python
from mypy_extensions import mypyc_attr, trait


@trait
class Visitor:
    def visit_int(self, value: int) -> str:
        raise NotImplementedError


@mypyc_attr(allow_interpreted_subclasses=True)
class Node:
    def __init__(self, value: int) -> None:
        self.value = value
```

Use these only if your project already relies on `mypyc` behavior. In ordinary Python execution they do not add runtime validation or behavior.

### Use mypyc fixed-width integer marker types

`i64`, `i32`, `i16`, and `u8` represent native fixed-width integer types for `mypyc`. In normal Python code, they construct plain `int` values and `isinstance(x, i64)` behaves like `isinstance(x, int)`.

```python
from mypy_extensions import i16, i64, u8

count: i64 = i64(10)
small: i16 = i16("12")
byte: u8 = u8(255)

assert isinstance(count, i64)
assert isinstance(count, int)
assert isinstance(byte, u8)
```

These types are useful only when your code is interpreted by tooling that understands the mypyc-specific integer semantics.

## Common Pitfalls

- Do not install `mypy-extensions` and then import `mypy-extensions`; the Python module name is `mypy_extensions`.
- Do not use `mypy_extensions.TypedDict` or `mypy_extensions.NoReturn` in new code; both are deprecated in 1.1.0.
- Do not expect `Arg(...)`, `NamedArg(...)`, `VarArg(...)`, or `KwArg(...)` to change runtime behavior; they are typing helpers, not runtime wrappers.
- Do not use `isinstance(value, TypedDictSubclass)` or `issubclass(...)` checks with legacy typed dicts; `mypy_extensions.TypedDict` explicitly rejects instance and class checks.
- Do not expect `i64`, `i32`, `i16`, or `u8` to behave like fixed-width integers in normal Python execution; outside mypyc-specific contexts they behave like `int`.
- Do not assume legacy typed dict introspection matches modern `typing.TypedDict`; `mypy_extensions.TypedDict` exposes `__annotations__` and `__total__`, but not the newer required/optional key metadata used by modern typed dict implementations.

## Version-Sensitive Notes For 1.1.0

- `mypy-extensions` 1.1.0 declares `Requires-Python >=3.8`.
- The 1.1.0 wheel advertises Python 3.8 through 3.13 support.
- `TypedDict` emits a deprecation warning telling you to use `typing.TypedDict` or `typing_extensions.TypedDict`.
- `NoReturn` is provided through module attribute fallback and emits a deprecation warning telling you to use `typing.NoReturn` or `typing_extensions.NoReturn`.
- The package surface is intentionally small; if you need broader modern typing features, reach for `typing` or `typing_extensions` rather than expecting this package to mirror them.

## Official Sources

- Maintainer repository: https://github.com/python/mypy_extensions
- PyPI project: https://pypi.org/project/mypy-extensions/
- 1.1.0 wheel published on PyPI: https://files.pythonhosted.org/packages/79/7b/2c79738432f5c924bef5071f933bcc9efd0473bac3b4aa584a6f7c1c8df8/mypy_extensions-1.1.0-py3-none-any.whl
