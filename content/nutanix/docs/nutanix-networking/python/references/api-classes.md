# Networking API Classes - Complete Reference

**Package:** `ntnx_networking_py_client` v4.2.1
**Namespace:** `networking.v4.config` / `networking.v4.stats`
**Total API Classes:** 35
**Total Methods:** 117

---

## 1. AwsSubnetsApi (1 method)

- `list_aws_subnets(X_Cluster_Id, _page, _limit, _filter, _orderby, _select)` - Get NC2A subnets

## 2. AwsVpcsApi (1 method)

- `list_aws_vpcs(X_Cluster_Id)` - Get NC2A VPCs

## 3. BgpRoutesApi (2 methods)

- `get_route_for_bgp_session_by_id(extId, bgpSessionExtId)` - Get the specified route of the specified BGP session
- `list_routes_by_bgp_session_id(bgpSessionExtId, _page, _limit, _filter, _orderby)` - Lists routes of the specified BGP session

## 4. BgpSessionsApi (5 methods)

- `create_bgp_session(body)` - Create BGP session
- `get_bgp_session_by_id(extId)` - Get BGP session request
- `update_bgp_session_by_id(extId, body)` - Update BGP session request
- `delete_bgp_session_by_id(extId)` - Delete BGP session request
- `list_bgp_sessions(_page, _limit, _filter, _orderby, _expand)` - List BGP sessions request

## 5. BridgesApi (1 method)

- `migrate_bridge(body, X_Cluster_Id)` - Create a Virtual Switch from an existing bridge

## 6. ClusterCapabilitiesApi (1 method)

- `list_cluster_capabilities(_page, _limit, _filter, _orderby)` - Get cluster capabilities

## 7. FloatingIpsApi (5 methods)

- `create_floating_ip(body)` - Create a floating IP
- `get_floating_ip_by_id(extId)` - Get the floating IP for this extId
- `update_floating_ip_by_id(extId, body)` - Update the floating IP for this extId
- `delete_floating_ip_by_id(extId)` - Delete the floating IP corresponding to the extId
- `list_floating_ips(_page, _limit, _filter, _orderby, _expand)` - Get a list of floating IPs

## 8. GatewaysApi (6 methods)

- `create_gateway(body)` - Create network gateway
- `get_gateway_by_id(extId)` - Get network gateway
- `update_gateway_by_id(extId, body)` - Update network gateway
- `delete_gateway_by_id(extId)` - Delete network gateway
- `list_gateways(_page, _limit, _filter, _orderby, _expand, _select)` - List network gateways
- `upgrade_gateway_by_id(extId)` - Upgrade network gateway

## 9. IPFIXExportersApi (5 methods)

- `create_ipfix_exporter(body)` - Create an IPFIX Exporter
- `get_ipfix_exporter_by_id(extId)` - Get the specified IPFIX Exporter
- `update_ipfix_exporter_by_id(extId, body)` - Update the specified IPFIX Exporter
- `delete_ipfix_exporter_by_id(extId)` - Delete the specified IPFIX Exporter
- `list_ipfix_exporters(_page, _limit, _filter, _orderby)` - Get the list of existing IPFIX Exporters

## 10. Layer2StretchStatsApi (1 method)

- `get_layer2_stretch_stats(extId, _startTime, _endTime, _samplingInterval, _statType, _page, _limit, _select)` - Get Layer2Stretch statistics

## 11. Layer2StretchesApi (5 methods)

- `create_layer2_stretch(body)` - Create a Layer2Stretch configuration
- `get_layer2_stretch_by_id(extId)` - Get the Layer2Stretch configuration for the specified reference
- `update_layer2_stretch_by_id(extId, body)` - Update the specified Layer2Stretch configuration
- `delete_layer2_stretch_by_id(extId)` - Delete the specified Layer2Stretch configuration
- `list_layer2_stretches(_page, _limit, _filter, _orderby)` - Get the list of existing Layer2Stretch configurations

## 12. LoadBalancerSessionStatsApi (1 method)

- `get_load_balancer_session_stats(extId, _startTime, _endTime, _samplingInterval, _statType, _select)` - Get load balancer session listener and target statistics

## 13. LoadBalancerSessionsApi (5 methods)

- `create_load_balancer_session(body)` - Create a load balancer session
- `get_load_balancer_session_by_id(extId, _select)` - Get the load balancer session with the specified UUID
- `update_load_balancer_session_by_id(extId, body)` - Update the specified load balancer session
- `delete_load_balancer_session_by_id(extId)` - Delete the specified load balancer session
- `list_load_balancer_sessions(_page, _limit, _filter, _orderby, _select)` - Get the list of existing load balancer sessions

