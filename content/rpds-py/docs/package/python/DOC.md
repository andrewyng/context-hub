---
name: package
description: "rpds-py guide for immutable HashTrieMap, HashTrieSet, List, and Queue types in Python"
metadata:
  languages: "python"
  versions: "0.30.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "rpds-py,rpds,python,immutable,persistent-data-structures"
---

# rpds-py Python Package Guide

## Golden Rule

Install `rpds-py`, but import from `rpds`:

```python
from rpds import HashTrieMap, HashTrieSet, List, Queue
```

`rpds-py` provides immutable persistent data structures. Methods that look like updates return new values; they do not modify the original structure in place.

## Install

`rpds-py 0.30.0` on PyPI requires Python 3.10 or newer.

```bash
python -m pip install "rpds-py==0.30.0"
```

Common alternatives:

```bash
uv add "rpds-py==0.30.0"
poetry add "rpds-py==0.30.0"
```

If a wheel is not available for your platform, building from source requires a Rust toolchain.

## Initialization And Environment

There are no environment variables, credentials, or client objects to configure. Import the structure you need and create values directly:

```python
from rpds import HashTrieMap, HashTrieSet, List, Queue

settings = HashTrieMap({"timeout": 10, "region": "us-west-2"})
tags = HashTrieSet(["draft", "internal"])
stack = List()
jobs = Queue()
```

## Common Workflows

### HashTrieMap

Use `HashTrieMap` when you want immutable dictionary-like updates with structural sharing.

```python
from rpds import HashTrieMap

config = HashTrieMap({"timeout": 10, "region": "us-west-2"})

config2 = config.insert("retries", 3)
config3 = config2.update({"timeout": 30, "endpoint": "https://api.example.com"})
config4 = config3.discard("region")

timeout = config3["timeout"]
endpoint = config3.get("endpoint")

print(dict(config3))
```

### HashTrieSet

Use `HashTrieSet` for immutable set membership and add/remove flows.

```python
from rpds import HashTrieSet

features = HashTrieSet(["billing", "search"])

features = features.insert("audit-log")
features = features.update(["exports", "webhooks"])
features = features.discard("search")

if "billing" in features:
    print("billing enabled")

print(set(features))
```

### List

`List` is a persistent linked list. It is most natural for stack-style operations at the front.

```python
from rpds import List as RPDSList

stack = RPDSList()
stack = stack.push_front("third")
stack = stack.push_front("second")
stack = stack.push_front("first")

head = stack.first
tail = stack.drop_first()

print(head)
print(list(stack))
```

Alias the import if you also use Python's built-in `list`.

### Queue

Use `Queue` for FIFO workflows.

```python
from rpds import Queue

jobs = Queue()
jobs = jobs.enqueue("resize-image")
jobs = jobs.enqueue("send-email")

next_job = jobs.peek

if not jobs.is_empty:
    jobs = jobs.dequeue()

print(next_job)
print(list(jobs))
```

## Converting Back To Built-Ins

Convert explicitly before handing values to code that expects standard Python containers:

```python
from rpds import HashTrieMap, HashTrieSet, List as RPDSList, Queue

mapping = HashTrieMap({"a": 1, "b": 2})
tags = HashTrieSet(["x", "y"])
stack = RPDSList().push_front("b").push_front("a")
jobs = Queue().enqueue("first").enqueue("second")

plain_dict = dict(mapping)
plain_set = set(tags)
plain_list = list(stack)
plain_queue = list(jobs)
```

## Common Pitfalls

- The distribution name is `rpds-py`, but the import path is `rpds`.
- Every update returns a new structure. If you do not reassign the result, your change is lost.
- `List` is not a drop-in replacement for Python's built-in `list`; use it when front-of-list operations and immutability matter.
- The hosted docs site currently shows `0.18.1`, while PyPI publishes `0.30.0`. For install requirements and release version, trust the PyPI page for `0.30.0`; for the core API surface, cross-check the maintainer docs and source stubs.
- PyPI metadata for `0.30.0` requires Python 3.10+, while the current source repository has already moved its development branch to Python 3.9+. Do not lower your runtime requirement unless you are targeting a release that actually publishes that change.

## Official Sources

- PyPI package page: https://pypi.org/project/rpds-py/0.30.0/
- Maintainer repository: https://github.com/crate-py/rpds
- README and packaging metadata in source: https://github.com/crate-py/rpds/tree/main
- Hosted API docs: https://rpds.readthedocs.io/en/latest/
