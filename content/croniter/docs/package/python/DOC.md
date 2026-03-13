---
name: package
description: "croniter Python package guide for parsing cron expressions and computing matching run times"
metadata:
  languages: "python"
  versions: "6.0.0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "croniter,cron,python,scheduling,datetime,timezones"
---

# croniter Python Package Guide

## Golden Rule

Use `croniter` to calculate schedule times inside your own code, not to run jobs by itself. In `6.0.0`, the most important practical defaults are: pass a `datetime` base time, prefer timezone-aware datetimes, and set `ret_type=datetime` unless you explicitly want UNIX timestamp floats back.

## Install

Pin the version your project expects:

```bash
python -m pip install "croniter==6.0.0"
```

Common alternatives:

```bash
uv add "croniter==6.0.0"
poetry add "croniter==6.0.0"
```

`croniter` has no package-level authentication, no service account setup, and no required environment variables. It only parses cron expressions and computes matching times.

## Core Usage

Create an iterator from a cron expression plus a base time, then call `get_next()` or `get_prev()`:

```python
from datetime import datetime
from zoneinfo import ZoneInfo

from croniter import croniter

base = datetime(2026, 3, 12, 9, 0, tzinfo=ZoneInfo("UTC"))

schedule = croniter(
    "*/15 * * * *",
    base,
    ret_type=datetime,
)

current = schedule.get_current(datetime)
next_run = schedule.get_next()
after_that = schedule.get_next()
previous_run = schedule.get_prev()

print(current)      # 2026-03-12 09:00:00+00:00
print(next_run)     # 2026-03-12 09:15:00+00:00
print(after_that)   # 2026-03-12 09:30:00+00:00
print(previous_run) # 2026-03-12 09:15:00+00:00
```

Important default: if you omit `ret_type=datetime`, `croniter` returns `float` UNIX timestamps.

## Iterate Future Or Previous Matches

Use `all_next()` or `all_prev()` when you want a generator instead of calling `get_next()` repeatedly:

```python
from datetime import datetime
from zoneinfo import ZoneInfo

from croniter import croniter

base = datetime(2026, 3, 12, 0, 0, tzinfo=ZoneInfo("UTC"))
schedule = croniter("@daily", base, ret_type=datetime)

for index, run_at in enumerate(schedule.all_next(datetime), start=1):
    print(index, run_at)
    if index == 3:
        break
```

`@midnight`, `@hourly`, `@daily`, `@weekly`, `@monthly`, `@yearly`, and `@annually` are accepted aliases.

## Validate And Match Expressions

Use the class methods when you need to validate user input or check whether a time window contains a match:

```python
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from croniter import croniter

candidate = datetime(2026, 3, 13, 9, 0, tzinfo=ZoneInfo("UTC"))

is_valid = croniter.is_valid("0 9 * * 1-5")
matches_exact_time = croniter.match("0 9 * * 1-5", candidate)
matches_within_hour = croniter.match_range(
    "0 9 * * 1-5",
    candidate,
    candidate + timedelta(hours=1),
)

print(is_valid)
print(matches_exact_time)
print(matches_within_hour)
```

Use this pattern when you need to reject invalid cron strings before saving them, or when you want to see whether a given interval contains a run.

## Enumerate A Window With `croniter_range`

Use `croniter_range()` when you want every matching time between two endpoints:

```python
from datetime import datetime
from zoneinfo import ZoneInfo

from croniter import croniter_range

start = datetime(2026, 3, 16, 0, 0, tzinfo=ZoneInfo("UTC"))
stop = datetime(2026, 3, 16, 23, 59, tzinfo=ZoneInfo("UTC"))

for run_at in croniter_range(
    start,
    stop,
    "0 9,13,17 * * 1-5",
    ret_type=datetime,
):
    print(run_at)
```

By default, matching `start` and `stop` values are included. Pass `exclude_ends=True` to drop matches that land exactly on the endpoints.

## Expression Features

`croniter 6.0.0` accepts exactly `5`, `6`, or `7` fields:

- `5` fields: standard minute, hour, day of month, month, day of week
- `6` fields: adds seconds
- `7` fields: adds seconds and year

By default, seconds are the last time field. For a six-field expression, this means `minute hour day month day_of_week second`:

