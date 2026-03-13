---
name: package
description: "nbdev for building, testing, documenting, and packaging Python libraries from Jupyter notebooks"
metadata:
  languages: "python"
  versions: "3.0.12"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "nbdev,python,jupyter,notebooks,quarto,packaging,documentation"
---

# nbdev Python Package Guide

## What It Is

`nbdev` is notebook-first tooling for Python libraries. Use it when notebooks are the source of truth and you want a single workflow for exported Python modules, tests, and documentation.

## Install

Use a virtual environment and pin the package version your project expects:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "nbdev==3.0.12"
```

`nbdev`'s docs commands depend on Quarto. Install Quarto on any machine that will build or preview docs:

```bash
nbdev_install_quarto
```

Keep your notebook kernel in the same environment as `nbdev` and your package dependencies, otherwise notebook execution and local imports drift apart.

## Auth And Environment

`nbdev` is local project tooling. There is no API key, no service authentication flow, and no client object to initialize.

The important setup surfaces are:

- your Python environment
- the notebook kernel used by Jupyter
- Quarto for docs generation and preview
- `settings.ini` at the project root

## Start A New Project

Run `nbdev_new` in a new repository or empty project directory:

```bash
mkdir mylib
cd mylib
git init
nbdev_new
```

After scaffolding, review `settings.ini` before you export code or build docs. A minimal configuration looks like this:

```ini
[DEFAULT]
repo = mylib
lib_name = mylib
user = your-github-user
description = Notebook-first Python library
author = Your Name
author_email = you@example.com
branch = main
version = 0.0.1
nbs_path = nbs
lib_path = mylib
doc_path = _docs
```

Then install your package editable so exported modules are immediately importable while you work:

```bash
python -m pip install -e .
```

## Write Library Code In Notebooks

The standard pattern is:

1. keep source notebooks under `nbs/`
2. declare the target module with a `#| default_exp ...` directive
3. mark public code cells with `#| export`

Example notebook cells:

```python
#| default_exp core
```

```python
#| export
def say_hello(name: str) -> str:
    return f"Hello {name}"
```

`#| export` is the key directive here. If a cell is not exported, it stays notebook-only and does not become part of the generated Python package.

## Export And Import The Package

Export notebook code into Python modules:

```bash
nbdev_export
```

Then import the generated module normally:

```python
from mylib.core import say_hello

print(say_hello("nbdev"))
```

Edit the notebooks, not the generated `.py` files. Re-running export overwrites generated modules.

## Render API Docs In A Notebook

When you want rendered API docs inside notebook content, `show_doc` is the main helper:

```python
from nbdev.showdoc import show_doc
from mylib.core import say_hello

show_doc(say_hello)
```

This is useful when notebook content is also the source for published project docs.

## Core Commands

These are the commands most agents need in day-to-day use:

- `nbdev_new` to scaffold a new project
- `nbdev_export` to write exported notebook cells into Python modules
- `nbdev_test` to run the project's tests and notebook checks
- `nbdev_docs` to build docs
- `nbdev_preview` to preview docs locally
- `nbdev_clean` to strip notebook noise before committing
- `nbdev_prepare` when you want the standard combined prep step instead of running the main commands one by one

## Typical Workflow

```bash
nbdev_export
nbdev_test
nbdev_docs
```

For an edit-preview loop while authoring docs:

```bash
nbdev_preview
```

For a combined prep pass before committing or publishing:

```bash
nbdev_prepare
```

## Common Pitfalls

- If Quarto is missing, docs build and preview commands fail even if export works.
- If you forget `#| export`, your code never lands in the generated package.
- If you edit generated modules directly, those changes are lost the next time you export from notebooks.
- If your shell environment and notebook kernel use different Python environments, imports may work in one place and fail in the other.
- If you copy examples from older nbdev posts, verify the commands against current nbdev 3 docs before using them unchanged.

## Version-Sensitive Notes For 3.0.12

- `nbdev` 3 uses a Quarto-based docs workflow, so older pre-Quarto guidance is often stale.
- The main user-facing surface is the CLI plus notebook directives; most projects should not import `nbdev` into application runtime code.
- Treat `settings.ini` as part of the project's source of truth. If `lib_name`, paths, or repo metadata drift, exports and docs generation become confusing quickly.

## Official Sources

- nbdev docs: `https://nbdev.fast.ai/`
- PyPI: `https://pypi.org/project/nbdev/`
