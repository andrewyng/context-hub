---
name: mgmt-frontdoor
description: "Azure Front Door management SDK for Python for Front Door resources, WAF policies, custom domain validation, and related ARM operations"
metadata:
  languages: "python"
  versions: "1.2.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,frontdoor,arm,waf,cdn,network,python"
---

# Azure Front Door Management SDK for Python

## Golden Rule

Use `azure-mgmt-frontdoor` for Azure Resource Manager management of Front Door resources through `FrontDoorManagementClient`. Pair it with `azure-identity`, pass an Azure subscription ID explicitly, and expect write operations such as `begin_create_or_update` and `begin_delete` to return long-running pollers that you should finish with `.result()`.

This package is a management-plane SDK. It creates and updates ARM resources such as Front Doors, frontend endpoints, custom-domain validation checks, and Front Door WAF policies. It is not the data-plane surface for sending traffic through Front Door.

## Install

Pin the package version your project expects and install Azure credentials alongside it:

```bash
python -m pip install "azure-mgmt-frontdoor==1.2.0" azure-identity
```

Common alternatives:

```bash
uv add "azure-mgmt-frontdoor==1.2.0" azure-identity
poetry add "azure-mgmt-frontdoor==1.2.0" azure-identity
```

## Authentication And Setup

For most code, start with `DefaultAzureCredential()`. For local scripts, `AzureCliCredential()` is also reasonable after `az login`.

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
from azure.mgmt.frontdoor import FrontDoorManagementClient

client = FrontDoorManagementClient(
    credential=DefaultAzureCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)
```

Local CLI-driven setup:

```python
import os

from azure.identity import AzureCliCredential
from azure.mgmt.frontdoor import FrontDoorManagementClient

client = FrontDoorManagementClient(
    credential=AzureCliCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)
```

## Core Operations

The main operation groups most projects need are:

- `front_doors`
- `frontend_endpoints`
- `policies`
- `managed_rule_sets`
- `front_door_name_availability`
- `front_door_name_availability_with_subscription`

### Check whether a Front Door name is globally available

Front Door names are globally unique. The REST docs define the request body as `name` plus `type`, and the Python SDK exposes that through `front_door_name_availability_with_subscription.check(...)`.

```python
result = client.front_door_name_availability_with_subscription.check(
    {
        "name": "my-front-door",
        "type": "Microsoft.Network/frontDoors",
    }
)

print(result.name_availability)
print(result.reason)
print(result.message)
```

### List Front Doors in a resource group

```python
for front_door in client.front_doors.list_by_resource_group("rg-edge"):
    print(front_door.name, front_door.resource_state, front_door.cname)
```

### Get one Front Door

```python
front_door = client.front_doors.get(
    resource_group_name="rg-edge",
    front_door_name="my-front-door",
)

print(front_door.id)
print(front_door.cname)
print(front_door.provisioning_state)
```

### Create or update a Front Door

This is the minimum practical shape for a Front Door with one frontend endpoint, one backend pool, one health probe, one load-balancing profile, and one routing rule.

```python
resource_group_name = "rg-edge"
front_door_name = "my-front-door"
location = "westus2"
backend_host = "origin.contoso.com"

front_door_id = (
    f"/subscriptions/{os.environ['AZURE_SUBSCRIPTION_ID']}"
    f"/resourceGroups/{resource_group_name}"
    f"/providers/Microsoft.Network/frontDoors/{front_door_name}"
)
frontend_endpoint_id = f"{front_door_id}/frontendEndpoints/default"
backend_pool_id = f"{front_door_id}/backendPools/app-backends"
health_probe_id = f"{front_door_id}/healthProbeSettings/probe-default"
load_balancing_id = f"{front_door_id}/loadBalancingSettings/lb-default"

