# TairHash 模块

类似 Redis Hash，但支持为字段设置过期时间和版本号。提供主动过期机制。

## 核心特性

- 支持所有 Redis Hash 命令
- 支持字段级过期和版本号
- 主动过期机制（SCAN/SORT/SLAB 三种模式）
- 被动过期（读写时触发）
- 过期事件通知（基于 pubsub）

## 主动过期模式

| 模式 | 内存 | 效率 | Redis 版本 |
|------|------|------|-----------|
| SCAN_MODE（默认） | 低 | 中 | >= 5.0 |
| SORT_MODE | 高 | 高 | >= 7.0 |
| SLAB_MODE | 中 | 高 | >= 7.0 |

## 过期事件通知

当字段过期时，通过 pubsub 发送通知：
- 频道格式：`tairhash@<db>@<key>__:expired`
- 消息内容：过期的字段名

---

## 命令总览

| 命令 | 语法 | 说明 |
|------|------|------|
| EXHSET | `EXHSET key field value [EX\|EXAT\|PX\|PXAT time] [NX\|XX] [VER\|ABS\|GT version] [KEEPTTL]` | 设置字段（带过期/版本） |
| EXHGET | `EXHGET key field` | 获取字段值 |
| EXHGETWITHVER | `EXHGETWITHVER key field` | 获取字段值和版本 |
| EXHMSET | `EXHMSET key field value [field value...]` | 批量设置字段 |
| EXHMGET | `EXHMGET key field [field ...]` | 批量获取字段值 |
| EXHMGETWITHVER | `EXHMGETWITHVER key field [field ...]` | 批量获取字段值和版本 |
| EXHDEL | `EXHDEL key field [field...]` | 删除字段 |
| EXHLEN | `EXHLEN key [noexp]` | 获取字段数量 |
| EXHEXISTS | `EXHEXISTS key field` | 检查字段是否存在 |
| EXHSTRLEN | `EXHSTRLEN key field` | 获取字段值长度 |
| EXHKEYS | `EXHKEYS key` | 获取所有字段名 |
| EXHVALS | `EXHVALS key` | 获取所有值 |
| EXHGETALL | `EXHGETALL key` | 获取所有字段和值 |
| EXHGETALLWITHVER | `EXHGETALLWITHVER key` | 获取所有字段、值和版本 |
| EXHSCAN | `EXHSCAN key cursor [MATCH pattern] [COUNT count]` | 迭代扫描 |
| EXHVER | `EXHVER key field` | 获取字段版本号 |
| EXHSETVER | `EXHSETVER key field version` | 设置字段版本号 |
| EXHINCRBY | `EXHINCRBY key field value [EX\|EXAT\|PX\|PXAT time] [VER\|ABS\|GT version] [MIN\|MAX val] [KEEPTTL]` | 字段自增/自减 |
| EXHINCRBYFLOAT | `EXHINCRBYFLOAT key field value [...]` | 字段浮点数自增/自减 |
| EXHEXPIRE | `EXHEXPIRE key field seconds [VER\|ABS\|GT version]` | 设置字段过期时间（秒） |
| EXHEXPIREAT | `EXHEXPIREAT key field timestamp [VER\|ABS\|GT version]` | 设置字段绝对过期时间（秒） |
| EXHPEXPIRE | `EXHPEXPIRE key field milliseconds [VER\|ABS\|GT version]` | 设置字段过期时间（毫秒） |
| EXHPEXPIREAT | `EXHPEXPIREAT key field milliseconds-timestamp [VER\|ABS\|GT version]` | 设置字段绝对过期时间（毫秒） |
| EXHPERSIST | `EXHPERSIST key field` | 移除字段过期设置 |
| EXHTTL | `EXHTTL key field` | 获取字段剩余过期时间（秒） |
| EXHPTTL | `EXHPTTL key field` | 获取字段剩余过期时间（毫秒） |

---

## 详细命令说明

### EXHSET - 设置字段

```
EXHSET key field value [EX time] [EXAT time] [PX time] [PXAT time] [NX|XX] [VER|ABS|GT version] [KEEPTTL]
```

**时间复杂度：** O(1)

**参数说明：**

| 参数 | 说明 |
|------|------|
| `key` | TairHash 的键名 |
| `field` | 字段名 |
| `value` | 字段值 |
| `EX seconds` | 相对过期时间（秒），0 表示立即过期 |
| `EXAT timestamp` | 绝对过期时间戳（秒） |
| `PX milliseconds` | 相对过期时间（毫秒） |
| `PXAT timestamp` | 绝对过期时间戳（毫秒） |
| `NX` | 仅当字段不存在时写入 |
| `XX` | 仅当字段存在时写入 |
| `VER version` | 版本号匹配时写入（0 表示不检查版本） |
| `ABS version` | 强制设置版本号（不能为 0） |
| `GT version` | 仅当指定版本大于当前版本时写入（不能为 0） |
| `KEEPTTL` | 保留字段的 TTL（不能与 EX/EXAT/PX/PXAT 同时使用） |

