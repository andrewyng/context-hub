---
name: package
description: "Dagster Kubernetes integration for launching runs and steps as Kubernetes Jobs in Dagster OSS"
metadata:
  languages: "python"
  versions: "0.28.18"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "dagster,kubernetes,k8s,python,orchestration,executor"
---

# dagster-k8s

Use `dagster-k8s` when your Dagster OSS deployment should execute work on Kubernetes instead of only in the webserver or daemon process. The package primarily gives you two integration points:

- `K8sRunLauncher` to launch an entire Dagster run as a Kubernetes Job
- `k8s_job_executor` to launch individual job steps as Kubernetes Jobs

This guide targets `dagster-k8s 0.28.18`, which belongs to the Dagster `1.12.18` release line.

## Install

Install `dagster-k8s` alongside the matching Dagster packages used by your deployment:

```bash
python -m pip install \
  "dagster==1.12.18" \
  "dagster-k8s==0.28.18" \
  "dagster-webserver==1.12.18"
```

If you run `dagster-daemon`, install the same package set there too. Keep the Dagster release line aligned; do not mix `dagster-k8s 0.28.18` with an unrelated Dagster core version.

## Before You Configure It

You need:

- a Kubernetes cluster and namespace where Dagster can create Jobs and Pods
- a service account with permission to create, watch, and delete Jobs and Pods in that namespace
- a container image that already contains your Dagster code location and Python dependencies
- a shared Dagster instance configuration that launched run workers can read

Example shell setup:

```bash
export DAGSTER_HOME="$PWD/.dagster"
mkdir -p "$DAGSTER_HOME"

export DAGSTER_K8S_NAMESPACE="dagster"
export DAGSTER_K8S_SERVICE_ACCOUNT="dagster"
export DAGSTER_K8S_JOB_IMAGE="ghcr.io/example/dagster-user-code:latest"
export DAGSTER_INSTANCE_CONFIG_MAP="dagster-instance"
```

Create the namespace and a service account if they do not already exist:

```bash
kubectl create namespace "$DAGSTER_K8S_NAMESPACE"
kubectl -n "$DAGSTER_K8S_NAMESPACE" create serviceaccount "$DAGSTER_K8S_SERVICE_ACCOUNT"
```

If your Dagster instance config lives in `$DAGSTER_HOME/dagster.yaml`, make it available to launched workers through a ConfigMap:

```bash
kubectl -n "$DAGSTER_K8S_NAMESPACE" create configmap "$DAGSTER_INSTANCE_CONFIG_MAP" \
  --from-file=dagster.yaml="$DAGSTER_HOME/dagster.yaml"
```

`dagster-k8s` does not have a separate SDK auth flow. Kubernetes authentication comes from the runtime environment:

- in cluster, Dagster usually uses the pod's service account
- outside the cluster, configure Kubernetes access with your kubeconfig and the launcher's `kubeconfig_file` setting when needed

## Launch Entire Runs With `K8sRunLauncher`

Use `K8sRunLauncher` when each Dagster run should execute in its own Kubernetes Job.

Example `$DAGSTER_HOME/dagster.yaml`:

```yaml
# $DAGSTER_HOME/dagster.yaml
run_launcher:
  module: dagster_k8s.launcher
  class: K8sRunLauncher
  config:
    job_image:
      env: DAGSTER_K8S_JOB_IMAGE
    job_namespace:
      env: DAGSTER_K8S_NAMESPACE
    service_account_name:
      env: DAGSTER_K8S_SERVICE_ACCOUNT
    instance_config_map:
      env: DAGSTER_INSTANCE_CONFIG_MAP
    image_pull_policy: IfNotPresent
    env_config_maps:
      - dagster-user-code-env
    env_secrets:
      - dagster-user-code-secrets
    run_k8s_config:
      pod_spec_config:
        node_selector:
          workload: dagster
```

Start Dagster against the same `DAGSTER_HOME`:

```bash
dg dev -m my_project.definitions
```

If your deployment uses schedules or sensors, point the daemon at the same instance:

```bash
dagster-daemon run
```

Practical rules that matter:

- `job_image` must contain your importable code location and all runtime dependencies
- the target namespace must already contain the referenced ConfigMaps and Secrets
- the service account must be able to create Jobs and read any referenced Secrets or ConfigMaps
- your instance storage must be reachable from launched jobs; for Kubernetes deployments, a shared backend such as PostgreSQL is the normal choice

## Launch Individual Steps With `k8s_job_executor`

