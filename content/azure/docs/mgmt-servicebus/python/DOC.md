---
name: mgmt-servicebus
description: "Azure Service Bus management-plane SDK for Python for namespaces, queues, topics, subscriptions, authorization rules, and network settings"
metadata:
  languages: "python"
  versions: "9.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,service-bus,arm,management,namespaces,queues,topics,subscriptions,python"
---

# Azure Service Bus Management SDK for Python

## Golden Rule

Use `azure-mgmt-servicebus` for Azure Resource Manager control-plane work such as creating namespaces, queues, topics, subscriptions, authorization rules, and namespace network settings. Do not use it to send or receive messages. For data-plane messaging code, use `azure-servicebus`.

For package version `9.0.0`, the main client is `ServiceBusManagementClient`. The client defaults to the stable `2021-11-01` ARM API unless you override `api_version`.

## Install

Install the management package and an Azure credential package together:

```bash
python -m pip install "azure-mgmt-servicebus==9.0.0" azure-identity
```

Common alternatives:

```bash
uv add "azure-mgmt-servicebus==9.0.0" azure-identity
poetry add "azure-mgmt-servicebus==9.0.0" azure-identity
```

Environment used by the snippets below:

```bash
export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
export AZURE_RESOURCE_GROUP="example-rg"
export SERVICEBUS_NAMESPACE_NAME="ctxhub-sb-dev-01"
export SERVICEBUS_QUEUE_NAME="orders"
export SERVICEBUS_TOPIC_NAME="events"
export SERVICEBUS_SUBSCRIPTION_NAME="billing"
```

If you authenticate with a service principal directly, also set:

```bash
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"
```

## Authentication And Client Setup

Use one of these credential patterns:

- `DefaultAzureCredential()` for reusable code, CI, managed identity, or workload identity
- `AzureCliCredential()` for local scripts after `az login`

Basic setup:

```python
import os
from datetime import timedelta

from azure.identity import DefaultAzureCredential
from azure.mgmt.servicebus import ServiceBusManagementClient

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]
credential = DefaultAzureCredential()

client = ServiceBusManagementClient(
    credential=credential,
    subscription_id=subscription_id,
)

models = client.models()
```

Local CLI-driven scripts can use Azure CLI credentials directly:

```python
import os

from azure.identity import AzureCliCredential
from azure.mgmt.servicebus import ServiceBusManagementClient

client = ServiceBusManagementClient(
    credential=AzureCliCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)
```

`client.models()` is useful when you want constructors that match the selected API version instead of importing a versioned model module directly.

Authentication success is not enough by itself. The principal also needs Azure RBAC permissions to manage `Microsoft.ServiceBus/*` resources at the subscription, resource-group, or namespace scope you target.

## Core Workflows

### Check namespace name availability

Namespace names are globally unique. Check first instead of learning from a failed create call:

```python
import os

resource_group_name = os.environ["AZURE_RESOURCE_GROUP"]
namespace_name = os.environ["SERVICEBUS_NAMESPACE_NAME"]

availability = client.namespaces.check_name_availability(
    models.CheckNameAvailability(name=namespace_name)
)

if not availability.name_available:
    raise RuntimeError(availability.message or availability.reason)
```

### Create a namespace

Namespace creation is a long-running ARM operation, so call `.result()` on the poller before using the namespace:

```python
namespace = client.namespaces.begin_create_or_update(
    resource_group_name=os.environ["AZURE_RESOURCE_GROUP"],
    namespace_name=os.environ["SERVICEBUS_NAMESPACE_NAME"],
    parameters=models.SBNamespace(
        location="eastus",
        sku=models.SBSku(name="Standard", tier="Standard"),
        disable_local_auth=False,
        tags={
            "env": "dev",
            "owner": "context-hub",
        },
    ),
).result()

print(namespace.id)
print(namespace.service_bus_endpoint)
```

Use `Standard` or `Premium` if you plan to create topics and subscriptions. Microsoft Learn's namespace quickstart notes that the `Basic` tier does not support topics.

### Lock down namespace network access

Network rules are managed on the namespace after it exists:

```python
network_rules = client.namespaces.create_or_update_network_rule_set(
    resource_group_name=os.environ["AZURE_RESOURCE_GROUP"],
    namespace_name=os.environ["SERVICEBUS_NAMESPACE_NAME"],
    parameters=models.NetworkRuleSet(
        default_action="Deny",
        public_network_access="Enabled",
        trusted_service_access_enabled=False,
        ip_rules=[
            models.NWRuleSetIpRules(
                ip_mask="203.0.113.10",
                action="Allow",
            )
        ],
    ),
)

print(network_rules.default_action)
```

If you need virtual network rules, add `virtual_network_rules` entries with the target subnet resource IDs.

### Create a queue

Queue settings are regular ARM resources. The generated `SBQueue` model accepts `timedelta` values for duration fields:

```python
queue = client.queues.create_or_update(
    resource_group_name=os.environ["AZURE_RESOURCE_GROUP"],
    namespace_name=os.environ["SERVICEBUS_NAMESPACE_NAME"],
    queue_name=os.environ["SERVICEBUS_QUEUE_NAME"],
    parameters=models.SBQueue(
        lock_duration=timedelta(minutes=1),
        default_message_time_to_live=timedelta(days=7),
        max_size_in_megabytes=1024,
        max_delivery_count=10,
        dead_lettering_on_message_expiration=True,
        enable_batched_operations=True,
    ),
)

print(queue.id)
```

Other commonly used queue fields in this SDK version include `requires_session`, `requires_duplicate_detection`, `forward_dead_lettered_messages_to`, and `enable_partitioning`.

### Create a queue authorization rule and fetch keys

Use shared access keys only when your application really needs SAS-based authentication:

```python
client.queues.create_or_update_authorization_rule(
    resource_group_name=os.environ["AZURE_RESOURCE_GROUP"],
    namespace_name=os.environ["SERVICEBUS_NAMESPACE_NAME"],
    queue_name=os.environ["SERVICEBUS_QUEUE_NAME"],
    authorization_rule_name="send-listen",
    parameters=models.SBAuthorizationRule(
        rights=["Listen", "Send"],
    ),
)

keys = client.queues.list_keys(
    resource_group_name=os.environ["AZURE_RESOURCE_GROUP"],
    namespace_name=os.environ["SERVICEBUS_NAMESPACE_NAME"],
    queue_name=os.environ["SERVICEBUS_QUEUE_NAME"],
    authorization_rule_name="send-listen",
)

print(keys.primary_connection_string)
```

If the namespace was created with `disable_local_auth=True`, do not build new integrations around SAS rules or connection strings.

### Create a topic, subscription, and filter rule

Topics and subscriptions are available only in `Standard` and `Premium` namespaces:

```python
topic = client.topics.create_or_update(
    resource_group_name=os.environ["AZURE_RESOURCE_GROUP"],
    namespace_name=os.environ["SERVICEBUS_NAMESPACE_NAME"],
    topic_name=os.environ["SERVICEBUS_TOPIC_NAME"],
    parameters=models.SBTopic(),
)

subscription = client.subscriptions.create_or_update(
    resource_group_name=os.environ["AZURE_RESOURCE_GROUP"],
    namespace_name=os.environ["SERVICEBUS_NAMESPACE_NAME"],
    topic_name=topic.name,
    subscription_name=os.environ["SERVICEBUS_SUBSCRIPTION_NAME"],
    parameters=models.SBSubscription(),
)

rule = client.rules.create_or_update(
    resource_group_name=os.environ["AZURE_RESOURCE_GROUP"],
    namespace_name=os.environ["SERVICEBUS_NAMESPACE_NAME"],
    topic_name=topic.name,
    subscription_name=subscription.name,
    rule_name="invoice-created",
    parameters=models.Rule(
        filter_type="CorrelationFilter",
        correlation_filter=models.CorrelationFilter(
            label="invoice.created",
        ),
    ),
)

print(rule.name)
```

`Rule` also supports `sql_filter` when you need SQL-style subscription filters instead of a correlation filter.

### List and inspect existing resources

