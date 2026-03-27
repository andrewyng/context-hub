---
name: mypy-boto3-bedrock-agent-runtime
description: "mypy-boto3-bedrock-agent-runtime guide for typed boto3 Agents for Bedrock Runtime clients, request/response TypedDicts, and paginator usage"
metadata:
  languages: "python"
  versions: "1.42.3"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,bedrock,boto3,mypy,pyright,python,stubs,agents"
---

# mypy-boto3-bedrock-agent-runtime Python Package Guide

## What It Is

`mypy-boto3-bedrock-agent-runtime` provides generated type annotations for the `boto3` Agents for Amazon Bedrock Runtime client.

Use it when you want:

- a typed `Session.client("bedrock-agent-runtime")`
- generated request and response `TypedDict` definitions from `type_defs`
- paginator types from `paginator`
- literal types for constrained string values from `literals`

It is a stubs-only package. Real AWS calls still run through `boto3` and `botocore`.

## Golden Rule

- Install `boto3` for runtime behavior.
- Install either `mypy-boto3-bedrock-agent-runtime` or the `boto3-stubs[bedrock-agent-runtime]` extra for typing.
- Keep `boto3`, `botocore`, and the stubs in the same release family when possible.
- Configure credentials, region, retries, and endpoints through normal `boto3` configuration.

## Install

Pin the runtime SDK and the stub package together when you want reproducible type coverage:

```bash
python -m pip install "boto3==1.42.3" "mypy-boto3-bedrock-agent-runtime==1.42.3"
```

The maintainer docs also support the umbrella extras:

```bash
python -m pip install "boto3-stubs[bedrock-agent-runtime]"
python -m pip install "boto3-stubs-lite[bedrock-agent-runtime]"
```

Use `boto3-stubs-lite` if the full overload-heavy package slows down your editor. The maintainer docs note that the lite variant does not provide `session.client()` and `session.resource()` overloads, so explicit annotations matter more.

## Authentication And Region

This package does not change AWS authentication. Use the same environment variables and shared config files that `boto3` expects:

```bash
export AWS_PROFILE=bedrock-dev
export AWS_DEFAULT_REGION=us-east-1

# Or explicit credentials when needed
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_SESSION_TOKEN=...  # temporary credentials only
```

AWS documents a full credential provider chain for `boto3`, including explicit parameters, environment variables, assume-role providers, IAM Identity Center, shared config files, container credentials, and EC2 instance metadata.

## Initialize A Typed Client

Create the client with normal `boto3` session setup, then annotate it as `AgentsforBedrockRuntimeClient`:

```python
import os

from boto3.session import Session
from mypy_boto3_bedrock_agent_runtime import AgentsforBedrockRuntimeClient

session = Session(
    profile_name=os.getenv("AWS_PROFILE"),
    region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"),
)

client: AgentsforBedrockRuntimeClient = session.client("bedrock-agent-runtime")
```

If you keep stubs as a development-only dependency, guard the import with `TYPE_CHECKING`:

```python
from typing import TYPE_CHECKING

import boto3

if TYPE_CHECKING:
    from mypy_boto3_bedrock_agent_runtime import AgentsforBedrockRuntimeClient


def make_client() -> "AgentsforBedrockRuntimeClient":
    return boto3.client("bedrock-agent-runtime", region_name="us-east-1")
```

## Core Usage

### Invoke An Agent With Typed Requests

`invoke_agent` requires you to send `agentId`, `agentAliasId`, `sessionId`, and the user input. The AWS boto3 docs also note that the response contains an event stream under `completion`.

```python
import os
from uuid import uuid4

from boto3.session import Session
from mypy_boto3_bedrock_agent_runtime import AgentsforBedrockRuntimeClient
from mypy_boto3_bedrock_agent_runtime.type_defs import (
    InvokeAgentRequestTypeDef,
    InvokeAgentResponseTypeDef,
)

session = Session(region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"))
client: AgentsforBedrockRuntimeClient = session.client("bedrock-agent-runtime")

request: InvokeAgentRequestTypeDef = {
    "agentId": os.environ["BEDROCK_AGENT_ID"],
    "agentAliasId": os.environ["BEDROCK_AGENT_ALIAS_ID"],
    "sessionId": str(uuid4()),
    "inputText": "Summarize the latest support ticket in two bullets.",
    "enableTrace": False,
}

response: InvokeAgentResponseTypeDef = client.invoke_agent(**request)

for event in response["completion"]:
    chunk = event.get("chunk")
    if chunk and "bytes" in chunk:
        print(chunk["bytes"].decode("utf-8"), end="")

print()
print("sessionId:", response["sessionId"])
```

If you turn on tracing, the stream can also contain `trace` events. AWS also documents that streaming agent responses require the `bedrock:InvokeModelWithResponseStream` permission in addition to the normal agent invocation permissions.

### Retrieve From A Knowledge Base And Generate An Answer

Use `retrieve_and_generate` when you want Bedrock to retrieve context from a knowledge base and produce the final answer in one call.

