---
name: tqsdk
description: "TqSDK (天勤量化) Python API - Chinese quantitative trading library for futures and options"
metadata:
  languages: "python"
  versions: "3.9.1"
  updated-on: "2026-03-18"
  source: community
  tags: "tqsdk,quantitative,trading,futures,options,china,shinny"
---

# TqSDK (天勤量化) Python Coding Guidelines

You are a TqSDK coding expert. Help me with writing code using the TqSDK library for Chinese futures and options quantitative trading.

You can find the official documentation here:
https://doc.shinnytech.com/tqsdk/latest/

## Golden Rule: Use TqSDK for Chinese Futures Trading

TqSDK is the official Python library from 信易科技 (Shinny Technology) for trading Chinese futures and options markets. It provides comprehensive support for:

- Real-time market data (quotes, K-lines, ticks)
- Historical data retrieval
- Trading operations (orders, positions)
- Backtesting
- Paper trading (模拟交易)

**Important Notes:**
- TqSDK requires a 快期 (KQ) account for authentication
- It connects to Chinese exchanges: SHFE, DCE, CZCE, CFFEX, INE
- Primarily supports futures and options, not stocks (though TqSimStock exists)
- All data is in Chinese (contracts, exchanges)

## Installation

Install or upgrade TqSDK using pip:

```bash
pip install tqsdk -U
```

For faster installation in China:

```bash
pip install tqsdk -U -i https://pypi.tuna.tsinghua.edu.cn/simple --trusted-host=pypi.tuna.tsinghua.edu.cn
```

## Account Types

TqSDK supports multiple account types:

| Account Type | Description | Use Case |
|-------------|-------------|----------|
| `TqSim` | Built-in simulated trading | Backtesting, paper trading |
| `TqSimStock` | Built-in stock simulated trading | Stock paper trading |
| `TqAccount` | Real futures account | Live trading |
| `TqKq` | KQ simulated trading | Simulated futures trading |
| `TqKqStock` | KQ stock simulated trading | Simulated stock trading |
| `TqZq` | Zhongqi (众期) account | Trading |
| `TqCtp` | Direct CTP connection | Direct exchange connection |
| `TqMultiAccount` | Multiple accounts | Multi-account management |

## Initialization

### Basic Initialization with Sim Account

For paper trading without real money:

```python
from tqsdk import TqApi, TqAuth, TqSim

api = TqApi(TqSim(), auth=TqAuth("快期账户", "密码"))
```

### Real Account Initialization

For live trading with a futures broker:

```python
from tqsdk import TqApi, TqAuth, TqAccount

api = TqApi(
    TqAccount("期货公司", "账号", "密码"),
    auth=TqAuth("快期账户", "密码")
)
```

### Backtest Initialization

For historical backtesting:

```python
from tqsdk import TqApi, TqAuth, TqSim, TqBacktest
from datetime import date

api = TqApi(
    TqSim(),
    backtest=TqBacktest(start_dt=date(2018, 5, 1), end_dt=date(2018, 10, 1)),
    auth=TqAuth("快期账户", "密码")
)
```

### With Web GUI

Enable web interface for backtesting visualization:

```python
from tqsdk import TqApi, TqAuth, TqSim, TqBacktest
from datetime import date

api = TqApi(
    TqSim(),
    backtest=TqBacktest(start_dt=date(2018, 5, 1), end_dt=date(2018, 10, 1)),
    web_gui=True,
    auth=TqAuth("快期账户", "密码")
)
```

## Contract Symbols

TqSDK uses Chinese futures contract symbols:

```python
# Format: EXCHANGE.CONTRACT
# Examples:
SHFE.rb2105    # 上期所螺纹钢2105
SHFE.cu2105    # 上期所铜2105
SHFE.au2106    # 上期所黄金2106
DCE.m2105      # 大商所豆粕2105
DCE.y2105      # 大商所豆油2105
DCE.a2101      # 大商所豆一2101
CZCE.cf2105   # 郑商所棉花2105
CZCE.ta2105   # 郑商所TA2105
CZCE.zc2105   # 郑商所动力煤2105
CFFEX.if2105  # 中金所IF沪深300指数2105
CFFEX.ic2105  # 中金所IC中证500指数2105
CFFEX.ih2105  # 中金所IH上证50指数2105
INE.sc2105    # 上能源原油2105
```

