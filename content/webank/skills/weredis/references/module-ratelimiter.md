# WeRedis Rate Limiter Module

High-performance rate limiter and circuit breaker implemented as Redis modules.

## Module Overview

| Module | Algorithm | Precision | Use Case |
|--------|-----------|-----------|----------|
| GCRA | Generic Cell Rate Algorithm | Nanosecond | Smooth rate limiting |
| Sliding Window | Fixed buckets per second | Second | Average TPS limiting |
| Circuit Breaker | Three-state (CLOSED/OPEN/HALF_OPEN) | Second | Service protection |

---

## GCRA (Generic Cell Rate Algorithm)

### GCRA.LIMIT

```
GCRA.LIMIT <key> <max_burst> <count_per_period> <period> [<quantity>]
```

| Parameter | Description |
|-----------|-------------|
| `key` | Limiter identifier (user ID, IP, or "global") |
| `max_burst` | Maximum burst capacity |
| `count_per_period` | Requests allowed per period |
| `period` | Period in seconds |
| `quantity` | Tokens to consume (default: 1) |

**Response (5-element array):**

| Index | Value | Meaning |
|-------|-------|---------|
| 1 | `0`/`1` | `0`=allowed, `1`=limited |
| 2 | Integer | Total limit (X-RateLimit-Limit) |
| 3 | Integer | Remaining quota (X-RateLimit-Remaining) |
| 4 | Seconds | Retry after (Retry-After), `-1` if allowed |
| 5 | Seconds | Reset time (X-RateLimit-Reset) |

**Example:**
```bash
# Allow 30 requests per 60 seconds, max burst 15
GCRA.LIMIT user:123 15 30 60
1) (integer) 0    # Allowed
2) (integer) 16   # Total limit (max_burst + 1)
3) (integer) 15   # Remaining
4) (integer) -1   # No retry needed
5) (integer) 2    # Reset in 2 seconds

# When limited
GCRA.LIMIT user:123 15 30 60 5
1) (integer) 1    # Limited
2) (integer) 16
3) (integer) 0    # No remaining
4) (integer) 3    # Retry after 3 seconds
5) (integer) 5
```

**Check without consuming:**
```bash
# quantity=0 only checks status
GCRA.LIMIT user:123 15 30 60 0
```

---

## Sliding Window Rate Limiter

Uses 60 fixed buckets (one per second) for second-precision limiting.

### sw.req - Request with Rate Limit

```
sw.req <key> <limit> <window_size> <quantity>
```

| Parameter | Description |
|-----------|-------------|
| `key` | Limiter identifier |
| `limit` | Maximum average TPS |
| `window_size` | Window size (1-60 seconds) |
| `quantity` | Request count |

**Logic:** Allow if `sum(window) + quantity <= limit * window_size`

**Returns:** Remaining quota, or `0` if limited

**Example:**
```bash
# 10 seconds, max 100 TPS average (1000 total)
sw.req user:123 100 10 1
(integer) 999

sw.req user:123 100 10 50
(integer) 949

# Over limit
sw.req user:123 100 10 2000
(integer) 0
```

### sw.avg - Get Window Average

```
sw.avg <key> <window_size>
```

**Returns:** Average requests per second (float)

**Example:**
```bash
sw.avg user:123 10
"12.5"
```

### sw.max - Get Window Peak

```
sw.max <key> <window_size>
```

**Returns:** Peak requests in any single second

**Example:**
```bash
sw.max user:123 10
(integer) 45
```

### sw.dump - Debug Dump

```
sw.dump <key>
```

**Returns:** 120 elements (60 buckets × 2: [timestamp, value])

---

## Circuit Breaker

Classic three-state circuit breaker for service protection.

### State Machine

```
         Failures exceed threshold
    ┌─────────────────────────────┐
    │                             │
    ▼                             │
┌─────────┐                    ┌──┴──────┐
│ CLOSED  │                    │  OPEN   │
│ (正常)   │                    │ (熔断)   │
└─────────┘                    └──┬──────┘
    ▲                             │
    │         After timeout       │
    │        ┌────────────────────┘
    │        │
    │        ▼
    │   ┌──────────┐
    │   │HALF_OPEN │
    │   │ (探测)    │
    │   └──────────┘
    │        │
    │  Success└──Failure
    │        │      │
    └────────┘      └──────► Back to OPEN
```

| State | Value | Behavior |
|-------|-------|----------|
| CLOSED | 0 | Normal, track events |
| OPEN | 1 | Reject all, wait for timeout |
| HALF_OPEN | 2 | Single probe allowed |

### cb.report - Report Event

```
cb.report <key> <success> <window_size> <fail_threshold> <fail_rate_threshold> <open_timeout_ms>
```

| Parameter | Description |
|-----------|-------------|
| `key` | Breaker identifier (service name, API) |
| `success` | `1`=success, `0`=failure |
| `window_size` | Sliding window (1-60 seconds) |
| `fail_threshold` | Fail count to trigger (0=disabled) |
| `fail_rate_threshold` | Fail rate % to trigger (0=disabled) |
| `open_timeout_ms` | OPEN state duration before HALF_OPEN |

**Response (5-element array):**

| Index | Value | Meaning |
|-------|-------|---------|
| 1 | `0`/`1`/`2` | State (CLOSED/OPEN/HALF_OPEN) |
| 2 | Integer | Failures in window |
| 3 | Integer | Successes in window |
| 4 | `0-100` | Failure rate % |
| 5 | ms | Retry after, `-1` if not OPEN |

**Example:**
```bash
# 10s window, trip on 5 failures OR 50% rate, 5s open timeout
cb.report api-service 1 10 5 50 5000  # Success
1) (integer) 0    # CLOSED
2) (integer) 0    # 0 failures
3) (integer) 1    # 1 success
4) (integer) 0    # 0% rate
5) (integer) -1   # No retry needed

# After failures exceed threshold
cb.report api-service 0 10 5 50 5000  # Failure
1) (integer) 1    # OPEN (tripped)
2) (integer) 6    # 6 failures
3) (integer) 2    # 2 successes
4) (integer) 75   # 75% rate
5) (integer) 4500 # Retry after 4.5s
```

### cb.state - Query State

```
cb.state <key> <window_size>
```

**Response (6-element array):**

| Index | Value | Meaning |
|-------|-------|---------|
| 1 | `0`/`1`/`2` | Current state |
| 2 | Integer | Failures in window |
| 3 | Integer | Successes in window |
| 4 | `0-100` | Failure rate % |
| 5 | ms | Time until state change, `-1` if not OPEN |
| 6 | ms | Timestamp of last state change |

**Example:**
```bash
cb.state api-service 10
1) (integer) 1    # OPEN
2) (integer) 8    # 8 failures
3) (integer) 2    # 2 successes
4) (integer) 80   # 80% rate
5) (integer) 3200 # 3.2s until HALF_OPEN
6) (integer) 1709425140123  # State changed at...
```

---

## Configuration Examples

### API Rate Limiting

```bash
# 100 requests per minute per user, burst up to 20
GCRA.LIMIT api:user:123 20 100 60
```

### Concurrent Request Limiting

```bash
# Max 10 concurrent (semaphore via atomic module)
RPUSHNF semaphore:api 10 request-1
# After processing, pop
RPOP semaphore:api
```

### Service Circuit Breaker

```bash
# Trip after 10 failures OR 70% failure rate, 30s cooldown
cb.report payment-service 0 30 10 70 30000
```

---

## Clock Configuration

Default uses `CLOCK_REALTIME` for Redis Sentinel failover compatibility.

For systems with clock drift concerns, compile with `USE_MONOTONIC_CLOCK=1`.
