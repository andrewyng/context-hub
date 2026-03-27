---
name: mypy-boto3-sso-admin
description: "Type stubs for boto3 IAM Identity Center SSO Admin clients, paginators, literals, and TypedDict request/response shapes"
metadata:
  languages: "python"
  versions: "1.42.41"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,iam-identity-center,sso-admin,boto3,type-stubs,mypy,pyright,python"
---

# `mypy-boto3-sso-admin` Python Package Guide

## Golden Rule

`mypy-boto3-sso-admin` is a stubs-only package for IAM Identity Center SSO Admin. Keep using `boto3` for real AWS calls, then choose one typing mode:

- Use `boto3-stubs[sso-admin]` when you want `Session().client("sso-admin")` to infer types automatically in IDEs, `mypy`, and `pyright`.
- Use `mypy-boto3-sso-admin` when you only want SSO Admin typings and are willing to annotate `SSOAdminClient`, paginators, literals, and `type_defs` explicitly.
- Use `boto3-stubs-lite[sso-admin]` when full overloads are too heavy for your IDE. Upstream notes that the lite package does not provide `session.client/resource` overloads.

## Install

Recommended when you want automatic type discovery:

```bash
python -m pip install "boto3==1.42.41" "boto3-stubs[sso-admin]==1.42.41"
```

Standalone SSO Admin stubs:

```bash
python -m pip install "boto3==1.42.41" "mypy-boto3-sso-admin==1.42.41"
```

Lower-memory IDE option:

```bash
python -m pip install "boto3==1.42.41" "boto3-stubs-lite[sso-admin]==1.42.41"
```

Common alternatives:

```bash
uv add "boto3==1.42.41" "boto3-stubs[sso-admin]==1.42.41"
poetry add "boto3==1.42.41" "boto3-stubs[sso-admin]==1.42.41"
```

Notes:

- The PyPI project requires Python 3.9 or newer.
- The maintainer documents this package as following the related `boto3` version, so pinning the same version is the safest default.
- The import root uses underscores: `mypy_boto3_sso_admin`, not the hyphenated package name.

## Runtime Setup And Auth

The typing package does not change runtime auth, retries, endpoints, or AWS config. Those still come from `boto3` and the normal AWS credential chain.

Typical local setup:

```bash
export AWS_PROFILE="dev"
export AWS_DEFAULT_REGION="us-east-1"
```

Or configure shared AWS files:

```bash
aws configure
```

Typed client setup:

```python
from boto3.session import Session
from mypy_boto3_sso_admin import SSOAdminClient

session = Session(profile_name="dev", region_name="us-east-1")
sso_admin: SSOAdminClient = session.client("sso-admin")
```

Useful environment variables:

- `AWS_PROFILE`
- `AWS_DEFAULT_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN`

## Core Usage

AWS documents SSO Admin as a client-based boto3 service. In practice, start by discovering your IAM Identity Center instance, then work from the returned `InstanceArn`.

### Discover the IAM Identity Center instance

```python
from boto3.session import Session
from mypy_boto3_sso_admin import SSOAdminClient

sso_admin: SSOAdminClient = Session(region_name="us-east-1").client("sso-admin")

instances = sso_admin.list_instances()["Instances"]
instance = instances[0]

instance_arn = instance["InstanceArn"]
identity_store_id = instance["IdentityStoreId"]

print(instance_arn)
print(identity_store_id)
```

Use `identity_store_id` with the separate `identitystore` API when you need principal IDs for users or groups.

### List permission sets with a typed paginator

```python
from boto3.session import Session
from mypy_boto3_sso_admin import SSOAdminClient
from mypy_boto3_sso_admin.paginator import ListPermissionSetsPaginator

sso_admin: SSOAdminClient = Session(region_name="us-east-1").client("sso-admin")
instance_arn = "arn:aws:sso:::instance/ssoins-1234567890abcdef"

paginator: ListPermissionSetsPaginator = sso_admin.get_paginator("list_permission_sets")

for page in paginator.paginate(InstanceArn=instance_arn):
    for permission_set_arn in page["PermissionSets"]:
        details = sso_admin.describe_permission_set(
            InstanceArn=instance_arn,
            PermissionSetArn=permission_set_arn,
        )["PermissionSet"]
        print(details["Name"], permission_set_arn)
```

### Create a permission set and attach policies

`put_inline_policy_to_permission_set` expects a JSON string, not a Python dict.

```python
import json

from boto3.session import Session
from mypy_boto3_sso_admin import SSOAdminClient
from mypy_boto3_sso_admin.type_defs import CreatePermissionSetRequestTypeDef

sso_admin: SSOAdminClient = Session(region_name="us-east-1").client("sso-admin")
instance_arn = "arn:aws:sso:::instance/ssoins-1234567890abcdef"

request: CreatePermissionSetRequestTypeDef = {
    "InstanceArn": instance_arn,
    "Name": "BillingReadOnly",
    "Description": "Read-only billing access",
    "Tags": [{"Key": "owner", "Value": "platform"}],
}

permission_set = sso_admin.create_permission_set(**request)["PermissionSet"]
permission_set_arn = permission_set["PermissionSetArn"]

sso_admin.attach_managed_policy_to_permission_set(
    InstanceArn=instance_arn,
    PermissionSetArn=permission_set_arn,
    ManagedPolicyArn="arn:aws:iam::aws:policy/job-function/Billing",
)

sso_admin.put_inline_policy_to_permission_set(
    InstanceArn=instance_arn,
    PermissionSetArn=permission_set_arn,
    InlinePolicy=json.dumps(
        {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": ["ce:GetCostAndUsage"],
                    "Resource": "*",
                }
            ],
        }
    ),
)
```