## 14. MacAddressesApi (2 methods)

- `get_learned_mac_address_for_layer2_stretch_by_id(layer2StretchExtId, extId)` - Get a specified learned MAC address of the specified Layer2Stretch
- `list_learned_mac_addresses_by_layer2_stretch_id(layer2StretchExtId, _page, _limit, _filter, _orderby)` - Get learned MAC addresses of the specified Layer2Stretch

## 15. NetworkControllersApi (5 methods)

- `create_network_controller(body)` - Create a network controller
- `get_network_controller_by_id(extId)` - Get the network controller with the specified UUID
- `update_network_controller_by_id(extId, body)` - Update a network controller summary
- `delete_network_controller_by_id(extId)` - Delete a network controller
- `list_network_controllers(_page, _limit)` - Gets the list of existing network controllers

## 16. NetworkFunctionsApi (5 methods)

- `create_network_function(body)` - Create a network function
- `get_network_function_by_id(extId)` - Get the network function with the specified UUID
- `update_network_function_by_id(extId, body)` - Update the specified network function
- `delete_network_function_by_id(extId)` - Delete the specified network function
- `list_network_functions(_page, _limit, _filter, _orderby)` - Get the list of existing network functions

## 17. NicProfilesApi (7 methods)

- `create_nic_profile(body)` - Create a NIC Profile
- `get_nic_profile_by_id(extId)` - Get a NIC Profile
- `update_nic_profile_by_id(extId, body)` - Update a NIC Profile
- `delete_nic_profile_by_id(extId)` - Delete a NIC Profile
- `list_nic_profiles(_page, _limit, _filter, _orderby, _select)` - Lists all NIC Profiles
- `associate_host_nic_to_nic_profile(extId, body)` - Associate a NIC Profile
- `disassociate_host_nic_from_nic_profile(extId, body)` - Disassociate a Host NIC from a NIC Profile

## 18. RemoteEntitiesApi (6 methods)

- `get_remote_subnet_for_cluster_by_id(clusterExtId, extId)` - Get remote subnet
- `list_remote_subnets_by_cluster_id(clusterExtId, _page, _limit, _filter, _orderby)` - List remote subnets
- `get_remote_vpn_connection_for_cluster_by_id(clusterExtId, extId)` - Get a remote VPN connection
- `list_remote_vpn_connections_by_cluster_id(clusterExtId, _page, _limit, _filter, _orderby)` - List remote VPN connections
- `get_remote_vtep_gateway_for_cluster_by_id(clusterExtId, extId)` - Get a remote VTEP gateway
- `list_remote_vtep_gateways_by_cluster_id(clusterExtId, _page, _limit, _filter, _orderby)` - List remote VTEP gateways

## 19. RouteTablesApi (2 methods)

- `get_route_table_by_id(extId)` - Get route table
- `list_route_tables(_page, _limit, _filter, _orderby)` - List route tables

## 20. RoutesApi (5 methods)

- `create_route_for_route_table(routeTableExtId, body)` - Create a route for the specified route table
- `get_route_for_route_table_by_id(extId, routeTableExtId)` - Get the specified route of the specified route table
- `update_route_for_route_table_by_id(extId, routeTableExtId, body)` - Update the specified route of the specified route table
- `delete_route_for_route_table_by_id(extId, routeTableExtId)` - Delete the specified route of the specified route table
- `list_routes_by_route_table_id(routeTableExtId, _page, _limit, _filter, _orderby)` - Lists routes of the specified route table

## 21. RoutingPoliciesApi (5 methods)

- `create_routing_policy(body)` - Create a Routing Policy
- `get_routing_policy_by_id(extId)` - Get a single Routing Policy corresponding to the extId
- `update_routing_policy_by_id(extId, body)` - Update the Routing Policy corresponding to the extId
- `delete_routing_policy_by_id(extId)` - Delete the Routing Policy corresponding to the extId
- `list_routing_policies(_page, _limit, _filter, _orderby, _expand, _select)` - Get a list of Routing Policies

## 22. RoutingPolicyStatsApi (1 method)

- `clear_routing_policy_counters(body)` - Clear the value in packet and byte counters of all Routing Policies in the chosen VPC or particular routing policy

## 23. SubnetIPReservationApi (3 methods)

