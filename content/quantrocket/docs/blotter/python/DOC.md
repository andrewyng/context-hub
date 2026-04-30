---
name: blotter
description: "QuantRocket Blotter module - place orders, track positions, cancel orders, download executions, and query PnL"
metadata:
  languages: "python"
  versions: "2.11.0.0"
  revision: 1
  updated-on: "2026-03-19"
  source: community
  tags: "quantrocket,blotter,orders,positions,executions,pnl,trading"
---

# quantrocket.blotter

Place and manage orders, track positions and executions, query PnL.

## Import

```python
from quantrocket.blotter import (
    place_orders,
    cancel_orders,
    download_order_statuses,
    download_positions,
    list_positions,
    close_positions,
    download_executions,
    record_executions,
    apply_split,
    download_pnl,
    read_pnl_csv,
)
```

## Place Orders

```python
from quantrocket.blotter import place_orders

order_ids = place_orders(orders=[{
    "Sid": "FIBBG000BDTBL9",
    "Action": "BUY",                   # BUY or SELL
    "Exchange": "SMART",
    "TotalQuantity": 100,
    "OrderType": "MKT",               # MKT, LMT, STP, etc.
    "Tif": "DAY",                      # DAY, GTC, IOC, OPG
    "Account": "DU12345",
    "OrderRef": "my-strategy",         # tags order for tracking
}])

# Limit order
order_ids = place_orders(orders=[{
    "Sid": "FIBBG000BDTBL9",
    "Action": "BUY",
    "Exchange": "SMART",
    "TotalQuantity": 100,
    "OrderType": "LMT",
    "LmtPrice": 590.50,
    "Tif": "DAY",
    "Account": "DU12345",
    "OrderRef": "my-strategy",
}])
```

**Required fields:** `Sid`, `Action`, `Exchange`, `TotalQuantity`, `OrderType`, `Tif`, `Account`, `OrderRef`

## Positions

```python
from quantrocket.blotter import list_positions, download_positions, close_positions

positions = list_positions(order_refs=["my-strategy"])
# Returns: [{"Account": "DU12345", "Sid": "...", "Quantity": 100, ...}]

download_positions(filepath_or_buffer="/tmp/positions.csv", order_refs=["my-strategy"])
download_positions(filepath_or_buffer="/tmp/broker_pos.csv", view="broker")

# Generate close orders (does NOT place them)
close_positions(filepath_or_buffer="/tmp/close_orders.csv", order_refs=["my-strategy"])
```

## Orders and Cancellations

```python
from quantrocket.blotter import download_order_statuses, cancel_orders

download_order_statuses(filepath_or_buffer="/tmp/orders.csv", order_refs=["my-strategy"])
download_order_statuses(filepath_or_buffer="/tmp/open.csv", open_orders=True)

cancel_orders(order_refs=["my-strategy"])
cancel_orders(sids=["FIBBG000BDTBL9"])
cancel_orders(cancel_all=True)
```

**Order statuses:** `"Submitted"`, `"Filled"`, `"Cancelled"`, `"Error"`, `"Inactive"`

## Executions and PnL

```python
from quantrocket.blotter import download_executions, download_pnl, read_pnl_csv

download_executions(filepath_or_buffer="/tmp/executions.csv", order_refs=["my-strategy"])

download_pnl(filepath_or_buffer="/tmp/pnl.csv", order_refs=["my-strategy"])
download_pnl(filepath_or_buffer="/tmp/pnl.csv", details=True)          # detailed
download_pnl(filepath_or_buffer="/tmp/tearsheet.pdf", output="pdf")     # PDF tearsheet

pnl = read_pnl_csv("/tmp/pnl.csv")  # MultiIndex (Field, Date) DataFrame
returns = pnl.loc["Return"]
```

## Stock Splits

```python
from quantrocket.blotter import apply_split
apply_split(sid="FIBBG000BDTBL9", old_shares=1, new_shares=4)
```

## CLI Equivalents

```bash
quantrocket blotter order -f orders.csv
quantrocket blotter status --order-refs 'my-strategy' -o statuses.csv
quantrocket blotter cancel --order-refs 'my-strategy'
quantrocket blotter positions --order-refs 'my-strategy' -o positions.csv
quantrocket blotter executions --order-refs 'my-strategy' -o executions.csv
quantrocket blotter pnl --order-refs 'my-strategy' -o pnl.csv
```
