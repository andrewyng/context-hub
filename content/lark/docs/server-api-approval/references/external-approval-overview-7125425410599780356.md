# 三方审批定义概述

Source URL: https://open.feishu.cn/document/server-docs/approval-v4/external_approval/overview
Updated: 2025-04-21

# 三方审批定义概述

三方审批定义 API 用于将企业原有的审批系统与飞书审批系统连通，连通仅为数据层的连通，即企业无需改造原有的审批系统，只需创建三方审批定义，设置三方审批系统的访问方式、回调 URL 以及加密密钥等数据，使三方审批系统的审批数据可以在飞书审批之间来回流转，从而实现企业员工在飞书内一站式查看和处理所有审批任务。

## 使用说明

三方审批定义主要用于定义：

- 三方审批接入飞书审批中心后，在审批中心内的名称、分组、可见范围等基础信息。
- 三方审批发起页的跳转链接。员工在飞书内发起审批时，本质上是跳转到三方审批的发起页，进行审批发起操作。
- 三方审批回调 URL，该 URL 用于接收飞书内审批状态的变更。例如，审批人在飞书审批中心 `同意` 三方审批时，系统会将 `同意` 数据发送给三方审批回调 URL，三方审批系统接收数据后，即可将对应的审批置为同意状态。

开放平台提供了开发教程，帮助你了解如何将三方审批接入飞书审批中心并流转起来，详情参见[快速开发三方审批](https://open.feishu.cn/document/home/quickly-develop-three-party-approvals/introduction)。
如需使用审批小程序实现客户端内网页免登，只能使用[客户端内网页免登（旧）](https://open.feishu.cn/document/uYjL24iN/ukTO4UjL5kDO14SO5gTN#782a5834) 的方式。

## 字段说明

名称 | 类型 | 描述
---|---|---
approval_name | string | 三方审批定义名称。<br>- 这里传入的是国际化文案 Key（即 i18n_resources.texts 参数中的 Key），还需要在 i18n_resources.texts 参数中以 Key:Value 格式进行赋值。<br>- 该参数需要以 @i18n@ 开头。<br>**示例值**："@i18n@1"
approval_code | string | 三方审批定义 Code，是审批定义的唯一标识。具体说明：<br>- 如果传入的值系统可以匹配到已存在的审批定义 approval_code，则调用该接口会更新相应的审批定义。<br>- 如果传入的值系统匹配不到任何审批定义 approval_code，则会新建一个审批定义，并返回新建的审批定义真实的 approval_code（并非你通过该参数传入的值）。<br>**示例值**："permission_test"
group_code | string | 审批定义所属审批分组，用户自定义。具体说明：<br>- 如果传入的 group_code 当前不存在，则会新建审批分组。<br>- 如果 group_code 已经存在，则会使用 group_name 更新审批分组名称。<br>**示例值**："work_group"
group_name | string | 审批分组名称。这里传入的是国际化文案 Key（即 i18n_resources.texts 参数中的 Key），还需要在 i18n_resources.texts 参数中以 Key:Value 格式进行赋值，该参数需要以 @i18n@ 开头。<br>- 如果 group_code 当前不存在，则该 group_name 必填，表示新建审批分组。<br>- 如果 group_code 存在，则会更新分组名称，不填则不更新分组名称。审批发起页的审批定义分组名称来自该字段。<br>**示例值**："@i18n@2"
description | string | 审批定义的说明，后续企业员工发起审批时，该说明会在审批发起页展示。<br>- 这里传入的是国际化文案 Key（即 i18n_resources.texts 参数中的 Key），还需要在 i18n_resources.texts 参数中以 Key:Value 格式进行赋值。<br>- 该参数需要以 @i18n@ 开头。<br>**示例值**："@i18n@2"
external | approval_create_external | 三方审批相关信息。
biz_name | string | 列表中用于提示审批来自哪个三方系统。<br>**注意**：<br>- 这里传入的是国际化文案 Key（即 i18n_resources.texts 参数中的 Key），还需要在 i18n_resources.texts 参数中以 Key:Value 格式进行赋值。<br>- 该参数需要以 @i18n@ 开头。<br>- 在 i18n_resources 中为该参数赋值时，无需设置 **来自** 前缀，审批中心默认会拼接 **来自** 前缀。<br>**示例值**："@i18n@3"
biz_type | string | 审批定义业务类别。<br>**示例值**："permission"
create_link_mobile | string | 移动端发起三方审批的链接。<br>- 如果设置了该链接，则在移动端发起审批时，会跳转到该链接对应的三方审批发起页。<br>- 如果不设置该链接，则在移动端不显示该审批。<br>**示例值**："https://applink.feishu.cn/client/mini_program/open?appId=cli_9c90fc38e07a9101&path=pages/approval-form/index?id=9999"
create_link_pc | string | PC端发起三方审批的链接。<br>- 如果设置了该链接，则在 PC 端发起审批时，会跳转到该链接对应的三方审批发起页。<br>- 如果不设置该链接，则在 PC 端不显示该审批。<br>**示例值**："https://applink.feishu.cn/client/mini_program/open?mode=appCenter&appId=cli_9c90fc38e07a9101&path=pc/pages/create-form/index?id=9999"
support_pc | boolean | 审批实例、审批任务、审批抄送是否要在 PC 端展示。<br>- 如果取值为 true，则 PC 端列表会展示该定义下的实例信息。<br>- 如果取值为 false，则 PC 端列表不展示该定义下的实例信息。<br>**示例值**：true
support_mobile | boolean | 审批实例、审批任务、审批抄送是否要在移动端展示。<br>- 如果取值为 true，则移动端列表会展示该定义下的实例信息。<br>- 如果取值为 false，则移动端列表不展示该定义下的实例信息。<br>**示例值**：true
support_batch_read | boolean | 是否支持批量已读<br>**示例值**：true
action_callback_url | string | 三方系统的操作回调 URL，**待审批** 实例的任务审批人点击同意或拒绝操作后，审批中心调用该 URL 通知三方系统，回调地址相关信息可参见[三方审批快捷审批回调](https://open.feishu.cn/document/ukTMukTMukTM/ukjNyYjL5YjM24SO2IjN/quick-approval-callback)。<br>**示例值**："http://www.feishu.cn/approval/openapi/instanceOperate"
action_callback_token | string | 回调时带的 token，用于业务系统验证请求来自审批中心。<br>**示例值**："token1234"
action_callback_key | string | 请求参数加密密钥。如果配置了该参数，则会对请求参数进行加密，接收请求后需要对请求进行解密。加解密算法参考[关联外部选项说明](https://open.feishu.cn/document/ukTMukTMukTM/uADM4QjLwADO04CMwgDN)。<br>**示例值**："sdjkljkx9lsadf110"
allow_batch_operate | boolean | 是否支持批量审批。取值为 true 时，审批人在处理该定义下的审批任务时可以批量处理多个任务。<br>**示例值**：false
viewers | approval_create_viewers\[\] | 审批可见人列表，列表长度上限 200，只有在审批可见人列表内的用户，才可以在审批发起页看到该审批。若该参数不传值，则表示任何人不可见。
viewer_type | string | 可见人类型<br>**可选值有**：<br>- TENANT：租户内可见<br>- DEPARTMENT：指定部门<br>- USER：指定用户<br>- NONE：任何人都不可见<br>**示例值**："USER"
viewer_user_id | string | 当 viewer_type 取值为 USER 时，需指定用户 ID。<br>**示例值**："19a294c2"
viewer_department_id | string | 当 view_type 取值为 DEPARTMENT 时，需指定部门 ID。<br>**示例值**："od-ac9d697abfa990b715dcc33d58a62a9d"
i18n_resources | i18n_resource\[\] | 国际化文案
locale | string | 语言。可选值有： <br>- zh-CN：中文 <br>- en-US：英文 <br>- ja-JP：日文<br>**示例值**："zh-CN"<br>**可选值有**：<br>- zh-CN：中文<br>- en-US：英文<br>- ja-JP：日文
texts | i18n_resource_text\[\] | 文案的 Key:Value。Key 需要以 @i18n@ 开头，并按照各个参数的要求传入 Value。<br>**说明**：该字段主要用于适配国际化，允许同时设置多个语言的文案，审批中心会根据实际用户当前的语音环境使用匹配的文案。如果没有设置用户当前的语音环境文案，则会使用默认的语言文案。
key | string | 文案 Key，需要和各个参数 Key 相匹配。<br>**示例值**："@i18n@1"
value | string | 文案 Value，即文案 Key 对应的参数值。<br>**示例值**："people"
is_default | boolean | 是否为默认语言。默认语言需要包含所有所需的文案 Key，非默认语言如果 Key 不存在，则会使用默认语言代替。<br>**示例值**：true

## 数据示例

```json
{
    "approval_name": "@i18n@1",
    "approval_code": "permission_test",
    "group_code": "work_group",
    "group_name": "@i18n@2",
    "external": {
        "create_link_pc": "https://applink.feishu.cn/client/mini_program/open?mode=appCenter&appId=cli_9c90fc38e07a9101&path=pc%2Fpages%2Fcreate-form%2Findex%3Fid%3D9999",
        "create_link_mobile": "https://applink.feishu.cn/client/mini_program/open?appId=cli_9c90fc38e07a9101&path=pages%2Fapproval-form%2Findex%3Fid%3D9999",
        "support_pc": true,
        "support_mobile": true,
        "support_batch_read": false,
        "action_callback_url":"http://feishu.cn/approval/openapi/operate",
        "action_callback_token":"sdjkljkx9lsadf110",
        "action_callback_key":"gfdqedvsadfgfsd",
        "enable_mark_readed": false,
        "key": "",
        "token":""
    },
    "i18n_resources":[
     {
        "locale":"zh-CN",
        "is_default":true,
         "texts":[
             {
             "key": "@i18n@1",
             "value":"people"  
            },
            {
             "key": "@i18n@2",
             "value":"hr"  
            }
         ]
      }
    ],
    "viewers": [
        {
            "viewer_type": "TENANT"
        }
    ]
}
```
