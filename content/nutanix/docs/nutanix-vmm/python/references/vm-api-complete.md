# VmApi Complete Method Reference

**Package:** `ntnx_vmm_py_client` v4.2.1
**API Class:** `ntnx_vmm_py_client.api.VmApi`
**Namespace:** `vmm.v4.ahv.config`
**Total Methods:** 69

---

## VM CRUD (6 methods)

- `create_vm(body)` - Create a VM
- `get_vm_by_id(extId)` - Get VM configuration details
- `update_vm_by_id(extId, body)` - Update configuration for a VM
- `delete_vm_by_id(extId)` - Delete a VM
- `list_vms(_page, _limit, _filter, _orderby, _select)` - List VMs
- `clone_vm(extId, body)` - Clone a VM

## Power Operations (9 methods)

- `power_on_vm(extId)` - Turn on a VM
- `power_off_vm(extId)` - Force power off a VM
- `shutdown_vm(extId)` - Shutdown the VM using ACPI
- `reboot_vm(extId)` - Reboot a VM using ACPI
- `reset_vm(extId)` - Reset a VM immediately
- `power_cycle_vm(extId)` - Force a power cycle for a VM
- `shutdown_guest_vm(extId, body)` - Shutdown the VM using NGT
- `reboot_guest_vm(extId, body)` - Restart the VM using NGT
- `revert_vm(extId, body)` - Revert the AHV VM

## Disk Management (10 methods)

- `create_disk(vmExtId, body)` - Create a disk device for a VM
- `get_disk_by_id(vmExtId, extId)` - Get configuration details for the provided disk device
- `update_disk_by_id(vmExtId, extId, body)` - Update the configuration for the provided disk device
- `delete_disk_by_id(vmExtId, extId)` - Removes the specified disk device from a virtual machine
- `list_disks_by_vm_id(vmExtId, _page, _limit)` - List disks attached to a VM
- `migrate_vm_disks(extId, body)` - VmDisk migration between storage containers
- `enable_vm_disk_hydration(vmExtId, extId)` - Enable hydration for a VM disk
- `disable_vm_disk_hydration(vmExtId, extId)` - Disable hydration for a VM disk
- `add_vm_disk_custom_attributes(vmExtId, extId, body)` - Add to the VM disk's custom attributes
- `remove_vm_disk_custom_attributes(vmExtId, extId, body)` - Remove from the VM disk's custom attributes

## NIC Management (8 methods)

- `create_nic(vmExtId, body)` - Create a network device for a VM
- `get_nic_by_id(vmExtId, extId)` - Get configuration details for the provided network device
- `update_nic_by_id(vmExtId, extId, body)` - Update the configuration for the provided network device
- `delete_nic_by_id(vmExtId, extId)` - Remove a network device from a VM
- `list_nics_by_vm_id(vmExtId, _page, _limit, _filter)` - List network devices attached to a VM
- `assign_ip_by_id(vmExtId, extId, body)` - Assign an IP address to the provided network device
- `release_ip_by_id(vmExtId, extId)` - Release an assigned IP address from the provided network device
- `migrate_nic_by_id(vmExtId, extId, body)` - Migrate a network device to another subnet

## GPU Management (4 methods)

- `create_gpu(vmExtId, body)` - Attach a GPU device to a VM
- `get_gpu_by_id(vmExtId, extId)` - Get configuration details for the provided GPU device
- `delete_gpu_by_id(vmExtId, extId)` - Remove a GPU device from a VM
- `list_gpus_by_vm_id(vmExtId, _page, _limit, _filter)` - List GPUs attached to a VM

## CD-ROM Management (7 methods)

- `create_cd_rom(vmExtId, body)` - Create a CD-ROM device for a VM
- `get_cd_rom_by_id(vmExtId, extId)` - Get configuration details for the provided CD-ROM
- `delete_cd_rom_by_id(vmExtId, extId)` - Remove a CD-ROM device from a VM
- `list_cd_roms_by_vm_id(vmExtId, _page, _limit)` - List CD-ROMs attached to a VM
- `insert_cd_rom_by_id(vmExtId, extId, body)` - Inserts an ISO in the provided CD-ROM device
- `eject_cd_rom_by_id(vmExtId, extId)` - Ejects an ISO from the provided CD-ROM device
- `enable_vm_cd_rom_hydration(vmExtId, extId)` - Enable hydration for a VM CD-ROM
- `disable_vm_cd_rom_hydration(vmExtId, extId)` - Disable hydration for a VM CD-ROM

