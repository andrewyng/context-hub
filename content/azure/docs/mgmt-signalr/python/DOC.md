---
name: mgmt-signalr
description: "Azure SignalR Service management SDK for Python for provisioning resources, reading keys, managing replicas, and configuring custom certificates and domains"
metadata:
  languages: "python"
  versions: "1.2.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,signalr,management,arm,real-time,python"
---

# Azure SignalR Service Management SDK for Python

## Golden Rule

Use `azure-mgmt-signalr` for Azure Resource Manager control-plane work only: creating or updating Azure SignalR resources, listing keys, scaling SKUs, managing replicas, and configuring custom certificates or domains. Do not use this package to negotiate client connections or publish messages to hubs. Those are data-plane tasks and use different Azure SignalR APIs.

## Install

`azure-mgmt-signalr` depends on Azure AD or managed-identity credentials from `azure-identity`.

```bash
python -m pip install "azure-mgmt-signalr==1.2.0" azure-identity
```

Common alternatives:

```bash
uv add "azure-mgmt-signalr==1.2.0" azure-identity
poetry add "azure-mgmt-signalr==1.2.0" azure-identity
```

PyPI lists `azure-mgmt-signalr 1.2.0` as the current stable release and requires Python 3.7+.

## Authentication And Setup

Required environment:

```bash
export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
```

For service-principal auth, also set:

```bash
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"
```

For local development, `DefaultAzureCredential()` is usually the right default. It can pick up Azure CLI sign-in, environment variables, workload identity, or managed identity. For local scripts where you want to force Azure CLI auth, use `AzureCliCredential()`.

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.signalr import SignalRManagementClient

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]
credential = DefaultAzureCredential()

client = SignalRManagementClient(
    credential=credential,
    subscription_id=subscription_id,
)
```

CLI-driven local scripts can be explicit:

```python
import os

from azure.identity import AzureCliCredential
from azure.mgmt.signalr import SignalRManagementClient

client = SignalRManagementClient(
    credential=AzureCliCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)
```

The official client docs show a default `api_version` of `2023-08-01-preview`. Do not override that unless you have a specific reason and have verified the matching REST surface yourself.

## Core Client Surface

The current client exposes these high-value operation groups:

- `client.signal_r`: create, update, delete, list, list keys, list SKUs, restart, check name availability
- `client.signal_rreplicas`: create, update, list, restart, delete replicas
- `client.signal_rcustom_certificates`: create, list, get, delete Key Vault-backed certificates
- `client.signal_rcustom_domains`: create, list, get, delete custom domains
- `client.signal_rprivate_endpoint_connections`, `client.signal_rprivate_link_resources`, `client.signal_rshared_private_link_resources`: private networking workflows
- `client.usages`: subscription and regional usage information

Most write operations are long-running operations. Call `.result()` before depending on the returned resource state.

## Common Workflows

### Create Or Update A SignalR Resource

This example creates a Standard tier SignalR resource in serverless mode. If your application servers establish server connections to Azure SignalR, change the `ServiceMode` feature to `"Default"` instead.

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.signalr import SignalRManagementClient
from azure.mgmt.signalr.models import (
    ResourceSku,
    ServerlessSettings,
    SignalRFeature,
    SignalRResource,
)

client = SignalRManagementClient(
    credential=DefaultAzureCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)

poller = client.signal_r.begin_create_or_update(
    resource_group_name="example-rg",
    resource_name="example-signalr",
    parameters=SignalRResource(
        location="westus2",
        sku=ResourceSku(
            name="Standard_S1",
            tier="Standard",
            capacity=1,
        ),
        features=[
            SignalRFeature(flag="ServiceMode", value="Serverless"),
            SignalRFeature(flag="EnableConnectivityLogs", value="True"),
            SignalRFeature(flag="EnableMessagingLogs", value="False"),
            SignalRFeature(flag="EnableLiveTrace", value="False"),
        ],
        serverless=ServerlessSettings(connection_timeout_in_seconds=30),
        public_network_access="Enabled",
        disable_local_auth=False,
        disable_aad_auth=False,
        tags={"env": "dev", "owner": "context-hub"},
    ),
)

resource = poller.result()
print(resource.id)
print(resource.host_name)
```

