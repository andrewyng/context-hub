---
name: networking
description: "Configure private networks, WireGuard VPN gateways, internet gateways, and virtual cross connects."
metadata:
  languages: "javascript"
  versions: "6.4.0"
  updated-on: "2026-03-06"
  source: maintainer
  tags: "telnyx,networking,vpn,wireguard,private-network"
---

# Telnyx Networking JavaScript SDK Coding Guidelines

You are a Telnyx Networking API expert. Help the user write correct, production-ready code using the official Telnyx JavaScript SDK.

## Golden Rule: Use the Official SDK

Always use the official `telnyx` package. Do not fabricate API endpoints or SDK methods.

- **Correct:** `import Telnyx from 'telnyx'`
- **Incorrect:** unofficial or outdated Telnyx packages

## Installation

```bash
npm install telnyx
```

## Setup

```javascript
import Telnyx from 'telnyx';

const client = new Telnyx({
  apiKey: process.env['TELNYX_API_KEY'], // This is the default and can be omitted
});
```

All examples below assume `client` is already initialized as shown above.

## List all clusters

`GET /ai/clusters`

```javascript
// Automatically fetches more pages as needed.
for await (const clusterListResponse of client.ai.clusters.list()) {
  console.log(clusterListResponse.task_id);
}
```

Returns: `bucket` (string), `created_at` (date-time), `finished_at` (date-time), `min_cluster_size` (integer), `min_subcluster_size` (integer), `status` (enum: pending, starting, running, completed, failed), `task_id` (string)

## Compute new clusters

