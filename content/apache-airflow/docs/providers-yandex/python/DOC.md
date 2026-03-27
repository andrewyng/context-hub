---
name: providers-yandex
description: "Apache Airflow Yandex provider for Yandex Cloud connections, Yandex Query tasks, Data Proc clusters, and Lockbox secrets"
metadata:
  languages: "python"
  versions: "4.4.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "apache-airflow,airflow,yandex-cloud,yq,dataproc,lockbox,dag"
---

# Apache Airflow Yandex Provider Python Guide

Use `apache-airflow-providers-yandex` when an Airflow DAG needs to authenticate to Yandex Cloud, run Yandex Query SQL, create or delete Data Proc clusters, submit Data Proc jobs, or load Connections and Variables from Lockbox.

## Golden Rule

- Install this package into an existing Airflow environment; it is not a standalone Yandex Cloud SDK.
- Put Yandex Cloud credentials and folder settings on an Airflow `yandexcloud` connection instead of hard-coding them in DAG files.
- Use `YQExecuteQueryOperator` for Yandex Query work, the `airflow.providers.yandex.operators.dataproc` operators for Data Proc clusters and jobs, and `LockboxSecretBackend` when Airflow should read secrets from Yandex Lockbox.

## Install

The 4.4.0 provider series requires Airflow 2.11.0 or later. Install it in the same virtual environment as Airflow and keep Airflow pinned in the command so the resolver does not silently replace core.

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION="3.1.8"
PROVIDER_VERSION="4.4.0"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-yandex==${PROVIDER_VERSION}"
```

Useful checks after installation:

```bash
airflow providers list | grep yandex
airflow info
```

## Configure A `yandexcloud` Connection

The provider's documented connection type is `yandexcloud`. The default connection id is `yandexcloud_default`.

Use shell variables so the connection command does not embed secrets directly:

```bash
export YC_FOLDER_ID="<your-folder-id>"
export YC_SA_JSON_PATH="/opt/airflow/secrets/yandex-service-account.json"
export YC_SSH_PUBLIC_KEY="$(cat ~/.ssh/id_ed25519.pub)"
```

Then create the Airflow connection:

```bash
airflow connections add 'yandexcloud_default' \
  --conn-type 'yandexcloud' \
  --conn-extra "{
    \"folder_id\": \"${YC_FOLDER_ID}\",
    \"service_account_json_path\": \"${YC_SA_JSON_PATH}\",
    \"public_ssh_key\": \"${YC_SSH_PUBLIC_KEY}\"
  }"
```

Supported auth and connection fields from the provider docs:

- `service_account_json`: inline service-account JSON
- `service_account_json_path`: filesystem path to the JSON credentials file
- `oauth`: OAuth token
- `folder_id`: Yandex Cloud folder to use for YQ and other APIs
- `public_ssh_key`: SSH public key for Data Proc cluster access
- `endpoint`: custom Yandex API endpoint if you are not using the default

If the connection does not include JSON credentials or an OAuth token, the provider can fall back to Yandex metadata-service credentials when Airflow runs on Yandex Cloud infrastructure.

Check the connection after creating it:

```bash
airflow connections get yandexcloud_default
```

## Run A Yandex Query Job

`YQExecuteQueryOperator` is the main operator for submitting SQL to Yandex Query. Pass `yandex_conn_id` and a `folder_id`, then provide the SQL text you want to run.

```python
from __future__ import annotations

import pendulum

from airflow import DAG
from airflow.models import Variable
from airflow.providers.yandex.operators.yq import YQExecuteQueryOperator


with DAG(
    dag_id="yq_daily_orders",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["yandex", "yq"],
):
    run_query = YQExecuteQueryOperator(
        task_id="run_query",
        yandex_conn_id="yandexcloud_default",
        folder_id=Variable.get("yc_folder_id"),
        sql="""
        DECLARE $cutoff AS Date;

        SELECT
            customer_id,
            SUM(amount) AS total_amount
        FROM `analytics/orders`
        WHERE order_date >= $cutoff
        GROUP BY customer_id
        ORDER BY total_amount DESC
        LIMIT 10;
        """,
        query_params={"$cutoff": "2026-03-01"},
    )
```

When you need lower-level control in Python task code, import `YQHook` from `airflow.providers.yandex.hooks.yq` and use the same `yandex_conn_id` plus `folder_id`.

## Create A Data Proc Cluster And Submit A PySpark Job

The provider ships separate Data Proc operators under `airflow.providers.yandex.operators.dataproc`. A common pattern is:

1. create the cluster
2. submit a Spark or PySpark job
3. delete the cluster in an `all_done` cleanup task

```python
from __future__ import annotations

import pendulum

from airflow import DAG
from airflow.models import Variable
from airflow.providers.yandex.operators.dataproc import (
    DataprocCreateClusterOperator,
    DataprocCreatePysparkJobOperator,
    DataprocDeleteClusterOperator,
)
from airflow.utils.trigger_rule import TriggerRule


