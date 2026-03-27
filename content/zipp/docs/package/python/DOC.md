---
name: package
description: "zipp backport for pathlib-style traversal and I/O inside ZIP archives"
metadata:
  languages: "python"
  versions: "3.23.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "zipp,python,zip,zipfile,pathlib,archives"
---

# zipp Python Package Guide

## Golden Rule

Use `zipp.Path` when you need the maintained backport of `zipfile.Path` instead of hand-parsing ZIP member names. The maintainer README describes `zipp` as a backport of the latest `zipfile.Path` functionality, and the API follows the standard-library `zipfile.Path` interface.

## Install

`zipp` 3.23.0 on PyPI requires Python 3.9 or later.

```bash
python -m pip install "zipp==3.23.0"
```

Common alternatives:

```bash
uv add "zipp==3.23.0"
poetry add "zipp==3.23.0"
```

## Environment Variables And Authentication

None. `zipp` is a local Python library for working with ZIP archives and does not require API keys, tokens, or service configuration.

## Initialize A Path View Of A ZIP Archive

Construct `Path` from either an archive filename or an existing `zipfile.ZipFile` object.

```python
from zipp import Path

root = Path("example.zip")
```

```python
from zipfile import ZipFile
from zipp import Path

with ZipFile("example.zip") as zf:
    root = Path(zf)
    print(root.name)
```

If you already know the subdirectory you want inside the archive, pass `at=`:

```python
from zipp import Path

assets = Path("example.zip", at="assets/")
```

## Common Workflows

### List files and directories

`Path` behaves like a pathlib-style object over the archive contents.

```python
from zipp import Path

root = Path("example.zip")

for child in root.iterdir():
    kind = "dir" if child.is_dir() else "file"
    print(kind, child)
```

### Join paths and read text

Use `/` or `joinpath()` to navigate, then `read_text()` or `open()` to read file contents.

```python
from zipp import Path

root = Path("example.zip")
config_path = root / "config" / "settings.toml"

if config_path.exists() and config_path.is_file():
    text = config_path.read_text(encoding="utf-8")
    print(text)
```

Equivalent `joinpath()` form:

```python
from zipp import Path

root = Path("example.zip")
readme = root.joinpath("docs", "README.txt")

with readme.open("r", encoding="utf-8") as fp:
    print(fp.read())
```

### Read bytes

```python
from zipp import Path

data = (Path("example.zip") / "images" / "logo.png").read_bytes()
print(len(data))
```

### Write a new file into an archive

For writes, open the archive with `zipfile.ZipFile` in a write-capable mode and then wrap it with `Path`.

```python
from zipfile import ZipFile
from zipp import Path

with ZipFile("output.zip", mode="w") as zf:
    root = Path(zf)
    with (root / "hello.txt").open("w", encoding="utf-8") as fp:
        fp.write("hello from zipp\n")
```

### Use pathlib-style metadata helpers

The standard-library path helpers such as `name`, `suffix`, `stem`, `parent`, `exists()`, `is_dir()`, and `is_file()` are part of the interface.

```python
from zipp import Path

path = Path("example.zip") / "pkg" / "__init__.py"

print(path.name)      # __init__.py
print(path.suffix)    # .py
print(path.stem)      # __init__
print(path.parent)    # example.zip/pkg/
```

## Practical Pitfalls

- `zipp.Path` does not sanitize archive member names. The Python docs explicitly warn that filenames inside a ZIP archive can contain `..` segments or absolute paths. If you turn archive paths into filesystem paths, validate them first with `os.path.abspath()` and `os.path.commonpath()`.
- Prefer keyword arguments for text encoding: `read_text(encoding="utf-8")` and `open("r", encoding="utf-8")`. The Python docs note that passing `encoding` positionally is not compatible with some earlier Python 3.10 and 3.11 patch releases.
- Construct `Path` from an already-open `ZipFile` when you need write access. `Path("archive.zip")` is convenient for reads, but write mode depends on how the underlying `ZipFile` was opened.

## Version-Sensitive Notes

- PyPI metadata for `zipp` 3.23.0 requires Python `>=3.9`.
- The maintainer README includes a compatibility table showing that `zipp` regularly backports `zipfile.Path` improvements from newer CPython releases into older environments. Use the package when you need consistent ZIP-path behavior across Python versions instead of relying on the stdlib version available on a given interpreter.

## Official Sources

- Maintainer repository: https://github.com/jaraco/zipp
- PyPI package page: https://pypi.org/project/zipp/
- Python `zipfile.Path` documentation: https://docs.python.org/3/library/zipfile.html#path-objects
