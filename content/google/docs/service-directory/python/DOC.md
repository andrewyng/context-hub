---
name: service-directory
description: "Google Cloud Service Directory Python client for registering namespaces, services, and endpoints and resolving them at runtime"
metadata:
  languages: "python"
  versions: "1.16.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,gcp,service-directory,service-discovery,dns,python"
---

# Google Cloud Service Directory Python Client Library

## Golden Rule

Use `google-cloud-service-directory` with `from google.cloud import servicedirectory_v1`, authenticate with Application Default Credentials (ADC), and keep registration calls separate from runtime lookups:

- `RegistrationServiceClient` for namespaces, services, endpoints, updates, and deletes
- `LookupServiceClient` for `resolve_service()` during service discovery

The main resource hierarchy is:

- `projects/{project}/locations/{location}/namespaces/{namespace}`
- `projects/{project}/locations/{location}/namespaces/{namespace}/services/{service}`
- `projects/{project}/locations/{location}/namespaces/{namespace}/services/{service}/endpoints/{endpoint}`

## Version-Sensitive Notes

Pin `google-cloud-service-directory==1.16.0` when you want the package version covered here. PyPI lists `1.16.0` as the current release and requires Python 3.7 or newer.

The generated Cloud Python reference currently lags the PyPI release metadata: the package changelog page currently tops out at `1.15.0`. Use PyPI for installable package version tracking and the Cloud Python reference for method names, request types, and field behavior.

## Install

```bash
python -m pip install "google-cloud-service-directory==1.16.0"
```

Common alternatives:

```bash
uv add "google-cloud-service-directory==1.16.0"
poetry add "google-cloud-service-directory==1.16.0"
```

## Authentication And Setup

This library uses Google Cloud ADC by default.

Local development:

```bash
gcloud auth application-default login
gcloud services enable servicedirectory.googleapis.com

export GOOGLE_CLOUD_PROJECT="your-project-id"
export GOOGLE_CLOUD_LOCATION="us-east1"
export SERVICE_DIRECTORY_NAMESPACE="backend"
export SERVICE_DIRECTORY_SERVICE="payments"
```

Service account key fallback:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
export GOOGLE_CLOUD_PROJECT="your-project-id"
export GOOGLE_CLOUD_LOCATION="us-east1"
```

Important setup points:

- A namespace belongs to one region and cannot span multiple regions.
- Services remain globally resolvable, but Google recommends choosing a region close to your services and clients.
- The calling identity needs Service Directory permissions on the target project. If you set `Endpoint.network`, it also needs `servicedirectory.networks.attach` on that VPC network.

## Initialize Clients

```python
import os

from google.cloud import servicedirectory_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ["GOOGLE_CLOUD_LOCATION"]
namespace_id = os.environ["SERVICE_DIRECTORY_NAMESPACE"]
service_id = os.environ["SERVICE_DIRECTORY_SERVICE"]

registration = servicedirectory_v1.RegistrationServiceClient()
lookup = servicedirectory_v1.LookupServiceClient()

location_name = f"projects/{project_id}/locations/{location}"
namespace_name = registration.namespace_path(project_id, location, namespace_id)
service_name = registration.service_path(
    project_id,
    location,
    namespace_id,
    service_id,
)
```

Explicit credentials:

```python
from google.cloud import servicedirectory_v1
from google.oauth2 import service_account

credentials = service_account.Credentials.from_service_account_file(
    "/path/to/service-account.json"
)

registration = servicedirectory_v1.RegistrationServiceClient(
    credentials=credentials
)
```

## Core Workflow

### Create a namespace

```python
from google.cloud import servicedirectory_v1

client = servicedirectory_v1.RegistrationServiceClient()

namespace = servicedirectory_v1.Namespace(
    name=client.namespace_path("your-project-id", "us-east1", "backend"),
    labels={"env": "dev"},
)

created = client.create_namespace(
    parent="projects/your-project-id/locations/us-east1",
    namespace=namespace,
    namespace_id="backend",
)

print(created.name)
```

### Create a service

```python
from google.cloud import servicedirectory_v1

client = servicedirectory_v1.RegistrationServiceClient()
namespace_name = client.namespace_path("your-project-id", "us-east1", "backend")

service = servicedirectory_v1.Service(
    name=client.service_path("your-project-id", "us-east1", "backend", "payments"),
    annotations={"protocol": "grpc", "owner": "checkout"},
)

created = client.create_service(
    parent=namespace_name,
    service=service,
    service_id="payments",
)

print(created.name)
```

### Create an endpoint

Register concrete backends under the service. `address` is an IP address and `port` is an integer.

```python
from google.cloud import servicedirectory_v1

client = servicedirectory_v1.RegistrationServiceClient()
service_name = client.service_path("your-project-id", "us-east1", "backend", "payments")

