---
name: package
description: "Pyflakes static analysis guide for checking Python code for undefined names, unused imports, and similar correctness issues"
metadata:
  languages: "python"
  versions: "3.4.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "pyflakes,python,lint,static-analysis,cli"
---

# Pyflakes Python Package Guide

## Golden Rule

Use `pyflakes` for fast correctness checks, not style enforcement. Upstream documents it as a passive checker that parses source without importing modules, so it is safe to run on files with import-time side effects. If you need formatting rules, PEP 8 checks, or project-level configuration, use `flake8` instead of expecting standalone `pyflakes` to do that.

## Install

`pyflakes 3.4.0` requires Python 3.9 or newer.

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "pyflakes==3.4.0"
```

If you manage dependencies with another tool:

```bash
uv add "pyflakes==3.4.0"
poetry add "pyflakes==3.4.0"
```

Install and run it with the same interpreter version as the code you are checking:

```bash
python3.12 -m pip install "pyflakes==3.4.0"
python3.12 -m pyflakes src tests
```

## Environment Variables

`pyflakes` does not require authentication, API keys, or service configuration.

Optional environment variables exposed by the checker:

```bash
PYFLAKES_BUILTINS=_,ngettext
PYFLAKES_DOCTEST=1
```

- `PYFLAKES_BUILTINS` adds comma-separated names to the builtins set, which is useful for framework-injected globals.
- `PYFLAKES_DOCTEST` enables doctest checking. Doctest parsing is disabled by default.

## Command-Line Usage

The simplest way to run `pyflakes` is with `python -m pyflakes`, which keeps the tool tied to a specific Python interpreter.

### Check one file

```bash
python -m pyflakes app.py
```

### Check multiple paths

```bash
python -m pyflakes src tests scripts/manage.py
```

When you pass directories, `pyflakes` recurses through them and checks Python files it finds. It also recognizes extensionless Python scripts by their shebang, so executable scripts can still be linted.

### Check source from standard input

```bash
cat app.py | python -m pyflakes
```

### Print the installed version

```bash
python -m pyflakes --version
```

The CLI exits with status `0` when no warnings are emitted and `1` when one or more warnings are found, which makes it easy to use in CI.

## Common Workflows

### Add a quick CI gate

```bash
python -m pyflakes src tests
```

Minimal GitHub Actions step:

```yaml
- name: Install pyflakes
  run: python -m pip install "pyflakes==3.4.0"

- name: Run pyflakes
  run: python -m pyflakes src tests
```

### Treat framework globals as known names

If your project relies on names injected at runtime, declare them with `PYFLAKES_BUILTINS` before running the checker:

```bash
export PYFLAKES_BUILTINS=_,lazy_gettext
python -m pyflakes src
```

### Check doctest blocks

```bash
export PYFLAKES_DOCTEST=1
python -m pyflakes docs examples
```

## Python API

The supported public API is in `pyflakes.api`.

### Check an in-memory source string

```python
from pyflakes.api import check

source = """
import os

def greet(name):
    return message
"""

warnings = check(source, "example.py")
if warnings:
    raise SystemExit(1)
```

`check()` parses the source, reports warnings through the default reporter when you do not provide one, and returns the number of warnings emitted.

### Check a file from your own tooling

```python
from pyflakes.api import checkPath

warnings = checkPath("app.py")
if warnings:
    raise SystemExit(1)
```

## Common Pitfalls

- `pyflakes` intentionally does not do style checks. It will not enforce formatting, import sorting, or line length.
- The standalone CLI is intentionally minimal. In current upstream code, it exposes `--version` and positional paths or stdin; if you need per-project configuration and more switches, upstream points you to `flake8`.
- Run `pyflakes` with a Python version that can parse your code. Syntax support tracks Python releases, and `3.4.0` adds Python 3.14 support.
- Doctest checking is off unless `PYFLAKES_DOCTEST` is set.
- If your project relies on globals that are created outside normal Python name binding, configure them with `PYFLAKES_BUILTINS` or you will get `undefined name` warnings.

## Version Notes For 3.4.0

The `3.4.0` release adds Python 3.14 support, adds a new "t-string is missing placeholders" error, and includes fixes around deferred annotations and `from __future__ import annotations`.

## Official Sources

- PyPI package page: https://pypi.org/project/pyflakes/3.4.0/
- Maintainer repository: https://github.com/PyCQA/pyflakes
- Command-line and API implementation: https://github.com/PyCQA/pyflakes/blob/main/pyflakes/api.py
- Checker implementation: https://github.com/PyCQA/pyflakes/blob/main/pyflakes/checker.py
- Changelog: https://github.com/PyCQA/pyflakes/blob/main/NEWS.rst
