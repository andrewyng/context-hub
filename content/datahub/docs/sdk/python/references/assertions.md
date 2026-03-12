# Bulk Data Quality Assertions

Create and manage smart assertions at scale using the DataHub Cloud Python SDK (`acryl-datahub-cloud`).

The actor making API calls needs `Edit Assertions` and `Edit Monitors` privileges.

## Setup

```python
from datahub.sdk import DataHubClient, FilterDsl as F
from datahub.metadata.urns import DatasetUrn

client = DataHubClient(server="<your_server>", token="<your_token>")
```

## Discover Target Tables

### By specific URNs

```python
table_urns = [
    "urn:li:dataset:(urn:li:dataPlatform:snowflake,database.schema.users,PROD)",
    "urn:li:dataset:(urn:li:dataPlatform:snowflake,database.schema.orders,PROD)",
]
datasets = [DatasetUrn.from_string(urn) for urn in table_urns]
```

### By search pattern

```python
results = client.search.get_urns(
    filter=F.and_(
        F.entity_type("dataset"),
        F.platform("snowflake"),
        F.env("PROD"),
    )
)
datasets = [DatasetUrn.from_string(str(urn)) for urn in results]
```

### By tag or domain

```python
critical_datasets = client.search.get_urns(
    filter=F.and_(
        F.entity_type("dataset"),
        F.tag("urn:li:tag:critical"),
    )
)
```

## Create Table-Level Assertions

### Freshness assertions

```python
def create_freshness_assertions(datasets, client):
    for dataset_urn in datasets:
        try:
            assertion = client.assertions.sync_smart_freshness_assertion(
                dataset_urn=dataset_urn,
                display_name="Freshness Anomaly Monitor",
                detection_mechanism="information_schema",
                sensitivity="medium",
                tags=["automated", "freshness", "data_quality"],
                enabled=True,
            )
            print(f"Created freshness assertion for {dataset_urn.name}: {assertion.urn}")
        except Exception as e:
            print(f"Failed for {dataset_urn.name}: {e}")
```

### Volume assertions

```python
def create_volume_assertions(datasets, client):
    for dataset_urn in datasets:
        try:
            assertion = client.assertions.sync_smart_volume_assertion(
                dataset_urn=dataset_urn,
                display_name="Smart Volume Check",
                detection_mechanism="information_schema",
                sensitivity="medium",
                tags=["automated", "volume", "data_quality"],
                schedule="0 */6 * * *",
                enabled=True,
            )
            print(f"Created volume assertion for {dataset_urn.name}: {assertion.urn}")
        except Exception as e:
            print(f"Failed for {dataset_urn.name}: {e}")
```

### SQL assertions

```python
def create_sql_assertions(datasets, client):
    sql_queries = {
        "row_count": "SELECT COUNT(*) FROM {table_name}",
        "null_check": "SELECT COUNT(*) FROM {table_name} WHERE id IS NULL",
    }

    for dataset_urn in datasets:
        for query_name, query_template in sql_queries.items():
            try:
                statement = query_template.format(table_name=dataset_urn.name)
                assertion = client.assertions.sync_smart_sql_assertion(
                    dataset_urn=dataset_urn,
                    display_name=f"Smart SQL - {query_name}",
                    statement=statement,
                    sensitivity="medium",
                    tags=["automated", "smart_sql", query_name],
                    schedule="0 */6 * * *",
                    enabled=True,
                )
                print(f"Created SQL assertion '{query_name}' for {dataset_urn.name}: {assertion.urn}")
            except Exception as e:
                print(f"Failed SQL assertion '{query_name}' for {dataset_urn.name}: {e}")
```

## Get Column Information

```python
def get_dataset_columns(client, dataset_urn):
    try:
        dataset = client.entities.get(dataset_urn)
        if dataset and dataset.schema:
            return [
                {
                    "name": field.field_path,
                    "type": field.native_type,
                }
                for field in dataset.schema
            ]
        return []
    except Exception as e:
        print(f"Failed to get columns for {dataset_urn}: {e}")
        return []

dataset_columns = {}
for dataset_urn in datasets:
    columns = get_dataset_columns(client, dataset_urn)
    dataset_columns[str(dataset_urn)] = columns
```

## Create Column-Level Assertions

```python
import fnmatch

ASSERTION_RULES = {
    "null_checks": {
        "column_patterns": ["id", "*_id", "user_id", "email"],
        "metric_type": "null_count",
    },
    "unique_checks": {
        "column_patterns": ["*_id", "email", "username"],
        "metric_type": "unique_count",
    },
    "empty_checks": {
        "column_patterns": ["name", "description", "title"],
        "metric_type": "empty_count",
    },
}

def should_apply_rule(column_name, rule_config):
    return any(
        fnmatch.fnmatch(column_name.lower(), pattern.lower())
        for pattern in rule_config["column_patterns"]
    )

def create_column_assertions(datasets, columns_dict, client):
    for dataset_urn in datasets:
        columns = columns_dict.get(str(dataset_urn), [])
        for column in columns:
            for rule_name, rule_config in ASSERTION_RULES.items():
                if should_apply_rule(column["name"], rule_config):
                    try:
                        client.assertions.sync_smart_column_metric_assertion(
                            dataset_urn=dataset_urn,
                            column_name=column["name"],
                            metric_type=rule_config["metric_type"],
                            display_name=f"{rule_name} - {column['name']}",
                            detection_mechanism="all_rows_query_datahub_dataset_profile",
                            tags=["automated", "column_quality", rule_name],
                            enabled=True,
                        )
                        print(f"Created {rule_name} for {dataset_urn.name}.{column['name']}")
                    except Exception as e:
                        print(f"Failed {rule_name} for {dataset_urn.name}.{column['name']}: {e}")
```

## Update Existing Assertions

Pass the existing assertion URN to update rather than create:

```python
updated = client.assertions.sync_smart_freshness_assertion(
    dataset_urn=dataset_urn,
    urn=existing_assertion_urn,
    sensitivity="high",
    tags=["automated", "freshness", "updated"],
    enabled=True,
)
```

## Batch Processing

```python
import time

def batch_create_assertions(datasets, client, batch_size=10, delay_seconds=1.0):
    results = {"successful": [], "failed": []}

    for i in range(0, len(datasets), batch_size):
        batch = datasets[i : i + batch_size]
        for dataset_urn in batch:
            try:
                assertion = client.assertions.sync_smart_freshness_assertion(
                    dataset_urn=dataset_urn,
                    tags=["batch_created", "automated"],
                    enabled=True,
                )
                results["successful"].append(
                    {"dataset": str(dataset_urn), "assertion": str(assertion.urn)}
                )
            except Exception as e:
                results["failed"].append({"dataset": str(dataset_urn), "error": str(e)})

        if i + batch_size < len(datasets):
            time.sleep(delay_seconds)

    return results
```

## Important Considerations

- **Single-threaded per dataset:** Always process assertions for a given dataset in a single thread to avoid race conditions.
- **Entities must exist:** Target datasets must already be present in DataHub before creating assertions.
- **Sensitivity levels:** `"low"`, `"medium"`, `"high"` control anomaly detection thresholds.
- **Detection mechanisms:** Use `"information_schema"` for table-level, `"all_rows_query_datahub_dataset_profile"` for column-level.
- **Tags:** Plain tag names are auto-converted to URNs (e.g., `"critical"` becomes `"urn:li:tag:critical"`).
- **Wait for processing:** Writes are async via Kafka. Wait for the previous batch to be reflected in the UI before re-running sync operations.
