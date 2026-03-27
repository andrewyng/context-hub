---
name: package
description: "Cerberus Python package guide for schema validation, normalization, nested documents, and custom validators"
metadata:
  languages: "python"
  versions: "1.3.8"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "cerberus,validation,schema,normalization,python"
---

# Cerberus Python Package Guide

## Golden Rule

Use `cerberus.Validator` with an explicit schema for each payload shape you accept. Cerberus is a local validation library, not a hosted service, so there are no API keys, tokens, or required environment variables. In multithreaded code, create a fresh validator per document or guard shared instances with a lock because a validator stores the processed document on the instance.

## Install

Pin the package version your project expects:

```bash
python -m pip install "Cerberus==1.3.8"
```

Common alternatives:

```bash
uv add "Cerberus==1.3.8"
poetry add "Cerberus==1.3.8"
```

PyPI metadata for `1.3.8` declares `Requires: Python >=3.7`.

## Initialize A Validator

Cerberus works with plain Python dictionaries for both schemas and documents:

```python
from cerberus import Validator

schema = {
    "name": {"type": "string", "maxlength": 50, "required": True},
    "age": {"type": "integer", "min": 0},
}

validator = Validator(
    schema,
    allow_unknown=False,
    require_all=False,
)
```

Notes:

- `allow_unknown=False` rejects fields not declared in the schema.
- `require_all=False` means fields are optional unless you mark them `required: True`.
- You can also instantiate `Validator()` without a schema and pass the schema to `validate(document, schema)` later.

## Core Validation Workflow

Validate a document and inspect `errors` when validation fails:

```python
from cerberus import Validator

schema = {
    "name": {"type": "string", "maxlength": 50, "required": True},
    "age": {"type": "integer", "min": 18},
}

document = {"name": "Ana", "age": 16}
validator = Validator(schema)

if not validator.validate(document):
    print(validator.errors)
    # {'age': ['min value is 18']}
```

Cerberus does not stop at the first problem. It processes the whole document and returns `False` when any field fails validation.

### PATCH-style updates

If you are validating a partial update, pass `update=True` so missing required fields do not fail the check:

```python
from cerberus import Validator

schema = {
    "name": {"type": "string", "required": True},
    "email": {"type": "string", "required": True},
}

validator = Validator(schema)

payload = {"email": "new@example.com"}
print(validator.validate(payload, update=True))
```

Without `update=True`, missing required fields still fail validation.

## Normalization And Processed Output

Cerberus can coerce values, apply defaults, and remove fields before you use the document.

```python
from cerberus import Validator

schema = {
    "amount": {"type": "integer", "coerce": int},
    "kind": {"type": "string", "default": "purchase"},
    "id": {"type": "integer", "readonly": True},
}

validator = Validator(
    schema,
    purge_unknown=True,
    purge_readonly=True,
)

payload = {
    "amount": "5",
    "id": 99,
    "extra": "drop me",
}

cleaned = validator.validated(payload)

print(cleaned)
# {'amount': 5, 'kind': 'purchase'}
```

Useful behaviors:

- `coerce` converts incoming values before validation.
- `default` fills missing or `None` values during normalization.
- `purge_unknown=True` removes fields that are not in the schema.
- `purge_readonly=True` removes fields marked `readonly`.
- After `validate(...)`, the normalized copy is also available as `validator.document`.

If you want only normalization without validation, call `validator.normalized(document)`.

## Nested Documents And Collections

Use `schema` for fixed nested structures and list items:

```python
from cerberus import Validator

schema = {
    "customer": {
        "type": "dict",
        "require_all": True,
        "schema": {
            "email": {"type": "string", "regex": r"^[^@]+@[^@]+\.[^@]+$"},
            "country": {"type": "string", "minlength": 2, "maxlength": 2},
        },
    },
    "items": {
        "type": "list",
        "schema": {
            "type": "dict",
            "schema": {
                "sku": {"type": "string", "required": True},
                "quantity": {"type": "integer", "min": 1, "required": True},
            },
        },
    },
}

validator = Validator(schema)
document = {
    "customer": {"email": "ana@example.com", "country": "US"},
    "items": [{"sku": "ABC-123", "quantity": 2}],
}

print(validator.validate(document))
```

For arbitrary dictionaries, use `keysrules` and `valuesrules` instead of a fixed nested schema:

```python
from cerberus import Validator

schema = {
    "scores": {
        "type": "dict",
        "keysrules": {"type": "string", "regex": r"^[a-z_]+$"},
        "valuesrules": {"type": "integer", "min": 0},
    }
}

validator = Validator(schema)
print(validator.validate({"scores": {"math": 95, "science": 98}}))
```

Use `allow_unknown` on a nested dict when you want the parent document to stay strict but a particular subdocument to accept extra keys:

```python
from cerberus import Validator

schema = {
    "profile": {
        "type": "dict",
        "allow_unknown": {"type": "string"},
        "schema": {
            "display_name": {"type": "string"},
        },
    }
}

validator = Validator(schema)
print(
    validator.validate(
        {"profile": {"display_name": "Ana", "timezone": "UTC"}}
    )
)
```

## Cross-Field Checks

Use built-in rules first. `dependencies` is the common choice when one field only makes sense when another field is present or has a specific value:

```python
from cerberus import Validator

schema = {
    "payment_method": {"type": "string"},
    "card_last4": {
        "type": "string",
        "dependencies": {"payment_method": "card"},
    },
}

validator = Validator(schema)

print(validator.validate({"payment_method": "card", "card_last4": "4242"}))
print(validator.validate({"payment_method": "cash", "card_last4": "4242"}))
print(validator.errors)
```

## Custom Rules And Types

When the built-in rules are not enough, subclass `Validator`.

### `check_with` methods

```python
from cerberus import Validator


class OrderValidator(Validator):
    def _check_with_even_quantity(self, field, value):
        if value % 2:
            self._error(field, "must be an even number")


schema = {
    "quantity": {"type": "integer", "check_with": "even_quantity"}
}

validator = OrderValidator(schema)
print(validator.validate({"quantity": 4}))
print(validator.validate({"quantity": 3}))
print(validator.errors)
```

### Custom data types

Copy `types_mapping` on the subclass before adding a type. Mutating it directly on an instance affects the class-level mapping.

```python
from decimal import Decimal

import cerberus
from cerberus import Validator


decimal_type = cerberus.TypeDefinition("decimal", (Decimal,), ())


class MoneyValidator(Validator):
    types_mapping = Validator.types_mapping.copy()
    types_mapping["decimal"] = decimal_type


schema = {"price": {"type": "decimal"}}
validator = MoneyValidator(schema)

print(validator.validate({"price": Decimal("10.50")}))
```

## Reusable Schemas With Registries

If you reuse the same fragments in multiple schemas, register them once and reference them by name:

```python
from cerberus import Validator, schema_registry

schema_registry.add(
    "user_ref",
    {
        "uid": {"type": "integer", "min": 1000},
        "email": {"type": "string"},
    },
)

schema = {
    "sender": {"type": "dict", "schema": "user_ref", "allow_unknown": True},
    "receiver": {"type": "dict", "schema": "user_ref", "allow_unknown": True},
}

validator = Validator(schema)
```

Registries are useful when schemas are recursive, reused across many payloads, or loaded from serialized formats.

## Errors And Debugging

The default `errors` output is a dictionary of field names to human-readable messages:

```python
from cerberus import Validator

validator = Validator({"count": {"type": "integer"}})
validator.validate({"count": "two"})

print(validator.errors)
```

For programmatic inspection, Cerberus also exposes error objects and error trees after validation through `_errors`, `document_error_tree`, and `schema_error_tree`.

## Common Pitfalls

- `validate()` expects a mapping. Passing a list or scalar raises `DocumentError`.
- `required` and `require_all` are different: `required` is per field, `require_all` applies to all schema-defined fields for a validator or nested dict.
- `purge_unknown` does not override a nested `allow_unknown` rule. If a subdocument sets `allow_unknown`, its extra keys are kept.
- Use `schema` for fixed keys and `keysrules` or `valuesrules` for arbitrary dictionaries.
- Type checks run before most other rules. If a field fails `type`, later rules on that field are skipped.
- Regex matching has a forced trailing `$` in Cerberus 1.3.x. Write complete patterns instead of assuming search-style matching.
- Create a new validator per document in multithreaded code, or protect shared instances, because processed documents are stored on the validator instance.

## Version-Sensitive Notes For `Cerberus 1.3.8`

- PyPI lists `Cerberus 1.3.8` as the latest release, published on November 6, 2025.
- PyPI metadata for `1.3.8` declares `Requires: Python >=3.7`.
- The official docs site still exposes the changelog only through `1.3.5`, so use PyPI for the current package version and Python support floor, and use the maintainer docs for the stable 1.3 API surface documented here.

## Official Sources

- Maintainer docs: https://docs.python-cerberus.org/
- FAQ: https://docs.python-cerberus.org/faq.html
- Installation: https://docs.python-cerberus.org/install.html
- Usage: https://docs.python-cerberus.org/usage.html
- Validation rules: https://docs.python-cerberus.org/validation-rules.html
- Normalization rules: https://docs.python-cerberus.org/normalization-rules.html
- Extending: https://docs.python-cerberus.org/customize.html
- Schemas and registries: https://docs.python-cerberus.org/schemas.html
- Errors: https://docs.python-cerberus.org/errors.html
- PyPI package page: https://pypi.org/project/Cerberus/
