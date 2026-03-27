---
name: mgmt-containerinstance
description: "Azure Container Instances management SDK for Python for creating, inspecting, starting, stopping, and deleting container groups through Azure Resource Manager"
metadata:
  languages: "python"
  versions: "10.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,container-instances,aci,arm,containers,python"
---

# Azure Container Instances Management SDK for Python

## Golden Rule

Use `azure-mgmt-containerinstance` for Azure Container Instances management-plane work through Azure Resource Manager. Authenticate it with a `TokenCredential` such as `DefaultAzureCredential`, and treat `begin_*` methods as long-running ARM operations that need `.result()`.

This package manages container groups, logs, exec sessions, and regional capability lookups. It does not build images, push images, or create your resource group for you.

## Install

Pin the package version your project expects and install Azure Identity alongside it:

```bash
python -m pip install "azure-mgmt-containerinstance==10.1.0" azure-identity
```

Common alternatives:

```bash
uv add "azure-mgmt-containerinstance==10.1.0" azure-identity
poetry add "azure-mgmt-containerinstance==10.1.0" azure-identity
```

PyPI lists `10.1.0` as the stable release for this package. PyPI also shows a newer `10.2.0b1` pre-release, so do not assume preview fields or behavior are present in a project pinned to `10.1.0`.
PyPI also states the package is tested with Python `3.7+`.

## Authentication And Setup

The standard setup is `DefaultAzureCredential()` plus `AZURE_SUBSCRIPTION_ID`.

Environment variables for service-principal auth:

```bash
export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"

export AZURE_RESOURCE_GROUP="example-rg"
export AZURE_LOCATION="eastus"
export AZURE_CONTAINER_GROUP="hello-aci"
```

Basic client setup:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.containerinstance import ContainerInstanceManagementClient

credential = DefaultAzureCredential()
client = ContainerInstanceManagementClient(
    credential=credential,
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)
```

`ContainerInstanceManagementClient` also accepts `base_url=`. Use that only when you intentionally target a non-public ARM endpoint. The official client docs warn that overriding `api_version` from the default `2023-05-01` may result in unsupported behavior.

## Create A Container Group

`ContainerGroup` requires `containers` and `os_type`. Each `Container` requires `name`, `image`, and `resources`. `ResourceRequirements` requires `requests`, and `ResourceRequests` requires both `memory_in_gb` and `cpu`.

This example creates a public Linux container group with one container and a DNS label:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.containerinstance import ContainerInstanceManagementClient
from azure.mgmt.containerinstance.models import (
    Container,
    ContainerGroup,
    ContainerGroupRestartPolicy,
    ContainerPort,
    EnvironmentVariable,
    IpAddress,
    OperatingSystemTypes,
    Port,
    ResourceRequests,
    ResourceRequirements,
)

client = ContainerInstanceManagementClient(
    credential=DefaultAzureCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)

container_group = ContainerGroup(
    location=os.environ["AZURE_LOCATION"],
    os_type=OperatingSystemTypes.LINUX,
    restart_policy=ContainerGroupRestartPolicy.ALWAYS,
    containers=[
        Container(
            name="app",
            image="mcr.microsoft.com/azuredocs/aci-helloworld",
            resources=ResourceRequirements(
                requests=ResourceRequests(cpu=1.0, memory_in_gb=1.5)
            ),
            ports=[ContainerPort(port=80)],
            environment_variables=[
                EnvironmentVariable(name="ENVIRONMENT", value="dev"),
            ],
        )
    ],
    ip_address=IpAddress(
        type="Public",
        dns_name_label=f"{os.environ['AZURE_CONTAINER_GROUP']}-demo",
        ports=[Port(port=80, protocol="TCP")],
    ),
    tags={"env": "dev"},
)

created = client.container_groups.begin_create_or_update(
    resource_group_name=os.environ["AZURE_RESOURCE_GROUP"],
    container_group_name=os.environ["AZURE_CONTAINER_GROUP"],
    container_group=container_group,
).result()

print(created.id)
if created.ip_address:
    print(created.ip_address.ip)
    print(created.ip_address.fqdn)
```

Practical notes:

- The resource group must already exist before `begin_create_or_update(...)`.
- `IpAddress` requires both `ports` and `type`.
- Use `EnvironmentVariable(secure_value=...)` for secrets instead of plain `value`.

## List And Inspect Container Groups

List container groups in one resource group:

```python
for group in client.container_groups.list_by_resource_group(
    os.environ["AZURE_RESOURCE_GROUP"]
):
    print(group.name, group.location, group.provisioning_state)
```

Get one container group:

```python
group = client.container_groups.get(
    resource_group_name=os.environ["AZURE_RESOURCE_GROUP"],
    container_group_name=os.environ["AZURE_CONTAINER_GROUP"],
)

print(group.name)
print(group.provisioning_state)
print(group.restart_policy)
print(group.os_type)
```