```python
import os

from boto3.session import Session
from mypy_boto3_bedrock_agent_runtime import AgentsforBedrockRuntimeClient
from mypy_boto3_bedrock_agent_runtime.type_defs import (
    RetrieveAndGenerateRequestTypeDef,
    RetrieveAndGenerateResponseTypeDef,
)

session = Session(region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"))
client: AgentsforBedrockRuntimeClient = session.client("bedrock-agent-runtime")

request: RetrieveAndGenerateRequestTypeDef = {
    "input": {"text": "Which product issues were escalated this week?"},
    "retrieveAndGenerateConfiguration": {
        "type": "KNOWLEDGE_BASE",
        "knowledgeBaseConfiguration": {
            "knowledgeBaseId": os.environ["BEDROCK_KNOWLEDGE_BASE_ID"],
            "modelArn": os.environ["BEDROCK_MODEL_ARN"],
            "retrievalConfiguration": {
                "vectorSearchConfiguration": {
                    "numberOfResults": 4,
                }
            },
        },
    },
}

response: RetrieveAndGenerateResponseTypeDef = client.retrieve_and_generate(**request)

print(response["output"]["text"])
print("sessionId:", response["sessionId"])
```

The AWS docs call out an important difference from `invoke_agent`: you do not choose the initial `sessionId` for `retrieve_and_generate`. The service returns it in the first response, and you reuse that value on follow-up calls when you want conversation context to continue.

### Paginate Retrieval Results

The generated package includes paginator types for operations such as `retrieve`, `rerank`, `list_sessions`, and `get_agent_memory`. Use the paginator type directly when you want checked pagination code.

```python
import os

from boto3.session import Session
from mypy_boto3_bedrock_agent_runtime import AgentsforBedrockRuntimeClient
from mypy_boto3_bedrock_agent_runtime.paginator import RetrievePaginator
from mypy_boto3_bedrock_agent_runtime.type_defs import RetrieveRequestPaginateTypeDef

session = Session(region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"))
client: AgentsforBedrockRuntimeClient = session.client("bedrock-agent-runtime")

paginator: RetrievePaginator = client.get_paginator("retrieve")

request: RetrieveRequestPaginateTypeDef = {
    "knowledgeBaseId": os.environ["BEDROCK_KNOWLEDGE_BASE_ID"],
    "retrievalQuery": {"text": "refund policy for enterprise accounts"},
    "retrievalConfiguration": {
        "vectorSearchConfiguration": {
            "numberOfResults": 10,
        }
    },
    "PaginationConfig": {"PageSize": 10},
}

for page in paginator.paginate(**request):
    for result in page.get("retrievalResults", []):
        content = result.get("content", {})
        print(result["location"])
        print(content)
```

## Common Pitfalls

- This package does not create a runtime client by itself. If `boto3` is missing, your code will still fail at runtime.
- The service name is `"bedrock-agent-runtime"`. Do not swap it with `"bedrock"` or `"bedrock-runtime"` unless you are intentionally using those separate AWS APIs.
- `invoke_agent` and `retrieve_and_generate` handle session state differently. For `invoke_agent`, you supply `sessionId`; for `retrieve_and_generate`, the service returns the initial `sessionId`.
- `invoke_agent` returns an event stream in `completion`, not a single plain-text field.
- If you use `boto3-stubs-lite`, do not expect `session.client("bedrock-agent-runtime")` overload inference. Add the explicit `AgentsforBedrockRuntimeClient` annotation yourself.
- Version skew between `boto3`, `botocore`, and the stubs can surface missing methods or stale request shapes when AWS adds new Bedrock Agent Runtime features.

## Version-Sensitive Notes

- This entry is pinned to `1.42.3`.
- PyPI lists `mypy-boto3-bedrock-agent-runtime 1.42.3` and marks it as requiring Python `>=3.9`.
- The maintainer docs state that the package version matches the related `boto3` version.
- The maintainer docs are generated and unversioned, so examples on the site can drift. Use PyPI for exact pinning and the AWS boto3 reference for service behavior.

## Official Sources

- Maintainer docs: `https://youtype.github.io/boto3_stubs_docs/mypy_boto3_bedrock_agent_runtime/`
- Maintainer usage examples: `https://youtype.github.io/boto3_stubs_docs/mypy_boto3_bedrock_agent_runtime/usage/`
- Maintainer type definitions: `https://youtype.github.io/boto3_stubs_docs/mypy_boto3_bedrock_agent_runtime/type_defs/`
- PyPI project: `https://pypi.org/project/mypy-boto3-bedrock-agent-runtime/`
- AWS boto3 Agents for Bedrock Runtime reference: `https://docs.aws.amazon.com/boto3/latest/reference/services/bedrock-agent-runtime.html`
- AWS `invoke_agent` reference: `https://docs.aws.amazon.com/boto3/latest/reference/services/bedrock-agent-runtime/client/invoke_agent.html`
- AWS `retrieve_and_generate` reference: `https://docs.aws.amazon.com/boto3/latest/reference/services/bedrock-agent-runtime/client/retrieve_and_generate.html`
- AWS credentials guide: `https://docs.aws.amazon.com/boto3/latest/guide/credentials.html`