front_door = client.front_doors.begin_create_or_update(
    resource_group_name=resource_group_name,
    front_door_name=front_door_name,
    front_door_parameters={
        "location": location,
        "properties": {
            "friendlyName": front_door_name,
            "enabledState": "Enabled",
            "loadBalancingSettings": [
                {
                    "name": "lb-default",
                    "properties": {
                        "sampleSize": 4,
                        "successfulSamplesRequired": 2,
                    },
                }
            ],
            "healthProbeSettings": [
                {
                    "name": "probe-default",
                    "properties": {
                        "path": "/",
                        "protocol": "Https",
                        "intervalInSeconds": 120,
                        "healthProbeMethod": "HEAD",
                        "enabledState": "Enabled",
                    },
                }
            ],
            "backendPools": [
                {
                    "name": "app-backends",
                    "properties": {
                        "backends": [
                            {
                                "address": backend_host,
                                "backendHostHeader": backend_host,
                                "httpPort": 80,
                                "httpsPort": 443,
                                "enabledState": "Enabled",
                                "priority": 1,
                                "weight": 100,
                            }
                        ],
                        "loadBalancingSettings": {"id": load_balancing_id},
                        "healthProbeSettings": {"id": health_probe_id},
                    },
                }
            ],
            "frontendEndpoints": [
                {
                    "name": "default",
                    "properties": {
                        "hostName": f"{front_door_name}.azurefd.net",
                    },
                }
            ],
            "routingRules": [
                {
                    "name": "route-all",
                    "properties": {
                        "frontendEndpoints": [{"id": frontend_endpoint_id}],
                        "acceptedProtocols": ["Http", "Https"],
                        "patternsToMatch": ["/*"],
                        "routeConfiguration": {
                            "@odata.type": "#Microsoft.Azure.FrontDoor.Models.FrontdoorForwardingConfiguration",
                            "forwardingProtocol": "MatchRequest",
                            "backendPool": {"id": backend_pool_id},
                        },
                        "enabledState": "Enabled",
                    },
                }
            ],
            "backendPoolsSettings": {
                "enforceCertificateNameCheck": "Enabled",
                "sendRecvTimeoutSeconds": 60,
            },
        },
    },
).result()

print(front_door.id)
print(front_door.cname)
```

### Validate custom-domain DNS mapping before attaching it

`validate_custom_domain` checks whether a hostname maps to the correct Front Door endpoint in DNS.

```python
validation = client.front_doors.validate_custom_domain(
    resource_group_name="rg-edge",
    front_door_name="my-front-door",
    custom_domain_properties={
        "hostName": "www.contoso.com",
    },
)

print(validation.custom_domain_validated)
print(validation.reason)
print(validation.message)
```

### Discover managed WAF rule sets

Use this before creating a policy so you know which managed rule set types and versions the service exposes in your environment.

```python
for rule_set in client.managed_rule_sets.list():
    print(rule_set.rule_set_type, rule_set.rule_set_version)
```

### Create a Front Door WAF policy

The SDK exposes WAF policy management under `client.policies`. `WebApplicationFirewallPolicy` defaults to `Classic_AzureFrontDoor` if you omit `sku`, but setting it explicitly makes the intended target clear.

```python
policy = client.policies.begin_create_or_update(
    resource_group_name="rg-edge",
    policy_name="edge-waf",
    parameters={
        "location": "westus2",
        "sku": {"name": "Classic_AzureFrontDoor"},
        "properties": {
            "policySettings": {
                "enabledState": "Enabled",
                "mode": "Prevention",
                "requestBodyCheck": "Enabled",
            },
            "managedRules": {
                "managedRuleSets": [
                    {
                        "ruleSetType": "DefaultRuleSet",
                        "ruleSetVersion": "1.0",
                        "ruleSetAction": "Block",
                    }
                ]
            },
        },
    },
).result()

print(policy.id)
print(policy.resource_state)
```

To associate a WAF policy with a Front Door host or route, set `webApplicationFirewallPolicyLink.id` on a frontend endpoint or routing rule in the Front Door payload.

## Common Pitfalls

- This client manages ARM resources at `https://management.azure.com`; it is not the runtime surface for request forwarding or cache behavior at the edge.
- `begin_create_or_update`, `begin_delete`, and other `begin_*` methods return pollers. Call `.result()` before assuming the resource exists.
- Front Door names are globally unique, and `validate_custom_domain` only checks DNS mapping. Custom HTTPS is a separate `frontend_endpoints.begin_enable_https(...)` workflow.
- `managed_rule_sets.list()` gives you the available managed rule set definitions; use those values when filling `ruleSetType` and `ruleSetVersion` in WAF policies.
- The Front Door REST docs for this SDK family use `Microsoft.Network/frontDoors`. Azure Front Door Standard/Premium profile management is documented separately under `Microsoft.Cdn/profiles`, so do not assume those profile-style APIs live under this client.

## Version-Sensitive Notes For `1.2.0`

- PyPI lists `azure-mgmt-frontdoor 1.2.0` as the current release, published on April 15, 2024.
- The `1.2.0` release adds `CustomRule.group_by`, plus `PolicySettings.javascript_challenge_expiration_in_minutes`, `PolicySettings.scrubbing_rules`, and `PolicySettings.state`.
- PyPI metadata for `1.2.0` lists Python `>=3.8`, while the current Azure SDK for Python repository states that client libraries are supported on Python 3.9 or later. If you are standardizing a new environment, verify your interpreter policy before pinning this package.

