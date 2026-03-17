---
name: weredis
description: |
  WeRedis client and onboarding guide. Covers SDK clients (Java Jedis/Lettuce, Go, C/C++),
  HTTP protocol access, Spring Boot integration, and custom modules: atomic operations,
  rate limiting, circuit breaker, TairString (versioned string with CAS/CAD) and
  TairHash (field-level expiration).

  Trigger on: weredis接入, redis proxy/observer, WeRedisConnectionFactory, weservice-weredis,
  ACCESS_DENY, LIMIT_RATE, ACCOUNT_FORBID, TOO_LARGE, distributed lock, rate limiter, circuit breaker,
  or any WeRedis-specific configuration questions.
metadata:
  revision: 1
  updated-on: "2026-03-17"
  source: maintainer
  tags: "weredis,redis,webank,java,go,cpp,spring"
---

# WeRedis Client Usage Guide

WeRedis is an enterprise Redis proxy platform that provides automatic proxy discovery, connection pooling, and failover. This skill covers all client implementations and integration options.

## Quick Client Selection

| Type | Language/Platform | Base Library | Best For |
|------|-------------------|--------------|----------|
| SDK | Java 1.x | Jedis | Sync/blocking API, simple use cases |
| SDK | Java 2.x | Lettuce | Async/reactive API, high throughput |
| SDK | Go | go-redis v7 | Go services |
| SDK | C/C++ | hiredis | Native/C applications |
| HTTP | Any | HTTP client | Languages without SDK, ClientLess access |
| Spring | Java | weservice-weredis-starter | Spring Boot auto-configuration |

## Core Configuration Parameters

All clients share these required parameters:

| Parameter | Description | Source |
|-----------|-------------|--------|
| `observerDomain` | Observer service URL | CMDB `[@系统ID-WEREDIS_OBSERVERS_DOMAIN]` |
| `clusterName` | Target cluster name | CMDB `[@系统ID-REDIS_CLUSTER_集群号_NAME]` |
| `username` | UM account (max 32 chars, no `:`) | ITSM application |
| `password` | Account password | ITSM application |

**Local dev**: Use `http://10.107.117.44:19091` for observerDomain
**Production**: Use CMDB variables and RSA-encrypted passwords

## Client Setup Overview

| Type | Version | Dependency | Key Notes |
|------|---------|------------|-----------|
| Java (Jedis) | 1.5.0 | `com.webank.redis:redis-cluster-client` | Sync API, thread-safe singleton |
| Java (Lettuce) | 2.4.0 | `cn.webank.redis:redis-cluster-client` | Async/Reactive, call `getConnection()` each time |
| Go | 1.4.0 | `code.weoa.com/Internal/weredis-client-go` | Based on go-redis v7 |
| C/C++ | - | Build from source | `proxyRedisClient` is thread-safe, `redisContext` is NOT |
| HTTP | - | Any HTTP client | ClientLess, token-based auth, via TGW gateway |
| Spring Boot | 2.7.2 | `weservice-weredis-spring-boot-starter` | Auto-config, request-scoped connection |

**For detailed setup, configuration options, and usage examples, see:**
- `references/java-jedis.md` - Java 1.x detailed guide
- `references/java-lettuce.md` - Java 2.x async/reactive patterns
- `references/golang.md` - Go client complete guide
- `references/cpp.md` - C/C++ client details
- `references/http-protocol.md` - HTTP protocol access (ClientLess)
- `references/spring-integration.md` - Spring/Spring Boot integration

## 接入规范速查

**KEY 格式**: `<systemId>:<realKey>`
**VALUE 限制**: ≤ 100KB
**TTL**: 必须设置，≤ 7天
**连接数**: `min(16, cpu核数*2)`
**Pipeline**: ≤ 20

**不支持**: KEYS, MULTI/EXEC, EVAL, MSET/MGET, CLUSTER 命令

详细规范见 `references/onboarding-rules.md`

## 常见错误码

| 错误码 | 描述 | 快速解决 |
|--------|------|----------|
| `ACCESS_DENY` | 只能访问本子系统KEY | 检查KEY前缀是否为本系统ID |
| `LIMIT_RATE` | 请求被限流 | 申请的TPS配额过小 |
| `ACCOUNT_FORBID` | 无权访问集群 | 提交ITSM申请接入 |
| `KEY_FORMAT` | KEY格式错误 | 使用 `<systemId>:<realKey>` 格式 |
| `TOO_LARGE` | 数据过大 | VALUE ≤ 100KB |
| `CLIENT_FORBID` | 客户端版本低 | 升级到最新版本 |

详细排查见 `references/troubleshooting.md`

## 平台资源

- **文档入口**: http://docs.weoa.com/space/RKAWVRjaREhwx1k8
- **管理台**: http://weredisadmin.webank.com:19999/index.html
- **监控**: grafana.webank.com (weredis-view / weredis-view)

详细资源见 `references/platform-resources.md`

## 自定义模块

WeRedis 通过 Redis Module 提供了分布式场景所需的扩展命令。

| 模块 | 功能 | 适用场景 |
|------|------|----------|
| **原子操作** | CAS/CAD、条件弹出、环形队列、容量控制 | 分布式锁、幂等消费、限流、信号量 |
| **限流熔断** | GCRA算法、滑动窗口、三态熔断器 | API限流、服务保护 |
| **TairString** | 带版本号的字符串，支持CAS/CAD | 分布式锁、乐观并发控制 |
| **TairHash** | 支持字段级过期和版本的Hash | 会话管理、带过期属性的元数据 |

**详细命令语法和用法见:**
- `references/module-atomic.md` - 原子操作命令
- `references/module-ratelimiter.md` - 限流熔断命令
- `references/module-tairstring.md` - TairString命令（带版本的字符串）
- `references/module-tairhash.md` - TairHash命令（字段级过期和版本）
