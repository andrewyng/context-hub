---
name: mypy-boto3-qbusiness
description: "mypy-boto3-qbusiness type stubs for boto3 Amazon Q Business clients, paginators, literals, and TypedDict request/response shapes"
metadata:
  languages: "python"
  versions: "1.42.14"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,qbusiness,boto3,type-stubs,mypy,pyright,python"
---

# mypy-boto3-qbusiness Python Package Guide

## Golden Rule

`mypy-boto3-qbusiness` adds type annotations for Amazon Q Business code that uses `boto3`. It is not a runtime SDK, it does not make AWS calls by itself, and it does not replace normal Boto3 credential or region setup.

Use one of these install modes:

- `boto3-stubs[qbusiness]` when you want the best autocomplete and automatic `Session.client("qbusiness")` typing.
- `mypy-boto3-qbusiness` when you want only the standalone Amazon Q Business stubs and are willing to add explicit annotations.
- `boto3-stubs-lite[qbusiness]` when IDE memory use matters more than overload-based inference.

## Install

### Recommended for most projects

```bash
python -m pip install boto3 'boto3-stubs[qbusiness]'
```

### Standalone Amazon Q Business stubs

```bash
python -m pip install boto3 mypy-boto3-qbusiness
```

Use this when you only want the QBusiness service stubs. Explicit annotations are usually needed.

### Lower-memory IDE fallback

```bash
python -m pip install boto3 'boto3-stubs-lite[qbusiness]'
```

The lite package is more RAM-friendly, but the maintainer docs say it does not provide `session.client/resource` overloads.

## Runtime Setup And Auth

`mypy-boto3-qbusiness` has no package-specific initialization. All runtime behavior still comes from `boto3`.

AWS documents that Boto3 requests need both AWS credentials and an AWS Region. The usual options are:

```bash
aws configure
```

or environment variables:

```bash
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_SESSION_TOKEN=...      # optional
export AWS_DEFAULT_REGION=us-east-1
export AWS_PROFILE=dev            # optional
```

Create the typed client through a normal Boto3 session:

```python
import os

from boto3.session import Session
from mypy_boto3_qbusiness.client import QBusinessClient

session = Session(region_name=os.environ["AWS_DEFAULT_REGION"])
qbusiness: QBusinessClient = session.client("qbusiness")
```

If you want explicit profile control:

```python
from boto3.session import Session
from mypy_boto3_qbusiness.client import QBusinessClient

session = Session(profile_name="dev", region_name="us-east-1")
qbusiness: QBusinessClient = session.client("qbusiness")
```

## Core Usage

### List applications with a typed response

```python
from boto3.session import Session
from mypy_boto3_qbusiness.client import QBusinessClient
from mypy_boto3_qbusiness.type_defs import ListApplicationsResponseTypeDef

qbusiness: QBusinessClient = Session(region_name="us-east-1").client("qbusiness")

response: ListApplicationsResponseTypeDef = qbusiness.list_applications(maxResults=20)

for app in response.get("applications", []):
    print(app["applicationId"], app["displayName"], app.get("status"))
```

### Use a typed paginator

```python
from boto3.session import Session
from mypy_boto3_qbusiness.client import QBusinessClient
from mypy_boto3_qbusiness.paginator import ListApplicationsPaginator

qbusiness: QBusinessClient = Session(region_name="us-east-1").client("qbusiness")

paginator: ListApplicationsPaginator = qbusiness.get_paginator("list_applications")

for page in paginator.paginate(maxResults=50):
    for app in page.get("applications", []):
        print(app["applicationId"], app["displayName"])
```

The maintainer docs also publish typed paginators for `get_chat_controls_configuration`, `list_attachments`, `list_conversations`, `list_data_sources`, `list_documents`, `list_indices`, `list_messages`, `list_plugins`, `list_retrievers`, `list_subscriptions`, `list_web_experiences`, and `search_relevant_content`.

### Start a data source sync job

```python
from boto3.session import Session
from mypy_boto3_qbusiness.client import QBusinessClient

qbusiness: QBusinessClient = Session(region_name="us-east-1").client("qbusiness")

result = qbusiness.start_data_source_sync_job(
    dataSourceId=data_source_id,
    applicationId=application_id,
    indexId=index_id,
)

print(result["executionId"])
```

### Search relevant content with a typed request shape

```python
from boto3.session import Session
from mypy_boto3_qbusiness.client import QBusinessClient
from mypy_boto3_qbusiness.type_defs import (
    ContentSourceTypeDef,
    SearchRelevantContentResponseTypeDef,
)

qbusiness: QBusinessClient = Session(region_name="us-east-1").client("qbusiness")

content_source: ContentSourceTypeDef = {
    "retriever": {
        "retrieverId": retriever_id,
    }
}

response: SearchRelevantContentResponseTypeDef = qbusiness.search_relevant_content(
    applicationId=application_id,
    queryText="What is our PTO policy?",
    contentSource=content_source,
    maxResults=5,
)

for item in response.get("relevantContent", []):
    print(item["documentTitle"], item.get("documentUri"))
```

### Run a non-streaming chat call

