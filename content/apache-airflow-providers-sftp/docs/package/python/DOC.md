---
name: package
description: "Apache Airflow SFTP provider for Airflow connections, hook-based file transfer, and DAG file movement tasks"
metadata:
  languages: "python"
  versions: "5.7.0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "airflow,sftp,ssh,file-transfer,dag,python"
---

# apache-airflow-providers-sftp

Use `apache-airflow-providers-sftp` to connect Airflow to SFTP servers through an Airflow connection, move files in DAG tasks, and access remote files from Python task code with `SFTPHook`.

This guide targets provider version `5.7.0`.

## Install

Install the provider into the same Python environment or container image used by your Airflow deployment:

```bash
python -m pip install "apache-airflow-providers-sftp==5.7.0"
```

This package is an Airflow provider, not a standalone SFTP client. Anywhere your DAG code imports `airflow.providers.sftp...` must have both Airflow and this provider installed.

If your Airflow version is already pinned in requirements or your image build, keep that pin when you add the provider:

```bash
python -m pip install \
  "apache-airflow==<your-airflow-version>" \
  "apache-airflow-providers-sftp==5.7.0"
```

## Configure The Airflow Connection

Create an Airflow connection for the SFTP server, then reference that connection id from hooks and operators.

Password-based auth can be defined with an environment variable:

```bash
export AIRFLOW_CONN_PARTNER_SFTP='sftp://airflow:secret@sftp.example.com:22/'
```

With that environment variable in place:

- the Airflow connection id is `partner_sftp`
- DAG code can use that id when it creates `SFTPHook` instances or SFTP operators

Connection fields you usually need:

- `Host`: SFTP server hostname
- `Login`: username
- `Password`: password when you are not using key-based auth
- `Port`: usually `22`

If your server uses an SSH private key, keep that key in the Airflow connection or a secrets backend instead of embedding it in DAG code.

## List, Check, And Download Files With `SFTPHook`

Use `SFTPHook` inside a Python task when later logic depends on the remote file list, on existence checks, or on local processing after the download.

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.sftp.hooks.sftp import SFTPHook
from pendulum import datetime

with DAG(
    dag_id="sftp_hook_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def fetch_orders() -> str:
        hook = SFTPHook(ssh_conn_id="partner_sftp")

        files = hook.list_directory("/inbound")
        if "orders.csv" not in files:
            raise FileNotFoundError("/inbound/orders.csv not found")

        local_path = "/tmp/orders.csv"
        hook.retrieve_file("/inbound/orders.csv", local_path)
        return local_path

    fetch_orders()
```

Useful `SFTPHook` methods for task code include `list_directory`, `path_exists`, `retrieve_file`, `store_file`, and `delete_file`.

## Upload Or Download Files With `SFTPOperator`

Use `SFTPOperator` when the task is primarily a file transfer and you want that step to stay declarative in the DAG.

```python
from airflow import DAG
from airflow.providers.sftp.operators.sftp import SFTPOperator
from pendulum import datetime

with DAG(
    dag_id="sftp_operator_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    upload_report = SFTPOperator(
        task_id="upload_report",
        ssh_conn_id="partner_sftp",
        local_filepath="/opt/airflow/data/report.csv",
        remote_filepath="/upload/report.csv",
        operation="put",
        create_intermediate_dirs=True,
        confirm=True,
    )
```

For the inverse flow, keep the same connection id and change `operation` to `"get"` with the local and remote paths swapped to match the direction you need.

## Upload From A Python Task

Use the hook form when the local file path or remote destination is computed inside Python.

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.sftp.hooks.sftp import SFTPHook
from pendulum import datetime

with DAG(
    dag_id="sftp_upload_from_task",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def upload_ack() -> None:
        hook = SFTPHook(ssh_conn_id="partner_sftp")
        hook.store_file("/outbound/ack.txt", "/opt/airflow/data/ack.txt")

    upload_ack()
```

## Common Setup Pattern

For most DAGs, a clean split is:

- use `SFTPOperator` for straightforward upload or download tasks
- use `SFTPHook` inside `@task` functions when you need Python logic around file discovery, branching, or post-transfer processing
- keep the connection id stable across DAGs, such as `partner_sftp` or `vendor_feed`

## Pitfalls

- Install the provider everywhere DAG code runs. Import errors usually mean one Airflow image or service is missing the provider package.
- Keep credentials and SSH keys in Airflow connections or a secrets backend, not in DAG files.
- URL-encode special characters if you define `AIRFLOW_CONN_*` values manually.
- Remember that local paths such as `/tmp/orders.csv` and `/opt/airflow/data/report.csv` must exist on the worker that executes the task.
- Prefer absolute remote paths. Relative paths can behave differently across SFTP server setups.

## Version Notes

Provider packages track Airflow compatibility separately from the remote SFTP server you connect to. If you are upgrading Airflow core, check the provider's release notes and compatibility information before you pin or upgrade this package.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-sftp/stable/`
- Airflow SFTP connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-sftp/stable/connections/sftp.html`
- `SFTPHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-sftp/stable/_api/airflow/providers/sftp/hooks/sftp/index.html`
- `SFTPOperator` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-sftp/stable/_api/airflow/providers/sftp/operators/sftp/index.html`
- `SFTPSensor` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-sftp/stable/_api/airflow/providers/sftp/sensors/sftp/index.html`