- `reserve_ips_by_subnet_id(extId, body)` - Reserve IP addresses on a subnet
- `unreserve_ips_by_subnet_id(extId, body)` - Unreserve IP addresses on a subnet
- `list_reserved_ips_by_subnet_id(subnetExtId, _page, _limit, _filter, _orderby, _select)` - List reserved IPs of a managed subnet

## 24. SubnetMigrationsApi (2 methods)

- `migrate_subnets(body)` - Migrate VLAN subnets from VLAN basic to VLAN advanced
- `migrate_vnic_by_id(extId, body)` - Migrate vNICs from Acropolis to Atlas or vice-versa

## 25. SubnetsApi (6 methods)

- `create_subnet(body)` - Create a subnet
- `get_subnet_by_id(extId)` - Get the subnet with the specified UUID
- `update_subnet_by_id(extId, body)` - Update the specified subnet
- `delete_subnet_by_id(extId)` - Delete the specified subnet
- `list_subnets(_page, _limit, _filter, _orderby, _expand, _select)` - Get the list of existing subnets
- `list_vnics_by_subnet_id(subnetExtId, _page, _limit, _filter, _orderby, _select)` - List virtual NICs on a subnet

## 26. TrafficMirrorStatsApi (1 method)

- `get_traffic_mirror_stats(extId, _startTime, _endTime, _samplingInterval, _statType, _select)` - Get Traffic mirror session statistics

## 27. TrafficMirrorsApi (5 methods)

- `create_traffic_mirror(body)` - Create Traffic mirror session
- `get_traffic_mirror_by_id(extId)` - Get Traffic mirror session
- `update_traffic_mirror_by_id(extId, body)` - Update a Traffic mirror session for the provided UUID
- `delete_traffic_mirror_by_id(extId)` - Delete Traffic mirror session
- `list_traffic_mirrors(_page, _limit, _filter, _orderby)` - List Traffic mirror sessions

## 28. UplinkBondsApi (2 methods)

- `get_uplink_bond_by_id(extId)` - Get uplink bond
- `list_uplink_bonds(_page, _limit, _filter, _orderby)` - List uplink bonds

## 29. VirtualSwitchNodesInfoApi (1 method)

- `list_node_schedulable_status(X_Cluster_Id, _page, _limit, _filter, _orderby)` - Check whether a node in a cluster is a storage-only node or not

## 30. VirtualSwitchesApi (5 methods)

- `create_virtual_switch(body, X_Cluster_Id)` - Create a Virtual Switch
- `get_virtual_switch_by_id(extId, X_Cluster_Id)` - Get single Virtual Switch given its UUID
- `update_virtual_switch_by_id(extId, body, X_Cluster_Id)` - Update a Virtual Switch
- `delete_virtual_switch_by_id(extId, X_Cluster_Id)` - Delete a Virtual Switch
- `list_virtual_switches(X_Cluster_Id, _page, _limit, _filter, _orderby)` - Get list of Virtual Switches

## 31. VpcNsStatsApi (1 method)

- `get_vpc_ns_stats(vpcExtId, extId, _startTime, _endTime, _samplingInterval, _statType, _page, _limit, _select)` - Get VPC North-South statistics

## 32. VpcVirtualSwitchMappingsApi (2 methods)

- `create_vpc_virtual_switch_mapping(body)` - Set VPC for virtual switch mappings traffic config
- `list_vpc_virtual_switch_mappings(_page, _limit, _filter, _orderby)` - Get the VPC for virtual switch mappings config

## 33. VpcsApi (5 methods)

- `create_vpc(body)` - Create a VPC
- `get_vpc_by_id(extId)` - Get the VPC with the specified UUID
- `update_vpc_by_id(extId, body)` - Update the specified VPC
- `delete_vpc_by_id(extId)` - Delete the specified VPC
- `list_vpcs(_page, _limit, _filter, _orderby, _select)` - Get the list of existing VPCs

## 34. VpnConnectionStatsApi (1 method)

- `get_vpn_connection_stats(extId, _startTime, _endTime, _samplingInterval, _statType, _page, _limit, _select)` - Get VPN connection statistics

## 35. VpnConnectionsApi (7 methods)

