---
name: bigquery-storage
description: "Google Cloud BigQuery Storage Python client for high-throughput table reads, Arrow/DataFrame downloads, and Storage Write API appends"
metadata:
  languages: "python"
  versions: "2.36.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,bigquery,bigquery-storage,google-cloud,gcp,python,analytics,storage-api"
---

# google-cloud-bigquery-storage Python Package Guide

## Golden Rule

Use `google-cloud-bigquery-storage` with Google Cloud Application Default Credentials (ADC). This package is the Python client for the BigQuery Storage Read API and Storage Write API.

For application code, be explicit about:

- the project used to create read or write clients
- the full table resource name
- whether you want Avro or Arrow reads
- whether write semantics can be at-least-once or must be exactly-once

## Install

Pin the package version you want to reason about:

```bash
python -m pip install "google-cloud-bigquery-storage==2.36.2"
```

Install extras when you need the higher-level helpers:

```bash
python -m pip install "google-cloud-bigquery-storage[fastavro,pyarrow,pandas]==2.36.2"
```

Common alternatives:

```bash
uv add "google-cloud-bigquery-storage==2.36.2"
poetry add "google-cloud-bigquery-storage==2.36.2"
```

Use these extras intentionally:

- `fastavro`: required for `ReadRowsStream.rows()` and `ReadRowsStream.to_dataframe()` on Avro data
- `pyarrow`: required for Arrow reads and Arrow-based appends
- `pandas`: required for DataFrame helpers

## Authentication And Setup

Recommended local setup:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="your-project-id"
```

Service account key fallback:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
export GOOGLE_CLOUD_PROJECT="your-project-id"
```

Prerequisites:

- enable the BigQuery Storage API for the project
- use credentials with permission to read or write the target BigQuery table
- keep `GOOGLE_CLOUD_PROJECT` set when project discovery is ambiguous

## Initialize Clients

```python
import os

from google.cloud import bigquery_storage_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]

read_client = bigquery_storage_v1.BigQueryReadClient()
write_client = bigquery_storage_v1.BigQueryWriteClient()
```

The package name and import names differ:

- install: `google-cloud-bigquery-storage`
- import: `google.cloud.bigquery_storage_v1`

## Common Read Workflows

### Read rows with a filtered read session

This is the core Storage Read API flow: create a read session, pick a stream, and iterate decoded rows.

```python
import os

from google.cloud import bigquery_storage_v1
from google.cloud.bigquery_storage_v1 import types

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
table = (
    "projects/bigquery-public-data/datasets/usa_names/tables/usa_1910_current"
)

client = bigquery_storage_v1.BigQueryReadClient()

requested_session = types.ReadSession()
requested_session.table = table
requested_session.data_format = types.DataFormat.AVRO
requested_session.read_options.selected_fields = ["name", "number", "state"]
requested_session.read_options.row_restriction = 'state = "WA"'

session = client.create_read_session(
    parent=f"projects/{project_id}",
    read_session=requested_session,
    max_stream_count=1,
)

reader = client.read_rows(session.streams[0].name)

for row in reader.rows(session):
    print(row["name"], row["number"], row["state"])
```

Practical notes:

- `parent` is the project that creates the read session; it does not have to match the project that owns the table.
- `selected_fields` and `row_restriction` reduce the amount of data scanned over the wire.
- if you omit `max_stream_count`, the service chooses the number of streams for you.

### Convert a stream to Arrow

Use Arrow when your next step is pandas, PyArrow, or another columnar pipeline.

```python
import os

from google.cloud import bigquery_storage_v1
from google.cloud.bigquery_storage_v1 import types

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
table = (
    "projects/bigquery-public-data/datasets/usa_names/tables/usa_1910_current"
)

client = bigquery_storage_v1.BigQueryReadClient()

requested_session = types.ReadSession()
requested_session.table = table
requested_session.data_format = types.DataFormat.ARROW

session = client.create_read_session(
    parent=f"projects/{project_id}",
    read_session=requested_session,
    max_stream_count=1,
)

reader = client.read_rows(session.streams[0].name)
arrow_table = reader.to_arrow(session)

print(arrow_table.schema)
print(arrow_table.to_pydict())
```

`to_arrow()` requires an Arrow read session and `pyarrow` to be installed.

### Download a DataFrame through `google-cloud-bigquery`

