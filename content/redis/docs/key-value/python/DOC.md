---
name: key-value
description: "Redis Python client (redis-py) for key-value storage, caching, and pub/sub messaging"
metadata:
  languages: "python"
  versions: "8.0.0"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "redis,database,cache,key-value,pubsub"
---

# Redis Python Client (redis-py) - Complete Integration Guide

## Golden Rule

Use the official `redis` package (`redis-py`). The current PyPI release is `redis 8.0.0` and it requires Python `>=3.10`. Async support lives at `redis.asyncio`; cluster support lives at `redis.cluster`. Do not pin to deprecated splits like `aioredis` or `redis-py-cluster`.

```bash
pip install "redis==8.0.0"
```

With the hiredis parser:

```bash
pip install "redis[hiredis]==8.0.0"
```

## Install And Environment

```bash
pip install "redis==8.0.0"
pip install "redis[hiredis]==8.0.0"        # faster parser
pip install "redis[ocsp]==8.0.0"           # OCSP cert validation
pip install "redis[otel]==8.0.0"           # OpenTelemetry helpers
```

If your project is still on Python 3.9, `redis 8.0.0` will not install; downgrade to a 7.x release that supports 3.9.

`.env` for typical apps:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password_here
REDIS_DB=0
REDIS_URL=redis://default:your_password_here@localhost:6379/0
```

## Initialize A Client

### `redis.Redis(...)` direct constructor

```python
import redis

r = redis.Redis(host="localhost", port=6379, decode_responses=True)
r.ping()
r.close()
```

### `redis.from_url(...)` (preferred)

A URL lets local, TLS, ACL, and managed setups share one entry point.

```python
import os
import redis

r = redis.from_url(
    os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    decode_responses=True,
    health_check_interval=30,
)

r.ping()
```

Schemes:

- `redis://` plain TCP
- `rediss://` TLS
- `unix://` Unix socket

### Authentication (ACL)

```python
import redis

r = redis.Redis(
    host="redis.example.com",
    port=6379,
    username="default",
    password="your_password",
    db=0,
    decode_responses=True,
)
```

### TLS

```python
import ssl
import redis

r = redis.Redis(
    host="redis.example.com",
    port=6380,
    username="default",
    password="your_password",
    ssl=True,
    ssl_cert_reqs=ssl.CERT_REQUIRED,
    ssl_ca_certs="/etc/ssl/certs/ca-certificates.crt",
    decode_responses=True,
)
```

### Connection pool

```python
import redis

pool = redis.ConnectionPool(
    host="localhost",
    port=6379,
    password="your_password",
    db=0,
    max_connections=10,
    decode_responses=True,
)

r = redis.Redis(connection_pool=pool)
```

### Context manager

```python
with redis.Redis(host="localhost", port=6379, decode_responses=True) as r:
    r.set("key", "value")
    print(r.get("key"))
```

### `decode_responses`

```python
r_bytes = redis.Redis()                          # returns bytes
r_str = redis.Redis(decode_responses=True)       # returns str
```

### RESP3 opt-in

```python
r = redis.Redis(decode_responses=True, protocol=3)
```

Only use `protocol=3` when both the server and the features you call expect RESP3.

## Strings

```python
r.set("key", "value")
value = r.get("key")

r.set("session:123", "user_data", ex=3600)          # EX seconds
r.set("temp:key", "value", px=5000)                 # PX milliseconds
r.set("key", "value", nx=True)                      # only if absent
r.set("key", "new", xx=True)                        # only if present
old = r.set("key", "new", get=True)                 # SET ... GET

r.mset({"k1": "v1", "k2": "v2"})
values = r.mget(["k1", "k2"])

r.set("counter", 0)
r.incr("counter")
r.incrby("counter", 10)
r.incrbyfloat("price", 2.5)
r.decr("counter")
r.decrby("counter", 5)

r.append("message", " World")
r.getrange("message", 0, 4)
r.strlen("message")
r.getdel("temp:key")
r.getex("key", ex=60)
```

## Hashes

