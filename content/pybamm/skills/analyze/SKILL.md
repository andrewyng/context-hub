---
name: analyze
description: "Workflow for extracting, plotting, and interpreting PyBaMM simulation results from a Solution object"
metadata:
  revision: 1
  updated-on: "2026-05-09"
  source: community
  tags: "pybamm,battery,simulation,analysis,plotting,python"
---

# PyBaMM: Analysing Simulation Results

After `sim.solve()`, all results live in the `Solution` object. This skill covers how to extract variables, plot them, compare runs, and interpret common outputs.

## Accessing Variables

Variables are accessed by their full name including unit suffix:

```python
solution = sim.solution

t  = solution["Time [s]"].entries           # time array (numpy)
V  = solution["Voltage [V]"].entries        # terminal voltage
I  = solution["Current [A]"].entries        # current (positive = discharge)
Q  = solution["Discharge capacity [A.h]"].entries
T  = solution["Cell temperature [K]"].entries
```

`.entries` returns a 1-D numpy array aligned with the time vector.

## Common Variable Names

### Cell-level

| Variable | Unit |
|----------|------|
| `"Time [s]"` | s |
| `"Time [h]"` | h |
| `"Voltage [V]"` | V |
| `"Current [A]"` | A |
| `"Discharge capacity [A.h]"` | A·h |
| `"Throughput capacity [A.h]"` | A·h (cumulative, multi-cycle) |
| `"Cell temperature [K]"` | K |
| `"Power [W]"` | W |

### Electrode and electrolyte (DFN / SPMe)

| Variable | Unit |
|----------|------|
| `"Electrolyte concentration [mol.m-3]"` | mol m⁻³ |
| `"Negative electrode potential [V]"` | V |
| `"Positive electrode potential [V]"` | V |
| `"Negative particle surface concentration [mol.m-3]"` | mol m⁻³ |
| `"Positive particle surface concentration [mol.m-3]"` | mol m⁻³ |

### State of charge

| Variable | Unit |
|----------|------|
| `"State of charge"` | dimensionless (0–1) |
| `"Depth of discharge"` | dimensionless (0–1) |

## Listing Available Variables

```python
# Variables available for the solved model
print(list(solution.all_models[0].variables.keys()))
```

This is the authoritative list — it depends on which model and submodel options were used.

## Interpolating at a Specific Time

```python
# Voltage at exactly t = 1800 s
V_at_half = solution["Voltage [V]"](t=1800)

# Multiple times
import numpy as np
t_query = np.array([600, 1200, 1800, 2400, 3000])
V_values = solution["Voltage [V]"](t=t_query)
```

## Plotting

### Quick plot (interactive)

```python
sim.plot()                                   # default variables
sim.plot(["Voltage [V]", "Current [A]"])     # selected variables
```

Pass a nested list to share a y-axis:

```python
sim.plot([
    "Voltage [V]",
    ["Current [A]", "Discharge capacity [A.h]"],  # these two share an axis
])
```

### Comparing multiple runs

```python
import pybamm

solutions = []
labels = []

for c_rate in [0.5, 1.0, 2.0]:
    param.update({"Current function [A]": c_rate * 5.0})
    sim = pybamm.Simulation(model, parameter_values=param)
    sim.solve([0, 3600 / c_rate])
    solutions.append(sim.solution)
    labels.append(f"{c_rate}C")

pybamm.QuickPlot(solutions, ["Voltage [V]"], labels=labels).dynamic_plot()
```

### Matplotlib plot (for publication)

```python
import matplotlib.pyplot as plt

t = solution["Time [h]"].entries
V = solution["Voltage [V]"].entries
Q = solution["Discharge capacity [A.h]"].entries

fig, axes = plt.subplots(1, 2, figsize=(10, 4))

axes[0].plot(t, V)
axes[0].set(xlabel="Time [h]", ylabel="Voltage [V]", title="Voltage vs Time")

axes[1].plot(Q, V)
axes[1].set(xlabel="Discharge capacity [A.h]", ylabel="Voltage [V]", title="V vs Q")

plt.tight_layout()
plt.savefig("discharge.png", dpi=150)
plt.show()
```

## Multi-Cycle Analysis

When using `pybamm.Experiment` with repeated cycles, the Solution contains data for all cycles concatenated. Use `solution.cycles` to access individual cycles:

```python
experiment = pybamm.Experiment([
    ("Discharge at 1C until 2.5 V",
     "Charge at 1C until 4.2 V",
     "Hold at 4.2 V until C/50"),
] * 10)  # 10 cycles

sim = pybamm.Simulation(model, parameter_values=param, experiment=experiment)
sim.solve()

solution = sim.solution

# Per-cycle capacity
for i, cycle in enumerate(solution.cycles):
    Q_end = cycle["Discharge capacity [A.h]"].entries[-1]
    print(f"Cycle {i+1}: {Q_end:.3f} A.h")

# Capacity fade plot
capacities = [
    cycle["Discharge capacity [A.h]"].entries[-1]
    for cycle in solution.cycles
]
plt.plot(range(1, len(capacities) + 1), capacities)
plt.xlabel("Cycle number")
plt.ylabel("Discharge capacity [A.h]")
plt.show()
```

## Saving and Loading Results

```python
import pickle

# Save
with open("result.pkl", "wb") as f:
    pickle.dump(solution, f)

# Load and use without re-solving
with open("result.pkl", "rb") as f:
    solution = pickle.load(f)

V = solution["Voltage [V]"].entries
```

## Summary Statistics

```python
solution = sim.solution
V = solution["Voltage [V]"].entries
Q = solution["Discharge capacity [A.h]"].entries

print(f"Capacity:           {Q[-1]:.3f} A.h")
print(f"Minimum voltage:    {V.min():.3f} V")
print(f"Energy delivered:   {solution['Energy [W.h]'].entries[-1]:.3f} W.h")
print(f"Solver wall time:   {solution.solve_time:.3f} s")
```

## Interpreting Results

- **Voltage drop at start of discharge**: ohmic resistance (`R0`)
- **Curved voltage profile**: intercalation thermodynamics (OCV curve shape)
- **Sharp voltage drop near end**: lithium depletion in one electrode
- **Temperature rise**: Joule heating — significant at high C-rates
- **NaN or unrealistic values**: usually a unit error in a parameter or a solver divergence — check parameter values and tighten tolerances
