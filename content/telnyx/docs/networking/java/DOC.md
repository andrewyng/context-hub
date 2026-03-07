---
name: networking
description: "Configure private networks, WireGuard VPN gateways, internet gateways, and virtual cross connects."
metadata:
  languages: "java"
  versions: "6.26.0"
  updated-on: "2026-03-06"
  source: maintainer
  tags: "telnyx,networking,vpn,wireguard,private-network"
---

# Telnyx Networking Java SDK Coding Guidelines

You are a Telnyx Networking API expert. Help the user write correct, production-ready code using the official Telnyx Java SDK.

## Golden Rule: Use the Official SDK

Always use the official `com.telnyx.sdk:telnyx` package. Do not fabricate API endpoints or SDK methods.

- **Correct:** `import com.telnyx.sdk.client.TelnyxClient`
- **Incorrect:** unofficial Java clients or raw HTTP calls

## Installation

```text
<!-- Maven -->
<dependency>
    <groupId>com.telnyx.sdk</groupId>
    <artifactId>telnyx-java</artifactId>
    <version>6.26.0</version>
</dependency>

// Gradle
implementation("com.telnyx.sdk:telnyx-java:6.26.0")
```

## Setup

```java
import com.telnyx.sdk.client.TelnyxClient;
import com.telnyx.sdk.client.okhttp.TelnyxOkHttpClient;

TelnyxClient client = TelnyxOkHttpClient.fromEnv();
```

All examples below assume `client` is already initialized as shown above.

## List all clusters

`GET /ai/clusters`

```java
import com.telnyx.sdk.models.ai.clusters.ClusterListPage;
import com.telnyx.sdk.models.ai.clusters.ClusterListParams;

ClusterListPage page = client.ai().clusters().list();
```

Returns: `bucket` (string), `created_at` (date-time), `finished_at` (date-time), `min_cluster_size` (integer), `min_subcluster_size` (integer), `status` (enum: pending, starting, running, completed, failed), `task_id` (string)

## Compute new clusters

