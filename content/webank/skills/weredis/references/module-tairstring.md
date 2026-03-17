# TairString 模块

类似 Redis String，但支持为值设置版本号和过期时间，并提供 CAS/CAD 命令。

---

## 1. Redis String 增强命令（普通字符串）

这些命令对普通 Redis String 进行操作，提供原子性的比较交换功能。

### CAS - Compare And Set

```
CAS <key> <oldvalue> <newvalue> [EX seconds] [EXAT timestamp] [PX ms] [PXAT timestamp]
```

当当前值等于 `oldvalue` 时，设置为 `newvalue`。

**返回值：**
- `1`：更新成功
- `0`：更新失败（值不匹配）
- `-1`：key 不存在

**示例：**
```bash
SET foo bar
CAS foo baa bzz     # 返回 0，值不匹配
CAS foo bar bzz     # 返回 1，更新成功
CAS foo bzz too EX 10  # 更新并设置 10 秒过期
```

---

### CAD - Compare And Delete

```
CAD <key> <value>
```

当值等于 `value` 时删除 key。

**返回值：**
- `1`：删除成功
- `0`：删除失败（值不匹配）
- `-1`：key 不存在

**示例：**
```bash
SET foo bar
CAD foo bzz         # 返回 0，值不匹配
CAD foo bar         # 返回 1，删除成功
```

---

## 2. exstrtype - 带版本的字符串

这些命令操作带版本号的增强字符串类型。

### EXSET - 设置带版本的值

```
EXSET <key> <value> [EX time] [PX time] [EXAT time] [PXAT time]
      [NX|XX] [VER version|ABS version] [FLAGS flags] [WITHVERSION]
```

| 参数 | 说明 |
|------|------|
| `NX` | 仅当 key 不存在时写入 |
| `XX` | 仅当 key 存在时写入 |
| `VER version` | 版本号匹配时写入，版本号 +1 |
| `ABS version` | 强制设置版本号为指定值 |
| `FLAGS flags` | 支持 memcached 协议的标志位（uint32） |
| `WITHVERSION` | 返回版本号而非 OK |

**示例：**
```bash
EXSET foo bar NX         # 不存在时写入
EXSET foo bar1 VER 1     # 版本匹配时更新
EXSET foo bar2 ABS 100   # 强制设置版本为 100
```

---

### EXGET - 获取值和版本

```
EXGET <key> [WITHFLAGS]
```

**返回值：** `[value, version]` 或 `[value, version, flags]`

**示例：**
```bash
EXGET foo
1) "bar"
2) (integer) 1
```

---

### EXSETVER - 直接设置版本号

```
EXSETVER <key> <version>
```

**返回值：**
- `1`：设置成功
- `0`：key 不存在

---

### EXINCRBY - 带版本的自增/自减

```
EXINCRBY <key> <num> [EX time] [PX time] [EXAT time] [PXAT time]
         [NX|XX] [VER version|ABS version] [MIN minval] [MAX maxval]
         [NONEGATIVE] [WITHVERSION]
```

| 参数 | 说明 |
|------|------|
| `MIN minval` | 最小值限制 |
| `MAX maxval` | 最大值限制 |
| `NONEGATIVE` | 结果小于 0 时设为 0 |

**示例：**
```bash
EXINCRBY foo 100
EXINCRBY foo 100 MAX 150    # 超过限制报错
EXINCRBY foo 100 MIN 50     # 最小值限制
```

---

### EXINCRBYFLOAT - 浮点数自增/自减

```
EXINCRBYFLOAT <key> <num> [MIN minval] [MAX maxval] ...
```

**返回值：** 增加后的值（浮点数）

---

### EXCAS - 带版本的 Compare And Set

```
EXCAS <key> <newvalue> <version> [EX time] [PX time] [KEEPTTL]
```

**返回值：**
- 成功：`["OK", "", version]`
- 失败：`["ERR update version is stale", value, version]`

**示例：**
```bash
EXSET foo bar
EXCAS foo bzz 1
1) OK
2)
3) (integer) 2

EXCAS foo bee 1
1) ERR update version is stale
2) "bzz"
3) (integer) 2
```

---

### EXCAD - 带版本的 Compare And Delete

```
EXCAD <key> <version>
```

**返回值：**
- `1`：删除成功
- `0`：版本不匹配
- `-1`：key 不存在

---

### EXAPPEND / EXPREPEND - 字符串追加/前置

```
EXAPPEND <key> <value> [NX|XX] [VER version|ABS version]
EXPREPEND <key> <value> [NX|XX] [VER version|ABS version]
```

**返回值：** 追加/前置后的字符串长度

---

### EXGAE - Get And Expire（不增加版本）

```
EXGAE <key> [EX time|EXAT time|PX time|PXAT time]
```

获取值同时设置过期时间，但不增加版本号。

**返回值：** 当前值

---

## 使用场景

### 分布式锁

```bash
# 加锁
EXSET lock:order:123 owner-A NX EX 30
# 释放锁（带版本校验）
EXCAD lock:order:123 <version>
```

### 带版本的用户资料

```bash
# 设置用户资料
EXSET user:profile:123 '{"name":"Alice"}' VER 1
# 更新时检查版本
EXSET user:profile:123 '{"name":"Alice","age":25}' VER 2
```

---

## 错误信息

| 错误 | 说明 |
|------|------|
| `ERR update version is stale` | 版本号不匹配，更新失败 |
| `ERR increment or decrement would overflow` | 超过 MIN/MAX 限制 |
| `ERR min or max is specified, but not valid` | MIN/MAX 参数无效 |
