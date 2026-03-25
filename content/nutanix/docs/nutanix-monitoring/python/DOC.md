---
name: nutanix-monitoring
description: "Nutanix Monitoring Python SDK - alerts, events, audits, alert policies, alert email configuration, cluster logs, health checks"
metadata:
  languages: "python"
  versions: "4.2.1"
  revision: 1
  updated-on: "2026-03-16"
  source: community
  tags: "nutanix,monitoring,alerts,events,audits,health-check,alert-policy"
---

# Nutanix Monitoring Python SDK v4.2.1

## Golden Rule

Package: `ntnx_monitoring_py_client`

```python
import ntnx_monitoring_py_client as mon_client
```

## Authentication Setup

```python
config = mon_client.Configuration()
config.host = "prism-central.example.com"
config.port = 9440
config.username = "admin"
config.password = "password"
config.verify_ssl = False

api_client = mon_client.ApiClient(configuration=config)
```

## API Classes (9 total, 22 methods)

| API Class | Methods | Purpose |
|-----------|---------|---------|
| AlertsApi | 2 | Get and list alerts |
| EventsApi | 2 | Get and list events |
| AuditsApi | 2 | Get and list audit records |
| UserDefinedPoliciesApi | 6 | CRUD for user-defined alert policies, find conflicts |
| SystemDefinedPoliciesApi | 5 | Get/list system-defined alert policies, manage per-cluster config |
| ManageAlertsApi | 1 | Acknowledge, resolve, or auto-resolve alerts |
| AlertEmailConfigurationApi | 2 | Get and update alert email notification settings |
| ClusterLogsApi | 2 | Collect cluster logs and list available tags |
| SystemDefinedChecksApi | 1 | Run system-defined health checks on demand |

## Core Operations

### 1. List Alerts

```python
alerts_api = mon_client.AlertsApi(api_client=api_client)

# List all alerts
alerts = alerts_api.list_alerts()
for alert in alerts.data:
    print(f"Alert: {alert.title}, Severity: {alert.severity}, "
          f"Resolved: {alert.is_resolved}")

# Filter by severity
critical_alerts = alerts_api.list_alerts(
    _filter="severity eq 'CRITICAL'"
)

# Filter unresolved alerts
unresolved = alerts_api.list_alerts(
    _filter="isResolved eq false"
)

# Order by creation time, most recent first
recent = alerts_api.list_alerts(
    _orderby="creationTime desc",
    _limit=10
)
```

### 2. Get Alert Details

```python
alert = alerts_api.get_alert_by_id(extId=alert_ext_id)
print(f"Title: {alert.data.title}")
print(f"Severity: {alert.data.severity}")
print(f"Source: {alert.data.source_entity}")
print(f"Created: {alert.data.creation_time}")
print(f"Message: {alert.data.alert_message}")
```

### 3. Manage Alerts (Acknowledge/Resolve)

```python
manage_api = mon_client.ManageAlertsApi(api_client=api_client)

# Acknowledge or resolve an alert
manage_spec = mon_client.AlertActionSpec(
    alert_ext_ids=[alert_ext_id],
    action=mon_client.AlertAction.ACKNOWLEDGE
)

manage_api.manage_alert(body=manage_spec)
```

### 4. List Events

```python
events_api = mon_client.EventsApi(api_client=api_client)

events = events_api.list_events()
for event in events.data:
    print(f"Event: {event.title}, Type: {event.type}, "
          f"Created: {event.creation_time}")

# Filter by type
filtered = events_api.list_events(
    _filter="type eq 'VM_POWER_ON'"
)
```

### 5. Get Event Details

```python
event = events_api.get_event_by_id(extId=event_ext_id)
print(f"Title: {event.data.title}")
print(f"Parameters: {event.data.parameters}")
```

### 6. List Audits

```python
audits_api = mon_client.AuditsApi(api_client=api_client)

audits = audits_api.list_audits()
for audit in audits.data:
    print(f"Audit: {audit.operation_type}, User: {audit.user_name}, "
          f"Time: {audit.creation_time}")

# Filter by user
user_audits = audits_api.list_audits(
    _filter="userName eq 'admin'"
)
```

### 7. Get Audit Details

