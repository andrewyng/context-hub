---
name: providers-teradata
description: "Apache Airflow Teradata provider for Airflow connections, SQL tasks, stored procedures, and Teradata-to-Teradata transfers"
metadata:
  languages: "python"
  versions: "3.5.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,teradata,sql,database,dag,python"
---

# apache-airflow-providers-teradata

Use `apache-airflow-providers-teradata` when your Airflow deployment needs a Teradata connection type, SQL tasks through `TeradataOperator`, stored procedure execution, or data movement between Teradata systems.

This guide targets provider version `3.5.0`.

## Install

Install the provider into the same Python environment or container image as your Airflow scheduler, webserver, and workers.

The provider requires:

- Python `3.10` through `3.13`
- Apache Airflow `>=2.11.0`
- `apache-airflow-providers-common-compat>=1.12.0`
- `apache-airflow-providers-common-sql>=1.32.0`
- `teradatasql>=17.20.0.28`
- `teradatasqlalchemy>=17.20.0.0`

If you already have Airflow installed, keep `apache-airflow` pinned in the same command so dependency resolution does not silently move your core Airflow version:

```bash
python -m pip install "apache-airflow==3.1.8" "apache-airflow-providers-teradata==3.5.0"
```

If you need provider-specific extras, install them explicitly:

```bash
python -m pip install "apache-airflow==3.1.8" "apache-airflow-providers-teradata[amazon]==3.5.0"
python -m pip install "apache-airflow==3.1.8" "apache-airflow-providers-teradata[microsoft-azure]==3.5.0"
python -m pip install "apache-airflow==3.1.8" "apache-airflow-providers-teradata[ssh]==3.5.0"
python -m pip install "apache-airflow==3.1.8" "apache-airflow-providers-teradata[sqlalchemy]==3.5.0"
```

Use these extras only when you need the matching feature set:

- `amazon`: S3-to-Teradata transfers
- `microsoft-azure`: Azure Blob Storage-to-Teradata transfers
- `ssh`: remote BTEQ or TPT execution over SSH
- `sqlalchemy`: SQLAlchemy engine usage from the hook

## Configure The Airflow Connection

The provider adds the `teradata` connection type. `TeradataHook` uses `teradata_conn_id`, and its default connection id is `teradata_default`.

Connection fields from the provider docs:

- `Host`: required
- `Database`: optional
- `Login`: required
- `Password`: required
- `Extra`: optional JSON dictionary for Teradata-specific parameters

The hook documents port `1025` as the default database port. A practical URI-based connection definition looks like this:

```bash
export AIRFLOW_CONN_TERADATA_DEFAULT='teradata://airflow:secret@td.example.com:1025/analytics?tmode=TERA&sslmode=verify-ca&sslca=%2Fetc%2Fssl%2Fcerts%2Fteradata-ca.pem&query_band=appname%3Dairflow%3Benv%3Dprod%3B'
```

If you create the connection in the Airflow UI, put Teradata-specific settings in `Extra`:

```json
{
  "tmode": "TERA",
  "sslmode": "verify-ca",
  "sslca": "/etc/ssl/certs/teradata-ca.pem",
  "query_band": "appname=airflow;env=prod;"
}
```

Provider-documented `extra` keys include:

- `tmode`: `DEFAULT`, `ANSI`, or `TERA`
- `sslmode`: `disable`, `allow`, `prefer`, `require`, `verify-ca`, or `verify-full`
- `sslca`, `sslcapath`, `sslcipher`, `sslcrc`, `sslprotocol`
- `query_band`: sets the Teradata session QueryBand for each connection

## Run SQL In A DAG

Use `TeradataOperator` for normal DDL, DML, and query tasks.

```python
from airflow import DAG
from airflow.providers.teradata.operators.teradata import TeradataOperator
from pendulum import datetime


with DAG(
    dag_id="teradata_sql_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    create_table = TeradataOperator(
        task_id="create_table",
        teradata_conn_id="teradata_default",
        sql="""
        CREATE MULTISET TABLE customer_stage (
            customer_id INTEGER,
            email VARCHAR(320),
            loaded_at TIMESTAMP
        );
        """,
    )

    insert_rows = TeradataOperator(
        task_id="insert_rows",
        teradata_conn_id="teradata_default",
        sql=[
            """
            INSERT INTO customer_stage (customer_id, email, loaded_at)
            VALUES (1, 'alice@example.com', CURRENT_TIMESTAMP);
            """,
            """
            INSERT INTO customer_stage (customer_id, email, loaded_at)
            VALUES (2, 'bob@example.com', CURRENT_TIMESTAMP);
            """,
        ],
    )

    read_rows = TeradataOperator(
        task_id="read_rows",
        teradata_conn_id="teradata_default",
        sql="SELECT TOP 10 customer_id, email FROM customer_stage;",
    )

    create_table >> insert_rows >> read_rows
```

Notes from the provider docs and API reference:

- `TeradataOperator` subclasses `SQLExecuteQueryOperator`
- `sql=` can be a string, a list of SQL statements, or an external `.sql` file
- `schema=` lets you run the statement against a specific Teradata database
- `autocommit` defaults to `False`

## Call Stored Procedures

Use `TeradataStoredProcedureOperator` when the task needs to execute a Teradata stored procedure. Output parameters can be declared with Python types such as `int` and `str`, or with `"?"` placeholders.

