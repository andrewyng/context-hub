---
name: package
description: "pytest package guide for Python with practical setup, fixtures, parametrization, plugin, and 9.0.x notes"
metadata:
  languages: "python"
  versions: "9.0.3"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "pytest,testing,python,fixtures,assertions,plugins"
---

# pytest Python Package Guide

## What It Is

`pytest` is the standard Python test runner for unit, integration, and plugin-driven test suites. It is designed around plain `assert` statements, fixture injection, powerful test selection, and a large plugin ecosystem.

Use it when a Python project needs:

- normal `test_*.py` / `*_test.py` discovery
- concise assertions with good failure output
- reusable setup via fixtures
- parametrized tests
- plugin-based behaviors like coverage, async support, or parallel execution

## Install

Install `pytest` into the project environment and pin it if the test suite depends on 9.0 behavior:

```bash
python -m pip install "pytest==9.0.3"
```

Common alternatives:

```bash
uv add --dev "pytest==9.0.3"
poetry add --group dev "pytest==9.0.3"
```

If you are authoring a package, also install your package in editable mode so tests exercise the local code cleanly:

```bash
python -m pip install -e .
```

## Write And Run A First Test

Create `tests/test_sample.py`:

```python
def inc(x: int) -> int:
    return x + 1

def test_inc() -> None:
    assert inc(3) == 4
```

Run the suite:

```bash
pytest
```

Useful variants:

```bash
pytest -q
pytest -x --maxfail=1
pytest --pdb
pytest --durations=10
```

`pytest` discovers tests from configured `testpaths` or the current directory, then recurses into directories looking for `test_*.py` and `*_test.py`.

## Recommended Layout And Config

For new projects, the upstream docs recommend a `src/` layout plus `--import-mode=importlib`.

Typical layout:

```text
pyproject.toml
src/
  mypkg/
    __init__.py
tests/
  test_api.py
  conftest.py
```

Native TOML config was added in `pytest 9.0`. Prefer `[tool.pytest]` in `pyproject.toml` for new work:

```toml
[tool.pytest]
minversion = "9.0"
addopts = ["-ra", "--import-mode=importlib"]
testpaths = ["tests"]
markers = ["slow", "integration"]
strict = true
```

Notes:

- `strict = true` enables `strict_config`, `strict_markers`, `strict_parametrization_ids`, and `strict_xfail`.
- Use strict mode only when the project pins or locks the pytest version, because future strictness options may be added.
- If you register custom markers, keep them in config so `--strict-markers` or strict mode does not break the suite.
- `pytest.toml` and `.pytest.toml` now exist and take precedence over other config files, even when empty.
- If you use `[tool.pytest]`, do not also use `[tool.pytest.ini_options]` in the same `pyproject.toml`.
- Pytest does not merge multiple config files. The first matching config file wins.

If you use `src/` but do not install the package in editable mode, either run with `PYTHONPATH=src pytest` or set:

```toml
[tool.pytest]
pythonpath = ["src"]
```

If you keep application code at the repository root instead of `src/`, `python -m pytest` can help because it also adds the current directory to `sys.path`.

## Core Usage Patterns

### Assertions And Exceptions

Use plain `assert` statements. Pytest rewrites them to provide useful failure output.

```python
import pytest

def normalize(name: str) -> str:
    if not name:
        raise ValueError("name must not be empty")
    return name.strip().lower()

def test_normalize() -> None:
    assert normalize("  Ada  ") == "ada"

def test_normalize_rejects_empty() -> None:
    with pytest.raises(ValueError, match="must not be empty"):
        normalize("")
```

Use `pytest.raises()` for exceptions your code intentionally raises. Use `xfail(raises=...)` only when documenting a known bug or dependency issue.

### Fixtures

Fixtures provide dependency injection for setup and teardown. Put shared fixtures in `tests/conftest.py`.

```python
import pytest

@pytest.fixture(scope="session")
def base_url() -> str:
    return "https://api.example.test"

@pytest.fixture
def auth_headers(monkeypatch: pytest.MonkeyPatch) -> dict[str, str]:
    monkeypatch.setenv("API_TOKEN", "test-token")
    return {"Authorization": "Bearer test-token"}
```

Use fixture scopes deliberately:

- function scope for isolated mutable state
- session scope for expensive shared setup
- `yield` fixtures for teardown after the test finishes
- `autouse=True` only for behavior that truly applies to every test in the scope

Example `yield` fixture:

```python
import sqlite3

import pytest

@pytest.fixture
def db_conn(tmp_path):
    db_path = tmp_path / "app.db"
    conn = sqlite3.connect(db_path)
    yield conn
    conn.close()
```

### Parametrization

Use `@pytest.mark.parametrize` to cover input matrices without copy-pasting tests.

```python
import pytest

@pytest.mark.parametrize(
    ("raw", "expected"),
    [
        ("Ada", "ada"),
        ("  Grace  ", "grace"),
        pytest.param("", None, marks=pytest.mark.xfail),
    ],
)
def test_normalize_cases(raw: str, expected: str | None) -> None:
    if expected is None:
        pytest.xfail("empty names are rejected")
    assert raw.strip().lower() == expected
```

