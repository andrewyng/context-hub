---
name: nutanix-prism
description: "Nutanix Prism Python SDK - task monitoring, categories, batch operations, Prism Central management (foundational namespace for all Nutanix SDK operations)"
metadata:
  languages: "python"
  versions: "4.2.1"
  revision: 1
  updated-on: "2026-03-16"
  source: community
  tags: "nutanix,prism,tasks,categories,batch,prism-central,domain-manager"
---

# Nutanix Prism Python SDK v4.2.1

The Prism namespace is the **foundational namespace** required by ALL other Nutanix SDK namespaces. Every mutating operation across the entire Nutanix v4 SDK (VMM, Clustermgmt, Networking, etc.) returns a `TaskReference` that must be polled via the Prism `TasksApi`. This namespace also provides category management, batch operations, and Prism Central domain management.

## Golden Rule

- **Package**: `ntnx_prism_py_client`
- **Install**: `pip install ntnx-prism-py-client==4.2.1`
- **CRITICAL**: This namespace is REQUIRED by ALL other Nutanix SDK namespaces for monitoring async tasks.
- **SDK Reference**: https://developers.nutanix.com/sdk-reference?namespace=prism&version=v4.2&language=python

## Installation

```bash
pip install ntnx-prism-py-client==4.2.1
```

## Initialization

```python
from ntnx_prism_py_client import Configuration, ApiClient
from ntnx_prism_py_client.api import TasksApi, CategoriesApi, BatchesApi

config = Configuration()
config.host = "prism-central.example.com"
config.port = 9440
config.username = "admin"
config.password = "password"
config.verify_ssl = False

client = ApiClient(configuration=config)
client.add_default_header("Accept-Encoding", "gzip, deflate, br")

tasks_api = TasksApi(api_client=client)
categories_api = CategoriesApi(api_client=client)
batches_api = BatchesApi(api_client=client)
```

## Core Operations

### 1. Task Monitoring (wait_for_task pattern)

This is the most important pattern in the entire Nutanix SDK. Every create, update, delete, and power operation across all namespaces returns a `TaskReference`. You must poll the task to confirm completion and extract the created entity's UUID.

```python
import time
from ntnx_prism_py_client.api import TasksApi

tasks_api = TasksApi(api_client=client)

def wait_for_task(tasks_api, task_ext_id, timeout=600, poll_interval=5):
    """Poll a task until completion or timeout."""
    elapsed = 0
    while elapsed < timeout:
        task = tasks_api.get_task_by_id(task_ext_id, async_req=False)
        status = task.data.status

        if status == "SUCCEEDED":
            return task.data
        elif status == "FAILED":
            error_msgs = task.data.error_messages or []
            errors = "; ".join(str(e) for e in error_msgs)
            raise RuntimeError(
                f"Task {task_ext_id} failed: {errors}"
            )
        elif status == "CANCELLED":
            raise RuntimeError(f"Task {task_ext_id} was cancelled")

        # Still RUNNING or QUEUED
        time.sleep(poll_interval)
        elapsed += poll_interval

    raise TimeoutError(f"Task {task_ext_id} did not complete within {timeout}s")


# Usage after any mutating SDK call:
# response = vm_api.create_vm(body=vm, async_req=False)
# task_ext_id = response.data.ext_id
# completed_task = wait_for_task(tasks_api, task_ext_id)
# new_entity_id = completed_task.entities_affected[0].ext_id
```

### 2. Create a Category

```python
import ntnx_prism_py_client
from ntnx_prism_py_client.models.prism.v4.config.Category import Category
from ntnx_prism_py_client.models.prism.v4.config.CategoryType import CategoryType

categories_api = ntnx_prism_py_client.api.CategoriesApi(api_client=client)

new_category = Category(
    key="Environment",
    value="Production",
    description="Production environment category",
    type=CategoryType.USER,
)

result = categories_api.create_category(async_req=False, body=new_category)
category_ext_id = result.data.ext_id
print(f"Created category: {category_ext_id}")
```

### 3. List Categories with OData Filter

