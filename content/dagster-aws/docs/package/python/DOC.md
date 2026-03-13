---
name: package
description: "dagster-aws package guide for using Dagster with AWS resources such as S3 and Secrets Manager"
metadata:
  languages: "python"
  versions: "0.28.18"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "dagster,aws,dagster-aws,python,s3,secrets-manager,data-orchestration"
---

# dagster-aws Python Package Guide

## Golden Rule

Use `dagster-aws` as Dagster's AWS integration layer, but keep authentication and permissions in normal AWS configuration and IAM. Install `dagster-aws` on the matching Dagster release line, register AWS resources in `dg.Definitions(...)`, and let those resources hand you the underlying AWS clients inside assets and ops.

## Install

Install `dagster-aws` alongside the matching Dagster packages:

```bash
python -m pip install \
  "dagster==1.12.18" \
  "dagster-webserver==1.12.18" \
  "dagster-aws==0.28.18"
```

Useful checks after install:

```bash
dagster --version
python -m pip show dagster-aws
```

## Prerequisites

Before wiring `dagster-aws` into a project, make sure you already have:

- a Dagster project with a loadable top-level `defs = dg.Definitions(...)`
- AWS credentials available through the standard AWS SDK credential chain
- a region selected for the AWS APIs you will call
- IAM permissions for the exact S3, Secrets Manager, or other AWS APIs used by your assets

## Configure AWS Credentials

`dagster-aws` uses normal AWS SDK configuration. For local development, the simplest setup is environment variables:

```bash
export AWS_ACCESS_KEY_ID="your-access-key-id"
export AWS_SECRET_ACCESS_KEY="your-secret-access-key"
export AWS_DEFAULT_REGION="us-east-1"
```

If you use temporary credentials, also set:

```bash
export AWS_SESSION_TOKEN="your-session-token"
```

If you prefer named profiles, set `AWS_PROFILE` and keep credentials in the usual AWS config files:

```bash
export AWS_PROFILE="my-dagster-profile"
export AWS_DEFAULT_REGION="us-east-1"
```

## Use `S3Resource` In Assets

The most direct pattern is to configure an `S3Resource`, inject it into an asset, and call the underlying S3 client for reads and writes.

```python
import dagster as dg
from dagster_aws.s3 import S3Resource

BUCKET = "my-data-bucket"
KEY = "examples/hello.txt"


@dg.asset
def write_example_file(s3: S3Resource) -> None:
    s3.get_client().put_object(
        Bucket=BUCKET,
        Key=KEY,
        Body=b"hello from dagster-aws\n",
        ContentType="text/plain",
    )


@dg.asset(deps=[write_example_file])
def read_example_file(s3: S3Resource) -> str:
    response = s3.get_client().get_object(Bucket=BUCKET, Key=KEY)
    return response["Body"].read().decode("utf-8")


defs = dg.Definitions(
    assets=[write_example_file, read_example_file],
    resources={
        "s3": S3Resource(region_name="us-east-1"),
    },
)
```

Important details:

- the resource key in `resources={"s3": ...}` must match the asset parameter name `s3`
- S3 object bodies are bytes or streams, so decode text explicitly or deserialize JSON yourself
- the AWS identity Dagster runs under still needs normal `s3:PutObject` and `s3:GetObject` permissions

## Read Secrets From AWS Secrets Manager

Use `SecretsManagerResource` when an asset or op needs a secret at runtime.

```python
import dagster as dg
from dagster_aws.secretsmanager import SecretsManagerResource


@dg.asset
def external_api_key(secretsmanager: SecretsManagerResource) -> str:
    response = secretsmanager.get_client().get_secret_value(
        SecretId="prod/my-app/external-api"
    )
    return response["SecretString"]


defs = dg.Definitions(
    assets=[external_api_key],
    resources={
        "secretsmanager": SecretsManagerResource(region_name="us-east-1"),
    },
)
```

If the secret stores JSON instead of a plain string, parse `response["SecretString"]` before using it.

## Local Development Workflow

Point Dagster at the module that exposes your top-level `Definitions` object:

```bash
dagster dev -m my_project.definitions
```

This workflow is usually enough for local iteration when your AWS credentials are already available through environment variables or a named profile.

## Common Pitfalls

- Mismatched versions. Keep `dagster-aws` on the matching Dagster release line in the same environment.
- Missing region configuration. Set `AWS_DEFAULT_REGION` or pass `region_name=...` when constructing resources.
- Resource name mismatch. In Dagster, the resource dictionary key must match the function parameter name used for injection.
- Missing IAM permissions. `dagster-aws` does not bypass AWS authorization; the underlying role or credentials still need permission for every API call.
- Logging secrets by accident. Do not log `SecretString` values or copy them into constant Dagster config.

## Version Notes For `0.28.18`

- `dagster-aws==0.28.18` belongs to the Dagster `1.12.18` release line; keep related Dagster packages aligned to that same line.
- AWS authentication behavior comes from the normal AWS SDK credential chain, so deployment behavior can differ between local shells, CI, containers, and cloud runtimes depending on which credentials source is available.

## Official Sources

- https://github.com/dagster-io/dagster/tree/master/python_modules/libraries/dagster-aws
- https://github.com/dagster-io/dagster/tree/master/python_modules/libraries/dagster-aws/dagster_aws/s3
- https://github.com/dagster-io/dagster/tree/master/python_modules/libraries/dagster-aws/dagster_aws/secretsmanager
- https://docs.dagster.io/api/python-api/libraries/dagster-aws
- https://pypi.org/project/dagster-aws/
