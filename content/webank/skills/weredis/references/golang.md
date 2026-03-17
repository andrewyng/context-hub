# WeRedis Go Client - Detailed Guide

WeRedis Go Client is based on `github.com/redis/go-redis/v7`.

## Installation

```bash
go get code.weoa.com/Internal/weredis-client-go@1.4.0
```

## Import

```go
import redis "code.weoa.com/Internal/weredis-client-go"
```

## Configuration Parameters

All parameters are in `redis.Options`:

### Required Parameters

| Parameter | Description |
|-----------|-------------|
| `ObserverDomain` | Observer URL, CMDB `[@系统ID-WEREDIS_OBSERVERS_DOMAIN]` |
| `ClusterName` | Target cluster name, CMDB `[@系统ID-REDIS_CLUSTER_集群号_NAME]` |
| `Username` | UM account (max 32 chars, no `:`) |
| `Password` | Account password |
| `AppPrvFile` / `AppPrvKey` | Application private key (file path or content) |

### Optional Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `InitServers` | - | Fallback proxy list |
| `PoolSize` | 16 | Connection pool size |
| `MinIdleConns` | - | Pre-established connections (recommended: PoolSize/2) |

### Standard go-redis Options

| Parameter | Default | Description |
|-----------|---------|-------------|
| `DialTimeout` | 5s | Connection dial timeout |
| `ReadTimeout` | 3s | Read timeout |
| `WriteTimeout` | 3s | Write timeout |
| `PoolTimeout` | 4s | Pool wait timeout |
| `MaxRetries` | 3 | Max retry attempts |

## Client Setup

### Basic Setup
```go
package main

import (
    "context"
    "fmt"
    "time"

    redis "code.weoa.com/Internal/weredis-client-go"
)

var ctx = context.Background()

func main() {
    client, err := redis.NewProxyClient(&redis.Options{
        ClusterName:    "your-cluster-name",
        ObserverDomain: "http://10.107.117.44:19091",
        Username:       "your-um-name",
        Password:       "your-password",
        ProxyPubKey:    "proxy-public-key",
        ReadTimeout:    time.Second * 2,
        MinIdleConns:   8,
    })
    if err != nil {
        panic(err)
    }
    defer client.Close()
}
```

### With Connection Pool Tuning
```go
client, err := redis.NewProxyClient(&redis.Options{
    ClusterName:    "your-cluster-name",
    ObserverDomain: "http://10.107.117.44:19091",
    Username:       "your-um-name",
    Password:       "{RSA}your-encrypted-password",
    ProxyPubKey:    "proxy-public-key",

    PoolSize:     32,
    MinIdleConns: 16,

    DialTimeout:   time.Second * 5,
    ReadTimeout:   time.Second * 3,
    WriteTimeout:  time.Second * 3,
    PoolTimeout:   time.Second * 4,
})
```

## Usage Examples

### Basic Commands
```go
// Set
err := client.Set(ctx, "key", "value", 0).Err()

// Set with expiration
err = client.Set(ctx, "key", "value", time.Hour).Err()

// Get
val, err := client.Get(ctx, "key").Result()
if err == redis.Nil {
    fmt.Println("key does not exist")
} else if err != nil {
    panic(err)
}

// Delete
client.Del(ctx, "key")

// Exists
n, _ := client.Exists(ctx, "key1", "key2").Result()
```

### Hash Operations
```go
client.HSet(ctx, "user:1", "name", "Alice", "age", 30)
client.HGet(ctx, "user:1", "name").Val()  // "Alice"
client.HGetAll(ctx, "user:1").Val()       // map[string]string
client.HIncrBy(ctx, "user:1", "age", 1)
```

### List Operations
```go
client.LPush(ctx, "queue", "item1", "item2")
client.RPush(ctx, "queue", "item3")
client.LPop(ctx, "queue").Val()
client.RPop(ctx, "queue").Val()
client.LRange(ctx, "queue", 0, -1).Val()
client.LLen(ctx, "queue").Val()
```

### Set Operations
```go
client.SAdd(ctx, "tags", "redis", "go", "cache")
client.SMembers(ctx, "tags").Val()
client.SIsMember(ctx, "tags", "redis").Val()
client.SRem(ctx, "tags", "cache")
```

