# 表单容器

Source URL: https://open.feishu.cn/document/feishu-cards/card-components/containers/form-container
Updated: 2025-04-17

# 表单容器

在使用卡片收集内容时，可能存在需要用户提交多个表单项的场景。表单容器允许用户在前端本地录入一批表单项后，通过点击一次 **提交** 按钮，将这一批本地缓存的表单内容一次回调至开发者的服务端，实现异步提交多个表单项数据的效果。

本文档介绍表单容器的 JSON 1.0 结构，要查看新版 JSON 2.0 结构，参考[表单容器](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/containers/form-container)。

## 注意事项

- 表单容器支持飞书 V6.6 及以上版本的客户端。在低于该版本的飞书客户端上，表单容器的内容将展示为“请升级至最新版本客户端，以查看内容”的占位图。
- 容器类组件最多支持嵌套五层组件。建议你避免在表单容器中嵌套多层组件。多层嵌套会压缩内容的展示空间，影响卡片的展示效果。如你希望卡片承接更复杂的表单内容，建议通过卡片链接跳转至 H5 或小程序实现表单能力。

## 嵌套规则

在[卡片 JSON 1.0 结构](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-structure)中：
  - 表单容器不支持内嵌表格（table）、图表（chart）、和表单容器组件。
  - 表单容器中不可直接内嵌[标签为 div 的组件](https://open.feishu.cn/document/ukTMukTMukTM/uYzM3QjL2MzN04iNzcDN/component-list/common-components-and-elements#6bdb3f37)。你可先内嵌分栏组件，再在分栏组件中内嵌标签为 `div` 类型的组件。
- 表单容器组件不可被内嵌在其它组件内，只可放在卡片根节点下。

在[卡片 JSON 2.0 结构](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-structure)中：
- 表单容器不支持内嵌表格（table）和表单容器组件。
- 表单容器组件不可被内嵌在其它组件内，只可放在卡片根节点下。

## 组件属性

本小节介绍表单容器的属性。

### JSON 结构

以下为一个表单容器的卡片 JSON 结构示例，该容器内嵌了一个输入框组件和一个绑定了提交事件的提交按钮：

```json
{
  "tag": "form",    // 表单容器的标签。
  "name": "form_1", // 该表单容器的唯一标识。用于识别用户在交互后，提交的是哪个表单容器的数据。
  "elements": [
    {
      "tag": "input",   // 为表单容器内添加一个输入框组件。
      "name": "reason", // 输入框组件的唯一标识。用于识别用户在交互后，提交的是哪个表单项的数据。在表单容器中所有的交互组件中，该字段必填，否则数据会发送失败。
      "required": true // 是否必填。为 true 时点击按钮后会做必填校验。
    },
    {
      "tag": "button", // 表单容器内的按钮组件。
      "action_type": "form_submit", // 将当前按钮与提交事件绑定。用户点击后，将触发表单容器的提交事件，异步提交所有已填写的表单项内容
      "name": "submit", // 按钮组件的唯一标识，用于识别用户在交互后，点击的是哪个按钮。在表单容器中所有的交互组件中，该字段必填，否则数据会发送失败。
      "text": { // 按钮上的文本。
        "content": "提交",
        "tag": "lark_md"
      },
      "type": "primary", // 按钮的样式类型。
      "confirm":{}  // 配置二次确认弹窗。在表单容器中，仅在用户点击包含提交属性的按钮时才会触发二次确认弹窗。
    }
  ]
}
```

### 字段说明

表单容器各字段说明如下表所示：

字段名称 | 是否必填 | 类型 | 默认值 | 说明
---|---|---|---|---
tag | 是 | String | / | 表单容器的标签。固定值为 `form`。
name | 是 | String | 无 | 表单容器的唯一标识。用于识别用户提交的数据属于哪个表单容器。在同一张卡片内，该字段的值全局唯一。
elements | 是 | Array&lt;element&gt; | [] | 表单容器的子节点。可内嵌其它容器类组件和展示、交互组件，不支持内嵌表格、图表、和表单容器组件。
└ tag | 是 | String | 无 | 表单容器内必须包含的、用于提交表单的按钮组件。固定取值 `button`。
└ action_type | 是 | String | 无 | 用于提交表单的按钮组件的交互类型。固定取值 `form_submit`，表示提交表单。
└ name | 是 | String | 无 | 用于提交表单的按钮组件的唯一标识，用于识别用户在交互后，点击的是哪个按钮。在表单容器中所有的交互组件中，该字段必填，否则数据会发送失败。
└ text | 否 | Struct | 空 | 用于提交表单的按钮上的文本。
└ └ tag | 否 | String | 无 | 文本的标签。固定值为 `lark_md`。
└ └ content | 是 | String | 请输入 | 文本的内容，最多支持 100 个字符。
└ type | 否 | String | default | 按钮的类型。可选值：<br>- **default**：黑色字体按钮，有边框<br>- **primary**：蓝色字体按钮，有边框<br>- **danger**：红色字体按钮，有边框<br>- **text**：黑色字体按钮，无边框<br>- **primary_text**：蓝色字体按钮，无边框<br>- **danger_text**：红色字体按钮，无边框<br>- **primary_filled**：蓝底白字按钮<br>- **danger_filled**：红底白字按钮<br>- **laser**：镭射按钮
confirm | 否 | Struct | 空 | 二次确认弹窗配置。指在用户提交时弹出二次确认弹窗提示；只有用户点击确认后，才提交输入的内容。该字段默认提供了确认和取消按钮，你只需要配置弹窗的标题与内容即可。<br>**注意**：`confirm` 字段仅在用户点击包含提交属性的按钮时才会触发二次确认弹窗。
confirm.title | 是 | Struct | / | 二次确认弹窗标题。
confirm.title.tag | 是 | String | plain_text | 二次确认弹窗标题文本的标签。固定取值为 `plain_text`。
confirm.title.content | 是 | String | / | 二次确认弹窗标题的内容。
confirm.text | 是 | Struct | / | 二次确认弹窗的文本内容。
confirm.text.tag | 是 | String | plain_text | 二次确认弹窗文本的标签。固定取值为 `plain_text`。
confirm.text.content | 是 | String | / | 二次确认弹窗文本的具体内容。

### 扩展字段说明

内嵌在表单容器中的交互组件，新增 `name`、`required`、和 `action_type` 属性。详细说明如下表所示。

属性名称 | 是否必填 | 类型 | 默认值 | 说明
---|---|---|---|---
name | 是 | String | 空 | 表单容器内组件的唯一标识。用于识别用户提交的数据属于哪个组件。<br>**注意**：该字段必填且需在卡片全局内唯一。
required | 否 | Boolean | false | 组件的内容是否必填。当组件内嵌在表单容器中时，该属性生效。可取值：<br>- **true**：必填。当用户点击表单容器的“提交”时，未填写该组件，则前端提示“有必填项未填写”，不会向开发者的服务端发起回传请求。<br>- **false**：选填。当用户点击表单容器的“提交”时，未填写该组件，仍提交表单容器中的数据。
action_type | 是 | String | 空 | 内嵌在表单容器中的按钮的交互类型。枚举值包括：<br>- <code>link</code>：当前按钮仅支持链接跳转</li><br><li><code>request</code>：当前按钮仅支持回传交互</li><br><li><code>multi</code>：当前按钮同时支持链接跳转和回传交互</li><br><li><code>form_submit</code>：将当前按钮与提交事件绑定。用户点击后，将触发表单容器的提交事件，异步提交所有已填写的表单项内容</li><br><li><code>form_reset</code>：将当前按钮与取消提交事件绑定。用户点击后，将触发表单容器的取消提交事件，重置所有表单组件的输入值为初始值</li>

## 回调结构

当用户点击表单容器的提交按钮时，你在开发者后台配置的请求地址将会收到如下所示的回调数据。如果你添加的是新版卡片回传交互回调(`card.action.trigger`)，回调数据的结构如下所示。更多参数说明可参考[卡片回传交互](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-callback-communication)。
  ```json
  {
      "schema": "2.0", // 回调的版本
      "header": { // 回调基本信息
          "event_id": "f7984f25108f8137722bb63c*****", // 回调的唯一标识
          "token": "066zT6pS4QCbgj5Do145GfDbbag*****", // 应用的 Verification Token
          "create_time": "1603977298000000", // 	回调发送的时间，接近回调发生的时间
          "event_type": "card.action.trigger", // 回调类型卡片交互场景中，固定为 "card.action.trigger"
          "tenant_key": "2df73991750*****", // 应用归属的 tenant key，即租户唯一标识
          "app_id": "cli_a5fb0ae6a4******" // 应用的 App ID
      },
      "event": { // 回调的详细信息
          "operator": { // 	回调触发者信息
              "tenant_key": "2df73991750*****", // 回调触发者的 tenant key，即租户唯一标识
              "user_id": "867*****", // 回调触发者的 user ID当应用开启“获取用户 user ID”权限后，该参数返回
              "open_id": "ou_3c14f3a59eaf2825dbe25359f15*****" // 	回调触发者的 Open ID
          },
          "token": "c-295ee57216a5dc9de90fefd0aadb4b1d7d******", // 更新卡片用的凭证，有效期为 30 分钟，最多可更新 2 次
          "action": { // 用户操作交互组件回传的数据
              "value": { // 表单组件中按钮组件绑定的开发者自定义回传数据
                  "key": "value"
              },
              "tag": "button", // 表单组件中按钮组件的标签
              "timezone": "Asia/Shanghai", // 用户当前所在地区的时区。当用户操作日期选择器、时间选择器、或日期时间选择器时返回
              "form_value": { // 表单容器内用户提交的数据。以下为示例数据：
                  "DatePicker_bpqdq5puvn4": "2024-04-01 +0800", // 表单容器内日期选择器组件的 name 和 value。name 即搭建工具中的组件 ID，可自定义
                  "DateTimePicker_ihz2d7a74i": "2024-04-29 07:07 +0800", // 表单容器内日期时间选择器组件的自定义 name 和 value
                  "Input_lf4fmxwfrd9": "1234", // 表单容器内输入框组件的 name 和 value
                  "PersonSelect_2ejys7ype7m": "ou_3c14f3a59eaf2825dbe25359f1595b00", // 表单容器内人员选择-单选组件的 name 和 value
                  "Select_a2d5b7l3zd": "1", // 表单容器内下拉选择-单选组件的 name 和 value
                  "TimePicker_7ecsf6xkqsq": "00:00 +0800" // 表单容器内时间选择器组件的 name 和 value
              },
              "name": "Button_lvkepfu3" // 表单组件中按钮组件的 name
          },
          "host": "im_message", // 卡片展示场景
          "context": { //  卡片展示场景相关信息
              "open_message_id": "om_574d639e4a44e4dd646eaf628e2*****", // 卡片所在的消息 ID
              "open_chat_id": "oc_e4d2605ca917e695f54f11aaf56*****" // 卡片所在的会话 ID
          }
      }
  }
  ```

## 示例代码

以下的 JSON 示例代码可实现如下图所示的卡片效果：

```json
{
    "elements": [
        {
            "tag": "form",
            "name": "Form_lvxmxsxf",
            "elements": [
                {
                    "tag": "column_set",
                    "flex_mode": "stretch",
                    "background_style": "default",
                    "columns": [
                        {
                            "tag": "column",
                            "width": "weighted",
                            "weight": 1,
                            "vertical_align": "top",
                            "elements": [
                                {
                                    "tag": "markdown",
                                    "content": "请选择："
                                }
                            ]
                        },
                        {
                            "tag": "column",
                            "width": "weighted",
                            "weight": 1,
                            "vertical_align": "top",
                            "elements": [
                                {
                                    "tag": "select_static",
                                    "name": "Select_pj6kw7cxyl",
                                    "placeholder": {
                                        "tag": "plain_text",
                                        "content": "这是一个选择菜单"
                                    },
                                    "value": {
                                        "key": "value"
                                    },
                                    "options": [
                                        {
                                            "text": {
                                                "tag": "plain_text",
                                                "content": "选项1"
                                            },
                                            "value": "1"
                                        },
                                        {
                                            "text": {
                                                "tag": "plain_text",
                                                "content": "选项2"
                                            },
                                            "value": "2"
                                        },
                                        {
                                            "text": {
                                                "tag": "plain_text",
                                                "content": "选项3"
                                            },
                                            "value": "3"
                                        },
                                        {
                                            "text": {
                                                "tag": "plain_text",
                                                "content": "选项4"
                                            },
                                            "value": "4"
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    "tag": "input",
                    "name": "Input_fhaty9jktke",
                    "placeholder": {
                        "tag": "plain_text",
                        "content": "请输入"
                    },
                    "max_length": 5,
                    "label": {
                        "tag": "plain_text",
                        "content": "请输入文本："
                    },
                    "label_position": "left",
                    "value": {
                        "k": "v"
                    }
                },
                {
                    "action_type": "form_submit",
                    "name": "Button_e4d9u982x5k",
                    "tag": "button",
                    "text": {
                        "content": "提交",
                        "tag": "lark_md"
                    },
                    "type": "primary",
                    "confirm": {
                        "title": {
                            "tag": "plain_text",
                            "content": "title"
                        },
                        "text": {
                            "tag": "plain_text",
                            "content": "确认提交吗"
                        }
                    }
                }
            ]
        }
    ]
}
```
