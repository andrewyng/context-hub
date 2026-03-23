---
name: package
description: "Kinetica Python API package guide for connecting to Kinetica database and working with tables, distributed I/O, vector search, table monitors, DB-API 2.0, SQL, and DataFrame APIs"
metadata:
  languages: "python"
  versions: "7.2.3.7"
  revision: 1
  updated-on: "2026-03-22"
  source: maintainer
  tags: "kinetica,gpudb,python,database,analytics,sql,vector search,pandas,distributed I/O,table-monitor,dbapi"
---

# Kinetica Python API Package Guide

## Golden Rule

Use `gpudb` for Python projects that talk to a Kinetica database. This is the
Kinetica-maintained client and the primary Python driver. The client version
must match the server's major.minor version (e.g. client `7.2.x.y` with server
`7.2.*.*`). When versions do not match, the API will print a warning, and there
may be breaking changes.

Do not simply copy `gpudb.py` into your project. The package includes a compiled
C extension (`protocol.*.so`) for high-performance Avro encoding/decoding that
must be installed.

## Install

```bash
pip3 install gpudb
```

With optional DataFrame support (pandas, tqdm, typeguard):

```bash
pip3 install "gpudb[dataframe]"
```

From a local checkout:

```bash
pip3 install .
pip3 install ".[dataframe]"
```

If you get an `externally-managed-environment` error, use a virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip3 install gpudb
```

## Create a Client

### Basic local connection

```python
import gpudb

kdb = gpudb.GPUdb("http://localhost:9191", username = "<username>", password = "<password>")

result = kdb.show_system_status()
print(result)
```

### Authenticated connection with options

```python
import gpudb

opts = gpudb.GPUdb.Options()
opts.username = "<username>"
opts.password = "<password>"

kdb = gpudb.GPUdb("http://localhost:9191", options = opts)
```

### HTTPS connection with SSL cert bypass

```python
import gpudb

opts = gpudb.GPUdb.Options()
opts.username = "<username>"
opts.password = "<password>"
opts.skip_ssl_cert_verification = True
opts.logging_level = "DEBUG"

kdb = gpudb.GPUdb("https://your-server:8082/gpudb-0", options = opts)
```

### High-availability with multiple URLs

Pass a list of cluster URLs. The client will fail over to backup clusters automatically:

```python
import gpudb

opts = gpudb.GPUdb.Options()
opts.username = "<username>"
opts.password = "<password>"

kdb = gpudb.GPUdb(["https://cluster1:8082/gpudb-0", "https://cluster2:8082/gpudb-0"], options = opts)
```

### Context manager usage

```python
import gpudb

opts = gpudb.GPUdb.Options()
opts.username = "<username>"
opts.password = "<password>"

with gpudb.GPUdb("http://localhost:9191", options = opts) as kdb:
    result = kdb.show_system_status()
    print(result)
```

## Core Table Workflow

### Create a type and table with `GPUdbTable`

`GPUdbTable` is the high-level table abstraction. Pass a column definition list,
a table name, and a database connection to create the table:

```python
import gpudb

columns = [
    ["city", "string", "char64"],
    ["state", gpudb.GPUdbRecordColumn._ColumnType.STRING, gpudb.GPUdbColumnProperty.CHAR32],
    ["country", "string", "char64"],
    ["x", "double"],
    ["y", "double"],
    ["avg_temp", "double"],
]

table = gpudb.GPUdbTable(columns, "weather", db = kdb)
```

To reference an existing table, pass named parameters, eliminating the column
list:

```python
existing_table = gpudb.GPUdbTable(name = "weather", db = kdb)
```

### Insert records

Insert a single record as an `OrderedDict`:

```python
import collections

record = collections.OrderedDict()
record["city"] = "Paris"
record["state"] = "--"
record["country"] = "France"
record["x"] = 2.3508
record["y"] = 48.8567
record["avg_temp"] = 56.5

table.insert_records(record)
```

Insert multiple records as a list of lists:

```python
records = [
    ["Oslo", "--", "Norway", 10.75, 59.95, 45.5],
    ["Lagos", "Lagos", "Nigeria", 3.384, 6.455, 83.0],
    ["Sydney", "New South Wales", "Australia", 151.209, -33.865, 63.5],
]

table.insert_records(records)
```

### Retrieve records

Use `GPUdbTable.get_records()` for direct iteration:

```python
for record in table.get_records(offset = 0, limit = 10):
    print(record["city"], record["avg_temp"])
```

Use slicing on a `GPUdbTable`:

```python
for record in table[0:10]:
    print(record["city"])
