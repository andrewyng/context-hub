---
name: package
description: "Click package guide for Python CLI applications and command groups"
metadata:
  languages: "python"
  versions: "8.4.1"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "click,python,cli,command-line,pallets"
---

# Click Python Package Guide

## Golden Rule

**Build Click CLIs as installable packages with entry points, not as ad hoc `python script.py` commands.**

Click's own docs recommend packaging commands with `pyproject.toml` entry points so installers create the executable correctly across Linux, macOS, and Windows.

## Installation

```bash
pip install click==8.4.1
```

For a new project, prefer declaring it in `pyproject.toml`:

```toml
[project]
name = "my-cli"
version = "0.1.0"
requires-python = ">=3.10"
dependencies = [
  "click==8.4.1",
]

[project.scripts]
my-cli = "my_cli.main:cli"
```

## Minimal Setup

`src/my_cli/main.py`

```python
import click

@click.command()
@click.argument("name")
@click.option("--count", default=1, show_default=True, type=int)
def cli(name: str, count: int) -> None:
    for _ in range(count):
        click.echo(f"Hello, {name}!")

if __name__ == "__main__":
    cli()
```

Development install:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .
my-cli World --count 2
```

Use `click.echo()` instead of `print()` when you want Click's terminal handling, Unicode robustness, and automatic stripping of ANSI styles when output is redirected.

## Core Usage Patterns

### Commands and groups

Use `@click.command()` for a single command and `@click.group()` when you need subcommands.

```python
import click

@click.group()
@click.option("--debug/--no-debug", default=False)
@click.pass_context
def cli(ctx: click.Context, debug: bool) -> None:
    ctx.ensure_object(dict)
    ctx.obj["debug"] = debug

@cli.command()
@click.argument("path")
@click.pass_context
def sync(ctx: click.Context, path: str) -> None:
    if ctx.obj["debug"]:
        click.echo(f"debug: syncing {path}")
    click.echo(f"synced {path}")
```

Useful group behaviors:

- Group options belong to the group, not to child commands. Write `tool --debug sync`, not `tool sync --debug`.
- `invoke_without_command=True` lets the group callback run even when no subcommand is chosen.
- Split large CLIs across modules and register subcommands later with `group.add_command(...)`.

### Options and arguments

Common decorators:

- `@click.argument("name")` for positional input.
- `@click.option("--count", default=1, type=int)` for named options.
- `@click.option("--flag/--no-flag", default=False)` for explicit boolean toggles.
- `multiple=True` returns a tuple. Do not use a string default there; it will be treated as a list of characters.
- `nargs=2` (or any fixed `int`) collects a fixed number of values into a tuple, for example `@click.option("--pos", nargs=2, type=int)`.
- `nargs=-1` on a `@click.argument(...)` accepts a variable number of trailing positional values.

If you use `flag_value`, prefer an explicit default value instead of `default=True` so the callback receives the exact value you expect.

### Parameter types

Use Click's built-in `ParamType` classes for parsing and validation:

- `click.INT`, `click.FLOAT`, `click.BOOL`, `click.STRING` for primitives.
- `click.Choice(["json", "text", "yaml"], case_sensitive=False)` for restricted values.
- `click.IntRange(0, 100, clamp=True)` and `click.FloatRange(...)` for ranges.
- `click.Path(exists=True, file_okay=True, dir_okay=False, readable=True)` for filesystem paths.
- `click.File("r", encoding="utf-8")` to open a file (use `-` for stdin or stdout).
- `click.DateTime(formats=["%Y-%m-%d"])` for parsed timestamps.
- `click.UUID` for UUID strings.

```python
import click

@click.command()
@click.option("--mode", type=click.Choice(["fast", "safe"]), default="safe")
@click.option("--log", type=click.File("w", encoding="utf-8"))
@click.argument("paths", nargs=-1, type=click.Path(exists=True))
def cli(mode: str, log, paths: tuple[str, ...]) -> None:
    click.echo(f"{mode} {len(paths)} paths", file=log)
```

### Config and secrets

Click does not have its own auth layer. For CLIs that call APIs or read local config, model configuration through options, environment variables, prompts, and context state.

Per-option environment variables:

```python
import click

@click.command()
@click.option("--token", envvar="APP_TOKEN", hide_input=True)
def cli(token: str) -> None:
    click.echo("token loaded")
```

Automatic env var prefixes for all options:

```python
@click.group(context_settings={"auto_envvar_prefix": "APP"})
@click.option("--region")
def cli(region: str) -> None:
    ...
