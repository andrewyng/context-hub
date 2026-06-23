---
name: nutanix-vmm
description: "Nutanix VMM Python SDK - VM lifecycle management (create, power, clone, snapshot, disk/NIC/GPU management, templates, images, OVAs)"
metadata:
  languages: "python"
  versions: "4.2.1"
  revision: 1
  updated-on: "2026-03-16"
  source: community
  tags: "nutanix,vm,virtual-machine,ahv,vmm,hypervisor,images,templates,snapshots"
---

# Nutanix VMM Python SDK v4.2.1

The VMM (Virtual Machine Management) namespace is the largest Nutanix SDK namespace with 15 API classes, 69 VmApi methods, and models for full AHV VM lifecycle management.

## Golden Rule

- **Package**: `ntnx_vmm_py_client`
- **Install**: `pip install ntnx-vmm-py-client==4.2.1`
- **AHV config models**: `import ntnx_vmm_py_client.models.vmm.v4.ahv.config as AhvVmConfig`
- **Content models**: `import ntnx_vmm_py_client.models.vmm.v4.content as VmmContent`
- **Policy models**: `import ntnx_vmm_py_client.models.vmm.v4.ahv.policies`
- **SDK Reference**: https://developers.nutanix.com/sdk-reference?namespace=vmm&version=v4.2&language=python

## Installation

```bash
pip install ntnx-vmm-py-client==4.2.1
```

## Initialization

```python
from ntnx_vmm_py_client import Configuration, ApiClient
from ntnx_vmm_py_client.api import VmApi, ImagesApi, TemplatesApi
import ntnx_vmm_py_client.models.vmm.v4.ahv.config as AhvVmConfig
import ntnx_vmm_py_client.models.vmm.v4.content as VmmContent

config = Configuration()
config.host = "prism-central.example.com"
config.port = 9440
config.username = "admin"
config.password = "password"
config.verify_ssl = False

client = ApiClient(configuration=config)
client.add_default_header("Accept-Encoding", "gzip, deflate, br")

vm_api = VmApi(api_client=client)
images_api = ImagesApi(api_client=client)
templates_api = TemplatesApi(api_client=client)
```

## Core Operations

### 1. Create a VM (with disk from image, NIC, UEFI boot, cloud-init)

