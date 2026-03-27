---
name: phishing-protection
description: "google-cloud-phishing-protection Python package guide for reporting suspected phishing URLs with ADC-based auth"
metadata:
  languages: "python"
  versions: "1.16.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,phishing-protection,security,safe-browsing,python"
---

# google-cloud-phishing-protection Python Package Guide

## Golden Rule

Use `google-cloud-phishing-protection` with Application Default Credentials (ADC), import the `phishingprotection_v1beta1` namespace, and treat `report_phishing` as an asynchronous submission step rather than a verdict API.

The generated Python reference for this package exposes one service namespace, `v1beta1`, and one practical RPC, `report_phishing(...)`.

## Install

Pin the version if you want behavior aligned with this entry:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "google-cloud-phishing-protection==1.16.0"
```

Common alternatives:

```bash
uv add "google-cloud-phishing-protection==1.16.0"
poetry add "google-cloud-phishing-protection==1.16.0"
```

PyPI currently lists Python `>=3.7` support for this package.

## Required Setup

Google's package docs say you must do all of the following before calling the client:

1. Select or create a Google Cloud project.
2. Enable billing for that project.
3. Enable the Phishing Protection API.
4. Set up authentication.

## Authentication

### Preferred: Application Default Credentials

Local development:

```bash
gcloud auth application-default login
```

The client library will then pick up credentials automatically:

```python
from google.cloud import phishingprotection_v1beta1

client = phishingprotection_v1beta1.PhishingProtectionServiceV1Beta1Client()
```

### Service Account Or Workload Identity

If your runtime is outside Google Cloud, Google recommends ADC-compatible credentials rather than hard-coding keys in application code.

Service account key file fallback:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

```python
from google.cloud import phishingprotection_v1beta1

client = phishingprotection_v1beta1.PhishingProtectionServiceV1Beta1Client()
```

The class also exposes `from_service_account_file(...)`, but the standard `GOOGLE_APPLICATION_CREDENTIALS` flow is usually the simpler choice.

## Core Workflow: Report A Suspected Phishing URL

The request takes exactly two required fields:

- `parent`: must be `projects/{project_number}`
- `uri`: the URL to submit for analysis

Minimal synchronous example:

```python
from google.cloud import phishingprotection_v1beta1

def report_phishing_uri(project_number: str, uri: str) -> None:
    client = phishingprotection_v1beta1.PhishingProtectionServiceV1Beta1Client()

    request = phishingprotection_v1beta1.ReportPhishingRequest(
        parent=f"projects/{project_number}",
        uri=uri,
    )

    client.report_phishing(request=request)
    print(f"Submitted {uri} for phishing review")
```

The same call using the client helper that builds a fully-qualified project path:

```python
from google.cloud import phishingprotection_v1beta1

client = phishingprotection_v1beta1.PhishingProtectionServiceV1Beta1Client()
parent = client.common_project_path("123456789012")

client.report_phishing(
    request=phishingprotection_v1beta1.ReportPhishingRequest(
        parent=parent,
        uri="https://example-phish.test/login",
    )
)
```

The response type is `ReportPhishingResponse`, but the docs describe it as an empty response. The useful outcome of the submission is not returned inline. The service docs say that, after review, results appear in the Cloud Security Command Center findings dashboard for Phishing Protection.

## Async Client

Use the async client only if the rest of your application already uses `asyncio`:

```python
import asyncio

from google.cloud import phishingprotection_v1beta1

async def main() -> None:
    client = phishingprotection_v1beta1.PhishingProtectionServiceV1Beta1AsyncClient()

    request = phishingprotection_v1beta1.ReportPhishingRequest(
        parent="projects/123456789012",
        uri="https://example-phish.test/login",
    )

    await client.report_phishing(request=request)
    print("Submission queued")

asyncio.run(main())
```

## Configuration Notes

- The client supports `client_options` if you need to override endpoint behavior.
- The generated client also exposes mTLS-related behavior controlled by Google client environment settings. In `1.16.0`, the changelog notes automatic mTLS enablement when supported certificates are detected.
- The package uses standard Python `logging`. Google warns that logs can contain sensitive information, are not handled by default, and should not be treated as a stable contract.

## Common Pitfalls

- `parent` requires a numeric project resource path like `projects/123456789012`, not a project ID like `projects/my-project`.
- Do not expect a phishing verdict in the RPC response. The Python docs describe `ReportPhishingResponse` as empty, and the method docs route the result to Security Command Center findings after review.
- This package currently documents only the `phishingprotection_v1beta1` namespace. If you are looking for a `v1` module, it is not the surface exposed by the official Python reference today.
- When you call `report_phishing`, pass either a `request=` object or flattened keyword arguments like `parent=` and `uri=`. Do not mix both styles in the same call.
- Avoid the deprecated `credentials_file` constructor argument. The `1.15.0` changelog explicitly deprecated it.
- The generated client can be used as a context manager, but the class docs warn that exiting the `with` block closes the underlying transport. Do not use that pattern if the transport is shared.

## Version Notes For `1.16.0`

- PyPI lists `1.16.0` as the current package version, released on January 15, 2026.
- The official changelog lists `1.16.0` on January 9, 2026 and notes two changes: automatic mTLS enablement when supported certificates are detected, and generated checks for Python and dependency versions.
- On March 13, 2026, the package landing page and changelog both show `1.16.0`, but the deep class reference pages still render `1.15.0` in their page header. The callable surface for `report_phishing`, `common_project_path`, and the request types is still the relevant current reference, but pin dependencies to `1.16.0`.

## Official Sources

- Python package overview: `https://cloud.google.com/python/docs/reference/phishingprotection/latest`
- Python API summary: `https://cloud.google.com/python/docs/reference/phishingprotection/latest/summary_overview`
- Python client class docs: `https://cloud.google.com/python/docs/reference/phishingprotection/latest/google.cloud.phishingprotection_v1beta1.services.phishing_protection_service_v1_beta1.PhishingProtectionServiceV1Beta1Client`
- Python methods summary: `https://cloud.google.com/python/docs/reference/phishingprotection/latest/summary_method`
- Python changelog: `https://cloud.google.com/python/docs/reference/phishingprotection/latest/changelog`
- ADC setup: `https://cloud.google.com/docs/authentication/provide-credentials-adc`
- ADC behavior and lookup order: `https://cloud.google.com/docs/authentication/application-default-credentials`
- PyPI package page: `https://pypi.org/project/google-cloud-phishing-protection/`
