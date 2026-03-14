# JACTUS Array-Mode & Portfolio API

Fetch with: `chub get jactus/contracts --file references/array-mode.md`

Array-mode is the recommended path for GPU/TPU workloads and large portfolios.
It uses JIT-compiled kernels over `[B, T]` (batch x time_steps) arrays.
12 contract types are currently supported in array mode.

---

## When to Use Array-Mode vs. Contract-Mode

| Situation | Use |
|---|---|
| Single contract, exploratory | `create_contract(...).simulate()` |
| Portfolio of 100+ contracts, GPU/TPU | Array-mode portfolio API |
| Autodiff through a single contract | `JaxRiskFactorObserver` + `jax.grad` |
| Autodiff across a portfolio | Array-mode + `jax.grad` / `jax.vmap` |

---

## Portfolio CLI (no Python required)

```bash
# Simulate a portfolio from JSON
jactus portfolio simulate --file portfolio.json

# Aggregate cash flows by quarter
jactus portfolio aggregate --file portfolio.json --frequency quarterly

# Output as JSON for downstream processing
jactus portfolio simulate --file portfolio.json --output json | jq '.total_payoff'
```

Portfolio JSON format:
```json
[
  {
    "contract_id": "LOAN-001",
    "contract_type": "PAM",
    "contract_role": "RPA",
    "status_date": "2024-01-01",
    "initial_exchange_date": "2024-01-15",
    "maturity_date": "2025-01-15",
    "notional_principal": 100000,
    "nominal_interest_rate": 0.05,
    "interest_payment_cycle": "6M",
    "day_count_convention": "30E360"
  }
]
```

---

## GPU/TPU Benchmark Notebook

A full benchmark notebook (50K PAM contracts on GPU/TPU) is available on Colab:

https://colab.research.google.com/github/pedronahum/JACTUS/blob/main/examples/notebooks/05_gpu_tpu_portfolio_benchmark.ipynb

---

## Precision Notes

- Array-mode uses **float32** for performance
- TPUs do **not** support float64
- For CPU/GPU with full double precision, enable before importing JACTUS:

```python
import jax
jax.config.update("jax_enable_x64", True)
import jactus
```

---

## vmap Pattern for Batching

```python
import jax
from jactus.contracts import create_contract
from jactus.core import ContractAttributes, ContractType, ContractRole, ActusDateTime
from jactus.observers import JaxRiskFactorObserver
import jax.numpy as jnp

def single_pv(rate):
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
    observer = JaxRiskFactorObserver(jnp.array([rate]))
    result = create_contract(attrs, observer).simulate()
    return jnp.sum(jnp.array([e.payoff for e in result.events]))

# Vectorize over a grid of rates
rates = jnp.linspace(0.03, 0.08, 100)
pvs = jax.vmap(single_pv)(rates)
```
