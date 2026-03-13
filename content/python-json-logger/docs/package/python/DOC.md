---
name: package
description: "python-json-logger Python package guide for structured JSON logging with the standard logging module"
metadata:
  languages: "python"
  versions: "4.0.0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "python-json-logger,logging,json,structured-logging,python,orjson,msgspec"
---

# python-json-logger Python Package Guide

## Golden Rule

Use `python-json-logger` as a formatter for Python's built-in `logging` package. It formats `LogRecord` objects as JSON, but it does not send logs anywhere by itself, does not create a client object, and does not use authentication or package-specific environment variables.

For new code on `4.0.0`, import the standard formatter from `pythonjsonlogger.json`. The older `pythonjsonlogger.jsonlogger` module still exists for compatibility, but it emits a `DeprecationWarning`.

## Install

`python-json-logger` requires Python `3.8+`.

Install the package version you want to document or pin in your app:

```bash
python -m pip install "python-json-logger==4.0.0"
```

If you want one of the optional faster encoders, install it separately:

```bash
python -m pip install orjson
python -m pip install msgspec
```

Quick verification:

```bash
python - <<'PY'
from importlib.metadata import version
from pythonjsonlogger.json import JsonFormatter

print(version("python-json-logger"))
print(JsonFormatter)
PY
```

## Environment And Initialization

`python-json-logger` does not read environment variables.

The normal setup pattern is:

1. create a `logging.Handler`
2. attach a `JsonFormatter`
3. add the handler to a logger

Minimal stream logger:

```python
import logging

from pythonjsonlogger.json import JsonFormatter

handler = logging.StreamHandler()
handler.setFormatter(
    JsonFormatter(
        fmt=["levelname", "name", "message"],
        rename_fields={"levelname": "level"},
        timestamp="timestamp",
    )
)

logger = logging.getLogger("app")
logger.setLevel(logging.INFO)
logger.propagate = False
logger.addHandler(handler)

logger.info("worker started", extra={"request_id": "req_123"})
```

Example output:

```json
{"level": "INFO", "name": "app", "message": "worker started", "request_id": "req_123", "timestamp": "2026-03-12T00:00:00+00:00"}
```

`timestamp=True` adds a UTC timestamp field named `timestamp`. Pass a string such as `timestamp="time"` if you want a different field name.

## Common Workflows

### Add structured fields with `extra=`

Use standard `logging` calls and pass structured fields through `extra`.

```python
import logging

from pythonjsonlogger.json import JsonFormatter

handler = logging.StreamHandler()
handler.setFormatter(JsonFormatter())

logger = logging.getLogger("billing")
logger.setLevel(logging.INFO)
logger.propagate = False
logger.addHandler(handler)

logger.info(
    "order created",
    extra={
        "order_id": "ord_123",
        "customer_id": "cus_456",
        "amount_cents": 1250,
    },
)
```

The keys in `extra` are merged into the top-level JSON object unless they are filtered out by `reserved_attrs`.

### Log a dictionary directly

If `record.msg` is a dictionary, `python-json-logger` emits that dictionary at the root of the JSON record instead of storing it as a nested message payload.

```python
import logging

from pythonjsonlogger.json import JsonFormatter

handler = logging.StreamHandler()
handler.setFormatter(JsonFormatter(timestamp=True))

logger = logging.getLogger("events")
logger.setLevel(logging.INFO)
logger.propagate = False
logger.addHandler(handler)

logger.info(
    {
        "event": "checkout.completed",
        "order_id": "ord_123",
        "amount_cents": 1250,
    }
)
```

This is useful when your application already builds event dictionaries.

### Configure `logging.config.dictConfig`

For application startup, `dictConfig` is usually the cleanest way to register the formatter.

```python
import logging
import logging.config

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "json": {
            "()": "pythonjsonlogger.json.JsonFormatter",
            "fmt": ["levelname", "name", "message"],
            "rename_fields": {"levelname": "level"},
            "timestamp": "timestamp",
            "static_fields": {"service": "billing-api"},
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "json",
        }
    },
    "root": {
        "level": "INFO",
        "handlers": ["console"],
    },
}

logging.config.dictConfig(LOGGING)

logger = logging.getLogger(__name__)
logger.info("configured", extra={"port": 8000})
```

