---
name: package
description: "Read the Docs Sphinx theme package guide for Python documentation projects"
metadata:
  languages: "python"
  versions: "3.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "sphinx,readthedocs,theme,docs,python"
---

# sphinx-rtd-theme Python Package Guide

## Golden Rule

Use the PyPI package `sphinx-rtd-theme`, but configure it in Sphinx as `sphinx_rtd_theme`.

- Install name: `sphinx-rtd-theme`
- Sphinx extension name: `sphinx_rtd_theme`
- Theme name in `conf.py`: `sphinx_rtd_theme`

For `3.1.0`, the maintainer docs list support for Python 3.8+, Sphinx 6+, and docutils `>0.18, <0.23`.

## Install

No environment variables or authentication are required. This package only changes HTML output for a Sphinx docs build.

If you are pinning the version documented here:

```bash
python -m pip install "Sphinx>=6" "sphinx-rtd-theme==3.1.0"
```

If your project already pins Sphinx separately, add just the theme:

```bash
python -m pip install "sphinx-rtd-theme==3.1.0"
```

## Minimal Sphinx Setup

Add the theme to `docs/conf.py`:

```python
# docs/conf.py
extensions = [
    "sphinx_rtd_theme",
]

html_theme = "sphinx_rtd_theme"
```

The theme docs explicitly recommend adding `sphinx_rtd_theme` to `extensions` because it activates `sphinxcontrib-jquery`, which the theme still uses for search, smooth scrolling, and the flyout menu.

Build the HTML output:

```bash
sphinx-build -b html docs docs/_build/html
```

## Common Theme Configuration

Start from a small `html_theme_options` block and only add options you need:

```python
# docs/conf.py
html_theme = "sphinx_rtd_theme"
html_theme_options = {
    "logo_only": True,
    "collapse_navigation": False,
    "navigation_depth": 4,
    "sticky_navigation": True,
    "includehidden": True,
    "titles_only": False,
    "prev_next_buttons_location": "bottom",
    "style_external_links": True,
    "style_nav_header_background": "#2980B9",
}
```

Options that matter most in practice:

- `navigation_depth`: controls how many heading levels appear in the left nav. `-1` means unlimited depth.
- `collapse_navigation`: when `False`, nested sections stay expanded instead of collapsing to the current branch.
- `sticky_navigation`: keeps the left nav fixed while scrolling.
- `prev_next_buttons_location`: `bottom`, `top`, `both`, or `None`.
- `style_external_links`: adds an external-link icon style.
- `logo_only`: shows the logo without repeating the project name in the sidebar.

If you want a logo, set Sphinx's standard `html_logo` option:

```python
html_logo = "_static/logo.svg"
```

## Read the Docs Selectors

The theme exposes `version_selector` and `language_selector`, but the maintainer docs state these only work for documentation hosted or served on Read the Docs.

```python
html_theme_options = {
    "version_selector": True,
    "language_selector": True,
}
```

Do not expect those selectors to appear in a plain local `sphinx-build` output unless your docs are being served by Read the Docs with its Addons integration.

## Repository Links And Page Metadata

For repository links in the upper-right corner, use `html_context` with the keys documented by the theme:

```python
html_context = {
    "display_github": True,
    "github_user": "acme",
    "github_repo": "my-project",
    "github_version": "main",
    "conf_py_path": "/docs/",
}
```

The theme also supports file-wide metadata keys such as `github_url`, `gitlab_url`, and `bitbucket_url` when you need a per-page override.

## Common Pitfalls

- Do not copy old examples that import `sphinx_rtd_theme` and set `html_theme_path`. Current docs only require `extensions` plus `html_theme`, and the 3.x changelog says defining `html_theme_path` now raises a warning.
- The package name uses dashes, but Sphinx config uses underscores. `pip install sphinx-rtd-theme` is correct; `html_theme = "sphinx_rtd_theme"` is also correct.
- If you skip `extensions = ["sphinx_rtd_theme"]`, the theme's jQuery-dependent features are not activated correctly.
- `version_selector` and `language_selector` are not general-purpose local widgets. They are documented as Read the Docs-only features.
- `analytics_id` and `analytics_anonymize_ip` are deprecated in 3.x. Use `sphinxcontrib-googleanalytics` instead of adding those theme options to new configs.
- `flyout_display: "attached"` requires disabling the default Read the Docs flyout, otherwise you can end up with duplicated flyout UI.

## Version-Sensitive Notes For 3.1.0

- `3.1.0` was released on September 17, 2024.
- The `3.1.0` changelog adds support for docutils `0.22` and Sphinx `9.x`.
- The broader support matrix in the maintainer docs still lists Python 3.8+, Sphinx 6+, and docutils `>0.18, <0.23`.

## Official Sources

- PyPI package: https://pypi.org/project/sphinx-rtd-theme/
- Install guide: https://sphinx-rtd-theme.readthedocs.io/en/stable/installing.html
- Configuration guide: https://sphinx-rtd-theme.readthedocs.io/en/stable/configuring.html
- Changelog: https://sphinx-rtd-theme.readthedocs.io/en/stable/changelog.html
- Supported dependencies: https://sphinx-rtd-theme.readthedocs.io/en/stable/development.html
- Sphinx HTML config reference: https://www.sphinx-doc.org/en/master/usage/configuration.html
