# 配置卡片交互

Source URL: https://open.feishu.cn/document/feishu-cards/configuring-card-interactions
Updated: 2025-06-10

# 卡片 JSON 中配置卡片交互

你可以为支持交互的卡片组件配置自定义的打开链接或请求回调事件。本文档介绍如何基于卡片 JSON 代码，为组件配置打开链接交互或请求回调交互。

## 什么是交互事件

交互事件包括打开链接事件和请求回调事件。除勾选器外，交互类组件默认均拥有交互能力。打开链接和请求回调事件的说明如下所示。

事件 | 描述 | 使用场景 | 支持组件
---|---|---|---
**打开链接** | 点击组件后，跳转至指定的链接。支持为桌面端、安卓端、iOS 端配置不同的链接。支持 [AppLink](https://open.feishu.cn/document/uYjL24iN/ucjN1UjL3YTN14yN2UTN) 协议链接。 | 用户点击组件后，跳转至外部网页或飞书内部某个功能（如工作台、日历）等。 | 分栏、交互容器、和按钮组件
**请求回调** | 卡片内除勾选器外，所有[交互类组件](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/component-json-v2-overview#386de8fa)默认拥有交互能力。用户点击交互组件后，你在开发者后台应用内注册的回调请求地址将会收到[卡片回传交互回调](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-callback-communication)。该回调包含了用户与卡片之间的交互信息。 | - 需要在卡片回调中 **自定义** 回传数据的场景<br>- 使用[交互容器](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/containers/interactive-container)的场景 | 交互容器和[交互类组件](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/component-json-v2-overview#386de8fa)

## 配置打开链接事件

分栏、交互容器、和按钮组件支持配置打开链接事件。

### 示例效果

如下图，[卡片交互机器人教程](https://open.feishu.cn/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/develop-a-card-interactive-bot/introduction)中的欢迎卡片中，**查看教程** 按钮配置了如下的 [AppLink](https://open.feishu.cn/document/uYjL24iN/ucjN1UjL3YTN14yN2UTN) 链接，可实现在飞书客户端内跳转至网页的效果。
```
https://applink.feishu.cn/client/web_url/open?mode=sidebar-semi&max_width=800&reload=false&url=https%3A%2F%2Fopen.feishu.cn%2Fdocument%2FuAjLw4CM%2FuMzNwEjLzcDMx4yM3ATM%2Fdevelop-a-card-interactive-bot%2Fintroduction
```

### 代码示例

要在卡片 JSON 代码中配置打开链接交互事件，你需将 `behaviors` 字段下的 `type` 字段定义为 `open_url`，再参考以下说明配置相关字段。
```json
{
    "behaviors": [
        {
            "type": "open_url", // 声明交互类型是打开链接的交互。
            "default_url": "https://applink.feishu.cn/client/web_url/open?mode=sidebar-semi&max_width=800&reload=false&url=https%3A%2F%2Fopen.feishu.cn%2Fdocument%2FuAjLw4CM%2FuMzNwEjLzcDMx4yM3ATM%2Fdevelop-a-card-interactive-bot%2Fintroduction", // 兜底的跳转地址。
            "android_url": "https://applink.feishu.cn/client/web_url/open?mode=sidebar-semi&max_width=800&reload=false&url=https%3A%2F%2Fopen.feishu.cn%2Fdocument%2FuAjLw4CM%2FuMzNwEjLzcDMx4yM3ATM%2Fdevelop-a-card-interactive-bot%2Fintroduction", // 安卓端跳转地址。可配置为 `lark://msgcard/unsupported_action` 声明当前端不允许跳转。
            "ios_url": "lark://msgcard/unsupported_action", // iOS 端跳转地址。可配置为 `lark://msgcard/unsupported_action` 声明当前端不允许跳转。
            "pc_url": "https://applink.feishu.cn/client/web_url/open?mode=sidebar-semi&max_width=800&reload=false&url=https%3A%2F%2Fopen.feishu.cn%2Fdocument%2FuAjLw4CM%2FuMzNwEjLzcDMx4yM3ATM%2Fdevelop-a-card-interactive-bot%2Fintroduction" // 桌面端跳转地址。可配置为 `lark://msgcard/unsupported_action` 声明当前端不允许跳转。
        }
    ]
}
```

### 字段说明

字段名称 | 是否必填 | 类型 | 默认值 | 说明
---|---|---|---|---
type | 是 | String | 空 | 声明交互类型。要配置跳转链接交互，取固定值 `open_url`。
default_url | 是 | String | 空 | 兜底跳转地址。
android_url | 否 | String | 空 | Android 端的链接地址。可配置为 `lark://msgcard/unsupported_action` 声明当前端不允许跳转。
ios_url | 否 | String | 空 | iOS 端的链接地址。可配置为 `lark://msgcard/unsupported_action` 声明当前端不允许跳转。
pc_url | 否 | String | 空 | PC 端的链接地址。可配置为 `lark://msgcard/unsupported_action` 声明当前端不允许跳转。

## 配置请求回调事件

