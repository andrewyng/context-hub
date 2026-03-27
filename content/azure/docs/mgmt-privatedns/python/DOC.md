---
name: mgmt-privatedns
description: "Azure Private DNS management SDK for Python for private zones, virtual network links, and record sets"
metadata:
  languages: "python"
  versions: "1.2.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,private-dns,dns,arm,management,virtual-network-links,python"
---

# Azure Private DNS Management SDK for Python

## Golden Rule

Use `azure-mgmt-privatedns` for Azure Resource Manager management of Azure Private DNS zones, virtual network links, and record sets. This is a management-plane SDK, not a DNS resolver for application queries. Zone names are passed without a trailing dot, and records in a private zone are only resolvable from virtual networks linked to that zone.

## Install

Pin the package version your project expects and install `azure-identity` alongside it:

```bash
python -m pip install "azure-mgmt-privatedns==1.2.0" azure-identity
```

Common alternatives:

```bash
uv add "azure-mgmt-privatedns==1.2.0" azure-identity
poetry add "azure-mgmt-privatedns==1.2.0" azure-identity
```

`azure-mgmt-privatedns 1.2.0` requires Python 3.8 or later.

## Authentication And Setup

The package docs show `DefaultAzureCredential` with `AZURE_SUBSCRIPTION_ID`. If you authenticate with a service principal directly, also set the standard Azure identity variables.

Required environment:

```bash
export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
```

Common service-principal environment:

```bash
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"
```

Basic client setup:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.privatedns import PrivateDnsManagementClient

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]
credential = DefaultAzureCredential()

client = PrivateDnsManagementClient(
    credential=credential,
    subscription_id=subscription_id,
)
```

The current Learn reference shows these main operation groups on the client:

- `private_zones`
- `virtual_network_links`
- `record_sets`

The client defaults to ARM endpoint `https://management.azure.com` and API version `2024-06-01`. The Learn reference warns that overriding the API version may result in unsupported behavior.

## Core Usage

Import the model types you will send to the service:

```python
from azure.mgmt.privatedns.models import (
    ARecord,
    PrivateZone,
    RecordSet,
    SubResource,
    VirtualNetworkLink,
)
```

### Create a private zone

Private zones are global Azure resources. Use a multi-label zone name such as `private.contoso.com`, not a single label such as `contoso`.

```python
zone = client.private_zones.begin_create_or_update(
    resource_group_name="dns-rg",
    private_zone_name="private.contoso.com",
    parameters=PrivateZone(
        tags={"env": "dev"},
    ),
    if_none_match="*",
).result()

print(zone.id)
print(zone.etag)
```

`if_none_match="*"` makes this create-only. Omit it if you want an upsert.

### Link a virtual network to the zone

Private-zone resolution does not work until you create a virtual network link.

```python
vnet_id = (
    "/subscriptions/00000000-0000-0000-0000-000000000000"
    "/resourceGroups/network-rg"
    "/providers/Microsoft.Network/virtualNetworks/app-vnet"
)

link = client.virtual_network_links.begin_create_or_update(
    resource_group_name="dns-rg",
    private_zone_name="private.contoso.com",
    virtual_network_link_name="app-vnet-link",
    parameters=VirtualNetworkLink(
        virtual_network=SubResource(id=vnet_id),
        registration_enabled=False,
    ),
    if_none_match="*",
).result()

print(link.virtual_network_link_state)
```

Set `registration_enabled=True` only when you want Azure to auto-register VM hostnames from that virtual network into the zone. A private zone can have multiple registration virtual networks, but each virtual network can have only one registration zone.

### Create an A record set

Record-set names are relative to the zone. Use `"db"`, not `"db.private.contoso.com"`.

```python
record_set = client.record_sets.create_or_update(
    resource_group_name="dns-rg",
    private_zone_name="private.contoso.com",
    record_type="A",
    relative_record_set_name="db",
    parameters=RecordSet(
        ttl=300,
        a_records=[
            ARecord(ipv4_address="10.10.0.4"),
        ],
        metadata={"owner": "platform"},
    ),
    if_none_match="*",
)

print(record_set.fqdn)
```

Supported record types in the current reference are `A`, `AAAA`, `CNAME`, `MX`, `PTR`, `SOA`, `SRV`, and `TXT`.

### List zones, links, and record sets

```python
for zone in client.private_zones.list_by_resource_group("dns-rg"):
    print(zone.name, zone.number_of_record_sets)

for link in client.virtual_network_links.list("dns-rg", "private.contoso.com"):
    print(link.name, link.virtual_network_link_state, link.registration_enabled)

for record_set in client.record_sets.list("dns-rg", "private.contoso.com"):
    print(record_set.name, record_set.type, record_set.ttl)
```

