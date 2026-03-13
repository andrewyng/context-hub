---
name: package
description: "grpcio-status package guide for sending and decoding structured google.rpc.status.Status errors in Python gRPC applications"
metadata:
  languages: "python"
  versions: "1.78.0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "grpcio-status,grpc,python,status,errors,protobuf"
---

# grpcio-status Python Package Guide

Use `grpcio-status` when you need structured gRPC errors in Python instead of plain status strings. The PyPI package is `grpcio-status`, and the import you use in code is `from grpc_status import rpc_status`.

## Golden Rule

- Use `grpcio-status` only for non-OK RPC failures that need structured error details.
- Build a `google.rpc.status_pb2.Status`, then convert it with `rpc_status.to_status(...)` before aborting the RPC.
- On the client, decode rich error metadata with `rpc_status.from_call(...)` or `await rpc_status.aio.from_call(...)` instead of parsing trailing metadata yourself.

## Install

If you want the status-mapping helpers and the gRPC runtime in the same environment, install matching versions:

```bash
python -m pip install "grpcio==1.78.0" "grpcio-status==1.78.0"
```

If your environment already pins `grpcio`, install just the helper package:

```bash
python -m pip install "grpcio-status==1.78.0"
```

`grpcio-status` works with protobuf message types from `google.rpc`, so your app also needs generated protobuf support available in the environment. In most setups, pip resolves the needed packages automatically.

## What The Package Does

`grpcio-status` is a small bridge between:

- gRPC transport status values such as `grpc.StatusCode.INVALID_ARGUMENT`
- `google.rpc.status.Status` protobuf messages
- trailing metadata under the `grpc-status-details-bin` key

It does not create channels, authenticate requests, or generate stubs. Use `grpcio` for runtime channels and servers, and `grpcio-tools` if you need to generate `_pb2.py` and `_pb2_grpc.py` files from `.proto` definitions.

## Initialization And Auth

`grpcio-status` has no package-specific authentication and no required environment variables.

Channel credentials, TLS configuration, and per-request auth metadata still belong to `grpcio`. A practical pattern is to keep the target address in an environment variable and initialize the gRPC client normally:

```bash
export GRPC_TARGET=localhost:50051
```

```python
import os

import grpc

target = os.environ.get("GRPC_TARGET", "localhost:50051")
channel = grpc.insecure_channel(target)
```

For production traffic, switch to `grpc.secure_channel(...)` and your normal credential setup.

## Return Rich Errors From A Server

The server-side flow is:

1. Create one or more structured detail messages.
2. Pack each detail into `google.protobuf.any_pb2.Any`.
3. Build a `google.rpc.status_pb2.Status` with a non-OK code.
4. Abort the RPC with `context.abort_with_status(rpc_status.to_status(...))`.

Example using `google.rpc.error_details_pb2.BadRequest`:

```python
from google.protobuf.any_pb2 import Any
from google.rpc import error_details_pb2, status_pb2
from grpc_status import rpc_status
import grpc


def abort_invalid_email(context) -> None:
    bad_request = error_details_pb2.BadRequest()
    violation = bad_request.field_violations.add()
    violation.field = "email"
    violation.description = "must be a valid email address"

    detail = Any()
    detail.Pack(bad_request)

    rich_status = status_pb2.Status(
        code=grpc.StatusCode.INVALID_ARGUMENT.value[0],
        message="request validation failed",
        details=[detail],
    )

    context.abort_with_status(rpc_status.to_status(rich_status))
```

If you already have generated service code, call that helper from your servicer method:

```python
class UsersService(users_pb2_grpc.UsersServicer):
    def CreateUser(self, request, context):
        if "@" not in request.email:
            abort_invalid_email(context)

        return users_pb2.CreateUserResponse(user_id="usr_123")
```

## Decode Rich Errors On A Sync Client

`rpc_status.from_call(call)` reads the trailing metadata from a completed `grpc.Call` and returns a `google.rpc.status_pb2.Status` message when the server sent one.

```python
import os

import grpc
from google.rpc import error_details_pb2
from grpc_status import rpc_status

import users_pb2
import users_pb2_grpc


target = os.environ.get("GRPC_TARGET", "localhost:50051")

with grpc.insecure_channel(target) as channel:
    stub = users_pb2_grpc.UsersStub(channel)

    try:
        stub.CreateUser(
            users_pb2.CreateUserRequest(email="not-an-email"),
            timeout=5,
        )
    except grpc.RpcError as exc:
        rich_status = rpc_status.from_call(exc)

        if rich_status is None:
            print(exc.code(), exc.details())
            raise

        print(rich_status.code, rich_status.message)

        for detail in rich_status.details:
            bad_request = error_details_pb2.BadRequest()
            if detail.Unpack(bad_request):
                for violation in bad_request.field_violations:
                    print(violation.field, violation.description)
```

`rich_status.code` is the integer protobuf code. If you also need the Python gRPC enum, use `exc.code()` from the original exception.

## Decode Rich Errors On An AsyncIO Client

For AsyncIO calls, keep a reference to the `grpc.aio` call object. The async helper expects the call, not the caught `grpc.aio.AioRpcError` snapshot:

```python
import asyncio
import os

import grpc
from google.rpc import error_details_pb2
from grpc_status import rpc_status

import users_pb2
import users_pb2_grpc


async def main() -> None:
    target = os.environ.get("GRPC_TARGET", "localhost:50051")

    async with grpc.aio.insecure_channel(target) as channel:
        stub = users_pb2_grpc.UsersStub(channel)
        call = stub.CreateUser(
            users_pb2.CreateUserRequest(email="not-an-email"),
            timeout=5,
        )

        try:
            await call
        except grpc.aio.AioRpcError as exc:
            rich_status = await rpc_status.aio.from_call(call)

            if rich_status is None:
                print(exc.code(), exc.details())
                raise

            print(rich_status.code, rich_status.message)

            for detail in rich_status.details:
                error_info = error_details_pb2.ErrorInfo()
                if detail.Unpack(error_info):
                    print(error_info.reason, error_info.domain)


asyncio.run(main())
```

## Common Pitfalls

- `grpcio-status` is not a full error-handling framework. It only maps between gRPC status data and `google.rpc.status.Status` messages.
- `rpc_status.to_status(...)` is for non-OK termination paths. Do not build an `OK` status and abort the RPC with it.
- `rpc_status.from_call(...)` returns `None` when the server did not send rich status metadata.
- `rpc_status.from_call(...)` and `rpc_status.aio.from_call(...)` can raise `ValueError` if the protobuf status code or message does not match the transport-level gRPC code or details.
- Do not hand-roll the `grpc-status-details-bin` metadata value. Use `rpc_status.to_status(...)` on the server and `from_call(...)` on the client.
- Keep your generated protobuf types aligned with the detail messages you unpack. If the server packs `BadRequest`, the client needs `error_details_pb2.BadRequest` available to decode it.

## Version Notes

- This entry covers PyPI package version `1.78.0`.
- The package API shown here is small and centered on `grpc_status.rpc_status.to_status`, `grpc_status.rpc_status.from_call`, and `grpc_status.rpc_status.aio.from_call`.
- The helper APIs are documented by gRPC Python as experimental, so check the hosted Python API docs if you are upgrading across gRPC releases.

## Official Sources

- gRPC Python landing page: https://grpc.io/docs/languages/python/
- gRPC error handling guide: https://grpc.io/docs/guides/error/
- gRPC status codes guide: https://grpc.io/docs/guides/status-codes/
- Hosted gRPC Python API docs: https://grpc.github.io/grpc/python/
- PyPI package page: https://pypi.org/project/grpcio-status/
