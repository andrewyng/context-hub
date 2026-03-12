# Lineage Operations

Advanced lineage patterns using the DataHub Python SDK `LineageClient`.

## Cross-Entity Lineage

The `add_lineage()` method supports lineage between any combination of:

- Dataset to Dataset
- Dataset to Chart
- Dataset to DataJob
- DataJob to DataJob
- DataJob to Dataset
- Dashboard to Chart
- Dashboard to Dataset
- Dashboard to Dashboard

```python
client.lineage.add_lineage(
    upstream="urn:li:dataset:(urn:li:dataPlatform:snowflake,raw.events,PROD)",
    downstream="urn:li:chart:(looker,chart_events_overview)",
)
```

## Column Lineage Options

The `column_lineage` parameter on `add_lineage()` accepts several forms:

```python
# Auto-match columns by name (fuzzy matching)
client.lineage.add_lineage(
    upstream="urn:li:dataset:(urn:li:dataPlatform:postgres,users,PROD)",
    downstream="urn:li:dataset:(urn:li:dataPlatform:snowflake,users_replica,PROD)",
    column_lineage="auto_fuzzy",
)

# Strict auto-match (exact column name match)
client.lineage.add_lineage(
    upstream=upstream_urn,
    downstream=downstream_urn,
    column_lineage="auto_strict",
)

# Explicit column mapping (downstream_col -> [upstream_cols])
client.lineage.add_lineage(
    upstream=upstream_urn,
    downstream=downstream_urn,
    column_lineage={
        "user_id": ["id"],
        "full_name": ["first_name", "last_name"],
    },
)

# No column lineage (default)
client.lineage.add_lineage(
    upstream=upstream_urn,
    downstream=downstream_urn,
    column_lineage=False,
)
```

## DataJob Lineage

Connect pipelines (Airflow tasks, Spark jobs) to their inputs and outputs:

```python
# Datajob to downstream dataset
client.lineage.add_lineage(
    upstream="urn:li:dataJob:(urn:li:dataFlow:(airflow,etl_pipeline,PROD),load_users)",
    downstream="urn:li:dataset:(urn:li:dataPlatform:snowflake,analytics.users,PROD)",
)

# Dataset to datajob (upstream input)
client.lineage.add_lineage(
    upstream="urn:li:dataset:(urn:li:dataPlatform:postgres,users,PROD)",
    downstream="urn:li:dataJob:(urn:li:dataFlow:(airflow,etl_pipeline,PROD),load_users)",
)
```

## SQL-Based Lineage Inference

Let the SDK parse SQL to automatically extract upstream/downstream relationships:

```python
client.lineage.infer_lineage_from_sql(
    query_text="""
        INSERT INTO analytics.daily_revenue
        SELECT date, SUM(amount) AS revenue
        FROM raw.orders
        JOIN raw.products ON orders.product_id = products.id
        GROUP BY date
    """,
    platform="snowflake",
    env="PROD",
    default_db="my_database",
    default_schema="public",
)
```

Parameters:

| Parameter | Description |
|-----------|-------------|
| `query_text` | The SQL query to parse |
| `platform` | Data platform identifier (e.g., `"snowflake"`, `"bigquery"`) |
| `platform_instance` | Optional platform instance |
| `env` | Environment, defaults to `"PROD"` |
| `default_db` | Default database for unqualified table names |
| `default_schema` | Default schema for unqualified table names |
| `override_dialect` | Override SQL dialect for parsing |

## Filtered Lineage

Combine `get_lineage()` with search filters to narrow results:

```python
from datahub.sdk import FilterDsl as F

results = client.lineage.get_lineage(
    source_urn=dataset_urn,
    direction="downstream",
    max_hops=3,
    filter=F.and_(
        F.entity_type("dataset"),
        F.platform("snowflake"),
    ),
)
```

## LineageResult Object

Each result from `get_lineage()` is a `LineageResult`:

| Field | Type | Description |
|-------|------|-------------|
| `urn` | `str` | URN of the related entity |
| `type` | `str` | Entity type (dataset, chart, etc.) |
| `hops` | `int` | Number of hops from the source |
| `direction` | `"upstream" \| "downstream"` | Traversal direction |
| `platform` | `str \| None` | Platform name |
| `name` | `str \| None` | Entity display name |
| `description` | `str \| None` | Entity description |
| `paths` | `List[LineagePath] \| None` | Lineage paths with intermediate entities |

## View Lineage (Auto-Parsed)

Datasets with `view_definition` set automatically extract upstream lineage from the SQL:

```python
from datahub.sdk import Dataset

view = Dataset(
    platform="snowflake",
    name="analytics.reporting.sales_summary",
    view_definition="SELECT * FROM analytics.raw.sales WHERE year = 2024",
    subtype="view",
)
# view.upstreams is auto-populated with analytics.raw.sales

client.entities.upsert(view)
```

Set `parse_view_lineage=False` to disable auto-parsing.
