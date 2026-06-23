---
name: nutanix-microseg
description: "Nutanix Microsegmentation (Flow) Python SDK - network security policies, address groups, service groups, isolation policies, firewall rules"
metadata:
  languages: "python"
  versions: "4.2.1"
  revision: 1
  updated-on: "2026-03-16"
  source: community
  tags: "nutanix,microseg,flow,security-policy,firewall,isolation,zero-trust,address-group,service-group"
---

# Nutanix Microsegmentation (Flow) Python SDK v4.2.1

## Golden Rule

Package: `ntnx_microseg_py_client`

```python
import ntnx_microseg_py_client as microseg_client
import ntnx_microseg_py_client.models.microseg.v4.config as v4MicrosegConfig
```

## Authentication Setup

```python
config = microseg_client.Configuration()
config.host = "prism-central.example.com"
config.port = 9440
config.username = "admin"
config.password = "password"
config.verify_ssl = False

api_client = microseg_client.ApiClient(configuration=config)
```

## API Classes (5 total)

| API Class | Methods | Purpose |
|-----------|---------|---------|
| NetworkSecurityPoliciesApi | 8 | Create/update/delete/list security policies |
| AddressGroupsApi | 5 | Manage IP address groups for policy rules |
| ServiceGroupsApi | 5 | Manage service (protocol/port) groups |
| DirectoryServerConfigsApi | 10 | Configure directory services for identity-based policies |
| EntityGroupsApi | 5 | Manage entity groups |

## Core Operations

### 1. Create Two-Environment Isolation Policy

Isolation policies prevent communication between two groups of VMs categorized in Prism Central.

```python
nsp_api = microseg_client.NetworkSecurityPoliciesApi(api_client=api_client)

# Categories must already exist in Prism Central (use prism CategoriesApi)
# Obtain category ext_ids from the prism namespace
env_a_category_ext_id = "cat-ext-id-for-production"
env_b_category_ext_id = "cat-ext-id-for-development"

# Build isolation rule spec
isolation_rule = v4MicrosegConfig.TwoEnvIsolationRuleSpec(
    first_isolation_group=[env_a_category_ext_id],
    second_isolation_group=[env_b_category_ext_id]
)

# Build the security policy
policy = v4MicrosegConfig.NetworkSecurityPolicy(
    name="Isolate-Prod-from-Dev",
    description="Prevent all traffic between Production and Development VMs",
    type=v4MicrosegConfig.SecurityPolicyType.ISOLATION,
    state=v4MicrosegConfig.SecurityPolicyState.MONITOR,
    rules=[
        v4MicrosegConfig.NetworkSecurityPolicyRule(
            type=v4MicrosegConfig.RuleType.TWO_ENV_ISOLATION,
            spec=isolation_rule
        )
    ]
)

# Create the policy - returns a task
task_response = nsp_api.create_network_security_policy(body=policy)
task_ext_id = task_response.data.ext_id

# Poll task to completion
wait_for_task(prism_client, task_ext_id, timeout=120)
```

### 2. List Security Policies

```python
nsp_api = microseg_client.NetworkSecurityPoliciesApi(api_client=api_client)

# List all policies
policies = nsp_api.list_network_security_policies()
for policy in policies.data:
    print(f"Policy: {policy.name}, Type: {policy.type}, State: {policy.state}")

# Filter by type
isolation_policies = nsp_api.list_network_security_policies(
    _filter="type eq 'ISOLATION'"
)
```

### 3. Get and Update a Security Policy

```python
# Get policy by ID
policy = nsp_api.get_network_security_policy_by_id(extId=policy_ext_id)

# Extract ETag for optimistic concurrency
etag = policy.headers.get("ETag")

# Switch from MONITOR to ENFORCE
policy.data.state = v4MicrosegConfig.SecurityPolicyState.ENFORCE

# Update with If-Match header
nsp_api.update_network_security_policy_by_id(
    extId=policy_ext_id,
    body=policy.data,
    if_match=etag
)
```

### 4. Delete a Security Policy

```python
# Get current ETag first
policy = nsp_api.get_network_security_policy_by_id(extId=policy_ext_id)
etag = policy.headers.get("ETag")

nsp_api.delete_network_security_policy_by_id(
    extId=policy_ext_id,
    if_match=etag
)
```

