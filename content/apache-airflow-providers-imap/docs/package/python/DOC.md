---
name: package
description: "Apache Airflow IMAP provider guide for configuring IMAP connections and reading mailbox data from DAG tasks"
metadata:
  languages: "python"
  versions: "3.11.0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "airflow,apache-airflow,imap,email,dag,python"
---

# apache-airflow-providers-imap

Use `apache-airflow-providers-imap` when your Airflow DAGs need an Airflow-managed IMAP connection and Python task code that reads mailbox state or message content through the standard IMAP client.

This guide targets provider version `3.11.0`.

## Golden Rule

- Install this provider alongside a pinned `apache-airflow` version; it is not a standalone email library.
- Keep IMAP credentials in an Airflow connection such as `imap_default` instead of hard-coding them in DAG files.
- Use `ImapHook` inside tasks, then call standard IMAP methods on the client returned by `get_conn()`.

## Install

Start from an Airflow installation that uses the official constraints file for your Airflow and Python versions, then add the IMAP provider in the same command.

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION="<your-airflow-version>"
PROVIDER_VERSION="3.11.0"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-imap==${PROVIDER_VERSION}" \
  --constraint "${CONSTRAINT_URL}"
```

If Airflow is already installed, keep `apache-airflow` pinned when you add the provider:

```bash
python -m pip install \
  "apache-airflow==<your-airflow-version>" \
  "apache-airflow-providers-imap==3.11.0"
```

Useful checks after installation:

```bash
airflow providers list | grep -i imap
airflow info
```

In practice, every Airflow image or environment that imports DAGs or runs tasks must have the provider installed.

## Configure An IMAP Connection

Create an Airflow connection with connection type `imap`. A common connection id is `imap_default`.

Set shell variables first:

```bash
export IMAP_HOST="imap.example.com"
export IMAP_PORT="993"
export IMAP_USERNAME="alerts@example.com"
export IMAP_PASSWORD="<app-password-or-mail-password>"
```

Then create the Airflow connection:

```bash
airflow connections add 'imap_default' \
  --conn-type 'imap' \
  --conn-host "$IMAP_HOST" \
  --conn-port "$IMAP_PORT" \
  --conn-login "$IMAP_USERNAME" \
  --conn-password "$IMAP_PASSWORD"
```

Confirm the connection exists before wiring it into a DAG:

```bash
airflow connections get imap_default
```

Keep secrets in Airflow connections or a secrets backend instead of embedding usernames and passwords in DAG code.

## Use `ImapHook` In A Task

Use `ImapHook` when task code needs to talk to the mailbox directly. The hook manages Airflow connection lookup, and `get_conn()` returns the IMAP client you use for normal mailbox operations.

```python
from __future__ import annotations

from email import message_from_bytes

from airflow import DAG
from airflow.decorators import task
from airflow.providers.imap.hooks.imap import ImapHook
from pendulum import datetime


with DAG(
    dag_id="imap_list_unseen_subjects",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def list_unseen_subjects() -> list[str]:
        hook = ImapHook(imap_conn_id="imap_default")
        client = hook.get_conn()

        try:
            status, _ = client.select("INBOX")
            if status != "OK":
                raise RuntimeError("failed to select INBOX")

            status, data = client.search(None, "UNSEEN")
            if status != "OK":
                raise RuntimeError("failed to search mailbox")

            subjects: list[str] = []

            for message_id in data[0].split():
                fetch_status, message_data = client.fetch(message_id, "(RFC822)")
                if fetch_status != "OK":
                    raise RuntimeError(f"failed to fetch message {message_id!r}")

                raw_message = message_data[0][1]
                message = message_from_bytes(raw_message)
                subjects.append(message.get("Subject", ""))

            return subjects
        finally:
            client.logout()

    list_unseen_subjects()
```

The important pattern is:

1. create `ImapHook(imap_conn_id="...")`
2. call `hook.get_conn()`
3. use the returned IMAP client for normal IMAP calls such as `select()`, `search()`, `fetch()`, and `logout()`

## Save A Matching Attachment From A Mailbox

For mailbox-driven ingestion, combine `ImapHook` with the standard library `email` package to inspect MIME parts and persist the file you care about.

```python
from __future__ import annotations

from email import message_from_bytes
from pathlib import Path

from airflow import DAG
from airflow.decorators import task
from airflow.providers.imap.hooks.imap import ImapHook
from pendulum import datetime


with DAG(
    dag_id="imap_download_attachment",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def save_attachment() -> str:
        hook = ImapHook(imap_conn_id="imap_default")
        client = hook.get_conn()

        try:
            status, _ = client.select("INBOX")
            if status != "OK":
                raise RuntimeError("failed to select INBOX")

            status, data = client.search(None, "UNSEEN")
            if status != "OK":
                raise RuntimeError("failed to search mailbox")

            for message_id in data[0].split():
                fetch_status, message_data = client.fetch(message_id, "(RFC822)")
                if fetch_status != "OK":
                    continue

                raw_message = message_data[0][1]
                message = message_from_bytes(raw_message)

                for part in message.walk():
                    filename = part.get_filename()
                    if filename != "report.csv":
                        continue

                    payload = part.get_payload(decode=True)
                    if payload is None:
                        continue

                    output_path = Path("/opt/airflow/data/report.csv")
                    output_path.parent.mkdir(parents=True, exist_ok=True)
                    output_path.write_bytes(payload)
                    return str(output_path)

            raise FileNotFoundError("report.csv not found in unseen messages")
        finally:
            client.logout()

    save_attachment()
```

This pattern is useful when downstream tasks need a local file path or when you want full control over which mailbox, message flags, and attachment names count as a match.

## Common Setup Pattern

For most DAGs, a clean split is:

- keep host, port, username, and password in an Airflow connection
- create the IMAP client inside a task with `ImapHook`
- parse message bodies and attachments with Python's standard `email` library
- return only small derived values from tasks instead of entire raw messages

## Pitfalls

- Installing the provider only on the scheduler or webserver: workers also need it anywhere task code imports `airflow.providers.imap`.
- Embedding mailbox credentials directly in DAG code instead of using Airflow connections or a secrets backend.
- Forgetting to call `select()` before `search()` or `fetch()`.
- Assuming IMAP responses are already decoded strings. Search results, message ids, and raw message payloads come back as bytes.
- Leaving sessions open. Call `logout()` in a `finally` block so repeated task runs do not accumulate idle IMAP sessions.
- Using a local output path that does not exist on the worker runtime. If you save attachments to disk, make sure the path exists inside the actual Airflow worker container or VM.
- Assuming every mailbox is named `INBOX`. Verify the server's folder names before hard-coding other folders into DAG logic.

## Version Notes

- This guide covers `apache-airflow-providers-imap` version `3.11.0`.
- Pin the provider together with your Airflow core version and use the matching Airflow constraints file when you install or upgrade it.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-imap/stable/`
- Airflow installation docs: `https://airflow.apache.org/docs/apache-airflow/stable/installation/installing-from-pypi.html`
- PyPI: `https://pypi.org/project/apache-airflow-providers-imap/`
