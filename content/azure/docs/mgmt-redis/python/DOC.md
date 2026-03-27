---
name: mgmt-redis
description: "Azure Cache for Redis management-plane SDK for Python for provisioning caches, firewall rules, keys, maintenance, and ARM-side configuration"
metadata:
  languages: "python"
  versions: "14.5.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,redis,cache,arm,management,python"
---

# Azure Cache for Redis Management SDK for Python

## Golden Rule

Use `azure-mgmt-redis` for Azure Resource Manager control-plane work on Azure Cache for Redis: create or update caches, inspect provisioning state, manage firewall rules, list or regenerate access keys, export data, flush or reboot caches, and configure other ARM-exposed settings. Do not use it for Redis commands such as `GET`, `SET`, or pub/sub traffic. Application traffic still goes through a Redis data-plane client such as `redis`.

Also verify that Azure Cache for Redis is still the right service for the project. Microsoft announced retirement for all Azure Cache for Redis SKUs in October 2025. New Basic, Standard, and Premium caches stop being available for new customers on April 1, 2026, and for existing customers on October 1, 2026. Existing Basic, Standard, and Premium caches remain available through September 30, 2028, and remaining instances are turned off on October 1, 2028. Enterprise and Enterprise Flash tiers remain available through March 31, 2027. For net-new deployments, check whether Azure Managed Redis is the intended target instead of assuming this package is the right default.

## Install

Pin the package version you actually want and install `azure-identity` with it:

```bash
python -m pip install "azure-mgmt-redis==14.5.0" azure-identity
```

Common alternatives:

```bash
uv add "azure-mgmt-redis==14.5.0" azure-identity
poetry add "azure-mgmt-redis==14.5.0" azure-identity
```

Environment variables you usually need:

```bash
export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
```

If you authenticate with a service principal directly, also set:

```bash
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"
```

## Authentication And Client Setup

`RedisManagementClient` expects a `TokenCredential` plus a subscription ID. The usual default is `DefaultAzureCredential()` so local `az login`, managed identity, workload identity, and environment-based service principal auth all work without changing the client code.

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.redis import RedisManagementClient

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]
credential = DefaultAzureCredential()

client = RedisManagementClient(
    credential=credential,
    subscription_id=subscription_id,
)
```

For local scripts that should use the Azure CLI identity explicitly:

```python
import os

from azure.identity import AzureCliCredential
from azure.mgmt.redis import RedisManagementClient

client = RedisManagementClient(
    credential=AzureCliCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)
```

The main operation groups exposed by the client include:

- `redis`
- `firewall_rules`
- `patch_schedules`
- `private_endpoint_connections`
- `private_link_resources`
- `linked_server`
- `access_policy`
- `access_policy_assignment`

Most write operations on `client.redis` are long-running ARM operations. If the method starts with `begin_`, call `.result()` before assuming the change finished.

## Core Workflows

### Create a cache

The generated model docs mark `location` and `sku` as required on `RedisCreateParameters`. A minimal create flow looks like this:

```python
from azure.mgmt.redis.models import RedisCreateParameters, Sku

poller = client.redis.begin_create(
    resource_group_name="example-rg",
    name="ctxhub-redis-dev",
    parameters=RedisCreateParameters(
        location="eastus",
        sku=Sku(
            name="Standard",
            family="C",
            capacity=1,
        ),
        redis_version="6.0",
        minimum_tls_version="1.2",
        enable_non_ssl_port=False,
        public_network_access="Enabled",
        tags={
            "env": "dev",
            "owner": "context-hub",
        },
    ),
)

cache = poller.result()
print(cache.id)
print(cache.provisioning_state)
```

### List and inspect caches

```python
for cache in client.redis.list_by_resource_group("example-rg"):
    print(cache.name, cache.location, cache.sku.name, cache.provisioning_state)

cache = client.redis.get(
    resource_group_name="example-rg",
    name="ctxhub-redis-dev",
)

print(cache.host_name)
print(cache.ssl_port)
print(cache.minimum_tls_version)
```

Use `list_by_subscription()` when you need a subscription-wide inventory instead of a single resource group.

### Update cache settings or tags

`begin_update()` takes `RedisUpdateParameters`. Keep updates narrow and explicit instead of resending the entire original create payload.

```python
from azure.mgmt.redis.models import RedisUpdateParameters

updated = client.redis.begin_update(
    resource_group_name="example-rg",
    name="ctxhub-redis-dev",
    parameters=RedisUpdateParameters(
        tags={
            "env": "prod",
            "owner": "platform",
        },
        minimum_tls_version="1.2",
        update_channel="Stable",
    ),
).result()

print(updated.tags)
print(updated.update_channel)
```

The package also exposes newer cache-security and placement fields in the `14.x` line, including `disable_access_key_authentication`, `redis_configuration.notify_keyspace_events`, and `zonal_allocation_policy`. Use them only after confirming the target region and cache tier support the behavior you want.

### List and regenerate access keys

Access keys are for client connectivity, not ARM authentication. Retrieve them only if the application actually needs shared-key auth.

```python
keys = client.redis.list_keys(
    resource_group_name="example-rg",
    name="ctxhub-redis-dev",
)

print(keys.primary_key)
print(keys.secondary_key)
```

To rotate a key:

```python
from azure.mgmt.redis.models import RedisRegenerateKeyParameters

rotated = client.redis.regenerate_key(
    resource_group_name="example-rg",
    name="ctxhub-redis-dev",
    parameters=RedisRegenerateKeyParameters(key_type="Secondary"),
)

