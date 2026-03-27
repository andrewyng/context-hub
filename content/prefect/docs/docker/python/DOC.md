---
name: docker
description: "Prefect Docker integration for Docker work pools, image builds, registry credentials, and container tasks"
metadata:
  languages: "python"
  versions: "0.7.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "prefect,docker,python,workflow,orchestration,deployments,workers,containers"
---

# Prefect Docker Python Package Guide

## Golden Rule

Use `prefect-docker` as the Docker integration layer for Prefect 3. Keep flow logic in core `prefect`; install this package when your deployments or flow code need Docker infrastructure such as Docker work pools, image build and push steps, Docker host and registry blocks, or container and image tasks.

Prefect's integration docs recommend installing Docker support with the `prefect[docker]` extra so that `prefect` and `prefect-docker` stay compatible.

## Install

Recommended install:

```bash
python -m pip install "prefect[docker]"
```

Upgrade both packages together:

```bash
python -m pip install -U "prefect[docker]"
```

If you need to pin the integration package itself:

```bash
python -m pip install "prefect-docker==0.7.1"
```

Sanity-check the install:

```bash
python -m pip show prefect-docker
python -c "import prefect_docker; print(prefect_docker.__file__)"
```

PyPI lists `prefect-docker 0.7.1` as the current release covered here, and the package requires Python 3.10 or later.

## Prerequisites And Environment

Before using the integration:

- Docker must be installed and running.
- `PREFECT_API_URL` must point at Prefect Cloud or a self-hosted Prefect server if you want to create deployments, run workers, or save and load named blocks.
- `PREFECT_API_KEY` is also required for Prefect Cloud.

Typical environment variables:

```bash
export PREFECT_API_URL="https://api.prefect.cloud/api/accounts/<account-id>/workspaces/<workspace-id>"
export PREFECT_API_KEY="pnu_..."

export DOCKER_REGISTRY_USERNAME="your-username"
export DOCKER_REGISTRY_PASSWORD="your-password-or-token"
```

For a local self-hosted Prefect server instead of Cloud:

```bash
prefect server start
prefect config set PREFECT_API_URL="http://127.0.0.1:4200/api"
```

## Deploy A Flow To A Docker Work Pool

Create a Docker work pool:

```bash
prefect work-pool create "docker-pool" --type docker
```

Start a worker for that pool:

```bash
prefect worker start --pool "docker-pool"
```

Then register a deployment from Python:

```python
from prefect import flow


@flow(log_prints=True)
def hello(name: str = "world") -> None:
    print(f"Hello, {name}!")


if __name__ == "__main__":
    hello.deploy(
        name="hello-docker",
        work_pool_name="docker-pool",
        image="docker.io/your-user/prefect-hello:latest",
        push=False,
    )
```

Trigger it:

```bash
prefect deployment run "hello/hello-docker"
```

What matters here:

- Keep the worker process running or scheduled runs will not start.
- `push=False` is useful for local development when the worker can use the same local Docker daemon.
- For remote workers or shared infrastructure, push the image to a registry the worker can pull from.

## Customize The Image Build With `DockerImage`

If you want to control the Dockerfile or build settings, pass `prefect.docker.DockerImage` to `.deploy()`:

```python
from prefect import flow
from prefect.docker import DockerImage


@flow(log_prints=True)
def hello(name: str = "world") -> None:
    print(f"Hello, {name}!")


if __name__ == "__main__":
    hello.deploy(
        name="hello-docker",
        work_pool_name="docker-pool",
        image=DockerImage(
            name="docker.io/your-user/prefect-hello",
            tag="2026-03-13",
            dockerfile="Dockerfile",
        ),
        push=True,
    )
```

If you leave `dockerfile` as `"auto"` or omit it, Prefect generates a Dockerfile for the deployment image.

## Configure Docker Host And Registry Credentials

`prefect-docker` exposes separate blocks for the Docker daemon and for registry authentication.

Create and save reusable blocks:

```python
import os

from prefect_docker import DockerHost, DockerRegistryCredentials


docker_host = DockerHost(base_url="unix:///var/run/docker.sock")
docker_host.save("local-docker", overwrite=True)

docker_registry_credentials = DockerRegistryCredentials(
    username=os.environ["DOCKER_REGISTRY_USERNAME"],
    password=os.environ["DOCKER_REGISTRY_PASSWORD"],
    registry_url="registry.hub.docker.com",
)
docker_registry_credentials.save("dockerhub-creds", overwrite=True)
```

Use them directly:

