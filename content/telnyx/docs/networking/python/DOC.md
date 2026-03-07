---
name: networking
description: "Configure private networks, WireGuard VPN gateways, internet gateways, and virtual cross connects."
metadata:
  languages: "python"
  versions: "4.60.0"
  updated-on: "2026-03-06"
  source: maintainer
  tags: "telnyx,networking,vpn,wireguard,private-network"
---

# Telnyx Networking Python SDK Coding Guidelines

You are a Telnyx Networking API expert. Help the user write correct, production-ready code using the official Telnyx Python SDK.

## Golden Rule: Use the Official SDK

Always use the official `telnyx` package. Do not fabricate API endpoints or SDK methods.

- **Correct:** `from telnyx import Telnyx`
- **Incorrect:** `import telnyx` without using the client class

## Installation

```bash
pip install telnyx
```

## Setup

```python
import os
from telnyx import Telnyx

client = Telnyx(
    api_key=os.environ.get("TELNYX_API_KEY"),  # This is the default and can be omitted
)
```

All examples below assume `client` is already initialized as shown above.

## List all clusters

`GET /ai/clusters`

```python
page = client.ai.clusters.list()
page = page.data[0]
print(page.task_id)
```

Returns: `bucket` (string), `created_at` (date-time), `finished_at` (date-time), `min_cluster_size` (integer), `min_subcluster_size` (integer), `status` (enum: pending, starting, running, completed, failed), `task_id` (string)

## Compute new clusters

