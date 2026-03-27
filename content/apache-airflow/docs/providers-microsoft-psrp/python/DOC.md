---
name: providers-microsoft-psrp
description: "Apache Airflow provider for running remote Windows commands and PowerShell over PSRP connections"
metadata:
  languages: "python"
  versions: "3.2.3"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,apache-airflow,psrp,powershell,windows,remote-execution"
---

# Apache Airflow Microsoft PSRP Provider Guide

Use `apache-airflow-providers-microsoft-psrp` when an Airflow DAG needs to run `cmd.exe` commands, PowerShell cmdlets, or PowerShell scripts on a remote Windows host over PSRP.

This guide targets provider version `3.2.3`.

## Golden Rule

- Install this provider alongside a pinned `apache-airflow` version; it is not a standalone remote-execution client.
- Put the remote host, username, password, and WSMan options on an Airflow connection with type `psrp`.
- Use `command=` only for `cmd.exe /c` commands. Use `cmdlet=` or `powershell=` for actual PowerShell work.
- Pass exactly one of `command`, `cmdlet`, or `powershell` to `PsrpOperator`.

## What This Package Adds

The main entry points documented by Apache Airflow are:

- `airflow.providers.microsoft.psrp.operators.psrp.PsrpOperator`
- `airflow.providers.microsoft.psrp.hooks.psrp.PsrpHook`

The provider hook also defines:

- connection type: `psrp`
- default connection id: `psrp_default`

## Install

PyPI lists these compatibility markers for `3.2.3`:

- `apache-airflow >= 2.11.0`
- Python `3.10`, `3.11`, `3.12`, or `3.13`

For a fresh Airflow environment, install Airflow first with the official constraints file, then add the provider while keeping the Airflow pin in place:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION=3.1.8
PROVIDER_VERSION=3.2.3
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install "apache-airflow==${AIRFLOW_VERSION}" --constraint "${CONSTRAINT_URL}"
python -m pip install "apache-airflow==${AIRFLOW_VERSION}" "apache-airflow-providers-microsoft-psrp==${PROVIDER_VERSION}"
```

If Airflow is already installed, keep the Airflow version pinned when adding the provider:

```bash
python -m pip install "apache-airflow==<your-airflow-version>" "apache-airflow-providers-microsoft-psrp==3.2.3"
```

Useful checks after installation:

```bash
airflow providers list | grep -i microsoft.psrp
python -m pip check
```

## Configure A `psrp` Airflow Connection

The provider reads the remote endpoint from an Airflow connection. The hook source documents these fields:

- connection fields: `host`, `login`, `password`
- recognized extras: `auth`, `cert_validation`, `connection_timeout`, `locale`, `read_timeout`, `reconnection_retries`, `reconnection_backoff`, `ssl`, `configuration_name`

An environment-variable connection is the quickest way to wire one in:

```bash
export AIRFLOW_CONN_PSRP_DEFAULT='{"conn_type":"psrp","host":"windows.example.com","login":"Administrator","password":"REPLACE_ME","extra":{"ssl":true,"connection_timeout":30,"read_timeout":30}}'
```

Equivalent CLI setup:

```bash
airflow connections add 'psrp_default' \
  --conn-json '{
    "conn_type": "psrp",
    "host": "windows.example.com",
    "login": "Administrator",
    "password": "REPLACE_ME",
    "extra": {
      "ssl": true,
      "connection_timeout": 30,
      "read_timeout": 30
    }
  }'
```

Keep credentials and WSMan options in the connection or a secrets backend, not in DAG code.

## Run A Remote `cmd.exe` Command

When you pass `command=`, the operator runs it through `cmd.exe /c` on the remote host. This is the path to use for ordinary Windows shell commands.

```python
from airflow import DAG
from airflow.providers.microsoft.psrp.operators.psrp import PsrpOperator
from pendulum import datetime


with DAG(
    dag_id="psrp_command_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    list_temp = PsrpOperator(
        task_id="list_temp",
        psrp_conn_id="psrp_default",
        command=r'dir C:\Windows\Temp',
        do_xcom_push=False,
    )
```

Use `do_xcom_push=False` for `command=` unless you specifically control the output format yourself. The provider only adds JSON conversion automatically for `cmdlet=` and `powershell=`.

## Run A PowerShell Script And Use XCom Output

Use `powershell=` for normal PowerShell code. When `do_xcom_push=True` and you use `powershell=` or `cmdlet=`, the operator appends `ConvertTo-Json` and returns JSON-decoded output.

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.microsoft.psrp.operators.psrp import PsrpOperator
from pendulum import datetime


with DAG(
    dag_id="psrp_powershell_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    get_services = PsrpOperator(
        task_id="get_services",
        psrp_conn_id="psrp_default",
        powershell="""
        Get-Service |
          Where-Object {$_.Status -eq 'Running'} |
          Select-Object -First 5 Name, Status
        """,
    )

    @task
    def show_payload(payload) -> None:
        print(payload)

    show_payload(get_services.output)
```

