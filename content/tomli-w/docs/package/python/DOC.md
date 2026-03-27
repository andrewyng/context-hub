---
name: package
description: "tomli-w guide for writing TOML documents from Python data structures"
metadata:
  languages: "python"
  versions: "1.2.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "tomli-w,toml,python,serialization,config"
---

# tomli-w Python Package Guide

## Golden Rule

Use `tomli-w` when you need to serialize Python data to TOML 1.0.0. The import name is `tomli_w`, and the two public entry points are:

- `tomli_w.dumps(obj, *, multiline_strings=False, indent=4)` -> `str`
- `tomli_w.dump(obj, fp, *, multiline_strings=False, indent=4)` -> writes `bytes` to a binary file object

`tomli-w` is a writer only. It does not read TOML and it does not require environment variables, authentication, or client initialization.

## Install

For the released `1.2.0` package, PyPI requires Python 3.9 or newer:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "tomli-w==1.2.0"
```

If you also want to parse the generated TOML in the same project, install a parser separately:

```bash
python -m pip install "tomli-w==1.2.0" tomli
```

## Basic Usage

Import the module and pass a Python mapping to `dumps()`:

```python
from datetime import date

import tomli_w

data = {
    "title": "example",
    "enabled": True,
    "ports": [8000, 8001],
    "release_date": date(2026, 3, 13),
    "database": {
        "host": "db.internal",
        "port": 5432,
    },
}

toml_text = tomli_w.dumps(data)
print(toml_text)
```

Typical output:

```toml
title = "example"
enabled = true
ports = [
    8000,
    8001,
]
release_date = 2026-03-13

[database]
host = "db.internal"
port = 5432
```

## Write To A File

`dump()` writes encoded TOML bytes, so open the target file in binary mode:

```python
import tomli_w

pyproject_data = {
    "project": {
        "name": "demo-app",
        "version": "0.1.0",
    }
}

with open("pyproject.generated.toml", "wb") as f:
    tomli_w.dump(pyproject_data, f)
```

If you open the file with `"w"` instead of `"wb"`, `dump()` will fail because it writes bytes, not text.

## Common Workflows

### Arrays and nested tables

Lists become TOML arrays, and nested mappings become tables:

```python
import tomli_w

data = {
    "service": {
        "name": "billing",
        "replicas": 3,
    },
    "allowed_hosts": ["api.internal", "worker.internal"],
}

print(tomli_w.dumps(data))
```

### Control array indentation

The `indent` argument controls how many spaces are used for array items:

```python
import tomli_w

data = {"values": [[1, 2], [3, 4]]}

print(tomli_w.dumps(data, indent=2))
```

### Emit multiline basic strings

By default, `tomli-w` escapes newline characters instead of using TOML multiline strings. Enable `multiline_strings=True` when you want triple-quoted output:

```python
import tomli_w

data = {
    "message": "line one\nline two\n",
}

print(tomli_w.dumps(data, multiline_strings=True))
```

This is useful for generated config files, but leave it off if exact newline-byte preservation matters.

### Write `Decimal` values

`1.2.0` preserves `Decimal` values in parse round trips instead of converting them to plain `float` strings:

```python
from decimal import Decimal

import tomli_w

data = {
    "price": Decimal("19.99"),
}

print(tomli_w.dumps(data))
```

## Validate The Output

The maintainer README explicitly recommends validating generated TOML if your input might contain unusual values. A simple pattern is:

```python
import sys

import tomli_w

if sys.version_info >= (3, 11):
    import tomllib

    parse_toml = tomllib.loads
else:
    import tomli

    parse_toml = tomli.loads

data = {
    "title": "example",
    "count": 3,
}

toml_text = tomli_w.dumps(data)
parsed = parse_toml(toml_text)
print(parsed["title"])
```

## Supported Value Shapes

`tomli-w` is designed to serialize standard TOML-compatible Python values:

- `str`, `bool`, `int`, `float`
- `datetime.date`, `datetime.datetime`, and `datetime.time`
- `decimal.Decimal`
- `list` and `tuple`
- nested mappings with string keys

Use plain built-in values where possible. The maintainer docs warn that the library does not guarantee valid TOML for arbitrary subclasses or other exotic inputs.

## Important Pitfalls

- Install with `pip install tomli-w`, but import with `import tomli_w`.
- `dump()` needs a binary file object opened with `"wb"`.
- `tomli-w` only writes TOML. Use `tomli` or `tomllib` separately if you also need to parse TOML.
- `multiline_strings` is `False` by default because converting embedded newlines to triple-quoted strings can change the exact byte representation.
- Offset `datetime.time` values are not supported by TOML 1.0 and raise `ValueError`.
- Comments are not part of the input model. `tomli-w` generates TOML from data structures; it does not preserve comments from an existing file.
- If you need a specific output order, construct your mappings in that order before calling `dumps()`. `tomli-w` does not sort keys for you.

## Version Notes For 1.2.0

- PyPI metadata for `tomli-w 1.2.0` requires Python `>=3.9`.
- `1.2.0` improves parse round trips so `Decimal` values stay `Decimal`.
- Earlier `1.1.0` releases already dropped Python 3.7 and 3.8, so older runtimes are out of scope for the entire `1.2.x` line.

## Official Sources

- Maintainer repository: https://github.com/hukkin/tomli-w
- Maintainer README: https://github.com/hukkin/tomli-w#readme
- PyPI release page: https://pypi.org/project/tomli-w/
- Changelog: https://github.com/hukkin/tomli-w/blob/master/CHANGELOG.md
