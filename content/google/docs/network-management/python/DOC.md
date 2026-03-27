---
name: network-management
description: "google-cloud-network-management package guide for Python covering Connectivity Tests and VPC Flow Logs configuration with the Network Management API"
metadata:
  languages: "python"
  versions: "1.32.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,google-cloud-network-management,gcp,network-management,connectivity-tests,vpc-flow-logs,python"
---

# google-cloud-network-management Python Package Guide

`google-cloud-network-management` is the official Google Cloud Python client for the Network Management API. The package's main v1 entry points are:

- `network_management_v1.ReachabilityServiceClient` for Connectivity Tests
- `network_management_v1.VpcFlowLogsServiceClient` for project-level VPC Flow Logs configs
- `network_management_v1.OrganizationVpcFlowLogsServiceClient` for organization-level VPC Flow Logs configs

## Version Note

This guide covers `google-cloud-network-management==1.32.0`, which PyPI and the current Google Cloud Python reference pages list as the latest release on `2026-03-13`.

Google's hosted reference is slightly uneven right now:

- the package root and client-class pages show `1.32.0`
- some type pages still render older headings such as `1.29.0` or `1.30.0`

Use `1.32.0` for dependency pinning, and rely on the latest client method pages for request shapes and signatures.

## Install

```bash
python -m pip install "google-cloud-network-management==1.32.0"
```

PyPI currently declares `Requires: Python >=3.7`.

## Authentication And Prerequisites

Before calling the client:

1. Choose the Google Cloud project or organization you are targeting.
2. Enable the Network Management API.
3. Grant the caller IAM permissions for the resources the test or flow logs config will inspect or modify.
4. Configure Application Default Credentials (ADC).

Enable the API:

```bash
gcloud services enable networkmanagement.googleapis.com
```

Local development with user ADC:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="your-project-id"
```

Service account key fallback:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
export GOOGLE_CLOUD_PROJECT="your-project-id"
```

Google recommends ADC from your local user, attached service account, or workload identity before falling back to a downloaded key file.

## Client Initialization

Default clients use ADC automatically:

```python
import os

from google.cloud import network_management_v1

PROJECT_ID = os.environ["GOOGLE_CLOUD_PROJECT"]
PARENT = f"projects/{PROJECT_ID}/locations/global"

reachability = network_management_v1.ReachabilityServiceClient()
flow_logs = network_management_v1.VpcFlowLogsServiceClient()
```

If you need to authenticate from a specific service account file:

```python
from google.cloud import network_management_v1

reachability = network_management_v1.ReachabilityServiceClient.from_service_account_file(
    "/absolute/path/service-account.json"
)
```

Useful resource name patterns:

- Connectivity Tests parent: `projects/{project_id}/locations/global`
- Connectivity Test name: `projects/{project_id}/locations/global/connectivityTests/{test_id}`
- Project VPC Flow Logs config name: `projects/{project_id}/locations/global/vpcFlowLogsConfigs/{config_id}`
- Organization VPC Flow Logs config parent: `organizations/{organization_id}/locations/global`

## Connectivity Tests

Connectivity Tests are managed through `ReachabilityServiceClient`. Create, update, and rerun operations are long-running operations, so wait for `operation.result()` before assuming the resource or analysis is ready.

### Create a connectivity test

This example checks TCP reachability from one VM IP to another endpoint inside a GCP VPC network:

```python
from google.cloud import network_management_v1


def create_connectivity_test(
    project_id: str,
    test_id: str,
    network_name: str,
    source_ip: str,
    destination_ip: str,
) -> network_management_v1.ConnectivityTest:
    client = network_management_v1.ReachabilityServiceClient()
    parent = f"projects/{project_id}/locations/global"
    network_uri = f"projects/{project_id}/global/networks/{network_name}"

    operation = client.create_connectivity_test(
        parent=parent,
        test_id=test_id,
        resource=network_management_v1.ConnectivityTest(
            description="HTTPS connectivity check",
            source=network_management_v1.Endpoint(
                ip_address=source_ip,
                project_id=project_id,
                network=network_uri,
                network_type=network_management_v1.Endpoint.NetworkType.GCP_NETWORK,
            ),
            destination=network_management_v1.Endpoint(
                ip_address=destination_ip,
                project_id=project_id,
                network=network_uri,
                port=443,
            ),
            protocol="TCP",
        ),
    )
    return operation.result(timeout=300)


test = create_connectivity_test(
    project_id="my-project",
    test_id="https-to-private-service",
    network_name="prod-network",
    source_ip="10.10.0.10",
    destination_ip="10.20.0.15",
)

if (
    test.reachability_details.result
    == network_management_v1.ReachabilityDetails.Result.REACHABLE
):
    print("Reachable")
else:
    print(test.reachability_details.result)
```

