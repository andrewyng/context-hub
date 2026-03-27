---
name: providers-ssh
description: "Apache Airflow SSH provider for SSH connections, remote command execution, tunnels, and resilient detached remote jobs"
metadata:
  languages: "python"
  versions: "4.3.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,apache-airflow,ssh,remote-execution,operators,tunnels,python"
---

# Apache Airflow SSH Provider Guide

Use `apache-airflow-providers-ssh` when an Airflow DAG needs to run commands on a remote host over SSH, open a port-forwarding tunnel, or keep a long-running remote job alive while the task monitoring moves to the triggerer.

This guide targets provider version `4.3.1`.

## Golden Rule

- Install this provider alongside a pinned `apache-airflow` version; it is not a standalone SSH client package.
- Put hosts, credentials, keys, and SSH policy settings on an Airflow `SSH` connection instead of hard-coding them in DAG files.
- Use `SSHOperator` for short synchronous commands, `SSHRemoteJobOperator` for long-running detached jobs, and `SSHHook` when task code needs connectivity checks or port forwarding.
- Tighten host-key checking explicitly. The provider's SSH connection extras default `no_host_key_check` to `true`.

## What This Package Adds

The provider's main entry points are:

- `airflow.providers.ssh.hooks.ssh.SSHHook`
- `airflow.providers.ssh.operators.ssh.SSHOperator`
- `airflow.providers.ssh.operators.ssh_remote_job.SSHRemoteJobOperator`

The same Airflow `SSH` connection type is also reused by other integrations such as `SFTPOperator`.

## Install

PyPI lists these minimum runtime requirements for `4.3.1`:

- `apache-airflow >= 2.11.0`
- Python `3.10`, `3.11`, `3.12`, or `3.13`

For a fresh Airflow environment, install Airflow first with the official constraints file, then install the provider in a separate command while keeping the Airflow pin:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION=3.1.8
PROVIDER_VERSION=4.3.1
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install "apache-airflow==${AIRFLOW_VERSION}" --constraint "${CONSTRAINT_URL}"
python -m pip install "apache-airflow==${AIRFLOW_VERSION}" "apache-airflow-providers-ssh==${PROVIDER_VERSION}"
```

If Airflow is already installed in the image or virtualenv, keep that exact Airflow pin when you add the provider:

```bash
python -m pip install "apache-airflow==<your-airflow-version>" "apache-airflow-providers-ssh==4.3.1"
```

Useful checks after installation:

```bash
airflow providers list | grep -i ssh
python -m pip check
```

## Configure An Airflow SSH Connection

The provider reads host, auth, and policy settings from an Airflow connection with type `ssh`.

An environment-variable connection is the fastest way to wire one in:

```bash
export AIRFLOW_CONN_DEPLOY_HOST='ssh://deploy@ssh.example.com:22?conn_timeout=20&cmd_timeout=300&auth_timeout=20&no_host_key_check=false&key_file=%2Fopt%2Fairflow%2Fkeys%2Fid_ed25519'
```

With that environment variable in place:

- the Airflow connection id is `deploy_host`
- DAG code can use `ssh_conn_id="deploy_host"`

Common SSH extras supported by the provider:

- `key_file`
- `private_key`
- `private_key_passphrase`
- `conn_timeout`
- `cmd_timeout`
- `auth_timeout`
- `compress`
- `no_host_key_check`
- `allow_host_key_change`
- `look_for_keys`
- `host_key`
- `disabled_algorithms`
- `ciphers`
- `host_proxy_cmd`

If you store the connection in the Airflow UI, the extras JSON can look like this:

```json
{
  "key_file": "/opt/airflow/keys/id_ed25519",
  "conn_timeout": 20,
  "cmd_timeout": 300,
  "auth_timeout": 20,
  "no_host_key_check": false,
  "allow_host_key_change": false,
  "look_for_keys": false,
  "host_key": "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI..."
}
```

If you store raw private-key content in the Airflow UI, upstream documents using literal `\n` sequences inside the `private_key` value.

## Run A Short Remote Command With `SSHOperator`

Use `SSHOperator` when the task should connect, run a command, and finish in the same worker slot.

```python
from airflow import DAG
from airflow.providers.ssh.operators.ssh import SSHOperator
from pendulum import datetime


with DAG(
    dag_id="ssh_operator_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    run_remote_migration = SSHOperator(
        task_id="run_remote_migration",
        ssh_conn_id="deploy_host",
        command="cd /srv/myapp && ./manage.py migrate --noinput",
        environment={
            "APP_ENV": "staging",
            "DJANGO_SETTINGS_MODULE": "config.settings.staging",
        },
        cmd_timeout=300,
        get_pty=True,
        skip_on_exit_code={99},
        do_xcom_push=True,
    )