```

Use the low-level `GPUdb` interface with JSON encoding:

```python
response = kdb.get_records(
    table_name="weather",
    offset=0,
    limit=10,
    encoding="json",
    options={"sort_by": "city"},
)

import json
for rec_json in response["records_json"]:
    rec = json.loads(rec_json)
    print(rec["city"], rec["avg_temp"])
```

### Aggregate and group by

Calculate, for a given column, various statistic types:

```python
stats = table.aggregate_statistics("avg_temp", "count,min,max,mean")
print(stats["stats"])

unique = table.aggregate_unique("city", offset = 0, limit = 25)
for city in unique.data["city"]:
    print(city)

grouped = table.aggregate_group_by(
    column_names=["country", "count(country)"],
    offset=0,
    limit=25,
)
for country, count in zip(grouped.data["country"], grouped.data["count(country)"]):
    print(f"{country}: {count}")
```

### Delete records

Delete records from a table using a list of independent expressions:

```python
table.delete_records(["x < -50 and y < -50", "y > 50"])
```

### Drop (clear) a table

```python
kdb.clear_table("weather", options = {"no_error_if_not_exists": "true"})
```

## Distributed (Multi-Head) Ingestion

For tables with primary or shard key columns under heavy ingestion loads,
distributed ingestion sends records directly to the appropriate worker rank;
note that the shard key column must either have an explicit index applied or be
the primary key also, in which case an implicit index is applied:

```python
import gpudb

columns = [
    ["city", "string", "char64"],
    ["state", "string", "char2", "shard_key"],
    ["country", "string", "char64"],
    ["x", "double"],
    ["y", "double"],
]

table = gpudb.GPUdbTable(
    columns,
    "sharded_weather",
    db = kdb,
    use_multihead_io = True,
    multihead_ingest_batch_size = 10000
)

records = [
    ["Paris", "TX", "USA", -95.55, 33.66],
    ["Oslo", "--", "Norway", 10.75, 59.95],
]
table.insert_records(records)

# Flush remaining buffered records
table.flush_data_to_server()
```

### Distributed (Multi-Head) Record Retrieval

Retrieve records directly from worker ranks using shard keys; note that the
shard key column must either have an explicit index applied or be the primary
key also, in which case an implicit index is applied:

```python
table = gpudb.GPUdbTable(None, "sharded_weather", db = kdb, use_multihead_io = True)
result = table.get_records_by_key(["TX"])
```

## DataFrame Support

Requires `pip install "gpudb[dataframe]"`.

### SQL query to DataFrame

```python
from gpudb.gpudb_dataframe import DataFrameUtils

df = DataFrameUtils.sql_to_df(
    db = kdb,
    sql = "SELECT * FROM weather WHERE country = 'USA'",
    batch_size = 5000,
    show_progress = True,
)
print(df.head())
```

### Table to DataFrame

```python
df = DataFrameUtils.table_to_df(db = kdb, table_name = "test", show_progress = True)
```

### DataFrame to table

```python
import pandas as pd
from gpudb.gpudb_dataframe import DataFrameUtils

df = pd.DataFrame({
    "city": ["Berlin", "Tokyo"],
    "country": ["Germany", "Japan"],
    "avg_temp": [48.5, 58.0],
})

table = DataFrameUtils.df_to_table(
    df = df,
    db = kdb,
    table_name = "cities_from_df",
    clear_table = True,
    show_progress = True,
)
```

## DB-API 2.0 (PEP 249)

### Synchronous usage

```python
from gpudb.dbapi import connect

con = connect(
    "kinetica://",
    url = "http://localhost:9191",
    username = "<username>",
    password = "<password>",
    default_schema = "ki_home",
    options = {"skip_ssl_cert_verification": True},
)

con.execute("""
    CREATE TABLE my_table (
        "id" INTEGER NOT NULL,
        "name" VARCHAR NOT NULL
    ) USING TABLE PROPERTIES (no_error_if_exists = TRUE)
""")

# Parameterized insert (supports $1/$2, :1/:2, ?, and %s styles)
con.execute("INSERT INTO my_table (id, name) VALUES ($1, $2)", [1, "alpha"])

cursor = con.execute("SELECT * FROM my_table")

# Iteration
for row in cursor:
    print(row)

# Or fetch methods
cursor = con.execute("SELECT * FROM my_table")
rows = cursor.fetchmany(100)
row = cursor.fetchone()

con.close()
```

### Async usage

```python
import asyncio
from gpudb.dbapi import aconnect

async def main():
    con = aconnect(
        "kinetica://",
        url = "http://localhost:9191",
        username = "<username>",
        password = "<password>",
    )

    await con.execute("INSERT INTO my_table (id, name) VALUES ($1, $2)", [2, "beta"])

    cursor = await con.execute("SELECT * FROM my_table")

    async for row in cursor.records():
        print(row)

    rows = await cursor.fetchmany(100)

    await con.close()