Important endpoint fields from the generated types:

- `ip_address` is the IP to test from or to
- `project_id` is useful when the endpoint belongs to Google Cloud resources
- `network` is the full network URI such as `projects/my-project/global/networks/prod-network`
- `port` applies to the destination endpoint
- `protocol` accepts values such as `TCP`, `UDP`, `ICMP`, `ESP`, `AH`, `SCTP`, and `IPIP`

### List, get, and rerun tests

```python
from google.cloud import network_management_v1

client = network_management_v1.ReachabilityServiceClient()
parent = "projects/my-project/locations/global"
test_name = client.connectivity_test_path("my-project", "https-to-private-service")

for test in client.list_connectivity_tests(parent=parent):
    print(test.name, test.reachability_details.result)

current = client.get_connectivity_test(name=test_name)
print(current.description)

rerun_operation = client.rerun_connectivity_test(
    request=network_management_v1.RerunConnectivityTestRequest(name=test_name)
)
rerun_result = rerun_operation.result(timeout=300)
print(rerun_result.reachability_details.result)
```

Use `rerun_connectivity_test()` after route, firewall, or load balancer changes when you want fresh analysis without creating a new test resource.

## VPC Flow Logs Configs

Use `VpcFlowLogsServiceClient` to create and manage project-level VPC Flow Logs configs through the Network Management API. These resources are also global, even when the target subnet or tunnel is regional.

### Create a VPC Flow Logs config for a subnet

```python
from google.cloud import network_management_v1


def create_subnet_flow_logs_config(
    project_id: str,
    region: str,
    subnet_name: str,
    config_id: str,
) -> network_management_v1.VpcFlowLogsConfig:
    client = network_management_v1.VpcFlowLogsServiceClient()
    parent = f"projects/{project_id}/locations/global"
    subnet = f"projects/{project_id}/regions/{region}/subnetworks/{subnet_name}"

    operation = client.create_vpc_flow_logs_config(
        parent=parent,
        vpc_flow_logs_config_id=config_id,
        vpc_flow_logs_config=network_management_v1.VpcFlowLogsConfig(
            subnet=subnet,
            aggregation_interval=(
                network_management_v1.VpcFlowLogsConfig.AggregationInterval.INTERVAL_10_MIN
            ),
            flow_sampling=0.7,
            metadata=(
                network_management_v1.VpcFlowLogsConfig.Metadata.INCLUDE_ALL_METADATA
            ),
        ),
    )
    return operation.result(timeout=300)


config = create_subnet_flow_logs_config(
    project_id="my-project",
    region="us-central1",
    subnet_name="app-subnet",
    config_id="app-subnet-flow-logs",
)
print(config.name)
```

Set exactly one target resource in the config:

- `subnet`
- `network`
- `interconnect_attachment`
- `vpn_tunnel`

### Update and inspect flow logs configs

```python
from google.cloud import network_management_v1
from google.protobuf.field_mask_pb2 import FieldMask

client = network_management_v1.VpcFlowLogsServiceClient()
parent = "projects/my-project/locations/global"
subnet = "projects/my-project/regions/us-central1/subnetworks/app-subnet"
config_name = client.vpc_flow_logs_config_path(
    "my-project",
    "global",
    "app-subnet-flow-logs",
)

update_operation = client.update_vpc_flow_logs_config(
    vpc_flow_logs_config=network_management_v1.VpcFlowLogsConfig(
        name=config_name,
        subnet=subnet,
        aggregation_interval=(
            network_management_v1.VpcFlowLogsConfig.AggregationInterval.INTERVAL_5_SEC
        ),
        flow_sampling=1.0,
        metadata=(
            network_management_v1.VpcFlowLogsConfig.Metadata.EXCLUDE_ALL_METADATA
        ),
    ),
    update_mask=FieldMask(
        paths=["aggregation_interval", "flow_sampling", "metadata"]
    ),
)
updated = update_operation.result(timeout=300)
print(updated.aggregation_interval, updated.flow_sampling)

for config in client.list_vpc_flow_logs_configs(parent=parent):
    print(config.name)

loaded = client.get_vpc_flow_logs_config(name=config_name)
print(loaded.name)
```

