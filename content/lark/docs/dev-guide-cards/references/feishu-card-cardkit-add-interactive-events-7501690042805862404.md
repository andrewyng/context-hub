# 添加自定义交互事件

Source URL: https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/add-interactive-events
Updated: 2025-06-10

# 添加自定义交互事件

你可以为支持交互的卡片组件添加自定义的打开链接或请求回调事件。本文档介绍如何在[飞书卡片搭建工具](https://open.feishu.cn/cardkit/editor?from=open_docs)中为组件创建交互事件。

## 什么是交互事件
交互事件包括打开链接事件和请求回调事件。除勾选器外，交互类组件默认均拥有交互能力。开发者也可以在搭建工具中进一步添加自定义的交互事件：

事件 | 描述 | 使用场景 | 支持组件
---|---|---|---
**打开链接** | 点击组件后，跳转至指定的链接。支持为桌面端、安卓端、iOS 端配置不同的链接。支持 [AppLink](https://open.feishu.cn/document/uYjL24iN/ucjN1UjL3YTN14yN2UTN) 协议链接。 | 用户点击组件后，跳转至外部网页或飞书内部某个功能（如工作台、日历）等。 | 分栏、交互容器、和按钮组件
**请求回调** | 卡片内除勾选器外，所有[交互类组件](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/component-json-v2-overview#386de8fa)默认拥有交互能力。用户点击交互组件后，你在开发者后台应用内注册的回调请求地址将会收到[卡片回传交互回调](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-callback-communication)。该回调包含了用户与卡片之间的交互信息。 | - 需要在卡片回调中 **自定义** 回传数据的场景<br>- 使用[交互容器](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/containers/interactive-container)的场景 | 交互容器和[交互类组件](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/component-json-v2-overview#386de8fa)

## 创建打开链接事件

分栏、交互容器、和按钮组件支持配置打开链接事件。

### 示例效果

如下图，在[卡片交互机器人教程](https://open.feishu.cn/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/develop-a-card-interactive-bot/introduction)中的欢迎卡片中，**查看教程** 按钮配置了如下的 [AppLink](https://open.feishu.cn/document/uYjL24iN/ucjN1UjL3YTN14yN2UTN) 链接，可实现在飞书客户端内打开右侧边栏、跳转至网页的效果。

```
https://applink.feishu.cn/client/web_url/open?mode=sidebar-semi&max_width=800&reload=false&url=https%3A%2F%2Fopen.feishu.cn%2Fdocument%2FuAjLw4CM%2FuMzNwEjLzcDMx4yM3ATM%2Fdevelop-a-card-interactive-bot%2Fintroduction
```

| **配置示例**   | **效果示例**   |
| --------- | ------------- |
|  |  |

### 操作步骤

要实现上述示例效果，参考下文在搭建工具中为组件添加打开链接事件。

1. 选中目标组件后，在搭建工具右侧的 **事件** 界面，点击 **创建事件**。

    
1. 选择 **点击时**，并点击 **请选择动作**。

   目前所有交互组件仅支持创建 **点击时** 事件。

    
1. 选择 **打开链接** 动作，并参考下表完成链接配置。

配置项 | 描述
---|---
**链接来源** | - 如果选择 **指定**，则需要手动填写链接地址，飞书支持[AppLink 协议](https://open.feishu.cn/document/uYjL24iN/ucjN1UjL3YTN14yN2UTN)。你可仅配置兜底链接，也支持配置差异化跳转链接。<br>- 如果选择 **绑定变量**，则需要选择指定的 **链接** 变量。变量配置说明，可参见[配置卡片变量](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/configure-card-variables)。
**二次确认弹窗** | 开启后需要配置弹窗的标题与正文文案，当用户点击组件时需要在弹窗内二次确认。<br>

## 创建请求回调事件

交互容器和交互类组件支持配置开发者自定义的请求回调事件。卡片内所有[交互类组件](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/component-json-v2-overview#386de8fa)默认拥有交互能力，用户点击该类组件时，将直接触发回调并返回交互数据。你也可进一步创建自定义的请求回调事件。
推荐你体验[开发一个卡片交互机器人](https://open.feishu.cn/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/develop-a-card-interactive-bot/introduction)教程，了解实现卡片交互全过程及代码示例。

### 注意事项

- 请求回调交互仅适用于通过应用发送的飞书卡片。如果飞书卡片绑定自定义机器人用于发送，则不支持请求回调交互。
- 卡片内交互组件之间相互独立，即用户操作任一组件，都会立即完成一次交互。但如果交互组件位于表单容器中，只有用户点击表单容器的提交按钮时，才会触发交互。

### 使用限制

- 对于已发送的[旧版卡片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/cardkit-upgraded-version-card-release-notes)：
    - 请求回调交互的有效期为 30 天。超过有效期后，已发送的卡片不再支持提交数据到开发者服务端的请求回调交互。用户点击后将提示 **该卡片发送时间已超过 30 天，无法进行互动**。
    - 可更新的的有效期为 14 天。如果用户在卡片发出后第 14-30 天交互卡片且交互回调动作为更新卡片，那么更新动作将不会生效。
- 对于[新版卡片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/cardkit-upgraded-version-card-release-notes)，卡片请求回调交互和可更新时间统一为 14 天。

### 示例效果     

如下图，[卡片交互机器人教程](https://open.feishu.cn/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/develop-a-card-interactive-bot/introduction)中的告警卡片中，**处理完成** 按钮配置了请求回调交事件，当用户点击 **处理完成** 按钮时，飞书会向你的服务端发送包含以下回传参数的回调。你需要在服务端内，接收该请求并根据请求数据做业务处理，及时对用户行为做作出响应。基于该教程的响应处理可参考[示例代码解释](https://open.feishu.cn/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/develop-a-card-interactive-bot/explanation-of-example-code)。

 

### 配置示例

 如下图，[卡片交互机器人教程](https://open.feishu.cn/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/develop-a-card-interactive-bot/introduction)中的告警卡片中，**处理完成** 按钮配置了如下图的自定义请求回调参数：

### 回调示例

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
        "value": { // 开发者在搭建工具中自定义的请求回调参数。
            "action": "complete_alarm",
            "time": "2025/06/05 07: 35: 21 (UTC+8)"
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

### 操作步骤

在飞书卡片搭建工具内，创建请求回调事件的步骤如下所示。

1. 添加交互组件后，在搭建工具右侧的 **事件** 界面，点击 **创建事件**。

    
1. 选择 **点击时**，并点击 **请选择动作**。

    
1. 选择 **请求回调** 动作。
1. 选择参数类型。你需要在 **输入参数** 中设置回传参数。

    - 如果你选择 **字符串** 类型，则需要在 **输入参数** 中输入字符串文本或绑定文本变量。输入的内容将以一整段字符串的形式回传至开发者服务端。
    - 如果你选择 **对象** 类型，输入的内容将以 JSON 结构体的形式回传至开发者服务端。
        - 在 **回传参数** 字段下：
        - 如果选择 **指定**，则需要在 **输入参数** 中输入参数或绑定变量。
        - 如果选择 **绑定变量**，则需要选择 **对象** 变量。推荐参考[卡片交互机器人教程](https://open.feishu.cn/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/develop-a-card-interactive-bot/introduction)了解如何在回传参数中应用变量。
   - **二次确认弹窗**：开启后需要配置弹窗的标题与正文文案，当用户点击组件时需要在弹窗内二次确认。

### 后续操作

在搭建工具中为组件创建请求回调事件后，你还需在本地服务端接收回调，在 3 秒内以 HTTP 200 状态码响应该请求（未及时响应，用户客户端将展示请求错误），并根据业务场景，选择不同的响应方式。具体步骤可参考[处理卡片回调](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/handle-card-callbacks)。
