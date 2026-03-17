# 批量移除用户组成员

Source URL: https://open.feishu.cn/document/server-docs/contact-v3/group-member/batch_remove
Updated: 2024-09-14

# 批量移除用户组成员

调用该接口从指定普通用户组内移除一个或多个成员。

## 注意事项

- 目前仅支持移除用户类型的成员，暂不支持移除部门类型的成员。

- 如果应用的通讯录权限范围是 **全部员工**，则可以将任何用户移除任何用户组。如果应用的通讯录权限范围不是 **全部员工**，则所要移除的用户以及对应的用户组，均需要在应用的通讯录权限范围内。了解通讯录权限范围，可参见[权限范围资源介绍](https://open.feishu.cn/document/ukTMukTMukTM/uETNz4SM1MjLxUzM/v3/guides/scope_authority)。

## 请求

基本 | &nbsp;
---|---
HTTP URL | https://open.feishu.cn/open-apis/contact/v3/group/:group_id/member/batch_remove
HTTP Method | POST
接口频率限制 | [100 次/分钟](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN)
支持的应用类型 | 自建应用
权限要求<br>**调用该 API 所需的权限。开启其中任意一项权限即可调用** | 更新用户组信息(contact:group)

### 请求头

名称 | 类型 | 必填 | 描述
---|---|---|---
Authorization | string | 是 | `tenant_access_token`<br>**值格式**："Bearer `access_token`"<br>**示例值**："Bearer t-7f1bcd13fc57d46bac21793a18e560"<br>[了解更多：如何选择与获取 access token](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-choose-which-type-of-token-to-use)
Content-Type | string | 是 | **固定值**："application/json; charset=utf-8"

### 路径参数

名称 | 类型 | 描述
---|---|---
group_id | string | 用户组 ID。<br>用户组 ID 可在创建用户组时从返回值中获取，你也可以调用[查询用户组列表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/group/simplelist)接口，获取用户组的 ID。<br>**示例值**："test_group"

### 请求体

名称 | 类型 | 必填 | 描述
---|---|---|---
members | memberlist\[\] | 是 | 待移除成员信息。<br>**数据校验规则**：<br>- 长度范围：`1` ～ `100`
member_id | string | 是 | 移除的用户 ID，ID 类型与 member_id_type 的取值保持一致。<br>你可以调用[查询用户组成员列表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/group-member/simplelist)接口，获取用户组内的成员 ID，并将需要移除的成员 ID 传入当前参数。注意仅支持移除用户类型的成员，且需要使用相同的用户 ID 类型，否则会报错。<br>**示例值**："u287xj12"
member_type | string | 是 | 用户组成员的类型，目前仅支持选择 user，表示用户类型。<br>**示例值**："user"
member_id_type | string | 否 | 当 `member_type` 取值为 `user`时，该参数必填，需通过该参数设置用户 ID 类型，包括：<br>- open_id：标识一个用户在某个应用中的身份。同一个用户在不同应用中的 Open ID 不同。<br>- union_id：标识一个用户在某个应用开发商下的身份。同一用户在同一开发商下的应用中的 Union ID 是相同的，在不同开发商下的应用中的 Union ID 是不同的。通过 Union ID，应用开发商可以把同个用户在多个应用中的身份关联起来。<br>- user_id：标识一个用户在某个租户内的身份。同一个用户在租户 A 和租户 B 内的 User ID 是不同的。在同一个租户内，一个用户的 User ID 在所有应用中都保持一致。User ID 主要用于在不同的应用间打通用户数据。<br>**示例值**："user_id"

### 请求体示例
```json
{
    "members": [
        {
            "member_id": "u287xj12",
            "member_type": "user",
            "member_id_type": "user_id"
        }
    ]
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
400 | 40001 | param error | 参数错误。请检查请求时传入的参数是否有误。
500 | 40003 | internal error | 内部错误，请获取请求的 X-Request-Id，并向[技术支持](https://applink.feishu.cn/TLJpeNdW)进行反馈。
400 | 40022 | partial failed, see Results field for more details | 部分操作失败。你需要检查传入的参数取值是否正确。若返回结果中包含具体错误码，可根据错误码定位问题。错误码排查建议请参考对应的 API 文档或者[通用错误码](https://open.feishu.cn/document/ukTMukTMukTM/ugjM14COyUjL4ITN)。
400 | 41073 | invalid member_id | 成员 ID 无效。你需要参考接口文档的 member_id 参数描述，传入正确的成员 ID。
400 | 41074 | invalid member_type | 无效的成员类型。你需要按照接口文档内 member_type 的参数描述设置正确的值。
400 | 42002 | invalid group_id | 用户组 ID 无效。你可以调用[查询用户组列表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/group/simplelist)接口，获取准确的用户组 ID。
403 | 42009 | no group authority | 缺少用户组权限。应用的通讯录权限范围需包含当前操作的用户组。了解应用的通讯录权限范围，可参见[权限范围资源介绍](https://open.feishu.cn/document/ukTMukTMukTM/uETNz4SM1MjLxUzM/v3/guides/scope_authority)。
403 | 41050 | no user authority error | 无用户权限。需将当前操作的用户添加到应用或用户的权限范围内。根据调用 API 的身份不同，解决方案也不同，具体说明如下：<br>- **使用 tenant_access_token 调用 API**<br>当前操作的用户需要添加在应用的通讯录权限范围内。通讯录权限范围定义了应用在调用通讯录 API 时可获取的部门、用户的数据范围。应用无法访问不在通讯录权限范围内的数据。<br>由开发者登录[开发者后台](https://open.feishu.cn/app)，在应用详情页的 **开发配置** > **权限管理** > **数据权限** 页面内，配置 **通讯录权限范围**，添加指定用户。<br><br>已发布的应用企业管理员可在[管理后台](http://feishu.cn/admin) > **工作台** > **应用管理** 页面，修改应用的通讯录权限范围。<br><br>- **使用 user_access_token 调用 API**<br>当你使用用户身份调用通讯录 API 时，可操作的权限范围不受应用的通讯录权限范围影响，而是受当前用户的组织架构可见范围影响，该范围限制了用户在企业内可见的组织架构数据范围。<br>由企业管理员在[管理后台](http://feishu.cn/admin) > **安全** > **成员权限** 页面中，点击 **组织架构可见范围** 进行管理。<br><br>完整介绍参见[权限范围资源介绍](https://open.feishu.cn/document/ukTMukTMukTM/uETNz4SM1MjLxUzM/v3/guides/scope_authority)。

更多错误码信息，参见[通用错误码](https://open.feishu.cn/document/ukTMukTMukTM/ugjM14COyUjL4ITN)。
