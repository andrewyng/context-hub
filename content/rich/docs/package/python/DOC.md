---
name: package
description: "Rich Python package guide for terminal formatting, tables, progress bars, logging, markdown, and tracebacks"
metadata:
  languages: "python"
  versions: "15.0.0"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "rich,python,terminal,cli,logging,progress,markdown"
---

# Rich Python Package Guide

## Golden Rule

Use `rich` as a terminal rendering layer centered on `Console`, not as a grab bag of unrelated helpers. As of May 29, 2026, PyPI is at `15.0.0`, released 2026-04-12 as a major version that drops Python 3.8. Combine the stable docs site with the upstream changelog for any post-`14.x` behavior changes.

## Install

Pin the version your project expects:

```bash
python -m pip install "rich==15.0.0"
```

Common alternatives:

```bash
uv add "rich==15.0.0"
poetry add "rich==15.0.0"
```

Optional Jupyter extra:

```bash
python -m pip install "rich[jupyter]==15.0.0"
```

Sanity-check terminal support:

```bash
python -m rich
```

## Initialize And Basic Setup

For one-off formatted output, `rich.print` is the fastest entry point:

```python
from rich import print

print("[bold green]Build passed[/bold green]")
print({"status": "ok", "items": [1, 2, 3]})
```

For anything non-trivial, create a shared `Console` instance and route output through it:

```python
from rich.console import Console

console = Console()
console.print("Hello, [bold magenta]Rich[/bold magenta]!")
```

Use one shared console per output stream when possible. It keeps width detection, themes, recording, and progress rendering consistent.

## Core Usage

### Styled output, tables, and markdown

```python
from rich.console import Console
from rich.markdown import Markdown
from rich.table import Table

console = Console()

table = Table(title="Deployments", show_header=True, header_style="bold cyan")
table.add_column("Service")
table.add_column("Status")
table.add_column("Latency", justify="right")
table.add_row("api", "[green]healthy[/green]", "43 ms")
table.add_row("worker", "[yellow]degraded[/yellow]", "210 ms")

console.print(table)
console.print(Markdown("## Notes\nUse `Console` for multi-line output."))
```

`Console.print()` accepts the same kinds of arguments as `print()` plus Rich renderables (`Table`, `Markdown`, `Panel`, `Syntax`, ...). Rich markup like `[bold red]...[/bold red]` is enabled by default. If your text contains literal square brackets from user input or logs, either escape it with `rich.markup.escape()` or call `console.print(text, markup=False)`.

### Panels

`Panel` wraps any renderable in a titled box, useful for grouping output or highlighting status:

```python
from rich.console import Console
from rich.panel import Panel

console = Console()
console.print(Panel.fit("Deploy succeeded", title="status", border_style="green"))
```

### Syntax highlighting

Render source code with `Syntax`. Specify the lexer name and an optional theme:

```python
from rich.console import Console
from rich.syntax import Syntax

console = Console()
code = "def add(a: int, b: int) -> int:\n    return a + b\n"
console.print(Syntax(code, "python", theme="monokai", line_numbers=True))
```

`Syntax.from_path("file.py")` reads and highlights a file in one step.

### Layouts

For dashboard-style output, `Layout` splits the console into named regions you can update independently. Use it sparingly; for full-screen TUIs prefer Textual.

```python
from rich.console import Console
from rich.layout import Layout
from rich.panel import Panel

layout = Layout()
layout.split_column(Layout(name="header", size=3), Layout(name="body"))
layout["header"].update(Panel("My App", style="bold"))
layout["body"].update(Panel("Body content here"))

Console().print(layout)
```

### Logging and better tracebacks

Use Rich's logging handler instead of manually colorizing log strings, and install `traceback` to get readable tracebacks with syntax-highlighted frames:

```python
import logging

from rich.logging import RichHandler
from rich.traceback import install

install(show_locals=True)

logging.basicConfig(
    level="INFO",
    format="%(message)s",
    handlers=[RichHandler(rich_tracebacks=True)],
)

log = logging.getLogger("app")
log.info("server started")
```

`traceback.install()` replaces `sys.excepthook` so uncaught exceptions render with source context and (with `show_locals=True`) local variables. `RichHandler(rich_tracebacks=True)` makes logged exceptions render the same way. Keep `markup=False` unless you control the log message content, otherwise messages containing `[` and `]` can be interpreted as markup.

### Progress bars and live status

For a single iterable, `track()` is the simplest choice:

```python
from rich.progress import track

for item in track(range(100), description="Processing"):
    process(item)
```

For multiple tasks or custom columns, use `Progress`:

```python
from time import sleep

from rich.progress import BarColumn, Progress, TextColumn, TimeRemainingColumn

with Progress(
    TextColumn("[progress.description]{task.description}"),
    BarColumn(),
    TimeRemainingColumn(),
    transient=True,
) as progress:
    task_id = progress.add_task("Uploading", total=5)
    for _ in range(5):
        sleep(0.2)
        progress.advance(task_id)
```

