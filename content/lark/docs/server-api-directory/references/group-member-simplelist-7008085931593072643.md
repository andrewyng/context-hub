# 查询用户组成员列表

Source URL: https://open.feishu.cn/document/server-docs/contact-v3/group-member/simplelist
Updated: 2024-07-05

# 查询用户组成员列表

调用该接口查询指定用户组内的成员列表，列表内主要包括成员 ID 信息。

## 注意事项

- 本接口支持查询普通用户组和动态用户组的成员信息。
- 本接口支持查询用户组内的用户类型成员或部门类型成员。一次请求中只能查询用户类型成员或者部门类型成员，不支持查询所有类型的用户组成员。
- 如果应用的通讯录权限范围是 **全部员工**，则可以查询当前租户下任何用户组成员列表。如果应用的通讯录权限范围不是 **全部员工**，则仅可查询通讯录权限范围内的用户组成员列表。了解通讯录权限范围，可参见[权限范围资源介绍](https://open.feishu.cn/document/ukTMukTMukTM/uETNz4SM1MjLxUzM/v3/guides/scope_authority)。

## 请求

基本 | &nbsp;
---|---
HTTP URL | https://open.feishu.cn/open-apis/contact/v3/group/:group_id/member/simplelist
HTTP Method | GET
接口频率限制 | [1000 次/分钟、50 次/秒](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN)
支持的应用类型 | 自建应用、商店应用
权限要求<br>**调用该 API 所需的权限。开启其中任意一项权限即可调用** | 获取用户组信息(contact:group:readonly)

### 请求头

名称 | 类型 | 必填 | 描述
---|---|---|---
Authorization | string | 是 | `tenant_access_token`<br>**值格式**："Bearer `access_token`"<br>**示例值**："Bearer t-7f1bcd13fc57d46bac21793a18e560"<br>[了解更多：如何选择与获取 access token](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-choose-which-type-of-token-to-use)

### 路径参数

名称 | 类型 | 描述
---|---|---
group_id | string | 用户组 ID。<br>用户组 ID 可在创建用户组时从返回值中获取，你也可以调用[查询用户组列表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/group/simplelist)接口，获取用户组的 ID。<br>**示例值**："g128187"

### 查询参数

名称 | 类型 | 必填 | 描述
---|---|---|---
page_size | int | 否 | 分页大小，用于限制一次请求返回的最大条目数。<br>**示例值**：50<br>**默认值**：`50`<br>**数据校验规则**：<br>- 最大值：`100`
page_token | string | 否 | 分页标记，第一次请求不填，表示从头开始遍历；分页查询结果还有更多项时会同时返回新的 page_token，下次遍历可采用该 page_token 获取查询结果<br>**示例值**：AQD9/Rn9eij9Pm39ED40/dk53s4Ebp882DYfFaPFbz00L4CMZJrqGdzNyc8BcZtDbwVUvRmQTvyMYicnGWrde9X56TgdBuS+JKiSIkdexPw=
member_id_type | string | 否 | 用户组成员 ID 类型。<br>- 当 `member_type` 取值为 `user`时，该参数表示用户 ID 类型，包括 open_id、union_id、user_id。<br>- 当 `member_type` 取值为 `department`时，该参数表示部门 ID 类型，包括 department_id、open_department_id。<br>**示例值**：open_id<br>**可选值有**：<br>- open_id：当 `member_type` 取值为 `user`时，表示用户的 open_id。<br>当 `member_type` 取值为 `department`时，表示部门的 open_department_id。<br>- union_id：当 `member_type` 取值为 `user`时，表示用户的 union_id。<br>- user_id：当 `member_type` 取值为 `user`时，表示用户的 user_id。<br>- department_id：当 `member_type` 取值为 `department`时，表示部门的 department_id。<br>**默认值**：`open_id`
member_type | string | 否 | 用户组成员类型。<br>**示例值**：user<br>**可选值有**：<br>- user：用户，表示仅查询用户组内的用户类型成员。<br>- department：部门，表示仅查询用户组内的部门类型成员。<br>**默认值**：`user`

## 响应

### 响应体

名称 | 类型 | 描述
---|---|---
code | int | 错误码，非 0 表示失败
msg | string | 错误描述
data | \- | \-
memberlist | memberlist\[\] | 成员列表。
member_id | string | 成员 ID。ID 类型与请求时设置的 member_id_type 取值保持一致。
member_type | string | 用户组成员的类型。<br>**可能值有：**<br>- user：用户类型<br>- department：部门类型
member_id_type | string | 成员 ID 类型。该参数仅在请求参数中有效，作为响应体参数时不会返回。
page_token | string | 分页标记，当 has_more 为 true 时，会同时返回新的 page_token，否则不返回 page_token
has_more | boolean | 是否还有更多项

### 响应体示例
```json
{
    "code": 0,
    "msg": "success",
    "data": {
        "memberlist": [
            {
                "member_id": "u287xj12",
                "member_type": "user",
                "member_id_type": "user_id"
            }
        ],
        "page_token": "TDRRV9/Rn9eij9Pm39ED40/dk53s4Ebp882DYfFaPFbz00L4CMZJrqGdzNyc8BcZtDbwVUvRmQTvyMYicnGWrde9X56TgdBuS+JKiJDGexPw=",
        "has_more": true
    }
}
```

### 错误码

HTTP状态码 | 错误码 | 描述 | 排查建议
---|---|---|---
500 | 40003 | internal error | 内部错误，请获取请求的 X-Request-Id，并向[技术支持](https://applink.feishu.cn/TLJpeNdW)进行反馈。
400 | 40011 | page size is invalid | page_size 无效。传入的 page_size 值不能大于 100。
400 | 40012 | page token is invalid error | page_token 无效。你需要参考接口文档的 page_token 参数描述，设置正确的分页参数。
400 | 42002 | invalid group_id | 用户组 ID 无效。你可以调用[查询用户组列表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/group/simplelist)接口，获取准确的用户组 ID。
400 | 41074 | invalid member_type | 无效的成员类型。你需要按照接口文档内 member_type 的参数描述设置正确的值。
400 | 41071 | invalid member_id_type | 无效的成员 ID 类型。你需要按照接口文档内 member_id_type 的参数描述设置正确的值。
400 | 41072 | member_type not match member_id_type | member_type 与 member_id_type 不匹配。你需要调整参数值，使其二者匹配，例如，member_type 取值为 user 时，member_id_type 仅支持设置为 open_id、union_id 或 user_id。
403 | 42009 | no user group authority error | 缺少用户组权限。应用的通讯录权限范围需包含当前操作的用户组。了解应用的通讯录权限范围，可参见[权限范围资源介绍](https://open.feishu.cn/document/ukTMukTMukTM/uETNz4SM1MjLxUzM/v3/guides/scope_authority)。

更多错误码信息，参见[通用错误码](https://open.feishu.cn/document/ukTMukTMukTM/ugjM14COyUjL4ITN)。
