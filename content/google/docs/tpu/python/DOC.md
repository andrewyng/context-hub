---
name: tpu
description: "Google Cloud TPU Python client for provisioning TPU nodes, queued resources, accelerator discovery, and node lifecycle operations"
metadata:
  languages: "python"
  versions: "1.25.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,cloud,tpu,gcp,python,ml,infrastructure,queued-resources"
---

# Google Cloud TPU Python Client

## What This Package Is

`google-cloud-tpu` is the Python client for the Cloud TPU control plane. Use it to discover available TPU configurations, create and delete TPU nodes, inspect node state, and work with queued resources.

This package does not train or run JAX, PyTorch, or TensorFlow workloads by itself. It provisions Cloud TPU resources; your framework code runs on the TPU VM after the resource exists.

Use the v2 client for new code:

```python
from google.cloud import tpu_v2
```

The package also still ships `tpu_v1` and `tpu_v2alpha1`. Keep `tpu_v1` only for older code that still depends on its API shapes.

## Install

Pin the package version your project expects:

```bash
python -m pip install "google-cloud-tpu==1.25.0"
```

Common alternatives:

```bash
uv add "google-cloud-tpu==1.25.0"
poetry add "google-cloud-tpu==1.25.0"
```

PyPI currently lists Python `>=3.7` for `1.25.0`.

## Prerequisites

Before calling this library, Google’s Cloud TPU setup guide requires you to:

- enable billing on the project
- enable the Cloud TPU API: `tpu.googleapis.com`
- have quota in the zone where you want to create TPUs
- use credentials with the required TPU permissions

Minimal setup with `gcloud`:

```bash
gcloud services enable tpu.googleapis.com
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID

export GOOGLE_CLOUD_PROJECT="YOUR_PROJECT_ID"
export GOOGLE_CLOUD_ZONE="us-central1-a"
```

For automation outside a Google Cloud runtime:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
export GOOGLE_CLOUD_PROJECT="YOUR_PROJECT_ID"
export GOOGLE_CLOUD_ZONE="us-central1-a"
```

Important scope note:

- This client is for the Cloud TPU API.
- Google’s current TPU product docs note that Ironwood / TPU7x uses GKE instead of the Cloud TPU API.

## Authentication And Client Setup

Application Default Credentials (ADC) are the normal path. ADC looks for credentials in this order:

1. `GOOGLE_APPLICATION_CREDENTIALS`
2. local ADC created by `gcloud auth application-default login`
3. the attached service account on Google Cloud

Basic client setup:

```python
import os

from google.cloud import tpu_v2

PROJECT_ID = os.environ["GOOGLE_CLOUD_PROJECT"]
ZONE = os.environ["GOOGLE_CLOUD_ZONE"]  # Example: us-central1-a

client = tpu_v2.TpuClient()
parent = f"projects/{PROJECT_ID}/locations/{ZONE}"
```

If you need explicit credentials:

```python
import os

from google.auth import default
from google.cloud import tpu_v2

PROJECT_ID = os.environ["GOOGLE_CLOUD_PROJECT"]
ZONE = os.environ["GOOGLE_CLOUD_ZONE"]

credentials, _ = default()
client = tpu_v2.TpuClient(credentials=credentials)
parent = f"projects/{PROJECT_ID}/locations/{ZONE}"
```

## Core Workflow

### Discover valid accelerator types and runtime versions

Do this first instead of hard-coding values copied from old blog posts:

```python
import os

from google.cloud import tpu_v2

PROJECT_ID = os.environ["GOOGLE_CLOUD_PROJECT"]
ZONE = os.environ["GOOGLE_CLOUD_ZONE"]

client = tpu_v2.TpuClient()
parent = f"projects/{PROJECT_ID}/locations/{ZONE}"

print("Accelerator types:")
for accelerator in client.list_accelerator_types(parent=parent):
    print(accelerator.name, accelerator.type_)

print("Runtime versions:")
for runtime in client.list_runtime_versions(parent=parent):
    print(runtime)
```

The returned values are what you should feed into node creation.

### Create a TPU node

`tpu_v2.Node` requires `runtime_version`. For a simple single-node example:

```python
import os

from google.cloud import tpu_v2

PROJECT_ID = os.environ["GOOGLE_CLOUD_PROJECT"]
ZONE = os.environ["GOOGLE_CLOUD_ZONE"]

client = tpu_v2.TpuClient()
parent = f"projects/{PROJECT_ID}/locations/{ZONE}"

node = tpu_v2.Node(
    accelerator_type="v2-8",
    runtime_version="tpu-ubuntu2204-base",
    network_config=tpu_v2.NetworkConfig(
        enable_external_ips=True,
    ),
    tags=["ml"],
    labels={"env": "dev"},
)

