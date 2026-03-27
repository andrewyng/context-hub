---
name: binary-authorization
description: "google-cloud-binary-authorization package guide for Python covering ADC setup, project policy reads, attestor lookups, and system-policy workflows"
metadata:
  languages: "python"
  versions: "1.15.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,binary-authorization,gke,cloud-run,attestations,supply-chain,python"
---

# google-cloud-binary-authorization Python Package Guide

## Golden Rule

Use `google-cloud-binary-authorization` for Binary Authorization control-plane access from Python, import it as `from google.cloud import binaryauthorization_v1`, and authenticate with Application Default Credentials (ADC).

This package is for managing and reading Binary Authorization resources such as project policies, system policies, and attestors. It is not the end-to-end image-signing workflow by itself: attestors point at user-owned Grafeas notes, and attestation validation expects an attestation occurrence plus the image URI being checked.

## Install

Pin the version your project expects:

```bash
python -m pip install "google-cloud-binary-authorization==1.15.0"
```

Common alternatives:

```bash
uv add "google-cloud-binary-authorization==1.15.0"
poetry add "google-cloud-binary-authorization==1.15.0"
```

PyPI lists support for Python `>=3.7`.

## Authentication And Setup

Before creating a client:

1. Enable Binary Authorization in the target Google Cloud project.
2. Use an identity with Binary Authorization IAM permissions on the project you are managing.
3. Prefer ADC over embedding credentials in code.

Local development with ADC:

```bash
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
```

Service-account key fallback:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

Useful environment variables:

```bash
export GOOGLE_CLOUD_PROJECT="your-project-id"
export GOOGLE_CLOUD_LOCATION="us-central1"

# Optional generated-client logging
export GOOGLE_SDK_PYTHON_LOGGING_SCOPE="google.cloud.binaryauthorization_v1"
```

## Imports And Client Initialization

The package exposes separate clients for management, system policy, and attestation validation:

```python
import os

from google.cloud import binaryauthorization_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")

management_client = binaryauthorization_v1.BinauthzManagementServiceV1Client()
system_policy_client = binaryauthorization_v1.SystemPolicyV1Client()
validation_client = binaryauthorization_v1.ValidationHelperV1Client()
```

If you need explicit credentials instead of ADC:

```python
from google.oauth2 import service_account
from google.cloud import binaryauthorization_v1

credentials = service_account.Credentials.from_service_account_file(
    "/absolute/path/service-account.json"
)

management_client = binaryauthorization_v1.BinauthzManagementServiceV1Client(
    credentials=credentials,
)
```

## Resource Names

The generated clients expect fully qualified resource names. The ones you use most often are:

- project policy: `projects/{project}/policy`
- attestor parent: `projects/{project}`
- attestor: `projects/{project}/attestors/{attestor}`
- system policy: `locations/{location}/policy`

Keep these strings explicit in your code. Passing short IDs instead of canonical names is a common cause of `InvalidArgument` and `NotFound` errors.

## Core Workflows

### Read The Project Policy

Use `get_policy()` to inspect the Binary Authorization policy attached to one project:

```python
from google.cloud import binaryauthorization_v1

client = binaryauthorization_v1.BinauthzManagementServiceV1Client()
policy_name = f"projects/{project_id}/policy"

policy = client.get_policy(
    request=binaryauthorization_v1.GetPolicyRequest(
        name=policy_name,
    )
)

print(policy.name)
print(policy.default_admission_rule)
```

This is the safest first call when you want to confirm auth, permissions, and the current policy shape before changing anything.

### List Attestors In A Project

Attestors are project-scoped resources:

```python
from google.cloud import binaryauthorization_v1

client = binaryauthorization_v1.BinauthzManagementServiceV1Client()
parent = f"projects/{project_id}"

for attestor in client.list_attestors(
    request=binaryauthorization_v1.ListAttestorsRequest(parent=parent)
):
    print(attestor.name)
    print(attestor.description)
```

The pager yields `Attestor` resources directly. Reuse the same client instead of recreating it inside tight loops.

### Read One Attestor

Use the fully qualified attestor name:

```python
from google.cloud import binaryauthorization_v1

client = binaryauthorization_v1.BinauthzManagementServiceV1Client()
attestor_name = f"projects/{project_id}/attestors/{attestor_id}"

attestor = client.get_attestor(
    request=binaryauthorization_v1.GetAttestorRequest(
        name=attestor_name,
    )
)

print(attestor.name)
print(attestor.user_owned_grafeas_note.note_reference)
```

For user-owned attestors, the important linkage is `user_owned_grafeas_note.note_reference`. That note must already exist in Artifact Analysis / Grafeas.

