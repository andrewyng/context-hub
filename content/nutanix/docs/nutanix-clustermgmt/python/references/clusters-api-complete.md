# ClustersApi Complete Reference — ntnx_clustermgmt_py_client v4.2.1

> 47 methods on `ClustersApi` + 10 on `StorageContainersApi` + supporting API classes.
> Import: `from ntnx_clustermgmt_py_client.api import ClustersApi, StorageContainersApi`

---

## Authentication & Client Setup

```python
import ntnx_clustermgmt_py_client as clustermgmt

config = clustermgmt.Configuration()
config.host = "prism-central.example.com"
config.port = 9440
config.username = "admin"
config.password = "secret"
config.verify_ssl = False

client = clustermgmt.ApiClient(configuration=config)
cluster_api = ClustersApi(api_client=client)
```

---

## ClustersApi — 47 Methods by Category

### Cluster CRUD & Configuration (6 methods)

#### create_cluster
Create a new cluster registration in Prism Central.
```python
cluster = clustermgmt.Cluster(
    name="prod-cluster-01",
    config=clustermgmt.ClusterConfigReference(
        cluster_function=["AOS"],
        authorized_public_key_list=[]
    ),
    network=clustermgmt.ClusterNetwork(
        external_address=clustermgmt.IPAddressOrFQDN(
            ipv4=clustermgmt.IPv4Address(value="10.0.0.100")
        )
    )
)
response = cluster_api.create_cluster(body=cluster)
task_ext_id = response.data.ext_id  # async — poll task
```

#### get_cluster_by_id
Retrieve a single cluster by its external ID.
```python
cluster = cluster_api.get_cluster_by_id(extId="00061de6-1234-abcd-0000-000000000000")
print(cluster.data.name, cluster.data.config.build_info.version)
# ETag returned in response headers for update operations
etag = client.get_etag(cluster)
```

#### update_cluster_by_id
Update cluster configuration. Requires `If-Match` ETag header.
```python
# 1. GET current cluster to obtain ETag
existing = cluster_api.get_cluster_by_id(extId=cluster_ext_id)
etag = client.get_etag(existing)

# 2. Modify fields
existing.data.name = "prod-cluster-01-renamed"

# 3. PUT with ETag
response = cluster_api.update_cluster_by_id(
    extId=cluster_ext_id,
    body=existing.data,
    if_match=etag
)
```

#### delete_cluster_by_id
Unregister a cluster from Prism Central.
```python
response = cluster_api.delete_cluster_by_id(extId=cluster_ext_id)
```

#### list_clusters
List all clusters with optional OData filtering and pagination.
```python
# Basic listing
clusters = cluster_api.list_clusters()

# With OData filters
clusters = cluster_api.list_clusters(
    _filter="name eq 'prod-cluster-01'",
    _orderby="name asc",
    _select="name,extId,config/clusterFunction",
    _page=0,
    _limit=50
)
for c in clusters.data:
    print(c.name, c.ext_id)
```

#### get_cluster_stats
Retrieve cluster performance statistics.
```python
stats = cluster_api.get_cluster_stats(
    clusterExtId=cluster_ext_id,
    _startTime="2024-01-01T00:00:00Z",
    _endTime="2024-01-02T00:00:00Z",
    _select="hypervisorCpuUsagePpm,storageUsageBytes"
)
```

---

### Host Management (16 methods)

#### get_host_by_id
Get details of a specific host.
```python
host = cluster_api.get_host_by_id(extId=host_ext_id)
print(host.data.host_name, host.data.hypervisor.type)
```

#### list_hosts
List all hosts across all clusters.
```python
hosts = cluster_api.list_hosts(
    _filter="hypervisor/type eq 'AHV'",
    _page=0,
    _limit=100
)
```

#### list_hosts_by_cluster_id
List hosts belonging to a specific cluster.
```python
hosts = cluster_api.list_hosts_by_cluster_id(
    clusterExtId=cluster_ext_id,
    _page=0,
    _limit=50
)
```

#### enter_host_maintenance
Put a host into maintenance mode (migrates VMs off).
```python
maintenance_config = clustermgmt.HostMaintenanceConfig(
    should_evacuate_vms=True,
    non_migratable_vm_option="BLOCK"  # or "POWER_OFF", "SKIP"
)
response = cluster_api.enter_host_maintenance(
    extId=host_ext_id,
    body=maintenance_config
)
task_ext_id = response.data.ext_id
```

