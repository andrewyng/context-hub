---
name: mgmt-notificationhubs
description: "Azure Notification Hubs management-plane SDK for Python for namespaces, notification hubs, access policies, and PNS credentials"
metadata:
  languages: "python"
  versions: "8.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,notification-hubs,arm,management,push-notifications,python"
---

# Azure Notification Hubs Management SDK for Python

## Golden Rule

Use `azure-mgmt-notificationhubs` for Azure Resource Manager control-plane work only: create namespaces, create notification hubs, manage SAS authorization rules, and configure or inspect platform notification service credentials.

Do not use this package to send push notifications to devices or manage installations and registrations. The current Microsoft Learn Python send tutorial uses direct REST calls and explicitly notes that there is no officially supported Azure Notification Hubs Python SDK for that data-plane workflow.

## Install

Install the management SDK and an Azure credential package together:

```bash
python -m pip install "azure-mgmt-notificationhubs==8.0.0" azure-identity
```

Common alternatives:

```bash
uv add "azure-mgmt-notificationhubs==8.0.0" azure-identity
poetry add "azure-mgmt-notificationhubs==8.0.0" azure-identity
```

Minimum environment:

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

Use `DefaultAzureCredential` for reusable code, CI, managed identity, or workload identity. Use `AzureCliCredential` for local scripts after `az login`.

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.notificationhubs import NotificationHubsManagementClient

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]
credential = DefaultAzureCredential()

client = NotificationHubsManagementClient(
    credential=credential,
    subscription_id=subscription_id,
)
```

Local CLI-driven scripts can use Azure CLI credentials directly:

```python
import os

from azure.identity import AzureCliCredential
from azure.mgmt.notificationhubs import NotificationHubsManagementClient

client = NotificationHubsManagementClient(
    credential=AzureCliCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)
```

Do not copy older `azure.common.credentials.UserPassCredentials` examples from stale overview pages. The current client constructor requires an `azure-core` `TokenCredential`, which in practice means using `azure-identity`.

## Core Workflows

### Check namespace name availability

Namespace names must be unique. Check first instead of learning from a failed create call.

```python
from azure.mgmt.notificationhubs.models import CheckAvailabilityParameters

namespace_name = "ctxhub-ns-demo"

availability = client.namespaces.check_availability(
    CheckAvailabilityParameters(name=namespace_name)
)

if not availability.is_availiable:
    raise RuntimeError("Namespace name is not available")
```

The response field is spelled `is_availiable` in the generated SDK. Use the exact attribute name.

### Create a namespace

```python
from azure.mgmt.notificationhubs.models import (
    NamespaceCreateOrUpdateParameters,
    Sku,
)

namespace = client.namespaces.create_or_update(
    resource_group_name="example-rg",
    namespace_name=namespace_name,
    parameters=NamespaceCreateOrUpdateParameters(
        location="eastus",
        namespace_type="NotificationHub",
        sku=Sku(name="Free"),
    ),
)

print(namespace.id)
```

Use `Sku(name="Standard")` when you need the Standard tier. Keep the namespace `location` aligned with the region where you intend to run the Notification Hubs resource.

### Create a notification hub

```python
from azure.mgmt.notificationhubs.models import NotificationHubCreateOrUpdateParameters

hub_name = "orders-mobile"

hub = client.notification_hubs.create_or_update(
    resource_group_name="example-rg",
    namespace_name=namespace_name,
    notification_hub_name=hub_name,
    parameters=NotificationHubCreateOrUpdateParameters(
        location="eastus",
    ),
)

print(hub.id)
```

This creates the hub resource only. Platform credentials for APNS, WNS, ADM, Baidu, or Google are configured separately.

### Create a hub-level SAS rule and read its keys

Use hub-level authorization rules when an application should be scoped to one notification hub instead of the whole namespace.

```python
from azure.mgmt.notificationhubs.models import (
    SharedAccessAuthorizationRuleCreateOrUpdateParameters,
    SharedAccessAuthorizationRuleProperties,
)

rule_name = "send-listen"

client.notification_hubs.create_or_update_authorization_rule(
    resource_group_name="example-rg",
    namespace_name=namespace_name,
    notification_hub_name=hub_name,
    authorization_rule_name=rule_name,
    parameters=SharedAccessAuthorizationRuleCreateOrUpdateParameters(
        properties=SharedAccessAuthorizationRuleProperties(
            rights=["Listen", "Send"],
        )
    ),
)

