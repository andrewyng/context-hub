# JACTUS Contract Types — Full Parameter Reference

## How to Use This File

Fetch with: `chub get jactus/contracts --file references/contract-types.md`

All contracts are created via `create_contract(attrs, observer)` where `attrs` is a
`ContractAttributes` instance. Below are the key parameters specific to each contract type.
Common parameters (contract_id, contract_role, status_date, day_count_convention) are
omitted — always include those.

---

## Principal Contracts

### PAM — Principal at Maturity
Bullet loan / bond. Interest only during life, full principal at maturity.

```python
ContractAttributes(
    contract_type=ContractType.PAM,
    initial_exchange_date=ActusDateTime(...),
    maturity_date=ActusDateTime(...),
    notional_principal=100_000.0,
    nominal_interest_rate=0.05,
    interest_payment_cycle="6M",            # optional; omit for zero-coupon
    day_count_convention="30E360",
)
```

### LAM — Linear Amortizer
Equal principal payments each period, declining interest.

```python
ContractAttributes(
    contract_type=ContractType.LAM,
    initial_exchange_date=ActusDateTime(...),
    maturity_date=ActusDateTime(...),
    notional_principal=100_000.0,
    nominal_interest_rate=0.05,
    principal_redemption_cycle="1M",        # required — amortization frequency
    interest_payment_cycle="1M",
    interest_calculation_base="NT",         # NT | NTIED | NTL — interest base
    day_count_convention="30E360",
)
```

### ANN — Annuity
Equal total payment (principal + interest) each period. Mortgages.

```python
ContractAttributes(
    contract_type=ContractType.ANN,
    initial_exchange_date=ActusDateTime(...),
    maturity_date=ActusDateTime(...),
    notional_principal=500_000.0,
    nominal_interest_rate=0.065,
    principal_redemption_cycle="1M",        # payment frequency
    day_count_convention="AA",              # Actual/Actual ISDA
)
```

### NAM — Negative Amortizer
Payments less than interest due → principal balance grows.

```python
ContractAttributes(
    contract_type=ContractType.NAM,
    initial_exchange_date=ActusDateTime(...),
    maturity_date=ActusDateTime(...),
    notional_principal=100_000.0,
    nominal_interest_rate=0.08,
    principal_redemption_cycle="1M",
    next_principal_redemption_amount=500.0,   # fixed payment < interest
    day_count_convention="30E360",
)
```

### LAX — Exotic Linear Amortizer
Variable amortization schedule (custom redemption amounts per date).

```python
ContractAttributes(
    contract_type=ContractType.LAX,
    initial_exchange_date=ActusDateTime(...),
    maturity_date=ActusDateTime(...),
    notional_principal=100_000.0,
    nominal_interest_rate=0.05,
    # Amortization defined via schedule in ContractAttributes
    day_count_convention="30E360",
)
```

### CLM — Call Money
Variable principal, repayable on demand / short notice.

```python
ContractAttributes(
    contract_type=ContractType.CLM,
    initial_exchange_date=ActusDateTime(...),
    maturity_date=ActusDateTime(...),
    notional_principal=1_000_000.0,
    nominal_interest_rate=0.045,
    day_count_convention="A360",
)
```

---

## Non-Principal Contracts

### UMP — Undefined Maturity Profile
Revolving credit lines with no fixed maturity.

```python
ContractAttributes(
    contract_type=ContractType.UMP,
    initial_exchange_date=ActusDateTime(...),
    notional_principal=500_000.0,          # credit limit
    nominal_interest_rate=0.06,
    interest_payment_cycle="1M",
    day_count_convention="A365",
    # No maturity_date required
)
```

### CSH — Cash
Money market account or escrow. Earns interest on balance.

```python
ContractAttributes(
    contract_type=ContractType.CSH,
    initial_exchange_date=ActusDateTime(...),
    notional_principal=10_000.0,
    nominal_interest_rate=0.04,
    day_count_convention="A365",
)
```

### STK — Stock
Equity position tracking. Models dividends and price returns.

```python
ContractAttributes(
    contract_type=ContractType.STK,
    initial_exchange_date=ActusDateTime(...),
    notional_principal=50_000.0,   # position value at purchase
    day_count_convention="A365",
)
```

### COM — Commodity
Physical commodity position (futures underlier, warehouse receipt).

```python
ContractAttributes(
    contract_type=ContractType.COM,
    initial_exchange_date=ActusDateTime(...),
    notional_principal=100_000.0,  # position value
    day_count_convention="A365",
)
```

---

## Derivative Contracts

### SWPPV — Plain Vanilla Interest Rate Swap
Fixed vs. floating. Use two-leg approach: fix leg via `nominal_interest_rate`.