#### exit_host_maintenance
Remove a host from maintenance mode.
```python
response = cluster_api.exit_host_maintenance(extId=host_ext_id)
task_ext_id = response.data.ext_id
```

#### get_host_stats
Retrieve host performance statistics.
```python
stats = cluster_api.get_host_stats(
    hostExtId=host_ext_id,
    _startTime="2024-01-01T00:00:00Z",
    _endTime="2024-01-02T00:00:00Z"
)
```

#### get_host_nic_by_id
Get details of a specific physical NIC on a host.
```python
nic = cluster_api.get_host_nic_by_id(
    hostExtId=host_ext_id,
    extId=nic_ext_id
)
print(nic.data.name, nic.data.mac_address, nic.data.link_speed_kbps)
```

#### list_host_nics
List all physical NICs across all hosts.
```python
nics = cluster_api.list_host_nics(_page=0, _limit=100)
```

#### list_host_nics_by_host_id
List physical NICs for a specific host.
```python
nics = cluster_api.list_host_nics_by_host_id(
    hostExtId=host_ext_id
)
for nic in nics.data:
    print(nic.name, nic.mac_address)
```

#### get_virtual_nic_by_id
Get details of a virtual NIC on a host.
```python
vnic = cluster_api.get_virtual_nic_by_id(
    hostExtId=host_ext_id,
    extId=vnic_ext_id
)
```

#### list_virtual_nics_by_host_id
List virtual NICs for a specific host.
```python
vnics = cluster_api.list_virtual_nics_by_host_id(
    hostExtId=host_ext_id
)
```

---

### Node Management (6 methods)

#### discover_unconfigured_nodes
Discover nodes not yet added to any cluster.
```python
discovery_params = clustermgmt.NodeDiscoveryParams(
    address_list=[
        clustermgmt.IPAddressOrFQDN(
            ipv4=clustermgmt.IPv4Address(value="10.0.0.50")
        )
    ]
)
response = cluster_api.discover_unconfigured_nodes(body=discovery_params)
task_ext_id = response.data.ext_id
```

#### expand_cluster
Add discovered nodes to an existing cluster.
```python
expand_params = clustermgmt.ExpandClusterParams(
    node_list=[
        clustermgmt.NodeParam(
            block_serial="BLOCK-SERIAL-123",
            node_serial="NODE-SERIAL-456",
            hypervisor_type="AHV",
            node_position="A",
            digital_certificate_map_list=[],
            cvm_ip=clustermgmt.IPAddressOrFQDN(
                ipv4=clustermgmt.IPv4Address(value="10.0.0.51")
            ),
            hypervisor_ip=clustermgmt.IPAddressOrFQDN(
                ipv4=clustermgmt.IPv4Address(value="10.0.0.52")
            ),
            ipmi_ip=clustermgmt.IPAddressOrFQDN(
                ipv4=clustermgmt.IPv4Address(value="10.0.0.53")
            )
        )
    ]
)
response = cluster_api.expand_cluster(
    clusterExtId=cluster_ext_id,
    body=expand_params
)
task_ext_id = response.data.ext_id
```

#### remove_node
Remove a node from a cluster.
```python
remove_params = clustermgmt.NodeRemovalParams(
    node_ext_ids=[node_ext_id],
    skip_space_check=False
)
response = cluster_api.remove_node(
    clusterExtId=cluster_ext_id,
    body=remove_params
)
task_ext_id = response.data.ext_id
```

#### validate_node
Pre-validate a node before adding to a cluster.
```python
response = cluster_api.validate_node(
    clusterExtId=cluster_ext_id,
    body=expand_params  # same shape as expand_cluster
)
task_ext_id = response.data.ext_id
```

#### fetch_node_networking_details
Fetch networking details for unconfigured nodes.
```python
response = cluster_api.fetch_node_networking_details(
    clusterExtId=cluster_ext_id,
    body=networking_params
)
task_ext_id = response.data.ext_id
```

#### check_hypervisor_requirements
Validate hypervisor requirements before cluster expansion.
```python
response = cluster_api.check_hypervisor_requirements(
    clusterExtId=cluster_ext_id,
    body=hypervisor_check_params
)
```

---

### SNMP Configuration (12 methods)

