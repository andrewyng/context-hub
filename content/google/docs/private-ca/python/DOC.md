---
name: private-ca
description: "Google Cloud Private CA Python client for CA pools, private certificate authorities, certificate templates, issuance, and revocation"
metadata:
  languages: "python"
  versions: "1.17.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,gcp,private-ca,pki,tls,x509,certificates,python"
---

# google-cloud-private-ca Python Package Guide

Use `google-cloud-private-ca` for Python code that manages Google Cloud Certificate Authority Service resources: CA pools, certificate authorities, certificate templates, issued certificates, and certificate revocation.

## Golden Rule

- Install and import the official client: `import google.cloud.security.privateca_v1 as privateca_v1`.
- Use Application Default Credentials (ADC) unless you have a specific reason to pass an explicit credential object.
- Keep resource locations consistent. CA pools, certificate authorities, templates, and certificates are location-scoped, and certificate templates must be in the same location as the certificate.
- Treat create, enable, disable, restore, and delete operations on CA pools, certificate authorities, and certificate templates as long-running operations and wait on `operation.result()`.
- Prefer CSR-based issuance when the private key should stay outside Google Cloud. `create_certificate()` returns the issued leaf certificate plus the PEM chain.

This guide covers `1.17.0`.

## Install

Pin the package version your project expects:

```bash
python -m pip install "google-cloud-private-ca==1.17.0"
```

Common alternatives:

```bash
uv add "google-cloud-private-ca==1.17.0"
poetry add "google-cloud-private-ca==1.17.0"
```

## Authentication And Setup

This client uses Google Cloud credentials, not API keys.

Typical local setup:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="your-project-id"
export GOOGLE_CLOUD_LOCATION="us-central1"
```

If you must use a service-account key:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
export GOOGLE_CLOUD_PROJECT="your-project-id"
export GOOGLE_CLOUD_LOCATION="us-central1"
```

Before calling the API:

1. Enable Certificate Authority Service in the target project.
2. Decide which region you are using. Requests must stay consistent with the CA pool location.
3. Grant the narrowest IAM role that matches the operation.

Common IAM roles from the product docs:

- `roles/privateca.admin` for full administration
- `roles/privateca.caManager` for creating and updating CA pools, certificate authorities, templates, and revocations
- `roles/privateca.certificateManager` for requesting certificates and reading them back
- `roles/privateca.certificateRequester` for certificate requests only
- `roles/privateca.templateUser` to use a certificate template during issuance
- `roles/privateca.auditor` for read-only inspection

## Initialize The Client

Basic client initialization with ADC:

```python
import os

import google.cloud.security.privateca_v1 as privateca_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")

client = privateca_v1.CertificateAuthorityServiceClient()
location_path = client.common_location_path(project_id, location)
```

If you need to pass an explicit credential object, prefer `credentials=` instead of older `credentials_file`-style configuration:

```python
import os

from google.cloud.security import privateca_v1
from google.oauth2 import service_account

credentials = service_account.Credentials.from_service_account_file(
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"]
)

client = privateca_v1.CertificateAuthorityServiceClient(credentials=credentials)
```

Useful helper paths:

```python
ca_pool_path = client.ca_pool_path(project_id, location, "my-pool")
ca_path = client.certificate_authority_path(project_id, location, "my-pool", "root-ca")
certificate_path = client.certificate_path(project_id, location, "my-pool", "leaf-cert")
template_path = f"projects/{project_id}/locations/{location}/certificateTemplates/web-server"
```

## Core Usage

### Create a CA pool

CA pools group issuance policy, IAM policy, and the certificate authorities that issue from that pool.

```python
import os

import google.cloud.security.privateca_v1 as privateca_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")

client = privateca_v1.CertificateAuthorityServiceClient()

ca_pool = privateca_v1.CaPool(
    tier=privateca_v1.CaPool.Tier.ENTERPRISE,
)

operation = client.create_ca_pool(
    request=privateca_v1.CreateCaPoolRequest(
        parent=client.common_location_path(project_id, location),
        ca_pool_id="my-pool",
        ca_pool=ca_pool,
    )
)

created_pool = operation.result(timeout=600)
print(created_pool.name)
```

### Create a root certificate authority

The official sample creates a self-signed root CA under the pool:

