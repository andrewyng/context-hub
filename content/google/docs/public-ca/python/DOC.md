---
name: public-ca
description: "Google Cloud Public CA Python client for creating ACME external account binding keys"
metadata:
  languages: "python"
  versions: "0.3.9"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,cloud,public-ca,certificate-manager,acme,tls,eab"
---

# Google Cloud Public CA Python Client

## What It Is

`google-cloud-public-ca` is a narrow client library for Google Cloud Public CA. In `0.3.9`, the Python surface is `google.cloud.security.publicca_v1beta1`, and the main operation is creating an ACME external account binding (EAB) secret for a Google Cloud project.

Use this package when you need to mint the EAB key ID and HMAC that an ACME client such as Certbot uses to register an ACME account with Google Public CA. Certificate issuance, renewal, and challenge handling still happen through the ACME client, not through this Python package.

## Install

Pin the version you are actually using:

```bash
python -m pip install "google-cloud-public-ca==0.3.9"
```

`0.3.9` is published on PyPI as `google-cloud-public-ca`. Newer Google reference docs now describe later releases under `google-cloud-security-publicca`, so keep your lockfile authoritative if your project is pinned to `0.3.9`.

## Prerequisites

Before calling the client:

1. Create or select a Google Cloud project.
2. Enable billing on that project.
3. Enable the Public CA API.
4. Grant the caller the `roles/publicca.externalAccountKeyCreator` IAM role.
5. Set up Application Default Credentials (ADC) or pass explicit credentials.

Enable the API:

```bash
gcloud services enable publicca.googleapis.com
```

Grant the IAM role:

```bash
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="user:you@example.com" \
  --role="roles/publicca.externalAccountKeyCreator"
```

Set up local ADC for development:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="PROJECT_ID"
```

Or point ADC at a service account key file:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
export GOOGLE_CLOUD_PROJECT="PROJECT_ID"
```

## Client Initialization

With ADC, the client can usually be created without passing credentials explicitly:

```python
from google.cloud.security import publicca_v1beta1

client = publicca_v1beta1.PublicCertificateAuthorityServiceClient()
```

If you need deterministic credentials in a script or test, pass them directly:

```python
from google.cloud.security import publicca_v1beta1
from google.oauth2 import service_account

credentials = service_account.Credentials.from_service_account_file(
    "service-account.json"
)

client = publicca_v1beta1.PublicCertificateAuthorityServiceClient(
    credentials=credentials,
)
```

## Create An External Account Binding Key

In `0.3.9`, the practical workflow is creating an EAB secret for the `global` location and then passing that secret to an ACME client.

```python
import os

from google.cloud.security import publicca_v1beta1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
parent = f"projects/{project_id}/locations/global"

client = publicca_v1beta1.PublicCertificateAuthorityServiceClient()

response = client.create_external_account_key(
    request=publicca_v1beta1.CreateExternalAccountKeyRequest(
        parent=parent,
        external_account_key=publicca_v1beta1.ExternalAccountKey(),
    )
)

eab_kid = response.key_id
eab_hmac_key = response.b64_mac_key.decode("ascii")

print("EAB key ID:", eab_kid)
print("EAB HMAC key:", eab_hmac_key)

client.transport.close()
```

Important details from the API surface:

- `parent` must be `projects/PROJECT_ID/locations/global`.
- `external_account_key` is required on the request, but the server currently ignores any fields you set on it. Pass an empty `ExternalAccountKey()`.
- `response.b64_mac_key` is already a base64url-encoded HMAC value returned as `bytes`. Decode it to text before passing it to an ACME client.

## Use The EAB Secret With Certbot

Google documents Public CA as an ACME service. After you create the EAB secret, register an ACME account against the production directory:

```bash
certbot register \
  --email "admin@example.com" \
  --no-eff-email \
  --server "https://dv.acme-v02.api.pki.goog/directory" \
  --eab-kid "$EAB_KID" \
  --eab-hmac-key "$EAB_HMAC_KEY"
```

Then request a certificate through normal ACME flows. For example, a manual DNS challenge:

```bash
certbot certonly \
  --manual \
  --preferred-challenges "dns-01" \
  --server "https://dv.acme-v02.api.pki.goog/directory" \
  --domains "example.com,*.example.com"
```

Google also documents a staging ACME directory for testing:

```text
https://dv.acme-v02.test-api.pki.goog/directory
```

## Common Pitfalls

- Do not use `publicca_v1` imports with `0.3.9`. That surface was added in `0.3.10`; `0.3.9` uses `publicca_v1beta1`.
- Do not expect this package to request or renew certificates directly. It only creates EAB keys; your ACME client handles registration, challenges, issuance, renewal, and revocation.
- Do not use anything except the `global` location for `parent`; the reference docs say only `global` is supported.
- Do not re-encode `response.b64_mac_key` with `base64.urlsafe_b64encode(...)`. The value is already base64url-encoded by the service.
- Do not try to reuse an EAB secret across multiple ACME account registrations. Google documents each EAB secret as single-account and invalid after use.

## Version-Sensitive Notes

- `0.3.9` is the last version covered by the original PyPI package name `google-cloud-public-ca`.
- The upstream changelog says `0.3.10` added `publicca v1` protos. If you are pinned to `0.3.9`, stay on `publicca_v1beta1`.
- The upstream changelog for `0.3.9` excludes `google-auth` `2.24.0` and `2.25.0`. If dependency resolution pulls one of those versions, align with the library's published constraints instead of forcing them back in.
- Google product docs say an unused EAB secret expires after 7 days, while the ACME account registered with that secret does not expire.

## Official Sources

- PyPI package `0.3.9`: `https://pypi.org/project/google-cloud-public-ca/`
- Google Cloud Python reference root: `https://cloud.google.com/python/docs/reference/publicca/0.3.0`
- `publicca_v1beta1` service package reference: `https://cloud.google.com/python/docs/reference/publicca/0.3.8/google.cloud.security.publicca_v1beta1.services.public_certificate_authority_service`
- `ExternalAccountKey` reference: `https://cloud.google.com/python/docs/reference/publicca/0.3.9/google.cloud.security.publicca_v1beta1.types.ExternalAccountKey`
- Current changelog: `https://docs.cloud.google.com/python/docs/reference/publicca/latest/changelog`
- Public CA overview: `https://docs.cloud.google.com/certificate-manager/docs/public-ca`
- Public CA ACME tutorial: `https://docs.cloud.google.com/certificate-manager/docs/public-ca-tutorial`
- ADC overview: `https://cloud.google.com/docs/authentication/application-default-credentials`
- ADC setup: `https://cloud.google.com/docs/authentication/provide-credentials-adc`
