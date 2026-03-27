---
name: mgmt-eventgrid
description: "Azure Event Grid management-plane SDK for Python for topics, domains, namespaces, system topics, and event subscriptions"
metadata:
  languages: "python"
  versions: "10.4.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,event-grid,management,arm,topics,event-subscriptions,namespaces"
---

# Azure Event Grid Management SDK for Python

## Golden Rule

Use `azure-mgmt-eventgrid` for Azure Resource Manager control-plane work: creating and configuring Event Grid topics, domains, namespaces, system topics, and event subscriptions. Do not use it to publish or receive event payloads. For actual event publishing or consuming, use `azure-eventgrid`.

For `10.4.0`, pair it with `azure-identity`, pass the subscription ID explicitly, and expect create/update/delete calls to use `begin_*` long-running operations that need `.result()`.

## Install

Install the management SDK with an Azure credential package:

```bash
python -m pip install "azure-mgmt-eventgrid==10.4.0" azure-identity
```

If the same app also publishes or consumes events, install the data-plane SDK too:

```bash
python -m pip install azure-eventgrid
```

The PyPI package page for `10.4.0` states that this package supports Python `3.8+`.

If this is the first Event Grid resource in the subscription, register the provider first:

```bash
az provider register --namespace Microsoft.EventGrid
```

Common environment variables:

```bash
export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"

# Only if you are authenticating with a service principal directly
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"
```

## Authentication And Client Setup

`EventGridManagementClient` requires a `TokenCredential` and the subscription ID:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.eventgrid import EventGridManagementClient

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]
credential = DefaultAzureCredential()

with EventGridManagementClient(
    credential=credential,
    subscription_id=subscription_id,
) as client:
    for topic in client.topics.list_by_subscription():
        print(topic.name)
```

For local scripts after `az login`, `AzureCliCredential` is often simpler:

```python
import os

from azure.identity import AzureCliCredential
from azure.mgmt.eventgrid import EventGridManagementClient

client = EventGridManagementClient(
    credential=AzureCliCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)
```

Important setup facts from the official client docs:

- `subscription_id` is required.
- The default ARM endpoint is `https://management.azure.com`.
- The generated client defaults to API version `2025-02-15`, and the docs warn that overriding it may produce unsupported behavior.

## Create A Custom Topic

Create a topic when you want your own application or service to publish events into Event Grid.

```python
from azure.mgmt.eventgrid.models import Topic

resource_group_name = "example-rg"
topic_name = "orders-topic-1234"

topic = client.topics.begin_create_or_update(
    resource_group_name=resource_group_name,
    topic_name=topic_name,
    topic_info=Topic(
        location="westus2",
        input_schema="CloudEventSchemaV1_0",
        minimum_tls_version_allowed="1.2",
        public_network_access="Enabled",
        disable_local_auth=False,
        tags={
            "env": "dev",
            "owner": "context-hub",
        },
    ),
).result()

print(topic.id)
print(topic.endpoint)
```

What matters in this payload:

- `location` is required.
- `input_schema` controls what publishers must send: `EventGridSchema`, `CustomEventSchema`, or `CloudEventSchemaV1_0`.
- `minimum_tls_version_allowed` can restrict publishers to TLS `1.2`.
- `disable_local_auth=True` turns off key-based publishing for the topic; keep it `False` only if you intentionally need topic keys.

The product docs also call out these naming rules for custom topics: the name must be unique, 3 to 50 characters long, and use only letters, digits, and `-`.

## Get The Topic Endpoint And Publishing Keys

The created `Topic` object includes `topic.endpoint`. If local auth is enabled, you can also retrieve the shared access keys:

```python
keys = client.topics.list_shared_access_keys(
    resource_group_name=resource_group_name,
    topic_name=topic_name,
)

print(topic.endpoint)
print(keys.key1)
print(keys.key2)
```

Use those values with `azure-eventgrid` when publishing:

```python
from azure.core.credentials import AzureKeyCredential
from azure.core.messaging import CloudEvent
from azure.eventgrid import EventGridPublisherClient

publisher = EventGridPublisherClient(
    endpoint=topic.endpoint,
    credential=AzureKeyCredential(keys.key1),
)

publisher.send(
    CloudEvent(
        type="com.example.order.created",
        source="/orders/42",
        data={"orderId": 42, "status": "created"},
    )
)
```

If you set `disable_local_auth=True`, switch to `DefaultAzureCredential` or another Entra-backed `TokenCredential` when you create the publisher client instead of trying to use a topic key.

## Create An Event Subscription On The Topic

Use `topic_event_subscriptions` for subscriptions that hang directly off a custom Event Grid topic:

```python
import os

from azure.mgmt.eventgrid.models import (
    EventSubscription,
    EventSubscriptionFilter,
    WebHookEventSubscriptionDestination,
)

event_subscription = client.topic_event_subscriptions.begin_create_or_update(
    resource_group_name=resource_group_name,
    topic_name=topic_name,
    event_subscription_name="orderswebhooksub",
    event_subscription_info=EventSubscription(
        destination=WebHookEventSubscriptionDestination(
            endpoint_url=os.environ["WEBHOOK_ENDPOINT"],
            minimum_tls_version_allowed="1.2",
        ),
        filter=EventSubscriptionFilter(
            included_event_types=["com.example.order.created"],
            subject_begins_with="/orders/",
        ),
        labels=["orders", "webhook"],
        event_delivery_schema="CloudEventSchemaV1_0",
    ),
).result()

print(event_subscription.id)
print(event_subscription.provisioning_state)
```

