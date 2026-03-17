# 删除角色

Source URL: https://open.feishu.cn/document/server-docs/contact-v3/functional_role/delete
Updated: 2024-07-05

# 删除角色

调用该接口删除指定角色。

## 注意事项

角色内如果有成员，则不支持直接删除。你可以调用[查询角色下的所有成员信息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/functional_role-member/list)接口，查看角色内是否还有成员，如果有，可以调用[删除角色下的成员](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/functional_role-member/batch_delete)接口，将角色成员删除后，再删除角色。

## 请求

基本 | &nbsp;
---|---
HTTP URL | https://open.feishu.cn/open-apis/contact/v3/functional_roles/:role_id
HTTP Method | DELETE
接口频率限制 | [100 次/分钟](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN)
支持的应用类型 | 自建应用
权限要求<br>**调用该 API 所需的权限。开启其中任意一项权限即可调用** | 查看、创建、修改、删除角色及角色成员(contact:functional_role)

### 请求头

名称 | 类型 | 必填 | 描述
---|---|---|---
Authorization | string | 是 | `tenant_access_token`<br>**值格式**："Bearer `access_token`"<br>**示例值**："Bearer t-7f1bcd13fc57d46bac21793a18e560"<br>[了解更多：如何选择与获取 access token](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-choose-which-type-of-token-to-use)

### 路径参数

名称 | 类型 | 描述
---|---|---
role_id | string | 角色 ID。获取方式：<br>- 在创建角色时，可从返回结果中获取。<br>- 企业管理员可以在 [管理后台](https://feishu.cn/admin) > **组织架构** > **角色管理** 页面，在角色名称右侧获取角色 ID。<br>**示例值**："7vrj3vk70xk7v5r"

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
404 | 41202 | role id is not exist | role_id 不存在。请修改为正确的 role_id 后重试。
400 | 41206 | functional role has members, can not delete | 角色内含有成员，不可删除。你需要先[删除角色下的成员](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/functional_role-member/batch_delete)，然后重试。

更多错误码信息，参见[通用错误码](https://open.feishu.cn/document/ukTMukTMukTM/ugjM14COyUjL4ITN)。
