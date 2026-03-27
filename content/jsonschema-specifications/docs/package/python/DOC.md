---
name: package
description: "Python access to the official JSON Schema metaschemas and vocabularies as a referencing registry"
metadata:
  languages: "python"
  versions: "2025.9.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "jsonschema,json-schema,referencing,validation,metaschema"
---

# jsonschema-specifications Python Package Guide

Use `jsonschema-specifications` when you need runtime access to the official JSON Schema metaschemas and vocabularies from Python. The package exposes one main public object, `jsonschema_specifications.REGISTRY`, as a `referencing` schema registry.

## Install

```bash
python -m pip install "jsonschema-specifications==2025.9.1"
```

If you also want to validate instances or schemas, install `jsonschema` alongside it:

```bash
python -m pip install "jsonschema-specifications==2025.9.1" jsonschema
```

PyPI lists `2025.9.1` as requiring Python 3.9 or newer.

## What This Package Exposes

There are no environment variables, API keys, or client objects to configure.

Import the registry directly:

```python
from jsonschema_specifications import REGISTRY
```

The 2025.9.1 API reference documents this object as `jsonschema_specifications.REGISTRY = <Registry (20 resources)>`.

## Read An Official Metaschema

Use `REGISTRY.contents(uri)` to fetch the JSON contents for a known schema URI:

```python
from jsonschema_specifications import REGISTRY

DRAFT202012 = "https://json-schema.org/draft/2020-12/schema"

metaschema = REGISTRY.contents(DRAFT202012)

print(metaschema["$schema"])
print(metaschema["$id"])
print(metaschema["type"])
```

Use the canonical JSON Schema URI for the draft you need. For example:

- Draft 2020-12: `https://json-schema.org/draft/2020-12/schema`
- Draft 2019-09: `https://json-schema.org/draft/2019-09/schema`
- Draft 7: `http://json-schema.org/draft-07/schema#`

## Validate Data With `jsonschema` Using The Official Registry

`jsonschema` validators accept a keyword-only `registry=` argument. Pass `REGISTRY` when you want the validator to resolve against the official metaschemas explicitly:

```python
from jsonschema import Draft202012Validator
from jsonschema_specifications import REGISTRY

schema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "object",
    "properties": {
        "name": {"type": "string"},
        "age": {"type": "integer", "minimum": 0},
    },
    "required": ["name"],
}

validator = Draft202012Validator(schema, registry=REGISTRY)

validator.validate({"name": "Ada", "age": 37})
```

If you only use `jsonschema` for normal validation, its current validator classes already default to a registry with these official resources. Import `jsonschema-specifications` directly when you need to inspect, extend, or combine that registry yourself.

## Add Your Own Schemas On Top Of The Official Registry

`referencing.Registry` is immutable. Methods like `with_resource(...)` return a new registry, so keep the returned value.

This is the most useful pattern when your application has internal schemas that `$ref` the official drafts plus your own IDs:

```python
from jsonschema import Draft202012Validator
from jsonschema_specifications import REGISTRY
from referencing.jsonschema import DRAFT202012

address_schema = {
    "$id": "https://example.com/schemas/address",
    "type": "object",
    "properties": {
        "city": {"type": "string"},
        "postal_code": {"type": "string"},
    },
    "required": ["city", "postal_code"],
}

registry = REGISTRY.with_resource(
    address_schema["$id"],
    DRAFT202012.create_resource(address_schema),
)

order_schema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "object",
    "properties": {
        "shipping_address": {"$ref": "https://example.com/schemas/address"},
    },
    "required": ["shipping_address"],
}

validator = Draft202012Validator(order_schema, registry=registry)
validator.validate(
    {
        "shipping_address": {
            "city": "Paris",
            "postal_code": "75001",
        }
    }
)
```

## Combine Registries

If you already have another `referencing.Registry`, merge it with the official JSON Schema resources instead of rebuilding everything manually:

```python
from jsonschema_specifications import REGISTRY as SPECIFICATIONS
from referencing import Registry
from referencing.jsonschema import DRAFT202012

custom = Registry().with_resource(
    "https://example.com/non-negative-integer",
    DRAFT202012.create_resource({"type": "integer", "minimum": 0}),
)

registry = SPECIFICATIONS.combine(custom)

print(registry.contents("https://example.com/non-negative-integer"))
```

## Common Pitfalls

- This package does not validate JSON by itself. It provides the official schemas as data; use it together with `jsonschema` or other `referencing`-based tooling.
- `REGISTRY` is immutable. `with_resource(...)`, `with_resources(...)`, and `combine(...)` return new registry objects.
- `referencing.Registry` does not automatically fetch remote `$ref` targets. If your schemas depend on remote documents, configure retrieval explicitly in your own registry instead of assuming network access.
- Use the correct canonical URI for the draft your schema declares in `$schema`. A mismatch between the draft URI and the validator class can produce confusing failures.

## Version Notes For `2025.9.1`

- PyPI shows `jsonschema-specifications 2025.9.1` was released on September 8, 2025.
- PyPI lists Python 3.9+ support for this release.
- The 2025.9.1 documentation describes `REGISTRY` as containing 20 official resources.

## Official Sources

- https://jsonschema-specifications.readthedocs.io/en/stable/
- https://jsonschema-specifications.readthedocs.io/en/stable/api/
- https://pypi.org/project/jsonschema-specifications/
- https://python-jsonschema.readthedocs.io/en/stable/validate/
- https://python-jsonschema.readthedocs.io/en/v4.18.6/referencing/
- https://referencing.readthedocs.io/en/stable/api/
