---
name: package
description: "Apache Airflow Kubernetes provider for launching pods from DAGs and accessing Kubernetes clusters"
metadata:
  languages: "python"
  versions: "10.13.0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "airflow,kubernetes,cncf,python,dag,operator"
---

# apache-airflow-providers-cncf-kubernetes

Use `apache-airflow-providers-cncf-kubernetes` when an Airflow DAG needs to start work in Kubernetes instead of running everything directly inside the Airflow worker process. The provider's main entry point is `KubernetesPodOperator`.

This guide targets provider version `10.13.0`.

## What This Package Adds

`apache-airflow-providers-cncf-kubernetes` is an Apache Airflow provider package. Install it when DAG tasks need to:

- create and monitor Kubernetes pods from Airflow
- authenticate with a cluster using in-cluster credentials, a kubeconfig file, or an Airflow Kubernetes connection
- pass environment variables and small result payloads between Airflow and containerized task code

This package extends Airflow. It is not a general replacement for using the Kubernetes Python client directly in a standalone application.

## Install

Install the provider into the same Python environment or container image as your Airflow deployment:

```bash
python -m pip install "apache-airflow-providers-cncf-kubernetes==10.13.0"
```

If you add providers after Airflow is already installed, pin your Airflow version in the same command so dependency resolution does not silently change the core package version used by your deployment:

```bash
python -m pip install "apache-airflow==${AIRFLOW_VERSION}" "apache-airflow-providers-cncf-kubernetes==10.13.0"
```

In practice, the scheduler, workers, and any other Airflow runtime that imports DAG code need the provider available.

## Prerequisites

Before using the provider, make sure:

- the Airflow runtime that executes the task can reach the Kubernetes API server
- that runtime has credentials with permission to create pods in the target namespace
- the container image you reference already contains the commands and libraries the task needs
- you choose one cluster-auth pattern for the task: in-cluster auth, a kubeconfig file, or an Airflow connection

For local or out-of-cluster development, a kubeconfig file is the simplest option:

```bash
export KUBECONFIG="$HOME/.kube/config"
export APP_ENV="dev"
```

When Airflow itself runs inside Kubernetes, use the pod's service account and set `in_cluster=True` instead of relying on `KUBECONFIG`.

## Configure Cluster Access

The provider supports three practical configuration patterns for `KubernetesPodOperator`.

### 1. Use an in-cluster service account

Use this when the Airflow scheduler or worker is already running inside the same cluster or a network-reachable cluster with mounted service-account credentials:

```python
from airflow.providers.cncf.kubernetes.operators.pod import KubernetesPodOperator


run_in_cluster = KubernetesPodOperator(
    task_id="run_in_cluster",
    name="run-in-cluster",
    namespace="airflow",
    image="python:3.12-slim",
    cmds=["python", "-c"],
    arguments=["print('hello from in-cluster auth')"],
    in_cluster=True,
    get_logs=True,
    on_finish_action="delete_pod",
)
```

### 2. Use a kubeconfig file

Use this when Airflow runs outside the cluster and you already have a working kubeconfig:

```python
import os

from airflow.providers.cncf.kubernetes.operators.pod import KubernetesPodOperator


KUBECONFIG = os.environ["KUBECONFIG"]


run_with_kubeconfig = KubernetesPodOperator(
    task_id="run_with_kubeconfig",
    name="run-with-kubeconfig",
    namespace="default",
    image="python:3.12-slim",
    cmds=["python", "-c"],
    arguments=["print('hello from kubeconfig auth')"],
    in_cluster=False,
    config_file=KUBECONFIG,
    cluster_context="dev-cluster",
    get_logs=True,
    on_finish_action="delete_pod",
)
```

Omit `cluster_context` if the kubeconfig's current context is already the one you want.

### 3. Use an Airflow Kubernetes connection

Use this when you want Airflow to centralize cluster settings instead of hard-coding them in each DAG:

```python
from airflow.providers.cncf.kubernetes.operators.pod import KubernetesPodOperator


run_with_connection = KubernetesPodOperator(
    task_id="run_with_connection",
    name="run-with-connection",
    namespace="default",
    image="alpine:3.20",
    cmds=["sh", "-c"],
    arguments=["echo connected through kubernetes_default"],
    kubernetes_conn_id="kubernetes_default",
    get_logs=True,
    on_finish_action="delete_pod",
)
```

Pick one approach per task. Avoid mixing a connection, `config_file`, and `in_cluster=True` in the same operator unless you have a specific reason and understand which settings should win.

## Minimal `KubernetesPodOperator` DAG

This is the smallest useful pattern for running code in a Kubernetes pod from Airflow:

