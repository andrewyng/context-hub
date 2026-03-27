---
name: mypy-boto3-route53resolver
description: "mypy-boto3-route53resolver package guide for typed boto3 Route 53 Resolver clients, paginators, literals, and TypedDicts"
metadata:
  languages: "python"
  versions: "1.42.10"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,boto3,route53resolver,dns,mypy,pyright,stubs,python"
---

# mypy-boto3-route53resolver Python Package Guide

## Golden Rule

Use `boto3` for real Route 53 Resolver API calls and `mypy-boto3-route53resolver` only for typing. If you want `Session.client("route53resolver")` to infer automatically, install `boto3-stubs[route53resolver]`. If you install only the standalone package or the lite bundle, annotate `Route53ResolverClient` explicitly.

## Version-Sensitive Notes

- The PyPI package page for `mypy-boto3-route53resolver` shows version `1.42.10`, release date `2025-12-15`, `Requires: Python >=3.9`, and `Typing :: Stubs Only`.
- The maintainer project states that `mypy-boto3-route53resolver` uses the same version as the related `boto3` release. Keep the stub package close to your runtime `boto3` version so request and response shapes do not drift.
- The maintainer docs recommend local generation with `mypy-boto3-builder` when you need stubs that exactly match the `boto3` version already pinned in your environment.
- The Route 53 Resolver boto3 reference documents a low-level client and paginators for this service. I did not find a Route 53 Resolver service resource or waiters section in the published service reference, so plan around typed clients and paginators.

## Install

Choose one install mode based on how much boto3 typing support you want.

### Best inference: full boto3 stubs

Use this when you want `Session.client("route53resolver")` overloads and editor inference without extra casts:

```bash
python -m pip install "boto3-stubs[route53resolver]==1.42.10"
```

### Service-specific package only

Use this when you only need Route 53 Resolver types and are willing to annotate the client explicitly:

```bash
python -m pip install "boto3==1.42.10" "mypy-boto3-route53resolver==1.42.10"
```

### Lower-memory alternative

Use this when the full stubs package is too heavy for your IDE:

```bash
python -m pip install "boto3-stubs-lite[route53resolver]==1.42.10"
```

The maintainer docs note that the lite package does not provide `session.client/resource` overloads, so explicit annotations become more important.

## Initialization And AWS Config

`mypy-boto3-route53resolver` does not add its own auth or transport layer. Runtime behavior still comes from normal boto3 configuration:

- credentials passed directly to `boto3.client(...)` or `boto3.Session(...)`
- environment variables such as `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`, `AWS_PROFILE`, and `AWS_DEFAULT_REGION`
- shared AWS config and credentials files
- assume-role, IAM Identity Center, container credentials, or IAM roles
- `botocore.config.Config` for retries, proxies, and other client settings

Typical local setup:

```bash
export AWS_PROFILE=networking-dev
export AWS_DEFAULT_REGION=us-east-1
```

Route 53 Resolver is regional, so set `region_name` on the session or in your AWS config.

```python
from boto3.session import Session
from botocore.config import Config
from mypy_boto3_route53resolver import Route53ResolverClient

session = Session(profile_name="networking-dev", region_name="us-east-1")

route53resolver: Route53ResolverClient = session.client(
    "route53resolver",
    config=Config(retries={"max_attempts": 10, "mode": "standard"}),
)
```

## Core Usage

### Typed client

Use the generated client type for helpers that create or accept a Route 53 Resolver client:

```python
from boto3.session import Session
from mypy_boto3_route53resolver import Route53ResolverClient

route53resolver: Route53ResolverClient = Session(
    profile_name="networking-dev",
    region_name="us-east-1",
).client("route53resolver")

response = route53resolver.list_resolver_endpoints()

for endpoint in response.get("ResolverEndpoints", []):
    print(endpoint["Id"], endpoint["Direction"], endpoint.get("Name"))
```

### Typed paginator

The generated paginator module includes Route 53 Resolver paginator types such as `ListResolverEndpointsPaginator`, `ListResolverRulesPaginator`, and `ListTagsForResourcePaginator`.

```python
from boto3.session import Session
from mypy_boto3_route53resolver import Route53ResolverClient
from mypy_boto3_route53resolver.paginator import ListResolverRulesPaginator

client: Route53ResolverClient = Session(region_name="us-east-1").client(
    "route53resolver"
)

paginator: ListResolverRulesPaginator = client.get_paginator("list_resolver_rules")

for page in paginator.paginate():
    for rule in page.get("ResolverRules", []):
        print(rule["Id"], rule["DomainName"], rule["RuleType"])
```

### Associate a resolver rule with a VPC

Use the real boto3 client call and let the stub package validate argument names and types:

```python
from boto3.session import Session
from mypy_boto3_route53resolver import Route53ResolverClient

client: Route53ResolverClient = Session(region_name="us-east-1").client(
    "route53resolver"
)

client.associate_resolver_rule(
    ResolverRuleId="rslvr-rr-0123456789abcdef0",
    Name="corp-example-com",
    VPCId="vpc-0123456789abcdef0",
)
```

### Create and tag a resolver endpoint

The boto3 service reference exposes `create_resolver_endpoint` with `Direction`, `SecurityGroupIds`, `IpAddresses`, and optional `Tags`. You can keep tag payloads typed with `TagTypeDef`:

```python
from boto3.session import Session
from mypy_boto3_route53resolver import Route53ResolverClient
from mypy_boto3_route53resolver.type_defs import TagTypeDef

client: Route53ResolverClient = Session(region_name="us-east-1").client(
    "route53resolver"
)

tags: list[TagTypeDef] = [
    {"Key": "env", "Value": "dev"},
    {"Key": "owner", "Value": "dns-team"},
]

client.create_resolver_endpoint(
    CreatorRequestId="resolver-endpoint-001",
    Name="outbound-main",
    SecurityGroupIds=["sg-0123456789abcdef0"],
    Direction="OUTBOUND",
    IpAddresses=[
        {"SubnetId": "subnet-0123456789abcdef0"},
        {"SubnetId": "subnet-0fedcba9876543210"},
    ],
    Tags=tags,
)
```

If you already have a resource ARN and only need to tag it later:

```python
from boto3.session import Session
from mypy_boto3_route53resolver import Route53ResolverClient
from mypy_boto3_route53resolver.type_defs import TagTypeDef

client: Route53ResolverClient = Session(region_name="us-east-1").client(
    "route53resolver"
)

tags: list[TagTypeDef] = [{"Key": "env", "Value": "dev"}]

client.tag_resource(
    ResourceArn="arn:aws:route53resolver:us-east-1:123456789012:resolver-rule/rslvr-rr-0123456789abcdef0",
    Tags=tags,
)
```

## Runtime-Safe Typing Pattern

If your production environment does not install stub packages, keep imports behind `TYPE_CHECKING` so your type checker sees them without making them a runtime dependency:

```python
from __future__ import annotations

from typing import TYPE_CHECKING

from boto3.session import Session

if TYPE_CHECKING:
    from mypy_boto3_route53resolver import Route53ResolverClient
else:
    Route53ResolverClient = object

client: "Route53ResolverClient" = Session(region_name="us-east-1").client(
    "route53resolver"
)
```

The `else` assignment is the upstream `pylint` workaround for names imported only under `TYPE_CHECKING`.

## Common Pitfalls

- The PyPI package name uses hyphens, but Python imports use underscores: `mypy_boto3_route53resolver`.
- This package is typing-only. Real Route 53 Resolver requests still come from `boto3`.
- `boto3-stubs-lite[route53resolver]` is more RAM-friendly, but it does not provide `session.client/resource` overloads.
- Route 53 Resolver is regional. Static typing does not protect you from `NoRegionError` or from pointing at the wrong region.
- The AWS service reference lists paginators for Route 53 Resolver, but not a service-specific waiters section. If later automation depends on a resource reaching a specific state, poll the relevant `get_*` or `list_*` operation yourself.
- If the published stub version lags behind your pinned `boto3` runtime, generate stubs locally with `mypy-boto3-builder` instead of mixing mismatched versions.

## Official Sources

- Maintainer docs root: `https://youtype.github.io/boto3_stubs_docs/mypy_boto3_route53resolver/`
- PyPI package page: `https://pypi.org/project/mypy-boto3-route53resolver/`
- Boto3 Route 53 Resolver service reference: `https://docs.aws.amazon.com/boto3/latest/reference/services/route53resolver.html`
- `list_resolver_rules` reference: `https://docs.aws.amazon.com/boto3/latest/reference/services/route53resolver/client/list_resolver_rules.html`
- `create_resolver_endpoint` reference: `https://docs.aws.amazon.com/boto3/latest/reference/services/route53resolver/client/create_resolver_endpoint.html`
- `associate_resolver_rule` reference: `https://docs.aws.amazon.com/boto3/latest/reference/services/route53resolver/client/associate_resolver_rule.html`
- `tag_resource` reference: `https://docs.aws.amazon.com/boto3/latest/reference/services/route53resolver/client/tag_resource.html`
- Boto3 credentials guide: `https://docs.aws.amazon.com/boto3/latest/guide/credentials.html`
- Boto3 configuration guide: `https://docs.aws.amazon.com/boto3/latest/guide/configuration.html`
