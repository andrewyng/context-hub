---
name: package
description: "pdoc package guide for generating API documentation from Python modules and docstrings"
metadata:
  languages: "python"
  versions: "16.0.0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "pdoc,python,documentation,docstrings,api-docs"
---

# pdoc Python Package Guide

## When To Use pdoc

Use `pdoc` when you want API documentation generated directly from importable Python modules and their docstrings. It works well for libraries and internal packages where the public API already lives in code and you want a simple HTML output without a larger docs stack.

`pdoc` runs locally against your source tree. There are no service credentials or remote API keys to configure.

## Install

Create an environment and install the version your project expects:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "pdoc==16.0.0"
```

If you are documenting a local package, make sure that package is importable before you run `pdoc`:

```bash
python -m pip install -e .
```

For a `src/` layout, setting `PYTHONPATH` is the simplest option when you do not want an editable install:

```bash
export PYTHONPATH="$PWD/src"
```

## Minimal Package Layout

`pdoc` reads docstrings from importable modules. A minimal package looks like this:

```text
example_pkg/
  __init__.py
  math_utils.py
```

```python
# example_pkg/__init__.py
"""Example package used for pdoc generation."""

from .math_utils import add

__all__ = ["add"]
```

```python
# example_pkg/math_utils.py
"""Small math helpers."""

def add(left: int, right: int) -> int:
    """Return the sum of two integers."""
    return left + right
```

## Preview Docs Locally

Use the package import path you want to document:

```bash
export PYTHONPATH="$PWD"
pdoc example_pkg
```

This is the quickest way to check whether `pdoc` can import the package cleanly and whether module, class, and function docstrings render the way you expect.

If your code lives under `src/`, use that directory instead:

```bash
export PYTHONPATH="$PWD/src"
pdoc example_pkg
```

## Generate Static HTML

Write the generated documentation to an output directory:

```bash
export PYTHONPATH="$PWD/src"
pdoc example_pkg -o docs/api
```

That pattern works well in CI, release automation, or a docs publish step.

## Generate Docs From Python

Use the Python API when you want docs generation inside a build script or task runner:

```python
from pathlib import Path

import pdoc

pdoc.pdoc("example_pkg", output_directory=Path("docs/api"))
```

This is the core programmatic entry point to copy into an application or automation script.

## Common Workflow For A Library Repo

1. Put public modules and functions behind stable import paths.
2. Add docstrings to packages, modules, classes, and functions.
3. Make the package importable with `pip install -e .` or `PYTHONPATH`.
4. Run `pdoc your_package -o docs/api`.
5. Publish the generated HTML from your docs or static-site pipeline.

## Important Pitfalls

### Your package must import cleanly

`pdoc` inspects real Python modules, so import failures stop documentation generation. Run it in the same environment your package expects, and install optional dependencies that are imported at module import time.

### Import side effects show up during docs generation

If a module opens network connections, reads unavailable files, or depends on missing environment variables at import time, docs generation can fail. Keep import-time side effects minimal and move runtime setup behind functions or `if __name__ == "__main__":` blocks.

### The import path matters

If `pdoc` cannot resolve `example_pkg`, either install the package editable or set `PYTHONPATH` to the directory that contains the package root:

```bash
python -m pip install -e .
```

or:

```bash
export PYTHONPATH="$PWD/src"
```

### Document the public API you actually export

If your package re-exports functions or classes from submodules, keep those imports explicit in the package namespace you want users to see. `pdoc` is easiest to work with when the documented public surface is importable directly.

## Practical CI Step

```bash
python -m pip install --upgrade pip
python -m pip install -e . "pdoc==16.0.0"
pdoc example_pkg -o docs/api
```

Use the same package import path here that your users import in code.

## Official Sources

- Maintainer docs: `https://pdoc.dev/docs/pdoc.html`
- PyPI package page: `https://pypi.org/project/pdoc/`
