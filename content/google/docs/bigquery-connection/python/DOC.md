---
name: bigquery-connection
description: "Google Cloud BigQuery Connection Python client for creating and managing external connections"
metadata:
  languages: "python"
  versions: "1.20.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,bigquery,connection,gcp,cloud-sql,iam,federated-query,python"
---

# Google Cloud BigQuery Connection Python Client

## Golden Rule

Use the official `google-cloud-bigquery-connection` package with `from google.cloud import bigquery_connection_v1`, and authenticate with Application Default Credentials (ADC).

This client manages BigQuery connection resources. A connection is regional, has exactly one backend-specific configuration such as `cloud_resource` or `cloud_sql`, and is addressed as `projects/PROJECT_ID/locations/LOCATION/connections/CONNECTION_ID`.

## Install

Pin the package version your project expects:

```bash
python -m pip install "google-cloud-bigquery-connection==1.20.0"
```

Common alternatives:

```bash
uv add "google-cloud-bigquery-connection==1.20.0"
poetry add "google-cloud-bigquery-connection==1.20.0"
```

PyPI lists `1.20.0` as supporting Python 3.7 and later.

## Authentication And Setup

Enable the API once per project:

```bash
gcloud services enable bigqueryconnection.googleapis.com
```

Recommended local setup:

```bash
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
export GOOGLE_CLOUD_PROJECT="YOUR_PROJECT_ID"
export BIGQUERY_LOCATION="US"
```

Service account fallback:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
export GOOGLE_CLOUD_PROJECT="YOUR_PROJECT_ID"
export BIGQUERY_LOCATION="US"
```

Practical setup notes:

- Use ADC rather than API keys.
- The package uses the BigQuery Connection API service `bigqueryconnection.googleapis.com`.
- Connections are regional. Use a location such as `US`, `EU`, or a specific region that matches the connection type you are creating.
- To manage connections, Google documents `roles/bigquery.connectionAdmin`. To use an existing connection in queries, Google documents `roles/bigquery.connectionUser`.

## Initialize The Client

```python
import os

from google.cloud import bigquery_connection_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("BIGQUERY_LOCATION", "US")

client = bigquery_connection_v1.ConnectionServiceClient()
parent = client.common_location_path(project_id, location)
```

Use one reusable `ConnectionServiceClient` for normal application code instead of recreating it for every request.

## Common Workflows

### Create A Cloud Resource Connection

Cloud resource connections create a Google-managed service account. Grant that service account access to the target Google Cloud resource after creation.

```python
import os

from google.cloud import bigquery_connection_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("BIGQUERY_LOCATION", "US")

client = bigquery_connection_v1.ConnectionServiceClient()
parent = client.common_location_path(project_id, location)

connection = bigquery_connection_v1.Connection(
    friendly_name="analytics-gcs-connection",
    description="Used by BigQuery jobs that need Google Cloud resource access",
    cloud_resource=bigquery_connection_v1.CloudResourceProperties(),
)

request = bigquery_connection_v1.CreateConnectionRequest(
    parent=parent,
    connection_id="analytics_gcs_connection",
    connection=connection,
)

created = client.create_connection(request=request)

print(created.name)
print(created.cloud_resource.service_account_id)
```

Typical next step: grant `created.cloud_resource.service_account_id` the IAM role it needs on the bucket, object table source, or other Google Cloud resource.

### Create A Cloud SQL Connection

Use a Cloud SQL connection when BigQuery needs stored credentials for Cloud SQL federation. The instance ID is the Cloud SQL connection name in `PROJECT:REGION:INSTANCE` form.

```python
import os

from google.cloud import bigquery_connection_v1 as bq_connection

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("BIGQUERY_LOCATION", "US")

cloud_sql = bq_connection.CloudSqlProperties(
    instance_id=os.environ["CLOUD_SQL_INSTANCE_ID"],
    database=os.environ["CLOUD_SQL_DATABASE"],
    type_=bq_connection.CloudSqlProperties.DatabaseType.MYSQL,
    credential=bq_connection.CloudSqlCredential(
        username=os.environ["CLOUD_SQL_USERNAME"],
        password=os.environ["CLOUD_SQL_PASSWORD"],
    ),
)

client = bq_connection.ConnectionServiceClient()
parent = client.common_location_path(project_id, location)

request = bq_connection.CreateConnectionRequest(
    parent=parent,
    connection_id="orders_mysql",
    connection=bq_connection.Connection(
        friendly_name="orders-mysql",
        description="BigQuery federation into Cloud SQL for MySQL",
        cloud_sql=cloud_sql,
    ),
)

created = client.create_connection(request=request)
print(created.name)
```

The Python type docs expose `MYSQL` and `POSTGRES` as `CloudSqlProperties.DatabaseType` values. Keep database credentials in environment variables or a secret manager, not in source control.

### List Connections In A Project And Location

```python
import os

from google.cloud import bigquery_connection_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("BIGQUERY_LOCATION", "US")

client = bigquery_connection_v1.ConnectionServiceClient()
parent = client.common_location_path(project_id, location)

request = bigquery_connection_v1.ListConnectionsRequest(
    parent=parent,
    page_size=100,
)

for connection in client.list_connections(request=request):
    print(connection.name)
    print(connection.friendly_name)
    print(connection.has_credential)
