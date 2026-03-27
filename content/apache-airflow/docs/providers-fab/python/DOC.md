---
name: providers-fab
description: "Apache Airflow FAB provider for Flask AppBuilder auth, RBAC roles, user management, API auth, and OAuth SSO"
metadata:
  languages: "python"
  versions: "3.4.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,apache-airflow,auth,rbac,fab,sso,python"
---

# Apache Airflow Providers FAB Guide

Use `apache-airflow-providers-fab` when an Airflow 3 deployment needs Flask AppBuilder-based authentication and authorization instead of the default simple auth flow. This provider adds `FabAuthManager`, FAB-backed user and role management commands, DAG-level access control, API auth backends, and OAuth-based SSO support.

## Golden Rule

- Install this package alongside a pinned `apache-airflow` version; it is not a standalone auth library.
- Switch Airflow to `FabAuthManager` through the `[core] auth_manager` setting before expecting FAB CLI commands or role-based UI access to work.
- Keep advanced auth settings in `webserver_config.py`, not in DAG code.
- Treat FAB database migrations as part of the auth-manager rollout and provider upgrade process.

## Install

Airflow recommends installing from PyPI with a constraints file. For a fresh Airflow 3.1.x environment:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION=3.1.8
PROVIDER_VERSION=3.4.0
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-fab==${PROVIDER_VERSION}" \
  --constraint "${CONSTRAINT_URL}"
```

If Airflow is already installed, keep core pinned when adding the provider so `pip` does not silently move you to a different Airflow version:

```bash
python -m pip install \
  "apache-airflow==3.1.8" \
  "apache-airflow-providers-fab==3.4.0"
```

PyPI for `apache-airflow-providers-fab 3.4.0` lists Python `>=3.10` and an Airflow requirement of `apache-airflow>=3.0.2`.

## Enable `FabAuthManager`

Set Airflow's auth manager to the FAB provider and point FAB at your `webserver_config.py` file:

```bash
export AIRFLOW_HOME="$PWD/.airflow"
export AIRFLOW__CORE__AUTH_MANAGER="airflow.providers.fab.auth_manager.fab_auth_manager.FabAuthManager"
export AIRFLOW__FAB__CONFIG_FILE="$AIRFLOW_HOME/webserver_config.py"
```

Start with database-backed login in `webserver_config.py`:

```python
from flask_appbuilder.security.manager import AUTH_DB

AUTH_TYPE = AUTH_DB
```

After setting the auth manager, run migrations:

```bash
airflow db migrate
```

If you upgrade the FAB provider later, the provider also exposes a dedicated migration command:

```bash
airflow fab-db migrate
```

Useful checks:

```bash
airflow config get-value core auth_manager
airflow providers list | grep fab
```

If `airflow users ...`, `airflow roles ...`, or `airflow fab-db ...` commands are missing, confirm Airflow is actually using `FabAuthManager`.

## Create Users And Roles

With the FAB auth manager enabled, Airflow exposes FAB-backed CLI commands for user and role administration.

Create an admin user:

```bash
airflow users create \
  --username admin \
  --firstname Airflow \
  --lastname Admin \
  --role Admin \
  --email admin@example.com \
  --password 'change-me-now'
```

Create a custom role and assign it:

```bash
airflow roles create DataAnalyst
airflow users add-role --username alice --role DataAnalyst
```

When you change roles, permissions, or DAG-level access rules, resync permissions:

```bash
airflow sync-perm
```

Practical role guidance from the FAB docs:

- Keep Airflow's built-in roles (`Admin`, `Op`, `User`, `Viewer`, `Public`) as reference points instead of editing them in place.
- Create new roles for app-specific access patterns.
- FAB-specific DAG `access_control` only applies when the FAB auth manager is active.

## Restrict DAG Access With `access_control`

The FAB provider supports DAG-level permissions through the DAG's `access_control` argument. This is how you grant one role read-only access to a DAG and another role edit access.

```python
from airflow import DAG
from airflow.providers.standard.operators.empty import EmptyOperator
from pendulum import datetime

with DAG(
    dag_id="fab_access_control_demo",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
    access_control={
        "Viewer": {"can_read"},
        "DataAnalyst": {"can_read", "can_edit"},
    },
) as dag:
    EmptyOperator(task_id="start")
```

After changing `access_control`, run:

```bash
airflow sync-perm
```

## Authenticate API Clients

The FAB provider exposes an auth endpoint that returns a JWT access token for users authenticated through the database or LDAP backends.

Environment variables:

```bash
export AIRFLOW_URL="http://localhost:8080"
export AIRFLOW_USERNAME="admin"
export AIRFLOW_PASSWORD="change-me-now"
```

Minimal Python client:

```python
import os
import requests

base_url = os.environ["AIRFLOW_URL"]
session = requests.Session()

