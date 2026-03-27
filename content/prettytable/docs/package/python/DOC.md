---
name: package
description: "PrettyTable package guide for building formatted text, HTML, JSON, CSV, LaTeX, and Markdown tables in Python"
metadata:
  languages: "python"
  versions: "3.17.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "prettytable,python,table,terminal,html,csv"
---

# PrettyTable Python Package Guide

## Golden Rule

Use the maintained `prettytable` package for rendering small tabular datasets in Python. It does not need credentials or environment variables; initialize a `PrettyTable` or `ColorTable` object in code and format the output you need.

## Install

`prettytable 3.17.0` requires Python 3.10 or newer.

```bash
python -m pip install "prettytable==3.17.0"
```

If you are adding it to a project dependency file:

```bash
uv add "prettytable==3.17.0"
poetry add "prettytable==3.17.0"
```

## Initialize A Table

```python
from prettytable import PrettyTable

table = PrettyTable()
table.field_names = ["name", "team", "points"]
table.add_row(["Ada", "red", 12])
table.add_row(["Lin", "blue", 8])

print(table)
```

You can also pass rows in one call:

```python
from prettytable import PrettyTable

table = PrettyTable()
table.field_names = ["name", "team", "points"]
table.add_rows(
    [
        ["Ada", "red", 12],
        ["Lin", "blue", 8],
        ["Sam", "red", 15],
    ]
)

print(table.get_string())
```

## Common Display Controls

Use table attributes when you want a persistent layout, or pass options to `get_string()` when the formatting is specific to one output.

```python
from prettytable import PrettyTable

table = PrettyTable()
table.field_names = ["name", "team", "points"]
table.add_rows(
    [
        ["Ada", "red", 12],
        ["Lin", "blue", 8],
        ["Sam", "red", 15],
    ]
)

table.align = {"name": "l", "team": "l", "points": "r"}
table.sortby = "points"
table.reversesort = True

print(table.get_string(fields=["name", "points"]))
```

Useful options from the maintainer docs:

- `fields`: choose a subset of columns for one render
- `start` and `end`: slice rows for one render
- `row_filter`: include only rows that match a predicate
- `sortby` and `reversesort`: sort at render time
- `align`: set left, center, or right alignment per column
- `max_width`: wrap wide content by column
- `none_format`: replace `None` values with a display string

`3.17.0` explicitly documents dictionary values for column-specific attributes, so patterns like `table.align = {"name": "l"}` and `table.none_format = {"points": "-"}` are part of the supported API.

## Import Data From CSV Or A DB Cursor

Build a table directly from a CSV reader target:

```python
from pathlib import Path

from prettytable import from_csv

with Path("scores.csv").open(newline="", encoding="utf-8") as fp:
    table = from_csv(fp)

print(table)
```

Build a table from a DB-API cursor after executing a query:

```python
import sqlite3

from prettytable import from_db_cursor

conn = sqlite3.connect(":memory:")
cur = conn.cursor()
cur.execute("CREATE TABLE users (id INTEGER, name TEXT)")
cur.executemany(
    "INSERT INTO users VALUES (?, ?)",
    [(1, "Ada"), (2, "Lin")],
)
cur.execute("SELECT id, name FROM users ORDER BY id")

table = from_db_cursor(cur)
print(table)
```

## Export Other Formats

PrettyTable can render more than plain terminal text.

### HTML

```python
from prettytable import PrettyTable

table = PrettyTable()
table.field_names = ["name", "team"]
table.add_row(["Ada", "red"])

html = table.get_html_string(format=True, attributes={"class": "scores"})
print(html)
```

### JSON

```python
from prettytable import PrettyTable

table = PrettyTable()
table.field_names = ["name", "points"]
table.add_rows([["Ada", 12], ["Lin", 8]])

json_text = table.get_json_string()
print(json_text)
```

### CSV, LaTeX, MediaWiki, Or Format-Selected Output

```python
from prettytable import PrettyTable

table = PrettyTable()
table.field_names = ["name", "points"]
table.add_rows([["Ada", 12], ["Lin", 8]])

print(table.get_formatted_string(out_format="csv"))
print(table.get_formatted_string(out_format="latex"))
print(table.get_mediawiki_string())
print(table.get_formatted_string(out_format="json"))
```

## Markdown And Table Styles

Use `TableStyle` when you need a specific border and separator layout.

```python
from prettytable import PrettyTable, TableStyle

table = PrettyTable()
table.field_names = ["name", "points"]
table.add_rows([["Ada", 12], ["Lin", 8]])

table.set_style(TableStyle.MARKDOWN)
print(table)
```

Other documented built-in styles include `DEFAULT`, `PLAIN_COLUMNS`, `MSWORD_FRIENDLY`, `ORGMODE`, `DOUBLE_BORDER`, and `SINGLE_BORDER`.

For ANSI-colored terminal output:

```python
from prettytable.colortable import ColorTable, Themes

table = ColorTable(theme=Themes.OCEAN)
table.field_names = ["service", "status"]
table.add_rows(
    [
        ["api", "ok"],
        ["worker", "degraded"],
    ]
)

print(table)
```

## Common Pitfalls

- `field_names` must match the number of values in each row. Mismatched row lengths raise errors.
- `sortby` must name an existing field, so set `field_names` before relying on sorting or field selection.
- HTML output escapes cell data by default. Only disable escaping if you are intentionally emitting trusted HTML.
- Rendering helpers like `get_html_string()` and `get_json_string()` return strings; they do not write files for you.
- PrettyTable is best for presentation, not large-data processing. Materialize and filter your data before formatting it into a table.

## Version-Sensitive Notes For 3.17.0

- `prettytable 3.17.0` raises the minimum supported Python version to 3.10 and adds Python 3.15 support.
- The `3.17.0` release notes call out improved support for dictionary values across column-specific attributes and additional docs around `none_format`.

## Official Sources

- Maintainer repository: https://github.com/jazzband/prettytable
- README and usage examples: https://github.com/jazzband/prettytable/blob/main/README.md
- `3.17.0` release notes: https://github.com/prettytable/prettytable/releases/tag/3.17.0
- PyPI package page: https://pypi.org/project/prettytable/
- PyPI version page for `3.17.0`: https://pypi.org/project/prettytable/3.17.0/
