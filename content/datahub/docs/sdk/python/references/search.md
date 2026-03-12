# Search API

Detailed reference for searching and discovering metadata with the DataHub Python SDK.

## Overview

All search goes through `client.search.get_urns()`, which returns an iterable of URNs. You can search by text query, structured filters, or both.

```python
from datahub.sdk import DataHubClient, FilterDsl as F

client = DataHubClient.from_env()
results = client.search.get_urns(query="...", filter=F.platform("..."))
```

## Filter-Based Search

Structured filters scope results by platform, entity type, domain, and other metadata fields.

### Platform

Find all assets on a specific data platform.

```python
results = client.search.get_urns(filter=F.platform("snowflake"))

# Multiple platforms
results = client.search.get_urns(filter=F.platform(["snowflake", "bigquery"]))
```

Use when: you know which warehouse or system the asset lives in.

### Entity Type

Narrow to a specific entity type.

```python
results = client.search.get_urns(filter=F.entity_type("dataset"))
results = client.search.get_urns(filter=F.entity_type("dashboard"))
results = client.search.get_urns(filter=F.entity_type("chart"))
results = client.search.get_urns(filter=F.entity_type("document"))
results = client.search.get_urns(filter=F.entity_type("container"))
results = client.search.get_urns(filter=F.entity_type("dataFlow"))
results = client.search.get_urns(filter=F.entity_type("dataJob"))
results = client.search.get_urns(filter=F.entity_type("glossaryTerm"))
```

Use when: you need a specific kind of asset, not everything matching a keyword.

### Entity Subtype

Filter by subtype within an entity type (e.g., ML Experiment, View, Topic).

```python
results = client.search.get_urns(
    filter=F.and_(F.platform("mlflow"), F.entity_subtype("ML Experiment"))
)
```

Use when: a platform has multiple subtypes and you need a specific one.

### Domain

Find assets within a business domain.

```python
results = client.search.get_urns(filter=F.domain("urn:li:domain:marketing"))

# Multiple domains
results = client.search.get_urns(filter=F.domain(["urn:li:domain:marketing", "urn:li:domain:sales"]))
```

Use when: organizing or auditing assets by business function. Preferred over env-based filtering for logical organization.

### Container

Find assets within a specific container (database, schema, folder).

```python
results = client.search.get_urns(filter=F.container("urn:li:container:prod_analytics"))

# Direct descendants only (not nested containers)
results = client.search.get_urns(
    filter=F.container("urn:li:container:prod_analytics", direct_descendants_only=True)
)
```

Use when: browsing assets within a specific database or schema hierarchy.

### Owner

Find assets owned by a specific user or group.

```python
results = client.search.get_urns(filter=F.owner("urn:li:corpuser:jane"))
results = client.search.get_urns(filter=F.owner("urn:li:corpGroup:data-eng"))
```

Use when: auditing ownership or finding a team's assets.

### Tag

Find assets with a specific tag.

```python
results = client.search.get_urns(filter=F.tag("urn:li:tag:critical"))
results = client.search.get_urns(filter=F.tag(["urn:li:tag:pii", "urn:li:tag:sensitive"]))
```

Use when: finding assets by classification label.

### Glossary Term

Find assets annotated with a business glossary term.

```python
results = client.search.get_urns(filter=F.glossary_term("urn:li:glossaryTerm:PII"))
```

Use when: finding all assets governed by a specific business concept.

### Environment

Find assets in a specific environment.

```python
results = client.search.get_urns(filter=F.env("PROD"))
```

Note: prefer using domains or container hierarchies for logical organization over env-based filtering.

### Custom Properties

Find assets with a specific custom property value.

```python
results = client.search.get_urns(
    filter=F.has_custom_property("department", "sales")
)
```

Use when: searching by user-defined metadata that doesn't fit into tags or glossary terms.

### Deletion Status

Include or exclude soft-deleted assets.

```python
results = client.search.get_urns(filter=F.soft_deleted("NOT_SOFT_DELETED"))
```

### Custom Field Conditions

For advanced filtering on any `@Searchable`-annotated field in DataHub's metadata models.

```python
results = client.search.get_urns(
    filter=F.custom_filter(field="urn", condition="CONTAIN", values=["example_dataset"])
)

results = client.search.get_urns(
    filter=F.custom_filter(field="name", condition="START_WITH", values=["prod_"])
)
```

#### Supported conditions

| Condition | Description |
|-----------|-------------|
| `EQUAL` | Exact match |
| `CONTAIN` | Substring match |
| `START_WITH` | Prefix match |
| `END_WITH` | Suffix match |
| `GREATER_THAN` | Numeric/timestamp comparison |
| `GREATER_THAN_OR_EQUAL_TO` | Numeric/timestamp comparison |
| `LESS_THAN` | Numeric/timestamp comparison |
| `LESS_THAN_OR_EQUAL_TO` | Numeric/timestamp comparison |
| `IN` | Match any value in a list |
| `EXISTS` | Field is present |

#### Common searchable fields

Fields annotated with `@Searchable` in DataHub's PDL models can be used with `custom_filter`. Common ones include: `urn`, `name`, `description`, `env`, `platform`.

The exact searchable fields vary by entity type. Refer to the PDL model files in the [DataHub repo](https://github.com/datahub-project/datahub/tree/master/metadata-models/src/main/pegasus) for the full list.

## Common Patterns

### Find datasets tagged as critical but missing an owner

```python
critical = client.search.get_urns(filter=F.tag("urn:li:tag:critical"))
for urn in critical:
    entity = client.entities.get(urn)
    if not entity.owners:
        print(f"Missing owner: {urn}")
```

## Caching

`get_urns()` accepts a `skip_cache=True` parameter to bypass the search cache when you need fresh results immediately after a write:

```python
results = client.search.get_urns(query="new_table", skip_cache=True)
```
