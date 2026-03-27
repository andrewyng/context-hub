---
name: package
description: "Python toml package guide for parsing and writing TOML files and strings"
metadata:
  languages: "python"
  versions: "0.10.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "toml,python,config,serialization,parser"
---

# toml Python Package Guide

## Golden Rule

Use the official `toml` package APIs:

- `toml.load()` to parse TOML from a file path, file object, or list of file paths
- `toml.loads()` to parse TOML from a string
- `toml.dump()` to write TOML to a writable file object
- `toml.dumps()` to produce a TOML string

As of March 13, 2026, PyPI still lists `0.10.2` as the latest release for `toml`.

This package does not need environment variables, authentication, or client initialization. Import the module and call its functions directly.

## Install

Create a virtual environment and pin the package version your project expects:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "toml==0.10.2"
```

Common alternatives:

```bash
uv add "toml==0.10.2"
poetry add "toml==0.10.2"
```

PyPI metadata for `0.10.2` declares `Python >=2.6` and excludes Python `3.0` through `3.2`. In modern projects, the practical question is whether you need `toml` at all:

- If you need both parsing and writing TOML, `toml` provides both.
- If you only need parsing on Python 3.11+, the standard library `tomllib` can parse TOML but does not write it.

## Initialize

There is no client object:

```python
import toml
```

If your app expects a specific mapping type, pass `_dict` when loading:

```python
from collections import OrderedDict
import toml

data = toml.loads(
    """
    [tool.black]
    line-length = 88
    """,
    _dict=OrderedDict,
)
```

## Parse TOML

### Parse a string

```python
import toml

toml_text = """
title = "demo"

[database]
server = "db.internal"
ports = [8001, 8002]
enabled = true
"""

data = toml.loads(toml_text)

print(data["title"])
print(data["database"]["server"])
```

### Parse a file path

```python
import toml

config = toml.load("pyproject.toml")
print(config["build-system"]["requires"])
```

### Parse an already opened file

```python
import toml

with open("settings.toml", "r", encoding="utf-8") as f:
    settings = toml.load(f)
```

### Parse multiple files into one object

`toml.load()` also accepts a list of file paths:

```python
import toml

config = toml.load(["base.toml", "local.toml"])
```

The maintainer API reference documents this as reading multiple TOML files into a single returned object. Do not assume comment, formatting, or source-file boundaries are preserved.

## Write TOML

### Serialize a Python object to a string

```python
import toml

payload = {
    "title": "demo",
    "database": {
        "server": "db.internal",
        "ports": [8001, 8002],
        "enabled": True,
    },
}

toml_text = toml.dumps(payload)
print(toml_text)
```

### Write TOML to a file

```python
import toml

payload = {
    "tool": {
        "pytest": {
            "ini_options": {
                "testpaths": ["tests"],
            }
        }
    }
}

with open("generated.toml", "w", encoding="utf-8") as f:
    toml.dump(payload, f)
```

`toml.dump()` writes to the file object and also returns the TOML string it wrote.

### Values the encoder handles directly

The encoder source handles these Python types directly:

- `str`
- `list`
- `bool`
- `int`
- `float`
- `decimal.Decimal`
- `datetime.datetime`
- `datetime.date`
- `datetime.time`
- nested `dict`-like objects

Example with dates and decimals:

```python
from datetime import date
from decimal import Decimal
import toml

payload = {
    "price": Decimal("19.99"),
    "released": date(2026, 3, 13),
}

print(toml.dumps(payload))
```

## Common Workflows

### Load, update, and write a TOML config file

```python
import toml

config = toml.load("pyproject.toml")
config.setdefault("tool", {})
config["tool"]["example"] = {"enabled": True, "retries": 3}

with open("pyproject.toml", "w", encoding="utf-8") as f:
    toml.dump(config, f)
```

### Serialize NumPy values

PyPI documents `TomlNumpyEncoder` for NumPy float and integer dtypes:

```python
import numpy as np
import toml

payload = {"values": np.arange(0, 3, dtype=np.double)}
toml_text = toml.dumps(payload, encoder=toml.TomlNumpyEncoder())
print(toml_text)
```

Without that encoder, the project description notes that NumPy float types are emitted as strings.

### Serialize `pathlib.Path` objects

The encoder module also includes `TomlPathlibEncoder`:

```python
from pathlib import Path
import toml
from toml.encoder import TomlPathlibEncoder

payload = {
    "paths": {
        "build_dir": Path("dist"),
        "config_file": Path("config/app.toml"),
    }
}

toml_text = toml.dumps(payload, encoder=TomlPathlibEncoder())
print(toml_text)
```

### Control array formatting

Use `TomlArraySeparatorEncoder` if you need a specific separator style in arrays:

```python
import toml
from toml.encoder import TomlArraySeparatorEncoder

payload = {"ports": [8001, 8002, 8003]}

toml_text = toml.dumps(
    payload,
    encoder=TomlArraySeparatorEncoder(separator=", "),
)
print(toml_text)
```

The encoder source only accepts separators composed of commas and whitespace. Other values raise `ValueError`.

## Common Pitfalls

- `toml.dump()` expects a writable file object, not a path string. `toml.dump(data, "file.toml")` raises `TypeError`; open the file first.
- `toml.loads()` only accepts a TOML string. Use `toml.load()` for file paths, file objects, or lists of paths.
- Re-serializing data does not preserve the original text layout. The PyPI quick tutorial shows arrays rewritten with trailing commas and datetime output rendered differently from the original input text.
- If your application only needs TOML parsing on Python 3.11+, `tomllib` is simpler and built in. Keep `toml` when you need write support or compatibility with an existing `toml`-based code path.

## Version Notes

- PyPI lists `0.10.2` as the latest release, published on November 1, 2020.
- The public API documented on PyPI for `0.10.2` is the four-function surface: `load`, `loads`, `dump`, and `dumps`.
- The package source also exposes encoder classes for specialized serialization, including NumPy arrays, custom array separators, inline-table preservation, comment preservation, and `pathlib.Path` values.

## Official Sources

- PyPI project page: https://pypi.org/project/toml/
- PyPI `0.10.2` page and API reference: https://pypi.org/project/toml/0.10.2/
- Maintainer repository: https://github.com/uiri/toml
- Encoder source: https://raw.githubusercontent.com/uiri/toml/master/toml/encoder.py
- Python `tomllib` docs: https://docs.python.org/3.11/library/tomllib.html
