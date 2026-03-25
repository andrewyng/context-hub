---
name: nutanix-dataprotection
description: "Nutanix Data Protection Python SDK - recovery points, snapshots, consistency groups, failover (planned/unplanned/test), DR execution, restore"
metadata:
  languages: "python"
  versions: "4.2.1"
  revision: 1
  updated-on: "2026-03-16"
  source: community
  tags: "nutanix,data-protection,snapshot,recovery-point,failover,dr,disaster-recovery,consistency-group,replicate,restore"
---

# Nutanix Data Protection Python SDK v4.2.1

## Golden Rule

Package: `ntnx_dataprotection_py_client`

```python
import ntnx_dataprotection_py_client as dp_client
import ntnx_dataprotection_py_client.models.dataprotection.v4.config as v4DpConfig
import ntnx_dataprotection_py_client.models.dataprotection.v4.common as v4DpCommon
```

## Authentication Setup

```python
config = dp_client.Configuration()
config.host = "prism-central.example.com"
config.port = 9440
config.username = "admin"
config.password = "password"
config.verify_ssl = False

api_client = dp_client.ApiClient(configuration=config)
```

## API Classes (6 total)

| API Class | Methods | Purpose |
|-----------|---------|---------|
| RecoveryPointsApi | 12 | Create/list/get/delete recovery points (snapshots), replicate, restore |
| RecoveryPlanActionsApi | 5 | Execute failover (planned, unplanned, test), cleanup test failover |
| RecoveryPlanJobsApi | 5 | Monitor and manage recovery plan job execution |
| ConsistencyGroupsApi | 5 | Group VMs/volume groups for crash-consistent snapshots |
| ProtectedResourcesApi | 3 | List and get resources under protection |
| DataProtectionClusterCapabilitiesApi | 1 | Query cluster DR capabilities |

## Core Operations

### 1. Create a Recovery Point (Snapshot)

```python
rp_api = dp_client.RecoveryPointsApi(api_client=api_client)

# Create a VM recovery point
recovery_point = v4DpConfig.RecoveryPoint(
    name="pre-upgrade-snapshot",
    recovery_point_type=v4DpConfig.RecoveryPointType.CRASH_CONSISTENT,
    vm_recovery_points=[
        v4DpConfig.VmRecoveryPoint(
            vm_ext_id="vm-ext-id-here"
        )
    ],
    expiration_time="2026-04-16T00:00:00Z"
)

task_response = rp_api.create_recovery_point(body=recovery_point)
task_ext_id = task_response.data.ext_id

# Poll task to completion
task_data = wait_for_task(factory, task_ext_id, timeout=300)
# Extract recovery point ext_id from completion_details
rp_ext_id = task_data.completion_details[0].value
```

### 2. List Recovery Points

```python
rp_api = dp_client.RecoveryPointsApi(api_client=api_client)

# List all recovery points
recovery_points = rp_api.list_recovery_points()
for rp in recovery_points.data:
    print(f"RP: {rp.name}, Type: {rp.recovery_point_type}, "
          f"Created: {rp.creation_time}")

# Filter by name
filtered = rp_api.list_recovery_points(
    _filter="name eq 'pre-upgrade-snapshot'"
)
```

### 3. Get Recovery Point Details

```python
rp = rp_api.get_recovery_point_by_id(extId=rp_ext_id)
print(f"Name: {rp.data.name}")
print(f"Status: {rp.data.status}")
print(f"VM count: {len(rp.data.vm_recovery_points)}")
```

### 4. Restore from Recovery Point

```python
# Restore a VM from a recovery point
restore_spec = v4DpConfig.RecoveryPointRestoreSpec(
    vm_ext_id="vm-ext-id-here"
)

task_response = rp_api.restore_recovery_point(
    extId=rp_ext_id,
    body=restore_spec
)
wait_for_task(factory, task_response.data.ext_id, timeout=600)
```

### 5. Replicate Recovery Point to Remote Site

```python
replicate_spec = v4DpConfig.RecoveryPointReplicateSpec(
    cluster_ext_id="remote-cluster-ext-id"
)

task_response = rp_api.replicate_recovery_point(
    extId=rp_ext_id,
    body=replicate_spec
)
wait_for_task(factory, task_response.data.ext_id, timeout=1800)
```

### 6. Delete a Recovery Point

```python
# Get ETag for concurrency control
rp = rp_api.get_recovery_point_by_id(extId=rp_ext_id)
etag = rp.headers.get("ETag")

task_response = rp_api.delete_recovery_point_by_id(
    extId=rp_ext_id,
    if_match=etag
)
```

## Failover Operations

### Planned Failover

Used for scheduled DR testing or site migration. Source site is available.

```python
rpa_api = dp_client.RecoveryPlanActionsApi(api_client=api_client)

# Execute planned failover
failover_spec = v4DpConfig.PlannedFailoverSpec(
    recovery_plan_ext_id="recovery-plan-ext-id"
)

task_response = rpa_api.perform_planned_failover(body=failover_spec)
wait_for_task(factory, task_response.data.ext_id, timeout=3600)
```