```python
from boto3.session import Session
from mypy_boto3_qbusiness.client import QBusinessClient
from mypy_boto3_qbusiness.type_defs import ChatSyncInputTypeDef, ChatSyncOutputTypeDef

qbusiness: QBusinessClient = Session(region_name="us-east-1").client("qbusiness")

request: ChatSyncInputTypeDef = {
    "applicationId": application_id,
    "userMessage": "Summarize the top support issues from this week.",
}

response: ChatSyncOutputTypeDef = qbusiness.chat_sync(**request)

print(response["conversationId"])
print(response.get("systemMessage", ""))

for source in response.get("sourceAttributions", []):
    print(source.get("title"), source.get("url"))
```

### Ingest documents into an index

```python
from boto3.session import Session
from mypy_boto3_qbusiness.client import QBusinessClient
from mypy_boto3_qbusiness.type_defs import BatchPutDocumentRequestTypeDef

qbusiness: QBusinessClient = Session(region_name="us-east-1").client("qbusiness")

request: BatchPutDocumentRequestTypeDef = {
    "applicationId": application_id,
    "indexId": index_id,
    "documents": [
        {
            "id": "employee-handbook-2026",
            "content": {
                "s3": {
                    "bucket": bucket_name,
                    "key": "handbooks/employee-handbook-2026.pdf",
                }
            },
            "contentType": "PDF",
            "title": "Employee Handbook 2026",
        }
    ],
}

result = qbusiness.batch_put_document(**request)
print(result.get("failedDocuments", []))
```

## Typing Patterns

### Use `type_defs` for nested request bodies

The maintainer docs publish `TypedDict` definitions for request and response shapes. This is the cleanest way to type nested Amazon Q Business payloads before they reach the client call.

```python
from mypy_boto3_qbusiness.type_defs import ChatSyncInputTypeDef

request: ChatSyncInputTypeDef = {
    "applicationId": application_id,
    "userMessage": "Show me the latest onboarding checklist.",
}
```

### Use `literals` when a field expects a constrained string

```python
from mypy_boto3_qbusiness.literals import APISchemaTypeType

schema_type: APISchemaTypeType = "OpenAPI_3"
```

### Keep the stubs as a development dependency

If production images do not install stub packages, gate the import with `TYPE_CHECKING`:

```python
from typing import TYPE_CHECKING

import boto3

if TYPE_CHECKING:
    from mypy_boto3_qbusiness.client import QBusinessClient
else:
    QBusinessClient = object

def make_client() -> "QBusinessClient":
    return boto3.client("qbusiness", region_name="us-east-1")
```

## Common Pitfalls

- Installing only `mypy-boto3-qbusiness` and expecting it to replace `boto3`. You still need the runtime SDK.
- Expecting unannotated `Session.client("qbusiness")` calls to become typed automatically when you use the standalone or lite packages. That behavior comes from `boto3-stubs[qbusiness]`.
- Forgetting the import-name difference: install `mypy-boto3-qbusiness`, import `mypy_boto3_qbusiness`.
- Treating stub packages as AWS auth or config helpers. Credentials, region, retries, and endpoints still come from normal Boto3 and botocore configuration.
- Using the full `boto3-stubs` package in PyCharm when overload-heavy typing slows the IDE down. The maintainer recommends trying `boto3-stubs-lite` in that case.
- Letting `boto3`, `botocore`, and the stubs drift apart. The maintainer says the stub version matches the related `boto3` version.

## Version-Sensitive Notes

- This guide is keyed to `mypy-boto3-qbusiness==1.42.14`, and PyPI lists it as the package version for boto3 QBusiness `1.42.14`.
- PyPI lists `Python >=3.9` for this package.
- The maintainer recommends local generation with `uvx --with 'boto3==1.42.14' mypy-boto3-builder` when you want stubs generated exactly for your pinned boto3 version.
- When exact shape coverage matters, pin `boto3`, `botocore`, and `mypy-boto3-qbusiness` in the same release family.

## Official Sources

- Maintainer docs: https://youtype.github.io/boto3_stubs_docs/mypy_boto3_qbusiness/
- Maintainer client docs: https://youtype.github.io/boto3_stubs_docs/mypy_boto3_qbusiness/client/
- Maintainer paginators docs: https://youtype.github.io/boto3_stubs_docs/mypy_boto3_qbusiness/paginators/
- PyPI project: https://pypi.org/project/mypy-boto3-qbusiness/
- AWS QBusiness service reference: https://docs.aws.amazon.com/boto3/latest/reference/services/qbusiness.html
- AWS `list_applications`: https://docs.aws.amazon.com/boto3/latest/reference/services/qbusiness/client/list_applications.html
- AWS `chat_sync`: https://docs.aws.amazon.com/boto3/latest/reference/services/qbusiness/client/chat_sync.html
- AWS `search_relevant_content`: https://docs.aws.amazon.com/boto3/latest/reference/services/qbusiness/client/search_relevant_content.html
- AWS `start_data_source_sync_job`: https://docs.aws.amazon.com/boto3/latest/reference/services/qbusiness/client/start_data_source_sync_job.html
- AWS `batch_put_document`: https://docs.aws.amazon.com/boto3/latest/reference/services/qbusiness/client/batch_put_document.html
- Boto3 credentials guide: https://docs.aws.amazon.com/boto3/latest/guide/credentials.html
- Boto3 configuration guide: https://docs.aws.amazon.com/boto3/latest/guide/configuration.html
- Boto3 session reference: https://docs.aws.amazon.com/boto3/latest/reference/core/session.html
