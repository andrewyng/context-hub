---
name: package
description: "MkDocs package guide for building and deploying Markdown documentation sites from Python projects"
metadata:
  languages: "python"
  versions: "1.6.1"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "mkdocs,python,documentation,static-site,markdown"
---

# MkDocs Python Package Guide

## Golden Rule

Use MkDocs through a checked-in `mkdocs.yml` file and a `docs/` content directory, then preview with `mkdocs serve` and publish the generated `site/` output. MkDocs is a static site generator, not a runtime application framework: there is no client object to initialize and no package-specific auth flow.

## Install

Create a virtual environment and pin the version your project expects:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "mkdocs==1.6.1"
```

Common alternatives:

```bash
uv add --dev "mkdocs==1.6.1"
poetry add --group docs "mkdocs==1.6.1"
```

MkDocs does not require API keys, tokens, or service credentials for normal local use. The main configuration surface is `mkdocs.yml`; deployment credentials, if needed, come from your git host or CI platform rather than from MkDocs itself.

## Initialize A Project

Scaffold a new docs site:

```bash
mkdocs new mydocs
cd mydocs
mkdocs serve
```

This creates a small project like:

```text
mydocs/
  mkdocs.yml
  docs/
    index.md
```

`mkdocs serve` starts the development server and rebuilds the site when files change.

## Minimal Configuration

`mkdocs.yml`

```yaml
site_name: Example Docs
site_url: https://docs.example.com/
docs_dir: docs
site_dir: site

theme:
  name: mkdocs

nav:
  - Home: index.md
  - Getting Started: getting-started.md

plugins:
  - search
```

Add the referenced page:

`docs/getting-started.md`

```md
# Getting Started

Install the project dependencies, then run the app locally.
```

What these keys do:

- `site_name`: title shown in the generated site
- `site_url`: public base URL for the deployed docs site
- `docs_dir`: directory containing Markdown pages and static assets
- `site_dir`: output directory for generated HTML
- `theme.name`: active theme; MkDocs includes `mkdocs` and `readthedocs`
- `nav`: explicit page order and labels
- `plugins`: enabled plugins; `search` keeps the built-in search feature active

## Core Workflow

### Preview locally

```bash
mkdocs serve
```

Bind the dev server to a specific address if needed:

```bash
mkdocs serve -a 127.0.0.1:8000
```

### Build the static site

```bash
mkdocs build
```

For CI, prefer strict mode so warnings fail the build:

```bash
mkdocs build --strict
```

### Publish to GitHub Pages

```bash
mkdocs gh-deploy
```

Use `gh-deploy` only in a git repository with the correct remote configured. It publishes the generated site to the `gh-pages` branch.

## Common Configuration Options

These settings are the ones most projects reach for first:

- `nav`: define the left-nav or top-nav order instead of relying on file discovery
- `theme`: choose the built-in theme or an installed theme package
- `plugins`: enable search and any additional installed plugins
- `markdown_extensions`: turn on Python-Markdown extensions such as tables, admonitions, or table-of-contents links
- `repo_url` and `edit_uri`: link the deployed docs back to the source repository and edit page locations
- `extra_css` and `extra_javascript`: ship additional local static assets with the site

Example with a few common additions:

```yaml
site_name: Example Docs
site_url: https://docs.example.com/
repo_url: https://github.com/example/example-repo
edit_uri: edit/main/docs/

theme:
  name: readthedocs

plugins:
  - search

markdown_extensions:
  - admonition
  - tables
  - toc:
      permalink: true
```

## Common Pitfalls

- Do not treat `mkdocs serve` as a production web server. Deploy the generated `site/` output with your normal static hosting flow.
- If you set `plugins:` explicitly, keep `search` in the list if you still want the built-in search UI.
- When you define `nav`, every referenced Markdown file must exist under `docs_dir` or the build will fail.
- Do not hand-edit files under `site/`; they are generated artifacts and will be replaced on the next build.
- Theme packages and plugin packages are normal Python dependencies. Install them into the same environment as `mkdocs` before referencing them in `mkdocs.yml`.
- `mkdocs gh-deploy` assumes a git-based deployment flow. If your team deploys through another platform, use `mkdocs build` and publish the `site/` directory there instead.

## Official Sources

- MkDocs docs root: https://www.mkdocs.org/
- Getting started: https://www.mkdocs.org/getting-started/
- Installation guide: https://www.mkdocs.org/user-guide/installation/
- Writing your docs: https://www.mkdocs.org/user-guide/writing-your-docs/
- Configuration reference: https://www.mkdocs.org/user-guide/configuration/
- CLI reference: https://www.mkdocs.org/user-guide/cli/
- Deploying your docs: https://www.mkdocs.org/user-guide/deploying-your-docs/
- PyPI package page: https://pypi.org/project/mkdocs/
