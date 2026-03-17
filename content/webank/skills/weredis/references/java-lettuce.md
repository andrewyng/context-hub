# WeRedis Java Client 2.x (Lettuce) - Detailed Guide

WeRedis Java Client 2.x is based on Lettuce, providing synchronous, asynchronous, and reactive APIs.

## Dependency

### Maven
```xml
<dependency>
  <groupId>cn.webank.redis</groupId>
  <artifactId>redis-cluster-client</artifactId>
  <version>2.4.0</version>
</dependency>
```

### Gradle
```gradle
implementation 'cn.webank.redis:redis-cluster-client:2.4.0'
```

## Configuration Parameters

All parameters are in `cn.webank.redis.client.RedisClientConfig`:

### Required Parameters

| Parameter | Description |
|-----------|-------------|
| `observerDomain` | Observer URL, CMDB `[@系统ID-WEREDIS_OBSERVERS_DOMAIN]` |
| `username` | Format: `[Redis-Cluster:系统ID:账号]`, max 32 chars, no `:` |
| `password` | Account password |
| `clusterName` | CMDB `[@系统ID-REDIS_CLUSTER_集群号_NAME]` |

### Key Files (one of each pair required)

| Parameter | Description |
|-----------|-------------|
| `appPrvFile` / `appPrvKey` | Application private key |
| `aompPubFile` / `aompPubKey` | AOMP public key (optional, built-in) |
| `proxyPubFile` / `proxyPubKey` | Proxy public key (optional, built-in) |

### Optional Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `initialServers` | - | Fallback proxy list |
| `observerEnabled` | - | Set `true` for dev only |
| `connectionTimeout` | 1000ms | Connection timeout |
| `timeoutOptions` | - | Per-command timeout config |
| `observerConnectTimeout` | - | Observer connection timeout |
| `observerSoTimeout` | - | Observer read timeout |

### IDC Awareness

| Parameter | Default | Description |
|-----------|---------|-------------|
| `idc` | - | Current application IDC |
| `enableIdcAware` | false | Enable IDC-aware routing |

## Client Setup

### Basic Setup
```java
import cn.webank.redis.client.ProxyRedisClient;
import cn.webank.redis.client.RedisClientConfig;

RedisClientConfig config = RedisClientConfig.builder()
    .observerDomain("http://10.107.117.44:19091")
    .clusterName("SIT_MIG01_REDIS_CLUSTER_CACHE")
    .username("Redis-Cluster:1001")
    .password("xxxxx")
    .build();

ProxyRedisClient<String, String> client = new ProxyRedisClient<>(config);
```

### With Custom Timeout Options
```java
import io.lettuce.core.TimeoutOptions;
import java.time.Duration;

// Different timeouts for different commands
TimeoutOptions timeoutOptions = TimeoutOptions.builder()
    .timeoutSource(new TimeoutOptions.TimeoutSource() {
        @Override
        public long getTimeout(RedisCommand<?, ?, ?> command) {
            // Longer timeout for heavy commands
            if (command.getType() == CommandType.HGETALL ||
                command.getType() == CommandType.SMEMBERS) {
                return 5000;
            }
            return 2000;
        }
    })
    .build();

// Or simple fixed timeout
TimeoutOptions fixedTimeout = TimeoutOptions.builder()
    .fixedTimeout(Duration.ofMillis(2000))
    .build();

RedisClientConfig config = RedisClientConfig.builder()
    .observerDomain("...")
    .clusterName("...")
    .username("...")
    .password("...")
    .timeoutOptions(timeoutOptions)
    .build();
```

### With Custom Codec
```java
import io.lettuce.core.codec.RedisCodec;
import io.lettuce.core.codec.StringCodec;
import io.lettuce.core.codec.ByteArrayCodec;

// String key, byte[] value
ProxyRedisClient<String, byte[]> client = new ProxyRedisClient<>(
    config,
    ClientResources.create(),
    RedisCodec.of(StringCodec.UTF8, ByteArrayCodec.INSTANCE)
);
```

