---
name: package
description: "importlib-resources package guide for Python projects reading package data with the Traversable API"
metadata:
  languages: "python"
  versions: "6.5.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "python,resources,importlib,packaging,files"
---

# importlib-resources Python Package Guide

## Golden Rule

Use `importlib_resources.files()` as the default API for package data. Treat resources as package contents, not as paths computed from `__file__`.

This package has:

- No environment variables
- No client object or initialization step
- A different import name than its PyPI name: install `importlib-resources`, import `importlib_resources`

## Install

`importlib-resources 6.5.2` requires Python 3.9 or newer.

```bash
python -m pip install "importlib-resources==6.5.2"
```

Common alternatives:

```bash
uv add "importlib-resources==6.5.2"
poetry add "importlib-resources==6.5.2"
```

If your project only targets a recent CPython and does not need the backport package, you can often use the stdlib module instead:

```python
from importlib.resources import files, as_file
```

For code that should use the PyPI package explicitly:

```python
from importlib_resources import files, as_file
```

## Basic Pattern

Assume this package layout:

```text
myapp/
  data/
    defaults.json
    schema.sql
```

Read a text resource:

```python
from importlib_resources import files

defaults = files("myapp.data").joinpath("defaults.json").read_text(encoding="utf-8")
print(defaults)
```

Read bytes:

```python
from importlib_resources import files

payload = files("myapp.data").joinpath("schema.sql").read_bytes()
```

Use an imported module instead of a string if that is clearer in your app:

```python
import myapp.data
from importlib_resources import files

defaults_path = files(myapp.data).joinpath("defaults.json")
```

## When You Need A Real Filesystem Path

Resources may come from a wheel, a zip import, or another loader-backed source. If another API needs an actual `pathlib.Path`, wrap the resource with `as_file()`.

```python
from importlib_resources import as_file, files

resource = files("myapp.data").joinpath("schema.sql")

with as_file(resource) as schema_path:
    with schema_path.open("r", encoding="utf-8") as fh:
        sql = fh.read()
```

This is the direct replacement for older code that expected `pkg_resources.resource_filename()`.

## Directory Traversal

`files()` returns a `Traversable` object, so you can inspect package contents without assuming a normal on-disk directory.

```python
from importlib_resources import files

root = files("myapp.data")

for entry in root.iterdir():
    kind = "dir" if entry.is_dir() else "file"
    print(entry.name, kind)
```

Check for a specific resource before reading it:

```python
from importlib_resources import files

config = files("myapp.data").joinpath("defaults.json")

if config.is_file():
    settings_text = config.read_text(encoding="utf-8")
```

## Legacy Helper Functions

The package still exposes convenience helpers such as `read_text()`, `read_binary()`, `open_text()`, and `open_binary()`, but new code is usually clearer with `files()`.

```python
from importlib_resources import read_text

defaults = read_text("myapp.data", "defaults.json", encoding="utf-8")
```

For anything more complex than a single file read, switch back to `files()` and `Traversable`.

## Migration From `pkg_resources`

If you are replacing `setuptools.pkg_resources`, use these patterns:

- `pkg_resources.resource_filename(pkg, name)` -> `with as_file(files(pkg).joinpath(name)) as path:`
- `pkg_resources.resource_stream(pkg, name)` -> `files(pkg).joinpath(name).open("rb")`
- `pkg_resources.resource_string(pkg, name)` -> `files(pkg).joinpath(name).read_bytes()`
- `pkg_resources.resource_listdir(pkg, subdir)` -> `[entry.name for entry in files(pkg).joinpath(subdir).iterdir()]`

Example:

```python
from importlib_resources import as_file, files

template = files("myapp.data").joinpath("templates", "report.html")

with as_file(template) as path:
    render_report(path)
```

## Namespace Packages

Namespace packages are supported. The important restriction is that two distributions contributing to the same namespace must not publish resources with the same name in the same virtual location.

Keep namespace resource names unique across distributions or resource lookups become unsupported.

## Version-Sensitive Notes

- `6.5.2` is a `6.x` release line that requires Python 3.9+.
- The maintainers document `6.0` as the backport line aligned with Python 3.13 behavior.
- The stdlib `anchor` rename and omitted-anchor behavior were added later in CPython; the Python docs call out `importlib_resources >= 5.10` as the compatible interface for older interpreters.

For portable application code, pass the anchor explicitly:

```python
from importlib_resources import files

config = files("myapp.data").joinpath("defaults.json")
```

That avoids relying on caller inference if some environments still use the stdlib module on Python versions before 3.12.

## Common Pitfalls

- Install name and import name differ: `pip install importlib-resources`, but `import importlib_resources`.
- Do not build paths with `Path(__file__).parent / ...` for package data you intend to ship in wheels.
- Use `as_file()` only when another API truly needs a real path. For direct reads, prefer `read_text()`, `read_bytes()`, or `open()`.
- Do not assume resources live on a normal filesystem. `Traversable` is the supported abstraction.
- If you maintain a namespace package, avoid same-named resources across namespace portions.

## Official Sources

- Maintainer docs: https://importlib-resources.readthedocs.io/en/latest/
- Using the package: https://importlib-resources.readthedocs.io/en/latest/using.html
- Migration guide: https://importlib-resources.readthedocs.io/en/latest/migration.html
- Release history: https://importlib-resources.readthedocs.io/en/latest/history.html
- PyPI package page: https://pypi.org/project/importlib-resources/6.5.2/
- Python stdlib reference: https://docs.python.org/3/library/importlib.resources.html
