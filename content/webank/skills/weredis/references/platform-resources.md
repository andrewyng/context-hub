# WeRedis 平台资源

本文档汇总了 WeRedis 平台的管理台、监控界面、CMDB 变量等资源。

## 文档汇总

**WeRedis 文档入口**: http://docs.weoa.com/space/RKAWVRjaREhwx1k8

## 管理台 (Admin Console)

| 环境 | 地址 |
|------|------|
| 测试环境 | http://10.107.120.69:19999/index.html |
| 生产环境 | http://weredisadmin.webank.com:19999/index.html |

**功能**:
- 查看集群状态
- 查看 Proxy 节点列表
- 监控连接数和 TPS
- 查看子系统接入信息

## 监控界面 (Grafana)

| 环境 | 地址 | 账号 |
|------|------|------|
| 测试环境 | weps-grafana.weoa.com:30010 | weredis-viewer / weredis-viewer |
| 生产环境 | grafana.webank.com | weredis-view / weredis-view |

**监控指标**:
- 集群 TPS/QPS
- 命令延迟分布
- 连接数趋势
- 内存使用率
- Big Key 扫描结果

## 数据可视化工具

Redis GUI 客户端下载与使用: http://docs.weoa.com/docs/WlArzoj0zgf4pJA2

**推荐工具**:
- RedisInsight (官方可视化工具)
- Another Redis Desktop Manager
- Medis (macOS)

## CMDB 变量

配置客户端时需要从 CMDB 获取以下变量：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `@系统ID-REDIS_CLUSTER_集群编号_NAME` | 集群名称 | `RPD_GENERAL_REDIS_CLUSTER_CACHE` |
| `@系统ID-WEREDIS_OBSERVERS_DOMAIN` | Observer 域名 | `http://observer.example.com:19091` |
| `@系统ID-REDIS_CLUSTER_集群编号_PROXY` | Proxy 地址列表 | `10.0.0.1:6379,10.0.0.2:6379` |

**使用方式**:
- 通过 AOMP 发布时，CMDB 变量会自动替换
- 本地开发时，可使用测试环境默认值

## UM 账户相关

WeRedis 通过 UM 进行鉴权，账户密码问题参考: http://docs.weoa.com/docs/9jq9XJGQ96kHw8pX

**常见问题**:
- UM 账户创建: 通过 ITSM 提单
- 密码加密: 生产环境使用 RSA 加密
- 账户权限: 需提交 WeRedis 接入申请

## 联系方式

- **WeRedis 服务助手**: 企业微信机器人
- **DBA 团队**: 通过 ITSM 提单联系