### Sorted Set Operations
```go
client.ZAdd(ctx, "leaderboard", &redis.Z{Score: 100, Member: "player1"})
client.ZAdd(ctx, "leaderboard", &redis.Z{Score: 200, Member: "player2"})
client.ZRevRangeWithScores(ctx, "leaderboard", 0, 9).Val()
client.ZIncrBy(ctx, "leaderboard", 50, "player1")
```

### Blocking List Commands
```go
// BLPOP with 5 second timeout
result, err := client.BLPop(ctx, time.Second*5, "queue").Result()
if err != nil {
    panic(err)
}
fmt.Printf("Got from %s: %s\n", result[0], result[1])
```

### Pipeline
```go
pipe := client.Pipeline()

incr := pipe.Incr(ctx, "counter")
pipe.Expire(ctx, "counter", time.Hour)

// Execute all commands
_, err := pipe.Exec(ctx)
fmt.Println("Counter value:", incr.Val())
```

### Transaction (WATCH/MULTI/EXEC)
```go
err := client.Watch(ctx, func(tx *redis.Tx) error {
    n, err := tx.Get(ctx, "counter").Int()
    if err != nil && err != redis.Nil {
        return err
    }

    _, err = tx.TxPipelined(ctx, func(pipe redis.Pipeliner) error {
        pipe.Set(ctx, "counter", n+1, 0)
        return nil
    })
    return err
}, "counter")

if err == redis.TxFailedErr {
    // Optimistic lock lost, retry
}
```

### Pub/Sub
```go
// Subscribe
subscriber := client.SubscribeProxy(ctx, "channel1", "channel2")

// Get message channel
ch := subscriber.Channel()

// Publish in background
go func() {
    for i := 0; i < 10; i++ {
        client.Publish(ctx, "channel1", fmt.Sprintf("msg:%d", i))
        time.Sleep(time.Second)
    }
    subscriber.Close()
}()

// Receive messages
for msg := range ch {
    fmt.Printf("Received on %s: %s\n", msg.Channel, msg.Payload)
}
```

### Scan (Key Iteration)
```go
var cursor uint64
var keys []string
for {
    var batch []string
    var err error
    batch, cursor, err = client.Scan(ctx, cursor, "user:*", 100).Result()
    if err != nil {
        panic(err)
    }
    keys = append(keys, batch...)
    if cursor == 0 {
        break
    }
}
fmt.Printf("Found %d keys\n", len(keys))
```

### Lua Script
```go
script := redis.NewScript(`
    if redis.call("GET", KEYS[1]) ~= false then
        return redis.call("INCRBY", KEYS[1], ARGV[1])
    end
    return false
`)

result, err := script.Run(ctx, client, []string{"counter"}, 2).Result()
```

### Struct Scanning
```go
type User struct {
    Name string `redis:"name"`
    Age  int    `redis:"age"`
}

// Store struct as hash
user := User{Name: "Alice", Age: 30}
client.HSet(ctx, "user:1", &user)

// Scan hash into struct
var loadedUser User
result := client.HGetAll(ctx, "user:1")
if err := result.Scan(&loadedUser); err != nil {
    panic(err)
}
```

## Error Handling

```go
result, err := client.Get(ctx, "key").Result()
if err == redis.Nil {
    // Key doesn't exist
} else if err != nil {
    // Other error (connection, timeout, etc.)
    log.Printf("Redis error: %v", err)
}
```

## Context and Cancellation

```go
// With timeout
ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
defer cancel()
result, err := client.Get(ctx, "key").Result()

// With cancellation
ctx, cancel := context.WithCancel(context.Background())
go func() {
    time.Sleep(time.Second)
    cancel()  // Cancel after 1 second
}()
result, err := client.Get(ctx, "key").Result()
```

## Best Practices

1. **Keep client as singleton**: Create once, share across goroutines
2. **Set appropriate pool size**: `PoolSize` based on expected concurrency
3. **Use MinIdleConns**: Set to PoolSize/2 to reduce connection latency
4. **Handle redis.Nil**: Key not found is not an error, it's a normal case
5. **Use context**: Always pass context for timeout/cancellation support
6. **Close subscriber**: Always close pub/sub subscriber when done
