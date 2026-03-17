# WeRedis 故障排查指南

本文档包含 WeRedis 套用的常见错误码、故障排查和最佳实践。

## 错误码参考

WeRedis Proxy 返回特定错误码，用于访问控制和限流。请根据错误类型在应用中适当处理。

| 错误码 | 描述 | 解决方案 |
|-------|------|----------|
| `ACCESS_DENY` | 只能访问本子系统写入的KEY | 确保KEY由本子系统写入，或申请跨子系统访问权限 |
| `LIMIT_RATE` | 请求被限流 | 检查TPS是否超过申请限制，必要时提单扩容 |
| `ACCOUNT_FORBID` | 该子系统无权访问该集群 | 提交ITSM申请接入该集群 |
| `NOT_SUPPORT` | 命令不支持 | 检查命令是否在支持列表内，部分命令被禁用 |
| `CONNECT_LIMIT` | 连接数超限 | 检查连接池配置，减少连接数或申请扩容 |
| `TOO_LARGE` | KEY/VALUE太大 | 单个VALUE不超过1MB，考虑拆分大数据 |
| `KEY_FORMAT` | KEY格式错误 | KEY必须遵循 `<systemId>:<realKey>` 格式 |
| `CLIENT_FORBID` | 客户端版本过低 | 升级客户端到最新版本 |

## 详细故障排查

### ACCESS_DENY - 访问权限错误

**现象**: 返回错误 `ACCESS_DENY: Can't access namespace`

**原因**: WeRedis 实现了子系统级别的数据隔离，每个子系统只能访问自己写入的 KEY。

**解决方案**:
1. 确认 KEY 是由当前子系统写入的
2. 如果需要访问其他子系统的数据，需要：
   - 联系数据拥有方子系统授权
   - 或通过服务接口方式访问，而非直接访问 Redis

```java
// 错误示例：尝试访问其他子系统的KEY
client.get("other-system:user:123");  // ACCESS_DENY

// 正确示例：使用本子系统的KEY
client.get("my-system:user:123");     // OK
```

### LIMIT_RATE - 限流错误

**现象**: 返回错误 `LIMIT_RATE: exceed tps limit`

**原因**: 当前实例的 TPS 超过了 ITSM 申请时填写的单实例 TPS 限制。

**解决方案**:
1. 检查应用是否有流量突增
2. 优化 Redis 使用，减少不必要的调用
3. 使用 Pipeline 批量操作减少请求数
4. 如确需更高 TPS，提交 ITSM 申请扩容

```java
// 使用 Pipeline 减少请求数
Pipeline pipeline = client.pipelined();
for (int i = 0; i < 100; i++) {
    pipeline.set("key:" + i, "value:" + i);
}
pipeline.syncAndReturnAll();  // 一次网络往返完成100个操作
```

### ACCOUNT_FORBID - 账号无权访问

**现象**: 返回错误 `ACCOUNT_FORBID: Invalid account name`

**原因**: 当前子系统未申请接入该 Redis 集群。

**解决方案**:
1. 确认 `clusterName` 配置正确
2. 提交 ITSM 申请接入目标集群
3. 申请时需要填写预估 TPS

### NOT_SUPPORT - 命令不支持

**现象**: 返回错误 `NOT_SUPPORT: command not supported`

**原因**: WeRedis Proxy 禁用了部分 Redis 命令。

**常见不支持命令**:
- 管理类命令: `CONFIG`, `DEBUG`, `SHUTDOWN`, `FLUSHALL`, `FLUSHDB`
- 危险命令: `KEYS` (大数据量时), `MONITOR`
- 集群相关: `CLUSTER`, `MOVED`, `ASK`

**解决方案**:
1. 检查是否使用了禁用命令
2. 使用替代方案，如用 `SCAN` 代替 `KEYS`
3. 如确有需要，联系 WeRedis 团队评估

```java
// 错误示例
client.keys("*");  // NOT_SUPPORT

// 正确示例：使用 SCAN
ScanParams params = new ScanParams().match("prefix:*").count(100);
String cursor = "0";
do {
    ScanResult<String> result = client.scan(cursor, params);
    List<String> keys = result.getResult();
    cursor = result.getCursor();
    // 处理 keys
} while (!cursor.equals("0"));
```

### CONNECT_LIMIT - 连接数超限