```

With subcommands, Click expands the name, so an option like `--host` on subcommand `run-server` becomes `APP_RUN_SERVER_HOST`.

### Prompts and confirmation

Use prompts when a value can come from the CLI but should fall back to interactive input:

```python
@click.command()
@click.option("--username", prompt=True)
@click.option("--password", prompt=True, hide_input=True, confirmation_prompt=True)
def cli(username: str, password: str) -> None:
    click.echo(f"hello {username}")
```

Useful prompt helpers:

- `prompt=True` or `prompt="Custom label"` on options.
- `hide_input=True` for secret values; pair with `confirmation_prompt=True` when setting a new secret.
- `click.prompt("Value", type=int, default=10)` for manual prompting.
- `click.confirm("Continue?", abort=True)` for destructive actions; `abort=True` raises `click.Abort` on no.

Avoid combining `prompt` with `multiple=True`; the docs recommend prompting manually inside the function instead.

### Shared state and complex CLIs

For multi-command apps, store application state on `ctx.obj` and pass it down with `@click.pass_context` or `@click.pass_obj`. This is the standard pattern for carrying config, clients, or loaded project state through nested commands.

If startup is expensive, a custom `click.Group` can lazy-load subcommands. That keeps import cost lower, but the docs recommend backing it with tests because help rendering and shell completion can still trigger loads.

### Testing

Use `click.testing.CliRunner` for command tests:

```python
from click.testing import CliRunner

from my_cli.main import cli

def test_hello() -> None:
    runner = CliRunner()
    result = runner.invoke(cli, ["World"])
    assert result.exit_code == 0
    assert "Hello, World!" in result.output
```

`CliRunner` is for tests only. Click's docs explicitly warn that it mutates interpreter state and is not thread-safe.

### Errors and exit codes

If your code raises `click.ClickException`, Click formats the message and exits with the exception's exit code. `click.confirm(..., abort=True)` and Ctrl-C style abort flows exit with code `1`. Successful runs exit with `0`.

## Shell Completion

Shell completion works best when the command is installed through an entry point. The docs are explicit that completion is not available when users invoke the program through `python some_script.py`.

If you need custom completion for a parameter type, implement `shell_complete()` on a custom `click.ParamType`.

## Common Pitfalls

- Package your CLI with `project.scripts`. This is the path Click documents for Windows wrappers, virtualenv-friendly executables, and shell completion.
- Use `click.echo()` for user-facing output unless you intentionally want raw `print()`.
- Group-level flags must appear before the subcommand name.
- `click.get_current_context()` only works in the current thread; if you pass context into another thread, treat it as read-only.
- `CliRunner` is not safe for production code or concurrent runtime use.
- For `multiple=True`, defaults must be a list or tuple, not a string.
- For env-driven boolean flags, only the configured `envvar` is recognized. A paired option like `--flag/--no-flag` does not create a separate `NO_FLAG` environment variable automatically.

## Version-Sensitive Notes For 8.4.1

- `8.4.1` is the current PyPI release as of 2026-05-29, published 2026-05-22 as a patch over `8.4.0` (2026-05-17). The `8.3.x` line ended at `8.3.3` on 2026-04-22.
- Click `8.2.0` dropped Python `3.7`, `3.8`, and `3.9`. The `8.4.x` line continues to require `Python >=3.10`.
- Click `8.2.0` deprecated `click.__version__`; use `importlib.metadata.version("click")` or feature detection instead.
- Click `8.2.0` deprecated the old parser internals (`click.parser`, `OptionParser`, related parser hooks). Avoid new code that depends on them.
- Click `8.3.0` changed flag handling so `default` is preserved as-is. If your CLI depends on `flag_value` behavior, test boolean and enum-like flags explicitly when upgrading from `8.1.x` or early `8.2.x`.
- When upgrading from `8.3.x` to `8.4.x`, re-test prompt flows, parameter callbacks, and help formatting; minor behavior changes have shipped across the `8.3.x` and `8.4.x` patch releases.

## Official Sources

- Docs: https://click.palletsprojects.com/en/stable/
- Quickstart: https://click.palletsprojects.com/en/stable/quickstart/
- Packaging entry points: https://click.palletsprojects.com/en/stable/entry-points/
- Commands and context: https://click.palletsprojects.com/en/stable/commands-and-groups/
- Options: https://click.palletsprojects.com/en/stable/options/
- Prompts: https://click.palletsprojects.com/en/stable/prompts/
- Testing: https://click.palletsprojects.com/en/stable/testing/
- Exceptions and exit codes: https://click.palletsprojects.com/en/stable/exceptions/
- Shell completion: https://click.palletsprojects.com/en/stable/shell-completion/
- Changelog: https://click.palletsprojects.com/en/stable/changes/
- PyPI: https://pypi.org/project/click/
