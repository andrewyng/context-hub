---
name: libsql
description: "Turso libSQL client for Python with embedded replicas, batch queries, transactions, and SQLAlchemy integration"
metadata:
  languages: "python"
  versions: "0.1.11"
  revision: 1
  updated-on: "2026-03-11"
  source: community
  tags: "turso,libsql,sqlite,database,embedded-replicas,python"
---

# Turso libSQL Client Coding Guidelines (Python)

You are a Turso database expert. Help write Python code using the official `libsql` package for Turso and libSQL databases.

## Golden Rule: Use the libsql Package

**Package:** `libsql` (PyPI)

**Installation:**
```bash
pip install libsql
```

**CRITICAL:** Do NOT use these deprecated packages:
- `libsql-experimental` — Deprecated since June 2025, replaced by `libsql`
- `libsql-client` — Old HTTP-only client, deprecated API surface
- `libsql_client` — Same as above (underscore variant)

**What is libSQL:** An open-source fork of SQLite with remote database access, embedded replicas, and edge-native features. The Python SDK provides a DB-API 2.0 compatible interface.

## Client Initialization

### Remote Database

```python
import libsql
import os

conn = libsql.connect(
    "libsql://my-database-username.turso.tech",
    auth_token=os.environ["TURSO_AUTH_TOKEN"]
)
```

### Local SQLite File

```python
conn = libsql.connect("local.db")
```

### Embedded Replica (Local + Remote Sync)

```python
conn = libsql.connect(
    "local-replica.db",
    sync_url="libsql://my-database-username.turso.tech",
    auth_token=os.environ["TURSO_AUTH_TOKEN"],
    sync_interval=60  # Auto-sync every 60 seconds
)

# Initial sync on startup
conn.sync()
```

### In-Memory Database

```python
conn = libsql.connect(":memory:")
```

## Execute Queries

### Basic Queries

```python
# Simple query
cursor = conn.execute("SELECT * FROM users")
rows = cursor.fetchall()

# Positional parameters
cursor = conn.execute(
    "SELECT * FROM users WHERE id = ? AND active = ?",
    [1, True]
)
user = cursor.fetchone()

# Named parameters (dict)
cursor = conn.execute(
    "SELECT * FROM users WHERE name = :name AND role = :role",
    {"name": "Alice", "role": "admin"}
)
```

### Result Access

```python
cursor = conn.execute("SELECT id, name, email FROM users")

# Fetch all rows (list of tuples)
all_rows = cursor.fetchall()
for row in all_rows:
    print(row[0], row[1], row[2])  # By index

# Fetch one row
one_row = cursor.fetchone()

# Column names
print(cursor.description)  # List of (name, type_code, ...) tuples
column_names = [desc[0] for desc in cursor.description]
```

### Write Operations

```python
# Insert
cursor = conn.execute(
    "INSERT INTO posts (title, content, author_id) VALUES (?, ?, ?)",
    ["Hello World", "My first post", 1]
)
last_id = cursor.lastrowid
conn.commit()

# Update
cursor = conn.execute(
    "UPDATE posts SET title = ? WHERE id = ?",
    ["Updated Title", last_id]
)
affected = cursor.rowcount
conn.commit()

# Delete
conn.execute("DELETE FROM posts WHERE id = ?", [post_id])
conn.commit()
```

**IMPORTANT:** Always call `conn.commit()` after write operations. Without commit, changes are not persisted.

### Bulk Insert

```python
conn.executemany(
    "INSERT INTO users (name, email) VALUES (?, ?)",
    [
        ("Alice", "alice@example.com"),
        ("Bob", "bob@example.com"),
        ("Charlie", "charlie@example.com"),
    ]
)
conn.commit()
```

## Transactions

### Explicit Transactions

```python
conn.execute("BEGIN")
try:
    conn.execute(
        "UPDATE accounts SET balance = balance - ? WHERE id = ?",
        [amount, from_id]
    )
    conn.execute(
        "UPDATE accounts SET balance = balance + ? WHERE id = ?",
        [amount, to_id]
    )
    conn.commit()
except Exception:
    conn.rollback()
    raise
```

### Context Manager

```python
# Auto-commits on success, auto-rollbacks on exception
with conn:
    conn.execute(
        "INSERT INTO users (name) VALUES (?)",
        ["Alice"]
    )
    conn.execute(
        "INSERT INTO users (name) VALUES (?)",
        ["Bob"]
    )
# Changes are committed automatically here
```

## Schema Management

```python
# Create table
conn.execute("""
    CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT,
        author_id INTEGER REFERENCES users(id),
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT
    )
""")

# Add index
conn.execute("CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id)")

# Multi-statement DDL
conn.executescript("""
    ALTER TABLE posts ADD COLUMN slug TEXT;
    CREATE UNIQUE INDEX idx_posts_slug ON posts(slug);
""")

conn.commit()
```

