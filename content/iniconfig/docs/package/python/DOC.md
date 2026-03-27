---
name: package
description: "iniconfig package guide for parsing INI-style config files in Python"
metadata:
  languages: "python"
  versions: "2.3.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "python,ini,config,parser,iniconfig"
---

# iniconfig Python Package Guide

## Install

`iniconfig 2.3.0` requires Python 3.10 or newer.

```bash
python -m pip install "iniconfig==2.3.0"
```

Common alternatives:

```bash
uv add "iniconfig==2.3.0"
poetry add "iniconfig==2.3.0"
```

`iniconfig` is a local parser library. There are no environment variables, network credentials, or service initialization steps.

## Import And Parse A File

Use `IniConfig.parse()` for new code on `2.3.0`. It is the new classmethod added in `2.3.0`, and its defaults are the safer ones for normal INI parsing.

```python
from pathlib import Path

from iniconfig import IniConfig

config_path = Path("pytest.ini")
ini = IniConfig.parse(config_path)
```

If the file is not UTF-8, pass an explicit encoding:

```python
from iniconfig import IniConfig

ini = IniConfig.parse("settings.ini", encoding="latin-1")
```

## Read Sections And Keys

Section values are strings. Access a section first, then its keys:

```python
from iniconfig import IniConfig

ini = IniConfig.parse("settings.ini")

db = ini["database"]
host = db["host"]
port = int(db["port"])
debug = ini["app"].get("debug", "false").lower() == "true"
```

For optional sections or keys, use `.get()` instead of direct indexing:

```python
from iniconfig import IniConfig

ini = IniConfig.parse("settings.ini")

server = ini.get("server")
timeout = server.get("timeout", "30") if server is not None else "30"
```

## Parse Config Text In Memory

Pass `data=` when the config content is already in memory. Keep the `path` argument meaningful so parse errors mention a useful filename.

```python
from iniconfig import IniConfig

raw = """
[tool]
name = demo
enabled = true
"""

ini = IniConfig.parse("inline.ini", data=raw)
name = ini["tool"]["name"]
enabled = ini["tool"]["enabled"] == "true"
```

## Inspect File Order And Line Numbers

`iniconfig` preserves section and key order, and exposes line numbers for parsed entries.

```python
from iniconfig import IniConfig

ini = IniConfig.parse("settings.ini")

for section in ini:
    print(section.name, ini.lineof(section.name))
    for key, value in section.items():
        print(" ", key, value, section.lineof(key))
```

That is useful when you want to surface validation errors back to a user with a stable file location.

## Error Handling

Invalid syntax and duplicate sections raise `ParseError`.

```python
from iniconfig import IniConfig, ParseError

try:
    ini = IniConfig.parse("settings.ini")
except ParseError as exc:
    print(f"Could not parse {exc}")
```

## Important Behavior In 2.3.0

`IniConfig.parse()` and the `IniConfig(...)` constructor do not use the same defaults.

For new code, prefer `IniConfig.parse()`:

```python
from iniconfig import IniConfig

ini = IniConfig.parse("settings.ini")
```

Use the constructor only when you intentionally need to control its legacy-compatible defaults:

```python
from iniconfig import IniConfig

ini = IniConfig(
    "settings.ini",
    strip_inline_comments=False,
    strip_section_whitespace=False,
)
```

The practical difference is that `IniConfig.parse()` defaults `strip_inline_comments=True`, while the constructor keeps `strip_inline_comments=False` for backward compatibility. If you move older code to `parse()`, re-check any values that intentionally included inline `#` or `;` text.

## Common Pitfalls

- `iniconfig` does not coerce types for you. Convert strings to `int`, `bool`, or other application types after reading them.
- Direct indexing like `ini["section"]["key"]` raises when the section or key is missing. Use `.get()` when the config is optional.
- Keep the `path` argument accurate when parsing in-memory data; it is used in parse error reporting.
- Be deliberate about inline comments when migrating older code. `IniConfig.parse()` strips them by default in `2.3.0`.

## Version Notes For 2.3.0

- `2.3.0` requires Python `>=3.10`.
- `2.3.0` adds `IniConfig.parse(path, data=None, encoding="utf-8")`.
- `2.3.0` also adds the `strip_inline_comments` and `strip_section_whitespace` constructor arguments. The constructor keeps the older inline-comment behavior by default; `parse()` opts into comment stripping by default.

## Official Sources

- GitHub repository: https://github.com/pytest-dev/iniconfig
- README and usage examples: https://github.com/pytest-dev/iniconfig/blob/main/README.rst
- Source API (`IniConfig`, `SectionWrapper`, `ParseError`): https://github.com/pytest-dev/iniconfig/blob/main/src/iniconfig/__init__.py
- Package metadata and Python requirement: https://github.com/pytest-dev/iniconfig/blob/main/pyproject.toml
- `2.3.0` release notes: https://github.com/pytest-dev/iniconfig/releases/tag/v2.3.0
- PyPI package page: https://pypi.org/project/iniconfig/
