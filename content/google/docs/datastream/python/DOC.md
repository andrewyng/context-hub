---
name: datastream
description: "Google Cloud Datastream Python client for regional connection profiles, stream creation, discovery, and stream lifecycle management"
metadata:
  languages: "python"
  versions: "1.17.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,google-cloud,datastream,gcp,cdc,bigquery,cloud-storage,python"
---

# Google Cloud Datastream Python Client

## Golden Rule

Use the official `google-cloud-datastream` package with the generated `google.cloud.datastream_v1` client, and always point the client at the Datastream region you are working in.

Datastream is regional. The client reference explicitly notes that you should use regional endpoints such as `us-central1-datastream.googleapis.com`, and your stream plus its source and destination connection profiles must live in the same location.

## Install

```bash
python -m pip install "google-cloud-datastream==1.17.0"
```

Common alternatives:

```bash
uv add "google-cloud-datastream==1.17.0"
poetry add "google-cloud-datastream==1.17.0"
```

## Prerequisites And Authentication

Enable Datastream in the target Google Cloud project, then authenticate with Application Default Credentials (ADC).

Local development:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="your-project-id"
export DATASTREAM_LOCATION="us-central1"
```

Service account key fallback:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
export GOOGLE_CLOUD_PROJECT="your-project-id"
export DATASTREAM_LOCATION="us-central1"
```

If you are running on Google Cloud, prefer the attached service account or workload identity instead of shipping key files.

## Initialize A Regional Client

```python
import os

from google.api_core.client_options import ClientOptions
from google.cloud import datastream_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ["DATASTREAM_LOCATION"]
parent = f"projects/{project_id}/locations/{location}"

client = datastream_v1.DatastreamClient(
    client_options=ClientOptions(
        api_endpoint=f"{location}-datastream.googleapis.com:443"
    )
)
```

Use the helper methods when you need full resource names:

```python
source_profile_name = client.connection_profile_path(
    project_id, location, "mysql-source"
)
stream_name = client.stream_path(project_id, location, "mysql-to-bq")
```

## List Existing Connection Profiles And Streams

```python
for profile in client.list_connection_profiles(parent=parent):
    print(profile.name, profile.display_name)

for stream in client.list_streams(parent=parent):
    print(stream.name, stream.state)
```

## Fetch Static IPs For Public Source Connectivity

If your source database is reachable over public IP and you plan to use Datastream static service IP connectivity, fetch the region's allowlist addresses first:

```python
response = client.fetch_static_ips(name=parent)

for ip in response.static_ips:
    print(ip)
```

## Create A Source Connection Profile

This example creates a MySQL source profile with static service IP connectivity:

```python
import os

from google.cloud import datastream_v1

operation = client.create_connection_profile(
    parent=parent,
    connection_profile_id="mysql-source",
    connection_profile=datastream_v1.ConnectionProfile(
        display_name="mysql-source",
        mysql_profile=datastream_v1.MysqlProfile(
            hostname=os.environ["MYSQL_HOST"],
            port=3306,
            username=os.environ["MYSQL_USER"],
            password=os.environ["MYSQL_PASSWORD"],
        ),
        static_service_ip_connectivity=datastream_v1.StaticServiceIpConnectivity(),
    ),
)

source_profile = operation.result()
print(source_profile.name)
```

Create methods return long-running operations. Wait on `.result()` before using the created resource name in later calls.

## Create A Destination Connection Profile

BigQuery destination profile:

```python
from google.cloud import datastream_v1

operation = client.create_connection_profile(
    parent=parent,
    connection_profile_id="bq-destination",
    connection_profile=datastream_v1.ConnectionProfile(
        display_name="bq-destination",
        bigquery_profile=datastream_v1.BigQueryProfile(),
    ),
)

bq_profile = operation.result()
print(bq_profile.name)
```

Cloud Storage destination profile:

```python
from google.cloud import datastream_v1

operation = client.create_connection_profile(
    parent=parent,
    connection_profile_id="gcs-destination",
    connection_profile=datastream_v1.ConnectionProfile(
        display_name="gcs-destination",
        gcs_profile=datastream_v1.GcsProfile(
            bucket="my-datastream-bucket",
            root_path="/datastream",
        ),
    ),
)

gcs_profile = operation.result()
print(gcs_profile.name)
```

## Create A Stream To BigQuery

