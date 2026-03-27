---
name: mypy-boto3-evidently
description: "mypy-boto3-evidently type stubs for typed boto3 CloudWatch Evidently clients, paginators, literals, and TypedDict shapes"
metadata:
  languages: "python"
  versions: "1.42.35"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,boto3,evidently,type-stubs,mypy,pyright,python"
---

# mypy-boto3-evidently Python Package Guide

## What It Is

`mypy-boto3-evidently` adds static types for the `boto3` `evidently` client surface. Use it for editor completion and type checking around `CloudWatchEvidentlyClient`, paginator classes, `Literal` enums, and `TypedDict` request and response shapes.

It does not replace `boto3`, and it does not configure credentials, regions, or retries for you.

Important context: AWS documents that CloudWatch Evidently support ended on October 16, 2025. In practice, this package is mainly useful for maintaining or migrating older code that still imports or types legacy Evidently calls.

## Install

`mypy-boto3-evidently` is a stubs-only package. Keep `boto3` installed for runtime AWS calls.

### Recommended for most projects

Use the service extra when you want `Session.client("evidently")` type inference without annotating every variable:

```bash
python -m pip install boto3 "boto3-stubs[evidently]"
```

### Standalone service stubs

Use this when you only want the Evidently stubs package and are fine with explicit annotations:

```bash
python -m pip install boto3 mypy-boto3-evidently
```

### Lower-memory IDE fallback

The lite package is more memory-friendly, but upstream notes that it does not provide `session.client()` and `session.resource()` overloads:

```bash
python -m pip install boto3 "boto3-stubs-lite[evidently]"
```

### Exact-match local generation

The maintainer recommends local generation when you need stubs that exactly match a pinned `boto3` build:

```bash
uvx --with "boto3==1.42.35" mypy-boto3-builder
```

Then choose `boto3-stubs` and the `CloudWatchEvidently` service.

## AWS Auth And Client Initialization

`mypy-boto3-evidently` has no package-specific initialization. Use normal `boto3` credential and region configuration.

AWS documents that Boto3 requests need both credentials and an AWS Region. Common local setup:

```bash
export AWS_PROFILE=legacy-evidently
export AWS_DEFAULT_REGION=us-west-2
```

or:

```bash
aws configure
```

Typed client setup:

```python
from boto3.session import Session
from mypy_boto3_evidently import CloudWatchEvidentlyClient

session = Session(profile_name="legacy-evidently", region_name="us-west-2")
evidently: CloudWatchEvidentlyClient = session.client("evidently")
```

If you need client-specific retry or region overrides, pass a `botocore.config.Config` object when creating the client.

## Core Usage

### Inspect a legacy project

```python
from boto3.session import Session
from mypy_boto3_evidently import CloudWatchEvidentlyClient

evidently: CloudWatchEvidentlyClient = Session(
    profile_name="legacy-evidently",
    region_name="us-west-2",
).client("evidently")

project = evidently.get_project(project="legacy-project")["project"]
print(project["name"], project["status"], project["featureCount"])
```

### Typed `evaluate_feature` request

AWS documents `evaluate_feature` with `project`, `feature`, and `entityId` as required parameters, and `evaluationContext` as an optional JSON object string.

```python
from boto3.session import Session
from mypy_boto3_evidently import CloudWatchEvidentlyClient
from mypy_boto3_evidently.type_defs import EvaluationRequestTypeDef

evidently: CloudWatchEvidentlyClient = Session(region_name="us-west-2").client(
    "evidently"
)

request: EvaluationRequestTypeDef = {
    "project": "legacy-project",
    "feature": "checkout-banner",
    "entityId": "user-123",
    "evaluationContext": '{"plan":"pro"}',
}

response = evidently.evaluate_feature(**request)
print(response["variation"])
print(response["value"])
```

### Typed paginator for project discovery

The maintainer publishes paginator types for `list_experiments`, `list_features`, `list_launches`, `list_projects`, `list_segment_references`, and `list_segments`.

```python
from boto3.session import Session
from mypy_boto3_evidently import CloudWatchEvidentlyClient
from mypy_boto3_evidently.paginator import ListProjectsPaginator

evidently: CloudWatchEvidentlyClient = Session(region_name="us-west-2").client(
    "evidently"
)

paginator: ListProjectsPaginator = evidently.get_paginator("list_projects")

for page in paginator.paginate(PaginationConfig={"PageSize": 20}):
    for project in page.get("projects", []):
        print(project["name"], project["status"])
```

