---
name: package
description: "Prefect Kubernetes integration for deploying Prefect flows to Kubernetes-backed work pools and workers"
metadata:
  languages: "python"
  versions: "0.7.5"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "prefect,kubernetes,python,workflow,orchestration,workers,deployment"
---

# Prefect Kubernetes Python Package Guide

## Golden Rule

Use `prefect-kubernetes` when your Prefect deployments should run on Kubernetes. Keep writing flows with core `prefect`; this package is the Kubernetes integration layer for worker infrastructure and cluster-backed execution.

If you only run flows locally with `flow()` and do not need Kubernetes work pools or workers, you usually do not need this package.

## Install

Install the integration into the environment that will register deployments and into the worker image or environment that will execute them:

```bash
python -m pip install "prefect-kubernetes==0.7.5"
```

If you are pinning your full orchestration stack, pin Prefect alongside it:

```bash
python -m pip install "prefect==3.6.21" "prefect-kubernetes==0.7.5"
```

Common alternatives:

```bash
uv add prefect-kubernetes
poetry add prefect-kubernetes
```

Sanity-check the package install:

```bash
python -m pip show prefect-kubernetes
```

## Prerequisites

Before you deploy to Kubernetes, make sure all of these are true:

- `PREFECT_API_URL` points at a real Prefect server or Prefect Cloud workspace.
- `PREFECT_API_KEY` is set when you use Prefect Cloud.
- Your Kubernetes cluster is reachable from the worker environment.
- The target namespace, service account, and RBAC rules already exist.
- The image you deploy is available to the cluster and includes your flow code plus runtime dependencies.

Typical Prefect environment variables:

```bash
export PREFECT_API_URL="https://api.prefect.cloud/api/accounts/<account-id>/workspaces/<workspace-id>"
export PREFECT_API_KEY="pnu_..."
```

For a local self-hosted server instead of Cloud:

```bash
prefect server start
prefect config set PREFECT_API_URL="http://127.0.0.1:4200/api"
```

## Kubernetes Authentication

There is no separate `prefect-kubernetes` API token. The integration uses normal Kubernetes authentication from the environment where the worker runs:

- in-cluster service account credentials when the worker runs inside Kubernetes
- a kubeconfig file when the worker runs outside the cluster

Practical guidance:

- Prefer an in-cluster service account for production workers.
- Give that service account only the permissions needed to create and watch the workload objects your pool uses.
- Do not hard-code kubeconfig content or cluster credentials into flow code.

## Minimal Deployment Workflow

`prefect-kubernetes` does not introduce a separate Python client you need to initialize in app code. You still write flows with `prefect`, then deploy them to a Kubernetes-backed work pool.

### Define a flow and register a deployment

```python
from prefect import flow


@flow(name="sync-customers", log_prints=True)
def sync_customers() -> None:
    print("Running in Kubernetes through a Prefect worker")


if __name__ == "__main__":
    sync_customers.deploy(
        name="daily",
        work_pool_name="kubernetes-pool",
        image="ghcr.io/acme/prefect-sync:latest",
        push=False,
        cron="0 2 * * *",
    )
```

What matters here:

- `work_pool_name` must point to a Kubernetes work pool.
- `image` must contain your project code and its Python dependencies.
- `push=False` only works if the referenced image already exists in a registry the cluster can pull from.

### Start a worker for that pool

Run the worker in an environment that has both Prefect connectivity and Kubernetes access:

```bash
prefect worker start --pool kubernetes-pool
```

### Trigger the deployment

```bash
prefect deployment run "sync-customers/daily"
```

## Image And Runtime Setup

The most common failure is registering a deployment from one environment and then running it in a container image that is missing your code or dependencies.

Make sure the runtime image includes:

- `prefect-kubernetes`
- your application package or source tree
- every library imported by the flow at runtime

Example `requirements.txt` fragment:

```text
prefect==3.6.21
prefect-kubernetes==0.7.5
```

## Common Pitfalls

- Installing `prefect-kubernetes` locally does not make Kubernetes execution work unless the worker environment also has the package and valid cluster access.
- A deployment can register successfully even when the worker later fails on image pulls, missing namespaces, or RBAC errors.
- The worker needs network reachability to both the Prefect API and the Kubernetes API.
- Kubernetes credentials belong in cluster configuration or worker runtime configuration, not inside the flow function.
- If the worker runs outside the cluster, make sure the kubeconfig it uses points at the intended cluster and context.
- If you want remote execution on Kubernetes, do not stop at calling the flow directly; register a deployment and keep a worker running for its pool.

## Version Notes For `prefect-kubernetes` 0.7.5

- This guide covers the PyPI package version `0.7.5`.
- Treat the package as an integration for current Prefect work-pool and worker patterns, not older Prefect 2 agent-based examples.
- When you copy older blog posts or snippets, translate them to current Prefect deployment and worker workflows before using them in production.

## Official Sources Used

- Docs root: `https://docs.prefect.io/v3/`
- Integrations root: `https://docs.prefect.io/integrations/`
- Deploy and workers docs: `https://docs.prefect.io/v3/deploy/`
- Settings and profiles: `https://docs.prefect.io/v3/concepts/settings-and-profiles`
- PyPI package page: `https://pypi.org/project/prefect-kubernetes/`
