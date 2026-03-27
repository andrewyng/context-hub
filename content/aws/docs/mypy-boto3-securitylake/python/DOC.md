---
name: mypy-boto3-securitylake
description: "mypy-boto3-securitylake package guide for typed boto3 Security Lake clients, paginators, literals, and TypedDicts"
metadata:
  languages: "python"
  versions: "1.42.3"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,securitylake,boto3,mypy-boto3-securitylake,boto3-stubs,typing,type-checking"
---

# mypy-boto3-securitylake Python Package Guide

## Golden Rule

Use `boto3` for real AWS calls and use `mypy-boto3-securitylake` only for typing.

If you want `Session().client("securitylake")` to infer types in editors and type checkers, install `boto3-stubs[securitylake]`. If you install `mypy-boto3-securitylake` or `boto3-stubs-lite[securitylake]`, expect to add explicit annotations for the client and paginators.

## Install

### Recommended for normal boto3 code

Install the runtime SDK and the Security Lake stubs together:

```bash
python -m pip install "boto3==1.42.3" "boto3-stubs[securitylake]==1.42.3"
```

This is the best default when you want `boto3` runtime behavior plus editor and type-checker support without extra casts in most code.

### Lower-memory option

```bash
python -m pip install "boto3==1.42.3" "boto3-stubs-lite[securitylake]==1.42.3"
```

The maintainer docs say the lite variant does not provide `session.client()` and `session.resource()` overloads, so explicit annotations become the normal workflow.

### Standalone package

```bash
python -m pip install "boto3==1.42.3" "mypy-boto3-securitylake==1.42.3"
```

Use this when you only want the Security Lake typing package or when you prefer `TYPE_CHECKING` imports.

## Prerequisites And AWS Setup

This package does not handle authentication, regions, retries, or endpoints. Those still come from `boto3` and normal AWS configuration.

Typical local setup:

```bash
export AWS_PROFILE=security-dev
export AWS_DEFAULT_REGION=us-east-1
```

`boto3` looks for credentials through its normal provider chain, including explicit client or session parameters, environment variables, IAM Identity Center, `~/.aws/credentials`, `~/.aws/config`, container credentials, and EC2 instance metadata.

When you need client-specific behavior, pass a `botocore.config.Config` object. AWS documents that a `Config` object takes precedence over environment variables and config-file values for settings such as `region_name` and retries.

```python
from boto3.session import Session
from botocore.config import Config

config = Config(
    region_name="us-east-1",
    retries={"max_attempts": 10, "mode": "standard"},
)

session = Session(profile_name="security-dev")
securitylake = session.client("securitylake", config=config)
```

## Core Usage

### Zero-annotation workflow with `boto3-stubs[securitylake]`

With the full service extra installed, ordinary `boto3` code should type-check without manual annotations:

```python
from boto3.session import Session

session = Session(profile_name="security-dev", region_name="us-east-1")
client = session.client("securitylake")

response = client.list_subscribers(maxResults=20)

for subscriber in response.get("subscribers", []):
    print(subscriber["subscriberName"], subscriber["subscriberStatus"])
```

`list_subscribers` is a real Security Lake client method documented by boto3. It is a good low-friction call for confirming your typing and region setup.

### Explicit client annotation

Use explicit annotations when you installed the standalone package or the lite package:

```python
from boto3.session import Session
from mypy_boto3_securitylake import SecurityLakeClient

session = Session(profile_name="security-dev", region_name="us-east-1")
client: SecurityLakeClient = session.client("securitylake")

response = client.list_data_lakes(regions=["us-east-1"])

for data_lake in response.get("dataLakes", []):
    print(data_lake["region"], data_lake["createStatus"])
```

### Typed paginator usage

The generated paginator module exposes typed paginator classes for:

- `get_data_lake_sources`
- `list_data_lake_exceptions`
- `list_log_sources`
- `list_subscribers`

Example:

```python
from boto3.session import Session
from mypy_boto3_securitylake import SecurityLakeClient
from mypy_boto3_securitylake.paginator import ListSubscribersPaginator

session = Session(profile_name="security-dev", region_name="us-east-1")
client: SecurityLakeClient = session.client("securitylake")
subscribers: ListSubscribersPaginator = client.get_paginator("list_subscribers")

for page in subscribers.paginate():
    for subscriber in page.get("subscribers", []):
        print(subscriber["subscriberArn"])
```

### Typed request and response helpers

Use `type_defs` when request fragments or nested response shapes need to stay typed:

```python
from mypy_boto3_securitylake.type_defs import AwsIdentityTypeDef

subscriber_identity: AwsIdentityTypeDef = {
    "externalId": "external-id-for-cross-account-access",
}
```

Use generated literals when you want the type checker to reject misspelled enum-like strings:

```python
from mypy_boto3_securitylake.literals import AccessTypeType

def normalize_access_type(value: AccessTypeType) -> AccessTypeType:
    return value
```

## `TYPE_CHECKING` Pattern

The maintainer docs explicitly recommend `TYPE_CHECKING` if you do not want to ship stub packages in production. They also note that `pylint` can complain unless you provide an `object` fallback.

```python
from typing import TYPE_CHECKING

from boto3.session import Session

if TYPE_CHECKING:
    from mypy_boto3_securitylake import SecurityLakeClient
else:
    SecurityLakeClient = object

session = Session(profile_name="security-dev", region_name="us-east-1")
client: "SecurityLakeClient" = session.client("securitylake")
```

## Common Pitfalls

- `mypy-boto3-securitylake` is stub-only. It does not create a Security Lake client and it does not replace `boto3`.
- Keep the runtime SDK and stubs on the same release line. The maintainer docs say `mypy-boto3-securitylake` uses the same version as the related `boto3` release.
- `boto3-stubs[securitylake]` and `boto3-stubs-lite[securitylake]` are not equivalent. The lite package is more memory-friendly, but the maintainer docs say it does not provide `session.client/resource` overloads.
- Static typing does not validate AWS credentials, IAM permissions, region selection, or whether Security Lake is enabled in the target Region.
- Import names use underscores, not hyphens: install `mypy-boto3-securitylake`, import `mypy_boto3_securitylake`.
- If PyCharm becomes slow with these generated literals and overloads, the maintainer docs recommend trying `boto3-stubs-lite`.

## Version-Sensitive Notes For `1.42.3`

- PyPI shows `mypy-boto3-securitylake 1.42.3` as the latest release as of March 13, 2026, released on December 4, 2025.
- PyPI lists `Requires: Python >=3.9`.
- The package description says it provides type annotations for `boto3 SecurityLake 1.42.3`.
- The package page says `mypy-boto3-securitylake` version matches the related `boto3` version, so pinning both to `1.42.3` is the safest default.
- The hosted documentation is a generated site, not a versioned snapshot. Re-check the live docs before moving to a newer release line.

## Official Sources

- Maintainer docs: https://youtype.github.io/boto3_stubs_docs/mypy_boto3_securitylake/
- boto3-stubs docs root: https://youtype.github.io/boto3_stubs_docs/
- PyPI package page: https://pypi.org/project/mypy-boto3-securitylake/
- boto3 Security Lake service reference: https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/securitylake.html
- boto3 `list_subscribers` reference: https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/securitylake/client/list_subscribers.html
- boto3 `list_data_lakes` reference: https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/securitylake/client/list_data_lakes.html
- boto3 credentials guide: https://docs.aws.amazon.com/boto3/latest/guide/credentials.html
- boto3 configuration guide: https://docs.aws.amazon.com/boto3/latest/guide/configuration.html
