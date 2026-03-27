---
name: mypy-boto3-securityhub
description: "mypy-boto3-securityhub type stubs for boto3 Security Hub clients, paginators, literals, and TypedDict request shapes"
metadata:
  languages: "python"
  versions: "1.42.3"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,security-hub,boto3,type-stubs,mypy,pyright,python"
---

# mypy-boto3-securityhub Python Package Guide

## Golden Rule

- `mypy-boto3-securityhub` is a typing package for `boto3`, not a runtime AWS SDK.
- Keep `boto3` installed for real Security Hub API calls.
- Use `boto3-stubs[securityhub]` if you want better `session.client("securityhub")` inference. Use `mypy-boto3-securityhub` when you only need the standalone Security Hub stubs and are willing to add explicit annotations.

## Version-Sensitive Notes

- As of March 13, 2026, PyPI lists `mypy-boto3-securityhub 1.42.3` and `Requires: Python >=3.9`.
- The maintainer docs are a rolling site. The current package page includes local-generation examples for newer `boto3` patch lines than the published `mypy-boto3-securityhub` release, so pin against the exact PyPI release you can install.
- The maintainer versioning guide says service stub versions follow the related `boto3` version. When request and response shapes matter, pin `boto3` and `mypy-boto3-securityhub` to the same release line.

## Install

### Recommended for most projects

```bash
python -m pip install "boto3==1.42.3" "boto3-stubs[securityhub]==1.42.3"
```

This is the easiest path when you want editor completion plus better type inference for `Session.client("securityhub")`.

### Standalone Security Hub stubs

```bash
python -m pip install "boto3==1.42.3" "mypy-boto3-securityhub==1.42.3"
```

Use this when you only want Security Hub types and are comfortable with explicit annotations.

### Lower-memory IDE fallback

```bash
python -m pip install "boto3==1.42.3" "boto3-stubs-lite[securityhub]==1.42.3"
```

The lite package is easier on IDE memory but does not provide the same overload coverage for `session.client(...)`.

## Runtime Setup And Auth

This package has no Security Hub-specific initialization. Authentication, profiles, regions, retries, and endpoints still come from normal `boto3` and botocore configuration.

Typical local setup:

```bash
aws configure --profile security-audit
export AWS_PROFILE=security-audit
export AWS_DEFAULT_REGION=us-east-1
```

Or set credentials directly:

```bash
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_SESSION_TOKEN=...
export AWS_DEFAULT_REGION=us-east-1
```

Create an explicit session when you want predictable account and region selection:

```python
from boto3.session import Session

session = Session(profile_name="security-audit", region_name="us-east-1")
```

## Core Usage

### Typed Security Hub client

```python
from boto3.session import Session
from mypy_boto3_securityhub import SecurityHubClient

session = Session(profile_name="security-audit", region_name="us-east-1")
securityhub: SecurityHubClient = session.client("securityhub")

hub = securityhub.describe_hub()
print(hub["HubArn"])
```

Import from `mypy_boto3_securityhub`, but create the real client from `boto3`.

### Paginate findings safely

`get_findings` is the main read path for Security Hub findings. Use the generated paginator type when you expect multiple pages.

```python
from boto3.session import Session
from mypy_boto3_securityhub import SecurityHubClient
from mypy_boto3_securityhub.paginator import GetFindingsPaginator

session = Session(profile_name="security-audit", region_name="us-east-1")
securityhub: SecurityHubClient = session.client("securityhub")

paginator: GetFindingsPaginator = securityhub.get_paginator("get_findings")

for page in paginator.paginate(
    Filters={
        "RecordState": [{"Value": "ACTIVE", "Comparison": "EQUALS"}],
        "WorkflowStatus": [{"Value": "NEW", "Comparison": "EQUALS"}],
    }
):
    for finding in page.get("Findings", []):
        print(finding["Id"], finding["Severity"]["Label"])
```

### Inspect enabled standards

```python
from boto3.session import Session
from mypy_boto3_securityhub import SecurityHubClient
from mypy_boto3_securityhub.paginator import GetEnabledStandardsPaginator

securityhub: SecurityHubClient = Session(region_name="us-east-1").client("securityhub")
paginator: GetEnabledStandardsPaginator = securityhub.get_paginator("get_enabled_standards")

for page in paginator.paginate():
    for subscription in page.get("StandardsSubscriptions", []):
        print(subscription["StandardsArn"], subscription["StandardsStatus"])
```

### Enable Security Hub explicitly

If you are bootstrapping a region, the typed client exposes the normal boto3 operation:

```python
from boto3.session import Session
from mypy_boto3_securityhub import SecurityHubClient

securityhub: SecurityHubClient = Session(region_name="us-east-1").client("securityhub")

securityhub.enable_security_hub(
    EnableDefaultStandards=False,
    ControlFindingGenerator="SECURITY_CONTROL",
)
```

## Type Surfaces That Matter

The generated package exposes the modules you usually need for static analysis:

- `mypy_boto3_securityhub` for `SecurityHubClient`
- `mypy_boto3_securityhub.paginator` for paginator classes such as `GetFindingsPaginator`
- `mypy_boto3_securityhub.literals` for enum-like string types
- `mypy_boto3_securityhub.type_defs` for request and response `TypedDict` definitions

Use `literals` when you want the type checker to reject invalid string constants, and use `type_defs` when helpers build request payloads before the final client call.

## Keep Stubs Out Of Production Images

If the stubs are a development-only dependency, gate the type imports with `TYPE_CHECKING`:

```python
from typing import TYPE_CHECKING

from boto3.session import Session

if TYPE_CHECKING:
    from mypy_boto3_securityhub import SecurityHubClient

def make_client() -> "SecurityHubClient":
    return Session(region_name="us-east-1").client("securityhub")
```

## Common Pitfalls

- Installing `mypy-boto3-securityhub` without `boto3`. The stub package does not make AWS calls by itself.
- Expecting standalone stubs to infer `session.client("securityhub")` automatically. That behavior is better with `boto3-stubs[securityhub]`.
- Importing `mypy-boto3-securityhub` with hyphens. The Python import path is `mypy_boto3_securityhub`.
- Treating successful type checks as proof that your AWS profile, region, or IAM permissions are correct.
- Copying the patch version shown in the rolling docs site without checking the exact PyPI release page first.
- Forgetting that Security Hub is regional. Use an explicit session or `AWS_DEFAULT_REGION` so your findings queries hit the expected region.

## Official Sources

- Maintainer docs: https://youtype.github.io/boto3_stubs_docs/mypy_boto3_securityhub/
- Maintainer versioning guide: https://youtype.github.io/boto3_stubs_docs/#versioning
- PyPI package page: https://pypi.org/project/mypy-boto3-securityhub/
- Exact PyPI release page: https://pypi.org/project/mypy-boto3-securityhub/1.42.3/
- Boto3 credentials guide: https://boto3.amazonaws.com/v1/documentation/api/latest/guide/credentials.html
- Boto3 configuration guide: https://boto3.amazonaws.com/v1/documentation/api/latest/guide/configuration.html
- SecurityHub client docs: https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/securityhub.html
- `describe_hub`: https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/securityhub/client/describe_hub.html
- `get_findings`: https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/securityhub/client/get_findings.html
- `get_enabled_standards`: https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/securityhub/client/get_enabled_standards.html
- `enable_security_hub`: https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/securityhub/client/enable_security_hub.html
