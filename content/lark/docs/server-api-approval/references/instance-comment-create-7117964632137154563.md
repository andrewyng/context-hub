# 创建评论

Source URL: https://open.feishu.cn/document/server-docs/approval-v4/instance-comment/create
Updated: 2025-04-21

# 创建评论

在指定审批实例下创建、修改评论或回复评论（不包含审批同意、拒绝、转交等附加的理由或意见）。

## 请求

基本 | &nbsp;
---|---
HTTP URL | https://open.feishu.cn/open-apis/approval/v4/instances/:instance_id/comments
HTTP Method | POST
接口频率限制 | [1000 次/分钟、50 次/秒](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN)
支持的应用类型 | 自建应用、商店应用
权限要求<br>**调用该 API 所需的权限。开启其中任意一项权限即可调用**<br>开启任一权限即可 | 查看、创建、更新、删除审批应用相关信息(approval:approval)<br>查看、创建、更新、删除原生审批评论相关信息(approval:instance.comment)
字段权限要求 | **注意事项**：该接口返回体中存在下列敏感字段，仅当开启对应的权限后才会返回；如果无需获取这些字段，则不建议申请<br>获取用户 user ID(contact:user.employee_id:readonly)

### 请求头

名称 | 类型 | 必填 | 描述
---|---|---|---
Authorization | string | 是 | `tenant_access_token`<br>**值格式**："Bearer `access_token`"<br>**示例值**："Bearer t-7f1bcd13fc57d46bac21793a18e560"<br>[了解更多：如何选择与获取 access token](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-choose-which-type-of-token-to-use)
Content-Type | string | 是 | **固定值**："application/json; charset=utf-8"

### 路径参数

名称 | 类型 | 描述
---|---|---
instance_id | string | 审批实例 Code。获取方式：<br>- [创建审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/create) 后，从返回结果中获取审批实例 Code。<br>- 调用[批量获取审批实例 ID](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/list)，获取指定审批定义内的审批实例 Code。<br>- 调用[查询实例列表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/query)，设置过滤条件查询指定的审批实例 Code。<br>说明：支持传入自定义审批实例 ID。<br>**示例值**："6A123516-FB88-470D-A428-9AF58B71B3C0"

### 查询参数

名称 | 类型 | 必填 | 描述
---|---|---|---
user_id_type | string | 否 | 用户 ID 类型<br>**示例值**：user_id<br>**可选值有**：<br>- open_id：标识一个用户在某个应用中的身份。同一个用户在不同应用中的 Open ID 不同。[了解更多：如何获取 Open ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-openid)<br>- union_id：标识一个用户在某个应用开发商下的身份。同一用户在同一开发商下的应用中的 Union ID 是相同的，在不同开发商下的应用中的 Union ID 是不同的。通过 Union ID，应用开发商可以把同个用户在多个应用中的身份关联起来。[了解更多：如何获取 Union ID？](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-union-id)<br>- user_id：标识一个用户在某个租户内的身份。同一个用户在租户 A 和租户 B 内的 User ID 是不同的。在同一个租户内，一个用户的 User ID 在所有应用（包括商店应用）中都保持一致。User ID 主要用于在不同的应用间打通用户数据。[了解更多：如何获取 User ID？](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-user-id)<br>**默认值**：`open_id`<br>**当值为 `user_id`，字段权限要求**：<br>获取用户 user ID(contact:user.employee_id:readonly)
user_id | string | 是 | 用户 ID，ID 类型与 user_id_type 取值一致。<br>**示例值**：e5286g26

### 请求体

