# 按钮

Source URL: https://open.feishu.cn/document/feishu-cards/card-components/interactive-components/button
Updated: 2025-01-02

# 按钮组件

按钮组件是一种交互组件，支持多种样式和尺寸，并支持添加图标作为前缀图标。本文档介绍按钮组件的 JSON 结构和相关属性。

本文档介绍按钮组件的 JSON 1.0 结构，要查看新版 JSON 2.0 结构，参考[按钮](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/interactive-components/button)。

## 注意事项

- 在[卡片 JSON 1.0 结构](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-structure)中，若按钮组件直接位于卡片根节点，而非嵌套在其它组件中，你需将其 JSON 数据配置在[交互模块](https://open.feishu.cn/document/ukTMukTMukTM/uYzM3QjL2MzN04iNzcDN/component-list/common-components-and-elements)（`"tag": "action"`）的 `actions` 字段中使用。

- [卡片 JSON 2.0 结构](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-structure)已不支持[交互模块](https://open.feishu.cn/document/ukTMukTMukTM/uYzM3QjL2MzN04iNzcDN/component-list/common-components-and-elements)（`"tag": "action"`）相关属性。你可直接将按钮放置于 `elements` 中，并配置合适的[组件间距 (vertical_spacing 和 horizontal_spacing)](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-breaking-changes-release-notes#a967672) 使用。
## 嵌套规则

按钮组件支持嵌套在分栏、表单容器、折叠面板、循环容器中使用。

## 组件属性

### JSON 结构

以下为一个按钮的卡片 JSON 数据：

```json
{
  "tag": "button", // 组件的标签。按钮组件的固定值为 button。
  "type": "primary", // 按钮的类型。默认为 default。
  "size": "small", // 按钮的尺寸。默认值 medium。
  "width": "default", // 按钮的宽度。默认为 default。
  "text": {
    // 按钮上的文本。
    "tag": "plain_text",
    "content": "确定"
  },
  "icon": {
    // 前缀图标。
    "tag": "standard_icon", // 图标类型。
    "token": "chat-forbidden_outlined", // 图标的 token。仅在 tag 为 standard_icon 时生效。
    "color": "orange", // 图标颜色。仅在 tag 为 standard_icon 时生效。
    "img_key": "img_v2_38811724" // 图片的 key。仅在 tag 为 custom_icon 时生效。
  },
  "hover_tips": {}, // 用户在 PC 端将光标悬浮在按钮上方时的文案提醒。默认为空。
  "disabled": false, // 是否禁用该按钮。默认值 false。
  "disabled_tips": {}, // 禁用按钮后，用户在 PC 端将光标悬浮在按钮上方时的文案提醒。此字段生效后，hover_tips 不再生效。
  "confirm": {
    // 二次确认弹窗配置
    "title": {
      "tag": "plain_text",
      "content": "title"
    },
    "text": {
      "tag": "plain_text",
      "content": "content"
    }
  },
  "behaviors": [
    {
      "type": "open_url", // 声明交互类型是打开链接的跳转交互
      "default_url": "https://www.baidu.com", // 兜底跳转地址
      "android_url": "https://developer.android.com/", // 安卓端跳转地址
      "ios_url": "lark://msgcard/unsupported_action", // iOS 端跳转地址。
      "pc_url": "https://www.windows.com" // 桌面端跳转地址
    },
    {
      "type": "callback", // 声明交互类型是回传数据到服务端的回传交互。
      "value": {
        // 回传交互数据。支持 string 或 object 数据类型。
        "key": "value"
      }
    },
    {
      "type": "form_action", // 声明交互类型为表单事件。
      "behavior": "submit" // 声明表单事件类型。默认为 submit。
    }
  ],
  // 历史属性
  "url": "https://open.feishu.cn",
  "multi_url": {
    "android_url": "https://open.feishu.cn",
    "ios_url": "https://open.feishu.cn",
    "pc_url": "https://open.feishu.cn"
  },
  "value": {
    "key_1": "value_1"
  }
}
```

### 字段说明

按钮组件各字段说明如下表所示：

字段名称 | 是否必填 | 类型 | 默认值 | 说明
---|---|---|---|---
tag | 是 | String | / | 组件的标签。按钮组件的固定值为 `button`。
type | 否 | String | default | 按钮的类型。可选值：<br>- default：黑色字体按钮，有边框<br>- primary：蓝色字体按钮，有边框<br>- danger：红色字体按钮，有边框<br>- text：黑色字体按钮，无边框<br>- primary_text：蓝色字体按钮，无边框<br>- danger_text：红色字体按钮，无边框<br>- primary_filled：蓝底白字按钮<br>- danger_filled：红底白字按钮<br>- laser：镭射按钮
size | 否 | String | medium | 按钮的尺寸。可选值：<br>- tiny：超小尺寸，PC 端为 24 px；移动端为 28 px<br>- small：小尺寸，PC 端为 28 px；移动端为 28 px<br>- medium：中尺寸，PC 端为 32 px；移动端为 36 px<br>- large：大尺寸，PC 端为 40 px；移动端为 48 px
width | 否 | String | default | 按钮的宽度。支持以下枚举值：<br>- default：默认宽度<br>- fill：卡片最大支持宽度<br>- [100,∞)px：自定义宽度，如 `120px`。超出卡片宽度时将按最大支持宽度展示
text | 否 | Struct | 空 | 按钮上的文本。
└ tag | 是 | String | plain_text | 文本类型的标签。固定值为 `plain_text`。
└ content | 是 | String | / | 文本的内容，最多支持 100 个字符。
icon | 否 | Object | / | 添加图标作为文本前缀图标。支持自定义或使用图标库中的图标。
└ tag | 否 | String | / | 图标类型的标签。可取值：<br>- `standard_icon`：使用图标库中的图标。<br>- `custom_icon`：使用用自定义图片作为图标。
└ token | 否 | String | / | 图标库中图标的 token。当 `tag` 为 `standard_icon` 时生效。枚举值参见[图标库](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/enumerations-for-icons)。
└ color | 否 | String | / | 图标的颜色。支持设置线性和面性图标（即 token 末尾为 `outlined` 或 `filled` 的图标）的颜色。当 `tag` 为 `standard_icon` 时生效。枚举值参见[颜色枚举值](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/enumerations-for-fields-related-to-color)。
└ img_key | 否 | String | / | 自定义前缀图标的图片 key。当 `tag` 为 `custom_icon` 时生效。<br>图标 key 的获取方式：调用[上传图片](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/image/create)接口，上传用于发送消息的图片，并在返回值中获取图片的 image_key。
hover_tips | 否 | Object | 空 | 用户在 PC 端将光标悬浮在交互容器上方时的文案提醒。默认为空。
└ tag | 是 | String | plain_text | 文本的标签。固定取值为 <code>plain_text</code>。
└ content | 是 | String | 空 | 文本的内容。
disabled | 否 | Boolean | false | 是否禁按钮。可选值：<br>-  true：禁用按钮<br>- false：按钮组件保持可用状态
disabled_tips | 否 | Object | 空 | 禁用按钮后，用户触发交互时的弹窗文案提醒。默认为空，即不弹窗。
└ tag | 是 | String | plain_text | 弹窗标题文本的标签。固定取值为 <code>plain_text</code>。
└ content | 是 | String | 空 | 弹窗标题的内容。
confirm | 否 | Struct | 默认不生效此属性。 | 二次确认弹窗配置。指在用户提交时弹出二次确认弹窗提示；只有用户点击确认后，才提交输入的内容。该字段默认提供了确认和取消按钮，你只需要配置弹窗的标题与内容即可。<br>**注意**：confirm 字段仅在用户点击包含提交属性的按钮时才会触发二次确认弹窗。
└ title | 是 | Struct | / | 二次确认弹窗标题。<br>**注意**：要配置二次弹窗，title 字段必填。否则，历史版本的飞书客户端可能会出现点击按钮无反应的问题。
└ └ tag | 是 | String | plain_text | 二次确认弹窗标题文本的标签。固定取值为 `plain_text`。
└ └ content | 是 | String | / | 二次确认弹窗标题的内容。
└ text | 是 | Struct | / | 二次确认弹窗文本。
└ └ tag | 是 | String | plain_text | 二次确认弹窗文本的标签。固定取值为 `plain_text`。
└ └ content | 是 | String | / | 二次确认弹窗文本的具体内容。
behaviors | 是 | Struct | / | 配置交互类型和具体交互行为。支持同时生效跳转链接和回传交互。详情参考[配置卡片交互](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/configuring-card-interactions)。
以下为支持交互的历史属性。<br>字段名称 | 是否必填 | 类型 | 默认值 | 说明
url | 否 | String | / | 点击按钮后的跳转链接。该字段与 `multi_url` 字段不可同时设置。
multi_url | 否 | Struct | / | 基于 url 元素配置多端跳转链接，详情参见旧版文档[url 元素](https://open.feishu.cn/document/ukTMukTMukTM/uYzM3QjL2MzN04iNzcDN/component-list/common-components-and-elements#09a320b3)。该字段与 `url` 字段不可同时设置。
value | 否 | JSON | / | 该字段用于配置回传交互。当用户点击交互组件后，会将 `value` 的值返回给接收回调数据的服务器。后续你可以通过服务器接收的 `value` 值进行业务处理。<br>该字段值仅支持 key-value 形式的 JSON 结构，且 key 为 String 类型。示例值：<br>```json<br>"value":{<br>"key-1":Object-1,<br>"key-2":Object-2,<br>"key-3":Object-3,<br>······<br>}<br>```
complex_interaction | 否 | Boolean | false | 是否同时生效上述历史字段配置的跳转链接交互和回传交互。默认仅生效跳转链接交互。
内嵌在表单容器中的按钮组件，新增 `name`、`required`、和 `action_type` 属性。详细说明如下表所示。<br>属性名称 | 是否必填 | 类型 | 默认值 | 说明
name | 是 | String | 空 | 表单容器内组件的唯一标识。用于识别用户提交的数据属于哪个组件。<br>**注意**：该字段必填且需在卡片全局内唯一。
required | 否 | Boolean | false | 组件的内容是否必填。当组件内嵌在表单容器中时，该属性生效。可取值：<br>- **true**：必填。当用户点击表单容器的“提交”时，未填写该组件，则前端提示“有必填项未填写”，不会向开发者的服务端发起回传请求。<br>- **false**：选填。当用户点击表单容器的“提交”时，未填写该组件，仍提交表单容器中的数据。
action_type | 是 | String | 空 | 内嵌在表单容器中的按钮的交互类型。枚举值包括：<br>- <code>link</code>：当前按钮仅支持链接跳转</li><br><li><code>request</code>：当前按钮仅支持回传交互</li><br><li><code>multi</code>：当前按钮同时支持链接跳转和回传交互</li><br><li><code>form_submit</code>：将当前按钮与提交事件绑定。用户点击后，将触发表单容器的提交事件，异步提交所有已填写的表单项内容</li><br><li><code>form_reset</code>：将当前按钮与取消提交事件绑定。用户点击后，将触发表单容器的取消提交事件，重置所有表单组件的输入值为初始值</li>

### 回调结构

为按钮组件成功[配置卡片交互](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/configuring-card-interactions)后，用户基于按钮组件进行交互时，你在开发者后台配置的请求地址将会收到回调数据。

- 如果你添加的是新版卡片回传交互回调(`card.action.trigger`)，可参考[卡片回传交互](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-callback-communication)了解回调结构。
- 如果你添加的是旧版卡片回传交互回调(`card.action.trigger_v1`)，可参考[消息卡片回传交互（旧）](https://open.feishu.cn/document/ukTMukTMukTM/uYzM3QjL2MzN04iNzcDN/configuring-card-callbacks/card-callback-structure)了解回调结构。

## 示例代码

以下的 JSON 示例代码可实现如下图所示的按钮效果。

```json
{
  "header": {
    "template": "blue",
    "title": {
      "content": "Buttons",
      "tag": "plain_text"
    }
  },
  "elements": [
    {
      "tag": "column_set",
      "flex_mode": "flow",
      "background_style": "default",
      "columns": [
        {
          "tag": "column",
          "width": "auto",
          "weight": 1,
          "vertical_align": "top",
          "elements": [
            {
              "tag": "button",
              "text": {
                "tag": "plain_text",
                "content": "镭射按钮"
              },
              "behaviors": [
                {
                  "type": "open_url",
                  "default_url": "https://open.feishu.cn/document",
                  "android_url": "https://developer.android.com/",
                  "ios_url": "lark://msgcard/unsupported_action",
                  "pc_url": "https://www.windows.com"
                }
              ],
              "type": "laser",
              "hover_tips": {
                "tag": "plain_text",
                "content": "hover提示"
              },
              "value": {
                "key": "value"
              }
            }
          ]
        },
        {
          "tag": "column",
          "width": "auto",
          "weight": 1,
          "vertical_align": "top",
          "elements": [
            {
              "tag": "button",
              "type": "laser",
              "text": {
                "tag": "plain_text",
                "content": "镭射禁用按钮"
              },
              "disabled": true,
              "disabled_tips": {
                "tag": "plain_text",
                "content": "禁用 hover 提示"
              },
              "behaviors": [
                {
                  "type": "open_url",
                  "default_url": "https://open.feishu.cn/document",
                  "android_url": "https://developer.android.com/",
                  "ios_url": "lark://msgcard/unsupported_action",
                  "pc_url": "https://www.windows.com"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "tag": "column_set",
      "flex_mode": "flow",
      "background_style": "default",
      "columns": [
        {
          "tag": "column",
          "width": "auto",
          "weight": 1,
          "vertical_align": "top",
          "elements": [
            {
              "tag": "button",
              "text": {
                "tag": "plain_text",
                "content": "primary"
              },
              "url": "https://open.feishu.cn/document",
              "type": "primary",
              "hover_tips": {
                "tag": "plain_text",
                "content": "我是 primary button"
              },
              "value": {
                "key": "value"
              }
            }
          ]
        },
        {
          "tag": "column",
          "width": "auto",
          "weight": 1,
          "vertical_align": "top",
          "elements": [
            {
              "tag": "button",
              "type": "default",
              "text": {
                "tag": "plain_text",
                "content": "default"
              },
              "hover_tips": {
                "tag": "plain_text",
                "content": "我是 default 按钮"
              },
              "behaviors": [
                {
                  "type": "open_url",
                  "default_url": "https://open.feishu.cn/document",
                  "android_url": "https://developer.android.com/",
                  "ios_url": "lark://msgcard/unsupported_action",
                  "pc_url": "https://www.windows.com"
                }
              ]
            }
          ]
        },
        {
          "tag": "column",
          "width": "auto",
          "weight": 1,
          "vertical_align": "top",
          "elements": [
            {
              "tag": "button",
              "type": "danger",
              "text": {
                "tag": "plain_text",
                "content": "我是 danger 按钮"
              },
              "hover_tips": {
                "tag": "plain_text",
                "content": "我是 danger 按钮"
              },
              "behaviors": [
                {
                  "type": "open_url",
                  "default_url": "https://open.feishu.cn/document",
                  "android_url": "https://developer.android.com/",
                  "ios_url": "lark://msgcard/unsupported_action",
                  "pc_url": "https://www.windows.com"
                }
              ]
            }
          ]
        },
        {
          "tag": "column",
          "width": "auto",
          "weight": 1,
          "vertical_align": "top",
          "elements": [
            {
              "tag": "button",
              "type": "danger",
              "text": {
                "tag": "plain_text",
                "content": "我是 disabled 按钮"
              },
              "disabled": true,
              "disabled_tips": {
                "tag": "plain_text",
                "content": "我是 disabled 按钮，我被禁用了"
              },
              "behaviors": [
                {
                  "type": "open_url",
                  "default_url": "https://open.feishu.cn/document",
                  "android_url": "https://developer.android.com/",
                  "ios_url": "lark://msgcard/unsupported_action",
                  "pc_url": "https://www.windows.com"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```