Starts a background task to compute how the data in an [embedded storage bucket](https://developers.telnyx.com/api-reference/embeddings/embed-documents) is clustered. This helps identify common themes and patterns in the data.

`POST /ai/clusters` — Required: `bucket`

Optional: `files` (array[string]), `min_cluster_size` (integer), `min_subcluster_size` (integer), `prefix` (string)

```java
import com.telnyx.sdk.models.ai.clusters.ClusterComputeParams;
import com.telnyx.sdk.models.ai.clusters.ClusterComputeResponse;

ClusterComputeParams params = ClusterComputeParams.builder()
    .bucket("bucket")
    .build();
ClusterComputeResponse response = client.ai().clusters().compute(params);
```

Returns: `task_id` (string)

## Fetch a cluster

`GET /ai/clusters/{task_id}`

```java
import com.telnyx.sdk.models.ai.clusters.ClusterRetrieveParams;
import com.telnyx.sdk.models.ai.clusters.ClusterRetrieveResponse;

ClusterRetrieveResponse cluster = client.ai().clusters().retrieve("task_id");
```

Returns: `bucket` (string), `clusters` (array[object]), `status` (enum: pending, starting, running, completed, failed)

## Delete a cluster

`DELETE /ai/clusters/{task_id}`

```java
import com.telnyx.sdk.models.ai.clusters.ClusterDeleteParams;

client.ai().clusters().delete("task_id");
```

## Fetch a cluster visualization

`GET /ai/clusters/{task_id}/graph`

```java
import com.telnyx.sdk.core.http.HttpResponse;
import com.telnyx.sdk.models.ai.clusters.ClusterFetchGraphParams;

HttpResponse response = client.ai().clusters().fetchGraph("task_id");
```

## List Integrations

List all available integrations.

`GET /ai/integrations`

```java
import com.telnyx.sdk.models.ai.integrations.IntegrationListParams;
import com.telnyx.sdk.models.ai.integrations.IntegrationListResponse;

IntegrationListResponse integrations = client.ai().integrations().list();
```

Returns: `available_tools` (array[string]), `description` (string), `display_name` (string), `id` (string), `logo_url` (string), `name` (string), `status` (enum: disconnected, connected)

## List User Integrations

List user setup integrations

`GET /ai/integrations/connections`

```java
import com.telnyx.sdk.models.ai.integrations.connections.ConnectionListParams;
import com.telnyx.sdk.models.ai.integrations.connections.ConnectionListResponse;

ConnectionListResponse connections = client.ai().integrations().connections().list();
```

Returns: `allowed_tools` (array[string]), `id` (string), `integration_id` (string)

## Get User Integration connection By Id

Get user setup integrations

`GET /ai/integrations/connections/{user_connection_id}`

```java
import com.telnyx.sdk.models.ai.integrations.connections.ConnectionRetrieveParams;
import com.telnyx.sdk.models.ai.integrations.connections.ConnectionRetrieveResponse;

ConnectionRetrieveResponse connection = client.ai().integrations().connections().retrieve("user_connection_id");
```

Returns: `allowed_tools` (array[string]), `id` (string), `integration_id` (string)

## Delete Integration Connection

Delete a specific integration connection.

`DELETE /ai/integrations/connections/{user_connection_id}`

```java
import com.telnyx.sdk.models.ai.integrations.connections.ConnectionDeleteParams;

client.ai().integrations().connections().delete("user_connection_id");
```

## List Integration By Id

Retrieve integration details

`GET /ai/integrations/{integration_id}`

```java
import com.telnyx.sdk.models.ai.integrations.IntegrationRetrieveParams;
import com.telnyx.sdk.models.ai.integrations.IntegrationRetrieveResponse;

IntegrationRetrieveResponse integration = client.ai().integrations().retrieve("integration_id");
```

Returns: `available_tools` (array[string]), `description` (string), `display_name` (string), `id` (string), `logo_url` (string), `name` (string), `status` (enum: disconnected, connected)

## List all Global IP Allowed Ports

`GET /global_ip_allowed_ports`

```java
import com.telnyx.sdk.models.globalipallowedports.GlobalIpAllowedPortListParams;
import com.telnyx.sdk.models.globalipallowedports.GlobalIpAllowedPortListResponse;

GlobalIpAllowedPortListResponse globalIpAllowedPorts = client.globalIpAllowedPorts().list();
```

Returns: `data` (array[object])

## Global IP Assignment Health Check Metrics

`GET /global_ip_assignment_health`

```java
import com.telnyx.sdk.models.globalipassignmenthealth.GlobalIpAssignmentHealthRetrieveParams;
import com.telnyx.sdk.models.globalipassignmenthealth.GlobalIpAssignmentHealthRetrieveResponse;

GlobalIpAssignmentHealthRetrieveResponse globalIpAssignmentHealth = client.globalIpAssignmentHealth().retrieve();
```

Returns: `global_ip` (object), `global_ip_assignment` (object), `health` (object), `timestamp` (date-time)

## List all Global IP assignments

List all Global IP assignments.

`GET /global_ip_assignments`

```java
import com.telnyx.sdk.models.globalipassignments.GlobalIpAssignmentListPage;
import com.telnyx.sdk.models.globalipassignments.GlobalIpAssignmentListParams;

GlobalIpAssignmentListPage page = client.globalIpAssignments().list();
```

Returns: `data` (array[object]), `meta` (object)

## Create a Global IP assignment

Create a Global IP assignment.

`POST /global_ip_assignments`

```java
import com.telnyx.sdk.models.globalipassignments.GlobalIpAssignment;
import com.telnyx.sdk.models.globalipassignments.GlobalIpAssignmentCreateParams;
import com.telnyx.sdk.models.globalipassignments.GlobalIpAssignmentCreateResponse;

GlobalIpAssignment params = GlobalIpAssignment.builder().build();
GlobalIpAssignmentCreateResponse globalIpAssignment = client.globalIpAssignments().create(params);
```

Returns: `data` (object)

## Retrieve a Global IP

Retrieve a Global IP assignment.

`GET /global_ip_assignments/{id}`

```java
import com.telnyx.sdk.models.globalipassignments.GlobalIpAssignmentRetrieveParams;
import com.telnyx.sdk.models.globalipassignments.GlobalIpAssignmentRetrieveResponse;

GlobalIpAssignmentRetrieveResponse globalIpAssignment = client.globalIpAssignments().retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `data` (object)

## Update a Global IP assignment

Update a Global IP assignment.

`PATCH /global_ip_assignments/{id}`

```java
import com.telnyx.sdk.models.globalipassignments.GlobalIpAssignmentUpdateParams;
import com.telnyx.sdk.models.globalipassignments.GlobalIpAssignmentUpdateResponse;

GlobalIpAssignmentUpdateResponse globalIpAssignment = client.globalIpAssignments().update("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `data` (object)

## Delete a Global IP assignment

Delete a Global IP assignment.

`DELETE /global_ip_assignments/{id}`

```java
import com.telnyx.sdk.models.globalipassignments.GlobalIpAssignmentDeleteParams;
import com.telnyx.sdk.models.globalipassignments.GlobalIpAssignmentDeleteResponse;

GlobalIpAssignmentDeleteResponse globalIpAssignment = client.globalIpAssignments().delete("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `data` (object)

## Global IP Assignment Usage Metrics

`GET /global_ip_assignments_usage`

```java
import com.telnyx.sdk.models.globalipassignmentsusage.GlobalIpAssignmentsUsageRetrieveParams;
import com.telnyx.sdk.models.globalipassignmentsusage.GlobalIpAssignmentsUsageRetrieveResponse;

GlobalIpAssignmentsUsageRetrieveResponse globalIpAssignmentsUsage = client.globalIpAssignmentsUsage().retrieve();
```

Returns: `global_ip` (object), `global_ip_assignment` (object), `received` (object), `timestamp` (date-time), `transmitted` (object)

## List all Global IP Health check types

List all Global IP Health check types.

`GET /global_ip_health_check_types`

```java
import com.telnyx.sdk.models.globaliphealthchecktypes.GlobalIpHealthCheckTypeListParams;
import com.telnyx.sdk.models.globaliphealthchecktypes.GlobalIpHealthCheckTypeListResponse;

GlobalIpHealthCheckTypeListResponse globalIpHealthCheckTypes = client.globalIpHealthCheckTypes().list();
```

Returns: `data` (array[object])

## List all Global IP health checks

List all Global IP health checks.

`GET /global_ip_health_checks`

```java
import com.telnyx.sdk.models.globaliphealthchecks.GlobalIpHealthCheckListPage;
import com.telnyx.sdk.models.globaliphealthchecks.GlobalIpHealthCheckListParams;

GlobalIpHealthCheckListPage page = client.globalIpHealthChecks().list();
```

Returns: `data` (array[object]), `meta` (object)

## Create a Global IP health check

Create a Global IP health check.

`POST /global_ip_health_checks`

```java
import com.telnyx.sdk.models.globaliphealthchecks.GlobalIpHealthCheckCreateParams;
import com.telnyx.sdk.models.globaliphealthchecks.GlobalIpHealthCheckCreateResponse;

GlobalIpHealthCheckCreateResponse globalIpHealthCheck = client.globalIpHealthChecks().create();
```

Returns: `data` (object)

## Retrieve a Global IP health check

Retrieve a Global IP health check.

`GET /global_ip_health_checks/{id}`

```java
import com.telnyx.sdk.models.globaliphealthchecks.GlobalIpHealthCheckRetrieveParams;
import com.telnyx.sdk.models.globaliphealthchecks.GlobalIpHealthCheckRetrieveResponse;

GlobalIpHealthCheckRetrieveResponse globalIpHealthCheck = client.globalIpHealthChecks().retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `data` (object)

## Delete a Global IP health check

Delete a Global IP health check.

`DELETE /global_ip_health_checks/{id}`

```java
import com.telnyx.sdk.models.globaliphealthchecks.GlobalIpHealthCheckDeleteParams;
import com.telnyx.sdk.models.globaliphealthchecks.GlobalIpHealthCheckDeleteResponse;

GlobalIpHealthCheckDeleteResponse globalIpHealthCheck = client.globalIpHealthChecks().delete("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `data` (object)

## Global IP Latency Metrics

`GET /global_ip_latency`

```java
import com.telnyx.sdk.models.globaliplatency.GlobalIpLatencyRetrieveParams;
import com.telnyx.sdk.models.globaliplatency.GlobalIpLatencyRetrieveResponse;

GlobalIpLatencyRetrieveResponse globalIpLatency = client.globalIpLatency().retrieve();
```

Returns: `global_ip` (object), `mean_latency` (object), `percentile_latency` (object), `prober_location` (object), `timestamp` (date-time)

## List all Global IP Protocols

`GET /global_ip_protocols`

```java
import com.telnyx.sdk.models.globalipprotocols.GlobalIpProtocolListParams;
import com.telnyx.sdk.models.globalipprotocols.GlobalIpProtocolListResponse;

GlobalIpProtocolListResponse globalIpProtocols = client.globalIpProtocols().list();
```

Returns: `data` (array[object])

## Global IP Usage Metrics

`GET /global_ip_usage`

```java
import com.telnyx.sdk.models.globalipusage.GlobalIpUsageRetrieveParams;
import com.telnyx.sdk.models.globalipusage.GlobalIpUsageRetrieveResponse;

GlobalIpUsageRetrieveResponse globalIpUsage = client.globalIpUsage().retrieve();
```

Returns: `global_ip` (object), `received` (object), `timestamp` (date-time), `transmitted` (object)

## List all Global IPs

List all Global IPs.

`GET /global_ips`

```java
import com.telnyx.sdk.models.globalips.GlobalIpListPage;
import com.telnyx.sdk.models.globalips.GlobalIpListParams;

GlobalIpListPage page = client.globalIps().list();
```

Returns: `data` (array[object]), `meta` (object)

## Create a Global IP

Create a Global IP.

`POST /global_ips`

```java
import com.telnyx.sdk.models.globalips.GlobalIpCreateParams;
import com.telnyx.sdk.models.globalips.GlobalIpCreateResponse;

GlobalIpCreateResponse globalIp = client.globalIps().create();
```

Returns: `data` (object)

## Retrieve a Global IP

Retrieve a Global IP.

`GET /global_ips/{id}`

```java
import com.telnyx.sdk.models.globalips.GlobalIpRetrieveParams;
import com.telnyx.sdk.models.globalips.GlobalIpRetrieveResponse;

GlobalIpRetrieveResponse globalIp = client.globalIps().retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `data` (object)

## Delete a Global IP

Delete a Global IP.

`DELETE /global_ips/{id}`

```java
import com.telnyx.sdk.models.globalips.GlobalIpDeleteParams;
import com.telnyx.sdk.models.globalips.GlobalIpDeleteResponse;

GlobalIpDeleteResponse globalIp = client.globalIps().delete("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `data` (object)

## List all Networks

List all Networks.

`GET /networks`

```java
import com.telnyx.sdk.models.networks.NetworkListPage;
import com.telnyx.sdk.models.networks.NetworkListParams;

NetworkListPage page = client.networks().list();
```

Returns: `data` (array[object]), `meta` (object)

## Create a Network

Create a new Network.

`POST /networks`

```java
import com.telnyx.sdk.models.networks.NetworkCreate;
import com.telnyx.sdk.models.networks.NetworkCreateParams;
import com.telnyx.sdk.models.networks.NetworkCreateResponse;

NetworkCreate params = NetworkCreate.builder()
    .name("test network")
    .build();
NetworkCreateResponse network = client.networks().create(params);
```

Returns: `data` (object)

## Retrieve a Network

Retrieve a Network.

`GET /networks/{id}`

```java
import com.telnyx.sdk.models.networks.NetworkRetrieveParams;
import com.telnyx.sdk.models.networks.NetworkRetrieveResponse;

NetworkRetrieveResponse network = client.networks().retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `data` (object)

## Update a Network

Update a Network.

`PATCH /networks/{id}`

```java
import com.telnyx.sdk.models.networks.NetworkCreate;
import com.telnyx.sdk.models.networks.NetworkUpdateParams;
import com.telnyx.sdk.models.networks.NetworkUpdateResponse;

NetworkUpdateParams params = NetworkUpdateParams.builder()
    .networkId("6a09cdc3-8948-47f0-aa62-74ac943d6c58")
    .networkCreate(NetworkCreate.builder()
        .name("test network")
        .build())
    .build();
NetworkUpdateResponse network = client.networks().update(params);
```

Returns: `data` (object)

## Delete a Network

Delete a Network.

`DELETE /networks/{id}`

```java
import com.telnyx.sdk.models.networks.NetworkDeleteParams;
import com.telnyx.sdk.models.networks.NetworkDeleteResponse;

NetworkDeleteResponse network = client.networks().delete("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `data` (object)

## Get Default Gateway status.

`GET /networks/{id}/default_gateway`

```java
import com.telnyx.sdk.models.networks.defaultgateway.DefaultGatewayRetrieveParams;
import com.telnyx.sdk.models.networks.defaultgateway.DefaultGatewayRetrieveResponse;

DefaultGatewayRetrieveResponse defaultGateway = client.networks().defaultGateway().retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `data` (array[object]), `meta` (object)

## Create Default Gateway.

`POST /networks/{id}/default_gateway`

```java
import com.telnyx.sdk.models.networks.defaultgateway.DefaultGatewayCreateParams;
import com.telnyx.sdk.models.networks.defaultgateway.DefaultGatewayCreateResponse;

DefaultGatewayCreateResponse defaultGateway = client.networks().defaultGateway().create("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `data` (array[object]), `meta` (object)

## Delete Default Gateway.

`DELETE /networks/{id}/default_gateway`

```java
import com.telnyx.sdk.models.networks.defaultgateway.DefaultGatewayDeleteParams;
import com.telnyx.sdk.models.networks.defaultgateway.DefaultGatewayDeleteResponse;

DefaultGatewayDeleteResponse defaultGateway = client.networks().defaultGateway().delete("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `data` (array[object]), `meta` (object)

## List all Interfaces for a Network.

`GET /networks/{id}/network_interfaces`

```java
import com.telnyx.sdk.models.networks.NetworkListInterfacesPage;
import com.telnyx.sdk.models.networks.NetworkListInterfacesParams;

NetworkListInterfacesPage page = client.networks().listInterfaces("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `data` (array[object]), `meta` (object)

## Get all Private Wireless Gateways

Get all Private Wireless Gateways belonging to the user.

`GET /private_wireless_gateways`

```java
import com.telnyx.sdk.models.privatewirelessgateways.PrivateWirelessGatewayListPage;
import com.telnyx.sdk.models.privatewirelessgateways.PrivateWirelessGatewayListParams;

PrivateWirelessGatewayListPage page = client.privateWirelessGateways().list();
```

Returns: `assigned_resources` (array[object]), `created_at` (string), `id` (uuid), `ip_range` (string), `name` (string), `network_id` (uuid), `record_type` (string), `region_code` (string), `status` (object), `updated_at` (string)

## Create a Private Wireless Gateway

Asynchronously create a Private Wireless Gateway for SIM cards for a previously created network. This operation may take several minutes so you can check the Private Wireless Gateway status at the section Get a Private Wireless Gateway.

`POST /private_wireless_gateways` — Required: `network_id`, `name`

Optional: `region_code` (string)

```java
import com.telnyx.sdk.models.privatewirelessgateways.PrivateWirelessGatewayCreateParams;
import com.telnyx.sdk.models.privatewirelessgateways.PrivateWirelessGatewayCreateResponse;

PrivateWirelessGatewayCreateParams params = PrivateWirelessGatewayCreateParams.builder()
    .name("My private wireless gateway")
    .networkId("6a09cdc3-8948-47f0-aa62-74ac943d6c58")
    .build();
PrivateWirelessGatewayCreateResponse privateWirelessGateway = client.privateWirelessGateways().create(params);
```

Returns: `assigned_resources` (array[object]), `created_at` (string), `id` (uuid), `ip_range` (string), `name` (string), `network_id` (uuid), `record_type` (string), `region_code` (string), `status` (object), `updated_at` (string)

## Get a Private Wireless Gateway

Retrieve information about a Private Wireless Gateway.

`GET /private_wireless_gateways/{id}`

```java
import com.telnyx.sdk.models.privatewirelessgateways.PrivateWirelessGatewayRetrieveParams;
import com.telnyx.sdk.models.privatewirelessgateways.PrivateWirelessGatewayRetrieveResponse;

PrivateWirelessGatewayRetrieveResponse privateWirelessGateway = client.privateWirelessGateways().retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `assigned_resources` (array[object]), `created_at` (string), `id` (uuid), `ip_range` (string), `name` (string), `network_id` (uuid), `record_type` (string), `region_code` (string), `status` (object), `updated_at` (string)

## Delete a Private Wireless Gateway

Deletes the Private Wireless Gateway.

`DELETE /private_wireless_gateways/{id}`

```java
import com.telnyx.sdk.models.privatewirelessgateways.PrivateWirelessGatewayDeleteParams;
import com.telnyx.sdk.models.privatewirelessgateways.PrivateWirelessGatewayDeleteResponse;

PrivateWirelessGatewayDeleteResponse privateWirelessGateway = client.privateWirelessGateways().delete("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `assigned_resources` (array[object]), `created_at` (string), `id` (uuid), `ip_range` (string), `name` (string), `network_id` (uuid), `record_type` (string), `region_code` (string), `status` (object), `updated_at` (string)

## List all Public Internet Gateways

List all Public Internet Gateways.

`GET /public_internet_gateways`

```java
import com.telnyx.sdk.models.publicinternetgateways.PublicInternetGatewayListPage;
import com.telnyx.sdk.models.publicinternetgateways.PublicInternetGatewayListParams;

PublicInternetGatewayListPage page = client.publicInternetGateways().list();
```

Returns: `data` (array[object]), `meta` (object)

## Create a Public Internet Gateway

Create a new Public Internet Gateway.

`POST /public_internet_gateways`

```java
import com.telnyx.sdk.models.publicinternetgateways.PublicInternetGatewayCreateParams;
import com.telnyx.sdk.models.publicinternetgateways.PublicInternetGatewayCreateResponse;

PublicInternetGatewayCreateResponse publicInternetGateway = client.publicInternetGateways().create();
```

Returns: `data` (object)

## Retrieve a Public Internet Gateway

Retrieve a Public Internet Gateway.

`GET /public_internet_gateways/{id}`

```java
import com.telnyx.sdk.models.publicinternetgateways.PublicInternetGatewayRetrieveParams;
import com.telnyx.sdk.models.publicinternetgateways.PublicInternetGatewayRetrieveResponse;

PublicInternetGatewayRetrieveResponse publicInternetGateway = client.publicInternetGateways().retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `data` (object)

## Delete a Public Internet Gateway

Delete a Public Internet Gateway.

`DELETE /public_internet_gateways/{id}`

```java
import com.telnyx.sdk.models.publicinternetgateways.PublicInternetGatewayDeleteParams;
import com.telnyx.sdk.models.publicinternetgateways.PublicInternetGatewayDeleteResponse;

PublicInternetGatewayDeleteResponse publicInternetGateway = client.publicInternetGateways().delete("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `data` (object)

## List all Regions

List all regions and the interfaces that region supports

`GET /regions`

```java
import com.telnyx.sdk.models.regions.RegionListParams;
import com.telnyx.sdk.models.regions.RegionListResponse;

RegionListResponse regions = client.regions().list();
```

Returns: `code` (string), `created_at` (string), `name` (string), `record_type` (string), `supported_interfaces` (array[string]), `updated_at` (string)

## List all Virtual Cross Connects

List all Virtual Cross Connects.

`GET /virtual_cross_connects`

```java
import com.telnyx.sdk.models.virtualcrossconnects.VirtualCrossConnectListPage;
import com.telnyx.sdk.models.virtualcrossconnects.VirtualCrossConnectListParams;

VirtualCrossConnectListPage page = client.virtualCrossConnects().list();
```

Returns: `data` (array[object]), `meta` (object)

## Create a Virtual Cross Connect

Create a new Virtual Cross Connect.  For AWS and GCE, you have the option of creating the primary connection first and the secondary connection later. You also have the option of disabling the primary and/or secondary connections at any time and later re-enabling them. With Azure, you do not have this option.

`POST /virtual_cross_connects`

```java
import com.telnyx.sdk.models.virtualcrossconnects.VirtualCrossConnectCreateParams;
import com.telnyx.sdk.models.virtualcrossconnects.VirtualCrossConnectCreateResponse;

VirtualCrossConnectCreateParams params = VirtualCrossConnectCreateParams.builder()
    .regionCode("ashburn-va")
    .build();
VirtualCrossConnectCreateResponse virtualCrossConnect = client.virtualCrossConnects().create(params);
```

Returns: `data` (object)

## Retrieve a Virtual Cross Connect

Retrieve a Virtual Cross Connect.

`GET /virtual_cross_connects/{id}`

```java
import com.telnyx.sdk.models.virtualcrossconnects.VirtualCrossConnectRetrieveParams;
import com.telnyx.sdk.models.virtualcrossconnects.VirtualCrossConnectRetrieveResponse;

VirtualCrossConnectRetrieveResponse virtualCrossConnect = client.virtualCrossConnects().retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `data` (object)

## Update the Virtual Cross Connect

Update the Virtual Cross Connect.  Cloud IPs can only be patched during the `created` state, as GCE will only inform you of your generated IP once the pending connection requested has been accepted.

`PATCH /virtual_cross_connects/{id}`

```java
import com.telnyx.sdk.models.virtualcrossconnects.VirtualCrossConnectUpdateParams;
import com.telnyx.sdk.models.virtualcrossconnects.VirtualCrossConnectUpdateResponse;

VirtualCrossConnectUpdateResponse virtualCrossConnect = client.virtualCrossConnects().update("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `data` (object)

## Delete a Virtual Cross Connect

Delete a Virtual Cross Connect.

`DELETE /virtual_cross_connects/{id}`

```java
import com.telnyx.sdk.models.virtualcrossconnects.VirtualCrossConnectDeleteParams;
import com.telnyx.sdk.models.virtualcrossconnects.VirtualCrossConnectDeleteResponse;

VirtualCrossConnectDeleteResponse virtualCrossConnect = client.virtualCrossConnects().delete("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `data` (object)

## List Virtual Cross Connect Cloud Coverage

List Virtual Cross Connects Cloud Coverage.  This endpoint shows which cloud regions are available for the `location_code` your Virtual Cross Connect will be provisioned in.

`GET /virtual_cross_connects_coverage`

```java
import com.telnyx.sdk.models.virtualcrossconnectscoverage.VirtualCrossConnectsCoverageListPage;
import com.telnyx.sdk.models.virtualcrossconnectscoverage.VirtualCrossConnectsCoverageListParams;

VirtualCrossConnectsCoverageListPage page = client.virtualCrossConnectsCoverage().list();
```

Returns: `data` (array[object]), `meta` (object)

## List all WireGuard Interfaces

List all WireGuard Interfaces.

`GET /wireguard_interfaces`

```java
import com.telnyx.sdk.models.wireguardinterfaces.WireguardInterfaceListPage;
import com.telnyx.sdk.models.wireguardinterfaces.WireguardInterfaceListParams;

WireguardInterfaceListPage page = client.wireguardInterfaces().list();
```

Returns: `data` (array[object]), `meta` (object)

## Create a WireGuard Interface

Create a new WireGuard Interface. Current limitation of 10 interfaces per user can be created.

`POST /wireguard_interfaces`

```java
import com.telnyx.sdk.models.wireguardinterfaces.WireguardInterfaceCreateParams;
import com.telnyx.sdk.models.wireguardinterfaces.WireguardInterfaceCreateResponse;

WireguardInterfaceCreateResponse wireguardInterface = client.wireguardInterfaces().create();
```

Returns: `data` (object)

## Retrieve a WireGuard Interfaces

Retrieve a WireGuard Interfaces.

`GET /wireguard_interfaces/{id}`

```java
import com.telnyx.sdk.models.wireguardinterfaces.WireguardInterfaceRetrieveParams;
import com.telnyx.sdk.models.wireguardinterfaces.WireguardInterfaceRetrieveResponse;

WireguardInterfaceRetrieveResponse wireguardInterface = client.wireguardInterfaces().retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `data` (object)

## Delete a WireGuard Interface

Delete a WireGuard Interface.

`DELETE /wireguard_interfaces/{id}`

```java
import com.telnyx.sdk.models.wireguardinterfaces.WireguardInterfaceDeleteParams;
import com.telnyx.sdk.models.wireguardinterfaces.WireguardInterfaceDeleteResponse;

WireguardInterfaceDeleteResponse wireguardInterface = client.wireguardInterfaces().delete("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `data` (object)

## List all WireGuard Peers

List all WireGuard peers.

`GET /wireguard_peers`

```java
import com.telnyx.sdk.models.wireguardpeers.WireguardPeerListPage;
import com.telnyx.sdk.models.wireguardpeers.WireguardPeerListParams;

WireguardPeerListPage page = client.wireguardPeers().list();
```

Returns: `data` (array[object]), `meta` (object)

## Create a WireGuard Peer

Create a new WireGuard Peer. Current limitation of 5 peers per interface can be created.

`POST /wireguard_peers`

```java
import com.telnyx.sdk.models.wireguardpeers.WireguardPeerCreateParams;
import com.telnyx.sdk.models.wireguardpeers.WireguardPeerCreateResponse;

WireguardPeerCreateParams params = WireguardPeerCreateParams.builder()
    .wireguardInterfaceId("6a09cdc3-8948-47f0-aa62-74ac943d6c58")
    .build();
WireguardPeerCreateResponse wireguardPeer = client.wireguardPeers().create(params);
```

Returns: `data` (object)

## Retrieve the WireGuard Peer

Retrieve the WireGuard peer.

`GET /wireguard_peers/{id}`

```java
import com.telnyx.sdk.models.wireguardpeers.WireguardPeerRetrieveParams;
import com.telnyx.sdk.models.wireguardpeers.WireguardPeerRetrieveResponse;

WireguardPeerRetrieveResponse wireguardPeer = client.wireguardPeers().retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `data` (object)

## Update the WireGuard Peer

Update the WireGuard peer.

`PATCH /wireguard_peers/{id}`

Optional: `public_key` (string)

```java
import com.telnyx.sdk.models.wireguardpeers.WireguardPeerPatch;
import com.telnyx.sdk.models.wireguardpeers.WireguardPeerUpdateParams;
import com.telnyx.sdk.models.wireguardpeers.WireguardPeerUpdateResponse;

WireguardPeerUpdateParams params = WireguardPeerUpdateParams.builder()
    .id("6a09cdc3-8948-47f0-aa62-74ac943d6c58")
    .wireguardPeerPatch(WireguardPeerPatch.builder().build())
    .build();
WireguardPeerUpdateResponse wireguardPeer = client.wireguardPeers().update(params);
```

Returns: `data` (object)

## Delete the WireGuard Peer

Delete the WireGuard peer.

`DELETE /wireguard_peers/{id}`

```java
import com.telnyx.sdk.models.wireguardpeers.WireguardPeerDeleteParams;
import com.telnyx.sdk.models.wireguardpeers.WireguardPeerDeleteResponse;

WireguardPeerDeleteResponse wireguardPeer = client.wireguardPeers().delete("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `data` (object)

## Retrieve Wireguard config template for Peer

`GET /wireguard_peers/{id}/config`

```java
import com.telnyx.sdk.models.wireguardpeers.WireguardPeerRetrieveConfigParams;

String response = client.wireguardPeers().retrieveConfig("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```
