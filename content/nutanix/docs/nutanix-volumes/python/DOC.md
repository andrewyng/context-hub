---
name: nutanix-volumes
description: "Nutanix Volumes Python SDK - volume groups, iSCSI/NVMe-oF block storage, volume disks, VM-to-volume attachments"
metadata:
  languages: "python"
  versions: "4.2.1"
  revision: 1
  updated-on: "2026-03-16"
  source: community
  tags: "nutanix,volumes,volume-group,iscsi,nvme,block-storage,volume-disk"
---

# Nutanix Volumes Python SDK v4.2.1

## Golden Rule

Package: `ntnx_volumes_py_client`

```python
import ntnx_volumes_py_client as vol_client
```

## Authentication Setup

```python
config = vol_client.Configuration()
config.host = "prism-central.example.com"
config.port = 9440
config.username = "admin"
config.password = "password"
config.verify_ssl = False

api_client = vol_client.ApiClient(configuration=config)
```

## API Classes (3 total, 30 methods)

| API Class | Methods | Purpose |
|-----------|---------|---------|
| VolumeGroupsApi | 25 | Full CRUD for volume groups, disks, VM/iSCSI/NVMf attachments, stats, categories |
| IscsiClientsApi | 3 | Get, list, and update iSCSI client configurations |
| NvmfClientsApi | 2 | Get and list NVMe-TCP client configurations |

## Core Operations

### 1. Create a Volume Group

```python
vg_api = vol_client.VolumeGroupsApi(api_client=api_client)

volume_group = vol_client.VolumeGroup(
    name="app-data-vg",
    description="Volume group for application data",
    sharing_status=vol_client.SharingStatus.SHARED,
    iscsi_features=vol_client.IscsiFeatures(
        enabled_authentications=vol_client.AuthenticationType.CHAP,
        target_secret="chap-secret-here"
    )
)

task_response = vg_api.create_volume_group(body=volume_group)
task_ext_id = task_response.data.ext_id

# Poll task to completion
task_data = wait_for_task(factory, task_ext_id, timeout=120)
vg_ext_id = task_data.completion_details[0].value
```

### 2. List Volume Groups

```python
vg_api = vol_client.VolumeGroupsApi(api_client=api_client)

volume_groups = vg_api.list_volume_groups()
for vg in volume_groups.data:
    print(f"VG: {vg.name}, ID: {vg.ext_id}, "
          f"Sharing: {vg.sharing_status}")

# Filter by name
filtered = vg_api.list_volume_groups(
    _filter="name eq 'app-data-vg'"
)
```

### 3. Get Volume Group Details

```python
vg = vg_api.get_volume_group_by_id(extId=vg_ext_id)
print(f"Name: {vg.data.name}")
print(f"Status: {vg.data.sharing_status}")
```

### 4. Create a Volume Disk

Add a virtual disk to a volume group.

```python
volume_disk = vol_client.VolumeDisk(
    disk_size_bytes=107374182400,  # 100 GB
    description="Data disk 1"
)

task_response = vg_api.create_volume_disk(
    volumeGroupExtId=vg_ext_id,
    body=volume_disk
)
wait_for_task(factory, task_response.data.ext_id, timeout=120)
```

### 5. Attach a VM to a Volume Group

```python
vm_attachment = vol_client.VmAttachment(
    vm_ext_id="vm-ext-id-here"
)

task_response = vg_api.attach_vm(
    extId=vg_ext_id,
    body=vm_attachment
)
wait_for_task(factory, task_response.data.ext_id, timeout=60)
```

### 6. Detach a VM from a Volume Group

```python
vm_detach = vol_client.VmAttachment(
    vm_ext_id="vm-ext-id-here"
)

task_response = vg_api.detach_vm(
    extId=vg_ext_id,
    body=vm_detach
)
wait_for_task(factory, task_response.data.ext_id, timeout=60)
```

### 7. Attach an iSCSI Client

```python
iscsi_attachment = vol_client.IscsiClient(
    iscsi_initiator_name="iqn.2024-01.com.example:initiator1",
    client_secret="chap-secret"
)

task_response = vg_api.attach_iscsi_client(
    extId=vg_ext_id,
    body=iscsi_attachment
)
```

### 8. Attach an NVMe-TCP Client

```python
nvmf_attachment = vol_client.NvmfClient(
    host_nqn="nqn.2024-01.com.example:host1"
)

task_response = vg_api.attach_nvmf_client(
    extId=vg_ext_id,
    body=nvmf_attachment
)
```

### 9. List VM Attachments

```python
attachments = vg_api.list_vm_attachments_by_volume_group_id(
    volumeGroupExtId=vg_ext_id
)
for att in attachments.data:
    print(f"VM: {att.vm_ext_id}")
```

### 10. Get Volume Group Stats

```python
stats = vg_api.get_volume_group_stats(extId=vg_ext_id)
```

### 11. Delete a Volume Group

```python
# Get ETag for concurrency control
vg = vg_api.get_volume_group_by_id(extId=vg_ext_id)
etag = vg.headers.get("ETag")

task_response = vg_api.delete_volume_group_by_id(
    extId=vg_ext_id,
    if_match=etag
)
```

### 12. Revert a Volume Group

Revert to a previous state (from a recovery point).

```python
task_response = vg_api.revert_volume_group(extId=vg_ext_id)
```

## iSCSI Client Management

```python
iscsi_api = vol_client.IscsiClientsApi(api_client=api_client)

# List all iSCSI clients
clients = iscsi_api.list_iscsi_clients()
for client in clients.data:
    print(f"iSCSI Client: {client.iscsi_initiator_name}")

# Get a specific client
client = iscsi_api.get_iscsi_client_by_id(extId=client_ext_id)

# Update client
iscsi_api.update_iscsi_client_by_id(
    extId=client_ext_id,
    body=updated_client
)
```

## Key Models

| Model | Props | Description |
|-------|-------|-------------|
| VolumeGroup | 21 | Top-level: name, sharing status, iSCSI features, storage config |
| IscsiClient | 11 | iSCSI initiator with name, network, authentication |
| VolumeDisk | 9 | Virtual disk within a volume group (size, storage container) |
| NvmfClient | 6 | NVMe-TCP client with host NQN |
| IscsiFeatures | - | Authentication type and target secret for iSCSI |
| VmAttachment | - | VM-to-volume-group attachment reference |

## Common Mistakes

1. **Not detaching VMs before deleting a volume group**: Volume groups with active attachments cannot be deleted.
2. **Missing ETag on updates/deletes**: Update and delete operations require the `If-Match` header.
3. **Disk size in bytes, not GB**: The `disk_size_bytes` field expects bytes (e.g., 107374182400 for 100 GB).
4. **Forgetting iSCSI authentication**: Production volume groups should always have CHAP authentication enabled.

## Cross-Namespace Dependencies

- **vmm**: VM ext_ids for attach/detach operations.
- **clustermgmt**: Storage container references for volume disk placement.
- **dataprotection**: Volume groups can be included in recovery points and consistency groups.
- **prism (TasksApi)**: Poll async task completion.
