---
name: nutanix-clustermgmt
description: "Nutanix Cluster Management Python SDK - cluster operations, hosts, storage containers, disks, SNMP, rsyslog, node management, cluster expansion"
metadata:
  languages: "python"
  versions: "4.2.1"
  revision: 1
  updated-on: "2026-03-16"
  source: community
  tags: "nutanix,cluster,host,storage-container,disk,snmp,node,cvm,bmc"
---

# Nutanix Cluster Management Python SDK (v4.2.1)

10 API classes, 84 methods, 408 models.

## Golden Rule

- **Package**: `ntnx_clustermgmt_py_client`
- **Install**: `pip install ntnx-clustermgmt-py-client==4.2.1`

## Initialization

```python
import ntnx_clustermgmt_py_client
from ntnx_clustermgmt_py_client import Configuration, ApiClient
from ntnx_clustermgmt_py_client.rest import ApiException
import ntnx_clustermgmt_py_client.models.clustermgmt.v4.config as v4ClusterConfig

config = Configuration()
config.host = "10.0.0.1"       # Prism Central IP (no https://, no port)
config.port = 9440
config.username = "admin"
config.password = "password"
config.verify_ssl = False
config.max_retry_attempts = 3
config.backoff_factor = 2

client = ApiClient(configuration=config)
clusters_api = ntnx_clustermgmt_py_client.ClustersApi(api_client=client)
storage_api = ntnx_clustermgmt_py_client.StorageContainersApi(api_client=client)
```

## Core Operations

### 1. List AOS Clusters

The cluster list returns BOTH AOS clusters and Prism Central. Always filter for AOS:

```python
# List only AOS clusters (excludes Prism Central)
response = clusters_api.list_clusters(
    _filter="config/clusterFunction/any(a:a eq Clustermgmt.Config.ClusterFunctionRef'AOS')"
)
clusters = response.data
for cluster in clusters:
    print(f"{cluster.name} -> ext_id={cluster.ext_id}")
```

### 2. List Prism Central Clusters

```python
response = clusters_api.list_clusters(
    _filter="config/clusterFunction/any(a:a eq Clustermgmt.Config.ClusterFunctionRef'PRISM_CENTRAL')"
)
pc_clusters = response.data
```

### 3. List Storage Containers

```python
# List storage containers for a specific cluster
response = storage_api.list_storage_containers(
    _filter=f"clusterExtId eq '{cluster_ext_id}'"
)
containers = response.data
for sc in containers:
    # NOTE: Use sc.container_ext_id, NOT sc.ext_id
    print(f"{sc.name} -> container_ext_id={sc.container_ext_id}")
```

### 4. List Hosts by Cluster

```python
response = clusters_api.list_hosts_by_cluster_id(
    clusterExtId=cluster_ext_id,
    _select="hostName,hypervisor,controllerVm"
)
hosts = response.data
for host in hosts:
    print(f"{host.host_name} -> ext_id={host.ext_id}")
```

### 5. Get Cluster by ID

```python
response = clusters_api.get_cluster_by_id(extId=cluster_ext_id)
cluster = response.data
print(f"Name: {cluster.name}")
print(f"Nodes: {cluster.config.cluster_function}")
# Access the ETag for update operations
etag = client.get_etag(response)
```

## Key Patterns

### Cluster ext_id Is Used Everywhere

The cluster `ext_id` from this namespace is referenced across ALL other namespaces:

- **VMM**: `ClusterReference` when creating VMs requires cluster ext_id
- **Networking**: Subnet `cluster_reference` requires cluster ext_id
- **Lifecycle**: `X_Cluster_Id` header for LCM operations
- **Volumes**: Volume group cluster association

Always retrieve cluster ext_ids first before working with other namespaces.

### Pagination

```python
# ClustersApi supports standard OData pagination
response = clusters_api.list_clusters(
    _page=0,
    _limit=50,
    _orderby="name asc"
)
```

### Filtering and Selection

```python
# OData filter examples
clusters_api.list_clusters(
    _filter="name eq 'my-cluster'",
    _select="name,config,network"
)

# Storage containers with free space filter
storage_api.list_storage_containers(
    _orderby="name asc",
    _limit=100
)
```

### ETag for Updates (Optimistic Concurrency)

```python
# GET the resource first to obtain the ETag
get_response = clusters_api.get_cluster_by_id(extId=cluster_ext_id)
etag = client.get_etag(get_response)

# Use If-Match header for update
clusters_api.update_cluster_by_id(
    extId=cluster_ext_id,
    body=updated_cluster,
    If_Match=etag
)
```