### With Custom ClientResources
```java
import io.lettuce.core.resource.DefaultClientResources;
import io.lettuce.core.event.DefaultEventPublisherOptions;
import io.lettuce.core.metrics.DefaultCommandLatencyCollectorOptions;

DefaultClientResources clientResources = DefaultClientResources.builder()
    .commandLatencyPublisherOptions(
        DefaultEventPublisherOptions.builder()
            .eventEmitInterval(Duration.ofSeconds(3))
            .build()
    )
    .commandLatencyCollectorOptions(
        DefaultCommandLatencyCollectorOptions.builder()
            .localDistinction(true)
            .targetUnit(TimeUnit.MILLISECONDS)
            .build()
    )
    .build();

ProxyRedisClient<String, String> client = new ProxyRedisClient<>(
    config,
    clientResources,
    RedisCodec.of(StringCodec.UTF8, StringCodec.UTF8)
);
```

## API Usage

### Getting Connection
```java
// Get connection - call each time for load balancing
ProxyRedisConnection<String, String> connection = client.getConnection();
```

**CRITICAL**: Do NOT store connection as a member variable!

```java
// WRONG - causes load imbalance
public class OrderService {
    private ProxyRedisConnection<String, String> conn = client.getConnection();

    public String getOrder(String id) {
        return conn.sync().get(id);  // Always hits same proxy!
    }
}

// CORRECT - get connection each time
public class OrderService {
    private ProxyRedisClient<String, String> client;

    public String getOrder(String id) {
        ProxyRedisConnection<String, String> conn = client.getConnection();
        return conn.sync().get(id);  // Distributed across proxies
    }
}
```

### Synchronous API
```java
ProxyRedisConnection<String, String> conn = client.getConnection();
ProxyCommands<String, String> sync = conn.sync();

// Basic operations
sync.set("key", "value");
String value = sync.get("key");
sync.del("key");

// Hash operations
sync.hset("user:1", "name", "Alice");
sync.hset("user:1", "age", "30");
Map<String, String> user = sync.hgetall("user:1");

// Expiration
sync.expire("key", 60);  // 60 seconds
```

### Asynchronous API
```java
ProxyRedisConnection<String, String> conn = client.getConnection();
ProxyAsyncCommands<String, String> async = conn.async();

// Basic async operations
RedisFuture<String> future = async.get("key");

// With callback
future.whenComplete((value, throwable) -> {
    if (throwable != null) {
        System.err.println("Error: " + throwable.getMessage());
    } else {
        System.out.println("Value: " + value);
    }
});

// Wait for multiple futures
List<RedisFuture<?>> futures = new ArrayList<>();
for (int i = 0; i < 10; i++) {
    futures.add(async.set("key" + i, "value" + i));
}
LettuceFutures.awaitAll(Duration.ofSeconds(10), futures.toArray(new RedisFuture[0]));
```

### Reactive API (Project Reactor)
```java
ProxyRedisConnection<String, String> conn = client.getConnection();
ProxyReactiveCommands<String, String> reactive = conn.reactive();

// Mono - single result
Mono<String> mono = reactive.get("key");
mono.subscribe(value -> System.out.println("Got: " + value));

// Flux - multiple results
Flux<KeyValue<String, String>> flux = reactive.hgetall("user:1");
flux.subscribe(kv -> System.out.println(kv.getKey() + " = " kv.getValue()));

// Streaming with callback
AtomicInteger count = new AtomicInteger();
Mono<Long> countMono = reactive.hgetall((key, value) -> {
    System.out.println(key + " = " + value);
    count.incrementAndGet();
}, "user:1");
countMono.block();
```

## Pipeline

