---
name: package
description: "Typeshed typing stubs for setuptools, for static checking of setup.py files and setuptools-based build helpers"
metadata:
  languages: "python"
  versions: "82.0.0.20260210"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "python,setuptools,typing,typeshed,packaging,stubs"
---

# types-setuptools Python Package Guide

## Golden Rule

Install `types-setuptools` as a typing dependency alongside the real `setuptools` package. It is a stub-only package for static analysis; your code still imports `setuptools` at runtime, not `types_setuptools`.

This release, `types-setuptools==82.0.0.20260210`, is published from typeshed and targets `setuptools==82.0.*`.

## Install

Use the stubs in the same virtual environment as your type checker and your `setuptools`-based build code:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "setuptools>=82,<83" "types-setuptools==82.0.0.20260210" mypy
```

If your project already pins `setuptools`, match the stub package to that runtime line instead of upgrading blindly.

## Initialization

There are no environment variables, credentials, or client objects to initialize.

The stubs become available when:

- `types-setuptools` is installed in the environment used by your type checker
- your code imports APIs from `setuptools`

## Common Workflows

### Type-check a `setup.py`

`types-setuptools` is useful when you still maintain a `setup.py`, custom build hooks, or helper modules that import `setuptools` directly.

```python
from setuptools import Extension, find_packages, setup

extensions = [
    Extension("demo._speedups", sources=["src/demo/_speedups.c"]),
]

setup(
    name="demo-package",
    version="0.1.0",
    package_dir={"": "src"},
    packages=find_packages(where="src"),
    ext_modules=extensions,
)
```

Run your type checker against the file:

```bash
python -m mypy setup.py
```

### Type-check namespace package discovery

Use `find_namespace_packages()` when you intentionally rely on implicit namespace packages.

```python
from setuptools import find_namespace_packages, setup

setup(
    name="acme-plugins",
    version="0.1.0",
    package_dir={"": "src"},
    packages=find_namespace_packages(where="src", include=["acme.*"]),
)
```

### Type-check a custom setuptools command

Setuptools documents custom commands as `setuptools.Command` subclasses that implement `initialize_options()`, `finalize_options()`, and `run()`.

```python
from setuptools import Command, setup


class LintCommand(Command):
    description = "run lint checks"
    user_options = []

    def initialize_options(self) -> None:
        pass

    def finalize_options(self) -> None:
        pass

    def run(self) -> None:
        print("lint passed")


setup(
    name="demo-package",
    version="0.1.0",
    cmdclass={"lint": LintCommand},
)
```

## Important Pitfalls

- Do not add `import types_setuptools` to application code. This package exists for type checkers, not runtime imports.
- Keep the stubs aligned with the `setuptools` version family you actually use. Typeshed stub versions encode the targeted runtime version plus a date suffix.
- `pkg_resources` is not bundled in `types-setuptools`; the PyPI package notes that `setuptools >= 71.1` already ships typing for `pkg_resources`.
- `find_namespace_packages()` scans implicit namespaces. In flat layouts this can include unwanted directories; prefer a `src/` layout or explicit `include`/`exclude` patterns.

## Version-Sensitive Notes

- PyPI lists `types-setuptools 82.0.0.20260210` as a February 10, 2026 release targeting `setuptools==82.0.*`.
- The package page says this release was tested with `mypy 1.19.1` and `pyright 1.1.408`.
- Typeshed documents that third-party stub package versions follow the runtime package version and use the final date segment to indicate when the stub package was published.

## Official Sources

- PyPI package page: https://pypi.org/project/types-setuptools/
- typeshed repository: https://github.com/python/typeshed
- typeshed README usage and versioning notes: https://github.com/python/typeshed/blob/main/README.md
- setuptools package discovery guide: https://setuptools.pypa.io/en/stable/userguide/package_discovery.html
- setuptools extension modules guide: https://setuptools.pypa.io/en/stable/userguide/ext_modules.html
- setuptools command customization guide: https://setuptools.pypa.io/en/stable/userguide/extension.html
