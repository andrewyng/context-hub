---
name: mgmt-media
description: "Legacy Azure Media Services management SDK for Python for inspecting media accounts, assets, transforms, jobs, and streaming resources"
metadata:
  languages: "python"
  versions: "10.2.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,media-services,management,video,streaming,encoding,python"
---

# Azure Media Services Management SDK for Python

## Golden Rule

Treat `azure-mgmt-media` as a legacy management SDK. Microsoft still publishes the package and the Python API reference, but Azure Media Services retired on June 30, 2024. Do not start new Media Services integrations with this package. Use it only to understand or inventory older automation while you migrate away from Azure Media Services.

The current Microsoft retirement guidance says:

- you cannot create new Azure Media Services accounts
- after retirement, Media Services accounts become read-only for a limited period
- expired accounts reject write operations such as `POST`, `PUT`, and `PATCH`
- Microsoft later deletes the expired accounts

That retirement status matters more than the package version number.

## Install

Pin the package version your project expects and install `azure-identity` with it:

```bash
python -m pip install "azure-mgmt-media==10.2.1" azure-identity
```

Common alternatives:

```bash
uv add "azure-mgmt-media==10.2.1" azure-identity
poetry add "azure-mgmt-media==10.2.1" azure-identity
```

PyPI lists `azure-mgmt-media 10.2.1` as a deprecated package and requires Python `>=3.7`.

## Authentication And Setup

The official package readme shows `DefaultAzureCredential` with a subscription ID. In local scripts, `AzureCliCredential` is fine after `az login`. For service principal auth, set the usual Azure Identity variables.

Required environment:

```bash
export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
```

If you are authenticating with a service principal directly, also set:

```bash
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"
```

Basic client setup:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.media import MediaManagementClient

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]
credential = DefaultAzureCredential()

client = MediaManagementClient(
    credential=credential,
    subscription_id=subscription_id,
)
```

CLI-driven local script:

```python
import os

from azure.identity import AzureCliCredential
from azure.mgmt.media import MediaManagementClient

client = MediaManagementClient(
    credential=AzureCliCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)
```

## What This Package Is For

`azure-mgmt-media` is the Azure Resource Manager client for Azure Media Services resources. In older codebases, you will usually see it used to:

- inspect a Media Services account
- enumerate assets that were uploaded or encoded earlier
- inspect transforms and jobs
- inspect streaming endpoints or streaming locators that already existed

Because the service is retired, the safe default in 2026 is read-oriented inventory and migration work, not creating new media workflows.

## Core Read Workflows

### Inspect a legacy Media Services account

Use the account name under a resource group and read its ARM metadata:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.media import MediaManagementClient

resource_group = "example-rg"
account_name = "example-media-account"

client = MediaManagementClient(
    credential=DefaultAzureCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)

account = client.mediaservices.get(resource_group, account_name)

print(account.id)
print(account.location)
print(account.storage_accounts)
```

If this call fails with `ResourceNotFoundError`, the account was likely already removed as part of the retirement process.

### List existing assets

Assets are the main inventory object for uploaded or encoded content:

```python
for asset in client.assets.list(resource_group, account_name):
    print(asset.name, asset.description)
```

Read one specific asset:

```python
asset = client.assets.get(resource_group, account_name, "example-asset")
print(asset.name)
print(asset.container)
```

### Inspect transforms and jobs

Transforms describe encoding presets. Jobs represent work submitted against a transform.

```python
for transform in client.transforms.list(resource_group, account_name):
    print(transform.name, transform.description)
```

```python
transform_name = "AdaptiveStreamingTransform"

for job in client.jobs.list(resource_group, account_name, transform_name):
    print(job.name, job.state)
```

These inventory calls are useful when migrating old Media Services automation to another platform because they show which assets, transforms, and jobs your old account contained.

## Historical Write Calls You May See In Older Code

If you are reading an older codebase, these are the main operation shapes you are likely to encounter:

- `client.assets.create_or_update(...)`
- `client.transforms.create_or_update(...)`
- `client.jobs.create(...)`
- `client.streaming_locators.create(...)`
- `client.streaming_endpoints.begin_start(...)`

Do not treat those as safe greenfield patterns in 2026. Microsoft’s retirement guidance says expired accounts reject write operations, so these calls are mainly relevant when you are reading or deleting legacy code.

## Common Pitfalls

- Installing `azure-mgmt-media` without `azure-identity`
- Assuming the newest package release means the underlying Azure service is still available for new projects
- Forgetting that `subscription_id` is required when building the client
- Treating this package as a media upload or playback runtime SDK instead of an ARM management client
- Expecting create or update operations to work after Azure Media Services retirement
- Looking for new account creation flows even though Microsoft no longer allows new Azure Media Services accounts

## Migration Notes

- Prefer using this package to inventory old resources and scripts before you remove or replace them.
- If your application still depends on Azure Media Services concepts such as assets, transforms, jobs, or streaming locators, plan a full service migration rather than a package upgrade.
- Keep the retirement guide next to any maintenance work on this package so your team does not mistake it for an actively supported media platform.

## Official Sources Used

- https://pypi.org/project/azure-mgmt-media/
- https://learn.microsoft.com/en-us/python/api/overview/azure/mgmt-media-readme?view=azure-python
- https://learn.microsoft.com/en-us/azure/media-services/latest/azure-media-services-retirement
- https://learn.microsoft.com/en-us/azure/templates/microsoft.media/mediaservices/assets
- https://learn.microsoft.com/en-us/azure/templates/microsoft.media/mediaservices/transforms