If you already use the BigQuery client, this package can accelerate DataFrame downloads by supplying the BigQuery Storage transport.

```python
import os

from google.cloud import bigquery

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]

client = bigquery.Client(project=project_id)
rows = client.list_rows("bigquery-public-data.samples.shakespeare")
df = rows.to_dataframe(create_bqstorage_client=True)

print(df.head())
```

For this workflow, install both:

```bash
python -m pip install "google-cloud-bigquery" "google-cloud-bigquery-storage[fastavro,pandas]==2.36.2"
```

## Common Write Workflow

### Append Arrow batches to the default stream

The default stream is the simplest way to append data. Google documents it as the right choice when your application only needs at-least-once delivery semantics.

```python
import os

import pyarrow
from google.cloud import bigquery_storage_v1
from google.cloud.bigquery_storage_v1 import types
from google.cloud.bigquery_storage_v1.writer import AppendRowsStream

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
dataset_id = "analytics"
table_id = "events"

write_client = bigquery_storage_v1.BigQueryWriteClient()

arrow_table = pyarrow.table(
    {
        "user_id": ["u_1", "u_2"],
        "amount_cents": [4999, 1299],
    }
)

request_template = types.AppendRowsRequest()
request_template.write_stream = (
    f"projects/{project_id}/datasets/{dataset_id}/tables/{table_id}/_default"
)
request_template.arrow_rows.writer_schema.serialized_schema = (
    arrow_table.schema.serialize().to_pybytes()
)

append_rows_stream = AppendRowsStream(write_client, request_template)

request = types.AppendRowsRequest()
request.arrow_rows.rows.serialized_record_batch = (
    arrow_table.to_batches()[0].serialize().to_pybytes()
)

response = append_rows_stream.send(request).result()
print(response.append_result)
```

Use this pattern when your table schema already exists and your source data is easy to express as Arrow. For exactly-once writes, Google documents committed streams with offsets, and for atomic batch loads it documents pending streams followed by `FinalizeWriteStream` and `BatchCommitWriteStreams`.

## Common Pitfalls

- Do not use API keys. Google Cloud client libraries expect ADC or explicit Google credentials.
- Do not confuse the package name with the import path. Import from `google.cloud.bigquery_storage_v1`.
- If you use `row_restriction`, pass the `session` object into `rows(session)`, `to_arrow(session)`, or `to_dataframe(session)`. The docs call this out because empty streams can otherwise fail when they cannot infer the schema.
- `rows()` and `to_dataframe()` on `ReadRowsStream` depend on `fastavro`; `to_arrow()` depends on Arrow format plus `pyarrow`.
- The default write stream is at-least-once. If your retry behavior cannot tolerate duplicates, use committed streams with offsets instead of `_default`.
- Storage Write API appends are schema-sensitive. Keep the Arrow schema or protobuf schema aligned with the BigQuery table schema before sending batches.

## Version-Sensitive Notes

- The `2.36.2` changelog entry fixes `to_dataframe()` missing the first page of results. If you see truncated DataFrame downloads on an older `2.36.x` build, upgrade to `2.36.2`.
- The upstream changelog notes Python `3.14` support starting in `2.34.0`, and PyPI classifiers for `2.36.2` include Python `3.14`.

## Official Sources

- PyPI: `https://pypi.org/project/google-cloud-bigquery-storage/`
- Python reference root: `https://docs.cloud.google.com/python/docs/reference/bigquerystorage/latest`
- `BigQueryReadClient` reference: `https://docs.cloud.google.com/python/docs/reference/bigquerystorage/latest/google.cloud.bigquery_storage_v1.client.BigQueryReadClient`
- `ReadRowsStream` reference: `https://docs.cloud.google.com/python/docs/reference/bigquerystorage/latest/google.cloud.bigquery_storage_v1.reader.ReadRowsStream`
- BigQuery Storage quickstart sample: `https://docs.cloud.google.com/bigquery/docs/samples/bigquerystorage-quickstart`
- BigQuery DataFrame sample with Storage API: `https://docs.cloud.google.com/bigquery/docs/samples/bigquery-pandas-public-data`
- Storage Write API streaming guide: `https://cloud.google.com/bigquery/docs/write-api-streaming`
- Changelog: `https://docs.cloud.google.com/python/docs/reference/bigquerystorage/latest/changelog`
- ADC setup: `https://cloud.google.com/docs/authentication/application-default-credentials`
