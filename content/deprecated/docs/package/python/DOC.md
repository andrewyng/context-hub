---
name: package
description: "Deprecated package guide for Python projects using decorator-based deprecation warnings and Sphinx docstring directives"
metadata:
  languages: "python"
  versions: "1.3.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "deprecated,python,warnings,decorators,sphinx"
---

# Deprecated Python Package Guide

## Golden Rule

Use the official `Deprecated` package when you need to mark Python functions, methods, classes, or parameters as deprecated. The main entry points are:

- `from deprecated import deprecated`
- `from deprecated.params import deprecated_params`
- `from deprecated.sphinx import deprecated, versionadded, versionchanged`

If you are adopting the `1.3.x` line, pin `1.3.1`. The upstream changelog says `1.3.0` was yanked on PyPI because it missed the source distribution, and `1.3.1` replaces it with a packaging fix.

## Install

Use a virtual environment and pin the package version your project expects:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "Deprecated==1.3.1"
```

`Deprecated` uses `wrapt` under the hood; `pip` installs that dependency automatically.

The upstream docs still document historical support as far back as Python 2.7 and Python 3.4+, but the current compatibility matrix is maintained around recent `wrapt` releases and tested on current Python 3 versions. For new code, use Python 3.

## Runtime Setup

There is no client object, auth flow, or required environment variable. You import a decorator and apply it directly to the callable or class you want to phase out.

The one environment variable that matters operationally is Python’s standard warning control:

```bash
PYTHONWARNINGS=default::DeprecationWarning
```

That makes deprecation warnings visible without changing application code.

## Deprecate A Function

The default decorator emits a `DeprecationWarning` each time the function is called:

```python
from deprecated import deprecated


@deprecated(reason="Use better_print instead", version="2.4.0")
def print_value(value: object) -> None:
    print(value)


def better_print(value: object) -> None:
    print(value)


print_value("hello")
```

You can also decorate methods and entire classes with the same import:

```python
from deprecated import deprecated


class Printer:
    @deprecated(reason="Use render instead", version="2.4.0")
    def print_value(self, value: object) -> None:
        print(value)

    def render(self, value: object) -> None:
        print(value)


@deprecated(reason="Use NewFormatter instead", version="3.0.0")
class OldFormatter:
    pass
```

When you deprecate a class, the warning is emitted when the class is instantiated, not on every later method call.

## Control How Warnings Surface

`Deprecated` uses Python’s warnings system. By default it uses `DeprecationWarning`, which Python often suppresses outside code running in `__main__`. For tests or CI, explicitly enable or escalate the warning:

```python
import warnings
from deprecated import deprecated


warnings.simplefilter("default", DeprecationWarning)


@deprecated(reason="Use new_api instead", version="1.8.0")
def old_api() -> None:
    pass


old_api()
```

If you want the decorator itself to change local warning behavior, pass `action`:

```python
from deprecated import deprecated


@deprecated(reason="Use new_api instead", version="1.8.0", action="error")
def old_api() -> None:
    pass
```

If the warning is meant for application end users rather than Python developers, use a different warning category such as `FutureWarning`:

```python
from deprecated import deprecated


@deprecated(
    reason="The legacy CLI flag will be removed; use --format=json",
    version="5.0.0",
    category=FutureWarning,
)
def run_report() -> None:
    pass
```

If you wrap deprecated callables in your own instrumentation, pass `extra_stacklevel` so the warning points at user code instead of your helper layer:

```python
from deprecated import deprecated


@deprecated(
    reason="Use new_api instead",
    version="1.8.0",
    extra_stacklevel=1,
)
def old_api() -> None:
    pass
```

## Deprecate Individual Parameters

Use `deprecated_params` when the function should stay, but one or more arguments should not:

```python
from deprecated.params import deprecated_params


class APIV2Warning(DeprecationWarning):
    pass


@deprecated_params(
    {
        "timeout_seconds": "timeout_seconds is deprecated; use timeout instead",
        "start": "start is removed in v2",
    },
    category=APIV2Warning,
)
def fetch_data(url: str, timeout: float = 5.0, timeout_seconds=None, start=None):
    if timeout_seconds is not None:
        timeout = timeout_seconds
    return {"url": url, "timeout": timeout, "start": start}
```

You can stack parameter deprecations when you need different messages or categories across releases.

## Add Sphinx Lifecycle Directives

If your project builds API docs with Sphinx, use the decorators from `deprecated.sphinx`. They both update the docstring and, for `deprecated`, emit a warning at runtime.

```python
from deprecated.sphinx import deprecated as sphinx_deprecated
from deprecated.sphinx import versionadded
from deprecated.sphinx import versionchanged


@sphinx_deprecated(reason="Use successor_v2 instead", version="0.3.0")
@versionchanged(reason="Added negative-number support", version="0.2.0")
@versionadded(reason="Initial public release", version="0.1.0")
def successor(n: int) -> int:
    """
    Return the next integer.
    """
    return n + 1
```

Important details from the upstream Sphinx guide:

- Apply these decorators in reverse order: most recent first, oldest last.
- Build docs in an environment where your package is installed, because Sphinx has to import the module so the decorators can rewrite the docstring.

## Common Pitfalls

- `DeprecationWarning` is easy to miss in library code because Python ignores it by default in many contexts. Turn warnings on in tests, or use a different category when the audience is end users.
- A deprecated class warns on construction only. If you expect a warning on every method call, deprecate the method instead.
- Use the top-level `deprecated` import for runtime warnings and the `deprecated.sphinx` import when you want Sphinx directives added to docstrings.
- `1.3.1` is the safe `1.3.x` target. Upstream explicitly says `1.3.0` was yanked on PyPI.

## Official Sources

- Maintainer docs root: https://deprecated.readthedocs.io/en/latest/
- Installation guide: https://deprecated.readthedocs.io/en/latest/installation.html
- Tutorial: https://deprecated.readthedocs.io/en/latest/tutorial.html
- Sphinx decorators guide: https://deprecated.readthedocs.io/en/latest/sphinx_deco.html
- API reference: https://deprecated.readthedocs.io/en/latest/api.html
- Changelog: https://deprecated.readthedocs.io/en/latest/changelog.html
- PyPI package page: https://pypi.org/project/Deprecated/