## Serial Port Management (5 methods)

- `create_serial_port(vmExtId, body)` - Create a serial port for a VM
- `get_serial_port_by_id(vmExtId, extId)` - Get configuration details for the provided serial port
- `update_serial_port_by_id(vmExtId, extId, body)` - Update the configuration for the provided serial port
- `delete_serial_port_by_id(vmExtId, extId)` - Remove a serial port from a VM
- `list_serial_ports_by_vm_id(vmExtId, _page, _limit)` - List serial ports attached to a VM

## PCIe Device Management (4 methods)

- `create_pcie_device(vmExtId, body)` - Create a PCIe device for a VM
- `get_pcie_device_by_id(vmExtId, extId)` - Get configuration details for the provided PCIe device
- `delete_pcie_device_by_id(vmExtId, extId)` - Remove a PCIe device from a VM
- `list_pcie_devices_by_vm_id(vmExtId, _page, _limit)` - List PCIe devices attached to a VM

## Guest Tools / NGT (6 methods)

- `get_guest_tools_by_id(extId)` - Get VM NGT configuration
- `update_guest_tools_by_id(extId, body)` - Update NGT configuration for a VM
- `insert_vm_guest_tools(extId, body)` - Insert NGT ISO into an available CD-ROM for a VM
- `install_vm_guest_tools(extId, body)` - Install NGT in a VM
- `uninstall_vm_guest_tools(extId)` - Uninstall NGT from a VM
- `upgrade_vm_guest_tools(extId, body)` - Upgrade NGT inside a VM

## Categories & Ownership (3 methods)

- `associate_categories(extId, body)` - Associate categories to a VM
- `disassociate_categories(extId, body)` - Disassociate categories from a VM
- `assign_vm_owner(extId, body)` - Assign owner of a VM

## Migration (2 methods)

- `migrate_vm_to_host(extId, body)` - Host to host VM migration
- `cross_cluster_migrate_vm(extId, body, _dryrun)` - Migrate a VM across clusters

## Other (5 methods)

- `customize_guest_vm(extId, body)` - Stage guest customization configuration details
- `generate_console_token_by_id(extId)` - Generate VM console token
- `add_vm_custom_attributes(extId, body)` - Add to the VM's custom attributes
- `remove_vm_custom_attributes(extId, body)` - Remove from the VM's custom attributes

---

## Parameter Reference

### Common Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `extId` | `str` | VM external ID (UUID) |
| `vmExtId` | `str` | Parent VM external ID (for sub-resource methods) |
| `body` | model | Request body (model type varies by method) |
| `_page` | `int` | Page number (0-based) for pagination |
| `_limit` | `int` | Number of results per page |
| `_filter` | `str` | OData filter expression (e.g., `"name eq 'my-vm'"`) |
| `_orderby` | `str` | OData sort expression (e.g., `"name asc"`) |
| `_select` | `str` | OData select for sparse fieldsets |
| `_dryrun` | `bool` | Dry-run mode (cross-cluster migration) |

### Common kwargs (all methods)

| kwarg | Description |
|-------|-------------|
| `async_req` | Execute asynchronously, returns `ApplyResult` |
| `_return_http_data_only` | Return only response data (default: `True`) |
| `_preload_content` | Deserialize response (default: `True`) |
| `_request_timeout` | Timeout in seconds |

---

## Key Models

### Vm (55 properties)

The primary VM configuration model from `ntnx_vmm_py_client.models.vmm.v4.ahv.config.Vm`.

