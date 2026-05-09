---
name: simulate
description: "Step-by-step workflow for setting up and running a PyBaMM battery simulation from scratch"
metadata:
  revision: 1
  updated-on: "2026-05-09"
  source: community
  tags: "pybamm,battery,simulation,electrochemistry,python"
---

# PyBaMM: Running a Battery Simulation

Use this workflow to go from zero to a solved simulation. Each step is a decision point — read the notes to pick the right option.

## Step 1 — Choose a Model

Pick based on your accuracy vs speed requirement:

```python
import pybamm

model = pybamm.lithium_ion.DFN()   # highest accuracy, ~270 ms solve
model = pybamm.lithium_ion.SPMe()  # balanced, ~39 ms solve
model = pybamm.lithium_ion.SPM()   # fastest, ~21 ms solve — use for sweeps
```

**Rule of thumb:** start with `SPM()` while building the simulation, switch to `DFN()` when you need physics-accurate results.

## Step 2 — Load Parameter Values

Always use a built-in set that matches your cell chemistry:

```python
param = pybamm.ParameterValues("Chen2020")    # graphite/LFP 21700 — most common default
param = pybamm.ParameterValues("Marquis2019") # graphite/LiCoO2
param = pybamm.ParameterValues("OKane2022")   # Chen2020 + degradation parameters
```

Override specific parameters after loading:

```python
param.update({
    "Negative electrode thickness [m]": 75e-6,  # always SI units
    "Current function [A]": 2.5,
})
```

If unsure what parameters exist: `param.search("keyword")`.

## Step 3 — Define the Protocol

### Simple constant-current discharge

Pass a `[t_start, t_end]` time span in seconds directly to `.solve()`:

```python
sim = pybamm.Simulation(model, parameter_values=param)
sim.solve([0, 3600])  # 1-hour discharge
```

### Multi-step experiment (CC/CV cycling)

Use `pybamm.Experiment` for discharge/charge/rest sequences:

```python
experiment = pybamm.Experiment([
    "Discharge at 1C for 1 hour or until 2.5 V",
    "Rest for 10 minutes",
    "Charge at 0.5C until 4.2 V",
    "Hold at 4.2 V until C/20",
    "Rest for 30 minutes",
])

sim = pybamm.Simulation(model, parameter_values=param, experiment=experiment)
sim.solve()  # no time span — experiment defines it
```

Experiment string grammar: `"<action> at <rate> [for <time>] [or until <condition>]"`

Valid actions: `Discharge`, `Charge`, `Hold`, `Rest`
Valid rates: `1C`, `0.5A`, `4.2V` (context-dependent)
Valid conditions: `2.5 V`, `4.2 V`, `C/20`, `1 hour`

## Step 4 — Select a Solver (Optional)

The default solver is `IDAKLUSolver`. Set it explicitly only when tuning:

```python
solver = pybamm.IDAKLUSolver(rtol=1e-6, atol=1e-6)  # tighter tolerances
sim = pybamm.Simulation(model, parameter_values=param, solver=solver)
```

Use `CasadiSolver` only if you have a specific reason (e.g., legacy code or certain physics configurations that perform better with it).

## Step 5 — Solve

```python
sim.solve([0, 3600])        # time-span solve
# or
sim.solve()                 # experiment-driven solve (requires experiment=)
```

To control output resolution:

```python
import numpy as np
t_eval = np.linspace(0, 3600, 200)
sim.solve(t_eval=t_eval)
```

## Step 6 — Verify the Result

Always sanity-check before processing data:

```python
solution = sim.solution

t = solution["Time [s]"].entries
V = solution["Voltage [V]"].entries

print(f"Solve time: {solution.solve_time:.3f} s")
print(f"Voltage range: {V.min():.3f} – {V.max():.3f} V")

sim.plot()  # visual check
```

Expected voltage range for a lithium-ion cell: roughly 2.5–4.2 V. Values outside this range or NaN usually indicate a unit error in a parameter.

## Complete Example

```python
import pybamm
import numpy as np

# Model and parameters
model = pybamm.lithium_ion.DFN()
param = pybamm.ParameterValues("Chen2020")

# Multi-step experiment: 1C discharge then CC-CV charge
experiment = pybamm.Experiment([
    "Discharge at 1C until 2.5 V",
    "Rest for 5 minutes",
    "Charge at 1C until 4.2 V",
    "Hold at 4.2 V until C/50",
])

# Simulation
sim = pybamm.Simulation(
    model,
    parameter_values=param,
    experiment=experiment,
    solver=pybamm.IDAKLUSolver(),
)
sim.solve()

# Results
solution = sim.solution
print(f"Discharge capacity: {solution['Discharge capacity [A.h]'].entries[-1]:.3f} A.h")
sim.plot(["Voltage [V]", "Current [A]"])
```

## Common Errors

| Error | Likely cause |
|-------|-------------|
| `KeyError: 'Voltage [V]'` | Typo in variable name — units are mandatory |
| `NaN` in voltage | Parameter unit mismatch (e.g., µm instead of m) |
| `solution` is `None` | `.solve()` not called yet |
| Experiment solve + time span | Passed time span to `.solve()` when `experiment=` is set — remove the time span |
| `SolverError` / divergence | Tolerances too loose or parameter set incompatible with model |
