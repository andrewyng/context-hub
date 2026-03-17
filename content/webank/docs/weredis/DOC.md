---
name: weredis
description: |
  WeRedis 企业级 Redis 代理平台文档。提供自动代理发现、连接池管理、故障转移、
  多语言客户端 SDK（Java Jedis/Lettuce、Go、C/C++）、HTTP 协议访问、
  Spring Boot 集成，以及自定义模块（原子操作、限流熔断、TairString、TairHash）。
metadata:
  languages: "java,go,cpp"
  versions: "1.5.0,2.4.0,1.4.0"
  revision: 1
  updated-on: "2026-03-17"
  source: maintainer
  tags: "weredis,redis,webank,java,go,cpp,spring,proxy,cache"
---

# WeRedis 企业级 Redis 代理平台

WeRedis 是微众银行开源的企业级 Redis 代理平台，提供高可用、高性能、多协议的分布式缓存服务。

## 核心特性

- **自动代理发现**: 基于 Observer 服务自动发现可用代理节点
- **智能连接池**: 自动管理连接池大小、健康检查和故障转移
- **多协议支持**: 支持 Redis 协议、HTTP 协议访问
- **多语言 SDK**: 提供 Java、Go、C/C++ 等主流语言客户端
- **Spring 集成**: 提供 Spring Boot Starter 自动配置
- **自定义模块**: 原子操作、限流熔断、TairString、TairHash 等扩展

## 快速开始

### 1. 申请集群资源

通过 ITSM 系统申请 WeRedis 集群资源，获取：
- 集群名称 (`clusterName`)
- 观察者地址 (`observerDomain`)
- 用户名和密码

### 2. 选择客户端

| 场景 | 推荐客户端 | 版本 |
|------|-----------|------|
| Java 同步 | Jedis | 1.5.0+ |
| Java 异步 | Lettuce | 2.4.0+ |
| Go | go-redis | 1.4.0+ |
| C/C++ | hiredis | - |
| HTTP | 任意 HTTP 客户端 | - |

### 3. 配置连接

所有客户端都需要以下核心参数：

```yaml
observerDomain: http://10.107.117.44:19091  # Observer 服务地址
clusterName: my-cluster                    # 集群名称
username: my-username                      # UM 账号
password: my-password                      # 密码
```

## 接入规范

### KEY 命名规范
- **格式**: `<systemId>:<realKey>`
- **示例**: `PAYMENT:order:12345`

### VALUE 限制
- **最大大小**: 100KB
- **建议大小**: < 10KB

### TTL 设置
- **必须设置**: 所有 KEY 必须设置过期时间
- **最大 TTL**: 7 天

### 连接数限制
- **计算公式**: `min(16, CPU核数 * 2)`
- **Pipeline 限制**: ≤ 20

### 禁用命令
以下 Redis 命令不支持：
- `KEYS` (使用 `SCAN` 替代)
- `MULTI/EXEC/DISCARD`
- `EVAL/EVALSHA`
- `MSET/MGET`
- `CLUSTER` 相关命令

## 更多信息

- [Java Jedis 客户端详细指南](../references/java-jedis.md)
- [Java Lettuce 客户端详细指南](../references/java-lettuce.md)
- [Go 客户端详细指南](../references/golang.md)
- [C/C++ 客户端详细指南](../references/cpp.md)
- [HTTP 协议访问指南](../references/http-protocol.md)
- [Spring Boot 集成指南](../references/spring-integration.md)
- [接入规范速查](../references/onboarding-rules.md)
- [常见错误码排查](../references/troubleshooting.md)
- [平台资源](../references/platform-resources.md)
- [原子操作模块](../references/module-atomic.md)
- [限流熔断模块](../references/module-ratelimiter.md)
- [TairString 模块](../references/module-tairstring.md)
- [TairHash 模块](../references/module-tairhash.md)
