---
name: mypy-boto3-servicediscovery
description: "Type stubs for boto3 AWS Cloud Map (ServiceDiscovery) clients, paginators, literals, and TypedDict request and response shapes"
metadata:
  languages: "python"
  versions: "1.42.3"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,cloud-map,servicediscovery,boto3,mypy,pyright,type-stubs,python"
---

# `mypy-boto3-servicediscovery` Python Package Guide

## Golden Rule

`mypy-boto3-servicediscovery` adds type information for the `boto3` `servicediscovery` client used by AWS Cloud Map. It is not a runtime SDK, it does not create AWS sessions for you, and it does not manage credentials, regions, or retries. Use `boto3` for real API calls and use this package for editor completion and static checking.

If you want `Session().client("servicediscovery")` to infer automatically, install `boto3-stubs[servicediscovery]`. If you install only the standalone or lite package, annotate `ServiceDiscoveryClient` explicitly.

## Install

Choose one install mode based on how much typing support you want.

### Best inference: full boto3 stubs

```bash
python -m pip install "boto3" "boto3-stubs[servicediscovery]==1.42.3"
```

Use this when you want overloads for `session.client("servicediscovery")` and typed paginator discovery.

### Standalone service package

```bash
python -m pip install "boto3" "mypy-boto3-servicediscovery==1.42.3"
```

Use this when you only want the Cloud Map typing package and are willing to annotate the client yourself.

### Lower-memory lite package

```bash
python -m pip install "boto3" "boto3-stubs-lite[servicediscovery]==1.42.3"
```

The maintainer docs note that lite builds do not provide `session.client()` or `session.resource()` overloads, so explicit annotations are more important.

## Runtime Setup And Auth

This package has no package-specific initialization. Runtime setup is normal `boto3` setup.

Typical environment variables:

```bash
export AWS_PROFILE=dev
export AWS_DEFAULT_REGION=us-east-1
```

Or use direct credentials:

```bash
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_SESSION_TOKEN=...
export AWS_DEFAULT_REGION=us-east-1
```

Then create the real client through `boto3` and annotate it:

```python
from boto3.session import Session
from mypy_boto3_servicediscovery import ServiceDiscoveryClient

session = Session(profile_name="dev", region_name="us-east-1")
servicediscovery: ServiceDiscoveryClient = session.client("servicediscovery")
```

The boto3 credentials guide is the source of truth for the provider chain. The stubs only describe types.

## Core Usage

### Typed client for AWS Cloud Map calls

```python
from boto3.session import Session
from mypy_boto3_servicediscovery.client import ServiceDiscoveryClient

client: ServiceDiscoveryClient = Session(
    profile_name="dev",
    region_name="us-east-1",
).client("servicediscovery")

namespace = client.get_namespace(Id="ns-abc1234567890")
print(namespace["Namespace"]["Name"])
```

Use the boto3 service name `servicediscovery`, not the package name, when creating the client.

### Discover instances with typed request and response shapes

`discover_instances` is the main runtime lookup API for Cloud Map. AWS documents that this call uses `NamespaceName` and `ServiceName`, not namespace or service IDs.

```python
from boto3.session import Session
from mypy_boto3_servicediscovery.client import ServiceDiscoveryClient
from mypy_boto3_servicediscovery.literals import HealthStatusFilterType
from mypy_boto3_servicediscovery.type_defs import (
    DiscoverInstancesRequestTypeDef,
    DiscoverInstancesResponseTypeDef,
)

client: ServiceDiscoveryClient = Session(region_name="us-east-1").client(
    "servicediscovery"
)

health_filter: HealthStatusFilterType = "HEALTHY_OR_ELSE_ALL"

request: DiscoverInstancesRequestTypeDef = {
    "NamespaceName": "example.internal",
    "ServiceName": "orders",
    "HealthStatus": health_filter,
    "QueryParameters": {"stage": "prod"},
}

response: DiscoverInstancesResponseTypeDef = client.discover_instances(**request)

for instance in response.get("Instances", []):
    attrs = instance.get("Attributes", {})
    print(attrs.get("AWS_INSTANCE_IPV4"), attrs.get("AWS_INSTANCE_PORT"))

print(response.get("InstancesRevision"))
```

### List services with a typed paginator

The generated stubs include paginator annotations for Service Discovery list operations.

```python
from boto3.session import Session
from mypy_boto3_servicediscovery.client import ServiceDiscoveryClient
from mypy_boto3_servicediscovery.paginator import ListServicesPaginator

client: ServiceDiscoveryClient = Session(region_name="us-east-1").client(
    "servicediscovery"
)

paginator: ListServicesPaginator = client.get_paginator("list_services")

for page in paginator.paginate():
    for service in page.get("Services", []):
        print(service["Name"], service["Id"])
```

### Create a namespace and service

Cloud Map create operations are asynchronous. The boto3 APIs return an `OperationId`; poll `get_operation` before assuming the namespace or service is ready for later steps.

```python
from boto3.session import Session
from mypy_boto3_servicediscovery.client import ServiceDiscoveryClient
from mypy_boto3_servicediscovery.type_defs import CreateHttpNamespaceRequestTypeDef

client: ServiceDiscoveryClient = Session(region_name="us-east-1").client(
    "servicediscovery"
)

namespace_request: CreateHttpNamespaceRequestTypeDef = {
    "Name": "example.internal",
    "CreatorRequestId": "example-internal-namespace-001",
    "Description": "HTTP namespace for internal service discovery",
}

namespace_response = client.create_http_namespace(**namespace_request)
print(namespace_response["OperationId"])

service_response = client.create_service(
    Name="orders",
    NamespaceId="ns-abc1234567890",
    Type="HTTP",
)
print(service_response["Service"]["Id"])
```

