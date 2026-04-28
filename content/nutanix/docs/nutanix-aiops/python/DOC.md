---
name: nutanix-aiops
description: "Nutanix AIOps (Intelligent Operations) Python SDK - capacity planning, what-if scenarios, simulations, runway projections, cluster metrics, rightsizing"
metadata:
  languages: "python"
  versions: "4.2.1b1"
  revision: 1
  updated-on: "2026-03-16"
  source: community
  tags: "nutanix,aiops,capacity-planning,what-if,scenario,simulation,runway,rightsizing,metrics"
---

# Nutanix AIOps (Intelligent Operations) Python SDK v4.2.1b1

**NOTE: This is a BETA package (v4.2.1b1). APIs may change in future releases.**

The official SDK reference site only lists v4.0.a1 with 1 API class. The installed v4.2.1b1 beta is significantly ahead with 2 API classes and 18 methods.

## Golden Rule

Package: `ntnx_aiops_py_client`

```python
import ntnx_aiops_py_client as aiops_client
```

## Authentication Setup

```python
config = aiops_client.Configuration()
config.host = "prism-central.example.com"
config.port = 9440
config.username = "admin"
config.password = "password"
config.verify_ssl = False

api_client = aiops_client.ApiClient(configuration=config)
```

## API Classes (2 total, 18 methods)

| API Class | Methods | Purpose |
|-----------|---------|---------|
| ScenariosApi | 14 | Capacity planning scenarios, simulations, runway, recommendations, reports |
| StatsApi | 4 | Entity metrics, entity types, entity descriptors, data sources |

## Core Operations

### 1. Create a Capacity Planning Scenario

Scenarios model "what-if" situations to predict cluster capacity needs.

```python
scenario_api = aiops_client.ScenariosApi(api_client=api_client)

scenario = aiops_client.Scenario(
    name="add-50-vms-scenario",
    description="What if we add 50 new VMs to the production cluster?"
)

task_response = scenario_api.create_scenario(body=scenario)
task_ext_id = task_response.data.ext_id

# Poll task to completion
task_data = wait_for_task(prism_client, task_ext_id, timeout=300)
scenario_ext_id = task_data.completion_details[0].value
```

### 2. Create a Simulation within a Scenario

Simulations define the specific workload changes (add VMs, change resources) to model.

```python
simulation = aiops_client.Simulation(
    scenario_ext_id=scenario_ext_id
)

task_response = scenario_api.create_simulation(body=simulation)
task_ext_id = task_response.data.ext_id

task_data = wait_for_task(prism_client, task_ext_id, timeout=300)
simulation_ext_id = task_data.completion_details[0].value
```

### 3. Generate Runway Projection

Runway calculates how long before a cluster runs out of resources (CPU, memory, storage).

```python
task_response = scenario_api.generate_runway(extId=scenario_ext_id)
task_ext_id = task_response.data.ext_id

# Runway generation can take several minutes
task_data = wait_for_task(prism_client, task_ext_id, timeout=600)
```

### 4. Generate Recommendation

Get recommendations for capacity additions based on the scenario analysis.

```python
task_response = scenario_api.generate_recommendation(extId=scenario_ext_id)
task_ext_id = task_response.data.ext_id

task_data = wait_for_task(prism_client, task_ext_id, timeout=600)
```

### 5. Generate Report

Create a downloadable capacity planning report.

```python
task_response = scenario_api.generate_report(extId=scenario_ext_id)
task_ext_id = task_response.data.ext_id

task_data = wait_for_task(prism_client, task_ext_id, timeout=300)
```

### 6. Get Scenario Report

Retrieve a previously generated report.

```python
report = scenario_api.get_scenario_report(extId=scenario_ext_id)
```

### 7. List Scenarios

```python
scenarios = scenario_api.list_scenarios()
for s in scenarios.data:
    print(f"Scenario: {s.name}, ID: {s.ext_id}")
```

### 8. Get Scenario Details

```python
scenario = scenario_api.get_scenario_by_id(extId=scenario_ext_id)
print(f"Name: {scenario.data.name}")
print(f"Description: {scenario.data.description}")
```

### 9. Update a Scenario

```python
scenario_api.update_scenario_by_id(
    extId=scenario_ext_id,
    body=updated_scenario
)
```

### 10. List and Get Simulations

```python
simulations = scenario_api.list_simulations()
for sim in simulations.data:
    print(f"Simulation: {sim.ext_id}")

sim = scenario_api.get_simulation_by_id(extId=simulation_ext_id)
```

### 11. Delete Scenario and Simulation

```python
scenario_api.delete_simulation_by_id(extId=simulation_ext_id)
scenario_api.delete_scenario_by_id(extId=scenario_ext_id)
```

## Stats API: Cluster Metrics and Entity Data

The StatsApi provides access to time-series metrics and entity metadata.

### Get Available Data Sources

```python
stats_api = aiops_client.StatsApi(api_client=api_client)

sources = stats_api.get_sources_v4()
for source in sources.data:
    print(f"Source: {source.name}, ID: {source.ext_id}")
```

### Get Entity Types

```python
entity_types = stats_api.get_entity_types_v4()
for et in entity_types.data:
    print(f"Entity Type: {et.name}")
```

### Get Entity Descriptors

Entity descriptors define available metrics for each entity type.

```python
descriptors = stats_api.get_entity_descriptors_v4()
for desc in descriptors.data:
    print(f"Descriptor: {desc.name}, Unit: {desc.unit}")
```

### Get Entity Metrics

Retrieve time-series metrics for specific entities.

```python
metrics = stats_api.get_entity_metrics_v4()
```

## Key Models

| Model | Props | Description |
|-------|-------|-------------|
| Scenario | 14 | Capacity planning scenario with name, description, cluster scope |
| ClusterMetrics | 27 | Comprehensive cluster resource metrics (CPU, memory, storage, IOPS) |
| ClusterProjection | 14 | Projected cluster resource usage over time |
| MetricDescriptor | 11 | Metadata describing an available metric (name, unit, type) |
| EntityDescriptor | 8 | Describes entity attributes available for metrics queries |
| Runway | 5 | Days remaining before resource exhaustion per resource type |
| Simulation | 5 | Workload simulation within a scenario |
| NodeProjection | 5 | Projected resource usage per node |
| Source | 4 | Data source for metrics collection |
| EntityType | 4 | Entity type classification for metrics |

## Typical Workflow: Capacity Planning

1. **Create scenario**: Define the what-if question (e.g., "add 50 VMs").
2. **Create simulation**: Specify the workload details within the scenario.
3. **Generate runway**: Calculate when resources will be exhausted.
4. **Generate recommendation**: Get node/resource addition suggestions.
5. **Generate report**: Create a shareable capacity planning document.
6. **Review and clean up**: Delete scenarios when no longer needed.

## Common Mistakes

1. **Beta API instability**: As a beta package, APIs may change. Pin the version and test after upgrades.
2. **Insufficient timeout for runway**: Runway calculations analyze historical trends and can take several minutes on large clusters.
3. **Not deleting old scenarios**: Scenarios consume storage. Clean up completed planning exercises.
4. **Confusing scenario vs. simulation**: A scenario is the top-level container; simulations are the specific workload models within it.

## Cross-Namespace Dependencies

- **clustermgmt**: Cluster ext_ids for scoping scenarios and metrics to specific clusters.
- **vmm**: VM resource data used in simulation workload definitions.
- **prism (TasksApi)**: Poll async tasks for runway generation and recommendations.
