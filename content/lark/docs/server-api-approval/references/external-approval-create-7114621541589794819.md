# 创建三方审批定义

Source URL: https://open.feishu.cn/document/server-docs/approval-v4/external_approval/create
Updated: 2025-07-31

# 创建三方审批定义

三方审批定义用于设置审批的名称、描述等基本信息，以及三方审批系统的审批发起页、回调 URL 等信息，使企业员工在飞书审批内即可发起并操作三方审批。

## 注意事项

飞书审批中心不负责审批流程的流转，只负责审批的展示、状态操作、消息通知。因此，创建三方审批定义时，没有审批流程的参数配置项。

## 请求

基本 | &nbsp;
---|---
HTTP URL | https://open.feishu.cn/open-apis/approval/v4/external_approvals
HTTP Method | POST
接口频率限制 | [1000 次/分钟、50 次/秒](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN)
支持的应用类型 | 自建应用、商店应用
权限要求<br>**调用该 API 所需的权限。开启其中任意一项权限即可调用**<br>开启任一权限即可 | 查看、创建、更新、删除审批应用相关信息(approval:approval)<br>查看、创建、更新、删除三方审批定义相关信息(approval:external_approval)
字段权限要求 | **注意事项**：该接口返回体中存在下列敏感字段，仅当开启对应的权限后才会返回；如果无需获取这些字段，则不建议申请<br>获取用户 user ID(contact:user.employee_id:readonly)

### 请求头

名称 | 类型 | 必填 | 描述
---|---|---|---
Authorization | string | 是 | `tenant_access_token`<br>**值格式**："Bearer `access_token`"<br>**示例值**："Bearer t-7f1bcd13fc57d46bac21793a18e560"<br>[了解更多：如何选择与获取 access token](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-choose-which-type-of-token-to-use)
Content-Type | string | 是 | **固定值**："application/json; charset=utf-8"

### 查询参数

