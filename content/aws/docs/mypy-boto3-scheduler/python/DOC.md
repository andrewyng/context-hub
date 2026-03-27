---
name: mypy-boto3-scheduler
description: "Typed stubs for the boto3 EventBridge Scheduler client, paginators, literals, and request/response shapes in Python"
metadata:
  languages: "python"
  versions: "1.42.3"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,scheduler,eventbridge,boto3,typing,stubs,mypy,python"
---

# mypy-boto3-scheduler Python Package Guide

## Golden Rule

`mypy-boto3-scheduler` is a typing package for the boto3 EventBridge Scheduler client. It does not replace `boto3`, it does not make AWS calls on its own, and it does not configure AWS credentials or regions for you.

Use it when you want:

- typed `boto3.client("scheduler")` calls
- typed paginator objects for listing schedules and schedule groups
- generated `TypedDict` request and response shapes
- literal types for constrained Scheduler string values

Keep runtime and typing separate:

- install `boto3` for runtime AWS calls
- install `mypy-boto3-scheduler` or `boto3-stubs[scheduler]` for type checking and editor support
- configure credentials, region, retries, and endpoints through boto3 and botocore

## Install

Install the standalone service stubs when you only need EventBridge Scheduler typing:

```bash
python -m pip install "boto3==1.42.3" "mypy-boto3-scheduler==1.42.3"
```

Upstream also publishes the aggregated extras:

```bash
python -m pip install "boto3-stubs[scheduler]"
python -m pip install "boto3-stubs-lite[scheduler]"
```

Use `boto3-stubs[scheduler]` when you want the maintainer's standard install flow and better overload-based inference. Use `boto3-stubs-lite[scheduler]` when you want a lighter install and are comfortable adding more explicit annotations.

PyPI lists `Requires: Python >=3.9` for this package.

## Runtime Setup And Auth

`mypy-boto3-scheduler` has no package-specific initialization. All runtime behavior still comes from `boto3`.

Set AWS credentials and a region through the normal boto3 sources, for example:

```bash
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_DEFAULT_REGION=us-east-1
```

Or use a named profile:

```bash
export AWS_PROFILE=dev
export AWS_DEFAULT_REGION=us-east-1
```

Typed client setup:

```python
import boto3
from mypy_boto3_scheduler import EventBridgeSchedulerClient

session = boto3.Session(profile_name="dev", region_name="us-east-1")
scheduler: EventBridgeSchedulerClient = session.client("scheduler")
```

If the stub package is dev-only, keep the import behind `TYPE_CHECKING` and cast the client:

```python
from typing import TYPE_CHECKING, cast

import boto3

if TYPE_CHECKING:
    from mypy_boto3_scheduler import EventBridgeSchedulerClient

scheduler = cast(
    "EventBridgeSchedulerClient",
    boto3.client("scheduler", region_name="us-east-1"),
)
```

For retries and other client options, use normal botocore config:

```python
import boto3
from botocore.config import Config
from mypy_boto3_scheduler import EventBridgeSchedulerClient

config = Config(
    region_name="us-east-1",
    retries={"mode": "standard", "max_attempts": 10},
)

scheduler: EventBridgeSchedulerClient = boto3.client("scheduler", config=config)
```

## Core Usage

### Create a one-time schedule

AWS Scheduler `create_schedule` requires `Name`, `ScheduleExpression`, `FlexibleTimeWindow`, and `Target`.

For Lambda, Step Functions, and EventBridge targets, AWS says `Target.Input` must be a well-formed JSON string.

```python
import json

import boto3
from mypy_boto3_scheduler import EventBridgeSchedulerClient

session = boto3.Session(region_name="us-east-1")
scheduler: EventBridgeSchedulerClient = session.client("scheduler")

scheduler.create_schedule(
    Name="nightly-report-once",
    ScheduleExpression="at(2026-03-14T02:00:00)",
    ScheduleExpressionTimezone="UTC",
    FlexibleTimeWindow={"Mode": "OFF"},
    Target={
        "Arn": "arn:aws:lambda:us-east-1:123456789012:function:nightly-report",
        "RoleArn": "arn:aws:iam::123456789012:role/scheduler-invoke-lambda",
        "Input": json.dumps({"report_date": "2026-03-13"}),
    },
    ActionAfterCompletion="DELETE",
)
```

If you omit `ClientToken`, boto3 auto-generates it for idempotency.

### Create a recurring schedule group and schedule

Schedule groups help you organize schedules and scope list operations.

```python
import json

import boto3
from mypy_boto3_scheduler import EventBridgeSchedulerClient

scheduler: EventBridgeSchedulerClient = boto3.client("scheduler", region_name="us-east-1")

scheduler.create_schedule_group(
    Name="payments-jobs",
    Tags=[{"Key": "env", "Value": "prod"}],
)

scheduler.create_schedule(
    Name="payments-reconcile-hourly",
    GroupName="payments-jobs",
    ScheduleExpression="rate(1 hour)",
    FlexibleTimeWindow={"Mode": "FLEXIBLE", "MaximumWindowInMinutes": 10},
    Target={
        "Arn": "arn:aws:states:us-east-1:123456789012:stateMachine:reconcile-payments",
        "RoleArn": "arn:aws:iam::123456789012:role/scheduler-start-stepfunctions",
        "Input": json.dumps({"job": "reconcile"}),
    },
    State="ENABLED",
)
```

