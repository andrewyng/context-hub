# JACTUS Risk Factor Observers

## What is a RiskFactorObserver?

Every contract needs a `RiskFactorObserver` — an object that provides market data
(interest rates, FX rates, equity prices) at any given `ActusDateTime`. The observer
is queried by the simulation engine when computing floating-rate resets, option payoffs,
and FX conversions.

Fetch with: `chub get jactus/contracts --file references/risk-factors.md`

---

## Built-in Observers

### `ConstantRiskFactorObserver`
Returns a flat rate for all queries. Good for unit testing and simple fixed-rate contracts.

```python
from jactus.observers import ConstantRiskFactorObserver

# constant_value is required — cannot be called with no arguments
observer = ConstantRiskFactorObserver(constant_value=0.0)

# With a specific constant rate
observer = ConstantRiskFactorObserver(constant_value=0.05)
```

Use when: contract has no floating-rate dependency, or you want deterministic cash flows.

---

## Custom Observer

Subclass `BaseRiskFactorObserver` and implement `_get_risk_factor` and `_get_event_data`:

```python
import jax.numpy as jnp
from jactus.observers import BaseRiskFactorObserver
from jactus.core import ActusDateTime, ContractState, ContractAttributes

class MyMarketObserver(BaseRiskFactorObserver):
    def __init__(self, rate_curve: dict):
        super().__init__(name="my-market")
        # rate_curve maps date strings to rates, e.g. {"2024-01-15": 0.052}
        self.rate_curve = rate_curve

    def _get_risk_factor(
        self,
        identifier: str,
        time: ActusDateTime,
        state: ContractState | None,
        attributes: ContractAttributes | None,
    ) -> jnp.ndarray:
        """Return the rate for a given risk factor at a given date."""
        key = f"{time.year}-{time.month:02d}-{time.day:02d}"
        value = self.rate_curve.get(key, 0.05)
        return jnp.array(value, dtype=jnp.float32)

    def _get_event_data(
        self,
        identifier: str,
        event_type: str,
        time: ActusDateTime,
        state: ContractState | None,
        attributes: ContractAttributes | None,
    ):
        """Return event-specific data (optional, return None if unused)."""
        return None

# Usage
from jactus.contracts import create_contract
from jactus.core import ContractAttributes, ContractType, ContractRole, ActusDateTime

rate_curve = {
    "2024-01-15": 0.050,
    "2024-07-15": 0.052,
    "2025-01-15": 0.048,
}

observer = MyMarketObserver(rate_curve)
contract = create_contract(attrs, observer)
result = contract.simulate()
```

---

## Using Observers with JAX

JACTUS provides `JaxRiskFactorObserver` for differentiable simulation.
It takes a `jnp.ndarray` of risk factor values indexed by integer:

```python
import jax
import jax.numpy as jnp
from jactus.contracts import create_contract
from jactus.core import ContractAttributes, ContractType, ContractRole, ActusDateTime
from jactus.observers import JaxRiskFactorObserver

def contract_pv(rate):
    attrs = ContractAttributes(
        contract_id="LOAN",
        contract_type=ContractType.PAM,
        contract_role=ContractRole.RPA,
        status_date=ActusDateTime(2024, 1, 1),
        initial_exchange_date=ActusDateTime(2024, 1, 15),
        maturity_date=ActusDateTime(2025, 1, 15),
        notional_principal=100_000.0,
        nominal_interest_rate=0.05,
        interest_payment_cycle="6M",
        day_count_convention="30E360",
    )
    observer = JaxRiskFactorObserver(jnp.array([rate]))
    result = create_contract(attrs, observer).simulate()
    return jnp.sum(jnp.array([e.payoff for e in result.events]))

# Compute gradient
grad_fn = jax.grad(contract_pv)
dv01 = grad_fn(0.05) * 0.0001
print(f"DV01: ${float(dv01):,.2f}")
```

---

## Notes

- The `identifier` parameter is a string key (e.g., `"USD_SOFR"`, `"EUR_EURIBOR"`) defined by
  your contract's market object reference. For simple single-curve contracts, the observer
  can ignore this argument.
- For multi-curve environments (cross-currency swaps, basis swaps), implement
  `_get_risk_factor` with logic branching on `identifier`.
- The observer is called once per event date during simulation; it does not need to be
  vectorized unless you are batching contracts with `jax.vmap`.
- The public API is `observer.observe_risk_factor(identifier, time)` — subclasses
  implement `_get_risk_factor` which is called internally.