## API Classes Reference

| API Class | Methods | Description |
|-----------|---------|-------------|
| ClustersApi | 47 | Cluster CRUD, hosts, SNMP, rsyslog, fault tolerance, search, expand, node removal |
| StorageContainersApi | 10 | Storage container CRUD, stats, mount/unmount |
| ClusterProfilesApi | 7 | Cluster profile CRUD, apply/disassociate profiles |
| DisksApi | 6 | Disk listing, details, power actions by cluster |
| VcenterExtensionsApi | 4 | vCenter registration and management |
| CvmsApi | 3 | Controller VM info and management |
| BmcApi | 2 | BMC (baseboard management controller) info and updates |
| PasswordManagerApi | 2 | Cluster password management |
| SSLCertificateApi | 2 | SSL certificate operations |
| PcieDevicesApi | 1 | PCIe device listing |

### ClustersApi Key Methods (47 total)

Most-used methods:

| Method | Parameters | Description |
|--------|-----------|-------------|
| `list_clusters` | _page, _limit, _filter, _orderby, _select | List all registered clusters |
| `get_cluster_by_id` | extId | Get single cluster details |
| `list_hosts_by_cluster_id` | clusterExtId, _page, _limit, _filter, _select | List hosts in a cluster |
| `get_host_by_id` | clusterExtId, extId | Get single host details |
| `list_host_gpus` | clusterExtId, extId | List GPUs on a host |
| `get_snmp_config_by_cluster_id` | clusterExtId | Get SNMP configuration |
| `get_rsyslog_server_by_id` | clusterExtId, extId | Get rsyslog config |
| `search_clusters` | body | Search clusters with criteria |
| `discover_unconfigured_nodes` | body | Discover nodes for expansion |
| `validate_node` | clusterExtId, body | Validate node before adding |
| `expand_cluster` | clusterExtId, body | Add nodes to cluster |
| `remove_node` | clusterExtId, body | Remove nodes from cluster |

### StorageContainersApi Key Methods (10 total)

| Method | Parameters | Description |
|--------|-----------|-------------|
| `list_storage_containers` | _page, _limit, _filter, _orderby | List storage containers |
| `get_storage_container_by_id` | extId | Get container details |
| `create_storage_container` | body | Create new container |
| `update_storage_container_by_id` | extId, body, If_Match | Update container |
| `delete_storage_container_by_id` | extId, If_Match | Delete container |
| `get_storage_container_stats` | extId | Get container statistics |
| `mount_storage_container` | extId, body | Mount on a cluster |
| `unmount_storage_container` | extId, body | Unmount from a cluster |

## Key Models

| Model | Notable Properties |
|-------|-------------------|
| Cluster | name, ext_id, config, network, nodes, inefficient_vm_count |
| Host | host_name, ext_id, hypervisor, controller_vm, block, cpu_model, num_cpu_cores, memory_size_bytes |
| StorageContainer | name, container_ext_id, cluster_ext_id, max_capacity_bytes, logical_used_bytes, replication_factor |
| Disk | ext_id, disk_size_bytes, storage_tier, status, serial_number, location |
| ClusterProfile | ext_id, name, node_count |

## Common Mistakes

1. **Not filtering for AOS clusters** - `list_clusters()` without a filter returns both AOS and Prism Central clusters. Always use the `ClusterFunctionRef'AOS'` filter unless you specifically need PC.

2. **StorageContainer identifier** - StorageContainer uses `container_ext_id` as its unique identifier, not `ext_id`. The `ext_id` field may not exist or may be different.

3. **Host listing requires cluster** - `list_hosts_by_cluster_id` requires `clusterExtId`. There is no global host listing endpoint.

4. **Missing If-Match on updates** - All update/delete operations require the `If_Match` ETag header obtained from a prior GET call.

5. **Cluster function filter syntax** - The filter uses a `any()` lambda syntax because `clusterFunction` is a collection:
   ```
   config/clusterFunction/any(a:a eq Clustermgmt.Config.ClusterFunctionRef'AOS')
   ```
   This is NOT standard OData - it is Nutanix-specific.

## Model Import Paths

```python
# Config models (Cluster, Host, StorageContainer, Disk, etc.)
import ntnx_clustermgmt_py_client.models.clustermgmt.v4.config as v4ClusterConfig

# Operation models (expand, node removal, etc.)
import ntnx_clustermgmt_py_client.models.clustermgmt.v4.operations as v4ClusterOps

# Common models
import ntnx_clustermgmt_py_client.models.common.v1.config as v1CommonConfig
```