## Market Data

### Get Quote (实时行情)

Get real-time quote for a contract:

```python
from tqsdk import TqApi, TqAuth, TqSim

api = TqApi(TqSim(), auth=TqAuth("快期账户", "密码"))

# Get quote reference
quote = api.get_quote("SHFE.rb2105")

# Wait for data update
while True:
    api.wait_update()
    print(f"时间: {quote.datetime}")
    print(f"最新价: {quote.last_price}")
    print(f"买价: {quote.bid_price1}")
    print(f"卖价: {quote.ask_price1}")
    print(f"成交量: {quote.volume}")
```

### Quote Attributes

Common quote fields:

| Attribute | Description |
|-----------|-------------|
| `last_price` | 最新价 |
| `bid_price1` / `bid_priceN` | 买价1-N |
| `ask_price1` / `ask_priceN` | 卖价1-N |
| `bid_volume1` / `bid_volumeN` | 买量1-N |
| `ask_volume1` / `ask_volumeN` | 卖量1-N |
| `volume` | 成交量 |
| `open_interest` | 持仓量 |
| `highest` | 最高价 |
| `lowest` | 最低价 |
| `open` | 开盘价 |
| `close` | 收盘价 |
| `datetime` | 时间 |
| `pre_close` | 昨收盘 |
| `pre_settle` | 昨结算 |
| `limit_up` | 涨停价 |
| `limit_down` | 跌停价 |
| `pre_open_interest` | 昨持仓 |

### Get K-line Data (K线数据)

Get historical K-line data as pandas DataFrame:

```python
from tqsdk import TqApi, TqAuth, TqSim

api = TqApi(TqSim(), auth=TqAuth("快期账户", "密码"))

# Get 10-second K-lines
klines = api.get_kline_serial("SHFE.rb2105", 10)

# Wait for updates
while True:
    api.wait_update()
    print(klines.tail())  # Print last few rows

# Access data
print(klines['close'])   # Close prices
print(klines['volume'])  # Volume
```

### K-line Duration Parameters

| Parameter | Description |
|-----------|-------------|
| 1 | 1秒线 |
| 60 | 1分钟线 |
| 300 | 5分钟线 |
| 900 | 15分钟线 |
| 3600 | 1小时线 |
| 86400 | 日线 |

### Get Tick Data (Tick数据)

Get tick-by-tick data:

```python
from tqsdk import TqApi, TqAuth, TqSim

api = TqApi(TqSim(), auth=TqAuth("快期账户", "密码"))

# Get tick data
ticks = api.get_tick_serial("SHFE.rb2105")

while True:
    api.wait_update()
    print(ticks.tail())
```

### Get Option Data (期权数据)

Get option quotes:

```python
# 期权合约代码格式
# SHFE.rb2105.C.5000 (螺纹钢2105认购期权，行权价5000)

option = api.get_quote("SHFE.rb2105.C.5000")
print(f"期权价格: {option.last_price}")
print(f"内在价值: {option.strike_price}")
print(f"剩余天数: {option.expire_date}")
```

### Subscribe to Multiple Quotes

```python
from tqsdk import TqApi, TqAuth, TqSim

api = TqApi(TqSim(), auth=TqAuth("快期账户", "密码"))

# Subscribe to multiple contracts
symbols = ["SHFE.rb2105", "SHFE.cu2105", "DCE.m2105"]
quotes = {s: api.get_quote(s) for s in symbols}

while True:
    api.wait_update()
    for s, q in quotes.items():
        print(f"{s}: {q.last_price}")
```

## Trading

### Insert Order (下单)

```python
from tqsdk import TqApi, TqAuth, TqSim

api = TqApi(TqSim(), auth=TqAuth("快期账户", "密码"))

# 市价单
order = api.insert_order(
    symbol="SHFE.rb2105",
    direction="BUY",      # "BUY" or "SELL"
    offset="OPEN",         # "OPEN", "CLOSE", "CLOSETODAY"
    volume=1,
    price=0                # 0 = 市价
)
print(f"订单ID: {order.order_id}")
print(f"订单状态: {order.status}")

# 限价单
order = api.insert_order(
    symbol="SHFE.rb2105",
    direction="BUY",
    offset="OPEN",
    volume=1,
    price=5000             # 指定价格
)
```

