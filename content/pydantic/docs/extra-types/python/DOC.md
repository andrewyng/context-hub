---
name: extra-types
description: "pydantic-extra-types 2.11.0 guide for validating colors, countries, phone numbers, payment cards, coordinates, and time zones in Python"
metadata:
  languages: "python"
  versions: "2.11.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "pydantic,pydantic-extra-types,python,validation,types,phone-numbers,countries,timezones"
---

# pydantic-extra-types Python Package Guide

## What It Is

`pydantic-extra-types` is the separately installed package for Pydantic v2 extra field types. Use it when a model field should validate structured values such as CSS colors, ISO country codes, phone numbers, payment card numbers, latitude/longitude pairs, or IANA time zone names.

There is no client object, auth flow, or environment-variable setup. You import the type you need and use it directly in a Pydantic model.

## Install

Pin the package version your project expects:

```bash
python -m pip install "pydantic-extra-types==2.11.0"
```

Common alternatives:

```bash
uv add "pydantic-extra-types==2.11.0"
poetry add "pydantic-extra-types==2.11.0"
```

Optional extras published on PyPI:

```bash
python -m pip install "pydantic-extra-types[phonenumbers]==2.11.0"
python -m pip install "pydantic-extra-types[all]==2.11.0"
```

Notes:

- PyPI lists Python `>=3.9` for `2.11.0`.
- The package is for the Pydantic v2 ecosystem; these types are no longer imported from `pydantic` itself.
- If your runtime does not have an IANA timezone database available, install `tzdata` before using `TimeZoneName`.

## Core Pattern

Use extra types as normal field annotations in `BaseModel` classes:

```python
from pydantic import BaseModel
from pydantic_extra_types.color import Color
from pydantic_extra_types.coordinate import Coordinate
from pydantic_extra_types.country import CountryAlpha2
from pydantic_extra_types.timezone_name import TimeZoneName


class Warehouse(BaseModel):
    accent_color: Color
    country: CountryAlpha2
    location: Coordinate
    timezone: TimeZoneName


warehouse = Warehouse.model_validate(
    {
        "accent_color": "rgb(0, 170, 255)",
        "country": "US",
        "location": (37.7749, -122.4194),
        "timezone": "America/Los_Angeles",
    }
)

print(warehouse.accent_color.as_hex())
print(warehouse.country.alpha3)
print(warehouse.location.latitude, warehouse.location.longitude)
print(str(warehouse.timezone))
```

Why this is useful:

- `Color` parses common CSS-style color inputs and gives you serializer helpers such as `as_hex()`.
- `CountryAlpha2` validates ISO 3166 alpha-2 values and exposes related ISO metadata.
- `Coordinate` stores latitude and longitude together as one validated value.
- `TimeZoneName` validates timezone identifiers such as `America/Los_Angeles`.

## Common Workflows

### Payment card validation

Use `PaymentCardNumber` when a field must validate card-number structure and expose derived metadata:

```python
from pydantic import BaseModel
from pydantic_extra_types.payment import PaymentCardNumber


class CardInput(BaseModel):
    number: PaymentCardNumber


card = CardInput.model_validate({"number": "4111111111111111"}).number

print(card.brand)
print(card.bin)
print(card.last4)
print(card.masked)
```

This is the current import path to use in Pydantic v2 code. Do not copy older examples that import `PaymentCardNumber` from `pydantic.types`.

### Phone number parsing and normalization

`PhoneNumber` support depends on the `phonenumbers` package. For the default behavior, use the built-in type:

```python
from pydantic import BaseModel
from pydantic_extra_types.phone_numbers import PhoneNumber


class Contact(BaseModel):
    support_number: PhoneNumber


contact = Contact.model_validate({"support_number": "+1 650-253-0000"})
print(contact.support_number)
```

If you need application-specific output or region rules, use `PhoneNumberValidator` with `Annotated`:

```python
from typing import Annotated, Union

import phonenumbers
from pydantic import BaseModel
from pydantic_extra_types.phone_numbers import PhoneNumberValidator

USNationalPhone = Annotated[
    Union[str, phonenumbers.PhoneNumber],
    PhoneNumberValidator(
        default_region="US",
        supported_regions=["US"],
        number_format="NATIONAL",
    ),
]


class Signup(BaseModel):
    phone: USNationalPhone


signup = Signup.model_validate({"phone": "650-253-0000"})
print(signup.phone)
```

Use a subclass of `PhoneNumber` instead when you want one reusable policy shared across many models.

### Standalone validation with `TypeAdapter`

You do not need a wrapper model for one-off validation:

```python
from pydantic import TypeAdapter
from pydantic_extra_types.country import CountryAlpha2
from pydantic_extra_types.timezone_name import TimeZoneName

country = TypeAdapter(CountryAlpha2).validate_python("DE")
timezone = TypeAdapter(TimeZoneName).validate_python("Europe/Berlin")

print(country.alpha3)
print(str(timezone))
```

This is the simplest pattern for parsing config values, CLI inputs, or isolated request fields.

## Common Pitfalls

- `pydantic-extra-types` is a separate install. Importing `Color` or `PaymentCardNumber` from old `pydantic` examples is a v1-era pattern.
- There is no runtime initialization step. If validation fails, the fix is usually the input value or a missing optional dependency, not missing client setup.
- `PhoneNumber` requires the `phonenumbers` dependency. Install the `phonenumbers` extra before using it.
- `TimeZoneName` relies on the IANA timezone database. Install `tzdata` if your deployment image does not already provide timezone data.
- The main Pydantic types docs note that strictness and extra constraints are not applied to these extra types. If you need narrower rules, add a validator, use `Annotated` metadata such as `PhoneNumberValidator`, or define a subtype such as a custom `PhoneNumber` subclass.
- The official docs root uses `/latest/`, so copy examples cautiously if your project is pinned to a much older or newer wheel than `2.11.0`.

## Version-Sensitive Notes For `2.11.0`

- PyPI lists `2.11.0` as the package version covered here and requires Python `>=3.9`.
- The current maintainer docs for extra types live under the main Pydantic docs site, not a separate package site.
- Pydantic v2 moved these types out of the main package. If you are migrating v1 code, prefer imports from `pydantic_extra_types.*` and re-check any old field examples.

## Official Sources

- Docs root: `https://docs.pydantic.dev/latest/`
- Color API: `https://docs.pydantic.dev/latest/api/pydantic_extra_types_color/`
- Country API: `https://docs.pydantic.dev/latest/api/pydantic_extra_types_country/`
- Coordinate API: `https://docs.pydantic.dev/latest/api/pydantic_extra_types_coordinate/`
- Payment card API: `https://docs.pydantic.dev/latest/api/pydantic_extra_types_payment/`
- Phone numbers API: `https://docs.pydantic.dev/2.11/api/pydantic_extra_types_phone_numbers/`
- Timezone name API: `https://docs.pydantic.dev/latest/api/pydantic_extra_types_timezone_name/`
- Main types docs: `https://docs.pydantic.dev/latest/api/types/`
- PyPI: `https://pypi.org/project/pydantic-extra-types/2.11.0/`