```python
r.hset("user:1000", "name", "John Doe")
r.hget("user:1000", "name")

r.hset("user:1000", mapping={
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30,
})

user = r.hgetall("user:1000")

r.hexists("user:1000", "email")
r.hkeys("user:1000")
r.hvals("user:1000")
r.hlen("user:1000")
r.hmget("user:1000", ["name", "email"])
r.hdel("user:1000", "age")
r.hincrby("user:1000", "login_count", 1)
r.hincrbyfloat("user:1000", "balance", 10.50)
r.hsetnx("user:1000", "created", "2026-01-01")

for field, value in r.hscan_iter("user:1000", count=10):
    print(field, value)
```

## Lists

```python
r.rpush("tasks", "task1")
r.rpush("tasks", "task2", "task3")
r.lpush("tasks", "urgent_task")

r.llen("tasks")
r.lrange("tasks", 0, -1)
r.lindex("tasks", 0)

r.rpop("tasks")
r.lpop("tasks")
r.lpop("tasks", count=3)

# Blocking pop
r.blpop("tasks", timeout=10)
r.brpop(["queue1", "queue2"], timeout=5)

r.lset("tasks", 0, "updated_task")
r.linsert("tasks", "BEFORE", "task2", "new_task")
r.lrem("tasks", 0, "task3")             # remove all
r.ltrim("tasks", 0, 9)
r.lmove("source", "destination", "LEFT", "RIGHT")
r.blmove("source", "destination", "RIGHT", "LEFT", timeout=5)
```

## Sets

```python
r.sadd("tags", "javascript")
r.sadd("tags", "nodejs", "redis", "database")

r.sismember("tags", "nodejs")
r.smembers("tags")
r.scard("tags")
r.srem("tags", "database")
r.spop("tags")
r.srandmember("tags", 3)

r.sadd("set1", "a", "b", "c")
r.sadd("set2", "b", "c", "d")

r.sunion("set1", "set2")
r.sunionstore("result", "set1", "set2")
r.sinter("set1", "set2")
r.sinterstore("result", "set1", "set2")
r.sdiff("set1", "set2")
r.sdiffstore("result", "set1", "set2")
r.smove("set1", "set2", "a")
r.smismember("tags", "nodejs", "python", "redis")

for member in r.sscan_iter("tags", match="node*", count=10):
    print(member)
```

## Sorted Sets

```python
r.zadd("leaderboard", {"player1": 100})
r.zadd("leaderboard", {"player2": 200, "player3": 150})

r.zadd("leaderboard", {"player4": 175}, nx=True)
r.zadd("leaderboard", {"player1": 130}, gt=True)

r.zrank("leaderboard", "player1")
r.zrevrank("leaderboard", "player2")
r.zscore("leaderboard", "player2")
r.zcard("leaderboard")
r.zincrby("leaderboard", 50, "player1")

r.zrange("leaderboard", 0, 2)
r.zrange("leaderboard", 0, 2, withscores=True)
r.zrevrange("leaderboard", 0, 2, withscores=True)
r.zrangebyscore("leaderboard", 100, 200, withscores=True)
r.zrangebyscore("leaderboard", 100, "+inf")

r.zcount("leaderboard", 100, 200)
r.zrem("leaderboard", "player1")
r.zremrangebyrank("leaderboard", 0, 1)
r.zremrangebyscore("leaderboard", 0, 100)
r.zpopmax("leaderboard", count=3)
r.zpopmin("leaderboard")
r.bzpopmax(["set1", "set2"], timeout=5)

r.zunionstore("result", {"set1": 2, "set2": 3}, aggregate="MAX")
r.zinterstore("result", ["set1", "set2"], aggregate="SUM")
r.zdiff(["set1", "set2"], withscores=True)
r.zdiffstore("result", ["set1", "set2"])

for member, score in r.zscan_iter("leaderboard", count=10):
    print(member, score)
```

## Key Management

```python
r.exists("mykey")
r.exists("key1", "key2", "key3")           # count

r.delete("mykey")
r.delete("key1", "key2", "key3")

r.expire("mykey", 60)
r.pexpire("mykey", 60_000)

import time
r.expireat("mykey", int(time.time()) + 3600)
r.pexpireat("mykey", int(time.time() * 1000) + 60_000)

r.ttl("mykey")        # -1 no TTL, -2 missing
r.pttl("mykey")
r.persist("mykey")

r.rename("oldkey", "newkey")
r.renamenx("oldkey", "newkey")
r.type("mykey")
r.copy("source", "destination", replace=True)
r.touch("key1", "key2")
r.object("encoding", "mykey")
r.object("idletime", "mykey")
```

