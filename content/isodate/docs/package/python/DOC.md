---
name: package
description: "Python ISO 8601 parsing and formatting helpers for dates, times, datetimes, durations, and time zones"
metadata:
  languages: "python"
  versions: "0.7.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "isodate,python,iso8601,date,time,datetime,duration"
---

# isodate Python Package Guide

## Golden Rule

Use `isodate` when you need ISO 8601 parsing and formatting with standard Python date/time types. It is a pure library package:

- no environment variables
- no API keys
- no client initialization

Import the parsing and formatting helpers directly in the module where you need them.

## Install

Pin the package version your project expects:

```bash
python -m pip install "isodate==0.7.2"
```

Common alternatives:

```bash
uv add "isodate==0.7.2"
poetry add "isodate==0.7.2"
```

`isodate 0.7.2` requires Python 3.7 or newer.

## Parse ISO 8601 Values

Use the top-level helpers for the common parsing cases:

```python
import isodate

invoice_date = isodate.parse_date("2026-03-13")
cutoff_time = isodate.parse_time("14:30:00Z")
published_at = isodate.parse_datetime("2026-03-13T14:30:00+00:00")
tzinfo = isodate.parse_tzinfo("+05:30")

print(invoice_date.year)
print(cutoff_time.tzinfo)
print(published_at.utcoffset())
print(tzinfo.utcoffset(None))
```

`parse_date`, `parse_time`, and `parse_datetime` return standard library `date`, `time`, and `datetime` objects. `parse_tzinfo` returns a `tzinfo` object for the offset portion of an ISO 8601 string.

## Parse Durations

`parse_duration()` returns either a `datetime.timedelta` or an `isodate.duration.Duration` depending on the input.

If the duration has only weeks, days, hours, minutes, or seconds, you usually get a `timedelta`:

```python
import isodate

duration = isodate.parse_duration("PT90M")

print(type(duration).__name__)
print(duration.total_seconds())
```

If the string includes years or months, use `Duration` semantics:

```python
import isodate

duration = isodate.parse_duration("P1Y2M3DT4H")

print(type(duration).__name__)
print(duration.years)
print(duration.months)
print(duration.days)
```

Version `0.7.2` also lets you force a `Duration` result even when a `timedelta` would be possible:

```python
import isodate

duration = isodate.parse_duration(
    "PT90M",
    as_timedelta_if_possible=False,
)

print(type(duration).__name__)
```

## Work With `Duration`

Use `Duration` when you need calendar-aware months or years.

```python
from datetime import date

from isodate.duration import Duration

renewal_window = Duration(years=1, months=1, days=7)
renewal_date = date(2026, 1, 31) + renewal_window

print(renewal_date)
```

To convert a `Duration` into a concrete `timedelta`, provide either a `start` or an `end` date:

```python
from datetime import date

from isodate.duration import Duration

duration = Duration(months=1, days=3)
delta = duration.totimedelta(start=date(2026, 1, 31))

print(delta.days)
```

`Duration.totimedelta()` raises `ValueError` if you pass neither `start` nor `end`, or if you pass both.

## Format Python Values Back To ISO 8601

Use the matching `*_isoformat` helpers when you need consistent ISO 8601 output:

```python
from datetime import date, datetime, time, timedelta, timezone

import isodate
from isodate.duration import Duration

print(isodate.date_isoformat(date(2026, 3, 13)))
print(isodate.time_isoformat(time(14, 30, tzinfo=timezone.utc)))
print(isodate.datetime_isoformat(datetime(2026, 3, 13, 14, 30, tzinfo=timezone.utc)))
print(isodate.duration_isoformat(timedelta(hours=1, minutes=30)))
print(isodate.duration_isoformat(Duration(years=1, months=2, days=3)))
```

The default formatting mode is the ISO 8601 expanded form.

## Error Handling

Parsing failures raise `ISO8601Error`, which is a subclass of `ValueError`.

```python
import isodate
from isodate.isoerror import ISO8601Error

try:
    isodate.parse_datetime("2026-03-13 14:30:00Z")
except ISO8601Error as exc:
    print(f"Invalid ISO 8601 value: {exc}")
```

`parse_datetime()` expects the date-time separator to be `T`, not a space.

## Important Pitfalls

- If a parsed time string has no time zone information, `isodate` treats it as local time, not UTC.
- Incomplete dates default to the first valid day. For example, a century-style date resolves to January 1 of the first year in that century.
- Fractional seconds are cut down to microseconds; higher precision is not preserved.
- `parse_duration()` switches between `timedelta` and `Duration` based on whether years or months are present unless you override `as_timedelta_if_possible`.
- Negative `Duration` and `timedelta` handling is not fully supported yet.
- The parser intentionally accepts some date/time combinations that are looser than strict ISO 8601. If you need strict validation, add your own checks around accepted input formats.
- Alternative duration forms like `PYYYY-MM-DDThh:mm:ss` are supported, but the standard `PnYnMnDTnHnMnS` form is the safer default for application code.

## Version-Sensitive Notes For 0.7.2

- `0.7.2` no longer matches garbage characters at the end of parsed strings. Inputs that used to parse despite trailing junk now fail.
- `0.7.2` adds the `as_timedelta_if_possible` control on `parse_duration()`.
- `0.7.2` drops end-of-life Python versions and requires Python 3.7 or newer.

## Official Sources

- Maintainer repository: https://github.com/gweis/isodate
- README and package usage: https://github.com/gweis/isodate/blob/master/README.rst
- PyPI project page: https://pypi.org/project/isodate/
- PyPI package metadata JSON: https://pypi.org/pypi/isodate/json