```java
ProxyRedisConnection<String, String> conn = client.getConnection();

// Async pipeline
ProxyAsyncCommands<String, String> async = conn.async();
async.setAutoFlushCommands(false);  // Disable auto-flush

async.set("key1", "value1");
async.set("key2", "value2");
async.get("key1");
async.get("key2");

async.flushCommands();  // Send all at once

// Results are available via futures
```

## Pub/Sub

```java
// Create pub/sub connection
ProxyPubSubConnection<String, String> pubsub = client.connectProxyPubSub();

// Add listener
pubsub.addListener(new RedisPubSubAdapter<String, String>() {
    @Override
    public void message(String channel, String message) {
        System.out.println("Received on " + channel + ": " + message);
    }

    @Override
    public void subscribed(String channel, long count) {
        System.out.println("Subscribed to " + channel);
    }
});

// Subscribe (async)
pubsub.async().subscribe("channel1", "channel2");

// Publish
pubsub.sync().publish("channel1", "Hello World");

// Unsubscribe
pubsub.async().unsubscribe("channel1");

// Close when done
pubsub.close();
```

## Transaction

```java
ProxyRedisConnection<String, String> conn = client.getConnection();

// Multi/Exec transaction
conn.sync().multi();
conn.sync().set("key1", "value1");
conn.sync().set("key2", "value2");
TransactionResult result = conn.sync().exec();
```

## Streaming Large Results

For commands returning large collections, use streaming to avoid memory issues:

```java
ProxyRedisConnection<String, String> conn = client.getConnection();

// Stream HGETALL results
AtomicInteger count = new AtomicInteger();
RedisFuture<Long> future = conn.async().hgetall((key, value) -> {
    processEntry(key, value);
    count.incrementAndGet();
}, "large-hash");

future.await(10, TimeUnit.SECONDS);
System.out.println("Processed " + count.get() + " entries");

// Stream SMEMBERS results
conn.async().smembers(new ValueStreamingChannel<String>() {
    @Override
    public void onValue(String value) {
        processMember(value);
    }
}, "large-set");
```

## Exception Handling

```java
import cn.webank.redis.client.exception.RedisClientException;

try {
    conn.sync().get("key");
} catch (RedisClientException e) {
    // Handle WeRedis client exceptions
}
```

## Resource Management

```java
// Connections don't need explicit close
ProxyRedisConnection<String, String> conn = client.getConnection();
conn.sync().get("key");
// No need to call conn.close()

// Close client on shutdown
client.close();  // Also closes ClientResources if created internally
```

## Spring Integration

```java
@Configuration
public class RedisConfig {

    @Bean(destroyMethod = "close")
    public ProxyRedisClient<String, String> proxyRedisClient(
            @Value("${redis.observerDomain}") String observerDomain,
            @Value("${redis.clusterName}") String clusterName,
            @Value("${redis.username}") String username,
            @Value("${redis.password}") String password) {

        RedisClientConfig config = RedisClientConfig.builder()
            .observerDomain(observerDomain)
            .clusterName(clusterName)
            .username(username)
            .password(password)
            .build();

        return new ProxyRedisClient<>(config);
    }
}

@Service
public class CacheService {

    private final ProxyRedisClient<String, String> client;

    public CacheService(ProxyRedisClient<String, String> client) {
        this.client = client;
    }

    public String getValue(String key) {
        // Get fresh connection for each operation
        return client.getConnection().sync().get(key);
    }

    public CompletableFuture<String> getValueAsync(String key) {
        RedisFuture<String> future = client.getConnection().async().get(key);
        return future.toCompletableFuture();
    }
}
```

## Common Pitfalls

1. **Storing connection as member variable**: Causes load imbalance
2. **Not closing client on shutdown**: Resource leak
3. **Blocking on async operations**: Defeats the purpose of async
4. **Missing slf4j bridge**: No logs from client
5. **Timeout too short for heavy commands**: Use `TimeoutOptions` for HGETALL, SMEMBERS, etc.
