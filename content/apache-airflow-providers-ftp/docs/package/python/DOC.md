---
name: package
description: "Apache Airflow FTP provider for Airflow connections and hook-based file transfers in DAGs"
metadata:
  languages: "python"
  versions: "3.14.1"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "airflow,apache-airflow,ftp,file-transfer,dag,python"
---

# Apache Airflow Providers FTP Guide

Use `apache-airflow-providers-ftp` to connect Airflow DAGs to FTP servers through an Airflow connection, then list, download, and upload files from task code with `FTPHook`.

This guide targets provider version `3.14.1`.

## Golden Rule

- Install this provider alongside a pinned `apache-airflow` version; it is not a standalone FTP client library.
- Keep FTP credentials in an Airflow connection such as `partner_ftp`, not in DAG files.
- Use `FTPHook(ftp_conn_id="...")` inside tasks, then call normal FTP client methods on the object returned by `get_conn()`.
- Remember that FTP and SFTP are different protocols. Do not point this provider at an SSH/SFTP endpoint.

## Install

Airflow providers are intended to be installed with the Airflow constraints file that matches your Airflow and Python versions.

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION="<your-airflow-version>"
PROVIDER_VERSION="3.14.1"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-ftp==${PROVIDER_VERSION}" \
  --constraint "${CONSTRAINT_URL}"
```

If Airflow is already pinned elsewhere in your image or requirements, keep that pin when you add the provider:

```bash
python -m pip install \
  "apache-airflow==<your-airflow-version>" \
  "apache-airflow-providers-ftp==3.14.1"
```

Useful checks after installation:

```bash
airflow providers list | grep ftp
airflow info
```

## Configure The Airflow Connection

Most DAGs keep the FTP server details in an Airflow connection, then reuse its connection id from hooks and any provider operators or sensors.

An environment-variable connection is the fastest way to wire one in:

```bash
export AIRFLOW_CONN_PARTNER_FTP='ftp://airflow:secret@ftp.example.com:21/'
```

With that environment variable in place:

- the Airflow connection id is `partner_ftp`
- DAG code can use `ftp_conn_id="partner_ftp"`

You can also create the same connection explicitly through the CLI:

```bash
airflow connections add 'partner_ftp' \
  --conn-uri 'ftp://airflow:secret@ftp.example.com:21/'
```

Confirm the connection exists before you wire it into a DAG:

```bash
airflow connections get partner_ftp
```

Connection fields you usually need:

- `Host`: FTP server hostname
- `Login`: username
- `Password`: password
- `Port`: usually `21`

If you need server-specific extras or TLS-related settings, check the provider's FTP connection docs for the exact fields supported by your Airflow version.

## Download A File With `FTPHook`

Use `FTPHook` when your task needs normal FTP session control and Python-side logic around file existence, naming, or downstream processing.

```python
from pathlib import Path

from airflow import DAG
from airflow.decorators import task
from airflow.providers.ftp.hooks.ftp import FTPHook
from pendulum import datetime


with DAG(
    dag_id="ftp_download_orders",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def fetch_orders() -> str:
        hook = FTPHook(ftp_conn_id="partner_ftp")
        client = hook.get_conn()

        try:
            client.cwd("/incoming")
            files = client.nlst()
            if "orders.csv" not in files:
                raise FileNotFoundError("/incoming/orders.csv not found")

            output_path = Path("/tmp/orders.csv")
            output_path.parent.mkdir(parents=True, exist_ok=True)

            with output_path.open("wb") as stream:
                client.retrbinary("RETR orders.csv", stream.write)

            return str(output_path)
        finally:
            client.quit()

    fetch_orders()
```

The important pattern is:

1. create `FTPHook(ftp_conn_id="...")`
2. call `hook.get_conn()`
3. use the returned FTP client for normal operations such as `cwd()`, `nlst()`, `retrbinary()`, and `quit()`

Changing into the remote directory before calling `nlst()` keeps file-name checks simpler because FTP servers differ on whether directory listings return bare names or full paths.

## Upload A File From A Task

Use the same hook pattern when the local file path or remote destination is computed in Python.

```python
from pathlib import Path

from airflow import DAG
from airflow.decorators import task
from airflow.providers.ftp.hooks.ftp import FTPHook
from pendulum import datetime


with DAG(
    dag_id="ftp_upload_ack",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def upload_ack() -> None:
        local_path = Path("/opt/airflow/data/ack.txt")
        hook = FTPHook(ftp_conn_id="partner_ftp")
        client = hook.get_conn()

        try:
            client.cwd("/outbound")

            with local_path.open("rb") as stream:
                client.storbinary("STOR ack.txt", stream)
        finally:
            client.quit()

    upload_ack()
```

This is the simplest pattern when your DAG needs to create or transform a file first, then push the result to the FTP server in the same task.

## Common Setup Pattern

For most DAGs, a clean split is:

- keep host, port, username, and password in one reusable Airflow connection
- create `FTPHook` inside the task body instead of at module import time
- use the FTP client returned by `get_conn()` for normal `ftplib` calls
- return only small values from tasks, such as local output paths or selected file names

If your transfer is fully declarative and does not need custom Python logic, the provider docs also include operator and sensor APIs that can keep the DAG more compact.

## Pitfalls

- Installing the provider only on the scheduler or webserver. Workers also need it anywhere task code imports `airflow.providers.ftp`.
- Using an SFTP URI such as `sftp://...` with this provider. FTP and SFTP use different hooks and different connection types.
- Embedding credentials directly in DAG code instead of using Airflow connections or a secrets backend.
- Forgetting that paths like `/tmp/orders.csv` and `/opt/airflow/data/ack.txt` must exist on the actual worker container or VM that runs the task.
- Leaving FTP sessions open. Close them in a `finally` block so repeated task runs do not accumulate stale connections.
- Forgetting to URL-encode special characters if you define `AIRFLOW_CONN_*` values manually.

## Version Notes

- This guide covers `apache-airflow-providers-ftp` version `3.14.1`.
- Keep `apache-airflow` pinned when you install or upgrade the provider so dependency resolution does not silently change your Airflow core version.
- Use the Airflow constraints file for your Airflow and Python versions when building a fresh environment or updating provider packages.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-ftp/stable/`
- FTP connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-ftp/stable/connections/ftp.html`
- `FTPHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-ftp/stable/_api/airflow/providers/ftp/hooks/ftp/index.html`
- FTP operators API reference: `https://airflow.apache.org/docs/apache-airflow-providers-ftp/stable/_api/airflow/providers/ftp/operators/ftp/index.html`
- FTP sensors API reference: `https://airflow.apache.org/docs/apache-airflow-providers-ftp/stable/_api/airflow/providers/ftp/sensors/ftp/index.html`
- Airflow installation from PyPI: `https://airflow.apache.org/docs/apache-airflow/stable/installation/installing-from-pypi.html`
- PyPI package page: `https://pypi.org/project/apache-airflow-providers-ftp/`