### Scanning keys

```python
for key in r.scan_iter(match="user:*", count=100):
    print(key)

for key in r.scan_iter(match="session:*", _type="hash", count=100):
    print(key)
```

Use `scan_iter` instead of `KEYS` in production.

## Pipelines And Transactions

### Pipeline with `MULTI/EXEC`

```python
pipe = r.pipeline(transaction=True)
pipe.set("key", "value")
pipe.get("another-key")
pipe.incr("counter")
results = pipe.execute()
```

### Pipeline without transaction (batching only)

```python
pipe = r.pipeline(transaction=False)
pipe.set("key1", "value1")
pipe.set("key2", "value2")
pipe.get("key1")
results = pipe.execute()
```

### `WATCH` optimistic locking

```python
with r.pipeline() as pipe:
    while True:
        try:
            pipe.watch("balance")
            balance = int(pipe.get("balance") or 0)

            if balance < 100:
                pipe.unwatch()
                break

            pipe.multi()
            pipe.decrby("balance", 100)
            pipe.incrby("purchases", 1)
            pipe.execute()
            break
        except redis.WatchError:
            continue
```

### Chunked pipeline

```python
def batch_set(client, items, chunk=1000):
    keys = list(items.items())
    results = []
    for i in range(0, len(keys), chunk):
        pipe = client.pipeline(transaction=False)
        for k, v in keys[i:i + chunk]:
            pipe.set(k, v)
        results.extend(pipe.execute())
    return results
```

## Pub/Sub

### Subscriber

```python
pubsub = r.pubsub()
pubsub.subscribe("notifications")

for message in pubsub.listen():
    if message["type"] == "message":
        print(message["data"])
```

### Publisher

```python
r.publish("notifications", "Hello, World!")
```

### Multiple channels and patterns

```python
pubsub.subscribe("channel1", "channel2", "channel3")

pubsub.psubscribe("user:*")
for message in pubsub.listen():
    if message["type"] == "pmessage":
        print(message["pattern"], message["channel"], message["data"])
```

### Handlers running in a thread

```python
def on_notification(message):
    print(message["data"])

pubsub = r.pubsub()
pubsub.subscribe(notifications=on_notification)
thread = pubsub.run_in_thread(sleep_time=0.01)

# ... later
thread.stop()
```

### Unsubscribe

```python
pubsub.unsubscribe("channel1")
pubsub.unsubscribe()
pubsub.punsubscribe("user:*")
```

## Streams

```python
entry_id = r.xadd("events", {"user": "alice", "action": "login"})
r.xadd("events", {"user": "charlie"}, maxlen=1000, approximate=True)

for stream, entries in r.xread({"events": "0"}, count=10):
    for entry_id, data in entries:
        print(entry_id, data)

r.xread({"events": "$"}, block=5000)   # blocking read

r.xrange("events", "-", "+", count=100)
r.xrevrange("events", "+", "-", count=10)
r.xlen("events")
r.xinfo_stream("events")

try:
    r.xgroup_create("events", "processors", "0", mkstream=True)
except redis.exceptions.ResponseError:
    pass  # group exists

messages = r.xreadgroup(
    "processors", "consumer1",
    {"events": ">"},
    count=10, block=5000,
)
for stream, entries in messages:
    for entry_id, data in entries:
        r.xack("events", "processors", entry_id)

r.xdel("events", entry_id)
r.xtrim("events", maxlen=1000, approximate=True)
```

## Lua Scripts

```python
script = "return redis.call('SET', KEYS[1], ARGV[1])"
r.eval(script, 1, "mykey", "myvalue")

sha = r.script_load("return redis.call('GET', KEYS[1])")
r.evalsha(sha, 1, "mykey")
r.script_exists(sha)
r.script_flush()
```

Rate limit script:

```python
rate_limit = """
local current = redis.call('INCR', KEYS[1])
if current == 1 then redis.call('EXPIRE', KEYS[1], ARGV[2]) end
if current > tonumber(ARGV[1]) then return 0 else return 1 end
"""

def allowed(user_id, limit=10, window=60):
    return r.eval(rate_limit, 1, f"ratelimit:{user_id}", limit, window) == 1
```