### Order Parameters

| Parameter | Description | Values |
|-----------|-------------|--------|
| `symbol` | 合约代码 | e.g., "SHFE.rb2105" |
| `direction` | 买卖方向 | "BUY", "SELL" |
| `offset` | 开平方向 | "OPEN", "CLOSE", "CLOSETODAY" |
| `volume` | 数量 | positive integer |
| `price` | 价格 | 0 for market order |
| `limit_price` | 限价 | optional, for limit orders |
| `order_type` | 订单类型 | "LIMIT", "MARKET", "FOK", "IOC" |

### Query Order Status

```python
# Get order by ID
order = api.get_order("order_id_123")

print(f"订单状态: {order.status}")          # "ALIVE", "FINISHED"
print(f"已成交: {order.volume_orign}")
print(f"成交数量: {order.volume_traded}")
print(f"剩余数量: {order.volume_left}")
print(f"委托价格: {order.limit_price}")
```

### Cancel Order (撤单)

```python
from tqsdk import TqApi, TqAuth, TqSim

api = TqApi(TqSim(), auth=TqAuth("快期账户", "密码"))

# Place an order first
order = api.insert_order("SHFE.rb2105", "BUY", "OPEN", 1, price=0)

# Cancel the order
api.cancel_order(order.order_id)
```

### TargetPosTask (自动调仓工具)

Use TargetPosTask to manage positions automatically:

```python
from tqsdk import TqApi, TqAuth, TqSim, TargetPosTask

api = TqApi(TqSim(), auth=TqAuth("快期账户", "密码"))

# Create position manager
target_pos = TargetPosTask(api, "SHFE.rb2105")

# Set target position
target_pos.set_target_volume(5)    # Target 5 lots long
target_pos.set_target_volume(-3)   # Target 3 lots short
target_pos.set_target_volume(0)    # Target flat (close all)
```

### Get Position (查询持仓)

```python
from tqsdk import TqApi, TqAuth, TqSim

api = TqApi(TqSim(), auth=TqAuth("快期账户", "密码"))

# Get position for specific contract
position = api.get_position("SHFE.rb2105")

print(f"多头持仓: {position.pos_long}")
print(f"空头持仓: {position.pos_short}")
print(f"持仓均价: {position.pos_long_his_avg_price}")
print(f"持仓盈亏: {position.position_profit}")
```

### Position Attributes

| Attribute | Description |
|-----------|-------------|
| `pos_long` | 多头持仓 |
| `pos_short` | 空头持仓 |
| `pos_long_his_avg_price` | 多头持仓均价 |
| `pos_short_his_avg_price` | 空头持仓均价 |
| `position_profit` | 持仓盈亏 |
| `position_profit_long` | 多头持仓盈亏 |
| `position_profit_short` | 空头持仓盈亏 |
| `volume_long_today` | 多头今日开仓 |
| `volume_short_today` | 空头今日开仓 |

### Get Account Info (账户信息)

```python
from tqsdk import TqApi, TqAuth, TqSim

api = TqApi(TqSim(), auth=TqAuth("快期账户", "密码"))

# Get account
account = api.get_account()

print(f"账户权益: {account.balance}")
print(f"可用资金: {account.available}")
print(f"持仓盈亏: {account.position_profit}")
print(f"保证金: {account.margin}")
print(f"冻结资金: {account.frozen}")
```

### Account Attributes

| Attribute | Description |
|-----------|-------------|
| `balance` | 账户权益 |
| `available` | 可用资金 |
| `margin` | 保证金 |
| `margin_long` | 多头保证金 |
| `margin_short` | 空头保证金 |
| `position_profit` | 持仓盈亏 |
| `close_profit` | 平仓盈亏 |
| `frozen` | 冻结资金 |
| `frozen_margin` | 冻结保证金 |
| `frozen_commission` | 冻结手续费 |

## Wait for Updates

### Basic Wait Loop

