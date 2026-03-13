---
name: package
description: "phonenumbers package guide for parsing, validating, formatting, and extracting international phone numbers in Python"
metadata:
  languages: "python"
  versions: "9.0.25"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "phonenumbers,python,phone-numbers,libphonenumber,validation,formatting"
---

# phonenumbers Python Package Guide

## Install

Use a virtual environment and pin the package version your project expects:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "phonenumbers==9.0.25"
```

There is no API key, service account, or network initialization step. `phonenumbers` is a local metadata-driven library.

## Runtime Setup

No environment variables are required.

Import the top-level package and the format enum you need:

```python
import phonenumbers
from phonenumbers import NumberParseException, PhoneNumberFormat
```

For user-entered national numbers, pass a default region such as `"US"` or `"GB"`. For numbers already in international form with a leading `+`, pass `None`.

## Parse, Validate, And Normalize

Use `parse()` first, then check both `is_possible_number()` and `is_valid_number()` before storing or acting on the result.

```python
from typing import Optional

import phonenumbers
from phonenumbers import NumberParseException, PhoneNumberFormat


def normalize_phone_number(raw_number: str, region: Optional[str] = "US") -> str:
    try:
        number = phonenumbers.parse(raw_number, region)
    except NumberParseException as exc:
        raise ValueError(f"Could not parse phone number: {exc}") from exc

    if not phonenumbers.is_possible_number(number):
        raise ValueError("Phone number has an impossible length or structure")

    if not phonenumbers.is_valid_number(number):
        raise ValueError("Phone number is not a valid assigned number")

    return phonenumbers.format_number(number, PhoneNumberFormat.E164)


print(normalize_phone_number("(650) 253-0000", "US"))
print(normalize_phone_number("+44 20 8366 1177", None))
```

Use E.164 as the canonical stored form when you need a stable database value.

## Format For Display

`phonenumbers` can render the same parsed number in different formats depending on where you display it.

```python
import phonenumbers
from phonenumbers import PhoneNumberFormat

number = phonenumbers.parse("+12025550123", None)

print(phonenumbers.format_number(number, PhoneNumberFormat.E164))
print(phonenumbers.format_number(number, PhoneNumberFormat.INTERNATIONAL))
print(phonenumbers.format_number(number, PhoneNumberFormat.NATIONAL))
print(phonenumbers.format_number(number, PhoneNumberFormat.RFC3966))
```

Use `PhoneNumberFormat.E164` for storage and APIs, and `NATIONAL` or `INTERNATIONAL` for UI depending on audience.

## Extract Numbers From Text

Use `PhoneNumberMatcher` when you need to scan free-form text, emails, or logs for phone numbers.

```python
import phonenumbers
from phonenumbers import PhoneNumberFormat

text = "Call the US office at (650) 253-0000 or the UK office at +44 20 8366 1177."

for match in phonenumbers.PhoneNumberMatcher(text, "US"):
    print(match.raw_string)
    print(phonenumbers.format_number(match.number, PhoneNumberFormat.E164))
```

The matcher still needs a default region for numbers written without an international prefix.

## Format As The User Types

Use `AsYouTypeFormatter` for input widgets that progressively format a number as digits arrive.

```python
from phonenumbers import AsYouTypeFormatter

formatter = AsYouTypeFormatter("US")

for digit in "6502530000":
    print(formatter.input_digit(digit))
```

## Geocoding, Carrier, And Time Zone Helpers

The full `phonenumbers` package includes helper modules for offline metadata lookups.

```python
import phonenumbers
from phonenumbers import carrier, geocoder, timezone

number = phonenumbers.parse("+442083661177", None)

print(geocoder.description_for_number(number, "en"))
print(carrier.name_for_number(number, "en"))
print(timezone.time_zones_for_number(number))
```

## Common Pitfalls

- `parse()` raises `NumberParseException` for malformed input, missing region context, and other parse failures. Catch it at the boundary where raw user input enters your app.
- `is_possible_number()` is only a structural check. Use `is_valid_number()` as well before treating a number as real.
- National numbers need a region hint. `phonenumbers.parse("020 8366 1177", None)` is not the same as `phonenumbers.parse("020 8366 1177", "GB")`.
- Store normalized E.164 strings if you need deduplication, unique constraints, or API interoperability.
- If you need `geocoder`, `carrier`, or `timezone`, make sure you installed `phonenumbers`, not the lighter `phonenumberslite` package.
- Numbering metadata changes over time. If a recently assigned number fails validation unexpectedly, upgrade the package before adding custom workarounds.
