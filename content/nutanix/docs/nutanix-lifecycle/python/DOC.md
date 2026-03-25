---
name: nutanix-lifecycle
description: "Nutanix Lifecycle Management (LCM) Python SDK - firmware/software updates, AOS upgrades, inventory, upgrade prechecks, recommendations, bundles"
metadata:
  languages: "python"
  versions: "4.2.1"
  revision: 1
  updated-on: "2026-03-16"
  source: community
  tags: "nutanix,lcm,lifecycle,firmware,upgrade,inventory,precheck,recommendation,bundle"
---

# Nutanix Lifecycle Management (LCM) Python SDK v4.2.1

## Golden Rule

Package: `ntnx_lifecycle_py_client`

```python
import ntnx_lifecycle_py_client as lifecycle_client
import ntnx_lifecycle_py_client.models.lifecycle.v4.common as v4LifecycleCommon
import ntnx_lifecycle_py_client.models.lifecycle.v4.resources as v4LifecycleResources
```

## CRITICAL: X_Cluster_Id Header Required

All LCM API calls require the `X_Cluster_Id` header targeting the specific Prism Element cluster.
Omitting this header will result in errors. Obtain the cluster ext_id from the clustermgmt namespace.

```python
# Every LCM call needs this parameter
result = inventory_api.perform_inventory(X_Cluster_Id=cluster_ext_id)
```

## Authentication Setup

```python
config = lifecycle_client.Configuration()
config.host = "prism-central.example.com"
config.port = 9440
config.username = "admin"
config.password = "password"
config.verify_ssl = False

api_client = lifecycle_client.ApiClient(configuration=config)
```

## API Classes (13 total)

| API Class | Methods | Purpose |
|-----------|---------|---------|
| InventoryApi | 1 | Trigger LCM inventory scan |
| RecommendationsApi | 2 | Compute and retrieve upgrade recommendations |
| NotificationsApi | 2 | Compute and retrieve upgrade notifications/warnings |
| UpgradesApi | 1 | Perform firmware/software upgrades |
| EntitiesApi | 4 | List/get LCM-managed entities (firmware, software) |
| BundlesApi | 4 | Upload/manage LCM update bundles |
| PrechecksApi | 1 | Run upgrade prechecks before applying updates |
| FrameworkConfigApi | 2 | LCM framework configuration |
| ModuleConfigApi | 3 | Per-module LCM configuration |
| StatusApi | 1 | LCM operation status |
| ResourceConfigApi | 3 | Resource-level LCM configuration |
| NodePrioritiesApi | 3 | Node upgrade ordering |
| SystemAutoMgmtApi | 3 | Automatic update management settings |

## Core Workflow: 4-Step LCM Upgrade

### Step 1: Run Inventory

Inventory discovers all manageable entities (firmware, AOS, hypervisor, etc.) on the target cluster.

```python
inventory_api = lifecycle_client.InventoryApi(api_client=api_client)

# Trigger inventory - returns a task
task_response = inventory_api.perform_inventory(X_Cluster_Id=cluster_ext_id)
task_ext_id = task_response.data.ext_id

# Poll task to completion (inventory can take 5-15 minutes)
wait_for_task(factory, task_ext_id, timeout=900)
```

### Step 2: Get Recommendations

After inventory completes, compute what updates are available.

```python
rec_api = lifecycle_client.RecommendationsApi(api_client=api_client)

# Build recommendation spec - empty spec gets all available updates
rec_spec = v4LifecycleResources.RecommendationSpec()

# Compute recommendations
task_response = rec_api.compute_recommendations(
    body=rec_spec,
    X_Cluster_Id=cluster_ext_id
)
task_ext_id = task_response.data.ext_id

# Poll task - CRITICAL: extract recommendation_id from completion_details
task_data = wait_for_task(factory, task_ext_id, timeout=300)
recommendation_id = task_data.completion_details[0].value
```

To retrieve the full recommendation details:

```python
recommendation = rec_api.get_recommendation_by_id(
    extId=recommendation_id,
    X_Cluster_Id=cluster_ext_id
)
# Inspect recommended entities and target versions
for entity_rec in recommendation.data.entity_update_specs:
    print(f"Entity: {entity_rec.entity_ext_id}, Target: {entity_rec.target_version}")
```

### Step 3: Compute Notifications (Pre-upgrade Warnings)

Check for any warnings or required actions before upgrading.

