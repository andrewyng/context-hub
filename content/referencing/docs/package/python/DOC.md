---
name: package
description: "Python library for building registries of JSON resources and resolving references across JSON Schema and related specifications"
metadata:
  languages: "python"
  versions: "0.37.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "referencing,jsonschema,refs,json,python"
---

# referencing Python Package Guide

## Golden Rule

Use `referencing` to build an immutable `Registry` of `Resource` objects and resolve references with an explicit specification. For JSON Schema work, import the dialect you need from `referencing.jsonschema` instead of assuming the library can infer it from partial documents.

`referencing` has no API key, auth flow, or environment-variable configuration. Everything is configured in Python code.

## Install

`referencing 0.37.0` requires Python 3.10 or newer.

```bash
python -m pip install "referencing==0.37.0"
```

Common alternatives:

```bash
uv add "referencing==0.37.0"
poetry add "referencing==0.37.0"
```

## Core Types

- `Registry`: an immutable collection of resources, optionally with a retrieval callback
- `Resource`: document contents plus the specification used to interpret IDs, anchors, and subresources
- `Specification`: rules for how references behave, such as `DRAFT202012` or `DRAFT7`

Every mutating-looking operation returns a new registry. Reassign the result.

## Initialize A Registry For JSON Schema

If your schema includes `$schema` and `$id`, `Resource.from_contents` can detect the correct behavior automatically:

```python
from referencing import Registry, Resource

user_schema = Resource.from_contents(
    {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "$id": "https://example.com/schemas/user",
        "$defs": {
            "id": {"type": "integer"},
        },
        "type": "object",
        "properties": {
            "id": {"$ref": "#/$defs/id"},
        },
        "required": ["id"],
    }
)

registry = user_schema @ Registry()

resolved = registry.resolver().lookup("https://example.com/schemas/user#/$defs/id")
print(resolved.contents)  # {'type': 'integer'}
```

The `@` operator adds a resource to a registry using its internal identifier. Use it only when the resource actually has an ID the specification can discover.

## Add Schemas Without `$schema` Or `$id`

If your files omit `$schema`, pass the dialect explicitly. If they omit `$id`, store them under an external URI with `with_contents` or `with_resource`.

```python
from referencing import Registry
from referencing.jsonschema import DRAFT202012

registry = Registry().with_contents(
    [
        (
            "urn:example:user",
            {
                "type": "object",
                "properties": {
                    "id": {"type": "integer"},
                    "name": {"type": "string"},
                },
                "required": ["id", "name"],
            },
        )
    ],
    default_specification=DRAFT202012,
)

print(registry.contents("urn:example:user"))
```

Use this pattern for test fixtures, generated schemas, or bundled documents that do not carry full metadata.

## Retrieve Resources Lazily From Disk

`referencing` does not automatically fetch over the network. The supported way to load missing resources is to provide a retrieval function. The docs show this pattern for filesystem, YAML, SQLite, HTTP, or package-backed resources.

```python
from pathlib import Path

from referencing import Registry
from referencing.exceptions import NoSuchResource
from referencing.jsonschema import DRAFT202012
from referencing.retrieval import to_cached_resource

SCHEMA_DIR = Path(__file__).parent / "schemas"


@to_cached_resource(from_contents=DRAFT202012.create_resource)
def retrieve_from_disk(uri: str):
    name = uri.removeprefix("urn:schemas:")
    path = SCHEMA_DIR / f"{name}.json"
    if not path.is_file():
        raise NoSuchResource(uri)
    return path.read_text(encoding="utf-8")


registry = Registry(retrieve=retrieve_from_disk)

address = registry.resolver().lookup("urn:schemas:address")
print(address.contents)
```

`to_cached_resource` is useful when your retrieval function returns serialized content. It decodes the content once and caches the resulting `Resource`.

## Combine Registries

If your application has several independently-built registries, combine them before validation or reference lookup:

```python
from referencing import Registry
from referencing.jsonschema import DRAFT202012

project_registry = Registry().with_contents(
    [("urn:example:user", {"type": "object"})],
    default_specification=DRAFT202012,
)

shared_registry = Registry().with_contents(
    [("urn:example:address", {"type": "object"})],
    default_specification=DRAFT202012,
)

registry = project_registry.combine(shared_registry).crawl()
```

Use `crawl()` when you want the registry to eagerly discover nested subresources instead of waiting for lookups.

## Common Pitfalls

- Registries are immutable. `with_resource`, `with_contents`, `combine`, and similar calls do not modify the original object.
- `Resource.from_contents(...)` needs a detectable specification. For JSON Schema, that usually means a `$schema` field. If it is missing, pass `default_specification=` or construct the resource explicitly.
- The `@` operator only works when a resource has an internal ID. If a document does not declare one, store it under an external URI instead.
- Automatic retrieval is opt-in. If a `$ref` points at an unknown URI and you did not configure `Registry(retrieve=...)`, lookup will fail.
- Be careful with network retrieval. The JSON Schema specifications discourage automatically downloading schemas from the network.

## Version-Sensitive Notes For 0.37.0

- `0.37.0` adds Python 3.14 support and removes Python 3.9 support. The published package metadata requires Python 3.10+.
- The project still describes itself as beta software and uses `0.x` versioning. Pin the package version if you are writing a library or long-lived service.
- `referencing.retrieval.to_cached_resource` was added in `0.29.0`, and `referencing.jsonschema.EMPTY_REGISTRY` was added in `0.31.0`. Do not assume those helpers exist on older pins.

## Official Sources

- Maintainer docs root: https://referencing.readthedocs.io/en/stable/
- Introduction: https://referencing.readthedocs.io/en/stable/intro/
- JSON Schema integration: https://referencing.readthedocs.io/en/stable/jsonschema/
- Schema packages and retrieval: https://referencing.readthedocs.io/en/stable/schema-package/
- API reference: https://referencing.readthedocs.io/en/stable/api/
- Changelog: https://referencing.readthedocs.io/en/stable/changes/
- PyPI package: https://pypi.org/project/referencing/