If you are creating DNS-backed services instead of HTTP services, AWS documents `DnsConfig` on `create_service` and service-specific registration attributes such as `AWS_INSTANCE_IPV4` and `AWS_INSTANCE_PORT` on `register_instance`.

### Register an instance with typed Cloud Map attributes

```python
from boto3.session import Session
from mypy_boto3_servicediscovery.client import ServiceDiscoveryClient
from mypy_boto3_servicediscovery.type_defs import RegisterInstanceRequestTypeDef

client: ServiceDiscoveryClient = Session(region_name="us-east-1").client(
    "servicediscovery"
)

request: RegisterInstanceRequestTypeDef = {
    "ServiceId": "srv-p5zdwlg5uvvzjita",
    "InstanceId": "orders-01",
    "Attributes": {
        "AWS_INSTANCE_IPV4": "10.0.2.15",
        "AWS_INSTANCE_PORT": "8080",
    },
    "CreatorRequestId": "orders-01-register-001",
}

response = client.register_instance(**request)
print(response["OperationId"])
```

### Use `TYPE_CHECKING` when stubs are not installed in production

```python
from __future__ import annotations

from typing import TYPE_CHECKING

import boto3

if TYPE_CHECKING:
    from mypy_boto3_servicediscovery.client import ServiceDiscoveryClient

client: "ServiceDiscoveryClient" = boto3.Session(
    region_name="us-east-1"
).client("servicediscovery")
```

This keeps the type information available to mypy and pyright without making the stub package a required runtime dependency.

## Common Pitfalls

- The PyPI package name uses hyphens, but Python imports use underscores: `mypy_boto3_servicediscovery`.
- This package does not install a working AWS client by itself. Keep `boto3` in the environment for runtime calls.
- Automatic `session.client("servicediscovery")` inference comes from `boto3-stubs[servicediscovery]`, not from standalone `mypy-boto3-servicediscovery` or `boto3-stubs-lite[servicediscovery]`.
- `discover_instances` uses namespace and service names. If you pass IDs where names are expected, your request shape may still type-check but the API call will be wrong.
- Cloud Map create and register APIs are asynchronous. A successful `create_http_namespace`, `create_service`, or `register_instance` call usually means "operation accepted", not "ready for immediate discovery".
- For DNS-based services, the attributes passed to `register_instance` must match the service configuration. AWS documents keys such as `AWS_INSTANCE_IPV4`, `AWS_INSTANCE_IPV6`, `AWS_INSTANCE_PORT`, and `AWS_ALIAS_DNS_NAME` for specific DNS record scenarios.
- The Service Discovery boto3 reference documents paginators, but do not assume waiter support unless your pinned boto3 build actually exposes a named waiter for the operation you want.
- `create_service` has important DNS constraints. AWS documents that some DNS record type changes require deleting and recreating the service instead of editing it in place.

## Version-Sensitive Notes

- PyPI lists `mypy-boto3-servicediscovery 1.42.3` and requires Python `>=3.9`.
- The maintainer docs state that the package version matches the related `boto3` version. Keep the stubs and your runtime boto3 line aligned when exact request and response shapes matter.
- The maintainer docs site is generated documentation, not a release-pinned snapshot. Use the docs for API shape discovery, but pin install commands from the exact PyPI release you intend to use.
- The maintainer also documents local generation with `mypy-boto3-builder` when you need stubs that exactly match a locked boto3 version or a custom environment.

## Official Sources

- Docs root: https://youtype.github.io/boto3_stubs_docs/mypy_boto3_servicediscovery/
- Client reference: https://youtype.github.io/boto3_stubs_docs/mypy_boto3_servicediscovery/client/
- Paginators reference: https://youtype.github.io/boto3_stubs_docs/mypy_boto3_servicediscovery/paginators/
- Type definitions reference: https://youtype.github.io/boto3_stubs_docs/mypy_boto3_servicediscovery/type_defs/
- Literals reference: https://youtype.github.io/boto3_stubs_docs/mypy_boto3_servicediscovery/literals/
- Versioning guide: https://youtype.github.io/boto3_stubs_docs/#versioning
- PyPI package page: https://pypi.org/project/mypy-boto3-servicediscovery/
- Exact PyPI release: https://pypi.org/project/mypy-boto3-servicediscovery/1.42.3/
- Boto3 Service Discovery reference: https://docs.aws.amazon.com/boto3/latest/reference/services/servicediscovery.html
- `discover_instances` reference: https://docs.aws.amazon.com/boto3/latest/reference/services/servicediscovery/client/discover_instances.html
- `create_service` reference: https://docs.aws.amazon.com/boto3/latest/reference/services/servicediscovery/client/create_service.html
- `create_http_namespace` reference: https://docs.aws.amazon.com/boto3/latest/reference/services/servicediscovery/client/create_http_namespace.html
- `register_instance` reference: https://docs.aws.amazon.com/boto3/latest/reference/services/servicediscovery/client/register_instance.html
- Boto3 credentials guide: https://boto3.amazonaws.com/v1/documentation/api/latest/guide/credentials.html
