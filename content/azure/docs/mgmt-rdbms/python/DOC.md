---
name: mgmt-rdbms
description: "Azure RDBMS management SDK for Python for Azure Database for MySQL and PostgreSQL control-plane operations"
metadata:
  languages: "python"
  versions: "10.1.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,arm,management,mysql,postgresql,database"
---

# Azure RDBMS Management SDK For Python

## Golden Rule

Use `azure-mgmt-rdbms` for Azure Resource Manager control-plane work: listing servers, managing databases, firewall rules, configurations, and server lifecycle actions for Azure Database for MySQL and PostgreSQL. Do not use it to open database connections or run SQL queries.

For `10.1.1`, the practical namespaces for current services are:

- `azure.mgmt.rdbms.mysql_flexibleservers`
- `azure.mgmt.rdbms.postgresql_flexibleservers`

The older `azure.mgmt.rdbms.mysql` and `azure.mgmt.rdbms.postgresql` namespaces still appear in the package, but Microsoft’s PyPI release history for this package says those single-server paths should be migrated away from because the underlying single-server services are retired.

## Install

PyPI lists `10.1.1` as the latest stable release and requires Python 3.9+.

```bash
python -m pip install "azure-mgmt-rdbms==10.1.1" "azure-identity"
```

Common alternatives:

```bash
uv add "azure-mgmt-rdbms==10.1.1" azure-identity
poetry add "azure-mgmt-rdbms==10.1.1" azure-identity
```

Typical environment variables:

```bash
export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"

# Needed when authenticating with a service principal
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"
```

For local development, Microsoft recommends token-based Entra ID auth. The fastest path is usually:

```bash
az login
```

## Authentication And Client Setup

`DefaultAzureCredential()` is the standard starting point for Azure SDK apps because it works with local developer credentials and Azure-hosted identities. In production, prefer a narrower credential such as managed identity when your runtime is fixed.

Create one credential and reuse the specific management client for the service you are targeting:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.rdbms.mysql_flexibleservers import MySQLManagementClient
from azure.mgmt.rdbms.postgresql_flexibleservers import PostgreSQLManagementClient

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]
credential = DefaultAzureCredential()

mysql_client = MySQLManagementClient(
    credential=credential,
    subscription_id=subscription_id,
)

postgres_client = PostgreSQLManagementClient(
    credential=credential,
    subscription_id=subscription_id,
)
```

Practical notes:

- `subscription_id` is required for both clients.
- These are management clients. The identity also needs Azure RBAC rights on the subscription, resource group, or server you are touching.
- The client constructors accept `base_url` and `cloud_setting` if you need a non-public Azure cloud.

## Core Workflows

### List PostgreSQL flexible servers in a resource group

Use `servers.list_by_resource_group(...)` when you already know the resource group:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.rdbms.postgresql_flexibleservers import PostgreSQLManagementClient

client = PostgreSQLManagementClient(
    credential=DefaultAzureCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)

for server in client.servers.list_by_resource_group("rg-data-prod"):
    print(server.name, server.location, server.version)
```

### Create or update a MySQL flexible server database

`databases.begin_create_or_update(...)` is a long-running operation. Wait for `.result()`.

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.rdbms.mysql_flexibleservers import MySQLManagementClient
from azure.mgmt.rdbms.mysql_flexibleservers.models import Database

client = MySQLManagementClient(
    credential=DefaultAzureCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)

poller = client.databases.begin_create_or_update(
    resource_group_name="rg-data-prod",
    server_name="mysql-flex-prod",
    database_name="appdb",
    parameters=Database(
        charset="utf8mb4",
        collation="utf8mb4_0900_ai_ci",
    ),
)

database = poller.result()
print(database.name, database.charset, database.collation)
```

### Create a PostgreSQL flexible server firewall rule

Firewall rules also use a `begin_*` long-running call:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.rdbms.postgresql_flexibleservers import PostgreSQLManagementClient
from azure.mgmt.rdbms.postgresql_flexibleservers.models import FirewallRule

client = PostgreSQLManagementClient(
    credential=DefaultAzureCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)

poller = client.firewall_rules.begin_create_or_update(
    resource_group_name="rg-data-prod",
    server_name="postgres-flex-prod",
    firewall_rule_name="office-ip",
    parameters=FirewallRule(
        start_ip_address="203.0.113.10",
        end_ip_address="203.0.113.10",
    ),
)

rule = poller.result()
print(rule.name, rule.start_ip_address, rule.end_ip_address)
```

### Update a PostgreSQL server configuration

The configuration operations support `begin_put(...)` and `begin_update(...)`. This example updates one named configuration:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.rdbms.postgresql_flexibleservers import PostgreSQLManagementClient
from azure.mgmt.rdbms.postgresql_flexibleservers.models import Configuration