Starts a background task to compute how the data in an [embedded storage bucket](https://developers.telnyx.com/api-reference/embeddings/embed-documents) is clustered. This helps identify common themes and patterns in the data.

`POST /ai/clusters` — Required: `bucket`

Optional: `files` (array[string]), `min_cluster_size` (integer), `min_subcluster_size` (integer), `prefix` (string)

```python
response = client.ai.clusters.compute(
    bucket="bucket",
)
print(response.data)
```

Returns: `task_id` (string)

## Fetch a cluster

`GET /ai/clusters/{task_id}`

```python
cluster = client.ai.clusters.retrieve(
    task_id="task_id",
)
print(cluster.data)
```

Returns: `bucket` (string), `clusters` (array[object]), `status` (enum: pending, starting, running, completed, failed)

## Delete a cluster

`DELETE /ai/clusters/{task_id}`

```python
client.ai.clusters.delete(
    "task_id",
)
```

## Fetch a cluster visualization

`GET /ai/clusters/{task_id}/graph`

```python
response = client.ai.clusters.fetch_graph(
    task_id="task_id",
)
print(response)
content = response.read()
print(content)
```

## List Integrations

List all available integrations.

`GET /ai/integrations`

```python
integrations = client.ai.integrations.list()
print(integrations.data)
```

Returns: `available_tools` (array[string]), `description` (string), `display_name` (string), `id` (string), `logo_url` (string), `name` (string), `status` (enum: disconnected, connected)

## List User Integrations

List user setup integrations

`GET /ai/integrations/connections`

```python
connections = client.ai.integrations.connections.list()
print(connections.data)
```

Returns: `allowed_tools` (array[string]), `id` (string), `integration_id` (string)

## Get User Integration connection By Id

Get user setup integrations

`GET /ai/integrations/connections/{user_connection_id}`

```python
connection = client.ai.integrations.connections.retrieve(
    "user_connection_id",
)
print(connection.data)
```

Returns: `allowed_tools` (array[string]), `id` (string), `integration_id` (string)

## Delete Integration Connection

Delete a specific integration connection.

`DELETE /ai/integrations/connections/{user_connection_id}`

```python
client.ai.integrations.connections.delete(
    "user_connection_id",
)
```

## List Integration By Id

Retrieve integration details

`GET /ai/integrations/{integration_id}`

```python
integration = client.ai.integrations.retrieve(
    "integration_id",
)
print(integration.id)
```

Returns: `available_tools` (array[string]), `description` (string), `display_name` (string), `id` (string), `logo_url` (string), `name` (string), `status` (enum: disconnected, connected)

## List all Global IP Allowed Ports

`GET /global_ip_allowed_ports`

```python
global_ip_allowed_ports = client.global_ip_allowed_ports.list()
print(global_ip_allowed_ports.data)
```

Returns: `data` (array[object])

## Global IP Assignment Health Check Metrics

`GET /global_ip_assignment_health`

```python
global_ip_assignment_health = client.global_ip_assignment_health.retrieve()
print(global_ip_assignment_health.data)
```

Returns: `global_ip` (object), `global_ip_assignment` (object), `health` (object), `timestamp` (date-time)

## List all Global IP assignments

List all Global IP assignments.

`GET /global_ip_assignments`

```python
page = client.global_ip_assignments.list()
page = page.data[0]
print(page.id)
```

Returns: `data` (array[object]), `meta` (object)

## Create a Global IP assignment

Create a Global IP assignment.

`POST /global_ip_assignments`

```python
global_ip_assignment = client.global_ip_assignments.create()
print(global_ip_assignment.data)
```

Returns: `data` (object)

## Retrieve a Global IP

Retrieve a Global IP assignment.

`GET /global_ip_assignments/{id}`

```python
global_ip_assignment = client.global_ip_assignments.retrieve(
    "6a09cdc3-8948-47f0-aa62-74ac943d6c58",
)
print(global_ip_assignment.data)
```

Returns: `data` (object)

## Update a Global IP assignment

Update a Global IP assignment.

`PATCH /global_ip_assignments/{id}`

```python
global_ip_assignment = client.global_ip_assignments.update(
    global_ip_assignment_id="6a09cdc3-8948-47f0-aa62-74ac943d6c58",
    global_ip_assignment_update_request={},
)
print(global_ip_assignment.data)
```

Returns: `data` (object)

## Delete a Global IP assignment

Delete a Global IP assignment.

`DELETE /global_ip_assignments/{id}`

```python
global_ip_assignment = client.global_ip_assignments.delete(
    "6a09cdc3-8948-47f0-aa62-74ac943d6c58",
)
print(global_ip_assignment.data)
```

Returns: `data` (object)

## Global IP Assignment Usage Metrics

`GET /global_ip_assignments_usage`

```python
global_ip_assignments_usage = client.global_ip_assignments_usage.retrieve()
print(global_ip_assignments_usage.data)
```

Returns: `global_ip` (object), `global_ip_assignment` (object), `received` (object), `timestamp` (date-time), `transmitted` (object)

## List all Global IP Health check types

List all Global IP Health check types.

`GET /global_ip_health_check_types`

```python
global_ip_health_check_types = client.global_ip_health_check_types.list()
print(global_ip_health_check_types.data)
```

Returns: `data` (array[object])

## List all Global IP health checks

List all Global IP health checks.

`GET /global_ip_health_checks`

```python
page = client.global_ip_health_checks.list()
page = page.data[0]
print(page)
```

Returns: `data` (array[object]), `meta` (object)

## Create a Global IP health check

Create a Global IP health check.

`POST /global_ip_health_checks`

```python
global_ip_health_check = client.global_ip_health_checks.create()
print(global_ip_health_check.data)
```

Returns: `data` (object)

## Retrieve a Global IP health check

Retrieve a Global IP health check.

`GET /global_ip_health_checks/{id}`

```python
global_ip_health_check = client.global_ip_health_checks.retrieve(
    "6a09cdc3-8948-47f0-aa62-74ac943d6c58",
)
print(global_ip_health_check.data)
```

Returns: `data` (object)

## Delete a Global IP health check

Delete a Global IP health check.

`DELETE /global_ip_health_checks/{id}`

```python
global_ip_health_check = client.global_ip_health_checks.delete(
    "6a09cdc3-8948-47f0-aa62-74ac943d6c58",
)
print(global_ip_health_check.data)
```

Returns: `data` (object)

## Global IP Latency Metrics

`GET /global_ip_latency`

```python
global_ip_latency = client.global_ip_latency.retrieve()
print(global_ip_latency.data)
```

Returns: `global_ip` (object), `mean_latency` (object), `percentile_latency` (object), `prober_location` (object), `timestamp` (date-time)

## List all Global IP Protocols

`GET /global_ip_protocols`

```python
global_ip_protocols = client.global_ip_protocols.list()
print(global_ip_protocols.data)
```

Returns: `data` (array[object])

## Global IP Usage Metrics

`GET /global_ip_usage`

```python
global_ip_usage = client.global_ip_usage.retrieve()
print(global_ip_usage.data)
```

Returns: `global_ip` (object), `received` (object), `timestamp` (date-time), `transmitted` (object)

## List all Global IPs

List all Global IPs.

`GET /global_ips`

```python
page = client.global_ips.list()
page = page.data[0]
print(page)
```

Returns: `data` (array[object]), `meta` (object)

## Create a Global IP

Create a Global IP.

`POST /global_ips`

```python
global_ip = client.global_ips.create()
print(global_ip.data)
```

Returns: `data` (object)

## Retrieve a Global IP

Retrieve a Global IP.

`GET /global_ips/{id}`

```python
global_ip = client.global_ips.retrieve(
    "6a09cdc3-8948-47f0-aa62-74ac943d6c58",
)
print(global_ip.data)
```

Returns: `data` (object)

## Delete a Global IP

Delete a Global IP.

`DELETE /global_ips/{id}`

```python
global_ip = client.global_ips.delete(
    "6a09cdc3-8948-47f0-aa62-74ac943d6c58",
)
print(global_ip.data)
```

Returns: `data` (object)

## List all Networks

List all Networks.

`GET /networks`

```python
page = client.networks.list()
page = page.data[0]
print(page)
```

Returns: `data` (array[object]), `meta` (object)

## Create a Network

Create a new Network.

`POST /networks`

```python
network = client.networks.create(
    name="test network",
)
print(network.data)
```

Returns: `data` (object)

## Retrieve a Network

Retrieve a Network.

`GET /networks/{id}`

```python
network = client.networks.retrieve(
    "6a09cdc3-8948-47f0-aa62-74ac943d6c58",
)
print(network.data)
```

Returns: `data` (object)

## Update a Network

Update a Network.

`PATCH /networks/{id}`

```python
network = client.networks.update(
    network_id="6a09cdc3-8948-47f0-aa62-74ac943d6c58",
    name="test network",
)
print(network.data)
```

Returns: `data` (object)

## Delete a Network

Delete a Network.

`DELETE /networks/{id}`

```python
network = client.networks.delete(
    "6a09cdc3-8948-47f0-aa62-74ac943d6c58",
)
print(network.data)
```

Returns: `data` (object)

## Get Default Gateway status.

`GET /networks/{id}/default_gateway`

```python
default_gateway = client.networks.default_gateway.retrieve(
    "6a09cdc3-8948-47f0-aa62-74ac943d6c58",
)
print(default_gateway.data)
```

Returns: `data` (array[object]), `meta` (object)

## Create Default Gateway.

`POST /networks/{id}/default_gateway`

```python
default_gateway = client.networks.default_gateway.create(
    network_identifier="6a09cdc3-8948-47f0-aa62-74ac943d6c58",
)
print(default_gateway.data)
```

Returns: `data` (array[object]), `meta` (object)

## Delete Default Gateway.

`DELETE /networks/{id}/default_gateway`

```python
default_gateway = client.networks.default_gateway.delete(
    "6a09cdc3-8948-47f0-aa62-74ac943d6c58",
)
print(default_gateway.data)
```

Returns: `data` (array[object]), `meta` (object)

## List all Interfaces for a Network.

`GET /networks/{id}/network_interfaces`

```python
page = client.networks.list_interfaces(
    id="6a09cdc3-8948-47f0-aa62-74ac943d6c58",
)
page = page.data[0]
print(page)
```

Returns: `data` (array[object]), `meta` (object)

## Get all Private Wireless Gateways

Get all Private Wireless Gateways belonging to the user.

`GET /private_wireless_gateways`

```python
page = client.private_wireless_gateways.list()
page = page.data[0]
print(page.id)
```

Returns: `assigned_resources` (array[object]), `created_at` (string), `id` (uuid), `ip_range` (string), `name` (string), `network_id` (uuid), `record_type` (string), `region_code` (string), `status` (object), `updated_at` (string)

## Create a Private Wireless Gateway

Asynchronously create a Private Wireless Gateway for SIM cards for a previously created network. This operation may take several minutes so you can check the Private Wireless Gateway status at the section Get a Private Wireless Gateway.

`POST /private_wireless_gateways` — Required: `network_id`, `name`

Optional: `region_code` (string)

```python
private_wireless_gateway = client.private_wireless_gateways.create(
    name="My private wireless gateway",
    network_id="6a09cdc3-8948-47f0-aa62-74ac943d6c58",
)
print(private_wireless_gateway.data)
```

Returns: `assigned_resources` (array[object]), `created_at` (string), `id` (uuid), `ip_range` (string), `name` (string), `network_id` (uuid), `record_type` (string), `region_code` (string), `status` (object), `updated_at` (string)

## Get a Private Wireless Gateway

Retrieve information about a Private Wireless Gateway.

`GET /private_wireless_gateways/{id}`

```python
private_wireless_gateway = client.private_wireless_gateways.retrieve(
    "6a09cdc3-8948-47f0-aa62-74ac943d6c58",
)
print(private_wireless_gateway.data)
```

Returns: `assigned_resources` (array[object]), `created_at` (string), `id` (uuid), `ip_range` (string), `name` (string), `network_id` (uuid), `record_type` (string), `region_code` (string), `status` (object), `updated_at` (string)

## Delete a Private Wireless Gateway

Deletes the Private Wireless Gateway.

`DELETE /private_wireless_gateways/{id}`

```python
private_wireless_gateway = client.private_wireless_gateways.delete(
    "6a09cdc3-8948-47f0-aa62-74ac943d6c58",
)
print(private_wireless_gateway.data)
```

Returns: `assigned_resources` (array[object]), `created_at` (string), `id` (uuid), `ip_range` (string), `name` (string), `network_id` (uuid), `record_type` (string), `region_code` (string), `status` (object), `updated_at` (string)

## List all Public Internet Gateways

List all Public Internet Gateways.

`GET /public_internet_gateways`

```python
page = client.public_internet_gateways.list()
page = page.data[0]
print(page)
```

Returns: `data` (array[object]), `meta` (object)

## Create a Public Internet Gateway

Create a new Public Internet Gateway.

`POST /public_internet_gateways`

```python
public_internet_gateway = client.public_internet_gateways.create()
print(public_internet_gateway.data)
```

Returns: `data` (object)

## Retrieve a Public Internet Gateway

Retrieve a Public Internet Gateway.

`GET /public_internet_gateways/{id}`

```python
public_internet_gateway = client.public_internet_gateways.retrieve(
    "6a09cdc3-8948-47f0-aa62-74ac943d6c58",
)
print(public_internet_gateway.data)
```

Returns: `data` (object)

## Delete a Public Internet Gateway

Delete a Public Internet Gateway.

`DELETE /public_internet_gateways/{id}`

```python
public_internet_gateway = client.public_internet_gateways.delete(
    "6a09cdc3-8948-47f0-aa62-74ac943d6c58",
)
print(public_internet_gateway.data)
```

Returns: `data` (object)

## List all Regions

List all regions and the interfaces that region supports

`GET /regions`

```python
regions = client.regions.list()
print(regions.data)
```

Returns: `code` (string), `created_at` (string), `name` (string), `record_type` (string), `supported_interfaces` (array[string]), `updated_at` (string)

## List all Virtual Cross Connects

List all Virtual Cross Connects.

`GET /virtual_cross_connects`

```python
page = client.virtual_cross_connects.list()
page = page.data[0]
print(page)
```

Returns: `data` (array[object]), `meta` (object)

## Create a Virtual Cross Connect

Create a new Virtual Cross Connect.  For AWS and GCE, you have the option of creating the primary connection first and the secondary connection later. You also have the option of disabling the primary and/or secondary connections at any time and later re-enabling them. With Azure, you do not have this option.

`POST /virtual_cross_connects`

```python
virtual_cross_connect = client.virtual_cross_connects.create(
    region_code="ashburn-va",
)
print(virtual_cross_connect.data)
```

Returns: `data` (object)

## Retrieve a Virtual Cross Connect

Retrieve a Virtual Cross Connect.

`GET /virtual_cross_connects/{id}`

```python
virtual_cross_connect = client.virtual_cross_connects.retrieve(
    "6a09cdc3-8948-47f0-aa62-74ac943d6c58",
)
print(virtual_cross_connect.data)
```

Returns: `data` (object)

## Update the Virtual Cross Connect

Update the Virtual Cross Connect.  Cloud IPs can only be patched during the `created` state, as GCE will only inform you of your generated IP once the pending connection requested has been accepted.

`PATCH /virtual_cross_connects/{id}`

```python
virtual_cross_connect = client.virtual_cross_connects.update(
    id="6a09cdc3-8948-47f0-aa62-74ac943d6c58",
)
print(virtual_cross_connect.data)
```

Returns: `data` (object)

## Delete a Virtual Cross Connect

Delete a Virtual Cross Connect.

`DELETE /virtual_cross_connects/{id}`

```python
virtual_cross_connect = client.virtual_cross_connects.delete(
    "6a09cdc3-8948-47f0-aa62-74ac943d6c58",
)
print(virtual_cross_connect.data)
```

Returns: `data` (object)

## List Virtual Cross Connect Cloud Coverage

List Virtual Cross Connects Cloud Coverage.  This endpoint shows which cloud regions are available for the `location_code` your Virtual Cross Connect will be provisioned in.

`GET /virtual_cross_connects_coverage`

```python
page = client.virtual_cross_connects_coverage.list()
page = page.data[0]
print(page.available_bandwidth)
```

Returns: `data` (array[object]), `meta` (object)

## List all WireGuard Interfaces

List all WireGuard Interfaces.

`GET /wireguard_interfaces`

```python
page = client.wireguard_interfaces.list()
page = page.data[0]
print(page)
```

Returns: `data` (array[object]), `meta` (object)

## Create a WireGuard Interface

Create a new WireGuard Interface. Current limitation of 10 interfaces per user can be created.

`POST /wireguard_interfaces`

```python
wireguard_interface = client.wireguard_interfaces.create(
    region_code="ashburn-va",
)
print(wireguard_interface.data)
```

Returns: `data` (object)

## Retrieve a WireGuard Interfaces

Retrieve a WireGuard Interfaces.

`GET /wireguard_interfaces/{id}`

```python
wireguard_interface = client.wireguard_interfaces.retrieve(
    "6a09cdc3-8948-47f0-aa62-74ac943d6c58",
)
print(wireguard_interface.data)
```

Returns: `data` (object)

## Delete a WireGuard Interface

Delete a WireGuard Interface.

`DELETE /wireguard_interfaces/{id}`

```python
wireguard_interface = client.wireguard_interfaces.delete(
    "6a09cdc3-8948-47f0-aa62-74ac943d6c58",
)
print(wireguard_interface.data)
```

Returns: `data` (object)

## List all WireGuard Peers

List all WireGuard peers.

`GET /wireguard_peers`

```python
page = client.wireguard_peers.list()
page = page.data[0]
print(page)
```

Returns: `data` (array[object]), `meta` (object)

## Create a WireGuard Peer

Create a new WireGuard Peer. Current limitation of 5 peers per interface can be created.

`POST /wireguard_peers`

```python
wireguard_peer = client.wireguard_peers.create(
    wireguard_interface_id="6a09cdc3-8948-47f0-aa62-74ac943d6c58",
)
print(wireguard_peer.data)
```

Returns: `data` (object)

## Retrieve the WireGuard Peer

Retrieve the WireGuard peer.

`GET /wireguard_peers/{id}`

```python
wireguard_peer = client.wireguard_peers.retrieve(
    "6a09cdc3-8948-47f0-aa62-74ac943d6c58",
)
print(wireguard_peer.data)
```

Returns: `data` (object)

## Update the WireGuard Peer

Update the WireGuard peer.

`PATCH /wireguard_peers/{id}`

Optional: `public_key` (string)

```python
wireguard_peer = client.wireguard_peers.update(
    id="6a09cdc3-8948-47f0-aa62-74ac943d6c58",
)
print(wireguard_peer.data)
```

Returns: `data` (object)

## Delete the WireGuard Peer

Delete the WireGuard peer.

`DELETE /wireguard_peers/{id}`

```python
wireguard_peer = client.wireguard_peers.delete(
    "6a09cdc3-8948-47f0-aa62-74ac943d6c58",
)
print(wireguard_peer.data)
```

Returns: `data` (object)

## Retrieve Wireguard config template for Peer

`GET /wireguard_peers/{id}/config`

```python
response = client.wireguard_peers.retrieve_config(
    "6a09cdc3-8948-47f0-aa62-74ac943d6c58",
)
print(response)
```