- `create_vpn_connection(body)` - Create a VPN connection
- `get_vpn_connection_by_id(extId)` - Get VPN connection
- `update_vpn_connection_by_id(extId, body)` - Update VPN connection
- `delete_vpn_connection_by_id(extId)` - Delete VPN connection
- `list_vpn_connections(_page, _limit, _filter, _orderby)` - List the VPN connections
- `get_vpn_appliance_for_vpn_connection_by_id(vpnConnectionExtId, extId)` - Get third-party VPN appliance configuration
- `list_vpn_appliances_by_vpn_connection_id(vpnConnectionExtId, _page, _limit, _filter, _orderby)` - List of third-party VPN appliances for which configurations are available to download

---

## Common Parameters

### Standard Query Parameters (most list methods)

| Parameter | Type | Description |
|-----------|------|-------------|
| `_page` | `int` | Page number (0-based) for pagination |
| `_limit` | `int` | Number of results per page |
| `_filter` | `str` | OData filter expression |
| `_orderby` | `str` | OData sort expression |
| `_select` | `str` | OData sparse fieldsets |
| `_expand` | `str` | OData expand related entities |

### Identity Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `extId` | `str` | Entity external ID (UUID) |
| `body` | model | Request body (varies by method) |
| `X_Cluster_Id` | `str` | Target cluster UUID (required for cluster-scoped APIs) |

### Statistics Parameters (stats APIs)

| Parameter | Type | Description |
|-----------|------|-------------|
| `_startTime` | `datetime` | Start time of the statistics period |
| `_endTime` | `datetime` | End time of the statistics period |
| `_samplingInterval` | `int` | Sampling interval in seconds |
| `_statType` | `str` | Type of statistic to retrieve |

### Common kwargs (all methods)

| kwarg | Description |
|-------|-------------|
| `async_req` | Execute asynchronously, returns `ApplyResult` |
| `_return_http_data_only` | Return only response data (default: `True`) |
| `_preload_content` | Deserialize response (default: `True`) |
| `_request_timeout` | Timeout in seconds |

---

## API Classes by Category

### Core Networking
- **SubnetsApi** (6) - Subnet CRUD and vNIC listing
- **VpcsApi** (5) - Virtual Private Cloud management
- **FloatingIpsApi** (5) - Floating IP address management
- **VirtualSwitchesApi** (5) - Virtual switch management
- **RouteTablesApi** (2) - Route table management
- **RoutesApi** (5) - Route CRUD within route tables
- **RoutingPoliciesApi** (5) - Routing policy management

### Connectivity
- **VpnConnectionsApi** (7) - VPN connection management and appliance config
- **BgpSessionsApi** (5) - BGP session management
- **BgpRoutesApi** (2) - BGP route inspection
- **GatewaysApi** (6) - Network gateway management and upgrade
- **Layer2StretchesApi** (5) - Layer 2 stretch configuration

### Load Balancing
- **LoadBalancerSessionsApi** (5) - Load balancer session management
- **LoadBalancerSessionStatsApi** (1) - Load balancer statistics

### Network Functions & Security
- **NetworkControllersApi** (5) - Network controller management
- **NetworkFunctionsApi** (5) - Network function chain management
- **TrafficMirrorsApi** (5) - Traffic mirror session management
- **IPFIXExportersApi** (5) - IPFIX flow exporter management

### Infrastructure
- **NicProfilesApi** (7) - Physical NIC profile management
- **UplinkBondsApi** (2) - Uplink bond inspection
- **BridgesApi** (1) - Bridge to virtual switch migration
- **SubnetMigrationsApi** (2) - Subnet and vNIC migration
- **SubnetIPReservationApi** (3) - IP address reservation management
- **VpcVirtualSwitchMappingsApi** (2) - VPC to virtual switch mapping

### Cloud (NC2)
- **AwsSubnetsApi** (1) - NC2 on AWS subnet listing
- **AwsVpcsApi** (1) - NC2 on AWS VPC listing

### Remote / Multi-Site
- **RemoteEntitiesApi** (6) - Remote subnets, VPN connections, VTEP gateways

### Monitoring & Stats
- **Layer2StretchStatsApi** (1) - Layer 2 stretch statistics
- **TrafficMirrorStatsApi** (1) - Traffic mirror statistics
- **VpcNsStatsApi** (1) - VPC North-South traffic statistics
- **VpnConnectionStatsApi** (1) - VPN connection statistics
- **LoadBalancerSessionStatsApi** (1) - Load balancer statistics
- **RoutingPolicyStatsApi** (1) - Routing policy counter clearing
- **MacAddressesApi** (2) - Learned MAC address inspection

### Node Info
- **VirtualSwitchNodesInfoApi** (1) - Node schedulable status
- **ClusterCapabilitiesApi** (1) - Cluster networking capabilities
