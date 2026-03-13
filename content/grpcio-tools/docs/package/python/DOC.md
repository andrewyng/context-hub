---
name: package
description: "grpcio-tools package guide for generating Python protobuf modules and gRPC stubs from .proto files"
metadata:
  languages: "python"
  versions: "1.78.0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "grpcio-tools,grpc,protobuf,protoc,python,codegen"
---

# grpcio-tools Python Package Guide

Use `grpcio-tools` to compile `.proto` files into Python protobuf message modules and gRPC service stubs. The PyPI package name is `grpcio-tools`, but the command module you run is `grpc_tools`.

## Golden Rule

- Use `grpcio-tools` for code generation, not as the gRPC runtime.
- Generate all Python outputs from the same command: `--python_out`, `--pyi_out`, and `--grpc_python_out`.
- Install the runtime packages separately in any environment that imports the generated files: `protobuf` for `*_pb2.py` and `grpcio` for `*_pb2_grpc.py`.

## Install

Code generation only:

```bash
python -m pip install "grpcio-tools==1.78.0"
```

Runtime dependencies for applications that import generated code:

```bash
python -m pip install "protobuf" "grpcio==1.78.0"
```

If one environment both generates and runs the code, install all three:

```bash
python -m pip install "protobuf" "grpcio==1.78.0" "grpcio-tools==1.78.0"
```

## Initialization And Auth

`grpcio-tools` is a local compiler wrapper around `protoc` and the Python gRPC plugin. It does not create a client, does not open network connections, and has no package-specific authentication or environment-variable setup.

Authentication and channel setup belong to the generated gRPC client or server you run with `grpcio`.

## Minimal `.proto` File

```proto
syntax = "proto3";

package helloworld;

service Greeter {
  rpc SayHello(HelloRequest) returns (HelloReply) {}
}

message HelloRequest {
  string name = 1;
}

message HelloReply {
  string message = 1;
}
```

Save this as `protos/helloworld.proto`.

## Generate Python Code

Set an explicit proto root and output directory so the generated imports stay predictable:

```bash
export PROTO_ROOT=./protos
export PY_OUT=./src

python -m grpc_tools.protoc \
  -I"$PROTO_ROOT" \
  --python_out="$PY_OUT" \
  --pyi_out="$PY_OUT" \
  --grpc_python_out="$PY_OUT" \
  "$PROTO_ROOT/helloworld.proto"
```

This writes:

- `src/helloworld_pb2.py` for protobuf messages and descriptors
- `src/helloworld_pb2.pyi` for typing information
- `src/helloworld_pb2_grpc.py` for the gRPC stub, servicer base class, and server registration helper

## Use The Generated Files

After generation, import the message module and the gRPC helper module together:

```python
import helloworld_pb2
import helloworld_pb2_grpc
```

The gRPC helper module imports the protobuf module, so both files need to stay importable on the same Python module path.

## Minimal Server

This requires `grpcio` in the runtime environment.

```python
from concurrent import futures

import grpc

import helloworld_pb2
import helloworld_pb2_grpc


class Greeter(helloworld_pb2_grpc.GreeterServicer):
    def SayHello(self, request, context):
        return helloworld_pb2.HelloReply(message=f"Hello, {request.name}")


def serve() -> None:
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    helloworld_pb2_grpc.add_GreeterServicer_to_server(Greeter(), server)
    server.add_insecure_port("[::]:50051")
    server.start()
    server.wait_for_termination()


if __name__ == "__main__":
    serve()
```

## Minimal Client

Use an environment variable for the target address so the client can move between local development and deployed environments without code changes:

```bash
export GREETER_ADDR=localhost:50051
```

```python
import os

import grpc

import helloworld_pb2
import helloworld_pb2_grpc


target = os.environ.get("GREETER_ADDR", "localhost:50051")

with grpc.insecure_channel(target) as channel:
    stub = helloworld_pb2_grpc.GreeterStub(channel)
    reply = stub.SayHello(helloworld_pb2.HelloRequest(name="Ada"))
    print(reply.message)
```

For production traffic, switch to `grpc.secure_channel(...)` and the credential helpers documented in the gRPC auth guide.

## Common Pitfalls

- `pip install grpcio-tools`, but run `python -m grpc_tools.protoc`.
- `grpcio-tools` does not run RPC clients or servers by itself. Generated `*_pb2_grpc.py` files expect the `grpcio` runtime.
- `*_pb2.py` and `*_pb2_grpc.py` are a pair. If one moves or lands in a different import root, the generated imports break.
- Output paths matter. Run generation from a stable working directory and keep `-I` and the output directories aligned with your Python package layout.
- If your project needs package-prefixed generated imports, use the custom `-Ipackage=...` mapping documented in the Python basics tutorial instead of patching the generated files manually.

## Version Notes

- This entry covers PyPI package version `1.78.0`.
- The gRPC documentation site and the PyPI package page can move on different patch cadences. If you are debugging generated-code differences, compare the installed package version with the version shown in the hosted Python docs.

## Official Sources

- gRPC Python landing page: https://grpc.io/docs/languages/python/
- gRPC Python basics tutorial: https://grpc.io/docs/languages/python/basics/
- gRPC Python generated-code reference: https://grpc.io/docs/languages/python/generated-code/
- gRPC Python API landing page: https://grpc.io/docs/languages/python/api/
- Canonical hosted Python API docs: https://grpc.github.io/grpc/python/
- PyPI package page: https://pypi.org/project/grpcio-tools/
