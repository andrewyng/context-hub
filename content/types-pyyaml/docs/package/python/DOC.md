---
name: package
description: "types-PyYAML stub package for static typing of PyYAML in Python projects"
metadata:
  languages: "python"
  versions: "6.0.12.20250915"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typeshed,pyyaml,yaml,typing,mypy,pyright,python"
---

# types-PyYAML Python Package Guide

## What It Is

`types-PyYAML` is the typeshed stub package for the runtime package `PyYAML`.

- Install name: `types-PyYAML`
- Runtime package: `PyYAML`
- Runtime import: `import yaml`
- Covered runtime version in this stub release: `PyYAML 6.0.*`

This package is for static type checking only. It does not replace `PyYAML`, and it does not add a new runtime import.

## Install

Install the runtime package and the stub package into the same environment used by your type checker:

```bash
python -m pip install "PyYAML==6.0.3" "types-PyYAML==6.0.12.20250915"
```

If you use `mypy`, install it in that environment too:

```bash
python -m pip install mypy
python -m mypy app.py
```

If `mypy` reports missing stubs for `yaml`, its docs support:

```bash
python -m mypy --install-types
```

## Initialization And Setup

There are no environment variables, credentials, or client initialization steps.

The important setup rules are:

- keep using the runtime import `import yaml`
- install `types-PyYAML` where `mypy` or another PEP 561 type checker runs
- keep `PyYAML` and `types-PyYAML` aligned with the `PyYAML 6.0.*` line this stub release targets

Minimal example:

```python
from __future__ import annotations

from pathlib import Path
from typing import TypedDict, cast

import yaml


class AppConfig(TypedDict):
    debug: bool
    port: int


raw = yaml.safe_load(Path("config.yaml").read_text())
config = cast(AppConfig, raw)

print(config["port"])
```

The stubs give your checker signatures for `yaml` APIs, but YAML input is still dynamic. Keep using `TypedDict`, dataclass conversion, or explicit validation for application-specific shapes.

## Common Workflows

### Type-check existing PyYAML code

Your application code does not change:

```python
import yaml

document = """
debug: true
port: 8080
"""

data = yaml.safe_load(document)
print(data)
```

Install the stubs, then run your checker:

```bash
python -m mypy app.py
```

If you already use Pyright, install `types-PyYAML` in the project environment and run:

```bash
pyright app.py
```

### Keep YAML parsing on the safe APIs

The stub package tracks the `yaml` module, so normal `PyYAML` guidance still applies. Prefer the safe loader and dumper entry points in application code:

```python
import yaml

payload = yaml.safe_load("enabled: true\n")
text = yaml.safe_dump(payload, sort_keys=False)
```

### Add stubs as a development dependency

`types-PyYAML` is usually a dev-only dependency. Keep `PyYAML` in the runtime dependency set and keep the stub package in the environment used for CI and local type checking.

## Common Pitfalls

### Do Not Import The Stub Package

Use:

```python
import yaml
```

Do not try to import `types_pyyaml` or `types_PyYAML`. The stub package augments the `yaml` import that comes from `PyYAML`.

### The Stub Package Does Not Install PyYAML

You still need the runtime dependency:

```bash
python -m pip install PyYAML
```

### Install The Stubs In The Checker Environment

`mypy` only sees PEP 561 packages installed in the Python environment where `mypy` runs. If your editor or CI uses a different interpreter, install `types-PyYAML` there too.

### Stub-Only Packages Do Not Need `py.typed`

PEP 561 treats stub-only packages differently from inline-typed runtime packages. Do not look for a `py.typed` marker inside `PyYAML` when you are depending on `types-PyYAML`.

### Expect Broad Types Around Parsed YAML

The stubs improve editor support and type checking for the `yaml` API surface, but parsed YAML is still data-driven. For non-trivial schemas, you will still need casts or validation after `safe_load()`.

## Version-Sensitive Notes For 6.0.12.20250915

- PyPI describes this release as type stubs generated from typeshed for `PyYAML 6.0.*`.
- PyPI lists `Requires: Python >=3.9` for `types-PyYAML 6.0.12.20250915`.
- The PyPI page lists the checked type checkers for this release as `mypy 1.18.1` and `pyright 1.1.405`.
- If your project type-checks against a different `PyYAML` major or minor line, do not assume this stub release is the right match.

## Official Sources

- PyPI package page: https://pypi.org/project/types-PyYAML/
- typeshed README: https://github.com/python/typeshed/blob/main/README.md
- typeshed source repository: https://github.com/python/typeshed
- Typing spec for distributing type information: https://typing.python.org/en/latest/spec/distributing.html
- mypy docs on using installed packages: https://mypy.readthedocs.io/en/stable/installed_packages.html
- PyYAML package page: https://pypi.org/project/PyYAML/
