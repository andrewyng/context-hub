---
name: nutanix-networking
description: "Nutanix Networking Python SDK - subnets, VPCs, floating IPs, gateways, virtual switches, VPN, BGP, routing, IPFIX, load balancers, traffic mirrors"
metadata:
  languages: "python"
  versions: "4.2.1"
  revision: 1
  updated-on: "2026-03-16"
  source: community
  tags: "nutanix,networking,subnet,vlan,vpc,floating-ip,gateway,vpn,bgp,virtual-switch,load-balancer"
---

# Nutanix Networking Python SDK (v4.2.1)

35 API classes, 118 methods, 375 models. Largest namespace by API class count.

## Golden Rule

- **Package**: `ntnx_networking_py_client`
- **Install**: `pip install ntnx-networking-py-client==4.2.1`

## Initialization

```python
import ntnx_networking_py_client
from ntnx_networking_py_client import Configuration, ApiClient
from ntnx_networking_py_client.rest import ApiException
import ntnx_networking_py_client.models.networking.v4.config as v4NetConfig
import ntnx_networking_py_client.models.common.v1.config as v1CommonConfig

config = Configuration()
config.host = "10.0.0.1"       # Prism Central IP (no https://, no port)
config.port = 9440
config.username = "admin"
config.password = "password"
config.verify_ssl = False
config.max_retry_attempts = 3
config.backoff_multiplier = 2

client = ApiClient(configuration=config)
subnets_api = ntnx_networking_py_client.SubnetsApi(api_client=client)
vpcs_api = ntnx_networking_py_client.VpcsApi(api_client=client)
fips_api = ntnx_networking_py_client.FloatingIpsApi(api_client=client)
vswitches_api = ntnx_networking_py_client.VirtualSwitchesApi(api_client=client)
gateways_api = ntnx_networking_py_client.GatewaysApi(api_client=client)
```

## Model Imports

```python
# Networking config models (Subnet, Vpc, FloatingIp, etc.)
import ntnx_networking_py_client.models.networking.v4.config as v4NetConfig

# Common models (IPv4Address, IPv6Address, etc.)
import ntnx_networking_py_client.models.common.v1.config as v1CommonConfig
```

## Core Operations

### 1. Create Managed VLAN Subnet with DHCP

```python
# Step 1: Get cluster ext_id from clustermgmt namespace first
cluster_ext_id = "abcd-1234-..."  # from ClustersApi.list_clusters()

# Step 2: Build IP configuration
ip_pool = v4NetConfig.IPv4Pool(
    start_ip=v1CommonConfig.IPv4Address(
        value="10.0.1.100",
        prefix_length=32      # REQUIRED - always 32 for a single address
    ),
    end_ip=v1CommonConfig.IPv4Address(
        value="10.0.1.200",
        prefix_length=32      # REQUIRED - always 32 for a single address
    )
)

dhcp_config = v4NetConfig.DhcpServerReference(
    address=v1CommonConfig.IPv4Address(
        value="10.0.1.1",
        prefix_length=32
    ),
    dns_servers=[
        v1CommonConfig.IPv4Address(value="8.8.8.8", prefix_length=32),
        v1CommonConfig.IPv4Address(value="8.8.4.4", prefix_length=32)
    ],
    domain_name="example.com",
    boot_file_name=None
)

ipv4_config = v4NetConfig.IPv4Config(
    ip_pools=[ip_pool],
    default_gateway_ip=v1CommonConfig.IPv4Address(
        value="10.0.1.1",
        prefix_length=32
    ),
    dhcp_server_address=v1CommonConfig.IPv4Address(
        value="10.0.1.1",
        prefix_length=32
    ),
    subnet_ip=v1CommonConfig.IPv4Address(
        value="10.0.1.0",
        prefix_length=24      # NOTE: 24 for the subnet CIDR, not 32
    )
)

ip_config = v4NetConfig.IPConfig(ipv4=ipv4_config)

# Step 3: Build and create the subnet
subnet = v4NetConfig.Subnet(
    name="my-vlan-subnet",
    description="Managed VLAN subnet with DHCP",
    subnet_type=v4NetConfig.SubnetType.VLAN,
    network_id=100,           # VLAN ID
    cluster_reference=cluster_ext_id,  # From clustermgmt
    ip_config=[ip_config],
    is_advanced_networking=False
)

response = subnets_api.create_subnet(body=subnet)
task_ext_id = response.data.ext_id  # Returns a task
print(f"Subnet creation task: {task_ext_id}")
```

### 2. List Subnets with Filter