**现象**: 连接失败或超时，日志显示 `CONNECT_LIMIT`

**原因**: 连接数超过限制，可能是子系统级别或 Proxy 全局限制。

**解决方案**:
1. 检查连接池配置是否合理
2. 确保连接正确归还连接池
3. 避免创建多个 Client 实例

```java
// 推荐连接池配置
RedisClientConfig config = RedisClientConfig.builder()
    // ...
    .maxTotal(16)      // 最大连接数，根据实际需求配置
    .maxIdle(8)        // 最大空闲连接
    .minIdle(4)        // 最小空闲连接
    .build();
```

**C/C++ 注意**:
```c
redisClientConfig config = {
    // ...
    .active_num = 16,  // 连接池大小，默认32，最大32
};

// 确保归还连接
redisContext *ctx = getConnection(client);
// ... 使用连接
returnConnection(client, ctx);  // 必须归还！
```

### TOO_LARGE - 数据过大

**现象**: 返回错误 `TOO_LARGE: command is too large`

**原因**: 单个 KEY 或 VALUE 超过大小限制（通常为 1MB）。

**解决方案**:
1. 拆分大 VALUE 为多个小 VALUE
2. 使用 Hash 结构存储大对象
3. 考虑使用压缩

```java
// 错误示例：存储大对象
String bigJson = largeObjectToJson(bigObject);  // 可能超过1MB
client.set("big-key", bigJson);  // TOO_LARGE

// 正确示例：使用 Hash 拆分
Map<String, String> fields = objectToMap(bigObject);
client.hset("big-key", fields);

// 或分片存储
int chunkSize = 500 * 1024;  // 500KB per chunk
for (int i = 0; i < totalChunks; i++) {
    String chunk = getChunk(data, i, chunkSize);
    client.set("big-key:" + i, chunk);
}
client.set("big-key:meta", metadata);
```

### KEY_FORMAT - KEY 格式错误

**现象**: 返回错误 `KEY_FORMAT: KEY's format is invalid, <systemId>:<realKey>`

**原因**: KEY 未遵循 WeRedis 要求的命名格式。

**KEY 命名规范**:
- 格式: `<systemId>:<realKey>`
- `systemId`: 子系统标识，与接入申请一致
- `realKey`: 实际业务 KEY

**解决方案**:
```java
// 错误示例
client.set("user:123", "data");           // KEY_FORMAT
client.set("123:user", "data");           // KEY_FORMAT

// 正确示例
String systemId = "ORDER-SVC";            // 子系统ID
client.set(systemId + ":user:123", "data");  // OK
client.set("ORDER-SVC:order:20240001", orderJson);  // OK

// 建议封装工具方法
public class RedisKeyUtil {
    private static final String SYSTEM_ID = "ORDER-SVC";

    public static String key(String realKey) {
        return SYSTEM_ID + ":" + realKey;
    }
}

// 使用
client.set(RedisKeyUtil.key("user:123"), "data");
```

### CLIENT_FORBID - 客户端版本限制

**现象**: 返回错误 `CLIENT_FORBID: Client version had been forbid`

**原因**: 客户端版本过低，存在已知问题或安全漏洞。

**解决方案**: 升级客户端到最新版本

```xml
<!-- Java 1.x (Jedis) -->
<dependency>
  <groupId>com.webank.redis</groupId>
  <artifactId>redis-cluster-client</artifactId>
  <version>1.5.0</version>  <!-- 升级到最新版本 -->
</dependency>

<!-- Java 2.x (Lettuce) -->
<dependency>
  <groupId>cn.webank.redis</groupId>
  <artifactId>redis-cluster-client</artifactId>
  <version>2.4.0</version>  <!-- 升级到最新版本 -->
</dependency>
```

```bash
# Go
go get code.weoa.com/Internal/weredis-client-go@latest

# C/C++ - 重新编译最新版本
git pull && mkdir build && cd build && cmake .. && make install
```

## 错误处理最佳实践

### Java (Jedis)

