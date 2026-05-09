# PyBaMM Advanced Models Reference

## Lead-Acid Models

PyBaMM includes full lead-acid battery models:

```python
import pybamm

# Full order lead-acid model
model = pybamm.lead_acid.Full()

# Simplified lead-acid model (like SPM for li-ion)
model = pybamm.lead_acid.LOQS()

param = pybamm.ParameterValues("Sulzer2019")
sim = pybamm.Simulation(model, parameter_values=param)
sim.solve([0, 3600])
```

---

## Equivalent Circuit Models (ECM)

ECMs represent the battery as a resistor-capacitor network — much faster than physics-based models, useful for state estimation and real-time applications:

```python
model = pybamm.equivalent_circuit.Thevenin()

# ECMs use different parameter sets
param = pybamm.ParameterValues({
    "Cell capacity [A.h]": 3.0,
    "Nominal cell capacity [A.h]": 3.0,
    "Current function [A]": 1.0,
    "Initial SoC": 1.0,
    "R0 [Ohm]": 0.01,
    "R1 [Ohm]": 0.005,
    "C1 [F]": 1000,
    "Open-circuit voltage [V]": pybamm.linear(2.5, 4.2),  # or a lookup table
    "Cell thermal mass [J/K]": 1000,
    "Cell cooling coefficient [W/K]": 10,
    "Ambient temperature [K]": 298.15,
    "Initial temperature [K]": 298.15,
})

sim = pybamm.Simulation(model, parameter_values=param)
sim.solve([0, 3600])
```

---

## Electrochemical Impedance Spectroscopy (EIS)

`pybamm.EISSimulation` solves for the complex impedance spectrum at a given state of charge:

```python
import pybamm
import numpy as np

model = pybamm.lithium_ion.DFN()
param = pybamm.ParameterValues("Chen2020")

eis_sim = pybamm.EISSimulation(model, parameter_values=param)

# Frequency range in Hz
frequencies = np.logspace(-4, 4, 100)
impedance = eis_sim.solve(frequencies)

# impedance is a complex numpy array: Z = Z_real + j*Z_imag
Z_real = impedance.real
Z_imag = impedance.imag

# Nyquist plot
import matplotlib.pyplot as plt
plt.plot(Z_real, -Z_imag)
plt.xlabel("Z' [Ohm]")
plt.ylabel("-Z'' [Ohm]")
plt.show()
```

`EISSimulation` linearizes the model around the operating point. The state of charge at which impedance is evaluated is set via the initial conditions in `ParameterValues`.

---

## Submodel Options

PyBaMM models are composed of swappable submodels. Pass an `options` dictionary to customize physics:

```python
# Enable thermal effects
model = pybamm.lithium_ion.DFN(options={"thermal": "lumped"})

# Include SEI growth (degradation)
model = pybamm.lithium_ion.DFN(options={
    "SEI": "ec reaction limited",
    "SEI porosity change": "true",
})

# Include lithium plating
model = pybamm.lithium_ion.DFN(options={
    "lithium plating": "irreversible",
    "lithium plating porosity change": "true",
})

# Particle size distribution (many-particle model)
model = pybamm.lithium_ion.DFN(options={"particle size": "distribution"})
```

Check available options with:

```python
model = pybamm.lithium_ion.DFN()
print(model.default_options)
```

Common option keys: `"thermal"`, `"SEI"`, `"lithium plating"`, `"particle"`, `"loss of active material"`.

---

## Manual Geometry and Discretisation

`pybamm.Simulation` handles geometry and discretisation automatically. When you need full control (custom meshes, non-standard spatial methods), set it up manually:

```python
import pybamm

model = pybamm.lithium_ion.SPM()
param = pybamm.ParameterValues("Chen2020")

# Geometry
geometry = model.default_geometry
param.process_geometry(geometry)

# Mesh
submesh_types = model.default_submesh_types
var_pts = {
    pybamm.standard_spatial_vars.x_n: 5,   # negative electrode points
    pybamm.standard_spatial_vars.x_s: 5,   # separator points
    pybamm.standard_spatial_vars.x_p: 5,   # positive electrode points
    pybamm.standard_spatial_vars.r_n: 5,   # negative particle radial points
    pybamm.standard_spatial_vars.r_p: 5,   # positive particle radial points
}
mesh = pybamm.Mesh(geometry, submesh_types, var_pts)

# Discretisation
spatial_methods = model.default_spatial_methods
disc = pybamm.Discretisation(mesh, spatial_methods)
disc.process_model(model)

# Solve
solver = pybamm.IDAKLUSolver()
t_eval = [0, 3600]
solution = solver.solve(model, t_eval)
```

More mesh points increase accuracy but raise computation time. `var_pts` defaults are set per model (usually 10–20 points per domain).

---

## Building Custom Models from Submodels

PyBaMM's architecture lets you compose models from individual submodels:

```python
import pybamm

# Start with an empty lithium-ion model
model = pybamm.lithium_ion.BaseModel()

# Attach specific submodel classes
model.submodels["external circuit"] = pybamm.external_circuit.ExplicitCurrentControl(model.param, model.options)
model.submodels["negative electrode sei"] = pybamm.sei.NoSEI(model.param, "negative", model.options)
# ... add all required submodels

model.build_model()
```

This is an advanced workflow — consult the [PyBaMM submodels API reference](https://docs.pybamm.org/en/stable/source/api/models/submodels/index.html) and look at the source of `DFN()` to see which submodels it wires together.

---

## Saving and Loading Solutions

```python
import pickle

# Save
with open("solution.pkl", "wb") as f:
    pickle.dump(sim.solution, f)

# Load
with open("solution.pkl", "rb") as f:
    solution = pickle.load(f)

V = solution["Voltage [V]"].entries
```

PyBaMM solutions are plain Python objects and are pickle-compatible.

---

## Parallelising Parameter Sweeps with IDAKLUSolver

`IDAKLUSolver` supports multi-threaded batch solving via OpenMP:

```python
import pybamm
import numpy as np

model = pybamm.lithium_ion.SPM()
param = pybamm.ParameterValues("Chen2020")

c_rates = [0.5, 1.0, 2.0, 5.0]
solutions = []

solver = pybamm.IDAKLUSolver()

for c_rate in c_rates:
    param.update({"Current function [A]": c_rate * param["Nominal cell capacity [A.h]"]})
    sim = pybamm.Simulation(model, parameter_values=param, solver=solver)
    sim.solve([0, 3600 / c_rate])
    solutions.append(sim.solution)

pybamm.QuickPlot(solutions, ["Voltage [V]"],
                 labels=[f"{c}C" for c in c_rates]).dynamic_plot()
```

For large sweeps, consider `multiprocessing` to parallelize at the Python level, or use PyBaMM's `BaseBatteryModel.rhs_algebraic` interface directly with `IDAKLUSolver.solve()` to batch calls.