```python
# List all VLAN subnets
response = subnets_api.list_subnets(
    _filter="subnetType eq Networking.Config.SubnetType'VLAN'",
    _orderby="name asc",
    _limit=50
)
subnets = response.data
for subnet in subnets:
    print(f"{subnet.name} -> VLAN {subnet.network_id}, ext_id={subnet.ext_id}")

# List subnets by name
response = subnets_api.list_subnets(
    _filter="name eq 'my-vlan-subnet'"
)

# List OVERLAY subnets (VPC-attached)
response = subnets_api.list_subnets(
    _filter="subnetType eq Networking.Config.SubnetType'OVERLAY'"
)
```

### 3. Create VPC

```python
vpc = v4NetConfig.Vpc(
    name="my-vpc",
    description="Production VPC",
    external_subnets=[
        v4NetConfig.ExternalSubnet(
            subnet_reference=external_subnet_ext_id,
            active_gateway_node=None
        )
    ],
    externally_routable_prefixes=[
        v4NetConfig.IPSubnet(
            ip=v1CommonConfig.IPv4Address(value="10.100.0.0", prefix_length=16),
            prefix_length=16
        )
    ]
)

response = vpcs_api.create_vpc(body=vpc)
task_ext_id = response.data.ext_id
```

### 4. List Floating IPs

```python
response = fips_api.list_floating_ips(
    _limit=100,
    _orderby="floating_ip asc"
)
for fip in response.data:
    print(f"FIP: {fip.floating_ip} -> VM NIC: {fip.vm_nic_reference}")
```

### 5. Create Virtual Switch

```python
vswitch = v4NetConfig.VirtualSwitch(
    name="vs0",
    description="Default virtual switch",
    bond_mode=v4NetConfig.BondModeType.ACTIVE_BACKUP,
    mtu=9000,
    cluster_references=[cluster_ext_id]
)

response = vswitches_api.create_virtual_switch(body=vswitch)
task_ext_id = response.data.ext_id
```

## Key Patterns

### Subnet Creation Requires cluster_reference

Every VLAN subnet must have a `cluster_reference` set to a valid cluster `ext_id` obtained from the clustermgmt namespace. Overlay subnets reference a VPC instead.

### IPv4Address Always Needs prefix_length AND value

Every `IPv4Address` object requires both `value` and `prefix_length`. For individual host addresses (gateways, DNS servers, pool endpoints), use `prefix_length=32`. For subnet addresses, use the actual CIDR prefix (e.g., 24).

```python
# Correct - individual address
v1CommonConfig.IPv4Address(value="10.0.1.1", prefix_length=32)

# Correct - subnet address
v1CommonConfig.IPv4Address(value="10.0.1.0", prefix_length=24)

# WRONG - missing prefix_length (will fail)
v1CommonConfig.IPv4Address(value="10.0.1.1")
```

### SubnetType Enum

```python
v4NetConfig.SubnetType.VLAN       # Traditional VLAN-backed subnet
v4NetConfig.SubnetType.OVERLAY    # VPC overlay subnet
```

### OData Filtering

```python
# Filter by subnet type
_filter="subnetType eq Networking.Config.SubnetType'VLAN'"

# Filter by name
_filter="name eq 'my-subnet'"

# Filter by VLAN ID
_filter="networkId eq 100"
```

### ETag for Updates

```python
get_response = subnets_api.get_subnet_by_id(extId=subnet_ext_id)
etag = client.get_etag(get_response)

subnets_api.update_subnet_by_id(
    extId=subnet_ext_id,
    body=updated_subnet,
    If_Match=etag
)
```

## API Classes Reference

### Primary APIs (most commonly used)

| API Class | Methods | Description |
|-----------|---------|-------------|
| SubnetsApi | 6 | VLAN and overlay subnet CRUD, list |
| VpcsApi | 5 | VPC CRUD |
| FloatingIpsApi | 5 | Floating IP CRUD, assignment |
| GatewaysApi | 6 | Gateway CRUD (local, VPN) |
| VirtualSwitchesApi | 5 | Virtual switch CRUD |
| VpnConnectionsApi | 7 | VPN connection CRUD, stats |
| BgpSessionsApi | 5 | BGP session CRUD |
| RoutingPoliciesApi | 5 | Routing policy CRUD |
| RoutesApi | 5 | Static route CRUD |
| NetworkControllersApi | 5 | Network controller CRUD |

### Advanced APIs

