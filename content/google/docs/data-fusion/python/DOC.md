---
name: data-fusion
description: "Google Cloud Data Fusion Python client for instance lifecycle management and version discovery"
metadata:
  languages: "python"
  versions: "1.15.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,data-fusion,gcp,etl,instances,python"
---

# Google Cloud Data Fusion Python Client

## Golden Rule

Use `google-cloud-data-fusion` with `from google.cloud import data_fusion_v1` when you need to create, inspect, update, restart, or delete Cloud Data Fusion instances from Python.

This package is the control-plane client for Data Fusion instances and available versions. The generated `DataFusionClient` methods cover instance lifecycle and version discovery, not pipeline authoring inside the Data Fusion Studio UI.

## Install

```bash
python -m pip install --upgrade pip
python -m pip install "google-cloud-data-fusion==1.15.0"
```

Common alternatives:

```bash
uv add "google-cloud-data-fusion==1.15.0"
poetry add "google-cloud-data-fusion==1.15.0"
```

PyPI lists `Python >=3.7` for this package.

## Authentication And Environment

This client uses Google Cloud credentials, not an API key.

For local development, create Application Default Credentials (ADC):

```bash
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
```

If you must use a service account key outside Google Cloud, point ADC at the file:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

Useful environment variables:

```bash
export GOOGLE_CLOUD_PROJECT="your-project-id"
export DATA_FUSION_LOCATION="us-central1"
export DATA_FUSION_INSTANCE_ID="analytics-dev"
export DATA_FUSION_NETWORK="projects/your-project-id/global/networks/default"
```

`DATA_FUSION_NETWORK` is a full VPC resource name. Keep the project and location consistent across all requests.

## Initialize The Client

```python
import os

from google.cloud import data_fusion_v1

PROJECT_ID = os.environ["GOOGLE_CLOUD_PROJECT"]
LOCATION = os.getenv("DATA_FUSION_LOCATION", "us-central1")
INSTANCE_ID = os.getenv("DATA_FUSION_INSTANCE_ID", "analytics-dev")

client = data_fusion_v1.DataFusionClient()
parent = f"projects/{PROJECT_ID}/locations/{LOCATION}"
instance_name = f"{parent}/instances/{INSTANCE_ID}"
```

If your application already has explicit Google credentials loaded, you can pass them with the normal generated-client `credentials=` argument when constructing `DataFusionClient()`.

## Core Workflows

### List available Data Fusion versions

Use `list_available_versions()` before creating an instance so you do not hard-code an old runtime version.

```python
from google.cloud import data_fusion_v1

client = data_fusion_v1.DataFusionClient()
parent = "projects/your-project-id/locations/us-central1"

versions = list(client.list_available_versions(parent=parent))
for version in versions:
    print(version.version_number)
```

### Create an instance

Instance creation is a long-running operation. Pick the version first, then wait for `.result()`.

```python
import os

from google.cloud import data_fusion_v1

PROJECT_ID = os.environ["GOOGLE_CLOUD_PROJECT"]
LOCATION = os.getenv("DATA_FUSION_LOCATION", "us-central1")
INSTANCE_ID = os.getenv("DATA_FUSION_INSTANCE_ID", "analytics-dev")
NETWORK = os.environ["DATA_FUSION_NETWORK"]

client = data_fusion_v1.DataFusionClient()
parent = f"projects/{PROJECT_ID}/locations/{LOCATION}"

available_versions = list(client.list_available_versions(parent=parent))
selected_version = available_versions[0].version_number

instance = data_fusion_v1.Instance(
    display_name="Analytics Dev",
    type_=data_fusion_v1.Instance.Type.BASIC,
    version=selected_version,
    network_config=data_fusion_v1.NetworkConfig(
        network=NETWORK,
    ),
    labels={"env": "dev"},
)

request = data_fusion_v1.CreateInstanceRequest(
    parent=parent,
    instance_id=INSTANCE_ID,
    instance=instance,
)

operation = client.create_instance(request=request)
created = operation.result(timeout=3600)

print(created.name)
print(created.version)
```

The `Instance` type also exposes fields for options such as private instance settings, accelerators, and CMEK-related configuration. Add those only when your environment requires them.

### Get or list instances

```python
from google.cloud import data_fusion_v1

client = data_fusion_v1.DataFusionClient()
parent = "projects/your-project-id/locations/us-central1"
name = f"{parent}/instances/analytics-dev"

instance = client.get_instance(name=name)
print(instance.name, instance.state, instance.version)

for item in client.list_instances(parent=parent):
    print(item.name, item.state, item.version)
```

### Patch an instance

Use `update_instance()` with a field mask. The instance `name` identifies which resource to patch.

```python
from google.cloud import data_fusion_v1
from google.protobuf.field_mask_pb2 import FieldMask

client = data_fusion_v1.DataFusionClient()

instance = data_fusion_v1.Instance(
    name=(
        "projects/your-project-id/locations/us-central1/"
        "instances/analytics-dev"
    ),
    display_name="Analytics Dev Updated",
    labels={"env": "dev", "team": "data-platform"},
)

request = data_fusion_v1.UpdateInstanceRequest(
    instance=instance,
    update_mask=FieldMask(paths=["display_name", "labels"]),
)

updated = client.update_instance(request=request).result(timeout=3600)
print(updated.display_name)
```

### Restart or delete an instance

Both operations are long-running.

```python
from google.cloud import data_fusion_v1

client = data_fusion_v1.DataFusionClient()
name = "projects/your-project-id/locations/us-central1/instances/analytics-dev"

client.restart_instance(name=name).result(timeout=3600)
client.delete_instance(name=name).result(timeout=3600)
```

## Practical Notes

- Package name and import path differ: install `google-cloud-data-fusion`, import `data_fusion_v1`.
- Resource names are regional: `projects/{project}/locations/{location}/instances/{instance}`.
- `instance_id` is the stable resource ID. `display_name` is only a label for humans.
- `create_instance`, `update_instance`, `restart_instance`, and `delete_instance` return long-running operations. Do not assume the change is finished until `.result()` completes.
- Use `list_available_versions()` before provisioning instead of copying a version string from an old article or console screenshot.
- If your task is pipeline design, namespace management, or Studio interaction, this package is not the main API surface. Start with the Data Fusion product docs for that workflow.

## Version Notes For 1.15.0

- PyPI and the generated Python reference both show `1.15.0` as the current library version covered here as of March 13, 2026.
- The upstream changelog for `1.15.0` is a routine generated-library release; check the current reference if you are adapting examples from older `1.13.x` or `1.14.x` posts.

## Official Sources Used

- PyPI package page: `https://pypi.org/project/google-cloud-data-fusion/`
- PyPI JSON metadata: `https://pypi.org/pypi/google-cloud-data-fusion/json`
- Generated package reference and README: `https://googleapis.dev/python/datafusion/latest/`
- `DataFusionClient` reference: `https://googleapis.dev/python/datafusion/latest/data_fusion_v1/services.html#module-data_fusion_v1.services.data_fusion`
- `Instance` type reference: `https://googleapis.dev/python/datafusion/latest/data_fusion_v1/types.html#data_fusion_v1.types.Instance`
- ADC setup: `https://cloud.google.com/docs/authentication/provide-credentials-adc`
- Cloud Data Fusion create-instance guide: `https://cloud.google.com/data-fusion/docs/how-to/create-instance`
- Changelog: `https://googleapis.dev/python/datafusion/latest/changelog.html`
