---
name: mypy-boto3-sso
description: "mypy-boto3-sso type stubs for boto3 IAM Identity Center (AWS SSO) clients, paginators, and TypedDict shapes"
metadata:
  languages: "python"
  versions: "1.42.3"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,sso,iam-identity-center,boto3,type-stubs,mypy,pyright,python"
---

# mypy-boto3-sso Python Package Guide

## Golden Rule

`mypy-boto3-sso` adds static types for the `boto3` `sso` client. It does not replace `boto3`, it does not create IAM Identity Center sessions for you, and it does not remove the need for an `accessToken` when you call the SSO Portal API directly.

Use it in one of these modes:

- Install `boto3-stubs[sso]` if you want the best autocomplete and `Session.client("sso")` overloads.
- Install `mypy-boto3-sso` if you only want the standalone SSO stubs and are willing to add explicit annotations.
- Install `boto3-stubs-lite[sso]` if IDE memory use matters more than automatic overload inference.

AWS now calls this service IAM Identity Center, but the SDK service name and the stubs package still use `sso`.

## Install

`mypy-boto3-sso` requires Python 3.9 or later.

Recommended for most projects:

```bash
python -m pip install boto3 'boto3-stubs[sso]==1.42.3'
```

Standalone SSO stubs:

```bash
python -m pip install boto3 'mypy-boto3-sso==1.42.3'
```

Lower-memory IDE fallback:

```bash
python -m pip install boto3 'boto3-stubs-lite[sso]==1.42.3'
```

## Auth And Runtime Setup

`mypy-boto3-sso` has no package-specific initialization. Runtime behavior still comes from `boto3`, AWS config, and the IAM Identity Center login flow.

If your app uses AWS CLI v2 IAM Identity Center profiles, configure and log in first:

```bash
aws configure sso --profile my-sso-profile
aws sso login --profile my-sso-profile
```

Useful environment variables:

```bash
export AWS_PROFILE=my-sso-profile
export AWS_DEFAULT_REGION=us-west-2
export AWS_SSO_REGION=us-east-1
export AWS_SSO_ACCESS_TOKEN=your-portal-access-token
```

Important distinction:

- `AWS_PROFILE` and `Session(profile_name=...)` let normal `boto3` clients reuse credentials sourced from IAM Identity Center.
- Direct `sso` client calls such as `list_accounts` and `get_role_credentials` still need an `accessToken` parameter. AWS documents that this token comes from the IAM Identity Center OIDC flow.

Create a typed client like this:

```python
import os

from boto3.session import Session
from mypy_boto3_sso import SSOClient

session = Session(profile_name=os.getenv("AWS_PROFILE", "my-sso-profile"))

sso: SSOClient = session.client(
    "sso",
    region_name=os.getenv("AWS_SSO_REGION", "us-east-1"),
)
```

## Core Usage

### List assigned accounts with a typed paginator

```python
import os

from boto3.session import Session
from mypy_boto3_sso import SSOClient
from mypy_boto3_sso.paginator import ListAccountsPaginator
from mypy_boto3_sso.type_defs import AccountInfoTypeDef, ListAccountsRequestPaginateTypeDef

client: SSOClient = Session(profile_name=os.environ["AWS_PROFILE"]).client(
    "sso",
    region_name=os.environ["AWS_SSO_REGION"],
)

request: ListAccountsRequestPaginateTypeDef = {
    "accessToken": os.environ["AWS_SSO_ACCESS_TOKEN"],
}

paginator: ListAccountsPaginator = client.get_paginator("list_accounts")

for page in paginator.paginate(**request):
    for account in page.get("accountList", []):
        typed_account: AccountInfoTypeDef = account
        print(typed_account["accountId"], typed_account.get("accountName"))
```

`list_accounts` is a paginated API in AWS, so use the paginator instead of managing `nextToken` manually.

### List roles for an account and exchange for temporary AWS credentials