### Provision the permission set to an AWS account

After changing a permission set, provision it to the target account so the update is pushed out.

```python
from boto3.session import Session
from mypy_boto3_sso_admin import SSOAdminClient
from mypy_boto3_sso_admin.literals import ProvisionTargetTypeType

sso_admin: SSOAdminClient = Session(region_name="us-east-1").client("sso-admin")

target_type: ProvisionTargetTypeType = "AWS_ACCOUNT"

result = sso_admin.provision_permission_set(
    InstanceArn="arn:aws:sso:::instance/ssoins-1234567890abcdef",
    PermissionSetArn="arn:aws:sso:::permissionSet/ssoins-1234567890abcdef/ps-abcdef1234567890",
    TargetType=target_type,
    TargetId="123456789012",
)

request_id = result["PermissionSetProvisioningStatus"]["RequestId"]
status = sso_admin.describe_permission_set_provisioning_status(
    InstanceArn="arn:aws:sso:::instance/ssoins-1234567890abcdef",
    ProvisionPermissionSetRequestId=request_id,
)

print(status["PermissionSetProvisioningStatus"]["Status"])
```

### Create an account assignment and poll the status

```python
from boto3.session import Session
from mypy_boto3_sso_admin import SSOAdminClient
from mypy_boto3_sso_admin.literals import PrincipalTypeType, TargetTypeType

sso_admin: SSOAdminClient = Session(region_name="us-east-1").client("sso-admin")

principal_type: PrincipalTypeType = "GROUP"
target_type: TargetTypeType = "AWS_ACCOUNT"

assignment = sso_admin.create_account_assignment(
    InstanceArn="arn:aws:sso:::instance/ssoins-1234567890abcdef",
    TargetId="123456789012",
    TargetType=target_type,
    PermissionSetArn="arn:aws:sso:::permissionSet/ssoins-1234567890abcdef/ps-abcdef1234567890",
    PrincipalType=principal_type,
    PrincipalId="f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
)

request_id = assignment["AccountAssignmentCreationStatus"]["RequestId"]
status = sso_admin.describe_account_assignment_creation_status(
    InstanceArn="arn:aws:sso:::instance/ssoins-1234567890abcdef",
    AccountAssignmentCreationRequestId=request_id,
)

print(status["AccountAssignmentCreationStatus"]["Status"])
```

`PrincipalId` is the IAM Identity Center user or group ID, not a display name or email address.

## Typed Shapes And Dev-Only Imports

Use the generated `type_defs` when helper functions pass complex request objects around.

```python
from mypy_boto3_sso_admin.type_defs import PermissionsBoundaryTypeDef

boundary: PermissionsBoundaryTypeDef = {
    "ManagedPolicyArn": "arn:aws:iam::aws:policy/ReadOnlyAccess",
}
```

If the stubs are installed only in development, guard the imports with `TYPE_CHECKING`:

```python
from typing import TYPE_CHECKING

from boto3.session import Session

if TYPE_CHECKING:
    from mypy_boto3_sso_admin import SSOAdminClient
else:
    SSOAdminClient = object


def make_client() -> "SSOAdminClient":
    return Session(region_name="us-east-1").client("sso-admin")
```

## Common Pitfalls

- Do not install only `mypy-boto3-sso-admin` and expect AWS calls to work. You still need `boto3`.
- Do not expect `session.client("sso-admin")` to infer types automatically unless you installed `boto3-stubs[sso-admin]`. The standalone and lite packages need more explicit annotations.
- Do not pass a Python dict to `put_inline_policy_to_permission_set`. The API expects a JSON string.
- Do not use email addresses or group names for `PrincipalId`. SSO Admin expects IAM Identity Center principal IDs.
- Do not treat successful type checking as proof that your AWS profile, region, IAM permissions, or IAM Identity Center instance are correct.
- Do not import the hyphenated package name in Python code. Use `mypy_boto3_sso_admin`.

## Version-Sensitive Notes

- PyPI lists `mypy-boto3-sso-admin 1.42.41` as the current release for this package on March 13, 2026.
- PyPI states this package was generated with `mypy-boto3-builder 8.12.0`.
- The maintainer documents package versioning as following the related `boto3` version. When exact type coverage matters, pin `boto3==1.42.41` with `mypy-boto3-sso-admin==1.42.41`.

## Official Sources

- Maintainer docs: `https://youtype.github.io/boto3_stubs_docs/mypy_boto3_sso_admin/`
- PyPI package page: `https://pypi.org/project/mypy-boto3-sso-admin/`
- Exact PyPI release page: `https://pypi.org/project/mypy-boto3-sso-admin/1.42.41/`
- AWS boto3 SSO Admin reference: `https://docs.aws.amazon.com/boto3/latest/reference/services/sso-admin.html`
- Boto3 credentials guide: `https://docs.aws.amazon.com/boto3/latest/guide/credentials.html`
- Boto3 configuration guide: `https://docs.aws.amazon.com/boto3/latest/guide/configuration.html`
