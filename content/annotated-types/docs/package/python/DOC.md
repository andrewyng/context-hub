---
name: package
description: "annotated-types for Python - reusable typing.Annotated metadata for bounds, lengths, predicates, timezones, units, and inline docs"
metadata:
  languages: "python"
  versions: "0.7.0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "python,typing,annotated,constraints,metadata,validation"
---

# annotated-types Python Package Guide

## What It Is

`annotated-types` provides reusable metadata objects for `typing.Annotated`. Use it when you want to describe constraints and extra meaning in type annotations without inventing your own marker classes.

Common uses include:

- scalar bounds such as `Gt(0)` or `Le(100)`
- length constraints such as `Len(1, 64)`
- divisibility with `MultipleOf(...)`
- timezone requirements for `datetime` and `time`
- physical-unit hints with `Unit(...)`
- inline annotation docs with `doc(...)`

Important: `annotated-types` does not validate values by itself. It defines metadata that downstream libraries or your own code can inspect.

## Installation

```bash
pip install annotated-types==0.7.0
```

```bash
uv add annotated-types==0.7.0
```

Python requirement for `annotated-types` 0.7.0: Python 3.8+.

On Python 3.8, the package depends on `typing-extensions` so you can use `Annotated` there too.

## Imports At A Glance

```python
import sys
from datetime import datetime, timezone
from typing import get_args, get_origin

if sys.version_info >= (3, 9):
    from typing import Annotated
else:
    from typing_extensions import Annotated

from annotated_types import (
    Ge,
    Gt,
    GroupedMetadata,
    Interval,
    IsDigits,
    IsFinite,
    Le,
    Len,
    LowerCase,
    MaxLen,
    MinLen,
    MultipleOf,
    Predicate,
    Timezone,
    Unit,
    doc,
)
```

## Setup Notes

- No environment variables, auth, or client initialization are required.
- The package is pure Python metadata; importing it does not activate validation.
- Prefer statically inspectable metadata such as `Gt`, `Len`, or `Timezone` when possible.
- Use `Predicate(...)` when you need custom logic that cannot be expressed with the built-in markers.

## Core Usage

### Scalar Bounds With `Gt`, `Ge`, `Lt`, `Le`

```python
import sys

if sys.version_info >= (3, 9):
    from typing import Annotated
else:
    from typing_extensions import Annotated

from annotated_types import Ge, Gt, Le, Lt

PositiveInt = Annotated[int, Gt(0)]
Percent = Annotated[float, Ge(0), Le(100)]
PortNumber = Annotated[int, Ge(1), Lt(65536)]
```

These markers work with any type that supports the matching comparison operator, not only numbers.

### Combine Bounds With `Interval`

`Interval` groups lower and upper bounds into one metadata object.

```python
import sys

if sys.version_info >= (3, 9):
    from typing import Annotated
else:
    from typing_extensions import Annotated

from annotated_types import Interval

HumanBodyTempC = Annotated[float, Interval(ge=35.0, le=42.0)]
```

For consumers that unpack grouped metadata, `Interval(ge=35.0, le=42.0)` expands into `Ge(35.0)` and `Le(42.0)`.

### Length Constraints With `MinLen`, `MaxLen`, `Len`

```python
import sys

if sys.version_info >= (3, 9):
    from typing import Annotated
else:
    from typing_extensions import Annotated

from annotated_types import Len, MaxLen, MinLen

NonEmptyString = Annotated[str, MinLen(1)]
ShortName = Annotated[str, Len(1, 64)]
TagList = Annotated[List[str], Len(1, 10)]
Batch = Annotated[List[int], MaxLen(100)]
```

`Len(min_length, max_length)` uses inclusive bounds in 0.7.0, so `Len(8, 8)` means exactly length 8.

### Divisibility With `MultipleOf`

```python
import sys
from decimal import Decimal

if sys.version_info >= (3, 9):
    from typing import Annotated
else:
    from typing_extensions import Annotated

from annotated_types import MultipleOf

EvenNumber = Annotated[int, MultipleOf(2)]
NickelAmount = Annotated[Decimal, MultipleOf(Decimal("0.05"))]
```

`MultipleOf` is metadata only. Consumers need to document whether they use Python `%` semantics or JSON Schema style semantics for divisibility.

### Datetime Requirements With `Timezone`

```python
import sys
from datetime import datetime, timezone

if sys.version_info >= (3, 9):
    from typing import Annotated
else:
    from typing_extensions import Annotated

from annotated_types import Timezone

NaiveDateTime = Annotated[datetime, Timezone(None)]
AwareDateTime = Annotated[datetime, Timezone(...)]
UTCDateTime = Annotated[datetime, Timezone(timezone.utc)]
```