## Geospatial

```python
r.geoadd("locations", -122.4194, 37.7749, "San Francisco")
r.geoadd(
    "locations",
    -118.2437, 34.0522, "Los Angeles",
    -73.9352, 40.7306, "New York",
)

r.geopos("locations", "San Francisco")
r.geodist("locations", "San Francisco", "Los Angeles", unit="mi")
r.georadius("locations", -122.4194, 37.7749, 500, unit="mi")
r.georadiusbymember(
    "locations", "San Francisco", 600, unit="mi",
    withdist=True, withcoord=True,
)
r.geohash("locations", "San Francisco")
```

## HyperLogLog And Bitmaps

```python
r.pfadd("unique:visitors", "user1", "user2", "user3")
r.pfcount("unique:visitors")
r.pfmerge("unique:combined", "unique:day1", "unique:day2")

r.setbit("login:2026-05-29", 100, 1)
r.getbit("login:2026-05-29", 100)
r.bitcount("login:2026-05-29")
r.bitop("AND", "result", "bitmap1", "bitmap2")
r.bitpos("login:2026-05-29", 1)
```

## Server, Database, And Client Management

```python
r.info()
r.info("memory")
r.ping()
r.echo("hi")
r.time()

r.dbsize()
r.flushdb()
r.flushall()
r.save()
r.bgsave()
r.lastsave()
r.bgrewriteaof()

r.client_list()
r.client_id()
r.client_setname("my-app")
r.client_getname()
r.client_info()

r.memory_stats()
r.memory_usage("mykey")
```

## Async via `redis.asyncio`

```python
import asyncio
import redis.asyncio as redis

async def main():
    r = redis.from_url("redis://localhost:6379/0", decode_responses=True)
    try:
        await r.set("key", "value")
        print(await r.get("key"))
    finally:
        await r.aclose()

asyncio.run(main())
```

Close async clients with `await r.aclose()` so the pool releases its sockets.

### Async pipeline

```python
import asyncio
import redis.asyncio as redis

async def pipeline_demo():
    r = redis.from_url("redis://localhost:6379/0", decode_responses=True)
    async with r.pipeline(transaction=True) as pipe:
        await pipe.set("key1", "value1")
        await pipe.set("key2", "value2")
        await pipe.get("key1")
        results = await pipe.execute()
    print(results)
    await r.aclose()

asyncio.run(pipeline_demo())
```

### Async pub/sub

```python
import asyncio
import redis.asyncio as redis

async def reader(pubsub):
    while True:
        message = await pubsub.get_message(ignore_subscribe_messages=True)
        if message is not None:
            print(message["data"])

async def main():
    r = redis.from_url("redis://localhost:6379/0", decode_responses=True)
    async with r.pubsub() as pubsub:
        await pubsub.subscribe("notifications")
        task = asyncio.create_task(reader(pubsub))
        await r.publish("notifications", "Hello Async!")
        await asyncio.sleep(1)
        task.cancel()
    await r.aclose()

asyncio.run(main())
```

## Error Handling

```python
from redis.exceptions import (
    ConnectionError, TimeoutError, ResponseError, DataError, RedisError,
)

r = redis.Redis(
    host="localhost", port=6379,
    socket_connect_timeout=5, socket_timeout=5, retry_on_timeout=True,
)

try:
    r.ping()
except ConnectionError as e:
    print("Connection error:", e)
except TimeoutError as e:
    print("Timeout:", e)
except RedisError as e:
    print("Redis error:", e)
```

### Retry helper

```python
import time

def with_retry(operation, attempts=3):
    for i in range(attempts):
        try:
            return operation()
        except ConnectionError:
            if i == attempts - 1:
                raise
            time.sleep(2 ** i)

result = with_retry(lambda: r.get("mykey"))
```

## Connection Pooling

```python
pool = redis.ConnectionPool(
    host="localhost",
    port=6379,
    password="your_password",
    db=0,
    max_connections=50,
    socket_timeout=5,
    socket_connect_timeout=5,
    socket_keepalive=True,
    decode_responses=True,
)

c1 = redis.Redis(connection_pool=pool)
c2 = redis.Redis(connection_pool=pool)
```

## Sentinel And Cluster

### Sentinel

