---
name: network-security
description: "Google Cloud Network Security Python client for address groups and TLS policy resources in the Network Security API"
metadata:
  languages: "python"
  versions: "0.11.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,gcp,google-cloud,network-security,tls,mtls,address-groups,python"
---

# google-cloud-network-security Python Package Guide

## What This Package Is

`google-cloud-network-security` is the official Google Cloud Python client for the Network Security API.

For Python automation, the package is split across a few service clients:

- `network_security_v1.NetworkSecurityClient` for resources such as `ClientTlsPolicy`, `ServerTlsPolicy`, and `AuthorizationPolicy`
- `network_security_v1.AddressGroupServiceClient` for project-scoped address groups
- `network_security_v1.OrganizationAddressGroupServiceClient` for organization-scoped address groups

These resources are configuration objects. Creating them in this package does not attach them to a backend service, target HTTPS proxy, or firewall policy by itself.

## Version Note

This guide covers package version `0.11.0`, which PyPI lists for `google-cloud-network-security`.

Google's live Python reference currently has some Network Security class pages that still render `0.10.0` in the heading even under the `latest` selector. The resource names and method families below are taken from the current official reference docs, but you should expect the docs site to lag the PyPI patch version slightly.

## Install

```bash
python -m pip install "google-cloud-network-security==0.11.0"
```

Common alternatives:

```bash
uv add "google-cloud-network-security==0.11.0"
poetry add "google-cloud-network-security==0.11.0"
```

## Authentication And Setup

This client uses Google Cloud credentials, not API keys.

Before calling the API:

1. Select the Google Cloud project or organization that owns the Network Security resources.
2. Enable billing for the project.
3. Enable the Network Security API.
4. Configure Application Default Credentials (ADC).

Enable the API:

```bash
gcloud services enable networksecurity.googleapis.com
```

Local development with ADC:

```bash
gcloud auth application-default login

export GOOGLE_CLOUD_PROJECT="your-project-id"
export GOOGLE_CLOUD_LOCATION="global"
```

Service account key fallback:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
export GOOGLE_CLOUD_PROJECT="your-project-id"
export GOOGLE_CLOUD_LOCATION="global"
```

The examples below use `global`, which matches the common location pattern in the Network Security resource names documented by Google.

## Initialize Clients

Use ADC unless you have a concrete reason to inject credentials yourself:

```python
import os

from google.cloud import network_security_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "global")
parent = f"projects/{project_id}/locations/{location}"

network_client = network_security_v1.NetworkSecurityClient()
address_group_client = network_security_v1.AddressGroupServiceClient()
```

Explicit service-account credentials also work:

```python
import os

from google.cloud import network_security_v1
from google.oauth2 import service_account

credentials = service_account.Credentials.from_service_account_file(
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"]
)

network_client = network_security_v1.NetworkSecurityClient(credentials=credentials)
address_group_client = network_security_v1.AddressGroupServiceClient(
    credentials=credentials
)
```

If your environment requires a custom endpoint, pass `client_options`:

```python
import os

from google.api_core.client_options import ClientOptions
from google.cloud import network_security_v1

endpoint = os.environ["GOOGLE_API_ENDPOINT"]

network_client = network_security_v1.NetworkSecurityClient(
    client_options=ClientOptions(api_endpoint=endpoint)
)
```

## Core Workflows

### List authorization policies

Use the main Network Security client for policy resources:

```python
import os

from google.cloud import network_security_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "global")
parent = f"projects/{project_id}/locations/{location}"

client = network_security_v1.NetworkSecurityClient()

for policy in client.list_authorization_policies(parent=parent):
    print(policy.name)
```

`AuthorizationPolicy` controls how a server authorizes incoming connections, but the policy does not affect traffic until it is attached to a target HTTPS proxy or endpoint config selector.

### Create an address group and add items

Address groups are managed by `AddressGroupServiceClient`, not by `NetworkSecurityClient`.

```python
import os
import uuid

from google.cloud import network_security_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "global")
parent = f"projects/{project_id}/locations/{location}"

client = network_security_v1.AddressGroupServiceClient()

operation = client.create_address_group(
    request=network_security_v1.CreateAddressGroupRequest(
        parent=parent,
        address_group_id="corp-ipv4",
        address_group=network_security_v1.AddressGroup(
            description="Corporate office egress ranges",
            type_=network_security_v1.AddressGroup.Type.IPV4,
            capacity=100,
            items=["203.0.113.0/24"],
            labels={"env": "prod"},
        ),
        request_id=str(uuid.uuid4()),
    )
)

address_group = operation.result(timeout=600)
print(address_group.name)
```

Add more items later:

```python
import uuid

from google.cloud import network_security_v1

client = network_security_v1.AddressGroupServiceClient()

operation = client.add_address_group_items(
    request=network_security_v1.AddAddressGroupItemsRequest(
        address_group="projects/your-project-id/locations/global/addressGroups/corp-ipv4",
        items=["198.51.100.0/24", "192.0.2.15"],
        request_id=str(uuid.uuid4()),
    )
)

updated = operation.result(timeout=600)
print(updated.items)
```

List address groups in a project:

```python
import os

