---
name: network-services
description: "Google Cloud Network Services Python client for gateways, HTTP routes, meshes, and Wasm plugins"
metadata:
  languages: "python"
  versions: "0.8.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,gcp,google-cloud,network-services,networking,load-balancing,mesh,wasm,python"
---

# google-cloud-network-services Python Package Guide

Use `google-cloud-network-services` for Python code that manages Google Cloud Network Services resources such as gateways, routes, meshes, service bindings, and Wasm plugins. The main entry point is `google.cloud.network_services_v1.NetworkServicesClient`.

## Version Note

This guide covers package version `0.8.0`, which PyPI lists as the current release as of `2026-03-13`.

Google's Python reference pages for this library currently lag behind PyPI:

- the PyPI package page lists `0.8.0`
- the live `latest` reference pages for `NetworkServicesClient`, `HttpRoute`, and `WasmPlugin` still render `0.7.0`
- the `Gateway` type page still renders `0.6.0`

The examples below stay on the documented `network_services_v1` client methods and message fields shown in the live reference docs.

## Install

```bash
python -m pip install "google-cloud-network-services==0.8.0"
```

Common alternatives:

```bash
uv add "google-cloud-network-services==0.8.0"
poetry add "google-cloud-network-services==0.8.0"
```

PyPI currently declares Python `>=3.7`.

## Authentication And Setup

This client uses Google Cloud credentials, not API keys.

Before calling the API:

1. Enable the Network Services API for the target project.
2. Make sure the credential can manage Network Services resources in that project.
3. Decide which location your resources use. Gateways are location-scoped. Several route and Wasm plugin examples in the reference docs use `global`.

Enable the API:

```bash
gcloud services enable networkservices.googleapis.com
```

Typical local development setup with Application Default Credentials (ADC):

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="your-project-id"
export GOOGLE_CLOUD_LOCATION="global"
```

If you must use a service-account key file:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
export GOOGLE_CLOUD_PROJECT="your-project-id"
export GOOGLE_CLOUD_LOCATION="global"
```

Google's ADC setup docs recommend attached service accounts or service account impersonation before downloading long-lived key files.

## Initialize The Client

Basic client initialization with ADC:

```python
import os

from google.cloud import network_services_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "global")

client = network_services_v1.NetworkServicesClient()
```

Explicit service-account file:

```python
from google.cloud import network_services_v1

client = network_services_v1.NetworkServicesClient.from_service_account_json(
    "/absolute/path/service-account.json"
)
```

Custom endpoint override:

```python
import os

from google.api_core.client_options import ClientOptions
from google.cloud import network_services_v1

client = network_services_v1.NetworkServicesClient(
    client_options=ClientOptions(api_endpoint=os.environ["GOOGLE_API_ENDPOINT"])
)
```

The generated client supports `client_options.api_endpoint` if you need to target a non-default endpoint.

## Resource Names

Use fully qualified names instead of assembling strings ad hoc:

```python
from google.cloud import network_services_v1

client = network_services_v1.NetworkServicesClient()

gateway_name = client.gateway_path("my-project", "global", "my-gateway")
http_route_name = client.http_route_path("my-project", "global", "my-route")
wasm_plugin_name = client.wasm_plugin_path("my-project", "global", "header-normalizer")
parent = client.common_location_path("my-project", "global")
```

That keeps request code consistent with the documented patterns:

- gateway parent: `projects/{project}/locations/{location}`
- gateway name: `projects/{project}/locations/{location}/gateways/{gateway}`
- HTTP route name: `projects/{project}/locations/global/httpRoutes/{http_route}`
- Wasm plugin name: `projects/{project}/locations/global/wasmPlugins/{wasm_plugin}`

## Core Usage

### List gateways

List methods return pagers, so normal iteration handles pagination:

```python
import os

from google.cloud import network_services_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "global")

client = network_services_v1.NetworkServicesClient()
parent = client.common_location_path(project_id, location)

for gateway in client.list_gateways(parent=parent):
    print(gateway.name, gateway.type_.name, list(gateway.ports))
```

### Create a gateway

`create_gateway()` is a long-running operation. Wait on `.result()` before using the resource.

```python
import os

from google.cloud import network_services_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "global")

client = network_services_v1.NetworkServicesClient()
parent = client.common_location_path(project_id, location)

operation = client.create_gateway(
    parent=parent,
    gateway_id="mesh-gateway",
    gateway=network_services_v1.Gateway(
        description="Gateway for mesh traffic",
        type_=network_services_v1.Gateway.Type.OPEN_MESH,
        ports=[80, 443],
        addresses=["10.0.0.15"],
        scope="prod-mesh",
        labels={"env": "dev"},
    ),
)

gateway = operation.result(timeout=600)
print(gateway.name)
```

