---
name: access-context-manager
description: "Google Cloud Access Context Manager Python client for access policies, access levels, service perimeters, and GCP user access bindings"
metadata:
  languages: "python"
  versions: "0.3.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,google-cloud,python,access-context-manager,vpc-service-controls,access-levels,service-perimeters"
---

# Google Cloud Access Context Manager Python Package Guide

## Golden Rule

Use `google-cloud-access-context-manager` for Access Context Manager policy data in Python, authenticate with Application Default Credentials (ADC), and keep one policy on one API track. Google publishes both `v1` and `v1alpha` surfaces, but the official RPC docs warn not to mix `v1` and `v1alpha` calls in the same access policy.

This package is still published on PyPI as `0.3.0` with an alpha classifier, so pin the version you expect and verify request fields against the current Google docs before changing production perimeters.

## Install

```bash
python -m pip install "google-cloud-access-context-manager==0.3.0"
```

Common alternatives:

```bash
uv add "google-cloud-access-context-manager==0.3.0"
poetry add "google-cloud-access-context-manager==0.3.0"
```

## Authentication And Setup

Before writing code:

1. Enable the Access Context Manager API.
2. Make sure the caller can edit the organization policy. Google documents `roles/accesscontextmanager.policyEditor` for common setup flows.
3. Use ADC locally with `gcloud auth application-default login`, or use an attached service account in Google Cloud.
4. Work with organization and policy resource names, not bare IDs.

Local setup:

```bash
gcloud services enable accesscontextmanager.googleapis.com
gcloud auth application-default login

export GOOGLE_CLOUD_ORGANIZATION="123456789012"
export ACCESS_POLICY_ID="9522"
```

Service account key fallback:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

Useful resource name formats:

- organization: `organizations/{organization_id}`
- access policy: `accessPolicies/{policy_id}`
- access level: `accessPolicies/{policy_id}/accessLevels/{level_id}`
- service perimeter: `accessPolicies/{policy_id}/servicePerimeters/{perimeter_id}`
- GCP user access binding: `organizations/{organization_id}/gcpUserAccessBindings/{binding_id}`

## Imports And Client Initialization

Use the generated Python client surface:

```python
from google.cloud import accesscontextmanager_v1

client = accesscontextmanager_v1.AccessContextManagerClient()
```

If you are comparing this package with the lower-level Google API reference, the generated protobuf and RPC namespace is documented under `google.identity.accesscontextmanager.v1`.

## Core Usage

### List access policies in an organization

Each organization has one access policy. Start here if you only know the organization ID.

```python
import os

from google.cloud import accesscontextmanager_v1

organization_id = os.environ["GOOGLE_CLOUD_ORGANIZATION"]
client = accesscontextmanager_v1.AccessContextManagerClient()

for policy in client.list_access_policies(
    request={"parent": f"organizations/{organization_id}"}
):
    print(policy.name, policy.title, policy.etag)
```

### Get one access policy

```python
import os

from google.cloud import accesscontextmanager_v1

policy_id = os.environ["ACCESS_POLICY_ID"]
client = accesscontextmanager_v1.AccessContextManagerClient()

policy = client.get_access_policy(
    request={"name": f"accessPolicies/{policy_id}"}
)

print(policy.name)
print(policy.parent)
print(policy.title)
print(policy.etag)
```

### List and inspect access levels

`accessLevels.list` is the practical way to discover existing policy rules. Use `CEL` format only if you need the expression form instead of the original basic/custom representation.

```python
import os

from google.cloud import accesscontextmanager_v1

policy_id = os.environ["ACCESS_POLICY_ID"]
client = accesscontextmanager_v1.AccessContextManagerClient()
parent = f"accessPolicies/{policy_id}"

for level in client.list_access_levels(
    request={
        "parent": parent,
        "access_level_format": accesscontextmanager_v1.LevelFormat.AS_DEFINED,
    }
):
    print(level.name, level.title)
```

```python
import os

from google.cloud import accesscontextmanager_v1

policy_id = os.environ["ACCESS_POLICY_ID"]
level_name = f"accessPolicies/{policy_id}/accessLevels/device_trusted"
client = accesscontextmanager_v1.AccessContextManagerClient()

level = client.get_access_level(
    request={
        "name": level_name,
        "access_level_format": accesscontextmanager_v1.LevelFormat.AS_DEFINED,
    }
)

print(level.name)
print(level.title)
print(level.description)
```

### Create a basic access level

Access level names are immutable after creation. The level ID must start with a letter and then use only alphanumeric characters or `_`.