### Show the effective flow logs configs for a resource

Network Management API-managed configs do not toggle the older Compute Engine subnet `enableFlowLogs` flag. Use `show_effective_flow_logs_configs()` when you need to see which configs actually apply to a subnet, network, interconnect attachment, or VPN tunnel.

```python
from google.cloud import network_management_v1

client = network_management_v1.VpcFlowLogsServiceClient()

request = network_management_v1.ShowEffectiveFlowLogsConfigsRequest(
    parent="projects/my-project/locations/global",
    resource="projects/my-project/regions/us-central1/subnetworks/app-subnet",
)

for effective in client.show_effective_flow_logs_configs(request=request):
    print(effective)
```

## Organization-Level Flow Logs

If you manage VPC Flow Logs centrally, use `OrganizationVpcFlowLogsServiceClient` with an organization parent such as `organizations/123456789/locations/global`. The org-level service supports the same general create, list, get, update, and delete pattern as the project-level service, plus organization-scoped settings such as `cross_project_metadata`.

The permissions are different from project-level configs. Google documents `roles/networkmanagement.admin` as the role that can create, update, and delete VPC Flow Logs configs at the relevant scope.

## Debug Logging

The package supports environment-based structured logging through the Google client libraries:

```bash
export GOOGLE_SDK_PYTHON_LOGGING_SCOPE="google.cloud.network_management_v1"
```

Use this only in controlled environments; Google notes that client-library debug logging may include sensitive information.

## Common Pitfalls

- Import the module as `from google.cloud import network_management_v1`; the package name and import path are different.
- Connectivity Tests and VPC Flow Logs configs are created under `locations/global`, even if the resource you are testing or configuring lives in a region.
- Connectivity test results are only as specific as the endpoints you provide. In GCP or Shared VPC environments, include `project_id` and the full `network` URI instead of only an IP address.
- `create_connectivity_test()`, `rerun_connectivity_test()`, `create_vpc_flow_logs_config()`, and `update_vpc_flow_logs_config()` are long-running operations. Wait for `result()` before reading the returned resource.
- `VpcFlowLogsConfig` target resources are a oneof. Set only one of `network`, `subnet`, `interconnect_attachment`, or `vpn_tunnel`.
- For project-level flow logs configs, `cross_project_metadata` is not valid. Google documents that field as organization-level only.
- Creating or updating a VPC Flow Logs config with the same effective settings as an existing config on the same target resource fails, even if the config name or description differs.
- If a connectivity test comes back `AMBIGUOUS` or `UNDETERMINED`, check whether the endpoint definition is incomplete, the referenced resource is unsupported, or the caller lacks permissions to inspect part of the path.

## Official Sources

- PyPI: https://pypi.org/project/google-cloud-network-management/
- Google Cloud Python package reference: https://cloud.google.com/python/docs/reference/networkmanagement/latest
- `ReachabilityServiceClient` reference: https://cloud.google.com/python/docs/reference/networkmanagement/latest/google.cloud.network_management_v1.services.reachability_service.ReachabilityServiceClient
- `VpcFlowLogsServiceClient` reference: https://cloud.google.com/python/docs/reference/networkmanagement/latest/google.cloud.network_management_v1.services.vpc_flow_logs_service.VpcFlowLogsServiceClient
- Connectivity Tests overview: https://cloud.google.com/network-intelligence-center/docs/connectivity-tests/concepts/overview
- Connectivity Tests how-to: https://cloud.google.com/network-intelligence-center/docs/connectivity-tests/how-to/running-connectivity-tests
- VPC Flow Logs config overview: https://cloud.google.com/vpc/docs/network-management-api
- VPC Flow Logs config how-to: https://cloud.google.com/vpc/docs/using-flow-logs
- ADC setup: https://cloud.google.com/docs/authentication/set-up-adc-local-dev-environment