Use `Timezone(None)` for naive datetimes, `Timezone(...)` for any timezone-aware value, or pass a specific timezone string or `tzinfo` object when a consumer should require one exact timezone.

### Units And Predicate-Based Constraints

```python
import sys

if sys.version_info >= (3, 9):
    from typing import Annotated
else:
    from typing_extensions import Annotated

from annotated_types import IsDigits, IsFinite, LowerCase, Predicate, Unit

Velocity = Annotated[float, Unit("m/s")]
AccountCode = Annotated[str, Predicate(str.isalnum)]
Slug = LowerCase[str]
PostalCode = IsDigits[str]
Reading = IsFinite[float]
```

`Unit(...)` does not parse or validate the unit string itself. It is a hint for downstream tooling.

`Predicate(...)` is the escape hatch for arbitrary truthy checks. Prefer named callables such as `str.isalnum` over lambdas so consumers can introspect them more easily.

### Add Inline Documentation With `doc(...)`

```python
import sys

if sys.version_info >= (3, 9):
    from typing import Annotated
else:
    from typing_extensions import Annotated

from annotated_types import Gt, doc

UserId = Annotated[int, Gt(0), doc("Internal numeric user identifier")]
```

`doc(...)` adds documentation metadata inside `Annotated`. Tools can extract it at runtime from the returned `DocInfo` object.

## Reusable Aliases In Application Code

Defining aliases keeps model annotations consistent across an application.

```python
import sys
from dataclasses import dataclass

if sys.version_info >= (3, 9):
    from typing import Annotated
else:
    from typing_extensions import Annotated

from annotated_types import Ge, Len, LowerCase

AdultAge = Annotated[int, Ge(18)]
Username = LowerCase[str]
DisplayName = Annotated[str, Len(1, 32)]

@dataclass
class SignupRequest:
    age: AdultAge
    username: Username
    display_name: DisplayName
```

This is a good authoring pattern even if validation happens later in another library. The annotations stay readable and reusable.

## Read Metadata At Runtime

If you are writing your own consumer, inspect `Annotated` with `get_origin()` and `get_args()`. Unpack `GroupedMetadata` so composite markers such as `Interval` and `Len` are handled consistently.

```python
import sys
from typing import get_args, get_origin

if sys.version_info >= (3, 9):
    from typing import Annotated, List
else:
    from typing import List
    from typing_extensions import Annotated

from annotated_types import GroupedMetadata, Len, doc

DisplayName = Annotated[str, Len(1, 32), doc("Public name shown in the UI")]

def expanded_metadata(annotation: object) -> List[object]:
    if get_origin(annotation) is not Annotated:
        return []

    _, *metadata = get_args(annotation)
    expanded: List[object] = []

    for item in metadata:
        if isinstance(item, GroupedMetadata):
            expanded.extend(item)
        else:
            expanded.append(item)

    return expanded

for item in expanded_metadata(DisplayName):
    print(repr(item))
```

With `DisplayName`, the expanded items include `MinLen(1)`, `MaxLen(32)`, and the `DocInfo` returned by `doc(...)`.

## Common Pitfalls

- `annotated-types` does not reject bad input on its own. Validation only happens if another library or your code reads the metadata.
- Do not assume every consumer handles every marker. Unsupported metadata may be ignored.
- When consuming annotations, unpack `GroupedMetadata`; otherwise `Interval(...)` and `Len(...)` may appear to be missing constraints.
- Be careful with `MultipleOf` on floating-point values. The project explicitly calls out differences between Python and JSON Schema interpretations.
- Prefer introspectable predicates such as `str.isdigit` or `math.isfinite` over lambdas if downstream tooling needs to understand them.
- On Python 3.8, import `Annotated` from `typing_extensions`, not `typing`.

## Version-Sensitive Notes For 0.7.0

- `annotated-types` 0.7.0 requires Python 3.8 or newer.
- On Python versions earlier than 3.9, the package depends on `typing-extensions>=4.0.0`.
- `Len` uses `min_length` and `max_length`, and the upper bound is inclusive. Older posts that describe `max_exclusive` or exclusive upper bounds are stale.
- `doc(...)` and `DocInfo` are available in 0.7.0; when `typing_extensions.doc` is unavailable, the package provides its own fallback implementation.

## Official Sources

- Maintainer repository: https://github.com/annotated-types/annotated-types
- PyPI package page: https://pypi.org/project/annotated-types/
- Releases: https://github.com/annotated-types/annotated-types/releases
- PEP 593 `Annotated`: https://peps.python.org/pep-0593/
