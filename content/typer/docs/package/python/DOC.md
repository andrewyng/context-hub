---
name: package
description: "Typer package guide for Python CLIs with commands, options, packaging, testing, and 0.26.3 notes"
metadata:
  languages: "python"
  versions: "0.26.3"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "typer,python,cli,click,terminal,developer-tools"
---

# Typer Python Package Guide

## When To Use Typer

Use `typer` when you want a Python CLI with:

- type-hint driven arguments and options
- good help output without hand-writing `argparse` boilerplate
- subcommands and shared global options
- shell completion and prompt/confirm helpers
- direct interoperability with Click's runtime model

`typer` is built on Click. Reach for it when the CLI should feel like a normal Python program first, with types and functions driving the interface.

## Install

Pin the version if the project is already standardized on it:

```bash
python -m pip install "typer==0.26.3"
```

Common alternatives:

```bash
uv add "typer==0.26.3"
poetry add "typer==0.26.3"
```

Version-sensitive install note:

- `0.24.0` dropped Python 3.9 support.
- `0.24.1` was the first release to drop the `typer-slim` and `typer-cli` distributions; use the main `typer` package only.
- `0.26.x` continues to require Python 3.10 or newer.

## Fast Start

For a single-command CLI, `typer.run()` is the shortest path:

```python
from typing import Annotated

import typer

def main(
    name: Annotated[str, typer.Argument(help="Who to greet")],
    formal: Annotated[bool, typer.Option("--formal", help="Use a formal greeting")] = False,
) -> None:
    if formal:
        print(f"Hello, {name}.")
    else:
        print(f"Hi, {name}!")

if __name__ == "__main__":
    typer.run(main)
```

Run it:

```bash
python main.py Alice
python main.py Alice --formal
python main.py --help
```

Typer derives the CLI from the function signature:

- required parameters become arguments by default
- defaulted parameters become options by default
- `bool` options become flag-style switches

## Build A Multi-Command App

Use `typer.Typer()` when the CLI needs subcommands, callbacks, or shared state. Each function decorated with `@app.command()` becomes a subcommand, and the function signature drives the parsed arguments and options:

```python
from pathlib import Path
from typing import Annotated

import typer

app = typer.Typer(no_args_is_help=True)

@app.command()
def greet(
    name: Annotated[str, typer.Argument(help="Person to greet")],
    times: Annotated[int, typer.Option("--times", min=1)] = 1,
) -> None:
    for _ in range(times):
        typer.echo(f"Hello {name}")

@app.command()
def init(
    config: Annotated[Path, typer.Option("--config", help="Config file path")],
) -> None:
    config.parent.mkdir(parents=True, exist_ok=True)
    config.write_text("debug = false\n", encoding="utf-8")
    typer.echo(f"Created {config}")

if __name__ == "__main__":
    app()
```

Run it:

```bash
python app.py greet Ada --times 2
python app.py init --config ~/.config/myapp/config.toml
```

Useful app-level settings:

- `no_args_is_help=True` makes an empty invocation print help instead of silently exiting
- `add_completion=False` disables completion management commands when you do not want them
- callbacks are the right place for global options that should run before subcommands

### Nested subcommands

Compose larger CLIs by mounting a `Typer()` as a subgroup of another with `add_typer`:

```python
import typer

app = typer.Typer()
users_app = typer.Typer(help="Manage users")
app.add_typer(users_app, name="users")

@users_app.command("list")
def list_users() -> None:
    typer.echo("user1, user2")

@users_app.command("create")
def create_user(name: str) -> None:
    typer.echo(f"created {name}")

if __name__ == "__main__":
    app()
```

That yields `myapp users list` and `myapp users create alice`. Subgroups can have their own `@users_app.callback()` for shared per-group setup.

### Enum choices

Use a `str`-backed `enum.Enum` to expose a fixed set of choices. Typer renders the choices in help and validates the value automatically:

```python
from enum import Enum
from typing import Annotated

import typer

class Output(str, Enum):
    json = "json"
    text = "text"
    yaml = "yaml"

app = typer.Typer()

@app.command()
def report(
    fmt: Annotated[Output, typer.Option("--format", "-f")] = Output.text,
) -> None:
    typer.echo(f"format={fmt.value}")
```

## Preferred Parameter Style

Use `typing.Annotated` with `typer.Argument(...)` and `typer.Option(...)` for new code:

```python
from typing import Annotated

import typer

def main(
    user_id: Annotated[int, typer.Argument(help="Numeric user id")],
    output: Annotated[str, typer.Option("--output", "-o")] = "text",
) -> None:
    typer.echo(f"{user_id=} {output=}")
```

That keeps the Python type separate from CLI metadata and matches the current docs and examples.

## Configuration And Environment

Typer does not have authentication features of its own. For CLI projects, "config" usually means:

- command-line options and arguments
- environment-backed defaults
- app-specific config files stored in a standard user directory

### Use environment variables for defaults

