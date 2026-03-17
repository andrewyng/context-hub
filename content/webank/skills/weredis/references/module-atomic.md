# WeRedis Atomic Module

The Atomic Module provides collection and list commands with enhanced atomicity and richer semantics for distributed scenarios.

## Commands Overview

| Category | Commands | Use Case |
|----------|----------|----------|
| Compare-And-Set | `HCAS`, `HCAD` | Distributed locks, optimistic concurrency |
| Conditional Pop | `LPOPIF`, `RPOPIF`, `ZPOPMAXIF`, `ZPOPMINIF` | Idempotent consumption, fair locks |
| Capacity Control | `LPUSHRING`, `RPUSHRING`, `LPUSHNF`, `RPUSHNF` | Fixed queues, rate limiting, semaphores |
| With Expiry | `HSETEX`, `LPUSHEX`, `RPUSHEX`, `SADDEX` | Auto-expiring collections |

---

## Hash Compare Operations

### HCAS - Atomic Compare-And-Set

```
HCAS key field expected_value new_value
```

**Returns:**
- `-1`: Field does not exist
- `1`: Update successful (value matched expected)
- `0`: Update failed (value did not match)

**Example:**
```bash
# Set initial value
HSET lock:order:123 owner "client-A"

# Only update if owned by client-A (optimistic lock)
HCAS lock:order:123 owner "client-A" "client-B"
# Returns: 1 (success)

# Another client tries to update
HCAS lock:order:123 owner "client-A" "client-C"
# Returns: 0 (failed, current owner is client-B)
```

### HCAD - Atomic Compare-And-Delete

```
HCAD key field expected_value
```

**Returns:** Same as HCAS

**Example - Safe Distributed Lock Release:**
```bash
# Only release lock if you own it
HCAD lock:order:123 owner "client-B"
# Returns: 1 (deleted)

# Prevents accidental unlock of others' locks
HCAD lock:order:456 owner "wrong-client"
# Returns: 0 (failed)
```

---

## Conditional Queue Operations

### LPOPIF / RPOPIF - Conditional Pop

```
LPOPIF key [eq/ne] value
RPOPIF key [eq/ne] value
```

| Operator | Meaning |
|----------|---------|
| `eq` | Pop if element equals value |
| `ne` | Pop if element does NOT equal value |

**Returns:**
- Element: Match found, popped and returned
- `0`: No match
- `nil`: Empty queue

**Example - Idempotent Consumption:**
```bash
# Queue: [task-1, task-2, task-3]
RPOPIF myqueue eq task-3
# Returns: "task-3" (popped)

# Try again - won't get duplicate
RPOPIF myqueue eq task-3
# Returns: 0 (no match, already consumed)
```

### ZPOPMAXIF / ZPOPMINIF - Conditional Sorted Set Pop

```
ZPOPMAXIF key [gt/lt/gte/lte/eq/ne] score
ZPOPMINIF key [gt/lt/gte/lte/eq/ne] score
```

**Returns:**
- Array `[member, score]`: Match found
- `0`: No match
- Empty array: Empty set

**Example - Fair Distributed Lock with Timeout:**
```bash
# Instances add themselves with timestamp
ZADD lock:queue 1709425140123 instance-A
ZADD lock:queue 1709425145456 instance-B

# Check if head has timed out (> 5 seconds old)
# Current time: 1709425160000
ZPOPMINIF lock:queue lt 1709425135000
# Returns: ["instance-A", 1709425140123] if timed out
# Returns: 0 if not timed out
```

---

## Capacity-Controlled Queue Operations

### LPUSHRING / RPUSHRING - Ring Queue (Auto Trim)

```
LPUSHRING key max_length value
RPUSHRING key max_length value
```

**Returns:**
- Integer: New length (when not full)
- Array: Trimmed elements (when full)

**Example - Sliding Window:**
```bash
# Keep only last 5 items
RPUSHRING recent:views 5 "page-A"
# Returns: 1

RPUSHRING recent:views 5 "page-B"
RPUSHRING recent:views 5 "page-C"
RPUSHRING recent:views 5 "page-D"
RPUSHRING recent:views 5 "page-E"
# Returns: 5

# When full, oldest is trimmed
RPUSHRING recent:views 5 "page-F"
# Returns: ["page-A"] (trimmed element)
```

### LPUSHNF / RPUSHNF - Insert If Not Full

```
LPUSHNF key max_length value [value ...]
RPUSHNF key max_length value [value ...]
```

**Returns:**
- Positive: New length (success)
- Negative: Required capacity (failure)

**Example - Semaphore:**
```bash
# Max 10 concurrent operations
RPUSHNF semaphore:api 10 request-1
# Returns: 1 (success)

# When full
RPUSHNF semaphore:api 10 request-11
# Returns: -11 (need capacity of 11, only 10 available)
```

---

## Operations with Expiry

### HSETEX - Hash Set with Expiry

```
HSETEX key field value [field value ...] [EX|EXAT|PX|PXAT] time
```

**Example:**
```bash
# Set hash field with 60 second expiry
HSETEX session:user:123 token "abc123" EX 60

# Multiple fields
HSETEX session:user:123 name "Alice" role "admin" PX 60000
```

### LPUSHEX / RPUSHEX - List Push with Expiry

```
LPUSHEX key value [value ...] [EX|EXAT|PX|PXAT] time
RPUSHEX key value [value ...] [EX|EXAT|PX|PXAT] time
```

**Example:**
```bash
# Push to queue, key expires in 1 hour
RPUSHEX queue:email:batch msg1 msg2 msg3 EX 3600
```

### SADDEX - Set Add with Expiry

```
SADDEX key value [value ...] [EX|EXAT|PX|PXAT] time
```

**Example:**
```bash
# Add to set, expires in 24 hours
SADDEX dedup:order order-123 order-456 EX 86400
```

---

## Error Messages

| Error | Cause |
|-------|-------|
| `ERR invalid expire time, must be a positive integer` | Expiry time ≤ 0 |
| `ERR invalid comparison flag` | Invalid operator for POPIF commands |

---

## Best Practices

1. **Distributed Locks**: Use `HCAS` for lock acquisition, `HCAD` for safe release
2. **Idempotent Consumption**: Use `LPOPIF`/`RPOPIF` with `eq` to prevent duplicates
3. **Rate Limiting**: Use `LPUSHNF`/`RPUSHNF` as counting semaphores
4. **Sliding Windows**: Use `LPUSHRING`/`RPUSHRING` to maintain fixed-size history
5. **Auto-cleanup**: Use `*EX` variants to avoid orphaned data
