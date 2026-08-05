---
name: package
description: "Poetry package guide for Python dependency management, virtual environments, packaging, and publishing"
metadata:
  languages: "python"
  versions: "2.4.1"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "poetry,python,packaging,dependencies,virtualenv,pyproject,publishing"
---

# Poetry Python Package Guide

## Golden Rule

Use Poetry as the project tool that owns `pyproject.toml`, the lock file, and the virtual environment workflow. For Poetry `2.4.1`, prefer the modern `[project]` section for your main package metadata and runtime dependencies, use `poetry sync` when you need the environment to exactly match `poetry.lock`, and keep Poetry-specific settings under `[tool.poetry]`.

Do not add `poetry` as an application dependency with `poetry add poetry`. Install the CLI separately, then use it to manage your project.

## Install Poetry

The most practical installation for local development is `pipx` so Poetry stays isolated from the project it manages:

```bash
pipx install "poetry==2.4.1"
poetry --version
```

Official installer alternative:

```bash
curl -sSL https://install.python-poetry.org | POETRY_VERSION=2.4.1 python3 -
poetry --version
```

If you upgrade later:

```bash
pipx upgrade poetry
```

## Initialize And Configure A Project

### Create a new package project

`poetry new` scaffolds a package-ready project:

```bash
poetry new my-package
cd my-package
poetry install
```

Use `--flat` if you do not want the default `src/` layout:

```bash
poetry new --flat my-package
```

### Adopt Poetry in an existing project

```bash
cd existing-project
poetry init
poetry install
```

### Application-style projects

If the project is an app and you do not plan to build or publish it as a package, disable package mode:

```toml
[project]
name = "demo-app"
version = "0.1.0"
requires-python = ">=3.10"
dependencies = [
  "httpx>=0.28,<1.0",
]

[tool.poetry]
package-mode = false

[tool.poetry.group.dev.dependencies]
pytest = "^8.0"
ruff = "^0.11.0"
```

Notes:

- In Poetry 2.x, the docs recommend using `[project]` for the main project metadata and runtime dependencies.
- Dependency groups, private sources, and Poetry-only behavior still live under `[tool.poetry...]`.
- Only main dependencies belong in `[project.dependencies]`; grouped dependencies stay under `[tool.poetry.group.<name>.dependencies]`.

## Core Workflow

### Choose the Python interpreter

Point Poetry at the interpreter you want before installing dependencies:

```bash
poetry env use 3.12
```

Or use an explicit path:

```bash
poetry env use /full/path/to/python
```

Check the current environment:

```bash
poetry env info
poetry env list
```

### Keep the virtual environment inside the project

For agent-driven work, a project-local `.venv` is usually the least ambiguous setup:

```bash
poetry config virtualenvs.in-project true --local
poetry install
```

This writes project-local Poetry settings to `poetry.toml`, not to `pyproject.toml`.

### Install vs sync

Use `install` when bootstrapping, and `sync` when you need the environment to exactly match the lock file:

```bash
poetry install
poetry sync
```

Common variants:

```bash
poetry install --with dev
poetry sync --with dev,docs
poetry install --only main
```

Rule of thumb:

- `poetry install` installs what the project needs but does not aggressively clean extras already present in the environment.
- `poetry sync` reconciles the environment to the lock file and removes packages that should no longer be there.

### Add, update, and remove dependencies

```bash
poetry add requests
poetry add pytest --group dev
poetry add mkdocs --group docs
poetry remove requests
```

After dependency edits, Poetry updates `poetry.lock` automatically.

Use these when you need to inspect or change resolution state directly:

```bash
poetry show --tree
poetry lock
poetry update
poetry update requests
```

### Run commands inside the managed environment

`poetry run` is the most automation-friendly choice:

```bash
poetry run python -V
poetry run pytest
poetry run ruff check .
```

If you need shell activation text for interactive work:

```bash
poetry env activate
```

### Validate and build

```bash
poetry check
poetry build
```

`poetry check` catches invalid `pyproject.toml` configuration before you waste time debugging installs or publishes.

## Private Indexes, Publishing, And Auth

### Add a package source for installs

```bash
poetry source add --priority=explicit internal-pypi https://packages.example.com/simple/
```

Then add a dependency from that source:

```bash
poetry add --source internal-pypi acme-lib
```

For private-source workflows, be explicit about which packages come from which source. This reduces dependency-confusion risk and matches Poetry's source model.

### Store project-local repository config

