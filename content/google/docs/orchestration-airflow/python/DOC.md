---
name: orchestration-airflow
description: "Google Cloud Composer Python client for managing environments, image versions, Airflow CLI commands, and snapshots"
metadata:
  languages: "python"
  versions: "1.19.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,google-cloud,composer,airflow,gcp,orchestration"
---

# Google Cloud Composer Python Client

Use `google-cloud-orchestration-airflow` when you need the Cloud Composer control-plane API from Python: discover environments, inspect image versions, create or patch environments, run Airflow CLI commands, and save or load snapshots.

```python
from google.cloud.orchestration.airflow import service_v1
```

This package is for managing Composer environments. It is not the package you import inside DAG code.

## Install

Pin the version your project expects:

```bash
python -m pip install "google-cloud-orchestration-airflow==1.19.0"
```

Common alternatives:

```bash
uv add "google-cloud-orchestration-airflow==1.19.0"
poetry add "google-cloud-orchestration-airflow==1.19.0"
```

PyPI publishes this client for Python 3.7+.

## Setup And Authentication

Typical prerequisites:

- a Google Cloud project
- the Cloud Composer API enabled
- a Composer environment region such as `us-central1`
- Application Default Credentials (ADC) or another Google-authenticated runtime

Enable auth locally:

```bash
gcloud auth application-default login
gcloud services enable composer.googleapis.com

export GOOGLE_CLOUD_PROJECT="my-project"
export GOOGLE_CLOUD_LOCATION="us-central1"
export COMPOSER_ENVIRONMENT="my-composer-env"
export COMPOSER_SERVICE_ACCOUNT="composer-runtime@my-project.iam.gserviceaccount.com"
```

If you must use a credential file explicitly:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

Explicit credentials also work:

```python
from google.cloud.orchestration.airflow import service_v1
from google.oauth2 import service_account

credentials = service_account.Credentials.from_service_account_file(
    "/absolute/path/service-account.json"
)

client = service_v1.EnvironmentsClient(credentials=credentials)
```

## Client Initialization

```python
import os

from google.cloud.orchestration.airflow import service_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")
environment_id = os.environ["COMPOSER_ENVIRONMENT"]

client = service_v1.EnvironmentsClient()
parent = client.common_location_path(project_id, location)
environment_name = client.environment_path(project_id, location, environment_id)
```

Useful generated clients:

- `service_v1.EnvironmentsClient`: main environment lifecycle and Airflow command operations
- `service_v1.ImageVersionsClient`: list usable Composer image versions for a region
- `service_v1.EnvironmentsAsyncClient` and `service_v1.ImageVersionsAsyncClient`: async variants

Most mutating operations return a long-running operation. Wait on `operation.result(...)` before assuming the environment is ready.

## Core Workflow

### List environments in a region

```python
import os

from google.cloud.orchestration.airflow import service_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")

client = service_v1.EnvironmentsClient()
parent = client.common_location_path(project_id, location)

for env in client.list_environments(parent=parent):
    airflow_uri = env.config.airflow_uri if env.config else None
    print(env.name, env.state, airflow_uri)
```

### Get one environment

```python
import os

from google.cloud.orchestration.airflow import service_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")
environment_id = os.environ["COMPOSER_ENVIRONMENT"]

client = service_v1.EnvironmentsClient()
environment_name = client.environment_path(project_id, location, environment_id)

env = client.get_environment(name=environment_name)

print(env.name)
print(env.state)
print(env.config.dag_gcs_prefix)
print(env.config.airflow_uri)
print(env.config.software_config.image_version)
```

### Discover valid image versions before creating an environment

Do not hard-code a Composer image string that you found in an old blog post. List image versions in the target region first, then pick one from the API response.

```python
import os

from google.cloud.orchestration.airflow import service_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")

client = service_v1.ImageVersionsClient()
parent = f"projects/{project_id}/locations/{location}"

for version in client.list_image_versions(parent=parent):
    print(version.image_version_id)
    print("  supports Python:", ", ".join(version.supported_python_versions))
    print("  release date:", version.release_date)
```

Cloud Composer ties the environment Python version to the selected image version. After an environment is created, you cannot switch it to a different minor Python version.

### Create an environment

Use an explicit service account and an explicit image version. Cloud Composer product docs note that new environments created on or after April 13, 2025 no longer default to the Compute Engine default service account.

```python
import os

from google.cloud.orchestration.airflow import service_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")
environment_id = os.environ["COMPOSER_ENVIRONMENT"]
service_account = os.environ["COMPOSER_SERVICE_ACCOUNT"]

client = service_v1.EnvironmentsClient()
parent = client.common_location_path(project_id, location)
environment_name = client.environment_path(project_id, location, environment_id)

environment = service_v1.Environment(
    name=environment_name,
    config=service_v1.EnvironmentConfig(
        environment_size=service_v1.EnvironmentConfig.EnvironmentSize.ENVIRONMENT_SIZE_SMALL,
        software_config=service_v1.SoftwareConfig(
            image_version="composer-3-airflow-2.10.5-build.9",
            env_variables={"APP_ENV": "prod"},
            pypi_packages={"pendulum": "==3.0.0"},
        ),
        node_config=service_v1.NodeConfig(
            service_account=service_account,
        ),
    ),
    labels={"team": "data-platform"},
)

operation = client.create_environment(
    parent=parent,
    environment=environment,
)

created = operation.result(timeout=60 * 60)
print(created.name)
print(created.config.airflow_uri)
```