client = PostgreSQLManagementClient(
    credential=DefaultAzureCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)

poller = client.configurations.begin_update(
    resource_group_name="rg-data-prod",
    server_name="postgres-flex-prod",
    configuration_name="log_min_duration_statement",
    parameters=Configuration(
        value="300",
        source="user-override",
    ),
)

config = poller.result()
print(config.name, config.value, config.source)
```

### Update server metadata or administrator password

The server update API accepts a `ServerForUpdate` payload with only the fields you want to change:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.rdbms.postgresql_flexibleservers import PostgreSQLManagementClient
from azure.mgmt.rdbms.postgresql_flexibleservers.models import ServerForUpdate

client = PostgreSQLManagementClient(
    credential=DefaultAzureCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)

poller = client.servers.begin_update(
    resource_group_name="rg-data-prod",
    server_name="postgres-flex-prod",
    parameters=ServerForUpdate(
        tags={
            "env": "prod",
            "owner": "data-platform",
        },
    ),
)

server = poller.result()
print(server.name, server.tags)
```

If you need to rotate the administrator password, pass `administrator_login_password` in the same `ServerForUpdate(...)` model instead of inventing a separate password-reset call.

### Start, stop, or restart a PostgreSQL flexible server

These operations are explicit server actions:

```python
client.servers.begin_stop(
    resource_group_name="rg-data-prod",
    server_name="postgres-flex-prod",
).result()

client.servers.begin_start(
    resource_group_name="rg-data-prod",
    server_name="postgres-flex-prod",
).result()

client.servers.begin_restart(
    resource_group_name="rg-data-prod",
    server_name="postgres-flex-prod",
).result()
```

## Common Pitfalls

- Do not instantiate operation classes directly. Use `client.servers`, `client.databases`, `client.firewall_rules`, and `client.configurations`.
- Most write operations are long-running and use `begin_*`. Call `.result()` if your code must wait for the ARM operation to finish.
- `azure-mgmt-rdbms` is not a data-plane client. Use a PostgreSQL or MySQL driver separately for application queries.
- Pick the correct namespace before writing code. `mysql_flexibleservers` and `postgresql_flexibleservers` are not interchangeable.
- Authentication success does not imply authorization success. A valid token without the right RBAC role still fails management calls.
- Firewall rules expect IPv4 strings. The model requires both `start_ip_address` and `end_ip_address`.
- Keep resource names distinct: `resource_group_name`, `server_name`, `database_name`, and `configuration_name` are different ARM identifiers.

## Version-Sensitive Notes

- PyPI lists `10.1.1` as the latest stable release and says it fixes an import error in `10.1.0` after newer `azure-core` upgrades.
- PyPI also shows a newer beta line, `10.2.0b18`, that deprecates `mysql_flexibleservers` and `postgresql_flexibleservers` inside this umbrella package and points users to `azure-mgmt-mysqlflexibleservers` and `azure-mgmt-postgresqlflexibleservers`.
- For projects pinned to `azure-mgmt-rdbms==10.1.1`, the flexible-server imports shown in this guide remain the package-local imports documented on Microsoft Learn.
- The same PyPI release history says the older `mysql` and `postgresql` modules map to retired single-server offerings. That means new automation should avoid those namespaces even if old examples still import them.

## Official Sources

- https://pypi.org/project/azure-mgmt-rdbms/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-rdbms/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-rdbms/azure.mgmt.rdbms.mysql_flexibleservers.mysqlmanagementclient?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-rdbms/azure.mgmt.rdbms.postgresql_flexibleservers.postgresqlmanagementclient?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-rdbms/azure.mgmt.rdbms.postgresql_flexibleservers.operations.serversoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-rdbms/azure.mgmt.rdbms.mysql_flexibleservers.operations.databasesoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-rdbms/azure.mgmt.rdbms.postgresql_flexibleservers.operations.firewallrulesoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-rdbms/azure.mgmt.rdbms.postgresql_flexibleservers.operations.configurationsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-rdbms/azure.mgmt.rdbms.mysql_flexibleservers.models.database?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-rdbms/azure.mgmt.rdbms.postgresql_flexibleservers.models.firewallrule?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-rdbms/azure.mgmt.rdbms.postgresql_flexibleservers.models.configuration?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-rdbms/azure.mgmt.rdbms.postgresql_flexibleservers.models.serverforupdate?view=azure-python
- https://learn.microsoft.com/en-us/azure/developer/python/sdk/authentication/overview
- https://learn.microsoft.com/en-us/python/api/overview/azure/identity-readme?view=azure-python
