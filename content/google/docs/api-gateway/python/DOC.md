---
name: api-gateway
description: "Google Cloud API Gateway Python client for managing APIs, API configs, gateways, and rollouts"
metadata:
  languages: "python"
  versions: "1.14.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,gcp,api-gateway,api-management,openapi,gateway"
---

# google-cloud-api-gateway Python Package Guide

## What This Package Is For

`google-cloud-api-gateway` is the official Python client for the API Gateway control plane. Use it to create and manage:

- APIs
- API configs
- Gateways
- gateway rollouts from one config to another

The main import surface is:

```python
from google.cloud import apigateway_v1
```

This package manages API Gateway resources. It does not send end-user traffic through your deployed gateway for you. Your application still calls the deployed `https://...gateway.dev` URL like any other HTTPS API.

## Version-Sensitive Notes

- PyPI lists `google-cloud-api-gateway 1.14.0` as the current package release on March 13, 2026.
- The generated client reference for the current line exposes both `ApiGatewayServiceClient` and `ApiGatewayServiceAsyncClient`.
- The package changelog for the current line notes two recent behavior changes that matter in real projects:
  - `1.13.0` added Python 3.14 support.
  - `1.13.0` deprecated the `credentials_file` argument. Prefer Application Default Credentials or pass an explicit `credentials=` object instead.
- API Gateway product docs added OpenAPI 3.0 support on November 12, 2025. Older tutorials that say API Gateway only accepts OpenAPI 2.0 are outdated.

## Install

Pin the package when you need reproducible generated-client behavior:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "google-cloud-api-gateway==1.14.0"
```

Common alternatives:

```bash
uv add "google-cloud-api-gateway==1.14.0"
poetry add "google-cloud-api-gateway==1.14.0"
```

## Authentication And Setup

This library uses Google Application Default Credentials (ADC).

Local development:

```bash
gcloud auth application-default login
gcloud services enable apigateway.googleapis.com
gcloud services enable servicemanagement.googleapis.com
gcloud services enable servicecontrol.googleapis.com

export GOOGLE_CLOUD_PROJECT="my-project"
export GOOGLE_CLOUD_LOCATION="us-central1"
export API_ID="orders-api"
export API_CONFIG_ID="orders-config-v1"
export GATEWAY_ID="orders-gateway"
export OPENAPI_SPEC_PATH="openapi.yaml"
export GATEWAY_SERVICE_ACCOUNT="gateway-invoker@my-project.iam.gserviceaccount.com"
```

Service account credentials when you explicitly need file-based auth:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/abs/path/service-account.json"
```

Important setup details from the product docs:

- The identity creating or updating an API config or gateway needs `iam.serviceAccounts.actAs` on the gateway service account. Google documents this through the Service Account User role (`roles/iam.serviceAccountUser`).
- The gateway service account itself needs permission to invoke your backend, for example `roles/run.invoker` for Cloud Run.
- APIs and API configs live under `locations/global`, but gateways are regional resources.
- Gateways can only host one API config at a time.

## Initialize A Client

```python
import google.auth
from google.cloud import apigateway_v1

credentials, project_id = google.auth.default(
    scopes=["https://www.googleapis.com/auth/cloud-platform"]
)

client = apigateway_v1.ApiGatewayServiceClient(credentials=credentials)
print(project_id)
```

If you do not need to inspect the resolved project, ADC-only initialization is enough:

```python
from google.cloud import apigateway_v1

client = apigateway_v1.ApiGatewayServiceClient()
```

## Resource Names And Parents

Use the helper methods instead of hand-building resource names:

```python
import os
from google.cloud import apigateway_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ["GOOGLE_CLOUD_LOCATION"]
api_id = os.environ["API_ID"]
config_id = os.environ["API_CONFIG_ID"]
gateway_id = os.environ["GATEWAY_ID"]

client = apigateway_v1.ApiGatewayServiceClient()

global_parent = client.common_location_path(project_id, "global")
regional_parent = client.common_location_path(project_id, location)

api_name = client.api_path(project_id, api_id)
api_config_name = client.api_config_path(project_id, api_id, config_id)
gateway_name = client.gateway_path(project_id, location, gateway_id)
```

Use `global_parent` for `create_api(...)` and `regional_parent` for `create_gateway(...)`.

## List Existing Resources

```python
import os
from google.cloud import apigateway_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ["GOOGLE_CLOUD_LOCATION"]

client = apigateway_v1.ApiGatewayServiceClient()
global_parent = client.common_location_path(project_id, "global")
regional_parent = client.common_location_path(project_id, location)

for api in client.list_apis(parent=global_parent):
    print("API:", api.name, api.display_name)

for gateway in client.list_gateways(parent=regional_parent):
    print("Gateway:", gateway.name, gateway.default_hostname, gateway.state.name)
```

