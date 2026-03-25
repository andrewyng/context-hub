---
name: nutanix-sdk
description: "Nutanix v4.2 Python SDK - unified client for managing Nutanix infrastructure (VMs, clusters, networking, storage, DR, monitoring) via Prism Central"
metadata:
  languages: "python"
  versions: "4.2.1"
  revision: 1
  updated-on: "2026-03-16"
  source: community
  tags: "nutanix,prism,hyperconverged,hci,virtualization,infrastructure,cloud,sdk"
---

# Nutanix v4.2 Python SDK Overview

The Nutanix v4.2 Python SDK provides programmatic access to Prism Central for managing
hyperconverged infrastructure: VMs, clusters, networking, storage, data protection,
lifecycle management, monitoring, and more. The SDK is split into 12 namespace-specific
packages that share identical authentication and request patterns.

## Golden Rule

- **Package naming**: `ntnx_{namespace}_py_client` (e.g., `ntnx_vmm_py_client`)
- **Install (pip)**: `pip install ntnx-vmm-py-client ntnx-prism-py-client ntnx-clustermgmt-py-client ntnx-networking-py-client` (etc.)
- **Import pattern**: `from ntnx_vmm_py_client import Configuration, ApiClient` then `from ntnx_vmm_py_client.api import VmApi`
- **Each namespace needs its own Configuration + ApiClient** -- they cannot be shared across namespaces.

## Installation

Install all 12 packages at once:

```bash
pip install \
  ntnx-vmm-py-client==4.2.1 \
  ntnx-prism-py-client==4.2.1 \
  ntnx-clustermgmt-py-client==4.2.1 \
  ntnx-networking-py-client==4.2.1 \
  ntnx-lifecycle-py-client==4.2.1 \
  ntnx-microseg-py-client==4.2.1 \
  ntnx-datapolicies-py-client==4.2.1 \
  ntnx-dataprotection-py-client==4.2.1 \
  ntnx-volumes-py-client==4.2.1 \
  ntnx-licensing-py-client==4.3.1 \
  ntnx-monitoring-py-client==4.2.1 \
  ntnx-aiops-py-client==4.2.1b1
```

Or install only what you need. The `prism` package is almost always required (task
monitoring), plus whichever domain namespaces your workflow touches.

## Initialization

### Configuration Parameters

| Parameter | Description | Required | Default |
|-----------|-------------|----------|---------|
| host | Prism Central IPv4/IPv6/FQDN | Yes | N/A |
| port | Connection port | No | 9440 |
| username | Cluster username | Yes | N/A |
| password | Cluster password | Yes | N/A |
| verify_ssl | Verify SSL certificate | No | True |
| max_retry_attempts | Max retry attempts | No | 5 |
| backoff_factor | Retry backoff multiplier | No | 3 |
| connect_timeout | Connection timeout (ms) | No | 30000 |
| read_timeout | Read timeout (ms) | No | 30000 |

### Single-Namespace Auth

```python
import ntnx_vmm_py_client
from ntnx_vmm_py_client.api import VmApi

config = ntnx_vmm_py_client.Configuration()
config.host = "prism-central.example.com"
config.port = 9440
config.username = "admin"
config.password = "password"
config.verify_ssl = False

client = ntnx_vmm_py_client.ApiClient(configuration=config)
client.add_default_header("Accept-Encoding", "gzip, deflate, br")

vm_api = VmApi(api_client=client)
```

### Multi-Namespace Client Setup

When your workflow spans multiple namespaces, create a client per namespace in a loop:

```python
import ntnx_vmm_py_client
import ntnx_prism_py_client
import ntnx_clustermgmt_py_client
import ntnx_networking_py_client

packages = {
    "vmm": ntnx_vmm_py_client,
    "prism": ntnx_prism_py_client,
    "clustermgmt": ntnx_clustermgmt_py_client,
    "networking": ntnx_networking_py_client,
}

clients = {}
for name, pkg in packages.items():
    config = pkg.Configuration()
    config.host = "prism-central.example.com"
    config.port = 9440
    config.username = "admin"
    config.password = "password"
    config.verify_ssl = False
    client = pkg.ApiClient(configuration=config)
    client.add_default_header("Accept-Encoding", "gzip, deflate, br")
    clients[name] = client

# Use each client with its namespace's API classes
from ntnx_vmm_py_client.api import VmApi
from ntnx_prism_py_client.api import TasksApi
from ntnx_clustermgmt_py_client.api import ClustersApi
from ntnx_networking_py_client.api import SubnetsApi

vm_api = VmApi(api_client=clients["vmm"])
tasks_api = TasksApi(api_client=clients["prism"])
clusters_api = ClustersApi(api_client=clients["clustermgmt"])
subnets_api = SubnetsApi(api_client=clients["networking"])
```