These methods return paged iterators. Iterate over them instead of assuming one in-memory list.

### Update a record safely with its ETag

The record-set operations support optimistic concurrency through `if_match`.

```python
existing = client.record_sets.get(
    resource_group_name="dns-rg",
    private_zone_name="private.contoso.com",
    record_type="A",
    relative_record_set_name="db",
)

updated = client.record_sets.update(
    resource_group_name="dns-rg",
    private_zone_name="private.contoso.com",
    record_type="A",
    relative_record_set_name="db",
    parameters=RecordSet(
        ttl=600,
        a_records=existing.a_records,
        metadata={"owner": "networking"},
    ),
    if_match=existing.etag,
)

print(updated.ttl)
```

Use the same pattern for `private_zones.begin_update(...)` and `virtual_network_links.begin_update(...)` when you want to avoid overwriting concurrent changes.

### Delete in the correct order

You cannot delete a private zone while virtual network links still exist.

```python
client.record_sets.delete(
    resource_group_name="dns-rg",
    private_zone_name="private.contoso.com",
    record_type="A",
    relative_record_set_name="db",
)

client.virtual_network_links.begin_delete(
    resource_group_name="dns-rg",
    private_zone_name="private.contoso.com",
    virtual_network_link_name="app-vnet-link",
).result()

client.private_zones.begin_delete(
    resource_group_name="dns-rg",
    private_zone_name="private.contoso.com",
).result()
```

Deleting a registration virtual-network link also deletes the auto-registered DNS records for that virtual network. Deleting the zone deletes all records in the zone.

## Important Behavior And Pitfalls

- Private-zone records are not resolvable from the public internet. Resolution works only from linked virtual networks.
- Do not use a trailing dot in `private_zone_name`; the SDK reference explicitly expects zone names without a terminating dot.
- Do not use single-label zone names such as `corp`; Azure Private DNS requires at least two labels such as `corp.internal`.
- Do not try to create NS delegations inside a private DNS zone. Private-zone delegations are not supported.
- If a virtual network uses custom DNS servers, Azure does not automatically query linked private zones for that VNet. Use Azure DNS Private Resolver or configure a conditional forwarder to `168.63.129.16` for the private zone.
- `.local` is a poor zone choice; Microsoft recommends avoiding it because not all operating systems support it.
- You can create only one link between a given private zone and a given virtual network. Link names must still be unique within the zone.
- After link creation, the service docs note that the link status can take a few minutes to reach `Completed` for larger virtual networks. Check `virtual_network_link_state` before debugging name-resolution failures.
- `SOA` record sets cannot be created directly and cannot be deleted independently; they are created with the zone and removed when the zone is deleted.

## Version-Sensitive Notes

### `1.2.0`

PyPI release notes for `1.2.0` add:

- `VirtualNetworkLink.resolution_policy`
- `ResolutionPolicy`

The current model reference says `resolution_policy` is only applicable for virtual network links to `privatelink` zones and for `A`, `AAAA`, and `CNAME` queries. When set to `NxDomainRedirect`, Azure DNS falls back to public resolution if the private-zone lookup returns NXDOMAIN.

Example:

```python
link = client.virtual_network_links.begin_create_or_update(
    resource_group_name="dns-rg",
    private_zone_name="privatelink.database.windows.net",
    virtual_network_link_name="app-vnet-link",
    parameters=VirtualNetworkLink(
        virtual_network=SubResource(id=vnet_id),
        registration_enabled=False,
        resolution_policy="NxDomainRedirect",
    ),
).result()
```

Only use this setting when the zone and lookup behavior match those documented constraints.

## Official Sources Used

- https://pypi.org/project/azure-mgmt-privatedns/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-privatedns/azure.mgmt.privatedns.privatednsmanagementclient?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-privatedns/azure.mgmt.privatedns.operations.privatezonesoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-privatedns/azure.mgmt.privatedns.operations.recordsetsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-privatedns/azure.mgmt.privatedns.operations.virtualnetworklinksoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-privatedns/azure.mgmt.privatedns.models.virtualnetworklink?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-privatedns/azure.mgmt.privatedns.models?view=azure-python
- https://learn.microsoft.com/en-us/azure/dns/private-dns-overview
- https://learn.microsoft.com/en-us/azure/dns/private-dns-privatednszone
- https://learn.microsoft.com/en-us/azure/dns/private-dns-virtual-network-links