from google.cloud import network_security_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "global")
parent = f"projects/{project_id}/locations/{location}"

client = network_security_v1.AddressGroupServiceClient()

for group in client.list_address_groups(parent=parent):
    print(group.name, group.type_, group.capacity)
```

### See what still references an address group

This is useful before delete or migration work:

```python
from google.cloud import network_security_v1

client = network_security_v1.AddressGroupServiceClient()

for ref in client.list_address_group_references(
    address_group="projects/your-project-id/locations/global/addressGroups/corp-ipv4"
):
    print(ref)
```

### Create a client TLS policy for backend TLS

`ClientTlsPolicy` defines how a client authenticates connections to backends. The resource itself does nothing until it is attached to a backend service.

```python
import os
import uuid

from google.cloud import network_security_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "global")
parent = f"projects/{project_id}/locations/{location}"

client = network_security_v1.NetworkSecurityClient()

operation = client.create_client_tls_policy(
    request={
        "parent": parent,
        "client_tls_policy_id": "backend-tls",
        "client_tls_policy": {
            "description": "Validate backend certificates for secure.example.internal",
            "sni": "secure.example.internal",
            "server_validation_ca": [
                {"ca_cert_path": "/etc/ssl/certs/backend-root-ca.pem"}
            ],
            "labels": {"env": "prod"},
        },
        "request_id": str(uuid.uuid4()),
    }
)

policy = operation.result(timeout=600)
print(policy.name)
```

If `server_validation_ca` is empty, the client does not validate the backend server certificate.

### Create a server TLS policy

`ServerTlsPolicy` defines how a server authenticates incoming connections. The resource does not affect traffic until it is attached to a target HTTPS proxy or endpoint config selector.

```python
import os
import uuid

from google.cloud import network_security_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "global")
parent = f"projects/{project_id}/locations/{location}"

client = network_security_v1.NetworkSecurityClient()

operation = client.create_server_tls_policy(
    request={
        "parent": parent,
        "server_tls_policy_id": "frontend-tls",
        "server_tls_policy": {
            "description": "Terminate TLS for the frontend proxy",
            "server_certificate": {
                "local_filepath": {
                    "certificate_path": "/etc/tls/tls.crt",
                    "private_key_path": "/etc/tls/tls.key",
                }
            },
            "labels": {"env": "prod"},
        },
        "request_id": str(uuid.uuid4()),
    }
)

policy = operation.result(timeout=600)
print(policy.name)
```

For mixed plaintext and mTLS rollouts, the resource supports `allow_open` and `mtls_policy`, but `allow_open` cannot be combined with `server_certificate`.

## Common Pitfalls

- Use the right client for the resource. Address groups are managed by `AddressGroupServiceClient`; TLS and authorization policy resources use `NetworkSecurityClient`.
- Do not assume these resources are active immediately after creation. They are configuration objects that still need to be attached by the relevant Google Cloud product surface.
- Treat create, update, add-items, clone-items, and delete calls as long-running operations and wait on `operation.result()`.
- Set a `request_id` on mutating calls when you may retry. The API documents request deduplication behavior for at least 60 minutes.
- `AddressGroup.capacity` is required at create time. Plan capacity before the group is used broadly in policy references.
- `ClientTlsPolicy.server_validation_ca` matters. If you omit it, the client does not validate the backend server certificate.
- `ServerTlsPolicy.allow_open` is a permissive migration mode. Do not combine it with `server_certificate`; the reference docs explicitly mark that combination unsupported.
- Listing address-group references before deletion can save time. Policies or firewall configuration that still point at the group will block cleanup.

## Official Sources

- PyPI package: https://pypi.org/project/google-cloud-network-security/
- Python client overview: https://cloud.google.com/python/docs/reference/networksecurity/latest
- Network Security client reference: https://docs.cloud.google.com/python/docs/reference/networksecurity/latest/google.cloud.network_security_v1.services.network_security
- Address group service reference: https://docs.cloud.google.com/python/docs/reference/networksecurity/latest/google.cloud.network_security_v1.services.address_group_service
- AddressGroup type reference: https://docs.cloud.google.com/python/docs/reference/networksecurity/latest/google.cloud.network_security_v1.types.AddressGroup
- AddAddressGroupItemsRequest reference: https://docs.cloud.google.com/python/docs/reference/networksecurity/latest/google.cloud.network_security_v1.types.AddAddressGroupItemsRequest
- ServerTlsPolicy type reference: https://docs.cloud.google.com/python/docs/reference/networksecurity/latest/google.cloud.network_security_v1.types.ServerTlsPolicy
- ClientTlsPolicy type reference: https://docs.cloud.google.com/python/docs/reference/networksecurity/latest/google.cloud.network_security_v1alpha1.types.ClientTlsPolicy
- ValidationCA type reference: https://docs.cloud.google.com/python/docs/reference/networksecurity/latest/google.cloud.network_security_v1alpha1.types.ValidationCA
- CertificateProvider type reference: https://docs.cloud.google.com/python/docs/reference/networksecurity/latest/google.cloud.network_security_v1alpha1.types.CertificateProvider