### Get and update a gateway

Use an explicit field mask when updating mutable fields.

```python
from google.cloud import network_services_v1
from google.protobuf.field_mask_pb2 import FieldMask

client = network_services_v1.NetworkServicesClient()
gateway_name = client.gateway_path("my-project", "global", "mesh-gateway")

gateway = client.get_gateway(name=gateway_name)
print(gateway.description, gateway.labels)

operation = client.update_gateway(
    gateway=network_services_v1.Gateway(
        name=gateway_name,
        description="Updated mesh gateway description",
        labels={"env": "prod", "team": "networking"},
    ),
    update_mask=FieldMask(paths=["description", "labels"]),
)

updated_gateway = operation.result(timeout=600)
print(updated_gateway.labels)
```

### Delete a gateway

```python
from google.cloud import network_services_v1

client = network_services_v1.NetworkServicesClient()
gateway_name = client.gateway_path("my-project", "global", "mesh-gateway")

operation = client.delete_gateway(name=gateway_name)
operation.result(timeout=600)
```

### List and inspect HTTP routes

The reference docs use the global location for HTTP routes. Listing returns route resources directly; `get_http_route()` fetches one by resource name.

```python
from google.cloud import network_services_v1

client = network_services_v1.NetworkServicesClient()
parent = client.common_location_path("my-project", "global")

for route in client.list_http_routes(parent=parent):
    print(route.name)
    print("hostnames:", list(route.hostnames))
    print("gateways:", list(route.gateways))

route_name = client.http_route_path("my-project", "global", "my-route")
route = client.get_http_route(name=route_name)
print(route.name, list(route.hostnames))
```

### Create and inspect a Wasm plugin

Wasm plugin creation is also a long-running operation. The `versions` map holds one or more named plugin versions, and `main_version_id` selects the default version.

```python
from google.cloud import network_services_v1

client = network_services_v1.NetworkServicesClient()
parent = client.common_location_path("my-project", "global")

operation = client.create_wasm_plugin(
    parent=parent,
    wasm_plugin_id="header-normalizer",
    wasm_plugin=network_services_v1.WasmPlugin(
        description="Normalize request headers before routing",
        main_version_id="v1",
        versions={
            "v1": network_services_v1.WasmPlugin.VersionDetails(
                image_uri=(
                    "us-docker.pkg.dev/my-project/wasm-plugins/"
                    "header-normalizer:1.0.0"
                ),
                plugin_config_data=b'{\"header\":\"x-trace-id\"}',
            )
        },
        labels={"env": "dev"},
    ),
)

plugin = operation.result(timeout=600)
print(plugin.name)
```

Fetch the full plugin definition, including version details:

```python
from google.cloud import network_services_v1

client = network_services_v1.NetworkServicesClient()
plugin_name = client.wasm_plugin_path("my-project", "global", "header-normalizer")

plugin = client.get_wasm_plugin(
    request=network_services_v1.GetWasmPluginRequest(
        name=plugin_name,
        view=network_services_v1.WasmPluginView.WASM_PLUGIN_VIEW_FULL,
    )
)

print(plugin.main_version_id)
print(sorted(plugin.versions.keys()))
```

List plugin versions:

```python
from google.cloud import network_services_v1

client = network_services_v1.NetworkServicesClient()
plugin_name = client.wasm_plugin_path("my-project", "global", "header-normalizer")

for version in client.list_wasm_plugin_versions(parent=plugin_name):
    print(version.name)
```

## Common Pitfalls

- Treat `create_*`, `update_*`, and `delete_*` calls as long-running operations. Read the returned resource only after `operation.result()` completes.
- Keep location explicit. Gateways are location-scoped, while the reference docs for HTTP routes and Wasm plugins use `projects/{project}/locations/global/...`.
- Build resource names with helper methods such as `gateway_path()` and `http_route_path()` instead of manual string concatenation.
- `Gateway` creation needs the resource `type_` and at least one listening port. The `SECURE_WEB_GATEWAY` variant has additional constraints documented on the `Gateway` type, including a single port and specific networking and TLS fields.
- `HttpRoute.hostnames` must stay unique within the mesh or gateway scope where the route is attached.
- `get_wasm_plugin()` does not return full version details unless you request `WASM_PLUGIN_VIEW_FULL`.