交互容器和交互类组件支持配置开发者自定义的请求回调事件。卡片内所有[交互类组件](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/component-json-v2-overview#386de8fa)默认拥有交互能力，用户点击该类组件时，将直接触发回调并返回交互数据。你也可进一步创建自定义的请求回调事件。
推荐你体验[开发一个卡片交互机器人](https://open.feishu.cn/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/develop-a-card-interactive-bot/introduction)教程，了解实现卡片交互全过程及代码示例。

### 注意事项
- 请求回调交互仅适用于通过应用发送的飞书卡片。如果飞书卡片绑定自定义机器人用于发送，则不支持请求回调交互。
- 卡片内交互组件之间相互独立，即用户操作任一组件，都会立即完成一次交互。但如果交互组件位于表单容器中，只有用户点击表单容器的提交按钮时，才会触发交互。
### 使用限制

- 对于[卡片 JSON 1.0 结构](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-structure)：
    - 对于已发送的卡片，其请求回调交互的有效期为 30 天。超过有效期后，已发送的卡片不再支持提交数据到开发者服务端的请求回调交互。用户点击后将提示 **该卡片发送时间已超过 30 天，无法进行互动**。
    - 对于已发送的卡片，其可更新的的有效期为 14 天。如果用户在卡片发出后第 14-30 天交互卡片且交互回调动作为更新卡片，那么更新动作将不会生效。
- 对于[卡片 JSON 2.0 结构](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-structure)，卡片请求回调交互和可更新时间统一为 14 天。

### 示例效果

如下图，[卡片交互机器人教程](https://open.feishu.cn/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/develop-a-card-interactive-bot/introduction)中的告警卡片中，**处理完成** 按钮配置了请求回调交事件，当用户点击 **处理完成** 按钮时，飞书会向你的服务端发送包含以下回传参数的回调。你需要在服务端内，接收该请求并根据请求数据做业务处理，及时对用户行为做作出响应。基于该教程的响应处理可参考[示例代码解释](https://open.feishu.cn/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/develop-a-card-interactive-bot/explanation-of-example-code)。

### 代码示例

要在卡片 JSON 代码中配置自定义的请求回调交互事件，你需在组件 JSON 中添加 `behaviors` 字段，并将 `behaviors` 字段下的 `type` 字段定义为 `callback`，再参考以下说明配置相关字段。

字段名称 | 是否必填 | 类型 | 默认值 | 说明
---|---|---|---|---
type | 是 | String | 空 | 声明交互类型。要配置服务端回传交互，取固定值 `callback`。
value | 是 | Object | 空 | 你可在交互事件中自定义回传数据，支持 object 数据类型。

[卡片交互机器人教程](https://open.feishu.cn/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/develop-a-card-interactive-bot/introduction)中的告警卡片中，为 **处理完成** 按钮配置的请求回调交互事件如下代码所示：
```json
{
    "behaviors": [
        { // 声明交互类型是回传数据到服务端的请求回调交互。
            "type": "callback",
            "value": {
                // 回传交互数据。支持 object 数据类型。开放平台 SDK 仅支持 object 类型的回传交互数据。
                "action": "complete_alarm", // 自定义的请求回调交互参数。
            }
        }
    ]
}
```

### 卡片回调示例

如下示例所示，当用户点击 **处理完成** 按钮时，飞书会向你的服务端发送包含以上回传参数的回调。
```json
{
    "schema": "2.0",
    "event_id": "4c2c25fa752031300e8033abcef",
    "token": "c-9f2e02050b963e5dee6017abcef",
    "create_time": "1749108924412abcef",
    "event_type": "card.action.trigger",
    "tenant_key": "1709bd6ae59e1abcef",
    "app_id": "cli_a8cbfb77cfe21abcef",
    "operator": {
        "tenant_key": "1709bd6ae59e1abcef",
        "open_id": "ou_f0584943e6128abcef",
        "union_id": "on_1ceb9cb3b978eabcef"
    },
    "action": {
        "value": { // behaviors 中自定义的请求回调参数。
            "action": "complete_alarm"
        },
        "tag": "button", // 当用户点击“处理完成”按钮时，回调中将默认包含该按钮数据。
        "timezone": "Asia/Shanghai",
        "form_value": { // 当用户提交表单时，回调中将默认包含表单中的数据。
            "notes_input": "" // 表单容器内输入框的数据，包含表单项标识（name 参数对应的值，由开发者自定义）和 终端用户传入的值（value 参数对应的值）。
        },
        "name": "Button_m6vy7xom" // 用户操作的交互组件的名称。当用户点击表单容器中的按钮组件时，回调中将默认返回该数据。`Button_m6vy7xom` 为表单容器内按钮的 name（表单项标识，由开发者自定义）。
    },
    "host": "im_message",
    "context": {
        "open_message_id": "om_x100b4b20c5529abcef",
        "open_chat_id": "oc_6f2b48554b615abcef"
    }
}
```

### 后续操作

基于卡片 JSON 代码为组件创建请求回调事件后，你还需在本地服务端接收回调，在 3 秒内以 HTTP 200 状态码响应该请求（未及时响应，用户客户端将展示请求错误），并根据业务场景，选择不同的响应方式。具体步骤可参考[处理卡片回调](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/handle-card-callbacks)。
