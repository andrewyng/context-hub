---
name: ids
description: "google-cloud-ids package guide for Python covering ADC setup, Cloud IDS endpoint lifecycle, and packet mirroring prerequisites"
metadata:
  languages: "python"
  versions: "1.12.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,cloud-ids,ids,security,packet-mirroring,network,python"
---

# google-cloud-ids Python Package Guide

## Golden Rule

Use `google-cloud-ids` to manage Cloud IDS endpoints from Python, and use Google Cloud Application Default Credentials (ADC) unless you have a concrete reason to inject credentials manually.

This package manages the Cloud IDS endpoint resource itself. Traffic is not inspected until you attach a Packet Mirroring policy to the endpoint's forwarding rule.

## Install

Pin the package version your project expects:

```bash
python -m pip install "google-cloud-ids==1.12.0"
```

Common alternatives:

```bash
uv add "google-cloud-ids==1.12.0"
poetry add "google-cloud-ids==1.12.0"
```

## Authentication And Prerequisites

Before creating endpoints:

1. Enable Cloud IDS for the Google Cloud project.
2. Enable the Service Networking API and configure private services access for the VPC that will host the endpoint.
3. Grant the caller Cloud IDS permissions such as `roles/ids.admin` for create/delete flows or `roles/ids.viewer` for read-only access.
4. Grant `roles/compute.packetMirroringUser` if the same operator will attach a Packet Mirroring policy to the endpoint.
5. Authenticate with ADC for local development or with an attached service account in deployed environments.

Local ADC setup:

```bash
gcloud auth application-default login

export GOOGLE_CLOUD_PROJECT="your-project-id"
export GOOGLE_CLOUD_LOCATION="us-central1-a"
export GOOGLE_CLOUD_NETWORK="projects/your-project-id/global/networks/my-vpc"
export GOOGLE_CLOUD_IDS_ENDPOINT_ID="prod-inspection"
```

Service account key fallback:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

Use a full VPC network resource name in code. The generated `Endpoint.network` field expects the fully qualified network URL.

## Initialize A Client

```python
import os

from google.cloud import ids_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ["GOOGLE_CLOUD_LOCATION"]  # Zonal location, for example us-central1-a
network = os.environ["GOOGLE_CLOUD_NETWORK"]
endpoint_id = os.environ["GOOGLE_CLOUD_IDS_ENDPOINT_ID"]

client = ids_v1.IDSClient()
parent = client.common_location_path(project_id, location)
endpoint_name = client.endpoint_path(project_id, location, endpoint_id)
```

If your environment requires a non-default API endpoint, pass `client_options` when creating the client:

```python
from google.api_core.client_options import ClientOptions
from google.cloud import ids_v1

client = ids_v1.IDSClient(
    client_options=ClientOptions(
        api_endpoint=os.environ["GOOGLE_CLOUD_IDS_API_ENDPOINT"]
    )
)
```

Explicit credentials are also supported:

```python
from google.cloud import ids_v1
from google.oauth2 import service_account

credentials = service_account.Credentials.from_service_account_file(
    "/absolute/path/service-account.json"
)

client = ids_v1.IDSClient(credentials=credentials)
```

## Core Workflow

### Create An Endpoint

Creating an endpoint is a long-running operation. Wait for `operation.result()` before using the endpoint in later steps.

```python
import os
import uuid

from google.cloud import ids_v1

client = ids_v1.IDSClient()
parent = client.common_location_path(
    os.environ["GOOGLE_CLOUD_PROJECT"],
    os.environ["GOOGLE_CLOUD_LOCATION"],
)

endpoint = ids_v1.Endpoint(
    network=os.environ["GOOGLE_CLOUD_NETWORK"],
    severity=ids_v1.Endpoint.Severity.HIGH,
    description="Inspect mirrored traffic for production subnets",
    traffic_logs=True,
    labels={"env": "prod"},
)

operation = client.create_endpoint(
    request=ids_v1.CreateEndpointRequest(
        parent=parent,
        endpoint_id=os.environ["GOOGLE_CLOUD_IDS_ENDPOINT_ID"],
        endpoint=endpoint,
        request_id=str(uuid.uuid4()),
    )
)

created = operation.result(timeout=1800)

print(created.name)
print(created.endpoint_forwarding_rule)
print(created.endpoint_ip)
print(created.state)
```

Important request details:

- `endpoint_id` must start with a lowercase letter, can include lowercase letters, digits, and hyphens, and cannot end with a hyphen.
- `severity` accepts Cloud IDS alerting levels such as `INFORMATIONAL`, `LOW`, `MEDIUM`, `HIGH`, and `CRITICAL`.
- `traffic_logs=True` enables logs for the endpoint.

### Get One Endpoint

```python
import os

from google.cloud import ids_v1

client = ids_v1.IDSClient()
name = client.endpoint_path(
    os.environ["GOOGLE_CLOUD_PROJECT"],
    os.environ["GOOGLE_CLOUD_LOCATION"],
    os.environ["GOOGLE_CLOUD_IDS_ENDPOINT_ID"],
)

endpoint = client.get_endpoint(name=name)

print(endpoint.name)
print(endpoint.state)
print(endpoint.endpoint_forwarding_rule)
```

### List Endpoints In A Location

```python
import os

from google.cloud import ids_v1

client = ids_v1.IDSClient()
parent = client.common_location_path(
    os.environ["GOOGLE_CLOUD_PROJECT"],
    os.environ["GOOGLE_CLOUD_LOCATION"],
)

for endpoint in client.list_endpoints(
    request=ids_v1.ListEndpointsRequest(parent=parent)
):
    print(endpoint.name, endpoint.state, endpoint.severity)
```

### Attach Packet Mirroring To The Endpoint

The endpoint does not inspect traffic by itself. After creation, use the returned `endpoint_forwarding_rule` as the packet-mirroring collector.

```python
collector_ilb = created.endpoint_forwarding_rule
print(collector_ilb)
```

Example `gcloud` workflow using that forwarding rule:

```bash
gcloud compute packet-mirrorings create ids-mirror \
  --project="$GOOGLE_CLOUD_PROJECT" \
  --region="us-central1" \
  --network="my-vpc" \
  --collector-ilb="projects/your-project-id/regions/us-central1/forwardingRules/..." \
  --mirrored-subnets="my-subnet"
```

Keep the packet-mirroring policy and mirrored subnets in the same region as the IDS endpoint.

### Delete An Endpoint

Delete endpoints you no longer need. Google Cloud product docs note that an endpoint keeps incurring charges until you delete it.

```python
import os

from google.cloud import ids_v1

client = ids_v1.IDSClient()
name = client.endpoint_path(
    os.environ["GOOGLE_CLOUD_PROJECT"],
    os.environ["GOOGLE_CLOUD_LOCATION"],
    os.environ["GOOGLE_CLOUD_IDS_ENDPOINT_ID"],
)

operation = client.delete_endpoint(name=name)
operation.result(timeout=1800)
```

## Common Pitfalls

- Creating the endpoint is only half of the setup. You still need Packet Mirroring before traffic is inspected.
- Cloud IDS endpoint creation depends on VPC setup outside this package. If private services access or Service Networking is missing, the create call will fail even though your Python code is correct.
- Cloud IDS endpoints are zonal resources such as `us-central1-a`, while packet-mirroring policies are regional. Keep the mirrored subnets in the same region as the endpoint.
- `create_endpoint` and `delete_endpoint` are long-running operations. Do not assume the resource is ready or gone until `operation.result()` completes.
- Use a fully qualified network resource name like `projects/PROJECT_ID/global/networks/VPC_NAME` instead of a short network name.
- Plan capacity per endpoint. Cloud IDS documentation recommends one endpoint per region and one endpoint for each 5 Gbps of peak traffic.

## Official Sources

- Google Cloud IDS Python reference: https://cloud.google.com/python/docs/reference/ids/latest
- `IDSClient` reference: https://docs.cloud.google.com/python/docs/reference/ids/latest/google.cloud.ids_v1.services.ids.IDSClient
- `Endpoint` reference: https://docs.cloud.google.com/python/docs/reference/ids/latest/google.cloud.ids_v1.types.Endpoint
- Cloud IDS best practice: https://cloud.google.com/intrusion-detection-system/docs/best-practice
- Create and configure endpoints: https://cloud.google.com/intrusion-detection-system/docs/configuring-ids
- Cloud IDS overview: https://cloud.google.com/intrusion-detection-system/docs/overview
- ADC setup: https://cloud.google.com/docs/authentication/set-up-adc-local-dev-environment
- PyPI package page: https://pypi.org/project/google-cloud-ids/
