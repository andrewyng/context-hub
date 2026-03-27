---
name: policy-troubleshooter
description: "google-cloud-policy-troubleshooter Python package guide for IAM access checks with ADC setup and troubleshoot_iam_policy examples"
metadata:
  languages: "python"
  versions: "1.15.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,google-cloud,iam,policy-troubleshooter,policy-intelligence,python,access"
---

# google-cloud-policy-troubleshooter Python Package Guide

## What It Is

`google-cloud-policy-troubleshooter` is the Google-maintained Python client for the `policytroubleshooter_v1` IAM checker surface.

Use it when code needs to answer one question reliably:

- does a specific principal have a specific IAM permission on a specific Google Cloud resource?

The package exposes one main client, `IamCheckerClient`, and one main RPC, `troubleshoot_iam_policy`.

## Install

Pin the package version your project expects:

```bash
python -m pip install "google-cloud-policy-troubleshooter==1.15.0"
```

Common alternatives:

```bash
uv add "google-cloud-policy-troubleshooter==1.15.0"
poetry add "google-cloud-policy-troubleshooter==1.15.0"
```

PyPI lists support for Python 3.7 and newer for this release line.

## Authentication And Setup

Before making requests:

1. Enable the IAM Policy Troubleshooter API in the project that will send the request.
2. Authenticate with Application Default Credentials (ADC).
3. Make sure the caller can view the policies involved in the check. Google documents `roles/iam.securityReviewer` as the baseline role for troubleshooting principal access.

Typical local setup:

```bash
gcloud auth application-default login

export GOOGLE_CLOUD_PROJECT="my-project"
export TROUBLESHOOT_PRINCIPAL="alice@example.com"
export TROUBLESHOOT_RESOURCE="//cloudresourcemanager.googleapis.com/projects/${GOOGLE_CLOUD_PROJECT}"
export TROUBLESHOOT_PERMISSION="resourcemanager.projects.get"
```

If you need to point ADC at a credential file explicitly:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

Important request inputs:

- `principal`: an email-form Google Account or service account identity
- `full_resource_name`: the full resource name, not a bare project ID
- `permission`: an IAM permission that is valid for that resource type

## Imports And Client Initialization

```python
from google.cloud import policytroubleshooter_v1

client = policytroubleshooter_v1.IamCheckerClient()
```

If you need to construct the client from a service account file directly:

```python
from google.cloud import policytroubleshooter_v1

client = policytroubleshooter_v1.IamCheckerClient.from_service_account_json(
    "/absolute/path/service-account.json"
)
```

## Core Usage

### Troubleshoot one IAM permission check

```python
import os

from google.cloud import policytroubleshooter_v1

client = policytroubleshooter_v1.IamCheckerClient()

request = policytroubleshooter_v1.TroubleshootIamPolicyRequest(
    access_tuple=policytroubleshooter_v1.AccessTuple(
        principal=os.environ["TROUBLESHOOT_PRINCIPAL"],
        full_resource_name=os.environ["TROUBLESHOOT_RESOURCE"],
        permission=os.environ["TROUBLESHOOT_PERMISSION"],
    )
)

response = client.troubleshoot_iam_policy(request=request)

print("overall access:", response.access)

for explained_policy in response.explained_policies:
    print("policy resource:", explained_policy.full_resource_name)
    print("policy access:", explained_policy.access)
    print("policy relevance:", explained_policy.relevance)

    for binding in explained_policy.binding_explanations:
        print("  role:", binding.role)
        print("  binding access:", binding.access)
        print("  role contains permission:", binding.role_permission)
        print("  binding relevance:", binding.relevance)

        for member, annotated in binding.memberships.items():
            print("   ", member, annotated.membership)

if response.errors:
    for error in response.errors:
        print("error:", error.code, error.message)
```

The important response fields are:

- `response.access`: overall result for the requested principal/resource/permission tuple
- `response.explained_policies`: each evaluated IAM policy, including inherited policies
- `response.errors`: general troubleshooting errors returned with the response

