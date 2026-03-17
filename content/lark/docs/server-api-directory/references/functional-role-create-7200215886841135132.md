# 创建角色

Source URL: https://open.feishu.cn/document/server-docs/contact-v3/functional_role/create
Updated: 2024-07-05

# 创建角色

调用该接口创建一个角色。

## 使用限制

同一租户下，角色数量上限为 500。

## 请求

基本 | &nbsp;
---|---
HTTP URL | https://open.feishu.cn/open-apis/contact/v3/functional_roles
HTTP Method | POST
接口频率限制 | [100 次/分钟](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN)
支持的应用类型 | 自建应用
权限要求<br>**调用该 API 所需的权限。开启其中任意一项权限即可调用** | 查看、创建、修改、删除角色及角色成员(contact:functional_role)

### 请求头

名称 | 类型 | 必填 | 描述
---|---|---|---
Authorization | string | 是 | `tenant_access_token`<br>**值格式**："Bearer `access_token`"<br>**示例值**："Bearer t-7f1bcd13fc57d46bac21793a18e560"<br>[了解更多：如何选择与获取 access token](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-choose-which-type-of-token-to-use)
Content-Type | string | 是 | **固定值**："application/json; charset=utf-8"

### 请求体

名称 | 类型 | 必填 | 描述
---|---|---|---
role_name | string | 是 | 角色名称。在同一租户下角色名称唯一，不能重复创建。<br>**示例值**："考勤管理员"<br>**数据校验规则**：<br>- 长度范围：`1` ～ `50` 字符

### 请求体示例
```json
{
    "role_name": "考勤管理员"
}
```

## 响应

### 响应体

名称 | 类型 | 描述
---|---|---
code | int | 错误码，非 0 表示失败
msg | string | 错误描述
data | \- | \-
role_id | string | 角色 ID，是角色在当前租户下的唯一标识。<br>**注意**：建议你在本地保存该 ID，后续可通过该 ID 删除、修改角色。

### 响应体示例
```json
{
    "code": 0,
    "msg": "success",
    "data": {
        "role_id": "7vrj3vk70xk7v5r"
    }
}
```

### 错误码

HTTP状态码 | 错误码 | 描述 | 排查建议
---|---|---|---
400 | 41201 | role name is exist | 租户内角色名称不能重复。请修改角色名称后重试。
400 | 41208 | tenant role not more 500 | 租户内角色数量超过 500，不能继续创建。你需要删除不再使用的角色后重试。

更多错误码信息，参见[通用错误码](https://open.feishu.cn/document/ukTMukTMukTM/ugjM14COyUjL4ITN)。
