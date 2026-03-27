---
name: providers-common-compat
description: "Apache Airflow compatibility provider for shared sdk, standard operator, and version-gated imports across Airflow releases"
metadata:
  languages: "python"
  versions: "1.14.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,apache-airflow,providers,compatibility,operators,triggers,python"
---

# Apache Airflow Common Compat Provider Guide

Use `apache-airflow-providers-common-compat` when shared Airflow code needs one import path that works across supported Airflow releases. This package does not add a standalone service integration or its own authentication flow. It provides compatibility modules for base SDK classes, standard-provider operators and triggers, and version checks.

## Golden Rule

- Install this provider into the same environment as `apache-airflow`, with the official constraints file.
- Use it for compatibility imports in shared libraries, custom providers, plugins, or DAG utilities that must support more than one Airflow line.
- Do not expect a package-specific connection type, hook, or UI entry. It re-exports compatibility surfaces on top of Airflow and other providers.

## Requirements

The provider docs list these package requirements:

- `apache-airflow>=2.10.0`
- `apache-airflow-providers-standard>=1.6.0`

PyPI lists Python support as `>=3.10, <3.14`.

## Install

Install Airflow and this provider together, pinned in the same command. Airflow recommends using the constraints file that matches your Airflow and Python versions.

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION="3.1.8"
PROVIDER_VERSION="1.14.0"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-common-compat==${PROVIDER_VERSION}" \
  --constraint "${CONSTRAINT_URL}"
```

Useful checks after install:

```bash
airflow providers list | grep -i common.compat
python -c "from airflow.providers.common.compat.sdk import BaseHook, BaseOperator; print(BaseHook, BaseOperator)"
```

## Initialization And Environment

There is no package-specific initialization step. Airflow discovers the provider from the Python environment used by the scheduler, dag processor, triggerer, API server, and workers.

For local development, initialize Airflow first:

```bash
export AIRFLOW_HOME="$PWD/.airflow"
export AIRFLOW__CORE__LOAD_EXAMPLES="False"

airflow db migrate
```

If you use `airflow standalone`, install this provider before starting `standalone` so the local instance sees the same imports your DAG code will use.

## Common Workflow: Import Base SDK Classes Through The Compat Layer

The `airflow.providers.common.compat.sdk` module exposes Airflow authoring classes such as `BaseHook`, `BaseOperator`, and `Context`.

Use that module when you maintain custom code that should not hard-code different import paths per Airflow release.

```python
from __future__ import annotations

from airflow.providers.common.compat.sdk import BaseOperator, Context


class EchoOperator(BaseOperator):
    template_fields = ("message",)

    def __init__(self, *, message: str, **kwargs) -> None:
        super().__init__(**kwargs)
        self.message = message

    def execute(self, context: Context) -> str:
        self.log.info("message=%s", self.message)
        return self.message
```

Custom hooks can use the same compat SDK import path:

```python
from airflow.providers.common.compat.sdk import BaseHook


class DemoHook(BaseHook):
    conn_name_attr = "demo_conn_id"
    default_conn_name = "demo_default"
    conn_type = "http"
    hook_name = "Demo API"

    def __init__(self, demo_conn_id: str = "demo_default") -> None:
        super().__init__()
        self.demo_conn_id = demo_conn_id

    def get_base_url(self) -> str:
        connection = self.get_connection(self.demo_conn_id)
        return connection.host
```

## Common Workflow: Branch On Airflow Version

The `airflow.providers.common.compat.version_compat` module exposes version flags including `AIRFLOW_V_3_0_PLUS` and `AIRFLOW_V_3_1_PLUS`.

Use those flags when shared code must choose different imports or behavior for different Airflow major lines.

```python
from airflow.providers.common.compat.version_compat import AIRFLOW_V_3_0_PLUS

if AIRFLOW_V_3_0_PLUS:
    from airflow.sdk import Variable
else:
    from airflow.models import Variable


deploy_env = Variable.get("deploy_env", default="dev")
```

Keep the version branching in one helper module rather than scattering `if AIRFLOW_V_3_0_PLUS` checks across many DAG files.

## Common Workflow: Import Standard Provider Operators From A Stable Path

This provider also exposes compatibility imports for the standard provider, including `TriggerDagRunOperator`.

```python
from airflow.providers.common.compat.standard.operators import TriggerDagRunOperator


trigger_downstream = TriggerDagRunOperator(
    task_id="trigger_downstream",
    trigger_dag_id="downstream_pipeline",
    conf={"source": "compat-demo"},
    wait_for_completion=False,
)
```

Use this import path when your reusable Airflow code needs one operator import that survives Airflow and standard-provider layout changes.

For deferrable workflows, the package also exposes trigger compatibility modules under `airflow.providers.common.compat.standard.triggers`.

## Operational Checks

After adding the package, confirm that the Airflow runtime can import it and that your DAGs parse cleanly:

```bash
airflow providers list | grep -i common.compat
airflow dags list
```

To debug an import problem in isolation:

```bash
python -c "import airflow.providers.common.compat.standard.operators"
python -c "from airflow.providers.common.compat.version_compat import AIRFLOW_V_3_0_PLUS; print(AIRFLOW_V_3_0_PLUS)"
```

If scheduler or worker containers use different images, install the same Airflow and provider pins in all of them.

## Common Pitfalls

- Installing the provider without pinning `apache-airflow` in the same constrained command.
- Forgetting that the provider depends on `apache-airflow-providers-standard`; conflicts often surface there first.
- Assuming the package adds a service connection, API client, or auth workflow. It does not.
- Installing the package on the webserver image but not on workers, triggerers, or dag processors that import the same code.
- Using compat imports everywhere when your code only targets one Airflow line and does not need cross-version support.

## Version Notes

- This guide covers `apache-airflow-providers-common-compat` version `1.14.0`.
- The Airflow `stable/` docs root moves as new provider releases ship. Check the package reference page and your pinned requirements before copying imports into long-lived libraries.
- The provider requirement page is the authoritative place to confirm the minimum Airflow and companion-provider versions for your pin.

## Official Sources

- Provider docs root: `https://airflow.apache.org/docs/apache-airflow-providers-common-compat/stable/`
- Package index: `https://airflow.apache.org/docs/apache-airflow-providers-common-compat/stable/index.html`
- Package requirements and release page: `https://airflow.apache.org/docs/apache-airflow-providers-common-compat/stable/index.html#requirements`
- Package reference page: `https://airflow.apache.org/docs/apache-airflow-providers/packages-ref.html`
- `sdk` source reference: `https://airflow.apache.org/docs/apache-airflow-providers-common-compat/stable/_modules/airflow/providers/common/compat/sdk.html`
- `version_compat` source reference: `https://airflow.apache.org/docs/apache-airflow-providers-common-compat/stable/_modules/airflow/providers/common/compat/version_compat.html`
- Standard operators source reference: `https://airflow.apache.org/docs/apache-airflow-providers-common-compat/stable/_modules/airflow/providers/common/compat/standard/operators.html`
- External-task trigger source reference: `https://airflow.apache.org/docs/apache-airflow-providers-common-compat/stable/_modules/airflow/providers/common/compat/standard/triggers/external_task.html`
- PyPI: `https://pypi.org/project/apache-airflow-providers-common-compat/`