```python
from base64 import b64encode
import ntnx_vmm_py_client.models.vmm.v4.ahv.config as AhvVmConfig

# Cluster reference
cluster_ref = AhvVmConfig.ClusterReference.ClusterReference()
cluster_ref.ext_id = "<cluster-uuid>"

# Disk cloned from an image
cloned_disk = AhvVmConfig.Disk.Disk(
    backing_info=AhvVmConfig.VmDisk.VmDisk(
        data_source=AhvVmConfig.DataSource.DataSource(
            reference=AhvVmConfig.ImageReference.ImageReference(
                image_ext_id="<image-uuid>"
            )
        )
    ),
    disk_address=AhvVmConfig.DiskAddress.DiskAddress(
        bus_type=AhvVmConfig.DiskBusType.DiskBusType.SCSI, index=0
    ),
)

# Empty data disk
empty_disk = AhvVmConfig.Disk.Disk(
    backing_info=AhvVmConfig.VmDisk.VmDisk(
        disk_size_bytes=42949672960,  # 40 GiB
        storage_container=AhvVmConfig.VmDiskContainerReference.VmDiskContainerReference(
            ext_id="<storage-container-uuid>"
        ),
    ),
    disk_address=AhvVmConfig.DiskAddress.DiskAddress(
        bus_type=AhvVmConfig.DiskBusType.DiskBusType.SCSI, index=1
    ),
)

# NIC with DHCP
vm_nic = AhvVmConfig.Nic.Nic(
    backing_info=AhvVmConfig.EmulatedNic.EmulatedNic(
        model=AhvVmConfig.EmulatedNicModel.EmulatedNicModel.VIRTIO,
        is_connected=True,
    ),
    network_info=AhvVmConfig.NicNetworkInfo.NicNetworkInfo(
        nic_type=AhvVmConfig.NicType.NicType.NORMAL_NIC,
        subnet=AhvVmConfig.SubnetReference.SubnetReference(ext_id="<subnet-uuid>"),
        ipv4_config=AhvVmConfig.Ipv4Config.Ipv4Config(should_assign_ip=True),
    ),
)

# Cloud-init userdata
userdata_encoded = b64encode(b"#cloud-config\npassword: nutanix\n").decode("ascii")

# Assemble the VM
new_vm = AhvVmConfig.Vm.Vm(
    name="my-vm",
    description="VM created using Nutanix v4 Python SDK",
    num_sockets=2,
    num_cores_per_socket=2,
    num_threads_per_core=1,
    memory_size_bytes=8589934592,  # 8 GiB
    machine_type=AhvVmConfig.MachineType.MachineType.Q35,
    cluster=cluster_ref,
    disks=[cloned_disk, empty_disk],
    nics=[vm_nic],
    cd_roms=[
        AhvVmConfig.CdRom.CdRom(
            disk_address=AhvVmConfig.CdRomAddress.CdRomAddress(
                bus_type=AhvVmConfig.CdRomBusType.CdRomBusType.SATA, index=0
            )
        )
    ],
    boot_config=AhvVmConfig.UefiBoot.UefiBoot(
        boot_order=[AhvVmConfig.BootDeviceType.BootDeviceType.DISK],
        is_secure_boot_enabled=False,
    ),
    is_branding_enabled=True,
    guest_customization=AhvVmConfig.GuestCustomizationParams.GuestCustomizationParams(
        config=AhvVmConfig.CloudInit.CloudInit(
            cloud_init_script=AhvVmConfig.Userdata.Userdata(value=userdata_encoded),
            datasource_type=AhvVmConfig.CloudInitDataSourceType.CloudInitDataSourceType.CONFIG_DRIVE_V2,
        )
    ),
)

vm_api = VmApi(api_client=client)
response = vm_api.create_vm(async_req=False, body=new_vm)
task_ext_id = response.data.ext_id  # TaskReference -> poll via prism TasksApi
```

### 2. List VMs with Filtering and Pagination

```python
# OData filtering with pagination and field selection
response = vm_api.list_vms(
    async_req=False,
    _page=0,
    _limit=50,
    _filter="name eq 'my-vm'",
    _orderby="name asc",
    _select="name,extId,powerState",
)
vms = response.data  # list of Vm objects
total = response.metadata.total_available_results

for vm in vms:
    print(f"{vm.name} ({vm.ext_id}) - {vm.power_state}")

# Other filter examples:
#   _filter="startswith(name, 'prod-')"
#   _filter="name in ('vm-a','vm-b')"
#   _filter="powerState eq 'ON'"
```

### 3. Power On a VM (requires ETag)

```python
# Step 1: GET the VM to obtain its ETag
existing_vm = vm_api.get_vm_by_id(vm_ext_id, async_req=False)
etag = client.get_etag(existing_vm)

# Step 2: Set the If-Match header and power on
client.add_default_header("If-Match", etag)
power_response = vm_api.power_on_vm(vm_ext_id, async_req=False)
task_ext_id = power_response.data.ext_id

# Other power operations (all require ETag):
# vm_api.shutdown_vm(ext_id)        # ACPI graceful shutdown
# vm_api.power_off_vm(ext_id)       # Force power off
# vm_api.reboot_vm(ext_id)          # ACPI reboot
# vm_api.reset_vm(ext_id)           # Hard reset
# vm_api.power_cycle_vm(ext_id)     # Force power cycle
```

### 4. Add a Disk to an Existing VM

```python
import ntnx_vmm_py_client.models.vmm.v4.ahv.config as AhvVmConfig

disk = AhvVmConfig.Disk.Disk()
disk.disk_address = AhvVmConfig.DiskAddress.DiskAddress(
    bus_type=AhvVmConfig.DiskBusType.DiskBusType.SCSI, index=1
)
vm_disk = AhvVmConfig.VmDisk.VmDisk()
vm_disk.disk_size_bytes = 107374182400  # 100 GiB
vm_disk.storage_container = AhvVmConfig.VmDiskContainerReference.VmDiskContainerReference(
    ext_id="<storage-container-uuid>"
)
disk.backing_info = vm_disk

response = vm_api.create_disk(vmExtId="<vm-uuid>", body=disk, async_req=False)
task_ext_id = response.data.ext_id
```

