---
name: gke-hub
description: "Google Cloud GKE Hub Python client for fleet memberships and features with ADC setup, location-aware resource names, and long-running operation handling"
metadata:
  languages: "python"
  versions: "1.21.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,gke-hub,fleet,anthos,gke,adc"
---

# google-cloud-gke-hub Python Package Guide

## What This Package Is

`google-cloud-gke-hub` is the official Google Cloud Python client for the GKE Hub / Fleet control-plane API.

Use it when Python code needs to:

- list, inspect, create, update, or delete fleet memberships
- list or inspect fleet features
- automate fleet registration flows around GKE Hub resources

Do not use this package to manage Kubernetes objects inside a cluster. For Deployments, Services, Pods, and other Kubernetes resources, use the Kubernetes API after you have cluster credentials.

The API surface is centered on two resource types:

- `Membership`: a registered cluster in a fleet
- `Feature`: a fleet-level capability such as config or multi-cluster integrations

## Version Note

This guide targets package version `1.21.0`.

As of `2026-03-13`, upstream sources do not line up perfectly:

- PyPI shows `1.22.0` as the newest release, published on `2026-03-12`
- the current `latest` Python reference page still labels `GkeHubClient` as `1.20.0`
- the current `latest` changelog page reaches `1.19.0`

Practical implication:

- the examples below stick to the stable `google.cloud.gkehub_v1` surface that is present in the current reference docs
- if you are pinned to `1.21.0`, keep your installed wheel authoritative when a docs page shows an older version badge

## Install

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "google-cloud-gke-hub==1.21.0"
```

Common alternatives:

```bash
uv add "google-cloud-gke-hub==1.21.0"
poetry add "google-cloud-gke-hub==1.21.0"
```

PyPI currently declares `Requires: Python >=3.7`.

## Required Setup

The package quickstart requires the usual Google Cloud setup:

1. Select or create a Google Cloud project.
2. Enable billing.
3. Enable GKE Hub.
4. Set up Application Default Credentials.

For cluster-registration workflows, Google’s fleet prerequisites also call out the companion APIs commonly needed around Hub membership setup:

```bash
gcloud services enable \
  --project="${GOOGLE_CLOUD_PROJECT}" \
  container.googleapis.com \
  gkeconnect.googleapis.com \
  gkehub.googleapis.com \
  cloudresourcemanager.googleapis.com
```

If you plan to enable fleet Workload Identity, also enable:

```bash
gcloud services enable \
  --project="${GOOGLE_CLOUD_PROJECT}" \
  iam.googleapis.com
```

Local ADC:

```bash
gcloud auth application-default login
```

Service account credentials file:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

## Environment And Client Initialization

Example shell setup:

```bash
export GOOGLE_CLOUD_PROJECT="my-fleet-host-project"
export GOOGLE_CLOUD_LOCATION="global"

export GKE_CLUSTER_PROJECT="my-fleet-host-project"
export GKE_CLUSTER_LOCATION="us-central1"
export GKE_CLUSTER_NAME="primary"
```

Basic client setup:

```python
import os
from google.cloud import gkehub_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
membership_location = os.getenv("GOOGLE_CLOUD_LOCATION", "global")

client = gkehub_v1.GkeHubClient()
parent = client.common_location_path(project_id, membership_location)
all_memberships_parent = client.common_location_path(project_id, "-")
features_parent = client.common_location_path(project_id, "global")
```

Explicit service account file:

```python
from google.cloud import gkehub_v1

client = gkehub_v1.GkeHubClient.from_service_account_file(
    "/absolute/path/service-account.json"
)
```

Async client:

```python
from google.cloud import gkehub_v1

client = gkehub_v1.GkeHubAsyncClient()
```

## Resource Naming And Locations

Use the helper methods on `GkeHubClient` instead of hand-building resource names when you can:

- membership name: `client.membership_path(project, location, membership)`
- feature name: `client.feature_path(project, location, feature)`
- parent location: `client.common_location_path(project, location)`

Important location rules from the current reference docs:

- memberships are available in `global` and regional locations
- features are only available in `global`
- `list_memberships(parent="projects/*/locations/-")` lists memberships across all regions for a project

For GKE-on-Google-Cloud memberships, the cluster reference must use the full Container API resource link format:

```text
//container.googleapis.com/projects/PROJECT_ID/locations/CLUSTER_LOCATION/clusters/CLUSTER_NAME
```

## Core Usage

### List memberships

Use `locations/-` when you want all memberships in the project, regardless of membership location.

```python
import os
from google.cloud import gkehub_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]

client = gkehub_v1.GkeHubClient()
parent = client.common_location_path(project_id, "-")

for membership in client.list_memberships(parent=parent):
    print(membership.name)
    print(membership.state.code)
```

### Get one membership

```python
import os
from google.cloud import gkehub_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
membership_location = os.getenv("GOOGLE_CLOUD_LOCATION", "global")
membership_id = "primary"

client = gkehub_v1.GkeHubClient()
name = client.membership_path(project_id, membership_location, membership_id)
membership = client.get_membership(name=name)

print(membership.name)
print(membership.unique_id)
print(membership.endpoint.google_managed)
```

### Create a membership for a GKE cluster

Membership creation is a long-running operation. Wait on `.result()` before assuming the membership exists.

```python
import os
import uuid

from google.cloud import gkehub_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
membership_location = os.getenv("GOOGLE_CLOUD_LOCATION", "global")
cluster_project = os.getenv("GKE_CLUSTER_PROJECT", project_id)
cluster_location = os.environ["GKE_CLUSTER_LOCATION"]
cluster_name = os.environ["GKE_CLUSTER_NAME"]

client = gkehub_v1.GkeHubClient()
parent = client.common_location_path(project_id, membership_location)
membership_id = "primary"

