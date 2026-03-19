---
name: account
description: "QuantRocket Account module - query account balances, portfolio holdings, and exchange rates"
metadata:
  languages: "python"
  versions: "2.11.0.0"
  revision: 1
  updated-on: "2026-03-19"
  source: community
  tags: "quantrocket,account,balance,portfolio,exchange-rates"
---

# quantrocket.account

Query account balances, portfolio holdings, and exchange rates.

## Import

```python
from quantrocket.account import (
    download_account_balances,
    download_account_portfolio,
    download_exchange_rates,
)
```

## Account Balances

```python
from quantrocket.account import download_account_balances

download_account_balances(filepath_or_buffer="/tmp/balances.csv", latest=True)

download_account_balances(
    filepath_or_buffer="/tmp/balances.csv",
    start_date="2024-01-01",
    accounts=["DU12345"],
    fields=["NetLiquidation", "BuyingPower", "Cushion"],
)

# Alert if cushion below threshold
download_account_balances(
    filepath_or_buffer="/tmp/alert.csv",
    below={"Cushion": 0.05},
    latest=True,
)
```

**Common fields:** `"NetLiquidation"`, `"BuyingPower"`, `"Cushion"`, `"EquityWithLoanValue"`, `"GrossPositionValue"`, `"MaintMarginReq"`, `"TotalCashValue"`, `"UnrealizedPnL"`, `"RealizedPnL"` (40+ available)

## Portfolio

```python
from quantrocket.account import download_account_portfolio

download_account_portfolio(filepath_or_buffer="/tmp/portfolio.csv")

download_account_portfolio(
    filepath_or_buffer="/tmp/portfolio.csv",
    brokers=["alpaca"],
    fields=["Position", "MarketValue", "AverageCost", "UnrealizedPnl"],
    include_zero=True,
)
```

**brokers:** `"alpaca"`, `"ibkr"`

## Exchange Rates

```python
from quantrocket.account import download_exchange_rates

download_exchange_rates(filepath_or_buffer="/tmp/fx.csv", latest=True)
download_exchange_rates(
    filepath_or_buffer="/tmp/fx.csv",
    start_date="2024-01-01",
    base_currencies=["AUD"],
    quote_currencies=["USD"],
)
```

## CLI Equivalents

```bash
quantrocket account balance --latest -o balances.csv
quantrocket account portfolio -o portfolio.csv
quantrocket account rates --latest -o fx.csv
```