```

Important behavior from the operator API:

- `environment` is templated, but the SSH server silently rejects those variables unless `AcceptEnv` is enabled in the server SSH config.
- `get_pty=True` is the setting to use when the remote process should be killed if the Airflow task times out.
- Commands that start with `sudo` force `get_pty=True`.
- When `do_xcom_push=True`, the remote exit code is pushed to XCom under key `ssh_exit`.

## Check Connectivity Or Open A Tunnel With `SSHHook`

Use `SSHHook` inside TaskFlow code when you need a connection test or a port-forwarding tunnel rather than a single operator-managed command.

Connectivity check:

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.ssh.hooks.ssh import SSHHook
from pendulum import datetime


with DAG(
    dag_id="ssh_hook_test_connection",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def verify_host() -> None:
        hook = SSHHook(ssh_conn_id="deploy_host", auth_timeout=20)
        ok, message = hook.test_connection()
        if not ok:
            raise RuntimeError(message)

    verify_host()
```

Port forwarding to a private database behind the SSH host:

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.ssh.hooks.ssh import SSHHook
from pendulum import datetime


with DAG(
    dag_id="ssh_hook_tunnel_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def probe_private_postgres() -> int:
        hook = SSHHook(ssh_conn_id="deploy_host")
        tunnel = hook.get_tunnel(
            remote_port=5432,
            remote_host="db.internal",
            local_port=15432,
        )
        tunnel.start()
        try:
            return tunnel.local_bind_port
        finally:
            tunnel.stop()

    probe_private_postgres()
```

`get_tunnel()` is the provider's replacement for the old `create_tunnel()` API.

## Run Long Jobs With `SSHRemoteJobOperator`

`SSHRemoteJobOperator` is the better choice for long-running remote jobs in the `4.3.x` line. It submits a detached job over SSH, defers monitoring to the triggerer, and can stream logs incrementally back into Airflow.

```python
from airflow import DAG
from airflow.providers.ssh.operators.ssh_remote_job import SSHRemoteJobOperator
from pendulum import datetime


with DAG(
    dag_id="ssh_remote_job_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    run_nightly_job = SSHRemoteJobOperator(
        task_id="run_nightly_job",
        ssh_conn_id="deploy_host",
        command="/opt/jobs/nightly_etl.sh",
        poll_interval=10,
        timeout=3600,
        cleanup="on_success",
    )
```

Use this operator when:

- the remote command may run for minutes or hours
- you want monitoring moved off the worker and onto the triggerer
- temporary network drops or worker restarts are a real concern

Connection requirements called out by upstream:

- non-interactive authentication must work
- the remote host must allow command execution without PTY
- the operator needs file I/O on the remote host for logs and exit-code files

For Windows targets, set `remote_os="windows"` explicitly instead of relying on auto-detection.

## Common Setup Pattern

For most DAGs, a clean split is:

- keep one reusable Airflow `ssh` connection per target host or bastion
- use `SSHOperator` for short idempotent commands
- use `SSHRemoteJobOperator` for detached jobs that should outlive the initial SSH session
- use `SSHHook` only when task code needs a connectivity check, connection override, or local tunnel

## Pitfalls

- Install the provider everywhere Airflow imports DAG code or runs tasks. Scheduler-only installation is not enough.
- Do not rely on the default host-key behavior. The provider defaults `no_host_key_check` to `true`; set it to `false` and use `host_key` or a maintained `known_hosts` policy for stronger verification.
- Do not expect `environment={...}` to work unless the server allows those variables through `AcceptEnv`.
- Use `conn_timeout`, not the removed `timeout` hook attribute.
- Use `hook.get_conn()` as the SSH client context manager; the `SSHHook` context manager itself is deprecated.
- Use `get_tunnel()`, not the removed `create_tunnel()` API.
- Clean up remote job directories when using `SSHRemoteJobOperator`, or they will accumulate on the target host.
- A remote reboot still kills detached jobs. `SSHRemoteJobOperator` is resilient to monitoring interruptions, not to the remote machine disappearing.

## Version Notes

- `4.3.1` was released on `2026-02-02`; the changelog lists only a misc async-connection internal update for this release.
- `4.3.0` introduced `SSHRemoteJobOperator`, which is the main user-facing addition in the current minor line.
- `4.2.0` raised the minimum supported Airflow version for this provider to `2.11.0`.
- `4.0.0` removed several deprecated APIs. In current code, use `conn_timeout`, `get_tunnel()`, and the operator `hook` attribute.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-ssh/stable/`
- SSH connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-ssh/stable/connections/ssh.html`
- `SSHHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-ssh/stable/_api/airflow/providers/ssh/hooks/ssh/index.html`
- `SSHOperator` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-ssh/stable/_api/airflow/providers/ssh/operators/ssh/index.html`
- `SSHRemoteJobOperator` guide: `https://airflow.apache.org/docs/apache-airflow-providers-ssh/stable/operators/ssh_remote_job.html`
- Provider changelog: `https://airflow.apache.org/docs/apache-airflow-providers-ssh/stable/changelog.html`
- Airflow installation from PyPI: `https://airflow.apache.org/docs/apache-airflow/stable/installation/installing-from-pypi.html`
- PyPI package page: `https://pypi.org/project/apache-airflow-providers-ssh/`
