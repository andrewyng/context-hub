---
name: optimization
description: "Google Cloud Optimization Python client for Route Optimization API requests, validation-only solves, and batch jobs backed by Cloud Storage"
metadata:
  languages: "python"
  versions: "1.13.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,google-cloud,route-optimization,fleet-routing,logistics,gcp,python"
---

# Google Cloud Optimization Python Package Guide

## Golden Rule

Use the official `google-cloud-optimization` package with OAuth-based Google credentials.

- Install: `google-cloud-optimization`
- Import: `from google.cloud import optimization_v1`
- Main client: `optimization_v1.FleetRoutingClient`
- Main calls: `optimize_tours()` for interactive requests and `batch_optimize_tours()` for GCS-backed async jobs

The package name still says "Cloud Optimization", but the product docs and service endpoint are now under the Route Optimization API at `routeoptimization.googleapis.com`.

## Install

Pin the package version your project expects:

```bash
python -m pip install "google-cloud-optimization==1.13.0"
```

Common alternatives:

```bash
uv add "google-cloud-optimization==1.13.0"
poetry add "google-cloud-optimization==1.13.0"
```

PyPI currently lists Python `>=3.7`.

## Authentication And Setup

Before you call the client:

1. Create or choose a Google Cloud project.
2. Enable billing for that project.
3. Enable the Route Optimization API.
4. Authenticate with OAuth-based credentials.

Application Default Credentials (ADC) are the normal path:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="your-project-id"
```

Service account fallback:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
export GOOGLE_CLOUD_PROJECT="your-project-id"
```

The API requires the OAuth scope `https://www.googleapis.com/auth/cloud-platform`.

Important IAM permissions:

- `routeoptimization.locations.use` for `optimize_tours`
- `routeoptimization.operations.create` for `batch_optimize_tours`

## Initialize A Client

With ADC:

```python
import os

from google.cloud import optimization_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
parent = f"projects/{project_id}"

client = optimization_v1.FleetRoutingClient()
```

The `parent` can be either:

- `projects/PROJECT_ID`
- `projects/PROJECT_ID/locations/LOCATION_ID`

If you omit the location, the service chooses a region automatically.

Explicit credentials object:

```python
import os

from google.cloud import optimization_v1
from google.oauth2 import service_account

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
credentials = service_account.Credentials.from_service_account_file(
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"],
    scopes=["https://www.googleapis.com/auth/cloud-platform"],
)

client = optimization_v1.FleetRoutingClient(credentials=credentials)
parent = f"projects/{project_id}"
```

## Core Workflow

### Solve A Small Request Synchronously

For a normal application request, build an `OptimizeToursRequest` and call `optimize_tours()`.

```python
import os
from datetime import datetime, timedelta, timezone

from google.cloud import optimization_v1


def ts(dt: datetime) -> dict:
    return {"seconds": int(dt.astimezone(timezone.utc).timestamp())}


project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
client = optimization_v1.FleetRoutingClient()
parent = f"projects/{project_id}"

route_start = datetime(2026, 3, 13, 15, 0, tzinfo=timezone.utc)
route_end = route_start + timedelta(hours=8)

request = optimization_v1.OptimizeToursRequest(
    parent=parent,
    timeout={"seconds": 10},
    model={
        "global_start_time": ts(route_start),
        "global_end_time": ts(route_end),
        "shipments": [
            {
                "label": "order-1001",
                "pickups": [
                    {
                        "arrival_location": {
                            "latitude": 37.7955,
                            "longitude": -122.3937,
                        },
                        "duration": {"seconds": 300},
                        "time_windows": [
                            {
                                "start_time": ts(route_start + timedelta(minutes=15)),
                                "end_time": ts(route_start + timedelta(hours=2)),
                            }
                        ],
                    }
                ],
                "deliveries": [
                    {
                        "arrival_location": {
                            "latitude": 37.7658,
                            "longitude": -122.4036,
                        },
                        "duration": {"seconds": 300},
                        "time_windows": [
                            {
                                "start_time": ts(route_start + timedelta(hours=1)),
                                "end_time": ts(route_start + timedelta(hours=4)),
                            }
                        ],
                    }
                ],
                "penalty_cost": 100.0,
            }
        ],
        "vehicles": [
            {
                "label": "van-1",
                "start_location": {
                    "latitude": 37.7749,
                    "longitude": -122.4194,
                },
                "end_location": {
                    "latitude": 37.7749,
                    "longitude": -122.4194,
                },
                "cost_per_hour": 27.0,
                "start_time_windows": [
                    {
                        "start_time": ts(route_start),
                        "end_time": ts(route_start + timedelta(minutes=30)),
                    }
                ],
                "end_time_windows": [
                    {
                        "start_time": ts(route_start + timedelta(hours=3)),
                        "end_time": ts(route_end),
                    }
                ],
            }
        ],
    },
    consider_road_traffic=True,
    populate_transition_polylines=True,
)

response = client.optimize_tours(request=request)

print("total_cost:", response.metrics.total_cost)

for route_index, route in enumerate(response.routes):
    print(f"route {route_index}")
    for visit in route.visits:
        visit_kind = "pickup" if visit.is_pickup else "delivery"
        print(
            visit_kind,
            "shipment_index=",
            visit.shipment_index,
            "visit_request_index=",
            visit.visit_request_index,
            "start_time=",
            visit.start_time,
        )

for skipped in response.skipped_shipments:
    print("skipped shipment index:", skipped.index)
```