```python
for namespace in client.namespaces.list_by_resource_group(os.environ["AZURE_RESOURCE_GROUP"]):
    print(namespace.name, namespace.location, namespace.sku.name)

for queue in client.queues.list_by_namespace(
    os.environ["AZURE_RESOURCE_GROUP"],
    os.environ["SERVICEBUS_NAMESPACE_NAME"],
):
    print("queue:", queue.name)

for topic in client.topics.list_by_namespace(
    os.environ["AZURE_RESOURCE_GROUP"],
    os.environ["SERVICEBUS_NAMESPACE_NAME"],
):
    print("topic:", topic.name)

for subscription in client.subscriptions.list_by_topic(
    os.environ["AZURE_RESOURCE_GROUP"],
    os.environ["SERVICEBUS_NAMESPACE_NAME"],
    os.environ["SERVICEBUS_TOPIC_NAME"],
):
    print("subscription:", subscription.name)

for rule in client.rules.list_by_subscriptions(
    os.environ["AZURE_RESOURCE_GROUP"],
    os.environ["SERVICEBUS_NAMESPACE_NAME"],
    os.environ["SERVICEBUS_TOPIC_NAME"],
    os.environ["SERVICEBUS_SUBSCRIPTION_NAME"],
):
    print("rule:", rule.name)
```

## Configuration Notes

- `ServiceBusManagementClient` requires `subscription_id`; it is not inferred from the credential.
- The client constructor accepts `api_version` and `profile`. The Learn docs recommend pinning these only when you intentionally need a specific API surface or cloud profile.
- `client.models()` follows the selected API version, which is safer than hard-coding imports from `azure.mgmt.servicebus.v2021_11_01.models` if you later switch versions.
- Service Bus namespace names must be 6 to 50 characters, use only letters, numbers, and hyphens, start with a letter, end with a letter or number, and cannot end with `-sb` or `-mgmt`.
- Namespace creation is ARM-based and asynchronous. Wait for `.result()` before creating child resources such as queues, topics, or authorization rules.

## Version-Sensitive Notes

### `9.0.0`

PyPI lists these package-level changes for `9.0.0`:

- Python `3.9` is now the minimum supported version.
- Unused subfolders for non-latest API versions were removed to reduce package size.
- `EventHubsOperations`, `PremiumMessagingRegionsOperations`, and `RegionsOperations` were removed from the generated client surface.

If your code imports older versioned modules or depends on removed operation groups, pin an earlier package version before reusing `9.0.0` examples.

### API version behavior

The `ServiceBusManagementClient` docs show the stable default API version as `2021-11-01` and also document preview operation groups under `2022-10-01-preview`. Use the default stable version unless you intentionally need preview fields and have verified them against the correct versioned docs.

## Common Pitfalls

- Using `azure-mgmt-servicebus` for send and receive code instead of `azure-servicebus`
- Forgetting `AZURE_SUBSCRIPTION_ID`
- Calling `begin_create_or_update` or `begin_delete` and then using the resource before `.result()`
- Creating a `Basic` namespace and then expecting topics or subscriptions to work
- Generating SAS keys and connection strings even though the namespace uses `disable_local_auth=True`
- Copying imports from removed API-version folders or removed operation groups after upgrading to `9.0.0`
- Ignoring namespace naming rules until ARM rejects the deployment

## Official Sources Used

- https://pypi.org/project/azure-mgmt-servicebus/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-servicebus/?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-servicebus/azure.mgmt.servicebus.servicebusmanagementclient?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-servicebus/azure.mgmt.servicebus.v2021_11_01.operations.namespacesoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-servicebus/azure.mgmt.servicebus.v2021_11_01.operations.queuesoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-servicebus/azure.mgmt.servicebus.v2021_11_01.operations.topicsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-servicebus/azure.mgmt.servicebus.v2021_11_01.operations.subscriptionsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-servicebus/azure.mgmt.servicebus.v2021_11_01.operations.rulesoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-servicebus/azure.mgmt.servicebus.v2021_11_01.models.sbqueue?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-servicebus/azure.mgmt.servicebus.v2021_11_01.models.networkruleset?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-servicebus/azure.mgmt.servicebus.v2021_11_01.models.rule?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-servicebus/azure.mgmt.servicebus.v2021_11_01.models.correlationfilter?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-identity/azure.identity.defaultazurecredential?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-identity/azure.identity.azureclicredential?view=azure-python
- https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-quickstart-portal