```python
while True:
    api.wait_update()
    # Process data updates
```

### Wait with Timeout

```python
import asyncio

async def main():
    while True:
        # Wait max 1 second
        api.wait_update(deadline=time.time() + 1)
        
        # Check if data changed
        if api.is_changing(quote, "last_price"):
            print(f"Price changed: {quote.last_price}")

asyncio.run(main())
```

### Check Data Changes

```python
# Check if data changed
if api.is_changing(quote, "last_price"):
    print("Price updated")

if api.is_changing(klines.iloc[-1], "datetime"):
    print("New K-line formed")

# Check if data is stable
if api.is_changing(klines):
    # K-line is changing
    pass
```

## Technical Indicators

TqSDK provides built-in technical indicators:

```python
from tqsdk import TqApi, TqAuth, TqSim
from tqsdk.tafunc import ma, ema, boll, rsi, macd

api = TqApi(TqSim(), auth=TqAuth("快期账户", "密码"))

klines = api.get_kline_serial("SHFE.rb2105", 60, data_length=100)

# Moving average
ma5 = ma(klines['close'], 5)
ma10 = ma(klines['close'], 10)

# Bollinger Bands
upper, middle, lower = boll(klines['close'], 20, 2)

# RSI
rsi_value = rsi(klines['close'], 14)

# MACD
diff, dea, macd_hist = macd(klines['close'], 12, 26, 9)
```

### Available Indicators

| Function | Description |
|----------|-------------|
| `ma` | 移动平均线 |
| `ema` | 指数移动平均 |
| `boll` | 布林带 |
| `rsi` | 相对强弱指数 |
| `macd` | MACD指标 |
| `kdj` | KDJ指标 |
| `cci` | 顺势指标 |
| `atr` | 平均真实波幅 |

## Backtesting

### Basic Backtest

```python
from tqsdk import TqApi, TqAuth, TqSim, TqBacktest, TargetPosTask
from tqsdk.tafunc import ma
from datetime import date

SYMBOL = "SHFE.rb2105"
LONG_PERIOD = 60
SHORT_PERIOD = 20

api = TqApi(
    TqSim(),
    backtest=TqBacktest(start_dt=date(2019, 5, 1), end_dt=date(2019, 10, 1)),
    auth=TqAuth("快期账户", "密码")
)

account = api.get_account()
klines = api.get_kline_serial(SYMBOL, duration_seconds=60, data_length=LONG_PERIOD + 2)
target_pos = TargetPosTask(api, SYMBOL)

while True:
    api.wait_update()
    if api.is_changing(klines.iloc[-1], "datetime"):
        short_avg = ma(klines.close, SHORT_PERIOD)
        long_avg = ma(klines.close, LONG_PERIOD)
        
        # Golden cross - buy
        if long_avg.iloc[-2] < short_avg.iloc[-2] and long_avg.iloc[-1] > short_avg.iloc[-1]:
            target_pos.set_target_volume(1)
        
        # Death cross - sell
        if short_avg.iloc[-2] < long_avg.iloc[-2] and short_avg.iloc[-1] > long_avg.iloc[-1]:
            target_pos.set_target_volume(-1)
```

### Batch Backtesting

```python
from tqsdk import TqApi, TqAuth, TqSim, TqBacktest, TargetPosTask, BacktestFinished
from tqsdk.tafunc import ma
from datetime import date

SYMBOL = "SHFE.rb2105"

for short_period in range(20, 40):
    acc = TqSim()  # New account for each test
    try:
        api = TqApi(acc, 
                    backtest=TqBacktest(start_dt=date(2019, 5, 1), 
                                        end_dt=date(2019, 10, 1)),
                    auth=TqAuth("快期账户", "密码"))
        
        account = api.get_account()
        klines = api.get_kline_serial(SYMBOL, 60, data_length=100)
        target_pos = TargetPosTask(api, SYMBOL)
        
        # Run strategy
        while True:
            api.wait_update()
            # ... strategy logic ...
            
    except BacktestFinished:
        print(f"short={short_period}, final_balance={account['balance']}")
```

## Multi-Account Trading