endpoint = servicedirectory_v1.Endpoint(
    name=client.endpoint_path(
        "your-project-id",
        "us-east1",
        "backend",
        "payments",
        "payments-1",
    ),
    address="10.10.0.15",
    port=8443,
    annotations={"version": "v1", "zone": "us-east1-b"},
)

created = client.create_endpoint(
    parent=service_name,
    endpoint=endpoint,
    endpoint_id="payments-1",
)

print(created.name, created.address, created.port)
```

If you want to attach the endpoint to a VPC network, set `network` to the full network resource using the project number, not the project ID:

```python
endpoint = servicedirectory_v1.Endpoint(
    address="10.10.0.15",
    port=8443,
    network="projects/123456789012/locations/global/networks/default",
)
```

### Resolve a service at runtime

Use `LookupServiceClient.resolve_service()` for discovery. That is the lookup API intended to return the service and its endpoints.

```python
from google.cloud import servicedirectory_v1

lookup = servicedirectory_v1.LookupServiceClient()

response = lookup.resolve_service(
    request=servicedirectory_v1.ResolveServiceRequest(
        name="projects/your-project-id/locations/us-east1/namespaces/backend/services/payments"
    )
)

print(response.service.name)

for endpoint in response.service.endpoints:
    print(endpoint.name, endpoint.address, endpoint.port, dict(endpoint.annotations))
```

### List endpoints with a filter

`list_endpoints()` accepts a filter expression. The reference docs include examples such as `annotations.owner=sre` and `port>8080`.

```python
from google.cloud import servicedirectory_v1

client = servicedirectory_v1.RegistrationServiceClient()

pager = client.list_endpoints(
    request=servicedirectory_v1.ListEndpointsRequest(
        parent="projects/your-project-id/locations/us-east1/namespaces/backend/services/payments",
        filter="annotations.version=v1 OR port=8443",
    )
)

for endpoint in pager:
    print(endpoint.name, endpoint.address, endpoint.port)
```

### Update labels or annotations

Use a field mask so the API only changes the fields you intend to modify.

```python
from google.cloud import servicedirectory_v1
from google.protobuf.field_mask_pb2 import FieldMask

client = servicedirectory_v1.RegistrationServiceClient()

updated_service = client.update_service(
    service=servicedirectory_v1.Service(
        name="projects/your-project-id/locations/us-east1/namespaces/backend/services/payments",
        annotations={
            "protocol": "grpc",
            "owner": "checkout",
            "stage": "prod",
        },
    ),
    update_mask=FieldMask(paths=["annotations"]),
)

print(updated_service.annotations)
```

Updating namespace labels uses the same pattern:

```python
updated_namespace = client.update_namespace(
    namespace=servicedirectory_v1.Namespace(
        name="projects/your-project-id/locations/us-east1/namespaces/backend",
        labels={"env": "prod"},
    ),
    update_mask=FieldMask(paths=["labels"]),
)
```

### Delete a namespace

Deleting a namespace also deletes every service and endpoint inside it.

```python
from google.cloud import servicedirectory_v1

client = servicedirectory_v1.RegistrationServiceClient()

client.delete_namespace(
    name="projects/your-project-id/locations/us-east1/namespaces/backend"
)
```

If you only want to remove one service or one endpoint, use `delete_service()` or `delete_endpoint()` instead.

## Common Pitfalls

- Use `resolve_service()` for discovery. `get_service()` and `get_endpoint()` are administrative reads, not the main service-resolution path.
- Namespace IDs and service IDs follow DNS label style rules. Keep them lowercase and avoid trying to use arbitrary display names as IDs.
- `Endpoint.address` is only the IP address. Do not pass `host:port`, a URL, or bracketed IPv6 plus port.
- `Endpoint.network` is immutable after creation and must use the full VPC resource path with the project number.
- Service annotations are capped at 2000 total characters. Endpoint annotations are capped at 512 total characters. Namespace labels follow Google Cloud label limits.
- Deleting a namespace is recursive. If you attached a DNS zone to that namespace, deleting it causes those lookups to start returning `NXDOMAIN`.

## Official Sources

- PyPI package: https://pypi.org/project/google-cloud-service-directory/
- Python client reference root: https://cloud.google.com/python/docs/reference/servicedirectory/latest
- `RegistrationServiceClient` reference: https://cloud.google.com/python/docs/reference/servicedirectory/latest/google.cloud.servicedirectory_v1.services.registration_service.RegistrationServiceClient
- `LookupServiceClient` reference: https://cloud.google.com/python/docs/reference/servicedirectory/latest/google.cloud.servicedirectory_v1.services.lookup_service.LookupServiceClient
- Service Directory configuration guide: https://cloud.google.com/service-directory/docs/configuring-service-directory
- Service Directory authentication guide: https://cloud.google.com/service-directory/docs/authentication
- ADC guide: https://cloud.google.com/docs/authentication/provide-credentials-adc
- Package changelog page: https://docs.cloud.google.com/python/docs/reference/servicedirectory/latest/changelog