with DAG(
    dag_id="yandex_dataproc_pyspark",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["yandex", "dataproc"],
):
    create_cluster = DataprocCreateClusterOperator(
        task_id="create_cluster",
        connection_id="yandexcloud_default",
        cluster_name="airflow-demo-dataproc",
        cluster_description="Temporary cluster for a PySpark task",
        service_account_id=Variable.get("yc_service_account_id"),
        subnet_id=Variable.get("yc_subnet_id"),
        s3_bucket=Variable.get("yc_s3_bucket"),
        zone="ru-central1-a",
        ssh_public_keys=Variable.get("yc_ssh_public_key"),
        cluster_image_version="2.1",
        masternode_resource_preset="s3-c2-m8",
        masternode_disk_type="network-ssd",
        masternode_disk_size=20,
        computenode_count=1,
        computenode_resource_preset="s3-c2-m8",
        computenode_disk_type="network-ssd",
        computenode_disk_size=20,
    )

    run_pyspark = DataprocCreatePysparkJobOperator(
        task_id="run_pyspark",
        connection_id="yandexcloud_default",
        cluster_id=create_cluster.output,
        main_python_file_uri="s3a://my-dataproc-bucket/jobs/wordcount.py",
        args=[
            "--input",
            "s3a://my-dataproc-bucket/input/",
            "--output",
            "s3a://my-dataproc-bucket/output/",
        ],
    )

    delete_cluster = DataprocDeleteClusterOperator(
        task_id="delete_cluster",
        connection_id="yandexcloud_default",
        cluster_id=create_cluster.output,
        trigger_rule=TriggerRule.ALL_DONE,
    )

    create_cluster >> run_pyspark >> delete_cluster
```

Important setup details for Data Proc:

- `service_account_id`, `subnet_id`, and `s3_bucket` are required when creating the cluster.
- Keep the SSH public key on the connection or in an Airflow Variable, not in the DAG source.
- `create_cluster.output` is the cluster id returned by `DataprocCreateClusterOperator`, so you can feed it directly into downstream job and delete tasks.

If you need a Java or Scala Spark job instead of PySpark, use `DataprocCreateSparkJobOperator` from the same module.

## Use Lockbox As An Airflow Secrets Backend

The provider also includes `LockboxSecretBackend`, which lets Airflow read Connections and Variables from Yandex Lockbox.

```bash
export AIRFLOW__SECRETS__BACKEND="airflow.providers.yandex.secrets.lockbox.LockboxSecretBackend"
export AIRFLOW__SECRETS__BACKEND_KWARGS='{
  "connections_secret_id": "<lockbox-connections-secret-id>",
  "variables_secret_id": "<lockbox-variables-secret-id>",
  "sep": "__"
}'
```

After enabling the backend, read secrets through the normal Airflow APIs:

```python
from airflow.hooks.base import BaseHook
from airflow.models import Variable


yandex_conn = BaseHook.get_connection("yandexcloud_default")
folder_id = Variable.get("yc_folder_id")

print(yandex_conn.conn_type)
print(folder_id)
```

Lockbox naming rules from the provider docs:

- Variables are stored by their variable name.
- Connections can be stored either as a URI string or as field-value pairs.
- For field-value pairs, the secret entry key format is `connection_id + sep + field_name`.

Restart Airflow components after changing secrets backend settings so the scheduler, workers, and API process all reload the backend configuration.

## Operational Checks

Use Airflow's normal diagnostics after installation and connection setup:

```bash
airflow providers list | grep yandex
airflow connections get yandexcloud_default
airflow dags list
airflow tasks test yq_daily_orders run_query 2026-03-13
```

## Pitfalls

- This package extends Airflow; it does not replace `apache-airflow`.
- Yandex Query operators and hooks use `yandex_conn_id`, but Data Proc operators use `connection_id`. Do not assume the parameter names match across the provider.
- YQ tasks need a `folder_id`; set it on the connection or pass it explicitly.
- Metadata-service authentication only works when the Airflow runtime actually has access to Yandex Cloud instance metadata.
- The old `airflow.providers.yandex.operators.yandexcloud_dataproc` import path was removed in the 4.x series. Import Data Proc operators from `airflow.providers.yandex.operators.dataproc`.
- Secrets backend changes require Airflow component restarts before tasks and the UI pick them up consistently.

## Version Notes

- `apache-airflow-providers-yandex==4.4.0` adds Python 3.13 support.
- The 4.3.x and 4.4.x provider series require Airflow 2.11.0 or later.
- If you are upgrading from older Yandex provider releases, re-check import paths and operator arguments against the 4.x API reference before copying old DAG code.

## Official Docs

- Provider docs root: `https://airflow.apache.org/docs/apache-airflow-providers-yandex/stable/`
- Installation: `https://airflow.apache.org/docs/apache-airflow-providers-yandex/stable/index.html`
- Yandex Cloud connection: `https://airflow.apache.org/docs/apache-airflow-providers-yandex/stable/connections/yandexcloud.html`
- Yandex Query operators: `https://airflow.apache.org/docs/apache-airflow-providers-yandex/stable/operators/yq.html`
- Data Proc operators: `https://airflow.apache.org/docs/apache-airflow-providers-yandex/stable/operators/dataproc.html`
- Lockbox secrets backend: `https://airflow.apache.org/docs/apache-airflow-providers-yandex/stable/secrets-backends/yandex-lockbox-backend.html`
- Data Proc operator API: `https://airflow.apache.org/docs/apache-airflow-providers-yandex/stable/_api/airflow/providers/yandex/operators/dataproc/index.html`
- YQ operator API: `https://airflow.apache.org/docs/apache-airflow-providers-yandex/stable/_api/airflow/providers/yandex/operators/yq/index.html`
- Yandex base hook API: `https://airflow.apache.org/docs/apache-airflow-providers-yandex/stable/_api/airflow/providers/yandex/hooks/yandex/index.html`
- Changelog: `https://airflow.apache.org/docs/apache-airflow-providers-yandex/stable/changelog.html`
