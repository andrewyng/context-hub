# 处理卡片回调

Source URL: https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/handle-card-callbacks
Updated: 2025-06-26

# 处理卡片回调

为卡片添加交互组件后，你需在本地服务端接受并响应卡片回调，根据场景需求，实现立即更新卡片、延时更新卡片或不更新卡片等效果。本文档介绍如何订阅、接受并处理回调。

## 前提条件

卡片中已添加了[交互类组件](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/component-json-v2-overview#386de8fa)。如果卡片内添加了交互容器，你需为该容器添加[请求回调交互事件](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/add-interactive-events)。

## 操作步骤

本小节介绍订阅、接收并处理卡片回调的具体步骤。

### 步骤一：设置订阅回调方式

在[开发者后台](https://open.feishu.cn/app)，根据需求选择 **使用长连接接收回调** 或 **将回调发送至开发者服务器**。

**注意事项**：-   **使用长连接接收回调** 方式是飞书 SDK 内提供的能力，你可以通过集成飞书 SDK 与开放平台建立一条 WebSocket 全双工通道（你的服务器需要能够访问公网）。后续当应用订阅的回调发生时，开放平台会通过该通道向你的服务器发送消息。详情参考[使用长连接接收回调](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/event-subscription-guide/callback-subscription/configure-callback-request-address)。

- **将回调发送至开发者服务器** 方式是传统的 Webhook 模式，该方式需要你提供用于接收回调消息的服务器公网地址。后续当应用订阅的回调发生时，开放平台会向服务器的公网地址发送 HTTP POST 请求，请求内包含回调数据。详情参考[将回调发送至开发者服务器](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/send-callbacks-to-developers-server)。

### 步骤二：在开发者后台订阅卡片回调

参考[添加回调](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/event-subscription-guide/callback-subscription/add-callback)添加卡片回传交互回调。建议添加新版[卡片回传交互回调](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-callback-communication)(`card.action.trigger`)。

添加卡片回调后，当用户在卡片内操作交互组件时，发送卡片消息的应用会向配置的回调请求地址发送 HTTP POST 请求，请求体包含了 **卡片回传交互** 回调数据。具体情况如下所示：

| **添加回调方式** | **应用发送请求方式** |
|------|----------|----------|
| 只添加**新版**卡片回传交互(`card.action.trigger`)回调 | 1 个包含[新版回调结构](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-callback-communication)的请求 | 
| 只添加**旧版**卡片回传交互(`card.action.trigger_v1`)回调 | 1 个包含[旧版回调结构](https://open.feishu.cn/document/ukTMukTMukTM/uYzM3QjL2MzN04iNzcDN/configuring-card-callbacks/card-callback-structure)的请求 | 参考了解回调结构 |
| 同时添加**新版和旧版**卡片回传交互回调 | 2 个请求，分别包含[新版](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-callback-communication)和[旧版](https://open.feishu.cn/document/ukTMukTMukTM/uYzM3QjL2MzN04iNzcDN/configuring-card-callbacks/card-callback-structure)回调结构。此时，响应其中任一回调即为成功响应，建议你删除多余的请求方式 |
| 在机器人页面配置过历史版本的消息卡片请求地址（如下图），并同时添加新版卡片回传交互(`card.action.trigger`)回调<br> | 2 个请求，分别包含[新版](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-callback-communication)和[旧版](https://open.feishu.cn/document/ukTMukTMukTM/uYzM3QjL2MzN04iNzcDN/configuring-card-callbacks/card-callback-structure)回调结构。此时，响应其中任一回调即为成功响应，建议你删除多余的请求方式  |
| 在机器人页面配置过历史版本的消息卡片请求地址（如上图），并同时添加**旧版**卡片回传交互回调 | 1 个包含[旧版回调结构](https://open.feishu.cn/document/ukTMukTMukTM/uYzM3QjL2MzN04iNzcDN/configuring-card-callbacks/card-callback-structure)的请求
| 在机器人页面配置过历史版本的消息卡片请求地址（如上图），并同时添加**新版和旧版**卡片回传交互回调| 2 个请求，分别包含[新版](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-callback-communication)和[旧版](https://open.feishu.cn/document/ukTMukTMukTM/uYzM3QjL2MzN04iNzcDN/configuring-card-callbacks/card-callback-structure)回调结构。此时，响应其中任一回调即为成功响应，建议你删除多余的请求方式  |

### 步骤三：在本地服务端处理回调（基于回调更新卡片）

你的服务端接收到卡片回传交互的回调请求后，需要在 3 秒内以 HTTP 200 状态码响应该请求（未及时响应，用户客户端将展示请求错误），并做进一步的业务处理。在响应回调请求时，你可以根据不同的业务场景，选择不同的响应方式。不同响应方式的说明与配置如下所述。
<md-alert type="tip">
你可参考[接收并处理回调](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/event-subscription-guide/callback-subscription/receive-and-handle-callbacks)对回调进行安全校验和解密，之后再响应该回调。

#### 注意事项

- 对于已发送的卡片，其请求回调交互的有效期为 30 天。超过有效期后，已发送的卡片不再支持提交数据到开发者服务端的请求回调交互。用户点击后将提示 **该卡片发送时间已超过 30 天，无法进行互动**。

- 对于已发送的卡片，其可更新的的有效期为 14 天。如果用户在卡片发出后第 14-30 天交互卡片且交互回调动作为更新卡片，那么更新动作将不会生效。
- 业务服务端不可使用重定向状态码（`HTTP 3xx`）来响应卡片的回调请求，否则用户端将会出现交互请求错误。

#### **方式一：3 秒内立即更新卡片**

服务端在收到卡片的回调请求后，需要在 3 秒内以 `HTTP 200` 状态码响应该请求，响应体的 `data` 字符串中应包含更新后的卡片内容。新版卡片回传交互回调（`card.action.trigger`）的响应体示例结构如下所示，详情参考[卡片回传交互](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-callback-communication)。

你也可参考[消息卡片回传交互（旧）](https://open.feishu.cn/document/ukTMukTMukTM/uYzM3QjL2MzN04iNzcDN/configuring-card-callbacks/card-callback-structure)了解旧版卡片回传交互回调响应体结构。

```json
{
  "toast": { // toast 结构体，用于回显操作状态的提示信息。
    "type": "info", // toast 类型。取值：info（仅提示，不展示状态图标）、success（成功提示）、error（失败提示）、warning（警告提示）。
    "content": "卡片交互成功", // 提示内容。
    "i18n": {
      "zh_cn": "卡片交互成功",
      "en_us": "card action success"
    }
  },
  "card": { // template 类型卡片配置。两种类型二选一。
    "type": "template", // 卡片类型。可选值：template（卡片模板）、raw（卡片 JSON）。
    "data": {
      "template_id": "xxxxxxxxxxxx", // 卡片 ID，参数必填。可在搭建工具中通过复制卡片 ID 获取。
      "template_version_name": "1.0.0", // 卡片版本，选填。可指定请求发送某个固定版本号的卡片，避免在工具上发布卡片后立即影响线上业务逻辑。默认为空，即发布最新版本的卡片。
      "template_variable": {
        "key1": "value1", // 如果卡片模板内设置了变量，则可以在此处为变量名（key）赋值（value）。
        "key2": "value2"
      }
    }
  },
  "card": { // raw 类型卡片配置。两种类型二选一。
    "type": "raw", // 卡片类型。可选值：template（卡片模板）、raw（卡片 JSON）。
    "data": { // raw 类型卡片 JSON 代码。
      "config": {
        "enable_forward": true
      },
      "elements": [
        {
          "tag": "div",
          "text": {
            "content": "This is the plain text",
            "tag": "plain_text"
          }
        }
      ],
      "header": {
        "template": "blue",
        "title": {
          "content": "This is the title",
          "tag": "plain_text"
        }
      }
    }
  }
}
```
#### **方式二：不更新卡片**

如果当前的业务场景不需要更新卡片内容，你可以仅以 `HTTP 200` 状态码响应该请求，返回空值。即仅收集用户的点击操作，而不返回对用户操作的响应。处理逻辑如下：
1. 服务端在收到卡片的回调请求后，在 3 秒内以 `HTTP 200` 状态码响应该请求。
1. 在响应时设置 HTTP body 为 `"{}"` 或返回自定义 Toast 结构体：
    ```json
    {
      "toast": {
        "type": "success",
        "content": "成功了！",
        "i18n": {
          "zh_cn": "成功了！",
          "en_us": "success！",
          "ja_jp": "成功した!"
        }
      }
    }
    ```

#### **方式三：30 分钟内延时更新卡片**

如果当前的业务场景不需要立即更新卡片内容，你需参考以下步骤延时更新卡片：
1. 服务端在收到卡片的回调请求后，在 3 秒内以 `HTTP 200` 状态码响应该请求。
1. 在响应时设置 HTTP body 为 `"{}"` 或返回自定义 Toast 结构体：
    ```json
    {
      "toast": {
        "type": "success",
        "content": "成功了！",
        "i18n": {
          "zh_cn": "成功了！",
          "en_us": "success！",
          "ja_jp": "成功した!"
        }
      }
    }
    ```
1. 确保响应成功后，更新卡片内容：
	- 在消息卡片场景下，调用[延时更新消息卡片](https://open.feishu.cn/document/ukTMukTMukTM/uMDO1YjLzgTN24yM4UjN)接口更新卡片
	- 在链接预览卡片场景下，调用[触发更新链接预览](https://bytedance.larkoffice.com/docx/FGw0dUwZNoXzuTxACNucmoajnR6)接口触发客户端重新获取卡片内容。具体参考对应接口文档。
 **注意事项**：- 此步骤必须在响应回调请求之后执行，并行执行或提前执行会出现更新失败的情况。
 - [延时更新消息卡片](https://open.feishu.cn/document/ukTMukTMukTM/uMDO1YjLzgTN24yM4UjN)的 `token` 有效期为 30 分钟，超过有效期则 `token` 失效，无法再对本次用户交互操作更新卡片；且同一个 `token` 最多支持更新两次卡片。

## 错误码说明

在飞书客户端（ 7.28 及以上版本）进行卡片交互时，若交互出错，将返回如下图对应的错误码。错误码说明及解决方案请参考[卡片回传交互-错误码](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-callback-communication#c98c3220)。

## 常见问题

### 回调请求失败或立即更新操作超时，客户端会提示操作失败或网络超时，该场景下卡片不刷新如何处理？

你可参考以下排查方案解决该问题：

- 是否配置了消息卡片请求网址。
- 是否在 3 秒内以 `HTTP 200` 状态码响应了卡片点击事件。

### 如果卡片的更新时机不由消息卡片的交互组件触发（例如，审批操作在企业自建审批系统内完成，而不是在消息卡片内完成，卡片仅用于同步审批结果）如何处理？

你可以调用[更新应用发送的消息卡片](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/patch)接口，请求更新卡片。

### 是否支持卡片维度的回调订阅和配置？

不支持。卡片需要通过应用接受并处理回调，不支持卡片维度设置回调的请求地址。
