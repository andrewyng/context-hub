---
name: package
description: "Apache Airflow gRPC provider for calling protobuf-defined gRPC services from DAGs with hooks and operators"
metadata:
  languages: "python"
  versions: "3.9.2"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "airflow,apache-airflow,grpc,protobuf,operators,hooks"
---

# Apache Airflow gRPC Provider Guide

Use `apache-airflow-providers-grpc` when an Airflow DAG needs to call a gRPC service through generated protobuf stubs instead of making raw HTTP requests.

## Golden Rule

- Install this package alongside `apache-airflow`; it extends Airflow and is not a standalone gRPC client.
- Generate and ship your Python protobuf client modules with your Airflow code. The provider expects a generated stub class such as `GreeterStub`; it does not compile `.proto` files for you.
- Keep endpoint details and secrets in an Airflow connection, then keep DAG code focused on `stub_class`, `call_func`, and request data.
- Use `GrpcOperator` for straightforward RPC tasks and `GrpcHook` when task code needs direct control over the call and response.

## What This Package Adds

This provider supplies Airflow's gRPC integration, including:

- `GrpcOperator`
- `GrpcHook`

These are the main entry points most DAGs use from this provider.

## Install

Install the provider into the same Airflow environment used by your scheduler, webserver, triggerer, and workers.

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION="<your-airflow-version>"
PROVIDER_VERSION="3.9.2"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-grpc==${PROVIDER_VERSION}" \
  --constraint "${CONSTRAINT_URL}"
```

If you need to generate Python modules from `.proto` files as part of your build, install `grpcio-tools` in the image or virtualenv that performs code generation.

Useful checks after installation:

```bash
airflow providers list | grep -i grpc
python -c "from airflow.providers.grpc.hooks.grpc import GrpcHook; from airflow.providers.grpc.operators.grpc import GrpcOperator; print('ok')"
```

## Prepare The Generated gRPC Client Code

The provider works with the Python modules generated from your service definition. Your DAG code typically imports:

- the generated stub class from `*_pb2_grpc.py`
- the generated request and response message classes from `*_pb2.py`

Example imports:

```python
import helloworld_pb2
import helloworld_pb2_grpc
```

Make sure those generated modules are available everywhere Airflow may import and execute the DAG.

## Configure A gRPC Connection

Start with a basic Airflow environment:

```bash
export AIRFLOW_HOME="$PWD/.airflow"
export AIRFLOW__CORE__LOAD_EXAMPLES="False"
```

Then create a connection for the target service. Using the CLI keeps the host and port out of DAG code:

```bash
airflow connections add grpc_default \
  --conn-type grpc \
  --conn-host grpc.example.internal \
  --conn-port 50051
```

If you prefer environment-based connection setup, use the matching connection id:

```bash
export AIRFLOW_CONN_GRPC_DEFAULT='grpc://grpc.example.internal:50051'
```

Practical notes:

- The example DAGs below use `grpc_default` because it matches `AIRFLOW_CONN_GRPC_DEFAULT`.
- Keep TLS material, tokens, and other secrets in the Airflow connection or a secrets backend instead of hard-coding them in the DAG file.
- Install the same connection configuration everywhere tasks may run; a connection present only on the webserver does not help a remote worker.

## Call A Unary RPC With `GrpcOperator`

Use `GrpcOperator` when the task is mostly "call one RPC and handle the response".

```python
from airflow import DAG
from airflow.providers.grpc.operators.grpc import GrpcOperator
from pendulum import datetime

import helloworld_pb2
import helloworld_pb2_grpc

with DAG(
    dag_id="grpc_operator_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    say_hello = GrpcOperator(
        task_id="say_hello",
        grpc_conn_id="grpc_default",
        stub_class=helloworld_pb2_grpc.GreeterStub,
        call_func="SayHello",
        data=helloworld_pb2.HelloRequest(name="Airflow"),
    )
```

Important pieces:

- `grpc_conn_id` selects the Airflow connection.
- `stub_class` is the generated client stub class from `*_pb2_grpc.py`.
- `call_func` is the RPC method name on that stub as a string.
- `data` is the request payload passed to the RPC, typically a generated protobuf request object.

This pattern is the simplest fit for unary RPC calls that do not need custom task logic around the response.

## Call gRPC Directly In Task Code With `GrpcHook`

Use `GrpcHook` inside a TaskFlow or Python task when you need to inspect the response object directly in Python.

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.grpc.hooks.grpc import GrpcHook
from pendulum import datetime

import helloworld_pb2
import helloworld_pb2_grpc

with DAG(
    dag_id="grpc_hook_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def fetch_greeting() -> str:
        hook = GrpcHook(grpc_conn_id="grpc_default")
        response = hook.run(
            stub_class=helloworld_pb2_grpc.GreeterStub,
            call_func="SayHello",
            data=helloworld_pb2.HelloRequest(name="Airflow"),
        )

        print(response.message)
        return response.message

    fetch_greeting()
```

Use this pattern when you want normal Python control flow around the RPC result before returning a small value to downstream tasks.

## Common Workflow Pattern

For most DAGs, a clean split is:

- define the gRPC endpoint and secrets on an Airflow connection
- import the generated protobuf stub class in DAG code
- call one RPC with `GrpcOperator` for simple request/response work
- switch to `GrpcHook` when you need to inspect or transform the protobuf response in Python
- return only small derived values from tasks instead of large raw payloads when downstream tasks do not need the full response

## Common Pitfalls

- Installing the provider only on one Airflow component. Every image or virtualenv that parses or runs the DAG needs the provider and your generated protobuf modules.
- Forgetting the generated stubs. `GrpcOperator` and `GrpcHook` require the real generated `*_pb2_grpc.py` client stub class.
- Passing the wrong RPC name in `call_func`. It must match the generated stub method name exactly.
- Hard-coding hostnames, ports, or secrets in the DAG instead of using an Airflow connection.
- Returning large protobuf payloads through XCom when downstream tasks only need a small field such as an id or status string.

## Version Notes

- This guide covers `apache-airflow-providers-grpc` version `3.9.2`.
- Check the provider's connection and API reference pages before upgrading across provider releases, especially if your deployment relies on custom channel setup, interceptors, or other advanced hook behavior.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-grpc/stable/`
- gRPC connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-grpc/stable/connections/grpc.html`
- `GrpcHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-grpc/stable/_api/airflow/providers/grpc/hooks/grpc/index.html`
- `GrpcOperator` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-grpc/stable/_api/airflow/providers/grpc/operators/grpc/index.html`
- PyPI: `https://pypi.org/project/apache-airflow-providers-grpc/`
