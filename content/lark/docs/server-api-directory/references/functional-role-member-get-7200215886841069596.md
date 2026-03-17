# 查询角色下某个成员的管理范围

Source URL: https://open.feishu.cn/document/server-docs/contact-v3/functional_role-member/get
Updated: 2024-07-05

# 查询角色下某个成员的管理范围

调用本接口查询指定角色内的指定成员的管理范围。

## 请求

基本 | &nbsp;
---|---
HTTP URL | https://open.feishu.cn/open-apis/contact/v3/functional_roles/:role_id/members/:member_id
HTTP Method | GET
接口频率限制 | [100 次/分钟](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN)
支持的应用类型 | 自建应用
权限要求<br>**调用该 API 所需的权限。开启其中任意一项权限即可调用**<br>开启任一权限即可 | 查看、创建、修改、删除角色及角色成员(contact:functional_role)<br>查询角色信息、角色下的成员信息(contact:functional_role:readonly)
字段权限要求 | **注意事项**：该接口返回体中存在下列敏感字段，仅当开启对应的权限后才会返回；如果无需获取这些字段，则不建议申请<br>获取用户 user ID(contact:user.employee_id:readonly)

### 请求头

名称 | 类型 | 必填 | 描述
---|---|---|---
Authorization | string | 是 | `tenant_access_token`<br>**值格式**："Bearer `access_token`"<br>**示例值**："Bearer t-7f1bcd13fc57d46bac21793a18e560"<br>[了解更多：如何选择与获取 access token](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-choose-which-type-of-token-to-use)

### 路径参数

名称 | 类型 | 描述
---|---|---
role_id | string | 角色 ID。获取方式：<br>- 在[创建角色](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/functional_role/create)时，可从返回结果中获取。<br>- 企业管理员可以在 [管理后台](https://feishu.cn/admin) > **组织架构** > **角色管理** 页面，在角色名称右侧获取角色 ID。<br>**示例值**："7vrj3vk70xk7v5r"
member_id | string | 角色成员的用户 ID，ID 类型需要和查询参数 user_id_type 的取值保持一致。<br>**示例值**："od-123456"

### 查询参数

名称 | 类型 | 必填 | 描述
---|---|---|---
user_id_type | string | 否 | 用户 ID 类型<br>**示例值**：open_id<br>**可选值有**：<br>- open_id：标识一个用户在某个应用中的身份。同一个用户在不同应用中的 Open ID 不同。[了解更多：如何获取 Open ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-openid)<br>- union_id：标识一个用户在某个应用开发商下的身份。同一用户在同一开发商下的应用中的 Union ID 是相同的，在不同开发商下的应用中的 Union ID 是不同的。通过 Union ID，应用开发商可以把同个用户在多个应用中的身份关联起来。[了解更多：如何获取 Union ID？](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-union-id)<br>- user_id：标识一个用户在某个租户内的身份。同一个用户在租户 A 和租户 B 内的 User ID 是不同的。在同一个租户内，一个用户的 User ID 在所有应用（包括商店应用）中都保持一致。User ID 主要用于在不同的应用间打通用户数据。[了解更多：如何获取 User ID？](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-user-id)<br>**默认值**：`open_id`<br>**当值为 `user_id`，字段权限要求**：<br>获取用户 user ID(contact:user.employee_id:readonly)
department_id_type | string | 否 | 此次调用中的部门 ID 类型。关于部门 ID 的详细介绍，可参见[部门 ID 说明](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/department/field-overview#23857fe0)。<br>**示例值**：open_department_id<br>**可选值有**：<br>- department_id：支持用户自定义配置的部门 ID。自定义配置时可复用已删除的 department_id，因此在未删除的部门范围内 department_id 具有唯一性。<br>- open_department_id：由系统自动生成的部门 ID，ID 前缀固定为 `od-`，在租户内全局唯一。<br>**默认值**：`open_department_id`

## 响应

### 响应体

名称 | 类型 | 描述
---|---|---
code | int | 错误码，非 0 表示失败
msg | string | 错误描述
data | \- | \-
member | functional_role.member | 成员的管理范围。
user_id | string | 用户 ID，ID 类型与查询参数 user_id_type 的取值保持一致。
scope_type | string | 管理范围类型。<br>**可选值有**：<br>- All：全部<br>- Part：部分部门<br>- None：空，即未设置
department_ids | string\[\] | 部门 ID 列表，ID 类型与查询参数 department_id_type 的取值保持一致。后续你可以调用[获取单个部门信息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/department/get)接口，根据部门 ID 获取部门详情。<br>**说明**：仅当 scope_type 取值为 Part 时，才会返回该值。

### 响应体示例
```json
{
    "code": 0,
    "msg": "success",
    "data": {
        "member": {
            "user_id": "od-4e6ac4d14bcd5071a37a39de902c7141",
            "scope_type": "All",
            "department_ids": [
                "od-4e6ac4d14bcd5071a37a39de902c7141"
            ]
        }
    }
}
```

### 错误码

HTTP状态码 | 错误码 | 描述 | 排查建议
---|---|---|---
404 | 41202 | role id is not exist | role_id 不存在。请修改为正确的 role_id 后重试。
404 | 41203 | member id is not exist | 成员 ID 不存在。你可以调用[查询角色下的所有成员信息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/functional_role-member/list)接口，获取在当前角色内的成员 ID。

更多错误码信息，参见[通用错误码](https://open.feishu.cn/document/ukTMukTMukTM/ugjM14COyUjL4ITN)。