Important details:

- `location` is required.
- `SignalRFeature(flag="ServiceMode", value=...)` controls whether the service runs in `Default`, `Serverless`, or `Classic` mode.
- For new apps, Microsoft recommends `Default` or `Serverless`, not `Classic`.
- Valid stable SKU names include `Free_F1`, `Standard_S1`, `Premium_P1`, and `Premium_P2`.

### List Resources And Inspect Available SKUs

```python
for resource in client.signal_r.list_by_resource_group("example-rg"):
    print(resource.name, resource.location, resource.sku.name)

resource = client.signal_r.get("example-rg", "example-signalr")
print(resource.host_name)
print(resource.public_port, resource.server_port)

sku_list = client.signal_r.list_skus("example-rg", "example-signalr")
for sku in sku_list.value:
    print(sku.name, sku.capacity)
```

The ARM template reference for the same API family documents these capacity rules:

- `Free_F1`: only `1`
- `Standard_S1` and `Premium_P1`: `1-10`, then `20-100`
- `Premium_P2`: `100-1000` in increments of `100`

### Read And Rotate Access Keys

Use management-plane key operations when you need the current connection strings or need to rotate a primary or secondary key.

```python
from azure.mgmt.signalr.models import RegenerateKeyParameters

keys = client.signal_r.list_keys("example-rg", "example-signalr")
print(keys.primary_connection_string)
print(keys.secondary_connection_string)

rotated = client.signal_r.begin_regenerate_key(
    resource_group_name="example-rg",
    resource_name="example-signalr",
    parameters=RegenerateKeyParameters(key_type="Primary"),
).result()

print(rotated.primary_connection_string)
```

Azure rotates only one key at a time. Update your applications to the other connection string before regenerating the active key.

### Add A Replica

Use replica operations when you need additional regional endpoints or want to manage replica-specific routing state.

```python
from azure.mgmt.signalr.models import Replica, ResourceSku

replica = client.signal_rreplicas.begin_create_or_update(
    resource_group_name="example-rg",
    resource_name="example-signalr",
    replica_name="eastus2",
    parameters=Replica(
        location="eastus2",
        sku=ResourceSku(
            name="Premium_P1",
            tier="Premium",
            capacity=1,
        ),
        region_endpoint_enabled="Enabled",
    ),
).result()

print(replica.id)

for item in client.signal_rreplicas.list("example-rg", "example-signalr"):
    print(item.name, item.location)
```

Replica resources have their own `region_endpoint_enabled` and `resource_stopped` properties. The ARM template reference notes that disabling the regional endpoint is replica-specific.

### Configure A Custom Certificate And Custom Domain

Custom domains are a Premium tier feature. The official custom-domain guide also requires:

- a managed identity on the Azure SignalR resource
- Key Vault access for that identity
- a certificate stored in Key Vault
- a `CNAME` from your custom host name to the default `*.service.signalr.net` host

```python
from azure.mgmt.signalr.models import CustomCertificate, CustomDomain, ResourceReference

certificate = client.signal_rcustom_certificates.begin_create_or_update(
    resource_group_name="example-rg",
    resource_name="example-signalr",
    certificate_name="tls-cert",
    parameters=CustomCertificate(
        key_vault_base_uri="https://contoso.vault.azure.net",
        key_vault_secret_name="signalr-cert",
        key_vault_secret_version="",
    ),
).result()

domain = client.signal_rcustom_domains.begin_create_or_update(
    resource_group_name="example-rg",
    resource_name="example-signalr",
    name="prod-domain",
    parameters=CustomDomain(
        domain_name="realtime.contoso.com",
        custom_certificate=ResourceReference(id=certificate.id),
    ),
).result()

print(domain.domain_name)
```

