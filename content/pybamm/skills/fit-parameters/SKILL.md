---
name: fit-parameters
description: "Workflow for fitting PyBaMM model parameters to experimental battery data using optimisation"
metadata:
  revision: 1
  updated-on: "2026-05-09"
  source: community
  tags: "pybamm,battery,parameter-fitting,optimisation,inverse-problem,python"
---

# PyBaMM: Fitting Model Parameters to Experimental Data

Parameter fitting (also called parameter identification or inverse modelling) finds parameter values that minimise the difference between simulated and measured data. This skill covers the standard approach using `scipy.optimize` with PyBaMM simulations.

## Overview

The core loop:

1. Load experimental data (time, voltage, current)
2. Choose which parameters to fit and set initial guesses
3. Define a cost function: run a simulation, compute RMSE vs data
4. Call an optimiser (`scipy.optimize.minimize` or `differential_evolution`)
5. Verify the fit and check for physical plausibility

## Step 1 — Prepare Experimental Data

Load your measured discharge data:

```python
import numpy as np

# Measured data: time in seconds, voltage in volts
# Replace with your actual data source
t_exp = np.array([0, 360, 720, 1080, 1440, 1800, 2160, 2520, 2880, 3240, 3600])
V_exp = np.array([4.18, 4.05, 3.95, 3.87, 3.80, 3.74, 3.68, 3.60, 3.48, 3.30, 2.80])
I_exp = 1.5  # constant discharge current in A
```

## Step 2 — Set Up the Baseline Simulation

Start from a built-in parameter set and decide which parameters to fit:

```python
import pybamm

model = pybamm.lithium_ion.SPM()  # SPM is faster — good for optimisation loops
param = pybamm.ParameterValues("Chen2020")

# Parameters to fit and their initial guesses
initial_guess = {
    "Negative electrode diffusivity [m2.s-1]": 3.3e-14,
    "Positive electrode diffusivity [m2.s-1]": 4.0e-15,
}
```

Use `SPM()` or `SPMe()` during fitting — `DFN()` is slower and the optimiser will call the simulation hundreds of times. Switch to `DFN()` only for a final validation run.

## Step 3 — Define the Cost Function

```python
def simulate_voltage(params_dict, t_eval):
    """Run a simulation and return interpolated voltage at t_eval."""
    local_param = param.copy()
    local_param.update(params_dict)
    local_param.update({"Current function [A]": I_exp})

    sim = pybamm.Simulation(
        model,
        parameter_values=local_param,
        solver=pybamm.IDAKLUSolver(rtol=1e-4, atol=1e-6),
    )
    try:
        sim.solve([t_eval[0], t_eval[-1]])
        V_sim = sim.solution["Voltage [V]"](t=t_eval)
        return V_sim
    except pybamm.SolverError:
        return np.full_like(t_eval, np.nan, dtype=float)


def cost(x):
    """RMSE cost function for scipy.optimize."""
    params_dict = {
        "Negative electrode diffusivity [m2.s-1]": x[0],
        "Positive electrode diffusivity [m2.s-1]": x[1],
    }
    V_sim = simulate_voltage(params_dict, t_exp)

    if np.any(np.isnan(V_sim)):
        return 1e6  # penalise failed solves heavily

    rmse = np.sqrt(np.mean((V_sim - V_exp) ** 2))
    return rmse
```

## Step 4 — Run the Optimiser

### Gradient-free local optimiser (Nelder-Mead)

Good starting point when the cost landscape is smooth:

```python
from scipy.optimize import minimize

x0 = [initial_guess["Negative electrode diffusivity [m2.s-1]"],
      initial_guess["Positive electrode diffusivity [m2.s-1]"]]

result = minimize(cost, x0, method="Nelder-Mead",
                  options={"xatol": 1e-12, "fatol": 1e-6, "maxiter": 500})

print(f"RMSE: {result.fun:.4f} V")
print(f"D_n = {result.x[0]:.3e}")
print(f"D_p = {result.x[1]:.3e}")
```

### Global optimiser (differential evolution)

Use when the cost surface has multiple local minima — more robust but slower:

