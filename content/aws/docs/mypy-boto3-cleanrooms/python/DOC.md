---
name: mypy-boto3-cleanrooms
description: "mypy-boto3-cleanrooms type stubs for boto3 AWS Clean Rooms clients, paginators, literals, and TypedDict request and response shapes"
metadata:
  languages: "python"
  versions: "1.42.52"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,cleanrooms,boto3,type-stubs,mypy,pyright,python"
---

# mypy-boto3-cleanrooms Python Package Guide

## What It Is

`mypy-boto3-cleanrooms` provides generated type annotations for the AWS Clean Rooms client in `boto3`.

Use it when you want:

- a typed `Session.client("cleanrooms")`
- typed paginator objects for list operations such as `list_memberships`
- generated `literals` and `type_defs` modules for Clean Rooms request and response shapes
- better autocomplete and mypy or pyright coverage for AWS Clean Rooms administration code

It does not replace `boto3` at runtime. Real AWS calls still go through `boto3` and `botocore`.

## Golden Rule

- Install `boto3` for runtime AWS calls.
- Install either `boto3-stubs[cleanrooms]` or the standalone `mypy-boto3-cleanrooms` package for typing.
- Configure AWS credentials, profiles, and regions through normal `boto3` setup. This package only adds types.

## Install

### Recommended for most projects

```bash
python -m pip install boto3 "boto3-stubs[cleanrooms]"
```

This is the maintainer-recommended path when you want type checking plus automatic overloads for `Session.client("cleanrooms")`.

### Standalone Clean Rooms stubs

```bash
python -m pip install boto3 mypy-boto3-cleanrooms
```

Use this when you only want the Clean Rooms service stubs. In this mode, explicit annotations are usually necessary.

### Lower-memory IDE fallback

```bash
python -m pip install boto3 "boto3-stubs-lite[cleanrooms]"
```

The lite package is more memory-friendly, especially for PyCharm, but it does not provide `session.client()` overloads. Add explicit annotations if you use it.

### Type Checker

```bash
python -m pip install mypy
python -m mypy app.py
```

`pyright` also works with the generated stubs.

## Runtime Setup And Auth

`mypy-boto3-cleanrooms` has no package-specific initialization. All runtime behavior still comes from `boto3`.

AWS Clean Rooms requests still depend on normal AWS credentials and region resolution. Typical local setup is either:

```bash
aws configure
```

or environment variables:

```bash
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_DEFAULT_REGION=us-east-1
export AWS_PROFILE=dev
```

Create a normal boto3 session, then annotate the client:

```python
import os

from boto3.session import Session
from mypy_boto3_cleanrooms import CleanRoomsServiceClient

session = Session(
    profile_name=os.getenv("AWS_PROFILE"),
    region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"),
)
cleanrooms: CleanRoomsServiceClient = session.client("cleanrooms")
```

If your project keeps stubs as a development-only dependency, gate the import with `TYPE_CHECKING`:

```python
from typing import TYPE_CHECKING

import boto3

if TYPE_CHECKING:
    from mypy_boto3_cleanrooms import CleanRoomsServiceClient

def make_cleanrooms_client() -> "CleanRoomsServiceClient":
    return boto3.Session(region_name="us-east-1").client("cleanrooms")
```

## Core Usage

### Typed client for membership lookups

```python
import os

from boto3.session import Session
from mypy_boto3_cleanrooms import CleanRoomsServiceClient

session = Session(
    profile_name=os.getenv("AWS_PROFILE"),
    region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"),
)
cleanrooms: CleanRoomsServiceClient = session.client("cleanrooms")

response = cleanrooms.get_membership(
    membershipIdentifier=os.environ["CLEANROOMS_MEMBERSHIP_ID"],
)

membership = response["membership"]
print(membership["membershipIdentifier"])
print(membership["queryLogStatus"])
```

### Paginate memberships

Use the generated paginator type when listing memberships across multiple pages.

```python
from boto3.session import Session
from mypy_boto3_cleanrooms import CleanRoomsServiceClient
from mypy_boto3_cleanrooms.paginator import ListMembershipsPaginator

cleanrooms: CleanRoomsServiceClient = Session(region_name="us-east-1").client("cleanrooms")

paginator: ListMembershipsPaginator = cleanrooms.get_paginator("list_memberships")

for page in paginator.paginate():
    for membership in page.get("membershipSummaries", []):
        print(membership["membershipIdentifier"], membership["status"])
```

