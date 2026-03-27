---
name: mgmt-devtestlabs
description: "Azure DevTest Labs management-plane SDK for Python for labs, lab virtual machines, schedules, gallery images, and notification channels"
metadata:
  languages: "python"
  versions: "9.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,devtestlabs,arm,management,virtual-machines,schedules,python"
---

# Azure DevTest Labs Management SDK for Python

## Golden Rule

Use `azure-mgmt-devtestlabs` for Azure Resource Manager control-plane automation around DevTest Labs resources such as labs, lab virtual machines, schedules, gallery images, virtual networks, and notification channels. Pair it with `azure-identity`, pass an explicit subscription ID, and treat most write operations as long-running `begin_*` calls that need `.result()`.

This guide is for the stable `9.0.0` release published on January 4, 2021. PyPI still lists that release as tested with Python 2.7, 3.5, 3.6, and 3.7, so verify interpreter compatibility in your environment before standardizing on it in newer Python runtimes.

## Install

Install the management package with a current Azure credential package:

```bash
python -m pip install "azure-mgmt-devtestlabs==9.0.0" azure-identity
```

Common alternatives:

```bash
uv add "azure-mgmt-devtestlabs==9.0.0" azure-identity
poetry add "azure-mgmt-devtestlabs==9.0.0" azure-identity
```

## Authentication And Setup

The package now expects `azure-identity` credentials, not older `azure.common.credentials` or `msrestazure.azure_active_directory` credentials.

Local development with Azure CLI:

```bash
az login
export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
```

Service principal environment variables:

```bash
export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"
```

Basic client setup:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.devtestlabs import DevTestLabsClient

credential = DefaultAzureCredential()
subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]

client = DevTestLabsClient(
    credential=credential,
    subscription_id=subscription_id,
)
```

For short-lived scripts, closing the client when you are done is a good default:

```python
client.close()
```

## Core Operation Groups

The main entry points most projects use are:

- `client.labs`
- `client.virtual_machines`
- `client.virtual_machine_schedules`
- `client.schedules`
- `client.gallery_images`
- `client.virtual_networks`
- `client.notification_channels`

## Discover Labs And Lab Resources

List labs in the current subscription:

```python
for lab in client.labs.list_by_subscription():
    print(lab.name, lab.location, lab.id)
```

List labs in one resource group:

```python
resource_group = "example-rg"

for lab in client.labs.list_by_resource_group(resource_group):
    print(lab.name, lab.location)
```

Get one lab and ask ARM to expand selected properties:

```python
lab = client.labs.get(
    resource_group_name="example-rg",
    name="example-lab",
    expand="properties($select=defaultStorageAccount)",
)

print(lab.id)
print(lab.default_storage_account)
```

List gallery images you can use as VM bases:

```python
for image in client.gallery_images.list(
    resource_group_name="example-rg",
    lab_name="example-lab",
):
    print(image.name)
    print(image.os_type)
```

List DevTest Labs virtual networks attached to the lab:

```python
for vnet in client.virtual_networks.list(
    resource_group_name="example-rg",
    lab_name="example-lab",
):
    print(vnet.name, vnet.id)
```

## Create A Lab VM From A Gallery Image

Creating a lab VM requires a lab name, an attached DevTest Labs virtual network ID, a lab subnet name, and a gallery image reference.

```python
from azure.mgmt.devtestlabs.models import GalleryImageReference, LabVirtualMachine

resource_group = "example-rg"
lab_name = "example-lab"
vm_name = "devbox-01"

vm_poller = client.virtual_machines.begin_create_or_update(
    resource_group_name=resource_group,
    lab_name=lab_name,
    name=vm_name,
    lab_virtual_machine=LabVirtualMachine(
        location="westus2",
        size="Standard_A2_v2",
        user_name="azureuser",
        password="replace-with-a-secret",
        storage_type="Standard",
        allow_claim=True,
        disallow_public_ip_address=True,
        lab_virtual_network_id=(
            "/subscriptions/00000000-0000-0000-0000-000000000000/"
            "resourceGroups/example-rg/providers/Microsoft.DevTestLab/"
            "labs/example-lab/virtualNetworks/example-vnet"
        ),
        lab_subnet_name="example-vnetSubnet",
        gallery_image_reference=GalleryImageReference(
            publisher="Canonical",
            offer="UbuntuServer",
            sku="16.04-LTS",
            os_type="Linux",
            version="Latest",
        ),
    ),
)

vm = vm_poller.result()
print(vm.id)
print(vm.provisioning_state)
```

Useful follow-up reads:

```python
vm = client.virtual_machines.get(
    resource_group_name=resource_group,
    lab_name=lab_name,
    name=vm_name,
    expand="properties($expand=artifacts,computeVm,networkInterface,applicableSchedule)",
)

print(vm.size)
print(vm.os_type)
print(vm.compute_id)
```

## Manage Existing Lab VMs

List VMs in one lab:

```python
for vm in client.virtual_machines.list(
    resource_group_name="example-rg",
    lab_name="example-lab",
):
    print(vm.name, vm.owner_user_principal_name, vm.last_known_power_state)
```

Start, stop, restart, resize, or claim a VM:

```python
resource_group = "example-rg"
lab_name = "example-lab"
vm_name = "devbox-01"

client.virtual_machines.begin_start(resource_group, lab_name, vm_name).result()
client.virtual_machines.begin_stop(resource_group, lab_name, vm_name).result()
client.virtual_machines.begin_restart(resource_group, lab_name, vm_name).result()
client.virtual_machines.begin_resize(
    resource_group,
    lab_name,
    vm_name,
    size="Standard_A4_v2",
).result()
client.virtual_machines.begin_claim(resource_group, lab_name, vm_name).result()
```

For Windows lab VMs, retrieve the generated RDP payload:

```python
rdp = client.virtual_machines.get_rdp_file_contents(
    resource_group_name="example-rg",
    lab_name="example-lab",
    name="windows-devbox-01",
)

