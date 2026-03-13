---
name: package
description: "Apache Airflow provider for Microsoft Azure integrations such as Blob Storage, Data Factory, and Key Vault"
metadata:
  languages: "python"
  versions: "13.0.0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "airflow,apache-airflow,azure,blob-storage,data-factory,key-vault,secrets"
---

# Apache Airflow Providers Microsoft Azure Guide

Use `apache-airflow-providers-microsoft-azure` to connect Airflow DAGs to Azure services through provider hooks, operators, and a Key Vault-backed secrets backend.

## Golden Rule

- Install this provider alongside a pinned `apache-airflow` version; it is not a standalone runtime.
- Create Airflow connection IDs and Azure credentials before writing DAG code.
- Keep secrets out of DAG files; use Airflow connections and, when needed, the Azure Key Vault secrets backend.

## Install

Start from an Airflow installation that uses the official constraints file for your Airflow and Python versions, then add the Azure provider in the same command.

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION="<your-airflow-version>"
PROVIDER_VERSION="13.0.0"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-microsoft-azure==${PROVIDER_VERSION}" \
  --constraint "${CONSTRAINT_URL}"
```

If Airflow is already installed, keep the Airflow package pinned when adding the provider:

```bash
python -m pip install \
  "apache-airflow==<your-airflow-version>" \
  "apache-airflow-providers-microsoft-azure==13.0.0"
```

Useful checks after installation:

```bash
airflow providers list | grep microsoft.azure
airflow info
```

## What This Provider Commonly Adds

The maintainer docs for this provider include Azure integrations such as:

- `WasbHook` for Azure Blob Storage
- `AzureDataFactoryRunPipelineOperator` for Azure Data Factory pipeline runs
- `AzureKeyVaultBackend` for resolving Airflow connections and variables from Azure Key Vault

## Authentication And Configuration

### Service principal environment variables

When your deployment uses Azure AD application credentials, these environment variables are the usual starting point:

```bash
export AZURE_TENANT_ID="<tenant-id>"
export AZURE_CLIENT_ID="<client-id>"
export AZURE_CLIENT_SECRET="<client-secret>"
```

Set them in every Airflow process that needs Azure access: scheduler, API/web process, workers, and any standalone task runtime.

### Add a Blob Storage connection

For Blob Storage, create a `wasb` connection in Airflow. A connection string is the simplest configuration when you are not using managed identity.

```bash
airflow connections add 'wasb_default' \
  --conn-type 'wasb' \
  --conn-extra '{"connection_string":"DefaultEndpointsProtocol=https;AccountName=<storage-account>;AccountKey=<access-key>;EndpointSuffix=core.windows.net"}'
```

Use a different connection ID if you need separate accounts for different DAGs or environments.

## Common Workflow: Read And Write Azure Blob Storage

`WasbHook` can hand back the Azure Blob Storage client so a task can use the normal SDK calls.

```python
from __future__ import annotations

import pendulum

from airflow import DAG
from airflow.decorators import task
from airflow.providers.microsoft.azure.hooks.wasb import WasbHook


with DAG(
    dag_id="azure_blob_demo",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["azure", "blob"],
):
    @task()
    def upload_and_read() -> None:
        hook = WasbHook(wasb_conn_id="wasb_default")
        service_client = hook.get_conn()

        blob_client = service_client.get_blob_client(
            container="raw",
            blob="hello.txt",
        )
        blob_client.upload_blob(b"hello from airflow", overwrite=True)

        body = blob_client.download_blob().readall().decode("utf-8")
        print(body)

    upload_and_read()
```

This pattern keeps Azure authentication in the Airflow connection while letting the task use the standard Blob Storage client API.

## Common Workflow: Trigger An Azure Data Factory Pipeline

For Azure Data Factory, the provider exposes an operator that triggers a named pipeline run from a DAG.

```python
from __future__ import annotations

import pendulum

from airflow import DAG
from airflow.providers.microsoft.azure.operators.data_factory import (
    AzureDataFactoryRunPipelineOperator,
)


with DAG(
    dag_id="azure_data_factory_demo",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["azure", "adf"],
):
    run_pipeline = AzureDataFactoryRunPipelineOperator(
        task_id="run_pipeline",
        azure_data_factory_conn_id="azure_data_factory_default",
        resource_group_name="rg-data",
        factory_name="adf-prod",
        pipeline_name="daily_ingest",
        parameters={"run_date": "{{ ds }}"},
        wait_for_termination=True,
    )
```

Before using this operator, create an `azure_data_factory` connection in Airflow with the Azure subscription and credential details that can run the target pipeline.

## Common Workflow: Resolve Secrets From Azure Key Vault

The provider also ships a secrets backend that lets Airflow read connections and variables from Azure Key Vault instead of storing them only in the Airflow metadata database.

Set the backend in the Airflow environment:

```bash
export AIRFLOW__SECRETS__BACKEND="airflow.providers.microsoft.azure.secrets.key_vault.AzureKeyVaultBackend"
export AIRFLOW__SECRETS__BACKEND_KWARGS='{"connections_prefix":"airflow-connections","variables_prefix":"airflow-variables","vault_url":"https://<vault-name>.vault.azure.net/"}'

export AZURE_TENANT_ID="<tenant-id>"
export AZURE_CLIENT_ID="<client-id>"
export AZURE_CLIENT_SECRET="<client-secret>"
```

Then resolve secrets in DAG code the normal Airflow way:

```python
from airflow.hooks.base import BaseHook
from airflow.models import Variable


blob_conn = BaseHook.get_connection("wasb_default")
api_token = Variable.get("third_party_api_token")

print(blob_conn.conn_id)
print(api_token)
```

After changing secrets backend settings, restart every Airflow component that should use the new backend.

## Operational Checks

Confirm the provider is installed:

```bash
airflow providers list | grep microsoft.azure
```

Confirm the Blob Storage connection exists:

```bash
airflow connections get wasb_default
```

Check that Airflow can parse the DAG:

```bash
airflow dags list
airflow tasks test azure_blob_demo upload_and_read 2026-03-12
```

Use `airflow tasks test` for isolated task debugging. Use a normal DAG trigger when you need the scheduler, workers, and secret backend to participate end to end.

## Common Pitfalls

- Installing the provider without pinning `apache-airflow`: providers extend Airflow and should be versioned deliberately.
- Writing DAG code before creating Airflow connection IDs such as `wasb_default` or `azure_data_factory_default`.
- Setting Azure environment variables only for one process; scheduler, workers, and API/web processes must all be able to authenticate.
- Hard-coding storage keys or client secrets in DAG files instead of using Airflow connections or the Key Vault backend.
- Assuming the Data Factory connection alone identifies the target run; the DAG still needs `resource_group_name`, `factory_name`, and `pipeline_name`.

## Version Notes

- This guide covers `apache-airflow-providers-microsoft-azure` version `13.0.0`.
- The examples focus on the provider classes surfaced in maintainer docs for Blob Storage, Data Factory, and Key Vault-backed secrets.
- Re-check the provider's installation and connection documentation before upgrading Airflow or changing authentication modes.