In `4.0.0`, `fmt` can be a sequence of field names as shown above, or a comma-separated string when you set `style=","`.

### Emit exceptions as arrays of lines

By default, `exc_info` and `stack_info` are serialized as strings. If your log pipeline prefers arrays, enable the formatter options explicitly.

```python
import logging

from pythonjsonlogger.json import JsonFormatter

handler = logging.StreamHandler()
handler.setFormatter(
    JsonFormatter(
        fmt=["levelname", "name", "message", "exc_info"],
        rename_fields={"levelname": "level"},
        exc_info_as_array=True,
    )
)

logger = logging.getLogger("jobs")
logger.setLevel(logging.INFO)
logger.propagate = False
logger.addHandler(handler)

try:
    1 / 0
except ZeroDivisionError:
    logger.exception("job failed", extra={"job_id": "job_123"})
```

Use `stack_info_as_array=True` for stack traces produced from `stack_info` as well.

## Choosing A Formatter Backend

### Standard library `json`

Use `pythonjsonlogger.json.JsonFormatter` when you want the fewest extra dependencies.

```python
from pythonjsonlogger.json import JsonFormatter

formatter = JsonFormatter(timestamp=True)
```

If you do not pass `json_default` or `json_encoder`, `JsonFormatter` uses the package's built-in `JsonEncoder`.

### `orjson`

Use `pythonjsonlogger.orjson.OrjsonFormatter` only after installing `orjson`.

```python
import logging

from pythonjsonlogger.orjson import OrjsonFormatter

handler = logging.StreamHandler()
handler.setFormatter(
    OrjsonFormatter(
        fmt=["levelname", "name", "message"],
        rename_fields={"levelname": "level"},
        timestamp=True,
        json_indent=True,
    )
)
```

`json_indent=True` enables two-space pretty printing for the `orjson` backend.

### `msgspec`

Use `pythonjsonlogger.msgspec.MsgspecFormatter` only after installing `msgspec`.

```python
import logging

from pythonjsonlogger.msgspec import MsgspecFormatter

handler = logging.StreamHandler()
handler.setFormatter(
    MsgspecFormatter(
        fmt=["levelname", "name", "message"],
        rename_fields={"levelname": "level"},
        timestamp=True,
    )
)
```

If the matching backend package is missing, importing `pythonjsonlogger.orjson` or `pythonjsonlogger.msgspec` raises `MissingPackageError`.

## Custom Serialization

The standard `JsonFormatter` already handles common non-JSON-native values including `datetime`, `date`, `time`, exceptions, tracebacks, enums, bytes, dataclasses, and Python types.

For your own application types, provide `json_default` or `json_encoder`.

```python
from decimal import Decimal

from pythonjsonlogger.json import JsonFormatter


def encode_value(obj):
    if isinstance(obj, Decimal):
        return str(obj)
    raise TypeError(f"Object of type {type(obj).__name__} is not JSON serializable")


formatter = JsonFormatter(json_default=encode_value)
```

Use `json_encoder` when you want to subclass `json.JSONEncoder`; use `json_default` when a simple callback is enough.

## Common Pitfalls

### Install name and import name are different

Install `python-json-logger`, but import `pythonjsonlogger`.

### `pythonjsonlogger.jsonlogger` is legacy

`4.0.0` keeps `pythonjsonlogger.jsonlogger` as a compatibility stub. Prefer `pythonjsonlogger.json` in new code to avoid deprecation warnings.

### Formatter fields can collide

`fmt`, `defaults`, `static_fields`, dictionary messages, and `extra` all contribute keys to the same top-level JSON object. Reuse field names intentionally so you do not overwrite values by accident.

### `timestamp` is separate from `asctime`

`timestamp=True` or `timestamp="field_name"` adds a UTC datetime derived from `record.created`. If you also want the logging formatter's `asctime` field, include `asctime` in `fmt` explicitly.

### Optional encoder backends are not bundled automatically

`python-json-logger` does not install `orjson` or `msgspec` for you. Install the backend package before importing the matching formatter module.

## Version Notes For `4.0.0`

- `fmt` now accepts a sequence such as `fmt=["levelname", "name", "message"]`.
- `fmt` also supports comma-separated field names with `style=","`.
- The compatibility module `pythonjsonlogger.jsonlogger` remains available, but new code should use `pythonjsonlogger.json`.