```python
import os

from boto3.session import Session
from mypy_boto3_sso import SSOClient
from mypy_boto3_sso.paginator import ListAccountRolesPaginator
from mypy_boto3_sso.type_defs import GetRoleCredentialsResponseTypeDef, RoleInfoTypeDef

client: SSOClient = Session(profile_name=os.environ["AWS_PROFILE"]).client(
    "sso",
    region_name=os.environ["AWS_SSO_REGION"],
)

access_token = os.environ["AWS_SSO_ACCESS_TOKEN"]
account_id = "123456789012"

roles: ListAccountRolesPaginator = client.get_paginator("list_account_roles")

for page in roles.paginate(accessToken=access_token, accountId=account_id):
    for role in page.get("roleList", []):
        typed_role: RoleInfoTypeDef = role
        print(typed_role["roleName"])

creds_response: GetRoleCredentialsResponseTypeDef = client.get_role_credentials(
    accessToken=access_token,
    accountId=account_id,
    roleName="AdministratorAccess",
)

role_credentials = creds_response["roleCredentials"]

account_session = Session(
    aws_access_key_id=role_credentials["accessKeyId"],
    aws_secret_access_key=role_credentials["secretAccessKey"],
    aws_session_token=role_credentials["sessionToken"],
    region_name=os.getenv("AWS_DEFAULT_REGION", "us-west-2"),
)

s3 = account_session.client("s3")
print(s3.list_buckets()["Buckets"])
```

This is the common low-level pattern when you are integrating directly with the IAM Identity Center Portal API instead of relying only on `aws sso login` plus a named profile.

### Revoke the portal access token

```python
import os

from boto3.session import Session
from mypy_boto3_sso import SSOClient

client: SSOClient = Session(profile_name=os.environ["AWS_PROFILE"]).client(
    "sso",
    region_name=os.environ["AWS_SSO_REGION"],
)

client.logout(accessToken=os.environ["AWS_SSO_ACCESS_TOKEN"])
```

## Tooling Pattern For Dev-Only Stubs

If production environments do not install stub packages, keep imports behind `TYPE_CHECKING`:

```python
from typing import TYPE_CHECKING

from boto3.session import Session

if TYPE_CHECKING:
    from mypy_boto3_sso import SSOClient

def make_client() -> "SSOClient":
    return Session(profile_name="my-sso-profile").client(
        "sso",
        region_name="us-east-1",
    )
```

## Common Pitfalls

- Installing `mypy-boto3-sso` and forgetting to install `boto3` for runtime calls.
- Expecting a named AWS CLI SSO profile to remove the `accessToken` argument from direct `sso` client API calls. AWS still requires that parameter on these methods.
- Using `boto3-stubs-lite[sso]` or the standalone package and expecting unannotated `Session.client("sso")` calls to become typed automatically.
- Confusing your workload region with the IAM Identity Center portal region. The `sso` client should target the IAM Identity Center region.
- Treating the package as a credential provider. It only adds generated types for the `boto3` client, paginators, literals, and `TypedDict` response shapes.

## Version-Sensitive Notes

- This entry is pinned to `mypy-boto3-sso==1.42.3`.
- The maintainer documents these stub versions as matching the related `boto3` version. Pin them together when exact request and response shapes matter.
- The maintainer docs are generated and unversioned, so use the exact PyPI release page when locking dependencies.

## Official Sources

- Docs: https://youtype.github.io/boto3_stubs_docs/mypy_boto3_sso/
- PyPI: https://pypi.org/project/mypy-boto3-sso/
- Exact release: https://pypi.org/project/mypy-boto3-sso/1.42.3/
- Boto3 credentials guide: https://docs.aws.amazon.com/boto3/latest/guide/credentials.html
- Boto3 configuration guide: https://docs.aws.amazon.com/boto3/latest/guide/configuration.html
- Boto3 IAM Identity Center credential provider guide: https://docs.aws.amazon.com/sdkref/latest/guide/feature-sso-credentials.html
- Boto3 SSO client reference: https://docs.aws.amazon.com/boto3/latest/reference/services/sso.html
- `list_accounts`: https://docs.aws.amazon.com/boto3/latest/reference/services/sso/client/list_accounts.html
- `list_account_roles`: https://docs.aws.amazon.com/boto3/latest/reference/services/sso/client/list_account_roles.html
- `get_role_credentials`: https://docs.aws.amazon.com/boto3/latest/reference/services/sso/client/get_role_credentials.html
- `logout`: https://docs.aws.amazon.com/boto3/latest/reference/services/sso/client/logout.html
