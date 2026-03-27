---
name: mgmt-trafficmanager
description: "Azure Traffic Manager management SDK for Python for Traffic Manager profiles, endpoints, health monitoring, and DNS routing configuration"
metadata:
  languages: "python"
  versions: "1.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,traffic-manager,arm,dns,management,load-balancing,python"
---

# Azure Traffic Manager Management SDK for Python

## Golden Rule

Use `azure-mgmt-trafficmanager` for Azure Resource Manager management of Traffic Manager profiles and endpoints, not for serving DNS traffic directly. Install `azure-identity` with it, authenticate with a `TokenCredential`, pass `AZURE_SUBSCRIPTION_ID` explicitly, and remember that profile creation is global ARM configuration: the profile `location` is `"global"` and the Traffic Manager DNS name is built from `dns_config.relative_name`.

This is a management-plane SDK. Your application does not send requests through this client at runtime to route traffic. It creates and updates Traffic Manager resources that Azure DNS answers against.

## Install

Pin the package version your project expects and install Azure credentials alongside it:

```bash
python -m pip install "azure-mgmt-trafficmanager==1.1.0" azure-identity
```

Common alternatives:

```bash
uv add "azure-mgmt-trafficmanager==1.1.0" azure-identity
poetry add "azure-mgmt-trafficmanager==1.1.0" azure-identity
```

PyPI classifiers for `1.1.0` list Python `3.7+`.

## Authentication And Setup

Use one of these credential patterns:

- `DefaultAzureCredential()` for code that should work locally, in CI, and on Azure
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
from azure.mgmt.trafficmanager import TrafficManagerManagementClient

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]
credential = DefaultAzureCredential()

client = TrafficManagerManagementClient(
    credential=credential,
    subscription_id=subscription_id,
)
```

Local CLI-driven setup:

```python
import os

from azure.identity import AzureCliCredential
from azure.mgmt.trafficmanager import TrafficManagerManagementClient

client = TrafficManagerManagementClient(
    credential=AzureCliCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)
```

The current client exposes these main operation groups:

- `profiles`
- `endpoints`
- `geographic_hierarchies`
- `heat_map`
- `traffic_manager_user_metrics_keys`

## Core Usage

### Check whether a Traffic Manager DNS name is available

Traffic Manager profile DNS labels are globally unique under `trafficmanager.net`. Check the relative name before creating the profile:

```python
result = client.profiles.check_traffic_manager_name_availability_v2(
    parameters={"name": "contoso-global-app"},
)

print(result.name_available)
print(result.message)
```

The older `check_traffic_manager_relative_dns_name_availability(...)` method is still present, but `1.1.0` also exposes `check_traffic_manager_name_availability_v2(...)`.

### Create a Traffic Manager profile

This example creates a weighted profile with a DNS label, HTTP health checks, and an initial tag set:

```python
profile = client.profiles.create_or_update(
    resource_group_name="rg-networking",
    profile_name="contoso-tm",
    parameters={
        "location": "global",
        "profile_status": "Enabled",
        "traffic_routing_method": "Weighted",
        "dns_config": {
            "relative_name": "contoso-global-app",
            "ttl": 30,
        },
        "monitor_config": {
            "protocol": "HTTPS",
            "port": 443,
            "path": "/healthz",
            "interval_in_seconds": 30,
            "tolerated_number_of_failures": 3,
            "timeout_in_seconds": 10,
        },
        "tags": {
            "env": "dev",
            "owner": "platform",
        },
    },
)

print(profile.id)
print(profile.dns_config.fqdn)
```

The routing method controls which endpoint properties matter later:

- `Priority`: set `priority` on each endpoint
- `Weighted`: set `weight`
- `Performance`: set `endpoint_location`
- `Geographic`: set `geo_mapping`
- `MultiValue`: set `endpoint_status`, `always_serve`, and record-type-compatible endpoint targets carefully
- `Subnet`: set `subnets`

Traffic Manager monitoring allows only these interval / timeout / tolerated-failure combinations:

- `30` seconds interval: timeout `5`, `10`, or `20`; tolerated failures `2` or `3`
- `10` seconds interval: timeout `5`, `10`, or `20`; tolerated failures `3`

### List or get profiles

```python
for profile in client.profiles.list_by_resource_group("rg-networking"):
    print(profile.name, profile.traffic_routing_method, profile.monitor_status)

profile = client.profiles.get(
    resource_group_name="rg-networking",
    profile_name="contoso-tm",
)

print(profile.profile_status)
print(profile.dns_config.fqdn)
```

Profile listing is paged. Iterate over it instead of assuming one in-memory list.

### Add an external endpoint

Use external endpoints for targets outside Azure or for public hostnames and IPs that are not modeled as Azure resources:

```python
endpoint = client.endpoints.create_or_update(
    resource_group_name="rg-networking",
    profile_name="contoso-tm",
    endpoint_type="ExternalEndpoints",
    endpoint_name="origin-eastus",
    parameters={
        "target": "origin-eastus.contoso.com",
        "endpoint_status": "Enabled",
        "weight": 100,
        "custom_headers": [
            {
                "name": "Host",
                "value": "origin-eastus.contoso.com",
            }
        ],
    },
)

print(endpoint.id)
```

If the endpoint target is an IP address, the profile routing method must be `MultiValue`.

### Add an Azure endpoint by resource ID

Use Azure endpoints when the target is an Azure public IP address, App Service app, or public Load Balancer:

```python
endpoint = client.endpoints.create_or_update(
    resource_group_name="rg-networking",
    profile_name="contoso-tm",
    endpoint_type="AzureEndpoints",
    endpoint_name="app-westus2",
    parameters={
        "target_resource_id": (
            "/subscriptions/00000000-0000-0000-0000-000000000000"
            "/resourceGroups/rg-app"
            "/providers/Microsoft.Network/publicIPAddresses/app-westus2-pip"
        ),
        "endpoint_status": "Enabled",
        "weight": 100,
    },
)

