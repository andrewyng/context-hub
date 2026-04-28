---
name: nutanix-datapolicies
description: "Nutanix Data Policies Python SDK - protection policies, recovery plans, storage policies, RPO/retention configuration, DR planning"
metadata:
  languages: "python"
  versions: "4.2.1"
  revision: 1
  updated-on: "2026-03-16"
  source: community
  tags: "nutanix,data-policies,protection-policy,recovery-plan,storage-policy,rpo,retention,dr"
---

# Nutanix Data Policies Python SDK v4.2.1

## Golden Rule

Package: `ntnx_datapolicies_py_client`

```python
import ntnx_datapolicies_py_client as dp_client
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

## API Classes (4 total, 43 methods)

| API Class | Methods | Purpose |
|-----------|---------|---------|
| ProtectionPoliciesApi | 10 | Create/update/delete protection policies and consistency rules |
| RecoveryPlansApi | 25 | Create/manage recovery plans, network mappings, recovery stages, recovery settings |
| StoragePoliciesApi | 5 | Create/update/delete storage policies (compression, encryption, QoS) |
| EntitySyncPoliciesApi | 3 | Sync entities to remote domain managers |

## Core Operations

### 1. Create a Protection Policy

Protection policies define RPO schedules, replication targets, and retention for VMs/categories.

```python
pp_api = dp_client.ProtectionPoliciesApi(api_client=api_client)

protection_policy = dp_client.ProtectionPolicy(
    name="gold-tier-protection",
    description="RPO 1 hour with cross-site replication"
)

task_response = pp_api.create_protection_policy(body=protection_policy)
task_ext_id = task_response.data.ext_id

# Poll task to completion
task_data = wait_for_task(prism_client, task_ext_id, timeout=120)
pp_ext_id = task_data.completion_details[0].value
```

### 2. Add a Consistency Rule to a Protection Policy

Consistency rules define the RPO schedule and replication configuration within a policy.

```python
consistency_rule = dp_client.ConsistencyRule(
    schedule=dp_client.Schedule(
        snapshot_interval_type=dp_client.SnapshotIntervalType.HOURLY
    ),
    replication_configurations=[
        dp_client.ReplicationConfiguration(
            replication_location=dp_client.ReplicationLocation(
                replication_sub_location=dp_client.NutanixCluster(
                    cluster_ext_id="remote-cluster-ext-id"
                )
            )
        )
    ]
)

task_response = pp_api.create_consistency_rule(
    protectionPolicyExtId=pp_ext_id,
    body=consistency_rule
)
```

### 3. List Protection Policies

```python
pp_api = dp_client.ProtectionPoliciesApi(api_client=api_client)

policies = pp_api.list_protection_policies()
for policy in policies.data:
    print(f"Policy: {policy.name}, ID: {policy.ext_id}")

# Filter by name
filtered = pp_api.list_protection_policies(
    _filter="name eq 'gold-tier-protection'"
)
```

### 4. Create a Recovery Plan

Recovery plans define the ordered sequence for recovering VMs/apps during failover.

```python
rp_api = dp_client.RecoveryPlansApi(api_client=api_client)

recovery_plan = dp_client.RecoveryPlan(
    name="app-tier-recovery-plan",
    description="Recovery plan for application tier"
)

task_response = rp_api.create_recovery_plan(body=recovery_plan)
task_ext_id = task_response.data.ext_id

task_data = wait_for_task(prism_client, task_ext_id, timeout=120)
rp_ext_id = task_data.completion_details[0].value
```

### 5. Add Network Mapping to Recovery Plan

Network mappings define how source networks map to target networks at the recovery site.

```python
network_mapping = dp_client.NetworkMapping(
    name="prod-to-dr-mapping"
)

task_response = rp_api.create_network_mapping(
    recoveryPlanExtId=rp_ext_id,
    body=network_mapping
)
```

### 6. Add Recovery Stage to Recovery Plan

Recovery stages define ordered groups of entities to recover (boot order).

```python
recovery_stage = dp_client.RecoveryStage(
    stage_action=dp_client.StageAction(
        delay_action=dp_client.DelayAction(
            delay_seconds=30
        )
    )
)

task_response = rp_api.create_recovery_stage(
    recoveryPlanExtId=rp_ext_id,
    body=recovery_stage
)
```

### 7. Add Recovery Setting to Recovery Plan

```python
recovery_setting = dp_client.RecoverySetting()

task_response = rp_api.create_recovery_setting(
    recoveryPlanExtId=rp_ext_id,
    body=recovery_setting
)
```

### 8. List Recovery Plans

```python
plans = rp_api.list_recovery_plans()
for plan in plans.data:
    print(f"Plan: {plan.name}, ID: {plan.ext_id}")
```

## Storage Policies

Storage policies configure compression, encryption, and QoS for storage containers.

```python
sp_api = dp_client.StoragePoliciesApi(api_client=api_client)

storage_policy = dp_client.StoragePolicy(
    name="high-performance-policy",
    compression_spec=dp_client.CompressionSpec(
        compression_state=dp_client.CompressionState.INLINE
    ),
    encryption_spec=dp_client.EncryptionSpec(
        encryption_state=dp_client.EncryptionState.ENABLED
    )
)

task_response = sp_api.create_storage_policy(body=storage_policy)

# List storage policies
policies = sp_api.list_storage_policies()
```

## Entity Sync Policies

Sync configuration entities (categories, protection policies) to remote Prism Central instances.

```python
esp_api = dp_client.EntitySyncPoliciesApi(api_client=api_client)

# List entity sync policies
sync_policies = esp_api.list_entity_sync_policies()
for sp in sync_policies.data:
    print(f"Sync Policy: {sp.ext_id}")

# Trigger sync for a specific policy
esp_api.sync_entity_sync_policy_by_id(extId=sync_policy_ext_id)
```

## Key Models

| Model | Props | Description |
|-------|-------|-------------|
| ProtectionPolicy | 10 | Top-level policy: name, description, entity assignments |
| RecoveryPlan | 9 | DR recovery plan with stages, network mappings, settings |
| StoragePolicy | 10 | Compression, encryption, QoS, replication factor settings |
| RecoveryStage | 8 | Ordered group of entities to recover in a plan |
| NetworkMapping | 8 | Source-to-target network mapping for DR failover |
| Schedule | 8 | RPO schedule with interval type and retention |
| ConsistencyRule | 5 | Schedule + replication config within a protection policy |
| RecoverySetting | 5 | Recovery-specific settings within a plan |
| ReplicationConfiguration | 3 | Defines replication target location |

## Common Mistakes

1. **Confusing datapolicies with dataprotection**: This namespace defines *policies and plans*. The `dataprotection` namespace *executes* failovers and creates snapshots.
2. **Missing network mappings in recovery plans**: Recovery plans without network mappings will fail during failover if VMs need different networks at the recovery site.
3. **Forgetting recovery stages**: Without stages, the recovery plan has no ordered boot sequence for VMs.
4. **Not syncing entity policies**: When using multi-site PC-PC setups, entity sync policies must be configured to replicate protection policies to the remote Prism Central.
5. **Missing ETag on updates/deletes**: Update and delete operations require the `If-Match` header with the current ETag.

## Cross-Namespace Dependencies

- **dataprotection**: Executes the policies and plans defined here (failover, snapshots, restore).
- **clustermgmt**: Remote cluster ext_ids for replication targets.
- **prism (CategoriesApi)**: Category ext_ids used in protection policy entity assignments.
- **prism (TasksApi)**: Poll async task completion.
- **networking**: Subnet ext_ids for network mappings in recovery plans.
