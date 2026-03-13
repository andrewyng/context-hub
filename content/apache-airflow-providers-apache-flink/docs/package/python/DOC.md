---
name: package
description: "Apache Airflow provider for deploying Apache Flink applications to Kubernetes from DAGs"
metadata:
  languages: "python"
  versions: "1.8.2"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "airflow,apache-airflow,flink,kubernetes,python,dag,operator"
---

# apache-airflow-providers-apache-flink

Use `apache-airflow-providers-apache-flink` when an Airflow DAG needs to submit or update an Apache Flink deployment on Kubernetes. The provider's main public entry point is `FlinkKubernetesOperator`.

This guide targets provider version `1.8.2`.

## Golden Rule

- Install this provider into the same Python environment or container image as your Airflow deployment; it is not a standalone Flink client for regular Python scripts.
- Treat Kubernetes access as Airflow configuration, not DAG code. Keep cluster credentials in a Kubernetes connection or another secrets-backed Airflow config path.
- Use this provider only after the target cluster already has the Flink Kubernetes operator and its custom resources available.
- Keep the Flink application manifest in a location every Airflow runtime can read, not only on the machine where you edit the DAG.

## What This Package Adds

`apache-airflow-providers-apache-flink` extends Airflow with Flink-on-Kubernetes support. The documented workflow is centered on `FlinkKubernetesOperator`, which applies a Flink application manifest to a Kubernetes cluster from a DAG task.

There is no separate long-lived client object to initialize in an application. In practice, you configure cluster access in Airflow and instantiate the operator inside a DAG.

## Install

Install the provider alongside a pinned Airflow version so dependency resolution does not silently change the Airflow core package used by your deployment:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION="<your-airflow-version>"
PROVIDER_VERSION="1.8.2"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-apache-flink==${PROVIDER_VERSION}" \
  --constraint "${CONSTRAINT_URL}"
```

Every Airflow runtime that imports or executes the DAG needs the provider available, including the scheduler and any workers.

## Prerequisites

Before you use the operator, make sure:

- the Airflow runtime can reach the Kubernetes API server for the target cluster
- the Kubernetes credentials used by Airflow can create or update the Flink custom resource in the target namespace
- the cluster already has the Flink Kubernetes operator installed
- the manifest file passed to `application_file` is available inside the scheduler or worker environment that runs the task

For local or out-of-cluster work, these environment variables are a practical starting point:

```bash
export KUBECONFIG="$HOME/.kube/config"
export FLINK_APPLICATION_FILE="$PWD/dags/flink/example-flinkdeployment.yaml"
```

`KUBECONFIG` is useful while creating or debugging Kubernetes access for Airflow. `FLINK_APPLICATION_FILE` is the manifest path the DAG will hand to the operator.

## Configure Cluster Access

The simplest day-to-day pattern is to keep cluster details in Airflow's Kubernetes connection layer and reference `kubernetes_default` from the DAG. That keeps kubeconfig paths, service-account settings, and any cluster-specific configuration out of source code.

If you run Airflow inside Kubernetes, prefer in-cluster credentials. If you run Airflow outside the cluster, a kubeconfig-backed Kubernetes connection is the common setup.

## Minimal DAG

This is the smallest useful pattern for deploying a Flink application manifest from Airflow:

```python
from __future__ import annotations

import os

import pendulum
from airflow import DAG
from airflow.providers.apache.flink.operators.flink_kubernetes import FlinkKubernetesOperator


FLINK_APPLICATION_FILE = os.environ["FLINK_APPLICATION_FILE"]


with DAG(
    dag_id="flink_kubernetes_submit",
    start_date=pendulum.datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["flink", "kubernetes"],
) as dag:
    deploy_flink_application = FlinkKubernetesOperator(
        task_id="deploy_flink_application",
        namespace="default",
        application_file=FLINK_APPLICATION_FILE,
        kubernetes_conn_id="kubernetes_default",
    )
```

Important fields in everyday use:

- `application_file`: path to the Flink deployment manifest Airflow should apply
- `namespace`: Kubernetes namespace containing the Flink custom resource
- `kubernetes_conn_id`: Airflow connection id used for cluster authentication; `kubernetes_default` is the usual default

The `application_file` must point to a valid Flink custom resource manifest for the Flink Kubernetes operator installed in your cluster.

## Common Workflow

1. Build or check in a Flink deployment manifest that matches the Flink Kubernetes operator version used by your cluster.
2. Make that file available inside the Airflow runtime, for example in the DAGs image or a mounted volume.
3. Configure Kubernetes access in Airflow with a connection such as `kubernetes_default`.
4. Add `FlinkKubernetesOperator` to the DAG with the target namespace and manifest path.
5. Trigger the DAG and inspect the Airflow task log plus the resulting Kubernetes custom resource if the deployment does not come up as expected.

Useful local checks:

```bash
airflow dags list
airflow dags show flink_kubernetes_submit
airflow tasks test flink_kubernetes_submit deploy_flink_application 2026-03-12
```

## Pitfalls

### `application_file` must exist where the task runs

If the scheduler or worker runs in a container, `application_file` is resolved in that runtime, not on your laptop. Relative paths that only exist in a local checkout are a common source of task failures.

### Airflow does not install or manage Flink for you

This provider lets Airflow talk to Kubernetes about Flink deployments. It does not install the Flink Kubernetes operator, create the cluster, or package your Flink job artifacts.

### Keep Kubernetes auth out of DAG code

Hard-coding kubeconfig paths, tokens, or certificates directly into DAG files makes deployments brittle. Prefer Airflow connections, environment-backed secrets, or in-cluster credentials.

### Pin Airflow and provider versions together

Airflow provider packages evolve with Airflow itself. When you add or upgrade this provider, pin the Airflow version in the same install command and use the matching constraints file.

## Version Notes

- This guide is written for `apache-airflow-providers-apache-flink==1.8.2`.
- If you are on another provider release, verify the operator arguments and dependency expectations in the corresponding Airflow provider docs before copying older examples.