```python
import os

import google.cloud.security.privateca_v1 as privateca_v1
from google.protobuf import duration_pb2

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")

client = privateca_v1.CertificateAuthorityServiceClient()

certificate_authority = privateca_v1.CertificateAuthority(
    type_=privateca_v1.CertificateAuthority.Type.SELF_SIGNED,
    key_spec=privateca_v1.CertificateAuthority.KeyVersionSpec(
        algorithm=privateca_v1.CertificateAuthority.SignHashAlgorithm.RSA_PKCS1_4096_SHA256,
    ),
    config=privateca_v1.CertificateConfig(
        subject_config=privateca_v1.CertificateConfig.SubjectConfig(
            subject=privateca_v1.Subject(
                common_name="Example Root CA",
                organization="Example Corp",
            )
        ),
        x509_config=privateca_v1.X509Parameters(
            key_usage=privateca_v1.KeyUsage(
                base_key_usage=privateca_v1.KeyUsage.KeyUsageOptions(
                    cert_sign=True,
                    crl_sign=True,
                )
            ),
            ca_options=privateca_v1.X509Parameters.CaOptions(is_ca=True),
        ),
    ),
    lifetime=duration_pb2.Duration(seconds=10 * 365 * 24 * 60 * 60),
)

operation = client.create_certificate_authority(
    request=privateca_v1.CreateCertificateAuthorityRequest(
        parent=client.ca_pool_path(project_id, location, "my-pool"),
        certificate_authority_id="root-ca",
        certificate_authority=certificate_authority,
    )
)

created_ca = operation.result(timeout=1800)
print(created_ca.name, created_ca.state)
```

### Enable the CA before issuing certificates

Creating the CA and having an enabled CA are separate steps in the product docs and samples:

```python
import os

import google.cloud.security.privateca_v1 as privateca_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")

client = privateca_v1.CertificateAuthorityServiceClient()
ca_name = client.certificate_authority_path(project_id, location, "my-pool", "root-ca")

operation = client.enable_certificate_authority(
    request=privateca_v1.EnableCertificateAuthorityRequest(name=ca_name)
)
operation.result(timeout=600)

ca = client.get_certificate_authority(request={"name": ca_name})
print(ca.state)
```

### Create a certificate template

Templates are reusable policy fragments. If you attach one during issuance, the caller needs `roles/privateca.templateUser`.

```python
import os

import google.cloud.security.privateca_v1 as privateca_v1
from google.type import expr_pb2

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")

client = privateca_v1.CertificateAuthorityServiceClient()

certificate_template = privateca_v1.CertificateTemplate(
    predefined_values=privateca_v1.X509Parameters(
        key_usage=privateca_v1.KeyUsage(
            base_key_usage=privateca_v1.KeyUsage.KeyUsageOptions(
                digital_signature=True,
                key_encipherment=True,
            ),
            extended_key_usage=privateca_v1.KeyUsage.ExtendedKeyUsageOptions(
                server_auth=True,
            ),
        ),
        ca_options=privateca_v1.X509Parameters.CaOptions(is_ca=False),
    ),
    identity_constraints=privateca_v1.CertificateIdentityConstraints(
        cel_expression=expr_pb2.Expr(
            expression="subject_alt_names.all(san, san.type == DNS)"
        ),
        allow_subject_passthrough=False,
        allow_subject_alt_names_passthrough=False,
    ),
)

operation = client.create_certificate_template(
    request=privateca_v1.CreateCertificateTemplateRequest(
        parent=client.common_location_path(project_id, location),
        certificate_template_id="web-server",
        certificate_template=certificate_template,
    )
)

template = operation.result(timeout=600)
print(template.name)
```

### Issue a certificate from a PEM CSR

This is the most practical flow when your workload or CA tooling generates the private key locally and only sends the CSR to Private CA.

```python
import os

import google.cloud.security.privateca_v1 as privateca_v1
from google.protobuf import duration_pb2

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")

client = privateca_v1.CertificateAuthorityServiceClient()

with open("server.csr.pem", "r", encoding="utf-8") as fh:
    pem_csr = fh.read()

certificate = privateca_v1.Certificate(
    pem_csr=pem_csr,
    lifetime=duration_pb2.Duration(seconds=30 * 24 * 60 * 60),
    certificate_template=(
        f"projects/{project_id}/locations/{location}/certificateTemplates/web-server"
    ),
)

issued = client.create_certificate(
    request=privateca_v1.CreateCertificateRequest(
        parent=client.ca_pool_path(project_id, location, "my-pool"),
        certificate_id="web-20260313",
        certificate=certificate,
        issuing_certificate_authority_id="root-ca",
    )
)

print(issued.name)
print(issued.pem_certificate)
for pem in issued.pem_certificate_chain:
    print(pem)
```

