---
name: package
description: "Prefect AWS integration for storing AWS credentials in Prefect blocks and creating boto3 sessions inside flows"
metadata:
  languages: "python"
  versions: "0.7.5"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "prefect,aws,python,workflow,orchestration,boto3,s3,blocks"
---

# Prefect AWS Python Package Guide

## Golden Rule

Use `prefect-aws` as a Prefect integration package for AWS credentials and AWS-backed workflows. Keep writing flows and tasks with core `prefect`; use this package to store AWS connection details in a Prefect block and create `boto3` sessions or service clients inside your flow code.

If you only need plain AWS SDK access outside Prefect orchestration, start with `boto3` directly.

## Install

Install the package version this guide covers:

```bash
python -m pip install "prefect-aws==0.7.5"
```

Common alternatives:

```bash
uv add prefect-aws
poetry add prefect-aws
```

If your project does not already include Prefect, install it too:

```bash
python -m pip install prefect prefect-aws
```

Sanity-check the install:

```bash
python -m pip show prefect-aws
python -c "import prefect_aws; print(prefect_aws.__file__)"
```

## Prerequisites And Environment

Before you use `prefect-aws` in a flow, make sure:

- the runtime already has valid AWS credentials for the account you want to access
- the IAM principal has permission for the AWS APIs you call
- `AWS_DEFAULT_REGION` is set when your flow logic depends on a default region
- `PREFECT_API_URL` is set if you want to save or load named Prefect blocks
- `PREFECT_API_KEY` is also set when you use Prefect Cloud

Typical environment variables:

```bash
export AWS_ACCESS_KEY_ID="AKIA..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..."         # only for temporary credentials
export AWS_DEFAULT_REGION="us-east-1"

export PREFECT_API_URL="https://api.prefect.cloud/api/accounts/<account-id>/workspaces/<workspace-id>"
export PREFECT_API_KEY="pnu_..."
```

For a local self-hosted Prefect server instead of Cloud:

```bash
prefect server start
prefect config set PREFECT_API_URL="http://127.0.0.1:4200/api"
```

There is no separate long-lived `prefect-aws` client to initialize first. The common starting point is an `AwsCredentials` block.

## Initialize An AWS Credentials Block

Create an `AwsCredentials` block from environment variables when your flow needs to authenticate to AWS.

```python
import os

from prefect_aws import AwsCredentials


aws_credentials = AwsCredentials(
    aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
    aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    aws_session_token=os.getenv("AWS_SESSION_TOKEN"),
    region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"),
)
```

Use this direct-instantiation pattern when credentials already come from environment variables or another secret manager and you do not need to persist a named Prefect block yet.

## Save And Reuse A Named Block

When several flows or deployments should share the same AWS connection definition, save the block in Prefect and load it by name later.

```python
import os

from prefect_aws import AwsCredentials


aws_credentials = AwsCredentials(
    aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
    aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    aws_session_token=os.getenv("AWS_SESSION_TOKEN"),
    region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"),
)

aws_credentials.save("aws-dev", overwrite=True)
```

Load that block later:

```python
from prefect_aws import AwsCredentials


aws_credentials = AwsCredentials.load("aws-dev")
```

What matters here:

- `save(...)` and `load(...)` depend on Prefect block storage, so they require a working Prefect API configuration
- direct instantiation of `AwsCredentials(...)` does not require Prefect Cloud or a self-hosted server

## Create A Boto3 Session And Call AWS APIs

The most direct workflow is to turn the saved or in-memory block into a `boto3` session, then use normal AWS service clients.

```python
import os

from prefect_aws import AwsCredentials


aws_credentials = AwsCredentials.load("aws-dev")
session = aws_credentials.get_boto3_session()

s3 = session.client("s3")

s3.put_object(
    Bucket=os.environ["AWS_S3_BUCKET"],
    Key="healthcheck.txt",
    Body=b"ok\n",
)

response = s3.get_object(
    Bucket=os.environ["AWS_S3_BUCKET"],
    Key="healthcheck.txt",
)

print(response["Body"].read().decode("utf-8"))
```

This pattern is a good default when you already know the AWS service you need and want the rest of the code to look like standard `boto3`.

## Use Saved AWS Credentials Inside A Flow

Load the block inside tasks or flows where the AWS client is actually needed.

```python
import os

from prefect import flow, task
from prefect_aws import AwsCredentials


@task
def write_marker() -> None:
    aws_credentials = AwsCredentials.load("aws-dev")
    session = aws_credentials.get_boto3_session()
    s3 = session.client("s3")
    s3.put_object(
        Bucket=os.environ["AWS_S3_BUCKET"],
        Key="prefect/demo.txt",
        Body=b"written from Prefect\n",
    )


@task
def read_marker() -> str:
    aws_credentials = AwsCredentials.load("aws-dev")
    session = aws_credentials.get_boto3_session()
    s3 = session.client("s3")
    response = s3.get_object(
        Bucket=os.environ["AWS_S3_BUCKET"],
        Key="prefect/demo.txt",
    )
    return response["Body"].read().decode("utf-8")


@flow(log_prints=True)
def aws_demo() -> None:
    write_marker()
    print(read_marker())


if __name__ == "__main__":
    aws_demo()
```

This is usually enough for S3 checks, metadata reads, queue publishing, secrets lookups, or other service calls where Prefect orchestrates the workflow and `boto3` does the AWS API work.

## Save A Reusable S3 Block Definition

If several flows should refer to the same bucket definition, save an `S3Bucket` block alongside your credentials.

```python
import os

from prefect_aws import AwsCredentials
from prefect_aws.s3 import S3Bucket


aws_credentials = AwsCredentials.load("aws-dev")

s3_bucket = S3Bucket(
    bucket_name=os.environ["AWS_S3_BUCKET"],
    credentials=aws_credentials,
)

s3_bucket.save("app-bucket", overwrite=True)
```

Use this pattern when the bucket itself is part of your reusable deployment configuration, not just an input string passed to one function.

## Common Pitfalls

- Installing `prefect-aws` does not replace core `prefect`; you still use `prefect` for `@flow`, `@task`, deployments, workers, and configuration.
- Saving or loading blocks by name requires a reachable Prefect API. Direct instantiation does not.
- `prefect-aws` does not bypass AWS IAM. A valid key is not enough if the principal lacks permission for the service call you make.
- If you use temporary AWS credentials, include `AWS_SESSION_TOKEN` or equivalent session-token configuration.
- The environment that runs the deployment or worker needs both the Python package and AWS credentials, not just the machine where you registered the flow.
- Keep credentials out of flow source. Prefer environment variables, your platform secret manager, or Prefect blocks.

## Version Notes For `prefect-aws` 0.7.5

- This guide covers the PyPI package version `0.7.5`.
- Treat `prefect-aws` as an integration layered on top of core Prefect instead of a standalone workflow framework.
- Older Prefect examples may use pre-worker orchestration patterns; for current orchestration, prefer current Prefect flows, deployments, work pools, workers, and blocks.

## Official Sources

- Prefect docs root: `https://docs.prefect.io/v3/`
- Prefect integrations root: `https://docs.prefect.io/integrations/`
- Prefect blocks concept docs: `https://docs.prefect.io/v3/concepts/blocks`
- Prefect settings and profiles: `https://docs.prefect.io/v3/concepts/settings-and-profiles`
- Prefect AWS integration docs: `https://docs.prefect.io/integrations/prefect-aws/`
- PyPI package page: `https://pypi.org/project/prefect-aws/`
