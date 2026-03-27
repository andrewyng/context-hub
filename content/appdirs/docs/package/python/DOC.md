---
name: package
description: "appdirs package guide for Python projects that need platform-specific data, config, cache, state, and log directories"
metadata:
  languages: "python"
  versions: "1.4.4"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "appdirs,python,filesystem,xdg,windows,macos,linux"
---

# appdirs Python Package Guide

## Golden Rule

Use `appdirs` to compute platform-specific directories instead of hardcoding paths like `~/.config` or `%APPDATA%`. The upstream repository marks `appdirs` as deprecated and recommends `platformdirs` for new work, but projects already pinned to `appdirs==1.4.4` should use the official helpers below rather than inventing their own path rules.

## Install

Pin the package version your project expects:

```bash
python -m pip install "appdirs==1.4.4"
```

`appdirs` does not require authentication, network setup, or a client object. Import the helpers and pass your application name, and optionally the app author and version.

## Initialize

The simplest pattern is to create one `AppDirs` object and reuse its properties:

```python
from pathlib import Path

from appdirs import AppDirs

dirs = AppDirs(appname="ExampleApp", appauthor="Acme", version="1.0")

config_dir = Path(dirs.user_config_dir)
config_dir.mkdir(parents=True, exist_ok=True)

settings_path = config_dir / "settings.json"
print(settings_path)
```

`AppDirs` exposes these properties from the underlying helpers:

- `user_data_dir`
- `site_data_dir`
- `user_config_dir`
- `site_config_dir`
- `user_cache_dir`
- `user_state_dir`
- `user_log_dir`

If you prefer function calls instead of a reusable object:

```python
from appdirs import user_cache_dir, user_config_dir, user_data_dir

APP_NAME = "ExampleApp"
APP_AUTHOR = "Acme"
VERSION = "1.0"

print(user_data_dir(APP_NAME, APP_AUTHOR, VERSION))
print(user_config_dir(APP_NAME, APP_AUTHOR, VERSION))
print(user_cache_dir(APP_NAME, APP_AUTHOR, VERSION))
```

## Environment Variables On Linux And Other Unix-Like Systems

On Unix-like systems, `appdirs` follows the XDG base directory variables when they are set:

```bash
export XDG_DATA_HOME="$HOME/.local/share"
export XDG_CONFIG_HOME="$HOME/.config"
export XDG_CACHE_HOME="$HOME/.cache"
export XDG_STATE_HOME="$HOME/.local/state"
export XDG_DATA_DIRS="/usr/local/share:/usr/share"
export XDG_CONFIG_DIRS="/etc/xdg"
```

If these variables are not set, `appdirs` falls back to the usual defaults shown above.

## Common Workflows

### Store per-user app data

Use `user_data_dir()` for files your app owns for one user, such as databases, downloaded assets, or durable state:

```python
from pathlib import Path

from appdirs import user_data_dir

data_dir = Path(user_data_dir("ExampleApp", "Acme", version="1.0"))
data_dir.mkdir(parents=True, exist_ok=True)

db_path = data_dir / "app.db"
print(db_path)
```

On Windows, set `roaming=True` when the data should follow a roaming profile:

```python
from appdirs import user_data_dir

profile_data_dir = user_data_dir(
    "ExampleApp",
    "Acme",
    version="1.0",
    roaming=True,
)
```

### Store user config separately from data

Use `user_config_dir()` for editable settings and user-managed configuration files:

```python
from pathlib import Path
import json

from appdirs import user_config_dir

config_dir = Path(user_config_dir("ExampleApp", "Acme", version="1.0"))
config_dir.mkdir(parents=True, exist_ok=True)

config_path = config_dir / "settings.json"
config_path.write_text(json.dumps({"theme": "dark"}, indent=2) + "\n")
```

### Keep caches and logs out of config/data directories

`user_cache_dir()` and `user_log_dir()` are the right targets for disposable files:

```python
from pathlib import Path

from appdirs import user_cache_dir, user_log_dir

cache_dir = Path(user_cache_dir("ExampleApp", "Acme", version="1.0"))
log_dir = Path(user_log_dir("ExampleApp", "Acme", version="1.0"))

cache_dir.mkdir(parents=True, exist_ok=True)
log_dir.mkdir(parents=True, exist_ok=True)

(cache_dir / "response-cache.json").write_text("{}\n")
(log_dir / "app.log").write_text("started\n")
```

By default, `appdirs` adds opinionated subdirectories for some platforms:

- `user_cache_dir(..., opinion=True)` may append a `Cache` segment on Windows
- `user_log_dir(..., opinion=True)` may append `Logs` on macOS and a `log` subdirectory on Unix

Disable that extra suffix if you want the base directory only:

```python
from appdirs import user_cache_dir, user_log_dir

print(user_cache_dir("ExampleApp", "Acme", opinion=False))
print(user_log_dir("ExampleApp", "Acme", opinion=False))
```

### Separate runtime state from durable data

`user_state_dir()` is useful on Unix-like systems when you want XDG state files instead of mixing them into data or config:

```python
from pathlib import Path

from appdirs import user_state_dir

state_dir = Path(user_state_dir("ExampleApp", "Acme", version="1.0"))
state_dir.mkdir(parents=True, exist_ok=True)

cursor_path = state_dir / "cursor.txt"
cursor_path.write_text("42\n")
```

On Windows and macOS, `user_state_dir()` resolves to the same location as `user_data_dir()`.

### Read shared config or shared data paths

Use `site_data_dir()` and `site_config_dir()` for machine-wide locations. On Unix, `multipath=True` returns every configured directory joined by `os.pathsep`:

```python
import os
from pathlib import Path

from appdirs import site_config_dir

raw_value = site_config_dir("ExampleApp", "Acme", version="1.0", multipath=True)
search_paths = [Path(p) for p in raw_value.split(os.pathsep)]

for path in search_paths:
    print(path)
```

## Important Pitfalls

- `appdirs` returns path strings only. It does not create directories for you, so call `Path(...).mkdir(parents=True, exist_ok=True)` before writing files.
- `appauthor` matters primarily on Windows. If you do not want an author/company segment in the Windows path, pass `appauthor=False`.
- `version` becomes another path segment. Omit it if your config and data should stay in a versionless directory.
- `appname=None` returns the base system directory without adding an application subdirectory.
- The source code explicitly warns against using `site_data_dir()` and `site_config_dir()` as write targets on Windows because of `ProgramData` behavior on newer Windows versions.
- `multipath=True` only changes the site-directory helpers on Unix-like systems. On Windows and macOS you still get one path string.

## Official Sources

- Maintainer repository: https://github.com/ActiveState/appdirs
- README and usage examples: https://github.com/ActiveState/appdirs/blob/master/README.rst
- Source implementation (`appdirs.py`): https://github.com/ActiveState/appdirs/blob/master/appdirs.py
- PyPI package page: https://pypi.org/project/appdirs/
