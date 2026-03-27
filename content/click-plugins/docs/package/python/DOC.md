---
name: package
description: "click-plugins guide for Click CLIs that load subcommands from Python package entry points"
metadata:
  languages: "python"
  versions: "1.1.1.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "click,plugins,cli,entry-points,setuptools,python"
---

# click-plugins Python Package Guide

## Golden Rule

Use `click-plugins` only to attach external `click` commands or groups that are published as Python entry points. The published PyPI package is `click-plugins==1.1.1.2`, and the PyPI project description marks it as inactive and points readers to the maintainer repository for vendoring guidance.

There is no client object, network setup, or authentication step. The core workflow is:

1. Define a Click group in the host application.
2. Decorate that group with `with_plugins(...)`.
3. Publish plugin commands under a shared entry point group.
4. Install the host app and the plugin distributions into the same Python environment.

## Install

If you are using the published package, install `click-plugins`, `click`, and `setuptools` in the environment that runs the CLI:

```bash
python -m pip install "click-plugins==1.1.1.2" "click>=8" setuptools
```

Common project managers:

```bash
uv add "click-plugins==1.1.1.2" "click>=8" setuptools
poetry add "click-plugins==1.1.1.2" "click>=8" setuptools
```

Environment variables:

- None required by `click-plugins` itself.

## Host CLI Setup

The published PyPI docs show the conservative pattern: pass `pkg_resources.iter_entry_points(...)` into `with_plugins(...)`.

```python
# myapp/cli.py
from pkg_resources import iter_entry_points

import click
from click_plugins import with_plugins

PLUGIN_GROUP = "myapp.cli_plugins"


@with_plugins(iter_entry_points(PLUGIN_GROUP))
@click.group()
@click.option("--verbose", is_flag=True, help="Enable verbose output.")
@click.pass_context
def cli(ctx: click.Context, verbose: bool) -> None:
    ctx.ensure_object(dict)
    ctx.obj["verbose"] = verbose


@cli.command()
def version() -> None:
    click.echo("myapp 0.1.0")
```

If you want a runnable command, expose the group as a console script in your host package metadata:

```toml
# pyproject.toml
[project]
name = "myapp"
version = "0.1.0"
dependencies = [
  "click>=8",
  "click-plugins==1.1.1.2",
  "setuptools",
]

[project.scripts]
myapp = "myapp.cli:cli"
```

After the host package is installed, `myapp --help` will include any discovered plugin commands from the `myapp.cli_plugins` entry point group.

## Plugin Package Setup

Plugin packages register commands in package metadata. Current Python packaging guidance uses `[project.entry-points."..."]` in `pyproject.toml`.

```toml
# pyproject.toml
[project]
name = "myapp-hello-plugin"
version = "0.1.0"
dependencies = [
  "click>=8",
  "myapp",
]

[project.entry-points."myapp.cli_plugins"]
hello = "myapp_hello_plugin.cli:hello"
```

The plugin command itself is ordinary Click code:

```python
# myapp_hello_plugin/cli.py
import click


@click.command()
@click.pass_context
def hello(ctx: click.Context) -> None:
    verbose = bool(ctx.obj and ctx.obj.get("verbose"))

    if verbose:
        click.echo("Running hello plugin in verbose mode")

    click.echo("Hello from plugin")
```

Install the plugin into the same environment as the host CLI:

```bash
python -m pip install -e /path/to/myapp
python -m pip install -e /path/to/myapp-hello-plugin
myapp --help
myapp hello
```

## Common Workflows

### Share options and state from the host CLI

The project docs recommend defining common options once in the host package so plugins can import and reuse them. Plugins also have access to the parent command's `ctx.obj`, which is the simplest place to pass config, verbosity flags, or handles created by the host command.

Reusable host option:

```python
# myapp/options.py
import click

jobs_opt = click.option(
    "-j",
    "--jobs",
    type=click.IntRange(min=1),
    default=1,
    show_default=True,
    help="Number of worker processes.",
)
```

Plugin reusing the option:

```python
# myapp_hello_plugin/cli.py
import click
from myapp.options import jobs_opt


@click.command()
@jobs_opt
def hello(jobs: int) -> None:
    click.echo(f"Running with {jobs} worker(s)")
```

### Handle broken plugins without crashing the whole CLI

If a plugin entry point exists but cannot be imported or loaded, `click-plugins` converts it into a placeholder command instead of crashing the entire CLI. The help text warns that the plugin could not be loaded, and invoking that command prints the traceback.

This means:

- `myapp --help` can still work even when one plugin is broken.
- Users can inspect the failing plugin by running its command with `--help` or invoking it directly.

## Version-Sensitive Notes

- PyPI lists `click-plugins 1.1.1.2` as the latest published package, released on June 25, 2025.
- The PyPI project description explicitly says the package is no longer actively maintained and that the underlying library can be vendored from the maintainer repository.
- The current maintainer source also documents a newer `importlib.metadata`-based path where `with_plugins(...)` can resolve a group name directly. If you are pinned to the published PyPI package, use the iterator-based pattern shown above because that is the behavior documented on PyPI.

## Pitfalls

- Entry points are discovered from installed distributions, not from Python files sitting in your source tree. If the plugin package is not installed into the active environment, the host CLI will not see it.
- Keep the decorator order from the published examples: apply `@with_plugins(...)` above `@click.group()`.
- The entry point group string must match on both sides. If the host uses `myapp.cli_plugins`, every plugin package must publish commands under exactly that group.
- Keep command names stable. The entry point name and the Click command name should not disagree unless you have a reason to present different names.
- If you use the published PyPI pattern with `pkg_resources.iter_entry_points(...)`, `setuptools` must be importable at runtime.
- Prefer `pyproject.toml` entry point declarations for new packages even though many older examples use `setup.py`. They publish the same package metadata.

## Official Sources

- PyPI project: https://pypi.org/project/click-plugins/
- Maintainer docs and examples: https://github.com/click-contrib/click-plugins/blob/main/click_plugins.rst
- Maintainer source implementation: https://github.com/click-contrib/click-plugins/blob/main/click_plugins.py
- Python Packaging User Guide entry point examples: https://packaging.python.org/en/latest/guides/creating-and-discovering-plugins/
- `importlib.metadata` entry points reference: https://docs.python.org/3/library/importlib.metadata.html