```python
import os

from google.cloud import accesscontextmanager_v1

policy_id = os.environ["ACCESS_POLICY_ID"]
parent = f"accessPolicies/{policy_id}"
level_name = f"{parent}/accessLevels/device_trusted"

client = accesscontextmanager_v1.AccessContextManagerClient()

condition = accesscontextmanager_v1.Condition(
    members=["user:alice@example.com"],
    regions=["US"],
    ip_subnetworks=["203.0.113.0/24"],
)

access_level = accesscontextmanager_v1.AccessLevel(
    name=level_name,
    title="device_trusted",
    description="Allow approved US traffic from the corp subnet",
    basic=accesscontextmanager_v1.BasicLevel(
        conditions=[condition],
        combining_function=accesscontextmanager_v1.ConditionCombiningFunction.AND,
    ),
)

operation = client.create_access_level(
    request={
        "parent": parent,
        "access_level": access_level,
    }
)

created = operation.result(timeout=300)
print(created.name)
```

If you prefer bulk replacement for policy-as-code workflows, the API also exposes `replaceAll` for access levels and accepts an optional policy `etag`.

### List service perimeters

Service perimeter resources live under the access policy, not under projects.

```python
import os

from google.cloud import accesscontextmanager_v1

policy_id = os.environ["ACCESS_POLICY_ID"]
client = accesscontextmanager_v1.AccessContextManagerClient()

for perimeter in client.list_service_perimeters(
    request={"parent": f"accessPolicies/{policy_id}"}
):
    print(perimeter.name, perimeter.title, perimeter.perimeter_type)
```

### Commit dry-run service perimeter specs

`CommitServicePerimeters` copies each perimeter's `spec` into `status` when `use_explicit_dry_run_spec` is true. Pass the current policy `etag` when you want optimistic concurrency.

```python
import os

from google.cloud import accesscontextmanager_v1

policy_id = os.environ["ACCESS_POLICY_ID"]
client = accesscontextmanager_v1.AccessContextManagerClient()
policy_name = f"accessPolicies/{policy_id}"

policy = client.get_access_policy(request={"name": policy_name})

operation = client.commit_service_perimeters(
    request={
        "parent": policy.name,
        "etag": policy.etag,
    }
)

response = operation.result(timeout=300)

for perimeter in response.service_perimeters:
    print(perimeter.name)
```

### List organization-level GCP user access bindings

Use these when you need Context-Aware Access restrictions for Cloud Console and Google Cloud APIs at the organization level.

```python
import os

from google.cloud import accesscontextmanager_v1

organization_id = os.environ["GOOGLE_CLOUD_ORGANIZATION"]
client = accesscontextmanager_v1.AccessContextManagerClient()

for binding in client.list_gcp_user_access_bindings(
    request={"parent": f"organizations/{organization_id}"}
):
    print(binding.name, binding.group_key, list(binding.access_levels))
```

Important binding constraints from the official API reference:

- `groupKey` is the Google Group ID, not the group email address or alias.
- `accessLevels` supports exactly one access level, not multiple.
- create and patch operations can finish before the new restriction is fully deployed to all affected users.

## Common Pitfalls

- Do not mix `v1` and `v1alpha` mutations in the same access policy. Google explicitly warns that mixed usage can make a policy hard or impossible to update safely.
- Access Context Manager is organization-scoped. Most calls use `organizations/{org_id}` or `accessPolicies/{policy_id}`, not project IDs alone.
- Access level and service perimeter names are immutable after creation. Pick stable IDs early.
- Access level conditions are strict. `members` supports users and service accounts, but not groups. Group-based enforcement belongs in `GcpUserAccessBinding`.
- For service perimeters, resources use project numbers like `projects/{project_number}`, not project IDs.
- Mutating calls are long-running operations. Wait for `.result()` before reading back the resource or chaining dependent operations.
- Service perimeter propagation is not instant. Google documents that perimeter changes can take up to 30 minutes to take effect.
- `use_explicit_dry_run_spec` must be true before you rely on `spec` for dry-run perimeter testing and later commit it.

## Official Links

- PyPI package: `https://pypi.org/project/google-cloud-access-context-manager/`
- Maintainer repo: `https://github.com/googleapis/python-access-context-manager`
- Generated docs root: `https://googleapis.dev/python/accesscontextmanager/latest/`
- Access Context Manager RPC overview: `https://docs.cloud.google.com/access-context-manager/docs/reference/rpc`
- `google.identity.accesscontextmanager.v1` RPC package: `https://docs.cloud.google.com/access-context-manager/docs/reference/rpc/google.identity.accesscontextmanager.v1`
- Access policies REST resource: `https://docs.cloud.google.com/access-context-manager/docs/reference/rest/v1/accessPolicies`
- Access levels REST resource: `https://docs.cloud.google.com/access-context-manager/docs/reference/rest/v1/accessPolicies.accessLevels`
- Service perimeters REST resource: `https://docs.cloud.google.com/access-context-manager/docs/reference/rest/v1/accessPolicies.servicePerimeters`
- GCP user access bindings REST resource: `https://docs.cloud.google.com/access-context-manager/docs/reference/rest/v1/organizations.gcpUserAccessBindings`
- Manage access levels guide: `https://docs.cloud.google.com/access-context-manager/docs/manage-access-levels`
- Manage service perimeters guide: `https://docs.cloud.google.com/vpc-service-controls/docs/manage-service-perimeters`
