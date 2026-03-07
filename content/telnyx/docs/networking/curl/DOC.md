---
name: networking
description: "Configure private networks, WireGuard VPN gateways, internet gateways, and virtual cross connects."
metadata:
  languages: "curl"
  versions: "v2"
  updated-on: "2026-03-06"
  source: maintainer
  tags: "telnyx,networking,vpn,wireguard,private-network"
---

# Telnyx Networking REST API Coding Guidelines

You are a Telnyx Networking API expert. Help the user write correct, production-ready code using the Telnyx REST API with curl.

## Golden Rule: Use the Correct API Endpoints

Always use the documented Telnyx API v2 endpoints at `https://api.telnyx.com/v2/`. Do not fabricate API endpoints or request parameters.

- **Correct:** `curl` with `Authorization: Bearer $TELNYX_API_KEY` header
- **Incorrect:** fabricated endpoints or incorrect authentication headers

## Installation

```text
# curl is pre-installed on macOS, Linux, and Windows 10+
```

## Setup

```bash
export TELNYX_API_KEY="YOUR_API_KEY_HERE"
```

All examples below use `$TELNYX_API_KEY` for authentication.

## List all clusters

`GET /ai/clusters`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/clusters"
```

Returns: `bucket` (string), `created_at` (date-time), `finished_at` (date-time), `min_cluster_size` (integer), `min_subcluster_size` (integer), `status` (enum: pending, starting, running, completed, failed), `task_id` (string)

## Compute new clusters

Starts a background task to compute how the data in an [embedded storage bucket](https://developers.telnyx.com/api-reference/embeddings/embed-documents) is clustered. This helps identify common themes and patterns in the data.

`POST /ai/clusters` — Required: `bucket`

Optional: `files` (array[string]), `min_cluster_size` (integer), `min_subcluster_size` (integer), `prefix` (string)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "bucket": "string"
}' \
  "https://api.telnyx.com/v2/ai/clusters"
```

Returns: `task_id` (string)

## Fetch a cluster

`GET /ai/clusters/{task_id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/clusters/{task_id}"
```

Returns: `bucket` (string), `clusters` (array[object]), `status` (enum: pending, starting, running, completed, failed)

## Delete a cluster

`DELETE /ai/clusters/{task_id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/ai/clusters/{task_id}"
```

## Fetch a cluster visualization

`GET /ai/clusters/{task_id}/graph`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/clusters/{task_id}/graph"
```

## List Integrations

List all available integrations.

`GET /ai/integrations`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/integrations"
```

Returns: `available_tools` (array[string]), `description` (string), `display_name` (string), `id` (string), `logo_url` (string), `name` (string), `status` (enum: disconnected, connected)

## List User Integrations

List user setup integrations