```python
ContractAttributes(
    contract_type=ContractType.SWPPV,
    contract_role=ContractRole.RPA,         # fixed-rate receiver
    initial_exchange_date=ActusDateTime(...),
    maturity_date=ActusDateTime(...),
    notional_principal=10_000_000.0,
    nominal_interest_rate=0.04,             # fixed rate
    interest_payment_cycle="3M",
    day_count_convention="30E360",
)
```

### SWAPS — Generic / Cross-Currency Swap
Multi-leg swap; cross-currency basis swaps.

```python
ContractAttributes(
    contract_type=ContractType.SWAPS,
    initial_exchange_date=ActusDateTime(...),
    maturity_date=ActusDateTime(...),
    notional_principal=10_000_000.0,
    nominal_interest_rate=0.035,
    interest_payment_cycle="3M",
    currency="EUR",                         # base leg currency
    day_count_convention="A360",
)
```

### FXOUT — FX Outright (Forward / Swap)
FX forward or swap. Two currency exchange at fixed future rate.

```python
ContractAttributes(
    contract_type=ContractType.FXOUT,
    contract_role=ContractRole.RPA,
    initial_exchange_date=ActusDateTime(...),    # spot leg
    maturity_date=ActusDateTime(...),             # forward leg
    notional_principal=1_000_000.0,              # USD amount
    price_at_purchase_date=1.08,                 # EUR/USD forward rate
    currency="USD",
    currency2="EUR",
    day_count_convention="A360",
)
```

### OPTNS — Options (European / American)
Calls, puts, European or American exercise.

```python
ContractAttributes(
    contract_type=ContractType.OPTNS,
    contract_role=ContractRole.RPA,         # option buyer
    purchase_date=ActusDateTime(...),
    maturity_date=ActusDateTime(...),       # expiry
    notional_principal=100_000.0,
    price_at_purchase_date=105.0,           # strike price
    day_count_convention="A365",
)
```

### FUTUR — Futures
Standardized exchange-traded forward.

```python
ContractAttributes(
    contract_type=ContractType.FUTUR,
    contract_role=ContractRole.RPA,
    initial_exchange_date=ActusDateTime(...),
    maturity_date=ActusDateTime(...),
    notional_principal=250_000.0,
    price_at_purchase_date=4800.0,          # futures entry price
    day_count_convention="A365",
)
```

### CAPFL — Cap / Floor
Interest rate cap or floor on floating-rate exposure.

```python
ContractAttributes(
    contract_type=ContractType.CAPFL,
    contract_role=ContractRole.RPA,         # cap buyer
    initial_exchange_date=ActusDateTime(...),
    maturity_date=ActusDateTime(...),
    notional_principal=5_000_000.0,
    nominal_interest_rate=0.05,             # strike / cap rate
    interest_payment_cycle="3M",
    day_count_convention="A360",
)
```

### CEG — Credit Enhancement Guarantee
Credit protection / guarantee contract.

```python
ContractAttributes(
    contract_type=ContractType.CEG,
    contract_role=ContractRole.RPA,
    initial_exchange_date=ActusDateTime(...),
    maturity_date=ActusDateTime(...),
    notional_principal=1_000_000.0,
    nominal_interest_rate=0.01,             # guarantee fee rate
    day_count_convention="30E360",
)
```

### CEC — Credit Enhancement Collateral
Collateral management contract.

```python
ContractAttributes(
    contract_type=ContractType.CEC,
    contract_role=ContractRole.RPA,
    initial_exchange_date=ActusDateTime(...),
    maturity_date=ActusDateTime(...),
    notional_principal=2_000_000.0,
    day_count_convention="30E360",
)
```

---

## `ContractAttributes` Common Parameters

| Parameter | Type | Description |
|---|---|---|
| `contract_id` | str | Unique identifier |
| `contract_type` | ContractType | Enum — PAM, ANN, SWPPV, etc. |
| `contract_role` | ContractRole | RPA (lender/receiver) or RPL (borrower/payer) |
| `status_date` | ActusDateTime | Simulation anchor date (≤ initial_exchange_date) |
| `initial_exchange_date` | ActusDateTime | When principal is exchanged |
| `maturity_date` | ActusDateTime | Contract end date |
| `notional_principal` | float | Principal / notional amount |
| `nominal_interest_rate` | float | Annual rate as decimal (0.05 = 5%) |
| `day_count_convention` | str/DayCountConvention | "AA", "A360", "A365", "30E360", "30E360ISDA", "30360", "BUS252" |
| `interest_payment_cycle` | str | "1M", "3M", "6M", "1Y" |
| `principal_redemption_cycle` | str | Amortization frequency (LAM, ANN, NAM) |
| `currency` | str | ISO 4217 code (default "USD") |