token_response = session.post(
    f"{base_url}/auth/token",
    json={
        "username": os.environ["AIRFLOW_USERNAME"],
        "password": os.environ["AIRFLOW_PASSWORD"],
    },
    timeout=30,
)
token_response.raise_for_status()

access_token = token_response.json()["access_token"]
session.headers.update({"Authorization": f"Bearer {access_token}"})

dags_response = session.get(f"{base_url}/api/v2/dags", timeout=30)
dags_response.raise_for_status()
print(dags_response.json())
```

Equivalent `curl` flow:

```bash
TOKEN="$(
  curl -sS -X POST "${AIRFLOW_URL}/auth/token" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"${AIRFLOW_USERNAME}\",\"password\":\"${AIRFLOW_PASSWORD}\"}" |
  python -c 'import json,sys; print(json.load(sys.stdin)["access_token"])'
)"

curl -sS "${AIRFLOW_URL}/api/v2/dags" \
  -H "Authorization: Bearer ${TOKEN}"
```

For FAB-managed API routes, the provider's default API backend is session-based. If you need HTTP basic auth for those routes, set:

```bash
export AIRFLOW__FAB__AUTH_BACKENDS="airflow.providers.fab.auth_manager.api.auth.backend.session,airflow.providers.fab.auth_manager.api.auth.backend.basic_auth"
```

## Configure OAuth SSO

FAB reads advanced auth settings from `webserver_config.py`. To switch from local database login to OAuth:

```python
import os

from airflow.providers.fab.auth_manager.security_manager.override import FabAirflowSecurityManagerOverride
from flask_appbuilder.security.manager import AUTH_OAUTH

AUTH_TYPE = AUTH_OAUTH
AUTH_USER_REGISTRATION = True
AUTH_USER_REGISTRATION_ROLE = "Viewer"
SECURITY_MANAGER_CLASS = FabAirflowSecurityManagerOverride

OAUTH_PROVIDERS = [
    {
        "name": "my_idp",
        "icon": "fa-circle-o",
        "token_key": "access_token",
        "remote_app": {
            "client_id": os.environ["OAUTH_CLIENT_ID"],
            "client_secret": os.environ["OAUTH_CLIENT_SECRET"],
            "api_base_url": "https://idp.example.com/",
            "client_kwargs": {"scope": "openid email profile"},
            "access_token_url": "https://idp.example.com/oauth/token",
            "authorize_url": "https://idp.example.com/oauth/authorize",
            "request_token_url": None,
        },
    }
]
```

Environment variables for that setup:

```bash
export OAUTH_CLIENT_ID="your-client-id"
export OAUTH_CLIENT_SECRET="your-client-secret"
```

Important SSO behavior:

- FAB can auto-register first-time users when `AUTH_USER_REGISTRATION = True`.
- `AUTH_USER_REGISTRATION_ROLE` controls the starting role for newly created users.
- Provider `3.x` removed `AUTH_OID`; the supported OpenID Connect path is `AUTH_OAUTH`.

Restart the Airflow UI process after changing `webserver_config.py`.

## Common Pitfalls

- Setting the wrong config section for `auth_manager`. Airflow's auth-manager docs use `[core] auth_manager`; use `AIRFLOW__CORE__AUTH_MANAGER`.
- Expecting FAB commands before the provider is the active auth manager. The command groups are only exposed for the configured auth manager.
- Forgetting the FAB migration step after switching auth managers or upgrading the provider.
- Using the JWT `/auth/token` flow with an OAuth-only user. The username/password token endpoint is documented for DB- and LDAP-authenticated users.
- Editing Airflow's built-in roles instead of creating your own roles.
- Changing DAG `access_control` without running `airflow sync-perm`.

## Version Notes

- This guide covers `apache-airflow-providers-fab 3.4.0`.
- The provider docs publish a dedicated CLI group for FAB database migrations in the 3.4.0 line.
- The 3.0.0 provider release removed `AUTH_OID`; if you are migrating old Airflow 2.x FAB configs, convert those settings to `AUTH_OAUTH`.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-fab/3.4.0/`
- Configuration reference: `https://airflow.apache.org/docs/apache-airflow-providers-fab/3.4.0/configurations-ref.html`
- Access control: `https://airflow.apache.org/docs/apache-airflow-providers-fab/3.4.0/auth-manager/access-control.html`
- API and CLI auth: `https://airflow.apache.org/docs/apache-airflow-providers-fab/3.4.0/auth-manager/api-authentication.html`
- JWT token endpoint: `https://airflow.apache.org/docs/apache-airflow-providers-fab/3.4.0/auth-manager/token.html`
- OAuth/SSO setup: `https://airflow.apache.org/docs/apache-airflow-providers-fab/3.4.0/auth-manager/sso.html`
- CLI reference: `https://airflow.apache.org/docs/apache-airflow-providers-fab/3.4.0/cli-ref.html`
- PyPI package page: `https://pypi.org/project/apache-airflow-providers-fab/`
