---
name: pybamm
description: "PyBaMM battery simulation framework: models (DFN/SPM/SPMe), ParameterValues, Simulation, Solution, and solver selection"
metadata:
  languages: "python"
  versions: "26.4.2"
  revision: 1
  updated-on: "2026-05-09"
  source: community
  tags: "pybamm,battery,simulation,electrochemistry,python,scientific-computing"
---

# PyBaMM Python Package Guide

## Golden Rule

**Use `pybamm.Simulation()` as your entry point: choose a model (DFN for accuracy, SPM for speed), apply a built-in `ParameterValues` set, call `.solve()`, then extract results from the returned `Solution`.**

PyBaMM (Python Battery Mathematical Modelling) is the leading open-source framework for physics-based battery simulation. It provides pre-built electrochemical models (DFN, SPMe, SPM), curated parameter sets for real cells, flexible experiment protocols, and fast solvers built on Sundials.

## Installation

```bash
pip install pybamm==26.4.2
```

Verify:

```python
import pybamm
print(pybamm.__version__)  # 26.4.2
```

## Core Workflow (Quick Start)

The full pattern from model to results in one block:

```python
import pybamm

# 1. Choose a model
model = pybamm.lithium_ion.DFN()

# 2. Load a built-in parameter set
param = pybamm.ParameterValues("Chen2020")

# 3. Create and solve the simulation
sim = pybamm.Simulation(model, parameter_values=param)
sim.solve([0, 3600])  # time span in seconds

# 4. Extract results from the Solution
solution = sim.solution
t = solution["Time [s]"].entries
V = solution["Voltage [V]"].entries
I = solution["Current [A]"].entries

print(f"Final voltage: {V[-1]:.3f} V")

# 5. Quick interactive plot
sim.plot()
```

## Choosing a Model

All three models are in `pybamm.lithium_ion`:

| Model | Class | Accuracy | Speed | Use when |
|-------|-------|----------|-------|----------|
| DFN (Doyle-Fuller-Newman) | `DFN()` | Highest | ~270 ms | Full physics, degradation studies |
| SPMe (Single Particle + Electrolyte) | `SPMe()` | Medium | ~39 ms | Balanced accuracy/speed |
| SPM (Single Particle) | `SPM()` | Lowest | ~21 ms | Rapid prototyping, parameter sweeps |

```python
model_dfn  = pybamm.lithium_ion.DFN()
model_spme = pybamm.lithium_ion.SPMe()
model_spm  = pybamm.lithium_ion.SPM()
```

All three share the same `Simulation` interface, so you can swap models by changing one line.

## ParameterValues

### Using built-in sets

PyBaMM ships with curated parameter sets for real cells. Pass the set name as a string:

```python
param = pybamm.ParameterValues("Chen2020")      # graphite/LFP 21700, most commonly used
param = pybamm.ParameterValues("Marquis2019")   # graphite/LiCoO2 (default in many examples)
param = pybamm.ParameterValues("OKane2022")     # includes degradation parameters
```

See the [parameter-sets reference](references/parameter-sets.md) for a full list.

### Searching parameters

```python
param.search("diffusion")          # print all params whose name contains "diffusion"
param.search("negative electrode") # narrow by electrode
```

### Updating individual values

```python
param.update({
    "Negative electrode thickness [m]": 75e-6,
    "Positive electrode thickness [m]": 90e-6,
    "Current function [A]": 1.5,
})
```

Units must match exactly. PyBaMM uses SI units internally and parameter names encode the unit in square brackets — always check the unit in the parameter name before assigning a value.

### Printing all parameters

```python
param.print_parameter_info()  # shows every parameter with its value and units
```

## Running Simulations

### Simple time-span solve

Pass a two-element list `[t_start, t_end]` in seconds. PyBaMM chooses internal time steps automatically:

```python
sim = pybamm.Simulation(model, parameter_values=param)
sim.solve([0, 3600])  # 1-hour discharge
```

### Experiment protocols

Use `pybamm.Experiment` for multi-step protocols (CC discharge, CV charge, rests):

```python
experiment = pybamm.Experiment([
    "Discharge at 1C for 1 hour or until 2.5 V",
    "Rest for 10 minutes",
    "Charge at 0.5C until 4.2 V",
    "Hold at 4.2 V until C/20",
])

sim = pybamm.Simulation(model, parameter_values=param, experiment=experiment)
sim.solve()
```

Experiment strings follow the pattern `"<action> at <rate> [for <time>] [or until <condition>]"`.

### Controlling output times

Use `t_eval` to specify exactly which time points to record:

```python
import numpy as np

t_eval = np.linspace(0, 3600, 500)
sim.solve(t_eval=t_eval)
```

### Accessing the C-rate

