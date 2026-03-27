---
name: mgmt-iothub
description: "Azure IoT Hub management-plane SDK for Python for hub provisioning, ARM updates, consumer groups, and certificate management"
metadata:
  languages: "python"
  versions: "4.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,iot-hub,arm,management,python,certificates"
---

# Azure IoT Hub Management SDK for Python

## Golden Rule

Use `azure-mgmt-iothub` for Azure Resource Manager control-plane work on IoT Hub resources: create hubs, read hub metadata, update tags, manage Event Hub-compatible consumer groups, manage certificates, and inspect quotas or stats.

Do not use it for device telemetry, device twins, or device-side connectivity. This client talks to the ARM management endpoint, not the IoT Hub device/service data plane.

## Install

Pin the package version your project expects and install `azure-identity` with it:

```bash
python -m pip install "azure-mgmt-iothub==4.0.0" azure-identity
```

Common alternatives:

```bash
uv add "azure-mgmt-iothub==4.0.0" azure-identity
poetry add "azure-mgmt-iothub==4.0.0" azure-identity
```

PyPI currently lists Python `>=3.8` for `4.0.0`.

## Authentication And Setup

Required environment:

```bash
export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
```

If you use a service principal directly, also set:

```bash
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"
```

For local development, Azure CLI is usually simpler:

```bash
az login
az account set --subscription "$AZURE_SUBSCRIPTION_ID"
```

Create the client with `DefaultAzureCredential`:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.iothub import IotHubClient

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]
credential = DefaultAzureCredential()

client = IotHubClient(
    credential=credential,
    subscription_id=subscription_id,
)
```

If you want a local-script-only credential:

```python
import os

from azure.identity import AzureCliCredential
from azure.mgmt.iothub import IotHubClient

client = IotHubClient(
    credential=AzureCliCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)
```

`IotHubClient` defaults to API version `2023-06-30`. The client also exposes `api_version` and `profile` parameters because the package contains multiple API versions for different Azure clouds. For production, Microsoft recommends sticking to a particular API version and/or profile instead of relying on an implicit default forever.

## Core Workflows

### Check name availability before create

IoT Hub names must be available at the subscription/resource-provider level. Check first instead of waiting for a failed create call:

```python
hub_name = "ctxhub-iothub-demo"

availability = client.iot_hub_resource.check_name_availability(
    {"name": hub_name}
)

if not availability.name_available:
    raise RuntimeError(f"{hub_name} is unavailable: {availability.reason} {availability.message}")
```

### Create a hub

Creating or deleting a hub is a long-running ARM operation, so wait on the poller:

```python
resource_group_name = "example-rg"
hub_name = "ctxhub-iothub-demo"

poller = client.iot_hub_resource.begin_create_or_update(
    resource_group_name=resource_group_name,
    resource_name=hub_name,
    iot_hub_description={
        "location": "westus2",
        "sku": {
            "name": "S1",
            "capacity": 1,
        },
        "tags": {
            "env": "dev",
            "owner": "context-hub",
        },
    },
)

hub = poller.result()
print(hub.id)
print(hub.name)
print(hub.sku.name)
```

### List hubs and read one hub

```python
for hub in client.iot_hub_resource.list_by_resource_group("example-rg"):
    print(hub.name, hub.location)

hub = client.iot_hub_resource.get(
    resource_group_name="example-rg",
    resource_name="ctxhub-iothub-demo",
)

print(hub.name)
print(hub.location)
print(hub.etag)
```

### Update tags

Use `begin_update()` for tag-only changes:

```python
updated = client.iot_hub_resource.begin_update(
    resource_group_name="example-rg",
    resource_name="ctxhub-iothub-demo",
    iot_hub_tags={
        "tags": {
            "env": "prod",
            "owner": "platform",
        }
    },
).result()

print(updated.tags)
```

For non-tag changes, use `begin_create_or_update()` instead. Microsoft explicitly warns that when you update an existing hub with `create_or_update`, missing JSON properties can fall back to defaults, so build the request from the full current description and send `if_match=hub.etag`.

### Manage Event Hub-compatible consumer groups

The built-in Event Hub-compatible endpoint is usually named `events`:

```python
consumer_group = client.iot_hub_resource.create_event_hub_consumer_group(
    resource_group_name="example-rg",
    resource_name="ctxhub-iothub-demo",
    event_hub_endpoint_name="events",
    name="analytics",
    consumer_group_body={
        "properties": {
            "name": "analytics",
        }
    },
)

print(consumer_group.name)

for group in client.iot_hub_resource.list_event_hub_consumer_groups(
    resource_group_name="example-rg",
    resource_name="ctxhub-iothub-demo",
    event_hub_endpoint_name="events",
):
    print(group.name)
