---
name: providers-hashicorp
description: "Apache Airflow HashiCorp provider for Vault connections, secret reads and writes, and Vault-backed Airflow secrets"
metadata:
  languages: "python"
  versions: "4.5.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,hashicorp,vault,secrets,dag,python"
---

# apache-airflow-providers-hashicorp

Use `apache-airflow-providers-hashicorp` when your DAGs need to read or write HashiCorp Vault secrets with `VaultHook`, or when Airflow itself should resolve Connections and Variables from Vault through `VaultBackend`.

This guide targets provider version `4.5.0`.

## Install

Install the provider into the same Python environment or container image used by every Airflow component that parses or runs DAGs.

The provider docs list these requirements for `4.5.0`:

- `apache-airflow>=2.11.0`
- `hvac>=1.1.0`

If Airflow is already installed, keep it pinned when adding the provider:

```bash
python -m pip install \
  "apache-airflow==<your-airflow-version>" \
  "apache-airflow-providers-hashicorp==4.5.0"
```

Useful checks after installation:

```bash
airflow providers list | grep hashicorp
airflow info
```

## Configure A Vault Connection

The provider's default connection ID is `vault_default`. The connection type is `Vault`.

The maintainer connection docs map the Airflow connection fields like this:

- `Host`: Vault host name
- `Schema`: secret mount point, default `secret`
- `Login`: username for `ldap` and `userpass`; also used as AppRole `role_id`
- `Password`: password for `ldap`, `userpass`, and `token`
- `Port`: Vault port, usually `8200`
- `Extra`: JSON for provider-specific options such as `auth_type`, `auth_mount_point`, and `kv_engine_version`

Create a token-based connection with the Airflow CLI:

```bash
airflow connections add 'vault_default' \
  --conn-type 'vault' \
  --conn-host 'vault.example.com' \
  --conn-schema 'airflow' \
  --conn-port '8200' \
  --conn-password 's.xxxxxxxx' \
  --conn-extra '{"auth_type":"token","kv_engine_version":2}'
```

Important connection extras from the provider docs and API reference:

- `auth_type`: `token`, `github`, `approle`, `kubernetes`, `gcp`, `azure`, `ldap`, `radius`, `userpass`, or `jwt`
- `auth_mount_point`: non-default auth mount if your Vault auth backend is not mounted at the default path
- `kv_engine_version`: `1` or `2`; defaults to `2`
- `token_path`: file path to a token, useful when you do not want the token in the Airflow connection password
- `kubernetes_role`: role name for Kubernetes auth
- `jwt_role`, `jwt_token`, `jwt_token_path`: JWT auth parameters added in the current API docs

Use Airflow connections, Vault auth files, or a secrets backend for credentials. Do not hard-code Vault tokens in DAG files.

## Read And Write Vault Secrets In DAG Code

`VaultHook` is the package's main Python API surface for task code.

```python
from __future__ import annotations

from airflow import DAG
from airflow.decorators import task
from airflow.providers.hashicorp.hooks.vault import VaultHook
from pendulum import datetime


with DAG(
    dag_id="vault_hook_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
    tags=["vault"],
) as dag:
    @task
    def read_secret() -> str:
        hook = VaultHook(vault_conn_id="vault_default")
        secret = hook.get_secret(secret_path="applications/payments/api") or {}
        api_key = secret["api_key"]
        print(f"loaded key prefix: {api_key[:4]}")
        return api_key

    @task
    def write_secret() -> None:
        hook = VaultHook(vault_conn_id="vault_default")
        hook.create_or_update_secret(
            secret_path="applications/payments/runtime",
            secret={"rotated_by": "airflow", "status": "ok"},
        )

    read_secret() >> write_secret()
```

The public hook methods documented in the API reference are:

- `get_secret(secret_path, secret_version=None)` to read a secret as a dictionary
- `get_secret_metadata(secret_path)` to fetch KV v2 metadata
- `get_secret_including_metadata(secret_path, secret_version=None)` when you need both the data and metadata payload
- `create_or_update_secret(secret_path, secret, cas=None)` to write secret data

If your Vault mount uses KV v1, do not pass `secret_version` and do not expect metadata methods to work. Those behaviors are KV v2-specific.

## Use Vault As Airflow's Secrets Backend

The provider also exposes `VaultBackend`, which lets Airflow resolve Connections, Variables, and optional config values from Vault instead of only from the Airflow metadata database.

Set the backend in the Airflow environment:

```bash
export AIRFLOW__SECRETS__BACKEND="airflow.providers.hashicorp.secrets.vault.VaultBackend"
export AIRFLOW__SECRETS__BACKEND_KWARGS='{
  "connections_path": "connections",
  "variables_path": "variables",
  "mount_point": "airflow",
  "url": "http://127.0.0.1:8200",
  "auth_type": "token",
  "token": "s.xxxxxxxx",
  "kv_engine_version": 2
}'
```

The backend docs show the corresponding Vault KV setup:

```bash
vault secrets enable -path=airflow -version=2 kv
vault kv put airflow/connections/smtp_default conn_uri=smtps://user:pass@relay.example.com:465
vault kv put airflow/variables/deploy_env value=prod
```

Once configured, use the normal Airflow APIs in code:

```python
from airflow.hooks.base import BaseHook
from airflow.models import Variable


smtp_conn = BaseHook.get_connection("smtp_default")
deploy_env = Variable.get("deploy_env")

print(smtp_conn.host)
print(deploy_env)
```

Backend lookup behavior from the maintainer docs:

- `connections_path` controls where Connection IDs are resolved
- `variables_path` controls where Variables are resolved
- `config_path` is optional for Airflow config values
- set any of those paths to `null` to disable lookups for that category
- if you omit `url`, the backend can also use standard Vault client environment variables such as `VAULT_ADDR`

After changing backend settings, restart all Airflow components that need to read secrets through Vault.

## Operational Checks

Check that Airflow can see the provider and the connection:

```bash
airflow providers list | grep hashicorp
airflow connections get vault_default
```

Validate a task import and Vault access path without waiting for the scheduler:

```bash
airflow dags list
airflow tasks test vault_hook_example read_secret 2026-03-13
```

## Common Pitfalls

- Install the provider everywhere DAG code runs. A worker image missing the package will fail on import even if the scheduler has it.
- `Schema` is the Vault secret mount point, not an HTTP URL scheme. If your secrets live under `airflow/...`, set the connection schema or backend `mount_point` to `airflow`.
- `kv_engine_version` defaults to `2`. Set it explicitly to `1` when your Vault mount uses KV v1.
- `get_secret_metadata(...)` and versioned reads are for KV v2. They are not interchangeable with KV v1 mounts.
- AppRole changed in provider `4.0.0`: the changelog says `role_id` moved from connection extras to the connection login field.
- Provider `4.5.0` adds JWT and OIDC auth support in the changelog, and the current `VaultHook` API exposes `auth_type="jwt"` plus `jwt_role`, `jwt_token`, and `jwt_token_path`. The connection guide page still shows an older auth-type list, so use the current API reference when wiring JWT auth.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-hashicorp/stable/`
- Installation and requirements: `https://airflow.apache.org/docs/apache-airflow-providers-hashicorp/stable/index.html`
- Vault connection type: `https://airflow.apache.org/docs/apache-airflow-providers-hashicorp/stable/connections/vault.html`
- Vault secrets backend: `https://airflow.apache.org/docs/apache-airflow-providers-hashicorp/stable/secrets-backends/hashicorp-vault.html`
- `VaultHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-hashicorp/stable/_api/airflow/providers/hashicorp/hooks/vault/index.html`
- Provider changelog: `https://airflow.apache.org/docs/apache-airflow-providers-hashicorp/stable/changelog.html`