### API Key Auth (alternative)

```python
config = ntnx_vmm_py_client.Configuration()
config.host = "prism-central.example.com"
config.port = 9440
config.api_key = {"X-ntnx-api-key": "your-api-key-here"}
```

## Core Operations

### 1. Task Monitoring (required for ALL mutating operations)

Every create, update, delete, and power operation is asynchronous. The API returns a
`TaskReference` containing `ext_id`. You MUST poll via the prism `TasksApi` to confirm
success and retrieve created entity IDs.

```python
import time
from ntnx_prism_py_client.api import TasksApi

def wait_for_task(prism_client, task_ext_id, timeout=600, poll_interval=5):
    """Poll a Prism task until it completes, fails, or times out."""
    tasks_api = TasksApi(api_client=prism_client)
    elapsed = 0
    while elapsed < timeout:
        task = tasks_api.get_task_by_id(task_ext_id)
        status = task.data.status
        if status == "SUCCEEDED":
            return task.data
        elif status in ("FAILED", "CANCELED"):
            raise Exception(
                f"Task {task_ext_id} {status}: {task.data.error_messages}"
            )
        time.sleep(poll_interval)
        elapsed += poll_interval
    raise TimeoutError(f"Task {task_ext_id} timed out after {timeout}s")

# Usage after a mutating call:
response = vm_api.create_vm(body=vm_spec)
task_ext_id = response.data.ext_id
task_data = wait_for_task(clients["prism"], task_ext_id)

# Extract created entity ID from completed task
new_vm_ext_id = task_data.entities_affected[0].ext_id
```

### 2. ETag Concurrency (required for updates and power ops)

All update and power-state operations require optimistic concurrency via the `If-Match`
header. Fetch the resource first, extract the ETag, set the header, perform the update,
then clean up.

```python
# Step 1: Fetch resource to get ETag
response = vm_api.get_vm_by_id(extId=vm_ext_id)
vm = response.data
etag = clients["vmm"].get_etag(response)

# Step 2: Set If-Match header
clients["vmm"].add_default_header("If-Match", etag)

# Step 3: Modify and update
vm.name = "renamed-vm"
update_response = vm_api.update_vm_by_id(extId=vm_ext_id, body=vm)

# Step 4: Clean up header
clients["vmm"].default_headers.pop("If-Match", None)

# Step 5: Wait for task
task_data = wait_for_task(clients["prism"], update_response.data.ext_id)
```

### 3. OData Filtering

List operations support OData query parameters for server-side filtering, sorting, field
selection, and pagination.

```python
# Equality
_filter = "name eq 'my-vm'"

# Inequality
_filter = "name ne 'not-this'"

# String functions
_filter = "contains(name, 'default')"
_filter = "startswith(name, 'A')"

# IN clause
_filter = "name in ('vm1','vm2')"

# Compound filters
_filter = "field1 eq 'x' and field2 eq 'y'"

# Enum values (namespace-qualified)
_filter = "type eq Prism.Config.CategoryType'USER'"

# Sorting
_orderby = "name asc"

# Field selection (reduce payload)
_select = "name,extId,powerState"

# Pagination
_limit = 50   # max 100 per page
_page = 0     # 0-indexed
```

### 4. Pagination

For large result sets, iterate through pages:

```python
def list_all(api_method, page_size=50, **kwargs):
    """Paginate through all results from a list endpoint."""
    all_items = []
    page = 0
    while True:
        response = api_method(_page=page, _limit=page_size, **kwargs)
        if response.data:
            all_items.extend(response.data)
        total = response.metadata.total_available_results
        if len(all_items) >= total or not response.data:
            break
        page += 1
    return all_items

# Usage
all_vms = list_all(vm_api.list_vms, _filter="powerState eq 'ON'")
```

### 5. Response Pattern

All SDK responses follow a consistent structure:

```python
response.data       # The result: single object, list, or TaskReference
response.metadata   # ApiResponseMetadata with .total_available_results
```

## Key Patterns

### Model Import Aliasing

Models are deeply nested in the package hierarchy. Use aliasing for readability:

```python
# VMM models
import ntnx_vmm_py_client.models.vmm.v4.ahv.config as AhvVmConfig
# AhvVmConfig.Vm.Vm(), AhvVmConfig.Disk.Disk(), AhvVmConfig.Nic.Nic()

# Networking models
import ntnx_networking_py_client.models.networking.v4.config as v4NetConfig
import ntnx_networking_py_client.models.common.v1.config as v1CommonConfig

# Prism models
import ntnx_prism_py_client.models.prism.v4.config as PrismConfig
import ntnx_prism_py_client.models.prism.v4.operations as PrismOps

# Clustermgmt models
import ntnx_clustermgmt_py_client.models.clustermgmt.v4.config as ClusterConfig
```

### Version Negotiation

Version negotiation is enabled by default. The SDK automatically handles API version
compatibility. Disable if needed:

```python
client = ntnx_vmm_py_client.ApiClient(
    configuration=config,
    allow_version_negotiation=False
)
```

### Auto-Retry

The SDK automatically retries on transient errors: HTTP 408, 429, 502, 503, and 302.
Backoff formula: `backoff_factor * (2 * (retries - 1))`

Defaults: 5 retries with factor 3 = waits of 0, 3, 6, 12, 24 seconds.

## Common Mistakes

1. **Forgetting ETag for updates** -- All update and power operations require fetching
   the resource first to get the ETag via `client.get_etag(response)`, then setting the
   `If-Match` header. Without it, the API returns 412 Precondition Failed.

2. **Not monitoring tasks** -- ALL mutating operations (create, update, delete, power)
   are asynchronous and return a `TaskReference`. You MUST poll via prism `TasksApi` to
   confirm completion. The operation is not done when the API call returns.

3. **Using wrong import paths** -- Models are deeply nested. Use aliasing:
   `import ntnx_vmm_py_client.models.vmm.v4.ahv.config as AhvVmConfig`

4. **Missing Accept-Encoding header** -- Always add
   `client.add_default_header("Accept-Encoding", "gzip, deflate, br")` for compressed
   responses. Large list queries can be 10x smaller with compression.

5. **Sharing Configuration across namespaces** -- Each namespace needs its own
   `Configuration()` and `ApiClient()` instance. They are not interchangeable.

6. **Not cleaning up If-Match header** -- After an update call, remove the `If-Match`
   header with `client.default_headers.pop("If-Match", None)` or subsequent calls to
   the same client will send a stale ETag.

7. **Exceeding page size** -- `_limit` maximum is 100. Requesting more silently caps
   at 100. Use pagination for full result sets.

## Namespace Reference

| Namespace | Package | Version | Key APIs | Methods | Models |
|-----------|---------|---------|----------|---------|--------|
| vmm | ntnx_vmm_py_client | 4.2.1 | VmApi (69), ImagesApi, TemplatesApi | 179 | 714 |
| prism | ntnx_prism_py_client | 4.2.1 | TasksApi, CategoriesApi, BatchesApi | 37 | 297 |
| clustermgmt | ntnx_clustermgmt_py_client | 4.2.1 | ClustersApi (47), StorageContainersApi | 84 | 551 |
| networking | ntnx_networking_py_client | 4.2.1 | SubnetsApi, VpcsApi, FloatingIpsApi | 118 | 663 |
| lifecycle | ntnx_lifecycle_py_client | 4.2.1 | EntitiesApi, InventoryApi, UpgradesApi | 29 | 198 |
| microseg | ntnx_microseg_py_client | 4.2.1 | NetworkSecurityPoliciesApi | 33 | 111 |
| datapolicies | ntnx_datapolicies_py_client | 4.2.1 | ProtectionPoliciesApi, RecoveryPlansApi | 43 | 158 |
| dataprotection | ntnx_dataprotection_py_client | 4.2.1 | RecoveryPointsApi, ConsistencyGroupsApi | 31 | 117 |
| volumes | ntnx_volumes_py_client | 4.2.1 | VolumeGroupsApi (25) | 30 | 87 |
| licensing | ntnx_licensing_py_client | 4.3.1 | LicensesApi, LicenseKeysApi | 19 | 72 |
| monitoring | ntnx_monitoring_py_client | 4.2.1 | AlertsApi, EventsApi, AuditsApi | 23 | 67 |
| aiops | ntnx_aiops_py_client | 4.2.1b1 | ScenariosApi, StatsApi | 18 | 40 |

**Totals: 112 API classes, 644 methods, 3,075 models**

### Excluded Namespaces (no v4.2 release available)

These namespaces do not yet have v4.2 packages and are excluded:
- iam (4.1.1b2), storage (4.0.2a3), opsmgmt (4.0.3), files (4.0.1), objects (4.0.2), security (4.1.1)

