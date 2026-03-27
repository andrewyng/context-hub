---
name: mypy-boto3-bedrock-agent
description: "mypy-boto3-bedrock-agent guide for typed boto3 Bedrock Agents clients, paginators, and TypedDict request shapes"
metadata:
  languages: "python"
  versions: "1.42.3"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,bedrock,bedrock-agent,boto3,mypy,pyright,python,typing,stubs"
---

# mypy-boto3-bedrock-agent Python Package Guide

## What It Is

`mypy-boto3-bedrock-agent` provides generated type annotations for `boto3.client("bedrock-agent")`.

Use it when you want:

- a typed `AgentsforBedrockClient`
- typed paginator classes such as `ListAgentsPaginator`
- generated `TypedDict` request and response shapes from `mypy_boto3_bedrock_agent.type_defs`
- better autocomplete and mypy or pyright coverage for Bedrock agent management code

It is a stubs-only package. Real AWS calls still come from `boto3`.

## Install

Pin `boto3` and the stubs to the same release family when possible:

```bash
python -m pip install "boto3==1.42.3" "mypy-boto3-bedrock-agent==1.42.3"
```

The maintainer also documents these install patterns:

```bash
# Full boto3-stubs package with the Bedrock Agent service extra
python -m pip install "boto3-stubs[bedrock-agent]==1.42.3"

# Lite variant: lower editor memory use, but no session.client/resource overloads
python -m pip install "boto3-stubs-lite[bedrock-agent]==1.42.3"
```

Use the standalone package when you only want this service's types. Use `boto3-stubs[bedrock-agent]` when you already standardize on the umbrella package.

## Authentication And Client Initialization

This package follows normal boto3 credential and region resolution. Boto3 checks client parameters, session parameters, environment variables, assume-role providers, shared credentials files, config files, container credentials, and EC2 instance metadata in that order.

Typical local environment:

```bash
export AWS_PROFILE=bedrock-dev
export AWS_DEFAULT_REGION=us-east-1
export BEDROCK_FOUNDATION_MODEL_ID=your-model-id
export BEDROCK_AGENT_ROLE_ARN=arn:aws:iam::123456789012:role/bedrock-agent-role
```

Typed client setup:

```python
import os

from boto3.session import Session
from mypy_boto3_bedrock_agent import AgentsforBedrockClient

session = Session(
    profile_name=os.getenv("AWS_PROFILE"),
    region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"),
)

client: AgentsforBedrockClient = session.client("bedrock-agent")
```

`region_name` on the client or session takes precedence over environment and config file values.

## Core Workflows

### Create A Typed Bedrock Agent

AWS documents `agentName` as required for `create_agent`. In practice, a usable agent setup usually also includes an instruction, a foundation model identifier, and an IAM role ARN.

```python
import os

from boto3.session import Session
from mypy_boto3_bedrock_agent import AgentsforBedrockClient
from mypy_boto3_bedrock_agent.type_defs import (
    CreateAgentRequestTypeDef,
    CreateAgentResponseTypeDef,
    MemoryConfigurationTypeDef,
)

session = Session(region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"))
client: AgentsforBedrockClient = session.client("bedrock-agent")

memory_config: MemoryConfigurationTypeDef = {
    "enabledMemoryTypes": ["SESSION_SUMMARY"],
    "storageDays": 7,
    "sessionSummaryConfiguration": {"maxRecentSessions": 5},
}

request: CreateAgentRequestTypeDef = {
    "agentName": "support-agent",
    "instruction": "Answer support questions and escalate billing issues.",
    "foundationModel": os.environ["BEDROCK_FOUNDATION_MODEL_ID"],
    "agentResourceRoleArn": os.environ["BEDROCK_AGENT_ROLE_ARN"],
    "idleSessionTTLInSeconds": 900,
    "memoryConfiguration": memory_config,
    "tags": {
        "app": "support-api",
        "env": "dev",
    },
}

response: CreateAgentResponseTypeDef = client.create_agent(**request)
agent_id = response["agent"]["agentId"]
print(agent_id, response["agent"]["agentStatus"])
```

AWS also documents these `create_agent` details that matter in real code:

- `agentResourceRoleArn` is the IAM role the agent uses to invoke API operations.
- `idleSessionTTLInSeconds` controls how long Bedrock keeps conversation state for the agent session.
- `memoryConfiguration` is how you enable retained conversational context such as `SESSION_SUMMARY`.

### Prepare The Draft Agent And Poll Status

`prepare_agent` works on the agent's `DRAFT` version. `get_agent` lets you poll until the draft is ready.

