---
name: networking
description: "Configure private networks, WireGuard VPN gateways, internet gateways, and virtual cross connects."
metadata:
  languages: "ruby"
  versions: "5.52.0"
  updated-on: "2026-03-06"
  source: maintainer
  tags: "telnyx,networking,vpn,wireguard,private-network"
---

# Telnyx Networking Ruby SDK Coding Guidelines

You are a Telnyx Networking API expert. Help the user write correct, production-ready code using the official Telnyx Ruby SDK.

## Golden Rule: Use the Official SDK

Always use the official `telnyx` package. Do not fabricate API endpoints or SDK methods.

- **Correct:** `require "telnyx"`
- **Incorrect:** unofficial gems or raw HTTP calls

## Installation

```bash
gem install telnyx
```

## Setup

```ruby
require "telnyx"

client = Telnyx::Client.new(
  api_key: ENV["TELNYX_API_KEY"], # This is the default and can be omitted
)
```

All examples below assume `client` is already initialized as shown above.

## List all clusters

`GET /ai/clusters`

```ruby
page = client.ai.clusters.list

puts(page)
```

Returns: `bucket` (string), `created_at` (date-time), `finished_at` (date-time), `min_cluster_size` (integer), `min_subcluster_size` (integer), `status` (enum: pending, starting, running, completed, failed), `task_id` (string)

## Compute new clusters

