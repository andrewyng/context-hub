---
name: package
description: "colorlog package guide for Python logging with ANSI-colored console output"
metadata:
  languages: "python"
  versions: "6.10.1"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "colorlog,python,logging,ansi,terminal"
---

# colorlog Python Package Guide

## What It Is

`colorlog` adds ANSI color formatting to Python's standard-library `logging` handlers. Use it when you want colored terminal logs while keeping the normal `logging` logger, handler, and configuration model.

`colorlog` has no auth flow, no service client, and no package-specific environment variables. The important setup step is creating a `logging` handler and attaching `colorlog.ColoredFormatter` to it.

## Installation

Pin the version your application expects:

```bash
python -m pip install "colorlog==6.10.1"
```

With `uv`:

```bash
uv add "colorlog==6.10.1"
```

With Poetry:

```bash
poetry add "colorlog==6.10.1"
```

## Quick Start

Attach `ColoredFormatter` to a console handler:

```python
import logging

from colorlog import ColoredFormatter


handler = logging.StreamHandler()
handler.setFormatter(
    ColoredFormatter(
        "%(log_color)s%(levelname)-8s%(reset)s %(name)s %(message)s"
    )
)

logger = logging.getLogger("myapp")
logger.setLevel(logging.INFO)
logger.addHandler(handler)
logger.propagate = False

logger.debug("debug details")
logger.info("server started")
logger.warning("cache miss")
logger.error("request failed")
logger.critical("database unavailable")
```

The key fields in the format string are:

- `%(log_color)s`: inserts the color chosen for the current log level
- `%(reset)s`: resets terminal styling so later output is not left colored
- normal `logging` fields like `%(levelname)s`, `%(name)s`, and `%(message)s`

## Customize Colors Per Log Level

Pass `log_colors` when the default mapping is not enough:

```python
import logging

from colorlog import ColoredFormatter


formatter = ColoredFormatter(
    "%(log_color)s%(levelname)-8s%(reset)s %(name)s %(message)s",
    log_colors={
        "DEBUG": "cyan",
        "INFO": "green",
        "WARNING": "yellow",
        "ERROR": "red",
        "CRITICAL": "red,bg_white",
    },
)

handler = logging.StreamHandler()
handler.setFormatter(formatter)

logger = logging.getLogger("myapp")
logger.setLevel(logging.DEBUG)
logger.addHandler(handler)
logger.propagate = False
```

This keeps your logger API unchanged. The only difference is how records are rendered by the handler.

## Use With `logging.config.dictConfig`

`colorlog` works cleanly with the standard `dictConfig` path:

```python
import logging
import logging.config


logging.config.dictConfig(
    {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "colored": {
                "()": "colorlog.ColoredFormatter",
                "format": "%(log_color)s%(levelname)-8s%(reset)s %(name)s %(message)s",
                "log_colors": {
                    "DEBUG": "cyan",
                    "INFO": "green",
                    "WARNING": "yellow",
                    "ERROR": "red",
                    "CRITICAL": "red,bg_white",
                },
            }
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "formatter": "colored",
            }
        },
        "root": {
            "handlers": ["console"],
            "level": "INFO",
        },
    }
)

log = logging.getLogger("worker")
log.info("job started")
```

Use this approach when the application already centralizes logging setup in settings files or bootstrapping code.

## Secondary Colors Inside The Message

Use `secondary_log_colors` when you want a second color mapping in the same formatted record. The mapping key becomes a formatter field named `<key>_log_color`:

```python
import logging

from colorlog import ColoredFormatter


formatter = ColoredFormatter(
    "%(log_color)s%(levelname)-8s%(reset)s %(message_log_color)s%(message)s",
    secondary_log_colors={
        "message": {
            "ERROR": "red",
            "CRITICAL": "red",
        }
    },
)

handler = logging.StreamHandler()
handler.setFormatter(formatter)

logger = logging.getLogger("billing")
logger.setLevel(logging.INFO)
logger.addHandler(handler)
logger.propagate = False

logger.error("card charge failed")
```

This is useful when you want the level label and the message body to follow different color rules.

## Setup Notes

- Environment variables: none
- Authentication: none
- Client initialization: none
- Main integration point: `logging.StreamHandler()` plus `colorlog.ColoredFormatter(...)`

For terminal output, attach `ColoredFormatter` to stream handlers. For file logs, use a plain `logging.Formatter` unless you explicitly want ANSI escape sequences written to the file.

## Common Pitfalls

### Forgetting `%(log_color)s` in the format string

If the format string does not include a color field, the formatter still runs but your output does not become colorized.

### Reusing the same handler setup on file outputs

ANSI color codes are appropriate for terminals, but they are usually the wrong choice for log files, JSON logs, or other machine-consumed output.

### Seeing duplicate log lines

If your logger already propagates to the root logger and the root logger has its own handler, you can get each message twice. Set `logger.propagate = False` when you want only your explicitly attached colored handler.

### Expecting `colorlog` to replace `logging`

`colorlog` is a formatter for the stdlib logging system. You still configure loggers, handlers, levels, and propagation through `logging` itself.

## Official Sources

- Repository: `https://github.com/borntyping/python-colorlog`
- PyPI: `https://pypi.org/project/colorlog/`