Important response fields:

- `pem_certificate`: the issued leaf certificate
- `pem_certificate_chain`: issuer-to-root verification chain from the API reference
- `issuer_certificate_authority`: the CA resource name that signed the certificate
- `certificate_description`: parsed X.509 details such as SANs, serial number, and validity timestamps

### List certificates in a CA pool

```python
import os

import google.cloud.security.privateca_v1 as privateca_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")

client = privateca_v1.CertificateAuthorityServiceClient()
parent = client.ca_pool_path(project_id, location, "my-pool")

for certificate in client.list_certificates(parent=parent):
    print(certificate.name)
```

### Revoke a certificate

Revocation updates the certificate metadata immediately. The product docs note that a new CRL is typically created within 15 minutes after revocation.

```python
import os

import google.cloud.security.privateca_v1 as privateca_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")

client = privateca_v1.CertificateAuthorityServiceClient()

certificate_name = client.certificate_path(
    project_id,
    location,
    "my-pool",
    "web-20260313",
)

revoked = client.revoke_certificate(
    request=privateca_v1.RevokeCertificateRequest(
        name=certificate_name,
        reason=privateca_v1.RevocationReason.PRIVILEGE_WITHDRAWN,
    )
)

print(revoked.name)
print(revoked.revocation_details.revocation_state)
```

## Common Pitfalls

- Creating a CA is not the same as having an enabled CA. Follow the enable step before trying to issue certificates.
- Keep `location` aligned across the CA pool, issuing CA, certificate, and certificate template. Templates must be in the same location as the certificate.
- `roles/privateca.certificateRequester` can create certificates but cannot read them back. If your code expects the returned certificate body or needs list/get access later, use a broader role such as `roles/privateca.certificateManager`.
- After a certificate is created, the product docs say you cannot delete it or reuse the certificate name.
- `create_certificate()` returns a `Certificate` directly, but many administrative methods return long-running operations. Do not assume the same response pattern across methods.
- The published Python reference pages currently lag PyPI by one patch release. Check both PyPI and the Google reference pages when you care about a version-specific behavior change.

## Version-Sensitive Notes

- PyPI shows `google-cloud-private-ca 1.17.0` released on January 15, 2026.
- The published `latest` Python reference pages currently show `1.16.0`.
- The official changelog for the published reference notes that `credentials_file` is deprecated. Prefer ADC or pass an explicit `credentials=` object.
- The same changelog stream documents opt-in debug logging support. If you need RPC logging, set `GOOGLE_SDK_PYTHON_LOGGING_SCOPE=google`, but treat those logs as potentially sensitive.

## Official Sources

- PyPI package page: https://pypi.org/project/google-cloud-private-ca/
- Python reference root: https://docs.cloud.google.com/python/docs/reference/privateca/latest
- Changelog: https://docs.cloud.google.com/python/docs/reference/privateca/latest/changelog
- Client reference: https://docs.cloud.google.com/python/docs/reference/privateca/latest/google.cloud.security.privateca_v1.services.certificate_authority_service.CertificateAuthorityServiceClient
- `Certificate` type reference: https://docs.cloud.google.com/python/docs/reference/privateca/latest/google.cloud.security.privateca_v1.types.Certificate
- Create a CA pool sample: https://cloud.google.com/certificate-authority-service/docs/samples/privateca-create-ca-pool
- Create a root CA sample: https://cloud.google.com/certificate-authority-service/docs/samples/privateca-create-ca
- Enable a CA sample: https://docs.cloud.google.com/certificate-authority-service/docs/samples/privateca-enable-ca
- Create a certificate template sample: https://docs.cloud.google.com/certificate-authority-service/docs/samples/privateca-create-certificate-template
- Issue a certificate from CSR sample: https://docs.cloud.google.com/certificate-authority-service/docs/samples/privateca-create-certificate-csr
- Request certificates guide: https://cloud.google.com/certificate-authority-service/docs/requesting-certificates
- Revoke certificate sample: https://docs.cloud.google.com/certificate-authority-service/docs/samples/privateca-revoke-certificate
- Revoke certificates guide: https://docs.cloud.google.com/certificate-authority-service/docs/revoking-certificates
- IAM roles and permissions: https://docs.cloud.google.com/certificate-authority-service/docs/access-control
- ADC setup: https://cloud.google.com/docs/authentication/set-up-adc-local-dev-environment