### Create An Attestor

Create attestors with a project parent, an `attestor_id`, and an `Attestor` message. The `Attestor` type includes a `user_owned_grafeas_note` that carries the note reference and public keys.

```python
from google.cloud import binaryauthorization_v1

client = binaryauthorization_v1.BinauthzManagementServiceV1Client()
parent = f"projects/{project_id}"

attestor = binaryauthorization_v1.Attestor(
    description="CI attestor",
    user_owned_grafeas_note=binaryauthorization_v1.UserOwnedGrafeasNote(
        note_reference=f"projects/{project_id}/notes/{note_id}",
    ),
)

operation = client.create_attestor(
    request=binaryauthorization_v1.CreateAttestorRequest(
        parent=parent,
        attestor_id=attestor_id,
        attestor=attestor,
    )
)

created = operation.result()
print(created.name)
```

For a real attestor, populate the `public_keys` on `UserOwnedGrafeasNote` with the keys your signer uses. Keep the note resource and key material aligned with the attestation workflow your platform already uses.

### Read The System Policy

System policy is location-scoped rather than project-scoped:

```python
from google.cloud import binaryauthorization_v1

client = binaryauthorization_v1.SystemPolicyV1Client()
name = f"locations/{location}/policy"

system_policy = client.get_system_policy(
    request=binaryauthorization_v1.GetSystemPolicyRequest(name=name)
)

print(system_policy.name)
```

Use this when you need to inspect Google-managed defaults that apply alongside your project policy.

### Validate An Attestation Occurrence

`ValidationHelperV1Client` exposes `validate_attestation_occurrence()`. The request takes:

- `attestor`: `projects/{project}/attestors/{attestor}`
- `attestation`: the attestation occurrence to verify
- `gcr_image_uri`: the container image URI being checked

Use this helper when you already have an attestation occurrence object and need Binary Authorization to verify that it matches the attestor and image URI.

## Updating Policy Safely

`BinauthzManagementServiceV1Client` also exposes `update_policy()`, `create_attestor()`, `update_attestor()`, and delete operations. In practice:

- read the current policy with `get_policy()` first
- modify only the fields you intend to change
- send the updated policy back with `update_policy()`
- avoid generating policy resources from scratch unless you control every field being written

That keeps automation from accidentally replacing admission rules or cluster/image allowlists you did not intend to touch.

## Common Pitfalls

- Do not confuse project policy and system policy resource names. Project policy uses `projects/{project}/policy`; system policy uses `locations/{location}/policy`.
- Attestors are not standalone signing identities. They are Binary Authorization resources that reference user-owned Grafeas notes and key material.
- `validate_attestation_occurrence()` is not a shortcut for creating attestations. You still need an actual attestation occurrence from your signing pipeline.
- This package manages Binary Authorization resources; it does not build images, sign artifacts, or create Grafeas notes for you.
- ADC problems and IAM problems look similar. Verify both authentication and Binary Authorization permissions before debugging request shapes.
- Generated Google clients accept canonical resource names, not partial IDs. Build the full `projects/...` or `locations/...` path explicitly.

## Version Notes

- This guide covers PyPI package version `1.15.0`.
- The Google Cloud Python reference root and the `ValidationHelperV1Client` page were current for `1.15.0` when checked on `2026-03-13`.
- PyPI lists the package under the Google-maintained `google-cloud-binary-authorization` name. Use that exact package name when pinning dependencies.

## Official Sources

- Python client reference root: `https://cloud.google.com/python/docs/reference/binaryauthorization/latest`
- `ValidationHelperV1Client` reference: `https://cloud.google.com/python/docs/reference/binaryauthorization/latest/google.cloud.binaryauthorization_v1.services.validation_helper_v1.ValidationHelperV1Client`
- Python package summary classes: `https://cloud.google.com/python/docs/reference/binaryauthorization/latest/summary_class`
- Python package summary methods: `https://cloud.google.com/python/docs/reference/binaryauthorization/latest/summary_method`
- RPC reference (`Policy`, `Attestor`, `UserOwnedGrafeasNote`, request types): `https://cloud.google.com/binary-authorization/docs/reference/rpc/google.cloud.binaryauthorization.v1beta1`
- RPC reference (`SystemPolicy`): `https://cloud.google.com/binary-authorization/docs/reference/rpc/google.cloud.binaryauthorization.v1`
- Google Cloud ADC setup: `https://cloud.google.com/docs/authentication/provide-credentials-adc`
- PyPI package page: `https://pypi.org/project/google-cloud-binary-authorization/`