This is the simplest pattern when a downstream task needs structured output from the remote session.

## Pass Parameters To A PowerShell Cmdlet

Use `cmdlet=` with `parameters=` when you want the provider to construct and invoke a specific PowerShell cmdlet.

```python
from airflow import DAG
from airflow.providers.microsoft.psrp.operators.psrp import PsrpOperator
from pendulum import datetime


with DAG(
    dag_id="psrp_cmdlet_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    top_processes = PsrpOperator(
        task_id="top_processes",
        psrp_conn_id="psrp_default",
        cmdlet="Get-Process",
        parameters={"Name": "svchost"},
    )
```

The provider enforces that `arguments=` and `parameters=` are only used with `cmdlet=` or `powershell=`, not with `command=`.

## Use The `securestring` Template Filter

The provider exposes a `securestring` Jinja filter for arguments or parameters that need to become PowerShell `SecureString` values. The operator docs require `render_template_as_native_obj=True` on the DAG when using this filter.

```python
from airflow import DAG
from airflow.providers.microsoft.psrp.operators.psrp import PsrpOperator
from pendulum import datetime


with DAG(
    dag_id="psrp_securestring_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
    render_template_as_native_obj=True,
) as dag:
    inspect_password_type = PsrpOperator(
        task_id="inspect_password_type",
        psrp_conn_id="psrp_default",
        powershell="param($Password) $Password.GetType().FullName",
        arguments=["{{ var.value.windows_admin_password | securestring }}"],
    )
```

Without native-object rendering, the filter output is serialized as a string and PowerShell does not receive a `SecureString` object.

## Reuse A Session With `PsrpHook`

Use `PsrpHook` inside TaskFlow code when you need direct access to the PSRP session. The hook can be used as a context manager so the same runspace is reused across multiple calls.

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.microsoft.psrp.hooks.psrp import PsrpHook
from pendulum import datetime


with DAG(
    dag_id="psrp_hook_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def inspect_remote_host() -> None:
        with PsrpHook(psrp_conn_id="psrp_default") as hook:
            ps = hook.invoke_cmdlet("Get-Date")
            print(ps.output)

            ps = hook.invoke_powershell("$PSVersionTable.PSVersion.ToString()")
            print(ps.output)

    inspect_remote_host()
```

Hook methods documented in the API page:

- `invoke_cmdlet(...)`
- `invoke_powershell(...)`
- `test_connection()`

## Operational Checks

Confirm the provider is installed:

```bash
airflow providers list | grep -i microsoft.psrp
```

Confirm the connection resolves:

```bash
airflow connections get psrp_default
```

Parse-test the DAG:

```bash
airflow dags list
airflow tasks test psrp_command_example list_temp 2026-03-13
```

If you want a task-level connectivity check in DAG code, use the hook:

```python
from airflow.providers.microsoft.psrp.hooks.psrp import PsrpHook

hook = PsrpHook(psrp_conn_id="psrp_default")
ok, message = hook.test_connection()
print(ok, message)
```

## Common Pitfalls

- Treating `command=` as PowerShell. The provider explicitly wraps it in `cmd.exe /c`.
- Passing more than one of `command`, `cmdlet`, or `powershell`; the operator rejects that.
- Passing `arguments=` or `parameters=` together with `command=`; the operator rejects that too.
- Expecting structured XCom output from `command=`. Automatic JSON conversion is only applied for `cmdlet=` and `powershell=`.
- Forgetting `render_template_as_native_obj=True` when using the `securestring` filter.
- Adding unknown keys under connection `extra`; the hook raises if unsupported extras are present.

## Version Notes

- This guide covers `apache-airflow-providers-microsoft-psrp==3.2.3`.
- The provider changelog documents `apache-airflow >= 2.11.0` as the minimum Airflow version starting in the `3.2.0` line.
- The `3.1.4` changelog notes support for `arguments` and `parameters` when `powershell` is used, so the examples here rely on behavior that is present in `3.2.3`.
- The `3.0.0` changelog removed deprecated `kwargs` passthrough for `invoke_cmdlet`; use `parameters=` instead.

## Official Sources

- Provider docs root: https://airflow.apache.org/docs/apache-airflow-providers-microsoft-psrp/stable/
- Provider overview and changelog: https://airflow.apache.org/docs/apache-airflow-providers-microsoft-psrp/stable/index.html
- Operator guide: https://airflow.apache.org/docs/apache-airflow-providers-microsoft-psrp/stable/operators/index.html
- `PsrpHook` API reference: https://airflow.apache.org/docs/apache-airflow-providers-microsoft-psrp/stable/_api/airflow/providers/microsoft/psrp/hooks/psrp/index.html
- `PsrpOperator` API reference: https://airflow.apache.org/docs/apache-airflow-providers-microsoft-psrp/stable/_api/airflow/providers/microsoft/psrp/operators/psrp/index.html
- PyPI package page: https://pypi.org/project/apache-airflow-providers-microsoft-psrp/3.2.3/
