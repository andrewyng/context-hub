# 更新部门 ID

Source URL: https://open.feishu.cn/document/contact-v3/department/update_department_id
Updated: 2024-07-05

# 更新部门ID

调用该接口可以更新部门的自定义 ID，即 department_id。

## 注意事项

本接口仅支持使用应用身份（tenant_access_token）调用。调用时，应用的通讯录权限范围内需要包含当前被操作的部门。了解权限范围参见[权限范围资源介绍](https://open.feishu.cn/document/ukTMukTMukTM/uETNz4SM1MjLxUzM/v3/guides/scope_authority)。

## 请求

基本 | &nbsp;
---|---
HTTP URL | https://open.feishu.cn/open-apis/contact/v3/departments/:department_id/update_department_id
HTTP Method | PATCH
接口频率限制 | [1000 次/分钟、50 次/秒](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN)
支持的应用类型 | 自建应用
权限要求<br>**调用该 API 所需的权限。开启其中任意一项权限即可调用** | 更新部门 ID(contact:contact:update_department_id)

### 请求头

名称 | 类型 | 必填 | 描述
---|---|---|---
Authorization | string | 是 | `tenant_access_token`<br>**值格式**："Bearer `access_token`"<br>**示例值**："Bearer t-7f1bcd13fc57d46bac21793a18e560"<br>[了解更多：如何选择与获取 access token](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-choose-which-type-of-token-to-use)
Content-Type | string | 是 | **固定值**："application/json; charset=utf-8"

### 路径参数

名称 | 类型 | 描述
---|---|---
department_id | string | 需要更新自定义 ID 的部门 ID，该 ID 类型需要与查询参数 department_id_type 的取值一致。ID 获取方式说明：<br>- 调用[创建部门](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/department/create)接口后，可从返回结果中获取到部门 ID 信息。<br>- 部门 API 提供了多种获取其他部门 ID 的方式，如[获取子部门列表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/department/children)、[获取父部门信息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/department/parent)、[搜索部门](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/department/search)，你可以选择合适的 API 进行查询。<br>**示例值**："od-d6b83d25c129775723a36f52495c4f81"<br>**数据校验规则**：<br>- 最大长度：`64` 字符<br>- 正则校验：`^[a-zA-Z0-9][a-zA-Z0-9_\-@.]{0,63}$`

### 查询参数

名称 | 类型 | 必填 | 描述
---|---|---|---
department_id_type | string | 否 | 此次调用中的部门 ID 类型。关于部门 ID 的详细介绍，可参见[部门 ID 说明](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/department/field-overview#23857fe0)。<br>**默认值**：open_department_id<br>**示例值**：open_department_id<br>**可选值有**：<br>- department_id：支持用户自定义配置的部门 ID。自定义配置时可复用已删除的 department_id，因此在未删除的部门范围内 department_id 具有唯一性。<br>- open_department_id：由系统自动生成的部门 ID，ID 前缀固定为 `od-`，在租户内全局唯一。

### 请求体

名称 | 类型 | 必填 | 描述
---|---|---|---
new_department_id | string | 是 | 新的自定义部门 ID，即部门的 department_id。<br>**注意**：<br>- 不能以 `od-` 开头。<br>- 不能设置为 `0`。<br>- 不能与其他未删除部门的 department_id 重复。<br>**示例值**："NewDevDepartID"<br>**数据校验规则**：<br>- 最大长度：`128` 字符<br>- 正则校验：`^0|[^od][A-Za-z0-9]*`

### 请求体示例
```json
{
    "new_department_id": "NewDevDepartID"
}
```

## 响应

### 响应体

名称 | 类型 | 描述
---|---|---
code | int | 错误码，非 0 表示失败
msg | string | 错误描述
data | \- | \-

### 响应体示例
```json
{
    "code": 0,
    "msg": "success",
    "data": {}
}
```

### 错误码

HTTP状态码 | 错误码 | 描述 | 排查建议
---|---|---|---
400 | 40001 | invalid params | 参数错误，请对照接口文档修改输入参数后重试。
400 | 43009 | exceed update custom dept limit error | 超过最大更新限制。
403 | 40007 | can not update dept custom id error | 无法更新部门自定义 ID。你需要在应用的通讯录权限范围内添加当前操作的部门。了解应用的通讯录权限范围，可参见[权限范围资源介绍](https://open.feishu.cn/document/ukTMukTMukTM/uETNz4SM1MjLxUzM/v3/guides/scope_authority)。
401 | 42008 | tenant id is invalid error | 租户身份无效。请求时，请确保设置的请求头 Authorization 与待操作资源同属一个租户下。

更多错误码信息，参见[通用错误码](https://open.feishu.cn/document/ukTMukTMukTM/ugjM14COyUjL4ITN)。