### 5. Create Address Group

Address groups define sets of IP addresses/subnets used in policy rules.

```python
ag_api = microseg_client.AddressGroupsApi(api_client=api_client)

address_group = v4MicrosegConfig.AddressGroup(
    name="Web-Servers-Subnet",
    description="Subnet for web server tier",
    ip_ranges=[
        v4MicrosegConfig.IPv4Range(
            start_ip="10.0.1.0",
            end_ip="10.0.1.255"
        )
    ],
    ip_subnets=[
        v4MicrosegConfig.IPv4Subnet(
            ip="10.0.2.0",
            prefix_length=24
        )
    ]
)

task_response = ag_api.create_address_group(body=address_group)
```

### 6. List Address Groups

```python
ag_api = microseg_client.AddressGroupsApi(api_client=api_client)

address_groups = ag_api.list_address_groups()
for ag in address_groups.data:
    print(f"Address Group: {ag.name}, ID: {ag.ext_id}")
```

### 7. Create Service Group

Service groups define protocol/port combinations for policy rules.

```python
sg_api = microseg_client.ServiceGroupsApi(api_client=api_client)

service_group = v4MicrosegConfig.ServiceGroup(
    name="Web-Services",
    description="HTTP and HTTPS services",
    tcp_services=[
        v4MicrosegConfig.TcpPortRangeSpec(
            start_port=80,
            end_port=80
        ),
        v4MicrosegConfig.TcpPortRangeSpec(
            start_port=443,
            end_port=443
        )
    ],
    udp_services=[
        v4MicrosegConfig.UdpPortRangeSpec(
            start_port=53,
            end_port=53
        )
    ]
)

task_response = sg_api.create_service_group(body=service_group)
```

### 8. List Service Groups

```python
sg_api = microseg_client.ServiceGroupsApi(api_client=api_client)

service_groups = sg_api.list_service_groups()
for sg in service_groups.data:
    print(f"Service Group: {sg.name}, ID: {sg.ext_id}")
```

## Key Types and Enums

| Type | Values | Description |
|------|--------|-------------|
| SecurityPolicyType | ISOLATION, APPLICATION | Policy classification |
| SecurityPolicyState | MONITOR, ENFORCE | Monitor logs only; Enforce blocks traffic |
| RuleType | TWO_ENV_ISOLATION, APPLICATION | Rule classification within a policy |

## Key Models

| Model | Description |
|-------|-------------|
| NetworkSecurityPolicy | Top-level policy object with name, type, state, rules |
| NetworkSecurityPolicyRule | Individual rule within a policy |
| TwoEnvIsolationRuleSpec | Defines two category groups to isolate |
| AddressGroup | Named set of IP ranges/subnets |
| ServiceGroup | Named set of TCP/UDP port ranges |
| IPv4Range | Start/end IP address range |
| IPv4Subnet | IP + prefix length subnet definition |
| TcpPortRangeSpec | TCP port range (start_port, end_port) |
| UdpPortRangeSpec | UDP port range (start_port, end_port) |

## Policy Lifecycle

1. **Create in MONITOR mode**: Policy logs traffic matches but does not block.
2. **Review flow logs**: Verify the policy matches expected traffic patterns.
3. **Switch to ENFORCE mode**: Policy actively blocks traffic that violates rules.

Always start with MONITOR to avoid accidental network disruptions.

## Cross-Namespace Dependencies

- **prism (CategoriesApi)**: Isolation groups reference category `ext_id` values from Prism Central. Create categories first, then use their ext_ids in isolation rule specs.
- **vmm**: VMs are assigned categories which determine which policies apply to them.
- **prism (TasksApi)**: Poll async task completion after create/update/delete operations.

## Common Mistakes

1. **Using category names instead of ext_ids**: Isolation rules require category `ext_id` values, not names.
2. **Enforcing without monitoring first**: Always start policies in MONITOR state to validate before enforcing.
3. **Missing ETag on updates**: Update and delete operations require the `If-Match` header with the current ETag value.
4. **Forgetting task polling**: Create/update/delete operations return tasks that must be polled to confirm completion.
