---
name: moonshot
description: "QuantRocket Moonshot module - vectorized backtesting, parameter scans, ML walkforward optimization"
metadata:
  languages: "python"
  versions: "2.11.0.0"
  revision: 1
  updated-on: "2026-03-19"
  source: community
  tags: "quantrocket,moonshot,backtest,vectorized,parameter-scan,ml"
---

# quantrocket.moonshot

Vectorized backtesting framework with parameter scans and ML walkforward.

## Import

```python
from quantrocket.moonshot import (
    backtest,
    read_moonshot_csv,
    scan_parameters,
    ml_walkforward,
    trade,
)
```

## Backtesting

```python
from quantrocket.moonshot import backtest, read_moonshot_csv

backtest(
    strategies=["my-strategy"],
    start_date="2020-01-01",
    end_date="2024-12-31",
    filepath_or_buffer="/tmp/results.csv",
)

# Multi-strategy with allocations
backtest(
    strategies=["strategy-a", "strategy-b"],
    allocations={"strategy-a": 0.6, "strategy-b": 0.4},
    nlv={"USD": 1_000_000},
    filepath_or_buffer="/tmp/results.csv",
)

# Segmented (reduces memory)
backtest(strategies=["my-strategy"], start_date="2010-01-01", segment="A",
         filepath_or_buffer="/tmp/results.csv")

# PDF tearsheet
backtest(strategies=["my-strategy"], output="pdf", filepath_or_buffer="/tmp/tearsheet.pdf")

result = read_moonshot_csv("/tmp/results.csv")  # MultiIndex (Field, Date) DataFrame
returns = result.loc["Return"]
```

## Parameter Scans

```python
from quantrocket.moonshot import scan_parameters

scan_parameters(
    strategies=["my-strategy"],
    start_date="2020-01-01",
    param1="LOOKBACK", vals1=["20", "40", "60"],
    param2="THRESHOLD", vals2=["0.3", "0.5", "0.7"],
    num_workers=4,
    filepath_or_buffer="/tmp/scan.csv",
)
```

## ML Walkforward

```python
from quantrocket.moonshot import ml_walkforward

ml_walkforward(
    strategy="my-ml-strategy",
    start_date="2015-01-01",
    end_date="2024-12-31",
    train="3Y",
    min_train="2Y",
    rolling_train="3Y",
    segment="A",
    filepath_or_buffer="/tmp/ml_results.csv",
)
```

## CLI Equivalents

```bash
quantrocket moonshot backtest 'my-strategy' --start-date '2020-01-01' -o results.csv
quantrocket moonshot param-scan 'my-strategy' \
    --param1 'LOOKBACK' --vals1 20 40 60 --num-workers 4 -o scan.csv
quantrocket moonshot trade 'my-strategy' -o orders.csv
```