```python
from typing import Annotated

import typer

def main(
    token: Annotated[
        str,
        typer.Option("--token", envvar="MYAPP_TOKEN", help="API token"),
    ],
    region: Annotated[
        str,
        typer.Option("--region", envvar="MYAPP_REGION"),
    ] = "us-west-2",
) -> None:
    typer.echo(f"token length={len(token)} region={region}")
```

Behavior to rely on:

- explicit CLI values win over environment variables
- the environment variable is used when the option is omitted
- missing required env-backed values still raise a normal usage error

### Store config files in the app directory

Typer exposes `typer.get_app_dir()` for OS-appropriate config locations:

```python
from pathlib import Path

import typer

APP_DIR = Path(typer.get_app_dir("myapp"))
CONFIG_PATH = APP_DIR / "config.toml"
```

This avoids hard-coding `~/.config` or platform-specific paths.

## Shared State With `Context`

Use a callback plus `typer.Context` when several subcommands need the same setup:

```python
from typing import Annotated

import typer

app = typer.Typer()

@app.callback()
def main(
    ctx: typer.Context,
    verbose: Annotated[bool, typer.Option("--verbose", "-v")] = False,
) -> None:
    ctx.obj = {"verbose": verbose}

@app.command()
def sync(ctx: typer.Context) -> None:
    typer.echo(f"verbose={ctx.obj['verbose']}")

if __name__ == "__main__":
    app()
```

Keep `ctx.obj` small and explicit. It is fine for settings, handles, and precomputed state, but avoid turning it into an untyped global bag.

## Prompts, Confirmation, And Exit Codes

Typer includes Click-style interactive helpers:

```python
import typer

def main(force: bool = False) -> None:
    if not force and not typer.confirm("Proceed?"):
        raise typer.Abort()

    typer.echo("Working...")

    if force:
        raise typer.Exit(code=0)

if __name__ == "__main__":
    typer.run(main)
```

Use:

- `typer.prompt()` to ask for a value
- `typer.confirm()` for yes/no checks
- `raise typer.Exit(code=...)` for controlled termination
- `raise typer.Abort()` for user-cancelled flows

If Rich exception rendering causes trouble in your environment, the docs note `TYPER_USE_RICH=0` as an escape hatch.

## Packaging And Entry Points

For a real CLI, install it as a console script instead of always running `python file.py`:

```toml
[project]
name = "myapp"
version = "0.1.0"
dependencies = ["typer==0.24.1"]

[project.scripts]
myapp = "myapp.cli:app"
```

With package code like:

```python
# myapp/cli.py
import typer

app = typer.Typer()

@app.command()
def version() -> None:
    typer.echo("0.1.0")
```

After installation:

```bash
myapp version
myapp --help
```

## Shell Completion

Typer can install or print shell completion scripts through the generated CLI:

```bash
myapp --install-completion
myapp --show-completion
```

Completion support is convenient for packaged CLIs, but it is less useful for ad hoc single-file scripts that are never installed.

## Testing

Use the official testing helper built on Click's runner:

```python
import typer
from typer.testing import CliRunner

app = typer.Typer()

@app.command()
def hello(name: str) -> None:
    typer.echo(f"Hello {name}")

runner = CliRunner()

def test_hello() -> None:
    result = runner.invoke(app, ["hello", "Ada"])
    assert result.exit_code == 0
    assert "Hello Ada" in result.stdout
```

Practical testing notes:

- use `runner.invoke(...)` for stdout, exit code, and usage-error assertions
- keep command bodies in normal functions so core logic is testable without the CLI wrapper
- prefer explicit argument lists over shell strings in tests

## Common Pitfalls

- Do not mix old default-value style and `Annotated` style in confusing ways; prefer one clear convention for new code.
- If your app has exactly one command, `typer.run(main)` is usually simpler than building a full `Typer()` app.
- If your app has multiple commands, define them on `Typer()` and call `app()`. Do not keep stacking `typer.run(...)` wrappers.
- Remember that path arguments and options arrive as Python objects only if you annotate them that way, for example `Path`, `int`, or `bool`.
- Interactive prompts block automation. Provide non-interactive flags or env vars for CI and agent workflows.
- Shell completion commands are generated by the app itself, so they are easiest to use after packaging the CLI as an installed command.
- Since Typer rides on Click, some behavior changes can come from Click compatibility updates, not only Typer's own code.

## Version-Sensitive Notes For `0.26.x`

- `0.24.0` added support for Click `8.3.0` and removed Python 3.9 support.
- `0.24.1` formally stopped supporting `typer-slim` and `typer-cli`; use the main `typer` package only.
- `0.25.x` and `0.26.x` continue on the Click `8.3+` line and keep `Requires-Python >=3.10`.
- `0.26.3` is the latest PyPI release in the `0.26.x` line; recent point releases focus on bug fixes and Click compatibility rather than new public APIs.
- Current upstream docs center the `Annotated` style. If you copy older Typer examples that pass `typer.Option(...)` as a default value, keep them consistent and verify they still match your Python version and type-checking expectations.
