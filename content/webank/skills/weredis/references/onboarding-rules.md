# WeRedis 接入规范

**重要：在使用 WeRedis 前请仔细阅读以下规范！**

## 接入前必读

### 1. 必须有兜底方案

WeRedis 集群是分布式缓存数据库，主从同步是异步模式。当集群中主节点所在机器故障时，会发生主备切换，可能导致：
- 集群 30s 不可用
- 最近 10s 内的数据丢失

**接入的系统必须有兜底方案**：
- 重试机制
- DB 兜底
- Bypass 模式

### 2. 预估请求量

需要给出：
- 吞吐量 (TPS)
- 峰值并发
- 预计 1 年内存使用量

**产品推广前务必联系 DBA 评估！**

容量估算参考: https://zeromake.github.io/rediscn/redis_memory/

### 3. 共享集群 vs 独占集群

| 类型 | 说明 | 适用场景 |
|------|------|----------|
| 共享集群 | 默认接入，每个应用域一套 | 一般业务场景 |
| 独占集群 | 需单独申请 | 非自营法人、跨子系统共享KEY、需突破大小限制 |

## KEY 设计规范

### 命名格式

```
<systemId>:<realKey>
```

| 规则 | 要求 |
|------|------|
| **前缀** | 必须以 `systemId` 为前缀 |
| **测试环境** | 需附加环境号 `systemId:env` |
| **格式** | `<systemId>:<realKey>` |
| **分隔符** | 使用 `:` 分隔 |

### 禁止字符

- `{Tag}` - Redis 处理 Tag 只会按 Tag 内的值计算 hash，导致数据分布严重不均衡
- 迁移内部关键字: `PROCESSING_TRIGGER`, `MIGRATION_LOCK`, `MIGRATION_TRIGGER`, `SKIPPED_SHADOW`

### 大小限制

| 限制项 | 阈值 |
|--------|------|
| 单个 VALUE | ≤ 100KB |
| 单次操作 KEY 长度 | ≤ 1K |

### TTL 要求

- **必须设置 TTL**
- TTL 不超过 7 天

## Big Key 规范

以下情况会被定期扫描并要求整改：

| 指标 | 阈值 |
|------|------|
| 单个 KEY 大小 | > 10MB |
| 集合类型元素个数 | > 10000 |
| TTL | 未设置 或 > 7 天 |

## 连接数规范

### 单实例最大连接数

```
min(16, cpu核数 * 2)
```

### 推荐配置

| 语言 | 客户端版本 | 连接池大小 |
|------|-----------|-----------|
| Java | 1.x (Jedis) | maxTotal=16 |
| Java | 2.x (Lettuce) | 复用连接，连接数更低 |
| Go | weredis-client-go | PoolSize=16 |
| C/C++ | weredis-client-c | active_num=16 |

**推荐使用 Java 2.x (Lettuce)** - 通过复用线程安全连接对象可大幅降低连接数。

## Pipeline 规范

Pipeline 长度建议控制在 **20** 以内。

## 命令支持

### 不支持的命令

| 类别 | 命令 |
|------|------|
| 系统指令 | INFO, FLUSHDB, SHUTDOWN, CONFIG, DEBUG |
| Cluster 指令 | CLUSTER FAILOVER 等 |
| 危险指令 | KEYS（支持 SCAN，仅测试环境） |
| 阻塞指令 | BRPOPLPUSH（支持 BRPOP, BLPOP） |
| 事务指令 | MULTI, EXEC, WATCH |
| 脚本指令 | EVAL, EVALSHA |
| 多 KEY 指令 | MSET, MSETNX, MGET, SDIFFSTORE, SINTERSTORE, SUNIONSTORE, ZDIFFSTORE, ZINTERSTORE, ZUNIONSTORE, ZRANGESTORE |

### 支持的命令

- 所有单 KEY 操作: GET, SET, HGET, HSET, LPUSH, RPUSH, SADD, ZADD 等
- 阻塞操作: BRPOP, BLPOP
- SCAN（仅测试环境）

## 跨子系统访问

| 场景 | 解决方案 |
|------|----------|
| 独占集群 | 提单开通白名单 |
| 共享集群 | 业务侧公用同一个 UM 账户 |

**共享集群跨系统访问示例**:
- 子系统 1234 和 5678 需互相访问数据
- 两个子系统公用一个 UM 账户
- 共同以该子系统 ID 为前缀写入读取数据
- 数据隔离性由业务侧保证

## 接入流程

### Step 1: 申请子系统 UM 账户

| 环境 | 链接 |
|------|------|
| 测试环境 | [UM账号创建](https://itsm.weoa.com/itsm/web/index.html#/requestEdit?param=%7B%22teamId%22%3A103%7D) |
| 生产环境 | [UM账号创建](https://itsm.weoa.com/itsm/web/index.html#/requestEdit?param=%7B%22teamId%22%3A103%7D) |

### Step 2: 提交 WeRedis 接入申请

| 环境 | 链接 |
|------|------|
| 测试环境 | [接入申请](https://itsm.weoa.com/itsm/web/index.html#/requestEdit?param=%7B%22teamId%22%3A1084%7D) |
| 生产环境 | [接入申请](https://itsm.weoa.com/itsm/web/index.html#/requestEdit?param=%7B%22teamId%22%3A1085%7D) |

### Step 3: 填写接入问卷

- [接入问卷](http://docs.weoa.com/sheets/gO3oxO60a7CPKZqD/3Gq48)
- [机器成本预估](http://docs.weoa.com/uploader/f/2twnPj1kZgDVa5E7.xlsx)

## 大批量操作需评估

以下操作需提前联系 DBA 评估：

- 大批量数据导入、删除
- 时间复杂度高的操作（如 del 大 key）
- 大批量 key 过期或大 key 过期
