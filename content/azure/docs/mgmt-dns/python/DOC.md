---
name: mgmt-dns
description: "Azure DNS management SDK for Python for public DNS zones, record sets, and ARM-based DNS administration"
metadata:
  languages: "python"
  versions: "9.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,dns,arm,management,dns-zones,record-sets,python"
---

# Azure DNS Management SDK for Python

## Golden Rule

Use `azure-mgmt-dns` for Azure Resource Manager management of Azure DNS zones and record sets, not for making DNS queries from your app. Install `azure-identity` with it, authenticate with a `TokenCredential`, pass `AZURE_SUBSCRIPTION_ID` explicitly, and remember that record-set names are relative to the zone (`www`, not `www.example.com`; use `@` for the zone apex).

## Install

Pin the package version your project expects and install an Azure credential package alongside it:

```bash
python -m pip install "azure-mgmt-dns==9.0.0" azure-identity
```

Common alternatives:

```bash
uv add "azure-mgmt-dns==9.0.0" azure-identity
poetry add "azure-mgmt-dns==9.0.0" azure-identity
```

`azure-mgmt-dns 9.0.0` requires Python 3.9 or later.

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
from azure.mgmt.dns import DnsManagementClient

credential = DefaultAzureCredential()
client = DnsManagementClient(
    credential=credential,
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)

models = client.models("2018-05-01")
```

Local CLI-driven setup:

```python
import os

from azure.identity import AzureCliCredential
from azure.mgmt.dns import DnsManagementClient

client = DnsManagementClient(
    credential=AzureCliCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)
```

The current Learn reference exposes these main operation groups:

- `zones`
- `record_sets`
- `dns_resource_reference`

## Core Usage

### Create a public DNS zone

Azure DNS zones are global resources, so the zone `location` is `"global"`:

```python
zone = client.zones.create_or_update(
    resource_group_name="dns-rg",
    zone_name="example.com",
    parameters=models.Zone(
        location="global",
        zone_type="Public",
        tags={"env": "dev"},
    ),
)

print(zone.id)
print(zone.name_servers)
```

Creating the zone in Azure does not delegate your domain automatically. After creation, update the domain at your registrar to use the Azure DNS name servers returned by the zone.

### List and get zones

```python
for zone in client.zones.list_by_resource_group("dns-rg"):
    print(zone.name, zone.max_number_of_record_sets)

zone = client.zones.get("dns-rg", "example.com")
print(zone.etag)
print(zone.name_servers)
```

`zones.get(...)` returns zone metadata, not the record sets inside the zone.

### Create or replace an A record set

```python
record_set = client.record_sets.create_or_update(
    resource_group_name="dns-rg",
    zone_name="example.com",
    relative_record_set_name="www",
    record_type="A",
    parameters=models.RecordSet(
        ttl=300,
        a_records=[
            models.ARecord(ipv4_address="203.0.113.10"),
            models.ARecord(ipv4_address="203.0.113.11"),
        ],
    ),
)

print(record_set.fqdn)
```

Use relative names:

- `"www"` creates `www.example.com`
- `"@"` targets the zone apex (`example.com`)

### Create a CNAME record set

```python
record_set = client.record_sets.create_or_update(
    resource_group_name="dns-rg",
    zone_name="example.com",
    relative_record_set_name="app",
    record_type="CNAME",
    parameters=models.RecordSet(
        ttl=300,
        cname_record=models.CnameRecord(
            cname="myapp.azurewebsites.net",
        ),
    ),
)

print(record_set.fqdn)
```

Azure DNS does not allow a CNAME record at the zone apex, and a name that has a CNAME record cannot have other record types.

### List record sets in a zone

```python
for record_set in client.record_sets.list_all_by_dns_zone("dns-rg", "example.com"):
    print(record_set.name, record_set.type, record_set.ttl)
```

These methods return paged iterators. Iterate over them instead of assuming one in-memory list.

### Update an existing record set safely with its ETag

```python
existing = client.record_sets.get(
    resource_group_name="dns-rg",
    zone_name="example.com",
    relative_record_set_name="www",
    record_type="A",
)

updated = client.record_sets.update(
    resource_group_name="dns-rg",
    zone_name="example.com",
    relative_record_set_name="www",
    record_type="A",
    parameters=models.RecordSet(
        ttl=600,
        a_records=existing.a_records,
        metadata={"owner": "platform"},
    ),
    if_match=existing.etag,
)

print(updated.ttl)
```

Use `if_match` when you do not want to overwrite a concurrently changed record set by accident.

### Delete a record set or a zone

```python
client.record_sets.delete(
    resource_group_name="dns-rg",
    zone_name="example.com",
    relative_record_set_name="app",
    record_type="CNAME",
)

client.zones.begin_delete(
    resource_group_name="dns-rg",
    zone_name="example.com",
).result()
```

Deleting a zone is a long-running operation. Wait on `.result()` when the delete must finish before the next step.

## Async Usage

The package also exposes `azure.mgmt.dns.aio.DnsManagementClient`. Use it only when the rest of your application is already async:

```python
import asyncio
import os

from azure.identity.aio import DefaultAzureCredential
from azure.mgmt.dns.aio import DnsManagementClient

async def main():
    credential = DefaultAzureCredential()
    client = DnsManagementClient(
        credential=credential,
        subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
    )

    try:
        async for zone in client.zones.list_by_resource_group("dns-rg"):
            print(zone.name)
    finally:
        await client.close()
        await credential.close()

asyncio.run(main())
```

## Common Pitfalls

- Installing `azure-mgmt-dns` without `azure-identity`
- Forgetting `AZURE_SUBSCRIPTION_ID`; the management client does not infer it from the credential
- Passing fully qualified names like `www.example.com` as `relative_record_set_name` instead of `www`
- Forgetting that zone `location` is `"global"`
- Assuming `zones.get(...)` or `zones.list*` includes record data
- Creating a CNAME at the zone apex or mixing a CNAME with other record types at the same name
- Trying to create or delete the apex `SOA` or `NS` record set directly; Azure creates them automatically for every DNS zone
- Deleting a zone without realizing all record sets in that zone are removed with it

## Version-Sensitive Notes

PyPI release notes for `azure-mgmt-dns 9.0.0` call out these breaking changes:

- Python 3.8 support was dropped; Python 3.9 is now the minimum
- `dnssec_configs` was removed
- `DsRecord`, `NaptrRecord`, `TlsaRecord`, and related enum values were removed

If you are upgrading older code that used DNSSEC configuration or DS, NAPTR, or TLSA record helpers, verify the pinned package version before copying examples forward.

## Official Sources Used

- https://pypi.org/project/azure-mgmt-dns/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-dns/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-dns/azure.mgmt.dns.dnsmanagementclient?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-dns/azure.mgmt.dns.operations.zonesoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-dns/azure.mgmt.dns.operations.recordsetsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-dns/azure.mgmt.dns.aio.dnsmanagementclient?view=azure-python
- https://learn.microsoft.com/en-us/azure/dns/dns-zones-records
- https://learn.microsoft.com/en-us/azure/networking/dns/dns-zones-records-portal
- https://learn.microsoft.com/en-us/python/api/overview/azure/identity-readme?view=azure-python
