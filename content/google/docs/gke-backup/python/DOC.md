---
name: gke-backup
description: "Google Cloud Backup for GKE Python client for backup plans, on-demand backups, restore plans, and restores"
metadata:
  languages: "python"
  versions: "0.7.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,gke,backup,restore,kubernetes,gcp,adc"
---

# Google Cloud Backup for GKE Python Client

## What This Package Is

`google-cloud-gke-backup` is the generated Python client for the Backup for GKE control-plane API.

Use it when Python code needs to:

- create and list backup plans
- start on-demand backups from a backup plan
- create restore plans
- start restores from existing backups

This package manages Backup for GKE resources. It does not talk to the Kubernetes API server inside your cluster.

## Version Note

This guide covers package version `0.7.0`.

As of `2026-03-13`, upstream sources are slightly out of sync:

- PyPI lists `google-cloud-gke-backup 0.7.0`
- the Cloud Python reference under `/latest/` still renders as `latest (0.6.0)`

The examples below use the current GA `gke_backup_v1` client surface shown in the generated reference. If you depend on a field added very recently, verify it against your installed wheel as well as the rolling docs site.

Official sources used for this guide:

- `https://pypi.org/project/google-cloud-gke-backup/`
- `https://github.com/googleapis/google-cloud-python/tree/main/packages/google-cloud-gke-backup`
- `https://cloud.google.com/python/docs/reference/gkebackup/latest`
- `https://cloud.google.com/python/docs/reference/gkebackup/latest/google.cloud.gke_backup_v1.services.backup_for_gke.BackupForGKEClient`
- `https://cloud.google.com/python/docs/reference/gkebackup/latest/google.cloud.gke_backup_v1.types.BackupPlan`
- `https://cloud.google.com/python/docs/reference/gkebackup/latest/google.cloud.gke_backup_v1.types.RestorePlan`
- `https://cloud.google.com/python/docs/reference/gkebackup/latest/google.cloud.gke_backup_v1.types.RestoreConfig`
- `https://cloud.google.com/kubernetes-engine/docs/add-on/backup-for-gke/how-to/get-started-kubectl`
- `https://cloud.google.com/docs/authentication/provide-credentials-adc`

## Install

Install the package version your project expects:

```bash
python -m pip install "google-cloud-gke-backup==0.7.0"
```

Common alternatives:

```bash
uv add "google-cloud-gke-backup==0.7.0"
poetry add "google-cloud-gke-backup==0.7.0"
```

## Required Setup

Before using the client:

1. Enable Backup for GKE in the target Google Cloud project.
2. Make sure the calling identity has permission to manage Backup for GKE resources.
3. Configure Application Default Credentials (ADC).

Enable the API:

```bash
gcloud services enable gkebackup.googleapis.com
```

Local development with user ADC:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="my-project"
export GOOGLE_CLOUD_BACKUP_LOCATION="us-central1"
export GOOGLE_CLOUD_GKE_CLUSTER_LOCATION="us-central1-a"
export GOOGLE_CLOUD_GKE_CLUSTER="primary"
```

Service account credentials via environment variable:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

Use a zonal value such as `us-central1-a` for `GOOGLE_CLOUD_GKE_CLUSTER_LOCATION` when the source cluster is zonal. Use a regional value such as `us-central1` when the cluster is regional.

## Imports And Client Creation

```python
import os

from google.cloud import gke_backup_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
backup_location = os.environ["GOOGLE_CLOUD_BACKUP_LOCATION"]
cluster_location = os.environ["GOOGLE_CLOUD_GKE_CLUSTER_LOCATION"]
cluster_id = os.environ["GOOGLE_CLOUD_GKE_CLUSTER"]

backup_parent = f"projects/{project_id}/locations/{backup_location}"
cluster_name = (
    f"projects/{project_id}/locations/{cluster_location}/clusters/{cluster_id}"
)

client = gke_backup_v1.BackupForGKEClient()
```

## Resource Naming

The generated client expects fully qualified resource names.

Use these formats:

- backup location parent: `projects/{project_id}/locations/{backup_location}`
- cluster name: `projects/{project_id}/locations/{cluster_location}/clusters/{cluster_id}`
- backup plan name: `projects/{project_id}/locations/{backup_location}/backupPlans/{backup_plan_id}`
- backup name: `projects/{project_id}/locations/{backup_location}/backupPlans/{backup_plan_id}/backups/{backup_id}`
- restore plan name: `projects/{project_id}/locations/{backup_location}/restorePlans/{restore_plan_id}`

Important location pitfall:

- the backup plan lives under the Backup for GKE location
- the protected cluster resource can be regional or zonal
- do not assume the plan parent and the cluster location use the same string

## Core Usage

### List backup plans

```python
from google.cloud import gke_backup_v1

client = gke_backup_v1.BackupForGKEClient()