If you do not pin `key_vault_secret_version`, Azure SignalR periodically checks Key Vault for a newer certificate version and applies it automatically.

## Common Pitfalls

- Do not confuse management plane and data plane. `azure-mgmt-signalr` provisions the service; it does not broadcast messages or run negotiate endpoints.
- `AZURE_SUBSCRIPTION_ID` is required. The credential does not infer the subscription automatically.
- Long-running operations return pollers. Always call `.result()` before reading fields such as `id`, `host_name`, or child-resource IDs.
- Avoid `Classic` mode for new applications. Microsoft documents it as backward compatibility mode.
- The client constructor accepts `api_version`, but the official docs warn that overriding it can lead to unsupported behavior.
- Scaling across pricing tiers can cause downtime when the public service IP changes. Microsoft documents downtime for `Free` to `Standard` or `Premium` transitions; `Standard_S1` to `Premium_P1` and `Premium_P1` to `Premium_P2` are documented as no-downtime transitions.
- Custom domains are not a Standard-tier feature. Upgrade to Premium before automating certificate or domain resources.

## Version-Sensitive Notes

- `1.2.0` adds the `serverless` parameter on `SignalRResource`. The serverless example in this guide assumes `1.2.0`.
- `1.1.0` added `SignalRCustomCertificatesOperations`, `SignalRCustomDomainsOperations`, and `live_trace_configuration`.
- `1.0.0` added `disable_local_auth`, `disable_aad_auth`, `public_network_access`, and `list_skus`.

## Official Sources Used

- https://pypi.org/project/azure-mgmt-signalr/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-signalr/azure.mgmt.signalr.signalrmanagementclient?view=azure-python-preview
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-signalr/azure.mgmt.signalr.operations.signalroperations?view=azure-python-preview
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-signalr/azure.mgmt.signalr.operations.signalrreplicasoperations?view=azure-python-preview
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-signalr/azure.mgmt.signalr.operations.signalrcustomcertificatesoperations?view=azure-python-preview
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-signalr/azure.mgmt.signalr.operations.signalrcustomdomainsoperations?view=azure-python-preview
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-signalr/azure.mgmt.signalr.models.signalrresource?view=azure-python-preview
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-signalr/azure.mgmt.signalr.models.signalrfeature?view=azure-python-preview
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-signalr/azure.mgmt.signalr.models.serverlesssettings?view=azure-python-preview
- https://learn.microsoft.com/en-us/azure/developer/python/sdk/authentication-overview
- https://learn.microsoft.com/en-us/azure/developer/python/sdk/authentication/credential-chains
- https://learn.microsoft.com/en-us/azure/developer/python/sdk/authentication/local-development-service-principal
- https://learn.microsoft.com/en-us/azure/azure-signalr/signalr-resource-faq
- https://learn.microsoft.com/en-us/azure/azure-signalr/howto-custom-domain
- https://learn.microsoft.com/en-us/azure/azure-signalr/signalr-howto-scale-signalr
- https://learn.microsoft.com/en-us/azure/azure-signalr/signalr-howto-key-rotation
- https://learn.microsoft.com/en-us/azure/azure-signalr/concept-connection-string
- https://learn.microsoft.com/en-us/azure/azure-signalr/signalr-reference-data-plane-rest-api
- https://learn.microsoft.com/en-us/azure/templates/microsoft.signalrservice/2023-08-01-preview/signalr
- https://learn.microsoft.com/en-us/azure/templates/microsoft.signalrservice/2024-03-01/signalr/replicas
- https://learn.microsoft.com/en-us/azure/templates/microsoft.signalrservice/signalr/customcertificates
- https://learn.microsoft.com/en-us/azure/templates/microsoft.signalrservice/signalr/customdomains
- https://learn.microsoft.com/en-us/rest/api/signalr/signalr/regenerate-key