| Property | Description |
|----------|-------------|
| `ext_id` | VM external ID (UUID, read-only) |
| `name` | VM display name |
| `description` | VM description |
| `power_state` | Current power state (PowerState enum) |
| `machine_type` | Hardware machine type (MachineType enum) |
| `num_sockets` | Number of CPU sockets |
| `num_cores_per_socket` | CPU cores per socket |
| `num_threads_per_core` | Threads per core |
| `num_numa_nodes` | NUMA node count |
| `memory_size_bytes` | Memory allocation in bytes |
| `disks` | List of Disk objects |
| `nics` | List of Nic objects |
| `gpus` | List of Gpu objects |
| `cd_roms` | List of CdRom objects |
| `serial_ports` | List of SerialPort objects |
| `pcie_devices` | List of PCIe device objects |
| `boot_config` | Boot configuration (BootConfig) |
| `guest_customization` | Guest customization spec |
| `guest_tools` | NGT configuration |
| `storage_config` | VM storage configuration |
| `vtpm_config` | Virtual TPM configuration |
| `apc_config` | APC (Advanced Power Config) |
| `categories` | Associated category references |
| `cluster` | Cluster reference |
| `host` | Host reference |
| `availability_zone` | Availability zone reference |
| `project` | Project reference |
| `ownership_info` | Owner information |
| `protection_policy_state` | Data protection policy state |
| `protection_type` | Protection type (ProtectionType enum) |
| `source` | VM source reference |
| `custom_attributes` | Custom key-value attributes |
| `bios_uuid` | BIOS UUID |
| `generation_uuid` | Generation UUID |
| `hardware_clock_timezone` | Hardware clock timezone |
| `is_agent_vm` | Whether VM is an agent VM |
| `is_branding_enabled` | Nutanix branding on VGA console |
| `is_cpu_hotplug_enabled` | CPU hot-plug support |
| `is_cpu_passthrough_enabled` | CPU passthrough mode |
| `is_cross_cluster_migration_in_progress` | Migration in progress flag |
| `is_gpu_console_enabled` | GPU console enabled |
| `is_live_migrate_capable` | Live migration capability |
| `is_memory_overcommit_enabled` | Memory overcommit |
| `is_scsi_controller_enabled` | SCSI controller support |
| `is_vcpu_hard_pinning_enabled` | vCPU hard pinning |
| `is_vga_console_enabled` | VGA console enabled |
| `vm_guest_customization_status` | Guest customization status |
| `create_time` | Creation timestamp (read-only) |
| `update_time` | Last update timestamp (read-only) |
| `tenant_id` | Tenant identifier |
| `links` | HATEOAS links (read-only) |

### Disk (9 properties)

| Property | Description |
|----------|-------------|
| `ext_id` | Disk external ID (UUID) |
| `disk_address` | DiskAddress (bus_type + index) |
| `backing_info` | VmDisk or ADSFVolumeGroupReference |
| `custom_attributes` | Custom key-value attributes |
| `tenant_id` | Tenant identifier |
| `links` | HATEOAS links |

### DiskAddress (5 properties)

| Property | Description |
|----------|-------------|
| `bus_type` | DiskBusType enum (SCSI, IDE, PCI, SATA, SPAPR) |
| `index` | Device index on the bus |

### VmDisk (10 properties)

| Property | Description |
|----------|-------------|
| `disk_size_bytes` | Disk size in bytes |
| `storage_container` | Storage container reference |
| `storage_config` | Disk storage configuration |
| `data_source` | Data source for disk creation (image, snapshot) |
| `disk_ext_id` | External disk reference ID |
| `is_migration_in_progress` | Migration in progress flag |
| `vm_disk_hydration_info` | Hydration information |

### DataSource (4 properties)

| Property | Description |
|----------|-------------|
| `reference` | Reference to image or VM disk (ImageReference, VmDiskReference) |

### Nic (10 properties)

| Property | Description |
|----------|-------------|
| `ext_id` | NIC external ID (UUID) |
| `backing_info` | EmulatedNic or DirectNicSpec |
| `network_info` | NicNetworkInfo |
| `nic_backing_info` | NIC backing info |
| `nic_network_info` | NIC network info |
| `tenant_id` | Tenant identifier |
| `links` | HATEOAS links |

### EmulatedNic (7 properties)

| Property | Description |
|----------|-------------|
| `model` | EmulatedNicModel enum (VIRTIO, E1000) |
| `mac_address` | MAC address string |
| `is_connected` | Connection state |
| `num_queues` | Number of queues |

### NicNetworkInfo (12 properties)