Starts a background task to compute how the data in an [embedded storage bucket](https://developers.telnyx.com/api-reference/embeddings/embed-documents) is clustered. This helps identify common themes and patterns in the data.

`POST /ai/clusters` — Required: `bucket`

Optional: `files` (array[string]), `min_cluster_size` (integer), `min_subcluster_size` (integer), `prefix` (string)

```javascript
const response = await client.ai.clusters.compute({ bucket: 'bucket' });

console.log(response.data);
```

Returns: `task_id` (string)

## Fetch a cluster

`GET /ai/clusters/{task_id}`

```javascript
const cluster = await client.ai.clusters.retrieve('task_id');

console.log(cluster.data);
```

Returns: `bucket` (string), `clusters` (array[object]), `status` (enum: pending, starting, running, completed, failed)

## Delete a cluster

`DELETE /ai/clusters/{task_id}`

```javascript
await client.ai.clusters.delete('task_id');
```

## Fetch a cluster visualization

`GET /ai/clusters/{task_id}/graph`

```javascript
const response = await client.ai.clusters.fetchGraph('task_id');

console.log(response);

const content = await response.blob();
console.log(content);
```

## List Integrations

List all available integrations.

`GET /ai/integrations`

```javascript
const integrations = await client.ai.integrations.list();

console.log(integrations.data);
```

Returns: `available_tools` (array[string]), `description` (string), `display_name` (string), `id` (string), `logo_url` (string), `name` (string), `status` (enum: disconnected, connected)

## List User Integrations

List user setup integrations

`GET /ai/integrations/connections`

```javascript
const connections = await client.ai.integrations.connections.list();

console.log(connections.data);
```

Returns: `allowed_tools` (array[string]), `id` (string), `integration_id` (string)

## Get User Integration connection By Id

Get user setup integrations

`GET /ai/integrations/connections/{user_connection_id}`

```javascript
const connection = await client.ai.integrations.connections.retrieve('user_connection_id');

console.log(connection.data);
```

Returns: `allowed_tools` (array[string]), `id` (string), `integration_id` (string)

## Delete Integration Connection

Delete a specific integration connection.

`DELETE /ai/integrations/connections/{user_connection_id}`

```javascript
await client.ai.integrations.connections.delete('user_connection_id');
```

## List Integration By Id

Retrieve integration details

`GET /ai/integrations/{integration_id}`

```javascript
const integration = await client.ai.integrations.retrieve('integration_id');

console.log(integration.id);
```

Returns: `available_tools` (array[string]), `description` (string), `display_name` (string), `id` (string), `logo_url` (string), `name` (string), `status` (enum: disconnected, connected)

## List all Global IP Allowed Ports

`GET /global_ip_allowed_ports`

```javascript
const globalIPAllowedPorts = await client.globalIPAllowedPorts.list();

console.log(globalIPAllowedPorts.data);
```

Returns: `data` (array[object])

## Global IP Assignment Health Check Metrics

`GET /global_ip_assignment_health`

```javascript
const globalIPAssignmentHealth = await client.globalIPAssignmentHealth.retrieve();

console.log(globalIPAssignmentHealth.data);
```

Returns: `global_ip` (object), `global_ip_assignment` (object), `health` (object), `timestamp` (date-time)

## List all Global IP assignments

List all Global IP assignments.

`GET /global_ip_assignments`

```javascript
// Automatically fetches more pages as needed.
for await (const globalIPAssignment of client.globalIPAssignments.list()) {
  console.log(globalIPAssignment.id);
}
```

Returns: `data` (array[object]), `meta` (object)

## Create a Global IP assignment

Create a Global IP assignment.

`POST /global_ip_assignments`

```javascript
const globalIPAssignment = await client.globalIPAssignments.create();

console.log(globalIPAssignment.data);
```

Returns: `data` (object)

## Retrieve a Global IP

Retrieve a Global IP assignment.

`GET /global_ip_assignments/{id}`

```javascript
const globalIPAssignment = await client.globalIPAssignments.retrieve(
  '6a09cdc3-8948-47f0-aa62-74ac943d6c58',
);

console.log(globalIPAssignment.data);
```

Returns: `data` (object)

## Update a Global IP assignment

Update a Global IP assignment.

`PATCH /global_ip_assignments/{id}`

```javascript
const globalIPAssignment = await client.globalIPAssignments.update(
  '6a09cdc3-8948-47f0-aa62-74ac943d6c58',
  { globalIpAssignmentUpdateRequest: {} },
);

console.log(globalIPAssignment.data);
```

Returns: `data` (object)

## Delete a Global IP assignment

Delete a Global IP assignment.

`DELETE /global_ip_assignments/{id}`

```javascript
const globalIPAssignment = await client.globalIPAssignments.delete(
  '6a09cdc3-8948-47f0-aa62-74ac943d6c58',
);

console.log(globalIPAssignment.data);
```

Returns: `data` (object)

## Global IP Assignment Usage Metrics

`GET /global_ip_assignments_usage`

```javascript
const globalIPAssignmentsUsage = await client.globalIPAssignmentsUsage.retrieve();

console.log(globalIPAssignmentsUsage.data);
```

Returns: `global_ip` (object), `global_ip_assignment` (object), `received` (object), `timestamp` (date-time), `transmitted` (object)

## List all Global IP Health check types

List all Global IP Health check types.

`GET /global_ip_health_check_types`

```javascript
const globalIPHealthCheckTypes = await client.globalIPHealthCheckTypes.list();

console.log(globalIPHealthCheckTypes.data);
```

Returns: `data` (array[object])

## List all Global IP health checks

List all Global IP health checks.

`GET /global_ip_health_checks`

```javascript
// Automatically fetches more pages as needed.
for await (const globalIPHealthCheckListResponse of client.globalIPHealthChecks.list()) {
  console.log(globalIPHealthCheckListResponse);
}
```

Returns: `data` (array[object]), `meta` (object)

## Create a Global IP health check

Create a Global IP health check.

`POST /global_ip_health_checks`

```javascript
const globalIPHealthCheck = await client.globalIPHealthChecks.create();

console.log(globalIPHealthCheck.data);
```

Returns: `data` (object)

## Retrieve a Global IP health check

Retrieve a Global IP health check.

`GET /global_ip_health_checks/{id}`

```javascript
const globalIPHealthCheck = await client.globalIPHealthChecks.retrieve(
  '6a09cdc3-8948-47f0-aa62-74ac943d6c58',
);

console.log(globalIPHealthCheck.data);
```

Returns: `data` (object)

## Delete a Global IP health check

Delete a Global IP health check.

`DELETE /global_ip_health_checks/{id}`

```javascript
const globalIPHealthCheck = await client.globalIPHealthChecks.delete(
  '6a09cdc3-8948-47f0-aa62-74ac943d6c58',
);

console.log(globalIPHealthCheck.data);
```

Returns: `data` (object)

## Global IP Latency Metrics

`GET /global_ip_latency`

```javascript
const globalIPLatency = await client.globalIPLatency.retrieve();

console.log(globalIPLatency.data);
```

Returns: `global_ip` (object), `mean_latency` (object), `percentile_latency` (object), `prober_location` (object), `timestamp` (date-time)

## List all Global IP Protocols

`GET /global_ip_protocols`

```javascript
const globalIPProtocols = await client.globalIPProtocols.list();

console.log(globalIPProtocols.data);
```

Returns: `data` (array[object])

## Global IP Usage Metrics

`GET /global_ip_usage`

```javascript
const globalIPUsage = await client.globalIPUsage.retrieve();

console.log(globalIPUsage.data);
```

Returns: `global_ip` (object), `received` (object), `timestamp` (date-time), `transmitted` (object)

## List all Global IPs

List all Global IPs.

`GET /global_ips`

```javascript
// Automatically fetches more pages as needed.
for await (const globalIPListResponse of client.globalIPs.list()) {
  console.log(globalIPListResponse);
}
```

Returns: `data` (array[object]), `meta` (object)

## Create a Global IP

Create a Global IP.

`POST /global_ips`

```javascript
const globalIP = await client.globalIPs.create();

console.log(globalIP.data);
```

Returns: `data` (object)

## Retrieve a Global IP

Retrieve a Global IP.

`GET /global_ips/{id}`

```javascript
const globalIP = await client.globalIPs.retrieve('6a09cdc3-8948-47f0-aa62-74ac943d6c58');

console.log(globalIP.data);
```

Returns: `data` (object)

## Delete a Global IP

Delete a Global IP.

`DELETE /global_ips/{id}`

```javascript
const globalIP = await client.globalIPs.delete('6a09cdc3-8948-47f0-aa62-74ac943d6c58');

console.log(globalIP.data);
```

Returns: `data` (object)

## List all Networks

List all Networks.

`GET /networks`

```javascript
// Automatically fetches more pages as needed.
for await (const networkListResponse of client.networks.list()) {
  console.log(networkListResponse);
}
```

Returns: `data` (array[object]), `meta` (object)

## Create a Network

Create a new Network.

`POST /networks`

```javascript
const network = await client.networks.create({ name: 'test network' });

console.log(network.data);
```

Returns: `data` (object)

## Retrieve a Network

Retrieve a Network.

`GET /networks/{id}`

```javascript
const network = await client.networks.retrieve('6a09cdc3-8948-47f0-aa62-74ac943d6c58');

console.log(network.data);
```

Returns: `data` (object)

## Update a Network

Update a Network.

`PATCH /networks/{id}`

```javascript
const network = await client.networks.update('6a09cdc3-8948-47f0-aa62-74ac943d6c58', {
  name: 'test network',
});

console.log(network.data);
```

Returns: `data` (object)

## Delete a Network

Delete a Network.

`DELETE /networks/{id}`

```javascript
const network = await client.networks.delete('6a09cdc3-8948-47f0-aa62-74ac943d6c58');

console.log(network.data);
```

Returns: `data` (object)

## Get Default Gateway status.

`GET /networks/{id}/default_gateway`

```javascript
const defaultGateway = await client.networks.defaultGateway.retrieve(
  '6a09cdc3-8948-47f0-aa62-74ac943d6c58',
);

console.log(defaultGateway.data);
```

Returns: `data` (array[object]), `meta` (object)

## Create Default Gateway.

`POST /networks/{id}/default_gateway`

```javascript
const defaultGateway = await client.networks.defaultGateway.create(
  '6a09cdc3-8948-47f0-aa62-74ac943d6c58',
);

console.log(defaultGateway.data);
```

Returns: `data` (array[object]), `meta` (object)

## Delete Default Gateway.

`DELETE /networks/{id}/default_gateway`

```javascript
const defaultGateway = await client.networks.defaultGateway.delete(
  '6a09cdc3-8948-47f0-aa62-74ac943d6c58',
);

console.log(defaultGateway.data);
```

Returns: `data` (array[object]), `meta` (object)

## List all Interfaces for a Network.

`GET /networks/{id}/network_interfaces`

```javascript
// Automatically fetches more pages as needed.
for await (const networkListInterfacesResponse of client.networks.listInterfaces(
  '6a09cdc3-8948-47f0-aa62-74ac943d6c58',
)) {
  console.log(networkListInterfacesResponse);
}
```

Returns: `data` (array[object]), `meta` (object)

## Get all Private Wireless Gateways

Get all Private Wireless Gateways belonging to the user.

`GET /private_wireless_gateways`

```javascript
// Automatically fetches more pages as needed.
for await (const privateWirelessGateway of client.privateWirelessGateways.list()) {
  console.log(privateWirelessGateway.id);
}
```

Returns: `assigned_resources` (array[object]), `created_at` (string), `id` (uuid), `ip_range` (string), `name` (string), `network_id` (uuid), `record_type` (string), `region_code` (string), `status` (object), `updated_at` (string)

## Create a Private Wireless Gateway

Asynchronously create a Private Wireless Gateway for SIM cards for a previously created network. This operation may take several minutes so you can check the Private Wireless Gateway status at the section Get a Private Wireless Gateway.

`POST /private_wireless_gateways` — Required: `network_id`, `name`

Optional: `region_code` (string)

```javascript
const privateWirelessGateway = await client.privateWirelessGateways.create({
  name: 'My private wireless gateway',
  network_id: '6a09cdc3-8948-47f0-aa62-74ac943d6c58',
});

console.log(privateWirelessGateway.data);
```

Returns: `assigned_resources` (array[object]), `created_at` (string), `id` (uuid), `ip_range` (string), `name` (string), `network_id` (uuid), `record_type` (string), `region_code` (string), `status` (object), `updated_at` (string)

## Get a Private Wireless Gateway

Retrieve information about a Private Wireless Gateway.

`GET /private_wireless_gateways/{id}`

```javascript
const privateWirelessGateway = await client.privateWirelessGateways.retrieve(
  '6a09cdc3-8948-47f0-aa62-74ac943d6c58',
);

console.log(privateWirelessGateway.data);
```

Returns: `assigned_resources` (array[object]), `created_at` (string), `id` (uuid), `ip_range` (string), `name` (string), `network_id` (uuid), `record_type` (string), `region_code` (string), `status` (object), `updated_at` (string)

## Delete a Private Wireless Gateway

Deletes the Private Wireless Gateway.

`DELETE /private_wireless_gateways/{id}`

```javascript
const privateWirelessGateway = await client.privateWirelessGateways.delete(
  '6a09cdc3-8948-47f0-aa62-74ac943d6c58',
);

console.log(privateWirelessGateway.data);
```

Returns: `assigned_resources` (array[object]), `created_at` (string), `id` (uuid), `ip_range` (string), `name` (string), `network_id` (uuid), `record_type` (string), `region_code` (string), `status` (object), `updated_at` (string)

## List all Public Internet Gateways

List all Public Internet Gateways.

`GET /public_internet_gateways`

```javascript
// Automatically fetches more pages as needed.
for await (const publicInternetGatewayListResponse of client.publicInternetGateways.list()) {
  console.log(publicInternetGatewayListResponse);
}
```

Returns: `data` (array[object]), `meta` (object)

## Create a Public Internet Gateway

Create a new Public Internet Gateway.

`POST /public_internet_gateways`

```javascript
const publicInternetGateway = await client.publicInternetGateways.create();

console.log(publicInternetGateway.data);
```

Returns: `data` (object)

## Retrieve a Public Internet Gateway

Retrieve a Public Internet Gateway.

`GET /public_internet_gateways/{id}`

```javascript
const publicInternetGateway = await client.publicInternetGateways.retrieve(
  '6a09cdc3-8948-47f0-aa62-74ac943d6c58',
);

console.log(publicInternetGateway.data);
```

Returns: `data` (object)

## Delete a Public Internet Gateway

Delete a Public Internet Gateway.

`DELETE /public_internet_gateways/{id}`

```javascript
const publicInternetGateway = await client.publicInternetGateways.delete(
  '6a09cdc3-8948-47f0-aa62-74ac943d6c58',
);

console.log(publicInternetGateway.data);
```

Returns: `data` (object)

## List all Regions

List all regions and the interfaces that region supports

`GET /regions`

```javascript
const regions = await client.regions.list();

console.log(regions.data);
```

Returns: `code` (string), `created_at` (string), `name` (string), `record_type` (string), `supported_interfaces` (array[string]), `updated_at` (string)

## List all Virtual Cross Connects

List all Virtual Cross Connects.

`GET /virtual_cross_connects`

```javascript
// Automatically fetches more pages as needed.
for await (const virtualCrossConnectListResponse of client.virtualCrossConnects.list()) {
  console.log(virtualCrossConnectListResponse);
}
```

Returns: `data` (array[object]), `meta` (object)

## Create a Virtual Cross Connect

Create a new Virtual Cross Connect.  For AWS and GCE, you have the option of creating the primary connection first and the secondary connection later. You also have the option of disabling the primary and/or secondary connections at any time and later re-enabling them. With Azure, you do not have this option.

`POST /virtual_cross_connects`

```javascript
const virtualCrossConnect = await client.virtualCrossConnects.create({ region_code: 'ashburn-va' });

console.log(virtualCrossConnect.data);
```

Returns: `data` (object)

## Retrieve a Virtual Cross Connect

Retrieve a Virtual Cross Connect.

`GET /virtual_cross_connects/{id}`

```javascript
const virtualCrossConnect = await client.virtualCrossConnects.retrieve(
  '6a09cdc3-8948-47f0-aa62-74ac943d6c58',
);

console.log(virtualCrossConnect.data);
```

Returns: `data` (object)

## Update the Virtual Cross Connect

Update the Virtual Cross Connect.  Cloud IPs can only be patched during the `created` state, as GCE will only inform you of your generated IP once the pending connection requested has been accepted.

`PATCH /virtual_cross_connects/{id}`

```javascript
const virtualCrossConnect = await client.virtualCrossConnects.update(
  '6a09cdc3-8948-47f0-aa62-74ac943d6c58',
);

console.log(virtualCrossConnect.data);
```

Returns: `data` (object)

## Delete a Virtual Cross Connect

Delete a Virtual Cross Connect.

`DELETE /virtual_cross_connects/{id}`

```javascript
const virtualCrossConnect = await client.virtualCrossConnects.delete(
  '6a09cdc3-8948-47f0-aa62-74ac943d6c58',
);

console.log(virtualCrossConnect.data);
```

Returns: `data` (object)

## List Virtual Cross Connect Cloud Coverage

List Virtual Cross Connects Cloud Coverage.  This endpoint shows which cloud regions are available for the `location_code` your Virtual Cross Connect will be provisioned in.

`GET /virtual_cross_connects_coverage`

```javascript
// Automatically fetches more pages as needed.
for await (const virtualCrossConnectsCoverageListResponse of client.virtualCrossConnectsCoverage.list()) {
  console.log(virtualCrossConnectsCoverageListResponse.available_bandwidth);
}
```

Returns: `data` (array[object]), `meta` (object)

## List all WireGuard Interfaces

List all WireGuard Interfaces.

`GET /wireguard_interfaces`

```javascript
// Automatically fetches more pages as needed.
for await (const wireguardInterfaceListResponse of client.wireguardInterfaces.list()) {
  console.log(wireguardInterfaceListResponse);
}
```

Returns: `data` (array[object]), `meta` (object)

## Create a WireGuard Interface

Create a new WireGuard Interface. Current limitation of 10 interfaces per user can be created.

`POST /wireguard_interfaces`

```javascript
const wireguardInterface = await client.wireguardInterfaces.create({ region_code: 'ashburn-va' });

console.log(wireguardInterface.data);
```

Returns: `data` (object)

## Retrieve a WireGuard Interfaces

Retrieve a WireGuard Interfaces.

`GET /wireguard_interfaces/{id}`

```javascript
const wireguardInterface = await client.wireguardInterfaces.retrieve(
  '6a09cdc3-8948-47f0-aa62-74ac943d6c58',
);

console.log(wireguardInterface.data);
```

Returns: `data` (object)

## Delete a WireGuard Interface

Delete a WireGuard Interface.

`DELETE /wireguard_interfaces/{id}`

```javascript
const wireguardInterface = await client.wireguardInterfaces.delete(
  '6a09cdc3-8948-47f0-aa62-74ac943d6c58',
);

console.log(wireguardInterface.data);
```

Returns: `data` (object)

## List all WireGuard Peers

List all WireGuard peers.

`GET /wireguard_peers`

```javascript
// Automatically fetches more pages as needed.
for await (const wireguardPeerListResponse of client.wireguardPeers.list()) {
  console.log(wireguardPeerListResponse);
}
```

Returns: `data` (array[object]), `meta` (object)

## Create a WireGuard Peer

Create a new WireGuard Peer. Current limitation of 5 peers per interface can be created.

`POST /wireguard_peers`

```javascript
const wireguardPeer = await client.wireguardPeers.create({
  wireguard_interface_id: '6a09cdc3-8948-47f0-aa62-74ac943d6c58',
});

console.log(wireguardPeer.data);
```

Returns: `data` (object)

## Retrieve the WireGuard Peer

Retrieve the WireGuard peer.

`GET /wireguard_peers/{id}`

```javascript
const wireguardPeer = await client.wireguardPeers.retrieve('6a09cdc3-8948-47f0-aa62-74ac943d6c58');

console.log(wireguardPeer.data);
```

Returns: `data` (object)

## Update the WireGuard Peer

Update the WireGuard peer.

`PATCH /wireguard_peers/{id}`

Optional: `public_key` (string)

```javascript
const wireguardPeer = await client.wireguardPeers.update('6a09cdc3-8948-47f0-aa62-74ac943d6c58');

console.log(wireguardPeer.data);
```

Returns: `data` (object)

## Delete the WireGuard Peer

Delete the WireGuard peer.

`DELETE /wireguard_peers/{id}`

```javascript
const wireguardPeer = await client.wireguardPeers.delete('6a09cdc3-8948-47f0-aa62-74ac943d6c58');

console.log(wireguardPeer.data);
```

Returns: `data` (object)

## Retrieve Wireguard config template for Peer

`GET /wireguard_peers/{id}/config`

```javascript
const response = await client.wireguardPeers.retrieveConfig('6a09cdc3-8948-47f0-aa62-74ac943d6c58');

console.log(response);
```
