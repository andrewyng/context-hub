---
name: mgmt-cdn
description: "Azure CDN and Azure Front Door Standard/Premium management SDK for Python"
metadata:
  languages: "python"
  versions: "13.1.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,cdn,front-door,arm,management,networking"
---

# Azure CDN Management SDK for Python

## Golden Rule

Use `azure-mgmt-cdn` for Azure management-plane work on `Microsoft.Cdn` resources: classic CDN profiles/endpoints and Azure Front Door Standard/Premium profiles, endpoints, origins, routes, custom domains, secrets, and security policies. Authenticate with `azure-identity`, pass `AZURE_SUBSCRIPTION_ID` explicitly, and treat most writes as long-running `begin_*` operations that need `.result()`.

## Install

PyPI lists `azure-mgmt-cdn 13.1.1` as supporting Python `3.8+`.

```bash
python -m pip install "azure-mgmt-cdn==13.1.1" azure-identity
```

Common alternatives:

```bash
uv add "azure-mgmt-cdn==13.1.1" azure-identity
poetry add "azure-mgmt-cdn==13.1.1" azure-identity
```

## Authentication And Setup

For most code, use one of these credential patterns:

- `DefaultAzureCredential()` for reusable code that should work locally, in CI, and on Azure
- `AzureCliCredential()` for local scripts after `az login`

Required environment:

```bash
export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
```

If you authenticate with a service principal directly, also set:

```bash
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"
```

Basic client setup:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.cdn import CdnManagementClient

credential = DefaultAzureCredential()

with CdnManagementClient(
    credential=credential,
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
) as client:
    for profile in client.profiles.list():
        print(profile.name, profile.sku.name if profile.sku else None)
```

For local CLI-driven scripts:

```python
import os

from azure.identity import AzureCliCredential
from azure.mgmt.cdn import CdnManagementClient

client = CdnManagementClient(
    credential=AzureCliCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)
```

`CdnManagementClient` defaults to ARM `base_url="https://management.azure.com"` and API version `2024-02-01`. The reference docs warn that overriding `api_version` may result in unsupported behavior.

## Pick The Right Operation Group

The same client covers both classic CDN and Azure Front Door Standard/Premium:

- Classic CDN: `profiles`, `endpoints`, `origins`, `origin_groups`, `custom_domains`
- Azure Front Door Standard/Premium: `profiles` for the top-level profile, then `afd_endpoints`, `afd_origin_groups`, `afd_origins`, `routes`, `afd_custom_domains`, `rule_sets`, `rules`, `security_policies`, `secrets`, `log_analytics`
- Migration and AFD profile helpers: `afd_profiles`

The profile SKU decides what you are creating:

- Classic CDN example SKUs: `Standard_Microsoft`, `Standard_Verizon`, `Premium_Verizon`, `Standard_Akamai`
- Azure Front Door SKUs: `Standard_AzureFrontDoor`, `Premium_AzureFrontDoor`

## Create A Classic CDN Profile And Endpoint

This is the basic create flow for a classic CDN profile plus one endpoint:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.cdn import CdnManagementClient

resource_group = "example-rg"
profile_name = "example-classic-cdn"
endpoint_name = "examplecdnendpoint123"  # must be globally unique
location = "<resource-location>"
origin_host = "www.contoso.com"

with CdnManagementClient(DefaultAzureCredential(), os.environ["AZURE_SUBSCRIPTION_ID"]) as client:
    profile = client.profiles.begin_create(
        resource_group_name=resource_group,
        profile_name=profile_name,
        profile={
            "location": location,
            "sku": {"name": "Standard_Microsoft"},
            "tags": {"env": "dev"},
        },
    ).result()

    endpoint = client.endpoints.begin_create(
        resource_group_name=resource_group,
        profile_name=profile.name,
        endpoint_name=endpoint_name,
        endpoint={
            "location": location,
            "is_http_allowed": False,
            "is_https_allowed": True,
            "origins": [
                {
                    "name": "app-origin",
                    "host_name": origin_host,
                    "https_port": 443,
                    "origin_host_header": origin_host,
                }
            ],
        },
    ).result()

    print(endpoint.host_name)
```

Practical notes:

- `profile_name` is unique within the resource group.
- `endpoint_name` is globally unique.
- Older Learn overview pages still show `.create(...)`; for `13.1.1`, the current operation docs use `begin_create(...)`.

## Create An Azure Front Door Standard Profile, Endpoint, Origin Group, Origin, And Route

Front Door Standard/Premium uses the same top-level `profiles` operation group, but endpoint and routing resources live under the AFD-specific groups:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.cdn import CdnManagementClient

resource_group = "example-rg"
profile_name = "example-afd-profile"
endpoint_name = "exampleafdendpoint123"  # must be globally unique
origin_group_name = "app-origin-group"
origin_name = "app-origin"
route_name = "default-route"
location = "<resource-location>"
origin_host = "www.contoso.com"