Practical notes:

- `ShipmentModel` is the core payload: shipments, vehicles, and global time bounds.
- `penalty_cost` lets the solver skip a shipment instead of forcing an impossible route.
- `response.metrics.total_cost` is the current field to read; `response.total_cost` is deprecated.

### Validate A Request Before Solving

Use `VALIDATE_ONLY` when you want schema and constraint feedback without running a full solve.

```python
validation_request = optimization_v1.OptimizeToursRequest(
    parent=request.parent,
    timeout=request.timeout,
    model=request.model,
    solving_mode=optimization_v1.OptimizeToursRequest.SolvingMode.VALIDATE_ONLY,
    max_validation_errors=100,
)

validation_response = client.optimize_tours(request=validation_request)

for error in validation_response.validation_errors:
    print(error)
```

This is the safest way to catch bad time windows, impossible constraints, or malformed data before moving the request into production traffic. Validation-only requests are also not billed according to the product billing docs.

### Run A Batch Job From Cloud Storage

Use `batch_optimize_tours()` when you have multiple models, large request bodies, or you want results written back to GCS.

```python
import os

from google.cloud import optimization_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
parent = f"projects/{project_id}"

client = optimization_v1.FleetRoutingClient()

request = optimization_v1.BatchOptimizeToursRequest(
    parent=parent,
    model_configs=[
        optimization_v1.AsyncModelConfig(
            display_name="daily-planning-2026-03-13",
            input_config=optimization_v1.InputConfig(
                gcs_source={"uri": "gs://my-bucket/route-inputs/model-001.json"},
                data_format=optimization_v1.DataFormat.JSON,
            ),
            output_config=optimization_v1.OutputConfig(
                gcs_destination={"uri": "gs://my-bucket/route-outputs/model-001/"},
                data_format=optimization_v1.DataFormat.JSON,
            ),
        )
    ],
)

operation = client.batch_optimize_tours(request=request)
response = operation.result(timeout=1800)

print(response)
```

Batch constraints that matter:

- Each input file must contain one `OptimizeToursRequest`.
- Each output file contains one `OptimizeToursResponse`.
- The input and output files must be under the same project.
- This call returns a long-running operation, so plan for polling or waiting on `operation.result()`.

## Common Pitfalls

- Do not use API-key-only patterns from other Google Maps services here. The official Route Optimization setup requires OAuth credentials, and the Python client is built around Google auth credentials.
- Keep all visit and vehicle time windows inside `ShipmentModel.global_start_time` and `global_end_time`.
- Time windows in the same repeated field must be disjoint and in increasing order.
- Visit-request time windows constrain arrival time. The visit duration can extend past the end of that window.
- Keep protobuf timestamps and durations at whole-second precision. The reference docs require `nanos` unset or `0`.
- Use `populate_transition_polylines`, not the deprecated `populate_travel_step_polylines`.
- If you set `use_geodesic_distances=True`, you must also set `geodesic_meters_per_second`.
- Do not read `response.total_cost` in new code; use `response.metrics.total_cost`.

## Version Notes

- PyPI lists `google-cloud-optimization 1.13.0`.
- Parts of the Python reference site still render `latest` pages as `1.12.0`, while newer request-type pages already show `1.13.0`.
- For package pinning, prefer PyPI. For API fields and method shapes, use the current reference URLs under the `latest` docs path.

## Optional Debug Logging

The PyPI package docs describe environment-based logging through `GOOGLE_SDK_PYTHON_LOGGING_SCOPE`.

```bash
export GOOGLE_SDK_PYTHON_LOGGING_SCOPE=google.cloud.optimization_v1
```

That enables default structured logging for this library without changing application code.

## Official Sources

- Python client reference root: https://cloud.google.com/python/docs/reference/optimization/latest
- FleetRoutingClient reference: https://cloud.google.com/python/docs/reference/optimization/latest/google.cloud.optimization_v1.services.fleet_routing.FleetRoutingClient
- OptimizeToursRequest reference: https://cloud.google.com/python/docs/reference/optimization/latest/google.cloud.optimization_v1.types.OptimizeToursRequest
- BatchOptimizeToursRequest reference: https://cloud.google.com/python/docs/reference/optimization/latest/google.cloud.optimization_v1.types.BatchOptimizeToursRequest
- OptimizeToursResponse reference: https://cloud.google.com/python/docs/reference/optimization/latest/google.cloud.optimization_v1.types.OptimizeToursResponse
- Route Optimization setup guide: https://developers.google.com/maps/documentation/route-optimization/cloud-setup
- Route Optimization overview: https://developers.google.com/maps/documentation/route-optimization/overview
- Route Optimization REST reference root: https://developers.google.com/maps/documentation/route-optimization/reference/rest
- `projects.optimizeTours` REST method: https://developers.google.com/maps/documentation/route-optimization/reference/rest/v1/projects/optimizeTours
- `projects.batchOptimizeTours` REST method: https://developers.google.com/maps/documentation/route-optimization/reference/rest/v1/projects/batchOptimizeTours
- First-request guide: https://developers.google.com/maps/documentation/route-optimization/construct-request
- PyPI package page: https://pypi.org/project/google-cloud-optimization/