for plan in client.list_backup_plans(parent=backup_parent):
    print(plan.name)
    print(plan.cluster)
```

### Create a backup plan

This example creates a daily backup plan that covers all namespaces and includes persistent volume data and Secrets.

```python
from google.cloud import gke_backup_v1

client = gke_backup_v1.BackupForGKEClient()

backup_plan = gke_backup_v1.BackupPlan(
    cluster=cluster_name,
    retention_policy=gke_backup_v1.BackupPlan.RetentionPolicy(
        backup_retain_days=7,
    ),
    backup_schedule=gke_backup_v1.BackupPlan.Schedule(
        cron_schedule="0 3 * * *",
    ),
    backup_config=gke_backup_v1.BackupPlan.BackupConfig(
        all_namespaces=True,
        include_volume_data=True,
        include_secrets=True,
    ),
)

operation = client.create_backup_plan(
    parent=backup_parent,
    backup_plan=backup_plan,
    backup_plan_id="daily-plan",
)

created_plan = operation.result()
print(created_plan.name)
```

`create_backup_plan()` returns a long-running operation. Call `.result()` before assuming the plan exists.

### Start an on-demand backup

An on-demand backup is created under an existing backup plan. The plan controls scope and retention, so the `Backup` request body can stay minimal.

```python
from google.cloud import gke_backup_v1

client = gke_backup_v1.BackupForGKEClient()
backup_plan_name = (
    f"{backup_parent}/backupPlans/daily-plan"
)

operation = client.create_backup(
    parent=backup_plan_name,
    backup=gke_backup_v1.Backup(),
    backup_id="before-upgrade-20260313",
)

backup = operation.result()
print(backup.name)
```

### List backups for a plan

```python
from google.cloud import gke_backup_v1

client = gke_backup_v1.BackupForGKEClient()
backup_plan_name = (
    f"{backup_parent}/backupPlans/daily-plan"
)

for backup in client.list_backups(parent=backup_plan_name):
    print(backup.name)
    print(backup.state)
```

### Create a restore plan

The restore plan points at a backup plan and describes how namespaced resources and volume data should be restored into a target cluster.

```python
from google.cloud import gke_backup_v1

client = gke_backup_v1.BackupForGKEClient()
target_cluster_name = (
    f"projects/{project_id}/locations/{cluster_location}/clusters/restore-target"
)

restore_plan = gke_backup_v1.RestorePlan(
    backup_plan=f"{backup_parent}/backupPlans/daily-plan",
    cluster=target_cluster_name,
    restore_config=gke_backup_v1.RestoreConfig(
        all_namespaces=True,
        namespaced_resource_restore_mode=(
            gke_backup_v1.RestoreConfig.NamespacedResourceRestoreMode
            .MERGE_SKIP_ON_CONFLICT
        ),
        volume_data_restore_policy=(
            gke_backup_v1.RestoreConfig.VolumeDataRestorePolicy
            .RESTORE_VOLUME_DATA_FROM_BACKUP
        ),
    ),
)

operation = client.create_restore_plan(
    parent=backup_parent,
    restore_plan=restore_plan,
    restore_plan_id="default-restore-plan",
)

created_restore_plan = operation.result()
print(created_restore_plan.name)
```

### Start a restore from a backup

```python
from google.cloud import gke_backup_v1

client = gke_backup_v1.BackupForGKEClient()
restore_plan_name = (
    f"{backup_parent}/restorePlans/default-restore-plan"
)
backup_name = (
    f"{backup_parent}/backupPlans/daily-plan/backups/before-upgrade-20260313"
)

operation = client.create_restore(
    parent=restore_plan_name,
    restore=gke_backup_v1.Restore(
        backup=backup_name,
    ),
    restore_id="restore-20260313",
)

restore = operation.result()
print(restore.name)
```

## Important Pitfalls

### Long-running operations

Create and restore calls return long-running operations. Wait for `.result()` before using the new resource in later calls.

### Backup scope is a oneof

`BackupPlan.BackupConfig` treats resource scope as a oneof. Pick exactly one of these:

- `all_namespaces`
- `selected_namespaces`
- `selected_applications`

Do not set more than one in the same request.

### Restore config requires an explicit namespaced-resource mode

`RestoreConfig.namespaced_resource_restore_mode` is required. Set it deliberately instead of relying on defaults.

### Be explicit about volume restoration

`RestoreConfig.volume_data_restore_policy` controls whether persistent volume data is restored from backup data or left alone. Set it explicitly for restore automation so behavior is obvious from code review.

### Prefer ADC over custom credential plumbing

Use ADC with `BackupForGKEClient()` for the common case. For local development, `gcloud auth application-default login` is the normal setup path. For non-interactive environments, set `GOOGLE_APPLICATION_CREDENTIALS` to a service account key only when you actually need file-based credentials.
