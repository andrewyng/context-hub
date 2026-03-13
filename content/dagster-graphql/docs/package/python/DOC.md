---
name: package
description: "Dagster GraphQL Python client for launching jobs, checking run state, reloading code locations, and sending GraphQL requests to Dagster"
metadata:
  languages: "python"
  versions: "1.12.18"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "dagster,graphql,python,orchestration,jobs,runs"
---

# Dagster GraphQL Python Package Guide

## Golden Rule

Install `dagster-graphql` and `dagster` at the same version, point the client at a Dagster webserver host, and let the client add `/graphql` for you. The packaged Python client is synchronous and wraps a small set of common operations: submit a job run, check run status, reload a code location, and terminate runs.

## Install

Use a virtual environment and pin `dagster` plus `dagster-graphql` together:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "dagster==1.12.18" "dagster-graphql==1.12.18"
```

If your project already pins Dagster, keep `dagster-graphql` on the exact same release.

## Initialize The Client

### Local Dagster webserver

Set environment variables for the host and port exposed by `dagster-webserver`:

```bash
export DAGSTER_HOST=localhost
export DAGSTER_PORT=3000
```

```python
import os

from dagster_graphql import DagsterGraphQLClient

client = DagsterGraphQLClient(
    hostname=os.getenv("DAGSTER_HOST", "localhost"),
    port_number=int(os.getenv("DAGSTER_PORT", "3000")),
    use_https=False,
    timeout=300,
)
```

Pass only the host and optional port. Do not pass a full GraphQL URL such as `http://localhost:3000/graphql`; the client always appends `/graphql` internally.

### Dagster Cloud

The client accepts arbitrary headers. For Dagster Cloud, use the `Dagster-Cloud-Api-Token` header:

```bash
export DAGSTER_CLOUD_HOST="your-org.dagster.cloud"
export DAGSTER_CLOUD_API_TOKEN="your-user-token"
```

```python
import os

from dagster_graphql import DagsterGraphQLClient

client = DagsterGraphQLClient(
    hostname=os.environ["DAGSTER_CLOUD_HOST"],
    use_https=True,
    timeout=300,
    headers={"Dagster-Cloud-Api-Token": os.environ["DAGSTER_CLOUD_API_TOKEN"]},
)
```

### Custom HTTP auth

If your Dagster deployment sits behind HTTP auth, pass a `requests` auth object:

```python
from requests.auth import HTTPBasicAuth

from dagster_graphql import DagsterGraphQLClient

client = DagsterGraphQLClient(
    hostname="dagster.internal.example",
    use_https=True,
    auth=HTTPBasicAuth("api-user", "api-password"),
)
```

## Launch A Job Run

Use `submit_job_execution()` for the normal automation flow:

```python
from dagster_graphql import DagsterGraphQLClient

client = DagsterGraphQLClient("localhost", port_number=3000)

run_id = client.submit_job_execution(
    job_name="daily_assets",
    repository_location_name="analytics",
    repository_name="prod_repo",
    run_config={},
    tags={"trigger": "api", "env": "dev"},
)

print(run_id)
```

If the job name is unique across the deployment, `repository_location_name` and `repository_name` can be omitted. If the same job name exists in multiple repositories or code locations, the client raises an error until you supply both values explicitly.

### Run a subset of ops or assets

The client also accepts `op_selection` and `asset_selection`:

```python
run_id = client.submit_job_execution(
    job_name="daily_assets",
    repository_location_name="analytics",
    repository_name="prod_repo",
    run_config={},
    op_selection=["extract_customers", "build_metrics"],
    asset_selection=[["customers"], ["metrics", "daily"]],
)
```

`run_config` is passed through to Dagster as GraphQL execution params. It must match the target job's run config schema.

## Poll Run Status

`get_run_status()` returns a `DagsterRunStatus` enum from `dagster`:

```python
import time

from dagster import DagsterRunStatus
from dagster_graphql import DagsterGraphQLClient

client = DagsterGraphQLClient("localhost", port_number=3000)
run_id = "YOUR_RUN_ID"

terminal_states = {
    DagsterRunStatus.SUCCESS,
    DagsterRunStatus.FAILURE,
    DagsterRunStatus.CANCELED,
}

while True:
    status = client.get_run_status(run_id)
    print(status.value)
    if status in terminal_states:
        break
    time.sleep(5)
```

## Reload A Code Location

Use `reload_repository_location()` when you want Dagster to reload repository metadata without restarting the whole webserver:

```python
from dagster_graphql import (
    DagsterGraphQLClient,
    ReloadRepositoryLocationStatus,
)

client = DagsterGraphQLClient("localhost", port_number=3000)

info = client.reload_repository_location("analytics")

if info.status is ReloadRepositoryLocationStatus.SUCCESS:
    print("Reloaded")
else:
    print(info.failure_type, info.message)
```