**返回值：**
- `1`：新字段创建成功
- `0`：字段已存在并更新成功
- `-1`：NX/XX 条件不满足
- 错误 `ERR update version is stale`：版本号不匹配

**示例：**
```bash
EXHSET k f v EX 10           # 10 秒后过期
EXHSET k f v NX              # 仅当字段不存在时写入
EXHSET k f v VER 1           # 版本匹配时更新
EXHSET k f v ABS 2           # 强制设置版本为 2
EXHSET k f v GT 5            # 仅当版本 > 5 时更新
```

---

### EXHGET - 获取字段值

```
EXHGET key field
```

**时间复杂度：** O(1)

**返回值：** 字段值，不存在返回 `nil`

---

### EXHGETWITHVER - 获取字段值和版本

```
EXHGETWITHVER key field
```

**时间复杂度：** O(1)

**返回值：** `[value, version]`，不存在返回 `nil`

**示例：**
```bash
EXHGETWITHVER k f
1) "value"
2) (integer) 3
```

---

### EXHMSET - 批量设置字段

```
EXHMSET key field value [field value...]
```

**时间复杂度：** O(n)

**返回值：** `OK`

**示例：**
```bash
EXHMSET k f1 v1 f2 v2 f3 v3
```

---

### EXHMGET - 批量获取字段值

```
EXHMGET key field [field ...]
```

**时间复杂度：** O(n)

**返回值：** 数组，每个元素对应一个字段值，不存在则为 `nil`

**示例：**
```bash
EXHMGET k f1 f2 f3
1) "v1"
2) "v2"
3) (nil)
```

---

### EXHMGETWITHVER - 批量获取字段值和版本

```
EXHMGETWITHVER key field [field ...]
```

**时间复杂度：** O(n)

**返回值：** 数组，每个元素为 `[value, version]` 或 `nil`

---

### EXHDEL - 删除字段

```
EXHDEL key field [field...]
```

**时间复杂度：** O(1)

**返回值：** 成功删除的字段数量

---

### EXHLEN - 获取字段数量

```
EXHLEN key [noexp]
```

**时间复杂度：** O(1) 不带 noexp，O(N) 带 noexp

**参数说明：**
- `noexp`：仅返回未过期的字段数量（需要遍历，RT 受 TairHash 大小影响）

**返回值：** 字段数量，TairHash 不存在返回 0

**注意：** 默认不触发被动过期检查，结果可能包含已过期但未删除的字段。

---

### EXHEXISTS - 检查字段是否存在

```
EXHEXISTS key field
```

**时间复杂度：** O(1)

**返回值：**
- `1`：字段存在
- `0`：TairHash 或字段不存在

---

### EXHSTRLEN - 获取字段值长度

```
EXHSTRLEN key field
```

**时间复杂度：** O(1)

**返回值：** 字段值长度，不存在返回 0

---

### EXHKEYS - 获取所有字段名

```
EXHKEYS key
```

**时间复杂度：** O(n)

**返回值：** 字段名数组，不存在返回空数组

---

### EXHVALS - 获取所有值

```
EXHVALS key
```

**时间复杂度：** O(n)

**返回值：** 值数组，不存在返回空数组

---

### EXHGETALL - 获取所有字段和值

```
EXHGETALL key
```

**时间复杂度：** O(n)

**返回值：** `[field1, value1, field2, value2, ...]`，不存在返回空数组

**示例：**
```bash
EXHSET k0 f1 1 ABS 2
EXHSET k0 f2 2 ABS 1
EXHGETALL k0
1) "f2"
2) "2"
3) "f1"
4) "1"
```

---

### EXHGETALLWITHVER - 获取所有字段、值和版本

```
EXHGETALLWITHVER key
```

**时间复杂度：** O(n)

**返回值：** `[field1, value1, version1, field2, value2, version2, ...]`

**示例：**
```bash
EXHSET k0 f1 1 ABS 2
EXHSET k0 f2 2 ABS 1
EXHGETALLWITHVER k0
1) "f2"
2) "2"
3) (integer) 1
4) "f1"
5) "1"
6) (integer) 2
```

---

### EXHSCAN - 迭代扫描

```
EXHSCAN key cursor [MATCH pattern] [COUNT count]
```

**时间复杂度：** O(1) 每次调用，完整扫描为 O(N)

**参数说明：**
- `cursor`：扫描游标，从 0 开始，返回 0 表示扫描结束
- `MATCH pattern`：过滤模式（支持通配符）
- `COUNT count`：单次扫描的字段数，默认 10