| Property | Description |
|----------|-------------|
| `nic_type` | NicType enum (NORMAL_NIC, DIRECT_NIC, NETWORK_FUNCTION_NIC, SPAN_DESTINATION_NIC) |
| `vlan_mode` | VlanMode enum (ACCESS, TRUNK) |
| `subnet` | Subnet reference |
| `ipv4_config` | Ipv4Config object |
| `ipv4_info` | Read-only IPv4 information |
| `trunked_vlans` | List of trunked VLAN IDs |
| `network_function_chain` | Network function chain reference |
| `network_function_nic_type` | NetworkFunctionNicType enum |
| `should_allow_unknown_macs` | Allow unknown MAC addresses |

### Ipv4Config (6 properties)

| Property | Description |
|----------|-------------|
| `ip_address` | Primary IPv4 address |
| `secondary_ip_address_list` | List of secondary IPs |
| `should_assign_ip` | Auto-assign IP from IPAM |

### Gpu (15 properties)

| Property | Description |
|----------|-------------|
| `ext_id` | GPU external ID (UUID) |
| `name` | GPU device name |
| `mode` | GpuMode enum (PASSTHROUGH_GRAPHICS, PASSTHROUGH_COMPUTE, VIRTUAL) |
| `vendor` | GpuVendor enum (NVIDIA, AMD, INTEL) |
| `device_id` | PCI device ID |
| `pci_address` | PCI address |
| `fraction` | vGPU fraction |
| `frame_buffer_size_bytes` | Frame buffer size |
| `num_virtual_display_heads` | Virtual display heads |
| `guest_driver_version` | Guest driver version |
| `tenant_id` | Tenant identifier |
| `links` | HATEOAS links |

### CdRom (9 properties)

| Property | Description |
|----------|-------------|
| `ext_id` | CD-ROM external ID (UUID) |
| `disk_address` | DiskAddress (bus_type + index) |
| `backing_info` | VmDisk backing reference |
| `iso_type` | IsoType enum (OTHER, GUEST_TOOLS) |
| `tenant_id` | Tenant identifier |
| `links` | HATEOAS links |

### SerialPort (8 properties)

| Property | Description |
|----------|-------------|
| `ext_id` | Serial port external ID (UUID) |
| `index` | Port index |
| `is_connected` | Connection state |
| `tenant_id` | Tenant identifier |
| `links` | HATEOAS links |

### CloneOverrideParams (12 properties)

| Property | Description |
|----------|-------------|
| `name` | Cloned VM name |
| `num_sockets` | Override CPU sockets |
| `num_cores_per_socket` | Override cores per socket |
| `num_threads_per_core` | Override threads per core |
| `memory_size_bytes` | Override memory size |
| `nics` | Override NIC configuration |
| `boot_config` | Override boot configuration |
| `guest_customization` | Guest customization for clone |
| `guest_customization_profile_config` | Guest customization profile |

### RevertParams (5 properties)

| Property | Description |
|----------|-------------|
| `vm_recovery_point_ext_id` | Recovery point to revert to |
| `override_spec` | Override spec for revert |

### Image (19 properties) - from vmm.v4.content

| Property | Description |
|----------|-------------|
| `ext_id` | Image external ID (UUID) |
| `name` | Image name |
| `description` | Image description |
| `type` | ImageType enum (DISK_IMAGE, ISO_IMAGE) |
| `source` | Image source (URL or file) |
| `size_bytes` | Image size in bytes |
| `checksum` | Image checksum |
| `owner_ext_id` | Owner external ID |
| `owner_name` | Owner name |
| `category_ext_ids` | Associated category IDs |
| `cluster_location_ext_ids` | Cluster placement IDs |
| `placement_policy_status` | Placement policy status |
| `create_time` | Creation timestamp |
| `last_update_time` | Last update timestamp |
| `tenant_id` | Tenant identifier |
| `links` | HATEOAS links |

### VmRecoveryPoint (19 properties) - from vmm.v4.ahv.config

| Property | Description |
|----------|-------------|
| `ext_id` | Recovery point external ID (UUID) |
| `name` | Recovery point name |
| `vm_ext_id` | Source VM external ID |
| `vm` | VM snapshot reference |
| `vm_categories` | Categories at snapshot time |
| `consistency_group_ext_id` | Consistency group ID |
| `recovery_point_type` | RecoveryPointType enum (APPLICATION_CONSISTENT, CRASH_CONSISTENT) |
| `status` | RecoveryPointStatus enum |
| `creation_time` | Creation timestamp |
| `expiration_time` | Expiration timestamp |
| `disk_recovery_points` | List of disk recovery points |
| `location_agnostic_id` | Location-agnostic identifier |
| `total_exclusive_usage_bytes` | Exclusive storage usage |
| `application_consistent_properties` | App-consistent properties |
| `tenant_id` | Tenant identifier |
| `links` | HATEOAS links |

