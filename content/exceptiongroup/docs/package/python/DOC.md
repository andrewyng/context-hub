---
name: package
description: "exceptiongroup package guide for Python projects that need PEP 654 exception groups before Python 3.11"
metadata:
  languages: "python"
  versions: "1.3.1"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "exceptiongroup,python,exceptions,pep-654,compatibility"
---

# exceptiongroup Python Package Guide

## Golden Rule

Use `exceptiongroup` when your code needs Python 3.11-style exception groups on Python 3.7-3.10, or when you want one import path that also works on newer Python versions. On Python 3.11+, importing `exceptiongroup` uses the built-in exception-group classes and does not install the traceback monkey patches.

## Install

Pin the version your project expects:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "exceptiongroup==1.3.1"
```

`exceptiongroup 1.3.1` requires Python 3.7 or newer.

## Initialization And Runtime Behavior

This package has no client object, credentials, or service initialization step. Import the APIs you need directly:

```python
from exceptiongroup import BaseExceptionGroup, ExceptionGroup, catch, suppress
```

Optional environment variable:

```bash
EXCEPTIONGROUP_NO_PATCH=1
```

Set `EXCEPTIONGROUP_NO_PATCH=1` before Python starts if you do not want the package to patch `traceback.TracebackException` or install its exception hook on Python versions earlier than 3.11.

## Raise An Exception Group

Use `ExceptionGroup(message, exceptions)` to raise several related failures together:

```python
from exceptiongroup import ExceptionGroup


def validate_user(payload: dict) -> None:
    errors = []

    if "email" not in payload:
        errors.append(ValueError("email is required"))

    age = payload.get("age")
    if age is None:
        errors.append(ValueError("age is required"))
    elif age < 18:
        errors.append(ValueError("age must be at least 18"))

    if errors:
        raise ExceptionGroup("user payload is invalid", errors)
```

This is useful when you want to report multiple independent validation or task failures in one exception.

## Catch Matching Exceptions On Python 3.7-3.10

Python 3.7-3.10 does not have `except*`, so use `catch()` as a context manager:

```python
from exceptiongroup import BaseExceptionGroup, ExceptionGroup, catch


def handle_value_errors(excgroup: BaseExceptionGroup) -> None:
    for exc in excgroup.exceptions:
        print(f"value error: {exc}")


def handle_runtime_errors(excgroup: BaseExceptionGroup) -> None:
    print(f"runtime failures: {len(excgroup.exceptions)}")


with catch({
    ValueError: handle_value_errors,
    RuntimeError: handle_runtime_errors,
}):
    raise ExceptionGroup(
        "worker failures",
        [
            ValueError("bad input"),
            RuntimeError("worker crashed"),
        ],
    )
```

Important behavior:

- Each key in the mapping passed to `catch()` is an exception class or iterable of exception classes.
- Each handler is called with an exception group, not with a single exception instance.
- A handler runs at most once for its matching group.
- `catch()` cannot handle `BaseExceptionGroup` or `ExceptionGroup` themselves.

## Suppress Specific Exceptions Inside A Group

The package backports `contextlib.suppress()` behavior from Python 3.12.1 so matching exceptions can be ignored even when they are inside an exception group:

```python
from exceptiongroup import ExceptionGroup, suppress


with suppress(FileNotFoundError):
    raise ExceptionGroup(
        "cleanup failures",
        [FileNotFoundError("/tmp/app.tmp")],
    )
```

Use this for cleanup paths where a missing file or similar non-fatal error should not fail the whole operation.

## Tracebacks And Formatting

On Python 3.7-3.10, importing `exceptiongroup` normally patches traceback formatting so unhandled exception groups render correctly. If another library installs its own exception hook first, or if you disable patching with `EXCEPTIONGROUP_NO_PATCH=1`, use the package’s traceback helpers instead of the standard `traceback` module helpers:

```python
from exceptiongroup import ExceptionGroup, format_exception

try:
    raise ExceptionGroup("request failed", [ValueError("bad input")])
except Exception as exc:
    rendered = "".join(format_exception(exc))
    print(rendered)
```

The package provides versions of `format_exception()`, `format_exception_only()`, `print_exception()`, and `print_exc()` for this case.

## Common Pitfalls

- Do not write `except*` syntax if your supported runtime includes Python 3.7-3.10. Use `catch()` for that compatibility range.
- `catch()` handlers receive an exception group, so iterate over `excgroup.exceptions` if you need individual exceptions.
- Do not try to match `ExceptionGroup` or `BaseExceptionGroup` directly with `catch()`. The package explicitly does not support that.
- If you rely on custom exception hooks, decide whether you want the package’s automatic monkey patching. Set `EXCEPTIONGROUP_NO_PATCH=1` when you need full control.
- On Python 3.11+, importing this package does not install the traceback monkey patches or exception hook. If you expected import-time patching on newer Python, that behavior is different by design.

## Version Notes For 1.3.1

- PyPI lists `exceptiongroup 1.3.1` as the current release published on November 21, 2025.
- The package requires Python 3.7 or newer.
- The package remains primarily a compatibility layer for pre-3.11 runtimes; on Python 3.11+ it reuses the built-in exception-group classes instead of backporting them.

## Official Sources

- Maintainer repository: https://github.com/agronholm/exceptiongroup
- PyPI project page: https://pypi.org/project/exceptiongroup/
- Python built-in exceptions reference: https://docs.python.org/3/library/exceptions.html#exception-groups
