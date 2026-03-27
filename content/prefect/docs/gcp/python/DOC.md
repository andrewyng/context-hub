---
name: gcp
description: "Prefect GCP integration for storing Google Cloud credentials in Prefect blocks and using BigQuery, Cloud Storage, and Secret Manager from Python flows"
metadata:
  languages: "python"
  versions: "0.6.17"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "prefect,gcp,python,workflow,orchestration,bigquery,cloud-storage,secret-manager,blocks"
---

# Prefect GCP Python Package Guide

## Golden Rule

Use `prefect-gcp` as the Google Cloud integration layer for Prefect. Keep writing orchestration with core `prefect`; use `prefect-gcp` for reusable GCP credential blocks and for block-backed access to BigQuery, Cloud Storage, and Secret Manager inside flows.

If you only need the raw Google Cloud SDK outside Prefect orchestration, start with the Google client library directly.

## Install

Install the package version this guide covers:

```bash
python -m pip install "prefect-gcp==0.6.17"
```

If you want the optional Google service extras documented by Prefect:

```bash
python -m pip install "prefect-gcp[all_extras]==0.6.17"
```

If your environment does not already include Prefect, install it too:

```bash
python -m pip install prefect prefect-gcp
```

Register the block types after installation so they are available in the Prefect UI and CLI:

```bash
prefect block register -m prefect_gcp
```

Sanity-check the install:

```bash
python -m pip show prefect-gcp
python -c "import prefect_gcp; print(prefect_gcp.__file__)"
```

## Prerequisites And Environment

Before you use `prefect-gcp`, make sure:

- the target GCP project exists and the required APIs are enabled
- the runtime identity has permission for the BigQuery, Cloud Storage, or Secret Manager calls you make
- `PREFECT_API_URL` is set if you want to save or load named Prefect blocks
- `PREFECT_API_KEY` is also set when you use Prefect Cloud

Typical environment variables:

```bash
export GOOGLE_CLOUD_PROJECT="my-gcp-project"
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/to/service-account.json"

export PREFECT_API_URL="https://api.prefect.cloud/api/accounts/<account-id>/workspaces/<workspace-id>"
export PREFECT_API_KEY="pnu_..."
```

If you run against a local self-hosted Prefect server instead of Prefect Cloud:

```bash
prefect server start
prefect config set PREFECT_API_URL="http://127.0.0.1:4200/api"
```

`GcpCredentials` accepts either `service_account_info` or `service_account_file`. If neither is provided, the block falls back to Google Application Default Credentials (ADC). For containerized workers and remote execution, `service_account_info` is usually the safer saved-block option because it does not depend on a file path existing inside the runtime container.

## Initialize A Credentials Block

Create a block directly from service-account JSON:

```python
import json
import os

from prefect_gcp import GcpCredentials


gcp_credentials = GcpCredentials(
    service_account_info=json.loads(os.environ["GCP_SERVICE_ACCOUNT_INFO"]),
    project=os.environ["GOOGLE_CLOUD_PROJECT"],
)
```

Or rely on ADC when the runtime already has a GCP identity:

```python
import os

from prefect_gcp import GcpCredentials


gcp_credentials = GcpCredentials(
    project=os.environ["GOOGLE_CLOUD_PROJECT"],
)
```

Use direct instantiation when credentials already come from environment variables, workload identity, or another secret manager and you do not need a saved Prefect block yet.

## Save And Reuse A Named Block

Save the block when multiple flows or deployments should share the same GCP configuration:

```python
gcp_credentials.save("gcp-prod", overwrite=True)
```

Load it later:

```python
from prefect_gcp import GcpCredentials


gcp_credentials = GcpCredentials.load("gcp-prod")
```

What matters here:

- `save(...)` and `load(...)` require a working Prefect API connection
- `prefect block register -m prefect_gcp` should be run once in the environment where you want the block type to appear
- direct instantiation of `GcpCredentials(...)` does not require Prefect Cloud or a self-hosted server

## Query BigQuery From A Flow

Use `GcpCredentials.get_bigquery_client()` for lower-level setup, then use `BigQueryWarehouse` as the query surface inside the flow. The maintainer reference recommends using `BigQueryWarehouse` as a context manager so the connection and cursors close cleanly.

```python
import os

from prefect import flow
from prefect_gcp import GcpCredentials
from prefect_gcp.bigquery import BigQueryWarehouse


@flow(log_prints=True)
def bigquery_demo() -> list:
    project = os.environ["GOOGLE_CLOUD_PROJECT"]
    dataset_id = f"{project}.prefect_demo"
    table_name = f"`{project}.prefect_demo.customers`"

    gcp_credentials = GcpCredentials.load("gcp-prod")

    client = gcp_credentials.get_bigquery_client(location="US")
    client.create_dataset(dataset_id, exists_ok=True)

    with BigQueryWarehouse(
        gcp_credentials=gcp_credentials,
        fetch_size=2,
    ) as warehouse:
        warehouse.execute(
            f"CREATE TABLE IF NOT EXISTS {table_name} (name STRING, city STRING)"
        )
        warehouse.execute_many(
            f"INSERT INTO {table_name} (name, city) VALUES (%(name)s, %(city)s)",
            seq_of_parameters=[
                {"name": "Ada", "city": "London"},
                {"name": "Grace", "city": "New York"},
            ],
        )
        rows = warehouse.fetch_many(
            f"SELECT name, city FROM {table_name} ORDER BY name",
            size=10,
        )

    print(rows)
    return rows


if __name__ == "__main__":
    bigquery_demo()
```