Use an image version returned by `list_image_versions` for your region. The example image above is only a shape example from the official docs, not a promise that it is still the newest image in every region.

### Patch environment configuration with `update_mask`

`update_environment` is a partial update API. Use a field mask and patch only the fields you intend to change.

Example: add or update one PyPI package in the environment:

```python
import os

from google.cloud.orchestration.airflow import service_v1
from google.protobuf.field_mask_pb2 import FieldMask

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")
environment_id = os.environ["COMPOSER_ENVIRONMENT"]

client = service_v1.EnvironmentsClient()
environment_name = client.environment_path(project_id, location, environment_id)

patch = service_v1.Environment(
    name=environment_name,
    config=service_v1.EnvironmentConfig(
        software_config=service_v1.SoftwareConfig(
            pypi_packages={"dbt-bigquery": "==1.9.1"},
        )
    ),
)

operation = client.update_environment(
    request=service_v1.UpdateEnvironmentRequest(
        name=environment_name,
        environment=patch,
        update_mask=FieldMask(
            paths=["config.softwareConfig.pypiPackages.dbt-bigquery"]
        ),
    )
)

updated = operation.result(timeout=60 * 60)
print(updated.config.software_config.pypi_packages["dbt-bigquery"])
```

The product docs call out that only one update type is supported per request. Keep patches narrow.

### Run an Airflow CLI command and poll output

This is useful for targeted operational automation such as triggering a DAG or checking dags, pools, or variables without opening the UI.

```python
import os
import time

from google.cloud.orchestration.airflow import service_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")
environment_id = os.environ["COMPOSER_ENVIRONMENT"]

client = service_v1.EnvironmentsClient()
environment_name = client.environment_path(project_id, location, environment_id)

started = client.execute_airflow_command(
    request=service_v1.ExecuteAirflowCommandRequest(
        environment=environment_name,
        command="dags",
        subcommand="trigger",
        parameters=["example_bash_operator"],
    )
)

if started.error:
    raise RuntimeError(started.error)

next_line_number = 0

while True:
    polled = client.poll_airflow_command(
        request=service_v1.PollAirflowCommandRequest(
            environment=environment_name,
            execution_id=started.execution_id,
            pod=started.pod,
            pod_namespace=started.pod_namespace,
            next_line_number=next_line_number,
        )
    )

    for line in polled.output:
        print(line.content, end="")
        next_line_number = max(next_line_number, line.line_number + 1)

    if polled.output_end:
        if polled.exit_info.error:
            raise RuntimeError(polled.exit_info.error)
        if polled.exit_info.exit_code != 0:
            raise RuntimeError(
                f"Airflow command failed with exit code {polled.exit_info.exit_code}"
            )
        break

    time.sleep(2)
```

Cloud Composer product docs warn that CLI execution can run Python code available to Airflow components on behalf of the environment service account. For high-volume DAG triggering and automation, prefer the stable Airflow REST API or `gcloud composer environments run` when that is a better fit for your operational model.

### Save and load a snapshot

Snapshots are the API-supported way to back up and restore environment state.

```python
import os

from google.cloud.orchestration.airflow import service_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")
environment_id = os.environ["COMPOSER_ENVIRONMENT"]

client = service_v1.EnvironmentsClient()
environment_name = client.environment_path(project_id, location, environment_id)

save_operation = client.save_snapshot(
    request=service_v1.SaveSnapshotRequest(
        environment=environment_name,
        snapshot_location="gs://my-snapshot-bucket/composer-backups",
    )
)

saved = save_operation.result(timeout=60 * 60)
print(saved.snapshot_path)

load_operation = client.load_snapshot(
    request=service_v1.LoadSnapshotRequest(
        environment=environment_name,
        snapshot_path=saved.snapshot_path,
    )
)

load_operation.result(timeout=60 * 60)
```

## Pitfalls And Practical Notes

- This package manages Composer environments. It does not replace the Airflow runtime libraries used inside DAGs.
- Use `list_image_versions` before `create_environment`; image availability and supported Python versions are regional and change over time.
- Treat image version choice as part of environment design. Composer docs say you cannot change an existing environment to a different minor Python version later.
- Always wait for long-running operations from create, update, delete, save, and load flows.
- Use `update_mask` paths exactly. Generated Python field names are snake_case, but the field mask paths for Composer config updates use the API field names shown in the product docs, such as `config.softwareConfig.pypiPackages.<package-name>`.
- Keep `execute_airflow_command` for targeted admin automation. The product docs explicitly caution that this route can execute Python code on behalf of the environment service account.

## Official Sources

- Python client reference root: https://cloud.google.com/python/docs/reference/composer/latest
- PyPI package: https://pypi.org/project/google-cloud-orchestration-airflow/
- `EnvironmentsClient` reference: https://cloud.google.com/python/docs/reference/composer/latest/google.cloud.orchestration.airflow.service_v1.services.environments.EnvironmentsClient
- `ImageVersionsClient` reference: https://cloud.google.com/python/docs/reference/composer/latest/google.cloud.orchestration.airflow.service_v1.services.image_versions.ImageVersionsClient
- Environment creation guide: https://cloud.google.com/composer/docs/composer-3/create-environments
- Airflow CLI command guide: https://cloud.google.com/composer/docs/composer-3/access-airflow-cli
- Snapshot guide: https://cloud.google.com/composer/docs/composer-3/save-load-snapshots
- Environment image versions guide: https://cloud.google.com/composer/docs/composer-3/concepts/versioning/composer-versions
- ADC guide: https://cloud.google.com/docs/authentication/provide-credentials-adc