#### add_snmp_transport
Add an SNMP transport (listener) to a cluster.
```python
transport = clustermgmt.SnmpTransport(
    port=161,
    protocol="UDP"
)
response = cluster_api.add_snmp_transport(
    clusterExtId=cluster_ext_id,
    body=transport
)
```

#### remove_snmp_transport
Remove an SNMP transport from a cluster.
```python
response = cluster_api.remove_snmp_transport(
    clusterExtId=cluster_ext_id,
    body=transport
)
```

#### get_snmp_config_by_cluster_id
Get the full SNMP configuration for a cluster.
```python
snmp = cluster_api.get_snmp_config_by_cluster_id(
    clusterExtId=cluster_ext_id
)
print(snmp.data.is_enabled, snmp.data.transport_list)
```

#### create_snmp_trap
Create an SNMP trap destination.
```python
trap = clustermgmt.SnmpTrap(
    address=clustermgmt.IPAddressOrFQDN(
        ipv4=clustermgmt.IPv4Address(value="10.0.0.200")
    ),
    port=162,
    protocol="UDP",
    version="V2C",
    community_string="public"
)
response = cluster_api.create_snmp_trap(
    clusterExtId=cluster_ext_id,
    body=trap
)
```

#### get_snmp_trap_by_id
Get a specific SNMP trap destination.
```python
trap = cluster_api.get_snmp_trap_by_id(
    clusterExtId=cluster_ext_id,
    extId=trap_ext_id
)
```

#### update_snmp_trap_by_id
Update an SNMP trap destination. Requires ETag.
```python
existing = cluster_api.get_snmp_trap_by_id(
    clusterExtId=cluster_ext_id, extId=trap_ext_id
)
etag = client.get_etag(existing)
existing.data.port = 163
response = cluster_api.update_snmp_trap_by_id(
    clusterExtId=cluster_ext_id,
    extId=trap_ext_id,
    body=existing.data,
    if_match=etag
)
```

#### delete_snmp_trap_by_id
Delete an SNMP trap destination.
```python
response = cluster_api.delete_snmp_trap_by_id(
    clusterExtId=cluster_ext_id,
    extId=trap_ext_id
)
```

#### create_snmp_user
Create an SNMPv3 user.
```python
user = clustermgmt.SnmpUser(
    username="monitor_user",
    auth_type="SHA",
    auth_key="authpassword123",
    priv_type="AES",
    priv_key="privpassword123"
)
response = cluster_api.create_snmp_user(
    clusterExtId=cluster_ext_id,
    body=user
)
```

#### get_snmp_user_by_id
Get a specific SNMPv3 user.
```python
user = cluster_api.get_snmp_user_by_id(
    clusterExtId=cluster_ext_id,
    extId=user_ext_id
)
```

#### update_snmp_user_by_id
Update an SNMPv3 user. Requires ETag.
```python
existing = cluster_api.get_snmp_user_by_id(
    clusterExtId=cluster_ext_id, extId=user_ext_id
)
etag = client.get_etag(existing)
existing.data.auth_type = "SHA256"
response = cluster_api.update_snmp_user_by_id(
    clusterExtId=cluster_ext_id,
    extId=user_ext_id,
    body=existing.data,
    if_match=etag
)
```

#### delete_snmp_user_by_id
Delete an SNMPv3 user.
```python
response = cluster_api.delete_snmp_user_by_id(
    clusterExtId=cluster_ext_id,
    extId=user_ext_id
)
```

#### update_snmp_status
Enable or disable SNMP on a cluster.
```python
snmp_status = clustermgmt.SnmpStatusParam(is_enabled=True)
response = cluster_api.update_snmp_status(
    clusterExtId=cluster_ext_id,
    body=snmp_status
)
```

---

### Rsyslog Configuration (5 methods)

#### create_rsyslog_server
Add a remote syslog server to a cluster.
```python
rsyslog = clustermgmt.RsyslogServer(
    server_name="syslog-prod",
    ip_address=clustermgmt.IPAddressOrFQDN(
        ipv4=clustermgmt.IPv4Address(value="10.0.0.210")
    ),
    port=514,
    network_protocol="UDP",
    module_list=["ACROPOLIS", "GENESIS", "PRISM"]
)
response = cluster_api.create_rsyslog_server(
    clusterExtId=cluster_ext_id,
    body=rsyslog
)
```

#### get_rsyslog_server_by_id
Get a specific rsyslog server configuration.
```python
rsyslog = cluster_api.get_rsyslog_server_by_id(
    clusterExtId=cluster_ext_id,
    extId=rsyslog_ext_id
)
```

