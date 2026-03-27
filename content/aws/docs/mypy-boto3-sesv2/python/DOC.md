---
name: mypy-boto3-sesv2
description: "Typed boto3 stubs for Amazon SES v2 clients, paginators, literals, and TypedDict request shapes in Python"
metadata:
  languages: "python"
  versions: "1.42.13"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,sesv2,boto3,typing,mypy,pyright,stub"
---

# mypy-boto3-sesv2 Python Package Guide

## Golden Rule

Use `mypy-boto3-sesv2` only for static typing around `boto3.client("sesv2")`.

- Keep `boto3` installed for runtime behavior, retries, credentials, and request execution.
- Use the SES v2 service name: `sesv2`. This package does not type `boto3.client("ses")`.
- If you install the standalone `mypy-boto3-sesv2` package or `boto3-stubs-lite[sesv2]`, add an explicit `SESV2Client` annotation. The full `boto3-stubs[sesv2]` package is the path that documents overloaded `Session.client("sesv2")` typing.

## Install

Pick one of these typing strategies:

### Full boto3 stubs

Use this when you want the best autocomplete and typed `Session.client(...)` overloads:

```bash
python -m pip install "boto3-stubs[sesv2]"
```

### Lite boto3 stubs

Use this when editor memory use matters more than automatic overload inference:

```bash
python -m pip install "boto3-stubs-lite[sesv2]"
```

### Standalone SES v2 stubs

Use this when you only want the SES v2 typing package:

```bash
python -m pip install "mypy-boto3-sesv2==1.42.13"
```

Runtime dependency:

```bash
python -m pip install "boto3"
```

PyPI currently lists `mypy-boto3-sesv2 1.42.13` and requires Python `>=3.9`.

## Authentication And Setup

This package does not read AWS credentials or region settings. `boto3` still uses the normal AWS provider chain and config sources.

Common environment variables:

```bash
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_SESSION_TOKEN=...
export AWS_DEFAULT_REGION=us-east-1
```

You can also use shared AWS config files, IAM Identity Center, assume-role profiles, ECS task roles, or EC2 instance roles.

Minimal typed setup:

```python
from boto3.session import Session
from mypy_boto3_sesv2.client import SESV2Client

session = Session(profile_name="dev", region_name="us-east-1")
sesv2: SESV2Client = session.client("sesv2")
```

If the stubs are dev-only, keep the imports behind `TYPE_CHECKING`:

```python
from typing import TYPE_CHECKING, cast

from boto3.session import Session

if TYPE_CHECKING:
    from mypy_boto3_sesv2.client import SESV2Client

session = Session(region_name="us-east-1")
sesv2 = cast("SESV2Client", session.client("sesv2"))
```

## Core Usage

### Send a typed email request

Use the generated `TypedDict` request shape when you want the type checker to catch misspelled request keys before runtime:

```python
from boto3.session import Session
from mypy_boto3_sesv2.client import SESV2Client
from mypy_boto3_sesv2.type_defs import SendEmailRequestRequestTypeDef

session = Session(region_name="us-east-1")
sesv2: SESV2Client = session.client("sesv2")

request: SendEmailRequestRequestTypeDef = {
    "FromEmailAddress": "noreply@example.com",
    "Destination": {
        "ToAddresses": ["ada@example.com"],
    },
    "Content": {
        "Simple": {
            "Subject": {
                "Data": "Welcome",
                "Charset": "UTF-8",
            },
            "Body": {
                "Text": {
                    "Data": "Your account is ready.",
                    "Charset": "UTF-8",
                }
            },
        }
    },
}

response = sesv2.send_email(**request)
print(response["MessageId"])
```

The typing is local only. SES still validates the sender identity, region, account status, and IAM permissions at runtime.

### List email identities with explicit pagination

The maintainer docs do not list `list_email_identities` as a paginator-enabled operation, so use `NextToken` directly:

```python
from boto3.session import Session
from mypy_boto3_sesv2.client import SESV2Client
from mypy_boto3_sesv2.type_defs import (
    ListEmailIdentitiesRequestTypeDef,
    ListEmailIdentitiesResponseTypeDef,
)

session = Session(region_name="us-east-1")
sesv2: SESV2Client = session.client("sesv2")

request: ListEmailIdentitiesRequestTypeDef = {"PageSize": 100}

while True:
    response: ListEmailIdentitiesResponseTypeDef = sesv2.list_email_identities(**request)

    for identity in response.get("EmailIdentities", []):
        print(identity["IdentityName"], identity["VerificationStatus"])

    next_token = response.get("NextToken")
    if not next_token:
        break

    request["NextToken"] = next_token
```

### Use a documented paginator

The generated stubs include paginator types for a small set of SES v2 list operations, including `list_email_templates`:

```python
from boto3.session import Session
from mypy_boto3_sesv2.client import SESV2Client
from mypy_boto3_sesv2.paginator import ListEmailTemplatesPaginator

session = Session(region_name="us-east-1")
sesv2: SESV2Client = session.client("sesv2")

paginator: ListEmailTemplatesPaginator = sesv2.get_paginator("list_email_templates")

for page in paginator.paginate(PageSize=20):
    for template in page.get("TemplatesMetadata", []):
        print(template["TemplateName"])
```

### Check identity status with typed responses

Use `get_email_identity` when your code needs to inspect verification or DKIM state before sending:

```python
from boto3.session import Session
from mypy_boto3_sesv2.client import SESV2Client
from mypy_boto3_sesv2.type_defs import GetEmailIdentityResponseTypeDef

session = Session(region_name="us-east-1")
sesv2: SESV2Client = session.client("sesv2")

identity: GetEmailIdentityResponseTypeDef = sesv2.get_email_identity(
    EmailIdentity="example.com"
)

print(identity["VerificationStatus"])
print(identity.get("DkimAttributes", {}).get("Status"))
```

## Configuration Notes

- This package types the SES v2 client surface only. The maintainer docs document a `client` module, `type_defs`, `literals`, and paginator types.
- Treat this as a typed client companion, not as a replacement for `boto3`.
- If you want automatic client overloads, prefer `boto3-stubs[sesv2]`. If you want the smallest dependency, use `mypy-boto3-sesv2` and annotate the client explicitly.
- The docs site is generated and rolling. It can reflect a newer boto3 model than the currently installable standalone PyPI release.

## Common Pitfalls

- Do not install `mypy-boto3-sesv2` without `boto3` and expect AWS calls to work.
- Do not point this package at `boto3.client("ses")`. `ses` and `sesv2` are different service names with different generated stubs.
- Do not assume every list operation has a paginator. The maintainer docs list paginator types for only a subset of SES v2 operations.
- Do not assume successful type checking means SES can send mail. Runtime failures still happen for unverified identities, missing IAM permissions, wrong region, or account restrictions.
- Do not rely on unannotated `session.client("sesv2")` inference if you installed the standalone or lite package.

## Version-Sensitive Notes For `1.42.13`

- On March 13, 2026, PyPI lists `mypy-boto3-sesv2 1.42.13` as the published standalone package version.
- The maintainer docs page for this service is a rolling generated reference and currently shows boto3 model version `1.42.63`.
- The maintainer docs describe three install paths for this service: `boto3-stubs`, `boto3-stubs-lite`, and the standalone `mypy-boto3-sesv2` package.
- Practical rule: pin the exact standalone version you can install from PyPI, and keep `boto3` aligned closely enough that the generated request and response shapes match the service model you are using.

## Official Sources

- Maintainer docs root: https://youtype.github.io/boto3_stubs_docs/mypy_boto3_sesv2/
- Maintainer client reference: https://youtype.github.io/boto3_stubs_docs/mypy_boto3_sesv2/client/
- Maintainer paginator reference: https://youtype.github.io/boto3_stubs_docs/mypy_boto3_sesv2/paginators/
- Maintainer type definitions: https://youtype.github.io/boto3_stubs_docs/mypy_boto3_sesv2/type_defs/
- PyPI package page: https://pypi.org/project/mypy-boto3-sesv2/
- Boto3 SES v2 reference: https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/sesv2.html
- Boto3 credentials guide: https://boto3.amazonaws.com/v1/documentation/api/latest/guide/credentials.html
- Boto3 configuration guide: https://boto3.amazonaws.com/v1/documentation/api/latest/guide/configuration.html
