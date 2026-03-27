---
name: docker
description: "Dagster Docker integration for launching external containerized code with Pipes and running Dagster OSS runs in Docker containers"
metadata:
  languages: "python"
  versions: "0.28.18"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "dagster,docker,python,containers,pipes,orchestration"
---

# `dagster-docker` for Python

Use `dagster-docker` for two different workflows:

- `PipesDockerClient` launches an external Docker container from a Dagster asset or op and streams logs, checks, and materializations back to Dagster.
- `DockerRunLauncher` makes a Dagster OSS deployment launch each run in its own Docker container.

This guide targets `dagster-docker 0.28.18`. PyPI lists this release as requiring Python `>=3.10,<3.15`.

## Install

If you want the exact release line covered here, pin Dagster core and the Docker integration together:

```bash
python -m pip install "dagster==1.12.18" "dagster-docker==0.28.18"
```

For a local OSS deployment with the Dagster UI:

```bash
python -m pip install \
  "dagster==1.12.18" \
  "dagster-webserver==1.12.18" \
  "dagster-docker==0.28.18"
```

If you use `PipesDockerClient`, the launched image also needs the package that provides `open_dagster_pipes`:

```bash
python -m pip install dagster-pipes
```

## Before You Configure It

`dagster-docker` does not have its own auth flow. The important prerequisites are operational:

- the Dagster process that launches containers must be able to talk to Docker Engine
- the image you launch must already contain your code and Python dependencies
- if the image is private, provide Docker registry credentials

The package creates Docker clients with `docker.client.from_env()`, and both the Pipes client and the run launcher accept a `registry` mapping with `url`, `username`, and `password`.

## Launch External Containerized Code With `PipesDockerClient`

The current Dagster integration page for Docker centers on `PipesDockerClient`. This is the right starting point when your actual compute already runs well in a container and you want Dagster to orchestrate it without rewriting the workload into native Dagster ops.

### Dagster-side asset

```python
import os

import dagster as dg
from dagster_docker import PipesDockerClient


@dg.asset
def docker_asset(
    context: dg.AssetExecutionContext,
    docker_pipes_client: PipesDockerClient,
):
    return docker_pipes_client.run(
        context=context,
        image=os.environ["DOCKER_ASSET_IMAGE"],
        command=["python", "/app/external_job.py"],
        extras={"input_path": "/data/input/orders.json"},
        env={
            "APP_ENV": os.getenv("APP_ENV", "dev"),
        },
    ).get_results()


defs = dg.Definitions(
    assets=[docker_asset],
    resources={
        "docker_pipes_client": PipesDockerClient(
            registry={
                "url": os.environ["DOCKER_REGISTRY_URL"],
                "username": os.environ["DOCKER_REGISTRY_USERNAME"],
                "password": os.environ["DOCKER_REGISTRY_PASSWORD"],
            }
        ),
    },
)
```

Suggested environment variables for the Dagster process:

```bash
export DOCKER_ASSET_IMAGE="ghcr.io/acme/orders-job:2026-03-13"
export DOCKER_REGISTRY_URL="ghcr.io"
export DOCKER_REGISTRY_USERNAME="my-user"
export DOCKER_REGISTRY_PASSWORD="my-token"
export APP_ENV="prod"
```

Important behavior from the package source:

- `run(...)` accepts `image`, `command`, `extras`, `env`, `registry`, and `container_kwargs`
- the client logs in to the registry if `registry` is set
- if the image is missing locally, it tries `docker pull`
- the container is treated as failed if it exits with a non-zero status code

### Code inside the launched container

Your containerized process uses `dagster-pipes` to receive context and report results:

```python
from dagster_pipes import open_dagster_pipes


def main() -> None:
    with open_dagster_pipes() as pipes:
        input_path = pipes.get_extra("input_path")
        pipes.log.info(f"Processing {input_path}")

        row_count = 42

        pipes.report_asset_materialization(
            metadata={
                "row_count": {"raw_value": row_count, "type": "int"},
            }
        )


if __name__ == "__main__":
    main()
```