"1C" means full discharge in 1 hour. PyBaMM interprets C-rate strings from the parameter set's nominal capacity. To set the current directly:

```python
param.update({"Current function [A]": 5.0})  # 5 A discharge
sim.solve([0, 3600])
```

## Working with Results (Solution)

### Variable access

Variables are accessed by their full name with units:

```python
solution = sim.solution

t  = solution["Time [s]"].entries          # numpy array
V  = solution["Voltage [V]"].entries
I  = solution["Current [A]"].entries
Q  = solution["Discharge capacity [A.h]"].entries
T  = solution["Cell temperature [K]"].entries
```

### Listing available variables

```python
print(solution.all_models[0].variables.keys())  # full variable list for the model
```

### Interpolating at specific times

```python
V_at_1800s = solution["Voltage [V]"](t=1800)  # interpolate at t=1800 s
```

### Comparing across runs

```python
solutions = []
for c_rate in [0.5, 1.0, 2.0]:
    param.update({"Current function [A]": c_rate * 5.0})
    sim = pybamm.Simulation(model, parameter_values=param)
    sim.solve([0, 3600 / c_rate])
    solutions.append(sim.solution)

pybamm.QuickPlot(solutions, ["Voltage [V]"]).dynamic_plot()
```

### Plotting

```python
sim.plot()                                      # default variable set
sim.plot(["Voltage [V]", "Current [A]"])        # specific variables
sim.plot(["Voltage [V]", ["Current [A]", "Discharge capacity [A.h]"]])  # shared axis
```

Pass a list of solution objects to `QuickPlot` to compare runs:

```python
pybamm.QuickPlot([sol1, sol2], ["Voltage [V]"]).dynamic_plot()
```

## Solver Selection

PyBaMM's default solver is `IDAKLUSolver`. Explicitly setting it is optional but recommended when tuning performance:

```python
# Recommended: IDAKLU (fastest, supports sensitivities, parallelizable)
solver = pybamm.IDAKLUSolver(rtol=1e-6, atol=1e-6)

# Alternative: CasADi (sometimes faster for certain physics, legacy default)
solver = pybamm.CasadiSolver(mode="safe")

# Avoid in production: ScipySolver (pure Python, slow — testing only)
solver = pybamm.ScipySolver()

sim = pybamm.Simulation(model, parameter_values=param, solver=solver)
```

The default tolerances (`rtol=1e-3`, `atol=1e-6`) are adequate for most simulations. Tighten them when comparing to experimental data or running degradation models.

## Common Pitfalls

### Unit mismatch

Parameter names encode units: `"Negative electrode thickness [m]"` expects metres, not micrometres. Passing `75` when you mean `75e-6` is the most common silent error — the simulation runs but produces nonsense results.

### Wrong parameter set for the chemistry

`"Chen2020"` is an LFP cell. Using it with a model tuned for NMC or NCA will give physically wrong results. Match the parameter set to your target chemistry.

### Accessing Solution before calling solve

```python
sim = pybamm.Simulation(model, parameter_values=param)
sol = sim.solution  # None — solve() has not been called yet
sim.solve([0, 3600])
sol = sim.solution  # correct
```

### Forgetting units in variable names

```python
solution["Voltage"]      # KeyError — must include units
solution["Voltage [V]"]  # correct
```

### Experiment strings vs time-span solve

If you pass an `experiment=` argument to `Simulation`, do not also pass a time span to `.solve()`. Pass `sim.solve()` with no arguments and let the experiment define the protocol.

```python
sim = pybamm.Simulation(model, parameter_values=param, experiment=experiment)
sim.solve()  # no time span — the experiment defines it
```

## Practical Workflow For Agents

1. `pip install pybamm` and confirm `pybamm.__version__`.
2. Start with `pybamm.lithium_ion.SPM()` for fast iteration; switch to `DFN()` when accuracy matters.
3. Pick the closest built-in parameter set for your cell chemistry (see [parameter-sets reference](references/parameter-sets.md)).
4. Override individual parameters with `param.update({...})` — always include the `[unit]` suffix in the key.
5. Use `pybamm.Experiment` for multi-step protocols; use a plain time span for simple discharges.
6. After `.solve()`, access results via `solution["Variable [unit]"].entries`.
7. Use `sim.plot()` to sanity-check results visually before processing data.

## Official Sources

- PyBaMM documentation: https://docs.pybamm.org/en/stable/
- GitHub repository: https://github.com/pybamm-team/PyBaMM
- Getting-started notebooks: https://docs.pybamm.org/en/stable/source/examples/index.html
- Parameter sets list: https://docs.pybamm.org/en/stable/source/api/parameters/parameter_sets.html
- PyPI package page: https://pypi.org/project/pybamm/