`get_outbound_network_dependencies_endpoints(...)` exists on the operation group, but the official docs explicitly say it always returns an empty list for container groups.

## Logs, Attach, And Exec

Use `client.containers`, not `client.container_groups`, for container-level runtime interactions.

Get recent logs:

```python
logs = client.containers.list_logs(
    resource_group_name=os.environ["AZURE_RESOURCE_GROUP"],
    container_group_name=os.environ["AZURE_CONTAINER_GROUP"],
    container_name="app",
    tail=200,
    timestamps=True,
)
```

The official `list_logs(...)` docs note that:

- `tail` limits the number of lines returned
- omitting `tail` returns all available logs up to 4 MB
- `timestamps=True` prefixes each log line with a timestamp

Start an exec session:

```python
from azure.mgmt.containerinstance.models import ContainerExecRequest

exec_response = client.containers.execute_command(
    resource_group_name=os.environ["AZURE_RESOURCE_GROUP"],
    container_group_name=os.environ["AZURE_CONTAINER_GROUP"],
    container_name="app",
    container_exec_request=ContainerExecRequest(command="/bin/sh"),
)

print(exec_response.web_socket_uri)
print(exec_response.password)
```

Important: `execute_command(...)` does not return command stdout directly. It returns a `ContainerExecResponse` with `web_socket_uri` and `password` for the websocket session.

Attach to a running container stream:

```python
attach_response = client.containers.attach(
    resource_group_name=os.environ["AZURE_RESOURCE_GROUP"],
    container_group_name=os.environ["AZURE_CONTAINER_GROUP"],
    container_name="app",
)

print(attach_response.web_socket_uri)
print(attach_response.password)
```

`ContainerAttachResponse.password` must be sent as the `Authorization` header when connecting to the websocket URI.

## Start, Stop, Restart, Delete, And Tag Updates

Start a stopped container group:

```python
client.container_groups.begin_start(
    resource_group_name=os.environ["AZURE_RESOURCE_GROUP"],
    container_group_name=os.environ["AZURE_CONTAINER_GROUP"],
).result()
```

Stop a running container group:

```python
client.container_groups.stop(
    resource_group_name=os.environ["AZURE_RESOURCE_GROUP"],
    container_group_name=os.environ["AZURE_CONTAINER_GROUP"],
)
```

Restart a running container group:

```python
client.container_groups.begin_restart(
    resource_group_name=os.environ["AZURE_RESOURCE_GROUP"],
    container_group_name=os.environ["AZURE_CONTAINER_GROUP"],
).result()
```

Update tags:

```python
from azure.mgmt.containerinstance.models import Resource

updated = client.container_groups.update(
    resource_group_name=os.environ["AZURE_RESOURCE_GROUP"],
    container_group_name=os.environ["AZURE_CONTAINER_GROUP"],
    resource=Resource(tags={"env": "prod", "owner": "platform"}),
)

print(updated.tags)
```

Delete the container group:

```python
client.container_groups.begin_delete(
    resource_group_name=os.environ["AZURE_RESOURCE_GROUP"],
    container_group_name=os.environ["AZURE_CONTAINER_GROUP"],
).result()
```

Behavior that matters:

- `begin_start(...)` allocates compute resources and billing starts.
- `stop(...)` deallocates compute resources and billing stops.
- `begin_restart(...)` restarts containers in place and may pull a newer image if the image tag changed upstream.
- `update(...)` updates tags only, not the full container group definition.
- `begin_delete(...)` does not delete user-provided external resources such as volumes.

## Private Registry, Private Networking, And Volumes

The same `ContainerGroup` model handles private registry auth, VNet placement, and shared volumes.

Private registry credentials:

```python
from azure.mgmt.containerinstance.models import ImageRegistryCredential

registry_credential = ImageRegistryCredential(
    server=os.environ["ACR_SERVER"],
    username=os.environ["ACR_USERNAME"],
    password=os.environ["ACR_PASSWORD"],
)
```

`ImageRegistryCredential.server` must be the registry host name only, without `http://` or `https://`.

Deploy into a subnet with a private IP:

```python
from azure.mgmt.containerinstance.models import (
    Container,
    ContainerGroup,
    ContainerGroupSubnetId,
    ContainerPort,
    ImageRegistryCredential,
    IpAddress,
    OperatingSystemTypes,
    Port,
    ResourceRequests,
    ResourceRequirements,
)

private_ip = IpAddress(
    type="Private",
    ports=[Port(port=8080, protocol="TCP")],
)

registry_credential = ImageRegistryCredential(
    server=os.environ["ACR_SERVER"],
    username=os.environ["ACR_USERNAME"],
    password=os.environ["ACR_PASSWORD"],
)

subnet = ContainerGroupSubnetId(id=os.environ["ACI_SUBNET_ID"])

private_group = ContainerGroup(
    location=os.environ["AZURE_LOCATION"],
    os_type=OperatingSystemTypes.LINUX,
    containers=[
        Container(
            name="private-app",
            image=f"{os.environ['ACR_SERVER']}/myrepo/myimage:latest",
            resources=ResourceRequirements(
                requests=ResourceRequests(cpu=1.0, memory_in_gb=1.5)
            ),
            ports=[ContainerPort(port=8080)],
        )
    ],
    ip_address=private_ip,
    subnet_ids=[subnet],
    image_registry_credentials=[registry_credential],
)

client.container_groups.begin_create_or_update(
    resource_group_name=os.environ["AZURE_RESOURCE_GROUP"],
    container_group_name="private-aci",
    container_group=private_group,
).result()
```

For shared storage, `ContainerGroup` accepts `volumes=[...]` and each `Container` can mount them with `volume_mounts=[...]`. `VolumeMount.mount_path` must not contain `:`.

## Check Regional Capacity And Quotas

Before choosing a region or a larger CPU or memory shape, inspect the location metadata:

```python
for capability in client.location.list_capabilities(os.environ["AZURE_LOCATION"]):
    print(capability)

for usage in client.location.list_usage(os.environ["AZURE_LOCATION"]):
    print(usage)

for image in client.location.list_cached_images(os.environ["AZURE_LOCATION"]):
    print(image)
```

These are paged iterators. Iterate over them instead of assuming an in-memory list.

## Version-Sensitive Notes For 10.1.0

- PyPI marks `10.1.0` as the stable release published on `2023-04-21`.
- In `10.1.0`, `Container` adds `security_context`.
- In `10.1.0`, `ContainerGroup` adds `confidential_compute_properties`, `extensions`, and `priority`.
- Since `9.0.0`, `ContainerGroup` supports `subnet_ids`, and `ImageRegistryCredential` supports `identity` and `identity_url`.
- Since `8.0.0`, `ContainersOperations.attach(...)` exists and `list_logs(...)` uses the current signature with `tail` and `timestamps`.
- Do not copy Track 1 Azure auth examples that use `azure.common.credentials` or `ServicePrincipalCredentials`; current releases expect `azure-identity` credentials.

## Common Pitfalls

- Installing only `azure-mgmt-containerinstance` and forgetting `azure-identity`.
- Omitting `AZURE_SUBSCRIPTION_ID` and assuming a credential alone is enough.
- Treating `begin_create_or_update(...)`, `begin_start(...)`, `begin_restart(...)`, or `begin_delete(...)` as synchronous and skipping `.result()`.
- Assuming `stop(...)` is also a poller. It is a direct call that returns `None`.
- Expecting `update(...)` to patch the full container group. The official docs say it updates tags only.
- Sending a registry URL with a scheme in `ImageRegistryCredential.server`.
- Expecting `execute_command(...)` to return command output instead of websocket connection info.
- Assuming container group deletion also cleans up Azure Files shares, storage accounts, or other external resources.
- Overriding `api_version` on the client unless you have a specific compatibility reason and have verified the service behavior.

## Official Sources Used

- https://learn.microsoft.com/en-us/python/api/azure-mgmt-containerinstance/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-containerinstance/azure.mgmt.containerinstance.containerinstancemanagementclient?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-containerinstance/azure.mgmt.containerinstance.operations.containergroupsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-containerinstance/azure.mgmt.containerinstance.operations.containersoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-containerinstance/azure.mgmt.containerinstance.models.containergroup?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-containerinstance/azure.mgmt.containerinstance.models.container?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-containerinstance/azure.mgmt.containerinstance.models.resourcerequirements?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-containerinstance/azure.mgmt.containerinstance.models.resourcerequests?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-containerinstance/azure.mgmt.containerinstance.models.ipaddress?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-containerinstance/azure.mgmt.containerinstance.models.port?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-containerinstance/azure.mgmt.containerinstance.models.containerport?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-containerinstance/azure.mgmt.containerinstance.models.environmentvariable?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-containerinstance/azure.mgmt.containerinstance.models.imageregistrycredential?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-containerinstance/azure.mgmt.containerinstance.models.containergroupsubnetid?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-containerinstance/azure.mgmt.containerinstance.models.volume?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-containerinstance/azure.mgmt.containerinstance.models.volumemount?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-containerinstance/azure.mgmt.containerinstance.models.containerexecrequest?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-containerinstance/azure.mgmt.containerinstance.models.containerexecresponse?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-containerinstance/azure.mgmt.containerinstance.models.containerattachresponse?view=azure-python
- https://pypi.org/project/azure-mgmt-containerinstance/