Use `extras` for normal runtime parameters. If you need Docker-specific container settings such as labels, mounts, or other `containers.create(...)` options, pass them with `container_kwargs`.

## Launch Each OSS Run In Its Own Container With `DockerRunLauncher`

Use `DockerRunLauncher` when you want Dagster OSS to execute a full run in a fresh Docker container instead of inside the webserver or daemon process.

Archived Dagster deployment docs show the canonical `dagster.yaml` shape:

```yaml
# $DAGSTER_HOME/dagster.yaml
run_launcher:
  module: dagster_docker
  class: DockerRunLauncher
  config:
    env_vars:
      - DAGSTER_POSTGRES_USER
      - DAGSTER_POSTGRES_PASSWORD
      - DAGSTER_POSTGRES_DB
    container_kwargs:
      volumes:
        - /absolute/path/to/project:/opt/dagster/app
```

In that deployment model, the run launcher uses the image attached to the code location. The archived Docker deployment guide describes this as the image stored in `DAGSTER_CURRENT_IMAGE` on the user-code container.

Example user-code container environment:

```bash
export DAGSTER_HOME=/opt/dagster/dagster_home
export DAGSTER_CURRENT_IMAGE="ghcr.io/acme/dagster-user-code:2026-03-13"
export DAGSTER_POSTGRES_USER="dagster"
export DAGSTER_POSTGRES_PASSWORD="secret"
export DAGSTER_POSTGRES_DB="dagster"
```

You can also set launcher-level Docker options that are supported by the package source:

- `image` as a fallback if the code location does not provide a container image
- `registry` for private image pulls
- `network` or `networks` for Docker network attachment
- `container_kwargs` for extra Docker container settings

## Common Pitfalls

- `PipesDockerClient` and `DockerRunLauncher` both need Docker access from the process that starts containers. In OSS deployments, the archived Docker guide calls out mounting `/var/run/docker.sock` as one way to grant that access.
- The launched image must already contain your code. `dagster-docker` can pull an image, but it does not build images for you.
- If you use `DockerRunLauncher` with bind mounts in the user-code container, repeat those mounts in `container_kwargs` for launched run containers or your code path will not exist there.
- `DockerRunLauncher` needs a container image from either the code location or the launcher config. If neither is set, run launch fails.
- Keep related Dagster packages on the same release line. For this guide that means `dagster-docker 0.28.18` with `dagster 1.12.18`.

## Version Notes For `0.28.18`

- PyPI lists `dagster-docker 0.28.18` as released on March 5, 2026.
- PyPI lists Python support for this release as `>=3.10,<3.15`.
- Dagster core and Dagster integration packages use different visible version numbers in the same release train. On the same March 5, 2026 release line, PyPI lists `dagster 1.12.18` and `dagster-docker 0.28.18`.
- The current Docker integration page in Dagster docs is focused on `PipesDockerClient`; for OSS deployment details such as `DockerRunLauncher` configuration and bind-mount behavior, the official archived Docker deployment guide is still the clearest maintainer reference.

## Official Sources Used

- Dagster Docker integration page: https://docs.dagster.io/integrations/libraries/docker
- Dagster Docker deployment guide archive: https://release-1-5-9.dagster.dagster-docs.io/deployment/guides/docker
- `dagster-docker` package source: https://github.com/dagster-io/dagster/tree/master/python_modules/libraries/dagster-docker
- `DockerRunLauncher` source: https://raw.githubusercontent.com/dagster-io/dagster/master/python_modules/libraries/dagster-docker/dagster_docker/docker_run_launcher.py
- `PipesDockerClient` source: https://raw.githubusercontent.com/dagster-io/dagster/master/python_modules/libraries/dagster-docker/dagster_docker/pipes.py
- Dagster Pipes overview: https://dagster.io/blog/dagster-pipes
- `dagster-docker` on PyPI: https://pypi.org/project/dagster-docker/
- `dagster` on PyPI: https://pypi.org/project/dagster/