operation = client.create_node(
    parent=parent,
    node_id="example-v2-8",
    node=node,
)

created = operation.result()
print(created.name)
print(created.state)
```

Practical notes:

- `create_node()` returns a long-running operation. Wait on `operation.result()` before assuming the TPU exists.
- If you set `enable_external_ips=False`, Google documents that the selected network or subnetwork must have Private Google Access enabled.
- The library examples warn that some environments may need an explicit `client_options.api_endpoint` override; use that only if your environment requires a non-default endpoint.

### Get and list nodes

```python
import os

from google.cloud import tpu_v2

PROJECT_ID = os.environ["GOOGLE_CLOUD_PROJECT"]
ZONE = os.environ["GOOGLE_CLOUD_ZONE"]

client = tpu_v2.TpuClient()
parent = f"projects/{PROJECT_ID}/locations/{ZONE}"
node_name = client.node_path(PROJECT_ID, ZONE, "example-v2-8")

node = client.get_node(name=node_name)
print(node.name)
print(node.state)
print(node.health_description)

for item in client.list_nodes(parent=parent):
    print(item.name, item.state)
```

### Stop, start, and delete a node

```python
import os

from google.cloud import tpu_v2

PROJECT_ID = os.environ["GOOGLE_CLOUD_PROJECT"]
ZONE = os.environ["GOOGLE_CLOUD_ZONE"]

client = tpu_v2.TpuClient()
node_name = client.node_path(PROJECT_ID, ZONE, "example-v2-8")

client.stop_node(name=node_name).result()
client.start_node(name=node_name).result()
client.delete_node(name=node_name).result()
```

Important behavior:

- `stop_node()` in v2 is only available for single TPU nodes.
- `delete_node()` also returns a long-running operation. Wait for completion before recreating the same name.

### Update mutable node fields

The v2 client only supports updating these node fields through `update_node()`:

- `description`
- `tags`
- `labels`
- `metadata`
- `network_config.enable_external_ips`

Example:

```python
import os

from google.cloud import tpu_v2
from google.protobuf.field_mask_pb2 import FieldMask

PROJECT_ID = os.environ["GOOGLE_CLOUD_PROJECT"]
ZONE = os.environ["GOOGLE_CLOUD_ZONE"]

client = tpu_v2.TpuClient()
node_name = client.node_path(PROJECT_ID, ZONE, "example-v2-8")

node = tpu_v2.Node(
    name=node_name,
    labels={"env": "staging", "owner": "ml-platform"},
)

operation = client.update_node(
    node=node,
    update_mask=FieldMask(paths=["labels"]),
)

updated = operation.result()
print(updated.labels)
```

## Queued Resources

Google’s Cloud TPU setup guide recommends queued resources as a best practice when you want capacity to arrive when it becomes available instead of failing immediately.

Create a Spot queued resource:

```python
import os

from google.cloud import tpu_v2

PROJECT_ID = os.environ["GOOGLE_CLOUD_PROJECT"]
ZONE = os.environ["GOOGLE_CLOUD_ZONE"]

client = tpu_v2.TpuClient()
parent = f"projects/{PROJECT_ID}/locations/{ZONE}"

queued_resource = tpu_v2.QueuedResource(
    tpu=tpu_v2.QueuedResource.Tpu(
        node_spec=[
            tpu_v2.QueuedResource.Tpu.NodeSpec(
                parent=parent,
                node_id="queued-node-1",
                node=tpu_v2.Node(
                    accelerator_type="v5litepod-8",
                    runtime_version="v2-alpha-tpuv5-lite",
                    network_config=tpu_v2.NetworkConfig(
                        enable_external_ips=True,
                    ),
                ),
            )
        ]
    ),
    spot=tpu_v2.QueuedResource.Spot(),
)

operation = client.create_queued_resource(
    parent=parent,
    queued_resource_id="queued-demo",
    queued_resource=queued_resource,
)

created = operation.result()
print(created.name)
print(created.state)
```

Inspect and list queued resources:

```python
import os

from google.cloud import tpu_v2

PROJECT_ID = os.environ["GOOGLE_CLOUD_PROJECT"]
ZONE = os.environ["GOOGLE_CLOUD_ZONE"]

client = tpu_v2.TpuClient()
parent = f"projects/{PROJECT_ID}/locations/{ZONE}"

queued_name = client.queued_resource_path(PROJECT_ID, ZONE, "queued-demo")

queued = client.get_queued_resource(name=queued_name)
print(queued.name)
print(queued.state)

for item in client.list_queued_resources(parent=parent):
    print(item.name, item.state)
```

Delete a queued resource:

```python
import os

from google.cloud import tpu_v2

PROJECT_ID = os.environ["GOOGLE_CLOUD_PROJECT"]
ZONE = os.environ["GOOGLE_CLOUD_ZONE"]

