---
name: mypy-boto3-accessanalyzer
description: "Type stubs for boto3 IAM Access Analyzer in Python, including typed clients, paginators, literals, and TypedDict shapes"
metadata:
  languages: "python"
  versions: "1.42.3"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,accessanalyzer,boto3,python,typing,type-stubs,mypy,pyright"
---

# `mypy-boto3-accessanalyzer` Python Package Guide

## Golden Rule

`mypy-boto3-accessanalyzer` is a typing package for `boto3` IAM Access Analyzer code. It does not make AWS calls, it does not configure credentials, and it does not replace `boto3`.

Use it in one of these modes:

- `boto3-stubs[accessanalyzer]` for automatic `Session.client("accessanalyzer")` type inference in editors and type checkers.
- `mypy-boto3-accessanalyzer` when you only want the Access Analyzer stubs and are willing to annotate clients and paginators explicitly.
- `boto3-stubs-lite[accessanalyzer]` if IDE memory use matters more than overload-based inference.

## Install

PyPI marks this package as `Stubs Only` and requires Python `>=3.9`.

Recommended for most projects:

```bash
python -m pip install "boto3==1.42.3" "boto3-stubs[accessanalyzer]==1.42.3"
```

Lower-memory option:

```bash
python -m pip install "boto3==1.42.3" "boto3-stubs-lite[accessanalyzer]==1.42.3"
```

Standalone service stubs:

```bash
python -m pip install "boto3==1.42.3" "mypy-boto3-accessanalyzer==1.42.3"
```

Practical install rule:

- use `boto3-stubs[accessanalyzer]` when you want the smoothest editor experience
- use `boto3-stubs-lite[accessanalyzer]` if PyCharm or large `Literal` overloads are slowing your IDE down
- use `mypy-boto3-accessanalyzer` when you want only this service package and you are fine with explicit annotations

## Initialize And Authenticate

Authentication and configuration still come from normal `boto3` and the AWS credential chain. IAM Access Analyzer is regional, so set the region deliberately when you create the session or client.

Typical local setup:

```bash
export AWS_PROFILE=audit
export AWS_DEFAULT_REGION=us-east-1
```

```python
from boto3.session import Session
from botocore.config import Config
from mypy_boto3_accessanalyzer import AccessAnalyzerClient

session = Session(profile_name="audit", region_name="us-east-1")

accessanalyzer: AccessAnalyzerClient = session.client(
    "accessanalyzer",
    config=Config(
        retries={
            "mode": "standard",
            "max_attempts": 10,
        }
    ),
)
```

Environment variables that commonly matter:

- `AWS_PROFILE`
- `AWS_DEFAULT_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN`

## Core Usage

### Typed client and paginator

`list_analyzers` accepts `nextToken`, `maxResults`, and `type`, and returns analyzer objects with fields such as `arn`, `name`, `type`, and `status`.

```python
from boto3.session import Session
from mypy_boto3_accessanalyzer import AccessAnalyzerClient
from mypy_boto3_accessanalyzer.paginator import ListAnalyzersPaginator

client: AccessAnalyzerClient = Session(region_name="us-east-1").client("accessanalyzer")
list_analyzers: ListAnalyzersPaginator = client.get_paginator("list_analyzers")

for page in list_analyzers.paginate(type="ACCOUNT"):
    for analyzer in page.get("analyzers", []):
        print(analyzer["name"], analyzer["arn"], analyzer["status"])
```

### Create an analyzer

AWS documents `create_analyzer` with required `analyzerName` and `type` parameters. The response contains the analyzer ARN.

```python
from boto3.session import Session
from mypy_boto3_accessanalyzer import AccessAnalyzerClient

client: AccessAnalyzerClient = Session(region_name="us-east-1").client("accessanalyzer")

response = client.create_analyzer(
    analyzerName="account-external-access",
    type="ACCOUNT",
    tags={"Environment": "dev"},
)

print(response["arn"])
```

### Validate a policy before deployment

`validate_policy` takes a JSON policy document string and returns findings with `findingType`, `issueCode`, `findingDetails`, optional `learnMoreLink`, and location metadata.

```python
import json

from boto3.session import Session
from mypy_boto3_accessanalyzer import AccessAnalyzerClient

bucket_policy = {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowReadFromAnalyticsRole",
            "Effect": "Allow",
            "Principal": {"AWS": "arn:aws:iam::123456789012:role/analytics"},
            "Action": ["s3:GetObject"],
            "Resource": ["arn:aws:s3:::example-bucket/*"],
        }
    ],
}

client: AccessAnalyzerClient = Session(region_name="us-east-1").client("accessanalyzer")

response = client.validate_policy(
    policyDocument=json.dumps(bucket_policy),
    policyType="RESOURCE_POLICY",
    validatePolicyResourceType="AWS::S3::Bucket",
)

for finding in response["findings"]:
    print(finding["findingType"], finding["issueCode"])
    print(finding["findingDetails"])
```

If you are validating a resource policy for a resource type that is not in the documented `validatePolicyResourceType` set, omit that parameter and let IAM Access Analyzer apply the generic resource-policy checks.

### Review findings with `list_findings_v2`

`list_findings_v2` requires `analyzerArn` and supports `filter` and `sort`. The response returns finding fields including `id`, `resource`, `resourceType`, `status`, `updatedAt`, and `findingType`.