#### update_rsyslog_server_by_id
Update an rsyslog server. Requires ETag.
```python
existing = cluster_api.get_rsyslog_server_by_id(
    clusterExtId=cluster_ext_id, extId=rsyslog_ext_id
)
etag = client.get_etag(existing)
existing.data.port = 1514
response = cluster_api.update_rsyslog_server_by_id(
    clusterExtId=cluster_ext_id,
    extId=rsyslog_ext_id,
    body=existing.data,
    if_match=etag
)
```

#### delete_rsyslog_server_by_id
Remove an rsyslog server from a cluster.
```python
response = cluster_api.delete_rsyslog_server_by_id(
    clusterExtId=cluster_ext_id,
    extId=rsyslog_ext_id
)
```

#### list_rsyslog_servers_by_cluster_id
List all rsyslog servers configured on a cluster.
```python
servers = cluster_api.list_rsyslog_servers_by_cluster_id(
    clusterExtId=cluster_ext_id
)
for s in servers.data:
    print(s.server_name, s.ip_address, s.port)
```

---

### Category Association (2 methods)

#### associate_categories_to_cluster
Tag a cluster with one or more categories.
```python
category_refs = clustermgmt.CategoryEntityReferences(
    category_ext_ids=["cat-ext-id-1", "cat-ext-id-2"]
)
response = cluster_api.associate_categories_to_cluster(
    clusterExtId=cluster_ext_id,
    body=category_refs
)
```

#### disassociate_categories_from_cluster
Remove category tags from a cluster.
```python
response = cluster_api.disassociate_categories_from_cluster(
    clusterExtId=cluster_ext_id,
    body=category_refs
)
```

---

### GPU Profiles (2 methods)

#### list_physical_gpu_profiles
List physical GPU profiles available across clusters.
```python
gpus = cluster_api.list_physical_gpu_profiles(
    _page=0,
    _limit=50
)
for gpu in gpus.data:
    print(gpu.gpu_type, gpu.gpu_mode, gpu.device_name)
```

#### list_virtual_gpu_profiles
List virtual GPU (vGPU) profiles available for VM assignment.
```python
vgpus = cluster_api.list_virtual_gpu_profiles(
    _page=0,
    _limit=50
)
for vgpu in vgpus.data:
    print(vgpu.profile_name, vgpu.frame_buffer_size_mib)
```

---

### Rackable Units (2 methods)

#### list_rackable_units_by_cluster_id
List rackable units (physical blocks/chassis) in a cluster.
```python
units = cluster_api.list_rackable_units_by_cluster_id(
    clusterExtId=cluster_ext_id
)
for u in units.data:
    print(u.rackable_unit_model, u.serial)
```

#### get_rackable_unit_by_id
Get details of a specific rackable unit.
```python
unit = cluster_api.get_rackable_unit_by_id(
    clusterExtId=cluster_ext_id,
    extId=rackable_unit_ext_id
)
```

---

### Task Response (1 method)

#### fetch_task_response
Fetch the response payload of a completed async task.
```python
response = cluster_api.fetch_task_response(
    extId=task_ext_id
)
```

---

## StorageContainersApi — 10 Methods

```python
from ntnx_clustermgmt_py_client.api import StorageContainersApi
sc_api = StorageContainersApi(api_client=client)
```

### list_storage_containers
List all storage containers across clusters.
```python
containers = sc_api.list_storage_containers(
    _filter="name eq 'default-container'",
    _page=0,
    _limit=50
)
```

### get_storage_container_by_id
Get a specific storage container.
```python
container = sc_api.get_storage_container_by_id(extId=container_ext_id)
print(container.data.name, container.data.max_capacity_bytes)
```

### create_storage_container
Create a new storage container on a cluster.
```python
container = clustermgmt.StorageContainer(
    name="new-container",
    cluster_ext_id=cluster_ext_id,
    replication_factor=2,
    erasure_code_status="OFF",
    is_compression_enabled=True,
    compression_delay_secs=0
)
response = sc_api.create_storage_container(body=container)
task_ext_id = response.data.ext_id
```

### update_storage_container_by_id
Update a storage container. Requires ETag.
```python
existing = sc_api.get_storage_container_by_id(extId=container_ext_id)
etag = client.get_etag(existing)
existing.data.is_compression_enabled = False
response = sc_api.update_storage_container_by_id(
    extId=container_ext_id,
    body=existing.data,
    if_match=etag
)
```