client = tpu_v2.TpuClient()
queued_name = client.queued_resource_path(PROJECT_ID, ZONE, "queued-demo")

client.delete_queued_resource(name=queued_name).result()
```

Queued-resource caveats that matter in practice:

- `QueuedResource` has oneof fields. Pick one tier such as `spot` or `guaranteed`; do not set multiple tiers at once.
- For a single queued node, set `node_id`. The docs say multislice requests should populate `multislice_params` instead.
- Reservation-backed requests use `reservation_name` in the format `projects/{project}/locations/{zone}/reservations/{reservation}`.

## Legacy v1 API

The package still ships `tpu_v1`, but its request model is older. The main difference that trips people up is that v1 node creation uses `tensorflow_version`, not `runtime_version`.

```python
import os

from google.cloud import tpu_v1

PROJECT_ID = os.environ["GOOGLE_CLOUD_PROJECT"]
ZONE = os.environ["GOOGLE_CLOUD_ZONE"]

client = tpu_v1.TpuClient()
parent = f"projects/{PROJECT_ID}/locations/{ZONE}"

node = tpu_v1.Node(
    accelerator_type="v2-8",
    tensorflow_version="YOUR_TENSORFLOW_VERSION",
)

operation = client.create_node(
    parent=parent,
    node_id="legacy-v1-node",
    node=node,
)

created = operation.result()
print(created.name)
```

Only stay on v1 if your existing code or resource model already depends on it.

## Common Pitfalls

- The package name is `google-cloud-tpu`, but the import you usually want is `from google.cloud import tpu_v2`.
- This library manages TPU resources. It does not replace the framework-specific setup you do after the TPU VM is provisioned.
- Do not assume an old accelerator type or runtime version still exists in your target zone. Call `list_accelerator_types()` and `list_runtime_versions()` first.
- Wait for long-running operations to finish before using or deleting a resource.
- In v2, `stop_node()` only works for single TPU nodes.
- In v2, `update_node()` only supports a narrow set of mutable fields. Do not expect accelerator type or runtime version changes through `update_node()`.
- `QueuedResource` uses oneof fields for both the resource definition and the request tier. Setting conflicting fields will clear earlier values.
- If you disable external IPs, your network path must satisfy the Private Google Access requirement documented on `NetworkConfig`.
- ADC is the standard auth path. Avoid service account keys unless you actually need them.

## Version-Sensitive Notes

- PyPI currently publishes `google-cloud-tpu 1.25.0`.
- The current reference pages for the client surface are serving `1.25.0`, but the public changelog page still lists `1.24.0` as its latest entry as of March 13, 2026.
- The upstream changelog for `1.24.0` adds Python 3.14 support and deprecates the `credentials_file` argument. If you are updating older code, prefer `credentials=` or ADC instead of new `credentials_file` usage.
- The upstream changelog shows TPU v2 support landed in `1.6.0`. If you are maintaining very old environments pinned below that, the v2 examples in this guide do not apply.

## Official Sources

- Cloud TPU Python reference root: `https://cloud.google.com/python/docs/reference/tpu/latest`
- `tpu_v2.TpuClient` reference: `https://docs.cloud.google.com/python/docs/reference/tpu/latest/google.cloud.tpu_v2.services.tpu.TpuClient`
- `tpu_v2.Node` reference: `https://docs.cloud.google.com/python/docs/reference/tpu/latest/google.cloud.tpu_v2.types.Node`
- `tpu_v2.NetworkConfig` reference: `https://docs.cloud.google.com/python/docs/reference/tpu/latest/google.cloud.tpu_v2.types.NetworkConfig`
- `tpu_v2.QueuedResource` reference: `https://docs.cloud.google.com/python/docs/reference/tpu/latest/google.cloud.tpu_v2.types.QueuedResource`
- `QueuedResource.Tpu.NodeSpec` reference: `https://docs.cloud.google.com/python/docs/reference/tpu/latest/google.cloud.tpu_v2.types.QueuedResource.Tpu.NodeSpec`
- `tpu_v1.Node` reference: `https://docs.cloud.google.com/python/docs/reference/tpu/latest/google.cloud.tpu_v1.types.Node`
- Cloud TPU environment setup: `https://docs.cloud.google.com/tpu/docs/quick-starts`
- Queued resources guide: `https://docs.cloud.google.com/tpu/docs/queued-resources`
- ADC overview: `https://cloud.google.com/docs/authentication/application-default-credentials`
- ADC setup: `https://cloud.google.com/docs/authentication/provide-credentials-adc`
- Changelog: `https://docs.cloud.google.com/python/docs/reference/tpu/latest/changelog`
- PyPI: `https://pypi.org/project/google-cloud-tpu/`
