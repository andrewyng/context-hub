---
name: certificate-manager
description: "Google Cloud Certificate Manager Python client for DNS authorizations, managed and self-managed certificates, and certificate maps"
metadata:
  languages: "python"
  versions: "1.12.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,gcp,certificate-manager,tls,ssl,load-balancing,dns,python"
---

# google-cloud-certificate-manager Python Package Guide

Use `google-cloud-certificate-manager` for Python code that manages Certificate Manager resources in Google Cloud: DNS authorizations, Google-managed certificates, self-managed certificates, certificate maps, and certificate map entries.

## Golden Rule

- Install and import the official client: `from google.cloud import certificate_manager_v1`.
- Use Application Default Credentials (ADC) unless you have a specific reason to pass explicit credentials.
- Keep the resource location explicit. The common Certificate Manager workflows in the official docs use `locations/global`.
- Treat create, update, and delete calls as long-running operations and wait on `operation.result()`.
- For Google-managed certificates, create the DNS authorization first and publish the returned CNAME record before expecting issuance to complete.

## Install

Pin the package version your project expects:

```bash
python -m pip install "google-cloud-certificate-manager==1.12.0"
```

Common alternatives:

```bash
uv add "google-cloud-certificate-manager==1.12.0"
poetry add "google-cloud-certificate-manager==1.12.0"
```

PyPI currently lists Python `>=3.7` for this package.

## Authentication And Setup

This client uses Google Cloud credentials, not API keys.

Typical local setup:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="your-project-id"
export GOOGLE_CLOUD_LOCATION="global"
```

If you must use a service-account key:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
export GOOGLE_CLOUD_PROJECT="your-project-id"
export GOOGLE_CLOUD_LOCATION="global"
```

Before calling the API:

1. Enable Certificate Manager on the target project.
2. Make sure the credential has permission to manage Certificate Manager resources in that project.
3. Decide which location you are targeting. The examples below use `global`, which matches the common product documentation flows for certificates, DNS authorizations, and certificate maps.

## Initialize The Client

Basic client initialization with ADC:

```python
import os

from google.cloud import certificate_manager_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "global")
parent = f"projects/{project_id}/locations/{location}"

client = certificate_manager_v1.CertificateManagerClient()
```

Explicit credentials also work:

```python
import os

from google.cloud import certificate_manager_v1
from google.oauth2 import service_account

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "global")
parent = f"projects/{project_id}/locations/{location}"

credentials = service_account.Credentials.from_service_account_file(
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"]
)

client = certificate_manager_v1.CertificateManagerClient(credentials=credentials)
```

## Core Usage

### List certificates

List methods return pagers, so normal iteration handles pagination:

```python
import os

from google.cloud import certificate_manager_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "global")
parent = f"projects/{project_id}/locations/{location}"

client = certificate_manager_v1.CertificateManagerClient()

for certificate in client.list_certificates(request={"parent": parent}):
    print(certificate.name)
```

### Create a DNS authorization

Certificate Manager returns the DNS record you must publish for domain control validation:

```python
import os

from google.cloud import certificate_manager_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "global")
parent = f"projects/{project_id}/locations/{location}"

client = certificate_manager_v1.CertificateManagerClient()

operation = client.create_dns_authorization(
    request={
        "parent": parent,
        "dns_authorization_id": "example-com-auth",
        "dns_authorization": {
            "domain": "example.com",
        },
    }
)

dns_authorization = operation.result(timeout=600)
record = dns_authorization.dns_resource_record

print("Create this DNS record before requesting a managed certificate:")
print(record.name)
print(record.type_)
print(record.data)
```

The product docs describe this record as the CNAME you add to your DNS zone for authorization.

### Create a Google-managed certificate

After the DNS authorization exists and its CNAME record is published, create the managed certificate and reference the authorization resource name:

```python
import os

from google.cloud import certificate_manager_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "global")
parent = f"projects/{project_id}/locations/{location}"

client = certificate_manager_v1.CertificateManagerClient()

dns_authorization_name = (
    f"{parent}/dnsAuthorizations/example-com-auth"
)

operation = client.create_certificate(
    request={
        "parent": parent,
        "certificate_id": "example-com-cert",
        "certificate": {
            "managed": {
                "domains": ["example.com"],
                "dns_authorizations": [dns_authorization_name],
            }
        },
    }
)

certificate = operation.result(timeout=600)
print(certificate.name)
```