Rich redirects `stdout` and `stderr` while a progress display is active so plain `print()` calls do not usually destroy the progress layout. Even so, prefer writing through the same `Console` or the `Progress` instance for predictable formatting.

### Prompts and input

Use the prompt helpers instead of hand-rolling validation:

```python
from rich.prompt import Confirm, IntPrompt, Prompt

name = Prompt.ask("Project name", default="demo")
retries = IntPrompt.ask("Retry count", default=3)
deploy = Confirm.ask("Deploy now?", default=False)
```

### Pretty-printing and debugging

Rich can improve the Python REPL and ad hoc object inspection:

```python
from rich import inspect, pretty

pretty.install()

data = {"service": "api", "ports": [8000, 8001]}
inspect(data, methods=False)
```

## Configuration And Environment

Rich has no authentication model. Configuration is mostly terminal behavior and rendering defaults.

Useful `Console` options:

- `stderr=True`: send output to stderr instead of stdout
- `force_terminal=True`: emit terminal control codes even when auto-detection says the output is not a TTY
- `force_interactive=False`: disable interactive behaviors such as live animations
- `record=True`: retain output so you can call `export_text()`, `export_svg()`, or `export_html()`
- `soft_wrap=True`: disable cropping and let long text wrap naturally
- `safe_box=True`: prefer legacy-safe box characters when output must render on old Windows terminals

Example:

```python
from rich.console import Console

console = Console(
    stderr=True,
    force_terminal=True,
    force_interactive=False,
    record=True,
)

console.print("[bold]Build report[/bold]")
html = console.export_html()
```

Important environment variables from the console docs:

- `NO_COLOR`: disables colors; it takes precedence over `FORCE_COLOR`
- `FORCE_COLOR=1`: forces color output when Rich would otherwise disable it
- `TTY_COMPATIBLE=1`: tells Rich the target can display terminal escape sequences
- `TTY_INTERACTIVE=0`: disables interactive rendering such as animated progress bars
- `COLUMNS` and `LINES`: override detected terminal size
- `JUPYTER_COLUMNS` and `JUPYTER_LINES`: Jupyter-specific width and height defaults

For CI or GitHub Actions, the documented combination is:

```bash
export TTY_COMPATIBLE=1
export TTY_INTERACTIVE=0
```

## Common Pitfalls

- Do not mix `rich.print` and a separately configured `Console` indiscriminately. If your app depends on one theme, one output stream, or one recording buffer, use a shared `Console`.
- Do not enable markup on untrusted text. Escape it first or call `console.print(text, markup=False)`.
- `RichHandler` does not magically make file logs colorful. It is for terminal handlers; use plain structured logging for machine-readable log sinks.
- If colors disappear in CI or when piping, set `force_terminal=True` or the `TTY_COMPATIBLE` and `TTY_INTERACTIVE` environment variables explicitly.
- `record=True` is required before calling `export_text()`, `export_svg()`, or `export_html()`.
- `safe_box=False` may render poorly on old Windows terminals that cannot display Unicode box-drawing characters correctly.
- Progress and live displays are great for human-facing CLIs but usually wrong for non-interactive logs. Disable interactivity in CI.
- Rich word-wraps output by default. If you are rendering preformatted text where spacing must remain exact, test with `soft_wrap`, `overflow`, or raw file output settings.

## Version-Sensitive Notes For 15.0.0

- PyPI currently publishes `15.0.0`, released 2026-04-12. It is a major version bump whose only breaking change in the changelog is dropping Python 3.8.
- `15.0.0` fixes include: empty `print` now respects the `end` parameter, `Text.from_ansi` preserves newlines, `FileProxy.isatty` is proxied through correctly, and inline code renders properly inside Markdown table cells.
- The `14.3.x` line shipped Unicode-width and grapheme-splitting fixes plus better multi-codepoint glyph support, the `UNICODE_VERSION` environment variable, and new `locals_max_depth` and `locals_overflow` parameters on `traceback.install()`. `15.0.0` inherits all of that.
- Since `14.1.0`, Live objects including `Progress` may be nested. If you see older guidance claiming nested live rendering is unsupported, that guidance is stale.
- The stable docs site may still lag the PyPI release; verify patch-level behavior against the upstream changelog.

## Canonical Sources

- Stable docs: `https://rich.readthedocs.io/en/stable/`
- Console docs: `https://rich.readthedocs.io/en/stable/console.html`
- Progress docs: `https://rich.readthedocs.io/en/stable/progress.html`
- Prompt docs: `https://rich.readthedocs.io/en/stable/prompt.html`
- Logging docs: `https://rich.readthedocs.io/en/stable/logging.html`
- Pretty docs: `https://rich.readthedocs.io/en/stable/pretty.html`
- Traceback docs: `https://rich.readthedocs.io/en/stable/traceback.html`
- PyPI package page: `https://pypi.org/project/rich/`
- Upstream changelog: `https://github.com/Textualize/rich/blob/master/CHANGELOG.md`