cluster_resource_link = (
    f"//container.googleapis.com/projects/{cluster_project}"
    f"/locations/{cluster_location}/clusters/{cluster_name}"
)

membership = gkehub_v1.Membership(
    labels={"env": "dev"},
    endpoint=gkehub_v1.MembershipEndpoint(
        gke_cluster=gkehub_v1.GkeCluster(
            resource_link=cluster_resource_link,
        )
    ),
)

operation = client.create_membership(
    request=gkehub_v1.CreateMembershipRequest(
        parent=parent,
        membership_id=membership_id,
        resource=membership,
        request_id=str(uuid.uuid4()),
    )
)

created = operation.result()
print(created.name)
```

### Update membership labels

`update_membership` requires a `FieldMask`. Only the masked fields are applied.

```python
import os
import uuid

from google.cloud import gkehub_v1
from google.protobuf import field_mask_pb2

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
membership_location = os.getenv("GOOGLE_CLOUD_LOCATION", "global")
membership_id = "primary"

client = gkehub_v1.GkeHubClient()
name = client.membership_path(project_id, membership_location, membership_id)
membership = client.get_membership(name=name)

membership.labels["team"] = "platform"

operation = client.update_membership(
    request=gkehub_v1.UpdateMembershipRequest(
        name=name,
        resource=membership,
        update_mask=field_mask_pb2.FieldMask(paths=["labels"]),
        request_id=str(uuid.uuid4()),
    )
)

updated = operation.result()
print(updated.labels)
```

### List and inspect features

Features are global resources, so use `locations/global`.

```python
import os
from google.cloud import gkehub_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]

client = gkehub_v1.GkeHubClient()
parent = client.common_location_path(project_id, "global")

for feature in client.list_features(parent=parent):
    print(feature.name)
    print(feature.labels)
```

```python
import os
from google.cloud import gkehub_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
feature_id = "configmanagement"

client = gkehub_v1.GkeHubClient()
name = client.feature_path(project_id, "global", feature_id)
feature = client.get_feature(name=name)

print(feature.name)
print(feature.resource_state.state)
```

### Delete a membership

Deletion is also a long-running operation. If the membership still has subresources, the request can fail unless you intentionally set `force=True`.

```python
import os
import uuid

from google.cloud import gkehub_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
membership_location = os.getenv("GOOGLE_CLOUD_LOCATION", "global")
membership_id = "primary"

client = gkehub_v1.GkeHubClient()
name = client.membership_path(project_id, membership_location, membership_id)

operation = client.delete_membership(
    request=gkehub_v1.DeleteMembershipRequest(
        name=name,
        request_id=str(uuid.uuid4()),
    )
)

operation.result()
print("Deleted")
```

## Connect Agent And Generated Manifests

The client exposes `generate_connect_manifest()`, but the current reference docs explicitly say this method is used internally by Google-provided libraries and that most clients should not need to call it directly.

If you do need generated manifests:

- `GenerateConnectManifestResponse.manifest` returns an ordered list of Kubernetes resources to apply
- membership `kubernetes_resource.membership_resources` and `connect_resources` are only populated in the `Membership` returned from a successful `create_membership` or `update_membership` long-running operation
- normal `get_membership()` and `list_memberships()` responses do not include those manifest payloads

## Common Pitfalls

- Do not use this package as a Kubernetes client. It manages fleet control-plane resources, not in-cluster objects.
- Do not assume every GKE Hub resource is global. Features are global; memberships can be global or regional.
- Do not assume a mutation is complete until you call `.result()` on the returned operation.
- Do not build GKE cluster links from just the cluster name. Use the full `//container.googleapis.com/projects/.../locations/.../clusters/...` resource link.
- Do not update memberships without an explicit `FieldMask`. The request contract is patch-style, and masked fields that you omit from `resource` are removed.
- Prefer `request_id` for create, update, and delete calls so retries do not duplicate operations.
- If you are automating around existing GKE registrations, remember that GKE clusters registered with `gcloud` are managed in the cluster’s own region; product docs also note that you cannot move a membership to a different location without unregistering and registering again.
- Treat the rolling docs site as slightly behind PyPI for this package right now. The published wheel version and the installed client surface are the reliable source of truth for version pinning.

## Optional Debug Logging

Google’s package docs support opt-in environment-based logging:

```bash
export GOOGLE_SDK_PYTHON_LOGGING_SCOPE=google
```

Or configure logging in code:

```python
import logging

base_logger = logging.getLogger("google")
base_logger.addHandler(logging.StreamHandler())
base_logger.setLevel(logging.DEBUG)
```

Be careful: the package docs note that RPC logs can contain sensitive information.

## Official Sources

- Python client overview: https://docs.cloud.google.com/python/docs/reference/gkehub/latest
- `GkeHubClient` reference: https://docs.cloud.google.com/python/docs/reference/gkehub/latest/google.cloud.gkehub_v1.services.gke_hub.GkeHubClient
- Package types: https://docs.cloud.google.com/python/docs/reference/gkehub/latest/google.cloud.gkehub_v1.types
- GKE Hub RPC reference: https://cloud.google.com/kubernetes-engine/fleet-management/docs/reference/rpc/google.cloud.gkehub.v1
- Fleet prerequisites: https://cloud.google.com/kubernetes-engine/fleet-management/docs/before-you-begin
- Fleet creation overview: https://cloud.google.com/kubernetes-engine/enterprise/multicluster-management/fleet-creation
- ADC setup: https://cloud.google.com/docs/authentication/provide-credentials-adc
- ADC search order: https://cloud.google.com/docs/authentication/application-default-credentials
- PyPI package: https://pypi.org/project/google-cloud-gke-hub/