## Official Sources

- Microsoft Learn package docs: https://learn.microsoft.com/en-us/python/api/azure-mgmt-frontdoor/
- `FrontDoorManagementClient`: https://learn.microsoft.com/en-us/python/api/azure-mgmt-frontdoor/azure.mgmt.frontdoor.frontdoormanagementclient?view=azure-python
- `FrontDoorsOperations`: https://learn.microsoft.com/en-us/python/api/azure-mgmt-frontdoor/azure.mgmt.frontdoor.operations.frontdoorsoperations?view=azure-python
- Models package: https://learn.microsoft.com/en-us/python/api/azure-mgmt-frontdoor/azure.mgmt.frontdoor.models?view=azure-python
- `FrontDoor`: https://learn.microsoft.com/en-us/python/api/azure-mgmt-frontdoor/azure.mgmt.frontdoor.models.frontdoor?view=azure-python
- `RoutingRule`: https://learn.microsoft.com/en-us/python/api/azure-mgmt-frontdoor/azure.mgmt.frontdoor.models.routingrule?view=azure-python
- `ForwardingConfiguration`: https://learn.microsoft.com/en-us/python/api/azure-mgmt-frontdoor/azure.mgmt.frontdoor.models.forwardingconfiguration?view=azure-python
- `BackendPool`: https://learn.microsoft.com/en-us/python/api/azure-mgmt-frontdoor/azure.mgmt.frontdoor.models.backendpool?view=azure-python
- `Backend`: https://learn.microsoft.com/en-us/python/api/azure-mgmt-frontdoor/azure.mgmt.frontdoor.models.backend?view=azure-python
- `HealthProbeSettingsModel`: https://learn.microsoft.com/en-us/python/api/azure-mgmt-frontdoor/azure.mgmt.frontdoor.models.healthprobesettingsmodel?view=azure-python
- `LoadBalancingSettingsModel`: https://learn.microsoft.com/en-us/python/api/azure-mgmt-frontdoor/azure.mgmt.frontdoor.models.loadbalancingsettingsmodel?view=azure-python
- `FrontendEndpoint`: https://learn.microsoft.com/en-us/python/api/azure-mgmt-frontdoor/azure.mgmt.frontdoor.models.frontendendpoint?view=azure-python
- `PoliciesOperations`: https://learn.microsoft.com/en-us/python/api/azure-mgmt-frontdoor/azure.mgmt.frontdoor.operations.policiesoperations?view=azure-python
- `WebApplicationFirewallPolicy`: https://learn.microsoft.com/en-us/python/api/azure-mgmt-frontdoor/azure.mgmt.frontdoor.models.webapplicationfirewallpolicy?view=azure-python
- `PolicySettings`: https://learn.microsoft.com/en-us/python/api/azure-mgmt-frontdoor/azure.mgmt.frontdoor.models.policysettings?view=azure-python
- `ManagedRuleSetsOperations`: https://learn.microsoft.com/en-us/python/api/azure-mgmt-frontdoor/azure.mgmt.frontdoor.operations.managedrulesetsoperations?view=azure-python
- `ManagedRuleSetDefinition`: https://learn.microsoft.com/en-us/python/api/azure-mgmt-frontdoor/azure.mgmt.frontdoor.models.managedrulesetdefinition?view=azure-python
- `ManagedRuleSet`: https://learn.microsoft.com/en-us/python/api/azure-mgmt-frontdoor/azure.mgmt.frontdoor.models.managedruleset?view=azure-python
- Front Door create/update REST reference: https://learn.microsoft.com/en-us/rest/api/frontdoor/frontdoor/front-doors/create-or-update
- Front Door validate custom domain REST reference: https://learn.microsoft.com/en-us/rest/api/frontdoor/frontdoor/front-doors/validate-custom-domain
- Front Door WAF policy create/update REST reference: https://learn.microsoft.com/en-us/rest/api/frontdoor/webapplicationfirewall/policies/create-or-update
- Front Door name availability REST reference: https://learn.microsoft.com/en-us/rest/api/frontdoorservice/webapplicationfirewall/check-front-door-name-availability-with-subscription/check-front-door-name-availability-with-subscription?view=rest-frontdoorservice-webapplicationfirewall-2020-04-01
- Azure Front Door Standard/Premium profiles REST reference: https://learn.microsoft.com/en-us/rest/api/frontdoor/azurefrontdoorstandardpremium/afd-profiles/list-by-resource-group
- PyPI package page and release history: https://pypi.org/project/azure-mgmt-frontdoor/
- Azure SDK for Python repository: https://github.com/Azure/azure-sdk-for-python
