---
name: package
description: "pycodestyle package guide for checking Python source against selected PEP 8 style rules"
metadata:
  languages: "python"
  versions: "2.14.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "pycodestyle,python,lint,pep8,style,cli"
---

# pycodestyle Python Package Guide

## Golden Rule

Use `pycodestyle` when you need the upstream PEP 8 style checker itself: a small, dependency-free CLI and library for reporting style errors and warnings. It does not autofix code, it does not try to cover every rule in PEP 8, and the maintainer docs point you to `flake8` plus extensions for broader plugin-based linting.

For `pycodestyle 2.14.0`, PyPI lists `Requires: Python >=3.9`, and the 2.14.0 changelog adds Python 3.14 support.

## Install

Use a virtual environment and pin the version your project expects:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "pycodestyle==2.14.0"
```

Common alternatives:

```bash
uv add --dev "pycodestyle==2.14.0"
poetry add --group dev "pycodestyle==2.14.0"
```

There is no auth step and no required environment variable. `pycodestyle` is a local checker.

## Run The CLI

Check one file:

```bash
pycodestyle app.py
```

Check multiple files or directories:

```bash
pycodestyle src/ tests/
```

Stop after the first occurrence of each error code:

```bash
pycodestyle --first src/
```

Show the offending source line and the related PEP 8 text:

```bash
pycodestyle --show-source --show-pep8 src/package/module.py
```

Print aggregate statistics and fail the command if any issue is found:

```bash
pycodestyle --statistics --count src/ tests/
```

`pycodestyle` exits with status `1` when it reports any errors or warnings, so it fits directly into CI jobs and pre-merge checks.

## Configure Project Defaults

`pycodestyle` reads configuration from:

- user config: `~/.pycodestyle` on Windows, `XDG_CONFIG_HOME/pycodestyle` when `XDG_CONFIG_HOME` is set, otherwise `~/.config/pycodestyle`
- project config: `setup.cfg` or `tox.ini` with a `[pycodestyle]` section

The maintainer docs only document `setup.cfg` and `tox.ini` for project-level config. Do not assume `pyproject.toml` settings will be read by `pycodestyle` itself.

Example `setup.cfg`:

```ini
[pycodestyle]
exclude = .git,__pycache__,.venv,build,dist
filename = *.py
max-line-length = 88
max-doc-length = 72
statistics = True
show-source = True
```

Equivalent `tox.ini` section:

```ini
[pycodestyle]
ignore = E203,W503
select = E,W
format = pylint
```

You can also point the library API at a specific config file:

```python
import pycodestyle

style = pycodestyle.StyleGuide(config_file="tox.ini")
report = style.check_files(["src", "tests"])
```

## Common CLI Workflows

Check only a subset of codes:

```bash
pycodestyle --select=E,W6 src/
```

Ignore specific codes:

```bash
pycodestyle --ignore=E203,W503 src/
```

Use a custom machine-readable format:

```bash
pycodestyle --format='%(path)s|%(row)d|%(col)d| %(code)s %(text)s' src/
```

Limit checks to changed lines from a unified diff:

```bash
git diff --unified=0 | pycodestyle --diff
```

When `--diff` is enabled, `pycodestyle` reads the diff from stdin and reports only lines included in the patch.

## Use The Python API

Check multiple paths with `StyleGuide`:

```python
import pycodestyle

style = pycodestyle.StyleGuide(
    quiet=False,
    ignore=["E203", "W503"],
    max_line_length=88,
)

report = style.check_files(["src", "tests"])

if report.total_errors:
    raise SystemExit(1)
```

Check a single file with `Checker`:

```python
import pycodestyle

checker = pycodestyle.Checker(
    "src/package/module.py",
    show_source=True,
)
file_errors = checker.check_all()

print(f"Found {file_errors} errors")
```

`StyleGuide` is the right entry point when you want to check several paths, reuse configuration, or embed the tool in test or CI code. `Checker` is the lower-level single-file API.

## Use In Tests

The maintainer docs show `pycodestyle` embedded in `unittest`:

```python
import unittest

import pycodestyle


class TestCodeFormat(unittest.TestCase):
    def test_conformance(self) -> None:
        style = pycodestyle.StyleGuide(quiet=True)
        result = style.check_files(["src", "tests"])
        self.assertEqual(
            result.total_errors,
            0,
            "Found code style errors (and warnings).",
        )
```

## Important Pitfalls

- `--ignore` overrides the built-in ignore defaults instead of adding to them. If you pass `--ignore`, include every code you still want ignored.
- `# noqa` can disable checks for a line, but the docs recommend reserving it for special cases.
- `max-line-length` defaults to `79`. `max-doc-length` is different: doc/comment line length checking is off unless you set it.
- `pycodestyle` does not cover naming conventions, docstring conventions, or automatic fixing. The docs point to `flake8` with extensions, `pydocstyle`, and separate fixers for those jobs.
- Project configuration is discovered from the checked path upward. If you pass `--config=path`, only that config file is used.
- `pycodestyle` is intentionally lightweight and has no external runtime dependencies, so broader lint stacks often wrap it rather than extending it directly.
