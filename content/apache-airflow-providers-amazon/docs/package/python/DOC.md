---
name: package
description: "Apache Airflow provider for AWS integrations such as S3, Athena, and Secrets Manager"
metadata:
  languages: "python"
  versions: "9.22.0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "airflow,apache-airflow,aws,s3,athena,secrets-manager,dag"
---

# Apache Airflow Providers Amazon Guide

Use `apache-airflow-providers-amazon` to connect Airflow DAGs to AWS services through provider hooks, operators, sensors, and a Secrets Manager-backed secrets backend.

## Golden Rule

- Install this provider alongside a pinned `apache-airflow` version; it is not a standalone runtime.
- Create an Airflow AWS connection such as `aws_default` and make AWS credentials available before writing DAG code.
- Keep account-specific credentials and secrets out of DAG files; use Airflow connections, AWS runtime credentials, and secret backends instead.

## Install

Start from an Airflow installation that uses the official constraints file for your Airflow and Python versions, then add the Amazon provider in the same command.

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION="<your-airflow-version>"
PROVIDER_VERSION="9.22.0"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-amazon==${PROVIDER_VERSION}" \
  --constraint "${CONSTRAINT_URL}"
```

If Airflow is already installed, keep the Airflow package pinned when adding the provider:

```bash
python -m pip install \
  "apache-airflow==<your-airflow-version>" \
  "apache-airflow-providers-amazon==9.22.0"
```

Useful checks after installation:

```bash
airflow providers list | grep amazon
airflow info
```

## What This Provider Commonly Adds

The maintainer docs for this provider include AWS integrations such as:

- `S3Hook`, `S3CreateObjectOperator`, and `S3KeySensor` for S3 file movement and object checks
- `AthenaOperator` for running Athena queries from DAGs
- `SecretsManagerBackend` for resolving Airflow connections and variables from AWS Secrets Manager

## Authentication And Configuration

The conventional Airflow connection ID for this provider is `aws_default`. Most hooks and operators let you override it with `aws_conn_id`.

### Environment credentials plus an Airflow connection

The simplest setup is an Airflow AWS connection that carries region information while boto3 resolves credentials from the runtime environment.

```bash
export AWS_ACCESS_KEY_ID="<access-key-id>"
export AWS_SECRET_ACCESS_KEY="<secret-access-key>"
export AWS_DEFAULT_REGION="us-east-1"

export AIRFLOW_CONN_AWS_DEFAULT='{"conn_type":"aws","extra":{"region_name":"us-east-1"}}'
```

If you are using temporary credentials, also set:

```bash
export AWS_SESSION_TOKEN="<session-token>"
```

In ECS, EKS, EC2, MWAA, or another role-based environment, you typically omit the static key variables and let boto3 use the attached role instead.

### Create the connection with the Airflow CLI

```bash
airflow connections add 'aws_default' \
  --conn-type 'aws' \
  --conn-extra '{"region_name":"us-east-1"}'
```

Use a different connection ID when different DAGs need different accounts, regions, or IAM behavior, and pass that ID explicitly with `aws_conn_id`.

## Common Workflow: Read And Write S3 Objects

Use operators and hooks from the provider instead of shelling out to the AWS CLI from a task.

```python
from __future__ import annotations

import pendulum

from airflow import DAG
from airflow.decorators import task
from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from airflow.providers.amazon.aws.operators.s3 import S3CreateObjectOperator
from airflow.providers.amazon.aws.sensors.s3 import S3KeySensor


with DAG(
    dag_id="aws_s3_demo",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["aws", "s3"],
):
    write_manifest = S3CreateObjectOperator(
        task_id="write_manifest",
        aws_conn_id="aws_default",
        s3_bucket="my-data-bucket",
        s3_key="incoming/manifest.json",
        data='{"run_date": "{{ ds }}"}',
        replace=True,
    )

    wait_for_manifest = S3KeySensor(
        task_id="wait_for_manifest",
        aws_conn_id="aws_default",
        bucket_name="my-data-bucket",
        bucket_key="incoming/manifest.json",
    )

    @task()
    def read_manifest() -> str:
        hook = S3Hook(aws_conn_id="aws_default")
        body = hook.read_key(
            key="incoming/manifest.json",
            bucket_name="my-data-bucket",
        )
        print(body)
        return body

    write_manifest >> wait_for_manifest >> read_manifest()
```

Useful `S3Hook` methods for task code include `read_key`, `load_string`, `list_keys`, and `check_for_key`.

## Common Workflow: Run An Athena Query

Use `AthenaOperator` when a DAG needs to submit a SQL statement to Athena and write results to S3.

```python
from __future__ import annotations

import pendulum

from airflow import DAG
from airflow.providers.amazon.aws.operators.athena import AthenaOperator


with DAG(
    dag_id="athena_report_demo",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["aws", "athena"],
):
    run_query = AthenaOperator(
        task_id="run_query",
        aws_conn_id="aws_default",
        query="""
        SELECT current_date AS run_date, count(*) AS row_count
        FROM analytics.orders
        """,
        database="analytics",
        output_location="s3://my-athena-results/queries/",
        workgroup="primary",
    )
```

Make sure the Airflow task identity can both start Athena queries and read or write the S3 results location used by Athena.

## Common Workflow: Resolve Secrets From AWS Secrets Manager

The provider also ships a secrets backend so Airflow can read connections and variables from AWS Secrets Manager instead of storing them only in the Airflow metadata database.

Set the backend in the Airflow environment:

```bash
export AIRFLOW__SECRETS__BACKEND="airflow.providers.amazon.aws.secrets.secrets_manager.SecretsManagerBackend"
export AIRFLOW__SECRETS__BACKEND_KWARGS='{"connections_prefix":"airflow/connections","variables_prefix":"airflow/variables","region_name":"us-east-1"}'
```

Then access connections and variables through the normal Airflow APIs:

```python
from airflow.hooks.base import BaseHook
from airflow.models import Variable


aws_conn = BaseHook.get_connection("aws_default")
deploy_env = Variable.get("deploy_env")

print(aws_conn.conn_id)
print(deploy_env)
```

After changing secrets backend settings, restart every Airflow component that should use the new backend.

## Operational Checks

Confirm the provider is installed:

```bash
airflow providers list | grep amazon
```

Confirm the AWS connection exists:

```bash
airflow connections get aws_default
```

Check that Airflow can parse the DAG and that a task can import the provider classes:

```bash
airflow dags list
airflow tasks test aws_s3_demo read_manifest 2026-03-12
```

Use `airflow tasks test` for isolated task debugging. Use a normal DAG trigger when you need the scheduler, workers, and secrets backend to participate end to end.

## Common Pitfalls

- Installing the provider without pinning `apache-airflow` and the official constraints file for your environment.
- Setting AWS credentials or IAM role assumptions for only one Airflow process; scheduler, workers, and API or web processes all need compatible AWS access.
- Relying on `aws_default` implicitly when a DAG should target a different account or region; pass `aws_conn_id` explicitly in shared environments.
- Giving Athena permission but forgetting the S3 results bucket permissions it also needs.
- Hard-coding AWS keys or secret values in DAG files instead of using Airflow connections, runtime credentials, or Secrets Manager.

## Version Notes

- This guide covers `apache-airflow-providers-amazon` version `9.22.0`.
- The examples focus on the provider classes surfaced in maintainer docs for S3, Athena, and Secrets Manager.
- Re-check the provider installation and AWS connection documentation before upgrading Airflow or changing authentication modes.