asyncio.run(main())
```

## Configuration And Connection Notes

Common `GPUdb.Options` properties:

- `username` and `password` — authentication credentials
- `encoding` — `"BINARY"` (default) or `"JSON"`
- `skip_ssl_cert_verification` — set `True` to bypass SSL certificate checks
- `logging_level` — `"DEBUG"`, `"INFO"`, `"WARNING"`, etc.
- `disable_auto_discovery` — prevent the client from querying server for cluster topology; disables distributed operations
- `disable_failover` — prevent automatic HA failover
- `ha_failover_order` — `GPUdb.HAFailoverOrder.SEQUENTIAL` (default) or `RANDOM`
- `primary_url` — explicitly set the primary cluster URL
- `timeout` — request timeout (`None` for indefinite)
- `server_connection_timeout` — timeout for initial server connection
- `initial_connection_attempt_timeout` — timeout for the very first connection attempt
- `http_headers` — dict of custom HTTP headers
- `host_manager_port` — port for the host manager (default `9300`)
- `hostname_regex` — regex to filter cluster hostnames returned by server during auto-discovery
- `oauth_token` — OAuth token for authentication
- `failback_options` — configure automatic fail-back behavior via `FailbackOptions`

The client defaults to:

- `http://127.0.0.1:9191` when `host` is omitted
- Port `9191` for HTTP
- Port `8082` is typical for HTTPS behind a proxy

### Logging

```python
# At connection time
opts = gpudb.GPUdb.Options()
opts.logging_level = "DEBUG"
db = gpudb.GPUdb(host="http://localhost:9191", options = opts)

# After connection
import logging

db.set_client_logger_level(logging.DEBUG)
```

## Common Pitfalls

- The client version must match the server's major.minor version. A `7.2.x.y`
  client will warn and may break against a `7.1` or `7.3` server.
- Do not copy `gpudb.py` alone. The compiled C extension (`protocol.*.so`) is
  required for the binary encoding to work.
- The `protocol.*.so` C extension is compiled for a specific Python version.
  Rebuild it with `build/make-protocol-so.sh` when switching Python versions.
- Do not run Python from the repository root directory. The `protocol/` source
  directory can shadow the compiled `protocol` module import.
- `GPUdbTable` uses binary encoding by default. Set `options.encoding = "JSON"`
  only if you need human-readable transport at the cost of performance.
- Distributed (multi-head) ingestion buffers records. Always call
  `table.flush_data_to_server()` or `ingestor.flush()` when done to ensure all
  records are sent.
- `GPUdbTableMonitor.Client` uses internal threads. Account for thread safety if
  your application is also multi-threaded. Use a `Queue` for inter-thread
  communication.
- The DB-API `connect()` and `aconnect()` functions use the `"kinetica://"`
  scheme, not a host URL. Pass the actual server URL via the `url` keyword
  argument.
- DB-API parameter styles cannot be mixed in a single query. Use `$1, $2`
  (numeric_dollar), `:1, :2` (numeric), `?, ?` (qmark), or `%s, %f` (format)
  consistently.
- DataFrame methods (`sql_to_df`, `df_to_table`, etc.) require the `[dataframe]`
  extra to be installed (`pandas`, `tqdm`, `typeguard`).

## Version-Sensitive Notes For 7.2.3.7

- `7.2.3.7` is the current release as of March 11, 2026.
- Python 3.8 through 3.14 are supported. Python 3.14 support was added in this release.
- Since `7.2.3.6`, the default HA failover mode is `SEQUENTIAL` instead of `RANDOM`.
- Since `7.2.3.4`, the DBAPI supports the full range of `GPUdb.Options` connection options.
- Since `7.2.3.3`, the DBAPI supports `default_schema` and custom `http_headers`.
- Since `7.2.3.2`, 12-byte decimals and unsigned long array types are supported.

## Official Sources

- Kinetica website: `https://www.kinetica.com/`
- Documentation: `https://docs.kinetica.com/latest/`
- Python API docs: `https://docs.kinetica.com/latest/api/python/`
- Python tutorial: `https://docs.kinetica.com/latest/guides/python_guide/`
- PyPI package page: `https://pypi.org/project/gpudb/`
- GitHub issues: `https://github.com/kineticadb/kinetica-api-python/issues`
- Community Slack: `https://join.slack.com/t/kinetica-community/shared_invite/zt-1bt9x3mvr-uMKrXlSDXfy3oU~sKi84qg`
