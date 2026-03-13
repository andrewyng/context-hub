---
name: package
description: "smart-open streams local and remote files through a single file-like open() API for Python"
metadata:
  languages: "python"
  versions: "7.5.1"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "python,smart-open,streaming,files,s3"
---

# smart-open Python Package Guide

`smart_open` gives Python code one `open()`-style API for local files and URI-based backends. Use `smart_open.open()` when your application should read or write text and bytes the same way regardless of where the object lives.

This guide focuses on the common `smart_open.open()` workflow and the S3-backed configuration pattern most apps need.

## Install

Install `smart-open` and the SDK for any remote backend you use.

```bash
pip install smart-open boto3
```

For S3-compatible storage such as MinIO or LocalStack, keep using `boto3`; configure the endpoint on the client you pass to `smart_open`.

## Import And Core API

Prefer the module-qualified call in new code so it is obvious when you are using `smart_open` instead of Python's built-in `open`:

```python
import smart_open

with smart_open.open("/tmp/example.txt", "r", encoding="utf-8") as fin:
    print(fin.read())
```

Use text modes (`"r"`, `"w"`, `"rt"`, `"wt"`) with `encoding=` for strings, and binary modes (`"rb"`, `"wb"`) for bytes.

## Read Local And HTTP Resources

Local paths and HTTP(S) URLs use the same API surface:

```python
import smart_open

with smart_open.open("/tmp/input.jsonl", "r", encoding="utf-8") as fin:
    for line in fin:
        print(line.rstrip())

with smart_open.open("https://example.com/data.txt", "r", encoding="utf-8") as fin:
    print(fin.readline())
```

For large payloads, iterate over the stream instead of calling `read()` unless you actually need the full body in memory.

## Read And Write S3 With Default Credentials

For S3, `smart_open` relies on the normal `boto3` credential chain. In practice that means you should configure credentials the same way you would for any `boto3` application:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN` when using temporary credentials
- `AWS_DEFAULT_REGION`

Prefer IAM roles or your platform's standard AWS credential source over hard-coded keys.

```python
import os
import smart_open

bucket = os.environ["APP_BUCKET"]
uri = f"s3://{bucket}/reports/daily.txt"

with smart_open.open(uri, "w", encoding="utf-8") as fout:
    fout.write("hello from smart-open\n")

with smart_open.open(uri, "r", encoding="utf-8") as fin:
    print(fin.read())
```

## Pass An Explicit Boto3 Client

Pass a preconfigured client through `transport_params` when you need a specific profile, region, retry policy, or custom S3-compatible endpoint.

```python
import os

import boto3
import smart_open

session = boto3.Session(
    profile_name=os.getenv("AWS_PROFILE"),
    region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"),
)

s3_client = session.client(
    "s3",
    endpoint_url=os.getenv("S3_ENDPOINT_URL"),
)

uri = f"s3://{os.environ['APP_BUCKET']}/exports/items.jsonl"

with smart_open.open(
    uri,
    "w",
    encoding="utf-8",
    transport_params={"client": s3_client},
) as fout:
    fout.write('{"id": 1, "name": "example"}\n')

with smart_open.open(
    uri,
    "r",
    encoding="utf-8",
    transport_params={"client": s3_client},
) as fin:
    print(fin.readline().rstrip())
```

This pattern is the right place to set `endpoint_url` for MinIO or LocalStack and to keep auth, retries, and region selection centralized in one client object.

## Work With Compressed Files

`smart_open` can transparently handle common compressed filenames, so the same `open()` call works for streaming compressed text.

```python
import smart_open

uri = "s3://my-bucket/events/2026-03-12.jsonl.gz"

with smart_open.open(uri, "wt", encoding="utf-8") as fout:
    fout.write('{"event": "started"}\n')
    fout.write('{"event": "finished"}\n')

with smart_open.open(uri, "rt", encoding="utf-8") as fin:
    for line in fin:
        print(line.rstrip())
```

Use binary mode if you need raw compressed bytes rather than decompressed text.

## Common Pitfalls

- Prefer `smart_open.open()` in new code. Older examples may use legacy helper names.
- Always close the stream with a `with` block; remote writes are finalized when the handle closes.
- Do not mix text data with binary modes. If you write strings, use text mode and set `encoding`.
- When auth fails on cloud backends, debug the underlying SDK configuration first; `smart_open` depends on that provider client.
- Treat object storage writes as whole-object writes. If your workflow needs in-place mutation or true append semantics, write a new object instead.

## Official Sources

- Maintainer documentation: https://github.com/piskvorky/smart_open
- Package registry: https://pypi.org/project/smart-open/
