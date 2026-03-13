---
name: package
description: "Prefect Redis integration for configuring Redis-backed blocks and using Redis connections inside Python flows"
metadata:
  languages: "python"
  versions: "0.2.8"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "prefect,redis,python,workflow,orchestration,blocks,cache"
---

# Prefect Redis Python Package Guide

## Golden Rule

Use `prefect-redis` as a Prefect integration package, not as a replacement for core `prefect`. The usual pattern is:

- write flows and tasks with `prefect`
- configure Redis connectivity with a `prefect-redis` block
- load that block inside flows when you want a reusable Redis connection definition

If you only need one-off local code, you can instantiate the block directly in Python. If you want to save and reload named blocks, your environment must also be connected to a real Prefect API.

## Install

Install the integration package version this guide covers:

```bash
python -m pip install "prefect-redis==0.2.8"
```

Common alternatives:

```bash
uv add prefect-redis
poetry add prefect-redis
```

If your project does not already include Prefect, install it too:

```bash
python -m pip install prefect prefect-redis
```

Sanity-check the package install:

```bash
python -m pip show prefect-redis
python -c "import prefect_redis; print(prefect_redis.__file__)"
```

## Prerequisites And Environment

Before using the integration, make sure:

- a Redis server is reachable from the process that runs your flow
- the flow environment has the Redis host, port, and any required credentials
- `PREFECT_API_URL` is set if you want to save or load named Prefect blocks
- `PREFECT_API_KEY` is also set when you use Prefect Cloud

Example environment variables:

```bash
export REDIS_HOST="127.0.0.1"
export REDIS_PORT="6379"
export REDIS_DB="0"
export REDIS_USERNAME="default"   # optional
export REDIS_PASSWORD="secret"    # optional

export PREFECT_API_URL="https://api.prefect.cloud/api/accounts/<account-id>/workspaces/<workspace-id>"
export PREFECT_API_KEY="pnu_..."
```

For a local self-hosted Prefect server instead of Cloud:

```bash
prefect server start
prefect config set PREFECT_API_URL="http://127.0.0.1:4200/api"
```

There is no separate `prefect-redis` token. Authentication is whatever your Redis server requires plus normal Prefect API settings when you store blocks in Prefect.

## Initialize A Redis Block

`prefect-redis` does not introduce a separate long-lived SDK client object for your app. The common entry point is a block such as `RedisDatabase`, then a Redis client retrieved from that block.

```python
import os

from prefect_redis import RedisDatabase


redis_block = RedisDatabase(
    host=os.environ["REDIS_HOST"],
    port=int(os.getenv("REDIS_PORT", "6379")),
    db=int(os.getenv("REDIS_DB", "0")),
    username=os.getenv("REDIS_USERNAME"),
    password=os.getenv("REDIS_PASSWORD"),
)

client = redis_block.get_client()

client.ping()
client.set("healthcheck", "ok")

value = client.get("healthcheck")
print(value)

client.close()
```

Use this pattern when the connection details come from process environment or other local configuration and you do not need a saved block in Prefect yet.

## Save And Reuse A Named Block

When multiple flows, deployments, or environments should share the same Redis connection definition, save the block in Prefect and load it by name.

```python
import os

from prefect_redis import RedisDatabase


redis_block = RedisDatabase(
    host=os.environ["REDIS_HOST"],
    port=int(os.getenv("REDIS_PORT", "6379")),
    db=int(os.getenv("REDIS_DB", "0")),
    username=os.getenv("REDIS_USERNAME"),
    password=os.getenv("REDIS_PASSWORD"),
)

redis_block.save("redis-dev", overwrite=True)
```

Load and use that block later:

```python
from prefect_redis import RedisDatabase


redis_block = RedisDatabase.load("redis-dev")
client = redis_block.get_client()

client.set("app:last-run", "2026-03-12T00:00:00Z")
print(client.get("app:last-run"))

client.close()
```

What matters here:

- `save(...)` and `load(...)` depend on Prefect block storage, so they require a working Prefect API configuration.
- Direct instantiation of `RedisDatabase(...)` does not require Prefect Cloud or a self-hosted server.

## Use Redis Inside A Flow

Load the block inside tasks or flows where the Redis connection is actually needed.

```python
from prefect import flow, task
from prefect_redis import RedisDatabase


@task
def write_status(run_id: str) -> None:
    redis_block = RedisDatabase.load("redis-dev")
    client = redis_block.get_client()
    client.set(f"flow-run:{run_id}:status", "running")
    client.close()


@task
def read_status(run_id: str):
    redis_block = RedisDatabase.load("redis-dev")
    client = redis_block.get_client()
    value = client.get(f"flow-run:{run_id}:status")
    client.close()
    return value


@flow(log_prints=True)
def redis_cache_demo(run_id: str = "demo-1"):
    write_status(run_id)
    print(read_status(run_id))


if __name__ == "__main__":
    redis_cache_demo()
```

This is a good fit for simple status markers, cache entries, idempotency keys, or coordination state that already belongs in Redis.

## Common Pitfalls

- Installing `prefect-redis` does not replace `prefect`; you still use core Prefect for `@flow`, `@task`, deployments, workers, and configuration.
- Saving a block with `save(...)` can work only when `PREFECT_API_URL` points to a reachable Prefect API.
- Redis credentials belong in environment variables, secret management, or Prefect blocks, not hard-coded in flow source.
- The returned Redis client may give you `bytes` values for reads such as `get(...)`; decode them in your application if you need plain strings.
- A flow can use Redis locally without Prefect Cloud, but loading blocks by name depends on a real Prefect server or Cloud workspace.
- Older Prefect examples may refer to Prefect 2 agent workflows. For current orchestration patterns, prefer Prefect 3 deployments, work pools, workers, and blocks.

## Version Notes For `prefect-redis` 0.2.8

- This guide covers the PyPI package version `0.2.8`.
- Treat `prefect-redis` as an integration package layered on top of core Prefect instead of a standalone workflow framework.
- Redis server versioning is separate from the Python integration version; pin the Python package version your project expects and configure Redis compatibility at the infrastructure level.

## Official Sources Used

- Docs root: `https://docs.prefect.io/v3/`
- Integrations root: `https://docs.prefect.io/integrations/`
- Blocks concept docs: `https://docs.prefect.io/v3/concepts/blocks`
- Settings and profiles: `https://docs.prefect.io/v3/concepts/settings-and-profiles`
- Python reference root: `https://reference.prefect.io/`
- PyPI package page: `https://pypi.org/project/prefect-redis/`