print(endpoint.target_resource_id)
```

### Add a nested endpoint

Use nested endpoints when one Traffic Manager profile should route to another Traffic Manager profile:

```python
endpoint = client.endpoints.create_or_update(
    resource_group_name="rg-networking",
    profile_name="contoso-parent",
    endpoint_type="NestedEndpoints",
    endpoint_name="regional-profile-west",
    parameters={
        "target_resource_id": (
            "/subscriptions/00000000-0000-0000-0000-000000000000"
            "/resourceGroups/rg-networking"
            "/providers/Microsoft.Network/trafficManagerProfiles/contoso-west"
        ),
        "endpoint_status": "Enabled",
        "min_child_endpoints": 1,
        "min_child_endpoints_ipv4": 1,
    },
)

print(endpoint.min_child_endpoints)
```

Nested profiles are the only endpoint type that can target another Traffic Manager profile.

### Update endpoint routing fields

Use `update(...)` when you only need to patch a few routing-related properties instead of replacing the full endpoint:

```python
updated = client.endpoints.update(
    resource_group_name="rg-networking",
    profile_name="contoso-tm",
    endpoint_type="ExternalEndpoints",
    endpoint_name="origin-eastus",
    parameters={
        "weight": 200,
        "endpoint_status": "Enabled",
    },
)

print(updated.weight)
```

Typical endpoint fields by routing method:

- `priority` for failover-style routing
- `weight` for weighted routing
- `endpoint_location` for performance routing
- `geo_mapping` for geographic routing
- `subnets` for subnet routing

To discover valid geographic codes before setting `geo_mapping`, read the default geographic hierarchy:

```python
hierarchy = client.geographic_hierarchies.get_default()
print(hierarchy.code)
```

### Delete an endpoint or profile

```python
client.endpoints.delete(
    resource_group_name="rg-networking",
    profile_name="contoso-tm",
    endpoint_type="ExternalEndpoints",
    endpoint_name="origin-eastus",
)

client.profiles.delete(
    resource_group_name="rg-networking",
    profile_name="contoso-tm",
)
```

## Monitoring Notes

Traffic Manager monitoring settings live on the profile, not on individual endpoints. The monitor checks the protocol, port, and path you set in `monitor_config` against each enabled endpoint.

Useful monitoring details from the service docs:

- `custom_headers` can be sent with health checks, for example to force a specific `Host` header.
- `expected_status_code_ranges` can be used when a healthy response is not just `200`.
- Azure endpoints can use fast failure detection only for a public IP address or an Application Gateway endpoint.
- Monitoring is HTTP, HTTPS, or TCP depending on the profile configuration.

If you use custom domains or host-based routing at the origin, set the monitor path and any required `Host` header deliberately. The default path or default host header often points at the wrong backend app.

## Common Pitfalls

- Forgetting `azure-identity`; this package does not create credentials for you.
- Omitting `AZURE_SUBSCRIPTION_ID`; the management client does not infer it from the credential.
- Using this package for data-plane traffic handling instead of ARM profile management.
- Forgetting that the profile `location` is `"global"`.
- Treating `dns_config.relative_name` as a full hostname. Traffic Manager appends `.trafficmanager.net`.
- Using the wrong `endpoint_type`. `ExternalEndpoints`, `AzureEndpoints`, and `NestedEndpoints` are not interchangeable.
- Copying endpoint fields across routing methods. `priority`, `weight`, `endpoint_location`, `geo_mapping`, and `subnets` only matter for the matching routing mode.
- Setting unsupported monitor timing combinations. Traffic Manager only allows specific interval / timeout / failure-threshold combinations.
- Pointing an external endpoint at an IP address when the profile is not using `MultiValue` routing.
- Forgetting that disabling an endpoint or profile changes DNS answers, but clients still cache answers until the DNS TTL expires.

## Version-Sensitive Notes

`azure-mgmt-trafficmanager 1.1.0` is the current PyPI release as of March 13, 2026. The PyPI release history for `1.1.0` calls out these additions:

- support for `profiles.check_traffic_manager_name_availability_v2`
- support for `Endpoint.always_serve`

If you copy older examples, verify that they still match the `1.1.0` client surface and the current Traffic Manager routing methods. Older snippets often omit newer endpoint fields or use older name-availability calls.

## Official Sources Used

- https://pypi.org/project/azure-mgmt-trafficmanager/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-trafficmanager/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-trafficmanager/azure.mgmt.trafficmanager.trafficmanagermanagementclient?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-trafficmanager/azure.mgmt.trafficmanager.operations.profileoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-trafficmanager/azure.mgmt.trafficmanager.operations.endpointoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-trafficmanager/azure.mgmt.trafficmanager.models.profile?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-trafficmanager/azure.mgmt.trafficmanager.models.endpoint?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-trafficmanager/azure.mgmt.trafficmanager.models.monitorconfig?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-trafficmanager/azure.mgmt.trafficmanager.models.checktrafficmanagerrelativednsnameavailabilityparameters?view=azure-python
- https://learn.microsoft.com/en-us/azure/traffic-manager/traffic-manager-routing-methods
- https://learn.microsoft.com/en-us/azure/traffic-manager/traffic-manager-endpoint-types
- https://learn.microsoft.com/en-us/azure/traffic-manager/traffic-manager-monitoring
- https://learn.microsoft.com/en-us/azure/templates/microsoft.network/trafficmanagerprofiles