```python
from datetime import datetime
from zoneinfo import ZoneInfo

from croniter import croniter

base = datetime(2026, 3, 12, 12, 0, tzinfo=ZoneInfo("UTC"))

# 12:00:30 every day
schedule = croniter("0 12 * * * 30", base, ret_type=datetime)
print(schedule.get_next())
```

If your expression puts seconds first, pass `second_at_beginning=True`:

```python
from datetime import datetime
from zoneinfo import ZoneInfo

from croniter import croniter

base = datetime(2026, 3, 12, 12, 0, tzinfo=ZoneInfo("UTC"))

# 12:00:30 every day, Quartz-style seconds-first order
schedule = croniter(
    "30 0 12 * * *",
    base,
    ret_type=datetime,
    second_at_beginning=True,
)
print(schedule.get_next())
```

Other useful parser features:

- month and weekday names such as `jan` and `mon-fri`
- `l` for the last day of the month in the day-of-month field
- `2#3` style nth weekday syntax in the day-of-week field
- `?` in day-of-month or day-of-week, treated like `*`

## Day-Of-Month And Day-Of-Week Logic

When both day-of-month and day-of-week are restricted, `croniter` uses OR semantics by default. Set `day_or=False` when you need AND semantics instead:

```python
from datetime import datetime
from zoneinfo import ZoneInfo

from croniter import croniter

base = datetime(2026, 3, 1, 0, 0, tzinfo=ZoneInfo("UTC"))

# Fires when either condition matches: first day of the month OR Monday
either_rule = croniter(
    "0 9 1 * mon",
    base,
    ret_type=datetime,
)

# Fires only when both conditions match: first day of the month AND Monday
both_rules = croniter(
    "0 9 1 * mon",
    base,
    ret_type=datetime,
    day_or=False,
)
```

This is one of the easiest ways to get an unexpected schedule if you assume Quartz-style or scheduler-specific semantics.

## Time Zones And DST

If the base time is a timezone-aware `datetime`, `croniter` keeps the timezone information on returned datetimes. Use aware datetimes for application schedules that must follow a real timezone instead of a floating local clock:

```python
from datetime import datetime
from zoneinfo import ZoneInfo

from croniter import croniter

base = datetime(2026, 3, 29, 0, 30, tzinfo=ZoneInfo("Europe/Berlin"))
schedule = croniter("0 * * * *", base, ret_type=datetime)

for _ in range(3):
    print(schedule.get_next())
```

If you care about DST transitions, keep everything in UTC unless the business rule truly depends on local wall time.

## Errors And Practical Pitfalls

Catch the package exceptions when cron strings come from users or configuration files:

```python
from datetime import datetime
from zoneinfo import ZoneInfo

from croniter import CroniterBadCronError, CroniterBadDateError, croniter

base = datetime(2026, 3, 12, 0, 0, tzinfo=ZoneInfo("UTC"))

try:
    schedule = croniter(
        "0 4 1 1 fri",
        base,
        ret_type=datetime,
        day_or=False,
        max_years_between_matches=10,
    )
    print(schedule.get_next())
except CroniterBadCronError as exc:
    print(f"Invalid cron expression: {exc}")
except CroniterBadDateError as exc:
    print(f"No matching date found in search window: {exc}")
```

Keep these behavior details in mind:

- `get_next()` and `get_prev()` return floats unless you set `ret_type=datetime`
- sparse expressions search up to `50` years by default; tune `max_years_between_matches` if you want a tighter failure window
- `croniter_range()` includes matching endpoints unless you pass `exclude_ends=True`
- hashed definitions such as `h` require `hash_id=...`
- `second_at_beginning=True` changes how `6`- and `7`-field expressions are interpreted

## Minimal App Pattern

For most applications, a small helper keeps scheduling code consistent:

```python
from datetime import datetime
from zoneinfo import ZoneInfo

from croniter import croniter

UTC = ZoneInfo("UTC")

def next_run(cron_expression: str, now: datetime | None = None) -> datetime:
    base = now or datetime.now(UTC)
    return croniter(cron_expression, base, ret_type=datetime).get_next()

run_at = next_run("*/10 * * * *")
print(run_at)
```

This keeps your app on aware datetimes and avoids the most common `float` return-type mistake.