### 5. Create an Image from URL

```python
import ntnx_vmm_py_client.models.vmm.v4.content as VmmContent
import ntnx_vmm_py_client.models.vmm.v4.ahv.config as AhvVmConfig

new_image = VmmContent.Image.Image()
new_image.name = "rocky_linux_10_cloud"
new_image.desc = "Rocky Linux 10 Cloud Image"
new_image.type = "DISK_IMAGE"

image_source = VmmContent.UrlSource.UrlSource()
image_source.url = "https://dl.rockylinux.org/pub/rocky/10/images/x86_64/Rocky-10-GenericCloud-Base.latest.x86_64.qcow2"
image_source.allow_insecure = False
new_image.source = image_source

# Pin to a specific cluster
image_cluster = AhvVmConfig.ClusterReference.ClusterReference()
image_cluster.ext_id = "<cluster-uuid>"
new_image.initial_cluster_locations = [image_cluster]

images_api = ntnx_vmm_py_client.api.ImagesApi(api_client=client)
result = images_api.create_image(async_req=False, body=new_image)
task_ext_id = result.data.ext_id
```

## Key Patterns

### Model Aliasing (recommended)

Models are deeply nested. Use module-level aliases for readability:

```python
import ntnx_vmm_py_client.models.vmm.v4.ahv.config as AhvVmConfig

# Then reference as:
# AhvVmConfig.Vm.Vm()
# AhvVmConfig.Disk.Disk()
# AhvVmConfig.Nic.Nic()
# AhvVmConfig.ClusterReference.ClusterReference()
# AhvVmConfig.DiskBusType.DiskBusType.SCSI
```

### All Mutating Operations Return TaskReference

Every create, update, delete, and power operation returns a `TaskReference`. You must poll the task via the Prism `TasksApi` to confirm completion and retrieve the created entity's `ext_id`:

```python
task_ext_id = response.data.ext_id  # from any mutating call
# Use prism TasksApi.get_task_by_id(task_ext_id) to poll
# task.data.entities_affected[0].ext_id -> new entity UUID
```

### ETag / If-Match for Updates and Power Ops

All update and power operations require an ETag obtained from a prior GET:

```python
get_resp = vm_api.get_vm_by_id(extId="<uuid>", async_req=False)
etag = client.get_etag(get_resp)
client.add_default_header("If-Match", etag)
vm_api.update_vm_by_id(extId="<uuid>", body=modified_vm, async_req=False)
```

### Sub-resource APIs for Disk/NIC/GPU

Disks, NICs, GPUs, CD-ROMs, serial ports, and PCIe devices are managed via dedicated sub-resource methods on `VmApi` rather than embedding them in `update_vm_by_id`:

- `create_disk(vmExtId, body)` / `delete_disk_by_id(vmExtId, extId)`
- `create_nic(vmExtId, body)` / `delete_nic_by_id(vmExtId, extId)`
- `create_gpu(vmExtId, body)` / `delete_gpu_by_id(vmExtId, extId)`

## Common Mistakes

1. **Missing ETag for power operations** -- `power_on_vm`, `shutdown_vm`, and all power methods require a GET first to obtain the ETag via `client.get_etag(response)`, then set `If-Match` header. Omitting this returns a 412 Precondition Failed.

2. **Wrong model import path** -- Models are nested: `ntnx_vmm_py_client.models.vmm.v4.ahv.config`, not directly under `ntnx_vmm_py_client`. Use the aliasing pattern above.

3. **Forgetting `async_req=False`** -- By default, API calls return an `AsyncResult`. Pass `async_req=False` for synchronous behavior.

4. **Missing `storage_container` on new disks** -- New empty disks require a `VmDiskContainerReference` with the storage container `ext_id`. Omitting it causes a 400 error.

5. **Using deprecated NIC fields** -- Use `nic_backing_info` / `nic_network_info` (new OneOf fields) instead of the legacy `backing_info` / `network_info` on the `Nic` model. The legacy fields still work but may be removed in future versions.

