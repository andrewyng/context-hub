---
name: vmwareengine
description: "Python package guide for google-cloud-vmwareengine, the Google Cloud VMware Engine client library"
metadata:
  languages: "python"
  versions: "1.10.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,google-cloud,vmware-engine,gcp,virtualization,private-cloud,python"
---

# google-cloud-vmwareengine Python Package Guide

`google-cloud-vmwareengine` is the official Python client for Google Cloud VMware Engine.
Install the package from PyPI, authenticate with Application Default Credentials (ADC), import `vmwareengine_v1`, and use `VmwareEngineClient` for VMware Engine resources and long-running operations.

## Install

```bash
python -m pip install "google-cloud-vmwareengine==1.10.0"
```

Other common package managers:

```bash
uv add "google-cloud-vmwareengine==1.10.0"
poetry add "google-cloud-vmwareengine==1.10.0"
```

PyPI lists `1.10.0` as the current release and `Python >=3.7` as the package requirement.

## Prerequisites

Before creating or modifying VMware Engine resources, make sure you have:

- a Google Cloud project with billing enabled
- the VMware Engine API enabled
- enough VMware Engine node quota for the region you want to use
- IAM permissions for the VMware Engine resources you will manage
- a non-overlapping management CIDR block for each private cloud

The product docs say each private cloud must start with at least three nodes, and the vSphere/vSAN management CIDR must use a prefix between `/24` and `/20`.

## Authentication And Environment

For local development, use ADC:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="my-project"
export GOOGLE_CLOUD_VMWAREENGINE_ZONE="us-central1-a"
export GOOGLE_CLOUD_VMWAREENGINE_NETWORK_LOCATION="global"
```

If you cannot use user credentials, point ADC at a service account key file:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

Prefer attached service accounts or service account impersonation over long-lived key files when your runtime supports them.

## Initialize A Client

```python
import os

from google.cloud import vmwareengine_v1

PROJECT_ID = os.environ["GOOGLE_CLOUD_PROJECT"]
ZONE = os.environ["GOOGLE_CLOUD_VMWAREENGINE_ZONE"]  # example: us-central1-a
NETWORK_LOCATION = os.getenv("GOOGLE_CLOUD_VMWAREENGINE_NETWORK_LOCATION", "global")

client = vmwareengine_v1.VmwareEngineClient()
```

Explicit credentials also work:

```python
import os

from google.cloud import vmwareengine_v1
from google.oauth2 import service_account

credentials = service_account.Credentials.from_service_account_file(
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"]
)

client = vmwareengine_v1.VmwareEngineClient(credentials=credentials)
```

## Common Workflows

### List available locations

```python
from google.cloud import vmwareengine_v1
from google.cloud.location.locations_pb2 import ListLocationsRequest

client = vmwareengine_v1.VmwareEngineClient()
request = ListLocationsRequest(name=f"projects/{PROJECT_ID}")

for location in client.list_locations(request=request):
    print(location.name)
```

### List VMware Engine networks

Use `global` for Standard VMware Engine networks. Older legacy-network flows use a regional parent instead.

```python
from google.cloud import vmwareengine_v1

client = vmwareengine_v1.VmwareEngineClient()

for network in client.list_vmware_engine_networks(
    parent=f"projects/{PROJECT_ID}/locations/{NETWORK_LOCATION}"
):
    print(network.name)
```

The returned `network.name` is the resource name you pass into private-cloud creation.

### Create a private cloud

Private-cloud creation is a long-running operation. The official sample notes that it may take over an hour.

```python
import os

from google.cloud import vmwareengine_v1

PROJECT_ID = os.environ["GOOGLE_CLOUD_PROJECT"]
ZONE = os.environ["GOOGLE_CLOUD_VMWAREENGINE_ZONE"]  # example: us-central1-a
NETWORK_NAME = os.environ["GOOGLE_CLOUD_VMWAREENGINE_NETWORK"]

PRIVATE_CLOUD_ID = "example-private-cloud"
CLUSTER_ID = "management-cluster-1"
MANAGEMENT_CIDR = "192.168.0.0/24"
NODE_COUNT = 3

request = vmwareengine_v1.CreatePrivateCloudRequest()
request.parent = f"projects/{PROJECT_ID}/locations/{ZONE}"
request.private_cloud_id = PRIVATE_CLOUD_ID
request.private_cloud = vmwareengine_v1.PrivateCloud()

request.private_cloud.management_cluster = (
    vmwareengine_v1.PrivateCloud.ManagementCluster()
)
request.private_cloud.management_cluster.cluster_id = CLUSTER_ID

node_config = vmwareengine_v1.NodeTypeConfig()
node_config.node_count = NODE_COUNT