AWS Scheduler also supports cron expressions through the same `ScheduleExpression` field.

### Read a schedule before updating it

AWS documents that `update_schedule` uses the values in your request, including empty values, and overrides the existing schedule. The safe pattern is to fetch the current schedule first and then resend the fields you want to preserve.

```python
import boto3
from mypy_boto3_scheduler import EventBridgeSchedulerClient

scheduler: EventBridgeSchedulerClient = boto3.client("scheduler", region_name="us-east-1")

current = scheduler.get_schedule(
    Name="payments-reconcile-hourly",
    GroupName="payments-jobs",
)

scheduler.update_schedule(
    Name=current["Name"],
    GroupName=current["GroupName"],
    ScheduleExpression="rate(30 minutes)",
    FlexibleTimeWindow=current["FlexibleTimeWindow"],
    Target=current["Target"],
    State=current["State"],
    Description=current.get("Description"),
    KmsKeyArn=current.get("KmsKeyArn"),
    ScheduleExpressionTimezone=current.get("ScheduleExpressionTimezone"),
    StartDate=current.get("StartDate"),
    EndDate=current.get("EndDate"),
    ActionAfterCompletion=current.get("ActionAfterCompletion"),
)
```

### Use typed paginators

The maintainer docs publish paginator types for `list_schedule_groups` and `list_schedules`.

```python
import boto3
from mypy_boto3_scheduler import EventBridgeSchedulerClient
from mypy_boto3_scheduler.paginator import ListSchedulesPaginator

scheduler: EventBridgeSchedulerClient = boto3.client("scheduler", region_name="us-east-1")

paginator: ListSchedulesPaginator = scheduler.get_paginator("list_schedules")

for page in paginator.paginate(GroupName="payments-jobs", State="ENABLED"):
    for schedule in page.get("Schedules", []):
        print(schedule["Name"], schedule["Arn"])
```

### Use generated literals and type definitions

The package exposes literal unions and generated type definitions when you want stricter annotations than raw dicts.

```python
from mypy_boto3_scheduler.literals import ActionAfterCompletionType, FlexibleTimeWindowModeType

action: ActionAfterCompletionType = "DELETE"
window_mode: FlexibleTimeWindowModeType = "OFF"
```

Use the `type_defs` module when you need exact request or response shape annotations in helper functions or shared library code.

## Common Pitfalls

- `mypy-boto3-scheduler` is typing-only. Without `boto3`, your code can type-check but cannot call AWS.
- The names differ: install `mypy-boto3-scheduler`, import `mypy_boto3_scheduler`, and create the runtime client with service name `"scheduler"`.
- `Target.Input` is a JSON string for templated Lambda, Step Functions, and EventBridge targets. Do not pass a raw Python dict.
- `update_schedule` is easy to misuse because omitted optional fields are not preserved automatically. Read the existing schedule first if you are making a partial change.
- `boto3-stubs-lite[scheduler]` usually needs more explicit annotations because the lite package does not provide the same `session.client(...)` overloads.
- Type safety does not validate IAM permissions, target ARNs, schedule expressions, or region configuration. Runtime AWS errors still come from your boto3 setup.

## Version-Sensitive Notes

- The version used here is `1.42.3`, which matches the current PyPI project page for `mypy-boto3-scheduler`.
- PyPI shows `mypy-boto3-scheduler 1.42.3` was published on December 4, 2025.
- The hosted maintainer docs are generated and can move ahead of the standalone wheel version on PyPI. When exact typing alignment matters, pin `boto3`, `botocore`, and `mypy-boto3-scheduler` together in the same environment.
- The package page links to `types-boto3` as the current repository. This entry stays focused on the published `mypy-boto3-scheduler` package and its `mypy_boto3_scheduler` import surface.

## Official Sources

- Maintainer docs root: https://youtype.github.io/boto3_stubs_docs/mypy_boto3_scheduler/
- Maintainer package page: https://youtype.github.io/boto3_stubs_docs/mypy_boto3_scheduler/
- Maintainer paginator reference: https://youtype.github.io/boto3_stubs_docs/mypy_boto3_scheduler/paginators/
- PyPI package page: https://pypi.org/project/mypy-boto3-scheduler/
- Boto3 Scheduler service reference: https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/scheduler.html
- Boto3 Scheduler `create_schedule` reference: https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/scheduler/client/create_schedule.html
- Boto3 Scheduler `update_schedule` reference: https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/scheduler/client/update_schedule.html
- Boto3 credentials guide: https://docs.aws.amazon.com/boto3/latest/guide/credentials.html
- Boto3 configuration guide: https://docs.aws.amazon.com/boto3/latest/guide/configuration.html