6. **Not polling the task** -- All mutating operations are async. The response only contains a `TaskReference`, not the created entity. You must poll `TasksApi.get_task_by_id()` and extract `entities_affected[0].ext_id`.

## API Classes Summary

| Class | Methods | Purpose |
|-------|---------|---------|
| VmApi | 69 | Full VM lifecycle -- CRUD, power, clone, disk/NIC/GPU/CD-ROM, migration, guest tools, categories |
| ImagesApi | 7 | Image CRUD, download (`get_file_by_image_id`), import from PE |
| TemplatesApi | 13 | VM template CRUD, deploy, publish, version management, guest update |
| OvasApi | 7 | OVA CRUD, deploy, download |
| StatsApi | 4 | VM, disk, and NIC statistics with time ranges |
| EsxiVmApi | 18 | ESXi VM operations (parallel to VmApi for ESXi clusters) |
| EsxiStatsApi | 4 | ESXi VM statistics |
| VmRecoveryPointsApi | 5 | VM snapshots -- create, list, get, delete, restore |
| VmAntiAffinityPoliciesApi | 8 | VM-to-VM anti-affinity rules |
| VmHostAffinityPoliciesApi | 7 | VM-to-host affinity rules |
| VmStartupPoliciesApi | 14 | VM startup ordering and dependencies |
| VmGuestCustomizationProfilesApi | 5 | Reusable guest customization profiles |
| ImagePlacementPoliciesApi | 7 | Control image replication across clusters |
| ImageRateLimitPoliciesApi | 6 | Throttle image transfer bandwidth |
| TemplatePlacementPoliciesApi | 5 | Control template placement across clusters |

## Key Models

### Vm (`vmm.v4.ahv.config.Vm`) -- 55 properties

Core properties for create/update:

| Property | Type | Notes |
|----------|------|-------|
| `name` | str | VM name |
| `description` | str | |
| `num_sockets` | int | CPU sockets |
| `num_cores_per_socket` | int | Cores per socket |
| `num_threads_per_core` | int | Threads per core |
| `memory_size_bytes` | int | RAM in bytes |
| `cluster` | ClusterReference | Target cluster (`ext_id`) |
| `disks` | list[Disk] | Disk devices |
| `nics` | list[Nic] | Network interfaces |
| `gpus` | list[Gpu] | GPU passthrough/vGPU |
| `cd_roms` | list[CdRom] | CD-ROM devices |
| `boot_config` | OneOf[LegacyBoot, UefiBoot] | Boot mode |
| `machine_type` | MachineType | PC or Q35 |
| `guest_customization` | GuestCustomizationParams | Cloud-init / Sysprep |
| `power_state` | PowerState | Read-only: ON, OFF, PAUSED, SUSPENDED |
| `categories` | list[CategoryReference] | Assigned categories |
| `ext_id` | str | Read-only UUID |

### Disk (`vmm.v4.ahv.config.Disk`)

- `disk_address` -- DiskAddress with `bus_type` (SCSI, IDE, PCI, SATA, SPAPR) and `index`
- `backing_info` -- OneOf[VmDisk, ADSFVolumeGroupReference]

### VmDisk (`vmm.v4.ahv.config.VmDisk`)

- `disk_size_bytes` -- Size for new disks
- `storage_container` -- VmDiskContainerReference (`ext_id`)
- `data_source` -- DataSource with reference to ImageReference, VmDiskReference, or VmDiskRecoveryPointReference

### Nic (`vmm.v4.ahv.config.Nic`)

- `backing_info` / `nic_backing_info` -- EmulatedNic (model: VIRTIO/E1000, mac_address, is_connected)
- `network_info` / `nic_network_info` -- NicNetworkInfo (nic_type, subnet, ipv4_config, vlan_mode)

### Image (`vmm.v4.content.Image`) -- 19 properties

- `name`, `description`, `type` (DISK_IMAGE, ISO_IMAGE)
- `source` -- OneOf[UrlSource, VmDiskSource]
- `size_bytes`, `checksum`, `cluster_location_ext_ids`

### Key Enums