```python
# List USER categories, excluding Calm-managed ones
category_list = categories_api.list_categories(
    async_req=False,
    _filter="type eq Prism.Config.CategoryType'USER' and not contains(key, 'Calm')",
)

total = category_list.metadata.total_available_results
for cat in category_list.data:
    print(f"Key: {cat.key}, Value: {cat.value}, ext_id: {cat.ext_id}")

# Other filter examples:
#   _filter="key eq 'Environment'"
#   _filter="startswith(key, 'App')"
#   _filter="value in ('Production','Staging')"
```

### 4. Batch CREATE Operation (create multiple VMs)

Batch operations let you submit multiple API calls in a single request. The `uri` field specifies which API endpoint to target, and each payload item contains the request body.

```python
import ntnx_vmm_py_client.models.vmm.v4.ahv.config as AhvVmConfig
from ntnx_prism_py_client.models.prism.v4.operations.BatchSpec import BatchSpec
from ntnx_prism_py_client.models.prism.v4.operations.BatchSpecMetadata import BatchSpecMetadata
from ntnx_prism_py_client.models.prism.v4.operations.BatchSpecPayload import BatchSpecPayload
from ntnx_prism_py_client.models.prism.v4.operations.ActionType import ActionType

batches_api = ntnx_prism_py_client.api.BatchesApi(api_client=client)

# Build one payload per VM to create
payloads = []
for i in range(5):
    vm = AhvVmConfig.Vm.Vm(
        name=f"batch-vm-{i}",
        num_sockets=1,
        num_cores_per_socket=1,
        memory_size_bytes=1073741824,  # 1 GiB
        cluster=AhvVmConfig.ClusterReference.ClusterReference(
            ext_id="<cluster-uuid>"
        ),
    )
    payloads.append(BatchSpecPayload(data=vm))

batch_spec = BatchSpec(
    metadata=BatchSpecMetadata(
        action=ActionType.CREATE,
        name="batch-vm-create",
        uri="/api/vmm/v4.2/ahv/config/vms",
        stop_on_error=True,
        chunk_size=20,
    ),
    payload=payloads,
)

response = batches_api.submit_batch(async_req=False, body=batch_spec)
batch_task_ext_id = response.data.ext_id
# Poll this task via TasksApi -- sub_tasks will contain per-item results
```

### 5. Batch ACTION Operation (assign categories with per-item ETags)

ACTION batches target operations that require path parameters and ETags for each item. The `uri` uses `{paramName}` placeholders, and each payload provides its own metadata with headers and path values.

```python
from ntnx_prism_py_client.models.prism.v4.operations.BatchSpecPayloadMetadata import BatchSpecPayloadMetadata
from ntnx_prism_py_client.models.prism.v4.operations.BatchSpecPayloadMetadataHeader import BatchSpecPayloadMetadataHeader
from ntnx_prism_py_client.models.prism.v4.operations.BatchSpecPayloadMetadataPath import BatchSpecPayloadMetadataPath
from ntnx_vmm_py_client.models.vmm.v4.ahv.config.AssociateVmCategoriesParams import AssociateVmCategoriesParams
from ntnx_vmm_py_client.models.vmm.v4.ahv.config.CategoryReference import CategoryReference

vm_api = ntnx_vmm_py_client.api.VmApi(api_client=vmm_client)

# Build per-item payloads with individual ETags and path params
payloads = []
for vm in vm_list.data:
    # Each item needs its own ETag from a fresh GET
    existing = vm_api.get_vm_by_id(vm.ext_id, async_req=False)
    etag = vmm_client.get_etag(existing)

    payloads.append(BatchSpecPayload(
        data=AssociateVmCategoriesParams(
            categories=[CategoryReference(ext_id="<category-uuid>")]
        ),
        metadata=BatchSpecPayloadMetadata(
            headers=[
                BatchSpecPayloadMetadataHeader(name="If-Match", value=etag)
            ],
            path=[
                BatchSpecPayloadMetadataPath(name="extId", value=vm.ext_id)
            ],
        ),
    ))

batch_spec = BatchSpec(
    metadata=BatchSpecMetadata(
        action=ActionType.ACTION,
        name="assign-categories",
        stop_on_error=True,
        chunk_size=1,
        # URI with {extId} placeholder filled per-item from path metadata
        uri="/api/vmm/v4.2/ahv/config/vms/{extId}/$actions/associate-categories",
    ),
    payload=payloads,
)

response = batches_api.submit_batch(async_req=False, body=batch_spec)
batch_task_ext_id = response.data.ext_id
```