```python
from google.cloud import datastream_v1
from google.protobuf import duration_pb2

stream = datastream_v1.Stream(
    display_name="mysql-to-bq",
    source_config=datastream_v1.SourceConfig(
        source_connection_profile=source_profile.name,
        mysql_source_config=datastream_v1.MysqlSourceConfig(
            include_objects=datastream_v1.MysqlRdbms(
                mysql_databases=[
                    datastream_v1.MysqlDatabase(
                        database="app",
                        mysql_tables=[
                            datastream_v1.MysqlTable(table="customers"),
                            datastream_v1.MysqlTable(table="orders"),
                        ],
                    )
                ]
            )
        ),
    ),
    destination_config=datastream_v1.DestinationConfig(
        destination_connection_profile=bq_profile.name,
        bigquery_destination_config=datastream_v1.BigQueryDestinationConfig(
            single_target_dataset=datastream_v1.BigQueryDestinationConfig.SingleTargetDataset(
                dataset_id="your-project-id:raw_cdc",
            ),
            append_only=datastream_v1.BigQueryDestinationConfig.AppendOnly(),
            data_freshness=duration_pb2.Duration(seconds=900),
        ),
    ),
    backfill_all=datastream_v1.Stream.BackfillAllStrategy(),
)

operation = client.create_stream(
    parent=parent,
    stream_id="mysql-to-bq",
    stream=stream,
)

created_stream = operation.result()
print(created_stream.name)
```

Use `append_only` when you want a pure change log in BigQuery. If you omit it, Datastream uses merge semantics where possible, but tables without primary keys still behave as append-only.

## Stream To Cloud Storage Instead

Swap the destination section when you want files in Cloud Storage instead of BigQuery:

```python
from google.cloud import datastream_v1
from google.protobuf import duration_pb2

destination_config = datastream_v1.DestinationConfig(
    destination_connection_profile=gcs_profile.name,
    gcs_destination_config=datastream_v1.GcsDestinationConfig(
        path="/cdc-files",
        file_rotation_mb=200,
        file_rotation_interval=duration_pb2.Duration(seconds=60),
        avro_file_format=datastream_v1.AvroFileFormat(),
    ),
)
```

`GcsDestinationConfig.path` and `GcsProfile.root_path` are bucket-internal prefixes. Use slash-prefixed paths such as `"/datastream"` or `"/cdc-files"`.

## Pause Or Resume A Stream

Normal lifecycle changes use `update_stream()` with a field mask:

```python
from google.cloud import datastream_v1
from google.protobuf import field_mask_pb2

pause_operation = client.update_stream(
    stream=datastream_v1.Stream(
        name=created_stream.name,
        state=datastream_v1.Stream.State.PAUSED,
    ),
    update_mask=field_mask_pb2.FieldMask(paths=["state"]),
)
pause_operation.result()

resume_operation = client.update_stream(
    stream=datastream_v1.Stream(
        name=created_stream.name,
        state=datastream_v1.Stream.State.RUNNING,
    ),
    update_mask=field_mask_pb2.FieldMask(paths=["state"]),
)
resume_operation.result()
```

Use `run_stream()` only when you need non-default recovery or a specific CDC start position. For normal start, pause, and resume operations, update the stream state instead.

## Discover Source Objects Before You Create A Stream

Use discovery when you want the source schema as Datastream sees it before you lock in `include_objects` or `exclude_objects`:

```python
from google.cloud import datastream_v1

response = client.discover_connection_profile(
    request=datastream_v1.DiscoverConnectionProfileRequest(
        parent=parent,
        connection_profile_name=source_profile.name,
    )
)

print(response)
```

The response shape depends on the source profile type. For relational sources, inspect the returned database and table objects and then build a narrower `MysqlSourceConfig`, `OracleSourceConfig`, or `PostgresqlSourceConfig` for the actual stream.

## Practical Pitfalls

- Keep the client endpoint, stream location, and connection profile location aligned. Datastream resources are regional, not global.
- Wait for every create, update, or delete operation to finish. Most control-plane methods return long-running operations.
- For retryable create and update paths, pass a `request_id` if you need server-side deduplication of repeated requests.
- Use `fetch_static_ips()` before opening source database firewalls for static public connectivity.
- Prefer ADC and attached service accounts. Only use `GOOGLE_APPLICATION_CREDENTIALS` as a fallback when ADC is not already available.
