---
name: package
description: "Ruff package guide for Python projects using the official Ruff docs"
metadata:
  languages: "python"
  versions: "0.15.15"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "ruff,python,linter,formatter,quality,pre-commit"
---

# Ruff Python Package Guide

## Golden Rule

Use `ruff` as a project tool, not as a runtime library. Put configuration in `pyproject.toml` unless you have a strong reason to keep a separate `ruff.toml`, run `ruff check` before `ruff format`, and keep the enabled rule set explicit instead of turning on every rule at once.

## Install

Pin the version your project expects:

```bash
python -m pip install "ruff==0.15.15"
```

Common alternatives:

```bash
uv add --dev "ruff==0.15.15"
poetry add --group dev "ruff==0.15.15"
```

Tool-only install:

```bash
uv tool install "ruff==0.15.15"
pipx install "ruff==0.15.15"
```

Confirm the binary:

```bash
ruff --version
```

## Initialize And Configure

Ruff reads configuration from the closest supported config file. Prefer `pyproject.toml` with a `[tool.ruff]` table so the project config stays in one place.

Minimal starting point:

```toml
[tool.ruff]
line-length = 100
target-version = "py311"

[tool.ruff.lint]
select = ["E", "F", "I", "UP"]

[tool.ruff.format]
quote-style = "double"
indent-style = "space"
```

Useful setup command:

```bash
ruff config
```

That prints the available configuration keys for the installed version.

## Core Workflow

### Lint the repository

```bash
ruff check .
```

### Apply safe auto-fixes

```bash
ruff check . --fix
```

Ruff distinguishes between safe fixes and unsafe fixes. Keep unsafe fixes opt-in:

```bash
ruff check . --fix --unsafe-fixes
```

### Format code

```bash
ruff format .
```

### Recommended CI order

```bash
ruff check . --fix
ruff format .
```

If you rely on import sorting, keep `I` enabled in lint rules. The formatter does not replace lint-driven import organization.

### Inspect a specific rule

```bash
ruff rule F401
ruff rule B008
```

This is the fastest way to verify what a rule means before changing code to satisfy it.

## Editor And Automation Setup

### VS Code and LSP-style editor integration

Prefer Ruff's built-in language server support over `ruff-lsp`. The official docs describe the native server as the direct replacement, and it has been stable since the `0.5.x` line.

Common editor flow:

1. Install the `ruff` binary in the environment your editor can see.
2. Enable Ruff linting and formatting in the editor extension.
3. Disable `ruff-lsp` if it is still installed, to avoid duplicate diagnostics.

### pre-commit

Use the official `ruff-pre-commit` hooks:

```yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.15.15
    hooks:
      - id: ruff-check
        args: [--fix]
      - id: ruff-format
```

Keep the hook revision aligned with the package version you expect in CI and local development.

## Configuration Notes

- Supported config file names are `pyproject.toml`, `ruff.toml`, and `.ruff.toml`.
- Ruff uses the closest config file for each analyzed file. Config files are not implicitly merged across directories. If you need inheritance, use the `extend` setting.
- When Ruff can read a `requires-python` declaration from `pyproject.toml`, it can infer a default `target-version`, but setting `target-version` explicitly is safer for generated code and mixed-tooling repos.
- By default Ruff respects `.gitignore`, `.git/info/exclude`, and global gitignore files.
- There is no authentication model. Ruff is a local tool; the important setup surface is config files, editor wiring, and CI hooks.

## Common Pitfalls

- Do not `import ruff` in application code. For most projects Ruff is only a CLI tool in the dev toolchain.
- Do not enable `select = ["ALL"]` unless you intend to review rule churn on upgrades. New Ruff releases can add rules, which changes lint output.
- `ruff check --fix` does not imply formatting. Run `ruff format` separately.
- Passing files directly on the command line can bypass exclusions you expected from config. Use `force-exclude = true` if you need excludes to apply consistently in scripted calls.
- Notebook files can be linted and formatted too. If the repo contains `.ipynb` files and that is not intended, exclude them explicitly.
- If a subdirectory has its own config file, Ruff uses that nearest config instead of the repo-root config. This surprises agents in monorepos.
- Unsafe fixes can change behavior. Treat `--unsafe-fixes` as a deliberate review step, not the default path.

## Version-Sensitive Notes For 0.15.15

- Ruff uses a documented custom versioning scheme rather than strict SemVer. Minor releases can include breaking changes, so moving from `0.15.x` to `0.16.x` should be reviewed like a meaningful upgrade. Patch-level upgrades within `0.15.x` still occasionally add or extend rules.
- The built-in language server is the current path; older `ruff-lsp` guidance is stale for modern setups.
- If you copy snippets from older blog posts, verify section names against the current config reference. Modern Ruff config is split across `[tool.ruff]`, `[tool.ruff.lint]`, and `[tool.ruff.format]`.
- Several preview rules have been added across the `0.15.x` patch line, including `RUF050` (unnecessary-if), `RUF072` (useless-finally), `RUF073` (f-string-percent-format), `RUF074` (incorrect-decorator-order), `RUF075` (fallible-context-manager), Airflow rules `AIR201`, `AIR202`, and `AIR004`, and the pylint rule `W0717` (too-many-try-statements). These are preview-gated; enabling `preview = true` is required to see them.
- `F811` now reports duplicate imports inside `TYPE_CHECKING` blocks, and `F821` handling of bare annotations follows PEP 526 more closely. Suites that previously suppressed these will see new diagnostics.
- The formatter gained a `nested-string-quote-style` option and improved handling of lambdas and nested f-strings on supported Python versions.
- Logical-line suppression comments `#ruff:file-ignore` and `#ruff:ignore` are now supported alongside the existing `# noqa` syntax.
- The maximum allowed `line-length` value has been increased, which only matters for projects that were previously hitting the cap.

## Official Sources

- Ruff docs: https://docs.astral.sh/ruff/
- Configuration: https://docs.astral.sh/ruff/configuration/
- Linter: https://docs.astral.sh/ruff/linter/
- Formatter: https://docs.astral.sh/ruff/formatter/
- Editors: https://docs.astral.sh/ruff/editors/setup/
- Versioning: https://docs.astral.sh/ruff/versioning/
- PyPI: https://pypi.org/project/ruff/
- Official pre-commit hooks: https://github.com/astral-sh/ruff-pre-commit
