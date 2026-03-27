---
name: providers-microsoft-winrm
description: "Apache Airflow WinRM provider for running commands on Windows hosts through WinRMHook and WinRMOperator"
metadata:
  languages: "python"
  versions: "3.14.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,winrm,windows,powershell,remote-execution,python"
---

# Apache Airflow Providers Microsoft WinRM Guide

Use `apache-airflow-providers-microsoft-winrm` when your Airflow DAGs need to run commands on Windows hosts over WinRM.

## What This Package Adds

This provider adds:

- `WinRMHook` for direct WinRM calls from Python tasks
- `WinRMOperator` for command execution as a normal Airflow task

The provider is not a standalone Windows client library. It extends Airflow and uses `pywinrm` underneath.

## Install

This provider requires:

- `apache-airflow>=2.11.0`
- `apache-airflow-providers-common-compat>=1.12.0`
- `pywinrm>=0.5.0`

Install it into the same Python environment or container image as your Airflow deployment:

```bash
python -m pip install "apache-airflow-providers-microsoft-winrm==3.14.0"
```

If you are pinning Airflow in the same command, keep both versions explicit:

```bash
python -m pip install \
  "apache-airflow==<your-airflow-version>" \
  "apache-airflow-providers-microsoft-winrm==3.14.0"
```

Useful checks after installation:

```bash
airflow providers list | grep microsoft.winrm
airflow info
```

## Configure The Airflow Connection

The hook uses:

- connection type: `winrm`
- default connection id: `winrm_default`
- constructor argument name: `ssh_conn_id`

That parameter name is legacy but still current in both `WinRMHook` and `WinRMOperator`.

### Environment variable connection

Airflow connections can be stored in `AIRFLOW_CONN_{CONN_ID}` as JSON. This is the most explicit way to configure WinRM extras.

```bash
export AIRFLOW_CONN_WINRM_DEFAULT='{
  "conn_type": "winrm",
  "host": "windows.example.internal",
  "login": "Administrator",
  "password": "REPLACE_ME",
  "extra": {
    "transport": "ntlm",
    "remote_port": 5985,
    "read_timeout_sec": 60,
    "operation_timeout_sec": 30
  }
}'
```

Important fields read by the hook:

- top-level `host`, `login`, `password`
- `extra.endpoint`
- `extra.remote_port`
- `extra.transport`
- `extra.service`
- `extra.keytab`
- `extra.ca_trust_path`
- `extra.cert_pem`
- `extra.cert_key_pem`
- `extra.server_cert_validation`
- `extra.kerberos_delegation`
- `extra.read_timeout_sec`
- `extra.operation_timeout_sec`
- `extra.kerberos_hostname_override`
- `extra.message_encryption`
- `extra.credssp_disable_tlsv1_2`
- `extra.send_cbt`

### CLI connection example

```bash
airflow connections add 'winrm_default' \
  --conn-json '{
    "conn_type": "winrm",
    "host": "windows.example.internal",
    "login": "Administrator",
    "password": "REPLACE_ME",
    "extra": {
      "transport": "ntlm",
      "remote_port": 5985,
      "read_timeout_sec": 60,
      "operation_timeout_sec": 30
    }
  }'
```

### HTTPS / TLS example

If you want WinRM over HTTPS, set an explicit endpoint. When `endpoint` is omitted, the hook constructs `http://{remote_host}:{remote_port}/wsman`.

```bash
export AIRFLOW_CONN_WINRM_DEFAULT='{
  "conn_type": "winrm",
  "host": "windows.example.internal",
  "login": "Administrator",
  "password": "REPLACE_ME",
  "extra": {
    "endpoint": "https://windows.example.internal:5986/wsman",
    "transport": "ssl",
    "server_cert_validation": "validate",
    "read_timeout_sec": 60,
    "operation_timeout_sec": 30
  }
}'
```

For lab environments with self-signed certificates, `server_cert_validation` can be set to `ignore`, but do that deliberately.

## Common Workflow: Run PowerShell From A Python Task

Use `WinRMHook` when you want Python logic around the command result.

```python
from __future__ import annotations

import pendulum

from airflow import DAG
from airflow.decorators import task
from airflow.providers.microsoft.winrm.hooks.winrm import WinRMHook


with DAG(
    dag_id="winrm_hook_demo",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["winrm"],
):
    @task()
    def list_services() -> str:
        hook = WinRMHook(ssh_conn_id="winrm_default")
        return_code, stdout_chunks, stderr_chunks = hook.run(
            command="Get-Service | Select-Object -First 5 Name, Status",
            ps_path="powershell",
            working_directory=r"C:\\",
        )

        if return_code != 0:
            raise RuntimeError(b"".join(stderr_chunks).decode("utf-8"))

        output = b"".join(stdout_chunks).decode("utf-8")
        print(output)
        return output

    list_services()
```

Notes:

- Set `ps_path="powershell"` for Windows PowerShell 5.1 and earlier.
- Set `ps_path="pwsh"` for PowerShell 6+.
- `hook.run(...)` returns `(return_code, stdout_chunks, stderr_chunks)`.

## Common Workflow: Use WinRMOperator In A DAG

Use `WinRMOperator` when the task is just remote command execution.

```python
from __future__ import annotations

from datetime import timedelta

import pendulum

from airflow import DAG
from airflow.providers.microsoft.winrm.operators.winrm import WinRMOperator


with DAG(
    dag_id="winrm_operator_demo",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["winrm"],
):
    install_agent = WinRMOperator(
        task_id="install_agent",
        ssh_conn_id="winrm_default",
        command="""
        Start-Process msiexec.exe `
          -ArgumentList '/i C:\\temp\\agent.msi /qn' `
          -Wait
        exit $LASTEXITCODE
        """.strip(),
        ps_path="powershell",
        working_directory=r"C:\\temp",
        expected_return_code=[0, 3010],
        execution_timeout=timedelta(minutes=20),
    )
```

`expected_return_code` accepts an `int`, `list[int]`, or `range`. That is useful when Windows installers return `3010` for "success, reboot required".

## Deferrable Execution

`WinRMOperator` in `3.14.0` supports `deferrable=True`.

Use it for long-running remote commands when you want the task to free its worker slot while Airflow waits for output:

```python
from __future__ import annotations

from datetime import timedelta

import pendulum

from airflow import DAG
from airflow.providers.microsoft.winrm.operators.winrm import WinRMOperator


with DAG(
    dag_id="winrm_deferrable_demo",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
):
    run_patch = WinRMOperator(
        task_id="run_patch",
        ssh_conn_id="winrm_default",
        command="Start-Sleep -Seconds 300; Write-Output 'done'",
        ps_path="powershell",
        deferrable=True,
        poll_interval=5,
        execution_timeout=timedelta(minutes=10),
    )
```

To use deferrable mode, your Airflow deployment must run at least one `triggerer` process.

## Operational Checks

Check that Airflow sees the provider:

```bash
airflow providers list | grep microsoft.winrm
```

Check that the connection exists:

```bash
airflow connections get winrm_default
```

Airflow's hook-level connection test runs a remote `cd` command:

```bash
airflow connections test winrm_default
```

Check that Airflow can parse and run the DAG:

```bash
airflow dags list
airflow tasks test winrm_hook_demo list_services 2026-03-13
```

## Common Pitfalls

- Use `ssh_conn_id="winrm_default"` in code even though the Airflow connection type is `winrm`.
- If you omit `extra.endpoint`, the hook builds `http://{remote_host}:{remote_port}/wsman`. For HTTPS on port `5986`, set `extra.endpoint` explicitly.
- Keep `read_timeout_sec` slightly higher than `operation_timeout_sec`; the hook documentation calls that out directly.
- In deferrable mode, the operator requires a real `ssh_conn_id`. A prebuilt hook without `ssh_conn_id` is not enough.
- Prefer `execution_timeout` on the operator. The older `timeout` argument is deprecated.
- `working_directory` is a first-class operator and hook argument in current releases; use it instead of embedding `cd` into every command.
- Successful operator output is only pushed to XCom when XCom push is enabled for the task.

## Version Notes

- This guide covers `apache-airflow-providers-microsoft-winrm` version `3.14.0`.
- `3.14.0` adds deferrable support to `WinRMOperator`.
- `3.12.0` added the `working_directory` parameter.
- `3.11.0` added `WinRMHook.test_connection()`.

## Official Sources

- https://airflow.apache.org/docs/apache-airflow-providers-microsoft-winrm/stable/index.html
- https://airflow.apache.org/docs/apache-airflow-providers-microsoft-winrm/stable/operators.html
- https://airflow.apache.org/docs/apache-airflow-providers-microsoft-winrm/stable/_api/airflow/providers/microsoft/winrm/hooks/winrm/index.html
- https://airflow.apache.org/docs/apache-airflow-providers-microsoft-winrm/stable/_api/airflow/providers/microsoft/winrm/operators/winrm/index.html
- https://airflow.apache.org/docs/apache-airflow-providers-microsoft-winrm/stable/_modules/airflow/providers/microsoft/winrm/hooks/winrm.html
- https://airflow.apache.org/docs/apache-airflow-providers-microsoft-winrm/stable/_modules/airflow/providers/microsoft/winrm/operators/winrm.html
- https://airflow.apache.org/docs/apache-airflow-providers-microsoft-winrm/stable/changelog.html
- https://airflow.apache.org/docs/apache-airflow-providers-microsoft-winrm/stable/commits.html
- https://airflow.apache.org/docs/apache-airflow/stable/howto/connection.html
- https://airflow.apache.org/docs/apache-airflow/stable/authoring-and-scheduling/deferring.html
