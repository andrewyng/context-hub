# 发送审批 Bot 消息

Source URL: https://open.feishu.cn/document/server-docs/approval-v4/message/send-bot-messages
Updated: 2025-06-23

# 发送审批 Bot 消息

此接口可以用来通过飞书审批的 Bot 推送消息给用户，当有新的审批待办，或者审批待办的状态有更新时，可以通过飞书审批的 Bot 告知用户。如果出现推送成功，但是没有收到消息，可能是因为开通了审批机器人的聚合推送。

## 请求

基本 | &nbsp;
---|---
HTTP URL | https://open.feishu.cn/open-apis/approval/v1/message/send
HTTP Method | POST
接口频率限制 | [1000 次/分钟、50 次/秒](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN)
支持的应用类型 | 自建应用、商店应用
权限要求<br>**调用该 API 所需的权限。开启其中任意一项权限即可调用** | 访问审批应用(approval:approval:readonly)

### 请求头

名称 | 类型 | 必填 | 描述
---|---|---|---
Authorization | string | 是 | `tenant_access_token`<br>以应用身份调用 API，可读写的数据范围由应用自身的 [数据权限范围](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/configure-app-data-permissions) 决定。参考 [自建应用获取 tenant_access_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token_internal) 或 [商店应用获取 tenant_access_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token)。<br>**值格式**："Bearer `access_token`"<br>**示例值**："Bearer t-7f1bcd13fc57d46bac21793a181234"
Content-Type | string | 是 | **固定值**："application/json; charset=utf-8"

### 通用模板请求体

该请求体适用于审批通用模板，可用的模板参见下文 **通用模板** 章节。

