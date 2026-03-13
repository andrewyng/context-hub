---
name: package
description: "Sphinx package guide for building Python project documentation and API references"
metadata:
  languages: "python"
  versions: "9.1.0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "sphinx,python,documentation,autodoc,docs"
---

# Sphinx Python Package Guide

## Golden Rule

Use Sphinx as a build tool for checked-in documentation, with project configuration in `docs/conf.py` and repeatable builds through `sphinx-build`. For Python API docs, treat `sphinx.ext.autodoc` as an import-time integration: the package being documented and its import-time dependencies must be available in the same environment as Sphinx.

Sphinx works with reStructuredText out of the box. If your project prefers Markdown, add a parser extension explicitly instead of assuming Sphinx reads Markdown by default.

## Install

Create a virtual environment and pin the version your project expects:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "sphinx==9.1.0"
```

Common alternatives:

```bash
uv add --dev "sphinx==9.1.0"
poetry add --group docs "sphinx==9.1.0"
```

Sphinx does not use API keys, tokens, or service credentials. The main configuration surface is `docs/conf.py` plus the extensions you enable there.

## Minimal Project Layout

This is a small layout that works well for package docs and autodoc-based API references:

```text
your-project/
  docs/
    conf.py
    index.rst
    api.rst
  src/
    example_pkg/
      __init__.py
      api.py
```

You can scaffold a docs directory with `sphinx-quickstart`, or create the files directly.

## Minimal Configuration

`docs/conf.py`

```python
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

project = "Example Package"
author = "Your Team"
release = "0.1.0"
root_doc = "index"

extensions = [
    "sphinx.ext.autodoc",
    "sphinx.ext.napoleon",
    "sphinx.ext.intersphinx",
]

templates_path = ["_templates"]
exclude_patterns = ["_build", "Thumbs.db", ".DS_Store"]

html_theme = "alabaster"

intersphinx_mapping = {
    "python": ("https://docs.python.org/3", None),
}
```

Why this config matters:

- `sys.path.insert(...)` makes a `src/` layout importable for autodoc
- `sphinx.ext.autodoc` pulls API documentation from Python objects and docstrings
- `sphinx.ext.napoleon` lets Sphinx read Google-style and NumPy-style docstrings
- `sphinx.ext.intersphinx` enables cross-project references such as Python standard library types

## Write Pages And API Docs

`src/example_pkg/api.py`

```python
def greet(name: str) -> str:
    """Return a greeting.

    Args:
        name: Person or system name.

    Returns:
        Greeting text.
    """
    return f"Hello, {name}!"
```

`docs/index.rst`

```rst
Example Package
===============

.. toctree::
   :maxdepth: 2

   api
```

`docs/api.rst`

```rst
API Reference
=============

.. automodule:: example_pkg.api
   :members:
   :undoc-members:
```

Build the HTML output:

```bash
sphinx-build -b html docs docs/_build/html
```

Open `docs/_build/html/index.html` in a browser to inspect the generated site.

## Common Workflows

### Generate API stub files from a package

If you want Sphinx to generate `.rst` stubs for a package tree, use `sphinx-apidoc`:

```bash
sphinx-apidoc -o docs/reference src/example_pkg
```

That command writes reStructuredText files under `docs/reference/`. Add the generated `modules` page, or individual generated pages, to your `toctree`.

### Make warnings fail CI

Sphinx does not fail the build on ordinary warnings unless you ask it to. For CI, use `-W` and keep building long enough to collect the full warning set:

```bash
sphinx-build -W --keep-going -b html docs docs/_build/html
```

### Check external links

Use the `linkcheck` builder separately from normal HTML builds:

```bash
sphinx-build -b linkcheck docs docs/_build/linkcheck
```

### Cross-reference Python docs

With `intersphinx_mapping` configured, you can reference external objects directly in reStructuredText:

```rst
See :py:class:`pathlib.Path` for path handling.
```

## Common Pitfalls

### `autodoc` imports your code

`sphinx.ext.autodoc` imports the documented modules during the build. If module import has side effects, reaches for unavailable services, or depends on optional packages that are missing in the docs environment, the build can fail.

Practical fixes:

- keep import-time side effects out of module top level
- install your package and docs dependencies into the same virtual environment
- if needed, mock unavailable imports with `autodoc_mock_imports` in `conf.py`

### `src/` layouts need an import path or editable install

If your package lives under `src/`, autodoc will not find it unless you either:

- add the `src` directory to `sys.path` in `conf.py`, or
- install the package into the docs environment, usually with `python -m pip install -e .`

Without one of those, `.. automodule:: your_package.module` usually fails with an import error.

### Markdown is not built in

Sphinx reads reStructuredText directly. Markdown support requires an additional parser extension. If you add Markdown source files without a parser, Sphinx will not treat them as documentation pages.

### Third-party themes are separate packages

Themes such as `furo` or `sphinx-rtd-theme` are not part of the `sphinx` package itself. Install them separately and set `html_theme` only after the theme package is present in the docs environment.

### `make html` is just a wrapper

Projects created with `sphinx-quickstart` usually include `Makefile` and `make.bat` helpers, but the underlying command is still `sphinx-build`. In CI and automation, use `sphinx-build` directly so the invoked builder and output path are explicit.

## Version-Sensitive Notes For 9.1.0

- This guide pins `sphinx==9.1.0`, while the official docs root for current guidance is the rolling `master` documentation tree. If your project is strictly pinned, check the Sphinx release notes before relying on behavior added after 9.1.0.
- Prefer `root_doc` in new configuration examples. Older posts and snippets may still use the legacy `master_doc` name.
- The core command-line tools remain `sphinx-build`, `sphinx-quickstart`, and `sphinx-apidoc`; older examples that shell out through wrappers are usually just convenience layers over those commands.

## Official Sources

- Docs root: `https://www.sphinx-doc.org/en/master/`
- Quickstart: `https://www.sphinx-doc.org/en/master/usage/quickstart.html`
- Configuration: `https://www.sphinx-doc.org/en/master/usage/configuration.html`
- reStructuredText primer: `https://www.sphinx-doc.org/en/master/usage/restructuredtext/basics.html`
- `autodoc`: `https://www.sphinx-doc.org/en/master/usage/extensions/autodoc.html`
- `napoleon`: `https://www.sphinx-doc.org/en/master/usage/extensions/napoleon.html`
- `intersphinx`: `https://www.sphinx-doc.org/en/master/usage/extensions/intersphinx.html`
- `sphinx-build`: `https://www.sphinx-doc.org/en/master/man/sphinx-build.html`
- `sphinx-apidoc`: `https://www.sphinx-doc.org/en/master/man/sphinx-apidoc.html`
- PyPI package page: `https://pypi.org/project/sphinx/9.1.0/`