Starts a background task to compute how the data in an [embedded storage bucket](https://developers.telnyx.com/api-reference/embeddings/embed-documents) is clustered. This helps identify common themes and patterns in the data.

`POST /ai/clusters` — Required: `bucket`

Optional: `files` (array[string]), `min_cluster_size` (integer), `min_subcluster_size` (integer), `prefix` (string)

```ruby
response = client.ai.clusters.compute(bucket: "bucket")

puts(response)
```

Returns: `task_id` (string)

## Fetch a cluster

`GET /ai/clusters/{task_id}`

```ruby
cluster = client.ai.clusters.retrieve("task_id")

puts(cluster)
```

Returns: `bucket` (string), `clusters` (array[object]), `status` (enum: pending, starting, running, completed, failed)

## Delete a cluster

`DELETE /ai/clusters/{task_id}`

```ruby
result = client.ai.clusters.delete("task_id")

puts(result)
```

## Fetch a cluster visualization

`GET /ai/clusters/{task_id}/graph`

```ruby
response = client.ai.clusters.fetch_graph("task_id")

puts(response)
```

## List Integrations

List all available integrations.

`GET /ai/integrations`

```ruby
integrations = client.ai.integrations.list

puts(integrations)
```

Returns: `available_tools` (array[string]), `description` (string), `display_name` (string), `id` (string), `logo_url` (string), `name` (string), `status` (enum: disconnected, connected)

## List User Integrations

List user setup integrations

`GET /ai/integrations/connections`

```ruby
connections = client.ai.integrations.connections.list

puts(connections)
```

Returns: `allowed_tools` (array[string]), `id` (string), `integration_id` (string)

## Get User Integration connection By Id

Get user setup integrations

`GET /ai/integrations/connections/{user_connection_id}`

```ruby
connection = client.ai.integrations.connections.retrieve("user_connection_id")

puts(connection)
```

Returns: `allowed_tools` (array[string]), `id` (string), `integration_id` (string)

## Delete Integration Connection

Delete a specific integration connection.

`DELETE /ai/integrations/connections/{user_connection_id}`

```ruby
result = client.ai.integrations.connections.delete("user_connection_id")

puts(result)
```

## List Integration By Id

Retrieve integration details

`GET /ai/integrations/{integration_id}`

```ruby
integration = client.ai.integrations.retrieve("integration_id")

puts(integration)
```

Returns: `available_tools` (array[string]), `description` (string), `display_name` (string), `id` (string), `logo_url` (string), `name` (string), `status` (enum: disconnected, connected)

## List all Global IP Allowed Ports

`GET /global_ip_allowed_ports`

```ruby
global_ip_allowed_ports = client.global_ip_allowed_ports.list

puts(global_ip_allowed_ports)
```

Returns: `data` (array[object])

## Global IP Assignment Health Check Metrics

`GET /global_ip_assignment_health`

```ruby
global_ip_assignment_health = client.global_ip_assignment_health.retrieve

puts(global_ip_assignment_health)
```

Returns: `global_ip` (object), `global_ip_assignment` (object), `health` (object), `timestamp` (date-time)

## List all Global IP assignments

List all Global IP assignments.

`GET /global_ip_assignments`

```ruby
page = client.global_ip_assignments.list

puts(page)
```

Returns: `data` (array[object]), `meta` (object)

## Create a Global IP assignment

Create a Global IP assignment.

`POST /global_ip_assignments`

```ruby
global_ip_assignment = client.global_ip_assignments.create

puts(global_ip_assignment)
```

Returns: `data` (object)

## Retrieve a Global IP

Retrieve a Global IP assignment.

`GET /global_ip_assignments/{id}`

```ruby
global_ip_assignment = client.global_ip_assignments.retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(global_ip_assignment)
```

Returns: `data` (object)

## Update a Global IP assignment

Update a Global IP assignment.

`PATCH /global_ip_assignments/{id}`

```ruby
global_ip_assignment = client.global_ip_assignments.update(
  "6a09cdc3-8948-47f0-aa62-74ac943d6c58",
  global_ip_assignment_update_request: {}
)

puts(global_ip_assignment)
```

Returns: `data` (object)

## Delete a Global IP assignment

Delete a Global IP assignment.

`DELETE /global_ip_assignments/{id}`

```ruby
global_ip_assignment = client.global_ip_assignments.delete("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(global_ip_assignment)
```

Returns: `data` (object)

## Global IP Assignment Usage Metrics

`GET /global_ip_assignments_usage`

```ruby
global_ip_assignments_usage = client.global_ip_assignments_usage.retrieve

puts(global_ip_assignments_usage)
```

Returns: `global_ip` (object), `global_ip_assignment` (object), `received` (object), `timestamp` (date-time), `transmitted` (object)

## List all Global IP Health check types

List all Global IP Health check types.

`GET /global_ip_health_check_types`

```ruby
global_ip_health_check_types = client.global_ip_health_check_types.list

puts(global_ip_health_check_types)
```

Returns: `data` (array[object])

## List all Global IP health checks

List all Global IP health checks.

`GET /global_ip_health_checks`

```ruby
page = client.global_ip_health_checks.list

puts(page)
```

Returns: `data` (array[object]), `meta` (object)

## Create a Global IP health check

Create a Global IP health check.

`POST /global_ip_health_checks`

```ruby
global_ip_health_check = client.global_ip_health_checks.create

puts(global_ip_health_check)
```

Returns: `data` (object)

## Retrieve a Global IP health check

Retrieve a Global IP health check.

`GET /global_ip_health_checks/{id}`

```ruby
global_ip_health_check = client.global_ip_health_checks.retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(global_ip_health_check)
```

Returns: `data` (object)

## Delete a Global IP health check

Delete a Global IP health check.

`DELETE /global_ip_health_checks/{id}`

```ruby
global_ip_health_check = client.global_ip_health_checks.delete("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(global_ip_health_check)
```

Returns: `data` (object)

## Global IP Latency Metrics

`GET /global_ip_latency`

```ruby
global_ip_latency = client.global_ip_latency.retrieve

puts(global_ip_latency)
```

Returns: `global_ip` (object), `mean_latency` (object), `percentile_latency` (object), `prober_location` (object), `timestamp` (date-time)

## List all Global IP Protocols

`GET /global_ip_protocols`

```ruby
global_ip_protocols = client.global_ip_protocols.list

puts(global_ip_protocols)
```

Returns: `data` (array[object])

## Global IP Usage Metrics

`GET /global_ip_usage`

```ruby
global_ip_usage = client.global_ip_usage.retrieve

puts(global_ip_usage)
```

Returns: `global_ip` (object), `received` (object), `timestamp` (date-time), `transmitted` (object)

## List all Global IPs

List all Global IPs.

`GET /global_ips`

```ruby
page = client.global_ips.list

puts(page)
```

Returns: `data` (array[object]), `meta` (object)

## Create a Global IP

Create a Global IP.

`POST /global_ips`

```ruby
global_ip = client.global_ips.create

puts(global_ip)
```

Returns: `data` (object)

## Retrieve a Global IP

Retrieve a Global IP.

`GET /global_ips/{id}`

```ruby
global_ip = client.global_ips.retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(global_ip)
```

Returns: `data` (object)

## Delete a Global IP

Delete a Global IP.

`DELETE /global_ips/{id}`

```ruby
global_ip = client.global_ips.delete("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(global_ip)
```

Returns: `data` (object)

## List all Networks

List all Networks.

`GET /networks`

```ruby
page = client.networks.list

puts(page)
```

Returns: `data` (array[object]), `meta` (object)

## Create a Network

Create a new Network.

`POST /networks`

```ruby
network = client.networks.create(name: "test network")

puts(network)
```

Returns: `data` (object)

## Retrieve a Network

Retrieve a Network.

`GET /networks/{id}`

```ruby
network = client.networks.retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(network)
```

Returns: `data` (object)

## Update a Network

Update a Network.

`PATCH /networks/{id}`

```ruby
network = client.networks.update("6a09cdc3-8948-47f0-aa62-74ac943d6c58", name: "test network")

puts(network)
```

Returns: `data` (object)

## Delete a Network

Delete a Network.

`DELETE /networks/{id}`

```ruby
network = client.networks.delete("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(network)
```

Returns: `data` (object)

## Get Default Gateway status.

`GET /networks/{id}/default_gateway`

```ruby
default_gateway = client.networks.default_gateway.retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(default_gateway)
```

Returns: `data` (array[object]), `meta` (object)

## Create Default Gateway.

`POST /networks/{id}/default_gateway`

```ruby
default_gateway = client.networks.default_gateway.create("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(default_gateway)
```

Returns: `data` (array[object]), `meta` (object)

## Delete Default Gateway.

`DELETE /networks/{id}/default_gateway`

```ruby
default_gateway = client.networks.default_gateway.delete("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(default_gateway)
```

Returns: `data` (array[object]), `meta` (object)

## List all Interfaces for a Network.

`GET /networks/{id}/network_interfaces`

```ruby
page = client.networks.list_interfaces("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(page)
```

Returns: `data` (array[object]), `meta` (object)

## Get all Private Wireless Gateways

Get all Private Wireless Gateways belonging to the user.

`GET /private_wireless_gateways`

```ruby
page = client.private_wireless_gateways.list

puts(page)
```

Returns: `assigned_resources` (array[object]), `created_at` (string), `id` (uuid), `ip_range` (string), `name` (string), `network_id` (uuid), `record_type` (string), `region_code` (string), `status` (object), `updated_at` (string)

## Create a Private Wireless Gateway

Asynchronously create a Private Wireless Gateway for SIM cards for a previously created network. This operation may take several minutes so you can check the Private Wireless Gateway status at the section Get a Private Wireless Gateway.

`POST /private_wireless_gateways` — Required: `network_id`, `name`

Optional: `region_code` (string)

```ruby
private_wireless_gateway = client.private_wireless_gateways.create(
  name: "My private wireless gateway",
  network_id: "6a09cdc3-8948-47f0-aa62-74ac943d6c58"
)

puts(private_wireless_gateway)
```

Returns: `assigned_resources` (array[object]), `created_at` (string), `id` (uuid), `ip_range` (string), `name` (string), `network_id` (uuid), `record_type` (string), `region_code` (string), `status` (object), `updated_at` (string)

## Get a Private Wireless Gateway

Retrieve information about a Private Wireless Gateway.

`GET /private_wireless_gateways/{id}`

```ruby
private_wireless_gateway = client.private_wireless_gateways.retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(private_wireless_gateway)
```

Returns: `assigned_resources` (array[object]), `created_at` (string), `id` (uuid), `ip_range` (string), `name` (string), `network_id` (uuid), `record_type` (string), `region_code` (string), `status` (object), `updated_at` (string)

## Delete a Private Wireless Gateway

Deletes the Private Wireless Gateway.

`DELETE /private_wireless_gateways/{id}`

```ruby
private_wireless_gateway = client.private_wireless_gateways.delete("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(private_wireless_gateway)
```

Returns: `assigned_resources` (array[object]), `created_at` (string), `id` (uuid), `ip_range` (string), `name` (string), `network_id` (uuid), `record_type` (string), `region_code` (string), `status` (object), `updated_at` (string)

## List all Public Internet Gateways

List all Public Internet Gateways.

`GET /public_internet_gateways`

```ruby
page = client.public_internet_gateways.list

puts(page)
```

Returns: `data` (array[object]), `meta` (object)

## Create a Public Internet Gateway

Create a new Public Internet Gateway.

`POST /public_internet_gateways`

```ruby
public_internet_gateway = client.public_internet_gateways.create

puts(public_internet_gateway)
```

Returns: `data` (object)

## Retrieve a Public Internet Gateway

Retrieve a Public Internet Gateway.

`GET /public_internet_gateways/{id}`

```ruby
public_internet_gateway = client.public_internet_gateways.retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(public_internet_gateway)
```

Returns: `data` (object)

## Delete a Public Internet Gateway

Delete a Public Internet Gateway.

`DELETE /public_internet_gateways/{id}`

```ruby
public_internet_gateway = client.public_internet_gateways.delete("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(public_internet_gateway)
```

Returns: `data` (object)

## List all Regions

List all regions and the interfaces that region supports

`GET /regions`

```ruby
regions = client.regions.list

puts(regions)
```

Returns: `code` (string), `created_at` (string), `name` (string), `record_type` (string), `supported_interfaces` (array[string]), `updated_at` (string)

## List all Virtual Cross Connects

List all Virtual Cross Connects.

`GET /virtual_cross_connects`

```ruby
page = client.virtual_cross_connects.list

puts(page)
```

Returns: `data` (array[object]), `meta` (object)

## Create a Virtual Cross Connect

Create a new Virtual Cross Connect.  For AWS and GCE, you have the option of creating the primary connection first and the secondary connection later. You also have the option of disabling the primary and/or secondary connections at any time and later re-enabling them. With Azure, you do not have this option.

`POST /virtual_cross_connects`

```ruby
virtual_cross_connect = client.virtual_cross_connects.create(region_code: "ashburn-va")

puts(virtual_cross_connect)
```

Returns: `data` (object)

## Retrieve a Virtual Cross Connect

Retrieve a Virtual Cross Connect.

`GET /virtual_cross_connects/{id}`

```ruby
virtual_cross_connect = client.virtual_cross_connects.retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(virtual_cross_connect)
```

Returns: `data` (object)

## Update the Virtual Cross Connect

Update the Virtual Cross Connect.  Cloud IPs can only be patched during the `created` state, as GCE will only inform you of your generated IP once the pending connection requested has been accepted.

`PATCH /virtual_cross_connects/{id}`

```ruby
virtual_cross_connect = client.virtual_cross_connects.update("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(virtual_cross_connect)
```

Returns: `data` (object)

## Delete a Virtual Cross Connect

Delete a Virtual Cross Connect.

`DELETE /virtual_cross_connects/{id}`

```ruby
virtual_cross_connect = client.virtual_cross_connects.delete("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(virtual_cross_connect)
```

Returns: `data` (object)

## List Virtual Cross Connect Cloud Coverage

List Virtual Cross Connects Cloud Coverage.  This endpoint shows which cloud regions are available for the `location_code` your Virtual Cross Connect will be provisioned in.

`GET /virtual_cross_connects_coverage`

```ruby
page = client.virtual_cross_connects_coverage.list

puts(page)
```

Returns: `data` (array[object]), `meta` (object)

## List all WireGuard Interfaces

List all WireGuard Interfaces.

`GET /wireguard_interfaces`

```ruby
page = client.wireguard_interfaces.list

puts(page)
```

Returns: `data` (array[object]), `meta` (object)

## Create a WireGuard Interface

Create a new WireGuard Interface. Current limitation of 10 interfaces per user can be created.

`POST /wireguard_interfaces`

```ruby
wireguard_interface = client.wireguard_interfaces.create(region_code: "ashburn-va")

puts(wireguard_interface)
```

Returns: `data` (object)

## Retrieve a WireGuard Interfaces

Retrieve a WireGuard Interfaces.

`GET /wireguard_interfaces/{id}`

```ruby
wireguard_interface = client.wireguard_interfaces.retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(wireguard_interface)
```

Returns: `data` (object)

## Delete a WireGuard Interface

Delete a WireGuard Interface.

`DELETE /wireguard_interfaces/{id}`

```ruby
wireguard_interface = client.wireguard_interfaces.delete("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(wireguard_interface)
```

Returns: `data` (object)

## List all WireGuard Peers

List all WireGuard peers.

`GET /wireguard_peers`

```ruby
page = client.wireguard_peers.list

puts(page)
```

Returns: `data` (array[object]), `meta` (object)

## Create a WireGuard Peer

Create a new WireGuard Peer. Current limitation of 5 peers per interface can be created.

`POST /wireguard_peers`

```ruby
wireguard_peer = client.wireguard_peers.create(wireguard_interface_id: "6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(wireguard_peer)
```

Returns: `data` (object)

## Retrieve the WireGuard Peer

Retrieve the WireGuard peer.

`GET /wireguard_peers/{id}`

```ruby
wireguard_peer = client.wireguard_peers.retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(wireguard_peer)
```

Returns: `data` (object)

## Update the WireGuard Peer

Update the WireGuard peer.

`PATCH /wireguard_peers/{id}`

Optional: `public_key` (string)

```ruby
wireguard_peer = client.wireguard_peers.update("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(wireguard_peer)
```

Returns: `data` (object)

## Delete the WireGuard Peer

Delete the WireGuard peer.

`DELETE /wireguard_peers/{id}`

```ruby
wireguard_peer = client.wireguard_peers.delete("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(wireguard_peer)
```

Returns: `data` (object)

## Retrieve Wireguard config template for Peer

`GET /wireguard_peers/{id}/config`

```ruby
response = client.wireguard_peers.retrieve_config("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(response)
```