print(rdp)
```

## Lab And VM Schedules

List schedules at the lab level:

```python
for schedule in client.schedules.list(
    resource_group_name="example-rg",
    lab_name="example-lab",
):
    print(schedule.name, schedule.task_type, schedule.status)
```

List schedules attached directly to one VM:

```python
for schedule in client.virtual_machine_schedules.list(
    resource_group_name="example-rg",
    lab_name="example-lab",
    virtual_machine_name="devbox-01",
):
    print(schedule.name, schedule.task_type, schedule.status)
```

Read the effective startup and shutdown schedules currently applied to a VM:

```python
applicable = client.virtual_machines.list_applicable_schedules(
    resource_group_name="example-rg",
    lab_name="example-lab",
    name="devbox-01",
)

print(applicable.lab_vms_shutdown)
print(applicable.lab_vms_startup)
```

Create or replace a VM auto-shutdown schedule:

```python
from azure.mgmt.devtestlabs.models import NotificationSettings, Schedule

vm = client.virtual_machines.get(
    resource_group_name="example-rg",
    lab_name="example-lab",
    name="devbox-01",
)

schedule = client.virtual_machine_schedules.create_or_update(
    resource_group_name="example-rg",
    lab_name="example-lab",
    virtual_machine_name="devbox-01",
    name="auto-shutdown",
    schedule=Schedule(
        location=vm.location,
        status="Enabled",
        task_type="LabVmsShutdownTask",
        time_zone_id="Pacific Standard Time",
        target_resource_id=vm.id,
        daily_recurrence={"time": "1900"},
        notification_settings=NotificationSettings(
            status="Enabled",
            time_in_minutes=30,
            email_recipient="devops@example.com",
            notification_locale="EN",
            webhook_url="https://example.com/devtestlabs-hook",
        ),
    ),
)

print(schedule.name, schedule.status)
```

Execute an existing schedule immediately:

```python
client.virtual_machine_schedules.begin_execute(
    resource_group_name="example-rg",
    lab_name="example-lab",
    virtual_machine_name="devbox-01",
    name="auto-shutdown",
).result()
```

## Notification Channels

List notification channels configured on a lab:

```python
for channel in client.notification_channels.list(
    resource_group_name="example-rg",
    lab_name="example-lab",
):
    print(channel.name, channel.description)
```

Send a notification to an existing channel:

```python
client.notification_channels.notify(
    resource_group_name="example-rg",
    lab_name="example-lab",
    name="shutdown-webhook",
    event_name="AutoShutdown",
    json_payload='{"message":"manual test"}',
)
```

## Important Pitfalls

- This is an ARM management SDK. It provisions and manages DevTest Labs resources, but it does not replace SSH, WinRM, cloud-init, or app deployment tooling inside the guest OS.
- `subscription_id` is required even when credential resolution succeeds.
- Most mutations are long-running operations. Wait on `.result()` before assuming the resource is ready.
- Older samples that use `azure.common.credentials`, `ServicePrincipalCredentials`, `CloudError`, or non-`begin_*` write methods are pre-`9.x` patterns and should not be copied into current code.
- VM creation depends on existing lab resources. In practice you usually need a valid DevTest Labs virtual network ID, subnet name, and gallery image reference before `begin_create_or_update(...)` will succeed.
- `get_rdp_file_contents()` is for RDP access. Linux VMs still need SSH-oriented access and credentials.
- `9.0.0` is an older stable release. PyPI also shows newer pre-release builds in the `10.0.0b*` line, so do not mix snippets from preview docs into a project pinned to `9.0.0`.

## Official Sources Used

- https://pypi.org/project/azure-mgmt-devtestlabs/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-devtestlabs/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-devtestlabs/azure.mgmt.devtestlabs.devtestlabsclient?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-devtestlabs/azure.mgmt.devtestlabs.operations.labsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-devtestlabs/azure.mgmt.devtestlabs.operations.virtualmachinesoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-devtestlabs/azure.mgmt.devtestlabs.operations.virtualmachineschedulesoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-devtestlabs/azure.mgmt.devtestlabs.operations.schedulesoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-devtestlabs/azure.mgmt.devtestlabs.operations.galleryimagesoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-devtestlabs/azure.mgmt.devtestlabs.operations.virtualnetworksoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-devtestlabs/azure.mgmt.devtestlabs.operations.notificationchannelsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-devtestlabs/azure.mgmt.devtestlabs.models.lab?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-devtestlabs/azure.mgmt.devtestlabs.models.labvirtualmachine?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-devtestlabs/azure.mgmt.devtestlabs.models.galleryimagereference?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-devtestlabs/azure.mgmt.devtestlabs.models.schedule?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-devtestlabs/azure.mgmt.devtestlabs.models.notificationsettings?view=azure-python
- https://learn.microsoft.com/en-us/rest/api/dtl/virtual-machines/create-or-update?view=rest-dtl-2018-09-15
- https://learn.microsoft.com/en-us/rest/api/dtl/virtual-machine-schedules/create-or-update?view=rest-dtl-2018-09-15
- https://learn.microsoft.com/en-us/rest/api/dtl/notification-channels/create-or-update?view=rest-dtl-2018-09-15
- https://learn.microsoft.com/en-us/python/api/azure-identity/azure.identity.defaultazurecredential?view=azure-python
