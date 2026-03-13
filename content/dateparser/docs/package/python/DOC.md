---
name: package
description: "dateparser package guide for parsing natural-language dates in Python applications"
metadata:
  languages: "python"
  versions: "1.3.0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "dateparser,python,date,time,parsing,localization"
---

# dateparser Python Package Guide

## Golden Rule

Use `dateparser.parse()` for simple user input, but pass explicit `languages`, `locales`, `date_formats`, and `settings` for any workflow that must be deterministic. Ambiguous strings such as `02-03-2016`, relative phrases such as `2 weeks ago`, and partial dates such as `March 2024` need explicit parsing rules.

## Install

Pin the version your project expects:

```bash
python -m pip install "dateparser==1.3.0"
```

Common alternatives:

```bash
uv add "dateparser==1.3.0"
poetry add "dateparser==1.3.0"
```

## Initialization

`dateparser` is a local Python library. It does not require authentication, API keys, environment variables, or client initialization.

Import the APIs you will usually need:

```python
from datetime import datetime, timezone

import dateparser
from dateparser import DateDataParser
from dateparser.search import search_dates
```

## Common Workflows

### Parse one date string

```python
import dateparser

parsed = dateparser.parse("March 5, 2024 4:30 PM")
if parsed is None:
    raise ValueError("Could not parse date")

print(parsed.isoformat())
```

`parse()` returns a `datetime.datetime` on success and `None` when parsing fails.

### Parse machine-formatted input with explicit rules

If the input shape is known, supply `date_formats` instead of relying only on auto-detection.

```python
import dateparser

parsed = dateparser.parse(
    "2024-03-05 16:30",
    date_formats=["%Y-%m-%d %H:%M"],
    languages=["en"],
    settings={
        "TIMEZONE": "UTC",
        "TO_TIMEZONE": "UTC",
        "RETURN_AS_TIMEZONE_AWARE": True,
    },
)

if parsed is None:
    raise ValueError("Could not parse timestamp")

print(parsed.isoformat())
```

### Parse relative dates against a fixed base time

Relative phrases depend on the current time unless you provide `RELATIVE_BASE`.

```python
from datetime import datetime, timezone

import dateparser

base = datetime(2024, 3, 15, 12, 0, tzinfo=timezone.utc)

parsed = dateparser.parse(
    "2 weeks ago",
    languages=["en"],
    settings={
        "RELATIVE_BASE": base,
        "TIMEZONE": "UTC",
        "TO_TIMEZONE": "UTC",
        "RETURN_AS_TIMEZONE_AWARE": True,
    },
)

if parsed is None:
    raise ValueError("Could not parse relative date")

print(parsed.isoformat())
```

### Keep the detected period and locale

Use `DateDataParser` when you need more than a single `datetime` value.

```python
from dateparser import DateDataParser

parser = DateDataParser(languages=["en"])
data = parser.get_date_data("March 2024")

print(data["date_obj"])
print(data["period"])
print(data["locale"])
```

`get_date_data()` keeps the parsed date together with the detected `period` and `locale`, which is useful when partial dates are acceptable in your application.

### Find dates inside larger text

```python
from datetime import datetime, timezone

from dateparser.search import search_dates

base = datetime(2024, 3, 15, 12, 0, tzinfo=timezone.utc)

matches = search_dates(
    "Invoice due next Friday. Send a reminder in 2 weeks.",
    languages=["en"],
    settings={"RELATIVE_BASE": base},
) or []

for matched_text, parsed_dt in matches:
    print(matched_text, parsed_dt.isoformat())
```

Use `search_dates()` when you need to extract multiple date expressions from a larger string instead of parsing one value at a time.

## Useful Settings

- `DATE_ORDER`: sets the expected component order for ambiguous numeric dates.
- `PREFER_DATES_FROM`: biases ambiguous dates toward the `past`, `future`, or `current_period`.
- `PREFER_DAY_OF_MONTH`: controls how incomplete dates are completed.
- `RELATIVE_BASE`: makes relative parsing deterministic.
- `STRICT_PARSING`: rejects inputs that cannot be parsed cleanly.
- `REQUIRE_PARTS`: requires specific date parts such as `day`, `month`, or `year`.
- `TIMEZONE`, `TO_TIMEZONE`, `RETURN_AS_TIMEZONE_AWARE`: make timezone handling explicit.

## Common Pitfalls

- Always handle the `None` case from `dateparser.parse()`.
- Do not rely on auto-detected language or locale for ambiguous production inputs; pass `languages` or `locales` explicitly.
- Do not rely on wall-clock time for tests or scheduled jobs that parse relative phrases; set `RELATIVE_BASE`.
- Partial dates may still produce a parsed result. Use `STRICT_PARSING` or `REQUIRE_PARTS` when incomplete input should fail.
- If downstream code expects timezone-aware values, set timezone-related settings explicitly instead of assuming the returned `datetime` matches your app default.