## Cross-Namespace Workflow Map

Most real-world operations span multiple namespaces. The prism namespace (TasksApi) is
required for virtually every mutating workflow.

| Workflow | Namespaces Required | Notes |
|----------|-------------------|-------|
| Create VM | vmm + clustermgmt + networking + prism | Need cluster/subnet ext_ids |
| Clone VM | vmm + prism | Clone from existing VM or template |
| VM Snapshot | vmm + dataprotection + prism | Create recovery point |
| Create Subnet | networking + clustermgmt + prism | Need cluster ext_id |
| Create VPC | networking + prism | Virtual private cloud |
| LCM Inventory | lifecycle + prism | Discover updatable entities |
| LCM Update | lifecycle + clustermgmt + prism | Upgrade AOS/AHV/firmware |
| DR Setup | datapolicies + dataprotection + prism | Protection policies + recovery plans |
| Security Policy | microseg + prism | Categories for policy rules |
| Batch Operations | prism + target namespace | BatchesApi for bulk actions |
| Alert Management | monitoring + prism | Alerts, events, audit trails |
| Capacity Planning | aiops + clustermgmt + prism | Scenarios and stats |
| Volume Management | volumes + clustermgmt + prism | iSCSI volume groups |
| License Management | licensing + prism | Apply/check cluster licenses |
| Category Tagging | prism + target namespace | Categories apply to VMs, etc. |
| ANY mutating op | + prism (TasksApi) | Always needed for task polling |

## Example: End-to-End VM Creation

This example demonstrates a complete VM creation workflow spanning four namespaces:

```python
import ntnx_vmm_py_client
import ntnx_prism_py_client
import ntnx_clustermgmt_py_client
import ntnx_networking_py_client
from ntnx_vmm_py_client.api import VmApi
from ntnx_prism_py_client.api import TasksApi
from ntnx_clustermgmt_py_client.api import ClustersApi
from ntnx_networking_py_client.api import SubnetsApi
import ntnx_vmm_py_client.models.vmm.v4.ahv.config as AhvVmConfig

# 1. Set up clients (abbreviated -- use the multi-namespace pattern above)
# clients = { "vmm": ..., "prism": ..., "clustermgmt": ..., "networking": ... }

# 2. Find cluster ext_id
clusters_api = ClustersApi(api_client=clients["clustermgmt"])
clusters = clusters_api.list_clusters(_filter="name eq 'MyCluster'")
cluster_ext_id = clusters.data[0].ext_id

# 3. Find subnet ext_id
subnets_api = SubnetsApi(api_client=clients["networking"])
subnets = subnets_api.list_subnets(_filter="name eq 'vm-network'")
subnet_ext_id = subnets.data[0].ext_id

# 4. Build VM spec
vm = AhvVmConfig.Vm.Vm()
vm.name = "my-new-vm"
vm.num_sockets = 2
vm.num_cores_per_socket = 2
vm.memory_size_bytes = 4 * 1024 * 1024 * 1024  # 4 GiB

nic = AhvVmConfig.Nic.Nic()
nic.network_info = AhvVmConfig.NicNetworkInfo.NicNetworkInfo()
nic.network_info.subnet = AhvVmConfig.SubnetReference.SubnetReference()
nic.network_info.subnet.ext_id = subnet_ext_id
vm.nics = [nic]

vm.cluster = AhvVmConfig.ClusterReference.ClusterReference()
vm.cluster.ext_id = cluster_ext_id

# 5. Create VM and wait for task
vm_api = VmApi(api_client=clients["vmm"])
response = vm_api.create_vm(body=vm)
task_data = wait_for_task(clients["prism"], response.data.ext_id)
new_vm_ext_id = task_data.entities_affected[0].ext_id

# 6. Power on (requires ETag)
get_resp = vm_api.get_vm_by_id(extId=new_vm_ext_id)
etag = clients["vmm"].get_etag(get_resp)
clients["vmm"].add_default_header("If-Match", etag)
power_resp = vm_api.power_on_vm(extId=new_vm_ext_id)
clients["vmm"].default_headers.pop("If-Match", None)
wait_for_task(clients["prism"], power_resp.data.ext_id)
```

## Further Reading

Each namespace has its own detailed reference document covering all API classes, methods,
and models. See the per-namespace docs for method signatures, request/response models,
and namespace-specific patterns.

SDK reference: `https://developers.nutanix.com/sdk-reference?namespace={ns}&version=v4.2&language=python`
