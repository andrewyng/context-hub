# Entity Reference

Advanced information & guidelines for specific entity types.

## Containers

Datasets are organized physically using the container entity (e.g. databases, schemas, folders).

```python
from datahub.sdk import Container
from datahub.emitter.mcp_builder import DatabaseKey, SchemaKey

database_key = DatabaseKey(
    platform="snowflake",
    instance="production",
    database="analytics_db",
)

database_container = Container(
    database_key,
    display_name="Analytics Database",
    description="Main analytics database",
    subtype="Database",
)
client.entities.upsert(database_container)

schema_key = SchemaKey(
    platform="snowflake",
    instance="production",
    database="analytics_db",
    schema="reporting",
)

schema_container = Container(
    schema_key,
    display_name="Reporting Schema",
    description="Schema for reporting tables and views",
    subtype="Schema",
    parent_container=database_key,
    domain="urn:li:domain:analytics",
)
client.entities.upsert(schema_container)
```

## Documents

Documents store knowledge content — tutorials, runbooks, FAQs, or references to external docs in systems like Notion or Confluence.

### Native document (stored in DataHub)

```python
from datahub.sdk import Document

doc = Document.create_document(
    id="getting-started-guide",
    title="Getting Started with DataHub",
    text="# Welcome\n\nThis guide will help you get started...",
    tags=["onboarding"],
    domain="urn:li:domain:data-governance",
)
client.entities.upsert(doc)
```

### External document (Notion, Confluence, etc.)

```python
doc = Document.create_external_document(
    id="notion-team-handbook",
    title="Engineering Handbook",
    platform="notion",
    external_url="https://notion.so/team/engineering-handbook",
    external_id="notion-page-abc123",
    text="Summary of the handbook for search indexing...",
)
client.entities.upsert(doc)
```

### AI-only context document

Documents hidden from global search/sidebar, accessible only through related assets:

```python
doc = Document.create_document(
    id="orders-dataset-context",
    title="Orders Dataset Context",
    text="This dataset contains daily order summaries...",
    show_in_global_context=False,
    related_assets=["urn:li:dataset:(urn:li:dataPlatform:snowflake,orders,PROD)"],
)
client.entities.upsert(doc)
```

### Document properties

- `doc.set_title("New Title")` / `doc.title`
- `doc.set_text("New content")` / `doc.text`
- `doc.publish()` / `doc.unpublish()` / `doc.status`
- `doc.set_parent_document("urn:li:document:parent-doc")` — hierarchical organization
- `doc.add_related_asset("urn:li:dataset:...")` / `doc.set_related_assets([...])`
- `doc.add_related_document("urn:li:document:...")` / `doc.set_related_documents([...])`
- `doc.hide_from_global_context()` / `doc.show_in_global_search()`
