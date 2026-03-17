# WeRedis Spring Integration

WeRedis provides Spring integration through `weservice-weredis` module, which bridges Spring Data Redis operations to WeRedis client.

## Module Overview

| Module | Artifact | Description |
|--------|----------|-------------|
| Manual Config | `weservice-weredis` | Manual bean configuration |
| Auto Config | `weservice-weredis-spring-boot-starter` | Spring Boot auto-configuration |

Both modules are based on **Spring Data Redis** and **Lettuce (WeRedis 2.x)**.

## Option 1: Spring Boot Starter (Recommended)

### Add Dependency

```xml
<dependency>
  <groupId>cn.webank.weservice</groupId>
  <artifactId>weservice-weredis-spring-boot-starter</artifactId>
  <version>2.7.2</version>
</dependency>
```

### Configuration

**Local Development:**
```properties
weservice.weredis.enabled=true
weservice.weredis.observerDomain=10.107.117.44:19091
weservice.weredis.username=Redis-Cluster:1234
weservice.weredis.password=yourpassword
weservice.weredis.clusterName=RPD_GENERAL_REDIS_CLUSTER_CACHE
```

**Production (with CMDB variables):**
```properties
weservice.weredis.enabled=true
weservice.weredis.observerDomain=@1234-WEREDIS_OBSERVERS_DOMAIN
weservice.weredis.username=Redis-Cluster:1234
weservice.weredis.password={RSA}[%password]
weservice.weredis.clusterName=@1234-REDIS_CLUSTER_集群编号_NAME
weservice.weredis.initServers=@1234-REDIS_CLUSTER_集群编号_PROXY
weservice.weredis.privateKeyPath=classpath:my_private_file.pem
```

### Usage

**Inject `WeRedisConnectionFactory` (Spring Data Redis style):**

```java
@SpringBootApplication
public class MyApp implements CommandLineRunner {

    @Resource
    private WeRedisConnectionFactory connectionFactory;

    @Override
    public void run(String... args) {
        // Get connection - call each time for load balancing
        ProxyRedisConnectionWrapper conn = connectionFactory.getConnection();

        // Use Spring Data Redis commands
        RedisStringCommands stringCommands = conn.stringCommands();
        stringCommands.set("ORDER-SVC:key".getBytes(), "value".getBytes());
        byte[] value = stringCommands.get("ORDER-SVC:key".getBytes());
    }
}
```

**Inject `ProxyRedisClient` (Direct WeRedis API):**

```java
@Resource
private ProxyRedisClient<byte[], byte[]> proxyRedisClient;

public void doSomething() {
    ProxyRedisConnection<byte[], byte[]> conn = proxyRedisClient.getConnection();
    conn.sync().set("ORDER-SVC:key".getBytes(), "value".getBytes());
}
```

**Web Environment - Request-scoped Connection:**

In web apps, you can inject a request-scoped `ProxyRedisConnection`:

```java
@RestController
public class MyController {

    @Resource
    private ProxyRedisConnection<byte[], byte[]> connection;

    @GetMapping("/data")
    public String getData() {
        // Connection is automatically scoped to current HTTP request
        return connection.sync().get("ORDER-SVC:key".getBytes()).toString();
    }
}
```

## Option 2: Manual Configuration

### Add Dependency

```xml
<dependency>
  <groupId>cn.webank.weservice</groupId>
  <artifactId>weservice-weredis</artifactId>
  <version>2.7.2</version>
</dependency>
```

### Build Configuration

```java
RedisClientConfig clientConfig = RedisClientConfig.builder()
    .withObserverDomain("http://172.30.20.170:8080")
    .withClusterName("SIT_MIG01_REDIS_CLUSTER_CACHE")
    .withUsername("Redis-Cluster:5036")
    .withPassword("{RSA}xxxxx")
    .withAppPrivateFile("private.pem")
    .build();
```

### Create Factory

```java
@Configuration
public class WeRedisConfig {

    @Bean
    public WeRedisConnectionFactory weRedisConnectionFactory() throws Exception {
        RedisClientConfig config = RedisClientConfig.builder()
            .withObserverDomain("http://observer.example.com:19091")
            .withClusterName("RPD_GENERAL_REDIS_CLUSTER_CACHE")
            .withUsername("Redis-Cluster:5036")
            .withPassword("{RSA}xxxxx")
            .withAppPrivateFile("private.pem")
            .build();

        ClientResources resources = DefaultClientResources.create();
        WeRedisConnectionFactory factory = new WeRedisConnectionFactory(config, resources, 5000);
        factory.afterPropertiesSet(); // Initialize
        return factory;
    }
}
```

## Important Usage Patterns

### Correct Pattern - Get Connection Each Time

```java
public class OrderService {

    private WeRedisConnectionFactory connectionFactory;

    public void doSomething() {
        // CORRECT: Get connection each time for load balancing
        ProxyRedisConnectionWrapper connection = connectionFactory.getConnection();
        RedisStringCommands stringCommands = connection.stringCommands();
        stringCommands.set("ORDER-SVC:key".getBytes(), "value".getBytes());
        // No need to close connection explicitly
    }
}
```

### Wrong Pattern - Cache Connection as Field

```java
public class OrderService {

    private WeRedisConnectionFactory connectionFactory;

    // WRONG: Caching connection causes load imbalance
    private ProxyRedisConnectionWrapper connection = connectionFactory.getConnection();

    public void doSomething() {
        RedisStringCommands stringCommands = connection.stringCommands();
        stringCommands.set("ORDER-SVC:key".getBytes(), "value".getBytes());
    }
}
```

## Supported Command Interfaces

`ProxyRedisConnectionWrapper` supports these Spring Data Redis command interfaces:

| Interface | Description |
|-----------|-------------|
| `RedisStringCommands` | GET, SET, SETEX, etc. |
| `RedisHashCommands` | HGET, HSET, HGETALL, etc. |
| `RedisListCommands` | LPUSH, RPUSH, LPOP, RPOP, etc. |
| `RedisSetCommands` | SADD, SREM, SMEMBERS, etc. |
| `RedisZSetCommands` | ZADD, ZREM, ZRANGE, etc. |
| `RedisKeyCommands` | DEL, EXPIRE, TTL, etc. |

## Graceful Shutdown

`WeRedisConnectionFactory` implements `DisposableBean`. When managed by Spring, it automatically closes on context shutdown.

For manual management:
```java
factory.destroy();
```

## Configuration Properties Reference

| Property | Required | Description |
|----------|----------|-------------|
| `weservice.weredis.enabled` | Yes | Enable auto-configuration |
| `weservice.weredis.observerDomain` | Yes | Observer URL |
| `weservice.weredis.username` | Yes | UM account |
| `weservice.weredis.password` | Yes | Password (RSA encrypted in prod) |
| `weservice.weredis.clusterName` | Yes | Target cluster name |
| `weservice.weredis.initServers` | No | Fallback proxy list |
| `weservice.weredis.privateKeyPath` | No | RSA private key path |
