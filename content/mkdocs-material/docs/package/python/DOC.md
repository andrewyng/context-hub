---
name: package
description: "Material for MkDocs package guide for building and customizing MkDocs documentation sites"
metadata:
  languages: "python"
  versions: "9.7.5"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "mkdocs-material,mkdocs,python,documentation,static-site,theme"
---

# Material for MkDocs Python Package Guide

## Golden Rule

`mkdocs-material` is the Material theme package for MkDocs. Configure it in `mkdocs.yml` with `theme.name: material`, and do normal development through the `mkdocs` CLI. For standard usage there is no Python import, client object, or API key.

## Install

Install the theme into the same Python environment that will run `mkdocs`:

```bash
python -m pip install "mkdocs-material==9.7.5"
```

Confirm the CLI is available:

```bash
mkdocs --version
```

## No Auth Or Environment Variables

Material for MkDocs does not require service credentials for normal use.

- No API key or token is required.
- No Python initialization step is required.
- Day-to-day setup lives in `mkdocs.yml` and the `docs/` directory.

## Start A New Site

Create a new MkDocs project, then switch the theme to Material:

```bash
mkdocs new my-docs
cd my-docs
```

Minimal `mkdocs.yml`:

```yaml
site_name: My Docs
theme:
  name: material
plugins:
  - search
nav:
  - Home: index.md
```

Minimal `docs/index.md`:

```md
# My Docs

Welcome to the project documentation.
```

Run the local development server:

```bash
mkdocs serve
```

Build the static site:

```bash
mkdocs build
```

## Common Configuration

### Enable common Material features

Put Material-specific UI options under `theme.features`:

```yaml
site_name: My Docs
theme:
  name: material
  features:
    - navigation.tabs
    - navigation.sections
    - content.code.copy
  palette:
    primary: indigo
    accent: indigo
```

This is the normal place to enable navigation behaviors, code-copy buttons, and theme colors.

### Enable Markdown extensions for Material components

Many Material components depend on Python Markdown and `pymdown-extensions` settings. If you want admonitions, expandable blocks, or tabbed content, enable the matching extensions explicitly:

```yaml
markdown_extensions:
  - admonition
  - pymdownx.details
  - pymdownx.superfences
  - pymdownx.tabbed:
      alternate_style: true
```

Example Markdown that uses those extensions:

````markdown
!!! note
    Material components render correctly only when the related Markdown extensions are enabled.

=== "Python"

    ```python
    print("hello")
    ```

=== "Bash"

    ```bash
    echo "hello"
    ```
````

If you add Material-specific markup without the corresponding extensions, the page usually renders the raw syntax instead of the intended component.

### Add custom CSS, JavaScript, and theme overrides

Use `extra_css` and `extra_javascript` for static assets, and `theme.custom_dir` for template overrides:

```yaml
theme:
  name: material
  custom_dir: overrides

extra_css:
  - stylesheets/extra.css

extra_javascript:
  - javascripts/extra.js
```

Typical project layout:

```text
my-docs/
  docs/
    index.md
    stylesheets/
      extra.css
    javascripts/
      extra.js
  overrides/
    main.html
  mkdocs.yml
```

Keep static assets under `docs/` so MkDocs copies them into the built site. Use `overrides/` only for theme template overrides.

## Common Commands

```bash
mkdocs serve
mkdocs build
mkdocs build --clean
```

Use `mkdocs serve` for local iteration and `mkdocs build` in CI or deployment jobs.

## Common Pitfalls

- Set `theme.name: material`, not `theme.name: mkdocs-material`.
- Keep using the `mkdocs` CLI after installation; `mkdocs-material` is not a separate executable.
- Enable the matching `markdown_extensions` for any Material component syntax you add to content.
- Put template overrides in the directory referenced by `theme.custom_dir`, but keep CSS and JavaScript files inside `docs/` and reference them with `extra_css` and `extra_javascript`.
- Install the package into the same environment that runs the docs build, especially in CI or containerized deploys.

## Official Sources

- Maintainer docs home: `https://squidfunk.github.io/mkdocs-material/`
- Getting started: `https://squidfunk.github.io/mkdocs-material/getting-started/`
- Setup and configuration: `https://squidfunk.github.io/mkdocs-material/setup/`
- Python Markdown extensions: `https://squidfunk.github.io/mkdocs-material/setup/extensions/python-markdown/`
- Component reference: `https://squidfunk.github.io/mkdocs-material/reference/`
- PyPI release page: `https://pypi.org/project/mkdocs-material/9.7.5/`
