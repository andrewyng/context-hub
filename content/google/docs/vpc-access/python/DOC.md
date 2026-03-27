---
name: vpc-access
description: "Google Cloud Serverless VPC Access Python client for creating, listing, inspecting, and deleting VPC connectors"
metadata:
  languages: "python"
  versions: "1.15.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,gcp,google-cloud,vpc-access,serverless-vpc-access,networking,python"
---

# google-cloud-vpc-access Python Package Guide

## What This Package Is

`google-cloud-vpc-access` is the official Python client for the Serverless VPC Access API. Use it to manage connector resources that let App Engine, Cloud Functions, and Cloud Run reach resources on a VPC network.

This package manages the connector itself. It does not deploy or reconfigure your Cloud Run, Cloud Functions, or App Engine services to use that connector.

## Version Note

This guide targets `google-cloud-vpc-access==1.15.0`, which PyPI lists as the current release as of `2026-03-13`.

Import path:

```python
from google.cloud import vpcaccess_v1
```

PyPI currently lists `Python >=3.7`.

## Install

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "google-cloud-vpc-access==1.15.0"
```

Common alternatives:

```bash
uv add "google-cloud-vpc-access==1.15.0"
poetry add "google-cloud-vpc-access==1.15.0"
```

## Authentication And Prerequisites

Before creating connectors:

1. Choose the Google Cloud project that will own the connector.
2. Enable billing for that project.
3. Enable the Serverless VPC Access API.
4. Configure Application Default Credentials (ADC).

Enable the API:

```bash
gcloud services enable vpcaccess.googleapis.com
```

Local development with ADC:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="my-project"
export GOOGLE_CLOUD_LOCATION="us-central1"
export GOOGLE_CLOUD_NETWORK="default"
export GOOGLE_CLOUD_SUBNET="serverless-subnet"
```

Service account key fallback:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

Use a regional location such as `us-central1`. Product docs note that the connector region must match the region of the serverless service that will use it.

If you are connecting Cloud Run and Direct VPC egress satisfies your requirements, Google recommends Direct VPC egress instead of a connector. Use this package when you specifically need Serverless VPC Access connectors.

## Client Initialization

Default client with ADC:

```python
from google.cloud import vpcaccess_v1

client = vpcaccess_v1.VpcAccessServiceClient()
```

Explicit service account file:

```python
from google.cloud import vpcaccess_v1

client = vpcaccess_v1.VpcAccessServiceClient.from_service_account_file(
    "/absolute/path/service-account.json"
)
```

Useful resource helpers:

```python
from google.cloud import vpcaccess_v1

client = vpcaccess_v1.VpcAccessServiceClient()

parent = client.common_location_path("my-project", "us-central1")
connector_name = client.connector_path("my-project", "us-central1", "orders-vpc")
```

Connector resource names use:

- parent: `projects/{project_id}/locations/{region}`
- connector: `projects/{project_id}/locations/{region}/connectors/{connector_id}`

## Core Usage

### List connectors in a region

```python
import os

from google.cloud import vpcaccess_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ["GOOGLE_CLOUD_LOCATION"]

client = vpcaccess_v1.VpcAccessServiceClient()
parent = client.common_location_path(project_id, location)

for connector in client.list_connectors(parent=parent):
    state = vpcaccess_v1.Connector.State(connector.state).name
    print(connector.name, state)
```

### Create a connector on an existing subnet

Use this when you already created a dedicated subnet for the connector.

```python
import os

from google.cloud import vpcaccess_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ["GOOGLE_CLOUD_LOCATION"]
network = os.environ["GOOGLE_CLOUD_NETWORK"]
subnet = os.environ["GOOGLE_CLOUD_SUBNET"]

client = vpcaccess_v1.VpcAccessServiceClient()
parent = client.common_location_path(project_id, location)

operation = client.create_connector(
    parent=parent,
    connector_id="orders-vpc",
    connector=vpcaccess_v1.Connector(
        network=network,
        subnet=vpcaccess_v1.Connector.Subnet(name=subnet),
        machine_type="e2-micro",
        min_instances=2,
        max_instances=3,
    ),
)

connector = operation.result(timeout=1800)
print(connector.name)
```

