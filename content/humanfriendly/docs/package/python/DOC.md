---
name: package
description: "humanfriendly package guide for Python text, terminal, and parsing utilities"
metadata:
  languages: "python"
  versions: "10.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "humanfriendly,python,cli,terminal,formatting,utilities"
---

# humanfriendly Python Package Guide

## Golden Rule

Use the official `humanfriendly` package when you need to parse or format human-readable values in Python. There is no client object, authentication flow, or service configuration: import the functions you need and call them directly.

## Install

Pin the version your project expects:

```bash
python -m pip install "humanfriendly==10.0"
```

If you rely on ANSI styling on older Windows terminals, install `colorama` as well; the docs say `humanfriendly` will use it automatically when available:

```bash
python -m pip install "humanfriendly==10.0" colorama
```

## Initialization

There is no package-level initialization. Import the helpers you need:

```python
import os

from humanfriendly import (
    InvalidSize,
    InvalidTimespan,
    coerce_boolean,
    format_size,
    format_timespan,
    parse_path,
    parse_size,
    parse_timespan,
)
```

## Common Workflows

### Parse and format file sizes

By default `format_size()` and `parse_size()` use decimal units for ambiguous symbols like `KB` and `GB`. Pass `binary=True` when you want base-2 behavior for ambiguous units.

```python
from humanfriendly import InvalidSize, format_size, parse_size

quota_bytes = parse_size("1.5 GB")
cache_bytes = parse_size("1 GiB")
legacy_bytes = parse_size("1 GB", binary=True)

print(quota_bytes)                 # 1500000000
print(cache_bytes)                 # 1073741824
print(legacy_bytes)                # 1073741824
print(format_size(cache_bytes))    # 1.07 GB
print(format_size(cache_bytes, binary=True))  # 1 GiB

try:
    parse_size("5 Z")
except InvalidSize as exc:
    print(f"Invalid size: {exc}")
```

### Parse timespans from flags, config, or user input

`parse_timespan()` is meant for concise human input like `5m` or `1h`, not as an exact inverse of `format_timespan()`.

```python
from humanfriendly import InvalidTimespan, format_timespan, parse_timespan

poll_interval = parse_timespan("2.5m")
print(poll_interval)                    # 150.0
print(format_timespan(poll_interval))   # 2 minutes and 30 seconds
print(format_timespan(93784))           # 1 day, 2 hours and 3 minutes

try:
    parse_timespan("1 age")
except InvalidTimespan as exc:
    print(f"Invalid timespan: {exc}")
```

### Parse environment variables and path-like input

`coerce_boolean()` is useful for strict env var parsing. `parse_path()` expands `~`, environment variables, and then returns an absolute path.

```python
import os

from humanfriendly import coerce_boolean, parse_path

debug_enabled = coerce_boolean(os.getenv("DEBUG", "false"))
log_path = parse_path(os.getenv("APP_LOG_PATH", "~/logs/$USER/app.log"))

print(debug_enabled)
print(log_path)
```

Accepted string booleans are `1`, `yes`, `true`, `on`, `0`, `no`, `false`, and `off`. Unknown strings raise `ValueError`, which is useful when you want configuration mistakes to fail fast.

### Measure work or rate-limit a loop

`Timer` instances stringify to a human-readable elapsed time. Resumable timers also work as context managers and expose `sleep()` for loop pacing.

```python
import time

from humanfriendly import Timer

with Timer(resumable=True) as timer:
    time.sleep(1.2)
    print(f"Finished first step in {timer}")

for item in range(3):
    with Timer() as iteration_timer:
        time.sleep(0.2)
        print(f"Processed {item} in {iteration_timer}")

    # Keep the loop at roughly one iteration per second.
    Timer().sleep(1)
```

If you want the timer to pause and resume across multiple `with` blocks, keep one resumable timer instance:

```python
import time

from humanfriendly import Timer

timer = Timer(resumable=True)

with timer:
    time.sleep(0.5)

with timer:
    time.sleep(0.5)

print(timer.elapsed_time)
print(timer.rounded)
```

### Prompt for input or a constrained choice

Use the prompts helpers for simple terminal programs. `prompt_for_choice()` accepts a numeric selection or a unique substring of an option.

```python
from humanfriendly.prompts import prompt_for_choice, prompt_for_confirmation, prompt_for_input

size_text = prompt_for_input("Enter cache size", default="512 MB")
region = prompt_for_choice(["us-east-1", "us-west-2", "eu-west-1"], default="us-east-1")
confirmed = prompt_for_confirmation("Apply settings?", default=True)

print(size_text, region, confirmed)
```

If standard input is not connected to a terminal, `prompt_for_input()` returns its `default` instead of blocking for input. `prompt_for_choice()` raises `ValueError` when given an empty list and skips prompting entirely when only one choice is available.

### Render terminal-safe output, styles, and tables

Use the terminal and table helpers when you want readable CLI output without building formatting code yourself.

```python
from humanfriendly.tables import format_smart_table
from humanfriendly.terminal import ansi_wrap, message, output

rows = [
    ["worker-a", "ready", "1.2 GB"],
    ["worker-b", "draining", "850 MB"],
]

table = format_smart_table(rows, column_names=["Worker", "Status", "Memory"])

output(ansi_wrap("Cluster summary", color="green", bold=True))
output(table)
message("Wrote report to %s", "/tmp/report.txt")
```

For long blocking calls where you want terminal feedback, use `AutomaticSpinner` as a context manager:

```python
import time

from humanfriendly import AutomaticSpinner

with AutomaticSpinner(label="Waiting for subprocess"):
    time.sleep(3)
```

## Command-Line Interface

The package also installs a `humanfriendly` command. The official docs list these common options:

```bash
humanfriendly --format-size 1500000000
humanfriendly --format-size 1500000000 --binary
humanfriendly --parse-size "1.5 GB"
humanfriendly --format-timespan 93784
humanfriendly --parse-length "15.3cm"
humanfriendly --format-table < data.txt
humanfriendly --demo
```

`--demo` is the quickest way to verify whether ANSI styling works in the current terminal.

## Common Pitfalls

- `KB`, `MB`, and `GB` default to decimal units. Use `binary=True` or explicit `KiB`/`MiB`/`GiB` when you need base-2 semantics.
- `parse_timespan()` is optimized for short human input like `5m` and `1h`; do not treat it as an exact round-trip pair with `format_timespan()`.
- `coerce_boolean()` is strict for strings. Values outside the documented true/false set raise `ValueError`.
- `prompt_for_choice()` is terminal-oriented. In non-interactive environments, pass defaults explicitly or avoid prompting code paths.
- ANSI color support on Windows may depend on native Windows 10 support or `colorama`.

## Version Notes For 10.0

- The Read the Docs site and PyPI project both document `humanfriendly 10.0`; PyPI’s latest release is still `10.0`.
- The docs for 10.0 say the package is tested on Python 2.7, Python 3.5+, and PyPy 2.7. For new code, prefer Python 3, but do not assume the project has newer Python-specific documentation than what the 10.0 docs describe.
- The 10.0 changelog notes a Windows `pyreadline` compatibility fix for Python 3.9+, updates to the Python 3 examples in the readme, and removal of the legacy `humanfriendly.compat.unittest` alias. If you maintain older code that imports that alias, it needs to change.

## Official Sources

- Documentation index: https://humanfriendly.readthedocs.io/en/latest/
- Readme and CLI overview: https://humanfriendly.readthedocs.io/en/latest/readme.html
- API reference: https://humanfriendly.readthedocs.io/en/latest/api.html
- Changelog: https://humanfriendly.readthedocs.io/en/latest/changelog.html
- PyPI package page: https://pypi.org/project/humanfriendly/