### Unplanned Failover

Used when the primary site is down. Data loss may occur.

```python
failover_spec = v4DpConfig.UnplannedFailoverSpec(
    recovery_plan_ext_id="recovery-plan-ext-id"
)

task_response = rpa_api.perform_unplanned_failover(body=failover_spec)
wait_for_task(factory, task_response.data.ext_id, timeout=3600)
```

### Test Failover

Non-disruptive DR test. Creates isolated copies at the recovery site.

```python
test_spec = v4DpConfig.TestFailoverSpec(
    recovery_plan_ext_id="recovery-plan-ext-id"
)

task_response = rpa_api.perform_test_failover(body=test_spec)
wait_for_task(factory, task_response.data.ext_id, timeout=3600)

# After testing, clean up the test failover
cleanup_spec = v4DpConfig.TestFailoverCleanupSpec(
    recovery_plan_ext_id="recovery-plan-ext-id"
)
rpa_api.cleanup_test_failover(body=cleanup_spec)
```

## Recovery Plan Jobs

Monitor and manage recovery plan execution.

```python
rpj_api = dp_client.RecoveryPlanJobsApi(api_client=api_client)

# List all recovery plan jobs
jobs = rpj_api.list_recovery_plan_jobs()
for job in jobs.data:
    print(f"Job: {job.ext_id}, Status: {job.status}, "
          f"Type: {job.job_type}")

# Get details of a specific job
job = rpj_api.get_recovery_plan_job_by_id(extId=job_ext_id)
```

## Consistency Groups

Group VMs and volume groups for crash-consistent snapshots.

```python
cg_api = dp_client.ConsistencyGroupsApi(api_client=api_client)

# Create a consistency group
cg = v4DpConfig.ConsistencyGroup(
    name="app-tier-cg",
    description="Application tier VMs for consistent snapshots",
    members=[
        v4DpConfig.ConsistencyGroupMember(
            entity_ext_id="vm-ext-id-1",
            entity_type=v4DpConfig.ConsistencyGroupMemberType.VM
        ),
        v4DpConfig.ConsistencyGroupMember(
            entity_ext_id="vm-ext-id-2",
            entity_type=v4DpConfig.ConsistencyGroupMemberType.VM
        )
    ]
)

task_response = cg_api.create_consistency_group(body=cg)

# List consistency groups
groups = cg_api.list_consistency_groups()
```

## Protected Resources

```python
pr_api = dp_client.ProtectedResourcesApi(api_client=api_client)

# List all protected resources
protected = pr_api.list_protected_resources()
for resource in protected.data:
    print(f"Resource: {resource.entity_ext_id}, "
          f"Type: {resource.entity_type}, "
          f"Protection status: {resource.protection_status}")
```

## Cluster DR Capabilities

```python
cap_api = dp_client.DataProtectionClusterCapabilitiesApi(api_client=api_client)

capabilities = cap_api.get_cluster_capabilities()
```

## Key Models

| Model | Props | Description |
|-------|-------|-------------|
| RecoveryPoint | 19 | Snapshot with name, type, expiration, VM/VG references |
| VmRecoveryPoint | 19 | VM-specific recovery point data |
| RecoveryPlanJob | 20 | Execution record for a recovery plan action |
| ProtectedResource | 13 | Entity under data protection |
| ConsistencyGroup | - | Group of VMs/VGs for crash-consistent snapshots |
| PlannedFailoverSpec | - | Input for planned failover execution |
| UnplannedFailoverSpec | - | Input for unplanned (disaster) failover |
| TestFailoverSpec | - | Input for non-disruptive test failover |
| RecoveryPointRestoreSpec | - | Input for restoring from a recovery point |
| RecoveryPointReplicateSpec | - | Input for replicating to a remote cluster |

## Related: datapolicies Namespace

The `ntnx_datapolicies_py_client` package handles **policy-driven** protection:

- **ProtectionPoliciesApi**: Define RPO schedules and replication targets
- **RecoveryPlansApi**: Define ordered recovery plans for failover

Data protection (this namespace) handles **execution**: creating snapshots, running failovers, and managing recovery point lifecycle. Use both together for a complete DR solution.

## Common Mistakes

1. **Not setting expiration_time**: Recovery points without expiration accumulate and consume storage.
2. **Skipping test failover**: Always validate DR plans with test failover before relying on them.
3. **Forgetting cleanup after test failover**: Test failover creates isolated copies that consume resources until cleaned up.
4. **Insufficient timeout for replication**: Cross-site replication depends on data size and WAN bandwidth; allow generous timeouts.
5. **Missing ETag on delete**: Delete operations require the `If-Match` header with the current ETag.

## Cross-Namespace Dependencies

- **datapolicies**: Define protection policies and recovery plans that this namespace executes.
- **vmm**: VM ext_ids referenced in recovery points come from the vmm namespace.
- **volumes**: Volume group ext_ids for VG-level protection.
- **clustermgmt**: Remote cluster ext_ids for replication targets.
- **prism (TasksApi)**: Poll async task completion.