When strict mode is enabled, duplicate generated parameter IDs become errors. Add explicit `ids=[...]` when parametrization labels must stay stable.

### Useful Built-In Fixtures

`tmp_path` gives each test an isolated temporary directory as a `pathlib.Path`:

```python
def test_writes_file(tmp_path) -> None:
    output = tmp_path / "out.txt"
    output.write_text("ok", encoding="utf-8")
    assert output.read_text(encoding="utf-8") == "ok"
```

Prefer `tmp_path` and `tmp_path_factory` over legacy `tmpdir` / `tmpdir_factory`.

`monkeypatch` is the standard way to patch environment variables, module attributes, working directory, or `sys.path` during a test:

```python
from pathlib import Path

def test_home_dir(monkeypatch) -> None:
    monkeypatch.setattr(Path, "home", lambda: Path("/tmp/test-home"))
    assert str(Path.home()) == "/tmp/test-home"
```

`caplog` lets you assert on logs:

```python
import logging

def test_logs(caplog) -> None:
    logging.getLogger().info("boot complete")
    assert ("root", logging.INFO, "boot complete") in caplog.record_tuples
```

## Running And Selecting Tests

Common selectors:

```bash
pytest tests/test_api.py
pytest tests/test_api.py::test_create_user
pytest tests/test_api.py::TestUsers::test_create_user
pytest -k "create_user and not slow"
pytest -m "not integration"
pytest --pyargs mypkg
pytest --fixtures -q
pytest -h
```

Key behavior:

- `-k` filters by names and extra keywords.
- `-m` filters by marker expressions.
- `--pyargs mypkg` is useful when tests live inside the installed package.
- `python -m pytest` behaves almost the same as `pytest`, but also adds the current directory to `sys.path`.

## Plugins, Async Tests, And Startup Control

Pytest has a large plugin ecosystem, but plugin loading can surprise you in CI or editor-integrated runs.

Important controls:

- `required_plugins` can force required plugins to be present before the suite runs.
- `PYTEST_DISABLE_PLUGIN_AUTOLOAD=1` disables auto-loading third-party plugins from the environment.
- `pytest -p plugin_name` loads a plugin explicitly.
- `pytest -p no:plugin_name` disables a plugin explicitly.

Async tests are version-sensitive:

- Since `8.4`, `async def` tests fail instead of warning-and-skipping when no suitable async plugin is installed.
- For asyncio tests, install and configure something like `pytest-asyncio`.
- Keep async fixtures and async test plugins aligned; mismatches are a common source of collection or fixture setup errors.

## Common Pitfalls

- Do not mix `[tool.pytest]` and `[tool.pytest.ini_options]` in the same `pyproject.toml`.
- Do not assume multiple config files merge. A stray empty `pytest.toml` or `pytest.ini` can silently override the config you expected.
- If tests import local package code incorrectly, check layout first: `src/` layout, editable install, `pythonpath`, and `--import-mode=importlib` usually fix the problem cleanly.
- Keep shared fixtures in `conftest.py`, but avoid turning it into a grab bag of hidden global state.
- Register custom markers in config before enabling strict markers or strict mode.
- Prefer `tmp_path` over legacy `tmpdir`.
- Use `pytest.raises(..., match=...)` for your own exception contracts instead of broad `except` blocks inside tests.
- `pytest.main()` is fine for one-off invocation from Python code, but repeated calls in the same process are not recommended because Python import caching means file changes will not be reflected between runs.
- Plugin autoload can make local runs differ from CI. Disable autoload or require explicit plugins when reproducibility matters.

## Version-Sensitive Notes For 9.0.x

- `pytest 9.0` added native TOML configuration with `[tool.pytest]`, plus `pytest.toml` / `.pytest.toml`.
- `pytest 9.0` added `strict = true` as a bundled strict-mode switch.
- `strict_xfail` is the 9.0 name; `xfail_strict` is still accepted as an alias.
- `pytest 9.0.3` is the latest PyPI release as of May 29, 2026.
- `pytest 9.0.2` changed the terminal progress plugin defaults on non-Windows platforms. If your local output changed after upgrading, check terminal progress settings and related plugins before assuming collection is broken.
- `pytest 9.0.3` is a bug-fix release. Notable changes: `pytest.approx()` now respects `Mapping` key order during comparisons, attempting to disable a `conftest.py` with `-p no:` now raises a clear error rather than failing internally, exception groups raised in tests with `__tracebackhide__ = True` no longer crash the reporter, non-string messages from `unittest.TestCase.subTest()` are now displayed, and an insecure temporary directory issue (CVE-2025-71176) was fixed.

## Official Sources

- Docs root: `https://docs.pytest.org/en/stable/`
- API reference: `https://docs.pytest.org/en/stable/reference/reference.html`
- Configuration reference: `https://docs.pytest.org/en/stable/reference/customize.html`
- Good practices: `https://docs.pytest.org/en/stable/explanation/goodpractices.html`
- Invocation guide: `https://docs.pytest.org/en/stable/how-to/usage.html`
- Changelog: `https://docs.pytest.org/en/stable/changelog.html`
- PyPI: `https://pypi.org/project/pytest/`
