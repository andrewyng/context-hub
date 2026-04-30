---
name: db
description: "QuantRocket DB module - database management, S3 backup/restore, SQLite utilities, and disk space management"
metadata:
  languages: "python"
  versions: "2.11.0.0"
  revision: 1
  updated-on: "2026-03-19"
  source: community
  tags: "quantrocket,database,sqlite,s3,backup,restore"
---

# quantrocket.db

Database management: list databases, S3 backup/restore, SQLite utilities.

## Import

```python
from quantrocket.db import (
    list_databases,
    get_s3_config,
    set_s3_config,
    s3_push_databases,
    s3_pull_databases,
    optimize_databases,
    connect_sqlite,
    insert_or_fail,
    insert_or_replace,
    insert_or_ignore,
)
```

## List Databases

```python
from quantrocket.db import list_databases

dbs = list_databases()                          # {"sqlite": [...], "postgres": [...]}
dbs = list_databases(services=["history"])       # filter by service
dbs = list_databases(detail=True)                # include size, path
```

## S3 Backup/Restore

```python
from quantrocket.db import set_s3_config, s3_push_databases, s3_pull_databases

set_s3_config(
    access_key_id="AKIA...", secret_access_key="...",
    bucket="my-backups", region="us-east-1",
)

s3_push_databases()
s3_push_databases(services=["history"], codes=["my-db"])
s3_pull_databases()
s3_pull_databases(force=True)                    # overwrite local
```

## SQLite Utilities

```python
from quantrocket.db import connect_sqlite, insert_or_replace, insert_or_ignore
import pandas as pd

engine = connect_sqlite("/path/to/database.sqlite")  # SQLAlchemy engine
df = pd.read_sql("SELECT * FROM my_table LIMIT 10", engine)
insert_or_replace(df, "my_table", engine)
insert_or_ignore(df, "my_table", engine)
```

## Optimize

```python
from quantrocket.db import optimize_databases
optimize_databases()                             # VACUUM all
optimize_databases(services=["history"])          # specific service
```

## CLI Equivalents

```bash
quantrocket db list
quantrocket db list --services 'history' --detail
quantrocket db s3config --access-key-id 'AKIA...' --bucket 'my-backups'
quantrocket db s3-push
quantrocket db s3-pull --force
quantrocket db optimize
```