```bash
poetry config repositories.internal-pub https://packages.example.com/legacy/ --local
```

### Configure credentials

Basic auth:

```bash
poetry config http-basic.internal-pub username password
```

PyPI token:

```bash
poetry config pypi-token.pypi pypi-AgEIcHlwaS5vcmc...
```

Environment-variable alternatives are better for CI:

```bash
export POETRY_HTTP_BASIC_INTERNAL_PUB_USERNAME="username"
export POETRY_HTTP_BASIC_INTERNAL_PUB_PASSWORD="password"
export POETRY_PYPI_TOKEN_PYPI="pypi-AgEIcHlwaS5vcmc..."
```

If keyring integration causes trouble in CI or containers:

```bash
poetry config keyring.enabled false --local
```

### Publish a built package

```bash
poetry publish --build
```

For a named repository:

```bash
poetry publish --build --repository internal-pub
```

## Common Pitfalls

- Do not install Poetry into the same environment it is managing unless you have a deliberate reason. `pipx` is the clean default.
- Do not assume `poetry install` cleans stale packages. Use `poetry sync` for reproducible CI or agent workflows.
- If you switch Python versions outside Poetry, rerun `poetry env use ...` so the environment and lock constraints stay aligned.
- If your project is an application rather than a distributable package, set `package-mode = false` or Poetry will expect package metadata and build-oriented behavior.
- In Poetry 2.x, main dependencies belong in `[project.dependencies]`. Dependency groups still belong in `[tool.poetry.group.*.dependencies]`; mixing those up is a common source of broken `pyproject.toml` files.
- Private package sources are Poetry-specific configuration. Keep source definitions and grouped dependencies under `[tool.poetry]`, not in `[project]`.
- `poetry env activate` prints shell-specific activation code. For scripts, CI, and agents, `poetry run ...` is usually more reliable.
- `poetry check` should be part of the edit loop whenever an agent writes `pyproject.toml`.

## Version-Sensitive Notes For 2.4.1

- PyPI lists `2.4.1` as the current Poetry release. The version used here matches live upstream as of May 29, 2026.
- Poetry `2.4.x` requires Python `>=3.10,<4.0`. Some older docs snippets still mention Python 3.9, but the `2.4.0` release history and PyPI metadata are the authoritative signals for this series.
- Poetry 2.x prefers `[project]` metadata and runtime dependencies. Older blog posts often use only `[tool.poetry.dependencies]`; that is no longer the best default for new work.
- The CLI docs mark `export` as provided by the Export Poetry Plugin, and Poetry no longer depends on `poetry-plugin-export` by default. If `poetry export` is missing, install the plugin explicitly:

```bash
poetry self add poetry-plugin-export
```

- Poetry `2.4.0` made `installer.re-resolve = false` the default. If you compare behavior with much older Poetry examples, dependency resolution details may not match exactly.
- Poetry `2.4.0` added a `solver.min-release-age` setting, which lets the solver filter out package releases that are newer than the configured age during resolution. Per-package and per-index exclusions are supported, which is useful when you want to avoid brand-new releases without fully pinning versions.
- Poetry `2.4.0` made `poetry update <package>` raise an error when the argument is not a declared dependency, instead of silently ignoring it. `poetry update <package>` can also operate on transitive dependencies; `2.4.1` fixed a regression in that path. If you previously relied on the silent no-op, expect a hard error now.
- Poetry `2.4.0` normalizes dependency group names. If you used inconsistent casing, the normalized form is what now appears in resolution and lock output.
- Poetry `2.4.0` added support for build constraints on dependencies, dynamic version determination via the build-backend for published artifacts, and editable installs of project plugins. PEP 735 dependency groups now contribute to the lock file hash.
- Poetry `2.4.1` is a bug-fix release: it resolves a performance regression in the wheel installer and relaxes the `installer` lower bound so `installer==0.7.0` is acceptable again.

## Official Source URLs

- Docs root: `https://python-poetry.org/docs/`
- Dependency specification: `https://python-poetry.org/docs/dependency-specification/`
- Configuration: `https://python-poetry.org/docs/configuration/`
- Repositories: `https://python-poetry.org/docs/repositories/`
- Managing environments: `https://python-poetry.org/docs/managing-environments/`
- `pyproject.toml` reference: `https://python-poetry.org/docs/pyproject/`
- CLI reference: `https://python-poetry.org/docs/cli/`
- Release history: `https://python-poetry.org/history/`
- PyPI project page: `https://pypi.org/project/poetry/`