```python
from tqsdk import TqApi, TqAuth, TqMultiAccount, TqAccount

api = TqApi(
    TqMultiAccount([
        TqAccount("期货公司1", "账号1", "密码1"),
        TqAccount("期货公司2", "账号2", "密码2"),
    ]),
    auth=TqAuth("快期账户", "密码")
)

# Get accounts
accounts = api.tq_accounts

# Get specific account
acc1 = accounts[0]
print(f"Account 1 balance: {acc1.balance}")
```

## Error Handling

```python
from tqsdk import TqApi, TqAuth, TqSim
from tqsdk.exceptions import TqApiException, TqAuthException

try:
    api = TqApi(TqSim(), auth=TqAuth("账户", "密码"))
except TqAuthException as e:
    print(f"认证失败: {e}")
except Exception as e:
    print(f"错误: {e}")

# Handle order errors
try:
    order = api.insert_order("SHFE.rb2105", "BUY", "OPEN", 1, price=0)
except Exception as e:
    print(f"下单失败: {e}")
```

### Common Exceptions

| Exception | Description |
|-----------|-------------|
| `TqApiException` | General API error |
| `TqAuthException` | Authentication error |
| `TqBacktestFinished` | Backtest completed |
| `TqRcvDataException` | Data receiving error |

## Best Practices

### Connection Management

```python
from tqsdk import TqApi, TqAuth, TqSim

api = TqApi(TqSim(), auth=TqAuth("账户", "密码"))

try:
    # Your trading logic
    pass
finally:
    api.close()  # Always close connection
```

### Async Usage

```python
import asyncio
from tqsdk import TqApi, TqAuth, TqSim

async def main():
    api = TqApi(TqSim(), auth=TqAuth("账户", "密码"))
    try:
        quote = api.get_quote("SHFE.rb2105")
        
        while True:
            await api.wait_update()
            print(quote.last_price)
    finally:
        api.close()

asyncio.run(main())
```

### Data Length Planning

```python
# Always request enough historical data for your indicators
# If using 20-period MA on 1-hour K-lines, request at least 25+ data points

klines = api.get_kline_serial(
    "SHFE.rb2105",
    duration_seconds=3600,  # 1-hour
    data_length=30          # Enough for MA20 + buffer
)
```

## Complete Trading Example

```python
from tqsdk import TqApi, TqAuth, TqSim, TargetPosTask
from tqsdk.tafunc import ma
from datetime import date

class MaCrossStrategy:
    def __init__(self, symbol, short_period=20, long_period=60):
        self.symbol = symbol
        self.short_period = short_period
        self.long_period = long_period
        
    def run(self):
        api = TqApi(TqSim(), auth=TqAuth("快期账户", "密码"))
        try:
            # Initialize data
            klines = api.get_kline_serial(
                self.symbol,
                duration_seconds=60,
                data_length=self.long_period + 2
            )
            target_pos = TargetPosTask(api, self.symbol)
            
            while True:
                api.wait_update()
                
                # Check for new bar
                if api.is_changing(klines.iloc[-1], "datetime"):
                    short_ma = ma(klines.close, self.short_period)
                    long_ma = ma(klines.close, self.long_period)
                    
                    # Golden cross
                    if (short_ma.iloc[-2] <= long_ma.iloc[-2] and 
                        short_ma.iloc[-1] > long_ma.iloc[-1]):
                        print("买入信号")
                        target_pos.set_target_volume(1)
                    
                    # Death cross
                    elif (short_ma.iloc[-2] >= long_ma.iloc[-2] and 
                          short_ma.iloc[-1] < long_ma.iloc[-1]):
                        print("卖出信号")
                        target_pos.set_target_volume(0)
                        
        finally:
            api.close()

if __name__ == "__main__":
    strategy = MaCrossStrategy("SHFE.rb2105")
    strategy.run()
```

## Useful Links

- Official Documentation: https://doc.shinnytech.com/tqsdk/latest/
- GitHub Repository: https://github.com/shinnytech/tqsdk-python
- Quick Start Guide: https://doc.shinnytech.com/tqsdk/latest/quickstart.html
- API Reference: https://doc.shinnytech.com/tqsdk/latest/reference/index.html
- Register Account: https://www.shinnytech.com/register-intro/
