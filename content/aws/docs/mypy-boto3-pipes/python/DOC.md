---
name: mypy-boto3-pipes
description: "mypy-boto3-pipes type stubs for boto3 EventBridge Pipes clients, paginators, literals, and TypedDict shapes"
metadata:
  languages: "python"
  versions: "1.42.3"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,eventbridge,pipes,boto3,typing,mypy,pyright,python"
---

# mypy-boto3-pipes Python Package Guide

## Golden Rule

`mypy-boto3-pipes` is a typing package for `boto3.client("pipes")`. It does not replace `boto3`, it does not create AWS clients by itself, and it does not manage credentials or regions for you.

Use it in one of these modes:

- Install `boto3-stubs[pipes]` when you want the standard maintainer setup with typed `Session.client("pipes")` calls.
- Install `mypy-boto3-pipes` when you only want the EventBridge Pipes stubs and are willing to add explicit annotations.
- Install `boto3-stubs-lite[pipes]` when editor memory use matters more than automatic overload inference.

## Install

`mypy-boto3-pipes` requires Python `>=3.9`.

### Recommended for most projects

```bash
python -m pip install "boto3==1.42.3" "boto3-stubs[pipes]==1.42.3"
```

This is the best default when you want typed `session.client("pipes")` calls without annotating every variable by hand.

### Standalone EventBridge Pipes stubs

```bash
python -m pip install "boto3==1.42.3" "mypy-boto3-pipes==1.42.3"
```

Use this when you want only the Pipes typing package. In this mode, explicit client and paginator annotations are usually the safer pattern.

### Lower-memory IDE fallback

```bash
python -m pip install "boto3==1.42.3" "boto3-stubs-lite[pipes]==1.42.3"
```

The maintainer docs note that the lite variant does not provide `session.client()` overloads. Add explicit annotations when you use it.

## Runtime Setup And Auth

`mypy-boto3-pipes` has no package-specific initialization. All runtime behavior still comes from `boto3` and botocore.

Typical local setup:

```bash
export AWS_PROFILE=dev
export AWS_DEFAULT_REGION=us-east-1
```

Or use direct credentials in environments where profiles are not available:

```bash
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_SESSION_TOKEN=...
export AWS_DEFAULT_REGION=us-east-1
```

Typed client setup with explicit retry configuration:

```python
import boto3
from botocore.config import Config
from mypy_boto3_pipes import EventBridgePipesClient

session = boto3.Session(profile_name="dev")
config = Config(
    region_name="us-east-1",
    retries={"mode": "standard", "total_max_attempts": 10},
)

pipes: EventBridgePipesClient = session.client("pipes", config=config)
```

Keep credentials, region, retries, endpoints, and timeouts on the `boto3` session or client. The stub package only improves static typing.

## Core Usage

### Typed client and paginator

```python
import boto3
from mypy_boto3_pipes import EventBridgePipesClient
from mypy_boto3_pipes.paginator import ListPipesPaginator

session = boto3.Session(region_name="us-east-1")
pipes: EventBridgePipesClient = session.client("pipes")

paginator: ListPipesPaginator = pipes.get_paginator("list_pipes")

for page in paginator.paginate(NamePrefix="orders-"):
    for item in page.get("Pipes", []):
        print(item["Name"], item.get("CurrentState"))
```

### Inspect a pipe

```python
pipe = pipes.describe_pipe(Name="orders-to-lambda")

print(pipe["Arn"])
print(pipe["Source"])
print(pipe["Target"])
print(pipe["CurrentState"])
```

### Create a pipe in `STOPPED` state first

AWS lets you create a pipe without starting event delivery immediately. This is safer when you want to confirm the source, target, and IAM role before traffic starts flowing.