**返回值：** `[next_cursor, [field1, value1, field2, value2, ...]]`

**示例 - 完整扫描：**
```bash
EXHMSET exhashkey field1 val1 field2 val2 field3 val3 field4 val4 field5 val5
EXHSCAN exhashkey 0 COUNT 3
1) (integer) 4
2) 1) "field6"
   2) "val6"
   3) "field5"
   4) "val5"
EXHSCAN exhashkey 4 COUNT 3
1) (integer) 1
2) 1) "field8"
   2) "val8"
   3) "field2"
   4) "val2"
# 继续扫描直到返回 0
```

**示例 - MATCH 过滤：**
```bash
EXHSCAN exhashkey 0 COUNT 3 MATCH field6_*
1) (integer) 8
2) 1) "field6_4"
   2) "val6_4"
   3) "field6_1"
   4) "val6_1"
```

---

### EXHVER - 获取字段版本号

```
EXHVER key field
```

**时间复杂度：** O(1)

**返回值：**
- 版本号：字段存在
- `-1`：TairHash 不存在
- `-2`：字段不存在

---

### EXHSETVER - 设置字段版本号

```
EXHSETVER key field version
```

**时间复杂度：** O(1)

**返回值：**
- `1`：设置成功
- `0`：TairHash 或字段不存在

---

### EXHINCRBY - 字段自增/自减

```
EXHINCRBY key field value [EX time] [EXAT time] [PX time] [PXAT time] [VER|ABS|GT version] [MIN minval] [MAX maxval] [KEEPTTL]
```

**时间复杂度：** O(1)

**参数说明：**

| 参数 | 说明 |
|------|------|
| `value` | 增量值（可为负数） |
| `MIN minval` | 最小值边界，超过则报错 |
| `MAX maxval` | 最大值边界，超过则报错 |
| 其他参数 | 同 EXHSET |

**返回值：** 增加后的值

**错误：**
- `ERR update version is stale`：版本号不匹配
- `ERR increment or decrement would overflow`：超过 MIN/MAX 边界

**示例：**
```bash
EXHINCRBY k f 100
EXHINCRBY k f 100 MAX 150    # 超过 150 报错
EXHINCRBY k f 100 MIN 50     # 低于 50 报错
```

---

### EXHINCRBYFLOAT - 字段浮点数自增/自减

```
EXHINCRBYFLOAT key field value [EX time] [EXAT time] [PX time] [PXAT time] [VER|ABS|GT version] [MIN minval] [MAX maxval] [KEEPTTL]
```

**时间复杂度：** O(1)

**返回值：** 增加后的值（浮点数）

**错误：** 同 EXHINCRBY，还包括字段值非浮点数的情况

---

### EXHEXPIRE / EXHPEXPIRE - 设置字段过期时间

```
EXHEXPIRE key field seconds [VER|ABS|GT version]
EXHPEXPIRE key field milliseconds [VER|ABS|GT version]
```

**时间复杂度：** O(1)

**参数说明：**
- `EXHEXPIRE`：相对时间，单位秒
- `EXHPEXPIRE`：相对时间，单位毫秒
- 时间为 0 表示立即过期

**返回值：**
- `1`：设置成功
- `0`：字段不存在
- 错误 `ERR update version is stale`：版本号不匹配

---

### EXHEXPIREAT / EXHPEXPIREAT - 设置字段绝对过期时间

```
EXHEXPIREAT key field timestamp [VER|ABS|GT version]
EXHPEXPIREAT key field milliseconds-timestamp [VER|ABS|GT version]
```

**时间复杂度：** O(1)

**参数说明：**
- `EXHEXPIREAT`：绝对时间戳，单位秒
- `EXHPEXPIREAT`：绝对时间戳，单位毫秒

**返回值：** 同 EXHEXPIRE

---

### EXHPERSIST - 移除字段过期设置

```
EXHPERSIST key field
```

**时间复杂度：** O(1)

**返回值：**
- `1`：成功移除过期设置
- `0`：键或字段不存在，或字段本身无过期设置

---

### EXHTTL / EXHPTTL - 获取字段剩余过期时间

```
EXHTTL key field
EXHPTTL key field
```

**时间复杂度：** O(1)

**返回值：**
- `EXHTTL`：剩余秒数
- `EXHPTTL`：剩余毫秒数
- `-2`：TairHash 或字段不存在
- `-1`：字段存在但未设置过期时间

---

## 错误信息

| 错误 | 说明 |
|------|------|
| `ERR update version is stale` | 版本号不匹配，更新失败 |
| `ERR increment or decrement would overflow` | 超过 MIN/MAX 限制 |
| `ERR min or max is specified, but not valid` | MIN/MAX 参数无效 |
| `ERR invalid expire time, must be a positive integer` | 过期时间 ≤ 0 |