Use `k8s_job_executor` when you want a Dagster job's steps to run as separate Kubernetes Jobs.

```python
import dagster as dg
from dagster_k8s import k8s_job_executor


@dg.op
def emit_message() -> None:
    print("hello from a kubernetes step")


@dg.job(executor_def=k8s_job_executor)
def k8s_steps_job():
    emit_message()


defs = dg.Definitions(jobs=[k8s_steps_job])
```

Configure the executor in run config:

```yaml
execution:
  config:
    job_namespace:
      env: DAGSTER_K8S_NAMESPACE
    service_account_name:
      env: DAGSTER_K8S_SERVICE_ACCOUNT
    job_image:
      env: DAGSTER_K8S_JOB_IMAGE
    image_pull_policy: IfNotPresent
    env_config_maps:
      - dagster-user-code-env
    env_secrets:
      - dagster-user-code-secrets
```

In Python, the same run config looks like this:

```python
run_config = {
    "execution": {
        "config": {
            "job_namespace": {"env": "DAGSTER_K8S_NAMESPACE"},
            "service_account_name": {"env": "DAGSTER_K8S_SERVICE_ACCOUNT"},
            "job_image": {"env": "DAGSTER_K8S_JOB_IMAGE"},
            "image_pull_policy": "IfNotPresent",
            "env_config_maps": ["dagster-user-code-env"],
            "env_secrets": ["dagster-user-code-secrets"],
        }
    }
}
```

The same image rule applies here: the image used for step Jobs must already contain the code and dependencies needed to import and execute your job.

## Apply Raw Kubernetes Settings Per Run Or Job

`dagster-k8s` supports raw Kubernetes fragments for the launched Job and Pod. The most common way to apply them from code is the `dagster-k8s/config` tag.

```python
import dagster as dg
from dagster_k8s import k8s_job_executor


@dg.op
def work() -> None:
    print("running with custom k8s settings")


@dg.job(
    executor_def=k8s_job_executor,
    tags={
        "dagster-k8s/config": {
            "container_config": {
                "resources": {
                    "requests": {"cpu": "250m", "memory": "512Mi"},
                    "limits": {"cpu": "1", "memory": "1Gi"},
                }
            },
            "pod_spec_config": {
                "node_selector": {"workload": "dagster"}
            },
            "job_metadata": {
                "labels": {"app.kubernetes.io/part-of": "dagster"}
            },
        }
    },
)
def tuned_job():
    work()
```

The raw config groups you will usually use are:

- `container_config` for container fields such as resource requests and limits
- `pod_template_spec_metadata` for pod-template labels and annotations
- `pod_spec_config` for pod-level settings such as node selectors and tolerations
- `job_metadata` and `job_spec_config` for Kubernetes Job metadata and spec fields

Prefer the structured launcher or executor settings for standard fields such as namespace, service account, image, env sources, and pull secrets. Use raw config only for Kubernetes fields that are not already covered by first-class Dagster settings.

## Common Pitfalls

- Keep package versions aligned. `dagster-k8s 0.28.18` is for the Dagster `1.12.18` release line.
- Choose the right execution level: `K8sRunLauncher` launches whole runs as Jobs, while `k8s_job_executor` launches individual steps as Jobs.
- Do not assume local files are visible inside launched jobs. Package your code and runtime files into `job_image`, or mount them explicitly through Kubernetes config.
- A Kubernetes service account is not just a name in config; it needs RBAC permissions for the resources your launch path touches.
- Referenced ConfigMaps and Secrets must exist in the namespace where jobs are launched.
- Local ephemeral instance storage is a poor fit once Dagster work moves into separate Kubernetes jobs. Use shared instance storage.
- If Dagster runs outside the cluster, Kubernetes auth must come from kubeconfig or another supported client configuration; in-cluster service-account auth does not apply there.

## Version-Sensitive Notes For `0.28.18`

- Dagster library packages and Dagster core use different visible version numbers in the same release train. For this guide, that means `dagster-k8s 0.28.18` with Dagster core `1.12.18`.
- The `dagster-k8s` package source for this release line lives in the Dagster monorepo under `python_modules/libraries/dagster-k8s`.
- When upgrading a production deployment, pin the related Dagster packages together instead of upgrading `dagster-k8s` in isolation.

## Official Sources Used

- Dagster `dagster-k8s` package source: `https://github.com/dagster-io/dagster/tree/master/python_modules/libraries/dagster-k8s`
- Dagster docs root: `https://docs.dagster.io/`
- PyPI package page: `https://pypi.org/project/dagster-k8s/`
