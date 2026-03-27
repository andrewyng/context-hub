---
name: providers-openlineage
description: "Apache Airflow OpenLineage provider for emitting lineage events from DAGs and tasks to an OpenLineage backend"
metadata:
  languages: "python"
  versions: "2.11.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,openlineage,lineage,data-lineage,dag,python"
---

# apache-airflow-providers-openlineage

Use `apache-airflow-providers-openlineage` to emit OpenLineage events from Airflow DAG runs and task runs to a configured backend such as an HTTP endpoint or console output. Basic setup is configuration-only: upstream says no DAG changes are required to start emitting events.

This guide targets provider version `2.11.0`.

## Install

Install the provider into the same Python environment or container image as your Airflow deployment:

```bash
python -m pip install "apache-airflow-providers-openlineage==2.11.0"
```

Upstream lists these minimum requirements for provider `2.11.0`:

- `apache-airflow>=2.11.0`
- `apache-airflow-providers-common-sql>=1.32.0`
- `apache-airflow-providers-common-compat>=1.14.0`
- `openlineage-integration-common>=1.41.0`
- `openlineage-python>=1.41.0`

PyPI also lists Python `3.10` through `3.13` for this release.

If you are adding the provider to an existing Airflow environment, keep `apache-airflow` pinned in the same install command so dependency resolution does not unexpectedly move your core Airflow version:

```bash
python -m pip install "apache-airflow==${AIRFLOW_VERSION}" "apache-airflow-providers-openlineage==2.11.0"
```

The provider must be available anywhere Airflow imports DAG code or runs tasks, which typically means the scheduler and every worker image.

## Minimal Configuration

OpenLineage does nothing until you configure a transport. The recommended configuration path is the Airflow `[openlineage]` section in `airflow.cfg` or the equivalent `AIRFLOW__OPENLINEAGE__*` environment variables.

Minimal HTTP transport:

```bash
export AIRFLOW__OPENLINEAGE__TRANSPORT='{"type": "http", "url": "http://example.com:5000", "endpoint": "api/v1/lineage"}'
export AIRFLOW__OPENLINEAGE__NAMESPACE='my-airflow-instance'
```

Equivalent `airflow.cfg` section:

```ini
[openlineage]
transport = {"type": "http", "url": "http://example.com:5000", "endpoint": "api/v1/lineage"}
namespace = my-airflow-instance
```

Useful options from the provider configuration reference:

- `AIRFLOW__OPENLINEAGE__TRANSPORT`: JSON transport configuration
- `AIRFLOW__OPENLINEAGE__CONFIG_PATH`: path to an `openlineage.yml` file instead of inline JSON
- `AIRFLOW__OPENLINEAGE__NAMESPACE`: logical namespace for this Airflow instance
- `AIRFLOW__OPENLINEAGE__DISABLED`: disable event sending without uninstalling the provider
- `AIRFLOW__OPENLINEAGE__DISABLE_SOURCE_CODE`: stop including source code for operators such as Python and Bash
- `AIRFLOW__OPENLINEAGE__INCLUDE_FULL_TASK_INFO`: include full serialized task info; keep this off unless you need it
- `AIRFLOW__OPENLINEAGE__DEBUG_MODE`: emit extra debugging details; use temporarily only

Configuration precedence is:

1. `config_path`
2. `transport`
3. fallback lookup performed by the underlying `openlineage-python` client

Upstream explicitly recommends Airflow configuration as the future-proof option.

## Configure With A YAML File

If you already manage OpenLineage transport settings in YAML, point Airflow at that file:

```bash
export AIRFLOW__OPENLINEAGE__CONFIG_PATH="/opt/airflow/openlineage.yml"
```

Example `openlineage.yml` content from the provider docs:

```yaml
transport:
  type: http
  url: https://backend:5000
  endpoint: events/receive
  auth:
    type: api_key
    apiKey: your-api-key
```

Use `config_path` when you do not want JSON embedded in environment variables or `airflow.cfg`.

## Verify Events With A Simple DAG

All Airflow operators emit basic OpenLineage events unless explicitly disabled or skipped during scheduling. A minimal smoke test DAG is enough to verify that your transport is configured correctly:

```python
from __future__ import annotations

from airflow import DAG
from airflow.providers.standard.operators.python import PythonOperator
from pendulum import datetime


def emit_log() -> None:
    print("openlineage smoke test")


with DAG(
    dag_id="openlineage_smoke_test",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
    tags=["lineage"],
) as dag:
    PythonOperator(
        task_id="emit_log",
        python_callable=emit_log,
    )
```

For local debugging, send events to task logs instead of a backend:

```bash
export AIRFLOW__OPENLINEAGE__TRANSPORT='{"type": "console"}'
```

Once the DAG runs, the provider emits task and DAG metadata automatically. Upstream's supported-classes docs note that richer lineage details depend on the operator or hook that ran.

## Richer Lineage From Supported Operators And Hooks

The provider distinguishes between:

- basic events for every operator
- richer events for supported operators and hooks