```

`has_credential` is useful when you need to confirm whether a credential-backed connection such as Cloud SQL has stored credentials.

### Get Connection Metadata

`get_connection()` returns metadata, but Google’s samples explicitly note that credential secrets are not returned.

```python
import os

from google.cloud import bigquery_connection_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("BIGQUERY_LOCATION", "US")
connection_id = os.environ["BIGQUERY_CONNECTION_ID"]

client = bigquery_connection_v1.ConnectionServiceClient()
name = client.connection_path(project_id, location, connection_id)

connection = client.get_connection(name=name)

print(connection.name)
print(connection.friendly_name)
print(connection.description)

if connection.cloud_sql:
    print(connection.cloud_sql.instance_id)
    print(connection.cloud_sql.database)
```

### Update Friendly Name Or Description

Use a field mask so you only update the metadata you intend to change.

```python
import os

from google.cloud import bigquery_connection_v1
from google.protobuf import field_mask_pb2

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("BIGQUERY_LOCATION", "US")
connection_id = os.environ["BIGQUERY_CONNECTION_ID"]

client = bigquery_connection_v1.ConnectionServiceClient()
name = client.connection_path(project_id, location, connection_id)

connection = client.get_connection(name=name)
connection.friendly_name = "analytics-prod"
connection.description = "Used by scheduled BigQuery jobs"

updated = client.update_connection(
    request=bigquery_connection_v1.UpdateConnectionRequest(
        connection=connection,
        update_mask=field_mask_pb2.FieldMask(
            paths=["friendly_name", "description"]
        ),
    )
)

print(updated.name)
print(updated.friendly_name)
```

Google’s manage-connections guide warns that updating connection properties resets the credential. For Cloud SQL connections, do not modify backend properties casually; if you must change credential-bearing properties, be ready to set credentials again.

### Inspect IAM Bindings On A Connection

```python
import os

from google.cloud import bigquery_connection_v1
from google.iam.v1 import iam_policy_pb2

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("BIGQUERY_LOCATION", "US")
connection_id = os.environ["BIGQUERY_CONNECTION_ID"]

client = bigquery_connection_v1.ConnectionServiceClient()
resource = client.connection_path(project_id, location, connection_id)

policy = client.get_iam_policy(
    request=iam_policy_pb2.GetIamPolicyRequest(resource=resource)
)

for binding in policy.bindings:
    print(binding.role, list(binding.members))
```

Use this to confirm which principals currently have `roles/bigquery.connectionUser` or `roles/bigquery.connectionAdmin` on the connection resource.

### Delete A Connection

Deleting a connection also deletes its associated credential.

```python
import os

from google.cloud import bigquery_connection_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("BIGQUERY_LOCATION", "US")
connection_id = os.environ["BIGQUERY_CONNECTION_ID"]

client = bigquery_connection_v1.ConnectionServiceClient()
name = client.connection_path(project_id, location, connection_id)

client.delete_connection(name=name)
print(f"Deleted {name}")
```

## Common Pitfalls

- Do not use API keys. This client is designed around ADC and IAM credentials.
- Do not treat connections as global. Listing, getting, and creating all require the correct location.
- `Connection` uses backend-specific fields such as `cloud_resource` and `cloud_sql`; set the one you actually need instead of trying to combine multiple backends in one connection.
- `get_connection()` does not return stored credential secrets. If your code expects to read back a password, it is using the API incorrectly.
- Google documents that updating connection properties resets credentials. Limit updates to `friendly_name` and `description` unless you intentionally want to change backend settings and re-supply credentials.
- A Cloud resource connection is not usable by itself until you grant the generated service account access to the external Google Cloud resource.
- BigQuery connection IAM is separate from access to the underlying system. A user may be allowed to use a connection but still fail if the connection’s service account lacks access to the target resource.

## Official Sources

- PyPI package: https://pypi.org/project/google-cloud-bigquery-connection/
- Python client reference: https://cloud.google.com/python/docs/reference/bigqueryconnection/latest
- `ConnectionServiceClient` reference: https://cloud.google.com/python/docs/reference/bigqueryconnection/latest/google.cloud.bigquery_connection_v1.services.connection_service.ConnectionServiceClient
- `Connection` type reference: https://cloud.google.com/python/docs/reference/bigqueryconnection/latest/google.cloud.bigquery_connection_v1.types.Connection
- `CloudSqlProperties` type reference: https://cloud.google.com/python/docs/reference/bigqueryconnection/latest/google.cloud.bigquery_connection_v1.types.CloudSqlProperties
- BigQuery connections overview: https://cloud.google.com/bigquery/docs/connections-api-intro
- Manage connections: https://cloud.google.com/bigquery/docs/working-with-connections
- Create a Cloud resource connection sample: https://docs.cloud.google.com/bigquery/docs/samples/bigqueryconnection-connectionservice-connection-create
- Create a Cloud SQL connection sample: https://docs.cloud.google.com/bigquery/docs/samples/bigqueryconnection-create-connection
- List connections sample: https://docs.cloud.google.com/bigquery/docs/samples/bigqueryconnection-connectionservice-connections-list
- Get connection metadata sample: https://docs.cloud.google.com/bigquery/docs/samples/bigqueryconnection-connectionservice-connection-get