## Terminate One Or Many Runs

```python
from dagster_graphql import DagsterGraphQLClient

client = DagsterGraphQLClient("localhost", port_number=3000)

client.terminate_run("RUN_ID")
client.terminate_runs(["RUN_ID_1", "RUN_ID_2"])
```

`terminate_runs()` raises a `DagsterGraphQLClientError` if some or all requested terminations fail.

## Error Handling

The client raises `DagsterGraphQLClientError` for GraphQL and transport problems. The exception arguments usually carry the GraphQL type name plus a message, and `exc.body` may contain structured details.

```python
from dagster_graphql import DagsterGraphQLClient, DagsterGraphQLClientError

client = DagsterGraphQLClient("localhost", port_number=3000)

try:
    run_id = client.submit_job_execution(
        job_name="daily_assets",
        repository_location_name="analytics",
        repository_name="prod_repo",
        run_config={},
    )
except DagsterGraphQLClientError as exc:
    error_type = exc.args[0] if exc.args else type(exc).__name__
    detail = exc.body if exc.body is not None else (exc.args[1] if len(exc.args) > 1 else "")
    raise RuntimeError(f"{error_type}: {detail}") from exc
```

Common failures to expect from the packaged client:

- invalid job or repository identifiers
- run config validation errors returned by GraphQL
- duplicate job names across repositories when repository details are omitted
- `RunNotFoundError` when polling or terminating an unknown run ID
- connection and server errors when the target webserver is unavailable

## Send Raw GraphQL For Unwrapped Operations

The Python client only wraps a small subset of the Dagster GraphQL API. For anything else, send a normal JSON GraphQL POST to `/graphql`.

This example uses the same run-status query shape shipped inside the package:

```bash
export DAGSTER_BASE_URL="http://localhost:3000"
```

```python
import os

import requests

query = """
query GraphQLClientGetRunStatus($runId: ID!) {
  pipelineRunOrError(runId: $runId) {
    __typename
    ... on PipelineRun {
      status
    }
    ... on PipelineRunNotFoundError {
      message
    }
    ... on PythonError {
      message
    }
  }
}
"""

response = requests.post(
    f"{os.environ['DAGSTER_BASE_URL'].rstrip('/')}/graphql",
    json={"query": query, "variables": {"runId": "YOUR_RUN_ID"}},
    timeout=300,
)
response.raise_for_status()

payload = response.json()
print(payload)
```

If the deployment requires auth, add the same headers or auth settings you would use when constructing `DagsterGraphQLClient`.

## CLI Usage

Installing `dagster-graphql` also installs a `dagster-graphql` CLI for executing GraphQL text, files, or a small predefined query set.

Run a query against a remote Dagster webserver:

```bash
dagster-graphql \
  --remote http://localhost:3000 \
  --text 'query GraphQLClientGetRunStatus($runId: ID!) { pipelineRunOrError(runId: $runId) { __typename ... on PipelineRun { status } ... on PipelineRunNotFoundError { message } ... on PythonError { message } } }' \
  --variables '{"runId": "YOUR_RUN_ID"}'
```

## Common Pitfalls

- Keep `dagster` and `dagster-graphql` on the same version; the package metadata pins them together.
- Pass a host, not a full `/graphql` URL, to `DagsterGraphQLClient`.
- The packaged client is synchronous. If you need concurrent polling or fan-out, add your own threading or async boundary around it.
- Omitted repository details only work when the job name is unique across the deployment.
- `run_config` is not validated locally before the request; schema errors come back from Dagster as GraphQL client errors.
- `shutdown_repository_location()` still exists in the client, but it is marked deprecated for Dagster 2.0. Prefer reload unless you specifically want the code-location server to exit and restart.
- The GraphQL schema and some error names still use older `pipeline` terminology. In current automation code, prefer `submit_job_execution()` and job-oriented naming.

## Version-Sensitive Notes For 1.12.x

- The 1.12.x package line is version-locked to the matching `dagster` release.
- `shutdown_repository_location()` is already marked deprecated with a breaking version of `2.0`.
- The installed client targets the `/graphql` HTTP endpoint and does not expose the full schema as first-class Python methods; reaching new GraphQL surfaces usually means posting raw queries.

## Official Sources

- Dagster GraphQL API docs: https://docs.dagster.io/api/graphql
- `dagster-graphql` PyPI page: https://pypi.org/project/dagster-graphql/
- Maintainer package source: https://github.com/dagster-io/dagster/tree/master/python_modules/dagster-graphql