`GET /ai/integrations/connections`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/integrations/connections"
```

Returns: `allowed_tools` (array[string]), `id` (string), `integration_id` (string)

## Get User Integration connection By Id

Get user setup integrations

`GET /ai/integrations/connections/{user_connection_id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/integrations/connections/{user_connection_id}"
```

Returns: `allowed_tools` (array[string]), `id` (string), `integration_id` (string)

## Delete Integration Connection

Delete a specific integration connection.

`DELETE /ai/integrations/connections/{user_connection_id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/ai/integrations/connections/{user_connection_id}"
```

## List Integration By Id

Retrieve integration details

`GET /ai/integrations/{integration_id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/integrations/{integration_id}"
```

Returns: `available_tools` (array[string]), `description` (string), `display_name` (string), `id` (string), `logo_url` (string), `name` (string), `status` (enum: disconnected, connected)

## List all Global IP Allowed Ports

`GET /global_ip_allowed_ports`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/global_ip_allowed_ports"
```

Returns: `data` (array[object])

## Global IP Assignment Health Check Metrics

`GET /global_ip_assignment_health`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/global_ip_assignment_health"
```

Returns: `global_ip` (object), `global_ip_assignment` (object), `health` (object), `timestamp` (date-time)

## List all Global IP assignments

List all Global IP assignments.

`GET /global_ip_assignments`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/global_ip_assignments"
```

Returns: `data` (array[object]), `meta` (object)

## Create a Global IP assignment

Create a Global IP assignment.

`POST /global_ip_assignments`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/global_ip_assignments"
```

Returns: `data` (object)

## Retrieve a Global IP

Retrieve a Global IP assignment.

`GET /global_ip_assignments/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/global_ip_assignments/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `data` (object)

## Update a Global IP assignment

Update a Global IP assignment.

`PATCH /global_ip_assignments/{id}`

```bash
curl \
  -X PATCH \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/global_ip_assignments/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `data` (object)

## Delete a Global IP assignment

Delete a Global IP assignment.

`DELETE /global_ip_assignments/{id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/global_ip_assignments/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `data` (object)

## Global IP Assignment Usage Metrics

`GET /global_ip_assignments_usage`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/global_ip_assignments_usage"
```

Returns: `global_ip` (object), `global_ip_assignment` (object), `received` (object), `timestamp` (date-time), `transmitted` (object)

## List all Global IP Health check types

List all Global IP Health check types.

`GET /global_ip_health_check_types`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/global_ip_health_check_types"
```

Returns: `data` (array[object])

## List all Global IP health checks

List all Global IP health checks.

`GET /global_ip_health_checks`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/global_ip_health_checks"
```

Returns: `data` (array[object]), `meta` (object)

## Create a Global IP health check

Create a Global IP health check.

`POST /global_ip_health_checks`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/global_ip_health_checks"
```

Returns: `data` (object)

## Retrieve a Global IP health check

Retrieve a Global IP health check.

`GET /global_ip_health_checks/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/global_ip_health_checks/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `data` (object)

## Delete a Global IP health check

Delete a Global IP health check.

`DELETE /global_ip_health_checks/{id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/global_ip_health_checks/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `data` (object)

## Global IP Latency Metrics

`GET /global_ip_latency`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/global_ip_latency"
```

Returns: `global_ip` (object), `mean_latency` (object), `percentile_latency` (object), `prober_location` (object), `timestamp` (date-time)

## List all Global IP Protocols

`GET /global_ip_protocols`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/global_ip_protocols"
```

Returns: `data` (array[object])

## Global IP Usage Metrics

`GET /global_ip_usage`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/global_ip_usage"
```

Returns: `global_ip` (object), `received` (object), `timestamp` (date-time), `transmitted` (object)

## List all Global IPs

List all Global IPs.

`GET /global_ips`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/global_ips"
```

Returns: `data` (array[object]), `meta` (object)

## Create a Global IP

Create a Global IP.

`POST /global_ips`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/global_ips"
```

Returns: `data` (object)

## Retrieve a Global IP

Retrieve a Global IP.

`GET /global_ips/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/global_ips/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `data` (object)

## Delete a Global IP

Delete a Global IP.

`DELETE /global_ips/{id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/global_ips/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `data` (object)

## List all Networks

List all Networks.

`GET /networks`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/networks"
```

Returns: `data` (array[object]), `meta` (object)

## Create a Network

Create a new Network.

`POST /networks`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/networks"
```

Returns: `data` (object)

## Retrieve a Network

Retrieve a Network.

`GET /networks/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/networks/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `data` (object)

## Update a Network

Update a Network.

`PATCH /networks/{id}`

```bash
curl \
  -X PATCH \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/networks/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `data` (object)

## Delete a Network

Delete a Network.

`DELETE /networks/{id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/networks/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `data` (object)

## Get Default Gateway status.

`GET /networks/{id}/default_gateway`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/networks/6a09cdc3-8948-47f0-aa62-74ac943d6c58/default_gateway"
```

Returns: `data` (array[object]), `meta` (object)

## Create Default Gateway.

`POST /networks/{id}/default_gateway`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/networks/6a09cdc3-8948-47f0-aa62-74ac943d6c58/default_gateway"
```

Returns: `data` (array[object]), `meta` (object)

## Delete Default Gateway.

`DELETE /networks/{id}/default_gateway`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/networks/6a09cdc3-8948-47f0-aa62-74ac943d6c58/default_gateway"
```

Returns: `data` (array[object]), `meta` (object)

## List all Interfaces for a Network.

`GET /networks/{id}/network_interfaces`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/networks/6a09cdc3-8948-47f0-aa62-74ac943d6c58/network_interfaces"
```

Returns: `data` (array[object]), `meta` (object)

## Get all Private Wireless Gateways

Get all Private Wireless Gateways belonging to the user.

`GET /private_wireless_gateways`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/private_wireless_gateways?filter[name]=my private gateway&filter[ip_range]=192.168.0.0/24&filter[region_code]=dc2&filter[created_at]=2018-02-02T22:25:27.521Z&filter[updated_at]=2018-02-02T22:25:27.521Z"
```

Returns: `assigned_resources` (array[object]), `created_at` (string), `id` (uuid), `ip_range` (string), `name` (string), `network_id` (uuid), `record_type` (string), `region_code` (string), `status` (object), `updated_at` (string)

## Create a Private Wireless Gateway

Asynchronously create a Private Wireless Gateway for SIM cards for a previously created network. This operation may take several minutes so you can check the Private Wireless Gateway status at the section Get a Private Wireless Gateway.

`POST /private_wireless_gateways` — Required: `network_id`, `name`

Optional: `region_code` (string)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "network_id": "6a09cdc3-8948-47f0-aa62-74ac943d6c58",
  "name": "My private wireless gateway",
  "region_code": "dc2"
}' \
  "https://api.telnyx.com/v2/private_wireless_gateways"
```

Returns: `assigned_resources` (array[object]), `created_at` (string), `id` (uuid), `ip_range` (string), `name` (string), `network_id` (uuid), `record_type` (string), `region_code` (string), `status` (object), `updated_at` (string)

## Get a Private Wireless Gateway

Retrieve information about a Private Wireless Gateway.

`GET /private_wireless_gateways/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/private_wireless_gateways/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `assigned_resources` (array[object]), `created_at` (string), `id` (uuid), `ip_range` (string), `name` (string), `network_id` (uuid), `record_type` (string), `region_code` (string), `status` (object), `updated_at` (string)

## Delete a Private Wireless Gateway

Deletes the Private Wireless Gateway.

`DELETE /private_wireless_gateways/{id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/private_wireless_gateways/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `assigned_resources` (array[object]), `created_at` (string), `id` (uuid), `ip_range` (string), `name` (string), `network_id` (uuid), `record_type` (string), `region_code` (string), `status` (object), `updated_at` (string)

## List all Public Internet Gateways

List all Public Internet Gateways.

`GET /public_internet_gateways`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/public_internet_gateways"
```

Returns: `data` (array[object]), `meta` (object)

## Create a Public Internet Gateway

Create a new Public Internet Gateway.

`POST /public_internet_gateways`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/public_internet_gateways"
```

Returns: `data` (object)

## Retrieve a Public Internet Gateway

Retrieve a Public Internet Gateway.

`GET /public_internet_gateways/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/public_internet_gateways/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `data` (object)

## Delete a Public Internet Gateway

Delete a Public Internet Gateway.

`DELETE /public_internet_gateways/{id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/public_internet_gateways/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `data` (object)

## List all Regions

List all regions and the interfaces that region supports

`GET /regions`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/regions"
```

Returns: `code` (string), `created_at` (string), `name` (string), `record_type` (string), `supported_interfaces` (array[string]), `updated_at` (string)

## List all Virtual Cross Connects

List all Virtual Cross Connects.

`GET /virtual_cross_connects`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/virtual_cross_connects"
```

Returns: `data` (array[object]), `meta` (object)

## Create a Virtual Cross Connect

Create a new Virtual Cross Connect.  For AWS and GCE, you have the option of creating the primary connection first and the secondary connection later. You also have the option of disabling the primary and/or secondary connections at any time and later re-enabling them. With Azure, you do not have this option.

`POST /virtual_cross_connects`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/virtual_cross_connects"
```

Returns: `data` (object)

## Retrieve a Virtual Cross Connect

Retrieve a Virtual Cross Connect.

`GET /virtual_cross_connects/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/virtual_cross_connects/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `data` (object)

## Update the Virtual Cross Connect

Update the Virtual Cross Connect.  Cloud IPs can only be patched during the `created` state, as GCE will only inform you of your generated IP once the pending connection requested has been accepted.

`PATCH /virtual_cross_connects/{id}`

```bash
curl \
  -X PATCH \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/virtual_cross_connects/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `data` (object)

## Delete a Virtual Cross Connect

Delete a Virtual Cross Connect.

`DELETE /virtual_cross_connects/{id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/virtual_cross_connects/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `data` (object)

## List Virtual Cross Connect Cloud Coverage

List Virtual Cross Connects Cloud Coverage.  This endpoint shows which cloud regions are available for the `location_code` your Virtual Cross Connect will be provisioned in.

`GET /virtual_cross_connects_coverage`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/virtual_cross_connects_coverage"
```

Returns: `data` (array[object]), `meta` (object)

## List all WireGuard Interfaces

List all WireGuard Interfaces.

`GET /wireguard_interfaces`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/wireguard_interfaces"
```

Returns: `data` (array[object]), `meta` (object)

## Create a WireGuard Interface

Create a new WireGuard Interface. Current limitation of 10 interfaces per user can be created.

`POST /wireguard_interfaces`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/wireguard_interfaces"
```

Returns: `data` (object)

## Retrieve a WireGuard Interfaces

Retrieve a WireGuard Interfaces.

`GET /wireguard_interfaces/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/wireguard_interfaces/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `data` (object)

## Delete a WireGuard Interface

Delete a WireGuard Interface.

`DELETE /wireguard_interfaces/{id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/wireguard_interfaces/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `data` (object)

## List all WireGuard Peers

List all WireGuard peers.

`GET /wireguard_peers`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/wireguard_peers"
```

Returns: `data` (array[object]), `meta` (object)

## Create a WireGuard Peer

Create a new WireGuard Peer. Current limitation of 5 peers per interface can be created.

`POST /wireguard_peers`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/wireguard_peers"
```

Returns: `data` (object)

## Retrieve the WireGuard Peer

Retrieve the WireGuard peer.

`GET /wireguard_peers/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/wireguard_peers/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `data` (object)

## Update the WireGuard Peer

Update the WireGuard peer.

`PATCH /wireguard_peers/{id}`

Optional: `public_key` (string)

```bash
curl \
  -X PATCH \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "public_key": "qF4EqlZq+5JL2IKYY8ij49daYyfKVhevJrcDxdqC8GU="
}' \
  "https://api.telnyx.com/v2/wireguard_peers/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `data` (object)

## Delete the WireGuard Peer

Delete the WireGuard peer.

`DELETE /wireguard_peers/{id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/wireguard_peers/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `data` (object)

## Retrieve Wireguard config template for Peer

`GET /wireguard_peers/{id}/config`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/wireguard_peers/6a09cdc3-8948-47f0-aa62-74ac943d6c58/config"
```