```python
audit = audits_api.get_audit_by_id(extId=audit_ext_id)
print(f"Operation: {audit.data.operation_type}")
print(f"User: {audit.data.user_name}")
print(f"Entity: {audit.data.affected_entity}")
```

## Alert Email Configuration

```python
email_api = mon_client.AlertEmailConfigurationApi(api_client=api_client)

# Get current configuration
email_config = email_api.get_alert_email_configuration()

# Update email configuration
updated_config = mon_client.AlertEmailConfiguration(
    is_enabled=True,
    email_contacts=["admin@example.com", "ops@example.com"],
    default_nutanix_email="noreply@nutanix.example.com"
)

email_api.update_alert_email_configuration(body=updated_config)
```

## User-Defined Alert Policies

Create custom alert policies based on metrics thresholds.

```python
uda_api = mon_client.UserDefinedPoliciesApi(api_client=api_client)

# Create a custom alert policy
policy = mon_client.UserDefinedPolicy(
    name="high-cpu-alert",
    description="Alert when VM CPU exceeds 90% for 30 minutes",
    is_enabled=True
)

task_response = uda_api.create_uda_policy(body=policy)

# List all user-defined policies
policies = uda_api.list_uda_policies()
for p in policies.data:
    print(f"Policy: {p.name}, Enabled: {p.is_enabled}")

# Find conflicting policies
conflicts = uda_api.find_conflicting_uda_policies(body=policy)

# Update a policy
uda_api.update_uda_policy_by_id(extId=policy_ext_id, body=updated_policy)

# Delete a policy
uda_api.delete_uda_policy_by_id(extId=policy_ext_id)
```

## System-Defined Alert Policies

```python
sda_api = mon_client.SystemDefinedPoliciesApi(api_client=api_client)

# List all system-defined policies
sda_policies = sda_api.list_sda_policies()
for p in sda_policies.data:
    print(f"Policy: {p.ext_id}")

# Get per-cluster config for a system-defined policy
cluster_configs = sda_api.list_cluster_configs_by_sda_id(
    sdaPolicyExtId=sda_policy_ext_id
)

# Update cluster-specific config (enable/disable per cluster)
sda_api.update_cluster_config_by_id(
    sdaPolicyExtId=sda_policy_ext_id,
    extId=cluster_config_ext_id,
    body=updated_cluster_config
)
```

## Cluster Log Collection

```python
logs_api = mon_client.ClusterLogsApi(api_client=api_client)

# List available log tags
tags = logs_api.list_tags()

# Collect cluster logs (returns a task)
log_spec = mon_client.LogCollectionSpec(
    cluster_ext_ids=["cluster-ext-id"]
)

task_response = logs_api.collect_logs(body=log_spec)
wait_for_task(factory, task_response.data.ext_id, timeout=600)
```

## System-Defined Health Checks

```python
checks_api = mon_client.SystemDefinedChecksApi(api_client=api_client)

# Run health checks on demand
task_response = checks_api.run_system_defined_checks()
```

## Key Models

| Model | Props | Description |
|-------|-------|-------------|
| Alert | 31 | Alert with title, severity, source entity, resolution status, message |
| UserDefinedPolicy | 17 | Custom alert policy with thresholds and conditions |
| SystemDefinedPolicy | 17 | Built-in alert policy (read-only definition, per-cluster config) |
| Event | 16 | System event with type, title, parameters |
| Audit | 16 | Audit record: operation, user, entity, timestamp |
| AlertEmailConfiguration | 14 | Email notification settings for alerts |

## Common Mistakes

1. **Not filtering alerts**: Without filters, `list_alerts` returns all alerts including resolved ones. Use `_filter="isResolved eq false"` for active alerts.
2. **Confusing events and alerts**: Events are informational records of what happened. Alerts are actionable notifications requiring attention.
3. **Not using pagination**: Large clusters generate many alerts/events. Use `_page` and `_limit` for efficient retrieval.
4. **Ignoring audit trail**: Audits are essential for compliance. Filter by time range and user for security investigations.

## Cross-Namespace Dependencies

- **clustermgmt**: Cluster ext_ids for log collection and per-cluster alert policy configuration.
- **prism (TasksApi)**: Poll async tasks for log collection and health checks.
- **vmm**: VM ext_ids referenced in alert source entities.