print(rotated.secondary_key)
```

### Add a firewall rule

`FirewallRulesOperations.create_or_update()` expects a `RedisFirewallRule` with `start_ip` and `end_ip`.

```python
from azure.mgmt.redis.models import RedisFirewallRule

rule = client.firewall_rules.create_or_update(
    resource_group_name="example-rg",
    cache_name="ctxhub-redis-dev",
    rule_name="office-ip",
    parameters=RedisFirewallRule(
        start_ip="203.0.113.10",
        end_ip="203.0.113.10",
    ),
)

print(rule.name)
```

List the configured rules:

```python
for rule in client.firewall_rules.list(
    resource_group_name="example-rg",
    cache_name="ctxhub-redis-dev",
):
    print(rule.name, rule.start_ip, rule.end_ip)
```

### Export data to Azure Storage

The SDK exposes `begin_export_data()` with `ExportRDBParameters`. The current model includes `prefix`, `container`, `format`, `preferred_data_archive_auth_method`, and `storage_subscription_id`.

```python
from azure.mgmt.redis.models import ExportRDBParameters

client.redis.begin_export_data(
    resource_group_name="example-rg",
    name="ctxhub-redis-dev",
    parameters=ExportRDBParameters(
        prefix="nightly-2026-03-13",
        container="https://examplestorage.blob.core.windows.net/redis-backups?sv=...",
        format="RDB",
    ),
).result()
```

Microsoft's import and export guidance matters here:

- Import and export are supported only on Premium, Enterprise, and Enterprise Flash caches.
- Blob storage accounts do not support export.
- During export, the cache remains available.
- During import, existing data is overwritten and the cache is not accessible until the operation finishes.

### Flush or reboot a cache

`begin_flush_cache()` was added in the `14.3.0` line. Use it when you need to clear the cache contents intentionally:

```python
client.redis.begin_flush_cache(
    resource_group_name="example-rg",
    name="ctxhub-redis-dev",
).result()
```

Rebooting takes `RedisRebootParameters`. Reboot one node or both, depending on the maintenance task and tier topology:

```python
from azure.mgmt.redis.models import RedisRebootParameters

client.redis.begin_reboot(
    resource_group_name="example-rg",
    name="ctxhub-redis-dev",
    parameters=RedisRebootParameters(
        reboot_type="PrimaryNode",
        shard_id=0,
    ),
).result()
```

## Configuration Notes

- `RedisManagementClient` does not infer `subscription_id`; pass it explicitly.
- The current client reference shows the default ARM API version as `2024-11-01`. Overriding `api_version` is possible, but generated Azure management packages are usually safest when you stay on the package default.
- Current generated Azure management models are keyword-only. Do not copy older Track 1 or early Track 2 examples that pass positional constructor arguments.
- `DefaultAzureCredential` tries multiple auth sources. If auth succeeds or fails in a surprising way, inspect which credential source won instead of assuming Azure CLI was used.
- Authentication and authorization are separate. A valid token does not guarantee the principal can create caches, read keys, or update firewall rules.
- `public_network_access="Disabled"` only makes sense if private connectivity or another supported access path is already in place.

## Version-Sensitive Notes For `14.5.0`

- PyPI lists `14.5.0` as released on January 16, 2026.
- `14.5.0` adds `zonal_allocation_policy` support on `RedisCreateParameters`.
- `14.4.0` added `disable_access_key_authentication` and `redis_configuration.notify_keyspace_events`.
- `14.3.0` added `begin_flush_cache`, the `access_policy` and `access_policy_assignment` operation groups, `redis_configuration.aad_enabled`, and `update_channel` support on create and update models.
- If copied examples do not mention these fields or operation groups, they are probably pre-`14.3.0` examples.

## Common Pitfalls

- Installing only `azure-mgmt-redis` and forgetting `azure-identity`
- Using this package for Redis data traffic instead of Azure ARM management
- Omitting `AZURE_SUBSCRIPTION_ID`
- Forgetting that `begin_create()`, `begin_update()`, `begin_delete()`, `begin_reboot()`, `begin_export_data()`, and `begin_flush_cache()` are long-running operations
- Copying old Azure examples that still use positional model constructors
- Disabling public network access or access-key authentication before the replacement access path is ready
- Assuming Azure Cache for Redis is the safe default for net-new projects despite the retirement timeline

## Official Sources Used

- https://pypi.org/project/azure-mgmt-redis/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-redis/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-redis/azure.mgmt.redis.redismanagementclient?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-redis/azure.mgmt.redis.operations.redisoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-redis/azure.mgmt.redis.operations.firewallrulesoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-redis/azure.mgmt.redis.models.rediscreateparameters?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-redis/azure.mgmt.redis.models.redisupdateparameters?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-redis/azure.mgmt.redis.models.redisregeneratekeyparameters?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-redis/azure.mgmt.redis.models.redisrebootparameters?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-redis/azure.mgmt.redis.models.redisfirewallrule?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-redis/azure.mgmt.redis.models.exportrdbparameters?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-redis/azure.mgmt.redis.models.rediscommonpropertiesredisconfiguration?view=azure-python
- https://learn.microsoft.com/en-us/azure/azure-cache-for-redis/cache-admin
- https://learn.microsoft.com/en-us/azure/azure-cache-for-redis/cache-how-to-import-export-data
- https://learn.microsoft.com/en-us/azure/azure-cache-for-redis/cache-retirement-faq