```python
from scipy.optimize import differential_evolution

bounds = [
    (1e-15, 1e-12),   # D_n range
    (1e-16, 1e-13),   # D_p range
]

result = differential_evolution(cost, bounds, seed=42, maxiter=200,
                                tol=1e-6, workers=1, disp=True)

print(f"RMSE: {result.fun:.4f} V")
print(f"D_n = {result.x[0]:.3e}, D_p = {result.x[1]:.3e}")
```

## Step 5 — Validate the Fit

Plot the best-fit simulation against experimental data:

```python
import matplotlib.pyplot as plt

best_params = {
    "Negative electrode diffusivity [m2.s-1]": result.x[0],
    "Positive electrode diffusivity [m2.s-1]": result.x[1],
}

# Validate with DFN for higher accuracy
model_val = pybamm.lithium_ion.DFN()
param_val = param.copy()
param_val.update(best_params)
param_val.update({"Current function [A]": I_exp})

sim_val = pybamm.Simulation(model_val, parameter_values=param_val)
sim_val.solve([t_exp[0], t_exp[-1]])
sol = sim_val.solution

t_sim = sol["Time [s]"].entries
V_sim = sol["Voltage [V]"].entries

plt.figure(figsize=(8, 4))
plt.plot(t_exp, V_exp, "ko", label="Experiment", markersize=5)
plt.plot(t_sim, V_sim, "r-", label="Fit (DFN)")
plt.xlabel("Time [s]")
plt.ylabel("Voltage [V]")
plt.legend()
plt.title(f"Parameter fit — RMSE = {result.fun*1000:.1f} mV")
plt.tight_layout()
plt.show()
```

## Fit Quality Guidelines

| RMSE | Interpretation |
|------|---------------|
| < 5 mV | Excellent fit |
| 5–20 mV | Good — acceptable for most use cases |
| 20–50 mV | Marginal — consider fitting more parameters or using a higher-fidelity model |
| > 50 mV | Poor — check data quality, parameter bounds, and model choice |

## Common Pitfalls

### Parameters at bounds

If the optimiser converges to a value at the edge of a bound, the true optimum is likely outside your bound. Widen the bound and re-run.

### Local minima

Nelder-Mead is sensitive to the initial guess. If RMSE is high, try `differential_evolution` or run Nelder-Mead from multiple starting points:

```python
from itertools import product

candidates = list(product([1e-14, 5e-14], [1e-15, 5e-15]))
best = min((minimize(cost, list(x0), method="Nelder-Mead") for x0 in candidates),
           key=lambda r: r.fun)
```

### Physically implausible values

Always check that fitted values are physically reasonable:

- Solid diffusivities: `1e-16` to `1e-12` m² s⁻¹
- Electrolyte diffusivity: `1e-11` to `1e-9` m² s⁻¹
- Exchange current density: `0.1` to `10` A m⁻²

### Unit errors in parameters

The optimiser works in whatever units you specify. If the cost function passes a value in µm² s⁻¹ when PyBaMM expects m² s⁻¹, the simulation will fail silently. Keep all values in SI units throughout.

### Overfitting

Fitting many parameters to a single discharge curve leads to non-unique solutions. Prefer fitting to multiple datasets (different C-rates, temperatures) simultaneously by summing their costs.

## Multi-Dataset Fitting

```python
datasets = [
    {"I": 1.0, "t": t_1C, "V": V_1C},
    {"I": 2.0, "t": t_2C, "V": V_2C},
    {"I": 0.5, "t": t_half_C, "V": V_half_C},
]

def cost_multi(x):
    total = 0.0
    for ds in datasets:
        p = {
            "Negative electrode diffusivity [m2.s-1]": x[0],
            "Positive electrode diffusivity [m2.s-1]": x[1],
            "Current function [A]": ds["I"],
        }
        V_sim = simulate_voltage(p, ds["t"])
        if np.any(np.isnan(V_sim)):
            return 1e6
        total += np.mean((V_sim - ds["V"]) ** 2)
    return np.sqrt(total / len(datasets))
```
