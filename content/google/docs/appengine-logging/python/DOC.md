---
name: appengine-logging
description: "google-cloud-appengine-logging package guide for Python code that models App Engine request-log messages"
metadata:
  languages: "python"
  versions: "1.8.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,appengine,logging,cloud-logging,protobuf,python"
---

# google-cloud-appengine-logging Python Package Guide

## What It Is

`google-cloud-appengine-logging` is the Python package for the App Engine logging protobuf types under `google.appengine.logging.v1`.

In practice, this package is useful when your code needs to model or inspect App Engine request-log data as typed Python messages:

- `RequestLog`
- `LogLine`
- `SourceLocation`
- `SourceReference`

This is not the package you use to write normal application logs from an App Engine service. Google documents that App Engine already emits request logs automatically, and for app logs it recommends Cloud Logging integration or structured `stdout` / `stderr`.

This guide covers `1.8.0`.

## Install

```bash
python -m pip install "google-cloud-appengine-logging==1.8.0"
```

Common alternatives:

```bash
uv add "google-cloud-appengine-logging==1.8.0"
poetry add "google-cloud-appengine-logging==1.8.0"
```

PyPI lists support for Python 3.7 and newer.

## Authentication And Environment

You do not need credentials or Google Cloud environment variables just to construct or inspect these protobuf messages.

If you are reading real App Engine logs from Google Cloud, Google says to use one of these paths:

- call the Cloud Logging API through a client library
- call the Cloud Logging REST API directly
- export logs through a sink such as Pub/Sub

For those flows, use normal Google Cloud auth:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="your-project-id"
```

Or with a service account key:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
export GOOGLE_CLOUD_PROJECT="your-project-id"
```

## Import The Message Types

```python
from google.cloud.appengine_logging_v1.types import (
    LogLine,
    RequestLog,
    SourceLocation,
    SourceReference,
)
```

The published Python reference for this package currently surfaces these generated message types rather than a higher-level logging client.

## Build A `RequestLog`

Use `RequestLog` when you need a typed representation of one App Engine request and its child app log lines.

```python
from datetime import datetime, timezone

from google.cloud.appengine_logging_v1.types import (
    LogLine,
    RequestLog,
    SourceLocation,
    SourceReference,
)
from google.protobuf.duration_pb2 import Duration
from google.protobuf.timestamp_pb2 import Timestamp

started = Timestamp()
started.FromDatetime(datetime.now(timezone.utc))

latency = Duration(seconds=0, nanos=125_000_000)

request_log = RequestLog(
    app_id="my-project-id",
    module_id="default",
    version_id="20260313t120000",
    request_id="67d2d4b100ff7e0b9b0d6b1d0001735a",
    method="GET",
    resource="/healthz",
    http_version="HTTP/1.1",
    status=200,
    host="my-project.uc.r.appspot.com",
    trace_id="105445aa7843bc8bf206b120001000",
    trace_sampled=True,
    start_time=started,
    latency=latency,
    line=[
        LogLine(
            log_message="health check passed",
            source_location=SourceLocation(
                file="main.py",
                line=17,
                function_name="healthz",
            ),
        )
    ],
    source_reference=[
        SourceReference(
            repository="https://github.com/example/my-app",
            revision_id="abc123def456",
        )
    ],
)

print(request_log.status)
print(request_log.line[0].log_message)
```

Fields worth knowing from the official schema:

- `RequestLog` includes request metadata such as `method`, `resource`, `status`, `latency`, `host`, `trace_id`, and repeated `line`
- `LogLine` includes `time`, `severity`, `log_message`, and `source_location`
- `SourceLocation` includes `file`, `line`, and `function_name`
- `SourceReference` includes `repository` and `revision_id`

## Read App Log Lines From A Request

Each `RequestLog` can contain child application log lines in `line`.

```python
from google.cloud.appengine_logging_v1.types import RequestLog


def summarize_request(log: RequestLog) -> dict[str, object]:
    return {
        "request_id": log.request_id,
        "path": log.resource,
        "status": log.status,
        "trace_id": log.trace_id,
        "messages": [entry.log_message for entry in log.line],
    }
```

If you need source-aware output, use `source_location` when it is present:

```python
for entry in request_log.line:
    location = entry.source_location
    print(f"{location.file}:{location.line} {entry.log_message}")
```

## What To Use For Real App Engine Logging

Use this package for typed App Engine request-log data.

Do not use it as your primary logging integration for an App Engine app. Google’s App Engine logging docs say:

- request logs are created automatically
- app logs should be written through Cloud Logging integration or structured `stdout` / `stderr`
- programmatic log reads should go through Cloud Logging client libraries, REST, or an export sink

For most App Engine services, that means:

- write logs with `google-cloud-logging` or structured `stdout`
- read live logs with Cloud Logging
- use `google-cloud-appengine-logging` only if you specifically need the App Engine request-log message schema in Python

## Common Pitfalls

- Package name and import path differ. Install `google-cloud-appengine-logging`, import from `google.cloud.appengine_logging_v1.types`.
- Do not add this package expecting it to replace `google-cloud-logging`. They solve different problems.
- Do not try to write App Engine request logs yourself. App Engine creates them automatically.
- If you need to fetch real logs from Google Cloud, this package is only one part of the workflow. You still need a log-reading path such as Cloud Logging or a sink export.
- The Google Python reference pages for this package lag the current PyPI release in some places. Use PyPI for exact version pinning and the protobuf reference pages for field names.

## Official Links

- PyPI: https://pypi.org/project/google-cloud-appengine-logging/
- Maintainer package directory: https://github.com/googleapis/google-cloud-python/tree/main/packages/google-cloud-appengine-logging
- Python reference root: https://cloud.google.com/python/docs/reference/appenginelogging/latest
- Python `types` package reference: https://cloud.google.com/python/docs/reference/appenginelogging/latest/google.cloud.appengine_logging_v1.types
- App Engine logging guide: https://cloud.google.com/appengine/docs/standard/writing-application-logs
- Cloud Logging RPC schema for `google.appengine.logging.v1`: https://docs.cloud.google.com/logging/docs/reference/v2/rpc/google.appengine.logging.v1
- REST `RequestLog` schema: https://docs.cloud.google.com/logging/docs/reference/v1beta3/rest/v1beta3/RequestLog