### Create a membership

AWS documents `create_membership` as the API for joining an existing collaboration. The request includes the collaboration identifier and the query log setting.

```python
import os

from boto3.session import Session
from mypy_boto3_cleanrooms import CleanRoomsServiceClient

cleanrooms: CleanRoomsServiceClient = Session(region_name="us-east-1").client("cleanrooms")

response = cleanrooms.create_membership(
    collaborationIdentifier=os.environ["CLEANROOMS_COLLABORATION_ID"],
    queryLogStatus="ENABLED",
)

membership_id = response["membership"]["membershipIdentifier"]
print(membership_id)
```

### Inspect configured tables

```python
from boto3.session import Session
from mypy_boto3_cleanrooms import CleanRoomsServiceClient

cleanrooms: CleanRoomsServiceClient = Session(region_name="us-east-1").client("cleanrooms")

response = cleanrooms.list_configured_tables()

for table in response.get("configuredTableSummaries", []):
    print(table["id"], table["name"])
```

## Exceptions And Error Handling

The generated client exposes typed service exceptions. Use them for the expected Clean Rooms failure modes, then fall back to `ClientError` for generic AWS handling.

```python
from boto3.session import Session
from botocore.exceptions import ClientError
from mypy_boto3_cleanrooms import CleanRoomsServiceClient

cleanrooms: CleanRoomsServiceClient = Session(region_name="us-east-1").client("cleanrooms")

try:
    cleanrooms.get_membership(membershipIdentifier="missing-membership-id")
except cleanrooms.exceptions.ResourceNotFoundException:
    print("Membership not found")
except cleanrooms.exceptions.AccessDeniedException:
    print("Missing Clean Rooms permissions")
except ClientError as err:
    print(err.response["Error"]["Code"])
    raise
```

## What Upstream Modules Cover

The published maintainer docs for this package center on these import areas:

- `mypy_boto3_cleanrooms` for the top-level `CleanRoomsServiceClient` export
- `mypy_boto3_cleanrooms.paginator` for paginator types such as `ListMembershipsPaginator`
- `mypy_boto3_cleanrooms.type_defs` for generated request and response `TypedDict`s
- `mypy_boto3_cleanrooms.literals` for constrained literal values used by the service model

That is the practical surface to plan around for agent-written code.

## Common Pitfalls

- `mypy-boto3-cleanrooms` is not the runtime SDK. You still need `boto3`.
- The install name uses dashes, but the import name uses underscores: `mypy-boto3-cleanrooms` vs `mypy_boto3_cleanrooms`.
- Installing only the standalone package does not give you the same `Session.client("cleanrooms")` overload experience as `boto3-stubs[cleanrooms]`.
- `boto3-stubs-lite[cleanrooms]` is easier on IDE memory, but you should expect to annotate the client explicitly.
- Successful type checking does not prove your AWS profile, region, or IAM permissions are correct.
- The published typing surface is client-focused. Plan around typed clients and paginators rather than expecting resource-style helpers.

## Version-Sensitive Notes

- This entry is keyed to `1.42.52`.
- The maintainer documents these packages as matching the related `boto3` version, so pinning `boto3` and `mypy-boto3-cleanrooms` to the same release family is the safest default.
- If your project relies on automatic `session.client("cleanrooms")` inference, prefer `boto3-stubs[cleanrooms]`. Use the standalone package when you want the narrowest service-specific dependency.

## Official Sources

- Maintainer docs: https://youtype.github.io/boto3_stubs_docs/mypy_boto3_cleanrooms/
- PyPI project: https://pypi.org/project/mypy-boto3-cleanrooms/
- AWS boto3 Clean Rooms reference: https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/cleanrooms.html
- AWS `get_membership` reference: https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/cleanrooms/client/get_membership.html
- AWS `create_membership` reference: https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/cleanrooms/client/create_membership.html
- AWS boto3 credentials guide: https://boto3.amazonaws.com/v1/documentation/api/latest/guide/credentials.html
- AWS boto3 configuration guide: https://boto3.amazonaws.com/v1/documentation/api/latest/guide/configuration.html