with CdnManagementClient(DefaultAzureCredential(), os.environ["AZURE_SUBSCRIPTION_ID"]) as client:
    profile = client.profiles.begin_create(
        resource_group_name=resource_group,
        profile_name=profile_name,
        profile={
            "location": location,
            "sku": {"name": "Standard_AzureFrontDoor"},
        },
    ).result()

    endpoint = client.afd_endpoints.begin_create(
        resource_group_name=resource_group,
        profile_name=profile.name,
        endpoint_name=endpoint_name,
        endpoint={
            "location": location,
            "enabled_state": "Enabled",
        },
    ).result()

    origin_group = client.afd_origin_groups.begin_create(
        resource_group_name=resource_group,
        profile_name=profile.name,
        origin_group_name=origin_group_name,
        origin_group={
            "health_probe_settings": {
                "probe_path": "/healthz",
                "probe_request_type": "HEAD",
                "probe_protocol": "Https",
                "probe_interval_in_seconds": 120,
            },
            "load_balancing_settings": {
                "sample_size": 4,
                "successful_samples_required": 3,
                "additional_latency_in_milliseconds": 50,
            },
            "session_affinity_state": "Disabled",
        },
    ).result()

    origin = client.afd_origins.begin_create(
        resource_group_name=resource_group,
        profile_name=profile.name,
        origin_group_name=origin_group.name,
        origin_name=origin_name,
        origin={
            "host_name": origin_host,
            "https_port": 443,
            "origin_host_header": origin_host,
            "priority": 1,
            "weight": 1000,
            "enabled_state": "Enabled",
            "enforce_certificate_name_check": True,
        },
    ).result()

    route = client.routes.begin_create(
        resource_group_name=resource_group,
        profile_name=profile.name,
        endpoint_name=endpoint.name,
        route_name=route_name,
        route={
            "origin_group": {"id": origin_group.id},
            "supported_protocols": ["Http", "Https"],
            "patterns_to_match": ["/*"],
            "forwarding_protocol": "MatchRequest",
            "link_to_default_domain": "Enabled",
            "https_redirect": "Enabled",
            "enabled_state": "Enabled",
        },
    ).result()

    print(endpoint.host_name)
    print(origin.id)
    print(route.id)
```

Important details from the model docs:

- `AFDEndpoint` requires `location`
- `AFDOrigin.host_name` is the origin address
- `AFDOrigin.origin_host_header` should usually match the hostname your origin expects
- `Route.origin_group` is a resource reference to the origin group

## Purge Cached AFD Content

Use `afd_endpoints.begin_purge_content(...)` when you need to invalidate cached content:

```python
client.afd_endpoints.begin_purge_content(
    resource_group_name="example-rg",
    profile_name="example-afd-profile",
    endpoint_name="exampleafdendpoint123",
    contents={
        "content_paths": ["/images/*", "/css/app.css"],
        "domains": ["www.contoso.com"],
    },
).result()
```

For Front Door routes, caching is optional. The route model docs explicitly say to omit `cache_configuration` if you want caching disabled.

## Validate A Custom Domain Before Wiring DNS-Dependent Flows

Both classic CDN endpoints and AFD endpoints expose `validate_custom_domain(...)` helpers. The validation input is a host name:

```python
validation = client.afd_endpoints.validate_custom_domain(
    resource_group_name="example-rg",
    profile_name="example-afd-profile",
    endpoint_name="exampleafdendpoint123",
    custom_domain_properties={
        "host_name": "cdn.contoso.com",
    },
)
```

Use the same pattern with `client.endpoints.validate_custom_domain(...)` for classic CDN endpoints.

## Version-Sensitive Notes

### `13.1.1`

- PyPI release notes for `13.1.1` only call out a serialization bug fix for `azure.core.serialization.NULL`.

### `13.0.0`

This is the important line for copied examples:

- Long-running methods were renamed to `begin_*` and now return `azure.core.polling.LROPoller`
- Most exceptions are now `azure.core.exceptions.HttpResponseError`
- Async support is available in the `azure.mgmt.cdn.aio` namespace
- `profiles.begin_can_migrate(...)`, `profiles.begin_migrate(...)`, and `profiles.begin_migration_commit(...)` were added for classic CDN to AFD migration flows
- `afd_profiles.begin_upgrade(...)`, `afd_profiles.check_endpoint_name_availability(...)`, and `afd_profiles.validate_secret(...)` were added for AFD profile operations

## Common Pitfalls

- Installing `azure-mgmt-cdn` without also installing `azure-identity`
- Forgetting `AZURE_SUBSCRIPTION_ID`; the client does not infer it from the credential
- Mixing classic CDN operations like `endpoints` with AFD operations like `afd_endpoints` and `routes`
- Copying older `client.profiles.create(...)` or `client.endpoints.create(...)` examples into a `13.x` project
- Forgetting `.result()` on create, update, delete, purge, start, and stop flows
- Using `endpoints.begin_update(...)` or `afd_endpoints.begin_update(...)` to try to change origins or domains; the operation docs say those endpoint update calls are only for tags after creation
- Reusing an endpoint name that is not globally unique
- Reusing the same origin hostname where the origin docs require it to be unique within the endpoint or origin group
- Overriding `api_version` without a strong reason; the constructor docs warn this can lead to unsupported behavior

## Official Sources Used

- https://pypi.org/project/azure-mgmt-cdn/
- https://learn.microsoft.com/en-us/python/api/overview/azure/content-delivery-network?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-cdn/azure.mgmt.cdn.cdnmanagementclient?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-cdn/azure.mgmt.cdn.operations.profilesoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-cdn/azure.mgmt.cdn.operations.endpointsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-cdn/azure.mgmt.cdn.operations.afdendpointsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-cdn/azure.mgmt.cdn.operations.afdorigingroupsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-cdn/azure.mgmt.cdn.operations.afdoriginsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-cdn/azure.mgmt.cdn.operations.routesoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-cdn/azure.mgmt.cdn.models.profile?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-cdn/azure.mgmt.cdn.models.afdendpoint?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-cdn/azure.mgmt.cdn.models.afdorigingroup?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-cdn/azure.mgmt.cdn.models.afdorigin?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-cdn/azure.mgmt.cdn.models.route?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-cdn/azure.mgmt.cdn.models.validatecustomdomaininput?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-cdn/azure.mgmt.cdn.models.afdpurgeparameters?view=azure-python