### Sending project events

AWS documents `put_project_events` with a required `project` and an `events` list containing `data`, `timestamp`, and `type`.

```python
import json
from datetime import datetime, timezone

from boto3.session import Session
from mypy_boto3_evidently import CloudWatchEvidentlyClient

evidently: CloudWatchEvidentlyClient = Session(region_name="us-west-2").client(
    "evidently"
)

evidently.put_project_events(
    project="legacy-project",
    events=[
        {
            "data": json.dumps({"name": "checkout-click", "user": "user-123"}),
            "timestamp": datetime.now(timezone.utc),
            "type": "aws.evidently.custom",
        }
    ],
)
```

If you are maintaining old client-side evaluation code that targets the AWS AppConfig Lambda extension on `localhost`, AWS shows configuring the boto3 client with `endpoint_url="http://localhost:2772"` and `Config(inject_host_prefix=False)`.

## Type-Checking Patterns

### Keep stub imports behind `TYPE_CHECKING`

If production environments do not install stubs, avoid a runtime dependency:

```python
from typing import TYPE_CHECKING

from boto3.session import Session

if TYPE_CHECKING:
    from mypy_boto3_evidently import CloudWatchEvidentlyClient
else:
    CloudWatchEvidentlyClient = object

def make_client() -> "CloudWatchEvidentlyClient":
    return Session(region_name="us-west-2").client("evidently")
```

### Use generated literals and `TypedDict` shapes

```python
from mypy_boto3_evidently.literals import ChangeDirectionEnumType
from mypy_boto3_evidently.type_defs import EvaluationRequestTypeDef

direction: ChangeDirectionEnumType = "INCREASE"

request: EvaluationRequestTypeDef = {
    "project": "legacy-project",
    "feature": "checkout-banner",
    "entityId": "user-123",
}
```

## Common Pitfalls

- Installing `mypy-boto3-evidently` and expecting it to make AWS calls by itself. Runtime calls still come from `boto3`.
- Forgetting AWS credentials or a Region. AWS documents that both are required for Boto3 requests.
- Expecting `session.client("evidently")` inference from `boto3-stubs-lite[evidently]`. The lite package needs more explicit annotations.
- Treating CloudWatch Evidently as an active AWS service. AWS ended support on October 16, 2025.
- Assuming old AppConfig-backed localhost evaluation code uses normal Evidently IAM enforcement. AWS documents that client-side evaluation uses a different access-control model.
- Using the full stub package in PyCharm when IDE performance is already tight. Upstream recommends the lite variant if overloads become too heavy.

## Version-Sensitive Notes

- This entry is pinned to `mypy-boto3-evidently 1.42.35`, which PyPI lists as requiring Python 3.9 or newer.
- The maintainer describes these packages as version-matched to the related `boto3` service model. Pin `boto3` and `mypy-boto3-evidently` together when exact request and response shapes matter.
- AWS documents that CloudWatch Evidently support ended on October 16, 2025, so new projects should not start on this service.

## Official Sources

- Package page: https://pypi.org/project/mypy-boto3-evidently/
- Exact release page: https://pypi.org/project/mypy-boto3-evidently/1.42.35/
- Maintainer docs: https://youtype.github.io/boto3_stubs_docs/mypy_boto3_evidently/
- Builder repository: https://github.com/youtype/mypy_boto3_builder
- Boto3 credentials guide: https://docs.aws.amazon.com/boto3/latest/guide/credentials.html
- Boto3 configuration guide: https://docs.aws.amazon.com/boto3/latest/guide/configuration.html
- Boto3 `evaluate_feature`: https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/evidently/client/evaluate_feature.html
- Boto3 `put_project_events`: https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/evidently/client/put_project_events.html
- Boto3 `ListProjects` paginator: https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/evidently/paginator/ListProjects.html
- AWS CloudWatch Evidently client-side evaluation guide: https://docs.aws.amazon.com/en_us/AmazonCloudWatch/latest/monitoring/CloudWatch-Evidently-client-side-evaluation.html