### Create a connector and let Google create a new `/28` subnet

Use this when you want Google Cloud to create the connector subnet from an unused CIDR range.

```python
import os

from google.cloud import vpcaccess_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ["GOOGLE_CLOUD_LOCATION"]
network = os.environ["GOOGLE_CLOUD_NETWORK"]

client = vpcaccess_v1.VpcAccessServiceClient()
parent = client.common_location_path(project_id, location)

operation = client.create_connector(
    parent=parent,
    connector_id="orders-vpc",
    connector=vpcaccess_v1.Connector(
        network=network,
        ip_cidr_range="10.8.0.0/28",
        machine_type="e2-micro",
        min_instances=2,
        max_instances=3,
    ),
)

connector = operation.result(timeout=1800)
print(connector.name)
```

### Get one connector and inspect status

`get_connector()` is the simplest way to confirm the final connector state after creation.

```python
import os

from google.cloud import vpcaccess_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ["GOOGLE_CLOUD_LOCATION"]

client = vpcaccess_v1.VpcAccessServiceClient()
name = client.connector_path(project_id, location, "orders-vpc")

connector = client.get_connector(name=name)

print(connector.name)
print(vpcaccess_v1.Connector.State(connector.state).name)
print(list(connector.connected_projects))
```

The connector is ready to use when its state is `READY`.

### Delete a connector

Delete is also a long-running operation.

```python
import os

from google.cloud import vpcaccess_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ["GOOGLE_CLOUD_LOCATION"]

client = vpcaccess_v1.VpcAccessServiceClient()
name = client.connector_path(project_id, location, "orders-vpc")

operation = client.delete_connector(name=name)
operation.result(timeout=1800)
print(f"Deleted {name}")
```

## Operational Notes

- The client surface is intentionally small: `create_connector()`, `list_connectors()`, `get_connector()`, and `delete_connector()` are the main operations.
- Create and delete both return long-running operations. Wait for `.result()` before assuming the connector exists or is gone.
- Connector states include `READY`, `CREATING`, `DELETING`, `ERROR`, and `UPDATING`.
- `connected_projects` is output-only and is useful for checking which projects still rely on a connector before cleanup.

## Common Pitfalls

- Connector names must follow Compute Engine naming rules, must be less than 21 characters long, and hyphens count as two characters.
- The connector region must match the region of the serverless resource that will use it.
- A connector subnet must stay `/28`. If you let Google create the subnet, choose an unused `/28` CIDR range that does not conflict with existing routes.
- Product docs note that if the connector scales up to its configured maximum number of instances, it does not scale back down automatically.
- Before deleting a connector, remove it from any Cloud Run, Cloud Functions, or App Engine resources that still use it.
- If you create a connector in a service project that targets a Shared VPC network in a host project, Google requires the subnet to exist first and requires additional firewall rules for connector traffic.

## Optional Logging

Google's PyPI docs describe an environment-variable-based logging switch for Google client libraries:

```bash
export GOOGLE_SDK_PYTHON_LOGGING_SCOPE="google.cloud.vpcaccess_v1"
```

That enables default structured logging for this library without changing application code.

## Official Sources

- Python client reference root: https://cloud.google.com/python/docs/reference/vpcaccess/latest
- `VpcAccessServiceClient` reference: https://docs.cloud.google.com/python/docs/reference/vpcaccess/latest/google.cloud.vpcaccess_v1.services.vpc_access_service.VpcAccessServiceClient
- `Connector` type reference: https://docs.cloud.google.com/python/docs/reference/vpcaccess/latest/google.cloud.vpcaccess_v1.types.Connector
- PyPI package page: https://pypi.org/project/google-cloud-vpc-access/
- Serverless VPC Access product guide: https://cloud.google.com/vpc/docs/configure-serverless-vpc-access
- Cloud Run connectors guide: https://cloud.google.com/run/docs/configuring/vpc-connectors
- Cloud Run Direct VPC egress guide: https://cloud.google.com/run/docs/configuring/vpc-direct-vpc