| Enum | Values |
|------|--------|
| PowerState | ON, OFF, PAUSED, SUSPENDED |
| DiskBusType | SCSI, IDE, PCI, SATA, SPAPR |
| MachineType | PC, Q35 |
| GpuMode | PASSTHROUGH_GRAPHICS, PASSTHROUGH_COMPUTE, VIRTUAL |
| GpuVendor | NVIDIA, AMD, INTEL |
| NicType | NORMAL_NIC, DIRECT_NIC, NETWORK_FUNCTION_NIC, SPAN_DESTINATION_NIC |
| EmulatedNicModel | VIRTIO, E1000 |
| ImageType | DISK_IMAGE, ISO_IMAGE |
| RecoveryPointType | CRASH_CONSISTENT, APPLICATION_CONSISTENT |

## Response Pattern

All API responses follow this structure:

```python
response.data       # Vm, list[Vm], TaskReference, Image, etc.
response.metadata   # ApiResponseMetadata
                    #   .total_available_results (int, for list calls)
                    #   .flags, .links, .messages, .extra_info
```

## Additional Operations

### Update a VM (requires ETag)

```python
get_resp = vm_api.get_vm_by_id(extId="<vm-uuid>", async_req=False)
vm = get_resp.data
etag = client.get_etag(get_resp)

vm.memory_size_bytes = 8 * 1024 * 1024 * 1024  # 8 GiB
vm.num_sockets = 4

client.add_default_header("If-Match", etag)
response = vm_api.update_vm_by_id(extId=vm.ext_id, body=vm, async_req=False)
```

### Clone a VM

```python
clone_params = AhvVmConfig.CloneOverrideParams.CloneOverrideParams()
clone_params.name = "cloned-vm"
clone_params.num_sockets = 4
clone_params.memory_size_bytes = 8 * 1024 * 1024 * 1024

response = vm_api.clone_vm(extId="<source-vm-uuid>", body=clone_params, async_req=False)
```

### Create and Restore Snapshots

```python
from ntnx_vmm_py_client.api import VmRecoveryPointsApi

rp_api = VmRecoveryPointsApi(api_client=client)

# Create snapshot
rp = AhvVmConfig.VmRecoveryPoint.VmRecoveryPoint()
rp.name = "pre-update-snapshot"
rp.vm_ext_id = "<vm-uuid>"
response = rp_api.create_vm_recovery_point(body=rp, async_req=False)

# Restore to new VM from snapshot
override = AhvVmConfig.VmConfigOverrideSpecification.VmConfigOverrideSpecification()
override.name = "restored-vm"
response = rp_api.restore_vm_recovery_point(
    extId="<recovery-point-uuid>", body=override, async_req=False
)

# Revert VM in-place to snapshot
revert = AhvVmConfig.RevertParams.RevertParams()
revert.vm_recovery_point_ext_id = "<recovery-point-uuid>"
response = vm_api.revert_vm(extId="<vm-uuid>", body=revert, async_req=False)
```

### Deploy VM from Template

```python
from ntnx_vmm_py_client import TemplatesApi, TemplateDeployment, VmConfigOverride

templates_api = TemplatesApi(api_client=client)

# Find template
templates = templates_api.list_templates(
    async_req=False, _filter="templateName eq 'my-template'"
)
template_ext_id = templates.data[0].ext_id

# Get active version
versions = templates_api.list_template_versions(template_ext_id, async_req=False)
version_ext_id = versions.data[0].ext_id

# Deploy
deployment = TemplateDeployment(
    version_id=version_ext_id,
    number_of_vms=1,
    cluster_reference="<cluster-uuid>",
    override_vm_config_map={
        0: VmConfigOverride(name="vm-from-template")
    },
)
result = templates_api.deploy_template(
    extId=template_ext_id, body=deployment, async_req=False
)
```

### Get VM Statistics

```python
from datetime import datetime, timedelta
from ntnx_vmm_py_client import DownSamplingOperator

stats_api = ntnx_vmm_py_client.api.StatsApi(api_client=client)

stats = stats_api.get_vm_stats_by_id(
    "<vm-uuid>",
    _startTime=datetime.now() - timedelta(minutes=120),
    _endTime=datetime.now(),
    _samplingInterval=30,
    _statType=DownSamplingOperator.AVG,
    _select="stats/hypervisorCpuUsagePpm,extId",
    async_req=False,
)
```
