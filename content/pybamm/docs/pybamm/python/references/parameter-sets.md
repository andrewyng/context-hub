# PyBaMM Parameter Sets Reference

## Built-in Parameter Sets

PyBaMM ships with curated parameter sets for real lithium-ion cells. Load any by passing its name to `pybamm.ParameterValues`:

```python
param = pybamm.ParameterValues("Chen2020")
```

### Commonly Used Sets

| Name | Chemistry | Cell type | Notes |
|------|-----------|-----------|-------|
| `"Chen2020"` | Graphite/NMC811 | 21700 cylindrical | LG M50 cell; most widely used default; validated against discharge curves |
| `"Marquis2019"` | Graphite/NMC | Pouch | Kokam SLPB78205130H; original SPMe paper parameters |
| `"OKane2022"` | Graphite/NMC811 | 21700 cylindrical | LG M50; extends Chen2020 with degradation (SEI, lithium plating) |
| `"Mohtat2020"` | Graphite/NMC532 | Pouch | SPM-focused parameter set |
| `"Ai2020"` | Graphite/LiCoO2 | Pouch | Enertech cell; thermal model parameters |
| `"Ecker2015"` | Graphite/NMC | Pouch | Kokam SLPB 75106100; frequently cited in literature |
| `"NCA_Kim2011"` | Graphite/NCA | Pouch | NCA chemistry |
| `"Prada2013"` | Graphite/LFP | 26650 cylindrical | LFP, lower voltage plateau |
| `"Ramadass2004"` | Graphite/LiCoO2 | — | Early foundational set |

### Sodium-ion

| Name | Chemistry |
|------|-----------|
| `"Borges_2024"` | Hard carbon/Prussian blue analogue |

### Lead-acid

| Name | Chemistry |
|------|-----------|
| `"Sulzer2019"` | Lead-acid |

List all available sets programmatically:

```python
import pybamm
print(pybamm.parameter_sets)
```

---

## Inspecting Parameters

### Search by keyword

```python
param = pybamm.ParameterValues("Chen2020")
param.search("diffusion")          # all diffusion-related parameters
param.search("negative electrode") # only negative electrode params
```

### Print everything

```python
param.print_parameter_info()
```

### Access a single value

```python
thickness = param["Negative electrode thickness [m]"]
print(thickness)  # e.g., 8.52e-05
```

---

## Updating Parameters

### Scalar values

```python
param.update({
    "Negative electrode thickness [m]": 75e-6,    # must be in metres
    "Positive electrode thickness [m]": 90e-6,
    "Separator thickness [m]": 25e-6,
    "Nominal cell capacity [A.h]": 5.0,
})
```

### Function parameters

Some parameters are functions of temperature or concentration. Replace them with a Python callable:

```python
def my_diffusivity(c_e, T):
    return 5.34e-10 * np.exp(-0.65 * c_e / 1000)

param.update({
    "Electrolyte diffusivity [m2.s-1]": my_diffusivity
})
```

The function signature must match what PyBaMM expects — check `param.print_parameter_info()` to see whether a parameter is a constant or a function.

---

## Creating a Custom Parameter Set

Build a parameter set from a dictionary. The simplest approach is to start from a built-in set and override what you need:

```python
param = pybamm.ParameterValues("Chen2020")

# Override specific parameters for your cell
param.update({
    "Nominal cell capacity [A.h]": 3.0,
    "Negative electrode thickness [m]": 80e-6,
    "Positive electrode thickness [m]": 100e-6,
    "Electrolyte conductivity [S.m-1]": 1.0,
})
```

To build from scratch, pass a dictionary of all required parameters to `pybamm.ParameterValues(...)`. The required keys depend on the model — run the simulation once and inspect the `KeyError` to find missing parameters.

---

## Common Parameter Names (with units)

### Geometry

- `"Negative electrode thickness [m]"`
- `"Separator thickness [m]"`
- `"Positive electrode thickness [m]"`
- `"Electrode height [m]"`
- `"Electrode width [m]"`

### Transport

- `"Electrolyte diffusivity [m2.s-1]"` (may be a function of `c_e`, `T`)
- `"Electrolyte conductivity [S.m-1]"` (may be a function)
- `"Negative electrode diffusivity [m2.s-1]"` (may be a function of `c_s`, `T`)
- `"Positive electrode diffusivity [m2.s-1]"` (may be a function of `c_s`, `T`)

### Kinetics

- `"Negative electrode exchange-current density [A.m-2]"` (function of `c_e`, `c_s`, `c_s_max`, `T`)
- `"Positive electrode exchange-current density [A.m-2]"` (function of `c_e`, `c_s`, `c_s_max`, `T`)

### Thermal

- `"Cell cooling surface area [m2]"`
- `"Cell volume [m3]"`
- `"Negative electrode specific heat capacity [J.kg-1.K-1]"`
- `"Ambient temperature [K]"` — default 298.15 K (25°C)

### Operating conditions

- `"Current function [A]"` — constant current value; or pass a function `f(t)` for time-varying current
- `"Nominal cell capacity [A.h]"` — used to interpret C-rate strings in Experiment

---

## Unit Conventions

PyBaMM uses SI units throughout. Parameter names always encode the unit in square brackets. Mistakes:

```python
# Wrong — micrometres instead of metres
param.update({"Negative electrode thickness [m]": 75})

# Correct
param.update({"Negative electrode thickness [m]": 75e-6})
```

Temperature parameters expect Kelvin, not Celsius. `298.15 K` = `25°C`.