### Async client

Use the async client if the rest of your application is already async:

```python
import asyncio
import os

from google.cloud import policytroubleshooter_v1


async def main() -> None:
    client = policytroubleshooter_v1.IamCheckerAsyncClient()

    request = policytroubleshooter_v1.TroubleshootIamPolicyRequest(
        access_tuple=policytroubleshooter_v1.AccessTuple(
            principal=os.environ["TROUBLESHOOT_PRINCIPAL"],
            full_resource_name=os.environ["TROUBLESHOOT_RESOURCE"],
            permission=os.environ["TROUBLESHOOT_PERMISSION"],
        )
    )

    response = await client.troubleshoot_iam_policy(request=request)
    print(response.access)


asyncio.run(main())
```

## How To Read The Result

Policy Troubleshooter evaluates all relevant IAM policies it can see, including inherited policies from higher levels of the resource hierarchy.

In practice:

- a granted project-level role can explain access to resources under that project
- missing viewer permissions for the caller can cause omitted policy details or limited explanations
- bindings are evaluated independently, so `binding_explanations` are the fastest place to see which role or membership actually changed the outcome

## Common Pitfalls

### `full_resource_name` must be a full resource name

Do not pass plain IDs such as `my-project` or `123456789012`. Use names like:

```text
//cloudresourcemanager.googleapis.com/projects/my-project
```

### The permission must apply to the resource type

Google's product docs note that the request fails if the permission cannot be used on the resource in the request. For example, troubleshooting a Compute Engine permission against a GKE cluster resource is invalid.

### Caller visibility affects the explanation quality

Troubleshooter only explains the policies and custom roles that the caller is allowed to inspect. If the caller cannot view a relevant policy, parts of the result can be omitted or effectively unknown. `roles/iam.securityReviewer` is the documented baseline for troubleshooting principal access.

### Pub/Sub allow policies are a known limitation

The product documentation says Policy Troubleshooter does not evaluate allow policies set directly on Pub/Sub resources. For Pub/Sub, troubleshoot the parent project first, then review the resource-level allow policy separately.

### The rolling reference docs lag PyPI for this package

PyPI lists `1.15.0`, but the Google Cloud Python reference pages visited on March 13, 2026 still show `1.14.0` as the latest published reference set. Treat the reference pages as the canonical API shape for `policytroubleshooter_v1`, but check PyPI for the current installable package version.

## Official Source URLs

- PyPI package page: `https://pypi.org/project/google-cloud-policy-troubleshooter/1.15.0/`
- Maintainer package directory: `https://github.com/googleapis/google-cloud-python/tree/main/packages/google-cloud-policy-troubleshooter`
- Google Cloud Python reference root: `https://docs.cloud.google.com/python/docs/reference/policytroubleshooter/latest`
- `IamCheckerClient` reference: `https://docs.cloud.google.com/python/docs/reference/policytroubleshooter/latest/google.cloud.policytroubleshooter_v1.services.iam_checker.IamCheckerClient`
- `TroubleshootIamPolicyRequest` reference: `https://docs.cloud.google.com/python/docs/reference/policytroubleshooter/latest/google.cloud.policytroubleshooter_v1.types.TroubleshootIamPolicyRequest`
- `AccessTuple` reference: `https://docs.cloud.google.com/python/docs/reference/policytroubleshooter/latest/google.cloud.policytroubleshooter_v1.types.AccessTuple`
- `BindingExplanation` reference: `https://docs.cloud.google.com/python/docs/reference/policytroubleshooter/latest/google.cloud.policytroubleshooter_v1.types.BindingExplanation`
- Changelog: `https://docs.cloud.google.com/python/docs/reference/policytroubleshooter/latest/changelog`
- Policy Troubleshooter product guide: `https://docs.cloud.google.com/policy-intelligence/docs/troubleshoot-access`
- ADC setup: `https://cloud.google.com/docs/authentication/provide-credentials-adc`