The list methods return pagers, so iterate over them directly.

## Create An API

API IDs must be lowercase letters, numbers, or dashes, cannot start with a dash, and cannot contain underscores.

```python
import os
from google.cloud import apigateway_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
api_id = os.environ["API_ID"]

client = apigateway_v1.ApiGatewayServiceClient()
global_parent = client.common_location_path(project_id, "global")

operation = client.create_api(
    parent=global_parent,
    api_id=api_id,
    api=apigateway_v1.Api(
        display_name="Orders API",
    ),
)

created_api = operation.result(timeout=300)
print(created_api.name)
```

If you omit `managed_service`, the API resource automatically creates a managed service in the same project.

## Create An API Config From An OpenAPI Document

API config creation is the step that uploads your OpenAPI file and associates the gateway service account used for backend authentication.

```python
import os
from pathlib import Path

from google.cloud import apigateway_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
api_id = os.environ["API_ID"]
config_id = os.environ["API_CONFIG_ID"]
spec_path = Path(os.environ["OPENAPI_SPEC_PATH"])
gateway_service_account = os.environ["GATEWAY_SERVICE_ACCOUNT"]

client = apigateway_v1.ApiGatewayServiceClient()
api_parent = client.api_path(project_id, api_id)

openapi_bytes = spec_path.read_bytes()

operation = client.create_api_config(
    parent=api_parent,
    api_config_id=config_id,
    api_config=apigateway_v1.ApiConfig(
        display_name="Orders API config v1",
        gateway_service_account=gateway_service_account,
        openapi_documents=[
            apigateway_v1.ApiConfig.OpenApiDocument(
                document=apigateway_v1.ApiConfig.File(
                    path=spec_path.name,
                    contents=openapi_bytes,
                )
            )
        ],
    ),
)

created_config = operation.result(timeout=900)
print(created_config.name)
print(created_config.service_config_id)
```

Important details:

- Pass raw bytes with `Path(...).read_bytes()`.
- `openapi_documents` and `grpc_services` are mutually exclusive on `ApiConfig`.
- Product docs warn that only one API config can be created at a time for the same API.
- API config IDs use the same character rules as API IDs.

## Deploy A Config To A Gateway

Gateway IDs have a stricter length limit than API and config IDs. Product docs say they must be 49 characters or fewer, lowercase letters, numbers, or dashes, and no underscores.

```python
import os
from google.cloud import apigateway_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ["GOOGLE_CLOUD_LOCATION"]
api_id = os.environ["API_ID"]
config_id = os.environ["API_CONFIG_ID"]
gateway_id = os.environ["GATEWAY_ID"]

client = apigateway_v1.ApiGatewayServiceClient()
regional_parent = client.common_location_path(project_id, location)
api_config_name = client.api_config_path(project_id, api_id, config_id)

operation = client.create_gateway(
    parent=regional_parent,
    gateway_id=gateway_id,
    gateway=apigateway_v1.Gateway(
        display_name="Orders gateway",
        api_config=api_config_name,
    ),
)

gateway = operation.result(timeout=900)
print(gateway.name)
print(gateway.default_hostname)
print(gateway.state.name)
```

After the operation finishes, send traffic to:

```text
https://<default_hostname>
```

The product docs describe the deployed hostname shape as `https://GATEWAY_ID-HASH.REGION_CODE.gateway.dev`.

## Fetch One Gateway And Use Its Hostname

```python
import os
from google.cloud import apigateway_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ["GOOGLE_CLOUD_LOCATION"]
gateway_id = os.environ["GATEWAY_ID"]

client = apigateway_v1.ApiGatewayServiceClient()
gateway_name = client.gateway_path(project_id, location, gateway_id)

gateway = client.get_gateway(name=gateway_name)
print(gateway.default_hostname)
print(gateway.api_config)
print(gateway.state.name)
```

`default_hostname` is the easiest value to hand to callers or smoke tests.

## Roll A Gateway Forward To A New Config

You do not edit the OpenAPI document in place. Upload a new API config, then point the gateway at that new config.