名称 | 类型 | 必填 | 描述
---|---|---|---
department_id_type | string | 否 | 此次调用中的部门 ID 类型。关于部门 ID 的详细介绍，可参见[部门 ID 说明](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/department/field-overview#23857fe0)。<br>**示例值**：open_department_id<br>**可选值有**：<br>- department_id：支持用户自定义配置的部门 ID。自定义配置时可复用已删除的 department_id，因此在未删除的部门范围内 department_id 具有唯一性。<br>- open_department_id：由系统自动生成的部门 ID，ID 前缀固定为 `od-`，在租户内全局唯一。<br>**默认值**：`open_department_id`
user_id_type | string | 否 | 用户 ID 类型<br>**示例值**：open_id<br>**可选值有**：<br>- open_id：标识一个用户在某个应用中的身份。同一个用户在不同应用中的 Open ID 不同。[了解更多：如何获取 Open ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-openid)<br>- union_id：标识一个用户在某个应用开发商下的身份。同一用户在同一开发商下的应用中的 Union ID 是相同的，在不同开发商下的应用中的 Union ID 是不同的。通过 Union ID，应用开发商可以把同个用户在多个应用中的身份关联起来。[了解更多：如何获取 Union ID？](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-union-id)<br>- user_id：标识一个用户在某个租户内的身份。同一个用户在租户 A 和租户 B 内的 User ID 是不同的。在同一个租户内，一个用户的 User ID 在所有应用（包括商店应用）中都保持一致。User ID 主要用于在不同的应用间打通用户数据。[了解更多：如何获取 User ID？](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-user-id)<br>**默认值**：`open_id`<br>**当值为 `user_id`，字段权限要求**：<br>获取用户 user ID(contact:user.employee_id:readonly)

### 请求体

名称 | 类型 | 必填 | 描述
---|---|---|---
approval_name | string | 是 | 三方审批定义名称。<br>- 这里传入的是国际化文案 Key（即 i18n_resources.texts 参数中的 Key），还需要在 i18n_resources.texts 参数中以 Key:Value 格式进行赋值。<br>- 该参数需要以 @i18n@ 开头，长度不得少于 9 个字符。<br>**示例值**："@i18n@demoname"
approval_code | string | 是 | 应用自定义Code，最大支持128字符，用于唯一关联三方审批定义，具体说明：<br>- 如果传入的值系统可以匹配到已存在的审批定义 approval_code，则调用该接口会更新相应的审批定义。<br>- 如果传入的值系统匹配不到任何审批定义 approval_code，则会新建一个审批定义，并返回新建的审批定义真实的 approval_code（并非通过该参数传入的值）。<br>**示例值**："F46EB460-9476-4789-9524-ECD564291234"
group_code | string | 否 | 审批定义所属审批分组，用户自定义。具体说明：<br>- 如果传入的 group_code 当前不存在，则会新建审批分组。<br>- 如果 group_code 已经存在，则会使用 group_name 更新审批分组名称。<br>- 更新审批定义时可以不传该字段，会继续使用当前绑定的分组。<br>**示例值**："work_group"
group_name | string | 否 | 审批分组名称，审批发起页的审批定义分组名称来自该字段。具体说明：<br>- 这里传入的是国际化文案 Key（即 i18n_resources.texts 参数中的 Key），还需要在 i18n_resources.texts 参数中以 Key:Value 格式进行赋值。<br>- 该参数需要以 @i18n@ 开头。<br>- 如果 group_code 当前不存在，则该 group_name 必填，表示新建审批分组时设置分组名称。<br>- 如果 group_code 存在，则会更新分组名称，不填则不更新分组名称。<br>**示例值**："@i18n@2"
description | string | 否 | 审批定义的说明，后续企业员工发起审批时，该说明会在审批发起页展示。<br>- 这里传入的是国际化文案 Key（即 i18n_resources.texts 参数中的 Key），还需要在 i18n_resources.texts 参数中以 Key:Value 格式进行赋值。<br>- 该参数需要以 @i18n@ 开头。<br>**示例值**："@i18n@2"
external | approval_create_external | 是 | 三方审批相关信息。
biz_name | string | 否 | 列表中用于提示审批来自哪个三方系统。<br>**注意**：<br>- 这里传入的是国际化文案 Key（即 i18n_resources.texts 参数中的 Key），还需要在 i18n_resources.texts 参数中以 Key:Value 格式进行赋值。<br>- 该参数需要以 @i18n@ 开头。<br>- 在 i18n_resources 中为该参数赋值时，无需设置 **来自** 前缀，审批中心默认会拼接 **来自** 前缀。<br>**示例值**："@i18n@3"
biz_type | string | 否 | 审批定义业务类别，自定义设置。<br>**示例值**："permission"
create_link_mobile | string | 否 | 移动端发起三方审批的链接。<br>- 如果设置了该链接，则在移动端发起审批时，会跳转到该链接对应的三方审批发起页。<br>- 如果不设置该链接，则在移动端不显示该审批。<br>**示例值**："https://applink.feishu.cn/client/mini_program/open?appId=cli_9c90fc38e07a9101&path=pages/approval-form/index?id=9999"
create_link_pc | string | 否 | PC端发起三方审批的链接。<br>- 如果设置了该链接，则在 PC 端发起审批时，会跳转到该链接对应的三方审批发起页。<br>- 如果不设置该链接，则在 PC 端不显示该审批。<br>**示例值**："https://applink.feishu.cn/client/mini_program/open?mode=appCenter&appId=cli_9c90fc38e07a9101&path=pc/pages/create-form/index?id=9999"
support_pc | boolean | 否 | 审批定义是否要在 PC 端的发起审批页面展示，如果为 true 则展示，否则不展示，默认为false。<br>**注意**：support_pc 和 support_mobile 不可都为 false。<br>**示例值**：true
support_mobile | boolean | 否 | 审批定义是否要在移动端的发起审批页面展示，如果为 true 则展示，否则不展示，默认为false。<br>**注意**：support_pc 和 support_mobile 不可都为 false。<br>**示例值**：true
support_batch_read | boolean | 否 | 是否支持批量已读，默认为false<br>**示例值**：true
enable_mark_readed | boolean | 否 | 是否支持标注可读<br>**注意**：该字段无效，暂不支持使用。<br>**示例值**：true
enable_quick_operate | boolean | 否 | 是否支持快速操作<br>**注意**：该字段无效，暂不支持使用。<br>**示例值**：true
action_callback_url | string | 否 | 三方系统的操作回调 URL，**待审批** 实例的任务审批人点击同意或拒绝操作后，审批中心调用该 URL 通知三方系统，回调地址相关信息可参见[三方审批快捷审批回调](https://open.feishu.cn/document/ukTMukTMukTM/ukjNyYjL5YjM24SO2IjN/quick-approval-callback)。<br>**示例值**："http://www.feishu.cn/approval/openapi/instanceOperate"
action_callback_token | string | 否 | 回调时带的 token，用于业务系统验证请求来自审批中心。<br>**示例值**："sdjkljkx9lsadf110"
action_callback_key | string | 否 | 请求参数加密密钥。如果配置了该参数，则会对请求参数进行加密，接收请求后需要对请求进行解密。加解密算法参考[关联外部选项说明](https://open.feishu.cn/document/ukTMukTMukTM/uADM4QjLwADO04CMwgDN)。<br>**示例值**："gfdqedvsadfgfsd"
allow_batch_operate | boolean | 否 | 是否支持批量审批。取值为 true 时，审批人在处理该定义下的审批任务时可以批量处理多个任务， 默认为false。<br>**示例值**：true
exclude_efficiency_statistics | boolean | 否 | 审批流程数据是否不纳入效率统计，默认为false<br>**示例值**：true
viewers | approval_create_viewers\[\] | 否 | 审批可见人列表，列表长度上限 200，只有在审批可见人列表内的用户，才可以在审批发起页看到该审批。若该参数不传值，则表示任何人不可见。
viewer_type | string | 否 | 可见人类型，生效优先级NONE>TENANT>指定范围<br>**示例值**："USER"<br>**可选值有**：<br>- TENANT：租户内可见<br>- DEPARTMENT：指定部门<br>- USER：指定用户<br>- NONE：任何人都不可见
viewer_user_id | string | 否 | 当 viewer_type 取值为 USER 时，需指定用户 ID。ID 类型与查询参数 user_id_type 取值保持一致。<br>**示例值**："19a294c2"
viewer_department_id | string | 否 | 当 viewer_type 取值为 DEPARTMENT 时，需指定部门 ID。ID 类型与查询参数 department_id_type 取值保持一致。<br>**示例值**："od-ac9d697abfa990b715dcc33d58a62a9d"
i18n_resources | i18n_resource\[\] | 否 | 国际化文案
locale | string | 是 | 语言。<br>**示例值**："zh-CN"<br>**可选值有**：<br>- zh-CN：中文<br>- en-US：英文<br>- ja-JP：日文<br>- zh-HK：繁体中文（中国香港）<br>- zh-TW：繁体中文（中国台湾）<br>- de-DE：德语<br>- es-ES：西班牙语<br>- fr-FR：法语<br>- id-ID：印度尼西亚语<br>- it-IT：意大利语<br>- ko-KR：韩语<br>- pt-BR：葡萄牙语<br>- th-TH：泰语<br>- vi-VN：越南语<br>- ms-MY：马来语<br>- ru-RU：俄语
texts | i18n_resource_text\[\] | 是 | 文案的 Key:Value。Key 需要以 @i18n@ 开头，并按照各个参数的要求传入 Value。<br>**说明**：该字段主要用于适配国际化，允许同时设置多个语言的文案，审批中心会根据实际用户当前的语音环境使用匹配的文案。如果没有设置用户当前的语音环境文案，则会使用默认的语言文案。<br>**示例值**：{ "@i18n@1": "权限申请", "@i18n@2": "OA审批", "@i18n@3": "Permission" }
key | string | 是 | 文案 Key，需要和各个参数 Key 相匹配。<br>**示例值**："@i18n@2"
value | string | 是 | 文案 Value，即文案 Key 对应的参数值。<br>**示例值**："people"
is_default | boolean | 是 | 是否为默认语言。默认语言需要包含所有所需的文案 Key，非默认语言如果 Key 不存在，则会使用默认语言代替。<br>**示例值**：true
managers | string\[\] | 否 | 设置审批流程管理员的用户 ID，最多支持设置 200 个。ID 类型与查询参数 user_id_type 取值一致。<br>**示例值**：["19a294c2"]

### 请求体示例
```json
{
    "approval_name": "@i18n@d937443c-686f-11f0-aa8c-b6e035aec42e",
    "approval_code": "F46EB460-9476-4789-9524-ECD564291234",
    "group_code": "work_group",
    "group_name": "@i18n@d937444f-686f-11f0-aa8c-b6e035aec42e",
    "external": {
        "create_link_pc": "https://applink.feishu.cn/client/mini_program/open?mode=appCenter&appId=cli_9c90fc38e07a9101&path=pc%2Fpages%2Fcreate-form%2Findex%3Fid%3D9999",
        "create_link_mobile": "https://applink.feishu.cn/client/mini_program/open?appId=cli_9c90fc38e07a9101&path=pages%2Fapproval-form%2Findex%3Fid%3D9999",
        "support_pc": true,
        "support_mobile": true,
        "support_batch_read": false,
        "action_callback_url":"http://feishu.cn/approval/openapi/operate",
        "action_callback_token":"sdjkljkx9lxxxxx",
        "action_callback_key":"gfdqedvsadxxxxx",
        "enable_mark_readed": false
    },
    "i18n_resources":[
     {
        "locale":"zh-CN",
        "is_default":true,
         "texts":[
             {
             "key": "@i18n@d937443c-686f-11f0-aa8c-b6e035aec42e",
             "value":"people"  
            },
            {
             "key": "@i18n@d937444f-686f-11f0-aa8c-b6e035aec42e",
             "value":"hr"  
            }
         ]
      }
    ],
    "viewers": [
        {
            "viewer_type": "TENANT"
        }
    ],
    "managers":["96449fb3"]
}
```

## 响应

### 响应体

名称 | 类型 | 描述
---|---|---
code | int | 错误码，非 0 表示失败
msg | string | 错误描述
data | \- | \-
approval_code | string | 审批定义 Code。<br>**注意**：在传入已存在的审批定义 Code 进行更新操作的场景中，该参数返回的 Code 可能与传入的 Code 不同。如果不同，请继续使用你传入的 Code，而不是该参数返回的 Code。

### 响应体示例
```json
{
    "code": 0,
    "msg": "success",
    "data": {
        "approval_code": "C30381C8-7A5F-4717-A9CF-C233BF0202D4"
    }
}
```

### 错误码

HTTP状态码 | 错误码 | 描述 | 排查建议
---|---|---|---
400 | 1390001 | param is invalid | 参数错误。排查方案：<br>- 根据接口文档的参数说明，检查请求时传入的参数是否正确。<br>- 如果传入的有表单参数（form），则需要检查该参数内传入的表单控件数据是否正确。如果报错信息内包含控件 ID（如 `控件= widget17261088448220001`），可以调用[查看指定审批定义](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/approval/get)或者[获取单个审批实例详情](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/get)接口，获取响应参数 form 值，检索有问题的控件 ID，然后检查该控件的配置是否正确。
400 | 1395001 | There have been some errors. Please try again later | 服务出现错误。排查方案：<br>1. 参考接口文档的参数说明，检查请求时传入的参数是否正确。如果传入的有表单参数（form），则需要检查传入的表单控件数据是否正确。<br>2. 降低请求频率，并重试。如果重试仍然报错，请联系[技术支持](https://applink.feishu.cn/TLJpeNdW)。

更多错误码信息，参见[通用错误码](https://open.feishu.cn/document/ukTMukTMukTM/ugjM14COyUjL4ITN)。