名称 | 类型 | 必填 | 描述
---|---|---|---
template_id | string | 是 | 模板编号，具体参考模板列表的 **模板编号** 列。<br>**示例值**：1001
user_id | string | 是 | 接收审批 Bot 消息的目标用户的 user_id。获取方式参见[如何获取用户的 User ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-user-id)。<br>**注意**：user_id 和 open_id 需至少传入一个。<br>**示例值**：b85s39b
open_id | string | 是 | 接收审批 Bot 消息的目标用户的 open_id。获取方式参见[如何获取用户的 Open ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-openid)。<br>**注意**：user_id 和 open_id 需至少传入一个。<br>**示例值**：ou-8ec33278bc2
uuid | string | 否 | 自定义的幂等 ID，最大长度为 64。你可以传入唯一的 UUID 以保证审批 Bot 消息只发送一次。<br>**说明**：UUID 相同的请求，1 小时内只会发送一次审批 Bot 消息。<br>**示例值**：1234567
approval_name | string | 否 | 对应模板标题的 `{approval_name}` 参数。<br>**注意**:<br>- 这里传入的是国际化文案 Key（即 i18n_resources.texts 参数中的 Key），还需要在 i18n_resources.texts 参数中以 Key:Value 格式进行赋值。<br>- Key 需要以 `@i18n@` 开头。<br>**示例值**：@i18n@1
title_user_id | string | 否 | 对应模板标题的 `{title_user_id}`，用来指定审批的申请人、审批人、评论人或者抄送人等。需传入用户 ID，ID 类型与 title_user_id_type 取值保持一致。<br>**示例值**：b85s39b
title_user_id_type | string | 否 | 指定 title_user_id 传入的用户 ID 类型。可选值有：<br>- user_id：标识一个用户在某个租户内的身份。同一个用户在租户 A 和租户 B 内的 User ID 是不同的。在同一个租户内，一个用户的 User ID 在所有应用（包括商店应用）中都保持一致。User ID 主要用于在不同的应用间打通用户数据。获取方式参见[如何获取用户的 User ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-user-id)。<br>- open_id：标识一个用户在某个应用中的身份。同一个用户在不同应用中的 Open ID 不同。获取方式参见[如何获取用户的 Open ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-openid)。<br>**默认值**：user_id
comment | string | 否 | 评论区内容。<br>- 这里传入的是国际化文案 Key（即 i18n_resources.texts 参数中的 Key），还需要在 i18n_resources.texts 参数中以 Key:Value 格式进行赋值。<br>- Key 需要以 `@i18n@` 开头。<br>- 支持的语法参考[Markdown](https://open.feishu.cn/document/ukTMukTMukTM/uADOwUjLwgDM14CM4ATN#abc9b025)。<br>**示例值**：@i18n@2
content | map | 否 | 审批 Bot 消息的内容。当模板的内容存在 `{user_id}`、`{department_id}` 或 `{summaries}` 等参数时，可以通过当前参数配置对应的参数值。
user_id | string | 否 | 审批申请人 ID。<br>- 参数为空时不显示申请人。<br>- ID 类型与 user_id_type 取值保持一致。<br>**示例值**：b85s39b
user_id_type | string | 否 | 审批申请人 ID 的类型。可选值有：<br>- user_id：标识一个用户在某个租户内的身份。同一个用户在租户 A 和租户 B 内的 User ID 是不同的。在同一个租户内，一个用户的 User ID 在所有应用（包括商店应用）中都保持一致。User ID 主要用于在不同的应用间打通用户数据。获取方式参见[如何获取用户的 User ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-user-id)。<br>- open_id：标识一个用户在某个应用中的身份。同一个用户在不同应用中的 Open ID 不同。获取方式参见[如何获取用户的 Open ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-openid)。<br>**默认值**：user_id
department_id | string | 否 | 审批申请人所属部门的 ID。部门 ID 介绍参见[部门 ID](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/department/field-overview#9c02ed7a)。<br>**注意**：<br>- 仅支持传入 department_id，不支持传入 open_department_id。<br>- 如果设置了审批申请人 ID（user_id），且该用户仅属于一个部门，则可以不传 department_id 参数。如果用户属于多个部门，则必须传 department_id。<br>**示例值**：D096
user_name | string | 否 | 审批申请人的名称。<br>**注意**：<br>- 该参数用于申请人不是真实用户的场景。如果传入了 user_id 则优先使用 user_id。<br>- Key 需要以 `@i18n@` 开头。<br>- 这里传入的是国际化文案 Key（即 i18n_resources.texts 参数中的 Key），还需要在 i18n_resources.texts 参数中以 Key:Value 格式进行赋值。<br>**示例值**：@i18n@3
department_name | string | 否 | 审批申请人所属的部门名称。<br>**注意**：<br>- 该参数用于申请人部门不是真实部门的场景。如果传入了 department_id 则优先使用 department_id。<br>- Key 需要以 `@i18n@` 开头。<br>- 这里传入的是国际化文案 Key（即 i18n_resources.texts 参数中的 Key），还需要在 i18n_resources.texts 参数中以 Key:Value 格式进行赋值。<br>**示例值**：@i18n@4
summaries | list | 是 | 审批事由。最多可传入 5 个。
summary | string | 否 | 审批事由。<br>- 这里传入的是国际化文案 Key（即 i18n_resources.texts 参数中的 Key），还需要在 i18n_resources.texts 参数中以 Key:Value 格式进行赋值。<br>- Key 需要以 `@i18n@` 开头。<br>- 支持的语法参考[Markdown](https://open.feishu.cn/document/ukTMukTMukTM/uADOwUjLwgDM14CM4ATN#abc9b025)。<br>**示例值**：@i18n@5
note | string | 否 | 备注。内容用于标注审批来源、访问限制等信息。<br>**注意**：<br>- 这里传入的是国际化文案 Key（即 i18n_resources.texts 参数中的 Key），还需要在 i18n_resources.texts 参数中以 Key:Value 格式进行赋值。<br>- Key 需要以 `@i18n@` 开头。<br>**示例值**：@i18n@5<br>
sender_user_id | string | 否 | 发送人的 user_id，用于发送 IM 卡片。获取方式参考[如何获取用户的 User ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-user-id)。<br>**示例值**：b85s39b
text | string | 否 | 转发留言，用于发送 IM 卡片发送一条留言。<br>**示例值**：请尽快完成审批<br>
actions | list | 是 | 操作区，最多可设置 2 个操作按钮。其中：<br>- 第一个按钮固定为 **查看详情**，必传。<br>- 第二个按钮自定义，可选择传入。<br>
action_name | string | 是 | 操作类型。其中：<br>- 第一个按钮的 action_name 固定取值 DETAIL。<br>- 第二个按钮的 action_name 自定义配置。这里传入的是国际化文案 Key（即 i18n_resources.texts 参数中的 Key），还需要在 i18n_resources.texts 参数中以 Key:Value 格式进行赋值。Key 需要以 `@i18n@` 开头。<br>**示例值**：@i18n@7
url | string | 是 | 默认链接，不同的端配置不同的操作跳转 url，链接必须包含 schema 才能生效。例如：https、http<br>**示例值**：https://www.example.com
android_url | string | 是 | Android 端的跳转链接。<br>**示例值**：https://www.example.com
ios_url | string | 是 | iOS 端的跳转链接。<br>**示例值**：https://www.example.com
pc_url | string | 是 | PC 端的跳转链接。<br>**示例值**：https://www.example.com
action_callback | map | 否 | 快捷审批的回调配置。<br>**说明**：仅样式为橘黄色的模板支持快捷审批参数。
action_callback_url | string | 否 | 三方系统的操作回调 URL。待审批列表的任务审批人点击同意或者拒绝后，审批中心调用该地址通知三方系统。<br>**示例值**：http://www.example.cn/approval/openapi/instanceOperate
action_callback_token | string | 否 | 回调时带的 token，用于业务系统验证请求来自审批。详情参见[事件订阅概述](https://open.feishu.cn/document/ukTMukTMukTM/uUTNz4SN1MjL1UzM)。<br>**示例值**：abc1234def6789
action_callback_key | string | 否 | 请求参数加密密钥，如果配置了该参数，则会对请求参数进行加密，业务需要对请求进行解密。加解密算法详情参考[关联外部选项说明](https://open.feishu.cn/document/ukTMukTMukTM/uADM4QjLwADO04CMwgDN)。<br>**示例值**：gfdqedvsadfgfsd
action_context | string | 否 | 操作上下文，回调的时候会把该参数回传。<br>**示例值**：test
action_configs | list | 否 | 快捷审批的操作配置。<br>**说明**：仅样式为橘黄色的模板支持快捷审批参数。<br>
action_type | string | 是 | 操作类型。可选值有：<br>- APPROVE：同意<br>- REJECT：拒绝<br>- KEY：任意英文字符串，设置该值时，需要设置 action_name 参数。<br>**示例值**：APPROVE
action_name | string | 否 | 操作名称。<br>**注意**：<br>- 当 action_type 取值为 KEY 时，则必须设置该参数值。<br>- 这里传入的是国际化文案 Key（即 i18n_resources.texts 参数中的 Key），还需要在 i18n_resources.texts 参数中以 Key:Value 格式进行赋值。<br>- Key 需要以 `@i18n@` 开头。<br>**示例值**：@i18n@8
is_need_reason | boolean | 否 | 是否需要填写审核意见。可选值有：<br>- true：需要<br>- false：不需要<br>取值为 true 时，操作者在操作审批 Bot 消息后会跳转到意见填写页面。<br>**示例值**：true
is_reason_required | boolean | 否 | 意见是否为必填。<br>**示例值**：true
is_need_attachment | boolean | 否 | 意见是否支持上传附件。<br>**示例值**：true
next_status | string | 否 | 如果回调成功后，审批 Bot 消息会更新成的状态。如果指定则飞书审批会在用户操作后，把消息卡片的状态更新为 {next_status}。如果不指定则飞书审批不会主动更新消息卡片，需自行更新卡片，状态值参见[更新审批 Bot 消息](https://open.feishu.cn/document/ukTMukTMukTM/uAjNyYjLwYjM24CM2IjN)。<br>**示例值**：APPROVED
i18n_resources | list | 是 | 国际化文案。部分参数（如 approval_name、comment 或 note 等）设置了国际化文案 Key 后，需要通过 i18n_resources 设置 Key:Value 关系为参数赋值。<br>例如，approval_name取值为 @i18n@8，则需要在 i18n_resources.texts 中传入 `@i18n@8： 审批实例名称` 为参数赋值。
locale | string | 是 | 语言。可选值有：<br>- zh-CN：中文<br>- en-US：英文<br>- ja-JP：日文<br>**示例值**：zh-CN
is_default | boolean | 是 | 当前语言是否为默认语言。默认语言需要在 texts 中传入所有的 Key:Value，非默认语言如果缺失 Key，则会使用默认语言代替。<br>**示例值**：true
texts | map | 是 | 文案的 Key:Value。Key 需要以 `@i18n@` 开头，并按照各个参数的要求传入 Value。<br>**示例值**：<br>```<br>{<br>"@i18n@1": "权限申请"，<br>"@i18n@2": "OA审批"，<br>"@i18n@3": "Permission"<br>}<br>```

### 通用模板请求体示例
实际使用时请将示例值改为真实值。

```json
{
    "template_id":"1001",
    "user_id":"b85s39b",
    "uuid":"uuid",
    "approval_name":"@i18n@1",
    "title_user_id":"od-8ec33278bc2",
    "title_user_id_type": "user_id",
    "comment":"@i18n@2",
    "content":{
        "user_id":"b85s39b",
      	 "user_id_type": "user_id",
        "department_id":"od-8ec33278bc2",
        "summaries":[
            {
                "summary":"@i18n@3"
            }
        ]
    },
    "note":"@i18n@4",
    "actions":[
        {
            "action_name":"DETAIL",
            "url":" https://bytedance.com",
            "android_url":"https://bytedance.com",
            "ios_url":"https://bytedance.com",
            "pc_url":"https://bytedance.com"
        }
    ],
    "action_configs": [
        {
            "action_type": "APPROVE",
            "is_need_reason": true,
            "is_reason_required": true,
            "is_need_attachment": true,
            "next_status": "APPROVED"
        },
        {
            "action_type": "REJECT",
            "action_name": "@i18n@5",
            "next_status": "REJECTED"
        }
    ],
    "action_callback": {
        "action_callback_url":"http://feish.cn/approval/openapi/operate",
        "action_callback_token":"sdjkljkx9lsadf110",
        "action_callback_key":"gfdqedvsadfgfsd",
        "action_context":"acasdasd"
    },
    "i18n_resources":[
        {
            "locale":"en-US",
            "is_default":true,
            "texts":{
                "@i18n@1":"Temporary release",
                "@i18n@2":"Disapproval",
                "@i18n@3":"Need to modify",
                "@i18n@4":"From OA,please access through the internal network.",
                "@i18n@5":"Cancel"
            }
        }
    ]
}
```

### 自定义模板请求体

该请求体适用于审批自定义模板，可用的模板参见下文 **自定义模板** 章节。

名称 | 类型 | 必填 | 描述
---|---|---|---
template_id | string | 是 | 模板编号，自定义模板编号为 1021。
user_id | string | 是 | 接收审批 Bot 消息的目标用户的 user_id。获取方式参见[如何获取用户的 User ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-user-id)。<br>**注意**：user_id 和 open_id 需至少传入一个。<br>**示例值**：b85s39b
uuid | string | 否 | 自定义的幂等 ID，最大长度为 ，用于保证消息只发送一次。64UUID 和 user_id 相同的请求，只会发送一次消息。<br>**示例值**：1234567
custom_title | string | 是 | 模板标题。<br>**注意**:<br>- 这里传入的是国际化文案 Key（即 i18n_resources.texts 参数中的 Key），还需要在 i18n_resources.texts 参数中以 Key：Value 格式进行赋值。<br>- Key 需要以 `@i18n@` 开头。<br>**示例值**：@i18n@1
custom_content | string | 是 | 模板内容。<br>- 这里传入的是国际化文案 Key（即 i18n_resources.texts 参数中的 Key），还需要在 i18n_resources.texts 参数中以 Key：Value 格式进行赋值。<br>- Key 需要以 `@i18n@` 开头。<br>- 支持的语法参考[Markdown](https://open.feishu.cn/document/ukTMukTMukTM/uADOwUjLwgDM14CM4ATN#abc9b025)。<br>**示例值**：@i18n@2
note | string | 否 | 备注。内容用于标注审批来源、访问限制等信息。<br>**注意**：<br>- 这里传入的是国际化文案 Key（即 i18n_resources.texts 参数中的 Key），还需要在 i18n_resources.texts 参数中以 Key：Value 格式进行赋值。<br>- Key 需要以 `@i18n@` 开头。<br>**示例值**：@i18n@3
actions | list | 是 | 操作区，用于设置操作按钮，最多可设置 2 个按钮。
action_name | string | 是 | 操作按钮的内容。<br>**注意**：<br>- 这里传入的是国际化文案 Key（即 i18n_resources.texts 参数中的 Key），还需要在 i18n_resources.texts 参数中以 Key：Value 格式进行赋值。<br>- Key 需要以 `@i18n@` 开头。<br>**示例值**：@i18n@3
url | string | 是 | 默认链接，不同的端配置不同的操作跳转 url，链接必须包含 schema 才能生效。例如：https、http<br>**示例值**：https://www.example.com
android_url | string | 是 | Android 端的跳转链接。<br>**示例值**：https://www.example.com
ios_url | string | 是 | iOS 端的跳转链接。<br>**示例值**：https://www.example.com
pc_url | string | 是 | PC 端的跳转链接。<br>**示例值**：https://www.example.com
i18n_resources | list | 是 | 国际化文案。部分参数（如 approval_name、comment 或 note 等）设置了国际化文案 Key 后，需要通过 i18n_resources 设置 Key：value 关系为参数赋值。<br>例如，approval_name取值为 @i18n@8，则需要在 i18n_resources.texts 中传入 `@i18n@8： 审批实例名称` 为参数赋值。
locale | string | 是 | 语言。可选值有：<br>- zh-CN：中文<br>- en-US：英文<br>- ja-JP：日文<br>**示例值**：zh-CN
is_default | boolean | 是 | 当前语言是否为默认语言。默认语言需要在 texts 中传入所有的 Key：Value，非默认语言如果缺失 Key，则会使用默认语言代替。<br>**示例值**：true
texts | map | 是 | 文案的 Key:Value。Key 需要以 `@i18n@` 开头，并按照各个参数的要求传入 Value。<br>**示例值**：<br>```<br>{<br>"@i18n@1": "权限申请"，<br>"@i18n@2": "OA审批"，<br>"@i18n@3": "Permission"<br>}<br>```

### 自定义模板请求体示例
实际使用时请将示例值改为真实值。

```json
{
    "template_id":"1021",
    "user_id":"employeeId1",
    "uuid":"uuid",
    "custom_title":"@i18n@1",
    "custom_content":"@i18n@2",
    "note":"@i18n@3",
    "actions":[
        {
            "action_name":"@i18n@4",
            "url":" https://bytedance.com",
            "android_url":"https://bytedance.com",
            "ios_url":"https://bytedance.com",
            "pc_url":"https://bytedance.com"
        }
    ],
    "i18n_resources":[
        {
            "locale":"en-US",
            "is_default":true,
            "texts":{
                "@i18n@1":"Custom template",
                "@i18n@2":"Please help process my approval as soon as possible.",
                "@i18n@3":"From OA,please access through the internal network.",
                "@i18n@4":"DETAIL"
            }
        }
    ]
}

```

## 响应

### 响应体

|参数|类型|说明|
|-|-|-|-|
|code|int|错误码，非 0 表示失败|
|msg|string|返回码的描述|
|data|map|返回业务信息|
|&emsp;∟message_id|string|消息 ID，用于[更新审批 Bot 消息](https://open.feishu.cn/document/ukTMukTMukTM/uAjNyYjLwYjM24CM2IjN)|

### 响应体示例 
```json
{
    "code":0,
    "msg":"success",
    "data":{
        "message_id": "6968359519504171036"
    }
}
```

### 错误码

具体可参考：[服务端错误码说明](https://open.feishu.cn/document/ukTMukTMukTM/ugjM14COyUjL4ITN)

## 模板列表

模板分为通用模板和自定义模板两类，使用时，需要传入对应模板的编号以及参数信息。

### 通用模板

模版编号 | 模板名称 | 模板样式 | 说明
---|---|---|---
1001 | 收到评论 | 模板样式如下图所示，其中`{xxx}`占位符对应着请求参数在模板内生效的位置。<br> | 必填参数：<br>- approval_name<br>- title_user_id<br>- summaries<br>- actions<br>- comment
1002 | 审批暂存待办 | 模板样式如下图所示，其中`{xxx}`占位符对应着请求参数在模板内生效的位置。<br> | 必填参数：<br>- approval_name<br>- title_user_id<br>- summaries<br>- actions
1003 | 审批已拒绝 | 模板样式如下图所示，其中`{xxx}`占位符对应着请求参数在模板内生效的位置。<br> | 必填参数：<br>- approval_name<br>- title_user_id<br>- summaries<br>- actions
1004 | 审批已通过 | 模板样式如下图所示，其中`{xxx}`占位符对应着请求参数在模板内生效的位置。<br> | 必填参数：<br>- approval_name<br>- title_user_id<br>- summaries<br>- actions<br>- comment
1005 | 成功发起了审批 | 模板样式如下图所示，其中`{xxx}`占位符对应着请求参数在模板内生效的位置。<br> | 必填参数：<br>- approval_name<br>- summaries<br>- actions
1006 | 审批将被关闭 | 模板样式如下图所示，其中`{xxx}`占位符对应着请求参数在模板内生效的位置。<br> | 必填参数：<br>- approval_name<br>- summaries<br>- actions
1007 | 审批已被关闭 | 模板样式如下图所示，其中`{xxx}`占位符对应着请求参数在模板内生效的位置。<br> | 必填参数：<br>- approval_name<br>- summaries<br>- actions
1008 | 收到审批待办 | 模板样式如下图所示，其中`{xxx}`占位符对应着请求参数在模板内生效的位置。该模板支持快捷审批参数。<br> | 必填参数：<br>- approval_name<br>- title_user_id<br>- summaries<br>- actions<br>快捷审批参数：<br>- action_configs<br>- action_callback<br>**注意**：<br>- title_user_id 为空时，标题展示为：`{approval_name}待你审批`<br>- 申请人user_id，取content下的user_id
1028 | 收到审批待办（无审批发起人） | 模板样式如下图所示，其中`{xxx}`占位符对应着请求参数在模板内生效的位置。该模板支持快捷审批参数。<br> | 必填参数：<br>- approval_name<br>- summaries<br>- actions<br>快捷审批参数：<br>- action_configs<br>- action_callback
1009 | 被加签 | 模板样式如下图所示，其中`{xxx}`占位符对应着请求参数在模板内生效的位置。该模板支持快捷审批参数。<br> | 必填参数：<br>- approval_name<br>- title_user_id<br>- summaries<br>- actions<br>快捷审批参数：<br>- action_configs<br>- action_callback<br>**注意**：<br>- 申请人user_id，取content下的user_id
1010 | 被转交 | 模板样式如下图所示，其中`{xxx}`占位符对应着请求参数在模板内生效的位置。该模板支持快捷审批参数。<br> | 必填参数：<br>- approval_name<br>- title_user_id<br>- summaries<br>- actions<br>快捷审批参数：<br>- action_configs<br>- action_callback<br>**注意**：<br>- 申请人user_id，取content下的user_id
1011 | 被委托 | 模板样式如下图所示，其中`{xxx}`占位符对应着请求参数在模板内生效的位置。该模板支持快捷审批参数。<br> | 必填参数：<br>- approval_name<br>- title_user_id<br>- summaries<br>- actions<br>快捷审批参数：<br>- action_configs<br>- action_callback<br>**注意**：<br>- 申请人user_id，取content下的user_id
1012 | 被回退 | 模板样式如下图所示，其中`{xxx}`占位符对应着请求参数在模板内生效的位置。该模板支持快捷审批参数。<br> | 必填参数：<br>- approval_name<br>- title_user_id<br>- summaries<br>- actions<br>快捷审批参数：<br>- action_configs<br>- action_callback<br>**注意**：<br>- 申请人user_id，取content下的user_id
1013 | 人工催办（个人 IM） | 模板样式如下图所示，其中`{xxx}`占位符对应着请求参数在模板内生效的位置。该模板支持快捷审批参数。<br> | 必填参数：<br>- approval_name<br>- title_user_id<br>- summaries<br>- actions<br>- sender_user_id<br>快捷审批参数：<br>- action_configs<br>- action_callback<br>**注意**：<br>- 申请人user_id，取content下的user_id
1015 | 被撤回 | 模板样式如下图所示，其中`{xxx}`占位符对应着请求参数在模板内生效的位置。<br> | 必填参数：<br>- approval_name<br>- title_user_id<br>- summaries<br>- actions<br>**注意**：<br>- 申请人user_id，取content下的user_id
1016 | 被抄送 | 模板样式如下图所示，其中`{xxx}`占位符对应着请求参数在模板内生效的位置。<br> | 必填参数：<br>- approval_name<br>- title_user_id<br>- summaries<br>- actions<br>**注意**：<br>- 申请人user_id，取content下的user_id
1017 | 评论被回复 | 模板样式如下图所示，其中`{xxx}`占位符对应着请求参数在模板内生效的位置。<br> | 必填参数：<br>- approval_name<br>- title_user_id<br>- summaries<br>- actions<br>- comment<br>**注意**：<br>- 申请人user_id，取content下的user_id
1018 | 评论被提及 | 模板样式如下图所示，其中`{xxx}`占位符对应着请求参数在模板内生效的位置。<br> | 必填参数：<br>- approval_name<br>- title_user_id<br>- ummaries<br>- actions<br>- comment<br>**注意**：<br>- 申请人user_id，取content下的user_id
1019 | 申请人离职转交主管 | 模板样式如下图所示，其中`{xxx}`占位符对应着请求参数在模板内生效的位置。<br> | 必填参数：<br>- approval_name<br>- title_user_id<br>- summaries<br>- actions<br>**注意**：<br>- 申请人user_id，取content下的user_id
1020 | 审批人离职抄送主管 | 模板样式如下图所示，其中`{xxx}`占位符对应着请求参数在模板内生效的位置。该模板支持快捷审批参数。<br> | 必填参数：<br>- approval_name<br>- title_user_id<br>- summaries<br>- actions<br>快捷审批参数：<br>- action_configs<br>- action_callback<br>**注意**：<br>- 申请人user_id，取content下的user_id
1024 | 审批分享 | 模板样式如下图所示，其中`{xxx}`占位符对应着请求参数在模板内生效的位置。<br> | 必填参数：<br>- approval_name<br>- summaries<br>- actions<br>**注意**：<br>- 申请人user_id，取content下的user_id
1026 | 系统抄送 | 模板样式如下图所示，其中`{xxx}`占位符对应着请求参数在模板内生效的位置。<br> | 必填参数：<br>- approval_name<br>- title_user_id<br>- summaries<br>- actions<br>**注意**：<br>- 申请人user_id，取content下的user_id
1027 | 添加评论 | 模板样式如下图所示，其中`{xxx}`占位符对应着请求参数在模板内生效的位置。<br> | 必填字段：<br>- approval_name<br>- title_user_id<br>- summaries<br>- actions<br>- comment<br>**注意**：<br>- 申请人user_id，取content下的user_id

### 自定义模板

模版编号 | 模板名称 | 模板样式与字段 | 说明
---|---|---|---
1021 | 自定义模板 | 样式固定、内容完全自定义的模板。<br> | 必填字段：<br>- custom_title<br>- custom_content