```python
import os

from google.cloud import apigateway_v1
from google.protobuf import field_mask_pb2

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ["GOOGLE_CLOUD_LOCATION"]
api_id = os.environ["API_ID"]
gateway_id = os.environ["GATEWAY_ID"]
new_config_id = "orders-config-v2"

client = apigateway_v1.ApiGatewayServiceClient()

gateway_name = client.gateway_path(project_id, location, gateway_id)
new_config_name = client.api_config_path(project_id, api_id, new_config_id)

operation = client.update_gateway(
    gateway=apigateway_v1.Gateway(
        name=gateway_name,
        api_config=new_config_name,
    ),
    update_mask=field_mask_pb2.FieldMask(paths=["api_config"]),
)

updated_gateway = operation.result(timeout=900)
print(updated_gateway.api_config)
print(updated_gateway.state.name)
```

The product docs call this a zero-downtime update model, but they also note that some requests can still hit the old config while the new one is propagating.

## Delete Resources In The Safe Order

Delete the gateway first if it is using the config you want to remove.

```python
import os
from google.cloud import apigateway_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ["GOOGLE_CLOUD_LOCATION"]
api_id = os.environ["API_ID"]
config_id = os.environ["API_CONFIG_ID"]
gateway_id = os.environ["GATEWAY_ID"]

client = apigateway_v1.ApiGatewayServiceClient()

gateway_name = client.gateway_path(project_id, location, gateway_id)
api_config_name = client.api_config_path(project_id, api_id, config_id)
api_name = client.api_path(project_id, api_id)

client.delete_gateway(name=gateway_name).result(timeout=900)
client.delete_api_config(name=api_config_name).result(timeout=900)
client.delete_api(name=api_name).result(timeout=900)
```

If a gateway still points at an API config, product docs say deleting that config will fail until you either deploy a different config or delete the gateway.

## Async Usage

If your application is already asyncio-based, use the async client:

```python
import os
from google.cloud import apigateway_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]

client = apigateway_v1.ApiGatewayServiceAsyncClient()
global_parent = client.common_location_path(project_id, "global")

async def list_apis() -> None:
    async for api in client.list_apis(parent=global_parent):
        print(api.name)
```

## Common Pitfalls

- Do not treat this package as a runtime API caller. It manages API Gateway resources, not end-user calls through the gateway.
- Keep the resource hierarchy straight: APIs and configs are global; gateways are regional.
- Do not try to mutate an existing API config to change the uploaded spec. Product docs say config updates are limited to labels and display name. Upload a new config, then update the gateway.
- Wait for long-running operations with `.result()` before assuming the resource is ready.
- Use a gateway service account with the minimum backend permissions needed, and make sure the operator creating the config can act as that service account.
- API Gateway does not support proxying to other Google Cloud APIs such as `*.googleapis.com`; Google documents those requests as failing with `401` because API Gateway uses ID tokens while Google APIs expect access tokens.
- If you enable Google client-library logging, treat those logs as sensitive. The package docs warn that log output can contain sensitive information.
- If your environment has mTLS client certificates configured, the generated client can switch endpoints based on `GOOGLE_API_USE_MTLS_ENDPOINT` and `GOOGLE_API_USE_CLIENT_CERTIFICATE`. Set `client_options.api_endpoint` explicitly if you need deterministic endpoint selection.

## Official Sources

- PyPI package: https://pypi.org/project/google-cloud-api-gateway/
- Python client overview: https://docs.cloud.google.com/python/docs/reference/apigateway/latest
- Python client reference: https://docs.cloud.google.com/python/docs/reference/apigateway/latest/google.cloud.apigateway_v1.services.api_gateway_service.ApiGatewayServiceClient
- API type reference: https://docs.cloud.google.com/python/docs/reference/apigateway/latest/google.cloud.apigateway_v1.types.Api
- API config type reference: https://docs.cloud.google.com/python/docs/reference/apigateway/latest/google.cloud.apigateway_v1.types.ApiConfig
- Gateway type reference: https://docs.cloud.google.com/python/docs/reference/apigateway/latest/google.cloud.apigateway_v1.types.Gateway
- Package changelog: https://docs.cloud.google.com/python/docs/reference/apigateway/latest/changelog
- API Gateway development environment: https://cloud.google.com/api-gateway/docs/configure-dev-env
- Creating an API: https://cloud.google.com/api-gateway/docs/creating-api
- Creating an API config: https://cloud.google.com/api-gateway/docs/creating-api-config
- Deploying an API to a gateway: https://cloud.google.com/api-gateway/docs/deploying-api
- API Gateway deployment model: https://cloud.google.com/api-gateway/docs/deployment-model
- Securing backend services: https://cloud.google.com/api-gateway/docs/securing-backend-services
- API Gateway release notes: https://cloud.google.com/api-gateway/docs/release-notes
