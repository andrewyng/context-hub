---
name: contracts
description: "JACTUS — JAX-powered ACTUS financial contract library: 18 contract types, array-mode portfolio API, autodiff risk analytics, CLI, and behavioral observers"
metadata:
  languages: "python"
  versions: "0.2.0"
  revision: 1
  updated-on: "2026-03-14"
  source: community
  tags: "jactus,actus,finance,financial-contracts,jax,autodiff,risk,derivatives,fixed-income,portfolio,cli"
---

# JACTUS — ACTUS Financial Contracts with JAX (v0.2.0)

## Golden Rule

**Install from PyPI:**

```bash
pip install jactus
```

**Core import pattern:**
```python
from jactus.contracts import create_contract
from jactus.core import ContractAttributes, ContractType, ContractRole, ActusDateTime
from jactus.observers import ConstantRiskFactorObserver
```

**Critical field names — these are the most common agent mistakes:**

| Wrong | Correct (v0.2.0) |
|---|---|
| `cycle_of_interest_payment` | `interest_payment_cycle` |
| `event.time` | `event.event_time` |
| `event.type.name` | `event.event_type.name` |
| `ConstantRiskFactorObserver()` | `ConstantRiskFactorObserver(constant_value=0.0)` |

**DO NOT:**
- Use `datetime.datetime` for dates — JACTUS uses `ActusDateTime`
- Import from `actus` or `pyactus` — unrelated packages

**Requires:** Python 3.10–3.12, JAX >= 0.4.20

---

## Installation

```bash
# Standard (CPU)
pip install jactus

# GPU — NVIDIA CUDA 13 (recommended)
pip install jactus "jax[cuda13]"

# GPU — NVIDIA CUDA 12
pip install jactus "jax[cuda12]"

# TPU
pip install jactus "jax[tpu]"

# Development
git clone https://github.com/pedronahum/JACTUS.git
cd JACTUS
pip install -e ".[dev,docs,viz]"
```

**Float64 precision** (CPU/GPU only — TPUs do not support float64):
```python
import jax
jax.config.update("jax_enable_x64", True)
import jactus  # import AFTER enabling
```

---

## Quick Start

```python
from jactus.contracts import create_contract
from jactus.core import ContractAttributes, ContractType, ContractRole, ActusDateTime
from jactus.observers import ConstantRiskFactorObserver

attrs = ContractAttributes(
    contract_id="LOAN-001",
    contract_type=ContractType.PAM,
    contract_role=ContractRole.RPA,           # RPA = lender
    status_date=ActusDateTime(2024, 1, 1),
    initial_exchange_date=ActusDateTime(2024, 1, 15),
    maturity_date=ActusDateTime(2025, 1, 15),
    notional_principal=100_000.0,
    nominal_interest_rate=0.05,
    interest_payment_cycle="6M",              # NOT cycle_of_interest_payment
    day_count_convention="30E360",
)

observer = ConstantRiskFactorObserver(constant_value=0.0)  # constant_value required
contract = create_contract(attrs, observer)
result = contract.simulate()

for event in result.events:
    if event.payoff != 0:
        print(f"{event.event_time}: {event.event_type.name:4s}  ${event.payoff:>12,.2f}")
        #       ^^^^^^^^^^^^^^        ^^^^^^^^^^^^^^^^^
        # NOT event.time            NOT event.type.name

# 2024-01-15: IED   $-100,000.00
# 2024-07-15: IP       $2,500.00
# 2025-01-15: MD    $102,500.00
```

---

## Contract Types (18 total)

**Principal:** `PAM`, `LAM`, `LAX`, `NAM`, `ANN`, `CLM`
**Non-Principal:** `UMP`, `CSH`, `STK`, `COM`
**Derivatives:** `FXOUT`, `OPTNS`, `FUTUR`, `SWPPV`, `SWAPS`, `CAPFL`, `CEG`, `CEC`

See `references/contract-types.md` for full per-contract parameter examples.

---

## SimulationResult

```python
result = contract.simulate()

result.events                  # List[ContractEvent]
event.event_time               # ActusDateTime
event.event_type               # EventType enum
event.event_type.name          # str: "IED", "IP", "PR", "MD", "FP", "STD", ...
event.payoff                   # float — positive = cash received
event.nominal_value            # float — outstanding notional
event.nominal_rate             # float — applicable interest rate
```

---

## Risk Factor Observers

### Built-in observers

```python
from jactus.observers import (
    ConstantRiskFactorObserver,      # fixed value for all queries
    DictRiskFactorObserver,          # per-identifier static values
    TimeSeriesRiskFactorObserver,    # time-varying data, step or linear interp
    CurveRiskFactorObserver,         # yield/rate curve keyed by tenor
    CompositeRiskFactorObserver,     # priority-based fallback across observers
    CallbackRiskFactorObserver,      # delegates to a user callable
    JaxRiskFactorObserver,           # differentiable JAX-native observer for autodiff
)
```

```python
# Constant — always pass constant_value explicitly
observer = ConstantRiskFactorObserver(constant_value=0.05)

# Dict — different rate per risk factor ID
observer = DictRiskFactorObserver({"USD_SOFR": 0.053, "EUR_EURIBOR": 0.038})

# Time-series — interpolated from historical data
observer = TimeSeriesRiskFactorObserver(
    risk_factors={"USD_SOFR": [
        (ActusDateTime(2024, 1, 1), 0.05),
        (ActusDateTime(2024, 6, 1), 0.052),
    ]},
    interpolation="linear",   # or "step"
)
```

