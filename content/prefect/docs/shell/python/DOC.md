---
name: shell
description: "Prefect Shell integration for running shell commands and reusable shell-operation blocks from Python flows"
metadata:
  languages: "python"
  versions: "0.3.5"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "prefect,shell,python,workflow,commands,blocks"
---

# Prefect Shell Python Package Guide

## Golden Rule

Use `prefect-shell` when a Prefect flow needs to execute shell commands or scripts and capture their output in Prefect logs. Use `ShellOperation.run()` for short multi-command jobs, `ShellOperation.trigger()` when you want to start a process and wait on it later, and `shell_run_command()` for a single shell command task.

## Install

The maintainer docs recommend installing the integration through Prefect extras so the versions stay compatible:

```bash
python -m pip install "prefect[shell]"
```

If you need to pin the integration directly, install the package version covered here:

```bash
python -m pip install "prefect-shell==0.3.5"
```

Common alternatives:

```bash
uv add prefect-shell
poetry add prefect-shell
```

If you want the `ShellOperation` block type to appear in Prefect block storage and the UI, register it once after installation:

```bash
prefect block register -m prefect_shell
```

Sanity-check the install:

```bash
python -m pip show prefect-shell
python -c "import prefect_shell; print(prefect_shell.__file__)"
```

`prefect-shell 0.3.5` requires Python 3.10 or newer.

## Prerequisites And Environment

There is no separate `prefect-shell` API key or client configuration. Setup falls into two buckets:

- Prefect configuration when you want to save or load named blocks from Prefect Cloud or a self-hosted Prefect server
- runtime environment variables needed by the shell commands you actually execute

For Prefect Cloud:

```bash
export PREFECT_API_URL="https://api.prefect.cloud/api/accounts/<account-id>/workspaces/<workspace-id>"
export PREFECT_API_KEY="pnu_..."
```

For a local self-hosted server:

```bash
prefect server start
prefect config set PREFECT_API_URL="http://127.0.0.1:4200/api"
```

Example command-specific environment variables:

```bash
export PROJECT_ROOT="$PWD"
export APP_ENV="dev"
```

## Initialize A `ShellOperation`

There is no long-lived integration client to construct first. The main reusable object is `ShellOperation`.

```python
import os
from pathlib import Path

from prefect_shell import ShellOperation


shell_operation = ShellOperation(
    commands=[
        "mkdir -p logs",
        "printf 'env=%s\\n' \"$APP_ENV\" > logs/run.txt",
        "python -V",
    ],
    env={"APP_ENV": os.environ.get("APP_ENV", "dev")},
    working_dir=Path(os.environ["PROJECT_ROOT"]).resolve(),
    shell="bash",
)
```

Use an absolute path for `working_dir`. If you leave `shell` unset, Prefect uses `powershell` on Windows and `bash` on other platforms.

## Run Short-Lived Commands With `run()`

`run()` executes the configured commands, waits for completion, and returns the output as a list of lines.

```python
from pathlib import Path

from prefect import flow
from prefect_shell import ShellOperation


@flow(log_prints=True)
def prepare_workspace(project_root: str) -> list[str]:
    return ShellOperation(
        commands=[
            "mkdir -p build",
            "python -V",
        ],
        working_dir=Path(project_root).resolve(),
        stream_output=True,
    ).run()


if __name__ == "__main__":
    print(prepare_workspace("."))
```

## Trigger A Longer-Running Process

For a longer process, keep the block open as a context manager, call `trigger()`, then wait for completion when you are ready.

```python
from pathlib import Path

from prefect import flow
from prefect_shell import ShellOperation


@flow
def run_background_job(project_root: str) -> list[str]:
    with ShellOperation(
        commands=[
            "sleep 5",
            "echo background work finished",
        ],
        working_dir=Path(project_root).resolve(),
    ) as shell_operation:
        shell_process = shell_operation.trigger()

        # Do other flow work here if needed.

        shell_process.wait_for_completion()
        return shell_process.fetch_result()


if __name__ == "__main__":
    print(run_background_job("."))
```

`wait_for_completion()` raises `RuntimeError` if the process exits with a non-zero code. If you call `fetch_result()` before the process finishes, the output can be incomplete.

## Save And Reuse A Named Shell Block

`ShellOperation` is also a Prefect block, so you can save a command set once and load it in later flows.

```python
from prefect_shell import ShellOperation


operation = ShellOperation(
    commands=["python manage.py migrate"],
)
operation.save("django-migrate", overwrite=True)

loaded_operation = ShellOperation.load("django-migrate")
```

Then run the loaded block inside a flow:

```python
from prefect import flow
from prefect_shell import ShellOperation


@flow
def run_saved_operation() -> list[str]:
    operation = ShellOperation.load("django-migrate")
    return operation.run()
```

Named block documents are stored through the Prefect API, so this workflow depends on a reachable Prefect server or Prefect Cloud workspace. Register `prefect_shell` block types first if they are not available yet.

## Run A One-Off Command With `shell_run_command`

Use `shell_run_command()` when you only need one command and do not want to build a `ShellOperation` object first.

```python
from pathlib import Path

from prefect import flow
from prefect_shell import shell_run_command


@flow
def git_status(project_root: str) -> list[str]:
    return shell_run_command(
        command="git status --short",
        cwd=Path(project_root).resolve(),
        env={"GIT_PAGER": "cat"},
        return_all=True,
        shell="bash",
    )


if __name__ == "__main__":
    print(git_status("."))
```

Useful details:

- `return_all=False` is the default, so without `return_all=True` you only get the last output line back.
- `helper_command=` lets you run setup in the same shell process before the main command.
- `cwd=` sets the working directory for the subprocess.

## Common Pitfalls

- `ShellOperation.working_dir` expects an absolute path. Use `Path(...).resolve()` instead of assuming the worker starts in your project directory.
- Shell syntax is shell-specific. If your command assumes Bash syntax, set `shell="bash"` explicitly instead of relying on the platform default.
- `run()` returns a list of output lines. `shell_run_command()` returns only the last line unless you set `return_all=True`.
- `wait_for_completion()` and `shell_run_command()` both raise `RuntimeError` when the subprocess exits non-zero.
- Saving or loading named `ShellOperation` blocks depends on Prefect block registration plus a reachable Prefect API.

## Version Notes For `prefect-shell` 0.3.5

- This guide covers the PyPI package version `0.3.5`, released on March 10, 2026.
- PyPI marks `0.3.5` as the latest release and lists `Python >=3.10` as the package requirement.
- The current maintainer docs for `prefect-shell` live under the Prefect integrations site and match current Prefect 3 integration patterns.

## Official Sources Used

- Integrations guide: `https://docs.prefect.io/integrations/prefect-shell`
- SDK reference: `https://reference.prefect.io/prefect_shell/commands/`
- Blocks concept docs: `https://docs.prefect.io/v3/concepts/blocks`
- Settings and profiles: `https://docs.prefect.io/v3/concepts/settings-and-profiles`
- Self-hosted server setup: `https://docs.prefect.io/v3/how-to-guides/self-hosted`
- PyPI package page: `https://pypi.org/project/prefect-shell/`