```python
import os

response = pipes.create_pipe(
    Name="orders-to-lambda",
    DesiredState="STOPPED",
    RoleArn=os.environ["PIPES_ROLE_ARN"],
    Source=os.environ["SOURCE_QUEUE_ARN"],
    SourceParameters={
        "SqsQueueParameters": {
            "BatchSize": 10,
        }
    },
    Target=os.environ["TARGET_LAMBDA_ARN"],
    TargetParameters={
        "LambdaFunctionParameters": {
            "InvocationType": "REQUEST_RESPONSE",
        }
    },
)

print(response["Arn"])
```

### Start, stop, and delete a pipe

```python
pipes.start_pipe(Name="orders-to-lambda")

status = pipes.describe_pipe(Name="orders-to-lambda")
print(status["CurrentState"])

pipes.stop_pipe(Name="orders-to-lambda")
pipes.delete_pipe(Name="orders-to-lambda")
```

### Literals and TypedDicts

The package also exposes service-specific literal unions and typed dictionaries.

```python
from mypy_boto3_pipes.literals import AssignPublicIpType
from mypy_boto3_pipes.type_defs import AwsVpcConfigurationOutputTypeDef

assign_public_ip: AssignPublicIpType = "ENABLED"

def subnet_ids(config: AwsVpcConfigurationOutputTypeDef) -> list[str]:
    return config["Subnets"]
```

Use `literals` for enum-like string values and `type_defs` when you want typed request or response fragments in helper functions.

## `TYPE_CHECKING` Pattern

If production environments do not install the stub wheel, keep the import behind `TYPE_CHECKING`:

```python
from typing import TYPE_CHECKING

import boto3

if TYPE_CHECKING:
    from mypy_boto3_pipes import EventBridgePipesClient
else:
    EventBridgePipesClient = object

pipes: "EventBridgePipesClient" = boto3.client("pipes", region_name="us-east-1")
```

The `object` fallback avoids the undefined-name problem that the maintainer docs call out for pylint.

## Common Pitfalls

- Installing `mypy-boto3-pipes` without `boto3`. The stubs package is typing-only.
- Expecting standalone `mypy-boto3-pipes` or `boto3-stubs-lite[pipes]` to infer `session.client("pipes")` automatically. Full `boto3-stubs[pipes]` is the better default for that workflow.
- Forgetting to set a region. EventBridge Pipes clients still use the normal boto3 credential and region resolution chain.
- Starting a new pipe immediately when you meant to inspect it first. Set `DesiredState="STOPPED"` during `create_pipe(...)` if you want a safer rollout.
- Assuming `stop_pipe` is instant. AWS documents that some pipe sources can take time to stop fully.
- Treating successful type checking as proof that IAM permissions, source ARNs, or target parameters are valid. The stubs only validate Python-side shapes.

## Version-Sensitive Notes

- PyPI lists `mypy-boto3-pipes 1.42.3` as the latest release and marks it as generated for `boto3 1.42.3`.
- PyPI also marks the package as `Typing :: Stubs Only` and `Requires: Python >=3.9`.
- The maintainer docs state that stub package versions follow the related `boto3` version, so pinning `boto3==1.42.3` with `mypy-boto3-pipes==1.42.3` is the safest default.
- The standalone `mypy-boto3-pipes` release history is sparse. Do not assume every boto3 patch release has a matching standalone Pipes wheel on PyPI.

## Official Sources

- Maintainer docs root: https://youtype.github.io/boto3_stubs_docs/mypy_boto3_pipes/
- PyPI package page: https://pypi.org/project/mypy-boto3-pipes/
- PyPI release page: https://pypi.org/project/mypy-boto3-pipes/1.42.3/
- AWS EventBridge Pipes user guide: https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-pipes-start-stop.html
- AWS EventBridge Pipes `CreatePipe` reference: https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/pipes/client/create_pipe.html
- AWS EventBridge Pipes `DescribePipe` reference: https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/pipes/client/describe_pipe.html
- AWS boto3 credentials guide: https://docs.aws.amazon.com/boto3/latest/guide/credentials.html
- AWS boto3 retries guide: https://boto3.amazonaws.com/v1/documentation/api/latest/guide/retries.html