Certificate creation is asynchronous. The resource can exist before Google finishes provisioning and attaching the certificate material, so plan for DNS propagation and issuance time.

### Upload a self-managed certificate

Self-managed certificates use PEM content, not a `.p12` or other binary bundle:

```python
import os

from google.cloud import certificate_manager_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "global")
parent = f"projects/{project_id}/locations/{location}"

client = certificate_manager_v1.CertificateManagerClient()

with open("fullchain.pem", "r", encoding="utf-8") as cert_file:
    pem_certificate = cert_file.read()

with open("privkey.pem", "r", encoding="utf-8") as key_file:
    pem_private_key = key_file.read()

operation = client.create_certificate(
    request={
        "parent": parent,
        "certificate_id": "self-managed-cert",
        "certificate": {
            "self_managed": {
                "pem_certificate": pem_certificate,
                "pem_private_key": pem_private_key,
            }
        },
    }
)

certificate = operation.result(timeout=600)
print(certificate.name)
```

### Create a certificate map and map entry

Certificate maps let you bind hostnames to certificates for supported load-balancing integrations:

```python
import os

from google.cloud import certificate_manager_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "global")
parent = f"projects/{project_id}/locations/{location}"

client = certificate_manager_v1.CertificateManagerClient()

map_operation = client.create_certificate_map(
    request={
        "parent": parent,
        "certificate_map_id": "edge-map",
        "certificate_map": {},
    }
)
certificate_map = map_operation.result(timeout=600)

certificate_name = f"{parent}/certificates/example-com-cert"

entry_operation = client.create_certificate_map_entry(
    request={
        "parent": certificate_map.name,
        "certificate_map_entry_id": "example-com",
        "certificate_map_entry": {
            "hostname": "example.com",
            "certificates": [certificate_name],
        },
    }
)
entry = entry_operation.result(timeout=600)
print(entry.name)
```

## Common Pitfalls

- `create_*`, `update_*`, and `delete_*` methods return long-running operations. If you skip `operation.result()`, your script will usually exit before the server-side work finishes.
- The DNS authorization step gives you the authoritative CNAME record to publish. Do not guess the record name or value.
- Google-managed certificate issuance depends on the DNS authorization record being published and propagated.
- Self-managed certificate uploads require PEM text in `pem_certificate` and `pem_private_key`.
- The package uses the import path `google.cloud.certificate_manager_v1`, even though the PyPI package name is `google-cloud-certificate-manager`.
- Certificate map entries are created under the certificate map resource name, not directly under the location parent.
- The product docs note that you must remove certificate map entries and detach the map from target proxies before deleting a certificate map.

## Version-Sensitive Notes

- PyPI currently lists `google-cloud-certificate-manager 1.12.0`.
- The generated Python client reference for `CertificateManagerClient` is already published under the `1.12.0` docs path.
- Some generated type pages under the `latest` docs root still render older version labels such as `1.11.0`. When that happens, prefer the current package version on PyPI and the current client-method reference pages for method names and request shapes.

## Official Sources

- PyPI package: https://pypi.org/project/google-cloud-certificate-manager/
- Maintainer package directory: https://github.com/googleapis/google-cloud-python/tree/main/packages/google-cloud-certificate-manager
- Python reference root: https://cloud.google.com/python/docs/reference/certificate-manager/latest
- `CertificateManagerClient` reference: https://cloud.google.com/python/docs/reference/certificate-manager/latest/google.cloud.certificate_manager_v1.services.certificate_manager.CertificateManagerClient
- `DnsAuthorization` reference: https://cloud.google.com/python/docs/reference/certificate-manager/latest/google.cloud.certificate_manager_v1.types.DnsAuthorization
- `DnsAuthorization.DnsResourceRecord` reference: https://cloud.google.com/python/docs/reference/certificate-manager/latest/google.cloud.certificate_manager_v1.types.DnsAuthorization.DnsResourceRecord
- Certificate Manager API reference: https://cloud.google.com/certificate-manager/docs/reference/certificate-manager/rpc/google.cloud.certificatemanager.v1
- Create and deploy Google-managed certificates: https://cloud.google.com/certificate-manager/docs/deploy-google-managed-dns-auth
- Create and deploy self-managed certificates: https://cloud.google.com/certificate-manager/docs/deploy-self-managed-dns-auth
- Manage certificate maps: https://cloud.google.com/certificate-manager/docs/maps