## Batch URI Format Reference

The `uri` in `BatchSpecMetadata` must match the v4.2 API path. Common patterns:

| Operation | Action Type | URI Pattern |
|-----------|-------------|-------------|
| Create VMs | CREATE | `/api/vmm/v4.2/ahv/config/vms` |
| Create subnets | CREATE | `/api/networking/v4.2/config/subnets` |
| Create categories | CREATE | `/api/prism/v4.2/config/categories` |
| Associate VM categories | ACTION | `/api/vmm/v4.2/ahv/config/vms/{extId}/$actions/associate-categories` |
| Power on VMs | ACTION | `/api/vmm/v4.2/ahv/config/vms/{extId}/$actions/power-on` |
| Update VMs | UPDATE | `/api/vmm/v4.2/ahv/config/vms/{extId}` |

## Key Patterns

### Task Status Values

```python
# Task status progression:
# QUEUED -> RUNNING -> SUCCEEDED | FAILED | CANCELLED
#
# task.data.status values:
#   "QUEUED"    - waiting to start
#   "RUNNING"   - in progress
#   "SUCCEEDED" - completed successfully
#   "FAILED"    - completed with error
#   "CANCELLED" - cancelled by user
```

### Extracting Created Entity ID from Task

```python
task = tasks_api.get_task_by_id(task_ext_id, async_req=False)
if task.data.status == "SUCCEEDED":
    # The created/affected entity UUID
    entity_id = task.data.entities_affected[0].ext_id
    entity_type = task.data.entities_affected[0].rel  # e.g., "vmm:ahv:config:vm"
```

### Batch Task Hierarchy

Batch operations create a parent task with sub-tasks for each item:

```python
parent_task = tasks_api.get_task_by_id(batch_task_ext_id, async_req=False)
# parent_task.data.sub_tasks -> list of TaskReferenceInternal
# parent_task.data.number_of_subtasks -> int
# Each sub-task can be polled individually
for sub in parent_task.data.sub_tasks:
    sub_task = tasks_api.get_task_by_id(sub.ext_id, async_req=False)
    print(f"Sub-task {sub.ext_id}: {sub_task.data.status}")
```

## API Classes Summary

| Class | Methods | Purpose |
|-------|---------|---------|
| TasksApi | 6 | Task monitoring -- used by ALL namespaces. `get_task_by_id`, `list_tasks`, `cancel_task`, `list_task_entities`, `list_task_jobs`, `get_task_job_by_id` |
| CategoriesApi | 5 | Category CRUD -- `create_category`, `get_category_by_id`, `list_categories`, `update_category_by_id`, `delete_category_by_id` |
| BatchesApi | 3 | Batch operations -- `submit_batch`, `get_batch_by_id`, `list_batches` |
| DomainManagerApi | 8 | Prism Central management -- register/unregister PEs, manage products |
| DomainManagerBackupsApi | 12 | PC backup/restore -- backup targets, restore sources, restore points |
| RegistrationApi | 2 | PE registration queries -- `get_registration_by_id`, `list_registrations` |
| ExternalStoragesApi | 1 | External storage info -- `get_external_storage_by_id` |

**Total: 7 API classes, 37 methods**

## Key Models

### Task (`prism.v4.config.Task`) -- 30 properties

