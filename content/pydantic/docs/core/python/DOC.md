---
name: core
description: "pydantic-core 2.47.0 package guide for low-level validation, parsing, and serialization in Python"
metadata:
  languages: "python"
  versions: "2.47.0"
  revision: 3
  updated-on: "2026-05-29"
  source: maintainer
  tags: "pydantic,python,validation,serialization,json,schema"
---

# pydantic-core Python Package Guide

## What It Is

`pydantic-core` is the low-level validation and serialization engine used by Pydantic v2. Use it directly when you need to validate or serialize data from an explicit `CoreSchema` without `BaseModel`.

Prefer `pydantic` for normal application code. Reach for `pydantic-core` when you are:

- building a framework, adapter, or plugin system
- validating hot-path data with minimal overhead
- consuming JSON bytes directly
- generating and reusing `SchemaValidator` or `SchemaSerializer` instances yourself

## Install

```bash
pip install "pydantic-core==2.47.0"
```

If you use `uv`:

```bash
uv add "pydantic-core==2.47.0"
```

If you use Poetry:

```bash
poetry add "pydantic-core==2.47.0"
```

Notes:

- The package name is `pydantic-core`, but the import is `pydantic_core`.
- PyPI normalizes the project URL to the underscore form: `pydantic_core`.

## Core Validator Pattern

Build a schema once, compile a `SchemaValidator` once, and reuse it.

```python
from pydantic_core import SchemaValidator, ValidationError, core_schema

user_schema = core_schema.typed_dict_schema(
    {
        "name": core_schema.typed_dict_field(core_schema.str_schema()),
        "age": core_schema.typed_dict_field(core_schema.int_schema(ge=0)),
        "is_admin": core_schema.typed_dict_field(
            core_schema.bool_schema(),
            required=False,
        ),
    },
    extra_behavior="forbid",
)

validator = SchemaValidator(user_schema)

user = validator.validate_python({"name": "Ada", "age": "41"})
assert user == {"name": "Ada", "age": 41}

try:
    validator.validate_python({"name": "Ada", "age": -1})
except ValidationError as exc:
    print(exc.errors())
```

Operational notes:

- Validation is coercive by default. `"41"` becomes `41` unless you make the schema or call strict.
- `extra_behavior="forbid"` is the low-level way to reject unknown keys in typed dict input.
- Reuse compiled validators instead of creating them in tight loops.

## JSON And String Inputs

Use the entry point that matches the raw input you already have.

### JSON bytes or JSON text

```python
from pydantic_core import SchemaValidator, core_schema

numbers_schema = core_schema.list_schema(core_schema.int_schema())
validator = SchemaValidator(numbers_schema)

numbers = validator.validate_json(b'[1, 2, "3"]')
assert numbers == [1, 2, 3]
```

Use `validate_json(...)` when the payload is already JSON. It avoids a separate `json.loads(...)` step.

### String-only maps from env vars, forms, or query params

```python
from pydantic_core import SchemaValidator, core_schema

settings_schema = core_schema.typed_dict_schema(
    {
        "port": core_schema.typed_dict_field(core_schema.int_schema()),
        "debug": core_schema.typed_dict_field(
            core_schema.bool_schema(),
            required=False,
        ),
    }
)

validator = SchemaValidator(settings_schema)
settings = validator.validate_strings({"port": "8080", "debug": "true"})

assert settings == {"port": 8080, "debug": True}
```

Use `validate_strings(...)` only when your input is already split into strings. It is not a replacement for parsing JSON bytes.

## Fast JSON Parsing Without A Schema

If you only need fast JSON decoding and do not need schema validation yet, use `from_json(...)`.

```python
from pydantic_core import from_json

payload = from_json(b'{"name":"Ada","active":true}')
assert payload == {"name": "Ada", "active": True}
```

This is useful when:

- you want a fast parse step before separate business logic
- you need partial or staged processing
- you are integrating `pydantic-core` into another validation layer

## Serialization

Use `SchemaSerializer` when you want serialization rules tied to the same schema shape.