名称 | 类型 | 必填 | 描述
---|---|---|---
content | string | 否 | 评论内容，JSON 格式，传入时需要压缩转义为字符串。以下示例值未转义，你可参考请求体示例中的示例 content 进行编辑。<br>**JSON 内参数说明**：<br>- text：string 类型，评论文本内容。<br>- files：Attachment[] 类型，附件信息。<br>- url：string 类型，附件链接。<br>- thumbnailURL：string 类型，缩略图链接。<br>- fileSize：int64 类型，文件大小。<br>- title：string 类型，标题。<br>- type：string 类型，附件类型，取值 image 表示图片类型。<br>**注意**：<br>- 如需 @用户，则需要在该参数内设置用户名的文本，例如 `@username`，同时通过 at_info_list 参数实现 @ 效果。<br>- 对于附件，在 PC 端使用 HTTP 资源链接传图片资源可能会导致缩略图异常，建议使用 HTTPS 传资源附件。<br>**示例值**："{\"text\":\"@username艾特展示\",\"files\":[{\"url\":\"xxx\",\"fileSize\":155149,\"title\":\"9a9fedc5cfb01a4a20c715098.png\",\"type\":\"image\",\"extra\":\"\"}]}"
at_info_list | comment_at_info\[\] | 否 | 评论中艾特人信息
user_id | string | 是 | 被艾特人的 ID，ID 类型与查询参数 user_id_type 取值一致。<br>**示例值**："579fd9c4"
name | string | 是 | 被艾特人的姓名<br>**示例值**："张敏"
offset | string | 是 | 被艾特人在评论中的位置，从 0 开始。用于偏移覆盖。例如：<br>- 取值为 0 时的效果：@username 示例文本<br>- 取值为 2 时的效果：示例 @username 文本<br>- 取值为 4 时的效果：示例文本 @username<br>**注意**：该参数生效方式是覆盖生效，因此你需要先通过 content 参数设置用户名称的文本内容，然后再通过该参数将实际生效的@效果覆盖到用户名称的文本内容上。<br>**示例值**："0"
parent_comment_id | string | 否 | 父评论 ID，如果是回复评论，需要传入该值。获取方式：<br>- 调用当前接口成功后会返回本次评论的 ID，你可以保存用于下次使用。<br>- 调用[获取评论](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance-comment/list)接口，获取评论 ID。<br>**示例值**："7081516627711524883"
comment_id | string | 否 | 评论 ID。如果需要编辑、删除一条评论，则需要将该评论的 ID 传入当前参数。获取方式：<br>- 调用当前接口成功后会返回本次评论的 ID，你可以保存用于下次使用。<br>- 调用[获取评论](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance-comment/list)接口，获取评论 ID。<br>**示例值**："7081516627711524883"
disable_bot | boolean | 否 | 是否不启用 Bot，取值为 true 时只同步数据，不触发 Bot。<br>**说明**：飞书审批中自定义审批填写 false，其他情况填写 true。<br>**示例值**：false
extra | string | 否 | 附加字段，JSON 格式，传入时需要压缩转义为字符串。<br>**示例值**："{\"a\":\"a\"}"

### 请求体示例
```json
{
    "content": "{\"text\":\"@username艾特展示\",\"files\":[{\"url\":\"xxx\",\"fileSize\":155149,\"title\":\"9a9fedc5cfb01a4a20c715098.png\",\"type\":\"image\",\"extra\":\"\"}]}",
    "at_info_list": [
        {
            "user_id": "579fd9c4",
            "name": "张敏",
            "offset": "0"
        }
    ],
    "parent_comment_id": "7081516627711524883",
    "comment_id": "7081516627711524883",
    "disable_bot": false,
    "extra": "{\"a\":\"a\"}"
}
```

## 响应

### 响应体

名称 | 类型 | 描述
---|---|---
code | int | 错误码，非 0 表示失败
msg | string | 错误描述
data | \- | \-
comment_id | string | 评论 ID。

### 响应体示例
```json
{
    "code": 0,
    "msg": "success",
    "data": {
        "comment_id": "7081516627711606803"
    }
}
```

### 错误码

HTTP状态码 | 错误码 | 描述 | 排查建议
---|---|---|---
400 | 1390001 | param is invalid | 参数错误。排查方案：<br>- 根据接口文档的参数说明，检查请求时传入的参数是否正确。<br>- 如果传入的有表单参数（form），则需要检查该参数内传入的表单控件数据是否正确。如果报错信息内包含控件 ID（如 `控件= widget17261088448220001`），可以调用[查看指定审批定义](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/approval/get)或者[获取单个审批实例详情](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/get)接口，获取响应参数 form 值，检索有问题的控件 ID，然后检查该控件的配置是否正确。

更多错误码信息，参见[通用错误码](https://open.feishu.cn/document/ukTMukTMukTM/ugjM14COyUjL4ITN)。