## Embedded Replicas

Embedded replicas store a local SQLite copy synced with the remote Turso database.

### Architecture

- **Reads:** Served from the local SQLite file (microsecond latency)
- **Writes:** Sent to the remote primary database
- **Sync:** Periodic or manual — pulls changes from remote to local

```python
import libsql
import os

conn = libsql.connect(
    "replica.db",
    sync_url="libsql://my-db-username.turso.tech",
    auth_token=os.environ["TURSO_AUTH_TOKEN"],
    sync_interval=60  # Auto-sync every 60 seconds
)

# Initial sync
conn.sync()

# Reads are instant (local file)
cursor = conn.execute("SELECT * FROM users")
users = cursor.fetchall()

# Writes go to remote primary
conn.execute("INSERT INTO users (name) VALUES (?)", ["Alice"])
conn.commit()

# Pull latest changes
conn.sync()
```

**Use cases:** Server deployments, containerized apps, offline-capable applications, read-heavy workloads.

## ORM Integration

### SQLAlchemy

```bash
pip install sqlalchemy-libsql
```

```python
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, Session

# Remote Turso database
engine = create_engine(
    "sqlite+libsql://my-database-username.turso.tech",
    connect_args={"auth_token": os.environ["TURSO_AUTH_TOKEN"]},
)

# Local SQLite
engine = create_engine("sqlite+libsql:///local.db")

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True)

# Create tables
Base.metadata.create_all(engine)

# Query
with Session(engine) as session:
    users = session.query(User).all()
    session.add(User(name="Alice", email="alice@example.com"))
    session.commit()
```

### Django

```bash
pip install django-turso
```

```python
# settings.py
DATABASES = {
    "default": {
        "ENGINE": "django_turso",
        "NAME": "libsql://my-database-username.turso.tech",
        "OPTIONS": {
            "auth_token": os.environ["TURSO_AUTH_TOKEN"],
        },
    }
}
```

## Error Handling

```python
import libsql

try:
    conn.execute(
        "INSERT INTO users (email) VALUES (?)",
        ["duplicate@example.com"]
    )
    conn.commit()
except libsql.IntegrityError as e:
    # Constraint violation (unique, foreign key, NOT NULL)
    print(f"Constraint error: {e}")
    conn.rollback()
except libsql.OperationalError as e:
    # Connection, SQL syntax, or table not found errors
    if "no such table" in str(e):
        print("Table does not exist")
    elif "network" in str(e).lower():
        print("Network error — check connection")
    else:
        print(f"Operational error: {e}")
    conn.rollback()
except libsql.ProgrammingError as e:
    # Misuse of the API (e.g., executing after close)
    print(f"Programming error: {e}")
```

**Retry pattern for transient errors:**

```python
import time

def with_retry(fn, max_retries=3):
    for attempt in range(max_retries):
        try:
            return fn()
        except libsql.OperationalError as e:
            if "network" in str(e).lower() and attempt < max_retries - 1:
                time.sleep(2 ** attempt)
                continue
            raise
```

## Async Usage

```python
import libsql
import asyncio

async def main():
    conn = libsql.connect(
        "libsql://my-database-username.turso.tech",
        auth_token=os.environ["TURSO_AUTH_TOKEN"]
    )

    cursor = conn.execute("SELECT * FROM users")
    users = cursor.fetchall()

    conn.execute("INSERT INTO users (name) VALUES (?)", ["Alice"])
    conn.commit()

    conn.close()

asyncio.run(main())
```

**IMPORTANT:** The Python `libsql` package uses synchronous I/O internally. For async web frameworks (FastAPI, Starlette), run database operations in a thread pool:

```python
from fastapi import FastAPI
from concurrent.futures import ThreadPoolExecutor
import asyncio

app = FastAPI()
executor = ThreadPoolExecutor(max_workers=4)

def query_users():
    cursor = conn.execute("SELECT * FROM users")
    return cursor.fetchall()

@app.get("/users")
async def get_users():
    loop = asyncio.get_event_loop()
    users = await loop.run_in_executor(executor, query_users)
    return {"users": users}
```

## Useful Links

- Turso documentation: https://docs.turso.tech/
- libsql on PyPI: https://pypi.org/project/libsql/
- libSQL GitHub: https://github.com/tursodatabase/libsql
- Turso CLI reference: https://docs.turso.tech/cli/introduction
- Embedded replicas guide: https://docs.turso.tech/features/embedded-replicas/introduction
- SQLAlchemy dialect: https://github.com/libsql/sqlalchemy-libsql
- Django backend: https://github.com/nichochar/django-turso
