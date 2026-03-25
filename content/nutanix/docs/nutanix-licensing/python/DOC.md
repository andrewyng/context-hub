---
name: nutanix-licensing
description: "Nutanix Licensing Python SDK - license management, license keys, EULA, compliance, entitlements, violations"
metadata:
  languages: "python"
  versions: "4.3.1"
  revision: 1
  updated-on: "2026-03-16"
  source: community
  tags: "nutanix,licensing,license,eula,compliance,entitlement"
---

# Nutanix Licensing Python SDK v4.3.1

## Golden Rule

Package: `ntnx_licensing_py_client` (note: version 4.3.1, not 4.2.1 like most other SDK packages)

```python
import ntnx_licensing_py_client as lic_client
```

## Authentication Setup

```python
config = lic_client.Configuration()
config.host = "prism-central.example.com"
config.port = 9440
config.username = "admin"
config.password = "password"
config.verify_ssl = False

api_client = lic_client.ApiClient(configuration=config)
```

## API Classes (3 total, 19 methods)

| API Class | Methods | Purpose |
|-----------|---------|---------|
| LicensesApi | 9 | List licenses, allowances, compliances, entitlements, features, recommendations, settings, violations; sync state |
| LicenseKeysApi | 8 | Add/delete/assign/associate/reclaim license keys |
| EndUserLicenseAgreementApi | 2 | Get and accept EULA |

## Core Operations

### 1. Get EULA Status

```python
eula_api = lic_client.EndUserLicenseAgreementApi(api_client=api_client)

eula = eula_api.get_eula()
print(f"EULA accepted: {eula.data is not None}")
```

### 2. Accept EULA

```python
eula_api = lic_client.EndUserLicenseAgreementApi(api_client=api_client)

end_user = lic_client.EndUser(
    username="admin",
    company_name="Example Corp"
)

eula_api.add_user(body=end_user)
```

### 3. List Licenses

```python
lic_api = lic_client.LicensesApi(api_client=api_client)

licenses = lic_api.list_licenses()
for license in licenses.data:
    print(f"License: {license.ext_id}, Type: {license.license_type}")
```

### 4. List License Keys

```python
lk_api = lic_client.LicenseKeysApi(api_client=api_client)

keys = lk_api.list_license_keys()
for key in keys.data:
    print(f"Key: {key.ext_id}, Status: {key.status}")
```

### 5. Add a License Key

```python
lk_api = lic_client.LicenseKeysApi(api_client=api_client)

license_key = lic_client.LicenseKey(
    key="XXXXX-XXXXX-XXXXX-XXXXX"
)

# Dry run first to validate
result = lk_api.add_license_key(body=license_key, _dryrun=True)

# Then apply for real
result = lk_api.add_license_key(body=license_key)
```

### 6. Assign License Keys to a Cluster

```python
lk_api = lic_client.LicenseKeysApi(api_client=api_client)

assignment = lic_client.LicenseKeyAssignmentSpec(
    cluster_ext_id="cluster-ext-id-here",
    license_key_ext_ids=["key-ext-id-1", "key-ext-id-2"]
)

lk_api.assign_license_keys(body=assignment)
```

### 7. Check Compliance

```python
lic_api = lic_client.LicensesApi(api_client=api_client)

compliances = lic_api.list_compliances()
for c in compliances.data:
    print(f"Cluster: {c.cluster_ext_id}, Compliant: {c.is_compliant}")
```

### 8. List Entitlements

```python
entitlements = lic_api.list_entitlements()
for e in entitlements.data:
    print(f"Entitlement: {e.ext_id}, Feature: {e.feature_name}")
```

### 9. List Violations

```python
violations = lic_api.list_violations()
for v in violations.data:
    print(f"Violation: {v.ext_id}, Severity: {v.severity}")
```

### 10. Check Allowances

```python
allowances = lic_api.list_allowances()
for a in allowances.data:
    print(f"Allowance: {a.ext_id}")
```

### 11. List Available Features

```python
features = lic_api.list_features()
for f in features.data:
    print(f"Feature: {f.name}")
```

### 12. Sync License State

Force a sync of licensing state with the Nutanix licensing portal.

```python
lic_api.sync_license_state()
```

### 13. Reclaim a License Key

```python
lk_api = lic_client.LicenseKeysApi(api_client=api_client)

lk_api.reclaim_license_key(extId=key_ext_id)

# List reclaim tokens
tokens = lk_api.list_reclaim_license_tokens()
```

## Key Models

| Model | Props | Description |
|-------|-------|-------------|
| LicenseKey | 15 | License key with status, type, expiration, cluster assignment |
| License | 13 | License record with type, tier, capacity, features |
| Entitlement | 9 | Licensed feature entitlement details |
| Compliance | 7 | Cluster compliance status |
| Allowance | 7 | Permitted resource/feature allowance |
| Violation | 7 | License violation details |
| EndUser | - | EULA acceptance: username and company |
| LicenseKeyAssignmentSpec | - | Cluster-to-key assignment input |

## Common Mistakes

1. **Not accepting EULA first**: Many cluster operations require EULA acceptance. Check and accept before applying licenses.
2. **Skipping dry run for license keys**: Use `_dryrun=True` to validate a license key before committing.
3. **Forgetting to sync state**: After adding/removing keys, call `sync_license_state()` to ensure Prism Central reflects the latest state.
4. **Confusing license vs. license key**: A License is the entitlement record; a LicenseKey is the actual key string that grants it.

## Cross-Namespace Dependencies

- **clustermgmt**: Cluster ext_ids for license key assignment and compliance checks.
- **prism (TasksApi)**: Some operations may return async tasks.