```python
from redis.sentinel import Sentinel

sentinel = Sentinel(
    [("sentinel-1", 26379), ("sentinel-2", 26379)],
    socket_timeout=0.5,
    username="default",
    password="secret",
)

client = sentinel.master_for("mymaster", decode_responses=True)
client.ping()
```

### Cluster

```python
from redis.cluster import RedisCluster, ClusterNode

cluster = RedisCluster(
    startup_nodes=[
        ClusterNode("localhost", 7000),
        ClusterNode("localhost", 7001),
        ClusterNode("localhost", 7002),
    ],
    decode_responses=True,
)

cluster.set("user-profile:{42}", "ready")
print(cluster.get("user-profile:{42}"))
```

Use hash tags such as `{42}` when multi-key commands must land on the same slot.

## Complete Application Example

```python
import json
import os
import time
from typing import Any, Optional

import redis
from dotenv import load_dotenv

load_dotenv()

class RedisManager:
    def __init__(self):
        self.pool = redis.ConnectionPool(
            host=os.getenv("REDIS_HOST", "localhost"),
            port=int(os.getenv("REDIS_PORT", "6379")),
            password=os.getenv("REDIS_PASSWORD"),
            db=int(os.getenv("REDIS_DB", "0")),
            max_connections=10,
            decode_responses=True,
        )
        self.client = redis.Redis(connection_pool=self.pool)

    def cache_get(self, key: str) -> Optional[Any]:
        raw = self.client.get(key)
        return json.loads(raw) if raw else None

    def cache_set(self, key: str, value: Any, ttl: int = 3600) -> None:
        self.client.set(key, json.dumps(value), ex=ttl)

    def invalidate(self, pattern: str) -> None:
        keys = list(self.client.scan_iter(match=pattern))
        if keys:
            self.client.delete(*keys)

    def track_activity(self, user_id: str, action: str) -> None:
        key = f"activity:{user_id}:{time.strftime('%Y-%m-%d')}"
        self.client.rpush(key, json.dumps({"action": action, "ts": time.time()}))
        self.client.expire(key, 86400 * 7)

    def increment_pageview(self, page_id: str) -> int:
        return self.client.incr(f"pageviews:{page_id}")

    def leaderboard_add(self, user_id: str, score: float) -> None:
        self.client.zadd("leaderboard", {user_id: score})

    def leaderboard_top(self, count: int = 10):
        return [
            {"user_id": user, "score": score}
            for user, score in self.client.zrevrange(
                "leaderboard", 0, count - 1, withscores=True,
            )
        ]

    def rate_limit(self, key: str, limit: int = 10, window: int = 60) -> bool:
        now = int(time.time())
        pipe = self.client.pipeline()
        pipe.zremrangebyscore(key, 0, now - window)
        pipe.zcard(key)
        pipe.zadd(key, {str(now): now})
        pipe.expire(key, window)
        _, count, *_ = pipe.execute()
        return count < limit

    def close(self) -> None:
        self.client.close()


if __name__ == "__main__":
    mgr = RedisManager()
    mgr.cache_set("user:1000", {"name": "John"}, ttl=3600)
    print(mgr.cache_get("user:1000"))
    mgr.increment_pageview("page:home")
    mgr.leaderboard_add("user:1", 500)
    mgr.leaderboard_add("user:2", 750)
    print(mgr.leaderboard_top(3))
    mgr.close()
```

## Common Pitfalls

- Responses are `bytes` by default; set `decode_responses=True` if your app expects `str`.
- Use `redis.asyncio` for async; the standalone `aioredis` package is deprecated.
- Use `redis.cluster.RedisCluster` for cluster; the standalone `redis-py-cluster` package is deprecated.
- `SELECT` is not exposed on the client; choose the DB via URL or constructor.
- RESP3 is opt-in with `protocol=3`; default clients use RESP2.
- `scan_iter` is the production-safe alternative to `KEYS`.
- In cluster mode, multi-key commands require the keys to hash to the same slot; use hash tags.
- Search, JSON, time series, and vector commands require Redis Stack or server-side modules.

## Version Notes

- `redis 8.0.0` is the current PyPI release.
- Requires Python `>=3.10`. For Python 3.9, pin to the 7.x line.
- Docs root: https://redis.readthedocs.io/en/stable/.
- PyPI: https://pypi.org/project/redis/.