Upstream says supported operators and hooks can add metadata such as:

- input and output datasets
- SQL text and query IDs for supported SQL executions
- source code or external job IDs for some operators

Hook-level lineage also matters. When a supported hook is called from a "black box" task such as `PythonOperator`, the provider can still capture lineage from that hook execution.

Practical implication:

- use supported SQL operators and supported database hooks when you want dataset-level lineage
- for custom Python tasks, prefer supported hooks over raw client libraries if you want automatic lineage extraction
- check the upstream supported-classes list before assuming a specific operator or hook will emit input/output datasets

## Enable Or Disable Lineage Selectively

If you do not want lineage on every DAG, enable the selective policy first:

```bash
export AIRFLOW__OPENLINEAGE__SELECTIVE_ENABLE="true"
```

Then enable or disable lineage in code with `enable_lineage` and `disable_lineage`:

```python
from __future__ import annotations

from airflow import DAG
from airflow.providers.openlineage.utils.selective_enable import disable_lineage, enable_lineage
from airflow.providers.standard.operators.python import PythonOperator
from pendulum import datetime


def extract() -> None:
    print("extract")


def publish_metrics() -> None:
    print("publish")


with DAG(
    dag_id="openlineage_selective_enable",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    extract_task = PythonOperator(
        task_id="extract",
        python_callable=extract,
    )

    publish_task = PythonOperator(
        task_id="publish_metrics",
        python_callable=publish_metrics,
    )

    enable_lineage(dag)
    disable_lineage(extract_task)

    extract_task >> publish_task
```

Important behavior from the provider docs:

- `disabled=true` overrides selective enablement and turns everything off
- enabling lineage on a task implicitly enables it on the DAG as well
- disabling DAG-level lineage while enabling task-level lineage can cause errors or inconsistencies because emitted tasks rely on `ParentRunFacet`

## Exclude Specific Operators Globally

If a few operator classes are especially noisy, exclude them through configuration without changing DAG code:

```bash
export AIRFLOW__OPENLINEAGE__DISABLED_FOR_OPERATORS='airflow.providers.standard.operators.bash.BashOperator;airflow.providers.standard.operators.python.PythonOperator'
```

This setting takes semicolon-separated full import paths for operator classes.

## Custom Extractors And Custom Run Facets

When built-in extraction is not enough, you can register your own extractor classes or run facet functions through configuration:

```bash
export AIRFLOW__OPENLINEAGE__EXTRACTORS='my_project.lineage.CustomExtractor'
export AIRFLOW__OPENLINEAGE__CUSTOM_RUN_FACETS='my_project.lineage.get_custom_run_facet'
```

Use this when:

- you run third-party operators that do not expose the lineage metadata you need
- you want extra run metadata added to emitted events

The provider docs state that extractor precedence is:

1. user-registered extractor
2. operator OpenLineage methods
3. inlets and outlets

If none of those exist, you still get general Airflow task and DAG events, but not operator-specific input or output datasets.

## Spark Integration Flags

For supported Spark operators, the provider can inject parent job information and transport information into Spark properties:

```bash
export AIRFLOW__OPENLINEAGE__SPARK_INJECT_PARENT_JOB_INFO="true"
export AIRFLOW__OPENLINEAGE__SPARK_INJECT_TRANSPORT_INFO="true"
```

Use these only when your Spark jobs also participate in OpenLineage and you want parent-child relationships and shared transport configuration propagated automatically.

## Pitfalls

- No transport means no events. Set `transport` or `config_path` first.
- Keep `disable_source_code=true` if Python or Bash task source should not leave the worker in lineage events.
- Keep `include_full_task_info=false` unless you explicitly need full serialized task parameters. Upstream warns this can make events very large.
- `debug_mode=true` is for temporary debugging. It can include extensive environment details.
- Do not rely on legacy `OPENLINEAGE_*` variables for new setups. The provider keeps them only for backward compatibility and warns they may be removed in the future.
- The supported-classes list is useful, but upstream notes it is generated automatically and may not perfectly reflect every hook-level detail. Verify the exact operator or hook path you depend on.

## Version Notes

- This guide is for `apache-airflow-providers-openlineage==2.11.0`.
- Upstream says this provider requires `apache-airflow>=2.11.0`.
- Upstream also says `openlineage-python` can be upgraded independently of Airflow and the provider, and recommends keeping that client current for fixes and features.

## Official Docs

- Provider index: `https://airflow.apache.org/docs/apache-airflow-providers-openlineage/stable/`
- Configuration reference: `https://airflow.apache.org/docs/apache-airflow-providers-openlineage/stable/configurations-ref.html`
- Intro and quickstart: `https://airflow.apache.org/docs/apache-airflow-providers-openlineage/stable/guides/structure.html`
- Supported classes: `https://airflow.apache.org/docs/apache-airflow-providers-openlineage/stable/supported_classes.html`
- Custom operators and extractor precedence: `https://airflow.apache.org/docs/apache-airflow-providers-openlineage/stable/guides/developer.html`