```python
import os

from boto3.session import Session
from mypy_boto3_accessanalyzer import AccessAnalyzerClient
from mypy_boto3_accessanalyzer.paginator import ListFindingsV2Paginator

client: AccessAnalyzerClient = Session(region_name="us-east-1").client("accessanalyzer")
analyzer_arn = os.environ["ACCESS_ANALYZER_ARN"]

findings: ListFindingsV2Paginator = client.get_paginator("list_findings_v2")

for page in findings.paginate(
    analyzerArn=analyzer_arn,
    filter={"status": {"eq": ["ACTIVE"]}},
    sort={"attributeName": "updatedAt", "orderBy": "DESC"},
):
    for finding in page["findings"]:
        print(finding["id"], finding["resource"], finding["status"], finding["findingType"])
```

### Start a fresh resource scan

AWS documents `start_resource_scan` as supported only for external access analyzers.

```python
import os

from boto3.session import Session
from mypy_boto3_accessanalyzer import AccessAnalyzerClient

client: AccessAnalyzerClient = Session(region_name="us-east-1").client("accessanalyzer")

client.start_resource_scan(
    analyzerArn=os.environ["ACCESS_ANALYZER_ARN"],
    resourceArn="arn:aws:s3:::example-bucket",
    resourceOwnerAccount="123456789012",
)
```

## Tooling Patterns

### `TYPE_CHECKING` for dev-only stubs

If production images do not install stub packages, keep the imports behind `TYPE_CHECKING` and annotate with strings:

```python
from typing import TYPE_CHECKING

from boto3.session import Session

if TYPE_CHECKING:
    from mypy_boto3_accessanalyzer import AccessAnalyzerClient
    from mypy_boto3_accessanalyzer.paginator import ListAnalyzersPaginator

client: "AccessAnalyzerClient" = Session(region_name="us-east-1").client("accessanalyzer")
paginator: "ListAnalyzersPaginator" = client.get_paginator("list_analyzers")
```

### Literals and `TypedDict` shapes

The package exposes constrained string literals and typed dictionaries through `literals` and `type_defs`.

```python
from mypy_boto3_accessanalyzer.literals import AccessCheckPolicyTypeType
from mypy_boto3_accessanalyzer.type_defs import AccessPreviewStatusReasonTypeDef

def normalize_policy_type(value: AccessCheckPolicyTypeType) -> str:
    return value

def build_reason(code: str) -> AccessPreviewStatusReasonTypeDef:
    return {"code": code}
```

## Common Pitfalls

- Installing the stubs without `boto3`. This package is typing-only.
- Expecting the standalone or lite variants to infer `Session.client("accessanalyzer")` automatically. Upstream only promises that behavior from `boto3-stubs[accessanalyzer]`.
- Importing the module name with hyphens. The Python import package is `mypy_boto3_accessanalyzer`.
- Treating this like a resource-based service package. The maintainer docs for this package focus on the typed client, paginator module, literals, and type definitions.
- Passing `validatePolicyResourceType` for non-`RESOURCE_POLICY` validation. AWS documents that parameter only for resource policy validation.
- Calling `start_resource_scan` on a non-external analyzer. AWS documents that operation as external-analyzer only.
- Assuming analyzers are global. `create_analyzer` is regional, and AWS documents a limit of one analyzer per account per Region.

## Version-Sensitive Notes

- PyPI lists `mypy-boto3-accessanalyzer 1.42.3` as the current release on March 13, 2026, released on December 4, 2025.
- The package was generated with `mypy-boto3-builder 8.12.0`.
- Upstream states that the package version matches the related `boto3` version. Pin `boto3==1.42.3` with `mypy-boto3-accessanalyzer==1.42.3` when exact generated signatures matter.
- The PyPI project page recommends local generation with `uvx --with 'boto3==1.42.3' mypy-boto3-builder` if you need stubs generated directly from your pinned boto3 version.
- The AWS `latest` documentation pages for Access Analyzer are rolling and currently show mixed boto3 patch numbers across pages, so use PyPI for exact dependency pinning and the AWS pages for operation behavior.

## Official Sources

- PyPI package page: https://pypi.org/project/mypy-boto3-accessanalyzer/
- Maintainer docs root: https://youtype.github.io/boto3_stubs_docs/mypy_boto3_accessanalyzer/
- Boto3 credentials guide: https://docs.aws.amazon.com/boto3/latest/guide/credentials.html
- Boto3 configuration guide: https://docs.aws.amazon.com/boto3/latest/guide/configuration.html
- Access Analyzer `create_analyzer`: https://docs.aws.amazon.com/boto3/latest/reference/services/accessanalyzer/client/create_analyzer.html
- Access Analyzer `list_analyzers`: https://docs.aws.amazon.com/boto3/latest/reference/services/accessanalyzer/client/list_analyzers.html
- Access Analyzer `list_findings_v2`: https://docs.aws.amazon.com/boto3/latest/reference/services/accessanalyzer/client/list_findings_v2.html
- Access Analyzer `start_resource_scan`: https://docs.aws.amazon.com/boto3/latest/reference/services/accessanalyzer/client/start_resource_scan.html
- Access Analyzer `validate_policy`: https://docs.aws.amazon.com/boto3/latest/reference/services/accessanalyzer/client/validate_policy.html