# The official sample notes that standard-72 is the supported node type here.
request.private_cloud.management_cluster.node_type_configs = {
    "standard-72": node_config
}

request.private_cloud.network_config = vmwareengine_v1.NetworkConfig()
request.private_cloud.network_config.vmware_engine_network = NETWORK_NAME
request.private_cloud.network_config.management_cidr = MANAGEMENT_CIDR

client = vmwareengine_v1.VmwareEngineClient()
operation = client.create_private_cloud(request=request)
private_cloud = operation.result(timeout=7200)

print(private_cloud.name)
```

`GOOGLE_CLOUD_VMWAREENGINE_NETWORK` must be the full resource name of an existing VMware Engine network, for example the `.name` you got from `list_vmware_engine_networks(...)`.

### List clusters in a private cloud

```python
from google.cloud import vmwareengine_v1

PROJECT_ID = os.environ["GOOGLE_CLOUD_PROJECT"]
ZONE = os.environ["GOOGLE_CLOUD_VMWAREENGINE_ZONE"]
PRIVATE_CLOUD_ID = "example-private-cloud"

client = vmwareengine_v1.VmwareEngineClient()

for cluster in client.list_clusters(
    parent=(
        f"projects/{PROJECT_ID}/locations/{ZONE}/privateClouds/{PRIVATE_CLOUD_ID}"
    )
):
    print(cluster.name)
```

### Re-check a long-running operation by name

If you persist the operation name from a prior response, you can fetch it again later:

```python
from google.cloud import vmwareengine_v1
from google.longrunning.operations_pb2 import GetOperationRequest

operation_name = "projects/my-project/locations/us-central1/operations/operation-id"

client = vmwareengine_v1.VmwareEngineClient()
request = GetOperationRequest(name=operation_name)
operation = client.get_operation(request=request)

print(operation.name)
print(operation.done)
```

## Common Pitfalls

- The PyPI package name is `google-cloud-vmwareengine`, but the import is `from google.cloud import vmwareengine_v1`.
- Private clouds are zonal resources such as `us-central1-a`; network resources may use a different location scope. Standard VMware Engine network docs use `locations/global`.
- Your management CIDR must not overlap with on-prem, VPC, or planned workload subnets, and you cannot change that range later without deleting the private cloud.
- Private-cloud creation is not immediate. Wait for the returned operation instead of assuming the resource exists as soon as `create_private_cloud()` returns.
- Newer projects use Standard VMware Engine networks. Google’s current product docs describe Standard networks under `global`, while some Python samples still demonstrate legacy-network flows for older projects.
- This client uses gRPC. Google’s multiprocessing guidance says to create client instances after `os.fork()` in child processes, not before.

## Version-Sensitive Notes

As of `2026-03-13`, the package and hosted reference pages are not fully aligned:

- PyPI lists `google-cloud-vmwareengine 1.10.0`.
- The hosted `latest` reference pages and changelog still show version labels from `1.9.0` or earlier on some pages.

Treat `1.10.0` as the dependency version to install, but verify newly added methods or fields against the exact hosted page you are reading if you run into a mismatch.

## Official Sources

- PyPI package: https://pypi.org/project/google-cloud-vmwareengine/
- Google Cloud Python reference root: https://cloud.google.com/python/docs/reference/vmwareengine/latest
- `VmwareEngineClient` reference: https://cloud.google.com/python/docs/reference/vmwareengine/latest/google.cloud.vmwareengine_v1.services.vmware_engine.VmwareEngineClient
- Changelog: https://cloud.google.com/python/docs/reference/vmwareengine/latest/changelog
- Multiprocessing guidance: https://cloud.google.com/python/docs/reference/vmwareengine/latest/multiprocessing
- ADC local setup: https://cloud.google.com/docs/authentication/set-up-adc-local-dev-environment
- VMware Engine API access and quota: https://cloud.google.com/vmware-engine/docs/quickstart-prerequisites
- VMware Engine networking requirements: https://cloud.google.com/vmware-engine/docs/quickstart-networking-requirements
- List locations sample: https://cloud.google.com/vmware-engine/docs/samples/vmwareengine-list-locations
- List networks sample: https://cloud.google.com/vmware-engine/docs/samples/vmwareengine-list-networks
- Create private cloud sample: https://cloud.google.com/vmware-engine/docs/samples/vmwareengine-create-private-cloud
- List clusters sample: https://cloud.google.com/vmware-engine/docs/samples/vmwareengine-list-clusters
- Get operation sample: https://cloud.google.com/vmware-engine/docs/samples/vmwareengine-get-operation
- Standard VMware Engine network guide: https://cloud.google.com/vmware-engine/docs/networking/howto-create-vmware-engine-network