Use this pattern when you want Prefect to manage authentication and orchestration while the actual SQL still looks like normal database work.

## Upload And Download Files With GCS

Create a `GcsBucket` block when a flow needs a reusable bucket definition. The bucket must already exist.

```python
from pathlib import Path

from prefect import flow
from prefect_gcp import GcpCredentials, GcsBucket


@flow(log_prints=True)
def gcs_demo() -> str:
    local_path = Path("hello.txt")
    local_path.write_text("Hello from Prefect GCS\n")

    gcs_bucket = GcsBucket(
        bucket="my-prefect-bucket",
        bucket_folder="prefect-demo",
        gcp_credentials=GcpCredentials.load("gcp-prod"),
    )

    object_path = gcs_bucket.upload_from_path(
        local_path,
        to_path="hello.txt",
    )
    gcs_bucket.download_object_to_path(
        object_path,
        "downloaded-hello.txt",
    )
    return Path("downloaded-hello.txt").read_text()


if __name__ == "__main__":
    print(gcs_demo())
```

For directory syncs, `GcsBucket` also exposes `upload_from_folder(...)` and `download_folder_to_path(...)`.

## Store And Read Secrets In Secret Manager

Use `GcpSecret` for workflows that need to create, read, or delete a Google Secret Manager secret version from a flow.

```python
import os

from prefect import flow
from prefect_gcp import GcpCredentials, GcpSecret


@flow(log_prints=True)
def secret_manager_demo() -> str:
    gcp_secret = GcpSecret(
        secret_name="prefect-demo-api-key",
        secret_version="latest",
        gcp_credentials=GcpCredentials.load("gcp-prod"),
    )

    gcp_secret.write_secret(secret_data=os.environ["APP_API_KEY"].encode())
    secret_value = gcp_secret.read_secret().decode()
    print(secret_value)
    return secret_value


if __name__ == "__main__":
    secret_manager_demo()
```

Delete the secret when you are done with an ephemeral test secret:

```python
gcp_secret.delete_secret()
```

## Use The Underlying Google Clients

If you need a lower-level Google client than the block wrappers expose, `GcpCredentials` can build authenticated clients directly:

```python
from prefect_gcp import GcpCredentials


gcp_credentials = GcpCredentials.load("gcp-prod")

storage_client = gcp_credentials.get_cloud_storage_client()
secret_manager_client = gcp_credentials.get_secret_manager_client()
bigquery_client = gcp_credentials.get_bigquery_client(location="US")
```

This is a good fit when you want Prefect-managed credentials but still need an API call that is only available on the raw Google SDK client.

## Common Pitfalls

- Installing `prefect-gcp` does not replace core `prefect`; you still use `prefect` for `@flow`, `@task`, deployments, workers, and configuration.
- Saving or loading blocks by name requires a reachable Prefect API. Direct instantiation does not.
- `prefect block register -m prefect_gcp` is required before the `prefect-gcp` block types show up in the Prefect block catalog.
- `GcpCredentials` accepts only one of `service_account_info` or `service_account_file` at a time.
- If you use `service_account_file`, that file path must exist in the actual worker or container that executes the flow. Saved `service_account_info` is more portable.
- If you provide neither `service_account_info` nor `service_account_file`, the block falls back to ADC. That usually means setting `GOOGLE_APPLICATION_CREDENTIALS` or running on a GCP runtime with an attached service account.
- Set `project` on `GcpCredentials` when you use `GcpSecret`; the secret methods build resource names from `gcp_credentials.project`.
- `BigQueryWarehouse` is intended for query execution and is best used as a context manager.
- `GcsBucket` does not create a bucket for you. Create the bucket separately before calling `upload_from_path(...)` or `upload_from_folder(...)`.
- Current Prefect integration docs route Cloud Run and Vertex AI execution through Prefect deployment infrastructure such as work pools and workers; keep new application code focused on blocks, flows, and deployments instead of older ad hoc infrastructure examples.

## Version Notes For `prefect-gcp` 0.6.17

- This guide covers the PyPI package version `0.6.17`, released on February 12, 2026.
- PyPI lists `prefect-gcp 0.6.17` as requiring Python 3.10 or newer.
- The current maintainer docs present `prefect-gcp` primarily as a block-based integration package for BigQuery, Cloud Storage, Secret Manager, and Prefect-managed GCP execution workflows.

## Official Sources Used

- Prefect integrations docs: `https://docs.prefect.io/integrations/prefect-gcp/index`
- Prefect integrations overview: `https://docs.prefect.io/integrations/use-integrations`
- Prefect blocks concept docs: `https://docs.prefect.io/v3/concepts/blocks`
- Prefect settings and profiles: `https://docs.prefect.io/v3/concepts/settings-and-profiles`
- Prefect Python reference for credentials: `https://reference.prefect.io/prefect_gcp/credentials/`
- Prefect Python reference for BigQuery: `https://reference.prefect.io/prefect_gcp/bigquery/`
- Prefect Python reference for Cloud Storage: `https://reference.prefect.io/prefect_gcp/cloud_storage/`
- Prefect Python reference for Secret Manager: `https://reference.prefect.io/prefect_gcp/secret_manager/`
- PyPI package page: `https://pypi.org/project/prefect-gcp/0.6.17/`
