# 更新审批 Bot 消息

Source URL: https://open.feishu.cn/document/server-docs/approval-v4/message/update-bot-messages
Updated: 2025-04-21

# 更新审批 Bot 消息

调用[发送审批 Bot 消息](https://open.feishu.cn/document/ukTMukTMukTM/ugDNyYjL4QjM24CO0IjN)接口后，可根据审批 Bot 消息 ID 及审批相应的状态，更新审批 Bot 消息。例如，给审批人推送了审批待办消息，当审批人通过审批后，可以将之前推送的 Bot 消息更新为已审批。

## 使用限制

- 只能更新审批状态，以及审批同意或拒绝后的标题或者查看详情的文案。

- 只能更新模板为 1008「收到审批待办」的卡片。

- 只支持更新 30 天以内的审批 bot 消息。

## 请求

基本 | &nbsp;
---|---
HTTP URL | https://open.feishu.cn/open-apis/approval/v1/message/update
HTTP Method | POST
支持的应用类型 | 自建应用、商店应用
权限要求<br>**调用该 API 所需的权限。开启其中任意一项权限即可调用** | 访问审批应用(approval:approval:readonly)

### 请求头

名称 | 类型 | 必填 | 描述
---|---|---|---
Authorization | string | 是 | `tenant_access_token`<br>以应用身份调用 API，可读写的数据范围由应用自身的 [数据权限范围](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/configure-app-data-permissions) 决定。参考 [自建应用获取 tenant_access_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token_internal) 或 [商店应用获取 tenant_access_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token)。<br>**值格式**："Bearer `access_token`"<br>**示例值**："Bearer t-7f1bcd13fc57d46bac21793a181234"
Content-Type | string | 是 | **固定值**："application/json; charset=utf-8"

### 请求体

参数 | 类型 | 必须 | 说明
---|---|---|---
message_id | String | 是 | 待更新的审批 Bot 消息 ID。调用[发送审批 Bot 消息](https://open.feishu.cn/document/ukTMukTMukTM/ugDNyYjL4QjM24CO0IjN)接口后，从返回结果中获取消息 ID。
status | string | 是 | 状态类型，用于更新消息内第一个 `action` 的文字内容。可选值有：<br>- APPROVED：已同意<br>- REJECTED：已拒绝<br>- CANCELLED：已撤回<br>- FORWARDED：已转交<br>- ROLLBACK：已回退<br>- ADD：已加签<br>- DELETED：已删除<br>- PROCESSED：已处理<br>- CUSTOM：自定义按钮状态
status_name | String | 否 | 当 status 取值 CUSTOM 时，可以自定义审批同意或拒绝后 title 内容。<br>**注意**:<br>- 这里传入的是国际化文案 Key（即 i18n_resources.texts 参数中的 Key），还需要在 i18n_resources.texts 参数中以 Key：Value 格式进行赋值。<br>- Key 需要以 `@i18n@` 开头。<br>**示例值**：@i18n@1
detail_action_name | String | 否 | 当 status 取值 CUSTOM 时，可以自定义审批同意或拒绝后 **查看详情** 按钮名称。<br>**注意**:<br>- 这里传入的是国际化文案 Key（即 i18n_resources.texts 参数中的 Key），还需要在 i18n_resources.texts 参数中以 Key：Value 格式进行赋值。<br>- Key 需要以 `@i18n@` 开头。<br>**示例值**：@i18n@2
i18n_resources | list | 是 | 国际化文案。status_name、detail_action_name 参数设置了国际化文案 Key 后，需要通过 i18n_resources 设置 Key：value 关系为参数赋值。<br>例如，status_name取值为 @i18n@1，则需要在 i18n_resources.texts 中传入 `@i18n@1： 已废弃` 为参数赋值。
locale | string | 是 | 语言。可选值有：<br>- zh-CN：中文<br>- en-US：英文<br>- ja-JP：日文<br>**示例值**：zh-CN
is_default | boolean | 是 | 当前语言是否为默认语言。默认语言需要在 texts 中传入所有的 Key：Value，非默认语言如果缺失 Key，则会使用默认语言代替。<br>**示例值**：true
texts | map | 是 | 文案的 Key:Value。Key 需要以 `@i18n@` 开头，并按照各个参数的要求传入 Value。<br>**示例值**：<br>```<br>{<br>"@i18n@1": "demotext1"，<br>"@i18n@2": "demotext2"<br>}<br>```

### 请求体示例

```json
{
    "message_id":"xxxx",
    "status":"CUSTOM",
    "status_name":"@i18n@1",
    "detail_action_name":"@i18n@2",
    "i18n_resources":[
        {
          "locale": "zh-CN",
          "texts" : {
              "@i18n@1": "已废弃",
              "@i18n@2": "已废弃按钮" 
            },
          "is_default": true
        }
    ]
}
```

## 响应

### 响应体

|参数|类型|说明|
|-|-|-|
|code|int|错误码，非 0 表示失败|
|msg|string|返回码的描述|
|data|map|返回业务信息|
|&emsp;∟message_id|string|消息 ID，用于继续更新审批 Bot 消息|

### 响应体示例

```json
{
    "code":0,
    "msg":"success",
    "data":{
        "message_id": "xxxx"
    }
}
```

### 错误码
具体可参考：[服务端错误码说明](https://open.feishu.cn/document/ukTMukTMukTM/ugjM14COyUjL4ITN)