```python
from airflow import DAG
from airflow.providers.teradata.operators.teradata import (
    TeradataOperator,
    TeradataStoredProcedureOperator,
)
from pendulum import datetime


with DAG(
    dag_id="teradata_stored_procedure_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    create_procedure = TeradataOperator(
        task_id="create_procedure",
        teradata_conn_id="teradata_default",
        sql="""
        REPLACE PROCEDURE TEST_PROCEDURE (
            IN val_in INTEGER,
            INOUT val_in_out INTEGER,
            OUT val_out INTEGER,
            OUT value_str_out VARCHAR(100)
        )
        BEGIN
            SET val_out = val_in * 2;
            SET val_in_out = val_in_out * 4;
            SET value_str_out = 'string output';
        END;
        """,
    )

    call_procedure = TeradataStoredProcedureOperator(
        task_id="call_procedure",
        teradata_conn_id="teradata_default",
        procedure="TEST_PROCEDURE",
        parameters=[3, 1, int, str],
    )

    create_procedure >> call_procedure
```

Upstream also documents:

- positional placeholders: `parameters=[3, 1, "?", "?"]`
- dictionary-based parameters when you prefer named arguments
- procedures that return cursors and OUT parameters together

## Use `TeradataHook` In Python Tasks

Use `TeradataHook` when you need direct access to the Teradata connection inside Python code.

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.teradata.hooks.teradata import TeradataHook
from pendulum import datetime


with DAG(
    dag_id="teradata_hook_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def read_summary() -> list[tuple[str, int]]:
        hook = TeradataHook(teradata_conn_id="teradata_default")

        with hook.get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT department_name, COUNT(*)
                FROM employee_stage
                GROUP BY 1
                ORDER BY 1
                """
            )
            return cursor.fetchall()

    read_summary()
```

Provider behavior exposed in the Python API reference:

- `get_conn()` returns a `teradatasql.TeradataConnection`
- the hook supports autocommit and executemany
- `callproc(...)` returns the in/out parameter values as a list or mapping, depending on the input shape
- `get_sqlalchemy_engine()` and related helpers use the hook's `sqlalchemy_url`, which is why the `sqlalchemy` extra matters if you need SQLAlchemy itself installed

## Transfer Rows Between Teradata Systems

Use `TeradataToTeradataOperator` to read from one Teradata connection and insert into another in row chunks.

```python
from airflow import DAG
from airflow.providers.teradata.transfers.teradata_to_teradata import (
    TeradataToTeradataOperator,
)
from pendulum import datetime


with DAG(
    dag_id="teradata_to_teradata_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    transfer_data = TeradataToTeradataOperator(
        task_id="transfer_data",
        source_teradata_conn_id="teradata_source",
        dest_teradata_conn_id="teradata_target",
        destination_table="reporting.customer_stage",
        sql="""
        SELECT customer_id, email, loaded_at
        FROM raw.customer_stage
        """,
        sql_params={},
        rows_chunk=5000,
    )
```

Use this operator for moderate row-copy workflows inside Airflow. `rows_chunk` controls how many rows are committed at a time.

## Object Store And Utility-Based Loads

The provider also ships more specialized operators:

- `S3ToTeradataOperator` for CSV, JSON, and Parquet loads from S3 through Teradata `READ_NOS`
- `AzureBlobStorageToTeradataOperator` for the same pattern from Azure Blob Storage
- `BteqOperator` for SQL or BTEQ scripts through the Teradata `bteq` utility, locally or over SSH
- `DdlOperator` and `TdLoadOperator` for Teradata Parallel Transporter workflows

Important limits and prerequisites from the provider docs:

- `S3ToTeradataOperator` does not support AWS STS temporary credentials in the current provider version
- private S3 or Azure Blob loads require either a Teradata authorization object or matching Airflow cloud credentials
- `BteqOperator` requires the `bteq` binary from Teradata Tools and Utilities on the local host or the SSH target
- `TdLoadOperator` depends on Teradata Parallel Transporter utilities such as `tdload`

## Common Pitfalls

- Install the provider everywhere DAG code runs. One missing worker image is enough to trigger import failures.
- Keep credentials and TLS paths in Airflow connections or a secrets backend, not in DAG source.
- URL-encode all `extra` values when defining `AIRFLOW_CONN_*` variables as URIs.
- `query_band` is passed through as a session setting. If you use it, keep the Teradata format exactly as expected, for example `appname=airflow;env=prod;`.
- The provider is an Airflow integration layer, not a general-purpose Teradata application SDK. Put one-off app code on `teradatasql`; put orchestration logic in Airflow tasks and hooks.
- BTEQ and TPT operators need OS-level Teradata utilities in addition to the Python provider package.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-teradata/stable/`
- Teradata connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-teradata/stable/connections/teradata.html`
- `TeradataHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-teradata/stable/_api/airflow/providers/teradata/hooks/teradata/index.html`
- `TeradataOperator` and `TeradataStoredProcedureOperator`: `https://airflow.apache.org/docs/apache-airflow-providers-teradata/stable/operators/teradata.html`
- `TeradataToTeradataOperator`: `https://airflow.apache.org/docs/apache-airflow-providers-teradata/stable/operators/teradata_to_teradata.html`
- `S3ToTeradataOperator`: `https://airflow.apache.org/docs/apache-airflow-providers-teradata/stable/operators/s3_to_teradata.html`
- `AzureBlobStorageToTeradataOperator`: `https://airflow.apache.org/docs/apache-airflow-providers-teradata/stable/operators/azure_blob_to_teradata.html`
- PyPI package page: `https://pypi.org/project/apache-airflow-providers-teradata/`