```python
from prefect_docker import DockerHost, DockerRegistryCredentials


docker_host = DockerHost.load("local-docker")
docker_registry_credentials = DockerRegistryCredentials.load("dockerhub-creds")

with docker_host.get_client() as client:
    docker_registry_credentials.login(client)
    print(client.ping())
```

If you do not set `base_url`, `DockerHost` configures the client from the Docker environment.

## Run Docker Image And Container Tasks Inside A Flow

Use the built-in tasks when a flow needs to pull an image, create a container, read logs, and clean up:

```python
from prefect import flow
from prefect_docker import DockerHost
from prefect_docker.containers import (
    create_docker_container,
    get_docker_container_logs,
    remove_docker_container,
    start_docker_container,
)
from prefect_docker.images import pull_docker_image


@flow(log_prints=True)
def run_container() -> str:
    docker_host = DockerHost(base_url="unix:///var/run/docker.sock")

    pull_docker_image(
        repository="alpine",
        tag="3.20",
        docker_host=docker_host,
    )

    container = create_docker_container(
        image="alpine:3.20",
        command=["/bin/sh", "-c", "echo hello from prefect-docker"],
        docker_host=docker_host,
    )
    start_docker_container(container_id=container.id, docker_host=docker_host)
    logs = get_docker_container_logs(container_id=container.id, docker_host=docker_host)
    remove_docker_container(container_id=container.id, docker_host=docker_host, force=True)
    return logs.strip()


if __name__ == "__main__":
    print(run_container())
```

If the registry requires authentication, pass a `DockerRegistryCredentials` block to `pull_docker_image(..., docker_registry_credentials=...)`.

## Use `prefect-docker` In `prefect.yaml`

The package also provides deployment build and push steps for `prefect.yaml`:

```yaml
build:
  - prefect_docker.deployments.steps.build_docker_image:
      id: build-image
      requires: prefect-docker
      image_name: docker.io/your-user/prefect-hello
      tag: latest
      dockerfile: auto

push:
  - prefect_docker.deployments.steps.push_docker_image:
      requires: prefect-docker
      image_name: "{{ build-image.image_name }}"
      tag: "{{ build-image.tag }}"
      credentials: "{{ prefect.blocks.docker-registry-credentials.dockerhub-creds }}"
```

This is the right pattern when your deployment workflow already uses `prefect.yaml` instead of `.deploy()` from Python.

## Common Pitfalls

- `prefect-docker` does not replace core `prefect`; you still write flows, deployments, and workers with Prefect itself.
- Docker must be reachable from the environment where the worker or flow code runs. A deployment can register successfully even if the runtime cannot talk to the Docker daemon later.
- `push=False` only works when the worker can use the same local image. Remote Docker workers need a registry-accessible image.
- Loading blocks with `DockerHost.load(...)` or `DockerRegistryCredentials.load(...)` requires a working Prefect API connection.
- If you omit `base_url`, `DockerHost` falls back to Docker environment configuration. Be explicit when you need a specific socket or remote daemon.
- Keep the worker process alive. Closing the worker terminal stops polling for scheduled runs.

## Version Notes For `prefect-docker` 0.7.1

- PyPI lists `0.7.1` as the latest release, published on January 15, 2026.
- The current integration docs live under `https://docs.prefect.io/integrations/prefect-docker`, while most deployment examples for Docker work pools are in the Prefect v3 deployment docs.
- `prefect-docker` 0.7.1 requires Python 3.10+.

## Official Sources

- Prefect Docker integration docs: `https://docs.prefect.io/integrations/prefect-docker`
- Prefect Docker deployment guide: `https://docs.prefect.io/v3/how-to-guides/deployment_infra/docker`
- Prefect workers concept docs: `https://docs.prefect.io/v3/concepts/workers`
- Prefect work-pool CLI reference: `https://docs.prefect.io/v3/api-ref/cli/work-pool`
- Prefect Docker image deployment guide: `https://docs.prefect.io/v3/how-to-guides/deployments/deploy-via-python`
- `prefect.docker.DockerImage` SDK reference: `https://reference.prefect.io/prefect/docker/docker_image/`
- `prefect_docker.host` SDK reference: `https://reference.prefect.io/prefect_docker/host/`
- `prefect_docker.credentials` SDK reference: `https://reference.prefect.io/prefect_docker/credentials/`
- `prefect_docker.images` SDK reference: `https://reference.prefect.io/prefect_docker/images/`
- `prefect_docker.containers` SDK reference: `https://reference.prefect.io/prefect_docker/containers/`
- `prefect_docker.deployments.steps` SDK reference: `https://reference.prefect.io/prefect_docker/deployments/steps/`
- PyPI package page: `https://pypi.org/project/prefect-docker/`
