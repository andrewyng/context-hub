---
name: networking
description: "Configure private networks, WireGuard VPN gateways, internet gateways, and virtual cross connects."
metadata:
  languages: "go"
  versions: "4.43.0"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,networking,vpn,wireguard,private-network"
---

# Telnyx Networking Go SDK Coding Guidelines

You are a Telnyx Networking API expert. Help the user write correct, production-ready code using the official Telnyx Go SDK.

## Golden Rule: Use the Official SDK

Always use the official `github.com/team-telnyx/telnyx-go` package. Do not fabricate API endpoints or SDK methods.

- **Correct:** `import "github.com/team-telnyx/telnyx-go"`
- **Incorrect:** unofficial Go clients or raw HTTP calls

## Installation

```bash
go get github.com/team-telnyx/telnyx-go
```

## Setup

```go
import (
  "context"
  "fmt"
  "os"

  "github.com/team-telnyx/telnyx-go"
  "github.com/team-telnyx/telnyx-go/option"
)

client := telnyx.NewClient(
  option.WithAPIKey(os.Getenv("TELNYX_API_KEY")),
)
```

All examples below assume `client` is already initialized as shown above.

## List all clusters

`GET /ai/clusters`

```go
	page, err := client.AI.Clusters.List(context.TODO(), telnyx.AIClusterListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `bucket` (string), `created_at` (date-time), `finished_at` (date-time), `min_cluster_size` (integer), `min_subcluster_size` (integer), `status` (enum: pending, starting, running, completed, failed), `task_id` (string)

## Compute new clusters

Starts a background task to compute how the data in an [embedded storage bucket](https://developers.telnyx.com/api-reference/embeddings/embed-documents) is clustered. This helps identify common themes and patterns in the data.

`POST /ai/clusters` — Required: `bucket`

Optional: `files` (array[string]), `min_cluster_size` (integer), `min_subcluster_size` (integer), `prefix` (string)

```go
	response, err := client.AI.Clusters.Compute(context.TODO(), telnyx.AIClusterComputeParams{
		Bucket: "bucket",
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `task_id` (string)

## Fetch a cluster

`GET /ai/clusters/{task_id}`

```go
	cluster, err := client.AI.Clusters.Get(
		context.TODO(),
		"task_id",
		telnyx.AIClusterGetParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", cluster.Data)
```

Returns: `bucket` (string), `clusters` (array[object]), `status` (enum: pending, starting, running, completed, failed)

## Delete a cluster

`DELETE /ai/clusters/{task_id}`

```go
	err := client.AI.Clusters.Delete(context.TODO(), "task_id")
	if err != nil {
		panic(err.Error())
	}
```

## Fetch a cluster visualization

`GET /ai/clusters/{task_id}/graph`

```go
	response, err := client.AI.Clusters.FetchGraph(
		context.TODO(),
		"task_id",
		telnyx.AIClusterFetchGraphParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response)
```

## List Integrations

List all available integrations.

`GET /ai/integrations`

```go
	integrations, err := client.AI.Integrations.List(context.TODO())
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", integrations.Data)
```

Returns: `available_tools` (array[string]), `description` (string), `display_name` (string), `id` (string), `logo_url` (string), `name` (string), `status` (enum: disconnected, connected)

## List User Integrations

List user setup integrations

`GET /ai/integrations/connections`

```go
	connections, err := client.AI.Integrations.Connections.List(context.TODO())
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", connections.Data)
```

Returns: `allowed_tools` (array[string]), `id` (string), `integration_id` (string)

## Get User Integration connection By Id

Get user setup integrations

`GET /ai/integrations/connections/{user_connection_id}`

```go
	connection, err := client.AI.Integrations.Connections.Get(context.TODO(), "user_connection_id")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", connection.Data)
```

Returns: `allowed_tools` (array[string]), `id` (string), `integration_id` (string)

## Delete Integration Connection

Delete a specific integration connection.

`DELETE /ai/integrations/connections/{user_connection_id}`

```go
	err := client.AI.Integrations.Connections.Delete(context.TODO(), "user_connection_id")
	if err != nil {
		panic(err.Error())
	}
```

## List Integration By Id

Retrieve integration details

`GET /ai/integrations/{integration_id}`

```go
	integration, err := client.AI.Integrations.Get(context.TODO(), "integration_id")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", integration.ID)
```

Returns: `available_tools` (array[string]), `description` (string), `display_name` (string), `id` (string), `logo_url` (string), `name` (string), `status` (enum: disconnected, connected)

## List all Global IP Allowed Ports

`GET /global_ip_allowed_ports`

```go
	globalIPAllowedPorts, err := client.GlobalIPAllowedPorts.List(context.TODO())
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", globalIPAllowedPorts.Data)
```

Returns: `data` (array[object])

## Global IP Assignment Health Check Metrics

`GET /global_ip_assignment_health`

```go
	globalIPAssignmentHealth, err := client.GlobalIPAssignmentHealth.Get(context.TODO(), telnyx.GlobalIPAssignmentHealthGetParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", globalIPAssignmentHealth.Data)
```

Returns: `global_ip` (object), `global_ip_assignment` (object), `health` (object), `timestamp` (date-time)

## List all Global IP assignments

List all Global IP assignments.

`GET /global_ip_assignments`

```go
	page, err := client.GlobalIPAssignments.List(context.TODO(), telnyx.GlobalIPAssignmentListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `data` (array[object]), `meta` (object)

## Create a Global IP assignment

Create a Global IP assignment.

`POST /global_ip_assignments`

```go
	globalIPAssignment, err := client.GlobalIPAssignments.New(context.TODO(), telnyx.GlobalIPAssignmentNewParams{
		GlobalIPAssignment: telnyx.GlobalIPAssignmentParam{},
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", globalIPAssignment.Data)
```

Returns: `data` (object)

## Retrieve a Global IP

Retrieve a Global IP assignment.

`GET /global_ip_assignments/{id}`

```go
	globalIPAssignment, err := client.GlobalIPAssignments.Get(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", globalIPAssignment.Data)
```

Returns: `data` (object)

## Update a Global IP assignment

Update a Global IP assignment.

`PATCH /global_ip_assignments/{id}`

```go
	globalIPAssignment, err := client.GlobalIPAssignments.Update(
		context.TODO(),
		"6a09cdc3-8948-47f0-aa62-74ac943d6c58",
		telnyx.GlobalIPAssignmentUpdateParams{
			GlobalIPAssignmentUpdateRequest: telnyx.GlobalIPAssignmentUpdateParamsGlobalIPAssignmentUpdateRequest{
				GlobalIPAssignmentParam: telnyx.GlobalIPAssignmentParam{},
			},
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", globalIPAssignment.Data)
```

Returns: `data` (object)

## Delete a Global IP assignment

Delete a Global IP assignment.

`DELETE /global_ip_assignments/{id}`

```go
	globalIPAssignment, err := client.GlobalIPAssignments.Delete(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", globalIPAssignment.Data)
```

Returns: `data` (object)

## Global IP Assignment Usage Metrics

`GET /global_ip_assignments_usage`

```go
	globalIPAssignmentsUsage, err := client.GlobalIPAssignmentsUsage.Get(context.TODO(), telnyx.GlobalIPAssignmentsUsageGetParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", globalIPAssignmentsUsage.Data)
```

Returns: `global_ip` (object), `global_ip_assignment` (object), `received` (object), `timestamp` (date-time), `transmitted` (object)

## List all Global IP Health check types

List all Global IP Health check types.

`GET /global_ip_health_check_types`

```go
	globalIPHealthCheckTypes, err := client.GlobalIPHealthCheckTypes.List(context.TODO())
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", globalIPHealthCheckTypes.Data)
```

Returns: `data` (array[object])

## List all Global IP health checks

List all Global IP health checks.

`GET /global_ip_health_checks`

```go
	page, err := client.GlobalIPHealthChecks.List(context.TODO(), telnyx.GlobalIPHealthCheckListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `data` (array[object]), `meta` (object)

## Create a Global IP health check

Create a Global IP health check.

`POST /global_ip_health_checks`

```go
	globalIPHealthCheck, err := client.GlobalIPHealthChecks.New(context.TODO(), telnyx.GlobalIPHealthCheckNewParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", globalIPHealthCheck.Data)
```

Returns: `data` (object)

## Retrieve a Global IP health check

Retrieve a Global IP health check.

`GET /global_ip_health_checks/{id}`

```go
	globalIPHealthCheck, err := client.GlobalIPHealthChecks.Get(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", globalIPHealthCheck.Data)
```

Returns: `data` (object)

## Delete a Global IP health check

Delete a Global IP health check.

`DELETE /global_ip_health_checks/{id}`

```go
	globalIPHealthCheck, err := client.GlobalIPHealthChecks.Delete(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", globalIPHealthCheck.Data)
```

Returns: `data` (object)

## Global IP Latency Metrics

`GET /global_ip_latency`

```go
	globalIPLatency, err := client.GlobalIPLatency.Get(context.TODO(), telnyx.GlobalIPLatencyGetParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", globalIPLatency.Data)
```

Returns: `global_ip` (object), `mean_latency` (object), `percentile_latency` (object), `prober_location` (object), `timestamp` (date-time)

## List all Global IP Protocols

`GET /global_ip_protocols`

```go
	globalIPProtocols, err := client.GlobalIPProtocols.List(context.TODO())
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", globalIPProtocols.Data)
```

Returns: `data` (array[object])

## Global IP Usage Metrics

`GET /global_ip_usage`

```go
	globalIPUsage, err := client.GlobalIPUsage.Get(context.TODO(), telnyx.GlobalIPUsageGetParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", globalIPUsage.Data)
```

Returns: `global_ip` (object), `received` (object), `timestamp` (date-time), `transmitted` (object)

## List all Global IPs

List all Global IPs.

`GET /global_ips`

```go
	page, err := client.GlobalIPs.List(context.TODO(), telnyx.GlobalIPListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `data` (array[object]), `meta` (object)

## Create a Global IP

Create a Global IP.

`POST /global_ips`

```go
	globalIP, err := client.GlobalIPs.New(context.TODO(), telnyx.GlobalIPNewParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", globalIP.Data)
```

Returns: `data` (object)

## Retrieve a Global IP

Retrieve a Global IP.

`GET /global_ips/{id}`

```go
	globalIP, err := client.GlobalIPs.Get(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", globalIP.Data)
```

Returns: `data` (object)

## Delete a Global IP

Delete a Global IP.

`DELETE /global_ips/{id}`

```go
	globalIP, err := client.GlobalIPs.Delete(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", globalIP.Data)
```

Returns: `data` (object)

## List all Networks

List all Networks.

`GET /networks`

```go
	page, err := client.Networks.List(context.TODO(), telnyx.NetworkListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `data` (array[object]), `meta` (object)

## Create a Network

Create a new Network.

`POST /networks`

```go
	network, err := client.Networks.New(context.TODO(), telnyx.NetworkNewParams{
		NetworkCreate: telnyx.NetworkCreateParam{
			RecordParam: telnyx.RecordParam{},
			Name:        "test network",
		},
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", network.Data)
```

Returns: `data` (object)

## Retrieve a Network

Retrieve a Network.

`GET /networks/{id}`

```go
	network, err := client.Networks.Get(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", network.Data)
```

Returns: `data` (object)

## Update a Network

Update a Network.

`PATCH /networks/{id}`

```go
	network, err := client.Networks.Update(
		context.TODO(),
		"6a09cdc3-8948-47f0-aa62-74ac943d6c58",
		telnyx.NetworkUpdateParams{
			NetworkCreate: telnyx.NetworkCreateParam{
				RecordParam: telnyx.RecordParam{},
				Name:        "test network",
			},
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", network.Data)
```

Returns: `data` (object)

## Delete a Network

Delete a Network.

`DELETE /networks/{id}`

```go
	network, err := client.Networks.Delete(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", network.Data)
```

Returns: `data` (object)

## Get Default Gateway status.

`GET /networks/{id}/default_gateway`

```go
	defaultGateway, err := client.Networks.DefaultGateway.Get(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", defaultGateway.Data)
```

Returns: `data` (array[object]), `meta` (object)

## Create Default Gateway.

`POST /networks/{id}/default_gateway`

```go
	defaultGateway, err := client.Networks.DefaultGateway.New(
		context.TODO(),
		"6a09cdc3-8948-47f0-aa62-74ac943d6c58",
		telnyx.NetworkDefaultGatewayNewParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", defaultGateway.Data)
```

Returns: `data` (array[object]), `meta` (object)

## Delete Default Gateway.

`DELETE /networks/{id}/default_gateway`

```go
	defaultGateway, err := client.Networks.DefaultGateway.Delete(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", defaultGateway.Data)
```

Returns: `data` (array[object]), `meta` (object)

## List all Interfaces for a Network.

`GET /networks/{id}/network_interfaces`

```go
	page, err := client.Networks.ListInterfaces(
		context.TODO(),
		"6a09cdc3-8948-47f0-aa62-74ac943d6c58",
		telnyx.NetworkListInterfacesParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `data` (array[object]), `meta` (object)

## Get all Private Wireless Gateways

Get all Private Wireless Gateways belonging to the user.

`GET /private_wireless_gateways`

```go
	page, err := client.PrivateWirelessGateways.List(context.TODO(), telnyx.PrivateWirelessGatewayListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `assigned_resources` (array[object]), `created_at` (string), `id` (uuid), `ip_range` (string), `name` (string), `network_id` (uuid), `record_type` (string), `region_code` (string), `status` (object), `updated_at` (string)

## Create a Private Wireless Gateway

Asynchronously create a Private Wireless Gateway for SIM cards for a previously created network. This operation may take several minutes so you can check the Private Wireless Gateway status at the section Get a Private Wireless Gateway.

`POST /private_wireless_gateways` — Required: `network_id`, `name`

Optional: `region_code` (string)

```go
	privateWirelessGateway, err := client.PrivateWirelessGateways.New(context.TODO(), telnyx.PrivateWirelessGatewayNewParams{
		Name:      "My private wireless gateway",
		NetworkID: "6a09cdc3-8948-47f0-aa62-74ac943d6c58",
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", privateWirelessGateway.Data)
```

Returns: `assigned_resources` (array[object]), `created_at` (string), `id` (uuid), `ip_range` (string), `name` (string), `network_id` (uuid), `record_type` (string), `region_code` (string), `status` (object), `updated_at` (string)

## Get a Private Wireless Gateway

Retrieve information about a Private Wireless Gateway.

`GET /private_wireless_gateways/{id}`

```go
	privateWirelessGateway, err := client.PrivateWirelessGateways.Get(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", privateWirelessGateway.Data)
```

Returns: `assigned_resources` (array[object]), `created_at` (string), `id` (uuid), `ip_range` (string), `name` (string), `network_id` (uuid), `record_type` (string), `region_code` (string), `status` (object), `updated_at` (string)

## Delete a Private Wireless Gateway

Deletes the Private Wireless Gateway.

`DELETE /private_wireless_gateways/{id}`

```go
	privateWirelessGateway, err := client.PrivateWirelessGateways.Delete(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", privateWirelessGateway.Data)
```

Returns: `assigned_resources` (array[object]), `created_at` (string), `id` (uuid), `ip_range` (string), `name` (string), `network_id` (uuid), `record_type` (string), `region_code` (string), `status` (object), `updated_at` (string)

## List all Public Internet Gateways

List all Public Internet Gateways.

`GET /public_internet_gateways`

```go
	page, err := client.PublicInternetGateways.List(context.TODO(), telnyx.PublicInternetGatewayListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `data` (array[object]), `meta` (object)

## Create a Public Internet Gateway

Create a new Public Internet Gateway.

`POST /public_internet_gateways`

```go
	publicInternetGateway, err := client.PublicInternetGateways.New(context.TODO(), telnyx.PublicInternetGatewayNewParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", publicInternetGateway.Data)
```

Returns: `data` (object)

## Retrieve a Public Internet Gateway

Retrieve a Public Internet Gateway.

`GET /public_internet_gateways/{id}`

```go
	publicInternetGateway, err := client.PublicInternetGateways.Get(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", publicInternetGateway.Data)
```

Returns: `data` (object)

## Delete a Public Internet Gateway

Delete a Public Internet Gateway.

`DELETE /public_internet_gateways/{id}`

```go
	publicInternetGateway, err := client.PublicInternetGateways.Delete(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", publicInternetGateway.Data)
```

Returns: `data` (object)

## List all Regions

List all regions and the interfaces that region supports

`GET /regions`

```go
	regions, err := client.Regions.List(context.TODO())
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", regions.Data)
```

Returns: `code` (string), `created_at` (string), `name` (string), `record_type` (string), `supported_interfaces` (array[string]), `updated_at` (string)

## List all Virtual Cross Connects

List all Virtual Cross Connects.

`GET /virtual_cross_connects`

```go
	page, err := client.VirtualCrossConnects.List(context.TODO(), telnyx.VirtualCrossConnectListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `data` (array[object]), `meta` (object)

## Create a Virtual Cross Connect

Create a new Virtual Cross Connect.  For AWS and GCE, you have the option of creating the primary connection first and the secondary connection later. You also have the option of disabling the primary and/or secondary connections at any time and later re-enabling them. With Azure, you do not have this option.

`POST /virtual_cross_connects`

```go
	virtualCrossConnect, err := client.VirtualCrossConnects.New(context.TODO(), telnyx.VirtualCrossConnectNewParams{
		RegionCode: "ashburn-va",
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", virtualCrossConnect.Data)
```

Returns: `data` (object)

## Retrieve a Virtual Cross Connect

Retrieve a Virtual Cross Connect.

`GET /virtual_cross_connects/{id}`

```go
	virtualCrossConnect, err := client.VirtualCrossConnects.Get(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", virtualCrossConnect.Data)
```

Returns: `data` (object)

## Update the Virtual Cross Connect

Update the Virtual Cross Connect.  Cloud IPs can only be patched during the `created` state, as GCE will only inform you of your generated IP once the pending connection requested has been accepted.

`PATCH /virtual_cross_connects/{id}`

```go
	virtualCrossConnect, err := client.VirtualCrossConnects.Update(
		context.TODO(),
		"6a09cdc3-8948-47f0-aa62-74ac943d6c58",
		telnyx.VirtualCrossConnectUpdateParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", virtualCrossConnect.Data)
```

Returns: `data` (object)

## Delete a Virtual Cross Connect

Delete a Virtual Cross Connect.

`DELETE /virtual_cross_connects/{id}`

```go
	virtualCrossConnect, err := client.VirtualCrossConnects.Delete(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", virtualCrossConnect.Data)
```

Returns: `data` (object)

## List Virtual Cross Connect Cloud Coverage

List Virtual Cross Connects Cloud Coverage.  This endpoint shows which cloud regions are available for the `location_code` your Virtual Cross Connect will be provisioned in.

`GET /virtual_cross_connects_coverage`

```go
	page, err := client.VirtualCrossConnectsCoverage.List(context.TODO(), telnyx.VirtualCrossConnectsCoverageListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `data` (array[object]), `meta` (object)

## List all WireGuard Interfaces

List all WireGuard Interfaces.

`GET /wireguard_interfaces`

```go
	page, err := client.WireguardInterfaces.List(context.TODO(), telnyx.WireguardInterfaceListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `data` (array[object]), `meta` (object)

## Create a WireGuard Interface

Create a new WireGuard Interface. Current limitation of 10 interfaces per user can be created.

`POST /wireguard_interfaces`

```go
	wireguardInterface, err := client.WireguardInterfaces.New(context.TODO(), telnyx.WireguardInterfaceNewParams{
		RegionCode: "ashburn-va",
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", wireguardInterface.Data)
```

Returns: `data` (object)

## Retrieve a WireGuard Interfaces

Retrieve a WireGuard Interfaces.

`GET /wireguard_interfaces/{id}`

```go
	wireguardInterface, err := client.WireguardInterfaces.Get(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", wireguardInterface.Data)
```

Returns: `data` (object)

## Delete a WireGuard Interface

Delete a WireGuard Interface.

`DELETE /wireguard_interfaces/{id}`

```go
	wireguardInterface, err := client.WireguardInterfaces.Delete(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", wireguardInterface.Data)
```

Returns: `data` (object)

## List all WireGuard Peers

List all WireGuard peers.

`GET /wireguard_peers`

```go
	page, err := client.WireguardPeers.List(context.TODO(), telnyx.WireguardPeerListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `data` (array[object]), `meta` (object)

## Create a WireGuard Peer

Create a new WireGuard Peer. Current limitation of 5 peers per interface can be created.

`POST /wireguard_peers`

```go
	wireguardPeer, err := client.WireguardPeers.New(context.TODO(), telnyx.WireguardPeerNewParams{
		WireguardInterfaceID: "6a09cdc3-8948-47f0-aa62-74ac943d6c58",
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", wireguardPeer.Data)
```

Returns: `data` (object)

## Retrieve the WireGuard Peer

Retrieve the WireGuard peer.

`GET /wireguard_peers/{id}`

```go
	wireguardPeer, err := client.WireguardPeers.Get(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", wireguardPeer.Data)
```

Returns: `data` (object)

## Update the WireGuard Peer

Update the WireGuard peer.

`PATCH /wireguard_peers/{id}`

Optional: `public_key` (string)

```go
	wireguardPeer, err := client.WireguardPeers.Update(
		context.TODO(),
		"6a09cdc3-8948-47f0-aa62-74ac943d6c58",
		telnyx.WireguardPeerUpdateParams{
			WireguardPeerPatch: telnyx.WireguardPeerPatchParam{},
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", wireguardPeer.Data)
```

Returns: `data` (object)

## Delete the WireGuard Peer

Delete the WireGuard peer.

`DELETE /wireguard_peers/{id}`

```go
	wireguardPeer, err := client.WireguardPeers.Delete(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", wireguardPeer.Data)
```

Returns: `data` (object)

## Retrieve Wireguard config template for Peer

`GET /wireguard_peers/{id}/config`

```go
	response, err := client.WireguardPeers.GetConfig(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response)
```