```

Delete the consumer group when you no longer need it:

```python
client.iot_hub_resource.delete_event_hub_consumer_group(
    resource_group_name="example-rg",
    resource_name="ctxhub-iothub-demo",
    event_hub_endpoint_name="events",
    name="analytics",
)
```

### Upload and verify an X.509 CA certificate

Certificate workflows are ETag-sensitive. Upload the certificate, generate a verification code, create the proof-of-possession leaf certificate outside this SDK, then call `verify()` with the latest ETag.

```python
from pathlib import Path

certificate_name = "device-ca"

certificate = client.certificates.create_or_update(
    resource_group_name="example-rg",
    resource_name="ctxhub-iothub-demo",
    certificate_name=certificate_name,
    certificate_description={
        "properties": {
            "certificate": Path("ca-cert.pem").read_text(),
        }
    },
)

client.certificates.generate_verification_code(
    resource_group_name="example-rg",
    resource_name="ctxhub-iothub-demo",
    certificate_name=certificate_name,
    if_match=certificate.etag,
)

fresh_certificate = client.certificates.get(
    resource_group_name="example-rg",
    resource_name="ctxhub-iothub-demo",
    certificate_name=certificate_name,
)

verified = client.certificates.verify(
    resource_group_name="example-rg",
    resource_name="ctxhub-iothub-demo",
    certificate_name=certificate_name,
    if_match=fresh_certificate.etag,
    certificate_verification_body={
        "certificate": Path("verification-cert.pem").read_text(),
    },
)

print(verified.etag)
```

## Other Useful Operations

The client also exposes these high-value management calls:

- `client.resource_provider_common.get_subscription_quota()` to inspect free and paid IoT Hub quota usage in the subscription
- `client.iot_hub_resource.get_stats(...)` for hub-level statistics
- `client.iot_hub_resource.get_quota_metrics(...)` for quota metrics on a specific hub
- `client.iot_hub_resource.get_valid_skus(...)` to see which SKUs are valid for a hub
- `client.iot_hub_resource.list_keys(...)` and `get_keys_for_key_name(...)` for shared access policy metadata

## Common Pitfalls

- `azure-mgmt-iothub` is a management-plane SDK. If you need device registry operations, telemetry send/receive, twins, or direct methods, this is the wrong client.
- `AZURE_SUBSCRIPTION_ID` is required. A credential can authenticate successfully while client construction still fails without a subscription ID.
- `begin_create_or_update()`, `begin_update()`, and `begin_delete()` return ARM pollers. Call `.result()` when the next step depends on completion.
- `begin_update()` is for tags only. For other hub changes, use `begin_create_or_update()`.
- When updating an existing hub with `begin_create_or_update()`, do not send a partial body unless you are sure of every omitted field. The official docs warn omitted properties may revert to defaults.
- Certificate update and verify flows require the current certificate ETag. Re-read the certificate if you are unsure which ETag is current.
- Consumer groups are scoped under the Event Hub-compatible endpoint name, not just the hub name.

## Version-Sensitive Notes For `4.0.0`

- PyPI lists `4.0.0` as the current stable release, published on April 9, 2025.
- The `4.0.0` release notes say the package removed subfolders for some unused API versions to reduce package size. If your application depends on a specific non-latest API version, pin the previous package release instead of assuming `4.0.0` still ships that folder.
- The current client docs show `DEFAULT_API_VERSION = "2023-06-30"`.
- The package docs still describe multi-API support through `api_version` and `profile`, which matters for Azure Stack and sovereign cloud scenarios.

## Official Sources

- https://pypi.org/project/azure-mgmt-iothub/
- https://learn.microsoft.com/en-us/python/api/overview/azure/iot-hub?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-iothub/azure.mgmt.iothub.iothubclient?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-iothub/azure.mgmt.iothub.operations.iothubresourceoperations?view=azure-python-preview
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-iothub/azure.mgmt.iothub.operations.certificatesoperations?view=azure-python-preview
- https://learn.microsoft.com/en-us/rest/api/iothub/iot-hub-resource/check-name-availability?view=rest-iothub-2023-06-30
- https://learn.microsoft.com/en-us/rest/api/iothub/iot-hub-resource/create-or-update?view=rest-iothub-2023-06-30
- https://learn.microsoft.com/en-us/rest/api/iothub/iot-hub-resource/update?view=rest-iothub-2023-06-30
- https://learn.microsoft.com/en-us/rest/api/iothub/iot-hub-resource/create-event-hub-consumer-group?view=rest-iothub-2023-06-30
- https://learn.microsoft.com/en-us/rest/api/iothub/certificates/create-or-update?view=rest-iothub-2023-06-30
- https://learn.microsoft.com/en-us/rest/api/iothub/certificates/generate-verification-code?view=rest-iothub-2023-06-30
- https://learn.microsoft.com/en-us/rest/api/iothub/certificates/verify?view=rest-iothub-2023-06-30