```python
import os
import time

from boto3.session import Session
from mypy_boto3_bedrock_agent import AgentsforBedrockClient
from mypy_boto3_bedrock_agent.type_defs import (
    GetAgentResponseTypeDef,
    PrepareAgentResponseTypeDef,
)

session = Session(region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"))
client: AgentsforBedrockClient = session.client("bedrock-agent")

agent_id = "your-agent-id"

prepare_response: PrepareAgentResponseTypeDef = client.prepare_agent(agentId=agent_id)
print(prepare_response["agentVersion"], prepare_response["agentStatus"])

while True:
    current: GetAgentResponseTypeDef = client.get_agent(agentId=agent_id)
    status = current["agent"]["agentStatus"]

    if status == "PREPARED":
        print("Agent is ready")
        break
    if status == "FAILED":
        raise RuntimeError(current["agent"].get("failureReasons", ["Agent preparation failed"]))

    time.sleep(5)
```

The Bedrock Agent response shape includes statuses such as `CREATING`, `PREPARING`, `PREPARED`, `NOT_PREPARED`, `FAILED`, `UPDATING`, and `DELETING`.

### Paginate Through Existing Agents

The generated paginator overloads are useful when your account has enough agents, aliases, action groups, or knowledge bases to require pagination.

```python
import os

from boto3.session import Session
from mypy_boto3_bedrock_agent import AgentsforBedrockClient
from mypy_boto3_bedrock_agent.paginator import ListAgentsPaginator
from mypy_boto3_bedrock_agent.type_defs import (
    ListAgentsRequestPaginateTypeDef,
    PaginatorConfigTypeDef,
)

session = Session(region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"))
client: AgentsforBedrockClient = session.client("bedrock-agent")

pagination: PaginatorConfigTypeDef = {
    "PageSize": 25,
    "MaxItems": 100,
}
request: ListAgentsRequestPaginateTypeDef = {
    "PaginationConfig": pagination,
}

paginator: ListAgentsPaginator = client.get_paginator("list_agents")

for page in paginator.paginate(**request):
    for summary in page.get("agentSummaries", []):
        print(summary["agentId"], summary["agentName"], summary["agentStatus"])
```

The same package also exposes paginator types for:

- `list_agent_action_groups`
- `list_agent_aliases`
- `list_agent_collaborators`
- `list_agent_knowledge_bases`
- `list_agent_versions`
- `list_data_sources`
- `list_knowledge_bases`

### Keep Stub Imports Out Of Production If Needed

If your runtime environment only installs `boto3`, guard type imports with `TYPE_CHECKING`.

```python
from typing import TYPE_CHECKING

import boto3

if TYPE_CHECKING:
    from mypy_boto3_bedrock_agent import AgentsforBedrockClient

def make_client() -> "AgentsforBedrockClient":
    return boto3.client("bedrock-agent", region_name="us-east-1")
```

This pattern is explicitly supported by the PyPI project docs for stub-only usage.

## Common Pitfalls

- `mypy-boto3-bedrock-agent` does not install `boto3` for runtime calls. Install both if the environment actually talks to AWS.
- The service name is `"bedrock-agent"`. If you annotate the wrong service client, the types will not match the operations in this package.
- `boto3-stubs-lite` is valid, but the maintainer docs call out that it does not provide `session.client()` and `session.resource()` overloads. Add explicit annotations in that setup.
- Bedrock agent creation can succeed syntactically while still being unusable operationally if the IAM role ARN, model identifier, region access, or account permissions are wrong.
- AWS notes that agent instructions are not honored in a narrow default configuration: one knowledge base, default prompts, no action group, and user input disabled.
- Generated AWS reference pages are latest-docs targets. They can show newer operations or fields before an older pinned stub package catches up.

## Version-Sensitive Notes

- This guide is pinned to `mypy-boto3-bedrock-agent 1.42.3`.
- PyPI lists `1.42.3` as a stubs-only release published on December 4, 2025, with `Requires: Python >=3.9`.
- The maintainer documentation is generated from the same release family and documents the `AgentsforBedrockClient`, paginator classes, and `type_defs` used above.
- As of March 13, 2026, the AWS boto3 Bedrock Agent reference pages are served from newer latest-docs builds than `1.42.3`, so keep `boto3`, `botocore`, and the stub package aligned if exact field coverage matters in type checking.

## Official Sources

- Maintainer client docs: https://youtype.github.io/boto3_stubs_docs/mypy_boto3_bedrock_agent/client/
- Maintainer type definitions docs: https://youtype.github.io/boto3_stubs_docs/mypy_boto3_bedrock_agent/type_defs/
- PyPI package page: https://pypi.org/project/mypy-boto3-bedrock-agent/
- AWS `create_agent` reference: https://docs.aws.amazon.com/boto3/latest/reference/services/bedrock-agent/client/create_agent.html
- AWS `list_agents` reference: https://docs.aws.amazon.com/boto3/latest/reference/services/bedrock-agent/client/list_agents.html
- AWS boto3 credentials guide: https://docs.aws.amazon.com/boto3/latest/guide/credentials.html
- AWS boto3 configuration guide: https://docs.aws.amazon.com/boto3/latest/guide/configuration.html