| Property | Type | Notes |
|----------|------|-------|
| `ext_id` | str | Task UUID |
| `operation` | str | Operation name |
| `operation_description` | str | Human-readable description |
| `status` | TaskStatus | QUEUED, RUNNING, SUCCEEDED, FAILED, CANCELLED |
| `progress_percentage` | int | 0-100 |
| `created_time` | datetime | When task was created |
| `started_time` | datetime | When execution began |
| `completed_time` | datetime | When task finished |
| `entities_affected` | list[EntityReference] | Created/modified entities (ext_id + rel) |
| `sub_tasks` | list[TaskReferenceInternal] | Child tasks (for batch ops) |
| `sub_steps` | list[TaskStep] | Step-by-step progress |
| `error_messages` | list[AppMessage] | Error details on failure |
| `is_cancelable` | bool | Whether task supports cancellation |
| `cluster_ext_ids` | list[str] | Clusters involved |
| `number_of_subtasks` | int | Count of sub-tasks |

### Category (`prism.v4.config.Category`) -- 13 properties

| Property | Type | Notes |
|----------|------|-------|
| `key` | str | Category key (e.g., "Environment") |
| `value` | str | Category value (e.g., "Production") |
| `type` | CategoryType | USER or SYSTEM |
| `description` | str | |
| `owner_uuid` | str | Owner user UUID |
| `associations` | list[AssociationSummary] | What entities use this category |
| `ext_id` | str | Category UUID |

### BatchSpec (`prism.v4.operations.BatchSpec`)

| Property | Type | Notes |
|----------|------|-------|
| `metadata` | BatchSpecMetadata | Action type, URI, name, stop_on_error, chunk_size |
| `payload` | list[BatchSpecPayload] | List of per-item request bodies |

### BatchSpecMetadata (`prism.v4.operations.BatchSpecMetadata`)

| Property | Type | Notes |
|----------|------|-------|
| `action` | ActionType | CREATE, UPDATE, DELETE, ACTION |
| `name` | str | Batch operation name |
| `uri` | str | API endpoint path (with `{param}` placeholders for ACTION/UPDATE) |
| `stop_on_error` | bool | Halt on first failure |
| `chunk_size` | int | Number of items to process in parallel |

### BatchSpecPayload (`prism.v4.operations.BatchSpecPayload`)

| Property | Type | Notes |
|----------|------|-------|
| `data` | object | The request body (e.g., Vm, Category, AssociateVmCategoriesParams) |
| `metadata` | BatchSpecPayloadMetadata | Per-item headers (If-Match) and path params |

### DomainManager (`prism.v4.config.DomainManager`) -- 13 properties

| Property | Type | Notes |
|----------|------|-------|
| `config` | DomainManagerClusterConfig | PC cluster configuration |
| `network` | DomainManagerNetwork | PC network settings |
| `hosting_cluster_ext_id` | str | PE cluster hosting this PC |
| `should_enable_high_availability` | bool | HA setting |
| `node_ext_ids` | list[str] | PC VM node UUIDs |
| `ext_id` | str | PC domain manager UUID |

## Common Mistakes

1. **Not polling tasks** -- Every mutating operation across ALL Nutanix SDK namespaces returns a TaskReference. You must use `TasksApi.get_task_by_id()` to confirm success and get created entity UUIDs.

2. **Ignoring task failure details** -- When `task.data.status == "FAILED"`, check `task.data.error_messages` for the specific error. Also check `legacy_error_message` as a fallback.

3. **Wrong URI format in batch operations** -- The `uri` must be the full v4.2 API path (e.g., `/api/vmm/v4.2/ahv/config/vms`). Using the wrong path or version results in 404 errors.

4. **Missing per-item metadata in ACTION batches** -- ACTION and UPDATE batch types require each `BatchSpecPayload` to include `metadata` with `headers` (for If-Match/ETag) and `path` (for URI parameter substitution).

5. **Category type enum syntax in filters** -- Category type filters require the fully qualified enum: `type eq Prism.Config.CategoryType'USER'`, not just `type eq 'USER'`.

## Response Pattern

```python
response.data       # Task, Category, list[Category], BatchSpec, etc.
response.metadata   # ApiResponseMetadata
                    #   .total_available_results (int, for list calls)
                    #   .flags, .links, .messages
```