| API Class | Methods | Description |
|-----------|---------|-------------|
| IPFIXExportersApi | 5 | IPFIX flow export configuration |
| Layer2StretchesApi | 5 | L2 stretch for cross-site networking |
| LoadBalancerSessionsApi | 5 | Load balancer session CRUD |
| TrafficMirrorsApi | 5 | Traffic mirror CRUD |
| NetworkFunctionsApi | 5 | Network function chain management |
| NicProfilesApi | 7 | NIC profile CRUD |
| RemoteEntitiesApi | 6 | Remote subnet/VPN entity management |
| SubnetIPReservationApi | 3 | Reserve/unreserve IPs in a subnet |
| SubnetMigrationsApi | 2 | Migrate subnets between clusters |

### Auxiliary / Stats APIs

| API Class | Methods | Description |
|-----------|---------|-------------|
| RouteTablesApi | 2 | Route table operations |
| BgpRoutesApi | 2 | BGP route inspection |
| MacAddressesApi | 2 | MAC address operations |
| UplinkBondsApi | 2 | Uplink bond configuration |
| VpcVirtualSwitchMappingsApi | 2 | VPC-to-vswitch mappings |
| AwsSubnetsApi | 1 | NC2 on AWS subnet listing |
| AwsVpcsApi | 1 | NC2 on AWS VPC listing |
| BridgesApi | 1 | Bridge listing |
| ClusterCapabilitiesApi | 1 | Cluster networking capabilities |
| Layer2StretchStatsApi | 1 | L2 stretch statistics |
| LoadBalancerSessionStatsApi | 1 | Load balancer statistics |
| RoutingPolicyStatsApi | 1 | Routing policy statistics |
| TrafficMirrorStatsApi | 1 | Traffic mirror statistics |
| VirtualSwitchNodesInfoApi | 1 | Per-node vswitch info |
| VpcNsStatsApi | 1 | VPC network statistics |
| VpnConnectionStatsApi | 1 | VPN connection statistics |

## Key Models

| Model | Notable Properties |
|-------|-------------------|
| Subnet | name, ext_id, subnet_type, network_id, cluster_reference, ip_config, vpc_reference, is_advanced_networking, bridge_name |
| FloatingIp | ext_id, floating_ip, vm_nic_reference, vpc_reference, private_ip |
| Vpc | name, ext_id, external_subnets, externally_routable_prefixes, common_domain_name_server_ip_list |
| VpnConnection | name, ext_id, local_gateway_reference, remote_gateway_reference, ipsec_config, dynamic_route_priority |
| Gateway | name, ext_id, gateway_type, vlan_subnet_reference, vpc_reference |
| VirtualSwitch | name, ext_id, bond_mode, mtu, cluster_references |
| IPConfig | ipv4 (IPv4Config), ipv6 (IPv6Config) |
| IPv4Config | ip_pools, default_gateway_ip, dhcp_server_address, subnet_ip |

## Common Mistakes

1. **Forgetting prefix_length=32 on IPv4Address objects** - Every `IPv4Address` must have `prefix_length` set. For individual addresses (gateways, pool endpoints, DNS), always use 32. Omitting it causes silent failures or API errors.

2. **Not setting cluster_reference on VLAN subnets** - VLAN subnets must specify which cluster they belong to via `cluster_reference`. Get the cluster ext_id from `ntnx_clustermgmt_py_client.ClustersApi.list_clusters()` first.

3. **Confusing SubnetType.VLAN vs SubnetType.OVERLAY** - VLAN subnets are tied to a physical cluster and VLAN ID. OVERLAY subnets exist inside a VPC and use Geneve encapsulation. They have different required fields:
   - VLAN: requires `cluster_reference` and `network_id` (VLAN ID)
   - OVERLAY: requires `vpc_reference`, no `network_id`

4. **Using wrong filter enum format** - Subnet type filters must use the fully qualified enum:
   ```
   # Correct
   _filter="subnetType eq Networking.Config.SubnetType'VLAN'"

   # Wrong
   _filter="subnetType eq 'VLAN'"
   ```

5. **Ignoring task responses** - Create/update/delete operations return a task ext_id, not the resource directly. Poll the task via `ntnx_prism_py_client.TasksApi` to get the final resource ext_id.

6. **Missing X_Cluster_Id for AWS APIs** - The `AwsSubnetsApi` and `AwsVpcsApi` require the `X_Cluster_Id` header parameter for NC2-on-AWS operations.

## Cross-Namespace Dependencies

| Dependency | Source Namespace | What You Need |
|-----------|-----------------|---------------|
| Cluster ext_id for subnet creation | clustermgmt | `ClustersApi.list_clusters()` -> `cluster.ext_id` |
| Task polling for async operations | prism | `TasksApi.get_task_by_id(task_ext_id)` |
| VM NIC for floating IP assignment | vmm | `VmApi.list_vms()` -> VM NIC ext_id |
| Category assignment | prism | Category ext_ids for tagging subnets/VPCs |