```java
try {
    String value = client.get("my-system:key");
} catch (JedisDataException e) {
    String message = e.getMessage();

    if (message.contains("ACCESS_DENY")) {
        log.error("访问权限错误，请检查KEY归属子系统");
    } else if (message.contains("LIMIT_RATE")) {
        log.warn("触发限流，稍后重试");
    } else if (message.contains("KEY_FORMAT")) {
        log.error("KEY格式错误，必须遵循 <systemId>:<realKey> 格式");
    } else if (message.contains("TOO_LARGE")) {
        log.error("数据过大，请拆分后存储");
    } else {
        log.error("Redis操作失败: {}", message);
        throw e;
    }
}
```

### Go

```go
result, err := client.Get(ctx, "my-system:key").Result()
if err != nil {
    errMsg := err.Error()

    switch {
    case strings.Contains(errMsg, "ACCESS_DENY"):
        log.Error("访问权限错误")
    case strings.Contains(errMsg, "LIMIT_RATE"):
        log.Warn("触发限流")
    case strings.Contains(errMsg, "KEY_FORMAT"):
        log.Error("KEY格式错误")
    case strings.Contains(errMsg, "TOO_LARGE"):
        log.Error("数据过大")
    case err == redis.Nil:
        // KEY不存在，正常情况
    default:
        log.Errorf("Redis错误: %v", err)
    }
}
```

### C/C++

```c
redisReply *reply = redisCommand(ctx, "GET my-system:key");
if (reply == NULL) {
    fprintf(stderr, "连接错误\n");
} else if (reply->type == REDIS_REPLY_ERROR) {
    if (strstr(reply->str, "ACCESS_DENY") != NULL) {
        fprintf(stderr, "访问权限错误\n");
    } else if (strstr(reply->str, "LIMIT_RATE") != NULL) {
        fprintf(stderr, "触发限流\n");
    } else if (strstr(reply->str, "KEY_FORMAT") != NULL) {
        fprintf(stderr, "KEY格式错误\n");
    } else {
        fprintf(stderr, "Redis错误: %s\n", reply->str);
    }
}
freeReplyObject(reply);
```

## 连接问题排查

### 无法连接到 Observer

**症状**: 客户端初始化失败，无法获取 proxy 列表

**排查步骤**:
1. 检查网络连通性: `ping observer域名`
2. 检查端口是否正确 (默认 19091)
3. 检查 `observerDomain` 配置是否包含 `http://` 匀
4. 确认集群名是否正确

5. 检查是否有防火墙规则阻止

### 连接超时

**症状**: 获取连接超时

**排查步骤**:
1. 检查 `connectTimeout` 设置是否过小
2. 检查网络延迟
3. 检查 Proxy 节点是否正常
4. 使用 `initServers` 配置兜底地址测试

### 读写超时

**症状**: 命令执行超时

**排查步骤**:
1. 检查 `soTimeout`/`readTimeout` 设置
2. 检查命令复杂度是否过高
3. 检查 value 大小是否超过限制
4. 考虑使用 Pipeline 减少网络往返

## 性能优化建议

### 使用 Pipeline 提升吞吐量

对于批量操作，使用 Pipeline 可以显著减少网络往返次数：

```java
// 不使用 Pipeline - 每个命令一次网络往返
for (int i = 0; i < 100; i++) {
    client.set("key:" + i, "value:" + i);
}

// 使用 Pipeline - 一次网络往返
Pipeline pipeline = client.pipelined();
for (int i = 0; i < 100; i++) {
    pipeline.set("key:" + i, "value:" + i);
}
pipeline.syncAndReturnAll();
```

### 合理设置连接池

根据实际并发量调整连接池大小

```java
RedisClientConfig config = RedisClientConfig.builder()
    // ...
    .maxTotal(16)      // 最大连接数
    .maxIdle(8)        // 最大空闲连接
    .minIdle(4)        // 最小空闲连接（预热）
    .maxWait(3000)    // 获取连接最大等待时间
    .build();
```

### 使用 Hash 代替大 String

对于对象存储，使用 Hash 结构更灵活

```java
// 不推荐：大 JSON 字符串
String userJson = objectMapper.writeValueAsString(user);
client.set("user:123", userJson);

// 推荐：Hash 结构
client.hset("user:123", "name", user.getName());
client.hset("user:123", "email", user.getEmail());
client.hset("user:123", "age", String.valueOf(user.getAge()));
```

### 设置合理的 TTL

避免数据长期占用内存

```java
// 设置 TTL
client.setex("cache:user:123", 3600, "data");  // 1小时过期
client.expire("session:abc", 1800);  // 30分钟过期
```