```python
notify_api = lifecycle_client.NotificationsApi(api_client=api_client)

notify_spec = v4LifecycleResources.NotificationsSpec(
    recommendation_ext_id=recommendation_id
)

task_response = notify_api.compute_notifications(
    body=notify_spec,
    X_Cluster_Id=cluster_ext_id
)
task_ext_id = task_response.data.ext_id

# Poll task
task_data = wait_for_task(factory, task_ext_id, timeout=300)
notification_id = task_data.completion_details[0].value

# Retrieve notifications to check warnings
notifications = notify_api.get_notification_by_id(
    extId=notification_id,
    X_Cluster_Id=cluster_ext_id
)
# Review any warnings before proceeding
if notifications.data.warnings:
    for warning in notifications.data.warnings:
        print(f"Warning: {warning.message}")
```

### Step 4: Perform Upgrade

Apply the recommended updates.

```python
upgrade_api = lifecycle_client.UpgradesApi(api_client=api_client)

upgrade_spec = v4LifecycleResources.UpgradeSpec(
    recommendation_ext_id=recommendation_id
)

task_response = upgrade_api.perform_upgrade(
    body=upgrade_spec,
    X_Cluster_Id=cluster_ext_id
)
task_ext_id = task_response.data.ext_id

# Poll task - upgrades can take 30-120+ minutes depending on scope
wait_for_task(factory, task_ext_id, timeout=7200)
```

## Entity Management

### List All LCM Entities

```python
entities_api = lifecycle_client.EntitiesApi(api_client=api_client)

# List all managed entities on a cluster
entities = entities_api.list_entities(X_Cluster_Id=cluster_ext_id)
for entity in entities.data:
    print(f"{entity.entity_class}: {entity.entity_model} "
          f"v{entity.installed_version} -> {entity.available_version}")
```

### Get Entity by ID

```python
entity = entities_api.get_entity_by_id(
    extId=entity_ext_id,
    X_Cluster_Id=cluster_ext_id
)
```

## Bundle Management

### Upload Update Bundle (Dark Site)

For air-gapped environments, upload LCM bundles manually.

```python
bundles_api = lifecycle_client.BundlesApi(api_client=api_client)

# List existing bundles
bundles = bundles_api.list_bundles(X_Cluster_Id=cluster_ext_id)

# Upload a bundle (dark site scenario)
# bundle_spec = v4LifecycleResources.BundleSpec(...)
# bundles_api.upload_bundle(body=bundle_spec, X_Cluster_Id=cluster_ext_id)
```

## Prechecks

Run prechecks before committing to an upgrade.

```python
prechecks_api = lifecycle_client.PrechecksApi(api_client=api_client)

# Prechecks use the recommendation_id from step 2
task_response = prechecks_api.perform_prechecks(
    body=v4LifecycleResources.PrecheckSpec(
        recommendation_ext_id=recommendation_id
    ),
    X_Cluster_Id=cluster_ext_id
)
```

## Automatic Update Management

```python
auto_mgmt_api = lifecycle_client.SystemAutoMgmtApi(api_client=api_client)

# Get current auto-management settings
settings = auto_mgmt_api.get_system_auto_mgmt_config(X_Cluster_Id=cluster_ext_id)

# Update auto-management flag
flag = v4LifecycleCommon.SystemAutoMgmtFlag(is_enabled=True)
auto_mgmt_api.update_system_auto_mgmt_config(
    body=flag,
    X_Cluster_Id=cluster_ext_id
)
```

## Key Models

| Model | Description |
|-------|-------------|
| Entity | LCM-managed entity (firmware, software component) |
| RecommendationSpec | Input for computing upgrade recommendations |
| NotificationsSpec | Input for computing pre-upgrade notifications |
| UpgradeSpec | Input for performing upgrades |
| PrecheckSpec | Input for running upgrade prechecks |
| SystemAutoMgmtFlag | Toggle for automatic LCM management |
| Bundle | LCM update bundle metadata |

## Common Mistakes

1. **Forgetting X_Cluster_Id**: Every LCM API call requires this header. Without it, calls fail.
2. **Not extracting recommendation_id**: After `compute_recommendations`, the recommendation ID is in `task.completion_details[0].value`, not in the direct response.
3. **Insufficient timeout for inventory**: Inventory scans can take 15+ minutes on large clusters.
4. **Skipping prechecks**: Always run prechecks before upgrades in production.
5. **Not checking notifications**: Notifications may contain critical warnings that require manual intervention before upgrade.

## Cross-Namespace Dependencies

- **clustermgmt**: Obtain `cluster_ext_id` values via `ClustersApi.list_clusters()`
- **prism**: Poll tasks via `TasksApi.get_task_by_id()`
- **monitoring**: Check alerts after upgrades via `AlertsApi`