keys = client.notification_hubs.list_keys(
    resource_group_name="example-rg",
    namespace_name=namespace_name,
    notification_hub_name=hub_name,
    authorization_rule_name=rule_name,
)

print(keys.primary_connection_string)
```

Do not ship a rule with `Manage` rights to untrusted clients. For device-facing or app-facing code, keep rights as narrow as possible.

### Configure WNS credentials on an existing hub

Patch only the fields you intend to change. The stable `8.0.0` client exposes `patch` on `notification_hubs`.

```python
import os

from azure.mgmt.notificationhubs.models import (
    NotificationHubPatchParameters,
    WnsCredential,
)

client.notification_hubs.patch(
    resource_group_name="example-rg",
    namespace_name=namespace_name,
    notification_hub_name=hub_name,
    parameters=NotificationHubPatchParameters(
        wns_credential=WnsCredential(
            package_sid=os.environ["WNS_PACKAGE_SID"],
            secret_key=os.environ["WNS_SECRET_KEY"],
            windows_live_endpoint="https://login.live.com/accesstoken.srf",
        ),
    ),
)
```

To inspect the currently configured platform credentials:

```python
pns = client.notification_hubs.get_pns_credentials(
    resource_group_name="example-rg",
    namespace_name=namespace_name,
    notification_hub_name=hub_name,
)

print(pns.wns_credential is not None)
print(pns.apns_credential is not None)
print(pns.gcm_credential is not None)
```

The same patch model also exposes `adm_credential`, `apns_credential`, `baidu_credential`, and `gcm_credential`.

## Configuration Notes

- `NotificationHubsManagementClient` requires `subscription_id`; it is not inferred from the credential.
- The stable `8.0.0` client exposes two main operation groups: `namespaces` and `notification_hubs`.
- Namespace and hub authorization rules are different resources. Use the matching `list_keys` call for the scope you created.
- Management-plane success still depends on Azure RBAC. A valid token is not enough if the principal cannot create or update `Microsoft.NotificationHubs/*` resources.
- Store connection strings, PNS secrets, and certificate material outside source control. Treat them as secrets.

## Version-Sensitive Notes For `8.0.0`

- The `7.0.0b1` generation change introduced the current shape used by `8.0.0`: `azure-identity` credentials, the `credential=` client argument, keyword-only model constructors, and imports from `azure.mgmt.notificationhubs.models`.
- PyPI release notes for `8.0.0` call out a breaking change in `NamespacesOperations.list_keys`, which now returns `ResourceListKeys`. If older code expects the pre-`8.0.0` return shape, update it before upgrading.
- The stable `8.0.0` model index exposes `gcm_credential` and documents it against the legacy FCM send endpoint surface. Do not assume the package has a separate dedicated FCM v1 credential model in this version without checking newer docs first.

## Common Pitfalls

- Treating `azure-mgmt-notificationhubs` as a send SDK instead of a provisioning SDK
- Reusing stale `azure.common.credentials` examples instead of `azure-identity`
- Forgetting `AZURE_SUBSCRIPTION_ID`
- Missing the generated attribute typo `is_availiable` when checking namespace availability
- Creating wide `Manage` SAS rules when `Listen` or `Send` would be enough
- Assuming Google push setup in this package matches newer FCM v1 terminology

## Official Sources Used

- https://learn.microsoft.com/en-us/python/api/azure-mgmt-notificationhubs/?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-notificationhubs/azure.mgmt.notificationhubs.notificationhubsmanagementclient?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-notificationhubs/azure.mgmt.notificationhubs.operations.namespacesoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-notificationhubs/azure.mgmt.notificationhubs.operations.notificationhubsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-notificationhubs/azure.mgmt.notificationhubs.models?view=azure-python
- https://azuresdkdocs.z19.web.core.windows.net/python/azure-mgmt-notificationhubs/8.0.0/azure.mgmt.notificationhubs.models.html
- https://pypi.org/project/azure-mgmt-notificationhubs/8.0.0/
- https://learn.microsoft.com/en-us/azure/notification-hubs/notification-hubs-python-push-notification-tutorial
- https://learn.microsoft.com/en-us/azure/notification-hubs/manage-notification-hubs-namespace