```python
import os

from airflow import DAG
from airflow.providers.cncf.kubernetes.operators.pod import KubernetesPodOperator
from pendulum import datetime


KUBECONFIG = os.environ.get("KUBECONFIG", os.path.expanduser("~/.kube/config"))


with DAG(
    dag_id="kubernetes_pod_basic",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
    tags=["kubernetes"],
) as dag:
    run_python = KubernetesPodOperator(
        task_id="run_python",
        name="run-python",
        namespace="default",
        image="python:3.12-slim",
        cmds=["python", "-c"],
        arguments=["import os; print(f\"APP_ENV={os.environ['APP_ENV']}\")"],
        env_vars={"APP_ENV": os.environ.get("APP_ENV", "dev")},
        in_cluster=False,
        config_file=KUBECONFIG,
        get_logs=True,
        on_finish_action="delete_pod",
    )
```

Key arguments in everyday use:

- `image` selects the container image to run
- `cmds` and `arguments` define the command executed inside the container
- `namespace` controls where the pod is created
- `env_vars` passes non-secret environment variables into the container
- `get_logs=True` streams container logs into the Airflow task log
- `on_finish_action="delete_pod"` cleans up the pod after the task finishes

## Return Small Results Through XCom

If the pod needs to return a small structured result to downstream tasks, enable XCom and write valid JSON to `/airflow/xcom/return.json` inside the container:

```python
import os

from airflow import DAG
from airflow.providers.cncf.kubernetes.operators.pod import KubernetesPodOperator
from pendulum import datetime


KUBECONFIG = os.environ.get("KUBECONFIG", os.path.expanduser("~/.kube/config"))


with DAG(
    dag_id="kubernetes_pod_xcom",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    write_xcom = KubernetesPodOperator(
        task_id="write_xcom",
        name="write-xcom",
        namespace="default",
        image="alpine:3.20",
        cmds=["sh", "-c"],
        arguments=[
            "mkdir -p /airflow/xcom && "
            "echo '{\"status\":\"ok\",\"records\":3}' > /airflow/xcom/return.json"
        ],
        do_xcom_push=True,
        in_cluster=False,
        config_file=KUBECONFIG,
        get_logs=True,
        on_finish_action="delete_pod",
    )
```

Use this for small metadata, not for large datasets. For anything substantial, write to object storage, a database, or another external system and pass only the reference through XCom.

## Use A Full Pod Spec For Advanced Pod Configuration

When simple operator arguments are not enough, pass a Kubernetes API object through `full_pod_spec`:

```python
import os

from airflow import DAG
from airflow.providers.cncf.kubernetes.operators.pod import KubernetesPodOperator
from kubernetes.client import models as k8s
from pendulum import datetime


KUBECONFIG = os.environ.get("KUBECONFIG", os.path.expanduser("~/.kube/config"))


pod = k8s.V1Pod(
    metadata=k8s.V1ObjectMeta(name="full-spec-demo", namespace="default"),
    spec=k8s.V1PodSpec(
        restart_policy="Never",
        containers=[
            k8s.V1Container(
                name="main",
                image="alpine:3.20",
                command=["sh", "-c", "echo hello from full pod spec"],
            )
        ],
    ),
)


with DAG(
    dag_id="kubernetes_pod_full_spec",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    run_full_spec = KubernetesPodOperator(
        task_id="run_full_spec",
        full_pod_spec=pod,
        in_cluster=False,
        config_file=KUBECONFIG,
        get_logs=True,
        on_finish_action="delete_pod",
    )
```

Use this pattern when you need pod-level fields that are awkward to express through top-level operator arguments.

## Common Pitfalls

- Be explicit about `namespace`. Relying on defaults makes DAGs harder to move across environments.
- Put the provider in every Airflow runtime that parses or executes the DAG, not only on your local machine.
- Keep secrets in Kubernetes secrets or Airflow connections instead of hard-coding them in DAG files or `env_vars`.
- Use `get_logs=True` during development so container output appears in task logs.
- Use `on_finish_action="delete_pod"` for normal runs, but switch to a keep-pod workflow when you need to inspect a failed pod interactively.
- Keep XCom payloads small and JSON-serializable.

## Operational Checks

Confirm the provider is installed:

```bash
python -m pip show apache-airflow-providers-cncf-kubernetes
```

List provider packages visible to Airflow:

```bash
airflow providers list | rg cncf
```

If Airflow cannot create pods, check these first:

- the task log for Kubernetes API auth or RBAC errors
- whether the target namespace exists
- whether the image can be pulled from the cluster
- whether the kubeconfig, connection, or service account is available in the actual runtime that executes the task