---

## Enums

### PowerState
VM power state values.
- `ON` - VM is powered on
- `OFF` - VM is powered off
- `PAUSED` - VM is paused
- `SUSPENDED` - VM is suspended

### MachineType
Hardware machine type.
- `PC` - Standard PC (i440fx)
- `Q35` - Q35 chipset
- `PSERIES` - IBM POWER pSeries

### DiskBusType
Disk bus interface type.
- `SCSI` - SCSI bus
- `IDE` - IDE bus
- `PCI` - PCI bus
- `SATA` - SATA bus
- `SPAPR` - SPAPR (pSeries)

### CdRomBusType
CD-ROM bus interface type.
- `IDE` - IDE bus
- `SATA` - SATA bus
- `SPAPR` - SPAPR

### GpuMode
GPU attachment mode.
- `PASSTHROUGH_GRAPHICS` - GPU passthrough for graphics
- `PASSTHROUGH_COMPUTE` - GPU passthrough for compute
- `VIRTUAL` - Virtual GPU (vGPU)

### GpuVendor
GPU hardware vendor.
- `NVIDIA` - NVIDIA GPU
- `AMD` - AMD GPU
- `INTEL` - Intel GPU

### NicType
Network interface type.
- `NORMAL_NIC` - Standard virtual NIC
- `DIRECT_NIC` - Direct/SR-IOV NIC
- `NETWORK_FUNCTION_NIC` - Network function NIC
- `SPAN_DESTINATION_NIC` - SPAN destination NIC

### EmulatedNicModel
Emulated NIC hardware model.
- `VIRTIO` - VirtIO paravirtual NIC
- `E1000` - Intel E1000 emulated NIC

### VlanMode
VLAN mode for NIC.
- `ACCESS` - Access mode (single VLAN)
- `TRUNK` - Trunk mode (multiple VLANs)

### ImageType
Image content type.
- `DISK_IMAGE` - Disk image (QCOW2, RAW, VMDK)
- `ISO_IMAGE` - ISO image

### IsoType
CD-ROM ISO type.
- `OTHER` - User-provided ISO
- `GUEST_TOOLS` - NGT ISO

### ProtectionType
VM protection type.
- `UNPROTECTED` - No protection
- `PROTECTED` - Protected by policy

### AdapterType
NIC adapter type (ESXi).
- `E1000` - Intel E1000
- `E1000E` - Intel E1000E
- `PCNET32` - AMD PCNet32
- `VMXNET` - VMware VMXNET
- `VMXNET2` - VMware VMXNET2
- `VMXNET3` - VMware VMXNET3

### NetworkFunctionNicType
Network function NIC role.
- `INGRESS` - Ingress NIC
- `EGRESS` - Egress NIC
- `TAP` - TAP NIC

---

## Other VMM API Classes (for reference)

| API Class | Methods | Description |
|-----------|---------|-------------|
| EsxiStatsApi | 4 | ESXi VM statistics (disk, NIC, VM stats) |
| EsxiVmApi | 18 | ESXi VM management (mirrors VmApi for ESXi) |
| ImagesApi | 7 | Image CRUD, import, and management |
| ImagePlacementPoliciesApi | 7 | Image placement policy management |
| ImageRateLimitPoliciesApi | 6 | Image rate limit policy management |
| OvasApi | 7 | OVA import and management |
| StatsApi | 4 | AHV VM statistics |
| TemplatesApi | 13 | VM template CRUD, versioning, deploy |
| TemplatePlacementPoliciesApi | 5 | Template placement policies |
| VmAntiAffinityPoliciesApi | 8 | VM anti-affinity policy management |
| VmHostAffinityPoliciesApi | 7 | VM-host affinity policy management |
| VmStartupPoliciesApi | 14 | VM startup policy management |
| VmGuestCustomizationProfilesApi | 5 | Guest customization profiles CRUD |
| VmRecoveryPointsApi | 5 | VM recovery point management |