### delete_storage_container_by_id
Delete a storage container (must be empty).
```python
response = sc_api.delete_storage_container_by_id(extId=container_ext_id)
```

### get_storage_container_stats
Get storage container performance stats.
```python
stats = sc_api.get_storage_container_stats(
    extId=container_ext_id,
    _startTime="2024-01-01T00:00:00Z",
    _endTime="2024-01-02T00:00:00Z"
)
```

### list_storage_containers_by_cluster_id
List storage containers on a specific cluster.
```python
containers = sc_api.list_storage_containers_by_cluster_id(
    clusterExtId=cluster_ext_id
)
```

### associate_categories_to_storage_container
Tag a storage container with categories.
```python
response = sc_api.associate_categories_to_storage_container(
    extId=container_ext_id,
    body=category_refs
)
```

### disassociate_categories_from_storage_container
Remove category tags from a storage container.
```python
response = sc_api.disassociate_categories_from_storage_container(
    extId=container_ext_id,
    body=category_refs
)
```

### mount_storage_container
Mount a storage container to hosts (datastore visibility).
```python
mount_params = clustermgmt.StorageContainerMountParams(
    host_ext_ids=[host_ext_id_1, host_ext_id_2]
)
response = sc_api.mount_storage_container(
    extId=container_ext_id,
    body=mount_params
)
```

---

## Other API Classes in clustermgmt

### DisksApi
Manage physical disks in clusters.
- `list_disks()` — List all disks
- `get_disk_by_id(extId)` — Get disk details
- `list_disks_by_cluster_id(clusterExtId)` — Disks on a specific cluster

### DomainFaultToleranceApi
Query fault tolerance status.
- `get_domain_fault_tolerance_by_cluster_id(clusterExtId)` — Get FT status

### RackableUnitsApi
Standalone rackable unit operations.
- `list_rackable_units()` — List all rackable units
- `get_rackable_unit_by_id(extId)` — Get rackable unit details

### HostGpusApi
GPU operations on hosts.
- `list_host_gpus()` — List all GPUs across hosts
- `get_host_gpu_by_id(extId)` — Get GPU details

### SnmpApi
Cluster-independent SNMP operations.
- `get_snmp_config_by_cluster_id(clusterExtId)`
- Additional SNMP endpoints

### SearchApi
Search across cluster management entities.
- `search(body)` — Full-text search

### StatsApi
Aggregated cluster statistics.
- `get_cluster_stats(clusterExtId)` — Cluster-level metrics

---

## Common OData Filter Examples

```python
# Clusters by name
_filter="name eq 'prod-cluster'"

# Hosts by hypervisor type
_filter="hypervisor/type eq 'AHV'"

# Clusters with specific function
_filter="config/clusterFunction/any(f: f eq 'AOS')"

# Storage containers above size threshold
_filter="maxCapacityBytes gt 1099511627776"

# Hosts in maintenance
_filter="maintenanceState eq 'IN_MAINTENANCE'"
```

## Pagination Pattern

```python
def paginate_all(api_method, page_size=50, **kwargs):
    """Generic paginator for any list method."""
    all_items = []
    page = 0
    while True:
        response = api_method(_page=page, _limit=page_size, **kwargs)
        if not response.data:
            break
        all_items.extend(response.data)
        if len(response.data) < page_size:
            break
        page += 1
    return all_items

# Usage
all_clusters = paginate_all(cluster_api.list_clusters)
all_hosts = paginate_all(cluster_api.list_hosts, _filter="hypervisor/type eq 'AHV'")
```

## Async Task Polling

```python
import time
from ntnx_prism_py_client.api import TasksApi

def wait_for_task(prism_client, task_ext_id, timeout=600, interval=5):
    """Poll a task until completion or timeout."""
    tasks_api = TasksApi(api_client=prism_client)
    elapsed = 0
    while elapsed < timeout:
        task = tasks_api.get_task_by_id(extId=task_ext_id)
        status = task.data.status
        if status == "SUCCEEDED":
            return task.data
        elif status == "FAILED":
            raise Exception(f"Task {task_ext_id} failed: {task.data.error_messages}")
        time.sleep(interval)
        elapsed += interval
    raise TimeoutError(f"Task {task_ext_id} timed out after {timeout}s")
```