Useful subscription settings from the model docs:

- `destination` chooses where Event Grid delivers events.
- `filter` supports `subject_begins_with`, `subject_ends_with`, `included_event_types`, and `advanced_filters`.
- `event_delivery_schema` can be `EventGridSchema`, `CustomInputSchema`, or `CloudEventSchemaV1_0`.
- `labels` gives you lightweight tags for later filtering and inspection.

If you need the resolved destination URL after creation, call:

```python
full_url = client.topic_event_subscriptions.get_full_url(
    resource_group_name=resource_group_name,
    topic_name=topic_name,
    event_subscription_name="orderswebhooksub",
)

print(full_url.endpoint_url)
```

## Create An Event Subscription On Another Azure Resource

The generic `event_subscriptions` operation works on scopes such as a subscription, resource group, top-level Azure resource, or Event Grid topic ID.

This example subscribes to a storage account resource and delivers blob-created events to a queue:

```python
from azure.mgmt.eventgrid.models import (
    EventSubscription,
    EventSubscriptionFilter,
    StorageQueueEventSubscriptionDestination,
)

storage_account_id = (
    "/subscriptions/00000000-0000-0000-0000-000000000000/"
    "resourceGroups/example-rg/providers/Microsoft.Storage/"
    "storageAccounts/examplestorageacct"
)

queue_destination = StorageQueueEventSubscriptionDestination(
    resource_id=storage_account_id,
    queue_name="incoming-events",
)

subscription = client.event_subscriptions.begin_create_or_update(
    scope=storage_account_id,
    event_subscription_name="blobcreatedqueue",
    event_subscription_info=EventSubscription(
        destination=queue_destination,
        filter=EventSubscriptionFilter(
            included_event_types=["Microsoft.Storage.BlobCreated"],
        ),
    ),
).result()

print(subscription.id)
```

If you already know the resource components instead of the full ARM ID, you can inspect existing subscriptions with:

```python
for sub in client.event_subscriptions.list_by_resource(
    resource_group_name="example-rg",
    provider_namespace="Microsoft.Storage",
    resource_type_name="storageAccounts",
    resource_name="examplestorageacct",
):
    print(sub.name)
```

## Namespaces, System Topics, And Other Resource Types

`EventGridManagementClient` also exposes operation groups for:

- `namespaces`
- `namespace_topics`
- `namespace_topic_event_subscriptions`
- `system_topics`
- `system_topic_event_subscriptions`
- `domains`
- `domain_topics`

The usage pattern is the same as the topic examples above: create the resource model, call the appropriate `begin_create_or_update(...)`, and wait on `.result()`. Keep the resource type straight:

- Event Grid Basic custom topics and domains are publish endpoints.
- Namespaces are a separate Event Grid resource family with dedicated `namespaces` and `namespace_topics` operation groups.
- System topics represent events emitted by Azure services such as Storage or Event Hubs.

## Common Pitfalls

- `azure-mgmt-eventgrid` is not the publishing SDK. Provision resources here, then publish or consume with `azure-eventgrid`.
- Topic schema choices matter. If the topic input schema is `CloudEventSchemaV1_0`, your publishers must send CloudEvents, not Event Grid events.
- `disable_local_auth=True` disables local key-based authentication for the topic.
- Webhook subscriptions must pass Event Grid endpoint validation before delivery starts.
- When you use Event Grid event schema delivery, webhook validation uses `SubscriptionValidationEvent`.
- When you use CloudEvents schema delivery, webhook validation follows the CloudEvents abuse-protection `OPTIONS` flow instead.
- Event subscription names must be 3 to 64 characters and use alphanumeric characters only.
- Most write operations are long-running ARM operations. If you skip `.result()`, later code often races the resource creation.
- `10.4.0` uses keyword-only model constructors. Rewrite older positional-argument samples before copying them.

## Version Notes For `10.4.0`

The PyPI release history for `10.4.0` calls out three high-value changes:

- models are generated with keyword-only signatures
- long-running operations return `msrest.polling.LROPoller`
- the client can be used as a context manager to keep the underlying HTTP session open

If you are updating older code, treat positional model constructors and old poller assumptions as migration work, not copy-paste examples.

## Official Sources Used

- https://pypi.org/project/azure-mgmt-eventgrid/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-eventgrid/azure.mgmt.eventgrid.eventgridmanagementclient?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-eventgrid/azure.mgmt.eventgrid.operations.topicsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-eventgrid/azure.mgmt.eventgrid.models.topic?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-eventgrid/azure.mgmt.eventgrid.operations.topiceventsubscriptionsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-eventgrid/azure.mgmt.eventgrid.operations.eventsubscriptionsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-eventgrid/azure.mgmt.eventgrid.models.eventsubscription?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-eventgrid/azure.mgmt.eventgrid.models.eventsubscriptionfilter?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-eventgrid/azure.mgmt.eventgrid.models.webhookeventsubscriptiondestination?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-eventgrid/azure.mgmt.eventgrid.models.storagequeueeventsubscriptiondestination?view=azure-python
- https://learn.microsoft.com/en-us/azure/event-grid/create-custom-topic
- https://learn.microsoft.com/en-us/azure/event-grid/custom-event-quickstart
- https://learn.microsoft.com/en-us/azure/event-grid/end-point-validation-event-grid-events-schema
- https://learn.microsoft.com/en-us/azure/event-grid/end-point-validation-cloud-events-schema
- https://learn.microsoft.com/en-us/python/api/overview/azure/eventgrid-readme?view=azure-python