```python
from pydantic_core import SchemaSerializer, core_schema

schema = core_schema.typed_dict_schema(
    {
        "name": core_schema.typed_dict_field(core_schema.str_schema()),
        "age": core_schema.typed_dict_field(core_schema.int_schema()),
    }
)

serializer = SchemaSerializer(schema)
value = {"name": "Ada", "age": 41}

python_value = serializer.to_python(value)
json_bytes = serializer.to_json(value, indent=2)

assert python_value == {"name": "Ada", "age": 41}
print(json_bytes.decode("utf-8"))
```

Serialization notes:

- `to_python(...)` returns Python objects.
- `to_json(...)` returns `bytes`.
- If another layer expects JSON-compatible Python objects instead of bytes, use `to_jsonable_python(...)`.

## Validation Behavior And Config

Most behavior is controlled in one of three places:

- the schema itself, such as `strict=True` on `int_schema(...)`
- per-call flags on `validate_python(...)`, `validate_json(...)`, and `validate_strings(...)`
- reusable validator config using the `CoreConfig` fields documented in the upstream API

Simple strict-mode example:

```python
from pydantic_core import SchemaValidator, ValidationError, core_schema

strict_ints = SchemaValidator(
    core_schema.list_schema(core_schema.int_schema(strict=True))
)

assert strict_ints.validate_python([1, 2, 3]) == [1, 2, 3]

try:
    strict_ints.validate_python(["1", 2, 3])
except ValidationError as exc:
    print(exc.errors())
```

Useful runtime flags in the official API docs include:

- `strict` to disable coercion for that call
- `extra` to control extra-field behavior for that call
- `from_attributes` when validating from object attributes
- `by_alias` and `by_name` for alias-aware lookups
- `allow_partial` for intentionally incomplete or streamed input

## When To Use `pydantic-core` Directly

Use `pydantic-core` directly when:

- you need a standalone validator without `BaseModel`
- you are generating schemas programmatically
- you need to validate JSON bytes at a low level
- you want explicit control over serialization behavior

Prefer `pydantic` when:

- you want `BaseModel`
- you want authoring driven by Python type hints
- you want model methods, settings integration, or JSON Schema generation from models
- you are writing normal application code rather than framework internals

## Config And Auth

There is no network client, authentication flow, API key setting, or service endpoint setup in `pydantic-core`.

The relevant "configuration" is validation and serialization behavior:

- schema constraints
- strictness and extra-field handling
- alias and attribute lookup behavior
- serializer output mode

If your project needs environment-backed settings or secret loading, use `pydantic-settings` alongside `pydantic`, not `pydantic-core` alone.

## Common Pitfalls

- Installing `pydantic-core` but importing `pydantic-core` instead of `pydantic_core`.
- Rebuilding validators or serializers per request instead of compiling once and reusing them.
- Assuming validation is strict by default. Most schemas coerce unless configured otherwise.
- Using `validate_python(...)` after already receiving raw JSON bytes. Prefer `validate_json(...)`.
- Forgetting that `to_json(...)` returns `bytes`, not `str`.
- Writing large raw schema dictionaries by hand. Use `pydantic_core.core_schema` helpers for maintainable code.

## Version-Sensitive Notes For `2.47.0`

- PyPI lists `2.47.0` as the current package version as of `2026-05-29` and requires Python `>=3.10`.
- The official API docs live under `docs.pydantic.dev/latest/...`; they are authoritative, but they are not a version-pinned docs snapshot.
- The standalone `pydantic/pydantic-core` GitHub repository is archived and marked read-only. Active development moved into the main `pydantic` repository under `pydantic-core/`.
- `pydantic-core` versions are pinned by the `pydantic` package; do not upgrade `pydantic-core` alone unless you are intentionally compatibility-testing a new core release.
- If your application is pinned to an older `2.x` release, verify method signatures and flags against the installed wheel before copying examples from the latest docs.

## Official Sources

- PyPI: https://pypi.org/project/pydantic_core/
- API docs: https://docs.pydantic.dev/latest/api/pydantic_core/
- Repository: https://github.com/pydantic/pydantic-core
- Active code location notice: https://github.com/pydantic/pydantic/tree/main/pydantic-core
