# WeRedis Java Client 1.x (Jedis) - Detailed Guide

WeRedis Java Client 1.x is based on Jedis, providing a synchronous blocking API that's simple and intuitive.

## Dependency

### Maven
```xml
<dependency>
  <groupId>com.webank.redis</groupId>
  <artifactId>redis-cluster-client</artifactId>
  <version>1.5.0</version>
</dependency>
```

### Gradle
```gradle
implementation 'com.webank.redis:redis-cluster-client:1.5.0'
```

## Configuration Parameters

All parameters are in `redis.clients.jedis.RedisClientConfig`:

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
| `appPrvFile` / `appPrvKey` | Application private key (file path or content) |
| `aompPubFile` / `aompPubKey` | AOMP public key (optional, built-in) |
| `proxyPubFile` / `proxyPubKey` | Proxy public key (optional, built-in) |

### Optional Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `initialServers` | - | Fallback proxy list, CMDB `[@系统ID-REDIS_CLUSTER_集群号_PROXY]` |
| `observerEnabled` | - | Set `true` for dev only, skips Observer discovery |
| `connectionTimeout` | 2000ms | Connection timeout |
| `socketTimeout` | 2000ms | Read timeout |
| `maxTotal` | 8 | Max connections in pool |
| `maxIdle` | 8 | Max idle connections |
| `minIdle` | 0 | Min idle connections |
| `maxWait` | -1 | Max wait time for connection (-1 = infinite) |
| `blockWhenExhausted` | true | Block when pool exhausted |

### IDC Awareness (Optional)

| Parameter | Default | Description |
|-----------|---------|-------------|
| `idc` | - | Current application IDC |
| `enableIdcAware` | false | Enable IDC-aware routing |

## Client Setup

### Basic Setup
```java
import redis.clients.jedis.RedisClientConfig;
import redis.clients.jedis.ProxyRedisClient;

RedisClientConfig config = RedisClientConfig.builder()
    .observerDomain("10.107.117.44:19091")
    .clusterName("SIT_MIG01_REDIS_CLUSTER_CACHE")
    .username("Redis-Cluster:1001")
    .password("xxxxx")
    .build();

ProxyRedisClient client = new ProxyRedisClient(config);
// Keep as global singleton - thread-safe
```

### With Connection Pool Tuning
```java
RedisClientConfig config = RedisClientConfig.builder()
    .observerDomain("10.107.117.44:19091")
    .clusterName("cluster-name")
    .username("Redis-Cluster:1001")
    .password("password")
    .maxTotal(32)
    .maxIdle(16)
    .minIdle(8)
    .maxWait(3000)  // Wait max 3s for connection
    .connectionTimeout(3000)
    .socketTimeout(3000)
    .build();
```

### Production Setup with Keys
```java
RedisClientConfig config = RedisClientConfig.builder()
    .observerDomain("@1234-WEREDIS_OBSERVERS_DOMAIN")
    .clusterName("@1234-REDIS_CLUSTER_1_NAME")
    .username("Redis-Cluster:1234")
    .password("{RSA}[%password]")
    .appPrivateFile("my_private.pem")  // In classpath
    .initServers("@1234-REDIS_CLUSTER_1_PROXY")
    .build();
```

### IDC-Aware Setup
```java
RedisClientConfig config = RedisClientConfig.builder()
    .observerDomain("...")
    .clusterName("...")
    .username("...")
    .password("...")
    .idc("GZ01")  // Your datacenter
    .enableIdcAware(true)
    .build();
```

## Usage Examples

### Basic Commands
```java
// String operations
client.set("key", "value");
String value = client.get("key");
client.del("key");
client.expire("key", 3600);

// Hash operations
client.hset("user:1", "name", "Alice");
client.hset("user:1", "age", "30");
Map<String, String> user = client.hgetAll("user:1");

// List operations
client.lpush("queue", "item1", "item2");
String item = client.rpop("queue");

// Set operations
client.sadd("tags", "redis", "java", "cache");
Set<String> tags = client.smembers("tags");

// Sorted set operations
client.zadd("leaderboard", 100, "player1");
List<String> top = client.zrevrange("leaderboard", 0, 9);
```

### Pipeline
```java
try (Pipeline pipeline = client.pipelined()) {
    pipeline.set("key1", "value1");
    pipeline.set("key2", "value2");
    pipeline.get("key1");
    pipeline.get("key2");
    List<Object> results = pipeline.syncAndReturnAll();
    // results[0] = "OK", results[1] = "OK"
    // results[2] = "value1", results[3] = "value2"
}
```

### Transaction
```java
Transaction tx = client.multi();
try {
    tx.set("key1", "value1");
    tx.set("key2", "value2");
    tx.exec();
} catch (Exception e) {
    tx.discard();
}
```

### Pub/Sub (Non-Blocking!)

Unlike native Jedis, WeRedis subscribe is **non-blocking**:

```java
// Subscribe - returns immediately, doesn't block thread
client.subscribe(new JedisPubSub() {
    @Override
    public void onMessage(String channel, String message) {
        System.out.println("Received: " + message);
    }

    @Override
    public void onSubscribe(String channel, int subscribedChannels) {
        System.out.println("Subscribed to: " + channel);
    }
}, "my-channel");

// Code continues executing here!
System.out.println("Subscription started");

// Publish messages
client.publish("my-channel", "Hello World");
```

### Blocking List Commands
```java
// BLPOP with 5 second timeout
List<String> result = client.blpop(5, "my-queue");
if (result != null) {
    System.out.println("Got: " + result.get(1));
}
```

## Resource Management

- **No need to close after each command** - connection is returned to pool automatically
- **Close only on application shutdown**:

```java
// In your shutdown hook or @PreDestroy
client.close();
```

## Exception Handling

All exceptions are runtime exceptions:

```java
import redis.clients.jedis.exceptions.JedisConnectionException;
import redis.clients.jedis.exceptions.JedisDataException;

try {
    client.get("key");
} catch (JedisConnectionException e) {
    // Connection issues - network, timeout, etc.
} catch (JedisDataException e) {
    // Redis data errors - wrong type, etc.
}
```

## Logging Bridge

The client uses slf4j. Add appropriate bridge:

- **logback**: No action needed
- **log4j2**: Add `log4j-slf4j-impl.jar`
- **log4j**: Add `slf4j-log4j12.jar`
- **JCL**: Add `slf4j-jcl.jar`

## Spring Integration Example

```java
@Configuration
public class RedisConfig {

    @Value("${redis.observerDomain}")
    private String observerDomain;

    @Value("${redis.clusterName}")
    private String clusterName;

    @Value("${redis.username}")
    private String username;

    @Value("${redis.password}")
    private String password;

    @Bean(destroyMethod = "close")
    public ProxyRedisClient proxyRedisClient() {
        RedisClientConfig config = RedisClientConfig.builder()
            .observerDomain(observerDomain)
            .clusterName(clusterName)
            .username(username)
            .password(password)
            .maxTotal(16)
            .maxIdle(8)
            .build();
        return new ProxyRedisClient(config);
    }
}
```

## Common Pitfalls

1. **Creating multiple client instances**: Use singleton pattern
2. **Not closing on shutdown**: Add shutdown hook
3. **Blocking on subscribe**: Remember it's non-blocking in WeRedis
4. **Connection pool exhaustion**: Tune `maxTotal` and `maxWait` appropriately