### Behavioral observers

```python
from jactus.observers import (
    PrepaymentSurfaceObserver,       # 2D surface: spread x loan_age -> prepay rate
    DepositTransactionObserver,      # deposit behavior for UMP contracts
)
```

### Scenario management

Bundle market + behavioral observers into a named, reproducible configuration:

```python
from jactus.observers import Scenario

scenario = Scenario(
    scenario_id="base_case",
    market_observers={"rates": DictRiskFactorObserver({"USD_SOFR": 0.053})},
    behavior_observers={"prepay": PrepaymentSurfaceObserver(...)},
)
observer = scenario.get_observer()
contract = create_contract(attrs, observer)
```

See `references/risk-factors.md` for custom observer implementation.

---

## Array-Mode Portfolio API (GPU/TPU)

Batch simulation of large portfolios via JIT-compiled kernels over `[B, T]` arrays.
12 contract types are supported in array mode.

```python
# See references/array-mode.md for full usage
# Quick shape reference: inputs are [batch, time_steps], outputs are [batch, time_steps]
```

See `references/array-mode.md` for the full portfolio API, `vmap` patterns, and GPU benchmark notebook.

---

## JAX Autodiff for Risk Analytics

```python
import jax
import jax.numpy as jnp
from jactus.contracts import create_contract
from jactus.core import ContractAttributes, ContractType, ContractRole, ActusDateTime
from jactus.observers import JaxRiskFactorObserver

def contract_pv(rate: float) -> float:
    attrs = ContractAttributes(
        contract_id="LOAN",
        contract_type=ContractType.PAM,
        contract_role=ContractRole.RPA,
        status_date=ActusDateTime(2024, 1, 1),
        initial_exchange_date=ActusDateTime(2024, 1, 15),
        maturity_date=ActusDateTime(2025, 1, 15),
        notional_principal=100_000.0,
        nominal_interest_rate=rate,
        interest_payment_cycle="6M",
        day_count_convention="30E360",
    )
    observer = JaxRiskFactorObserver(jnp.array([rate]))  # takes jnp.ndarray
    result = create_contract(attrs, observer).simulate()
    return sum(e.payoff for e in result.events)

dv01 = jax.grad(contract_pv)(0.05) * 0.0001
print(f"DV01: ${dv01:,.2f}")
```

---

## CLI

JACTUS ships a full `jactus` CLI (auto-installed with pip). Outputs JSON when piped, rich tables in TTY.

```bash
# Explore
jactus contract list
jactus contract schema --type PAM
jactus observer list

# Simulate
jactus simulate --type PAM --attrs '{
  "contract_id": "LOAN-001",
  "status_date": "2024-01-01",
  "contract_role": "RPA",
  "initial_exchange_date": "2024-01-15",
  "maturity_date": "2025-01-15",
  "notional_principal": 100000,
  "nominal_interest_rate": 0.05,
  "interest_payment_cycle": "6M",
  "day_count_convention": "30E360"
}'

# Validate before simulating
jactus contract validate --type PAM --attrs loan.json

# Risk metrics
jactus risk dv01 --type PAM --attrs loan.json
jactus risk sensitivities --type PAM --attrs loan.json

# Portfolio
jactus portfolio simulate --file portfolio.json
jactus portfolio aggregate --file portfolio.json --frequency quarterly

# JSON / CSV pipelines
jactus simulate --type PAM --attrs loan.json --output json | jq '.summary'
jactus simulate --type PAM --attrs loan.json --output csv --nonzero
```

---

## MCP Server (Claude Code / AI assistants)

```bash
pip install git+https://github.com/pedronahum/JACTUS.git#subdirectory=tools/mcp-server
```

Claude Desktop (`~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "jactus": {
      "command": "python",
      "args": ["-m", "jactus_mcp"]
    }
  }
}
```

For Claude Code, `.mcp.json` in the project root enables auto-discovery when opening the JACTUS workspace.

---

## Common Mistakes

1. **Wrong field name for interest cycle** — `interest_payment_cycle="6M"`, not `cycle_of_interest_payment`.

2. **Wrong event attribute names** — `event.event_time` and `event.event_type.name`, not `event.time` / `event.type.name`.

3. **ConstantRiskFactorObserver requires `constant_value`** — `ConstantRiskFactorObserver(constant_value=0.0)`, not `ConstantRiskFactorObserver()`.

4. **Using Python `datetime`** — always use `ActusDateTime(year, month, day)`.

5. **Wrong `ContractRole` sign** — `RPA` = lender/receiver (negative IED payoff, positive IP/MD). `RPL` = borrower/payer (signs flipped). Always set explicitly.

6. **`status_date` is required** — set it to a date on or before `initial_exchange_date`.

7. **TPU + float64** — TPUs do not support float64. Use float32 (default) on TPU, or enable `jax_enable_x64` before importing JACTUS on CPU/GPU only.

---

## Documentation

- Full API docs: https://pedronahum.github.io/JACTUS/
- Notebooks: `examples/notebooks/` (also on Colab — see GitHub README)

## Reference Files

- `references/contract-types.md` — parameter examples for all 18 contract types
- `references/risk-factors.md` — observer types and custom observer implementation
- `references/array-mode.md` — batch/portfolio API, GPU/TPU patterns
